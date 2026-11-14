// The moving figure of «Тренування»: a person drawn with round strokes in an SVG, moving between key poses.
// No pictures, no video: everything is computed here, so it works offline and follows the light and dark theme.
//
// A pose (viewBox 0–200, the floor at y = 186):
//   hip [x, y]           where the hips are
//   torso                angle of the back from the hips up (180 = upright; 0 = straight down, 90 = to the right)
//   head                 tilt of the head against the back (degrees, default 0)
//   armN, armF, legN, legF   each limb either [upper, lower] absolute angles (0 down, 90 right, 180 up, −90 left)
//                            or {to: [x, y]}: the hand or ankle is planted there and the elbow or knee is worked out
//   footN, footF         angle of the feet (default 90: toes to the right)
// Side view: N is the near side (dark), F the far side (paler), the person faces right. Front view (view: 'front'):
// N is the person's right (on the left of the picture), F the left; shoulders and hips are set apart.
// Angles go from one pose to the next as written (370 after 10 is a full turn), positions in a straight line.

export const FLOOR = 186;
export const VIEWBOX = '0 -16 200 216';   // room above the head for arms raised high
const L = { torso: 50, neck: 8, head: 11, upper: 29, fore: 28, thigh: 42, shin: 40, foot: 13 };
const rad = (d) => (d * Math.PI) / 180;
const dirOf = (a) => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p, a, len) => { const [dx, dy] = dirOf(a); return [p[0] + dx * len, p[1] + dy * len]; };
const angleTo = (a, b) => (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;

// two bones from `root` reaching `to`; bend +1 puts the joint to the right of the line root→to (knees of a person
// facing right), −1 to the left (elbows)
export function ik(root, to, a, b, bend) {
  const dx = to[0] - root[0], dy = to[1] - root[1];
  const d = Math.max(1e-6, Math.min(a + b - 0.01, Math.hypot(dx, dy)));
  const base = Math.atan2(dx, dy), cos = (a * a + d * d - b * b) / (2 * a * d);
  const off = Math.acos(Math.max(-1, Math.min(1, cos)));
  const first = base + bend * off;
  const joint = [root[0] + Math.sin(first) * a, root[1] + Math.cos(first) * a];
  return [(first * 180) / Math.PI, angleTo(joint, to)];
}

// The points of a pose: {hip, neck, head, shN, shF, elN, elF, haN, haF, hpN, hpF, knN, knF, anN, anF, toN, toF}
export function joints(pose, view = 'side') {
  const hip = pose.hip, front = view === 'front';
  const neck = add(hip, pose.torso, L.torso);
  const head = add(neck, pose.torso + (pose.head || 0), L.neck + L.head);
  const shoulder = add(hip, pose.torso, L.torso - 4);
  const side = (k) => (front ? (k === 'N' ? -1 : 1) : 0);
  // across the body in a front view: perpendicular to the back
  const across = (p, k, w) => { if (!front) return p; const [dx, dy] = dirOf(pose.torso - 90); return [p[0] + side(k) * dx * w, p[1] + side(k) * dy * w]; };
  const out = { hip, neck, head };
  for (const k of ['N', 'F']) {
    const sh = across(shoulder, k, 11), hp = across(hip, k, 7);
    const arm = pose['arm' + k] || [10, 15], leg = pose['leg' + k] || [0, 0];
    const [ua, fa] = Array.isArray(arm) ? arm : ik(sh, arm.to, L.upper, L.fore, front ? side(k) : -1);
    const [ta, sa] = Array.isArray(leg) ? leg : ik(hp, leg.to, L.thigh, L.shin, front ? side(k) : 1);
    const el = add(sh, ua, L.upper), kn = add(hp, ta, L.thigh), an = add(kn, sa, L.shin);
    out['sh' + k] = sh; out['el' + k] = el; out['ha' + k] = add(el, fa, L.fore);
    out['hp' + k] = hp; out['kn' + k] = kn; out['an' + k] = an;
    out['to' + k] = add(an, pose['foot' + k] == null ? (front ? 180 + side(k) * -150 : 90) : pose['foot' + k], front ? 7 : L.foot);
    out['_a' + k] = [ua, fa, ta, sa];
  }
  return out;
}

const ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
const mix = (a, b, t) => a + (b - a) * t;
const mixP = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
// a pose between two poses: planted limbs stay planted (their targets move in a line), the rest turn by angle
export function between(a, b, t, view) {
  const ja = joints(a, view), jb = joints(b, view), out = { hip: mixP(a.hip, b.hip, t), torso: mix(a.torso, b.torso, t), head: mix(a.head || 0, b.head || 0, t) };
  for (const k of ['N', 'F']) {
    for (const [limb, i] of [['arm', 0], ['leg', 2]]) {
      const pa = a[limb + k], pb = b[limb + k];
      if (pa && pb && !Array.isArray(pa) && !Array.isArray(pb)) out[limb + k] = { to: mixP(pa.to, pb.to, t) };
      else out[limb + k] = [mix(ja['_a' + k][i], jb['_a' + k][i], t), mix(ja['_a' + k][i + 1], jb['_a' + k][i + 1], t)];
    }
    const fa = a['foot' + k], fb = b['foot' + k];
    if (fa != null || fb != null) out['foot' + k] = mix(fa == null ? 90 : fa, fb == null ? 90 : fb, t);
  }
  return out;
}
// the pose at time ms of a move's loop: frames [{pose, ms (to the next), hold (ms kept still first)}]
export function poseAt(move, ms) {
  const f = move.frames, total = f.reduce((s, x) => s + (x.hold || 0) + x.ms, 0);
  let t = ((ms % total) + total) % total;
  for (let i = 0; i < f.length; i++) {
    const hold = f[i].hold || 0;
    if (t < hold) return f[i].pose;
    t -= hold;
    if (t < f[i].ms) return between(f[i].pose, f[(i + 1) % f.length].pose, ease(t / f[i].ms), move.view);
    t -= f[i].ms;
  }
  return f[0].pose;
}

const seg = (a, b, cls) => `<line class="${cls}" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
const PROPS = {
  chair: '<path class="prop" d="M40 186V142h34v44M40 142V100M40 142h34"/>',
  wall: '<path class="prop" d="M178 20v166"/>',
  mat: '<rect class="mat" x="14" y="183" width="172" height="5" rx="2.5"/>',
};
// the SVG body of a pose (put it in <svg viewBox="0 0 200 200" class="fig">)
export function draw(pose, view = 'side', props = []) {
  const j = joints(pose, view), far = view === 'front' ? 'b' : 'f';
  const limbs = (k, cls) => seg(j['sh' + k], j['el' + k], cls) + seg(j['el' + k], j['ha' + k], cls) + seg(j['hp' + k], j['kn' + k], cls) + seg(j['kn' + k], j['an' + k], cls) + seg(j['an' + k], j['to' + k], cls + ' ft');
  return `<line class="floor" x1="6" y1="${FLOOR}" x2="194" y2="${FLOOR}"/>${props.map((p) => PROPS[p] || '').join('')}` +
    `<g class="${far}">${limbs('F', far === 'f' ? 'lf' : 'lb')}</g>` +
    `<g class="b">${seg(j.hip, j.neck, 'tr')}${view === 'front' ? seg(j.shN, j.shF, 'sh') + seg(j.hpN, j.hpF, 'sh') : ''}<circle class="hd" cx="${j.head[0].toFixed(1)}" cy="${j.head[1].toFixed(1)}" r="${L.head}"/>${limbs('N', 'lb')}</g>`;
}

// A figure that plays a move in `svg` until stop() (or until the SVG leaves the page); pause() keeps the pose
export function play(svg, move, opts = {}) {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, t0 = performance.now(), paused = false, pausedAt = 0, last = -1;
  const speed = opts.speed || 1;
  function frame(now) {
    if (!svg.isConnected) return;
    const t = paused ? pausedAt : (now - t0) * speed;
    if (Math.abs(t - last) > 15) { svg.innerHTML = draw(poseAt(move, t), move.view, move.props || []); last = t; }
    raf = requestAnimationFrame(frame);
  }
  if (reduce && !opts.always) { svg.innerHTML = draw(move.frames[move.key || 0].pose, move.view, move.props || []); return { stop() {}, pause() {}, resume() {} }; }
  raf = requestAnimationFrame(frame);
  return {
    stop() { cancelAnimationFrame(raf); },
    pause() { if (!paused) { paused = true; pausedAt = (performance.now() - t0) * speed; } },
    resume() { if (paused) { paused = false; t0 = performance.now() - pausedAt / speed; } },
  };
}
// a still picture of a move's key pose (lists, thumbnails)
export const still = (move) => draw(move.frames[move.key || 0].pose, move.view, move.props || []);
