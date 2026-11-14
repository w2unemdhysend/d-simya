// Finding a food by what a person typed, the same on the page and in the bot's chat (worker/chat.js):
// Ukrainian or German words, any order, beginnings of words («греч» finds «Гречка варена»), with or without accents.
// And reading an amount from a chat line: «гречка 200», «2 яйця», «молоко 250 мл», «борщ тарілка».

export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'ʼ`]/g, '').replace(/ß/g, 'ss');
export const words = (s) => norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

// null when the food does not match the query; the higher, the better the match
export function score(food, q) {
  const qw = words(q); if (!qw.length) return null;
  const qn = norm(q).trim(), name = norm(food.n), ws = words([food.n, food.de, food.al, food.brand].join(' '));
  // a word's beginning, also with another ending (гречки → гречка, яйця → яйце, сиру → сир)
  const hit = (t) => ws.some((w) => w.startsWith(t) || (t.length >= 4 && w.startsWith(t.slice(0, -1))) || (t.length >= 6 && w.startsWith(t.slice(0, -2)))) || (t.length >= 4 && name.includes(t));
  if (!qw.every(hit)) return null;
  const nw = words(food.n), st = qw[0].length >= 4 ? qw[0].slice(0, -1) : qw[0];
  let s = name.startsWith(qn) ? 60 : nw[0] && nw[0].startsWith(st) ? 30 : nw.some((w) => w.startsWith(st)) ? 15 : 0;
  return s - name.length / 40;
}
export function find(foods, q, limit = 40) {
  const out = [];
  for (const f of foods) { const s = score(f, q); if (s != null) out.push([s, f]); }
  return out.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}

// A food as the lists keep it: [id, uk, de, icon, cat, kcal, p, f, c, portions, other names, flags] → an object
export const fromRow = ([id, n, de, ic, cat, kcal, p, f, c, por, al, fl]) => ({ id, n, de, ic, cat, kcal, p, f, c, por, al, l: fl === 'l', src: id.startsWith('ua-') ? 'dish' : 'bls' });

// «гречка 200» → {q: 'гречка', g: 200}; «2 яйця» → {q: 'яйця', count: 2}; «борщ тарілка» → {q: 'борщ', portion: 'тарілка'}
const UNIT = /^(г|гр|g|грам|грами|грамів|мл|ml|л|l|кг|kg)\.?$/i;
export function parseFood(text) {
  const parts = String(text || '').replace(/,(\d)/g, '.$1').trim().split(/\s+/).filter(Boolean);
  let g = null, count = null, liquid = false;
  const rest = [];
  for (let i = 0; i < parts.length; i++) {
    const m = parts[i].match(/^(\d+(?:\.\d+)?)(г|гр|g|мл|ml|л|l|кг|kg)?$/i);
    if (m) {
      const n = Number(m[1]); let unit = m[2] || '';
      if (!unit && parts[i + 1] && UNIT.test(parts[i + 1])) unit = parts[++i];
      unit = unit.toLowerCase();
      if (/^(л|l)/.test(unit)) { g = n * 1000; liquid = true; }
      else if (/^(кг|kg)/.test(unit)) g = n * 1000;
      else if (/^(мл|ml)/.test(unit)) { g = n; liquid = true; }
      else if (unit) g = n;
      else if (n <= 12 && !Number.isNaN(n) && (i === 0 || count == null) && g == null && n % 0.5 === 0 && n < 20) count = n;
      else g = n;
      continue;
    }
    rest.push(parts[i]);
  }
  return { q: rest.join(' '), g: g != null ? Math.round(g) : null, count, liquid };
}
// The portion of a food the line names («тарілка», «скибка»), else null
export function portionNamed(food, q) {
  const qw = words(q);
  return (food.por || []).find(([label]) => words(label).some((w) => qw.some((t) => t.length >= 3 && w.startsWith(t.slice(0, 4))))) || null;
}
