// What the pages share, in one place: the server's address and the escaping of text put into HTML.
// Imported by the pages' modules, by igry/kit.js and a1/text.js, and through pogoda/wx.js also by the Worker,
// so nothing here may touch window or document when the module loads.

// The Cloudflare Worker (worker/send-scan.js): scanner, reminders, shopping list, timetable, weather
export const WORKER_URL = 'https://d-simya.whysends.workers.dev';
// The same with a slash at the end, ready for a path: API + 'transit/departures?stop=…'
export const API = WORKER_URL.replace(/\/*$/, '/');

// Text into HTML, both between tags and inside attributes (either quote)
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ENTITIES[c]);

// Price comparison for something to buy: links that open the search of each site (no prices are fetched here: the
// sites offer no open interface, so the person compares in their own browser)
export const priceLinks = (q) => {
  const e = encodeURIComponent(String(q || '').trim());
  return [['idealo', `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${e}`], ['Check24', `https://www.check24.de/suche/?q=${e}`], ['Google Shopping', `https://www.google.com/search?tbm=shop&q=${e}`]];
};
