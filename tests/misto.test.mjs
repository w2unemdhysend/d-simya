// «Місто»: the offices' data and «зараз відчинено»; the city's event calendar as the Worker reads it.
//   node tests/misto.test.mjs
import { readFileSync } from 'node:fs';
import { PLACES, CHECKED, openNow } from '../misto/places.js';
import { parseEvents, upcoming, events } from '../worker/events.js';

let fails = 0;
const t = (name, ok, info = '') => { if (!ok) fails++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : info); };

/* ---------- the offices ---------- */
const ids = new Set(PLACES.map((p) => p.id));
t('every office: unique id, names, what for, at least one official link', ids.size === PLACES.length && PLACES.every((p) => p.uk && p.de && p.for && p.links.length && p.links.every(([l, u]) => l && /^https:\/\//.test(u))));
t('the ones a family in Xanten needs most are there', ['buergerbuero', 'standesamt', 'abh', 'zulassung', 'agentur', 'jobcenter'].every((id) => ids.has(id)));
t('hours are written the same way (day or day range, HH:MM–HH:MM)', PLACES.filter((p) => p.hours).every((p) => p.hours.every(([d, h]) => /^(Пн|Вт|Ср|Чт|Пт|Сб|Нд)(–(Пн|Вт|Ср|Чт|Пт|Сб|Нд))?$/.test(d) && (/\d\d:\d\d–\d\d:\d\d/.test(h) || h === 'зачинено'))));
t('phones are German numbers', PLACES.flatMap((p) => p.phone || []).every((n) => /^0\d{3,4} [\d -]+$/.test(n)));
t('the date of the check is set', /^\d{4}-\d{2}-\d{2}$/.test(CHECKED));
const bb = PLACES.find((p) => p.id === 'buergerbuero');
t('Bürgerbüro on Thursday 17:00: open until 18:00', JSON.stringify(openNow(bb, 3, 17 * 60)) === JSON.stringify({ open: true, until: '18:00' }));
t('…on Thursday 12:30: closed (lunch)', openNow(bb, 3, 12 * 60 + 30).open === false);
t('…on Saturday: closed', openNow(bb, 5, 10 * 60).open === false);
t('Kreishaus «Пн–Чт» covers Wednesday 15:00', openNow(PLACES.find((p) => p.id === 'kreis'), 2, 15 * 60).open === true);
t('no hours known: no guess', openNow(PLACES.find((p) => p.id === 'tix'), 2, 600) === null);

/* ---------- the event calendar ---------- */
const html = readFileSync(new URL('./fixtures/xanten-events.html', import.meta.url), 'utf8');
const items = parseEvents(html);
t('a page of the calendar: ten events with titles and links to the city', items.length === 10 && items.every((e) => e.title && e.url.startsWith('https://www.xanten.de/tourismus-freizeit/veranstaltungen/')), JSON.stringify(items.map((e) => e.title)));
const spee = items.find((e) => e.title.startsWith('SONDERAUSSTELLUNG'));
t('an exhibition: a start and an end', spee && spee.range && spee.dates.length === 2 && spee.teaser === 'Ein Leben im 17. Jahrhundert');
const auen = items.find((e) => e.title === 'AuenBlicke');
t('an event on several days: all of them', auen && !auen.range && auen.dates.length === 4);
const weekly = items.find((e) => e.title.startsWith('Offene Führungen'));
t('a weekly tour: no dates, the text instead', weekly && !weekly.dates.length && weekly.when.startsWith('Wöchentlich'));
t('quotes in titles come out as quotes', items.some((e) => e.title.includes('"Detektivbüro Lasse Maja')));
const up = upcoming(items, '2026-11-14');
t('upcoming on 14 November: what is over is gone (a walk on 24 October)', !up.some((e) => e.title.includes('Nachtwächter')) && up.length === 9, up.map((e) => e.title).join(' | '));
t('…each with its next day and time; the several-day one on its 14 November date', up.find((e) => e.title === 'AuenBlicke').next === '2026-11-14' && up.find((e) => e.title === 'AuenBlicke').time === '14:00');
t('…the running exhibition marked as running, the tour as regular', up.find((e) => e === up.find((x) => x.title.startsWith('SONDERAUSSTELLUNG'))).ongoing && up.find((e) => e.title.startsWith('Offene')).regular);
const later = upcoming(items, '2026-11-20');
t('on 20 November: AuenBlicke moves to 12 December', later.find((e) => e.title === 'AuenBlicke').next === '2026-12-12');
let asked = 0;
const d = await events('2026-11-14', async (i) => { asked++; return new Response(i === 0 ? html : '<html></html>'); });
t('the Worker reads the first pages and passes the list on', asked === 6 && d.items.length === 9 && d.source.startsWith('https://www.xanten.de/'));
let threw = false;
try { await events('2026-11-14', async () => new Response('down', { status: 503 })); } catch (e) { threw = true; }
t('the city site down: an error (not an empty list that looks like «nothing on»)', threw);

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
