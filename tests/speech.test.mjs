// The recorded clips: everything the app says aloud (phrasebook and games, listed by tools/speech.mjs) has one, every
// file is there and is an MP3 of a sensible length, no file is left over. Clips are made by tools/tts.py (it needs the
// voice model, so not here).
// Run: node tests/speech.test.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { AUDIO } from '../audio/index.js';

const dir = new URL('../audio/', import.meta.url);
let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const all = JSON.parse(execFileSync(process.execPath, [new URL('../tools/speech.mjs', import.meta.url).pathname], { encoding: 'utf8' })).map((e) => e.text);
t('the list of what is said has no repeats', new Set(all).size === all.length);
const missing = all.filter((de) => !AUDIO[de]);
t('everything said aloud has a clip (run tools/tts.py after changing texts)', !missing.length, missing.slice(0, 20).join(' | '));
t('no clip for a text that is gone', Object.keys(AUDIO).every((de) => all.includes(de)), Object.keys(AUDIO).filter((de) => !all.includes(de)).join(' | '));
const files = new Set(readdirSync(dir).filter((f) => f.endsWith('.mp3')));
const absent = Object.values(AUDIO).filter((f) => !files.has(f));
t('every clip file is there', !absent.length, absent.slice(0, 20).join(', '));
t('no file without a text', [...files].every((f) => Object.values(AUDIO).includes(f)), [...files].filter((f) => !Object.values(AUDIO).includes(f)).join(', '));
t('nothing half-made is left (*.take.mp3)', !readdirSync(dir).some((f) => f.includes('.take')), readdirSync(dir).filter((f) => f.includes('.take')).join(', '));
const bad = [];
for (const [de, f] of Object.entries(AUDIO)) {
  if (!files.has(f)) continue;
  const b = readFileSync(new URL(f, dir)), size = statSync(new URL(f, dir)).size;
  const mp3 = (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || b.slice(0, 3).toString() === 'ID3';
  // 40 kbit/s is 5 KB a second; speech is roughly 12 letters a second (digits are said as words, so they count more)
  const secs = size / 5000, letters = de.replace(/[^\p{L}]/gu, '').length + 4 * de.replace(/\D/g, '').length;
  if (!mp3 || secs < letters / 40 || secs > letters / 5 + 1.2) bad.push(`${f} (${de}): ${mp3 ? '' : 'not MP3, '}${secs.toFixed(1)} s for ${letters} letters`);
}
t('every clip is an MP3 whose length fits its text', !bad.length, bad.join('\n'));
const total = [...files].reduce((n, f) => n + statSync(new URL(f, dir)).size, 0);
t('all clips together stay small (under 5 MB)', total < 5e6, total);
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
