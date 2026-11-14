// What the bot says on its own: the morning digest, the answers to chat commands, and the lines both are built from.
//
//   digest (kind "ranok", KV bsub:<id>)   one message at the chosen half hour (06:00–09:00 in Xanten): weather and what
//                                         it means for going out, DWD warnings, bins today or tomorrow, the next
//                                         departures from the person's pinned stops, the word of the day
//   profile (KV prof:<id>)                place, waste choices and stops as chosen in the app; the commands answer for them.
//                                         Stops pinned in «Транспорт» (up to four) come first; else the stop that was open there
//   commands (POST /tg, Telegram webhook) /bus /wetter /muell /wort /help, private chats only
//
// Each part of a message stands alone: if the weather service is down, the rest still goes out.

import cal from '../smittia/kalender.json' with { type: 'json' };
import { BINS, binsOn, berlinDay, prefsOf } from '../smittia/due.js';
import { wxText, deg, advice } from '../pogoda/wx.js';
import { PLACES, fetchWarnings } from './warn.js';
import { weather, departures, STOP_ID } from './transit.js';
import { wordText, WORD_BUTTON } from './word.js';
import { button } from './config.js';
import { tgApi } from './telegram.js';
import { admit, allowedId } from './access.js';
import { deliver } from './deliver.js';

export const HOME_BUTTON = button('Відкрити застосунок');
const BUS_BUTTON = button('Транспорт', 'transport/');
const WX_BUTTON = button('Погода', 'pogoda/');
const WASTE_BUTTON = button('Розклад', 'smittia/');
export const TIMES = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'];
const DEFAULT_STOP = { stop: 'de:05170:37032', stopName: 'Xanten Bahnhof' };
export const MAX_PINS = 4;
const ICON = { storm: '⛈', rain: '☔', snow: '🌨', ice: '🧊', wind: '💨', dry: '🌤' };
const LEVEL_DOT = { 1: '🟡', 2: '🟠', 3: '🔴', 4: '🟣' };

const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const hm = (iso) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const dateUk = (day, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { ...opts, timeZone: 'UTC' });
const binList = (bins) => bins.map(({ bin, only14 }) => `${BINS[bin].dot} ${BINS[bin].uk}${only14 ? ' (лише двотижневі)' : ''}`).join(', ');

// Pinned stops as the app sends them (JSON [{id, name}]): known ids only, each once, at most four
export function stopsOf(raw) {
  let list = [];
  try { list = JSON.parse(String(raw || '[]')); } catch { return []; }
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const x of list) {
    if (!x || !STOP_ID.test(String(x.id)) || out.some((y) => y.id === x.id)) continue;
    out.push({ id: String(x.id), name: clip(x.name, 60) || 'Зупинка' });
    if (out.length === MAX_PINS) break;
  }
  return out;
}
// The stops a message is about: the pinned ones, else the one stop the app sent before pins existed
export function stopsFor(p) {
  if (p && Array.isArray(p.stops) && p.stops.length) return p.stops.map((x) => ({ stop: x.id, stopName: x.name }));
  return p && p.stop ? [{ stop: p.stop, stopName: p.stopName }] : [];
}

// The choices sent by the app, cleaned up: a known place, the waste choices, stops, a half hour
export function profileOf(f) {
  const get = (k) => (f.get(k) == null ? '' : String(f.get(k)));
  const waste = f.has('district') ? prefsOf(cal, { district: get('district'), rhythm: get('rhythm'), bins: f.has('bins') ? get('bins').split(',') : undefined }) : null;
  const stop = STOP_ID.test(get('stop')) ? get('stop') : '';
  return {
    place: PLACES[get('place')] ? get('place') : 'Xanten',
    ...(waste ? { waste } : {}),
    ...(stop ? { stop, stopName: clip(get('stopName'), 60) || 'Зупинка' } : {}),
    ...(f.has('stops') ? { stops: stopsOf(get('stops')) } : {}),
    time: TIMES.includes(get('time')) ? get('time') : '07:00',
  };
}

/* ---------------- the lines ---------------- */
export async function weatherLines(place) {
  const [lat, lon] = PLACES[place].map((n) => n.toFixed(2));
  const d = await weather(lat, lon), day = d.daily;
  const lines = [`🌡 ${place}: зараз ${deg(d.now.temperature_2m)}, ${wxText(d.now.weather_code).toLowerCase()}. Сьогодні ${deg(day.temperature_2m_min[0])}…${deg(day.temperature_2m_max[0])}.`];
  for (const a of advice(d).slice(0, 3)) lines.push(`${ICON[a.kind] || '•'} ${a.text}`);
  return lines;
}
export async function warnLines(place) {
  const { warnings } = await fetchWarnings(...PLACES[place].map((n) => n.toFixed(2)));
  return warnings.slice(0, 3).map((w) => `${LEVEL_DOT[w.level]} Попередження DWD: ${w.uk}` + (w.expires ? ` (до ${hm(w.expires)})` : ''));
}
// today's pickup, or tomorrow's (then the bins go out tonight); nothing when neither
export function wasteLines(waste, day) {
  const today = binsOn(cal, day, waste), next = berlinDay(new Date(day + 'T12:00:00Z'), 1), tomorrow = binsOn(cal, next, waste);
  const out = [];
  if (today.length) out.push(`🗑 Сьогодні вивозять: ${binList(today)}.`);
  if (tomorrow.length) out.push(`🗑 Завтра вивозять: ${binList(tomorrow)}. Вистав баки сьогодні ввечері.`);
  return out;
}
export function wasteNext(waste, day, n = 3) {
  const out = [];
  for (let i = 0; i < 70 && out.length < n; i++) {
    const d = berlinDay(new Date(day + 'T12:00:00Z'), i), bins = binsOn(cal, d, waste);
    if (bins.length) out.push(`${i === 0 ? 'Сьогодні' : i === 1 ? 'Завтра' : dateUk(d, { weekday: 'short', day: 'numeric', month: 'long' })}: ${binList(bins)}`);
  }
  return out;
}
export async function busLines(stop, name, now, n = 4) {
  const d = await departures(stop, 16), at = (x) => Date.parse(x.est || x.plan);
  const next = d.deps.filter((x) => !x.gone && at(x) >= now.getTime() - 30000).sort((a, b) => at(a) - at(b)).slice(0, n);
  const title = clip((d.stop.name || name).replace(/,\s*/, ' '), 60);
  if (!next.length) return [`🚌 ${title}: найближчим часом відправлень немає.`];
  return [`🚌 ${title}`, ...next.map((x) => {
    const late = x.est ? Math.round((Date.parse(x.est) - Date.parse(x.plan)) / 60000) : 0;
    return `${hm(x.est || x.plan)}  ${x.line} → ${x.dest}${late >= 1 ? ` (+${late} хв)` : ''}`;
  })];
}
// Departures for several stops, one block each: fewer lines per stop the more stops there are. A stop that cannot be
// read says so in its block; when none can be read the error goes up (the command then says "try again").
export async function busBlocks(list, now, n = list.length > 2 ? 3 : list.length > 1 ? 4 : 6) {
  const got = await Promise.allSettled(list.map((s) => busLines(s.stop, s.stopName, now, n)));
  if (got.every((g) => g.status === 'rejected')) throw got[0].reason;
  return got.map((g, i) => (g.status === 'fulfilled' ? g.value : [`🚌 ${list[i].stopName}: розклад зараз недоступний.`]));
}

/* ---------------- the morning digest ---------------- */
export async function briefText(rec, now) {
  const day = berlinDay(now), place = PLACES[rec.place] ? rec.place : 'Xanten';
  const part = async (make, failed) => { try { return await make(); } catch (e) { console.log('digest part failed', String(e && e.message || e)); return failed ? [failed] : []; } };
  const stops = stopsFor(rec);
  const [wx, warn, bus] = await Promise.all([
    part(() => weatherLines(place), '🌡 Погода зараз недоступна.'),
    part(() => warnLines(place)),
    stops.length ? busBlocks(stops, now, stops.length > 1 ? 3 : 4).catch(() => [['🚌 Розклад зараз недоступний.']]) : [],
  ]);
  const waste = rec.waste ? wasteLines(rec.waste, day) : [];
  const word = wordText(day).split('\n')[0];
  const blocks = [[`Доброго ранку${rec.name ? ', ' + rec.name : ''}! ${dateUk(day)[0].toUpperCase() + dateUk(day).slice(1)}.`], [...wx, ...warn], waste, ...bus, [word]];
  return blocks.filter((b) => b.length).map((b) => b.join('\n')).join('\n\n');
}
export function briefConfirmText(rec) {
  const stops = stopsFor(rec).map((s) => s.stopName);
  return `Ранкове зведення увімкнено. Щодня о ${rec.time} я надішлю одне повідомлення: погода для ${rec.place} і попередження DWD` +
    (rec.waste ? ', чи вивозять сміття' : '') + (stops.length ? `, найближчі відправлення ${stops.length > 1 ? 'із зупинок' : 'із зупинки'} ${stops.join(', ')}` : '') + ', слово дня.';
}

// Every 30 minutes: the digest for everyone whose half hour it is, once a day each. Someone the run could not reach
// (Telegram busy, the run's budget used up) gets it in the next half hour; later than that it would not be a morning one.
export async function sendBriefs(env, now, out) {
  if (!env.SCANS || !env.BOT_TOKEN) return { sent: 0 };
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now).split(':');
  const slot = `${h}:${Number(m) < 30 ? '00' : '30'}`, day = berlinDay(now), i = TIMES.indexOf(slot);
  const prev = TIMES[i - 1] || (slot === '09:30' ? '09:00' : null);
  if (i < 0 && !prev) return { sent: 0, why: 'no digest at ' + slot };
  const due = (rec) => !!rec && [slot, prev].includes(rec.time || '07:00');
  return { ...(await deliver(env, out, { job: 'brief', day, prefix: 'bsub:', due, text: (rec) => briefText(rec, now), button: HOME_BUTTON, finish: false,
    legacyFor: (id) => `bsent:${id}:${day}` })), slot };
}

/* ---------------- chat commands ---------------- */
export const COMMANDS = [
  { command: 'bus', description: 'Найближчі відправлення з моїх зупинок' },
  { command: 'wetter', description: 'Погода зараз і попередження DWD' },
  { command: 'muell', description: 'Коли вивозять сміття' },
  { command: 'wort', description: 'Німецьке слово дня' },
  { command: 'help', description: 'Що вміє бот' },
];
const HELP = 'Я бот D-SIM’YA: помічник для життя в Німеччині.\n\n' +
  '/bus — найближчі відправлення з твоїх закріплених зупинок\n/wetter — погода й попередження DWD\n/muell — коли вивозять сміття\n/wort — слово дня\n\n' +
  'Зупинки, місце й район вивозу я беру з застосунку: зупинки закріплюються кнопкою 📌 у розділі «Транспорт». Там же вмикаються нагадування й ранкове зведення.';

// The person's choices: the profile saved by the app, else what their reminders know
async function profile(env, id) {
  const read = async (k) => { try { return JSON.parse(await env.SCANS.get(k)); } catch { return null; } };
  const p = (await read('prof:' + id)) || (await read('bsub:' + id)) || {};
  if (!p.waste) { const s = await read('sub:' + id); if (s && s.district) p.waste = prefsOf(cal, s); }
  if (!p.place || !PLACES[p.place]) { const w = await read('wsub:' + id); p.place = w && PLACES[w.place] ? w.place : 'Xanten'; }
  return p;
}

// {text, button} for a command, or null for anything that is not one
export async function answer(env, text, userId, now) {
  const cmd = (String(text).trim().match(/^\/([a-z]+)(?:@\w+)?(?:\s|$)/i) || [])[1];
  if (!cmd) return null;
  const c = cmd.toLowerCase();
  if (c === 'start' || c === 'help' || c === 'hilfe') return { text: HELP, button: HOME_BUTTON };
  if (c === 'wort') return { text: wordText(berlinDay(now)), button: WORD_BUTTON };
  const p = env.SCANS ? await profile(env, userId) : { place: 'Xanten' };
  try {
    if (c === 'bus') {
      const mine = stopsFor(p), pinned = Array.isArray(p.stops) && p.stops.length > 0;
      const blocks = await busBlocks(mine.length ? mine : [DEFAULT_STOP], now);
      const tip = pinned ? '' : mine.length ? '\n\nЩоб я показував кілька зупинок, закріпи їх кнопкою 📌 у розділі «Транспорт».'
        : '\n\nСвої зупинки закріпи кнопкою 📌 у розділі «Транспорт»: тоді я показуватиму їх.';
      return { text: blocks.map((b) => b.join('\n')).join('\n\n') + tip, button: BUS_BUTTON };
    }
    if (c === 'wetter') {
      const [wx, warn] = await Promise.all([weatherLines(p.place), warnLines(p.place).catch(() => [])]);
      return { text: [...wx, ...(warn.length ? ['', ...warn] : [])].join('\n'), button: WX_BUTTON };
    }
    if (c === 'muell') {
      if (!p.waste) return { text: 'Щоб я знав твій район вивозу, вибери місце й баки в розділі «Сміття».', button: WASTE_BUTTON };
      const next = wasteNext(p.waste, berlinDay(now));
      return { text: next.length ? `🗑 Найближчі вивози (район ${p.waste.district}):\n${next.join('\n')}` : '🗑 У календарі більше немає дат на цей рік. Нові з’являться разом із календарем міста.', button: WASTE_BUTTON };
    }
  } catch (e) {
    console.log('command failed', c, String(e && e.message || e));
    return { text: 'Зараз не вдалося отримати дані. Спробуй ще раз за хвилину.', button: HOME_BUTTON };
  }
  return { text: 'Такої команди я не знаю.\n\n' + HELP, button: HOME_BUTTON };
}

/* ---------------- the webhook that brings commands to the Worker ---------------- */
// The secret Telegram sends with every update: derived from the bot token, so it needs no setting of its own
export async function hookSecret(token) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(token), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('d-simya webhook')));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const api = tgApi;
const PRIVATE = 'Це приватний бот однієї родини, тож відповідати тут я не можу.';

// POST /tg from Telegram. Always answers 200 (otherwise Telegram sends the same update again and again).
export async function webhook(request, env, tgSend) {
  const ok = new Response('ok');
  if (request.method !== 'POST' || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== await hookSecret(env.BOT_TOKEN)) return new Response('forbidden', { status: 403 });
  let u = null;
  try { u = await request.json(); } catch { return ok; }
  const msg = u && u.message;
  if (!msg || typeof msg.text !== 'string' || !msg.chat || msg.chat.type !== 'private' || !msg.from || msg.from.is_bot) return ok;
  if (!(await admit(env, msg.from))) {
    // someone outside the family: one line, and only when they press /start themselves; anything else, silence
    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(msg.text.trim())) await tgSend(env, msg.chat.id, PRIVATE, HOME_BUTTON);
    return ok;
  }
  const a = await answer(env, msg.text.slice(0, 200), msg.from.id, new Date());
  if (a) await tgSend(env, msg.chat.id, a.text, a.button);
  return ok;
}

// POST /commands (signed in): action=on|off|status. Switching on points the bot's webhook at this Worker and gives
// Telegram the command list; a webhook that points somewhere else is never replaced.
export async function commands(request, env, signed, reply, tgSend) {
  const action = signed.form.get('action'), mine = new URL(request.url).origin + '/tg';
  const info = await api(env, 'getWebhookInfo');
  const url = (info.result && info.result.url) || '';
  if (action === 'status') return reply(200, { ok: true, on: url === mine });
  if (action === 'on') {
    if (url && url !== mine) return reply(200, { ok: false, on: false, error: 'other_webhook' });
    const set = await api(env, 'setWebhook', { url: mine, secret_token: await hookSecret(env.BOT_TOKEN), allowed_updates: ['message'], max_connections: 5 });
    if (!set.ok) return reply(502, { ok: false, on: false, error: 'telegram' });
    await api(env, 'setMyCommands', { commands: COMMANDS });
    if (env.SCANS) await env.SCANS.put('hook', JSON.stringify({ by: signed.user.id }));
    await tgSend(env, signed.user.id, 'Команди в чаті увімкнено.\n\n' + HELP, HOME_BUTTON);
    return reply(200, { ok: true, on: true });
  }
  if (action === 'off') {
    if (url !== mine) return reply(200, { ok: true, on: false });
    let by = null;
    try { by = JSON.parse(await env.SCANS.get('hook')).by; } catch { /* not recorded */ }
    // only who switched them on, as long as that person may still use the bot (else anyone in the family)
    if (by && by !== signed.user.id && (await allowedId(env, by)) !== false) return reply(200, { ok: false, on: true, error: 'not_yours' });
    await api(env, 'deleteWebhook');
    await api(env, 'deleteMyCommands');
    if (env.SCANS) await env.SCANS.delete('hook');
    return reply(200, { ok: true, on: false });
  }
  return reply(400, { ok: false, error: 'action: on, off or status' });
}
