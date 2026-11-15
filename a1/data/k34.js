// Розділ 34 (B1). Співбесіда: bevor, während, sobald, solange; прикметник як іменник (der Angestellte, etwas Neues);
// питання й відповіді на співбесіді; якості й уміння.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 34, part: "B1.1", title: "Співбесіда", book: null,
  goals: [
    "казати, коли саме: bevor, während, sobald, solange",
    "уживати іменники-прикметники: der Angestellte, ein Bekannter, etwas Neues",
    "відповідати на типові питання співбесіди й ставити свої",
    "описувати свої якості з прикладом: zuverlässig, belastbar, teamfähig",
  ],
  grammar: [
    {
      id: "temporalB1", t: "bevor, während, sobald, solange: коли саме?", cat: "satz",
      text: [
        "Усі ці сполучники відкривають **підрядне речення**: дієслово в кінці. Якщо підрядне стоїть першим, головне починається з дієслова: `Bevor ich gehe, **rufe** ich an.`",
        "`bevor` — «перед тим як»: `Bevor ich unterschreibe, lese ich den Vertrag genau.`",
        "`während` — «поки, у той час як» (дві дії одночасно): `Während ich koche, höre ich Radio.`",
        "`sobald` — «щойно, як тільки»: `Sobald ich die Zusage habe, sage ich dir Bescheid.`",
        "`solange` — «доки, поки» (стільки, скільки триває інше): `Solange du Fieber hast, bleibst du zu Hause.`",
      ],
      tables: [
        { head: ["Сполучник", "Значення", "Приклад"], rows: [["bevor", "перед тим як", "Bevor ich unterschreibe, frage ich nach."], ["während", "поки, у той час як", "Während er telefoniert, wartet sie."], ["sobald", "щойно, як тільки", "Sobald ich Zeit habe, rufe ich an."], ["solange", "доки, поки", "Solange es regnet, bleiben wir drin."], ["seit(dem)", "відтоді як (розділ 26)", "Seitdem ich arbeite, habe ich wenig Zeit."], ["bis", "аж поки (розділ 26)", "Warte, bis ich komme."]] },
      ],
      ex: [["Bevor ich zum Gespräch gehe, lese ich die Anzeige noch einmal.", "Перш ніж іти на співбесіду, я ще раз читаю оголошення."], ["Während die Kinder in der Schule sind, lerne ich Deutsch.", "Поки діти в школі, я вчу німецьку."], ["Sobald ich eine Antwort bekomme, sage ich dir Bescheid.", "Щойно отримаю відповідь, дам тобі знати."], ["Solange ich keine Arbeit habe, mache ich einen Kurs.", "Поки в мене немає роботи, я ходжу на курс."]],
      warn: ["`während` буває й прийменником з Genitiv: `während der Arbeit` — «під час роботи» (розділ 35). Тоді після нього іменник, а не речення."],
    },
    {
      id: "adjNomen", t: "Прикметник як іменник: der Angestellte, etwas Neues", cat: "adj",
      text: [
        "Деякі іменники — це прикметники з великої літери: `der/die Angestellte` (службовець, службовиця), `der/die Deutsche`, `der/die Bekannte` (знайомий), `der/die Erwachsene`, `der/die Verwandte` (родич), `der/die Jugendliche`, `der/die Arbeitslose`.",
        "Вони **змінюються як прикметники** (розділи 21–22): після `der/die` — `-e`, після `ein` — `-er` (чоловік), після `eine` — `-e` (жінка); у Dativ і множині — `-en`.",
        "Так само після `etwas`, `nichts`, `viel`: `etwas Neues` (щось нове), `nichts Besonderes` (нічого особливого), `viel Gutes` (багато доброго).",
      ],
      tables: [
        { head: ["", "з der / die", "з ein / eine", "множина"], rows: [["чоловік", "der Angestellte", "ein Angestellter", "die Angestellten"], ["жінка", "die Angestellte", "eine Angestellte", "die Angestellten"], ["Dativ", "dem / der Angestellten", "einem / einer Angestellten", "den Angestellten"], ["без артикля", "—", "—", "viele Angestellte"]] },
      ],
      ex: [["Mein Bruder ist Angestellter bei der Post.", "Мій брат — службовець на пошті."], ["Sie ist Deutsche, ihr Mann ist Ukrainer.", "Вона німкеня, її чоловік — українець."], ["Ein Bekannter hat mir die Stelle empfohlen.", "Один знайомий порадив мені цю вакансію."], ["Gibt es etwas Neues? – Nein, nichts Besonderes.", "Є щось нове? – Ні, нічого особливого."]],
      warn: ["`ein Angestellte` — помилка, якщо це чоловік: `ein Angestellter`. А `mit einem Angestellter` — теж ні: у Dativ `-en`: `mit einem Angestellten`."],
    },
    {
      id: "vorstellung", t: "Співбесіда: питання й відповіді", cat: "rede",
      text: [
        "Типові питання: `Erzählen Sie etwas über sich.` `Warum möchten Sie bei uns arbeiten?` `Was sind Ihre Stärken und Schwächen?` `Wann können Sie anfangen?` `Haben Sie noch Fragen?`",
        "Прийди на 5–10 хвилин раніше. Відповідай коротко й з прикладом: не просто «я надійний», а що саме ти робив. Про перерву в роботі кажи чесно: `In dieser Zeit habe ich Deutsch gelernt.`",
        "Постав і свої питання — це показує інтерес: `Wie sieht ein typischer Arbeitstag aus?` `Gibt es eine Einarbeitung?` `Wann kann ich mit einer Antwort rechnen?`",
        "Питання про вагітність, плани на дітей, релігію чи партію на співбесіді **недозволені** (`unzulässig`) — відповідати на них не треба.",
      ],
      tables: [
        { cap: "Питання → початок відповіді", head: ["Питання", "Відповідь"], rows: [["Erzählen Sie etwas über sich.", "Ich komme aus … und lebe seit … in …"], ["Warum möchten Sie bei uns arbeiten?", "Ihre Firma interessiert mich, weil …"], ["Was sind Ihre Stärken?", "Ich arbeite gern im Team und bin pünktlich."], ["Und Ihre Schwächen?", "Manchmal bin ich ungeduldig, aber ich arbeite daran."], ["Wann können Sie anfangen?", "Ab dem Ersten des nächsten Monats."]] },
      ],
      ex: [["Ich lebe seit drei Jahren in Deutschland und mache zurzeit einen B1-Kurs.", "Я живу в Німеччині три роки й зараз навчаюся на курсі B1."], ["Ihre Firma interessiert mich, weil Sie mit Menschen aus vielen Ländern arbeiten.", "Ваша фірма мене цікавить, бо ви працюєте з людьми з багатьох країн."], ["Gibt es in den ersten Wochen eine Einarbeitung?", "Чи є в перші тижні введення в роботу?"]],
    },
    {
      id: "staerken", t: "Якості й уміння: zuverlässig, belastbar, teamfähig", cat: "rede",
      text: [
        "Якості: `zuverlässig` (надійний), `pünktlich`, `flexibel`, `belastbar` (витримує навантаження), `teamfähig` (уміє працювати в команді), `selbstständig` (самостійний), `sorgfältig` (ретельний), `geduldig` (терплячий), `hilfsbereit` (готовий допомогти), `kreativ`.",
        "Знання й уміння: `gute Deutschkenntnisse (B1)`, `Kenntnisse in Word und Excel`, `Führerschein Klasse B`, `Erfahrung im Verkauf` (досвід у продажах).",
        "Говори з прикладом — так звучить переконливо: `Ich bin belastbar: In der Ukraine habe ich zwei Jahre im Schichtdienst gearbeitet.`",
      ],
      ex: [["Ich arbeite gern im Team, aber ich kann auch selbstständig arbeiten.", "Я люблю працювати в команді, але вмію й самостійно."], ["Ich spreche Ukrainisch und Deutsch und ein bisschen Englisch.", "Я розмовляю українською й німецькою і трохи англійською."], ["Ich bin sehr sorgfältig und mache selten Fehler.", "{Я дуже ретельний і рідко помиляюся.|Я дуже ретельна й рідко помиляюся.}"]],
      tips: ["Підготуй три якості, кожну з коротким прикладом із життя, — і перекажи їх уголос кілька разів перед співбесідою."],
    },
  ],
  phrases: [
    { t: "Початок і кінець", list: [["Guten Tag, ich habe um zehn Uhr ein Vorstellungsgespräch.", "Добрий день, о десятій у мене співбесіда."], ["Vielen Dank für die Einladung.", "Дякую за запрошення."], ["Vielen Dank für das Gespräch.", "Дякую за розмову."], ["Wann kann ich mit einer Antwort rechnen?", "Коли можна чекати на відповідь?"]] },
    { t: "Про себе", list: [["Ich lebe seit drei Jahren in Deutschland.", "Я живу в Німеччині вже три роки."], ["Zurzeit mache ich einen B1-Kurs.", "Зараз я навчаюся на курсі B1."], ["Ich bin zuverlässig und arbeite gern im Team.", "{Я надійний і люблю працювати в команді.|Я надійна й люблю працювати в команді.}"]] },
    { t: "Якщо не зрозумів", list: [["Entschuldigung, könnten Sie die Frage wiederholen?", "Перепрошую, не могли б Ви повторити питання?"], ["Meinen Sie …?", "Ви маєте на увазі …?"], ["Darf ich kurz überlegen?", "Можна мені хвилинку подумати?"]] },
  ],
  dialog: {
    t: "Співбесіда",
    lines: [
      ["Personalleiter", "Guten Tag, {Herr Schewtschenko|Frau Ukrajinka}. Schön, dass Sie da sind. Erzählen Sie doch bitte etwas über sich.", "Добрий день, {пане Шевченку|пані Українко}. Добре, що Ви прийшли. Розкажіть, будь ласка, трохи про себе."],
      ["{Taras|Lessja}", "{Gern. Ich komme aus der Ukraine und bin Maler. Ich habe an der Kunstakademie studiert und viele Jahre gemalt und unterrichtet. Seit drei Jahren lebe ich in Xanten.|Gern. Ich komme aus der Ukraine und übersetze aus dem Deutschen und dem Polnischen ins Ukrainische. Seit drei Jahren lebe ich in Xanten.}", "{Охоче. Я з України, художник. Навчався в Академії мистецтв і багато років малював і викладав. Уже три роки живу в Ксантені.|Охоче. Я з України, перекладаю з німецької та польської українською. Уже три роки живу в Ксантені.}"],
      ["Personalleiter", "{Warum möchten Sie in unserer Agentur arbeiten?|Warum möchten Sie in unserem Büro arbeiten?}", "{Чому Ви хочете працювати в нашій агенції?|Чому Ви хочете працювати в нашому бюро?}"],
      ["{Taras|Lessja}", "{Ich zeichne und male seit vielen Jahren. Bevor ich nach Deutschland kam, gestaltete ich auch Bücher und Plakate. Das möchte ich hier weitermachen.|Ich liebe Sprachen. Bevor ich nach Deutschland kam, übersetzte ich Bücher und Briefe. Hier möchte ich Dokumente und Texte für Firmen übersetzen.}", "{Я багато років малюю. Перш ніж приїхати до Німеччини, я також оформлював книжки й плакати. Хочу продовжувати це тут.|Я люблю мови. Перш ніж приїхати до Німеччини, я перекладала книжки й листи. Тут я хочу перекладати документи й тексти для фірм.}"],
      ["Personalleiter", "Was sind Ihre Stärken?", "Які Ваші сильні сторони?"],
      ["{Taras|Lessja}", "{Ich bin geduldig und kreativ. Sobald ein Kunde eine Idee hat, mache ich gleich ein paar Skizzen.|Ich bin sehr sorgfältig. Bevor ich einen Text abgebe, lese ich ihn immer zweimal.}", "{Я терплячий і творчий. Щойно клієнт має ідею, я одразу роблю кілька ескізів.|Я дуже ретельна. Перш ніж віддати текст, я завжди перечитую його двічі.}"],
      ["Personalleiter", "Und Ihre Schwächen?", "А Ваші слабкі сторони?"],
      ["{Taras|Lessja}", "Mein Deutsch ist noch nicht perfekt. Aber ich lerne jeden Tag, und im Frühling mache ich die B1-Prüfung.", "Моя німецька ще не досконала. Але я вчуся щодня, а навесні складатиму іспит B1."],
      ["Personalleiter", "Die Stelle ist in Teilzeit, 20 Stunden pro Woche. Passt Ihnen das?", "Це неповний день, 20 годин на тиждень. Вам це підходить?"],
      ["{Taras|Lessja}", "Ja, das passt sehr gut. Darf ich auch etwas fragen? Wie sieht ein typischer Arbeitstag aus?", "Так, дуже підходить. Можна і мені дещо запитати? Який вигляд має звичайний робочий день?"],
      ["Personalleiter", "Sie bekommen die Aufträge per E-Mail und arbeiten meistens am Computer. In den ersten zwei Wochen hilft Ihnen eine Kollegin.", "Ви отримуєте замовлення електронною поштою й працюєте здебільшого за комп’ютером. Перші два тижні Вам допомагатиме колега."],
      ["{Taras|Lessja}", "Das klingt gut. Wann kann ich mit einer Antwort rechnen?", "Звучить добре. Коли можна чекати на відповідь?"],
      ["Personalleiter", "Spätestens nächste Woche. Vielen Dank für das Gespräch!", "Найпізніше наступного тижня. Дякую за розмову!"],
      ["{Taras|Lessja}", "Ich danke Ihnen. Auf Wiedersehen!", "І Вам дякую. До побачення!"],
    ],
  },
  tasks: [
    { t: "gap", q: "___ ich unterschreibe, lese ich den Vertrag genau. (перед тим як)", a: ["Bevor", "bevor"] },
    { t: "gap", q: "___ ich koche, höre ich Radio. (у той час як)", a: ["Während", "während"] },
    { t: "gap", q: "___ ich die Zusage habe, rufe ich dich an. (щойно)", a: ["Sobald", "sobald"] },
    { t: "gap", q: "Mein Bruder ist ___ bei der Post. (службовець)", a: ["Angestellter"] },
    { t: "gap", q: "Ein ___ hat mir die Stelle empfohlen. (знайомий)", a: ["Bekannter"] },
    { t: "gap", q: "Was sind Ihre ___? – Ich bin zuverlässig und pünktlich.", a: ["Stärken"] },
    { t: "gap", q: "Wann kann ich mit einer Antwort ___?", a: ["rechnen"] },
    { t: "gap", q: "Wir haben am Wochenende nichts ___ gemacht. (особливого)", a: ["Besonderes"] },
    { t: "mc", q: "Як правильно?", o: ["Bevor ich gehe, ich rufe an.", "Bevor ich gehe, rufe ich an.", "Bevor gehe ich, rufe ich an."], a: 1 },
    { t: "mc", q: "Що означає `belastbar`?", o: ["надійний", "витримує навантаження", "уміє працювати в команді"], a: 1 },
    { t: "mc", q: "На співбесіді питають: `Planen Sie Kinder?` Що правда?", o: ["Це недозволене питання — відповідати не треба", "Треба відповісти чесно, інакше не візьмуть", "Так питають усіх, це звичайне питання"], a: 0 },
    { t: "mc", q: "Питання на співбесіді незрозуміле. Що краще сказати?", o: ["Was?", "Könnten Sie die Frage bitte wiederholen?", "Ich verstehe nichts, tschüss."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["mit einem Angestellte", "mit einer Angestellter", "mit einem Angestellten"], a: 2 },
    { t: "mc", q: "`Solange du Fieber hast, bleibst du zu Hause.` — `solange` означає…", o: ["доки", "щойно", "перед тим як"], a: 0 },
    { t: "mc", q: "Співбесіда о 10:00. Коли краще прийти?", o: ["за 5–10 хвилин до початку", "рівно о 10:00", "на 15 хвилин пізніше"], a: 0 },
  ],
};
