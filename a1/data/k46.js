// Розділ 46 (B1). Демократія й дискусія: заперечення (noch nicht, nicht mehr, kein … mehr, niemand), порядок
// обставин у реченні; вибори, партії, права; як погодитися, заперечити й знайти компроміс.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 46, part: "B1.2", title: "Демократія й дискусія", book: null,
  goals: [
    "заперечувати точно: noch nicht, nicht mehr, noch kein, kein … mehr, niemand, nie",
    "ставити обставини в правильному порядку: коли — чому — як — де",
    "розуміти, як влаштовані вибори й що можна без німецького громадянства",
    "сперечатися ввічливо й шукати компроміс",
  ],
  grammar: [
    {
      id: "negB1", t: "Заперечення: noch nicht, nicht mehr, kein … mehr", cat: "satz",
      text: [
        "`noch nicht` — «ще не» (відповідь на `schon?`): `Ich habe noch nicht gewählt.` `nicht mehr` — «більше не»: `Er wohnt nicht mehr hier.`",
        "З іменником: `noch kein` — «ще немає»: `Ich habe noch keinen deutschen Pass.` `kein … mehr` — «більше немає»: `Ich habe keine Zeit mehr.`",
        "`gar nicht` / `überhaupt nicht` — «зовсім не»; `nie` — «ніколи»; `niemand` — «ніхто»; `nichts` — «нічого»; `nirgends` — «ніде».",
        "**Подвійного заперечення немає!** «Я ніколи нічого не кажу» → `Ich sage nie etwas.`",
        "Місце `nicht`: перед тим, що заперечуєш (`nicht heute, sondern morgen`); якщо заперечуєш усе речення — ближче до кінця, але перед другою частиною дієслова: `Ich habe ihn **nicht** gesehen.`",
      ],
      tables: [
        { head: ["Питання", "Так", "Ні"], rows: [["Hast du schon gewählt?", "Ja, schon.", "Nein, noch nicht."], ["Wohnst du noch in Köln?", "Ja, noch.", "Nein, nicht mehr."], ["Hast du schon einen Pass?", "Ja, schon.", "Nein, noch keinen."], ["Hast du noch Fragen?", "Ja, noch eine.", "Nein, keine mehr."]] },
      ],
      ex: [["Ich darf in Deutschland noch nicht wählen.", "Я ще не маю права голосувати в Німеччині."], ["Seit der Wahl hat sich gar nichts geändert.", "Після виборів зовсім нічого не змінилося."], ["Niemand hat mich gefragt.", "Ніхто мене не питав."]],
      warn: ["`Ich habe nie nichts gesagt` — помилка: у німецькій одне заперечення: `Ich habe nie etwas gesagt.`"],
    },
    {
      id: "satzbauB1", t: "Порядок обставин: коли — чому — як — де", cat: "satz",
      text: [
        "У середині речення обставини здебільшого стоять у такому порядку: **коли?** — **чому?** — **як?** — **де / куди?** (`te-ka-mo-lo`): `Ich fahre **morgen** **wegen der Wahl** **mit dem Fahrrad** **zum Rathaus**.`",
        "Два додатки-іменники: Dativ перед Akkusativ: `Ich gebe **dem Nachbarn** **den Schlüssel**.` Якщо Akkusativ — займенник, він іде першим: `Ich gebe **ihn** dem Nachbarn.` (розділ 25)",
        "Будь-яку частину можна винести на перше місце, щоб наголосити, — тоді дієслово друге, а підмет одразу за ним: `**Morgen** fahre ich …`",
      ],
      tables: [
        { head: ["Початок", "Дієслово", "Підмет", "Коли", "Чому", "Як", "Куди", "Кінець"], rows: [["Ich", "bin", "—", "gestern", "wegen der Wahl", "zu Fuß", "zum Rathaus", "gegangen."], ["Gestern", "bin", "ich", "—", "wegen der Wahl", "zu Fuß", "zum Rathaus", "gegangen."]] },
      ],
      ex: [["Wir treffen uns am Sonntag wegen des Wetters lieber im Café.", "Через погоду ми краще зустрінемося в неділю в кафе."], ["Ich habe meiner Nachbarin die Unterlagen für die Briefwahl gezeigt.", "{Я показав сусідці документи для голосування поштою.|Я показала сусідці документи для голосування поштою.}"], ["Am Wahltag gehen viele Menschen zu Fuß ins Wahllokal.", "У день виборів багато людей ідуть пішки на виборчу дільницю."]],
    },
    {
      id: "demokratie", t: "Вибори, партії, права", cat: "rede",
      text: [
        "Німеччина — федеративна республіка з 16 землями. Бундестаг обирають раз на 4 роки; голосують громадяни Німеччини від 18 років. Уряд очолює канцлер (`der Bundeskanzler`), голова держави — президент (`der Bundespräsident`).",
        "NRW має свій парламент (`der Landtag`) у Дюссельдорфі. У місті — міська рада (`der Stadtrat`) і бургомістр; на місцевих виборах у NRW голосують із 16 років, громадяни ЄС теж.",
        "Без німецького громадянства теж можна впливати: у багатьох містах NRW — обирати раду інтеграції (`der Integrationsrat`), підписувати петиції, ходити на мирні демонстрації, працювати в батьківських комітетах і клубах.",
        "Основні права з Основного закону (`das Grundgesetz`): гідність людини, свобода думки й віри, рівність чоловіків і жінок. Більше — у тренажері «Leben in Deutschland».",
      ],
      ex: [["Wer darf bei der Bundestagswahl wählen?", "Хто може голосувати на виборах до Бундестагу?"], ["Den Integrationsrat dürfen auch Menschen ohne deutschen Pass wählen.", "Раду інтеграції можуть обирати й люди без німецького паспорта."], ["Die Demonstration war friedlich.", "Демонстрація була мирною."]],
    },
    {
      id: "diskussion", t: "Дискусія: погодитися, заперечити, компроміс", cat: "rede",
      text: [
        "Погодитися: `Da stimme ich dir zu.` `Das sehe ich genauso.` Частково: `Da hast du teilweise recht, aber …`",
        "Заперечити ввічливо: `Ich bin da anderer Meinung.` `Das sehe ich nicht so, weil …` `Ich bin nicht sicher, ob das stimmt.`",
        "Узяти слово: `Darf ich kurz etwas sagen?` Повернути до теми: `Aber zurück zum Thema: …` Компроміс: `Wie wäre es, wenn …?` `Können wir uns darauf einigen, dass …?`",
      ],
      tables: [
        { head: ["Мета", "Фраза"], rows: [["погодитися", "Da stimme ich dir zu."], ["частково", "Da hast du teilweise recht, aber …"], ["заперечити", "Ich bin da anderer Meinung."], ["узяти слово", "Darf ich kurz etwas sagen?"], ["компроміс", "Können wir uns darauf einigen, dass …?"]] },
      ],
      ex: [["Ich bin da anderer Meinung, weil mehr Busse auch mehr Kosten bedeuten.", "Я тут іншої думки, бо більше автобусів — це й більше витрат."], ["Da hast du teilweise recht, aber wir müssen auch an die Kinder denken.", "Тут ти частково маєш рацію, але ми маємо думати й про дітей."], ["Können wir uns darauf einigen, dass wir es ein Jahr ausprobieren?", "Можемо домовитися, що випробуємо це рік?"]],
    },
  ],
  phrases: [
    { t: "Політика", list: [["Wann ist die nächste Wahl?", "Коли наступні вибори?"], ["Ich darf noch nicht wählen, aber ich interessiere mich für Politik.", "Я ще не маю права голосу, але цікавлюся політикою."], ["Wer ist bei uns Bürgermeister?", "Хто в нас бургомістр?"]] },
    { t: "У дискусії", list: [["Da stimme ich dir zu.", "Тут я з тобою погоджуюся."], ["Ich bin da anderer Meinung.", "Я тут іншої думки."], ["Darf ich kurz etwas sagen?", "Можна мені коротко щось сказати?"]] },
    { t: "Заперечення", list: [["Ich weiß es noch nicht.", "Я ще не знаю."], ["Das gibt es hier nicht mehr.", "Цього тут уже немає."], ["Ich habe gar keine Zeit.", "У мене зовсім немає часу."]] },
  ],
  dialog: {
    t: "Дискусія на курсі орієнтування",
    lines: [
      ["Lehrerin", "Heute diskutieren wir: Soll die Altstadt von Xanten autofrei werden? Wer möchte anfangen?", "Сьогодні обговорюємо: чи має старе місто Ксантена стати вільним від авто? Хто хоче почати?"],
      ["Anna", "Ich! Ich finde, das ist eine gute Idee. Dann ist es ruhiger, und die Luft ist sauberer.", "Я! Я вважаю, це гарна ідея. Тоді буде тихіше, а повітря чистіше."],
      ["{Taras|Lessja}", "Da hast du teilweise recht, aber was ist mit alten Menschen? Nicht alle können weit zu Fuß gehen.", "Тут ти частково маєш рацію, але як щодо літніх людей? Не всі можуть далеко ходити пішки."],
      ["Anna", "Für sie könnte es kleine Elektrobusse geben.", "Для них могли б бути невеликі електроавтобуси."],
      ["{Taras|Lessja}", "Das kostet aber viel Geld. Ich bin nicht sicher, ob die Stadt das bezahlen kann.", "{Але це коштує багато. Я не певен, що місто зможе це оплатити.|Але це коштує багато. Я не певна, що місто зможе це оплатити.}"],
      ["Lehrerin", "Gute Argumente auf beiden Seiten. Wie könnte ein Kompromiss aussehen?", "Добрі аргументи з обох боків. Яким міг би бути компроміс?"],
      ["{Taras|Lessja}", "Wie wäre es, wenn die Altstadt nur am Wochenende autofrei ist? Dann können wir es ein Jahr ausprobieren.", "Може, старе місто буде без авто лише у вихідні? Тоді можна випробувати це рік."],
      ["Anna", "Da stimme ich zu. Und wer entscheidet das am Ende?", "З цим я погоджуюся. А хто зрештою це вирішує?"],
      ["Lehrerin", "Der Stadtrat. Aber alle können Vorschläge machen. Und in vielen Städten in NRW können Sie den Integrationsrat wählen, auch ohne deutschen Pass.", "Міська рада. Але пропозиції можуть вносити всі. А в багатьох містах NRW Ви можете обирати раду інтеграції навіть без німецького паспорта."],
      ["{Taras|Lessja}", "Das wusste ich noch nicht! Wie erfahre ich, wann die nächste Wahl ist?", "{Я цього ще не знав! Як дізнатися, коли наступні вибори?|Я цього ще не знала! Як дізнатися, коли наступні вибори?}"],
      ["Lehrerin", "Auf der Internetseite der Stadt oder im Amtsblatt. Und jetzt: Wer ist für den Kompromiss?", "На сайті міста або в офіційному віснику. А тепер: хто за компроміс?"],
      ["Anna", "Ich! Wir alle, glaube ich.", "Я! Здається, ми всі."],
    ],
  },
  tasks: [
    { t: "gap", q: "Hast du schon gewählt? – Nein, ___ nicht.", a: ["noch"] },
    { t: "gap", q: "Wohnst du noch in Köln? – Nein, nicht ___.", a: ["mehr"] },
    { t: "gap", q: "Ich habe ___ Zeit mehr.", a: ["keine"] },
    { t: "gap", q: "Hast du schon einen Pass? – Nein, noch ___.", a: ["keinen"] },
    { t: "gap", q: "___ hat mich gefragt. (ніхто)", a: ["Niemand", "niemand"] },
    { t: "gap", q: "Da stimme ich dir ___.", a: ["zu"] },
    { t: "gap", q: "Ich bin da anderer ___.", a: ["Meinung"] },
    { t: "gap", q: "Können wir uns darauf ___, dass wir es ausprobieren?", a: ["einigen"] },
    { t: "mc", q: "Як сказати «Я ніколи нічого не кажу»?", o: ["Ich sage nie nichts.", "Ich sage nie etwas.", "Ich sage nicht nie etwas."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich fahre zum Rathaus mit dem Fahrrad wegen der Wahl morgen.", "Ich fahre mit dem Fahrrad morgen zum Rathaus wegen der Wahl.", "Ich fahre morgen wegen der Wahl mit dem Fahrrad zum Rathaus."], a: 2 },
    { t: "mc", life: true, q: "Хто може голосувати на виборах до Бундестагу?", o: ["громадяни Німеччини від 18 років", "усі, хто живе в Німеччині понад рік", "лише члени партій"], a: 0 },
    { t: "mc", life: true, q: "Що можна без німецького громадянства?", o: ["голосувати на виборах до Бундестагу", "у багатьох містах NRW обирати раду інтеграції, підписувати петиції", "нічого"], a: 1 },
    { t: "mc", q: "`Das sehe ich genauso.` означає…", o: ["Я думаю інакше", "Я цього не бачу", "Я думаю так само"], a: 2 },
    { t: "mc", life: true, q: "Як ввічливо взяти слово в дискусії?", o: ["Darf ich kurz etwas sagen?", "Sei still!", "Jetzt rede ich!"], a: 0 },
    { t: "mc", life: true, q: "Сусід пропонує підписати петицію за новий дитячий майданчик. Чи можна без німецького громадянства?", o: ["так, петицію може підписати кожен", "ні, лише громадяни", "лише після іспиту B1"], a: 0 },
    { t: "mc", life: true, q: "Оголошення міста: `Bürgerversammlung zur neuen Umgehungsstraße – alle sind herzlich eingeladen.`", o: ["збори мешканців щодо нової об’їзної дороги, запрошені всі", "дорогу закривають", "лише для членів міської ради"], a: 0 },
  ],
};
