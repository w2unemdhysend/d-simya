// What is on in Xanten: the city's own event calendar (xanten.de, «Veranstaltungen»), read from its pages and passed
// on as a short list — the title, the dates, a line about it and the link to the city's page, which has the rest.
// The pages list the next twelve months, ten events a page; the first pages (the coming weeks) are enough here.
// Public information of the city; the app shows where it comes from and links every event back to it.
export const SOURCE = 'https://www.xanten.de/tourismus-freizeit/veranstaltungen';
const PAGES = 6;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', ndash: '–', mdash: '—', bdquo: '„', ldquo: '“', rdquo: '”' };
const text = (html) => String(html || '').replace(/<[^>]+>/g, ' ')
  .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (all, e) => (e[0] === '#' ? String.fromCodePoint(parseInt(e[1] === 'x' || e[1] === 'X' ? e.slice(2) : e.slice(1), e[1] === 'x' || e[1] === 'X' ? 16 : 10) || 32) : ENT[e] || all))
  .replace(/\s+/g, ' ').trim();
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

// One page of the calendar → [{title, url, teaser, dates: ['2026-11-14' or '2026-11-14T17:00:00+01:00', …], range, when}]
// range: the dates are a start and an end (an exhibition), not single days; when: a text instead of dates ("Wöchentlich …")
export function parseEvents(html) {
  const out = [];
  const re = /<h3>\s*<a href="(\/tourismus-freizeit\/veranstaltungen\/[^"#?]+)">([\s\S]*?)<\/a>\s*<\/h3>([\s\S]*?)<\/div>/g;
  for (let m; (m = re.exec(html));) {
    const [, href, inner, rest] = m;
    // the dates are in <span class="datetime"> (one, a range, or several days), the title after it
    const dt = inner.match(/<span class="datetime">([\s\S]*?)<\/span>/), head = dt ? dt[1] : '';
    const dates = [...head.matchAll(/<time datetime="([^"]+)"/g)].map((x) => x[1]).filter((d) => /^\d{4}-\d{2}-\d{2}/.test(d));
    const title = text(dt ? inner.replace(dt[0], ' ') : inner);
    if (!title) continue;
    out.push({ title: clip(title, 140), url: 'https://www.xanten.de' + href, teaser: clip(text(rest), 220), dates: dates.slice(0, 40),
      range: dates.length === 2 && / bis /.test(text(head)), when: dates.length ? '' : clip(text(head), 100) });
  }
  return out;
}

// The events still to come (or running) from `today` on, soonest first; each with `next`: its next day
export function upcoming(items, today) {
  const seen = new Set(), out = [];
  for (const e of items) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    const days = e.dates.map((d) => d.slice(0, 10));
    let next;
    if (e.range) next = days[1] >= today ? (days[0] > today ? days[0] : today) : null;
    else if (days.length) next = days.find((d) => d >= today) || null;
    else next = today;   // "weekly on Saturday and Sunday": always on
    if (!next) continue;
    const time = e.range ? '' : (e.dates.find((d) => d.startsWith(next)) || '').slice(11, 16);
    out.push({ ...e, next, time, ongoing: e.range && days[0] < today, regular: !days.length });
  }
  return out.sort((a, b) => (a.next < b.next ? -1 : a.next > b.next ? 1 : (a.regular || a.ongoing ? 1 : 0) - (b.regular || b.ongoing ? 1 : 0)));
}

export async function events(today, fetchPage = (i) => fetch(`${SOURCE}?page=${i}`, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; D-SIMYA family app)', 'Accept-Language': 'de' } })) {
  const pages = await Promise.all(Array.from({ length: PAGES }, async (_, i) => {
    const res = await fetchPage(i);
    if (!res.ok) { if (i === 0) throw new Error('xanten.de ' + res.status); return ''; }
    return res.text();
  }));
  const items = upcoming(pages.flatMap(parseEvents), today);
  if (!items.length && !pages[0].includes('<h3>')) throw new Error('xanten.de: no calendar on the page');
  return { source: SOURCE, today, items: items.slice(0, 60) };
}
