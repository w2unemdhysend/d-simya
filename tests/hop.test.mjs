// "Пригоди шкарпетки" without the drawing: the rules of running, jumping and landing seen from the side, the platforms
// that move, go round, crumble and bounce, walls, letters, checkpoints and the goal; then every level: well formed, its
// word in the garden with a recorded clip, every letter within reach, the floor below every platform, and the pilot
// (tests/hop_pilot.mjs) plays each one to the end with the real rules.
// Run: node tests/hop.test.mjs
import { K, createWorld, step, pose, over, half, stars } from '../igry/hop/physics.js';
import { LEVELS } from '../igry/hop/levels.js';
import { POOL } from '../igry/data/garten.js';
import { AUDIO } from '../audio/index.js';
import { fly, reach, tLand } from './hop_pilot.mjs';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const B = (x, y, w, o = {}) => ({ t: 'box', x, y, z: 0, w, d: 2, h: 1, ...o });
const C = (x, y, r, o = {}) => ({ t: 'cyl', x, y, z: 0, r, h: 1, ...o });
const level = (platforms, o = {}) => ({ platforms, start: [0, 0, 0], goal: [999, 0, 0], letters: [], checkpoints: [], ...o });
const run = (W, secs, input = {}) => { const ev = []; for (let i = 0; i < Math.round(secs / K.DT); i++) { W.events.length = 0; step(W, typeof input === 'function' ? input(W, i) : input); ev.push(...W.events); } return ev; };
const near = (a, b, e = 0.02) => Math.abs(a - b) <= e;

/* ---------- standing, running, jumping ---------- */
{
  const W = createWorld(level([B(0, 0, 80)]));
  const ev = run(W, 1);
  t('standing: lands once on the ground it starts on, then stays still', W.p.ground === 0 && near(W.p.y, 0, 1e-9) && W.p.x === 0 && ev.filter((e) => e.type === 'land').length <= 1);
  run(W, 1, { x: 1 });
  t('running right: reaches the top speed within a moment, faces right', near(W.p.vx, K.MAXV, 1e-6) && W.p.face === 1, W.p.vx);
  let top = 0, x0 = null, x1 = null;
  run(W, 2, (w, i) => { if (w.p.ground < 0) top = Math.max(top, w.p.y); if (i === 0) x0 = w.p.x; if (x1 === null && i > 5 && w.p.ground >= 0) x1 = w.p.x; return { x: 1, hold: true, press: i === 0 }; });
  t('a full jump: about 2.1 high, about 4 long at full speed', near(top, (K.JUMP * K.JUMP) / (2 * K.G), 0.06) && near(x1 - x0, reach(0), 0.15), `${top} ${x1 - x0} ${reach(0)}`);
  run(W, 1, { x: -1 });
  t('running left: the speed turns round, the sock faces left', near(W.p.vx, -K.MAXV, 1e-6) && W.p.face === -1, `${W.p.vx} ${W.p.face}`);
  const W2 = createWorld(level([B(0, 0, 40)])); run(W2, 0.5);
  let top2 = 0; run(W2, 1.2, (w, i) => { if (w.p.ground < 0) top2 = Math.max(top2, w.p.y); return { hold: i < 6, press: i === 0 }; });
  t('letting go early makes a short hop', top2 < 1.2 && top2 > 0.3, top2);
}
{
  // off the edge: a jump still counts for a moment (coyote), not later
  const mk = () => { const W = createWorld(level([B(0, 0, 4)], { start: [1.5, 0, 0] })); run(W, 0.3); return W; };
  const tryLate = (late) => { const W = mk(); let off = null; run(W, 1, (w, i) => { if (off === null && w.p.ground < 0) off = i; return { x: 1, hold: true, press: off !== null && i === off + Math.round(late / K.DT) }; }); return W.jumps; };
  t('a jump just after running off the edge still works (0.06 s)', tryLate(0.06) === 1);
  t('… but not 0.15 s after', tryLate(0.15) === 0);
  // a tap just before landing counts when the sock lands
  const W = createWorld(level([B(0, 0, 40)], { start: [0, 3, 0] }));
  let landed = null, jumped = null, pressed = false;
  run(W, 1.5, (w, i) => {
    if (landed === null && w.p.ground >= 0) landed = i; if (jumped === null && w.jumps) jumped = i;
    const tl = tLand(w.p.y, w.p.vy, 0), press = !pressed && w.p.ground < 0 && tl < 0.1;
    if (press) pressed = true;
    return { hold: true, press };
  });
  t('a tap a moment before landing makes the jump on landing', W.jumps === 1 && jumped !== null && jumped <= (landed === null ? 1e9 : landed) + 1, `${landed} ${jumped} ${W.jumps}`);
}
/* ---------- walls, steps, ceilings ---------- */
{
  const W = createWorld(level([B(0, 0, 40), B(3, 2, 2, { h: 2 })]));
  run(W, 2, { x: 1 });
  t('a wall stops the sock at its side', near(W.p.x, 2 - K.R, 0.01) && W.p.ground === 0 && W.p.vx === 0, W.p.x);
  const Wl = createWorld(level([B(0, 0, 40), B(-3, 2, 2, { h: 2 })]));
  run(Wl, 2, { x: -1 });
  t('… from the other side too', near(Wl.p.x, -2 + K.R, 0.01) && Wl.p.ground === 0, Wl.p.x);
  let up = false; run(W, 0.6, (w, i) => { if (w.p.ground === 1 && near(w.p.y, 2, 1e-6)) up = true; return { x: 1, hold: true, press: i === 0 }; });
  t('a jump gets over it (2 high is within a full jump)', up, `${W.p.ground} ${W.p.y}`);
  const W2 = createWorld(level([B(0, 0, 40), B(6, 0.2, 8, { h: 0.3 })]));
  run(W2, 1.2, { x: 1 });
  t('a low step is walked up without jumping', W2.p.ground === 1 && near(W2.p.y, 0.2, 1e-6) && W2.jumps === 0);
  const W3 = createWorld(level([B(0, 0, 40), B(0, 2.5, 3, { h: 0.5 })]));
  run(W3, 0.2); const ev = run(W3, 1, (w, i) => ({ hold: true, press: i === 0 }));
  t('a head under a platform stops the jump there', ev.some((e) => e.type === 'bump') && W3.p.ground === 0, JSON.stringify(ev));
  const W4 = createWorld(level([B(0, 0, 40), C(4, 3, 1, { h: 40, ground: true })]));
  run(W4, 2, { x: 1 });
  t('a column is a wall from its top all the way down', near(W4.p.x, 3 - K.R, 0.01), W4.p.x);
}
/* ---------- moving, going round, crumbling, springy ---------- */
{
  const mover = B(0, 0, 3, { move: { to: [4, 0, 0], period: 4 } });
  const W = createWorld(level([mover], { start: [0.5, 0, 0] }));
  run(W, 0.1); const off0 = W.p.x - pose(mover, W.t).x;
  run(W, 1.5);
  t('a moving platform carries the sock where it stands', W.p.ground === 0 && near(W.p.x - pose(mover, W.t).x, off0, 1e-6) && pose(mover, W.t).x > 1, `${W.p.x} ${pose(mover, W.t).x}`);
  const lift = B(0, 0, 3, { move: { to: [0, 3, 0], period: 4 } });
  const Wl = createWorld(level([lift]));
  run(Wl, 2.1);
  t('a lift carries the sock up', Wl.p.ground === 0 && near(Wl.p.y, pose(lift, Wl.t).y, 1e-6) && Wl.p.y > 2.9, Wl.p.y);
  const orb = B(0, 0, 2, { orbit: { r: 3, period: 8, phase: 0 } });
  t('a sail of the mill goes round an upright circle and stays level', near(pose(orb, 2).y, 3, 1e-9) && near(pose(orb, 2).x, 0, 1e-9) && near(pose(orb, 6).y, -3, 1e-9) && near(pose(orb, 4).x, -3, 1e-9));
  const Wo = createWorld(level([orb], { start: [3, 0, 0] }));
  run(Wo, 0.1); const offo = Wo.p.x - pose(orb, Wo.t).x;
  run(Wo, 1.8);
  t('… and the sock rides it round', Wo.p.ground === 0 && near(Wo.p.x - pose(orb, Wo.t).x, offo, 1e-6) && near(Wo.p.y, pose(orb, Wo.t).y, 1e-6) && Wo.p.y > 2.5, `${Wo.p.x} ${Wo.p.y}`);
  const crumb = B(0, 0, 3, { fall: true });
  const W3 = createWorld(level([crumb]));
  const ev = run(W3, 0.5);
  const still = W3.p.ground === 0;
  run(W3, 0.4);
  t('a crumbling platform holds for a moment, then drops away with the sock', ev.some((e) => e.type === 'crumble') && still && W3.p.ground === -1 && W3.p.y < -0.1, `${W3.p.ground} ${W3.p.y}`);
  const again = run(W3, K.BACK + 0.5);   // the sock keeps falling back onto its place: it lands on it again once it is back
  t('… and is back a few seconds later', again.some((e) => e.type === 'crumble') && again.some((e) => e.type === 'land' && e.i === 0), JSON.stringify(again.map((e) => e.type)));
  const W4 = createWorld(level([B(0, 0, 10), C(2, 0.2, 0.6, { spring: 16 })]));
  const ev4 = run(W4, 0.6, { x: 1 });
  t('a spring throws the sock up (walking onto it is enough)', ev4.some((e) => e.type === 'spring') && W4.p.y > 2, `${W4.p.y}`);
}
/* ---------- letters, checkpoints, falling, the goal ---------- */
{
  const L = level([B(0, 0, 30), B(20, 0, 3)], { start: [-10, 0, 0], letters: [[-5, 0.9, 0], [0, 0.9, 0]], checkpoints: [[2, 0, 0]], goal: [20, 0, 0], floor: -3 });
  const W = createWorld(L);
  const ev = run(W, 3, { x: 1 });
  t('walking through a letter picks it up, in the order the way goes', W.got.every(Boolean) && ev.filter((e) => e.type === 'letter').map((e) => e.k).join() === '0,1');
  t('a checkpoint is remembered', W.cpi === 0 && ev.some((e) => e.type === 'checkpoint'));
  run(W, 2.5, (w) => ({ x: w.falls ? 0 : 1 }));
  t('running off the end: a fall below the floor, back at the checkpoint', W.falls === 1 && W.kill === -4 && near(W.p.x, 2, 1e-9) && near(W.p.y, 0, 1e-9) && W.p.ground === 0, `${W.falls} ${W.kill} ${W.p.x} ${W.p.y}`);
  const W2 = createWorld(L);
  run(W2, 6, (w) => ({ x: 1, hold: true, press: w.p.ground >= 0 && w.p.x > 14.6 && w.p.x < 15.2 }));
  t('the goal ends the level and the clock', W2.done && W2.t < 6, `${W2.done} ${W2.t}`);
  t('stars: one for the goal, one for every letter, one for the time', stars({ par: 20 }, 19, [true, true]) === 3 && stars({ par: 20 }, 21, [true, false]) === 1 && stars({ par: 20 }, 10, [false]) === 2);
  // the same inputs give the same game
  const a = createWorld(LEVELS[1]), b = createWorld(LEVELS[1]);
  const inp = (w, i) => ({ x: Math.sin(i / 40) + 0.4, hold: i % 90 < 40, press: i % 90 === 0 });
  run(a, 6, inp); run(b, 6, inp);
  t('the same inputs play the same: the rules have no chance in them', JSON.stringify(a.p) === JSON.stringify(b.p) && a.t === b.t);
}

/* ---------- the levels ---------- */
const ids = new Set();
for (const L of LEVELS) {
  const P = L.platforms, n = [...L.word[1]].length;
  ids.add(L.id);
  const where = (pt) => P.findIndex((pl) => !pl.move && !pl.orbit && !pl.fall && Math.abs(pl.y - pt[1]) < 1e-9 && over(pl, pose(pl, 0), pt[0], 0));
  t(`${L.id}: a name, a story, an article, one letter for every letter of the word`, L.name && L.story && ['der', 'die', 'das'].includes(L.word[0]) && L.letters.length === n && L.uk);
  t(`${L.id}: the word is in the garden with the same article, and has a recorded clip`, POOL.some((w) => w.de === L.word[1] && w.art === L.word[0]) && !!AUDIO[`${L.word[0]} ${L.word[1]}`]);
  t(`${L.id}: the start, the checkpoints and the goal stand on platforms that stay put`, where(L.start) >= 0 && where(L.goal) >= 0 && (L.checkpoints || []).every((c) => where(c) >= 0), `${where(L.start)} ${where(L.goal)}`);
  t(`${L.id}: the route only names platforms, the last one the goal's`, L.route.every((i) => P[i]) && L.route[L.route.length - 1] === where(L.goal));
  t(`${L.id}: every platform has a look, a size and a depth`, P.every((p) => p.look && p.h > 0 && (p.t === 'cyl' ? p.r > 0 : p.w > 0 && p.d > 0)));
  t(`${L.id}: everything stands in the picture's plane, the floor below every platform`, P.every((p) => p.z === 0) && L.letters.every((l) => l[2] === 0) && P.every((p) => Math.min(pose(p, 0).y, ...[0.25, 0.5, 0.75].map((k) => pose(p, k * ((p.move || p.orbit || {}).period || 1)).y)) > L.floor + 0.2), L.floor);
  t(`${L.id}: platforms that stay put do not overlap`, P.every((a, i) => P.every((b, j) => j <= i || a.move || a.orbit || b.move || b.orbit || a.look === 'spring' || b.look === 'spring' || a.look === 'powder' || b.look === 'powder'
    || Math.abs(a.x - b.x) >= half(a) + half(b) - 1e-9)));
  // every letter can be picked up: over some platform at some moment, low enough to walk through or reach with a jump
  const reachable = L.letters.map(([x, y]) => P.some((pl) => {
    const period = (pl.move && pl.move.period) || (pl.orbit && pl.orbit.period) || 1;
    for (let k = 0; k < 120; k++) {
      const q = pose(pl, (k / 120) * period), above = y - (q.y + K.H / 2);
      if (above > -0.3 && above < (K.JUMP * K.JUMP) / (2 * K.G) + 0.5 && over(pl, q, x, 0.2)) return true;
    }
    return false;
  }));
  t(`${L.id}: every letter can be reached`, reachable.every(Boolean), JSON.stringify(reachable));
  const W = createWorld(L), r = fly(W, L.route, step, 240);
  t(`${L.id}: the pilot plays it to the end with the real rules, without a fall`, r.done && r.falls === 0, JSON.stringify(r));
  t(`${L.id}: the time for the third star leaves room (the pilot needs at most half of it)`, r.t <= L.par / 2 + 1, `${r.t} of ${L.par}`);
}
t('six levels, every id different', LEVELS.length === 6 && ids.size === 6);
t('the last level ends with the pair', LEVELS[LEVELS.length - 1].pair === true && LEVELS.slice(0, -1).every((l) => !l.pair));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
