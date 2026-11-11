// Weather for the Погода page and the short line on the Транспорт page. Data: Open-Meteo through our Worker
// (it rounds the spot to about a kilometre and keeps answers 10 minutes).

export const WORKER_URL = 'https://d-simya.whysends.workers.dev';

// Places near home: the village centres from the waste calendar (smittia/kalender.json) plus Wesel
export const PLACES = {
  Xanten: [51.66152, 6.45432], Beek: [51.65913, 6.47142], Birten: [51.63356, 6.47707], Lüttingen: [51.67285, 6.46147],
  Wardt: [51.68894, 6.43715], Vynen: [51.70311, 6.41337], Marienbaum: [51.69937, 6.37134], Obermörmter: [51.72977, 6.4026],
  Wesel: [51.65769, 6.61709],
};

// The household's place as chosen on the Сміття page, if any
export function homePlace() {
  try { const p = JSON.parse(localStorage.getItem('smittia-prefs')); if (p && PLACES[p.place]) return p.place; } catch (e) {}
  return null;
}

export async function getWeather(lat, lon) {
  const u = new URL(WORKER_URL.replace(/\/*$/, '/') + 'weather');
  u.searchParams.set('lat', lat.toFixed(2)); u.searchParams.set('lon', lon.toFixed(2));
  const r = await fetch(u);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(d.error || 'weather ' + r.status);
  return d;
}

// WMO weather codes (as Open-Meteo gives them) → words and a picture group
const CODES = {
  0: ['Ясно', 'clear'], 1: ['Переважно ясно', 'clear'], 2: ['Мінлива хмарність', 'partly'], 3: ['Хмарно', 'cloud'],
  45: ['Туман', 'fog'], 48: ['Туман, паморозь', 'fog'],
  51: ['Слабка мряка', 'drizzle'], 53: ['Мряка', 'drizzle'], 55: ['Густа мряка', 'drizzle'], 56: ['Крижана мряка', 'drizzle'], 57: ['Крижана мряка', 'drizzle'],
  61: ['Невеликий дощ', 'rain'], 63: ['Дощ', 'rain'], 65: ['Сильний дощ', 'rain'], 66: ['Крижаний дощ', 'rain'], 67: ['Сильний крижаний дощ', 'rain'],
  71: ['Невеликий сніг', 'snow'], 73: ['Сніг', 'snow'], 75: ['Сильний сніг', 'snow'], 77: ['Снігова крупа', 'snow'],
  80: ['Короткий дощ', 'rain'], 81: ['Злива', 'rain'], 82: ['Сильна злива', 'rain'], 85: ['Короткий снігопад', 'snow'], 86: ['Сильний снігопад', 'snow'],
  95: ['Гроза', 'storm'], 96: ['Гроза з градом', 'storm'], 97: ['Сильна гроза', 'storm'], 99: ['Гроза з сильним градом', 'storm'],
};
export const wxText = (code) => (CODES[code] || ['Невідомо'])[0];
export const wxKind = (code) => (CODES[code] || [, 'cloud'])[1];
const WET = ['drizzle', 'rain', 'snow', 'storm'];

const CLOUD = 'M7.4 18h9.4a3.9 3.9 0 0 0 .5-7.77 5.3 5.3 0 0 0-10.1 1.35A3.25 3.25 0 0 0 7.4 18z';
const CLOUD_UP = 'M7.4 14.5h9.4a3.9 3.9 0 0 0 .5-7.77 5.3 5.3 0 0 0-10.1 1.35A3.25 3.25 0 0 0 7.4 14.5z';
const SUN = '<circle class="sun" cx="12" cy="12" r="4"/><path class="sun" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>';
const MOON = '<path class="moon" d="M18.5 14.2A7 7 0 0 1 9.8 5.5a7 7 0 1 0 8.7 8.7z"/>';
// A small picture for the code; night shows a moon instead of the sun
export function wxIcon(code, day = 1) {
  const k = wxKind(code);
  let g;
  if (k === 'clear') g = day ? SUN : MOON;
  else if (k === 'partly') g = (day ? '<g transform="translate(-3.5 -3.5) scale(.75)">' + SUN + '</g>' : '<g transform="translate(-2.5 -3) scale(.7)">' + MOON + '</g>') + `<path class="cl" d="${CLOUD}"/>`;
  else if (k === 'cloud') g = `<path class="cl" d="${CLOUD}"/>`;
  else if (k === 'fog') g = '<path d="M4 9h16M6 13h13M4 17h14"/>';
  else if (k === 'drizzle') g = `<path class="cl" d="${CLOUD_UP}"/><path class="drop" d="M9 17.5v1M13 17.5v1M17 17.5v1"/>`;
  else if (k === 'rain') g = `<path class="cl" d="${CLOUD_UP}"/><path class="drop" d="M9 17l-1 3M13 17l-1 3M17 17l-1 3"/>`;
  else if (k === 'snow') g = `<path class="cl" d="${CLOUD_UP}"/><path class="flake" d="M9 18.5h.01M13 20h.01M17 18.5h.01M11 22h.01M15 22h.01"/>`;
  else g = `<path class="cl" d="${CLOUD_UP}"/><path class="bolt" d="M12.5 15l-2 3.5h3l-2 3.5"/>`;
  return `<svg class="wxi" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`;
}

const hh = (iso) => iso.slice(11, 16);
const round = (n) => Math.round(n) === 0 ? 0 : Math.round(n);   // never "-0°"
export const deg = (n) => `${round(n)}°`;

// What matters for going out in the next 12 hours: umbrella, slippery roads, wind, storms
export function advice(d, hours = 12) {
  const h = d.hourly, n = Math.min(hours, h.time.length), out = [];
  const wetNow = WET.includes(wxKind(d.now.weather_code)) || d.now.precipitation > 0;
  let rainAt = -1, snowAt = -1, stormAt = -1, minT = Infinity;
  for (let i = 0; i < n; i++) {
    const k = wxKind(h.weather_code[i]), p = h.precipitation_probability[i] ?? 0, mm = h.precipitation[i] ?? 0;
    if (rainAt < 0 && (p >= 50 || mm >= 0.3) && k !== 'snow') rainAt = i;
    if (snowAt < 0 && k === 'snow') snowAt = i;
    if (stormAt < 0 && k === 'storm') stormAt = i;
    minT = Math.min(minT, h.temperature_2m[i]);
  }
  if (stormAt >= 0) out.push({ kind: 'storm', text: `Можлива гроза ${stormAt === 0 ? 'вже зараз' : 'з ' + hh(h.time[stormAt])}.` });
  if (wetNow && rainAt <= 0) out.push({ kind: 'rain', text: 'Зараз іде дощ: парасолька знадобиться.' });
  else if (rainAt > 0) {
    const p = h.precipitation_probability[rainAt] ?? 0;
    out.push({ kind: 'rain', text: p >= 50 ? `Візьми парасольку: дощ імовірний з ${hh(h.time[rainAt])} (${p} %).`
      : `Можливий дощ з ${hh(h.time[rainAt])} (${p} %): парасолька не завадить.` });
  }
  if (snowAt >= 0) out.push({ kind: 'snow', text: `Можливий сніг ${snowAt === 0 ? 'вже зараз' : 'з ' + hh(h.time[snowAt])}.` });
  if (minT <= 1) out.push({ kind: 'ice', text: `До ${deg(minT)}: можлива ожеледиця (Glätte), обережно на дорозі й велосипеді.` });
  const gust = Math.max(d.now.wind_gusts_10m || 0, ...(h.wind_gusts_10m || []).slice(0, n));
  if (gust >= 75) out.push({ kind: 'wind', text: `Сильні пориви вітру до ${Math.round(gust)} км/год: обережно під деревами.` });
  else if (gust >= 50) out.push({ kind: 'wind', text: `Пориви вітру до ${Math.round(gust)} км/год.` });
  if (!out.some((a) => a.kind === 'rain' || a.kind === 'snow' || a.kind === 'storm')) out.push({ kind: 'dry', text: `Опадів найближчі ${n} годин не очікується.` });
  return out;
}
