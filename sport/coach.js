// The coach's voice in the player: the name of each exercise, «Відпочинок. Далі: …», the count 3-2-1 and «Готово!»,
// in Ukrainian, as recorded clips (sport/audio/, made by tools/coach.py), a woman's or a man's voice.
// Played with Web Audio on the player's own AudioContext, which the tap on «Почати» unlocks, so a phone plays the
// clips one after another without more taps. A clip not fetched yet is skipped: the player beeps instead.
import { CLIPS } from './audio/index.js';

// What the coach says besides the names of the exercises (the names come from moves.js)
export const PHRASES = {
  ready: 'Приготуйся.', go: 'Почали!', rest: 'Відпочинок.', next: 'Далі.', warm: 'Розминка.', cool: 'Заминка.',
  3: 'Три.', 2: 'Два.', 1: 'Один.', ten: 'Залишилося десять секунд.',
  round2: 'Друге коло.', round3: 'Третє коло.', round4: 'Четверте коло.', lastround: 'Останнє коло.', lastmove: 'Остання вправа.',
  done: 'Готово! Молодець!',
};

const DIR = new URL('./audio/', import.meta.url);
const KEY = 'sport-voice';
export const VOICES = [['f', 'Жіночий'], ['m', 'Чоловічий'], ['off', 'Без голосу']];
// 'f', 'm' or 'off'; at first the same as «Рід у прикладах» in the settings
export function voice() {
  try { const v = localStorage.getItem(KEY); if (v === 'f' || v === 'm' || v === 'off') return v; return localStorage.getItem('dsimya-gender') === 'f' ? 'f' : 'm'; } catch (e) { return 'm'; }
}
export function setVoice(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: for this visit only */ } mem = v; }
let mem = null;
const current = () => mem || voice();

const bufs = new Map();   // file → AudioBuffer, or a Promise while it loads
const decode = (ctx, data) => new Promise((ok, no) => { const p = ctx.decodeAudioData(data, ok, no); if (p && p.then) p.then(ok, no); });
function fileOf(key) { const v = current(); return v === 'off' ? null : (CLIPS[v] || {})[key] || null; }

// Fetches the clips a workout will need, so each plays the moment it is due
export function prefetch(ctx, keys) {
  if (!ctx) return;
  for (const k of new Set(keys)) {
    const f = fileOf(k); if (!f || bufs.has(f)) continue;
    bufs.set(f, fetch(new URL(f, DIR)).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
      .then((data) => decode(ctx, data)).then((b) => { bufs.set(f, b); return b; }, () => { bufs.delete(f); return null; }));
  }
}

let playing = [], endAt = 0;
export function hush() { for (const s of playing) { try { s.stop(); } catch (e) { /* already ended */ } } playing = []; endAt = 0; }
// true while the coach is still speaking
export const busy = (ctx) => !!ctx && ctx.currentTime < endAt;
// Says the keys one after another (what is not loaded is left out). False when nothing could be said: no voice
// chosen, or none of the clips here yet.
export function say(ctx, keys, vol = 1) {
  if (!ctx || current() === 'off') return false;
  const list = keys.map(fileOf).map((f) => f && bufs.get(f)).filter((b) => b && !(b instanceof Promise));
  if (!list.length) return false;
  hush();
  const out = ctx.createGain(); out.gain.value = vol; out.connect(ctx.destination);
  let t = ctx.currentTime + 0.03;
  for (const b of list) {
    const s = ctx.createBufferSource(); s.buffer = b; s.connect(out); s.start(t); t += b.duration + 0.08;
    playing.push(s);
  }
  endAt = t;
  return true;
}
// For a preview from the settings: loads the keys, then says them
export async function sample(ctx, keys) {
  prefetch(ctx, keys);
  await Promise.all(keys.map(fileOf).map((f) => f && bufs.get(f)));
  return say(ctx, keys);
}
export const ready = (key) => { const f = fileOf(key), b = f && bufs.get(f); return !!b && !(b instanceof Promise); };
export const hasVoice = () => current() !== 'off';
