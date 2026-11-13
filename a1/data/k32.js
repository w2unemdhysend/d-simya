// Розділ 32 (A2). Повторення й іспит: усі форми дієслова рівня A2 однією таблицею, сполучники й порядок слів,
// прийменники за відмінками, іспит Goethe-Zertifikat A2 (частини, час, бали) і як учитися далі.
// Дані про іспит — з goethe.de: Hören, Lesen, Schreiben по 30 хв, Sprechen близько 15 хв у парі; 100 балів
// (75 письмова частина, 25 усна), скласти — щонайменше 60, з них не менше 45 письмово й 15 усно.
export default {
  n: 32, part: "A2.2", title: "Повторення й іспит A2", book: null,
  goals: [
    "повторити всі форми дієслова рівня A2",
    "повторити сполучники й порядок слів",
    "знати, з чого складається іспит Goethe-Zertifikat A2",
    "знати, як учитися далі до рівня B1",
  ],
  grammar: [
    {
      id: "zeitenA2", t: "Усі форми дієслова A2 однією таблицею", cat: "verb",
      text: [
        "Шість форм дієслова, які треба знати на рівні A2. Кожну пояснено в своєму розділі — торкнись теми в розділі «Граматика», щоб повернутися до неї.",
      ],
      tables: [
        { head: ["Форма", "Приклад", "Коли вживати"], rows: [["Präsens", "Ich lerne Deutsch.", "тепер, звичка, найближче майбутнє"], ["Perfekt", "Ich habe Deutsch gelernt.", "минуле в розмові (розділи 9–10)"], ["Präteritum", "Ich war müde. Ich musste lernen.", "sein, haben, модальні; книжки (розділи 17, 26)"], ["Futur I", "Ich werde Deutsch lernen.", "план, обіцянка, припущення (розділ 31)"], ["Passiv", "Hier wird Deutsch gesprochen.", "дія без виконавця (розділ 22)"], ["Konjunktiv II", "Ich würde gern… Könnten Sie…?", "ввічливість, порада, мрія (розділ 28)"]] },
      ],
      ex: [["Ich lerne jeden Tag Deutsch.", "Я щодня вчу німецьку."], ["Gestern habe ich zwei Stunden gelernt.", "Учора я дві години {учився|училася}."], ["Als Kind konnte ich kein Deutsch.", "{У дитинстві я не знав німецької.|У дитинстві я не знала німецької.}"], ["Nächstes Jahr werde ich die B1-Prüfung machen.", "Наступного року я складатиму іспит B1."], ["Ich würde gern noch besser sprechen.", "{Я хотів би|Я хотіла б} говорити ще краще."]],
    },
    {
      id: "konnektoren", t: "Сполучники A2 і місце дієслова", cat: "satz",
      text: [
        "**Дієслово в кінець** (підрядне речення): `weil, dass, ob, wenn, als, seit, bis` і відносні `der, die, das`: `…, weil ich müde **bin**.`",
        "**Дієслово на другому місці, як звичайно**: `und, aber, oder, denn, sondern` — вони стоять «на нульовому місці»: `…, denn ich **bin** müde.`",
        "**Дієслово одразу після слова**: `deshalb, trotzdem, dann, danach, zuerst` — вони займають перше місце: `…, deshalb **bleibe** ich zu Hause.`",
      ],
      tables: [
        { head: ["Сполучник", "Значення", "Приклад"], rows: [["weil", "бо", "…, weil ich krank bin."], ["dass", "що", "Ich glaube, dass er kommt."], ["ob", "чи", "Weißt du, ob sie Zeit hat?"], ["wenn", "коли (щоразу), якщо", "Wenn ich Zeit habe, lese ich."], ["als", "коли (раз у минулому)", "Als ich klein war, …"], ["denn", "бо (без зміни порядку)", "…, denn ich bin krank."], ["deshalb", "тому (дієслово одразу після)", "…, deshalb bleibe ich hier."], ["trotzdem", "все одно", "…, trotzdem gehe ich mit."]] },
      ],
      ex: [["Ich bleibe zu Hause, weil ich krank bin.", "Я лишаюся вдома, бо хворію."], ["Ich bleibe zu Hause, denn ich bin krank.", "Я лишаюся вдома, бо хворію."], ["Ich bin krank, deshalb bleibe ich zu Hause.", "Я хворію, тому лишаюся вдома."], ["Ich bin krank, trotzdem gehe ich zum Kurs.", "Я хворію, але все одно йду на курс."]],
    },
    {
      id: "praepA2", t: "Прийменники: з Akkusativ, з Dativ і з обома", cat: "prep",
      text: [
        "Прийменники треба знати разом із відмінком. Їх лише три групи — запам’ятай їх як три коротенькі списки.",
        "Після прийменника з Dativ прикметник завжди має **-en** (розділ 21), а в множині іменник отримує **-n**: `mit den neuen Freunden`.",
      ],
      tables: [
        { head: ["Група", "Прийменники", "Приклад"], rows: [["лише Akkusativ", "durch, für, gegen, ohne, um", "für meinen Bruder"], ["лише Dativ", "aus, bei, mit, nach, seit, von, zu", "mit meiner Freundin"], ["куди? — Akk., де? — Dat.", "an, auf, hinter, in, neben, über, unter, vor, zwischen", "in die Stadt / in der Stadt"]] },
      ],
      ex: [["Das Geschenk ist für meinen Vater.", "Подарунок для мого тата."], ["Ich fahre mit dem Bus zur Arbeit.", "Я їду на роботу автобусом."], ["Ich hänge das Bild an die Wand.", "Я вішаю картину на стіну."], ["Das Bild hängt an der Wand.", "Картина висить на стіні."]],
    },
    {
      id: "pruefungA2", t: "Іспит Goethe-Zertifikat A2", cat: "rede",
      text: [
        "Іспит має чотири частини: **Hören** (слухання, 30 хв), **Lesen** (читання, 30 хв), **Schreiben** (письмо, 30 хв) і **Sprechen** (усна частина, близько 15 хв, у парі з іншим учасником).",
        "Максимум — **100 балів**: 75 за письмову частину й 25 за усну. Щоб скласти, треба щонайменше **60 балів**, з них не менше 45 за письмову частину й не менше 15 за усну.",
        "Усна частина: ви ставите одне одному запитання за картками, розповідаєте про себе й разом щось плануєте — наприклад, коли й куди піти.",
        "Поради: у письмовому завданні відповідай на **всі** пункти; перед слуханням прочитай запитання; в усній частині не бійся перепитати: `Können Sie das bitte wiederholen?`",
      ],
      ex: [["Was machen Sie in Ihrer Freizeit?", "Що Ви робите у вільний час?"], ["Wann hast du Zeit? – Am Samstag kann ich nicht, aber am Sonntag.", "Коли в тебе є час? – У суботу не можу, а в неділю — так."], ["Wie wäre es mit zehn Uhr?", "Як щодо десятої?"], ["Können Sie das bitte wiederholen?", "Повторіть, будь ласка."]],
    },
    {
      id: "weiterB1", t: "Як учитися далі: дорога до B1", cat: "rede",
      text: [
        "Після A2 — рівень **B1**: розуміти головне в розмовах про роботу, навчання й дозвілля, розповідати про досвід і пояснювати свої плани й думки.",
        "Щодня потроху: кілька нових слів (у словнику цього курсу кожне озвучене), десять хвилин слухання — наприклад, новини простою німецькою (`Nachrichten in einfacher Sprache`), коротке повідомлення німецькою комусь зі знайомих.",
        "Найкраще працює те, що повторюється: вправи цього курсу можна розв’язувати знову, а «Сад слів» допомагає повторювати іменники з артиклями.",
      ],
      ex: [["Ich lerne jeden Tag zehn neue Wörter.", "Я щодня вчу десять нових слів."], ["Ich höre Nachrichten in einfacher Sprache.", "Я слухаю новини простою мовою."], ["Ich spreche so oft wie möglich Deutsch.", "Я говорю німецькою якомога частіше."]],
    },
  ],
  phrases: [
    { t: "На іспиті", list: [["Können Sie das bitte wiederholen?", "Повторіть, будь ласка."], ["Entschuldigung, das habe ich nicht verstanden.", "Перепрошую, я цього не {зрозумів|зрозуміла}."], ["Was bedeutet das Wort?", "Що означає це слово?"], ["Darf ich etwas fragen?", "Можна запитати?"]] },
    { t: "Домовитися", list: [["Wann passt es dir?", "Коли тобі зручно?"], ["Am Montag kann ich leider nicht.", "У понеділок я, на жаль, не можу."], ["Wie wäre es mit Dienstag?", "Як щодо вівторка?"], ["Einverstanden!", "Домовилися!"]] },
    { t: "Після іспиту", list: [["Ich habe bestanden!", "Я {склав|склала}!"], ["Wann bekomme ich das Ergebnis?", "Коли я отримаю результат?"]] },
  ],
  dialog: {
    t: "Усний іспит",
    lines: [
      ["Prüferin", "Guten Tag! Wir beginnen mit Teil eins. Bitte stellen Sie sich gegenseitig Fragen. {Herr Schewtschenko|Frau Ukrajinka}, Sie beginnen.", "Добрий день! Почнімо з першої частини. Поставте, будь ласка, одне одному запитання. {Пане Шевченку|Пані Українко}, Ви починаєте."],
      ["{Taras|Lessja}", "Anna, auf meiner Karte steht „Wohnort“. Wo wohnst du?", "Анно, на моїй картці написано «Місце проживання». Де ти живеш?"],
      ["Anna", "Ich wohne in Xanten, schon seit meiner Kindheit. Und was machst du in deiner Freizeit?", "Я живу в Ксантені, ще з дитинства. А що ти робиш у вільний час?"],
      ["{Taras|Lessja}", "{Ich male und zeichne, am liebsten Landschaften.|Ich lese und schreibe, am liebsten Gedichte.}", "{Я малюю, найбільше люблю краєвиди.|Я читаю й пишу, найбільше люблю вірші.}"],
      ["Prüferin", "Danke. Jetzt Teil drei: Sie möchten zusammen einen Ausflug machen. Finden Sie einen Termin.", "Дякую. Тепер третя частина: ви хочете разом поїхати на прогулянку. Знайдіть час."],
      ["Anna", "Wie wäre es mit Samstag? Da hätte ich Zeit.", "Як щодо суботи? Тоді в мене є час."],
      ["{Taras|Lessja}", "Am Samstag kann ich leider nicht, da muss ich arbeiten. Geht es am Sonntag?", "У суботу я, на жаль, не можу: мушу працювати. А в неділю можна?"],
      ["Anna", "Sonntag passt. Wohin fahren wir? Entweder nach Köln oder an den Rhein?", "Неділя підходить. Куди поїдемо: до Кельна чи на Рейн?"],
      ["{Taras|Lessja}", "Lieber an den Rhein, weil das Wetter schön sein wird. Köln ist am Sonntag sehr voll.", "Краще на Рейн, бо погода буде гарна. А в Кельні в неділю дуже людно."],
      ["Anna", "Einverstanden! Dann treffen wir uns um zehn am Bahnhof.", "Домовилися! Тоді зустрінемося о десятій на вокзалі."],
      ["Prüferin", "Vielen Dank, das war alles. Das Ergebnis bekommen Sie in einigen Wochen.", "Дуже дякую, це все. Результат ви отримаєте за кілька тижнів."],
      ["", "…", "…"],
      ["{Taras|Lessja}", "Anna, schau mal in deine E-Mails! Wir haben bestanden!", "Анно, глянь пошту! Ми склали!"],
      ["Anna", "Wirklich? Herzlichen Glückwunsch! Jetzt haben wir A2!", "Справді? Вітаю! Тепер у нас A2!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Gestern ___ ich zwei Stunden gelernt. (haben)", a: ["habe"] },
    { t: "gap", q: "Als Kind ___ ich kein Deutsch. (können, Präteritum)", a: ["konnte"] },
    { t: "gap", q: "Ich glaube, ___ er heute kommt.", a: ["dass"] },
    { t: "gap", q: "Weißt du, ___ sie Zeit hat?", a: ["ob"] },
    { t: "gap", q: "Ich bleibe zu Hause, ___ ich krank bin.", a: ["weil"] },
    { t: "gap", q: "Das ist das Buch, ___ ich gerade lese.", a: ["das"] },
    { t: "gap", q: "Ich schenke ___ Freundin einen Schal. (meine)", a: ["meiner"] },
    { t: "gap", q: "Ich suche einen ___ Mantel. (warm)", a: ["warmen"] },
    { t: "gap", q: "Der Zug ist schneller ___ der Bus.", a: ["als"] },
    { t: "gap", q: "___ Sie mir bitte helfen? (können, ввічливо)", a: ["Könnten", "könnten"] },
    { t: "mc", q: "Скільки балів треба, щоб скласти іспит A2?", o: ["щонайменше 50", "щонайменше 60", "щонайменше 75"], a: 1 },
    { t: "mc", q: "Як проходить усна частина іспиту A2?", o: ["у парі з іншим учасником", "письмово", "телефоном"], a: 0 },
    { t: "mc", q: "Як правильно?", o: ["Ich warte für dich.", "Ich warte auf dich.", "Ich warte dich."], a: 1 },
    { t: "mc", q: "Яке речення в пасиві?", o: ["Hier wird Deutsch gesprochen.", "Ich werde Deutsch sprechen.", "Er wird Lehrer."], a: 0 },
  ],
};
