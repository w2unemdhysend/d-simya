// "Пригоди шкарпетки", the rules of the world without any drawing: platforms (boxes and round ones, some moving, turning,
// crumbling or springy), the sock that runs and jumps among them, letters to pick up, checkpoints and the goal.
// One step is 1/120 s, always the same, so a level plays the same on every phone and in the tests (node tests/hop.test.mjs).
// Y is up; a level runs away from the camera, towards −Z. A platform's y is the height of its top.

export const K = {
  DT: 1 / 120,
  G: 34, FALL: 1.35, TERM: 26,           // gravity, a little stronger on the way down (a jump feels snappier), the fastest fall
  JUMP: 12, CUT: 0.5,                     // the speed of a jump; letting go early halves what is left of it (a short hop)
  MAXV: 6.2, ACC: 60, DEC: 70, AIR: 30,   // running: top speed, speeding up and stopping on the ground, steering in the air
  COYOTE: 0.1, BUFFER: 0.13,              // a jump still works a moment after running off an edge, and a tap a moment before landing counts
  R: 0.32, H: 0.95,                       // the sock: radius and height
  STEP: 0.22,                             // low steps are walked up without a jump
  EDGE: 0.24,                             // standing on a platform counts this far past its edge (forgiving on a phone)
  DRIFT: 2.5,                             // what a moving platform gave the sock fades in the air by this rate
  CRUMBLE: 0.55, BACK: 3.2,               // a crumbling platform falls this long after it was stepped on, and is back after this
};

// Where a platform is at time t: its place, plus how it moves (to and fro, round in a circle, turning), minus how far it fell
export function pose(p, t, st) {
  let x = p.x, y = p.y, z = p.z, yaw = p.yaw || 0;
  if (p.move) {
    const m = p.move, k = (1 - Math.cos(2 * Math.PI * (t / m.period + (m.phase || 0)))) / 2;
    x += m.to[0] * k; y += m.to[1] * k; z += m.to[2] * k;
  }
  if (p.orbit) {   // like a gondola of a big wheel: round in an upright circle, the platform itself stays level
    const o = p.orbit, a = 2 * Math.PI * (t / o.period + (o.phase || 0));
    if (o.plane === 'zy') { z += o.r * Math.cos(a); y += o.r * Math.sin(a); } else { x += o.r * Math.cos(a); y += o.r * Math.sin(a); }
  }
  if (p.turn) yaw += p.turn * t;
  if (st && st.trig != null) {
    const k = t - st.trig - K.CRUMBLE;
    if (k > 0) y -= 10 * k * k;
  }
  return { x, y, z, yaw };
}
const solid = (p, t, st) => !(st && st.trig != null && t - st.trig > K.CRUMBLE);

// the same turn as three.js's rotation.y, so the drawing and the rules agree
export function toLocal(q, x, z) {
  const dx = x - q.x, dz = z - q.z, c = Math.cos(q.yaw), s = Math.sin(q.yaw);
  return [dx * c - dz * s, dx * s + dz * c];
}
export function toWorld(q, lx, lz) {
  const c = Math.cos(q.yaw), s = Math.sin(q.yaw);
  return [q.x + lx * c + lz * s, q.z - lx * s + lz * c];
}
// is the point (x, z) over the platform's top, counting `m` past its edge
export function over(p, q, x, z, m = 0) {
  const [lx, lz] = toLocal(q, x, z);
  if (p.t === 'cyl') return lx * lx + lz * lz <= (p.r + m) * (p.r + m);
  return Math.abs(lx) <= p.w / 2 + m && Math.abs(lz) <= p.d / 2 + m;
}
// how far the point is from the platform's outline, sideways (0 inside)
export function gapTo(p, q, x, z) {
  const [lx, lz] = toLocal(q, x, z);
  if (p.t === 'cyl') return Math.max(0, Math.hypot(lx, lz) - p.r);
  return Math.hypot(Math.max(0, Math.abs(lx) - p.w / 2), Math.max(0, Math.abs(lz) - p.d / 2));
}
// a circle of radius r at (x, z) pushed out of the platform's side; null if it does not touch
function pushOut(p, q, x, z, r) {
  const [lx, lz] = toLocal(q, x, z);
  let nx, nz;
  if (p.t === 'cyl') {
    const d = Math.hypot(lx, lz), need = p.r + r;
    if (d >= need) return null;
    const ux = d > 1e-6 ? lx / d : 0, uz = d > 1e-6 ? lz / d : 1;
    nx = ux * need; nz = uz * need;
  } else {
    const hw = p.w / 2, hd = p.d / 2;
    const cx = Math.max(-hw, Math.min(hw, lx)), cz = Math.max(-hd, Math.min(hd, lz));
    const dx = lx - cx, dz = lz - cz, d = Math.hypot(dx, dz);
    if (d >= r) return null;
    if (d > 1e-6) { nx = cx + (dx / d) * r; nz = cz + (dz / d) * r; }
    else {   // the centre is inside: out by the nearest side
      const px = hw - Math.abs(lx), pz = hd - Math.abs(lz);
      if (px < pz) { nx = Math.sign(lx || 1) * (hw + r); nz = lz; } else { nx = lx; nz = Math.sign(lz || 1) * (hd + r); }
    }
  }
  return toWorld(q, nx, nz);
}

export function killHeight(L) { return L.kill != null ? L.kill : Math.min(...L.platforms.map((p) => p.y - (p.orbit ? p.orbit.r : 0) + Math.min(0, p.move ? p.move.to[1] : 0))) - 6; }

export function createWorld(L) {
  const [sx, sy, sz] = L.start;
  return {
    L, t: 0, st: L.platforms.map(() => ({ trig: null })), kill: killHeight(L),
    p: { x: sx, y: sy, z: sz, vx: 0, vy: 0, vz: 0, ex: 0, ez: 0, pvx: 0, pvz: 0, ground: -1, coyote: 0, buffer: 0, jumping: false, cut: false, face: 0, last: -1 },
    got: L.letters.map(() => false), cp: [sx, sy, sz], cpi: -1, falls: 0, jumps: 0, done: false, events: [],
  };
}

export function respawn(W) {
  const p = W.p, [x, y, z] = W.cp;
  Object.assign(p, { x, y, z, vx: 0, vy: 0, vz: 0, ex: 0, ez: 0, pvx: 0, pvz: 0, ground: -1, coyote: 0, buffer: 0, jumping: false, cut: false, face: 0 });
}

// One step. input: x, z in −1…1 (the stick, in the world's directions), hold (jump held), press (jump pressed in this step)
export function step(W, input = {}, dt = K.DT) {
  if (W.done) return;
  const L = W.L, P = L.platforms, p = W.p, ev = W.events, t0 = W.t, t1 = t0 + dt;
  for (const s of W.st) if (s.trig != null && t1 - s.trig > K.BACK) s.trig = null;

  // standing on something that moves: go with it (also round with a turning one)
  if (p.ground >= 0) {
    const pl = P[p.ground], st = W.st[p.ground];
    if (solid(pl, t1, st)) {
      const a = pose(pl, t0, st), b = pose(pl, t1, st);
      const [lx, lz] = toLocal(a, p.x, p.z), [wx, wz] = toWorld(b, lx, lz);
      p.pvx = (wx - p.x) / dt; p.pvz = (wz - p.z) / dt;
      p.x = wx; p.z = wz; p.y += b.y - a.y; p.face += b.yaw - a.yaw;
    }
  }
  const grounded = p.ground >= 0;

  // running and steering
  let ix = input.x || 0, iz = input.z || 0;
  const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  const acc = grounded ? (m > 0.05 ? K.ACC : K.DEC) : K.AIR;
  let dx = ix * K.MAXV - p.vx, dz = iz * K.MAXV - p.vz;
  const d = Math.hypot(dx, dz), most = acc * dt;
  if (d > most) { dx *= most / d; dz *= most / d; }
  p.vx += dx; p.vz += dz;
  if (Math.hypot(p.vx, p.vz) > 0.4) p.face = Math.atan2(p.vx, p.vz);
  if (grounded) { p.ex = 0; p.ez = 0; } else { const f = Math.exp(-K.DRIFT * dt); p.ex *= f; p.ez *= f; }

  // jumping: a tap just before landing and a jump just after running off the edge both count
  p.buffer = input.press ? K.BUFFER : Math.max(0, p.buffer - dt);
  p.coyote = grounded ? K.COYOTE : Math.max(0, p.coyote - dt);
  if (p.buffer > 0 && (grounded || p.coyote > 0)) {
    if (grounded) { p.ex = p.pvx; p.ez = p.pvz; }
    p.vy = K.JUMP; p.ground = -1; p.coyote = 0; p.buffer = 0; p.jumping = true; p.cut = false; W.jumps++;
    ev.push({ type: 'jump' });
  }
  if (p.jumping && !input.hold && p.vy > 0 && !p.cut) { p.vy *= K.CUT; p.cut = true; }
  if (p.ground < 0) p.vy = Math.max(-K.TERM, p.vy - K.G * (p.vy < 0 ? K.FALL : 1) * dt);
  else p.vy = 0;

  // sideways, then out of any wall
  p.x += (p.vx + p.ex) * dt; p.z += (p.vz + p.ez) * dt;
  for (let i = 0; i < P.length; i++) {
    const pl = P[i], st = W.st[i];
    if (pl.ghost || !solid(pl, t1, st)) continue;
    const q = pose(pl, t1, st), h = pl.h || 1;
    if (p.y >= q.y - K.STEP || p.y + K.H <= q.y - h) continue;
    const out = pushOut(pl, q, p.x, p.z, K.R);
    if (out) {
      const nx = out[0] - p.x, nz = out[1] - p.z, n = Math.hypot(nx, nz) || 1;
      p.x = out[0]; p.z = out[1];
      const along = (p.vx * nx + p.vz * nz) / n;   // stop running into the wall, keep sliding along it
      if (along < 0) { p.vx -= (along * nx) / n; p.vz -= (along * nz) / n; }
    }
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
      if (over(pl, q, p.x, p.z, K.EDGE)) { best = i; top = q.y; }
    }
  } else {   // a head under a platform stops the jump
    for (let i = 0; i < P.length; i++) {
      const pl = P[i], st = W.st[i];
      if (pl.ghost || !solid(pl, t1, st)) continue;
      const q = pose(pl, t1, st), bottom = q.y - (pl.h || 1);
      if (y0 + K.H <= bottom + 1e-6 && p.y + K.H > bottom && over(pl, q, p.x, p.z, -0.05)) { p.y = bottom - K.H; p.vy = 0; p.cut = true; ev.push({ type: 'bump' }); }
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
    p.ex = p.pvx; p.ez = p.pvz; p.ground = -1; p.coyote = K.COYOTE;
  }

  // letters, checkpoints, the goal, falling down
  const cy = p.y + K.H / 2;
  L.letters.forEach(([x, y, z], k) => {
    if (!W.got[k] && Math.hypot(p.x - x, cy - y, p.z - z) < 0.8) { W.got[k] = true; ev.push({ type: 'letter', k }); }
  });
  (L.checkpoints || []).forEach(([x, y, z], k) => {
    if (k > W.cpi && Math.hypot(p.x - x, p.z - z) < 1.1 && Math.abs(p.y - y) < 1.2) { W.cpi = k; W.cp = [x, y, z]; ev.push({ type: 'checkpoint', k }); }
  });
  const [gx, gy, gz] = L.goal;
  if (Math.hypot(p.x - gx, p.z - gz) < 0.9 && p.y > gy - 0.3 && p.y < gy + 2.2) { W.done = true; W.t = t1; ev.push({ type: 'goal' }); return; }
  if (p.y < W.kill) { W.falls++; ev.push({ type: 'fall', at: [p.x, p.z] }); respawn(W); }
  W.t = t1;
}

// The stars of a finished level: reached the goal, every letter, within the par time
export function stars(L, t, got) { return 1 + (got.every(Boolean) ? 1 : 0) + (t <= L.par ? 1 : 0); }
