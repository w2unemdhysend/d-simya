// The workout programmes of «Тренування»: three workouts that take turns (A, B, C), three times a week, getting a little
// harder every two weeks. Each workout: a warm-up, a circle of exercises done for time (work, rest) several rounds,
// and a cool-down. All at home, without equipment; a chair and a wall are enough.
// And short sessions outside the programme: a morning routine and a session for the back, any day.
import { MOVE } from './moves.js';

// week of the programme → seconds of work and rest, rounds of the circle
const STEPS = {
  soft: [{ from: 1, work: 30, rest: 30, rounds: 2 }, { from: 3, work: 35, rest: 25, rounds: 2 }, { from: 5, work: 35, rest: 25, rounds: 3 }, { from: 7, work: 40, rest: 20, rounds: 3 }],
  back: [{ from: 1, work: 30, rest: 20, rounds: 2 }, { from: 3, work: 40, rest: 20, rounds: 2 }, { from: 5, work: 45, rest: 15, rounds: 2 }, { from: 7, work: 45, rest: 15, rounds: 3 }],
  home: [{ from: 1, work: 30, rest: 30, rounds: 3 }, { from: 3, work: 35, rest: 25, rounds: 3 }, { from: 5, work: 40, rest: 20, rounds: 3 }, { from: 7, work: 45, rest: 15, rounds: 3 }, { from: 9, work: 45, rest: 15, rounds: 4 }],
};
const WARM_SOFT = [['march', 60], ['armcircle', 40], ['stepjack', 40]];
const WARM_HOME = [['march', 45], ['armcircle', 30], ['stepjack', 30], ['jack', 30]];
const COOL = [['hamstring', 40], ['quad', 50], ['breathe', 40]];
const WARM_BACK = [['march', 60], ['armcircle', 30], ['sidebend', 40]];
const COOL_BACK = [['child', 45], ['kneehug', 40], ['breathe', 40]];

export const PLANS = [
  { id: 'soft', uk: 'М’який старт', note: 'Без стрибків і різких рухів, бережно до колін і спини. Для початку після перерви, для старшого віку, з великою вагою.', level: 'легко',
    workouts: [
      { id: 'A', uk: 'Ноги й рівновага', warm: WARM_SOFT, circle: ['chairsquat', 'wallpush', 'calf', 'sideleg', 'birddog'], cool: COOL },
      { id: 'B', uk: 'Спина й прес', warm: WARM_SOFT, circle: ['bridge', 'birddog', 'wallpush', 'deadbug', 'standcross'], cool: COOL },
      { id: 'C', uk: 'Усе тіло', warm: WARM_SOFT, circle: ['chairsquat', 'standcross', 'wallpush', 'bridge', 'march'], cool: COOL },
    ] },
  { id: 'back', uk: 'Здорова спина', note: 'Рухливість і сильні м’язи спини та кору, без скручувань під навантаженням і стрибків. При гострому болю, онімінні або після травми спершу порада лікаря.', level: 'легко',
    workouts: [
      { id: 'A', uk: 'Рухливість', warm: WARM_BACK, circle: ['catcow', 'birddog', 'bridge', 'kneehug', 'deadbug'], cool: COOL_BACK },
      { id: 'B', uk: 'Сильна спина', warm: WARM_BACK, circle: ['bridge', 'superman', 'birddog', 'wallpush', 'deadbug'], cool: COOL_BACK },
      { id: 'C', uk: 'Легкість у попереку', warm: WARM_BACK, circle: ['catcow', 'bridge', 'sidebend', 'birddog', 'child'], cool: COOL_BACK },
    ] },
  { id: 'home', uk: 'Спалюємо вдома', note: 'Кругові тренування на все тіло з кардіо. Для тих, хто вже трохи рухається й хоче швидшого результату.', level: 'середньо',
    workouts: [
      { id: 'A', uk: 'Ноги й сідниці', warm: WARM_HOME, circle: ['squat', 'lunge', 'bridge', 'sidelunge', 'highknee'], cool: COOL },
      { id: 'B', uk: 'Верх і прес', warm: WARM_HOME, circle: ['kneepush', 'plank', 'superman', 'crunch', 'climber'], cool: COOL },
      { id: 'C', uk: 'Кардіо-коло', warm: WARM_HOME, circle: ['jack', 'squat', 'climber', 'standcross', 'highknee', 'plank'], cool: COOL },
    ] },
];
export const PLAN = Object.fromEntries(PLANS.map((p) => [p.id, p]));

// Short sessions, one exercise after another without rest: they do not move the programme on
export const QUICK = [
  { id: 'morning', uk: 'Ранкова зарядка', icon: '🌅', note: 'Усе стоячи, без килимка: прокинутися й розім’яти суглоби.',
    list: [['march', 50], ['armcircle', 30], ['sidebend', 30], ['stepjack', 30], ['standcross', 30], ['squat', 30], ['calf', 30], ['hamstring', 30], ['breathe', 40]] },
  { id: 'back', uk: 'Для спини', icon: '🧘', note: 'На килимку, повільно: розрухати спину після сидіння й зняти напругу.',
    list: [['catcow', 60], ['child', 45], ['birddog', 60], ['bridge', 60], ['deadbug', 60], ['kneehug', 45], ['bridge', 45], ['birddog', 45], ['catcow', 45], ['child', 60], ['breathe', 45]] },
];
export const QUICK_OF = Object.fromEntries(QUICK.map((q) => [q.id, q]));
export const quickSteps = (q) => q.list.map(([move, secs], i) => ({ kind: 'work', move, secs, round: 1, rounds: 1, i: i + 1, n: q.list.length }));

export const weekOf = (startDay, day) => Math.max(1, Math.floor((Date.parse(day + 'T12:00:00Z') - Date.parse(startDay + 'T12:00:00Z')) / (7 * 86400000)) + 1);
export function stepOf(planId, week) {
  const list = STEPS[planId] || STEPS.soft;
  return list.filter((s) => week >= s.from).pop() || list[0];
}

// The steps of one workout: [{kind: warm|work|rest|cool, move, secs, round, rounds, i, n}]
export function steps(planId, workout, week) {
  const st = stepOf(planId, week), out = [];
  for (const [id, secs] of workout.warm) out.push({ kind: 'warm', move: id, secs });
  for (let r = 1; r <= st.rounds; r++) {
    workout.circle.forEach((id, i) => {
      out.push({ kind: 'work', move: id, secs: st.work, round: r, rounds: st.rounds, i: i + 1, n: workout.circle.length });
      const last = r === st.rounds && i === workout.circle.length - 1;
      if (!last) out.push({ kind: 'rest', move: workout.circle[(i + 1) % workout.circle.length], secs: i === workout.circle.length - 1 ? Math.max(st.rest, 60) : st.rest, round: r, rounds: st.rounds });
    });
  }
  for (const [id, secs] of workout.cool) out.push({ kind: 'cool', move: id, secs });
  return out;
}
export const seconds = (list) => list.reduce((s, x) => s + x.secs, 0);
// kcal: the effort of each exercise (rest counts as standing: 1.5)
export function kcalOf(list, kg, doneSecs = Infinity) {
  let left = doneSecs, k = 0;
  for (const x of list) {
    const s = Math.min(x.secs, Math.max(0, left)); left -= x.secs;
    k += ((x.kind === 'rest' ? 1.5 : MOVE[x.move].met) * kg * s) / 3600;
    if (left <= 0) break;
  }
  return Math.round(k);
}
// which workout is next: they take turns in the order A, B, C, counting the ones done in this programme
export function nextWorkout(plan, doneCount) { return plan.workouts[doneCount % plan.workouts.length]; }
