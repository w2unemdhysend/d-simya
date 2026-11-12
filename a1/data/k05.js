// Розділ 5. Тиждень і час
export default {
  n: 5, part: "A1.1", title: "Мій тиждень", book: "Die Woche von Familie Berger",
  goals: [
    "назвати дні тижня, частини доби й годину",
    "розповісти про свій звичайний день",
    "домовитися про зустріч і запис",
    "запитати, коли щось відчинено",
    "вживати дієслова зі зміною голосного й відокремлювані дієслова",
  ],
  grammar: [
    {
      id: "vokal", t: "Дієслова зі зміною голосного", cat: "verb",
      text: [
        "У частини неправильних дієслів голосний основи змінюється **лише у формах du та er/sie/es**. Решта форм — як у правильних дієслів.",
        "Три групи: **a → ä** (`fahren — du fährst`), **e → i** (`sprechen — du sprichst`), **e → ie** (`lesen — du liest`). Зміну видно в словнику: там для кожного дієслова дана форма `er …`.",
      ],
      tables: [
        { head: ["", "fahren (a→ä)", "essen (e→i)", "lesen (e→ie)", "nehmen"], rows: [
          ["ich", "fahre", "esse", "lese", "nehme"], ["du", "**fährst**", "**isst**", "**liest**", "**nimmst**"], ["er / sie / es", "**fährt**", "**isst**", "**liest**", "**nimmt**"],
          ["wir", "fahren", "essen", "lesen", "nehmen"], ["ihr", "fahrt", "esst", "lest", "nehmt"], ["sie / Sie", "fahren", "essen", "lesen", "nehmen"],
        ] },
        { cap: "Найчастіші", head: ["a → ä", "e → i", "e → ie"], rows: [["fahren, schlafen, tragen, waschen", "sprechen, essen, helfen, treffen, nehmen, vergessen", "lesen, sehen, fernsehen"], ["laufen (au → äu): er läuft", "geben: er gibt", "empfehlen: er empfiehlt"]] },
      ],
      ex: [["Fährst du mit dem Bus? – Nein, ich fahre mit dem Rad.", "Ти їдеш автобусом? – Ні, я їду велосипедом."], ["Sie schläft am Sonntag lange.", "У неділю вона довго спить."], ["Er liest gern Bücher.", "Він любить читати книжки."], ["Was isst du zum Frühstück?", "Що ти їси на сніданок?"], ["Hilfst du mir?", "Допоможеш мені?"]],
      warn: ["`ihr fährt` — помилка: у формі `ihr` зміни немає: `ihr fahrt`.", "`nehmen` змінюється сильніше: `du nimmst, er nimmt` (подвоєне m)."],
    },
    {
      id: "trennbar", t: "Відокремлювані дієслова: aufstehen", cat: "verb",
      text: [
        "Багато дієслів мають **приставку, яка відходить**: `aufstehen` → `Ich stehe um sieben Uhr auf.` Змінена частина стоїть на 2-му місці, приставка — **в самому кінці** речення. Разом вони утворюють «рамку».",
        "Відокремлюються наголошені приставки: **ab-, an-, auf-, aus-, ein-, mit-, vor-, zu-, zurück-, fern-** та інші. Наголос завжди на приставці: `ÁUFstehen`, `ÉINkaufen`.",
        "**Не** відокремлюються ненаголошені приставки **be-, ver-, er-, ent-, ge-, zer-, emp-**: `bezahlen — ich bezahle`, `verstehen — ich verstehe`.",
      ],
      tables: [
        { head: ["1", "2 (дієслово)", "середина", "кінець (приставка)"], rows: [["Ich", "stehe", "um sieben Uhr", "**auf**."], ["Wann", "fängt", "der Kurs", "**an**?"], ["Am Samstag", "kaufen", "wir", "**ein**."], ["Ruf", "mich bitte", "", "**an**!"]] },
      ],
      ex: [["Der Kurs fängt um halb neun an.", "Курс починається о пів на дев’яту."], ["Am Abend sehe ich fern.", "Увечері я дивлюся телевізор."], ["Ich rufe dich morgen an.", "Я подзвоню тобі завтра."], ["Holst du die Kinder ab?", "Ти забереш дітей?"], ["Kommst du mit?", "Підеш з нами?"]],
      tips: ["У словнику відокремлювані дієслова видно за формою: `er steht auf`."],
      warn: ["`Ich aufstehe um sieben` — помилка. Приставка відходить у кінець: `Ich stehe um sieben auf.`"],
    },
    {
      id: "uhr", t: "Котра година?", cat: "zeit",
      text: [
        "Є **офіційний** час (розклад, оголошення, записи): `14:30` = `vierzehn Uhr dreißig`. І **розмовний**, з годинником на 12 годин: `halb drei`.",
        "**halb** означає «пів на наступну годину»: `halb drei` = 2:30, як в українському «пів на третю». `Viertel nach` — чверть по, `Viertel vor` — за чверть.",
        "Запитують: `Wie spät ist es?` або `Wie viel Uhr ist es?` Відповідь: `Es ist …`",
      ],
      tables: [
        { head: ["Час", "Офіційно", "Розмовно"], rows: [
          ["7:00", "sieben Uhr", "sieben (Uhr)"], ["7:05", "sieben Uhr fünf", "fünf nach sieben"], ["7:15", "sieben Uhr fünfzehn", "Viertel nach sieben"],
          ["7:25", "sieben Uhr fünfundzwanzig", "fünf vor halb acht"], ["7:30", "sieben Uhr dreißig", "halb acht"], ["7:35", "sieben Uhr fünfunddreißig", "fünf nach halb acht"],
          ["7:45", "sieben Uhr fünfundvierzig", "Viertel vor acht"], ["7:50", "sieben Uhr fünfzig", "zehn vor acht"], ["19:00", "neunzehn Uhr", "sieben (abends)"],
        ] },
      ],
      ex: [["Wie spät ist es? – Es ist Viertel nach zehn.", "Котра година? – Чверть на одинадцяту."], ["Der Bus fährt um sieben Uhr dreiundvierzig.", "Автобус відправляється о 7:43."], ["Der Unterricht beginnt um halb neun.", "Заняття починаються о пів на дев’яту."]],
      tips: ["У грі «Числа на слух» є окремий режим для розмовного часу: тренуй його там."],
      warn: ["`halb acht` — це 7:30, **не** 8:30.", "`Uhr` (година на годиннику) і `Stunde` (година як тривалість) — різні слова: `um acht Uhr`, але `zwei Stunden`."],
    },
    {
      id: "zeitpraep", t: "am, um, von … bis: коли й скільки", cat: "zeit",
      text: [
        "**am** — з днями тижня й частинами доби: `am Montag`, `am Wochenende`, `am Morgen`, `am Abend`. Виняток: `in der Nacht`.",
        "**um** — з точним часом: `um acht Uhr`, `um halb neun`.",
        "**von … bis** — проміжок: `von neun bis fünf`. **ab** — починаючи з: `ab Montag`.",
        "Регулярне повторення — прислівник на **-s**, з малої літери: `montags` (щопонеділка), `morgens`, `abends`.",
        "Питання: `Wann?` (коли?) → `am Montag`, `um acht`. `Wie lange?` (як довго?) → `zwei Stunden`, `von neun bis zwölf`.",
      ],
      tables: [
        { head: ["Питання", "Прийменник", "Приклад"], rows: [["Wann? (день)", "am", "`am Freitag`, `am Nachmittag`"], ["Wann? (година)", "um", "`um 14 Uhr`"], ["Wie lange?", "von … bis", "`von acht bis zwölf Uhr`"], ["Ab wann?", "ab", "`ab Montag`, `ab neun Uhr`"]] },
      ],
      ex: [["Wann hast du Zeit? – Am Donnerstag um vier.", "Коли в тебе є час? – У четвер о четвертій."], ["Die Apotheke ist von acht bis neunzehn Uhr geöffnet.", "Аптека відчинена з восьмої до сьомої вечора."], ["Samstags gehe ich schwimmen.", "По суботах я ходжу плавати."]],
      warn: ["`in Montag` — помилка, з днями лише `am`.", "`am acht Uhr` — помилка, з годинами `um`."],
    },
    {
      id: "inversion", t: "Час на початку речення", cat: "satz",
      text: [
        "На перше місце можна поставити не лише підмет, а й час, місце чи інше слово. Тоді **дієслово однаково друге**, а підмет переходить **за дієслово**.",
        "Так німці кажуть дуже часто: `Am Montag arbeite ich.` Не плутай з українським порядком «У понеділок я працюю» — по-німецьки «я» стоїть після дієслова.",
      ],
      tables: [
        { head: ["1", "2 (дієслово)", "3 (підмет)", "далі"], rows: [["Ich", "arbeite", "", "am Montag."], ["Am Montag", "arbeite", "ich.", ""], ["Um sieben Uhr", "stehe", "ich", "auf."], ["Heute", "hat", "der Supermarkt", "lange geöffnet."]] },
      ],
      ex: [["Morgen habe ich einen Termin.", "Завтра в мене запис."], ["Am Wochenende schlafe ich lange.", "На вихідних я довго сплю."], ["Danach kaufe ich ein.", "Після того я роблю покупки."]],
      warn: ["`Am Montag ich arbeite` — найчастіша помилка українців. Дієслово — друге: `Am Montag arbeite ich.`"],
    },
  ],
  phrases: [
    { t: "Домовитися", list: [["Hast du am Samstag Zeit?", "У тебе є час у суботу?"], ["Wann treffen wir uns?", "Коли зустрінемося?"], ["Um wie viel Uhr?", "О котрій?"], ["Am Samstag kann ich nicht. Geht es am Sonntag?", "У суботу я не можу. А в неділю можна?"], ["Gut, bis dann!", "Добре, до зустрічі!"]] },
    { t: "Години роботи", list: [["Wann hat die Apotheke geöffnet?", "Коли працює аптека?"], ["Von Montag bis Freitag von acht bis achtzehn Uhr.", "З понеділка до п’ятниці з 8 до 18."], ["Am Sonntag ist geschlossen.", "У неділю зачинено."]] },
    { t: "Мій день", list: [["Ich stehe um sieben Uhr auf.", "Я встаю о сьомій."], ["Um halb neun fängt der Kurs an.", "О пів на дев’яту починається курс."], ["Am Nachmittag kaufe ich ein.", "Після обіду я роблю покупки."], ["Abends sehe ich fern oder lese.", "Увечері я дивлюся телевізор або читаю."]] },
  ],
  dialog: {
    t: "Запис до перукаря",
    lines: [
      ["Friseurin", "Salon Schneider, guten Tag!", "Салон «Шнайдер», добрий день!"],
      ["Taras", "Guten Tag, hier ist Taras Bondar. Ich möchte einen Termin, bitte.", "Добрий день, це Тарас Бондар. Я хотів би записатися."],
      ["Friseurin", "Gern. Wann haben Sie Zeit?", "Охоче. Коли у Вас є час?"],
      ["Taras", "Am Dienstag nach dem Kurs. Der Kurs ist von halb neun bis zwölf.", "У вівторок після курсу. Курс з пів на дев’яту до дванадцятої."],
      ["Friseurin", "Dienstag um vierzehn Uhr? Geht das?", "У вівторок о чотирнадцятій? Підходить?"],
      ["Taras", "Ja, das passt. Vielen Dank!", "Так, підходить. Щиро дякую!"],
      ["Friseurin", "Also Dienstag, vierzehn Uhr. Bis Dienstag, Herr Bondar!", "Отже, вівторок, чотирнадцята. До вівторка, пане Бондар!"],
    ],
  },
  tasks: [
    { t: "gap", q: "___ du mit dem Bus? (fahren)", a: ["Fährst"], why: "a → ä у формі du." },
    { t: "gap", q: "Er ___ gern Krimis. (lesen)", a: ["liest"], why: "e → ie." },
    { t: "gap", q: "Was ___ du zum Frühstück? (essen)", a: ["isst"], why: "essen: du isst." },
    { t: "gap", q: "Sie ___ am Sonntag lange. (schlafen)", a: ["schläft"] },
    { t: "gap", q: "Ich stehe um sieben Uhr ___.", a: ["auf"], why: "Приставка — у кінці." },
    { t: "gap", q: "Der Kurs ___ um neun an. (anfangen)", a: ["fängt"], why: "anfangen: a → ä, приставка an — у кінці." },
    { t: "mc", q: "Яке речення правильне?", o: ["Am Montag ich arbeite.", "Am Montag arbeite ich.", "Ich am Montag arbeite."], a: 1, why: "Дієслово на другому місці." },
    { t: "mc", q: "___ Freitag habe ich frei.", o: ["Um", "Am", "In"], a: 1 },
    { t: "mc", q: "Der Termin ist ___ zehn Uhr.", o: ["am", "um", "von"], a: 1 },
    { t: "mc", q: "Котра година «halb sechs»?", o: ["6:30", "5:30", "5:50"], a: 1, why: "halb sechs = пів на шосту = 5:30." },
    { t: "mc", q: "«Viertel vor neun» — це:", o: ["8:45", "9:15", "9:45"], a: 0 },
    { t: "mc", q: "Яке дієслово НЕ відокремлюється?", o: ["einkaufen", "bezahlen", "anrufen"], a: 1, why: "be- — невідокремлювана приставка." },
    { t: "mc", q: "Wie lange dauert der Kurs?", o: ["Am Montag.", "Drei Stunden.", "Um neun."], a: 1, why: "Wie lange? — як довго." },
  ],
};
