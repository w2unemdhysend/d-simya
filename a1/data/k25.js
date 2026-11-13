// Розділ 25 (A2). Подарунки й привітання: дієслова з Dativ (helfen, danken, gratulieren, gehören), два додатки
// (Ich schenke meiner Freundin ein Buch), порядок займенників (Ich schenke es ihr), привітання й листівки.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Дні народження героїв справжні:
// Тарас Шевченко — 9 березня, Леся Українка — 25 лютого.
export default {
  n: 25, part: "A2.2", title: "Подарунки й привітання", book: null,
  goals: [
    "казати, кому що даруєш: Ich schenke meiner Freundin ein Buch",
    "вживати дієслова з Dativ: helfen, danken, gratulieren, gehören",
    "ставити займенники в правильному порядку: Ich schenke es ihr",
    "вітати й підписувати листівки",
  ],
  grammar: [
    {
      id: "verbDat", t: "Дієслова з Dativ: helfen, danken, gratulieren", cat: "verb",
      text: [
        "Деякі дієслова вимагають **Dativ** (кому?), а не Akkusativ. Часто це збігається з українською: `Ich helfe **dir**.` — «Я допомагаю **тобі**». Але не завжди: `Ich gratuliere **dir**.` — «Я вітаю **тебе**».",
        "Найчастіші: `helfen, danken, gratulieren, gefallen, gehören, schmecken, passen, stehen` (личити), `antworten, zuhören, glauben` (вірити комусь).",
        "Займенники в Dativ — з розділу 11: `mir, dir, ihm, ihr, uns, euch, ihnen, Ihnen`.",
      ],
      tables: [
        { head: ["Дієслово", "Приклад", "Українською"], rows: [["helfen", "Ich helfe meiner Nachbarin.", "Я допомагаю сусідці."], ["danken", "Wir danken Ihnen.", "Ми дякуємо Вам."], ["gratulieren", "Ich gratuliere dir zum Geburtstag.", "Вітаю тебе з днем народження."], ["gehören", "Das Buch gehört mir.", "Ця книжка моя."], ["gefallen", "Das Geschenk gefällt ihm.", "Подарунок йому подобається."], ["antworten", "Sie antwortet ihrem Lehrer.", "Вона відповідає своєму вчителеві."]] },
      ],
      ex: [["Kannst du mir helfen?", "Можеш мені допомогти?"], ["Ich gratuliere dir herzlich!", "Щиро вітаю тебе!"], ["Wem gehört die Tasche?", "Чия це сумка?"], ["Der Kuchen schmeckt den Kindern.", "Дітям смакує пиріг."], ["Glaub mir!", "Повір мені!"]],
      warn: ["`Ich gratuliere dich` — помилка: `gratulieren` вимагає Dativ: `Ich gratuliere dir.`", "`Ich helfe dich` — помилка: `Ich helfe dir.`"],
    },
    {
      id: "datAkk", t: "Кому й що: Ich schenke meiner Freundin ein Buch", cat: "noun",
      text: [
        "Дієслова на кшталт «давати» мають два додатки: **кому?** (Dativ, зазвичай людина) і **що?** (Akkusativ, зазвичай річ): `Ich schenke **meiner Freundin** **ein Buch**.`",
        "Такі дієслова: `geben, schenken, zeigen, bringen, schicken, erklären, empfehlen, leihen, kaufen` (комусь).",
        "Коли обидва додатки — іменники, спершу йде **Dativ**, потім **Akkusativ**: `Ich gebe dem Kind den Ball.`",
      ],
      tables: [
        { head: ["Хто", "Дієслово", "Кому? (Dativ)", "Що? (Akkusativ)"], rows: [["Ich", "schenke", "meiner Mutter", "Blumen."], ["Max", "zeigt", "seinen Freunden", "die Stadt."], ["Wir", "schicken", "dem Lehrer", "eine Karte."], ["Sie", "empfiehlt", "der Kundin", "ein Buch."]] },
      ],
      ex: [["Ich schenke meinem Bruder ein Fahrrad.", "Я дарую братові велосипед."], ["Zeigst du mir deine Fotos?", "Покажеш мені свої фото?"], ["Die Lehrerin erklärt den Schülern die Regel.", "Учителька пояснює учням правило."], ["Kannst du mir dein Buch leihen?", "Можеш позичити мені свою книжку?"]],
      tips: ["Питай себе: **кому?** — Dativ, **що?** — Akkusativ. Людина майже завжди в Dativ."],
    },
    {
      id: "pronOrder", t: "Два займенники: Ich schenke es ihr", cat: "pron",
      text: [
        "Коли **обидва** додатки — займенники, порядок навпаки: спершу **Akkusativ**, потім Dativ: `Ich schenke **es ihr**.`",
        "Коли один додаток — займенник, а другий — іменник, займенник стоїть **першим**: `Ich schenke **ihr** ein Buch.` `Ich schenke **es** meiner Freundin.`",
        "Коротко: займенник — уперед; два займенники — Akkusativ перед Dativ.",
      ],
      tables: [
        { head: ["Обидва іменники", "Один займенник", "Обидва займенники"], rows: [["Ich gebe dem Kind den Ball.", "Ich gebe ihm den Ball.", "Ich gebe ihn ihm."], ["Er zeigt Anna das Foto.", "Er zeigt es Anna.", "Er zeigt es ihr."]] },
      ],
      ex: [["Wo ist mein Schlüssel? – Ich habe ihn dir schon gegeben.", "Де мій ключ? – Я вже тобі його {дав|дала}."], ["Das Bild ist schön! – Ich schenke es dir.", "Яка гарна картина! – Дарую її тобі."], ["Zeigst du mir das Foto? – Ja, ich zeige es dir gleich.", "Покажеш мені фото? – Так, зараз тобі його покажу."]],
      warn: ["`Ich gebe ihm ihn` — помилка: два займенники — спершу Akkusativ: `Ich gebe ihn ihm.`"],
    },
    {
      id: "glueckwunsch", t: "Привітання: Herzlichen Glückwunsch!", cat: "rede",
      text: [
        "`Herzlichen Glückwunsch zum Geburtstag!` — «Щиро вітаю з днем народження!» `zum`, бо `der Geburtstag` (zu + dem). Так само: `zur Hochzeit` (die), `zum neuen Job`, `zur bestandenen Prüfung`.",
        "`Alles Gute!` — «Усього найкращого!», `Viel Glück!` — «Щасти!», `Frohe Weihnachten!`, `Frohe Ostern!`, `Ein gutes neues Jahr!`",
        "У Німеччині вітати з днем народження **заздалегідь** вважають поганою прикметою: вітають у сам день або пізніше (`nachträglich`).",
        "Листівка: `Liebe Anna, …` / `Lieber Max, …`, у кінці — `Viele Grüße` або `Herzliche Grüße` і підпис: `dein` чи `deine` + ім’я.",
      ],
      ex: [["Herzlichen Glückwunsch zum Geburtstag!", "Щиро вітаю з днем народження!"], ["Alles Gute und viel Gesundheit!", "Усього найкращого й міцного здоров’я!"], ["Ich wünsche dir viel Erfolg im neuen Job!", "Бажаю тобі успіху на новій роботі!"], ["Liebe Anna, alles Gute zum Geburtstag! {Dein Taras|Deine Lessja}", "Люба Анно, усього найкращого з днем народження! {Твій Тарас|Твоя Леся}"]],
      tips: ["Подарунок у Німеччині зазвичай розгортають одразу, при тому, хто його приніс, і дякують."],
    },
  ],
  phrases: [
    { t: "Подарунок", list: [["Was schenken wir ihr?", "Що ми їй подаруємо?"], ["Das ist für dich!", "Це тобі!"], ["Oh, wie schön! Das freut mich sehr.", "О, як гарно! Мені дуже приємно."], ["Gefällt es dir?", "Тобі подобається?"]] },
    { t: "Привітання", list: [["Herzlichen Glückwunsch!", "Вітаю!"], ["Alles Gute zum Geburtstag!", "З днем народження!"], ["Viel Glück bei der Prüfung!", "Щасти на іспиті!"], ["Frohe Weihnachten!", "Щасливого Різдва!"]] },
    { t: "Допомога", list: [["Kann ich dir helfen?", "Тобі допомогти?"], ["Danke für deine Hilfe!", "Дякую за допомогу!"], ["Wem gehört das?", "Чиє це?"]] },
  ],
  dialog: {
    t: "Подарунок для Анни",
    lines: [
      ["Max", "Anna hat am Samstag Geburtstag. Was schenken wir ihr?", "В Анни в суботу день народження. Що ми їй подаруємо?"],
      ["{Taras|Lessja}", "Vielleicht ein Buch? Sie liest doch so gern.", "Може, книжку? Вона ж так любить читати."],
      ["Max", "Ein Buch hat sie schon von ihrer Schwester bekommen.", "Книжку їй уже подарувала сестра."],
      ["{Taras|Lessja}", "{Dann male ich ihr ein Bild. Ich schenke es ihr mit einem schönen Rahmen.|Dann schreibe ich ihr ein Gedicht. Ich schenke es ihr mit einer schönen Karte.}", "{Тоді я намалюю їй картину. Подарую її в гарній рамці.|Тоді я напишу їй вірш. Подарую його з гарною листівкою.}"],
      ["Max", "Super Idee! Und ich backe ihr einen Kuchen.", "Чудова ідея! А я спечу їй торт."],
      ["{Taras|Lessja}", "Und wer bringt ihr Blumen?", "А хто принесе їй квіти?"],
      ["Max", "Das machen wir zusammen. Wir gratulieren ihr am Samstag um zehn, okay?", "Це зробимо разом. Привітаємо її в суботу о десятій, гаразд?"],
      ["{Taras|Lessja}", "Am Samstag? Kann ich ihr nicht schon am Freitag gratulieren?", "У суботу? А можна привітати її вже в п’ятницю?"],
      ["Max", "Nein! In Deutschland gratuliert man nicht vorher. Das bringt Unglück!", "Ні! У Німеччині заздалегідь не вітають. Це на нещастя!"],
      ["{Taras|Lessja}", "{Wirklich? Gut zu wissen! Mein Geburtstag ist übrigens am neunten März.|Wirklich? Gut zu wissen! Mein Geburtstag ist übrigens am fünfundzwanzigsten Februar.}", "{Справді? Добре знати! До речі, мій день народження — дев’ятого березня.|Справді? Добре знати! До речі, мій день народження — двадцять п’ятого лютого.}"],
      ["Max", "Dann gratulieren wir dir genau an dem Tag, nicht früher!", "Тоді привітаємо тебе саме того дня, не раніше!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich helfe ___. (du)", a: ["dir"] },
    { t: "gap", q: "Wir gratulieren ___ zum Geburtstag. (sie, одна)", a: ["ihr"] },
    { t: "gap", q: "Das Buch gehört ___. (ich)", a: ["mir"] },
    { t: "gap", q: "Ich schenke ___ Mutter Blumen. (meine)", a: ["meiner"], why: "Кому? — Dativ: meiner Mutter." },
    { t: "gap", q: "Max zeigt ___ Freund die Stadt. (sein)", a: ["seinem"] },
    { t: "gap", q: "Der Ball? Ich gebe ___ dem Kind. (er)", a: ["ihn"], why: "Займенник — уперед; що? — Akkusativ: ihn." },
    { t: "gap", q: "Herzlichen Glückwunsch ___ Geburtstag!", a: ["zum"] },
    { t: "gap", q: "Herzlichen Glückwunsch ___ Hochzeit!", a: ["zur"] },
    { t: "mc", q: "Як правильно?", o: ["Ich gratuliere dich.", "Ich gratuliere dir.", "Ich gratuliere du."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich gebe ihm ihn.", "Ich gebe ihn ihm.", "Ich ihn gebe ihm."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich schenke ein Buch ihr.", "Ich schenke ihr ein Buch.", "Ich ihr schenke ein Buch."], a: 1 },
    { t: "mc", q: "Коли в Німеччині вітають з днем народження?", o: ["за тиждень до нього", "у сам день або пізніше", "лише листівкою"], a: 1 },
    { t: "mc", q: "«Alles Gute!» означає…", o: ["Усього найкращого!", "Усе гаразд.", "Добраніч!"], a: 0 },
  ],
};
