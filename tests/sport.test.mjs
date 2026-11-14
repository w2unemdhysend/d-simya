// «Тренування»: the programmes, the short sessions, the coach's clips, and how they count in the streaks.
//   node tests/sport.test.mjs
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MOVES, MOVE } from '../sport/moves.js';
import { PLANS, PLAN, QUICK, QUICK_OF, quickSteps, steps, seconds, kcalOf, stepOf } from '../sport/plans.js';
import { PHRASES } from '../sport/coach.js';
import { CLIPS } from '../sport/audio/index.js';
import { facts, achievements } from '../yizha/goals.js';

let fails = 0;
const t = (name, ok, detail = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (!ok && detail ? `  (${detail})` : '')); if (!ok) fails++; };
const root = fileURLToPath(new URL('..', import.meta.url));

/* ---------- programmes ---------- */
t('three programmes: soft, back, home', PLANS.map((p) => p.id).join() === 'soft,back,home');
for (const p of PLANS) for (const w of p.workouts) {
  const all = [...w.warm.map((x) => x[0]), ...w.circle, ...w.cool.map((x) => x[0])];
  t(`${p.id} ${w.id}: every exercise exists`, all.every((id) => MOVE[id]), all.filter((id) => !MOVE[id]).join());
}
const back = PLAN.back;
t('the back programme: no jumps, nothing hard on the back', back.workouts.every((w) => [...w.circle, ...w.warm.map((x) => x[0])].every((id) => MOVE[id].low && MOVE[id].met < 5)));
t('the back programme: 2 rounds at first, 3 later', stepOf('back', 1).rounds === 2 && stepOf('back', 8).rounds === 3);
const bmin = seconds(steps('back', back.workouts[0], 1)) / 60;
t(`the back programme, week 1: 10–20 minutes (${bmin.toFixed(1)})`, bmin >= 10 && bmin <= 20);

/* ---------- the short sessions ---------- */
const morning = QUICK_OF.morning, bq = QUICK_OF.back;
t('two short sessions: the morning and the back', QUICK.map((q) => q.id).join() === 'morning,back');
t('the morning routine: exactly 5 minutes', seconds(quickSteps(morning)) === 300);
t('the morning routine: all standing (no mat), gentle', morning.list.every(([id]) => !(MOVE[id].props || []).includes('mat') && MOVE[id].low));
const bsecs = seconds(quickSteps(bq));
t(`the back session: about 10 minutes (${bsecs} s)`, bsecs >= 480 && bsecs <= 660);
t('the short sessions: every exercise exists', QUICK.every((q) => q.list.every(([id]) => MOVE[id])));
const qs = quickSteps(morning);
t('their steps: one round, numbered, no rest', qs.every((s, i) => s.kind === 'work' && s.rounds === 1 && s.i === i + 1 && s.n === qs.length));
t('kcal of the morning routine for 100 kg: a little (10–30)', (() => { const k = kcalOf(qs, 100); return k >= 10 && k <= 30; })());

/* ---------- streaks and achievements ---------- */
const moves = [
  ...Array.from({ length: 7 }, (_, i) => ({ id: `2026-11-0${i + 1}~m${i}`, kind: 'z', q: 'morning' })),
  { id: '2026-11-08~b1', kind: 'z', q: 'back' }, { id: '2026-11-08~w1', kind: 'w', plan: 'back' }, { id: '2026-11-08~walk', kind: 'walk' },
];
const f = facts({ today: '2026-11-08', profile: null, entries: [], weights: [], moves, days: {}, planDays: 3 });
t('facts: mornings, back sessions (short and programme), walks, workouts apart', f.mornings === 7 && f.backs === 2 && f.walks === 1 && f.workouts === 1, JSON.stringify(f));
const a = achievements(f);
t('achievements: «Ранкова звичка» after 7 mornings, the back one not yet', a.find((x) => x.id === 'morning7').got && !a.find((x) => x.id === 'back10').got);
t('achievements: unique ids', new Set(a.map((x) => x.id)).size === a.length);

/* ---------- the coach's clips ---------- */
const keys = [...Object.keys(PHRASES), ...MOVES.map((m) => m.id)];
for (const v of ['f', 'm']) {
  const missing = keys.filter((k) => !CLIPS[v] || !CLIPS[v][k]);
  t(`voice ${v}: a clip for every phrase and exercise`, !missing.length, missing.join());
  const files = Object.values(CLIPS[v] || {});
  const bad = files.filter((x) => !existsSync(root + 'sport/audio/' + x) || statSync(root + 'sport/audio/' + x).size < 1500);
  t(`voice ${v}: the files are there`, files.length && !bad.length, bad.join());
  const total = files.reduce((s, x) => s + (existsSync(root + 'sport/audio/' + x) ? statSync(root + 'sport/audio/' + x).size : 0), 0);
  t(`voice ${v}: small enough to fetch on a phone (${Math.round(total / 1024)} KB)`, total < 900 * 1024);
}
t('the count-down is there: 3, 2, 1', ['3', '2', '1'].every((k) => PHRASES[k]));
t('rounds 2–4 can be announced (the programmes go up to 4 rounds)', ['round2', 'round3', 'round4', 'lastround'].every((k) => PHRASES[k]));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
