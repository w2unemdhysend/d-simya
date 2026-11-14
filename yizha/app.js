// «Харчування»: the diary of what was eaten, the day's calories against the target, weight and its trend, partners,
// own foods and dishes, barcodes. Records: yizha/store.js; numbers: yizha/calc.js; foods: yizha/foods.js (BLS 4.0) and
// Open Food Facts (yizha/off.js); barcodes: yizha/scan.js.
import { esc, API } from '../assets/site.js';
import { berlinDay } from '../smittia/due.js';
import { FOODS, CATS } from './foods.js';
import * as db from './store.js';
import { ACT, PACES, MEALS, valid, target, macros, portion, sum, trend, rate, eta, bmi, bmiText, dayNum, dayOf } from './calc.js';
import { byBarcode, search as offSearch } from './off.js';
import { validCode } from './scan.js';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const tgApp = window.Telegram && window.Telegram.WebApp;
const tg = tgApp && tgApp.platform && tgApp.platform !== 'unknown' ? tgApp : null;
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
const haptic = (k) => { try { if (!tg || !tg.HapticFeedback) return; if (k === 'light') tg.HapticFeedback.impactOccurred('light'); else if (k) tg.HapticFeedback.notificationOccurred(k); else tg.HapticFeedback.selectionChanged(); } catch (e) { /* no haptics */ } };
const pr = new Intl.PluralRules('uk-UA');
const plural = (n, one, few, many) => ({ one, few, many }[pr.select(n)] || many);
const fmt = (n, d = 0) => Number(n || 0).toLocaleString('uk-UA', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt1 = (n) => Number(n || 0).toLocaleString('uk-UA', { maximumFractionDigits: 1 });
const parseNum = (s) => { const n = Number(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
const today = () => berlinDay(new Date());
const year = () => Number(today().slice(0, 4));
const dayLabel = (day) => {
  const t = today();
  if (day === t) return 'Сьогодні';
  if (day === dayOf(dayNum(t) - 1)) return 'Учора';
  return new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
};
const monthYear = (day) => new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortDate = (day) => new Date(day + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const SVG = (d, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
const I = {
  plus: SVG('<path d="M12 5v14M5 12h14"/>'), prev: SVG('<path d="M15 6l-6 6 6 6"/>'), next: SVG('<path d="M9 6l6 6-6 6"/>'),
  scan: SVG('<path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"/><path d="M7.5 8v8M10 8v8M12.5 8v8M15.5 8v8"/>'),
  camera: SVG('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>'),
  x: SVG('<path d="M6 6l12 12M18 6L6 18"/>'), again: SVG('<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>'),
};
const UNKNOWN = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7v.3"/><path d="M12 16.6h.01"/></svg>';
const iconHTML = (ic, big = false) => (ic && /^https:\/\//.test(ic)
  ? `<span class="fi${big ? ' big' : ''}"><img src="${esc(ic)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>`
  : ic ? `<span class="fi${big ? ' big' : ''}" aria-hidden="true">${esc(ic)}</span>` : `<span class="fi unknown${big ? ' big' : ''}" title="невідомо">${UNKNOWN}</span>`);
// a product photo that cannot load (offline, removed): «невідомо» instead of a broken picture
document.addEventListener('error', (e) => { const img = e.target; if (img && img.tagName === 'IMG' && img.parentNode && img.parentNode.classList.contains('fi')) { img.parentNode.classList.add('unknown'); img.parentNode.innerHTML = UNKNOWN; } }, true);
const unitOf = (food) => (food.l ? 'мл' : 'г');

/* ---------- foods ---------- */
const BUILT = FOODS.map(([id, n, de, ic, cat, kcal, p, f, c, por, al, fl]) => ({ id, n, de, ic, cat, kcal, p, f, c, por, al, l: fl === 'l', src: id.startsWith('ua-') ? 'dish' : 'bls' }));
const BYID = new Map(BUILT.map((x) => [x.id, x]));
const CAT = new Map(CATS.map((c) => [c.id, c]));
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'ʼ`]/g, '').replace(/ß/g, 'ss');
const words = (s) => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const mine = () => db.all('f').map((v) => ({ ...v, src: v.src || 'my', por: v.por || [] }));
const dishes = () => db.all('r').map((v) => ({ ...v, src: 'recipe', ic: v.ic || '🍲', por: v.por || [] }));
function foodById(id) {
  if (BYID.has(id)) return BYID.get(id);
  const f = db.get('f', id); if (f) return { id, ...f, src: f.src || 'my', por: f.por || [] };
  const r = db.get('r', id); if (r) return { id, ...r, src: 'recipe', ic: r.ic || '🍲', por: r.por || [] };
  return null;
}
// what was eaten before: per food how often, when last, how much last time
let usageCache = null;
db.on(() => { usageCache = null; });
function usage() {
  if (usageCache) return usageCache;
  const u = new Map();
  for (const e of db.all('e')) {
    const x = u.get(e.fid) || { n: 0, at: 0, g: 0, e: null };
    x.n++; if ((e.at || 0) >= x.at) { x.at = e.at || 0; x.g = e.g; x.e = e; }
    u.set(e.fid, x);
  }
  return (usageCache = u);
}
const fromEntry = (e) => ({ id: e.fid, n: e.n, brand: e.b || '', ic: e.ic || '', kcal: e.kcal, p: e.p, f: e.f, c: e.c, l: !!e.l, por: [], src: 'past' });
function findLocal(q, limit = 40) {
  const qw = words(q); if (!qw.length) return [];
  const qn = norm(q).trim(), u = usage(), out = [];
  for (const food of [...dishes(), ...mine(), ...BUILT]) {
    const name = norm(food.n), ws = words([food.n, food.de, food.al, food.brand].join(' '));
    if (!qw.every((t) => ws.some((w) => w.startsWith(t)) || (t.length >= 4 && name.includes(t)))) continue;
    let score = name.startsWith(qn) ? 60 : words(food.n)[0] && words(food.n)[0].startsWith(qw[0]) ? 30 : words(food.n).some((w) => w.startsWith(qw[0])) ? 15 : 0;
    const x = u.get(food.id); if (x) score += Math.min(40, x.n * 5);
    if (food.src !== 'bls' && food.src !== 'dish') score += 5;
    score -= name.length / 40;
    out.push([score, food]);
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}

/* ---------- the profile and the day ---------- */
const profile = () => { const p = db.get('p', 'me'); return valid(p) ? p : null; };
const weights = () => db.all('w').map((w) => ({ day: w.id, kg: Number(w.kg) })).filter((w) => w.kg > 0).sort((a, b) => (a.day < b.day ? -1 : 1));
function currentKg(p) { const w = weights(); return w.length ? w[w.length - 1].kg : p.start.kg; }
const entriesOf = (day) => db.all('e', day + '~').sort((a, b) => (a.at || 0) - (b.at || 0));
const movesOf = (day) => db.all('x', day + '~');
function targetNow(p) { return target(p, currentKg(p), year()); }
const amountText = (e) => (e.pq && e.pn ? `${fmt1(e.pq)} × ${e.pn} · ` : '') + `${fmt(e.g)} ${e.l ? 'мл' : 'г'}`;

/* ---------- state ---------- */
const st = { tab: 'day', day: today(), setup: false };
{ const t = new URLSearchParams(location.search).get('tab'); if (['day', 'progress', 'foods'].includes(t)) st.tab = t; }

/* ---------- setup: who, the goal, how fast ---------- */
let draft = null;
function setupDraft(edit) {
  const p = profile(), last = p ? currentKg(p) : null;
  return p && edit ? { ...p, kgNow: last, edit: true } : { sex: '', born: '', cm: '', kgNow: '', goal: '', act: 2, pace: 0.5, kcal: null, edit: false };
}
function draftProfile(d) {
  const kg = parseNum(d.kgNow);
  return { sex: d.sex, born: Math.round(parseNum(d.born)), cm: Math.round(parseNum(d.cm)), start: d.edit ? d.start : { kg, day: today() }, goal: parseNum(d.goal), act: d.act, pace: d.pace, kcal: d.kcal ? Math.round(parseNum(d.kcal)) : null };
}
function renderSetup() {
  const d = draft, v = $('#view-setup');
  const seg = (name, val, opts) => `<div class="seg${opts.length === 3 ? ' three' : ''}" role="radiogroup" data-seg="${name}">${opts.map(([k, b, s]) => `<button type="button" role="radio" aria-checked="${String(val) === String(k)}" data-v="${k}"><b>${b}</b>${s ? `<small>${s}</small>` : ''}</button>`).join('')}</div>`;
  v.innerHTML = `<div class="setup">
    <section class="card">
      <h2>${d.edit ? 'Твої дані й мета' : 'Почнімо з тебе'}</h2>
      <p class="note">${d.edit ? 'Зміни, що треба: норма перерахується одразу.' : 'З цього застосунок порахує, скільки калорій на день можна, щоб вага йшла вниз спокійно і без шкоди.'}</p>
      ${seg('sex', d.sex, [['f', 'Жінка'], ['m', 'Чоловік']])}
      <div class="grid2">
        <label class="field"><span>Рік народження</span><input id="s-born" inputmode="numeric" maxlength="4" placeholder="1970" value="${esc(d.born || '')}"></label>
        <label class="field"><span>Зріст, см</span><input id="s-cm" inputmode="numeric" maxlength="3" placeholder="165" value="${esc(d.cm || '')}"></label>
        <label class="field"><span>${d.edit ? 'Вага зараз, кг' : 'Вага зараз, кг'}</span><input id="s-kg" inputmode="decimal" placeholder="80" value="${esc(d.kgNow ? fmt1(d.kgNow) : '')}"${d.edit ? ' disabled' : ''}></label>
        <label class="field"><span>Бажана вага, кг</span><input id="s-goal" inputmode="decimal" placeholder="68" value="${esc(d.goal ? fmt1(d.goal) : '')}"></label>
      </div>
      ${d.edit ? '<p class="note small">Вагу записуй у «Прогресі»: тут лише дані для розрахунку.</p>' : ''}
    </section>
    <section class="card">
      <h2>Скільки руху в звичайний день</h2>
      <div class="opts" role="radiogroup" data-opts="act">${ACT.map((a) => `<button type="button" class="opt" role="radio" aria-checked="${d.act === a.id}" data-v="${a.id}"><i></i><span><b>${a.uk}</b><small>${a.note}</small></span></button>`).join('')}</div>
      <h2>Як швидко худнути</h2>
      ${seg('pace', d.pace, PACES.map((x) => [x.kg, x.uk, x.note]))}
      <p class="note small">Повільніше легше втримати: м’язи лишаються, вага не повертається.</p>
      ${d.edit ? `<label class="field"><span>Своя норма, ккал (необов’язково)</span><input id="s-kcal" inputmode="numeric" maxlength="4" placeholder="як рахує застосунок" value="${esc(d.kcal || '')}"></label>` : ''}
    </section>
    <div class="preview" id="s-prev"></div>
    <p class="err" id="s-err" hidden></p>
    <button class="btn primary" id="s-save" type="button">${d.edit ? 'Зберегти' : 'Почати'}</button>
    ${d.edit ? '<button class="btn" id="s-cancel" type="button">Скасувати</button>' : ''}
  </div>`;
  previewSetup();
}
function readSetup() {
  const d = draft;
  d.born = $('#s-born').value; d.cm = $('#s-cm').value; if (!d.edit) d.kgNow = $('#s-kg').value; d.goal = $('#s-goal').value;
  if ($('#s-kcal')) d.kcal = $('#s-kcal').value;
}
function setupProblem(d) {
  const p = draftProfile(d), kg = d.edit ? d.kgNow : parseNum(d.kgNow);
  if (!d.sex) return 'Вибери: жінка чи чоловік (від цього залежить розрахунок).';
  if (!(p.born >= 1920 && p.born <= year() - 14)) return 'Рік народження: чотири цифри, наприклад 1970.';
  if (!(p.cm >= 120 && p.cm <= 230)) return 'Зріст у сантиметрах, наприклад 165.';
  if (!(kg >= 30 && kg <= 300)) return 'Вага зараз у кілограмах, наприклад 82,5.';
  if (!(p.goal >= 30 && p.goal <= 300)) return 'Бажана вага в кілограмах.';
  if (p.goal > kg) return 'Бажана вага більша за теперішню: цей розділ для схуднення. Постав мету нижче або рівну.';
  if (bmi(p.goal, p.cm) < 18.5) return `Мета ${fmt1(p.goal)} кг замала для зросту ${p.cm} см (індекс маси тіла нижче 18,5). Постав мету не нижче ${fmt1(Math.ceil(18.5 * (p.cm / 100) ** 2))} кг.`;
  if (d.kcal && !(parseNum(d.kcal) >= 800 && parseNum(d.kcal) <= 5000)) return 'Своя норма: від 800 до 5000 ккал, або залиш поле порожнім.';
  return '';
}
function previewSetup() {
  const d = draft, box = $('#s-prev'), problem = setupProblem(d);
  if (problem) { box.className = 'preview warn'; box.innerHTML = `<p>${esc(problem)}</p>`; return; }
  const p = draftProfile(d), kg = d.edit ? d.kgNow : parseNum(d.kgNow), t = target(p, kg, year());
  const when = eta(kg, p.goal, -Math.min(p.pace, (t.deficit * 7) / 7700) || -p.pace, today());
  box.className = 'preview';
  box.innerHTML = `<p>Норма на день</p><b>${fmt(t.kcal)} ккал</b>
    <p>Організм витрачає близько ${fmt(t.need)} ккал на день${t.deficit ? `, тож дефіцит ${fmt(t.deficit)} ккал` : ''}.${t.floored ? ` Менше ${p.sex === 'm' ? '1500' : '1200'} ккал не ставимо: це вже дієта під наглядом лікаря.` : ''}</p>
    ${when && when !== today() ? `<p>У такому темпі ${fmt1(p.goal)} кг приблизно в ${esc(monthYear(when))}.</p>` : ''}`;
}
function saveSetup() {
  readSetup();
  const d = draft, problem = setupProblem(d);
  if (problem) { $('#s-err').textContent = problem; $('#s-err').hidden = false; haptic('error'); return; }
  const p = draftProfile(d);
  db.put('p', 'me', p);
  if (!d.edit) db.put('w', today(), { kg: p.start.kg });
  draft = null; st.setup = false; haptic('success');
  showMain(true);
}

/* ---------- the day ---------- */
function renderDay() {
  const p = profile(); if (!p) return;
  const v = $('#view-day'), day = st.day, list = entriesOf(day), t = targetNow(p), tot = sum(list), m = macros(t.kcal);
  const left = t.kcal - tot.kcal, over = left < 0, R = 56, C = 2 * Math.PI * R, frac = Math.min(1, tot.kcal / t.kcal);
  const moves = movesOf(day), burnt = moves.reduce((a, x) => a + (Number(x.kcal) || 0), 0);
  const bar = (name, val, goal, c) => `<div class="macro"><small>${name}</small><b class="num">${fmt(val)} / ${fmt(goal)} г</b><div class="bar"><i style="width:${Math.min(100, Math.round((val / goal) * 100))}%;--c:var(${c})"></i></div></div>`;
  const yesterday = dayOf(dayNum(day) - 1), prev = entriesOf(yesterday);
  v.innerHTML = `
    <div class="daynav"><button class="iconbtn" type="button" data-day="-1" aria-label="Попередній день">${I.prev}</button><b>${esc(dayLabel(day))}</b><button class="iconbtn" type="button" data-day="1" aria-label="Наступний день"${day >= today() ? ' disabled' : ''}>${I.next}</button></div>
    <section class="card" aria-label="Підсумок дня">
      <div class="sum">
        <div class="ring${over ? ' over' : ''}" role="img" aria-label="${over ? `На ${fmt(-left)} ккал понад норму` : `Залишилось ${fmt(left)} ккал з ${fmt(t.kcal)}`}">
          <svg viewBox="0 0 132 132"><circle class="bg" cx="66" cy="66" r="${R}"/><circle class="fg" cx="66" cy="66" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/></svg>
          <div class="mid"><b class="num">${over ? '+' + fmt(-left) : fmt(left)}</b><small>${over ? 'понад норму' : 'ккал залишилось'}</small></div>
        </div>
        <div class="facts">
          <div><span>Норма</span><b class="num">${fmt(t.kcal)}</b></div>
          <div><span>З’їдено</span><b class="num">${fmt(tot.kcal)}</b></div>
          ${burnt ? `<div><span>Рух</span><b class="num">${fmt(burnt)}</b></div>` : ''}
          ${t.reached ? '<div><span class="badge ok">Мети досягнуто</span></div>' : ''}
        </div>
      </div>
      <div class="macros">${bar('Білки', tot.p, m.p, '--prot')}${bar('Жири', tot.f, m.f, '--fat')}${bar('Вуглеводи', tot.c, m.c, '--carb')}</div>
    </section>
    <p class="sync" id="sync"></p>
    ${MEALS.map((meal) => {
      const es = list.filter((e) => e.meal === meal.id), k = sum(es).kcal, pe = prev.filter((e) => e.meal === meal.id);
      return `<section class="card meal" aria-labelledby="h-${meal.id}">
        <div class="hrow"><h2 id="h-${meal.id}"><span aria-hidden="true">${meal.icon}</span>${meal.uk}${es.length ? `<span class="num">${fmt(k)} ккал</span>` : ''}</h2>
        <button class="plus" type="button" data-add="${meal.id}" aria-label="Додати: ${meal.uk}">${I.plus}</button></div>
        ${es.length ? `<ul class="entries">${es.map((e) => `<li><button class="entry" type="button" data-entry="${esc(e.id)}">${iconHTML(e.ic)}<span class="t"><b>${esc(e.n)}</b><small>${esc(amountText(e))}</small></span><span class="k num">${fmt(portion(e, e.g).kcal)}</span></button></li>`).join('')}</ul>`
          : pe.length ? `<button class="again" type="button" data-again="${meal.id}">${I.again}<span>Як учора: ${esc(pe.slice(0, 3).map((e) => e.n).join(', '))}${pe.length > 3 ? '…' : ''} · ${fmt(sum(pe).kcal)} ккал</span></button>` : '<p class="empty">Ще нічого. Натисни +, щоб додати.</p>'}
      </section>`;
    }).join('')}`;
  paintSync();
}
function paintSync() {
  const el = $('#sync'); if (!el) return;
  const m = db.status.mode, n = db.pending();
  el.className = 'sync ' + m;
  el.textContent = m === 'local' ? 'Записи зберігаються на цьому пристрої. У Telegram вони ще й синхронізуються.'
    : m === 'ok' && !n ? 'Збережено й синхронізовано'
    : m === 'off' ? 'Немає зв’язку: збережено на телефоні, надішлю пізніше'
    : m === 'denied' ? 'Синхронізація лише для родини: записи на цьому пристрої'
    : m === 'err' ? 'Сервер не відповідає: збережено на телефоні, спробую ще'
    : 'Синхронізую…';
}

/* ---------- progress ---------- */
let range = 30;
function renderProgress() {
  const p = profile(); if (!p) return;
  const v = $('#view-progress'), ws = weights(), tr = trend(ws), kgNow = currentKg(p), t = targetNow(p), r = rate(ws, today());
  const todayW = ws.find((w) => w.day === today()), last = ws[ws.length - 1];
  const lost = p.start.kg - (tr.length ? tr[tr.length - 1].trend : kgNow);
  const toGo = Math.max(0, kgNow - p.goal), when = eta(kgNow, p.goal, r != null ? r : -p.pace, today());
  const share = p.start.kg > p.goal ? Math.max(0, Math.min(100, Math.round(((p.start.kg - kgNow) / (p.start.kg - p.goal)) * 100))) : 100;
  v.innerHTML = `
    <section class="card" aria-labelledby="h-w">
      <div class="hrow"><h2 id="h-w">Вага</h2>${todayW ? '<span class="badge ok">Сьогодні записано</span>' : ''}</div>
      <div class="stepper" style="margin-top:12px"><button type="button" data-wstep="-1" aria-label="Мінус 100 грамів">−</button><input id="wkg" inputmode="decimal" aria-label="Вага, кг" value="${fmt1(todayW ? todayW.kg : last ? last.kg : p.start.kg)}"><span class="unit">кг</span><button type="button" data-wstep="1" aria-label="Плюс 100 грамів">+</button></div>
      <button class="btn primary" id="wsave" type="button" style="margin-top:10px">${todayW ? 'Оновити сьогоднішню' : 'Записати на сьогодні'}</button>
      <p class="note small">Зважуйся зранку, до сніданку, раз на день чи кілька разів на тиждень. Графік показує тенденцію: окремі дні стрибають через воду й сіль.</p>
    </section>
    <section class="card" aria-labelledby="h-ch">
      <div class="hrow"><h2 id="h-ch">Як іде</h2><div class="chips" style="margin:0" role="radiogroup" aria-label="Період">${[[30, 'Місяць'], [90, '3 міс.'], [0, 'Усе']].map(([d, l]) => `<button class="chip" type="button" role="radio" aria-checked="${range === d}" data-range="${d}" style="min-height:36px;padding:0 10px;font-size:13.5px">${l}</button>`).join('')}</div></div>
      ${weightChart(tr, p)}
      <div class="stats">
        <div class="stat"><small>Від старту (${esc(shortDate(p.start.day))})</small><b class="num">${lost >= 0.05 ? '−' + fmt1(lost) : lost <= -0.05 ? '+' + fmt1(-lost) : '0'} кг</b></div>
        <div class="stat"><small>Темп за 4 тижні</small><b class="num">${r == null ? '—' : (r <= 0 ? '−' : '+') + fmt1(Math.abs(r)) + ' кг/тижд.'}</b></div>
        <div class="stat"><small>До мети ${fmt1(p.goal)} кг</small><b class="num">${toGo > 0 ? fmt1(toGo) + ' кг' : 'досягнуто!'}</b></div>
        <div class="stat"><small>${r == null ? 'За планом' : 'У такому темпі'}</small><b>${when ? (when === today() ? 'вже' : esc(monthYear(when))) : '—'}</b></div>
      </div>
      <div class="bar" style="margin-top:12px;height:10px" role="img" aria-label="Пройдено ${share} % шляху до мети"><i style="width:${share}%"></i></div>
      <p class="note small">Пройдено ${share} % шляху до мети.${r != null && r > 0.1 ? ' Вага останнім часом росте: подивись на тижневий графік калорій нижче.' : ''}</p>
    </section>
    <section class="card" aria-labelledby="h-wk">
      <h2 id="h-wk">Тиждень</h2>
      ${weekChart(t.kcal)}
    </section>
    <section class="card" aria-labelledby="h-b" id="buddies"></section>
    <section class="card" aria-labelledby="h-g">
      <div class="hrow"><h2 id="h-g">Мета й норма</h2><button class="linkbtn" type="button" id="editgoal">Змінити</button></div>
      <div class="facts" style="margin-top:8px">
        <div><span>Норма на день</span><b class="num">${fmt(t.kcal)} ккал${t.own ? ' (своя)' : ''}</b></div>
        <div><span>Організм витрачає</span><b class="num">≈ ${fmt(t.need)} ккал</b></div>
        <div><span>Білки · жири · вуглеводи</span><b class="num">${(() => { const m = macros(t.kcal); return `${m.p} · ${m.f} · ${m.c} г`; })()}</b></div>
        <div><span>Мета</span><b class="num">${fmt1(p.goal)} кг, ${PACES.find((x) => x.kg === p.pace).uk.toLowerCase()}</b></div>
        <div><span>Індекс маси тіла</span><b class="num">${fmt1(bmi(kgNow, p.cm))} · ${bmiText(bmi(kgNow, p.cm))}</b></div>
      </div>
      ${t.floored ? `<p class="note small">Норма не опускається нижче ${p.sex === 'm' ? '1500' : '1200'} ккал: менше варто їсти лише під наглядом лікаря.</p>` : ''}
    </section>
    <section class="card" aria-labelledby="h-r" id="reminders"></section>`;
  renderBuddies(); renderReminders();
}
function weightChart(tr, p) {
  if (tr.length < 2) return '<p class="note">Графік з’явиться після другого зважування.</p>';
  const from = range ? dayNum(today()) - range : dayNum(tr[0].day), pts = tr.filter((x) => dayNum(x.day) >= from);
  if (pts.length < 2) return '<p class="note">За цей період мало зважувань. Вибери довший період.</p>';
  const W = 320, H = 160, L = 34, B = 20, x0 = dayNum(pts[0].day), x1 = Math.max(dayNum(pts[pts.length - 1].day), x0 + 1);
  const ys = pts.flatMap((x) => [x.kg, x.trend]).concat(p.goal >= Math.min(...pts.map((x) => x.kg)) - 3 ? [p.goal] : []);
  let lo = Math.floor(Math.min(...ys) - 0.5), hi = Math.ceil(Math.max(...ys) + 0.5); if (hi - lo < 3) hi = lo + 3;
  const X = (d) => L + ((dayNum(d) - x0) / (x1 - x0)) * (W - L - 6), Y = (kg) => 8 + (1 - (kg - lo) / (hi - lo)) * (H - B - 8);
  const step = Math.max(1, Math.round((hi - lo) / 4)), grid = [];
  for (let k = lo; k <= hi; k += step) grid.push(`<line class="grid" x1="${L}" x2="${W}" y1="${Y(k).toFixed(1)}" y2="${Y(k).toFixed(1)}"/><text class="lbl" x="${L - 6}" y="${(Y(k) + 4).toFixed(1)}" text-anchor="end">${k}</text>`);
  const goal = p.goal >= lo && p.goal <= hi ? `<line class="goal" x1="${L}" x2="${W}" y1="${Y(p.goal).toFixed(1)}" y2="${Y(p.goal).toFixed(1)}"/><text class="lbl" x="${W}" y="${(Y(p.goal) - 4).toFixed(1)}" text-anchor="end">мета</text>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Графік ваги: від ${fmt1(pts[0].kg)} до ${fmt1(pts[pts.length - 1].kg)} кг">${grid.join('')}${goal}
    ${pts.map((x) => `<circle class="pt" cx="${X(x.day).toFixed(1)}" cy="${Y(x.kg).toFixed(1)}" r="3"/>`).join('')}
    <polyline class="tr" points="${pts.map((x) => `${X(x.day).toFixed(1)},${Y(x.trend).toFixed(1)}`).join(' ')}"/>
    <text class="lbl" x="${L}" y="${H - 4}">${esc(shortDate(pts[0].day))}</text><text class="lbl" x="${W}" y="${H - 4}" text-anchor="end">${esc(shortDate(pts[pts.length - 1].day))}</text></svg>
    <p class="note small">Точки — зважування, лінія — тенденція.</p>`;
}
function weekChart(tgt) {
  const n = dayNum(today()), days = [];
  for (let i = 6; i >= 0; i--) { const d = dayOf(n - i), es = entriesOf(d); days.push({ d, k: sum(es).kcal, n: es.length }); }
  const W = 320, H = 140, B = 22, top = Math.max(tgt * 1.3, ...days.map((x) => x.k)), bw = 30, gap = (W - 7 * bw) / 6;
  const Y = (k) => 6 + (1 - k / top) * (H - B - 6);
  const logged = days.filter((x) => x.n), inT = logged.filter((x) => x.k <= tgt * 1.05).length;
  const avg = logged.length ? Math.round(logged.reduce((a, x) => a + x.k, 0) / logged.length) : 0;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Калорії за 7 днів">${days.map((x, i) => {
    const xx = i * (bw + gap), h = x.n ? Math.max(3, H - B - Y(x.k)) : 3, wd = new Date(x.d + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'short', timeZone: 'UTC' });
    return `<rect class="bar${!x.n ? ' none' : x.k > tgt * 1.05 ? ' over' : ''}" x="${xx.toFixed(1)}" y="${(H - B - h).toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="5"/><text class="lbl" x="${(xx + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(wd)}</text>`;
  }).join('')}<line class="tline" x1="0" x2="${W}" y1="${Y(tgt).toFixed(1)}" y2="${Y(tgt).toFixed(1)}"/></svg>
  <p class="note small">${logged.length ? `Записано ${logged.length} ${plural(logged.length, 'день', 'дні', 'днів')} з 7, у нормі ${inT}. У середньому ${fmt(avg)} ккал на день при нормі ${fmt(tgt)}.` : 'Цього тижня ще нічого не записано.'} Пунктир — норма.</p>`;
}

/* partners: «Разом» */
const BKEY = 'yizha-buddies';
let buddyCode = '', buddyBusy = false;
function renderBuddies() {
  const box = $('#buddies'); if (!box) return;
  if (!db.synced()) { box.innerHTML = '<h2 id="h-b">Разом</h2><p class="note">Худнути вдвох легше. Відкрий «Харчування» через бота в Telegram, щоб бачити прогрес одне одного.</p>'; return; }
  let list = []; try { list = JSON.parse(localStorage.getItem(BKEY)) || []; } catch (e) { /* none yet */ }
  box.innerHTML = `<h2 id="h-b">Разом</h2>
    ${list.length ? list.map((b) => `<div class="buddy"><span class="av" aria-hidden="true">${esc((b.name || '?').slice(0, 1))}</span><span class="t"><b>${esc(b.name)}</b>
      <small>${b.lost == null ? 'Ще не записує вагу' : b.lost > 0 ? `−${fmt1(b.lost)} кг від старту${b.toGo != null ? ` · ${b.toGo} % шляху` : ''}` : 'Вага поки без змін'}</small>
      <small>Цього тижня: ${b.logged} ${plural(b.logged, 'день записаний', 'дні записані', 'днів записано')}${b.inTarget != null && b.logged ? `, у нормі ${b.inTarget}` : ''} · ${b.workouts} ${plural(b.workouts, 'тренування', 'тренування', 'тренувань')}</small></span>
      <button class="iconbtn" type="button" data-unbuddy="${b.id}" aria-label="Більше не ділитися з: ${esc(b.name)}">${I.x}</button></div>`).join('')
    : '<p class="note">Запроси когось із родини — і ви бачитимете прогрес одне одного: скільки скинуто, скільки днів у нормі, тренування. Що саме ти їв(ла) і твою вагу не бачить ніхто.</p>'}
    <div class="btns" style="margin-top:12px"><button class="btn soft" type="button" id="b-invite">Запросити</button><button class="btn soft" type="button" id="b-have" aria-expanded="false">Маю код</button></div>
    <div class="code" id="b-codebox"${buddyCode ? '' : ' hidden'}><div class="big">${esc(buddyCode.slice(0, 3) + ' ' + buddyCode.slice(3))}</div><p>Код діє 24 години. Хай людина відкриє «Харчування» в боті → «Прогрес» → «Маю код».</p><button class="btn primary" type="button" id="b-send">Надіслати в Telegram</button></div>
    <form class="joinrow" id="b-join" hidden><input id="b-code" maxlength="7" autocomplete="off" placeholder="ABC123" aria-label="Код партнера"><button class="btn primary" type="submit">Додати</button></form>
    <p class="err" id="b-err" hidden></p>`;
}
let buddiesAt = 0, buddyAgain = false;
async function loadBuddies(force) {
  if (!db.synced()) return;
  if (buddyBusy) { buddyAgain = buddyAgain || !!force; return; }   // a join while the list was loading: load once more after
  if (!force && Date.now() - buddiesAt < 60000) return;
  buddyBusy = true; buddiesAt = Date.now();
  try { const d = await db.call('buddies'); localStorage.setItem(BKEY, JSON.stringify(d.buddies || [])); } catch (e) { /* keep the last list */ }
  buddyBusy = false;
  const box = $('#buddies'); if (box && !box.contains(document.activeElement)) renderBuddies();
  if (buddyAgain) { buddyAgain = false; loadBuddies(true); }
}
function renderBuddiesQuiet(code) { buddyCode = code; renderBuddies(); }
const buddyErr = (t) => { const e = $('#b-err'); if (e) { e.textContent = t; e.hidden = !t; } };

/* reminders from the bot: meals, weighing */
const RKEY = 'yizha-remind';
const HALF = Array.from({ length: 34 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const WD = ['понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота', 'неділя'];
let rem = (() => { try { return JSON.parse(localStorage.getItem(RKEY)) || null; } catch (e) { return null; } })() || { yizha: { on: false, time: '20:00' }, vaga: { on: false, time: '07:30', wd: 0 } };
let remLoaded = false;
async function remindCall(kind, action, extra = {}) {
  const fd = new FormData(); fd.append('initData', tg.initData); fd.append('kind', kind); fd.append('action', action);
  for (const [k, v] of Object.entries(extra)) fd.append(k, String(v));
  const r = await fetch(API + 'reminders', { method: 'POST', body: fd });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'http ' + r.status);
  return d;
}
function renderReminders() {
  const box = $('#reminders'); if (!box) return;
  const can = !!(tg && tg.initData);
  const sel = (id, val, opts) => `<select id="${id}"${can ? '' : ' disabled'}>${opts.map(([v, l]) => `<option value="${v}"${String(v) === String(val) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
  box.innerHTML = `<h2 id="h-r">Нагадування від бота</h2>
    <div class="remind"><div class="row"><span class="t"><b id="l-meal">Записати їжу</b><small>Щодня: скільки записано і скільки лишилось. Мовчить, якщо день записано й у нормі.</small></span>
      <button class="switch" type="button" role="switch" id="r-yizha" aria-labelledby="l-meal" aria-checked="${rem.yizha.on}"${can ? '' : ' disabled'}></button></div>
      <label class="field"><span>О котрій</span>${sel('r-yizha-time', rem.yizha.time, HALF.filter((h) => h >= '12:00').map((h) => [h, h]))}</label></div>
    <div class="remind"><div class="row"><span class="t"><b id="l-weigh">Зважитися</b><small>Раз на тиждень, зранку.</small></span>
      <button class="switch" type="button" role="switch" id="r-vaga" aria-labelledby="l-weigh" aria-checked="${rem.vaga.on}"${can ? '' : ' disabled'}></button></div>
      <div class="grid2"><label class="field"><span>День</span>${sel('r-vaga-wd', rem.vaga.wd, WD.map((w, i) => [i, w]))}</label><label class="field"><span>Час</span>${sel('r-vaga-time', rem.vaga.time, HALF.filter((h) => h <= '11:00').map((h) => [h, h]))}</label></div></div>
    ${can ? '<p class="state" id="r-state"></p>' : '<p class="note">Нагадування надсилає бот: відкрий «Харчування» через бота в Telegram.</p>'}`;
  if (can && !remLoaded) {
    remLoaded = true;
    Promise.all(['yizha', 'vaga'].map((k) => remindCall(k, 'status').then((d) => { rem[k] = { ...rem[k], on: !!d.on, ...(d.on && d.time ? { time: d.time } : {}), ...(d.on && d.wd != null ? { wd: d.wd } : {}) }; }).catch(() => {})))
      .then(() => { localStorage.setItem(RKEY, JSON.stringify(rem)); if (!box.contains(document.activeElement)) renderReminders(); });
  }
}
async function toggleRemind(kind, on) {
  const s = $('#r-state'), sw = $('#r-' + kind);
  const prefs = kind === 'vaga' ? { time: $('#r-vaga-time').value, wd: $('#r-vaga-wd').value } : { time: $('#r-yizha-time').value };
  sw.classList.add('busy'); sw.disabled = true;
  try {
    const d = await remindCall(kind, on ? 'on' : 'off', prefs);
    if (d.error === 'bot_blocked') throw new Error('blocked');
    rem[kind] = { ...rem[kind], ...prefs, wd: Number(prefs.wd || 0), on: !!d.on };
    localStorage.setItem(RKEY, JSON.stringify(rem));
    if (s) { s.className = 'state on'; s.textContent = on ? 'Увімкнено. Бот надіслав підтвердження в чат.' : 'Вимкнено.'; }
    haptic(on ? 'success' : null);
  } catch (e) {
    if (s) { s.className = 'state err'; s.textContent = e.message === 'blocked' ? 'Бот не може написати: відкрий чат з ботом і натисни «Старт».' : 'Не вдалося. Перевір інтернет і спробуй ще раз.'; }
    haptic('error');
  }
  sw.classList.remove('busy'); sw.disabled = false; sw.setAttribute('aria-checked', String(rem[kind].on));
}
async function remindPrefs(kind) {
  const prefs = kind === 'vaga' ? { time: $('#r-vaga-time').value, wd: $('#r-vaga-wd').value } : { time: $('#r-yizha-time').value };
  rem[kind] = { ...rem[kind], time: prefs.time, ...(prefs.wd != null ? { wd: Number(prefs.wd) } : {}) };
  localStorage.setItem(RKEY, JSON.stringify(rem));
  if (rem[kind].on) { try { await remindCall(kind, 'prefs', prefs); const s = $('#r-state'); if (s) { s.className = 'state on'; s.textContent = 'Час нагадування змінено.'; } } catch (e) { /* the next change sends it again */ } }
}

/* ---------- own foods and dishes ---------- */
function renderFoods() {
  const v = $('#view-foods'), ds = dishes().sort((a, b) => a.n.localeCompare(b.n, 'uk')), fs = mine().sort((a, b) => a.n.localeCompare(b.n, 'uk'));
  const row = (f, kind) => `<li><button class="row" type="button" data-open="${kind}" data-id="${esc(f.id)}">${iconHTML(f.thumb || f.ic)}<span class="t"><b>${esc(f.n)}</b><small>${esc(kind === 'dish' ? `${f.items ? f.items.length : 0} ${plural(f.items ? f.items.length : 0, 'інгредієнт', 'інгредієнти', 'інгредієнтів')}` : f.brand || (f.src === 'off' ? 'Open Food Facts' : 'свій продукт'))}</small></span><span class="k"><b class="num">${fmt(f.kcal)}</b>ккал / 100 ${f.l ? 'мл' : 'г'}</span></button></li>`;
  v.innerHTML = `
    <div class="btns"><button class="btn soft" type="button" data-new="food">${I.plus}Свій продукт</button><button class="btn soft" type="button" data-new="dish">${I.plus}Своя страва</button></div>
    <button class="btn soft" type="button" data-new="scan">${I.scan}Знайти за штрихкодом</button>
    <h3 class="group">Мої страви</h3>
    ${ds.length ? `<ul class="list">${ds.map((f) => row(f, 'dish')).join('')}</ul>` : '<p class="note">Домашній борщ чи улюблений салат: склади страву з продуктів один раз, і далі додавай порцію одним дотиком.</p>'}
    <h3 class="group">Мої продукти</h3>
    ${fs.length ? `<ul class="list">${fs.map((f) => row(f, 'food')).join('')}</ul>` : '<p class="note">Тут з’являться продукти, знайдені за штрихкодом, і ті, що ти додаси сам(а) з етикетки.</p>'}
    <p class="note small">У довіднику ${BUILT.length} продуктів і страв з офіційної німецької бази BLS 4.0 і рецептів українських страв. Упаковані продукти шукаються в Open Food Facts.</p>`;
}

/* ---------- the sheet: adding food, portions, barcode, own foods and dishes ---------- */
const sheet = { stack: [], stop: null, offTimer: null, offSeq: 0, offCache: new Map() };
function openSheet(view, data) {
  sheet.stack = [{ view, data }];
  $('#sheet').hidden = false; document.documentElement.classList.add('sheet-open');
  try { history.pushState({ sheet: 1 }, ''); } catch (e) { /* no history */ }
  renderSheet(); haptic('light');
}
function sheetGo(view, data) { stopCamera(); sheet.stack.push({ view, data }); renderSheet(); }
function sheetBack() { stopCamera(); sheet.stack.pop(); if (!sheet.stack.length) closeSheet(); else renderSheet(); }
function closeSheet(fromHistory) {
  stopCamera();
  if ($('#sheet').hidden) return;
  $('#sheet').hidden = true; document.documentElement.classList.remove('sheet-open'); sheet.stack = [];
  if (!fromHistory && history.state && history.state.sheet) history.back();
}
function stopCamera() { if (sheet.stop) { try { sheet.stop(); } catch (e) { /* stopped already */ } sheet.stop = null; } }
window.addEventListener('popstate', () => { if (!$('#sheet').hidden) closeSheet(true); });
const top = () => sheet.stack[sheet.stack.length - 1];
function renderSheet() {
  const { view, data } = top(), body = $('#sheet-body');
  $('#sheet-back').hidden = sheet.stack.length < 2;
  const T = { add: data.pick ? 'Додати інгредієнт' : `Додати: ${(MEALS.find((m) => m.id === data.meal) || MEALS[0]).uk.toLowerCase()}`, portion: data.entry ? 'Змінити' : data.pick ? 'Скільки в страві' : 'Скільки',
    scan: 'Штрихкод', custom: data.food ? 'Свій продукт' : 'Новий продукт', dish: data.draft && data.draft.id ? 'Своя страва' : 'Нова страва' };
  $('#sheet-title').textContent = T[view];
  body.scrollTop = 0;
  ({ add: viewAdd, portion: viewPortion, scan: viewScan, custom: viewCustom, dish: viewDish })[view](body, data);
}
const defaultMeal = () => { const h = new Date().getHours(); return h < 11 ? 'b' : h < 16 ? 'l' : h < 21 ? 'd' : 's'; };

function foodRow(f) {
  const u = usage().get(f.id), sub = f.brand || (f.src === 'bls' || f.src === 'dish' ? f.de : f.src === 'recipe' ? 'своя страва' : f.src === 'off' ? 'Open Food Facts' : 'свій продукт');
  return `<li><button class="row" type="button" data-food="${esc(f.id)}">${iconHTML(f.thumb || f.ic)}<span class="t"><b>${esc(f.n)}</b><small>${esc(sub)}${u ? ` · востаннє ${fmt(u.g)} ${unitOf(f)}` : ''}</small></span><span class="k"><b class="num">${fmt(f.kcal)}</b>ккал / 100 ${unitOf(f)}</span></button></li>`;
}
function viewAdd(body, d) {
  body.innerHTML = `<div class="search"><input type="search" id="q" placeholder="Пошук: гречка, skyr, борщ…" enterkeyhint="search" autocomplete="off" aria-label="Пошук продукту" value="${esc(d.q || '')}">
    <button class="iconbtn" type="button" id="toscan" aria-label="Сканувати штрихкод">${I.scan}</button></div><div id="res" style="display:grid;gap:12px"></div>`;
  const q = $('#q');
  q.addEventListener('input', () => { d.q = q.value; d.cat = ''; results(d); });
  results(d);
  if (!d.q && !matchMedia('(pointer: coarse)').matches) q.focus();
}
function results(d) {
  const res = $('#res'); if (!res) return;
  const q = (d.q || '').trim(), known = new Map();
  sheet.lastFoods = known;
  const list = (arr) => `<ul class="list">${arr.map((f) => { known.set(f.id, f); return foodRow(f); }).join('')}</ul>`;
  if (!q) {
    const u = usage(), recent = [...u.entries()].sort((a, b) => b[1].at - a[1].at).slice(0, 12).map(([id, x]) => foodById(id) || fromEntry(x.e));
    let html = `<div class="cats" role="radiogroup" aria-label="Категорії">${CATS.map((c) => `<button class="chip" type="button" role="radio" data-cat="${c.id}" aria-checked="${d.cat === c.id}">${c.icon} ${esc(c.uk)}</button>`).join('')}</div>`;
    if (d.cat) {
      const inCat = BUILT.filter((f) => f.cat === d.cat);
      html += `<h3 class="group">${esc(CAT.get(d.cat).uk)}</h3>` + list(inCat);
    } else {
      if (recent.length) html += '<h3 class="group">Нещодавні</h3>' + list(recent);
      const own = [...dishes(), ...mine()].slice(0, 20);
      if (own.length) html += '<h3 class="group">Мої</h3>' + list(own);
      if (!recent.length && !own.length) html += '<p class="note">Почни писати назву або відскануй штрихкод на упаковці. Українські страви теж є: борщ, вареники, сирники, голубці.</p>';
    }
    res.innerHTML = html + newFoodButton();
    return;
  }
  const local = findLocal(q);
  res.innerHTML = (local.length ? list(local) : `<p class="note">У довіднику й серед твоїх продуктів «${esc(q)}» немає.</p>`) +
    `<h3 class="group">У магазинах Німеччини</h3><div id="offres">${q.length < 3 ? '<p class="note small">Ще кілька літер, і пошукаю серед упакованих продуктів.</p>' : '<p class="loading">Шукаю в Open Food Facts…</p>'}</div>` + newFoodButton();
  clearTimeout(sheet.offTimer);
  if (q.length >= 3) sheet.offTimer = setTimeout(() => offResults(q), 450);
}
const newFoodButton = () => `<button class="btn soft" type="button" id="tocustom">${I.plus}Немає потрібного? Свій продукт з етикетки</button>`;
async function offResults(q) {
  const seq = ++sheet.offSeq;
  let foods;
  try { foods = sheet.offCache.get(q) || await offSearch(q); sheet.offCache.set(q, foods); }
  catch (e) { const box = $('#offres'); if (box && seq === sheet.offSeq) box.innerHTML = `<p class="note small">${navigator.onLine === false ? 'Без інтернету шукаю лише в довіднику й серед твоїх продуктів.' : 'Open Food Facts зараз не відповідає. Спробуй пізніше або відскануй штрихкод.'}</p>`; return; }
  const box = $('#offres'); if (!box || seq !== sheet.offSeq) return;
  if (!foods.length) { box.innerHTML = '<p class="note small">Нічого не знайдено. Спробуй німецьку назву з упаковки або штрихкод.</p>'; return; }
  box.innerHTML = `<ul class="list">${foods.map((f) => { sheet.lastFoods.set(f.id, f); return foodRow(f); }).join('')}</ul><p class="offnote">Дані й фото: Open Food Facts (ODbL, CC BY-SA). Перевір калорії на упаковці: базу заповнюють люди.</p>`;
}

/* amount: in portions (2 × скибка) or in grams */
function amountState(food, entry) {
  const por = food.por || [];
  if (entry) {
    const i = por.findIndex((x) => x[0] === entry.pn);
    return i >= 0 && entry.pq ? { unit: i, q: entry.pq } : { unit: 'g', q: entry.g };
  }
  const u = usage().get(food.id);
  if (u && u.g) {
    const e = u.e, i = e && e.pn ? por.findIndex((x) => x[0] === e.pn) : -1;
    if (i >= 0 && e.pq) return { unit: i, q: e.pq };
    return { unit: 'g', q: u.g };
  }
  return por.length ? { unit: 0, q: 1 } : { unit: 'g', q: 100 };
}
const gramsOf = (food, a) => Math.max(0, Math.round(a.unit === 'g' ? a.q : a.q * food.por[a.unit][1]));
function viewPortion(body, d) {
  const food = d.food, a = d.a || (d.a = amountState(food, d.entry)), u = unitOf(food);
  if (!d.meal) d.meal = d.entry ? d.entry.meal : defaultMeal();
  const units = [['g', u === 'мл' ? 'мілілітри' : 'грами'], ...(food.por || []).map((x, i) => [i, `${x[0]} · ${fmt(x[1])} ${u}`])];
  body.innerHTML = `
    <div class="product">${iconHTML(food.ic, true)}<span class="t"><b>${esc(food.n)}</b><small>${esc(food.brand || food.de || (food.src === 'recipe' ? 'своя страва' : ''))}</small></span></div>
    <p class="per100 num">На 100 ${u}: ${fmt(food.kcal)} ккал · білки ${fmt1(food.p)} · жири ${fmt1(food.f)} · вуглеводи ${fmt1(food.c)} г</p>
    ${units.length > 1 ? `<div class="chips" style="margin:0" role="radiogroup" aria-label="Як рахувати">${units.map(([k, l]) => `<button class="chip" type="button" role="radio" data-unit="${k}" aria-checked="${String(a.unit) === String(k)}">${esc(l)}</button>`).join('')}</div>` : ''}
    <div class="stepper"><button type="button" data-q="-1" aria-label="Менше">−</button><input id="pq" inputmode="decimal" aria-label="Кількість" value="${fmt1(a.q)}"><span class="unit">${a.unit === 'g' ? u : esc(food.por[a.unit][0].split(' (')[0])}</span><button type="button" data-q="1" aria-label="Більше">+</button></div>
    <div class="total" id="ptotal"></div>
    ${d.pick ? '' : `<div class="seg four" role="radiogroup" aria-label="Прийом їжі">${MEALS.map((m) => `<button type="button" role="radio" data-meal="${m.id}" aria-checked="${d.meal === m.id}"><b style="font-size:14px">${m.uk}</b></button>`).join('')}</div>`}
    <button class="btn primary" type="button" id="psave">${d.entry ? 'Зберегти' : d.pick ? 'Додати в страву' : 'Додати'}</button>
    ${d.entry ? '<button class="btn danger" type="button" id="pdel">Видалити з дня</button>' : ''}
    ${food.fixed ? '<p class="note warn small">У базі для цього продукту калорії не сходилися з білками, жирами й вуглеводами, тож їх пораховано з них. Звір з упаковкою.</p>' : ''}
    ${food.src === 'off' ? `<p class="offnote">Дані: Open Food Facts${food.code ? `, штрихкод ${esc(food.code)}` : ''}. Якщо на упаковці інакше, збережи як свій продукт.</p>` : food.src === 'bls' ? '<p class="offnote">Дані: BLS 4.0, Max Rubner-Institut (CC BY 4.0).</p>' : ''}`;
  paintTotal(d);
}
function paintTotal(d) {
  const g = gramsOf(d.food, d.a), x = portion(d.food, g), box = $('#ptotal'); if (!box) return;
  box.innerHTML = `<b class="num">${fmt(x.kcal)}</b><span>ккал${d.a.unit !== 'g' ? ` · ${fmt(g)} ${unitOf(d.food)}` : ''}</span><span class="num">Б ${fmt1(x.p)} · Ж ${fmt1(x.f)} · В ${fmt1(x.c)} г</span>`;
  $('#psave').disabled = !(g > 0);
}
function savePortion(d) {
  const food = d.food, g = gramsOf(food, d.a); if (!(g > 0)) return;
  const pn = d.a.unit === 'g' ? '' : food.por[d.a.unit][0], pq = d.a.unit === 'g' ? 0 : d.a.q;
  if (d.pick) {   // an ingredient of a dish
    let i = sheet.stack.length - 1; while (i > 0 && sheet.stack[i].view !== 'dish') i--;
    sheet.stack[i].data.draft.items.push({ fid: food.id, n: food.n, ic: food.thumb || food.ic || '', g, kcal: food.kcal, p: food.p, f: food.f, c: food.c, l: food.l ? 1 : 0 });
    stopCamera(); sheet.stack.length = i + 1; renderSheet(); haptic('light'); return;
  }
  if (food.src === 'off' && !db.get('f', food.id)) {   // a scanned or found product stays as one's own: works offline next time
    const { id, src, thumb, ...rest } = food; db.put('f', food.id, { ...rest, src: 'off', ic: food.ic || '', thumb: food.thumb || '' });
  }
  const v = { day: d.entry ? d.entry.day : d.day, meal: d.meal, fid: food.id, n: food.n, b: food.brand || '', ic: food.thumb || food.ic || '', g, pn, pq,
    kcal: food.kcal, p: food.p, f: food.f, c: food.c, l: food.l ? 1 : 0, at: d.entry ? d.entry.at : Date.now() };
  const id = d.entry ? d.entry.id : `${v.day}~${db.rid()}`;
  const before = d.entry ? db.get('e', id) : null;
  db.put('e', id, v);
  closeSheet(); haptic('success');
  toast(`${d.entry ? 'Змінено' : 'Додано'}: ${food.n} · ${fmt(portion(v, g).kcal)} ккал`, () => { if (before) db.put('e', id, before); else db.del('e', id); });
}

function viewScan(body, d) {
  body.innerHTML = `<div class="video"><video id="cam" muted playsinline></video><div class="frame" aria-hidden="true"></div></div>
    <p class="note" id="scanmsg">Наведи камеру на штрихкод на упаковці: смужки — у рамку.</p>
    <p class="err" id="scanerr" hidden></p>
    <label class="btn soft" style="position:relative">${I.camera}Сфотографувати штрихкод<input type="file" accept="image/*" capture="environment" id="scanfile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
    <label class="field"><span>Або введи цифри під штрихкодом</span></label>
    <form class="joinrow" id="codeform" style="margin-top:-6px"><input id="codein" inputmode="numeric" maxlength="14" autocomplete="off" placeholder="4000417025005" aria-label="Цифри штрихкоду" style="text-transform:none;letter-spacing:.04em"><button class="btn primary" type="submit">Знайти</button></form>`;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { camFailed(); return; }
  import('./scan.js').then((s) => s.live($('#cam'), (code) => { haptic('success'); lookup(code, d); }))
    .then((stop) => { if (top() && top().view === 'scan' && !$('#sheet').hidden) sheet.stop = stop; else stop(); })
    .catch(() => camFailed());
}
function camFailed() {
  const v = $('#cam'); if (v) v.parentNode.hidden = true;
  const m = $('#scanmsg'); if (m) m.textContent = 'Камеру тут відкрити не вдалося. Сфотографуй штрихкод кнопкою нижче або введи цифри.';
}
async function lookup(code, d) {
  const err = (t) => { const e = $('#scanerr'); if (e) { e.textContent = t; e.hidden = !t; } };
  err('');
  if (!validCode(code)) { err('Це не схоже на штрихкод продукту: 8 або 13 цифр.'); return; }
  const own = mine().find((f) => f.code === code);
  if (own) { sheetGo('portion', { food: own, meal: d.meal, day: d.day, pick: d.pick }); return; }
  const msg = $('#scanmsg'); if (msg) msg.textContent = `Шукаю ${code}…`;
  try {
    const r = await byBarcode(code);
    if (!top() || top().view !== 'scan') return;
    if (r.food) { sheetGo('portion', { food: r.food, meal: d.meal, day: d.day, pick: d.pick }); return; }
    err(`Продукту ${code} немає в Open Food Facts${r.name ? ` (або в нього не вказано калорій: «${r.name}»)` : ''}. Додай його сам(а) з етикетки — наступного разу він знайдеться за штрихкодом.`);
    const b = document.createElement('button'); b.className = 'btn primary'; b.type = 'button'; b.textContent = 'Додати з етикетки';
    b.addEventListener('click', () => sheetGo('custom', { code, then: d.pick ? 'pick' : 'add', meal: d.meal, day: d.day, pick: d.pick }));
    $('#scanerr').after(b);
  } catch (e) { err(navigator.onLine === false ? 'Немає інтернету. Відскануй, коли з’явиться зв’язок, або додай продукт з етикетки.' : 'Open Food Facts не відповідає. Спробуй ще раз.'); }
}

const ICON_CHOICES = ['', ...CATS.map((c) => c.icon), '🥗', '🥞', '🥟', '🍜', '🍰', '🧃', '🍪'];
function viewCustom(body, d) {
  const f = d.food || { n: '', kcal: '', p: '', f: '', c: '', por: [], l: false, code: d.code || '', ic: '' };
  if (!d.icon && d.icon !== '') d.icon = f.ic && !/^https:/.test(f.ic) ? f.ic : f.ic ? f.ic : '';
  const por = (f.por || [])[0] || ['', ''];
  body.innerHTML = `<p class="note">Перепиши з етикетки значення <b>на 100 г</b> (або на 100 мл).</p>
    <label class="field"><span>Назва</span><input id="c-n" maxlength="80" value="${esc(f.n)}" placeholder="Наприклад: йогурт грецький 2 %"></label>
    <div class="grid2"><label class="field"><span>Ккал на 100</span><input id="c-kcal" inputmode="decimal" value="${esc(f.kcal === '' ? '' : fmt1(f.kcal))}"></label>
    <label class="field"><span>Білки, г</span><input id="c-p" inputmode="decimal" value="${esc(f.p === '' ? '' : fmt1(f.p))}"></label>
    <label class="field"><span>Жири, г</span><input id="c-f" inputmode="decimal" value="${esc(f.f === '' ? '' : fmt1(f.f))}"></label>
    <label class="field"><span>Вуглеводи, г</span><input id="c-c" inputmode="decimal" value="${esc(f.c === '' ? '' : fmt1(f.c))}"></label></div>
    <div class="grid2"><label class="field"><span>Порція (необов’язково)</span><input id="c-pn" maxlength="30" value="${esc(por[0])}" placeholder="стаканчик"></label>
    <label class="field"><span>Порція, г</span><input id="c-pg" inputmode="numeric" value="${esc(por[1] || '')}" placeholder="150"></label></div>
    <div class="row" style="padding:0;min-height:44px;cursor:default"><span class="t"><b>Рідина</b><small>рахувати в мілілітрах</small></span><button class="switch" type="button" role="switch" id="c-l" aria-checked="${!!f.l}" aria-label="Рідина"></button></div>
    <label class="field"><span>Штрихкод (необов’язково)</span><input id="c-code" inputmode="numeric" maxlength="14" value="${esc(f.code || '')}"></label>
    <div class="field"><span>Іконка</span><div class="chips" style="margin:0" role="radiogroup" aria-label="Іконка">${ICON_CHOICES.map((ic) => `<button class="chip" type="button" role="radio" data-icon="${esc(ic)}" aria-checked="${d.icon === ic}" style="font-size:20px;padding:0 10px" aria-label="${ic ? ic : 'невідомо'}">${ic || '❔'}</button>`).join('')}${f.ic && /^https:/.test(f.ic) ? `<button class="chip" type="button" role="radio" data-icon="${esc(f.ic)}" aria-checked="${d.icon === f.ic}">фото</button>` : ''}</div></div>
    <p class="err" id="c-err" hidden></p>
    <button class="btn primary" type="button" id="c-save">${d.food ? 'Зберегти' : 'Зберегти й додати'}</button>
    ${d.food ? '<button class="btn danger" type="button" id="c-del">Видалити продукт</button>' : ''}`;
}
function saveCustom(d) {
  const n = $('#c-n').value.replace(/\s+/g, ' ').trim(), kcal = parseNum($('#c-kcal').value), p = parseNum($('#c-p').value || 0), fat = parseNum($('#c-f').value || 0), c = parseNum($('#c-c').value || 0);
  const pn = $('#c-pn').value.trim(), pg = parseNum($('#c-pg').value), code = $('#c-code').value.replace(/\D/g, '');
  const err = (t) => { $('#c-err').textContent = t; $('#c-err').hidden = false; haptic('error'); };
  if (!n) return err('Напиши назву.');
  if (!(kcal >= 0 && kcal <= 950)) return err('Калорії на 100 г: число від 0 до 950.');
  if (![p, fat, c].every((x) => x >= 0 && x <= 100)) return err('Білки, жири й вуглеводи: від 0 до 100 г.');
  if (code && !validCode(code)) return err('Штрихкод не схожий на справжній: перевір цифри.');
  const id = d.food ? d.food.id : 'my-' + db.rid();
  const v = { n, kcal: Math.round(kcal), p, f: fat, c, por: pn && pg > 0 ? [[pn, Math.round(pg)]] : [], l: $('#c-l').getAttribute('aria-checked') === 'true', code, ic: d.icon || '', src: d.food ? d.food.src || 'my' : 'my',
    ...(d.food && d.food.brand ? { brand: d.food.brand } : {}), ...(d.food && d.food.thumb && d.icon === d.food.ic ? { thumb: d.food.thumb } : {}) };
  db.put('f', id, v); haptic('success');
  if (d.food) { sheetBack(); toast('Збережено: ' + n); return; }
  if (d.then === 'save') { closeSheet(); toast('Збережено в «Мої продукти»: ' + n); return; }
  sheet.stack.pop();
  sheetGo('portion', { food: { id, ...v }, meal: d.meal, day: d.day, pick: d.pick });
}

function viewDish(body, d) {
  const dr = d.draft, tot = sum(dr.items), raw = dr.items.reduce((a, x) => a + x.g, 0), cooked = parseNum(dr.total) || raw;
  const per = cooked > 0 ? { kcal: Math.round((tot.kcal / cooked) * 100) } : { kcal: 0 };
  body.innerHTML = `<label class="field"><span>Назва страви</span><input id="d-n" maxlength="80" value="${esc(dr.n || '')}" placeholder="Борщ домашній"></label>
    <h3 class="group">Інгредієнти${raw ? ` · ${fmt(raw)} г, ${fmt(tot.kcal)} ккал` : ''}</h3>
    ${dr.items.length ? `<ul class="list">${dr.items.map((x, i) => `<li><div class="row" style="cursor:default">${iconHTML(x.ic)}<span class="t"><b>${esc(x.n)}</b><small class="num">${fmt(x.g)} ${x.l ? 'мл' : 'г'} · ${fmt(portion(x, x.g).kcal)} ккал</small></span><button class="iconbtn" type="button" data-rmi="${i}" aria-label="Прибрати: ${esc(x.n)}">${I.x}</button></div></li>`).join('')}</ul>` : '<p class="note">Додай усе, що йде в каструлю, з вагою сирих продуктів.</p>'}
    <button class="btn soft" type="button" id="d-add">${I.plus}Додати інгредієнт</button>
    <label class="field"><span>Вага готової страви, г (необов’язково)</span><input id="d-total" inputmode="numeric" value="${esc(dr.total || '')}" placeholder="${raw ? fmt(raw) : 'зваж каструлю мінус порожню'}"></label>
    <p class="note small">Вода при варінні додає вагу, а смаження забирає: так калорії на 100 г будуть точними. Порожньо — рахую за вагою інгредієнтів.</p>
    <label class="field"><span>Порція, г</span><input id="d-por" inputmode="numeric" value="${esc(dr.por || 300)}"></label>
    <div class="total"><b class="num" id="d-per">${fmt(per.kcal)}</b><span>ккал на 100 г</span></div>
    <p class="err" id="d-err" hidden></p>
    <button class="btn primary" type="button" id="d-save">Зберегти страву</button>
    ${dr.id ? '<button class="btn danger" type="button" id="d-del">Видалити страву</button>' : ''}`;
}
function readDish(dr) { const n = $('#d-n'); if (!n) return; dr.n = n.value; dr.total = $('#d-total').value; dr.por = $('#d-por').value; }
function saveDish(d) {
  const dr = d.draft; readDish(dr);
  const err = (t) => { $('#d-err').textContent = t; $('#d-err').hidden = false; haptic('error'); };
  const n = String(dr.n || '').replace(/\s+/g, ' ').trim(); if (!n) return err('Напиши назву страви.');
  if (!dr.items.length) return err('Додай хоча б один інгредієнт.');
  const tot = sum(dr.items), raw = dr.items.reduce((a, x) => a + x.g, 0), cooked = parseNum(dr.total) > 0 ? Math.round(parseNum(dr.total)) : raw, k = 100 / cooked;
  const por = Math.round(parseNum(dr.por)) > 0 ? Math.round(parseNum(dr.por)) : 300;
  const r1 = (x) => Math.round(x * 10) / 10;
  const v = { n, items: dr.items, total: cooked, kcal: Math.round(tot.kcal * k), p: r1(tot.p * k), f: r1(tot.f * k), c: r1(tot.c * k), por: [['порція', por]], ic: '🍲' };
  db.put('r', dr.id || 'dish-' + db.rid(), v); haptic('success');
  closeSheet(); toast(`Страву збережено: ${n} · ${v.kcal} ккал на 100 г`);
}

/* ---------- toast with undo ---------- */
let toastTimer = null, undoFn = null;
function toast(text, undo) {
  $('#toast-text').textContent = text; $('#toast-undo').hidden = !undo; undoFn = undo || null;
  $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; undoFn = null; }, 4500);
}
$('#toast-undo').addEventListener('click', () => { if (undoFn) undoFn(); undoFn = null; $('#toast').hidden = true; haptic(); });

/* ---------- tabs and showing ---------- */
const VIEWS = { day: '#view-day', progress: '#view-progress', foods: '#view-foods' };
function showTab(t, instant) {
  st.tab = t;
  $$('#tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  if (window.UI) { UI.tabsThumb(instant); UI.switchView(Object.values(VIEWS).map((s) => $(s)), $(VIEWS[t]), { instant }); }
  else Object.entries(VIEWS).forEach(([k, s]) => { $(s).hidden = k !== t; });
  try { history.replaceState(history.state, '', t === 'day' ? location.pathname : '?tab=' + t); } catch (e) { /* file:// */ }
  if (t === 'progress') loadBuddies();
}
function showMain(instant) {
  $('#view-setup').hidden = true; $('#tabs').hidden = false;
  $('#lede').textContent = 'Що з’їдено за день, скільки ще можна, і як змінюється вага.';
  renderDay(); renderProgress(); renderFoods();
  showTab(st.tab, instant);
}
function showSetup(edit) {
  draft = setupDraft(edit); st.setup = true;
  Object.values(VIEWS).forEach((s) => { $(s).hidden = true; }); $('#tabs').hidden = true;
  $('#view-setup').hidden = false; renderSetup(); window.scrollTo(0, 0);
  if (!edit) $('#lede').textContent = 'Щоденник їжі з калоріями, вага й мета. Спершу кілька питань — це хвилина.';
}
function renderAll() {
  if (st.setup) return;
  if (!profile()) { showSetup(false); return; }
  const active = document.activeElement, keep = active && active.matches && active.matches('input, select, textarea') && active.closest('.view');
  for (const [k, fn] of [['day', renderDay], ['progress', renderProgress], ['foods', renderFoods]]) if (!keep || keep !== $(VIEWS[k])) fn();
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const t = e.target;
  // setup
  const seg = t.closest('[data-seg] [data-v]');
  if (seg && draft) { const name = seg.closest('[data-seg]').dataset.seg, val = seg.dataset.v; readSetup(); draft[name] = name === 'pace' ? Number(val) : val; $$(`[data-seg="${name}"] [data-v]`).forEach((b) => b.setAttribute('aria-checked', String(b === seg))); previewSetup(); haptic(); return; }
  const opt = t.closest('[data-opts="act"] [data-v]');
  if (opt && draft) { readSetup(); draft.act = Number(opt.dataset.v); $$('[data-opts="act"] [data-v]').forEach((b) => b.setAttribute('aria-checked', String(b === opt))); previewSetup(); haptic(); return; }
  if (t.closest('#s-save')) { saveSetup(); return; }
  if (t.closest('#s-cancel')) { draft = null; st.setup = false; showMain(true); return; }
  // tabs
  const tab = t.closest('#tabs [role="tab"]'); if (tab) { if (tab.dataset.tab !== st.tab) { showTab(tab.dataset.tab); haptic(); } return; }
  // the day
  const nav = t.closest('[data-day]'); if (nav && !nav.disabled) { st.day = dayOf(dayNum(st.day) + Number(nav.dataset.day)); if (st.day > today()) st.day = today(); renderDay(); haptic(); return; }
  const add = t.closest('[data-add]'); if (add) { openSheet('add', { meal: add.dataset.add, day: st.day, q: '' }); return; }
  const en = t.closest('[data-entry]');
  if (en) {
    const e2 = db.all('e', en.dataset.entry.split('~')[0] + '~').find((x) => x.id === en.dataset.entry); if (!e2) return;
    const base = foodById(e2.fid) || fromEntry(e2);   // the entry keeps the numbers it was added with
    openSheet('portion', { food: { ...base, n: e2.n, kcal: e2.kcal, p: e2.p, f: e2.f, c: e2.c, l: !!e2.l, ic: e2.ic || base.ic, por: base.por || [] }, entry: e2, day: e2.day }); return;
  }
  const ag = t.closest('[data-again]');
  if (ag) {
    const prevDay = dayOf(dayNum(st.day) - 1), list = entriesOf(prevDay).filter((x) => x.meal === ag.dataset.again), ids = [];
    list.forEach((x, i) => { const { id, ...v } = x; const nid = `${st.day}~${db.rid()}${i}`; ids.push(nid); db.put('e', nid, { ...v, day: st.day, at: Date.now() + i }); });
    haptic('success'); toast(`Додано як учора: ${fmt(sum(list).kcal)} ккал`, () => ids.forEach((id) => db.del('e', id))); return;
  }
  // progress
  const ws = t.closest('[data-wstep]'); if (ws) { const inp = $('#wkg'), v = parseNum(inp.value); inp.value = fmt1(Math.max(30, Math.round(((Number.isFinite(v) ? v : 70) + Number(ws.dataset.wstep) * 0.1) * 10) / 10)); haptic(); return; }
  if (t.closest('#wsave')) { const kg = parseNum($('#wkg').value); if (!(kg >= 30 && kg <= 300)) { haptic('error'); $('#wkg').focus(); return; } db.put('w', today(), { kg: Math.round(kg * 10) / 10 }); haptic('success'); toast(`Вагу записано: ${fmt1(kg)} кг`); return; }
  const rg = t.closest('[data-range]'); if (rg) { range = Number(rg.dataset.range); renderProgress(); haptic(); return; }
  if (t.closest('#editgoal')) { showSetup(true); return; }
  if (t.closest('#b-invite')) { buddyErr(''); db.call('invite').then((d) => { buddyCode = d.code; renderBuddiesQuiet(buddyCode); haptic(); }).catch((er) => buddyErr(er.offline ? 'Немає зв’язку. Спробуй, коли буде інтернет.' : 'Не вдалося створити код.')); return; }
  if (t.closest('#b-have')) { const f = $('#b-join'); f.hidden = !f.hidden; t.closest('#b-have').setAttribute('aria-expanded', String(!f.hidden)); if (!f.hidden) $('#b-code').focus(); return; }
  if (t.closest('#b-send')) {
    const text = `Давай худнути разом у D-SIM’YA: відкрий «Харчування» → «Прогрес» → «Маю код» і введи ${buddyCode}.`;
    const url = 'https://t.me/share/url?url=' + encodeURIComponent('https://t.me/whysendbot') + '&text=' + encodeURIComponent(text);
    try { if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, '_blank'); } catch (er) { /* nothing to open */ }
    return;
  }
  const ub = t.closest('[data-unbuddy]');
  if (ub) { if (ub.dataset.armed) { db.call('leave', { id: ub.dataset.unbuddy }).then(() => { buddyCode = ''; loadBuddies(true); }).catch(() => buddyErr('Не вдалося. Спробуй ще раз.')); } else { ub.dataset.armed = '1'; ub.style.color = 'var(--danger)'; ub.setAttribute('aria-label', 'Натисни ще раз, щоб більше не ділитися'); setTimeout(() => { delete ub.dataset.armed; ub.style.color = ''; }, 3500); haptic(); } return; }
  const sw = t.closest('#r-yizha, #r-vaga'); if (sw && !sw.disabled) { toggleRemind(sw.id.slice(2), sw.getAttribute('aria-checked') !== 'true'); return; }
  // own foods
  const nw = t.closest('[data-new]');
  if (nw) { const k = nw.dataset.new; if (k === 'food') openSheet('custom', { then: 'save' }); else if (k === 'dish') openSheet('dish', { draft: { n: '', items: [], total: '', por: 300 } }); else openSheet('scan', { meal: defaultMeal(), day: today() }); return; }
  const op = t.closest('[data-open]');
  if (op) {
    if (op.dataset.open === 'dish') { const r = db.get('r', op.dataset.id); if (r) openSheet('dish', { draft: { id: op.dataset.id, n: r.n, items: (r.items || []).map((x) => ({ ...x })), total: r.total, por: (r.por && r.por[0] && r.por[0][1]) || 300 } }); }
    else { const f = foodById(op.dataset.id); if (f) openSheet('custom', { food: f }); }
    return;
  }
  // the sheet
  if (t.closest('[data-close]')) { closeSheet(); return; }
  if (t.closest('#sheet-back')) { sheetBack(); return; }
  if ($('#sheet').hidden) return;
  const cur = top(); if (!cur) return;
  const d = cur.data;
  const cat = t.closest('[data-cat]'); if (cat) { d.cat = d.cat === cat.dataset.cat ? '' : cat.dataset.cat; results(d); haptic(); return; }
  const fd = t.closest('[data-food]'); if (fd) { const f = (sheet.lastFoods && sheet.lastFoods.get(fd.dataset.food)) || foodById(fd.dataset.food); if (f) sheetGo('portion', { food: f, meal: d.meal, day: d.day, pick: d.pick }); return; }
  if (t.closest('#toscan')) { sheetGo('scan', { meal: d.meal, day: d.day, pick: d.pick }); return; }
  if (t.closest('#tocustom')) { sheetGo('custom', { then: d.pick ? 'pick' : 'add', meal: d.meal, day: d.day, pick: d.pick }); return; }
  const un = t.closest('[data-unit]');
  if (un) { const food = d.food, g = gramsOf(food, d.a), k = un.dataset.unit; d.a = k === 'g' ? { unit: 'g', q: g } : { unit: Number(k), q: Math.max(0.5, Math.round((g / food.por[Number(k)][1]) * 2) / 2) }; viewPortion($('#sheet-body'), d); haptic(); return; }
  const qb = t.closest('[data-q]');
  if (qb) { const dir = Number(qb.dataset.q), a = d.a, step = a.unit === 'g' ? (a.q < 50 || (a.q <= 50 && dir < 0) ? 5 : 10) : 0.5; a.q = Math.max(a.unit === 'g' ? 5 : 0.5, Math.round((a.q + dir * step) * 10) / 10); $('#pq').value = fmt1(a.q); paintTotal(d); haptic(); return; }
  const ml = t.closest('[data-meal]'); if (ml) { d.meal = ml.dataset.meal; $$('[data-meal]').forEach((b) => b.setAttribute('aria-checked', String(b === ml))); haptic(); return; }
  if (t.closest('#psave')) { savePortion(d); return; }
  if (t.closest('#pdel')) { const before = d.entry; db.del('e', before.id); closeSheet(); toast('Видалено: ' + before.n, () => { const { id, ...v } = before; db.put('e', id, v); }); haptic(); return; }
  const icn = t.closest('[data-icon]'); if (icn) { d.icon = icn.dataset.icon; $$('[data-icon]').forEach((b) => b.setAttribute('aria-checked', String(b === icn))); haptic(); return; }
  const lq = t.closest('#c-l'); if (lq) { lq.setAttribute('aria-checked', String(lq.getAttribute('aria-checked') !== 'true')); haptic(); return; }
  if (t.closest('#c-save')) { saveCustom(d); return; }
  if (t.closest('#c-del')) { const f = d.food; db.del('f', f.id); closeSheet(); toast('Видалено: ' + f.n, () => { const { id, ...v } = f; db.put('f', id, v); }); return; }
  if (t.closest('#d-add')) { readDish(d.draft); sheetGo('add', { pick: true, q: '' }); return; }
  const rmi = t.closest('[data-rmi]'); if (rmi) { readDish(d.draft); d.draft.items.splice(Number(rmi.dataset.rmi), 1); renderSheet(); haptic(); return; }
  if (t.closest('#d-save')) { saveDish(d); return; }
  if (t.closest('#d-del')) { const id = d.draft.id, r = db.get('r', id); db.del('r', id); closeSheet(); toast('Страву видалено', () => db.put('r', id, r)); }
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (draft && t.closest('#view-setup')) { readSetup(); previewSetup(); $('#s-err').hidden = true; return; }
  if (t.id === 'pq') { const cur = top(), v = parseNum(t.value); if (cur && Number.isFinite(v) && v >= 0) { cur.data.a.q = v; paintTotal(cur.data); } return; }
  if (t.id === 'd-total') { const cur = top(), dr = cur.data.draft; readDish(dr); const tot = sum(dr.items), raw = dr.items.reduce((a, x) => a + x.g, 0), cooked = parseNum(dr.total) > 0 ? parseNum(dr.total) : raw; $('#d-per').textContent = fmt(cooked ? Math.round((tot.kcal / cooked) * 100) : 0); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'r-yizha-time') remindPrefs('yizha');
  else if (t.id === 'r-vaga-time' || t.id === 'r-vaga-wd') remindPrefs('vaga');
  else if (t.id === 'scanfile' && t.files && t.files[0]) {
    const d = top() && top().data, msg = $('#scanmsg');
    if (msg) msg.textContent = 'Читаю штрихкод з фото…';
    import('./scan.js').then((s) => s.fromImage(t.files[0])).then((code) => { if (code) { haptic('success'); lookup(code, d); } else { const er = $('#scanerr'); er.textContent = 'На фото не видно штрихкоду. Сфотографуй ближче й рівніше, при доброму світлі.'; er.hidden = false; } })
      .catch(() => { const er = $('#scanerr'); er.textContent = 'Не вдалося прочитати фото.'; er.hidden = false; });
  }
});
document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.id === 'codeform') { e.preventDefault(); lookup($('#codein').value.replace(/\D/g, ''), top().data); }
  if (f.id === 'b-join') {
    e.preventDefault(); buddyErr('');
    const code = $('#b-code').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) { buddyErr('Код має 6 знаків, наприклад K7Q 4ZP.'); return; }
    db.call('join', { code }).then(() => { haptic('success'); buddyCode = ''; if (document.activeElement) document.activeElement.blur(); $('#b-join').hidden = true; loadBuddies(true); toast('Тепер ви разом'); })
      .catch((er) => buddyErr(er.status === 404 ? 'Код не підходить або минуло 24 години.' : er.status === 409 ? 'Це твій власний код, або партнерів уже четверо.' : er.offline ? 'Немає зв’язку.' : 'Не вдалося. Спробуй ще раз.'));
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').hidden) { e.preventDefault(); sheetBack(); } });

db.on(({ status }) => {
  // the records of another phone arrived while this one asks the first questions: no need to ask
  if (!status && st.setup && draft && !draft.edit && profile()) { draft = null; st.setup = false; showMain(true); }
  if (!status) renderAll(); paintSync();
  if (status && waiting && db.status.mode !== 'wait') { waiting = false; start(); }
});
$('#foot').innerHTML = 'Продукти: <a href="https://blsdb.de" target="_blank" rel="noopener">BLS 4.0</a>, Max Rubner-Institut (CC BY 4.0); упаковані продукти й фото: <a href="https://world.openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a> (ODbL, CC BY-SA). Записи зберігаються на телефоні, а в Telegram — ще й на сервері застосунку. Застосунок рахує орієнтовно й не замінює лікаря чи дієтолога.';
// In Telegram, the first visit on a new phone: the records may be on the server already. Wait for them a moment.
let waiting = !profile() && db.synced() && !db.status.at;
function start() { if (profile()) showMain(true); else showSetup(false); }
if (waiting) { $('#view-setup').hidden = false; $('#view-setup').innerHTML = '<p class="loading">Завантажую твої записи…</p>'; setTimeout(() => { if (waiting) { waiting = false; start(); } }, 3000); }
else start();
window.__yizha = { db, st, foods: BUILT };
