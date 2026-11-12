// "Числа на слух": what the voice says and what to type. A fixed bank (every item has a recorded clip), made from
// rules that say numbers the way they are said in Germany: einundzwanzig (one-and-twenty), "zwo" on the phone,
// prices as "drei Euro fünfzig", times both officially (14 Uhr 30) and in everyday speech (halb drei).

const ONES = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
  'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// 0–9999 as one word, as it is written and said: 21 einundzwanzig, 101 hunderteins, 1001 tausendeins
export function word(n) {
  if (n < 20) return ONES[n];
  if (n < 100) { const u = n % 10; return u ? (u === 1 ? 'ein' : ONES[u]) + 'und' + TENS[Math.floor(n / 10)] : TENS[n / 10]; }
  if (n < 1000) { const h = Math.floor(n / 100), r = n % 100; return (h === 1 ? '' : ONES[h]) + 'hundert' + (r ? word(r) : ''); }
  const t = Math.floor(n / 1000), r = n % 1000;
  return (t === 1 ? '' : word(t)) + 'tausend' + (r ? word(r) : '');
}
// a number before a noun: "ein Euro", not "eins Euro"
const before = (n) => (n === 1 ? 'ein' : word(n));
// years: 1989 neunzehnhundertneunundachtzig, 2026 zweitausendsechsundzwanzig
export function year(y) {
  if (y >= 1100 && y < 2000) return word(Math.floor(y / 100)) + 'hundert' + (y % 100 ? word(y % 100) : '');
  return word(y);
}
// day of the month after "am": am ersten, am dritten, am siebten, am zwanzigsten
export function ordinal(d) {
  const special = { 1: 'ersten', 3: 'dritten', 7: 'siebten', 8: 'achten' };
  if (special[d]) return special[d];
  return word(d) + (d < 20 ? 'ten' : 'sten');
}
// phone digits in groups, "zwo" for 2 (on the phone it is not mixed up with "drei")
const digit = (c) => (c === '2' ? 'zwo' : ONES[Number(c)]);
export const phone = (groups) => groups.map((g) => g.split('').map(digit).join(' ')).join(', ');

const pad = (n) => String(n).padStart(2, '0');
// item: say (the words), kind, show (the written form), accept (answers that count, already in the typed form)
const num = (n) => ({ kind: 'zahl', say: word(n), show: String(n), accept: [String(n)] });
const price = (c) => {
  const e = Math.floor(c / 100), ct = c % 100;
  const say = e ? before(e) + ' Euro' + (ct ? ' ' + word(ct) : '') : word(ct) + ' Cent';
  return { kind: 'preis', say, show: `${e},${pad(ct)} €`, accept: [`${e},${pad(ct)}`] };
};
const official = (h, m) => ({ kind: 'zeit', say: word(h) + ' Uhr' + (m ? ' ' + word(m) : ''), show: `${h}:${pad(m)}`, accept: [`${h}:${pad(m)}`] });
// everyday clock talk: the hour said is the next one for "vor", "halb"; both morning and evening count
const SAID = { 15: (h) => `Viertel nach ${hourWord(h)}`, 45: (h) => `Viertel vor ${hourWord(h + 1)}`, 30: (h) => `halb ${hourWord(h + 1)}`,
  10: (h) => `zehn nach ${hourWord(h)}`, 40: (h) => `zwanzig vor ${hourWord(h + 1)}`, 55: (h) => `fünf vor ${hourWord(h + 1)}`,
  35: (h) => `fünf nach halb ${hourWord(h + 1)}`, 25: (h) => `fünf vor halb ${hourWord(h + 1)}`, 5: (h) => `fünf nach ${hourWord(h)}`, 20: (h) => `zwanzig nach ${hourWord(h)}` };
function hourWord(h) { h = h % 12 || 12; return h === 1 ? 'eins' : word(h); }
const casual = (h, m) => {
  const h12 = h % 12 || 12;
  return { kind: 'uhr', say: SAID[m](h12), show: `${h12}:${pad(m)} або ${h12 + 12 === 24 ? 0 : h12 + 12}:${pad(m)}`,
    accept: [`${h12}:${pad(m)}`, `${(h12 + 12) % 24}:${pad(m)}`] };
};
const date = (d, m) => ({ kind: 'datum', say: `am ${ordinal(d)} ${MONTHS[m - 1]}`, show: `${d}.${m}.`, accept: [`${d}.${m}`] });
const yr = (y) => ({ kind: 'jahr', say: year(y), show: String(y), accept: [String(y)] });
const tel = (groups) => ({ kind: 'telefon', say: phone(groups), show: groups.join(' '), accept: [groups.join('')] });

export const KINDS = [
  { id: 'zahl', name: 'Числа', hint: 'Числа до тисячі. Німці кажуть одиниці перед десятками: einundzwanzig = «один і двадцять» = 21.', key: '' },
  { id: 'preis', name: 'Ціни', hint: 'Ціни: «drei Euro fünfzig» = 3,50 €. Центи пиши після коми.', key: ',' },
  { id: 'zeit', name: 'Час', hint: 'Офіційний час, як на вокзалі й у листах: «vierzehn Uhr dreißig» = 14:30.', key: ':' },
  { id: 'uhr', name: 'Час у розмові', hint: '«halb drei» — пів на третю, тобто 2:30. «Viertel vor neun» — за чверть дев’ята, 8:45. Підходить і ранковий, і вечірній час.', key: ':' },
  { id: 'datum', name: 'Дати', hint: 'Дата: «am dritten Oktober» = 3.10. Спершу день, потім крапка й місяць.', key: '.' },
  { id: 'jahr', name: 'Роки', hint: 'Роки до 2000 кажуть сотнями: «neunzehnhundertneunundachtzig» = 1989.', key: '' },
  { id: 'telefon', name: 'Телефон', hint: 'Номери диктують по цифрі. Замість «zwei» часто кажуть «zwo», щоб не сплутати з «drei».', key: '' },
];

export const ITEMS = [
  ...[13, 17, 21, 24, 27, 32, 35, 38, 43, 46, 49, 54, 57, 61, 66, 68, 72, 75, 79, 83, 86, 91, 95, 98, 101, 115, 250, 368, 499, 777].map(num),
  ...[99, 149, 229, 350, 499, 795, 1280, 1999, 2390, 4900, 6300, 120, 575, 840, 1425, 3670, 8995, 12900, 25, 8, 205, 909, 1550, 2730, 9999].map(price),
  ...[[7, 15], [14, 30], [8, 0], [19, 45], [16, 10], [23, 0], [12, 0], [20, 5], [9, 40], [11, 55], [6, 20], [17, 33], [21, 12]].map(([h, m]) => official(h, m)),
  ...[[8, 15], [8, 45], [2, 30], [6, 30], [4, 10], [10, 40], [11, 55], [9, 35], [7, 25], [12, 15], [11, 30], [3, 5], [5, 20]].map(([h, m]) => casual(h, m)),
  ...[[1, 1], [3, 10], [11, 11], [24, 12], [7, 3], [22, 6], [31, 8], [8, 5], [15, 2], [12, 9], [19, 4], [30, 7], [6, 1], [2, 11], [26, 12]].map(([d, m]) => date(d, m)),
  ...[1989, 1990, 2005, 2022, 2026, 1945, 1871, 1999, 2014, 2030].map(yr),
  ...[['02801', '7100'], ['116', '117'], ['0281', '2030'], ['0176', '238', '4591'], ['02801', '77', '23'], ['0151', '629', '3348'],
      ['0228', '19240'], ['0800', '111', '0111'], ['0203', '52', '82'], ['0157', '4402', '61']].map(tel),
];

// What was typed → the form an answer is compared in (spaces gone, "3,5" as "3,50", "08:15" as "8:15", "3.10." as "3.10")
export function normal(kind, typed) {
  let t = String(typed).replace(/\s+/g, '');
  if (kind === 'preis') { const [e, c = '0'] = t.split(','); return `${Number(e || 0)},${(c + '00').slice(0, 2)}`; }
  if (kind === 'zeit' || kind === 'uhr') { const [h, m = '0'] = t.split(':'); return `${Number(h)}:${pad(Number(m))}`; }
  if (kind === 'datum') { const [d, m] = t.replace(/\.$/, '').split('.'); return `${Number(d)}.${Number(m)}`; }
  if (kind === 'telefon') return t.replace(/\D/g, '');
  return String(Number(t));
}
export const isRight = (item, typed) => item.accept.includes(normal(item.kind, typed));
