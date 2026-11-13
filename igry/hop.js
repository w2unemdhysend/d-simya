// "Пригоди шкарпетки": the 2.5D platformer among the games (seen from the side, drawn in 3D as pixel art). This module
// is the light part: the list of levels, the screen around the picture (stick, jump, the word being collected, pause,
// the end of a level) and saving what was done. The picture itself (three.js, ~750 KB) loads only when a level starts:
// hop/engine.js and hop/art.js (kept for offline play by sw.js).
import { $, esc, haptic, tg, load, store, toast, reduce, plural, SPEAKER } from './kit.js';
import * as progress from './progress.js';
import * as garden from './garten.js';
import * as sound from '../audio/say.js';
import { LEVELS } from './hop/levels.js?v=2';

const SOUND_KEY = 'dsimya-hop-sound';

/* ---------------- what was done ---------------- */
const P = () => progress.get();
const best = (id) => (P().hop || {})[id] || 0;              // the best time in tenths of a second
const done = (id) => best(id) > 0;
const starsOf = (id) => (done(id) ? 1 : 0) + ((P().hopWord || []).includes(id) ? 1 : 0) + ((P().hopFast || []).includes(id) ? 1 : 0);
const open = (i) => i === 0 || done(LEVELS[i - 1].id);
const fmtT = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export function status() {
  const n = LEVELS.filter((l) => done(l.id)).length, st = LEVELS.reduce((a, l) => a + starsOf(l.id), 0);
  if (!n) return `2.5D-платформер · ${LEVELS.length} ${plural(LEVELS.length, 'рівень', 'рівні', 'рівнів')}`;
  return (n === LEVELS.length ? 'Пару знайдено!' : `Пройдено ${n} з ${LEVELS.length}`) + ` · ★ ${st} з ${LEVELS.length * 3}`;
}
export const canPlay = () => { try { const c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch (e) { return false; } };

/* ---------------- little sounds, made on the spot (no files) ---------------- */
let ac = null, soundOn = load(SOUND_KEY) !== false;
function tone(f0, f1, dur, type = 'triangle', vol = 0.07, delay = 0) {
  if (!soundOn || !ac) return;
  try {
    const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch (e) {}
}
function noise(dur, vol = 0.06, freq = 900) {
  if (!soundOn || !ac) return;
  try {
    const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
    s.connect(f).connect(g).connect(ac.destination); s.start();
  } catch (e) {}
}
const SFX = {
  jump: () => tone(320, 620, 0.13, 'square', 0.035),
  land: () => noise(0.07, 0.05, 500),
  letter: () => { tone(880, 880, 0.12, 'sine', 0.08); tone(1320, 1320, 0.18, 'sine', 0.07, 0.07); },
  spring: () => tone(180, 760, 0.32, 'sine', 0.09),
  checkpoint: () => [523, 659, 784].forEach((f, i) => tone(f, f, 0.14, 'triangle', 0.06, i * 0.08)),
  fall: () => { noise(0.35, 0.08, 1200); tone(400, 120, 0.4, 'sine', 0.05); },
  crumble: () => noise(0.25, 0.05, 300),
  goal: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, f, i > 3 ? 0.3 : 0.14, 'triangle', 0.07, i * 0.1)),
};

/* ---------------- the picture on the menu card and the first screen: a rainy night street, pixel by pixel ---------------- */
export function strip(big) {
  const id = big ? 'hpSkyB' : 'hpSky', r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  let city = '', lit = '';
  [[0, 34, 22], [22, 22, 16], [38, 40, 20], [58, 14, 18], [76, 30, 24], [100, 20, 14], [114, 36, 22], [136, 10, 20], [156, 28, 18], [174, 18, 24], [198, 34, 16], [214, 12, 22], [236, 26, 18], [254, 38, 20], [274, 16, 22], [296, 30, 24]]
    .forEach(([x, y, w], k) => { city += r(x, y, w, 96 - y, k % 2 ? '#1C1636' : '#231B42'); for (let wy = y + 4; wy < 70; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 5) if ((wx * 7 + wy * 13 + k) % 5 === 0) lit += r(wx, wy, 2, 3, (wx + wy) % 3 ? '#FFC870' : '#8AD8FF'); });
  let rain = '';
  for (let k = 0; k < 26; k++) { const x = (k * 53) % 320, y = (k * 29) % 70; rain += `<path d="M${x} ${y}l-2 9" stroke="#A8B8F0" stroke-opacity=".45" stroke-width="1"/>`; }
  return `<svg viewBox="0 0 320 96" class="hop-art${big ? ' big' : ''}" aria-hidden="true" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05040C"/><stop offset=".6" stop-color="#1A1230"/><stop offset="1" stop-color="#4A2850"/></linearGradient></defs>
    <rect width="320" height="96" rx="14" fill="url(#${id})"/>
    <g>${city}${lit}</g>
    ${r(150, 26, 34, 11, '#0A0A10')}<text x="167" y="35" font-family="system-ui, sans-serif" font-weight="800" font-size="10" fill="#FF4D7D" text-anchor="middle" style="filter:drop-shadow(0 0 3px #FF4D7D)">KINO</text>
    ${r(30, 30, 2, 66, '#0E0C18')}${r(30, 30, 12, 2, '#0E0C18')}${r(40, 32, 6, 3, '#FFE9B0')}<path d="M43 35 L28 96 L62 96 Z" fill="#FFE9B0" fill-opacity=".14" shape-rendering="auto"/>
    ${r(0, 70, 96, 26, '#14121E')}${r(0, 68, 96, 3, '#5A5E6A')}
    ${r(126, 62, 52, 34, '#14121E')}${r(126, 60, 52, 3, '#5A5E6A')}
    ${r(214, 52, 40, 14, '#B98443')}${r(228, 52, 10, 14, '#E0C89A')}
    ${r(270, 60, 50, 36, '#14121E')}${r(270, 58, 50, 3, '#5A5E6A')}
    <g transform="translate(102 34) rotate(-12)">${r(-8, -8, 16, 16, '#D6453A')}<text x="0" y="5" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">S</text></g>
    <g transform="translate(196 30) rotate(10)">${r(-8, -8, 16, 16, '#D6453A')}<text x="0" y="5" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">O</text></g>
    <path d="M70 58 Q110 18 140 52" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2" stroke-dasharray="2 5" shape-rendering="auto"/>
    <g transform="translate(150 50)">
      ${r(-6, -18, 12, 16, '#F2C230')}${r(-14, -4, 20, 8, '#F2C230')}${r(-16, -4, 6, 8, '#D6453A')}${r(-6, 2, 6, 2, '#D6453A')}
      ${r(-6, -13, 12, 2, '#2F5DB3')}${r(-6, -9, 12, 2, '#2F5DB3')}${r(-7, -21, 14, 3, '#2F5DB3')}
      ${r(-4, -7, 3, 3, '#FFFFFF')}${r(1, -7, 3, 3, '#FFFFFF')}${r(-3, -6, 1, 2, '#14171B')}${r(2, -6, 1, 2, '#14171B')}
    </g>
    <g>${rain}</g></svg>`;
}

/* ---------------- the game screen ---------------- */
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.5"/><rect x="13.5" y="5" width="4" height="14" rx="1.5"/></svg>';
const UP = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13l6-6 6 6"/><path d="M6 18.5l6-6 6 6" opacity=".45"/></svg>';
const STAR = (on, i) => `<svg viewBox="0 0 24 24" class="${on ? 'on' : ''}" style="--k:${i}" aria-hidden="true"><path d="M12 2.8l2.75 5.75 6.3.8-4.62 4.38 1.17 6.27L12 16.95 6.4 20l1.17-6.27L2.95 9.35l6.3-.8z"/></svg>`;
const touch = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

export function create(root) {
  root.innerHTML = `
    <div class="card hop-intro">
      <div class="hop-hero">${strip(true)}</div>
      <p class="note rules" id="hp-story">Шкарпетка втекла з пральні й шукає свою пару. Шість місць Ксантена вночі, у тумані й на заході сонця: біжи й стрибай з платформи на платформу і збирай літери, з них складеться німецьке слово.</p>
      <button class="btn primary" id="hp-go" type="button"></button>
    </div>
    <div class="card hop-no" id="hp-no" hidden><h2>Гра тут не запускається</h2><p class="note">Цей пристрій або браузер не вміє показувати 3D-графіку (WebGL 2). Спробуй у Telegram на телефоні чи в Chrome, Safari або Firefox.</p></div>
    <ol class="hop-list" id="hp-list" aria-label="Рівні"></ol>
    <p class="note small" id="hp-keys"></p>`;
  const list = $('#hp-list', root);
  let stage = null, eng = null, cur = -1, state = 'idle', ro = null, hintTimer = null, endTimer = null;

  function renderList() {
    const next = LEVELS.findIndex((l, i) => open(i) && !done(l.id));
    const go = next >= 0 ? next : 0;
    $('#hp-go', root).textContent = next < 0 ? 'Грати ще раз: ' + LEVELS[0].name : (next === 0 && !done(LEVELS[0].id) ? 'Почати: ' : 'Далі: ') + LEVELS[go].name;
    $('#hp-go', root).dataset.lv = go;
    list.innerHTML = LEVELS.map((l, i) => {
      const ok = open(i), st = starsOf(l.id), word = (P().hopWord || []).includes(l.id);
      const what = !ok ? `Спершу пройди «${esc(LEVELS[i - 1].name)}»`
        : (word ? `<span class="art ${l.word[0]}">${l.word[0]}</span> <span lang="de">${esc(l.word[1])}</span>` : `${[...l.word[1]].length} ${plural([...l.word[1]].length, 'літера', 'літери', 'літер')}`) + (done(l.id) ? ` · ${fmtT(best(l.id) / 10)}` : '');
      return `<li><button class="hop-lv${ok ? '' : ' locked'}" type="button" data-lv="${i}"${ok ? '' : ' disabled'}>
        <span class="num">${ok ? i + 1 : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>'}</span>
        <span class="t"><b>${esc(l.name)}</b><small>${what}</small></span>
        <span class="stars" role="img" aria-label="${st} ${plural(st, 'зірка', 'зірки', 'зірок')} з 3">${[0, 1, 2].map((k) => STAR(k < st, k)).join('')}</span></button></li>`;
    }).join('');
    $('#hp-keys', root).textContent = touch() ? 'Рух — тягни пальцем ліворуч або праворуч у лівій половині екрана. Стрибок — торкнись правої половини; довше тримаєш — вище стрибок.'
      : 'Рух — стрілки ← → або A і D. Стрибок — пробіл або ↑; довше тримаєш — вище стрибок. Пауза — Esc.';
    const can = canPlay();
    $('#hp-no', root).hidden = can; $('#hp-go', root).disabled = !can;
    list.querySelectorAll('.hop-lv').forEach((b) => { if (!can) b.disabled = true; });
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('#hp-go, .hop-lv'); if (!b || b.disabled) return;
    play(Number(b.dataset.lv));
  });

  /* the screen over the page while a level runs */
  function buildStage() {
    stage = document.createElement('div');
    stage.className = 'hop-stage'; stage.id = 'hop-stage'; stage.hidden = true;
    stage.setAttribute('data-noswipe', ''); stage.setAttribute('data-noedge', '');
    stage.setAttribute('role', 'application');
    stage.setAttribute('aria-label', 'Пригоди шкарпетки, гра. Стрілки вліво й управо — рух, пробіл або стрілка вгору — стрибок, Escape — пауза.');
    stage.innerHTML = `<canvas class="hop-cv" id="hp-cv"></canvas>
      <div class="hop-top"><button class="hop-b" id="hp-pause" type="button" aria-label="Пауза">${PAUSE}</button>
        <div class="hop-word" id="hp-word" aria-live="polite"></div><div class="hop-time" id="hp-time" aria-hidden="true">0:00</div></div>
      <div class="hop-msg" id="hp-msg" role="status"></div>
      <div class="hop-hint" id="hp-hint" hidden></div>
      <div class="hop-joy" id="hp-joy" aria-hidden="true"><span class="ring"></span><span class="knob"></span></div><div class="hop-pad" aria-hidden="true"></div>
      <div class="hop-jump" id="hp-jump" aria-hidden="true">${UP}</div>
      <div class="hop-sheet" id="hp-pausebox" hidden role="dialog" aria-modal="true" aria-labelledby="hp-ptitle"><div class="hop-card">
        <h2 id="hp-ptitle">Пауза</h2><p class="note" id="hp-pinfo"></p>
        <button class="btn primary" id="hp-resume" type="button">Грати далі</button>
        <button class="btn" id="hp-restart" type="button">Почати рівень знову</button>
        <button class="btn" id="hp-full" type="button" aria-pressed="false" hidden></button>
        <button class="btn" id="hp-sound" type="button" aria-pressed="true"></button>
        <button class="btn" id="hp-leave" type="button">До рівнів</button></div></div>
      <div class="hop-sheet" id="hp-end" hidden role="dialog" aria-modal="true" aria-labelledby="hp-etitle"><div class="hop-card" id="hp-endcard"></div></div>
      <div class="hop-load" id="hp-load"><span class="spin" aria-hidden="true"></span><span>Завантажую гру…</span></div>`;
    stage.classList.toggle('touch', touch());
    document.body.appendChild(stage);
    stage.addEventListener('click', onClick);
    bindTouch(); bindKeys();
    ro = new ResizeObserver(() => { if (eng) eng.resize(); });
    ro.observe(stage);
    document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') pause(); });
    window.addEventListener('popstate', (e) => { if (stage && !stage.hidden && !(e.state && e.state.hopLevel != null)) closeStage(); });
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    const id = b.id;
    if (id === 'hp-pause') pause();
    else if (id === 'hp-resume') resume();
    else if (id === 'hp-restart') { haptic(); begin(cur); }
    else if (id === 'hp-leave' || id === 'hp-list') leave();
    else if (id === 'hp-sound') { soundOn = !soundOn; store(SOUND_KEY, soundOn); paintSound(); if (soundOn) SFX.letter(); }
    else if (id === 'hp-full' && window.UI && UI.toggleFull) { haptic(); UI.toggleFull(); }
    else if (id === 'hp-next') { haptic(); begin(cur + 1); }
    else if (id === 'hp-again') { haptic(); begin(cur); }
    else if (id === 'hp-say') { const l = LEVELS[cur]; sound.say(`${l.word[0]} ${l.word[1]}`); }
  }
  function paintSound() { const b = $('#hp-sound', stage); b.textContent = soundOn ? 'Звук: увімкнено' : 'Звук: вимкнено'; b.setAttribute('aria-pressed', String(soundOn)); }
  // Telegram's full screen suits a game best; the same switch as in the section menu
  function paintFull() {
    if (!stage) return;
    const b = $('#hp-full', stage), can = !!(window.UI && UI.canFull && UI.canFull()), on = can && UI.isFull();
    b.hidden = !can; b.textContent = on ? 'Звичайний розмір' : 'На весь екран'; b.setAttribute('aria-pressed', String(on));
  }
  try { if (tg && tg.onEvent) { tg.onEvent('fullscreenChanged', paintFull); tg.onEvent('fullscreenFailed', paintFull); } } catch (e) {}

  /* the stick (left half: left and right) and the jump (right half), each finger on its own */
  const joy = { id: null, x0: 0, y0: 0 }, jumpers = new Set();
  function bindTouch() {
    const J = $('#hp-joy', stage), R = 56;
    const knob = J.querySelector('.knob');
    const zone = (e) => e.clientX < stage.clientWidth * 0.5 ? 'move' : 'jump';
    stage.addEventListener('pointerdown', (e) => {
      if (state !== 'play' || e.pointerType === 'mouse' || e.target.closest('button, .hop-sheet')) return;
      e.preventDefault();
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      if (zone(e) === 'move' && joy.id == null) {
        joy.id = e.pointerId; joy.x0 = e.clientX; joy.y0 = e.clientY;
        J.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px)`; J.classList.add('on'); knob.style.transform = '';
      } else if (zone(e) === 'jump') {
        jumpers.add(e.pointerId); if (eng) eng.jump(true); $('#hp-jump', stage).classList.add('on'); hideHint(true);
      }
    });
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerId !== joy.id || !eng) return;
      let dx = e.clientX - joy.x0;   // only sideways counts: the stick follows a finger that goes on past its edge
      if (Math.abs(dx) > R) { joy.x0 += Math.sign(dx) * (Math.abs(dx) - R); dx = Math.sign(dx) * R; J.style.transform = `translate(${joy.x0 - 60}px, ${joy.y0 - 60}px)`; }
      knob.style.transform = `translate(${dx}px, 0)`;
      const k = Math.min(1, Math.abs(dx) / R), dead = 0.14, s = k < dead ? 0 : (k - dead) / (1 - dead);
      eng.stick(Math.sign(dx) * s);
      if (s > 0.3) hideHint();
    });
    const up = (e) => {
      if (e.pointerId === joy.id) { joy.id = null; if (eng) eng.stick(0); J.classList.remove('on'); knob.style.transform = ''; }
      if (jumpers.delete(e.pointerId) && !jumpers.size) { if (eng) eng.jump(false); $('#hp-jump', stage).classList.remove('on'); }
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  const keys = new Set();
  function bindKeys() {
    const MOVE = { ArrowLeft: 1, ArrowRight: 1, KeyA: 1, KeyD: 1 }, JUMP = { Space: 1, ArrowUp: 1, KeyW: 1, KeyK: 1 };
    const apply = () => {
      if (!eng) return;
      eng.stick((keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0));
    };
    document.addEventListener('keydown', (e) => {
      if (!stage || stage.hidden) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (state === 'play') pause(); else if (state === 'pause') resume(); return; }
      if (state !== 'play') return;
      if (MOVE[e.code]) { e.preventDefault(); keys.add(e.code); apply(); hideHint(); }
      if (JUMP[e.code]) { e.preventDefault(); if (!e.repeat) { if (eng) eng.jump(true); hideHint(true); } }
    });
    document.addEventListener('keyup', (e) => {
      if (MOVE[e.code]) { keys.delete(e.code); apply(); }
      if (JUMP[e.code] && eng) eng.jump(false);
    });
  }

  /* HUD */
  function word() {
    const l = LEVELS[cur], W = eng && eng.world, ch = [...l.word[1].toUpperCase()];
    $('#hp-word', stage).innerHTML = `<span class="art ${l.word[0]}">${l.word[0]}</span><span class="slots" aria-label="Зібрано ${W ? W.got.filter(Boolean).length : 0} з ${ch.length} літер">${ch.map((c, k) => `<i class="${W && W.got[k] ? 'got' : ''}" data-k="${k}">${W && W.got[k] ? esc(c) : ''}</i>`).join('')}</span>`;
  }
  let msgTimer = null;
  function msg(text, ms = 1400) { const m = $('#hp-msg', stage); m.textContent = text; m.classList.add('show'); clearTimeout(msgTimer); msgTimer = setTimeout(() => m.classList.remove('show'), ms); }
  let lastSec = -1;
  function tick() {
    if (!stage || stage.hidden || !eng) return;
    const W = eng.world;
    if (W) { const s = Math.floor(W.t); if (s !== lastSec) { lastSec = s; $('#hp-time', stage).textContent = fmtT(W.t); } }
    if (state === 'play') requestAnimationFrame(tick);
  }
  function showHint() {
    const h = $('#hp-hint', stage);
    h.innerHTML = touch() ? '<span><b>Рух</b> — тягни пальцем ліворуч і праворуч</span><span><b>Стрибок</b> — торкнись тут</span>' : '<span><b>Рух</b> — стрілки ← →</span><span><b>Стрибок</b> — пробіл</span>';
    h.classList.toggle('keys', !touch()); h.hidden = false; h.classList.remove('out');
    clearTimeout(hintTimer); hintTimer = setTimeout(() => hideHint(true), 9000);
  }
  // the hint stays until the first jump (moving alone is not enough to show both were found)
  function hideHint(jumped) {
    const h = stage && $('#hp-hint', stage); if (!h || h.hidden || !jumped) return;
    clearTimeout(hintTimer); h.classList.add('out'); setTimeout(() => { h.hidden = true; }, 350);
  }

  /* events from the world of the game */
  function onEvent(e, W) {
    if (e.type === 'jump') SFX.jump();
    else if (e.type === 'land' && e.v > 9) { SFX.land(); }
    else if (e.type === 'spring') { SFX.spring(); haptic('tap'); }
    else if (e.type === 'crumble') SFX.crumble();
    else if (e.type === 'letter') {
      SFX.letter(); haptic(); word();
      const el = $(`#hp-word i[data-k="${e.k}"]`, stage); if (el) el.classList.add('pop');
      if (W.got.every(Boolean)) setTimeout(() => { msg(`${LEVELS[cur].word[0]} ${LEVELS[cur].word[1]}!`, 1800); }, 250);
    } else if (e.type === 'checkpoint') { SFX.checkpoint(); haptic(); msg('Прапорець: якщо впадеш, почнеш звідси'); }
    else if (e.type === 'fall') { SFX.fall(); haptic('error'); msg(W.cpi >= 0 ? 'Плюх! Назад до прапорця' : 'Плюх! Ще раз'); }
    else if (e.type === 'goal') finish(W);
  }

  function finish(W) {
    state = 'end'; SFX.goal(); haptic('ok');
    const l = LEVELS[cur], t10 = Math.max(1, Math.round(W.t * 10)), all = W.got.every(Boolean), fast = W.t <= l.par, firstTime = !done(l.id);
    const before = (P().hop || {})[l.id];
    const record = !before || t10 < before;
    if (record) progress.set('hop', { ...(P().hop || {}), [l.id]: t10 });
    if (all) progress.mark('hopWord', l.id);
    if (fast) progress.mark('hopFast', l.id);
    const planted = all ? garden.plant(l.word[1]) : false;
    if (all) garden.water(l.word[1]);
    const got = W.got.filter(Boolean).length, n = W.got.length, st = 1 + (all ? 1 : 0) + (fast ? 1 : 0);
    const last = cur === LEVELS.length - 1;
    sound.prefetch([`${l.word[0]} ${l.word[1]}`]);
    $('#hp-endcard', stage).innerHTML = `
      <h2 id="hp-etitle">${last ? 'Пару знайдено!' : 'Рівень пройдено!'}</h2>
      ${last ? '<p class="note">Обидві шкарпетки знову разом. Тепер їх ніхто не розлучить. Ну, до наступного прання.</p>' : ''}
      <div class="hop-stars big" role="img" aria-label="${st} ${plural(st, 'зірка', 'зірки', 'зірок')} з 3">${[0, 1, 2].map((k) => STAR(k < st, k)).join('')}</div>
      <ul class="hop-goals">
        <li class="ok">Дійти до кінця</li>
        <li class="${all ? 'ok' : ''}">Усі літери (${got} з ${n})</li>
        <li class="${fast ? 'ok' : ''}">Швидше за ${fmtT(l.par)} <small>${fmtT(W.t)}${record && !firstTime ? ' · рекорд' : ''}</small></li>
      </ul>
      <div class="hop-wordcard"><button class="say" id="hp-say" type="button" aria-label="Послухати: ${l.word[0]} ${esc(l.word[1])}">${SPEAKER}</button>
        <span><b><span class="art ${l.word[0]}">${l.word[0]}</span> <span lang="de">${esc(l.word[1])}</span></b><small>${esc(l.uk)}</small></span></div>
      <p class="note small">${all ? (planted ? 'Слово посаджено в «Сад слів».' : 'Це слово вже росте в «Саду слів».') : `Збери всі ${n} літер, і слово виросте в «Саду слів».`}</p>
      ${last ? '' : `<button class="btn primary" id="hp-next" type="button">Далі: ${esc(LEVELS[cur + 1].name)}</button>`}
      <button class="btn${last ? ' primary' : ''}" id="hp-again" type="button">Ще раз</button>
      <button class="btn" id="hp-list" type="button">Усі рівні</button>`;
    clearTimeout(endTimer);
    endTimer = setTimeout(() => {
      $('#hp-end', stage).hidden = false; $('#hp-joy', stage).classList.remove('on');
      const f = $('#hp-next', stage) || $('#hp-again', stage); if (f) f.focus({ preventScroll: true });
      if (all) sound.say(`${l.word[0]} ${l.word[1]}`);
    }, reduce ? 200 : 1100);
  }

  /* entering, pausing, leaving */
  async function play(i) {
    if (!canPlay()) return;
    if (!ac) { try { const A = window.AudioContext || window.webkitAudioContext; if (A) ac = new A(); } catch (e) {} }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
    if (!stage) buildStage();
    stage.hidden = false; document.documentElement.classList.add('hop-on');
    const page = document.querySelector('.wrap'); if (page) page.inert = true;   // the keyboard and screen readers stay in the game
    try { if (tg) tg.disableVerticalSwipes(); } catch (e) {}
    try { history.pushState({ game: 'hop', fromHub: history.state && history.state.fromHub, hopLevel: i }, '', location.href); } catch (e) {}
    if (!eng) {
      $('#hp-load', stage).hidden = false;
      try {
        const mod = await import('./hop/engine.js?v=2');
        if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load('700 44px Unbounded'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
        eng = mod.createEngine($('#hp-cv', stage), { onEvent });
        window.__hop = { get engine() { return eng; }, LEVELS, begin, state: () => state };
      } catch (e) {
        closeStage(); toast(navigator.onLine === false ? 'Немає інтернету: гру треба один раз відкрити з інтернетом.' : 'Не вдалося запустити гру на цьому пристрої.', 4200);
        return;
      }
      $('#hp-load', stage).hidden = true;
    }
    eng.resize();
    begin(i);
  }
  function begin(i) {
    if (!eng || i < 0 || i >= LEVELS.length) return;
    cur = i; state = 'play'; lastSec = -1;
    clearTimeout(endTimer);
    $('#hp-end', stage).hidden = true; $('#hp-pausebox', stage).hidden = true;
    eng.stop(); eng.stick(0); eng.jump(false); keys.clear(); jumpers.clear(); joy.id = null;
    eng.load(LEVELS[i]);
    word(); $('#hp-time', stage).textContent = '0:00';
    try { history.replaceState({ ...(history.state || {}), hopLevel: i }, ''); } catch (e) {}
    if (i === 0 && !done(LEVELS[0].id)) showHint(); else $('#hp-hint', stage).hidden = true;
    msg(`${i + 1}. ${LEVELS[i].name}`, 1600);
    eng.start(); tick();
  }
  function pause() {
    if (state !== 'play') return;
    state = 'pause'; eng.stop(); eng.stick(0); eng.jump(false); keys.clear(); jumpers.clear(); joy.id = null;
    $('#hp-joy', stage).classList.remove('on');
    const W = eng.world, l = LEVELS[cur];
    $('#hp-pinfo', stage).textContent = `${cur + 1}. ${l.name} · ${fmtT(W.t)} · літер ${W.got.filter(Boolean).length} з ${W.got.length}`;
    paintSound(); paintFull(); $('#hp-pausebox', stage).hidden = false; $('#hp-resume', stage).focus({ preventScroll: true });
  }
  function resume() {
    if (state !== 'pause') return;
    $('#hp-pausebox', stage).hidden = true; state = 'play'; eng.start(); tick();
  }
  function leave() { if (history.state && history.state.hopLevel != null) history.back(); else closeStage(); }
  function closeStage() {
    if (!stage || stage.hidden) return;
    state = 'idle'; clearTimeout(endTimer);
    if (eng) { eng.stop(); eng.stick(0); eng.jump(false); }
    stage.hidden = true; document.documentElement.classList.remove('hop-on');
    const page = document.querySelector('.wrap'); if (page) page.inert = false;
    try { if (tg) tg.enableVerticalSwipes(); } catch (e) {}
    sound.stop(); renderList();
  }

  renderList();
  return {
    open() { renderList(); },
    close() { closeStage(); },
    busy: () => !!(stage && !stage.hidden),
    // Telegram's Back: during a level it pauses first; on the pause or the end screen it goes back to the levels
    back() {
      if (!stage || stage.hidden) return false;
      if (state === 'play') pause(); else leave();
      return true;
    },
    play, renderList,
  };
}
