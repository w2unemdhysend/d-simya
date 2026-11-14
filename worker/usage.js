// Watching the free plan, so the bot does not fall silent one day without warning. Once an hour the cron asks Cloudflare
// how much of today's allowance is used and tells the people who asked to hear about failures (asub:) when something
// passes 80 % and again at 100 %. Limits reset at 00:00 UTC.
//
//   Workers requests 100 000 a day · KV reads 100 000, writes / deletes / lists 1 000 each · Durable Objects requests
//   100 000 · Workers AI 10 000 neurons (counted here: ai:<UTC day>, each answer of the model reports its neurons)
//
// Cloudflare's numbers need two Worker settings (Cloudflare → Worker → Settings → Variables and secrets):
//   CF_ACCOUNT_ID   the account id (Cloudflare dashboard, right column of the account home)
//   CF_API_TOKEN    secret: an API token with the permission "Account Analytics: Read" (My Profile → API Tokens)
// Without them only the Workers AI count is watched.

export const LIMITS = {
  workers: [100000, 'запитів до сервера'], kvRead: [100000, 'читань KV'], kvWrite: [1000, 'записів KV'],
  kvDelete: [1000, 'видалень KV'], kvList: [1000, 'переліків KV'], durable: [100000, 'запитів до Durable Objects'], ai: [10000, 'нейронів Workers AI'],
};
const utcDay = (now) => now.toISOString().slice(0, 10);

// Each answer of Workers AI says how many neurons it used: add them to today's count (eventually consistent, close enough)
export async function noteNeurons(env, usage) {
  const n = Number(usage && usage.neurons);
  if (!env.SCANS || !(n > 0)) return;
  const key = 'ai:' + utcDay(new Date());
  const had = Number(await env.SCANS.get(key)) || 0;
  await env.SCANS.put(key, String(Math.round((had + n) * 10) / 10), { expirationTtl: 3 * 86400 });
}

const QUERY = `query Usage($a: string!, $start: Time!, $end: Time!, $day: Date!) {
  viewer { accounts(filter: {accountTag: $a}) {
    workers: workersInvocationsAdaptive(limit: 10000, filter: {datetime_geq: $start, datetime_leq: $end}) { sum { requests } }
    kv: kvOperationsAdaptiveGroups(limit: 100, filter: {date_geq: $day, date_leq: $day}) { sum { requests } dimensions { actionType } }
    durable: durableObjectsInvocationsAdaptiveGroups(limit: 10000, filter: {date_geq: $day, date_leq: $day}) { sum { requests } }
  } }
}`;

// Today's use: {workers, kvRead, kvWrite, kvDelete, kvList, durable, ai} (only what could be read)
export async function usageToday(env, now) {
  const day = utcDay(now), out = {};
  if (env.SCANS) out.ai = Number(await env.SCANS.get('ai:' + day)) || 0;
  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) return out;
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: { Authorization: 'Bearer ' + env.CF_API_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { a: env.CF_ACCOUNT_ID, start: day + 'T00:00:00Z', end: now.toISOString(), day } }),
  });
  const d = await r.json().catch(() => null);
  const acc = d && d.data && d.data.viewer && d.data.viewer.accounts && d.data.viewer.accounts[0];
  if (!acc) throw new Error('Cloudflare analytics: ' + JSON.stringify((d && d.errors) || r.status).slice(0, 160));
  const total = (rows) => (rows || []).reduce((a, x) => a + ((x.sum && x.sum.requests) || 0), 0);
  out.workers = total(acc.workers); out.durable = total(acc.durable);
  const kv = (type) => total((acc.kv || []).filter((x) => x.dimensions && x.dimensions.actionType === type));
  out.kvRead = kv('read'); out.kvWrite = kv('write'); out.kvDelete = kv('delete'); out.kvList = kv('list');
  return out;
}

// Messages for what passed 80 % or 100 % today and was not reported yet (one KV mark per metric and level)
export async function usageNotes(env, now) {
  if (now.getUTCMinutes() >= 30) return [];   // once an hour is enough
  let use;
  try { use = await usageToday(env, now); } catch (e) { console.log('usage check failed', String(e && e.message || e)); return []; }
  const day = utcDay(now), notes = [];
  for (const [k, v] of Object.entries(use)) {
    const [limit, what] = LIMITS[k] || [], share = limit ? v / limit : 0;
    const level = share >= 1 ? 100 : share >= 0.8 ? 80 : 0;
    if (!level) continue;
    const mark = `ulim:${day}:${k}:${level}`;
    if (await env.SCANS.get(mark)) continue;
    await env.SCANS.put(mark, '1', { expirationTtl: 2 * 86400 });
    notes.push(level === 100
      ? `⛔ Сьогоднішній безкоштовний ліміт ${what} вичерпано (${v.toLocaleString('uk-UA')} з ${limit.toLocaleString('uk-UA')}). Частина функцій може не працювати до півночі UTC: це 1:00 ночі за німецьким часом (влітку 2:00).`
      : `⚠️ Використано ${Math.round(share * 100)} % сьогоднішнього безкоштовного ліміту ${what}: ${v.toLocaleString('uk-UA')} з ${limit.toLocaleString('uk-UA')}. Ліміт оновлюється опівночі UTC (1:00 ночі за німецьким часом, влітку 2:00).`);
  }
  return notes;
}
