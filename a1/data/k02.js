// Розділ 2. Контакти
export default {
  n: 2, part: "A1.1", title: "Контакти", book: "Kontakte",
  goals: [
    "назвати числа від 0 до 100 і продиктувати номер телефону",
    "продиктувати адресу електронної пошти",
    "розповісти, якими мовами говориш і ким працюєш",
    "ставити питання «так чи ні» і відповідати на них",
  ],
  grammar: [
    {
      id: "haben", t: "haben, lernen, sprechen", cat: "verb",
      text: [
        "**lernen** — правильне дієслово, змінюється за схемою з розділу 1: `ich lerne, du lernst, er lernt…`",
        "**haben** (мати) — неправильне у формах `du hast` і `er hat`: літера `b` зникає. Решта форм правильні.",
        "**sprechen** міняє голосний основи: **e → i** у формах `du` та `er/sie/es`: `du sprichst, er spricht`. Таких дієслів багато, їх розберемо в розділі 5. Форми `ich` і `wir` — без зміни.",
      ],
      tables: [
        { head: ["", "lernen", "haben", "sprechen"], rows: [
          ["ich", "lerne", "habe", "spreche"], ["du", "lernst", "**hast**", "**sprichst**"], ["er / sie / es", "lernt", "**hat**", "**spricht**"],
          ["wir", "lernen", "haben", "sprechen"], ["ihr", "lernt", "habt", "sprecht"], ["sie / Sie", "lernen", "haben", "sprechen"],
        ] },
      ],
      ex: [["Ich lerne Deutsch.", "Я вчу німецьку."], ["Hast du ein Handy?", "У тебе є мобільний?"], ["Sie hat eine E-Mail-Adresse.", "У неї є адреса e-mail."], ["Er spricht Ukrainisch und ein bisschen Deutsch.", "Він говорить українською і трохи німецькою."]],
      tips: ["Українське «у мене є» по-німецьки — `ich habe`: `Ich habe ein Handy.` Буквально «я маю мобільний»."],
      warn: ["`Bei mir ist ein Handy` — калька з української, так не кажуть. Треба `Ich habe ein Handy.`", "Мови пишуться з великої літери й без артикля: `Ich spreche Deutsch.`"],
    },
    {
      id: "janein", t: "Питання «так чи ні»", cat: "satz",
      text: [
        "Коли питального слова немає, **дієслово стає на перше місце**, підмет — одразу після нього. Інтонація йде вгору в кінці.",
        "Відповідь — `Ja` або `Nein` і повне речення. Заперечення `nicht` стоїть після дієслова, зазвичай ближче до кінця: `Ich wohne nicht in Wesel.`",
      ],
      tables: [
        { head: ["1 (дієслово)", "2 (підмет)", "далі"], rows: [["Sprechen", "Sie", "Englisch?"], ["Wohnst", "du", "in Xanten?"], ["Ist", "das", "Ihre Telefonnummer?"]] },
      ],
      ex: [["Sprechen Sie Englisch? – Ja, ein bisschen.", "Ви говорите англійською? – Так, трохи."], ["Wohnst du in Xanten? – Nein, in Wesel.", "Ти живеш у Ксантені? – Ні, у Везелі."], ["Lernst du Deutsch? – Ja, ich lerne jetzt Deutsch.", "Ти вчиш німецьку? – Так, я зараз вчу німецьку."], ["Ist das richtig? – Nein, das ist nicht richtig.", "Це правильно? – Ні, це неправильно."]],
      tips: ["Короткий спосіб перепитати: додати `oder?` наприкінці: `Du kommst aus Polen, oder?` — «Ти з Польщі, так?»"],
      warn: ["`Du sprichst Englisch?` з висхідною інтонацією в розмові можливо, але правильна форма питання — `Sprichst du Englisch?`"],
    },
    {
      id: "was", t: "was? і професії", cat: "satz",
      text: [
        "**was?** — «що?». Про роботу питають двома способами: `Was sind Sie von Beruf?` (ким Ви працюєте за професією?) і простіше `Was machen Sie?`",
        "Більшість професій мають **жіночу форму на -in**: `der Lehrer → die Lehrerin`, `der Programmierer → die Programmiererin`. Іноді додається умлаут: `der Arzt → die Ärztin`, `der Koch → die Köchin`. Множина жіночої форми: **-innen**.",
        "Про свою професію кажуть **без артикля**: `Ich bin Lehrerin.`",
      ],
      tables: [
        { head: ["він", "вона", "множина (вона)"], rows: [["der Lehrer", "die Lehrerin", "die Lehrerinnen"], ["der Student", "die Studentin", "die Studentinnen"], ["der Arzt", "die Ärztin", "die Ärztinnen"], ["der Koch", "die Köchin", "die Köchinnen"], ["der Verkäufer", "die Verkäuferin", "die Verkäuferinnen"]] },
      ],
      ex: [["Was sind Sie von Beruf? – Ich bin {Maler|Übersetzerin}.", "Ким Ви працюєте? – Я {художник|перекладачка}."], ["Was machst du? – Ich studiere Informatik.", "Чим ти займаєшся? – Я вивчаю інформатику."], ["Mein Bruder ist Koch.", "Мій брат — кухар."], ["Ich arbeite als Verkäuferin.", "Я працюю продавчинею."]],
      tips: ["`als` + професія = «як, у ролі»: `Ich arbeite als Fahrer.` — «Я працюю водієм». Теж без артикля."],
      warn: ["`Ich bin ein Lehrer` — так кажуть лише з прикметником: `Ich bin ein guter Lehrer.` Просто про професію — без артикля."],
    },
    {
      id: "zahlen", t: "Числа від 0 до 100", cat: "zeit",
      text: [
        "Від 13 до 19: одиниці + `zehn`: `dreizehn, vierzehn…` Скорочуються `sechzehn` (не sechszehn) і `siebzehn` (не siebenzehn).",
        "**Головна пастка:** від 21 до 99 спершу кажуть **одиниці**, потім **десятки**, через `und`: `einundzwanzig` = «один-і-двадцять» = 21. Одним словом.",
        "Десятки — на `-zig`, крім `dreißig` (з ß). Також скорочуються `sechzig` і `siebzig`.",
      ],
      tables: [
        { head: ["", "", "", ""], rows: [
          ["0 null", "1 eins", "2 zwei", "3 drei"], ["4 vier", "5 fünf", "6 sechs", "7 sieben"], ["8 acht", "9 neun", "10 zehn", "11 elf"],
          ["12 zwölf", "13 dreizehn", "16 sechzehn", "17 siebzehn"], ["20 zwanzig", "21 einundzwanzig", "30 dreißig", "40 vierzig"],
          ["50 fünfzig", "60 sechzig", "70 siebzig", "80 achtzig"], ["90 neunzig", "99 neunundneunzig", "100 hundert", "35 fünfunddreißig"],
        ] },
      ],
      ex: [["Ich bin einundzwanzig Jahre alt.", "Мені двадцять один рік."], ["Meine Hausnummer ist siebenundvierzig.", "Мій номер будинку — сорок сім."], ["Die Postleitzahl von Xanten ist vier sechs fünf null neun.", "Індекс Ксантена — 46509."]],
      tips: [
        "Номер телефону диктують **по цифрах** або **парами**: `0 2 8 01` = «null zwo acht null eins». Замість `zwei` по телефону часто кажуть **zwo**, щоб не сплутати з `drei`.",
        "Коли записуєш число на слух, спершу запиши другу цифру, потім першу: почув «vierundsechzig» → пиши 4, потім 6 перед нею: 64.",
      ],
      warn: ["`einsundzwanzig` — помилка: у складених числах `ein-`, без s: `einundzwanzig`. А сама одиниця — `eins`."],
    },
    {
      id: "email", t: "Як продиктувати e-mail і телефон", cat: "rede",
      text: ["В анкетах і по телефону доведеться диктувати адресу пошти. Знаки мають свої назви:"],
      tables: [
        { head: ["Знак", "Як сказати"], rows: [["@", "ät"], [".", "Punkt"], ["-", "Bindestrich (або Minus)"], ["_", "Unterstrich"], ["великі/малі літери", "groß / klein"]] },
      ],
      ex: [["Meine E-Mail-Adresse ist anna Punkt koval ät gmail Punkt com.", "Моя адреса: anna.koval@gmail.com."], ["Meine Handynummer ist null eins fünf eins …", "Мій номер мобільного: 0151…"], ["Wie ist Ihre Telefonnummer?", "Який Ваш номер телефону?"]],
    },
  ],
  phrases: [
    { t: "Мови", list: [["Welche Sprachen sprechen Sie?", "Якими мовами Ви говорите?"], ["Ich spreche Ukrainisch und Englisch.", "Я говорю українською та англійською."], ["Ich spreche ein bisschen Deutsch.", "Я трохи говорю німецькою."], ["Ich lerne Deutsch.", "Я вчу німецьку."]] },
    { t: "Робота й навчання", list: [["Was sind Sie von Beruf?", "Ким Ви працюєте?"], ["Ich bin {Student|Studentin}.", "Я {студент|студентка}."], ["Ich arbeite als {Programmierer|Programmiererin}.", "Я працюю {програмістом|програмісткою}."], ["Ich suche Arbeit.", "Я шукаю роботу."]] },
    { t: "Контакти", list: [["Wie ist Ihre Telefonnummer?", "Який Ваш номер телефону?"], ["Haben Sie eine E-Mail-Adresse?", "У Вас є адреса електронної пошти?"], ["Noch einmal, bitte. Langsam.", "Ще раз, будь ласка. Повільно."]] },
  ],
  dialog: {
    t: "Обмін контактами після заняття",
    lines: [
      ["Max", "Hallo, ich bin Max. Du bist {Taras|Lessja}, oder?", "Привіт, я Макс. Ти {Тарас|Леся}, так?"],
      ["{Taras|Lessja}", "Ja, genau. Sprichst du Englisch?", "Так, точно. Ти говориш англійською?"],
      ["Max", "Ja, aber wir lernen Deutsch, also sprechen wir Deutsch!", "Так, але ми вчимо німецьку, тож говорімо німецькою!"],
      ["{Taras|Lessja}", "Okay! Was machst du, Max?", "Добре! Чим ти займаєшся, Максе?"],
      ["Max", "Ich bin Koch. Und du?", "Я кухар. А ти?"],
      ["{Taras|Lessja}", "Ich bin {Dichter und Maler|Dichterin und Übersetzerin}. Hast du WhatsApp?", "Я {поет і художник|поетка й перекладачка}. У тебе є WhatsApp?"],
      ["Max", "Ja. Meine Nummer ist null eins sieben sechs, drei zwo, achtundvierzig, fünfzehn.", "Так. Мій номер: 0176 32 48 15."],
      ["{Taras|Lessja}", "Danke! Bis morgen!", "Дякую! До завтра!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Du ___ Deutsch, oder? (sprechen)", a: ["sprichst"], why: "sprechen: e → i у формі du." },
    { t: "gap", q: "Er ___ ein Handy. (haben)", a: ["hat"], why: "haben: er hat." },
    { t: "gap", q: "Wir ___ Deutsch. (lernen)", a: ["lernen"] },
    { t: "gap", q: "___ du Englisch? (sprechen)", a: ["Sprichst"], why: "У питанні без W-слова дієслово перше." },
    { t: "gap", q: "Sie ist Lehrer___.", a: ["in"], why: "Жіноча форма професії: -in." },
    { t: "mc", q: "Як німецькою 27?", o: ["zwanzigsieben", "siebenundzwanzig", "siebenzwanzig"], a: 1, why: "Спершу одиниці, потім und і десятки." },
    { t: "mc", q: "Як німецькою 16?", o: ["sechszehn", "sechzehn", "sechzig"], a: 1, why: "sechzehn — без s. sechzig = 60." },
    { t: "mc", q: "Почув «dreiundachtzig». Яке число?", o: ["38", "83", "803"], a: 1 },
    { t: "mc", q: "Яке питання «так чи ні» правильне?", o: ["Wohnst du in Wesel?", "Du wohnst in Wesel wohnst?", "In Wesel du wohnst?"], a: 0, why: "Дієслово на першому місці." },
    { t: "mc", q: "Ich bin ___ Studentin.", o: ["eine", "—", "die"], a: 1, why: "Професія без артикля." },
    { t: "mc", q: "Як сказати «@» при диктуванні e-mail?", o: ["Punkt", "ät", "Strich"], a: 1 },
    { t: "mc", q: "Що означає «Was sind Sie von Beruf?»", o: ["Звідки Ви?", "Ким Ви працюєте?", "Що Ви вчите?"], a: 1 },
    { t: "gap", q: "Ich ___ als Programmierer. (arbeiten)", a: ["arbeite"], why: "ich → -e." },
  ],
};
