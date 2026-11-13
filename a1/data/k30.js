// Розділ 30 (A2). Природа й довкілля: інфінітив із zu (Es ist wichtig, Müll zu trennen; Ich habe keine Zeit, …),
// сортування сміття й застава (Pfand), природа Нижнього Рейну, як берегти енергію.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші. Справжнє: Леся Українка виросла на Волині.
export default {
  n: 30, part: "A2.2", title: "Природа й довкілля", book: null,
  goals: [
    "казати, що важливо чи заборонено: Es ist wichtig, Müll zu trennen",
    "вживати zu + інфінітив: Ich habe keine Zeit, …, Vergiss nicht, …",
    "сортувати сміття й здавати пляшки (Pfand)",
    "говорити про природу, погоду й довкілля",
  ],
  grammar: [
    {
      id: "zuInf", t: "zu + інфінітив: Ich habe keine Zeit, ins Kino zu gehen", cat: "satz",
      text: [
        "Після деяких слів друга частина речення — **інфінітив із zu** у кінці: `Ich habe keine Zeit, **ins Kino zu gehen**.` Українською — просто інфінітив: «піти в кіно».",
        "Так буває після: `Zeit / Lust / Angst haben`, `versuchen` (намагатися), `vergessen`, `anfangen / beginnen`, `aufhören` (припиняти), `vorhaben` (планувати), `Es ist wichtig / schön / schwer / verboten …`",
        "У відокремлюваних дієсловах `zu` стоїть **усередині**: `anrufen → anzurufen`, `mitnehmen → mitzunehmen`.",
      ],
      tables: [
        { head: ["Початок", "… zu + інфінітив"], rows: [["Ich habe keine Lust,", "heute zu kochen."], ["Vergiss nicht,", "das Licht auszumachen."], ["Es ist wichtig,", "Müll zu trennen."], ["Ich versuche,", "jeden Tag Deutsch zu sprechen."], ["Wir haben vor,", "am Wochenende wandern zu gehen."]] },
      ],
      ex: [["Hast du Lust, am Sonntag Rad zu fahren?", "Хочеш у неділю покататися на велосипеді?"], ["Vergiss nicht, die Fenster zuzumachen.", "Не забудь зачинити вікна."], ["Es ist verboten, hier Müll abzuladen.", "Тут заборонено скидати сміття."], ["Ich versuche, weniger Plastik zu kaufen.", "Я намагаюся купувати менше пластику."], ["Es hat angefangen zu regnen.", "Почався дощ."]],
      warn: ["Після модальних дієслів — **без** zu: `Ich muss Müll trennen.`, а не `zu trennen`."],
      tips: ["`Du brauchst nicht zu warten.` — «Тобі не треба чекати»: `nicht brauchen` теж вимагає zu."],
    },
    {
      id: "muell", t: "Сортування сміття й Pfand", cat: "rede",
      text: [
        "У Німеччині сміття сортують. Зазвичай так: **жовтий** бак чи мішок (`die Gelbe Tonne`, `der Gelbe Sack`) — упаковки з пластику й металу; **синій** (`die Papiertonne`) — папір і картон; **коричневий** (`die Biotonne`) — залишки їжі й садові відходи; **сірий** чи **чорний** (`die Restmülltonne`) — решта.",
        "Скло несуть до **контейнерів** (`der Glascontainer`) окремо за кольором: біле, зелене, коричневе. Кидати скло можна лише вдень у будні — точний час написано на контейнері.",
        "**Pfand** — застава за пляшки й банки: 25 центів за одноразову пляшку чи банку, 8 або 15 центів за багаторазову. Порожню тару здають в автомат у супермаркеті й отримують чек.",
        "Розклад вивезення сміття для Ксантена — у розділі «Сміття» цього застосунку.",
      ],
      ex: [["Wohin kommt der Joghurtbecher? – In die Gelbe Tonne.", "Куди стаканчик від йогурту? – У жовтий бак."], ["Altes Brot gehört in die Biotonne.", "Старий хліб — у біобак."], ["Die Flaschen bringe ich zum Glascontainer.", "Пляшки я відношу до контейнера для скла."], ["Auf diese Flasche gibt es Pfand.", "За цю пляшку повертають заставу."]],
    },
    {
      id: "natur", t: "Природа й погода: der Wald, das Gewitter", cat: "rede",
      text: [
        "Природа: `der Wald` (ліс), `die Wiese` (луг), `das Feld` (поле), `die Landschaft` (краєвид), `der Baum`, `die Pflanze` (рослина), `das Tier`, `der Vogel` (птах).",
        "Погода й клімат: `das Gewitter` (гроза), `der Sturm` (буря), `der Nebel` (туман), `das Glatteis` (ожеледь), `die Hitze` (спека), `der Klimawandel` (зміна клімату), `die Umwelt` (довкілля), `schützen` (захищати).",
        "Нижній Рейн — рівнина з луками, полями й старими рукавами Рейну. Узимку сюди з півночі прилітають тисячі диких гусей.",
      ],
      ex: [["Am Wochenende gehen wir im Wald spazieren.", "На вихідних ми гуляємо в лісі."], ["Im Winter kommen viele Wildgänse an den Niederrhein.", "Узимку на Нижній Рейн прилітає багато диких гусей."], ["Morgen gibt es ein Gewitter.", "Завтра буде гроза."], ["Wir müssen die Umwelt schützen.", "Ми мусимо захищати довкілля."], ["{Ich male gern Landschaften.|Ich bin zwischen Wäldern und Seen aufgewachsen.}", "{Я люблю малювати краєвиди.|Я виросла серед лісів і озер.}"]],
    },
    {
      id: "sparen", t: "Берегти енергію: richtig lüften, Licht aus", cat: "rede",
      text: [
        "`Energie sparen` — економити енергію: вимикати світло, взимку провітрювати **коротко й широко відчинивши вікно** (`stoßlüften`), а не тримати його довго трохи відчиненим.",
        "`Wasser sparen`, `reparieren statt wegwerfen` (лагодити, а не викидати), `mit dem Fahrrad fahren`, `gebraucht kaufen` (купувати вживане).",
        "Слова: `die Heizung` (опалення), `der Strom` (електроенергія), `die Stromrechnung` (рахунок за світло), `der Verbrauch` (споживання).",
      ],
      ex: [["Mach bitte das Licht aus, wenn du rausgehst.", "Вимикай, будь ласка, світло, коли виходиш."], ["Im Winter lüften wir dreimal am Tag kurz.", "Узимку ми тричі на день коротко провітрюємо."], ["Kaputte Sachen kann man oft reparieren.", "Зламані речі часто можна полагодити."], ["Dreh die Heizung bitte etwas runter.", "Прикрути, будь ласка, трохи опалення."]],
    },
  ],
  phrases: [
    { t: "Сміття", list: [["Wohin kommt das?", "Куди це викидати?"], ["Wann wird der Müll abgeholt?", "Коли вивозять сміття?"], ["Wo ist der nächste Glascontainer?", "Де найближчий контейнер для скла?"], ["Kann ich die Flaschen hier zurückgeben?", "Тут можна здати пляшки?"]] },
    { t: "Природа", list: [["Hast du Lust, spazieren zu gehen?", "Хочеш погуляти?"], ["Was für ein schöner Sonnenuntergang!", "Який гарний захід сонця!"], ["Es fängt an zu regnen.", "Починається дощ."], ["Vergiss nicht, einen Regenschirm mitzunehmen.", "Не забудь узяти парасольку."]] },
    { t: "Довкілля", list: [["Es ist wichtig, Energie zu sparen.", "Важливо економити енергію."], ["Ich versuche, weniger Auto zu fahren.", "Я намагаюся менше їздити автомобілем."]] },
  ],
  dialog: {
    t: "Нова сусідка",
    lines: [
      ["Nachbarin", "Hallo! Sie sind neu hier, oder? Ich bin Frau Becker aus dem zweiten Stock.", "Привіт! Ви тут {новенький|новенька}, так? Я пані Бекер із третього поверху."],
      ["{Taras|Lessja}", "Guten Tag, Frau Becker! Ja, ich wohne seit einem Monat hier. Freut mich!", "Добрий день, пані Бекер! Так, я живу тут уже місяць. Приємно познайомитися!"],
      ["Nachbarin", "Darf ich Ihnen einen Tipp geben? Der Joghurtbecher gehört nicht in die Papiertonne, sondern in die Gelbe Tonne.", "Можна Вам дещо підказати? Стаканчик від йогурту викидають не в бак для паперу, а в жовтий."],
      ["{Taras|Lessja}", "Oh, Entschuldigung! Ich habe versucht, alles richtig zu trennen, aber das ist gar nicht so leicht.", "Ой, перепрошую! Я {намагався|намагалася} все правильно сортувати, але це зовсім не так просто."],
      ["Nachbarin", "Das stimmt. Am Anfang hatte ich auch Probleme. Und die Flaschen? Bringen Sie die zum Glascontainer?", "Це правда. Спочатку я теж плуталася. А пляшки? Ви відносите їх до контейнера для скла?"],
      ["{Taras|Lessja}", "Ja, aber nicht abends. Ich weiß: Abends ist es verboten, Glas einzuwerfen.", "Так, але не ввечері. Я знаю: увечері кидати скло заборонено."],
      ["Nachbarin", "Sehr gut! Und auf Plastikflaschen gibt es Pfand. Die können Sie im Supermarkt zurückgeben.", "Дуже добре! А за пластикові пляшки повертають заставу. Їх можна здати в супермаркеті."],
      ["{Taras|Lessja}", "{Gut zu wissen! Bei uns im Dorf gab es früher fast keinen Müll. Alles war aus Holz und Stoff.|Gut zu wissen! Ich bin in Wolhynien aufgewachsen, zwischen Wäldern und Seen. Die Natur ist mir sehr wichtig.}", "{Добре знати! У нашому селі колись майже не було сміття. Усе було з дерева й тканини.|Добре знати! Я виросла на Волині, серед лісів і озер. Природа для мене дуже важлива.}"],
      ["Nachbarin", "{Ja, früher war vieles einfacher!|Dann gefällt Ihnen bestimmt der Niederrhein. Im Winter kommen hier Tausende Wildgänse an!}", "{Так, колись багато що було простіше!|Тоді Вам точно сподобається Нижній Рейн. Узимку сюди прилітають тисячі диких гусей!}"],
      ["{Taras|Lessja}", "{Das stimmt. Vielen Dank für die Tipps, Frau Becker!|Das möchte ich unbedingt sehen! Vielen Dank für die Tipps, Frau Becker!}", "{Це правда. Щиро дякую за поради, пані Бекер!|Я конче хочу це побачити! Щиро дякую за поради, пані Бекер!}"],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich habe keine Zeit, heute ___ kochen.", a: ["zu"] },
    { t: "gap", q: "Vergiss nicht, mich ___. (anrufen)", a: ["anzurufen"], why: "Відокремлюване дієслово: zu посередині." },
    { t: "gap", q: "Es ist wichtig, Müll ___ trennen.", a: ["zu"] },
    { t: "gap", q: "Ich versuche, mehr Wasser ___ trinken.", a: ["zu"] },
    { t: "gap", q: "Hast du Lust, ins Kino ___ gehen?", a: ["zu"] },
    { t: "gap", q: "Der Joghurtbecher kommt in die ___ Tonne.", a: ["Gelbe", "gelbe"] },
    { t: "gap", q: "Altes Brot gehört in die ___.", a: ["Biotonne"] },
    { t: "mc", q: "Як правильно?", o: ["Ich muss Müll zu trennen.", "Ich muss Müll trennen.", "Ich muss zu Müll trennen."], a: 1, why: "Після модальних дієслів — без zu." },
    { t: "mc", q: "Як правильно?", o: ["Vergiss nicht, das Licht auszumachen.", "Vergiss nicht, das Licht zu ausmachen.", "Vergiss nicht, das Licht ausmachen zu."], a: 0 },
    { t: "mc", q: "Скільки застави за одноразову пляшку?", o: ["8 центів", "25 центів", "1 євро"], a: 1 },
    { t: "mc", q: "Куди викидають газети й картон?", o: ["у синій бак", "у жовтий бак", "у біобак"], a: 0 },
    { t: "mc", q: "«Stoßlüften» — це…", o: ["коротко провітрювати, широко відчинивши вікно", "весь день тримати вікно відчиненим", "не відчиняти вікон узимку"], a: 0 },
    { t: "mc", q: "«Der zweite Stock» у Німеччині — це в Україні…", o: ["другий поверх", "третій поверх", "перший поверх"], a: 1, why: "У Німеччині рахують від Erdgeschoss (першого поверху)." },
  ],
};
