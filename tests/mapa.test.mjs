// The map page without the page: where a bus is by its stop times, the grid cells for a part of the map, walking
// minutes, the Xanten time stamp, and that both map styles hang together (every layer's source exists, ids unique).
// Run: node tests/mapa.test.mjs
import { readFileSync } from 'node:fs';
import { whereNow, cellsFor, walkMin, fmtDist, metres, measure, locate, pointAt, slice, berlinStamp, ring, XANTEN, bearing, headingAt, distTo, shareNear, stopPositions } from '../mapa/geo.js';
import { mapStyle, OVERLAY_SOURCES, LIGHT, DARK } from '../mapa/style.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const fx = JSON.parse(readFileSync(new URL('./fixtures/map.json', import.meta.url)));

// a little line of three stops, 10 minutes apart, along a straight road
const at = (m) => new Date(Date.UTC(2026, 10, 12, 12, m)).toISOString();
const S = [
  { name: 'A', coord: [51.66, 6.44], dep: at(0) },
  { name: 'B', coord: [51.66, 6.45], arr: at(10), dep: at(11), depEst: at(12) },
  { name: 'C', coord: [51.66, 6.46], arr: at(20), arrEst: at(21) },
];
const path = [[51.66, 6.44], [51.66, 6.445], [51.66, 6.45], [51.66, 6.455], [51.66, 6.46]];
const ms = (m) => Date.parse(at(0)) + m * 60000;
t('before the first stop leaves: before, at stop A', whereNow(S, ms(-5), path).state === 'before' && whereNow(S, ms(-5), path).point[1] === 6.44);
const half = whereNow(S, ms(5), path);
t('halfway between A and B by time: between, half the way along the road', half.state === 'between' && half.i === 0 && half.j === 1 && Math.abs(half.frac - 0.5) < 1e-9 && Math.abs(half.point[1] - 6.445) < 1e-6, JSON.stringify(half));
t('the live departure counts: still standing at B until 12:12', whereNow(S, ms(11.5), path).state === 'at' && whereNow(S, ms(11.5), path).i === 1);
const late = whereNow(S, ms(16.5), path);
t('between B (left 12:12) and C (arrives 12:21 live)', late.state === 'between' && late.i === 1 && Math.abs(late.frac - 0.5) < 1e-9, JSON.stringify(late));
t('after the last arrival: done', whereNow(S, ms(30), path).state === 'done');
t('the distance along the road grows with the time', whereNow(S, ms(3), path).at < whereNow(S, ms(7), path).at && whereNow(S, ms(7), path).at < whereNow(S, ms(15), path).at);
t('without a road: straight between the stops', Math.abs(whereNow(S, ms(5)).point[1] - 6.445) < 1e-9 && whereNow(S, ms(5)).at === null);
const cum = measure(path), total = cum[cum.length - 1];
t('measure, locate and pointAt agree', Math.abs(total - metres(path[0], path[4])) < 0.5 && Math.abs(locate(path, cum, [51.6601, 6.45]) - total / 2) < 1 && Math.abs(pointAt(path, cum, total / 4)[1] - 6.445) < 1e-6);
const part = slice(path, cum, total / 4, (total * 3) / 4);
t('a slice of the road starts and ends where asked', Math.abs(part[0][1] - 6.445) < 1e-6 && Math.abs(part[part.length - 1][1] - 6.455) < 1e-6 && part.length === 3, JSON.stringify(part));

// a line that goes out and comes back the same street: the stop passed on the way out is called at on the way back
const OB = [{ name: 'A', coord: [51.66, 6.44], dep: at(0) }, { name: 'end', coord: [51.66, 6.46], arr: at(10), dep: at(12) }, { name: 'B', coord: [51.6601, 6.45], arr: at(17) }];
const obPath = [[51.66, 6.44], [51.66, 6.46], [51.6601, 6.4601], [51.6601, 6.45]];
const back = whereNow(OB, Date.parse(at(0)) + 14.5 * 60000, obPath);
t('out and back: B is found on the way back, the bus between the end and B on the return street', back.state === 'between' && back.i === 1 && back.point[0] > 51.66005 && Math.abs(back.point[1] - 6.455) < 1e-3, JSON.stringify(back));

// the real course from the fixture: the bus is somewhere on it, the stops in order along the road
const c = fx.course, mid = (Date.parse(c.stops[0].dep) + Date.parse(c.stops[c.stops.length - 1].arr || c.stops[c.stops.length - 1].dep)) / 2;
const w = whereNow(c.stops, mid, c.path), cc = measure(c.path);
t('real course: halfway through its time the bus is between two stops or at one, on its road', ['between', 'at'].includes(w.state) && w.at > 0 && w.at < cc[cc.length - 1] && metres(w.point, c.stops[w.i].coord) < 3000, JSON.stringify(w));

// which way it drives, and whether the way back takes the same streets
t('bearing: north 0, east 90, south 180, west 270', Math.round(bearing([51.66, 6.45], [51.67, 6.45])) === 0 && Math.round(bearing([51.66, 6.45], [51.66, 6.46])) === 90
  && Math.round(bearing([51.66, 6.45], [51.65, 6.45])) === 180 && Math.round(bearing([51.66, 6.45], [51.66, 6.44])) === 270);
t('heading along a road: east on the way out, west on the way back', Math.round(headingAt(obPath, measure(obPath), 300)) === 90 && Math.round(headingAt(obPath, measure(obPath), measure(obPath)[3] - 100)) === 270);
t('distance to a road: across the street', Math.abs(distTo(path, [51.6602, 6.452]) - 22.3) < 0.5);
const parallel = [[51.6601, 6.44], [51.6601, 6.46]], other = [[51.665, 6.44], [51.665, 6.46]];
t('the way back on the other side of the same street counts as the same streets', shareNear(path, [parallel], 30) === 1);
t('a way back two streets away does not; half and half is half', shareNear(path, [other], 30) === 0 && Math.abs(shareNear(path, [parallel, other], 30) - 0.5) < 0.05);
const sp = stopPositions(OB, obPath, measure(obPath));
t('stop positions along an out-and-back road go only forward', sp[0] === 0 && sp[1] > sp[0] && sp[2] > sp[1] && Math.abs(sp[2] - measure(obPath)[3]) < 1, JSON.stringify(sp));

// grid cells
const cells = cellsFor({ s: 51.655, w: 6.44, n: 51.668, e: 6.462 });
t('cells: two decimals, the middle first, all inside the box (rounded)', cells.every(([la, lo]) => /^\d+\.\d\d$/.test(la) && /^\d+\.\d\d$/.test(lo)) && cells[0].join() === '51.66,6.45' && cells.length === 2 * 3, JSON.stringify(cells));
t('cells: never more than asked for', cellsFor({ s: 51.5, w: 6.3, n: 51.8, e: 6.7 }, 12).length === 12);

// walking and words
t('walking minutes: a third longer than the straight line, 75 m a minute, at least one', walkMin(0) === 1 && walkMin(750) === 13 && walkMin(120) === 2);
t('distances: metres rounded to tens, kilometres with a comma', fmtDist(123) === '120 м' && fmtDist(4) === '10 м' && fmtDist(1560) === '1,6 км');
t('Xanten time stamp: winter UTC+1, summer UTC+2', berlinStamp(new Date('2026-11-12T14:28:00Z')) === '2026-11-12T15:28' && berlinStamp(new Date('2026-07-01T22:30:00Z')) === '2026-07-02T00:30');
const r = ring(XANTEN, 100);
t('accuracy circle: closed ring about 100 m around', r.length === 41 && r[0][0] === r[40][0] && Math.abs(metres([r[10][1], r[10][0]], XANTEN) - 100) < 2);

// styles
for (const [name, dark] of [['light', false], ['dark', true]]) {
  const st = mapStyle(dark), ids = st.layers.map((l) => l.id);
  t(`${name} style: version 8, unique layer ids, every layer's source exists`, st.version === 8 && new Set(ids).size === ids.length && st.layers.every((l) => l.type === 'background' || st.sources[l.source]), ids.join());
  t(`${name} style: our layers on top of the map, in order: route, walk, stops, the chosen stop last`, ids.indexOf('route') > ids.indexOf('place-town') && ids.indexOf('walk') > ids.indexOf('route') && ids.indexOf('stops') > ids.indexOf('walk') && ids[ids.length - 1] === 'sel');
  t(`${name} style: German names first, fonts the tile server has`, JSON.stringify(st).includes('"name:de"') && st.layers.filter((l) => l.layout && l.layout['text-font']).every((l) => /^Noto Sans (Regular|Bold|Italic)$/.test(l.layout['text-font'][0])));
}
const keep = { stops: { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [6.45, 51.66] } }] } } };
t('a theme change keeps what is drawn', mapStyle(true, keep).sources.stops === keep.stops && OVERLAY_SOURCES.every((id) => mapStyle(false).sources[id].type === 'geojson'));
t('colours: every colour of the light map has a dark one', Object.keys(LIGHT).every((k) => /^#[0-9A-F]{6}$/.test(LIGHT[k]) && /^#[0-9A-F]{6}$/.test(DARK[k])));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
