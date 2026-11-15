// Розділ 35 (B1). Договір і лікарняний: Genitiv, прийменники з Genitiv (wegen, trotz, während, innerhalb), трудовий
// договір і розрахунковий лист, що робити, коли захворів.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 35, part: "B1.1", title: "Договір і лікарняний", book: null,
  goals: [
    "казати, чиє це, як у договорах і листах: die Adresse der Firma, am Ende des Monats",
    "уживати wegen, trotz, während, statt, innerhalb, außerhalb",
    "розуміти трудовий договір і розрахунковий лист: Probezeit, brutto, netto",
    "правильно повідомити про хворобу: дзвінок до роботи, довідка, лікарняні",
  ],
  grammar: [
    {
      id: "genitiv", t: "Genitiv: des Vertrags, der Firma", cat: "noun",
      text: [
        "Genitiv відповідає на питання `Wessen?` — «чий? кого? чого?» — і показує належність: `der Name **des Chefs**` — «ім’я начальника», `die Adresse **der Firma**` — «адреса фірми».",
        "Артиклі: `des` (чоловічий і середній рід), `der` (жіночий рід і множина). Іменник чоловічого й середнього роду отримує `-s`, а після `s`, `ß`, `z`, `sch` і в коротких словах — `-es`: `des Vertrags`, `des Hauses`, `des Tages`.",
        "З іменами — просто `-s`, без апострофа: `Annas Vertrag`, `Jonas’ Auto` (коли ім’я вже закінчується на `s`).",
        "У розмові Genitiv часто замінюють на `von` + Dativ: `der Vertrag von meinem Bruder`. У листах, договорах, новинах і на іспиті — Genitiv.",
      ],
      tables: [
        { head: ["", "чоловічий", "жіночий", "середній", "множина"], rows: [["означений", "des Vertrags", "der Firma", "des Büros", "der Kollegen"], ["неозначений", "eines Vertrags", "einer Firma", "eines Büros", "—"], ["присвійний", "meines Chefs", "meiner Chefin", "meines Kindes", "meiner Kinder"], ["з прикметником", "des neuen Vertrags", "der neuen Firma", "des neuen Büros", "der neuen Kollegen"]] },
      ],
      ex: [["Das ist die Telefonnummer meines Chefs.", "Це номер телефону мого начальника."], ["Am Ende des Monats bekomme ich mein Gehalt.", "Наприкінці місяця я отримую зарплату."], ["Die Adresse der Firma steht oben im Vertrag.", "Адреса фірми вказана вгорі договору."], ["Annas Vertrag ist unbefristet.", "Договір Анни безстроковий."]],
      warn: ["`des Firma` — помилка: жіночий рід у Genitiv — `der Firma`. А `der Vertrag` → `des Vertrags`: не забудь `-s`."],
    },
    {
      id: "praepGen", t: "wegen, trotz, während, statt, innerhalb + Genitiv", cat: "prep",
      text: [
        "`wegen` — «через» (причина): `wegen **des** Streiks`. `trotz` — «попри»: `trotz **des** Regens`.",
        "`während` — «під час»: `während **der** Probezeit`. `statt` (`anstatt`) — «замість»: `statt **eines** Briefes`.",
        "`innerhalb` — «протягом, у межах»: `innerhalb **einer** Woche`; `außerhalb` — «поза»: `außerhalb **der** Arbeitszeit`.",
        "У розмові після `wegen` і `trotz` часто чути Dativ (`wegen dem Wetter`). У листах і на іспиті пиши Genitiv.",
      ],
      tables: [
        { head: ["Прийменник", "Значення", "Приклад"], rows: [["wegen", "через", "wegen der Krankheit"], ["trotz", "попри", "trotz des schlechten Wetters"], ["während", "під час", "während der Arbeit"], ["statt", "замість", "statt eines Anrufs"], ["innerhalb", "протягом, у межах", "innerhalb eines Monats / innerhalb von zwei Wochen"], ["außerhalb", "поза", "außerhalb der Öffnungszeiten"]] },
      ],
      ex: [["Wegen eines Unfalls kam ich zu spät zur Arbeit.", "{Через аварію я запізнився на роботу.|Через аварію я запізнилася на роботу.}"], ["Während der Probezeit gilt eine Kündigungsfrist von zwei Wochen.", "Під час випробувального строку попереджають про звільнення за два тижні."], ["Bitte schicken Sie die Unterlagen innerhalb einer Woche.", "Будь ласка, надішліть документи протягом тижня."], ["Trotz des Regens sind wir zu Fuß gegangen.", "Попри дощ, ми пішли пішки."]],
      warn: ["`innerhalb zwei Wochen` — помилка. З числом без артикля кажи `innerhalb von zwei Wochen`."],
    },
    {
      id: "vertrag", t: "Трудовий договір і розрахунковий лист", cat: "rede",
      text: [
        "Договір (`der Arbeitsvertrag`) укладають **письмово**. Перед підписом перевір: посаду, дату початку, робочий час, зарплату (`brutto`), відпустку, випробувальний строк (`die Probezeit`, найчастіше до 6 місяців) і строк попередження про звільнення (`die Kündigungsfrist`).",
        "Відпустка за законом — щонайменше 20 робочих днів на рік при п’ятиденному тижні; у багатьох договорах — 25–30.",
        "Звільнення (`die Kündigung`) дійсне **тільки на папері з підписом**: e-mail чи повідомлення в месенджері не годяться. У випробувальний строк попереджають за 2 тижні, після нього — за законом щонайменше за 4 тижні.",
        "Розрахунковий лист (`die Lohnabrechnung`) приходить щомісяця: `brutto` мінус податок (`die Lohnsteuer`) і внески на медичне, пенсійне, від безробіття й на догляд = `netto`, те, що надходить на рахунок. Податковий клас (`die Steuerklasse`): I — неодружені, III і V або IV — подружжя.",
      ],
      tables: [
        { head: ["У договорі", "Що це"], rows: [["Arbeitszeit: 39 Stunden pro Woche", "робочий час"], ["Bruttogehalt / Stundenlohn", "зарплата до вирахувань / погодинна"], ["Urlaubsanspruch: 28 Arbeitstage", "право на відпустку"], ["Probezeit: 6 Monate", "випробувальний строк"], ["Kündigungsfrist: 4 Wochen zum Monatsende", "строк попередження про звільнення"], ["Überstunden", "понаднормові години"]] },
      ],
      ex: [["Ich möchte den Vertrag in Ruhe lesen. Darf ich ihn mitnehmen?", "Я хочу спокійно прочитати договір. Можна взяти його з собою?"], ["Wie viel bekomme ich netto?", "Скільки я отримаю на руки?"], ["Werden Überstunden bezahlt oder mit Freizeit ausgeglichen?", "Понаднормові оплачують чи компенсують вільним часом?"]],
      tips: ["Не підписуй того, чого не розумієш. Попроси час або копію: `Darf ich den Vertrag mitnehmen?` Безкоштовно договір пояснять, наприклад, у міграційній консультації."],
    },
    {
      id: "krankmeldung", t: "Захворів: дзвінок, довідка, лікарняні", cat: "rede",
      text: [
        "Захворів — **того ж ранку, до початку роботи** повідом керівника, як заведено у фірмі (телефоном чи e-mail), і скажи, скільки приблизно не будеш.",
        "Довідку про непрацездатність (`die Arbeitsunfähigkeitsbescheinigung`, коротко `AU`, у розмові `die Krankmeldung`) лікарська практика надсилає твоїй медичній страховій електронно, а роботодавець бере дані звідти. Папірець для себе ти теж отримаєш.",
        "За законом довідка потрібна, якщо хворієш **довше трьох календарних днів**. Роботодавець може вимагати її раніше, навіть з першого дня, — дивись договір.",
        "Під час хвороби зарплату до 6 тижнів платить роботодавець (`die Lohnfortzahlung`, якщо працюєш у фірмі понад чотири тижні), далі медична страхова платить лікарняні (`das Krankengeld`).",
      ],
      ex: [["{Guten Morgen, hier ist Taras Schewtschenko. Ich bin krank und kann heute nicht kommen.|Guten Morgen, hier ist Lessja Ukrajinka. Ich bin krank und kann heute nicht kommen.}", "{Доброго ранку, це Тарас Шевченко. Я захворів і сьогодні не можу прийти.|Доброго ранку, це Леся Українка. Я захворіла і сьогодні не можу прийти.}"], ["Ich gehe heute zum Arzt. Die Krankmeldung bekommen Sie über die Krankenkasse.", "Сьогодні піду до лікаря. Довідку Ви отримаєте через медичну страхову."], ["Ich bin voraussichtlich bis Freitag krankgeschrieben.", "Імовірно, я на лікарняному до п’ятниці."]],
    },
  ],
  phrases: [
    { t: "Договір", list: [["Wann ist mein erster Arbeitstag?", "Коли мій перший робочий день?"], ["Wie lange dauert die Probezeit?", "Скільки триває випробувальний строк?"], ["Diesen Punkt verstehe ich nicht. Können Sie ihn erklären?", "Цього пункту я не розумію. Можете пояснити?"]] },
    { t: "Лікарняний", list: [["Ich habe Fieber und bleibe heute zu Hause.", "У мене температура, сьогодні я лишаюся вдома."], ["Ich bin bis Mittwoch krankgeschrieben.", "Я на лікарняному до середи."], ["Ab Donnerstag bin ich wieder da.", "З четверга я знову на роботі."]] },
    { t: "Зарплата", list: [["Mein Gehalt ist noch nicht auf dem Konto.", "Зарплата ще не надійшла на рахунок."], ["In meiner Lohnabrechnung fehlen die Überstunden.", "У моєму розрахунковому листі бракує понаднормових."], ["Welche Steuerklasse habe ich?", "Який у мене податковий клас?"]] },
  ],
  dialog: {
    t: "Договір, а потім лікарняний",
    lines: [
      ["Chefin", "{Herr Schewtschenko|Frau Ukrajinka}, hier ist Ihr Arbeitsvertrag. Lesen Sie ihn bitte in Ruhe durch.", "{Пане Шевченку|Пані Українко}, ось Ваш трудовий договір. Прочитайте його, будь ласка, спокійно."],
      ["{Taras|Lessja}", "Danke. Eine Frage: Wie lange dauert die Probezeit?", "Дякую. Одне питання: скільки триває випробувальний строк?"],
      ["Chefin", "Sechs Monate. Während der Probezeit gilt eine Kündigungsfrist von zwei Wochen.", "Шість місяців. Під час випробувального строку попереджають за два тижні."],
      ["{Taras|Lessja}", "Und wie viele Urlaubstage habe ich?", "А скільки в мене днів відпустки?"],
      ["Chefin", "Achtundzwanzig im Jahr. Den Urlaub tragen Sie bitte rechtzeitig in den Kalender des Teams ein.", "Двадцять вісім на рік. Відпустку, будь ласка, вчасно вносьте в календар команди."],
      ["{Taras|Lessja}", "Verstanden. Und was mache ich, wenn ich krank werde?", "Зрозуміло. А що мені робити, якщо я захворію?"],
      ["Chefin", "Rufen Sie mich vor Arbeitsbeginn an. Ab dem dritten Tag brauchen wir eine Krankmeldung vom Arzt.", "Подзвоніть мені до початку роботи. З третього дня нам потрібна довідка від лікаря."],
      ["{Taras|Lessja}", "Gut. Dann unterschreibe ich jetzt.", "Добре. Тоді я зараз підпишу."],
      ["", "…", "…"],
      ["{Taras|Lessja}", "{Guten Morgen, hier ist Taras Schewtschenko. Leider bin ich krank: Ich habe hohes Fieber.|Guten Morgen, hier ist Lessja Ukrajinka. Leider bin ich krank: Ich habe hohes Fieber.}", "{Доброго ранку, це Тарас Шевченко. На жаль, я захворів: у мене висока температура.|Доброго ранку, це Леся Українка. На жаль, я захворіла: у мене висока температура.}"],
      ["Chefin", "Oh, gute Besserung! Gehen Sie heute zum Arzt?", "Ой, одужуйте! Сьогодні підете до лікаря?"],
      ["{Taras|Lessja}", "Ja, um zehn Uhr. Wegen des Fiebers kann ich heute leider nicht ins Büro kommen.", "Так, о десятій. Через температуру я, на жаль, не можу сьогодні прийти в офіс."],
      ["Chefin", "Kein Problem. Die Krankmeldung schickt die Praxis direkt an die Krankenkasse. Sagen Sie mir nur, wie lange Sie krankgeschrieben sind.", "Нічого страшного. Довідку практика надсилає просто до медичної страхової. Скажіть мені тільки, на скільки днів Вам дадуть лікарняний."],
      ["{Taras|Lessja}", "Mache ich. Und den Termin mit dem Kunden am Donnerstag – kann den jemand übernehmen?", "Обов’язково. А зустріч із клієнтом у четвер — хтось може її взяти на себе?"],
      ["Chefin", "Ich frage Jonas. Werden Sie erst mal gesund!", "Я запитаю Йонаса. Спершу одужайте!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist das Büro ___ Chefin. (моєї)", a: ["meiner"] },
    { t: "gap", q: "Am Ende ___ Monats bekomme ich mein Gehalt.", a: ["des"] },
    { t: "gap", q: "Die Adresse ___ Firma steht im Vertrag.", a: ["der"] },
    { t: "gap", q: "___ des Regens sind wir zu Fuß gegangen. (попри)", a: ["Trotz", "trotz"] },
    { t: "gap", q: "___ der Probezeit gilt eine Frist von zwei Wochen. (під час)", a: ["Während", "während"] },
    { t: "gap", q: "Bitte antworten Sie innerhalb ___ Woche. (одного)", a: ["einer"] },
    { t: "gap", q: "Ich bin bis Freitag ___. (на лікарняному)", a: ["krankgeschrieben"] },
    { t: "gap", q: "Brutto minus Steuern und Versicherungen ist ___.", a: ["netto"] },
    { t: "mc", q: "Як написати в офіційному листі? Wegen ___ Streiks fährt heute kein Bus.", o: ["des", "dem", "den"], a: 0 },
    { t: "mc", q: "Зранку в тебе температура 39. Що зробити насамперед?", o: ["Прийти на роботу й сказати там", "До початку роботи повідомити керівника", "Нічого: лікар сам усе повідомить"], a: 1 },
    { t: "mc", q: "Керівник надіслав звільнення в месенджері. Воно дійсне?", o: ["Так, будь-яке повідомлення годиться", "Так, якщо видно «прочитано»", "Ні: звільнення має бути на папері з підписом"], a: 2 },
    { t: "mc", q: "`die Probezeit` — це…", o: ["випробувальний строк", "пробний урок", "лікарняний"], a: 0 },
    { t: "mc", q: "У розрахунковому листі `netto` — це…", o: ["зарплата до податків", "сума, що надходить на рахунок", "податок"], a: 1 },
    { t: "mc", q: "Скільки щонайменше днів відпустки дає закон при п’ятиденному робочому тижні?", o: ["10 робочих днів", "20 робочих днів", "30 робочих днів"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["innerhalb zwei Wochen", "innerhalb zwei Wochen von", "innerhalb von zwei Wochen"], a: 2 },
  ],
};
