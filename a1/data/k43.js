// Розділ 43 (B1). У дорозі: falls і «у разі» (bei, im Fall), порівняння (so … wie, als, immer teurer); права й
// авто в Німеччині; що робити після аварії.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 43, part: "B1.2", title: "У дорозі: авто й аварія", book: null,
  goals: [
    "казати про можливу умову: falls, bei Glätte, im Fall eines Unfalls",
    "порівнювати: so … wie, schneller als, immer teurer",
    "знати про права, страховку й техогляд авто",
    "діяти після аварії: безпека, поліція, дані, свідки",
  ],
  grammar: [
    {
      id: "falls", t: "falls, bei, im Fall: «якщо раптом», «у разі»", cat: "satz",
      text: [
        "`wenn` — «якщо, коли». `falls` — «якщо раптом, на випадок якщо»: умова менш імовірна. Обидва відкривають підрядне речення, дієслово в кінці: `Falls der Zug ausfällt, nehme ich den Bus.`",
        "Коротше — прийменником: `bei` + Dativ (`bei Regen`, `bei Glätte` — в ожеледицю, `bei einem Unfall`) або `im Fall` + Genitiv (`im Fall eines Unfalls`).",
        "В інструкціях умову часто кажуть без сполучника — дієслово на першому місці: `Fährt der Bus nicht, nehmen Sie die Bahn.` = `Wenn der Bus nicht fährt, …`",
      ],
      tables: [
        { head: ["Як сказати", "Приклад"], rows: [["wenn", "Wenn es regnet, fahre ich mit dem Bus."], ["falls", "Falls es glatt ist, fahre ich langsam."], ["bei + Dativ", "Bei Glätte bitte langsam fahren."], ["im Fall + Genitiv", "Im Fall eines Unfalls rufen Sie 112."]] },
      ],
      ex: [["Falls ich mich verspäte, rufe ich dich an.", "Якщо раптом запізнюся, подзвоню тобі."], ["Bei Nebel muss man das Licht einschalten.", "У туман треба вмикати фари."], ["Falls die Polizei kommt, zeigen Sie bitte Ihren Führerschein.", "Якщо приїде поліція, покажіть, будь ласка, посвідчення водія."]],
    },
    {
      id: "vergleich", t: "Порівняння: so … wie, als, immer teurer", cat: "adj",
      text: [
        "Однаково: `so` + прикметник + `wie`: `Das Auto ist **so** teuer **wie** eine kleine Wohnung.` Неоднаково: Komparativ + `als` (розділ 24): `Der Zug ist schneller **als** der Bus.`",
        "`nicht so … wie` — «не такий …, як»: `Das Fahrrad ist nicht so schnell wie das Auto.`",
        "`immer` + Komparativ — «дедалі …»: `Das Benzin wird **immer teurer**.` — «Бензин дедалі дорожчає».",
        "`je …, desto …` (розділ 36): `Je schneller man fährt, desto länger ist der Bremsweg.`",
      ],
      tables: [
        { head: ["Що", "Будова", "Приклад"], rows: [["однаково", "so … wie", "so schnell wie"], ["неоднаково", "nicht so … wie", "nicht so teuer wie"], ["більше / менше", "Komparativ + als", "schneller als"], ["дедалі більше", "immer + Komparativ", "immer teurer"], ["найбільше", "am …sten", "am schnellsten"]] },
      ],
      ex: [["Mit dem Deutschlandticket ist der Zug oft billiger als das Auto.", "З Deutschlandticket потяг часто дешевший за авто."], ["Mein altes Auto fährt nicht so schnell wie dein neues.", "Моя стара машина їздить не так швидко, як твоя нова."], ["Die Staus werden immer länger.", "Затори стають дедалі довшими."]],
      warn: ["`schneller wie` у розмові чути, але правильно `schneller als`. А `so schnell als` — помилка: `so schnell wie`."],
    },
    {
      id: "fuehrerschein", t: "Права й авто: посвідчення, страховка, техогляд", cat: "rede",
      text: [
        "Українське посвідчення водія в Німеччині визнають, поки діє тимчасовий захист; обмінювати його не обов’язково. Правила можуть змінитися — уточнюй у відділі посвідчень водія (`die Führerscheinstelle`) свого округу.",
        "Нові права: автошкола (`die Fahrschule`), курс першої допомоги, теоретичний і практичний іспити.",
        "Для авто обов’язкові: страхування відповідальності (`die Kfz-Haftpflicht`), реєстрація (`die Zulassung`), податок (`die Kfz-Steuer`) і техогляд раз на два роки (`die Hauptuntersuchung`, у розмові `der TÜV`).",
        "В авто мають бути аптечка (`der Verbandskasten`), знак аварійної зупинки (`das Warndreieck`) і жилет (`die Warnweste`). В ожеледицю й сніг — лише зимові шини (`die Winterreifen`).",
      ],
      ex: [["Wo kann ich meinen Führerschein umschreiben lassen?", "Де я можу обміняти своє посвідчення водія?"], ["Mein Auto muss nächsten Monat zum TÜV.", "Наступного місяця моїй машині на техогляд."], ["Ich brauche neue Winterreifen.", "Мені потрібні нові зимові шини."]],
    },
    {
      id: "unfall", t: "Після аварії: що робити й що казати", cat: "rede",
      text: [
        "1) Зупинись, увімкни аварійку (`die Warnblinkanlage`), одягни жилет, постав знак. 2) Є поранені — `112`, допомагай, як можеш. 3) Поліція — `110`, особливо коли є поранені, великі збитки чи суперечка.",
        "Обміняйтеся даними: ім’я, адреса, номер авто, страхова. Сфотографуй місце й пошкодження, запиши свідків (`die Zeugen`). Зручно заповнити європейський протокол (`der Europäische Unfallbericht`).",
        "Не підписуй на місці визнання вини (`das Schuldanerkenntnis`) і не обіцяй заплатити. Повідом свою страхову протягом тижня.",
        "Поїхати без даних — злочин (`die Fahrerflucht`), навіть якщо лише подряпав припарковане авто. Записки за склоочисником замало: зачекай власника або виклич поліцію.",
      ],
      ex: [["Es gab einen Unfall auf der B57. Niemand ist verletzt.", "На трасі B57 сталася аварія. Ніхто не постраждав."], ["Können wir unsere Daten austauschen?", "Можемо обмінятися даними?"], ["Ich möchte zuerst mit meiner Versicherung sprechen.", "Спершу я хочу поговорити зі своєю страховою."]],
    },
  ],
  phrases: [
    { t: "У дорозі", list: [["Wie komme ich am schnellsten nach Wesel?", "Як найшвидше доїхати до Везеля?"], ["Auf der A57 ist Stau.", "На автобані A57 затор."], ["Der Zug fällt aus. Wir nehmen den Ersatzverkehr.", "Потяг скасовано. Їдемо замінним транспортом."]] },
    { t: "Після аварії", list: [["Ist jemand verletzt?", "Хтось поранений?"], ["Bitte rufen Sie die Polizei.", "Будь ласка, викличте поліцію."], ["Hier sind meine Versicherungsdaten.", "Ось дані моєї страховки."]] },
    { t: "Авто", list: [["Wo ist die nächste Tankstelle?", "Де найближча заправка?"], ["Die Werkstatt hat angerufen: Das Auto ist fertig.", "Дзвонили з майстерні: машина готова."], ["Der Reifen hat keine Luft mehr.", "Шина спустила."]] },
  ],
  dialog: {
    t: "Невелика аварія",
    lines: [
      ["Polizist", "Guten Tag. Sie haben uns angerufen. Ist jemand verletzt?", "Добрий день. Ви нам телефонували. Хтось поранений?"],
      ["{Taras|Lessja}", "Nein, zum Glück nicht. Aber mein Auto ist hinten kaputt.", "Ні, на щастя. Але моя машина ззаду пошкоджена."],
      ["Polizist", "Erzählen Sie bitte, was passiert ist.", "Розкажіть, будь ласка, що сталося."],
      ["{Taras|Lessja}", "Ich habe an der Ampel gewartet, weil sie rot war. Plötzlich ist der Mann im blauen Auto hinten auf mich aufgefahren.", "{Я чекав на світлофорі, бо горів червоний. Раптом чоловік у синій машині в’їхав у мене ззаду.|Я чекала на світлофорі, бо горів червоний. Раптом чоловік у синій машині в’їхав у мене ззаду.}"],
      ["Polizist", "Gibt es Zeugen?", "Є свідки?"],
      ["{Taras|Lessja}", "Ja, die Frau dort hat alles gesehen. Sie hat mir ihre Telefonnummer gegeben.", "Так, он та жінка все бачила. Вона дала мені свій номер телефону."],
      ["Polizist", "Gut. Ich brauche Ihren Führerschein, den Fahrzeugschein und Ihren Ausweis.", "Добре. Мені потрібні Ваше посвідчення водія, техпаспорт і посвідчення особи."],
      ["{Taras|Lessja}", "Hier, bitte. Mein Führerschein ist aus der Ukraine. Ist das ein Problem?", "Ось, будь ласка. Моє посвідчення водія — з України. Це проблема?"],
      ["Polizist", "Nein, mit Ihrem Schutzstatus gilt er. Der andere Fahrer sagt, Sie hätten plötzlich gebremst.", "Ні, з Вашим статусом захисту воно дійсне. Інший водій каже, ніби Ви раптово загальмували."],
      ["{Taras|Lessja}", "Das stimmt nicht. Ich stand ja schon. Muss ich hier etwas unterschreiben?", "{Це неправда. Я ж уже стояв. Мені треба тут щось підписувати?|Це неправда. Я ж уже стояла. Мені треба тут щось підписувати?}"],
      ["Polizist", "Unterschreiben Sie kein Schuldanerkenntnis. Wir nehmen den Unfall auf, und die Versicherungen klären den Rest.", "Не підписуйте визнання вини. Ми оформимо аварію, а решту владнають страхові."],
      ["{Taras|Lessja}", "Danke. Dann melde ich mich heute noch bei meiner Versicherung.", "Дякую. Тоді ще сьогодні повідомлю свою страхову."],
      ["Polizist", "Machen Sie das. Und fahren Sie vorsichtig: Bei Regen ist die Straße glatt.", "Так і зробіть. І їдьте обережно: у дощ дорога слизька."],
    ],
  },
  tasks: [
    { t: "gap", q: "___ der Zug ausfällt, nehme ich den Bus. (якщо раптом)", a: ["Falls", "falls"] },
    { t: "gap", q: "___ Glätte bitte langsam fahren. (у разі)", a: ["Bei", "bei"] },
    { t: "gap", q: "Der Zug ist schneller ___ der Bus.", a: ["als"] },
    { t: "gap", q: "Das Fahrrad ist nicht so schnell ___ das Auto.", a: ["wie"] },
    { t: "gap", q: "Das Benzin wird immer ___. (teuer)", a: ["teurer"] },
    { t: "gap", q: "Wie komme ich am ___ nach Wesel? (schnell)", a: ["schnellsten"] },
    { t: "gap", q: "Gibt es ___? – Ja, die Frau dort hat alles gesehen. (свідки)", a: ["Zeugen"] },
    { t: "gap", q: "Bei einem Unfall mit Verletzten ruft man sofort die ___.", a: ["112"] },
    { t: "mc", q: "Як правильно?", o: ["so teuer als eine Wohnung", "so teuer wie eine Wohnung", "teurer wie eine Wohnung"], a: 1 },
    { t: "mc", life: true, q: "На парковці ти зачепив(-ла) чуже авто, власника немає. Що робити?", o: ["Залишити записку й поїхати", "Поїхати: подряпина маленька", "Зачекати власника або викликати поліцію — записки замало"], a: 2 },
    { t: "mc", life: true, q: "Після аварії інший водій просить підписати папір «Я винен». Що краще?", o: ["Не підписувати визнання вини, лише обмінятися даними", "Підписати, щоб швидше закінчити", "Підписати й заплатити готівкою"], a: 0 },
    { t: "mc", life: true, q: "Що обов’язково має бути в авто в Німеччині?", o: ["лише запасне колесо", "аптечка, знак аварійної зупинки й жилет", "вогнегасник і лопата"], a: 1 },
    { t: "mc", q: "`Die Staus werden immer länger.` означає…", o: ["Затори завжди довгі", "Затори тривають довше за всіх", "Затори стають дедалі довшими"], a: 2 },
    { t: "mc", q: "`Im Fall eines Unfalls rufen Sie 112.` — `im Fall` означає…", o: ["у разі", "після", "замість"], a: 0 },
    { t: "mc", life: true, q: "Застосунок DB: `Ersatzverkehr mit Bussen zwischen Xanten und Rheinberg`", o: ["між Ксантеном і Райнбергом замість потяга їздять автобуси", "автобуси скасовано", "потяг їде швидше"], a: 0 },
    { t: "mc", life: true, q: "Дорожній знак: `Umleitung`", o: ["об’їзд", "кінець дороги", "паркування"], a: 0 },
  ],
};
