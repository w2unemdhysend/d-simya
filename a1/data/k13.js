// Розділ 13. Робота й документи. Граматика — як у розділі 13 Die neue Linie 1, тема наша.
export default {
  n: 13, part: "A1.2", title: "Робота й документи", book: null,
  goals: [
    "розповісти про роботу: де, коли, скільки годин",
    "передати чужу вказівку або пораду (sollen)",
    "з’єднувати речення словами und, oder, aber",
    "заповнити простий формуляр",
  ],
  grammar: [
    {
      id: "sollen", t: "sollen: «мені сказали, що треба»", cat: "verb",
      text: [
        "**sollen** — обов’язок, який іде **від іншої людини**: лікаря, начальника, установи, правил. `Der Arzt sagt, ich soll viel trinken.` — лікар каже, що я маю багато пити.",
        "Порівняй з `müssen`: `Ich muss arbeiten` — це необхідність (так склалося), `Ich soll arbeiten` — мені так сказали.",
        "У питанні `Soll ich…?` — пропозиція або прохання поради: `Soll ich das Fenster öffnen?` — Відчинити вікно? / `Was soll ich machen?` — Що мені робити?",
        "Форми як у інших модальних: `ich soll, du sollst, er soll` (без закінчення в ich/er), рамка з інфінітивом у кінці.",
      ],
      tables: [
        { head: ["", "sollen"], rows: [["ich", "soll"], ["du", "sollst"], ["er / sie / es", "soll"], ["wir", "sollen"], ["ihr", "sollt"], ["sie / Sie", "sollen"]] },
      ],
      ex: [["Die Chefin sagt, wir sollen um acht Uhr da sein.", "Керівниця каже, що ми маємо бути о восьмій."], ["Sie sollen das Formular unterschreiben.", "Вам треба підписати формуляр."], ["Soll ich dir helfen?", "Тобі допомогти?"], ["Was soll ich mitbringen?", "Що мені принести?"], ["Ich soll morgen um neun anrufen.", "Мені сказали подзвонити завтра о дев’ятій."]],
      warn: ["`Soll ich dir helfen?` — це пропозиція допомоги, а не «чи повинен я». Відповідай `Ja, gern!` або `Nein, danke.`"],
    },
    {
      id: "konj", t: "und, oder, aber: два речення в одному", cat: "satz",
      text: [
        "Сполучники **und** (і), **oder** (або), **aber** (але) з’єднують два головні речення й **не займають місця** в реченні. Після них порядок звичайний: щось на 1-му місці, дієслово на 2-му.",
        "Перед `aber` ставлять **кому**, перед `und` і `oder` між двома реченнями — ні (за потреби можна).",
        "Якщо підмет однаковий, його можна не повторювати після `und`: `Ich arbeite bei Lidl und lerne Deutsch.`",
      ],
      tables: [
        { head: ["Речення 1", "0", "1", "2", "далі"], rows: [["Ich arbeite in Wesel", "und", "meine Frau", "arbeitet", "in Xanten."], ["Wir fahren mit dem Bus", "oder", "wir", "nehmen", "das Fahrrad."], ["Der Job ist interessant,", "aber", "der Lohn", "ist", "nicht hoch."], ["Ich habe heute Zeit,", "aber", "morgen", "muss", "ich arbeiten."]] },
      ],
      ex: [["Ich suche eine Stelle und lerne Deutsch.", "Я шукаю роботу й вчу німецьку."], ["Kommst du heute oder kommst du morgen?", "Ти прийдеш сьогодні чи завтра?"], ["Die Arbeit ist anstrengend, aber die Kollegen sind nett.", "Робота важка, але колеги приємні."], ["Ich möchte kommen, aber ich habe keine Zeit.", "Я хотів би прийти, але не маю часу."]],
      warn: ["`…, aber morgen ich muss arbeiten` — помилка. Після aber звичайний порядок: `aber morgen muss ich arbeiten`."],
    },
    {
      id: "arbeit", t: "Про роботу", cat: "rede",
      text: [
        "`Vollzeit` — повна зайнятість, `Teilzeit` — неповна, `Minijob` — невеликий підробіток. Працюють `in Schichten` (змінами): `Frühschicht`, `Spätschicht`, `Nachtschicht`.",
        "Про графік: `Ich arbeite von Montag bis Freitag, acht Stunden am Tag.` Про оплату: `Ich verdiene … Euro pro Stunde / im Monat.`",
        "Для заяви на роботу потрібні `Lebenslauf` (резюме) і `Anschreiben` (супровідний лист); на співбесіду (`Vorstellungsgespräch`) — вчасно, `pünktlich`, це в Німеччині важливо.",
      ],
      ex: [["Ich arbeite Teilzeit im Supermarkt.", "Я працюю на неповну ставку в супермаркеті."], ["Wie viele Stunden arbeitest du pro Woche?", "Скільки годин на тиждень ти працюєш?"], ["Ich habe nächste Woche Spätschicht.", "Наступного тижня в мене вечірня зміна."], ["Ich habe Erfahrung als Programmierer.", "У мене є досвід роботи програмістом."]],
    },
    {
      id: "formular", t: "Формуляр: що де писати", cat: "rede",
      text: ["В установах і на роботі майже завжди треба щось заповнити. Ось поля, які трапляються найчастіше:"],
      tables: [
        { head: ["Поле", "Що писати"], rows: [
          ["Name / Nachname / Familienname", "прізвище"], ["Vorname", "ім’я"], ["Geburtsdatum", "дата народження (TT.MM.JJJJ)"], ["Geburtsort", "місце народження"],
          ["Staatsangehörigkeit", "громадянство"], ["Familienstand", "сімейний стан (ledig, verheiratet…)"], ["Anschrift / Adresse", "адреса"], ["Straße, Hausnummer", "вулиця, номер будинку"],
          ["PLZ, Ort", "індекс, населений пункт"], ["Telefon / E-Mail", "телефон / e-mail"], ["Datum, Unterschrift", "дата, підпис"], ["Zutreffendes bitte ankreuzen", "позначте хрестиком потрібне"],
        ] },
      ],
      ex: [["Füllen Sie bitte das Formular aus.", "Заповніть, будь ласка, формуляр."], ["Unterschreiben Sie bitte hier unten.", "Підпишіть, будь ласка, тут унизу."], ["Brauchen Sie eine Kopie von meinem Ausweis?", "Вам потрібна копія мого посвідчення?"]],
      tips: ["Сканер у застосунку перекладає офіційні листи й формуляри: сфотографуй, і отримаєш переклад."],
    },
  ],
  phrases: [
    { t: "Робота", list: [["Wo arbeiten Sie?", "Де Ви працюєте?"], ["Ich arbeite bei einer Firma in Wesel.", "Я працюю у фірмі у Везелі."], ["Ich arbeite in Vollzeit.", "Я працюю на повну ставку."], ["Ich suche eine Stelle als Verkäuferin.", "Я шукаю роботу продавчинею."], ["Wann fängt die Arbeit an?", "О котрій починається робота?"]] },
    { t: "Вказівки", list: [["Was soll ich machen?", "Що мені робити?"], ["Soll ich das kopieren?", "Мені це скопіювати?"], ["Sie sollen morgen anrufen.", "Вам треба завтра подзвонити."], ["Füllen Sie das bitte aus.", "Заповніть це, будь ласка."]] },
  ],
  dialog: {
    t: "Перший день на роботі",
    lines: [
      ["Chefin", "Guten Morgen, Herr Bondar! Willkommen im Team.", "Доброго ранку, пане Бондар! Ласкаво просимо в команду."],
      ["Taras", "Guten Morgen! Danke. Was soll ich heute machen?", "Доброго ранку! Дякую. Що мені сьогодні робити?"],
      ["Chefin", "Zuerst sollen Sie bitte diesen Vertrag unterschreiben. Und hier ist ein Formular.", "Спочатку підпишіть, будь ласка, цей договір. А ось формуляр."],
      ["Taras", "Soll ich das gleich ausfüllen?", "Мені заповнити його одразу?"],
      ["Chefin", "Ja, bitte. Dann zeigt Ihnen Frau Yilmaz das Lager.", "Так, будь ласка. Потім пані Їлмаз покаже Вам склад."],
      ["Taras", "Und wann ist die Pause?", "А коли перерва?"],
      ["Chefin", "Um zwölf. Die Arbeit fängt um acht an und hört um halb fünf auf.", "О дванадцятій. Робота починається о восьмій і закінчується о пів на п’яту."],
      ["Taras", "Alles klar. Ich bin gespannt!", "Зрозуміло. Мені цікаво!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Der Arzt sagt, ich ___ viel trinken. (sollen)", a: ["soll"] },
    { t: "gap", q: "___ ich das Fenster öffnen? (sollen)", a: ["Soll"] },
    { t: "gap", q: "Ihr ___ morgen pünktlich sein. (sollen)", a: ["sollt"] },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich habe Zeit, aber morgen ich muss arbeiten.", "Ich habe Zeit, aber morgen muss ich arbeiten.", "Ich habe Zeit, aber muss morgen ich arbeiten."], a: 1, why: "aber не займає місця; далі: morgen (1) — muss (2) — ich." },
    { t: "mc", q: "Ich arbeite in Wesel ___ meine Frau arbeitet in Xanten.", o: ["und", "aber", "denn"], a: 0 },
    { t: "mc", q: "Kommst du heute ___ morgen?", o: ["und", "oder", "aber"], a: 1 },
    { t: "mc", q: "«Soll ich dir helfen?» — це:", o: ["пропозиція допомогти", "наказ", "відмова"], a: 0 },
    { t: "mc", q: "«Ich muss arbeiten» і «Ich soll arbeiten». Різниця:", o: ["немає різниці", "soll — бо так сказав хтось інший", "soll — це минулий час"], a: 1 },
    { t: "mc", q: "Що писати в полі «Staatsangehörigkeit»?", o: ["громадянство", "місце народження", "сімейний стан"], a: 0 },
    { t: "mc", q: "Що означає «Teilzeit»?", o: ["повна зайнятість", "неповна зайнятість", "нічна зміна"], a: 1 },
    { t: "gap", q: "Die Arbeit ist interessant, ___ der Lohn ist nicht hoch.", a: ["aber"] },
  ],
};
