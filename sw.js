/* Offline mode for D-SIM'YA. The pages and what they need are kept on the phone, so the appliance guides, the waste
   calendar, the games and the last weather and departures open without internet (in the cellar next to the washer).

   · pages: from the network when there is one (always fresh), otherwise the kept copy
   · scripts, styles, data files of the site: the kept copy at once, refreshed in the background
   · weather, warnings, departures from our Worker: the network first; without it the last answer (each page shows
     "оновлено о …", so an old answer is never mistaken for a new one)
   · fonts: kept once, used from then on
   · the spoken clips (phrasebook, games, the A1 dictionary): kept once fetched
   · the 2.5D game and three.js are kept with the rest (about 210 KB over the wire), so it plays in the cellar too
   · the map: the tiles of Xanten and the way to Wesel, saved by the map page once (about 5 MB), and the tiles seen in
     passing (up to 600); a tile is kept under one name whatever weekly version the tile server is at
   Nothing else is kept: not the shopping list, not translations, not searches.
   When the asset version (?v=) changes, update it here too (tests/offline_e2e.py checks that they match). */

const VERSION = '2026-11-13.7';
const CORE_CACHE = 'dsimya-core-' + VERSION, DATA_CACHE = 'dsimya-data', STATIC_CACHE = 'dsimya-static', AUDIO_CACHE = 'dsimya-audio';
const CITY_CACHE = 'dsimya-city', TILE_CACHE = 'dsimya-tiles', MAX_TILES = 600;
const CORE = [
  'manifest.webmanifest', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/maskable-512.png', 'assets/icons/favicon-48.png', 'assets/icons/apple-180.png',
  './', 'pralka/', 'sushka/', 'scan/', 'smittia/', 'prospekty/', 'spysok/', 'transport/', 'pogoda/', 'igry/', 'bot/', 'ekstreno/', 'rozmovnyk/', 'marshrut/', 'a1/', 'mapa/',
  'assets/ui.css?v=21', 'assets/ui.js?v=23', 'assets/page.css?v=2', 'rozmovnyk/phrases.js', 'audio/index.js', 'audio/say.js', 'assets/fonts/noto-sans.ttf',
  'smittia/kalender.json', 'smittia/due.js', 'smittia/wohin.js', 'prospekty/week.js', 'pogoda/wx.js', 'igry/words.js', 'igry/games.css?v=3',
  'igry/kit.js', 'igry/progress.js', 'igry/garten.js', 'igry/satz.js', 'igry/zahlen.js', 'igry/dialog.js', 'igry/memory.js', 'igry/skins.js',
  'igry/data/garten.js', 'igry/data/satz.js', 'igry/data/zahlen.js', 'igry/data/dialog.js', 'igry/data/memory.js',
  'igry/hop.js?v=2', 'igry/hop/levels.js?v=2', 'igry/hop/engine.js?v=2', 'igry/hop/physics.js?v=2', 'igry/hop/art.js?v=1', 'assets/three/r185/three.module.min.js', 'assets/three/r185/three.core.min.js',
  'a1/a1.css?v=4', 'a1/app.js?v=4', 'a1/text.js', 'a1/people.js', 'a1/data/index.js', 'a1/data/wortschatz.js', 'a1/data/wortschatz2.js', 'a1/data/k01.js', 'a1/data/k02.js', 'a1/data/k03.js', 'a1/data/k04.js', 'a1/data/k05.js',
  'mapa/mapa.css?v=4', 'mapa/app.js?v=4', 'mapa/style.js?v=3', 'mapa/geo.js?v=3',
  'a1/data/k06.js', 'a1/data/k07.js', 'a1/data/k08.js', 'a1/data/k09.js', 'a1/data/k10.js', 'a1/data/k11.js', 'a1/data/k12.js', 'a1/data/k13.js', 'a1/data/k14.js', 'a1/data/k15.js', 'a1/data/k16.js',
  'a1/data/k17.js', 'a1/data/k18.js', 'a1/data/k19.js', 'a1/data/k20.js', 'a1/data/k21.js', 'a1/data/k22.js', 'a1/data/k23.js', 'a1/data/k24.js',
  'a1/data/k25.js', 'a1/data/k26.js', 'a1/data/k27.js', 'a1/data/k28.js', 'a1/data/k29.js', 'a1/data/k30.js', 'a1/data/k31.js', 'a1/data/k32.js',
];
const DATA = /^\/(weather|warnings|transit\/departures|transit\/area)$/;
const MAX_DATA = 40;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CORE_CACHE).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('dsimya-core-') && k !== CORE_CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // the spoken clips: kept once played or fetched ahead; the name changes when a clip changes, so never stale
    if (url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3')) return e.respondWith(audio(url.href));
    if (req.mode === 'navigate' || req.destination === 'document') e.respondWith(networkFirst(req, CORE_CACHE, 2500, true));
    else e.respondWith(staleWhileRevalidate(req, CORE_CACHE));
  } else if (url.hostname.endsWith('.workers.dev') && DATA.test(url.pathname)) {
    e.respondWith(networkFirst(req, DATA_CACHE, 6000, false));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req, STATIC_CACHE));
  } else if (url.hostname === 'telegram.org') {
    e.respondWith(networkFirst(req, STATIC_CACHE, 4000, false));
  } else if (url.hostname === 'tiles.openfreemap.org') {
    e.respondWith(mapFile(req, url));
  }
});

// The same as tileKey() in mapa/geo.js: one name for a tile whatever weekly version the tile server is at
function tileKey(href) {
  const m = String(href).match(/^(https:\/\/tiles\.openfreemap\.org)\/planet\/[^/?]+\/(\d+)\/(\d+)\/(\d+)\.pbf/);
  return m ? `${m[1]}/__tile/${m[2]}/${m[3]}/${m[4]}.pbf` : String(href).split('?')[0];
}
// The map's files. Tiles and letters: the kept copy (the city's first), else the network, kept for next time. The
// description of the tiles (TileJSON): the network when it answers in 3 s, else the kept one. ?keep=city is the map
// page saving the city: always from the network, into the city's cache, which is never trimmed.
async function mapFile(req, url) {
  const key = tileKey(url.href), city = await caches.open(CITY_CACHE), saving = url.searchParams.get('keep') === 'city';
  if (!key.includes('/__tile/') && !url.pathname.startsWith('/fonts/')) {
    const net = fetch(req).then((res) => { if (res.ok) city.put(key, res.clone()); return res; });
    try {
      const first = await Promise.race([net, new Promise((r) => setTimeout(r, saving ? 15000 : 3000, 'late'))]);
      if (first !== 'late') return first;
      return (await city.match(key)) || (await net);
    } catch (err) { return (await city.match(key)) || Response.error(); }
  }
  const passing = await caches.open(TILE_CACHE);
  const kept = saving ? null : (await city.match(key)) || (await passing.match(key));
  if (kept) return kept;
  try {
    const res = await fetch(req);
    if (res.ok) { await (saving ? city : passing).put(key, res.clone()); if (!saving) trim(passing, MAX_TILES); }
    return res;
  } catch (err) { return Response.error(); }   // not kept and no network: the map shows the coarser tile it has
}

// The network, but not longer than `wait` ms when a kept copy exists; a late answer still refreshes the copy
async function networkFirst(req, name, wait, page) {
  const cache = await caches.open(name);
  const kept = () => cache.match(req, { ignoreSearch: page }).then((r) => r || (page ? caches.match('./', { ignoreSearch: true }) : undefined));
  const net = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) { cache.put(req, res.clone()).then(() => (name === DATA_CACHE ? trim(cache) : null)); }
    return res;
  });
  const timer = new Promise((resolve) => setTimeout(resolve, wait, 'late'));
  try {
    const first = await Promise.race([net, timer]);
    if (first !== 'late') return first;
    const k = await kept();
    return k || await net;
  } catch (err) {
    const k = await kept();
    if (k) return k;
    return new Response(page ? '<!doctype html><meta charset="utf-8"><title>Офлайн</title><p style="font:17px system-ui;padding:24px">Немає інтернету, а цієї сторінки ще немає на телефоні. Відкрий її один раз з інтернетом.</p>'
      : JSON.stringify({ ok: false, error: 'offline' }), { status: 503, headers: { 'Content-Type': page ? 'text/html; charset=utf-8' : 'application/json' } });
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const kept = await cache.match(req);
  const net = fetch(req).then((res) => { if (res && res.status === 200) cache.put(req, res.clone()); return res; }).catch(() => kept);
  return kept || net;
}

// A clip, whole: a player asks for parts of a file (Range), and a part cannot be kept, so the whole file is fetched once
async function audio(href) {
  const cache = await caches.open(AUDIO_CACHE);
  const kept = await cache.match(href);
  if (kept) return kept;
  try {
    const res = await fetch(href);
    if (res.status === 200) await cache.put(href, res.clone());
    return res;
  } catch (err) { return new Response('', { status: 504 }); }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const kept = await cache.match(req);
  if (kept) return kept;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
  return res;
}

async function trim(cache, max = MAX_DATA) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
