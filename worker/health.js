// Watching over the bot itself. People who switched "Сповіщення про збої" on (KV asub:<id>) are told when:
//   · a service the app depends on stops answering (VRR timetable, Open-Meteo weather, DWD warnings): after two failed
//     checks in a row, about an hour, and again when it is back
//   · one of the cron jobs throws (once a day per job)
//   · the waste calendar is about to run out and next year's dates are not in the app yet (Mondays, last 30 days)
// With nobody subscribed nothing is checked.

import cal from '../smittia/kalender.json' with { type: 'json' };
import { berlinDay } from '../smittia/due.js';
import { fetchWarnings } from './warn.js';
import { weather, departures } from './transit.js';

export const ALERTS = 'asub:';
const CHECKS = [
  ['vrr', 'VRR (розклад транспорту)', 'Відправлення в застосунку й у зведенні можуть не показуватись.', async () => { const d = await departures('de:05170:37032', 1); if (!d.stop.name) throw new Error('empty answer'); }],
  ['meteo', 'Open-Meteo (погода)', 'Погода в застосунку може не оновлюватись.', () => weather('51.66', '6.45')],
  ['dwd', 'Bright Sky (попередження DWD)', 'Попередження про негоду можуть не надходити.', () => fetchWarnings('51.66', '6.45')],
];
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400000);

async function anyone(env) {
  const page = await env.SCANS.list({ prefix: ALERTS });
  return page.keys.length > 0;
}

// Runs the jobs side by side; a job that throws does not stop the others. Returns [[name, error message]].
export async function runJobs(jobs) {
  const failed = [];
  await Promise.all(jobs.map(async ([name, run]) => {
    try { await run(); } catch (e) { console.log('job failed', name, String(e && e.stack || e)); failed.push([name, String(e && e.message || e).slice(0, 200)]); }
  }));
  return failed;
}

export async function watch(env, now, failedJobs, alert) {
  if (!env.SCANS || !env.BOT_TOKEN || !(await anyone(env))) return { sent: 0 };
  const day = berlinDay(now), out = [];

  for (const [name, message] of failedJobs) {
    const key = `aerr:${name}:${day}`;
    if (await env.SCANS.get(key)) continue;
    await env.SCANS.put(key, '1', { expirationTtl: 2 * 86400 });
    out.push(`⚠️ Збій у завданні бота «${name}»: ${message}\n\nСьогодні про цей збій більше не писатиму.`);
  }

  let state = {};
  try { state = JSON.parse(await env.SCANS.get('health')) || {}; } catch { /* first run */ }
  const before = JSON.stringify(state);
  await Promise.all(CHECKS.map(async ([id, title, effect, check]) => {
    const s = state[id] || { fails: 0, alerted: false };
    try {
      await check();
      if (s.alerted) out.push(`✅ ${title} знову відповідає.`);
      state[id] = { fails: 0, alerted: false };
    } catch (e) {
      s.fails = Math.min(s.fails + 1, 99);
      if (s.fails >= 2 && !s.alerted) { s.alerted = true; out.push(`⚠️ ${title} не відповідає вже близько години. ${effect} Я напишу, коли запрацює.`); }
      state[id] = s;
    }
  }));
  if (JSON.stringify(state) !== before) await env.SCANS.put('health', JSON.stringify(state));

  const note = calendarNote(now);
  if (note && !(await env.SCANS.get('acal:' + day))) { await env.SCANS.put('acal:' + day, '1', { expirationTtl: 2 * 86400 }); out.push(note); }

  let sent = 0;
  for (const text of out) sent += (await alert(text)).sent || 0;
  return { sent, messages: out.length };
}

// Mondays at 10:00 in the last 30 days of the calendar (and after its end): next year's dates are still missing
export function calendarNote(now) {
  const day = berlinDay(now), left = daysBetween(day, cal.until);
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  if (left > 30 || !/^Mon,? 10:[0-2]\d$/.test(t)) return null;
  const until = new Date(cal.until + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return left >= 0
    ? `🗓 Календар вивозу сміття в застосунку закінчується ${until} (залишилось ${left} дн.). Дат на наступний рік ще немає: місто зазвичай публікує новий календар у грудні. Без нього нагадування про сміття з січня не приходитимуть.`
    : `🗓 Календар вивозу сміття в застосунку закінчився ${until}. Нагадування про сміття не приходять, доки не додано календар на новий рік.`;
}
