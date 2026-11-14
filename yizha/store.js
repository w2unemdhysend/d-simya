// The person's own records for «Харчування» and «Тренування», kept on the phone first and copied to the server.
//
// Everything is a record {k (kind), id, u (when changed, ms), d (1: deleted), v (value)}:
//   p|me profile and goal · w|<day> weight · e|<day>~<x> food eaten · f|<x> own or scanned food · r|<x> own dish
//   x|<day>~<x> workout or walk done · s|sport the workout plan and days
// A change is saved here at once (works without internet) and goes to the server (worker/forma.js) a moment later; the
// server keeps the newer of two versions of a record (u), so a phone and a computer of the same person agree. Without
// Telegram (a plain browser) everything stays on this device. Ids of eaten food and workouts start with the day, so the
// server can read a week without reading everything.
import { API } from '../assets/site.js';

const KEY = 'forma-db', BATCH = 200;
const tgApp = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;
const tg = tgApp && tgApp.platform && tgApp.platform !== 'unknown' && tgApp.initData ? tgApp : null;

let db = read();
const listeners = [];
let timer = null, busy = false, again = false;
export const status = { mode: tg ? 'wait' : 'local', at: db.at || 0 };   // local | ok | wait | off | err

function read() {
  try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && o.recs) return { seq: o.seq || 0, recs: o.recs, dirty: o.dirty || [], at: o.at || 0 }; } catch (e) { /* first visit */ }
  return { seq: 0, recs: {}, dirty: [], at: 0 };
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* full: kept in memory */ } }
function emit(remote, statusOnly = false) { listeners.forEach((f) => { try { f({ remote, status: statusOnly }); } catch (e) { console.error(e); } }); }

export const rid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
export const on = (f) => listeners.push(f);
export const synced = () => !!tg;

export function get(k, id) { const r = db.recs[k + '|' + id]; return r && !r.d ? r.v : null; }
export function all(k, prefix = '') {
  const out = [], p = k + '|' + prefix;
  for (const key in db.recs) { const r = db.recs[key]; if (!r.d && key.startsWith(p)) out.push({ id: r.id, ...r.v }); }
  return out;
}
export function put(k, id, v) {
  const key = k + '|' + id, old = db.recs[key];
  db.recs[key] = { k, id, u: Math.max(Date.now(), old ? old.u + 1 : 0), v };
  if (!db.dirty.includes(key)) db.dirty.push(key);
  save(); emit(false); later();
}
export function del(k, id) {
  const key = k + '|' + id, old = db.recs[key];
  if (!old || old.d) return;
  db.recs[key] = { k, id, u: Math.max(Date.now(), old.u + 1), d: 1, v: null };
  if (!db.dirty.includes(key)) db.dirty.push(key);
  save(); emit(false); later();
}
export const pending = () => db.dirty.length;

/* ---------- the server ---------- */
function later(ms = 900) { if (!tg) return; clearTimeout(timer); timer = setTimeout(sync, ms); }

export async function call(action, fields = {}) {
  const fd = new FormData(); fd.append('initData', tg.initData); fd.append('action', action);
  for (const [k, v] of Object.entries(fields)) if (v != null) fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
  let r;
  try { r = await fetch(API + 'forma', { method: 'POST', body: fd }); } catch (e) { const err = new Error('offline'); err.offline = true; throw err; }
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) { const err = new Error(d.error || 'http ' + r.status); err.status = r.status; throw err; }
  return d;
}

export async function sync() {
  if (!tg) return;
  if (busy) { again = true; return; }
  busy = true; status.mode = 'wait'; emit(false, true);
  try {
    for (let round = 0; round < 20; round++) {
      const keys = db.dirty.slice(0, BATCH), sent = keys.map((k) => db.recs[k]).filter(Boolean);
      const d = await call('sync', { since: String(db.seq), changes: sent });
      for (const r of sent) { const now = db.recs[r.k + '|' + r.id]; if (now && now.u === r.u) db.dirty = db.dirty.filter((x) => x !== r.k + '|' + r.id); }
      let changed = false;
      for (const row of d.rows || []) {
        const key = row.k + '|' + row.id, mine = db.recs[key];
        if (mine && mine.u > row.u) continue;              // changed here since: ours goes up next
        if (mine && mine.u === row.u && !!mine.d === !!row.d) continue;
        db.recs[key] = { k: row.k, id: row.id, u: row.u, ...(row.d ? { d: 1, v: null } : { v: row.v }) };
        db.dirty = db.dirty.filter((x) => x !== key);
        changed = true;
      }
      db.seq = d.seq; db.at = Date.now(); save();
      if (changed) emit(true);
      if (!d.more && !db.dirty.length) break;
    }
    status.mode = 'ok'; status.at = db.at;
  } catch (e) {
    status.mode = e.offline ? 'off' : 'err';
    if (e.status === 403) status.mode = 'denied';
  }
  busy = false; emit(false, true);
  if (again) { again = false; later(300); }
}

if (typeof window !== 'undefined') {
  // another page of the app (the other section, another tab) changed the records
  window.addEventListener('storage', (e) => { if (e.key === KEY) { db = read(); emit(true); } });
  window.addEventListener('online', () => later(100));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { db = read(); later(100); } });
  if (tg) { later(50); setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 60000); }
}
