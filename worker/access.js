// Who may use the bot: the people in config.js (FAMILY, hashes of their usernames) and whoever the Worker secret
// ALLOWED_USERS names (usernames, numeric Telegram ids or hashes, comma separated). Everyone else gets 403 from the
// server and silence from the bot.
//
// A username can change hands, so the first time a family member is seen, their numeric id is tied to it in KV:
//   who:<username> → id      ok:<id> → username
// From then on the id counts, even after a rename, and whoever takes over the username later gets nothing.
// Taking a username out of the list takes the person's access away, pinned or not.

import { FAMILY } from './config.js';
import { tgApi } from './telegram.js';

const norm = (u) => String(u == null ? '' : u).trim().replace(/^@/, '').toLowerCase();

// The form a username is kept in (config.js): hex SHA-256 of "d-simya:" + the name in lower case
export async function nameHash(username) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('d-simya:' + norm(username)));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function lists(env) {
  const names = new Set(), ids = new Set(), hashes = new Set();
  for (const x of [...FAMILY, ...String(env.ALLOWED_USERS || '').split(/[\s,;]+/)]) {
    const v = norm(x);
    if (/^[0-9a-f]{64}$/.test(v)) hashes.add(v);
    else if (/^\d+$/.test(v)) ids.add(Number(v));
    else if (v) names.add(v);
  }
  return { names, ids, hashes };
}
async function listed(env, name) {
  if (!name) return false;
  const { names, hashes } = lists(env);
  return names.has(name) || hashes.has(await nameHash(name));
}

const known = new Map();   // id → username, per Worker instance: spares the KV reads on the next request

// A signed-in Telegram user ({id, username}): may they? Ties the id to the username on the first visit.
export async function admit(env, user) {
  const id = Number(user && user.id);
  if (!Number.isSafeInteger(id) || id <= 0) return false;
  const { ids } = lists(env);
  if (ids.has(id)) return true;
  if (known.has(id) && (await listed(env, known.get(id)))) return true;
  const kv = env.SCANS;
  if (kv) {
    const pinned = await kv.get('ok:' + id);
    if (pinned !== null && (await listed(env, pinned))) { known.set(id, pinned); return true; }
  }
  const name = norm(user.username);
  if (!(await listed(env, name))) return false;
  if (kv) {
    const owner = await kv.get('who:' + name);
    if (owner !== null && Number(owner) !== id) return false;   // the username belonged to someone else first
    if (owner === null) await kv.put('who:' + name, String(id));
    await kv.put('ok:' + id, name);
  }
  known.set(id, name);
  return true;
}

// For the cron jobs, which only know a chat id: true, false, or null when it cannot be told now (Telegram not answering).
// Someone who switched reminders on before the list existed is looked up once, quietly (getChat sends nothing).
export async function allowedId(env, id) {
  id = Number(id);
  const { ids } = lists(env);
  if (ids.has(id)) return true;
  if (known.has(id)) return listed(env, known.get(id));
  if (!env.SCANS) return false;
  const pinned = await env.SCANS.get('ok:' + id);
  if (pinned !== null) { known.set(id, pinned); return listed(env, pinned); }
  const chat = await tgApi(env, 'getChat', { chat_id: id });
  if (!chat.ok) return chat.error_code === 400 || chat.error_code === 403 ? false : null;
  return admit(env, { id, username: chat.result && chat.result.username });
}
