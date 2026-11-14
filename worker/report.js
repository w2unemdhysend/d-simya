// Errors on the phones. The pages send what broke (assets/ui.js): which page, the message, the file and line, the
// platform. Never who: no Telegram data, no ids, digits and addresses in the message are blanked on the phone and here.
//
//   POST /report  (text/plain JSON, from the site only)  {p: page, m: message, s: file:line, t: platform, v: version}
//
// KV cerr:<day>:<hash> → {p, m, s, t, v, n (times seen), at, sent}. The cron tells the people who asked to hear about
// failures (asub:) once about each new error, at most five a day; the same error again only raises its count.

const MAX_A_DAY = 5;
export const scrub = (s, n) => String(s == null ? '' : s)
  .replace(/https?:\/\/[^\s'")]+/g, (u) => u.replace(/[?#].*$/, ''))   // no query strings (they can carry data)
  .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '…@…')                         // no e-mail addresses
  .replace(/\d{5,}/g, '#')                                             // no long numbers (ids, phone numbers)
  .replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

async function hash(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const seen = new Map();   // per Worker instance: the same error from a loop does not write KV each time

export async function report(request, env, origin, day) {
  const cors = { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' };
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Max-Age': '86400' } });
  if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });
  if (request.headers.get('Origin') !== origin) return new Response('forbidden', { status: 403 });
  if (!env.SCANS) return new Response(null, { status: 204, headers: cors });
  if (env.LIMITER) {
    const ip = request.headers.get('CF-Connecting-IP') || 'x';
    try { const { success } = await env.LIMITER.limit({ key: 'report:' + ip }); if (!success) return new Response(null, { status: 429, headers: cors }); } catch { /* no limit then */ }
  }
  let b;
  try { b = JSON.parse((await request.text()).slice(0, 4000)); } catch { return new Response('bad', { status: 400, headers: cors }); }
  const e = { p: scrub(b.p, 40), m: scrub(b.m, 200), s: scrub(b.s, 120), t: scrub(b.t, 40), v: scrub(b.v, 16) };
  if (!e.m) return new Response('bad', { status: 400, headers: cors });
  const key = `cerr:${day}:${await hash(e.p + '|' + e.m + '|' + e.s)}`;
  const n = (seen.get(key) || 0) + 1; seen.set(key, n);
  if (seen.size > 500) seen.clear();
  if (n === 1 || n === 10 || n === 100) {
    let rec = null;
    try { rec = JSON.parse(await env.SCANS.get(key)); } catch { /* new */ }
    rec = rec ? { ...rec, n: Math.max(rec.n + 1, n) } : { ...e, n: 1, at: Date.now(), sent: false };
    await env.SCANS.put(key, JSON.stringify(rec), { expirationTtl: 3 * 86400 });
  }
  return new Response(null, { status: 204, headers: cors });
}

// For the cron (health.js): the new errors of today as messages, marked as told
export async function errorNotes(env, day) {
  const page = await env.SCANS.list({ prefix: `cerr:${day}:` });
  const out = [];
  let told = 0;
  const recs = [];
  for (const { name } of page.keys) { try { const r = JSON.parse(await env.SCANS.get(name)); if (r) recs.push([name, r]); } catch { /* broken */ } }
  told = recs.filter(([, r]) => r.sent).length;
  for (const [name, r] of recs.sort((a, b) => a[1].at - b[1].at)) {
    if (r.sent || told >= MAX_A_DAY) continue;
    told++;
    await env.SCANS.put(name, JSON.stringify({ ...r, sent: true }), { expirationTtl: 3 * 86400 });
    out.push(`🐞 Помилка на сторінці «${r.p || 'головна'}» (${r.t || 'невідомо де'}${r.v ? ', версія ' + r.v : ''}):\n${r.m}${r.s ? `\n${r.s}` : ''}${r.n > 1 ? `\nСьогодні вже ${r.n} рази.` : ''}`);
  }
  return out;
}
