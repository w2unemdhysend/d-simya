// Розділ 37 (B1). Спеціаліст і лікарня: пасив у минулому (wurde operiert, ist operiert worden), пасив із модальними
// дієсловами, стан (ist geschlossen), направлення, госпіталізація й виписка.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 37, part: "B1.1", title: "Спеціаліст і лікарня", book: null,
  goals: [
    "розповідати, що з тобою зробили: Ich wurde operiert, Der Termin ist verschoben worden",
    "розуміти інструкції: Das Formular muss ausgefüllt werden",
    "читати таблички й листи: Die Praxis ist geschlossen, Der Antrag ist bearbeitet",
    "знати шлях до спеціаліста й у лікарні: направлення, обхід, виписка, доплата",
  ],
  grammar: [
    {
      id: "passivB1", t: "Пасив у минулому: wurde operiert, ist operiert worden", cat: "verb",
      text: [
        "Пасив (розділ 22): `werden` + Partizip II — важливо, що відбувається, а не хто це робить: `Der Patient wird untersucht.`",
        "Präteritum: `wurde` + Partizip II: `Ich **wurde** gestern **operiert**.` Це найчастіша форма пасиву в минулому, і в розмові теж.",
        "Perfekt: `sein` + Partizip II + **`worden`** (не `geworden`!): `Ich **bin** gestern **operiert worden**.`",
        "Хто зробив — `von` + Dativ: `Ich wurde **von** Dr. Schmidt untersucht.` Через що — `durch`: `Das Haus wurde durch ein Feuer beschädigt.`",
      ],
      tables: [
        { head: ["Час", "Будова", "Приклад"], rows: [["Präsens", "werden + Partizip II", "Der Arm wird geröntgt."], ["Präteritum", "wurde + Partizip II", "Der Arm wurde geröntgt."], ["Perfekt", "sein + Partizip II + worden", "Der Arm ist geröntgt worden."]] },
        { cap: "Форми wurde", head: ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"], rows: [["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"]] },
      ],
      ex: [["Mein Vater wurde letzte Woche am Knie operiert.", "Мого батька минулого тижня прооперували на коліні."], ["Das Blut wurde schon untersucht.", "Кров уже перевірили."], ["Der Termin ist leider verschoben worden.", "Прийом, на жаль, перенесли."], ["Ich wurde mit dem Krankenwagen ins Krankenhaus gebracht.", "Мене відвезла до лікарні швидка."]],
      warn: ["`Ich bin operiert geworden` — помилка: у пасиві Perfekt — `worden`: `Ich bin operiert worden.` А `geworden` — «став»: `Er ist Arzt geworden.`"],
    },
    {
      id: "passivModal", t: "Пасив із модальним дієсловом: muss ausgefüllt werden", cat: "verb",
      text: [
        "Модальне дієслово + Partizip II + `werden` у кінці: `Das Formular **muss ausgefüllt werden**.` — «Формуляр треба заповнити».",
        "Так пишуть у листах, інструкціях і на табличках: `Die Tabletten **müssen** nach dem Essen **genommen werden**.` `Hier **darf** nicht **geraucht werden**.`",
        "У минулому модальне дієслово в Präteritum: `Das Formular **musste** bis Freitag abgegeben werden.`",
        "Українською тут кажуть «треба», «можна», «не можна» + інфінітив.",
      ],
      tables: [
        { head: ["Модальне", "Приклад", "Значення"], rows: [["muss", "Die Karte muss vorgelegt werden.", "Картку треба пред’явити."], ["kann", "Der Termin kann online gebucht werden.", "Прийом можна забронювати онлайн."], ["darf … nicht", "Hier darf nicht telefoniert werden.", "Тут не можна телефонувати."], ["soll", "Die Wunde soll täglich gereinigt werden.", "Рану слід щодня очищати."]] },
      ],
      ex: [["Die Überweisung muss vor dem Termin abgegeben werden.", "Направлення треба здати до прийому."], ["Das Rezept kann in jeder Apotheke eingelöst werden.", "Рецепт можна отоварити в будь-якій аптеці."], ["In diesem Raum dürfen keine Handys benutzt werden.", "У цьому приміщенні не можна користуватися мобільними."]],
    },
    {
      id: "zustandspassiv", t: "Стан: Die Praxis ist geschlossen", cat: "verb",
      text: [
        "`sein` + Partizip II показує **результат** — стан після дії. `Die Tür **wird** geschlossen.` — двері зачиняють (дія). `Die Tür **ist** geschlossen.` — двері зачинені (стан).",
        "Так часто пишуть на табличках і в листах: `Die Praxis ist vom 1. bis 14. August geschlossen.` `Ihr Antrag ist bearbeitet.` `Alles ist erledigt.`",
        "Українська каже так само: «зачинено», «заповнено», «оплачено».",
      ],
      tables: [
        { head: ["Дія (werden)", "Стан (sein)"], rows: [["Die Praxis wird um 18 Uhr geschlossen.", "Die Praxis ist geschlossen."], ["Die Rechnung wird bezahlt.", "Die Rechnung ist bezahlt."], ["Das Formular wird ausgefüllt.", "Das Formular ist ausgefüllt."]] },
      ],
      ex: [["Wegen Urlaub geschlossen.", "Зачинено у зв’язку з відпусткою."], ["Ist der Termin schon bestätigt?", "Прийом уже підтверджено?"], ["Alle Felder sind ausgefüllt.", "Усі поля заповнено."]],
    },
    {
      id: "krankenhaus", t: "Спеціаліст і лікарня: направлення, обхід, виписка", cat: "rede",
      text: [
        "До спеціаліста (`der Facharzt`: кардіолог, ортопед…) часто йдуть із **направленням** від сімейного лікаря (`die Überweisung`). Не можеш знайти прийом? Служба `116117` (телефон і сайт) допомагає з терміном, особливо коли на направленні позначено терміновість.",
        "Планова госпіталізація (`die stationäre Aufnahme`): візьми направлення до лікарні (`die Einweisung`), картку страхової, список ліків, піжаму й речі для гігієни.",
        "У лікарні: відділення (`die Station`), лікарський обхід (`die Visite`), години відвідин (`die Besuchszeit`). Під час виписки (`die Entlassung`) дають лист для сімейного лікаря (`der Arztbrief`).",
        "Доплата за лікарню — 10 € за день, щонайбільше за 28 днів на рік. Якщо доплати за рік перевищують 2 % доходу (1 % для хронічно хворих), страхова звільняє від решти (`die Befreiung`), — тож зберігай квитанції.",
      ],
      ex: [["Ich habe eine Überweisung zum Kardiologen.", "У мене направлення до кардіолога."], ["Wann ist die Visite?", "Коли обхід?"], ["Wann darf ich nach Hause?", "Коли мені можна додому?"]],
      tips: ["Загроза життю — 112 (швидка й пожежна). Увечері чи у вихідні, коли практики зачинені, а стан не загрожує життю, — лікарська чергова служба 116117."],
    },
  ],
  phrases: [
    { t: "У спеціаліста", list: [["Mein Hausarzt hat mich überwiesen.", "Мій сімейний лікар дав мені направлення."], ["Ich brauche dringend einen Termin.", "Мені терміново потрібен прийом."], ["Muss ich nüchtern kommen?", "Мені треба прийти натщесерце?"]] },
    { t: "У лікарні", list: [["Ich soll heute aufgenommen werden.", "Мене мають сьогодні госпіталізувати."], ["Ich habe starke Schmerzen. Können Sie bitte den Arzt rufen?", "У мене сильний біль. Можете, будь ласка, покликати лікаря?"], ["Wann sind die Besuchszeiten?", "Коли години відвідин?"]] },
    { t: "Ліки", list: [["Wie oft muss ich die Tabletten nehmen?", "Як часто треба приймати таблетки?"], ["Ich vertrage dieses Medikament nicht.", "Я погано переношу ці ліки."], ["Ich habe eine Allergie gegen Penicillin.", "У мене алергія на пеніцилін."]] },
  ],
  dialog: {
    t: "У лікарні після операції",
    lines: [
      ["Pfleger", "Guten Morgen, {Herr Schewtschenko|Frau Ukrajinka}! Wie geht es Ihnen heute?", "Доброго ранку, {пане Шевченку|пані Українко}! Як Ви сьогодні?"],
      ["{Taras|Lessja}", "Besser, danke. Aber die Hand tut noch weh, besonders in der Nacht.", "Краще, дякую. Але рука ще болить, особливо вночі."],
      ["Pfleger", "Das ist normal. Sie sind ja erst gestern operiert worden. Ich bringe Ihnen gleich eine Schmerztablette.", "Це нормально. Вас же тільки вчора прооперували. Я зараз принесу Вам знеболювальне."],
      ["{Taras|Lessja}", "Danke. Wie lange muss ich noch im Krankenhaus bleiben?", "Дякую. Скільки мені ще бути в лікарні?"],
      ["Pfleger", "Das entscheidet die Ärztin bei der Visite um zehn. Wahrscheinlich dürfen Sie morgen nach Hause.", "Це вирішить лікарка на обході о десятій. Мабуть, завтра Вам можна буде додому."],
      ["{Taras|Lessja}", "Und was muss zu Hause beachtet werden?", "А що треба враховувати вдома?"],
      ["Pfleger", "Der Verband muss trocken bleiben, und die Fäden werden nach zwei Wochen beim Hausarzt gezogen. Das steht alles im Arztbrief.", "Пов’язка має лишатися сухою, а шви через два тижні зніме сімейний лікар. Усе це буде написано у виписці."],
      ["{Taras|Lessja}", "{Darf ich mit der Hand malen?|Darf ich mit der Hand schreiben?}", "{Мені можна малювати цією рукою?|Мені можна писати цією рукою?}"],
      ["Pfleger", "{Zwei Wochen lieber nicht. Aber malen Sie doch mit der linken!|Zwei Wochen lieber nicht. Aber Sie können ja diktieren!}", "{Два тижні краще ні. А Ви малюйте лівою!|Два тижні краще ні. Але Ви ж можете диктувати!}"],
      ["{Taras|Lessja}", "Gute Idee. Und muss ich für das Krankenhaus etwas bezahlen?", "Гарна ідея. А чи треба мені щось платити за лікарню?"],
      ["Pfleger", "Zehn Euro pro Tag. Die Rechnung wird Ihnen nach Hause geschickt.", "Десять євро за день. Рахунок Вам надішлють додому."],
      ["{Taras|Lessja}", "In Ordnung. Ach, wann sind die Besuchszeiten? Anna möchte vorbeikommen.", "Гаразд. Ой, а коли години відвідин? Анна хоче зайти."],
      ["Pfleger", "Von 14 bis 19 Uhr. Gute Besserung!", "З 14:00 до 19:00. Одужуйте!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich ___ gestern operiert. (werden, Präteritum)", a: ["wurde"] },
    { t: "gap", q: "Der Termin ist leider verschoben ___.", a: ["worden"] },
    { t: "gap", q: "Das Formular muss bis Freitag ausgefüllt ___.", a: ["werden"] },
    { t: "gap", q: "Hier darf nicht geraucht ___.", a: ["werden"] },
    { t: "gap", q: "Die Praxis ___ heute geschlossen. (стан)", a: ["ist"] },
    { t: "gap", q: "Ich wurde ___ Dr. Schmidt untersucht.", a: ["von"] },
    { t: "gap", q: "Mein Hausarzt hat mir eine ___ zum Kardiologen gegeben. (направлення)", a: ["Überweisung"] },
    { t: "gap", q: "Die Rechnung wird Ihnen nach Hause ___. (schicken)", a: ["geschickt"] },
    { t: "mc", q: "Як правильно?", o: ["Ich bin operiert geworden.", "Ich bin operiert worden.", "Ich habe operiert worden."], a: 1 },
    { t: "mc", q: "Табличка: `Wegen Urlaub vom 1. bis 14. August geschlossen.` Що це означає?", o: ["Практику закривають назавжди", "1–14 серпня прийом лише за записом", "Практика зачинена через відпустку з 1 по 14 серпня"], a: 2 },
    { t: "mc", q: "Субота, 22:00: у дитини температура 39 і болить вухо, життю нічого не загрожує. Куди звернутися?", o: ["Лікарська чергова служба 116117", "112", "Чекати до понеділка на сімейного лікаря"], a: 0 },
    { t: "mc", q: "`Die Tabletten müssen nach dem Essen genommen werden.` Що робити?", o: ["Приймати таблетки до їжі", "Приймати таблетки після їжі", "Купити таблетки після обіду"], a: 1 },
    { t: "mc", q: "`Die Visite` — це…", o: ["лікарський обхід", "відвідини родичів", "візит до сімейного лікаря"], a: 0 },
    { t: "mc", q: "Скільки доплачує за день у лікарні той, хто застрахований у державній страховій?", o: ["нічого", "10 €", "100 €"], a: 1 },
    { t: "mc", q: "`Ihr Antrag ist bearbeitet.` означає…", o: ["Заяву опрацьовують", "Заяву треба опрацювати", "Заяву опрацьовано"], a: 2 },
  ],
};
