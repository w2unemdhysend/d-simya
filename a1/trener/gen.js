// The trainers of «Німецька»: endless exercises made from the course's own dictionary (a1/data/wortschatz.js) and the
// example sentences of its chapters. Each generator returns a question:
//   {key, kind, prompt, hint, options, answer, explain, say?}   or, for word order, {…, words, answer: [words]}
// `key` names what is practised (the same noun, the same verb form…), so a mistake can come back later (spaced
// repetition, see srs.js). Nothing here touches the page: the tests run it in Node.
import { WORDS } from '../data/wortschatz.js';
import { CHAPTERS } from '../data/index.js';
import { hero } from '../text.js';

// who speaks in the course's sentences ({Тарас|Леся}, «я був / я була»): the choice in the menu's settings
let GENDER = 'm';
export const setGender = (g) => { GENDER = g === 'f' ? 'f' : 'm'; };

export const pick = (list, rnd = Math.random) => list[Math.floor(rnd() * list.length)];
export function shuffle(list, rnd = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const uniq = (a) => [...new Set(a)];
const inRange = (e, range) => e.ch >= range[0] && e.ch <= range[1];

/* ---------------- verbs ---------------- */
export const PERSONS = [['ich', 'я'], ['du', 'ти'], ['er', 'він'], ['sie', 'вона'], ['wir', 'ми'], ['ihr', 'ви (кілька людей)'], ['sie', 'вони'], ['Sie', 'Ви (ввічливо)']];
const IDX = [0, 1, 2, 2, 3, 4, 5, 5];   // which of the six forms each person takes
const IRR = {
  sein: ['bin', 'bist', 'ist', 'sind', 'seid', 'sind'], haben: ['habe', 'hast', 'hat', 'haben', 'habt', 'haben'],
  werden: ['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden'], wissen: ['weiß', 'weißt', 'weiß', 'wissen', 'wisst', 'wissen'],
  können: ['kann', 'kannst', 'kann', 'können', 'könnt', 'können'], müssen: ['muss', 'musst', 'muss', 'müssen', 'müsst', 'müssen'],
  dürfen: ['darf', 'darfst', 'darf', 'dürfen', 'dürft', 'dürfen'], sollen: ['soll', 'sollst', 'soll', 'sollen', 'sollt', 'sollen'],
  wollen: ['will', 'willst', 'will', 'wollen', 'wollt', 'wollen'], mögen: ['mag', 'magst', 'mag', 'mögen', 'mögt', 'mögen'],
  möchten: ['möchte', 'möchtest', 'möchte', 'möchten', 'möchtet', 'möchten'], tun: ['tue', 'tust', 'tut', 'tun', 'tut', 'tun'],
};
// strong verbs whose stem ends in -t: the he-form has no extra -t (er hält), the du-form adds -st to it (du hältst)
const T_STEM = /(?:hält|rät|brät|gilt|tritt|ficht)$/;
const S_END = /(s|ß|z|x)$/;
// an -e- before -t and -st: after t or d (arbeitet), and after m or n that follow another consonant (atmet, öffnet,
// zeichnet), but not after l, r, m, n or a long-vowel h (lernt, kommt, kennt, wohnt)
const needsE = (stem) => {
  if (/(t|d)$/.test(stem)) return true;
  if (!/(m|n)$/.test(stem)) return false;
  const prev = stem.slice(0, -1);
  return /[^aeiouäöüy]$/.test(prev) && !/[lrmn]$/.test(prev) && !/[aeiouäöü]h$/.test(prev);
};

// A verb from the dictionary → its six present forms, the separable particle, the Perfekt; null when it does not fit
// the pattern (impersonal «es regnet», reflexive «sich waschen», two Perfekt forms)
export function verbOf(e) {
  if (!e || e.kind !== 'v' || /\s/.test(e.de)) return null;
  const m = String(e.forms || '').match(/^er (\S+)(?: (\S+))? · (hat|ist) (\S+)$/);
  if (IRR[e.de]) {
    const pf = String(e.forms || '').match(/(hat|ist) (\S+)\)?$/);
    return { inf: e.de, uk: e.uk, forms: IRR[e.de], part: '', aux: pf ? pf[1] : 'hat', pp: pf ? pf[2].replace(/\)$/, '') : '', modal: ['können', 'müssen', 'dürfen', 'sollen', 'wollen', 'mögen', 'möchten'].includes(e.de) };
  }
  if (!m) return null;
  const [, erV, part = '', aux, pp] = m;
  if (part && !e.de.startsWith(part)) return null;
  const core = part ? e.de.slice(part.length) : e.de;
  let stem;
  if (/en$/.test(core)) stem = core.slice(0, -2);
  else if (/(el|er)n$/.test(core)) stem = core.slice(0, -1);
  else return null;
  const ich = /eln$/.test(core) ? stem.slice(0, -2) + 'le' : stem + 'e';
  const weak3 = stem + (needsE(stem) ? 'et' : 't');
  const strong = erV !== weak3;
  let du;
  if (!strong) du = S_END.test(stem) ? stem + 't' : stem + (needsE(stem) ? 'est' : 'st');
  else if (T_STEM.test(erV)) du = erV + 'st';
  else { const base = erV.replace(/t$/, ''); du = S_END.test(base) ? base + 't' : base + 'st'; }
  const ihr = weak3;
  return { inf: e.de, uk: e.uk, forms: [ich, du, erV, core, ihr, core], part, aux, pp, strong };
}
export const formOf = (v, person) => v.forms[IDX[person]] + (v.part ? ' ' + v.part : '');
const AUX = { hat: IRR.haben, ist: IRR.sein };
export const perfektOf = (v, person) => `${AUX[v.aux][IDX[person]]} … ${v.pp}`;

/* ---------------- nouns and articles ---------------- */
export const G = { der: 'm', die: 'f', das: 'n' };
export const DEF = { Nom: { m: 'der', f: 'die', n: 'das', pl: 'die' }, Akk: { m: 'den', f: 'die', n: 'das', pl: 'die' }, Dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' } };
export const INDEF = { Nom: { m: 'ein', f: 'eine', n: 'ein' }, Akk: { m: 'einen', f: 'eine', n: 'ein' }, Dat: { m: 'einem', f: 'einer', n: 'einem' } };
// masculine nouns that take -n/-en outside the nominative (der Name → den Namen): left out of the case drills
const WEAK = /^(Herr|Mensch|Nachbar|Bauer|Held|Bär|Junge|Kunde|Kollege|Name|Gedanke|Glaube|Buchstabe|Friede|Wille|Affe|Löwe|Hase|Riese|Experte|Zeuge|Pate|Neffe|Bote)$|(ent|ant|ist|oge|at|soph|graf|graph|nom|ot)$/;
export function nounOf(e) {
  if (!e || e.kind !== 'n' || !e.art || e.plOnly || !e.word || /\s|…|\//.test(e.word)) return null;
  const pl = e.pl && e.pl !== '—' ? e.pl.replace(/^die /, '') : null;
  return { word: e.word, art: e.art, g: G[e.art], pl: pl && !/\s|\//.test(pl) ? pl : null, uk: e.uk, de: e.de, weak: G[e.art] === 'm' && (WEAK.test(e.word) || /e$/.test(e.word)) };
}
export const datPl = (pl) => (/[ns]$/.test(pl) ? pl : pl + 'n');

/* ---------------- adjectives ---------------- */
// [German, Ukrainian]: adjectives whose stem never changes when an ending is added (not teuer, dunkel, hoch)
export const ADJ = [['gut', 'добрий'], ['neu', 'новий'], ['alt', 'старий'], ['groß', 'великий'], ['klein', 'малий'], ['schön', 'гарний'],
  ['billig', 'дешевий'], ['warm', 'теплий'], ['kalt', 'холодний'], ['rot', 'червоний'], ['blau', 'синій'], ['grün', 'зелений'],
  ['schwarz', 'чорний'], ['weiß', 'білий'], ['lang', 'довгий'], ['kurz', 'короткий'], ['jung', 'молодий'], ['nett', 'милий'],
  ['freundlich', 'привітний'], ['interessant', 'цікавий'], ['wichtig', 'важливий'], ['frisch', 'свіжий'], ['lecker', 'смачний'], ['schnell', 'швидкий']];
// the endings: after der/die/das (weak), after ein/kein/mein (mixed), with no article (strong)
export const ENDINGS = {
  def: { Nom: { m: 'e', f: 'e', n: 'e', pl: 'en' }, Akk: { m: 'en', f: 'e', n: 'e', pl: 'en' }, Dat: { m: 'en', f: 'en', n: 'en', pl: 'en' } },
  indef: { Nom: { m: 'er', f: 'e', n: 'es', pl: 'en' }, Akk: { m: 'en', f: 'e', n: 'es', pl: 'en' }, Dat: { m: 'en', f: 'en', n: 'en', pl: 'en' } },
  none: { Nom: { m: 'er', f: 'e', n: 'es', pl: 'e' }, Akk: { m: 'en', f: 'e', n: 'es', pl: 'e' }, Dat: { m: 'em', f: 'er', n: 'em', pl: 'en' } },
};
const KEIN = { Nom: { m: 'kein', f: 'keine', n: 'kein', pl: 'keine' }, Akk: { m: 'keinen', f: 'keine', n: 'kein', pl: 'keine' }, Dat: { m: 'keinem', f: 'keiner', n: 'keinem', pl: 'keinen' } };

/* ---------------- prepositions ---------------- */
export const PREP = {
  Akk: [['für', 'для'], ['ohne', 'без'], ['durch', 'через (крізь)'], ['gegen', 'проти'], ['um', 'навколо']],
  Dat: [['mit', 'з'], ['bei', 'у, біля (когось)'], ['von', 'від'], ['zu', 'до'], ['aus', 'з (звідки)'], ['gegenüber', 'навпроти']],
  Wechsel: [['in', 'в'], ['auf', 'на'], ['an', 'біля, на (вертикально)'], ['unter', 'під'], ['über', 'над'], ['vor', 'перед'], ['hinter', 'за'], ['neben', 'поруч із'], ['zwischen', 'між']],
};
const CASE_UK = { Nom: 'називний (Nominativ)', Akk: 'знахідний (Akkusativ)', Dat: 'давальний (Dativ)' };

/* ---------------- the pools ---------------- */
let cache = null;
function pools() {
  if (cache) return cache;
  const verbs = WORDS.filter((e) => e.kind === 'v').map((e) => ({ e, v: verbOf(e) })).filter((x) => x.v);
  const nouns = WORDS.filter((e) => e.kind === 'n').map((e) => ({ e, n: nounOf(e) })).filter((x) => x.n);
  // the example sentences of the chapters: 3–9 words, plain text (no gaps, no alternatives)
  const sentences = [];
  for (const c of CHAPTERS) {
    for (const g of c.grammar || []) {
      for (const [de, uk] of g.ex || []) {
        const plain = String(de).replace(/\*\*|__|\*|_|`/g, '').replace(/\s+/g, ' ').trim();
        const words = hero(plain, 'm').split(' '), wordsF = hero(plain, 'f').split(' ');
        if (Math.max(words.length, wordsF.length) > 9 || Math.min(words.length, wordsF.length) < 3 || /[…\/()\[\]=→]|\s—\s|\d{3,}/.test(plain) || /\|/.test(plain.replace(/\{[^{}|]*\|[^{}|]*\}/g, '')) || !/[.?!]$/.test(plain)) continue;
        sentences.push({ ch: c.n, de: plain, uk: String(uk).replace(/\*\*|__|\*|_|`/g, '') });
      }
    }
  }
  cache = { verbs, nouns, sentences };
  return cache;
}
export const poolSizes = () => { const p = pools(); return { verbs: p.verbs.length, nouns: p.nouns.length, sentences: p.sentences.length }; };

function opts(answer, wrong, n = 4, rnd = Math.random) {
  const w = uniq(wrong.filter((x) => x && x !== answer));
  return shuffle([answer, ...shuffle(w, rnd).slice(0, n - 1)], rnd);
}

/* ---------------- the trainers ---------------- */
export const TRAINERS = [
  { id: 'art', icon: '🎨', uk: 'Артикль', note: 'der, die чи das' },
  { id: 'plural', icon: '👥', uk: 'Множина', note: 'die Kinder, die Bücher, die Autos' },
  { id: 'verb', icon: '🔁', uk: 'Дієслова', note: 'ich fahre, du fährst, er fährt' },
  { id: 'perfekt', icon: '⏮', uk: 'Perfekt', note: 'hat gemacht чи ist gefahren' },
  { id: 'case', icon: '🧩', uk: 'Відмінки й прийменники', note: 'mit dem, für den, in die/in der' },
  { id: 'adj', icon: '🖌', uk: 'Закінчення прикметників', note: 'der gute, ein guter, mit gutem' },
  { id: 'order', icon: '🔀', uk: 'Порядок слів', note: 'Склади речення з частин' },
  { id: 'words', icon: '📖', uk: 'Слова', note: 'Переклад з української' },
];

// One question of a trainer. range: [first chapter, last chapter]; only: a key to practise again (from srs.js)
export function question(trainer, range = [1, 32], rnd = Math.random, only = null) {
  const p = pools();
  const nouns = p.nouns.filter((x) => inRange(x.e, range)), verbs = p.verbs.filter((x) => inRange(x.e, range));
  const byKey = (list, k) => list.find((x) => x.e.de === k);
  switch (trainer) {
    case 'art': {
      const x = (only && byKey(nouns, only)) || pick(nouns, rnd), n = x.n;
      return { key: n.de, kind: 'art', prompt: `___ ${n.word}`, hint: n.uk, options: ['der', 'die', 'das'], answer: n.art,
        explain: `${n.art} ${n.word}${n.pl ? ` · множина: die ${n.pl}` : ''}`, say: n.de };
    }
    case 'plural': {
      const list = nouns.filter((x) => x.n.pl);
      const x = (only && byKey(list, only)) || pick(list, rnd), n = x.n, w = n.word;
      const uml = w.length <= 8 ? w.replace(/([^aou]*)(au|a|o|u)(?!.*[aou])/, (all, pre, v) => pre + ({ au: 'äu', a: 'ä', o: 'ö', u: 'ü' })[v]) : w;
      const e = /e$/.test(w);
      const wrong = (e ? [w + 'n', w + 's', w, uml + 'n'] : [w + 'e', w + 'en', w + 'er', w + 's', uml + 'e', uml + 'er', w]).filter((x) => !/ee$|[^e]n$/.test(x) || /[aeiouäöü]n$/.test(x));
      return { key: n.de, kind: 'plural', prompt: `${n.art} ${w} → die ___`, hint: n.uk, options: opts(n.pl, wrong, 4, rnd), answer: n.pl,
        explain: `${n.art} ${w} → die ${n.pl}` };
    }
    case 'verb': {
      const x = (only && byKey(verbs, only.split('|')[0])) || pick(verbs, rnd), v = x.v;
      const person = only && only.includes('|') ? Number(only.split('|')[1]) : Math.floor(rnd() * PERSONS.length);
      const [pron, uk] = PERSONS[person], answer = formOf(v, person);
      const wrong = uniq(v.forms.map((f) => f + (v.part ? ' ' + v.part : '')).concat(v.part ? [v.inf] : []));
      return { key: `${v.inf}|${person}`, kind: 'verb', prompt: `${pron} ___ (${v.inf})`, hint: `${uk} · ${v.uk}`, options: opts(answer, wrong, 4, rnd), answer,
        explain: `${pron} ${answer}. Усі форми: ich ${formOf(v, 0)}, du ${formOf(v, 1)}, er ${formOf(v, 2)}, wir ${formOf(v, 5)}, ihr ${formOf(v, 6)}, sie/Sie ${formOf(v, 7)}`
          + (v.strong ? '. Сильне дієслово: голосна змінюється в du й er.' : '') + (v.part ? `. Відокремлюваний префікс «${v.part}» іде в кінець.` : '') };
    }
    case 'perfekt': {
      const list = verbs.filter((x) => x.v.pp && !x.v.modal);
      const x = (only && byKey(list, only.split('|')[0])) || pick(list, rnd), v = x.v;
      const person = only && only.includes('|') ? Number(only.split('|')[1]) : Math.floor(rnd() * PERSONS.length);
      const [pron, uk] = PERSONS[person], other = v.aux === 'hat' ? 'ist' : 'hat';
      const pp2 = /en$/.test(v.pp) ? v.pp.replace(/en$/, 't') : v.pp.replace(/t$/, 'en');
      const make = (aux, pp) => `${AUX[aux][IDX[person]]} … ${pp}`;
      const answer = make(v.aux, v.pp);
      return { key: `${v.inf}|${person}`, kind: 'perfekt', prompt: `${pron} ___ (${v.inf}) — Perfekt`, hint: `${uk} · ${v.uk}`,
        options: shuffle([answer, make(other, v.pp), make(v.aux, pp2), make(other, pp2)], rnd), answer,
        explain: `${pron} ${AUX[v.aux][IDX[person]]} … ${v.pp}. ${v.aux === 'ist' ? '«sein»: рух з місця на місце або зміна стану (gehen, fahren, kommen, aufstehen, werden, bleiben, sein).' : '«haben»: більшість дієслів.'}` };
    }
    case 'case': {
      const list = nouns.filter((x) => !x.n.weak);
      const x = (only && byKey(list, only.split('|')[0])) || pick(list, rnd), n = x.n;
      const kindPick = rnd();
      if (kindPick < 0.35) {   // a Wechselpräposition: Wo? (Dativ) or Wohin? (Akkusativ)
        const [prep, puk] = pick(PREP.Wechsel, rnd), c = rnd() < 0.5 ? 'Dat' : 'Akk', answer = DEF[c][n.g];
        // in dem → im, in das → ins, an dem → am, an das → ans: asked only where the article stays apart
        const merged = (prep === 'in' || prep === 'an') && ((c === 'Dat' && n.g !== 'f') || (c === 'Akk' && n.g === 'n'));
        if (merged) return question('case', range, rnd, only);
        return { key: `${n.de}|W${c}`, kind: 'case', prompt: `${c === 'Dat' ? 'Wo?' : 'Wohin?'} — ${prep} ___ ${n.word}`, hint: `${puk} · ${n.uk}`,
          options: ['der', 'die', 'das', 'den', 'dem'], answer,
          explain: `${prep} ${answer} ${n.word}: «${c === 'Dat' ? 'Wo? (де?)' : 'Wohin? (куди?)'}» → ${CASE_UK[c]}. ${n.art} ${n.word}.` };
      }
      const c = rnd() < 0.5 ? 'Akk' : 'Dat', [prep, puk] = pick(PREP[c], rnd), indef = rnd() < 0.4;
      const table = indef ? INDEF : DEF, answer = table[c][n.g];
      const contracted = !indef && ((prep === 'bei' || prep === 'von') && n.g !== 'f') || (!indef && prep === 'zu');
      if (contracted) return question('case', range, rnd, only);   // beim, vom, zum, zur: practised in the chapters
      return { key: `${n.de}|${c}${indef ? 'i' : ''}`, kind: 'case', prompt: `${prep} ___ ${n.word}`, hint: `${puk} · ${n.uk}`,
        options: indef ? ['ein', 'eine', 'einen', 'einem', 'einer'] : ['der', 'die', 'das', 'den', 'dem'], answer,
        explain: `${prep} + ${CASE_UK[c]}: ${prep} ${answer} ${n.word} (${n.art} ${n.word}).` };
    }
    case 'adj': {
      const list = nouns.filter((x) => !x.n.weak);
      const x = (only && byKey(list, only.split('|')[0])) || pick(list, rnd), n = x.n, [adj, auk] = pick(ADJ, rnd);
      const type = pick(['def', 'indef', 'none', 'kein'], rnd), c = pick(['Nom', 'Akk', 'Dat'], rnd);
      // with no article only the plural: «gute Kinder» (a single countable thing needs an article)
      const plural = n.pl && (type === 'none' || ((type === 'def' || type === 'kein') && rnd() < 0.25));
      if (type === 'none' && !plural) return question('adj', range, rnd, only);
      const g = plural ? 'pl' : n.g, endT = type === 'kein' ? 'indef' : type;
      if (type === 'indef' && plural) return question('adj', range, rnd, only);
      const end = ENDINGS[endT][c][g];
      const art = type === 'def' ? DEF[c][g] : type === 'indef' ? INDEF[c][g] : type === 'kein' ? KEIN[c][g] : '';
      const noun = plural ? (c === 'Dat' ? datPl(n.pl) : n.pl) : n.word;
      const lead = { Nom: 'Das ist', Akk: 'Ich sehe', Dat: 'mit' }[c];
      const front = c === 'Nom' && plural ? 'Das sind' : lead;
      return { key: `${n.de}|${type}${c}${plural ? 'p' : ''}`, kind: 'adj', prompt: `${front} ${art ? art + ' ' : ''}${adj}___ ${noun}`, hint: `${auk} · ${n.uk}${plural ? ' (множина)' : ''}`,
        options: ['e', 'en', 'er', 'es', 'em'].map((x2) => '-' + x2), answer: '-' + end,
        explain: `${art ? art + ' ' : ''}${adj}${end} ${noun}: ${type === 'def' ? 'після der/die/das' : type === 'none' ? 'без артикля закінчення показує рід і відмінок' : 'після ein/kein'}, ${CASE_UK[c]}${plural ? ', множина' : ''}.` };
    }
    case 'order': {
      const list = p.sentences.filter((s) => s.ch >= range[0] && s.ch <= range[1]);
      const s = (only && list.find((x) => x.de === only)) || pick(list, rnd);
      const de = hero(s.de, GENDER), right = de.split(' ');
      let words = shuffle(right, rnd);
      for (let i = 0; i < 4 && words.join(' ') === de; i++) words = shuffle(right, rnd);
      return { key: s.de, kind: 'order', prompt: hero(s.uk, GENDER), hint: 'Склади речення', words, answer: right, explain: de, say: de };
    }
    case 'words': {
      const list = WORDS.filter((e) => inRange(e, range) && ['n', 'v', 'a'].includes(e.kind) && !/…/.test(e.de));
      const e = (only && list.find((x) => x.de === only)) || pick(list, rnd);
      const same = list.filter((x) => x.kind === e.kind && x.de !== e.de && x.uk !== e.uk);
      return { key: e.de, kind: 'words', prompt: e.uk, hint: { n: 'іменник', v: 'дієслово', a: 'прикметник, прислівник' }[e.kind], options: opts(e.de, shuffle(same, rnd).slice(0, 6).map((x) => x.de), 4, rnd), answer: e.de, explain: `${e.de} — ${e.uk}`, say: e.de };
    }
    default: throw new Error('no such trainer: ' + trainer);
  }
}
export const check = (q, given) => (q.kind === 'order' ? Array.isArray(given) && given.join(' ') === q.answer.join(' ') : given === q.answer);
