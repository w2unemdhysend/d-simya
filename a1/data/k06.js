// Розділ 6. Продукти й покупки
export default {
  n: 6, part: "A1.1", title: "Продукти", book: "Das schmeckt gut!",
  goals: [
    "назвати продукти, упаковки й кількість",
    "купити щось на ринку, у пекарні чи на м’ясному прилавку",
    "сказати, що любиш і що ні",
    "зробити комплімент їжі",
    "правильно поставити слова в реченні",
  ],
  grammar: [
    {
      id: "akkDer", t: "Знахідний відмінок з der: den", cat: "noun",
      text: [
        "Як і з `ein`, в Akkusativ змінюється **лише чоловічий рід**: `der → den`. Жіночий, середній і множина лишаються як були.",
        "Тепер видно всю систему: у чоловічому роді Akkusativ має закінчення **-en**: `den`, `einen`, `keinen`, `meinen`.",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [
          ["Nominativ", "der Käse", "die Wurst", "das Brot", "die Äpfel"],
          ["Akkusativ", "**den** Käse", "die Wurst", "das Brot", "die Äpfel"],
          ["Akk. ein/kein", "**einen / keinen** Käse", "eine / keine Wurst", "ein / kein Brot", "— / keine Äpfel"],
          ["Akk. mein", "**meinen** Käse", "meine Wurst", "mein Brot", "meine Äpfel"],
        ] },
      ],
      ex: [["Ich nehme den Käse hier.", "Я візьму оцей сир."], ["Kaufst du den Apfelsaft?", "Ти купуєш яблучний сік?"], ["Wir brauchen die Milch und das Brot.", "Нам потрібні молоко й хліб."], ["Den Kuchen finde ich super!", "Пиріг, як на мене, чудовий!"]],
      warn: ["`Ich nehme der Salat` — помилка: прямий додаток чоловічого роду → `den Salat`."],
    },
    {
      id: "moegen", t: "mögen, gern, lieber, am liebsten", cat: "verb",
      text: [
        "**mögen** — «любити, подобатися» про їжу, людей, речі. Дієслово неправильне: `ich mag, du magst, er mag` (у формі er без -t). Після нього — іменник в Akkusativ.",
        "Коли любиш **щось робити**, кажуть дієслово + **gern**: `Ich koche gern.` (люблю готувати). `gern` стоїть після дієслова.",
        "Порівняння: **gern → lieber → am liebsten** (охоче → охочіше → найохочіше): `Ich trinke gern Tee, lieber Kaffee und am liebsten Kakao.`",
      ],
      tables: [
        { head: ["", "mögen"], rows: [["ich", "mag"], ["du", "magst"], ["er / sie / es", "**mag**"], ["wir", "mögen"], ["ihr", "mögt"], ["sie / Sie", "mögen"]] },
      ],
      ex: [["Ich mag Fisch. – Ich nicht.", "Я люблю рибу. – А я ні."], ["Magst du scharfes Essen?", "Ти любиш гостру їжу?"], ["Er isst gern Obst.", "Він любить їсти фрукти."], ["Was trinkst du am liebsten?", "Що ти найбільше любиш пити?"], ["Ich mag keine Tomaten.", "Я не люблю помідорів."]],
      tips: ["`Ich mag dich.` — «ти мені подобаєшся» (дружньо). «Я тебе кохаю» — `Ich liebe dich.`"],
      warn: ["`Ich mag kochen` можливо, але природніше `Ich koche gern.`", "`Ich möchte` (хотів би) і `ich mag` (люблю) — різні слова, хоч і схожі."],
    },
    {
      id: "menge", t: "Кількість і упаковки", cat: "noun",
      text: [
        "Кількість + продукт ставлять **просто поруч**, без відмінкової форми: `ein Kilo Äpfel`, `eine Flasche Wasser`, `200 Gramm Käse`. (В українській — «кілограм яблук», у німецькій жодного «яблук».)",
        "Міри ваги й об’єму після числа **не мають множини**: `zwei Kilo`, `drei Liter`, `500 Gramm`. А упаковки мають: `zwei Flaschen`, `drei Dosen`, `vier Packungen`.",
        "`ein Pfund` = 500 грамів, так часто кажуть на ринку. `Ich hätte gern …` — найчемніший спосіб попросити: «мені, будь ласка, …»",
      ],
      tables: [
        { head: ["Упаковка / міра", "Приклад"], rows: [
          ["die Flasche", "eine Flasche Milch, zwei Flaschen Wasser"], ["die Packung", "eine Packung Nudeln"], ["die Dose", "eine Dose Tomaten"], ["die Tüte", "eine Tüte Chips"],
          ["der Becher", "ein Becher Joghurt"], ["das Stück", "ein Stück Kuchen, zwei Stück Kuchen"], ["das Kilo", "ein Kilo Kartoffeln, zwei Kilo"], ["das Gramm", "200 Gramm Käse"], ["der Liter", "ein Liter Milch"], ["das Pfund", "ein Pfund Tomaten"],
        ] },
      ],
      ex: [["Ich hätte gern ein Kilo Äpfel und ein Pfund Tomaten.", "Мені, будь ласка, кілограм яблук і фунт помідорів."], ["Zweihundert Gramm Käse, bitte.", "Двісті грамів сиру, будь ласка."], ["Wir brauchen zwei Flaschen Wasser.", "Нам потрібні дві пляшки води."]],
      warn: ["`ein Kilo von Äpfeln` — калька. Правильно `ein Kilo Äpfel`.", "`zwei Kilos` — після числа кажуть `zwei Kilo`."],
    },
    {
      id: "satzbau", t: "Порядок слів: що де стоїть", cat: "satz",
      text: [
        "Головне правило ти вже знаєш: **дієслово на 2-му місці**. На 1-му — підмет або будь-яка інша частина (час, місце, додаток), і тоді підмет іде одразу за дієсловом.",
        "У середині речення діє зручний порядок: **коли — як — де** (час, спосіб, місце): `Ich fahre heute mit dem Bus zum Markt.`",
        "**nicht** стоїть перед тим, що заперечує, а якщо заперечується вся дія — ближче до кінця: `Ich kaufe heute nicht ein.`, `Das schmeckt nicht gut.`",
      ],
      tables: [
        { head: ["1", "2 (дієслово)", "середина", "кінець"], rows: [["Ich", "kaufe", "heute im Supermarkt", "Brot."], ["Heute", "kaufe", "ich im Supermarkt", "Brot."], ["Brot", "kaufe", "ich heute", "im Supermarkt."], ["Wo", "kaufst", "du", "Brot?"], ["Kaufst", "du", "heute", "Brot?"]] },
      ],
      ex: [["Am Samstag gehen wir auf den Markt.", "У суботу ми йдемо на ринок."], ["Den Fisch nehme ich.", "Рибу я візьму."], ["Das Brot ist nicht frisch.", "Хліб не свіжий."]],
      warn: ["Хоч що стоїть на першому місці, дієслово друге. Слова `und`, `aber`, `oder` місця не займають: `Ich kaufe Brot und dann gehe ich nach Hause.`"],
    },
    {
      id: "einkauf", t: "Розмова біля прилавка", cat: "rede",
      text: [
        "На ринку, у пекарні (`Bäckerei`) і на м’ясному прилавку (`Metzgerei`, `Fleischtheke`) розмова майже завжди однакова. Продавець питає `Was darf es sein?` (що бажаєте?), потім `Sonst noch etwas?` (ще щось?), а ти закінчуєш `Nein, danke. Das ist alles.`",
        "У супермаркеті на касі зазвичай питають: `Brauchen Sie eine Tüte?` (пакет потрібен?) і `Mit Karte oder bar?` (карткою чи готівкою?). Пакети платні.",
      ],
      ex: [["Was darf es sein? – Ich hätte gern sechs Brötchen.", "Що бажаєте? – Мені, будь ласка, шість булочок."], ["Sonst noch etwas? – Nein, danke. Das ist alles.", "Ще щось? – Ні, дякую. Це все."], ["Darf es ein bisschen mehr sein?", "Можна трохи більше?"], ["Mit Karte, bitte.", "Карткою, будь ласка."]],
      tips: ["`Darf es ein bisschen mehr sein?` питають, коли відрізали більше, ніж ти {просив|просила}. Відповідь `Ja, kein Problem.` або `Nein, bitte genau 200 Gramm.`"],
    },
  ],
  phrases: [
    { t: "Купувати", list: [["Ich hätte gern ein Kilo Kartoffeln.", "Мені, будь ласка, кілограм картоплі."], ["Was kostet ein Kilo Tomaten?", "Скільки коштує кілограм помідорів?"], ["Haben Sie auch Bio-Eier?", "У Вас є також біояйця?"], ["Das ist alles, danke.", "Це все, дякую."]] },
    { t: "Смак", list: [["Das schmeckt gut! / Das schmeckt lecker!", "Це смачно!"], ["Das schmeckt mir nicht.", "Мені це не до смаку."], ["Ist das scharf?", "Це гостре?"], ["Darf ich probieren?", "Можна скуштувати?"]] },
    { t: "Що люблю", list: [["Ich mag Käse sehr.", "Я дуже люблю сир."], ["Ich esse gern Obst.", "Я люблю фрукти."], ["Ich trinke lieber Tee als Kaffee.", "Я більше люблю чай, ніж каву."], ["Ich esse kein Fleisch.", "Я не їм м’яса."]] },
  ],
  dialog: {
    t: "На ринку",
    lines: [
      ["Verkäuferin", "Guten Morgen! Was darf es sein?", "Доброго ранку! Що бажаєте?"],
      ["{Taras|Lesia}", "Guten Morgen! Ich hätte gern ein Kilo Äpfel.", "Доброго ранку! Мені, будь ласка, кілограм яблук."],
      ["Verkäuferin", "Die roten oder die grünen?", "Червоних чи зелених?"],
      ["{Taras|Lesia}", "Die grünen, bitte. Sind die Tomaten frisch?", "Зелених, будь ласка. Помідори свіжі?"],
      ["Verkäuferin", "Ja, ganz frisch. Möchten Sie probieren?", "Так, зовсім свіжі. Хочете скуштувати?"],
      ["{Taras|Lesia}", "Mmh, die schmecken gut! Dann ein Pfund Tomaten, bitte.", "Ммм, смачні! Тоді фунт помідорів, будь ласка."],
      ["Verkäuferin", "Sonst noch etwas?", "Ще щось?"],
      ["{Taras|Lesia}", "Nein, danke. Das ist alles. Was macht das?", "Ні, дякую. Це все. Скільки з мене?"],
      ["Verkäuferin", "Vier Euro zwanzig, bitte.", "Чотири євро двадцять, будь ласка."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich nehme ___ Käse. (der)", a: ["den"], why: "Akkusativ чоловічого роду: den." },
    { t: "gap", q: "Kaufst du ___ Milch? (die)", a: ["die"], why: "Жіночий рід не змінюється." },
    { t: "gap", q: "Er ___ keinen Fisch. (mögen)", a: ["mag"], why: "mögen: er mag." },
    { t: "gap", q: "___ du Schokolade? (mögen)", a: ["Magst"] },
    { t: "gap", q: "Ich trinke ___ Tee. (люблю)", a: ["gern"], why: "Дієслово + gern." },
    { t: "mc", q: "Як сказати «кілограм яблук»?", o: ["ein Kilo von Äpfeln", "ein Kilo Äpfel", "ein Kilo Äpfeln"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["zwei Kilos Kartoffeln", "zwei Kilo Kartoffeln", "zwei Kiloen Kartoffeln"], a: 1, why: "Міра після числа — без множини." },
    { t: "mc", q: "Як правильно?", o: ["zwei Flasche Wasser", "zwei Flaschen Wasser", "zwei Flaschen Wassers"], a: 1, why: "Упаковка має множину, продукт — без змін." },
    { t: "mc", q: "Яке речення правильне?", o: ["Heute ich kaufe Brot.", "Heute kaufe ich Brot.", "Heute kaufe Brot ich."], a: 1 },
    { t: "mc", q: "Продавець: «Sonst noch etwas?» Ти більше нічого не хочеш:", o: ["Ja, gern.", "Nein, danke. Das ist alles.", "Das schmeckt gut."], a: 1 },
    { t: "mc", q: "Ich trinke gern Tee, ___ Kaffee und am liebsten Kakao.", o: ["gerner", "lieber", "mehr gern"], a: 1, why: "gern → lieber → am liebsten." },
    { t: "mc", q: "Den Kuchen ___ ich.", o: ["nehme", "ich nehme", "nehmen"], a: 0, why: "Додаток на першому місці, дієслово друге, підмет після нього." },
  ],
};
