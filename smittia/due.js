// Which bins of this home go out on a given day. Shared by the Сміття page and the Worker,
// so the page and the reminders always agree. Days are 'YYYY-MM-DD' in Xanten time.

export const BINS = {
  rest:   { uk: 'Сірий бак',      de: 'Restmüll',    dot: '⚫', color: '#4A5258' },
  papier: { uk: 'Синій бак',      de: 'Papier',      dot: '🔵', color: '#2F5DB3' },
  gelb:   { uk: 'Жовтий бак',     de: 'Gelbe Tonne', dot: '🟡', color: '#E8C10A' },
  bio:    { uk: 'Коричневий бак', de: 'Biotonne',    dot: '🟤', color: '#7A4A2E' },
};

// [{bin, only14}] for the day; only14: Restmüll is collected that day only from bins emptied every 2 weeks
export function binsOn(cal, day) {
  const d = cal.dates, home = cal.home, out = [];
  for (const bin of home.bins) {
    if (bin === 'rest') {
      const r14 = d.rest14.includes(day), r4 = d.rest4.includes(day);
      if (home.restRhythm === '14' ? r14 : home.restRhythm === '4' ? r4 : r14) {
        out.push({ bin, only14: home.restRhythm === 'unknown' && !r4 });
      }
    } else if ((d[bin] || []).includes(day)) out.push({ bin, only14: false });
  }
  return out;
}

// The day in Xanten for a moment in time, plus n days
export function berlinDay(date, n = 0) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  if (!n) return p;
  const t = new Date(p + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
