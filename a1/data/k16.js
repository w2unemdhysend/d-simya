// Розділ 16. Одяг і покупки. Граматика — як у розділі 16 Die neue Linie 1, тема наша.
export default {
  n: 16, part: "A1.2", title: "Одяг і покупки", book: null,
  goals: [
    "купити одяг: розмір, колір, примірка",
    "запитати «який?» і показати «цей»",
    "сказати, для кого річ (für + Akkusativ)",
    "вживати alles, etwas, nichts",
    "повернути або обміняти покупку",
  ],
  grammar: [
    {
      id: "welchDies", t: "welcher? і dieser", cat: "pron",
      text: [
        "**welcher / welche / welches?** — «який? котрий?» (з кількох). **dieser / diese / dieses** — «цей». Обидва змінюються **як означений артикль**: закінчення ті самі, що в `der/die/das` (`der → dieser`, `den → diesen`, `dem → diesem`).",
        "Відповідь на `Welcher?` — часто з `der/die/das` як займенником: `Welcher Pullover? – Der hier.` / `Dieser.`",
      ],
      tables: [
        { head: ["", "der", "die", "das", "множина"], rows: [["Nominativ", "welcher / dieser", "welche / diese", "welches / dieses", "welche / diese"], ["Akkusativ", "welch**en** / dies**en**", "welche / diese", "welches / dieses", "welche / diese"], ["Dativ", "welchem / diesem", "welcher / dieser", "welchem / diesem", "welchen / diesen"]] },
      ],
      ex: [["Welche Größe haben Sie? – Größe M.", "Який у Вас розмір? – M."], ["Welcher Mantel gefällt dir? – Dieser hier.", "Яке пальто тобі подобається? – Оце."], ["Ich nehme diesen Pullover.", "Я візьму цей светр."], ["Welche Farbe möchten Sie? – Blau.", "Який колір Ви бажаєте? – Синій."], ["In diesem Geschäft ist alles teuer.", "У цій крамниці все дороге."]],
      warn: ["`Ich nehme dieser Pullover` — помилка: прямий додаток чоловічого роду → `diesen`."],
    },
    {
      id: "fuer", t: "für + Akkusativ", cat: "prep",
      text: [
        "**für** (для; за) завжди вимагає **Akkusativ**: `für meinen Vater`, `für dich`, `für die Party`.",
        "Інші прийменники A1 з Akkusativ, які варто знати: **ohne** (без) і **durch** (через, крізь): `ohne Zucker`, `durch den Park`.",
      ],
      tables: [
        { head: ["", "der", "die", "das", "займенники"], rows: [["für", "für den / meinen Bruder", "für die / meine Mutter", "für das / mein Kind", "für mich, dich, ihn, sie, uns, euch, Sie"]] },
      ],
      ex: [["Das Geschenk ist für meinen Vater.", "Подарунок для мого тата."], ["Ist das für mich? – Ja, für dich!", "Це для мене? – Так, для тебе!"], ["Ich suche eine Jacke für den Winter.", "Я шукаю куртку на зиму."], ["Danke für die Hilfe!", "Дякую за допомогу!"], ["Einen Kaffee ohne Zucker, bitte.", "Каву без цукру, будь ласка."]],
      warn: ["`für mir`, `für meinem Vater` — помилки: `für` + Akkusativ → `für mich`, `für meinen Vater`."],
    },
    {
      id: "allesEtwas", t: "alles, etwas, nichts", cat: "pron",
      text: [
        "**alles** — усе, **etwas** — щось (у розмові часто просто `was`), **nichts** — нічого. Вони не змінюються.",
        "`nichts` уже містить заперечення, тож друге не потрібне: `Ich kaufe nichts.` (а не «Ich kaufe nicht nichts»). В українській подвійне заперечення («нічого не купую») — норма, у німецькій — помилка.",
        "`etwas` має ще значення «трохи»: `etwas teurer` — трохи дорожче.",
      ],
      ex: [["Ist das alles? – Ja, das ist alles.", "Це все? – Так, це все."], ["Möchtest du etwas trinken?", "Хочеш щось випити?"], ["Ich habe nichts gefunden.", "Я нічого не {знайшов|знайшла}."], ["Hast du etwas gekauft? – Nein, nichts.", "Ти щось купив? – Ні, нічого."], ["Alles klar!", "Усе зрозуміло!"]],
      warn: ["`Ich habe nicht nichts gekauft` — подвійне заперечення змінює зміст на протилежний. Кажи `Ich habe nichts gekauft.`"],
    },
    {
      id: "kleidung", t: "Одяг: пасує, личить, подобається", cat: "rede",
      text: [
        "Три різні дієслова, всі з **Dativ**: **passen** — пасує за розміром (`Die Hose passt mir.`), **stehen** — личить (`Die Farbe steht dir gut.`), **gefallen** — подобається (`Der Mantel gefällt mir.`).",
        "`zu` + прикметник = «занадто»: `zu groß` (завеликий), `zu eng` (затісний), `zu teuer` (задорогий).",
        "Розміри одягу — `S, M, L, XL` або числа (`Größe 38`); взуття — `Schuhgröße 42`.",
        "Повернути покупку: з чеком (`Kassenbon`) у багатьох магазинах можна обміняти річ (`umtauschen`) протягом певного часу, але це **добра воля магазину**, а не обов’язок для речей без дефекту. Питай на касі: `Kann ich das umtauschen?`",
      ],
      ex: [["Kann ich die Hose anprobieren? – Ja, die Umkleidekabine ist dort.", "Можна приміряти штани? – Так, примірочна там."], ["Die Jacke ist zu klein. Haben Sie sie eine Nummer größer?", "Куртка замала. У Вас є на розмір більша?"], ["Der Pullover steht dir sehr gut!", "Светр тобі дуже личить!"], ["Ich möchte das umtauschen. Hier ist der Kassenbon.", "Я {хотів би|хотіла б} це обміняти. Ось чек."]],
      warn: ["`Die Hose passt zu mir` — помилка; за розміром: `Die Hose passt mir.` (`passen zu` = пасує до чогось: `Die Schuhe passen zur Hose.`)"],
    },
    {
      id: "a1review", t: "Підсумок A1: відмінки й артиклі однією таблицею", cat: "noun",
      text: [
        "Уся система артиклів рівня A1 в одній таблиці. Закінчення однакові для `der/dieser/welcher` і для `ein/kein/mein`, крім трьох місць (виділено).",
        "Простий спосіб запам’ятати: **Akkusativ відрізняється від Nominativ лише в чоловічому роді**, а в **Dativ** — у всіх: -em, -er, -em, -en.",
      ],
      tables: [
        { cap: "Означений артикль", head: ["", "der", "die", "das", "множина"], rows: [["Nom.", "der", "die", "das", "die"], ["Akk.", "den", "die", "das", "die"], ["Dat.", "dem", "der", "dem", "den (+n)"]] },
        { cap: "ein / kein / mein", head: ["", "der", "die", "das", "множина"], rows: [["Nom.", "**ein** / kein / mein", "eine", "**ein**", "keine / meine"], ["Akk.", "einen", "eine", "**ein**", "keine / meine"], ["Dat.", "einem", "einer", "einem", "keinen / meinen (+n)"]] },
        { cap: "Займенники", head: ["Nom.", "Akk.", "Dat."], rows: [["ich", "mich", "mir"], ["du", "dich", "dir"], ["er", "ihn", "ihm"], ["sie", "sie", "ihr"], ["es", "es", "ihm"], ["wir", "uns", "uns"], ["ihr", "euch", "euch"], ["sie / Sie", "sie / Sie", "ihnen / Ihnen"]] },
        { cap: "Прийменники", head: ["Akkusativ", "Dativ", "Wo? Dativ / Wohin? Akkusativ"], rows: [["für, ohne, durch", "aus, bei, mit, nach, seit, von, zu, gegenüber", "in, an, auf, neben, vor, hinter, über, unter, zwischen"]] },
      ],
      ex: [["Ich kaufe einen Pullover für meinen Bruder.", "Я купую светр для свого брата."], ["Mit dem Bus fahre ich zum Kaufhaus.", "Автобусом я їду до універмагу."], ["Die Jacke im Schaufenster gefällt mir.", "Мені подобається куртка у вітрині."]],
    },
  ],
  phrases: [
    { t: "У магазині одягу", list: [["Ich suche eine Jacke.", "Я шукаю куртку."], ["Haben Sie das auch in Blau?", "У Вас є це ще й синього кольору?"], ["Kann ich das anprobieren?", "Можна це приміряти?"], ["Welche Größe haben Sie?", "Який у Вас розмір?"], ["Das ist zu groß. Haben Sie eine Nummer kleiner?", "Це завелике. Є на розмір менше?"]] },
    { t: "Рішення", list: [["Die Hose passt mir gut.", "Штани мені якраз."], ["Ich nehme diese hier.", "Я візьму оці."], ["Das gefällt mir nicht so.", "Мені це не дуже подобається."], ["Ich überlege noch.", "Я ще подумаю."]] },
    { t: "Каса й обмін", list: [["Kann ich mit Karte zahlen?", "Можна карткою?"], ["Kann ich das umtauschen?", "Можна це обміняти?"], ["Hier ist der Kassenbon.", "Ось чек."]] },
  ],
  dialog: {
    t: "Куртка на зиму",
    lines: [
      ["Verkäufer", "Guten Tag! Kann ich Ihnen helfen?", "Добрий день! Вам допомогти?"],
      ["{Taras|Lessja}", "Ja, gern. Ich suche eine Jacke für den Winter.", "Так, будь ласка. Я шукаю куртку на зиму."],
      ["Verkäufer", "Welche Größe haben Sie?", "Який у Вас розмір?"],
      ["{Taras|Lessja}", "Größe M, glaube ich.", "M, здається."],
      ["Verkäufer", "Wie finden Sie diese hier? Die gibt es in Schwarz und in Grün.", "Як Вам ось ця? Вона є чорна й зелена."],
      ["{Taras|Lessja}", "Die grüne gefällt mir. Kann ich sie anprobieren?", "Зелена мені подобається. Можна її приміряти?"],
      ["Verkäufer", "Natürlich. Die Umkleidekabine ist dort hinten.", "Звісно. Примірочна он там, позаду."],
      ["{Taras|Lessja}", "Hm, sie ist etwas zu eng. Haben Sie sie eine Nummer größer?", "Хм, трохи тісна. У Вас є на розмір більша?"],
      ["Verkäufer", "Moment … Ja, hier, in L.", "Хвилинку … Так, ось, L."],
      ["{Taras|Lessja}", "Die passt! Ich nehme sie. Kann ich mit Karte zahlen?", "Пасує! Беру. Можна карткою?"],
    ],
  },
  tasks: [
    { t: "gap", q: "___ Größe haben Sie? (welch-)", a: ["Welche"], why: "die Größe → welche." },
    { t: "gap", q: "Ich nehme ___ Pullover. (dies-)", a: ["diesen"], why: "Akkusativ чоловічого роду: diesen." },
    { t: "gap", q: "Das Geschenk ist für ___ Vater. (мій)", a: ["meinen"], why: "für + Akkusativ." },
    { t: "gap", q: "Ist das für ___? (я)", a: ["mich"] },
    { t: "mc", q: "Як сказати «Я нічого не {купив|купила}»?", o: ["Ich habe nicht nichts gekauft.", "Ich habe nichts gekauft.", "Ich habe kein nichts gekauft."], a: 1 },
    { t: "mc", q: "Möchtest du ___ trinken?", o: ["alles", "etwas", "nichts"], a: 1 },
    { t: "mc", q: "Штани пасують за розміром:", o: ["Die Hose passt mir.", "Die Hose passt zu mir.", "Die Hose steht mich."], a: 0 },
    { t: "mc", q: "«Die Farbe steht dir gut» означає:", o: ["Колір тобі личить.", "Колір стоїть добре.", "Ти любиш цей колір."], a: 0 },
    { t: "mc", q: "Welcher Mantel gefällt dir? – ___ hier.", o: ["Dieser", "Diesen", "Diese"], a: 0, why: "Nominativ чоловічого роду." },
    { t: "mc", q: "Mit ___ Bus fährst du? (welch-)", o: ["welcher", "welchem", "welchen"], a: 1, why: "mit + Dativ: welchem." },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich fahre mit den Bus.", "Ich fahre mit dem Bus.", "Ich fahre mit der Bus."], a: 1 },
    { t: "mc", q: "Die Jacke ist ___ eng (затісна).", o: ["sehr", "zu", "zum"], a: 1 },
  ],
};
