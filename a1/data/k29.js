// Розділ 29 (A2). Культура й мистецтво: підрядні означальні речення (der Mann, der dort steht; der Film, den ich
// gesehen habe; die Stadt, in der ich wohne), was für ein…?, театр, музей, концерт, твори героїв.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Справжнє: «Кобзар» вийшов 1840 року,
// картину «Катерина» (за власною поемою) Шевченко намалював 1842 року; перша збірка Лесі Українки «На крилах пісень»
// вийшла 1893 року, «Лісову пісню» вона написала 1911 року.
export default {
  n: 29, part: "A2.2", title: "Культура й мистецтво", book: null,
  goals: [
    "пояснювати, хто є хто і що є що: der Mann, der dort steht…",
    "казати «який» з будь-яким відмінком: den, dem, in der…",
    "питати про вид і якість: Was für ein Buch ist das?",
    "говорити про виставки, театр, кіно й книжки",
  ],
  grammar: [
    {
      id: "relativNom", t: "Підрядне означальне: der Mann, der dort steht", cat: "satz",
      text: [
        "Підрядне означальне речення пояснює іменник — як українське «який, яка, яке»: `Das ist der Film, **der** heute im Kino läuft.`",
        "Слово, що його вводить, — **відносний займенник**. Він схожий на означений артикль: `der, die, das`, у множині `die`. Рід і число — як у іменника, який він пояснює.",
        "Перед підрядним — кома, а дієслово стоїть **у кінці**: `Ich kenne eine Frau, die fünf Sprachen spricht.`",
      ],
      tables: [
        { head: ["Іменник", "Підрядне речення (хто? що?)"], rows: [["der Film", "Der Film, der heute läuft, ist neu."], ["die Malerin", "Die Malerin, die hier ausstellt, kommt aus Kyjiw."], ["das Buch", "Das Buch, das auf dem Tisch liegt, ist spannend."], ["die Bilder (Pl.)", "Die Bilder, die dort hängen, sind alt."]] },
      ],
      ex: [["Wie heißt der Film, der heute im Kino läuft?", "Як називається фільм, що сьогодні йде в кіно?"], ["Ich habe eine Freundin, die sehr gut singt.", "У мене є подруга, яка дуже гарно співає."], ["Das ist das Museum, das am Montag geschlossen ist.", "Це музей, який у понеділок зачинений."], ["Kennst du die Leute, die neben uns wohnen?", "Ти знаєш людей, які живуть поруч із нами?"]],
      warn: ["`der Mann, der steht dort` — помилка: у підрядному дієслово в кінці: `der Mann, der dort steht`."],
    },
    {
      id: "relativAkk", t: "Відносний займенник у Akkusativ і Dativ: den, dem, in der", cat: "satz",
      text: [
        "Відмінок займенника залежить від його ролі **в підрядному реченні**: `Der Film, **den** ich gesehen habe, war toll.` (бо `ich habe den Film gesehen` — Akkusativ).",
        "У Akkusativ змінюється лише чоловічий рід: `den`. У Dativ: `dem` (m, n), `der` (f), `denen` (множина).",
        "З прийменником — прийменник стоїть **перед** займенником: `die Stadt, **in der** ich wohne`, `der Freund, **mit dem** ich lerne`.",
      ],
      tables: [
        { head: ["", "m", "f", "n", "Pl."], rows: [["Nom.", "der", "die", "das", "die"], ["Akk.", "**den**", "die", "das", "die"], ["Dat.", "dem", "der", "dem", "**denen**"]] },
      ],
      ex: [["{Das ist das Bild, das ich gestern gemalt habe.|Das ist das Gedicht, das ich gestern geschrieben habe.}", "{Це картина, яку я вчора намалював.|Це вірш, який я вчора написала.}"], ["Der Mantel, den ich gekauft habe, ist sehr warm.", "Пальто, яке я {купив|купила}, дуже тепле."], ["Xanten ist die Stadt, in der ich wohne.", "Ксантен — місто, в якому я живу."], ["Das ist mein Freund, mit dem ich Deutsch lerne.", "Це мій друг, з яким я вчу німецьку."]],
      warn: ["`Der Film, der ich gesehen habe` — помилка: «я {бачив|бачила} фільм» — фільм у Akkusativ: `den ich gesehen habe`."],
    },
    {
      id: "wasFuer", t: "Was für ein…? і welcher?", cat: "pron",
      text: [
        "`Was für ein…?` — «що за…? який (за видом)?» — питають про **вид, якість**: `Was für ein Buch ist das? – Ein Roman.` `ein` змінюється, як завжди: `Was für einen Film siehst du gern?`",
        "`Welcher?` (розділ 16) питають про **вибір із відомих**: `Welches Buch nimmst du, das rote oder das blaue?`",
        "У множині — без `ein`: `Was für Bücher liest du?` А ще `Was für ein…!` — оклик: `Was für ein schöner Tag!` — «Який чудовий день!»",
      ],
      ex: [["Was für Musik hörst du gern? – Klassische Musik.", "Яку музику ти любиш слухати? – Класичну."], ["Was für einen Film möchtest du sehen? – Eine Komödie.", "Який фільм ти хочеш подивитися? – Комедію."], ["Welchen Film sehen wir, den deutschen oder den ukrainischen?", "Який фільм подивимося: німецький чи український?"], ["Was für ein schönes Bild!", "Яка гарна картина!"]],
    },
    {
      id: "kultur", t: "Виставка, театр, концерт", cat: "rede",
      text: [
        "`die Ausstellung` — виставка, `das Gemälde` — картина (полотно), `die Vorstellung` — вистава, `das Konzert`, `die Lesung` — літературні читання, `die Eintrittskarte` — квиток, `der Eintritt` — вхід і плата за нього.",
        "Квитки часто дешевші для студентів і пенсіонерів (`die Ermäßigung` — знижка). Деякі музеї мають безкоштовний вхід у певні дні — запитай у касі.",
        "Враження: `Das Buch hat mir gut gefallen.` `Die Geschichte war spannend / langweilig / traurig.` `Ich empfehle dir den Film.`",
      ],
      ex: [["Wann beginnt die Vorstellung?", "Коли починається вистава?"], ["Zwei Karten für Samstag, bitte.", "Два квитки на суботу, будь ласка."], ["Gibt es eine Ermäßigung für Studenten?", "Є знижка для студентів?"], ["Der Film war spannend, aber zu lang.", "Фільм був захопливий, але задовгий."]],
    },
    {
      id: "werke", t: "{Мої твори: «Кобзар» і «Катерина»|Мої твори: «На крилах пісень» і «Лісова пісня»}", cat: "rede",
      text: [
        "{**Тарас Шевченко** (1814–1861) — поет і художник. Його збірка «Кобзар» вийшла 1840 року й стала головною книжкою української поезії. Він малював картини (наприклад, «Катерина», 1842, за власною поемою) і робив гравюри.|**Леся Українка** (1871–1913) — поетка, драматургиня й перекладачка. Її перша збірка «На крилах пісень» вийшла 1893 року, а найвідоміша драма — «Лісова пісня», написана 1911 року. Вона перекладала Генріха Гайне, Віктора Гюґо й Гомера.}",
        "Як сказати це німецькою: `Ich habe Gedichte geschrieben.` `Das Buch ist 1840 erschienen.` `Das Drama habe ich 1911 geschrieben.` `Das Bild habe ich gemalt.`",
      ],
      ex: [["{Mein erstes Buch, der Kobsar, ist 1840 erschienen.|Mein erster Gedichtband ist 1893 erschienen.}", "{Моя перша книжка, «Кобзар», вийшла 1840 року.|Моя перша збірка віршів вийшла 1893 року.}"], ["{Ich habe auch Bilder gemalt, zum Beispiel „Katerina“.|Mein bekanntestes Drama ist „Das Waldlied“.}", "{Я також малював картини, наприклад «Катерину».|Моя найвідоміша драма — «Лісова пісня».}"], ["{Viele Menschen kennen meine Gedichte auswendig.|Ich habe Gedichte von Heinrich Heine übersetzt.}", "{Багато людей знають мої вірші напам’ять.|Я перекладала вірші Генріха Гайне.}"]],
    },
  ],
  phrases: [
    { t: "Квитки й вхід", list: [["Was kostet der Eintritt?", "Скільки коштує вхід?"], ["Zwei Karten für heute Abend, bitte.", "Два квитки на сьогодні ввечері, будь ласка."], ["Gibt es noch freie Plätze?", "Ще є вільні місця?"], ["Wann ist das Museum geöffnet?", "Коли працює музей?"]] },
    { t: "Враження", list: [["Wie hat dir der Film gefallen?", "Як тобі фільм?"], ["Das Buch war wirklich spannend.", "Книжка була справді захоплива."], ["Was für ein schönes Bild!", "Яка гарна картина!"], ["Das ist nicht so mein Geschmack.", "Це не зовсім на мій смак."]] },
    { t: "Хто це?", list: [["Wer ist die Frau, die dort singt?", "Хто та жінка, що там співає?"], ["Das ist der Maler, von dem ich dir erzählt habe.", "Це той художник, про якого я тобі {розповідав|розповідала}."]] },
  ],
  dialog: {
    t: "Виставка в музеї",
    lines: [
      ["Anna", "Schau mal, das ist die Ausstellung, von der ich dir erzählt habe: Kunst und Literatur aus der Ukraine!", "Глянь, це та виставка, про яку я тобі розповідала: мистецтво й література з України!"],
      ["{Taras|Lessja}", "Toll! Was für Werke gibt es hier?", "Чудово! А які тут твори?"],
      ["Anna", "{Vor allem Bilder. Siehst du das Gemälde, das dort hinten hängt?|Bilder und alte Bücher. Siehst du das Buch, das dort in der Vitrine liegt?}", "{Переважно картини. Бачиш полотно, що висить он там?|Картини й старі книжки. Бачиш книжку, що лежить он там у вітрині?}"],
      ["{Taras|Lessja}", "{Natürlich! Das ist „Katerina“. Das Bild habe ich 1842 gemalt.|Natürlich! Das ist „Auf den Flügeln der Lieder“, mein erster Gedichtband.}", "{Звісно! Це «Катерина». Цю картину я намалював 1842 року.|Звісно! Це «На крилах пісень», моя перша збірка віршів.}"],
      ["Anna", "Moment … Das ist von dir? Was für eine Überraschung!", "Стривай… Це твоє? Оце так несподіванка!"],
      ["{Taras|Lessja}", "{Ja. Die Frau, die du da siehst, ist eine Figur aus einem Gedicht, das ich vorher geschrieben habe.|Ja. Die Gedichte, die darin stehen, habe ich sehr jung geschrieben.}", "{Так. Жінка, яку ти там бачиш, — героїня моєї поеми, яку я написав ще раніше.|Так. Вірші, які там є, я написала зовсім молодою.}"],
      ["Anna", "Unglaublich! Gibt es hier noch mehr von dir?", "Неймовірно! Тут є ще щось твоє?"],
      ["{Taras|Lessja}", "{Vielleicht. Aber am bekanntesten ist der Kobsar, mein Buch mit Gedichten.|Vielleicht. Aber am bekanntesten ist „Das Waldlied“, ein Drama, das ich 1911 geschrieben habe.}", "{Може. Але найвідоміший — «Кобзар», моя книжка віршів.|Може. Але найвідоміша — «Лісова пісня», драма, яку я написала 1911 року.}"],
      ["Anna", "Dann kaufe ich mir im Museumsladen gleich ein Buch von dir!", "Тоді я одразу куплю в музейній крамниці твою книжку!"],
      ["{Taras|Lessja}", "Und ich schreibe dir etwas hinein. Was für eine Widmung möchtest du?", "А я тобі щось у ній напишу. Який присвятний напис ти хочеш?"],
      ["Anna", "Etwas Kurzes, das ich auf Deutsch verstehe!", "Щось коротке, що я зрозумію німецькою!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist der Mann, ___ dort steht.", a: ["der"] },
    { t: "gap", q: "Das ist die Frau, ___ fünf Sprachen spricht.", a: ["die"] },
    { t: "gap", q: "Das ist das Buch, ___ ich gelesen habe.", a: ["das"] },
    { t: "gap", q: "Der Film, ___ ich gesehen habe, war toll.", a: ["den"], why: "Ich habe den Film gesehen — Akkusativ." },
    { t: "gap", q: "Xanten ist die Stadt, in ___ ich wohne.", a: ["der"] },
    { t: "gap", q: "Das ist mein Freund, mit ___ ich lerne.", a: ["dem"] },
    { t: "gap", q: "Was für ___ Film ist das? – Ein Krimi.", a: ["ein"] },
    { t: "gap", q: "Was für ___ Roman liest du gerade? (der Roman)", a: ["einen"] },
    { t: "mc", q: "Як правильно?", o: ["der Mann, der steht dort", "der Mann, der dort steht", "der Mann, dort steht der"], a: 1 },
    { t: "mc", q: "«Фільм, який я {бачив|бачила}, …»", o: ["Der Film, der ich gesehen habe, …", "Der Film, den ich gesehen habe, …", "Der Film, dem ich gesehen habe, …"], a: 1 },
    { t: "mc", q: "Питання про вид: «Що за книжка?»", o: ["Welches Buch?", "Was für ein Buch?", "Wie Buch?"], a: 1 },
    { t: "mc", q: "Що таке «die Ermäßigung»?", o: ["знижка", "вистава", "вхід"], a: 0 },
    { t: "mc", q: "{Коли вийшов «Кобзар»?|Коли Леся Українка написала «Лісову пісню»?}", o: ["{1840|1911}", "{1814|1871}", "{1861|1913}"], a: 0 },
  ],
};
