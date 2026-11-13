// Розділ 18 (A2). Робота: підрядне речення з weil, denn і deshalb, порядок слів у підрядному, n-відміна (der Kollege → den Kollegen).
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 18, part: "A2.1", title: "Робота й причини", book: null,
  goals: [
    "пояснювати причину трьома способами: weil, denn, deshalb",
    "будувати підрядне речення: дієслово в самому кінці",
    "розповідати про свою роботу й досвід на співбесіді",
    "правильно відмінювати der Kollege, der Kunde, der Herr",
  ],
  grammar: [
    {
      id: "weil", t: "weil: дієслово в кінець", cat: "satz",
      text: [
        "`weil` — «бо, тому що». Після `weil` починається **підрядне речення**, і в ньому дієслово, яке змінюється за особами, іде **в самий кінець**: `Ich lerne Deutsch, weil ich hier arbeiten **möchte**.`",
        "Перед `weil` **завжди кома**. Якщо дієслів кілька, у кінці стоїть те, що змінюється: `…, weil ich arbeiten **muss**`, `…, weil ich lange gearbeitet **habe**`. Відокремлювані дієслова в кінці знову пишуться разом: `…, weil der Kurs um acht **anfängt**`.",
        "На питання `Warum?` (чому?) можна відповісти й самим підрядним: `Warum lernst du Deutsch? – Weil ich hier lebe.`",
      ],
      tables: [
        { cap: "Головне речення → підрядне з weil", head: ["Головне", "Підрядне"], rows: [["Ich **bin** müde.", "…, weil ich müde **bin**."], ["Ich **muss** arbeiten.", "…, weil ich arbeiten **muss**."], ["Der Kurs **fängt** um acht **an**.", "…, weil der Kurs um acht **anfängt**."], ["Ich **habe** viel gelernt.", "…, weil ich viel gelernt **habe**."]] },
      ],
      ex: [["Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte.", "Я вчу німецьку, бо хочу працювати в Німеччині."], ["Er kommt heute nicht, weil er krank ist.", "Він сьогодні не прийде, бо хворий."], ["Ich bin spät, weil der Bus Verspätung hatte.", "Я {запізнився|запізнилася}, бо автобус запізнювався."], ["Warum {zeichnest|übersetzt} du so viel? – Weil ich das liebe.", "Чому ти так багато {малюєш|перекладаєш}? – Бо я це люблю."]],
      warn: ["`…, weil ich bin müde` — типова помилка: після weil дієслово в кінці: `weil ich müde bin`.", "Без коми перед weil речення неправильне на письмі."],
    },
    {
      id: "weilDennDeshalb", t: "weil, denn, deshalb: три способи сказати «бо»", cat: "satz",
      text: [
        "Усі три кажуть про причину, але слова стоять по-різному:",
        "`denn` — «бо», **звичайний порядок** слів (як у розділі 14): `…, denn ich bin müde.`",
        "`weil` — «бо», дієслово **в кінці**: `…, weil ich müde bin.`",
        "`deshalb` — «тому», показує **наслідок**; після нього дієслово, потім підмет: `Ich bin müde, deshalb **gehe ich** nach Hause.`",
      ],
      tables: [
        { cap: "Одна думка — три речення", head: ["Слово", "Речення"], rows: [["denn", "Ich bleibe zu Hause, denn ich **bin** krank."], ["weil", "Ich bleibe zu Hause, weil ich krank **bin**."], ["deshalb", "Ich bin krank, deshalb **bleibe** ich zu Hause."]] },
      ],
      ex: [["{Ich zeichne gern, deshalb arbeite ich als Maler.|Ich spreche viele Sprachen, deshalb arbeite ich als Übersetzerin.}", "{Я люблю малювати, тому працюю художником.|Я знаю багато мов, тому працюю перекладачкою.}"], ["Wir nehmen das Fahrrad, denn das Wetter ist schön.", "Ми поїдемо велосипедом, бо погода гарна."], ["Der Zug hatte Verspätung, deshalb bin ich zu spät gekommen.", "Потяг запізнився, тому я {прийшов|прийшла} пізно."]],
      tips: ["`deshalb` = `darum` = `deswegen` — усі означають «тому», порядок слів однаковий."],
      warn: ["`deshalb ich gehe` — помилка: після deshalb спершу дієслово: `deshalb gehe ich`."],
    },
    {
      id: "nebensatzVorn", t: "Підрядне спереду: «дієслово, кома, дієслово»", cat: "satz",
      text: [
        "Підрядне речення може стояти **на початку**. Тоді воно займає перше місце, і головне речення починається **одразу з дієслова**: `Weil ich krank war, **bin** ich zu Hause geblieben.`",
        "Запам’ятай «бутерброд»: дієслово в кінці підрядного — кома — дієслово головного: `…krank war, bin ich…`",
      ],
      ex: [["Weil es regnet, nehme ich den Bus.", "Оскільки йде дощ, я поїду автобусом."], ["Weil ich Bücher liebe, möchte ich in einer Buchhandlung arbeiten.", "Я хочу працювати в книгарні, бо люблю книжки."], ["Weil der Chef krank ist, fällt das Meeting aus.", "Нарада скасовується, бо керівник захворів."]],
      warn: ["`Weil es regnet, ich nehme den Bus` — помилка: після коми спершу дієслово: `nehme ich`."],
    },
    {
      id: "nDekl", t: "n-відміна: der Kollege → den Kollegen", cat: "noun",
      text: [
        "Невелика група іменників **чоловічого роду** отримує закінчення `-n` або `-en` **в усіх відмінках, крім називного**: `der Kollege → den Kollegen → dem Kollegen`.",
        "Це переважно назви людей і тварин на `-e`: `der Kollege, der Kunde, der Junge, der Neffe, der Löwe`; слова на `-ent, -ant, -ist`: `der Student, der Praktikant, der Tourist, der Polizist`; а також `der Herr` (→ `Herrn`), `der Mensch`, `der Nachbar`, `der Name` (→ `Namen`).",
      ],
      tables: [
        { head: ["Відмінок", "der Kollege", "der Student", "der Herr"], rows: [["Nominativ", "der Kollege", "der Student", "der Herr"], ["Akkusativ", "den Kollege**n**", "den Student**en**", "den Herr**n**"], ["Dativ", "dem Kollege**n**", "dem Student**en**", "dem Herr**n**"], ["Plural", "die Kollege**n**", "die Student**en**", "die Herr**en**"]] },
      ],
      ex: [["Ich frage meinen Kollegen.", "Я запитаю свого колегу."], ["Kennst du den neuen Praktikanten?", "Ти знаєш нового практиканта?"], ["Die Verkäuferin hilft dem Kunden.", "Продавчиня допомагає клієнтові."], ["Sehr geehrter Herr Weber, …", "Шановний пане Вебере, …"], ["Ich schreibe Herrn Weber eine E-Mail.", "Я пишу панові Веберу листа."]],
      tips: ["У листі звертання — `Sehr geehrter Herr Weber`, а в адресі — `Herrn Max Weber` (кому? → Dativ/Akkusativ)."],
    },
    {
      id: "beruf", t: "Про роботу: досвід і сильні сторони", cat: "rede",
      text: [
        "На співбесіді (`das Vorstellungsgespräch`) питають про досвід, сильні сторони й причини. Готові формули: `Ich arbeite als…` (працюю ким), `bei + фірма` (де саме: `bei Siemens`), `Ich habe Erfahrung mit…` (маю досвід з…), `Ich kann gut…` (я добре вмію…).",
        "Робочий час: `Vollzeit` (повна ставка), `Teilzeit` (неповна), `im Schichtdienst` (позмінно), `Überstunden machen` (працювати понаднормово), `Urlaub nehmen` (брати відпустку).",
        "{Тарас Шевченко справді працював у Києві: 1845 року він їздив Україною й замальовував старі церкви й пам’ятки для Археографічної комісії.|Леся Українка справді добре знала багато мов, а в дев’ятнадцять років написала для сестер підручник з історії.}",
      ],
      ex: [["{Ich habe für eine Kommission in Kyjiw gearbeitet und alte Kirchen gezeichnet.|Ich habe für meine Schwestern ein Geschichtsbuch geschrieben.}", "{Я працював для комісії в Києві й замальовував старі церкви.|Я написала для своїх сестер підручник з історії.}"], ["Ich habe Erfahrung mit Kunden.", "Я маю досвід роботи з клієнтами."], ["Ich kann gut im Team arbeiten.", "Я добре працюю в команді."], ["Ich arbeite Teilzeit, zwanzig Stunden pro Woche.", "Я працюю на неповну ставку, двадцять годин на тиждень."]],
    },
  ],
  phrases: [
    { t: "Чому? — Тому що…", list: [["Warum lernst du Deutsch?", "Чому ти вчиш німецьку?"], ["Weil ich hier arbeiten möchte.", "Бо я хочу тут працювати."], ["Ich komme später, weil ich noch arbeiten muss.", "Я прийду пізніше, бо мені ще треба працювати."], ["Deshalb bin ich hier.", "Тому я тут."]] },
    { t: "Співбесіда", list: [["Warum möchten Sie bei uns arbeiten?", "Чому Ви хочете працювати в нас?"], ["Was sind Ihre Stärken?", "Які Ваші сильні сторони?"], ["Ich bin zuverlässig und lerne schnell.", "Я {надійний|надійна} і швидко вчуся."], ["Ab wann können Sie anfangen?", "З якого часу Ви можете почати?"], ["Wie viel verdient man?", "Яка тут зарплата?"]] },
    { t: "На роботі", list: [["Ich habe heute Frühschicht.", "Сьогодні в мене рання зміна."], ["Ich möchte Urlaub nehmen.", "Я хочу взяти відпустку."], ["Kannst du mich vertreten?", "Можеш мене підмінити?"], ["Ich bin krank und komme heute nicht.", "Я {захворів|захворіла} і сьогодні не прийду."]] },
  ],
  dialog: {
    t: "Співбесіда в книгарні",
    lines: [
      ["Chefin", "Guten Tag, {Herr Schewtschenko|Frau Ukrajinka}. Bitte nehmen Sie Platz.", "Добрий день, {пане Шевченку|пані Українко}. Сідайте, будь ласка."],
      ["{Taras|Lessja}", "Danke schön.", "Щиро дякую."],
      ["Chefin", "Warum möchten Sie in unserer Buchhandlung arbeiten?", "Чому Ви хочете працювати в нашій книгарні?"],
      ["{Taras|Lessja}", "Weil ich Bücher liebe. Ich schreibe selbst {Gedichte|Gedichte und Dramen}.", "{Бо я люблю книжки. Я сам пишу вірші.|Бо я люблю книжки. Я сама пишу вірші й драми.}"],
      ["Chefin", "Interessant! Und was sind Ihre Stärken?", "Цікаво! А які Ваші сильні сторони?"],
      ["{Taras|Lessja}", "{Ich kann gut zeichnen, deshalb kann ich auch Plakate und Schaufenster gestalten.|Ich spreche viele Sprachen, deshalb kann ich Kunden auf Englisch, Französisch und Italienisch beraten.}", "{Я добре малюю, тому можу оформлювати й плакати, і вітрини.|Я знаю багато мов, тому можу консультувати клієнтів англійською, французькою та італійською.}"],
      ["Chefin", "Sehr gut. Wir suchen jemanden in Teilzeit, zwanzig Stunden pro Woche. Passt das?", "Дуже добре. Ми шукаємо працівника на неповну ставку, двадцять годин на тиждень. Вам підходить?"],
      ["{Taras|Lessja}", "Ja, das passt gut, weil ich vormittags den Deutschkurs habe.", "Так, це добре підходить, бо вранці в мене курс німецької."],
      ["Chefin", "Prima. Ab wann können Sie anfangen?", "Чудово. З якого часу Ви можете почати?"],
      ["{Taras|Lessja}", "Ab dem ersten Dezember.", "З першого грудня."],
      ["Chefin", "Dann zeige ich Ihnen jetzt den Laden. Meine Kollegin erklärt Ihnen die Kasse.", "Тоді я зараз покажу Вам крамницю. Моя колега пояснить Вам, як працює каса."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich lerne Deutsch, weil ich hier ___. (arbeiten)", a: ["arbeite"], why: "Після weil дієслово в кінці." },
    { t: "gap", q: "Er kommt nicht, weil er krank ___. (sein)", a: ["ist"] },
    { t: "gap", q: "Ich bin müde, weil ich lange gearbeitet ___. (haben)", a: ["habe"] },
    { t: "gap", q: "Wir warten, weil der Film gleich ___. (anfangen)", a: ["anfängt"], why: "Відокремлюване дієслово в кінці пишеться разом." },
    { t: "gap", q: "Es regnet, deshalb ___ ich den Bus. (nehmen)", a: ["nehme"], why: "deshalb + дієслово + підмет." },
    { t: "gap", q: "Weil ich krank war, ___ ich zu Hause geblieben. (sein)", a: ["bin"], why: "Дієслово, кома, дієслово." },
    { t: "gap", q: "Ich frage meinen ___. (der Kollege)", a: ["Kollegen"], why: "n-відміна: den Kollegen." },
    { t: "gap", q: "Die Verkäuferin hilft dem ___. (der Kunde)", a: ["Kunden"] },
    { t: "gap", q: "Ich schreibe ___ Weber eine E-Mail. (der Herr)", a: ["Herrn"] },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich bleibe zu Hause, weil ich bin krank.", "Ich bleibe zu Hause, weil ich krank bin.", "Ich bleibe zu Hause, weil krank ich bin."], a: 1 },
    { t: "mc", q: "Після якого слова звичайний порядок (дієслово на другому місці, без перестановки)?", o: ["denn", "weil", "deshalb"], a: 0 },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich habe Hunger, deshalb ich esse.", "Ich habe Hunger, deshalb esse ich.", "Ich habe Hunger, deshalb ich essen."], a: 1 },
    { t: "mc", q: "«Повна ставка» німецькою:", o: ["Vollzeit", "Teilzeit", "Überstunden"], a: 0 },
    { t: "mc", q: "Як правильно?", o: ["Kennst du den Student?", "Kennst du den Studenten?", "Kennst du dem Studenten?"], a: 1 },
  ],
};
