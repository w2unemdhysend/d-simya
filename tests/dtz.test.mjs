// DTZ · B1: the practice material in the exam's formats, its recordings, and the AI letter check's parsing.
//   node tests/dtz.test.mjs
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PARTS, RESULT } from '../a1/dtz/exam.js';
import { LESEN } from '../a1/dtz/lesen.js';
import { HOEREN } from '../a1/dtz/hoeren.js';
import { BRIEF, SCHREIBEN } from '../a1/dtz/schreiben.js';
import { SPRECHEN } from '../a1/dtz/sprechen.js';
import { CLIPS } from '../a1/dtz/audio/index.js';
import { parseLetter, letterPrompt, SCENARIOS, prompt } from '../worker/talk.js';
import { hero } from '../a1/text.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };
const root = fileURLToPath(new URL('..', import.meta.url));

t('the exam: listening 20 and reading 25 items (45 together), writing 30 minutes, speaking 3 parts', PARTS.find((p) => p.id === 'hoeren').items === 20 && PARTS.find((p) => p.id === 'lesen').items === 25 && PARTS.find((p) => p.id === 'schreiben').min === 30 && PARTS.find((p) => p.id === 'sprechen').parts.length === 3);
t('the pass marks as in the handbook: 20/33 of 45, 15 of 20, 75 of 100', RESULT.join(' ').includes('від 20') && RESULT.join(' ').includes('від 33') && RESULT.join(' ').includes('від 15') && RESULT.join(' ').includes('від 75'));
const items = HOEREN.reduce((n, h) => n + (h.teil === 4 ? h.people.length : h.tasks.length), 0);
t('listening: a whole test of 20 items in four parts (4, 5, 8, 3)', items === 20 && [1, 2, 3, 4].map((p) => HOEREN.filter((h) => h.teil === p).reduce((n, h) => n + (h.teil === 4 ? h.people.length : h.tasks.length), 0)).join() === '4,5,8,3');
t('…every recording is there and not empty', HOEREN.every((h) => (h.teil === 4 ? h.people.every((_, i) => CLIPS[`${h.id}-${i + 1}`]) : CLIPS[h.id])) && Object.values(CLIPS).every((f) => existsSync(root + 'a1/dtz/audio/' + f) && statSync(root + 'a1/dtz/audio/' + f).size > 20000));
t('…weather and traffic are among the radio texts, as in the exam', HOEREN.filter((h) => h.teil === 2).some((h) => /Wetter/.test(h.lines[0][1])) && HOEREN.filter((h) => h.teil === 2).some((h) => /Verkehr/.test(h.lines[0][1])));
t('…part 3: two voices, richtig/falsch then a choice of three', HOEREN.filter((h) => h.teil === 3).every((h) => new Set(h.lines.map((l) => l[0])).size === 2 && h.tasks[0].kind === 'rf' && h.tasks[1].o.length === 3));
const solvable = (x) => (x.tasks || x.gaps).every((q) => (x.teil === 2 ? x.ads.some((a) => a.k === q.a) || q.a === 'x' : q.kind === 'rf' ? [0, 1].includes(q.a) : q.o && q.o.length === 3 && q.a >= 0 && q.a < 3));
t('reading: all five parts, every task solvable, a glossary each', [1, 2, 3, 4, 5].every((p) => LESEN.some((x) => x.teil === p)) && LESEN.every((x) => solvable(x) && x.glossary.length >= 3), LESEN.filter((x) => !solvable(x)).map((x) => x.id).join());
t('…part 1 has a «nothing fits» option, part 2 a situation without an ad (x), part 5 six gaps marked in the text', LESEN.filter((x) => x.teil === 1).every((x) => x.tasks.some((q) => q.a === 2)) && LESEN.filter((x) => x.teil === 2).every((x) => x.tasks.some((q) => q.a === 'x')) && LESEN.filter((x) => x.teil === 5).every((x) => x.gaps.length === 6 && (x.text.match(/\{\d\}/g) || []).length === 6));
t('writing: every task has a situation, four points and a model letter with greeting and closing', SCHREIBEN.every((s) => s.situation && s.points.length === 4 && /^(Betreff|Liebe|Sehr geehrte)/m.test(s.model) && /Grüße/.test(s.model)) && BRIEF.parts.length === 6);
t('…the models sign with the hero\'s name in both forms', SCHREIBEN.every((s) => s.model.includes('{Taras Schewtschenko|Lessja Ukrajinka}')) && hero(SCHREIBEN[0].model, 'f').endsWith('Lessja Ukrajinka'));
t('speaking: three parts, models and phrases; part 3 dialogues alternate A and B', SPRECHEN.teil1.model.length >= 5 && SPRECHEN.teil2.length >= 3 && SPRECHEN.teil3.every((x) => x.model.every((l, i) => l[0] === (i % 2 ? 'B' : 'A'))));
t('the AI: a partner for part 3 with the task in its instructions', SCENARIOS.planen && prompt('planen', 'b1', 'Eine Feier planen').includes('Eine Feier planen'));
t('the AI letter check: four points, content 0–5, level, corrected letter, notes', JSON.stringify(parseLetter('```json\n{"covered":[true,false,true,true],"content":7,"level":"B1","corrected":"Sehr geehrte Frau Krüger, …","notes":["Пропущено пункт 2.","x"]}\n```')) === JSON.stringify({ covered: [true, false, true, true], content: 5, level: 'B1', corrected: 'Sehr geehrte Frau Krüger, …', notes: ['Пропущено пункт 2.', 'x'] }));
t('…an answer without four points or a corrected letter is not used', parseLetter('{"covered":[true],"corrected":"x"}') === null && parseLetter('{"covered":[true,true,true,true],"corrected":""}') === null);
t('…the task goes into the examiner\'s instructions', letterPrompt('Termin absagen').includes('Termin absagen'));

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
