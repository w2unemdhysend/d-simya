// Розділ 17 (A2). Дитинство і спогади: Präteritum дієслів sein, haben і модальних, Perfekt чи Präteritum, früher і damals.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 17, part: "A2.1", title: "Дитинство і спогади", book: null,
  goals: [
    "розповісти про своє дитинство: де минуло, що ти {любив|любила}, ким {хотів|хотіла} стати",
    "казати про минуле через war, hatte, konnte, musste, wollte, durfte",
    "розуміти, коли німці кажуть Perfekt, а коли Präteritum",
    "говорити про час у минулому: früher, damals, als Kind, vor zehn Jahren",
  ],
  grammar: [
    {
      id: "praetSeinHaben", t: "Präteritum: war і hatte у всіх особах", cat: "verb",
      text: [
        "У розмові про минуле німці зазвичай кажуть **Perfekt** (`ich habe gemacht`, розділи 9–10). Але є кілька дієслів, які майже завжди стоять у **Präteritum** — простому минулому часі. Найважливіші з них — `sein` і `haben`: не «ich bin gewesen», а `ich war`; не «ich habe gehabt», а `ich hatte`.",
        "Форми `ich` і `er/sie/es` у Präteritum **однакові й без закінчення**: `ich war`, `er war`. Решта закінчень — як у теперішньому часі: `du -st`, `wir -en`, `ihr -t`, `sie -en`.",
      ],
      tables: [
        { head: ["", "sein", "haben"], rows: [["ich", "war", "hatte"], ["du", "warst", "hattest"], ["er / sie / es", "war", "hatte"], ["wir", "waren", "hatten"], ["ihr", "wart", "hattet"], ["sie / Sie", "waren", "hatten"]] },
      ],
      ex: [["Gestern war ich sehr müde.", "Учора я {був|була} дуже {втомлений|втомлена}."], ["Wo warst du am Wochenende?", "Де ти був на вихідних?"], ["Wir hatten keine Zeit.", "У нас не було часу."], ["Hattet ihr Spaß auf der Party?", "Вам було весело на вечірці?"], ["Früher hatte ich einen Hund.", "Колись у мене був собака."]],
      tips: ["Запам’ятай пару: `Ich war krank und hatte Fieber.` — «Я {був хворий|була хвора}, і в мене була температура». Так говорять завжди, і в розмові, і в листі."],
      warn: ["Не плутай `ich war` (я {був|була}) з `ich warte` (я чекаю) і `wahr` (правдивий).", "`Ich habe Zeit gehabt` — граматично можливо, але так майже не кажуть. Природно: `Ich hatte Zeit.`"],
    },
    {
      id: "praetModal", t: "Präteritum модальних дієслів: konnte, musste, wollte", cat: "verb",
      text: [
        "Модальні дієслова (`können, müssen, wollen, dürfen, sollen, mögen`) про минуле теж кажуть у **Präteritum**. Утворюються вони просто: основа **без умлаута** + `-te`: `können → konnte`, `müssen → musste`, `dürfen → durfte`.",
        "Як і в теперішньому часі, модальне дієслово стоїть на **другому місці**, а головне дієслово — **в кінці** в інфінітиві: `Ich musste gestern lange arbeiten.`",
      ],
      tables: [
        { head: ["Інфінітив", "ich / er", "du", "wir / sie", "ihr"], rows: [["können", "konnte", "konntest", "konnten", "konntet"], ["müssen", "musste", "musstest", "mussten", "musstet"], ["wollen", "wollte", "wolltest", "wollten", "wolltet"], ["dürfen", "durfte", "durftest", "durften", "durftet"], ["sollen", "sollte", "solltest", "sollten", "solltet"], ["mögen", "mochte", "mochtest", "mochten", "mochtet"]] },
        { cap: "Рамка", head: ["1", "2", "середина", "кінець"], rows: [["Ich", "konnte", "gestern nicht", "kommen."], ["Als Kind", "wollte", "ich", "{Maler|Pianistin} werden."], ["Wir", "mussten", "lange", "warten."]] },
      ],
      ex: [["Als Kind wollte ich {Maler|Pianistin} werden.", "У дитинстві я {хотів стати художником|хотіла стати піаністкою}."], ["Ich konnte gestern nicht kommen, ich musste arbeiten.", "Я не {міг|могла} вчора прийти, мені треба було працювати."], ["Durftest du als Kind lange fernsehen?", "Тобі в дитинстві дозволяли довго дивитися телевізор?"], ["Wir sollten um acht Uhr da sein.", "Ми мали бути там о восьмій."], ["Früher mochte ich keinen Fisch.", "Колись я не {любив|любила} рибу."]],
      tips: ["`ich wollte` часто означає «я {хотів|хотіла}, але не вийшло»: `Ich wollte dich anrufen, aber mein Handy war leer.`"],
      warn: ["`ich konnte` (я {міг|могла}) і `ich könnte` (я {міг|могла} б) — різні речі! Умлаут дає «би» (розділ 28). У Präteritum умлаута немає ніколи: `musste`, не «müsste».", "`mögen → mochte`, не «mögte»."],
    },
    {
      id: "perfPraet", t: "Perfekt чи Präteritum?", cat: "verb",
      text: [
        "Обидва часи кажуть про минуле і перекладаються однаково. Різниця — **де** їх уживають:",
        "1) **Розмова, повідомлення, лист другові** → для більшості дієслів Perfekt: `Ich habe einen Film gesehen.` Але `sein`, `haben`, модальні та `es gibt` → Präteritum: `war, hatte, konnte, es gab`.",
        "2) **Книжка, новини, біографія, казка** → майже все в Präteritum: `Er ging nach Hause. Sie schrieb einen Brief.` Ці форми на A2 досить **розуміти**, а самому вживати можна Perfekt.",
      ],
      tables: [
        { cap: "Однакове речення в розмові й у книжці", head: ["Розмова (Perfekt)", "Книжка (Präteritum)"], rows: [["ich bin gegangen", "ich ging"], ["ich bin gekommen", "ich kam"], ["ich habe gesehen", "ich sah"], ["ich habe geschrieben", "ich schrieb"], ["ich habe gesagt", "ich sagte"], ["es hat … gegeben", "es gab"]] },
      ],
      ex: [["Gestern war ich im Kino und habe einen tollen Film gesehen.", "Учора я {був|була} в кіно й {подивився|подивилася} чудовий фільм."], ["Früher gab es hier keinen Supermarkt.", "Колись тут не було супермаркету."], ["{1840|1893} ist mein erstes Buch erschienen.", "{1840|1893} року вийшла моя перша книжка."], ["Es war einmal ein König…", "Жив-був колись король…"]],
      tips: ["`es gibt` (є, існує) у минулому — `es gab`: `Damals gab es noch keine Handys.` — «Тоді ще не було мобільних»."],
    },
    {
      id: "frueher", t: "früher, damals, als Kind: коли це було", cat: "zeit",
      text: [
        "`früher` — «раніше, колись» (на противагу «тепер»): `Früher habe ich in der Ukraine gewohnt, heute wohne ich in Xanten.`",
        "`damals` — «тоді», про конкретний час, про який уже йшлося: `2015 war ich in Berlin. Damals konnte ich noch kein Deutsch.`",
        "`als Kind` — «у дитинстві» (дослівно «як дитина»), `mit zehn Jahren` — «у десять років», `vor zehn Jahren` — «десять років тому» (`vor` + Dativ, розділ 14).",
      ],
      tables: [
        { head: ["Німецькою", "Українською"], rows: [["früher", "раніше, колись"], ["damals", "тоді"], ["als Kind", "у дитинстві"], ["mit zehn Jahren", "у десять років"], ["vor zehn Jahren", "десять років тому"], ["in meiner Kindheit", "у моєму дитинстві"], ["heute / jetzt", "сьогодні / тепер"]] },
      ],
      ex: [["{Mit vierundzwanzig Jahren war ich endlich frei.|Mit neun Jahren habe ich mein erstes Gedicht geschrieben.}", "{У двадцять чотири роки я нарешті став вільним.|У дев’ять років я написала свій перший вірш.}"], ["Früher war ich oft auf dem Dorf, heute lebe ich in der Stadt.", "Колись я часто {бував|бувала} в селі, тепер живу в місті."], ["Vor zwei Jahren konnte ich noch kein Deutsch.", "Два роки тому я ще не {знав|знала} німецької."], ["Damals gab es noch keine Kameras.", "Тоді ще не було фотоапаратів."]],
      warn: ["`dann` (потім, далі) ≠ `damals` (тоді, у той час) ≠ `denn` (бо).", "«10 років тому» — `vor zehn Jahren`, не «zehn Jahre zurück» (калька з англійської)."],
    },
    {
      id: "erinnern", t: "Як розповідати спогади", cat: "rede",
      text: [
        "Спогад звучить живо, коли є **час**, **місце** й **почуття**. Зручні початки: `Als Kind…`, `Ich erinnere mich gut an…` (я добре пам’ятаю…), `Weißt du noch…?` (пам’ятаєш…?).",
        "Почуття про минуле: `Das war schön / lustig / schwer.` — «Це було гарно / смішно / важко». `Ich war glücklich.` — «Я {був щасливий|була щаслива}».",
        "Послідовність: `zuerst` (спочатку), `dann` (потім), `später` (пізніше), `irgendwann` (якось, колись), `schließlich` (зрештою). Після них — дієслово на другому місці: `Später bin ich nach Kyjiw gezogen.`",
      ],
      ex: [["Ich erinnere mich gut an meinen ersten Schultag.", "Я добре пам’ятаю свій перший день у школі."], ["Weißt du noch, unser erster Kurstag?", "Пам’ятаєш наш перший день курсу?"], ["Das war eine schwere, aber schöne Zeit.", "Це був важкий, але гарний час."], ["Später bin ich nach Kyjiw gezogen.", "Пізніше я {переїхав|переїхала} до Києва."]],
    },
  ],
  phrases: [
    { t: "Про дитинство", list: [["Wo bist du aufgewachsen?", "Де минуло твоє дитинство?"], ["Ich bin {auf dem Land|in Wolhynien} aufgewachsen.", "Я {виріс у селі|виросла на Волині}."], ["Was hast du als Kind gern gemacht?", "Що тобі подобалося робити в дитинстві?"], ["Als Kind habe ich gern {gezeichnet|Klavier gespielt}.", "У дитинстві я {любив малювати|любила грати на фортепіано}."], ["Was wolltest du als Kind werden?", "Ким ти хотів стати в дитинстві?"], ["Das war eine schöne Zeit.", "Це був гарний час."]] },
    { t: "Не {міг|могла}, {мусив|мусила}, не можна було", list: [["Ich konnte leider nicht kommen.", "На жаль, я не {міг|могла} прийти."], ["Ich musste lange warten.", "Мені довелося довго чекати."], ["Wir durften nicht draußen spielen.", "Нам не можна було гратися надворі."], ["Ich wollte dich anrufen, aber ich hatte keine Zeit.", "Я {хотів|хотіла} тобі подзвонити, але не {мав|мала} часу."], ["Du solltest doch um acht da sein!", "Ти ж {мав|мала} бути тут о восьмій!"]] },
    { t: "Спогади", list: [["Ich erinnere mich gut daran.", "Я добре це пам’ятаю."], ["Weißt du noch…?", "Пам’ятаєш…?"], ["Damals war alles anders.", "Тоді все було інакше."], ["Das ist lange her.", "Це було давно."]] },
  ],
  dialog: {
    t: "Старі фото",
    lines: [
      ["Anna", "Schau mal, das bin ich als Kind! Da war ich sechs.", "Глянь, це я в дитинстві! Мені тоді було шість."],
      ["{Taras|Lessja}", "Wie süß! Wo war das?", "Яка мила! Де це було?"],
      ["Anna", "Bei meiner Oma in Bayern. Wir waren jeden Sommer dort.", "У моєї бабусі в Баварії. Ми бували там щоліта."],
      ["{Taras|Lessja}", "{Ich habe keine Fotos aus meiner Kindheit. Damals gab es noch keine Kameras!|Ich habe nur ein paar alte Fotos, alle in Schwarzweiß.}", "{У мене немає фото з дитинства. Тоді ще не було фотоапаратів!|У мене лише кілька старих фото, усі чорно-білі.}"],
      ["Anna", "Und was wolltest du als Kind werden?", "А ким ти {хотів|хотіла} стати в дитинстві?"],
      ["{Taras|Lessja}", "{Maler! Ich habe immer gezeichnet, sogar mit Kohle an der Wand.|Pianistin. Ich habe jeden Tag Klavier gespielt.}", "{Художником! Я весь час малював, навіть вугіллям на стіні.|Піаністкою. Я щодня грала на фортепіано.}"],
      ["Anna", "Und durftest du das? Meine Eltern waren da sehr streng.", "І тобі дозволяли? Мої батьки були в цьому дуже суворі."],
      ["{Taras|Lessja}", "{Ich musste viel arbeiten und hatte wenig Zeit. Aber ich wollte unbedingt lernen.|Ja, meine Mutter war Schriftstellerin. Bei uns konnte man immer lesen und spielen.}", "{Мені доводилося багато працювати, і часу було мало. Але я дуже хотів учитися.|Так, моя мама була письменницею. У нас удома завжди можна було читати й грати.}"],
      ["Anna", "Und heute? Was machst du am liebsten?", "А тепер? Що ти найбільше любиш робити?"],
      ["{Taras|Lessja}", "{Ich male und schreibe Gedichte. Und jetzt lerne ich Deutsch!|Ich schreibe und übersetze. Und jetzt lerne ich Deutsch!}", "{Я малюю й пишу вірші. А тепер ще й учу німецьку!|Я пишу й перекладаю. А тепер ще й учу німецьку!}"],
    ],
  },
  tasks: [
    { t: "gap", q: "Gestern ___ ich krank. (sein)", a: ["war"] },
    { t: "gap", q: "Wir ___ keine Zeit. (haben)", a: ["hatten"] },
    { t: "gap", q: "___ du gestern im Kurs? (sein)", a: ["warst"], why: "du → war + st." },
    { t: "gap", q: "Ihr ___ Glück! (haben)", a: ["hattet"] },
    { t: "gap", q: "Ich ___ gestern nicht kommen. (können)", a: ["konnte"], why: "Präteritum без умлаута: konnte." },
    { t: "gap", q: "Er ___ lange arbeiten. (müssen)", a: ["musste"] },
    { t: "gap", q: "Als Kind ___ ich Ärztin werden. (wollen)", a: ["wollte"] },
    { t: "gap", q: "Mit zehn Jahren ___ ich nicht allein in die Stadt fahren. (dürfen)", a: ["durfte"] },
    { t: "gap", q: "Früher ___ es hier keinen Supermarkt. (es gibt)", a: ["gab"], why: "es gibt → es gab." },
    { t: "mc", q: "Як правильно сказати «Я не {міг|могла} вчора прийти»?", o: ["Ich konnte gestern nicht kommen.", "Ich könnte gestern nicht kommen.", "Ich kann gestern nicht kommen."], a: 0, why: "könnte — це «міг би»." },
    { t: "mc", q: "Що в розмові звучить природніше?", o: ["Gestern ging ich ins Kino.", "Gestern bin ich ins Kino gegangen."], a: 1, why: "У розмові більшість дієслів — у Perfekt." },
    { t: "mc", q: "mögen у Präteritum:", o: ["mochte", "mögte", "möchte"], a: 0 },
    { t: "mc", q: "«Двадцять років тому» німецькою:", o: ["vor zwanzig Jahren", "zwanzig Jahre zurück", "seit zwanzig Jahren"], a: 0 },
    { t: "mc", q: "«Тоді» про конкретний час у минулому:", o: ["damals", "dann", "denn"], a: 0 },
  ],
};
