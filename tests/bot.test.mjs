// Checks what the bot says on its own: the morning digest (chosen half hour, once a day, each part stands alone),
// the chat commands through the webhook (secret checked, private chats only), stops pinned in the app for /bus and
// the digest, switching the webhook on and off
// (never over someone else's), messages about failures (services down and back, a job that throws, the waste
// calendar running out) and the note to waste subscribers on the calendar's last evening.
// Run: node tests/bot.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import worker from '../worker/send-scan.js';
import { hookSecret, briefText, TIMES } from '../worker/brief.js';
import { calendarNote, runJobs } from '../worker/health.js';

const fx = (n) => JSON.parse(readFileSync(new URL('./fixtures/' + n, import.meta.url)));
const DM = fx('efa-dm.json'), METEO = fx('meteo.json');
const TOKEN = '123456:TEST-not-a-real-token';
function sign(user) {
  const fields = { query_id: 'AAH', user: JSON.stringify(user), auth_date: String(Math.floor(Date.now() / 1000)) };
  const dcs = Object.entries(fields).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  return new URLSearchParams({ ...fields, hash: createHmac('sha256', secret).update(dcs).digest('hex') }).toString();
}
const STAS = { id: 4242, first_name: 'Стас' }, MAMA = { id: 5151, first_name: 'Наталія' };

const kv = new Map();
const SCANS = {
  async put(k, v) { kv.set(k, v); }, async get(k) { return kv.has(k) ? kv.get(k) : null; }, async delete(k) { kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
const env = { BOT_TOKEN: TOKEN, SCANS, ALLOWED_USERS: '4242,5151,555,777,7777,8888,999,31337' };
const messages = [], apiCalls = [];
let hook = '', down = new Set(), alerts = [];
globalThis.fetch = async (url, init) => {
  const u = new URL(String(url));
  if (u.hostname === 'api.telegram.org') {
    const method = u.pathname.split('/').pop(), body = init && init.body ? JSON.parse(init.body) : {};
    if (method === 'sendMessage') { messages.push(body); return new Response(JSON.stringify({ ok: body.chat_id !== 999 }), { status: body.chat_id === 999 ? 403 : 200 }); }
    apiCalls.push([method, body]);
    if (method === 'getWebhookInfo') return Response.json({ ok: true, result: { url: hook } });
    if (method === 'setWebhook') { hook = body.url; return Response.json({ ok: true }); }
    if (method === 'deleteWebhook') { hook = ''; return Response.json({ ok: true }); }
    return Response.json({ ok: true });
  }
  if (u.hostname === 'openservice.vrr.de') { if (down.has('vrr') || down.has(u.searchParams.get('name_dm'))) return new Response('x', { status: 503 }); return Response.json(shifted(DM, vrrNow)); }
  if (u.hostname === 'api.open-meteo.com') { if (down.has('meteo')) return new Response('x', { status: 503 }); return Response.json(METEO); }
  if (u.hostname === 'api.brightsky.dev') { if (down.has('dwd')) return new Response('x', { status: 503 }); return Response.json({ alerts, location: { name_short: 'Xanten' } }); }
  return new Response('unexpected ' + u, { status: 599 });
};
// the recorded departures, moved so that the first one leaves 4 minutes after `at` (the fixture is from one afternoon)
let vrrNow = Date.now();
function shifted(dm, at) {
  const d = structuredClone(dm), by = at + 4 * 60000 - Date.parse(d.stopEvents[0].departureTimePlanned);
  for (const e of d.stopEvents) for (const k of ['departureTimePlanned', 'departureTimeEstimated']) if (e[k]) e[k] = new Date(Date.parse(e[k]) + by).toISOString().replace('.000Z', 'Z');
  return d;
}
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
async function post(path, user, fields) {
  const fd = new FormData(); fd.append('initData', sign(user)); for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await worker.fetch(new Request('https://w.example' + path, { method: 'POST', body: fd }), env, { waitUntil() {} });
  return { status: res.status, body: await res.json().catch(() => null) };
}
async function cron(iso) {
  const jobs = []; messages.length = 0; vrrNow = Date.parse(iso);
  await worker.scheduled({ scheduledTime: Date.parse(iso), cron: '*/30 * * * *' }, env, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return messages.slice();
}
const last = () => messages.at(-1);

/* ---------- morning digest ---------- */
const HOME = { kind: 'ranok', place: 'Lüttingen', district: '2', bins: 'rest,papier,gelb', rhythm: '14', stop: 'de:05170:37032', stopName: 'Xanten Bahnhof', time: '07:30' };
let r = await post('/reminders', STAS, { ...HOME, action: 'on' });
let rec = JSON.parse(kv.get('bsub:4242'));
t('digest on: saved with time, place, bins, stop; confirmation says what will come', r.body.on && rec.time === '07:30' && rec.place === 'Lüttingen' && rec.waste.district === '2' && rec.stop === 'de:05170:37032'
  && last().text.includes('о 07:30') && last().text.includes('Xanten Bahnhof'), JSON.stringify(rec) + last().text);
t('digest on: the same choices are kept as the profile for the commands', JSON.parse(kv.get('prof:4242')).stop === 'de:05170:37032');
r = await post('/reminders', MAMA, { kind: 'ranok', action: 'on', place: 'Nowhere', time: '11:11', stop: 'drop table' });
rec = JSON.parse(kv.get('bsub:5151'));
t('digest: unknown place → Xanten, unknown time → 07:00, a bad stop id is dropped', rec.place === 'Xanten' && rec.time === '07:00' && !rec.stop && !rec.waste, JSON.stringify(rec));
r = await post('/reminders', STAS, { kind: 'ranok', action: 'status' });
t('digest status gives the time back', r.body.on && r.body.time === '07:30', JSON.stringify(r.body));

// 12 Nov 2026 is a Thursday; district 2 has the yellow bin that day
let msgs = await cron('2026-11-12T06:00:00Z');   // 07:00 in Xanten
t('07:00: the digest goes to who chose 07:00 only', msgs.some((m) => m.chat_id === 5151) && !msgs.some((m) => m.chat_id === 4242), JSON.stringify(msgs.map((m) => m.chat_id)));
msgs = await cron('2026-11-12T06:30:00Z');       // 07:30
const mine = msgs.find((m) => m.chat_id === 4242);
t('07:30: Stas gets his', !!mine && !msgs.some((m) => m.chat_id === 5151), JSON.stringify(msgs.map((m) => m.chat_id)));
t('digest: greeting with the name and the date', /^Доброго ранку, Стас! Четвер, 12 листопада/.test(mine.text), mine.text.slice(0, 80));
t('digest: weather now, today\'s range, and what it means', mine.text.includes('🌡 Lüttingen: зараз 5°, хмарно. Сьогодні 3°…5°.') && /☔|🌤|🧊/.test(mine.text), mine.text);
t('digest: the bins that go out today', mine.text.includes('🗑 Сьогодні вивозять: 🟡 Жовтий бак.'), mine.text);
t('digest: departures from his stop, with times in Xanten time (07:34 for 06:34 UTC)', mine.text.includes('🚌 Xanten Bahnhof\n07:34  36 → Xanten Bahnhofstraße'), mine.text);
t('digest: the word of the day in one line, and a button into the app', /(🔵|🔴|🟢) Слово дня: (der|die|das) /.test(mine.text) && mine.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/d-simya/'));
msgs = await cron('2026-11-12T06:30:00Z');
t('the digest goes out once a day', !msgs.length, msgs.length);
msgs = await cron('2026-11-12T12:00:00Z');
t('no digest at other hours', !msgs.length);
t('times offered: every half hour from 06:00 to 09:00', TIMES.length === 7 && TIMES[0] === '06:00' && TIMES.at(-1) === '09:00');

down = new Set(['meteo', 'vrr']);
let text = await briefText(JSON.parse(kv.get('bsub:4242')), new Date('2026-11-12T06:30:00Z'));
t('a service down: its part says so, the rest still comes', text.includes('Погода зараз недоступна') && text.includes('Розклад зараз недоступний') && text.includes('Жовтий бак') && text.includes('Слово дня'), text);
down = new Set();
alerts = [{ id: 1, alert_id: 'A1', status: 'actual', severity: 'moderate', event_code: 85, event_de: 'GLATTEIS', headline_de: 'x', onset: '2026-11-12T03:00:00+00:00', expires: '2099-11-12T08:00:00+00:00' }];
text = await briefText(JSON.parse(kv.get('bsub:4242')), new Date('2026-11-12T06:30:00Z'));
t('digest: an active DWD warning is named', text.includes('🟠 Попередження DWD: ожеледь'), text);
alerts = [];
text = await briefText({ id: 1, place: 'Xanten', time: '07:00', waste: { district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: '14' } }, new Date('2026-11-11T06:00:00Z'));
t('the evening before a pickup: "tomorrow, put the bins out tonight"', text.includes('🗑 Завтра вивозять: 🟡 Жовтий бак. Вистав баки сьогодні ввечері.'), text);

/* ---------- chat commands ---------- */
const SECRET = await hookSecret(TOKEN);
async function tg(text, { from = STAS, chat = { id: from.id, type: 'private' }, secret = SECRET } = {}) {
  messages.length = 0; vrrNow = Date.now();
  const res = await worker.fetch(new Request('https://w.example/tg', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Telegram-Bot-Api-Secret-Token': secret },
    body: JSON.stringify({ update_id: 1, message: { message_id: 1, from, chat, text } }) }), env, { waitUntil() {} });
  return { status: res.status, msg: messages[0] };
}
r = await tg('/bus');
t('/bus: departures from the profile\'s stop, button into Транспорт', r.status === 200 && r.msg.chat_id === 4242 && r.msg.text.startsWith('🚌 Xanten Bahnhof') && r.msg.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/transport/'), r.msg && r.msg.text);
r = await tg('/wetter@whysendbot');
t('/wetter (also with the bot\'s name): the profile\'s place', r.msg.text.includes('🌡 Lüttingen: зараз 5°'), r.msg && r.msg.text);
messages.length = 0;
const realNow = Date.now; Date.now = () => Date.parse('2026-11-11T10:00:00Z');
const RealDate = Date;
globalThis.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [RealDate.parse('2026-11-11T10:00:00Z')])); } static now() { return RealDate.parse('2026-11-11T10:00:00Z'); } };
r = await tg('/muell');
globalThis.Date = RealDate; Date.now = realNow;
t('/muell: the next pickups of the household\'s district', r.msg.text.startsWith('🗑 Найближчі вивози (район 2):') && r.msg.text.includes('Завтра: 🟡 Жовтий бак'), r.msg && r.msg.text);
r = await tg('/muell', { from: { id: 31337, first_name: 'Новий' } });
t('/muell without a district: asks to choose it in the app', r.msg.text.includes('вибери місце й баки') && r.msg.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/smittia/'));
r = await tg('/bus', { from: { id: 31337, first_name: 'Новий' } });
t('/bus without a stop: Xanten Bahnhof and how to pin one\'s own', r.msg.text.includes('Xanten Bahnhof') && r.msg.text.includes('Свої зупинки закріпи кнопкою 📌'), r.msg.text);

/* ---------- stops pinned in «Транспорт» ---------- */
r = await tg('/bus');
t('/bus with the one stop from before pins: that stop and a tip about pinning several', r.msg.text.startsWith('🚌 Xanten Bahnhof') && r.msg.text.includes('закріпи їх кнопкою 📌'), r.msg.text);
const DOM = 'de:05170:37040', MARKT = 'de:05170:37050';
r = await post('/stops', STAS, { stops: JSON.stringify([{ id: 'de:05170:37032', name: 'Xanten Bahnhof' }, { id: DOM, name: 'Xanten Dom' }, { id: 'drop table', name: 'x' }, { id: DOM, name: 'twice' }]) });
let prof = JSON.parse(kv.get('prof:4242')), brec = JSON.parse(kv.get('bsub:4242'));
t('pinning: known ids only, each once; kept in the profile and in the running digest', r.body.ok && r.body.stops === 2 && prof.stops.map((x) => x.id).join() === 'de:05170:37032,' + DOM && brec.stops.length === 2, JSON.stringify(prof));
t('pinning: the place and waste choices stay', prof.place === 'Lüttingen' && prof.waste.district === '2' && brec.time === '07:30', JSON.stringify(brec));
r = await tg('/bus');
let blocks = r.msg.text.split('\n\n');
t('/bus with two pinned stops: a block of four departures for each, no tip', blocks.length === 2 && blocks.every((b) => b.startsWith('🚌') && b.split('\n').length === 5), r.msg.text);
down = new Set([DOM]);
r = await tg('/bus');
t('/bus: a stop VRR cannot answer for says so, the other still shows', r.msg.text.includes('розклад зараз недоступний') && r.msg.text.split('\n\n').length === 2 && /\n\d\d:\d\d  /.test(r.msg.text), r.msg.text);
down = new Set();
await post('/stops', STAS, { stops: JSON.stringify([1, 2, 3, 4, 5].map((k) => ({ id: 'de:05170:3703' + k, name: 'Stop ' + k }))) });
r = await tg('/bus');
t('at most four pinned stops, three departures each', JSON.parse(kv.get('prof:4242')).stops.length === 4 && r.msg.text.split('\n\n').length === 4 && r.msg.text.split('\n\n').every((b) => b.split('\n').length === 4), r.msg.text);
await post('/stops', STAS, { stops: JSON.stringify([{ id: 'de:05170:37032', name: 'Xanten Bahnhof' }, { id: MARKT, name: 'Xanten Markt' }]) });
text = await briefText(JSON.parse(kv.get('bsub:4242')), new Date('2026-11-12T06:30:00Z'));
t('digest: a block for each pinned stop, three departures each', text.split('\n\n').filter((b) => b.startsWith('🚌')).length === 2 && text.split('\n\n').filter((b) => b.startsWith('🚌')).every((b) => b.split('\n').length === 4), text);
r = await post('/reminders', STAS, { ...HOME, action: 'prefs' });
t('the «Бот» page without pins (another phone): the pinned stops stay', JSON.parse(kv.get('prof:4242')).stops.length === 2 && JSON.parse(kv.get('bsub:4242')).stops.length === 2);
r = await post('/reminders', MAMA, { kind: 'ranok', action: 'off' });
messages.length = 0;
r = await post('/reminders', MAMA, { kind: 'ranok', action: 'on', place: 'Xanten', stops: JSON.stringify([{ id: DOM, name: 'Xanten Dom' }, { id: MARKT, name: 'Xanten Markt' }]) });
t('digest confirmation names the pinned stops', last().text.includes('із зупинок Xanten Dom, Xanten Markt'), last().text);
await post('/stops', STAS, { stops: '[]' });
r = await tg('/bus');
t('all unpinned: back to the stop the app sent before, with the tip', JSON.parse(kv.get('prof:4242')).stops.length === 0 && r.msg.text.startsWith('🚌 Xanten Bahnhof') && r.msg.text.includes('закріпи їх кнопкою 📌'), r.msg.text);
r = await post('/stops', STAS, { stops: 'not json' });
t('pinning: broken input pins nothing, nothing breaks', r.body.ok && r.body.stops === 0);
const unsigned = await worker.fetch(new Request('https://w.example/stops', { method: 'POST', body: new FormData() }), env, {});
t('pinning: without Telegram sign-in refused', unsigned.status === 401);

r = await tg('/wort');
t('/wort: the word of the day', /Слово дня: (der|die|das) /.test(r.msg.text));
r = await tg('/start');
t('/start: what the bot can do, with a button to open the app', r.msg.text.includes('/bus') && r.msg.text.includes('/muell') && r.msg.reply_markup.inline_keyboard[0][0].web_app.url.endsWith('/d-simya/'));
r = await tg('/abc');
t('unknown command: says so and lists the real ones', r.msg.text.startsWith('Такої команди я не знаю') && r.msg.text.includes('/wetter'));
r = await tg('привіт');
t('ordinary text: no answer', r.status === 200 && !r.msg);
r = await tg('/bus', { chat: { id: -100, type: 'group' } });
t('groups: no answer', r.status === 200 && !r.msg);
r = await tg('/bus', { secret: 'wrong' });
t('without Telegram\'s secret: refused, nothing sent', r.status === 403 && !r.msg);
down = new Set(['vrr']);
r = await tg('/bus');
t('/bus while VRR is down: a plain "try again"', r.msg.text.includes('не вдалося отримати дані'), r.msg && r.msg.text);
down = new Set();

/* ---------- switching the commands on ---------- */
apiCalls.length = 0; messages.length = 0;
r = await post('/commands', STAS, { action: 'status' });
t('commands: off at first', r.body.ok && r.body.on === false);
r = await post('/commands', STAS, { action: 'on' });
const set = apiCalls.find(([m]) => m === 'setWebhook'), cmds = apiCalls.find(([m]) => m === 'setMyCommands');
t('commands on: the webhook points at this Worker with the secret, messages only', r.body.on && set && set[1].url === 'https://w.example/tg' && set[1].secret_token === SECRET && set[1].allowed_updates.join() === 'message', JSON.stringify(set));
t('commands on: Telegram gets the command list, the person a message with them', cmds && cmds[1].commands.map((c) => c.command).join() === 'bus,wetter,muell,wort,help' && last().text.includes('Команди в чаті увімкнено'));
r = await post('/commands', MAMA, { action: 'off' });
t('commands off: only by who switched them on', r.body.error === 'not_yours' && hook === 'https://w.example/tg');
r = await post('/commands', STAS, { action: 'off' });
t('commands off: webhook and command list removed', r.body.on === false && hook === '' && apiCalls.some(([m]) => m === 'deleteMyCommands'));
hook = 'https://someone-else.example/hook'; apiCalls.length = 0;
r = await post('/commands', STAS, { action: 'on' });
t('a webhook that points elsewhere is never replaced', r.body.error === 'other_webhook' && !apiCalls.some(([m]) => m === 'setWebhook') && hook === 'https://someone-else.example/hook');
hook = '';
const noSign = await worker.fetch(new Request('https://w.example/commands', { method: 'POST', body: new FormData() }), env, {});
t('commands: without Telegram sign-in refused', noSign.status === 401);

/* ---------- messages about failures ---------- */
for (const k of [...kv.keys()]) if (/^(bsub|bsent):/.test(k)) kv.delete(k);
msgs = await cron('2026-11-12T12:00:00Z');
t('nobody asked for failure messages: nothing is checked or sent', !msgs.length && !kv.has('health'));
r = await post('/reminders', STAS, { kind: 'zboi', action: 'on' });
t('failure messages on: confirmation', r.body.on && kv.has('asub:4242') && last().text.includes('Сповіщення про збої увімкнено'));
down = new Set(['vrr']);
msgs = await cron('2026-11-12T12:30:00Z');
t('one failed check: not yet a message', !msgs.length && JSON.parse(kv.get('health')).vrr.fails === 1, JSON.stringify(msgs));
msgs = await cron('2026-11-12T13:00:00Z');
t('two in a row (about an hour): one message naming the service and the effect', msgs.length === 1 && msgs[0].chat_id === 4242 && msgs[0].text.includes('VRR') && msgs[0].text.includes('не відповідає'), JSON.stringify(msgs));
msgs = await cron('2026-11-12T13:30:00Z');
t('still down: no repeat', !msgs.length);
down = new Set();
msgs = await cron('2026-11-12T14:00:00Z');
t('back again: one "works again" message', msgs.length === 1 && msgs[0].text.includes('✅') && msgs[0].text.includes('VRR'), JSON.stringify(msgs));
msgs = await cron('2026-11-12T14:30:00Z');
t('all fine: silence', !msgs.length);

const failed = await runJobs([['добрий', async () => 1], ['зламаний', async () => { throw new Error('boom'); }], ['ще один', async () => 2]]);
t('a job that throws does not stop the others and is reported', failed.length === 1 && failed[0][0] === 'зламаний' && failed[0][1] === 'boom');
const list = SCANS.list; let broken = true;
SCANS.list = async (o) => { if (broken && o.prefix === 'dsub:') throw new Error('KV list failed'); return list(o); };
kv.delete('dsent:2026-11-13');
msgs = await cron('2026-11-13T08:00:00Z');   // 09:00: the word of the day job runs and breaks
t('a broken cron job: one message naming it', msgs.filter((m) => m.text.includes('Збій у завданні бота «слово дня»')).length === 1, JSON.stringify(msgs.map((m) => m.text.slice(0, 60))));
kv.delete('dsent:2026-11-13');
msgs = await cron('2026-11-13T08:00:00Z');
t('the same job failing again that day: no second message', !msgs.some((m) => m.text.includes('Збій')));
broken = false; SCANS.list = list;

t('calendar note: nothing in November', calendarNote(new Date('2026-11-16T09:00:00Z')) === null);
t('calendar note: Monday 10:00 in December, with the days left', /закінчується 31 грудня 2026 р\. \(залишилось 24 дн\.\)/.test(calendarNote(new Date('2026-12-07T09:05:00Z')) || ''), calendarNote(new Date('2026-12-07T09:05:00Z')));
t('calendar note: not on other days or hours', calendarNote(new Date('2026-12-08T09:05:00Z')) === null && calendarNote(new Date('2026-12-07T10:05:00Z')) === null);
t('calendar note: after the end it says the reminders have stopped', /закінчився/.test(calendarNote(new Date('2027-01-04T09:05:00Z')) || ''));
msgs = await cron('2026-12-07T09:00:00Z');
t('the calendar note reaches who asked for failure messages, once', msgs.filter((m) => m.text.startsWith('🗓')).length === 1);
msgs = await cron('2026-12-07T09:00:00Z');
t('… not twice', !msgs.some((m) => m.text.startsWith('🗓')));

kv.set('sub:4242', JSON.stringify({ id: 4242, district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: '14' }));
msgs = await cron('2026-12-31T17:00:00Z');   // 18:00 on the calendar's last day
t('last evening of the calendar: waste subscribers hear that reminders pause', msgs.some((m) => m.chat_id === 4242 && m.text.includes('на 2026 рік закінчився')), JSON.stringify(msgs.map((m) => m.text.slice(0, 60))));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
