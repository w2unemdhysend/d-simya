// Розділ 10. Подорожі й біографія (Perfekt з sein). Граматика — як у розділі 10 Die neue Linie 1, тема наша.
export default {
  n: 10, part: "A1.2", title: "Подорожі й біографія", book: null,
  goals: [
    "розповісти про подорож: куди їхав, де пересідав, коли приїхав",
    "коротко розповісти свою біографію з роками",
    "вибирати між haben і sein у Perfekt",
    "утворювати Partizip відокремлюваних дієслів і дієслів на -ieren",
  ],
  grammar: [
    {
      id: "perfSein", t: "Perfekt з sein", cat: "verb",
      text: [
        "Деякі дієслова утворюють Perfekt з **sein**, а не з haben. Це дієслова **руху з місця на місце** (`gehen, fahren, fliegen, kommen, laufen`) і **зміни стану** (`aufstehen, aufwachen, werden, einschlafen`). Також `sein`, `bleiben` і `passieren`.",
        "Перевірка: дія переносить тебе кудись або змінює твій стан і **не має прямого додатка** (кого? що?) → `sein`.",
      ],
      tables: [
        { head: ["Інфінітив", "Perfekt"], rows: [["gehen", "ist gegangen"], ["fahren", "ist gefahren"], ["fliegen", "ist geflogen"], ["kommen", "ist gekommen"], ["laufen", "ist gelaufen"], ["ankommen", "ist angekommen"], ["umsteigen", "ist umgestiegen"], ["aufstehen", "ist aufgestanden"], ["werden", "ist geworden"], ["bleiben", "ist geblieben"], ["sein", "ist gewesen"], ["passieren", "ist passiert"], ["umziehen", "ist umgezogen"]] },
        { cap: "Рамка", head: ["1", "2 (sein)", "середина", "кінець"], rows: [["Ich", "bin", "mit dem Zug nach Köln", "gefahren."], ["Wann", "bist", "du nach Deutschland", "gekommen?"], ["Wir", "sind", "in Duisburg", "umgestiegen."]] },
      ],
      ex: [["Ich bin um sechs Uhr aufgestanden.", "Я встав о шостій."], ["Wir sind im September nach Deutschland gekommen.", "Ми приїхали до Німеччини у вересні."], ["Der Zug ist pünktlich angekommen.", "Потяг прибув вчасно."], ["Was ist passiert?", "Що сталося?"], ["Sie ist zwei Wochen in Polen geblieben.", "Вона залишилася в Польщі на два тижні."]],
      tips: ["`fahren` з прямим додатком (кого/що везти) — з haben: `Ich habe das Auto in die Werkstatt gefahren.` Але без нього — `ich bin gefahren`. На рівні A1 майже завжди `bin gefahren`."],
      warn: ["`Ich habe nach Köln gefahren` — помилка: рух → `Ich bin nach Köln gefahren.`", "Про минуле `sein` у розмові частіше кажуть `ich war`, а не `ich bin gewesen` (розділ 7). Обидва правильні."],
    },
    {
      id: "perfTrenn", t: "Perfekt відокремлюваних дієслів", cat: "verb",
      text: [
        "У відокремлюваних дієсловах `ge-` стає **між приставкою і основою**, і все пишеться разом: `einkaufen → eingekauft`, `anrufen → angerufen`, `aufstehen → aufgestanden`.",
      ],
      tables: [
        { head: ["Інфінітив", "Partizip II"], rows: [["einkaufen", "ein**ge**kauft"], ["anrufen", "an**ge**rufen"], ["aufräumen", "auf**ge**räumt"], ["fernsehen", "fern**ge**sehen"], ["abholen", "ab**ge**holt"], ["anfangen", "an**ge**fangen"], ["aufstehen", "auf**ge**standen"], ["einsteigen", "ein**ge**stiegen"], ["mitbringen", "mit**ge**bracht"]] },
      ],
      ex: [["Ich habe am Samstag eingekauft.", "У суботу я робив покупки."], ["Hast du deine Mutter angerufen?", "Ти подзвонив мамі?"], ["Wir haben die Wohnung aufgeräumt.", "Ми прибрали квартиру."], ["Der Kurs hat um neun angefangen.", "Курс почався о дев’ятій."]],
      warn: ["`geeinkauft` — помилка: `ge-` іде всередину: `eingekauft`."],
    },
    {
      id: "partOhneGe", t: "Partizip без ge-: -ieren, be-, ver-…", cat: "verb",
      text: [
        "Без `ge-` утворюють Partizip дві групи:",
        "1) дієслова на **-ieren**: `studieren → studiert`, `telefonieren → telefoniert`, `passieren → passiert`, `reparieren → repariert`;",
        "2) дієслова з **невідокремлюваною приставкою** `be-, ver-, er-, ent-, emp-, ge-, zer-`: `bezahlen → bezahlt`, `besuchen → besucht`, `verstehen → verstanden`, `erzählen → erzählt`, `vergessen → vergessen`, `bekommen → bekommen`.",
      ],
      tables: [
        { head: ["-ieren", "be-, ver-, er-…"], rows: [["studiert", "bezahlt"], ["telefoniert", "besucht"], ["fotografiert", "verstanden"], ["repariert", "erzählt"], ["probiert", "vergessen"], ["buchstabiert", "bekommen"]] },
      ],
      ex: [["Ich habe in Sumy Informatik studiert.", "Я вивчав інформатику в Сумах."], ["Hast du das verstanden?", "Ти це зрозумів?"], ["Wir haben schon bezahlt.", "Ми вже заплатили."], ["Er hat mir viel erzählt.", "Він мені багато розповів."]],
      warn: ["`gestudiert`, `gebezahlt`, `geverstanden` — помилки."],
    },
    {
      id: "jahre", t: "Роки", cat: "zeit",
      text: [
        "Роки до 2000 читають **сотнями**: 1999 = `neunzehnhundertneunundneunzig` (дев’ятнадцять сотень дев’яносто дев’ять). Від 2000 — **тисячами**: 2005 = `zweitausendfünf`, 2026 = `zweitausendsechsundzwanzig`.",
        "Рік кажуть **без прийменника** або з `im Jahr`: `2015 bin ich nach Kyjiw gezogen.` / `Im Jahr 2015…`. Варіант `in 2015` — англіцизм, у стандартній німецькій неправильний.",
      ],
      tables: [
        { head: ["Рік", "Як сказати"], rows: [["1989", "neunzehnhundertneunundachtzig"], ["2000", "zweitausend"], ["2005", "zweitausendfünf"], ["2014", "zweitausendvierzehn"], ["2026", "zweitausendsechsundzwanzig"]] },
      ],
      ex: [["Ich bin 2005 geboren.", "Я народився 2005 року."], ["2022 sind wir umgezogen.", "2022 року ми переїхали."], ["Im Jahr 2026 habe ich den Deutschkurs angefangen.", "У 2026 році я почав курс німецької."]],
      tips: ["У грі «Числа на слух» є режим «Роки»: послухай, як їх вимовляють."],
    },
    {
      id: "lebenslauf", t: "Біографія і подорож: розповідь", cat: "rede",
      text: [
        "Біографію розповідають у Perfekt, із роками на початку речень: `2005 bin ich in Sumy geboren. 2022 habe ich die Schule abgeschlossen. …`",
        "Тут саме вживати слова-зв’язки: `zuerst` (спочатку), `dann` (потім), `danach` (після того), `später` (пізніше), `zum Schluss` (наприкінці). Після них — дієслово, потім підмет.",
      ],
      ex: [["Zuerst bin ich nach Polen gefahren, dann nach Deutschland.", "Спочатку я поїхав до Польщі, потім до Німеччини."], ["In Duisburg bin ich umgestiegen.", "У Дуйсбурзі я пересів."], ["Danach habe ich ein Zimmer gesucht.", "Після того я шукав кімнату."], ["Zum Schluss sind wir nach Xanten gezogen.", "Наприкінці ми переїхали до Ксантена."]],
    },
  ],
  phrases: [
    { t: "Подорож", list: [["Wann fährt der Zug nach Düsseldorf?", "Коли потяг до Дюссельдорфа?"], ["Von welchem Gleis?", "З якої колії?"], ["Wo muss ich umsteigen?", "Де мені пересідати?"], ["Der Zug hat Verspätung.", "Потяг запізнюється."], ["Gute Reise!", "Щасливої дороги!"]] },
    { t: "Про себе", list: [["Ich bin 2005 in Sumy geboren.", "Я народився 2005 року в Сумах."], ["Ich habe Informatik studiert.", "Я вивчав інформатику."], ["Seit Oktober lerne ich Deutsch.", "З жовтня я вчу німецьку."], ["Ich bin im September nach Deutschland gekommen.", "Я приїхав до Німеччини у вересні."]] },
  ],
  dialog: {
    t: "Як ти доїхав?",
    lines: [
      ["Anna", "Wie war deine Reise nach Berlin?", "Як минула твоя поїздка до Берліна?"],
      ["Taras", "Lang! Ich bin um fünf Uhr aufgestanden und mit dem Bus nach Wesel gefahren.", "Довга! Я встав о п’ятій і поїхав автобусом до Везеля."],
      ["Anna", "Und dann?", "А потім?"],
      ["Taras", "In Wesel bin ich in den Zug eingestiegen. In Duisburg bin ich umgestiegen.", "У Везелі я сів на потяг. У Дуйсбурзі пересів."],
      ["Anna", "Ist der Zug pünktlich gekommen?", "Потяг прийшов вчасно?"],
      ["Taras", "Nein, er hatte vierzig Minuten Verspätung! Ich bin erst um zwölf in Berlin angekommen.", "Ні, він запізнився на сорок хвилин! Я приїхав до Берліна лише о дванадцятій."],
      ["Anna", "Oh je! Und was hast du in Berlin gemacht?", "Ой лишенько! А що ти робив у Берліні?"],
      ["Taras", "Ich habe meinen Cousin besucht, und wir haben die Stadt besichtigt.", "Я відвідав двоюрідного брата, і ми оглянули місто."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich ___ nach Köln gefahren. (sein/haben)", a: ["bin"], why: "Рух → sein." },
    { t: "gap", q: "Wir ___ in Duisburg umgestiegen.", a: ["sind"] },
    { t: "gap", q: "Er ___ das Buch gelesen.", a: ["hat"], why: "Не рух, є прямий додаток → haben." },
    { t: "gap", q: "Ich bin um sechs Uhr ___. (aufstehen)", a: ["aufgestanden"] },
    { t: "gap", q: "Wir haben am Samstag ___. (einkaufen)", a: ["eingekauft"] },
    { t: "gap", q: "Hast du Mama ___? (anrufen)", a: ["angerufen"] },
    { t: "gap", q: "Ich habe in Sumy Informatik ___. (studieren)", a: ["studiert"], why: "-ieren — без ge-." },
    { t: "gap", q: "Hast du das ___? (verstehen)", a: ["verstanden"], why: "ver- — без ge-." },
    { t: "mc", q: "Was ist ___?", o: ["passiert", "gepassiert", "passieret"], a: 0 },
    { t: "mc", q: "Як прочитати рік 1998?", o: ["eintausendneunhundertachtundneunzig", "neunzehnhundertachtundneunzig", "neunzehnachtundneunzig"], a: 1 },
    { t: "mc", q: "Як правильно сказати рік?", o: ["In 2022 bin ich umgezogen.", "2022 bin ich umgezogen.", "Am 2022 bin ich umgezogen."], a: 1 },
    { t: "mc", q: "Яке дієслово утворює Perfekt з sein?", o: ["kaufen", "bleiben", "lernen"], a: 1 },
  ],
};
