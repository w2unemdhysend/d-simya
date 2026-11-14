// «Час виходити»: for a route saved in «Маршрут», the time to be there by, the days and the walk to the first stop.
// On those days the bot works out, with the live VRR times, the latest connection that still arrives in time and
// writes when to leave home: in the cron run before that moment (the runs are half an hour apart, so the message comes
// up to half an hour ahead and names the minute). Delays known by then are counted in.
//
// KV gsub:<id> → {id, name, plans: [{from, fromName, to, toName, by: 'HH:MM', days: [0..6], walk: minutes, dt: bool}]}
// KV go:<id>:<day>:<i> marks a plan done for the day.
import { berlinDay } from '../smittia/due.js';
import { button } from './config.js';
import { berlinClock } from './deliver.js';
import { allowedId } from './access.js';
import { STOP_ID } from './transit.js';

export const PREFIX = 'gsub:';
export const BUTTON = button('Маршрут', 'marshrut/');
export const MAX_PLANS = 3;
const SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];
const AHEAD = 32;   // minutes: a run sends what is due before the next run (and a little slack for a late run)
const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// The plans a page sends (form field "plans", JSON), cleaned up; null when there is nothing usable
export function leavePrefs(f) {
  let raw;
  try { raw = JSON.parse(String(f.get('plans') || '[]')); } catch { return null; }
  if (!Array.isArray(raw)) return null;
  const plans = raw.slice(0, 20).map((p) => {
    if (!p || !STOP_ID.test(String(p.from)) || !STOP_ID.test(String(p.to)) || p.from === p.to || !HHMM.test(String(p.by))) return null;
    const days = [...new Set((Array.isArray(p.days) ? p.days : []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
    return { from: String(p.from), fromName: clip(p.fromName, 60) || String(p.from), to: String(p.to), toName: clip(p.toName, 60) || String(p.to),
      by: String(p.by), days: days.length ? days : [0, 1, 2, 3, 4], walk: Math.max(0, Math.min(60, Math.round(Number(p.walk) || 0))), dt: p.dt !== false };
  }).filter(Boolean).slice(0, MAX_PLANS);
  return plans.length ? { plans } : null;
}

const daysText = (days) => (days.join() === '0,1,2,3,4' ? 'у будні' : days.length === 7 ? 'щодня' : 'у ' + days.map((d) => SHORT[d]).join(', '));
export function leaveConfirm(p) {
  return '«Час виходити» увімкнено:\n' + p.plans.map((x) => `• ${x.fromName} → ${x.toName}, бути на місці до ${x.by} ${daysText(x.days)}${x.walk ? `, до зупинки ${x.walk} хв пішки` : ''}`).join('\n') +
    '\n\nУ ці дні я напишу, коли виходити, щоб встигнути на останній рейс, який довезе вчасно, з урахуванням запізнень. Повідомлення прийде за пів години або ближче до виходу.';
}

const hm = (ms) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
const at = (p) => Date.parse(p.est || p.plan);
// The connection to take: the one leaving last that still arrives by `byMs`, not cancelled
export function pick(trips, byMs) {
  return (trips || []).filter((t) => !t.legs.some((l) => l.gone) && Date.parse(t.arrEst || t.arr) <= byMs + 30000)
    .sort((a, b) => Date.parse(b.depEst || b.dep) - Date.parse(a.depEst || a.dep))[0] || null;
}
// The message for one plan, or null when it is not yet time to write (or too late)
export function leaveText(plan, trip, nowMs) {
  const ride = trip.legs.find((l) => !l.walk) || trip.legs[0];
  // a walk VRR puts first (from a stop to a nearby platform) counts as part of the way: leave before it
  const leaveMs = Date.parse(trip.legs[0].from.est || trip.legs[0].from.plan) - plan.walk * 60000;
  const mins = Math.round((leaveMs - nowMs) / 60000);
  if (mins > AHEAD || mins < -5) return null;
  const late = ride.from.est ? Math.round((Date.parse(ride.from.est) - Date.parse(ride.from.plan)) / 60000) : 0;
  const head = mins <= 1 ? `🚶 Час виходити: зараз (о ${hm(leaveMs)})` : `🚶 Час виходити о ${hm(leaveMs)}, через ${mins} хв`;
  const lines = [`${head}, щоб бути в «${plan.toName}» до ${plan.by}.`,
    `${plan.walk ? `До зупинки «${ride.from.name}» ${plan.walk} хв пішки, звідти` : `З «${ride.from.name}»`} о ${hm(at(ride.from))} ${ride.line || 'пішки'}${ride.dir ? ` у бік ${ride.dir}` : ''}${ride.from.plat ? `, ${ride.mode === 'train' ? 'колія' : 'стоянка'} ${ride.from.plat}` : ''}.`,
    `Прибуття о ${hm(Date.parse(trip.arrEst || trip.arr))}${trip.changes ? `, ${trip.changes} ${trip.changes === 1 ? 'пересадка' : trip.changes < 5 ? 'пересадки' : 'пересадок'}` : ', без пересадок'}.`];
  if (late >= 2) lines.push(`Рейс запізнюється на ${late} хв: це вже враховано.`);
  if (trip.legs.some((l) => l.long)) lines.push('У цій поїздці є ICE, IC або EC: Deutschlandticket там не діє.');
  return lines.join('\n');
}

// One cron job: every plan of every person, on its days, in the hours before its time
export async function sendLeave(env, now, out, trip) {
  if (!env.SCANS || !env.BOT_TOKEN) return { sent: 0 };
  const { hour, minute, weekday } = berlinClock(now), nowMin = hour * 60 + minute, day = berlinDay(now);
  if (hour < 4) return { sent: 0, why: 'night' };
  const nowMs = Math.floor(now.getTime() / 60000) * 60000;
  let sent = 0, later = 0, cursor;
  do {
    const page = await env.SCANS.list({ prefix: PREFIX, cursor });
    for (const { name } of page.keys) {
      const id = Number(name.slice(PREFIX.length)); if (!Number.isSafeInteger(id)) continue;
      let rec; try { rec = JSON.parse(await env.SCANS.get(name)); } catch { rec = null; }
      if (!rec || !Array.isArray(rec.plans)) continue;
      for (const [i, plan] of rec.plans.entries()) {
        if (!plan.days.includes(weekday)) continue;
        const [h, m] = plan.by.split(':').map(Number), left = h * 60 + m - nowMin;
        if (left <= 0 || left > 180) continue;   // the trip is asked for within three hours of the time
        const mark = `go:${id}:${day}:${i}`;
        if (await env.SCANS.get(mark)) continue;
        const allowed = await allowedId(env, id);
        if (allowed === false) { await env.SCANS.delete(name); break; }
        if (allowed === null) { later++; continue; }
        let d;
        try { d = await trip(plan.from, plan.to, `${day}T${plan.by}`, !plan.dt, false, true); } catch (e) { console.log('leave: trip failed', String(e && e.message || e)); later++; continue; }
        const byMs = nowMs + left * 60000, best = pick(d.trips, byMs);
        let text = best ? leaveText(plan, best, nowMs) : null;
        if (!best && left <= 90) text = `⚠️ Не знайшов, як доїхати з «${plan.fromName}» до «${plan.toName}» до ${plan.by}: рейси скасовано або їх немає. Глянь інші варіанти в «Маршруті».`;
        if (!text) continue;
        const r = await out.send(id, text, BUTTON);
        if (r.ok) { sent++; await env.SCANS.put(mark, '1', { expirationTtl: 2 * 86400 }); }
        else if (r.blocked) { await env.SCANS.delete(name); break; }
        else later++;
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return { sent, later };
}
