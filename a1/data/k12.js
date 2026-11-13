// Розділ 12. У місті: дорога й транспорт. Граматика — як у розділі 12 Die neue Linie 1, тема наша.
export default {
  n: 12, part: "A1.2", title: "Дорога в місті", book: null,
  goals: [
    "запитати дорогу й зрозуміти пояснення",
    "сказати, чим їдеш і звідки та куди",
    "сказати, де щось розташоване (im, am, neben…)",
    "дати пораду чи вказівку на «ти»: Komm!, Nimm den Bus!",
  ],
  grammar: [
    {
      id: "artDat", t: "Артикль у Dativ: dem, der, dem, den", cat: "noun",
      text: [
        "Повна таблиця артиклів A1 тепер готова. У Dativ: **der → dem**, **die → der**, **das → dem**, множина **die → den** (і до іменника множини додається **-n**, якщо його там ще немає: `den Kindern`).",
        "Злиття, які кажуть майже завжди: **zum** (zu dem), **zur** (zu der), **beim** (bei dem), **vom** (von dem), **im** (in dem), **am** (an dem).",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [
          ["Nominativ", "der Bahnhof", "die Post", "das Kino", "die Kinder"],
          ["Akkusativ", "den Bahnhof", "die Post", "das Kino", "die Kinder"],
          ["Dativ", "**dem** Bahnhof", "**der** Post", "**dem** Kino", "**den** Kinder**n**"],
          ["Dativ ein/kein", "einem / keinem", "einer / keiner", "einem / keinem", "— / keinen"],
        ] },
      ],
      ex: [["Ich fahre mit dem Bus.", "Я їду автобусом."], ["Wir gehen zur Post.", "Ми йдемо на пошту."], ["Er kommt aus der Schule.", "Він іде зі школи."], ["Ich spiele mit den Kindern.", "Я граю з дітьми."]],
      warn: ["`mit der Bus` — помилка: der Bus у Dativ → `mit dem Bus`."],
    },
    {
      id: "praepDat", t: "Прийменники з Dativ: aus, bei, mit, nach, seit, von, zu", cat: "prep",
      text: [
        "Сім прийменників **завжди** вимагають Dativ. Їх вчать списком, він звучить як віршик: **aus — bei — mit — nach — seit — von — zu**.",
        "**Куди?** — `zu` (до людей, установ, місць у місті: `zum Arzt`, `zur Bank`) і `nach` (до міст, країн без артикля й у виразі `nach Hause`: `nach Wesel`, `nach Polen`).",
        "**Звідки?** — `aus` (зсередини, з країни/міста: `aus dem Haus`, `aus Polen`) і `von` (від людей і місць: `vom Arzt`, `von der Arbeit`).",
        "**Чим/з ким?** — `mit`: `mit dem Zug`, `mit meiner Freundin`.",
      ],
      tables: [
        { head: ["Питання", "Прийменник", "Приклад"], rows: [
          ["Wohin? (до людини, місця)", "zu", "`zum Bahnhof`, `zur Apotheke`, `zu meiner Oma`"],
          ["Wohin? (місто, країна)", "nach", "`nach Düsseldorf`, `nach Hause`"],
          ["Woher? (зсередини, з країни)", "aus", "`aus dem Kino`, `aus der Ukraine`"],
          ["Woher? (від людини, місця)", "von", "`vom Arzt`, `von der Arbeit`"],
          ["Wo? (у когось)", "bei", "`bei der Bank`, `bei Freunden`"],
          ["Wie? / Mit wem?", "mit", "`mit dem Fahrrad`, `mit Anna`"],
          ["Seit wann?", "seit", "`seit einer Woche` (розділ 14)"],
        ] },
      ],
      ex: [["Wie komme ich zum Rathaus?", "Як мені дістатися до ратуші?"], ["Ich fahre nach Wesel zur Volkshochschule.", "Я їду до Везеля в народну вищу школу."], ["Sie kommt gerade vom Arzt.", "Вона саме йде від лікаря."], ["Wir fahren mit der Straßenbahn.", "Ми їдемо трамваєм."], ["Nach dem Kurs gehe ich nach Hause.", "Після курсу я йду додому."]],
      tips: ["`nach` має ще значення «після»: `nach dem Kurs` — після курсу."],
      warn: ["`Ich gehe zu Hause` — помилка; додому — `nach Hause`.", "`Ich fahre nach Bahnhof` — до місць у місті `zu`: `zum Bahnhof`."],
    },
    {
      id: "wechsel", t: "Де? in, an, auf, neben… + Dativ", cat: "prep",
      text: [
        "Прийменники місця **in, an, auf, neben, vor, hinter, über, unter, zwischen** на питання **wo?** (де?) вимагають **Dativ**: `im Supermarkt`, `am Bahnhof`, `neben der Post`.",
        "На питання **wohin?** (куди?) ті самі прийменники вимагають **Akkusativ** (як `ins Kino` у розділі 9). Поки що головне — Dativ для «де?».",
        "**in** — всередині, **an** — біля, збоку, на вертикальному (`an der Wand`, `am Fenster`), **auf** — на горизонтальному, зверху (`auf dem Tisch`).",
      ],
      tables: [
        { head: ["Прийменник", "Значення", "Wo? (Dativ)"], rows: [["in", "у, в", "`im Park`, `in der Stadt`"], ["an", "біля, на (збоку)", "`am Bahnhof`, `an der Ampel`"], ["auf", "на (зверху)", "`auf dem Tisch`, `auf dem Markt`"], ["neben", "поруч із", "`neben der Bank`"], ["vor", "перед", "`vor dem Kino`"], ["hinter", "за, позаду", "`hinter dem Haus`"], ["über", "над", "`über dem Sofa`"], ["unter", "під", "`unter dem Bett`"], ["zwischen", "між", "`zwischen der Post und der Bank`"]] },
      ],
      ex: [["Die Apotheke ist neben der Bäckerei.", "Аптека поруч із пекарнею."], ["Ich warte vor dem Kino.", "Я чекаю перед кінотеатром."], ["Der Schlüssel liegt auf dem Tisch.", "Ключ лежить на столі."], ["Wir treffen uns am Bahnhof.", "Зустрінемося на вокзалі."], ["Das Café ist zwischen der Kirche und dem Rathaus.", "Кав’ярня між церквою і ратушею."]],
      tips: ["Зручна пара: `Wo bist du? – Im Park.` / `Wohin gehst du? – In den Park.`"],
    },
    {
      id: "impDu", t: "Наказовий спосіб на «ти»: Komm!, Nimm!", cat: "verb",
      text: [
        "Форма на «ти» = форма `du` **без -st і без du**: `du kommst → Komm!`, `du fährst → Fahr!` — але **a→ä не зберігається**: `Fahr!` (не Fähr!). А **e→i зберігається**: `du nimmst → Nimm!`, `du liest → Lies!`",
        "Якщо основа на -t/-d, додається -e: `Warte!`, `Antworte!`. Відокремлювана приставка — у кінці: `Ruf mich an!`, `Steig in Wesel um!`",
        "`sein` → **Sei!**: `Sei pünktlich!`",
        "Щоб прозвучало м’якше, додають `bitte`, `doch` або `mal`: `Komm doch mit!`, `Warte mal!`",
      ],
      tables: [
        { head: ["du-форма", "Наказ", "Значення"], rows: [["du kommst", "Komm!", "Іди сюди!"], ["du gehst", "Geh geradeaus!", "Іди прямо!"], ["du fährst", "Fahr langsam!", "Їдь повільно!"], ["du nimmst", "Nimm den Bus!", "Сідай на автобус!"], ["du liest", "Lies den Text!", "Прочитай текст!"], ["du wartest", "Warte!", "Зачекай!"], ["du rufst an", "Ruf mich an!", "Подзвони мені!"], ["du bist", "Sei leise!", "Будь тихіше!"]] },
      ],
      ex: [["Nimm die Linie 44 und steig am Markt aus.", "Сідай на сорок четвертий і виходь біля ринку."], ["Geh hier rechts und dann geradeaus.", "Іди тут праворуч, а потім прямо."], ["Ruf mich bitte an!", "Подзвони мені, будь ласка!"]],
      warn: ["`Fähr!` — помилка, у наказі a→ä немає: `Fahr!`.", "`Nehm den Bus!` — у розмові чути, але правильно `Nimm den Bus!`."],
    },
    {
      id: "weg", t: "Як питати й пояснювати дорогу", cat: "rede",
      text: [
        "Почни з `Entschuldigung,` і спитай `Wie komme ich zum/zur …?` або `Wo ist hier …?`",
        "Відповіді будуються з наказу (на «Ви»: `Gehen Sie…`), напрямків і прийменників: `geradeaus` (прямо), `links/rechts` (ліворуч/праворуч), `an der Ampel` (на світлофорі), `an der Kreuzung` (на перехресті), `die zweite Straße links` (друга вулиця ліворуч).",
      ],
      ex: [["Entschuldigung, wie komme ich zum Bahnhof?", "Перепрошую, як мені дістатися до вокзалу?"], ["Gehen Sie geradeaus und an der Ampel links.", "Ідіть прямо, а на світлофорі ліворуч."], ["Nehmen Sie die zweite Straße rechts.", "Поверніть на другу вулицю праворуч."], ["Ist das weit? – Nein, nur fünf Minuten zu Fuß.", "Це далеко? – Ні, лише п’ять хвилин пішки."], ["Fahren Sie mit dem Bus bis zur Haltestelle Markt.", "Їдьте автобусом до зупинки «Ринок»."]],
    },
  ],
  phrases: [
    { t: "Запитати дорогу", list: [["Entschuldigung, wie komme ich zur Post?", "Перепрошую, як дістатися до пошти?"], ["Wo ist hier eine Apotheke?", "Де тут аптека?"], ["Ist das weit?", "Це далеко?"], ["Kann man zu Fuß gehen?", "Можна дійти пішки?"]] },
    { t: "Транспорт", list: [["Welcher Bus fährt zum Bahnhof?", "Який автобус їде до вокзалу?"], ["Wo muss ich aussteigen?", "Де мені виходити?"], ["Ich fahre mit dem Fahrrad.", "Я їду велосипедом."], ["Der Bus fährt alle zwanzig Minuten.", "Автобус ходить кожні двадцять хвилин."]] },
  ],
  dialog: {
    t: "Дорога до Bürgerbüro",
    lines: [
      ["{Taras|Lesia}", "Entschuldigung, wie komme ich zum Bürgerbüro?", "Перепрошую, як мені дістатися до бюро громадян?"],
      ["Mann", "Zum Bürgerbüro? Das ist im Rathaus, am Markt.", "До бюро громадян? Воно в ратуші, біля ринку."],
      ["{Taras|Lesia}", "Ist das weit?", "Це далеко?"],
      ["Mann", "Nein, nicht so weit. Gehen Sie hier geradeaus bis zur Ampel. Dann links.", "Ні, не дуже. Ідіть тут прямо до світлофора. Потім ліворуч."],
      ["{Taras|Lesia}", "Bis zur Ampel und dann links. Und dann?", "До світлофора, а потім ліворуч. А потім?"],
      ["Mann", "Dann sehen Sie schon die Kirche. Das Rathaus ist gegenüber der Kirche.", "Тоді Ви вже побачите церкву. Ратуша навпроти церкви."],
      ["{Taras|Lesia}", "Vielen Dank!", "Щиро дякую!"],
      ["Mann", "Gern geschehen!", "Нема за що!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich fahre mit ___ Bus.", a: ["dem"], why: "mit + Dativ, der Bus → dem." },
    { t: "gap", q: "Wir gehen ___ Apotheke. (zu + der)", a: ["zur"] },
    { t: "gap", q: "Wie komme ich ___ Bahnhof? (zu + dem)", a: ["zum"] },
    { t: "gap", q: "Morgen fahre ich ___ Düsseldorf.", a: ["nach"], why: "Місто → nach." },
    { t: "gap", q: "Sie kommt ___ der Ukraine.", a: ["aus"] },
    { t: "gap", q: "Die Apotheke ist neben ___ Bank.", a: ["der"], why: "Wo? → Dativ, die Bank → der." },
    { t: "gap", q: "___ mich an! (anrufen, на «ти»)", a: ["Ruf"] },
    { t: "gap", q: "___ den Bus Nummer 44! (nehmen, на «ти»)", a: ["Nimm"] },
    { t: "mc", q: "Wo bist du? – Ich bin ___ Park.", o: ["in den", "im", "ins"], a: 1, why: "Wo? → Dativ: in dem = im." },
    { t: "mc", q: "Наказ від fahren на «ти»:", o: ["Fähr!", "Fahr!", "Fahrst!"], a: 1 },
    { t: "mc", q: "Наказ від sein на «ти»:", o: ["Bist pünktlich!", "Sei pünktlich!", "Sein pünktlich!"], a: 1 },
    { t: "mc", q: "Ich spiele mit ___ Kindern.", o: ["die", "den", "der"], a: 1, why: "Множина в Dativ: den + -n." },
  ],
};
