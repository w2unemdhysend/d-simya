// "Пригоди шкарпетки", the rules of the world without any drawing. The game is seen from the side (2.5D): the sock runs
// left and right (X) and jumps (Y is up); a platform's depth (z) is only for the picture. Platforms can move to and fro,
// go round an upright circle (the sails of the mill), crumble or bounce; there are letters to pick up, checkpoints and
// the goal. One step is 1/120 s, always the same, so a level plays the same on every phone and in the tests
// (node tests/hop.test.mjs). A platform's y is the height of its top, `h` how far down it is solid.

export const K = {
  DT: 1 / 120,
  G: 34, FALL: 1.35, TERM: 26,           // gravity, a little stronger on the way down (a jump feels snappier), the fastest fall
  JUMP: 12, CUT: 0.5,                     // the speed of a jump; letting go early halves what is left of it (a short hop)
  MAXV: 6.2, ACC: 60, DEC: 70, AIR: 34,   // running: top speed, speeding up and stopping on the ground, steering in the air
  COYOTE: 0.1, BUFFER: 0.13,              // a jump still works a moment after running off an edge, and a tap a moment before landing counts
  R: 0.3, H: 0.95,                        // the sock: half its width and its height
  STEP: 0.22,                             // low steps are walked up without a jump
  EDGE: 0.2,                              // standing on a platform counts this far past its edge (forgiving on a phone)
  DRIFT: 2.5,                             // what a moving platform gave the sock fades in the air by this rate
  CRUMBLE: 0.55, BACK: 3.2,               // a crumbling platform falls this long after it was stepped on, and is back after this
};

// Where a platform is at time t: its place, plus how it moves (to and fro, round an upright circle), minus how far it fell
export function pose(p, t, st) {
  let x = p.x, y = p.y;
  if (p.move) {
    const m = p.move, k = (1 - Math.cos(2 * Math.PI * (t / m.period + (m.phase || 0)))) / 2;
    x += m.to[0] * k; y += m.to[1] * k;
  }
  if (p.orbit) {   // like a gondola of a big wheel: round in an upright circle, the platform itself stays level
    const o = p.orbit, a = 2 * Math.PI * (t / o.period + (o.phase || 0));
    x += o.r * Math.cos(a); y += o.r * Math.sin(a);
  }
  if (st && st.trig != null) {
    const k = t - st.trig - K.CRUMBLE;
    if (k > 0) y -= 10 * k * k;
  }
  return { x, y };
}
const solid = (p, t, st) => !(st && st.trig != null && t - st.trig > K.CRUMBLE);

// half the width of a platform as seen from the side
export const half = (p) => (p.t === 'cyl' ? p.r : p.w / 2);
// is x over the platform's top, counting `m` past its edge
export const over = (p, q, x, m = 0) => Math.abs(x - q.x) <= half(p) + m;
// how far x is from the platform's side (0 over it)
export const gapTo = (p, q, x) => Math.max(0, Math.abs(x - q.x) - half(p));

// below this the sock has fallen: into the water, the foam or the dark (the level says where its floor is)
export function killHeight(L) {
  if (L.kill != null) return L.kill;
  if (L.floor != null) return L.floor - 1;
  return Math.min(...L.platforms.map((p) => p.y - (p.orbit ? p.orbit.r : 0) + Math.min(0, p.move ? p.move.to[1] : 0))) - 6;
}

export function createWorld(L) {
  const [sx, sy] = L.start;
  return {
    L, t: 0, st: L.platforms.map(() => ({ trig: null })), kill: killHeight(L),
    p: { x: sx, y: sy, vx: 0, vy: 0, ex: 0, pvx: 0, ground: -1, coyote: 0, buffer: 0, jumping: false, cut: false, face: 1, last: -1 },
    got: L.letters.map(() => false), cp: [sx, sy], cpi: -1, falls: 0, jumps: 0, done: false, events: [],
  };
}

export function respawn(W) {
  const p = W.p, [x, y] = W.cp;
  Object.assign(p, { x, y, vx: 0, vy: 0, ex: 0, pvx: 0, ground: -1, coyote: 0, buffer: 0, jumping: false, cut: false, face: 1 });
}

// One step. input: x in −1…1 (left, right), hold (jump held), press (jump pressed in this step)
export function step(W, input = {}, dt = K.DT) {
  if (W.done) return;
  const L = W.L, P = L.platforms, p = W.p, ev = W.events, t0 = W.t, t1 = t0 + dt;
  for (const s of W.st) if (s.trig != null && t1 - s.trig > K.BACK) s.trig = null;

  // standing on something that moves: go with it
  if (p.ground >= 0) {
    const pl = P[p.ground], st = W.st[p.ground];
    if (solid(pl, t1, st)) {
      const a = pose(pl, t0, st), b = pose(pl, t1, st);
      p.pvx = (b.x - a.x) / dt; p.x += b.x - a.x; p.y += b.y - a.y;
    }
  }
  const grounded = p.ground >= 0;

  // running and steering
  const ix = Math.max(-1, Math.min(1, input.x || 0)), moving = Math.abs(ix) > 0.05;
  const acc = grounded ? (moving ? K.ACC : K.DEC) : K.AIR, most = acc * dt;
  p.vx += Math.max(-most, Math.min(most, ix * K.MAXV - p.vx));
  if (moving) p.face = ix > 0 ? 1 : -1;
  if (grounded) p.ex = 0; else p.ex *= Math.exp(-K.DRIFT * dt);

  // jumping: a tap just before landing and a jump just after running off the edge both count
  p.buffer = input.press ? K.BUFFER : Math.max(0, p.buffer - dt);
  p.coyote = grounded ? K.COYOTE : Math.max(0, p.coyote - dt);
  if (p.buffer > 0 && (grounded || p.coyote > 0)) {
    if (grounded) p.ex = p.pvx;
    p.vy = K.JUMP; p.ground = -1; p.coyote = 0; p.buffer = 0; p.jumping = true; p.cut = false; W.jumps++;
    ev.push({ type: 'jump' });
  }
  if (p.jumping && !input.hold && p.vy > 0 && !p.cut) { p.vy *= K.CUT; p.cut = true; }
  if (p.ground < 0) p.vy = Math.max(-K.TERM, p.vy - K.G * (p.vy < 0 ? K.FALL : 1) * dt);
  else p.vy = 0;

  // sideways, then out of any wall, back to the side the sock came from
  const x0 = p.x;
  p.x += (p.vx + p.ex) * dt;
  for (let i = 0; i < P.length; i++) {
    const pl = P[i], st = W.st[i];
    if (pl.ghost || !solid(pl, t1, st)) continue;
    const q = pose(pl, t1, st), h = pl.h || 1;
    if (p.y >= q.y - K.STEP || p.y + K.H <= q.y - h) continue;
    const reach = half(pl) + K.R, d = p.x - q.x;
    if (Math.abs(d) >= reach) continue;
    const side = Math.sign(x0 - pose(pl, t0, st).x || d || 1);
    p.x = q.x + side * reach;
    if (p.vx * side < 0) p.vx = 0;
    if (p.ex * side < 0) p.ex = 0;
  }

  // up and down: land on the highest top the feet came down onto (or walk up a low step)
  const y0 = p.y;
  p.y += p.vy * dt;
  let best = -1, top = -Infinity;
  if (p.vy <= 0) {
    for (let i = 0; i < P.length; i++) {
      const pl = P[i], st = W.st[i];
      if (pl.ghost || !solid(pl, t1, st)) continue;
      const q = pose(pl, t1, st);
      if (q.y > y0 + K.STEP + 1e-6 || q.y < p.y - 1e-6 || q.y <= top) continue;
      if (over(pl, q, p.x, K.EDGE)) { best = i; top = q.y; }
    }
  } else {   // a head under a platform stops the jump
    for (let i = 0; i < P.length; i++) {
      const pl = P[i], st = W.st[i];
      if (pl.ghost || !solid(pl, t1, st)) continue;
      const q = pose(pl, t1, st), bottom = q.y - (pl.h || 1);
      if (y0 + K.H <= bottom + 1e-6 && p.y + K.H > bottom && over(pl, q, p.x, -0.05)) { p.y = bottom - K.H; p.vy = 0; p.cut = true; ev.push({ type: 'bump' }); }
    }
  }
  if (best >= 0) {
    const pl = P[best], wasAir = p.ground < 0, speed = -p.vy;
    p.y = top; p.last = best;
    if (pl.spring) {
      p.vy = pl.spring; p.ground = -1; p.jumping = false; p.cut = true; p.coyote = 0;
      ev.push({ type: 'spring', i: best });
    } else {
      p.vy = 0; p.ground = best; p.jumping = false;
      if (wasAir) ev.push({ type: 'land', i: best, v: speed });
      if (pl.fall && W.st[best].trig == null) { W.st[best].trig = t1; ev.push({ type: 'crumble', i: best }); }
    }
  } else if (p.ground >= 0) {   // ran off the edge (or the platform fell): keep the platform's speed, a jump still works for a moment
    p.ex = p.pvx; p.ground = -1; p.coyote = K.COYOTE;
  }

  // letters, checkpoints, the goal, falling down
  const cy = p.y + K.H / 2;
  L.letters.forEach(([x, y], k) => {
    if (!W.got[k] && Math.hypot(p.x - x, cy - y) < 0.8) { W.got[k] = true; ev.push({ type: 'letter', k }); }
  });
  (L.checkpoints || []).forEach(([x, y], k) => {
    if (k > W.cpi && Math.abs(p.x - x) < 1.1 && Math.abs(p.y - y) < 1.2) { W.cpi = k; W.cp = [x, y]; ev.push({ type: 'checkpoint', k }); }
  });
  const [gx, gy] = L.goal;
  if (Math.abs(p.x - gx) < 0.9 && p.y > gy - 0.3 && p.y < gy + 2.2) { W.done = true; W.t = t1; ev.push({ type: 'goal' }); return; }
  if (p.y < W.kill) { W.falls++; ev.push({ type: 'fall', at: p.x }); respawn(W); }
  W.t = t1;
}

// The stars of a finished level: reached the goal, every letter, within the par time
export function stars(L, t, got) { return 1 + (got.every(Boolean) ? 1 : 0) + (t <= L.par ? 1 : 0); }
