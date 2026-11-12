// A pilot that plays a level of "Пригоди шкарпетки" with the real rules: from platform to platform along the level's
// route, waiting for a moving platform to come near, jumping at the edge, steering in the air to land in the middle.
// The tests use it to show every level can be finished (node), and the page test drives the game with it (browser).
import { K, pose, over, gapTo, toLocal, toWorld } from '../igry/hop/physics.js';

// time until the feet are at height ty, starting at y with vertical speed vy (Infinity if never)
export function tLand(y, vy, ty) {
  const gu = K.G, gd = K.G * K.FALL;
  let t = 0;
  if (vy > 0) { t = vy / gu; y += (vy * vy) / (2 * gu); vy = 0; }
  if (y < ty) return Infinity;
  return t + (vy + Math.sqrt(vy * vy + 2 * gd * (y - ty))) / gd;
}
// how far a full running jump goes sideways while ending `rise` higher (or lower)
export const reach = (rise) => K.MAXV * tLand(0, K.JUMP, rise);

const clamp = (v) => Math.max(-1, Math.min(1, v));
// the point inside platform p (inset by `m`) nearest to (x, z)
function inside(p, q, x, z, m) {
  const [lx, lz] = toLocal(q, x, z);
  let nx, nz;
  if (p.t === 'cyl') { const d = Math.hypot(lx, lz), r = Math.max(0, p.r - m); const k = d > r ? r / d : 1; nx = lx * k; nz = lz * k; }
  else { nx = Math.max(-(p.w / 2 - m), Math.min(p.w / 2 - m, lx)); nz = Math.max(-(p.d / 2 - m), Math.min(p.d / 2 - m, lz)); }
  return toWorld(q, nx, nz);
}

export function makePilot(W, route) {
  const P = W.L.platforms;
  let k = 0, sinceJump = 1;
  const where = () => {   // after a fall: back to the route from the checkpoint
    const [x, y, z] = W.cp;
    for (let i = route.length - 1; i >= 0; i--) {
      const pl = P[route[i]], q = pose(pl, W.t, W.st[route[i]]);
      if (!pl.move && !pl.orbit && Math.abs(q.y - y) < 0.05 && over(pl, q, x, z, 0)) return i + 1;
    }
    return 0;
  };
  return function drive() {
    const p = W.p;
    for (const e of W.events) if (e.type === 'fall') k = where();
    while (k < route.length && p.last === route[k]) k++;
    sinceJump += K.DT;
    const tgt = k < route.length ? P[route[k]] : null;
    const lead = p.ground >= 0 ? 0.55 : Math.min(1, tLand(p.y, p.vy, tgt ? pose(tgt, W.t, W.st[route[k]]).y : W.L.goal[1]));
    const tq = tgt ? pose(tgt, W.t + (isFinite(lead) ? lead : 0.3), W.st[route[k]]) : null;
    const [tx, ty, tz] = tgt ? [tq.x, tq.y, tq.z] : W.L.goal;
    const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
    const ux = dist > 1e-6 ? dx / dist : 0, uz = dist > 1e-6 ? dz / dist : 0;

    if (p.ground >= 0) {
      const A = P[p.ground], qa = pose(A, W.t, W.st[p.ground]);
      const gap = tgt ? gapTo(tgt, tq, p.x, p.z) : dist, rise = ty - p.y;
      const moving = (tgt && (tgt.move || tgt.orbit)) || A.move || A.orbit;
      if (moving && (gap > reach(rise) - 1.2 || rise > 1.9)) {   // not near enough yet: wait (on a moving one, ride it) at the edge nearest to it
        const [wx, wz] = inside(A, qa, tx, tz, 0.45);
        return { x: clamp((wx - p.x) * 3), z: clamp((wz - p.z) * 3), hold: false, press: false };
      }
      const onA = over(A, qa, p.x + ux * 0.45, p.z + uz * 0.45, -0.05);
      const sameTop = tgt && Math.abs(rise) < K.STEP && gap < 0.05;
      const press = sinceJump > 0.25 && !sameTop && (!onA || (rise > K.STEP && gap < 1.4) || (tgt && tgt.spring && gap < 0.9));
      if (press) sinceJump = 0;
      return { x: ux, z: uz, hold: true, press };
    }
    // in the air: the speed that brings the sock over the target's middle just as it comes down to its height
    const tl = tLand(p.y, p.vy, ty);
    if (!isFinite(tl) || tl < 0.02) return { x: ux, z: uz, hold: true, press: false };
    const want = Math.min(K.MAXV, dist / tl) / K.MAXV;
    return { x: ux * want, z: uz * want, hold: true, press: false };
  };
}

// Plays a level from the start to the goal (or gives up after `limit` seconds of game time)
export function fly(W, route, step, limit = 240) {
  const drive = makePilot(W, route);
  while (!W.done && W.t < limit) { const inp = drive(); W.events.length = 0; step(W, inp); }
  return { done: W.done, t: W.t, falls: W.falls, got: W.got.filter(Boolean).length };
}
