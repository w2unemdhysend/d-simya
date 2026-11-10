/**
 * send-scan: the server half of the D-SIM'YA Mini Apps. Cloudflare Worker, free plan.
 *
 *   POST /                 PDF → sent to the user's own chat with the bot
 *   POST /handoff          scanned pages → kept 10 minutes under a random id, so the scanner
 *                          opened in the phone's browser can pick them up (Telegram on Android
 *                          keeps its data apart from the browser and cannot save files)
 *   GET  /handoff/<id>     {n: number of pages}
 *   GET  /handoff/<id>/<i> page i as JPEG
 *   DELETE /handoff/<id>   the browser removes the pages once it has them
 *   POST /reminders        waste-collection reminders: action=on|off|status for the signed-in user
 *   POST /translate        text of one scanned page (recognised on the phone) → its translation,
 *                          by Gemma 4 on Workers AI (free daily allowance)
 *   GET  /translate/check  translates one fixed sentence: shows the model answers (no sign-in, cached 1 h)
 *   cron, daily            at 18:00 Xanten time: tells subscribers which bins go out tomorrow
 *
 * Settings (Cloudflare → Worker → Settings):
 *   BOT_TOKEN       secret, the token from @BotFather            (required)
 *   SCANS           KV namespace binding                          (required for /handoff and reminders)
 *   AI              Workers AI binding                            (required for /translate)
 *   ALLOWED_ORIGIN  text, defaults to https://w2unemdhysend.github.io
 *
 * Safety:
 *   - All POSTs must carry Telegram's signed initData; it is checked with HMAC-SHA256
 *     against BOT_TOKEN, so only people who opened the Mini App inside Telegram can use them.
 *   - A PDF always goes to the user who sent it (user.id from the signed data), never elsewhere.
 *   - Handed-off pages are only JPEGs, live at most 10 minutes, and their id is a random UUID.
 *   - The bot token never leaves the Worker.
 */

import cal from '../smittia/kalender.json' with { type: 'json' };
import { BINS, binsOn, berlinDay } from '../smittia/due.js';

const MAX_BYTES = 45 * 1024 * 1024;        // Bot API upload limit is 50 MB
const MAX_AGE_SECONDS = 24 * 60 * 60;      // initData older than a day is refused
const HANDOFF_TTL = 600;                   // seconds the pages wait for the browser
const MAX_PAGES = 40;
const MAX_META = 2 * 1024 * 1024;          // texts and translations sent along with handed-off pages

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || 'https://w2unemdhysend.github.io';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const reply = (status, body) => new Response(JSON.stringify(body), {
      status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!env.BOT_TOKEN) return reply(500, { ok: false, error: 'BOT_TOKEN is not set' });
    const path = new URL(request.url).pathname;
    const hand = path.match(/^\/handoff(?:\/([0-9a-f-]{36})(?:\/(\d{1,2}))?)?\/?$/);
    if (hand) return handoff(request, env, hand[1], hand[2], reply, cors);
    if (path === '/reminders') return reminders(request, env, reply);
    if (path === '/translate' || path === '/translate/check') return translate(request, env, reply, path);
    if (path !== '/') return reply(404, { ok: false, error: 'not found' });
    if (request.method !== 'POST') return reply(405, { ok: false, error: 'POST only' });

    const signed = await readSigned(request, env, reply);
    if (signed instanceof Response) return signed;
    const { form, user } = signed;
    const file = form.get('file');
    const caption = String(form.get('caption') || '').slice(0, 200);
    if (!file || typeof file === 'string') return reply(400, { ok: false, error: 'no file' });
    if (file.size > MAX_BYTES) return reply(413, { ok: false, error: 'file too large' });

    const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;   // %PDF
    if (!isPdf) return reply(415, { ok: false, error: 'only PDF is accepted' });

    const name = safeName(file.name || 'scan.pdf');
    const tg = new FormData();
    tg.append('chat_id', String(user.id));
    tg.append('document', new File([file], name, { type: 'application/pdf' }));
    if (caption) tg.append('caption', caption);

    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, { method: 'POST', body: tg });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok) return reply(502, { ok: false, error: data.description || 'Telegram refused the file' });
    return reply(200, { ok: true });
  },

  // Cron runs at 16:00 and 17:00 UTC; one of them is 18:00 in Xanten, winter or summer time.
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(sendReminders(env, new Date(controller.scheduledTime)));
  },
};

/* ---------------- waste-collection reminders ---------------- */
const SUB = 'sub:';
const PAGE_URL = 'https://w2unemdhysend.github.io/d-simya/smittia/';

async function reminders(request, env, reply) {
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'POST only' });
  if (!env.SCANS) return reply(500, { ok: false, error: 'KV binding SCANS is not set' });
  const signed = await readSigned(request, env, reply);
  if (signed instanceof Response) return signed;
  const key = SUB + signed.user.id, action = signed.form.get('action');
  if (action === 'on') {
    // Confirm in the chat right away: it proves the bot may write to this person (they must have started it)
    const res = await tgSend(env, signed.user.id, confirmText(new Date()));
    if (res.status === 403) return reply(200, { ok: false, on: false, error: 'bot_blocked' });
    await env.SCANS.put(key, JSON.stringify({ id: signed.user.id, name: String(signed.user.first_name || '').slice(0, 40) }));
    return reply(200, { ok: true, on: true, confirmed: res.ok });
  }
  if (action === 'off') await env.SCANS.delete(key);
  else if (action !== 'status') return reply(400, { ok: false, error: 'action: on, off or status' });
  return reply(200, { ok: true, on: (await env.SCANS.get(key)) !== null });
}

function tgSend(env, chatId, text) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: { inline_keyboard: [[{ text: 'Розклад', web_app: { url: PAGE_URL } }]] } }),
  });
}

function confirmText(now) {
  for (let i = 1; i <= 60; i++) {
    const day = berlinDay(now, i), bins = binsOn(cal, day);
    if (!bins.length) continue;
    const date = new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
    return `Нагадування про сміття увімкнено. Я напишу о 18:00 напередодні кожного вивозу.\n\nНайближчий вивіз: ${date}, ${bins.map(({ bin }) => `${BINS[bin].dot} ${BINS[bin].uk}`).join(', ')}.`;
  }
  return 'Нагадування про сміття увімкнено. Дат у календарі поки немає: нагадування почнуться, щойно додамо календар на наступний рік.';
}

function reminderText(day, bins) {
  const date = new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const lines = bins.map(({ bin, only14 }) => `${BINS[bin].dot} ${BINS[bin].uk} (${BINS[bin].de})${only14 ? ': лише баки, які вивозять кожні 2 тижні' : ''}`);
  return `Завтра, ${date}, вивозять:\n${lines.join('\n')}\n\nВистав баки сьогодні ввечері або завтра рано вранці.`;
}

async function sendReminders(env, now) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(now));
  if (hour !== 18 || !env.SCANS || !env.BOT_TOKEN) return { sent: 0, why: 'not 18:00 in Xanten' };
  const day = berlinDay(now, 1), bins = binsOn(cal, day);
  if (!bins.length) return { sent: 0, why: 'nothing tomorrow' };
  if (await env.SCANS.get('sent:' + day)) return { sent: 0, why: 'already sent' };
  await env.SCANS.put('sent:' + day, '1', { expirationTtl: 3 * 86400 });

  const text = reminderText(day, bins);
  let sent = 0, cursor;
  do {
    const page = await env.SCANS.list({ prefix: SUB, cursor });
    for (const { name } of page.keys) {
      const res = await tgSend(env, Number(name.slice(SUB.length)), text);
      if (res.ok) sent++;
      else if (res.status === 403) await env.SCANS.delete(name);   // the person blocked the bot: stop writing to them
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return { sent, day };
}

/* ---------------- translation of scanned pages ---------------- */
const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const LANGS = { de: 'German', uk: 'Ukrainian', en: 'English' };
const PAIRS = ['de-uk', 'uk-de', 'en-uk'];
const UNREADABLE = { uk: 'нерозбірливо', de: 'unleserlich', en: 'illegible' };
const TR_MAX_CHARS = 12000;   // a dense A4 page is about 4 000
const TR_PER_DAY = 80;        // pages per person and day: the free Workers AI allowance is shared by everyone

async function translate(request, env, reply, path) {
  if (!env.AI) return reply(500, { ok: false, error: 'AI binding is not set' });
  if (path === '/translate/check') return translateCheck(request, env, reply);
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'POST only' });
  const signed = await readSigned(request, env, reply);
  if (signed instanceof Response) return signed;
  const pair = String(signed.form.get('pair') || ''), text = String(signed.form.get('text') || '').trim();
  if (!PAIRS.includes(pair)) return reply(400, { ok: false, error: `pair: ${PAIRS.join(', ')}` });
  if (!text) return reply(400, { ok: false, error: 'no text' });
  if (text.length > TR_MAX_CHARS) return reply(413, { ok: false, error: 'text too long' });

  const key = `tr:${signed.user.id}:${berlinDay(new Date())}`;
  const used = env.SCANS ? Number(await env.SCANS.get(key)) || 0 : 0;
  if (used >= TR_PER_DAY) return reply(429, { ok: false, error: 'daily_limit' });

  const out = await runModel(env, pair, text);
  if (out.error) return reply(out.status, { ok: false, error: out.error });
  if (env.SCANS) await env.SCANS.put(key, String(used + 1), { expirationTtl: 2 * 86400 });
  return reply(200, { ok: true, text: out.text });
}

async function runModel(env, pair, text, extra) {
  const [from, to] = pair.split('-');
  const t0 = Date.now();
  let res;
  try {
    res = await env.AI.run(MODEL, {
      messages: [{ role: 'system', content: trPrompt(from, to) }, { role: 'user', content: text }],
      // Gemma 4 here "thinks" before answering unless told not to; on a full page that used all 4096 tokens
      // in 80 s and left no translation. Off: the same page takes about 13 s.
      max_completion_tokens: 4096, temperature: 0.2, chat_template_kwargs: { enable_thinking: false }, ...extra,
    });
  } catch (e) {
    const diag = { ms: Date.now() - t0, message: String(e && e.message).slice(0, 300) };
    console.log('translate failed', JSON.stringify(diag));
    // 4006: the account's free 10 000 neurons for today are used up
    if (/4006|neurons|allocation/i.test(diag.message)) return { status: 429, error: 'ai_quota', diag };
    return { status: 502, error: 'ai_failed', diag };
  }
  const choice = res && res.choices && res.choices[0], msg = choice && choice.message;
  let t = (msg && msg.content) || (res && res.response) || '';
  if (Array.isArray(t)) t = t.map((p) => (p && p.text) || '').join('');
  t = String(t).replace(/<think>[\s\S]*?<\/think>/g, '').replace(/^\s*```[a-z]*\n|\n```\s*$/g, '').trim();
  const reasoning = msg && (msg.reasoning_content || msg.reasoning);
  const diag = { ms: Date.now() - t0, finish: choice && choice.finish_reason, usage: res && res.usage, contentChars: t.length,
    reasoningChars: reasoning ? String(reasoning).length : 0, messageKeys: msg ? Object.keys(msg) : null, inChars: text.length };
  console.log('translate', JSON.stringify(diag));
  return t ? { text: t, diag } : { status: 502, error: 'ai_empty', diag };
}

function trPrompt(from, to) {
  return [
    `You translate letters and official documents for a Ukrainian family living in Germany. Translate the user's text from ${LANGS[from]} into ${LANGS[to]}.`,
    'The text was read from a scanned page by OCR, so it may contain recognition errors: translate what the author meant and leave out obvious OCR garbage.',
    'Rules:',
    '- Reply with the translation only: no introduction, notes or quotation marks around it.',
    '- Keep the layout: paragraphs separated by one empty line; keep the line breaks of addresses, lists and tables.',
    '- Copy every number exactly as written in the original, without reformatting: dates, amounts, IBAN, phone numbers, postcodes, file and customer numbers, § references.',
    '- Keep names of people, companies, authorities, streets and towns as written.',
    from === 'de' ? '- After the first use of an important German official term, add the German word in brackets, for example "рішення (Bescheid)", "строк (Frist)", "заперечення (Widerspruch)".' : '',
    `- If a part cannot be read, write [${UNREADABLE[to]}].`,
  ].filter(Boolean).join('\n');
}

// ?page=1 translates a whole made-up letter page; &think=1 turns the model's thinking on, for comparison
async function translateCheck(request, env, reply) {
  if (request.method !== 'GET') return reply(405, { ok: false, error: 'GET only' });
  const q = new URL(request.url).searchParams, page = q.get('page') === '1', think = q.get('think');
  const key = `trchk:${page ? 'page' : 'line'}:${think === '1' ? 'on' : 'off'}`;
  const cached = env.SCANS && await env.SCANS.get(key);
  if (cached) return reply(200, JSON.parse(cached));
  const extra = think === '1' ? { chat_template_kwargs: { enable_thinking: true } } : {};
  const out = await runModel(env, 'de-uk', page ? SAMPLE_PAGE : 'Bitte überweisen Sie 125,00 € bis zum 24.11.2026.', extra);
  const body = { ok: !out.error, error: out.error, model: MODEL, sample: out.text, diag: out.diag, at: new Date().toISOString() };
  if (env.SCANS && !out.error) await env.SCANS.put(key, JSON.stringify(body), { expirationTtl: 900 });
  return reply(out.error ? out.status : 200, body);
}
const SAMPLE_PAGE = `Stadtverwaltung Musterstadt · Fachbereich Bürgerdienste · Rathausplatz 1 · 12345 Musterstadt

Frau
Olena Beispiel
Beispielstraße 12
12345 Musterstadt

Musterstadt, 03.11.2026
Aktenzeichen: 32-4711/26
Sachbearbeiter: Herr M. Schmidt, Zimmer 214, Telefon 02801 7720-214

Bescheid über die Festsetzung der Abfallgebühren für das Jahr 2026

Sehr geehrte Frau Beispiel,

auf Grundlage der Satzung über die Abfallentsorgung der Stadt Musterstadt in der zurzeit gültigen Fassung werden für das Grundstück Beispielstraße 12 die Abfallgebühren für das Jahr 2026 wie folgt festgesetzt: Restmülltonne 120 Liter, 14-tägliche Leerung: 186,00 €; Papiertonne 240 Liter: 0,00 €; Grundgebühr je Haushalt: 62,40 €. Der Gesamtbetrag beläuft sich somit auf 248,40 €.

Bitte überweisen Sie den Betrag bis zum 24.11.2026 unter Angabe des Aktenzeichens auf das Konto der Stadtkasse Musterstadt, IBAN DE12 3205 0000 0000 1234 56. Sofern Sie uns ein SEPA-Lastschriftmandat erteilt haben, wird der Betrag zum Fälligkeitstermin von Ihrem Konto abgebucht.

Wird die Gebühr nicht rechtzeitig entrichtet, ist nach § 240 der Abgabenordnung für jeden angefangenen Monat der Säumnis ein Säumniszuschlag von 1 Prozent des rückständigen Betrages zu zahlen. Außerdem können Mahngebühren entstehen.

Änderungen der Anzahl der Personen im Haushalt oder der Behältergröße teilen Sie bitte schriftlich mit. Eine Änderung wird zum Ersten des folgenden Monats wirksam.

Rechtsbehelfsbelehrung: Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Klage beim Verwaltungsgericht Düsseldorf, Bastionstraße 39, 40213 Düsseldorf, schriftlich oder zur Niederschrift des Urkundsbeamten der Geschäftsstelle erhoben werden. Die Klage kann auch elektronisch eingereicht werden.

Mit freundlichen Grüßen
Im Auftrag
M. Schmidt`;

/* Form data from the Mini App with a valid Telegram signature, or the error Response to return. */
async function readSigned(request, env, reply) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BYTES) return reply(413, { ok: false, error: 'file too large' });
  let form;
  try { form = await request.formData(); } catch { return reply(400, { ok: false, error: 'bad form data' }); }
  const initData = form.get('initData');
  if (typeof initData !== 'string' || !initData) return reply(401, { ok: false, error: 'no initData' });
  const user = await verifyInitData(initData, env.BOT_TOKEN);
  if (!user) return reply(401, { ok: false, error: 'initData check failed' });
  return { form, user };
}

async function handoff(request, env, id, page, reply, cors) {
  if (!env.SCANS) return reply(500, { ok: false, error: 'KV binding SCANS is not set' });
  const m = request.method;

  if (m === 'POST' && !id) {
    const signed = await readSigned(request, env, reply);
    if (signed instanceof Response) return signed;
    const pages = signed.form.getAll('page').filter((f) => typeof f !== 'string');
    if (!pages.length || pages.length > MAX_PAGES) return reply(400, { ok: false, error: `1 to ${MAX_PAGES} pages` });
    const bufs = await Promise.all(pages.map((f) => f.arrayBuffer()));
    if (bufs.some((b) => { const h = new Uint8Array(b, 0, Math.min(3, b.byteLength)); return h[0] !== 0xFF || h[1] !== 0xD8 || h[2] !== 0xFF; })) {
      return reply(415, { ok: false, error: 'only JPEG pages are accepted' });
    }
    // recognised text and translations of the pages, if any: plain JSON, passed through as it is
    let pagesMeta;
    const raw = signed.form.get('meta');
    if (typeof raw === 'string' && raw.length <= MAX_META) {
      try { const m = JSON.parse(raw); if (Array.isArray(m)) pagesMeta = m.slice(0, bufs.length); } catch { /* ignored */ }
    }
    const newId = crypto.randomUUID();
    await Promise.all(bufs.map((b, i) => env.SCANS.put(`${newId}/${i}`, b, { expirationTtl: HANDOFF_TTL })));
    await env.SCANS.put(newId, JSON.stringify(pagesMeta ? { n: bufs.length, pages: pagesMeta } : { n: bufs.length }), { expirationTtl: HANDOFF_TTL });   // last, so a visible id has all its pages
    return reply(200, { ok: true, id: newId });
  }
  if (!id) return reply(405, { ok: false, error: 'POST only' });

  if (m === 'GET' && page === undefined) {
    const meta = await env.SCANS.get(id);
    return meta ? new Response(meta, { headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
      : reply(404, { ok: false, error: 'expired or not there yet' });
  }
  if (m === 'GET') {
    const buf = await env.SCANS.get(`${id}/${page}`, 'arrayBuffer');
    return buf ? new Response(buf, { headers: { ...cors, 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } })
      : reply(404, { ok: false, error: 'no such page' });
  }
  if (m === 'DELETE' && page === undefined) {
    const meta = JSON.parse((await env.SCANS.get(id)) || '{"n":0}');
    const n = Math.min(Number(meta.n) || 0, MAX_PAGES);
    await Promise.all([env.SCANS.delete(id), ...Array.from({ length: n }, (_, i) => env.SCANS.delete(`${id}/${i}`))]);
    return reply(200, { ok: true });
  }
  return reply(405, { ok: false, error: 'method not allowed' });
}

/* Telegram Mini App initData check (core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app):
   secret = HMAC_SHA256(key "WebAppData", BOT_TOKEN); hash = hex(HMAC_SHA256(secret, data_check_string)). */
async function verifyInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;

  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > MAX_AGE_SECONDS) return null;

  const enc = new TextEncoder();
  const secretKey = await crypto.subtle.importKey('raw', enc.encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const secret = await crypto.subtle.sign('HMAC', secretKey, enc.encode(botToken));
  const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

  // Newer clients add a "signature" field. Telegram includes it in the hashed string; older
  // libraries did not, so both variants are tried.
  const variants = [[...params.entries()].filter(([k]) => k !== 'hash')];
  if (params.has('signature')) variants.push(variants[0].filter(([k]) => k !== 'signature'));

  for (const entries of variants) {
    const dataCheck = [...entries].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(dataCheck)));
    const hex = [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (timingSafeEqual(hex, hash)) {
      try {
        const user = JSON.parse(params.get('user') || 'null');
        return user && Number.isSafeInteger(user.id) ? user : null;
      } catch { return null; }
    }
  }
  return null;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function safeName(name) {
  const clean = String(name).replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 120);
  return /\.pdf$/i.test(clean) ? clean : clean + '.pdf';
}
