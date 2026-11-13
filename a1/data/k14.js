// Розділ 14. Погода, пори року, час (denn, vor, seit). Граматика — як у розділі 14 Die neue Linie 1, тема наша.
export default {
  n: 14, part: "A1.2", title: "Погода й час", book: null,
  goals: [
    "розповісти про погоду й пори року",
    "пояснити причину: …, denn …",
    "сказати, як давно щось триває (seit) і коли щось було (vor)",
    "висловити думку: Ich finde…, Ich glaube…",
  ],
  grammar: [
    {
      id: "denn", t: "denn — бо", cat: "satz",
      text: [
        "**denn** (бо, адже) пояснює причину й з’єднує два головні речення — як `und` і `aber`, **не займає місця**. Перед `denn` завжди **кома**.",
        "Після `denn` — звичайний порядок: щось на 1-му місці, дієслово друге.",
        "Питання про причину — **warum?** (чому?). Відповідь можна почати і з `denn`, і з `weil` (`weil` — це вже рівень A2, після нього дієслово йде в кінець).",
      ],
      tables: [
        { head: ["Речення 1", "0", "1", "2", "далі"], rows: [["Ich bleibe zu Hause,", "denn", "es", "regnet.", ""], ["Wir fahren nicht ans Meer,", "denn", "das Wetter", "ist", "schlecht."], ["Ich nehme einen Schirm,", "denn", "heute", "soll", "es regnen."]] },
      ],
      ex: [["Ich komme heute nicht, denn ich bin krank.", "Я сьогодні не прийду, бо хворію."], ["Warum lernst du Deutsch? – Ich lerne Deutsch, denn ich wohne jetzt in Deutschland.", "Чому ти вчиш німецьку? – Я вчу німецьку, бо тепер живу в Німеччині."], ["Wir gehen schwimmen, denn es ist sehr heiß.", "Ми йдемо плавати, бо дуже спекотно."]],
      warn: ["`…, denn es ist regnet` або `…, denn es regnen` — помилки. Після denn звичайне речення: `denn es regnet`.", "Речення з `denn` не стоїть першим: `Denn es regnet, ich bleibe…` — так не можна."],
    },
    {
      id: "seitVor", t: "seit і vor: як давно й коли", cat: "prep",
      text: [
        "**seit** + Dativ — дія **почалася в минулому і триває досі**. Дієслово — у **теперішньому** часі: `Ich wohne seit zwei Monaten in Xanten.` (живу вже два місяці і досі живу). В українській — «уже два місяці», «з жовтня».",
        "**vor** + Dativ — **скільки часу тому** щось сталося. Дієслово — в **минулому**: `Ich bin vor zwei Monaten nach Xanten gezogen.` (переїхав два місяці тому).",
        "Обидва прийменники вимагають Dativ, тож множина отримує `-n`: `seit drei Tagen`, `vor zwei Jahren`, `seit einer Woche`, `vor einem Monat`.",
      ],
      tables: [
        { head: ["Питання", "Прийменник", "Час дієслова", "Приклад"], rows: [["Seit wann?", "seit", "теперішній", "`Ich lerne seit Oktober Deutsch.`"], ["Wie lange schon?", "seit", "теперішній", "`Ich warte seit zehn Minuten.`"], ["Wann? (скільки тому)", "vor", "минулий", "`Ich bin vor einer Woche angekommen.`"]] },
        { cap: "Dativ після seit/vor", head: ["", "der Monat", "die Woche", "das Jahr", "множина"], rows: [["seit/vor", "einem Monat", "einer Woche", "einem Jahr", "zwei Monaten / Wochen / Jahren"]] },
      ],
      ex: [["Seit wann bist du in Deutschland? – Seit September.", "Відколи ти в Німеччині? – З вересня."], ["Ich habe seit drei Tagen Kopfschmerzen.", "У мене вже три дні болить голова."], ["Wir haben vor einem Jahr geheiratet.", "Ми одружилися рік тому."], ["Der Bus ist vor fünf Minuten abgefahren.", "Автобус поїхав п’ять хвилин тому."]],
      warn: ["`Ich wohne hier seit zwei Monate` — після seit Dativ множини: `seit zwei Monaten`.", "`Ich habe seit zwei Jahren hier gewohnt` — калька. Якщо досі живеш: `Ich wohne seit zwei Jahren hier.`"],
    },
    {
      id: "wetter", t: "Погода: es regnet, es ist kalt", cat: "rede",
      text: [
        "Про погоду кажуть з безособовим **es**: `Es regnet.` (іде дощ), `Es schneit.` (іде сніг), `Es ist warm.` Без `es` такі речення неправильні.",
        "Температура: `Es sind zehn Grad.` (плюс), `Es ist minus zwei Grad.` або `zwei Grad unter null`.",
        "Ще кілька зручних виразів: `Die Sonne scheint.` (світить сонце), `Es ist windig / bewölkt / neblig.`, `Wie ist das Wetter?` — яка погода?",
      ],
      tables: [
        { head: ["Іменник", "Дієслово", "Прикметник"], rows: [["der Regen", "es regnet", "regnerisch"], ["der Schnee", "es schneit", "—"], ["die Sonne", "die Sonne scheint", "sonnig"], ["der Wind", "—", "windig"], ["die Wolke", "—", "bewölkt"], ["der Nebel", "—", "neblig"]] },
      ],
      ex: [["Wie ist das Wetter heute? – Es ist kalt und es regnet.", "Яка сьогодні погода? – Холодно й іде дощ."], ["Im Winter schneit es nicht oft am Niederrhein.", "Узимку на Нижньому Рейні сніг іде нечасто."], ["Morgen soll die Sonne scheinen.", "Завтра обіцяють сонце."]],
      tips: ["`soll` у прогнозі = «кажуть, що буде»: `Morgen soll es regnen.` — Завтра обіцяють дощ."],
      warn: ["`Ist kalt.` / `Regnet.` — помилка, потрібне `es`: `Es ist kalt.`, `Es regnet.`"],
    },
    {
      id: "meinung", t: "Думка: Ich finde…, Ich glaube…", cat: "rede",
      text: [
        "**finden** + Akkusativ + прикметник: `Ich finde den Film gut.` (фільм, на мою думку, гарний). `Wie findest du…?` — як тобі…?",
        "**Ich glaube / Ich denke / Ich meine, …** — я думаю, що… Після них зручно говорити звичайним реченням: `Ich glaube, morgen regnet es.`",
      ],
      ex: [["Wie findest du das Wetter hier? – Ich finde es zu nass.", "Як тобі тутешня погода? – Як на мене, занадто волога."], ["Ich finde den Herbst schön.", "Мені подобається осінь."], ["Ich glaube, der Bus kommt gleich.", "Думаю, автобус зараз приїде."]],
    },
  ],
  phrases: [
    { t: "Погода", list: [["Wie ist das Wetter?", "Яка погода?"], ["Heute ist es sonnig und warm.", "Сьогодні сонячно й тепло."], ["Es regnet schon den ganzen Tag.", "Дощ іде вже цілий день."], ["Nimm einen Schirm mit!", "Візьми парасольку!"], ["Was sagt der Wetterbericht?", "Що каже прогноз погоди?"]] },
    { t: "Як давно", list: [["Seit wann lernst du Deutsch?", "Відколи ти вчиш німецьку?"], ["Seit zwei Monaten.", "Уже два місяці."], ["Ich bin vor drei Monaten nach Deutschland gekommen.", "Я {приїхав|приїхала} до Німеччини три місяці тому."]] },
    { t: "Причина", list: [["Warum kommst du nicht?", "Чому ти не прийдеш?"], ["Ich kann nicht kommen, denn ich muss arbeiten.", "Я не можу прийти, бо мушу працювати."]] },
  ],
  dialog: {
    t: "Плани на суботу",
    lines: [
      ["Anna", "Wollen wir am Samstag eine Radtour machen?", "Може, у суботу поїдемо на велосипедах?"],
      ["{Taras|Lesia}", "Gute Idee! Aber wie ist das Wetter am Samstag?", "Гарна ідея! А яка погода в суботу?"],
      ["Anna", "Der Wetterbericht sagt, es soll sonnig sein. Zwölf Grad.", "Прогноз каже, що має бути сонячно. Дванадцять градусів."],
      ["{Taras|Lesia}", "Super. Ich fahre gern Rad, denn ich habe seit einem Monat ein neues Fahrrad.", "Чудово. Я люблю кататися, бо вже місяць маю новий велосипед."],
      ["Anna", "Wirklich? Du hast doch vor zwei Wochen gesagt, du hast kein Fahrrad.", "Справді? Ти ж два тижні тому {казав|казала}, що не маєш велосипеда."],
      ["{Taras|Lesia}", "Ja, aber dann habe ich eins gekauft. Gebraucht, aber gut!", "Так, але потім {купив|купила}. Уживаний, але добрий!"],
      ["Anna", "Toll! Dann fahren wir nach Wesel, am Rhein entlang.", "Клас! Тоді поїдемо до Везеля вздовж Рейну."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich bleibe zu Hause, ___ es regnet.", a: ["denn"] },
    { t: "gap", q: "Ich wohne ___ zwei Monaten in Xanten.", a: ["seit"], why: "Дія триває досі → seit." },
    { t: "gap", q: "Ich bin ___ zwei Monaten nach Xanten gekommen.", a: ["vor"], why: "Скільки часу тому → vor." },
    { t: "gap", q: "Ich lerne seit drei ___ Deutsch. (Monat)", a: ["Monaten"], why: "seit + Dativ множини: -n." },
    { t: "gap", q: "Heute ___ es. (regnen)", a: ["regnet"] },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich komme nicht, denn ich bin krank.", "Ich komme nicht, denn ich krank bin.", "Ich komme nicht, denn bin ich krank."], a: 0 },
    { t: "mc", q: "Як сказати «Я вчу німецьку вже рік»?", o: ["Ich lerne vor einem Jahr Deutsch.", "Ich lerne seit einem Jahr Deutsch.", "Ich habe seit einem Jahr Deutsch gelernt."], a: 1 },
    { t: "mc", q: "Як сказати «холодно»?", o: ["Ist kalt.", "Es ist kalt.", "Ich bin kalt."], a: 1 },
    { t: "mc", q: "«Morgen soll es regnen» означає:", o: ["Завтра має піти дощ (кажуть прогнози).", "Завтра мусить іти дощ.", "Завтра йшов дощ."], a: 0 },
    { t: "mc", q: "Wie findest du den Film? – Ich finde ___ gut.", o: ["er", "ihn", "ihm"], a: 1, why: "finden + Akkusativ: der Film → ihn." },
    { t: "mc", q: "Seit wann bist du hier? – ___ September.", o: ["Vor", "Seit", "Am"], a: 1 },
  ],
};
