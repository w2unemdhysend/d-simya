// Розділ 22 (A2). Кухня й рецепти: прикметник без артикля (frischer Fisch, mit warmer Milch), пасив теперішнього
// часу (Die Suppe wird gekocht), неозначене man, послідовність дій (zuerst, dann, danach), мова рецептів.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 22, part: "A2.1", title: "Кухня й рецепти", book: null,
  goals: [
    "розуміти й пояснювати рецепт: продукти, міри, дії",
    "вживати прикметник без артикля: frischer Fisch, mit warmer Milch",
    "розуміти пасив (Die Suppe wird gekocht) і казати те саме з man",
    "розповідати по черзі: zuerst, dann, danach, zum Schluss",
  ],
  grammar: [
    {
      id: "adjOhne", t: "Прикметник без артикля: frischer Fisch, kaltes Wasser", cat: "adj",
      text: [
        "Коли перед іменником **немає артикля** (часто з продуктами: молоко, хліб, вода, а також у множині), прикметник сам показує рід і відмінок. Він бере закінчення **означеного артикля**: de**r** → frisch**er** Fisch, da**s** → kalt**es** Wasser, di**e** → warm**e** Milch.",
        "У знахідному чоловічий рід має **-en** (`den` → `frischen Fisch`), у давальному — **-em, -er, -em, -en** (`dem` → `mit frischem Fisch`, `der` → `mit warmer Milch`).",
        "Так пишуть у рецептах, меню й оголошеннях: `Frische Brötchen!`, `heißer Tee`, `mit braunem Zucker`.",
      ],
      tables: [
        { head: ["", "m (der)", "f (die)", "n (das)", "Pl. (die)"], rows: [["Nom.", "frisch**er** Fisch", "warm**e** Milch", "kalt**es** Wasser", "frisch**e** Eier"], ["Akk.", "frisch**en** Fisch", "warm**e** Milch", "kalt**es** Wasser", "frisch**e** Eier"], ["Dat.", "mit frisch**em** Fisch", "mit warm**er** Milch", "mit kalt**em** Wasser", "mit frisch**en** Eier**n**"]] },
      ],
      ex: [["Ich trinke gern heißen Tee mit frischer Zitrone.", "Я люблю гарячий чай зі свіжим лимоном."], ["Hier gibt es frische Brötchen.", "Тут продають свіжі булочки."], ["Dazu passt grüner Salat.", "До цього пасує зелений салат."], ["Wir backen mit braunem Zucker.", "Ми печемо з коричневим цукром."], ["Borschtsch schmeckt mit saurer Sahne am besten.", "Борщ найсмачніший зі сметаною."]],
      tips: ["Три таблиці разом (розділи 21 і 22): після `der, die, das` — лише -e і -en; після `ein` — -er і -es там, де `ein` не показує роду; без артикля — закінчення самого артикля."],
    },
    {
      id: "passiv", t: "Пасив: Die Suppe wird gekocht", cat: "verb",
      text: [
        "Пасив показує **дію**, а не того, хто її робить. Він часто трапляється в рецептах, інструкціях і новинах: `Die Kartoffeln werden geschält.` — «Картоплю чистять».",
        "Будова: **werden** на другому місці + **Partizip II** у кінці: `Das Gemüse wird geschnitten.`",
        "Якщо треба сказати, хто це робить, — `von` + Dativ: `Das Essen wird von Max gekocht.`",
      ],
      tables: [
        { cap: "werden у теперішньому часі", head: ["Особа", "werden", "Приклад"], rows: [["ich", "werde", "ich werde gefragt"], ["du", "wirst", "du wirst gerufen"], ["er/sie/es", "wird", "die Suppe wird gekocht"], ["wir", "werden", "wir werden eingeladen"], ["ihr", "werdet", "ihr werdet abgeholt"], ["sie/Sie", "werden", "die Eier werden gekocht"]] },
      ],
      ex: [["Zuerst wird das Wasser gekocht.", "Спершу кип’ятять воду."], ["Die Zwiebeln werden klein geschnitten.", "Цибулю дрібно нарізають."], ["In Deutschland wird viel Brot gegessen.", "У Німеччині їдять багато хліба."], ["Das Restaurant wird um zwölf Uhr geöffnet.", "Ресторан відчиняють о дванадцятій."], ["Der Kuchen wird von meiner Freundin gebacken.", "Пиріг пече моя подруга."]],
      warn: ["`Die Suppe wird kochen` — це майбутній час («суп закипить»), а не пасив. Пасив: `werden` + **Partizip II**: `Die Suppe wird gekocht.`"],
      tips: ["Українською пасив найчастіше перекладаємо реченням без підмета: «картоплю чистять», «тут не палять»."],
    },
    {
      id: "man", t: "man: Man nimmt…, man braucht…", cat: "pron",
      text: [
        "`man` — це «хтось», «люди взагалі». Українською так кажуть без підмета: «як це **готують**?», «тут **палять**?». Дієслово з `man` — як з `er`: `man nimmt, man braucht, man kann`.",
        "`man` і пасив часто означають одне й те саме: `Man schneidet die Zwiebeln.` = `Die Zwiebeln werden geschnitten.`",
        "Не плутай: `man` (з малої літери, одне n) — «хтось», `der Mann` — чоловік.",
      ],
      tables: [
        { head: ["man", "Пасив", "Українською"], rows: [["Man kocht das Wasser.", "Das Wasser wird gekocht.", "Воду кип’ятять."], ["Man schneidet das Brot.", "Das Brot wird geschnitten.", "Хліб нарізають."], ["Hier spricht man Deutsch.", "Hier wird Deutsch gesprochen.", "Тут розмовляють німецькою."]] },
      ],
      ex: [["Was braucht man für einen Borschtsch?", "Що потрібно для борщу?"], ["Wie macht man das?", "Як це робиться?"], ["Hier darf man nicht rauchen.", "Тут не можна курити."], ["Man nimmt zwei Eier und etwas Mehl.", "Беруть два яйця й трохи борошна."]],
      warn: ["`Man brauchen…` — помилка: дієслово з `man` — як з `er`: `man braucht`."],
    },
    {
      id: "reihenfolge", t: "Спершу, потім, наприкінці: zuerst, dann, zum Schluss", cat: "satz",
      text: [
        "Щоб розповісти, що за чим іде (рецепт, інструкція, день), німецькою кажуть: `zuerst` (спершу), `dann` (потім), `danach` (після цього), `später` (пізніше), `zum Schluss` (наприкінці).",
        "Ці слова стоять **на першому місці**, тому дієслово йде одразу після них, а підмет — за дієсловом (розділ 5): `Dann **schneidet man** das Gemüse.`",
      ],
      ex: [["Zuerst wäscht man das Gemüse.", "Спершу миють овочі."], ["Dann schneidet man die Kartoffeln in Würfel.", "Потім картоплю ріжуть кубиками."], ["Danach kocht alles zwanzig Minuten.", "Після цього все вариться двадцять хвилин."], ["Zum Schluss gibt man Salz und Pfeffer dazu.", "Наприкінці додають сіль і перець."]],
      warn: ["`Dann man schneidet…` — помилка: після `dann` одразу дієслово: `Dann schneidet man…`"],
    },
    {
      id: "rezept", t: "Рецепт: продукти, міри, дії", cat: "rede",
      text: [
        "У німецьких рецептах дію часто пишуть **інфінітивом** у кінці: `Zwiebeln schälen und klein schneiden.` Так коротше, ніж `Man schält…` чи `Schälen Sie…`.",
        "Скорочення мір: `EL` — столова ложка (`der Esslöffel`), `TL` — чайна ложка (`der Teelöffel`), `g` — грам, `ml` — мілілітр, `eine Prise Salz` — дрібка солі.",
        "Дієслова кухні: `schälen` (чистити), `schneiden` (різати), `braten` (смажити), `kochen` (варити), `backen` (пекти), `rühren` (мішати), `dazugeben` (додавати).",
      ],
      tables: [
        { cap: "Pfannkuchen — німецькі млинці", head: ["Скільки", "Що"], rows: [["250 g", "Mehl — борошно"], ["3", "Eier — яйця"], ["500 ml", "Milch — молоко"], ["1 Prise", "Salz — сіль"], ["2 EL", "Öl — олія"]] },
      ],
      ex: [["Die Eier mit der Milch verrühren.", "Збити яйця з молоком."], ["Das Mehl dazugeben und gut rühren.", "Додати борошно й добре перемішати."], ["Etwas Öl in der Pfanne erhitzen.", "Розігріти трохи олії на сковороді."], ["Die Pfannkuchen von beiden Seiten goldbraun braten.", "Обсмажити млинці з обох боків до золотистого кольору."]],
      tips: ["У 2022 році ЮНЕСКО внесла культуру приготування українського борщу до списку нематеріальної спадщини, що потребує термінової охорони."],
    },
  ],
  phrases: [
    { t: "На кухні", list: [["Was kochst du heute?", "Що ти сьогодні готуєш?"], ["Kannst du mir das Rezept geben?", "Можеш дати мені рецепт?"], ["Wie lange muss das kochen?", "Скільки це має варитися?"], ["Das riecht aber lecker!", "Як смачно пахне!"], ["Probier mal!", "Скуштуй!"]] },
    { t: "За столом", list: [["Das schmeckt sehr gut.", "Це дуже смачно."], ["Möchtest du noch etwas?", "Хочеш іще чогось?"], ["Nein danke, ich bin satt.", "Ні, дякую, я {наївся|наїлася}."], ["Kann ich bitte das Salz haben?", "Можна мені сіль, будь ласка?"]] },
    { t: "Смак", list: [["Das ist zu salzig.", "Це пересолено."], ["Die Suppe ist ein bisschen scharf.", "Суп трохи гострий."], ["Ich esse kein Fleisch.", "Я не їм м’яса."], ["Ist da Knoblauch drin?", "Там є часник?"]] },
  ],
  dialog: {
    t: "Борщ для Макса",
    lines: [
      ["Max", "Sag mal, am Samstag koche ich für meine Freunde. Kennst du ein ukrainisches Rezept?", "Слухай, у суботу я готую для друзів. Знаєш якийсь український рецепт?"],
      ["{Taras|Lessja}", "Natürlich! Koch doch Borschtsch, das ist eine rote Suppe mit Roter Bete. Ich habe ihn schon oft gekocht.", "Звісно! Звари борщ — це червоний суп із буряком. Я вже не раз його {варив|варила}."],
      ["Max", "Klingt gut! Was braucht man alles?", "Звучить добре! А що для нього потрібно?"],
      ["{Taras|Lessja}", "Rote Bete, Kohl, Kartoffeln, Karotten, Zwiebeln, Knoblauch und frischen Dill.", "Буряк, капусту, картоплю, моркву, цибулю, часник і свіжий кріп."],
      ["Max", "Und wie wird er gekocht?", "А як його варять?"],
      ["{Taras|Lessja}", "Zuerst wird die Brühe gekocht. Dann schneidet man das Gemüse in Streifen.", "Спершу варять бульйон. Потім овочі ріжуть соломкою."],
      ["{Taras|Lessja}", "Die Rote Bete dünstet man kurz mit etwas Essig. So bleibt sie schön rot.", "Буряк коротко тушкують із краплею оцту. Так він лишається яскраво-червоним."],
      ["Max", "Mit Essig? Das wusste ich nicht! Und dann?", "З оцтом? Не знав! А далі?"],
      ["{Taras|Lessja}", "Danach kommt alles in die Brühe. Zum Schluss gibt man Knoblauch und Dill dazu.", "Після цього все кладуть у бульйон. Наприкінці додають часник і кріп."],
      ["Max", "Und was isst man dazu?", "А що їдять до нього?"],
      ["{Taras|Lessja}", "Saure Sahne und Pampuschky, kleine Brötchen mit Knoblauch. Soll ich am Samstag mitkochen?", "Сметану й пампушки — маленькі булочки з часником. Може, мені в суботу готувати разом з тобою?"],
      ["Max", "Oh ja, bitte! Allein schaffe ich das nie.", "О так, будь ласка! Сам я ніколи не впораюся."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich trinke gern ___ Tee. (heiß)", a: ["heißen"], why: "der Tee, Akkusativ, без артикля — -en." },
    { t: "gap", q: "Hier gibt es ___ Brötchen. (frisch)", a: ["frische"] },
    { t: "gap", q: "Ich nehme Kaffee mit ___ Milch. (warm)", a: ["warmer"], why: "mit + Dativ, die Milch — -er (як der)." },
    { t: "gap", q: "Ich trinke gern ___ Wasser. (kalt)", a: ["kaltes"] },
    { t: "gap", q: "Die Suppe ___ gekocht. (werden)", a: ["wird"] },
    { t: "gap", q: "Die Kartoffeln ___ geschält. (werden)", a: ["werden"] },
    { t: "gap", q: "Das Brot wird ___. (schneiden, Partizip II)", a: ["geschnitten"] },
    { t: "gap", q: "Was braucht ___ für einen Borschtsch?", a: ["man"] },
    { t: "gap", q: "Zuerst ___ man das Gemüse. (waschen)", a: ["wäscht"] },
    { t: "mc", q: "Як правильно?", o: ["Dann man schneidet das Brot.", "Dann schneidet man das Brot.", "Dann schneiden man das Brot."], a: 1 },
    { t: "mc", q: "Яке речення в пасиві?", o: ["Die Suppe wird kalt.", "Die Suppe wird gekocht.", "Die Suppe wird kochen."], a: 1, why: "Пасив — werden + Partizip II." },
    { t: "mc", q: "Що означає «EL» у рецепті?", o: ["столова ложка", "чайна ложка", "літр"], a: 0 },
    { t: "mc", q: "Що таке «saure Sahne»?", o: ["сметана", "вершкове масло", "кефір"], a: 0 },
    { t: "mc", q: "Як найчастіше пишуть дію в німецькому рецепті?", o: ["Zwiebeln schneiden.", "Zwiebeln geschnitten.", "Zwiebeln schneidet."], a: 0 },
  ],
};
