// Розділ 3. Речі та місто
export default {
  n: 3, part: "A1.1", title: "Речі й місця", book: "Wie heißt das auf Deutsch?",
  goals: [
    "назвати речі навколо себе з правильним артиклем",
    "спитати, як щось називається німецькою",
    "сказати, що чогось немає (kein)",
    "назвати будівлі й місця в місті",
    "ввічливо попросити когось щось зробити",
  ],
  grammar: [
    {
      id: "artikel", t: "Означений артикль: der, die, das", cat: "noun",
      text: [
        "Кожен німецький іменник має рід, і його показує **артикль**: `der` (чоловічий), `die` (жіночий), `das` (середній). У множині для всіх родів — `die`.",
        "Рід часто **не збігається з українським**: `der Tisch` — стіл (збіг), але `die Tür` — двері (в українській множина), `das Mädchen` — дівчинка (середній!), `der Löffel` — ложка. Тому слово вчать **тільки разом з артиклем**, як одне ціле: не «Tisch», а «der Tisch».",
        "Означений артикль ставлять, коли річ **відома** або єдина: `Der Bahnhof ist dort.` (той самий, наш вокзал).",
      ],
      tables: [
        { cap: "Підказки до роду (вони працюють часто, але не завжди)", head: ["Ознака", "Рід", "Приклади"], rows: [
          ["-ung, -heit, -keit, -schaft, -ion, -tät", "die (завжди)", "`die Wohnung`, `die Freiheit`, `die Information`"],
          ["-e (здебільшого)", "die", "`die Lampe`, `die Tasche`, `die Straße`"],
          ["-chen, -lein (завжди)", "das", "`das Brötchen`, `das Mädchen`"],
          ["-um, -ment", "das", "`das Museum`, `das Medikament`"],
          ["дні, місяці, пори року", "der", "`der Montag`, `der Mai`, `der Winter`"],
          ["-er (хто/що виконує дію)", "der", "`der Lehrer`, `der Computer`"],
          ["складне слово", "як в останньої частини", "`das Haus` → `das Krankenhaus`"],
        ] },
      ],
      ex: [["Das ist der Bahnhof.", "Це вокзал."], ["Die Tür ist offen.", "Двері відчинені."], ["Das Buch ist neu.", "Книжка нова."], ["Die Bücher sind alt.", "Книжки старі."]],
      tips: ["У застосунку артиклі мають колір: **der** синій, **die** червоний, **das** зелений, як у грі «Артиклі». Кольорова пам’ять допомагає.", "Не знаєш роду? Подивись у «Словнику»: там є артикль і множина кожного іменника."],
      warn: ["`der Mädchen` — помилка: слова на -chen завжди `das`, навіть якщо це дівчина.", "Множина — завжди `die`: `die Tische`, `die Bücher`, навіть якщо в однині `der` або `das`."],
    },
    {
      id: "ein", t: "Неозначений артикль: ein, eine", cat: "noun",
      text: [
        "**ein** (для der і das) та **eine** (для die) — коли річ **нова в розмові** або одна з багатьох: «якийсь». Українською не перекладається.",
        "Типова пара: спершу `ein`, потім, коли вже відомо, — `der`/`die`/`das`: `Das ist ein Tisch. Der Tisch ist neu.`",
        "У множині неозначеного артикля **немає**: `Das sind Tische.`",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [["означений", "der Kuli", "die Tasche", "das Heft", "die Hefte"], ["неозначений", "ein Kuli", "eine Tasche", "ein Heft", "— Hefte"], ["заперечний", "kein Kuli", "keine Tasche", "kein Heft", "keine Hefte"]] },
      ],
      ex: [["Was ist das? – Das ist ein Radiergummi.", "Що це? – Це гумка."], ["Hier ist eine Apotheke.", "Тут є аптека."], ["Das sind Schlüssel.", "Це ключі."]],
      warn: ["`Das ist ein Tasche` — помилка, Tasche жіночого роду: `eine Tasche`."],
    },
    {
      id: "kein", t: "kein чи nicht?", cat: "satz",
      text: [
        "**kein / keine** заперечує **іменник** з неозначеним артиклем або без артикля: `Das ist kein Kuli.` (не ручка), `Ich habe keine Zeit.` (не маю часу). `kein` змінюється, як `ein`.",
        "**nicht** заперечує **все інше**: дієслово, прикметник, іменник з означеним артиклем, ім’я: `Das ist nicht der Bahnhof.`, `Das ist nicht teuer.`, `Ich wohne nicht hier.`",
        "Просте правило: якщо в ствердному реченні стоїть `ein/eine` або артикля немає → у запереченні `kein`. Інакше → `nicht`.",
      ],
      tables: [
        { head: ["Ствердження", "Заперечення"], rows: [["Das ist ein Heft.", "Das ist **kein** Heft."], ["Ich habe Zeit.", "Ich habe **keine** Zeit."], ["Das ist der Bahnhof.", "Das ist **nicht** der Bahnhof."], ["Das Buch ist teuer.", "Das Buch ist **nicht** teuer."], ["Ich komme.", "Ich komme **nicht**."]] },
      ],
      ex: [["Ist das ein Kuli? – Nein, das ist kein Kuli, das ist ein Bleistift.", "Це ручка? – Ні, це не ручка, це олівець."], ["Hier ist keine Bank.", "Тут немає банку."], ["Der Laptop ist nicht kaputt.", "Ноутбук не зламаний."]],
      warn: ["`Das ist nicht ein Kuli` — так не кажуть. `ein` + `nicht` зливаються в `kein`."],
    },
    {
      id: "possnom", t: "mein і dein", cat: "pron",
      text: [
        "Присвійні слова (`mein` — мій, `dein` — твій) змінюються **як ein**: перед словом роду der і das — без закінчення, перед die і в множині — **-e**.",
        "Решта присвійних (його, її, наш…) — у розділі 7, вони змінюються так само.",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [["мій", "mein Schlüssel", "meine Brille", "mein Handy", "meine Bücher"], ["твій", "dein Schlüssel", "deine Brille", "dein Handy", "deine Bücher"]] },
      ],
      ex: [["Ist das dein Rucksack? – Ja, das ist mein Rucksack.", "Це твій рюкзак? – Так, це мій рюкзак."], ["Wo ist meine Brille?", "Де мої окуляри?"], ["Das sind meine Schlüssel.", "Це мої ключі."]],
      tips: ["`die Brille` — однина (одні окуляри), тому `meine Brille ist…`, а не «sind»."],
    },
    {
      id: "erSieEs", t: "Артикль і займенник: der Tisch → er", cat: "pron",
      text: [
        "Щоб не повторювати іменник, його заміняють займенником **за граматичним родом**: `der` → `er`, `die` → `sie`, `das` → `es`, множина → `sie`.",
        "Тому про річ кажуть «він/вона» за німецьким родом, навіть якщо в українській інакше: `Wo ist die Tür? – Sie ist dort.` (двері — «вона»).",
      ],
      tables: [
        { head: ["Іменник", "Займенник", "Приклад"], rows: [["der Kuli", "er", "`Der Kuli ist neu. Er ist blau.`"], ["die Lampe", "sie", "`Die Lampe ist teuer. Sie kostet 40 Euro.`"], ["das Handy", "es", "`Das Handy ist alt. Es ist kaputt.`"], ["die Schlüssel", "sie", "`Die Schlüssel? Sie sind hier.`"]] },
      ],
      ex: [["Wo ist der Bahnhof? – Er ist dort.", "Де вокзал? – Він там."], ["Wie ist das Zimmer? – Es ist klein.", "Яка кімната? – Вона маленька."]],
      warn: ["`Das Zimmer … Sie ist klein` — помилка: Zimmer середнього роду, тож `es`, хоча українською «кімната — вона»."],
    },
    {
      id: "impSie", t: "Ввічливе прохання: Öffnen Sie bitte…", cat: "satz",
      text: [
        "Прохання до людини на «Ви» будується так: **дієслово (форма на -en) + Sie + решта**. Слово `bitte` робить прохання ввічливим, його ставлять після Sie або в кінці.",
        "Від `sein` форма особлива: `Seien Sie bitte pünktlich.`",
      ],
      ex: [["Öffnen Sie bitte das Fenster.", "Відчиніть, будь ласка, вікно."], ["Wiederholen Sie das bitte.", "Повторіть це, будь ласка."], ["Sprechen Sie bitte langsam.", "Говоріть, будь ласка, повільно."], ["Zeigen Sie mir bitte den Weg.", "Покажіть мені, будь ласка, дорогу."], ["Seien Sie bitte leise.", "Будьте, будь ласка, тихіше."]],
      tips: ["Саме так звучать вказівки в установах і на курсі: `Lesen Sie den Text.`, `Füllen Sie das Formular aus.`"],
    },
  ],
  phrases: [
    { t: "Запитати про слово", list: [["Wie heißt das auf Deutsch?", "Як це німецькою?"], ["Was ist das?", "Що це?"], ["Was heißt „Kuli“ auf Ukrainisch?", "Що означає «Kuli» українською?"], ["Ist das der oder die?", "Це der чи die?"], ["Wie ist der Plural?", "Яка множина?"]] },
    { t: "У місті", list: [["Wo ist hier eine Apotheke?", "Де тут аптека?"], ["Gibt es hier eine Bank?", "Тут є банк?"], ["Das Rathaus ist dort.", "Ратуша там."], ["Hier ist kein Supermarkt.", "Тут немає супермаркету."]] },
  ],
  dialog: {
    t: "Новенька на курсі",
    lines: [
      ["Olena", "Entschuldigung, wie heißt das auf Deutsch?", "Перепрошую, як це німецькою?"],
      ["Max", "Das ist ein Radiergummi.", "Це гумка."],
      ["Olena", "Der oder die Radiergummi?", "Der чи die Radiergummi?"],
      ["Max", "Der Radiergummi. Und das hier ist ein Kuli.", "Der Radiergummi. А це ручка."],
      ["Olena", "Ist das dein Kuli?", "Це твоя ручка?"],
      ["Max", "Nein, das ist nicht mein Kuli. Mein Kuli ist blau.", "Ні, це не моя ручка. Моя ручка синя."],
      ["Olena", "Und wo ist mein Wörterbuch? Ich habe kein Wörterbuch!", "А де мій словник? У мене немає словника!"],
      ["Max", "Es ist dort, auf dem Stuhl.", "Він там, на стільці."],
    ],
  },
  tasks: [
    { t: "mc", q: "___ Tasche ist neu.", o: ["Der", "Die", "Das"], a: 1, why: "die Tasche — на -e, жіночий рід." },
    { t: "mc", q: "___ Brötchen ist lecker.", o: ["Der", "Die", "Das"], a: 2, why: "-chen завжди das." },
    { t: "mc", q: "___ Montag ist frei.", o: ["Der", "Die", "Das"], a: 0, why: "Дні тижня — der." },
    { t: "mc", q: "Das ist ___ Lampe.", o: ["ein", "eine", "kein"], a: 1 },
    { t: "gap", q: "Ist das ein Kuli? – Nein, das ist ___ Kuli.", a: ["kein"], why: "ein → kein." },
    { t: "gap", q: "Ich habe ___ Zeit.", a: ["keine"], why: "die Zeit, заперечення іменника без артикля → keine." },
    { t: "gap", q: "Das ist ___ der Bahnhof.", a: ["nicht"], why: "З означеним артиклем — nicht." },
    { t: "gap", q: "Wo ist ___ Brille? (мій)", a: ["meine"], why: "die Brille → meine." },
    { t: "gap", q: "Ist das ___ Handy? (твій)", a: ["dein"], why: "das Handy → dein." },
    { t: "mc", q: "Das Zimmer ist klein. ___ ist hell.", o: ["Er", "Sie", "Es"], a: 2, why: "das Zimmer → es." },
    { t: "mc", q: "Die Tür? ___ ist dort.", o: ["Er", "Sie", "Es"], a: 1 },
    { t: "mc", q: "Множина від der Tisch:", o: ["der Tische", "die Tische", "das Tische"], a: 1, why: "Множина завжди die." },
    { t: "mc", q: "Як ввічливо попросити повторити?", o: ["Wiederholen Sie das bitte.", "Sie wiederholen bitte?", "Wiederholen bitte Sie."], a: 0 },
  ],
};
