// The questions of «Leben in Deutschland» as the page uses them: the official German text (de.js) with our right
// answers and Ukrainian translation (uk1–uk3.js). Also used by tests/lid.test.mjs.
import { DE, STAND } from './de.js';
import uk1 from './uk1.js';
import uk2 from './uk2.js';
import uk3 from './uk3.js';

const UK = { ...uk1, ...uk2, ...uk3 };
export { STAND };
// [{id, q, o: [4], a: 0–3, uk, ou: [4], t, img?, photo?}]
export const QUESTIONS = DE.map((x) => {
  const u = UK[x.id];
  if (!u) throw new Error('Leben in Deutschland: no translation for ' + x.id);
  return { ...x, a: u[0] - 1, uk: u[1], ou: u[2] };
});
export const BY_ID = new Map(QUESTIONS.map((x) => [String(x.id), x]));
export const TOPICS = [
  { id: 'staat', uk: 'Держава й демократія', note: 'Основний закон, вибори, Бундестаг, уряд, партії' },
  { id: 'recht', uk: 'Право й суди', note: 'суди, судді, поліція, адвокат' },
  { id: 'geschichte', uk: 'Історія', note: 'нацизм, поділ Німеччини, НДР, возз’єднання' },
  { id: 'europa', uk: 'Європа', note: 'ЄС, сусідні країни, євро' },
  { id: 'leben', uk: 'Життя в суспільстві', note: 'сім’я, школа, робота, права, свята' },
  { id: 'juden', uk: 'Єврейське життя й антисемітизм', note: 'історія, громади, відповідальність' },
  { id: 'nrw', uk: 'Північний Рейн — Вестфалія', note: 'питання про нашу землю' },
];
// The exam: 30 of the 300 general questions and 3 of the 10 of the land; 60 minutes. 17 right: the
// Einbürgerungstest is passed; 15 right: the certificate «Leben in Deutschland» (the course's final test).
export const EXAM = { general: 30, land: 3, minutes: 60, pass: 17, passLid: 15 };
export function examSet(rnd = Math.random) {
  const pickN = (list, n) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
  return [...pickN(QUESTIONS.filter((x) => x.t !== 'nrw'), EXAM.general), ...pickN(QUESTIONS.filter((x) => x.t === 'nrw'), EXAM.land)];
}
