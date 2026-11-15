// Розділ 44 (B1). Клуб і волонтерство: дієслово з прийменником + речення (sich freuen darauf, dass … / … zu …),
// brauchen … zu і scheinen … zu; як стати членом клубу; волонтерство.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 44, part: "B1.2", title: "Клуб і волонтерство", book: null,
  goals: [
    "казати ціле речення після дієслова з прийменником: Ich freue mich darauf, euch zu sehen",
    "казати «не треба» і «здається»: Sie brauchen nichts mitzubringen; Er scheint nett zu sein",
    "записатися в клуб: пробне тренування, внесок, правила",
    "знайти волонтерську справу й розповісти про неї",
  ],
  grammar: [
    {
      id: "verbPraepB1", t: "darauf, dass … / darauf, … zu: дієслово з прийменником і речення", cat: "verb",
      text: [
        "Дієслова з прийменником ти знаєш (розділ 27): `sich freuen auf`, `sich interessieren für`, `sich kümmern um`, `teilnehmen an`, `Angst haben vor`.",
        "Коли після такого дієслова йде **ціле речення**, у головному стоїть `da(r)` + прийменник, а далі `dass …` або `zu` + інфінітив: `Ich freue mich **darauf, dass** du kommst.` `Ich freue mich **darauf**, dich **zu sehen**.`",
        "`zu` + інфінітив — коли та сама особа; `dass` — коли різні (як `um … zu` і `damit`, розділ 39).",
        "Питання — `wo(r)` + прийменник: `Worauf freust du dich?` `Wofür interessierst du dich?`",
      ],
      tables: [
        { head: ["Дієслово", "Із реченням"], rows: [["sich freuen auf", "Ich freue mich darauf, euch zu sehen."], ["sich kümmern um", "Wer kümmert sich darum, dass alle Getränke haben?"], ["sich interessieren für", "Sie interessiert sich dafür, im Verein zu helfen."], ["teilnehmen an", "Danke, dass Sie daran teilgenommen haben."], ["Angst haben vor", "Er hat Angst davor, Fehler zu machen."]] },
      ],
      ex: [["Ich freue mich darauf, am Samstag mitzuspielen.", "Чекаю не дочекаюся суботньої гри."], ["Kannst du dich darum kümmern, dass die Bälle im Auto sind?", "Можеш подбати про те, щоб м’ячі були в машині?"], ["Viele Menschen engagieren sich dafür, anderen zu helfen.", "Багато людей присвячують себе допомозі іншим."]],
      warn: ["`Ich freue mich auf, dass du kommst` — помилка: перед реченням — `darauf`: `Ich freue mich darauf, dass du kommst.`"],
    },
    {
      id: "brauchenZu", t: "brauchen … zu і scheinen … zu: «не треба», «здається»", cat: "verb",
      text: [
        "`brauchen` + `nicht` / `nur` + `zu` + інфінітив = «не треба» / «треба лише»: `Sie **brauchen** nichts **mitzubringen**.` — «Нічого не треба приносити». `Du **brauchst** nur **anzurufen**.` — «Тобі треба лише подзвонити».",
        "Це те саме, що `nicht müssen`. Увага: `nicht dürfen` — **заборона**, «не можна»!",
        "`scheinen` + `zu` — «здається, схоже»: `Der Kurs **scheint** gut **zu sein**.`",
      ],
      tables: [
        { head: ["Сказати", "Значення"], rows: [["Du musst nicht kommen. = Du brauchst nicht zu kommen.", "не обов’язково приходити"], ["Du darfst nicht kommen.", "не можна приходити (заборона)"], ["Du brauchst nur anzurufen.", "треба лише подзвонити"], ["Er scheint krank zu sein.", "він, здається, хворий"]] },
      ],
      ex: [["Für das Probetraining brauchen Sie nichts zu bezahlen.", "За пробне тренування нічого не треба платити."], ["Du brauchst nur das Formular auszufüllen.", "Тобі треба лише заповнити формуляр."], ["Die Leute im Verein scheinen sehr nett zu sein.", "Люди в клубі, здається, дуже милі."]],
      warn: ["`Du brauchst nicht kommen` у розмові чути, але правильно з `zu`: `Du brauchst nicht zu kommen.`"],
    },
    {
      id: "verein", t: "Клуб (Verein): записатися, внесок, правила", cat: "rede",
      text: [
        "У Німеччині сотні тисяч клубів (`der Verein`): спорт, музика, сад, шахи, допомога. Це найпростіший шлях знайти знайомих і щоденну практику мови.",
        "Як стати членом: пробне тренування (`das Probetraining`), часто безкоштовне; потім заява про вступ (`der Mitgliedsantrag`) і членський внесок (`der Mitgliedsbeitrag`), зазвичай автосписанням.",
        "Дітям із родин із малим доходом пакет «Bildung und Teilhabe» оплачує до 15 € на місяць за клуб, музику чи гурток.",
        "У клубі є голова (`der/die Vorsitzende`), збори членів (`die Mitgliederversammlung`) і статут (`die Satzung`). Вийти з клубу можна письмово; строк указано в статуті.",
      ],
      ex: [["Kann ich zuerst ein Probetraining machen?", "Можна спершу прийти на пробне тренування?"], ["Wie hoch ist der Mitgliedsbeitrag?", "Який членський внесок?"], ["Wann trainiert die Gruppe für Erwachsene?", "Коли тренується група для дорослих?"]],
    },
    {
      id: "ehrenamt", t: "Волонтерство: das Ehrenamt", cat: "rede",
      text: [
        "`das Ehrenamt` — безоплатна допомога: продуктовий банк (`die Tafel`), супровід новоприбулих, читання дітям, тренування в клубі, добровільна пожежна команда (`die Freiwillige Feuerwehr`).",
        "Де шукати: агенція волонтерів (`die Freiwilligenagentur`) у місті, церковні громади, інтеграційні центри, клуби.",
        "Волонтерство — це практика мови, знайомства й досвід, який можна вписати в резюме. Тим, хто багато допомагає, NRW дає пільгову картку (`die Ehrenamtskarte`).",
      ],
      ex: [["Ich möchte mich ehrenamtlich engagieren.", "Я хочу займатися волонтерством."], ["Bei der Tafel helfe ich jeden Freitag beim Verteilen.", "У продуктовому банку я щоп’ятниці допомагаю роздавати продукти."], ["Durch das Ehrenamt habe ich viele Leute kennengelernt.", "{Завдяки волонтерству я познайомився з багатьма людьми.|Завдяки волонтерству я познайомилася з багатьма людьми.}"]],
    },
  ],
  phrases: [
    { t: "У клубі", list: [["Ich interessiere mich für Tischtennis.", "Мене цікавить настільний теніс."], ["Darf ich einfach mal mitspielen?", "Можна просто прийти пограти?"], ["{Ich bin Anfänger.|Ich bin Anfängerin.}", "{Я початківець.|Я початківиця.}"]] },
    { t: "Волонтерство", list: [["Wo werden Helfer gesucht?", "Де шукають помічників?"], ["Ich habe samstags Zeit.", "У мене є час по суботах."], ["Was genau muss ich machen?", "Що саме мені треба робити?"]] },
    { t: "Плани з друзями", list: [["Hast du Lust mitzukommen?", "Маєш бажання піти з нами?"], ["Ich freue mich darauf!", "Чекаю з нетерпінням!"], ["Da bin ich dabei!", "Я в ділі!"]] },
  ],
  dialog: {
    t: "Пробне тренування",
    lines: [
      ["Vorsitzende", "{Hallo! Du bist bestimmt der Neue, der angerufen hat? Ich bin Janina, die Vorsitzende.|Hallo! Du bist bestimmt die Neue, die angerufen hat? Ich bin Janina, die Vorsitzende.}", "{Привіт! Ти, мабуть, новенький, що дзвонив? Я Яніна, голова клубу.|Привіт! Ти, мабуть, новенька, що дзвонила? Я Яніна, голова клубу.}"],
      ["{Taras|Lessja}", "{Ja, genau, ich bin Taras. Tischtennis interessiert mich schon lange, aber ich habe seit Jahren nicht gespielt.|Ja, genau, ich bin Lessja. Tischtennis interessiert mich schon lange, aber ich habe seit Jahren nicht gespielt.}", "{Так, я Тарас. Настільний теніс мене давно цікавить, але я роками не грав.|Так, я Леся. Настільний теніс мене давно цікавить, але я роками не грала.}"],
      ["Vorsitzende", "Kein Problem, bei uns spielen alle – Anfänger und Profis. Schläger und Bälle haben wir, du brauchst nur Sportschuhe mitzubringen.", "Без проблем, у нас грають усі — і початківці, і профі. Ракетки й м’ячі в нас є, тобі треба лише взяти спортивне взуття."],
      ["{Taras|Lessja}", "Die habe ich dabei. Was kostet die Mitgliedschaft?", "Воно в мене з собою. Скільки коштує членство?"],
      ["Vorsitzende", "Zehn Euro im Monat für Erwachsene. Für das Probetraining brauchst du natürlich nichts zu bezahlen.", "Десять євро на місяць для дорослих. За пробне тренування, звісно, платити не треба."],
      ["{Taras|Lessja}", "Super. Gibt es auch andere Aktivitäten im Verein?", "Чудово. А в клубі є й інші заходи?"],
      ["Vorsitzende", "Ja, im Juni machen wir ein Turnier für Kinder. Wir suchen noch Leute, die sich darum kümmern, dass alle etwas zu essen und zu trinken haben.", "Так, у червні ми проводимо турнір для дітей. Ще шукаємо людей, які подбають, щоб усі мали що поїсти й попити."],
      ["{Taras|Lessja}", "{Da helfe ich gern! Ich könnte auch Plakate für das Turnier malen.|Da helfe ich gern! Ich könnte auch die Einladungen für die Familien aus der Ukraine übersetzen.}", "{Охоче допоможу! Я міг би ще намалювати афіші до турніру.|Охоче допоможу! Я могла б ще перекласти запрошення для родин з України.}"],
      ["Vorsitzende", "Wow, das wäre toll! Darüber freuen sich bestimmt alle.", "Ого, це було б чудово! Цьому всі напевно зрадіють."],
      ["{Taras|Lessja}", "Und ich freue mich darauf, die Leute hier kennenzulernen.", "А я чекаю, коли познайомлюся з людьми тут."],
      ["Vorsitzende", "Na dann, los geht's! Wir spielen zuerst ein bisschen zum Aufwärmen.", "Ну тоді вперед! Спершу трохи пограємо для розминки."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich freue mich ___, dass du kommst.", a: ["darauf"] },
    { t: "gap", q: "Ich freue mich darauf, dich ___ sehen.", a: ["zu"] },
    { t: "gap", q: "___ interessierst du dich? – Für Tischtennis.", a: ["Wofür", "wofür"] },
    { t: "gap", q: "Kannst du dich ___ kümmern, dass alle Getränke haben?", a: ["darum"] },
    { t: "gap", q: "Sie brauchen nichts ___. (mitbringen)", a: ["mitzubringen"] },
    { t: "gap", q: "Du brauchst nur das Formular ___. (ausfüllen)", a: ["auszufüllen"] },
    { t: "gap", q: "Der Kurs scheint gut ___ sein.", a: ["zu"] },
    { t: "gap", q: "Wie hoch ist der ___? (членський внесок)", a: ["Mitgliedsbeitrag"] },
    { t: "mc", q: "`Du brauchst nicht zu kommen.` означає…", o: ["Тобі не можна приходити", "Тобі не обов’язково приходити", "Тобі треба прийти"], a: 1 },
    { t: "mc", q: "`Hier darf man nicht parken.` — це…", o: ["заборона", "необов’язковість", "порада"], a: 0 },
    { t: "mc", q: "Дитина з родини, що отримує допомогу, хоче ходити на футбол. Що допоможе з оплатою?", o: ["Kfz-Steuer", "Mieterverein", "пакет «Bildung und Teilhabe»"], a: 2 },
    { t: "mc", q: "`das Ehrenamt` — це…", o: ["безоплатна допомога, волонтерство", "почесне звання", "робота в мерії"], a: 0 },
    { t: "mc", q: "Як правильно?", o: ["Ich freue mich auf, dass du kommst.", "Ich freue mich dafür, dass du kommst.", "Ich freue mich darauf, dass du kommst."], a: 2 },
    { t: "mc", q: "Де шукати волонтерську справу?", o: ["у Freiwilligenagentur", "у Führerscheinstelle", "в автомайстерні"], a: 0 },
  ],
};
