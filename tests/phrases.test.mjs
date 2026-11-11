// The phrasebook's recorded clips: every phrase has one, every file is there and is an MP3 of a sensible length,
// no file is left over. Clips are made by tools/tts.py (not here: it needs the voice model).
// Run: node tests/phrases.test.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { SITUATIONS } from '../rozmovnyk/phrases.js';
import { AUDIO } from '../rozmovnyk/audio.js';

const dir = new URL('../rozmovnyk/audio/', import.meta.url);
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const all = SITUATIONS.flatMap((s) => s.list.map((p) => p[0]));
const missing = all.filter((de) => !AUDIO[de]);
t('every phrase has a clip', !missing.length, missing.join(' | '));
t('no clip for a phrase that is gone (run tools/tts.py after changing phrases)', Object.keys(AUDIO).every((de) => all.includes(de)), Object.keys(AUDIO).filter((de) => !all.includes(de)).join(' | '));
const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.mp3')));
const absent = Object.values(AUDIO).filter((f) => !files.has(f));
t('every clip file is there', !absent.length, absent.join(', '));
t('no file without a phrase', [...files].every((f) => Object.values(AUDIO).includes(f)), [...files].filter((f) => !Object.values(AUDIO).includes(f)).join(', '));
const bad = [];
for (const [de, f] of Object.entries(AUDIO)) {
  if (!files.has(f)) continue;
  const b = readFileSync(new URL(f, dir)), size = statSync(new URL(f, dir)).size;
  const mp3 = (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || b.slice(0, 3).toString() === 'ID3';
  // 40 kbit/s is 5 KB a second; a phrase is said at roughly 12 letters a second
  const secs = size / 5000, letters = de.replace(/[^\p{L}]/gu, '').length;
  if (!mp3 || secs < letters / 30 || secs > letters / 6 + 1) bad.push(`${f} (${de}): ${mp3 ? '' : 'not MP3, '}${secs.toFixed(1)} s for ${letters} letters`);
}
t('every clip is an MP3 whose length fits its phrase', !bad.length, bad.join('\n'));
const total = [...files].reduce((n, f) => n + statSync(new URL(f, dir)).size, 0);
t('all clips together stay small (under 1.5 MB)', total < 1.5e6, total);
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
