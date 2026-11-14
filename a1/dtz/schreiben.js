// DTZ «Schreiben»: a short formal message (letter or e-mail) in 30 minutes, about a situation and four points
// (Leitpunkte); all four must be answered. Here: how to build it, phrases for each purpose, and practice tasks from
// everyday life with a model answer. The models are a little above the minimum (B1), about 80–110 words.
export const BRIEF = {
  parts: [
    ['Betreff', 'Тема: коротко, про що лист.', 'Betreff: Termin am 12. Mai'],
    ['Anrede', 'Звертання. Знаєш ім’я — на ім’я, ні — загальне. Після звертання кома, лист далі з малої літери.', 'Sehr geehrte Frau Schulz, / Sehr geehrte Damen und Herren,'],
    ['Einleitung', 'Чому пишеш: одне речення.', 'ich schreibe Ihnen, weil …'],
    ['Vier Leitpunkte', 'По одному-два речення на кожен пункт завдання, у тому ж порядку. Пропущений пункт коштує балів.', '…'],
    ['Schluss', 'Прохання відповісти, подяка.', 'Ich freue mich auf Ihre Antwort. / Vielen Dank im Voraus.'],
    ['Gruß', 'Прощання й ім’я.', 'Mit freundlichen Grüßen / {Ihr Taras Schewtschenko|Ihre Lessja Ukrajinka}'],
  ],
  tips: [
    'Прочитай ситуацію й чотири пункти двічі. Підкресли, кому пишеш і чого хочеш.',
    'Офіційний лист — на «Sie»: Sie, Ihnen, Ihr — з великої літери.',
    'Пиши простими реченнями без помилок, а не складними з помилками. Сполучники weil, dass, wenn, deshalb, aber роблять текст рівнем B1.',
    'На іспиті достатньо приблизно 30–40 слів на рівень A2 і 60–80 на B1. Головне — усі чотири пункти.',
    'Залиш 3–4 хвилини, щоб перечитати: дієслово на другому місці, після weil/dass — у кінці.',
  ],
  phrases: [
    { t: 'Почати', list: [['ich schreibe Ihnen, weil …', 'я пишу Вам, бо…'], ['ich habe Ihre Anzeige gelesen und …', 'я прочитав (прочитала) Ваше оголошення і…'], ['vielen Dank für Ihren Brief vom 3. Mai.', 'дякую за Ваш лист від 3 травня.']] },
    { t: 'Попросити', list: [['Könnten Sie mir bitte … schicken?', 'Чи могли б Ви надіслати мені…?'], ['Ich möchte Sie bitten, …', 'Я хотів би (хотіла б) попросити Вас…'], ['Wäre es möglich, dass …?', 'Чи можна було б, щоб…?']] },
    { t: 'Запитати', list: [['Ich möchte gern wissen, ob …', 'Я хотів би (хотіла б) знати, чи…'], ['Können Sie mir bitte sagen, wann …?', 'Чи можете Ви сказати, коли…?'], ['Welche Unterlagen brauche ich?', 'Які документи мені потрібні?']] },
    { t: 'Скасувати чи перенести', list: [['Leider kann ich den Termin am … nicht wahrnehmen, weil …', 'На жаль, я не можу прийти на зустріч… тому що…'], ['Können wir einen neuen Termin vereinbaren?', 'Чи можемо ми домовитися про новий термін?'], ['Am besten passt mir …', 'Найкраще мені підходить…']] },
    { t: 'Поскаржитися', list: [['Leider muss ich mich über … beschweren.', 'На жаль, мушу поскаржитися на…'], ['Seit … funktioniert … nicht.', 'Від… не працює…'], ['Bitte kümmern Sie sich so schnell wie möglich darum.', 'Будь ласка, займіться цим якнайшвидше.']] },
    { t: 'Вибачитися', list: [['Es tut mir leid, dass …', 'Мені шкода, що…'], ['Entschuldigen Sie bitte, dass …', 'Вибачте, будь ласка, що…']] },
    { t: 'Завершити', list: [['Ich freue mich auf Ihre Antwort.', 'Чекаю на Вашу відповідь.'], ['Für Rückfragen bin ich unter … erreichbar.', 'Якщо будуть питання, мене можна застати за…'], ['Mit freundlichen Grüßen', 'З повагою']] },
  ],
};

export const SCHREIBEN = [
  { id: 's1', uk: 'Перенести зустріч у Jobcenter', situation: 'Sie haben morgen um 10 Uhr einen Termin im Jobcenter. Ihr Kind ist krank und Sie können nicht kommen. Schreiben Sie eine E-Mail an Ihre Sachbearbeiterin, Frau Krüger.',
    points: ['Grund für Ihr Schreiben', 'Entschuldigung', 'neuer Termin: Wann können Sie?', 'Unterlagen mitbringen?'],
    model: `Betreff: Termin am Mittwoch, 10 Uhr

Sehr geehrte Frau Krüger,

ich habe morgen um 10 Uhr einen Termin bei Ihnen. Leider kann ich nicht kommen, weil mein Sohn krank ist und ich bei ihm bleiben muss. Es tut mir sehr leid. Können wir bitte einen neuen Termin vereinbaren? Ab Montag habe ich jeden Vormittag Zeit, am besten passt mir 9 Uhr. Muss ich zum neuen Termin noch Unterlagen mitbringen, zum Beispiel die Bescheinigung vom Arzt?

Vielen Dank für Ihr Verständnis.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's2', uk: 'Поскаржитися орендодавцю', situation: 'In Ihrer Wohnung funktioniert die Heizung seit einer Woche nicht. Schreiben Sie an Ihre Vermieterin, Frau Hoffmann.',
    points: ['Was ist das Problem?', 'Seit wann?', 'Was soll die Vermieterin tun?', 'Wann sind Sie zu Hause?'],
    model: `Betreff: Heizung kaputt

Sehr geehrte Frau Hoffmann,

leider muss ich Ihnen mitteilen, dass die Heizung in meiner Wohnung nicht funktioniert. Seit einer Woche sind alle Heizkörper kalt, und in der Wohnung sind nur noch 16 Grad. Das ist besonders für meine Kinder ein Problem. Bitte schicken Sie so schnell wie möglich einen Handwerker. Ich bin von Montag bis Freitag jeden Tag ab 15 Uhr zu Hause. Sie können mich auch unter 0176 1234567 erreichen.

Vielen Dank im Voraus.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's3', uk: 'Записатися на курс', situation: 'Sie haben eine Anzeige für einen Computerkurs an der Volkshochschule gelesen. Schreiben Sie eine E-Mail.',
    points: ['Warum interessieren Sie sich für den Kurs?', 'Was können Sie schon?', 'Uhrzeit und Tage', 'Kosten'],
    model: `Betreff: Computerkurs für Anfänger

Sehr geehrte Damen und Herren,

ich habe Ihre Anzeige für den Computerkurs gelesen und interessiere mich sehr dafür. Ich möchte eine Arbeit im Büro finden, deshalb muss ich besser mit dem Computer arbeiten. Ich kann schon E-Mails schreiben und im Internet suchen, aber Word und Excel kenne ich kaum. Findet der Kurs vormittags oder abends statt? Am besten passen mir Dienstag und Donnerstag. Wie viel kostet der Kurs, und gibt es eine Ermäßigung für Menschen ohne Arbeit?

Ich freue mich auf Ihre Antwort.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's4', uk: 'Повідомити школу, що дитина хвора', situation: 'Ihre Tochter ist krank und kann drei Tage nicht in die Schule gehen. Schreiben Sie an die Klassenlehrerin, Frau Peters.',
    points: ['Grund', 'Wie lange?', 'Hausaufgaben', 'Klassenfahrt nächste Woche: Kann sie mitfahren?'],
    model: `Betreff: Krankmeldung Sofia, Klasse 4a

Sehr geehrte Frau Peters,

meine Tochter Sofia ist krank. Sie hat Fieber und Husten, und der Arzt sagt, sie muss bis Mittwoch zu Hause bleiben. Deshalb kann sie von Montag bis Mittwoch nicht in die Schule kommen. Könnten Sie mir bitte die Hausaufgaben per E-Mail schicken? Dann kann Sofia zu Hause ein bisschen lernen. Nächste Woche ist die Klassenfahrt. Wenn Sofia wieder gesund ist, möchte sie unbedingt mitfahren. Ist das möglich?

Vielen Dank und viele Grüße
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's5', uk: 'Розпитати про квартиру з оголошення', situation: 'Sie suchen eine Wohnung und haben eine Anzeige gelesen: 3 Zimmer, Xanten, 780 Euro. Schreiben Sie an den Vermieter.',
    points: ['Wer sind Sie und Ihre Familie?', 'Fragen zur Wohnung (Nebenkosten, Balkon …)', 'Besichtigung: Wann?', 'Ab wann möchten Sie einziehen?'],
    model: `Betreff: Ihre Anzeige: 3-Zimmer-Wohnung in Xanten

Sehr geehrter Herr Becker,

ich habe Ihre Anzeige gelesen und interessiere mich für die Wohnung. Ich wohne mit {meiner Frau|meinem Mann} und zwei Kindern (5 und 9 Jahre) in Wesel und arbeite als {Lagerarbeiter|Lagerarbeiterin}. Sind die Nebenkosten schon in der Miete? Hat die Wohnung einen Balkon oder einen Keller? Ich würde die Wohnung gern besichtigen. Am besten kann ich am Samstag oder abends nach 17 Uhr. Wir möchten am liebsten ab dem 1. Juni einziehen.

Ich freue mich auf Ihre Antwort.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's6', uk: 'Подякувати й запросити сусідку', situation: 'Ihre Nachbarin hat während Ihres Urlaubs Ihre Blumen gegossen. Schreiben Sie ihr eine Karte.',
    points: ['Dank', 'Wie war der Urlaub?', 'Kleines Geschenk', 'Einladung zum Kaffee: Wann?'],
    model: `Liebe Frau Schneider,

vielen herzlichen Dank, dass Sie während unseres Urlaubs unsere Blumen gegossen haben! Alle Pflanzen sind gesund und grün. Unser Urlaub in Österreich war wunderschön: Wir sind viel gewandert und hatten fast jeden Tag Sonne. Für Sie haben wir eine kleine Schachtel Schokolade aus Salzburg mitgebracht. Wir möchten Sie gern zu Kaffee und Kuchen einladen. Haben Sie am Sonntag um 15 Uhr Zeit? Wir freuen uns auf Sie!

Viele Grüße
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's7', uk: 'Скарга на товар з інтернет-магазину', situation: 'Sie haben im Internet eine Kaffeemaschine bestellt. Sie ist kaputt angekommen. Schreiben Sie an den Kundenservice.',
    points: ['Was haben Sie bestellt und wann?', 'Was ist kaputt?', 'Was möchten Sie: Geld zurück oder neue Maschine?', 'Wie schicken Sie die Maschine zurück?'],
    model: `Betreff: Bestellung Nr. 48213 – Kaffeemaschine defekt

Sehr geehrte Damen und Herren,

am 2. März habe ich bei Ihnen eine Kaffeemaschine bestellt (Bestellnummer 48213). Gestern ist das Paket angekommen, aber leider ist die Maschine kaputt: Die Glaskanne ist zerbrochen und die Maschine geht nicht an. Ich möchte gern eine neue Kaffeemaschine bekommen. Wenn das nicht möglich ist, möchte ich mein Geld zurück. Wie kann ich die Maschine zurückschicken? Bekomme ich von Ihnen ein Rücksendeetikett?

Ich freue mich auf Ihre schnelle Antwort.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
  { id: 's8', uk: 'Попросити відпустку в роботодавця', situation: 'Sie möchten im August zwei Wochen Urlaub nehmen, um Ihre Familie zu besuchen. Schreiben Sie an Ihren Chef, Herrn Wagner.',
    points: ['Zeitraum', 'Grund', 'Wer macht Ihre Arbeit?', 'Bitte um Antwort'],
    model: `Betreff: Urlaubsantrag August

Sehr geehrter Herr Wagner,

ich möchte gern vom 4. bis zum 15. August Urlaub nehmen. Meine Eltern feiern in diesem Sommer ihren 40. Hochzeitstag, und die ganze Familie trifft sich. Ich habe mit meiner Kollegin Frau Lang gesprochen: Sie kann in dieser Zeit meine Aufgaben übernehmen, und ich mache dafür im September ihre Spätschichten. Könnten Sie mir bitte bis Ende Mai sagen, ob das möglich ist? Dann kann ich die Fahrkarten kaufen.

Vielen Dank.

Mit freundlichen Grüßen
{Taras Schewtschenko|Lessja Ukrajinka}` },
];
