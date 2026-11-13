// The A1 course's content: 16 chapters in the book's order with goals, grammar topics, phrases, a dialogue and
// exercises that can be solved; tables whose rows fit their heads; marks (**bold**, `German`) that open and close;
// a dictionary whose nouns have an article and a plural, verbs their forms, and whose words reach the word garden;
// the answer check and the search folding; the hero who says "I" in both forms (Тарас and Леся, {for him|for her}):
// every check of the content runs for each (the second run is a child process with HERO=f).
// Run: node tests/a1.test.mjs
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { WORDS, KINDS, sayOf, gardenNouns, byChapter } from '../a1/data/wortschatz.js';
import { md, norm, fold, order, CATS, hero, heroAll } from '../a1/text.js';
import { POOL } from '../igry/data/garten.js';
const G = process.env.HERO === 'f' ? 'f' : 'm';
console.log(`(the course as ${G === 'f' ? 'Леся' : 'Тарас'})`);

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const RAW = [];
for (let n = 1; n <= 16; n++) RAW.push((await import(`../a1/data/k${String(n).padStart(2, '0')}.js`)).default);
const CH = RAW.map((c) => heroAll(c, G));

/* ---------- the hero: both forms written, the chosen one shown ---------- */
const rawStrings = [];
const walkRaw = (v) => { if (typeof v === 'string') rawStrings.push(v); else if (Array.isArray(v)) v.forEach(walkRaw); else if (v && typeof v === 'object') Object.values(v).forEach(walkRaw); };
RAW.forEach(walkRaw);
const pairsBad = rawStrings.filter((x) => /[{}]/.test(x.replace(/\{[^{}|"\n]+\|[^{}|"\n]+\}/g, '')));
t('both forms are written as {for him|for her}: never empty, never nested', !pairsBad.length, pairsBad.slice(0, 5).join('\n'));
const heroText = []; const walkShown = (v) => { if (typeof v === 'string') heroText.push(v); else if (Array.isArray(v)) v.forEach(walkShown); else if (v && typeof v === 'object') Object.values(v).forEach(walkShown); };
CH.forEach(walkShown);
t('what is shown has no braces left', heroText.every((x) => !/[{}]/.test(x)));
t('the hero\'s name always comes in both forms (Taras/Lesia, Тарас/Леся, Тарасе/Лесю)', rawStrings.every((x) => !/Taras|Тарас|Lesia|Леся|Лесю/.test(x.replace(/\{[^{}|]+\|[^{}|]+\}/g, ''))));
t('one hero with one surname: Koval (Herr/Frau Koval, пане Ковалю/пані Коваль)', !rawStrings.some((x) => /Bondar|Бондар/.test(x)) && rawStrings.some((x) => x.includes('{Herr|Frau} Koval')) && rawStrings.some((x) => x.includes('{пане Ковалю|пані Коваль}')));
const name = G === 'f' ? 'Lesia' : 'Taras', other = G === 'f' ? /Taras|Тарас|Herr Koval|пане Ковалю|Ingenieur\b|інженер\b/ : /Lesia|Леся|Лесю|Frau Koval|пані Коваль|Ingenieurin|інженерка/;
const heroLines = CH.map((c) => c.dialog.lines.filter((l) => l[0] === name).length);
t(`the hero (${name}) speaks in the dialogue of every chapter`, heroLines.every((n) => n >= 1), heroLines.join(' '));
t('the dialogues and examples never mix in the other hero\'s forms', !CH.some((c) => [c.dialog.t, ...c.dialog.lines.flat()].some((x) => other.test(x))),
  CH.flatMap((c) => c.dialog.lines.flat().filter((x) => other.test(x))).slice(0, 4).join(' | '));
t('the form chosen: past tense, address and job agree (було в неї / був у неї, Тарасе / Лесю, Ingenieur / Ingenieurin)',
  G === 'f' ? heroText.some((x) => x.includes('я була в неї')) && heroText.some((x) => x.includes('Привіт, Лесю!')) && heroText.some((x) => x.includes('Ich bin Ingenieurin.'))
    : heroText.some((x) => x.includes('я був у неї')) && heroText.some((x) => x.includes('Привіт, Тарасе!')) && heroText.some((x) => x.includes('Ich bin Ingenieur.')));

/* ---------- chapters ---------- */
t('16 chapters numbered 1–16: A1.1 for 1–8 (with the book chapter title), A1.2 for 9–16',
  CH.every((c, i) => c.n === i + 1 && c.part === (i < 8 ? 'A1.1' : 'A1.2') && (i < 8 ? typeof c.book === 'string' && c.book.length > 3 : c.book === null) && c.title));
t('every chapter has goals, 4–6 grammar topics, phrases, a dialogue and at least 10 exercises',
  CH.every((c) => c.goals.length >= 3 && c.grammar.length >= 4 && c.grammar.length <= 6 && c.phrases.length >= 2 && c.dialog.lines.length >= 6 && c.tasks.length >= 10),
  CH.map((c) => `${c.n}: ${c.goals.length}/${c.grammar.length}/${c.phrases.length}/${c.dialog.lines.length}/${c.tasks.length}`).join(' '));
const ids = CH.flatMap((c) => c.grammar.map((g) => g.id));
t('grammar topic ids are unique across the course (links point to one topic)', new Set(ids).size === ids.length, ids.filter((x, i) => ids.indexOf(x) !== i).join(', '));
t('every topic has a known kind, a title and an explanation', CH.every((c) => c.grammar.every((g) => CATS[g.cat] && g.t && g.text && g.text.length)),
  CH.flatMap((c) => c.grammar.filter((g) => !CATS[g.cat] || !g.t || !g.text || !g.text.length).map((g) => `${c.n}:${g.id}`)).join(', '));
t('every topic kind is used', Object.keys(CATS).every((k) => CH.some((c) => c.grammar.some((g) => g.cat === k))));
t('the pronunciation topic the course links to is chapter 1 «abc»', CH[0].grammar.some((g) => g.id === 'abc'));

const tbad = [];
for (const c of CH) for (const g of c.grammar) for (const tb of g.tables || []) {
  if (!Array.isArray(tb.head) || !tb.rows || !tb.rows.length) tbad.push(`${c.n}:${g.id} empty`);
  else tb.rows.forEach((r, i) => { if (r.length !== tb.head.length) tbad.push(`${c.n}:${g.id} row ${i + 1}: ${r.length} cells, ${tb.head.length} heads`); });
}
t('every table row has as many cells as the table has heads', !tbad.length, tbad.join('\n'));
const pairs = (list) => Array.isArray(list) && list.every((p) => Array.isArray(p) && p.length === 2 && p[0] && p[1]);
t('examples and phrases are German–Ukrainian pairs', CH.every((c) => c.grammar.every((g) => !g.ex || pairs(g.ex)) && c.phrases.every((p) => p.t && pairs(p.list))));
t('dialogue lines: speaker, German, Ukrainian (an empty speaker only for a break)',
  CH.every((c) => c.dialog.t && c.dialog.lines.every((l) => l.length === 3 && (l[0] ? l[1] && l[2] : l[1] === '…'))));

// every string of a chapter: the marks open and close
const strings = [];
const walk = (v, where) => { if (typeof v === 'string') strings.push([where, v]); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}.${i}`)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${where}.${k}`); };
CH.forEach((c) => walk(c, `k${c.n}`));
const mbad = strings.filter(([, s]) => (s.split('**').length - 1) % 2 || (s.split('`').length - 1) % 2 || /<[a-z]/i.test(s));
t('**bold** and `German` marks open and close, no raw HTML', !mbad.length, mbad.slice(0, 10).map(([w, s]) => `${w}: ${s}`).join('\n'));
t('marks become HTML, the rest is escaped', md('Der **Artikel** `der Tisch` <b>') === 'Der <b>Artikel</b> <i lang="de">der Tisch</i> &lt;b&gt;');
t('Ukrainian apostrophe is the typographic one (’), not a straight quote', !strings.some(([, s]) => /[а-яіїєґ]'[а-яіїєґ]/i.test(s)), strings.filter(([, s]) => /[а-яіїєґ]'[а-яіїєґ]/i.test(s)).slice(0, 5).map(([w]) => w).join(', '));

/* ---------- exercises ---------- */
const xbad = [];
for (const c of CH) c.tasks.forEach((x, i) => {
  const w = `${c.n}:${i + 1}`;
  if (x.t === 'mc') {
    if (!Array.isArray(x.o) || x.o.length < 2 || x.o.length > 4) xbad.push(`${w}: 2–4 options`);
    else if (!(x.a >= 0 && x.a < x.o.length)) xbad.push(`${w}: the answer is not an option`);
    else if (new Set(x.o.map(norm)).size !== x.o.length) xbad.push(`${w}: two options are the same`);
  } else if (x.t === 'gap') {
    if (x.q.split('___').length !== 2) xbad.push(`${w}: one gap (___) expected`);
    if (!Array.isArray(x.a) || !x.a.length || x.a.some((a) => !norm(a))) xbad.push(`${w}: answers`);
    else if (x.a.some((a) => a.includes(' ') && a.split(' ').length > 3)) xbad.push(`${w}: an answer longer than three words`);
  } else xbad.push(`${w}: unknown type ${x.t}`);
  if (!x.q) xbad.push(`${w}: no question`);
});
t('every exercise can be solved: one gap and answers, or 2–4 different options with the right one among them', !xbad.length, xbad.join('\n'));
t('both kinds of exercise in every chapter', CH.every((c) => c.tasks.some((x) => x.t === 'mc') && c.tasks.some((x) => x.t === 'gap')));
const shown = CH.flatMap((c) => c.tasks.map((x, i) => [c, x, i]).filter(([, x]) => x.t === 'mc').map(([c, x, i]) => [x, order(c.n, i, x.o, x.a), order(c.n, i, x.o, x.a)]));
t('options are shown in a fixed order that holds every option once', shown.every(([x, o, again]) => o.slice().sort().join() === x.o.map((_, j) => j).join() && o.join() === again.join()));
const at = [0, 0, 0, 0]; shown.forEach(([x, o]) => { at[o.indexOf(x.a)]++; });
t('shown, the right option stands first, second or third about equally often', at.slice(0, 3).every((k) => k > shown.length * 0.25 && k < shown.length * 0.42), at.join(' '));
t('der, die, das keep their order', order(3, 0, ['Der', 'Die', 'Das'], 1).join() === '0,1,2');
t('a typed answer: case, ß/ss, a final full stop and spaces do not matter',
  norm(' Heißt ') === norm('heisst') && norm('Wie geht’s?') === norm("wie geht's") && norm('der  Tisch.') === 'der tisch' && norm('ihn') !== norm('ihm'));

/* ---------- the dictionary ---------- */
t('about a thousand entries, ids are their places in the list', WORDS.length >= 900 && WORDS.every((e, i) => e.id === i), WORDS.length);
const wbad = [];
for (const e of WORDS) {
  const w = `${e.ch}:${e.de}`;
  if (!KINDS[e.kind] || !e.de || !e.uk || !(e.ch >= 1 && e.ch <= 16)) wbad.push(`${w}: kind, text, translation or chapter`);
  if (e.kind === 'n') {
    if (!['der', 'die', 'das'].includes(e.art) || !e.word) wbad.push(`${w}: article and word`);
    if (!e.plOnly && !e.pl) wbad.push(`${w}: plural (or — for none)`);
    if (e.plOnly && e.art !== 'die') wbad.push(`${w}: plural-only words take die`);
    if (e.word && e.de !== `${e.art} ${e.word}` && !e.plOnly) wbad.push(`${w}: «${e.de}» is not article + word`);
    if (e.word && !/^[A-ZÄÖÜ]/.test(e.word)) wbad.push(`${w}: a noun starts with a capital`);
  }
  if (e.kind === 'v' && !e.forms) wbad.push(`${w}: verb forms`);
  if (/[<>`*]/.test(e.de + e.uk + (e.pl || '') + (e.forms || ''))) wbad.push(`${w}: marks in a dictionary entry`);
}
t('every entry has its kind, chapter and translation; nouns their article, capital and plural; verbs their forms', !wbad.length, wbad.slice(0, 20).join('\n'));
const seen = new Map(); const dup = [];
for (const e of WORDS) { const k = `${e.kind}|${e.de}|${e.uk}`; if (seen.has(k)) dup.push(e.de); seen.set(k, 1); }
t('no entry twice (the same word may stand twice with different meanings)', !dup.length, dup.join(', '));
t('every chapter has its words (at least 30)', CH.every((c) => byChapter(c.n).length >= 30), CH.map((c) => byChapter(c.n).length).join(' '));
t('what is said aloud: the entry without (Pl.) and dots', sayOf({ de: 'die Eltern (Pl.)' }) === 'die Eltern' && sayOf({ de: 'Wie … bitte?' }) === 'Wie bitte?');
const gn = gardenNouns(), poolDe = new Set(POOL.map((w) => w.de));
t('every singular noun of the course can be planted in the word garden', gn.length > 400 && gn.every((e) => poolDe.has(e.word)), gn.filter((e) => !poolDe.has(e.word)).map((e) => e.word).join(', '));
t('the garden list has no word twice', new Set(POOL.map((w) => w.de)).size === POOL.length);
t('search folding: umlauts, ß and apostrophes', fold('Tschüss') === fold('tschuss') && fold('Straße').includes('strasse') && fold('пам’ять') === fold("пам'ять"));

// the same checks once more, as Леся
if (G === 'm') {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, HERO: 'f' }, encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  for (const line of out.split('\n')) if (/^FAIL|FAILED/.test(line)) console.log('(as Леся) ' + line);
  t('every check passes for Леся too', r.status === 0, out.split('\n').filter((l) => /^FAIL/.test(l)).slice(0, 8).join('\n'));
}

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
