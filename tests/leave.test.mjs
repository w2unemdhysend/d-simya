// «Час виходити»: the plans a page sends, the connection chosen, the message and when it goes out.
//   node tests/leave.test.mjs
import { leavePrefs, leaveConfirm, pick, leaveText, sendLeave, PREFIX } from '../worker/leave.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const form = (o) => ({ get: (k) => (k in o ? o[k] : null) });
const A = 'de:05170:37032', B = 'de:05170:37099';

/* ---------- the plans ---------- */
const p = leavePrefs(form({ plans: JSON.stringify([
  { from: A, fromName: 'Xanten Bahnhof', to: B, toName: 'Wesel Bahnhof', by: '09:00', days: [0, 1, 2, 3, 4, 9], walk: 7, dt: true },
  { from: A, to: A, by: '10:00' }, { from: 'x', to: B, by: '10:00' }, { from: A, to: B, by: '25:00' },
  { from: B, to: A, by: '17:30', walk: 999 }, { from: B, to: A, by: '18:00' }, { from: B, to: A, by: '19:00' },
]) }));
t('plans: the broken ones are left out, at most three kept, days and walk within bounds', p && p.plans.length === 3 && p.plans[0].by === '09:00' && p.plans[0].days.join() === '0,1,2,3,4' && p.plans[0].walk === 7 && p.plans[1].walk === 60, JSON.stringify(p));
const p3 = leavePrefs(form({ plans: JSON.stringify([1, 2, 3, 4].map((i) => ({ from: A, to: B, by: `0${i}:00` }))) }));
t('plans: at most three', p3.plans.length === 3);
t('plans: nothing usable → null', leavePrefs(form({ plans: '[]' })) === null && leavePrefs(form({ plans: 'not json' })) === null);
t('plans: a walk of 999 minutes is cut to an hour', leavePrefs(form({ plans: JSON.stringify([{ from: B, to: A, by: '17:30', walk: 999 }]) })).plans[0].walk === 60);
const conf = leaveConfirm({ plans: [p.plans[0]] });
t('confirmation: the route, the time, weekdays, the walk', conf.includes('Xanten Bahnhof → Wesel Bahnhof') && conf.includes('до 09:00') && conf.includes('у будні') && conf.includes('7 хв'), conf);

/* ---------- the connection and the message ---------- */
const leg = (dep, arr, o = {}) => ({ walk: false, mode: 'train', line: 'RE 44', dir: 'Duisburg', long: false, gone: false,
  from: { name: 'Xanten Bahnhof', plan: dep, est: o.est || null, plat: '1' }, to: { name: 'Wesel Bahnhof', plan: arr, est: null }, ...o.leg });
const tripOf = (dep, arr, o = {}) => ({ dep, depEst: o.est || null, arr, arrEst: null, changes: 0, legs: [leg(dep, arr, o)] });
const trips = [tripOf('2026-11-16T07:19:00Z', '2026-11-16T07:47:00Z'), tripOf('2026-11-16T06:49:00Z', '2026-11-16T07:17:00Z'),
  tripOf('2026-11-16T07:35:00Z', '2026-11-16T08:05:00Z'), tripOf('2026-11-16T07:25:00Z', '2026-11-16T07:55:00Z', { leg: { gone: true } })];
const by = Date.parse('2026-11-16T08:00:00Z');   // 09:00 in Xanten
const best = pick(trips, by);
t('the connection: the latest that arrives in time, not a cancelled one', best && best.dep === '2026-11-16T07:19:00Z', JSON.stringify(best && best.dep));
t('no connection in time → null', pick([trips[2]], by) === null);
const plan = p.plans[0];
// at 07:30 in Xanten (06:30Z): leave at 08:12 (07:19 − 7 min) is 42 minutes away: the next run writes
t('too early: nothing yet', leaveText(plan, best, Date.parse('2026-11-16T06:30:00Z')) === null);
const msg = leaveText(plan, best, Date.parse('2026-11-16T07:00:00Z'));
t('the message: when to leave, how many minutes, the line, the arrival', msg && msg.includes('о 08:12, через 12 хв') && msg.includes('RE 44') && msg.includes('о 08:19') && msg.includes('Прибуття о 08:47') && msg.includes('до 09:00') && msg.includes('7 хв пішки'), msg);
const lateTrip = tripOf('2026-11-16T07:19:00Z', '2026-11-16T07:47:00Z', { est: '2026-11-16T07:24:00Z' });
const lateMsg = leaveText(plan, lateTrip, Date.parse('2026-11-16T07:00:00Z'));
t('a delay is counted in: leave later, and it says so', lateMsg.includes('о 08:17') && lateMsg.includes('запізнюється на 5 хв'), lateMsg);
t('a leave time long gone: nothing', leaveText(plan, best, Date.parse('2026-11-16T07:30:00Z')) === null);

/* ---------- the cron job ---------- */
const kv = new Map();
const SCANS = {
  async put(k, v) { kv.set(k, v); }, async get(k) { return kv.has(k) ? kv.get(k) : null; }, async delete(k) { kv.delete(k); },
  async list({ prefix }) { return { keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
};
const env = { SCANS, BOT_TOKEN: 'x', ALLOWED_USERS: '4242' };
kv.set(PREFIX + '4242', JSON.stringify({ id: 4242, name: 'Іван', plans: [p.plans[0]] }));
const sent = [], asked = [];
const out = { async send(id, text) { sent.push({ id, text }); return { ok: true }; } };
const trip = async (...a) => { asked.push(a); return { trips }; };
let r = await sendLeave(env, new Date('2026-11-14T07:00:00Z'), out, trip);   // Saturday
t('not on a day without the plan', r.sent === 0 && !asked.length);
r = await sendLeave(env, new Date('2026-11-16T03:00:00Z'), out, trip);       // Monday 04:00: five hours before
t('not more than three hours before', r.sent === 0 && !asked.length);
r = await sendLeave(env, new Date('2026-11-16T06:30:00Z'), out, trip);       // 07:30: asks, too early to write
t('in the window: the trip is asked for arrival by 09:00, D-ticket only', asked.length === 1 && asked[0][2] === '2026-11-16T09:00' && asked[0][3] === false && asked[0][5] === true && r.sent === 0, JSON.stringify(asked));
r = await sendLeave(env, new Date('2026-11-16T07:00:00Z'), out, trip);       // 08:00: leave at 08:12
t('the run before leaving writes', r.sent === 1 && sent[0].id === 4242 && sent[0].text.includes('через 12 хв'), JSON.stringify(sent));
r = await sendLeave(env, new Date('2026-11-16T07:02:00Z'), out, trip);
t('…once', r.sent === 0 && sent.length === 1);
kv.delete('go:4242:2026-11-16:0'); sent.length = 0;
r = await sendLeave(env, new Date('2026-11-16T07:00:00Z'), out, async () => ({ trips: [trips[2]] }));
t('no connection in time, an hour before: a warning', r.sent === 1 && sent[0].text.startsWith('⚠️') && sent[0].text.includes('Маршрут'), JSON.stringify(sent));
kv.set(PREFIX + '7777', JSON.stringify({ id: 7777, plans: [p.plans[0]] }));
kv.set('ok:7777', 'nobody');
kv.delete('go:4242:2026-11-16:0');
await sendLeave(env, new Date('2026-11-16T07:00:00Z'), out, trip);
t('someone not allowed loses the subscription', !kv.has(PREFIX + '7777'));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
