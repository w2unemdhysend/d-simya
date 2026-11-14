// «Мапа»: the map of the stops around (VRR), the walk to a stop (OSRM, FOSSGIS), where a bus or train is and which
// stops it calls at (worked out from its live times), and a connection from «Маршрут» drawn on the map.
// The sheet at the bottom holds what is chosen; every step is a step in the history, so the phone's Back goes back.
// Its own modules carry the version (?v=) like the page's links do: a phone with the last version kept offline must
// never mix a new page with an old helper.
import { $, tg, haptic, toast, load, store, cloudSet, cloudGet, esc, plural } from '../igry/kit.js';
import { API } from '../assets/site.js';
import { mapStyle, OVERLAY_SOURCES, TILES, GLYPHS } from './style.js?v=58c25b0c';
import { XANTEN, metres, walkMin, fmtDist, cellsFor, whereNow, measure, slice, berlinStamp, ring, reach, leave, stopPositions, headingAt, shareNear, catchPlan, cityTiles, tileKey, locate as along } from './geo.js?v=cd9607b8';

const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const wide = () => !!(window.matchMedia && matchMedia('(min-width:700px)').matches);
const api = async (path) => {
  const r = await fetch(API + path);
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(d.error || 'http ' + r.status);
  return d;
};
const hm = (iso) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const short = (n) => { const m = String(n || '').match(/^([^,]+),\s*(.+)$/); return m ? (m[2].startsWith(m[1]) ? m[2] : m[1] + ' ' + m[2]) : String(n || ''); };
const late = (plan, est) => (plan && est ? Math.round((Date.parse(est) - Date.parse(plan)) / 60000) : 0);
const MODE = { train: 'потяг', bus: 'автобус', tram: 'трамвай', ferry: 'пором' };
const lineCls = (x) => (/^SEV\b/.test(x.line || '') ? 'sev' : x.mode);
const ICON = (d, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  bus: '<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8.5 20.5v-3M15.5 20.5v-3M8.5 14.3h.01M15.5 14.3h.01M9 6.5h6"/>',
  train: '<rect x="6" y="3" width="12" height="14" rx="3"/><path d="M6 10h12M9 20.5l1.5-3.5M15 20.5l-1.5-3.5M9.5 13.8h.01M14.5 13.8h.01"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M10.5 21l2-6.5 2.5 2.5V21M8 12.5l1.8-4.2 3.6-.8 2 3.5 2.6 1M12.5 14.5l-1-4"/>',
  route: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M9 6.5h6.5a3 3 0 0 1 0 6h-7a3 3 0 0 0 0 6H15"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
  place: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  fit: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
  focus: '<path d="M4 8.5V4h4.5M15.5 4H20v4.5M20 15.5V20h-4.5M8.5 20H4v-4.5"/><circle cx="12" cy="12" r="3.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  save: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
};
// my places: what kind of place, its word and its little picture
const KINDS = {
  home: ['Дім', '<path d="M4 11.5L12 5l8 6.5"/><path d="M6.5 10v9.5h11V10"/><path d="M10 19.5v-5h4v5"/>'],
  work: ['Робота', '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16"/>'],
  study: ['Навчання', '<path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v4.5c0 1.5 2.2 3 5 3s5-1.5 5-3V11M21 9v5"/>'],
  doctor: ['Лікар', '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>'],
  shop: ['Магазин', '<path d="M5 8h14l-1.2 11.5H6.2z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'],
  other: ['Місце', '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'],
};
const LINE_RE = /^[a-z0-9]{2,8}:[A-Za-z0-9 ]{1,12}:[A-Za-z0-9 _-]{1,4}:[A-Z]{1,2}:j\d{2}$/, STOP_RE = /^de:\d{5}:\d{1,7}$/;
const GO = ICON(I.next, 'go');
const SRC = '<p class="src">Розклад і час наживо: VRR (Fahrplanauskünfte werden durch den VRR zur Verfügung gestellt. Alle Angaben ohne Gewähr.) Пішки: OSRM на сервері FOSSGIS. Мапа: OpenFreeMap, © OpenMapTiles, дані © учасники OpenStreetMap.</p>';

/* ---------------- what is drawn on the map (kept here too, so a theme change or a late map keeps it) ---------------- */
const EMPTY = () => ({ type: 'FeatureCollection', features: [] });
const D = Object.fromEntries(OVERLAY_SOURCES.map((id) => [id, EMPTY()]));
let map = null, ready = false;
const ll = (p) => [p[1], p[0]];   // [lat, lon] → [lon, lat]
function setSrc(id, data) { D[id] = data; if (ready) { const s = map.getSource(id); if (s) s.setData(data); } }
const fc = (features) => ({ type: 'FeatureCollection', features });
const line = (pts, props = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: pts.map(ll) } });
const pt = (p, props = {}) => ({ type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: ll(p) } });
const dark = () => document.documentElement.getAttribute('data-theme') === 'dark';

/* ---------------- the sheet: low, half, high; dragged by its handle or title ----------------
   Smooth on a slow phone: while a finger drags, the sheet and the buttons above it only move (a transform, no new
   layout); when it lets go, the height is set once and the move to it is animated from where the finger left it. */
const sheet = $('#sheet');
let sheetH = 0, sheetVis = 0, dragH0 = 0;
const movers = () => [sheet, $('#fabs'), $('#refocus'), ...document.querySelectorAll('.maplibregl-ctrl-bottom-left,.maplibregl-ctrl-bottom-right')].filter(Boolean);
function snaps() {
  const vh = window.innerHeight, top = $('.mtop').getBoundingClientRect().bottom;
  return { low: Math.min(170, Math.round(vh * 0.3)), mid: Math.round(vh * 0.46), high: Math.max(260, Math.round(vh - top - 12)) };
}
function setSheet(h, opts = {}) {
  const s = snaps(), vh = window.innerHeight;
  const to = Math.round(Math.max(110, Math.min(s.high, typeof h === 'string' ? s[h] : h)));
  if (opts.drag) {
    sheetVis = to;
    const dy = dragH0 - to;
    for (const el of movers()) { el.style.transition = 'none'; el.style.transform = `translateY(${dy}px)`; }
    return;
  }
  const from = opts.from != null ? opts.from : sheetH;
  sheetH = sheetVis = to;
  document.documentElement.style.setProperty('--sheet-h', to + 'px');
  $('#grip').setAttribute('aria-label', to >= s.high - 4 ? 'Згорнути' : 'Розгорнути');
  const els = movers();
  if (from && Math.abs(from - to) > 1 && !reduce && !opts.instant) {
    for (const el of els) { el.style.transition = 'none'; el.style.transform = `translateY(${to - from}px)`; }
    void sheet.offsetHeight;
    for (const el of els) { el.style.transition = 'transform .34s cubic-bezier(.22,1,.36,1)'; el.style.transform = ''; }
  } else for (const el of els) { el.style.transition = ''; el.style.transform = ''; }
  if (map) map.setPadding(wide() ? { top: 70, bottom: 20, left: 450, right: 20 } : { top: Math.round($('.mtop').getBoundingClientRect().bottom + 6), bottom: Math.round(Math.min(to, vh * 0.62)), left: 0, right: 0 });
  placePick();
}
(function drag() {
  let y0 = 0, last = 0, lastT = 0, v = 0, moved = false, on = false, want = null, raf = 0;
  const frame = () => { raf = 0; if (want != null) setSheet(want, { drag: true }); };
  const down = (e) => {
    if (e.button > 0 || e.target.closest('.sback')) return;
    on = true; moved = false; y0 = e.clientY; dragH0 = sheetVis = sheetH; last = e.clientY; lastT = performance.now(); v = 0;
    sheet.classList.add('drag');
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const move = (e) => {
    if (!on) return;
    const dy = e.clientY - y0;
    if (Math.abs(dy) > 4) moved = true;
    const now = performance.now(); v = (e.clientY - last) / Math.max(1, now - lastT); last = e.clientY; lastT = now;
    want = dragH0 - dy;   // one move per frame, however many events the finger sends
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const up = () => {
    if (!on) return;
    on = false; sheet.classList.remove('drag');
    if (raf) { cancelAnimationFrame(raf); raf = 0; frame(); }
    const s = snaps(), cur = sheetVis;
    if (!moved) { setSheet(sheetH < s.mid - 4 ? 'mid' : sheetH < s.high - 4 ? 'high' : 'mid'); return; }
    // a flick goes on in its direction, a slow drag stops at the nearest height
    const order = [s.low, s.mid, s.high];
    let to = order.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a));
    if (v < -0.5) to = order.find((x) => x > cur + 10) || s.high;
    if (v > 0.5) to = [...order].reverse().find((x) => x < cur - 10) || s.low;
    setSheet(to, { from: cur }); haptic();
  };
  for (const el of [$('#grip'), $('#shead')]) {
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  $('#grip').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const s = snaps(); setSheet(sheetH < s.high - 4 ? 'high' : 'mid'); } });
})();
window.addEventListener('resize', () => setSheet(sheetH, { instant: true }));

/* ---------------- the map ---------------- */
const startAt = (() => { const p = load('mapa-last'); return p && Array.isArray(p.c) && metres(p.c, XANTEN) < 60000 ? p : { c: XANTEN, z: 15 }; })();
function mapFailed() {
  map = null; ready = false;
  $('#mapfail').hidden = false; $('#locate').hidden = true;
  setSheet('high');
}
try {
  if (!window.maplibregl) throw new Error('no maplibre');
  map = new maplibregl.Map({
    container: 'map', style: mapStyle(dark()), center: ll(startAt.c), zoom: startAt.z, minZoom: 6, maxZoom: 19,
    attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, fadeDuration: reduce ? 0 : 150, cooperativeGestures: false,
    // smoother on phones: at most twice the pixels (a 3× screen draws more than half again for nothing visible),
    // and tiles already there are not fetched again while moving
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2), refreshExpiredTiles: false,
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
  // the arrows along a bus's road: a chevron pointing the way it drives, coloured by the style (an SDF icon)
  map.on('styleimagemissing', (e) => {
    if (e.id !== 'arrow' || map.hasImage('arrow')) return;
    const n = 32, cv = document.createElement('canvas'); cv.width = cv.height = n;
    const g = cv.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(11, 7); g.lineTo(21, 16); g.lineTo(11, 25); g.stroke();
    map.addImage('arrow', g.getImageData(0, 0, n, n), { sdf: true, pixelRatio: 2 });
  });
  // our layers can be filled as soon as the style is there (the tiles may still be on their way)
  map.on('style.load', () => {
    ready = true;
    for (const id of OVERLAY_SOURCES) { const s = map.getSource(id); if (s) s.setData(D[id]); }
    if (!window.__mapReady) { window.__mapReady = true; loadArea(); drawPlaces(); setTimeout(() => saveCity(false), 2500); }
  });
  map.on('load', () => { const at = document.querySelector('.maplibregl-ctrl-attrib'); if (at) at.classList.remove('maplibregl-compact-show'); });   // the ⓘ opens the credits
  map.on('error', (e) => {
    const m = String((e && e.error && e.error.message) || '');
    if (/webgl/i.test(m)) mapFailed();
  });
  // the first place found moves the map there, unless the person has already moved it; moving away from what the
  // sheet shows brings up the button back to it
  map.on('dragstart', () => { followNext = false; markAway(); });
  map.on('zoomstart', (e) => { if (e && e.originalEvent) markAway(); });
  map.on('moveend', () => {
    clearTimeout(areaTimer); areaTimer = setTimeout(loadArea, 220);
    const c = map.getCenter(); store('mapa-last', { c: [Math.round(c.lat * 1e4) / 1e4, Math.round(c.lng * 1e4) / 1e4], z: Math.round(map.getZoom() * 10) / 10 });
    if (top().v === 'near' && !me) renderNear(true);
  });
  map.on('click', (e) => {
    const box = [[e.point.x - 14, e.point.y - 14], [e.point.x + 14, e.point.y + 14]];
    const f = map.queryRenderedFeatures(box, { layers: ['stops', 'routestops'].filter((l) => map.getLayer(l)) }).find((x) => x.properties && x.properties.id);
    if (f) { const s = stops.get(f.properties.id) || { id: f.properties.id, name: f.properties.name, coord: [f.geometry.coordinates[1], f.geometry.coordinates[0]] }; haptic(); openStop(s, { keepView: true }); return; }
    if (sheetH >= snaps().high - 4) setSheet('mid');
  });
  for (const l of ['stops', 'routestops']) {
    map.on('mouseenter', l, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', l, () => { map.getCanvas().style.cursor = ''; });
  }
  // the theme button switches the map's colours too; what is drawn stays
  new MutationObserver(() => {
    if (!map) return;
    const keep = Object.fromEntries(OVERLAY_SOURCES.map((id) => [id, { type: 'geojson', data: D[id] }]));
    map.setStyle(mapStyle(dark(), keep), { diff: true });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
} catch (e) { mapFailed(); }
function flyTo(c, zoom = 16) { if (map && c) map.easeTo({ center: ll(c), zoom: Math.max(map.getZoom(), zoom), duration: reduce ? 0 : 650 }); }
function fit(points, maxZoom = 16.5, padding = 48) {
  const p = points.filter(Boolean);
  if (!map || !p.length) return;
  if (p.length === 1) { flyTo(p[0], Math.min(16, maxZoom)); return; }
  const b = new maplibregl.LngLatBounds(ll(p[0]), ll(p[0]));
  p.forEach((x) => b.extend(ll(x)));
  map.fitBounds(b, { padding, maxZoom, duration: reduce ? 0 : 700 });
}

/* ---------------- the stops around: asked by grid cell, kept for this visit ---------------- */
const stops = new Map(), cells = new Set();
let areaTimer = null;
function drawStops() {
  setSrc('stops', fc([...stops.values()].filter((s) => s.coord).map((s) => pt(s.coord, { id: s.id, name: s.name, rail: (s.modes || []).includes('train') }))));
}
async function loadArea(center) {
  let box;
  if (map) {
    if (map.getZoom() < 12.3) return;
    const b = map.getBounds(); box = { s: b.getSouth(), w: b.getWest(), n: b.getNorth(), e: b.getEast() };
  } else {
    const c = center || me || XANTEN; box = { s: c[0] - 0.01, n: c[0] + 0.01, w: c[1] - 0.015, e: c[1] + 0.015 };
  }
  const todo = cellsFor(box, 12).filter((c) => !cells.has(c.join()));
  todo.forEach((c) => cells.add(c.join()));
  await Promise.all(todo.map(async ([la, lo]) => {
    try {
      const d = await api(`transit/area?lat=${la}&lon=${lo}`);
      for (const s of d.stops) if (!stops.has(s.id)) stops.set(s.id, s);
    } catch (e) { cells.delete(`${la},${lo}`); }
  }));
  if (todo.length) { drawStops(); if (top().v === 'near') renderNear(true); }
}

/* ---------------- where I am ---------------- */
let me = null, acc = 0, meMarker = null, watch = null, denied = false, followNext = false;
function onPos(p) {
  const first = !me;
  me = [p.coords.latitude, p.coords.longitude]; acc = Math.min(p.coords.accuracy || 0, 2000);
  store('mapa-loc', 1); denied = false;
  $('#locate').classList.remove('busy'); $('#locate').setAttribute('aria-pressed', 'true');
  if (map) {
    if (!meMarker) { const el = document.createElement('div'); el.className = 'me'; el.setAttribute('aria-label', 'Ти тут'); meMarker = new maplibregl.Marker({ element: el }).setLngLat(ll(me)).addTo(map); }
    else meMarker.setLngLat(ll(me));
    setSrc('acc', acc > 25 ? fc([{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring(me, acc)] } }]) : EMPTY());
    if (followNext) { followNext = false; map.easeTo({ center: ll(me), zoom: Math.max(map.getZoom(), 15.5), duration: reduce ? 0 : 700 }); }
  } else if (first) loadArea(me);
  const v = top();
  if (v.v === 'near' && first) renderNear();
  if ((v.v === 'stop' || v.v === 'place') && !v.walk && !v.walkBusy && v.coord) walkTo(v);
  if (v.v === 'course' && v.data && (first || Date.now() - (v.catchAt || 0) > 8000)) { v.catchAt = Date.now(); renderCatch(v); }
  if (v.v === 'pick' && first) renderPick(v);
}
function onErr(e) {
  $('#locate').classList.remove('busy');
  if (e && e.code === 1) { denied = true; store('mapa-loc', 0); toast('Немає дозволу на місцезнаходження: дозволь його для Telegram у налаштуваннях телефону.', 4200); }
  else if (followNext) toast('Не вдалося визначити, де ти. Спробуй ще раз на вулиці.', 3400);
  followNext = false;
  if (top().v === 'near') renderNear();
}
function locate(manual) {
  if (!('geolocation' in navigator)) { if (manual) toast('Цей пристрій не ділиться місцем.'); return; }
  if (manual) { followNext = true; haptic(); if (me && map) { followNext = false; map.easeTo({ center: ll(me), zoom: Math.max(map.getZoom(), 15.5), duration: reduce ? 0 : 600 }); } }
  $('#locate').classList.add('busy');
  navigator.geolocation.getCurrentPosition(onPos, onErr, { enableHighAccuracy: true, timeout: 15000, maximumAge: 20000 });
  if (watch === null) watch = navigator.geolocation.watchPosition(onPos, () => {}, { enableHighAccuracy: true, maximumAge: 10000 });
}
$('#locate').addEventListener('click', () => locate(true));
document.addEventListener('visibilitychange', () => {
  if (document.hidden && watch !== null) { navigator.geolocation.clearWatch(watch); watch = null; }
  else if (!document.hidden && me && watch === null) watch = navigator.geolocation.watchPosition(onPos, () => {}, { enableHighAccuracy: true, maximumAge: 10000 });
  if (!document.hidden) { const v = top(); if (v.v === 'stop') refreshDeps(v); if (v.v === 'course') loadCourse(v); }
});

/* ---------------- the views of the sheet, as a stack in the history ---------------- */
const stack = [{ v: 'near' }];
const top = () => stack[stack.length - 1];
let timers = [], placeMarker = null, busMarker = null, catchMarker = null, busRaf = 0, stands = [];
function clearView() {
  timers.forEach((t) => clearInterval(t)); timers = [];
  if (busRaf) { cancelAnimationFrame(busRaf); busRaf = 0; }
  setSrc('walk', EMPTY()); setSrc('back', EMPTY()); setSrc('route', EMPTY()); setSrc('routestops', EMPTY()); setSrc('sel', EMPTY());
  if (placeMarker) { placeMarker.remove(); placeMarker = null; }
  if (busMarker) { busMarker.remove(); busMarker = null; }
  if (catchMarker) { catchMarker.remove(); catchMarker = null; }
  stands.forEach((m) => m.remove()); stands = [];
  document.body.classList.remove('picking');
}
// "Стій тут": where exactly to wait (the platform's pole, on the side of the street the bus drives on) and an arrow
// the way the bus will go from there
const UP = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
function stand(coord, heading, label, cls = '', anchor = 'bottom') {
  if (!map || !coord) return;
  const el = document.createElement('div');
  el.className = 'stand a-' + anchor + (cls ? ' ' + cls : '');
  el.innerHTML = (heading == null ? '' : `<span class="dir" style="transform:rotate(${Math.round(heading)}deg)">${UP}</span>`) + `<span>${esc(label)}</span>`;
  el.setAttribute('aria-label', label + (heading == null ? '' : ', стрілка показує, куди поїде'));
  stands.push(new maplibregl.Marker({ element: el, anchor, offset: [0, anchor === 'top' ? 6 : -6] }).setLngLat(ll(coord)).addTo(map));
}
// two marks at one stop (this way and the way back, on either side of the street): the labels grow away from each other
function anchors(a, b) {
  if (!map || !a || !b) return ['bottom', 'bottom'];
  const p = map.project(ll(a)), q = map.project(ll(b));
  if (Math.abs(p.x - q.x) >= Math.abs(p.y - q.y)) return p.x <= q.x ? ['bottom-right', 'bottom-left'] : ['bottom-left', 'bottom-right'];
  return p.y <= q.y ? ['bottom', 'top'] : ['top', 'bottom'];
}
function open(view, opts = {}) {
  if (opts.replace) { view.h = top().h; stack[stack.length - 1] = view; try { history.replaceState({ ...(history.state || {}), mapa: stack.length }, '', urlOf(view)); } catch (e) {} }
  else { stack.push(view); view.h = true; try { history.pushState({ mapa: stack.length }, '', urlOf(view)); } catch (e) { view.h = false; } }
  show();
}
function back() {
  if (stack.length < 2) return;
  if (top().h) { history.back(); return; }
  stack.pop(); try { history.replaceState({ mapa: stack.length }, '', urlOf(top())); } catch (e) {}
  show(); haptic();
}
window.addEventListener('popstate', (e) => {
  const st = e.state; if (st && st.menu) return;
  const n = st && st.mapa ? st.mapa : 1;
  if (n >= stack.length) return;
  while (stack.length > Math.max(1, n)) stack.pop();
  show();
});
const urlOf = (v) => (v.v === 'stop' ? `?stop=${encodeURIComponent(v.id)}` : v.v === 'trip' || v.url ? v.url || location.search : location.pathname);
$('#sback').addEventListener('click', () => { haptic(); back(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && stack.length > 1 && !document.querySelector('.drawer.open')) back(); });
if (tg && tg.BackButton) try { tg.BackButton.onClick(back); } catch (e) {}

function head(title, sub = '') {
  $('#stitle').textContent = title; $('#ssub').innerHTML = sub;
  $('#sback').hidden = stack.length < 2;
  if (tg && tg.BackButton) try { if (stack.length > 1) tg.BackButton.show(); else tg.BackButton.hide(); } catch (e) {}
}
function show() {
  clearView();
  const v = top();
  v.away = false; refocusBtn(false);
  if (v.v === 'near') renderNear();
  else if (v.v === 'search') renderSearch(v);
  else if (v.v === 'stop') renderStop(v);
  else if (v.v === 'course') renderCourse(v);
  else if (v.v === 'place') renderPlace(v);
  else if (v.v === 'trip') renderTrip(v);
  else if (v.v === 'pick') renderPick(v);
  $('#sbody').scrollTop = 0;
  if (v.v !== 'search' && document.activeElement === $('#q')) $('#q').blur();
}
const body = (html) => { $('#sbody').innerHTML = html; };

/* ---------------- near: the stops around me (or around the middle of the map) ---------------- */
const modesText = (s) => (s.modes || []).map((m) => MODE[m] || m).join(' · ') || 'зупинка';
function stopRow(s, d, from) {
  const rail = (s.modes || []).includes('train');
  return `<li><button class="row" type="button" data-stop="${esc(s.id)}"><span class="ic${rail ? ' rail' : ''}">${ICON(rail ? I.train : I.bus)}</span>` +
    `<span class="t"><b lang="de">${esc(s.name)}</b><small>${esc(s.place && s.place !== s.name ? s.place + ' · ' : '')}${esc(modesText(s))}</small></span>` +
    (d != null ? `<span class="end"><b>≈ ${walkMin(d)} хв</b><small>${fmtDist(d)}${from ? ' ' + from : ''}</small></span>` : GO) + '</button></li>';
}
// quiet: only the list changes (the map moved, more stops came), the rest of the sheet stays as it is
function renderNear(quiet) {
  const v = top(); if (v.v !== 'near') return;
  const from = me || (map ? [map.getCenter().lat, map.getCenter().lng] : XANTEN);
  const list = [...stops.values()].filter((s) => s.coord).map((s) => ({ s, d: metres(from, s.coord) })).filter((x) => x.d < 4000).sort((a, b) => a.d - b.d).slice(0, 8);
  const rows = list.length ? `<ul class="rows">${list.map(({ s, d }) => stopRow(s, d)).join('')}</ul>`
    : (cells.size ? '<p class="note">Поблизу зупинок не знайшов. Посунь мапу ближче до міста.</p>' : '<div class="skel"></div><div class="skel"></div>');
  head('Зупинки поруч', me ? 'Біля тебе, з часом пішки' : 'Біля середини мапи');
  if (quiet && $('#nearlist')) { $('#nearlist').innerHTML = rows; return; }
  const ask = me ? '' : denied ? '<div class="ask err"><p>Немає дозволу на місцезнаходження. Його можна дати Telegram у налаштуваннях телефону, а доки — список біля середини мапи.</p></div>'
    : `<div class="ask"><p>Покажу найближчі зупинки й скільки до них іти, коли знатиму, де ти. Місце лишається на телефоні; для пішого маршруту на сервер ідуть лише дві точки, без збереження.</p><button class="act main" type="button" id="askloc">${ICON(I.walk)}Показати, де я</button></div>`;
  body(placesRow() + ask + `<div id="nearlist">${rows}</div>` + '<p class="note">Торкнись зупинки в списку чи на мапі: відправлення наживо, шлях пішки й де зараз автобус.</p>' +
    `<div class="city" id="city">${cityHTML()}</div>` + SRC);
}

/* ---------------- search ---------------- */
let sTimer = null, sSeq = 0;
function renderSearch(v) {
  head('Пошук', v.q ? `«${esc(v.q)}»` : 'Зупинка, вулиця чи адреса');
  if (!v.res) { body(v.q && v.q.length >= 2 ? '<div class="skel"></div><div class="skel"></div>' : '<p class="note">Напиши назву зупинки («Xanten Markt», «Wesel Bahnhof»), вулицю або адресу з номером будинку.</p>'); return; }
  const d = v.res, named = d.stops || [], near = d.near && d.near.stops && d.near.stops.length ? d.near : null;
  const placeRow = near && near.kind !== 'here' ? `<li><button class="row" type="button" data-place="1"><span class="ic place">${ICON(I.place)}</span><span class="t"><b lang="de">${esc(near.name)}</b>` +
    `<small>${near.kind === 'street' ? 'вулиця' : 'адреса'} · найближчі зупинки й шлях пішки</small></span>${GO}</button></li>` : '';
  const stopsHtml = named.length ? `<h3 class="sub">Зупинки</h3><ul class="rows">${named.map((s) => stopRow(s)).join('')}</ul>` : '';
  const placeHtml = placeRow ? `<h3 class="sub">${near.kind === 'street' ? 'Вулиця' : 'Адреса'}</h3><ul class="rows">${placeRow}</ul>` : '';
  body((d.nearFirst ? placeHtml + stopsHtml : stopsHtml + placeHtml) || '<p class="note">Нічого не знайшов. Спробуй інакше: «Xanten Markt» або вулицю з номером будинку.</p>');
}
function searchNow(q) {
  const v = top(); if (v.v !== 'search') return;
  v.q = q; v.res = null; renderSearch(v);
  if (q.length < 2) return;
  const seq = ++sSeq;
  api('transit/stops?q=' + encodeURIComponent(q)).then((d) => { if (seq === sSeq && top() === v) { v.res = d; renderSearch(v); } })
    .catch(() => { if (seq === sSeq && top() === v) body('<p class="note">Не вдалося шукати. Перевір інтернет і спробуй ще раз.</p>'); });
}
$('#q').addEventListener('focus', () => { if (top().v !== 'search') { open({ v: 'search', q: $('#q').value.trim() }); setSheet('high'); if ($('#q').value.trim().length >= 2) searchNow($('#q').value.trim()); } });
$('#q').addEventListener('input', () => {
  const q = $('#q').value.replace(/\s+/g, ' ').trim(); $('#qclear').hidden = !$('#q').value;
  if (top().v !== 'search') open({ v: 'search', q });
  clearTimeout(sTimer); sTimer = setTimeout(() => searchNow(q), 380);
});
$('#qclear').addEventListener('click', () => { $('#q').value = ''; $('#qclear').hidden = true; $('#q').focus(); if (top().v === 'search') searchNow(''); });
$('#sform').addEventListener('submit', (e) => {
  e.preventDefault(); clearTimeout(sTimer);
  const v = top(), q = $('#q').value.replace(/\s+/g, ' ').trim();
  if (v.v === 'search' && v.res && v.q === q) { const first = $('#sbody [data-stop], #sbody [data-place]'); if (first) first.click(); return; }
  searchNow(q);
});

/* ---------------- a stop: walk there, departures, add to my stops ---------------- */
function openStop(s, opts = {}) {
  const v = { v: 'stop', id: s.id, name: s.name || short(s.full), full: s.full || s.name, place: s.place, modes: s.modes, coord: s.coord, keepView: opts.keepView };
  setSheet('mid');   // first: the map's padding follows the sheet, and changing it later would stop the flight to the stop
  if (top().v === 'stop' && opts.keepView) open(v, { replace: true }); else open(v);
}
function inMine(id) { const m = load('transport-stops'); return !!(m && Array.isArray(m.list) && m.list.some((x) => x && x.id === id)); }
function addToMine(v) {
  const KEY = 'transport-stops';
  let m = load(KEY);
  if (!(m && Array.isArray(m.list) && m.list.length)) m = { list: [{ id: 'de:05170:37032', name: 'Xanten, Bahnhof' }], active: 'de:05170:37032' };
  if (!m.list.some((x) => x.id === v.id)) m.list = [{ id: v.id, name: v.full || v.name }, ...m.list].slice(0, 6);
  m.active = v.id; store(KEY, m); cloudSet('transport', m);
}
function renderStop(v) {
  v.focus = () => { if (v.coord) { flyTo(v.coord, 16); v.away = false; refocusBtn(false); } }; v.focusLabel = 'Назад до зупинки';
  head(short(v.full || v.name || 'Зупинка'), esc([v.place && !String(v.full || v.name || '').startsWith(v.place) ? v.place : '', v.modes ? modesText(v) : ''].filter(Boolean).join(' · ')));
  if (v.coord) { setSrc('sel', fc([pt(v.coord)])); if (!v.keepView || !inView(v.coord)) flyTo(v.coord, 16); }
  body(`<div class="acts">${walkBtn(v)}<a class="act" href="../marshrut/?to=${encodeURIComponent(v.id)}&amp;toName=${encodeURIComponent(short(v.full || v.name))}">${ICON(I.route)}Маршрут сюди</a>` +
    (inMine(v.id) ? `<a class="act done" href="../transport/">${ICON(I.check)}У моїх зупинках</a>` : `<button class="act" type="button" id="addmine">${ICON(I.star)}У мої зупинки</button>`) + '</div>' +
    `<h3 class="sub">Відправлення</h3><div id="deps"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>` + SRC);
  if (v.walk) drawWalk(v);
  else if (me && v.coord) walkTo(v);
  if (v.deps) renderDeps(v);
  refreshDeps(v);
  timers.push(setInterval(() => { if (!document.hidden) refreshDeps(v); }, 30000));
  timers.push(setInterval(() => { if (!document.hidden && v.deps && top() === v) renderDeps(v); }, 15000));   // the minutes count down between updates
}
const inView = (c) => { if (!map) return true; const b = map.getBounds(); return b.contains(ll(c)); };
function walkBtn(v) {
  if (!v.coord) return '';
  if (v.walk) return `<button class="act walk" type="button" id="walkbtn" aria-pressed="false">${ICON(I.walk)}${v.walk.min} хв пішки · ${fmtDist(v.walk.m)}</button>`;
  if (me) return `<button class="act walk" type="button" id="walkbtn" disabled>${ICON(I.walk)}≈ ${walkMin(metres(me, v.coord))} хв пішки</button>`;
  return `<button class="act walk" type="button" id="walkbtn">${ICON(I.walk)}Як дійти</button>`;
}
async function walkTo(v) {
  if (!me || !v.coord || v.walkBusy) return;
  if (metres(me, v.coord) > 14000) { v.walk = null; return; }
  v.walkBusy = true;
  try {
    const w = await api(`transit/walk?from=${me[0].toFixed(5)},${me[1].toFixed(5)}&to=${v.coord[0]},${v.coord[1]}`);
    v.walk = w;
    if (top() === v) { drawWalk(v); const b = $('#walkbtn'); if (b) b.outerHTML = walkBtn(v); }
  } catch (e) { /* the straight-line estimate stays */ }
  v.walkBusy = false;
}
function drawWalk(v) { if (v.walk && v.walk.path) setSrc('walk', fc([line([me || v.walk.path[0], ...v.walk.path])])); }
async function refreshDeps(v) {
  try {
    const d = await api(`transit/departures?stop=${encodeURIComponent(v.id)}`);
    if (top() !== v) return;
    v.deps = d.deps;
    if (!v.coord && d.stop.coord) { v.coord = d.stop.coord; setSrc('sel', fc([pt(v.coord)])); flyTo(v.coord, 16); const b = $('#walkbtn'); if (!b) { const a = $('#sbody .acts'); if (a) a.insertAdjacentHTML('afterbegin', walkBtn(v)); } if (me) walkTo(v); }
    if (!v.name || /^de:/.test(v.name)) { v.name = d.stop.name; v.full = d.stop.name; head(short(d.stop.name)); }
    renderDeps(v);
  } catch (e) {
    if (top() === v && !v.deps) $('#deps').innerHTML = '<div class="ask err"><p>Не вдалося завантажити відправлення. Перевір інтернет; спробую ще раз за пів хвилини.</p></div>';
  }
}
function depRow(x, i) {
  const t = Date.parse(x.est || x.plan), min = Math.round((t - Date.now()) / 60000), dl = late(x.plan, x.est);
  const big = min <= 0 ? 'зараз' : min < 60 ? `${min} хв` : hm(x.est || x.plan);
  return `<li data-key="${esc((x.ref ? x.ref.line + ':' + x.ref.trip : x.line + ':' + x.dest) + '|' + x.plan)}"><button class="dep${min <= 5 && min >= 0 ? ' soon' : ''}${x.gone ? ' gone' : ''}" type="button" data-dep="${i}"${x.ref ? '' : ' disabled'}>` +
    `<span class="tm"><b data-tick>${big}</b>${min < 60 ? `<small>${hm(x.est || x.plan)}</small>` : ''}</span>` +
    `<span><span class="l1"><span class="line ${lineCls(x)}">${esc(x.line)}</span><span class="dest" lang="de">${esc(x.dest)}</span></span>` +
    `<span class="l2">${x.gone ? '<span class="late">скасовано</span>' : x.live ? (dl >= 1 ? `<span class="late">+${dl} хв</span>` : '<span class="ok">вчасно</span>') : '<span>за розкладом</span>'}` +
    `${x.plat ? `<span>${x.mode === 'train' ? 'колія' : 'стоянка'} ${esc(x.plat)}</span>` : ''}${x.ref ? '<span>де зараз →</span>' : ''}</span></span>` +
    (x.ref ? GO : '<span></span>') + '</button></li>';
}
function renderDeps(v) {
  const list = (v.deps || []).filter((x) => Date.parse(x.est || x.plan) > Date.now() - 60000).slice(0, 12);
  const ul = $('#deps ul.deps'), rows = list.map((x) => depRow(x, v.deps.indexOf(x))).join('');
  if (list.length && ul && window.UI && UI.morph) UI.morph(ul, rows);   // the same buses stay in their rows, the minutes roll
  else $('#deps').innerHTML = list.length ? `<ul class="deps">${rows}</ul>` : '<p class="note">Найближчим часом відправлень немає.</p>';
}
$('#sbody').addEventListener('click', (e) => {
  const v = top();
  const s = e.target.closest('[data-stop]');
  if (s) {
    const id = s.dataset.stop;
    const found = stops.get(id) || (v.res && [...(v.res.stops || []), ...((v.res.near && v.res.near.stops) || [])].find((x) => x.id === id)) || (v.near && v.near.find((x) => x.id === id)) || { id, name: s.querySelector('b') ? s.querySelector('b').textContent : id };
    haptic(); openStop(found); return;
  }
  if (e.target.closest('[data-place]') && v.res && v.res.near) { const n = v.res.near; haptic(); setSheet('mid'); open({ v: 'place', name: n.name, kind: n.kind, coord: n.coord, near: n.stops }); return; }
  if (e.target.closest('#askloc')) { locate(true); return; }
  const dep = e.target.closest('[data-dep]');
  if (dep && v.v === 'stop') { const x = v.deps[Number(dep.dataset.dep)]; if (x && x.ref) { haptic(); setSheet('mid'); open({ v: 'course', dep: x, stop: { id: v.id, name: v.name, coord: v.coord }, stopDeps: v.deps }); } return; }
  if (e.target.closest('#addmine') && v.v === 'stop') { addToMine(v); haptic('success'); toast('Додано в «Транспорт»: тепер ця зупинка там перша.', 3000); e.target.closest('#addmine').outerHTML = `<a class="act done" href="../transport/">${ICON(I.check)}У моїх зупинках</a>`; return; }
  const wb = e.target.closest('#walkbtn');
  if (wb) {
    if (!me) { locate(true); return; }
    if (v.walk) { fit([me, ...v.walk.path], 17); haptic(); }
    return;
  }
  const cs = e.target.closest('[data-cs]');
  if (cs && v.v === 'course' && v.data) { const st = v.data.stops[Number(cs.dataset.cs)]; if (st && st.coord) { flyTo(st.coord, 15.5); haptic(); } return; }
  if (e.target.closest('#fitall') && v.data) { fit(v.data.path.length ? v.data.path : v.data.stops.map((x) => x.coord), 15); haptic(); markAway(); return; }
  if (e.target.closest('#catchloc')) { locate(true); return; }
  if (e.target.closest('#catchwalk') && v.plan) { const c = v.plan.best || v.plan.nearest; if (c && me) { fit([me, v.data.stops[c.k].coord, ...(v.cw && v.cw.k === c.k ? v.cw.path : [])], 17); haptic(); markAway(); } return; }
  const sk = e.target.closest('[data-stopk]');
  if (sk && v.data) { const st = v.data.stops[Number(sk.dataset.stopk)]; if (st) { haptic(); openStop({ id: st.id, name: short(st.name), full: st.name, coord: st.coord }); } return; }
  const lc = e.target.closest('[data-legbus]');
  if (lc && v.v === 'trip' && v.trip) {
    const l = v.trip.legs[Number(lc.dataset.legbus)];
    if (l && l.ref && l.stop) { haptic(); setSheet('mid'); open({ v: 'course', dep: { line: l.line, dest: l.dir, mode: l.mode, plan: l.from.plan, est: l.from.est, ref: l.ref }, stop: { id: l.stop, name: l.from.name } }); }
    return;
  }
  const lg = e.target.closest('[data-leg]');
  if (lg && v.v === 'trip' && v.trip) { const l = v.trip.legs[Number(lg.dataset.leg)]; fit(l.path && l.path.length ? l.path : [], 16.5); haptic(); markAway(); return; }
  const pl = e.target.closest('[data-pl]');
  if (pl) { const p = places.find((x) => x.id === pl.dataset.pl); if (p) { haptic(); openPlace(p); } return; }
  if (e.target.closest('#addplace')) { haptic(); openPick({}); return; }
  if (e.target.closest('#savecity')) { haptic(); saveCity(true); return; }
  if (e.target.closest('#tomine') && v.v === 'place') { haptic(); openPick({ coord: v.coord, name: v.kind === 'mine' ? v.name : '' }); return; }
  if (e.target.closest('#editplace') && v.v === 'place') { const p = places.find((x) => x.id === v.pid); if (p) { haptic(); openPick({ ...p, pid: p.id }); } return; }
  if (e.target.closest('#delplace') && v.v === 'place') {
    places = places.filter((x) => x.id !== v.pid); savePlaces(); haptic('success'); toast(`«${v.name}» прибрано з моїх місць.`, 2600); back(); return;
  }
});

/* ---------------- a course: where the bus or train is and which stops it calls at ----------------
   Opened from a departure here, from «Транспорт» (a line number there) or from «Маршрут»: the whole road of this very
   bus, where it is now, and, for someone who wants it, the nearest of its stops still ahead and whether there is time
   to walk there. */
const noun = (x) => (x.mode === 'train' ? 'потяг' : x.mode === 'tram' ? 'трамвай' : 'автобус');
function renderCourse(v) {
  const x = v.dep;
  head(x.line ? `${x.mode === 'train' ? '' : 'Лінія '}${x.line}` : 'Рейс', x.dest ? `${MODE[x.mode] || 'автобус'} у бік <span lang="de">${esc(x.dest)}</span>` : '');
  body('<div class="now" id="now">Шукаю, де він зараз…</div><div id="catch"></div><p class="standnote" id="standnote" hidden></p>' +
    '<ol class="course" id="course"><li class="skel"></li><li class="skel"></li></ol><div class="acts"><button class="act" type="button" id="fitall">' + ICON(I.fit) + 'Увесь маршрут на мапі</button></div>' +
    '<p class="note" id="cnote"></p>' + SRC);
  if (v.stop.coord) setSrc('sel', fc([pt(v.stop.coord)]));
  v.shown = null; v.lastAt = null;
  v.focus = () => focusCourse(v); v.focusLabel = 'Наблизити назад';
  if (v.data) { drawCourse(v, true); drawBack(v); renderCatch(v); focusCourse(v); } else loadCourse(v, true);
  busLoop(v);
  timers.push(setInterval(() => { if (!document.hidden && v.data) drawCourse(v); }, 1000));
  timers.push(setInterval(() => { if (!document.hidden) loadCourse(v); }, 30000));
}
async function loadCourse(v, first) {
  const x = v.dep;
  try {
    const d = await api(`transit/course?line=${encodeURIComponent(x.ref.line)}&trip=${encodeURIComponent(x.ref.trip)}&stop=${encodeURIComponent(v.stop.id)}&when=${berlinStamp(new Date(x.plan))}`);
    if (top() !== v) return;
    v.data = d; v.cum = d.path.length > 1 ? measure(d.path) : null;
    v.pos = v.cum ? stopPositions(d.stops, d.path, v.cum) : null;
    v.pre = { cum: v.cum, pos: v.pos };
    v.mine = d.stops.findIndex((s) => s.id === v.stop.id);
    if (v.mine >= 0 && !v.stop.coord) v.stop.coord = d.stops[v.mine].coord;
    // opened by a link with only the ids: the name of the line and where it goes come with the course
    if (!x.line || !x.dest || !x.mode) { x.line = x.line || d.line; x.dest = x.dest || d.dest; x.mode = x.mode || d.mode; head(`${x.mode === 'train' ? '' : 'Лінія '}${x.line}`); }
    v.shown = null;
    drawCourse(v, first);
    renderCatch(v);
    if (first) { focusCourse(v); if ($('#catch .catch')) $('#sbody').scrollTop = 0; }   // "how to catch it" first, when it is there
    if (!v.backTried) loadBack(v); else drawBack(v);
  } catch (e) {
    if (top() === v && !v.data) { $('#now').outerHTML = '<div class="ask err" id="now"><p>Не вдалося дізнатися, де він. Перевір інтернет; спробую ще раз за пів хвилини.</p></div>'; $('#course').innerHTML = ''; }
  }
}
// what is worth seeing first: where to get on (the stop to walk to, or the one it was opened from), me if I am near,
// the bus if it is near; the button over the map comes back here after looking at the whole road
function focusCourse(v) {
  const d = v.data; if (!d || !map) return;
  const pos = whereNow(d.stops, Date.now(), d.path, v.pre), c = v.plan && (v.plan.best || v.plan.nearest);
  const at = c && c.m < 15000 ? d.stops[c.k].coord : v.mine >= 0 ? d.stops[v.mine].coord : v.stop.coord;
  const pts = [at];
  if (c && me && at && metres(me, at) < 3000) pts.push(me);
  if (pos && pos.point && pos.state !== 'done' && (!at || metres(pos.point, at) < 2500)) pts.push(pos.point);
  const p = pts.filter(Boolean);
  if (p.length > 1) fit(p, 16.3, { top: 70, bottom: 50, left: 90, right: 90 }); else if (p.length) flyTo(p[0], 16.3);
  v.away = false; refocusBtn(false);
}
// the bus glides along its road (the place worked out every frame from the times, not every second)
function busLoop(v) {
  if (busRaf) cancelAnimationFrame(busRaf);
  let lastT = 0;
  const tick = (t) => {
    if (top() !== v) { busRaf = 0; return; }
    busRaf = requestAnimationFrame(tick);
    if (document.hidden || !map || !v.data || t - lastT < 32) return;   // 30 times a second is smooth enough
    lastT = t;
    const pos = whereNow(v.data.stops, Date.now(), v.data.path, v.pre);
    if (pos && pos.point && pos.state !== 'done') {
      if (!busMarker) busMarker = new maplibregl.Marker({ element: busEl(v) }).setLngLat(ll(pos.point)).addTo(map);
      else busMarker.setLngLat(ll(pos.point));
    } else if (busMarker) { busMarker.remove(); busMarker = null; }
  };
  busRaf = requestAnimationFrame(tick);
}
// "I want this bus": the nearest of its stops still ahead, the walk there and whether there is time
function renderCatch(v) {
  const el = $('#catch'); if (!el || !v.data || top() !== v) return;
  const d = v.data, S = d.stops, x = v.dep;
  if (!me) {
    el.innerHTML = `<div class="catch ask"><p>Хочеш на цей ${noun(x)}? Покажу, де ти, найближчу його зупинку й чи встигнеш до неї дійти.</p>` +
      `<button class="act main" type="button" id="catchloc">${ICON(I.walk)}Показати, де я</button></div>`;
    return;
  }
  const now = Date.now(), pos = whereNow(S, now, d.path, v.pre);
  const plan = catchPlan(S, now, pos, me, (m, k) => (v.cw && v.cw.k === k && metres(v.cw.me, me) < 60 ? v.cw.min : walkMin(m)));
  v.plan = plan;
  const nm = (k) => `«<span lang="de">${esc(short(S[k].name))}</span>»`, at = (c) => hm(new Date(c.t).toISOString());
  let html = '', go = null;
  if (plan.done) html = `<p>Цей рейс уже ${pos && pos.state === 'done' ? 'завершився' : 'проїхав усі зупинки, де можна сісти'}.</p>`;
  else if (!plan.nearest) html = '<p>Попереду в цього рейсу немає зупинок, де можна сісти.</p>';
  else {
    const n = plan.nearest, b = plan.best;
    go = b || n;
    if (n.m > 15000) { html = `<p>Ти далеко від цієї лінії: до найближчої її зупинки ${nm(n.k)} ${fmtDist(n.m)}.</p>`; go = null; }
    else if (b && b.k === n.k) html = `<p><b>Іди на ${nm(n.k)}:</b> ${n.walk} хв пішки (${fmtDist(n.m)}). ${x.mode === 'train' ? 'Потяг' : 'Автобус'} буде там о ${at(n)}, через ${Math.max(0, Math.round(n.left))} хв. ` +
      (b.slack < 3 ? `<span class="tight">Встигаєш, але поспіши: запас ${Math.floor(b.slack)} хв.</span>` : `<span class="okk">Встигаєш, запас ${Math.floor(b.slack)} хв.</span>`) + '</p>';
    else if (b) html = `<p>До найближчої ${nm(n.k)} іти ${n.walk} хв, а він буде там уже о ${at(n)}. <b>Встигнеш на ${nm(b.k)}:</b> ${b.walk} хв пішки (${fmtDist(b.m)}), він там о ${at(b)}, <span class="okk">запас ${Math.floor(b.slack)} хв</span>.</p>`;
    else html = `<p><b>На цей рейс уже не встигнеш:</b> до найближчої ${nm(n.k)} ${n.walk} хв пішки, а він там о ${at(n)}. Наступні рейси — у відправленнях цієї зупинки.</p>`;
  }
  const acts = go ? `<div class="acts"><button class="act walk" type="button" id="catchwalk">${ICON(I.walk)}Шлях до ${esc(short(S[go.k].name))}</button>` +
    `<button class="act" type="button" data-stopk="${go.k}">${ICON(I.bus)}Відправлення звідти</button></div>` : '';
  el.innerHTML = `<div class="catch"><h3 class="sub">Хочу на цей ${noun(x)}</h3>${html}${acts}</div>`;
  // on the map: the walk there (from the walking router, once per stop and place) and where to wait
  if (go) {
    const k = go.k, s = S[k];
    if (!v.cw || v.cw.k !== k || metres(v.cw.me, me) > 60) catchWalk(v, k);
    else setSrc('walk', fc([line([me, ...v.cw.path])]));
    if (k !== v.mine && map && s.coord) {
      const hd = v.cum && v.pos && Number.isFinite(v.pos[k]) ? headingAt(d.path, v.cum, v.pos[k]) : null;
      const label = `Сідай тут${s.plat ? ' · ' + s.plat : ''}`;
      if (!catchMarker || catchMarker.k !== k) {
        if (catchMarker) catchMarker.remove();
        const el2 = document.createElement('div');
        el2.className = 'stand catchmk a-bottom';
        el2.innerHTML = (hd == null ? '' : `<span class="dir" style="transform:rotate(${Math.round(hd)}deg)">${UP}</span>`) + `<span>${esc(label)}</span>`;
        el2.setAttribute('aria-label', label);
        catchMarker = new maplibregl.Marker({ element: el2, anchor: 'bottom', offset: [0, -6] }).setLngLat(ll(s.coord)).addTo(map);
        catchMarker.k = k;
      }
    } else if (catchMarker) { catchMarker.remove(); catchMarker = null; }
  } else { setSrc('walk', EMPTY()); if (catchMarker) { catchMarker.remove(); catchMarker = null; } }
  if (!v.caught && go && !v.away) { v.caught = true; focusCourse(v); $('#sbody').scrollTop = 0; }   // the first time it is known: show me, the stop and the bus
}
async function catchWalk(v, k) {
  const s = v.data.stops[k], from = me;
  if (!s.coord || !from || v.cwBusy === k) return;
  v.cwBusy = k;
  try {
    const w = await api(`transit/walk?from=${from[0].toFixed(5)},${from[1].toFixed(5)}&to=${s.coord[0]},${s.coord[1]}`);
    v.cw = { k, min: w.min, m: w.m, path: w.path, me: from };
    if (top() === v) renderCatch(v);
  } catch (e) { /* the straight-line estimate stays */ }
  v.cwBusy = null;
}
function busEl(v) {
  const el = document.createElement('div');
  el.className = 'busmk' + (v.dep.mode === 'train' ? ' train' : '') + (v.data.live ? '' : ' plan');
  el.innerHTML = ICON(v.dep.mode === 'train' ? I.train : I.bus) + esc(v.dep.line);
  el.setAttribute('aria-label', `${MODE[v.dep.mode] || 'автобус'} ${v.dep.line}, приблизно тут`);
  return el;
}
// The way back: the same line the other way. A departure of it from this stop (from the list the course was opened
// from) gives its exact road and where it stops here; otherwise every road the line takes that way near here.
// Drawn in its own colour only when it takes other streets (the user then sees both); the same streets: one colour.
const dirOf = (id) => String(id).split(':')[3];
// the pieces of a line that lie within r metres of a point
function runsNear(path, c, r) {
  const out = []; let cur = [];
  for (const q of path) { if (metres(q, c) <= r) cur.push(q); else { if (cur.length > 1) out.push(cur); cur = []; } }
  if (cur.length > 1) out.push(cur);
  return out;
}
async function loadBack(v) {
  v.backTried = true;
  const id = v.dep.ref.line, d0 = dirOf(id), opp = d0 === 'H' ? 'R' : d0 === 'R' ? 'H' : null;
  const twin = (v.stopDeps || []).find((x) => x.ref && x.line === v.dep.line && x.ref.line !== id && (!opp || dirOf(x.ref.line) === opp) && x.dest !== v.dep.dest);
  let paths = [], at = null, dest = twin ? twin.dest : '';
  try {
    if (twin) {
      const d = await api(`transit/course?line=${encodeURIComponent(twin.ref.line)}&trip=${encodeURIComponent(twin.ref.trip)}&stop=${encodeURIComponent(v.stop.id)}&when=${berlinStamp(new Date(twin.plan))}`);
      paths = d.path.length > 1 ? [d.path] : [];
      const s = d.stops.find((x) => x.id === v.stop.id);
      if (s && s.coord && d.path.length > 1) { const cum = measure(d.path); at = { coord: s.coord, plat: s.plat || twin.plat, heading: headingAt(d.path, cum, along(d.path, cum, s.coord)), dest: twin.dest }; }
    } else if (opp) {
      const p = id.split(':'); p[3] = opp;
      const d = await api(`transit/line?line=${encodeURIComponent(p.join(':'))}`);
      // the line's roads that way, every variant: the parts within 2.5 km of my stop (the way back from here)
      const c = v.stop.coord || (v.mine >= 0 ? v.data.stops[v.mine].coord : null);
      paths = c ? d.paths.flatMap((x) => runsNear(x, c, 2500)) : d.paths;
      dest = d.dest;
    }
  } catch (e) { /* no way back known: only this direction is drawn */ }
  if (top() !== v || !v.data) return;
  v.back = { paths, at, dest, same: paths.length && v.data.path.length > 1 ? shareNear(v.data.path, paths, 30) >= 0.85 : null };
  drawBack(v);
}
function drawBack(v) {
  const b = v.back, d = v.data, el = $('#legend'), sn = $('#standnote');
  if (!d || !el || !sn) return;
  const cls = d.mode === 'train' ? 'train' : '';
  setSrc('back', b && b.same === false ? fc(b.paths.map((p) => ({ type: 'Feature', properties: { dir: 1 }, geometry: { type: 'LineString', coordinates: p.map(ll) } }))) : EMPTY());
  const mine = v.mine >= 0 ? d.stops[v.mine] : null;
  const plat = mine && (mine.plat || v.dep.plat);
  let html = '';
  const key = (sw, words) => `<span class="key"><i class="sw ${sw}"></i><span>${words}</span></span>`;
  if (b && b.same === false) html += key(cls, 'туди: цей рейс') + key('back', `назад${b.dest ? ` (у бік <span lang="de">${esc(b.dest)}</span>)` : ''}: іншими вулицями`);
  else if (b && b.same) html += key(cls, 'туди й назад тими самими вулицями, назад — з іншого боку дороги');
  else html += key(cls, 'шлях цього рейсу, стрілки — куди він їде');
  el.innerHTML = html; el.hidden = false;
  sn.innerHTML = `<b>Де чекати:</b> позначка «Стій тут»${plat ? ` (стоянка ${esc(plat)})` : ''}, стрілка — куди поїде автобус.` +
    (b && b.at ? ` Назад — позначка «Назад»${b.at.plat ? ` (стоянка ${esc(b.at.plat)})` : ''}.` : '');
  sn.hidden = !(mine && mine.coord);
  // the marks on the map: where to wait for this bus, and for the way back
  stands.forEach((m) => m.remove()); stands = [];
  const here = mine && mine.coord, there = b && b.at ? b.at.coord : null, [a1, a2] = here && there ? anchors(here, there) : ['bottom', 'bottom'];
  if (here) stand(here, v.cum && v.pos && Number.isFinite(v.pos[v.mine]) ? headingAt(d.path, v.cum, v.pos[v.mine]) : null, plat ? `Стій тут · ${plat}` : 'Стій тут', '', a1);
  if (there) stand(there, b.at.heading, b.at.plat ? `Назад · ${b.at.plat}` : 'Назад', 'back', a2);
}
function drawCourse(v, first) {
  const d = v.data, now = Date.now(), pos = whereNow(d.stops, now, d.path, v.pre);
  if (!pos) return;
  // the map: the part already driven in grey, the rest in the line's colour (redrawn when the bus has gone 20 m
  // further, not every second: new data for a line costs the map a moment); the bus itself glides (busLoop)
  const kind = d.mode === 'train' ? 'train' : 'bus';
  if (map) {
    if (v.cum && pos.at != null) {
      if (first || v.lastAt == null || Math.abs(pos.at - v.lastAt) > 20 || pos.state !== v.lastState) {
        const total = v.cum[v.cum.length - 1];
        v.lastAt = pos.at; v.lastState = pos.state;
        setSrc('route', fc([line(slice(d.path, v.cum, 0, pos.at), { kind: 'done' }), line(slice(d.path, v.cum, pos.at, total), { kind })]));
      }
    } else if (first || !v.drawnPlain) { v.drawnPlain = true; setSrc('route', fc([line(d.stops.filter((s) => s.coord).map((s) => s.coord), { kind })])); }
    if (first || v.lastI !== pos.i) setSrc('routestops', fc(d.stops.filter((s) => s.coord).map((s, k) => pt(s.coord, { id: s.id, name: short(s.name), kind, past: d.stops.indexOf(s) < pos.i || (pos.state === 'done') }))));
  }
  // the words: where it is, when it comes to my stop (and whether there is still time to catch it)
  const key = `${pos.state}:${pos.i}:${Math.floor(now / 30000)}`;
  if (v.shown === key) return;
  if (v.shown) renderCatch(v);
  v.shown = key; v.lastI = pos.i;
  const S = d.stops, nm = (k) => `«<span lang="de">${esc(short(S[k].name))}</span>»`;
  let where;
  if (pos.state === 'before') where = `Ще не виїхав: старт о ${hm(S[0].depEst || S[0].dep)} з ${nm(0)}.`;
  else if (pos.state === 'at') where = `Зараз на зупинці ${nm(pos.i)}.`;
  else if (pos.state === 'between') where = `Зараз між ${nm(pos.i)} і ${nm(pos.j)}.`;
  else where = `Рейс уже завершився на ${nm(S.length - 1)}.`;
  let mine = '';
  if (v.mine >= 0) {
    const m = v.mine, t = v.mine === 0 ? leave(S[0]) : reach(S[m]), min = Math.round((t - now) / 60000);
    if (pos.state === 'at' && pos.i === m) mine = '<b>Він зараз на твоїй зупинці.</b>';
    else if (pos.state === 'before' || pos.i < m) mine = `<b>До ${nm(m)}: ${min <= 0 ? 'ось-ось' : `через ${min} хв`} (${hm(new Date(t).toISOString())})</b>`;
    else mine = `Твою зупинку ${nm(m)} він уже проїхав.`;
  }
  const legend = $('#legend') ? $('#legend').outerHTML : '<div class="legend" id="legend" hidden></div>';   // the map's colours, kept in the card on top
  $('#now').outerHTML = `<div class="now" id="now">${mine ? mine + '<br>' : ''}${where}${legend}</div>`;
  head($('#stitle').textContent, `${MODE[v.dep.mode] || 'автобус'} у бік <span lang="de">${esc(v.dep.dest)}</span> · ${d.live ? '<span class="live">наживо</span>' : 'за розкладом'}`);
  $('#cnote').textContent = (d.live ? 'Час із запізненням від VRR. Місце на мапі розраховане за часом зупинок, це не GPS.' : 'VRR не має живих даних цього рейсу: час і місце за розкладом, приблизно.') +
    (d.path.length < 2 ? ' Точного шляху вулицями VRR для цього рейсу не дав: на мапі прямі між зупинками.' : '');
  // the stops as a line, the bus between them
  const rows = S.map((s, k) => {
    const t = k === 0 ? s.depEst || s.dep : s.arrEst || s.arr || s.depEst || s.dep, plan = k === 0 ? s.dep : s.arr || s.dep, dl = late(plan, t);
    const past = k < pos.i || (pos.state === 'done') || (pos.state === 'between' && k <= pos.i);
    const row = `<li class="cs${past ? ' past' : ''}${k === v.mine ? ' mine' : ''}" data-cs="${k}"><span class="tm">${t ? hm(t) : ''}${dl >= 1 ? `<small class="late">+${dl}</small>` : ''}</span><span class="dot" aria-hidden="true"></span>` +
      `<span class="nm" lang="de">${esc(short(s.name))}${k === v.mine ? ' <small>(твоя)</small>' : ''}</span></li>`;
    const bus = `<li class="busrow" id="busrow"><span></span><span class="bi">${ICON(d.mode === 'train' ? I.train : I.bus)}</span><span>${pos.state === 'at' ? 'тут' : 'зараз тут'}</span></li>`;
    if (pos.state === 'between' && k === pos.i) return row + bus;
    if (pos.state === 'at' && k === pos.i) return row.replace('<li class="cs', '<li class="cs at') + bus;
    if (pos.state === 'before' && k === 0) return bus + row;
    return row;
  });
  $('#course').className = 'course' + (d.mode === 'train' ? ' train' : '');
  $('#course').innerHTML = rows.join('');
  // the bus row just under the status (which stays on top), with a stop before it in view
  if (first) { const b = $('#busrow'), sb = $('#sbody'); if (b) sb.scrollTop = Math.max(0, b.getBoundingClientRect().top - sb.getBoundingClientRect().top + sb.scrollTop - $('#now').offsetHeight - 56); }
}

/* ---------------- a place found by search: the stops nearest to it ---------------- */
function renderPlace(v) {
  const mine = v.kind === 'mine';
  head(v.name, mine ? 'Моє місце: найближчі зупинки' : v.kind === 'street' ? 'Вулиця: найближчі зупинки' : 'Адреса: найближчі зупинки');
  v.focus = () => { fit([v.coord, ...(v.near || []).slice(0, 3).map((s) => s.coord)], 16.5); v.away = false; refocusBtn(false); }; v.focusLabel = 'Назад до місця';
  if (v.coord && map && !mine) {
    const el = document.createElement('div'); el.className = 'pin';
    el.innerHTML = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-13.4 13-23.5A13 13 0 0 0 2 15.5C2 25.6 15 39 15 39z" fill="var(--walk)" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15.5" r="5" fill="#fff"/></svg>';
    placeMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(ll(v.coord)).addTo(map);
  }
  if (v.coord && map) fit([v.coord, ...(v.near || []).slice(0, 3).map((s) => s.coord)], 16.5);
  for (const s of v.near || []) if (!stops.has(s.id)) stops.set(s.id, s);
  drawStops();
  const first = (v.near || [])[0];
  const acts = `<div class="acts">${walkBtn(v)}` +
    (first ? `<a class="act" href="../marshrut/?to=${encodeURIComponent(first.id)}&amp;toName=${encodeURIComponent(short(first.full || first.name))}">${ICON(I.route)}Маршрут сюди</a>` : '') +
    (mine ? `<button class="act" type="button" id="editplace">${ICON(I.edit)}Змінити</button><button class="act" type="button" id="delplace">${ICON(I.trash)}Прибрати</button>`
      : `<button class="act" type="button" id="tomine">${ICON(I.plus)}У мої місця</button>`) + '</div>';
  const list = v.near ? `<h3 class="sub">Найближчі зупинки</h3><ul class="rows">${v.near.map((s) => stopRow(s, s.dist, mine ? 'звідси' : 'від адреси')).join('')}</ul>`
    : '<div class="skel"></div><div class="skel"></div>';
  body(acts + list + SRC);
  if (!v.near && v.coord && !v.nearBusy) {
    v.nearBusy = true;
    api(`transit/stops?lat=${v.coord[0].toFixed(5)}&lon=${v.coord[1].toFixed(5)}`).then((d) => { v.near = (d.near && d.near.stops) || []; if (top() === v) renderPlace(v); })
      .catch(() => { if (top() === v) body(acts + '<div class="ask err"><p>Не вдалося знайти зупинки поруч. Перевір інтернет.</p></div>' + SRC); }).finally(() => { v.nearBusy = false; });
  }
  if (v.walk) drawWalk(v); else if (me && v.coord) walkTo(v);
}

/* ---------------- a connection from «Маршрут» ---------------- */
async function renderTrip(v) {
  head('Маршрут на мапі', v.title ? esc(v.title) : '');
  if (!v.trip) {
    body('<div class="skel"></div><div class="skel"></div><div class="skel"></div>');
    try {
      const q = v.q, d = await api(`transit/trip?from=${encodeURIComponent(q.from)}&to=${encodeURIComponent(q.to)}&when=${encodeURIComponent(q.when)}&paths=1${q.long ? '&long=1' : ''}`);
      v.trip = d.trips.find((t) => t.dep === q.dep) || d.trips[0];
      v.title = `${d.from.name} → ${d.to.name}`;
      if (!v.trip) throw new Error('none');
      if (top() !== v) return;
      head('Маршрут на мапі', esc(v.title));
    } catch (e) { if (top() === v) body('<div class="ask err"><p>Не вдалося завантажити цей маршрут. Перевір інтернет і відкрий його ще раз із «Маршруту».</p></div>'); return; }
  }
  const t = v.trip, feats = [], dots = [];
  t.legs.forEach((l) => {
    const kind = l.walk ? 'walk' : l.mode === 'train' ? 'train' : 'bus';
    if (l.path && l.path.length > 1) feats.push(line(l.path, { kind }));
    if (!l.walk) (l.on || []).forEach((s) => dots.push(pt(s.coord, { name: short(s.name), kind, past: false })));
  });
  setSrc('route', fc(feats)); setSrc('routestops', fc(dots));
  // where to get on each bus or train: its platform at the stop, the arrow the way it will go
  t.legs.forEach((l, k) => {
    if (l.walk || !l.on || !l.on.length || !l.path || l.path.length < 2) return;
    const cum = measure(l.path);
    stand(l.on[0].coord, headingAt(l.path, cum, along(l.path, cum, l.on[0].coord)), `${k && t.legs.slice(0, k).some((x) => !x.walk) ? 'Пересадка' : 'Сідай'}: ${l.line}${l.from.plat ? ' · ' + l.from.plat : ''}`);
  });
  v.focus = () => { fit(t.legs.flatMap((l) => l.path || []), 16); v.away = false; refocusBtn(false); }; v.focusLabel = 'Назад до маршруту';
  if (map) v.focus();
  const legs = t.legs.map((l, k) => `<li class="leg" data-leg="${k}"><span class="tm">${hm(l.from.est || l.from.plan)}<small>${hm(l.to.est || l.to.plan)}</small></span><span class="b">` +
    `<div lang="de">${esc(short(l.from.name))} → ${esc(short(l.to.name))}</div><span class="ride"><span class="line ${l.walk ? 'walk' : lineCls(l)}">${l.walk ? 'пішки' : esc(l.line)}</span>` +
    `<span>${l.walk ? `${l.mins} хв` : `у бік <span lang="de">${esc(l.dir)}</span> · ${l.mins} хв${l.stops > 1 ? `, ${l.stops} ${plural(l.stops, 'зупинка', 'зупинки', 'зупинок')}` : ''}`}</span></span>` +
    (l.ref && l.stop ? `<button class="legbus" type="button" data-legbus="${k}">${ICON(l.mode === 'train' ? I.train : I.bus)}Де він зараз і як встигнути</button>` : '') + '</span></li>').join('');
  body(`<p class="note">${hm(t.depEst || t.dep)} → ${hm(t.arrEst || t.arr)} · ${t.mins} хв · ${t.changes ? `${t.changes} ${plural(t.changes, 'пересадка', 'пересадки', 'пересадок')}` : 'без пересадок'}. Торкнись частини, щоб показати її на мапі.</p><ol class="legs">${legs}</ol>` + SRC);
}

/* ---------------- back to what the sheet shows ----------------
   After the whole road (or a drag away), a button over the map brings back the close look: the stop, the bus and me. */
function refocusBtn(on) {
  const b = $('#refocus'); if (!b) return;
  const v = top(), show = !!on && !!v.focus && !document.body.classList.contains('picking');
  if (show) b.querySelector('span').textContent = v.focusLabel || 'Назад';
  b.classList.toggle('on', show); b.setAttribute('aria-hidden', String(!show)); b.tabIndex = show ? 0 : -1;
}
function markAway() { const v = top(); if (v.focus && !v.away) { v.away = true; refocusBtn(true); } }
$('#refocus').addEventListener('click', () => { const v = top(); if (v.focus) { haptic(); v.focus(); } });

/* ---------------- my places: home, work, the doctor… kept on this phone (and in this person's Telegram) ---------------- */
const PKEY = 'mapa-places';
const okPlace = (p) => p && typeof p.id === 'string' && typeof p.name === 'string' && KINDS[p.kind] && Array.isArray(p.coord) && p.coord.length === 2 && p.coord.every(Number.isFinite);
let places = (load(PKEY) || []).filter(okPlace).slice(0, 12), placeMks = [];
function savePlaces() { store(PKEY, places); cloudSet('places', places); drawPlaces(); }
cloudGet('places').then((list) => {   // on a new phone: the places from this person's Telegram
  if (!places.length && Array.isArray(list) && list.some(okPlace)) { places = list.filter(okPlace).slice(0, 12); store(PKEY, places); drawPlaces(); if (top().v === 'near') renderNear(); }
});
function placesRow() {
  return `<div class="pchips" data-noswipe>${places.map((p) => `<button class="pchip" type="button" data-pl="${esc(p.id)}">${ICON(KINDS[p.kind][1])}<span>${esc(p.name)}</span></button>`).join('')}` +
    `<button class="pchip add" type="button" id="addplace">${ICON(I.plus)}<span>${places.length ? 'Додати' : 'Мої місця: дім, робота…'}</span></button></div>`;
}
function drawPlaces() {
  placeMks.forEach((m) => m.remove()); placeMks = [];
  if (!map) return;
  for (const p of places) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'myplace k-' + p.kind;
    el.innerHTML = `<span class="mi">${ICON(KINDS[p.kind][1])}</span><span class="mt">${esc(p.name)}</span>`;
    el.setAttribute('aria-label', `${p.name}: моє місце`);
    el.addEventListener('click', (e) => { e.stopPropagation(); haptic(); openPlace(p); });
    placeMks.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(ll(p.coord)).addTo(map));
  }
}
function openPlace(p) { setSheet('mid'); open({ v: 'place', name: p.name, kind: 'mine', pid: p.id, coord: p.coord }); }

// adding or changing a place: the map moves under a pin in the middle; a name and a kind in the sheet
function openPick(o) {
  setSheet('mid');
  open({ v: 'pick', pid: o.pid || null, name: o.name || '', kind: o.kind || (places.some((p) => p.kind === 'home') ? 'other' : 'home'), coord: o.coord || null });
}
function placePick() {
  const pin = $('#pickpin'); if (!pin || !map) return;
  const c = map.project(map.getCenter());
  pin.style.transform = `translate(${Math.round(c.x)}px, ${Math.round(c.y)}px)`;
}
function renderPick(v) {
  head(v.pid ? 'Змінити місце' : 'Нове місце', 'Посунь мапу: шпилька посередині — це місце');
  document.body.classList.add('picking');
  const at = v.coord || me || (map ? [map.getCenter().lat, map.getCenter().lng] : XANTEN);
  if (map) { map.easeTo({ center: ll(at), zoom: Math.max(map.getZoom(), 16.5), duration: reduce ? 0 : 500 }); setTimeout(placePick, 30); }
  body(`<label class="pname"><span>Назва</span><input id="pname" type="text" maxlength="24" autocomplete="off" value="${esc(v.name)}" placeholder="${esc(KINDS[v.kind][0])}"></label>` +
    `<div class="pkinds" role="radiogroup" aria-label="Що це за місце">${Object.entries(KINDS).map(([k, [w, ic]]) => `<button class="pchip${k === v.kind ? ' on' : ''}" type="button" role="radio" aria-checked="${k === v.kind}" data-kind="${k}">${ICON(ic)}<span>${w}</span></button>`).join('')}</div>` +
    `<div class="acts">${me ? `<button class="act" type="button" id="pickme">${ICON(I.walk)}Тут, де я</button>` : ''}<button class="act main" type="button" id="picksave">${ICON(I.check)}Зберегти</button></div>` +
    '<p class="note">Місце зберігається на цьому телефоні (і у твоєму Telegram). На сервер для пошуку зупинок іде лише точка, без назви.</p>');
}
$('#sbody').addEventListener('click', (e) => {
  const v = top(); if (v.v !== 'pick') return;
  const k = e.target.closest('[data-kind]');
  if (k) {
    v.kind = k.dataset.kind; haptic();
    document.querySelectorAll('.pkinds [data-kind]').forEach((b) => { const on = b === k; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    const inp = $('#pname'); inp.placeholder = KINDS[v.kind][0];
    return;
  }
  if (e.target.closest('#pickme') && me && map) { haptic(); map.easeTo({ center: ll(me), zoom: Math.max(map.getZoom(), 17), duration: reduce ? 0 : 500 }); return; }
  if (e.target.closest('#picksave')) {
    const c = map ? map.getCenter() : null;
    const coord = c ? [Math.round(c.lat * 1e5) / 1e5, Math.round(c.lng * 1e5) / 1e5] : v.coord || me;
    if (!coord) return;
    const name = ($('#pname').value || '').replace(/\s+/g, ' ').trim().slice(0, 24) || KINDS[v.kind][0];
    if (v.pid) places = places.map((p) => (p.id === v.pid ? { ...p, name, kind: v.kind, coord } : p));
    else places = [...places, { id: 'p' + Date.now().toString(36), name, kind: v.kind, coord }].slice(-12);
    savePlaces(); haptic('success'); toast(`«${name}» у моїх місцях.`, 2400);
    back();
  }
});
$('#sbody').addEventListener('input', (e) => { if (e.target.id === 'pname') top().name = e.target.value; });

/* ---------------- the map of the town without internet ----------------
   Once (and again after 45 days) the tiles of Xanten and of the way to Wesel are fetched and kept by sw.js (about
   5 MB): on wi-fi by itself, on mobile data after a tap. Then the map of the town opens in a cellar too. */
const CKEY = 'mapa-city', FONTS = ['Noto Sans Regular', 'Noto Sans Bold', 'Noto Sans Italic'], RANGES = ['0-255', '256-511', '8192-8447'];
let cityBusy = false, cityPct = 0;
const cityDone = () => { const c = load(CKEY); return c && c.at && Date.now() - c.at < 45 * 864e5 ? c : null; };
function cityHTML() {
  if (cityBusy) return `<span class="ci busy">${ICON(I.save)}</span><span>Зберігаю мапу міста для роботи без інтернету… ${cityPct} %</span>`;
  const c = cityDone();
  if (c) return `<span class="ci ok">${ICON(I.check)}</span><span>Мапа Ксантена й дороги до Везеля працює без інтернету <small>(збережено ${new Date(c.at).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })})</small></span>`;
  return `<button class="act" type="button" id="savecity">${ICON(I.save)}Зберегти мапу міста без інтернету (≈ 5 МБ)</button>`;
}
function renderCity() { const el = $('#city'); if (el) el.innerHTML = cityHTML(); }
async function saveCity(manual) {
  if (cityBusy || !map || !navigator.onLine || !('caches' in window)) { if (manual && !navigator.onLine) toast('Потрібен інтернет, щоб зберегти мапу.', 2600); return; }
  const cn = navigator.connection || {};
  if (!manual && (cityDone() || cn.saveData || cn.type === 'cellular')) return;   // on mobile data only when asked
  cityBusy = true; cityPct = 0; renderCity();
  try {
    const tj = await fetch(TILES + '?keep=city').then((r) => r.json());
    const tpl = tj.tiles && tj.tiles[0];
    if (!tpl) throw new Error('no tiles');
    const urls = cityTiles().map(([z, x, y]) => tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y) + '?keep=city');
    for (const f of FONTS) for (const r of RANGES) urls.push(GLYPHS.replace('{fontstack}', encodeURIComponent(f)).replace('{range}', r) + '?keep=city');
    const ctl = !!(navigator.serviceWorker && navigator.serviceWorker.controller), box = ctl ? null : await caches.open('dsimya-city');
    let done = 0, bad = 0, i = 0;
    const one = async () => {
      while (i < urls.length) {
        const u = urls[i++];
        try { const r = await fetch(u); if (!r.ok) bad++; else if (box) await box.put(tileKey(u), r.clone()); } catch (e) { bad++; }
        done++; const pct = Math.round((done / urls.length) * 100); if (pct !== cityPct) { cityPct = pct; renderCity(); }
      }
    };
    await Promise.all([one(), one(), one(), one()]);
    if (bad > urls.length * 0.1) throw new Error('missing ' + bad);
    store(CKEY, { at: Date.now(), n: urls.length });
    if (manual) { haptic('success'); toast('Мапу міста збережено: вона працюватиме й без інтернету.', 3200); }
  } catch (e) { if (manual) toast('Не вдалося зберегти мапу. Спробуй ще раз із добрим інтернетом.', 3200); }
  cityBusy = false; renderCity();
}

/* ---------------- start ---------------- */
if (tg) { try { tg.ready(); tg.expand(); if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); } catch (e) {} }
setSheet('mid');
try { history.replaceState({ ...(history.state || {}), mapa: 1 }, '', location.href); } catch (e) {}
(function fromUrl() {
  const q = new URLSearchParams(location.search), id = q.get('stop');
  if (id && /^de:\d{5}:\d{1,7}$/.test(id)) {
    stack.push({ v: 'stop', id, name: q.get('name') || '', full: q.get('name') || '', h: false });
    try { history.replaceState({ mapa: 2 }, '', location.href); } catch (e) {}
  } else if (LINE_RE.test(q.get('line') || '') && /^\d{1,6}$/.test(q.get('trip') || '') && STOP_RE.test(q.get('at') || '') && !isNaN(Date.parse(q.get('plan') || ''))) {
    // a line number tapped in «Транспорт» or «Маршрут»: this very bus, its road, where it is, how to catch it
    const mode = ['bus', 'train', 'tram', 'ferry'].includes(q.get('mode')) ? q.get('mode') : '';
    stack.push({ v: 'course', dep: { line: (q.get('ln') || '').slice(0, 24), dest: (q.get('dest') || '').slice(0, 80), mode, plan: q.get('plan'), ref: { line: q.get('line'), trip: q.get('trip') } },
      stop: { id: q.get('at'), name: (q.get('sn') || '').slice(0, 80) }, h: false, url: location.search });
    try { history.replaceState({ mapa: 2 }, '', location.href); } catch (e) {}
  } else if (q.get('from') && q.get('to') && /^de:\d{5}:\d{1,7}$/.test(q.get('from')) && /^de:\d{5}:\d{1,7}$/.test(q.get('to'))) {
    stack.push({ v: 'trip', q: { from: q.get('from'), to: q.get('to'), when: q.get('when') || berlinStamp(new Date()), dep: q.get('dep') || '', long: q.get('long') === '1' }, h: false });
    try { history.replaceState({ mapa: 2 }, '', location.href); } catch (e) {}
  }
})();
show();
if (!map) loadArea();
// the place: at once if it was given before (and the map then goes there, unless a stop or a connection was asked for);
// otherwise after a tap (the sheet asks)
const auto = () => { followNext = stack.length === 1; locate(false); };
if (load('mapa-loc') === 1) auto();
else if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: 'geolocation' }).then((p) => { if (p.state === 'granted') auto(); }).catch(() => {});
window.__mapa = { stops, top: () => top(), stack, map: () => map, me: () => me, places: () => places, saveCity, setMe: (c) => onPos({ coords: { latitude: c[0], longitude: c[1], accuracy: 10 } }) };
