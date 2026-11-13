// Розділ 20 (A2). Переїзд і нова квартира: прийменники з двома відмінками (wo? → Dativ, wohin? → Akkusativ),
// пари stellen/stehen, legen/liegen, hängen, злиття ins, am, правила будинку й перереєстрація адреси.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 20, part: "A2.1", title: "Переїзд і нова квартира", book: null,
  goals: [
    "казати, де що стоїть і куди що поставити: auf dem Tisch / auf den Tisch",
    "вибирати між stellen і stehen, legen і liegen, hängen",
    "розуміти правила будинку (Hausordnung): тиша, сміття, підвал",
    "знати, що зробити після переїзду: перереєстрація за два тижні",
  ],
  grammar: [
    {
      id: "wechselWohin", t: "Wo? чи Wohin? Прийменники з двома відмінками", cat: "prep",
      text: [
        "Дев’ять прийменників можуть вимагати **двох відмінків**: `an, auf, hinter, in, neben, über, unter, vor, zwischen`. Відмінок залежить від питання:",
        "**Wo?** (де? — місце, без руху туди) → **Dativ**: `Das Buch liegt **auf dem** Tisch.`",
        "**Wohin?** (куди? — рух, зміна місця) → **Akkusativ**: `Ich lege das Buch **auf den** Tisch.`",
        "Підказка з української: «на столі» (де?) — Dativ; «на стіл» (куди?) — Akkusativ. Українська теж змінює відмінок!",
      ],
      tables: [
        { head: ["", "Wo? (Dativ)", "Wohin? (Akkusativ)"], rows: [["der Tisch", "auf **dem** Tisch", "auf **den** Tisch"], ["die Wand", "an **der** Wand", "an **die** Wand"], ["das Regal", "in **dem** (= im) Regal", "in **das** (= ins) Regal"], ["die Bücher (Pl.)", "neben **den** Bücher**n**", "neben **die** Bücher"]] },
        { cap: "Дев’ять прийменників", head: ["Прийменник", "Значення"], rows: [["an", "біля, на (вертикальному): an der Wand"], ["auf", "на (горизонтальному): auf dem Tisch"], ["hinter", "за, позаду"], ["in", "у, в"], ["neben", "поруч, біля"], ["über", "над"], ["unter", "під"], ["vor", "перед"], ["zwischen", "між"]] },
      ],
      ex: [["Die Lampe hängt über dem Tisch.", "Лампа висить над столом."], ["Ich hänge die Lampe über den Tisch.", "Я вішаю лампу над столом."], ["Die Katze schläft unter dem Bett.", "Кішка спить під ліжком."], ["Die Katze läuft unter das Bett.", "Кішка біжить під ліжко."], ["Der Schrank steht zwischen dem Fenster und der Tür.", "Шафа стоїть між вікном і дверима."]],
      warn: ["`Ich wohne in die Stadt` — помилка: wohnen відповідає на wo? → `in der Stadt`.", "Інші прийменники мають лише один відмінок: `mit, bei, zu, aus, von, nach, seit` — завжди Dativ (розділ 12), `für, ohne, durch, gegen, um` — завжди Akkusativ."],
    },
    {
      id: "verbpaare", t: "stellen — stehen, legen — liegen, hängen", cat: "verb",
      text: [
        "Українське «ставити / стояти», «класти / лежати», «вішати / висіти» німецькою — **пари дієслів**. Перше з пари — **дія** (куди? → Akkusativ), друге — **стан** (де? → Dativ):",
        "`stellen` (ставити вертикально) → `stehen` (стояти); `legen` (класти горизонтально) → `liegen` (лежати); `setzen` (садити) → `sitzen` (сидіти); `hängen` (вішати) → `hängen` (висіти) — одне слово для обох, різниця лише у відмінку.",
        "Як вибрати між stellen і legen? Пляшку, шафу, вазу **ставлять** (стоїть вертикально), книжку, ключі, телефон частіше **кладуть** (лежить пласко).",
      ],
      tables: [
        { head: ["Дія: wohin? + Akk.", "Perfekt", "Стан: wo? + Dat.", "Perfekt"], rows: [["stellen", "hat gestellt", "stehen", "hat gestanden"], ["legen", "hat gelegt", "liegen", "hat gelegen"], ["setzen", "hat gesetzt", "sitzen", "hat gesessen"], ["hängen", "hat gehängt", "hängen", "hat gehangen"]] },
      ],
      ex: [["Ich stelle die Vase auf den Tisch. – Die Vase steht auf dem Tisch.", "Я ставлю вазу на стіл. – Ваза стоїть на столі."], ["Wohin hast du meine Schlüssel gelegt? – Sie liegen auf dem Regal.", "Куди ти {поклав|поклала} мої ключі? – Вони лежать на полиці."], ["Ich hänge {mein Bild|das Foto} an die Wand.", "Я вішаю {свою картину|фотографію} на стіну."], ["Das Kind sitzt auf dem Stuhl.", "Дитина сидить на стільці."]],
      tips: ["Перевірка: є «куди?» і дія → `stellen/legen/setzen/hängen` + Akkusativ. Є «де?» і стан → `stehen/liegen/sitzen/hängen` + Dativ."],
    },
    {
      id: "kontraktion", t: "Злиття: im, ins, am, ans", cat: "prep",
      text: [
        "Прийменник і артикль часто **зливаються** в одне слово. Так кажуть завжди, повна форма звучить штучно:",
        "`in dem → im`, `in das → ins`, `an dem → am`, `an das → ans`, `von dem → vom`, `zu dem → zum`, `zu der → zur`, `bei dem → beim`.",
      ],
      tables: [
        { head: ["Wo? (Dativ)", "Wohin? (Akkusativ)"], rows: [["im Wohnzimmer", "ins Wohnzimmer"], ["am Fenster", "ans Fenster"], ["im Keller", "in den Keller"], ["in der Küche", "in die Küche"]] },
      ],
      ex: [["Das Sofa steht im Wohnzimmer.", "Диван стоїть у вітальні."], ["Bring den Karton bitte ins Schlafzimmer.", "Віднеси, будь ласка, коробку в спальню."], ["Wir sitzen gern am Fenster.", "Ми любимо сидіти біля вікна."], ["Stell den Stuhl ans Fenster.", "Постав стілець до вікна."]],
      warn: ["Злиття буває лише з `dem` і `das` (та `der` у `zur`). `in die Küche`, `in den Keller` — без злиття."],
    },
    {
      id: "hausordnung", t: "Правила будинку (Hausordnung)", cat: "rede",
      text: [
        "У багатьох будинках висить **Hausordnung** — правила для мешканців. Найчастіше там пишуть про **тишу** (`die Ruhezeit`): уночі, зазвичай з 22:00 до 6:00, і часто в неділю та свята не можна шуміти, свердлити чи гучно вмикати музику. Точний час дивися у своїй Hausordnung.",
        "Ще там пишуть про **сміття** (`Müll trennen` — сортувати), **під’їзд** (`das Treppenhaus` — не ставити там речі), **підвал** (`der Keller`) і **прибирання** (`die Treppenhausreinigung`, хто й коли миє сходи).",
        "Типові формули: `Es ist verboten, …` (заборонено…), `Bitte achten Sie auf…` (будь ласка, зважайте на…), `Fahrräder dürfen nicht im Treppenhaus stehen.`",
      ],
      ex: [["Ab zweiundzwanzig Uhr ist Ruhezeit.", "З двадцять другої години — час тиші."], ["Am Sonntag darf man nicht bohren.", "У неділю не можна свердлити."], ["Die Mülltonnen stehen im Hof.", "Сміттєві баки стоять у дворі."], ["Fahrräder bitte in den Keller stellen.", "Велосипеди, будь ласка, ставте в підвал."]],
      tips: ["Розклад вивезення сміття для Ксантена є в розділі «Сміття» цього застосунку."],
    },
    {
      id: "ummelden", t: "Після переїзду: перереєстрація", cat: "rede",
      text: [
        "Після переїзду в Німеччині треба **зареєструвати нову адресу** в бюро громадян (`das Bürgerbüro`, `das Bürgeramt`) — **протягом двох тижнів**. Це називається `sich ummelden` (перереєструватися) або `sich anmelden` (якщо переїхав з-за кордону чи з іншого міста).",
        "Знадобляться паспорт і **підтвердження від орендодавця** (`die Wohnungsgeberbestätigung`). Нову адресу варто повідомити й банку, страховій, роботодавцеві, а пошту можна переадресувати (`der Nachsendeauftrag`).",
      ],
      ex: [["Ich möchte mich ummelden.", "Я хочу перереєструвати адресу."], ["Ich bin am ersten Dezember umgezogen.", "Я {переїхав|переїхала} першого грудня."], ["Brauche ich einen Termin?", "Мені потрібен запис?"], ["Hier ist die Wohnungsgeberbestätigung.", "Ось підтвердження від орендодавця."]],
    },
  ],
  phrases: [
    { t: "Де? Куди?", list: [["Wohin soll ich den Karton stellen?", "Куди мені поставити коробку?"], ["Stell ihn bitte in die Küche.", "Постав її, будь ласка, на кухню."], ["Wo liegt der Hammer?", "Де лежить молоток?"], ["Er liegt unter dem Tisch.", "Він лежить під столом."], ["Häng das Bild bitte an die Wand.", "Повісь, будь ласка, картину на стіну."]] },
    { t: "Переїзд", list: [["Kannst du mir beim Umzug helfen?", "Можеш допомогти мені з переїздом?"], ["Wir brauchen noch Umzugskartons.", "Нам ще потрібні коробки для переїзду."], ["Der Schrank passt nicht durch die Tür.", "Шафа не проходить у двері."], ["Ich muss mich noch ummelden.", "Мені ще треба перереєструвати адресу."]] },
    { t: "Сусіди й будинок", list: [["Entschuldigung, ich bin neu hier.", "Перепрошую, я тут {новенький|новенька}."], ["Wann ist hier Ruhezeit?", "Коли тут час тиші?"], ["Wo stehen die Mülltonnen?", "Де стоять сміттєві баки?"], ["Darf ich mein Fahrrad in den Keller stellen?", "Можна поставити мій велосипед у підвал?"]] },
  ],
  dialog: {
    t: "День переїзду",
    lines: [
      ["Max", "So, der letzte Karton! Wohin soll ich ihn stellen?", "Ну, остання коробка! Куди її поставити?"],
      ["{Taras|Lessja}", "{Da sind meine Farben und Pinsel drin.|Da sind meine Bücher drin.} Stell ihn bitte ins Arbeitszimmer, neben den Schreibtisch.", "{Там мої фарби й пензлі.|Там мої книжки.} Постав її, будь ласка, в кабінет, біля письмового столу."],
      ["Max", "Okay. Und das Bild hier? Soll ich es an die Wand hängen?", "Гаразд. А ця картина? Повісити її на стіну?"],
      ["{Taras|Lessja}", "Ja, gern, über das Sofa. Da ist schon ein Nagel.", "Так, будь ласка, над диваном. Там уже є цвях."],
      ["Max", "Gemacht! Sieht toll aus. Wo liegt eigentlich der Hammer?", "Готово! Виглядає чудово. А де, до речі, молоток?"],
      ["{Taras|Lessja}", "Ich glaube, er liegt in der Küche, auf dem Kühlschrank.", "Здається, він на кухні, на холодильнику."],
      ["Max", "Ah, da ist er. Und der Schrank? Der steht ja noch im Flur!", "О, ось він. А шафа? Вона ж іще стоїть у коридорі!"],
      ["{Taras|Lessja}", "Den stellen wir morgen ins Schlafzimmer. Heute ist Sonntag, da dürfen wir keinen Lärm machen.", "Її поставимо в спальню завтра. Сьогодні неділя, шуміти не можна."],
      ["Max", "Stimmt, die Ruhezeit! Und hast du dich schon umgemeldet?", "Точно, час тиші! А ти вже {перереєструвався|перереєструвалася}?"],
      ["{Taras|Lessja}", "Noch nicht. Ich habe am Mittwoch einen Termin im Bürgerbüro.", "Ще ні. У середу в мене запис у бюро громадян."],
      ["Max", "Gut. Jetzt setzen wir uns aufs Sofa und trinken einen Kaffee!", "Добре. А тепер сядьмо на диван і вип’ємо кави!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Das Buch liegt auf ___ Tisch. (der)", a: ["dem"], why: "Wo? → Dativ." },
    { t: "gap", q: "Ich lege das Buch auf ___ Tisch. (der)", a: ["den"], why: "Wohin? → Akkusativ." },
    { t: "gap", q: "Das Bild hängt an ___ Wand. (die)", a: ["der"] },
    { t: "gap", q: "Ich hänge das Bild an ___ Wand. (die)", a: ["die"] },
    { t: "gap", q: "Die Katze schläft unter ___ Bett. (das)", a: ["dem"] },
    { t: "gap", q: "Wir gehen ___ Wohnzimmer. (in + das)", a: ["ins"] },
    { t: "gap", q: "Das Sofa steht ___ Wohnzimmer. (in + dem)", a: ["im"] },
    { t: "gap", q: "Wohin hast du die Flasche ___? (stellen, Partizip)", a: ["gestellt"] },
    { t: "gap", q: "Die Schlüssel haben auf dem Tisch ___. (liegen, Partizip)", a: ["gelegen"] },
    { t: "mc", q: "Яке дієслово? Die Vase ___ auf dem Tisch.", o: ["stellt", "steht", "legt"], a: 1, why: "Стан, де? → stehen." },
    { t: "mc", q: "Яке дієслово? Ich ___ das Handy auf das Sofa.", o: ["liege", "lege", "stehe"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich wohne in die Stadt.", "Ich wohne in der Stadt.", "Ich wohne in den Stadt."], a: 1 },
    { t: "mc", q: "За скільки часу після переїзду треба перереєструвати адресу?", o: ["за два тижні", "за два місяці", "за рік"], a: 0 },
    { t: "mc", q: "Що таке Ruhezeit?", o: ["час тиші", "обідня перерва", "відпустка"], a: 0 },
  ],
};
