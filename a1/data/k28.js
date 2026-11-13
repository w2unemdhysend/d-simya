// Розділ 28 (A2). В установі: ввічливий Konjunktiv II (könnte, würde, hätte gern, wäre), порада й мрія
// (An deiner Stelle würde ich…), lassen (доручити, дозволити), запис, формуляри й листи з установ.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 28, part: "A2.2", title: "В установі", book: null,
  goals: [
    "ввічливо просити: Könnten Sie…? Ich hätte gern…",
    "радити й мріяти: An deiner Stelle würde ich…, Ich würde gern…",
    "казати, що для тебе хтось робить: Ich lasse das Fahrrad reparieren",
    "записуватися на прийом і розуміти слова з офіційних листів",
  ],
  grammar: [
    {
      id: "konj2", t: "Ввічливо: Könnten Sie…? Ich hätte gern…", cat: "verb",
      text: [
        "Konjunktiv II робить прохання **ввічливішим**, як українське «чи не могли б Ви…»: `Können Sie mir helfen?` → `Könnten Sie mir helfen?`",
        "Найчастіші форми: `könnte` (міг би), `würde` + інфінітив (зробив би), `hätte` (мав би), `wäre` (був би).",
        "`Ich hätte gern einen Termin.` — так само ввічливо, як `Ich möchte einen Termin.`",
      ],
      tables: [
        { head: ["Особа", "können", "werden", "haben", "sein"], rows: [["ich", "könnte", "würde", "hätte", "wäre"], ["du", "könntest", "würdest", "hättest", "wärst"], ["er/sie/es", "könnte", "würde", "hätte", "wäre"], ["wir", "könnten", "würden", "hätten", "wären"], ["ihr", "könntet", "würdet", "hättet", "wärt"], ["sie/Sie", "könnten", "würden", "hätten", "wären"]] },
      ],
      ex: [["Könnten Sie das bitte noch einmal erklären?", "Чи не могли б Ви пояснити це ще раз?"], ["Würden Sie mir bitte das Formular geben?", "Дайте мені, будь ласка, формуляр."], ["Ich hätte gern einen Termin für nächste Woche.", "{Я хотів би|Я хотіла б} записатися на наступний тиждень."], ["Wäre es möglich, den Termin zu verschieben?", "Чи можна перенести запис?"], ["Könntest du mir kurz helfen?", "Можеш мені трохи допомогти?"]],
      tips: ["Порівняй: `Ich will…` — грубувато, `Ich möchte…` — ввічливо, `Ich hätte gern…` / `Könnten Sie…?` — дуже ввічливо."],
    },
    {
      id: "konj2Rat", t: "Порада й мрія: An deiner Stelle würde ich…", cat: "verb",
      text: [
        "Порада: `An deiner Stelle würde ich…` — «На твоєму місці я б…», `Du könntest…` — «Ти міг би…», а ще `Du solltest…` (розділ 23).",
        "Бажання: `Ich wäre gern…` (хотів би бути), `Ich hätte gern…` (хотів би мати), `Ich würde gern…` + інфінітив (хотів би зробити).",
        "Нереальна умова: `Wenn ich mehr Zeit hätte, würde ich mehr lesen.` — «{Якби я мав більше часу, я б більше читав|Якби я мала більше часу, я б більше читала}». Докладніше — на рівні B1.",
      ],
      ex: [["An deiner Stelle würde ich sofort anrufen.", "{На твоєму місці я б одразу подзвонив.|На твоєму місці я б одразу подзвонила.}"], ["Du könntest auch eine E-Mail schreiben.", "Можна також написати e-mail."], ["Ich würde gern nach Kyjiw fliegen.", "{Я хотів би|Я хотіла б} полетіти до Києва."], ["Wenn ich mehr Zeit hätte, würde ich mehr lesen.", "{Якби я мав більше часу, я б більше читав.|Якби я мала більше часу, я б більше читала.}"]],
      warn: ["`Wenn ich mehr Zeit würde haben…` — помилка: з `haben` і `sein` кажуть `hätte` і `wäre`, не `würde haben`."],
    },
    {
      id: "lassen", t: "lassen: Ich lasse das Fahrrad reparieren", cat: "verb",
      text: [
        "`lassen` + інфінітив означає **доручити** комусь щось зробити: `Ich repariere das Fahrrad.` — ремонтую сам; `Ich lasse das Fahrrad reparieren.` — його ремонтують у майстерні.",
        "Друге значення — **дозволити, залишити**: `Lass mich schlafen!` — «Дай мені поспати!», `Ich lasse den Schlüssel hier.` — «Я залишу ключ тут».",
        "Форми: `ich lasse, du lässt, er lässt`. Після `lassen` інфінітив **без** `zu`.",
      ],
      ex: [["Ich lasse meine Haare schneiden.", "Я йду підстригтися."], ["Wo kann ich meine Schuhe reparieren lassen?", "Де можна віддати взуття в ремонт?"], ["Lass mich das machen!", "Дай я це зроблю!"], ["Wir lassen die Wohnung streichen.", "Ми замовили фарбування квартири."]],
      warn: ["`Ich lasse das zu reparieren` — помилка: після `lassen` без `zu`: `Ich lasse das reparieren.`"],
    },
    {
      id: "behoerde", t: "В установі: запис, формуляр, документи", cat: "rede",
      text: [
        "В установах (`die Behörde`, `das Amt`, `das Bürgerbüro`) майже завжди потрібен **запис** (`der Termin`); часто його бронюють онлайн.",
        "Типові слова: `der Antrag` (заява), `einen Antrag stellen` (подати заяву), `ein Formular ausfüllen` (заповнити формуляр), `die Unterlagen` (документи), `die Kopie`, `die Unterschrift` (підпис), `der Bescheid` (офіційне рішення), `die Frist` (крайній термін), `die Wartenummer` (номер черги).",
        "На офіційний лист важливо відповісти **вчасно**: дата в листі (`bis zum …`) — це крайній термін. Якщо щось незрозуміло, запитай: `Könnten Sie mir das bitte erklären?`",
      ],
      ex: [["Ich möchte einen Antrag stellen.", "Я хочу подати заяву."], ["Welche Unterlagen muss ich mitbringen?", "Які документи мені треба принести?"], ["Wo muss ich unterschreiben?", "Де мені розписатися?"], ["Bis wann muss ich das abgeben?", "До якого числа мені треба це здати?"]],
    },
  ],
  phrases: [
    { t: "Ввічливе прохання", list: [["Könnten Sie mir bitte helfen?", "Чи не могли б Ви мені допомогти?"], ["Ich hätte gern einen Termin.", "{Я хотів би|Я хотіла б} записатися на прийом."], ["Würden Sie das bitte langsamer sagen?", "Скажіть, будь ласка, це повільніше."], ["Wäre das möglich?", "Чи це можливо?"]] },
    { t: "В установі", list: [["Ich habe um zehn Uhr einen Termin.", "У мене запис на десяту."], ["Wo bekomme ich eine Wartenummer?", "Де взяти номер черги?"], ["Ich habe das Formular schon ausgefüllt.", "Я вже {заповнив|заповнила} формуляр."], ["Brauchen Sie eine Kopie?", "Вам потрібна копія?"]] },
    { t: "Порада", list: [["An deiner Stelle würde ich warten.", "{На твоєму місці я б зачекав.|На твоєму місці я б зачекала.}"], ["Du könntest auch online einen Termin buchen.", "Можна також записатися онлайн."]] },
  ],
  dialog: {
    t: "У бюро громадян",
    lines: [
      ["Sachbearbeiter", "Guten Morgen! Die Nummer siebenundvierzig? Bitte nehmen Sie Platz.", "Доброго ранку! Номер сорок сім? Сідайте, будь ласка."],
      ["{Taras|Lessja}", "Guten Morgen! Ich bin umgezogen und möchte mich ummelden. Ich habe einen Termin um neun.", "Доброго ранку! Я {переїхав|переїхала} і хочу перереєструвати адресу. У мене запис на дев’яту."],
      ["Sachbearbeiter", "Gut. Könnte ich bitte Ihren Pass und die Wohnungsgeberbestätigung sehen?", "Добре. Можна, будь ласка, Ваш паспорт і підтвердження від орендодавця?"],
      ["{Taras|Lessja}", "Natürlich, hier bitte. Könnten Sie mir sagen, ob ich noch etwas brauche?", "Звісно, ось. Скажіть, будь ласка, чи потрібно ще щось?"],
      ["Sachbearbeiter", "Nein, das reicht. Haben Sie das Formular schon ausgefüllt?", "Ні, цього досить. Ви вже заповнили формуляр?"],
      ["{Taras|Lessja}", "Ja, aber eine Frage hätte ich noch: Was bedeutet hier „Nebenwohnung“?", "Так, але в мене є ще одне запитання: що тут означає «Nebenwohnung»?"],
      ["Sachbearbeiter", "Das ist eine zweite Wohnung. Wenn Sie nur eine Wohnung haben, kreuzen Sie „Hauptwohnung“ an.", "Це друге житло. Якщо у Вас тільки одне житло, позначте «Hauptwohnung» — основне."],
      ["{Taras|Lessja}", "Verstehe. Und bekomme ich eine Bestätigung? Die brauche ich für die Bank.", "Зрозуміло. А я отримаю підтвердження? Воно потрібне мені для банку."],
      ["Sachbearbeiter", "Ja, natürlich. Die Meldebestätigung drucke ich Ihnen gleich aus.", "Так, звісно. Підтвердження реєстрації я Вам зараз роздрукую."],
      ["{Taras|Lessja}", "Vielen Dank! Das ging ja schneller, als ich dachte.", "Щиро дякую! Це було швидше, ніж я {думав|думала}."],
      ["Sachbearbeiter", "Mit Termin geht es immer schneller. Einen schönen Tag noch!", "Із записом завжди швидше. Гарного дня!"],
    ],
  },
  tasks: [
    { t: "gap", q: "___ Sie mir bitte helfen? (können, ввічливо)", a: ["Könnten", "könnten"] },
    { t: "gap", q: "Ich ___ gern einen Termin. (haben, ввічливо)", a: ["hätte"] },
    { t: "gap", q: "An deiner Stelle ___ ich anrufen. (werden)", a: ["würde"] },
    { t: "gap", q: "Das ___ schön! (sein, Konjunktiv II)", a: ["wäre"] },
    { t: "gap", q: "Ich ___ meine Haare schneiden. (lassen)", a: ["lasse"] },
    { t: "gap", q: "Er ___ sein Auto reparieren. (lassen)", a: ["lässt"] },
    { t: "gap", q: "Ich möchte einen Antrag ___. (подати)", a: ["stellen"] },
    { t: "gap", q: "Ich muss noch das Formular ___. (заповнити)", a: ["ausfüllen"] },
    { t: "mc", q: "Найввічливіше прохання:", o: ["Gib mir das Formular!", "Könnten Sie mir bitte das Formular geben?", "Ich will das Formular."], a: 1 },
    { t: "mc", q: "«Ich lasse das Fahrrad reparieren» означає…", o: ["{Я сам ремонтую велосипед.|Я сама ремонтую велосипед.}", "Велосипед мені ремонтують у майстерні.", "Я не ремонтую велосипед."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich lasse das zu reparieren.", "Ich lasse das reparieren.", "Ich lasse reparieren das."], a: 1 },
    { t: "mc", q: "Що таке «der Termin»?", o: ["запис, призначена зустріч", "термін придатності", "заява"], a: 0 },
    { t: "mc", q: "Що таке «die Frist»?", o: ["крайній термін", "черга", "підпис"], a: 0 },
  ],
};
