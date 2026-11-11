// The bot's word of the day: at 09:00 Xanten time, one everyday German noun with its article, translation, an example
// and the rule, plus a button into the der/die/das game. Everyone gets the same word; all words come before repeats.

import { WORDS, ruleOf, wordOfDay } from '../igry/words.js';
import { berlinDay } from '../smittia/due.js';

export const WORD_BUTTON = { text: 'Грати в артиклі', url: 'https://w2unemdhysend.github.io/d-simya/igry/?tab=art' };
const DOT = { der: '🔵', die: '🔴', das: '🟢' };

export function wordText(day, intro = 'Слово дня') {
  const w = wordOfDay(day), rule = ruleOf(w);
  return `${DOT[w[1]]} ${intro}: ${w[1]} ${w[0]} — ${w[2]}\n\n${w[5]}` + (rule ? `\n\nПравило: ${rule}` : '');
}
export function wordConfirmText(now) {
  return 'Слово дня увімкнено: щоранку о 9:00 я надішлю одне німецьке слово з артиклем, прикладом і правилом.\n\n' +
    wordText(berlinDay(now), 'Сьогоднішнє слово');
}

// Runs every 30 minutes; sends once, in the half hour from 09:00 in Xanten
export async function sendWordOfDay(env, now, broadcast) {
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const [h, m] = t.split(':').map(Number);
  if (h !== 9 || m >= 30 || !env.SCANS || !env.BOT_TOKEN) return { sent: 0, why: 'not 09:00 in Xanten' };
  const day = berlinDay(now);
  if (await env.SCANS.get('dsent:' + day)) return { sent: 0, why: 'already sent' };
  await env.SCANS.put('dsent:' + day, '1', { expirationTtl: 3 * 86400 });
  return broadcast(env, 'dsub:', wordText(day), WORD_BUTTON);
}

export { WORDS };
