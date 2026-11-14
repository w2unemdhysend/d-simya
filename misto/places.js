// The offices a family in Xanten deals with, in Xanten and in Wesel (the district's seat): what each is for, where it
// is, when it is open and how to get an appointment. Every entry was checked on the office's own website on CHECKED;
// hours change, so each card links to that page. Where a fact could not be checked, the card says so instead of guessing.
export const CHECKED = '2026-11-14';

// hours: [[days, times, note]]; book: how to get an appointment; links: [[label, url]]
export const PLACES = [
  { id: 'buergerbuero', city: 'Xanten', icon: '🏛', uk: 'Бюро громадян у ратуші', de: 'Bürgerservicebüro (Rathaus)',
    for: 'Реєстрація й зміна адреси (Anmeldung, Ummeldung), паспорт і ID-картка, Meldebescheinigung, водійське посвідчення, довідка про несудимість, звільнення від Rundfunkbeitrag, посвідчення інваліда, мішки для сміття й великогабаритні відходи.',
    addr: 'Karthaus 2, 46509 Xanten', phone: ['02801 772-350'], mail: 'buergerservice@xanten.de',
    hours: [['Пн', '08:00–12:00, 13:00–16:00', 'за записом'], ['Вт', '08:00–12:00', 'без запису'], ['Ср', '08:00–12:00', 'за записом'], ['Чт', '08:00–12:00, 13:00–18:00', 'за записом'], ['Пт', '08:00–12:00', 'за записом']],
    book: 'Запис онлайн або телефоном у години роботи. У вівторок зранку — без запису.',
    tips: ['Готові паспорт, ID-картку, Duldung чи Aufenthaltsgestattung можна забрати без запису в години роботи.',
      'Duldung, Aufenthaltsgestattung чи Fiktionsbescheinigung для продовження можна здати тут: їх передадуть до Ausländerbehörde.'],
    links: [['Записатися онлайн', 'https://tevis.krzn.de/tevisweb190/'], ['Сторінка бюро', 'https://www.xanten.de/rathaus-buergerservice/rathaus-politik/rathaus-verwaltung/buergerservicebuero']] },
  { id: 'standesamt', city: 'Xanten', icon: '💍', uk: 'РАЦС', de: 'Standesamt',
    for: 'Народження, шлюб, смерть: реєстрація й свідоцтва (Urkunden).',
    addr: 'Karthaus 2, 46509 Xanten', phone: ['02801 772-345'], mail: 'standesamt@xanten.de',
    hours: [['Пн', '09:00–12:00'], ['Ср', '09:00–12:00'], ['Чт', '09:00–12:00']],
    book: 'Інший час — за домовленістю телефоном.',
    links: [['Сторінка РАЦС', 'https://www.xanten.de/rathaus-buergerservice/rathaus-politik/rathaus-verwaltung/standesamt']] },
  { id: 'soziales', city: 'Xanten', icon: '🤝', uk: 'Соціальний відділ міста', de: 'Fachbereich 5 – Soziales und Beratung',
    for: 'Житлова допомога (Wohngeld), Grundsicherung для старших і непрацездатних (SGB XII), виплати за AsylbLG; консультації з догляду (також удома).',
    addr: 'Karthaus 2, 46509 Xanten', phone: ['02801 772-0'], mail: 'post@xanten.de',
    hours: [['Пн', '09:00–11:00'], ['Вт', '09:00–11:00'], ['Чт', '09:00–11:00']],
    book: 'Інший час — за домовленістю. Місто просить заздалегідь домовитися з потрібним працівником (список — на сайті міста, «Mitarbeitende»).',
    links: [['Сторінка відділу', 'https://www.xanten.de/rathaus-buergerservice/rathaus-politik/rathaus-verwaltung/organisation/fachbereich/26'], ['Працівники й телефони', 'https://www.xanten.de/rathaus-buergerservice/rathaus-politik/rathaus-verwaltung/mitarbeitende']] },
  { id: 'buecherei', city: 'Xanten', icon: '📚', uk: 'Міська бібліотека', de: 'Stadtbücherei Xanten',
    for: 'Книжки, DVD, електронні книжки й аудіокниги (Onleihe), мовні курси онлайн, читання для дітей.',
    addr: null, phone: ['02801 772-340'], mail: 'stadtbuecherei@xanten.de',
    hours: [['Пн', 'зачинено'], ['Вт', '14:00–17:00'], ['Ср', '09:00–13:00, 14:00–17:00'], ['Чт', '14:00–17:00'], ['Пт', '14:00–17:00'], ['Сб', '09:00–13:00']],
    book: 'Без запису.',
    links: [['Сторінка бібліотеки', 'https://www.xanten.de/rathaus-buergerservice/gesellschaft/stadtbuecherei'], ['Onleihe', 'https://www.xanten.de/rathaus-buergerservice/gesellschaft/stadtbuecherei/onleihe']] },
  { id: 'tix', city: 'Xanten', icon: 'ℹ️', uk: 'Туристична інформація', de: 'Tourist Information Xanten (TIX)',
    for: 'Квитки на події й екскурсії, карти, поради, що подивитися в місті.',
    addr: 'Kurfürstenstraße 9, 46509 Xanten', phone: ['02801 772-200'], mail: 'info@xanten.de',
    hours: null, book: 'Години роботи — на сайті TIX.',
    links: [['Події в Ксантені', 'https://www.xanten.de/tourismus-freizeit/veranstaltungen']] },

  { id: 'abh', city: 'Wesel', icon: '🛂', uk: 'Відомство у справах іноземців (для Ксантена)', de: 'Ausländerbehörde Kreis Wesel (Kreishaus)',
    for: 'Дозвіл на проживання, §24 для українців, Fiktionsbescheinigung, проїзні документи, громадянство. Відповідає за Ксантен (Wesel, Moers і Dinslaken мають свої).',
    addr: 'Reeser Landstraße 31, 46483 Wesel', stop: 'Kreishaus (автобуси 63, 64, 84 від вокзалу Wesel)', phone: ['0281 207-0'], mail: 'abh@kreis-wesel.de',
    hours: [['Вт', '08:30–12:00, 14:00–16:00', 'лише забрати документи'], ['Чт', '08:30–12:00, 14:00–16:00', 'лише забрати документи']],
    book: 'Особистий прийом — тільки за записом онлайн. Телефон: пн–чт 08:30–12:00 і 14:00–16:00, пт 08:30–12:30 (через ServiceCenter).',
    tips: ['Duldung, Aufenthaltsgestattung чи Fiktionsbescheinigung для продовження можна здати в бюро громадян у Ксантені, надіслати поштою або вкинути в поштову скриньку Kreisverwaltung із телефоном чи e-mail.',
      'Відомство дуже завантажене: на e-mail відповідають довго, повторні листи лише затримують відповідь.',
      'Для громадянства (Einbürgerung): ebh@kreis-wesel.de.'],
    links: [['Записатися онлайн', 'https://tevis.krzn.de/tevisweb080/select2?md=14'], ['Онлайн-заяви', 'https://www.kreis-wesel.de/leben-arbeiten/ein-auswanderung/auslaenderbehoerde-kreis-wesel/auslaenderbehoerde-online-antraege'], ['Сторінка відомства', 'https://www.kreis-wesel.de/leben-arbeiten/ein-auswanderung/auslaenderbehoerde-kreis-wesel']] },
  { id: 'zulassung', city: 'Wesel', icon: '🚗', uk: 'Реєстрація авто й водійські права', de: 'Zulassungs- und Führerscheinservice Wesel',
    for: 'Реєстрація й зняття авто з обліку, номери, обмін іноземного водійського посвідчення, нові права.',
    addr: 'Kreisverwaltung Wesel, біля Reeser Landstraße 31, 46483 Wesel', stop: 'Kreishaus', phone: ['0281 207-0'],
    hours: [['Пн', '07:30–16:30'], ['Вт', '07:30–11:00 без запису, 14:00–16:30'], ['Ср', '07:30–12:30'], ['Чт', '07:30–11:00 без запису, 14:00–16:30'], ['Пт', '07:30–12:30']],
    book: 'Поза вільними годинами (вт і чт 07:30–11:00, лише для приватних осіб) — тільки за записом онлайн. Те саме є в Moers (Dienstleistungszentrum).',
    links: [['Записатися онлайн', 'https://tevis.krzn.de/tevisweb080/'], ['Сторінка служби', 'https://www.kreis-wesel.de/leben-arbeiten/strassenverkehr-oepnv/zulassungs-und-fuehrerscheinservice']] },
  { id: 'kreis', city: 'Wesel', icon: '🏢', uk: 'Районна адміністрація', de: 'Kreisverwaltung Wesel (Kreishaus)',
    for: 'Служби району: Jugendamt, Gesundheitsamt, BAföG, допомога з догляду й інвалідністю, будівництво та інше.',
    addr: 'Reeser Landstraße 31, 46483 Wesel', stop: 'Kreishaus', phone: ['0281 207-0'],
    hours: [['Пн–Чт', '08:30–12:00, 14:00–16:00'], ['Пт', '08:30–12:30']],
    book: 'Особисто — лише після запису у відповідній службі; багато питань вирішують телефоном чи e-mail.',
    links: [['Запис до служб', 'https://www.kreis-wesel.de/serviceportal/terminvereinbarungen'], ['Години всіх служб', 'https://www.kreis-wesel.de/serviceportal/oeffnungszeiten-dienststellen']] },
  { id: 'agentur', city: 'Wesel', icon: '💼', uk: 'Агенція з праці', de: 'Agentur für Arbeit Wesel',
    for: 'Пошук роботи, реєстрація безробіття, Arbeitslosengeld I, консультації з професії й навчання.',
    addr: 'Reeser Landstraße 61, 46483 Wesel', phone: ['0800 4 5555 00'],
    hours: [['Пн', '08:00–13:00'], ['Вт', '08:00–13:00'], ['Чт', '08:00–13:00'], ['Пт', '08:00–13:00']],
    book: 'Завжди записуйся онлайн. Без запису приймають лише того, хто реєструється безробітним у той самий день або із запізненням. Телефон безкоштовний: пн–чт 08:00–18:00, пт 08:00–14:00.',
    links: [['Сторінка агенції', 'https://www.arbeitsagentur.de/vor-ort/wesel/startseite'], ['Онлайн-сервіси', 'https://www.arbeitsagentur.de/eservices']] },
  { id: 'jobcenter', city: 'Wesel', icon: '🧾', uk: 'Джобцентр району', de: 'Jobcenter Kreis Wesel',
    for: 'Bürgergeld (допомога для тих, хто шукає роботу), житло й опалення, курси, зокрема інтеграційні.',
    addr: 'Reeser Landstraße 61, 46483 Wesel (у будівлі Agentur für Arbeit)', phone: ['0281 207-7200'],
    hours: [['Пн–Чт', '08:00–12:00, 13:00–15:00'], ['Пт', '08:00–12:00']],
    book: 'Розмови з консультантом — за призначеним часом. Для Ксантена є окрема Geschäftsstelle Xanten: її адресу й години перевір на сайті Jobcenter.',
    links: [['Jobcenter Wesel', 'https://www.arbeitsagentur.de/vor-ort/jobcenter/jobcenter-kreis-wesel-wesel.html'], ['Сайт Jobcenter', 'https://www.jobcenter-kreis-wesel.de/']] },

  { id: 'vhs', city: 'Rheinberg', icon: '🎓', uk: 'Народний університет (VHS)', de: 'VHS Alpen-Rheinberg-Sonsbeck-Xanten',
    for: 'Курси, зокрема німецька мова; заняття бувають і в Ксантені.',
    addr: 'Lützenhofstraße 9, 47495 Rheinberg', phone: ['02843 907400'], mail: 'vhs@vhs-rheinberg.de', hours: null,
    book: 'Запис на курси — на сайті VHS або телефоном.',
    links: [['Сайт VHS', 'https://www.vhs-rheinberg.de/']] },
  { id: 'bamf', city: 'Онлайн', icon: '🔎', uk: 'Інтеграційні курси й консультації для мігрантів', de: 'BAMF-NAVI',
    for: 'Офіційний пошук інтеграційних курсів і безкоштовних консультацій (Migrationsberatung для дорослих від 27 років, Jugendmigrationsdienst до 27) за поштовим індексом, наприклад 46509.',
    addr: null, hours: null, book: 'Шукай за індексом 46509 (Xanten) або 46483 (Wesel).',
    links: [['Відкрити BAMF-NAVI', 'https://bamf-navi.bamf.de/de/']] },
];

// Opening state of a place at a Berlin moment: {open: bool, text} from its hours ('Пн', 'Пн–Чт'), or null if unknown
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
export function openNow(place, wd, minutes) {
  if (!place.hours) return null;
  const today = place.hours.filter(([d]) => {
    const m = d.match(/^(\S\S)(?:–(\S\S))?$/); if (!m) return false;
    const a = DAYS.indexOf(m[1]), b = m[2] ? DAYS.indexOf(m[2]) : a;
    return wd >= a && wd <= b;
  });
  for (const [, times] of today) {
    for (const [, h1, m1, h2, m2] of times.matchAll(/(\d\d):(\d\d)–(\d\d):(\d\d)/g)) {
      const from = h1 * 60 + Number(m1), to = h2 * 60 + Number(m2);
      if (minutes >= from && minutes < to) return { open: true, until: `${h2}:${m2}` };
    }
  }
  return { open: false };
}
