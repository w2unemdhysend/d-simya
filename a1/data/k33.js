// Розділ 33 (B1). Пошук роботи: Präteritum усіх дієслів, Plusquamperfekt і nachdem, оголошення про роботу,
// резюме й зустріч у Jobcenter.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 33, part: "B1.1", title: "Пошук роботи", book: null,
  goals: [
    "розповідати про минуле письмово: Präteritum усіх дієслів (ich arbeitete, ich fand)",
    "казати, що сталося раніше за інше: Nachdem ich den Kurs beendet hatte, …",
    "розуміти оголошення про роботу: VZ, TZ, m/w/d, befristet, ab sofort",
    "скласти резюме й підготуватися до зустрічі в Jobcenter",
  ],
  grammar: [
    {
      id: "praetB1", t: "Präteritum усіх дієслів: ich arbeitete, ich fand", cat: "verb",
      text: [
        "В A2 Präteritum був потрібен для `sein`, `haben` і модальних дієслів (розділ 17). На рівні B1 його треба **впізнавати й уживати** для всіх дієслів: так пишуть новини, книжки, резюме, офіційні листи. У розмові й далі переважно кажуть Perfekt.",
        "**Слабкі** (правильні) дієслова: основа + `-te` + закінчення: `machen → ich machte`, `wohnen → er wohnte`. Після `-t`, `-d` і збігу приголосних — `-ete`: `arbeiten → arbeitete`, `melden → meldete`, `öffnen → öffnete`.",
        "**Сильні** дієслова змінюють голосну основи й не мають `-te`: `finden → fand`, `gehen → ging`, `schreiben → schrieb`. У формах `ich` і `er/sie/es` **немає закінчення**: `ich fand, er fand`.",
        "**Змішані** дієслова мають і нову голосну, і `-te`: `denken → dachte`, `bringen → brachte`, `kennen → kannte`, `wissen → wusste`.",
      ],
      tables: [
        { cap: "Закінчення", head: ["", "machen (слабке)", "finden (сильне)", "denken (змішане)"], rows: [["ich", "machte", "fand", "dachte"], ["du", "machtest", "fandest", "dachtest"], ["er/sie/es", "machte", "fand", "dachte"], ["wir", "machten", "fanden", "dachten"], ["ihr", "machtet", "fandet", "dachtet"], ["sie/Sie", "machten", "fanden", "dachten"]] },
        { cap: "Часті сильні дієслова", head: ["Інфінітив", "Präteritum", "Perfekt"], rows: [["beginnen", "begann", "hat begonnen"], ["bleiben", "blieb", "ist geblieben"], ["fahren", "fuhr", "ist gefahren"], ["finden", "fand", "hat gefunden"], ["geben", "gab", "hat gegeben"], ["gehen", "ging", "ist gegangen"], ["helfen", "half", "hat geholfen"], ["kommen", "kam", "ist gekommen"], ["lesen", "las", "hat gelesen"], ["nehmen", "nahm", "hat genommen"], ["schreiben", "schrieb", "hat geschrieben"], ["sprechen", "sprach", "hat gesprochen"], ["stehen", "stand", "hat gestanden"], ["ziehen", "zog", "ist gezogen"]] },
      ],
      ex: [["Im Jahr 2022 kam ich nach Deutschland.", "{У 2022 році я приїхав до Німеччини.|У 2022 році я приїхала до Німеччини.}"], ["Zuerst wohnte ich bei Freunden, dann fand ich eine Wohnung in Xanten.", "{Спершу я жив у друзів, потім знайшов квартиру в Ксантені.|Спершу я жила в друзів, потім знайшла квартиру в Ксантені.}"], ["Der Kurs begann im März und dauerte sechs Monate.", "Курс почався в березні й тривав шість місяців."], ["Sie wusste nicht, wo das Jobcenter war.", "Вона не знала, де Jobcenter."]],
      warn: ["`ich fande`, `er ginge` — помилка: у сильних дієсловах форми `ich` і `er` без закінчення: `ich fand`, `er ging`.", "У розмові кажуть частіше Perfekt: `Gestern bin ich ins Kino gegangen.` Речення `Gestern ging ich ins Kino.` правильне, але звучить як розповідь у книжці."],
    },
    {
      id: "plusquam", t: "Plusquamperfekt: ich hatte gemacht, ich war gegangen", cat: "verb",
      text: [
        "**Plusquamperfekt** — «давноминулий»: дія сталася **раніше за іншу** дію в минулому. Будова як у Perfekt, тільки допоміжне дієслово в Präteritum: `hatte` або `war` + Partizip II.",
        "`Als ich zum Termin kam, war die Beraterin schon gegangen.` — коли я прийшов, вона **вже пішла** (це сталося раніше).",
        "`haben` чи `sein` — так само, як у Perfekt: рух і зміна стану → `war gegangen`, `war gekommen`; решта → `hatte gemacht`.",
        "Українська показує це словами «вже», «до того», «перед тим»; німецька — формою дієслова.",
      ],
      tables: [
        { head: ["", "Perfekt", "Plusquamperfekt"], rows: [["machen", "ich habe gemacht", "ich **hatte** gemacht"], ["gehen", "ich bin gegangen", "ich **war** gegangen"], ["finden", "er hat gefunden", "er **hatte** gefunden"], ["ankommen", "wir sind angekommen", "wir **waren** angekommen"]] },
      ],
      ex: [["Ich hatte meine Unterlagen vergessen, deshalb musste ich noch einmal kommen.", "{Я забув документи, тому мусив прийти ще раз.|Я забула документи, тому мусила прийти ще раз.}"], ["Der Bus war schon abgefahren.", "Автобус уже поїхав."], ["Sie hatte vorher nie in einem Büro gearbeitet.", "Раніше вона ніколи не працювала в офісі."]],
      warn: ["`Ich hatte gegangen` — помилка: з дієсловами руху `war`: `Ich war gegangen.`"],
    },
    {
      id: "nachdem", t: "nachdem: «після того як»", cat: "satz",
      text: [
        "`nachdem` — «після того як». Це підрядне речення: дієслово **в кінці**. Дія в ньому на крок **раніше**, ніж у головному реченні:",
        "головне речення в минулому → після `nachdem` **Plusquamperfekt**: `Nachdem ich den Kurs **beendet hatte**, **suchte** ich Arbeit.`",
        "головне речення в теперішньому → після `nachdem` **Perfekt**: `Nachdem ich **gegessen habe**, **gehe** ich spazieren.`",
        "Коротше — прийменник `nach` з Dativ: `nach dem Kurs` — «після курсу», `nach der Arbeit` — «після роботи».",
      ],
      tables: [
        { cap: "Час у реченні з nachdem", head: ["Головне речення", "Речення з nachdem"], rows: [["Präsens: …, gehe ich los.", "Perfekt: Nachdem ich gegessen habe, …"], ["Präteritum чи Perfekt: …, ging ich los.", "Plusquamperfekt: Nachdem ich gegessen hatte, …"]] },
      ],
      ex: [["Nachdem ich die Anzeige gelesen hatte, rief ich sofort an.", "{Прочитавши оголошення, я одразу подзвонив.|Прочитавши оголошення, я одразу подзвонила.}"], ["Nachdem sie die Prüfung bestanden hatte, bekam sie eine Stelle.", "Після того як вона склала іспит, вона отримала роботу."], ["Nachdem wir umgezogen waren, meldeten wir uns beim Bürgerbüro um.", "Після переїзду ми перереєструвалися в бюро громадян."], ["Nach dem Termin gehe ich einkaufen.", "Після прийому я піду по покупки."]],
      warn: ["`nachdem` ≠ `danach`. `nachdem` — сполучник, дієслово в кінці: `Nachdem ich gegessen hatte, …`; `danach` — «потім», дієслово одразу за ним: `Danach bin ich gegangen.`"],
    },
    {
      id: "stellenanzeige", t: "Оголошення про роботу: VZ, TZ, m/w/d", cat: "rede",
      text: [
        "Оголошення (`die Stellenanzeige`) шукають на сайті Агентури праці (`Jobbörse der Bundesagentur für Arbeit`), на порталах вакансій і в місцевій газеті.",
        "`(m/w/d)` — männlich/weiblich/divers: вакансія для всіх. `VZ` — Vollzeit, повний день (близько 38–40 годин на тиждень); `TZ` — Teilzeit, неповний; `Minijob` — невеликий підробіток (2026 року — до 603 € на місяць).",
        "`ab sofort` — з цього моменту; `befristet` — на певний строк, `unbefristet` — безстроково; `Schichtdienst` — позмінна робота; `erforderlich` — обов’язково; `wünschenswert` — бажано, але не обов’язково.",
        "Мінімальна оплата праці (`der Mindestlohn`) 2026 року — 13,90 € за годину брутто. Менше платити не можна й на мініроботі.",
      ],
      tables: [
        { head: ["В оголошенні", "Значення"], rows: [["Wir suchen ab sofort …", "Шукаємо з цього моменту …"], ["Ihre Aufgaben", "Ваші обов’язки"], ["Ihr Profil / Das bringen Sie mit", "Що ми чекаємо від вас"], ["Wir bieten", "Що пропонуємо ми"], ["Berufserfahrung erwünscht", "Досвід бажаний"], ["Bewerbungsunterlagen", "Документи для відгуку: лист, резюме, свідоцтва"]] },
      ],
      ex: [["Wir suchen ab sofort eine Verkäuferin oder einen Verkäufer (m/w/d) in Teilzeit.", "Шукаємо з цього моменту продавчиню або продавця на неповний день."], ["Gute Deutschkenntnisse (B1) sind erforderlich.", "Обов’язкове добре знання німецької (B1)."], ["Bitte senden Sie Ihre Bewerbung per E-Mail.", "Будь ласка, надішліть відгук електронною поштою."]],
    },
    {
      id: "lebenslaufB1", t: "Резюме й Jobcenter: Lebenslauf, Einladung, Nachweise", cat: "rede",
      text: [
        "Німецьке резюме (`der Lebenslauf`) — таблиця на одну-дві сторінки: особисті дані, **досвід роботи** (від останнього місця), освіта, мови (`Ukrainisch: Muttersprache`, `Deutsch: B1`), комп’ютер, інтереси. Фото не обов’язкове.",
        "Дипломи з України варто подати на визнання (`die Anerkennung`): портал `Anerkennung in Deutschland` підкаже, яка установа відповідає саме за твою професію.",
        "Запрошення з Jobcenter (`die Einladung`) — обов’язкова зустріч. Не можеш прийти — **заздалегідь** повідом і поясни причину, наприклад лікарняним. Без поважної причини виплати можуть зменшити.",
        "Візьми з собою: запрошення, посвідку на проживання (`der Aufenthaltstitel`), резюме й **докази пошуку роботи** (`die Nachweise`): копії відгуків і відповідей.",
      ],
      ex: [["Ich habe eine Einladung zum Termin am Dienstag bekommen.", "{Я отримав запрошення на зустріч у вівторок.|Я отримала запрошення на зустріч у вівторок.}"], ["Ich kann leider nicht kommen, weil ich krank bin. Die Bescheinigung vom Arzt schicke ich mit.", "На жаль, я не можу прийти, бо хворію. Довідку від лікаря надсилаю разом із листом."], ["Ich habe mich bei drei Firmen beworben.", "{Я відгукнувся на вакансії трьох фірм.|Я відгукнулася на вакансії трьох фірм.}"]],
      tips: ["Зберігай кожен відгук і кожну відповідь (навіть відмову) в одній теці або в пошті — це твої докази для Jobcenter."],
    },
  ],
  phrases: [
    { t: "У Jobcenter", list: [["Ich habe einen Termin bei Frau Neumann.", "У мене зустріч із пані Нойман."], ["Hier sind meine Bewerbungen der letzten Wochen.", "Ось мої відгуки за останні тижні."], ["Könnten Sie mir einen Berufssprachkurs empfehlen?", "Не могли б Ви порадити мені курс професійної німецької?"], ["Ich möchte gern in meinem Beruf arbeiten.", "{Я хотів би працювати за фахом.|Я хотіла б працювати за фахом.}"]] },
    { t: "Про досвід", list: [["Ich habe drei Jahre in einem Büro gearbeitet.", "{Я три роки працював в офісі.|Я три роки працювала в офісі.}"], ["Mein Diplom wird gerade anerkannt.", "Мій диплом саме проходить визнання."], ["Ich kann gut mit Menschen umgehen.", "Я вмію працювати з людьми."], ["Ich lerne schnell.", "Я швидко вчуся."]] },
    { t: "Дзвінок щодо вакансії", list: [["Ist die Stelle noch frei?", "Вакансія ще вільна?"], ["Ab wann kann ich anfangen?", "З якого часу я можу почати?"], ["Wie viele Stunden pro Woche sind es?", "Скільки це годин на тиждень?"], ["An wen kann ich meine Bewerbung schicken?", "Кому я можу надіслати відгук?"]] },
  ],
  dialog: {
    t: "У Jobcenter",
    lines: [
      ["Beraterin", "Guten Tag, {Herr Schewtschenko|Frau Ukrajinka}. Bitte nehmen Sie Platz. Wie läuft der Deutschkurs?", "Добрий день, {пане Шевченку|пані Українко}. Сідайте, будь ласка. Як іде курс німецької?"],
      ["{Taras|Lessja}", "Danke, gut. Im Juni habe ich die A2-Prüfung bestanden, und jetzt mache ich den B1-Kurs.", "{Дякую, добре. У червні я склав іспит A2, а тепер навчаюся на курсі B1.|Дякую, добре. У червні я склала іспит A2, а тепер навчаюся на курсі B1.}"],
      ["Beraterin", "Sehr gut! Haben Sie sich schon beworben?", "Дуже добре! Ви вже відгукувалися на вакансії?"],
      ["{Taras|Lessja}", "{Ja. Nachdem ich meinen Lebenslauf geschrieben hatte, schickte ich drei Bewerbungen: an eine Druckerei, an eine Werbeagentur und an die Volkshochschule.|Ja. Nachdem ich meinen Lebenslauf geschrieben hatte, schickte ich drei Bewerbungen: an ein Übersetzungsbüro, an die Stadtbibliothek und an die Volkshochschule.}", "{Так. Написавши резюме, я надіслав три відгуки: у друкарню, у рекламну агенцію і в народний університет.|Так. Написавши резюме, я надіслала три відгуки: у бюро перекладів, у міську бібліотеку і в народний університет.}"],
      ["Beraterin", "Haben Sie schon Antworten bekommen?", "Ви вже отримали відповіді?"],
      ["{Taras|Lessja}", "{Die Druckerei hat abgesagt. Aber die Werbeagentur hat mich zu einem Gespräch eingeladen!|Die Bibliothek hat abgesagt. Aber das Übersetzungsbüro hat mich zu einem Gespräch eingeladen!}", "{Друкарня відмовила. Але рекламна агенція запросила мене на співбесіду!|Бібліотека відмовила. Але бюро перекладів запросило мене на співбесіду!}"],
      ["Beraterin", "Das ist ja toll! Haben Sie die Nachweise dabei?", "Це ж чудово! Докази у Вас із собою?"],
      ["{Taras|Lessja}", "Ja, hier sind die Kopien. Die Absage habe ich auch mitgebracht.", "{Так, ось копії. Відмову я теж приніс.|Так, ось копії. Відмову я теж принесла.}"],
      ["Beraterin", "Danke. Und Ihr Diplom aus der Ukraine – haben Sie das schon anerkennen lassen?", "Дякую. А Ваш диплом з України — Ви вже подали його на визнання?"],
      ["{Taras|Lessja}", "Noch nicht. Ich wusste nicht, wo ich das machen muss.", "{Ще ні. Я не знав, де це робити.|Ще ні. Я не знала, де це робити.}"],
      ["Beraterin", "Schauen Sie auf das Portal „Anerkennung in Deutschland“. Dort steht, welche Stelle zuständig ist. Die Kosten für die Übersetzung können wir prüfen.", "Подивіться на портал «Anerkennung in Deutschland». Там написано, яка установа відповідає. Оплату перекладу ми можемо розглянути."],
      ["{Taras|Lessja}", "Vielen Dank! Das mache ich noch diese Woche.", "Щиро дякую! Зроблю це ще цього тижня."],
      ["Beraterin", "Gern. Viel Erfolg beim Vorstellungsgespräch! Unser nächster Termin ist in vier Wochen.", "Прошу. Успіху на співбесіді! Наша наступна зустріч — через чотири тижні."],
    ],
  },
  tasks: [
    { t: "gap", q: "Gestern ___ ich einen Brief vom Jobcenter. (bekommen, Präteritum)", a: ["bekam"] },
    { t: "gap", q: "Der Kurs ___ im März. (beginnen, Präteritum)", a: ["begann"] },
    { t: "gap", q: "Früher ___ sie in Kyjiw. (wohnen, Präteritum)", a: ["wohnte"] },
    { t: "gap", q: "Er ___ lange an das Gespräch. (denken, Präteritum)", a: ["dachte"] },
    { t: "gap", q: "Als ich ankam, ___ der Zug schon abgefahren. (sein)", a: ["war"] },
    { t: "gap", q: "Nachdem ich die Anzeige gelesen ___, rief ich an. (haben)", a: ["hatte"] },
    { t: "gap", q: "___ ich gegessen habe, gehe ich spazieren.", a: ["Nachdem", "nachdem"] },
    { t: "gap", q: "Wir suchen eine Kassiererin oder einen Kassierer (m/w/___).", a: ["d"] },
    { t: "mc", q: "«VZ» в оголошенні означає…", o: ["повний робочий день", "неповний робочий день", "роботу у вихідні"], a: 0 },
    { t: "mc", q: "Яка форма — Präteritum від «gehen»?", o: ["gehte", "ging", "gegangen"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Nachdem ich gegessen hatte, ich ging los.", "Nachdem hatte ich gegessen, ging ich los.", "Nachdem ich gegessen hatte, ging ich los."], a: 2 },
    { t: "mc", q: "Лист із Jobcenter: `Einladung zum Termin am 12. März um 9 Uhr`. Того дня в тебе висока температура. Що робити?", o: ["Заздалегідь подзвонити чи написати й надіслати довідку від лікаря", "Просто не прийти — нічого не станеться", "Прийти наступного дня без запису"], a: 0 },
    { t: "mc", q: "В оголошенні: `Führerschein Klasse B wünschenswert`. Це означає…", o: ["без прав не візьмуть", "права бажані, але не обов’язкові", "права видадуть на роботі"], a: 1 },
    { t: "mc", q: "Що в німецькому резюме НЕ обов’язкове?", o: ["досвід роботи", "освіта", "фото"], a: 2 },
    { t: "mc", q: "`Die Stelle ist auf ein Jahr befristet.` Що це означає?", o: ["Договір на один рік", "Робота лише раз на рік", "Через рік підвищать зарплату"], a: 0 },
  ],
};
