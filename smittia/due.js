// Which bins go out on a given day for a household. Shared by the Сміття page and the Worker,
// so the page and the reminders always agree. Days are 'YYYY-MM-DD' in Xanten time.

export const BINS = {
  rest:   { uk: 'Сірий бак',      de: 'Restmüll',    dot: '⚫', color: '#4A5258' },
  papier: { uk: 'Синій бак',      de: 'Papier',      dot: '🔵', color: '#2F5DB3' },
  gelb:   { uk: 'Жовтий бак',     de: 'Gelbe Tonne', dot: '🟡', color: '#E8C10A' },
  bio:    { uk: 'Коричневий бак', de: 'Biotonne',    dot: '🟤', color: '#7A4A2E' },
};

// A household: its district in the calendar, the bins it has, and how often its grey bin is emptied
// ('14' days, '4' weeks, or 'unknown'). Reminders switched on before districts were chosen keep this.
export const LEGACY = { district: '2', bins: ['rest', 'papier', 'gelb'], rhythm: 'unknown' };

// The household's choices, cleaned up; anything missing or wrong falls back to LEGACY
export function prefsOf(cal, p) {
  p = p && typeof p === 'object' ? p : {};
  const district = cal.dates[p.district] ? String(p.district) : LEGACY.district;
  const bins = Array.isArray(p.bins) ? Object.keys(BINS).filter((b) => p.bins.includes(b)) : LEGACY.bins;
  const rhythm = ['14', '4', 'unknown'].includes(p.rhythm) ? p.rhythm : LEGACY.rhythm;
  return { district, bins, rhythm };
}

// [{bin, only14}] for the day; only14: Restmüll is collected that day only from bins emptied every 2 weeks
export function binsOn(cal, day, prefs) {
  const p = prefsOf(cal, prefs), d = cal.dates[p.district], out = [];
  for (const bin of p.bins) {
    if (bin === 'rest') {
      const r14 = d.rest14.includes(day), r4 = d.rest4.includes(day);
      if (p.rhythm === '14' ? r14 : p.rhythm === '4' ? r4 : r14) out.push({ bin, only14: p.rhythm === 'unknown' && !r4 });
    } else if ((d[bin] || []).includes(day)) out.push({ bin, only14: false });
  }
  return out;
}

// Which district a place name (Ortsteil, as OpenStreetMap writes it) belongs to, or null
export function districtOf(cal, place) {
  const n = String(place || '').trim().toLowerCase();
  for (const [d, info] of Object.entries(cal.districts)) if (info.places.some((x) => x.toLowerCase() === n)) return d;
  return null;
}

// The day in Xanten for a moment in time, plus n days
export function berlinDay(date, n = 0) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  if (!n) return p;
  const t = new Date(p + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
