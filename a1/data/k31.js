// Розділ 31 (A2). Плани й мрії: Futur I (Ich werde…), aber чи sondern, nicht nur … sondern auch, trotzdem,
// entweder … oder, як розповідати про плани.
// Граматика за рівнем A2 (Goethe-Zertifikat A2), пояснення й приклади наші.
export default {
  n: 31, part: "A2.2", title: "Плани й мрії", book: null,
  goals: [
    "говорити про майбутнє: Ich werde…, Nächstes Jahr…",
    "казати «не це, а те»: nicht …, sondern …",
    "казати «все одно»: Es regnet. Trotzdem …",
    "вибирати з двох: entweder … oder",
  ],
  grammar: [
    {
      id: "futur", t: "Майбутнє: Ich werde … machen", cat: "verb",
      text: [
        "Про майбутнє німці найчастіше кажуть **теперішнім часом** зі словом часу: `Morgen fahre ich nach Köln.`",
        "**Futur I** — `werden` + інфінітив у кінці — вживають для **планів і обіцянок** (особливо без слова часу) та **припущень**: `Ich werde dich anrufen.` — «Я тобі подзвоню». `Er wird krank sein.` — «Він, мабуть, хворий».",
        "Форми `werden` ті самі, що в пасиві (розділ 22): `ich werde, du wirst, er wird, wir werden, ihr werdet, sie werden` — але тут з **інфінітивом**, а не з Partizip II.",
      ],
      tables: [
        { cap: "Три ролі werden", head: ["", "Будова", "Приклад"], rows: [["майбутнє", "werden + інфінітив", "Ich werde mehr Sport machen."], ["пасив", "werden + Partizip II", "Die Suppe wird gekocht."], ["ставати", "werden + прикметник чи іменник", "Es wird kalt. Er wird Arzt."]] },
      ],
      ex: [["Ich werde dich nie vergessen.", "Я тебе ніколи не забуду."], ["Nächstes Jahr werde ich die B1-Prüfung machen.", "Наступного року я складатиму іспит B1."], ["Es wird morgen regnen.", "Завтра буде дощ."], ["Wo ist Max? – Er wird noch bei der Arbeit sein.", "Де Макс? – Мабуть, іще на роботі."]],
      warn: ["`Ich werde gehe` — помилка: після `werden` інфінітив у кінці: `Ich werde gehen.`"],
    },
    {
      id: "sondern", t: "aber чи sondern: «але» і «а»", cat: "satz",
      text: [
        "`aber` — «але»: обидві частини правдиві: `Das Zimmer ist klein, aber schön.`",
        "`sondern` — «а» після **заперечення**, коли друге **замінює** перше: `Ich wohne nicht in Köln, sondern in Xanten.` — «Я живу не в Кельні, а в Ксантені».",
        "`nicht nur …, sondern auch …` — «не лише…, а й…»: `Sie spricht nicht nur Deutsch, sondern auch Französisch.`",
      ],
      ex: [["Das ist nicht mein Bruder, sondern mein Cousin.", "Це не мій брат, а мій двоюрідний брат."], ["Ich trinke keinen Kaffee, sondern Tee.", "Я п’ю не каву, а чай."], ["{Ich bin nicht nur Dichter, sondern auch Maler.|Ich bin nicht nur Dichterin, sondern auch Übersetzerin.}", "{Я не лише поет, а й художник.|Я не лише поетка, а й перекладачка.}"], ["Der Kurs ist schwer, aber interessant.", "Курс складний, але цікавий."]],
      warn: ["`nicht am Montag, aber am Dienstag` — помилка: після заперечення, коли одне замінює інше, — `sondern`: `nicht am Montag, sondern am Dienstag`."],
    },
    {
      id: "trotzdem", t: "trotzdem і deshalb: все одно й тому", cat: "satz",
      text: [
        "`trotzdem` — «попри це, все одно»: друге речення **суперечить** очікуванню: `Es regnet. Trotzdem gehen wir spazieren.`",
        "`deshalb` (розділ 18) — «тому»: друге речення — **наслідок**: `Es regnet. Deshalb bleiben wir zu Hause.`",
        "На першому місці обидва слова тягнуть за собою дієслово: `Trotzdem **gehen** wir…` Їх можна поставити й після дієслова: `Wir gehen trotzdem spazieren.`",
      ],
      ex: [["Ich war müde. Trotzdem habe ich die Hausaufgaben gemacht.", "{Я був утомлений, але все одно зробив домашнє завдання.|Я була втомлена, але все одно зробила домашнє завдання.}"], ["Das Wetter war schlecht, trotzdem war der Ausflug schön.", "Погода була погана, але прогулянка все одно вдалася."], ["Die Wohnung ist teuer. Wir nehmen sie trotzdem.", "Квартира дорога. Ми все одно її беремо."]],
    },
    {
      id: "entwederOder", t: "entweder … oder: або …, або …", cat: "satz",
      text: [
        "`entweder … oder …` — «або…, або…» (одне з двох): `Wir fahren entweder mit dem Zug oder mit dem Bus.`",
        "`sowohl … als auch …` — «як…, так і…» (обидва): `Ich spreche sowohl Ukrainisch als auch Deutsch.`",
        "Коли `entweder` стоїть на початку речення, можна сказати і `Entweder kommst du mit…`, і `Entweder du kommst mit…` — обидва варіанти правильні.",
      ],
      ex: [["Entweder kommst du mit, oder du bleibst zu Hause.", "Або йдеш з нами, або лишаєшся вдома."], ["Ich lerne entweder morgens oder abends.", "Я вчуся або зранку, або ввечері."], ["Sie spricht sowohl Englisch als auch Polnisch.", "Вона говорить як англійською, так і польською."]],
    },
    {
      id: "plaene", t: "Плани й мрії: Ich habe vor…, Mein Traum ist es…", cat: "rede",
      text: [
        "`vorhaben` — планувати: `Was hast du am Wochenende vor?` `Ich habe vor, einen Kurs zu machen.`",
        "Ще: `Ich plane…`, `Ich möchte unbedingt…`, `Mein Traum ist es, … zu …`, `Ich würde gern…` (розділ 28), `Ich hoffe, dass…` (розділ 19).",
        "Час: `nächste Woche`, `nächsten Monat`, `nächstes Jahr`, `in zwei Jahren` (через два роки), `bald` (скоро), `irgendwann` (колись).",
      ],
      ex: [["Was hast du nach dem Kurs vor?", "Що ти плануєш після курсу?"], ["Mein Traum ist es, ein eigenes Café zu eröffnen.", "Моя мрія — відкрити власну кав’ярню."], ["In zwei Jahren möchte ich eine Ausbildung machen.", "Через два роки я хочу здобути професію."], ["Irgendwann werde ich die ganze Welt sehen.", "Колись я побачу весь світ."]],
    },
  ],
  phrases: [
    { t: "Плани", list: [["Was hast du am Wochenende vor?", "Що плануєш на вихідні?"], ["Ich habe noch nichts vor.", "У мене ще немає планів."], ["Ich werde es versuchen.", "Я спробую."], ["Mal sehen!", "Подивимося!"]] },
    { t: "Мрії", list: [["Mein Traum ist es, einmal ans Meer zu ziehen.", "Моя мрія — колись переїхати до моря."], ["Ich würde so gern einmal nach Kyjiw fahren.", "{Я так хотів би|Я так хотіла б} колись поїхати до Києва."], ["Irgendwann schaffe ich das!", "Колись я це зможу!"]] },
    { t: "Вибір", list: [["Entweder heute oder morgen.", "Або сьогодні, або завтра."], ["Nicht heute, sondern morgen.", "Не сьогодні, а завтра."], ["Das ist schwer, aber ich mache es trotzdem.", "Це важко, але я все одно це зроблю."]] },
  ],
  dialog: {
    t: "Плани на майбутнє",
    lines: [
      ["Anna", "Der Kurs ist bald zu Ende. Was wirst du danach machen?", "Курс скоро закінчиться. Що ти робитимеш потім?"],
      ["{Taras|Lessja}", "Ich werde weiter Deutsch lernen. Im April beginnt der B1-Kurs.", "Я й далі вчитиму німецьку. У квітні починається курс B1."],
      ["Anna", "Super! Und hast du auch andere Pläne?", "Чудово! А інші плани в тебе є?"],
      ["{Taras|Lessja}", "{Ja, ich möchte nicht nur malen, sondern auch unterrichten. Vielleicht gebe ich einen Zeichenkurs an der Volkshochschule.|Ja, ich möchte nicht nur schreiben, sondern auch übersetzen. Vielleicht übersetze ich ukrainische Gedichte ins Deutsche.}", "{Так, я хочу не лише малювати, а й викладати. Може, проведу курс малювання в народному університеті.|Так, я хочу не лише писати, а й перекладати. Може, перекладу українські вірші німецькою.}"],
      ["Anna", "Das ist eine tolle Idee! Aber ist das nicht viel Arbeit?", "Чудова ідея! Але чи це не забагато роботи?"],
      ["{Taras|Lessja}", "Doch, sehr viel. Trotzdem will ich es versuchen.", "Так, дуже багато. Але я все одно хочу спробувати."],
      ["Anna", "Und im Sommer? Fährst du in die Ukraine?", "А влітку? Поїдеш в Україну?"],
      ["{Taras|Lessja}", "Entweder fahre ich im Juli nach Kyjiw, oder meine Familie kommt hierher. Wir werden sehen.", "Або я поїду в липні до Києва, або моя родина приїде сюди. Побачимо."],
      ["Anna", "Und dein großer Traum?", "А твоя велика мрія?"],
      ["{Taras|Lessja}", "{Mein Traum ist es, in Xanten eine Ausstellung zu machen, mit Bildern aus der Ukraine und vom Niederrhein.|Mein Traum ist es, in Xanten eine Lesung zu machen, auf Ukrainisch und auf Deutsch.}", "{Моя мрія — зробити в Ксантені виставку з картинами про Україну й Нижній Рейн.|Моя мрія — провести в Ксантені літературні читання українською й німецькою.}"],
      ["Anna", "Das wirst du schaffen! Und ich werde in der ersten Reihe sitzen.", "У тебе все вийде! А я сидітиму в першому ряду."],
    ],
  },
  tasks: [
    { t: "gap", q: "Ich ___ dich morgen anrufen. (werden)", a: ["werde"] },
    { t: "gap", q: "___ du nächstes Jahr nach Berlin ziehen? (werden)", a: ["Wirst", "wirst"] },
    { t: "gap", q: "Ich wohne nicht in Köln, ___ in Xanten.", a: ["sondern"] },
    { t: "gap", q: "Das Zimmer ist klein, ___ schön.", a: ["aber"] },
    { t: "gap", q: "Es regnet. ___ gehen wir spazieren.", a: ["Trotzdem", "trotzdem"] },
    { t: "gap", q: "Wir fahren ___ mit dem Zug oder mit dem Bus.", a: ["entweder"] },
    { t: "gap", q: "Sie spricht nicht nur Deutsch, ___ auch Englisch.", a: ["sondern"] },
    { t: "gap", q: "Was hast du am Wochenende ___?", a: ["vor"] },
    { t: "mc", q: "Як правильно?", o: ["Ich werde gehe.", "Ich werde gehen.", "Ich werde gegangen."], a: 1 },
    { t: "mc", q: "«Er wird Arzt» означає…", o: ["Він стане лікарем.", "Він піде до лікаря.", "Його лікують."], a: 0 },
    { t: "mc", q: "Яке слово? Es regnet, ___ bleiben wir zu Hause.", o: ["deshalb", "trotzdem", "sondern"], a: 0 },
    { t: "mc", q: "Яке слово? Ich bin müde, ___ gehe ich joggen.", o: ["deshalb", "trotzdem", "sondern"], a: 1 },
    { t: "mc", q: "«nächstes Jahr» означає…", o: ["наступного року", "минулого року", "щороку"], a: 0 },
  ],
};
