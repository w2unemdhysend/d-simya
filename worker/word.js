// The bot's word of the day: from 09:00 Xanten time, one everyday German noun with its article, translation, an example
// and the rule, plus a button into the der/die/das game. Everyone gets the same word; all words come before repeats.

import { WORDS, ruleOf, wordOfDay } from '../igry/words.js';
import { berlinDay } from '../smittia/due.js';
import { button } from './config.js';
import { deliver, inWindow } from './deliver.js';

export const WORD_BUTTON = button('Грати в артиклі', 'igry/?tab=art');
const DOT = { der: '🔵', die: '🔴', das: '🟢' };

export function wordText(day, intro = 'Слово дня') {
  const w = wordOfDay(day), rule = ruleOf(w);
  return `${DOT[w[1]]} ${intro}: ${w[1]} ${w[0]} — ${w[2]}\n\n${w[5]}` + (rule ? `\n\nПравило: ${rule}` : '');
}
export function wordConfirmText(now) {
  return 'Слово дня увімкнено: щоранку о 9:00 я надішлю одне німецьке слово з артиклем, прикладом і правилом.\n\n' +
    wordText(berlinDay(now), 'Сьогоднішнє слово');
}

// Runs every 30 minutes: from 09:00 in Xanten, each subscriber once a day (missed ones until 11:59)
export async function sendWordOfDay(env, now, out) {
  if (!inWindow(now, '09:00', 180) || !env.SCANS || !env.BOT_TOKEN) return { sent: 0, why: 'not the morning in Xanten' };
  const day = berlinDay(now);
  return deliver(env, out, { job: 'word', day, prefix: 'dsub:', text: wordText(day), button: WORD_BUTTON, legacy: 'dsent:' + day });
}

export { WORDS };
