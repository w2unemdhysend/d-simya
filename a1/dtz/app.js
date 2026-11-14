// DTZ · B1: the exam in brief, the listening test, reading sets, letters (with an AI check) and speaking (with an AI
// partner for part 3). One view at a time; each screen is a step in the history.
import { $, tg, haptic, load, store } from '../../igry/kit.js';
import { esc, API } from '../../assets/site.js';
import { hero } from '../text.js';
import { PARTS, RESULT, SOURCE } from './exam.js';
import { LESEN } from './lesen.js';
import { HOEREN } from './hoeren.js';
import { BRIEF, SCHREIBEN } from './schreiben.js';
import { SPRECHEN } from './sprechen.js';
import { CLIPS } from './audio/index.js';

const gender = () => { try { return localStorage.getItem('dsimya-gender') === 'f' ? 'f' : 'm'; } catch (e) { return 'm'; } };
const H = (s) => hero(String(s), gender());
const P = Object.assign({ best: {}, letters: {} }, load('a1-dtz') || {});   // best: {setId: right}; letters: {taskId: text}
const save = () => store('a1-dtz', P);
const can = !!(tg && tg.initData);
const V = () => $('#view');

/* ---------------- navigation ---------------- */
let screen = { s: 'hub' };
function go(s) { screen = s; try { history.pushState({ dtz: s }, '', s.s === 'hub' ? location.pathname : '?s=' + s.s + (s.id ? '&id=' + s.id : '')); } catch (e) { /* file:// */ } render(); }
function back() { stopAudio(); if (history.state && history.state.dtz) history.back(); else { screen = { s: 'hub' }; render(); } }
window.addEventListener('popstate', (e) => { if (e.state && e.state.menu) return; stopAudio(); screen = (e.state && e.state.dtz) || { s: 'hub' }; render(); });
try { if (tg && tg.BackButton) tg.BackButton.onClick(back); } catch (e) { /* older Telegram */ }
const head = (title) => `<div class="head"><button class="linkbtn" type="button" data-back>← Назад</button><span class="note">${esc(title)}</span></div>`;
function render() {
  window.scrollTo(0, 0);
  try { if (tg && tg.BackButton) { if (screen.s === 'hub') tg.BackButton.hide(); else tg.BackButton.show(); } } catch (e) { /* older Telegram */ }
  ({ hub: renderHub, hoeren: renderHoeren, lesen: renderLesenList, set: renderSet, schreiben: renderSchreibenList, letter: renderLetter, sprechen: renderSprechen, plan: renderPlan })[screen.s]();
}

/* ---------------- the hub ---------------- */
function renderHub() {
  const best = (id) => P.best[id];
  const hb = best('hoeren');
  V().innerHTML = `<div class="parts">
      <button class="part" type="button" data-go="hoeren"><span class="i" aria-hidden="true">🎧</span><b>Слухання</b><small>Повний тест: 20 завдань${hb != null ? ` · найкраще ${hb}/20` : ''}</small></button>
      <button class="part" type="button" data-go="lesen"><span class="i" aria-hidden="true">📄</span><b>Читання</b><small>${LESEN.length} наборів у форматі іспиту</small></button>
      <button class="part" type="button" data-go="schreiben"><span class="i" aria-hidden="true">✉️</span><b>Письмо</b><small>Будова листа, фрази, ${SCHREIBEN.length} завдань зі зразками й перевіркою ШІ</small></button>
      <button class="part" type="button" data-go="sprechen"><span class="i" aria-hidden="true">🗣</span><b>Говоріння</b><small>Три частини, зразки відповідей, партнер-ШІ</small></button>
    </div>
    <section class="card"><h2 style="margin:0 0 8px;font-size:17px">Іспит коротко</h2>
      <table class="tbl"><thead><tr><th>Частина</th><th>Час</th><th>Завдань</th></tr></thead><tbody>${PARTS.map((p) => `<tr><td><b lang="de">${esc(p.de)}</b> · ${esc(p.uk)}</td><td>${p.min} хв</td><td>${p.items}</td></tr>`).join('')}</tbody></table>
      <ul class="note" style="margin:10px 0 0;padding-left:18px;display:grid;gap:4px">${RESULT.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></section>
    ${PARTS.map((p) => `<section class="card"><h2 style="margin:0 0 6px;font-size:16px"><span lang="de">${esc(p.de)}</span> — ${esc(p.uk)}</h2><table class="tbl"><tbody>${p.parts.map(([n, what, how]) => `<tr><td>${esc(n)}</td><td>${esc(what)}${how ? `<br><small class="note">${esc(how)}</small>` : ''}</td></tr>`).join('')}</tbody></table><p class="note" style="margin-top:6px">${esc(p.note)}</p></section>`).join('')}`;
}

/* ---------------- listening ---------------- */
let audio = null;
function stopAudio() { if (audio) { try { audio.pause(); } catch (e) { /* stopped */ } audio = null; } }
function playClip(id, btn) {
  stopAudio();
  const f = CLIPS[id]; if (!f) return;
  audio = new Audio(new URL('audio/' + f, import.meta.url).href);
  btn.textContent = '⏸'; btn.setAttribute('aria-label', 'Пауза');
  audio.onended = () => { btn.textContent = '▶'; btn.setAttribute('aria-label', 'Слухати'); };
  audio.play().catch(() => { btn.textContent = '▶'; });
}
const hoerenItems = () => HOEREN.flatMap((h) => (h.teil === 4 ? h.people.map((p, i) => ({ h, i, a: p.a })) : h.tasks.map((t, i) => ({ h, i, t }))));
let HR = {};
function renderHoeren() {
  const done = HR.checked;
  let n = 0;
  const qn = () => ++n;
  const block = (h) => {
    if (h.teil === 4) {
      return `<section class="card"><h3 style="margin:0 0 6px;font-size:15px">Частина 4 · ${esc(h.intro)}</h3><ol class="pts" style="list-style:none;padding:0">${h.statements.map(([k, s]) => `<li><b>${k}</b> <span lang="de">${esc(s)}</span></li>`).join('')}</ol>
        ${h.people.map((p, i) => { const id = `${h.id}-${i + 1}`, num = qn(), pick = HR[id]; return `<div class="task"><div class="play"><button type="button" data-play="${id}" aria-label="Слухати">▶</button><span class="q">${num}. Людина ${i + 1}: яке твердження?</span></div>
          <div class="ch">${h.statements.map(([k]) => `<button type="button" data-hr="${id}" data-v="${k}" aria-pressed="${pick === k}"${done ? ` class="${k === p.a ? 'right' : pick === k ? 'wrong' : ''}" disabled` : ''}>${k}</button>`).join('')}</div>
          ${done ? `<p class="note" lang="de">${esc(p.lines.map((l) => l[1]).join(' '))}</p>` : ''}</div>`; }).join('')}</section>`;
    }
    return `<section class="card"><div class="play"><button type="button" data-play="${h.id}" aria-label="Слухати">▶</button><span class="note">Частина ${h.teil}${h.teil === 3 ? ' · розмова' : ''}</span></div>
      ${h.tasks.map((t, i) => { const id = `${h.id}-${i}`, num = qn(), pick = HR[id], opts = t.kind === 'rf' ? ['richtig', 'falsch'] : t.o, right = t.kind === 'rf' ? (t.a ? 0 : 1) : t.a;
        return `<div class="task"><span class="q" lang="de">${num}. ${esc(t.q)}</span><div class="ch">${opts.map((o, j) => `<button type="button" data-hr="${id}" data-v="${j}" aria-pressed="${pick === String(j)}"${done ? ` class="${j === right ? 'right' : pick === String(j) ? 'wrong' : ''}" disabled` : ''} lang="de">${esc(o)}</button>`).join('')}</div></div>`; }).join('')}
      ${done ? `<details><summary class="note">Текст</summary><div class="dlg" lang="de">${h.lines.map(([, s]) => `<p>${esc(s)}</p>`).join('')}</div></details>` : ''}</section>`;
  };
  const right = done ? hoerenItems().filter((x) => { if (x.h.teil === 4) return HR[`${x.h.id}-${x.i + 1}`] === x.a; const t = x.t; return HR[`${x.h.id}-${x.i}`] === String(t.kind === 'rf' ? (t.a ? 0 : 1) : t.a); }).length : 0;
  V().innerHTML = head('Слухання · 20 завдань') +
    `<p class="note">На іспиті кожен текст звучить один раз. Тут можна прослухати ще, але спробуй як на іспиті: спершу прочитай питання, потім слухай.</p>` +
    (done ? `<section class="card"><div class="score">${right} з 20</div><p class="note">З читанням разом: A2 — від 20 з 45, B1 — від 33 з 45.</p></section>` : '') +
    HOEREN.map(block).join('') +
    (done ? '<button class="bigbtn ghost" type="button" id="hr-again">Пройти ще раз</button>' : '<button class="bigbtn" type="button" id="hr-check">Перевірити</button>');
}

/* ---------------- reading ---------------- */
const TEIL = { 1: 'Частина 1 · перелік', 2: 'Частина 2 · оголошення', 3: 'Частина 3 · тексти', 4: 'Частина 4 · брошура', 5: 'Частина 5 · лист з пропусками' };
function renderLesenList() {
  V().innerHTML = head('Читання') + [1, 2, 3, 4, 5].map((t) => `<section class="card"><h3 style="margin:0 0 4px;font-size:15px">${TEIL[t]}</h3><ul class="list">${LESEN.filter((x) => x.teil === t).map((x) => `<li><button type="button" data-set="${x.id}"><span class="t"><b>${esc(x.title)}</b>${P.best[x.id] != null ? `<small>найкраще: ${P.best[x.id]} з ${(x.tasks || x.gaps).length}</small>` : ''}</span><span aria-hidden="true">›</span></button></li>`).join('')}</ul></section>`).join('');
}
let LR = {};
function renderSet() {
  const x = LESEN.find((s) => s.id === screen.id); if (!x) { renderLesenList(); return; }
  const done = LR.checked, items = x.tasks || x.gaps;
  const choice = (i, opts, right) => `<div class="ch">${opts.map((o, j) => `<button type="button" data-lr="${i}" data-v="${j}" aria-pressed="${LR[i] === String(j)}"${done ? ` class="${j === right ? 'right' : LR[i] === String(j) ? 'wrong' : ''}" disabled` : ''} lang="de">${esc(o)}</button>`).join('')}</div>`;
  let body = '';
  if (x.teil === 1) body = `<p class="note" lang="de">${esc(x.intro)}</p><section class="card"><div class="kv" lang="de">${x.list.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join('')}</div></section>` +
    `<section class="card">${x.tasks.map((t, i) => `<div class="task"><span class="q" lang="de">${i + 1}. ${esc(t.q)}</span>${choice(i, t.o, t.a)}</div>`).join('')}</section>`;
  if (x.teil === 2) body = `<p class="note" lang="de">${esc(x.intro)}</p><section class="card" style="display:grid;gap:8px">${x.ads.map((a) => `<div class="ad" lang="de"><b>${a.k}</b> ${esc(a.t)}</div>`).join('')}</section>` +
    `<section class="card">${x.tasks.map((t, i) => { const keys = [...x.ads.map((a) => a.k), 'x']; return `<div class="task"><span class="q" lang="de">${i + 1}. ${esc(t.q)}</span>${choice(i, keys, keys.indexOf(t.a))}</div>`; }).join('')}</section>`;
  if (x.teil === 3 || x.teil === 4) body = `<section class="card"><div class="text" lang="de">${esc(x.text)}</div></section><section class="card">${x.tasks.map((t, i) => { const opts = t.kind === 'rf' ? ['richtig', 'falsch'] : t.o; return `<div class="task"><span class="q" lang="de">${i + 1}. ${esc(t.q)}</span>${choice(i, opts, t.kind === 'rf' ? (t.a ? 0 : 1) : t.a)}</div>`; }).join('')}</section>`;
  if (x.teil === 5) body = `<section class="card"><div class="text" lang="de">${esc(x.text).replace(/\{(\d)\}/g, (m, k) => `<b>(${k})</b> ____`)}</div></section><section class="card">${x.gaps.map((g, i) => `<div class="task"><span class="q">(${i + 1})</span>${choice(i, g.o, g.a)}</div>`).join('')}</section>`;
  const right = done ? items.filter((t, i) => LR[i] === String(x.teil === 2 ? [...x.ads.map((a) => a.k), 'x'].indexOf(t.a) : t.kind === 'rf' ? (t.a ? 0 : 1) : t.a)).length : 0;
  V().innerHTML = head(TEIL[x.teil]) + `<h2 style="margin:0;font-size:18px">${esc(x.title)}</h2>` + body +
    (done ? `<section class="card"><div class="score">${right} з ${items.length}</div></section>` : '') +
    `<details class="card"><summary><b>Слова</b></summary><ul class="phr" style="margin-top:8px">${x.glossary.map(([de, uk]) => `<li><span lang="de"><b>${esc(de)}</b></span><small>${esc(uk)}</small></li>`).join('')}</ul></details>` +
    (done ? '<button class="bigbtn ghost" type="button" id="lr-again">Ще раз</button>' : '<button class="bigbtn" type="button" id="lr-check">Перевірити</button>');
}

/* ---------------- writing ---------------- */
function renderSchreibenList() {
  V().innerHTML = head('Письмо') + `<section class="card"><h2 style="margin:0 0 8px;font-size:17px">Будова листа</h2><table class="tbl"><tbody>${BRIEF.parts.map(([de, uk, ex]) => `<tr><td><b lang="de">${esc(de)}</b></td><td>${esc(uk)}<br><small class="note" lang="de">${esc(H(ex))}</small></td></tr>`).join('')}</tbody></table></section>
    <section class="card"><h2 style="margin:0 0 6px;font-size:17px">Поради</h2><ul class="note" style="margin:0;padding-left:18px;display:grid;gap:4px">${BRIEF.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>
    <details class="card"><summary><b>Фрази для листа</b></summary>${BRIEF.phrases.map((g) => `<h3 style="margin:10px 0 4px;font-size:15px">${esc(g.t)}</h3><ul class="phr">${g.list.map(([de, uk]) => `<li><span lang="de">${esc(de)}</span><small>${esc(H(uk))}</small></li>`).join('')}</ul>`).join('')}</details>
    <section class="card"><h2 style="margin:0 0 4px;font-size:17px">Завдання</h2><ul class="list">${SCHREIBEN.map((s) => `<li><button type="button" data-letter="${s.id}"><span class="t"><b>${esc(s.uk)}</b><small>${P.letters[s.id] ? 'є чернетка' : '4 пункти'}</small></span><span aria-hidden="true">›</span></button></li>`).join('')}</ul></section>`;
}
let LT = {};
function renderLetter() {
  const s = SCHREIBEN.find((x) => x.id === screen.id); if (!s) { renderSchreibenList(); return; }
  const text = P.letters[s.id] || '', words = (text.match(/\S+/g) || []).length, r = LT.result;
  V().innerHTML = head('Письмо · ' + s.uk) + `<section class="card"><p lang="de" style="margin:0 0 8px">${esc(s.situation)}</p><p class="note" style="margin:0 0 4px" lang="de">Schreiben Sie etwas zu folgenden Punkten:</p><ul class="pts" lang="de">${s.points.map((p, i) => `<li class="${r ? (r.covered[i] ? 'ok' : 'no') : ''}">${r ? (r.covered[i] ? '✓ ' : '✗ ') : ''}${esc(p)}</li>`).join('')}</ul></section>
    <textarea class="letter" id="lt" lang="de" spellcheck="false" placeholder="Sehr geehrte …">${esc(text)}</textarea>
    <p class="note" id="lt-words">${words} ${words === 1 ? 'слово' : 'слів'} · для B1 зазвичай досить 60–80</p>
    ${can ? `<button class="bigbtn" type="button" id="lt-check"${LT.busy ? ' disabled' : ''}>${LT.busy ? 'Перевіряю…' : 'Перевірити з ШІ'}</button>` : '<p class="note">Перевірка ШІ працює через бота: відкрий «DTZ» у Telegram.</p>'}
    ${LT.err ? `<p class="err">${esc(LT.err)}</p>` : ''}
    ${r ? `<section class="card"><div class="score">${esc(r.level)} · зміст ${r.content}/5</div>${r.notes.length ? `<ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:4px">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}<h3 style="margin:12px 0 4px;font-size:15px">Виправлений лист</h3><div class="model" lang="de">${esc(r.corrected)}</div><p class="note" style="margin-top:6px">ШІ помиляється рідко, але буває: перевір сумнівне з викладачем.</p></section>` : ''}
    <details class="card"><summary><b>Зразок відповіді</b></summary><div class="model" lang="de" style="margin-top:8px">${esc(H(s.model))}</div></details>`;
}

/* ---------------- speaking ---------------- */
function renderSprechen() {
  const S = SPRECHEN, pair = (de, uk) => `<li><span lang="de">${esc(H(de))}</span><small>${esc(H(uk))}</small></li>`;
  V().innerHTML = head('Говоріння') +
    `<section class="card"><h2 style="margin:0 0 6px;font-size:17px">Частина 1 · про себе</h2><p class="note">На картці ключові слова: ${S.teil1.card.map((c) => `<span lang="de">${esc(c)}</span>`).join(', ')}. Говори 1–2 хвилини, потім екзаменатор питає.</p>
      <h3 style="margin:10px 0 4px;font-size:15px">Зразок</h3><ul class="phr">${S.teil1.model.map(([de, uk]) => pair(de, uk)).join('')}</ul>
      <h3 style="margin:10px 0 4px;font-size:15px">Можливі питання</h3><ul class="phr">${S.teil1.questions.map(([q, a]) => `<li><b lang="de">${esc(q)}</b><span lang="de">${esc(H(a))}</span></li>`).join('')}</ul></section>
    <section class="card"><h2 style="margin:0 0 6px;font-size:17px">Частина 2 · фото й досвід</h2><p class="note">Опиши фото (хто, де, що робить), розкажи про свій досвід на цю тему, відповідай на питання.</p>
      ${S.teil2.map((t) => `<details style="margin-top:8px"><summary><b lang="de">${esc(t.topic)}</b> <span class="note">${esc(t.picture)}</span></summary><ul class="phr" style="margin:6px 0">${t.questions.map((q) => `<li lang="de">• ${esc(q)}</li>`).join('')}</ul><div class="model" lang="de">${esc(H(t.model))}</div></details>`).join('')}</section>
    <section class="card"><h2 style="margin:0 0 6px;font-size:17px">Частина 3 · спланувати разом</h2><p class="note">Пропонуй, погоджуйся або заперечуй з причиною, домовтеся про кожен пункт. Тут можна потренуватися з ШІ як з партнером.</p>
      <ul class="list">${S.teil3.map((t, i) => `<li><button type="button" data-plan="${i}"><span class="t"><b>${esc(t.uk)}</b><small lang="de">${esc(t.task)}</small></span><span aria-hidden="true">›</span></button></li>`).join('')}</ul></section>
    <details class="card"><summary><b>Фрази для говоріння</b></summary>${S.phrases.map((g) => `<h3 style="margin:10px 0 4px;font-size:15px">${esc(g.t)}</h3><ul class="phr">${g.list.map(([de, uk]) => pair(de, uk)).join('')}</ul>`).join('')}</details>`;
}
let CH = null;
function renderPlan() {
  const t = SPRECHEN.teil3[Number(screen.id)]; if (!t) { renderSprechen(); return; }
  if (!CH || CH.id !== screen.id) CH = { id: screen.id, lines: [{ r: 'a', t: 'Hallo! Wir sollen das zusammen planen. Was schlägst du vor?' }] };
  V().innerHTML = head('Говоріння · частина 3') + `<section class="card"><b>${esc(t.uk)}</b><p lang="de" style="margin:6px 0">${esc(t.task)}</p><ul class="pts" lang="de">${t.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>
    <details class="card"><summary><b>Зразок розмови</b></summary><div class="dlg" lang="de" style="margin-top:8px">${t.model.map(([w, s]) => `<p><b>${esc(w)}:</b> ${esc(H(s))}</p>`).join('')}</div></details>
    <div class="chat" id="chat">${CH.lines.map((l) => (l.r === 'a' ? `<div class="msg a" lang="de">${esc(l.t)}${l.uk ? `<small>${esc(l.uk)}</small>` : ''}</div>` : `<div class="msg u" lang="de">${esc(l.t)}</div>${l.fix ? (l.fix.ok ? '<div class="fix ok">✓ Правильно</div>' : `<div class="fix"><b lang="de">${esc(l.fix.corrected)}</b>${l.fix.note ? `<br>${esc(l.fix.note)}` : ''}</div>`) : ''}`)).join('')}</div>
    ${CH.err ? `<p class="err">${esc(CH.err)}</p>` : ''}
    ${can ? `<form class="compose" id="pc"><textarea id="pin" lang="de" rows="1" maxlength="300" placeholder="Напиши німецькою…" aria-label="Твоя репліка"></textarea><button type="submit" aria-label="Надіслати"${CH.busy ? ' disabled' : ''}>➤</button></form>` : '<p class="note">Розмова з ШІ працює через бота: відкрий «DTZ» у Telegram.</p>'}`;
}
async function ai(fields) {
  const fd = new FormData(); fd.append('initData', tg.initData);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const r = await fetch(API + 'talk', { method: 'POST', body: fd });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.ok) throw new Error(d.error || 'http ' + r.status);
  return d;
}
const aiError = (e) => (e.message === 'daily_limit' ? 'На сьогодні звернень до ШІ досить: ліміт оновиться завтра.' : e.message === 'ai_quota' ? 'Безкоштовний ліміт ШІ на сьогодні вичерпано. Спробуй завтра.' : 'Не вдалося отримати відповідь. Перевір інтернет і спробуй ще раз.');

/* ---------------- events ---------------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-back]')) { back(); return; }
  const g = t.closest('[data-go]'); if (g) { if (g.dataset.go === 'hoeren') HR = {}; go({ s: g.dataset.go }); haptic(); return; }
  const pl = t.closest('[data-play]'); if (pl) { playClip(pl.dataset.play, pl); return; }
  const hr = t.closest('[data-hr]'); if (hr && !hr.disabled) { HR[hr.dataset.hr] = hr.dataset.v; hr.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === hr))); haptic(); return; }
  if (t.closest('#hr-check')) { stopAudio(); HR.checked = true; renderHoeren(); const right = Number(($('.score') || {}).textContent.split(' ')[0]); P.best.hoeren = Math.max(P.best.hoeren || 0, right); save(); haptic('ok'); return; }
  if (t.closest('#hr-again')) { HR = {}; renderHoeren(); return; }
  const st = t.closest('[data-set]'); if (st) { LR = {}; go({ s: 'set', id: st.dataset.set }); return; }
  const lr = t.closest('[data-lr]'); if (lr && !lr.disabled) { LR[lr.dataset.lr] = lr.dataset.v; lr.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === lr))); haptic(); return; }
  if (t.closest('#lr-check')) { LR.checked = true; renderSet(); const x = LESEN.find((s) => s.id === screen.id), right = Number(($('.score') || {}).textContent.split(' ')[0]); P.best[x.id] = Math.max(P.best[x.id] || 0, right); save(); haptic('ok'); window.scrollTo(0, 0); return; }
  if (t.closest('#lr-again')) { LR = {}; renderSet(); return; }
  const lt = t.closest('[data-letter]'); if (lt) { LT = {}; go({ s: 'letter', id: lt.dataset.letter }); return; }
  if (t.closest('#lt-check')) {
    const s = SCHREIBEN.find((x) => x.id === screen.id), text = ($('#lt').value || '').trim();
    if ((text.match(/\S+/g) || []).length < 15) { LT.err = 'Напиши лист хоча б на 15 слів, тоді перевіримо.'; renderLetter(); return; }
    LT = { busy: true }; renderLetter();
    ai({ mode: 'letter', task: `${s.situation} Punkte: ${s.points.join('; ')}.`, text: text.slice(0, 1500) })
      .then((d) => { LT = { result: d }; haptic('ok'); }).catch((er) => { LT = { err: aiError(er) }; haptic('error'); }).finally(() => renderLetter());
    return;
  }
  const pn = t.closest('[data-plan]'); if (pn) { go({ s: 'plan', id: pn.dataset.plan }); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'lt') { P.letters[screen.id] = e.target.value.slice(0, 3000); save(); const w = (e.target.value.match(/\S+/g) || []).length; $('#lt-words').textContent = `${w} ${w === 1 ? 'слово' : 'слів'} · для B1 зазвичай досить 60–80`; }
});
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'pc') return;
  e.preventDefault();
  const inp = $('#pin'), text = inp.value.replace(/\s+/g, ' ').trim(); if (!text || CH.busy) return;
  const t = SPRECHEN.teil3[Number(screen.id)], history = CH.lines.map((l) => ({ r: l.r, t: l.t }));
  CH.lines.push({ r: 'u', t: text }); CH.busy = true; CH.err = ''; renderPlan();
  ai({ scenario: 'planen', level: 'b1', task: `${t.task} Punkte: ${t.points.join(', ')}.`, history: JSON.stringify(history), text })
    .then((d) => { CH.lines[CH.lines.length - 1].fix = { ok: d.ok_line, corrected: d.corrected, note: d.note }; CH.lines.push({ r: 'a', t: d.reply, uk: d.reply_uk }); })
    .catch((er) => { CH.lines.pop(); CH.err = aiError(er); })
    .finally(() => { CH.busy = false; renderPlan(); const c = $('#chat'); if (c && c.lastElementChild) c.lastElementChild.scrollIntoView({ block: 'end' }); });
});

$('#src').textContent = SOURCE + ' Тексти, листи й записи — наші; імена й адреси вигадані. Голоси записів: Piper (Thorsten, Kerstin).';
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
try { history.replaceState(null, '', location.pathname); } catch (e) { /* file:// */ }
render();
window.__dtz = { P, LESEN, HOEREN };
