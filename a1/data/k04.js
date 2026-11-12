// Розділ 4. У кафе
export default {
  n: 4, part: "A1.1", title: "У кафе", book: "Einen Kaffee, bitte.",
  goals: [
    "замовити напій і їжу в кафе чи пекарні",
    "запитати ціну й назвати її",
    "заплатити разом чи окремо, залишити чайові",
    "утворити множину іменників",
    "сказати, що хочеш: «Ich möchte einen Kaffee»",
  ],
  grammar: [
    {
      id: "moechten", t: "möchten — хотів би", cat: "verb",
      text: [
        "**möchten** — ввічливе «хотів би, бажаю». Саме це слово кажуть у кафе, магазині, на касі. Різке `ich will` (я хочу) у такій ситуації звучить грубувато.",
        "Увага: у формі `er/sie/es` **немає закінчення -t**: `er möchte`, як і в `ich möchte`.",
        "Після `möchten` іде або іменник (`Ich möchte einen Tee.`), або друге дієслово **в кінці речення** (`Ich möchte bezahlen.`).",
      ],
      tables: [
        { head: ["", "möchten"], rows: [["ich", "möchte"], ["du", "möchtest"], ["er / sie / es", "**möchte**"], ["wir", "möchten"], ["ihr", "möchtet"], ["sie / Sie", "möchten"]] },
      ],
      ex: [["Ich möchte einen Kaffee, bitte.", "Каву, будь ласка."], ["Was möchten Sie trinken?", "Що Ви бажаєте випити?"], ["Sie möchte ein Stück Kuchen.", "Вона хоче шматок пирога."], ["Wir möchten bitte bezahlen.", "Ми хотіли б розрахуватися."]],
      warn: ["`Er möchtet` — помилка, правильно `er möchte`."],
    },
    {
      id: "arbeiten", t: "arbeiten: коли додається -e-", cat: "verb",
      text: [
        "Якщо основа дієслова закінчується на **-t** або **-d** (`arbeit-`, `find-`, `kost-`, `antwort-`), перед закінченнями `-st` і `-t` вставляється **-e-**, щоб це можна було вимовити: `du arbeitest`, `er arbeitet`.",
      ],
      tables: [
        { head: ["", "arbeiten", "finden", "kosten"], rows: [["ich", "arbeite", "finde", "—"], ["du", "arbeit**e**st", "find**e**st", "—"], ["er / sie / es", "arbeit**e**t", "find**e**t", "kost**e**t"], ["wir", "arbeiten", "finden", "—"], ["ihr", "arbeit**e**t", "find**e**t", "—"], ["sie / Sie", "arbeiten", "finden", "kosten"]] },
      ],
      ex: [["Wo arbeitest du? – Ich arbeite in einem Café.", "Де ти працюєш? – Я працюю в кафе."], ["Was kostet der Kuchen?", "Скільки коштує пиріг?"], ["Sie antwortet nicht.", "Вона не відповідає."]],
    },
    {
      id: "akkEin", t: "Знахідний відмінок: einen Kaffee", cat: "noun",
      text: [
        "У німецькій чотири відмінки. Перший — **Nominativ** (хто? що? — підмет): `Der Kaffee ist heiß.` Другий, який потрібен уже зараз, — **Akkusativ** (кого? що? — прямий додаток): `Ich möchte einen Kaffee.`",
        "Гарна новина: в Akkusativ змінюється **лише чоловічий рід**: `ein → einen`, `kein → keinen`. Жіночий, середній і множина — без змін.",
        "Akkusativ вимагають, зокрема, дієслова `möchten`, `haben`, `brauchen`, `nehmen`, `kaufen`, `bestellen`, `essen`, `trinken` і зворот `es gibt` (є, існує).",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [["Nominativ", "ein Kaffee", "eine Cola", "ein Wasser", "— Brötchen"], ["Akkusativ", "**einen** Kaffee", "eine Cola", "ein Wasser", "— Brötchen"], ["заперечення (Akk.)", "**keinen** Kaffee", "keine Cola", "kein Wasser", "keine Brötchen"]] },
      ],
      ex: [["Ich nehme einen Tee und ein Brötchen.", "Я візьму чай і булочку."], ["Hast du einen Kuli?", "У тебе є ручка?"], ["Wir brauchen keinen Zucker.", "Нам не треба цукру."], ["Gibt es hier einen Supermarkt?", "Тут є супермаркет?"]],
      tips: ["Перевірка: чи можна поставити питання «що?/кого?» до дієслова (беру що? маю що?) → Akkusativ. «Хто? що? робить» → Nominativ."],
      warn: ["`Ich möchte ein Kaffee` — дуже часта помилка: der Kaffee → `einen Kaffee`."],
    },
    {
      id: "plural", t: "Множина іменників", cat: "noun",
      text: [
        "Множина в німецькій утворюється **п’ятьма способами**, і точного правила немає, тому множину вчать разом зі словом: `der Tisch, die Tische`. У словнику застосунку вона є в кожного іменника.",
        "Деякі закономірності допомагають: слова жіночого роду на `-e` майже завжди мають `-n` (`die Lampe — die Lampen`), на `-in` — `-nen` (`die Lehrerin — die Lehrerinnen`); іншомовні слова часто `-s` (`das Café — die Cafés`); чоловічі й середні на `-er, -el, -en` часто без закінчення (`der Lehrer — die Lehrer`).",
      ],
      tables: [
        { head: ["Тип", "Однина", "Множина"], rows: [
          ["-e (іноді з умлаутом)", "der Tisch, der Saft", "die Tische, die Säfte"],
          ["-(e)n", "die Tasse, die Frau", "die Tassen, die Frauen"],
          ["-er (з умлаутом, де можна)", "das Kind, das Glas", "die Kinder, die Gläser"],
          ["-s", "das Auto, das Café", "die Autos, die Cafés"],
          ["без закінчення (іноді умлаут)", "der Kuchen, der Apfel", "die Kuchen, die Äpfel"],
        ] },
      ],
      ex: [["Zwei Kaffees, bitte.", "Дві кави, будь ласка."], ["Ich möchte drei Brötchen.", "Мені три булочки."], ["Die Gläser sind leer.", "Склянки порожні."]],
      warn: ["У множині артикль завжди `die`: `die Kuchen`, навіть якщо форма однаково звучить з одниною."],
    },
    {
      id: "kompos", t: "Складні слова: der Apfelsaft", cat: "noun",
      text: [
        "Німецька любить складати слова: `der Apfel` + `der Saft` = `der Apfelsaft`. **Рід і множину дає остання частина**, а головне значення — теж вона: Apfelsaft — це сік (яблучний).",
        "Іноді між частинами з’являється `-s-` або `-n-`: `der Geburtstag` (Geburt + s + Tag), `der Orangensaft`.",
      ],
      tables: [
        { head: ["Частини", "Слово", "Значення"], rows: [["der Apfel + der Saft", "der Apfelsaft", "яблучний сік"], ["die Speise + die Karte", "die Speisekarte", "меню"], ["das Mineral + das Wasser", "das Mineralwasser", "мінеральна вода"], ["der Tee + die Tasse", "die Teetasse", "чайна чашка"], ["die Kartoffel + der Salat", "der Kartoffelsalat", "картопляний салат"]] },
      ],
      ex: [["Ich nehme einen Orangensaft.", "Я візьму апельсиновий сік."], ["Die Speisekarte, bitte.", "Меню, будь ласка."]],
    },
    {
      id: "preise", t: "Ціни", cat: "zeit",
      text: [
        "Ціну читають так: **євро + слово Euro + центи**: `2,50 €` = `zwei Euro fünfzig`. Слово «цент» у такій ціні не кажуть. Якщо менше за євро — `neunundneunzig Cent`.",
        "`Euro` і `Cent` після числа **не мають множини**: `fünf Euro`, `zwanzig Cent`.",
        "На касі кажуть `Das macht …` (з Вас …) або `Das kostet …`. У кафе відповідають на `Zusammen oder getrennt?` — разом чи окремо. Чайові дають, округлюючи суму: `Stimmt so.` (решти не треба) або називають суму, яку дати: `Machen Sie zehn Euro.`",
      ],
      tables: [
        { head: ["Пишемо", "Кажемо"], rows: [["1,00 €", "ein Euro"], ["2,50 €", "zwei Euro fünfzig"], ["0,99 €", "neunundneunzig Cent"], ["12,90 €", "zwölf Euro neunzig"], ["4,05 €", "vier Euro fünf"]] },
      ],
      ex: [["Was kostet ein Cappuccino? – Drei Euro zwanzig.", "Скільки коштує капучино? – Три євро двадцять."], ["Das macht zusammen elf Euro.", "Разом з Вас одинадцять євро."]],
    },
  ],
  phrases: [
    { t: "Замовити", list: [["Ich möchte einen Kaffee, bitte.", "Каву, будь ласка."], ["Ich nehme ein Stück Kuchen.", "Я візьму шматок пирога."], ["Für mich ein Wasser, bitte.", "Мені воду, будь ласка."], ["Haben Sie auch Tee?", "У Вас є також чай?"], ["Die Speisekarte, bitte.", "Меню, будь ласка."]] },
    { t: "Заплатити", list: [["Zahlen, bitte! / Die Rechnung, bitte!", "Рахунок, будь ласка!"], ["Zusammen oder getrennt?", "Разом чи окремо?"], ["Getrennt, bitte.", "Окремо, будь ласка."], ["Kann ich mit Karte zahlen?", "Можна заплатити карткою?"], ["Stimmt so.", "Решти не треба."]] },
    { t: "За столом", list: [["Guten Appetit!", "Смачного!"], ["Prost! / Zum Wohl!", "Будьмо! / На здоров’я!"], ["Das ist sehr lecker!", "Це дуже смачно!"]] },
  ],
  dialog: {
    t: "У кав’ярні",
    lines: [
      ["Kellner", "Guten Tag! Was möchten Sie?", "Добрий день! Що бажаєте?"],
      ["Olena", "Ich möchte einen Cappuccino und ein Stück Apfelkuchen, bitte.", "Мені капучино й шматок яблучного пирога, будь ласка."],
      ["Max", "Und für mich einen Tee, bitte. Haben Sie Pfefferminztee?", "А мені чай, будь ласка. У Вас є м’ятний чай?"],
      ["Kellner", "Ja, natürlich.", "Так, звісно."],
      ["", "…", "…"],
      ["Max", "Zahlen, bitte!", "Рахунок, будь ласка!"],
      ["Kellner", "Zusammen oder getrennt?", "Разом чи окремо?"],
      ["Max", "Zusammen, bitte.", "Разом, будь ласка."],
      ["Kellner", "Das macht neun Euro achtzig.", "З Вас дев’ять євро вісімдесят."],
      ["Max", "Zehn Euro. Stimmt so.", "Десять євро. Решти не треба."],
      ["Kellner", "Vielen Dank! Schönen Tag noch!", "Щиро дякую! Гарного дня!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich möchte ___ Kaffee. (ein)", a: ["einen"], why: "der Kaffee, Akkusativ → einen." },
    { t: "gap", q: "Wir nehmen ___ Cola. (ein)", a: ["eine"], why: "die Cola: у жіночому роді Akkusativ не змінюється." },
    { t: "gap", q: "Er möchte ___ Wasser. (ein)", a: ["ein"], why: "das Wasser — без змін." },
    { t: "gap", q: "Ich brauche ___ Zucker. (kein)", a: ["keinen"], why: "der Zucker → keinen." },
    { t: "gap", q: "Sie ___ einen Tee. (möchten)", a: ["möchte"], why: "er/sie/es möchte — без -t." },
    { t: "gap", q: "Wo ___ du? (arbeiten)", a: ["arbeitest"], why: "Основа на -t: arbeit-e-st." },
    { t: "mc", q: "Множина від die Tasse:", o: ["die Tasses", "die Tassen", "die Tässer"], a: 1, why: "Жіночий рід на -e → -n." },
    { t: "mc", q: "Множина від das Glas:", o: ["die Glase", "die Glasen", "die Gläser"], a: 2 },
    { t: "mc", q: "Множина від das Café:", o: ["die Cafés", "die Cafen", "die Caféer"], a: 0, why: "Іншомовні слова часто на -s." },
    { t: "mc", q: "Який рід у слова Apfelsaft?", o: ["der", "die", "das"], a: 0, why: "Рід дає остання частина: der Saft." },
    { t: "mc", q: "Як прочитати 3,40 €?", o: ["drei Komma vierzig Euro", "drei Euro vierzig", "drei Euros vierzig Cents"], a: 1 },
    { t: "mc", q: "Що відповісти на «Zusammen oder getrennt?», якщо платиш лише за себе?", o: ["Zusammen, bitte.", "Getrennt, bitte.", "Stimmt so."], a: 1 },
  ],
};
