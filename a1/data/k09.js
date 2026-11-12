// Розділ 9. Вільний час і минуле (Perfekt з haben). Граматика — як у розділі 9 Die neue Linie 1, тема наша.
export default {
  n: 9, part: "A1.2", title: "Вихідні й дозвілля", book: null,
  goals: [
    "розповісти, що робив учора чи на вихідних",
    "сказати, куди йдеш (ins Kino, in den Park)",
    "вживати займенники mich, dich, ihn…",
    "запросити когось і відповісти на запрошення",
  ],
  grammar: [
    {
      id: "perfHaben", t: "Perfekt з haben", cat: "verb",
      text: [
        "Про минуле в розмові німці кажуть **Perfekt**: допоміжне дієслово **haben** (змінюється, стоїть на 2-му місці) + **Partizip II** (не змінюється, стоїть у **кінці**). Знову рамка.",
        "**Правильні** дієслова: `ge-` + основа + `-t`: `machen → gemacht`, `kaufen → gekauft`, `spielen → gespielt`. Після основи на -t/-d: `-et`: `arbeiten → gearbeitet`.",
        "**Неправильні**: `ge-` + (часто змінена) основа + `-en`: `lesen → gelesen`, `schreiben → geschrieben`, `trinken → getrunken`. Їх вчать напам’ять — у словнику застосунку Perfekt є в кожного дієслова.",
        "Більшість дієслів утворює Perfekt з **haben**. Деякі — з `sein` (розділ 10).",
      ],
      tables: [
        { cap: "Рамка Perfekt", head: ["1", "2 (haben)", "середина", "кінець (Partizip II)"], rows: [["Ich", "habe", "gestern Fußball", "gespielt."], ["Am Samstag", "haben", "wir eine Pizza", "gegessen."], ["Was", "hast", "du am Wochenende", "gemacht?"], ["Hast", "du", "den Film", "gesehen?"]] },
        { cap: "Правильні (-t)", head: ["Інфінітив", "Partizip II"], rows: [["machen", "gemacht"], ["kaufen", "gekauft"], ["spielen", "gespielt"], ["hören", "gehört"], ["kochen", "gekocht"], ["arbeiten", "gearbeitet"], ["warten", "gewartet"], ["tanzen", "getanzt"]] },
        { cap: "Неправильні (-en)", head: ["Інфінітив", "Partizip II"], rows: [["lesen", "gelesen"], ["sehen", "gesehen"], ["essen", "gegessen"], ["trinken", "getrunken"], ["schreiben", "geschrieben"], ["treffen", "getroffen"], ["schlafen", "geschlafen"], ["finden", "gefunden"], ["helfen", "geholfen"], ["singen", "gesungen"], ["bringen", "gebracht (змішане)"], ["denken", "gedacht (змішане)"]] },
      ],
      ex: [["Was hast du gestern gemacht? – Ich habe gelernt.", "Що ти робив учора? – Я вчився."], ["Wir haben am Samstag gefeiert.", "У суботу ми святкували."], ["Er hat drei Stunden gearbeitet.", "Він працював три години."], ["Hast du schon gegessen?", "Ти вже їв?"], ["Ich habe Anna im Supermarkt getroffen.", "Я зустрів Анну в супермаркеті."]],
      tips: ["Українське минуле «я робив / я зробив» — це в Perfekt однаково: `ich habe gemacht`. Окремих видів дієслова, як в українській, немає."],
      warn: ["`Ich habe gemacht das gestern` — Partizip іде в самий кінець: `Ich habe das gestern gemacht.`", "`gegesst`, `getrinkt` — помилки. Неправильні дієслова: `gegessen`, `getrunken`."],
    },
    {
      id: "persAkk", t: "Займенники в Akkusativ: mich, dich, ihn", cat: "pron",
      text: [
        "Займенник як прямий додаток (кого? що?) стоїть в **Akkusativ**. Форма змінюється в `ich → mich`, `du → dich`, `er → ihn`, `wir → uns`, `ihr → euch`. `sie`, `es`, `Sie` лишаються.",
        "Akkusativ вимагають, наприклад, `besuchen`, `anrufen`, `treffen`, `sehen`, `lieben`, `fragen`, `einladen` і прийменник `für`.",
      ],
      tables: [
        { head: ["Nominativ", "Akkusativ", "Значення"], rows: [["ich", "mich", "мене"], ["du", "dich", "тебе"], ["er", "**ihn**", "його"], ["sie", "sie", "її"], ["es", "es", "його (воно)"], ["wir", "uns", "нас"], ["ihr", "euch", "вас"], ["sie / Sie", "sie / Sie", "їх / Вас"]] },
      ],
      ex: [["Ich rufe dich morgen an.", "Я подзвоню тобі завтра."], ["Kennst du Max? – Ja, ich kenne ihn.", "Ти знаєш Макса? – Так, я його знаю."], ["Besuchst du uns am Sonntag?", "Ти відвідаєш нас у неділю?"], ["Der Film? Ich habe ihn schon gesehen.", "Фільм? Я вже його бачив."], ["Ich frage Sie etwas, Frau Krüger.", "Я хочу Вас дещо запитати, пані Крюґер."]],
      tips: ["Річ чоловічого роду — теж `ihn`: `der Kuli → Ich habe ihn.`"],
      warn: ["`Ich rufe dir an` — калька з «подзвонити тобі». У німецькій `anrufen` + Akkusativ: `Ich rufe dich an.`"],
    },
    {
      id: "possAkk", t: "Присвійні слова в Akkusativ", cat: "pron",
      text: ["Тут нічого нового: присвійні слова в Akkusativ змінюються як `einen/eine/ein`. Закінчення **-en** лише в чоловічому роді. Від `unser` і `euer`: `unseren`, `euren`."],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [["Akkusativ", "meinen / deinen / seinen / ihren / unseren / euren Freund", "meine … Freundin", "mein … Kind", "meine … Kinder"]] },
      ],
      ex: [["Ich besuche meinen Bruder.", "Я відвідую свого брата."], ["Hast du deinen Schlüssel?", "Ти маєш свій ключ?"], ["Wir feiern unseren Hochzeitstag.", "Ми святкуємо річницю весілля."]],
    },
    {
      id: "inAkk", t: "Куди? in + Akkusativ: ins Kino", cat: "prep",
      text: [
        "На питання **wohin?** (куди?) після `in` стоїть **Akkusativ**: `in den Park`, `in die Stadt`, `ins Kino` (`in das` → **ins**).",
        "Скорочення `ins` (= in das) кажуть майже завжди.",
        "Запам’ятай особливі вирази: `nach Hause` (додому) і `zu Hause` (вдома).",
      ],
      tables: [
        { head: ["", "Wohin? (куди?)"], rows: [["der Park", "in **den** Park"], ["die Stadt", "in **die** Stadt"], ["das Kino", "**ins** Kino"], ["die Berge (мн.)", "in **die** Berge"]] },
      ],
      ex: [["Gehen wir heute ins Kino?", "Підемо сьогодні в кіно?"], ["Am Samstag fahren wir in die Stadt.", "У суботу ми їдемо в місто."], ["Ich gehe in den Park.", "Я йду в парк."], ["Nach dem Kurs gehe ich nach Hause.", "Після курсу я йду додому."], ["Am Sonntag bin ich zu Hause.", "У неділю я вдома."]],
      tips: ["Де? (`wo?`) — у розділі 12, там після `in` інший відмінок: `im Kino`."],
      warn: ["`Ich gehe zu Hause` — помилка. Додому — `nach Hause`, вдома — `zu Hause`."],
    },
    {
      id: "wochenende", t: "Розповідь про минулий тиждень", cat: "rede",
      text: [
        "Розповідь звучить природно, коли ти поєднуєш `war/hatte` (розділ 7) і Perfekt, а речення починаєш з часу: `Am Samstag war ich in Wesel. Ich habe eingekauft…`",
        "Слова, що допомагають: `gestern` (учора), `vorgestern` (позавчора), `letzte Woche` (минулого тижня), `am Wochenende` (на вихідних), `zuerst` (спочатку), `dann` (потім), `danach` (після того).",
      ],
      ex: [["Am Samstag war ich mit Freunden im Park. Wir haben Fußball gespielt.", "У суботу я був з друзями в парку. Ми грали у футбол."], ["Danach haben wir Pizza gegessen.", "Потім ми їли піцу."], ["Am Sonntag hatte ich keine Zeit. Ich habe gelernt.", "У неділю в мене не було часу. Я вчився."]],
    },
  ],
  phrases: [
    { t: "Минулі вихідні", list: [["Was hast du am Wochenende gemacht?", "Що ти робив на вихідних?"], ["Ich habe viel geschlafen.", "Я багато спав."], ["Wir haben gegrillt.", "Ми смажили барбекю."], ["Es war super! / Es war langweilig.", "Було чудово! / Було нудно."]] },
    { t: "Запросити", list: [["Hast du Lust? Wir gehen ins Kino.", "Маєш бажання? Ми йдемо в кіно."], ["Kommst du mit?", "Підеш з нами?"], ["Gern! / Gute Idee!", "Залюбки! / Гарна ідея!"], ["Leider kann ich nicht. Ich muss arbeiten.", "На жаль, не можу. Мушу працювати."]] },
  ],
  dialog: {
    t: "Понеділок на курсі",
    lines: [
      ["Anna", "Hallo Taras! Wie war dein Wochenende?", "Привіт, Тарасе! Як минули вихідні?"],
      ["Taras", "Sehr schön! Am Samstag habe ich mit meinem Bruder Fußball gespielt.", "Дуже гарно! У суботу я грав з братом у футбол."],
      ["Anna", "Und am Sonntag?", "А в неділю?"],
      ["Taras", "Da habe ich lange geschlafen und dann für den Test gelernt. Und du?", "Тоді я довго спав, а потім учився до тесту. А ти?"],
      ["Anna", "Ich war in Düsseldorf. Ich habe meine Freundin besucht, und wir haben eingekauft.", "Я була в Дюссельдорфі. Відвідала подругу, і ми ходили по магазинах."],
      ["Taras", "Hast du etwas gekauft?", "Ти щось купила?"],
      ["Anna", "Ja, eine Jacke. Am Freitag gehen wir ins Kino. Hast du Lust?", "Так, куртку. У п’ятницю ми йдемо в кіно. Маєш бажання?"],
      ["Taras", "Gern! Ich rufe dich an.", "Залюбки! Я тобі подзвоню."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich habe gestern Fußball ___. (spielen)", a: ["gespielt"] },
    { t: "gap", q: "Was hast du am Wochenende ___? (machen)", a: ["gemacht"] },
    { t: "gap", q: "Wir haben eine Pizza ___. (essen)", a: ["gegessen"] },
    { t: "gap", q: "Er hat das Buch ___. (lesen)", a: ["gelesen"] },
    { t: "gap", q: "Sie ___ drei Stunden gearbeitet. (haben)", a: ["hat"] },
    { t: "gap", q: "Kennst du Max? – Ja, ich kenne ___.", a: ["ihn"], why: "er → ihn." },
    { t: "gap", q: "Ich rufe ___ morgen an. (ти)", a: ["dich"] },
    { t: "gap", q: "Gehen wir ___ Kino?", a: ["ins"], why: "in + das (Akk.) → ins." },
    { t: "mc", q: "Am Samstag fahren wir in ___ Stadt.", o: ["der", "die", "den"], a: 1, why: "Wohin? → Akkusativ: die Stadt." },
    { t: "mc", q: "Як сказати «я йду додому»?", o: ["Ich gehe zu Hause.", "Ich gehe nach Hause.", "Ich gehe ins Haus."], a: 1 },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich habe gestern gelernt.", "Ich habe gelernt gestern.", "Ich gestern habe gelernt."], a: 0 },
    { t: "mc", q: "Partizip II від trinken:", o: ["getrinkt", "getrunken", "getrank"], a: 1 },
    { t: "mc", q: "Ich besuche ___ Bruder.", o: ["mein", "meinen", "meine"], a: 1, why: "der Bruder, Akkusativ → meinen." },
  ],
};
