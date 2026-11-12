// "Збери речення": the words of a sentence lie as cards; put them in order. No clock: check when ready, and a wrong
// order only shows from where it goes off; after the second try the answer can be shown. Each solved sentence is
// spoken and its rule shown. Four levels, ten sentences each; what is solved stays solved.
import { SENTENCES, LEVELS, RULES, isRight, rightFromStart } from './data/satz.js';
import { $, esc, haptic, shuffle, plural, load, store, SPEAKER } from './kit.js';
import * as sound from '../audio/say.js';
import * as progress from './progress.js';

const ids = SENTENCES.map((s, i) => i);
const doneSet = () => new Set(progress.get().satz);

export function status() { const n = progress.get().satz.length; return n ? `${n} з ${SENTENCES.length} речень` : `${SENTENCES.length} речень, ${LEVELS.length} рівні`; }

export function create(root) {
  root.innerHTML = `
    <div class="card"><p class="note rules">Склади слова в правильному порядку. Часу не обмежено: перевір, коли будеш готовий. Після кожного речення — коротке правило й озвучення.</p>
      <div class="chips levels" id="z-levels" role="radiogroup" aria-label="Рівень"></div><p class="note small" id="z-lvnote"></p></div>
    <div class="card zplay" id="z-play">
      <div class="zhead"><span id="z-count"></span><button class="say" id="z-say" type="button" aria-label="Прослухати речення" hidden>${SPEAKER}</button></div>
      <p class="zuk" id="z-uk"></p>
      <div class="zline" id="z-line" aria-label="Твоє речення" aria-live="polite"></div>
      <div class="zpool" id="z-pool" aria-label="Слова"></div>
      <p class="zmsg" id="z-msg" role="status"></p>
      <div class="zrule" id="z-rule" hidden></div>
      <div class="zbtns"><button class="btn" id="z-show" type="button" hidden>Показати відповідь</button><button class="btn primary" id="z-check" type="button" disabled>Перевірити</button></div>
    </div>`;
  let lv = LEVELS.some((L) => L.lv === Number(load('dsimya-satz-lv'))) ? Number(load('dsimya-satz-lv')) : 1, cur = null, line = [], pool = [], tries = 0, solved = false;

  function renderLevels() {
    const done = doneSet();
    $('#z-levels', root).innerHTML = LEVELS.map((L) => {
      const all = SENTENCES.filter((s) => s.lv === L.lv), n = all.filter((s) => done.has(SENTENCES.indexOf(s))).length;
      return `<button class="chip" type="button" role="radio" data-lv="${L.lv}" aria-checked="${L.lv === lv}">${L.lv}. ${esc(L.short)}<small>${n}/${all.length}</small></button>`;
    }).join('');
    $('#z-lvnote', root).textContent = LEVELS[lv - 1].name;
  }
  function pick() {
    const done = doneSet(), list = ids.filter((i) => SENTENCES[i].lv === lv);
    const open = list.filter((i) => !done.has(i));
    return open.length ? open[0] : list[Math.floor(Math.random() * list.length)];
  }
  function start(i) {
    cur = i; const s = SENTENCES[i];
    line = []; tries = 0; solved = false;
    // a shuffle that is not already the right order
    do { pool = shuffle(s.t.map((w, k) => ({ w, k }))); } while (s.t.length > 2 && isRight(s, pool.map((c) => c.w)));
    const done = doneSet(), list = SENTENCES.filter((x) => x.lv === lv);
    $('#z-count', root).textContent = `Рівень ${lv} · ${list.filter((x) => done.has(SENTENCES.indexOf(x))).length} з ${list.length} зібрано`;
    $('#z-uk', root).textContent = s.uk;
    $('#z-rule', root).hidden = true; $('#z-show', root).hidden = true; $('#z-say', root).hidden = true;
    $('#z-msg', root).textContent = ''; $('#z-msg', root).className = 'zmsg';
    $('#z-check', root).textContent = 'Перевірити';
    sound.prefetch([s.ok[0]]);
    draw();
  }
  function draw(bad = -1) {
    const card = (c, where, k) => `<button class="zw${bad >= 0 && where === 'line' && k >= bad ? ' off' : ''}" type="button" data-where="${where}" data-k="${k}" lang="de"${solved ? ' disabled' : ''}>${esc(c.w)}</button>`;
    $('#z-line', root).innerHTML = line.length ? line.map((c, k) => card(c, 'line', k)).join('') : '<span class="zhint">Торкайся слів нижче по черзі</span>';
    $('#z-pool', root).innerHTML = pool.map((c, k) => card(c, 'pool', k)).join('');
    $('#z-check', root).disabled = !solved && pool.length > 0;
    root.querySelector('#z-line').classList.toggle('done', solved);
  }
  function check() {
    const s = SENTENCES[cur], words = line.map((c) => c.w);
    if (isRight(s, words)) {
      solved = true; progress.mark('satz', cur); haptic('ok');
      const said = s.ok.find((o) => o.replace(/[,.?!]/g, '').toLowerCase() === [words[0][0].toUpperCase() + words[0].slice(1), ...words.slice(1)].join(' ').toLowerCase()) || s.ok[0];
      $('#z-msg', root).textContent = `Правильно: ${said}`; $('#z-msg', root).className = 'zmsg ok';
      $('#z-rule', root).innerHTML = `<b>Правило.</b> ${esc(RULES[s.r])}` + (s.ok.length > 1 ? `<br><span class="note small">Так теж правильно: ${s.ok.filter((o) => o !== said).map(esc).join(' · ')}</span>` : '');
      $('#z-rule', root).hidden = false; $('#z-show', root).hidden = true; $('#z-say', root).hidden = false;
      $('#z-check', root).textContent = 'Наступне речення';
      sound.say(s.ok[0]);
      renderLevels(); draw();
      return;
    }
    tries++; haptic('error');
    const from = rightFromStart(s, words);
    $('#z-msg', root).textContent = from ? `Перші ${from} ${plural(from, 'слово стоїть', 'слова стоять', 'слів стоять')} правильно. Далі щось не так.` : 'Почни інакше: подумай, що стоїть на першому місці.';
    $('#z-msg', root).className = 'zmsg bad';
    $('#z-show', root).hidden = tries < 2;
    draw(from);
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const lvb = t.closest('[data-lv]');
    if (lvb) { lv = Number(lvb.dataset.lv); store('dsimya-satz-lv', lv); renderLevels(); start(pick()); haptic(); return; }
    const w = t.closest('.zw');
    if (w && !solved) {
      const k = Number(w.dataset.k);
      if (w.dataset.where === 'pool') line.push(pool.splice(k, 1)[0]); else pool.push(line.splice(k, 1)[0]);
      $('#z-msg', root).textContent = ''; draw(); haptic('tap'); return;
    }
    if (t.closest('#z-check')) { if (solved) start(pick()); else check(); return; }
    if (t.closest('#z-say')) { sound.say(SENTENCES[cur].ok[0]); return; }
    if (t.closest('#z-show')) {
      const s = SENTENCES[cur], want = s.ok[0].replace(/[,.?!]/g, '').split(' ');
      const left = [...line, ...pool]; line = [];
      want.forEach((x, k) => { const j = left.findIndex((c) => c.w.toLowerCase() === x.toLowerCase()); line.push(left.splice(j, 1)[0]); });
      pool = []; $('#z-msg', root).textContent = 'Ось правильний порядок. Натисни «Перевірити».'; $('#z-msg', root).className = 'zmsg'; draw(); return;
    }
  });
  renderLevels(); start(pick());
  return {
    open() { renderLevels(); },
    close() { sound.stop(); },
    peek: () => SENTENCES[cur],   // for the tests
  };
}
