// Розділ 26 (A2). Навчання й школа: als чи wenn («коли»), seit і bis як сполучники, Präteritum у книжках,
// школа й оцінки в Німеччині, курси для дорослих (VHS, інтеграційний курс).
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Справжнє: Тараса Шевченка читати
// навчив сільський дяк; Леся Українка до школи не ходила й училася вдома.
export default {
  n: 26, part: "A2.2", title: "Навчання й школа", book: null,
  goals: [
    "розповідати, коли що було: Als ich Kind war…, Wenn ich Zeit habe…",
    "вибирати між als, wenn і wann",
    "казати, відколи й доки: seit, bis",
    "розуміти, як влаштовані школа й навчання в Німеччині",
  ],
  grammar: [
    {
      id: "alsWenn", t: "als чи wenn: «коли» в минулому й тепер", cat: "satz",
      text: [
        "Українське «коли» німецькою — три слова. **als** — один раз у минулому: `Als ich zehn war, habe ich Klavier gelernt.` **wenn** — щоразу (і в минулому теж) або тепер і в майбутньому: `Wenn ich Zeit habe, lese ich.`",
        "`wenn` означає ще й «якщо»: `Wenn du willst, komme ich mit.` А питання «коли?» — це **wann**: `Wann kommst du?`",
        "`als` і `wenn` — підрядні сполучники: дієслово йде **в кінець** (як після `weil`, розділ 18). Якщо підрядне речення стоїть спереду, головне починається з дієслова: `Als ich ankam, **war** es schon dunkel.`",
      ],
      tables: [
        { head: ["Слово", "Коли вживати", "Приклад"], rows: [["als", "один раз у минулому", "Als ich klein war, wohnten wir auf dem Land."], ["wenn", "щоразу; тепер; у майбутньому; «якщо»", "Wenn ich müde bin, trinke ich Kaffee."], ["wann", "питання «коли?»", "Wann beginnt der Kurs?"]] },
      ],
      ex: [["{Als ich ein Kind war, habe ich viel gezeichnet.|Als ich ein Kind war, habe ich viel Klavier gespielt.}", "{Коли я був дитиною, я багато малював.|Коли я була дитиною, я багато грала на фортепіано.}"], ["Wenn ich Zeit habe, gehe ich in die Bibliothek.", "Коли маю час, я йду до бібліотеки."], ["Als wir in Berlin ankamen, regnete es.", "Коли ми приїхали до Берліна, ішов дощ."], ["Immer wenn ich Deutsch spreche, werde ich nervös.", "Щоразу, коли я розмовляю німецькою, я нервую."], ["Ruf mich an, wenn du zu Hause bist.", "Подзвони мені, коли будеш удома."]],
      warn: ["`Wenn ich gestern nach Hause kam…` — помилка: це було один раз, тому `Als ich gestern nach Hause kam…`", "`Wenn kommst du?` — помилка: у питанні — `Wann kommst du?`"],
    },
    {
      id: "seitBis", t: "seit і bis: відколи й доки", cat: "satz",
      text: [
        "`seit` і `bis` бувають **прийменниками** (з іменником) і **сполучниками** (з цілим реченням). Прийменники: `seit einem Jahr` (Dativ), `bis Montag`, `bis zum Abend`.",
        "Сполучники: `Seit ich in Xanten wohne, lerne ich Deutsch.` — «Відколи я живу в Ксантені, я вчу німецьку». `Warte, bis ich fertig bin.` — «Зачекай, доки я закінчу». Дієслово — в кінець.",
        "Увага: з `seit` німецькою вживають **теперішній час**, якщо дія триває досі: `Ich lerne seit zwei Jahren Deutsch.`",
      ],
      ex: [["Seit ich in Xanten wohne, lerne ich Deutsch.", "Відколи я живу в Ксантені, я вчу німецьку."], ["Ich bleibe hier, bis du zurückkommst.", "Я буду тут, доки ти не повернешся."], ["Der Kurs dauert bis Juni.", "Курс триває до червня."], ["Wir kennen uns seit dem Sommer.", "Ми знайомі з літа."]],
      warn: ["`Ich habe seit zwei Jahren Deutsch gelernt` — так кажуть, лише якщо вже не вчиш. Якщо вчиш досі: `Ich lerne seit zwei Jahren Deutsch.`"],
      tips: ["«Доки **не**» українською має «не», а німецькою — ні: `bis du zurückkommst` — «доки ти не повернешся»."],
    },
    {
      id: "praetLesen", t: "Präteritum у книжках: kam, ging, sagte", cat: "verb",
      text: [
        "У розмові про минуле німці кажуть Perfekt (розділ 17), а в **книжках, казках і новинах** пишуть **Präteritum**. Його треба впізнавати.",
        "Правильні дієслова: основа + **-te**: `sagen → sagte`, `wohnen → wohnte`, `arbeiten → arbeitete`. Неправильні змінюють голосний і не мають закінчення в `ich` та `er`: `kommen → kam`, `gehen → ging`, `sehen → sah`, `lesen → las`, `schreiben → schrieb`, `finden → fand`, `geben → gab`.",
        "Форми: `ich kam, du kamst, er kam, wir kamen, ihr kamt, sie kamen`.",
      ],
      tables: [
        { head: ["Інфінітив", "er (Präteritum)", "er (Perfekt)"], rows: [["sagen", "sagte", "hat gesagt"], ["wohnen", "wohnte", "hat gewohnt"], ["kommen", "kam", "ist gekommen"], ["gehen", "ging", "ist gegangen"], ["sehen", "sah", "hat gesehen"], ["lesen", "las", "hat gelesen"], ["schreiben", "schrieb", "hat geschrieben"], ["finden", "fand", "hat gefunden"]] },
      ],
      ex: [["Es war einmal ein König, der hatte drei Töchter.", "Жив-був король, і мав він трьох доньок."], ["Er kam nach Hause und las einen Brief.", "Він прийшов додому й прочитав листа."], ["Sie ging in den Wald und fand ein kleines Haus.", "Вона пішла до лісу й знайшла маленьку хатинку."], ["Der Lehrer sagte: „Morgen schreiben wir einen Test.“", "Учитель сказав: «Завтра пишемо тест»."]],
      tips: ["`Es war einmal…` — так починаються німецькі казки, як наше «Жили-були…»."],
    },
    {
      id: "schulsystem", t: "Школа в Німеччині", cat: "rede",
      text: [
        "Діти йдуть до **початкової школи** (`die Grundschule`) приблизно в 6 років. Вона триває 4 роки (у Берліні й Бранденбурзі — 6).",
        "Далі — залежно від землі й оцінок: `das Gymnasium` (до атестата `das Abitur`, який дає право вступати до університету), `die Realschule`, `die Hauptschule` або `die Gesamtschule`, де всі вчаться разом.",
        "Після школи можна вчитися в університеті (`das Studium`) або здобути професію в **дуальній освіті** (`die Ausbildung`): частину тижня працюєш на підприємстві, решту — вчишся в професійній школі (`die Berufsschule`).",
        "Оцінки — від **1** (дуже добре) до **6** (незадовільно): навпаки, ніж в Україні, де більше — краще.",
      ],
      tables: [
        { cap: "Оцінки в німецькій школі", head: ["Оцінка", "Назва", "Значення"], rows: [["1", "sehr gut", "дуже добре"], ["2", "gut", "добре"], ["3", "befriedigend", "задовільно"], ["4", "ausreichend", "достатньо"], ["5", "mangelhaft", "погано"], ["6", "ungenügend", "незадовільно"]] },
      ],
      ex: [["In welche Klasse geht deine Tochter?", "У якому класі твоя донька?"], ["Er macht nächstes Jahr Abitur.", "Наступного року він складає випускні іспити."], ["Sie macht eine Ausbildung als Köchin.", "Вона вчиться на кухарку."], ["Ich habe eine Eins in Mathe!", "У мене одиниця з математики — найвища оцінка!"]],
    },
    {
      id: "kurse", t: "Курси для дорослих: VHS та інтеграційний курс", cat: "rede",
      text: [
        "Дорослі вчаться в **народних університетах** (`die Volkshochschule`, коротко `VHS`): мови, комп’ютер, кулінарія, спорт. Вони є майже в кожному місті.",
        "**Інтеграційний курс** (`der Integrationskurs`) — це мовний курс до рівня B1 і курс орієнтації (історія, закони, культура Німеччини). Наприкінці — іспит `Deutsch-Test für Zuwanderer` (DTZ) і тест «Leben in Deutschland».",
        "Корисні слова: `sich anmelden` (записатися), `der Einstufungstest` (тест на рівень), `die Kursgebühr` (плата за курс), `das Zertifikat` (сертифікат), `die Weiterbildung` (підвищення кваліфікації).",
      ],
      ex: [["Ich möchte mich für den Deutschkurs anmelden.", "Я хочу записатися на курс німецької."], ["Zuerst machen Sie einen Einstufungstest.", "Спершу Ви пишете тест на рівень."], ["Der Kurs findet zweimal pro Woche statt.", "Курс відбувається двічі на тиждень."], ["Wie viel kostet der Kurs?", "Скільки коштує курс?"]],
    },
  ],
  phrases: [
    { t: "Навчання", list: [["Wann beginnt der Kurs?", "Коли починається курс?"], ["Ich lerne seit einem Jahr Deutsch.", "Я вчу німецьку вже рік."], ["Kann ich mich noch anmelden?", "Я ще можу записатися?"], ["Ich habe die Hausaufgaben vergessen.", "Я {забув|забула} домашнє завдання."], ["Können Sie das bitte wiederholen?", "Повторіть, будь ласка."]] },
    { t: "Спогади про школу", list: [["Als ich in der Schule war, war Deutsch mein Lieblingsfach.", "Коли я {навчався|навчалася} в школі, німецька була моїм улюбленим предметом."], ["Wir hatten eine sehr strenge Lehrerin.", "У нас була дуже сувора вчителька."], ["Wenn es klingelte, rannten alle nach draußen.", "Щойно дзвонив дзвоник, усі вибігали надвір."]] },
    { t: "На уроці", list: [["Wie schreibt man das?", "Як це пишеться?"], ["Was bedeutet dieses Wort?", "Що означає це слово?"], ["Ich habe eine Frage.", "У мене запитання."]] },
  ],
  dialog: {
    t: "Що далі після A2",
    lines: [
      ["Lehrerin", "{Herr Schewtschenko|Frau Ukrajinka}, haben Sie kurz Zeit? Der A2-Kurs endet im März. Was möchten Sie danach machen?", "{Пане Шевченку|Пані Українко}, маєте хвилинку? Курс A2 закінчується в березні. Що Ви хочете робити потім?"],
      ["{Taras|Lessja}", "Ich möchte weiterlernen, bis ich B1 habe. Wann beginnt der nächste Kurs?", "Я хочу вчитися далі, доки не матиму B1. Коли починається наступний курс?"],
      ["Lehrerin", "Im April. Wenn Sie sich bis Ende Februar anmelden, bekommen Sie bestimmt einen Platz.", "У квітні. Якщо Ви запишетеся до кінця лютого, місце точно буде."],
      ["{Taras|Lessja}", "Gut, das mache ich. Muss ich einen Einstufungstest machen?", "Добре, так і зроблю. Мені треба писати тест на рівень?"],
      ["Lehrerin", "Nein, wenn Sie die A2-Prüfung bestehen, brauchen Sie keinen Test. Darf ich fragen: Wie haben Sie als Kind gelernt?", "Ні, якщо складете іспит A2, тест не потрібен. Можна запитати: як Ви вчилися в дитинстві?"],
      ["{Taras|Lessja}", "{Als ich klein war, hat mir der Kirchensänger in unserem Dorf Lesen und Schreiben beigebracht.|Ich bin nicht zur Schule gegangen. Ich habe zu Hause gelernt, oft allein mit Büchern.}", "{Коли я був малим, читати й писати мене навчив дяк у нашому селі.|Я не ходила до школи. Я вчилася вдома, часто сама, з книжок.}"],
      ["Lehrerin", "{Und heute lernen Sie Deutsch! Das finde ich toll.|Und trotzdem sprechen Sie so viele Sprachen!}", "{А тепер Ви вчите німецьку! Це чудово.|І все одно Ви знаєте стільки мов!}"],
      ["{Taras|Lessja}", "{Wenn man etwas wirklich will, findet man immer einen Weg.|Ich lese in vielen Sprachen, auch auf Deutsch. Aber sprechen möchte ich noch besser.}", "{Коли чогось справді хочеш, завжди знайдеш спосіб.|Я читаю багатьма мовами, і німецькою теж. Але говорити хочу ще краще.}"],
      ["Lehrerin", "Das sehe ich. Dann bis morgen im Unterricht!", "Я це бачу. Тоді до завтра на занятті!"],
      ["{Taras|Lessja}", "Bis morgen! Und danke für den Tipp!", "До завтра! І дякую за пораду!"],
    ],
  },
  tasks: [
    { t: "gap", q: "___ ich ein Kind war, wohnten wir auf dem Land.", a: ["Als", "als"], why: "Один раз у минулому — als." },
    { t: "gap", q: "___ ich Zeit habe, lese ich gern.", a: ["Wenn", "wenn"] },
    { t: "gap", q: "___ beginnt der Kurs?", a: ["Wann", "wann"], why: "Питання «коли?» — wann." },
    { t: "gap", q: "Ruf mich an, ___ du zu Hause bist.", a: ["wenn"] },
    { t: "gap", q: "Ich lerne ___ einem Jahr Deutsch.", a: ["seit"] },
    { t: "gap", q: "Warte hier, ___ ich zurückkomme.", a: ["bis"] },
    { t: "gap", q: "Als ich ankam, ___ es schon dunkel. (sein, Präteritum)", a: ["war"] },
    { t: "gap", q: "Er ___ nach Hause und las einen Brief. (kommen, Präteritum)", a: ["kam"] },
    { t: "mc", q: "Як правильно?", o: ["Wenn ich gestern ankam, …", "Als ich gestern ankam, …", "Wann ich gestern ankam, …"], a: 1 },
    { t: "mc", q: "Ти досі вчиш німецьку. Як правильно?", o: ["Ich habe seit zwei Jahren Deutsch gelernt.", "Ich lerne seit zwei Jahren Deutsch.", "Ich lerne vor zwei Jahren Deutsch."], a: 1 },
    { t: "mc", q: "Найкраща оцінка в німецькій школі —", o: ["1", "5", "12"], a: 0 },
    { t: "mc", q: "Що таке «die Ausbildung»?", o: ["професійне навчання на підприємстві й у школі", "навчання в університеті", "початкова школа"], a: 0 },
    { t: "mc", q: "Präteritum від «gehen»:", o: ["gehte", "ging", "gegangen"], a: 1 },
  ],
};
