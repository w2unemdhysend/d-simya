// Checks the Worker's public routes for the Транспорт, Маршрут, Мапа and Погода pages: input checks, trimming of the
// VRR, OSRM and Open-Meteo answers, notice text cleaned of HTML, caching, and that upstream failures are reported, not kept.
// Run: node tests/transit.test.mjs   (Node 22+, no packages needed; upstream answers come from tests/fixtures)
import { readFileSync } from 'node:fs';
import worker from '../worker/send-scan.js';
import { plain } from '../worker/transit.js';

const fx = (n) => JSON.parse(readFileSync(new URL('./fixtures/' + n, import.meta.url)));
const TRIP = fx('efa-trip.json');
const DM = fx('efa-dm.json'), SF = fx('efa-sf.json'), METEO = fx('meteo.json'), COORD = fx('efa-coord.json');
const AREA = fx('efa-area.json'), SEQ = fx('efa-stopseq.json'), FOOT = fx('osrm-foot.json');
// what the stop finder says for a street and for an address (no stop has that name)
const STREET = { locations: [{ type: 'street', id: 'streetID:1', name: 'Xanten, Sonsbecker Straße', matchQuality: 250, coord: [51.6531, 6.4402] },
  { type: 'stop', id: 'de:05170:99001', name: 'Sonsbeck, Markt', disassembledName: 'Markt', matchQuality: 120, productClasses: [5], parent: { name: 'Sonsbeck' } }] };
const HOUSE = { locations: [{ type: 'singlehouse', id: 'streetID:2:17', name: 'Xanten, Kalkarer Straße 17', matchQuality: 250, coord: [51.699341, 6.374185] }] };
const calls = [];
let down = false;
globalThis.fetch = async (url) => {
  const u = new URL(String(url)); calls.push(u);
  if (down) return new Response('busy', { status: 503 });
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_STOPFINDER_REQUEST')) {
    const q = u.searchParams.get('name_sf');
    return Response.json(/Sonsbecker/.test(q) ? STREET : /\d/.test(q) ? HOUSE : SF);
  }
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_COORD_REQUEST')) return Response.json(u.searchParams.get('radius_1') === '1300' ? AREA : COORD);
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_STOPSEQCOORD_REQUEST')) return Response.json(SEQ);
  if (u.hostname === 'routing.openstreetmap.de') return Response.json(FOOT);
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_DM_REQUEST')) {
    // the look-alike check asks each stop for its own name
    const id = u.searchParams.get('name_dm');
    if (id === 'de:05170:36229') return Response.json({ locations: [{ name: 'Xanten, Hagelkreuzstraße' }], stopEvents: DM.stopEvents.slice(4, 6) });
    if (id === 'de:05170:36246') return Response.json({ locations: [{ name: 'Xanten, Lüttingen Schule' }], stopEvents: DM.stopEvents.slice(0, 2) });
    return Response.json(DM);
  }
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_TRIP_REQUEST2')) {
    if (u.searchParams.get('genC') !== '1') return Response.json(TRIP);
    // with paths: every leg gets the road of the course fixture and its stops
    const withPaths = structuredClone(TRIP);
    for (const j of withPaths.journeys) for (const l of j.legs) { l.coords = SEQ.leg.coords.slice(0, 200); l.stopSequence = SEQ.leg.stopSequence.slice(0, 5); }
    return Response.json(withPaths);
  }
  if (u.hostname === 'api.open-meteo.com') return Response.json(METEO);
  return new Response('unexpected ' + u, { status: 599 });
};
const env = { BOT_TOKEN: '1:x' };
const ctx = { waitUntil() {} };
const get = async (path, method = 'GET') => {
  const r = await worker.fetch(new Request('https://w.example' + path, { method }), env, ctx);
  return { status: r.status, body: await r.json().catch(() => null), acao: r.headers.get('Access-Control-Allow-Origin') };
};
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };

// input checks
t('stops: one letter is refused', (await get('/transit/stops?q=X')).status === 400);
t('stops: very long text is refused', (await get('/transit/stops?q=' + 'a'.repeat(61))).status === 400);
t('departures: a made-up id is refused', (await get('/transit/departures?stop=..%2F..%2Fetc')).status === 400);
t('departures: no id is refused', (await get('/transit/departures')).status === 400);
t('weather: missing lon is refused', (await get('/weather?lat=51.6')).status === 400);
t('weather: out of range is refused', (await get('/weather?lat=95&lon=6')).status === 400);
t('POST is refused', (await get('/transit/stops?q=Xanten', 'POST')).status === 405);
t('no upstream call for refused input', calls.length === 0, calls.map(String).join(' '));

// stop finder
let r = await get('/transit/stops?q=' + encodeURIComponent('Xanten Lüttingen'));
const s = r.body && r.body.stops;
t('stops: answer for the page origin', r.status === 200 && r.acao === 'https://w2unemdhysend.github.io', JSON.stringify(r));
t('stops: streets are left out, only stops with real ids', s && s.length === 4 && s.every((x) => /^de:\d{5}:\d+$/.test(x.id)), JSON.stringify(s));
t('stops: look-alike gets its real name and keeps the searched one', s && s[0].name === 'Hagelkreuzstraße' && s[0].aka === 'Lüttingen Schule' && s[0].full === 'Xanten, Hagelkreuzstraße', JSON.stringify(s && s[0]));
t('stops: the other look-alike keeps its name and says where buses go', s && s[1].name === 'Lüttingen Schule' && !s[1].aka && s[1].towards.length > 0, JSON.stringify(s && s[1]));
t('stops: modes from product classes', s && s.every((x) => x.modes.includes('bus')));
const before = calls.length;
await get('/transit/stops?q=' + encodeURIComponent('xanten lüttingen'));
t('stops: same search again comes from the cache', calls.length === before, calls.length - before);

t('stops: a stop name gives no "nearest" list', s && r.body.near === null);

// a street without a stop of that name: the stops nearest to it
r = await get('/transit/stops?q=' + encodeURIComponent('Xanten Sonsbecker Straße'));
let cc = calls.filter((u) => u.pathname.endsWith('XML_COORD_REQUEST')).pop();
t('street: nearest stops come first, the weaker name match after', r.body.near && r.body.near.kind === 'street' && r.body.nearFirst === true && r.body.stops.length === 1, JSON.stringify(r.body).slice(0, 300));
t('street: stops sorted by distance, with metres', r.body.near.stops.length === 6 && r.body.near.stops.every((x, i, a) => !i || a[i - 1].dist <= x.dist) && r.body.near.stops[0].dist === 233, JSON.stringify(r.body.near.stops.map((x) => x.dist)));
t('street: asks VRR around the street point, 3 km', cc && cc.searchParams.get('coord') === '6.44020:51.65310:WGS84[dd.ddddd]' && cc.searchParams.get('radius_1') === '3000', String(cc));
t('street: full stop name has its town', r.body.near.stops[0].full === 'Xanten, Birgittenstr.', r.body.near.stops[0].full);
let n0 = calls.length;
await get('/transit/stops?q=' + encodeURIComponent('Xanten Sonsbecker Straße'));
t('street: a street search may be cached', calls.length === n0);
// an address with a house number: never kept
r = await get('/transit/stops?q=' + encodeURIComponent('Xanten Kalkarer Straße 17'));
t('address: nearest stops for the house', r.body.near && r.body.near.kind === 'address' && r.body.near.name === 'Xanten, Kalkarer Straße 17' && r.body.near.stops.length === 6);
n0 = calls.length;
const again = await worker.fetch(new Request('https://w.example/transit/stops?q=' + encodeURIComponent('Xanten Kalkarer Straße 17')), env, ctx);
t('address: never cached, asked again and marked no-store', calls.length > n0 && again.headers.get('Cache-Control') === 'no-store');
// near the phone
r = await get('/transit/stops?lat=51.661583&lon=6.454371');
cc = calls.filter((u) => u.pathname.endsWith('XML_COORD_REQUEST')).pop();
t('here: spot rounded to three decimals before it goes to VRR', cc.searchParams.get('coord') === '6.454:51.662:WGS84[dd.ddddd]', cc.searchParams.get('coord'));
t('here: nearest stops, nothing else', r.status === 200 && r.body.near.kind === 'here' && r.body.stops.length === 0 && r.body.nearFirst === true);
t('here: outside Germany is refused', (await get('/transit/stops?lat=40.1&lon=6.4')).status === 400 && (await get('/transit/stops?lat=51.6')).status === 400);

// departures
r = await get('/transit/departures?stop=de:05170:37032');
const d = r.body;
t('departures: stop name and the time of the answer', r.status === 200 && d.stop.name === 'Xanten, Bahnhof' && !isNaN(new Date(d.at)), JSON.stringify(d && d.stop));
t('departures: every trip keeps line, destination and planned time', d.deps.length === 9 && d.deps.every((x) => x.line && x.dest && x.plan));
t('departures: live trips are marked', d.deps[0].live === true && d.deps[0].est && d.deps[2].live === false);
t('departures: cancelled trip is marked', d.deps[7].gone === true && d.deps.filter((x) => x.gone).length === 1);
t('departures: changed platform shows the planned one', d.deps[0].plat === '5' && d.deps[0].platOld === '4' && d.deps[1].platOld === '', JSON.stringify(d.deps[0]));
t('departures: rail replacement is a bus with its line', d.deps[8].line === 'SEV RB 31' && d.deps[8].mode === 'bus', JSON.stringify(d.deps[8]));
t('departures: notices are shared, not repeated', d.notices.length === 2 && d.deps[1].notes[0] === d.deps[7].notes[0], JSON.stringify(d.deps.map((x) => x.notes)));
const n = d.notices[0];
t('departures: notice text without HTML, umlauts decoded', !/[<>]|&\w+;/.test(n.text) && /Verspätungen/.test(n.text), n.text.slice(0, 200));
t('departures: notice links only to vrr.de, over https', d.notices.every((x) => x.url === null || /^https:\/\/[\w.-]+\.vrr\.de\//.test(x.url)));
t('departures: notice says it is not in the times yet', n.notInTimes === true);
t('departures: TaxiBus hint kept once', d.hints.filter((h) => /TaxiBus/.test(h)).length === 1 && d.deps[1].hints.length >= 1, JSON.stringify(d.hints));
const dmCall = calls.filter((u) => u.pathname.endsWith('XML_DM_REQUEST')).pop();
t('departures: asks VRR for live times, 40 trips, JSON', dmCall.searchParams.get('useRealtime') === '1' && dmCall.searchParams.get('limit') === '40' && dmCall.searchParams.get('outputFormat') === 'rapidJSON');

// weather
r = await get('/weather?lat=51.672849&lon=6.461471');
const mc = calls.filter((u) => u.hostname === 'api.open-meteo.com').pop();
t('weather: spot rounded to two decimals before it leaves the Worker', mc.searchParams.get('latitude') === '51.67' && mc.searchParams.get('longitude') === '6.46', String(mc));
t('weather: Xanten time, 24 hours, 7 days', mc.searchParams.get('timezone') === 'Europe/Berlin' && mc.searchParams.get('forecast_hours') === '24' && mc.searchParams.get('forecast_days') === '7');
t('weather: now, hours and days come back', r.status === 200 && r.body.now.temperature_2m !== undefined && r.body.hourly.time.length === 24 && r.body.daily.time.length === 7);
const wb = calls.length;
await get('/weather?lat=51.6731&lon=6.4609');
t('weather: a spot in the same square kilometre comes from the cache', calls.length === wb);

// upstream down: an error, not kept
down = true;
r = await get('/transit/departures?stop=de:05170:99999');
t('upstream down: 502 with a short error', r.status === 502 && r.body.error === 'upstream', JSON.stringify(r));
down = false;
const c2 = calls.length;
r = await get('/transit/departures?stop=de:05170:99999');
t('upstream back: the failure was not cached', r.status === 200 && calls.length === c2 + 1);

// connections between two stops
r = await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&when=2026-11-12T08:00');
const tripCall = calls.filter((u) => u.pathname.endsWith('XML_TRIP_REQUEST2')).pop();
t('trip: asks VRR with date and time in Xanten time, live data, no long-distance trains', tripCall.searchParams.get('itdDate') === '20261112' && tripCall.searchParams.get('itdTime') === '0800'
  && tripCall.searchParams.get('name_origin') === 'de:05170:37032' && tripCall.searchParams.get('exclMOT_15') === '1' && tripCall.searchParams.get('useRealtime') === '1', tripCall.search);
const tr = r.body.trips;
t('trip: three connections with names of both ends', r.status === 200 && tr.length === 3 && r.body.from.name === 'Xanten Bahnhof' && r.body.to.name === 'Duisburg Hbf', JSON.stringify(r.body).slice(0, 300));
t('trip: first one 07:29 → 09:40 in Xanten time (06:29Z → 08:40Z), 131 min, 2 changes', tr[0].dep === '2026-11-12T06:29:00Z' && tr[0].arr === '2026-11-12T08:40:00Z' && tr[0].mins === 131 && tr[0].changes === 2, JSON.stringify(tr[0]).slice(0, 200));
t('trip: legs carry line, direction, platform, stops and the walk to the next one', tr[0].legs[0].line === 'X28' && tr[0].legs[0].mode === 'bus' && tr[0].legs[0].dir === 'Wesel Bahnhof' && tr[0].legs[0].from.plat === '2'
  && tr[0].legs[0].stops === 16 && tr[0].legs[0].walkAfter === 8 && tr[0].legs[0].to.name === 'Wesel Bahnhof', JSON.stringify(tr[0].legs[0]));
t('trip: a rail replacement bus is a bus, a regional train a train; platforms as stop names', tr[1].legs[0].line.startsWith('SEV') && tr[1].legs[0].mode === 'bus' && tr[1].legs[1].mode === 'train' && tr[1].legs[1].from.name === 'Moers Bahnhof' && tr[1].legs[1].from.plat === '2', JSON.stringify(tr[1].legs.map((l) => [l.line, l.mode, l.from.name, l.from.plat])));
t('trip: nothing of the bulky parts is passed on', JSON.stringify(r.body).length < 6000 && !JSON.stringify(r.body).includes('stopSequence'), JSON.stringify(r.body).length);
await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&long=1');
const longCall = calls.filter((u) => u.pathname.endsWith('XML_TRIP_REQUEST2')).pop();
t('trip: long=1 allows ICE/IC, and "now" is today in Xanten', !longCall.searchParams.has('exclMOT_15') && /^20\d{6}$/.test(longCall.searchParams.get('itdDate')), longCall.search);
t('trip: bad ids, the same stop twice or a bad time are refused', (await get('/transit/trip?from=x&to=de:05112:16032')).status === 400 && (await get('/transit/trip?from=de:05170:37032&to=de:05170:37032')).status === 400
  && (await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&when=tomorrow')).status === 400);
const nTrip = calls.filter((u) => u.pathname.endsWith('XML_TRIP_REQUEST2')).length;
await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&when=2026-11-12T08:00');
t('trip: the same question within a minute is answered from the cache', calls.filter((u) => u.pathname.endsWith('XML_TRIP_REQUEST2')).length === nTrip);

// the map: stops of a grid cell
r = await get('/transit/area?lat=51.66237&lon=6.45491');
const ac = calls.filter((u) => u.pathname.endsWith('XML_COORD_REQUEST')).pop();
t('area: asks VRR around the grid point (two decimals), 1.3 km, many stops', ac.searchParams.get('coord') === '6.45:51.66:WGS84[dd.ddddd]' && ac.searchParams.get('radius_1') === '1300' && Number(ac.searchParams.get('max')) >= 100, ac.search);
t('area: the cell and its stops with names, places, modes and coordinates', r.status === 200 && r.body.cell.join() === '51.66,6.45' && r.body.stops.length === 16
  && r.body.stops.every((x) => /^de:\d{5}:\d+$/.test(x.id) && x.name && x.coord && x.coord[0] > 51 && x.coord[1] > 6 && x.modes.length), JSON.stringify(r.body.stops[0]));
const na = calls.length;
await get('/transit/area?lat=51.6581&lon=6.4512');
t('area: another spot in the same cell comes from the cache, kept a day', calls.length === na);
t('area: outside Germany or without a spot is refused', (await get('/transit/area?lat=48.85&lon=2.35')).status === 400 && (await get('/transit/area?lat=51.66')).status === 400);

// the map: where one trip goes
r = await get('/transit/departures?stop=de:05170:37032');
t('departures: each trip says how to ask where it goes', r.body.deps[0].ref && r.body.deps[0].ref.line === 'nia:25036: :H:j26' && r.body.deps[0].ref.trip === '27', JSON.stringify(r.body.deps[0].ref));
t('departures: a stop coordinate that is not on Earth is left out', r.body.stop.coord === null, JSON.stringify(r.body.stop));
r = await get('/transit/course?line=' + encodeURIComponent('bvr:88X28:W:R:j26') + '&trip=33&stop=de:05170:37032&when=2026-11-12T15:28');
const sc = calls.filter((u) => u.pathname.endsWith('XML_STOPSEQCOORD_REQUEST')).pop();
t('course: asks VRR for the trip with date and time in Xanten time, live', sc.searchParams.get('line') === 'bvr:88X28:W:R:j26' && sc.searchParams.get('tripCode') === '33'
  && sc.searchParams.get('date') === '20261112' && sc.searchParams.get('time') === '1528' && sc.searchParams.get('useRealtime') === '1', sc.search);
const co = r.body;
t('course: line, destination, mode and live', r.status === 200 && co.line === 'X28' && co.dest === 'Goch Bahnhof' && co.mode === 'bus' && co.live === true, JSON.stringify({ ...co, stops: 0, path: 0 }));
t('course: 39 stops with stop ids (not platforms), names and coordinates', co.stops.length === 39 && co.stops.every((x) => /^de:\d{5}:\d+$/.test(x.id) && x.name && x.coord)
  && co.stops[0].name === 'Wesel Bahnhof' && co.stops[38].name === 'Goch Bahnhof', JSON.stringify(co.stops[0]));
t('course: planned and live times; none to arrive at the first stop, none to leave the last', co.stops[0].dep && !co.stops[0].arr && co.stops[38].arr && !co.stops[38].dep && co.stops[38].arrEst === '2026-11-12T15:19:00Z', JSON.stringify(co.stops[38]));
t('course: the road, made smaller, starts and ends where the trip does', co.path.length > 50 && co.path.length < SEQ.leg.coords.length / 2
  && Math.abs(co.path[0][0] - 51.65543) < 1e-4 && Math.abs(co.path[co.path.length - 1][1] - SEQ.leg.coords[SEQ.leg.coords.length - 1][1]) < 1e-4, co.path.length);
t('course: small enough for a phone', JSON.stringify(co).length < 16000, JSON.stringify(co).length);
t('course: made-up ids, a missing trip code or time are refused', (await get('/transit/course?line=x&trip=33&stop=de:05170:37032&when=2026-11-12T15:28')).status === 400
  && (await get('/transit/course?line=' + encodeURIComponent('bvr:88X28:W:R:j26') + '&stop=de:05170:37032&when=2026-11-12T15:28')).status === 400
  && (await get('/transit/course?line=' + encodeURIComponent('bvr:88X28:W:R:j26') + '&trip=33&stop=de:05170:37032')).status === 400);

// the map: on foot
const nw = calls.length;
r = await get('/transit/walk?from=51.6620,6.4500&to=51.659537,6.445924');
const fc = calls.filter((u) => u.hostname === 'routing.openstreetmap.de').pop();
t('walk: asks the foot router with lon,lat pairs, the whole path', fc && fc.pathname.startsWith('/routed-foot/route/v1/') && fc.pathname.endsWith('/6.45,51.662;6.445924,51.659537') && fc.searchParams.get('overview') === 'full', fc && String(fc));
t('walk: metres, minutes and the path as lat,lon', r.status === 200 && r.body.m === 445 && r.body.min === 6 && r.body.path.length >= 2 && r.body.path[0][0] > 51 && r.body.path[0][1] < 7, JSON.stringify(r.body));
await get('/transit/walk?from=51.6620,6.4500&to=51.659537,6.445924');
t('walk: never kept (the spot is someone\'s)', calls.length === nw + 2);
t('walk: bad points, outside Germany or farther than 15 km are refused', (await get('/transit/walk?from=51.66&to=51.65,6.44')).status === 400
  && (await get('/transit/walk?from=48.85,2.35&to=51.65,6.44')).status === 400 && (await get('/transit/walk?from=51.66,6.45&to=51.45,6.75')).status === 400);

// the map: a connection with its roads
r = await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&when=2026-11-12T08:00&paths=1');
const pc = calls.filter((u) => u.pathname.endsWith('XML_TRIP_REQUEST2')).pop();
t('trip with paths: VRR is asked for coordinates, kept apart from the plain answer', pc.searchParams.get('genC') === '1' && r.body.trips[0].legs.every((l) => Array.isArray(l.path) && l.path.length > 10 && Array.isArray(l.on)), JSON.stringify(r.body.trips[0].legs[0]).slice(0, 200));
t('trip with paths: the stops on the way have names and coordinates', r.body.trips[0].legs[0].on.length === 5 && r.body.trips[0].legs[0].on.every((x) => x.name && x.coord));
r = await get('/transit/trip?from=de:05170:37032&to=de:05112:16032&when=2026-11-12T08:00');
t('trip without paths: still without them', !('path' in r.body.trips[0].legs[0]));

// HTML to text
t('plain: tags, entities, line breaks', plain('<div>Ab <strong>Montag</strong>&nbsp;f&uuml;r&#160;alle<br/>Linie&nbsp;&#x41;</div><script>x</script>') === 'Ab Montag für alle\nLinie A\nx');

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
