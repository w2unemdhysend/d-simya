/**
 * send-scan: the server half of the D-SIM'YA scanner Mini App. Cloudflare Worker, free plan.
 *
 *   POST /                 PDF → sent to the user's own chat with the bot
 *   POST /handoff          scanned pages → kept 10 minutes under a random id, so the scanner
 *                          opened in the phone's browser can pick them up (Telegram on Android
 *                          keeps its data apart from the browser and cannot save files)
 *   GET  /handoff/<id>     {n: number of pages}
 *   GET  /handoff/<id>/<i> page i as JPEG
 *   DELETE /handoff/<id>   the browser removes the pages once it has them
 *
 * Settings (Cloudflare → Worker → Settings):
 *   BOT_TOKEN       secret, the token from @BotFather            (required)
 *   SCANS           KV namespace binding                          (required for /handoff)
 *   ALLOWED_ORIGIN  text, defaults to https://w2unemdhysend.github.io
 *
 * Safety:
 *   - Both POSTs must carry Telegram's signed initData; it is checked with HMAC-SHA256
 *     against BOT_TOKEN, so only people who opened the Mini App inside Telegram can use them.
 *   - A PDF always goes to the user who sent it (user.id from the signed data), never elsewhere.
 *   - Handed-off pages are only JPEGs, live at most 10 minutes, and their id is a random UUID.
 *   - The bot token never leaves the Worker.
 */

const MAX_BYTES = 45 * 1024 * 1024;        // Bot API upload limit is 50 MB
const MAX_AGE_SECONDS = 24 * 60 * 60;      // initData older than a day is refused
const HANDOFF_TTL = 600;                   // seconds the pages wait for the browser
const MAX_PAGES = 40;

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
};

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
    const newId = crypto.randomUUID();
    await Promise.all(bufs.map((b, i) => env.SCANS.put(`${newId}/${i}`, b, { expirationTtl: HANDOFF_TTL })));
    await env.SCANS.put(newId, JSON.stringify({ n: bufs.length }), { expirationTtl: HANDOFF_TTL });   // last, so a visible id has all its pages
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
