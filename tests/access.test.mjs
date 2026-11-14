// Checks who may use the bot (worker/access.js) and that the cron messages arrive even when a run breaks off
// (worker/deliver.js): the family by username, the id tied to the username on the first visit, strangers refused
// quietly, old subscriptions sorted out without a word, marks only after Telegram took a message, the next run
// sending to whoever was missed, the run's message budget, and the translation limit under parallel requests.
// Run: node tests/access.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import worker from '../worker/send-scan.js';
import { admit, allowedId, nameHash } from '../worker/access.js';
import { outbox } from '../worker/telegram.js';
import { FAMILY } from '../worker/config.js';
import { hookSecret } from '../worker/brief.js';
import { binsOn, berlinDay } from '../smittia/due.js';
import cal from '../smittia/kalender.json' with { type: 'json' };

const TOKEN = '123456:TEST-not-a-real-token';
function sign(user) {
  const fields = { query_id: 'AAH', user: JSON.stringify(user), auth_date: String(Math.floor(Date.now() / 1000)) };
  const dcs = Object.entries(fields).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  return new URLSearchParams({ ...fields, hash: createHmac('sha256', secret).update(dcs).digest('hex') }).toString();
}
const kv = new Map();
const SCANS = {
  async put(k, v) { kv.set(k, v); }, async get(k) { return kv.has(k) ? kv.get(k) : null; }, async delete(k) { kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
const env = { BOT_TOKEN: TOKEN, SCANS, ALLOWED_USERS: 'family_a, family_b, family_c' };   // made-up people, as the setting would add them

// Telegram: chats (id → username) answer getChat; `failing` ids get a 500 for sendMessage, `busy` makes every send a 429
const chats = new Map([[101, 'family_b'], [102, 'Family_C'], [666, 'stranger']]);
let failing = new Set(), busy = false, getChatDown = false;
const messages = [], calls = [];
globalThis.fetch = async (url, init) => {
  const u = new URL(String(url)), method = u.pathname.split('/').pop(), body = init && init.body ? JSON.parse(init.body) : {};
  calls.push(method);
  if (method === 'getChat') {
    if (getChatDown) throw new Error('network down');
    return chats.has(body.chat_id) ? Response.json({ ok: true, result: { id: body.chat_id, type: 'private', username: chats.get(body.chat_id) } })
      : Response.json({ ok: false, error_code: 400, description: 'Bad Request: chat not found' }, { status: 400 });
  }
  if (method === 'sendMessage') {
    if (busy) return Response.json({ ok: false, error_code: 429, parameters: { retry_after: 30 } }, { status: 429 });
    if (failing.has(body.chat_id)) return Response.json({ ok: false, error_code: 500 }, { status: 500 });
    messages.push(body); return Response.json({ ok: true });
  }
  return Response.json({ ok: true });
};
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
async function post(path, user, fields = {}, e = env) {
  const fd = new FormData(); fd.append('initData', sign(user)); for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await worker.fetch(new Request('https://w.example' + path, { method: 'POST', body: fd }), e, { waitUntil() {} });
  return { status: res.status, body: await res.json().catch(() => null) };
}
async function cron(iso) {
  const jobs = []; messages.length = 0;
  await worker.scheduled({ scheduledTime: Date.parse(iso), cron: '*/30 * * * *' }, env, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return messages.slice();
}

/* ---------- who may come in ---------- */
t('the list in config.js holds hashes only, no names', FAMILY.length > 0 && FAMILY.every((h) => /^[0-9a-f]{64}$/.test(h)));
t('a username\'s hash ignores the @ and letter case', (await nameHash('@Family_Z')) === (await nameHash('family_z')) && (await nameHash('family_z')) !== (await nameHash('family_y')));
const rz = await post('/stops', { id: 211, first_name: 'Зет', username: 'Family_Z' }, { stops: '[]' }, { ...env, ALLOWED_USERS: await nameHash('family_z') });
t('a hash in ALLOWED_USERS (as in config.js) lets that username in', rz.status === 200, JSON.stringify(rz.body));
let r = await post('/stops', { id: 201, first_name: 'Таша', username: 'Family_A' }, { stops: '[]' });
t('a family member (username in any letter case) is let in', r.status === 200 && r.body.ok, JSON.stringify(r.body));
t('… and their id is tied to the username', kv.get('who:family_a') === '201' && kv.get('ok:201') === 'family_a');
r = await post('/stops', { id: 202, first_name: 'Хтось', username: 'family_a' }, { stops: '[]' });
t('someone else who later takes the same username is refused', r.status === 403 && r.body.error === 'not_allowed');
r = await post('/stops', { id: 201, first_name: 'Таша', username: 'tasha_new' }, { stops: '[]' });
t('the family member who renamed themselves still comes in by id', r.status === 200 && r.body.ok);
r = await post('/stops', { id: 303, first_name: 'Чужий', username: 'random_guy' }, { stops: '[]' });
t('a stranger is refused, nothing is stored for them', r.status === 403 && r.body.error === 'not_allowed' && !kv.has('prof:303') && !kv.has('ok:303'));
r = await post('/stops', { id: 304, first_name: 'Без імені' }, { stops: '[]' });
t('a user without a username is refused', r.status === 403);
r = await post('/reminders', { id: 303, first_name: 'Чужий', username: 'random_guy' }, { kind: 'wort', action: 'on' });
t('a stranger cannot switch reminders on, the bot does not write to them', r.status === 403 && !kv.has('dsub:303') && !messages.length);
r = await post('/translate', { id: 303, first_name: 'Чужий', username: 'random_guy' }, { pair: 'de-uk', text: 'Hallo' }, { ...env, AI: { run: async () => { throw new Error('must not run'); } } });
t('a stranger cannot use the translation (the shared AI allowance)', r.status === 403);
r = await post('/stops', { id: 305, first_name: 'Гість', username: 'guest' }, { stops: '[]' }, { ...env, ALLOWED_USERS: '@Guest, 306' });
t('ALLOWED_USERS adds a username …', r.status === 200);
r = await post('/stops', { id: 306, first_name: 'Гість 2' }, { stops: '[]' }, { ...env, ALLOWED_USERS: '@Guest, 306' });
t('… and a numeric id', r.status === 200);
t('admit: no id, no entry', !(await admit(env, null)) && !(await admit(env, { id: 'x', username: 'family_a' })));
kv.set('ok:401', 'former_member');
t('a pinned id whose username is no longer on the list is refused', !(await admit(env, { id: 401, username: 'former_member' })));

/* ---------- the chat commands ---------- */
const SECRET = await hookSecret(TOKEN);
async function tg(text, from) {
  messages.length = 0;
  const res = await worker.fetch(new Request('https://w.example/tg', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': SECRET },
    body: JSON.stringify({ update_id: 1, message: { message_id: 1, from, chat: { id: from.id, type: 'private' }, text } }) }), env, { waitUntil() {} });
  return { status: res.status, msg: messages[0] };
}
r = await tg('/wort', { id: 303, first_name: 'Чужий', username: 'random_guy' });
t('a stranger\'s command: silence', r.status === 200 && !r.msg);
r = await tg('/start', { id: 303, first_name: 'Чужий', username: 'random_guy' });
t('a stranger who presses /start themselves: one line that the bot is private', r.msg && r.msg.chat_id === 303 && r.msg.text.includes('приватний бот'), r.msg && r.msg.text);
r = await tg('/wort', { id: 201, first_name: 'Таша', username: 'tasha_new' });
t('the people on the list get answers as before', r.msg && /Слово дня/.test(r.msg.text));

/* ---------- old subscriptions, from before the list ---------- */
kv.set('dsub:101', '{"id":101}'); kv.set('dsub:102', '{"id":102}'); kv.set('dsub:666', '{"id":666}'); kv.set('dsub:777', '{"id":777}');
calls.length = 0;
let msgs = await cron('2026-11-13T08:00:00Z');   // 09:00 in Xanten: the word of the day
t('old subscribers of the family get their message (looked up quietly with getChat)', msgs.some((m) => m.chat_id === 101) && msgs.some((m) => m.chat_id === 102) && kv.get('ok:102') === 'family_c', JSON.stringify(msgs.map((m) => m.chat_id)));
t('a stranger\'s old subscription is dropped without a message', !msgs.some((m) => m.chat_id === 666 || m.chat_id === 777) && !kv.has('dsub:666') && !kv.has('dsub:777'));
calls.length = 0;
msgs = await cron('2026-11-13T08:30:00Z');
t('half an hour later: nobody gets the word twice, nobody is looked up again', !msgs.length && !calls.includes('getChat') && !calls.includes('sendMessage'), calls.join());
t('allowedId: Telegram not answering → "cannot tell now" (the subscription stays)', await (async () => { getChatDown = true; const x = await allowedId(env, 999001); getChatDown = false; return x === null; })());

/* ---------- a run that breaks off ---------- */
for (const id of [101, 102, 201]) kv.set('sub:' + id, JSON.stringify({ id, district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: '14' }));
failing = new Set([102]);
msgs = await cron('2026-11-11T17:00:00Z');   // 18:00, yellow bin tomorrow
t('18:00: Telegram fails for one person, the others get the reminder', msgs.length === 2 && !msgs.some((m) => m.chat_id === 102) && !kv.has('got:waste:2026-11-12:102') && !kv.has('done:waste:2026-11-12'), JSON.stringify(msgs.map((m) => m.chat_id)));
failing = new Set();
msgs = await cron('2026-11-11T17:30:00Z');
t('18:30: only the missed person gets it, nobody twice', msgs.length === 1 && msgs[0].chat_id === 102 && kv.has('done:waste:2026-11-12'), JSON.stringify(msgs.map((m) => m.chat_id)));
msgs = await cron('2026-11-11T18:00:00Z');
t('19:00: all done, nothing more', !msgs.length);
// the next evening before a pickup in district 2, after 13.11
const prefs = { district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: '14' };
let eve = '2026-11-13';
while (!binsOn(cal, berlinDay(new Date(eve + 'T12:00:00Z'), 1), prefs).length) eve = berlinDay(new Date(eve + 'T12:00:00Z'), 1);
busy = true; calls.length = 0;
msgs = await cron(eve + 'T17:00:00Z');   // 18:00 in winter
const tried = calls.filter((c) => c === 'sendMessage').length;
busy = false;
calls.length = 0;
msgs = await cron(eve + 'T17:30:00Z');
t('Telegram says "too many" (429): the run stops, the next one sends to everyone', msgs.length === 3, `${msgs.length} after ${tried}`);
msgs = await cron('2026-12-08T20:00:00Z');   // 21:00: the window has closed
t('after 21:00 nothing is sent for the day any more', !msgs.length);

let eve2 = '2026-11-28';
while (!binsOn(cal, berlinDay(new Date(eve2 + 'T12:00:00Z'), 1), prefs).length) eve2 = berlinDay(new Date(eve2 + 'T12:00:00Z'), 1);
kv.set('sent:' + berlinDay(new Date(eve2 + 'T12:00:00Z'), 1), '1');   // that evening already sent by the version before this one
msgs = await cron(eve2 + 'T17:30:00Z');
t('a deploy in the middle of the evening: what the old version sent is not sent again', !msgs.length);
kv.set('bsub:101', JSON.stringify({ id: 101, place: 'Xanten', time: '07:00' })); kv.set('bsent:101:2026-12-03', '1');
msgs = await cron('2026-12-03T06:30:00Z');   // 07:30, the digest's catch-up half hour
t('… nor the morning digest', !msgs.some((m) => m.chat_id === 101));
kv.delete('bsub:101');

const box = outbox(env, 2);
const sends = [await box.send(101, 'a'), await box.send(102, 'b'), await box.send(201, 'c')];
t('a run\'s outbox stops at its budget; what does not fit waits for the next run', sends[0].ok && sends[1].ok && sends[2].later && box.left === 0);

/* ---------- switching the chat commands off ---------- */
kv.set('hook', JSON.stringify({ by: 666 }));   // switched on by someone who is not in the family
let hookUrl = 'https://w.example/tg';
const plainFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const m = new URL(String(url)).pathname.split('/').pop();
  if (m === 'getWebhookInfo') return Response.json({ ok: true, result: { url: hookUrl } });
  if (m === 'deleteWebhook') { hookUrl = ''; return Response.json({ ok: true }); }
  return plainFetch(url, init);
};
r = await post('/commands', { id: 201, first_name: 'Таша', username: 'tasha_new' }, { action: 'off' });
t('commands switched on by a stranger: the family can switch them off', r.body.on === false && hookUrl === '', JSON.stringify(r.body));
globalThis.fetch = plainFetch;

/* ---------- the translation limit ---------- */
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
kv.set(`tr:201:${day}`, '79');   // one page left today
let running = 0, most = 0;
const AI = { run: async () => { running++; most = Math.max(most, running); await new Promise((ok) => setTimeout(ok, 30)); running--; return { response: 'Привіт' }; } };
const three = await Promise.all([1, 2, 3].map(() => post('/translate', { id: 201, first_name: 'Таша', username: 'tasha_new' }, { pair: 'de-uk', text: 'Hallo' }, { ...env, AI })));
t('three pages at once with one left: one is translated, two get "daily limit"', three.filter((x) => x.status === 200).length === 1 && three.filter((x) => x.status === 429).length === 2 && most === 1, three.map((x) => x.status).join());
kv.set(`tr:102:${day}`, '5');
await post('/translate', { id: 102, first_name: 'Марія', username: 'family_c' }, { pair: 'de-uk', text: 'Hallo' }, { ...env, AI: { run: async () => { throw new Error('InferenceUpstreamError'); } } });
t('a failed translation does not use up a page', kv.get(`tr:102:${day}`) === '5', kv.get(`tr:102:${day}`));

/* ---------- the public endpoints ---------- */
const walk = (ip) => worker.fetch(new Request('https://w.example/transit/walk?from=51.66,6.45&to=51.661,6.451', { headers: ip ? { 'CF-Connecting-IP': ip } : {} }), env, { waitUntil() {} });
const statuses = [];
for (let i = 0; i < 32; i++) statuses.push((await walk('203.0.113.7')).status);
t('walking routes: 30 a minute per address, then 429', !statuses.slice(0, 30).includes(429) && statuses[30] === 429 && statuses[31] === 429, statuses.join());
t('… another address is not affected', (await walk('203.0.113.8')).status !== 429);
let limiterKey = null;
const withLimiter = { ...env, LIMITER: { limit: async ({ key }) => { limiterKey = key; return { success: false }; } } };
const res = await worker.fetch(new Request('https://w.example/transit/walk?from=51.66,6.45&to=51.661,6.451', { headers: { 'CF-Connecting-IP': '203.0.113.9' } }), withLimiter, { waitUntil() {} });
t('with the LIMITER binding its answer counts, keyed by address', res.status === 429 && limiterKey === '203.0.113.9');

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
