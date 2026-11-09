/**
 * send-scan: receives a PDF from the D-SIM'YA scanner Mini App and sends it to the
 * user's own chat with the bot. Deploy as a Cloudflare Worker (free plan is enough).
 *
 * Settings (Cloudflare → Worker → Settings → Variables and Secrets):
 *   BOT_TOKEN       secret, the token from @BotFather            (required)
 *   ALLOWED_ORIGIN  text, defaults to https://w2unemdhysend.github.io
 *
 * Safety:
 *   - The request must carry Telegram's signed initData; it is checked with HMAC-SHA256
 *     against BOT_TOKEN, so only people who opened the Mini App inside Telegram can use it.
 *   - The file always goes to the user who sent it (user.id from the signed data), never elsewhere.
 *   - The bot token never leaves the Worker.
 */

const MAX_BYTES = 45 * 1024 * 1024;        // Bot API upload limit is 50 MB
const MAX_AGE_SECONDS = 24 * 60 * 60;      // initData older than a day is refused

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || 'https://w2unemdhysend.github.io';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const reply = (status, body) => new Response(JSON.stringify(body), {
      status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return reply(405, { ok: false, error: 'POST only' });
    if (!env.BOT_TOKEN) return reply(500, { ok: false, error: 'BOT_TOKEN is not set' });

    const len = Number(request.headers.get('Content-Length') || 0);
    if (len > MAX_BYTES) return reply(413, { ok: false, error: 'file too large' });

    let form;
    try { form = await request.formData(); } catch { return reply(400, { ok: false, error: 'bad form data' }); }

    const initData = form.get('initData');
    const file = form.get('file');
    const caption = String(form.get('caption') || '').slice(0, 200);
    if (typeof initData !== 'string' || !initData) return reply(401, { ok: false, error: 'no initData' });
    if (!file || typeof file === 'string') return reply(400, { ok: false, error: 'no file' });
    if (file.size > MAX_BYTES) return reply(413, { ok: false, error: 'file too large' });

    const user = await verifyInitData(initData, env.BOT_TOKEN);
    if (!user) return reply(401, { ok: false, error: 'initData check failed' });

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
