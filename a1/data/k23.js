// Розділ 23 (A2). Здоров’я та аптека: зворотні дієслова (sich fühlen, sich erkälten), зворотний займенник у Dativ
// (Ich wasche mir die Hände), порада з sollte, аптека в Німеччині, номери 112 і 116 117.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 23, part: "A2.1", title: "Здоров’я та аптека", book: null,
  goals: [
    "казати, як почуваєшся: Ich fühle mich…, Ich habe mich erkältet",
    "вживати зворотні дієслова з mich і mir",
    "радити: Du solltest…",
    "купувати ліки в аптеці й знати, коли дзвонити 112, а коли 116 117",
  ],
  grammar: [
    {
      id: "reflexAkk", t: "Зворотні дієслова: sich fühlen, sich erkälten", cat: "pron",
      text: [
        "Українське **-ся** («почуваюся», «застудився») німецькою — окреме слово, **зворотний займенник**: `ich fühle **mich**`, `er hat **sich** erkältet`. Він змінюється за особами.",
        "Для `ich, du, wir, ihr` це звичайні `mich, dich, uns, euch`, а для `er, sie, es` і `sie, Sie` — одне слово **sich**.",
        "Не завжди збігається з українською: `sich freuen` — радіти (без -ся), а `lernen` — вчитися (без sich). У Perfekt — з `haben`: `Ich habe mich erkältet.`",
      ],
      tables: [
        { head: ["Особа", "sich fühlen", "sich erkälten (Perfekt)"], rows: [["ich", "ich fühle **mich**", "ich habe **mich** erkältet"], ["du", "du fühlst **dich**", "du hast **dich** erkältet"], ["er/sie/es", "er fühlt **sich**", "er hat **sich** erkältet"], ["wir", "wir fühlen **uns**", "wir haben **uns** erkältet"], ["ihr", "ihr fühlt **euch**", "ihr habt **euch** erkältet"], ["sie/Sie", "sie fühlen **sich**", "sie haben **sich** erkältet"]] },
      ],
      ex: [["Wie fühlst du dich heute?", "Як ти сьогодні почуваєшся?"], ["Ich habe mich erkältet.", "Я {застудився|застудилася}."], ["Setzen Sie sich bitte!", "Сідайте, будь ласка!"], ["Du musst dich ausruhen.", "Тобі треба відпочити."], ["Wir freuen uns auf das Wochenende.", "Ми з нетерпінням чекаємо вихідних."]],
      warn: ["`Ich fühle gut` — помилка: `sich fühlen` без займенника не буває: `Ich fühle mich gut.`"],
      tips: ["`sich` стоїть одразу після дієслова, а якщо підмет іде після дієслова — після підмета: `Heute fühle ich mich besser.`"],
    },
    {
      id: "reflexDat", t: "Ich wasche mir die Hände: зворотний займенник у Dativ", cat: "pron",
      text: [
        "Якщо в реченні вже є додаток у знахідному (що саме?), зворотний займенник переходить у **Dativ**: `Ich wasche **mich**.` (себе) → `Ich wasche **mir** die Hände.` (собі руки).",
        "Різниця є лише для `ich` і `du`: `mir, dir`. Решта форм ті самі: `sich, uns, euch, sich`.",
        "Так говорять про тіло й одяг: `sich die Zähne putzen` (чистити зуби), `sich die Haare kämmen`, `sich das Bein brechen` (зламати ногу), `sich eine Jacke anziehen`.",
      ],
      tables: [
        { head: ["Akkusativ: себе", "Dativ: собі + що?"], rows: [["ich wasche **mich**", "ich wasche **mir** die Hände"], ["du kämmst **dich**", "du kämmst **dir** die Haare"], ["er zieht **sich** an", "er zieht **sich** eine Jacke an"]] },
      ],
      ex: [["Ich putze mir die Zähne.", "Я чищу зуби."], ["Wascht euch bitte die Hände!", "Помийте, будь ласка, руки!"], ["Er hat sich das Bein gebrochen.", "Він зламав ногу."], ["Zieh dir eine warme Jacke an!", "Одягни теплу куртку!"]],
      warn: ["`Ich wasche mich die Hände` — помилка: коли є «що?» (die Hände), займенник у Dativ: `Ich wasche mir die Hände.`"],
    },
    {
      id: "sollte", t: "Порада: Du solltest…", cat: "verb",
      text: [
        "Щоб **порадити**, німці кажуть `sollte` — «варто б», «слід було б»: `Du solltest zum Arzt gehen.` — «Тобі варто піти до лікаря.»",
        "Це форма від `sollen` (розділ 13), але м’якша: `Du sollst…` — «тобі сказали, так треба», `Du solltest…` — «я тобі раджу».",
        "Будова як у модальних дієслів: `sollte` на другому місці, інфінітив у кінці.",
      ],
      tables: [
        { head: ["Особа", "sollte"], rows: [["ich", "sollte"], ["du", "solltest"], ["er/sie/es", "sollte"], ["wir", "sollten"], ["ihr", "solltet"], ["sie/Sie", "sollten"]] },
      ],
      ex: [["Du solltest mehr schlafen.", "Тобі варто більше спати."], ["Sie sollten viel Tee trinken.", "Вам варто пити багато чаю."], ["Ihr solltet nicht so viel Kaffee trinken.", "Вам не варто пити стільки кави."], ["Was sollte ich tun?", "Що мені варто зробити?"], ["Im Winter sollte man sich warm anziehen.", "Узимку варто тепло вдягатися."]],
      tips: ["Ще м’якше: `An deiner Stelle würde ich…` — «На твоєму місці я б…» (розділ 28)."],
    },
    {
      id: "apotheke", t: "В аптеці: рецепт, без рецепта, як приймати", cat: "rede",
      text: [
        "Ліки в Німеччині продають переважно **в аптеці** (`die Apotheke`), навіть ті, що без рецепта (`rezeptfrei`). Ліки за рецептом (`verschreibungspflichtig`) дають лише з рецептом від лікаря; тепер це зазвичай **електронний рецепт** (`das E-Rezept`), який аптека читає з картки медичного страхування.",
        "За ліки за рецептом дорослі зазвичай доплачують **10 % ціни, але не менше 5 і не більше 10 євро** (`die Zuzahlung`). Діти й підлітки до 18 років не доплачують.",
        "Уночі, у неділю та свята працює **чергова аптека** (`die Notdienst-Apotheke`); адресу найближчої пишуть на дверях кожної аптеки.",
        "Як приймати: `dreimal täglich` (тричі на день), `vor / nach dem Essen` (до / після їди). Інструкція в упаковці — `die Packungsbeilage`.",
      ],
      tables: [
        { head: ["Німецькою", "Українською"], rows: [["die Tablette", "таблетка"], ["die Tropfen", "краплі"], ["der Hustensaft", "сироп від кашлю"], ["die Salbe", "мазь"], ["das Nasenspray", "спрей для носа"], ["das Pflaster", "пластир"]] },
      ],
      ex: [["Ich brauche etwas gegen Halsschmerzen.", "Мені потрібно щось від болю в горлі."], ["Ist das Medikament rezeptfrei?", "Ці ліки без рецепта?"], ["Nehmen Sie dreimal täglich eine Tablette.", "Приймайте по одній таблетці тричі на день."], ["Ich habe ein Rezept von meiner Ärztin.", "У мене є рецепт від моєї лікарки."]],
    },
    {
      id: "notfall", t: "Терміново: 112 і 116 117", cat: "rede",
      text: [
        "**112** — швидка допомога й пожежна (`der Rettungsdienst`, `die Feuerwehr`): коли є загроза життю — сильний біль у грудях, людина непритомна, тяжка травма, пожежа.",
        "**116 117** — черговий лікар (`der ärztliche Bereitschaftsdienst`): коли практика вже зачинена (вечір, вихідні), а чекати до ранку не варто, але загрози життю немає. Дзвінок безкоштовний.",
        "Що сказати: **де** це сталося, **що** сталося, **скільки** людей постраждало, **хто** дзвонить. Потім чекати на запитання й не класти слухавку першим.",
        "Усі номери є також у розділі «Екстрено» цього застосунку.",
      ],
      tables: [
        { head: ["Номер", "Коли"], rows: [["112", "загроза життю: швидка, пожежа"], ["116 117", "черговий лікар увечері й у вихідні"], ["110", "поліція"]] },
      ],
      ex: [["Hilfe! Bitte rufen Sie einen Krankenwagen!", "Допоможіть! Викличте, будь ласка, швидку!"], ["Ein Mann ist umgefallen. Er atmet, aber er reagiert nicht.", "Чоловік упав. Він дихає, але не реагує."], ["Wir sind im Park neben dem Rathaus.", "Ми в парку біля ратуші."], ["Meine Nachbarin hat hohes Fieber, und die Praxis ist schon zu.", "У моєї сусідки висока температура, а практика вже зачинена."]],
    },
  ],
  phrases: [
    { t: "Як ти?", list: [["Wie fühlst du dich?", "Як почуваєшся?"], ["Mir geht es nicht so gut.", "Мені не дуже добре."], ["Ich habe mich erkältet.", "Я {застудився|застудилася}."], ["Ich habe Kopfschmerzen und Schnupfen.", "У мене болить голова і нежить."], ["Gute Besserung!", "Одужуй! / Одужуйте!"]] },
    { t: "В аптеці", list: [["Ich brauche etwas gegen Husten.", "Мені потрібно щось від кашлю."], ["Wie oft muss ich das nehmen?", "Як часто це треба приймати?"], ["Haben Sie das auch als Saft?", "У Вас є це у вигляді сиропу?"], ["Wo ist die nächste Notdienst-Apotheke?", "Де найближча чергова аптека?"]] },
    { t: "Порада", list: [["Du solltest zum Arzt gehen.", "Тобі варто піти до лікаря."], ["Ruh dich aus!", "Відпочинь!"], ["Trink viel Tee mit Honig.", "Пий багато чаю з медом."], ["Zieh dich warm an!", "Одягнися тепло!"]] },
  ],
  dialog: {
    t: "В аптеці",
    lines: [
      ["Apothekerin", "Guten Tag! Was kann ich für Sie tun?", "Добрий день! Чим можу допомогти?"],
      ["{Taras|Lessja}", "Guten Tag! Ich habe mich erkältet. Ich habe Halsschmerzen und Schnupfen.", "Добрий день! Я {застудився|застудилася}. У мене болить горло і нежить."],
      ["Apothekerin", "Haben Sie auch Fieber?", "А температура є?"],
      ["{Taras|Lessja}", "Nein, aber ich fühle mich sehr müde.", "Ні, але я почуваюся дуже {втомленим|втомленою}."],
      ["Apothekerin", "Dann empfehle ich Ihnen diese Lutschtabletten und ein Nasenspray.", "Тоді раджу Вам ці льодяники від горла й спрей для носа."],
      ["{Taras|Lessja}", "Brauche ich dafür ein Rezept?", "Для них потрібен рецепт?"],
      ["Apothekerin", "Nein, beides ist rezeptfrei. Nehmen Sie dreimal täglich eine Tablette, nach dem Essen.", "Ні, обидва без рецепта. Приймайте по одній таблетці тричі на день, після їди."],
      ["{Taras|Lessja}", "Gut. Und was sollte ich sonst noch tun?", "Добре. А що мені ще варто робити?"],
      ["Apothekerin", "Sie sollten viel trinken und sich ausruhen. Und wenn es in drei Tagen nicht besser ist, gehen Sie bitte zum Arzt.", "Вам варто багато пити й відпочивати. А якщо за три дні не покращає, підіть, будь ласка, до лікаря."],
      ["{Taras|Lessja}", "{Das mache ich. Zum Glück kann ich zu Hause malen.|Das mache ich. Zum Glück kann ich zu Hause lesen und schreiben.}", "{Так і зроблю. Добре, що вдома можна малювати.|Так і зроблю. Добре, що вдома можна читати й писати.}"],
      ["Apothekerin", "Sehr gut. Gute Besserung!", "Чудово. Одужуйте!"],
      ["{Taras|Lessja}", "Danke schön! Auf Wiedersehen!", "Щиро дякую! До побачення!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich fühle ___ heute nicht gut.", a: ["mich"] },
    { t: "gap", q: "Wie fühlst du ___?", a: ["dich"] },
    { t: "gap", q: "Er hat ___ erkältet.", a: ["sich"] },
    { t: "gap", q: "Wir freuen ___ auf den Urlaub.", a: ["uns"] },
    { t: "gap", q: "Ich wasche ___ die Hände.", a: ["mir"], why: "Є «що?» (die Hände) — займенник у Dativ." },
    { t: "gap", q: "Putzt du ___ die Zähne?", a: ["dir"] },
    { t: "gap", q: "Du ___ mehr schlafen. (sollen, порада)", a: ["solltest"] },
    { t: "gap", q: "Sie ___ viel Tee trinken. (sollen, порада)", a: ["sollten"] },
    { t: "mc", q: "Як правильно?", o: ["Ich fühle gut.", "Ich fühle mich gut.", "Ich fühle mir gut."], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich wasche mich die Hände.", "Ich wasche mir die Hände.", "Ich wasche die Hände mich."], a: 1 },
    { t: "mc", q: "Куди дзвонити, якщо людина непритомна?", o: ["110", "112", "116 117"], a: 1 },
    { t: "mc", q: "Увечері практика зачинена, загрози життю немає, але потрібен лікар. Куди дзвонити?", o: ["112", "116 117", "110"], a: 1 },
    { t: "mc", q: "Що означає «rezeptfrei»?", o: ["без рецепта", "за рецептом", "безкоштовно"], a: 0 },
    { t: "mc", q: "«Du solltest zum Arzt gehen» — це…", o: ["порада", "наказ", "заборона"], a: 0 },
  ],
};
