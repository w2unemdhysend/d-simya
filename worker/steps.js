// The phone's step counter: the «Кроки D-SIM'YA» Android app (android/kroky) reads the day's steps from Health Connect
// (Samsung Health, the phone's own counter, a watch…) and sends them here; they land in the person's day record (d|<day>,
// field steps), where «Харчування» counts them in. Telegram's signature cannot reach that app, so it is paired once:
//
//   «Харчування» (signed) → POST /forma action=stepcode  → a code of 8 letters for 15 minutes
//   the app → POST /steps/pair {code, device}            → a device token (kept on the phone; only its hash is kept here)
//   the app → POST /steps  Authorization: Bearer <token>  {days: [{day, steps}], app}   every hour or so
//   «Харчування» (signed) → action=stepdevices / stepunlink {dev}: the phones paired, when they last sent, unpairing
//
// KV: spc:<code> → {id, name} (15 min) · stk:<sha256(token)> → {id, dev}. The Durable Object keeps the devices.
import { allowedId } from './access.js';
import { berlinDay } from '../smittia/due.js';

const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_TTL = 900, MAX_DEVICES = 3, MAX_DAYS = 14, MAX_STEPS = 150000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export const newCode = () => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => ABC[b % ABC.length]).join('');
const b64url = (u8) => btoa(String.fromCharCode(...u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export async function hashOf(token) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(token))));
  return [...d].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const dayNumOf = (d) => Math.round(Date.parse(d + 'T00:00:00Z') / 86400000);

// The days a phone sends, cleaned up: real days of the last two weeks (not tomorrow), whole steps within reason
export function cleanDays(raw, today) {
  if (!Array.isArray(raw)) return [];
  const t = dayNumOf(today), seen = new Set(), out = [];
  for (const x of raw.slice(0, 40)) {
    if (!x || !DAY.test(String(x.day)) || seen.has(x.day)) continue;
    const n = dayNumOf(x.day), steps = Math.round(Number(x.steps));
    if (!(n <= t + 1 && n > t - MAX_DAYS) || !Number.isFinite(steps) || steps < 0 || steps > MAX_STEPS) continue;
    seen.add(x.day); out.push({ day: x.day, steps });
  }
  return out.sort((a, b) => (a.day < b.day ? -1 : 1));
}

/* ---------- from the page (signed): a code, the devices, unpairing ---------- */
export async function stepAction(env, signed, action, ask, reply) {
  const me = signed.user.id;
  if (action === 'stepcode') {
    const code = newCode();
    await env.SCANS.put('spc:' + code, JSON.stringify({ id: me, name: clip(signed.user.first_name, 40) }), { expirationTtl: CODE_TTL });
    return reply(200, { ok: true, code, ttl: CODE_TTL });
  }
  if (action === 'stepdevices') return reply(200, { ok: true, devices: (await ask(env, me, { op: 'devices' })).devices || [] });
  if (action === 'stepunlink') {
    const dev = clip(signed.form.get('dev'), 40);
    const d = await ask(env, me, { op: 'unlink', dev });
    if (d.h) await env.SCANS.delete('stk:' + d.h);
    return reply(200, { ok: true, devices: d.devices || [] });
  }
  return null;
}

/* ---------- from the app: pairing and the steps ---------- */
export async function stepsRoute(request, env, path, ask, cors) {
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
  if (request.method !== 'POST') return json(405, { ok: false, error: 'POST only' });
  if (!env.SCANS || !env.FORMA) return json(500, { ok: false, error: 'bindings missing' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'JSON body' }); }
  if (path === '/steps/pair') {
    // a code has 32^8 values and lives 15 minutes; the limiter keeps guessing slow on top of that
    if (env.LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'x';
      try { if (!(await env.LIMITER.limit({ key: 'pair:' + ip })).success) return json(429, { ok: false, error: 'slow_down' }); } catch { /* no limit then */ }
    }
    const code = normCode(body.code);
    const rec = code.length === 8 ? JSON.parse((await env.SCANS.get('spc:' + code)) || 'null') : null;
    if (!rec) return json(404, { ok: false, error: 'bad_code' });
    await env.SCANS.delete('spc:' + code);
    if ((await allowedId(env, rec.id)) === false) return json(403, { ok: false, error: 'not_allowed' });
    const token = b64url(crypto.getRandomValues(new Uint8Array(32))), h = await hashOf(token);
    const dev = b64url(crypto.getRandomValues(new Uint8Array(6)));
    const d = await ask(env, rec.id, { op: 'pair', dev, h, name: clip(body.device, 40) || 'Android', max: MAX_DEVICES });
    for (const old of d.dropped || []) await env.SCANS.delete('stk:' + old);   // more than MAX_DEVICES: the oldest goes
    await env.SCANS.put('stk:' + h, JSON.stringify({ id: rec.id, dev }));
    return json(200, { ok: true, token, name: rec.name || '' });
  }
  if (path === '/steps') {
    const m = String(request.headers.get('Authorization') || '').match(/^Bearer ([\w-]{20,100})$/);
    const rec = m ? JSON.parse((await env.SCANS.get('stk:' + (await hashOf(m[1])))) || 'null') : null;
    if (!rec) return json(401, { ok: false, error: 'unpaired' });
    if ((await allowedId(env, rec.id)) === false) return json(403, { ok: false, error: 'not_allowed' });
    const days = cleanDays(body.days, berlinDay(new Date()));
    const d = await ask(env, rec.id, { op: 'steps', dev: rec.dev, days, app: clip(body.app, 20) });
    if (d.error === 'unknown_device') { await env.SCANS.delete('stk:' + (await hashOf(m[1]))); return json(401, { ok: false, error: 'unpaired' }); }
    return json(200, { ok: true, saved: d.saved || 0 });
  }
  return json(404, { ok: false, error: 'not found' });
}
