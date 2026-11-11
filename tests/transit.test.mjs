// Checks the Worker's public routes for the Транспорт and Погода pages: input checks, trimming of the VRR and
// Open-Meteo answers, notice text cleaned of HTML, caching, and that upstream failures are reported, not kept.
// Run: node tests/transit.test.mjs   (Node 22+, no packages needed; upstream answers come from tests/fixtures)
import { readFileSync } from 'node:fs';
import worker from '../worker/send-scan.js';
import { plain } from '../worker/transit.js';

const fx = (n) => JSON.parse(readFileSync(new URL('./fixtures/' + n, import.meta.url)));
const DM = fx('efa-dm.json'), SF = fx('efa-sf.json'), METEO = fx('meteo.json');
const calls = [];
let down = false;
globalThis.fetch = async (url) => {
  const u = new URL(String(url)); calls.push(u);
  if (down) return new Response('busy', { status: 503 });
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_STOPFINDER_REQUEST')) return Response.json(SF);
  if (u.hostname === 'openservice.vrr.de' && u.pathname.endsWith('XML_DM_REQUEST')) {
    // the look-alike check asks each stop for its own name
    const id = u.searchParams.get('name_dm');
    if (id === 'de:05170:36229') return Response.json({ locations: [{ name: 'Xanten, Hagelkreuzstraße' }], stopEvents: DM.stopEvents.slice(4, 6) });
    if (id === 'de:05170:36246') return Response.json({ locations: [{ name: 'Xanten, Lüttingen Schule' }], stopEvents: DM.stopEvents.slice(0, 2) });
    return Response.json(DM);
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

// HTML to text
t('plain: tags, entities, line breaks', plain('<div>Ab <strong>Montag</strong>&nbsp;f&uuml;r&#160;alle<br/>Linie&nbsp;&#x41;</div><script>x</script>') === 'Ab Montag für alle\nLinie A\nx');

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
