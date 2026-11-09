// Checks the send-scan Worker: Telegram signature check, refusals, the call to sendDocument,
// and the page hand-off to the browser (with an in-memory stand-in for Cloudflare KV).
// Run: node tests/worker.test.mjs   (Node 22+, no packages needed)
import { createHmac } from 'node:crypto';
import worker from '../worker/send-scan.js';
const TOKEN = '123456:TEST-not-a-real-token';
function sign(fields, token = TOKEN, includeSigInHash = true) {
  const entries = Object.entries(fields).filter(([k]) => includeSigInHash || k !== 'signature');
  const dcs = entries.sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(token).digest();
  const hash = createHmac('sha256', secret).update(dcs).digest('hex');
  return new URLSearchParams({ ...fields, hash }).toString();
}
const now = Math.floor(Date.now() / 1000);
const base = { query_id: 'AAH', user: JSON.stringify({ id: 4242, first_name: 'Стас' }), auth_date: String(now) };
let sent = null;
globalThis.fetch = async (url, init) => { sent = { url, chat: init.body.get('chat_id'), doc: init.body.get('document') }; return new Response(JSON.stringify({ ok: true })); };
const pdf = new File([new TextEncoder().encode('%PDF-1.4\n%fake\n')], 'Скан_test.pdf', { type: 'application/pdf' });
async function call(initData, file = pdf, method = 'POST') {
  sent = null;
  const fd = new FormData(); if (initData !== undefined) fd.append('initData', initData); if (file) fd.append('file', file); fd.append('caption', 'Скан, 1 стор.');
  const req = new Request('https://w.example/', method === 'POST' ? { method, body: fd } : { method });
  const res = await worker.fetch(req, { BOT_TOKEN: TOKEN });
  return { status: res.status, body: await res.json().catch(() => null), acao: res.headers.get('Access-Control-Allow-Origin'), sent };
}
const cases = [
  ['valid', sign(base), 200],
  ['valid with signature field (hashed)', sign({ ...base, signature: 'abc' }), 200],
  ['valid with signature field (not hashed)', sign({ ...base, signature: 'abc' }, TOKEN, false), 200],
  ['wrong token', sign(base, '999:other'), 401],
  ['tampered user id', sign(base).replace('4242', '4243'), 401],
  ['expired', sign({ ...base, auth_date: String(now - 2 * 86400) }), 401],
  ['no initData', undefined, 401],
  ['not a pdf', sign(base), 415, new File(['hello'], 'x.pdf')],
];
let fails = 0;
for (const [name, init, want, file] of cases) {
  const r = await call(init, file);
  const ok = r.status === want && (want !== 200 || (r.sent && r.sent.chat === '4242' && r.sent.url.endsWith('/sendDocument')));
  if (!ok) fails++;
  console.log(ok ? 'PASS' : 'FAIL', name, r.status, JSON.stringify(r.body), r.sent ? `→ chat ${r.sent.chat}, ${r.sent.doc.name}` : '');
}
function t(name, ok, info = '') { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, info); }
const opt = await worker.fetch(new Request('https://w.example/', { method: 'OPTIONS' }), { BOT_TOKEN: TOKEN });
t('preflight', opt.status === 204 && opt.headers.get('Access-Control-Allow-Origin') === 'https://w2unemdhysend.github.io');

// hand-off of pages to the browser
const kv = new Map();
const SCANS = {
  async put(k, v, o) { if (!(o && o.expirationTtl >= 60)) throw new Error('KV needs a TTL of 60 s or more'); kv.set(k, v); },
  async get(k) { return kv.has(k) ? kv.get(k) : null; },
  async delete(k) { kv.delete(k); },
};
const env = { BOT_TOKEN: TOKEN, SCANS };
const jpg = (n) => new File([new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, n, n, n])], `p${n}.jpg`, { type: 'image/jpeg' });
async function post(initData, files, e = env) {
  const fd = new FormData(); fd.append('initData', initData); files.forEach((f) => fd.append('page', f));
  const res = await worker.fetch(new Request('https://w.example/handoff', { method: 'POST', body: fd }), e);
  return { status: res.status, body: await res.json().catch(() => null) };
}
const get = (path, method = 'GET') => worker.fetch(new Request('https://w.example' + path, { method }), env);

let r = await post(sign(base), [jpg(1), jpg(2)]);
const id = r.body && r.body.id;
t('handoff: signed upload of 2 pages', r.status === 200 && /^[0-9a-f-]{36}$/.test(id || '') && kv.size === 3, JSON.stringify(r.body));
let res = await get(`/handoff/${id}`);
t('handoff: browser sees the page count', res.status === 200 && (await res.json()).n === 2 && res.headers.get('Access-Control-Allow-Origin') === 'https://w2unemdhysend.github.io');
res = await get(`/handoff/${id}/1`);
const bytes = new Uint8Array(await res.arrayBuffer());
t('handoff: page comes back unchanged as JPEG', res.status === 200 && res.headers.get('Content-Type') === 'image/jpeg' && bytes.length === 7 && bytes[4] === 2);
res = await get(`/handoff/${id}`, 'DELETE');
t('handoff: delete removes everything', res.status === 200 && kv.size === 0);
res = await get(`/handoff/${id}`);
t('handoff: gone after delete', res.status === 404);
r = await post(sign(base), [jpg(1), new File(['%PDF-1.4'], 'x.jpg')]);
t('handoff: non-JPEG refused, nothing stored', r.status === 415 && kv.size === 0);
r = await post(sign(base, '999:other'), [jpg(1)]);
t('handoff: forged signature refused', r.status === 401 && kv.size === 0);
r = await post(sign(base), [jpg(1)], { BOT_TOKEN: TOKEN });
t('handoff: missing KV binding reported', r.status === 500);
res = await get('/handoff/../../etc');
t('handoff: malformed id is not found', res.status === 404);
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
