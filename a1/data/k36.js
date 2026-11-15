// Розділ 36 (B1). Колеги й конфлікти: obwohl, сполучники з двох частин (zwar … aber, weder … noch, je … desto),
// як ввічливо сказати про проблему й домовитися, розмова з колегами на перерві.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 36, part: "B1.1", title: "Колеги й конфлікти", book: null,
  goals: [
    "казати «хоча»: Obwohl ich müde bin, helfe ich dir",
    "з’єднувати думки парами слів: zwar … aber, weder … noch, je … desto",
    "спокійно сказати про проблему й запропонувати рішення",
    "говорити з колегами на перерві: du чи Sie, теми, подарунок",
  ],
  grammar: [
    {
      id: "obwohl", t: "obwohl: «хоча»", cat: "satz",
      text: [
        "`obwohl` — «хоча»: відкриває **підрядне речення**, дієслово в кінці: `Obwohl ich müde bin, helfe ich dir.` Якщо `obwohl` стоїть першим, головне речення починається з дієслова (`helfe ich`).",
        "Ту саму думку можна сказати трьома способами:",
        "`obwohl` + підрядне: `Obwohl es regnet, gehen wir spazieren.` — `trotzdem` + головне (розділ 31): `Es regnet. Trotzdem gehen wir spazieren.` — `trotz` + Genitiv (розділ 35): `Trotz des Regens gehen wir spazieren.`",
      ],
      tables: [
        { head: ["Слово", "Що після нього", "Приклад"], rows: [["obwohl", "підрядне, дієслово в кінці", "Obwohl ich krank war, bin ich gekommen."], ["trotzdem", "головне, дієслово одразу", "Ich war krank. Trotzdem bin ich gekommen."], ["trotz", "іменник у Genitiv", "Trotz der Krankheit bin ich gekommen."]] },
      ],
      ex: [["Obwohl ich um fünf Feierabend habe, bleibe ich oft länger.", "Хоча я закінчую о п’ятій, я часто лишаюся довше."], ["Obwohl die Arbeit anstrengend ist, macht sie mir Spaß.", "Хоча робота виснажлива, вона мені подобається."], ["Er kam zur Arbeit, obwohl er Fieber hatte.", "Він прийшов на роботу, хоча мав температуру."]],
      warn: ["`Obwohl ich bin müde` — помилка: після `obwohl` дієслово в кінці: `Obwohl ich müde bin, …`"],
    },
    {
      id: "zweiteilig", t: "zwar … aber, weder … noch, je … desto", cat: "satz",
      text: [
        "`zwar …, aber …` — «щоправда …, але …»: визнаєш одне й додаєш інше: `Die Arbeit ist zwar anstrengend, aber sie macht Spaß.`",
        "`weder … noch …` — «ні …, ні …». Це вже заперечення, тож без `nicht` і `kein`: `Ich habe weder Zeit noch Lust.`",
        "`sowohl … als auch …` — «як …, так і …»; `nicht nur …, sondern auch …` — «не лише …, а й …»; `entweder … oder …` — «або …, або …» (розділ 31).",
        "`je …, desto …` (або `umso`) — «чим …, тим …». Частина з `je` — підрядна, дієслово в кінці; після `desto` + прикметника одразу дієслово: `Je länger ich hier wohne, desto besser gefällt es mir.`",
      ],
      tables: [
        { head: ["Пара", "Значення", "Приклад"], rows: [["zwar … aber", "щоправда …, але", "Er ist zwar nett, aber oft unpünktlich."], ["weder … noch", "ні …, ні", "Sie trinkt weder Kaffee noch Tee."], ["sowohl … als auch", "як …, так і", "sowohl am Montag als auch am Freitag"], ["nicht nur … sondern auch", "не лише …, а й", "nicht nur schnell, sondern auch genau"], ["je … desto", "чим …, тим", "Je früher, desto besser."]] },
      ],
      ex: [["Das Büro ist zwar klein, aber sehr hell.", "Офіс, щоправда, маленький, але дуже світлий."], ["Ich habe heute weder Zeit noch Lust auf eine Besprechung.", "Сьогодні в мене немає ні часу, ні бажання на нараду."], ["Je mehr ich spreche, desto sicherer werde ich.", "Чим більше я говорю, тим упевненіше почуваюся."], ["Wir brauchen sowohl deine Unterschrift als auch eine Kopie des Ausweises.", "Нам потрібні як твій підпис, так і копія посвідчення."]],
      warn: ["`Ich habe weder keine Zeit noch keine Lust` — помилка: `weder … noch` уже заперечує: `weder Zeit noch Lust`."],
    },
    {
      id: "kritik", t: "Про проблему — ввічливо й по суті", cat: "rede",
      text: [
        "Говори про ситуацію й про себе, а не про характер людини: `Mich stört es, wenn …` замість `Du bist immer …`.",
        "Схема з трьох кроків: 1) що сталося: `In letzter Zeit bekomme ich die Aufträge oft erst am Freitagnachmittag.` 2) що це для тебе означає: `Dann muss ich länger bleiben.` 3) пропозиція: `Wie wäre es, wenn …?`",
        "Пом’якшують слова `eigentlich`, `vielleicht`, `ein bisschen` і Konjunktiv II: `Wäre es möglich, dass …?` `Ich fände es gut, wenn …`.",
        "Якщо проблема серйозна (образи, тиск, нерівне ставлення), звернися до керівника або до ради працівників (`der Betriebsrat`), якщо вона у фірмі є.",
      ],
      tables: [
        { head: ["Замість", "Краще"], rows: [["Du machst immer Fehler!", "Mir ist aufgefallen, dass hier ein Fehler ist."], ["Das ist falsch!", "Ich sehe das ein bisschen anders."], ["Mach das jetzt!", "Könntest du das bitte bis morgen erledigen?"], ["Nein!", "Das passt mir leider nicht. Wie wäre es mit …?"]] },
      ],
      ex: [["Mich stört es ein bisschen, dass die Küche oft nicht aufgeräumt ist.", "Мене трохи дратує, що кухня часто не прибрана."], ["Können wir kurz darüber sprechen?", "Можемо коротко про це поговорити?"], ["Ich fände es gut, wenn wir einen Putzplan machen.", "Я вважаю, було б добре скласти графік прибирання."]],
    },
    {
      id: "smalltalk", t: "З колегами: du чи Sie, перерва, свята", cat: "rede",
      text: [
        "У багатьох фірмах колеги на `du`; з керівником — як він або вона запропонує. Пропонує `du` зазвичай старший чи керівник: `Wollen wir uns duzen?` — `Gern, ich bin …`.",
        "Теми для перерви: вихідні, погода, відпустка, їжа, діти. Зарплату, політику й релігію з малознайомими краще не обговорювати.",
        "День народження колеги: часто підписують листівку й збирають гроші на подарунок. Іменинник сам приносить торт або булочки.",
      ],
      ex: [["Wie war dein Wochenende?", "Як минули твої вихідні?"], ["Hast du schon Pläne für den Urlaub?", "Уже маєш плани на відпустку?"], ["Wir sammeln für ein Geschenk für Jonas. Machst du mit?", "Ми збираємо на подарунок Йонасові. Долучишся?"]],
    },
  ],
  phrases: [
    { t: "Ввічливо не погодитися", list: [["Ich sehe das etwas anders.", "Я бачу це трохи інакше."], ["Da hast du recht, aber …", "Тут ти маєш рацію, але …"], ["Können wir kurz darüber sprechen?", "Можемо коротко про це поговорити?"]] },
    { t: "Домовитися", list: [["Wie wäre es, wenn wir uns abwechseln?", "Може, будемо чергуватися?"], ["Ich schlage vor, dass wir das am Montag besprechen.", "Пропоную обговорити це в понеділок."], ["Einverstanden!", "Згода!"]] },
    { t: "Перерва", list: [["Gehst du mit in die Kantine?", "Підеш зі мною в їдальню?"], ["Ich mache kurz Pause.", "Я на хвилинку зроблю перерву."], ["Bis gleich!", "До скорого!"]] },
  ],
  dialog: {
    t: "Розмова з колегою",
    lines: [
      ["{Taras|Lessja}", "Jonas, hast du kurz Zeit? Ich möchte etwas mit dir besprechen.", "Йонасе, маєш хвилинку? Хочу з тобою дещо обговорити."],
      ["Kollege", "Klar. Worum geht's?", "Звісно. Про що йдеться?"],
      ["{Taras|Lessja}", "Du schickst mir die Aufträge oft erst am Freitag um vier. Obwohl ich um fünf Feierabend habe, muss ich dann bis sieben bleiben.", "Ти часто надсилаєш мені замовлення лише в п’ятницю о четвертій. Хоча я закінчую о п’ятій, мені тоді доводиться сидіти до сьомої."],
      ["Kollege", "Oh, das war mir nicht klar. Die Kunden schicken mir die Sachen leider auch so spät.", "Ой, я цього не помічав. Клієнти, на жаль, теж надсилають мені все так пізно."],
      ["{Taras|Lessja}", "Das verstehe ich. Die Aufträge sind zwar wichtig, aber am Freitagabend möchte ich auch frei haben.", "Розумію. Замовлення, звісно, важливі, але в п’ятницю ввечері я теж хочу відпочити."],
      ["Kollege", "Was schlägst du vor?", "Що пропонуєш?"],
      ["{Taras|Lessja}", "Wie wäre es, wenn du mir bis Freitagmittag Bescheid sagst? Je früher ich es weiß, desto besser kann ich planen.", "Може, ти попереджатимеш мене до п’ятниці обіду? Чим раніше я знаю, тим краще можу спланувати."],
      ["Kollege", "Das ist fair. Und wenn ein Kunde wirklich erst spät schickt, machen wir es am Montag früh.", "Це чесно. А якщо клієнт справді надішле пізно, зробимо в понеділок зранку."],
      ["{Taras|Lessja}", "Einverstanden! Danke, dass du so schnell reagierst.", "Згода! Дякую, що так швидко відгукнувся."],
      ["Kollege", "Kein Problem. Gehst du mit in die Kantine? Heute gibt es Pfannkuchen.", "Без проблем. Підеш зі мною в їдальню? Сьогодні млинці."],
      ["{Taras|Lessja}", "Gern! Ich habe zwar wenig Zeit, aber für Pfannkuchen immer.", "Охоче! Часу в мене, щоправда, мало, але на млинці — завжди."],
    ],
  },
  tasks: [
    { t: "gap", q: "___ ich müde bin, helfe ich dir. (хоча)", a: ["Obwohl", "obwohl"] },
    { t: "gap", q: "Ich bin müde. ___ helfe ich dir. (все одно)", a: ["Trotzdem", "trotzdem"] },
    { t: "gap", q: "Die Arbeit ist ___ anstrengend, aber sie macht Spaß.", a: ["zwar"] },
    { t: "gap", q: "Ich habe weder Zeit ___ Lust.", a: ["noch"] },
    { t: "gap", q: "Je länger ich hier wohne, ___ besser gefällt es mir.", a: ["desto", "umso"] },
    { t: "gap", q: "Er spricht sowohl Englisch ___ auch Polnisch.", a: ["als"] },
    { t: "gap", q: "Wie wäre es, ___ wir uns abwechseln?", a: ["wenn"] },
    { t: "gap", q: "Ich sehe das ein bisschen ___. (інакше)", a: ["anders"] },
    { t: "mc", q: "Як правильно?", o: ["Obwohl es regnet, wir gehen spazieren.", "Obwohl es regnet, gehen wir spazieren.", "Obwohl regnet es, gehen wir spazieren."], a: 1 },
    { t: "mc", life: true, q: "Колега втретє лишає брудний посуд у спільній кухні. Що сказати найкраще?", o: ["Mich stört es, dass das Geschirr oft stehen bleibt. Könnten wir einen Plan machen?", "Du bist so faul!", "Нічого не казати й мити самому, поки не набридне"], a: 0 },
    { t: "mc", q: "`Je früher, desto besser` означає…", o: ["Раніше було краще", "Чим раніше, тим краще", "Краще пізно, ніж ніколи"], a: 1 },
    { t: "mc", life: true, q: "Новий колега каже: `Wir duzen uns hier alle.` Як відповісти?", o: ["Sehr geehrter Herr Kollege, …", "Nein, das ist verboten.", "Gern! Ich bin …"], a: 2 },
    { t: "mc", life: true, q: "Що краще НЕ обговорювати з малознайомими колегами?", o: ["вихідні", "зарплату", "погоду"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich habe weder keine Zeit noch keine Lust.", "Ich habe nicht weder Zeit noch Lust.", "Ich habe weder Zeit noch Lust."], a: 2 },
    { t: "mc", life: true, q: "Колеги збирають на подарунок: `Wir sammeln für Jonas. Machst du mit?` Ти хочеш долучитися.", o: ["Gern! Wie viel gebt ihr?", "Nein, Jonas ist komisch.", "Was ist Jonas?"], a: 0 },
    { t: "mc", life: true, q: "Колега постійно ображає тебе, розмова не допомогла. Куди звернутися?", o: ["до керівника або до ради працівників (Betriebsrat)", "одразу до поліції", "нікуди: треба терпіти"], a: 0 },
  ],
};
