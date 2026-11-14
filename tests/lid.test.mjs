// «Leben in Deutschland»: the official catalogue, our answers and translation, the exam.
//   node tests/lid.test.mjs
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QUESTIONS, BY_ID, TOPICS, EXAM, STAND, examSet } from '../a1/lid/data.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const root = fileURLToPath(new URL('..', import.meta.url));

t('310 questions: 300 general and 10 of Nordrhein-Westfalen', QUESTIONS.length === 310 && QUESTIONS.filter((x) => x.t === 'nrw').length === 10);
t('the catalogue\'s date is known', /^\d\d\.\d\d\.\d{4}$/.test(STAND), STAND);
const bad = QUESTIONS.filter((x) => !x.q || x.o.length !== 4 || new Set(x.o).size !== 4 || !(x.a >= 0 && x.a <= 3) || !x.uk || x.ou.length !== 4 || x.ou.some((o) => !o));
t('each: a question, four different answers, the right one, the translation of all five', !bad.length, bad.map((x) => x.id).join());
t('the right answers are spread over the four places', [0, 1, 2, 3].every((i) => QUESTIONS.filter((x) => x.a === i).length > 40), [0, 1, 2, 3].map((i) => QUESTIONS.filter((x) => x.a === i).length).join());
const known = { 1: 'hier Meinungsfreiheit gilt.', 6: 'Grundgesetz', 24: '16', 72: 'Friedrich Merz', 107: '4 Jahre', 117: '5%', 152: '1933 bis 1945', 191: '1989', 266: 'um 22 Uhr', 300: 'Italien', nrw7: 'Düsseldorf.', nrw3: '5' };
t('known answers are marked right (Meinungsfreiheit, Grundgesetz, 16 Länder, Merz, 4 years, 5 %, 1933–45, 1989, 22 Uhr, Italien, Düsseldorf, 5 years)', Object.entries(known).every(([id, a]) => { const x = BY_ID.get(id); return x && x.o[x.a] === a; }), Object.entries(known).filter(([id, a]) => { const x = BY_ID.get(id); return !x || x.o[x.a] !== a; }).map(([id]) => id).join());
t('the picture questions: the ballot paper 1, the occupation zones as on the map, NRW is 3 on its map', BY_ID.get('130').a === 0 && BY_ID.get('176').o[BY_ID.get('176').a].startsWith('1=Großbritannien, 2=Sowjetunion, 3=USA') && BY_ID.get('nrw8').a === 2);
const imgs = QUESTIONS.filter((x) => x.img);
t('their pictures are there (coats of arms, flags, ballot, maps); no photographs copied', imgs.length === 7 && imgs.every((x) => existsSync(root + 'a1/lid/img/' + x.img)), imgs.map((x) => x.id + ':' + x.img).join());
t('the one photograph that matters (55) is described in the question', BY_ID.get('55').photo && /купол/.test(BY_ID.get('55').uk));
t('every question has a topic of the list', QUESTIONS.every((x) => TOPICS.some((tp) => tp.id === x.t)) && TOPICS.every((tp) => QUESTIONS.some((x) => x.t === tp.id)));
t('no question number left in the text, no page header', !QUESTIONS.some((x) => /^\d+\.\s|Teil II|Seite \d+/.test(x.q + x.o.join(' '))));
t('the Ukrainian has no German left untranslated where it should not (spot check)', BY_ID.get('3').uk.startsWith('Німеччина — правова держава') && BY_ID.get('nrw5').ou[1] === 'зелений, білий, червоний');
let r = 1;
const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
const ex = examSet(rnd);
t('the exam: 30 general questions and 3 of the land, no question twice', ex.length === 33 && ex.filter((x) => x.t === 'nrw').length === 3 && new Set(ex.map((x) => x.id)).size === 33);
t('pass marks: 17 for the Einbürgerungstest, 15 for «Leben in Deutschland», 60 minutes', EXAM.pass === 17 && EXAM.passLid === 15 && EXAM.minutes === 60);

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
