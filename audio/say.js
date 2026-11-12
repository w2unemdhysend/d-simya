// Plays the recorded clips (audio/index.js) for the phrasebook and the games. A clip is fetched ahead when it is about
// to be needed and kept as a blob, so a tap plays at once; the service worker keeps every clip it fetched for offline use.
import { AUDIO } from './index.js';

const DIR = new URL('./', import.meta.url);
const ready = new Map();   // file → object URL (null while loading)
// One audio element for everything: once it has played after a tap, phones let it play again later without one
// (the other person's next line in "Розмова" comes after a pause, not right after a tap).
let el = null, playing = null;

export const has = (text) => !!AUDIO[text];
export function prefetch(texts) {
  if (navigator.connection && navigator.connection.saveData) return;
  for (const t of texts) {
    const f = AUDIO[t]; if (!f || ready.has(f)) continue;
    ready.set(f, null);
    fetch(new URL(f, DIR)).then((r) => (r.ok ? r.blob() : null)).then((b) => { if (b) ready.set(f, URL.createObjectURL(b)); else ready.delete(f); }).catch(() => ready.delete(f));
  }
}
export function stop() {
  if (el) { try { el.pause(); } catch (e) {} }
  if (playing) { const p = playing; playing = null; if (p.off) p.off(); }
}
// say(text, {on, off, fail}): false when there is no clip. off() comes once, when the clip ends, fails or is stopped.
export function say(text, cb = {}) {
  stop();
  const f = AUDIO[text]; if (!f) return false;
  if (!el) el = new Audio();
  const a = el, me = { off: cb.off };
  playing = me;
  const end = (failed) => { if (playing !== me) return; playing = null; if (cb.off) cb.off(); if (failed && cb.fail) cb.fail(!ready.get(f)); };
  a.onended = () => end(false);
  a.onerror = () => end(true);
  a.src = ready.get(f) || new URL(f, DIR).href;
  if (cb.on) cb.on();
  const pr = a.play(); if (pr && pr.catch) pr.catch((e) => { if (!e || e.name !== 'AbortError') end(true); });
  return true;
}
export { AUDIO };
