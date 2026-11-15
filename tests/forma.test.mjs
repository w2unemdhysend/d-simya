// Checks «Харчування» and «Тренування» away from the browser: the calorie target and its safe floors, the weight trend
// and the goal date, the food list (every food has sane numbers, an icon or «невідомо», portions), the server's records
// (newer change wins, deletions, pages, limits, one person's records never reach another), partners (codes, at most
// four, they see progress and never food or weight), and the reminders (switching on, each person's half hour, quiet
// when the day is already done). Run: node tests/forma.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import worker, { Forma, ShoppingList } from '../worker/send-scan.js';
import { partnerView, mealText, sportText, weighText, morningText, okChange } from '../worker/forma.js';
import { target, macros, trend, rate, eta, bmr, valid, portion, sum, burnt, floorOf, dayNum, dayOf } from '../yizha/calc.js';
import { FOODS, CATS } from '../yizha/foods.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };

/* ---------- the numbers ---------- */
const woman = { sex: 'f', born: 1968, cm: 163, start: { kg: 84, day: '2026-11-01' }, goal: 70, act: 2, pace: 0.5, kcal: null };
const man = { sex: 'm', born: 1995, cm: 182, start: { kg: 98, day: '2026-11-01' }, goal: 85, act: 3, pace: 0.75, kcal: null };
t('a whole profile is valid, a broken one is not', valid(woman) && valid(man) && !valid({ ...woman, cm: 50 }) && !valid({ ...woman, pace: 2 }) && !valid(null));
t('Mifflin–St Jeor: woman 58, 163 cm, 84 kg ≈ 1 408 kcal at rest', Math.round(bmr(woman, 84, 2026)) === 1408, bmr(woman, 84, 2026));
const tm = target(woman, 84, 2026);
t('woman: need × 1.375 minus the deficit for 0.5 kg a week (550 kcal, but at most a quarter of the need)', tm.need === 1940 && tm.kcal === 1450, JSON.stringify(tm));
t('the deficit is at most a quarter of the need', tm.deficit <= tm.need * 0.25 + 10, JSON.stringify(tm));
const tiny = { sex: 'f', born: 1950, cm: 150, start: { kg: 60, day: '2026-11-01' }, goal: 50, act: 1, pace: 0.75, kcal: null };
t('never below 1 200 kcal for a woman', target(tiny, 60, 2026).kcal === 1200 && target(tiny, 60, 2026).floored && floorOf(tiny) === 1200, JSON.stringify(target(tiny, 60, 2026)));
t('never below 1 500 kcal for a man', target({ ...man, cm: 160, act: 1, born: 1940, goal: 55 }, 62, 2026).kcal === 1500);
t('goal reached: the target is the need, no deficit', target(woman, 69.5, 2026).reached && target(woman, 69.5, 2026).deficit === 0);
t('an own target wins', target({ ...woman, kcal: 1777 }, 84, 2026).kcal === 1780 && target({ ...woman, kcal: 1777 }, 84, 2026).own);
const m = macros(1600);
t('macros: protein 25 %, fat 30 %, carbs 45 %', m.p === 100 && m.f === 53 && m.c === 180, JSON.stringify(m));
const apple = FOODS.find((f) => f[1] === 'Яблуко'), A = { kcal: apple[5], p: apple[6], f: apple[7], c: apple[8] };
t('a portion: 180 g of apple', portion(A, 180).kcal === Math.round(apple[5] * 1.8));
t('a day sums its portions', sum([{ ...A, g: 100 }, { ...A, g: 50 }]).kcal === Math.round(apple[5]) + Math.round(apple[5] / 2));
const pts = [['2026-11-01', 84], ['2026-11-03', 83.6], ['2026-11-06', 83.9], ['2026-11-08', 83.1], ['2026-11-11', 82.9], ['2026-11-14', 82.5]].map(([day, kg]) => ({ day, kg }));
const tr = trend(pts);
t('the trend follows the weight but smooths the jumps', tr[0].trend === 84 && tr[5].trend < 84 && tr[5].trend > 82.5, JSON.stringify(tr.map((x) => x.trend)));
const r = rate(pts, '2026-11-14');
t('rate: about −0.7 kg a week', r < -0.5 && r > -1, r);
t('rate needs three weighings over six days', rate(pts.slice(0, 2), '2026-11-14') === null);
t('the goal date at that rate', eta(82.5, 70, r, '2026-11-14') > '2027-01-01' && eta(82.5, 70, r, '2026-11-14') < '2027-12-31', eta(82.5, 70, r, '2026-11-14'));
t('no goal date while gaining', eta(82.5, 70, 0.2, '2026-11-14') === null && eta(69, 70, 0.2, '2026-11-14') === '2026-11-14');
t('burnt: 5 MET, 80 kg, 30 min = 200 kcal', burnt(5, 80, 30) === 200);
t('days: there and back is the same day, across a month and a time change', ['2026-11-14', '2026-03-29', '2026-10-25', '2027-01-01'].every((d) => dayOf(dayNum(d)) === d) && dayOf(dayNum('2026-11-30') + 1) === '2026-12-01');

/* ---------- the food list ---------- */
const cats = new Set(CATS.map((c) => c.id)), ids = new Set();
const ALCOHOL = new Set(['Пиво світле', 'Вино червоне', 'Вино біле']);
const bad = [];
for (const f of FOODS) {
  const [id, uk, de, icon, cat, kcal, p, fat, c, por, aliases, flags] = f;
  if (ids.has(id)) bad.push('twice ' + id); ids.add(id);
  if (!uk || !de || typeof icon !== 'string' || !cats.has(cat)) bad.push('fields ' + uk);
  if (!(kcal >= 0 && kcal <= 900 && p >= 0 && fat >= 0 && c >= 0 && p + fat + c <= 101)) bad.push('numbers ' + uk);
  const est = 4 * p + 9 * fat + 4 * c;   // energy from the three; fibre and alcohol make the difference
  if (!ALCOHOL.has(uk) && uk !== 'Часник' && Math.abs(est - kcal) > Math.max(25, kcal * 0.2)) bad.push(`energy ${uk}: ${kcal} vs ${Math.round(est)}`);
  if (!Array.isArray(por) || !por.length || por.some(([w, g]) => !w || !(g > 0 && g <= 1000))) bad.push('portions ' + uk);
  if (typeof aliases !== 'string' || !['', 'l'].includes(flags)) bad.push('extra ' + uk);
}
t(`${FOODS.length} foods, each with sane numbers, an icon (or «невідомо»), portions`, FOODS.length >= 250 && !bad.length, bad.slice(0, 8).join('; '));
t('the everyday foods are there', ['Гречка варена', 'Борщ', 'Вареники з картоплею', 'Сирники', 'Сир кисломолочний знежирений (Magerquark)', 'Банан', 'Куряче філе, сире', 'Хліб житньо-пшеничний'].every((n) => FOODS.some((f) => f[1] === n)));
t('icons: most foods have one, the rest are «невідомо» on purpose', FOODS.filter((f) => f[3]).length > FOODS.length * 0.85);

/* ---------- the server ---------- */
const TOKEN = '123456:TEST-not-a-real-token';
function sign(user) {
  const fields = { query_id: 'AAH', user: JSON.stringify(user), auth_date: String(Math.floor(Date.now() / 1000)) };
  const dcs = Object.entries(fields).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  return new URLSearchParams({ ...fields, hash: createHmac('sha256', secret).update(dcs).digest('hex') }).toString();
}
const USER_A = { id: 4242, first_name: 'Іван' }, USER_B = { id: 5151, first_name: 'Ольга' }, OTHER = { id: 7777, first_name: 'Хтось' }, STRANGER = { id: 1, first_name: 'Чужий' };
const kv = new Map();
const SCANS = {
  async put(k, v) { kv.set(k, v); }, async get(k) { return kv.has(k) ? kv.get(k) : null; }, async delete(k) { kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
// Durable Object storage as Cloudflare offers it: get one or many, put, delete, list in key order with prefix/start/end/limit
function memStorage() {
  const m = new Map();
  return {
    m,
    async get(k) { if (Array.isArray(k)) { if (k.length > 128) throw new Error('get: at most 128 keys'); return new Map(k.filter((x) => m.has(x)).map((x) => [x, structuredClone(m.get(x))])); } return structuredClone(m.get(k)); },
    async put(k, v) { m.set(k, structuredClone(v)); }, async delete(k) { return m.delete(k); },
    async list({ prefix = '', start = '', end = null, limit = Infinity } = {}) {
      const keys = [...m.keys()].filter((k) => k.startsWith(prefix) && k >= start && (end === null || k < end)).sort().slice(0, limit);
      return new Map(keys.map((k) => [k, structuredClone(m.get(k))]));
    },
  };
}
const objects = new Map();
const FORMA = {
  idFromName: (n) => n,
  get(id) { if (!objects.has(id)) objects.set(id, new Forma({ storage: memStorage() })); const o = objects.get(id); return { fetch: (url, init) => o.fetch(new Request(url, init)) }; },
};
const lists = new Map();
const LISTS = { idFromName: (n) => n, get(id) { if (!lists.has(id)) { const m = new Map(); lists.set(id, new ShoppingList({ storage: { get: async (k) => structuredClone(m.get(k)), put: async (k, v) => { m.set(k, structuredClone(v)); } } })); } const o = lists.get(id); return { fetch: (url, init) => o.fetch(new Request(url, init)) }; } };
let heard = '';   // what the fake Whisper hears
const AI = { async run(model, input) { if (!/whisper/.test(model) || typeof input.audio !== 'string' || input.language !== 'uk') throw new Error('bad call'); return { text: heard }; } };
const env = { BOT_TOKEN: TOKEN, SCANS, FORMA, LISTS, AI, ALLOWED_USERS: '4242,5151,555,777,7777,8888,999,31337' };
const messages = [], docs = [];
let graph = null;   // what Cloudflare's analytics answers
globalThis.fetch = async (url, init) => {
  const u = new URL(String(url));
  if (u.hostname === 'api.telegram.org' && u.pathname.endsWith('/sendDocument')) { const f = init.body; const file = f.get('document'), head = new Uint8Array(await file.slice(0, 3).arrayBuffer()); docs.push({ chat: f.get('chat_id'), name: file.name, bom: head[0] === 0xEF && head[1] === 0xBB && head[2] === 0xBF, text: await file.text() }); return Response.json({ ok: true }); }
  if (u.hostname === 'api.telegram.org' && u.pathname.endsWith('/getFile')) return Response.json({ ok: true, result: { file_path: 'voice/file_1.oga' } });
  if (u.hostname === 'api.telegram.org' && u.pathname.includes('/file/bot')) return new Response(new Uint8Array(4000));
  if (u.hostname === 'api.telegram.org') { const m = JSON.parse(init.body); messages.push(m); return Response.json({ ok: true }); }
  if (u.hostname === 'api.cloudflare.com') { graph.calls++; return Response.json(graph.answer); }
  return new Response('unexpected', { status: 599 });
};
async function post(path, user, fields) {
  const fd = new FormData(); if (user) fd.append('initData', sign(user));
  for (const [k, v] of Object.entries(fields)) fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  const res = await worker.fetch(new Request('https://w.example' + path, { method: 'POST', body: fd }), env, { waitUntil() {} });
  return { status: res.status, body: await res.json().catch(() => null) };
}
const sync = (user, since, changes) => post('/forma', user, { action: 'sync', since: String(since), changes });

t('no sign-in: 401', (await post('/forma', null, { action: 'sync' })).status === 401);
t('not one of the family: 403', (await sync(STRANGER, 0, [])).status === 403);
t('GET: 405', (await worker.fetch(new Request('https://w.example/forma'), env, {})).status === 405);
t('unknown action: 400', (await post('/forma', USER_A, { action: 'x' })).status === 400);

const u0 = Date.parse('2026-11-14T08:00:00Z');
let a = await sync(USER_A, 0, [
  { k: 'p', id: 'me', u: u0, v: { ...man } },
  { k: 'w', id: '2026-11-14', u: u0, v: { kg: 97.2 } },
  { k: 'e', id: '2026-11-14~a1', u: u0, v: { n: 'Гречка', kcal: 100, g: 200, meal: 'l' } },
  { k: 'e', id: '2026-11-13~a2', u: u0, v: { n: 'Яблуко', kcal: 58, g: 180, meal: 's' } },
  { k: 'q', id: 'x', u: u0, v: {} },                                  // unknown kind
  { k: 'e', id: 'bad id!', u: u0, v: {} },                            // bad id
  { k: 'e', id: 'big', u: u0, v: { n: 'x'.repeat(7000) } },           // too big
]);
t('sync: the good changes are kept, the bad ones are not', a.status === 200 && a.body.seq === 4 && a.body.rows.length === 4, JSON.stringify(a.body));
let phone2 = await sync(USER_A, 0, []);
t('a second device gets everything', phone2.body.rows.length === 4 && phone2.body.rows.find((x) => x.k === 'w').v.kg === 97.2);
await sync(USER_A, 4, [{ k: 'w', id: '2026-11-14', u: u0 - 1000, v: { kg: 99 } }]);   // older: ignored
await sync(USER_A, 4, [{ k: 'e', id: '2026-11-13~a2', u: u0 + 1000, d: 1 }]);         // deleted
let after = await sync(USER_A, 4, []);
t('an older change loses, a deletion goes out as a deletion', after.body.rows.length === 1 && after.body.rows[0].d === 1 && after.body.rows[0].id === '2026-11-13~a2', JSON.stringify(after.body.rows));
t('the weight stayed the newer one', (await sync(USER_A, 0, [])).body.rows.find((x) => x.k === 'w').v.kg === 97.2);
t('each record once in the log: four records, four rows from zero', (await sync(USER_A, 0, [])).body.rows.length === 4);
t('another person sees none of it', (await sync(USER_B, 0, [])).body.rows.length === 0);
// pages
const many = Array.from({ length: 300 }, (_, i) => ({ k: 'f', id: 'f' + i, u: u0, v: { n: 'Продукт ' + i, kcal: 100 } }));
await sync(USER_A, 0, many); await sync(USER_A, 0, many.map((x) => ({ ...x, id: x.id + 'b' })));
const p1 = await sync(USER_A, 0, []);
const p2 = await sync(USER_A, p1.body.seq, []);
t('pages of 400: more, then the rest', p1.body.rows.length === 400 && p1.body.more && p2.body.rows.length === 204 && !p2.body.more, `${p1.body.rows.length} ${p1.body.more} ${p2.body.rows.length}`);
t('okChange: deletions need no value', okChange({ k: 'e', id: 'x', u: 1, d: 1 }) && !okChange({ k: 'e', id: 'x', u: 1 }));

/* ---------- partners ---------- */
await sync(USER_B, 0, [
  { k: 'p', id: 'me', u: u0, v: { ...woman } },
  { k: 'w', id: '2026-11-01', u: u0, v: { kg: 84 } }, { k: 'w', id: '2026-11-14', u: u0, v: { kg: 82.5 } },
  { k: 'e', id: '2026-11-14~m1', u: u0, v: { n: 'Сирники', kcal: 201, g: 150, meal: 'b' } },
  { k: 'x', id: '2026-11-14~w1', u: u0, v: { kind: 'w', min: 20 } },
]);
const inv = await post('/forma', USER_B, { action: 'invite' });
t('invite: a code of six', inv.status === 200 && /^[A-Z2-9]{6}$/.test(inv.body.code));
t('own code: refused', (await post('/forma', USER_B, { action: 'join', code: inv.body.code })).status === 409);
t('a wrong code: 404', (await post('/forma', USER_A, { action: 'join', code: 'ZZZZZZ' })).status === 404);
t('join with the code', (await post('/forma', USER_A, { action: 'join', code: inv.body.code.toLowerCase() })).status === 200);
const ms = await FORMA.get('u:5151').fetch('https://forma/', { method: 'POST', body: JSON.stringify({ op: 'summary', today: '2026-11-14' }) }).then((r) => r.json());
t('summary: the seven days end today', ms.days.length === 7 && ms.days[0].day === '2026-11-08' && ms.days[6].day === '2026-11-14' && ms.days[6].kcal === 302, JSON.stringify(ms.days));
const bs = await post('/forma', USER_A, { action: 'buddies' });
const mb = bs.body.buddies[0] || {};
t('the partner\'s progress: lost 1.5 kg, about a tenth of the way, a workout', mb.name === 'Ольга' && mb.lost === 1.5 && mb.toGo === 11 && mb.workouts === 1 && mb.logged === 1, JSON.stringify(mb));
t('…and never food or weight', !JSON.stringify(bs.body).includes('Сирники') && !JSON.stringify(bs.body).includes('82.5') && !('kg' in mb));
t('both ways', (await post('/forma', USER_B, { action: 'buddies' })).body.buddies[0].name === 'Іван');
t('partner view without a profile: nothing invented', JSON.stringify(partnerView(1, { name: '', start: null, goal: null, kg: null, target: null, days: [], workouts: [] })) === JSON.stringify({ id: 1, name: 'Без імені', lost: null, toGo: null, logged: 0, inTarget: null, workouts: 0, walks: 0, active: null }));
for (const u of [555, 777, 7777, 8888]) { const c = (await post('/forma', { id: u, first_name: 'X' }, { action: 'invite' })).body.code; await post('/forma', USER_A, { action: 'join', code: c }); }
t('at most four partners', JSON.parse(kv.get('fb:4242')).length === 4, kv.get('fb:4242'));
t('leaving works both ways', (await post('/forma', USER_A, { action: 'leave', id: '5151' })).status === 200 && !JSON.parse(kv.get('fb:4242')).includes(5151) && !JSON.parse(kv.get('fb:5151')).includes(4242));

/* ---------- reminders ---------- */
messages.length = 0;
const on = await post('/reminders', USER_B, { kind: 'sport', action: 'on', days: '0,2,4,9', time: '17:30', next: 'Тренування A: ноги', mins: '22' });
t('sport reminders on: confirmed in the chat with the days', on.body.on && messages.length === 1 && messages[0].text.includes('пн, ср, пт о 17:30') && messages[0].reply_markup.inline_keyboard[0][0].web_app.url.endsWith('sport/'), JSON.stringify(messages));
t('…kept with the person\'s id', JSON.parse(kv.get('tsub:5151')).id === 5151 && JSON.parse(kv.get('tsub:5151')).days.join() === '0,2,4');
await post('/reminders', USER_B, { kind: 'yizha', action: 'on', time: '20:00' });
await post('/reminders', USER_B, { kind: 'vaga', action: 'on', time: '07:30', wd: '0' });
await post('/reminders', USER_A, { kind: 'yizha', action: 'on', time: '20:00' });
messages.length = 0;
await post('/reminders', USER_B, { kind: 'zaryadka', action: 'on', time: '07:00' });
t('morning routine reminder on: confirmed, the button opens the routine', messages.length === 1 && messages[0].text.includes('ранкову зарядку') && messages[0].text.includes('07:00') && messages[0].reply_markup.inline_keyboard[0][0].web_app.url.endsWith('sport/?quick=morning'), JSON.stringify(messages));
const st = await post('/reminders', USER_B, { kind: 'vaga', action: 'status' });
t('status gives the saved time and weekday', st.body.on && st.body.time === '07:30' && st.body.wd === 0);
async function cron(iso) {
  const jobs = []; messages.length = 0;
  await worker.scheduled({ scheduledTime: Date.parse(iso), cron: '*/30 * * * *' }, env, { waitUntil: (p) => jobs.push(p) });
  await Promise.all(jobs); return messages.slice();
}
// Saturday 14 Nov 2026: no workout day for USER_B (Mon/Wed/Fri)
let got = await cron('2026-11-14T16:30:00Z');   // 17:30 Berlin
t('no workout reminder on a rest day', !got.some((x) => x.text.includes('тренування')));
got = await cron('2026-11-14T19:00:00Z');       // 20:00 Berlin
const bMeal = got.find((x) => x.chat_id === 5151), aMeal = got.find((x) => x.chat_id === 4242);
t('meal reminder: what is written down today and what is left', bMeal && bMeal.text.includes('302 ккал з ') && bMeal.text.includes('лишається'), JSON.stringify(got));
t('…for each person their own day', aMeal && aMeal.text.includes('200 ккал'), JSON.stringify(aMeal));
t('…once a day', (await cron('2026-11-14T19:30:00Z')).filter((x) => x.text.startsWith('🍽')).length === 0);
// Monday 16 Nov: workout day and weighing day
got = await cron('2026-11-16T06:00:00Z');       // 07:00 Berlin
t('the morning routine reminder at its time', got.some((x) => x.chat_id === 5151 && x.text.startsWith('🌅')), JSON.stringify(got));
got = await cron('2026-11-16T06:30:00Z');       // 07:30 Berlin
t('…once', !got.some((x) => x.text.startsWith('🌅')));
t('weighing reminder on the chosen weekday', got.some((x) => x.chat_id === 5151 && x.text.startsWith('⚖️')));
got = await cron('2026-11-16T16:30:00Z');
t('workout reminder names the workout', got.some((x) => x.chat_id === 5151 && x.text.includes('«Тренування A: ноги»') && x.text.includes('22 хв')), JSON.stringify(got));
t('a missed half hour is caught up once', (await cron('2026-11-16T17:00:00Z')).filter((x) => x.text.startsWith('💪')).length === 0);
t('quiet when already trained / weighed today', sportText({}, { workouts: [{ day: '2026-11-16', kind: 'w' }] }, '2026-11-16') === null && weighText({ weighed: '2026-11-16' }, '2026-11-16') === null);
t('quiet when the morning routine is done; a back session does not count', morningText({ workouts: [{ day: 'd', kind: 'z', q: 'morning' }] }, 'd') === null && morningText({ workouts: [{ day: 'd', kind: 'z', q: 'back' }] }, 'd') !== null);
t('quiet when the day is written down and within the target', mealText({ target: 1500, days: [{ day: 'd', kcal: 1300, n: 4 }] }, 'd') === null);
t('a day over the target: kind words', mealText({ target: 1500, days: [{ day: 'd', kcal: 1800, n: 4 }] }, 'd').includes('на 300 більше'));

/* ---------- a copy of one's data ---------- */
docs.length = 0;
const ex = await post('/forma', USER_B, { action: 'export' });
t('export: two files to the person\'s own chat', ex.status === 200 && docs.length === 2 && docs.every((d) => d.chat === '5151'), JSON.stringify(ex.body));
const copy = JSON.parse(docs[0].text);
t('…a copy with every record (profile, weights, food, workout)', copy.kind === 'forma' && ['p', 'w', 'e', 'x'].every((k) => copy.rows.some((r) => r.k === k)) && copy.rows.every((r) => r.u > 0));
t('…and a table: BOM, semicolons, a food line with kcal', docs[1].bom && docs[1].text.startsWith('Дата;Що;') && /2026-11-14;їжа;Сирники;150 г;302;/.test(docs[1].text), docs[1].text.slice(0, 300));

/* ---------- errors on the phones ---------- */
const ORIGIN_OK = 'https://w2unemdhysend.github.io';
async function rep(body, origin = ORIGIN_OK) {
  const res = await worker.fetch(new Request('https://w.example/report', { method: 'POST', headers: origin ? { Origin: origin } : {}, body: JSON.stringify(body) }), env, {});
  return res.status;
}
t('a report from elsewhere: 403', (await rep({ p: 'x', m: 'boom' }, 'https://evil.example')) === 403);
t('a report without a message: 400', (await rep({ p: 'x' })) === 400);
t('a report: 204', (await rep({ p: 'yizha/', m: 'TypeError: x is undefined for user 4242424242 mail me@example.com', s: 'app.js?v=1:10:5', t: 'Telegram android', v: 'abc' })) === 204);
for (let i = 0; i < 3; i++) await rep({ p: 'yizha/', m: 'TypeError: x is undefined for user 4242424242 mail me@example.com', s: 'app.js?v=1:10:5', t: 'Telegram android' });
for (let i = 0; i < 7; i++) await rep({ p: 'sport/', m: 'Error number ' + 'abcdefg'[i], s: 'app.js:1' });
const errKeys = [...kv.keys()].filter((k) => k.startsWith('cerr:'));
t('each error kept once, numbers and addresses blanked', errKeys.length === 8 && [...kv.entries()].filter(([k]) => k.startsWith('cerr:')).every(([, v]) => !/4242424242|me@example/.test(v)), String(errKeys.length));
kv.set('asub:5151', JSON.stringify({ id: 5151 }));
// reports are kept under the real day (Berlin), so the cron runs on today
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
let got2 = await cron(`${TODAY}T10:00:00Z`);
const bugs = got2.filter((m) => m.text.startsWith('🐞'));
t('the cron tells about new errors, at most five a day', bugs.length === 5 && bugs[0].text.includes('«yizha/»') && bugs[0].text.includes('Telegram android'), JSON.stringify(bugs.map((b) => b.text.slice(0, 60))));
got2 = await cron(`${TODAY}T10:30:00Z`);
t('…and not again', !got2.some((m) => m.text.startsWith('🐞')));

/* ---------- the free plan ---------- */
const { noteNeurons, usageNotes } = await import('../worker/usage.js');
await noteNeurons(env, { neurons: 7000 }); await noteNeurons(env, { neurons: 1200.5 });
graph = { calls: 0, answer: { data: { viewer: { accounts: [{ workers: [{ sum: { requests: 20000 } }], durable: [{ sum: { requests: 100 } }], kv: [{ sum: { requests: 850 }, dimensions: { actionType: 'write' } }, { sum: { requests: 900 }, dimensions: { actionType: 'read' } }] }] } } } };
const today = new Date().toISOString().slice(0, 10);
let notes = await usageNotes(env, new Date(today + 'T09:10:00Z'));
t('without a token: only Workers AI is watched (82 %)', graph.calls === 0 && notes.length === 1 && notes[0].includes('82 %') && notes[0].includes('нейронів'), JSON.stringify(notes));
const env2 = { ...env, CF_API_TOKEN: 'x', CF_ACCOUNT_ID: 'acc' };
notes = await usageNotes(env2, new Date(today + 'T10:10:00Z'));
t('with a token: KV writes at 85 % are reported, AI not again, the rest is fine', graph.calls === 1 && notes.length === 1 && notes[0].includes('85 %') && notes[0].includes('записів KV'), JSON.stringify(notes));
t('…only once an hour (at :00–:29)', (await usageNotes(env2, new Date(today + 'T10:40:00Z'))).length === 0 && graph.calls === 1);
graph.answer = { errors: [{ message: 'not authorized' }] };
t('a bad token: no crash, nothing said', (await usageNotes(env2, new Date(today + 'T11:10:00Z'))).length === 0);

/* ---------- the diary from the chat ---------- */
const { answer } = await import('../worker/brief.js');
const at = new Date('2026-11-14T12:30:00Z');   // 13:30 in Xanten: lunch
const say = async (text, who = 5151) => (await answer(env, text, who, at)).text;
const entriesOf = async (who) => (await FORMA.get('u:' + who).fetch('https://forma/', { method: 'POST', body: JSON.stringify({ op: 'week', today: '2026-11-14' }) }).then((r) => r.json())).entries.filter((e) => e.id.startsWith('2026-11-14'));
let r1 = await say('/їжа гречка варена 200');
let es = await entriesOf(5151);
t('/їжа гречка 200: into the diary as lunch, with the day so far', r1.includes('Гречка варена, 200 г — 178 ккал (обід)') && r1.includes('Сьогодні: ') && es.some((e) => e.n === 'Гречка варена' && e.g === 200 && e.meal === 'l'), r1);
r1 = await say('/їжа 2 яйця');
t('/їжа 2 яйця: two portions of an egg', r1.includes('Яйце') && r1.includes('110 г'), r1);
r1 = await say('/їжа борщ тарілка');
t('/їжа борщ тарілка: the portion named', r1.includes('Борщ, 350 г'), r1);
r1 = await say('/kcal скір 150 г');
t('/kcal works the same, units after the number', r1.includes('Скір, 150 г'), r1);
r1 = await say('/їжа щось незрозуміле');
t('nothing found: says so and offers the app', r1.includes('Не знайшов'), r1);
r1 = await say('/скасувати');
es = await entriesOf(5151);
t('/скасувати takes back the last one (the skyr)', r1.includes('Прибрано') && !es.some((e) => e.n === 'Скір'), r1);
r1 = await say('/вага 82,1');
t('/вага: today\'s weight with the change from the start', r1.includes('82,1 кг') && r1.includes('Від старту: −1,9 кг'), r1);
r1 = await say('/вода'); r1 = await say('/вода 500'); r1 = await say('/вода 1,5 л');
const dd = await FORMA.get('u:5151').fetch('https://forma/', { method: 'POST', body: JSON.stringify({ op: 'get', k: 'd', id: '2026-11-14' }) }).then((r) => r.json());
t('/вода: a glass, 500 ml, 1.5 l add up', dd.v && dd.v.water === 2250 && r1.includes('вода 2,25'), r1 + JSON.stringify(dd));
r1 = await say('/день');
t('/день: calories, water', r1.startsWith('Сьогодні: ') && r1.includes('ккал') && r1.includes('вода'), r1);
t('/help names the diary commands', (await say('/help')).includes('/їжа гречка 200'));
t('other commands still work', (await answer(env, '/wort', 5151, at)).text.length > 10);

/* ---------- the Sunday report ---------- */
messages.length = 0;
await post('/reminders', USER_B, { kind: 'zvit', action: 'on', time: '19:00' });
t('weekly report on: confirmed', messages.some((m) => m.text.startsWith('Звіт тижня увімкнено')));
kv.set('fb:5151', JSON.stringify([4242])); kv.set('fb:4242', JSON.stringify([5151]));
got = await cron('2026-11-15T18:00:00Z');   // Sunday 19:00 in Xanten
const wk = got.find((m) => m.text.startsWith('📊'));
t('Sunday: the week — weight change, days, workouts, water, partners', wk && wk.text.includes('Вага: 82,1 кг') && wk.text.includes('Тренувань') && wk.text.includes('Вода') && wk.text.includes('Разом') && wk.text.includes('Іван'), wk && wk.text);
t('…once', !(await cron('2026-11-15T18:30:00Z')).some((m) => m.text.startsWith('📊')));
t('…not on other days', !(await cron('2026-11-14T18:00:00Z')).some((m) => m.text.startsWith('📊')));

/* ---------- by voice ---------- */
const { itemsOf, diaryCommand } = await import('../worker/voice.js');
t('voice: things to buy out of a sentence', JSON.stringify(itemsOf('Додай, будь ласка, молоко, хліб і десяток яєць.')) === '["Молоко","Хліб","Десяток яєць"]' && JSON.stringify(itemsOf('купити картоплю та цибулю')) === '["Картоплю","Цибулю"]');
t('voice: the diary from a sentence', diaryCommand('З’їла гречку 200 грам') === '/їжа гречку 200 г' && diaryCommand('вага 111,4') === '/вага 111,4' && diaryCommand('випив 500 мілілітрів води') === '/вода 500 мл' && diaryCommand('молоко й хліб') === null);
async function voicePost(user, bytes = 4000) {
  const fd = new FormData(); fd.append('initData', sign(user)); fd.append('audio', new File([new Uint8Array(bytes)], 'v.webm', { type: 'audio/webm' }));
  const res = await worker.fetch(new Request('https://w.example/voice', { method: 'POST', body: fd }), env, {});
  return { status: res.status, body: await res.json() };
}
heard = 'Додай молоко, хліб і яйця.';
let vr = await voicePost(USER_A);
t('POST /voice: the text and the items', vr.status === 200 && vr.body.items.join() === 'Молоко,Хліб,Яйця' && vr.body.text === heard, JSON.stringify(vr.body));
t('POST /voice: no sign-in → 401', (await worker.fetch(new Request('https://w.example/voice', { method: 'POST', body: new FormData() }), env, {})).status === 401);
{ const fd = new FormData(); fd.append('initData', sign(USER_A)); t('POST /voice: no recording → 400', (await worker.fetch(new Request('https://w.example/voice', { method: 'POST', body: fd }), env, {})).status === 400); }
t('POST /voice: too big → 413', (await voicePost(USER_A, 3 * 1024 * 1024)).status === 413);
// a voice message to the bot
const hook = async (from, voice) => {
  const { hookSecret } = await import('../worker/brief.js');
  const res = await worker.fetch(new Request('https://w.example/tg', { method: 'POST', headers: { 'X-Telegram-Bot-Api-Secret-Token': await hookSecret(TOKEN), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { chat: { id: from.id, type: 'private' }, from: { ...from, is_bot: false }, voice } }) }), env, { waitUntil() {} });
  return res.status;
};
messages.length = 0; heard = 'Додай сир, ковбасу й помідори';
await hook(USER_A, { file_id: 'f1', duration: 4 });
const listMsg = messages.find((m) => m.text.includes('Додав у список'));
const listId = kv.get('lm:4242'), listGet = await LISTS.get(listId).fetch('https://list/', { method: 'POST', body: JSON.stringify({ op: 'get', user: { id: 4242, name: 'Іван' } }) }).then((r) => r.json());
t('a voice message: things go into the person\'s shopping list', listMsg && listMsg.text.includes('Сир, Ковбасу, Помідори') && listGet.items.map((x) => x.t).join() === 'Сир,Ковбасу,Помідори', JSON.stringify(listGet.items));
messages.length = 0; heard = 'З’їв гречку варену 150 грам';
await hook(USER_A, { file_id: 'f2', duration: 3 });
t('a voice message about food goes into the diary', messages.some((m) => m.text.includes('🎙') && m.text.includes('Гречка варена, 150 г')), JSON.stringify(messages.map((m) => m.text.slice(0, 80))));
messages.length = 0;
await hook(USER_A, { file_id: 'f3', duration: 200 });
t('a voice message over a minute: asked to keep it short', messages.some((m) => m.text.includes('до хвилини')));

/* ---------- the step counter app ---------- */
{
  const { berlinDay } = await import('../smittia/due.js');
  const { cleanDays } = await import('../worker/steps.js');
  const today = berlinDay(new Date()), dayAt = (n) => new Date(Date.parse(today + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
  const app = async (path, body, token, ip = '1.2.3.4') => {
    const res = await worker.fetch(new Request('https://w.example' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) }), env, { waitUntil() {} });
    return { status: res.status, body: await res.json().catch(() => null) };
  };
  const c = await post('/forma', USER_B, { action: 'stepcode' });
  t('step counter: a code of 8 letters for 15 minutes', c.status === 200 && /^[A-Z2-9]{8}$/.test(c.body.code) && c.body.ttl === 900, JSON.stringify(c.body));
  t('…a wrong code: 404', (await app('/steps/pair', { code: 'AAAAAAAA', device: 'X' })).status === 404);
  const p1 = await app('/steps/pair', { code: c.body.code.toLowerCase().replace(/(....)/, '$1-'), device: 'Nothing Phone (2a)' });
  t('…pairing with the code (any case, a dash): a token for the phone', p1.status === 200 && p1.body.token.length >= 40 && p1.body.name === 'Ольга', JSON.stringify(p1.body));
  t('…the code works once', (await app('/steps/pair', { code: c.body.code, device: 'X' })).status === 404);
  t('…only the token\'s hash is kept', ![...kv.values()].some((v) => String(v).includes(p1.body.token)));
  t('steps without a token: 401', (await app('/steps', { days: [] })).status === 401 && (await app('/steps', { days: [] }, 'x'.repeat(43))).status === 401);
  const s1 = await app('/steps', { days: [{ day: dayAt(-1), steps: 8123 }, { day: today, steps: 4210.6 }, { day: dayAt(3), steps: 5 }, { day: dayAt(-30), steps: 5 }, { day: today, steps: 1 }, { day: 'x', steps: 2 }, { day: dayAt(-2), steps: -4 }, { day: dayAt(-3), steps: 999999 }, { day: dayAt(-4), steps: 0 }], app: '1.0' }, p1.body.token);
  t('…the steps of yesterday and today saved; the future, old days, nonsense and empty new days left out', s1.status === 200 && s1.body.saved === 2, JSON.stringify(s1.body));
  const rowsB = (await sync(USER_B, 0, [])).body.rows.filter((r) => r.k === 'd');
  const dToday = rowsB.find((r) => r.id === today), dYest = rowsB.find((r) => r.id === dayAt(-1));
  t('…in the day records the pages sync, marked as from the phone', dToday && dToday.v.steps === 4211 && dToday.v.stepsSrc === 'phone' && dYest && dYest.v.steps === 8123, JSON.stringify(rowsB));
  // the page wrote water today before the phone's number arrived: the phone keeps the water and adds its steps
  await sync(USER_B, 0, [{ k: 'd', id: dayAt(-5), u: Date.now() - 1000, v: { water: 750, steps: 3000 } }]);
  await app('/steps', { days: [{ day: dayAt(-5), steps: 6400 }] }, p1.body.token);
  const d5 = (await sync(USER_B, 0, [])).body.rows.find((r) => r.k === 'd' && r.id === dayAt(-5));
  t('…a day with water from the page: the water stays, the phone\'s steps replace the typed ones', d5.v.water === 750 && d5.v.steps === 6400, JSON.stringify(d5));
  const same = await app('/steps', { days: [{ day: dayAt(-5), steps: 6400 }] }, p1.body.token);
  t('…the same number again changes nothing', same.body.saved === 0);
  const devs = await post('/forma', USER_B, { action: 'stepdevices' });
  t('the page lists the phone: name, last sent, today\'s steps', devs.body.devices.length === 1 && devs.body.devices[0].name === 'Nothing Phone (2a)' && devs.body.devices[0].last > 0, JSON.stringify(devs.body));
  t('another person sees no phone of hers', (await post('/forma', USER_A, { action: 'stepdevices' })).body.devices.length === 0);
  const un = await post('/forma', USER_B, { action: 'stepunlink', dev: devs.body.devices[0].dev });
  t('unpairing: the list is empty, the token stops working', un.body.devices.length === 0 && (await app('/steps', { days: [{ day: today, steps: 5000 }] }, p1.body.token)).status === 401);
  const toks = [];
  for (let i = 0; i < 4; i++) { const cc = (await post('/forma', USER_B, { action: 'stepcode' })).body.code; toks.push((await app('/steps/pair', { code: cc, device: 'Phone ' + i })).body.token); }
  const after = (await post('/forma', USER_B, { action: 'stepdevices' })).body.devices.map((d) => d.name);
  t('at most three phones: the oldest is unpaired', after.join() === 'Phone 1,Phone 2,Phone 3' && (await app('/steps', { days: [] }, toks[0])).status === 401 && (await app('/steps', { days: [] }, toks[3])).status === 200, after.join());
  t('cleanDays: sorted, one per day', JSON.stringify(cleanDays([{ day: today, steps: 2 }, { day: dayAt(-1), steps: 1 }], today)) === JSON.stringify([{ day: dayAt(-1), steps: 1 }, { day: today, steps: 2 }]));
}

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
