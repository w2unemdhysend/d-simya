// Розділ 19 (A2). Думки й новини: підрядні речення з dass і ob, непрямі питання (Weißt du, wann…?), як висловити думку.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 19, part: "A2.1", title: "Думки й новини", book: null,
  goals: [
    "переказувати, що думаєш, знаєш чи чув: Ich glaube, dass…",
    "питати ввічливо й непрямо: Weißt du, wann…? Wissen Sie, ob…?",
    "висловлювати думку, погоджуватися й заперечувати",
    "відрізняти dass і das, ob і wenn",
  ],
  grammar: [
    {
      id: "dass", t: "dass: «що» перед підрядним реченням", cat: "satz",
      text: [
        "`dass` — це українське «що» в реченнях на кшталт «я думаю, **що**…», «я знаю, **що**…». Після `dass` — **підрядне речення**: дієслово йде **в кінець**, як після `weil` (розділ 18).",
        "Найчастіше `dass` стоїть після дієслів думки й мовлення: `glauben, denken, finden, wissen, hoffen, sagen, hören, meinen` і після виразів `Es ist wichtig / schön / schade, dass…`.",
        "У розмові `dass` іноді пропускають: `Ich glaube, er kommt heute nicht.` Тоді порядок слів звичайний. Обидва варіанти правильні.",
      ],
      tables: [
        { head: ["Головне речення", "Підрядне з dass"], rows: [["Ich glaube,", "dass er heute **kommt**."], ["Ich hoffe,", "dass das Wetter schön **wird**."], ["Es ist wichtig,", "dass du pünktlich **bist**."], ["Hast du gehört,", "dass der Kurs morgen **ausfällt**?"]] },
      ],
      ex: [["Ich finde, dass Deutsch gar nicht so schwer ist.", "Я вважаю, що німецька зовсім не така складна."], ["Ich hoffe, dass wir uns bald wiedersehen.", "Сподіваюся, що ми скоро побачимося."], ["Es ist schade, dass du nicht kommen kannst.", "Шкода, що ти не можеш прийти."], ["Er sagt, dass er morgen keine Zeit hat.", "Він каже, що завтра не має часу."]],
      warn: ["`dass` (що, сполучник) пишеться з **ss**, а `das` (це; артикль) — з одним s. Перевірка: якщо можна замінити на `dieses` або `welches` — це `das`."],
    },
    {
      id: "ob", t: "ob: «чи» в непрямому питанні", cat: "satz",
      text: [
        "Коли переказуєш питання «так чи ні», ставиш `ob` — українське «чи»: `Kommst du morgen?` → `Ich weiß nicht, ob du morgen kommst.` — «Я не знаю, чи ти прийдеш завтра».",
        "Після `ob` дієслово теж **у кінці**. `ob` найчастіше стоїть після `wissen, fragen, nicht sicher sein` і в ввічливих питаннях: `Wissen Sie, ob…?`",
      ],
      tables: [
        { cap: "Пряме питання → непряме", head: ["Пряме", "Непряме"], rows: [["Ist der Laden offen?", "Weißt du, ob der Laden offen **ist**?"], ["Hat er Zeit?", "Ich frage ihn, ob er Zeit **hat**."], ["Kann ich hier parken?", "Wissen Sie, ob ich hier parken **kann**?"]] },
      ],
      ex: [["Ich weiß nicht, ob ich heute Zeit habe.", "Я не знаю, чи матиму сьогодні час."], ["Kannst du fragen, ob die Apotheke noch offen ist?", "Можеш запитати, чи аптека ще відчинена?"], ["Weißt du, ob Max auch kommt?", "Ти знаєш, чи Макс теж прийде?"]],
      warn: ["`ob` (чи) ≠ `wenn` (якщо, коли). «Я не знаю, **чи** він прийде» — `ob`, не `wenn`.", "«Чи» на початку прямого питання німецькою не перекладають: «Чи ти прийдеш?» = `Kommst du?`"],
    },
    {
      id: "indirekt", t: "Непрямі питання: Weißt du, wann…?", cat: "satz",
      text: [
        "Питання з питальним словом (`wann, wo, wie, was, warum, wie viel…`) теж можна поставити непрямо — це **ввічливіше**: `Wann beginnt der Kurs?` → `Weißt du, **wann** der Kurs **beginnt**?`",
        "Питальне слово стає на початок підрядного, дієслово — в кінець. Корисні «вступи»: `Weißt du, …?`, `Wissen Sie, …?`, `Können Sie mir sagen, …?`, `Ich möchte wissen, …`, `Ich weiß nicht, …`.",
      ],
      tables: [
        { head: ["Пряме питання", "Непряме"], rows: [["Wo ist der Bahnhof?", "Können Sie mir sagen, wo der Bahnhof **ist**?"], ["Wie viel kostet das?", "Wissen Sie, wie viel das **kostet**?"], ["Warum ist er nicht da?", "Ich weiß nicht, warum er nicht da **ist**."], ["Wann fährt der Bus?", "Weißt du, wann der Bus **fährt**?"]] },
      ],
      ex: [["Können Sie mir sagen, wie spät es ist?", "Не підкажете, котра година?"], ["Ich möchte wissen, wann die Prüfung ist.", "Я хочу знати, коли іспит."], ["Weißt du, wo man hier Briefmarken kaufen kann?", "Ти знаєш, де тут можна купити марки?"]],
      tips: ["На ввічливе непряме питання відповідають звичайно: `Wissen Sie, wo der Bahnhof ist? – Ja, gleich da vorne.`"],
    },
    {
      id: "meinungA2", t: "Думка: Ich finde…, Meiner Meinung nach…", cat: "rede",
      text: [
        "Висловити думку: `Ich finde, dass…` / `Ich denke, dass…` / `Ich glaube, dass…` / `Meiner Meinung nach…` (на мою думку). Після `Meiner Meinung nach` — **дієслово**, потім підмет: `Meiner Meinung nach **ist** das zu teuer.`",
        "Погодитися: `Da hast du recht.` (тут ти правий/права), `Das stimmt.` (це правда), `Genau!` (саме так). Заперечити ввічливо: `Das sehe ich anders.` (я бачу це інакше), `Ich bin nicht sicher.` (я не {впевнений|впевнена}), `Das stimmt nicht ganz.` (це не зовсім так).",
      ],
      ex: [["Meiner Meinung nach ist das Wetter in Deutschland zu kalt.", "На мою думку, погода в Німеччині надто холодна."], ["Da hast du recht.", "Тут ти маєш рацію."], ["Das sehe ich anders.", "Я бачу це інакше."], ["Ich bin nicht sicher, ob das stimmt.", "Я не {впевнений|впевнена}, що це правда."]],
      warn: ["«Я так думаю» — `Ich glaube schon.` або `Ich denke schon.`, не «Ich denke so» (калька з англійської)."],
    },
    {
      id: "nachrichten", t: "Новини: Hast du schon gehört…?", cat: "rede",
      text: [
        "Розповісти новину: `Hast du schon gehört, dass…?` (ти вже чув/чула, що…?), `Stell dir vor, …` (уяви собі…), `Weißt du was?` (знаєш що?).",
        "Відреагувати: `Echt?` / `Wirklich?` (справді?), `Das gibt's doch nicht!` (не може бути!), `Wie schön!` (як гарно!), `Wie schade!` (як шкода!), `Das wusste ich nicht.` (я цього не {знав|знала}).",
      ],
      ex: [["Hast du schon gehört, dass Anna ein Baby bekommt?", "Ти вже знаєш, що в Анни буде дитина?"], ["Stell dir vor, ich habe den Test bestanden!", "Уяви собі, я {склав|склала} тест!"], ["Echt? Das wusste ich nicht.", "Справді? Я цього не {знав|знала}."], ["Wie schade, dass du nicht da warst!", "Як шкода, що тебе не було!"]],
    },
  ],
  phrases: [
    { t: "Моя думка", list: [["Ich finde, dass…", "Я вважаю, що…"], ["Ich glaube nicht, dass…", "Не думаю, що…"], ["Meiner Meinung nach…", "На мою думку…"], ["Da hast du recht.", "Тут ти маєш рацію."], ["Das sehe ich anders.", "Я бачу це інакше."], ["Ich bin nicht sicher.", "Я не {впевнений|впевнена}."]] },
    { t: "Ввічливо запитати", list: [["Können Sie mir sagen, wo…?", "Не підкажете, де…?"], ["Wissen Sie, ob…?", "Ви не знаєте, чи…?"], ["Ich möchte wissen, wann…", "Я хочу знати, коли…"], ["Weißt du, wie viel das kostet?", "Ти знаєш, скільки це коштує?"]] },
    { t: "Новини", list: [["Hast du schon gehört?", "Ти вже знаєш?"], ["Stell dir vor!", "Уяви собі!"], ["Echt? / Wirklich?", "Справді?"], ["Das gibt's doch nicht!", "Не може бути!"], ["Das wusste ich nicht.", "Я цього не {знав|знала}."]] },
  ],
  dialog: {
    t: "Новини після заняття",
    lines: [
      ["Max", "Hast du schon gehört, dass der Kurs am Freitag ausfällt?", "Ти вже знаєш, що в п’ятницю заняття не буде?"],
      ["{Taras|Lessja}", "Echt? Das wusste ich nicht. Weißt du, warum?", "Справді? Я цього не {знав|знала}. Ти знаєш чому?"],
      ["Max", "Frau Krüger ist auf einer Konferenz. Ich glaube, dass wir am Montag einen Test schreiben.", "Пані Крюґер на конференції. Здається, у понеділок у нас буде тест."],
      ["{Taras|Lessja}", "Oh nein! Ich weiß nicht, ob ich bis Montag alles lernen kann.", "Ой ні! Не знаю, чи встигну все вивчити до понеділка."],
      ["Max", "Das schaffst du! Meiner Meinung nach ist dein Deutsch schon richtig gut.", "Ти впораєшся! На мою думку, твоя німецька вже справді хороша."],
      ["{Taras|Lessja}", "Danke! Aber die Grammatik finde ich noch schwer. Vor allem die Nebensätze.", "Дякую! Але граматика мені ще важко дається. Особливо підрядні речення."],
      ["Max", "Da hast du recht, das ist nicht leicht. Sollen wir am Samstag zusammen lernen?", "Тут ти маєш рацію, це нелегко. Може, повчимося разом у суботу?"],
      ["{Taras|Lessja}", "Gute Idee! Weißt du, ob die Bibliothek am Samstag offen ist?", "Гарна ідея! Ти не знаєш, чи бібліотека в суботу відчинена?"],
      ["Max", "Ich glaube schon, bis vierzehn Uhr. Ich schaue mal nach.", "Здається, так, до чотирнадцятої. Я ще перевірю."],
      ["{Taras|Lessja}", "Super. Dann bis Samstag!", "Чудово. Тоді до суботи!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich glaube, dass er heute nicht ___. (kommen)", a: ["kommt"], why: "Після dass дієслово в кінці." },
    { t: "gap", q: "Es ist wichtig, dass du pünktlich ___. (sein)", a: ["bist"] },
    { t: "gap", q: "Ich hoffe, dass wir uns bald ___. (wiedersehen)", a: ["wiedersehen"] },
    { t: "gap", q: "Ich weiß nicht, ___ er Zeit hat. (чи)", a: ["ob"] },
    { t: "gap", q: "Weißt du, wann der Bus ___? (fahren)", a: ["fährt"] },
    { t: "gap", q: "Können Sie mir sagen, wo der Bahnhof ___? (sein)", a: ["ist"] },
    { t: "gap", q: "Meiner Meinung nach ___ das zu teuer. (sein)", a: ["ist"], why: "Після «Meiner Meinung nach» — дієслово." },
    { t: "mc", q: "Яке слово? Ich weiß, ___ du recht hast.", o: ["dass", "das", "ob"], a: 0 },
    { t: "mc", q: "Яке слово? Ist ___ dein Buch?", o: ["dass", "das", "ob"], a: 1 },
    { t: "mc", q: "«Я не знаю, чи він прийде»:", o: ["Ich weiß nicht, wenn er kommt.", "Ich weiß nicht, ob er kommt.", "Ich weiß nicht, ob kommt er."], a: 1 },
    { t: "mc", q: "Яке непряме питання правильне?", o: ["Weißt du, wo ist die Post?", "Weißt du, wo die Post ist?", "Weißt du, die Post wo ist?"], a: 1 },
    { t: "mc", q: "Як ввічливо не погодитися?", o: ["Das sehe ich anders.", "Das ist Quatsch.", "Du hast keine Ahnung."], a: 0 },
    { t: "mc", q: "«Я так думаю» німецькою:", o: ["Ich denke so.", "Ich glaube schon.", "Ich meine so."], a: 1 },
  ],
};
