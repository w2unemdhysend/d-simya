// Checks the send-scan Worker: Telegram signature check, refusals and the call to sendDocument.
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
const opt = await worker.fetch(new Request('https://w.example/', { method: 'OPTIONS' }), { BOT_TOKEN: TOKEN });
console.log(opt.status === 204 ? 'PASS' : 'FAIL', 'preflight', opt.status, opt.headers.get('Access-Control-Allow-Origin'));
console.log(fails ? `${fails} FAILED` : 'ALL PASS');
process.exitCode = fails ? 1 : 0;
