// Skins for the laundry drum. Nine are earned in the other games (one of them in December), four are bought with socks.
// A skin is a set of colours for the drum, an optional picture inside the glass and the emoji that flies up on a tap.
import { SCENES } from './data/dialog.js';
import { THEMES } from './data/memory.js';
import { LEVELS } from './hop/levels.js?v=1';

const SOCK = 'M46 26h7v10q0 7-7 7h-6q-4 0-4-4t4-4h6z';
const DOTS = [[50, 22], [74, 36], [74, 64], [50, 78], [26, 64], [26, 36]];

// small helpers for the pictures (all inside the glass: a circle of radius 37 around 50,50)
const dots = (list, fill, r = 1.2) => list.map(([x, y, k]) => `<circle cx="${x}" cy="${y}" r="${k || r}" fill="${fill}"/>`).join('');
const star = (x, y, s, fill) => `<path d="M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28} ${x + s} ${y} ${x + s * 0.28} ${y + s * 0.28} ${x} ${y + s} ${x - s * 0.28} ${y + s * 0.28} ${x - s} ${y} ${x - s * 0.28} ${y - s * 0.28}z" fill="${fill}"/>`;
const flower = (x, y, c) => [0, 90, 180, 270].map((a) => `<ellipse cx="${x}" cy="${y - 2.2}" rx="1.5" ry="2.3" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="1.2" fill="#F2C94C"/>`;
function rhombs() {
  let s = '';
  for (let y = 10, row = 0; y < 92; y += 8, row++) for (let x = row % 2 ? 6 : 10; x < 96; x += 8) s += `<path d="M${x} ${y - 4}l4 4-4 4-4-4z" fill="#1C6EB5"/>`;
  return s;
}
const ticks = () => Array.from({ length: 12 }, (_, k) => `<path d="M50 ${k % 3 ? 15.5 : 14.5}V${k % 3 ? 18.5 : 20.5}" stroke="#282D37" stroke-width="${k % 3 ? 1.2 : 2}" stroke-linecap="round" transform="rotate(${k * 30} 50 50)"/>`).join('');

export const SKINS = [
  { id: 'classic', name: 'Класика', emoji: '', note: 'Звичайна біла пралка.',
    c: { face: 'var(--surface)', edge: 'var(--line)', ring: 'var(--chrome)', glass: 'var(--glass)', dots: 'var(--chrome)', socks: ['#E8C10A', '#C8402C', '#2F5DB3'] } },

  { id: 'karneval', name: 'Карнавал', emoji: '🎉', game: 'art', how: '11 правильних поспіль в «Артиклях»', need: (P) => [P.artStreak, 11],
    note: 'У Рейнланді карнавальний сезон починається 11.11 об 11:11.', glow: 'rgba(200,16,46,.20)',
    c: { face: '#FFFFFF', edge: '#D9D9D9', ring: '#C8102E', glass: '#FFF3C4', dots: '#C8102E', socks: ['#C8102E', '#F2C200', '#1E8E3E'] },
    deco: [[22, 40, '#C8102E', 20], [30, 70, '#1E8E3E', -30], [70, 26, '#2F5DB3', 45], [78, 58, '#F2A900', 10], [56, 82, '#C8102E', -15], [40, 20, '#F2A900', 60], [83, 42, '#1E8E3E', 30], [18, 56, '#2F5DB3', -50]]
      .map(([x, y, f, a]) => `<rect x="${x - 2}" y="${y - 1}" width="4" height="2" rx=".6" fill="${f}" transform="rotate(${a} ${x} ${y})"/>`).join('') + dots([[62, 18], [26, 30], [74, 76], [40, 84], [86, 50]], '#C8102E', 1.1) },

  { id: 'xanten', name: 'Римський Ксантен', emoji: '🏛️', game: 'satz', how: '20 речень у «Збери речення»', need: (P) => [P.satz.length, 20],
    note: 'Поруч із Ксантеном стояло римське місто Colonia Ulpia Traiana.', glow: 'rgba(181,101,29,.20)',
    c: { face: '#EFE6D8', edge: '#CDBFA8', ring: '#B5651D', glass: '#F4E9D3', dots: '#8C4A1C', socks: ['#A0452A', '#C9A227', '#6B4E3D'] },
    deco: '<g fill="none" stroke="#8C4A1C" stroke-width="1.6" opacity=".28" stroke-linecap="round"><path d="M30 46h40L50 34z"/><path d="M34 49v20M42 49v20M50 49v20M58 49v20M66 49v20"/><path d="M28 72h44M24 76h52"/></g>' },

  { id: 'garten', name: 'Квітучий сад', emoji: '🌸', game: 'garten', how: '10 квітів у «Саду слів»', need: (P) => [P.bloom, 10],
    note: 'Слово зацвітає після кількох повторень у різні дні.', glow: 'rgba(76,154,79,.20)',
    c: { face: '#F3F7EE', edge: '#C9D8BE', ring: '#4C9A4F', glass: '#DDEFD5', dots: '#3E7D41', socks: ['#E57399', '#F2C94C', '#9B6BD6'] },
    deco: flower(24, 46, '#E57399') + flower(76, 40, '#9B6BD6') + flower(40, 80, '#F28C28') + flower(66, 78, '#E57399') + flower(50, 18, '#9B6BD6') },

  { id: 'bahnhof', name: 'Вокзал', emoji: '🚆', game: 'zahlen', how: '100 правильних у «Числах на слух»', need: (P) => [P.zahlRight, 100],
    note: 'Як вокзальний годинник: щоб не проґавити поїзд о 7:43.', glow: 'rgba(236,0,22,.14)',
    c: { face: '#FFFFFF', edge: '#D0D4D8', ring: '#EC0016', glass: '#EEF0F2', dots: '#646973', socks: ['#EC0016', '#282D37', '#878C96'] },
    deco: ticks() },

  { id: 'sortierer', name: 'Сортувальник', emoji: '♻️', game: 'sort', how: '25 балів за раунд у «Сортуванні»', need: (P) => [P.sortBest, 25],
    note: 'Жовтий, синій, сірий: як баки біля будинку.', glow: 'rgba(232,193,10,.22)',
    c: { face: '#F6F8F9', edge: '#C7D0D5', ring: '#4A5258', glass: '#E3E9EC', dots: '#4A5258', socks: ['#E8C10A', '#2F5DB3', '#3F6E45'] },
    deco: [['#4A5258', 31], ['#2F5DB3', 45], ['#E8C10A', 59]].map(([f, x]) => `<rect x="${x}" y="74" width="10" height="11" rx="1.5" fill="${f}" opacity=".55"/><rect x="${x - 1}" y="72" width="12" height="2.4" rx="1" fill="${f}" opacity=".7"/>`).join('') },

  { id: 'amt', name: 'Бюрократ', emoji: '📎', game: 'dialog', how: `усі ${SCENES.length} сцен у «Розмові»`, need: (P) => [P.dialog.length, SCENES.length],
    note: 'Formular, Stempel, Termin: тепер не страшно.', glow: 'rgba(122,106,79,.20)',
    c: { face: '#F1E7CF', edge: '#D2C29E', ring: '#7A6A4F', glass: '#FBF6EA', dots: '#7A6A4F', socks: ['#2F5DB3', '#B3261E', '#5E6B3A'] },
    deco: '<g stroke="#7A6A4F" stroke-width="1" opacity=".3"><path d="M24 30h52M24 38h52M24 46h52M24 54h52M24 62h52M24 70h52"/></g><g fill="none" stroke="#B3261E" stroke-width="1.6" opacity=".6"><circle cx="68" cy="68" r="8"/><path d="M64 68l3 3 5-6"/></g>' },

  { id: 'memo', name: 'Пам’ятко', emoji: '🃏', game: 'memory', how: `рекорд на 8 пар у всіх ${THEMES.length} темах «Пам’яті»`, need: (P) => [Object.keys(P.memory || {}).length, THEMES.length],
    note: 'Картки, картки, картки.', glow: 'rgba(126,87,194,.24)',
    c: { face: '#2B2440', edge: '#4A3F6B', ring: '#7E57C2', glass: '#3B3160', dots: '#B39DDB', socks: ['#FFB74D', '#4DD0E1', '#F06292'] },
    deco: [[30, 34, -14], [70, 32, 12], [26, 66, 10], [72, 70, -10]].map(([x, y, a]) => `<rect x="${x - 6}" y="${y - 8}" width="12" height="16" rx="2.5" fill="none" stroke="#B39DDB" stroke-width="1.2" opacity=".5" transform="rotate(${a} ${x} ${y})"/>`).join('') },

  { id: 'mandry', name: 'Мандрівниця', emoji: '🧦', game: 'hop', how: `усі ${LEVELS.length} рівнів «Пригод шкарпетки»`, need: (P) => [Object.keys(P.hop || {}).length, LEVELS.length],
    note: 'Пара знайшлася і тепер крутиться разом.', glow: 'rgba(242,194,48,.26)',
    c: { face: '#FFFFFF', edge: '#E8D9A8', ring: '#2F5DB3', glass: '#CFE6F7', dots: '#2F5DB3', socks: ['#F2C230', '#2F5DB3', '#D6453A'] },
    deco: [[41, 56, -14, 1], [60, 54, 14, -1]].map(([x, y, a, f]) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${f} 1)"><path d="M-5 -14h10v13q0 6-6 6h-8q-5 0-5-5t5-5h4z" fill="#F2C230"/>` +
      '<rect x="-5" y="-10" width="10" height="2.4" fill="#2F5DB3"/><rect x="-5" y="-5.6" width="10" height="2.4" fill="#2F5DB3"/><rect x="-6" y="-16.5" width="12" height="3" rx="1.5" fill="#2F5DB3"/></g>').join('') +
      '<path d="M50 32.5c-2.6-3.6-7.4-1.2-5.6 2.4 1.1 2.1 5.6 5.1 5.6 5.1s4.5-3 5.6-5.1c1.8-3.6-3-6-5.6-2.4z" fill="#D6453A"/>' },

  { id: 'advent', name: 'Різдвяний ярмарок', emoji: '⭐', how: 'Відкривається в грудні', need: (P) => [P.december, 1],
    note: 'Weihnachtsmarkt, Glühwein і запах смажених мигдалів.', glow: 'rgba(242,201,76,.24)',
    c: { face: '#FFFFFF', edge: '#D8C8A8', ring: '#B3261E', glass: '#1F3A2E', dots: '#F2C94C', socks: ['#B3261E', '#F2C94C', '#FFFFFF'] },
    deco: dots([[24, 30, 1.2], [36, 20, 0.9], [62, 22, 1.1], [80, 36, 0.9], [20, 52, 1], [84, 58, 1.2], [30, 76, 1], [52, 84, 0.9], [72, 80, 1.1]], '#FFFFFF') + star(68, 30, 4, '#F2C94C') + star(30, 62, 3, '#F2C94C') },

  { id: 'nacht', name: 'Ніч над Рейном', emoji: '✨', price: 5000, note: 'Місяць над Рейном і тиха пральня.', glow: 'rgba(138,180,248,.22)',
    c: { face: '#1B2433', edge: '#2E3A4F', ring: '#56647A', glass: '#0E1A2E', dots: '#9FB3D1', socks: ['#F2C94C', '#8AB4F8', '#E5EBEE'] },
    deco: '<circle cx="32" cy="30" r="7" fill="#F2E3A0"/><circle cx="35.5" cy="27.5" r="6.2" fill="#0E1A2E"/>' + dots([[60, 20, 0.9], [76, 32, 1.2], [22, 52, 0.8], [80, 60, 0.9], [40, 82, 1], [66, 80, 0.8]], '#E5EBEE') + star(70, 46, 2.6, '#F2E3A0') +
      '<path d="M14 74c10-4 18 4 28 0s18 4 28 0 14 2 18 0V90H14z" fill="#16304F"/>' },

  { id: 'ukraina', name: 'Україна', emoji: '🌻', price: 25000, note: 'Синє небо, жовте поле і вишиванка в барабані.', glow: 'rgba(0,87,183,.20)',
    c: { face: '#FFFFFF', edge: '#D0D8E0', ring: '#0057B7', glass: '#3A7BD5', dots: '#FFFFFF', socks: ['#FFFFFF', '#C8102E', '#1E1E1E'] },
    deco: '<rect x="0" y="50" width="100" height="50" fill="#FFD500"/>' },

  { id: 'oktober', name: 'Октоберфест', emoji: '🥨', price: 150000, note: 'Синьо-білі ромби, як на прапорі Баварії.', glow: 'rgba(28,110,181,.20)',
    c: { face: '#FFFFFF', edge: '#CFE3F5', ring: '#1C6EB5', glass: '#FFFFFF', dots: '#8B5A2B', socks: ['#8B5A2B', '#F2C200', '#2E7D32'] },
    deco: `<g opacity=".85">${rhombs()}</g>` },

  { id: 'gold', name: 'Золота пральня', emoji: '🪙', price: 1000000, note: 'Для тих, хто виправ мільйон.', glow: 'rgba(212,175,55,.32)',
    c: { face: '#3A2E10', edge: '#8A6D1F', ring: '#D4AF37', glass: '#F6E7A8', dots: '#B8901F', socks: ['#D4AF37', '#FFF6D0', '#B8901F'] },
    deco: '<circle cx="50" cy="50" r="30" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2"/>' + star(30, 32, 4, '#FFFFFF') + star(72, 70, 3.2, '#FFFFFF') + star(70, 28, 2.2, '#FFFFFF') },
];
export const SKIN = Object.fromEntries(SKINS.map((s) => [s.id, s]));

// how far a player is towards an earned skin: [now, needed]
export function reach(sk, P) { if (!sk.need) return [1, 1]; const [n, goal] = sk.need(P); return [Math.min(Number(n) || 0, goal), goal]; }
export const reached = (sk, P) => { const [n, goal] = reach(sk, P); return n >= goal; };

export function drumSVG(sk, main) {
  const c = sk.c, clip = `dclip-${sk.id}${main ? '-m' : ''}`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true">` +
    (sk.deco ? `<defs><clipPath id="${clip}"><circle cx="50" cy="50" r="37"/></clipPath></defs>` : '') +
    `<circle cx="50" cy="50" r="48" fill="${c.face}" stroke="${c.edge}" stroke-width="1.5"/>` +
    `<circle cx="50" cy="50" r="41" fill="none" stroke="${c.ring}" stroke-width="6"/>` +
    `<circle cx="50" cy="50" r="37" fill="${c.glass}"/>` +
    (sk.deco ? `<g clip-path="url(#${clip})">${sk.deco}</g>` : '') +
    `<g class="spin"${main ? ' id="spin"' : ''}><g fill="${c.dots}" opacity=".55">${DOTS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>` +
    c.socks.map((f, k) => `<path d="${SOCK}" fill="${f}"${k ? ` transform="rotate(${k * 120} 50 50)"` : ''}/>`).join('') + '</g>' +
    '<path d="M28 30a30 30 0 0 1 16-12" fill="none" stroke="#FFFFFF" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>';
}
