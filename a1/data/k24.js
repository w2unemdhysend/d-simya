// Розділ 24 (A2). Поїздка до Берліна: вищий і найвищий ступені (schneller als, so … wie, am schnellsten), куди й де
// (nach Berlin, in die Ukraine, ans Meer), на вокзалі (квиток, пересадка, Deutschlandticket), ночівля в готелі.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Леся Українка справді жила в Берліні
// в 1899 році й ходила там до Deutsches Theater; Тарас Шевченко подорожував Україною й малював пам’ятки.
export default {
  n: 24, part: "A2.1", title: "Поїздка до Берліна", book: null,
  goals: [
    "порівнювати: schneller als, so schnell wie, am schnellsten",
    "казати, куди їдеш і де ти: nach Berlin, in die Ukraine, ans Meer",
    "купувати квиток і розуміти табло на вокзалі",
    "бронювати номер у готелі",
  ],
  grammar: [
    {
      id: "komparativ", t: "Порівняння: schneller als, so schnell wie", cat: "adj",
      text: [
        "Вищий ступінь — прикметник + **-er**: `schnell → schneller`, `billig → billiger`. Порівнюємо з **als**: `Der ICE ist schneller als die Regionalbahn.`",
        "Однаково — **so … wie**: `Der Bus ist so langsam wie die Bahn.` Не однаково — `nicht so … wie`.",
        "Короткі слова часто отримують умлаут: `alt → älter`, `groß → größer`, `jung → jünger`, `warm → wärmer`, `kurz → kürzer`, `lang → länger`. Неправильні: `gut → besser`, `viel → mehr`, `gern → lieber`, `hoch → höher`.",
      ],
      tables: [
        { head: ["Звичайний", "Вищий (-er)", "Найвищий (am …-sten)"], rows: [["schnell", "schneller", "am schnellsten"], ["billig", "billiger", "am billigsten"], ["alt", "älter", "am ältesten"], ["groß", "größer", "am größten"], ["teuer", "teurer", "am teuersten"], ["gut", "besser", "am besten"], ["viel", "mehr", "am meisten"], ["gern", "lieber", "am liebsten"], ["hoch", "höher", "am höchsten"]] },
      ],
      ex: [["Der Zug ist schneller als der Bus.", "Потяг швидший за автобус."], ["Berlin ist größer als Xanten.", "Берлін більший за Ксантен."], ["Im Sommer ist es hier fast so warm wie in Kyjiw.", "Улітку тут майже так само тепло, як у Києві."], ["Ich fahre lieber mit dem Zug als mit dem Auto.", "Мені більше подобається їздити потягом, ніж автомобілем."], ["Die Fahrkarte ist teurer als letztes Jahr.", "Квиток дорожчий, ніж торік."]],
      warn: ["`schneller wie` — помилка: після вищого ступеня — `als`: `schneller als`. `wie` — лише в `so … wie`.", "`mehr schnell` — помилка: -er додають до самого слова: `schneller`. А в `teuer → teurer`, `dunkel → dunkler` випадає -e-."],
    },
    {
      id: "superlativ", t: "Найвищий ступінь: am schnellsten, der schnellste Zug", cat: "adj",
      text: [
        "Найвищий ступінь має дві форми. Після дієслова — **am …-sten**: `Der ICE fährt am schnellsten.` `Am liebsten reise ich mit dem Zug.`",
        "Перед іменником — **der, die, das …-ste** з закінченням, як у звичайного прикметника (розділ 21): `der schnellste Zug`, `die schönste Stadt`, `mit dem billigsten Ticket`.",
        "Після -t, -d, -s, -ß, -z додають **-e-**: `am ältesten`, `am heißesten`, `am kürzesten`.",
      ],
      ex: [["Wie komme ich am schnellsten nach Berlin?", "Як мені найшвидше дістатися до Берліна?"], ["Berlin ist die größte Stadt Deutschlands.", "Берлін — найбільше місто Німеччини."], ["Am liebsten fahre ich mit dem Fahrrad.", "Найбільше я люблю їздити велосипедом."], ["Wir nehmen den billigsten Zug.", "Ми поїдемо найдешевшим потягом."], ["Im Juli ist es am heißesten.", "У липні найспекотніше."]],
      tips: ["Три сходинки: `Er läuft schnell.` — `Er läuft schneller als ich.` — `Er läuft am schnellsten.`"],
    },
    {
      id: "reiseziel", t: "Куди? nach Berlin, in die Ukraine, ans Meer", cat: "prep",
      text: [
        "**Міста й більшість країн** (без артикля) — `nach`: `nach Berlin`, `nach Polen`, `nach Hause`. Де? — `in`: `in Berlin`, `in Polen`, `zu Hause`.",
        "**Країни з артиклем** — `in` + Akkusativ: `in die Schweiz`, `in die USA`. Де? — `in` + Dativ: `in der Schweiz`, `in den USA`. Україна німецькою теж з артиклем: `in die Ukraine` (куди?), `in der Ukraine` (де?), `aus der Ukraine` (звідки?).",
        "**Вода** (море, озеро, річка) — `an`: `ans Meer`, `an den Rhein`, `an den See`; де? — `am Meer`, `am Rhein`. **Гори** — `in die Berge` / `in den Bergen`. **Острів** — `auf die Insel` / `auf der Insel`. **До людини** — `zu`: `zu Anna` / `bei Anna`.",
      ],
      tables: [
        { head: ["", "Куди? (wohin?)", "Де? (wo?)"], rows: [["місто, країна без артикля", "nach Berlin", "in Berlin"], ["країна з артиклем", "in die Ukraine", "in der Ukraine"], ["море, річка, озеро", "ans Meer, an den Rhein", "am Meer, am Rhein"], ["гори", "in die Berge", "in den Bergen"], ["острів", "auf die Insel", "auf der Insel"], ["людина", "zu Anna", "bei Anna"]] },
      ],
      ex: [["Im Sommer fahren wir ans Meer.", "Улітку ми їдемо на море."], ["Ich fliege nächste Woche in die Ukraine.", "Наступного тижня я лечу в Україну."], ["Xanten liegt am Niederrhein.", "Ксантен лежить на Нижньому Рейні."], ["Am Wochenende wandern wir in den Bergen.", "На вихідних ми ходимо в гори."], ["Fährst du mit nach Berlin?", "Поїдеш зі мною до Берліна?"]],
      warn: ["`nach die Ukraine` — помилка: країни з артиклем — з `in`: `in die Ukraine`.", "`in Ukraine` — помилка: німецькою Україна завжди з артиклем: `in der Ukraine`."],
    },
    {
      id: "bahn", t: "На вокзалі: квиток, пересадка, колія", cat: "rede",
      text: [
        "Квиток (`die Fahrkarte`, `das Ticket`) купують в автоматі, у застосунку DB Navigator або в касі на вокзалі (`das Reisezentrum`). Буває `einfach` (в один бік) і `hin und zurück` (туди й назад), `erste` чи `zweite Klasse`.",
        "**Deutschlandticket** — проїзний на місяць для всього місцевого й регіонального транспорту Німеччини: автобуси, трамваї, S-Bahn, потяги RE і RB. У швидкісних потягах `ICE`, `IC` та `EC` він не діє.",
        "На табло: `Gleis 4` (колія 4), `Abfahrt` (відправлення), `Ankunft` (прибуття), `Verspätung` (запізнення), `fällt aus` (скасовано), `umsteigen` (пересідати).",
      ],
      ex: [["Einmal nach Berlin, bitte. Hin und zurück.", "Один квиток до Берліна, будь ласка. Туди й назад."], ["Wo muss ich umsteigen?", "Де мені пересідати?"], ["Von welchem Gleis fährt der Zug ab?", "З якої колії відправляється потяг?"], ["Der Zug hat zwanzig Minuten Verspätung.", "Потяг запізнюється на двадцять хвилин."], ["Ist dieser Platz noch frei?", "Це місце ще вільне?"]],
      tips: ["Автобуси Ксантена — у розділі «Транспорт» цього застосунку."],
    },
    {
      id: "unterkunft", t: "Ночівля: готель, хостел, бронювання", cat: "rede",
      text: [
        "Де ночувати: `das Hotel`, `die Pension` (невеликий готель), `die Jugendherberge` (хостел), `die Ferienwohnung` (квартира для відпочинку).",
        "`das Einzelzimmer` — одномісний номер, `das Doppelzimmer` — двомісний, `mit Frühstück` — зі сніданком, `die Übernachtung` — ночівля. `Ich möchte ein Zimmer reservieren.` — «Я хочу забронювати номер.»",
        "О котрій заселятися й до котрої звільнити номер, написано в підтвердженні бронювання (`die Buchungsbestätigung`).",
      ],
      ex: [["Haben Sie noch ein Einzelzimmer frei?", "У Вас ще є вільний одномісний номер?"], ["Was kostet eine Übernachtung mit Frühstück?", "Скільки коштує ночівля зі сніданком?"], ["Ich habe ein Zimmer für zwei Nächte reserviert.", "Я {забронював|забронювала} номер на дві ночі."], ["Bis wann muss ich das Zimmer verlassen?", "До котрої мені треба звільнити номер?"]],
    },
  ],
  phrases: [
    { t: "Квиток і потяг", list: [["Wie komme ich am schnellsten nach Berlin?", "Як найшвидше дістатися до Берліна?"], ["Muss ich umsteigen?", "Мені треба пересідати?"], ["Gibt es eine billigere Verbindung?", "Є дешевший варіант?"], ["Ich möchte einen Sitzplatz reservieren.", "Я хочу зарезервувати місце."], ["Der Zug fällt aus.", "Потяг скасовано."]] },
    { t: "Порівняти", list: [["Was ist schneller, der Bus oder die Bahn?", "Що швидше, автобус чи потяг?"], ["Der Zug ist bequemer als der Bus.", "Потяг зручніший за автобус."], ["Das ist am billigsten.", "Так найдешевше."], ["Ich reise lieber mit dem Zug.", "Мені більше подобається подорожувати потягом."]] },
    { t: "У готелі", list: [["Ich habe ein Zimmer reserviert.", "Я {забронював|забронювала} номер."], ["Ist das Frühstück inklusive?", "Сніданок включено?"], ["Wo kann ich mein Gepäck lassen?", "Де можна залишити багаж?"]] },
  ],
  dialog: {
    t: "Квиток до Берліна",
    lines: [
      ["Bahnmitarbeiter", "Guten Tag! Wohin möchten Sie fahren?", "Добрий день! Куди Ви хочете поїхати?"],
      ["{Taras|Lessja}", "Nach Berlin, am Freitag. Wie komme ich am schnellsten von Xanten dorthin?", "До Берліна, у п’ятницю. Як мені найшвидше дістатися туди з Ксантена?"],
      ["Bahnmitarbeiter", "Am schnellsten fahren Sie mit der RB 31 nach Duisburg. Dort steigen Sie in den ICE nach Berlin um. Das dauert etwas mehr als fünf Stunden.", "Найшвидше — регіональним RB 31 до Дуйсбурга. Там пересядете на ICE до Берліна. Це трохи більше п’яти годин."],
      ["{Taras|Lessja}", "Gibt es auch eine billigere Verbindung? Ich habe ein Deutschlandticket.", "А є дешевший варіант? У мене є Deutschlandticket."],
      ["Bahnmitarbeiter", "Mit dem Deutschlandticket können Sie nur Regionalzüge nehmen. Das ist billiger, aber viel langsamer: ungefähr zehn Stunden, und Sie müssen oft umsteigen.", "З Deutschlandticket можна їхати лише регіональними потягами. Це дешевше, але набагато повільніше: десь десять годин, і пересадок багато."],
      ["{Taras|Lessja}", "Zehn Stunden? Dann nehme ich lieber den ICE. Eine Fahrkarte, zweite Klasse, hin und zurück, bitte.", "Десять годин? Тоді краще поїду ICE. Один квиток, другий клас, туди й назад, будь ласка."],
      ["Bahnmitarbeiter", "Gern. Möchten Sie auch einen Sitzplatz reservieren? Freitags sind die Züge sehr voll.", "Залюбки. Бажаєте також зарезервувати місце? У п’ятницю потяги дуже заповнені."],
      ["{Taras|Lessja}", "{Ja, bitte, am Fenster. Ich möchte unterwegs zeichnen.|Ja, bitte, am Fenster. Ich möchte unterwegs lesen.}", "{Так, будь ласка, біля вікна. Хочу в дорозі малювати.|Так, будь ласка, біля вікна. Хочу в дорозі читати.}"],
      ["Bahnmitarbeiter", "Fahren Sie zum ersten Mal nach Berlin?", "Ви вперше їдете до Берліна?"],
      ["{Taras|Lessja}", "{Ja. Ich bin früher viel durch die Ukraine gereist und habe alte Kirchen gezeichnet. Aber in Berlin war ich noch nie.|Nein, ich war schon einmal dort, im Jahr 1899! Damals war ich im Deutschen Theater.}", "{Так. Колись я багато мандрував Україною й малював старі церкви. А от у Берліні ще не був.|Ні, я вже була там — у 1899 році! Тоді я ходила в Deutsches Theater.}"],
      ["Bahnmitarbeiter", "{Dann wird Ihnen Berlin gefallen. Dort gibt es viele Museen.|1899? Da waren die Züge bestimmt noch viel langsamer!}", "{Тоді Берлін Вам сподобається. Там багато музеїв.|У 1899-му? Тоді потяги, мабуть, були ще набагато повільніші!}"],
      ["{Taras|Lessja}", "{Darauf freue ich mich schon!|Viel langsamer! Heute geht alles schneller.}", "{Уже чекаю з нетерпінням!|Набагато повільніші! Сьогодні все швидше.}"],
    ],
  },
  tasks: [
    { t: "gap", q: "Der ICE ist schneller ___ der Bus.", a: ["als"] },
    { t: "gap", q: "Berlin ist ___ als Xanten. (groß)", a: ["größer"] },
    { t: "gap", q: "Der Bus ist so langsam ___ die Bahn.", a: ["wie"] },
    { t: "gap", q: "Ich trinke ___ Tee als Kaffee. (gern)", a: ["lieber"] },
    { t: "gap", q: "Der ICE fährt am ___. (schnell)", a: ["schnellsten"] },
    { t: "gap", q: "Das ist der ___ Zug. (billig, найвищий ступінь)", a: ["billigste"] },
    { t: "gap", q: "Im Sommer fahren wir ___ Meer. (an + das)", a: ["ans"] },
    { t: "gap", q: "Ich fliege ___ die Ukraine.", a: ["in"] },
    { t: "gap", q: "Wir fahren morgen ___ Berlin.", a: ["nach"] },
    { t: "mc", q: "Як правильно?", o: ["Er ist älter wie ich.", "Er ist älter als ich.", "Er ist mehr alt als ich."], a: 1 },
    { t: "mc", q: "Вищий ступінь від «gut»:", o: ["guter", "besser", "mehr gut"], a: 1 },
    { t: "mc", q: "Як сказати «в Україні»?", o: ["in Ukraine", "in der Ukraine", "nach der Ukraine"], a: 1 },
    { t: "mc", q: "Чи діє Deutschlandticket в ICE?", o: ["так", "ні", "лише в першому класі"], a: 1 },
    { t: "mc", q: "Що означає «Der Zug fällt aus»?", o: ["потяг скасовано", "потяг запізнюється", "потяг переповнений"], a: 0 },
  ],
};
