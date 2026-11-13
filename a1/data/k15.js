// Розділ 15. Свята й гості. Граматика — як у розділі 15 Die neue Linie 1, тема наша.
export default {
  n: 15, part: "A1.2", title: "Свята й гості", book: null,
  goals: [
    "запросити на свято, прийняти чи відхилити запрошення",
    "привітати з днем народження, Різдвом, Новим роком",
    "сказати, чиє щось: das Auto von meinem Bruder, Annas Auto",
    "відповідати «doch» на заперечне питання",
    "звернутися з проханням до кількох друзів: Kommt! Bringt…mit!",
  ],
  grammar: [
    {
      id: "vonDat", t: "Чиє? von + Dativ і Annas", cat: "prep",
      text: [
        "У розмові «чиє» кажуть через **von + Dativ**: `das Auto von meinem Bruder` (машина мого брата), `die Wohnung von meiner Tante`.",
        "З **іменами** — коротше: ім’я + **-s** перед річчю, **без апострофа**: `Annas Auto`, `Peters Geburtstag`. Якщо ім’я закінчується на -s, -ß, -x, -z — апостроф: `Max’ Fahrrad` (у розмові частіше `das Fahrrad von Max`).",
      ],
      ex: [["Das ist das Auto von meinem Bruder.", "Це машина мого брата."], ["Ist das die Jacke von Anna? – Ja, das ist Annas Jacke.", "Це куртка Анни? – Так, це Аннина куртка."], ["Wir feiern den Geburtstag von unserer Oma.", "Ми святкуємо день народження нашої бабусі."], ["Das ist ein Geschenk von meinen Kollegen.", "Це подарунок від моїх колег."]],
      warn: ["`Anna's Auto` з апострофом — англійська звичка. По-німецьки `Annas Auto`."],
    },
    {
      id: "doch", t: "ja, nein, doch", cat: "satz",
      text: [
        "На звичайне питання відповідають `ja` або `nein`.",
        "На **заперечне** питання (з `nicht` або `kein`) відповідь «ні, так!» — це **doch**: `Kommst du nicht? – Doch, ich komme!` (Ти не прийдеш? – Та ні, прийду!). Якщо погоджуєшся із запереченням — `nein`: `Nein, ich komme nicht.`",
        "`doch` в наказі пом’якшує: `Kommt doch mit!` — Та ходіть з нами!",
      ],
      tables: [
        { head: ["Питання", "Так (стверджую)", "Ні (заперечую)"], rows: [["Kommst du?", "Ja, ich komme.", "Nein, ich komme nicht."], ["Kommst du nicht?", "**Doch**, ich komme.", "Nein, ich komme nicht."], ["Hast du kein Geschenk?", "**Doch**, ich habe eins.", "Nein, ich habe keins."]] },
      ],
      ex: [["Hast du keine Zeit? – Doch, am Abend habe ich Zeit.", "У тебе немає часу? – Є, увечері маю."], ["Magst du keinen Kuchen? – Doch, sehr!", "Ти не любиш пиріг? – Та люблю, дуже!"], ["Bist du nicht müde? – Nein, gar nicht.", "Ти не втомився? – Ні, зовсім ні."]],
      warn: ["`Kommst du nicht? – Ja!` звучить незрозуміло. Щоб сказати «прийду», треба `Doch!`"],
    },
    {
      id: "impIhr", t: "Наказ до кількох: Kommt! і огляд усіх форм", cat: "verb",
      text: [
        "До кількох людей на «ти» (`ihr`) наказ = форма `ihr` **без ihr**: `ihr kommt → Kommt!`, `ihr bringt mit → Bringt … mit!`",
        "Тепер маєш усі три форми наказу. До однієї людини на «ти» — розділ 12, на «Ви» — розділ 3.",
      ],
      tables: [
        { head: ["", "du", "ihr", "Sie"], rows: [["kommen", "Komm!", "Kommt!", "Kommen Sie!"], ["mitbringen", "Bring … mit!", "Bringt … mit!", "Bringen Sie … mit!"], ["nehmen", "Nimm!", "Nehmt!", "Nehmen Sie!"], ["warten", "Warte!", "Wartet!", "Warten Sie!"], ["sein", "Sei!", "Seid!", "Seien Sie!"]] },
      ],
      ex: [["Kommt doch am Samstag zu uns!", "Приходьте до нас у суботу!"], ["Bringt bitte etwas zu trinken mit!", "Принесіть, будь ласка, щось випити!"], ["Seid bitte pünktlich!", "Будьте, будь ласка, вчасно!"], ["Feiert schön!", "Гарно святкуйте!"]],
    },
    {
      id: "feste", t: "Свята в Німеччині", cat: "rede",
      text: [
        "**Weihnachten** святкують 24–26 грудня. Головний вечір — **Heiligabend** 24-го, 25 і 26 грудня — вихідні дні. Перед Різдвом — `Adventszeit` і `Weihnachtsmärkte`.",
        "**Silvester** — 31 грудня, ввечері феєрверки. **Neujahr** — 1 січня, вихідний. **Ostern** — Великдень, з вихідними Karfreitag і Ostermontag. Католицький і протестантський Великдень часто не збігається з православним.",
        "У Рейнланді, зокрема в Ксантені й околицях, святкують **Karneval**: сезон починається **11.11 об 11:11**, найбільші дні — у лютому чи березні (`Rosenmontag`).",
        "У неділю й у святкові дні (`Feiertage`) магазини в Німеччині зачинені.",
      ],
      tables: [
        { head: ["Свято", "Побажання"], rows: [["Geburtstag", "Herzlichen Glückwunsch zum Geburtstag! / Alles Gute!"], ["Weihnachten", "Frohe Weihnachten!"], ["Silvester / Neujahr", "Guten Rutsch! / Frohes neues Jahr!"], ["Ostern", "Frohe Ostern!"], ["Hochzeit", "Herzlichen Glückwunsch zur Hochzeit!"]] },
      ],
      ex: [["Wir feiern am Samstag meinen Geburtstag. Kommst du?", "У суботу ми святкуємо мій день народження. Прийдеш?"], ["Guten Rutsch ins neue Jahr!", "Щасливого переходу в новий рік!"]],
      tips: ["`Guten Rutsch!` кажуть **до** Нового року (буквально «гарного ковзання» в новий рік), а `Frohes neues Jahr!` — уже після опівночі й у січні."],
    },
    {
      id: "einladung", t: "Запрошення: так чи ні", cat: "rede",
      text: [
        "Запрошення зазвичай містить: що (`Geburtstagsparty`), коли (`am Samstag um 19 Uhr`), де (`bei mir`) і чи треба щось принести.",
        "Прийняти: `Ich komme gern!` Відхилити ввічливо — з причиною (`denn` з розділу 14): `Leider kann ich nicht kommen, denn ich muss arbeiten.`",
        "У гості в Німеччині зазвичай приносять невеликий подарунок: квіти, вино, солодощі. На день народження вітають у сам день, а **не заздалегідь** — вітати раніше вважається поганою прикметою.",
      ],
      ex: [["Ich lade dich zu meiner Party ein.", "Я запрошую тебе на свою вечірку."], ["Danke für die Einladung! Ich komme gern.", "Дякую за запрошення! Охоче прийду."], ["Leider kann ich nicht, denn wir besuchen meine Eltern.", "На жаль, не можу, бо ми їдемо до батьків."], ["Soll ich etwas mitbringen?", "Мені щось принести?"]],
    },
  ],
  phrases: [
    { t: "Запросити", list: [["Ich lade dich zu meinem Geburtstag ein.", "Запрошую тебе на свій день народження."], ["Die Party ist am Samstag um acht.", "Вечірка в суботу о восьмій."], ["Kommt doch auch!", "Приходьте теж!"]] },
    { t: "Відповісти", list: [["Danke für die Einladung!", "Дякую за запрошення!"], ["Ich komme gern.", "Охоче прийду."], ["Leider kann ich nicht kommen.", "На жаль, не можу прийти."], ["Soll ich etwas mitbringen?", "Мені щось принести?"]] },
    { t: "Привітати", list: [["Herzlichen Glückwunsch!", "Щиро вітаю!"], ["Alles Gute zum Geburtstag!", "З днем народження!"], ["Frohe Weihnachten!", "Веселого Різдва!"], ["Guten Rutsch!", "Щасливого Нового року! (до свята)"]] },
  ],
  dialog: {
    t: "Запрошення на день народження",
    lines: [
      ["Anna", "Hallo {Taras|Lesia}! Am Samstag habe ich Geburtstag und mache eine Party. Kommst du?", "Привіт, {Тарасе|Лесю}! У суботу в мене день народження, я влаштовую вечірку. Прийдеш?"],
      ["{Taras|Lesia}", "Oh, danke für die Einladung! Um wie viel Uhr?", "О, дякую за запрошення! О котрій?"],
      ["Anna", "Um sieben, bei mir. Max kommt auch. Kommst du nicht?", "О сьомій, у мене. Макс теж прийде. Ти не прийдеш?"],
      ["{Taras|Lesia}", "Doch, natürlich komme ich! Soll ich etwas mitbringen?", "Та прийду, звісно! Мені щось принести?"],
      ["Anna", "Vielleicht einen Salat? Und bringt gute Laune mit!", "Може, салат? І приходьте в гарному настрої!"],
      ["{Taras|Lesia}", "Gern! Dann bis Samstag!", "Залюбки! Тоді до суботи!"],
      ["", "…", "…"],
      ["{Taras|Lesia}", "Herzlichen Glückwunsch zum Geburtstag, Anna! Das ist für dich.", "З днем народження, Анно! Це тобі."],
      ["Anna", "Oh, Blumen! Wie schön! Vielen Dank!", "О, квіти! Як гарно! Щиро дякую!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist das Auto ___ meinem Bruder.", a: ["von"] },
    { t: "mc", q: "Як сказати «машина Анни»?", o: ["Anna's Auto", "Annas Auto", "das Auto Anna"], a: 1 },
    { t: "mc", q: "Kommst du nicht? – ___, ich komme!", o: ["Ja", "Doch", "Nein"], a: 1 },
    { t: "mc", q: "Hast du keine Zeit? (у тебе немає часу) – ___, ich habe keine Zeit.", o: ["Doch", "Nein", "Ja"], a: 1, why: "Погоджуєшся із запереченням → nein." },
    { t: "gap", q: "___ doch mit! (kommen, до друзів)", a: ["Kommt"] },
    { t: "gap", q: "___ bitte pünktlich! (sein, до друзів)", a: ["Seid"] },
    { t: "gap", q: "Bringt bitte einen Salat ___!", a: ["mit"] },
    { t: "mc", q: "Що кажуть 30 грудня?", o: ["Frohes neues Jahr!", "Guten Rutsch!", "Frohe Ostern!"], a: 1, why: "До Нового року — Guten Rutsch!" },
    { t: "mc", q: "Коли починається карнавальний сезон у Рейнланді?", o: ["1 січня", "11.11 об 11:11", "у Великдень"], a: 1 },
    { t: "mc", q: "Як ввічливо відмовитися?", o: ["Nein.", "Leider kann ich nicht kommen, denn ich muss arbeiten.", "Ich will nicht."], a: 1 },
  ],
};
