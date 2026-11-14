// What every game module shares: Telegram, haptics, the toast, storage on the device and in Telegram's cloud.
export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const tgApp = window.Telegram && window.Telegram.WebApp;
export const tg = tgApp && tgApp.platform && tgApp.platform !== 'unknown' ? tgApp : null;
export function haptic(kind) {
  try {
    if (!tg || !tg.HapticFeedback) return;
    if (kind === 'tap') tg.HapticFeedback.impactOccurred('light');
    else if (kind === 'ok' || kind === 'error') tg.HapticFeedback.notificationOccurred(kind === 'ok' ? 'success' : 'error');
    else tg.HapticFeedback.selectionChanged();
  } catch (e) {}
}
let toastTimer = null;
export function toast(text, ms) {
  const t = $('#toast'); if (!t) return;
  t.textContent = text; t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms || 2600);
}
export const load = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
export const store = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} };
const cloud = tg && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9') ? tg.CloudStorage : null;
export function cloudGet(key) {
  return new Promise((res) => { if (!cloud) return res(null); try { cloud.getItem(key, (err, v) => { let o = null; try { o = err || !v ? null : JSON.parse(v); } catch (e) {} res(o); }); } catch (e) { res(null); } });
}
export function cloudSet(key, v) { if (cloud) try { cloud.setItem(key, JSON.stringify(v)); } catch (e) {} }
export { esc } from '../assets/site.js';
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const pr = new Intl.PluralRules('uk-UA');
export const plural = (n, one, few, many) => ({ one, few, many }[pr.select(n)] || many);
export const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
// today in Xanten as a day number (days since 1970), for the garden
export function today(now = new Date()) {
  const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  return Math.round(Date.parse(d + 'T00:00:00Z') / 86400000);
}
export const SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9.5v5h3.2l4.3 3.5v-12L7.7 9.5z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg>';
