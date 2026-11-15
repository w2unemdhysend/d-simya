// Розділ 45 (B1). Свята й традиції: частки (doch, mal, ja, halt, eigentlich), es у сталих висловах (es geht um,
// es lohnt sich); свята в NRW; привітання й співчуття.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 45, part: "B1.2", title: "Свята й традиції", book: null,
  goals: [
    "говорити природніше з частками: Komm doch mit! Das ist ja schön! Das ist halt so.",
    "уживати сталі вислови з es: es geht um, es kommt darauf an, es lohnt sich",
    "знати свята й звичаї в NRW і правила тиші",
    "привітати, запросити, ввічливо відмовитися й поспівчувати",
  ],
  grammar: [
    {
      id: "partikeln", t: "Частки: doch, mal, ja, halt, eigentlich, denn", cat: "satz",
      text: [
        "Частки не змінюють змісту, але додають настрою — без них німецька звучить сухо й різко.",
        "`mal` пом’якшує прохання: `Kannst du **mal** helfen?` `doch` у проханні — «ну ж бо»: `Komm **doch** mit!`; у твердженні — «ж, адже»: `Das weißt du **doch**!`",
        "`ja` — здивування або «адже ж» (обидва знають): `Das ist **ja** toll!` `Du kennst ihn **ja**.`",
        "`halt` / `eben` — «так уже є, нічого не вдієш»: `Das ist **halt** so.` `Dann nehmen wir **eben** den Bus.`",
        "`eigentlich` — «власне, до речі»: `Was machst du **eigentlich** an Weihnachten?` `denn` у питанні — щира зацікавленість: `Was ist **denn** los?`",
      ],
      tables: [
        { head: ["Частка", "Відтінок", "Приклад"], rows: [["mal", "м’яке прохання", "Schau mal!"], ["doch", "заклик; нагадування", "Komm doch mit! / Das weißt du doch."], ["ja", "здивування; «адже»", "Das ist ja schön!"], ["halt / eben", "так уже є", "Das ist halt so."], ["eigentlich", "власне, до речі", "Wie heißt du eigentlich?"], ["denn", "зацікавлене питання", "Was ist denn los?"]] },
      ],
      ex: [["Komm doch am Sonntag zum Kaffee vorbei!", "Заходь же в неділю на каву!"], ["Das ist ja eine schöne Überraschung!", "Оце так приємна несподіванка!"], ["Sonntags haben die Geschäfte zu. Das ist halt so in Deutschland.", "У неділю магазини зачинені. Так уже в Німеччині заведено."]],
    },
    {
      id: "esB1", t: "es у сталих висловах: es geht um, es lohnt sich", cat: "pron",
      text: [
        "`es gibt` + Akkusativ — «є, існує»: `Es gibt einen Weihnachtsmarkt.`",
        "`es geht um` — «ідеться про»: `In dem Brief geht es um die Miete.` Офіційно — `es handelt sich um`: `Es handelt sich um ein Missverständnis.`",
        "`es kommt darauf an` — «залежить від»: `Es kommt darauf an, wie das Wetter ist.`",
        "`es lohnt sich` — «варто, окупається»: `Der Ausflug lohnt sich.` `es fällt mir schwer / leicht` — «мені важко / легко»: `Es fällt mir schwer, Nein zu sagen.`",
      ],
      tables: [
        { head: ["Вислів", "Значення", "Приклад"], rows: [["es gibt + Akk.", "є, існує", "Es gibt einen Laternenumzug."], ["es geht um", "ідеться про", "Worum geht es?"], ["es kommt darauf an", "залежить від", "Es kommt darauf an, ob es regnet."], ["es lohnt sich", "варто", "Es lohnt sich, früh zu kommen."], ["es fällt mir schwer", "мені важко", "Es fällt mir schwer, früh aufzustehen."]] },
      ],
      ex: [["Worum geht es bei diesem Fest?", "Про що це свято?"], ["Es lohnt sich, den Weihnachtsmarkt in Xanten zu besuchen.", "Різдвяний ярмарок у Ксантені варто відвідати."], ["Es fällt mir schwer, so weit weg von meiner Familie zu feiern.", "Мені важко святкувати так далеко від родини."]],
    },
    {
      id: "feiertage", t: "Свята й звичаї в NRW", cat: "rede",
      text: [
        "Державні вихідні в NRW: 1 січня, Страсна п’ятниця (`Karfreitag`), Великодній понеділок, 1 травня, Вознесіння (`Christi Himmelfahrt`), Зелений понеділок (`Pfingstmontag`), Тіло Христове (`Fronleichnam`), 3 жовтня — День німецької єдності, 1 листопада — День усіх святих (`Allerheiligen`), 25 і 26 грудня. У ці дні й у неділю магазини зачинені.",
        "Звичаї: карнавал (`der Karneval`), особливо в Кельні й Дюссельдорфі; `Rosenmontag` — не державне свято, але багато хто не працює. 11 листопада — день святого Мартина: діти йдуть із ліхтариками (`der Laternenumzug`). Грудень — адвент: вінок із чотирма свічками, адвент-календар, різдвяні ярмарки.",
        "Неділя й свята — дні тиші: не свердлити, не косити траву, не викидати скло (розділ 30).",
        "31 грудня — `Silvester`. Феєрверки можна запускати лише 31 грудня й 1 січня; у деяких місцях міста забороняють їх зовсім.",
      ],
      tables: [
        { head: ["Свято", "Коли"], rows: [["Neujahr", "1 січня"], ["Karfreitag, Ostermontag", "березень або квітень"], ["Tag der Arbeit", "1 травня"], ["Tag der Deutschen Einheit", "3 жовтня"], ["Allerheiligen (NRW)", "1 листопада"], ["Weihnachten", "25–26 грудня"]] },
      ],
      ex: [["Am Montag ist Feiertag, die Geschäfte haben zu.", "У понеділок свято, магазини зачинені."], ["Gehst du mit deinem Kind zum Laternenumzug?", "Ти підеш із дитиною на ходу з ліхтариками?"], ["Frohe Ostern!", "Щасливого Великодня!"]],
    },
    {
      id: "wuensche", t: "Привітати й поспівчувати", cat: "rede",
      text: [
        "Привітання: `Herzlichen Glückwunsch zum Geburtstag!` `Alles Gute zur Hochzeit!` `Frohe Weihnachten und einen guten Rutsch ins neue Jahr!` (`der Rutsch` — «перехід» у новий рік).",
        "Офіційніше — колегам, сусідам: `Zum Geburtstag wünsche ich Ihnen alles Gute, Gesundheit und viel Erfolg.`",
        "Співчуття (`das Beileid`): `Herzliches Beileid.` `Mein aufrichtiges Beileid.` У листівці: `Wir sind in Gedanken bei Ihnen.` — «Ми подумки з Вами». Траурна листівка — стримана, біла чи сіра.",
        "Подякувати за запрошення й ввічливо відмовитися: `Vielen Dank für die Einladung! Leider kann ich nicht kommen, weil …`",
      ],
      ex: [["Herzlichen Glückwunsch zur Geburt Ihrer Tochter!", "Щиро вітаю з народженням Вашої доньки!"], ["Wir wünschen euch frohe Weihnachten und einen guten Rutsch!", "Бажаємо вам веселого Різдва й щасливого Нового року!"], ["Mein herzliches Beileid.", "Щиро співчуваю."]],
    },
  ],
  phrases: [
    { t: "Привітання", list: [["Alles Gute zum Geburtstag!", "З днем народження!"], ["Frohe Feiertage!", "Гарних свят!"], ["Guten Rutsch ins neue Jahr!", "Щасливо зустріти Новий рік!"]] },
    { t: "Запрошення", list: [["Komm doch zu unserer Feier!", "Приходь же на наше свято!"], ["Soll ich etwas mitbringen?", "Мені щось принести?"], ["Wir feiern auf Ukrainisch: mit Borschtsch und Wareniki.", "Ми святкуємо по-українськи: з борщем і варениками."]] },
    { t: "Співчуття", list: [["Herzliches Beileid.", "Щиро співчуваю."], ["Wenn Sie Hilfe brauchen, sagen Sie Bescheid.", "Якщо Вам потрібна допомога, скажіть."], ["Wir denken an Sie.", "Ми думаємо про Вас."]] },
  ],
  dialog: {
    t: "Адвент із сусідкою",
    lines: [
      ["Nachbarin", "Guten Abend! Na, haben Sie schon einen Adventskranz?", "Добрий вечір! Ну що, у Вас уже є адвентовий вінок?"],
      ["{Taras|Lessja}", "Noch nicht. Was ist das eigentlich genau?", "Ще ні. А що це, власне, таке?"],
      ["Nachbarin", "Ein Kranz mit vier Kerzen. Ab dem ersten Advent zündet man jeden Sonntag eine Kerze mehr an. Es geht um die Zeit des Wartens auf Weihnachten.", "Вінок із чотирма свічками. З першої адвентової неділі щонеділі запалюють на одну свічку більше. Ідеться про час очікування Різдва."],
      ["{Taras|Lessja}", "Wie schön! Bei uns in der Ukraine gibt es das nicht so oft. Aber seit ein paar Jahren feiern viele Ukrainer Weihnachten auch am 25. Dezember.", "Як гарно! У нас в Україні такого не так багато. Але вже кілька років багато українців теж святкують Різдво 25 грудня."],
      ["Nachbarin", "Ach, wirklich? Das wusste ich nicht. Und was essen Sie an Heiligabend?", "Справді? Я не знала. А що Ви їсте на Святвечір?"],
      ["{Taras|Lessja}", "Zwölf Gerichte ohne Fleisch, zum Beispiel Kutja, Borschtsch und Wareniki. Kommen Sie doch am 24. zu uns!", "Дванадцять пісних страв, наприклад кутю, борщ і вареники. Приходьте ж до нас 24-го!"],
      ["Nachbarin", "Das ist ja eine schöne Einladung! Soll ich etwas mitbringen?", "Оце так гарне запрошення! Мені щось принести?"],
      ["{Taras|Lessja}", "Nicht nötig. Vielleicht ein paar Plätzchen? Deutsche Weihnachtsplätzchen esse ich so gern.", "Не треба. Хіба кілька печивок? Я так люблю німецьке різдвяне печиво."],
      ["Nachbarin", "Mache ich! Und gehen Sie auch zum Weihnachtsmarkt? Es lohnt sich, der in Xanten ist sehr gemütlich.", "Принесу! А на різдвяний ярмарок Ви теж підете? Варто сходити: у Ксантені він дуже затишний."],
      ["{Taras|Lessja}", "Ja, am Samstag mit Anna. Ich freue mich schon auf den Glühwein!", "Так, у суботу з Анною. Уже чекаю на глінтвейн!"],
      ["Nachbarin", "Dann wünsche ich Ihnen eine schöne Adventszeit!", "Тоді бажаю Вам гарного адвенту!"],
      ["{Taras|Lessja}", "Danke, Ihnen auch!", "Дякую, і Вам також!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Komm ___ mit! Es wird bestimmt lustig. (заклик)", a: ["doch"] },
    { t: "gap", q: "Kannst du ___ kurz helfen? (м’яко)", a: ["mal"] },
    { t: "gap", q: "Das ist ___ eine Überraschung! (здивування)", a: ["ja"] },
    { t: "gap", q: "Worum ___ es in dem Brief? – Um die Miete.", a: ["geht"] },
    { t: "gap", q: "Der Ausflug lohnt ___.", a: ["sich"] },
    { t: "gap", q: "Es kommt ___ an, wie das Wetter ist.", a: ["darauf"] },
    { t: "gap", q: "Herzlichen ___ zum Geburtstag!", a: ["Glückwunsch"] },
    { t: "gap", q: "Guten ___ ins neue Jahr!", a: ["Rutsch"] },
    { t: "mc", life: true, q: "Сусідка розповідає, що помер її чоловік. Що сказати?", o: ["Herzlichen Glückwunsch!", "Mein herzliches Beileid.", "Gute Besserung!"], a: 1 },
    { t: "mc", life: true, q: "Неділя, 15:00, багатоквартирний будинок. Що з цього можна?", o: ["свердлити, якщо недовго", "косити траву на подвір’ї", "читати й гуляти, але не шуміти й не викидати скло"], a: 2 },
    { t: "mc", life: true, q: "Який із цих днів у NRW — державний вихідний?", o: ["3 жовтня", "11 листопада", "Rosenmontag"], a: 0 },
    { t: "mc", q: "`Das ist halt so.` означає…", o: ["Це тимчасово", "Так уже є, нічого не вдієш", "Це неправда"], a: 1 },
    { t: "mc", q: "`Es fällt mir schwer, Nein zu sagen.` означає…", o: ["Мені важко відмовляти", "Я часто відмовляю", "Мені легко сказати «ні»"], a: 0 },
    { t: "mc", life: true, q: "Тебе запросили на свято, але ти не можеш прийти. Як відповісти?", o: ["Nein.", "Keine Lust.", "Vielen Dank für die Einladung! Leider kann ich nicht kommen, weil …"], a: 2 },
    { t: "mc", life: true, q: "Записка в під’їзді: `Wir feiern am Samstag Geburtstag. Es könnte etwas lauter werden. Entschuldigung!`", o: ["сусіди попереджають про гучне свято в суботу", "у суботу не можна шуміти", "сусіди запрошують усіх на день народження"], a: 0 },
  ],
};
