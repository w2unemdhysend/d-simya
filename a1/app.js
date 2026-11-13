// «Німецька A1»: 16 chapters in the order of Die neue Linie 1 (A1.1 and A1.2). Our own explanations in Ukrainian,
// examples, phrases, a dialogue and exercises per chapter; a dictionary of every word with its article, plural or
// verb forms and a recorded clip; a grammar index. Progress (solved exercises, the last chapter) stays on the phone
// and in Telegram's cloud. Screens: the course, a chapter (4 tabs), the dictionary, the grammar index.
import { WORDS, KINDS, sayOf, byChapter } from './data/wortschatz.js';
import k01 from './data/k01.js'; import k02 from './data/k02.js'; import k03 from './data/k03.js'; import k04 from './data/k04.js';
import k05 from './data/k05.js'; import k06 from './data/k06.js'; import k07 from './data/k07.js'; import k08 from './data/k08.js';
import k09 from './data/k09.js'; import k10 from './data/k10.js'; import k11 from './data/k11.js'; import k12 from './data/k12.js';
import k13 from './data/k13.js'; import k14 from './data/k14.js'; import k15 from './data/k15.js'; import k16 from './data/k16.js';
import { $, $$, tg, haptic, toast, load, store, cloudGet, cloudSet, plural, SPEAKER } from '../igry/kit.js';
import { esc, md, norm, fold, order, CATS, heroAll, GENDER_KEY } from './text.js';
import { person, avatar, isHero } from './people.js';
import * as sound from '../audio/say.js';
import * as garden from '../igry/garten.js';

// The chapters as written (both forms, {Тарас|Леся}) and as shown: in the form chosen in the menu's settings
const RAW = [k01, k02, k03, k04, k05, k06, k07, k08, k09, k10, k11, k12, k13, k14, k15, k16];
const gender = () => { try { return localStorage.getItem(GENDER_KEY) === 'f' ? 'f' : 'm'; } catch (e) { return 'm'; } };
export let CHAPTERS = RAW.map((c) => heroAll(c, gender()));
const TABS = ['gram', 'words', 'phr', 'tasks'];

/* ---------------- progress: solved exercises "chapter:index", the last chapter ---------------- */
const KEY = 'a1-progress';
const P = { done: {}, last: 0 };
(function init() { const s = load(KEY); if (s && s.done && typeof s.done === 'object') P.done = s.done; if (s && s.last >= 1 && s.last <= 16) P.last = s.last; })();
let cloudTimer = null;
function saveP() { store(KEY, P); clearTimeout(cloudTimer); cloudTimer = setTimeout(() => cloudSet('a1', { d: Object.keys(P.done).join(','), l: P.last }), 1500); }
cloudGet('a1').then((c) => {   // another phone: what was solved there counts here too
  if (!c || typeof c.d !== 'string') return;
  let more = false;
  for (const k of c.d.split(',')) if (/^\d+:\d+$/.test(k) && !P.done[k]) { P.done[k] = 1; more = true; }
  if (!P.last && c.l >= 1 && c.l <= 16) { P.last = c.l; more = true; }
  if (!more) return;
  store(KEY, P);
  if (current === 'hub') renderHub(); else if (current === 'ch') { $$('#p-tasks .task').forEach((card) => { if (P.done[chapter + ':' + card.dataset.task]) markDone(card); }); renderTasksHead(); }
});
const solved = (n) => CHAPTERS[n - 1].tasks.filter((t, i) => P.done[n + ':' + i]).length;

// the article in its colour; a word used only in the plural gets a plain "die" (red would say feminine)
const ART = (e) => (e.art ? `<span class="art ${e.plOnly ? 'pl' : e.art}">${e.art}</span> ` : '');
const ICON = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const GO = ICON('<path d="M9 6l6 6-6 6"/>').replace('<svg', '<svg class="go"');

/* ---------------- screens and the history ---------------- */
const views = ['hub', 'ch', 'dict', 'gram'].map((v) => $('#view-' + v));
let current = null, chapter = 0, tab = 'gram';

function header() {
  const c = CHAPTERS[chapter - 1];
  $('#backbtn').hidden = current === 'hub'; $('#lede').hidden = current !== 'hub';
  $('#eyebrow').textContent = current === 'hub' ? 'Навчання · Die neue Linie 1' : current === 'ch' ? `Розділ ${c.n} · ${c.part}` : 'Німецька A1';
  $('#title').textContent = current === 'hub' ? 'Німецька A1' : current === 'ch' ? c.title : current === 'dict' ? 'Словник' : 'Граматика';
  document.title = current === 'hub' ? 'Німецька A1' : $('#title').textContent + ' · Німецька A1';
}
function show(view, o = {}) {
  const prev = current, prevCh = chapter;
  current = view;
  if (view === 'ch') { chapter = o.ch; tab = TABS.includes(o.tab) ? o.tab : 'gram'; renderChapter(); if (P.last !== chapter) { P.last = chapter; saveP(); } }
  if (view === 'hub') renderHub();
  if (view === 'dict' && prev !== 'dict') renderDict();
  if (view === 'gram') renderGram();
  header();
  const toTopic = () => {
    if (!o.topic) return;
    const t = document.getElementById('t-' + o.topic); if (!t) return;
    t.scrollIntoView({ block: 'start' }); t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
  };
  const done = () => { if (view === 'ch' && window.UI) UI.tabsThumb(true); toTopic(); };
  if (prev === view) { views.forEach((v) => { v.hidden = v.id !== 'view-' + view; }); if (view !== 'ch' || prevCh !== chapter) window.scrollTo(0, 0); done(); }
  else if (window.UI) UI.switchView(views, $('#view-' + view), { instant: !!o.instant, done });
  else { views.forEach((v) => { v.hidden = v.id !== 'view-' + view; }); window.scrollTo(0, 0); done(); }
  if (tg && tg.BackButton) try { if (view === 'hub') tg.BackButton.hide(); else tg.BackButton.show(); } catch (e) {}
}
const urlOf = (view, o = {}) => (view === 'hub' ? location.pathname : view === 'ch' ? `?ch=${o.ch}${o.tab && o.tab !== 'gram' ? '&tab=' + o.tab : ''}${o.topic ? '&t=' + o.topic : ''}` : '?view=' + view);
// every screen is a step in the history (the phone's Back returns), except the next chapter, which replaces this one
function go(view, o = {}, replace) {
  const d = (history.state && history.state.d) || 0;
  const st = { a1: view, ch: o.ch, tab: o.tab, topic: o.topic, d: replace ? d : d + 1 };
  try { history[replace ? 'replaceState' : 'pushState'](st, '', urlOf(view, o)); } catch (e) {}
  haptic(); show(view, o);
}
function back() {
  if (history.state && history.state.d) history.back();
  else { try { history.replaceState(null, '', location.pathname); } catch (e) {} show('hub'); }
}
function fromUrl() {
  const q = new URLSearchParams(location.search), ch = Number(q.get('ch'));
  if (ch >= 1 && ch <= CHAPTERS.length) return ['ch', { ch, tab: q.get('tab') || 'gram', topic: q.get('t') }];
  if (q.get('view') === 'dict' || q.get('view') === 'gram') return [q.get('view'), {}];
  return ['hub', {}];
}
window.addEventListener('popstate', (e) => {
  const st = e.state; if (st && st.menu) return;   // the section menu's own step
  const [v, o] = st && st.a1 ? [st.a1, { ch: st.ch, tab: st.tab }] : fromUrl();
  if (v !== current || (v === 'ch' && (o.ch !== chapter || (o.tab || 'gram') !== tab))) show(v, o);
});
$('#backbtn').addEventListener('click', () => { haptic(); back(); });
if (tg && tg.BackButton) try { tg.BackButton.onClick(back); } catch (e) {}

/* ---------------- the course ---------------- */
const bar = (n, of) => `<span class="pbar" aria-hidden="true"><i style="width:${of ? Math.round((n / of) * 100) : 0}%"></i></span>`;
function renderHub() {
  const topics = CHAPTERS.reduce((n, c) => n + c.grammar.length, 0);
  const last = P.last ? CHAPTERS[P.last - 1] : null;
  const g = garden.counts();
  const row = (c) => {
    const s = solved(c.n), all = c.tasks.length;
    return `<a class="chrow${s === all ? ' full' : ''}" href="?ch=${c.n}" data-ch="${c.n}"><span class="num">${c.n}</span><span class="t"><b>${esc(c.title)}</b>` +
      `<small>${c.grammar.filter((x) => x.cat !== 'rede').map((x) => esc(x.t)).slice(0, 3).join(' · ')}</small></span>` +
      `<span class="pr" aria-label="Вправи: ${s} з ${all}">${s === all ? '✓' : `${s}/${all}`}</span></a>`;
  };
  $('#view-hub').innerHTML =
    (last ? `<a class="hcard cont" href="?ch=${last.n}" data-ch="${last.n}"><div class="ch"><span class="lab">Продовжити</span>${GO}</div>` +
      `<div class="big">${last.n}. ${esc(last.title)}</div><p class="sub">Вправи: ${solved(last.n)} з ${last.tasks.length}</p>${bar(solved(last.n), last.tasks.length)}</a>`
      : `<a class="hcard cont" href="?ch=1" data-ch="1"><div class="ch"><span class="lab">Почати</span>${GO}</div><div class="big">1. ${esc(CHAPTERS[0].title)}</div>` +
      `<p class="sub">Абетка, вимова, перші фрази: як тебе звати, звідки ти</p></a>`) +
    `<div class="grid2">` +
    `<a class="tile" href="?view=dict" data-view="dict"><span class="ic">${ICON('<path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10.5M9 8.5h6"/>')}</span><span><b>Словник</b><small>${WORDS.length} слів і фраз з озвученням</small></span></a>` +
    `<a class="tile" href="?view=gram" data-view="gram"><span class="ic">${ICON('<path d="M4 6h16M4 12h10M4 18h7"/><path d="M17 14l3 3-3 3"/>')}</span><span><b>Граматика</b><small>${topics} тем одним списком</small></span></a>` +
    `<a class="tile" href="?ch=1&amp;t=abc" data-ch="1" data-topic="abc"><span class="ic">${ICON('<path d="M3.5 18l4.5-12 4.5 12M5.2 14h5.6"/><path d="M15 18v-7.5a3 3 0 0 1 6 0V18M15 14h6"/>')}</span><span><b>Вимова</b><small>Абетка й звуки</small></span></a>` +
    `<a class="tile" href="../igry/?tab=garten" id="to-garden"><span class="ic">${ICON('<path d="M12 21v-8"/><path d="M12 13c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5z"/><path d="M12 16c0-3-2.4-5-5.5-5 0 3 2.4 5 5.5 5z"/><path d="M7.5 21h9"/>')}</span><span><b>Сад слів</b><small>${g.thirsty ? `💧 ${g.thirsty} ${plural(g.thirsty, 'слово чекає', 'слова чекають', 'слів чекають')} повторення` : g.planted ? `${g.planted} ${plural(g.planted, 'слово росте', 'слова ростуть', 'слів ростуть')}` : 'Повторювати слова щодня'}</small></span></a>` +
    `</div>` +
    `<h3 class="group">A1.1 · розділи 1–8</h3><div class="card list">${CHAPTERS.slice(0, 8).map(row).join('')}</div>` +
    `<h3 class="group">A1.2 · розділи 9–16</h3><div class="card list">${CHAPTERS.slice(8).map(row).join('')}</div>` +
    `<p class="note small">Розділи й граматика йдуть у тому ж порядку, що й у підручнику Die neue Linie 1 (Klett), тож курс можна проходити разом із книжкою. Пояснення, приклади, діалоги й вправи тут власні; назви розділів 9–16 наші.</p>`;
}
$('#view-hub').addEventListener('click', (e) => {
  const a = e.target.closest('[data-ch], [data-view]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (a.dataset.view) go(a.dataset.view); else go('ch', { ch: Number(a.dataset.ch), topic: a.dataset.topic });
});

/* ---------------- a chapter: grammar, words, phrases, exercises ---------------- */
function topicHTML(g) {
  const table = (t) => `<div class="tbl">${t.cap ? `<p class="cap">${md(t.cap)}</p>` : ''}<div class="scroll"><table>` +
    (t.head && t.head.some(Boolean) ? `<thead><tr>${t.head.map((h) => `<th>${md(h)}</th>`).join('')}</tr></thead>` : '') +
    `<tbody>${t.rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  return `<article class="card topic" id="t-${g.id}"><h2>${esc(g.t)}</h2>` +
    (g.text || []).map((p) => `<p>${md(p)}</p>`).join('') + (g.tables || []).map(table).join('') +
    (g.ex && g.ex.length ? `<p class="cap">Приклади</p><ul class="ex">${g.ex.map(([de, uk]) => `<li><span lang="de">${md(de)}</span><small>${md(uk)}</small></li>`).join('')}</ul>` : '') +
    (g.tips || []).map((t) => `<p class="tip"><b>Порада.</b> ${md(t)}</p>`).join('') +
    (g.warn || []).map((t) => `<p class="warn"><b>Типова помилка.</b> ${md(t)}</p>`).join('') + '</article>';
}
function wordRow(e, withCh) {
  const extra = [e.pl ? (e.pl === '—' ? 'без множини' : esc(e.pl)) : '', e.forms ? esc(e.forms) : '', e.plOnly ? 'лише множина' : ''].filter(Boolean);
  return `<li class="w" data-id="${e.id}"><span class="txt"><span class="de" lang="de">${ART(e)}<b>${esc(e.word || e.de)}</b></span>` +
    (extra.length ? `<span class="forms" lang="de">${extra.join(' · ')}</span>` : '') +
    `<span class="uk">${esc(e.uk)}${withCh ? `<span class="chn">розд. ${e.ch}</span>` : ''}</span></span>` +
    (sound.has(sayOf(e)) ? `<span class="say" aria-hidden="true">${SPEAKER}</span>` : '') + '</li>';
}
const GROUPS = [['n', 'Іменники'], ['v', 'Дієслова'], ['a', 'Прикметники й прислівники'], ['w', 'Службові слова й числа'], ['p', 'Фрази'], ['name', 'Країни, мови, свята']];
const nounsOf = (n) => byChapter(n).filter((x) => x.kind === 'n' && x.art && !x.plOnly);
function renderChapter() {
  const c = CHAPTERS[chapter - 1], words = byChapter(c.n), nouns = nounsOf(c.n);
  $$('#view-ch [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $('#ch-body').innerHTML =
    `<div class="view panel" id="p-gram" role="tabpanel" aria-labelledby="tab-gram"${tab === 'gram' ? '' : ' hidden'}>` +
      `<div class="card goals"><p class="cap">${c.book ? `У книзі: <span lang="de">${esc(c.book)}</span>` : `Граматика розділу ${c.n} книги`}</p><b>Після розділу ти зможеш:</b><ul>${c.goals.map((x) => `<li>${md(x)}</li>`).join('')}</ul></div>` +
      c.grammar.map(topicHTML).join('') +
      `<button class="btn primary" type="button" data-tabgo="words">Далі: слова розділу</button></div>` +
    `<div class="view panel" id="p-words" role="tabpanel" aria-labelledby="tab-words"${tab === 'words' ? '' : ' hidden'}>` +
      `<div class="card wtools"><p class="note">${words.length} ${plural(words.length, 'запис', 'записи', 'записів')}: слова й фрази розділу. Торкнись рядка, щоб послухати.</p>` +
      `<div class="wbtns">${nouns.length ? `<button class="btn" type="button" id="plant">🌱 Посадити ${nouns.length} ${plural(nouns.length, 'іменник', 'іменники', 'іменників')} у «Сад слів»</button>` : ''}` +
      `<button class="btn" type="button" id="hideuk" aria-pressed="false">Сховати переклад</button></div></div>` +
      GROUPS.map(([k, name]) => { const list = words.filter((e) => e.kind === k); return list.length ? `<h3 class="group">${name}</h3><ul class="card words">${list.map((e) => wordRow(e)).join('')}</ul>` : ''; }).join('') +
      `<button class="btn primary" type="button" data-tabgo="phr">Далі: фрази й діалог</button></div>` +
    `<div class="view panel" id="p-phr" role="tabpanel" aria-labelledby="tab-phr"${tab === 'phr' ? '' : ' hidden'}>` +
      c.phrases.map((g) => `<div class="card phr"><h2>${esc(g.t)}</h2><ul class="ex">${g.list.map(([de, uk]) => `<li><span lang="de">${md(de)}</span><small>${md(uk)}</small></li>`).join('')}</ul></div>`).join('') +
      chatHTML(c) +
      `<button class="btn primary" type="button" data-tabgo="tasks">Далі: вправи</button></div>` +
    `<div class="view panel" id="p-tasks" role="tabpanel" aria-labelledby="tab-tasks"${tab === 'tasks' ? '' : ' hidden'}>` +
      `<div class="card thead" id="thead"></div>` + c.tasks.map((t, i) => taskHTML(c.n, t, i)).join('') +
      (c.n < CHAPTERS.length ? `<button class="btn primary" type="button" data-next="${c.n + 1}">Розділ ${c.n + 1}: ${esc(CHAPTERS[c.n].title)}</button>`
        : '<p class="note center">Це останній розділ рівня A1. Далі — A2.</p>') +
    `</div>`;
  renderTasksHead();
  sound.prefetch(words.slice(0, 6).map(sayOf));
}
/* The dialogue as a chat in a messenger: the hero writes on the right, the others on the left with their avatars and
   names; the time under each message, read ticks on the hero's; the translation under the German (it can be hidden) */
const TICKS = '<svg viewBox="0 0 18 10" width="16" height="9" aria-hidden="true"><path d="M1 5.5l2.6 2.6L9 2.4M6.6 8.1L12.4 2.4M10.2 8.1l5.6-5.7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NAMEC = ['#2F7D4F', '#2F5DB3', '#B0451F', '#8A3FA0', '#1F7F86', '#9A5800', '#B3261E'];
const chatTr = () => { try { return localStorage.getItem('a1-chat-tr') !== '0'; } catch (e) { return true; } };
function chatHTML(c) {
  const d = c.dialog, keys = [...new Set(d.lines.map((l) => l[0]).filter(Boolean))], others = keys.filter((k) => !isHero(k));
  let t = 9 * 60 + ((c.n * 37) % 150);
  const hhmm = () => `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  const body = d.lines.map(([who, de, uk], i) => {
    if (!who) { t += 45; return '<li class="chip" role="presentation"><span>Згодом</span></li>'; }
    if (i) t += 1;
    const prev = d.lines[i - 1] || [], next = d.lines[i + 1] || [], first = prev[0] !== who, last = next[0] !== who;
    const p = person(who), out = isHero(who), col = NAMEC[others.indexOf(who) % NAMEC.length];
    return `<li class="msg ${out ? 'out' : 'in'}${first ? ' first' : ''}${last ? ' last' : ''}">` +
      `<span class="av">${last ? avatar(who, 30) : ''}</span>` +
      `<div class="bub">${first ? `<b class="nm" style="--nc:${out ? 'var(--chat-me-ink)' : col}">${esc(p.de)}</b>` : ''}` +
      `<span class="de" lang="de">${md(de)}</span><span class="tr">${md(uk)}</span>` +
      `<span class="meta">${hhmm()}${out ? TICKS : ''}</span></div></li>`;
  }).join('');
  const names = [...others.map((k) => person(k).de), ...keys.filter(isHero).map((k) => person(k).de)];
  const on = chatTr();
  return `<div class="card chat${on ? '' : ' notr'}"><div class="chead">` +
    `<span class="avs">${others.slice(0, 2).map((k) => avatar(k, 38)).join('')}</span>` +
    `<span class="ct"><b>${esc(d.t)}</b><small>${esc(names.join(', '))} · уявна історія</small></span>` +
    `<button class="trbtn" type="button" data-chat-tr aria-pressed="${on}">Переклад</button></div>` +
    `<ol class="cbody" aria-label="Діалог: ${esc(d.t)}"><li class="chip" role="presentation"><span>Сьогодні</span></li>${body}</ol></div>`;
}
function setTab(t) {
  if (current !== 'ch' || !TABS.includes(t)) return;
  const panels = TABS.map((x) => $('#p-' + x)), next = $('#p-' + t);
  if (t === tab) { panels.forEach((p) => { p.style.removeProperty('transform'); p.style.removeProperty('opacity'); }); return; }
  tab = t;
  $$('#view-ch [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  if (window.UI) UI.tabsThumb(false);
  try { history.replaceState({ ...(history.state || {}), a1: 'ch', ch: chapter, tab: t, topic: undefined }, '', urlOf('ch', { ch: chapter, tab: t })); } catch (e) {}
  // the new part starts at its top, under the tabs
  const top = () => { const y = $('#view-ch').getBoundingClientRect().top + window.scrollY - 6; if (window.scrollY > y) window.scrollTo(0, y); };
  if (window.UI) UI.switchView(panels, next, { keepScroll: true, done: top });
  else { panels.forEach((p) => { p.hidden = p !== next; }); top(); }
  haptic();
}

/* ---------------- exercises ---------------- */
function taskHTML(n, t, i) {
  const done = !!P.done[`${n}:${i}`];
  const q = t.t === 'gap'
    ? md(t.q).replace('___', `<input class="gapin" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="de" enterkeyhint="done" aria-label="Пропуск" size="${Math.max(4, ...t.a.map((a) => a.length)) + 1}"${done ? ` value="${esc(t.a[0])}" disabled` : ''}>`)
    : md(t.q);
  return `<div class="card task${done ? ' ok' : ''}" data-task="${i}"><p class="tq"><span class="tn">${i + 1}</span><span>${q}</span></p>` +
    (t.t === 'mc' ? `<div class="opts">${order(n, i, t.o, t.a).map((j) => `<button class="opt${done && j === t.a ? ' right' : ''}" type="button" data-o="${j}"${done ? ' disabled' : ''}>${md(t.o[j])}</button>`).join('')}</div>`
      : `<button class="btn check" type="button" data-check${done ? ' hidden' : ''}>Перевірити</button>`) +
    `<p class="fb" aria-live="polite">${done ? `<b class="okt">Правильно.</b> ${t.why ? md(t.why) : ''}` : ''}</p></div>`;
}
function renderTasksHead() {
  const c = CHAPTERS[chapter - 1], el = $('#thead'); if (!c || !el) return;
  const s = solved(c.n), all = c.tasks.length;
  el.innerHTML = `<div class="row"><b>${s === all ? 'Усі вправи розв’язано ✓' : `Розв’язано ${s} з ${all}`}</b>${s ? '<button class="linkbtn" type="button" id="reset">Почати знову</button>' : ''}</div>${bar(s, all)}` +
    `<p class="note small">Помилка — теж крок: прочитай пояснення і спробуй ще раз.</p>`;
}
function markDone(card) {
  const t = CHAPTERS[chapter - 1].tasks[Number(card.dataset.task)];
  card.classList.add('ok'); card.classList.remove('bad');
  $$('.opt', card).forEach((b) => { b.disabled = true; b.classList.toggle('right', Number(b.dataset.o) === t.a); b.classList.remove('wrong'); });
  const inp = $('.gapin', card); if (inp) { inp.value = t.a.find((x) => norm(x) === norm(inp.value)) || t.a[0]; inp.disabled = true; }   // shown as it is written
  const ch = $('[data-check]', card); if (ch) ch.hidden = true;
  $('.fb', card).innerHTML = `<b class="okt">Правильно!</b> ${t.why ? md(t.why) : ''}`;
}
function solve(card, ok) {
  const i = Number(card.dataset.task), t = CHAPTERS[chapter - 1].tasks[i];
  if (ok) {
    P.done[`${chapter}:${i}`] = 1; saveP(); markDone(card); haptic('ok'); renderTasksHead();
    if (solved(chapter) === CHAPTERS[chapter - 1].tasks.length) toast('Усі вправи розділу розв’язано! 🎉', 3000);
  } else {
    card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad'); haptic('error');
    $('.fb', card).innerHTML = `<b class="not">Ще ні.</b> ${t.why ? md(t.why) : ''}` + (t.t === 'gap' ? ` <span class="ans">Правильно: <i lang="de">${esc(t.a[0])}</i></span>` : ' Спробуй інший варіант.');
  }
}
function checkGap(card) {
  const t = CHAPTERS[chapter - 1].tasks[Number(card.dataset.task)], inp = $('.gapin', card), v = norm(inp.value);
  if (!v) { inp.focus(); return; }
  solve(card, t.a.some((a) => norm(a) === v));
}
function playWord(li) {
  const e = WORDS[Number(li.dataset.id)];
  li.classList.add('seen');   // with the translation hidden, a tap shows it
  const ok = sound.say(sayOf(e), { on: () => li.classList.add('on'), off: () => li.classList.remove('on'), fail: () => toast('Не вдалося відтворити. Перевір інтернет.') });
  if (!ok) toast('Запису цього рядка немає');
}
$('#view-ch').addEventListener('click', (e) => {
  const tb = e.target.closest('[role=tab]'); if (tb) { setTab(tb.dataset.tab); return; }
  const tgo = e.target.closest('[data-tabgo]'); if (tgo) { setTab(tgo.dataset.tabgo); return; }
  const nx = e.target.closest('[data-next]'); if (nx) { go('ch', { ch: Number(nx.dataset.next) }, true); return; }
  const w = e.target.closest('.w'); if (w) { playWord(w); return; }
  if (e.target.closest('#plant')) {
    const n = nounsOf(chapter).reduce((k, x) => k + (garden.plant(x.word) ? 1 : 0), 0);
    toast(n ? `🌱 Посаджено ${n} ${plural(n, 'слово', 'слова', 'слів')}. Перше повторення завтра в «Саду слів».` : 'Ці слова вже ростуть у «Саду слів».', 3600); haptic('ok'); return;
  }
  const ctr = e.target.closest('[data-chat-tr]');
  if (ctr) {
    const on = ctr.getAttribute('aria-pressed') !== 'true';
    ctr.setAttribute('aria-pressed', String(on)); ctr.closest('.chat').classList.toggle('notr', !on);
    try { localStorage.setItem('a1-chat-tr', on ? '1' : '0'); } catch (err) {}
    haptic(); return;
  }
  const hu = e.target.closest('#hideuk');
  if (hu) { const on = hu.getAttribute('aria-pressed') !== 'true'; hu.setAttribute('aria-pressed', String(on)); hu.textContent = on ? 'Показати переклад' : 'Сховати переклад'; $('#p-words').classList.toggle('quiz', on); haptic(); return; }
  if (e.target.closest('#reset')) {
    CHAPTERS[chapter - 1].tasks.forEach((t, i) => delete P.done[`${chapter}:${i}`]); saveP();
    $$('#p-tasks .task').forEach((card) => { const i = Number(card.dataset.task); card.outerHTML = taskHTML(chapter, CHAPTERS[chapter - 1].tasks[i], i); });
    renderTasksHead(); haptic(); return;
  }
  const card = e.target.closest('.task'); if (!card || card.classList.contains('ok')) return;
  const o = e.target.closest('.opt');
  if (o && !o.disabled) { const ok = Number(o.dataset.o) === CHAPTERS[chapter - 1].tasks[Number(card.dataset.task)].a; if (!ok) { o.classList.add('wrong'); o.disabled = true; } solve(card, ok); return; }
  if (e.target.closest('[data-check]')) checkGap(card);
});
$('#view-ch').addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.classList.contains('gapin')) return;
  e.preventDefault(); checkGap(e.target.closest('.task'));
});

/* ---------------- the dictionary ---------------- */
const HAY = WORDS.map((e) => fold([e.de, e.word, e.pl, e.forms, e.uk].filter(Boolean).join(' | ')));
const D = { q: '', kind: 'all', ch: 0, shown: 120 };
const DKINDS = [['all', 'Усі'], ['n', 'Іменники'], ['v', 'Дієслова'], ['a', 'Прикметники'], ['p', 'Фрази'], ['w', 'Інше']];
function dictMatches(q0 = D.q, kind = D.kind, ch = D.ch) {
  const q = fold(q0.trim()).replace(/^(der|die|das|ein|eine) /, '');
  const list = WORDS.filter((e, i) => (kind === 'all' || e.kind === kind || (kind === 'w' && e.kind === 'name')) && (!ch || e.ch === ch) && (!q || HAY[i].includes(q)));
  if (!q) return list;   // in the order of the course
  // the word itself first, then words that start with it, then the rest (Tisch before Schreibtisch)
  const rank = (e) => { const w = fold(e.word || e.de), u = fold(e.uk); return w === q || u === q ? 0 : w.startsWith(q) || u.startsWith(q) ? 1 : 2; };
  return list.map((e) => [rank(e), e]).sort((a, z) => a[0] - z[0]).map((x) => x[1]);
}
function renderDict() {
  $('#view-dict').innerHTML = `<div class="card dsearch"><input id="dq" class="find" type="search" placeholder="Знайти: Tisch, стіл…" autocomplete="off" spellcheck="false" aria-label="Пошук у словнику" enterkeyhint="search" value="${esc(D.q)}">` +
    `<div class="chips" role="radiogroup" aria-label="Частина мови">${DKINDS.map(([k, n]) => `<button class="chip" type="button" role="radio" data-kind="${k}" aria-checked="${D.kind === k}">${n}</button>`).join('')}</div>` +
    `<select id="dch" class="sel" aria-label="Розділ"><option value="0">Усі розділи</option>${CHAPTERS.map((c) => `<option value="${c.n}"${D.ch === c.n ? ' selected' : ''}>Розділ ${c.n}: ${esc(c.title)}</option>`).join('')}</select></div>` +
    `<p class="note small" id="dcount" aria-live="polite"></p><ul class="card words" id="dlist"></ul><button class="btn" type="button" id="dmore" hidden>Показати ще</button>`;
  listDict();
}
function listDict() {
  const list = dictMatches();
  $('#dcount').textContent = list.length ? `${list.length} ${plural(list.length, 'запис', 'записи', 'записів')}` + (D.q || D.kind !== 'all' || D.ch ? '' : '. Торкнись рядка, щоб послухати.') : 'Нічого не знайдено. Спробуй інше слово або прибери фільтр.';
  $('#dlist').innerHTML = list.slice(0, D.shown).map((e) => wordRow(e, true)).join('');
  $('#dlist').hidden = !list.length;
  $('#dmore').hidden = list.length <= D.shown;
  $('#dmore').textContent = `Показати ще (${Math.max(0, list.length - D.shown)})`;
}
$('#view-dict').addEventListener('input', (e) => { if (e.target.id === 'dq') { D.q = e.target.value; D.shown = 120; listDict(); } });
$('#view-dict').addEventListener('change', (e) => { if (e.target.id === 'dch') { D.ch = Number(e.target.value); D.shown = 120; listDict(); } });
$('#view-dict').addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'dq') e.target.blur(); });
$('#view-dict').addEventListener('click', (e) => {
  const k = e.target.closest('[data-kind]');
  if (k) { D.kind = k.dataset.kind; D.shown = 120; $$('#view-dict [data-kind]').forEach((b) => b.setAttribute('aria-checked', String(b === k))); listDict(); haptic(); return; }
  if (e.target.closest('#dmore')) { D.shown += 200; listDict(); return; }
  const w = e.target.closest('.w'); if (w) playWord(w);
});

/* ---------------- the grammar index ---------------- */
function renderGram() {
  $('#view-gram').innerHTML = `<p class="note">Усі теми курсу за видами. Торкнись теми, щоб відкрити її в розділі.</p>` + Object.entries(CATS).map(([cat, name]) => {
    const list = CHAPTERS.flatMap((c) => c.grammar.filter((g) => g.cat === cat).map((g) => ({ c, g })));
    return list.length ? `<h3 class="group">${name}</h3><div class="card list">${list.map(({ c, g }) => `<a class="chrow" href="?ch=${c.n}&amp;t=${g.id}" data-ch="${c.n}" data-topic="${g.id}"><span class="num">${c.n}</span><span class="t"><b>${esc(g.t)}</b><small>${esc(c.title)}</small></span>${GO}</a>`).join('')}</div>` : '';
  }).join('');
}
$('#view-gram').addEventListener('click', (e) => {
  const a = e.target.closest('[data-ch]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); go('ch', { ch: Number(a.dataset.ch), topic: a.dataset.topic });
});

/* ---------------- start ---------------- */
if (tg) { try { tg.ready(); tg.expand(); } catch (e) {} }
garden.onChange(() => { if (current === 'hub') renderHub(); });
// under the title: who speaks in the examples, and where to change it
function heroLine() {
  const l = $('#herol'); if (!l) return;
  l.innerHTML = (gender() === 'f'
    ? 'Приклади й діалоги — від імені <b>Лесі Українки</b> (жіночий рід). Справжні тут рік і місце народження, професія та твори; а що вона живе в Ксантені й учить німецьку — уявна історія.'
    : 'Приклади й діалоги — від імені <b>Тараса Шевченка</b> (чоловічий рід). Справжні тут рік і місце народження, професія та твори; а що він живе в Ксантені й учить німецьку — уявна історія.')
    + ' Змінити героя: меню → «Налаштування».';
}
heroLine();
const [v0, o0] = fromUrl();
show(v0, { ...o0, instant: true });
window.__a1 = { CHAPTERS, WORDS, KINDS, P, current: () => current, tab: () => tab, dictMatches, gender };
// the hero changed in the menu (Тарас ↔ Леся): the same place again, in the other form
function heroChanged() {
  CHAPTERS = RAW.map((c) => heroAll(c, gender())); window.__a1.CHAPTERS = CHAPTERS;
  heroLine();
  if (current === 'hub') renderHub();
  else if (current === 'gram') renderGram();
  else if (current === 'ch') { const y = window.scrollY; renderChapter(); header(); window.scrollTo(0, y); }
}
window.addEventListener('dsimya-gender', heroChanged);
window.addEventListener('storage', (e) => { if (e.key === GENDER_KEY) heroChanged(); });
