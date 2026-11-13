// Розділ 21 (A2). Одяг і зовнішність: закінчення прикметника після der/die/das, після ein/kein/mein і в Dativ,
// опис людини (sein, haben, tragen), обмін і повернення покупок.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 21, part: "A2.1", title: "Одяг і зовнішність", book: null,
  goals: [
    "ставити закінчення прикметника після der, die, das і після ein, kein, mein",
    "описувати одяг: колір, матеріал, візерунок",
    "описувати людину: зріст, волосся, окуляри, борода",
    "обмінювати й повертати речі в магазині",
  ],
  grammar: [
    {
      id: "adjBest", t: "Прикметник після der, die, das: der warme Mantel", cat: "adj",
      text: [
        "Коли прикметник стоїть **після іменника** через `sein`, він не змінюється: `Der Mantel ist warm.` Коли **перед іменником** — отримує закінчення: `der warme Mantel`.",
        "Після означеного артикля (`der, die, das`, а також `dieser, welcher, jeder`) закінчень лише два: **-e** і **-en**. Артикль уже показує рід і відмінок, тому прикметнику досить короткого закінчення.",
        "Правило п’яти клітинок: **-e** — у називному відмінку однини (усі три роди) і в знахідному для `die` та `das`. Усюди інде — **-en**.",
      ],
      tables: [
        { head: ["", "m (der)", "f (die)", "n (das)", "Pl. (die)"], rows: [["Nom.", "der warm**e** Mantel", "die warm**e** Jacke", "das warm**e** Hemd", "die warm**en** Schuhe"], ["Akk.", "den warm**en** Mantel", "die warm**e** Jacke", "das warm**e** Hemd", "die warm**en** Schuhe"], ["Dat.", "dem warm**en** Mantel", "der warm**en** Jacke", "dem warm**en** Hemd", "den warm**en** Schuhe**n**"]] },
      ],
      ex: [["Der blaue Pullover ist schön.", "Синій светр гарний."], ["Ich nehme die schwarze Hose.", "Я візьму чорні штани."], ["Wie findest du das gelbe Kleid?", "Як тобі жовта сукня?"], ["Die neuen Schuhe sind bequem.", "Нові черевики зручні."], ["Siehst du den großen Mann dort?", "Бачиш он того високого чоловіка?"]],
      warn: ["`der warm Mantel` — помилка: перед іменником прикметник завжди має закінчення: `der warme Mantel`.", "`Der Mantel ist warme` — помилка: після `sein` закінчення немає: `Der Mantel ist warm.`"],
      tips: ["Сумніваєшся — кажи **-en**: у таблиці саме воно трапляється найчастіше."],
    },
    {
      id: "adjUnbest", t: "Прикметник після ein, kein, mein: ein warmer Mantel", cat: "adj",
      text: [
        "Після `ein, kein, mein, dein, sein, ihr, unser…` закінчення інші, бо `ein` не завжди показує рід: `ein Mantel` і `ein Hemd` виглядають однаково. Тоді рід показує сам прикметник.",
        "Закінчення прикметника повторює останню літеру означеного артикля: de**r** → ein warm**er** Mantel, da**s** → ein warm**es** Hemd, di**e** → eine warm**e** Jacke.",
        "У знахідному змінюється лише чоловічий рід: `einen warmen Mantel`. У давальному й у множині — знову **-en**.",
      ],
      tables: [
        { head: ["", "m (der)", "f (die)", "n (das)", "Pl. (die)"], rows: [["Nom.", "ein warm**er** Mantel", "eine warm**e** Jacke", "ein warm**es** Hemd", "keine warm**en** Schuhe"], ["Akk.", "einen warm**en** Mantel", "eine warm**e** Jacke", "ein warm**es** Hemd", "keine warm**en** Schuhe"], ["Dat.", "einem warm**en** Mantel", "einer warm**en** Jacke", "einem warm**en** Hemd", "keinen warm**en** Schuhe**n**"]] },
      ],
      ex: [["Ich suche einen warmen Mantel.", "Я шукаю тепле пальто."], ["Das ist ein schönes Hemd!", "Це гарна сорочка!"], ["Sie trägt eine rote Mütze.", "Вона в червоній шапці."], ["Ich habe keine bequemen Schuhe.", "У мене немає зручних черевиків."], ["Mein neuer Schal ist aus Wolle.", "Мій новий шарф вовняний."]],
      tips: ["Порівняй: `der neue Schal` — `mein neuer Schal`; `das neue Hemd` — `ein neues Hemd`. Коли артикль «мовчить» про рід, говорить прикметник."],
    },
    {
      id: "adjDat", t: "Прикметник у Dativ: mit dem roten Schal", cat: "adj",
      text: [
        "У давальному відмінку (після `mit, aus, bei, von, zu, nach, seit` і на питання «де?») прикметник має **-en** — завжди, з будь-яким артиклем: `mit dem roten Schal`, `mit einer warmen Jacke`, `in einem kleinen Geschäft`.",
        "Це найпростіша частина таблиць: бачиш Dativ — кажи -en. А в множині ще й іменник отримує -n: `mit den neuen Schuhen`.",
      ],
      ex: [["Wer ist die Frau mit dem roten Schal?", "Хто та жінка з червоним шарфом?"], ["Ich gehe mit meiner alten Freundin einkaufen.", "Я йду на закупи зі своєю давньою подругою."], ["Das Kleid hängt im großen Schrank.", "Сукня висить у великій шафі."], ["Er wohnt in einem alten Haus.", "Він живе в старому будинку."], ["Wir sprechen mit den neuen Nachbarn.", "Ми розмовляємо з новими сусідами."]],
      warn: ["`mit dem rote Schal` — помилка: у Dativ прикметник має -en: `mit dem roten Schal`."],
    },
    {
      id: "aussehen", t: "Зовнішність: Er hat kurze Haare und trägt eine Brille", cat: "rede",
      text: [
        "Щоб описати людину, потрібні три дієслова: `sein` (який він?), `haben` (що в нього є?) і `tragen` (що він носить?). `tragen` змінює голосний: `du trägst, er trägt`.",
        "`Er ist groß und schlank.` `Sie hat lange, dunkle Haare.` `Er trägt eine Brille und einen Bart.` Волосся німецькою зазвичай у множині: `Ihre Haare sind lang.`",
        "Прикметник у множині без артикля має **-e**: `lange Haare`, `blaue Augen` (докладніше — у розділі 22). А «Який він на вигляд?» — `Wie sieht er aus?` (`aussehen`).",
      ],
      tables: [
        { cap: "Як описати людину", head: ["Питання", "Приклад"], rows: [["Wie groß?", "groß, klein, mittelgroß"], ["Die Figur?", "schlank, kräftig"], ["Die Haare?", "kurze, lange, lockige, glatte Haare; blond, braun, schwarz, grau"], ["Die Augen?", "blaue, braune, grüne Augen"], ["Was trägt er?", "eine Brille, einen Bart, einen Schnurrbart, eine Mütze"]] },
      ],
      ex: [["{Ich habe einen Schnurrbart und trage gern eine hohe Mütze.|Ich habe lange, dunkle Haare und trage gern Blusen mit Stickerei.}", "{У мене вуса, і я люблю носити високу шапку.|У мене довге темне волосся, і я люблю носити вишиті блузки.}"], ["Anna hat blonde Haare und grüne Augen.", "В Анни світле волосся й зелені очі."], ["Max ist groß und hat einen Bart.", "Макс високий і має бороду."], ["Frau Krüger trägt eine Brille.", "Пані Крюґер носить окуляри."], ["Wie sieht dein Bruder aus?", "Який на вигляд твій брат?"]],
      tips: ["Подивись на маленькі аватари в діалогах: кожного з героїв можна описати цими словами."],
    },
    {
      id: "umtausch", t: "Обмін і повернення: umtauschen, der Kassenbon", cat: "rede",
      text: [
        "Хочеш обміняти чи повернути річ — візьми **чек** (`der Kassenbon`) і, якщо є, упаковку. Кажуть: `Ich möchte das umtauschen` (обміняти) або `Ich möchte das zurückgeben` (повернути й отримати гроші назад).",
        "Важливо: у звичайному магазині обмін **справної** речі — це добра воля магазину (`aus Kulanz`), а не обов’язок. Багато магазинів дозволяють обмін протягом 14 або 30 днів — запитай про це під час покупки.",
        "Якщо річ **зіпсована**, продавець мусить її полагодити або замінити, а якщо не вийде — повернути гроші (`die Gewährleistung`). Покупки **в інтернеті** можна повернути протягом **14 днів** без пояснень (`das Widerrufsrecht`).",
      ],
      ex: [["Ich möchte diese Hose umtauschen. Sie ist zu klein.", "Я хочу обміняти ці штани. Вони замалі."], ["Haben Sie den Kassenbon noch?", "У Вас ще є чек?"], ["Kann ich die Jacke zurückgeben?", "Можна повернути куртку?"], ["Der Reißverschluss ist kaputt.", "Блискавка зламалася."], ["Haben Sie das auch eine Nummer größer?", "У Вас є це на розмір більше?"]],
      tips: ["`zu klein / zu groß` — замалий / завеликий; `zu eng / zu weit` — тісний / завільний; `eine Nummer kleiner` — на розмір менше."],
    },
  ],
  phrases: [
    { t: "У магазині одягу", list: [["Kann ich das anprobieren?", "Можна це приміряти?"], ["Wo sind die Umkleidekabinen?", "Де примірочні?"], ["Haben Sie die Jacke auch in Schwarz?", "У Вас є ця куртка в чорному кольорі?"], ["Die Hose ist mir zu eng.", "Штани мені тісні."], ["Ich nehme den grauen Pullover.", "Я візьму сірий светр."]] },
    { t: "Компліменти й думка", list: [["Das steht dir super!", "Тобі це дуже личить!"], ["Die Farbe passt gut zu deinen Augen.", "Колір пасує до твоїх очей."], ["Mir gefällt das karierte Hemd besser.", "Мені більше подобається сорочка в клітинку."], ["Ist das nicht ein bisschen zu bunt?", "Чи це не трохи заяскраво?"]] },
    { t: "Обмін", list: [["Ich möchte das umtauschen.", "Я хочу це обміняти."], ["Hier ist der Kassenbon.", "Ось чек."], ["Kann ich mein Geld zurückbekommen?", "Можна отримати гроші назад?"], ["Bekomme ich einen Gutschein?", "Я отримаю ваучер?"]] },
  ],
  dialog: {
    t: "Зимове пальто",
    lines: [
      ["Verkäufer", "Guten Tag! Kann ich Ihnen helfen?", "Добрий день! Вам допомогти?"],
      ["{Taras|Lessja}", "Ja, gern. Ich suche einen warmen Mantel für den Winter.", "Так, будь ласка. Я шукаю тепле пальто на зиму."],
      ["Verkäufer", "Wie gefällt Ihnen der dunkelblaue Mantel hier? Er ist aus Wolle.", "Як Вам оце темно-синє пальто? Воно вовняне."],
      ["{Taras|Lessja}", "Er ist schön, aber ich möchte lieber einen braunen. Haben Sie den auch in Braun?", "Гарне, але мені більше до вподоби коричневе. У Вас є таке коричневого кольору?"],
      ["Verkäufer", "Ja, natürlich. Welche Größe haben Sie?", "Так, звісно. Який у Вас розмір?"],
      ["{Taras|Lessja}", "{Größe zweiundfünfzig, glaube ich.|Größe achtunddreißig, glaube ich.}", "{П’ятдесят другий, здається.|Тридцять восьмий, здається.}"],
      ["Anna", "Oh, der braune Mantel steht dir super! Und er passt perfekt.", "О, коричневе пальто тобі дуже личить! І сидить ідеально."],
      ["{Taras|Lessja}", "{Danke! Jetzt brauche ich nur noch eine warme Mütze. Zu Hause hatte ich eine hohe Fellmütze.|Danke! Jetzt brauche ich nur noch einen warmen Schal, vielleicht einen roten.}", "{Дякую! Тепер мені потрібна ще тільки тепла шапка. Удома в мене була висока смушева шапка.|Дякую! Тепер мені потрібен ще тільки теплий шарф, може, червоний.}"],
      ["Anna", "{Eine hohe Fellmütze? Mit der erkennt dich in Xanten jeder!|Ein roter Schal zu dem braunen Mantel? Das sieht bestimmt toll aus!}", "{Висока смушева шапка? У ній тебе в Ксантені всі впізнають!|Червоний шарф до коричневого пальто? Це точно буде чудово!}"],
      ["Verkäufer", "Mützen und Schals finden Sie dort hinten, neben dem großen Spiegel.", "Шапки й шарфи — он там, позаду, біля великого дзеркала."],
      ["{Taras|Lessja}", "Danke. Und kann ich den Mantel später noch umtauschen?", "Дякую. А пальто можна буде потім обміняти?"],
      ["Verkäufer", "Ja, innerhalb von vierzehn Tagen, mit dem Kassenbon.", "Так, протягом чотирнадцяти днів, з чеком."],
    ],
  },
  tasks: [
    { t: "gap", q: "Der ___ Mantel ist schön. (warm)", a: ["warme"], why: "Після der у називному — -e." },
    { t: "gap", q: "Ich nehme den ___ Pullover. (grau)", a: ["grauen"], why: "den (Akkusativ, m) — -en." },
    { t: "gap", q: "Das ist ein ___ Hemd. (schön)", a: ["schönes"], why: "ein + das: прикметник показує рід — -es." },
    { t: "gap", q: "Ich suche einen ___ Schal. (rot)", a: ["roten"] },
    { t: "gap", q: "Sie trägt eine ___ Brille. (rund)", a: ["runde"] },
    { t: "gap", q: "Wer ist der Mann mit dem ___ Bart? (grau)", a: ["grauen"], why: "Dativ — завжди -en." },
    { t: "gap", q: "Mein ___ Mantel ist aus Wolle. (neu)", a: ["neuer"], why: "mein + der: -er." },
    { t: "gap", q: "Er hat ___ Haare. (kurz)", a: ["kurze"] },
    { t: "gap", q: "Wie ___ dein Bruder aus? (aussehen)", a: ["sieht"] },
    { t: "mc", q: "Як правильно?", o: ["der warm Mantel", "der warme Mantel", "der warmer Mantel"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Der Mantel ist warme.", "Der Mantel ist warm.", "Der Mantel ist warmer."], a: 1, why: "Після sein прикметник без закінчення." },
    { t: "mc", q: "Яке закінчення? mit einer klein__ Tasche", o: ["-e", "-en", "-er"], a: 1 },
    { t: "mc", q: "Що означає «umtauschen»?", o: ["обміняти", "приміряти", "замовити"], a: 0 },
    { t: "mc", q: "Скільки днів є, щоб повернути покупку з інтернету?", o: ["3", "14", "60"], a: 1 },
  ],
};
