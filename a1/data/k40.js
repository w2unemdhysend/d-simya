// Розділ 40 (B1). Банк, договори й страховки: Konjunktiv II у минулому (hätte gelesen, wäre gekommen), нереальна
// умова (Wenn ich das gewusst hätte …), рахунок і перекази, договори й страховки.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 40, part: "B1.1", title: "Банк, договори й страховки", book: null,
  goals: [
    "казати про те, чого не сталося: Ich hätte genauer lesen sollen",
    "будувати нереальні умови: Wenn ich mehr Geld hätte …, Wenn ich das gewusst hätte …",
    "відкрити рахунок і розуміти перекази, автосписання, нагадування",
    "розірвати чи відкликати договір і знати головні страховки",
  ],
  grammar: [
    {
      id: "konj2Verg", t: "Konjunktiv II у минулому: hätte gelesen, wäre gekommen", cat: "verb",
      text: [
        "Konjunktiv II теперішнього ти знаєш (розділ 28): `ich würde …`, `ich hätte gern`, `ich wäre`. Про **минуле, якого не було**, кажуть `hätte` або `wäre` + Partizip II: `Ich **hätte** den Vertrag genauer **gelesen**.` — «Я б уважніше прочитав договір» (але не прочитав).",
        "`hätte` чи `wäre` — так само, як `haben` і `sein` у Perfekt: `Ich **wäre** früher **gekommen**.` `Ich **hätte** das **gewusst**.`",
        "Жаль і докір із модальним дієсловом: `hätte` + інфінітив + модальне в інфінітиві в кінці: `Ich hätte das nicht **unterschreiben sollen**.` — «Не варто було мені це підписувати».",
      ],
      tables: [
        { head: ["", "Як було", "Як могло б бути"], rows: [["lesen", "Ich habe es nicht gelesen.", "Ich hätte es gelesen."], ["kommen", "Er ist nicht gekommen.", "Er wäre gekommen."], ["wissen", "Wir haben es nicht gewusst.", "Wir hätten es gewusst."], ["vergleichen + sollen", "Ich habe nicht verglichen.", "Ich hätte vergleichen sollen."]] },
      ],
      ex: [["Ich hätte den Vertrag nicht so schnell unterschreiben sollen.", "Не варто було мені так швидко підписувати договір."], ["Wir wären gern länger geblieben.", "Ми б охоче лишилися довше."], ["Das hättest du mir früher sagen können!", "Ти міг би сказати мені це раніше!"]],
      warn: ["`Ich würde gekommen sein` — так майже не кажуть. Кажи `Ich wäre gekommen.`"],
    },
    {
      id: "irreal", t: "Якби …: Wenn ich mehr Geld hätte …", cat: "satz",
      text: [
        "Нереальна умова **тепер**: `wenn` + Konjunktiv II в обох частинах (`hätte`, `wäre`, `könnte` або `würde` + інфінітив): `Wenn ich mehr Geld **hätte**, **würde** ich ein Auto **kaufen**.`",
        "Нереальна умова **в минулому**: `Wenn ich das **gewusst hätte**, **hätte** ich nicht **unterschrieben**.` — «Якби я це знав, я б не підписав».",
        "Бажання, яке вже не здійсниться: `Hätte ich doch …!` / `Wenn ich doch nur … hätte!` — «Якби ж то …».",
        "Порада (розділ 28): `An deiner Stelle würde ich …` = `Wenn ich du wäre, würde ich …`.",
      ],
      tables: [
        { head: ["", "Умова", "Наслідок"], rows: [["тепер", "Wenn ich Zeit hätte,", "würde ich dir helfen."], ["тепер", "Wenn es nicht so teuer wäre,", "könnten wir mitkommen."], ["минуле", "Wenn ich das gewusst hätte,", "hätte ich nicht unterschrieben."], ["минуле", "Wenn der Bus pünktlich gewesen wäre,", "wäre ich nicht zu spät gekommen."]] },
      ],
      ex: [["Wenn ich ein Girokonto hätte, könnte ich online bezahlen.", "{Якби в мене був поточний рахунок, я міг би платити онлайн.|Якби в мене був поточний рахунок, я могла б платити онлайн.}"], ["Wenn ich das gewusst hätte, hätte ich den Vertrag gekündigt.", "{Якби я це знав, я б розірвав договір.|Якби я це знала, я б розірвала договір.}"], ["Hätte ich doch nur die Preise verglichen!", "{Якби ж то я порівняв ціни!|Якби ж то я порівняла ціни!}"]],
      warn: ["`Wenn ich hätte Zeit` — помилка: після `wenn` дієслово в кінці: `Wenn ich Zeit hätte, …`"],
    },
    {
      id: "bank", t: "Банк: рахунок, переказ, автосписання", cat: "rede",
      text: [
        "Поточний рахунок — `das Girokonto`. Кожен, хто легально живе в ЄС, має право на базовий рахунок (`das Basiskonto`), навіть без постійної адреси чи з боргами.",
        "Переказ (`die Überweisung`): одержувач, `IBAN`, сума, призначення платежу (`der Verwendungszweck`: номер рахунку чи клієнта). Регулярний переказ, наприклад за оренду, — `der Dauerauftrag`.",
        "Автосписання (`die Lastschrift`): ти дозволяєш фірмі знімати гроші з рахунку. Списання, якого ти не чекав, можна **повернути через банк протягом 8 тижнів**.",
        "Кредитна історія — `die SCHUFA`. Неоплачені рахунки й нагадування про борг (`die Mahnung`) її псують — тоді важче орендувати квартиру чи укласти договір.",
      ],
      ex: [["Ich möchte ein Konto eröffnen.", "Я хочу відкрити рахунок."], ["Ich möchte einen Dauerauftrag für die Miete einrichten.", "Я хочу налаштувати регулярний переказ для оренди."], ["Diese Lastschrift kenne ich nicht. Kann ich sie zurückgeben?", "Цього списання я не знаю. Можна його повернути?"]],
      tips: ["Банк ніколи не питає PIN чи TAN телефоном, у SMS або e-mail. Таке питання — шахрайство (розділ 42)."],
    },
    {
      id: "vertraege", t: "Договори й страховки: Laufzeit, Widerruf, Haftpflicht", cat: "rede",
      text: [
        "Договір на мобільний, інтернет чи спортзал: перший строк (`die Mindestlaufzeit`) — найчастіше до 24 місяців. Потім договір подовжується, але розірвати його можна **з місячним попередженням**. На сайтах фірм має бути кнопка розірвання.",
        "Договір, укладений онлайн, телефоном, біля дверей чи на вулиці, можна **відкликати протягом 14 днів** без причини (`das Widerrufsrecht`).",
        "Страхування відповідальності (`die Haftpflichtversicherung`) платить, якщо ти випадково зашкодив чужому — недороге й дуже рекомендоване. Страхування майна (`die Hausratversicherung`) — від крадіжки, пожежі, води. Медичне — обов’язкове для всіх; для авто — `die Kfz-Haftpflicht`.",
        "Про шкоду (`der Schaden`) повідомляй страховій якнайшвидше: що, коли, де, фото, рахунки.",
      ],
      tables: [
        { head: ["Слово", "Значення"], rows: [["die Mindestlaufzeit", "мінімальний строк договору"], ["die Kündigungsfrist", "строк попередження про розірвання"], ["das Widerrufsrecht", "право відкликати договір (14 днів)"], ["der Beitrag", "внесок, регулярна плата"], ["die Selbstbeteiligung", "частина шкоди, яку платиш сам"]] },
      ],
      ex: [["Hiermit kündige ich meinen Vertrag zum nächstmöglichen Termin.", "Цим я розриваю свій договір з найближчої можливої дати."], ["Bitte bestätigen Sie mir die Kündigung schriftlich.", "Будь ласка, підтвердіть мені розірвання письмово."], ["Ich möchte einen Schaden melden.", "Я хочу повідомити про шкоду."]],
    },
  ],
  phrases: [
    { t: "У банку", list: [["Ich möchte ein Basiskonto eröffnen.", "Я хочу відкрити базовий рахунок."], ["Welche Unterlagen brauche ich?", "Які документи мені потрібні?"], ["Kostet das Konto etwas?", "Рахунок платний?"]] },
    { t: "Договір", list: [["Wie lange ist die Mindestlaufzeit?", "Який мінімальний строк договору?"], ["Ich möchte den Vertrag widerrufen.", "Я хочу відкликати договір."], ["Ich habe eine Mahnung bekommen, aber ich habe schon bezahlt.", "{Я отримав нагадування про борг, але вже заплатив.|Я отримала нагадування про борг, але вже заплатила.}"]] },
    { t: "Жаль", list: [["Hätte ich das nur früher gewusst!", "{Якби ж я знав це раніше!|Якби ж я знала це раніше!}"], ["Das hätte nicht passieren dürfen.", "Цього не мало статися."], ["Nächstes Mal vergleiche ich die Preise.", "Наступного разу я порівняю ціни."]] },
  ],
  dialog: {
    t: "У банку",
    lines: [
      ["Bankberater", "Guten Tag, {Herr Schewtschenko|Frau Ukrajinka}. Was kann ich für Sie tun?", "Добрий день, {пане Шевченку|пані Українко}. Чим можу допомогти?"],
      ["{Taras|Lessja}", "Guten Tag. Auf meinem Kontoauszug ist eine Lastschrift über 49,99 Euro, die ich nicht kenne.", "Добрий день. У моїй виписці є списання на 49,99 євро, якого я не знаю."],
      ["Bankberater", "Zeigen Sie mal … Das ist ein Mobilfunkanbieter. Haben Sie vielleicht einen neuen Handyvertrag?", "Покажіть-но … Це мобільний оператор. Може, у Вас новий договір на мобільний?"],
      ["{Taras|Lessja}", "Ach je! Vor zehn Tagen hat mich ein Mann vor dem Supermarkt angesprochen, und ich habe etwas unterschrieben. Ich dachte, das ist kostenlos.", "{Ой лишенько! Десять днів тому біля супермаркету до мене підійшов чоловік, і я щось підписав. Я думав, це безкоштовно.|Ой лишенько! Десять днів тому біля супермаркету до мене підійшов чоловік, і я щось підписала. Я думала, це безкоштовно.}"],
      ["Bankberater", "Einen Vertrag von der Straße können Sie innerhalb von 14 Tagen widerrufen. Dann sind Sie noch rechtzeitig.", "Договір, укладений на вулиці, можна відкликати протягом 14 днів. Тож Ви ще встигаєте."],
      ["{Taras|Lessja}", "Zum Glück! Hätte ich das Kleingedruckte doch nur gelesen!", "{На щастя! Якби ж то я прочитав дрібний шрифт!|На щастя! Якби ж то я прочитала дрібний шрифт!}"],
      ["Bankberater", "Schreiben Sie den Widerruf heute noch, am besten per Einschreiben. Die Lastschrift können Sie bis acht Wochen nach der Abbuchung zurückgeben.", "Напишіть відкликання ще сьогодні, найкраще рекомендованим листом. Списання можна повернути протягом восьми тижнів після нього."],
      ["{Taras|Lessja}", "Und wenn ich das nicht gemerkt hätte?", "{А якби я цього не помітив?|А якби я цього не помітила?}"],
      ["Bankberater", "Dann hätten Sie zwei Jahre lang jeden Monat 49,99 Euro bezahlt. Deshalb: Kontoauszüge regelmäßig prüfen!", "Тоді Ви б два роки щомісяця платили 49,99 євро. Тож регулярно перевіряйте виписки!"],
      ["{Taras|Lessja}", "Das mache ich ab jetzt. Kann ich auch einen Dauerauftrag für die Miete einrichten?", "Відтепер так і робитиму. А можна ще налаштувати регулярний переказ для оренди?"],
      ["Bankberater", "Natürlich. Ich brauche die IBAN Ihrer Vermieterin und den Verwendungszweck.", "Звісно. Мені потрібен IBAN Вашої орендодавиці й призначення платежу."],
      ["{Taras|Lessja}", "Hier, das steht alles im Mietvertrag.", "Ось, усе є в договорі оренди."],
    ],
  },
  tasks: [
    { t: "gap", q: "Wenn ich mehr Zeit ___, würde ich einen Kurs machen. (haben)", a: ["hätte"] },
    { t: "gap", q: "Wenn ich das gewusst hätte, ___ ich nicht unterschrieben.", a: ["hätte"] },
    { t: "gap", q: "Wenn der Bus pünktlich gewesen wäre, ___ ich nicht zu spät gekommen.", a: ["wäre"] },
    { t: "gap", q: "Ich hätte die Preise vergleichen ___. (варто було)", a: ["sollen"] },
    { t: "gap", q: "Für die Miete richte ich einen ___ ein. (регулярний переказ)", a: ["Dauerauftrag"] },
    { t: "gap", q: "Online-Verträge kann man innerhalb von 14 Tagen ___. (відкликати)", a: ["widerrufen"] },
    { t: "gap", q: "Hiermit ___ ich meinen Vertrag zum nächstmöglichen Termin. (kündigen)", a: ["kündige"] },
    { t: "gap", q: "Wenn ich du ___, würde ich die Lastschrift zurückgeben.", a: ["wäre"] },
    { t: "mc", q: "Як правильно?", o: ["Wenn ich hätte Zeit, ich würde helfen.", "Wenn ich Zeit hätte, ich würde helfen.", "Wenn ich Zeit hätte, würde ich helfen."], a: 2 },
    { t: "mc", q: "З рахунку списали 49,99 € від невідомої фірми. Що можна зробити?", o: ["Повернути списання через банк (до 8 тижнів) і з’ясувати, звідки воно", "Нічого: що списано, те пропало", "Закрити рахунок"], a: 0 },
    { t: "mc", q: "Дзвонить «банк» і просить назвати TAN «для перевірки». Що робити?", o: ["Назвати TAN, якщо голос ввічливий", "Покласти слухавку: банк такого не питає", "Назвати лише половину TAN"], a: 1 },
    { t: "mc", q: "Твій м’яч випадково розбив сусідові вікно. Яка страховка це покриє?", o: ["Krankenversicherung", "Hausratversicherung", "Haftpflichtversicherung"], a: 2 },
    { t: "mc", q: "`Mindestlaufzeit: 24 Monate` означає…", o: ["договір щонайменше на 24 місяці", "доставку за 24 місяці", "знижку на 24 місяці"], a: 0 },
    { t: "mc", q: "`Hätte ich doch nur die Preise verglichen!` Що відчуває той, хто це каже?", o: ["Радіє, що порівняв ціни", "Жалкує, що не порівняв ціни", "Планує порівняти ціни"], a: 1 },
    { t: "mc", q: "Мінімальний строк договору на спортзал минув. З яким попередженням тепер можна розірвати?", o: ["за місяць", "за рік", "лише через 24 місяці"], a: 0 },
  ],
};
