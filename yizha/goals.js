// Streaks and achievements of «Харчування» and «Тренування», worked out from the records (no records of their own):
// the same on the page and in the bot's Sunday report.
import { streak, target, valid, sum, dayNum, waterGoal } from './calc.js';

// data: {today, profile, entries [{id, ...}], weights [{day, kg}], moves [{id, kind}], days {day: {water, ...}}}
export function facts(data) {
  const { today, profile } = data;
  const byDay = new Map();
  for (const e of data.entries) { const d = e.id.slice(0, 10); if (!byDay.has(d)) byDay.set(d, []); byDay.get(d).push(e); }
  const weights = [...data.weights].sort((a, b) => (a.day < b.day ? -1 : 1));
  const kgOn = (d) => { let kg = profile && profile.start ? profile.start.kg : null; for (const w of weights) { if (w.day > d) break; kg = w.kg; } return kg; };
  const year = Number(today.slice(0, 4));
  const inTarget = (d) => { const es = byDay.get(d); if (!es || !valid(profile)) return false; return sum(es).kcal <= target(profile, kgOn(d), year).kcal * 1.05; };
  const workouts = data.moves.filter((m) => m.kind === 'w');
  const wDays = new Set(workouts.map((m) => m.id.slice(0, 10)));
  const waterOk = (d) => { const x = data.days[d]; return !!x && x.water >= waterGoal(kgOn(d) || 70); };
  const last = weights[weights.length - 1];
  const lost = profile && profile.start && last ? Math.round((profile.start.kg - last.kg) * 10) / 10 : 0;
  // weeks in a row (Monday to Sunday, the current one counts once it is reached) with at least `need` workouts
  const need = Math.max(1, data.planDays || 3);
  let weeks = 0;
  { let mon = dayNum(today) - ((new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7);
    const count = (m) => workouts.filter((w) => { const n = dayNum(w.id.slice(0, 10)); return n >= m && n < m + 7; }).length;
    if (count(mon) < need) mon -= 7;
    while (weeks < 520 && count(mon) >= need) { weeks++; mon -= 7; } }
  return {
    logStreak: streak(today, (d) => byDay.has(d)),
    normStreak: streak(today, inTarget),
    waterStreak: streak(today, waterOk),
    loggedDays: byDay.size, workouts: workouts.length, walks: data.moves.filter((m) => m.kind === 'walk').length, workoutWeeks: weeks,
    mornings: data.moves.filter((m) => m.kind === 'z' && m.q === 'morning').length, backs: data.moves.filter((m) => (m.kind === 'z' && m.q === 'back') || (m.kind === 'w' && m.plan === 'back')).length,
    trainedToday: wDays.has(today), lost, reached: !!(profile && last && last.kg <= profile.goal),
    tenth: !!(profile && profile.start && last && last.kg <= profile.start.kg * 0.9),
  };
}

// [{id, icon, uk, note, got}] — what was achieved, and what is next, in the order a person meets them
export function achievements(f) {
  const a = (id, icon, uk, note, got) => ({ id, icon, uk, note, got: !!got });
  return [
    a('first', '✏️', 'Перший запис', 'Записати, що з’їдено', f.loggedDays >= 1),
    a('log7', '📅', 'Тиждень записів', '7 днів поспіль у щоденнику', f.logStreak >= 7),
    a('norm5', '🎯', 'У нормі', '5 днів поспіль у межах норми', f.normStreak >= 5),
    a('water7', '💧', 'Водний тиждень', '7 днів поспіль норма води', f.waterStreak >= 7),
    a('kg1', '🌱', 'Мінус кілограм', 'Скинути перший кілограм', f.lost >= 1),
    a('fw1', '💪', 'Перше тренування', 'Пройти тренування до кінця', f.workouts >= 1),
    a('kg5', '🌿', 'Мінус 5 кг', 'П’ять кілограмів позаду', f.lost >= 5),
    a('log30', '🗓', 'Місяць записів', '30 днів поспіль у щоденнику', f.logStreak >= 30),
    a('morning7', '🌅', 'Ранкова звичка', '7 ранкових зарядок', f.mornings >= 7),
    a('fw10', '🏋️', 'Десять тренувань', '10 тренувань виконано', f.workouts >= 10),
    a('back10', '🧘', 'Турбота про спину', '10 занять для спини', f.backs >= 10),
    a('weeks4', '🔥', 'Чотири тижні', '4 тижні поспіль усі тренування за планом', f.workoutWeeks >= 4),
    a('kg10', '🌳', 'Мінус 10 кг', 'Десять кілограмів позаду', f.lost >= 10),
    a('tenth', '⭐', 'Мінус 10 %', 'Скинути десяту частину ваги: це вже помітно на здоров’ї', f.tenth),
    a('fw30', '🏅', 'Тридцять тренувань', '30 тренувань виконано', f.workouts >= 30),
    a('goal', '🏆', 'Мета', 'Досягти бажаної ваги', f.reached),
  ];
}
