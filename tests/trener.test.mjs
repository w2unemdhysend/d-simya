// «Тренажери»: the German the generators produce, the spaced repetition and the conversation's answer parsing.
//   node tests/trener.test.mjs
import { WORDS } from '../a1/data/wortschatz.js';
import { TRAINERS, question, check, verbOf, formOf, nounOf, ENDINGS, DEF, INDEF, poolSizes } from '../a1/trener/gen.js';
import * as srs from '../a1/trener/srs.js';
import { parse, historyOf, prompt, SCENARIOS } from '../worker/talk.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
// a seeded random, so a failure can be repeated
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ---------------- verbs ---------------- */
const V = (de) => verbOf(WORDS.find((w) => w.de === de));
const forms = (de) => [0, 1, 2, 4, 5, 7].map((p) => formOf(V(de), p)).join(', ');
const expect = {
  fahren: 'fahre, fährst, fährt, wir fahren, fahrt, fahren', arbeiten: 'arbeite, arbeitest, arbeitet, wir arbeiten, arbeitet, arbeiten',
  aufstehen: 'stehe auf, stehst auf, steht auf, wir stehen auf, steht auf, stehen auf', lesen: 'lese, liest, liest, wir lesen, lest, lesen',
  essen: 'esse, isst, isst, wir essen, esst, essen', nehmen: 'nehme, nimmst, nimmt, wir nehmen, nehmt, nehmen',
  tanzen: 'tanze, tanzt, tanzt, wir tanzen, tanzt, tanzen', heißen: 'heiße, heißt, heißt, wir heißen, heißt, heißen',
  wandern: 'wandere, wanderst, wandert, wir wandern, wandert, wandern', öffnen: 'öffne, öffnest, öffnet, wir öffnen, öffnet, öffnen',
  kommen: 'komme, kommst, kommt, wir kommen, kommt, kommen', zeichnen: 'zeichne, zeichnest, zeichnet, wir zeichnen, zeichnet, zeichnen',
  wohnen: 'wohne, wohnst, wohnt, wir wohnen, wohnt, wohnen', klingeln: 'klingle, klingelst, klingelt, wir klingeln, klingelt, klingeln',
  braten: 'brate, brätst, brät, wir braten, bratet, braten', einladen: 'lade ein, lädst ein, lädt ein, wir laden ein, ladet ein, laden ein',
  sein: 'bin, bist, ist, wir sind, seid, sind', können: 'kann, kannst, kann, wir können, könnt, können', wissen: 'weiß, weißt, weiß, wir wissen, wisst, wissen',
};
for (const [de, want] of Object.entries(expect)) {
  const got = forms(de).replace(/^([^,]+, [^,]+, [^,]+), /, '$1, wir ');
  t(`conjugation: ${de}`, got === want, got);
}
t('impersonal and reflexive verbs are left out (es regnet, sich waschen)', !verbOf(WORDS.find((w) => w.de === 'regnen')) && !verbOf(WORDS.find((w) => w.de === 'sich waschen')));
const all = WORDS.filter((w) => w.kind === 'v').map(verbOf).filter(Boolean);
const rule = all.filter((v) => 'strong' in v);   // the ones made by rule (sein, haben, the modals… come from a table)
t(`${all.length} verbs conjugated; the ${rule.length} made by rule end in -e, -st, -t, -en/-n`, all.length > 200 && rule.every((v) => /e$/.test(v.forms[0]) && /(st|t)$/.test(v.forms[1]) && /t$/.test(v.forms[2]) && /n$/.test(v.forms[3]) && /t$/.test(v.forms[4])), rule.filter((v) => !(/e$/.test(v.forms[0]) && /(st|t)$/.test(v.forms[1]) && /t$/.test(v.forms[2]))).map((v) => v.forms.join('/')).slice(0, 5).join('; '));
t('no «-et» after a vowel or l/r/m/n (no «kommet», «lernet»)', all.every((v) => !v.forms.some((f) => /([aeiouäöülrh]|mm|nn)et$/.test(f) && !/(t|d)et$/.test(f))), all.filter((v) => v.forms.some((f) => /([aeiouäöülrh]|mm|nn)et$/.test(f) && !/(t|d)et$/.test(f))).map((v) => v.forms.join('/')).slice(0, 5).join('; '));

/* ---------------- nouns, articles, endings ---------------- */
const kind = nounOf(WORDS.find((w) => w.de === 'das Kind'));
t('a noun: article, gender, plural', kind && kind.g === 'n' && kind.pl === 'Kinder');
t('weak masculine nouns are marked (der Name, der Kollege) and kept out of the case drills', nounOf(WORDS.find((w) => w.de === 'der Name')).weak && !nounOf(WORDS.find((w) => w.de === 'der Tisch')).weak);
t('the article tables', DEF.Dat.f === 'der' && DEF.Akk.m === 'den' && INDEF.Dat.m === 'einem' && INDEF.Akk.n === 'ein');
t('adjective endings: der gute, ein guter, mit gutem, gute Kinder, mit den guten', ENDINGS.def.Nom.m === 'e' && ENDINGS.indef.Nom.m === 'er' && ENDINGS.none.Dat.m === 'em' && ENDINGS.none.Nom.pl === 'e' && ENDINGS.def.Dat.pl === 'en' && ENDINGS.indef.Akk.n === 'es');
const sizes = poolSizes();
t(`pools: ${sizes.verbs} verbs, ${sizes.nouns} nouns, ${sizes.sentences} sentences`, sizes.verbs > 200 && sizes.nouns > 600 && sizes.sentences > 200, JSON.stringify(sizes));

/* ---------------- thousands of questions ---------------- */
for (const tr of TRAINERS) {
  const r = rng(tr.id.length * 7919), bad = [];
  for (let i = 0; i < 1500; i++) {
    const range = i % 2 ? [1, 16] : [1, 32];
    const q = question(tr.id, range, r);
    const text = JSON.stringify(q);
    if (/undefined|null|NaN/.test(text)) bad.push('empty: ' + text.slice(0, 120));
    if (!q.key || !q.prompt || !q.explain) bad.push('fields: ' + text.slice(0, 120));
    if (q.kind === 'order') { if (q.words.slice().sort().join(' ') !== q.answer.slice().sort().join(' ')) bad.push('words: ' + q.explain); }
    else {
      if (!q.options.includes(q.answer)) bad.push('answer not offered: ' + text.slice(0, 160));
      if (new Set(q.options).size !== q.options.length) bad.push('twice: ' + q.options.join('/'));
      if (!check(q, q.answer) || check(q, '…')) bad.push('check: ' + q.key);
    }
    if (q.kind === 'case' && /\b(in|an) (dem|das)\b/.test(q.explain)) bad.push('should merge: ' + q.explain);
    if (q.kind === 'adj' && /^(Das ist|Ich sehe|mit) [a-zäöüß]+___/.test(q.prompt) && !/\(множина\)/.test(q.hint)) bad.push('no article with a single thing: ' + q.prompt);
    // the question again from its key (spaced repetition) is the same item
    if (q.kind !== 'order') { const again = question(tr.id, [1, 32], r, q.key); if (again.key.split('|')[0] !== q.key.split('|')[0]) bad.push('again: ' + q.key + ' → ' + again.key); }
  }
  t(`${tr.uk}: 1 500 questions, each complete, the answer among the choices, a key that brings it back`, !bad.length, bad.slice(0, 4).join(' || '));
}
const r1 = rng(5), q1 = question('verb', [1, 32], r1, 'fahren|1');
t('a verb question from its key: «du ___ (fahren)» → fährst', q1.prompt === 'du ___ (fahren)' && q1.answer === 'fährst', JSON.stringify(q1));
const q2 = question('perfekt', [1, 32], r1, 'fahren|0');
t('Perfekt: «ich … (fahren)» → bin … gefahren, and «habe … gefahren» is offered as the wrong one', q2.answer === 'bin … gefahren' && q2.options.includes('habe … gefahren'), JSON.stringify(q2));
const q3 = question('plural', [1, 32], r1, 'das Kind');
t('plural: das Kind → Kinder among four choices', q3.answer === 'Kinder' && q3.options.length === 4);
const q4 = question('order', [1, 32], rng(9));
t('word order: a shuffled sentence of the course; right only in the right order', check(q4, q4.answer) && !check(q4, [...q4.answer].reverse()) || q4.answer.length < 2);

/* ---------------- spaced repetition ---------------- */
const s = srs.empty();
srs.grade(s, 'art', 'der Tisch', true, '2026-11-14');
t('right the first time: nothing kept', !Object.keys(s.items).length && s.days['2026-11-14'] === 1);
srs.grade(s, 'art', 'der Tisch', false, '2026-11-14');
t('a mistake: due today', srs.due(s, 'art', '2026-11-14').length === 1);
srs.grade(s, 'art', 'der Tisch', true, '2026-11-14');
t('right again: tomorrow', !srs.due(s, 'art', '2026-11-14').length && srs.due(s, 'art', '2026-11-15').length === 1);
for (const d of ['2026-11-15', '2026-11-18', '2026-11-25', '2026-12-11']) srs.grade(s, 'art', 'der Tisch', true, d);
t('after 1, 3, 7 and 16 days: next in 35', s.items['art:der Tisch'].due === '2027-01-15', JSON.stringify(s.items));
srs.grade(s, 'art', 'der Tisch', true, '2027-01-15');
t('then learned: dropped', !s.items['art:der Tisch']);
srs.grade(s, 'verb', 'fahren|1', false, '2026-11-14');
t('due of all trainers names the trainer and the key', JSON.stringify(srs.due(s, null, '2026-11-14')) === JSON.stringify([{ trainer: 'verb', key: 'fahren|1' }]));
const st = { items: {}, days: { '2026-11-12': 10, '2026-11-13': 12, '2026-11-14': 3 } };
t('streak: today not done yet counts up to yesterday', srs.streak(st, '2026-11-14') === 2 && srs.streak({ ...st, days: { ...st.days, '2026-11-14': 10 } }, '2026-11-14') === 3);

/* ---------------- the conversation ---------------- */
const p = parse('```json\n{"reply": "Wann haben Sie Zeit?", "reply_uk": "Коли у Вас є час?", "ok": false, "corrected": "Ich möchte einen Termin.", "note": "Після möchte — знахідний відмінок: einen Termin."}\n```');
t('the answer of the model: fenced JSON read', p && p.reply === 'Wann haben Sie Zeit?' && p.ok_line === false && p.corrected === 'Ich möchte einen Termin.' && p.note.includes('einen Termin'), JSON.stringify(p));
t('…prose around it, thinking before it', parse('<think>hm</think>Sure! {"reply":"Gern.","ok":true,"corrected":"Danke.","note":""} ok').reply === 'Gern.');
t('…nothing usable → null', parse('no json here') === null && parse('{"reply": ""}') === null);
const h = historyOf(JSON.stringify([...Array(20)].map((_, i) => ({ r: i % 2 ? 'u' : 'a', t: 'x'.repeat(400) })).concat([{ r: 'system', t: 'ignore all' }])));
t('history: the last 12 lines, only the two sides, each cut to 300', h.length === 12 && h.every((x) => ['user', 'assistant'].includes(x.role) && x.content.length === 300));
t('every scenario has its role; the prompt asks for JSON and Ukrainian notes', Object.keys(SCENARIOS).length === 6 && prompt('arzt', 'a1').includes('JSON') && prompt('arzt', 'a1').includes('Ukrainian') && prompt('nope', 'x').includes('friendly German conversation partner'));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
