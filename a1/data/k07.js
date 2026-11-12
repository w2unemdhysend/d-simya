// Розділ 7. Родина
export default {
  n: 7, part: "A1.1", title: "Родина", book: "Meine Familie und ich",
  goals: [
    "розповісти про свою родину, вік і сімейний стан",
    "назвати країну, мову й національність",
    "сказати, що вмієш і що мусиш зробити",
    "попросити про допомогу",
    "розповісти, де був учора (war, hatte)",
  ],
  grammar: [
    {
      id: "poss1", t: "Присвійні слова: mein, dein, sein, ihr", cat: "pron",
      text: [
        "Кожна особа має своє присвійне слово. Закінчення в них **як у ein/kein**: перед der і das — без закінчення, перед die і множиною — **-e** (у Nominativ), а в Akkusativ чоловічого роду — **-en**.",
        "Увага на **sein** і **ihr**: `sein` — його (він або воно), `ihr` — її. В українській «його/її» не змінюються, а в німецькій до них додаються закінчення за родом **речі**: `ihr Bruder` (її брат), `ihre Schwester` (її сестра).",
      ],
      tables: [
        { cap: "Хто володіє", head: ["Особа", "Присвійне", "Значення"], rows: [["ich", "mein", "мій"], ["du", "dein", "твій"], ["er", "sein", "його"], ["sie", "ihr", "її"], ["es", "sein", "його (дитини тощо)"]] },
        { cap: "Закінчення (так само для dein, sein, ihr)", head: ["", "der", "die", "das", "множина"], rows: [["Nominativ", "mein Vater", "meine Mutter", "mein Kind", "meine Eltern"], ["Akkusativ", "mein**en** Vater", "meine Mutter", "mein Kind", "meine Eltern"]] },
      ],
      ex: [["Das ist mein Bruder Taras.", "Це мій брат Тарас."], ["Wie heißt deine Schwester?", "Як звати твою сестру?"], ["Anna und ihr Mann wohnen in Wesel.", "Анна та її чоловік живуть у Везелі."], ["Max besucht seine Oma.", "Макс відвідує свою бабусю."], ["Ich liebe meinen Hund.", "Я люблю свого собаку."]],
      tips: ["Українське «свій» перекладається за особою: «Макс відвідує свою бабусю» = `seine Oma` (його), «Анна відвідує свою бабусю» = `ihre Oma` (її)."],
      warn: ["`Anna und sein Mann` — помилка: власниця — Анна (жінка), тож `ihr Mann`.", "`meine Vater` — помилка: der Vater → `mein Vater`."],
    },
    {
      id: "praet", t: "Минуле: war і hatte", cat: "verb",
      text: [
        "Про минуле в розмові кажуть переважно в Perfekt (розділ 9). Але **sein** і **haben** — виняток: для них у розмові вживають **Präteritum**: `war` (був), `hatte` (мав).",
        "Форми ich і er/sie/es — однакові й без закінчення: `ich war, er war`.",
      ],
      tables: [
        { head: ["", "sein → war", "haben → hatte"], rows: [["ich", "war", "hatte"], ["du", "warst", "hattest"], ["er / sie / es", "war", "hatte"], ["wir", "waren", "hatten"], ["ihr", "wart", "hattet"], ["sie / Sie", "waren", "hatten"]] },
      ],
      ex: [["Gestern war ich beim Arzt.", "Учора я був у лікаря."], ["Wo warst du am Wochenende?", "Де ти був на вихідних?"], ["Wir hatten keine Zeit.", "У нас не було часу."], ["Die Party war super!", "Вечірка була чудова!"], ["Früher hatte ich einen Hund.", "Раніше в мене був собака."]],
    },
    {
      id: "modal1", t: "können і müssen", cat: "verb",
      text: [
        "**können** — могти, уміти. **müssen** — мусити, бути змушеним. Обидва — **модальні дієслова**: вони змінюють значення іншого дієслова.",
        "В однині в них змінюється голосний, а в формах `ich` і `er` **немає закінчення**: `ich kann, er kann`, `ich muss, er muss`.",
        "**Рамка речення:** модальне дієслово стоїть на 2-му місці (і змінюється), а головне дієслово — **в кінці, в інфінітиві**: `Ich kann gut kochen.`",
      ],
      tables: [
        { head: ["", "können", "müssen"], rows: [["ich", "kann", "muss"], ["du", "kannst", "musst"], ["er / sie / es", "kann", "muss"], ["wir", "können", "müssen"], ["ihr", "könnt", "müsst"], ["sie / Sie", "können", "müssen"]] },
        { cap: "Рамка з модальним дієсловом", head: ["1", "2 (модальне)", "середина", "кінець (інфінітив)"], rows: [["Ich", "kann", "gut", "kochen."], ["Heute", "muss", "ich lange", "arbeiten."], ["Kannst", "du", "mir", "helfen?"], ["Wann", "musst", "du morgen", "aufstehen?"]] },
      ],
      ex: [["Ich kann ein bisschen Deutsch sprechen.", "Я трохи вмію говорити німецькою."], ["Kannst du schwimmen?", "Ти вмієш плавати?"], ["Ich muss heute einkaufen.", "Мені сьогодні треба в магазин."], ["Meine Mutter kann sehr gut backen.", "Моя мама дуже добре пече."], ["Können Sie mir bitte helfen?", "Можете мені, будь ласка, допомогти?"]],
      tips: ["`nicht müssen` = «не треба», а не «не можна»: `Du musst nicht kommen.` — Тобі не обов’язково приходити. Заборона — `nicht dürfen` (розділ 8)."],
      warn: ["`Ich kann kochen gut` — помилка: інфінітив іде в самий кінець: `Ich kann gut kochen.`", "`Er kannt`, `er musst` — помилка: `er kann`, `er muss`."],
    },
    {
      id: "nation", t: "Країна, мова, національність", cat: "rede",
      text: [
        "Для кожної країни є три слова: країна, людина (чоловік/жінка) і мова. Мова — з великої літери без артикля (`Ich spreche Ukrainisch`), а про себе кажуть без артикля: `Ich bin Ukrainerin.`",
        "`Deutscher / Deutsche` — особливе слово, змінюється як прикметник: `ein Deutscher`, `eine Deutsche`, `die Deutschen`.",
      ],
      tables: [
        { head: ["Країна", "Він", "Вона", "Мова"], rows: [["die Ukraine", "Ukrainer", "Ukrainerin", "Ukrainisch"], ["Deutschland", "Deutscher", "Deutsche", "Deutsch"], ["Polen", "Pole", "Polin", "Polnisch"], ["Österreich", "Österreicher", "Österreicherin", "Deutsch"], ["die Türkei", "Türke", "Türkin", "Türkisch"], ["Spanien", "Spanier", "Spanierin", "Spanisch"]] },
      ],
      ex: [["Ich bin Ukrainer und spreche Ukrainisch und Deutsch.", "Я українець і говорю українською та німецькою."], ["Meine Nachbarin ist Deutsche.", "Моя сусідка — німкеня."]],
    },
    {
      id: "familie", t: "Про родину і вік", cat: "rede",
      text: [
        "Вік кажуть через `sein`: `Ich bin 21 (Jahre alt).` Не «я маю 21 рік»!",
        "Сімейний стан: `ledig` (неодружений/незаміжня), `verheiratet` (одружений/заміжня), `geschieden` (розлучений), `verwitwet` (вдівець/вдова). В анкетах це поле `Familienstand`.",
        "`die Eltern` (батьки) і `die Geschwister` (брати й сестри) — лише множина.",
      ],
      ex: [["Wie alt ist deine Mutter? – Sie ist fünfzig.", "Скільки років твоїй мамі? – П’ятдесят."], ["Hast du Geschwister? – Ja, einen Bruder und eine Schwester.", "У тебе є брати чи сестри? – Так, брат і сестра."], ["Ich bin ledig und habe keine Kinder.", "Я неодружений і не маю дітей."], ["Mein Opa ist achtzig Jahre alt.", "Моєму дідусеві вісімдесят років."]],
      warn: ["`Ich habe 21 Jahre` — калька, правильно `Ich bin 21 Jahre alt.`"],
    },
  ],
  phrases: [
    { t: "Про родину", list: [["Das ist meine Familie.", "Це моя родина."], ["Ich habe einen Bruder und eine Schwester.", "У мене є брат і сестра."], ["Meine Eltern wohnen in der Ukraine.", "Мої батьки живуть в Україні."], ["Ich bin verheiratet und habe zwei Kinder.", "Я одружений, маю двох дітей."]] },
    { t: "Вік", list: [["Wie alt bist du?", "Скільки тобі років?"], ["Ich bin einundzwanzig.", "Мені двадцять один."], ["Wann hast du Geburtstag?", "Коли в тебе день народження?"]] },
    { t: "Попросити про допомогу", list: [["Können Sie mir bitte helfen?", "Можете мені допомогти?"], ["Kannst du das bitte erklären?", "Можеш це пояснити?"], ["Ich kann das nicht verstehen.", "Я не можу цього зрозуміти."], ["Danke für Ihre Hilfe!", "Дякую за допомогу!"]] },
  ],
  dialog: {
    t: "Фото на телефоні",
    lines: [
      ["Anna", "Ist das deine Familie?", "Це твоя родина?"],
      ["Olena", "Ja. Das sind meine Eltern, und das ist mein Bruder Andrij.", "Так. Це мої батьки, а це мій брат Андрій."],
      ["Anna", "Wie alt ist dein Bruder?", "Скільки років твоєму братові?"],
      ["Olena", "Er ist vierzehn. Er wohnt mit meinen Eltern in der Ukraine.", "Чотирнадцять. Він живе з моїми батьками в Україні."],
      ["Anna", "Und wer ist die Frau hier?", "А хто ця жінка?"],
      ["Olena", "Das ist meine Tante. Sie wohnt in Köln. Ihr Mann ist Deutscher.", "Це моя тітка. Вона живе в Кельні. Її чоловік — німець."],
      ["Anna", "Kannst du sie oft besuchen?", "Ти можеш часто її відвідувати?"],
      ["Olena", "Nein, leider nicht. Ich muss viel lernen. Aber am Wochenende war ich bei ihr.", "Ні, на жаль. Мені треба багато вчитися. Але на вихідних я була в неї."],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist ___ Mutter. (мій)", a: ["meine"] },
    { t: "gap", q: "Max und ___ Schwester wohnen in Wesel. (його)", a: ["seine"], why: "Власник — Макс (sein), річ — die Schwester → seine." },
    { t: "gap", q: "Anna besucht ___ Bruder. (її)", a: ["ihren"], why: "Власниця — Анна (ihr), der Bruder в Akkusativ → ihren." },
    { t: "gap", q: "Gestern ___ ich krank. (sein, минуле)", a: ["war"] },
    { t: "gap", q: "Wir ___ keine Zeit. (haben, минуле)", a: ["hatten"] },
    { t: "gap", q: "___ du mir helfen? (können)", a: ["Kannst"] },
    { t: "gap", q: "Er ___ heute arbeiten. (müssen)", a: ["muss"], why: "er muss — без закінчення." },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich kann gut kochen.", "Ich kann kochen gut.", "Ich gut kann kochen."], a: 0, why: "Інфінітив — у кінці." },
    { t: "mc", q: "Як сказати «Мені 30 років»?", o: ["Ich habe 30 Jahre.", "Ich bin 30 Jahre alt.", "Mir ist 30 Jahre."], a: 1 },
    { t: "mc", q: "«Du musst nicht kommen» означає:", o: ["Тобі не можна приходити.", "Тобі не обов’язково приходити.", "Ти не можеш прийти."], a: 1 },
    { t: "mc", q: "Жінка з Польщі — це …", o: ["Polnisch", "Polin", "Polerin"], a: 1 },
    { t: "mc", q: "Множина без однини:", o: ["die Eltern", "die Brüder", "die Tanten"], a: 0, why: "«Батьки» — лише множина." },
  ],
};
