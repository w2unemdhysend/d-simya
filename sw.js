/* Offline mode for D-SIM'YA. The pages and what they need are kept on the phone, so the appliance guides, the waste
   calendar, the games and the last weather and departures open without internet (in the cellar next to the washer).

   · pages: from the network when there is one (always fresh), otherwise the kept copy
   · scripts, styles, data files of the site: the kept copy at once, refreshed in the background
   · weather, warnings, departures from our Worker: the network first; without it the last answer (each page shows
     "оновлено о …", so an old answer is never mistaken for a new one)
   · fonts: kept once, used from then on
   · the spoken clips (phrasebook and games): kept once fetched
   Nothing else is kept: not the shopping list, not translations, not searches.
   When the asset version (?v=) changes, update it here too (tests/offline_e2e.py checks that they match). */

const VERSION = '2026-11-12.7';
const CORE_CACHE = 'dsimya-core-' + VERSION, DATA_CACHE = 'dsimya-data', STATIC_CACHE = 'dsimya-static', AUDIO_CACHE = 'dsimya-audio';
const CORE = [
  './', 'pralka/', 'sushka/', 'scan/', 'smittia/', 'prospekty/', 'spysok/', 'transport/', 'pogoda/', 'igry/', 'bot/', 'ekstreno/', 'rozmovnyk/', 'marshrut/',
  'assets/ui.css?v=16', 'assets/ui.js?v=16', 'assets/page.css?v=1', 'rozmovnyk/phrases.js', 'audio/index.js', 'audio/say.js', 'assets/fonts/noto-sans.ttf',
  'smittia/kalender.json', 'smittia/due.js', 'smittia/wohin.js', 'prospekty/week.js', 'pogoda/wx.js', 'igry/words.js', 'igry/games.css?v=1',
  'igry/kit.js', 'igry/progress.js', 'igry/garten.js', 'igry/satz.js', 'igry/zahlen.js', 'igry/dialog.js', 'igry/memory.js', 'igry/skins.js',
  'igry/data/garten.js', 'igry/data/satz.js', 'igry/data/zahlen.js', 'igry/data/dialog.js', 'igry/data/memory.js',
];
const DATA = /^\/(weather|warnings|transit\/departures)$/;
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
    if (req.mode === 'navigate' || req.destination === 'document') e.respondWith(networkFirst(req, CORE_CACHE, 4000, true));
    else e.respondWith(staleWhileRevalidate(req, CORE_CACHE));
  } else if (url.hostname.endsWith('.workers.dev') && DATA.test(url.pathname)) {
    e.respondWith(networkFirst(req, DATA_CACHE, 6000, false));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(cacheFirst(req, STATIC_CACHE));
  } else if (url.hostname === 'telegram.org') {
    e.respondWith(networkFirst(req, STATIC_CACHE, 4000, false));
  }
});

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

async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - MAX_DATA; i++) await cache.delete(keys[i]);
}
