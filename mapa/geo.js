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

// each stop's place along the path, searched from the previous stop on (never backwards)
export function stopPositions(stops, path, cum) {
  const pos = []; let from = 0;
  for (const s of stops) { const x = s.coord ? locate(path, cum, s.coord, from) : NaN; pos.push(x); if (Number.isFinite(x)) from = x; }
  return pos;
}
// the compass direction from a to b, in degrees (0 north, 90 east): which way the bus drives at a point
export function bearing(a, b) {
  const k = Math.cos(a[0] * Math.PI / 180);
  return (Math.atan2((b[1] - a[1]) * k, b[0] - a[0]) * 180 / Math.PI + 360) % 360;
}
// the direction of the path `d` metres along it
export function headingAt(path, cum, d) {
  const total = cum[cum.length - 1], a = pointAt(path, cum, Math.max(0, Math.min(d, total - 12))), b = pointAt(path, cum, Math.max(0, Math.min(d, total - 12)) + 12);
  return bearing(a, b);
}
// metres from a point to the nearest part of a line
export function distTo(path, p) {
  let best = Infinity;
  const k = Math.cos(p[0] * Math.PI / 180), X = (q) => q[1] * 111320 * k, Y = (q) => q[0] * 111320, px = X(p), py = Y(p);
  for (let i = 1; i < path.length; i++) {
    const ax = X(path[i - 1]), ay = Y(path[i - 1]), dx = X(path[i]) - ax, dy = Y(path[i]) - ay, len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx - px, ay + t * dy - py));
  }
  return best;
}
// How much of the lines `others` (by length) runs within `tol` metres of `path`: 1 when the way back takes the same
// streets, less when it goes another way. Looked at every 25 m.
export function shareNear(path, others, tol = 30) {
  let near = 0, all = 0;
  for (const o of others) {
    const cum = measure(o), len = cum[cum.length - 1];
    for (let d = 0; d <= len; d += 25) { all++; if (distTo(path, pointAt(o, cum, d)) <= tol) near++; }
  }
  return all ? near / all : 1;
}

const T = (x) => (x ? Date.parse(x) : NaN);
// when a vehicle is at stop k: it arrives (live if known), it leaves (live if known)
export const reach = (s) => T(s.arrEst || s.arr || s.depEst || s.dep);
export const leave = (s) => T(s.depEst || s.dep || s.arrEst || s.arr);

// Where a bus or train is now, worked out from the times of its stops (VRR gives no GPS): before its first stop,
// standing at stop i, between stop i and i+1 (`frac` of the way, by time), or done. `at` is the distance along the
// path when a path is given, so the page can put a marker there and colour the part already driven.
// `pre` ({cum, pos}) are measure() and stopPositions() of this path, worked out once: the map asks every frame.
export function whereNow(stops, now, path = null, pre = null) {
  const n = stops.length;
  if (!n) return null;
  const cum = pre && pre.cum ? pre.cum : path && path.length > 1 ? measure(path) : null;
  const pos = pre && pre.pos ? pre.pos : cum ? stopPositions(stops, path, cum) : null;
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

// "I want this bus": which of its stops to walk to from `me`. Only stops it has not reached yet count, and not its last
// one (nobody gets on there). For each: the straight-line walk (walkMin) and the minutes left until the bus is there;
// `slack` is what is left over. The nearest stop if there is time (a minute or more), else the nearest one there is
// time for; `best` is null when none is reachable before the bus.
export function catchPlan(stops, now, pos, me, walk = (m) => walkMin(m)) {
  if (!pos || pos.state === 'done' || !me) return { done: !!pos && pos.state === 'done', nearest: null, best: null, all: [] };
  const first = pos.state === 'before' ? 0 : pos.state === 'at' ? pos.i + 1 : pos.j;
  const all = [];
  for (let k = first; k < stops.length - 1; k++) {
    const s = stops[k], t = k === 0 ? leave(s) : reach(s);
    if (!s.coord || !Number.isFinite(t)) continue;
    const m = metres(me, s.coord), w = walk(m);
    all.push({ k, m, walk: w, t, left: (t - now) / 60000, slack: (t - now) / 60000 - w });
  }
  if (!all.length) return { done: true, nearest: null, best: null, all };
  const near = (a, b) => (b.m < a.m ? b : a);
  const nearest = all.reduce(near), ok = all.filter((x) => x.slack >= 1);
  return { done: false, nearest, best: nearest.slack >= 1 ? nearest : ok.length ? ok.reduce(near) : null, all };
}

// The map without internet: the tiles of Xanten (down to its streets) and of the way to Wesel, coarser further out.
// [zoom, south, west, north, east]; the tile server has no tiles above zoom 14 (the map enlarges those).
export const CITY = [
  [14, 51.625, 6.385, 51.700, 6.505], [14, 51.645, 6.595, 51.675, 6.645],   // Xanten; the middle of Wesel
  [13, 51.600, 6.360, 51.720, 6.660],
  [12, 51.560, 6.280, 51.760, 6.720], [11, 51.540, 6.250, 51.780, 6.750], [10, 51.550, 6.300, 51.750, 6.700],
  [9, 51.45, 6.2, 51.85, 6.8], [8, 51.55, 6.35, 51.75, 6.65], [7, 51.6, 6.4, 51.7, 6.6], [6, 51.6, 6.4, 51.7, 6.6],
];
export function tileOf(lat, lon, z) {
  const n = 2 ** z;
  return [Math.floor(((lon + 180) / 360) * n), Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n)];
}
export function cityTiles(boxes = CITY) {
  const out = new Set();
  for (const [z, s, w, n, e] of boxes) {
    const [x0, y0] = tileOf(n, w, z), [x1, y1] = tileOf(s, e, z);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.add(`${z}/${x}/${y}`);
  }
  return [...out].map((k) => k.split('/').map(Number));
}
// One name for a tile whatever weekly version the tile server is at (its address changes every week): a kept tile
// stays good when the server moves on. sw.js names tiles the same way (tests/mapa.test.mjs checks they agree).
export function tileKey(url) {
  const m = String(url).match(/^(https:\/\/tiles\.openfreemap\.org)\/planet\/[^/?]+\/(\d+)\/(\d+)\/(\d+)\.pbf/);
  return m ? `${m[1]}/__tile/${m[2]}/${m[3]}/${m[4]}.pbf` : String(url).split('?')[0];
}
