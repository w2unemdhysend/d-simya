// «Тренування»: a programme of home workouts (sport/plans.js), the exercises with their moving figures (sport/moves.js,
// sport/figure.js), a player that leads through a workout with a timer, sounds and the screen kept on, the week, walks,
// and the bot's reminders on workout days. Records go through yizha/store.js like the food diary:
// s|sport {plan, start, days, time} · x|<day>~<id> {kind 'w' (workout) | 'walk', plan, wk, title, min, kcal, at}
import { esc, API } from '../assets/site.js';
import { berlinDay } from '../smittia/due.js';
import * as db from '../yizha/store.js';
import { valid, burnt, dayNum, dayOf } from '../yizha/calc.js';
import { MOVES, MOVE, GROUPS } from './moves.js';
import { PLANS, PLAN, weekOf, stepOf, steps as stepsOf, seconds, kcalOf, nextWorkout } from './plans.js';
import { play, still, VIEWBOX } from './figure.js';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const tgApp = window.Telegram && window.Telegram.WebApp;
const tg = tgApp && tgApp.platform && tgApp.platform !== 'unknown' ? tgApp : null;
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
const haptic = (k) => { try { if (!tg || !tg.HapticFeedback) return; if (k === 'heavy' || k === 'light') tg.HapticFeedback.impactOccurred(k); else if (k) tg.HapticFeedback.notificationOccurred(k); else tg.HapticFeedback.selectionChanged(); } catch (e) { /* no haptics */ } };
const pr = new Intl.PluralRules('uk-UA');
const plural = (n, one, few, many) => ({ one, few, many }[pr.select(n)] || many);
const fmt = (n) => Number(n || 0).toLocaleString('uk-UA', { maximumFractionDigits: 0 });
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
const today = () => berlinDay(new Date());
const wdOf = (day) => (new Date(day + 'T12:00:00Z').getUTCDay() + 6) % 7;   // 0 = Monday
const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];
const dayText = (day) => new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;
const SVG = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 5h3v14h-3zM13.5 5h3v14h-3z" fill="currentColor"/></svg>',
  prev: SVG('<path d="M6 5v14M18 6l-9 6 9 6z"/>'), next: SVG('<path d="M18 5v14M6 6l9 6-9 6z"/>'),
  x: SVG('<path d="M6 6l12 12M18 6L6 18"/>'), walk: SVG('<circle cx="13" cy="4.5" r="1.8"/><path d="M10 21l2.5-6.5L15 17v4M9 11.5l2-3.5 3 1.5 2 3M12.5 14.5L11 9"/>'),
  sound: SVG('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  mute: SVG('<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
};
const figHTML = (move, cls = '') => `<svg class="fig ${cls}" viewBox="${VIEWBOX}" role="img" aria-label="${esc(move.uk)}">${still(move)}</svg>`;

/* ---------- the person and the programme ---------- */
function kgNow() {
  const ws = db.all('w').filter((w) => w.kg > 0).sort((a, b) => (a.id < b.id ? -1 : 1));
  if (ws.length) return Number(ws[ws.length - 1].kg);
  const p = db.get('p', 'me');
  return valid(p) ? p.start.kg : 70;
}
const settings = () => { const s = db.get('s', 'sport'); return s && PLAN[s.plan] ? s : null; };
const records = () => db.all('x').sort((a, b) => (b.at || 0) - (a.at || 0));
const doneIn = (s) => db.all('x').filter((x) => x.kind === 'w' && x.plan === s.plan && x.id.slice(0, 10) >= s.start).length;
function nextOf(s) {
  const plan = PLAN[s.plan], wk = nextWorkout(plan, doneIn(s)), week = weekOf(s.start, today()), list = stepsOf(plan.id, wk, week);
  return { plan, wk, week, list, secs: seconds(list), kcal: kcalOf(list, kgNow()), step: stepOf(plan.id, week) };
}

/* ---------- today ---------- */
let choose = { plan: 'soft', days: [0, 2, 4] };
function renderToday() {
  const v = $('#view-today'), s = settings();
  if (!s) {
    v.innerHTML = `<section class="card hero">
      <h2>Вибери програму</h2>
      <p class="note">Три тренування на тиждень по 20–30 хвилин удома. Кожні два тижні трохи складніше.</p>
      <div class="opts" role="radiogroup" aria-label="Програма">${PLANS.map((p) => `<button type="button" class="opt" role="radio" data-plan="${p.id}" aria-checked="${choose.plan === p.id}"><i></i><span><b>${esc(p.uk)} · ${esc(p.level)}</b><small>${esc(p.note)}</small></span></button>`).join('')}</div>
      <div class="field"><span>У які дні</span><div class="dchips" role="group" aria-label="Дні тренувань">${WD.map((d, i) => `<button class="chip" type="button" data-cday="${i}" aria-pressed="${choose.days.includes(i)}">${d}</button>`).join('')}</div></div>
      <p class="note small">Між тренуваннями варто давати м’язам день відпочинку, наприклад пн, ср, пт.</p>
      <button class="btn primary go" type="button" id="start">Почати програму</button>
    </section>${movesTeaser()}`;
    return;
  }
  const n = nextOf(s), t = today(), recs = records(), todays = recs.filter((x) => x.id.startsWith(t));
  const planned = s.days.includes(wdOf(t)), trained = todays.some((x) => x.kind === 'w');
  const mon = dayOf(dayNum(t) - wdOf(t)), weekDays = Array.from({ length: 7 }, (_, i) => dayOf(dayNum(mon) + i));
  const weekDone = recs.filter((x) => x.kind === 'w' && x.id.slice(0, 10) >= mon).length;
  const kinds = [...new Set(n.wk.circle)];
  v.innerHTML = `<section class="card hero" aria-labelledby="h-next">
      <div class="eyebrow">${esc(n.plan.uk)} · тиждень ${n.week}</div>
      <h2 id="h-next">Тренування ${n.wk.id}: ${esc(n.wk.uk)}</h2>
      <div class="meta"><span class="badge">≈ ${Math.round(n.secs / 60)} хв</span><span class="badge">≈ ${fmt(n.kcal)} ккал</span><span class="badge">${kinds.length} вправ × ${n.step.rounds} ${plural(n.step.rounds, 'коло', 'кола', 'кіл')}</span><span class="badge">${n.step.work} с / ${n.step.rest} с</span></div>
      ${trained ? '<p class="note ok">✓ Сьогодні тренування вже є. Молодець! Можна ще прогулятися.</p>' : planned ? '' : '<p class="note">Сьогодні за розкладом відпочинок. Найкращий відпочинок — прогулянка. Але якщо хочеться, тренуйся.</p>'}
      <div class="strip">${kinds.map((id) => `<button class="thumb" type="button" data-move="${id}">${figHTML(MOVE[id])}<small>${esc(MOVE[id].uk)}</small></button>`).join('')}</div>
      <button class="btn primary go" type="button" id="go">${I.play}${trained ? 'Ще одне тренування' : 'Почати тренування'}</button>
    </section>
    <section class="card" aria-labelledby="h-week">
      <div class="hrow"><h2 id="h-week">Цей тиждень</h2><span class="badge${weekDone >= s.days.length ? ' ok' : ''}">${weekDone} з ${s.days.length}</span></div>
      <div class="week">${weekDays.map((d) => {
        const r = recs.filter((x) => x.id.startsWith(d)), w = r.some((x) => x.kind === 'w'), walk = r.some((x) => x.kind === 'walk');
        return `<div class="wd${s.days.includes(wdOf(d)) ? ' plan' : ''}${w ? ' done' : walk ? ' walk' : ''}${d === t ? ' today' : ''}"><i>${w ? '✓' : walk ? '•' : ''}</i><b>${WD[wdOf(d)]}</b></div>`;
      }).join('')}</div>
    </section>
    <section class="card" aria-labelledby="h-walk">
      <h2 id="h-walk">Прогулянка</h2>
      <p class="note">Швидка ходьба — найпростіший рух для схуднення. Запиши, скільки гуляв(ла):</p>
      <div class="chips">${[20, 30, 45, 60, 90].map((m) => `<button class="chip" type="button" data-walk="${m}">${m} хв</button>`).join('')}</div>
    </section>
    ${recs.length ? `<section class="card" aria-labelledby="h-hist"><h2 id="h-hist">Історія</h2><ul class="hist">${recs.slice(0, 10).map((x) => `<li><span class="fi" aria-hidden="true">${x.kind === 'walk' ? '🚶' : '💪'}</span><span class="t"><b>${esc(x.title || (x.kind === 'walk' ? 'Прогулянка' : 'Тренування'))}</b><small>${esc(dayText(x.id.slice(0, 10)))} · ${x.min} хв · ${fmt(x.kcal)} ккал</small></span><button class="iconbtn" type="button" data-unrec="${esc(x.id)}" aria-label="Видалити запис">${I.x}</button></li>`).join('')}</ul></section>` : ''}
    <p class="sync" id="sync"></p>`;
  paintSync();
}
const movesTeaser = () => `<section class="card"><h2>Як виглядають вправи</h2><div class="strip" style="margin-top:8px">${['squat', 'wallpush', 'bridge', 'birddog', 'plank'].map((id) => `<button class="thumb" type="button" data-move="${id}">${figHTML(MOVE[id])}<small>${esc(MOVE[id].uk)}</small></button>`).join('')}</div></section>`;
function paintSync() {
  const el = $('#sync'); if (!el) return;
  const m = db.status.mode;
  el.className = 'sync ' + m;
  el.textContent = m === 'local' ? 'Записи зберігаються на цьому пристрої.' : m === 'ok' ? 'Синхронізовано' : m === 'off' ? 'Немає зв’язку: збережено на телефоні' : m === 'denied' ? 'Синхронізація лише для родини' : m === 'err' ? 'Сервер не відповідає: збережено на телефоні' : 'Синхронізую…';
}

/* ---------- exercises ---------- */
let watcher = null;
const playing = new Map();
function renderMoves() {
  const v = $('#view-moves');
  v.innerHTML = `<p class="note">Натисни на вправу: покажу рух ближче, як робити правильно, типові помилки й легший варіант. Зелена позначка — без стрибків, бережно до колін.</p>` +
    GROUPS.map((g) => `<h3 class="group">${esc(g.uk)}</h3><div class="moves">${MOVES.filter((m) => m.group === g.id).map((m) => `<button class="mcard" type="button" data-move="${m.id}">${figHTML(m, 'anim')}<b>${esc(m.uk)}</b><small>${esc(m.muscles)}</small>${m.low ? '<small style="color:var(--ok)">● без стрибків</small>' : '<small style="color:var(--accent)">● зі стрибками</small>'}</button>`).join('')}</div>`).join('');
  if (watcher) watcher.disconnect();
  playing.forEach((h) => h.stop()); playing.clear();
  if (!('IntersectionObserver' in window)) return;
  watcher = new IntersectionObserver((list) => {
    for (const e of list) {
      const svg = e.target, id = svg.closest('[data-move]').dataset.move;
      if (e.isIntersecting && !playing.has(svg)) playing.set(svg, play(svg, MOVE[id]));
      else if (!e.isIntersecting && playing.has(svg)) { playing.get(svg).stop(); playing.delete(svg); }
    }
  }, { rootMargin: '40px' });
  $$('#view-moves .fig.anim').forEach((svg) => watcher.observe(svg));
}
let sheetFig = null;
function openMove(id) {
  const m = MOVE[id]; if (!m) return;
  $('#sheet-title').textContent = m.uk;
  $('#sheet-body').innerHTML = `<div class="mbig"><svg class="fig" id="mfig" viewBox="${VIEWBOX}" role="img" aria-label="${esc(m.uk)}: анімація"></svg></div>
    <div class="meta"><span class="badge">${esc(m.muscles)}</span>${m.low ? '<span class="badge ok">без стрибків</span>' : '<span class="badge warn">зі стрибками</span>'}</div>
    <section><h3 class="group">Як робити</h3><ol class="steps">${m.how.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>
    <section><h3 class="group">Помилки</h3><ul class="warnlist">${m.mistakes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
    <div class="stats" style="margin-top:0"><div class="stat"><small>Легше</small><b style="font-size:14.5px;font-weight:500">${esc(m.easier)}</b></div><div class="stat"><small>Складніше</small><b style="font-size:14.5px;font-weight:500">${esc(m.harder)}</b></div></div>
    <p class="note"><b>Дихання:</b> ${esc(m.breath)}</p>`;
  $('#sheet').hidden = false; document.documentElement.classList.add('sheet-open');
  try { history.pushState({ sheet: 1 }, ''); } catch (e) { /* no history */ }
  if (sheetFig) sheetFig.stop();
  sheetFig = play($('#mfig'), m, { always: true });
  haptic('light');
}
function closeSheet(fromHistory) {
  if ($('#sheet').hidden) return;
  if (sheetFig) { sheetFig.stop(); sheetFig = null; }
  $('#sheet').hidden = true; document.documentElement.classList.remove('sheet-open');
  if (!fromHistory && history.state && history.state.sheet) history.back();
}
window.addEventListener('popstate', () => { closeSheet(true); });

/* ---------- schedule and reminders ---------- */
const HALF = Array.from({ length: 34 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
let rem = load('sport-remind', { on: false }), remLoaded = false;
async function remindCall(action, extra = {}) {
  const fd = new FormData(); fd.append('initData', tg.initData); fd.append('kind', 'sport'); fd.append('action', action);
  for (const [k, v] of Object.entries(extra)) fd.append(k, String(v));
  const r = await fetch(API + 'reminders', { method: 'POST', body: fd });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'http ' + r.status);
  return d;
}
function remindPrefs() {
  const s = settings(); if (!s) return {};
  const n = nextOf(s);
  return { days: s.days.join(','), time: s.time || '18:00', next: `Тренування ${n.wk.id}: ${n.wk.uk}`, mins: Math.round(n.secs / 60) };
}
function renderPlan() {
  const v = $('#view-plan'), s = settings(), can = !!(tg && tg.initData);
  if (!s) { v.innerHTML = '<p class="note">Спершу вибери програму на вкладці «Сьогодні».</p>'; return; }
  const n = nextOf(s);
  v.innerHTML = `<section class="card" aria-labelledby="h-prog">
      <h2 id="h-prog">Програма</h2>
      <div class="opts" role="radiogroup" aria-label="Програма" style="margin-top:10px">${PLANS.map((p) => `<button type="button" class="opt" role="radio" data-switch="${p.id}" aria-checked="${s.plan === p.id}"><i></i><span><b>${esc(p.uk)} · ${esc(p.level)}</b><small>${esc(p.note)}</small></span></button>`).join('')}</div>
      <p class="note small">Тиждень ${n.week}: ${n.step.rounds} ${plural(n.step.rounds, 'коло', 'кола', 'кіл')}, ${n.step.work} с вправа і ${n.step.rest} с відпочинок. Виконано тренувань у програмі: ${doneIn(s)}.</p>
      <button class="linkbtn" type="button" id="restart">Почати програму спочатку</button>
    </section>
    <section class="card" aria-labelledby="h-days">
      <h2 id="h-days">Дні й час</h2>
      <div class="dchips" role="group" aria-label="Дні тренувань" style="margin-top:10px">${WD.map((d, i) => `<button class="chip" type="button" data-sday="${i}" aria-pressed="${s.days.includes(i)}">${d}</button>`).join('')}</div>
      <label class="field" style="margin-top:12px"><span>Час</span><select id="s-time">${HALF.map((h) => `<option${h === (s.time || '18:00') ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
      <div class="remind"><div class="row"><span class="t"><b id="l-sport">Нагадування від бота</b><small>У дні тренувань у вибраний час: яке тренування на черзі. Мовчить, якщо ти вже потренувався(лася).</small></span>
        <button class="switch" type="button" role="switch" id="r-sport" aria-labelledby="l-sport" aria-checked="${!!rem.on}"${can ? '' : ' disabled'}></button></div></div>
      ${can ? '<p class="state" id="r-state"></p>' : '<p class="note">Нагадування надсилає бот: відкрий «Тренування» через бота в Telegram.</p>'}
    </section>`;
  if (can && !remLoaded) {
    remLoaded = true;
    remindCall('status').then((d) => { rem = { on: !!d.on }; store('sport-remind', rem); if (!$('#view-plan').contains(document.activeElement)) renderPlan(); }).catch(() => {});
  }
}
async function pushPrefs() { if (rem.on && tg && tg.initData) { try { await remindCall('prefs', remindPrefs()); } catch (e) { /* the next change sends it */ } } }

/* ---------- the player ---------- */
const P = { list: [], i: 0, endAt: 0, left: 0, running: false, raf: 0, fig: null, figMove: '', sound: load('sport-sound', true), wake: null, n: null, done: 0, beeped: -1, ask: false };
let audio = null;
function beep(freq = 880, ms = 120, vol = 0.18) {
  if (!P.sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; o.type = 'sine'; g.gain.value = vol;
    o.connect(g); g.connect(audio.destination);
    const t = audio.currentTime; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
    o.start(t); o.stop(t + ms / 1000 + 0.02);
  } catch (e) { /* no sound here */ }
}
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator && !P.wake) { P.wake = await navigator.wakeLock.request('screen'); P.wake.addEventListener('release', () => { P.wake = null; }); }
    if (!on && P.wake) { await P.wake.release(); P.wake = null; }
  } catch (e) { /* not allowed: the screen may dim */ }
}
const PHASE = { ready: 'Приготуйся', warm: 'Розминка', work: '', rest: 'Відпочинок', cool: 'Заминка' };
function startWorkout() {
  const s = settings(); if (!s) return;
  P.n = nextOf(s);
  P.list = [{ kind: 'ready', move: P.n.list[0].move, secs: 5 }, ...P.n.list];
  P.i = 0; P.done = 0; P.ask = false;
  try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { /* no sound */ }
  $('#player').hidden = false; document.body.classList.add('playing');
  try { if (tg) { if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); if (tg.enableClosingConfirmation) tg.enableClosingConfirmation(); } } catch (e) { /* older Telegram */ }
  try { history.pushState({ player: 1 }, ''); } catch (e) { /* no history */ }
  keepAwake(true); paintSound();
  enterStep(true);
}
function enterStep(run) {
  const st = P.list[P.i];
  P.left = st.secs * 1000; P.beeped = -1;
  renderStep();
  if (run) resume(); else { P.running = false; paintCtrl(); }
}
function renderStep() {
  const st = P.list[P.i], m = MOVE[st.move], nextStep = P.list.slice(P.i + 1).find((x) => x.kind !== 'rest');
  const phase = st.kind === 'work' ? `Коло ${st.round} з ${st.rounds} · вправа ${st.i} з ${st.n}` : st.kind === 'rest' ? 'Відпочинок · далі' : PHASE[st.kind];
  $('#p-body').innerHTML = `<div class="p-phase${st.kind === 'rest' || st.kind === 'ready' ? ' rest' : ''}">${esc(phase)}</div>
    <h2 class="p-name">${esc(m.uk)}</h2>
    <div class="p-stage"><svg class="fig" id="p-fig" viewBox="${VIEWBOX}" role="img" aria-label="${esc(m.uk)}"></svg></div>
    <div class="p-timer" id="p-timer" aria-live="off">${mmss(Math.ceil(P.left / 1000))}</div>
    <p class="p-tip">${esc(st.kind === 'rest' || st.kind === 'ready' ? m.how[0] : m.how[1] || m.how[0])}</p>
    ${nextStep && st.kind !== 'rest' && st.kind !== 'ready' ? `<div class="p-next">Далі: <b>${esc(MOVE[nextStep.move].uk)}</b></div>` : '<div class="p-next">&nbsp;</div>'}
    <div class="p-ctrl"><button type="button" id="p-prev" aria-label="Попередня вправа">${I.prev}</button><button type="button" class="main" id="p-play" aria-label="Пауза">${I.pause}</button><button type="button" id="p-next" aria-label="Наступна вправа">${I.next}</button></div>`;
  if (P.fig) P.fig.stop();
  P.fig = play($('#p-fig'), m, { always: true, speed: st.kind === 'rest' || st.kind === 'ready' ? 0.8 : 1 });
  if (!P.running && P.fig) P.fig.pause();
  const total = seconds(P.list), before = seconds(P.list.slice(0, P.i));
  $('#p-bar').style.width = Math.round((before / total) * 100) + '%';
  paintCtrl();
}
function paintCtrl() {
  const b = $('#p-play'); if (!b) return;
  b.innerHTML = P.running ? I.pause : I.play; b.setAttribute('aria-label', P.running ? 'Пауза' : 'Продовжити');
}
function resume() {
  P.running = true; P.endAt = performance.now() + P.left;
  if (P.fig) P.fig.resume();
  paintCtrl(); cancelAnimationFrame(P.raf); P.raf = requestAnimationFrame(tick);
}
function pause() {
  if (!P.running) return;
  P.running = false; P.left = Math.max(0, P.endAt - performance.now());
  if (P.fig) P.fig.pause();
  cancelAnimationFrame(P.raf); paintCtrl();
}
function tick(now) {
  if (!P.running) return;
  P.left = Math.max(0, P.endAt - now);
  const s = Math.ceil(P.left / 1000), el = $('#p-timer');
  if (el) { const txt = mmss(s); if (el.textContent !== txt) el.textContent = txt; el.classList.toggle('low', s <= 3 && P.list[P.i].kind !== 'ready'); }
  if (s <= 3 && s >= 1 && P.beeped !== s) { P.beeped = s; beep(660, 90); }
  if (P.left <= 0) { advance(1, true); return; }
  P.raf = requestAnimationFrame(tick);
}
function advance(dir, finished) {
  const st = P.list[P.i];
  if (dir > 0 && st.kind !== 'ready') P.done += finished ? st.secs : Math.round(st.secs - P.left / 1000);
  P.i += dir;
  if (P.i < 0) P.i = 0;
  if (P.i >= P.list.length) { finish(); return; }
  const nx = P.list[P.i];
  beep(nx.kind === 'rest' ? 520 : 990, nx.kind === 'rest' ? 200 : 260, 0.22);
  haptic(nx.kind === 'rest' ? 'light' : 'heavy');
  enterStep(P.running || finished);
}
function record(secs) {
  const s = settings(), n = P.n, min = Math.max(1, Math.round(secs / 60));
  const kcal = kcalOf(n.list, kgNow(), secs);
  db.put('x', `${today()}~${db.rid()}`, { kind: 'w', plan: s.plan, wk: n.wk.id, title: `Тренування ${n.wk.id}: ${n.wk.uk}`, min, kcal, at: Date.now() });
  pushPrefs();
  return { min, kcal };
}
function finish() {
  pause(); if (P.fig) { P.fig.stop(); P.fig = null; }
  const r = record(P.done), s = settings(), next = nextOf(s);
  $('#p-bar').style.width = '100%';
  beep(1046, 400, 0.25); haptic('success');
  $('#p-body').innerHTML = `<div class="p-done"><div style="font-size:56px" aria-hidden="true">💪</div><div class="big">Готово!</div>
    <div class="stats"><div class="stat"><small>Хвилин</small><b>${r.min}</b></div><div class="stat"><small>Спалено приблизно</small><b>${fmt(r.kcal)} ккал</b></div></div>
    <p class="note">Записано. Наступного разу: тренування ${next.wk.id} «${esc(next.wk.uk)}». Не забудь попити води.</p>
    <button class="btn primary go" type="button" id="p-ok">Готово</button></div>`;
}
function askStop() {
  pause(); P.ask = true;
  const cur = P.list[P.i], doneNow = P.done + (cur && cur.kind !== 'ready' ? Math.round(cur.secs - P.left / 1000) : 0);
  if (doneNow < 60) { closePlayer(); return; }
  $('#p-body').innerHTML = `<div class="p-done"><div class="big">Завершити?</div><p class="note">Виконано ${Math.round(doneNow / 60)} хв з ${Math.round(seconds(P.list) / 60)}.</p>
    <button class="btn primary" type="button" id="p-save" data-secs="${doneNow}">Записати й завершити</button>
    <button class="btn" type="button" id="p-resume">Продовжити тренування</button>
    <button class="btn danger" type="button" id="p-drop">Завершити без запису</button></div>`;
}
function closePlayer(fromHistory) {
  if ($('#player').hidden) return;
  pause(); if (P.fig) { P.fig.stop(); P.fig = null; }
  $('#player').hidden = true; document.body.classList.remove('playing'); keepAwake(false);
  try { if (tg) { if (tg.enableVerticalSwipes) tg.enableVerticalSwipes(); if (tg.disableClosingConfirmation) tg.disableClosingConfirmation(); } } catch (e) { /* older Telegram */ }
  if (!fromHistory && history.state && history.state.player) history.back();
  renderAll();
}
function paintSound() { const b = $('#p-sound'); b.innerHTML = P.sound ? I.sound : I.mute; b.setAttribute('aria-pressed', String(P.sound)); b.setAttribute('aria-label', P.sound ? 'Вимкнути звук' : 'Увімкнути звук'); }
window.addEventListener('popstate', () => { if (!$('#player').hidden) { if (P.ask) closePlayer(true); else { askStop(); try { history.pushState({ player: 1 }, ''); } catch (e) { /* no history */ } } } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !$('#player').hidden) keepAwake(true); });

/* ---------- toast ---------- */
let toastTimer = null, undoFn = null;
function toast(text, undo) {
  $('#toast-text').textContent = text; $('#toast-undo').hidden = !undo; undoFn = undo || null;
  $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; undoFn = null; }, 4500);
}
$('#toast-undo').addEventListener('click', () => { if (undoFn) undoFn(); undoFn = null; $('#toast').hidden = true; });

/* ---------- tabs ---------- */
const VIEWS = { today: '#view-today', moves: '#view-moves', plan: '#view-plan' };
let tab = (() => { const t = new URLSearchParams(location.search).get('tab'); return VIEWS[t] ? t : 'today'; })();
function showTab(t, instant) {
  tab = t;
  $$('#tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  if (window.UI) { UI.tabsThumb(instant); UI.switchView(Object.values(VIEWS).map((s) => $(s)), $(VIEWS[t]), { instant }); }
  else Object.entries(VIEWS).forEach(([k, s]) => { $(s).hidden = k !== t; });
  try { history.replaceState(history.state, '', t === 'today' ? location.pathname : '?tab=' + t); } catch (e) { /* file:// */ }
}
function renderAll() {
  const a = document.activeElement, keep = a && a.matches && a.matches('input, select, textarea') && a.closest('.view');
  if (!keep || keep.id !== 'view-today') renderToday();
  if (!keep || keep.id !== 'view-plan') renderPlan();
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  const tb = t.closest('#tabs [role="tab"]'); if (tb) { if (tb.dataset.tab !== tab) { showTab(tb.dataset.tab); haptic(); } return; }
  const pl = t.closest('[data-plan]'); if (pl) { choose.plan = pl.dataset.plan; $$('[data-plan]').forEach((b) => b.setAttribute('aria-checked', String(b === pl))); haptic(); return; }
  const cd = t.closest('[data-cday]'); if (cd) { const d = Number(cd.dataset.cday); choose.days = choose.days.includes(d) ? choose.days.filter((x) => x !== d) : [...choose.days, d].sort(); cd.setAttribute('aria-pressed', String(choose.days.includes(d))); haptic(); return; }
  if (t.closest('#start')) { if (!choose.days.length) { haptic('error'); toast('Вибери хоча б один день'); return; } db.put('s', 'sport', { plan: choose.plan, start: today(), days: choose.days, time: '18:00' }); haptic('success'); renderAll(); toast('Програму вибрано. Почнімо!'); return; }
  if (t.closest('#go')) { startWorkout(); return; }
  const mv = t.closest('[data-move]'); if (mv) { openMove(mv.dataset.move); return; }
  if (t.closest('[data-close]')) { closeSheet(); return; }
  const wk = t.closest('[data-walk]');
  if (wk) { const min = Number(wk.dataset.walk), id = `${today()}~${db.rid()}`; db.put('x', id, { kind: 'walk', title: 'Прогулянка', min, kcal: burnt(3.5, kgNow(), min), at: Date.now() }); haptic('success'); toast(`Прогулянку записано: ${min} хв`, () => db.del('x', id)); return; }
  const ur = t.closest('[data-unrec]'); if (ur) { const id = ur.dataset.unrec, v = db.get('x', id); db.del('x', id); haptic(); toast('Запис видалено', () => db.put('x', id, v)); return; }
  // schedule
  const sw = t.closest('[data-switch]');
  if (sw) { const s = settings(); if (s && s.plan !== sw.dataset.switch) { db.put('s', 'sport', { ...s, plan: sw.dataset.switch, start: today() }); haptic('success'); toast('Програму змінено'); pushPrefs(); } return; }
  if (t.closest('#restart')) { const s = settings(); db.put('s', 'sport', { ...s, start: today() }); toast('Програма почнеться з першого тижня'); pushPrefs(); return; }
  const sd = t.closest('[data-sday]');
  if (sd) { const s = settings(), d = Number(sd.dataset.sday), days = s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d].sort(); if (!days.length) { haptic('error'); return; } db.put('s', 'sport', { ...s, days }); haptic(); pushPrefs(); return; }
  const rs = t.closest('#r-sport');
  if (rs && !rs.disabled) {
    const on = rs.getAttribute('aria-checked') !== 'true', st = $('#r-state');
    rs.classList.add('busy'); rs.disabled = true;
    remindCall(on ? 'on' : 'off', remindPrefs()).then((d) => {
      if (d.error === 'bot_blocked') throw new Error('blocked');
      rem = { on: !!d.on }; store('sport-remind', rem);
      if (st) { st.className = 'state on'; st.textContent = on ? 'Увімкнено. Бот надіслав підтвердження в чат.' : 'Вимкнено.'; }
      haptic(on ? 'success' : null);
    }).catch((er) => { if (st) { st.className = 'state err'; st.textContent = er.message === 'blocked' ? 'Бот не може написати: відкрий чат з ботом і натисни «Старт».' : 'Не вдалося. Перевір інтернет і спробуй ще раз.'; } haptic('error'); })
      .finally(() => { rs.classList.remove('busy'); rs.disabled = false; rs.setAttribute('aria-checked', String(!!rem.on)); });
    return;
  }
  // player
  if (t.closest('#p-play')) { if (P.running) pause(); else resume(); haptic('light'); return; }
  if (t.closest('#p-next')) { advance(1, false); return; }
  if (t.closest('#p-prev')) { const back = P.left > (P.list[P.i].secs - 3) * 1000 ? -1 : 0; if (back) advance(-1, false); else enterStep(P.running); return; }
  if (t.closest('#p-close')) { if (P.ask) closePlayer(); else askStop(); return; }
  if (t.closest('#p-sound')) { P.sound = !P.sound; store('sport-sound', P.sound); paintSound(); if (P.sound) beep(); return; }
  if (t.closest('#p-ok')) { closePlayer(); return; }
  if (t.closest('#p-save')) { const r = record(Number(t.closest('#p-save').dataset.secs)); closePlayer(); toast(`Записано: ${r.min} хв, ≈ ${fmt(r.kcal)} ккал`); return; }
  if (t.closest('#p-resume')) { P.ask = false; renderStep(); resume(); return; }
  if (t.closest('#p-drop')) { closePlayer(); }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 's-time') { const s = settings(); db.put('s', 'sport', { ...s, time: e.target.value }); pushPrefs(); }
});
document.addEventListener('keydown', (e) => {
  if (!$('#player').hidden) { if (e.key === ' ') { e.preventDefault(); if (P.running) pause(); else resume(); } else if (e.key === 'Escape') { e.preventDefault(); if (P.ask) closePlayer(); else askStop(); } return; }
  if (e.key === 'Escape' && !$('#sheet').hidden) { e.preventDefault(); closeSheet(); }
});

db.on(({ status }) => { if (status) { paintSync(); return; } if ($('#player').hidden) renderAll(); });
renderToday(); renderMoves(); renderPlan();
showTab(tab, true);
window.__sport = { db, P, settings, nextOf, advance };
