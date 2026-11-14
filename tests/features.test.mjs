// Checks the Worker's newer parts: DWD weather warnings (route, words, the bot with levels and no repeats),
// the word of the day (09:00 only, once a day, every word before repeats), the family shopping list
// (Durable Object: add, tick, remove, clear, invite codes, joining, leaving, only members), and that each cron runs
// only its own jobs. Run: node tests/features.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import worker, { ShoppingList } from '../worker/send-scan.js';
import { warnOf, LEVEL } from '../worker/warn.js';
import { WORDS, wordOfDay } from '../igry/words.js';
import { wordText } from '../worker/word.js';

const TOKEN = '123456:TEST-not-a-real-token';
function sign(user) {
  const fields = { query_id: 'AAH', user: JSON.stringify(user), auth_date: String(Math.floor(Date.now() / 1000)) };
  const dcs = Object.entries(fields).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  return new URLSearchParams({ ...fields, hash: createHmac('sha256', secret).update(dcs).digest('hex') }).toString();
}
const STAS = { id: 4242, first_name: 'Стас' }, MAMA = { id: 5151, first_name: 'Наталія' }, OTHER = { id: 7777, first_name: 'Хтось' };

// in-memory stand-ins: KV, Durable Objects, Telegram, Bright Sky
const kv = new Map();
let slowKV = false;   // real KV answers in milliseconds: requests that come together all read before any of them writes
const lag = () => (slowKV ? new Promise((r) => setTimeout(r, 5)) : null);
const SCANS = {
  async put(k, v) { await lag(); kv.set(k, v); }, async get(k) { await lag(); return kv.has(k) ? kv.get(k) : null; }, async delete(k) { await lag(); kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
const objects = new Map();
const LISTS = {
  idFromName: (n) => n,
  get(id) {
    if (!objects.has(id)) { const store = new Map(); objects.set(id, new ShoppingList({ storage: { get: async (k) => structuredClone(store.get(k)), put: async (k, v) => { store.set(k, structuredClone(v)); } } })); }
    const o = objects.get(id);
    return { fetch: (url, init) => o.fetch(new Request(url, init)) };
  },
};
const env = { BOT_TOKEN: TOKEN, SCANS, LISTS, ALLOWED_USERS: '4242,5151,555,777,7777,8888,999,31337' };
const messages = [];
let alerts = [];
globalThis.fetch = async (url, init) => {
  const u = new URL(String(url));
  if (u.hostname === 'api.telegram.org') {
    const m = JSON.parse(init.body); messages.push(m);
    return new Response(JSON.stringify({ ok: m.chat_id !== 999 }), { status: m.chat_id === 999 ? 403 : 200 });
  }
  if (u.hostname === 'api.brightsky.dev') return Response.json({ alerts, location: { name_short: 'Xanten', warn_cell_id: 805170052 } });
  return new Response('unexpected ' + u, { status: 599 });
};
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
async function post(path, user, fields) {
  const fd = new FormData(); fd.append('initData', sign(user)); for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await worker.fetch(new Request('https://w.example' + path, { method: 'POST', body: fd }), env, { waitUntil() {} });
  return { status: res.status, body: await res.json().catch(() => null) };
}
async function cron(iso, expr) {
  const jobs = []; messages.length = 0;
  await worker.scheduled({ scheduledTime: Date.parse(iso), cron: expr }, env, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return messages.slice();
}
const ALERT = (over = {}) => ({ id: 1, alert_id: 'A1', status: 'actual', severity: 'moderate', event_code: 85, event_de: 'GLATTEIS', headline_de: 'Amtliche UNWETTERWARNUNG vor GLATTEIS',
  description_de: 'Es tritt Glatteis auf.', instruction_de: 'Hinweis auf: Verkehrsbehinderungen.', onset: '2026-11-20T03:00:00+00:00', expires: '2099-11-20T10:00:00+00:00', ...over });

/* ---------- weather warnings ---------- */
const w = warnOf(ALERT({ severity: 'severe', event_de: 'SCHWERE STURMBÖEN' }));
t('warning words: level 3 red, "сильні штормові пориви" with a tip', w.level === 3 && w.levelUk === 'червоний' && w.uk === 'сильні штормові пориви' && w.tip.includes('дерев'), JSON.stringify(w));
t('warning words: thunderstorm with gusts → two words', warnOf(ALERT({ event_de: 'SCHWERES GEWITTER mit ORKANBÖEN' })).uk === 'гроза, ураганний вітер');
t('warning words: unknown event stays readable', warnOf(ALERT({ event_de: 'TESTWARNUNG XY' })).uk === 'testwarnung xy');
t('levels: minor 1 … extreme 4', LEVEL.minor === 1 && LEVEL.extreme === 4);
alerts = [ALERT(), ALERT({ alert_id: 'A2', severity: 'minor', event_code: 22, event_de: 'FROST', headline_de: 'Amtliche WARNUNG vor FROST' }), ALERT({ alert_id: 'OLD', expires: '2000-01-01T00:00:00Z' }), ALERT({ alert_id: 'T', status: 'test' })];
let res = await worker.fetch(new Request('https://w.example/warnings?lat=51.6615&lon=6.4543'), env, { waitUntil() {} });
let d = await res.json();
t('GET /warnings: active warnings only, highest level first, place named', res.status === 200 && d.warnings.length === 2 && d.warnings[0].uk === 'ожеледь' && d.warnings[0].level === 2 && d.place === 'Xanten', JSON.stringify(d).slice(0, 300));
t('GET /warnings: no sign-in needed, bad coordinates refused', (await worker.fetch(new Request('https://w.example/warnings?lat=x'), env, {})).status === 400);

// the bot
let r = await post('/reminders', STAS, { kind: 'wetter', action: 'on', place: 'Lüttingen', level: '2' });
t('warnings: switch on with place and level, confirmation lists what is on now', r.body.on && JSON.parse(kv.get('wsub:4242')).place === 'Lüttingen' && messages.at(-1).text.includes('Попередження про негоду увімкнено для Lüttingen') && messages.at(-1).text.includes('ожеледь'), messages.at(-1) && messages.at(-1).text);
t('warnings: the confirmation button opens the weather page in the Mini App', messages.at(-1).reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/pogoda/'));
let before = messages.length;
r = await post('/reminders', STAS, { kind: 'wetter', action: 'on', place: 'Lüttingen', level: '2' });
const twice = await Promise.all([1, 2, 3].map(() => post('/reminders', STAS, { kind: 'wetter', action: 'on', place: 'Lüttingen', level: '2' })));
t('warnings: "on" again (a second tap, three requests at once) sends no new confirmation', messages.length === before && r.body.on && r.body.already && twice.every((x) => x.body.on), messages.slice(before).map((m) => m.text.slice(0, 40)).join(' | '));
r = await post('/reminders', OTHER, { kind: 'wetter', action: 'on', place: 'Wardt', level: '2' });
before = messages.length;
slowKV = true;
await Promise.all([1, 2, 3].map(() => post('/reminders', { ...OTHER, id: 8888 }, { kind: 'wetter', action: 'on', place: 'Wardt', level: '2' })));
slowKV = false;
t('warnings: three first "on" requests at the same moment → one confirmation', messages.filter((m) => m.chat_id === 8888).length === 1 && kv.has('wsub:8888'), messages.slice(before).length);
r = await post('/reminders', STAS, { kind: 'wetter', action: 'on', place: 'Lüttingen', level: '1' });
t('warnings: a repeated "on" still keeps the new level, quietly', JSON.parse(kv.get('wsub:4242')).level === 1 && messages.length === before + 1);
await post('/reminders', STAS, { kind: 'wetter', action: 'on', place: 'Lüttingen', level: '2' });
await post('/reminders', OTHER, { kind: 'wetter', action: 'off' });
before = messages.length;
await post('/reminders', OTHER, { kind: 'wetter', action: 'on', place: 'Wardt', level: '2' });
t('warnings: off and on again within a minute → on, with a confirmation again', messages.length === before + 1 && messages.at(-1).chat_id === 7777 && kv.has('wsub:7777'));
await post('/reminders', OTHER, { kind: 'wetter', action: 'off' }); await post('/reminders', { ...OTHER, id: 8888 }, { kind: 'wetter', action: 'off' });
r = await post('/reminders', STAS, { kind: 'wetter', action: 'status' });
t('warnings: status gives back place and level', r.body.on && r.body.place === 'Lüttingen' && r.body.level === 2, JSON.stringify(r.body));
r = await post('/reminders', MAMA, { kind: 'wetter', action: 'on', place: 'Nowhere', level: '9' });
t('warnings: unknown place → Xanten, unknown level → 2', JSON.parse(kv.get('wsub:5151')).place === 'Xanten' && JSON.parse(kv.get('wsub:5151')).level === 2);
await post('/reminders', MAMA, { kind: 'wetter', action: 'prefs', place: 'Wesel', level: '3' });
t('warnings: prefs update place and level of a running subscription', JSON.parse(kv.get('wsub:5151')).place === 'Wesel' && JSON.parse(kv.get('wsub:5151')).level === 3);
kv.set('wsub:999', JSON.stringify({ id: 999, place: 'Xanten', level: 1 }));
let msgs = await cron('2026-11-20T05:00:00Z', '*/30 * * * *');
t('cron: orange Glatteis goes to level-2 Stas, not to level-3 mother', msgs.some((m) => m.chat_id === 4242 && m.text.includes('ожеледь') && m.text.includes('Рівень 2 з 4')) && !msgs.some((m) => m.chat_id === 5151), JSON.stringify(msgs.map((m) => [m.chat_id, m.text.slice(0, 40)])));
t('cron: the yellow frost warning is not sent at level 2', !msgs.some((m) => m.chat_id === 4242 && m.text.includes('мороз')));
t('cron: a person who blocked the bot is removed', !kv.has('wsub:999'));
msgs = await cron('2026-11-20T05:30:00Z', '*/30 * * * *');
t('cron: the same warning is not sent again half an hour later', !msgs.some((m) => m.chat_id === 4242), msgs.length);
alerts = [ALERT({ alert_id: 'A9', severity: 'severe' })];
msgs = await cron('2026-11-20T06:00:00Z', '*/30 * * * *');
t('cron: an upgrade to red is news: both get it', msgs.some((m) => m.chat_id === 4242) && msgs.some((m) => m.chat_id === 5151 && m.text.includes('Wesel')), JSON.stringify(msgs.map((m) => m.chat_id)));
kv.set('sub:4242', JSON.stringify({ id: 4242, district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: 'unknown' }));
msgs = await cron('2026-11-11T17:00:00Z', '*/30 * * * *');
t('one cron runs every job: at 18:00 the waste reminder goes out', msgs.some((m) => m.chat_id === 4242 && m.text.includes('завтра')), JSON.stringify(msgs.map((m) => m.text.slice(0, 50))));
msgs = await cron('2026-11-11T17:30:00Z', '*/30 * * * *');
t('… and at 18:30 not again', !msgs.some((m) => m.chat_id === 4242 && m.text.includes('завтра')));

/* ---------- word of the day ---------- */
const seen = new Set(); for (let i = 0; i < WORDS.length; i++) seen.add(wordOfDay(new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10))[0]);
t('word of the day: every word once before any repeats', seen.size === WORDS.length, seen.size);
const wt = wordText('2026-11-21');
t('word of the day text: article, word, translation, example', /^(🔵|🔴|🟢) Слово дня: (der|die|das) \S+ — /.test(wt) && wt.includes(wordOfDay('2026-11-21')[5]), wt);
r = await post('/reminders', STAS, { kind: 'wort', action: 'on' });
t('word of the day: switching on sends today\'s word with a button into the game', r.body.on && messages.at(-1).text.includes('Сьогоднішнє слово') && messages.at(-1).reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/igry/?tab=art'));
alerts = [];
msgs = await cron('2026-11-21T07:30:00Z', '*/30 * * * *');
t('08:30 in Xanten: no word yet', !msgs.some((m) => m.text.includes('Слово дня')));
msgs = await cron('2026-11-21T08:00:00Z', '*/30 * * * *');
t('09:00 in Xanten: the word of the day', msgs.some((m) => m.chat_id === 4242 && m.text.startsWith(wt.slice(0, 2)) && m.text.includes('Слово дня')));
msgs = await cron('2026-11-21T08:00:00Z', '*/30 * * * *');
t('the word goes out once a day', !msgs.some((m) => m.text.includes('Слово дня')));
msgs = await cron('2026-07-21T07:00:00Z', '*/30 * * * *');
t('summer time: 07:00 UTC is 09:00 in Xanten', msgs.some((m) => m.text.includes('Слово дня')));

/* ---------- the family shopping list ---------- */
r = await post('/list', STAS, { action: 'get' });
t('list: the first visit makes an empty list of one\'s own', r.status === 200 && r.body.items.length === 0 && r.body.members.join() === 'Стас' && kv.has('lm:4242'));
r = await post('/list', STAS, { action: 'add', t: '  Milch <b>  ', s: 'Lidl', u: '2026-11-21' });
t('list: add with a shop and until when the offer runs; text cleaned', r.body.items.length === 1 && r.body.items[0].t === 'Milch b' && r.body.items[0].s === 'Lidl' && r.body.items[0].u === '2026-11-21' && r.body.items[0].by === 'Стас', JSON.stringify(r.body.items[0]));
r = await post('/list', STAS, { action: 'add', t: '   ' });
t('list: empty text refused', r.status === 400);
r = await post('/list', STAS, { action: 'invite' });
const code = r.body.code;
t('list: invite code of 6 letters, valid 24 h', /^[A-Z2-9]{6}$/.test(code) && kv.get('inv:' + code) === kv.get('lm:4242'));
await post('/list', MAMA, { action: 'add', t: 'Brot' });   // mother had her own list first
r = await post('/list', MAMA, { action: 'join', code: code.toLowerCase().slice(0, 3) + '-' + code.slice(3) });
t('list: joining with the code (any case, a dash is fine): the shared list', r.status === 200 && r.body.items.map((x) => x.t).join() === 'Milch b' && r.body.members.sort().join() === ['Наталія', 'Стас'].sort().join(), JSON.stringify(r.body));
r = await post('/list', MAMA, { action: 'add', t: 'Eier' });
const eggs = r.body.items.find((x) => x.t === 'Eier');
r = await post('/list', STAS, { action: 'toggle', id: eggs.id });
t('list: one adds, the other ticks it off; both see it', r.body.items.find((x) => x.id === eggs.id).d === 1 && r.body.items.find((x) => x.id === eggs.id).dby === 'Стас');
r = await post('/list', MAMA, { action: 'get' });
t('list: the other phone sees the tick and a newer version', r.body.items.find((x) => x.id === eggs.id).d === 1 && r.body.v >= 4, r.body.v);
r = await post('/list', OTHER, { action: 'join', code: 'ZZZZZZ' });
t('list: a wrong code is refused', r.status === 404 && r.body.error === 'bad_code');
r = await post('/list', STAS, { action: 'clear' });
t('list: clearing removes only what was bought', r.body.items.map((x) => x.t).join() === 'Milch b');
r = await post('/list', STAS, { action: 'remove', id: r.body.items[0].id });
t('list: remove one item', r.body.items.length === 0);
r = await post('/list', MAMA, { action: 'leave' });
t('list: leaving gives an empty list of one\'s own', r.body.items.length === 0 && r.body.members.join() === 'Наталія' && kv.get('lm:5151') !== kv.get('lm:4242'));
r = await post('/list', STAS, { action: 'get' });
t('list: the one who stays sees only themself', r.body.members.join() === 'Стас');
const sharedId = kv.get('lm:4242'), direct = await LISTS.get(sharedId).fetch('https://list/', { method: 'POST', body: JSON.stringify({ op: 'get', user: { id: 7777, name: 'X' } }) });
t('list: someone not in the list gets nothing from it', direct.status === 403);
r = await post('/list', STAS, { action: 'teleport' });
t('list: unknown action refused', r.status === 400);
const fd = new FormData(); fd.append('action', 'get');
res = await worker.fetch(new Request('https://w.example/list', { method: 'POST', body: fd }), env, {});
t('list: without Telegram sign-in refused', res.status === 401);

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
