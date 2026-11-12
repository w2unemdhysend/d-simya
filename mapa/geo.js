// Small geometry and time helpers of the map page, without the page (tests/mapa.test.mjs uses them too).
// Points are [lat, lon], as VRR gives them; MapLibre wants [lon, lat], so the page turns them round when drawing.
export const XANTEN = [51.6586, 6.4536];   // Markt: where the map opens when the phone's place is not known

// metres between two points (flat-earth: good enough within a town)
export function metres(a, b) {
  const k = Math.cos((a[0] + b[0]) * Math.PI / 360);
  return Math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * k);
}
// minutes on foot for a straight-line distance: streets add about a third, people walk about 75 m a minute (4.5 km/h)
export const walkMin = (m) => Math.max(1, Math.round((m * 1.3) / 75));
export const fmtDist = (m) => (m < 950 ? `${Math.max(10, Math.round(m / 10) * 10)} м` : `${(m / 1000).toFixed(1).replace('.', ',')} км`);

// The grid cells (0.01°, as /transit/area keeps them) that cover a box {s, w, n, e}, nearest to its middle first, at most `max`
export function cellsFor(box, max = 12) {
  const out = [], f = (x) => Math.round(x * 100) / 100;
  for (let la = f(box.s); la <= f(box.n) + 1e-9; la = f(la + 0.01)) for (let lo = f(box.w); lo <= f(box.e) + 1e-9; lo = f(lo + 0.01)) out.push([la, lo]);
  const mid = [(box.s + box.n) / 2, (box.w + box.e) / 2];
  return out.sort((a, b) => metres(a, mid) - metres(b, mid)).slice(0, max).map(([la, lo]) => [la.toFixed(2), lo.toFixed(2)]);
}

// A line of points with the distance from its start to every point, to go along it by metres
export function measure(path) {
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + metres(path[i - 1], path[i]));
  return cum;
}
// Where on the line a point is, in metres from the start, looking only from `from` on. A bus line can pass the same
// street twice (out and back, a loop through the town): the first pass close to the stop after the previous stop is
// the right one, so the search stops once it has been close (within 60 m) and is moving away again.
export function locate(path, cum, p, from = 0) {
  let best = Infinity, at = from, near = false;
  const k = Math.cos(p[0] * Math.PI / 180), X = (q) => q[1] * 111320 * k, Y = (q) => q[0] * 111320, px = X(p), py = Y(p);
  for (let i = 1; i < path.length; i++) {
    if (cum[i] < from) continue;
    const ax = X(path[i - 1]), ay = Y(path[i - 1]), bx = X(path[i]), by = Y(path[i]);
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    const t0 = cum[i] > cum[i - 1] ? Math.max(0, (from - cum[i - 1]) / (cum[i] - cum[i - 1])) : 0;
    const t = len2 ? Math.max(t0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : t0;
    const d = Math.hypot(ax + t * dx - px, ay + t * dy - py);
    if (d < best) { best = d; at = cum[i - 1] + t * (cum[i] - cum[i - 1]); }
    if (d < 60) near = true;
    else if (near && d > 150) break;
  }
  return at;
}
// the point `d` metres along the line
export function pointAt(path, cum, d) {
  if (!path.length) return null;
  if (d <= 0) return path[0];
  for (let i = 1; i < path.length; i++) {
    if (cum[i] >= d) { const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [path[i - 1][0] + t * (path[i][0] - path[i - 1][0]), path[i - 1][1] + t * (path[i][1] - path[i - 1][1])]; }
  }
  return path[path.length - 1];
}
// the part of the line between two distances (to colour what the bus has already driven)
export function slice(path, cum, from, to) {
  const out = [pointAt(path, cum, from)];
  for (let i = 0; i < path.length; i++) if (cum[i] > from && cum[i] < to) out.push(path[i]);
  out.push(pointAt(path, cum, to));
  return out;
}

const T = (x) => (x ? Date.parse(x) : NaN);
// when a vehicle is at stop k: it arrives (live if known), it leaves (live if known)
export const reach = (s) => T(s.arrEst || s.arr || s.depEst || s.dep);
export const leave = (s) => T(s.depEst || s.dep || s.arrEst || s.arr);

// Where a bus or train is now, worked out from the times of its stops (VRR gives no GPS): before its first stop,
// standing at stop i, between stop i and i+1 (`frac` of the way, by time), or done. `at` is the distance along the
// path when a path is given, so the page can put a marker there and colour the part already driven.
export function whereNow(stops, now, path = null) {
  const n = stops.length;
  if (!n) return null;
  const cum = path && path.length > 1 ? measure(path) : null;
  // each stop's place along the path, searched from the previous stop on (never backwards)
  let pos = null;
  if (cum) { pos = []; let from = 0; for (const s of stops) { const x = s.coord ? locate(path, cum, s.coord, from) : NaN; pos.push(x); if (Number.isFinite(x)) from = x; } }
  const place = (i, j = i, f = 0) => {
    if (cum && Number.isFinite(pos[i]) && Number.isFinite(pos[j])) { const d = pos[i] + f * (pos[j] - pos[i]); return { at: d, point: pointAt(path, cum, d) }; }
    const a = stops[i].coord, b = stops[j].coord || a;
    return { at: null, point: a ? [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])] : null };
  };
  if (now < leave(stops[0])) return { state: 'before', i: 0, j: 0, frac: 0, ...place(0) };
  for (let i = 0; i < n; i++) {
    const r = reach(stops[i]), l = leave(stops[i]);
    if (now >= r && now <= l) return { state: 'at', i, j: i, frac: 0, ...place(i) };
    if (i < n - 1) {
      const next = reach(stops[i + 1]);
      if (now > l && now < next) { const frac = (now - l) / (next - l); return { state: 'between', i, j: i + 1, frac, ...place(i, i + 1, frac) }; }
    }
  }
  return { state: 'done', i: n - 1, j: n - 1, frac: 0, ...place(n - 1) };
}

// 'YYYY-MM-DDTHH:MM' in Xanten time (what /transit/course and /transit/trip take)
const PARTS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function berlinStamp(date) {
  const p = Object.fromEntries(PARTS.formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// a circle of `r` metres around a point, as a polygon ring [lon, lat] (how sure the phone is about its place)
export function ring(c, r, n = 40) {
  const k = Math.cos(c[0] * Math.PI / 180), out = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * 2 * Math.PI; out.push([c[1] + (r * Math.sin(a)) / (111320 * k), c[0] + (r * Math.cos(a)) / 111320]); }
  return out;
}
