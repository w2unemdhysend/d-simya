// Розділ 27 (A2). Медіа й листування: дієслова з прийменниками (warten auf, denken an, sich interessieren für),
// worauf? — darauf, телефон та інтернет, особистий і офіційний лист.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Справжнє: Леся Українка перекладала
// вірші Генріха Гайне; «Кобзар» — книжка Тараса Шевченка (1840).
export default {
  n: 27, part: "A2.2", title: "Медіа й листування", book: null,
  goals: [
    "вживати дієслова з прийменниками: warten auf, denken an, sich interessieren für",
    "питати й відповідати про речі: Worauf wartest du? – Darauf.",
    "говорити про телефон, інтернет і повідомлення",
    "писати короткий особистий чи офіційний лист",
  ],
  grammar: [
    {
      id: "verbPraep", t: "Дієслова з прийменниками: warten auf, denken an", cat: "verb",
      text: [
        "Багато дієслів мають «свій» прийменник, і його треба вчити разом із дієсловом — як українське «чекати **на**», «думати **про**». Часто німецький прийменник інший, ніж український!",
        "Відмінок після прийменника теж «свій»: з `auf, über, an, für` у таких дієсловах переважно Akkusativ, з `mit, von, nach, vor` — Dativ.",
      ],
      tables: [
        { head: ["Дієслово", "Відмінок", "Українською"], rows: [["warten auf", "Akk.", "чекати на"], ["denken an", "Akk.", "думати про"], ["sich interessieren für", "Akk.", "цікавитися (чим)"], ["sprechen über", "Akk.", "говорити про"], ["sich freuen auf", "Akk.", "чекати з радістю (майбутнього)"], ["sich freuen über", "Akk.", "радіти (тому, що вже є)"], ["sich ärgern über", "Akk.", "сердитися через"], ["telefonieren mit", "Dat.", "розмовляти телефоном з"], ["Angst haben vor", "Dat.", "боятися (чого)"], ["fragen nach", "Dat.", "питати про"]] },
      ],
      ex: [["Ich warte auf den Bus.", "Я чекаю на автобус."], ["Ich denke oft an meine Familie.", "Я часто думаю про свою родину."], ["Interessierst du dich für Kunst?", "Ти цікавишся мистецтвом?"], ["Wir sprechen über das neue Buch.", "Ми говоримо про нову книжку."], ["Hast du Angst vor Hunden?", "Ти боїшся собак?"]],
      warn: ["`Ich warte für den Bus` — помилка: `warten auf`: `Ich warte auf den Bus.`", "«Я думаю про тебе» (згадую, сумую) — `Ich denke an dich.` А `denken über` — мати думку про щось: `Was denkst du über den Film?`"],
    },
    {
      id: "woDa", t: "Worauf? Darauf: питання й відповідь про речі", cat: "pron",
      text: [
        "Коли йдеться про **річ** чи подію, прийменник зливається з `wo-` (питання) або `da-` (відповідь): `Worauf wartest du? – Auf den Bus. – Ich warte schon lange **darauf**.`",
        "Якщо прийменник починається з голосної, між ними стоїть **-r-**: `wo**r**auf, wo**r**über, wo**r**an, da**r**auf, da**r**über, da**r**an`. Інакше без нього: `wofür, womit, wovon, dafür, damit, davon`.",
        "Про **людей** так не кажуть, а беруть прийменник і займенник: `Auf wen wartest du? – Auf Anna. – Ich warte auf sie.`",
      ],
      tables: [
        { head: ["Прийменник", "Питання (річ)", "Відповідь (річ)", "Людина"], rows: [["auf", "worauf?", "darauf", "auf wen? auf ihn"], ["über", "worüber?", "darüber", "über wen? über sie"], ["an", "woran?", "daran", "an wen? an ihn"], ["für", "wofür?", "dafür", "für wen? für sie"], ["mit", "womit?", "damit", "mit wem? mit ihm"], ["von", "wovon?", "davon", "von wem? von ihr"]] },
      ],
      ex: [["Worüber sprecht ihr? – Über den Film.", "Про що ви говорите? – Про фільм."], ["Freust du dich auf den Urlaub? – Ja, ich freue mich sehr darauf.", "Чекаєш на відпустку? – Так, дуже на неї чекаю."], ["Wofür interessierst du dich?", "Чим ти цікавишся?"], ["Mit wem telefonierst du? – Mit meiner Mutter.", "З ким ти розмовляєш телефоном? – З мамою."]],
      warn: ["`Auf was wartest du?` кажуть у розмові, але нейтрально й правильно — `Worauf wartest du?`"],
    },
    {
      id: "medien", t: "Телефон, інтернет, повідомлення", cat: "rede",
      text: [
        "`das Handy` — мобільний телефон (саме так кажуть у Німеччині), `das Smartphone`, `die App`, `das WLAN` (вай-фай), `das Passwort`, `der Akku` (акумулятор), `herunterladen` (завантажити), `hochladen` (вивантажити), `teilen` (поділитися).",
        "`eine Nachricht schicken` — надіслати повідомлення, `anrufen` — дзвонити, `zurückrufen` — передзвонити, `die Mailbox` — голосова пошта.",
        "Безпека: нікому не повідомляй пароль і коди з SMS. Банк і поліція ніколи їх не питають — так говорять лише шахраї.",
      ],
      ex: [["Gibt es hier WLAN? Wie ist das Passwort?", "Тут є вай-фай? Який пароль?"], ["Ich schicke dir die Fotos gleich.", "Я зараз надішлю тобі фото."], ["Mein Akku ist leer.", "У мене сів акумулятор."], ["Kannst du mich später zurückrufen?", "Можеш передзвонити мені пізніше?"], ["Ich habe die App heruntergeladen.", "Я {завантажив|завантажила} застосунок."]],
    },
    {
      id: "brief", t: "Лист: Liebe Anna… / Sehr geehrte Damen und Herren…", cat: "rede",
      text: [
        "Особистий лист: `Liebe Anna,` / `Lieber Max,` — після звертання кома, і перше речення починається з **малої** літери: `Liebe Anna, vielen Dank für…` У кінці — `Viele Grüße` або `Liebe Grüße` та ім’я.",
        "Офіційний лист: `Sehr geehrte Frau Krüger,` / `Sehr geehrter Herr Weber,`; якщо імені не знаєш — `Sehr geehrte Damen und Herren,`. У кінці — `Mit freundlichen Grüßen`. Звертання на `Sie`, і `Sie, Ihr, Ihnen` — з великої літери.",
        "На іспиті A2 треба написати коротке повідомлення чи e-mail на кілька речень: подякувати, запросити, відмовитися, перепросити або щось запитати.",
      ],
      ex: [["Liebe Anna, vielen Dank für deine Einladung!", "Люба Анно, щиро дякую за запрошення!"], ["Leider kann ich am Samstag nicht kommen.", "На жаль, у суботу я не зможу прийти."], ["Sehr geehrte Damen und Herren, ich habe eine Frage zu meinem Termin.", "Шановні пані та панове, у мене запитання щодо мого запису."], ["Mit freundlichen Grüßen, {Taras Schewtschenko|Lessja Ukrajinka}", "З повагою, {Тарас Шевченко|Леся Українка}"]],
      tips: ["`Liebe` — до жінки, `Lieber` — до чоловіка, `Liebe Freunde` — до кількох людей."],
    },
  ],
  phrases: [
    { t: "Телефон", list: [["Ich rufe dich später an.", "Я подзвоню тобі пізніше."], ["Ich kann dich schlecht verstehen.", "Я тебе погано чую."], ["Mein Akku ist fast leer.", "У мене майже сів акумулятор."], ["Schreib mir einfach eine Nachricht.", "Просто напиши мені повідомлення."]] },
    { t: "Інтереси", list: [["Wofür interessierst du dich?", "Чим ти цікавишся?"], ["Ich interessiere mich für Geschichte.", "Я цікавлюся історією."], ["Darüber möchte ich mehr wissen.", "Про це я хочу знати більше."], ["Ich freue mich schon darauf!", "Я вже з нетерпінням на це чекаю!"]] },
    { t: "Лист", list: [["Vielen Dank für deine Nachricht.", "Щиро дякую за повідомлення."], ["Ich freue mich auf deine Antwort.", "Чекаю на твою відповідь."], ["Viele Grüße", "Щиро вітаю (наприкінці листа)"]] },
  ],
  dialog: {
    t: "Подкаст про поезію",
    lines: [
      ["Max", "Hey! Worüber hast du gestern im Kurs gesprochen? Alle reden darüber!", "Привіт! Про що ти вчора {розповідав|розповідала} на курсі? Усі про це говорять!"],
      ["{Taras|Lessja}", "{Über meine Bilder. Ich habe ein Bild von meinem Dorf gezeigt.|Über Heinrich Heine. Ich habe vor vielen Jahren seine Gedichte übersetzt.}", "{Про свої картини. Я показав картину зі свого села.|Про Генріха Гайне. Колись давно я перекладала його вірші.}"],
      ["Max", "Cool! Interessierst du dich auch für Podcasts? Es gibt einen guten über Literatur.", "Круто! А подкастами ти теж цікавишся? Є хороший про літературу."],
      ["{Taras|Lessja}", "Ehrlich gesagt höre ich lieber Musik. Worum geht es in dem Podcast?", "Чесно кажучи, я більше люблю слухати музику. Про що цей подкаст?"],
      ["Max", "Um Dichter aus Osteuropa. Gestern ging es um den Kobsar!", "Про поетів зі Східної Європи. Учора йшлося про «Кобзаря»!"],
      ["{Taras|Lessja}", "{Wirklich? Darüber muss ich unbedingt mehr hören!|Den Kobsar kenne ich sehr gut. Darüber spreche ich gern!}", "{Справді? Про це мені конче треба почути більше!|«Кобзаря» я дуже добре знаю. Про нього я охоче поговорю!}"],
      ["Max", "Ich schicke dir den Link. Hast du gerade WLAN?", "Надішлю тобі посилання. У тебе зараз є вай-фай?"],
      ["{Taras|Lessja}", "Nein, und mein Akku ist fast leer. Schick ihn mir einfach, ich höre mir den Podcast heute Abend an.", "Ні, і акумулятор майже сів. Просто надішли, я послухаю подкаст увечері."],
      ["Max", "Mach ich! Und denk an Samstag: Wir gehen ins Kino.", "Добре! І пам’ятай про суботу: ми йдемо в кіно."],
      ["{Taras|Lessja}", "Keine Sorge, ich denke daran. Ich freue mich schon darauf!", "Не хвилюйся, я пам’ятаю. Уже чекаю з нетерпінням!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich warte ___ den Bus.", a: ["auf"] },
    { t: "gap", q: "Ich denke oft ___ meine Familie.", a: ["an"] },
    { t: "gap", q: "Interessierst du dich ___ Musik?", a: ["für"] },
    { t: "gap", q: "Wir sprechen ___ den Film.", a: ["über"] },
    { t: "gap", q: "Hast du Angst ___ Hunden?", a: ["vor"] },
    { t: "gap", q: "___ wartest du? – Auf den Zug.", a: ["Worauf", "worauf"] },
    { t: "gap", q: "Freust du dich auf den Urlaub? – Ja, ich freue mich sehr ___.", a: ["darauf"] },
    { t: "gap", q: "___ wem telefonierst du? – Mit meiner Mutter.", a: ["Mit", "mit"] },
    { t: "mc", q: "Як правильно?", o: ["Ich warte für dich.", "Ich warte auf dich.", "Ich warte an dich."], a: 1 },
    { t: "mc", q: "«Про кого ви говорите?»", o: ["Worüber sprecht ihr?", "Über wen sprecht ihr?", "Darüber sprecht ihr?"], a: 1, why: "Про людину — прийменник + wen/wem." },
    { t: "mc", q: "Як почати офіційний лист, якщо не знаєш імені?", o: ["Liebe Damen und Herren,", "Sehr geehrte Damen und Herren,", "Hallo zusammen,"], a: 1 },
    { t: "mc", q: "Як закінчити офіційний лист?", o: ["Mit freundlichen Grüßen", "Bis bald!", "Liebe Grüße"], a: 0 },
    { t: "mc", q: "«das Handy» — це…", o: ["мобільний телефон", "рукавичка", "ноутбук"], a: 0 },
  ],
};
