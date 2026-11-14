// Speech into text with Whisper on Workers AI, for the shopping list and the diary.
//
//   POST /voice  (signed initData)  audio (a recording, up to 30 s, 2 MB) → {text, items}: what was said, and the things
//                to buy read out of it («додай молоко, хліб і яйця» → Молоко, Хліб, Яйця)
//   a voice message to the bot (brief.js webhook) → the same, then into the list (or the diary: «з’їла гречку 200 грам»)
// At most VOICE_PER_DAY recordings a person a day: the free Workers AI allowance is shared with the translations.

import { berlinDay } from '../smittia/due.js';
import { noteNeurons } from './usage.js';

const MODEL = '@cf/openai/whisper-large-v3-turbo';
export const VOICE_PER_DAY = 60;
const MAX_BYTES = 2 * 1024 * 1024;

function base64(buf) {
  const bytes = new Uint8Array(buf); let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// counted before the model runs, so requests that come together cannot all slip under the limit
export async function voiceAllowed(env, id) {
  if (!env.SCANS) return true;
  const key = `vo:${id}:${berlinDay(new Date())}`, n = Number(await env.SCANS.get(key)) || 0;
  if (n >= VOICE_PER_DAY) return false;
  await env.SCANS.put(key, String(n + 1), { expirationTtl: 2 * 86400 });
  return true;
}

export async function transcribe(env, buf) {
  if (!env.AI) throw new Error('AI binding is not set');
  if (!buf.byteLength || buf.byteLength > MAX_BYTES) throw new Error('size');
  const res = await env.AI.run(MODEL, { audio: base64(buf), language: 'uk', task: 'transcribe', vad_filter: true,
    initial_prompt: 'Список покупок і їжа: молоко, хліб, яйця, гречка, сир, Quark, Skyr, Brötchen.' });
  try { await noteNeurons(env, res && res.usage); } catch { /* only for the warning */ }
  return String((res && res.text) || '').trim();
}

// «Додай, будь ласка, молоко, хліб і десяток яєць.» → ['Молоко', 'Хліб', 'Десяток яєць']
// (\b knows only Latin letters: word edges here are written out for Cyrillic)
const W = (alts) => `(?<![\\p{L}’'])(?:${alts})(?![\\p{L}’'])`;
const LEAD = new RegExp(`^(?:${W('будь ласка')}[,\\s]*)?(?:${W('додай|додайте|додати|купи|купити|купіть|треба купити|запиши|запишіть')}[,\\s:]*)?(?:${W('будь ласка')}[,\\s]*)?(?:${W('в список|у список|до списку')}[,\\s:]*)?`, 'u');
const SPLIT = new RegExp(`\\s*(?:[,;.]|${W('і|та|й|ще|а також|плюс')})\\s*`, 'u');
export function itemsOf(text) {
  const t = String(text || '').toLowerCase().replace(/[«»"“”!?]/g, '').trim().replace(LEAD, '');
  return t.split(SPLIT)
    .map((x) => x.replace(new RegExp(`^${W('будь ласка|ну|і|та')}\\s*`, 'u'), '').replace(new RegExp(`\\s*${W('будь ласка')}$`, 'u'), '').trim())
    .filter((x) => x && x.length <= 60 && !new RegExp(`^${W('все|усе|дякую|спасибі')}$`, 'u').test(x))
    .slice(0, 15)
    .map((x) => x[0].toUpperCase() + x.slice(1));
}
// Is it about food eaten, the weight or water (for the diary) rather than things to buy? → a chat command, or null
export function diaryCommand(text) {
  const t = String(text || '').toLowerCase().trim().replace(/[.!]+$/, '');
  let m = t.match(/^(?:я\s+)?(?:з[’'ʼ]?їв|з[’'ʼ]?їла|їв|їла|випив|випила)\s+(.+)$/u);
  if (m) {
    const what = m[1].replace(/(\d)\s*(?:грам(?:ів|и)?)(?![\p{L}])/gu, '$1 г').replace(/(\d)\s*(?:мілілітр(?:ів|а)?)(?![\p{L}])/gu, '$1 мл');
    const water = what.match(/^(?:(\d+(?:[.,]\d+)?)\s*(мл|л)?\s+)?(?:склянк[уи]\s+|склянок\s+)?вод[уи]$/u);
    if (water) return ('/вода ' + (water[1] ? water[1] + (water[2] ? ' ' + water[2] : '') : '')).trim();
    return '/їжа ' + what;
  }
  m = t.match(/^(?:моя\s+)?вага\s+([\d.,]+)/u);
  return m ? '/вага ' + m[1] : null;
}
