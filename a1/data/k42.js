// Розділ 42 (B1). Інтернет і безпека: іменник із дієслова (das Lesen, beim Surfen, die Anmeldung), словотвір
// (-heit, -keit, un-, -los, -bar); фішинг і телефонні шахраї; думка «за і проти».
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 42, part: "B1.2", title: "Інтернет і безпека", book: null,
  goals: [
    "робити іменники з дієслів: das Bezahlen, beim Einkaufen, zum Einloggen, die Anmeldung",
    "розуміти нові слова з частин: Sicherheit, unbekannt, kostenlos, erreichbar",
    "розпізнавати фішинг і шахраїв і знати, що робити",
    "висловлювати думку з аргументами: Einerseits … andererseits",
  ],
  grammar: [
    {
      id: "nominal", t: "Іменник із дієслова: das Lesen, beim Surfen, die Anmeldung", cat: "noun",
      text: [
        "Будь-який інфінітив стає іменником **середнього роду** з великої літери: `lesen → das Lesen`, `parken → das Parken`. На табличках: `Parken verboten!` `Rauchen verboten!`",
        "З прийменником: `beim` (= bei dem) + такий іменник — «під час, коли»: `**Beim Surfen** ist mein Akku leer geworden.` `zum` + іменник — «для»: `Das Passwort brauche ich **zum Einloggen**.`",
        "Від багатьох дієслів є іменник на **-ung** (завжди `die`): `anmelden → die Anmeldung`, `bestellen → die Bestellung`, `zahlen → die Zahlung`.",
        "В офіційних текстах такі іменники часто замінюють підрядне речення: `nach dem Einloggen` = `nachdem Sie sich eingeloggt haben`.",
      ],
      tables: [
        { head: ["Дієслово", "Інфінітив як іменник", "Іменник на -ung"], rows: [["anmelden", "das Anmelden", "die Anmeldung"], ["bezahlen", "das Bezahlen", "die Bezahlung"], ["speichern", "das Speichern", "die Speicherung"], ["überweisen", "das Überweisen", "die Überweisung"], ["herunterladen", "das Herunterladen", "—"]] },
      ],
      ex: [["Beim Einkaufen im Internet bin ich vorsichtig.", "{Купуючи в інтернеті, я обережний.|Купуючи в інтернеті, я обережна.}"], ["Zum Bezahlen brauchen Sie eine TAN.", "Для оплати Вам потрібен TAN."], ["Nach der Anmeldung bekommen Sie eine E-Mail.", "Після реєстрації Ви отримаєте e-mail."]],
    },
    {
      id: "wortbildung", t: "Слова з частин: -heit, -keit, un-, -los, -bar", cat: "noun",
      text: [
        "Іменники **жіночого роду**: `-heit` (`frei → die Freiheit`, `sicher → die Sicherheit`), `-keit` (`möglich → die Möglichkeit`, `pünktlich → die Pünktlichkeit`), `-ung`, `-schaft` (`der Freund → die Freundschaft`). Усі вони — `die`.",
        "Прикметники: `un-` — заперечення (`unsicher`, `unbekannt`); `-los` — «без» (`kostenlos`, `arbeitslos`, `kabellos`); `-bar` — «можна» (`erreichbar` — до кого можна додзвонитися, `zahlbar`).",
        "Коли знаєш частини, розумієш нове слово без словника: `passwortgeschützt` = Passwort + geschützt — «захищений паролем».",
      ],
      tables: [
        { head: ["Частина", "Значення", "Приклади"], rows: [["-heit / -keit", "іменник, die", "die Sicherheit, die Möglichkeit"], ["-schaft", "іменник, die", "die Freundschaft, die Nachbarschaft"], ["un-", "не-", "unsicher, unbekannt"], ["-los", "без-", "kostenlos, arbeitslos"], ["-bar", "можна …", "erreichbar, zahlbar"]] },
      ],
      ex: [["Ihre Sicherheit ist uns wichtig.", "Ваша безпека для нас важлива."], ["Der Absender ist mir unbekannt.", "Відправник мені невідомий."], ["Ab 18 Uhr bin ich nicht mehr erreichbar.", "Після 18:00 до мене вже не додзвонитися."]],
    },
    {
      id: "betrug", t: "Шахраї: фішинг, «новий номер», фальшиві поліцейські", cat: "rede",
      text: [
        "Фішинг (`das Phishing`): e-mail чи SMS «від банку», «від пошти», «від податкової» з посиланням: `Ihr Konto wird gesperrt! Klicken Sie hier.` Не клацай. Відкрий сайт чи застосунок банку сам. Банк, поліція й установи ніколи не питають PIN, TAN чи пароль.",
        "«Привіт, мамо, це мій новий номер»: шахраї пишуть у месенджері від імені дитини й просять терміново переказати гроші. Подзвони дитині на **старий** номер.",
        "Фальшиві поліцейські телефонують (на екрані буває навіть 110) і просять віддати гроші чи прикраси «на зберігання». Справжня поліція так ніколи не робить: поклади слухавку й сам набери 110.",
        "Якщо вже сталося: одразу заблокуй картку (телефон блокування `116 116` або номер банку), зміни паролі, подай заяву в поліцію (`eine Anzeige erstatten`).",
      ],
      ex: [["Diese E-Mail ist bestimmt Phishing. Ich klicke nicht auf den Link.", "Цей e-mail точно фішинг. Я не клацаю на посилання."], ["Ich möchte meine Karte sperren lassen.", "Я хочу заблокувати свою картку."], ["Ich möchte eine Anzeige erstatten.", "Я хочу подати заяву в поліцію."]],
      tips: ["Сумніваєшся — спершу запитай когось, кому довіряєш, і нічого не переказуй. Справжня установа почекає."],
    },
    {
      id: "proContra", t: "За і проти: Einerseits … andererseits", cat: "rede",
      text: [
        "На B1 часто треба висловити думку з аргументами: на іспиті DTZ і в листі, на співбесіді, у розмові з сусідами.",
        "За: `Ein Vorteil ist, dass …` `Dafür spricht, dass …`. Проти: `Ein Nachteil ist, dass …` `Dagegen spricht, dass …`.",
        "Зважити: `Einerseits …, andererseits …` — «з одного боку …, з іншого …». Висновок: `Insgesamt finde ich …` `Für mich überwiegen die Vorteile.`",
        "Власний досвід робить думку сильнішою: `Ich habe die Erfahrung gemacht, dass …`.",
      ],
      tables: [
        { head: ["Що", "Як сказати"], rows: [["думка", "Ich bin der Meinung, dass … / Meiner Meinung nach …"], ["за", "Ein großer Vorteil ist, dass …"], ["проти", "Ein Nachteil ist, dass …"], ["з одного й іншого боку", "Einerseits …, andererseits …"], ["висновок", "Insgesamt finde ich, dass …"]] },
      ],
      ex: [["Einerseits ist Online-Banking praktisch, andererseits muss man sehr vorsichtig sein.", "З одного боку, онлайн-банкінг зручний, з іншого — треба бути дуже обережним."], ["Ein Vorteil von sozialen Medien ist, dass man mit der Familie in Kontakt bleibt.", "Перевага соцмереж у тому, що можна підтримувати зв’язок із родиною."], ["Insgesamt überwiegen für mich die Vorteile.", "Загалом для мене переважають переваги."]],
    },
  ],
  phrases: [
    { t: "Безпека", list: [["Ich habe eine komische SMS bekommen.", "{Я отримав дивну SMS.|Я отримала дивну SMS.}"], ["Ist das eine echte E-Mail von der Bank?", "Це справжній e-mail від банку?"], ["Ich habe mein Passwort geändert.", "{Я змінив пароль.|Я змінила пароль.}"]] },
    { t: "Техніка", list: [["Mein Handy ist abgestürzt.", "Мій телефон завис."], ["Ich kann mich nicht einloggen.", "Я не можу увійти в акаунт."], ["Wie lade ich die App herunter?", "Як завантажити застосунок?"]] },
    { t: "Думка", list: [["Einerseits …, andererseits …", "З одного боку …, з іншого …"], ["Ein Vorteil ist, dass …", "Перевага в тому, що …"], ["Ich habe die Erfahrung gemacht, dass …", "{На власному досвіді я переконався, що …|На власному досвіді я переконалася, що …}"]] },
  ],
  dialog: {
    t: "Підозріла SMS",
    lines: [
      ["Max", "Schau mal! Ich habe eine SMS von meiner Bank bekommen: „Ihr Konto wird gesperrt. Bestätigen Sie Ihre Daten unter diesem Link.“", "Глянь! Мені прийшла SMS від мого банку: «Ваш рахунок буде заблоковано. Підтвердіть свої дані за цим посиланням»."],
      ["{Taras|Lessja}", "Stopp, nicht klicken! Das ist bestimmt Phishing. Schau mal auf den Absender – eine ganz komische Nummer.", "Стоп, не клацай! Це точно фішинг. Глянь на відправника — дуже дивний номер."],
      ["Max", "Stimmt … Aber woher wissen die, dass ich bei dieser Bank bin?", "Справді … Але звідки вони знають, що я в цьому банку?"],
      ["{Taras|Lessja}", "Das wissen sie nicht. Sie schicken die gleiche SMS an Tausende Leute. Beim Raten haben sie manchmal Glück.", "Не знають. Вони надсилають одну й ту саму SMS тисячам людей. Навмання іноді щастить."],
      ["Max", "Und was soll ich jetzt machen?", "І що мені тепер робити?"],
      ["{Taras|Lessja}", "Lösch die SMS. Wenn du unsicher bist, öffne die App deiner Bank selbst oder ruf die Nummer auf deiner Karte an.", "Видали SMS. Якщо не впевнений, сам відкрий застосунок свого банку або подзвони за номером на картці."],
      ["Max", "Gut, dass du da bist! Letzte Woche hat meine Oma einen Anruf von einem falschen Polizisten bekommen.", "Добре, що ти поруч! Минулого тижня моїй бабусі дзвонив фальшивий поліцейський."],
      ["{Taras|Lessja}", "Oh nein! Hat sie ihm Geld gegeben?", "О ні! Вона дала йому гроші?"],
      ["Max", "Nein, zum Glück nicht. Sie hat einfach aufgelegt und die 110 angerufen.", "Ні, на щастя. Вона просто поклала слухавку й набрала 110."],
      ["{Taras|Lessja}", "Kluge Frau! Einerseits ist das Internet super praktisch, andererseits muss man heute wirklich vorsichtig sein.", "Розумна жінка! З одного боку, інтернет дуже зручний, з іншого — сьогодні треба бути справді обережним."],
      ["Max", "Da hast du recht. Ich ändere gleich alle meine Passwörter.", "Твоя правда. Зараз поміняю всі свої паролі."],
    ],
  },
  tasks: [
    { t: "gap", q: "___ Surfen ist mein Akku leer geworden. (під час)", a: ["Beim", "beim"] },
    { t: "gap", q: "Das Passwort brauche ich ___ Einloggen. (для)", a: ["zum"] },
    { t: "gap", q: "anmelden → die ___", a: ["Anmeldung"] },
    { t: "gap", q: "möglich → die ___", a: ["Möglichkeit"] },
    { t: "gap", q: "sicher → die ___", a: ["Sicherheit"] },
    { t: "gap", q: "Das kostet nichts, es ist ___.", a: ["kostenlos"] },
    { t: "gap", q: "___ ist das Internet praktisch, andererseits gefährlich.", a: ["Einerseits", "einerseits"] },
    { t: "gap", q: "Ich möchte meine Karte ___ lassen. (заблокувати)", a: ["sperren"] },
    { t: "mc", q: "SMS: `Ihr Paket wartet. Zahlen Sie 1,99 € Zollgebühr unter diesem Link.` Що робити?", o: ["Заплатити — це ж дешево", "Не клацати й видалити: це шахрайство", "Надіслати у відповідь номер картки"], a: 1 },
    { t: "mc", q: "У месенджері: «Привіт, мамо, це мій новий номер, терміново потрібні гроші». Що робити?", o: ["Подзвонити дитині на старий номер", "Одразу переказати гроші", "Надіслати фото картки"], a: 0 },
    { t: "mc", q: "Дзвонить «поліція» й просить віддати гроші на зберігання. Що правда?", o: ["Треба віддати, це закон", "Віддати половину", "Справжня поліція так не робить: покласти слухавку й самому набрати 110"], a: 2 },
    { t: "mc", q: "Слово `erreichbar` означає…", o: ["той, до кого можна додзвонитися", "досяжний пішки", "дорогий"], a: 0 },
    { t: "mc", q: "Який рід у слів на `-heit`, `-keit`, `-ung`?", o: ["завжди der", "завжди die", "завжди das"], a: 1 },
    { t: "mc", q: "`Parken verboten!` означає…", o: ["Парк зачинено", "Паркування безкоштовне", "Паркуватися заборонено"], a: 2 },
  ],
};
