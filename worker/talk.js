// «Розмова»: practising German with the AI in an everyday situation (the doctor's reception, the Bürgerbüro, a shop,
// a neighbour, the station, or free talk). The person writes a line; the model answers in simple German as the other
// side, and says in Ukrainian whether the line was right, with the corrected sentence and a short why.
//
//   POST /talk  (signed initData) scenario, level a1|a2|b1, history (JSON [{r: 'u'|'a', t}], the last 12), text
//   → {ok, reply, reply_uk, ok_line, corrected, note, left}
// Each person has TALK_PER_DAY lines a day: the free Workers AI allowance is shared by everyone.
import { berlinDay } from '../smittia/due.js';
import { noteNeurons } from './usage.js';

export const MODEL = '@cf/google/gemma-4-26b-a4b-it';
export const TALK_PER_DAY = 60;
const MAX_LINE = 300, MAX_TURNS = 12;
export const SCENARIOS = {
  arzt: 'You are the receptionist at a family doctor\'s practice (Hausarztpraxis) in Xanten. The user is a patient who wants an appointment or describes symptoms.',
  amt: 'You are a clerk at the Bürgerbüro of the town hall in Xanten. The user wants to register an address, get a document or ask a question.',
  laden: 'You are a shop assistant in a bakery or supermarket in Xanten. The user is a customer.',
  nachbar: 'You are a friendly German neighbour in Xanten meeting the user in the stairwell. Small talk about family, work, weather, the town.',
  bahn: 'You are an employee at the ticket counter of a train station (Wesel). The user wants a ticket or information about a connection.',
  frei: 'You are a friendly German conversation partner. Talk about whatever the user brings up.',
};
const LEVEL = {
  a1: 'Use only very simple A1 German: short main clauses, present tense, everyday words.',
  a2: 'Use simple A2 German: short sentences, present and Perfekt, common subordinate clauses with weil/dass.',
  b1: 'Use clear B1 German: natural but not complicated sentences.',
};

export function prompt(scenario, level) {
  return [
    SCENARIOS[scenario] || SCENARIOS.frei,
    'The user is a Ukrainian adult learning German and practising a real-life conversation with you.',
    LEVEL[level] || LEVEL.a1,
    'Stay in your role. Answer with one or two short sentences (at most 25 words) and keep the conversation going, usually with a question.',
    'Check the user\'s last line for German mistakes (grammar, word order, articles, verb forms, spelling; ignore missing capital letters at the start and missing final punctuation).',
    'Reply with JSON only, no other text: {"reply": "<your German answer>", "reply_uk": "<its Ukrainian translation>", "ok": <true if the user\'s line had no real mistake>, "corrected": "<the user\'s line corrected, natural German; the same line if it was right>", "note": "<if not ok: a short explanation in Ukrainian (at most 2 sentences) of what was wrong and the rule; else empty>"}',
    'If the user writes in Ukrainian or Russian, set ok to false, put the German version in "corrected" and say in "note" (in Ukrainian) how to say it in German.',
  ].join('\n');
}

// The model's answer → the fields, or null if it is not usable
export function parse(text) {
  const s = String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '');
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let o;
  try { o = JSON.parse(m[0]); } catch { return null; }
  const str = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
  const reply = str(o.reply, 400);
  if (!reply) return null;
  return { reply, reply_uk: str(o.reply_uk, 400), ok_line: o.ok === true || o.ok === 'true', corrected: str(o.corrected, 400), note: str(o.note, 500) };
}

export function historyOf(raw) {
  let h;
  try { h = JSON.parse(String(raw || '[]')); } catch { return []; }
  if (!Array.isArray(h)) return [];
  return h.filter((x) => x && (x.r === 'u' || x.r === 'a') && typeof x.t === 'string').slice(-MAX_TURNS)
    .map((x) => ({ role: x.r === 'u' ? 'user' : 'assistant', content: x.t.slice(0, MAX_LINE) }));
}

const COUNT = new Map();   // lines counted per person and day in this Worker instance (KV is only eventually consistent)
export async function talk(signed, env, reply) {
  if (!env.AI) return reply(500, { ok: false, error: 'AI binding is not set' });
  const f = signed.form, text = String(f.get('text') || '').replace(/\s+/g, ' ').trim();
  const scenario = SCENARIOS[f.get('scenario')] ? String(f.get('scenario')) : 'frei', level = LEVEL[f.get('level')] ? String(f.get('level')) : 'a1';
  if (!text) return reply(400, { ok: false, error: 'no text' });
  if (text.length > MAX_LINE) return reply(413, { ok: false, error: 'text too long' });
  const key = `talk:${signed.user.id}:${berlinDay(new Date())}`;
  const used = Math.max(env.SCANS ? Number(await env.SCANS.get(key)) || 0 : 0, COUNT.get(key) || 0);
  if (used >= TALK_PER_DAY) return reply(429, { ok: false, error: 'daily_limit' });
  if (COUNT.size > 500) COUNT.clear();
  COUNT.set(key, used + 1);
  if (env.SCANS) await env.SCANS.put(key, String(used + 1), { expirationTtl: 2 * 86400 });
  let res;
  try {
    res = await env.AI.run(MODEL, {
      messages: [{ role: 'system', content: prompt(scenario, level) }, ...historyOf(f.get('history')), { role: 'user', content: text }],
      max_completion_tokens: 600, temperature: 0.5, chat_template_kwargs: { enable_thinking: false },
    });
  } catch (e) {
    COUNT.set(key, used); if (env.SCANS) await env.SCANS.put(key, String(used), { expirationTtl: 2 * 86400 });
    const msg = String(e && e.message);
    console.log('talk failed', msg.slice(0, 300));
    return reply(/4006|neurons|allocation/i.test(msg) ? 429 : 502, { ok: false, error: /4006|neurons|allocation/i.test(msg) ? 'ai_quota' : 'ai_failed' });
  }
  try { await noteNeurons(env, res && res.usage); } catch { /* only for the warning */ }
  const choice = res && res.choices && res.choices[0], msg = choice && choice.message;
  let t = (msg && msg.content) || (res && res.response) || '';
  if (Array.isArray(t)) t = t.map((p) => (p && p.text) || '').join('');
  const out = parse(t);
  if (!out) return reply(502, { ok: false, error: 'ai_empty' });
  return reply(200, { ok: true, ...out, left: TALK_PER_DAY - used - 1 });
}
