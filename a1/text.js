// Text helpers of the A1 course, without the page (tests/a1.test.mjs uses them too): the marks in the chapters
// (**bold**, `German`), how a typed answer is compared, how the dictionary search folds letters.
export const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<i lang="de">$1</i>');
// a typed answer: case, ß/ss, curly apostrophes, a full stop at the end and extra spaces do not matter
export const norm = (s) => String(s).normalize('NFC').trim().toLowerCase().replace(/ß/g, 'ss').replace(/[’‘`´]/g, "'").replace(/[.!?,;]+$/, '').replace(/\s+/g, ' ');
// the search: ä = a, ö = o, ü = u, ß = ss, apostrophes ignored, so "tschuss" finds Tschüss and "пам'ять" finds пам’ять
export const fold = (s) => String(s).normalize('NFC').toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/[’'ʼ]/g, '');
// the grammar index groups the topics by these kinds
export const CATS = { laut: 'Вимова й письмо', verb: 'Дієслова й часи', noun: 'Іменник, артикль, відмінки', pron: 'Займенники', prep: 'Прийменники', satz: 'Будова речення', zeit: 'Числа, час, дати', rede: 'Розмовні теми' };
// The order the options of a choice exercise are shown in. Written down, the right one is mostly second; shown, it
// stands first, second or third about equally often, the same way on every visit and phone (the place comes from the
// chapter and the exercise number). The wrong ones keep their order; articles keep theirs (der, die, das).
const ARTICLES = /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer|kein|keine|keinen|keinem)$/i;
export function order(n, i, opts, right) {
  const idx = opts.map((o, j) => j);
  if (opts.every((o) => ARTICLES.test(String(o).trim()))) return idx;
  let x = Math.imul((n * 64 + i) ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; x = (x ^ (x >>> 16)) >>> 0;
  const rest = idx.filter((j) => j !== right);
  rest.splice(x % opts.length, 0, right);
  return rest;
}
