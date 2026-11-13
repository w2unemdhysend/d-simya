// Розділ 8. Житло
export default {
  n: 8, part: "A1.1", title: "Житло", book: "Hier wohnen wir.",
  goals: [
    "описати квартиру: кімнати, меблі, розмір",
    "прочитати оголошення про оренду з скороченнями",
    "сказати, чого хочеш (wollen)",
    "зрозуміти правила будинку: що можна й чого не можна (dürfen)",
  ],
  grammar: [
    {
      id: "poss2", t: "Присвійні слова: unser, euer, ihr, Ihr", cat: "pron",
      text: [
        "Решта присвійних слів: **unser** (наш), **euer** (ваш, до кількох на «ти»), **ihr** (їхній) і ввічливе **Ihr** (Ваш, з великої літери).",
        "Закінчення ті самі, що й у `mein`. У `euer` перед закінченням випадає `e`: `eure Wohnung` (не euere).",
        "Слово `ihr` тепер має три значення: «її» (розділ 7), «їхній» і, з великої літери, «Ваш». Розрізняють за змістом і великою літерою.",
      ],
      tables: [
        { head: ["", "der Balkon", "die Küche", "das Bad", "множина"], rows: [["наш", "unser Balkon", "unsere Küche", "unser Bad", "unsere Zimmer"], ["ваш", "euer Balkon", "**eure** Küche", "euer Bad", "eure Zimmer"], ["їхній", "ihr Balkon", "ihre Küche", "ihr Bad", "ihre Zimmer"], ["Ваш", "Ihr Balkon", "Ihre Küche", "Ihr Bad", "Ihre Zimmer"]] },
      ],
      ex: [["Unsere Wohnung ist klein, aber gemütlich.", "Наша квартира маленька, але затишна."], ["Ist das eure Katze?", "Це ваша кішка?"], ["Die Nachbarn sind nett. Ihr Garten ist sehr schön.", "Сусіди милі. Їхній сад дуже гарний."], ["Ist das Ihr Fahrrad, Frau Krüger?", "Це Ваш велосипед, пані Крюґер?"]],
      warn: ["`euere Küche` — застаріло, кажи `eure Küche`."],
    },
    {
      id: "modal2", t: "wollen і dürfen", cat: "verb",
      text: [
        "**wollen** — хотіти, мати намір (прямо й рішуче). У ввічливому проханні краще `möchten`.",
        "**dürfen** — мати дозвіл. `Darf ich…?` — «Можна мені…?». **nicht dürfen** — заборона: «не можна». Саме так написані правила будинку (`Hausordnung`).",
        "У правилах часто підмет **man** (людина взагалі): `Hier darf man nicht rauchen.` — «Тут не можна курити». Дієслово з `man` — у формі er/sie/es.",
        "Рамка така сама, як з `können`/`müssen`: модальне дієслово на 2-му місці, інфінітив — у кінці.",
      ],
      tables: [
        { head: ["", "wollen", "dürfen"], rows: [["ich", "will", "darf"], ["du", "willst", "darfst"], ["er / sie / es / man", "will", "darf"], ["wir", "wollen", "dürfen"], ["ihr", "wollt", "dürft"], ["sie / Sie", "wollen", "dürfen"]] },
        { cap: "Усі модальні дієслова A1", head: ["", "значення", "er-форма"], rows: [["können", "могти, уміти", "er kann"], ["müssen", "мусити", "er muss"], ["wollen", "хотіти", "er will"], ["dürfen", "мати дозвіл", "er darf"], ["sollen (розділ 13)", "мати (за чиїмось словом)", "er soll"], ["möchten", "хотів би", "er möchte"], ["mögen", "любити", "er mag"]] },
      ],
      ex: [["Wir wollen eine größere Wohnung mieten.", "Ми хочемо орендувати більшу квартиру."], ["Ich will im Sommer umziehen.", "Я хочу переїхати влітку."], ["Darf ich hier parken?", "Можна мені тут припаркуватися?"], ["Im Haus darf man nicht rauchen.", "У будинку не можна курити."], ["Ab 22 Uhr dürfen wir keine laute Musik hören.", "Після 22:00 нам не можна гучно слухати музику."]],
      tips: ["У німецьких будинках зазвичай є **Ruhezeit** (час тиші): вночі (часто з 22:00 до 6:00) і подекуди в обід та в неділю. Деталі — у `Hausordnung` твого будинку."],
      warn: ["`nicht müssen` ≠ «не можна». «Не можна» — `nicht dürfen`: `Hier darf man nicht parken.`", "`Ich will ein Kaffee` у кафе звучить різко. Кажи `Ich möchte einen Kaffee.`"],
    },
    {
      id: "klammer", t: "Рамка речення: огляд", cat: "satz",
      text: [
        "Німецьке речення часто має **рамку**: одна частина дієслова стоїть на 2-му місці, друга — у кінці. Усе інше — всередині.",
        "Рамку утворюють: **модальне дієслово + інфінітив**, **відокремлюване дієслово** (дієслово + приставка) і **Perfekt** (розділ 9: `habe … gemacht`).",
        "Якщо модальне дієслово поєднується з відокремлюваним, приставка в інфінітиві лишається **разом** зі словом: `Ich muss früh aufstehen.`",
      ],
      tables: [
        { head: ["1", "2", "середина", "кінець"], rows: [["Ich", "will", "nächste Woche", "umziehen."], ["Wir", "räumen", "heute die Wohnung", "auf."], ["Darf", "ich", "das Fenster", "öffnen?"], ["Morgen", "muss", "ich früh", "aufstehen."]] },
      ],
      ex: [["Wann wollt ihr einziehen?", "Коли ви хочете в’їхати?"], ["Du musst den Müll rausbringen.", "Тобі треба винести сміття."]],
    },
    {
      id: "wohnung", t: "Опис квартири й оголошення", cat: "rede",
      text: [
        "Прикметник після `sein` **не має закінчення**: `Die Küche ist klein.`, `Das Zimmer ist hell.`",
        "В оголошеннях про оренду пишуть скорочено. **Kaltmiete** — оренда без опалення та комунальних, **Warmmiete** — з ними. `Nebenkosten` (NK) — комунальні. `Kaution` — застава, зазвичай кілька місячних орендних плат без комунальних.",
        "Поверхи рахують інакше, ніж в Україні: **Erdgeschoss** (EG) — це наш перший поверх, а `der erste Stock` — уже другий.",
      ],
      tables: [
        { cap: "Скорочення в оголошеннях", head: ["Скорочення", "Повністю", "Значення"], rows: [
          ["Zi.", "Zimmer", "кімнати"], ["Kü.", "Küche", "кухня"], ["Bad", "Badezimmer", "ванна"], ["Blk.", "Balkon", "балкон"], ["m², qm", "Quadratmeter", "кв. метри"],
          ["EG", "Erdgeschoss", "перший поверх"], ["OG", "Obergeschoss", "поверх вище першого"], ["DG", "Dachgeschoss", "мансарда"], ["KM", "Kaltmiete", "оренда без комунальних"],
          ["WM", "Warmmiete", "оренда з комунальними"], ["NK", "Nebenkosten", "комунальні платежі"], ["ab sofort", "", "одразу, з цього дня"],
        ] },
      ],
      ex: [["Die Wohnung hat drei Zimmer, eine Küche, ein Bad und einen Balkon.", "У квартирі три кімнати, кухня, ванна й балкон."], ["Das Wohnzimmer ist groß und hell.", "Вітальня велика й світла."], ["Die Wohnung liegt im zweiten Stock.", "Квартира на третьому поверсі (за нашим рахунком)."], ["Die Miete kostet 650 Euro warm.", "Оренда коштує 650 євро разом з комунальними."]],
      warn: ["`im ersten Stock` — не перший, а **другий** поверх за українським рахунком."],
    },
  ],
  phrases: [
    { t: "Квартира", list: [["Die Wohnung hat zwei Zimmer.", "У квартирі дві кімнати."], ["Wie groß ist die Wohnung?", "Яка площа квартири?"], ["Sie ist sechzig Quadratmeter groß.", "Площа шістдесят квадратних метрів."], ["Wie hoch ist die Miete?", "Яка орендна плата?"], ["Sind die Nebenkosten inklusive?", "Комунальні включені?"]] },
    { t: "Правила й дозволи", list: [["Darf ich hier rauchen?", "Можна тут курити?"], ["Nein, hier darf man nicht rauchen.", "Ні, тут не можна курити."], ["Wann muss man den Müll rausbringen?", "Коли треба виносити сміття?"], ["Ab 22 Uhr ist Ruhe.", "Після 22:00 тиша."]] },
    { t: "Плани", list: [["Ich will umziehen.", "Я хочу переїхати."], ["Wir suchen eine Wohnung in Xanten.", "Ми шукаємо квартиру в Ксантені."], ["Die Wohnung ist ab sofort frei.", "Квартира вільна вже зараз."]] },
  ],
  dialog: {
    t: "Перегляд квартири",
    lines: [
      ["Vermieterin", "Kommen Sie rein! Hier ist der Flur, und links ist das Wohnzimmer.", "Заходьте! Тут коридор, а ліворуч вітальня."],
      ["{Taras|Lessja}", "Oh, das Wohnzimmer ist schön hell. Wie groß ist die Wohnung?", "О, вітальня гарна, світла. Яка площа квартири?"],
      ["Vermieterin", "Fünfundsechzig Quadratmeter. Drei Zimmer, Küche, Bad und ein kleiner Balkon.", "Шістдесят п’ять квадратних метрів. Три кімнати, кухня, ванна й невеликий балкон."],
      ["{Taras|Lessja}", "Und wie hoch ist die Miete?", "А яка орендна плата?"],
      ["Vermieterin", "Fünfhundertfünfzig Euro kalt, plus hundertachtzig Euro Nebenkosten.", "П’ятсот п’ятдесят євро без комунальних, плюс сто вісімдесят євро комунальні."],
      ["{Taras|Lessja}", "Darf man hier Haustiere haben? Wir haben eine Katze.", "Тут можна тримати тварин? У нас є кішка."],
      ["Vermieterin", "Eine Katze ist kein Problem. Aber im Haus darf man nicht rauchen.", "Кішка — не проблема. Але в будинку курити не можна."],
      ["{Taras|Lessja}", "Wir rauchen nicht. Wann können wir einziehen?", "Ми не куримо. Коли ми можемо в’їхати?"],
      ["Vermieterin", "Ab dem ersten Dezember.", "З першого грудня."],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist ___ Wohnung. (наш)", a: ["unsere"] },
    { t: "gap", q: "Ist das ___ Auto? (ваш, до друзів)", a: ["euer"], why: "das Auto → euer." },
    { t: "gap", q: "Wo ist ___ Küche? (ваш, до друзів)", a: ["eure"], why: "euer + -e → eure." },
    { t: "gap", q: "Ist das ___ Schlüssel, Herr Weber? (Ваш)", a: ["Ihr"], why: "Ввічливе Ihr — з великої." },
    { t: "gap", q: "Hier ___ man nicht rauchen. (dürfen)", a: ["darf"] },
    { t: "gap", q: "Wir ___ eine neue Wohnung mieten. (wollen)", a: ["wollen"] },
    { t: "gap", q: "Er ___ im Sommer umziehen. (wollen)", a: ["will"], why: "er will — без закінчення." },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich muss früh aufstehen.", "Ich muss früh stehen auf.", "Ich muss aufstehen früh."], a: 0, why: "Інфінітив разом із приставкою — у кінці." },
    { t: "mc", q: "«Hier darf man nicht parken» означає:", o: ["Тут не обов’язково паркуватися.", "Тут не можна паркуватися.", "Тут не вмієш паркуватися."], a: 1 },
    { t: "mc", q: "Що таке «Warmmiete»?", o: ["оренда влітку", "оренда разом з опаленням і комунальними", "оренда без комунальних"], a: 1 },
    { t: "mc", q: "Квартира «im ersten Stock» — це за українським рахунком:", o: ["перший поверх", "другий поверх", "підвал"], a: 1 },
    { t: "mc", q: "Die Küche ist ___.", o: ["kleine", "klein", "kleiner"], a: 1, why: "Після sein прикметник без закінчення." },
  ],
};
