// The A1 dictionary, chapter by chapter in the order of the course (the grammar follows Die neue Linie 1; the words,
// translations and examples are our own). One line per entry:
//   n  der Name | die Namen | ім'я                     a noun with its article and plural ("—" when there is none)
//   v  fahren | er fährt · ist gefahren | їхати         a verb with the he-form and the Perfekt
//   a  schnell | | швидкий                              an adjective or adverb
//   w  woher | | звідки                                 a little word: pronoun, question word, preposition, number
//   p  Wie geht's? | | Як справи?                       a phrase to learn whole
//   name  die Ukraine | | Україна                       a country, language or holiday (not for the word garden)
// A word is listed once, in the chapter where it first comes up.

const RAW = {
1: `
p Hallo! | | Привіт!
p Guten Morgen! | | Доброго ранку!
p Guten Tag! | | Добрий день!
p Guten Abend! | | Добрий вечір!
p Gute Nacht! | | На добраніч!
p Tschüss! | | Бувай!
p Auf Wiedersehen! | | До побачення!
p Bis morgen! | | До завтра!
p Wie geht's? | | Як справи?
p Wie geht es Ihnen? | | Як Ваші справи?
p Danke, gut. | | Дякую, добре.
p Es geht. | | Так собі.
p Freut mich. | | Приємно познайомитися.
p Danke! | | Дякую!
p Bitte! | | Будь ласка!
p Entschuldigung! | | Перепрошую!
p Wie bitte? | | Перепрошую, що Ви сказали?
p Herzlich willkommen! | | Ласкаво просимо!
n der Name | die Namen | ім'я, назва
n der Vorname | die Vornamen | ім'я (не прізвище)
n der Nachname | die Nachnamen | прізвище
n der Familienname | die Familiennamen | прізвище (в анкетах)
n das Land | die Länder | країна
n die Stadt | die Städte | місто
n das Dorf | die Dörfer | село
n die Frau | die Frauen | жінка; пані (Frau Müller)
n der Herr | die Herren | пан (Herr Müller)
n der Mann | die Männer | чоловік
n die Person | die Personen | особа, людина
n der Mensch | die Menschen | людина
n die Adresse | die Adressen | адреса
n die Straße | die Straßen | вулиця
n die Hausnummer | die Hausnummern | номер будинку
n die Postleitzahl | die Postleitzahlen | поштовий індекс
n der Buchstabe | die Buchstaben | літера
n das Alphabet | die Alphabete | абетка
n der Kurs | die Kurse | курс (мовний)
n der Freund | die Freunde | друг
n die Freundin | die Freundinnen | подруга
v sein | er ist · ist gewesen | бути
v heißen | er heißt · hat geheißen | звати(ся)
v kommen | er kommt · ist gekommen | приходити; бути родом (aus)
v wohnen | er wohnt · hat gewohnt | жити, мешкати
v buchstabieren | er buchstabiert · hat buchstabiert | називати по літерах
v fragen | er fragt · hat gefragt | питати
v antworten | er antwortet · hat geantwortet | відповідати
v begrüßen | er begrüßt · hat begrüßt | вітати
v vorstellen | er stellt vor · hat vorgestellt | представляти (когось)
w ich | | я
w du | | ти
w er | | він
w sie | | вона; вони
w es | | воно
w wir | | ми
w ihr | | ви (кілька людей, на «ти»)
w Sie | | Ви (ввічливо)
w wer | | хто
w wie | | як
w woher | | звідки
w wo | | де
w aus | | з (країни, міста)
w in | | в, у
w und | | і, та
w ja | | так
w nein | | ні
w nicht | | не
w auch | | теж, також
a gut | | добрий; добре
a sehr | | дуже
name Deutschland | | Німеччина
name die Ukraine | | Україна
name Österreich | | Австрія
name die Schweiz | | Швейцарія
name Polen | | Польща
name Tschechien | | Чехія
name die Türkei | | Туреччина
name Italien | | Італія
name Spanien | | Іспанія
name Frankreich | | Франція
name die USA (Pl.) | | США
name Europa | | Європа
`,
2: `
v sprechen | er spricht · hat gesprochen | говорити (мовою)
v lernen | er lernt · hat gelernt | вчити, вчитися
v haben | er hat · hat gehabt | мати
v machen | er macht · hat gemacht | робити
v studieren | er studiert · hat studiert | навчатися в університеті
v verstehen | er versteht · hat verstanden | розуміти
v schreiben | er schreibt · hat geschrieben | писати
v sagen | er sagt · hat gesagt | казати
v telefonieren | er telefoniert · hat telefoniert | говорити по телефону
v zählen | er zählt · hat gezählt | рахувати
n die Sprache | die Sprachen | мова
n die Telefonnummer | die Telefonnummern | номер телефону
n das Handy | die Handys | мобільний телефон
n die Handynummer | die Handynummern | номер мобільного
n die E-Mail | die E-Mails | електронний лист
n die E-Mail-Adresse | die E-Mail-Adressen | адреса електронної пошти
n der Beruf | die Berufe | професія
n der Lehrer | die Lehrer | учитель
n die Lehrerin | die Lehrerinnen | учителька
n der Student | die Studenten | студент
n die Studentin | die Studentinnen | студентка
n der Arzt | die Ärzte | лікар
n die Ärztin | die Ärztinnen | лікарка
n der Verkäufer | die Verkäufer | продавець
n die Verkäuferin | die Verkäuferinnen | продавчиня
n der Ingenieur | die Ingenieure | інженер
n die Ingenieurin | die Ingenieurinnen | інженерка
n der Programmierer | die Programmierer | програміст
n die Programmiererin | die Programmiererinnen | програмістка
n der Koch | die Köche | кухар
n die Köchin | die Köchinnen | кухарка
n der Kellner | die Kellner | офіціант
n die Kellnerin | die Kellnerinnen | офіціантка
n der Fahrer | die Fahrer | водій
n der Friseur | die Friseure | перукар
n die Friseurin | die Friseurinnen | перукарка
n die Pflegekraft | die Pflegekräfte | доглядальник, медпрацівник
n die Zahl | die Zahlen | число
n die Nummer | die Nummern | номер
n das Alter | — | вік
name Deutsch | | німецька мова
name Ukrainisch | | українська мова
name Englisch | | англійська мова
name Polnisch | | польська мова
name Französisch | | французька мова
name Spanisch | | іспанська мова
name Türkisch | | турецька мова
name Arabisch | | арабська мова
w was | | що
w oder | | або
w aber | | але
a ein bisschen | | трохи
a gern | | охоче, із задоволенням
a noch | | ще
a nur | | тільки
a richtig | | правильний; правильно
a falsch | | неправильний; неправильно
w null | | нуль
w eins | | один
w zwei | | два
w drei | | три
w vier | | чотири
w fünf | | п'ять
w sechs | | шість
w sieben | | сім
w acht | | вісім
w neun | | дев'ять
w zehn | | десять
w elf | | одинадцять
w zwölf | | дванадцять
w dreizehn | | тринадцять
w sechzehn | | шістнадцять
w siebzehn | | сімнадцять
w zwanzig | | двадцять
w einundzwanzig | | двадцять один
w dreißig | | тридцять
w vierzig | | сорок
w fünfzig | | п'ятдесят
w sechzig | | шістдесят
w siebzig | | сімдесят
w achtzig | | вісімдесят
w neunzig | | дев'яносто
w hundert | | сто
p Wie ist Ihre Telefonnummer? | | Який Ваш номер телефону?
p Was sind Sie von Beruf? | | Ким Ви працюєте?
p Ich bin Student. | | Я студент.
p Welche Sprachen sprechen Sie? | | Якими мовами Ви говорите?
`,
3: `
n der Tisch | die Tische | стіл
n der Stuhl | die Stühle | стілець
n die Tafel | die Tafeln | дошка (у класі)
n das Buch | die Bücher | книжка
n das Heft | die Hefte | зошит
n der Kugelschreiber | die Kugelschreiber | кулькова ручка
n der Kuli | die Kulis | ручка (розмовне)
n der Bleistift | die Bleistifte | олівець
n der Radiergummi | die Radiergummis | гумка (для стирання)
n das Papier | die Papiere | папір; (мн.) документи
n die Brille | die Brillen | окуляри
n die Tasche | die Taschen | сумка
n der Rucksack | die Rucksäcke | рюкзак
n der Schlüssel | die Schlüssel | ключ
n die Uhr | die Uhren | годинник
n die Lampe | die Lampen | лампа
n das Fenster | die Fenster | вікно
n die Tür | die Türen | двері
n der Computer | die Computer | комп'ютер
n der Laptop | die Laptops | ноутбук
n das Wörterbuch | die Wörterbücher | словник
n die Seite | die Seiten | сторінка
n das Wort | die Wörter | слово
n der Satz | die Sätze | речення
n die Frage | die Fragen | питання
n die Antwort | die Antworten | відповідь
n das Bild | die Bilder | картина, зображення
n der Bahnhof | die Bahnhöfe | вокзал
n die Post | — | пошта
n die Bank | die Banken | банк
n die Apotheke | die Apotheken | аптека
n das Krankenhaus | die Krankenhäuser | лікарня
n die Schule | die Schulen | школа
n das Rathaus | die Rathäuser | ратуша, міська рада
n die Kirche | die Kirchen | церква
n der Supermarkt | die Supermärkte | супермаркет
n das Kino | die Kinos | кінотеатр
n das Café | die Cafés | кав'ярня
n das Restaurant | die Restaurants | ресторан
n das Hotel | die Hotels | готель
n der Park | die Parks | парк
n der Markt | die Märkte | ринок
n die Bäckerei | die Bäckereien | пекарня
n das Museum | die Museen | музей
n die Bibliothek | die Bibliotheken | бібліотека
n der Spielplatz | die Spielplätze | дитячий майданчик
n der Parkplatz | die Parkplätze | парковка
n das Gebäude | die Gebäude | будівля
v zeigen | er zeigt · hat gezeigt | показувати
v suchen | er sucht · hat gesucht | шукати
v finden | er findet · hat gefunden | знаходити; вважати
v brauchen | er braucht · hat gebraucht | потребувати
v kosten | es kostet · hat gekostet | коштувати
v wiederholen | er wiederholt · hat wiederholt | повторювати
v erklären | er erklärt · hat erklärt | пояснювати
v öffnen | er öffnet · hat geöffnet | відчиняти
v schließen | er schließt · hat geschlossen | зачиняти
w kein | | жоден, ні (заперечний артикль)
w mein | | мій
w dein | | твій
w hier | | тут
w dort | | там
a groß | | великий
a klein | | малий
a neu | | новий
a alt | | старий
a schön | | гарний
a teuer | | дорогий
a billig | | дешевий
a kaputt | | зламаний
p Wie heißt das auf Deutsch? | | Як це німецькою?
p Was ist das? | | Що це?
p Das ist ein Kuli. | | Це ручка.
p Wie schreibt man das? | | Як це пишеться?
p Ich weiß es nicht. | | Я не знаю.
`,
4: `
n der Kaffee | die Kaffees | кава
n der Tee | die Tees | чай
n das Wasser | — | вода
n das Mineralwasser | — | мінеральна вода
n der Saft | die Säfte | сік
n der Apfelsaft | die Apfelsäfte | яблучний сік
n die Milch | — | молоко
n das Bier | die Biere | пиво
n der Wein | die Weine | вино
n die Cola | die Colas | кола
n der Kakao | die Kakaos | какао
n der Kuchen | die Kuchen | пиріг, тістечко
n die Torte | die Torten | торт
n das Brötchen | die Brötchen | булочка
n das Brot | die Brote | хліб
n die Suppe | die Suppen | суп
n der Salat | die Salate | салат
n das Ei | die Eier | яйце
n die Wurst | die Würste | ковбаса
n der Käse | die Käse | сир (твердий)
n die Butter | — | вершкове масло
n der Zucker | — | цукор
n das Eis | — | морозиво; лід
n die Pizza | die Pizzen | піца
n die Pommes (Pl.) | — | картопля фрі
n das Schnitzel | die Schnitzel | шніцель
n die Speisekarte | die Speisekarten | меню
n die Rechnung | die Rechnungen | рахунок
n der Euro | die Euro | євро
n der Cent | die Cent | цент
n das Glas | die Gläser | склянка, келих
n die Tasse | die Tassen | чашка
n die Flasche | die Flaschen | пляшка
n das Stück | die Stücke | шматок
n die Portion | die Portionen | порція
n das Frühstück | die Frühstücke | сніданок
n das Mittagessen | die Mittagessen | обід
n das Abendessen | die Abendessen | вечеря
n das Getränk | die Getränke | напій
n das Essen | die Essen | їжа
n der Gast | die Gäste | гість
n das Fest | die Feste | свято
n die Party | die Partys | вечірка
v möchten | er möchte · (Perfekt: hat gewollt) | хотіти б, бажати
v trinken | er trinkt · hat getrunken | пити
v essen | er isst · hat gegessen | їсти
v bestellen | er bestellt · hat bestellt | замовляти
v bezahlen | er bezahlt · hat bezahlt | платити, оплачувати
v arbeiten | er arbeitet · hat gearbeitet | працювати
v kochen | er kocht · hat gekocht | готувати їжу; варити
v backen | er backt · hat gebacken | пекти
v planen | er plant · hat geplant | планувати
a lecker | | смачний
a warm | | теплий
a kalt | | холодний
a heiß | | гарячий
a süß | | солодкий
a viel | | багато
a wenig | | мало
w wie viel | | скільки
p Ich möchte einen Kaffee, bitte. | | Каву, будь ласка.
p Was kostet das? | | Скільки це коштує?
p Das macht vier Euro fünfzig. | | З Вас чотири євро п'ятдесят.
p Zahlen, bitte! | | Рахунок, будь ласка!
p Zusammen oder getrennt? | | Разом чи окремо?
p Stimmt so. | | Решти не треба.
p Guten Appetit! | | Смачного!
p Prost! | | Будьмо!
`,
5: `
n der Montag | die Montage | понеділок
n der Dienstag | die Dienstage | вівторок
n der Mittwoch | die Mittwoche | середа
n der Donnerstag | die Donnerstage | четвер
n der Freitag | die Freitage | п'ятниця
n der Samstag | die Samstage | субота
n der Sonntag | die Sonntage | неділя
n das Wochenende | die Wochenenden | вихідні
n die Woche | die Wochen | тиждень
n der Tag | die Tage | день
n der Morgen | die Morgen | ранок
n der Vormittag | die Vormittage | час до обіду
n der Mittag | die Mittage | полудень
n der Nachmittag | die Nachmittage | час після обіду
n der Abend | die Abende | вечір
n die Nacht | die Nächte | ніч
n die Stunde | die Stunden | година (тривалість)
n die Minute | die Minuten | хвилина
n die Uhrzeit | die Uhrzeiten | час на годиннику
n der Termin | die Termine | запис, домовлена зустріч
n die Verabredung | die Verabredungen | домовленість про зустріч
n die Freizeit | — | вільний час
n die Arbeit | die Arbeiten | робота
n die Öffnungszeit | die Öffnungszeiten | години роботи
n die Pause | die Pausen | перерва
n der Unterricht | — | заняття, уроки
v fahren | er fährt · ist gefahren | їхати
v lesen | er liest · hat gelesen | читати
v sehen | er sieht · hat gesehen | бачити
v schlafen | er schläft · hat geschlafen | спати
v treffen | er trifft · hat getroffen | зустрічати
v helfen | er hilft · hat geholfen | допомагати
v laufen | er läuft · ist gelaufen | бігти; ходити пішки
v aufstehen | er steht auf · ist aufgestanden | вставати
v einkaufen | er kauft ein · hat eingekauft | робити покупки
v anfangen | er fängt an · hat angefangen | починати(ся)
v aufräumen | er räumt auf · hat aufgeräumt | прибирати, наводити лад
v fernsehen | er sieht fern · hat ferngesehen | дивитися телевізор
v anrufen | er ruft an · hat angerufen | телефонувати (комусь)
v abholen | er holt ab · hat abgeholt | забирати (когось, щось)
v mitkommen | er kommt mit · ist mitgekommen | іти разом
v frühstücken | er frühstückt · hat gefrühstückt | снідати
v spielen | er spielt · hat gespielt | грати
v schwimmen | er schwimmt · ist geschwommen | плавати
v gehen | er geht · ist gegangen | іти
v dauern | es dauert · hat gedauert | тривати
w wann | | коли
w wie lange | | як довго
w am | | у (з днями: am Montag)
w um | | о (з годинами: um acht Uhr)
w von … bis | | з … до
a heute | | сьогодні
a morgen | | завтра
a jetzt | | зараз
a immer | | завжди
a oft | | часто
a manchmal | | іноді
a nie | | ніколи
a früh | | рано
a spät | | пізно
a dann | | потім
a zuerst | | спочатку
p Wie spät ist es? | | Котра година?
p Es ist halb acht. | | Пів на восьму.
p Hast du am Samstag Zeit? | | У тебе є час у суботу?
p Um wie viel Uhr? | | О котрій?
p Bis dann! | | До зустрічі!
`,
6: `
n das Lebensmittel | die Lebensmittel | продукт харчування
n das Obst | — | фрукти
n das Gemüse | — | овочі
n der Apfel | die Äpfel | яблуко
n die Banane | die Bananen | банан
n die Orange | die Orangen | апельсин
n die Birne | die Birnen | груша
n die Erdbeere | die Erdbeeren | полуниця
n die Tomate | die Tomaten | помідор
n die Kartoffel | die Kartoffeln | картопля
n die Zwiebel | die Zwiebeln | цибуля
n die Gurke | die Gurken | огірок
n die Karotte | die Karotten | морква
n das Fleisch | — | м'ясо
n das Hähnchen | die Hähnchen | курча, курятина
n der Fisch | die Fische | риба
n der Reis | — | рис
n die Nudeln (Pl.) | — | макарони
n das Mehl | — | борошно
n das Öl | die Öle | олія
n das Salz | — | сіль
n der Pfeffer | — | перець (спеція)
n der Joghurt | die Joghurts | йогурт
n das Müsli | die Müslis | мюслі
n die Marmelade | die Marmeladen | джем, варення
n der Quark | — | сир кисломолочний
n die Packung | die Packungen | пачка, упаковка
n die Dose | die Dosen | бляшанка
n die Tüte | die Tüten | пакет
n der Becher | die Becher | стаканчик
n das Kilo | die Kilos | кілограм
n das Gramm | die Gramm | грам
n der Liter | die Liter | літр
n das Pfund | die Pfunde | фунт (півкілограма)
n die Kasse | die Kassen | каса
n der Einkaufswagen | die Einkaufswagen | візок для покупок
n das Angebot | die Angebote | пропозиція; акція
n der Preis | die Preise | ціна
n der Laden | die Läden | крамниця
n der Kunde | die Kunden | покупець, клієнт
n die Kundin | die Kundinnen | покупчиня, клієнтка
n die Metzgerei | die Metzgereien | м'ясна крамниця
v mögen | er mag · hat gemocht | любити (щось), подобатися
v nehmen | er nimmt · hat genommen | брати
v kaufen | er kauft · hat gekauft | купувати
v schmecken | es schmeckt · hat geschmeckt | бути смачним
v probieren | er probiert · hat probiert | куштувати, пробувати
v wiegen | er wiegt · hat gewogen | важити
a frisch | | свіжий
a gesund | | здоровий; корисний
a salzig | | солоний
a sauer | | кислий
a scharf | | гострий
a bitter | | гіркий
a lieber | | охочіше, краще
a am liebsten | | найохочіше
p Was darf es sein? | | Що бажаєте?
p Ich hätte gern ein Kilo Äpfel. | | Мені, будь ласка, кілограм яблук.
p Sonst noch etwas? | | Ще щось?
p Das ist alles. | | Це все.
p Das schmeckt gut! | | Це смачно!
p Haben Sie auch Brot? | | У Вас є також хліб?
`,
7: `
n die Familie | die Familien | родина, сім'я
n die Eltern (Pl.) | — | батьки
n der Vater | die Väter | батько
n die Mutter | die Mütter | мати
n der Sohn | die Söhne | син
n die Tochter | die Töchter | донька
n das Kind | die Kinder | дитина
n der Bruder | die Brüder | брат
n die Schwester | die Schwestern | сестра
n die Geschwister (Pl.) | — | брати й сестри
n der Großvater | die Großväter | дідусь
n die Großmutter | die Großmütter | бабуся
n die Großeltern (Pl.) | — | дідусь і бабуся
n der Opa | die Opas | дідусь (розмовне)
n die Oma | die Omas | бабуся (розмовне)
n der Onkel | die Onkel | дядько
n die Tante | die Tanten | тітка
n der Cousin | die Cousins | двоюрідний брат
n die Cousine | die Cousinen | двоюрідна сестра
n der Enkel | die Enkel | онук
n die Enkelin | die Enkelinnen | онука
n der Ehemann | die Ehemänner | чоловік (у шлюбі)
n die Ehefrau | die Ehefrauen | дружина
n der Partner | die Partner | партнер
n die Partnerin | die Partnerinnen | партнерка
n das Baby | die Babys | немовля
n das Jahr | die Jahre | рік
n der Geburtstag | die Geburtstage | день народження
n die Nationalität | die Nationalitäten | громадянство, національність
n die Hochzeit | die Hochzeiten | весілля
n der Hund | die Hunde | собака
n die Katze | die Katzen | кішка
n das Haustier | die Haustiere | домашня тварина
v können | er kann · hat gekonnt | могти, уміти
v müssen | er muss · hat gemusst | мусити
v heiraten | er heiratet · hat geheiratet | одружуватися
v leben | er lebt · hat gelebt | жити
v besuchen | er besucht · hat besucht | відвідувати
v lieben | er liebt · hat geliebt | кохати, дуже любити
a verheiratet | | одружений, заміжня
a ledig | | неодружений, незаміжня
a geschieden | | розлучений
a verwitwet | | вдівець, вдова
a jung | | молодий
a älter | | старший
a jünger | | молодший
a zusammen | | разом
a allein | | сам, самостійно
w sein | | його (присвійне)
w ihr | | її; їхній (присвійне)
p Wie alt bist du? | | Скільки тобі років?
p Ich bin einundzwanzig Jahre alt. | | Мені двадцять один рік.
p Hast du Geschwister? | | У тебе є брати чи сестри?
p Wann bist du geboren? | | Коли ти народився?
p Ich habe keine Kinder. | | У мене немає дітей.
p Kannst du mir helfen? | | Можеш мені допомогти?
p Ich war gestern zu Hause. | | Учора я був удома.
`,
8: `
n die Wohnung | die Wohnungen | квартира
n das Haus | die Häuser | будинок
n das Zimmer | die Zimmer | кімната
n das Wohnzimmer | die Wohnzimmer | вітальня
n das Schlafzimmer | die Schlafzimmer | спальня
n das Kinderzimmer | die Kinderzimmer | дитяча кімната
n die Küche | die Küchen | кухня
n das Bad | die Bäder | ванна кімната
n die Toilette | die Toiletten | туалет
n der Flur | die Flure | коридор
n der Balkon | die Balkone | балкон
n der Garten | die Gärten | сад
n der Keller | die Keller | підвал
n das Stockwerk | die Stockwerke | поверх
n das Erdgeschoss | die Erdgeschosse | перший поверх (на рівні землі)
n der Aufzug | die Aufzüge | ліфт
n die Treppe | die Treppen | сходи
n die Miete | die Mieten | орендна плата
n die Nebenkosten (Pl.) | — | комунальні платежі
n die Kaution | die Kautionen | застава
n der Vermieter | die Vermieter | орендодавець
n die Vermieterin | die Vermieterinnen | орендодавиця
n der Mieter | die Mieter | орендар
n der Nachbar | die Nachbarn | сусід
n die Nachbarin | die Nachbarinnen | сусідка
n die Möbel (Pl.) | — | меблі
n das Sofa | die Sofas | диван
n das Bett | die Betten | ліжко
n der Schrank | die Schränke | шафа
n das Regal | die Regale | полиця, стелаж
n der Teppich | die Teppiche | килим
n der Kühlschrank | die Kühlschränke | холодильник
n der Herd | die Herde | плита
n die Waschmaschine | die Waschmaschinen | пральна машина
n der Spiegel | die Spiegel | дзеркало
n die Dusche | die Duschen | душ
n die Badewanne | die Badewannen | ванна
n die Heizung | die Heizungen | опалення
n der Quadratmeter | die Quadratmeter | квадратний метр
n die Hausordnung | die Hausordnungen | правила будинку
n der Müll | — | сміття
n die Ruhe | — | тиша, спокій
n die Anzeige | die Anzeigen | оголошення
v wollen | er will · hat gewollt | хотіти
v dürfen | er darf · hat gedurft | мати дозвіл
v mieten | er mietet · hat gemietet | орендувати
v umziehen | er zieht um · ist umgezogen | переїжджати
v putzen | er putzt · hat geputzt | прибирати, чистити
v stehen | er steht · hat gestanden | стояти
v liegen | er liegt · hat gelegen | лежати
v rauchen | er raucht · hat geraucht | курити
a hell | | світлий
a dunkel | | темний
a ruhig | | тихий, спокійний
a laut | | гучний, галасливий
a modern | | сучасний
a gemütlich | | затишний
a möbliert | | мебльований
a günstig | | недорогий, вигідний
a sauber | | чистий
a schmutzig | | брудний
w unser | | наш
w euer | | ваш (до кількох на «ти»)
w Ihr | | Ваш (ввічливо)
p Die Wohnung hat drei Zimmer. | | У квартирі три кімнати.
p Wie hoch ist die Miete? | | Яка орендна плата?
p Hier darf man nicht rauchen. | | Тут не можна курити.
p Ich will umziehen. | | Я хочу переїхати.
`,
9: `
n der Alltag | — | повсякдення
n das Hobby | die Hobbys | хобі
n der Sport | — | спорт
n der Fußball | die Fußbälle | футбол; м'яч
n das Fahrrad | die Fahrräder | велосипед
n der Film | die Filme | фільм
n die Musik | — | музика
n das Konzert | die Konzerte | концерт
n das Spiel | die Spiele | гра
n das Foto | die Fotos | фото
n der Ausflug | die Ausflüge | поїздка, екскурсія
n der Spaziergang | die Spaziergänge | прогулянка
n die Hausaufgabe | die Hausaufgaben | домашнє завдання
n die Nachricht | die Nachrichten | повідомлення; (мн.) новини
n das Theater | die Theater | театр
n das Schwimmbad | die Schwimmbäder | басейн
n der See | die Seen | озеро
n der Fluss | die Flüsse | річка
n der Wald | die Wälder | ліс
n das Fitnessstudio | die Fitnessstudios | спортзал
n die Zeitung | die Zeitungen | газета
n das Lied | die Lieder | пісня
v hören | er hört · hat gehört | слухати; чути
v tanzen | er tanzt · hat getanzt | танцювати
v feiern | er feiert · hat gefeiert | святкувати
v fotografieren | er fotografiert · hat fotografiert | фотографувати
v waschen | er wäscht · hat gewaschen | прати, мити
v surfen | er surft · hat gesurft | сидіти в інтернеті; серфити
v reparieren | er repariert · hat repariert | ремонтувати
v malen | er malt · hat gemalt | малювати
v singen | er singt · hat gesungen | співати
v bringen | er bringt · hat gebracht | приносити
v joggen | er joggt · ist gejoggt | бігати підтюпцем
w mich | | мене
w dich | | тебе
w ihn | | його (кого?)
w uns | | нас; нам
w euch | | вас; вам (кільком на «ти»)
w ins | | у, в (= in das: ins Kino)
a gestern | | учора
a vorgestern | | позавчора
a schon | | уже
a noch nicht | | ще не
a gerade | | саме зараз
a lange | | довго
a letzte Woche | | минулого тижня
p Was hast du am Wochenende gemacht? | | Що ти робив на вихідних?
p Ich habe Fußball gespielt. | | Я грав у футбол.
p Wir gehen ins Kino. | | Ми йдемо в кіно.
p Hast du Lust? | | Маєш бажання?
`,
10: `
n die Reise | die Reisen | подорож
n der Urlaub | die Urlaube | відпустка
n das Ticket | die Tickets | квиток
n die Fahrkarte | die Fahrkarten | квиток на транспорт
n der Zug | die Züge | потяг
n das Flugzeug | die Flugzeuge | літак
n der Flughafen | die Flughäfen | аеропорт
n das Gleis | die Gleise | колія (на вокзалі)
n der Koffer | die Koffer | валіза
n das Gepäck | — | багаж
n der Pass | die Pässe | паспорт
n die Grenze | die Grenzen | кордон
n das Meer | die Meere | море
n der Strand | die Strände | пляж
n der Berg | die Berge | гора
n die Unterkunft | die Unterkünfte | житло для ночівлі
n die Ankunft | die Ankünfte | прибуття
n die Abfahrt | die Abfahrten | відправлення
n die Verspätung | die Verspätungen | запізнення
n das Studium | die Studien | навчання в університеті
n die Ausbildung | die Ausbildungen | професійна освіта
n der Umzug | die Umzüge | переїзд
n die Kindheit | — | дитинство
n der Lebenslauf | die Lebensläufe | резюме, біографія
n die Welt | die Welten | світ
v fliegen | er fliegt · ist geflogen | летіти
v ankommen | er kommt an · ist angekommen | прибувати
v abfahren | er fährt ab · ist abgefahren | від'їжджати
v umsteigen | er steigt um · ist umgestiegen | робити пересадку
v einsteigen | er steigt ein · ist eingestiegen | сідати (в транспорт)
v aussteigen | er steigt aus · ist ausgestiegen | виходити (з транспорту)
v bleiben | er bleibt · ist geblieben | залишатися
v werden | er wird · ist geworden | ставати
v passieren | es passiert · ist passiert | траплятися
v aufwachen | er wacht auf · ist aufgewacht | прокидатися
v wandern | er wandert · ist gewandert | ходити в похід
v reisen | er reist · ist gereist | подорожувати
v packen | er packt · hat gepackt | пакувати
v buchen | er bucht · hat gebucht | бронювати
v besichtigen | er besichtigt · hat besichtigt | оглядати (пам'ятки)
v erzählen | er erzählt · hat erzählt | розповідати
v verlieren | er verliert · hat verloren | губити
v vergessen | er vergisst · hat vergessen | забувати
a früher | | раніше
a damals | | тоді, колись
a danach | | після того
a später | | пізніше
a zum Schluss | | наприкінці
a letztes Jahr | | торік
a im Ausland | | за кордоном
p Wann bist du nach Deutschland gekommen? | | Коли ти приїхав до Німеччини?
p Der Zug hat zehn Minuten Verspätung. | | Потяг запізнюється на десять хвилин.
p Gute Reise! | | Щасливої дороги!
p Wo muss ich umsteigen? | | Де мені пересідати?
`,
11: `
n der Körper | die Körper | тіло
n der Kopf | die Köpfe | голова
n das Auge | die Augen | око
n das Ohr | die Ohren | вухо
n die Nase | die Nasen | ніс
n der Mund | die Münder | рот
n der Zahn | die Zähne | зуб
n der Hals | die Hälse | шия; горло
n der Arm | die Arme | рука (від плеча)
n die Hand | die Hände | кисть руки, долоня
n der Finger | die Finger | палець (на руці)
n der Bauch | die Bäuche | живіт
n der Rücken | die Rücken | спина
n das Bein | die Beine | нога
n der Fuß | die Füße | стопа
n das Knie | die Knie | коліно
n die Praxis | die Praxen | лікарський кабінет
n die Sprechstunde | die Sprechstunden | прийомні години
n das Wartezimmer | die Wartezimmer | приймальня
n die Krankenkasse | die Krankenkassen | лікарняна каса (медстрахування)
n die Versichertenkarte | die Versichertenkarten | картка застрахованого
n das Rezept | die Rezepte | рецепт
n das Medikament | die Medikamente | ліки
n die Tablette | die Tabletten | таблетка
n das Fieber | — | температура (жар)
n der Husten | — | кашель
n der Schnupfen | — | нежить
n die Erkältung | die Erkältungen | застуда
n die Grippe | — | грип
n der Schmerz | die Schmerzen | біль
n die Kopfschmerzen (Pl.) | — | головний біль
n die Bauchschmerzen (Pl.) | — | біль у животі
n die Krankschreibung | die Krankschreibungen | лікарняний
n der Notfall | die Notfälle | невідкладний випадок
n der Monat | die Monate | місяць
n das Datum | die Daten | дата
n der Januar | — | січень
n der Februar | — | лютий
n der März | — | березень
n der April | — | квітень
n der Mai | — | травень
n der Juni | — | червень
n der Juli | — | липень
n der August | — | серпень
n der September | — | вересень
n der Oktober | — | жовтень
n der November | — | листопад
n der Dezember | — | грудень
v wehtun | es tut weh · hat wehgetan | боліти
v untersuchen | er untersucht · hat untersucht | оглядати (пацієнта)
v gefallen | es gefällt · hat gefallen | подобатися
v gehören | es gehört · hat gehört | належати
v danken | er dankt · hat gedankt | дякувати
v passen | es passt · hat gepasst | пасувати, підходити
a krank | | хворий
a müde | | втомлений
a schlimm | | поганий, серйозний
a wichtig | | важливий
a stark | | сильний
w mir | | мені
w dir | | тобі
w ihm | | йому
w ihr | | їй (кому?)
w ihnen | | їм
w Ihnen | | Вам
w bei | | у, біля (bei der Ärztin — у лікарки)
p Was fehlt Ihnen? | | Що Вас турбує?
p Mir ist schlecht. | | Мене нудить.
p Ich habe Fieber. | | У мене температура.
p Mein Kopf tut weh. | | У мене болить голова.
p Gute Besserung! | | Одужуйте!
p Ich brauche einen Termin. | | Мені потрібен запис.
p Am ersten Dezember. | | Першого грудня.
`,
12: `
n der Weg | die Wege | шлях, дорога
n die Kreuzung | die Kreuzungen | перехрестя
n die Ampel | die Ampeln | світлофор
n die Ecke | die Ecken | ріг (вулиці)
n die Brücke | die Brücken | міст
n der Platz | die Plätze | площа; місце
n die Haltestelle | die Haltestellen | зупинка
n die U-Bahn | die U-Bahnen | метро
n die S-Bahn | die S-Bahnen | міська електричка
n die Straßenbahn | die Straßenbahnen | трамвай
n das Taxi | die Taxis | таксі
n das Auto | die Autos | автомобіль
n der Bus | die Busse | автобус
n die Linie | die Linien | лінія, маршрут
n die Richtung | die Richtungen | напрямок
n das Zentrum | die Zentren | центр
n die Innenstadt | die Innenstädte | центр міста
n die Polizei | — | поліція
n das Amt | die Ämter | установа, відомство
n das Bürgerbüro | die Bürgerbüros | бюро для громадян (у міській раді)
n die Volkshochschule | die Volkshochschulen | народна вища школа (VHS)
n das Geschäft | die Geschäfte | крамниця; справа
n die Tankstelle | die Tankstellen | автозаправка
n der Kiosk | die Kioske | кіоск
n der Stadtplan | die Stadtpläne | мапа міста
v abbiegen | er biegt ab · ist abgebogen | повертати (кудись)
v warten | er wartet · hat gewartet | чекати
v parken | er parkt · hat geparkt | паркувати(ся)
v kennen | er kennt · hat gekannt | знати (когось, щось)
a links | | ліворуч
a rechts | | праворуч
a geradeaus | | прямо
a nah | | близько
a weit | | далеко
a zu Fuß | | пішки
w mit | | з; (транспортом) mit dem Bus
w von | | від, з
w nach | | до (міст, країн); після
w zu | | до (людей, місць)
w neben | | поруч із
w zwischen | | між
w vor | | перед
w hinter | | за, позаду
w über | | над; через
w unter | | під
w auf | | на (зверху)
w an | | біля, на (збоку, на стіні)
w gegenüber | | навпроти
p Wie komme ich zum Bahnhof? | | Як мені дістатися до вокзалу?
p Gehen Sie geradeaus und dann links. | | Ідіть прямо, а потім ліворуч.
p Ist das weit? | | Це далеко?
p Nimm den Bus Nummer vierundvierzig. | | Сідай на автобус номер сорок чотири.
p Ich fahre mit dem Bus. | | Я їду автобусом.
`,
13: `
n der Job | die Jobs | робота, підробіток
n die Stelle | die Stellen | робоче місце, посада
n die Firma | die Firmen | фірма
n das Büro | die Büros | офіс
n der Chef | die Chefs | керівник
n die Chefin | die Chefinnen | керівниця
n der Kollege | die Kollegen | колега
n die Kollegin | die Kolleginnen | колега (жінка)
n die Bewerbung | die Bewerbungen | заява на роботу
n das Vorstellungsgespräch | die Vorstellungsgespräche | співбесіда
n der Lohn | die Löhne | заробітна плата
n die Arbeitszeit | die Arbeitszeiten | робочий час
n die Schicht | die Schichten | зміна (на роботі)
n der Vertrag | die Verträge | договір
n das Praktikum | die Praktika | практика, стажування
n die Erfahrung | die Erfahrungen | досвід
n die Aufgabe | die Aufgaben | завдання
n das Formular | die Formulare | бланк, формуляр
n der Ausweis | die Ausweise | посвідчення
n das Dokument | die Dokumente | документ
n die Unterschrift | die Unterschriften | підпис
n die Kopie | die Kopien | копія
n der Drucker | die Drucker | принтер
n die Besprechung | die Besprechungen | нарада
n die Werkstatt | die Werkstätten | майстерня
n das Lager | die Lager | склад
n die Fabrik | die Fabriken | фабрика
n der Brief | die Briefe | лист (паперовий)
v sollen | er soll · hat gesollt | бути повинним (за чиїмось словом)
v aufhören | er hört auf · hat aufgehört | припиняти
v verdienen | er verdient · hat verdient | заробляти
v ausfüllen | er füllt aus · hat ausgefüllt | заповнювати
v unterschreiben | er unterschreibt · hat unterschrieben | підписувати
v schicken | er schickt · hat geschickt | надсилати
v drucken | er druckt · hat gedruckt | друкувати
v kopieren | er kopiert · hat kopiert | копіювати
v wissen | er weiß · hat gewusst | знати (факт)
v benutzen | er benutzt · hat benutzt | користуватися
v bekommen | er bekommt · hat bekommen | отримувати
v beginnen | er beginnt · hat begonnen | починати(ся)
a pünktlich | | вчасний; вчасно
a freundlich | | привітний
a fertig | | готовий, завершений
a frei | | вільний
a voll | | повний; переповнений
a in Vollzeit | | на повну ставку
a in Teilzeit | | на неповну ставку
p Was soll ich machen? | | Що мені робити?
p Der Arzt sagt, ich soll viel trinken. | | Лікар каже, що я маю багато пити.
p Ich suche eine Stelle als Programmierer. | | Я шукаю роботу програмістом.
p Bitte unterschreiben Sie hier. | | Підпишіть, будь ласка, тут.
`,
14: `
n das Wetter | — | погода
n die Sonne | die Sonnen | сонце
n der Regen | — | дощ
n der Schnee | — | сніг
n der Wind | die Winde | вітер
n die Wolke | die Wolken | хмара
n das Gewitter | die Gewitter | гроза
n der Nebel | die Nebel | туман
n die Temperatur | die Temperaturen | температура
n der Grad | die Grad | градус
n der Frühling | die Frühlinge | весна
n der Sommer | die Sommer | літо
n der Herbst | die Herbste | осінь
n der Winter | die Winter | зима
n die Jahreszeit | die Jahreszeiten | пора року
n der Himmel | die Himmel | небо
n der Regenschirm | die Regenschirme | парасолька
n die Natur | — | природа
n der Wetterbericht | die Wetterberichte | прогноз погоди
v regnen | es regnet · hat geregnet | іти (про дощ)
v schneien | es schneit · hat geschneit | іти (про сніг)
v scheinen | die Sonne scheint · hat geschienen | світити
v glauben | er glaubt · hat geglaubt | вірити; думати
v denken | er denkt · hat gedacht | думати
v meinen | er meint · hat gemeint | вважати; мати на увазі
v sitzen | er sitzt · hat gesessen | сидіти
v kennenlernen | er lernt kennen · hat kennengelernt | знайомитися
a sonnig | | сонячний
a bewölkt | | хмарний
a windig | | вітряний
a neblig | | туманний
a nass | | мокрий
a trocken | | сухий
a kühl | | прохолодний
a schlecht | | поганий; погано
a toll | | чудовий
w denn | | бо, адже
w seit | | з (якогось часу); уже … (як довго)
w vor | | тому (про час: vor zwei Jahren)
a erst | | лише, тільки (про час)
a wieder | | знову
a bald | | скоро
p Wie ist das Wetter heute? | | Яка сьогодні погода?
p Es ist sonnig und warm. | | Сонячно й тепло.
p Es sind zehn Grad. | | Десять градусів.
p Ich wohne seit zwei Monaten in Xanten. | | Я живу в Ксантені вже два місяці.
p Ich bleibe zu Hause, denn es regnet. | | Я лишаюся вдома, бо йде дощ.
`,
15: `
n die Feier | die Feiern | святкування
n die Einladung | die Einladungen | запрошення
n das Geschenk | die Geschenke | подарунок
n der Feiertag | die Feiertage | святковий день
n die Kerze | die Kerzen | свічка
n die Blume | die Blumen | квітка
n die Karte | die Karten | листівка; картка; квиток
n der Glückwunsch | die Glückwünsche | привітання, побажання
n die Überraschung | die Überraschungen | сюрприз
n der Nachtisch | die Nachtische | десерт
n der Karneval | — | карнавал
n der Weihnachtsmarkt | die Weihnachtsmärkte | різдвяний ярмарок
n der Gastgeber | die Gastgeber | господар (свята)
n die Gastgeberin | die Gastgeberinnen | господиня (свята)
n der Spaß | — | розвага, задоволення
name Weihnachten | | Різдво
name Ostern | | Великдень
name Silvester | | новорічна ніч (31 грудня)
name Neujahr | | Новий рік (1 січня)
v einladen | er lädt ein · hat eingeladen | запрошувати
v schenken | er schenkt · hat geschenkt | дарувати
v gratulieren | er gratuliert · hat gratuliert | вітати (зі святом)
v mitbringen | er bringt mit · hat mitgebracht | приносити з собою
v vorbereiten | er bereitet vor · hat vorbereitet | готувати (заздалегідь)
v absagen | er sagt ab · hat abgesagt | скасовувати; відмовлятися
v zusagen | er sagt zu · hat zugesagt | погоджуватися (прийти)
v dekorieren | er dekoriert · hat dekoriert | прикрашати
v lachen | er lacht · hat gelacht | сміятися
a herzlich | | сердечний, щирий
a lustig | | веселий
a traurig | | сумний
a glücklich | | щасливий
w doch | | так (на заперечне питання); ж, же
p Herzlichen Glückwunsch zum Geburtstag! | | Вітаю з днем народження!
p Alles Gute! | | Усього найкращого!
p Frohe Weihnachten! | | Веселого Різдва!
p Frohe Ostern! | | З Великоднем!
p Ein gutes neues Jahr! | | Щасливого Нового року!
p Viel Spaß! | | Гарно повеселитися!
p Ich freue mich. | | Я радий.
p Kommt doch mit! | | Ходіть же з нами!
p Doch! | | Ні, так! (заперечуючи заперечення)
`,
16: `
n die Kleidung | — | одяг
n die Hose | die Hosen | штани
n das Hemd | die Hemden | сорочка
n die Bluse | die Blusen | блузка
n das T-Shirt | die T-Shirts | футболка
n der Pullover | die Pullover | светр
n die Jacke | die Jacken | куртка
n der Mantel | die Mäntel | пальто
n das Kleid | die Kleider | сукня
n der Rock | die Röcke | спідниця
n der Schuh | die Schuhe | черевик, туфля
n der Stiefel | die Stiefel | чобіт
n die Socke | die Socken | шкарпетка
n die Mütze | die Mützen | шапка
n der Schal | die Schals | шарф
n der Handschuh | die Handschuhe | рукавичка
n die Größe | die Größen | розмір
n die Farbe | die Farben | колір
n das Kaufhaus | die Kaufhäuser | універмаг
n die Umkleidekabine | die Umkleidekabinen | примірочна
n der Kassenbon | die Kassenbons | чек
n das Geld | — | гроші
n das Bargeld | — | готівка
n die Bankkarte | die Bankkarten | банківська картка
n der Rabatt | die Rabatte | знижка
v anprobieren | er probiert an · hat anprobiert | приміряти
v tragen | er trägt · hat getragen | носити (одяг); нести
v umtauschen | er tauscht um · hat umgetauscht | обмінювати (товар)
v zahlen | er zahlt · hat gezahlt | платити
v anziehen | er zieht an · hat angezogen | одягати
v ausziehen | er zieht aus · hat ausgezogen | знімати (одяг); виїжджати
a rot | | червоний
a blau | | синій
a grün | | зелений
a gelb | | жовтий
a schwarz | | чорний
a weiß | | білий
a grau | | сірий
a braun | | коричневий
a rosa | | рожевий
a lila | | фіолетовий
a orange | | помаранчевий
a bunt | | різнокольоровий
a eng | | тісний, вузький
a kurz | | короткий
a lang | | довгий
a bequem | | зручний
a schick | | елегантний
w alles | | усе
w etwas | | щось; трохи
w nichts | | нічого
w welcher | | який, котрий
w dieser | | цей
w für | | для; за
w ohne | | без
p Kann ich das anprobieren? | | Можна це приміряти?
p Welche Größe haben Sie? | | Який у Вас розмір?
p Die Hose ist zu klein. | | Штани замалі.
p Das steht dir gut. | | Тобі це личить.
p Ich nehme diesen Pullover. | | Я візьму цей светр.
p Kann ich mit Karte zahlen? | | Можна заплатити карткою?
`,
};

export const KINDS = { n: 'іменник', v: 'дієслово', a: 'прикметник, прислівник', w: 'службове слово', p: 'фраза', name: 'назва' };
export const WORDS = [];
for (const [ch, text] of Object.entries(RAW)) {
  for (const raw of text.trim().split('\n')) {
    const m = raw.match(/^(n|v|a|w|p|name) (.+?) \|\s*(.*?)\s*\| (.+)$/);
    if (!m) throw new Error('A1 dictionary: cannot read «' + raw + '»');
    const [, kind, de, forms, uk] = m;
    const e = { id: WORDS.length, ch: Number(ch), kind, de: de.trim(), uk: uk.trim() };
    const art = de.match(/^(der|die|das) (.+)$/);
    if (art && (kind === 'n' || kind === 'name')) { e.art = art[1]; e.word = art[2].replace(/ \(Pl\.\)$/, ''); }
    if (/\(Pl\.\)$/.test(de)) e.plOnly = true;
    if (kind === 'n') e.pl = forms.trim();
    if (kind === 'v') e.forms = forms.trim();
    WORDS.push(e);
  }
}
// what is said aloud for an entry: a noun with its article, a verb in the infinitive, the rest as written
export const sayOf = (e) => e.de.replace(/ \(Pl\.\)$/, '').replace(/\s*…\s*/g, ' ');
// the nouns the word garden can grow (with an article, not plural-only, not names)
export const gardenNouns = () => WORDS.filter((e) => e.kind === 'n' && e.art && !e.plOnly);
export const byChapter = (n) => WORDS.filter((e) => e.ch === n);
