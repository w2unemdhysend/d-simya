// Who speaks in the course's dialogues: a name for the chat, a role, and a small drawn avatar (flat shapes in an SVG,
// no pictures). A dialogue line names its speaker with the key used here ("Anna", "Lehrerin", the hero "Taras" or
// "Lessja"); the hero writes on the right, everyone else on the left. Taras Schewtschenko and Lessja Ukrajinka are the
// real poets; that they live in Xanten today and learn German is an imagined story (the course says so).

// shapes of a face, drawn in a 40×40 box: the shoulders, the head, hair, a hat, glasses, a moustache
const SKIN = { light: '#F3D2B8', warm: '#E8B996', tan: '#C98F6A', deep: '#8C5A3C' };
function face(o) {
  const s = SKIN[o.skin || 'light'], hair = o.hair || '#3A2A20', p = [];
  p.push(`<circle cx="20" cy="20" r="20" fill="${o.bg}"/>`);
  if (o.long) p.push(`<path d="M9.5 18c0-8 4.6-12.5 10.5-12.5S30.5 10 30.5 18v12h-21z" fill="${hair}"/>`);   // long hair behind the head
  // the body: a top with its collar
  p.push(`<path d="M5 40c1.2-7.6 7-11.6 15-11.6S33.8 32.4 35 40z" fill="${o.top}"/>`);
  if (o.collar) p.push(o.collar);
  p.push(`<rect x="17" y="23" width="6" height="6.5" rx="2" fill="${s}"/>`);
  p.push(`<ellipse cx="20" cy="17.5" rx="7.4" ry="8.4" fill="${s}"/>`);
  if (o.hairTop) p.push(o.hairTop.replaceAll('H', hair));
  p.push(`<circle cx="17.1" cy="17.6" r="0.95" fill="#1E1A18"/><circle cx="22.9" cy="17.6" r="0.95" fill="#1E1A18"/>`);
  if (o.brows !== false) p.push(`<path d="M15.6 15.4q1.5-.9 3 0M21.4 15.4q1.5-.9 3 0" stroke="${o.browC || hair}" stroke-width=".9" fill="none" stroke-linecap="round"/>`);
  if (o.glasses) p.push(`<g fill="none" stroke="#2A2A30" stroke-width=".9"><circle cx="17.1" cy="17.7" r="2.3"/><circle cx="22.9" cy="17.7" r="2.3"/><path d="M19.4 17.6h1.2"/></g>`);
  if (o.moustache) p.push(`<path d="M15.2 22.6c1.6-1.6 3.3-1.6 4.8-.6 1.5-1 3.2-1 4.8.6-.4 1.6-1.4 2.6-2.2 2.9-.9-1-1.7-1.2-2.6-.6-.9-.6-1.7-.4-2.6.6-.8-.3-1.8-1.3-2.2-2.9z" fill="${o.moustache}"/>`);
  else if (o.beard) p.push(`<path d="M13 19.5c.4 5.4 3.2 8.6 7 8.6s6.6-3.2 7-8.6c-1.2 2.6-3.4 3.6-7 3.6s-5.8-1-7-3.6z" fill="${o.beard}"/>`);
  else p.push(`<path d="M17.6 22.6q2.4 1.6 4.8 0" stroke="#8A4A3A" stroke-width=".9" fill="none" stroke-linecap="round"/>`);
  if (o.hat) p.push(o.hat);
  if (o.extra) p.push(o.extra);
  return p.join('');
}

// hairstyles and other details (H is the hair colour)
const H = {
  short: '<path d="M12.6 16.5c-.6-6.4 3-10 7.4-10s8 3.6 7.4 10c-1.2-3.4-3.8-4.8-7.4-4.8s-6.2 1.4-7.4 4.8z" fill="H"/>',
  side: '<path d="M12.6 17c-.8-6.6 3.2-10.4 7.8-10.2 4.6.2 7.6 3.8 7 10.2-1-3.8-4-5.6-8.6-4.6-2.6.6-4.8 2-6.2 4.6z" fill="H"/>',
  bald: '<path d="M12.6 19.5c-.5-2.6-.2-4.6.8-6.2.4 2 .8 3.6 1 5.2zM27.4 19.5c.5-2.6.2-4.6-.8-6.2-.4 2-.8 3.6-1 5.2z" fill="H"/>',
  parted: '<path d="M12.4 19c-.6-7.2 3.4-11 7.6-11s8.2 3.8 7.6 11c-.6-2.6-1.8-5-3.6-6.4L20 9.4l-4 3.2c-1.8 1.4-3 3.8-3.6 6.4z" fill="H"/>',
  bun: '<circle cx="20" cy="6.4" r="3.4" fill="H"/><path d="M12.6 17c-.6-6.2 3-9.6 7.4-9.6s8 3.4 7.4 9.6c-1.4-3.4-4-4.6-7.4-4.6s-6 1.2-7.4 4.6z" fill="H"/>',
  pony: '<path d="M27 10.5c4.4 1.6 5.6 7 3.6 12.4-.4-4-1.8-7-4.4-8.4z" fill="H"/><path d="M12.6 17c-.6-6.4 3-10 7.4-10s8 3.6 7.4 10c-2-3.6-4.4-4.8-7.6-4.6-3 .2-5.8 1.4-7.2 4.6z" fill="H"/>',
  bob: '<path d="M11.6 22c-1.2-9 2.6-14 8.4-14s9.6 5 8.4 14c-.8-1-1.2-3-1.4-5.4-2.2-.8-4.6-2.4-6-4.6-1.6 2.4-4.6 4-8 4.6-.2 2.4-.6 4.4-1.4 5.4z" fill="H"/>',
  curly: '<g fill="H"><circle cx="14" cy="11.8" r="3"/><circle cx="18" cy="9.2" r="3.2"/><circle cx="22.4" cy="9.2" r="3.2"/><circle cx="26.2" cy="12" r="3"/><circle cx="12.8" cy="15.6" r="2.4"/><circle cx="27.2" cy="15.6" r="2.4"/></g>',
};

const PEOPLE = {
  // the heroes
  Taras: {
    uk: 'Тарас Шевченко', de: 'Taras', role: 'поет і художник', hero: 'm',
    av: { bg: '#E7D9C4', skin: 'light', hair: '#5A4A3E', hairTop: H.bald, moustache: '#4E3E32', top: '#5C4632', browC: '#4E3E32',
      collar: '<path d="M10 33.5c3.6-2.6 6.8-3.4 10-3.4s6.4.8 10 3.4l-2 3.6c-2.6-1.6-5.2-2.2-8-2.2s-5.4.6-8 2.2z" fill="#D8CBB8"/>',
      // a tall sheepskin hat (смушева шапка)
      hat: '<path d="M11.8 12.2l.7-7.6c2.3-1.3 4.8-1.9 7.5-1.9s5.2.6 7.5 1.9l.7 7.6c-2.6-.9-5.2-1.3-8.2-1.3s-5.6.4-8.2 1.3z" fill="#5E534A"/><g fill="#76695E"><circle cx="14.6" cy="6.4" r=".9"/><circle cx="17.8" cy="5.2" r=".9"/><circle cx="21.2" cy="5.2" r=".9"/><circle cx="24.6" cy="6.2" r=".9"/><circle cx="13.8" cy="9.6" r=".9"/><circle cx="16.8" cy="8.4" r=".9"/><circle cx="20.2" cy="8.2" r=".9"/><circle cx="23.4" cy="8.6" r=".9"/><circle cx="26.2" cy="9.8" r=".9"/></g>' },
  },
  Lessja: {
    uk: 'Леся Українка', de: 'Lessja', role: 'поетка й перекладачка', hero: 'f',
    av: { bg: '#E3E6F2', skin: 'light', hair: '#2E221C', hairTop: H.parted, long: true, top: '#F6F2EA',
      collar: '<path d="M14.6 29.4l5.4 4.2 5.4-4.2" fill="none" stroke="#C0392B" stroke-width="1.4"/><g fill="#C0392B"><circle cx="15.4" cy="33.6" r=".8"/><circle cx="17.6" cy="34.8" r=".8"/><circle cx="20" cy="35.3" r=".8"/><circle cx="22.4" cy="34.8" r=".8"/><circle cx="24.6" cy="33.6" r=".8"/></g>' },
  },
  // people of the imagined story in Xanten
  Anna: { uk: 'Анна', de: 'Anna', role: 'подруга з курсу', av: { bg: '#DDEFD6', hair: '#D9A441', hairTop: H.pony, top: '#3E8E5A' } },
  Max: { uk: 'Макс', de: 'Max', role: 'одногрупник, кухар', av: { bg: '#D9E7F6', skin: 'warm', hair: '#5A3A24', hairTop: H.side, top: '#2F5DB3', beard: '#6A4A34' } },
  Lehrerin: { uk: 'Забіне Крюґер', de: 'Frau Krüger', role: 'викладачка курсу', av: { bg: '#E0EEF0', hair: '#B7B2AC', hairTop: H.bob, top: '#2E8A8A', glasses: true } },
  Kellner: { uk: 'Офіціант', de: 'Kellner', role: 'кав’ярня', av: { bg: '#EFE6D8', skin: 'tan', hair: '#1E1A18', hairTop: H.side, top: '#F4F4F2',
    collar: '<path d="M16.6 31.6l3.4 1.6 3.4-1.6v3.2l-3.4-1.6-3.4 1.6z" fill="#1E1A18"/><path d="M6.4 40c.6-3 1.6-5.2 3.4-6.8l3.2 6.8zM33.6 40c-.6-3-1.6-5.2-3.4-6.8l-3.2 6.8z" fill="#2A2A2E"/>' } },
  Friseurin: { uk: 'Перукарка', de: 'Salon Schneider', role: 'дзвінок до перукарні', av: { bg: '#F4E1EC', hair: '#9A4A8E', hairTop: H.bob, top: '#2A2A2E' } },
  Verkäuferin: { uk: 'Продавчиня', de: 'Verkäuferin', role: 'ринок', av: { bg: '#F3EAD2', skin: 'warm', hair: '#6A3A22', hairTop: H.curly, top: '#C0563A',
    collar: '<path d="M13 40v-7.4c2.2-1.2 4.6-1.8 7-1.8s4.8.6 7 1.8V40z" fill="#3E8E5A"/>' } },
  Vermieterin: { uk: 'Орендодавиця', de: 'Vermieterin', role: 'перегляд квартири', av: { bg: '#ECE3F2', hair: '#D4D0CC', hairTop: H.bun, top: '#7A4E9A', glasses: true } },
  'Ärztin': { uk: 'Лікарка Шмідт', de: 'Frau Dr. Schmidt', role: 'сімейна лікарка', av: { bg: '#DFF0EE', skin: 'tan', hair: '#2A1E18', hairTop: H.bun, top: '#F7F8F8',
    collar: '<path d="M15.4 30.4c-.6 3.6.6 6 2.6 6.4M24.6 30.4c.6 3.6-.6 6-2.6 6.4" fill="none" stroke="#3A4650" stroke-width="1"/><circle cx="20" cy="37" r="1.3" fill="#9AA6AD"/>' } },
  Mann: { uk: 'Перехожий', de: 'Passant', role: 'на вулиці', av: { bg: '#E6E6E2', skin: 'warm', hair: '#7A6A5A', hairTop: H.short, top: '#5E6A72', beard: '#8A7A6A',
    hat: '<path d="M11.8 12.6c.6-4.6 3.8-6.8 8.2-6.8s7.6 2.2 8.4 6.4c1.6.4 2.6 1 3 1.8-5-1.2-13.6-1.6-19.6-1.4z" fill="#4A4E54"/>' } },
  Chefin: { uk: 'Керівниця', de: 'Chefin', role: 'перший день на роботі', av: { bg: '#E2E8F2', hair: '#9A4A2A', hairTop: H.bob, top: '#26345A',
    collar: '<path d="M16 29.4l4 5 4-5" fill="#F4F4F2"/>' } },
  'Verkäufer': { uk: 'Продавець', de: 'Verkäufer', role: 'магазин одягу', av: { bg: '#F2E2E0', skin: 'deep', hair: '#1A1412', hairTop: H.curly, top: '#C0392B',
    extra: '<rect x="23" y="33" width="5" height="2.6" rx=".6" fill="#F4F4F2"/>' } },
  // A2
  Apothekerin: { uk: 'Фармацевтка', de: 'Apothekerin', role: 'аптека', av: { bg: '#E2F2E6', skin: 'warm', hair: '#4A2E1E', hairTop: H.bun, top: '#F7F8F8',
    collar: '<path d="M16.4 29.4l3.6 4.4 3.6-4.4" fill="none" stroke="#C9D2D6" stroke-width="1"/>',
    extra: '<path d="M25.4 33.4h1.5v-1.5h1.3v1.5h1.5v1.3h-1.5v1.5h-1.3v-1.5h-1.5z" fill="#2E9A5A"/>' } },   // a green pharmacy cross on the coat
  Bahnmitarbeiter: { uk: 'Працівник залізниці', de: 'Bahnmitarbeiter', role: 'каса на вокзалі', av: { bg: '#F4E2E2', skin: 'tan', hair: '#2A2420', hairTop: H.short, top: '#C0182A',
    collar: '<path d="M16.6 29.6l3.4 3 3.4-3v2.2l-3.4 3-3.4-3z" fill="#F4F4F2"/>',
    hat: '<path d="M12.4 13.2c.5-4.6 3.6-7 7.6-7s7.1 2.4 7.6 7z" fill="#26345A"/><path d="M11.2 12.8h17.6v1.8H11.2z" fill="#1A2440"/><rect x="18.6" y="8.6" width="2.8" height="1.8" rx=".4" fill="#C0182A"/>' } },   // a uniform cap
  Sachbearbeiter: { uk: 'Працівник бюро', de: 'Bürgerbüro', role: 'бюро громадян', av: { bg: '#E6E9EE', skin: 'light', hair: '#A8A29C', hairTop: H.side, top: '#4A5562', glasses: true,
    collar: '<path d="M16.2 29.4l3.8 3.8 3.8-3.8" fill="#F4F4F2"/><path d="M19.2 32.6h1.6l.6 6.4-1.4 1-1.4-1z" fill="#8A2E3A"/>' } },   // shirt and tie
  Nachbarin: { uk: 'Пані Бекер', de: 'Frau Becker', role: 'сусідка', av: { bg: '#F4ECD8', skin: 'light', hair: '#C9C2B8', hairTop: H.curly, top: '#5E8C6A',
    collar: '<path d="M14.2 30.2c3.6 2.6 8 2.6 11.6 0" fill="none" stroke="#E8DCC4" stroke-width="1.6"/>' } },
  Prüferin: { uk: 'Екзаменаторка', de: 'Prüferin', role: 'усний іспит A2', av: { bg: '#E4E2F2', skin: 'tan', hair: '#2A1E18', hairTop: H.bob, top: '#3A3F6E', glasses: true,
    collar: '<path d="M16.4 29.6l3.6 3.4 3.6-3.4" fill="#F4F4F2"/>', extra: '<rect x="24.2" y="32.4" width="4.6" height="3" rx=".5" fill="#F4F4F2"/>' } },   // a name badge
};

// a person by the key a dialogue line uses ("" is a pause in the story)
export function person(key) {
  return PEOPLE[key] || { uk: key, de: key, role: '', av: { bg: '#E6E6E2', hair: '#6A5A4A', hairTop: H.short, top: '#7A858C' } };
}
export const isHero = (key) => !!(PEOPLE[key] && PEOPLE[key].hero);
export function avatar(key, size = 36) {
  const p = person(key);
  return `<svg class="ava" viewBox="4.5 2.6 31 31" width="${size}" height="${size}" aria-hidden="true">${face(p.av)}</svg>`;   // round by CSS (clip-path)
}
export const KEYS = Object.keys(PEOPLE);
