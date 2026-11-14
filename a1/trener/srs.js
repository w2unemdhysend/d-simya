// Spaced repetition of the trainers' mistakes. Only what went wrong is kept: a mistake comes back the same day, then
// after 1, 3, 7, 16 and 35 days while it is answered right; after that it counts as learned and is dropped.
// state: {items: {"<trainer>:<key>": {box, due, bad}}, days: {"YYYY-MM-DD": answers}}
export const STEPS = [0, 1, 3, 7, 16, 35];
const plus = (day, n) => new Date(Date.parse(day + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);

export const empty = () => ({ items: {}, days: {} });
export function grade(state, trainer, key, ok, today) {
  const id = trainer + ':' + key, it = state.items[id];
  state.days[today] = (state.days[today] || 0) + 1;
  if (!ok) { state.items[id] = { box: 0, due: today, bad: ((it && it.bad) || 0) + 1 }; return state; }
  if (!it) return state;   // right the first time: nothing to repeat
  const box = it.box + 1;
  if (box >= STEPS.length) delete state.items[id];
  else state.items[id] = { ...it, box, due: plus(today, STEPS[box]) };
  return state;
}
// the keys of a trainer due by today, the oldest first (all trainers when trainer is null)
export function due(state, trainer, today) {
  return Object.entries(state.items).filter(([id, it]) => it.due <= today && (!trainer || id.startsWith(trainer + ':')))
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : b[1].bad - a[1].bad))
    .map(([id]) => { const i = id.indexOf(':'); return { trainer: id.slice(0, i), key: id.slice(i + 1) }; });
}
// days in a row (up to today, or up to yesterday while today is not done yet) with at least `goal` answers
export function streak(state, today, goal = 10) {
  let n = 0, d = (state.days[today] || 0) >= goal ? today : plus(today, -1);
  while ((state.days[d] || 0) >= goal && n < 3650) { n++; d = plus(d, -1); }
  return n;
}
// drop what is long over (days older than 60) so the record stays small
export function tidy(state, today) {
  const cut = plus(today, -60);
  for (const d of Object.keys(state.days)) if (d < cut) delete state.days[d];
  return state;
}
