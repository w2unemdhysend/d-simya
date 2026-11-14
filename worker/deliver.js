// Messages from the cron jobs to everyone under a KV prefix (sub:, dsub:, bsub:, …).
//
// Each person gets a job's message once a day, and the mark that they got it (got:<job>:<day>:<id>) is written only
// after Telegram took the message. A run that breaks off — the run's message budget used up, Telegram busy, an
// error — is picked up by the next run, half an hour later, as long as the job's time window is open. When nobody is
// left, done:<job>:<day> lets the later runs of the window skip the job at once.
//
// People who are not allowed (access.js) and people who blocked the bot lose their subscription, quietly.

import { allowedId } from './access.js';

const read = async (env, k) => { try { return JSON.parse(await env.SCANS.get(k)); } catch { return null; } };

async function* subscribers(env, prefix) {
  let cursor;
  do {
    const page = await env.SCANS.list({ prefix, cursor });
    for (const { name } of page.keys) yield { name, id: Number(name.slice(prefix.length)) };
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}

// out: the run's outbox (telegram.js). text: one text for all, or (record) => text | null (null: nothing for them today).
// due(record): whether this run is the person's time (the morning digest has a time per person).
// legacy, legacyFor(id): the marks of the version before (sent:<day>, bsent:<id>:<day>, …), so that a deploy in the
// middle of a job's window does not send the same message twice.
export async function deliver(env, out, { job, day, prefix, text, button, due = () => true, finish = true, legacy, legacyFor }) {
  const done = `done:${job}:${day}`;
  if (finish && (await env.SCANS.get(done))) return { sent: 0, why: 'already sent' };
  if (legacy && (await env.SCANS.get(legacy))) return { sent: 0, why: 'already sent (before the update)' };
  let sent = 0, later = 0;
  for await (const { name, id } of subscribers(env, prefix)) {
    if (!Number.isSafeInteger(id)) continue;
    const mark = `got:${job}:${day}:${id}`;
    if (await env.SCANS.get(mark)) continue;
    if (legacyFor && (await env.SCANS.get(legacyFor(id)))) continue;
    const rec = await read(env, name);
    if (!due(rec)) continue;
    const allowed = await allowedId(env, id);
    if (allowed === false) { await env.SCANS.delete(name); continue; }
    if (allowed === null) { later++; continue; }
    let t;
    try { t = typeof text === 'function' ? await text(rec) : text; } catch (e) { console.log('message failed', job, String(e && e.message || e)); later++; continue; }
    if (!t) continue;
    const r = await out.send(id, t, button);
    if (r.ok) { sent++; await env.SCANS.put(mark, '1', { expirationTtl: 2 * 86400 }); }
    else if (r.blocked) await env.SCANS.delete(name);
    else later++;
  }
  if (finish && !later) await env.SCANS.put(done, '1', { expirationTtl: 3 * 86400 });
  return { sent, later };
}

// One message to everyone under a prefix, without marks (the messages about failures, which are marked by what they
// are about). Not-allowed people and people who blocked the bot are dropped as above.
export async function broadcast(env, out, prefix, text, button) {
  let sent = 0;
  for await (const { name, id } of subscribers(env, prefix)) {
    const allowed = await allowedId(env, id);
    if (allowed === false) { await env.SCANS.delete(name); continue; }
    if (!allowed) continue;
    const r = await out.send(id, text, button);
    if (r.ok) sent++;
    else if (r.blocked) await env.SCANS.delete(name);
  }
  return { sent };
}

// Berlin wall-clock time of a moment: {hour, minute, weekday (0 = Monday)}
export function berlinClock(now) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return { hour: Number(get('hour')), minute: Number(get('minute')), weekday: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) };
}

// Is `now` (Berlin time) in the window that opens at hh:mm and stays open `minutes`?
export function inWindow(now, hhmm, minutes) {
  const { hour, minute } = berlinClock(now), [h, m] = String(hhmm).split(':').map(Number);
  const since = hour * 60 + minute - (h * 60 + m);
  return since >= 0 && since < minutes;
}
