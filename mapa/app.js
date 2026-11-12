// «Мапа»: the map of the stops around (VRR), the walk to a stop (OSRM, FOSSGIS), where a bus or train is and which
// stops it calls at (worked out from its live times), and a connection from «Маршрут» drawn on the map.
// The sheet at the bottom holds what is chosen; every step is a step in the history, so the phone's Back goes back.
import { $, tg, haptic, toast, load, store, cloudSet, esc, plural } from '../igry/kit.js';
import { WORKER_URL } from '../pogoda/wx.js';
import { mapStyle, OVERLAY_SOURCES } from './style.js';
import { XANTEN, metres, walkMin, fmtDist, cellsFor, whereNow, measure, slice, berlinStamp, ring, reach, leave } from './geo.js';

const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const wide = () => !!(window.matchMedia && matchMedia('(min-width:700px)').matches);
const api = async (path) => {
  const r = await fetch(WORKER_URL.replace(/\/*$/, '/') + path);
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
};
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

/* ---------------- the sheet: low, half, high; dragged by its handle or title ---------------- */
const sheet = $('#sheet');
let sheetH = 0;
function snaps() {
  const vh = window.innerHeight, top = $('.mtop').getBoundingClientRect().bottom;
  return { low: Math.min(170, Math.round(vh * 0.3)), mid: Math.round(vh * 0.46), high: Math.max(260, Math.round(vh - top - 12)) };
}
function setSheet(h, opts = {}) {
  const s = snaps(), vh = window.innerHeight;
  sheetH = Math.round(Math.max(110, Math.min(s.high, typeof h === 'string' ? s[h] : h)));
  document.documentElement.style.setProperty('--sheet-h', sheetH + 'px');
  $('#grip').setAttribute('aria-label', sheetH >= s.high - 4 ? 'Згорнути' : 'Розгорнути');
  if (map && !opts.drag) map.setPadding(wide() ? { top: 70, bottom: 20, left: 450, right: 20 } : { top: Math.round($('.mtop').getBoundingClientRect().bottom + 6), bottom: Math.round(Math.min(sheetH, vh * 0.62)), left: 0, right: 0 });
}
(function drag() {
  let y0 = 0, h0 = 0, last = 0, lastT = 0, v = 0, moved = false, on = false;
  const down = (e) => {
    if (e.button > 0 || e.target.closest('.sback')) return;
    on = true; moved = false; y0 = e.clientY; h0 = sheetH; last = e.clientY; lastT = performance.now(); v = 0;
    sheet.classList.add('drag'); $('#fabs').classList.add('now');
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const move = (e) => {
    if (!on) return;
    const dy = e.clientY - y0;
    if (Math.abs(dy) > 4) moved = true;
    const now = performance.now(); v = (e.clientY - last) / Math.max(1, now - lastT); last = e.clientY; lastT = now;
    setSheet(h0 - dy, { drag: true });
  };
  const up = () => {
    if (!on) return;
    on = false; sheet.classList.remove('drag'); $('#fabs').classList.remove('now');
    const s = snaps();
    if (!moved) { setSheet(sheetH < s.mid - 4 ? 'mid' : sheetH < s.high - 4 ? 'high' : 'mid'); return; }
    // a flick goes on in its direction, a slow drag stops at the nearest height
    const order = [s.low, s.mid, s.high];
    let to = order.reduce((a, b) => (Math.abs(b - sheetH) < Math.abs(a - sheetH) ? b : a));
    if (v < -0.5) to = order.find((x) => x > sheetH + 10) || s.high;
    if (v > 0.5) to = [...order].reverse().find((x) => x < sheetH - 10) || s.low;
    setSheet(to); haptic();
  };
  for (const el of [$('#grip'), $('#shead')]) {
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  $('#grip').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const s = snaps(); setSheet(sheetH < s.high - 4 ? 'high' : 'mid'); } });
})();
window.addEventListener('resize', () => setSheet(sheetH));

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
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
  // our layers can be filled as soon as the style is there (the tiles may still be on their way)
  map.on('style.load', () => {
    ready = true;
    for (const id of OVERLAY_SOURCES) { const s = map.getSource(id); if (s) s.setData(D[id]); }
    if (!window.__mapReady) { window.__mapReady = true; loadArea(); }
  });
  map.on('load', () => { const at = document.querySelector('.maplibregl-ctrl-attrib'); if (at) at.classList.remove('maplibregl-compact-show'); });   // the ⓘ opens the credits
  map.on('error', (e) => {
    const m = String((e && e.error && e.error.message) || '');
    if (/webgl/i.test(m)) mapFailed();
  });
  // the first place found moves the map there, unless the person has already moved it
  map.on('dragstart', () => { followNext = false; });
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
function fit(points, maxZoom = 16.5) {
  const p = points.filter(Boolean);
  if (!map || !p.length) return;
  if (p.length === 1) { flyTo(p[0], Math.min(16, maxZoom)); return; }
  const b = new maplibregl.LngLatBounds(ll(p[0]), ll(p[0]));
  p.forEach((x) => b.extend(ll(x)));
  map.fitBounds(b, { padding: 48, maxZoom, duration: reduce ? 0 : 700 });
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
let timers = [], placeMarker = null, busMarker = null;
function clearView() {
  timers.forEach((t) => clearInterval(t)); timers = [];
  setSrc('walk', EMPTY()); setSrc('route', EMPTY()); setSrc('routestops', EMPTY()); setSrc('sel', EMPTY());
  if (placeMarker) { placeMarker.remove(); placeMarker = null; }
  if (busMarker) { busMarker.remove(); busMarker = null; }
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
const urlOf = (v) => (v.v === 'stop' ? `?stop=${encodeURIComponent(v.id)}` : v.v === 'trip' ? location.search : location.pathname);
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
  if (v.v === 'near') renderNear();
  else if (v.v === 'search') renderSearch(v);
  else if (v.v === 'stop') renderStop(v);
  else if (v.v === 'course') renderCourse(v);
  else if (v.v === 'place') renderPlace(v);
  else if (v.v === 'trip') renderTrip(v);
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
  body(ask + `<div id="nearlist">${rows}</div>` + '<p class="note">Торкнись зупинки в списку чи на мапі: відправлення наживо, шлях пішки й де зараз автобус.</p>' + SRC);
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
  return `<li><button class="dep${min <= 5 && min >= 0 ? ' soon' : ''}${x.gone ? ' gone' : ''}" type="button" data-dep="${i}"${x.ref ? '' : ' disabled'}>` +
    `<span class="tm"><b>${big}</b>${min < 60 ? `<small>${hm(x.est || x.plan)}</small>` : ''}</span>` +
    `<span><span class="l1"><span class="line ${lineCls(x)}">${esc(x.line)}</span><span class="dest" lang="de">${esc(x.dest)}</span></span>` +
    `<span class="l2">${x.gone ? '<span class="late">скасовано</span>' : x.live ? (dl >= 1 ? `<span class="late">+${dl} хв</span>` : '<span class="ok">вчасно</span>') : '<span>за розкладом</span>'}` +
    `${x.plat ? `<span>${x.mode === 'train' ? 'колія' : 'стоянка'} ${esc(x.plat)}</span>` : ''}${x.ref ? '<span>де зараз →</span>' : ''}</span></span>` +
    (x.ref ? GO : '<span></span>') + '</button></li>';
}
function renderDeps(v) {
  const list = (v.deps || []).filter((x) => Date.parse(x.est || x.plan) > Date.now() - 60000).slice(0, 12);
  $('#deps').innerHTML = list.length ? `<ul class="deps">${list.map((x) => depRow(x, v.deps.indexOf(x))).join('')}</ul>` : '<p class="note">Найближчим часом відправлень немає.</p>';
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
  if (dep && v.v === 'stop') { const x = v.deps[Number(dep.dataset.dep)]; if (x && x.ref) { haptic(); setSheet('mid'); open({ v: 'course', dep: x, stop: { id: v.id, name: v.name, coord: v.coord } }); } return; }
  if (e.target.closest('#addmine') && v.v === 'stop') { addToMine(v); haptic('success'); toast('Додано в «Транспорт»: тепер ця зупинка там перша.', 3000); e.target.closest('#addmine').outerHTML = `<a class="act done" href="../transport/">${ICON(I.check)}У моїх зупинках</a>`; return; }
  const wb = e.target.closest('#walkbtn');
  if (wb) {
    if (!me) { locate(true); return; }
    if (v.walk) { fit([me, ...v.walk.path], 17); haptic(); }
    return;
  }
  const cs = e.target.closest('[data-cs]');
  if (cs && v.v === 'course' && v.data) { const st = v.data.stops[Number(cs.dataset.cs)]; if (st && st.coord) { flyTo(st.coord, 15.5); haptic(); } return; }
  if (e.target.closest('#fitall') && v.data) { fit(v.data.path.length ? v.data.path : v.data.stops.map((x) => x.coord), 15); haptic(); return; }
  const lg = e.target.closest('[data-leg]');
  if (lg && v.v === 'trip' && v.trip) { const l = v.trip.legs[Number(lg.dataset.leg)]; fit(l.path && l.path.length ? l.path : [], 16.5); haptic(); }
});

/* ---------------- a course: where the bus or train is and which stops it calls at ---------------- */
function renderCourse(v) {
  const x = v.dep;
  head(`${x.mode === 'train' ? '' : 'Лінія '}${x.line}`, `${MODE[x.mode] || 'автобус'} у бік <span lang="de">${esc(x.dest)}</span>`);
  body('<div class="now" id="now">Шукаю, де він зараз…</div>' +
    '<ol class="course" id="course"><li class="skel"></li><li class="skel"></li></ol><div class="acts"><button class="act" type="button" id="fitall">' + ICON(I.fit) + 'Увесь маршрут на мапі</button></div>' +
    '<p class="note" id="cnote"></p>' + SRC);
  if (v.stop.coord) setSrc('sel', fc([pt(v.stop.coord)]));
  v.shown = null;
  if (v.data) drawCourse(v, true); else loadCourse(v, true);
  timers.push(setInterval(() => { if (!document.hidden && v.data) drawCourse(v); }, 1000));
  timers.push(setInterval(() => { if (!document.hidden) loadCourse(v); }, 30000));
}
async function loadCourse(v, first) {
  const x = v.dep;
  try {
    const d = await api(`transit/course?line=${encodeURIComponent(x.ref.line)}&trip=${encodeURIComponent(x.ref.trip)}&stop=${encodeURIComponent(v.stop.id)}&when=${berlinStamp(new Date(x.plan))}`);
    if (top() !== v) return;
    v.data = d; v.cum = d.path.length > 1 ? measure(d.path) : null;
    v.mine = d.stops.findIndex((s) => s.id === v.stop.id);
    v.shown = null;
    drawCourse(v, first);
  } catch (e) {
    if (top() === v && !v.data) { $('#now').outerHTML = '<div class="ask err" id="now"><p>Не вдалося дізнатися, де він. Перевір інтернет; спробую ще раз за пів хвилини.</p></div>'; $('#course').innerHTML = ''; }
  }
}
function busEl(v) {
  const el = document.createElement('div');
  el.className = 'busmk' + (v.dep.mode === 'train' ? ' train' : '') + (v.data.live ? '' : ' plan');
  el.innerHTML = ICON(v.dep.mode === 'train' ? I.train : I.bus) + esc(v.dep.line);
  el.setAttribute('aria-label', `${MODE[v.dep.mode] || 'автобус'} ${v.dep.line}, приблизно тут`);
  return el;
}
function drawCourse(v, first) {
  const d = v.data, now = Date.now(), pos = whereNow(d.stops, now, d.path);
  if (!pos) return;
  // the map: the part already driven in grey, the rest in the line's colour, the bus where the times put it
  const kind = d.mode === 'train' ? 'train' : 'bus';
  if (map) {
    if (v.cum && pos.at != null) {
      const total = v.cum[v.cum.length - 1];
      setSrc('route', fc([line(slice(d.path, v.cum, 0, pos.at), { kind: 'done' }), line(slice(d.path, v.cum, pos.at, total), { kind })]));
    } else setSrc('route', fc([line(d.stops.filter((s) => s.coord).map((s) => s.coord), { kind })]));
    if (first || v.lastI !== pos.i) setSrc('routestops', fc(d.stops.filter((s) => s.coord).map((s, k) => pt(s.coord, { id: s.id, name: short(s.name), kind, past: d.stops.indexOf(s) < pos.i || (pos.state === 'done') }))));
    if (pos.point && pos.state !== 'done') {
      if (!busMarker) busMarker = new maplibregl.Marker({ element: busEl(v) }).setLngLat(ll(pos.point)).addTo(map);
      else busMarker.setLngLat(ll(pos.point));
    } else if (busMarker) { busMarker.remove(); busMarker = null; }
    if (first) {
      const mine = v.mine >= 0 ? d.stops[v.mine].coord : v.stop.coord;
      fit([pos.state === 'done' ? null : pos.point, mine, ...(pos.state === 'before' ? [d.stops[0].coord] : [])].filter(Boolean), 15.5);
    }
  }
  // the words: where it is, when it comes to my stop
  const key = `${pos.state}:${pos.i}:${Math.floor(now / 30000)}`;
  if (v.shown === key) return;
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
  $('#now').outerHTML = `<div class="now" id="now">${mine ? mine + '<br>' : ''}${where}</div>`;
  head($('#stitle').textContent, `${MODE[v.dep.mode] || 'автобус'} у бік <span lang="de">${esc(v.dep.dest)}</span> · ${d.live ? '<span class="live">наживо</span>' : 'за розкладом'}`);
  $('#cnote').textContent = d.live ? 'Час із запізненням від VRR. Місце на мапі розраховане за часом зупинок, це не GPS.' : 'VRR не має живих даних цього рейсу: час і місце за розкладом, приблизно.';
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
  head(v.name, v.kind === 'street' ? 'Вулиця: найближчі зупинки' : 'Адреса: найближчі зупинки');
  if (v.coord && map) {
    const el = document.createElement('div'); el.className = 'pin';
    el.innerHTML = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-13.4 13-23.5A13 13 0 0 0 2 15.5C2 25.6 15 39 15 39z" fill="var(--walk)" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15.5" r="5" fill="#fff"/></svg>';
    placeMarker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(ll(v.coord)).addTo(map);
    fit([v.coord, ...(v.near || []).slice(0, 3).map((s) => s.coord)], 16.5);
  }
  for (const s of v.near || []) if (!stops.has(s.id)) stops.set(s.id, s);
  drawStops();
  body(`<div class="acts">${walkBtn(v)}</div><ul class="rows">${(v.near || []).map((s) => stopRow(s, s.dist, 'від адреси')).join('')}</ul>` + SRC);
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
  if (map) fit(t.legs.flatMap((l) => l.path || []), 16);
  const legs = t.legs.map((l, k) => `<li class="leg" data-leg="${k}"><span class="tm">${hm(l.from.est || l.from.plan)}<small>${hm(l.to.est || l.to.plan)}</small></span><span class="b">` +
    `<div lang="de">${esc(short(l.from.name))} → ${esc(short(l.to.name))}</div><span class="ride"><span class="line ${l.walk ? 'walk' : lineCls(l)}">${l.walk ? 'пішки' : esc(l.line)}</span>` +
    `<span>${l.walk ? `${l.mins} хв` : `у бік <span lang="de">${esc(l.dir)}</span> · ${l.mins} хв${l.stops > 1 ? `, ${l.stops} ${plural(l.stops, 'зупинка', 'зупинки', 'зупинок')}` : ''}`}</span></span></span></li>`).join('');
  body(`<p class="note">${hm(t.depEst || t.dep)} → ${hm(t.arrEst || t.arr)} · ${t.mins} хв · ${t.changes ? `${t.changes} ${plural(t.changes, 'пересадка', 'пересадки', 'пересадок')}` : 'без пересадок'}. Торкнись частини, щоб показати її на мапі.</p><ol class="legs">${legs}</ol>` + SRC);
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
window.__mapa = { stops, top: () => top(), stack, map: () => map, me: () => me };
