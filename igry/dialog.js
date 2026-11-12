// "Розмова": a scene as a chat. The other person's line is spoken (tap it to hear again, "Переклад" shows the
// Ukrainian); you pick an answer. A wrong one gets the reaction a real person would give and a hint, and you try again;
// the right one is said aloud too, so you hear how it sounds. A scene answered without a mistake earns a star.
import { SCENES, REACT } from './data/dialog.js';
import { $, esc, haptic, shuffle, SPEAKER } from './kit.js';
import * as sound from '../audio/say.js';
import * as progress from './progress.js';

export function status() { const P = progress.get(); return P.dialog.length ? `${P.dialog.length} з ${SCENES.length} сцен${P.dialogPerfect.length ? ' · ⭐ ' + P.dialogPerfect.length : ''}` : 'Пекарня, лікар, Bürgerbüro'; }

export function create(root) {
  root.innerHTML = `
    <div id="d-list"><div class="card"><p class="note rules">Маленькі сцени з життя: пекарня, лікар, Bürgerbüro, сусідка, вокзал. Співрозмовник говорить, а ти вибираєш відповідь. Помилка не програш: тобі підкажуть, і можна спробувати ще раз.</p></div>
      <div class="scenes" id="d-scenes"></div></div>
    <div class="dplay" id="d-play" hidden>
      <div class="dhead"><span class="demoji" id="d-emoji"></span><span><b id="d-name"></b><small id="d-who"></small></span><button class="linkbtn" id="d-stop" type="button">Вийти</button></div>
      <ol class="chat" id="d-chat" aria-live="polite"></ol>
      <div class="dhint" id="d-hint" role="status" hidden></div>
      <div class="dans" id="d-ans" role="group" aria-label="Твоя відповідь"></div>
    </div>`;
  let sc = null, step = 0, mistakes = 0, msgId = 0;

  function renderList() {
    const P = progress.get();
    $('#d-scenes', root).innerHTML = SCENES.map((s) => {
      const done = P.dialog.includes(s.id), star = P.dialogPerfect.includes(s.id);
      return `<button class="scene" type="button" data-scene="${s.id}"><span class="demoji">${s.emoji}</span><span class="t"><b>${esc(s.name)}</b><small lang="de">${esc(s.de)}</small></span>` +
        `<span class="dst">${star ? '⭐' : done ? '✓' : ''}</span></button>`;
    }).join('');
  }
  function bubble(who, de, uk, extra = '') {
    const id = 'm' + (++msgId);
    const li = document.createElement('li');
    li.className = 'msg ' + who + (extra ? ' ' + extra : '');
    li.innerHTML = `<button class="bub" type="button" data-say="${esc(de)}" aria-label="Прослухати: ${esc(de)}"><span lang="de">${esc(de)}</span>${sound.has(de) ? `<i>${SPEAKER}</i>` : ''}</button>` +
      (uk ? `<button class="tr" type="button" aria-expanded="false" aria-controls="${id}">Переклад</button><span class="uk" id="${id}" hidden>${esc(uk)}</span>` : '');
    $('#d-chat', root).appendChild(li);
    li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return li;
  }
  function ask() {
    const st = sc.steps[step];
    bubble('npc', st.npc[0], st.npc[1]);
    sound.say(st.npc[0]);
    const order = shuffle(st.answers.map((a, k) => k));
    $('#d-ans', root).innerHTML = order.map((k) => `<button class="opt" type="button" data-a="${k}" lang="de">${esc(st.answers[k][0])}</button>`).join('');
    $('#d-hint', root).hidden = true;
    const nx = sc.steps[step + 1];
    sound.prefetch([st.answers[0][0], ...(nx ? [nx.npc[0]] : [sc.end[0]])]);
  }
  function answer(k, btn) {
    const st = sc.steps[step];
    if (k === 0) {
      haptic('ok');
      $('#d-ans', root).innerHTML = '';
      bubble('me', st.answers[0][0], st.answers[0][1]);
      const me = sc; let gone = false;
      const go = (ms) => () => { if (gone) return; gone = true; setTimeout(() => { if (sc === me) nextStep(); }, ms); };
      if (!sound.say(st.answers[0][0], { off: go(350) })) go(700)();
      return;
    }
    mistakes++; haptic('error');
    btn.disabled = true; btn.classList.add('wrong');
    bubble('me', st.answers[k][0], st.answers[k][1], 'wrongmsg');
    const r = REACT[(st.react || {})[k] || 'wie'];
    setTimeout(() => { bubble('npc', r[0], r[1]); sound.say(r[0]); }, 400);
    $('#d-hint', root).innerHTML = `💡 ${esc((st.why || {})[k] || 'Спробуй іншу відповідь.')}`;
    $('#d-hint', root).hidden = false;
  }
  function nextStep() {
    if (!sc) return;
    step++;
    if (step < sc.steps.length) return ask();
    bubble('npc', sc.end[0], sc.end[1]); sound.say(sc.end[0]);
    progress.mark('dialog', sc.id); if (!mistakes) progress.mark('dialogPerfect', sc.id);
    $('#d-ans', root).innerHTML = `<div class="dend"><b>${mistakes ? 'Сцену пройдено ✓' : 'Без жодної помилки ⭐'}</b><small>${mistakes ? `Помилок: ${mistakes}. Повтори, щоб отримати зірку.` : 'Так і говори в реальному житті.'}</small></div>` +
      '<button class="btn primary" type="button" data-replay>Ще раз</button><button class="btn" type="button" data-list>Інші сцени</button>';
    haptic('ok');
  }
  function open(id) {
    sc = SCENES.find((s) => s.id === id); step = 0; mistakes = 0;
    $('#d-list', root).hidden = true; $('#d-play', root).hidden = false;
    $('#d-emoji', root).textContent = sc.emoji; $('#d-name', root).textContent = sc.name; $('#d-who', root).textContent = sc.who;
    $('#d-chat', root).innerHTML = '';
    sound.prefetch([sc.steps[0].npc[0], sc.steps[0].answers[0][0]]);
    ask();
  }
  function back() { sc = null; sound.stop(); $('#d-play', root).hidden = true; $('#d-list', root).hidden = false; renderList(); }
  root.addEventListener('click', (e) => {
    const t = e.target;
    const s = t.closest('[data-scene]'); if (s) { open(s.dataset.scene); haptic(); return; }
    const a = t.closest('.opt'); if (a && !a.disabled) return answer(Number(a.dataset.a), a);
    const b = t.closest('.bub'); if (b) { sound.say(b.dataset.say); return; }
    const tr = t.closest('.tr');
    if (tr) { const u = tr.nextElementSibling, open = u.hidden; u.hidden = !open; tr.setAttribute('aria-expanded', String(open)); tr.textContent = open ? 'Сховати' : 'Переклад'; return; }
    if (t.closest('[data-replay]')) return open(sc.id);
    if (t.closest('[data-list]') || t.closest('#d-stop')) return back();
  });
  renderList();
  return {
    open() { if (!sc) renderList(); },
    close() { if (sc) back(); },
    busy: () => !!sc,
    peek: () => (sc ? { id: sc.id, step } : null),   // for the tests
  };
}
