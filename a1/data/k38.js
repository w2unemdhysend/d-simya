// Розділ 38 (B1). Оренда й ремонт: відносні речення з прийменником (die Wohnung, in der …), wo, was, dessen;
// договір оренди й комунальні платежі; як повідомити про несправність.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 38, part: "B1.1", title: "Оренда й ремонт", book: null,
  goals: [
    "уточнювати відносним реченням з прийменником: die Wohnung, in der ich wohne",
    "уживати wo, was і впізнавати dessen, deren",
    "розуміти договір оренди й розрахунок комунальних: Kaltmiete, Nebenkosten, Kaution",
    "повідомити про несправність телефоном і письмово",
  ],
  grammar: [
    {
      id: "relativPraep", t: "Відносне речення з прийменником: die Wohnung, in der …", cat: "satz",
      text: [
        "Нагадування (розділ 29): відносний займенник схожий на артикль (`der, die, das`), у Dativ множини — `denen`; дієслово в кінці речення.",
        "Якщо дієслово вимагає прийменника, прийменник стоїть **перед** займенником: `die Wohnung, **in der** ich wohne`; `der Vermieter, **mit dem** ich telefoniert habe`; `die Leute, **bei denen** ich wohne`.",
        "Відмінок визначає прийменник: `mit`, `bei`, `von` → Dativ (`mit dem`); `für`, `über` (про що?) → Akkusativ (`für den`, `über die`); `in` (де?) → Dativ (`in der`).",
      ],
      tables: [
        { cap: "Відносний займенник", head: ["", "чоловічий", "жіночий", "середній", "множина"], rows: [["Nominativ", "der", "die", "das", "die"], ["Akkusativ", "den", "die", "das", "die"], ["Dativ", "dem", "der", "dem", "denen"], ["Genitiv", "dessen", "deren", "dessen", "deren"]] },
      ],
      ex: [["Das ist die Wohnung, in der ich seit zwei Jahren wohne.", "Це квартира, в якій я живу вже два роки."], ["Der Hausmeister, mit dem ich gesprochen habe, kommt morgen.", "{Двірник, з яким я говорив, прийде завтра.|Двірник, з яким я говорила, прийде завтра.}"], ["Die Heizung, über die ich mich beschwert habe, funktioniert wieder.", "{Опалення, на яке я скаржився, знову працює.|Опалення, на яке я скаржилася, знову працює.}"], ["Die Nachbarn, bei denen ich den Schlüssel abgebe, sind sehr nett.", "Сусіди, в яких я залишаю ключ, дуже милі."]],
      warn: ["`die Wohnung, der ich wohne in` — помилка: прийменник стоїть перед займенником: `die Wohnung, in der ich wohne`."],
    },
    {
      id: "relativWoWas", t: "wo, was, dessen: Xanten, wo ich wohne", cat: "satz",
      text: [
        "Про місце можна сказати `wo` замість `in dem` / `in der`: `die Stadt, **wo** ich wohne`. Після назв міст і країн — лише `wo`: `Xanten, **wo** ich wohne`.",
        "Після `alles`, `etwas`, `nichts`, `vieles`, `das Beste` і після цілого речення — `was`: `Das ist alles, **was** ich weiß.` `Sie hat die Kaution zurückgezahlt, **was** mich sehr freut.`",
        "`dessen` / `deren` — «чий, чия, чиї» (Genitiv): `der Mieter, **dessen** Auto vor der Tür steht`; `die Frau, **deren** Sohn …`. На B1 головне — розуміти це в тексті.",
      ],
      ex: [["Xanten ist eine Stadt, wo man gut leben kann.", "Ксантен — місто, де добре жити."], ["Gibt es etwas, was ich vor dem Einzug wissen muss?", "Чи є щось, що мені треба знати перед заселенням?"], ["Das ist der Nachbar, dessen Hund immer bellt.", "Це сусід, чий пес постійно гавкає."]],
      warn: ["`alles, das ich weiß` — помилка: після `alles` — `was`: `alles, was ich weiß`."],
    },
    {
      id: "mietvertrag", t: "Договір оренди: Kaltmiete, Nebenkosten, Kaution", cat: "rede",
      text: [
        "`die Kaltmiete` — плата лише за квартиру. `die Nebenkosten` — комунальні: вода, сміття, прибирання сходів, ліфт, часто й опалення (`die Heizkosten`). `die Warmmiete` = Kaltmiete + Nebenkosten.",
        "Застава (`die Kaution`) — **щонайбільше три місячні кальтміти**; її можна сплатити трьома частинами. Після виїзду, якщо все гаразд, її повертають.",
        "Раз на рік приходить розрахунок комунальних (`die Nebenkostenabrechnung`): доплата (`die Nachzahlung`) або повернення (`das Guthaben`). Перевір період і суми; ти маєш право подивитися квитанції (`die Belege`).",
        "Мешканець розриває договір письмово з підписом, як правило за **три місяці**.",
      ],
      tables: [
        { head: ["В оголошенні", "Значення"], rows: [["3 ZKB", "3 кімнати, кухня, ванна"], ["KM 600 € + NK 200 €", "кальтміте 600 € + комунальні 200 €"], ["Kaution: 3 KM", "застава: три кальтміти"], ["WBS erforderlich", "потрібна довідка на соціальне житло"], ["ab 1.4. frei", "вільна з 1 квітня"]] },
      ],
      ex: [["Sind die Heizkosten in den Nebenkosten enthalten?", "Опалення входить у комунальні?"], ["Kann ich die Kaution in drei Raten zahlen?", "Можна сплатити заставу трьома частинами?"], ["Laut Abrechnung muss ich 240 Euro nachzahlen.", "За розрахунком я маю доплатити 240 євро."]],
    },
    {
      id: "maengel", t: "Несправність у квартирі: як повідомити", cat: "rede",
      text: [
        "Несправність (`der Mangel`, мн. `die Mängel`): немає опалення чи гарячої води, капає кран, цвіль (`der Schimmel`), не працює домофон. Повідом орендодавця або управителя будинку (`die Hausverwaltung`) **одразу**.",
        "Спершу телефоном, потім **письмово** (e-mail чи лист): що, де, відколи — і строк, до якого треба полагодити: `Bitte beheben Sie den Mangel bis zum …`. Зроби фото й збережи копію.",
        "Аварія (прорвало трубу, взимку немає опалення) — дзвони одразу, навіть уночі: номер аварійної служби (`der Notdienst`) зазвичай висить у під’їзді.",
        "Поки серйозну несправність не усунуто, можна платити менше (`die Mietminderung`). Перш ніж зменшувати плату, порадься в об’єднанні орендарів (`der Mieterverein`).",
      ],
      ex: [["Seit Montag funktioniert die Heizung in meiner Wohnung nicht.", "З понеділка в моїй квартирі не працює опалення."], ["Im Bad ist Schimmel an der Wand.", "У ванній на стіні цвіль."], ["Bitte beheben Sie den Mangel bis zum 15. Januar.", "Будь ласка, усуньте несправність до 15 січня."]],
    },
  ],
  phrases: [
    { t: "Огляд квартири", list: [["Wie hoch sind die Nebenkosten?", "Скільки становлять комунальні?"], ["Ist die Küche dabei?", "Кухня входить?"], ["Ab wann ist die Wohnung frei?", "З якого числа квартира вільна?"]] },
    { t: "Несправність", list: [["Der Wasserhahn tropft.", "Капає кран."], ["Die Heizung wird nicht warm.", "Батарея не гріє."], ["Wann kann ein Handwerker kommen?", "Коли може прийти майстер?"]] },
    { t: "Сусіди", list: [["Könnten Sie die Musik bitte etwas leiser machen?", "Не могли б Ви зробити музику трохи тихіше?"], ["Ich nehme Ihr Paket gern an.", "Я охоче прийму Вашу посилку."], ["Wir feiern am Samstag. Es könnte etwas lauter werden.", "У суботу ми святкуємо. Може бути трохи гучніше."]] },
  ],
  dialog: {
    t: "Дзвінок до управителя будинку",
    lines: [
      ["Hausverwaltung", "Hausverwaltung Roth, guten Tag. Was kann ich für Sie tun?", "Управління будинками Рот, добрий день. Чим можу допомогти?"],
      ["{Taras|Lessja}", "{Guten Tag, hier ist Taras Schewtschenko aus der Lindenstraße 12. Ich rufe wegen der Heizung an.|Guten Tag, hier ist Lessja Ukrajinka aus der Lindenstraße 12. Ich rufe wegen der Heizung an.}", "{Добрий день, це Тарас Шевченко з Lindenstraße, 12. Я телефоную щодо опалення.|Добрий день, це Леся Українка з Lindenstraße, 12. Я телефоную щодо опалення.}"],
      ["Hausverwaltung", "Was ist denn das Problem?", "А в чому проблема?"],
      ["{Taras|Lessja}", "Seit Montag wird die Heizung im Wohnzimmer nicht mehr warm. In dem Zimmer, in dem ich arbeite, sind es nur noch sechzehn Grad.", "З понеділка батарея у вітальні більше не гріє. У кімнаті, в якій я працюю, лише шістнадцять градусів."],
      ["Hausverwaltung", "Oh, das tut mir leid. Haben Sie die Heizung schon entlüftet?", "Ой, мені шкода. Ви вже спускали повітря з батареї?"],
      ["{Taras|Lessja}", "{Ja, das habe ich versucht. Der Nachbar, mit dem ich gesprochen habe, hat das gleiche Problem.|Ja, das habe ich versucht. Die Nachbarin, mit der ich gesprochen habe, hat das gleiche Problem.}", "{Так, я пробував. Сусід, з яким я говорив, має ту саму проблему.|Так, я пробувала. Сусідка, з якою я говорила, має ту саму проблему.}"],
      ["Hausverwaltung", "Dann schicke ich einen Handwerker. Wann sind Sie zu Hause?", "Тоді я надішлю майстра. Коли Ви вдома?"],
      ["{Taras|Lessja}", "Morgen ab 14 Uhr. Gibt es noch etwas, was ich tun muss?", "Завтра з 14:00. Чи є ще щось, що мені треба зробити?"],
      ["Hausverwaltung", "Schreiben Sie uns bitte noch eine kurze E-Mail mit dem Problem und Fotos. Dann ist alles dokumentiert.", "Напишіть нам, будь ласка, ще короткий e-mail з описом проблеми й фото. Тоді все буде задокументовано."],
      ["{Taras|Lessja}", "Mache ich. Noch eine Frage: In der Nebenkostenabrechnung steht eine Nachzahlung von 240 Euro. Kann ich die Belege sehen?", "Зроблю. Ще одне питання: у розрахунку комунальних стоїть доплата 240 євро. Можна подивитися квитанції?"],
      ["Hausverwaltung", "Natürlich, das ist Ihr Recht. Kommen Sie in unser Büro, am besten mit Termin.", "Звісно, це Ваше право. Приходьте до нашого офісу, найкраще за записом."],
      ["{Taras|Lessja}", "Vielen Dank für Ihre Hilfe! Auf Wiederhören.", "Щиро дякую за допомогу! До побачення."],
    ],
  },
  tasks: [
    { t: "gap", q: "Das ist die Wohnung, in ___ ich wohne.", a: ["der"] },
    { t: "gap", q: "Der Hausmeister, mit ___ ich gesprochen habe, kommt morgen.", a: ["dem"] },
    { t: "gap", q: "Die Nachbarn, bei ___ ich den Schlüssel abgebe, sind nett.", a: ["denen"] },
    { t: "gap", q: "Das ist alles, ___ ich weiß.", a: ["was"] },
    { t: "gap", q: "Xanten, ___ ich wohne, ist eine alte Römerstadt.", a: ["wo"] },
    { t: "gap", q: "Kaltmiete plus Nebenkosten ist die ___.", a: ["Warmmiete"] },
    { t: "gap", q: "Im Bad ist ___ an der Wand. (цвіль)", a: ["Schimmel"] },
    { t: "gap", q: "Bitte beheben Sie den ___ bis zum 15. Januar. (несправність)", a: ["Mangel"] },
    { t: "mc", q: "Оголошення: `KM 600 € + NK 200 €`. Скільки платиш щомісяця?", o: ["600 €", "800 €", "200 €"], a: 1 },
    { t: "mc", q: "Яку найбільшу заставу дозволяє закон?", o: ["шість кальтміт", "три кальтміти", "скільки захоче орендодавець"], a: 1 },
    { t: "mc", q: "Субота, 21:00, у ванній прорвало трубу. Що робити?", o: ["Перекрити воду й одразу дзвонити в аварійну службу", "Написати e-mail управителю й чекати понеділка", "Нічого: страхова сама дізнається"], a: 0 },
    { t: "mc", q: "Як правильно?", o: ["die Frau, dessen Sohn hier wohnt", "die Frau, die Sohn hier wohnt", "die Frau, deren Sohn hier wohnt"], a: 2 },
    { t: "mc", q: "Батарея не гріє вже тиждень. Як краще повідомити?", o: ["Просто платити менше, нікому не кажучи", "Подзвонити, а потім написати e-mail з фото й строком", "Чекати, поки управитель сам помітить"], a: 1 },
    { t: "mc", q: "Ти хочеш виїхати з квартири. Як розірвати договір?", o: ["Письмово з підписом, як правило за три місяці", "Сказати сусідові", "Надіслати SMS за тиждень"], a: 0 },
    { t: "mc", q: "`Nebenkostenabrechnung: Guthaben 85 €` означає…", o: ["Ти мусиш доплатити 85 €", "Тобі повернуть 85 €", "Комунальні подорожчали на 85 €"], a: 1 },
  ],
};
