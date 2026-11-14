// Departures and weather for the Транспорт and Погода pages. No sign-in: these are public data,
// so the Worker only checks the input, trims the answer and keeps it a short while.
//
//   GET /transit/stops?q=<text>          stops whose name matches (VRR OpenService, stop finder); when the text is
//                                        a street or an address without a stop of that name, also the stops nearest to it
//   GET /transit/stops?lat=<..>&lon=<..> the stops nearest to the phone
//   GET /transit/departures?stop=<id>    next departures from a stop, with live times and notices
//   GET /transit/trip?from=<id>&to=<id>  connections between two stops: times, changes, each leg with line, platform
//        [&when=YYYY-MM-DDTHH:MM]        and delay; when: departure time in Xanten time (default: now);
//        [&long=1]                       long=1 also allows ICE/IC/EC, where the Deutschlandticket is not valid;
//        [&paths=1]                      paths=1: each leg also with its path and the stops on the way (for the map)
//   GET /transit/area?lat=<..>&lon=<..>  the stops around a point of a 0.01° grid (about a kilometre), for the map
//   GET /transit/course?line=<id>&trip=<code>&stop=<id>&when=YYYY-MM-DDTHH:MM
//                                        where one bus or train goes: its stops with times (live where VRR has them)
//                                        and its path on the roads; line and trip come with every departure
//   GET /transit/line?line=<id>          every road a line takes in one direction (all its variants), for the map:
//                                        the way back of a course when it does not call at the same stop
//   GET /transit/walk?from=<lat,lon>&to=<lat,lon>  a walking route: metres, minutes and the path (OSRM on the
//                                        FOSSGIS server, © OpenStreetMap contributors); the spots are never kept
//   GET /weather?lat=<..>&lon=<..>       now, next 24 hours and 7 days (Open-Meteo)
//   GET /warnings?lat=<..>&lon=<..>      official weather warnings of the Deutscher Wetterdienst (through Bright Sky)
//
// VRR OpenService terms: live queries for one person at a time, no bulk download, and the source is named
// on the page ("Fahrplanauskünfte werden durch den VRR zur Verfügung gestellt. Alle Angaben ohne Gewähr.").
// Open-Meteo: free for non-commercial use, data under CC BY 4.0, named on the page.

const EFA = 'https://openservice.vrr.de/static03/';
const METEO = 'https://api.open-meteo.com/v1/forecast';
const FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/';
export const STOP_ID = /^de:\d{5}:\d{1,7}$/;
// a VRR trip: line id ("bvr:88X28:W:R:j26", "nia:25BSO: :R:j26") and trip code, as departures carry them
export const LINE_ID = /^[a-z0-9]{2,8}:[A-Za-z0-9 ]{1,12}:[A-Za-z0-9 _-]{1,4}:[A-Z]{1,2}:j\d{2}$/;
const STAMP = /^20\d\d-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d$/;
const memo = new Map();   // per Worker instance; the Cloudflare cache below is shared
const CACHE_V = 3;         // raise when the shape of an answer changes, so a new version never serves old answers
const inGermany = (lat, lon) => lat >= 47 && lat <= 55.2 && lon >= 5.8 && lon <= 15.1;

import { fetchWarnings } from './warn.js';

const PATHS = ['/transit/stops', '/transit/departures', '/transit/trip', '/transit/area', '/transit/course', '/transit/line', '/transit/walk', '/weather', '/warnings'];
export function isTransit(path) { return PATHS.includes(path); }

// These endpoints need no sign-in, so anyone could call them in a loop. Each address gets at most RATE calls a minute
// in one Worker instance; the ones that are never cached (an exact spot: walking routes, stops near me — each call
// reaches OSRM or VRR) get fewer, and with the LIMITER binding (wrangler.jsonc) that cap holds across all of Cloudflare.
const RATE = { light: 240, heavy: 30 };
const hits = new Map();   // `${kind}:${address}` → {n, until}
async function tooMany(request, env, heavy) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return false;   // not through Cloudflare's edge (local tests)
  const kind = heavy ? 'heavy' : 'light', key = `${kind}:${ip}`, now = Date.now();
  let h = hits.get(key);
  if (!h || h.until <= now) {
    if (hits.size > 5000) for (const [k, v] of hits) if (v.until <= now) hits.delete(k);
    h = { n: 0, until: now + 60000 }; hits.set(key, h);
  }
  if (++h.n > RATE[kind]) return true;
  if (heavy && env.LIMITER) { try { return !(await env.LIMITER.limit({ key: ip })).success; } catch { return false; } }
  return false;
}

export async function transit(request, env, ctx, reply, cors) {
  if (request.method !== 'GET') return reply(405, { ok: false, error: 'GET only' });
  const url = new URL(request.url), p = url.searchParams;
  const heavy = url.pathname === '/transit/walk' || (url.pathname === '/transit/stops' && (p.has('lat') || /\d/.test(p.get('q') || '')));
  if (await tooMany(request, env, heavy)) return reply(429, { ok: false, error: 'too_many' });
  try {
    if (url.pathname === '/transit/stops') {
      if (p.has('lat') || p.has('lon')) {
        const lat = Number(p.get('lat')), lon = Number(p.get('lon'));
        if (!inGermany(lat, lon)) return reply(400, { ok: false, error: 'lat and lon in Germany' });
        // about 100 m is enough to find the nearest stop; the spot is neither kept nor written to the log
        return await cached('', 0, ctx, cors, url.origin, async () => ({ stops: [], near: await nearby([lat.toFixed(3), lon.toFixed(3)], '', 'here'), nearFirst: true }));
      }
      const q = String(p.get('q') || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim();
      if (q.length < 2 || q.length > 60) return reply(400, { ok: false, error: 'q: 2 to 60 characters' });
      // a text with a number is probably someone's address: answered, never kept
      return await cached(`stops:${q.toLowerCase()}`, /\d/.test(q) ? 0 : 86400, ctx, cors, url.origin, () => stops(q));
    }
    if (url.pathname === '/transit/departures') {
      const stop = String(p.get('stop') || '');
      if (!STOP_ID.test(stop)) return reply(400, { ok: false, error: 'stop: an id like de:05170:37032' });
      return await cached(`dep:${stop}`, 30, ctx, cors, url.origin, () => departures(stop));
    }
    if (url.pathname === '/transit/trip') {
      const from = String(p.get('from') || ''), to = String(p.get('to') || ''), when = String(p.get('when') || ''), long = p.get('long') === '1', paths = p.get('paths') === '1', arr = p.get('arr') === '1';
      if (!STOP_ID.test(from) || !STOP_ID.test(to) || from === to) return reply(400, { ok: false, error: 'from and to: two different stop ids' });
      if (when && !STAMP.test(when)) return reply(400, { ok: false, error: 'when: YYYY-MM-DDTHH:MM' });
      // "now" is kept by the minute it was asked in, a chosen time a little longer
      const stamp = when || berlinStamp(new Date());
      // arr=1: the time is when to arrive at the latest ("there by 9:00"), otherwise when to leave
      return await cached(`trip:${from}:${to}:${stamp}:${long ? 1 : 0}:${paths ? 1 : 0}:${arr ? 1 : 0}`, when ? 60 : 30, ctx, cors, url.origin, () => trip(from, to, stamp, long, paths, arr));
    }
    if (url.pathname === '/transit/area') {
      const lat = Number(p.get('lat')), lon = Number(p.get('lon'));
      if (p.get('lat') === null || p.get('lon') === null || !inGermany(lat, lon)) return reply(400, { ok: false, error: 'lat and lon in Germany' });
      // the map asks by grid cell: the same cells for everyone, so they can be kept a day, and the spot is only a cell
      const la = lat.toFixed(2), lo = lon.toFixed(2);
      return await cached(`area:${la},${lo}`, 86400, ctx, cors, url.origin, () => area(la, lo));
    }
    if (url.pathname === '/transit/course') {
      const line = String(p.get('line') || ''), code = String(p.get('trip') || ''), stop = String(p.get('stop') || ''), when = String(p.get('when') || '');
      if (!LINE_ID.test(line) || !/^\d{1,6}$/.test(code) || !STOP_ID.test(stop) || !STAMP.test(when)) return reply(400, { ok: false, error: 'line, trip, stop and when as a departure gives them' });
      return await cached(`course:${line}:${code}:${stop}:${when}`, 30, ctx, cors, url.origin, () => course(line, code, stop, when));
    }
    if (url.pathname === '/transit/line') {
      const line = String(p.get('line') || '');
      if (!LINE_ID.test(line)) return reply(400, { ok: false, error: 'line: an id as a departure gives it' });
      return await cached(`line:${line}`, 86400, ctx, cors, url.origin, () => lineRoads(line));
    }
    if (url.pathname === '/transit/walk') {
      const a = String(p.get('from') || '').split(',').map(Number), b = String(p.get('to') || '').split(',').map(Number);
      const ok = (c) => c.length === 2 && c.every((n) => Number.isFinite(n)) && inGermany(c[0], c[1]);
      if (!ok(a) || !ok(b)) return reply(400, { ok: false, error: 'from and to: lat,lon in Germany' });
      if (metres(a, b) > 15000) return reply(400, { ok: false, error: 'too far to walk' });
      return await cached('', 0, ctx, cors, url.origin, () => walk(a, b));
    }
    const lat = Number(p.get('lat')), lon = Number(p.get('lon'));
    if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180) || p.get('lat') === null || p.get('lon') === null)
      return reply(400, { ok: false, error: 'lat and lon' });
    // two decimals is about a kilometre: enough for the weather, and the exact spot never leaves the Worker
    const la = lat.toFixed(2), lo = lon.toFixed(2);
    if (url.pathname === '/warnings') return await cached(`warn:${la},${lo}`, 300, ctx, cors, url.origin, () => fetchWarnings(la, lo));
    return await cached(`wx:${la},${lo}`, 600, ctx, cors, url.origin, () => weather(la, lo));
  } catch (e) {
    console.log('transit failed', url.pathname, String(e && e.message || e));
    return reply(502, { ok: false, error: 'upstream' });
  }
}

// Answers are kept in memory and in the Cloudflare cache for ttl seconds (0: not kept anywhere); errors are never kept
async function cached(key, ttl, ctx, cors, origin, make) {
  const now = Date.now(), m = ttl ? memo.get(key) : null;
  const out = (body) => new Response(body, { headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': ttl ? `public, max-age=${Math.min(ttl, 60)}` : 'no-store' } });
  if (!ttl) return out(JSON.stringify({ ok: true, ...(await make()) }));
  if (m && m.until > now) return out(m.body);
  const cache = globalThis.caches && caches.default, ckey = new Request(origin + `/__cache/v${CACHE_V}/` + encodeURIComponent(key));
  if (cache) {
    try { const hit = await cache.match(ckey); if (hit) { const body = await hit.text(); remember(key, body, ttl, now); return out(body); } } catch (e) {}
  }
  const data = await make();
  const body = JSON.stringify({ ok: true, ...data });
  remember(key, body, ttl, now);
  if (cache) {
    const put = cache.put(ckey, new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` } })).catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(put);
  }
  return out(body);
}
function remember(key, body, ttl, now) {
  if (memo.size > 300) memo.delete(memo.keys().next().value);
  memo.set(key, { body, until: now + ttl * 1000 });
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'd-simya (Telegram Mini App; github.com/w2unemdhysend/d-simya)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ---------------- VRR ---------------- */
// EFA product classes → train, tram, bus, ferry (14–16 long distance, 17 rail replacement buses, 19 Bürgerbus)
const MODE = { 0: 'train', 1: 'train', 13: 'train', 14: 'train', 15: 'train', 16: 'train', 2: 'tram', 3: 'tram', 4: 'tram', 8: 'tram', 9: 'ferry' };
const modeOf = (cls) => MODE[cls] || 'bus';

const PLACE_TYPES = ['street', 'singlehouse', 'address'];
const stopOf = (l) => ({
  id: l.id, name: clip(l.disassembledName || l.name, 80), place: clip(l.parent && l.parent.name, 60),
  full: clip(l.parent && l.parent.name && !String(l.name).includes(',') ? `${l.parent.name}, ${l.name}` : l.name, 120),
  modes: [...new Set((l.productClasses || []).map(modeOf))],
  coord: Array.isArray(l.coord) && l.coord.length === 2 ? l.coord.map((n) => Math.round(n * 1e4) / 1e4) : null,
});

async function stops(q) {
  const u = new URL(EFA + 'XML_STOPFINDER_REQUEST');
  // 14 = stops (2) + streets (4) + addresses (8)
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', type_sf: 'any', name_sf: q,
    anyObjFilter_sf: '14', anyMaxSizeHitList: '16', locationServerActive: '1' }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  const all = (d.locations || []).sort((a, b) => (b.matchQuality || 0) - (a.matchQuality || 0));
  const list = all.filter((l) => l.type === 'stop' && STOP_ID.test(l.id || '')).slice(0, 8);
  const out = await lookAlikes(list.map(stopOf));
  // A street or an address that matches better than any stop name (there is no stop called that): the stops nearest to it.
  // With a house number it is always an address search.
  const place = all.find((l) => PLACE_TYPES.includes(l.type) && Array.isArray(l.coord));
  const best = list.length ? Math.max(...list.map((l) => l.matchQuality || 0)) : -1;
  let near = null;
  if (place && (place.type !== 'street' || (place.matchQuality || 0) > best)) {
    near = await nearby(place.coord.map((n) => n.toFixed(5)), clip(place.name, 120), place.type === 'street' ? 'street' : 'address');
  }
  return { stops: out, near, nearFirst: !!near && (!out.length || place.type !== 'street' || (place.matchQuality || 0) > best) };
}

// Stops within 3 km of a point, nearest first, with the distance in metres (as VRR measures it, in a straight line)
async function nearby([lat, lon], name, kind) {
  const u = new URL(EFA + 'XML_COORD_REQUEST');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', inclFilter: '1', type_1: 'STOP', radius_1: '3000', max: '8',
    coord: `${lon}:${lat}:WGS84[dd.ddddd]` }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  const list = (d.locations || []).filter((l) => l.type === 'stop' && STOP_ID.test(l.id || ''))
    .map((l) => ({ ...stopOf(l), dist: Math.round(Number(l.properties && l.properties.distance) || 0) }))
    .sort((a, b) => a.dist - b.dist).slice(0, 6);
  return { name, kind, coord: [Number(lat), Number(lon)], stops: await lookAlikes(list) };
}

// Every stop around a grid point (1.3 km: the cells overlap, so a stop near the edge of one is in the next one too)
async function area(lat, lon) {
  const u = new URL(EFA + 'XML_COORD_REQUEST');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', inclFilter: '1', type_1: 'STOP', radius_1: '1300', max: '150',
    coord: `${lon}:${lat}:WGS84[dd.ddddd]` }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  const stops = (d.locations || []).filter((l) => l.type === 'stop' && STOP_ID.test(l.id || '') && Array.isArray(l.coord)).map(stopOf);
  return { cell: [Number(lat), Number(lon)], stops };
}

// One trip from first stop to last: the stops with planned and live times, and the road it takes
// VRR's server now and then answers this one with an error that is gone a moment later: one more try.
async function course(line, code, stop, stamp) {
  const u = new URL(EFA + 'XML_STOPSEQCOORD_REQUEST');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', line, stop, tripCode: code,
    date: stamp.slice(0, 10).replace(/-/g, ''), time: stamp.slice(11).replace(':', ''), tStOTType: 'all', useRealtime: '1' }).forEach(([k, v]) => u.searchParams.set(k, v));
  let d;
  try { d = await getJson(u); } catch (e) { d = await getJson(u); }
  const l = d.leg;
  if (!l || !Array.isArray(l.stopSequence) || l.stopSequence.length < 2) throw new Error('course: no stops');
  const t = l.transportation || {}, prod = t.product || {};
  return {
    line: clip(t.disassembledName || t.number || prod.name, 24), mode: modeOf(prod.class), dest: clip(t.destination && t.destination.name, 80),
    live: (l.realtimeStatus || []).includes('MONITORED'),
    stops: l.stopSequence.map(seqStop),
    path: simplify(l.coords || [], 4),
    at: new Date().toISOString(),
  };
}
// the stop's id of a place in an answer (a platform belongs to its stop)
const stopIdOf = (s) => (s.parent && STOP_ID.test(s.parent.id || '') ? s.parent.id : (String(s.id || '').match(/^de:\d{5}:\d{1,7}/) || [''])[0]) || null;
// a stop of a stop sequence: the stop's id (not its platform), name, times, and where exactly the bus stops: the
// platform's point (on the side of the street the bus drives on) and its name
function seqStop(s) {
  const pid = s.parent && STOP_ID.test(s.parent.id || '') ? s.parent.id : (String(s.id || '').match(/^de:\d{5}:\d{1,7}/) || [''])[0];
  const pr = s.properties || {};
  return { id: pid, name: clip(s.parent && s.parent.name ? s.parent.name : s.name, 80), coord: round5(s.coord), plat: clip(pr.platformName || pr.platform || (s.type === 'platform' ? s.disassembledName : ''), 12),
    arr: s.arrivalTimePlanned || null, arrEst: s.arrivalTimeEstimated || null, dep: s.departureTimePlanned || null, depEst: s.departureTimeEstimated || null };
}

// The roads of a line in one direction, every variant together, as VRR draws the line (XML_GEOOBJECT_REQUEST).
// That server sometimes answers 502 to this heavy question: one more try.
async function lineRoads(line) {
  const u = new URL(EFA + 'XML_GEOOBJECT_REQUEST');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', line }).forEach(([k, v]) => u.searchParams.set(k, v));
  let d;
  try { d = await getJson(u); } catch (e) { d = await getJson(u); }
  const t = (d.transportations || [])[0];
  if (!t || !Array.isArray(t.coords)) throw new Error('line: no roads');
  const parts = t.coords.filter((c) => Array.isArray(c) && c.length > 1).map((c) => simplify(c, 5)).filter((c) => c.length > 1);
  return { line: clip(t.disassembledName || t.number, 24), dest: clip(t.destination && t.destination.name, 80), paths: parts, at: new Date().toISOString() };
}
// [lat, lon] to five decimals (about a metre); anything that is not a point on Earth (old answers had other coordinates) is null
const round5 = (c) => (Array.isArray(c) && c.length >= 2 && Math.abs(c[0]) <= 90 && Math.abs(c[1]) <= 180 ? [c[0], c[1]].map((n) => Math.round(n * 1e5) / 1e5) : null);

// On foot from a to b along footpaths: OSRM's "foot" profile on the FOSSGIS server (about 4.5 km/h)
async function walk(a, b) {
  const d = await getJson(`${FOOT}${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson&steps=false&alternatives=false`);
  const r = d && d.code === 'Ok' && (d.routes || [])[0];
  if (!r) throw new Error('walk: no route');
  return { m: Math.round(r.distance), min: Math.max(1, Math.round(r.duration / 60)), path: simplify(r.geometry.coordinates.map(([lo, la]) => [la, lo]), 2) };
}

// metres between two [lat, lon] (flat-earth: good enough for a town)
export function metres(a, b) {
  const k = Math.cos((a[0] + b[0]) * Math.PI / 360);
  return Math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * k);
}
// A line of [lat, lon] with fewer points: those within tol metres of the straight line between their neighbours go
// (Douglas–Peucker); the shape on the map stays the same, the answer gets much smaller
export function simplify(pts, tol) {
  const p = pts.filter((c) => Array.isArray(c) && c.length >= 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]));
  if (p.length < 3) return p.map(round5);
  const k = Math.cos(p[0][0] * Math.PI / 180), xy = p.map(([la, lo]) => [lo * 111320 * k, la * 111320]);
  const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1;
  const stack = [[0, p.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const [x1, y1] = xy[i], [x2, y2] = xy[j], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    let far = -1, best = tol;
    for (let n = i + 1; n < j; n++) {
      const dist = Math.abs(dy * xy[n][0] - dx * xy[n][1] + x2 * y1 - y2 * x1) / len;
      if (dist > best) { best = dist; far = n; }
    }
    if (far > 0) { keep[far] = 1; stack.push([i, far], [far, j]); }
  }
  return p.filter((c, n) => keep[n]).map(round5);
}

// The finder also matches old names: "Lüttingen Schule" can be a stop now called Hagelkreuzstraße, and two stops on
// either side of a road share one name. For such look-alikes ask the stop itself: its real name and where buses go from it.
async function lookAlikes(out) {
  const same = out.filter((s) => out.filter((x) => x.full === s.full).length > 1).slice(0, 6);
  await Promise.all(same.map(async (s) => {
    try {
      const dm = await departures(s.id, 8);
      const real = dm.stop.name.replace(/^[^,]+,\s*/, '');
      if (real && real !== s.name) { s.aka = s.name; s.name = real; s.full = dm.stop.name; }
      s.towards = [...new Set(dm.deps.map((x) => x.dest))].slice(0, 2);
    } catch (e) {}
  }));
  return out;
}

export async function departures(stop, limit = 40) {
  const u = new URL(EFA + 'XML_DM_REQUEST');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', type_dm: 'stop', name_dm: stop, mode: 'direct',
    useRealtime: '1', limit: String(limit), depType: 'stopEvents', includeCompleteStopSeq: '0', useProxFootSearch: '0' })
    .forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  const loc = (d.locations || [])[0] || {};
  const notices = [], noticeAt = new Map(), hints = [], hintAt = new Map();
  const noteOf = (i) => {
    if (!noticeAt.has(i.id)) {
      const l = (i.infoLinks || [])[0] || {};
      noticeAt.set(i.id, notices.length);
      notices.push({ title: clip(l.title || l.subtitle || l.urlText, 160), line: clip(l.urlText || l.smsText, 240),
        text: clip(plain(l.content), 1500), url: /^https?:\/\/[\w.-]+\.vrr\.de\//.test(l.url || '') ? String(l.url).replace(/^http:/, 'https:') : null,
        when: clip(i.properties && i.properties.incidentDateTime, 60),
        notInTimes: /nicht\s+berücksichtigt/i.test(plain(l.additionalText)) });   // "not yet in the timetable above"
    }
    return noticeAt.get(i.id);
  };
  const hintOf = (h) => {
    const t = clip(String(h.content || '').trim(), 300);
    if (!t) return -1;
    if (!hintAt.has(t)) { hintAt.set(t, hints.length); hints.push(t); }
    return hintAt.get(t);
  };
  const deps = (d.stopEvents || []).map((e) => {
    const t = e.transportation || {}, prod = t.product || {}, props = (e.location && e.location.properties) || {};
    const status = e.realtimeStatus || [];
    return {
      line: clip(t.disassembledName || t.number || prod.name, 24), kind: clip(prod.name, 30), mode: modeOf(prod.class),
      dest: clip(t.destination && t.destination.name, 80),
      plan: e.departureTimePlanned || null, est: e.departureTimeEstimated || null,
      live: !!e.isRealtimeControlled || status.includes('MONITORED'),
      gone: !!e.isCancelled || status.includes('TRIP_CANCELLED') || status.includes('CANCELLED'),
      plat: clip(props.platformName || props.platform, 12), platOld: props.plannedPlatformName && props.plannedPlatformName !== props.platformName ? clip(props.plannedPlatformName, 12) : '',
      notes: (e.infos || []).map(noteOf), hints: (e.hints || []).filter((h) => h.type !== 'RTSTATUS').map(hintOf).filter((n) => n >= 0),
      // what the map needs to ask where this bus goes (/transit/course)
      ref: LINE_ID.test(t.id || '') && /^\d{1,6}$/.test(String((t.properties || {}).tripCode)) ? { line: t.id, trip: String(t.properties.tripCode) } : null,
    };
  }).filter((x) => x.plan);
  return { stop: { id: stop, name: clip(loc.name || loc.disassembledName, 120), coord: round5(loc.coord) }, at: new Date().toISOString(), deps, notices, hints };
}

// 'YYYY-MM-DDTHH:MM' in Xanten time for a moment
function berlinStamp(date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

// Connections between two stops. Long-distance trains (EFA classes 14–16: ICE, IC, EC) are left out unless asked for:
// the Deutschlandticket is not valid on them. The answer from VRR is large (alternatives for every leg); only what
// the page shows is passed on.
const LONG = [14, 15, 16], WALK = [99, 100];
export async function trip(from, to, stamp, long = false, paths = false, arr = false) {
  const u = new URL(EFA + 'XML_TRIP_REQUEST2');
  Object.entries({ outputFormat: 'rapidJSON', coordOutputFormat: 'WGS84[dd.ddddd]', type_origin: 'any', name_origin: from, type_destination: 'any', name_destination: to,
    itdDateTimeDepArr: arr ? 'arr' : 'dep', itdDate: stamp.slice(0, 10).replace(/-/g, ''), itdTime: stamp.slice(11).replace(':', ''), calcNumberOfTrips: '4', useRealtime: '1',
    routeType: 'LEASTTIME', useProxFootSearch: '0', locationServerActive: '1', genC: paths ? '1' : '0', genMaps: '0', genP: '0',
    ...(long ? {} : { excludedMeans: 'checkbox', exclMOT_14: '1', exclMOT_15: '1', exclMOT_16: '1' }) }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  const stopName = (l) => clip(l.type === 'platform' && l.parent ? l.parent.name : l.name, 80);
  const point = (l, kind) => {
    const pr = l.properties || {};
    return { name: stopName(l), plan: l[kind + 'TimePlanned'] || null, est: l[kind + 'TimeEstimated'] || null,
      plat: clip(pr.platformName || pr.platform, 12), platOld: pr.plannedPlatformName && pr.plannedPlatformName !== pr.platformName ? clip(pr.plannedPlatformName, 12) : '' };
  };
  const trips = (d.journeys || []).map((j) => {
    const legs = (j.legs || []).map((l) => {
      const t = l.transportation || {}, prod = t.product || {}, walk = WALK.includes(prod.class) || !t.product, status = l.realtimeStatus || [];
      const after = (l.footPathInfo || []).find((f) => f.position === 'AFTER');
      return {
        walk, mode: walk ? 'walk' : modeOf(prod.class), line: walk ? '' : clip(t.disassembledName || t.number || prod.name, 24), kind: clip(prod.name, 30),
        dir: walk ? '' : clip(t.destination && t.destination.name, 80), long: LONG.includes(prod.class),
        from: point(l.origin || {}, 'departure'), to: point(l.destination || {}, 'arrival'),
        mins: Math.round((l.duration || 0) / 60), stops: Math.max(0, (l.stopSequence || []).length - 1), walkAfter: after ? Math.round(after.duration / 60) : 0,
        gone: !!l.isCancelled || status.includes('TRIP_CANCELLED') || status.includes('CANCELLED'),
        notes: (l.infos || []).map((i) => clip(((i.infoLinks || [])[0] || {}).title || ((i.infoLinks || [])[0] || {}).urlText, 160)).filter(Boolean).slice(0, 2),
        // what the map needs to show this very bus (/transit/course): its line and trip, and the stop where it is boarded
        ...(walk ? {} : { ref: LINE_ID.test(t.id || '') && /^\d{1,6}$/.test(String((t.properties || {}).tripCode)) ? { line: t.id, trip: String(t.properties.tripCode) } : null, stop: stopIdOf(l.origin || {}) }),
        ...(paths ? { path: simplify(l.coords || [], 4), on: (l.stopSequence || []).map(seqStop).filter((x) => x.coord).map((x) => ({ name: x.name, coord: x.coord })) } : {}),
      };
    }).filter((l) => l.from.plan && l.to.plan);
    if (!legs.length) return null;
    const first = legs[0].from, last = legs[legs.length - 1].to;
    return { dep: first.plan, depEst: first.est, arr: last.plan, arrEst: last.est, changes: Math.max(0, legs.filter((l) => !l.walk).length - 1),
      mins: Math.round((Date.parse(last.est || last.plan) - Date.parse(first.est || first.plan)) / 60000), legs };
  }).filter(Boolean);
  const names = trips.length ? { from: trips[0].legs[0].from.name, to: trips[0].legs[trips[0].legs.length - 1].to.name } : { from: '', to: '' };
  return { from: { id: from, name: names.from }, to: { id: to, name: names.to }, when: stamp, long, at: new Date().toISOString(), trips };
}

const clip = (s, n) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim().slice(0, n);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü',
  szlig: 'ß', ndash: '–', mdash: '—', bdquo: '„', ldquo: '“', rdquo: '”', sbquo: '‚', lsquo: '‘', rsquo: '’', euro: '€', hellip: '…', bull: '•', eacute: 'é' };
// Notice text arrives as HTML: keep the words and line breaks, drop every tag (the page shows it as plain text)
export function plain(html) {
  return String(html || '')
    .replace(/<\s*(br|\/p|\/div|\/li|\/h\d)\b[^>]*>/gi, '\n').replace(/<\s*li\b[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === '#'
      ? String.fromCodePoint(parseInt(e[1] === 'x' || e[1] === 'X' ? e.slice(2) : e.slice(1), e[1] === 'x' || e[1] === 'X' ? 16 : 10) || 32)
      : (ENT[e] !== undefined ? ENT[e] : m))
    .replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/* ---------------- weather ---------------- */
export async function weather(lat, lon) {
  const u = new URL(METEO);
  Object.entries({ latitude: lat, longitude: lon, timezone: 'Europe/Berlin', wind_speed_unit: 'kmh', forecast_days: '7', forecast_hours: '24',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_gusts_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,wind_gusts_10m_max',
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  const d = await getJson(u);
  if (!d.current || !d.hourly || !d.daily) throw new Error('weather: incomplete answer');
  return { now: d.current, hourly: d.hourly, daily: d.daily, at: new Date().toISOString() };
}
