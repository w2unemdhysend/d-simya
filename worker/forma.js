// «Харчування» and «Тренування» on the server: each person's records, partners who see each other's progress, and the
// bot's reminders for meals, weighing and workouts.
//
//   POST /forma  (signed initData)
//     action=sync     since (the last change number the phone has), changes (JSON [{k, id, u, d, v}]) → the changes
//                     after `since`, the newest number, more (another page is waiting). See yizha/store.js.
//     action=invite   a code (6 letters, 24 hours) for someone to become a partner
//     action=join     code → the two are partners (at most 4 each)
//     action=leave    id → no longer partners, both ways
//     action=buddies  each partner's progress: kg lost since the start, how close to the goal, days within the target
//                     this week, workouts this week. Never what they ate and never their weight itself.
//
// One Durable Object per person (class Forma, binding FORMA) keeps the records: r:<k>|<id> → {u, d, v, s} and a log
// s:<number> → <k>|<id> of the last change of each record, so a phone asks only for what changed since it last asked.
// The newer change (u, the phone's clock) wins. KV: fb:<id> → [partner ids] · finv:<CODE> → id (24 hours).
// Reminders (POST /reminders, kinds sport, yizha, vaga in send-scan.js) are kept as tsub:, msub:, vsub:<id>.

import { berlinDay } from '../smittia/due.js';
import { target, valid, dayNum, dayOf } from '../yizha/calc.js';
import { button } from './config.js';
import { deliver, berlinClock } from './deliver.js';
import { allowedId } from './access.js';

const KINDS = new Set(['p', 'w', 'e', 'f', 'r', 'x', 's', 'd', 'n']);   // … d|<day> water, sleep, steps, measures · n|<id> meal plan
const ID = /^[\w~.:-]{1,80}$/;
const MAX_V = 6000, MAX_CHANGES = 300, MAX_RECS = 40000, PAGE = 400, MAX_BUDDIES = 4;
const pad = (n) => String(n).padStart(12, '0');
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

// a change from a phone that can be kept
export function okChange(c) {
  if (!c || !KINDS.has(c.k) || !ID.test(String(c.id)) || !Number.isFinite(c.u) || c.u <= 0) return false;
  if (c.d) return true;
  if (c.v == null || typeof c.v !== 'object') return false;
  try { return JSON.stringify(c.v).length <= MAX_V; } catch { return false; }
}

async function getMany(s, keys) {
  const out = new Map();
  for (let i = 0; i < keys.length; i += 128) for (const [k, v] of await s.get(keys.slice(i, i + 128))) out.set(k, v);
  return out;
}
const eaten = (v) => Math.round((Number(v.kcal) || 0) * (Number(v.g) || 0) / 100);

export class Forma {
  constructor(state) { this.state = state; this.s = state.storage; }

  async fetch(request) {
    const a = await request.json();
    if (a.op === 'sync') return Response.json(await this.sync(a));
    if (a.op === 'summary') return Response.json(await this.summary(a.today));
    if (a.op === 'dump') return Response.json(await this.dump());
    if (a.op === 'get') { const r = await this.s.get(`r:${a.k}|${a.id}`); return Response.json(r && !r.d ? { v: r.v, u: r.u } : {}); }
    if (a.op === 'mine') return Response.json(await this.mine());
    if (a.op === 'week') return Response.json(await this.week(a.today));
    return Response.json({ error: 'op' }, { status: 400 });
  }

  async sync({ since = 0, changes = [], name = '' }) {
    const s = this.s;
    let seq = (await s.get('seq')) || 0, count = (await s.get('count')) || 0;
    const list = (Array.isArray(changes) ? changes : []).slice(0, MAX_CHANGES).filter(okChange);
    const old = await getMany(s, list.map((c) => `r:${c.k}|${c.id}`));
    for (const c of list) {
      const key = `r:${c.k}|${c.id}`, was = old.get(key);
      if (was && was.u > c.u) continue;
      if (!was) { if (count >= MAX_RECS) continue; count++; }
      seq++;
      if (was) await s.delete('s:' + pad(was.s));
      const rec = { u: c.u, d: c.d ? 1 : 0, v: c.d ? null : c.v, s: seq };
      await s.put(key, rec); await s.put('s:' + pad(seq), `${c.k}|${c.id}`);
      old.set(key, rec);
    }
    await s.put('seq', seq); await s.put('count', count);
    if (name && (await s.get('name')) !== name) await s.put('name', clip(name, 40));
    const log = await s.list({ prefix: 's:', start: 's:' + pad(Number(since) + 1), limit: PAGE });
    const keys = [...log.values()], recs = await getMany(s, keys.map((k) => 'r:' + k));
    const rows = [];
    for (const k of keys) {
      const r = recs.get('r:' + k); if (!r) continue;
      const i = k.indexOf('|');
      rows.push({ k: k.slice(0, i), id: k.slice(i + 1), u: r.u, ...(r.d ? { d: 1 } : { v: r.v }) });
    }
    const more = log.size === PAGE;
    return { seq: more ? Number([...log.keys()].pop().slice(2)) : seq, rows, more };
  }

  // Every live record, for a copy the person keeps (action=export)
  async dump() {
    const rows = [];
    for (const [k, r] of await this.s.list({ prefix: 'r:' })) {
      if (!r || r.d) continue;
      const i = k.indexOf('|');
      rows.push({ k: k.slice(2, i), id: k.slice(i + 1), u: r.u, v: r.v });
    }
    return { rows };
  }

  // Own foods and dishes, for the chat (/їжа finds them too)
  async mine() {
    const rows = [];
    for (const prefix of ['r:f|', 'r:r|']) for (const [k, r] of await this.s.list({ prefix })) if (r && !r.d) rows.push({ id: k.slice(4), ...r.v, src: prefix === 'r:r|' ? 'recipe' : r.v.src || 'my' });
    return { foods: rows };
  }

  // Everything the Sunday report and the streaks need: two months of food, all weights and workouts, a week of the day
  // records, the profile and the workout days
  async week(today) {
    const s = this.s, day = /^\d{4}-\d{2}-\d{2}$/.test(today || '') ? today : berlinDay(new Date()), n = dayNum(day), next = dayOf(n + 1);
    const live = (m) => [...m.entries()].filter(([, r]) => r && !r.d);
    const entries = live(await s.list({ start: 'r:e|' + dayOf(n - 62), end: 'r:e|' + next })).map(([k, r]) => ({ id: k.slice(4), ...r.v }));
    const weights = live(await s.list({ prefix: 'r:w|' })).map(([k, r]) => ({ day: k.slice(4), kg: Number(r.v.kg) })).filter((w) => w.kg > 0);
    const moves = live(await s.list({ prefix: 'r:x|' })).map(([k, r]) => ({ id: k.slice(4), ...r.v }));
    const days = Object.fromEntries(live(await s.list({ start: 'r:d|' + dayOf(n - 6), end: 'r:d|' + next })).map(([k, r]) => [k.slice(4), r.v]));
    const prof = ((await s.get('r:p|me')) || {}).v || null, sport = ((await s.get('r:s|sport')) || {}).v || null;
    return { today: day, name: (await s.get('name')) || '', profile: prof, entries, weights, moves, days, planDays: sport && Array.isArray(sport.days) ? sport.days.length : 3 };
  }

  // What partners and the bot need to know about the week up to `today`
  async summary(today) {
    const s = this.s, day = /^\d{4}-\d{2}-\d{2}$/.test(today || '') ? today : berlinDay(new Date());
    const n = dayNum(day), from = dayOf(n - 6), next = dayOf(n + 1);
    const prof = ((await s.get('r:p|me')) || {}).v || null;
    const live = (m) => [...m.entries()].filter(([, r]) => r && !r.d);
    const weights = live(await s.list({ prefix: 'r:w|' })).map(([k, r]) => ({ day: k.slice(4), kg: Number(r.v.kg) })).filter((w) => w.kg > 0).sort((a, b) => (a.day < b.day ? -1 : 1));
    const food = live(await s.list({ start: 'r:e|' + from, end: 'r:e|' + next }));
    const moves = live(await s.list({ start: 'r:x|' + from, end: 'r:x|' + next }));
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayOf(n - i), list = food.filter(([k]) => k.startsWith('r:e|' + d)).map(([, r]) => r.v);
      days.push({ day: d, kcal: list.reduce((a, v) => a + eaten(v), 0), n: list.length });
    }
    const last = weights[weights.length - 1] || null;
    const kg = last ? last.kg : prof && prof.start ? prof.start.kg : null;
    const tgt = prof && valid(prof) && kg ? target(prof, kg, Number(day.slice(0, 4))).kcal : null;
    return {
      name: (await s.get('name')) || '', day, target: tgt, days,
      start: prof && prof.start ? prof.start.kg : null, goal: prof ? prof.goal : null, kg, weighed: last ? last.day : null,
      workouts: moves.map(([k, r]) => ({ day: k.slice(4, 14), kind: r.v.kind || 'w', min: Number(r.v.min) || 0 })),
    };
  }
}

// What a partner may see of a summary: no food, no weight itself
export function partnerView(id, sum) {
  const lost = sum.start && sum.kg ? Math.round((sum.start - sum.kg) * 10) / 10 : null;
  const toGo = sum.start && sum.goal && sum.start > sum.goal && sum.kg ? Math.max(0, Math.min(100, Math.round(((sum.start - sum.kg) / (sum.start - sum.goal)) * 100))) : null;
  const logged = sum.days.filter((d) => d.n > 0);
  const inTarget = sum.target ? logged.filter((d) => d.kcal <= sum.target * 1.05).length : null;
  const week = sum.workouts.filter((w) => w.kind === 'w').length;
  return { id, name: sum.name || 'Без імені', lost, toGo, logged: logged.length, inTarget, workouts: week, walks: sum.workouts.length - week, active: logged.length ? logged[logged.length - 1].day : null };
}

const stub = (env, id) => env.FORMA.get(env.FORMA.idFromName('u:' + id));
async function ask(env, id, body) {
  const r = await stub(env, id).fetch('https://forma/', { method: 'POST', body: JSON.stringify(body) });
  if (!r.ok) throw new Error('forma ' + r.status);
  return r.json();
}
export const summaryOf = (env, id, today) => ask(env, id, { op: 'summary', today });
export { ask as askForma };

const readJson = async (env, k) => { try { return JSON.parse(await env.SCANS.get(k)) || null; } catch { return null; } };
// The partners of a person with what they may see of each other
export async function partnersOf(env, me, today) {
  const out = [];
  for (const id of (await readJson(env, 'fb:' + me)) || []) {
    if ((await allowedId(env, id)) === false) continue;
    try { out.push(partnerView(id, await summaryOf(env, id, today))); } catch (e) { console.log('partner summary failed', String(e && e.message || e)); }
  }
  return out;
}
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code6 = () => [...crypto.getRandomValues(new Uint8Array(6))].map((b) => CODE_ABC[b % CODE_ABC.length]).join('');

export async function formaRoute(env, signed, reply) {
  if (!env.FORMA) return reply(500, { ok: false, error: 'Durable Object binding FORMA is not set' });
  const f = signed.form, me = signed.user.id, action = String(f.get('action') || '');
  if (action === 'sync') {
    let changes = [];
    try { changes = JSON.parse(String(f.get('changes') || '[]')); } catch { return reply(400, { ok: false, error: 'changes: JSON' }); }
    const d = await ask(env, me, { op: 'sync', since: Math.max(0, Number(f.get('since')) || 0), changes, name: String(signed.user.first_name || '') });
    return reply(200, { ok: true, ...d });
  }
  if (!env.SCANS) return reply(500, { ok: false, error: 'KV binding SCANS is not set' });
  const mine = (await readJson(env, 'fb:' + me)) || [];
  if (action === 'invite') {
    const code = code6();
    await env.SCANS.put('finv:' + code, String(me), { expirationTtl: 86400 });
    return reply(200, { ok: true, code });
  }
  if (action === 'join') {
    const code = String(f.get('code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const other = code.length === 6 ? Number(await env.SCANS.get('finv:' + code)) : 0;
    if (!other) return reply(404, { ok: false, error: 'bad_code' });
    if (other === me) return reply(409, { ok: false, error: 'own_code' });
    const theirs = (await readJson(env, 'fb:' + other)) || [];
    if (!mine.includes(other) && (mine.length >= MAX_BUDDIES || theirs.length >= MAX_BUDDIES)) return reply(409, { ok: false, error: 'full' });
    if (!mine.includes(other)) await env.SCANS.put('fb:' + me, JSON.stringify([...mine, other]));
    if (!theirs.includes(me)) await env.SCANS.put('fb:' + other, JSON.stringify([...theirs, me]));
    return reply(200, { ok: true, joined: other });
  }
  if (action === 'leave') {
    const other = Number(f.get('id'));
    await env.SCANS.put('fb:' + me, JSON.stringify(mine.filter((x) => x !== other)));
    const theirs = (await readJson(env, 'fb:' + other)) || [];
    if (theirs.includes(me)) await env.SCANS.put('fb:' + other, JSON.stringify(theirs.filter((x) => x !== me)));
    return reply(200, { ok: true });
  }
  if (action === 'buddies') return reply(200, { ok: true, buddies: await partnersOf(env, me, berlinDay(new Date())) });
  if (action === 'export') {
    const { rows } = await ask(env, me, { op: 'dump' }), day = berlinDay(new Date());
    const files = [[`d-simya-kopiia-${day}.json`, 'application/json', JSON.stringify({ app: 'D-SIM’YA', kind: 'forma', made: new Date().toISOString(), rows })],
      [`d-simya-shchodennyk-${day}.csv`, 'text/csv', diaryCsv(rows)]];
    for (const [name, type, body] of files) {
      const fd = new FormData();
      fd.append('chat_id', String(me));
      fd.append('document', new File([body], name, { type }));
      if (type === 'application/json') fd.append('caption', 'Копія записів «Харчування» й «Тренування». Щоб відновити: «Продукти» → «Відновити з копії».');
      const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
      if (!r.ok) return reply(502, { ok: false, error: 'telegram' });
    }
    return reply(200, { ok: true, records: rows.length });
  }
  return reply(400, { ok: false, error: 'action: sync, invite, join, leave, buddies or export' });
}

// The diary as a table for Excel or Google Sheets: semicolons and a BOM, so German Excel opens Cyrillic and commas right
export function diaryCsv(rows) {
  const q = (v) => { const t = String(v == null ? '' : v); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const n = (x) => String(Math.round(Number(x || 0) * 10) / 10).replace('.', ',');
  const MEAL = { b: 'Сніданок', l: 'Обід', d: 'Вечеря', s: 'Перекуси' };
  const lines = [['Дата', 'Що', 'Назва', 'Скільки', 'Ккал', 'Білки, г', 'Жири, г', 'Вуглеводи, г', 'Прийом / вид'].join(';')];
  const out = [];
  for (const r of rows) {
    const day = r.id.slice(0, 10), v = r.v || {};
    if (r.k === 'e') { const k = (Number(v.g) || 0) / 100; out.push([day, 'їжа', v.n, `${n(v.g)} ${v.l ? 'мл' : 'г'}`, Math.round((v.kcal || 0) * k), n(v.p * k), n(v.f * k), n(v.c * k), MEAL[v.meal] || '']); }
    else if (r.k === 'w') out.push([r.id, 'вага', '', `${n(v.kg)} кг`, '', '', '', '', '']);
    else if (r.k === 'x') out.push([day, v.kind === 'walk' ? 'прогулянка' : 'тренування', v.title || '', `${v.min || 0} хв`, v.kcal || '', '', '', '', v.kind || '']);
    else if (r.k === 'd') out.push([r.id, 'день', '', '', '', '', '', '', JSON.stringify(v)]);
  }
  out.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return '\uFEFF' + lines.concat(out.map((row) => row.map(q).join(';'))).join('\r\n') + '\r\n';
}

/* ---------------- reminders ---------------- */
export const HALF_HOURS = Array.from({ length: 34 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);   // 06:00 … 22:30
const WEEKDAYS = ['понеділок', 'вівторок', 'середу', 'четвер', 'п’ятницю', 'суботу', 'неділю'];
const SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];
export const HEALTH = {
  sport: { prefix: 'tsub:', button: button('Тренування', 'sport/'), time: '18:00' },
  yizha: { prefix: 'msub:', button: button('Харчування', 'yizha/'), time: '20:00' },
  vaga: { prefix: 'vsub:', button: button('Записати вагу', 'yizha/?tab=progress'), time: '07:30' },
  zvit: { prefix: 'zsub:', button: button('Прогрес', 'yizha/?tab=progress'), time: '19:00' },
};

// The choices a page sends, cleaned up
export function healthPrefs(kind, f) {
  const get = (k) => (f.get(k) == null ? '' : String(f.get(k)));
  const time = HALF_HOURS.includes(get('time')) ? get('time') : HEALTH[kind].time;
  if (kind === 'sport') {
    const days = [...new Set(get('days').split(',').map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
    return { time, days: days.length ? days : [0, 2, 4], next: clip(get('next'), 80), mins: Math.max(0, Math.min(180, Number(get('mins')) || 0)) };
  }
  if (kind === 'vaga') { const wd = Number(get('wd')); return { time, wd: Number.isInteger(wd) && wd >= 0 && wd <= 6 ? wd : 0 }; }
  return { time };
}

export function healthConfirm(kind, p) {
  if (kind === 'sport') return `Нагадування про тренування увімкнено: ${p.days.map((d) => SHORT[d]).join(', ')} о ${p.time}. Я напишу, яке тренування на черзі.`;
  if (kind === 'vaga') return `Нагадування про зважування увімкнено: щотижня в ${WEEKDAYS[p.wd]} о ${p.time}. Зважуйся зранку, до сніданку, в той самий час: так цифри можна порівнювати.`;
  if (kind === 'zvit') return `Звіт тижня увімкнено: щонеділі о ${p.time} я надішлю підсумок — вага, дні в нормі, тренування, вода, сон і як справи в партнерів.`;
  return `Нагадування про харчування увімкнено: щодня о ${p.time} я скажу, скільки записано за день. Якщо все вже записано і в нормі, не турбуватиму.`;
}

const slotOf = (now) => { const { hour, minute } = berlinClock(now); return `${String(hour).padStart(2, '0')}:${minute < 30 ? '00' : '30'}`; };
const prevSlot = (slot) => HALF_HOURS[HALF_HOURS.indexOf(slot) - 1] || null;

export function mealText(sum, day) {
  const d = sum.days.find((x) => x.day === day) || { kcal: 0, n: 0 };
  if (!d.n) return '🍽 Сьогодні в щоденнику ще порожньо. Запиши, що їв(ла), поки пам’ятаєш: це хвилина, а без записів не видно, звідки беруться кілограми.';
  if (!sum.target) return `🍽 За сьогодні записано ${d.kcal} ккал. Не забудь вечерю й перекуси.`;
  const left = sum.target - d.kcal;
  if (d.n >= 3 && left >= 0 && left < sum.target * 0.35) return null;   // the day is written down and within the target
  return left >= 0
    ? `🍽 За сьогодні записано ${d.kcal} ккал з ${sum.target}: лишається ${left}. Не забудь записати вечерю й перекуси.`
    : `🍽 За сьогодні записано ${d.kcal} ккал, на ${-left} більше за норму ${sum.target}. Нічого страшного: завтра новий день. Запиши решту, щоб бачити картину.`;
}
export function sportText(rec, sum, day) {
  if (sum && sum.workouts.some((w) => w.day === day && w.kind === 'w')) return null;   // already trained today
  return `💪 Сьогодні день тренування${rec.next ? `: «${rec.next}»` : ''}${rec.mins ? `, близько ${rec.mins} хв` : ''}. Увімкни, і застосунок покаже кожну вправу.`;
}
export function weighText(sum, day) {
  if (sum && sum.weighed === day) return null;
  return '⚖️ Час зважитися: зранку, до сніданку, після туалету. Запиши вагу, і графік покаже тенденцію, а не випадкові коливання.';
}

// One cron job for the three reminders: each person at their own half hour (or the one after, if the run missed them)
export async function sendHealth(env, now, out) {
  if (!env.SCANS || !env.BOT_TOKEN) return { sent: 0 };
  const slot = slotOf(now), prev = prevSlot(slot), day = berlinDay(now), wd = berlinClock(now).weekday;
  const at = (rec) => !!rec && [slot, prev].includes(rec.time);
  const sum = async (rec) => (env.FORMA && rec && rec.id ? summaryOf(env, rec.id, day).catch(() => null) : null);
  const results = {};
  results.sport = await deliver(env, out, { job: 'sport', day, prefix: HEALTH.sport.prefix, finish: false, button: HEALTH.sport.button,
    due: (rec) => at(rec) && Array.isArray(rec.days) && rec.days.includes(wd), text: async (rec) => sportText(rec, await sum(rec), day) });
  results.yizha = await deliver(env, out, { job: 'meals', day, prefix: HEALTH.yizha.prefix, finish: false, button: HEALTH.yizha.button,
    due: at, text: async (rec) => { const s = await sum(rec); return s ? mealText(s, day) : mealText({ days: [], target: null }, day); } });
  results.vaga = await deliver(env, out, { job: 'weigh', day, prefix: HEALTH.vaga.prefix, finish: false, button: HEALTH.vaga.button,
    due: (rec) => at(rec) && rec.wd === wd, text: async (rec) => weighText(await sum(rec), day) });
  return results;
}
