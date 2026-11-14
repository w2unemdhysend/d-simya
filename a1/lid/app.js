// «Leben in Deutschland»: practice (in order, by topic, the mistakes again), the exam and the catalogue.
// Progress stays on the phone and in Telegram's cloud; mistakes come back by the trainers' spaced repetition.
import { $, tg, haptic, load, store, cloudGet, cloudSet, plural } from '../../igry/kit.js';
import { esc } from '../../assets/site.js';
import { QUESTIONS, BY_ID, TOPICS, EXAM, STAND, examSet } from './data.js';
import * as srs from '../trener/srs.js';

const KEY = 'a1-lid', SKEY = 'a1-trener';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
// ok: {id: right answers in a row}; last: the next question in order; uk: show the translation; exams: [{at, right}]
const P = Object.assign({ ok: {}, last: 0, uk: true, exams: [] }, load(KEY) || {});
let S = Object.assign(srs.empty(), load(SKEY) || {});
const save = () => { store(KEY, P); cloudSet(KEY, { ok: P.ok, last: P.last }); srs.tidy(S, today()); store(SKEY, S); cloudSet(SKEY, { items: S.items }); };
cloudGet(KEY).then((c) => { if (!c || !c.ok) return; for (const [k, v] of Object.entries(c.ok)) if ((P.ok[k] || 0) < v) P.ok[k] = v; P.last = Math.max(P.last, c.last || 0); if (view === 'hub') renderHub(); }).catch(() => {});
const learned = (x) => (P.ok[x.id] || 0) >= 2;   // right twice in a row
const dueIds = () => srs.due(S, 'lid', today()).map((d) => d.key).filter((k) => BY_ID.has(k));

/* ---------------- screens ---------------- */
let view = 'hub';
function show(v) {
  view = v;
  for (const x of ['hub', 'run', 'list']) $('#view-' + x).hidden = x !== v;
  if (v === 'hub') renderHub();
  window.scrollTo(0, 0);
  try { if (tg && tg.BackButton) { if (v === 'hub') tg.BackButton.hide(); else tg.BackButton.show(); } } catch (e) { /* older Telegram */ }
}
function go(v) { try { history.pushState({ lid: v }, '', v === 'hub' ? location.pathname : '?v=' + v); } catch (e) { /* file:// */ } show(v); }
function back() { clearInterval(timer); if (history.state && history.state.lid) history.back(); else show('hub'); }
window.addEventListener('popstate', (e) => { if (e.state && e.state.menu) return; clearInterval(timer); show(e.state && e.state.lid ? e.state.lid : 'hub'); });
try { if (tg && tg.BackButton) tg.BackButton.onClick(back); } catch (e) { /* older Telegram */ }

/* ---------------- the hub ---------------- */
function renderHub() {
  const n = QUESTIONS.filter(learned).length, due = dueIds().length, lastExam = P.exams[P.exams.length - 1];
  $('#view-hub').innerHTML = `<section class="card prog"><b>Вивчено ${n} з ${QUESTIONS.length}</b><div class="bar" aria-hidden="true"><i style="width:${Math.round((n / QUESTIONS.length) * 100)}%"></i></div>
      <span class="note">Питання вважається вивченим, коли на нього двічі поспіль відповіли правильно.${lastExam ? ` Останній пробний іспит: ${lastExam.right} з 33.` : ''}</span></section>
    <div class="modes">
      <button class="mode" type="button" data-mode="order"><span class="i" aria-hidden="true">📋</span><b>Усі питання по черзі</b><small>${P.last ? `далі з № ${QUESTIONS[P.last] ? QUESTIONS[P.last].id : 1}` : 'з першого'}</small></button>
      <button class="mode" type="button" data-mode="new"><span class="i" aria-hidden="true">✨</span><b>Ще не вивчені</b><small>${QUESTIONS.length - n} ${plural(QUESTIONS.length - n, 'питання', 'питання', 'питань')} упереміш</small></button>
      <button class="mode" type="button" data-mode="mistakes"${due ? '' : ' disabled'}>${due ? `<span class="due">${due}</span>` : ''}<span class="i" aria-hidden="true">🔁</span><b>Помилки</b><small>${due ? 'повторити сьогодні' : 'немає на сьогодні'}</small></button>
      <button class="mode" type="button" data-mode="exam"><span class="i" aria-hidden="true">📝</span><b>Пробний іспит</b><small>33 питання, 60 хвилин</small></button>
      <button class="mode wide" type="button" data-mode="list"><span class="i" aria-hidden="true">📚</span><b>Увесь каталог з відповідями</b><small>Переглянути й знайти питання за словом</small></button>
    </div>
    <section class="card"><h2 style="margin:0 0 4px;font-size:17px">За темами</h2><ul class="topics">${TOPICS.map((t) => { const all = QUESTIONS.filter((x) => x.t === t.id); return `<li><button type="button" data-topic="${t.id}"><span class="t"><b>${esc(t.uk)}</b><small>${esc(t.note)}</small></span><span class="n">${all.filter(learned).length}/${all.length}</span></button></li>`; }).join('')}</ul></section>
    <section class="card"><div class="head"><b>Переклад українською</b><div class="chips" role="radiogroup" aria-label="Переклад">${[['1', 'показувати'], ['0', 'за дотиком']].map(([v, l]) => `<button class="chip" type="button" role="radio" data-uk="${v}" aria-pressed="${String(P.uk) === (v === '1' ? 'true' : 'false')}" aria-checked="${String(P.uk) === (v === '1' ? 'true' : 'false')}">${l}</button>`).join('')}</div></div>
      <p class="note" style="margin-top:6px">На іспиті питання лише німецькою. Коли освоїшся, вибери «за дотиком», щоб читати німецький текст самостійно.</p></section>
    <section class="card"><h2 style="margin:0 0 6px;font-size:17px">Про іспит</h2><p class="note">33 питання: 30 загальних і 3 про твою федеральну землю (у Ксантені — Північний Рейн — Вестфалія), 60 хвилин, з чотирьох відповідей одна правильна. 17 правильних — тест на громадянство (Einbürgerungstest) складено; 15 — сертифікат «Leben in Deutschland» в інтеграційному курсі. Записатися на тест можна у Volkshochschule або в мовній школі.</p></section>`;
}
$('#view-hub').addEventListener('click', (e) => {
  const m = e.target.closest('[data-mode]'); if (m && !m.disabled) { startMode(m.dataset.mode); return; }
  const t = e.target.closest('[data-topic]'); if (t) { start(QUESTIONS.filter((x) => x.t === t.dataset.topic), { title: TOPICS.find((x) => x.id === t.dataset.topic).uk }); return; }
  const u = e.target.closest('[data-uk]'); if (u) { P.uk = u.dataset.uk === '1'; save(); renderHub(); haptic(); }
});
function startMode(mode) {
  if (mode === 'list') { go('list'); renderList(''); return; }
  if (mode === 'exam') { startExam(); return; }
  if (mode === 'order') { start(QUESTIONS.slice(P.last).concat(QUESTIONS.slice(0, P.last)), { title: 'По черзі', order: true }); return; }
  if (mode === 'new') { start(shuffle(QUESTIONS.filter((x) => !learned(x))), { title: 'Ще не вивчені' }); return; }
  if (mode === 'mistakes') start(dueIds().map((k) => BY_ID.get(k)), { title: 'Помилки' });
}
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------------- practice and exam ---------------- */
let R = null, timer = null;
function start(list, o) {
  if (!list.length) return;
  R = { list, i: 0, right: 0, answers: [], ...o };
  go('run'); renderQ();
}
function startExam() {
  const list = examSet();
  R = { list, i: 0, right: 0, answers: Array(list.length).fill(null), exam: true, title: 'Пробний іспит', end: Date.now() + EXAM.minutes * 60000 };
  go('run'); renderQ();
  clearInterval(timer); timer = setInterval(tickExam, 1000);
}
function tickExam() {
  const el = $('#timer'); if (!R || !R.exam || R.done) { clearInterval(timer); return; }
  const left = Math.max(0, Math.round((R.end - Date.now()) / 1000));
  if (el) { el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; el.classList.toggle('low', left < 300); }
  if (!left) finishExam();
}
const img = (x) => (x.img ? `<img src="img/${esc(x.img)}" alt="${x.img === 'lid-176.webp' || x.img === 'lid-nrw8.webp' ? 'Мапа Німеччини з номерами' : 'Чотири малюнки з номерами'}" loading="lazy">` : '') +
  (x.photo && x.id === 55 ? '<p class="photo">На фото в офіційному каталозі — велика будівля зі скляним куполом.</p>' : '');
function qHTML(x, n, of) {
  return `<section class="card qcard"><span class="num">${x.t === 'nrw' ? 'NRW' : '№'} ${esc(String(x.id).replace('nrw', ''))} · ${n} з ${of}</span>
    <div class="de" lang="de">${esc(x.q)}</div>${P.uk ? `<div class="uk">${esc(x.uk)}</div>` : `<button class="linkbtn" type="button" data-showuk>Показати переклад</button><div class="uk" hidden>${esc(x.uk)}</div>`}${img(x)}</section>`;
}
function renderQ() {
  const v = $('#view-run'), x = R.list[R.i];
  const head = `<div class="head"><button class="linkbtn" type="button" data-quit>← Назад</button><span class="note">${esc(R.title)}</span>${R.exam ? '<span class="timer" id="timer"></span>' : ''}</div>`;
  const picked = R.exam ? R.answers[R.i] : null;
  v.innerHTML = head + qHTML(x, R.i + 1, R.list.length) +
    `<div class="opts">${x.o.map((o, i) => `<button class="opt${picked === i ? ' picked' : ''}" type="button" data-o="${i}"><b lang="de">${esc(o)}</b>${P.uk ? `<small>${esc(x.ou[i])}</small>` : ''}</button>`).join('')}</div><div id="fb"></div>` +
    (R.exam ? `<p class="note">Вийти з іспиту можна кнопкою «Назад», але результат тоді не збережеться.</p><div class="dots" aria-label="Питання іспиту">${R.list.map((_, i) => `<button type="button" data-jump="${i}" class="${R.answers[i] != null ? 'ok' : ''}${i === R.i ? ' cur' : ''}" aria-label="Питання ${i + 1}${R.answers[i] != null ? ', є відповідь' : ''}">${i + 1}</button>`).join('')}</div>
      <button class="bigbtn" type="button" id="exam-next">${R.i + 1 < R.list.length ? 'Далі' : 'Перевірити'}</button><button class="bigbtn ghost" type="button" id="exam-end">Здати іспит</button>` : '');
  if (R.exam) tickExam();
}
function answer(i) {
  const x = R.list[R.i], ok = i === x.a;
  if (R.exam) { R.answers[R.i] = i; renderQ(); haptic(); return; }
  if (R.answered) return;
  R.answered = true;
  P.ok[x.id] = ok ? (P.ok[x.id] || 0) + 1 : 0;
  srs.grade(S, 'lid', String(x.id), ok, today());
  if (ok) R.right++;
  if (R.order) P.last = (QUESTIONS.indexOf(x) + 1) % QUESTIONS.length;
  save();
  document.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === x.a) b.classList.add('right'); if (j === i && !ok) b.classList.add('wrong'); });
  haptic(ok ? 'ok' : 'error');
  $('#fb').innerHTML = `<p class="note" style="margin:4px 0 8px;${ok ? 'color:var(--on)' : 'color:var(--danger)'};font-weight:600">${ok ? '✓ Правильно' : `✗ Правильна відповідь: «${esc(x.o[x.a])}»`}</p>
    <button class="bigbtn" type="button" id="next">${R.i + 1 < R.list.length ? 'Далі' : 'Результат'}</button>`;
  $('#next').focus({ preventScroll: true });
}
function finishPractice() {
  $('#view-run').innerHTML = `<section class="card res"><div style="font-size:44px" aria-hidden="true">${R.right === R.i ? '🏆' : '💪'}</div><div class="big">${R.right} з ${R.i}</div>
    <p class="note">Помилки повернуться в «Помилки», доки не запам’ятаються.</p><button class="bigbtn" type="button" data-quit>Готово</button></section>`;
}
function finishExam() {
  clearInterval(timer);
  R.done = true;
  const right = R.list.filter((x, i) => R.answers[i] === x.a).length;
  R.list.forEach((x, i) => { const ok = R.answers[i] === x.a; P.ok[x.id] = ok ? (P.ok[x.id] || 0) + 1 : 0; srs.grade(S, 'lid', String(x.id), ok, today()); });
  P.exams = [...P.exams, { at: Date.now(), right }].slice(-20); save();
  const pass = right >= EXAM.pass, lid = right >= EXAM.passLid;
  haptic(pass ? 'ok' : 'error');
  $('#view-run').innerHTML = `<div class="head"><button class="linkbtn" type="button" data-quit>← До розділу</button></div>
    <section class="card res ${pass ? 'pass' : 'fail'}"><div class="big">${right} з ${R.list.length}</div>
      <p><b>${pass ? '✓ Тест на громадянство складено (потрібно 17)' : lid ? '✓ Сертифікат «Leben in Deutschland» (15), але для громадянства потрібно 17' : '✗ Поки не складено: потрібно 17 правильних (15 — для інтеграційного курсу)'}</b></p></section>
    <ol class="cat">${R.list.map((x, i) => { const ok = R.answers[i] === x.a; return `<li><small>${ok ? '✓' : '✗'} № ${esc(String(x.id).replace('nrw', 'NRW '))}</small><span lang="de">${esc(x.q)}</span>${R.answers[i] != null && !ok ? `<small>Твоя відповідь: <span lang="de">${esc(x.o[R.answers[i]])}</span></small>` : R.answers[i] == null ? '<small>Без відповіді</small>' : ''}<span class="a" lang="de">${esc(x.o[x.a])}</span><small>${esc(x.ou[x.a])}</small></li>`; }).join('')}</ol>`;
  window.scrollTo(0, 0);
}
$('#view-run').addEventListener('click', (e) => {
  if (e.target.closest('[data-quit]')) { back(); return; }
  const su = e.target.closest('[data-showuk]'); if (su) { su.hidden = true; su.nextElementSibling.hidden = false; return; }
  const o = e.target.closest('[data-o]'); if (o && !o.disabled) { answer(Number(o.dataset.o)); return; }
  if (e.target.closest('#next')) { R.i++; R.answered = false; if (R.i >= R.list.length) finishPractice(); else { renderQ(); window.scrollTo(0, 0); } return; }
  const j = e.target.closest('[data-jump]'); if (j) { R.i = Number(j.dataset.jump); renderQ(); return; }
  if (e.target.closest('#exam-next')) { if (R.i + 1 < R.list.length) { R.i++; renderQ(); window.scrollTo(0, 0); } else confirmEnd(); return; }
  if (e.target.closest('#exam-end')) confirmEnd();
});
// with questions left open, the first tap says so and the second hands the exam in
function confirmEnd() {
  const open = R.answers.filter((a) => a == null).length, b = $('#exam-end');
  if (open && b && !b.dataset.armed) { b.dataset.armed = '1'; b.textContent = `Без відповіді ще ${open}. Натисни ще раз, щоб здати`; haptic(); return; }
  finishExam();
}

/* ---------------- the catalogue ---------------- */
const fold = (s) => String(s).toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[’']/g, '');
function renderList(q) {
  const f = fold(q.trim()), list = f.length < 2 ? QUESTIONS : QUESTIONS.filter((x) => fold([x.id, x.q, x.uk, ...x.o, ...x.ou].join(' ')).includes(f));
  const v = $('#view-list');
  if (!$('#lq')) v.innerHTML = `<div class="head"><button class="linkbtn" type="button" data-quit>← Назад</button><span class="note" id="lcount"></span></div>
    <input class="search" id="lq" type="search" placeholder="Слово німецькою чи українською, або номер" aria-label="Пошук у каталозі" autocomplete="off"><ol class="cat" id="lcat"></ol>`;
  $('#lcount').textContent = `${list.length} ${plural(list.length, 'питання', 'питання', 'питань')}`;
  $('#lcat').innerHTML = list.slice(0, 120).map((x) => `<li><small>№ ${esc(String(x.id).replace('nrw', 'NRW '))}</small><span lang="de">${esc(x.q)}</span><small>${esc(x.uk)}</small>${x.img ? `<img src="img/${esc(x.img)}" alt="" loading="lazy" style="max-width:100%;background:#fff;border-radius:8px;padding:4px">` : ''}<span class="a" lang="de">✓ ${esc(x.o[x.a])}</span><small>${esc(x.ou[x.a])}</small></li>`).join('') +
    (list.length > 120 ? '<li><small>Показано перші 120. Уточни пошук, щоб побачити решту.</small></li>' : '');
}
$('#view-list').addEventListener('input', (e) => { if (e.target.id === 'lq') renderList(e.target.value); });
$('#view-list').addEventListener('click', (e) => { if (e.target.closest('[data-quit]')) back(); });

/* ---------------- start ---------------- */
$('#src').innerHTML = `Питання: Bundesamt für Migration und Flüchtlinge, <span lang="de">«Gesamtfragenkatalog zum Test „Leben in Deutschland“ und zum „Einbürgerungstest“»</span>, стан на ${esc(STAND)}. Переклад і позначення правильних відповідей наші. Офіційне тренування: <a href="https://oet.bamf.de/" target="_blank" rel="noopener">Online-Testcenter BAMF</a>.`;
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
try { history.replaceState(null, '', location.pathname); } catch (e) { /* file:// */ }
show('hub');
window.__lid = { P, S, R: () => R, QUESTIONS };
