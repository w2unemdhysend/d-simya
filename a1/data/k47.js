// Розділ 47 (B1). Новини й енергія: непряма мова в новинах (er sagt, er sei …), прийменники außer, gegenüber,
// entlang, ab, laut, pro; рахунки за електроенергію й газ; як читати новини.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 47, part: "B1.2", title: "Новини й енергія", book: null,
  goals: [
    "впізнавати непряму мову в новинах і листах: Er sagt, er sei krank",
    "уживати außer, gegenüber, entlang, ab, laut, pro",
    "розуміти рахунок за електроенергію: Abschlag, Zählerstand, Nachzahlung, і що робити, коли нема чим платити",
    "читати новини: заголовки, п’ять питань, перевірка джерела",
  ],
  grammar: [
    {
      id: "konj1", t: "Непряма мова в новинах: Er sagt, er sei …", cat: "verb",
      text: [
        "У новинах і офіційних текстах чужі слова передають **Konjunktiv I** — так автор показує: «це сказав він, не я». На B1 його досить **впізнавати**.",
        "Найчастіше трапляється 3-тя особа однини: `sein → er **sei**`, `haben → er **habe**`, `werden → er **werde**`, `können → er **könne**`; інші — основа + `-e`: `kommen → er **komme**`, `geben → er **gebe**`.",
        "Коли форма Konjunktiv I збігається з Präsens (найчастіше в множині), беруть Konjunktiv II або `würde`: `Die Sprecher sagten, die Preise **würden** steigen.`",
        "У розмові непряму мову кажуть просто з `dass` і звичайним Präsens: `Er sagt, dass er krank ist.`",
      ],
      tables: [
        { head: ["Пряма мова", "У новинах", "У розмові"], rows: [["„Ich bin krank.“", "Er sagt, er sei krank.", "Er sagt, dass er krank ist."], ["„Wir haben keine Zeit.“", "Sie sagen, sie hätten keine Zeit.", "Sie sagen, dass sie keine Zeit haben."], ["„Der Strom wird teurer.“", "Er sagt, der Strom werde teurer.", "Er sagt, dass der Strom teurer wird."], ["„Ich kann nicht kommen.“", "Sie sagt, sie könne nicht kommen.", "Sie sagt, dass sie nicht kommen kann."]] },
      ],
      ex: [["Die Stadt teilte mit, die Straße sei bis Freitag gesperrt.", "Місто повідомило, що вулиця перекрита до п’ятниці."], ["Der Sprecher sagte, die Preise würden im Herbst steigen.", "Речник сказав, що восени ціни зростуть."], ["Laut Polizei habe es keine Verletzten gegeben.", "За даними поліції, постраждалих не було."]],
    },
    {
      id: "praepB1", t: "außer, gegenüber, entlang, ab, laut, pro", cat: "prep",
      text: [
        "`außer` + Dativ — «крім»: `Alle außer mir waren da.` `gegenüber` + Dativ — «навпроти»; може стояти й після іменника: `gegenüber dem Rathaus` = `dem Rathaus gegenüber`.",
        "`entlang` — «уздовж», здебільшого після іменника в Akkusativ: `den Rhein entlang`.",
        "`ab` + Dativ — «з (часу чи місця)»: `ab dem 1. Januar`, `ab nächster Woche`. `laut` + Dativ — «згідно з»: `laut Vertrag`, `laut Wetterbericht`. `pro` — «за, на кожен»: `38 Cent pro Kilowattstunde`.",
      ],
      tables: [
        { head: ["Прийменник", "Значення", "Приклад"], rows: [["außer + Dat.", "крім", "außer sonntags"], ["gegenüber + Dat.", "навпроти", "gegenüber der Kirche"], ["entlang (після іменника)", "уздовж", "den Fluss entlang"], ["ab + Dat.", "з (часу)", "ab dem 1. Januar"], ["laut + Dat.", "згідно з", "laut Abrechnung"], ["pro", "за, на кожен", "pro Monat"]] },
      ],
      ex: [["Ab dem 1. Januar steigt der Strompreis auf 38 Cent pro Kilowattstunde.", "З 1 січня ціна на електроенергію зросте до 38 центів за кіловат-годину."], ["Laut Abrechnung bekomme ich 120 Euro zurück.", "Згідно з розрахунком, мені повернуть 120 євро."], ["Wir fahren mit dem Fahrrad den Rhein entlang.", "Ми їдемо велосипедом уздовж Рейну."]],
    },
    {
      id: "energie", t: "Електроенергія й газ: аванс, лічильник, постачальник", cat: "rede",
      text: [
        "Щомісяця ти платиш постачальнику аванс (`der Abschlag`). Раз на рік приходить розрахунок (`die Jahresabrechnung`) за показами лічильника (`der Zählerstand`): доплата або повернення.",
        "Покази передавай сам, коли просять (лист, сайт, застосунок): номер лічильника (`die Zählernummer`) і цифри до коми. Сфотографуй лічильник — фото з датою буде доказом.",
        "Постачальника можна змінити (`den Anbieter wechseln`): порівняй ціну за кіловат-годину й базову плату (`der Grundpreis`). Старий договір розриває новий постачальник. Без світла не залишишся: якщо щось піде не так, працює базове постачання (`die Grundversorgung`).",
        "Не можеш заплатити — **одразу** пиши постачальнику й проси розстрочку (`die Ratenzahlung`). Безкоштовно порадить Verbraucherzentrale, а тим, хто отримує допомогу, — і Jobcenter.",
      ],
      ex: [["Ich möchte meinen Zählerstand mitteilen.", "Я хочу передати покази лічильника."], ["Können Sie den Abschlag anpassen?", "Можете змінити розмір авансу?"], ["Ich kann die Nachzahlung nicht auf einmal bezahlen. Ist eine Ratenzahlung möglich?", "Я не можу сплатити доплату одразу. Можна розстрочку?"]],
      tips: ["Провітрюй 5–10 хвилин навстіж кілька разів на день, а не тримай вікно відкидним; електрообігрівач — дорогий спосіб гріти кімнату."],
    },
    {
      id: "nachrichtenB1", t: "Новини: заголовки, п’ять питань, джерело", cat: "rede",
      text: [
        "Заголовки часто без дієслова, самі іменники: `Streik bei der Bahn` — «Страйк на залізниці»; `Mehr Geld für Familien`; `Neue Regeln ab Januar`.",
        "Коротка новина відповідає на п’ять питань: **хто? що? коли? де? чому?** Знайди ці відповіді — і головне зрозуміло, навіть якщо не всі слова знайомі.",
        "Для практики — новини простою мовою (`nachrichtenleicht.de`, «Tagesschau in Einfacher Sprache»), місцева газета й сайт міста, радіо `WDR`.",
        "Перевіряй джерело: хто пише, коли, чи підтверджують інші. Сенсаційні повідомлення в месенджерах часто фальшиві (`Fake News`).",
      ],
      ex: [["Weißt du schon? Ab Montag streikt die Bahn.", "Уже знаєш? З понеділка страйкує залізниця."], ["In der Zeitung steht, dass die Brücke repariert wird.", "У газеті пишуть, що міст ремонтуватимуть."], ["Woher hast du diese Information?", "Звідки в тебе ця інформація?"]],
    },
  ],
  phrases: [
    { t: "Енергія", list: [["Wie hoch ist mein monatlicher Abschlag?", "Скільки становить мій щомісячний аванс?"], ["Der Zähler ist im Keller.", "Лічильник у підвалі."], ["Ich möchte den Anbieter wechseln.", "Я хочу змінити постачальника."]] },
    { t: "Новини", list: [["Was gibt es Neues?", "Що нового?"], ["Weißt du schon das Neueste?", "Уже знаєш останню новину?"], ["Das stimmt nicht, das sind Fake News.", "Це неправда, це фейк."]] },
    { t: "Чужі слова", list: [["Er hat gesagt, dass er später kommt.", "Він сказав, що прийде пізніше."], ["Laut Wetterbericht wird es morgen kalt.", "За прогнозом, завтра буде холодно."], ["Angeblich soll die Miete steigen.", "Кажуть, ніби оренда подорожчає."]] },
  ],
  dialog: {
    t: "Рахунок за електроенергію",
    lines: [
      ["Max", "Was machst du denn für ein Gesicht?", "Що це в тебе за вираз обличчя?"],
      ["{Taras|Lessja}", "Die Jahresabrechnung für den Strom ist gekommen. Ich soll 310 Euro nachzahlen!", "Прийшов річний розрахунок за електроенергію. Мені треба доплатити 310 євро!"],
      ["Max", "Zeig mal … Hier steht, der Verbrauch sei viel höher als letztes Jahr. Hast du einen neuen Kühlschrank?", "Покажи … Тут написано, що споживання набагато вище, ніж торік. У тебе новий холодильник?"],
      ["{Taras|Lessja}", "Nein, aber im Winter habe ich oft mit einem kleinen Heizlüfter gearbeitet, weil die Heizung kaputt war.", "{Ні, але взимку я часто працював із маленьким тепловентилятором, бо батарея була зламана.|Ні, але взимку я часто працювала з маленьким тепловентилятором, бо батарея була зламана.}"],
      ["Max", "Das erklärt alles. So ein Heizlüfter verbraucht sehr viel Strom.", "Це все пояснює. Такий тепловентилятор споживає дуже багато електроенергії."],
      ["{Taras|Lessja}", "Und ab Januar steigt der Abschlag auf 85 Euro pro Monat. Was soll ich jetzt tun?", "А з січня аванс зросте до 85 євро на місяць. Що мені тепер робити?"],
      ["Max", "Erstens: Ruf an und frag nach einer Ratenzahlung. Zweitens: Vergleich die Preise. Vielleicht lohnt es sich, den Anbieter zu wechseln.", "По-перше: подзвони й попроси розстрочку. По-друге: порівняй ціни. Може, варто змінити постачальника."],
      ["{Taras|Lessja}", "Und wenn beim Wechsel etwas schiefgeht? Dann habe ich keinen Strom.", "А якщо під час зміни щось піде не так? Тоді я буду без світла."],
      ["Max", "Keine Sorge. Dann bekommst du automatisch Strom vom Grundversorger.", "Не хвилюйся. Тоді тобі автоматично постачатиме електроенергію базовий постачальник."],
      ["{Taras|Lessja}", "Gut zu wissen. Übrigens habe ich in den Nachrichten gehört, die Strompreise würden nächstes Jahr wieder sinken.", "{Добре знати. До речі, я чув у новинах, ніби наступного року ціни на електроенергію знову знизяться.|Добре знати. До речі, я чула в новинах, ніби наступного року ціни на електроенергію знову знизяться.}"],
      ["Max", "Hoffentlich! Aber darauf würde ich nicht warten. Ruf am besten heute noch an.", "Сподіваймося! Але я б на це не чекав. Найкраще подзвони ще сьогодні."],
      ["{Taras|Lessja}", "Mache ich. Danke, Max!", "Так і зроблю. Дякую, Максе!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Er sagt, er ___ krank. (sein, Konjunktiv I)", a: ["sei"] },
    { t: "gap", q: "Sie sagt, sie ___ keine Zeit. (haben, Konjunktiv I)", a: ["habe"] },
    { t: "gap", q: "Laut Polizei ___ es keine Verletzten gegeben. (haben, Konjunktiv I)", a: ["habe"] },
    { t: "gap", q: "Alle ___ mir waren da. (крім)", a: ["außer"] },
    { t: "gap", q: "Die Apotheke ist gegenüber ___ Rathaus.", a: ["dem"] },
    { t: "gap", q: "___ dem 1. Januar steigt der Preis. (з)", a: ["Ab", "ab"] },
    { t: "gap", q: "Der Strom kostet 38 Cent ___ Kilowattstunde. (за кожну)", a: ["pro"] },
    { t: "gap", q: "Bitte teilen Sie uns Ihren ___ mit. (покази лічильника)", a: ["Zählerstand"] },
    { t: "mc", q: "У новинах: `Der Bürgermeister sagte, die Brücke sei sicher.` Хто стверджує, що міст безпечний?", o: ["журналіст", "бургомістр", "усі експерти"], a: 1 },
    { t: "mc", q: "Прийшла доплата 310 €, а грошей немає. Що робити?", o: ["Одразу написати постачальнику й попросити розстрочку", "Нічого не робити — забудуть", "Вимкнути холодильник на місяць"], a: 0 },
    { t: "mc", q: "Заголовок: `Streik bei der Bahn`. Про що новина?", o: ["Залізниця будує нову колію", "Квитки подешевшали", "Залізниця страйкує"], a: 2 },
    { t: "mc", q: "Ти змінюєш постачальника електроенергії. Хто розриває старий договір?", o: ["новий постачальник", "бюро громадян", "сусід"], a: 0 },
    { t: "mc", q: "Як правильно провітрювати взимку?", o: ["Цілий день тримати вікно відкидним", "5–10 хвилин навстіж кілька разів на день", "Не провітрювати зовсім"], a: 1 },
    { t: "mc", q: "У месенджері сенсаційна новина без джерела. Що розумно?", o: ["Одразу переслати всім", "Повірити, бо її переслали багато людей", "Перевірити в надійних джерелах, перш ніж пересилати"], a: 2 },
  ],
};
