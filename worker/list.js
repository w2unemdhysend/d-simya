// The family shopping list. One list lives in one Durable Object, so two phones changing it at the same moment
// never overwrite each other (each change runs one after the other inside the object). Who belongs to which list,
// and invite codes, are kept in KV.
//
//   POST /list  (signed initData)  action=get | add (t, s, u) | toggle (id) | remove (id) | clear | invite | join (code) | leave
//
// KV:  lm:<user id>  → list id       inv:<CODE> → list id (24 hours)

const MAX_ITEMS = 150, MAX_MEMBERS = 8, CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class ShoppingList {
  constructor(state) { this.state = state; }

  async fetch(request) {
    const { op, user, args = {} } = await request.json();
    const data = (await this.state.storage.get('list')) || { items: [], members: {}, v: 0 };
    const uid = String(user.id), name = String(user.name || '').slice(0, 40) || 'Хтось';
    let changed = false;
    if (op === 'join' || !Object.keys(data.members).length) {
      if (!data.members[uid] && Object.keys(data.members).length >= MAX_MEMBERS) return Response.json({ error: 'full' }, { status: 409 });
      if (data.members[uid] !== name) { data.members[uid] = name; changed = true; }
    } else if (!data.members[uid]) {
      return Response.json({ error: 'not_member' }, { status: 403 });
    }
    const find = (id) => data.items.find((x) => x.id === id);
    if (op === 'add') {
      const t = clean(args.t, 80);
      if (!t) return Response.json({ error: 'empty' }, { status: 400 });
      if (data.items.length >= MAX_ITEMS) return Response.json({ error: 'too_many' }, { status: 409 });
      data.items.push({ id: rid(), t, s: clean(args.s, 24), u: /^\d{4}-\d{2}-\d{2}$/.test(args.u || '') ? args.u : '', d: 0, by: name, at: Date.now() });
      changed = true;
    } else if (op === 'toggle') {
      const it = find(args.id);
      if (it) { it.d = it.d ? 0 : 1; it.dby = it.d ? name : ''; it.dat = it.d ? Date.now() : 0; changed = true; }
    } else if (op === 'remove') {
      const n = data.items.length; data.items = data.items.filter((x) => x.id !== args.id); changed = n !== data.items.length;
    } else if (op === 'clear') {
      const n = data.items.length; data.items = data.items.filter((x) => !x.d); changed = n !== data.items.length;
    } else if (op === 'leave') {
      delete data.members[uid]; changed = true;
    }
    if (changed) { data.v++; await this.state.storage.put('list', data); }
    return Response.json({ items: data.items, members: Object.values(data.members), v: data.v });
  }
}

const clean = (t, n) => String(t || '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
function rid(n = 8) { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((b) => CODE_ABC[b % 32]).join(''); }

// The route: who the user is comes from the signed initData (readSigned); everything else from the form
export async function listRoute(env, signed, reply) {
  if (!env.LISTS || !env.SCANS) return reply(500, { ok: false, error: 'LISTS or SCANS binding is not set' });
  const f = signed.form, action = String(f.get('action') || 'get'), user = { id: signed.user.id, name: signed.user.first_name || '' };
  const key = 'lm:' + user.id;
  const call = async (listId, op, args) => {
    const stub = env.LISTS.get(env.LISTS.idFromName(listId));
    const res = await stub.fetch('https://list/', { method: 'POST', body: JSON.stringify({ op, user, args }) });
    const d = await res.json();
    return { status: res.status, d };
  };
  let listId = await env.SCANS.get(key);
  if (action === 'join') {
    const code = String(f.get('code') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const target = code.length === 6 ? await env.SCANS.get('inv:' + code) : null;
    if (!target) return reply(404, { ok: false, error: 'bad_code' });
    if (target === listId) { const r = await call(listId, 'get'); return reply(200, { ok: true, ...r.d }); }
    const r = await call(target, 'join');
    if (r.status !== 200) return reply(r.status, { ok: false, error: r.d.error });
    if (listId) await call(listId, 'leave').catch(() => {});
    await env.SCANS.put(key, target);
    return reply(200, { ok: true, joined: true, ...r.d });
  }
  if (action === 'leave') {
    if (listId) await call(listId, 'leave').catch(() => {});
    listId = crypto.randomUUID(); await env.SCANS.put(key, listId);
    const r = await call(listId, 'get');
    return reply(200, { ok: true, ...r.d });
  }
  if (!listId) { listId = crypto.randomUUID(); await env.SCANS.put(key, listId); }   // the first visit: a list of one's own
  if (action === 'invite') {
    const code = rid(6);
    await env.SCANS.put('inv:' + code, listId, { expirationTtl: 86400 });
    return reply(200, { ok: true, code });
  }
  const ops = { get: 'get', add: 'add', toggle: 'toggle', remove: 'remove', clear: 'clear' };
  if (!ops[action]) return reply(400, { ok: false, error: 'action: get, add, toggle, remove, clear, invite, join or leave' });
  const r = await call(listId, ops[action], { t: f.get('t'), s: f.get('s'), u: f.get('u'), id: String(f.get('id') || '') });
  if (r.status === 403) {   // removed from that list elsewhere: start a new one of one's own
    listId = crypto.randomUUID(); await env.SCANS.put(key, listId);
    const again = await call(listId, 'get');
    return reply(200, { ok: true, ...again.d });
  }
  if (r.status !== 200) return reply(r.status, { ok: false, error: r.d.error });
  return reply(200, { ok: true, ...r.d });
}
