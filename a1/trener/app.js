// «Тренажери»: sessions of ten generated questions (gen.js) with the mistakes coming back (srs.js), and «Розмова з ШІ»
// (the Worker's /talk). Screens: the hub, a session, the conversation; each is a step in the history (Back returns).
import { $, tg, haptic, load, store, cloudGet, cloudSet, plural } from '../../igry/kit.js';
import { esc, API } from '../../assets/site.js';
import { TRAINERS, question, check, setGender } from './gen.js';
import * as srs from './srs.js';
import * as sound from '../../audio/say.js';

const SKEY = 'a1-trener', N = 10, GOAL = 10;
// today in Xanten, 'YYYY-MM-DD'
const today = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const LEVELS = { a1: ['A1', [1, 16]], a2: ['A2', [17, 32]], all: ['A1–A2', [1, 32]] };
let state = Object.assign(srs.empty(), load(SKEY) || {});
let level = LEVELS[load('a1-trener-level')] ? load('a1-trener-level') : 'a1';
const save = () => { srs.tidy(state, today()); store(SKEY, state); cloudSet(SKEY, { items: state.items }); };
cloudGet(SKEY).then((c) => {   // another phone: its mistakes come back here too
  if (!c || !c.items) return;
  for (const [k, v] of Object.entries(c.items)) if (!state.items[k] || state.items[k].due > v.due) state.items[k] = v;
  if (view === 'hub') renderHub();
}).catch(() => {});
const T = Object.fromEntries(TRAINERS.map((t) => [t.id, t]));
// the course's sentences speak as Тарас or Леся (the menu's settings)
const gender = () => { try { return localStorage.getItem('dsimya-gender') === 'f' ? 'f' : 'm'; } catch (e) { return 'm'; } };
setGender(gender());
window.addEventListener('dsimya-gender', () => setGender(gender()));

/* ---------------- screens ---------------- */
let view = 'hub';
function show(v) {
  view = v;
  ['hub', 'run', 'talk'].forEach((x) => { $('#view-' + x).hidden = x !== v; });
  if (v === 'hub') renderHub();
  window.scrollTo(0, 0);
  try { if (tg && tg.BackButton) { if (v === 'hub') tg.BackButton.hide(); else tg.BackButton.show(); } } catch (e) { /* older Telegram */ }
}
function go(v, replace) { try { history[replace ? 'replaceState' : 'pushState']({ tr: v }, '', v === 'hub' ? location.pathname : '?v=' + v); } catch (e) { /* file:// */ } show(v); }
function back() { if (history.state && history.state.tr) history.back(); else show('hub'); }
window.addEventListener('popstate', (e) => { const st = e.state; if (st && st.menu) return; show(st && st.tr ? st.tr : 'hub'); });
try { if (tg && tg.BackButton) tg.BackButton.onClick(back); } catch (e) { /* older Telegram */ }

/* ---------------- the hub ---------------- */
function renderHub() {
  const d = today(), done = state.days[d] || 0, st = srs.streak(state, d, GOAL), all = srs.due(state, null, d);
  const dueOf = (id) => all.filter((x) => x.trainer === id).length;
  $('#view-hub').innerHTML = `<div class="chips" role="radiogroup" aria-label="Рівень">${Object.entries(LEVELS).map(([k, [n, r]]) => `<button class="chip" type="button" role="radio" data-level="${k}" aria-pressed="${level === k}" aria-checked="${level === k}">${n} · розд. ${r[0]}–${r[1]}</button>`).join('')}</div>
    <section class="card today"><span><b>Сьогодні: ${done} ${plural(done, 'відповідь', 'відповіді', 'відповідей')}</b><br><span class="note">${done >= GOAL ? '✓ Денну норму виконано' : `Норма — ${GOAL} на день`}</span></span>${st ? `<span class="note">🔥 ${st} ${plural(st, 'день', 'дні', 'днів')} поспіль</span>` : ''}</section>
    ${all.length ? `<button class="bigbtn" type="button" data-start="mix">Повторити помилки · ${all.length}</button>` : ''}
    <div class="trs">${TRAINERS.map((t) => { const n = dueOf(t.id); return `<button class="tr" type="button" data-start="${t.id}">${n ? `<span class="due" aria-label="На повторення: ${n}">${n}</span>` : ''}<span class="i" aria-hidden="true">${t.icon}</span><b>${esc(t.uk)}</b><small lang="de">${esc(t.note)}</small></button>`; }).join('')}
      <button class="tr wide" type="button" data-talk="1"><span class="i" aria-hidden="true">💬</span><b>Розмова з ШІ</b><small>Лікар, бюро громадян, магазин, сусід, вокзал: пишеш німецькою, ШІ відповідає й виправляє помилки українською.</small></button></div>
    <p class="note">Кожне тренування — ${N} завдань зі слів і прикладів вибраного рівня. Помилки повертаються того ж дня, потім через 1, 3, 7, 16 і 35 днів, доки не запам’ятаються.</p>`;
}
$('#view-hub').addEventListener('click', (e) => {
  const l = e.target.closest('[data-level]'); if (l) { level = l.dataset.level; store('a1-trener-level', level); renderHub(); haptic(); return; }
  const s = e.target.closest('[data-start]'); if (s) { start(s.dataset.start); return; }
  if (e.target.closest('[data-talk]')) { openTalk(); }
});

/* ---------------- a session ---------------- */
let S = null;
function start(which) {
  const d = today(), range = LEVELS[level][1], mix = which === 'mix';
  const dueList = srs.due(state, mix ? null : which, d).slice(0, mix ? N : 5);
  const qs = [];
  for (const x of dueList) { try { qs.push({ t: x.trainer, q: question(x.trainer, [1, 32], Math.random, x.key) }); } catch (er) { /* a key from an older version */ } }
  while (qs.length < N) { const t = mix ? TRAINERS[Math.floor(Math.random() * TRAINERS.length)].id : which; qs.push({ t, q: question(t, range) }); }
  S = { which, list: qs.slice(0, N), i: 0, right: 0, missed: [], again: new Set(), picked: [] };
  go('run', view === 'run'); renderQ();
}
function renderQ() {
  const v = $('#view-run'), x = S.list[S.i], q = x.q, t = T[x.t];
  S.picked = []; S.answered = false;
  const head = `<div class="backrow"><button class="linkbtn" type="button" data-quit>← Тренажери</button><span class="note">${esc(t.icon + ' ' + t.uk)} · ${S.i + 1} з ${S.list.length}</span></div><div class="bar" aria-hidden="true"><i style="width:${Math.round((S.i / S.list.length) * 100)}%"></i></div>`;
  const de = q.kind !== 'words' && q.kind !== 'order';
  if (q.kind === 'order') {
    v.innerHTML = `${head}<section class="card q"><div class="hint">Склади речення німецькою</div><div class="task" style="font-size:19px">${esc(q.prompt)}</div></section>
      <div class="line" id="line" aria-label="Твоє речення"></div><div class="pool" id="pool">${q.words.map((w, i) => `<button class="wchip" type="button" data-w="${i}" lang="de">${esc(w)}</button>`).join('')}</div>
      <button class="bigbtn" type="button" id="check" disabled>Перевірити</button><div id="fb"></div>`;
    return;
  }
  const long = q.options.some((o) => o.length > 14);
  v.innerHTML = `${head}<section class="card q"><div class="task"${de ? ' lang="de"' : ''}>${esc(q.prompt)}</div><div class="hint">${esc(q.hint || '')}</div></section>
    <div class="opts${long ? ' one' : ''}">${q.options.map((o, i) => `<button class="opt" type="button" data-o="${i}" lang="de">${esc(o)}</button>`).join('')}</div><div id="fb"></div>`;
}
function answer(ok, given) {
  const x = S.list[S.i], q = x.q;
  S.answered = true;
  srs.grade(state, x.t, q.key, ok, today()); save();
  if (ok) S.right++;
  else {
    S.missed.push(q);
    if (!S.again.has(q.key) && S.list.length < N + 5) { S.again.add(q.key); S.list.splice(Math.min(S.i + 3, S.list.length), 0, { t: x.t, q: { ...q } }); }
  }
  haptic(ok ? 'ok' : 'error');
  if (q.say && sound.has(q.say)) sound.say(q.say);
  $('#fb').innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? '✓ Правильно' : '✗ Не так'}</b><span lang="de">${esc(q.explain)}</span></div>
    <button class="bigbtn" type="button" id="next" style="margin-top:10px">${S.i + 1 < S.list.length ? 'Далі' : 'Результат'}</button>`;
  $('#next').focus({ preventScroll: true });
  $('#fb').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function finish() {
  const d = today(), done = state.days[d] || 0;
  $('#view-run').innerHTML = `<section class="card res"><div style="font-size:48px" aria-hidden="true">${S.right === S.list.length ? '🏆' : S.right >= S.list.length * 0.7 ? '💪' : '🌱'}</div>
    <div class="big">${S.right} з ${S.list.length}</div><p class="note">Сьогодні вже ${done} ${plural(done, 'відповідь', 'відповіді', 'відповідей')}.${S.missed.length ? ' Помилки повернуться для повторення.' : ''}</p>
    ${S.missed.length ? `<ul class="miss">${[...new Map(S.missed.map((q) => [q.key, q])).values()].map((q) => `<li lang="de">${esc(q.explain)}</li>`).join('')}</ul>` : ''}
    <button class="bigbtn" type="button" data-start="${esc(S.which)}">Ще ${N}</button><button class="bigbtn ghost" type="button" data-quit>До тренажерів</button></section>`;
  $('#view-run .bar') && ($('#view-run .bar i').style.width = '100%');
}
$('#view-run').addEventListener('click', (e) => {
  if (e.target.closest('[data-quit]')) { back(); return; }
  const st = e.target.closest('[data-start]'); if (st) { start(st.dataset.start); return; }
  if (e.target.closest('#next')) { S.i++; if (S.i >= S.list.length) finish(); else renderQ(); return; }
  if (!S || S.answered) return;
  const q = S.list[S.i].q;
  const o = e.target.closest('[data-o]');
  if (o) {
    const given = q.options[Number(o.dataset.o)], ok = check(q, given);
    document.querySelectorAll('.opt').forEach((b) => { b.disabled = true; if (b.textContent === q.answer) b.classList.add('right'); });
    if (!ok) o.classList.add('wrong');
    answer(ok, given); return;
  }
  const w = e.target.closest('[data-w]');
  if (w) {   // a word moves between the pool and the line
    const i = Number(w.dataset.w);
    if (w.parentElement.id === 'pool') { S.picked.push(i); $('#line').appendChild(w); } else { S.picked = S.picked.filter((x) => x !== i); $('#pool').appendChild(w); }
    $('#check').disabled = S.picked.length !== q.words.length; haptic(); return;
  }
  if (e.target.closest('#check')) {
    const given = S.picked.map((i) => q.words[i]), ok = check(q, given);
    $('#check').hidden = true; document.querySelectorAll('.wchip').forEach((b) => { b.disabled = true; });
    answer(ok, given);
  }
});

/* ---------------- the conversation ---------------- */
const SCN = [['arzt', '🩺', 'У лікаря', 'Guten Tag! Praxis Dr. Becker, was kann ich für Sie tun?'], ['amt', '🏛', 'Бюро громадян', 'Guten Tag! Was möchten Sie heute erledigen?'],
  ['laden', '🥨', 'У пекарні', 'Hallo! Was darf es sein?'], ['nachbar', '🏠', 'Сусід', 'Hallo! Sie sind neu hier im Haus, oder?'],
  ['bahn', '🚆', 'Вокзал', 'Guten Tag! Wohin möchten Sie fahren?'], ['frei', '💬', 'Вільна розмова', 'Hallo! Worüber möchtest du heute sprechen?']];
const TALK = load('a1-talk') || { level: 'a1' };
let chat = null;
function openTalk() { chat = null; go('talk'); renderTalk(); }
function renderTalk() {
  const v = $('#view-talk'), can = !!(tg && tg.initData);
  if (!chat) {
    v.innerHTML = `<div class="backrow"><button class="linkbtn" type="button" data-quit>← Тренажери</button></div>
      <section class="card"><h2 style="margin:0 0 6px">Розмова з ШІ</h2><p class="note">Вибери ситуацію й пиши німецькою, як у житті. ШІ відповідає простими реченнями й після кожного твого рядка показує, що виправити.</p>
      <div class="chips" style="margin-top:10px" role="radiogroup" aria-label="Рівень мови">${['a1', 'a2', 'b1'].map((l) => `<button class="chip" type="button" role="radio" data-tlevel="${l}" aria-pressed="${TALK.level === l}" aria-checked="${TALK.level === l}">${l.toUpperCase()}</button>`).join('')}</div></section>
      <div class="scn">${SCN.map(([id, ic, uk]) => `<button class="tr" type="button" data-scn="${id}"><span class="i" aria-hidden="true">${ic}</span><b>${esc(uk)}</b></button>`).join('')}</div>
      ${can ? '' : '<p class="note">Розмова працює через бота: відкрий «Німецька» в Telegram, щоб писати ШІ.</p>'}`;
    return;
  }
  v.innerHTML = `<div class="backrow"><button class="linkbtn" type="button" data-end>← Ситуації</button><span class="note">${esc(chat.title)} · ${chat.level.toUpperCase()}</span></div>
    <div class="chat" id="chat">${chat.lines.map(lineHTML).join('')}</div>
    <p class="note err" id="t-err" hidden></p>
    <form class="compose" id="compose"><textarea id="t-in" lang="de" rows="1" maxlength="300" placeholder="Напиши німецькою…" aria-label="Твоя відповідь німецькою" autocomplete="off" spellcheck="false"${can ? '' : ' disabled'}></textarea><button type="submit" id="t-send" aria-label="Надіслати"${can ? '' : ' disabled'}>➤</button></form>
    ${can ? '' : '<p class="note">Розмова працює через бота: відкрий «Німецька» в Telegram.</p>'}`;
  const c = $('#chat'); c.lastElementChild && c.lastElementChild.scrollIntoView({ block: 'end' });
}
function lineHTML(l) {
  if (l.r === 'a') return `<div class="msg a"><span lang="de">${esc(l.t)}</span>${l.uk ? `<small>${esc(l.uk)}</small>` : ''}</div>`;
  const fix = l.fix ? (l.fix.ok ? '<div class="fix ok">✓ Правильно</div>' : `<div class="fix bad"><b lang="de">${esc(l.fix.corrected)}</b>${l.fix.note ? `<br>${esc(l.fix.note)}` : ''}</div>`) : '';
  return `<div class="msg u" lang="de">${esc(l.t)}</div>${fix}`;
}
async function send(text) {
  const err = $('#t-err'); err.hidden = true;
  const history = chat.lines.map((l) => ({ r: l.r, t: l.t }));
  chat.lines.push({ r: 'u', t: text }); renderTalk(); $('#t-send').disabled = true;
  const fd = new FormData();
  fd.append('initData', tg.initData); fd.append('scenario', chat.id); fd.append('level', chat.level); fd.append('history', JSON.stringify(history)); fd.append('text', text);
  try {
    const r = await fetch(API + 'talk', { method: 'POST', body: fd });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.error || 'http ' + r.status);
    chat.lines[chat.lines.length - 1].fix = { ok: d.ok_line, corrected: d.corrected, note: d.note };
    chat.lines.push({ r: 'a', t: d.reply, uk: d.reply_uk });
    haptic(d.ok_line ? 'ok' : 'tap');
  } catch (e) {
    chat.lines.pop();
    renderTalk(); $('#t-in').value = text;
    const m = e.message === 'daily_limit' ? 'На сьогодні розмов досить: ліміт оновиться завтра.' : e.message === 'ai_quota' ? 'Безкоштовний ліміт ШІ на сьогодні вичерпано. Спробуй завтра.' : 'Не вдалося отримати відповідь. Перевір інтернет і спробуй ще раз.';
    const er = $('#t-err'); er.textContent = m; er.hidden = false; haptic('error'); return;
  }
  renderTalk(); $('#t-in').focus();
}
$('#view-talk').addEventListener('click', (e) => {
  if (e.target.closest('[data-quit]')) { back(); return; }
  if (e.target.closest('[data-end]')) { chat = null; renderTalk(); return; }
  const l = e.target.closest('[data-tlevel]'); if (l) { TALK.level = l.dataset.tlevel; store('a1-talk', TALK); renderTalk(); haptic(); return; }
  const s = e.target.closest('[data-scn]');
  if (s) { const [id, , uk, first] = SCN.find((x) => x[0] === s.dataset.scn); chat = { id, title: uk, level: TALK.level, lines: [{ r: 'a', t: first }] }; renderTalk(); haptic(); }
});
$('#view-talk').addEventListener('submit', (e) => {
  e.preventDefault();
  const t = $('#t-in'), text = t.value.replace(/\s+/g, ' ').trim();
  if (!text || !chat || !(tg && tg.initData)) return;
  t.value = ''; send(text);
});
$('#view-talk').addEventListener('keydown', (e) => {
  if (e.target.id === 't-in' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#compose').requestSubmit(); }
});

/* ---------------- start ---------------- */
const q0 = new URLSearchParams(location.search).get('v');
if (q0 === 'talk') { try { history.replaceState({ tr: 'talk' }, '', '?v=talk'); } catch (e) { /* file:// */ } show('talk'); renderTalk(); }
else { try { history.replaceState(null, '', location.pathname); } catch (e) { /* file:// */ } show('hub'); }
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
window.__trener = { state, question, srs };
