// Checks the send-scan Worker: Telegram signature check, refusals, the call to sendDocument,
// the page hand-off to the browser and the waste-collection reminders (in-memory stand-in for Cloudflare KV).
// Run: node tests/worker.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import worker from '../worker/send-scan.js';
const TOKEN = '123456:TEST-not-a-real-token';
function sign(fields, token = TOKEN, includeSigInHash = true) {
  const entries = Object.entries(fields).filter(([k]) => includeSigInHash || k !== 'signature');
  const dcs = entries.sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secret).update(dcs).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
const now = Math.floor(Date.now() / 1000);
const base = { query_id: 'AAH', user: JSON.stringify({ id: 4242, first_name: 'Стас' }), auth_date: String(now) };
let sent = null; const messages = [];
globalThis.fetch = async (url, init) => {
  if (String(url).endsWith('/sendMessage')) {   // reminders; chat 999 has blocked the bot
    const m = JSON.parse(init.body); messages.push(m);
    return new Response(JSON.stringify({ ok: m.chat_id !== 999 }), { status: m.chat_id === 999 ? 403 : 200 });
  }
  sent = { url, chat: init.body.get('chat_id'), doc: init.body.get('document') }; return new Response(JSON.stringify({ ok: true }));
};
const pdf = new File([new TextEncoder().encode('%PDF-1.4\n%fake\n')], 'Скан_test.pdf', { type: 'application/pdf' });
async function call(initData, file = pdf, method = 'POST') {
  sent = null;
  const fd = new FormData(); if (initData !== undefined) fd.append('initData', initData); if (file) fd.append('file', file); fd.append('caption', 'Скан, 1 стор.');
  const req = new Request('https://w.example/', method === 'POST' ? { method, body: fd } : { method });
  const res = await worker.fetch(req, { BOT_TOKEN: TOKEN });
  return { status: res.status, body: await res.json().catch(() => null), acao: res.headers.get('Access-Control-Allow-Origin'), sent };
}
const cases = [
  ['valid', sign(base), 200],
  ['valid with signature field (hashed)', sign({ ...base, signature: 'abc' }), 200],
  ['valid with signature field (not hashed)', sign({ ...base, signature: 'abc' }, TOKEN, false), 200],
  ['wrong token', sign(base, '999:other'), 401],
  ['tampered user id', sign(base).replace('4242', '4243'), 401],
  ['expired', sign({ ...base, auth_date: String(now - 2 * 86400) }), 401],
  ['no initData', undefined, 401],
  ['not a pdf', sign(base), 415, new File(['hello'], 'x.pdf')],
];
let fails = 0;
for (const [name, init, want, file] of cases) {
  const r = await call(init, file);
  const ok = r.status === want && (want !== 200 || (r.sent && r.sent.chat === '4242' && r.sent.url.endsWith('/sendDocument')));
  if (!ok) fails++;
  console.log(ok ? 'PASS' : 'FAIL', name, r.status, JSON.stringify(r.body), r.sent ? `→ chat ${r.sent.chat}, ${r.sent.doc.name}` : '');
}
function t(name, ok, info = '') { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, info); }
const opt = await worker.fetch(new Request('https://w.example/', { method: 'OPTIONS' }), { BOT_TOKEN: TOKEN });
t('preflight', opt.status === 204 && opt.headers.get('Access-Control-Allow-Origin') === 'https://w2unemdhysend.github.io');

// hand-off of pages to the browser
const kv = new Map(), ttls = [];
const SCANS = {
  async put(k, v, o) { if (o && o.expirationTtl !== undefined && !(o.expirationTtl >= 60)) throw new Error('KV needs a TTL of 60 s or more'); if (!k.startsWith('sub:') && !k.startsWith('sent:')) ttls.push(o && o.expirationTtl); kv.set(k, v); },
  async get(k) { return kv.has(k) ? kv.get(k) : null; },
  async delete(k) { kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
const env = { BOT_TOKEN: TOKEN, SCANS };
const jpg = (n) => new File([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, n, n, n])], `p${n}.jpg`, { type: 'image/jpeg' });
async function post(initData, files, e = env) {
  const fd = new FormData(); fd.append('initData', initData); files.forEach((f) => fd.append('page', f));
  const res = await worker.fetch(new Request('https://w.example/handoff', { method: 'POST', body: fd }), e);
  return { status: res.status, body: await res.json().catch(() => null) };
}
const get = (path, method = 'GET') => worker.fetch(new Request('https://w.example' + path, { method }), env);

let r = await post(sign(base), [jpg(1), jpg(2)]);
const id = r.body && r.body.id;
t('handoff: signed upload of 2 pages', r.status === 200 && /^[0-9a-f-]{36}$/.test(id || '') && kv.size === 3 && ttls.every((x) => x === 600), JSON.stringify(r.body));
let res = await get(`/handoff/${id}`);
t('handoff: browser sees the page count', res.status === 200 && (await res.json()).n === 2 && res.headers.get('Access-Control-Allow-Origin') === 'https://w2unemdhysend.github.io');
res = await get(`/handoff/${id}/1`);
const bytes = new Uint8Array(await res.arrayBuffer());
t('handoff: page comes back unchanged as JPEG', res.status === 200 && res.headers.get('Content-Type') === 'image/jpeg' && bytes.length === 7 && bytes[4] === 2);
res = await get(`/handoff/${id}`, 'DELETE');
t('handoff: delete removes everything', res.status === 200 && kv.size === 0);
res = await get(`/handoff/${id}`);
t('handoff: gone after delete', res.status === 404);
{
  const fd = new FormData(); fd.append('initData', sign(base)); fd.append('page', jpg(1));
  fd.append('meta', JSON.stringify([{ ocr: { lang: 'deu', text: 'Bescheid' }, tr: { pair: 'de-uk', src: 'Bescheid', text: 'Рішення' } }, { extra: true }]));
  const up = await (await worker.fetch(new Request('https://w.example/handoff', { method: 'POST', body: fd }), env)).json();
  const meta = await (await get(`/handoff/${up.id}`)).json();
  t('handoff: translations travel with the pages (one entry per page)', meta.n === 1 && meta.pages.length === 1 && meta.pages[0].tr.text === 'Рішення', JSON.stringify(meta));
  await get(`/handoff/${up.id}`, 'DELETE');
}
r = await post(sign(base), [jpg(1), new File(['%PDF-1.4'], 'x.jpg')]);
t('handoff: non-JPEG refused, nothing stored', r.status === 415 && kv.size === 0);
r = await post(sign(base, '999:other'), [jpg(1)]);
t('handoff: forged signature refused', r.status === 401 && kv.size === 0);
r = await post(sign(base), [jpg(1)], { BOT_TOKEN: TOKEN });
t('handoff: missing KV binding reported', r.status === 500);
res = await get('/handoff/../../etc');
t('handoff: malformed id is not found', res.status === 404);

// waste-collection reminders
async function remind(action, initData = sign(base)) {
  const fd = new FormData(); fd.append('initData', initData); fd.append('action', action);
  const res = await worker.fetch(new Request('https://w.example/reminders', { method: 'POST', body: fd }), env);
  return { status: res.status, body: await res.json().catch(() => null) };
}
messages.length = 0;
r = await remind('on');
t('reminders: switch on', r.status === 200 && r.body.on === true && JSON.parse(kv.get('sub:4242')).id === 4242);
t('reminders: switching on confirms in the chat with the next pickup', r.body.confirmed === true && messages.length === 1 && messages[0].chat_id === 4242 && messages[0].text.includes('Найближчий вивіз'), messages[0] && messages[0].text);
r = await remind('on', sign({ ...base, user: JSON.stringify({ id: 999, first_name: 'X' }) }));
t('reminders: if the bot may not write to the person, nothing is saved', r.body.ok === false && r.body.error === 'bot_blocked' && !kv.has('sub:999'));
r = await remind('status');
t('reminders: status says on', r.body.on === true);
r = await remind('off');
t('reminders: switch off', r.body.on === false && !kv.has('sub:4242'));
r = await remind('on', sign(base, '999:other'));
t('reminders: forged signature refused', r.status === 401 && !kv.has('sub:4242'));
r = await remind('maybe');
t('reminders: unknown action refused', r.status === 400);

async function cron(iso) {
  const jobs = []; messages.length = 0;
  await worker.scheduled({ scheduledTime: Date.parse(iso) }, env, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return messages.slice();
}
await remind('on');
kv.set('sub:999', JSON.stringify({ id: 999 }));
let msgs = await cron('2026-11-16T16:00:00Z');
t('cron 17:00 in Xanten: nothing sent', msgs.length === 0);
msgs = await cron('2026-11-16T17:00:00Z');
const m0 = msgs.find((m) => m.chat_id === 4242);
t('cron 18:00 (winter): both subscribers get tomorrow\'s bins', msgs.length === 2 && m0 && m0.text.includes('Завтра, вівторок, 17 листопада') && m0.text.includes('Сірий бак (Restmüll): лише баки, які вивозять кожні 2 тижні'), m0 && m0.text);
t('cron: message has a button that opens the schedule', m0 && m0.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/d-simya/smittia/'));
t('cron: a person who blocked the bot is removed', !kv.has('sub:999') && kv.has('sub:4242'));
msgs = await cron('2026-11-16T17:00:00Z');
t('cron: the same evening is never sent twice', msgs.length === 0);
msgs = await cron('2026-11-10T17:00:00Z');
t('cron: no message when nothing goes out tomorrow (11.11)', msgs.length === 0);
msgs = await cron('2026-11-11T17:00:00Z');
t('cron: 12.11 yellow bin', msgs.length === 1 && msgs[0].text.includes('Завтра, четвер, 12 листопада') && msgs[0].text.includes('🟡 Жовтий бак (Gelbe Tonne)'), msgs[0] && msgs[0].text);
msgs = await cron('2026-11-30T17:00:00Z');
t('cron: 01.12 all grey bins, no note', msgs.length === 1 && msgs[0].text.includes('⚫ Сірий бак (Restmüll)\n') && !msgs[0].text.includes('лише'), msgs[0] && msgs[0].text);
msgs = await cron('2026-06-01T16:00:00Z');
t('cron 18:00 (summer time) works too', msgs.length === 1 && msgs[0].text.includes('2 червня'), msgs[0] && msgs[0].text);

// translation (Workers AI is replaced by a recorder)
const aiCalls = []; let aiReply = { choices: [{ message: { content: 'Будь ласка, перекажіть 125,00 € до 24.11.2026.' } }] };
const AI = { async run(model, input) { aiCalls.push({ model, input }); if (aiReply instanceof Error) throw aiReply; return aiReply; } };
const envAI = { ...env, AI };
async function tr(fields, initData = sign(base), e = envAI) {
  const fd = new FormData(); if (initData) fd.append('initData', initData); Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  const res = await worker.fetch(new Request('https://w.example/translate', { method: 'POST', body: fd }), e);
  return { status: res.status, body: await res.json().catch(() => null) };
}
const letter = 'Bitte überweisen Sie 125,00 € bis zum 24.11.2026.';
r = await tr({ pair: 'de-uk', text: letter });
const sys0 = aiCalls[0] && aiCalls[0].input.messages[0].content;
t('translate: signed page comes back translated', r.status === 200 && r.body.text.startsWith('Будь ласка'), JSON.stringify(r.body));
t('translate: Gemma 4, German → Ukrainian, numbers kept, German terms in brackets', aiCalls[0].model === '@cf/google/gemma-4-26b-a4b-it' && sys0.includes('from German into Ukrainian') && sys0.includes('Copy every number exactly') && sys0.includes('(Bescheid)') && aiCalls[0].input.messages[1].content === letter && aiCalls[0].input.max_completion_tokens >= 2048);
// Gemma 4 on Workers AI thinks by default: on a full page that took 80 s and all 4096 tokens, leaving no translation
t('translate: model thinking switched off', aiCalls[0].input.chat_template_kwargs && aiCalls[0].input.chat_template_kwargs.enable_thinking === false, JSON.stringify(aiCalls[0].input.chat_template_kwargs));
r = await tr({ pair: 'uk-de', text: 'Довідка' });
t('translate: Ukrainian → German has no bracket rule', r.status === 200 && aiCalls[1].input.messages[0].content.includes('from Ukrainian into German') && !aiCalls[1].input.messages[0].content.includes('(Bescheid)'));
const today = [...kv.keys()].find((k) => k.startsWith('tr:4242:'));
t('translate: pages are counted per person and day', today && kv.get(today) === '2', today);
const n0 = aiCalls.length;
r = await tr({ pair: 'de-uk', text: letter }, sign(base, '999:other'));
t('translate: forged signature refused, model not called', r.status === 401 && aiCalls.length === n0);
r = await tr({ pair: 'de-ru', text: letter });
t('translate: unknown language pair refused', r.status === 400);
r = await tr({ pair: 'de-uk', text: '   ' });
t('translate: empty page refused', r.status === 400);
r = await tr({ pair: 'de-uk', text: 'x'.repeat(12001) });
t('translate: overlong text refused', r.status === 413 && aiCalls.length === n0);
kv.set(today, '80');
r = await tr({ pair: 'de-uk', text: letter });
t('translate: 80 pages a day, then a clear refusal', r.status === 429 && r.body.error === 'daily_limit' && aiCalls.length === n0);
kv.delete(today);
aiReply = new Error('AiError: 4006: you have used up your daily free allocation of 10,000 neurons');
r = await tr({ pair: 'de-uk', text: letter });
t('translate: free Workers AI allowance used up → ai_quota', r.status === 429 && r.body.error === 'ai_quota');
aiReply = new Error('InferenceUpstreamError');
r = await tr({ pair: 'de-uk', text: letter });
t('translate: model failure → ai_failed', r.status === 502 && r.body.error === 'ai_failed');
aiReply = { response: '<think>hmm</think>\nПереклад' };
r = await tr({ pair: 'de-uk', text: letter });
t('translate: older answer shape read, thinking stripped', r.status === 200 && r.body.text === 'Переклад', JSON.stringify(r.body));
r = await tr({ pair: 'de-uk', text: letter }, sign(base), env);
t('translate: missing AI binding reported', r.status === 500);
aiReply = { choices: [{ message: { content: 'Будь ласка, перекажіть 125,00 € до 24.11.2026.' } }] };
const n1 = aiCalls.length;
const chk = async () => { const res = await worker.fetch(new Request('https://w.example/translate/check'), envAI); return { status: res.status, body: await res.json() }; };
r = await chk(); const r2 = await chk();
t('translate/check: answers with a sample, second call from cache', r.status === 200 && r.body.sample.includes('125,00') && r2.body.sample === r.body.sample && aiCalls.length === n1 + 1, JSON.stringify(r.body));

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
