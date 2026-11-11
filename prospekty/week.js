// The flyer week and the days shops are closed, shared by the page (prospekty/index.html) and the bot's
// Monday reminder (worker/send-scan.js). Days are 'YYYY-MM-DD' strings in Xanten time.

export function addDays(day, n) {
  const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const weekdayOf = (day) => (new Date(day + 'T12:00:00Z').getUTCDay() + 6) % 7;   // 0 = Monday … 6 = Sunday

// ISO week number (Kalenderwoche): the week belongs to the year of its Thursday
export function isoWeek(day) {
  const thu = addDays(day, 3 - weekdayOf(day));
  return Math.floor((Date.parse(thu) - Date.parse(thu.slice(0, 4) + '-01-01')) / 864e5 / 7) + 1;
}

// Flyers run Monday to Saturday. On Sunday shops are closed and next week's flyers are already out,
// so from Sunday on "this week" means the coming one.
export function flyerWeek(today) {
  const wd = weekdayOf(today), monday = addDays(today, wd === 6 ? 1 : -wd);
  return { monday, saturday: addDays(monday, 5), kw: isoWeek(monday), sunday: wd === 6 };
}

function easter(y) {   // anonymous Gregorian algorithm
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Public holidays in North Rhine-Westphalia: shops are closed. [German name, Ukrainian name]
export function holidaysNRW(y) {
  const e = easter(y), h = {};
  h[`${y}-01-01`] = ['Neujahr', 'Новий рік'];
  h[addDays(e, -2)] = ['Karfreitag', 'Страсна пʼятниця'];
  h[addDays(e, 1)] = ['Ostermontag', 'Великодній понеділок'];
  h[`${y}-05-01`] = ['Tag der Arbeit', 'День праці'];
  h[addDays(e, 39)] = ['Christi Himmelfahrt', 'Вознесіння'];
  h[addDays(e, 50)] = ['Pfingstmontag', 'Понеділок Трійці'];
  h[addDays(e, 60)] = ['Fronleichnam', 'Свято Тіла Христового'];
  h[`${y}-10-03`] = ['Tag der Deutschen Einheit', 'День єдності Німеччини'];
  h[`${y}-11-01`] = ['Allerheiligen', 'День усіх святих'];
  h[`${y}-12-25`] = ['1. Weihnachtstag', 'Різдво'];
  h[`${y}-12-26`] = ['2. Weihnachtstag', 'Другий день Різдва'];
  return h;
}
// Christmas Eve and New Year's Eve are working days, but most shops close around 14:00
const SHORT = { '12-24': ['Heiligabend', 'Святвечір'], '12-31': ['Silvester', 'Переддень Нового року'] };

// Days from `from` to `to` (inclusive) when shops are closed or close early
export function closures(from, to) {
  const out = [], hol = {};
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const y = Number(day.slice(0, 4));
    if (!hol[y]) hol[y] = holidaysNRW(y);
    if (hol[y][day]) out.push({ day, kind: 'closed', de: hol[y][day][0], uk: hol[y][day][1] });
    else if (SHORT[day.slice(5)]) out.push({ day, kind: 'short', de: SHORT[day.slice(5)][0], uk: SHORT[day.slice(5)][1] });
  }
  return out;
}

// "9–14 листопада", "28 грудня – 2 січня"
export function rangeText(from, to) {
  const f = new Date(from + 'T12:00:00Z'), t = new Date(to + 'T12:00:00Z');
  const dm = (d) => d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  return f.getUTCMonth() === t.getUTCMonth() ? `${f.getUTCDate()}–${dm(t)}` : `${dm(f)} – ${dm(t)}`;
}
export const dayText = (day, opts = { weekday: 'long', day: 'numeric', month: 'long' }) =>
  new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { ...opts, timeZone: 'UTC' });
