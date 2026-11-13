// Розділ 11. Здоров'я, лікар, дата. Граматика — як у розділі 11 Die neue Linie 1, тема наша.
export default {
  n: 11, part: "A1.2", title: "Здоров’я і дата", book: null,
  goals: [
    "сказати лікарю, що болить і як давно",
    "записатися на прийом і назвати дату",
    "розуміти прості поради лікаря",
    "вживати давальний відмінок: mir, dir, meinem…",
  ],
  grammar: [
    {
      id: "dativIntro", t: "Давальний відмінок (Dativ): кому?", cat: "noun",
      text: [
        "Третій відмінок — **Dativ**, відповідає на питання **кому? чому?** і стоїть після багатьох прийменників (`mit, bei, von, zu, nach, aus` — розділ 12).",
        "Його вимагають і деякі дієслова, хоча в українській після них інший відмінок. Їх варто запам’ятати: **helfen** (допомагати кому), **danken**, **gefallen** (подобатися кому), **gehören** (належати кому), **schmecken**, **passen**, **wehtun** (боліти кому).",
        "Закінчення Dativ: чоловічий і середній рід — **-em**, жіночий — **-er**, множина — **-en** (і до іменника множини додається -n).",
      ],
      tables: [
        { cap: "Присвійні слова в Dativ (так само dein, sein, ihr, unser…)", head: ["", "der", "die", "das", "множина"], rows: [
          ["Nominativ", "mein Arzt", "meine Ärztin", "mein Kind", "meine Eltern"],
          ["Akkusativ", "meinen Arzt", "meine Ärztin", "mein Kind", "meine Eltern"],
          ["Dativ", "**meinem** Arzt", "**meiner** Ärztin", "**meinem** Kind", "**meinen** Eltern"],
        ] },
      ],
      ex: [["Ich helfe meiner Mutter.", "Я допомагаю мамі."], ["Das Buch gehört meinem Bruder.", "Книжка належить моєму братові."], ["Ich danke Ihrer Ärztin.", "Я дякую Вашій лікарці."], ["Wir schreiben unseren Eltern.", "Ми пишемо нашим батькам."]],
      tips: ["Артиклі в Dativ (`dem`, `der`, `dem`, `den`) змінюються так само — їх розберемо в розділі 12."],
      warn: ["`Ich helfe meine Mutter` — помилка: `helfen` + Dativ → `meiner Mutter`."],
    },
    {
      id: "persDat", t: "Займенники в Dativ: mir, dir, ihm", cat: "pron",
      text: [
        "Займенники в Dativ: **mir, dir, ihm, ihr, ihm, uns, euch, ihnen, Ihnen**. Їх чуєш щодня: `Wie geht es dir?`, `Das gefällt mir.`, `Kannst du mir helfen?`",
        "Про самопочуття й смак кажуть саме через Dativ: `Mir ist kalt.` (мені холодно), `Mir ist schlecht.` (мене нудить), `Das schmeckt mir.` (мені смакує).",
      ],
      tables: [
        { head: ["Nominativ", "Akkusativ", "Dativ"], rows: [["ich", "mich", "**mir**"], ["du", "dich", "**dir**"], ["er", "ihn", "**ihm**"], ["sie", "sie", "**ihr**"], ["es", "es", "**ihm**"], ["wir", "uns", "uns"], ["ihr", "euch", "euch"], ["sie / Sie", "sie / Sie", "**ihnen / Ihnen**"]] },
      ],
      ex: [["Wie geht es Ihnen? – Mir geht es nicht gut.", "Як Ви почуваєтеся? – Мені погано."], ["Gefällt dir die Wohnung?", "Тобі подобається квартира?"], ["Kannst du mir helfen?", "Можеш мені допомогти?"], ["Gehört das Handy ihm?", "Це його телефон?"], ["Mir ist kalt.", "Мені холодно."]],
      warn: ["`Ich ist kalt` — помилка: `Mir ist kalt.`", "`Mir geht es gut` — правильна форма. `Ich gehe gut` означає «я добре ходжу»."],
    },
    {
      id: "bei", t: "bei: у когось, біля чогось", cat: "prep",
      text: [
        "**bei** + Dativ: «у когось, у когось удома чи на прийомі; біля, поблизу; на (роботі)». `beim` = bei dem.",
        "На питання **wo?**: `beim Arzt` (у лікаря), `bei meiner Tante` (у тітки), `bei Siemens` (на Siemens). Куди? — інший прийменник: `zum Arzt` (розділ 12).",
      ],
      ex: [["Ich war heute beim Arzt.", "Сьогодні я {був|була} у лікаря."], ["Wir wohnen bei meiner Tante.", "Ми живемо в тітки."], ["Er arbeitet bei der Post.", "Він працює на пошті."], ["Die Apotheke ist beim Rathaus.", "Аптека біля ратуші."]],
      warn: ["`Ich war bei Arzt` — потрібен артикль: `beim Arzt` (bei dem)."],
    },
    {
      id: "datum", t: "Дата: am ersten Mai", cat: "zeit",
      text: [
        "Дату кажуть **порядковим числівником**: `der erste`, `der zweite`… До 19 — число + `-te`: `vierte, fünfte, zehnte`. Від 20 — число + `-ste`: `zwanzigste, einundzwanzigste`. Особливі: **erste, dritte, siebte, achte**.",
        "**Котре число?** — `Der Wievielte ist heute?` / `Heute ist der zwölfte November.`",
        "**Коли?** — `am` + порядкове число з закінченням **-en**: `am zwölften November`. На письмі: `am 12. November`, `am 12.11.` (крапка після числа означає порядковий).",
        "Місяць без дня: **im** + місяць: `im Mai`, `im Dezember`. Пори року теж: `im Winter`.",
      ],
      tables: [
        { head: ["Число", "Який? (der …)", "Коли? (am …)"], rows: [["1.", "der erste", "am ersten"], ["2.", "der zweite", "am zweiten"], ["3.", "der dritte", "am dritten"], ["4.", "der vierte", "am vierten"], ["7.", "der siebte", "am siebten"], ["8.", "der achte", "am achten"], ["12.", "der zwölfte", "am zwölften"], ["20.", "der zwanzigste", "am zwanzigsten"], ["31.", "der einunddreißigste", "am einunddreißigsten"]] },
      ],
      ex: [["Heute ist der zwölfte November.", "Сьогодні дванадцяте листопада."], ["Mein Geburtstag ist am {neunten März|fünfundzwanzigsten Februar}.", "Мій день народження — {дев’ятого березня|двадцять п’ятого лютого}."], ["Mein Termin ist am dritten Dezember um zehn Uhr.", "Мій запис третього грудня о десятій."], ["Ich habe im Juli Geburtstag.", "У мене день народження в липні."], ["Wann hast du Geburtstag? – Am einundzwanzigsten März.", "Коли в тебе день народження? – Двадцять першого березня."]],
      tips: ["У німецьких документах дата пишеться **день.місяць.рік**: 12.11.2026 — як і в Україні."],
      warn: ["`am drei Dezember` — потрібен порядковий: `am dritten Dezember`.", "`in Mai` — помилка: `im Mai` (in dem)."],
    },
    {
      id: "arzt", t: "У лікаря", cat: "rede",
      text: [
        "Спершу йдуть до **Hausarzt / Hausärztin** (сімейного лікаря). Записуються телефоном чи онлайн, на прийом беруть **Versichertenkarte** (картку медстрахування). Якщо хворієш і не можеш працювати, лікар дає **Krankschreibung** (лікарняний).",
        "Що болить, кажуть так: `Mein Kopf tut weh.` / `Mir tut der Kopf weh.` (мені болить голова), або словом на `-schmerzen`: `Ich habe Kopfschmerzen / Bauchschmerzen / Rückenschmerzen / Halsschmerzen.`",
        "Як давно — `seit` + Dativ (детальніше в розділі 14): `seit drei Tagen` (уже три дні).",
        "Уночі й на вихідних, коли кабінети зачинені, — черговий лікар **116 117**. У небезпеці для життя — **112** (див. розділ «Екстрено» в застосунку).",
      ],
      ex: [["Ich möchte einen Termin bei Frau Dr. Schmidt.", "Я {хотів би|хотіла б} записатися до лікарки Шмідт."], ["Was fehlt Ihnen? – Ich habe Fieber und Halsschmerzen.", "Що Вас турбує? – У мене температура й болить горло."], ["Seit wann haben Sie Fieber? – Seit zwei Tagen.", "Відколи у Вас температура? – Уже два дні."], ["Mir tut der Rücken weh.", "У мене болить спина."], ["Nehmen Sie die Tabletten dreimal am Tag.", "Приймайте таблетки тричі на день."]],
    },
  ],
  phrases: [
    { t: "Записатися", list: [["Ich brauche einen Termin.", "Мені потрібен запис."], ["Haben Sie heute noch einen Termin frei?", "У Вас є сьогодні вільний час?"], ["Geht es am Montag um neun?", "А в понеділок о дев’ятій можна?"], ["Bringen Sie bitte Ihre Versichertenkarte mit.", "Візьміть, будь ласка, картку застрахованого."]] },
    { t: "У лікаря", list: [["Ich habe Kopfschmerzen.", "У мене болить голова."], ["Mir ist schlecht.", "Мене нудить."], ["Ich habe seit drei Tagen Husten.", "У мене вже три дні кашель."], ["Ich brauche eine Krankschreibung.", "Мені потрібен лікарняний."], ["Muss ich die Tabletten vor dem Essen nehmen?", "Таблетки приймати до їди?"]] },
    { t: "Побажати", list: [["Gute Besserung!", "Одужуй(те)!"], ["Werd schnell gesund!", "Швидше одужуй!"]] },
  ],
  dialog: {
    t: "У сімейної лікарки",
    lines: [
      ["Ärztin", "Guten Tag, {Herr Schewtschenko|Frau Ukrajinka}. Was fehlt Ihnen?", "Добрий день, {пане Шевченку|пані Українко}. Що Вас турбує?"],
      ["{Taras|Lessja}", "Mir geht es nicht gut. Ich habe Halsschmerzen und Husten.", "Мені погано. У мене болить горло і кашель."],
      ["Ärztin", "Seit wann?", "Відколи?"],
      ["{Taras|Lessja}", "Seit Montag. Und gestern hatte ich auch Fieber.", "З понеділка. А вчора в мене ще була температура."],
      ["Ärztin", "Ich untersuche Sie mal. … Das ist eine Erkältung. Sie müssen viel trinken und im Bett bleiben.", "Я Вас огляну. … Це застуда. Вам треба багато пити й лежати в ліжку."],
      ["{Taras|Lessja}", "Ich muss morgen arbeiten. Brauche ich eine Krankschreibung?", "Мені завтра на роботу. Мені потрібен лікарняний?"],
      ["Ärztin", "Ja, ich schreibe Sie bis Freitag krank. Hier ist auch ein Rezept.", "Так, я дам Вам лікарняний до п’ятниці. І ось рецепт."],
      ["{Taras|Lessja}", "Vielen Dank!", "Щиро дякую!"],
      ["Ärztin", "Gute Besserung!", "Одужуйте!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Wie geht es ___? (ти)", a: ["dir"] },
    { t: "gap", q: "Kannst du ___ helfen? (я)", a: ["mir"] },
    { t: "gap", q: "Gefällt ___ die Wohnung? (Ви, ввічливо)", a: ["Ihnen"] },
    { t: "gap", q: "Ich helfe ___ Mutter. (мій)", a: ["meiner"], why: "helfen + Dativ, die Mutter → meiner." },
    { t: "gap", q: "Das Handy gehört ___ Bruder. (мій)", a: ["meinem"], why: "der Bruder у Dativ → meinem." },
    { t: "gap", q: "Ich war gestern ___ Arzt. (bei + dem)", a: ["beim"] },
    { t: "gap", q: "Mein Termin ist am ___ Dezember. (3.)", a: ["dritten"] },
    { t: "gap", q: "Ich habe ___ Juli Geburtstag.", a: ["im"] },
    { t: "mc", q: "Як сказати «мені холодно»?", o: ["Ich bin kalt.", "Mir ist kalt.", "Mich ist kalt."], a: 1 },
    { t: "mc", q: "«Der Wievielte ist heute?» — це питання про:", o: ["годину", "дату", "вік"], a: 1 },
    { t: "mc", q: "Як прочитати «am 7. Mai»?", o: ["am sieben Mai", "am siebten Mai", "am siebenten Mais"], a: 1 },
    { t: "mc", q: "Куди дзвонити вночі, якщо потрібен лікар, але життю нічого не загрожує?", o: ["110", "116 117", "112"], a: 1 },
  ],
};
