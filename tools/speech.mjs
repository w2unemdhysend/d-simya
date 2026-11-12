// Everything the app says aloud, for tools/tts.py: one entry per clip.
// { text } is said as written; { text, check } (numbers) also counts as heard right when Whisper writes the digits:
// check.digits lists the digit strings that count, check.words the words that must be there too.
import { SITUATIONS } from '../rozmovnyk/phrases.js';
import { POOL, say } from '../igry/data/garten.js';
import { SENTENCES } from '../igry/data/satz.js';
import { ITEMS } from '../igry/data/zahlen.js';
import { lines } from '../igry/data/dialog.js';
import { WORDS as A1, sayOf } from '../a1/data/wortschatz.js';

const out = [], seen = new Set();
const add = (e) => { if (!seen.has(e.text)) { seen.add(e.text); out.push(e); } };
SITUATIONS.forEach((s) => s.list.forEach((p) => add({ text: p[0] })));
POOL.forEach((w) => add({ text: say(w) }));
SENTENCES.forEach((s) => add({ text: s.ok[0] }));
lines().forEach((t) => add({ text: t }));
const NUM = { null: 0, eins: 1, ein: 1, zwei: 2, zwo: 2, drei: 3, vier: 4, 'fünf': 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, 'zwölf': 12, zwanzig: 20 };
for (const it of ITEMS) {
  const d = it.accept.map((a) => a.replace(/\D/g, ''));
  const check = { digits: [...d], words: [] };
  if (it.kind === 'preis') { const [e, c] = it.accept[0].split(','); check.digits.push(String(Number(e)) + c, String(Number(c)), e + ',' + c); if (c === '00') check.digits.push(e); }
  if (it.kind === 'zeit') { const [h, m] = it.accept[0].split(':'); check.digits.push(h + Number(m)); if (m === '00') check.digits.push(h); }
  if (it.kind === 'datum') { const [day, month] = it.accept[0].split('.'); check.digits = [day, day + month]; check.words = [it.say.split(' ').pop().toLowerCase()]; }
  if (it.kind === 'uhr') {
    const nums = it.say.split(' ').filter((w) => w in NUM).map((w) => String(NUM[w]));
    check.digits = [nums.join('')]; check.words = it.say.split(' ').filter((w) => !(w in NUM)).map((w) => w.toLowerCase());
  }
  add({ text: it.say, check });
}
// the A1 dictionary: every entry. Number words may be written as digits ("zwei" → "2", "vier Euro fünfzig" → "4,50 Euro")
const A1NUM = { null: 0, eins: 1, zwei: 2, drei: 3, vier: 4, 'fünf': 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, 'zwölf': 12,
  dreizehn: 13, sechzehn: 16, siebzehn: 17, zwanzig: 20, einundzwanzig: 21, 'dreißig': 30, vierzig: 40, 'fünfzig': 50, sechzig: 60, siebzig: 70,
  achtzig: 80, neunzig: 90, hundert: 100, vierundvierzig: 44, ersten: 1 };
const A1CHECK = { 'Es ist halb acht.': { digits: ['8', '730', '0730', '1930'], words: ['es', 'ist'] } };
for (const e of A1) {
  const text = sayOf(e), toks = text.replace(/[.,!?]/g, '').split(' ');
  const nums = toks.filter((w) => w.toLowerCase() in A1NUM);
  if (A1CHECK[text]) add({ text, check: A1CHECK[text] });
  else if (nums.length) add({ text, check: { digits: [nums.map((w) => String(A1NUM[w.toLowerCase()])).join('')], words: toks.filter((w) => !(w.toLowerCase() in A1NUM)).map((w) => w.toLowerCase()) } });
  else add({ text });
}
console.log(JSON.stringify(out));
