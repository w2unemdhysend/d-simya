// "Сад слів": every German noun the games use, in one list. Its order only ever grows at the end: the garden keeps
// words by their place in it. A word: { de, art, uk, emoji? }.
import { WORDS } from '../words.js';
import { THEMES } from './memory.js';

const pool = WORDS.map((w) => ({ de: w[0], art: w[1], uk: w[2] }));
for (const t of THEMES) for (const [de, art, uk, emoji] of t.words) {
  const have = pool.find((w) => w.de === de);
  if (have) { if (!have.emoji) have.emoji = emoji; } else pool.push({ de, art, uk, emoji });
}
export const POOL = pool;
export const say = (w) => `${w.art} ${w.de}`;
// days to the next watering, by how well a word is known (box 1 just planted … 6 in full bloom)
export const INTERVAL = [0, 1, 2, 4, 8, 16, 32];
export const MAX_BOX = 6;
