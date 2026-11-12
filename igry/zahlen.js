// "Числа на слух": the voice says a number, a price, a time, a date, a year or a phone number; type it on the big
// keypad. Ten in a round, no clock; listen again as often as needed. After each answer the written form and the
// words are shown, so the ear learns what the eye sees.
import { ITEMS, KINDS, isRight } from './data/zahlen.js';
import { $, esc, haptic, shuffle, plural, load, store, SPEAKER } from './kit.js';
import * as sound from '../audio/say.js';
import * as progress from './progress.js';

const ROUND = 10;
const SEP = { preis: ',', zeit: ':', uhr: ':', datum: '.' };

export function status() { const n = progress.get().zahlRight; return n ? `${n} ${plural(n, 'правильна відповідь', 'правильні відповіді', 'правильних відповідей')}` : 'Ціни, час, дати, номери'; }

export function create(root) {
  root.innerHTML = `
    <div class="card" id="n-start"><p class="note rules">Голос називає число, ціну, час, дату або номер телефону, а ти набираєш його цифрами. Десять завдань, без таймера: слухати можна скільки завгодно.</p>
      <div class="chips" id="n-kinds" role="radiogroup" aria-label="Що тренувати"></div><p class="note small" id="n-hint"></p>
      <button class="btn primary" id="n-go" type="button">Почати</button></div>
    <div class="card nplay" id="n-play" hidden>
      <div class="nhead"><span id="n-step"></span><span class="nstreak" id="n-streak"></span><button class="linkbtn" id="n-stop" type="button">Закінчити</button></div>
      <button class="nlisten" id="n-say" type="button" aria-label="Прослухати ще раз">${SPEAKER}<span>Слухати ще раз</span></button>
      <div class="nshow" id="n-show" aria-live="polite"><span class="nin" id="n-in"></span><span class="ncaret"></span></div>
      <div class="nres" id="n-res" hidden></div>
      <div class="pad" id="n-pad" role="group" aria-label="Клавіатура"></div>
      <button class="btn primary" id="n-ok" type="button" disabled>Перевірити</button>
    </div>
    <div class="card" id="n-end" hidden></div>`;
  let kind = load('dsimya-zahl-kind');
  if (kind !== 'mix' && !KINDS.some((k) => k.id === kind)) kind = 'zahl';
  let R = null, typed = '';

  function renderKinds() {
    $('#n-kinds', root).innerHTML = [...KINDS, { id: 'mix', name: 'Усе разом' }].map((k) => `<button class="chip" type="button" role="radio" data-kind="${k.id}" aria-checked="${k.id === kind}">${esc(k.name)}</button>`).join('');
    const k = KINDS.find((x) => x.id === kind);
    $('#n-hint', root).textContent = k ? k.hint : 'Усі види вперемішку: ціни, час, дати, номери.';
  }
  function item() { return R.items[R.at]; }
  function renderPad() {
    const sep = SEP[item().kind] || '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', sep, '0', '⌫'];
    $('#n-pad', root).innerHTML = keys.map((k) => k ? `<button class="key${k === '⌫' ? ' back' : ''}" type="button" data-key="${k}" aria-label="${k === '⌫' ? 'Стерти' : k}">${k}</button>` : '<span></span>').join('');
  }
  function show() {
    $('#n-in', root).textContent = typed;
    $('#n-ok', root).disabled = !typed || R.answered;
  }
  function ask() {
    const it = item(); typed = ''; R.answered = false;
    $('#n-step', root).textContent = `${R.at + 1} з ${R.items.length}`;
    $('#n-streak', root).textContent = R.streak >= 3 ? `Серія ${R.streak}` : '';
    $('#n-res', root).hidden = true; $('#n-show', root).className = 'nshow';
    $('#n-ok', root).textContent = 'Перевірити';
    renderPad(); show();
    sound.say(it.say);
    sound.prefetch(R.items.slice(R.at + 1, R.at + 3).map((x) => x.say));
  }
  function check() {
    const it = item(); R.answered = true;
    const ok = isRight(it, typed);
    $('#n-show', root).className = 'nshow ' + (ok ? 'good' : 'bad');
    $('#n-res', root).innerHTML = (ok ? '<b class="ok">Правильно!</b> ' : `<b class="no">Правильно: ${esc(it.show)}</b> `) + `<span lang="de">«${esc(it.say)}»</span>` +
      (ok && it.kind === 'uhr' ? `<br><span class="note small">${esc(it.show)}: у розмові ранок і вечір звучать однаково.</span>` : '');
    $('#n-res', root).hidden = false;
    if (ok) { R.right++; R.streak++; progress.add('zahlRight'); progress.max('zahlStreak', R.streak); haptic('ok'); }
    else { R.streak = 0; R.miss.push(it); haptic('error'); }
    $('#n-ok', root).disabled = false; $('#n-ok', root).textContent = R.at + 1 < R.items.length ? 'Далі' : 'Підсумок';
    $('#n-ok', root).focus({ preventScroll: true });
  }
  function end() {
    const r = R; R = null;
    $('#n-play', root).hidden = true; $('#n-end', root).hidden = false;
    $('#n-end', root).innerHTML = `<h2>${r.right} з ${r.items.length}</h2><p class="note">${r.right === r.items.length ? 'Без жодної помилки! 🎉' : r.right >= 7 ? 'Дуже добре.' : 'Числа на слух — це тренування. Ще одне коло, і стане легше.'}</p>` +
      (r.miss.length ? `<ul class="miss">${r.miss.map((m) => `<li><b>${esc(m.show)}</b> — <span lang="de">${esc(m.say)}</span> <button class="say mini" type="button" data-again="${esc(m.say)}" aria-label="Прослухати">${SPEAKER}</button></li>`).join('')}</ul>` : '') +
      '<button class="btn primary" id="n-more" type="button">Ще раз</button><button class="btn" id="n-menu" type="button">Вибрати інше</button>';
  }
  function begin() {
    const pool = kind === 'mix' ? ITEMS : ITEMS.filter((x) => x.kind === kind);
    R = { items: shuffle(pool.slice()).slice(0, ROUND), at: 0, right: 0, streak: 0, miss: [], answered: false };
    $('#n-start', root).hidden = true; $('#n-end', root).hidden = true; $('#n-play', root).hidden = false;
    ask(); haptic();
  }
  function stop() { R = null; sound.stop(); $('#n-play', root).hidden = true; $('#n-end', root).hidden = true; $('#n-start', root).hidden = false; }
  function key(k) {
    if (!R || R.answered) return;
    if (k === '⌫') typed = typed.slice(0, -1);
    else if (typed.length < 16) typed += k;
    show(); haptic('tap');
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const kb = t.closest('[data-kind]');
    if (kb) { kind = kb.dataset.kind; store('dsimya-zahl-kind', kind); renderKinds(); haptic(); return; }
    if (t.closest('#n-go') || t.closest('#n-more')) return begin();
    if (t.closest('#n-menu')) { $('#n-end', root).hidden = true; $('#n-start', root).hidden = false; return; }
    if (t.closest('#n-stop')) return stop();
    if (t.closest('#n-say')) { if (R) sound.say(item().say); return; }
    const again = t.closest('[data-again]'); if (again) { sound.say(again.dataset.again); return; }
    const k = t.closest('[data-key]'); if (k) return key(k.dataset.key);
    if (t.closest('#n-ok')) { if (!R) return; if (!R.answered) check(); else if (++R.at < R.items.length) ask(); else end(); }
  });
  document.addEventListener('keydown', (e) => {
    if (!R || root.hidden || root.closest('[hidden]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); key(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); key('⌫'); }
    else if ([',', ':', '.'].includes(e.key) && SEP[item().kind] === e.key) { e.preventDefault(); key(e.key); }
    else if (e.key === 'Enter' && !$('#n-ok', root).disabled) { e.preventDefault(); $('#n-ok', root).click(); }
  });
  renderKinds();
  return {
    open() {},
    close() { if (R) stop(); },
    busy: () => !!R,
    peek: () => (R ? R.items[R.at] : null),   // for the tests
  };
}
