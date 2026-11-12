// "Пам'ять": classic pairs. A picture and its German word with the article make a pair; the word is spoken when its
// card turns over. Every pair found plants the word in the garden. No clock, only the number of moves.
import { THEMES } from './data/memory.js';
import { $, esc, haptic, shuffle, plural, load, store, reduce } from './kit.js';
import * as sound from '../audio/say.js';
import * as progress from './progress.js';
import * as garden from './garten.js';

const say = (w) => `${w[1]} ${w[0]}`;
export function status() { const n = Object.keys(progress.get().memory || {}).length; return n ? `Рекорди в ${n} з ${THEMES.length} тем` : 'Картинка і слово з артиклем'; }

export function create(root) {
  root.innerHTML = `
    <div class="card" id="m-start"><p class="note rules">Знайди пари: картинка і німецьке слово з артиклем. Слово звучить, коли картка відкривається. Кожна знайдена пара садить слово в «Сад слів».</p>
      <div class="chips" id="m-themes" role="radiogroup" aria-label="Тема"></div>
      <div class="seg2" role="radiogroup" aria-label="Кількість пар"><button type="button" role="radio" data-size="6">6 пар</button><button type="button" role="radio" data-size="8">8 пар</button></div>
      <button class="btn primary" id="m-go" type="button">Почати</button></div>
    <div id="m-play" hidden>
      <div class="mhead"><span id="m-moves"></span><span id="m-pairs"></span><button class="linkbtn" id="m-stop" type="button">Закінчити</button></div>
      <div class="board" id="m-board"></div>
    </div>
    <div class="card" id="m-end" hidden></div>`;
  let theme = load('dsimya-memory-theme'), size = Number(load('dsimya-memory-size')) === 8 ? 8 : 6, G = null;
  if (!THEMES.some((x) => x.id === theme)) theme = THEMES[0].id;

  function renderStart() {
    const best = progress.get().memory || {};
    $('#m-themes', root).innerHTML = THEMES.map((t) => `<button class="chip" type="button" role="radio" data-mtheme="${t.id}" aria-checked="${t.id === theme}">${t.words[0][3]} ${esc(t.name)}${best[t.id] ? `<small>${best[t.id]} ходів</small>` : ''}</button>`).join('');
    root.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.size) === size)));
  }
  function hud() {
    $('#m-moves', root).textContent = `${G.moves} ${plural(G.moves, 'хід', 'ходи', 'ходів')}`;
    $('#m-pairs', root).textContent = `${G.found} з ${G.words.length} пар`;
  }
  function begin() {
    const t = THEMES.find((x) => x.id === theme);
    const words = shuffle(t.words.slice()).slice(0, size);
    const cards = shuffle(words.flatMap((w, i) => [{ i, kind: 'p', w }, { i, kind: 'w', w }]));
    G = { t, words, cards, open: [], found: 0, moves: 0, lock: false };
    $('#m-board', root).className = 'board n' + cards.length;
    $('#m-board', root).innerHTML = cards.map((c, k) => `<button class="mcard" type="button" data-k="${k}" aria-label="Закрита картка ${k + 1}"><span class="face back" aria-hidden="true"></span>` +
      `<span class="face front ${c.kind === 'p' ? 'pic' : 'word'}" aria-hidden="true">${c.kind === 'p' ? c.w[3] : `<span class="art ${c.w[1]}">${c.w[1]}</span><span lang="de">${esc(c.w[0])}</span>`}</span></button>`).join('');
    $('#m-start', root).hidden = true; $('#m-end', root).hidden = true; $('#m-play', root).hidden = false;
    sound.prefetch(words.map(say));
    hud(); haptic();
  }
  function flip(k) {
    if (!G || G.lock) return;
    const c = G.cards[k], el = root.querySelector(`.mcard[data-k="${k}"]`);
    if (c.done || G.open.includes(k)) return;
    el.classList.add('flip'); el.setAttribute('aria-label', c.kind === 'p' ? `Картинка: ${c.w[2]}` : `Слово: ${say(c.w)}`);
    if (c.kind === 'w') sound.say(say(c.w));
    G.open.push(k); haptic('tap');
    if (G.open.length < 2) return;
    G.moves++; const [a, b] = G.open.map((x) => G.cards[x]);
    if (a.i === b.i && a.kind !== b.kind) {
      G.open.forEach((x) => { G.cards[x].done = true; root.querySelector(`.mcard[data-k="${x}"]`).classList.add('done'); });
      G.open = []; G.found++; haptic('ok');
      garden.plant(a.w[0]);
      if (a.kind === 'p') sound.say(say(a.w));
      hud();
      if (G.found === G.words.length) setTimeout(end, reduce ? 200 : 700);
    } else {
      G.lock = true; hud();
      setTimeout(() => { if (!G) return; G.open.forEach((x) => { const e = root.querySelector(`.mcard[data-k="${x}"]`); e.classList.remove('flip'); e.setAttribute('aria-label', 'Закрита картка ' + (x + 1)); }); G.open = []; G.lock = false; }, reduce ? 500 : 950);
    }
  }
  function end() {
    const g = G; G = null;
    const best = (progress.get().memory || {})[g.t.id];
    const record = g.words.length === 8 && (!best || g.moves < best);
    if (g.words.length === 8 && record) progress.set('memory', { ...progress.get().memory, [g.t.id]: g.moves });
    $('#m-play', root).hidden = true; $('#m-end', root).hidden = false;
    $('#m-end', root).innerHTML = `<h2>Усі пари знайдено 🎉</h2><p class="note">${g.moves} ${plural(g.moves, 'хід', 'ходи', 'ходів')}${record ? ' · новий рекорд для 8 пар!' : g.words.length === 6 ? '. Рекорд рахується для 8 пар.' : ''}</p>` +
      `<ul class="mwords">${g.words.map((w) => `<li><span class="e">${w[3]}</span><span class="t" lang="de"><span class="art ${w[1]}">${w[1]}</span> ${esc(w[0])}</span><span class="u">${esc(w[2])}</span><button class="say mini" type="button" data-say="${esc(say(w))}" aria-label="Прослухати">🔊</button></li>`).join('')}</ul>` +
      '<p class="note small">Ці слова тепер ростуть у «Саду слів».</p><button class="btn primary" id="m-again" type="button">Ще раз</button><button class="btn" id="m-menu" type="button">Інша тема</button>';
    haptic('ok');
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const th = t.closest('[data-mtheme]'); if (th) { theme = th.dataset.mtheme; store('dsimya-memory-theme', theme); renderStart(); haptic(); return; }
    const sz = t.closest('[data-size]'); if (sz) { size = Number(sz.dataset.size); store('dsimya-memory-size', size); renderStart(); haptic(); return; }
    if (t.closest('#m-go') || t.closest('#m-again')) return begin();
    if (t.closest('#m-menu') || t.closest('#m-stop')) { G = null; $('#m-play', root).hidden = true; $('#m-end', root).hidden = true; $('#m-start', root).hidden = false; renderStart(); return; }
    const c = t.closest('.mcard'); if (c) return flip(Number(c.dataset.k));
    const s = t.closest('[data-say]'); if (s) sound.say(s.dataset.say);
  });
  renderStart();
  return {
    open() { if (!G) renderStart(); },
    close() { G = null; $('#m-play', root).hidden = true; $('#m-end', root).hidden = true; $('#m-start', root).hidden = false; },
    busy: () => !!G,
    peek: () => (G ? { theme: G.t.id, cards: G.cards.map((c) => c.i + c.kind), moves: G.moves } : null),   // for the tests
  };
}
