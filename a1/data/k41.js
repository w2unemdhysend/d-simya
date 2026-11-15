// Розділ 41 (B1). Скарги й права покупця: дієприкметник як прикметник (die bestellte Ware, steigende Preise),
// sodass і so … dass; гарантія за законом, гарантія виробника, обмін і відмова від покупки; лист-скарга.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 41, part: "B1.2", title: "Скарги й права покупця", book: null,
  goals: [
    "розуміти й уживати дієприкметники перед іменником: die bestellte Ware, steigende Preise",
    "казати про наслідок: sodass, so … dass",
    "знати свої права: Gewährleistung, Garantie, Umtausch, Widerruf",
    "поскаржитися телефоном і листом: факти, вимога, строк",
  ],
  grammar: [
    {
      id: "partizipAdj", t: "Дієприкметник як прикметник: die bestellte Ware, steigende Preise", cat: "adj",
      text: [
        "Partizip II можна поставити перед іменником як прикметник — з тими самими закінченнями (розділи 21–22): `Die Waschmaschine wurde repariert.` → `die **reparierte** Waschmaschine` — «відремонтована пральна машина».",
        "Partizip I = інфінітив + `-d`: `schlafen → schlafend`, `steigen → steigend`. Він означає дію, що відбувається **зараз**: `das **schlafende** Kind` — «дитина, що спить»; `der **laufende** Vertrag` — «чинний договір».",
        "Partizip II — уже зроблено (часто з пасивним значенням): `das gekaufte Handy` — «куплений телефон». Partizip I — відбувається: `die wartenden Kunden` — «покупці, що чекають».",
        "Такі форми дуже часті в листах, на упаковці й у новинах: `die bestellte Ware`, `das beschädigte Paket`, `bei steigenden Preisen`.",
      ],
      tables: [
        { head: ["Дієслово", "Partizip II (уже зроблено)", "Partizip I (відбувається)"], rows: [["bestellen / warten", "die bestellte Ware", "die wartenden Kunden"], ["beschädigen / steigen", "das beschädigte Paket", "steigende Preise"], ["reparieren / laufen", "der reparierte Fernseher", "der laufende Monat"]] },
      ],
      ex: [["Die bestellte Jacke ist immer noch nicht da.", "Замовленої куртки все ще немає."], ["Das gelieferte Paket war beschädigt.", "Доставлена посилка була пошкоджена."], ["Im laufenden Monat habe ich schon zweimal etwas reklamiert.", "{Цього місяця я вже двічі повертав бракований товар.|Цього місяця я вже двічі повертала бракований товар.}"]],
      warn: ["Закінчення потрібне, як у прикметника: не `die bestellt Ware`, а `die bestellte Ware`; не `mit dem reparierte Gerät`, а `mit dem reparierten Gerät`."],
    },
    {
      id: "sodass", t: "sodass і so … dass: наслідок", cat: "satz",
      text: [
        "`sodass` (або `so dass`) — «так що, через що»: наслідок того, що сказано перед ним: `Das Paket kam zu spät, **sodass** ich kein Geschenk hatte.`",
        "`so` + прикметник …, `dass` — «такий …, що»: `Der Fernseher war **so** laut, **dass** die Nachbarn geklopft haben.`",
        "Обидва відкривають підрядне речення — дієслово в кінці. Близьке за змістом `deshalb` (розділ 18) стоїть у головному реченні, і дієслово йде одразу за ним.",
      ],
      tables: [
        { head: ["Слово", "Будова", "Приклад"], rows: [["deshalb", "головне речення", "Es war kaputt. Deshalb habe ich es zurückgeschickt."], ["sodass", "підрядне, дієслово в кінці", "Es war kaputt, sodass ich es zurückgeschickt habe."], ["so … dass", "такий …, що", "Es war so kaputt, dass man es nicht reparieren konnte."]] },
      ],
      ex: [["Die Lieferung hat sich verspätet, sodass ich zweimal zu Hause warten musste.", "Доставка затрималася, тож мені довелося двічі чекати вдома."], ["Der Staubsauger ist so schwach, dass er kaum etwas aufsaugt.", "Пилосос такий слабкий, що майже нічого не всмоктує."], ["Die Schlange war so lang, dass wir wieder gegangen sind.", "Черга була така довга, що ми пішли."]],
    },
    {
      id: "reklamation", t: "Права покупця: Gewährleistung, Garantie, Umtausch", cat: "rede",
      text: [
        "**Gewährleistung** — за законом: продавець **2 роки** відповідає за вади, що були в товарі. Спершу він може полагодити чи замінити товар; якщо не вийде — гроші назад або знижка. Перший рік вважається, що вада була від початку.",
        "**Garantie** — добровільна обіцянка виробника (умови — у гарантійному талоні). Вона йде на додачу до Gewährleistung і не замінює її.",
        "Обмін справного товару в магазині (`der Umtausch`) — добра воля магазину, а не право. Запитай перед покупкою: `Kann ich das umtauschen?`",
        "Купівля онлайн, телефоном чи поштою: **14 днів** від отримання, щоб відмовитися без причини (`der Widerruf`, розділ 40). Зберігай чек (`der Kassenbon`) і пакування.",
      ],
      tables: [
        { head: ["", "Хто дає", "Скільки"], rows: [["Gewährleistung", "продавець, за законом", "2 роки"], ["Garantie", "виробник, добровільно", "як написано в умовах"], ["Widerruf", "закон, при купівлі онлайн", "14 днів"], ["Umtausch", "магазин, добровільно", "як вирішить магазин"]] },
      ],
      ex: [["Der Toaster ist nach drei Monaten kaputtgegangen. Ich möchte ihn reklamieren.", "Тостер зламався через три місяці. Я хочу повернути його як бракований."], ["Können Sie das Gerät reparieren oder austauschen?", "Можете полагодити або замінити прилад?"], ["Ich möchte mein Geld zurück.", "Я хочу повернути свої гроші."]],
    },
    {
      id: "beschwerdebrief", t: "Лист-скарга: факти, вимога, строк", cat: "rede",
      text: [
        "Пиши коротко й по суті: **що** купив (дата, номер замовлення), **що не так**, **чого хочеш** (ремонт, заміна, гроші) і **до якого числа**.",
        "Тон ввічливий, але твердий: `Ich bitte Sie, … bis zum … zu …`. Додай копії чека й фото, збережи копію листа.",
        "Фірма не відповідає — порадься в центрі захисту споживачів (`die Verbraucherzentrale`).",
      ],
      tables: [
        { cap: "Будова скарги", head: ["Частина", "Приклад"], rows: [["Тема", "Betreff: Reklamation – Bestellung Nr. 48213"], ["Що сталося", "Am 3. März habe ich bei Ihnen eine Kaffeemaschine bestellt."], ["Проблема", "Leider funktioniert das gelieferte Gerät nicht: Es wird nicht warm."], ["Вимога й строк", "Bitte schicken Sie mir bis zum 20. März ein neues Gerät."], ["Додатки", "Anlagen: Rechnung, Fotos"]] },
      ],
      ex: [["Leider muss ich mich über Ihren Service beschweren.", "На жаль, мушу поскаржитися на ваше обслуговування."], ["Ich bitte Sie, mir den Betrag bis zum 30. April zu überweisen.", "Прошу Вас переказати мені суму до 30 квітня."], ["Eine Kopie der Rechnung liegt bei.", "Копія рахунку додається."]],
    },
  ],
  phrases: [
    { t: "У магазині", list: [["Ich möchte das reklamieren.", "Я хочу повернути це як бракований товар."], ["Hier ist der Kassenbon.", "Ось чек."], ["Kann ich das umtauschen?", "Можна це обміняти?"]] },
    { t: "Телефоном", list: [["Ich rufe wegen meiner Bestellung an.", "Я телефоную щодо свого замовлення."], ["Die Bestellnummer ist 48213.", "Номер замовлення — 48213."], ["Wann bekomme ich eine Antwort?", "Коли я отримаю відповідь?"]] },
    { t: "Твердо, але ввічливо", list: [["Das akzeptiere ich so nicht.", "З цим я не погоджуюся."], ["Ich möchte mit Ihrem Vorgesetzten sprechen.", "Я хочу поговорити з Вашим керівником."], ["Bitte bestätigen Sie mir das schriftlich.", "Будь ласка, підтвердіть мені це письмово."]] },
  ],
  dialog: {
    t: "Гаряча лінія інтернет-магазину",
    lines: [
      ["Kundenservice", "Kundenservice, mein Name ist Lea Hartmann. Was kann ich für Sie tun?", "Служба підтримки, мене звати Леа Гартман. Чим можу допомогти?"],
      ["{Taras|Lessja}", "Guten Tag. Ich rufe wegen meiner Bestellung an. Die Nummer ist 48213.", "Добрий день. Я телефоную щодо свого замовлення. Номер 48213."],
      ["Kundenservice", "Einen Moment … Ein Staubsauger, geliefert am 3. März. Was ist das Problem?", "Хвилинку … Пилосос, доставлений 3 березня. У чому проблема?"],
      ["{Taras|Lessja}", "Das gelieferte Gerät funktioniert nicht richtig. Es ist so laut, dass man es im ganzen Haus hört, und nach fünf Minuten geht es aus.", "Доставлений прилад не працює як слід. Він такий гучний, що його чути на весь будинок, а через п’ять хвилин вимикається."],
      ["Kundenservice", "Das tut mir leid. Haben Sie schon in der Bedienungsanleitung nachgesehen?", "Мені шкода. Ви вже дивилися в інструкції?"],
      ["{Taras|Lessja}", "Ja, natürlich. Ich habe auch den Filter gewechselt. Es ist ein Defekt.", "{Так, звісно. Я навіть замінив фільтр. Це брак.|Так, звісно. Я навіть замінила фільтр. Це брак.}"],
      ["Kundenservice", "Gut. Dann haben Sie zwei Möglichkeiten: Wir reparieren das Gerät, oder Sie bekommen ein neues.", "Добре. Тоді у Вас два варіанти: ми ремонтуємо прилад, або Ви отримуєте новий."],
      ["{Taras|Lessja}", "Ich möchte lieber ein neues Gerät. Muss ich das kaputte selbst zurückschicken?", "{Я хотів би краще новий. Мені самому відсилати зламаний?|Я хотіла б краще новий. Мені самій відсилати зламаний?}"],
      ["Kundenservice", "Nein, wir schicken Ihnen ein Rücksendeetikett per E-Mail. Die Rücksendung ist für Sie kostenlos.", "Ні, ми надішлемо Вам етикетку для повернення електронною поштою. Повернення для Вас безкоштовне."],
      ["{Taras|Lessja}", "Und wann kommt das neue Gerät?", "А коли прийде новий прилад?"],
      ["Kundenservice", "Sobald das alte bei uns angekommen ist, innerhalb von fünf Werktagen.", "Щойно старий надійде до нас, — протягом п’яти робочих днів."],
      ["{Taras|Lessja}", "In Ordnung. Bitte bestätigen Sie mir das noch per E-Mail.", "Гаразд. Будь ласка, підтвердіть мені це ще й електронною поштою."],
      ["Kundenservice", "Gern. Die Bestätigung bekommen Sie in den nächsten Minuten.", "Охоче. Підтвердження надійде за кілька хвилин."],
    ],
  },
  tasks: [
    { t: "gap", q: "Die ___ Ware ist noch nicht da. (bestellen)", a: ["bestellte"] },
    { t: "gap", q: "Das ___ Paket war nass. (beschädigen)", a: ["beschädigte"] },
    { t: "gap", q: "Bitte weck das ___ Kind nicht. (schlafen)", a: ["schlafende"] },
    { t: "gap", q: "Das Paket kam zu spät, ___ ich kein Geschenk hatte.", a: ["sodass"] },
    { t: "gap", q: "Der Fernseher war so laut, ___ die Nachbarn geklopft haben.", a: ["dass"] },
    { t: "gap", q: "Zwei Jahre haftet der Verkäufer für Mängel. Das heißt ___. (гарантія за законом)", a: ["Gewährleistung"] },
    { t: "gap", q: "Ich möchte das ___. Hier ist der Kassenbon. (повернути як брак)", a: ["reklamieren"] },
    { t: "gap", q: "Eine Kopie der Rechnung liegt ___.", a: ["bei"] },
    { t: "mc", q: "Як правильно?", o: ["mit dem reparierte Gerät", "mit dem reparierten Gerät", "mit dem repariert Gerät"], a: 1 },
    { t: "mc", q: "Пральна машина зламалася через 14 місяців після покупки. Що правда?", o: ["Через рік права вже немає", "Допоможе лише виробник, якщо захоче", "Діє гарантія продавця за законом (2 роки) — можна вимагати ремонту"], a: 2 },
    { t: "mc", q: "Светр із магазину цілий, але не подобається. Чи мусить магазин його обміняти?", o: ["Ні, обмін — добра воля магазину", "Так, 14 днів за законом", "Так, якщо є чек"], a: 0 },
    { t: "mc", q: "Замовлення онлайн прийшло 2 травня. Скільки часу є, щоб відмовитися без причини?", o: ["2 дні", "14 днів", "рік"], a: 1 },
    { t: "mc", q: "`steigende Preise` — це…", o: ["ціни, що зростають", "високі ціни", "ціни, що падають"], a: 0 },
    { t: "mc", q: "Що НЕ потрібно в листі-скарзі?", o: ["номер замовлення", "чого ти вимагаєш і до якого числа", "історія твого життя"], a: 2 },
    { t: "mc", q: "Фірма не відповідає на скарги. Де порадитися?", o: ["у Jobcenter", "у Verbraucherzentrale", "у бюро громадян"], a: 1 },
  ],
};
