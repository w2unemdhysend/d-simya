// Розділ 39 (B1). Садок і школа: мета (um … zu, damit), ohne … zu, statt … zu; місце в садку, звикання, оплата;
// батьківські збори, розмова з учителем, записка про відсутність.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 39, part: "B1.1", title: "Садок і школа", book: null,
  goals: [
    "казати мету: um … zu, damit",
    "казати «не зробивши» і «замість того щоб»: ohne … zu, statt … zu",
    "записати дитину в садок і розуміти, як іде звикання й оплата",
    "говорити з учителем, писати записку про відсутність, знати про допомогу",
  ],
  grammar: [
    {
      id: "damitUmZu", t: "um … zu і damit: «щоб»", cat: "satz",
      text: [
        "Мету кажуть з `um … zu` + інфінітив, коли діє **та сама** особа: `Ich lerne Deutsch, **um** mit der Lehrerin **zu sprechen**.` (я вчу — я говоритиму).",
        "`damit` + підрядне речення (дієслово в кінці) — коли особи **різні**; з тією самою теж можна: `Ich spreche langsam, **damit** mein Sohn mich **versteht**.`",
        "У відокремлюваних дієсловах `zu` стоїть усередині: `um früh **aufzustehen**`, `um das Kind **abzuholen**`.",
        "Питання про мету — `Wozu?` («навіщо?»): `Wozu brauchst du das Formular? – Um mein Kind in der Kita anzumelden.`",
      ],
      tables: [
        { head: ["", "Хто діє", "Приклад"], rows: [["um … zu", "та сама особа", "Ich rufe an, um einen Termin zu vereinbaren."], ["damit", "інша особа", "Ich rufe an, damit die Lehrerin Bescheid weiß."], ["damit", "та сама — теж можна", "Ich schreibe es auf, damit ich es nicht vergesse."]] },
      ],
      ex: [["Ich bringe meine Tochter früh in die Kita, um pünktlich bei der Arbeit zu sein.", "Я рано відводжу доньку в садок, щоб вчасно бути на роботі."], ["Die Lehrerin spricht langsam, damit alle Eltern sie verstehen.", "Учителька говорить повільно, щоб її розуміли всі батьки."], ["Wir üben zu Hause, damit er die Hausaufgaben schafft.", "Ми вправляємося вдома, щоб він упорався з домашнім завданням."]],
      warn: ["`…, um meine Tochter mich versteht` — помилка: коли особи різні — `damit`: `…, damit meine Tochter mich versteht`."],
    },
    {
      id: "ohneZu", t: "ohne … zu, statt … zu", cat: "satz",
      text: [
        "`ohne … zu` — «не (зробивши)», «без того щоб»: `Er ist gegangen, **ohne** sich **zu verabschieden**.` — «Він пішов, не попрощавшись».",
        "`(an)statt … zu` — «замість того щоб»: `**Statt** Hausaufgaben **zu machen**, spielt er am Handy.`",
        "Якщо особи різні — `ohne dass`, `(an)statt dass` + підрядне: `Er nimmt das Tablet, **ohne dass** die Mutter es **weiß**.`",
      ],
      ex: [["Mein Sohn ist aus dem Haus gegangen, ohne zu frühstücken.", "Мій син вийшов з дому, не поснідавши."], ["Statt mit dem Auto zu fahren, gehen wir zu Fuß zur Schule.", "Замість того щоб їхати машиною, ми ходимо до школи пішки."], ["Sie hat das Formular unterschrieben, ohne es zu lesen.", "Вона підписала формуляр, не прочитавши його."]],
    },
    {
      id: "kita", t: "Садок: місце, звикання, оплата", cat: "rede",
      text: [
        "З одного року дитина має право на місце в садку або в денної няні (`die Tagesmutter`). Записуватися варто **заздалегідь** — у багатьох містах NRW через онлайн-портал міста (часто `Kita-Navigator`) або прямо в садку.",
        "Перші тижні — звикання (`die Eingewöhnung`): мама чи тато спершу лишаються в групі разом із дитиною, потім щодня трохи довше без них.",
        "Плата (`der Elternbeitrag`) залежить від доходу й міста; у NRW останні два роки перед школою садок безкоштовний. Обіди оплачують окремо; родинам із малим доходом допомагає пакет «Bildung und Teilhabe».",
        "Що взяти: змінне взуття (`die Hausschuhe`), запасний одяг (`die Wechselkleidung`), підгузки. Хвора дитина лишається вдома.",
      ],
      tables: [
        { head: ["Слово", "Що це"], rows: [["die Krippe / U3", "ясла: діти до 3 років"], ["der Kindergarten / die Kita", "садок: від 3 до 6 років"], ["die Tagesmutter", "денна няня, яку оплачує місто"], ["die OGS", "група продовженого дня в початковій школі"], ["der Elternbeitrag", "плата батьків за садок"]] },
      ],
      ex: [["Ich möchte meinen Sohn für einen Kita-Platz anmelden.", "Я хочу записати сина на місце в садку."], ["Wie lange dauert die Eingewöhnung?", "Скільки триває звикання?"], ["Meine Tochter ist krank und bleibt heute zu Hause.", "Моя донька хвора й сьогодні лишається вдома."]],
    },
    {
      id: "elternabend", t: "Школа: збори, розмова з учителем, записка", cat: "rede",
      text: [
        "Батьківські збори (`der Elternabend`) — для всього класу: розклад, класна поїздка (`die Klassenfahrt`), вибори батьківського комітету (`die Elternvertretung`). Особиста розмова — на `Elternsprechtag` або за окремим записом до вчителя.",
        "Дитина захворіла — **того ж ранку до уроків** повідом школу (телефоном, через шкільний застосунок чи e-mail). Коли повернеться — письмове пояснення (`die Entschuldigung`): дати, причина, підпис.",
        "Табель (`das Zeugnis`) — двічі на рік. Оцінки від `1` (sehr gut) до `6` (ungenügend); `5` і `6` — незадовільно. Після четвертого класу початкової школи батьки разом зі школою обирають наступну (розділ 26).",
        "На важливу розмову можна попросити перекладача (`der Dolmetscher`): у багатьох містах школи й інтеграційні центри допомагають безкоштовно.",
      ],
      tables: [
        { cap: "Записка до школи", head: ["Частина", "Приклад"], rows: [["Звертання", "Sehr geehrte Frau Weber,"], ["Хто й коли", "mein Sohn Danylo (Klasse 3b) konnte vom 10. bis 12. März nicht zur Schule kommen,"], ["Причина", "weil er krank war."], ["Прохання", "Bitte entschuldigen Sie sein Fehlen."], ["Прощання", "Mit freundlichen Grüßen — і підпис"]] },
      ],
      ex: [["Mein Sohn hat Fieber und kann heute nicht zur Schule kommen.", "Мій син має температуру й сьогодні не може прийти до школи."], ["Ich hätte gern einen Termin für ein Gespräch.", "{Я хотів би домовитися про розмову.|Я хотіла б домовитися про розмову.}"], ["Wie kann ich mein Kind beim Lernen unterstützen?", "Як я можу підтримати дитину в навчанні?"]],
    },
  ],
  phrases: [
    { t: "У садку", list: [["Wann muss ich mein Kind abholen?", "Коли мені треба забрати дитину?"], ["Heute holt meine Nachbarin sie ab.", "Сьогодні її забере моя сусідка."], ["Hat er gut gegessen und geschlafen?", "Він добре поїв і поспав?"]] },
    { t: "Зі школою", list: [["Mein Sohn ist krank und kommt heute nicht.", "Мій син хворий і сьогодні не прийде."], ["Wann ist der nächste Elternsprechtag?", "Коли наступний день консультацій для батьків?"], ["Braucht mein Kind Hilfe in Deutsch?", "Чи потрібна моїй дитині допомога з німецької?"]] },
    { t: "Допомога", list: [["Gibt es eine Hausaufgabenhilfe?", "Чи є допомога з домашніми завданнями?"], ["Kann zum Gespräch ein Dolmetscher kommen?", "Чи може на розмову прийти перекладач?"], ["Wer bezahlt die Klassenfahrt?", "Хто оплачує класну поїздку?"]] },
  ],
  dialog: {
    t: "День консультацій у школі",
    lines: [
      ["Lehrer", "Guten Tag! Sie sind wegen Danylo hier?", "Добрий день! Ви щодо Данила?"],
      ["{Taras|Lessja}", "Guten Tag, Herr Hoffmann. Ja, ich kenne die Familie gut. Danylos Mutter versteht noch nicht so viel Deutsch, deshalb übersetze ich.", "Добрий день, пане Гофмане. Так, я добре знаю цю родину. Мама Данила ще не дуже розуміє німецьку, тому я перекладаю."],
      ["Lehrer", "Sehr gut, danke. Also: Danylo ist ein freundlicher Junge, und in Mathe macht er große Fortschritte.", "Дуже добре, дякую. Отже: Данило — привітний хлопчик, а з математики робить великі успіхи."],
      ["{Taras|Lessja}", "Das freut uns sehr! Und wie ist es in Deutsch?", "Це нас дуже тішить! А як із німецькою?"],
      ["Lehrer", "Beim Lesen hat er noch Probleme. Er versteht viel, aber er liest sehr langsam.", "З читанням у нього ще проблеми. Він багато розуміє, але читає дуже повільно."],
      ["{Taras|Lessja}", "Was kann die Familie zu Hause tun, damit er besser liest?", "Що родина може робити вдома, щоб він краще читав?"],
      ["Lehrer", "Jeden Tag zehn Minuten laut lesen – am besten Bücher, die ihm Spaß machen. Und statt am Handy zu spielen, kann er Hörbücher hören.", "Щодня десять хвилин читати вголос — найкраще книжки, які йому подобаються. А замість того щоб грати в телефоні, він може слухати аудіокниги."],
      ["{Taras|Lessja}", "Gibt es an der Schule eine Hausaufgabenhilfe?", "Чи є в школі допомога з домашніми завданнями?"],
      ["Lehrer", "Ja, in der OGS, jeden Nachmittag bis 16 Uhr. Das Anmeldeformular gebe ich Ihnen mit.", "Так, у групі продовженого дня, щодня до 16:00. Формуляр для запису я Вам дам."],
      ["{Taras|Lessja}", "Danke. Noch eine Frage: Im Mai ist eine Klassenfahrt, und die Familie hat wenig Geld …", "Дякую. Ще одне питання: у травні класна поїздка, а в родини мало грошей…"],
      ["Lehrer", "Dafür gibt es das Bildungspaket. Den Antrag stellt man beim Jobcenter oder bei der Stadt – am besten, bevor die Fahrt bezahlt wird.", "Для цього є освітній пакет. Заяву подають у Jobcenter або в міській адміністрації — найкраще до того, як оплачувати поїздку."],
      ["{Taras|Lessja}", "Das übersetze ich gleich. Vielen Dank für das Gespräch, Herr Hoffmann!", "Зараз перекладу. Щиро дякую за розмову, пане Гофмане!"],
      ["Lehrer", "Gern. Und Danylo soll weiter so fleißig sein!", "Прошу. І нехай Данило й далі так старається!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich lerne Deutsch, ___ mit der Lehrerin zu sprechen.", a: ["um"] },
    { t: "gap", q: "Ich spreche langsam, ___ mein Sohn mich versteht.", a: ["damit"] },
    { t: "gap", q: "Ich stehe früh auf, um pünktlich ___ sein.", a: ["zu"] },
    { t: "gap", q: "Ich gehe los, um das Kind ___. (abholen)", a: ["abzuholen"] },
    { t: "gap", q: "Er ist gegangen, ___ sich zu verabschieden.", a: ["ohne"] },
    { t: "gap", q: "___ Hausaufgaben zu machen, spielt er am Handy.", a: ["Statt", "Anstatt", "statt", "anstatt"] },
    { t: "gap", q: "___ brauchst du das Formular? – Um mein Kind anzumelden.", a: ["Wozu", "wozu"] },
    { t: "gap", q: "Die ersten Wochen in der Kita heißen ___. (звикання)", a: ["Eingewöhnung"] },
    { t: "mc", q: "Як правильно?", o: ["Ich übe mit ihm, um er besser liest.", "Ich übe mit ihm, damit er besser liest.", "Ich übe mit ihm, damit er liest besser."], a: 1 },
    { t: "mc", q: "Дитина зранку захворіла. Що зробити?", o: ["До уроків повідомити школу, а потім дати письмове пояснення", "Нічого: школа сама побачить", "Написати вчителеві через тиждень"], a: 0 },
    { t: "mc", q: "У табелі німецької школи `1` означає…", o: ["незадовільно", "відмінно", "перше місце в класі"], a: 1 },
    { t: "mc", q: "`der Elternabend` — це…", o: ["вечір, коли батьки відпочивають", "свято в садку", "батьківські збори класу"], a: 2 },
    { t: "mc", q: "Класна поїздка коштує 250 €, а родина отримує допомогу від Jobcenter. Що можна зробити?", o: ["Подати заяву на освітній пакет (Bildung und Teilhabe)", "Нічого: дитина не поїде", "Попросити гроші у вчителя"], a: 0 },
    { t: "mc", q: "`Sie hat das Formular unterschrieben, ohne es zu lesen.` Що сталося?", o: ["Вона прочитала, але не підписала", "Вона підписала, не прочитавши", "Вона не підписала й не прочитала"], a: 1 },
  ],
};
