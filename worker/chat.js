// «Харчування» from the chat with the bot, without opening the app, and the Sunday report.
//
//   /їжа гречка 200 · /їжа 2 яйця · /їжа борщ тарілка   (also /kcal, /food) — into the diary, the meal by the time of day
//   /вага 111,4   (also /vaga, /kg)                     — today's weight
//   /вода · /вода 500   (also /voda)                    — a glass (250 ml) or as much as said
//   /день   (also /den, /today)                         — today so far
//   /скасувати   (also /undo)                           — takes back the last thing written from the chat today
// Everything goes into the person's own records (forma.js), so the app shows it at once.
import { FOODS } from '../yizha/foods.js';
import { find, fromRow, parseFood, portionNamed } from '../yizha/find.js';
import { target, valid, sum, portion, waterGoal, GLASS, dayNum, dayOf } from '../yizha/calc.js';
import { facts, achievements } from '../yizha/goals.js';
import { berlinDay } from '../smittia/due.js';
import { berlinClock } from './deliver.js';
import { askForma } from './forma.js';
import { button } from './config.js';

export const DIARY_BUTTON = button('Щоденник', 'yizha/');
const BUILT = FOODS.map(fromRow);
const CMD = { food: ['їжа', 'їм', 'kcal', 'food', 'essen'], weight: ['вага', 'vaga', 'kg', 'weight'], water: ['вода', 'voda', 'water'],
  day: ['день', 'den', 'today', 'сьогодні'], undo: ['скасувати', 'undo', 'відміна'] };
const KIND = Object.fromEntries(Object.entries(CMD).flatMap(([k, list]) => list.map((w) => [w, k])));
const MEAL = { b: 'сніданок', l: 'обід', d: 'вечеря', s: 'перекус' };
const fmt = (n, d = 0) => Number(n || 0).toLocaleString('uk-UA', { maximumFractionDigits: d });
const rid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

export const HEALTH_HELP = '\n\nЩоденник харчування:\n/їжа гречка 200 — записати (або /kcal)\n/вага 111,4 — вага на сьогодні\n/вода — склянка води (/вода 500 — скільки випито)\n/день — підсумок дня\n/скасувати — прибрати останній запис з чату';

const put = (env, id, changes) => askForma(env, id, { op: 'sync', since: Number.MAX_SAFE_INTEGER, changes });
const mealNow = (now) => { const h = berlinClock(now).hour; return h < 11 ? 'b' : h < 16 ? 'l' : h < 21 ? 'd' : 's'; };

async function dayLine(env, id, now) {
  const day = berlinDay(now), w = await askForma(env, id, { op: 'week', today: day });
  const eaten = sum(w.entries.filter((e) => e.id.startsWith(day + '~'))).kcal;
  const ws = w.weights.sort((a, b) => (a.day < b.day ? -1 : 1)), kg = ws.length ? ws[ws.length - 1].kg : w.profile && w.profile.start ? w.profile.start.kg : null;
  const t = valid(w.profile) && kg ? target(w.profile, kg, Number(day.slice(0, 4))).kcal : null;
  const water = (w.days[day] && w.days[day].water) || 0;
  return { day, w, kg, t, eaten, water, text: `Сьогодні: ${fmt(eaten)}${t ? ` з ${fmt(t)} ккал${t - eaten >= 0 ? `, лишається ${fmt(t - eaten)}` : `, на ${fmt(eaten - t)} більше за норму`}` : ' ккал'}` +
    `${kg ? ` · вода ${fmt(water / 1000, 2)} з ${fmt(waterGoal(kg) / 1000, 1)} л` : ''}${w.moves.some((m) => m.id.startsWith(day) && m.kind === 'w') ? ' · тренування ✓' : ''}.` };
}

// {text, button} for a health command, null for anything else
export async function healthAnswer(env, text, id, now) {
  const m = String(text).trim().match(/^\/([\p{L}]+)(?:@\w+)?\s*([\s\S]*)$/u);
  const kind = m && KIND[m[1].toLowerCase()];
  if (!kind) return null;
  if (!env.FORMA) return { text: 'Щоденник зараз недоступний.', button: DIARY_BUTTON };
  const rest = m[2].trim(), day = berlinDay(now);
  try {
    if (kind === 'day') return { text: (await dayLine(env, id, now)).text, button: DIARY_BUTTON };
    if (kind === 'undo') {
      const key = await env.SCANS.get('lastbot:' + id);
      if (!key || !key.includes('|' + day)) return { text: 'Сьогодні з чату ще нічого не записано.', button: DIARY_BUTTON };
      const [k, rid2] = key.split('|');
      await put(env, id, [{ k, id: rid2, u: Date.now(), d: 1 }]);
      await env.SCANS.delete('lastbot:' + id);
      return { text: '↩️ Прибрано останній запис з чату.\n' + (await dayLine(env, id, now)).text, button: DIARY_BUTTON };
    }
    if (kind === 'weight') {
      const kg = Number(rest.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!(kg >= 30 && kg <= 300)) return { text: 'Напиши вагу в кілограмах, наприклад: /вага 111,4', button: DIARY_BUTTON };
      const was = await askForma(env, id, { op: 'week', today: day }), ws = was.weights.filter((w) => w.day < day).sort((a, b) => (a.day < b.day ? -1 : 1));
      await put(env, id, [{ k: 'w', id: day, u: Date.now(), v: { kg: Math.round(kg * 10) / 10 } }]);
      await env.SCANS.put('lastbot:' + id, 'w|' + day, { expirationTtl: 86400 });
      const prev = ws[ws.length - 1], start = was.profile && was.profile.start ? was.profile.start.kg : null;
      const diff = (a, b) => { const d = Math.round((a - b) * 10) / 10; return d === 0 ? 'без змін' : `${d < 0 ? '−' : '+'}${fmt(Math.abs(d), 1)} кг`; };
      return { text: `⚖️ Записано: ${fmt(kg, 1)} кг.` + (prev ? `\nВід ${new Date(prev.day + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', timeZone: 'UTC' })}: ${diff(kg, prev.kg)}.` : '') + (start ? `\nВід старту: ${diff(kg, start)}.` : ''), button: button('Графік ваги', 'yizha/?tab=progress') };
    }
    if (kind === 'water') {
      const p = parseFood(rest), ml = !rest ? GLASS : p.g != null ? p.g : p.count ? p.count * GLASS : NaN;   // «/вода», «/вода 500», «/вода 1,5 л», «/вода 2» (склянки)
      if (!(ml > 0 && ml <= 3000)) return { text: 'Напиши, скільки випито, наприклад: /вода 500', button: DIARY_BUTTON };
      const cur = await askForma(env, id, { op: 'get', k: 'd', id: day }), v = { ...(cur.v || {}), water: Math.round(((cur.v && cur.v.water) || 0) + ml) };
      await put(env, id, [{ k: 'd', id: day, u: Date.now(), v }]);
      const d = await dayLine(env, id, now);
      return { text: `💧 +${fmt(ml)} мл.\n${d.text}`, button: DIARY_BUTTON };
    }
    // food
    if (!rest) return { text: 'Напиши, що з’їв(ла) і скільки, наприклад:\n/їжа гречка 200\n/їжа 2 яйця\n/їжа борщ тарілка', button: DIARY_BUTTON };
    const want = parseFood(rest), own = (await askForma(env, id, { op: 'mine' })).foods || [], all = [...own, ...BUILT];
    let hits = want.q ? find(all, want.q, 5) : [], hint = '';
    if (!hits.length && want.q.split(' ').length > 1) {   // «борщ тарілка»: the last word may be the portion
      const w = want.q.split(' '); hint = w.pop(); hits = find(all, w.join(' '), 5);
    }
    if (!hits.length) return { text: `Не знайшов «${want.q}». Спробуй інакше (наприклад, «гречка варена»), або відкрий щоденник: там є пошук упакованих продуктів і штрихкоди.`, button: DIARY_BUTTON };
    const food = hits[0], por = portionNamed(food, hint || want.q) || (food.por || [])[0] || null;
    const g = want.g != null ? want.g : por ? Math.round((want.count || 1) * por[1]) : 100;
    if (!(g > 0 && g <= 5000)) return { text: 'Скільки саме? Наприклад: /їжа гречка 200', button: DIARY_BUTTON };
    const meal = mealNow(now), eid = `${day}~${rid()}`;
    const v = { day, meal, fid: food.id, n: food.n, b: food.brand || '', ic: food.thumb || food.ic || '', g, pn: want.g == null && por ? por[0] : '', pq: want.g == null && por ? (want.count || 1) : 0,
      kcal: food.kcal, p: food.p, f: food.f, c: food.c, l: food.l ? 1 : 0, at: now.getTime(), from: 'chat' };
    await put(env, id, [{ k: 'e', id: eid, u: Date.now(), v }]);
    await env.SCANS.put('lastbot:' + id, 'e|' + eid, { expirationTtl: 86400 });
    const d = await dayLine(env, id, now), other = hits.slice(1, 4).map((x) => x.n);
    return { text: `✅ ${food.n}, ${fmt(g)} ${food.l ? 'мл' : 'г'} — ${fmt(portion(food, g).kcal)} ккал (${MEAL[meal]}).\n${d.text}` +
      (other.length ? `\n\nНе те? Схожі: ${other.join('; ')}. /скасувати — прибрати.` : ''), button: DIARY_BUTTON };
  } catch (e) {
    console.log('health command failed', kind, String(e && e.message || e));
    return { text: 'Зараз не вдалося записати. Спробуй ще раз за хвилину або в застосунку.', button: DIARY_BUTTON };
  }
}

/* ---------------- the Sunday report ---------------- */
// Sundays at the person's half hour (zsub:, switched on in «Харчування» → «Прогрес»), with the partners' week
export async function sendWeekly(env, now, out, deliver, partnersOf) {
  const { hour, minute, weekday } = berlinClock(now);
  if (weekday !== 6 || !env.SCANS || !env.BOT_TOKEN || !env.FORMA) return { sent: 0, why: 'not Sunday' };
  const slot = `${String(hour).padStart(2, '0')}:${minute < 30 ? '00' : '30'}`, prev = `${String(minute < 30 ? hour - 1 : hour).padStart(2, '0')}:${minute < 30 ? '30' : '00'}`;
  const day = berlinDay(now);
  return deliver(env, out, { job: 'weekly', day, prefix: 'zsub:', finish: false, button: button('Прогрес', 'yizha/?tab=progress'),
    due: (rec) => !!rec && [slot, prev].includes(rec.time || '19:00'),
    text: async (rec) => weekReport(await askForma(env, rec.id, { op: 'week', today: day }), await partnersOf(env, rec.id, day).catch(() => [])) });
}

export function weekReport(w, partners = []) {
  const day = w.today, n = dayNum(day), from = dayOf(n - 6);
  const ws = [...w.weights].sort((a, b) => (a.day < b.day ? -1 : 1)), last = ws[ws.length - 1];
  const before = [...ws].reverse().find((x) => x.day < from) || ws.find((x) => x.day >= from);
  const lines = [`📊 Тиждень ${new Date(from + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', timeZone: 'UTC' })} – ${new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', timeZone: 'UTC' })}`];
  if (last && before && before !== last) {
    const d = Math.round((last.kg - before.kg) * 10) / 10;
    lines.push(`⚖️ Вага: ${fmt(last.kg, 1)} кг (${d === 0 ? 'без змін' : `${d < 0 ? '−' : '+'}${fmt(Math.abs(d), 1)} кг за тиждень`})`);
  } else if (last) lines.push(`⚖️ Вага: ${fmt(last.kg, 1)} кг. Зважся кілька разів на тиждень, і я покажу, як вона змінюється.`);
  const week = w.entries.filter((e) => e.id.slice(0, 10) >= from), days = [...new Set(week.map((e) => e.id.slice(0, 10)))];
  const kgFor = last ? last.kg : w.profile && w.profile.start ? w.profile.start.kg : 70, t = valid(w.profile) ? target(w.profile, kgFor, Number(day.slice(0, 4))).kcal : null;
  const inT = t ? days.filter((d) => sum(week.filter((e) => e.id.startsWith(d))).kcal <= t * 1.05).length : null;
  lines.push(days.length ? `🍽 Записано ${days.length} з 7 днів${t ? `, у нормі ${inT}` : ''}, у середньому ${fmt(sum(week).kcal / days.length)} ккал на день` : '🍽 Цього тижня щоденник порожній. Навіть кілька записів на день допомагають.');
  const moves = w.moves.filter((m) => m.id.slice(0, 10) >= from), tr = moves.filter((m) => m.kind === 'w'), walks = moves.filter((m) => m.kind === 'walk');
  lines.push(`💪 Тренувань: ${tr.length} з ${w.planDays}${walks.length ? `, прогулянок: ${walks.length} (${fmt(walks.reduce((a, x) => a + (x.min || 0), 0))} хв)` : ''}`);
  const dd = Object.values(w.days), water = dd.filter((x) => x.water > 0), sleep = dd.filter((x) => x.sleep > 0);
  if (water.length) lines.push(`💧 Вода: у середньому ${fmt(water.reduce((a, x) => a + x.water, 0) / water.length / 1000, 1)} л на день`);
  if (sleep.length) lines.push(`😴 Сон: у середньому ${fmt(sleep.reduce((a, x) => a + x.sleep, 0) / sleep.length, 1)} год`);
  const f = facts(w), got = achievements(f).filter((a) => a.got);
  if (f.logStreak >= 3) lines.push(`🔥 Серія записів: ${f.logStreak} ${f.logStreak % 10 === 1 && f.logStreak % 100 !== 11 ? 'день' : [2, 3, 4].includes(f.logStreak % 10) && ![12, 13, 14].includes(f.logStreak % 100) ? 'дні' : 'днів'} поспіль`);
  if (got.length) lines.push(`🏆 Досягнень: ${got.length} з ${achievements(f).length}. Останнє: ${got[got.length - 1].icon} ${got[got.length - 1].uk}`);
  if (partners.length) lines.push('', '👥 Разом:', ...partners.map((p) => `${p.name}: ${p.lost != null ? `${p.lost > 0 ? '−' : ''}${fmt(Math.abs(p.lost), 1)} кг від старту` : 'вага ще не записана'}, ${p.workouts} ${p.workouts === 1 ? 'тренування' : 'тренувань'}, у нормі ${p.inTarget ?? 0} з ${p.logged} днів`));
  lines.push('', tr.length >= w.planDays && (inT ?? 0) >= 4 ? 'Чудовий тиждень! Так тримати.' : 'Новий тиждень — нова нагода. Почни з одного: записати сніданок або одне тренування.');
  return lines.join('\n');
}
