// Розділ 1. Знайомство. Text marks: **bold**, `German` (shown as German, in italics).
export default {
  n: 1, part: "A1.1", title: "Знайомство", book: "Herzlich willkommen!",
  goals: [
    "привітатися й попрощатися вранці, вдень і ввечері",
    "назвати своє ім’я, країну й місто, де живеш",
    "запитати когось про ім’я, походження й місце проживання",
    "назвати слово по літерах (буквувати)",
    "розрізняти «ти» і «Ви» по-німецьки",
  ],
  grammar: [
    {
      id: "abc", t: "Абетка і вимова", cat: "laut",
      text: [
        "Німецька пишеться латиницею, і більшість літер читається так, як пишеться. Але кілька **сполучень літер** звучать інакше, ніж підказує латиниця, і їх варто вивчити одразу: так ти прочитаєш будь-яке нове слово.",
        "Коли тебе просять продиктувати ім’я (а в установах просять завжди), називають літери так, як у таблиці: `Ka-O-Ve-A-El` для Koval. Попроси: `Können Sie das bitte buchstabieren?` — «Можете назвати по літерах?»",
      ],
      tables: [
        { cap: "Назви літер", head: ["Літера", "Назва", "Літера", "Назва"], rows: [
          ["A a", "а", "N n", "ен"], ["B b", "бе", "O o", "о"], ["C c", "це", "P p", "пе"], ["D d", "де", "Q q", "ку"],
          ["E e", "е", "R r", "ер"], ["F f", "еф", "S s", "ес"], ["G g", "ге", "T t", "те"], ["H h", "га", "U u", "у"],
          ["I i", "і", "V v", "фау"], ["J j", "йот", "W w", "ве"], ["K k", "ка", "X x", "ікс"], ["L l", "ел", "Y y", "іпсилон"],
          ["M m", "ем", "Z z", "цет"], ["Ä ä", "а-умлаут [е]", "Ö ö", "о-умлаут"], ["Ü ü", "у-умлаут", "ß", "есцет [с]"],
        ] },
        { cap: "Що читається не так, як пишеться", head: ["Пишеться", "Звучить", "Приклад"], rows: [
          ["ei, ai", "[ай]", "`mein`, `Mai`"],
          ["ie", "довге [і:]", "`Liebe`, `vier`"],
          ["eu, äu", "[ой]", "`heute`, `Häuser`"],
          ["au", "[ау]", "`Frau`, `Haus`"],
          ["sch", "[ш]", "`Schule`, `Tisch`"],
          ["sp-, st- на початку", "[шп], [шт]", "`Sport`, `Straße`"],
          ["ch після a, o, u", "[х]", "`acht`, `Buch`"],
          ["ch після інших", "[хь], м’яко", "`ich`, `Milch`"],
          ["-ig у кінці", "[іхь]", "`zwanzig`, `richtig`"],
          ["z, tz", "[ц]", "`Zimmer`, `Platz`"],
          ["v", "здебільшого [ф]", "`Vater`, `vier`"],
          ["w", "[в]", "`Wasser`, `wohnen`"],
          ["s перед голосним", "[з]", "`Sonne`, `sie`"],
          ["ß, ss", "[с]", "`Straße`, `Kasse`"],
          ["j", "[й]", "`ja`, `Januar`"],
          ["h після голосного", "не звучить, голосний довгий", "`sehr`, `Uhr`"],
          ["-er у кінці", "м’яке [а]", "`Vater` (≈ «фа:та»), `Lehrer`"],
          ["ä", "[е]", "`Käse`"],
          ["ö", "[е] з губами, як для [о]", "`schön`, `hören`"],
          ["ü", "[і] з губами, як для [у]", "`Tür`, `fünf`"],
        ] },
      ],
      ex: [["Wie schreibt man das?", "Як це пишеться?"], ["Können Sie das bitte buchstabieren?", "Можете назвати це по літерах?"], ["K-O-V-A-L", "Ка-О-Фау-А-Ел"]],
      tips: [
        "Подвоєний приголосний робить голосний перед ним коротким: `Mitte` (коротке і) — `Miete` (довге і).",
        "Наголос здебільшого на першому складі: `Mor·gen`, `Na·me`, `Stra·ße`. Винятки — переважно іншомовні слова й назви: `Ber·lin`, `Stu·dent`.",
        "Іменники пишуться **з великої літери**, усі: `der Tisch`, `die Stadt`. Так їх легко впізнати в тексті.",
      ],
      warn: [
        "`v` — не [в], а [ф]: `Vater` ≈ «фа:та», `vier` ≈ «фі:а». Звук [в] пишеться як `w`: `Wasser`.",
        "`ei` і `ie` легко сплутати. Запам’ятай пару: `Wein` ≈ «вайн» (вино) і `Wien` ≈ «ві:н» (Відень).",
      ],
    },
    {
      id: "pron", t: "Особові займенники", cat: "pron",
      text: [
        "Займенники майже як в українській, але є **три «sie»**: `sie` (вона), `sie` (вони) і ввічливе `Sie` (Ви, з великої літери). Які з них мається на увазі, підказує закінчення дієслова й велика літера.",
        "**Ввічливе Sie** вживають з незнайомими дорослими, в установах, у магазині, з лікарем, з викладачем. **du** — з родиною, друзями, дітьми й часто з однолітками. Якщо сумніваєшся, кажи `Sie`: перейти на «ти» запропонує сам співрозмовник (`Wollen wir uns duzen?`).",
      ],
      tables: [
        { head: ["Однина", "", "Множина", ""], rows: [
          ["ich", "я", "wir", "ми"], ["du", "ти", "ihr", "ви (кілька, на «ти»)"], ["er / sie / es", "він / вона / воно", "sie", "вони"],
          ["", "", "Sie", "Ви (ввічливо, одна людина чи кілька)"],
        ] },
      ],
      ex: [["Sie kommt aus Polen.", "Вона з Польщі."], ["Sie kommen aus Polen.", "Вони з Польщі. / Ви з Польщі."], ["Kommen Sie aus Polen?", "Ви з Польщі?"], ["Ihr wohnt in Wesel, oder?", "Ви (обоє) живете у Везелі, так?"]],
      warn: [
        "`ihr` — це «ви» до кількох друзів, а не ввічливе «Ви». Звертаючись до однієї людини на «Ви», кажи `Sie`.",
        "`ich` пишеться з маленької літери (на відміну від англійського I), а ввічливе `Sie` — завжди з великої, навіть посеред речення.",
      ],
    },
    {
      id: "sein", t: "Дієслово sein (бути)", cat: "verb",
      text: [
        "**sein** — найважливіше дієслово, і воно неправильне: форми треба вивчити напам’ять.",
        "В українській у теперішньому часі «є» зазвичай пропускаємо: «Я студент». У німецькій дієслово **ніколи не пропускається**: `Ich bin Student.` Без дієслова речення неправильне.",
      ],
      tables: [
        { head: ["", "sein"], rows: [["ich", "bin"], ["du", "bist"], ["er / sie / es", "ist"], ["wir", "sind"], ["ihr", "seid"], ["sie / Sie", "sind"]] },
      ],
      ex: [["Ich bin Olena.", "Я Олена."], ["Bist du neu hier?", "Ти тут новенький?"], ["Das ist Herr Weber.", "Це пан Вебер."], ["Wir sind aus der Ukraine.", "Ми з України."], ["Seid ihr Freunde?", "Ви друзі?"]],
      tips: ["Про професію й національність кажуть **без артикля**: `Ich bin Studentin.` (не `eine Studentin`), `Er ist Lehrer.`"],
      warn: ["`Ich Olena.` — помилка. Треба `Ich bin Olena.` або `Ich heiße Olena.`", "`seid` (ви є) і `seit` (з якогось часу) звучать однаково, але це різні слова."],
    },
    {
      id: "praesens", t: "Теперішній час: heißen, kommen, wohnen", cat: "verb",
      text: [
        "Майже всі дієслова в неозначеній формі закінчуються на **-en**: `komm-en`, `wohn-en`. Відкидаємо `-en`, отримуємо **основу** (`komm-`) і додаємо закінчення особи.",
        "Закінчення однакові для більшості дієслів, тож ця таблиця працює для сотень слів: `lernen`, `machen`, `spielen`, `fragen`…",
        "Якщо основа закінчується на **-s, -ß, -z**, у формі `du` додається лише **-t**: `du heißt` (не heißst), `du tanzt`.",
      ],
      tables: [
        { head: ["", "закінчення", "kommen", "wohnen", "heißen"], rows: [
          ["ich", "-e", "komme", "wohne", "heiße"], ["du", "-st", "kommst", "wohnst", "heißt"], ["er / sie / es", "-t", "kommt", "wohnt", "heißt"],
          ["wir", "-en", "kommen", "wohnen", "heißen"], ["ihr", "-t", "kommt", "wohnt", "heißt"], ["sie / Sie", "-en", "kommen", "wohnen", "heißen"],
        ] },
      ],
      ex: [["Ich heiße Taras.", "Мене звати Тарас."], ["Wie heißt du?", "Як тебе звати?"], ["Er kommt aus Spanien.", "Він з Іспанії."], ["Wir wohnen in Xanten.", "Ми живемо в Ксантені."], ["Wo wohnen Sie?", "Де Ви живете?"]],
      tips: ["Форми `wir`, `sie` і `Sie` завжди однакові з інфінітивом: `wir kommen`, `sie kommen`, `Sie kommen`."],
      warn: ["`Ich heiße` — «мене звати», хоча буквально «я називаюся». `Mich heißt` — помилка."],
    },
    {
      id: "wfrage", t: "W-питання і місце дієслова", cat: "satz",
      text: [
        "Питання з питальним словом (воно майже завжди починається на **W**) будуються за схемою: **W-слово — дієслово — підмет — решта**. Дієслово стоїть на **другому місці**.",
        "Ця «друга позиція дієслова» — головне правило німецького речення. Воно діє і у відповідях: `Ich wohne in Xanten.` — дієслово друге.",
      ],
      tables: [
        { cap: "Питальні слова розділу", head: ["Слово", "Значення", "Приклад"], rows: [
          ["wer?", "хто?", "`Wer ist das?`"], ["wie?", "як?", "`Wie heißen Sie?`"], ["woher?", "звідки?", "`Woher kommst du?`"], ["wo?", "де?", "`Wo wohnt ihr?`"], ["was?", "що?", "`Was ist das?`"],
        ] },
        { cap: "Позиції в реченні", head: ["1", "2 (дієслово)", "3", "далі"], rows: [
          ["Woher", "kommst", "du?", ""], ["Ich", "komme", "", "aus der Ukraine."], ["Wo", "wohnen", "Sie?", ""], ["Ich", "wohne", "", "in Xanten."],
        ] },
      ],
      ex: [["Woher kommen Sie? – Aus Österreich.", "Звідки Ви? – З Австрії."], ["Wo wohnst du? – In Wesel.", "Де ти живеш? – У Везелі."], ["Wer ist das? – Das ist Anna.", "Хто це? – Це Анна."]],
      tips: [
        "Звідки — `aus`, де — `in`: `aus Polen`, `in Polen`.",
        "Кілька країн мають артикль: **die Ukraine, die Schweiz, die Türkei, die USA**. Після `aus` і `in` він змінюється: `aus der Ukraine`, `in der Schweiz`, `aus den USA`. Просто запам’ятай ці фрази, чому так — у розділі 12.",
      ],
      warn: ["`Woher du kommst?` — помилка (так лише в підрядному реченні). У питанні дієслово друге: `Woher kommst du?`", "`Ich komme aus Ukraine` — помилка, потрібен артикль: `aus der Ukraine`."],
    },
    {
      id: "gruss", t: "Привітання: коли що казати", cat: "rede",
      text: [
        "Німці вітаються за часом доби. `Guten Morgen` — приблизно до 10–11 години, `Guten Tag` — удень, `Guten Abend` — з 17–18 години. `Gute Nacht` кажуть лише перед сном, це не привітання.",
        "**Hallo** і **Tschüss** — для знайомих і друзів, але в магазині чи на касі теж звучать нормально. У Рейнланді, де Ксантен, часто почуєш короткі `Morgen!` і `Tach!` (розмовне «добрий день»).",
        "На `Wie geht's?` (як справи?) відповідають коротко: `Gut, danke. Und dir?`. Довга розповідь про справи тут не очікується.",
      ],
      tables: [
        { head: ["Формально (Sie)", "Неформально (du)"], rows: [
          ["Guten Tag, Frau Weber!", "Hallo, Anna!"], ["Wie geht es Ihnen?", "Wie geht's?"], ["Danke, gut. Und Ihnen?", "Gut, danke. Und dir?"], ["Auf Wiedersehen!", "Tschüss! / Bis morgen!"],
        ] },
      ],
      ex: [["Guten Morgen, Herr Schmidt!", "Доброго ранку, пане Шмідт!"], ["Hallo, ich bin Max. Und du?", "Привіт, я Макс. А ти?"], ["Freut mich!", "Приємно познайомитися!"]],
      tips: ["`Frau` і `Herr` + прізвище — стандартне ввічливе звертання: `Frau Koval`, `Herr Weber`. Без прізвища `Frau!` чи `Herr!` звучить грубо."],
    },
  ],
  phrases: [
    { t: "Привітатися й попрощатися", list: [["Guten Morgen!", "Доброго ранку!"], ["Guten Tag!", "Добрий день!"], ["Hallo!", "Привіт!"], ["Auf Wiedersehen!", "До побачення!"], ["Tschüss, bis morgen!", "Бувай, до завтра!"]] },
    { t: "Представитися", list: [["Ich heiße Olena Koval.", "Мене звати Олена Коваль."], ["Mein Name ist Olena Koval.", "Моє ім’я Олена Коваль."], ["Ich komme aus der Ukraine, aus Sumy.", "Я з України, із Сум."], ["Ich wohne jetzt in Xanten.", "Тепер я живу в Ксантені."]] },
    { t: "Запитати", list: [["Wie heißen Sie? / Wie heißt du?", "Як Вас / тебе звати?"], ["Woher kommen Sie?", "Звідки Ви?"], ["Wo wohnen Sie?", "Де Ви живете?"], ["Wie geht es Ihnen?", "Як Ваші справи?"]] },
    { t: "Коли не зрозумів", list: [["Wie bitte?", "Перепрошую, що?"], ["Noch einmal, bitte.", "Ще раз, будь ласка."], ["Langsam, bitte.", "Повільніше, будь ласка."], ["Wie schreibt man das?", "Як це пишеться?"]] },
  ],
  dialog: {
    t: "На першому занятті курсу",
    lines: [
      ["Lehrerin", "Guten Morgen! Ich heiße Sabine Krüger. Wie heißen Sie?", "Доброго ранку! Мене звати Забіне Крюґер. Як Вас звати?"],
      ["Olena", "Guten Morgen! Ich heiße Olena Koval.", "Доброго ранку! Мене звати Олена Коваль."],
      ["Lehrerin", "Wie bitte? Können Sie das buchstabieren?", "Перепрошую? Можете назвати по літерах?"],
      ["Olena", "K-O-V-A-L.", "Ка-О-Фау-А-Ел."],
      ["Lehrerin", "Danke. Und woher kommen Sie, Frau Koval?", "Дякую. А звідки Ви, пані Коваль?"],
      ["Olena", "Ich komme aus der Ukraine, aus Sumy. Jetzt wohne ich in Xanten.", "Я з України, із Сум. Тепер я живу в Ксантені."],
      ["Lehrerin", "Herzlich willkommen im Kurs!", "Ласкаво просимо на курс!"],
      ["Olena", "Danke!", "Дякую!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich ___ Olena.", a: ["heiße"], why: "ich → закінчення -e: heiß-e." },
    { t: "gap", q: "Woher ___ du?", a: ["kommst"], why: "du → -st: komm-st." },
    { t: "gap", q: "Wir ___ in Xanten.", a: ["wohnen"], why: "wir → -en, як в інфінітиві." },
    { t: "gap", q: "Er ___ aus Polen.", a: ["kommt"], why: "er → -t." },
    { t: "gap", q: "Du ___ Taras, oder?", a: ["bist"], why: "sein: du bist." },
    { t: "gap", q: "___ ihr Freunde?", a: ["Seid"], why: "sein: ihr seid. Не плутай із seit." },
    { t: "gap", q: "Wie ___ du? – Ich heiße Max.", a: ["heißt"], why: "Основа на -ß: du heiß-t, без ще одного s." },
    { t: "mc", q: "Як ввічливо запитати ім’я в незнайомої людини?", o: ["Wie heißt du?", "Wie heißen Sie?", "Wer bist du?"], a: 1, why: "З незнайомими — Sie і форма на -en." },
    { t: "mc", q: "Ich komme aus ___ Ukraine.", o: ["—", "der", "die"], a: 1, why: "Ukraine має артикль; після aus: aus der Ukraine." },
    { t: "mc", q: "Яке питання пасує до відповіді «In Wesel»?", o: ["Woher kommst du?", "Wo wohnst du?", "Wie heißt du?"], a: 1, why: "Wo? — де? Відповідь з in." },
    { t: "mc", q: "«Sie kommt aus Italien.» Хто такий sie?", o: ["вона", "вони", "Ви"], a: 0, why: "Дієслово kommt — форма 3-ї особи однини, отже «вона». Для «вони» і «Ви» було б kommen." },
    { t: "mc", q: "Як вимовляється ei в слові mein?", o: ["[ей]", "[ай]", "[і:]"], a: 1, why: "ei = [ай]: mein «майн»." },
    { t: "mc", q: "Що відповісти на «Wie geht’s?»", o: ["Danke, gut. Und dir?", "Ich heiße Max.", "Aus Polen."], a: 0 },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich Student.", "Ich bin Student.", "Ich bin ein Student aus."], a: 1, why: "Дієслово обов’язкове, професія без артикля." },
  ],
};
