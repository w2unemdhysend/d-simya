// «Місто»: the offices (places.js, checked by hand) and what is on in Xanten (the city's calendar through the Worker).
import { esc, API } from '../assets/site.js';
import { PLACES, CHECKED, openNow } from './places.js';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const tgApp = window.Telegram && window.Telegram.WebApp;
const tg = tgApp && tgApp.platform && tgApp.platform !== 'unknown' ? tgApp : null;
if (tg) { try { tg.ready(); tg.expand(); } catch (e) { /* older Telegram */ } }
const haptic = () => { try { if (tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged(); } catch (e) { /* no haptics */ } };
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };

// the Berlin wall clock: weekday (0 = Monday), minutes since midnight, the day
function berlin(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(now).map((x) => [x.type, x.value]));
  return { wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday), min: Number(p.hour) * 60 + Number(p.minute), day: `${p.year}-${p.month}-${p.day}` };
}
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const dayText = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const shortDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const plus = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10);
const mapUrl = (addr) => 'https://www.openstreetmap.org/search?query=' + encodeURIComponent(addr);
const tel = (p) => 'tel:' + p.replace(/[^\d+]/g, '').replace(/^0/, '+49');

/* ---------- the offices ---------- */
let city = load('misto-city', 'all');
const covers = (d, wd) => { const m = d.match(/^(\S\S)(?:–(\S\S))?$/); if (!m) return false; const a = DAYS.indexOf(m[1]), b = m[2] ? DAYS.indexOf(m[2]) : a; return wd >= a && wd <= b; };
function placeHTML(p, now) {
  const st = openNow(p, now.wd, now.min);
  const state = !st ? '' : st.open ? `<p class="state open">Зараз відчинено, до ${esc(st.until)}</p>` : '<p class="state shut">Зараз зачинено</p>';
  const hours = p.hours ? `<dl class="hours">${p.hours.map(([d, t, n]) => `<dt${covers(d, now.wd) ? ' class="today"' : ''}>${esc(d)}</dt><dd${covers(d, now.wd) ? ' class="today"' : ''}>${esc(t)}${n ? ` <small>· ${esc(n)}</small>` : ''}</dd>`).join('')}</dl>` : '';
  const contact = [p.addr ? `<a href="${esc(mapUrl(p.addr))}" target="_blank" rel="noopener">📍 <span lang="de">${esc(p.addr)}</span></a>` : '',
    p.stop ? `<span>🚏 Зупинка <span lang="de">${esc(p.stop)}</span></span>` : '',
    ...(p.phone || []).map((n) => `<a href="${esc(tel(n))}">📞 ${esc(n)}</a>`),
    p.mail ? `<a href="mailto:${esc(p.mail)}">✉️ ${esc(p.mail)}</a>` : ''].filter(Boolean).join('');
  return `<article class="card place" id="p-${esc(p.id)}" data-city="${esc(p.city)}">
    <div class="hd"><span class="ic" aria-hidden="true">${p.icon}</span><h2>${esc(p.uk)}<span class="de" lang="de">${esc(p.de)}</span></h2></div>
    <p>${esc(p.for)}</p>
    ${state}${hours}
    ${p.book ? `<p class="book">${esc(p.book)}</p>` : ''}
    ${p.tips ? `<ul class="tips">${p.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    ${contact ? `<div class="contact">${contact}</div>` : ''}
    <div class="acts">${p.links.map(([label, url], i) => `<a class="act${i === 0 ? ' primary' : ''}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('')}</div>
  </article>`;
}
function renderPlaces() {
  const now = berlin(), cities = ['Xanten', 'Wesel'], label = { all: 'Усі', Xanten: 'Ксантен', Wesel: 'Везель', more: 'Курси й допомога' };
  const list = PLACES.filter((p) => city === 'all' || (city === 'more' ? !cities.includes(p.city) : p.city === city));
  $('#view-places').innerHTML = `<div class="chips" role="group" aria-label="Де">${Object.entries(label).map(([k, v]) => `<button class="chip" type="button" data-city="${k}" aria-pressed="${city === k}">${v}</button>`).join('')}</div>
    ${list.map((p) => placeHTML(p, now)).join('')}
    <p class="checked">Перевірено на офіційних сайтах ${esc(shortDate(CHECKED))} ${CHECKED.slice(0, 4)} р. Години можуть змінитися: перед візитом глянь сторінку установи.</p>`;
}

/* ---------- what is on ---------- */
let events = null, evState = 'idle';
function eventHTML(e) {
  const when = e.regular ? (e.when || 'регулярно') : e.ongoing ? `триває до ${shortDate(e.dates[1].slice(0, 10))}` : e.range ? `до ${shortDate(e.dates[1].slice(0, 10))}` : '';
  return `<a class="ev" href="${esc(e.url)}" target="_blank" rel="noopener"><span class="tm">${esc(e.time || '')}</span>
    <span><b lang="de">${esc(e.title)}</b>${when ? `<small lang="${e.regular ? 'de' : 'uk'}">${esc(when)}</small>` : ''}${e.teaser ? `<small lang="de">${esc(e.teaser)}</small>` : ''}</span></a>`;
}
function renderEvents() {
  const v = $('#view-events');
  if (evState === 'loading' && !events) { v.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>'; return; }
  if (!events) { v.innerHTML = `<p class="msg err">Не вдалося завантажити події. Перевір інтернет і спробуй ще раз.</p><button class="act" type="button" id="ev-again">Спробувати ще</button>`; return; }
  const today = berlin().day, tomorrow = plus(today, 1);
  // a list kept from an earlier day (offline): what is over is left out
  const live = events.items.filter((e) => (e.range ? e.dates[1].slice(0, 10) >= today : e.regular || e.next >= today));
  const dated = live.filter((e) => !e.regular && !e.ongoing && !(e.range && e.next < today)), lasting = live.filter((e) => e.regular || e.ongoing || (e.range && e.next < today));
  const days = [...new Set(dated.map((e) => e.next))];
  const head = (d) => (d === today ? 'Сьогодні' : d === tomorrow ? 'Завтра' : dayText(d));
  v.innerHTML = (days.length ? days.map((d) => `<section class="card day"><h2>${esc(head(d))}</h2>${dated.filter((e) => e.next === d).sort((a, b) => (a.time || '99') < (b.time || '99') ? -1 : 1).map(eventHTML).join('')}</section>`).join('')
    : '<p class="msg">Найближчими днями в календарі міста подій немає.</p>') +
    (lasting.length ? `<section class="card day"><h2>Тривають зараз і щотижня</h2>${lasting.map(eventHTML).join('')}</section>` : '') +
    `<section class="card"><h2 style="margin:0 0 6px;font-size:16px">Римський парк (LVR-Archäologischer Park)</h2><p class="msg">Свята, римські вихідні, екскурсії й лекції — у програмі парку.</p>
      <div class="acts" style="margin-top:8px"><a class="act" href="https://www.lvr.de/archaeologischer-park-xanten/programm/" target="_blank" rel="noopener">Програма парку</a></div></section>
    <p class="checked">Події з календаря міста Ксантен (<a href="${esc(events.source)}" target="_blank" rel="noopener">xanten.de</a>), назви мовою оригіналу. Подробиці й квитки — на сторінці кожної події.</p>`;
}
async function loadEvents() {
  if (evState === 'loading') return;
  evState = 'loading'; renderEvents();
  try {
    const r = await fetch(API + 'events');
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.error || 'http ' + r.status);
    events = d; evState = 'ok';
  } catch (e) { evState = 'err'; }
  renderEvents();
}

/* ---------- tabs ---------- */
const VIEWS = { places: '#view-places', events: '#view-events' };
let tab = (() => { const t = new URLSearchParams(location.search).get('tab'); return VIEWS[t] ? t : 'places'; })();
function showTab(t, instant) {
  tab = t;
  $$('#tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  if (window.UI) { UI.tabsThumb(instant); UI.switchView(Object.values(VIEWS).map((s) => $(s)), $(VIEWS[t]), { instant }); }
  else Object.entries(VIEWS).forEach(([k, s]) => { $(s).hidden = k !== t; });
  try { history.replaceState(history.state, '', t === 'places' ? location.pathname : '?tab=' + t); } catch (e) { /* file:// */ }
  if (t === 'events' && !events) loadEvents();
}
document.addEventListener('click', (e) => {
  const tb = e.target.closest('#tabs [role="tab"]'); if (tb) { if (tb.dataset.tab !== tab) { showTab(tb.dataset.tab); haptic(); } return; }
  const c = e.target.closest('[data-city]:not(article)'); if (c) { city = c.dataset.city; store('misto-city', city); renderPlaces(); haptic(); return; }
  if (e.target.closest('#ev-again')) { loadEvents(); return; }
  const a = e.target.closest('a[target="_blank"]');
  if (a && tg && tg.openLink) { e.preventDefault(); try { tg.openLink(a.href); } catch (err) { location.href = a.href; } }
});
renderPlaces();
showTab(tab, true);
setInterval(() => { if (tab === 'places' && !document.hidden) renderPlaces(); }, 60000);   // «зараз відчинено» stays true
