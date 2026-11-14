// Official weather warnings of the Deutscher Wetterdienst (DWD) for a place, through Bright Sky (free, no key).
// Used by GET /warnings (the Погода page and the home screen) and by the bot, which writes when a warning
// of the chosen level is issued for the household's place.

import cal from '../smittia/kalender.json' with { type: 'json' };
import { allowedId } from './access.js';

const API = 'https://api.brightsky.dev/alerts';
// DWD levels: 1 yellow (Wetterwarnung), 2 orange (markantes Wetter), 3 red (Unwetter), 4 dark red (extremes Unwetter)
export const LEVEL = { minor: 1, moderate: 2, severe: 3, extreme: 4 };
export const LEVEL_UK = { 1: 'жовтий', 2: 'помаранчевий', 3: 'червоний', 4: 'темно-червоний' };
// The places people choose in the app: village centres from the waste calendar, and Wesel
export const PLACES = { ...cal.centers, Wesel: [51.65769, 6.61709] };

// DWD event names (event_de, in capitals) → Ukrainian, in groups: of each group only the first (most specific) match counts
const EVENTS = [
  ['storm', /GEWITTER/, 'гроза'],
  ['wind', /ORKAN/, 'ураганний вітер'], ['wind', /SCHWERE STURMBÖEN/, 'сильні штормові пориви'], ['wind', /STURMBÖEN|STURM/, 'штормові пориви'],
  ['wind', /WINDBÖEN|STARKWIND|BÖEN/, 'сильний вітер'], ['hail', /HAGEL/, 'град'],
  ['ice', /GLATTEIS/, 'ожеледь'], ['ice', /GLÄTTE/, 'ожеледиця'], ['snow', /SCHNEEVERWEHUNG/, 'сніжні замети'], ['snow', /SCHNEE/, 'снігопад'],
  ['rain', /DAUERREGEN/, 'тривалий дощ'], ['rain', /STARKREGEN|REGEN/, 'сильний дощ'],
  ['frost', /STRENGER FROST/, 'сильний мороз'], ['frost', /FROST/, 'мороз'], ['fog', /NEBEL/, 'туман'], ['heat', /HITZE/, 'спека'],
  ['uv', /UV/, 'сильне сонячне УФ-випромінювання'], ['thaw', /TAUWETTER/, 'відлига'],
];
const TIPS = {
  'гроза': 'Уникай відкритої місцевості й дерев, не стій під деревами.',
  'ураганний вітер': 'Залишайся вдома, якщо можеш. Можуть падати дерева й гілки.',
  'сильні штормові пориви': 'Не стій під деревами й біля будівельних риштувань, закріпи речі на балконі.',
  'штормові пориви': 'Не стій під деревами, закріпи речі на балконі.',
  'сильний вітер': 'Обережно на велосипеді, особливо на мостах і відкритих дорогах.',
  'град': 'Сховайся в приміщенні, авто краще поставити під дах.',
  'ожеледь': 'Дуже слизько: на велосипеді краще не їхати, на тротуарі обережно.',
  'ожеледиця': 'Слизько на дорогах і тротуарах: закладай більше часу на дорогу.',
  'сніжні замети': 'На дорогах можливі замети, закладай більше часу.',
  'снігопад': 'Закладай більше часу на дорогу, можливі запізнення автобусів і потягів.',
  'тривалий дощ': 'Можливі підтоплення низин і підвалів.',
  'сильний дощ': 'Можливі калюжі й затоплені підземні переходи.',
  'сильний мороз': 'Одягнися тепло, не залишай воду в садових шлангах.',
  'мороз': 'Вночі нижче нуля: вранці може бути слизько.',
  'туман': 'Погана видимість на дорозі.',
  'спека': 'Пий більше води й уникай сонця вдень.',
};

export function warnOf(a) {
  const level = LEVEL[a.severity] || 1, ev = String(a.event_de || '').toUpperCase();
  const groups = new Set(), uk = [];
  for (const [g, re, t] of EVENTS) if (!groups.has(g) && re.test(ev)) { groups.add(g); uk.push(t); }
  uk.splice(2);
  return {
    id: String(a.alert_id || a.id), code: a.event_code, level, levelUk: LEVEL_UK[level],
    uk: uk.length ? uk.join(', ') : ev.toLowerCase(), tip: TIPS[uk[0]] || '',
    de: String(a.headline_de || '').slice(0, 160), event: ev.slice(0, 80),
    onset: a.onset || a.effective || null, expires: a.expires || null,
    text: String(a.description_de || '').slice(0, 900), instruction: String(a.instruction_de || '').slice(0, 900),
  };
}

export async function fetchWarnings(lat, lon) {
  const u = new URL(API);
  u.searchParams.set('lat', lat); u.searchParams.set('lon', lon);
  const res = await fetch(u, { headers: { 'Accept': 'application/json', 'User-Agent': 'd-simya (Telegram Mini App; github.com/w2unemdhysend/d-simya)' } });
  if (!res.ok) throw new Error(`warnings HTTP ${res.status}`);
  const d = await res.json();
  const now = Date.now();
  const warnings = (d.alerts || []).filter((a) => a.status !== 'test' && (!a.expires || Date.parse(a.expires) > now)).map(warnOf)
    .sort((a, b) => b.level - a.level || Date.parse(a.onset || 0) - Date.parse(b.onset || 0));
  return { place: (d.location && (d.location.name_short || d.location.name)) || '', warnings };
}

/* ---------------- the bot ---------------- */
const fmtTime = (iso) => new Intl.DateTimeFormat('uk-UA', { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const DOT = { 1: '🟡', 2: '🟠', 3: '🔴', 4: '🟣' };
export function warnText(place, w) {
  const when = w.onset && w.expires ? `з ${fmtTime(w.onset)} до ${fmtTime(w.expires)}` : w.expires ? `до ${fmtTime(w.expires)}` : '';
  return `${DOT[w.level]} Попередження DWD для ${place}: ${w.uk}\nРівень ${w.level} з 4 (${w.levelUk})${when ? '\n' + when : ''}` +
    (w.tip ? `\n\n${w.tip}` : '') + `\n\n${w.de}${w.text ? '\n' + w.text : ''}`;
}
export function warnConfirmText(place, level, list) {
  const lv = level === 1 ? 'будь-якого рівня' : level === 2 ? 'від помаранчевого рівня (2 з 4)' : 'червоного рівня (3 з 4) і вище';
  const now = list.filter((w) => w.level >= level);
  return `Попередження про негоду увімкнено для ${place}. Я напишу, коли Німецька метеослужба (DWD) оголосить попередження ${lv}.` +
    (now.length ? `\n\nЗараз діє: ${now.map((w) => `${DOT[w.level]} ${w.uk}`).join(', ')}.` : '\n\nЗараз попереджень немає.');
}

// Every 30 minutes: new warnings for each subscriber's place, each warning once (per event, level and day)
export async function sendWarnings(env, now, out, button) {
  if (!env.SCANS || !env.BOT_TOKEN) return { sent: 0 };
  const subs = [];
  let cursor;
  do {
    const page = await env.SCANS.list({ prefix: 'wsub:', cursor });
    for (const { name } of page.keys) {
      try { const r = JSON.parse(await env.SCANS.get(name)); if (r && PLACES[r.place]) subs.push(r); } catch { /* broken record */ }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  if (!subs.length) return { sent: 0 };
  const byPlace = {};
  for (const place of new Set(subs.map((s) => s.place))) {
    try { byPlace[place] = await fetchWarnings(...PLACES[place].map((n) => n.toFixed(2))); } catch (e) { console.log('warnings failed', place, String(e)); }
  }
  let sent = 0;
  for (const s of subs) {
    const got = byPlace[s.place]; if (!got) continue;
    for (const w of got.warnings) {
      if (w.level < (s.level || 3)) continue;
      const key = `wsent:${s.id}:${w.code || w.event}:${w.level}:${(w.onset || '').slice(0, 10)}`;
      if (await env.SCANS.get(key)) continue;
      const allowed = await allowedId(env, s.id);
      if (allowed === false) { await env.SCANS.delete('wsub:' + s.id); break; }
      if (!allowed) break;
      const r = await out.send(s.id, warnText(s.place, w), button);   // not sent now: the next run tries again
      if (r.blocked) { await env.SCANS.delete('wsub:' + s.id); break; }
      if (r.ok) { sent++; await env.SCANS.put(key, '1', { expirationTtl: 2 * 86400 }); }
    }
  }
  return { sent };
}
