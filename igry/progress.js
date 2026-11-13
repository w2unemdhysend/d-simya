// What a player has done across all the games: records, counts, finished scenes and themes, the platformer levels (best time
// in tenths of a second, all letters found, within the par time). The laundry's skins are
// unlocked from it, the menu shows it. Kept on the device and in Telegram's cloud (the larger of the two counts).
import { load, store, cloudGet, cloudSet } from './kit.js';

const KEY = 'dsimya-progress';
const base = () => ({ artRight: 0, artStreak: 0, sortRight: 0, sortBest: 0, satz: [], zahlRight: 0, zahlStreak: 0, dialog: [], dialogPerfect: [], memory: {}, bloom: 0, planted: 0, december: 0, hop: {}, hopWord: [], hopFast: [] });
let P = Object.assign(base(), load(KEY) || {});
const listeners = [];
let cloudTimer = null;
function changed() {
  store(KEY, P);
  clearTimeout(cloudTimer); cloudTimer = setTimeout(() => cloudSet('progress', P), 1500);
  listeners.forEach((f) => { try { f(P); } catch (e) {} });
}
export const get = () => P;
export const on = (f) => listeners.push(f);
export function add(key, n = 1) { P[key] = (P[key] || 0) + n; changed(); }
export function max(key, v) { if (v > (P[key] || 0)) { P[key] = v; changed(); } }
export function mark(key, id) { if (!P[key].includes(id)) { P[key].push(id); changed(); } }
export function set(key, v) { if (JSON.stringify(P[key]) !== JSON.stringify(v)) { P[key] = v; changed(); } }
// playing in December counts for the Christmas market skin
if (new Date().getMonth() === 11 && !P.december) { P.december = 1; store(KEY, P); }
cloudGet('progress').then((c) => {
  if (!c) return;
  let more = false;
  for (const [k, v] of Object.entries(c)) {
    if (typeof v === 'number' && v > (P[k] || 0)) { P[k] = v; more = true; }
    else if (Array.isArray(v)) { const u = [...new Set([...(P[k] || []), ...v])]; if (u.length > (P[k] || []).length) { P[k] = u; more = true; } }
    else if (v && typeof v === 'object') { for (const [id, n] of Object.entries(v)) if (!P[k][id] || n < P[k][id]) { P[k] = { ...P[k], [id]: n }; more = true; } }
  }
  if (more) changed();
});
