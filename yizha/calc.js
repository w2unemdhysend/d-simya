// The numbers behind «Харчування» and «Тренування»: the daily calorie target, the macros, the weight trend, burnt calories.
// Plain functions without window or document: the Worker imports them too (the partner summary, the reminders).
//
// Target: resting energy by Mifflin–St Jeor, times the activity factor, minus the deficit for the chosen pace
// (7 700 kcal per kg of body fat). The deficit is never more than a quarter of the day's need, and the target never goes
// below 1 200 kcal for a woman and 1 500 for a man: lower is a diet for a doctor to prescribe, not for an app.

export const ACT = [
  { id: 1, uk: 'Мало руху', note: 'Сидяча робота, мало ходьби', f: 1.2 },
  { id: 2, uk: 'Трохи руху', note: 'Прогулянки, справи по дому, 1–3 тренування на тиждень', f: 1.375 },
  { id: 3, uk: 'Помірно', note: 'Багато на ногах або 3–5 тренувань на тиждень', f: 1.55 },
  { id: 4, uk: 'Багато руху', note: 'Фізична робота або щоденні тренування', f: 1.725 },
];
export const PACES = [
  { kg: 0.25, uk: 'Спокійно', note: '≈ 1 кг на місяць' },
  { kg: 0.5, uk: 'Звичайно', note: '≈ 2 кг на місяць' },
  { kg: 0.75, uk: 'Швидше', note: '≈ 3 кг на місяць' },
];
export const KCAL_PER_KG = 7700;
export const MEALS = [
  { id: 'b', uk: 'Сніданок', icon: '🌅', share: 0.25 },
  { id: 'l', uk: 'Обід', icon: '☀️', share: 0.35 },
  { id: 'd', uk: 'Вечеря', icon: '🌙', share: 0.3 },
  { id: 's', uk: 'Перекуси', icon: '🍏', share: 0.1 },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round10 = (n) => Math.round(n / 10) * 10;

// A profile as the page keeps it: {sex 'f'|'m', born (year), cm, start {kg, day}, goal (kg), act 1–4, pace (kg a week), kcal (own target or null)}
export function valid(p) {
  return !!p && (p.sex === 'f' || p.sex === 'm') && p.born >= 1920 && p.born <= 2015 && p.cm >= 120 && p.cm <= 230 &&
    p.start && p.start.kg >= 30 && p.start.kg <= 300 && p.goal >= 30 && p.goal <= 300 && ACT.some((a) => a.id === p.act) && PACES.some((x) => x.kg === p.pace);
}
export const ageOf = (p, year) => clamp(year - p.born, 14, 100);

export function bmr(p, kg, year) {
  return 10 * kg + 6.25 * p.cm - 5 * ageOf(p, year) + (p.sex === 'm' ? 5 : -161);
}
export function need(p, kg, year) {
  return bmr(p, kg, year) * (ACT.find((a) => a.id === p.act) || ACT[0]).f;
}
export const floorOf = (p) => (p.sex === 'm' ? 1500 : 1200);

// {kcal, need, deficit, floored, own}: kcal is what the day's ring counts down from
export function target(p, kg, year) {
  const n = need(p, kg, year);
  if (p.kcal >= 800 && p.kcal <= 5000) return { kcal: round10(p.kcal), need: round10(n), deficit: Math.max(0, round10(n - p.kcal)), floored: false, own: true };
  if (kg <= p.goal) return { kcal: round10(n), need: round10(n), deficit: 0, floored: false, own: false, reached: true };
  const want = (p.pace * KCAL_PER_KG) / 7, deficit = Math.min(want, n * 0.25);
  const t = n - deficit, floor = floorOf(p);
  return { kcal: round10(Math.max(t, floor)), need: round10(n), deficit: round10(n - Math.max(t, floor)), floored: t < floor, own: false };
}

// grams a day: protein a quarter of the energy (filling while losing weight), fat 30 %, the rest carbohydrates
export function macros(kcal) {
  return { p: Math.round((kcal * 0.25) / 4), f: Math.round((kcal * 0.3) / 9), c: Math.round((kcal * 0.45) / 4) };
}
export function bmi(kg, cm) { return kg / ((cm / 100) ** 2); }
export function bmiText(b) {
  return b < 18.5 ? 'менше норми' : b < 25 ? 'норма' : b < 30 ? 'надмірна вага' : 'ожиріння';
}

// what a portion gives: per 100 g values × grams
export function portion(food, g) {
  const k = g / 100;
  return { kcal: Math.round(food.kcal * k), p: food.p * k, f: food.f * k, c: food.c * k };
}
export function sum(entries) {
  const t = { kcal: 0, p: 0, f: 0, c: 0 };
  for (const e of entries) { const x = portion(e, e.g); t.kcal += x.kcal; t.p += x.p; t.f += x.f; t.c += x.c; }
  return t;
}

/* ---------- weight ---------- */
const DAY = 86400000;
export const dayNum = (day) => Math.round(Date.parse(day + 'T00:00:00Z') / DAY);   // days since 1970-01-01; dayOf(dayNum(d)) === d
export const dayOf = (n) => new Date(n * DAY).toISOString().slice(0, 10);

// The trend smooths the day-to-day water swings: each weighing moves it a tenth of the way (per day between them)
// points: [{day, kg}] sorted by day → [{day, kg, trend}]
export function trend(points) {
  const out = [];
  let t = null, last = null;
  for (const p of points) {
    const n = dayNum(p.day);
    if (t === null) t = p.kg;
    else { const a = 1 - Math.pow(0.9, Math.max(1, n - last)); t += a * (p.kg - t); }
    last = n;
    out.push({ day: p.day, kg: p.kg, trend: Math.round(t * 100) / 100 });
  }
  return out;
}
// kg a week over the last `days` days (least squares through the weighings), null with fewer than 3 weighings over 6+ days
export function rate(points, today, days = 28) {
  const from = dayNum(today) - days, pts = points.filter((p) => dayNum(p.day) >= from);
  if (pts.length < 3 || dayNum(pts[pts.length - 1].day) - dayNum(pts[0].day) < 6) return null;
  const xs = pts.map((p) => dayNum(p.day)), mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = pts.reduce((a, p) => a + p.kg, 0) / pts.length;
  let sxy = 0, sxx = 0;
  pts.forEach((p, i) => { sxy += (xs[i] - mx) * (p.kg - my); sxx += (xs[i] - mx) ** 2; });
  return sxx ? (sxy / sxx) * 7 : null;
}
// the day the goal is reached at the current rate (or the planned pace when there is no rate yet); null when not losing
export function eta(kgNow, goal, perWeek, today) {
  if (kgNow <= goal) return today;
  if (!(perWeek < -0.05)) return null;
  const weeks = (kgNow - goal) / -perWeek;
  if (weeks > 520) return null;
  return dayOf(dayNum(today) + Math.round(weeks * 7));
}

/* ---------- exercise ---------- */
// kcal burnt: MET × kg × hours. MET of the moves: 2.5 stretching, 3.5 light, 5 moderate, 8 vigorous; walking 3.5 (brisk 4.3)
export const burnt = (met, kg, minutes) => Math.round((met * kg * minutes) / 60);

/* ---------- water, pressure, sugar ---------- */
// about 30 ml per kg of body weight, in glasses of 250 ml, between 1.5 and 3 litres
export const waterGoal = (kg) => Math.min(3000, Math.max(1500, Math.round((kg * 30) / 250) * 250));
export const GLASS = 250;

// Blood pressure by the European guidelines (ESH 2023): a guide, not a diagnosis
export function bpClass(sys, dia) {
  if (sys >= 180 || dia >= 110) return { level: 3, uk: 'дуже високий: якщо так кілька разів поспіль, звернися до лікаря сьогодні' };
  if (sys >= 140 || dia >= 90) return { level: 2, uk: 'підвищений' };
  if (sys >= 130 || dia >= 85) return { level: 1, uk: 'високий нормальний' };
  if (sys < 90 || dia < 60) return { level: 1, uk: 'низький' };
  return { level: 0, uk: sys < 120 && dia < 80 ? 'оптимальний' : 'нормальний' };
}
// Blood sugar in mmol/l, fasting or about two hours after a meal (WHO, Deutsche Diabetes Gesellschaft): a guide only
export const MGDL = 18.016;
export function sugarClass(mmol, after) {
  if (mmol < 3.9) return { level: 2, uk: 'низький: з’їж щось солодке й переміряй' };
  if (!after) return mmol < 5.6 ? { level: 0, uk: 'норма натще' } : mmol < 7 ? { level: 1, uk: 'підвищений натще' } : { level: 2, uk: 'високий натще' };
  return mmol < 7.8 ? { level: 0, uk: 'норма після їжі' } : mmol < 11.1 ? { level: 1, uk: 'підвищений після їжі' } : { level: 2, uk: 'високий після їжі' };
}

/* ---------- streaks ---------- */
// Days in a row up to today (or up to yesterday, when today is not written yet) that pass `ok(day)`
export function streak(today, ok, max = 400) {
  let n = 0, d = dayNum(today);
  if (!ok(dayOf(d))) d--;
  while (n < max && ok(dayOf(d))) { n++; d--; }
  return n;
}
