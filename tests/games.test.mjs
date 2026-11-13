// The German games' content and rules: sentences can be built from their cards, numbers are checked the way people
// type them, every conversation step has a right answer and a reason for each wrong one, memory themes are complete,
// the garden's words are unique, and every skin can be earned or bought and draws a well-formed drum.
// Run: node tests/games.test.mjs
import { SENTENCES, LEVELS, RULES, bare, isRight as satzRight, rightFromStart } from '../igry/data/satz.js';
import { ITEMS, KINDS, isRight as zahlRight, word, year, ordinal } from '../igry/data/zahlen.js';
import { SCENES, REACT, lines } from '../igry/data/dialog.js';
import { THEMES } from '../igry/data/memory.js';
import { POOL, INTERVAL, MAX_BOX } from '../igry/data/garten.js';
import { SKINS, SKIN, reach, reached, drumSVG } from '../igry/skins.js';
import { LEVELS as HOP } from '../igry/hop/levels.js?v=2';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const ARTS = ['der', 'die', 'das'];

/* ---------- Збери речення ---------- */
const sBad = [];
SENTENCES.forEach((s, i) => {
  if (!LEVELS.some((L) => L.lv === s.lv) || !RULES[s.r] || !s.uk) sBad.push(`${i}: level, rule or translation`);
  for (const o of s.ok) {
    const words = bare(o).split(' ');
    if (words.slice().sort().join(' ') !== s.t.slice().sort().join(' ')) sBad.push(`${i}: «${o}» is not made of its cards`);
    if (!satzRight(s, words)) sBad.push(`${i}: «${o}» is not accepted`);
    if (rightFromStart(s, words) !== words.length) sBad.push(`${i}: «${o}» not right from the start to the end`);
  }
  const rev = s.t.slice().reverse();
  if (satzRight(s, rev) && !s.ok.some((o) => bare(o) === rev.join(' '))) sBad.push(`${i}: a reversed order counts`);
});
t('sentences: every accepted order is made of the cards and counts, a wrong one does not', !sBad.length, sBad.join('\n'));
t('sentences: ten in each of the four levels', LEVELS.length === 4 && LEVELS.every((L) => SENTENCES.filter((s) => s.lv === L.lv).length === 10));
t('sentences: a partly right order says how far it is right', rightFromStart(SENTENCES[0], [SENTENCES[0].t[0], ...SENTENCES[0].t.slice(1).reverse()]) >= 1);

/* ---------- Числа на слух ---------- */
const zBad = ITEMS.filter((it) => !KINDS.some((k) => k.id === it.kind) || !it.accept.every((a) => zahlRight(it, a)) || !it.say || !it.show);
t('numbers: every item accepts its own answers', !zBad.length, zBad.map((x) => x.say).join(' | '));
const typed = (it) => ({ zahl: it.accept[0], preis: it.accept[0], zeit: it.accept[0], uhr: it.accept[0], datum: it.accept[0] + '.', jahr: it.accept[0], telefon: it.accept[0] })[it.kind];
t('numbers: the answers as typed on the keypad count (a date with its last dot)', ITEMS.every((it) => zahlRight(it, typed(it))));
const p = ITEMS.find((it) => it.kind === 'preis'), z = ITEMS.find((it) => it.kind === 'zeit');
t('numbers: a price counts without the cents part when they are zero, 3,5 is 3,50', zahlRight({ kind: 'preis', accept: ['3,50'] }, '3,5') && zahlRight({ kind: 'preis', accept: ['2,00'] }, '2') && !zahlRight(p, '0'));
t('numbers: a time counts with a leading zero', zahlRight({ kind: 'zeit', accept: ['7:05'] }, '07:05') && !zahlRight(z, '0:00'));
t('numbers: a wrong number does not count', ITEMS.every((it) => !zahlRight(it, '99999999999')));
t('numbers: German number words', word(21) === 'einundzwanzig' && word(100) === 'hundert' && word(1987) === 'tausendneunhundertsiebenundachtzig' && year(1987) === 'neunzehnhundertsiebenundachtzig' && ordinal(3) === 'dritten',
  [word(21), word(100), word(1987), year(1987), ordinal(3)].join(' '));
t('numbers: every kind has ten or more items', KINDS.every((k) => ITEMS.filter((it) => it.kind === k.id).length >= 10), KINDS.map((k) => k.id + ' ' + ITEMS.filter((it) => it.kind === k.id).length).join(', '));

/* ---------- Розмова ---------- */
const dBad = [];
for (const sc of SCENES) {
  if (!sc.end || sc.end.length !== 2) dBad.push(`${sc.id}: no closing line`);
  sc.steps.forEach((st, k) => {
    if (st.answers.length < 3) dBad.push(`${sc.id}/${k}: fewer than three answers`);
    if (new Set(st.answers.map((a) => a[0])).size !== st.answers.length) dBad.push(`${sc.id}/${k}: two answers alike`);
    st.answers.forEach((a, j) => {
      if (!a[1]) dBad.push(`${sc.id}/${k}/${j}: no translation`);
      if (j && !(st.why || {})[j]) dBad.push(`${sc.id}/${k}/${j}: a wrong answer without a reason`);
      if (j && (st.react || {})[j] && !REACT[st.react[j]]) dBad.push(`${sc.id}/${k}/${j}: unknown reaction ${st.react[j]}`);
    });
  });
}
t('conversations: three answers per step, a reason and a known reaction for every wrong one', !dBad.length, dBad.join('\n'));
const L = lines();
t('conversations: every line said aloud is listed for the clips', SCENES.every((sc) => L.includes(sc.end[0]) && sc.steps.every((st) => L.includes(st.npc[0]) && L.includes(st.answers[0][0]))) && Object.values(REACT).every((r) => L.includes(r[0])));
t('conversations: five scenes, unique ids', SCENES.length === 5 && new Set(SCENES.map((s) => s.id)).size === 5);

/* ---------- Пам'ять and the garden ---------- */
const mBad = [];
for (const th of THEMES) {
  if (th.words.length !== 8) mBad.push(`${th.id}: ${th.words.length} words`);
  if (new Set(th.words.map((w) => w[3])).size !== th.words.length) mBad.push(`${th.id}: two pictures alike`);
  th.words.forEach((w) => { if (!ARTS.includes(w[1])) mBad.push(`${th.id}: ${w[0]} article ${w[1]}`); if (!POOL.some((x) => x.de === w[0] && x.art === w[1])) mBad.push(`${th.id}: ${w[0]} not in the garden`); });
}
t('memory: six themes of eight words, each picture different, every word grows in the garden', THEMES.length === 6 && !mBad.length, mBad.join('\n'));
t('garden: every word once, with its article and meaning', new Set(POOL.map((w) => w.de)).size === POOL.length && POOL.every((w) => ARTS.includes(w.art) && w.uk));
t('garden: the review steps double (1, 2, 4 … 32 days)', INTERVAL.length === MAX_BOX + 1 && INTERVAL.slice(2).every((d, i) => d === INTERVAL[i + 1] * 2));

/* ---------- skins ---------- */
const base = { artRight: 0, artStreak: 0, sortRight: 0, sortBest: 0, satz: [], zahlRight: 0, zahlStreak: 0, dialog: [], dialogPerfect: [], memory: {}, bloom: 0, planted: 0, december: 0, hop: {}, hopWord: [], hopFast: [] };
t('skins: unique ids, classic first and free', new Set(SKINS.map((s) => s.id)).size === SKINS.length && SKINS[0].id === 'classic' && !SKINS[0].price && !SKINS[0].need);
t('skins: nine earned, four bought, each with a name, a note and an emoji', SKINS.filter((s) => s.need).length === 9 && SKINS.filter((s) => s.price).length === 4 && SKINS.slice(1).every((s) => s.name && s.note && s.emoji && (s.need ? s.how : s.price > 0)));
t('skins: none earned at the start', SKINS.filter((s) => s.need).every((s) => !reached(s, base)));
const full = { ...base, artStreak: 11, satz: Array.from({ length: 20 }, (_, i) => i), bloom: 10, zahlRight: 100, sortBest: 25, dialog: SCENES.map((s) => s.id), memory: Object.fromEntries(THEMES.map((th) => [th.id, 20])), december: 1, hop: Object.fromEntries(HOP.map((l) => [l.id, 300])) };
t('skins: all nine earned when every goal is met', SKINS.filter((s) => s.need).every((s) => reached(s, full)), SKINS.filter((s) => s.need && !reached(s, full)).map((s) => s.id).join(', '));
t('skins: progress stops at the goal', reach(SKIN.karneval, { ...base, artStreak: 30 }).join('/') === '11/11' && reach(SKIN.bahnhof, { ...base, zahlRight: 37 }).join('/') === '37/100');
t('skins: prices go up', SKINS.filter((s) => s.price).every((s, i, a) => !i || s.price > a[i - 1].price));
const svgBad = SKINS.filter((s) => {
  const x = drumSVG(s, true);
  const open = (x.match(/<(?!\/)[a-zA-Z][^>]*[^/]>/g) || []).length, close = (x.match(/<\/[a-zA-Z]+>/g) || []).length;
  return open !== close || !x.includes('id="spin"') || /undefined|NaN/.test(x) || (s.deco && !x.includes('clip-path'));
});
t('skins: every drum is well-formed SVG with the spinning part', !svgBad.length, svgBad.map((s) => s.id).join(', '));
t('skins: the small pictures have their own clip ids', SKINS.every((s) => !s.deco || drumSVG(s, false).match(/id="([^"]+)"/)[1] !== drumSVG(s, true).match(/id="([^"]+)"/)[1]));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
