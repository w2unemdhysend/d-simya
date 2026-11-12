// "Сад слів": every German noun becomes a plant. Watering is a short, calm review: words come back when they are due
// (1, 2, 4, 8, 16, 32 days), each right answer makes the plant grow; from the 4th step on it flowers in the colour of
// its article (der blue, die red, das green). Memory games plant words, the other games water them.
// Kept on the device and, packed small, in Telegram's cloud (its values hold 4 096 characters).
import { POOL, say as sayWord, INTERVAL, MAX_BOX } from './data/garten.js';
import { $, esc, load, store, cloudGet, cloudSet, haptic, shuffle, plural, today, SPEAKER, toast } from './kit.js';
import * as sound from '../audio/say.js';
import * as progress from './progress.js';

const KEY = 'dsimya-garten', BLOOM = 4, SESSION = 15;
const index = new Map(POOL.map((w, i) => [w.de, i]));
let G = {};   // index → [box, due day]
(function init() { const s = load(KEY); if (s && s.w) G = s.w; })();
const pack = () => Object.entries(G).map(([i, [b, d]]) => `${Number(i).toString(36)}.${b}.${d.toString(36)}`).join(';');
const unpack = (s) => Object.fromEntries(String(s || '').split(';').filter(Boolean).map((x) => { const [i, b, d] = x.split('.'); return [parseInt(i, 36), [Number(b), parseInt(d, 36)]]; }));
let cloudTimer = null;
function save() {
  store(KEY, { w: G });
  clearTimeout(cloudTimer); cloudTimer = setTimeout(() => cloudSet('garten', pack()), 1500);
  const c = counts(); progress.set('bloom', c.bloom); progress.set('planted', c.planted);
  listeners.forEach((f) => f());
}
const listeners = [];
export const onChange = (f) => listeners.push(f);
cloudGet('garten').then((s) => {
  if (typeof s !== 'string') return;
  let more = false;
  for (const [i, v] of Object.entries(unpack(s))) if (!G[i] || v[0] > G[i][0]) { G[i] = v; more = true; }
  if (more) save();
});

export function counts(day = today()) {
  const all = Object.values(G);
  return { planted: all.length, bloom: all.filter(([b]) => b >= BLOOM).length, thirsty: all.filter(([, d]) => d <= day).length, left: POOL.length - all.length };
}
export function status() {
  const c = counts();
  return c.planted ? `${c.bloom} ${plural(c.bloom, 'квітка', 'квітки', 'квітів')} · ${c.thirsty ? `${c.thirsty} ${plural(c.thirsty, 'хоче', 'хочуть', 'хочуть')} пити` : 'усі политі'}` : 'Посади перші слова';
}
// a word met in a game: planted if new (Memory), and if it is due today, watered (a right answer counts as a review)
export function plant(de) {
  const i = index.get(de); if (i === undefined || G[i]) return false;
  G[i] = [1, today() + 1]; save(); return true;
}
export function water(de) {
  const i = index.get(de), g = i === undefined ? null : G[i];
  if (!g || g[1] > today()) return false;
  grow(i, true); save(); return true;
}
function grow(i, ok) {
  const [b] = G[i], nb = ok ? Math.min(MAX_BOX, b + 1) : 1;
  G[i] = [nb, today() + INTERVAL[nb]];
}
// the next words to plant: those met in the articles game first (their order in the list), then the rest
function nextToPlant(n) { return POOL.map((w, i) => i).filter((i) => !G[i]).slice(0, n); }

// the biggest plants first, for the preview on the games menu
export function sample(n) {
  return Object.entries(G).map(([i, [b]]) => ({ b, art: POOL[i].art, de: POOL[i].de })).sort((a, z) => z.b - a.b).slice(0, n);
}

/* ---------------- drawing a plant ---------------- */
const PETAL = { der: 'var(--der)', die: 'var(--die)', das: 'var(--das)' };
export function plantSVG(box, art, dry) {
  const leaf = dry ? '#A39A6B' : '#4C9A4F', stem = dry ? '#8C8457' : '#3E7D41', h = [0, 14, 20, 26, 30, 32, 34][box] || 12;
  const top = 46 - h, tilt = dry ? ' transform="rotate(12 24 46)"' : '';
  let g = `<path d="M24 46V${top}" stroke="${stem}" stroke-width="2.4" stroke-linecap="round"/>`;
  g += `<path d="M24 ${46 - h * 0.35}c-6-1-9-5-9-9 5 0 8 3 9 9z" fill="${leaf}"/>`;
  if (box >= 2) g += `<path d="M24 ${46 - h * 0.55}c6-1 9-5 9-9-5 0-8 3-9 9z" fill="${leaf}"/>`;
  if (box >= 3) g += `<path d="M24 ${46 - h * 0.78}c-5-1-7-4-7-7 4 0 6 2 7 7z" fill="${leaf}"/>`;
  if (box === 3) g += `<circle cx="24" cy="${top}" r="3" fill="${leaf}"/>`;
  if (box >= BLOOM) {
    const r = box >= 6 ? 6.5 : box >= 5 ? 5.8 : 5, c = PETAL[art];
    for (let k = 0; k < 5; k++) { const a = (k * 72 - 90) * Math.PI / 180; g += `<circle cx="${(24 + Math.cos(a) * r).toFixed(1)}" cy="${(top + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.62).toFixed(1)}" fill="${c}"/>`; }
    g += `<circle cx="24" cy="${top}" r="${(r * 0.5).toFixed(1)}" fill="#F2C94C"/>`;
    if (box >= 6) g += `<path d="M37 12c2-3 5-3 5 0-2 1-4 1-5 0zm0 0c-2-3-5-3-5 0 2 1 4 1 5 0z" fill="#F2C94C"/>`;
  }
  return `<svg viewBox="0 0 48 56" aria-hidden="true"><ellipse cx="24" cy="48" rx="14" ry="4.5" fill="#8A6A4F" opacity=".55"/><g${tilt}>${g}</g></svg>`;
}

/* ---------------- the page ---------------- */
export function create(root) {
  root.innerHTML = `
    <div class="card gsum" id="g-sum"></div>
    <div class="card gplay" id="g-play" hidden>
      <div class="gprog"><span id="g-step"></span><button class="linkbtn" id="g-stop" type="button">Закінчити</button></div>
      <div class="gq" id="g-q" aria-live="polite"></div>
      <div class="gopts" id="g-opts" role="group" aria-label="Варіанти"></div>
      <div class="gfb" id="g-fb" hidden><p id="g-why"></p><button class="btn" id="g-next" type="button">Далі</button></div>
    </div>
    <div class="card gend" id="g-end" hidden></div>
    <h2 class="gh">Твій сад</h2>
    <div class="garden" id="g-bed"></div>
    <div class="gsheet" id="g-sheet" role="dialog" aria-modal="true" aria-labelledby="g-sheet-w" hidden>
      <div class="gsheet-in"><div class="gsheet-plant" id="g-sheet-plant"></div>
        <div><b id="g-sheet-w" lang="de"></b><span id="g-sheet-uk"></span><small id="g-sheet-when"></small></div>
        <button class="say" id="g-sheet-say" type="button" aria-label="Прослухати">${SPEAKER}</button></div>
      <button class="btn" id="g-sheet-close" type="button">Закрити</button>
    </div>`;
  let S = null, opener = null;
  const artHTML = (w) => `<span class="art ${w.art}">${w.art}</span> ${esc(w.de)}`;

  function renderSum() {
    const c = counts(), day = today();
    const thirsty = Object.entries(G).filter(([, [, d]]) => d <= day).length;
    $('#g-sum', root).innerHTML = `
      <div class="gstats"><span><b>${c.bloom}</b> ${plural(c.bloom, 'квітка цвіте', 'квітки цвітуть', 'квітів цвітуть')}</span><span><b>${c.planted - c.bloom}</b> ростуть</span><span><b>${thirsty}</b> ${plural(thirsty, 'хоче', 'хочуть', 'хочуть')} пити</span></div>
      ${thirsty ? `<button class="btn primary" id="g-water" type="button">💧 Полити ${thirsty} ${plural(thirsty, 'рослину', 'рослини', 'рослин')}</button>`
        : c.planted ? '<p class="note">Усі рослини политі. Наступні захочуть пити завтра або пізніше 🌙</p>' : '<p class="note">Сад поки порожній. Посади перші слова: кожне стане квіткою, якщо поливати його повтореннями.</p>'}
      ${c.left ? `<button class="btn" id="g-plant" type="button">🌱 Посадити 5 нових слів</button>` : ''}
      <p class="note small">Слова з «Пам’яті» садяться самі, а правильні відповіді в «Артиклях» поливають рослини.</p>`;
  }
  function renderBed() {
    const day = today(), list = Object.entries(G).map(([i, [b, d]]) => ({ i: Number(i), b, d, w: POOL[i] })).sort((a, z) => z.b - a.b || a.i - z.i);
    $('#g-bed', root).innerHTML = list.length ? list.map((p) => `<button class="gplant${p.d <= day ? ' thirsty' : ''}" type="button" data-i="${p.i}" aria-label="${esc(sayWord(p.w))}, ${p.d <= day ? 'хоче пити' : 'полита'}">${plantSVG(p.b, p.w.art, p.d < day - 2)}<span lang="de">${esc(p.w.de)}</span></button>`).join('')
      : '<p class="note">Тут виростуть твої слова.</p>';
  }
  function render() { renderSum(); renderBed(); }
  onChange(() => { if (!S) render(); });

  // one review: the German word → its meaning, or the meaning → the German word with the right article
  function ask() {
    const i = S.queue[S.at], w = POOL[i], reverse = Math.random() < 0.35;
    $('#g-step', root).textContent = `${S.at + 1} з ${S.queue.length}`;
    let opts;
    if (!reverse) {
      $('#g-q', root).innerHTML = `${w.emoji ? `<div class="gemoji">${w.emoji}</div>` : ''}<div class="gword" lang="de">${artHTML(w)}</div><button class="say" type="button" data-say aria-label="Прослухати">${SPEAKER}</button>`;
      const others = shuffle(POOL.filter((x) => x.uk !== w.uk)).slice(0, 3).map((x) => x.uk);
      opts = shuffle([w.uk, ...others]).map((t) => ({ t, ok: t === w.uk }));
      sound.say(sayWord(w));
    } else {
      $('#g-q', root).innerHTML = `${w.emoji ? `<div class="gemoji">${w.emoji}</div>` : ''}<div class="gword">${esc(w.uk)}</div><p class="note">Як це німецькою, з артиклем?</p>`;
      const wrongArt = ['der', 'die', 'das'].filter((a) => a !== w.art)[Math.floor(Math.random() * 2)];
      const others = shuffle(POOL.filter((x) => x.de !== w.de)).slice(0, 2).map((x) => `${x.art} ${x.de}`);
      opts = shuffle([`${w.art} ${w.de}`, `${wrongArt} ${w.de}`, ...others]).map((t) => ({ t, ok: t === `${w.art} ${w.de}`, de: true }));
    }
    $('#g-opts', root).innerHTML = opts.map((o, k) => `<button class="gopt" type="button" data-k="${k}" data-ok="${o.ok ? 1 : 0}"${o.de ? ' lang="de"' : ''}>${esc(o.t)}</button>`).join('');
    $('#g-fb', root).hidden = true;
    sound.prefetch([sayWord(w), ...S.queue.slice(S.at + 1, S.at + 3).map((j) => sayWord(POOL[j]))]);
  }
  function answer(btn) {
    if (S.locked) return;
    const i = S.queue[S.at], w = POOL[i], ok = btn.dataset.ok === '1';
    S.locked = true;
    root.querySelectorAll('.gopt').forEach((b) => { b.disabled = true; if (b.dataset.ok === '1') b.classList.add('right'); });
    if (ok) {
      grow(i, true); S.right++; haptic('ok'); btn.classList.add('right');
      sound.say(sayWord(w));
      setTimeout(next, 1000);
    } else {
      grow(i, false); haptic('error'); btn.classList.add('wrong');
      $('#g-why', root).innerHTML = `<span lang="de">${artHTML(w)}</span> — ${esc(w.uk)}. Рослина почне рости знову, слово повернеться завтра.`;
      $('#g-fb', root).hidden = false; $('#g-next', root).focus({ preventScroll: true });
    }
    save();
  }
  function next() {
    S.locked = false; S.at++;
    if (S.at < S.queue.length) return ask();
    const done = S; S = null;
    $('#g-play', root).hidden = true; $('#g-end', root).hidden = false;
    $('#g-end', root).innerHTML = `<h2>Сад полито 💧</h2><p class="note">Правильно ${done.right} з ${done.queue.length}. Слова, які ти знаєш, тепер відпочинуть кілька днів.</p><button class="btn primary" id="g-back" type="button">До саду</button>`;
    render();
  }
  function startWater() {
    const day = today();
    const queue = shuffle(Object.entries(G).filter(([, [, d]]) => d <= day).map(([i]) => Number(i))).slice(0, SESSION);
    if (!queue.length) return;
    S = { queue, at: 0, right: 0, locked: false };
    $('#g-sum', root).hidden = true; $('#g-end', root).hidden = true; $('#g-play', root).hidden = false;
    ask(); haptic();
  }
  function stopWater() { S = null; $('#g-play', root).hidden = true; $('#g-sum', root).hidden = false; render(); }

  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('#g-water')) return startWater();
    if (t.closest('#g-plant')) {
      const n = nextToPlant(5); n.forEach((i) => { G[i] = [1, today()]; }); save(); haptic('ok');
      toast(`Посаджено ${n.length} ${plural(n.length, 'слово', 'слова', 'слів')}. Полий їх, щоб познайомитися.`);
      return;
    }
    if (t.closest('#g-stop')) return stopWater();
    if (t.closest('#g-back')) { $('#g-end', root).hidden = true; $('#g-sum', root).hidden = false; return render(); }
    if (t.closest('#g-next')) return next();
    const opt = t.closest('.gopt'); if (opt) return answer(opt);
    if (t.closest('[data-say]') && S) return sound.say(sayWord(POOL[S.queue[S.at]]));
    const pl = t.closest('.gplant');
    if (pl) {
      const i = Number(pl.dataset.i), w = POOL[i], [b, d] = G[i], left = d - today();
      $('#g-sheet-plant', root).innerHTML = plantSVG(b, w.art, false);
      $('#g-sheet-w', root).innerHTML = artHTML(w); $('#g-sheet-uk', root).textContent = w.uk;
      $('#g-sheet-when', root).textContent = left <= 0 ? 'Хоче пити сьогодні' : left === 1 ? 'Поливати завтра' : `Поливати через ${left} ${plural(left, 'день', 'дні', 'днів')}`;
      $('#g-sheet', root).dataset.i = i; $('#g-sheet', root).hidden = false; opener = pl; $('#g-sheet-close', root).focus();
      sound.say(sayWord(w)); return;
    }
    if (t.closest('#g-sheet-say')) return sound.say(sayWord(POOL[Number($('#g-sheet', root).dataset.i)]));
    if (t.closest('#g-sheet-close') || t === $('#g-sheet', root)) { $('#g-sheet', root).hidden = true; if (opener) opener.focus(); }
  });
  render();
  return {
    open() { if (!S) render(); },
    close() { if (S) stopWater(); $('#g-sheet', root).hidden = true; },
    busy: () => !!S,
  };
}
