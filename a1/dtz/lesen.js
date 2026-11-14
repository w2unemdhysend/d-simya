// DTZ «Lesen»: practice sets in the five formats of the exam (Deutsch-Test für Zuwanderer, A2–B1), with everyday
// texts of life in Germany. Our own texts; names, firms and addresses are invented.
//   teil 1: a list (store guide, website, directory); for each task: a, b or c (c: «andere …», nothing fits)
//   teil 2: small ads a–h; which ad fits each situation (or x: none)
//   teil 3: three texts (press, letters from offices); per text: richtig/falsch and a choice of three
//   teil 4: a brochure or a notice; three choices of three
//   teil 5: a formal letter with six gaps; a choice of three per gap
// Every set has a short Ukrainian glossary of the words that matter.
export const LESEN = [
  {
    id: 'l1a', teil: 1, title: 'Універмаг: де що купити', intro: 'Sie sind im Kaufhaus «Rheinkauf» in Wesel. Wohin gehen Sie?',
    list: [
      ['4. Stock', 'Restaurant mit Terrasse · Kundenservice · Geschenkverpackung · Toiletten'],
      ['3. Stock', 'Elektro: Fernseher, Computer, Handys, Kaffeemaschinen · Haushalt: Töpfe, Geschirr, Bettwäsche'],
      ['2. Stock', 'Kinder: Kinderkleidung, Spielwaren, Schulbedarf · Sport: Sportschuhe, Fahrräder, Camping'],
      ['1. Stock', 'Damen: Mode, Unterwäsche, Bademode · Herren: Anzüge, Hemden, Krawatten'],
      ['Erdgeschoss', 'Kosmetik · Parfüm · Schmuck · Uhren · Lederwaren · Zeitschriften'],
      ['Untergeschoss', 'Lebensmittel · Bäckerei · Getränke · Schlüsseldienst · Schuhreparatur'],
    ],
    tasks: [
      { q: 'Sie möchten einen Topf für Suppe kaufen.', o: ['3. Stock', '2. Stock', 'anderes Stockwerk'], a: 0 },
      { q: 'Ihre Tochter kommt in die Schule und braucht einen Schulranzen.', o: ['1. Stock', '2. Stock', 'anderes Stockwerk'], a: 1 },
      { q: 'Sie haben einen Schlüssel verloren und brauchen einen neuen.', o: ['Erdgeschoss', '4. Stock', 'anderes Stockwerk'], a: 2 },
      { q: 'Sie haben ein Geschenk gekauft und möchten es schön einpacken lassen.', o: ['Erdgeschoss', '4. Stock', 'anderes Stockwerk'], a: 1 },
      { q: 'Ihr Mann braucht ein Hemd für eine Hochzeit.', o: ['1. Stock', 'Erdgeschoss', 'anderes Stockwerk'], a: 0 },
    ],
    glossary: [['der Stock', 'поверх'], ['das Erdgeschoss', 'перший (нульовий) поверх'], ['das Untergeschoss', 'цокольний поверх'], ['der Schlüsseldienst', 'виготовлення ключів'], ['der Schulranzen', 'шкільний ранець'], ['die Geschenkverpackung', 'пакування подарунків']],
  },
  {
    id: 'l1b', teil: 1, title: 'Сайт міста: до якого відділу звернутися', intro: 'Sie lesen die Internetseite der Stadtverwaltung. Wo finden Sie Hilfe?',
    list: [
      ['Bürgerservice', 'Anmeldung und Ummeldung · Personalausweis und Reisepass · Führungszeugnis · Fundbüro'],
      ['Familie und Soziales', 'Wohngeld · Kita-Plätze · Hilfe für Seniorinnen und Senioren · Pflegeberatung'],
      ['Ordnung und Verkehr', 'Parkausweis für Anwohner · Lärmbeschwerden · Hundesteuer · Märkte und Feste'],
      ['Standesamt', 'Geburt · Heirat · Sterbefall · Urkunden'],
      ['Bauen und Umwelt', 'Sperrmüll · Mülltonnen · Bäume und Grünflächen · Baugenehmigung'],
    ],
    tasks: [
      { q: 'Sie sind umgezogen und müssen Ihre neue Adresse melden.', o: ['Bürgerservice', 'Standesamt', 'andere Seite'], a: 0 },
      { q: 'Sie möchten Ihr altes Sofa abholen lassen.', o: ['Ordnung und Verkehr', 'Bauen und Umwelt', 'andere Seite'], a: 1 },
      { q: 'Ihr Nachbar macht jede Nacht laute Musik.', o: ['Ordnung und Verkehr', 'Familie und Soziales', 'andere Seite'], a: 0 },
      { q: 'Sie brauchen für Ihr Kind einen Platz im Kindergarten.', o: ['Bürgerservice', 'Familie und Soziales', 'andere Seite'], a: 1 },
      { q: 'Sie möchten Ihren Führerschein umschreiben lassen.', o: ['Bürgerservice', 'Ordnung und Verkehr', 'andere Seite'], a: 2 },
    ],
    glossary: [['der Sperrmüll', 'великогабаритне сміття'], ['die Lärmbeschwerde', 'скарга на шум'], ['der Anwohner', 'мешканець вулиці'], ['umschreiben lassen', 'переоформити (напр. права)'], ['das Fundbüro', 'бюро знахідок']],
  },
  {
    id: 'l2a', teil: 2, title: 'Оголошення: робота, житло, курси', intro: 'Welche Anzeige passt zu welcher Situation? Für eine Situation gibt es keine passende Anzeige: x.',
    ads: [
      { k: 'a', t: 'Reinigungskraft (m/w/d) gesucht! Büro in Xanten, Montag–Freitag 6–9 Uhr, Minijob 538 €. Tel. 02801 990011' },
      { k: 'b', t: 'Deutschkurs B1 am Abend: Di + Do 18–20.30 Uhr, VHS Wesel, Beginn 12. Januar. Anmeldung online oder im Büro.' },
      { k: 'c', t: '2-Zimmer-Wohnung, 54 m², Wesel-Mitte, Balkon, 3. Stock ohne Aufzug, 520 € warm. Ab 1. März frei. Keine Haustiere.' },
      { k: 'd', t: 'Verkaufe Kinderwagen, wenig benutzt, 80 €. Abholung in Sonsbeck. Anrufe nur abends.' },
      { k: 'e', t: 'Erdgeschosswohnung, 3 Zimmer, 75 m², Xanten, kleiner Garten, Haustiere erlaubt, 790 € kalt. Besichtigung: 0170 2233445' },
      { k: 'f', t: 'Fahrer/in mit Führerschein Klasse B für Lieferdienst gesucht, Teilzeit, auch Wochenende. Bewerbung per E-Mail.' },
      { k: 'g', t: 'Nähkurs für Anfängerinnen und Anfänger, samstags 10–13 Uhr im Familienzentrum. Nähmaschinen sind vorhanden.' },
      { k: 'h', t: 'Suche Babysitterin für zwei Kinder (3 und 6), zwei Abende pro Woche, in Xanten-Lüttingen.' },
    ],
    tasks: [
      { q: 'Sie haben einen Hund und suchen eine Wohnung mit Garten.', a: 'e' },
      { q: 'Sie arbeiten tagsüber und möchten Ihr Deutsch verbessern.', a: 'b' },
      { q: 'Sie möchten früh am Morgen ein paar Stunden arbeiten.', a: 'a' },
      { q: 'Sie suchen ein gebrauchtes Kinderfahrrad.', a: 'x' },
      { q: 'Sie können Auto fahren und suchen eine Stelle für einige Tage pro Woche.', a: 'f' },
    ],
    glossary: [['die Reinigungskraft', 'прибиральник, прибиральниця'], ['warm / kalt (Miete)', 'з комунальними / без комунальних'], ['das Haustier', 'домашня тварина'], ['die Besichtigung', 'огляд (квартири)'], ['der Lieferdienst', 'служба доставки']],
  },
  {
    id: 'l2b', teil: 2, title: 'Оголошення: послуги й дозвілля', intro: 'Welche Anzeige passt? Für eine Situation gibt es keine Lösung: x.',
    ads: [
      { k: 'a', t: 'Hausaufgabenhilfe für Grundschulkinder, Mo–Do 14–16 Uhr, kostenlos, im Jugendzentrum Xanten.' },
      { k: 'b', t: 'Fahrradwerkstatt: Reparatur in 24 Stunden, auch E-Bikes. Marktstraße 7, Wesel.' },
      { k: 'c', t: 'Schwimmkurs für Erwachsene: keine Angst vor Wasser! 10 Termine, Hallenbad Xanten, mittwochs 19 Uhr.' },
      { k: 'd', t: 'Umzüge und Transporte, auch kleine Möbel, günstige Preise. Tel. 0281 445566' },
      { k: 'e', t: 'Zahnarztpraxis Dr. Lohmann: neue Patienten willkommen, Sprechstunde auch samstags 9–12 Uhr.' },
      { k: 'f', t: 'Internationales Frauencafé: jeden Freitag 10–12 Uhr, mit Kinderbetreuung. Eintritt frei.' },
      { k: 'g', t: 'Gebrauchte Waschmaschinen mit Garantie, Lieferung und Anschluss möglich.' },
      { k: 'h', t: 'Computerkurs für Seniorinnen und Senioren: E-Mails, Fotos, Videotelefonie. Kleine Gruppen.' },
    ],
    tasks: [
      { q: 'Ihr Sohn ist in der 2. Klasse und braucht Hilfe bei den Hausaufgaben.', a: 'a' },
      { q: 'Sie arbeiten unter der Woche und brauchen einen Termin beim Zahnarzt.', a: 'e' },
      { q: 'Ihre Mutter möchte mit den Enkeln in der Ukraine per Video sprechen.', a: 'h' },
      { q: 'Sie möchten eine neue Couch kaufen.', a: 'x' },
      { q: 'Sie möchten andere Frauen kennenlernen und haben ein kleines Kind.', a: 'f' },
    ],
    glossary: [['die Hausaufgabenhilfe', 'допомога з домашнім завданням'], ['die Werkstatt', 'майстерня'], ['die Sprechstunde', 'прийомні години'], ['die Kinderbetreuung', 'догляд за дітьми'], ['der Anschluss', 'підключення']],
  },
  {
    id: 'l3a', teil: 3, title: 'Новина з газети', text: `Xanten: Neue Busverbindung nach Wesel
Ab dem 1. Februar fährt die neue Buslinie 68 von Xanten Bahnhof direkt nach Wesel. Die Busse fahren montags bis freitags alle 30 Minuten, am Wochenende stündlich. Die Fahrt dauert etwa 25 Minuten. Mit dem Deutschlandticket kann man die Linie ohne Aufpreis nutzen. Für Schülerinnen und Schüler gibt es morgens zwei zusätzliche Fahrten. Die Stadt hofft, dass mehr Menschen das Auto stehen lassen.`,
    tasks: [
      { kind: 'rf', q: 'Die neue Buslinie fährt jeden Tag.', a: 0 },
      { kind: 'mc', q: 'Wer bekommt zusätzliche Busse?', o: ['Menschen mit Deutschlandticket.', 'Kinder und Jugendliche auf dem Weg zur Schule.', 'Menschen, die am Wochenende fahren.'], a: 1 },
    ],
    glossary: [['der Aufpreis', 'доплата'], ['stündlich', 'щогодини'], ['zusätzlich', 'додатковий'], ['das Auto stehen lassen', 'залишити авто вдома']],
  },
  {
    id: 'l3b', teil: 3, title: 'Лист від орендодавця', text: `Sehr geehrte Mieterinnen und Mieter,
am Dienstag, dem 14. März, wird in unserem Haus zwischen 8 und 12 Uhr die Heizung geprüft. Ein Techniker der Firma Wärme-Service muss dafür in jede Wohnung. Bitte sorgen Sie dafür, dass die Heizkörper frei zugänglich sind. Wenn Sie an diesem Tag nicht zu Hause sein können, geben Sie bitte Ihren Schlüssel bei Herrn Kaya (Erdgeschoss links) ab oder vereinbaren Sie bis zum 10. März einen anderen Termin unter 0281 300400.
Mit freundlichen Grüßen
Hausverwaltung Nord`,
    tasks: [
      { kind: 'rf', q: 'Der Techniker kommt am Nachmittag.', a: 0 },
      { kind: 'mc', q: 'Was können Sie tun, wenn Sie am 14. März arbeiten?', o: ['Den Heizkörper selbst prüfen.', 'Den Schlüssel einem Nachbarn geben.', 'Am 10. März zu Hause bleiben.'], a: 1 },
    ],
    glossary: [['die Hausverwaltung', 'управитель будинку'], ['der Heizkörper', 'батарея опалення'], ['frei zugänglich', 'вільний доступ'], ['vereinbaren', 'домовитися']],
  },
  {
    id: 'l3c', teil: 3, title: 'Запрошення з Jobcenter', text: `Einladung
Sehr geehrte Frau Melnyk,
bitte kommen Sie am Donnerstag, 22. Mai, um 9:30 Uhr zu einem Gespräch über Ihre berufliche Situation in das Jobcenter Wesel, Zimmer 214. Bringen Sie bitte Ihren Ausweis, Ihren Lebenslauf und Ihre Zeugnisse mit. Wenn Sie den Termin nicht wahrnehmen können, melden Sie sich bitte vorher telefonisch. Wenn Sie ohne wichtigen Grund nicht kommen, kann Ihr Bürgergeld gekürzt werden.
Mit freundlichen Grüßen
Ihr Jobcenter`,
    tasks: [
      { kind: 'rf', q: 'Frau Melnyk soll Dokumente über ihre Ausbildung mitbringen.', a: 1 },
      { kind: 'mc', q: 'Was passiert, wenn Frau Melnyk ohne Grund nicht kommt?', o: ['Sie bekommt einen neuen Termin.', 'Sie bekommt vielleicht weniger Geld.', 'Sie muss einen Brief schreiben.'], a: 1 },
    ],
    glossary: [['einen Termin wahrnehmen', 'прийти на призначену зустріч'], ['der Lebenslauf', 'резюме'], ['das Zeugnis', 'атестат, свідоцтво, відгук з роботи'], ['kürzen', 'скоротити']],
  },
  {
    id: 'l4a', teil: 4, title: 'Брошура: сортування сміття', text: `So trennen Sie Ihren Müll richtig
In die gelbe Tonne oder den gelben Sack gehören Verpackungen aus Plastik und Metall, zum Beispiel Joghurtbecher und Konservendosen. Papier und Karton kommen in die blaue Tonne. In die braune Biotonne gehören Obst- und Gemüsereste, Kaffeefilter und Gartenabfälle, aber kein Fleisch und keine Plastiktüten. Glasflaschen bringen Sie zum Glascontainer: weißes, grünes und braunes Glas getrennt. Bitte werfen Sie Glas nur werktags von 7 bis 20 Uhr ein. Alles andere kommt in die graue Restmülltonne. Elektrogeräte und Batterien geben Sie kostenlos beim Wertstoffhof ab.`,
    tasks: [
      { q: 'Wohin kommt eine leere Konservendose?', o: ['In die blaue Tonne.', 'In die gelbe Tonne.', 'In die Restmülltonne.'], a: 1 },
      { q: 'Wann dürfen Sie Glas einwerfen?', o: ['Am Sonntagnachmittag.', 'Am Montag um 18 Uhr.', 'Jeden Abend um 21 Uhr.'], a: 1 },
      { q: 'Was machen Sie mit einem alten Wasserkocher?', o: ['Zum Wertstoffhof bringen.', 'In die gelbe Tonne werfen.', 'In die graue Tonne werfen.'], a: 0 },
    ],
    glossary: [['die Verpackung', 'упаковка'], ['die Konservendose', 'консервна бляшанка'], ['werktags', 'у робочі дні'], ['der Wertstoffhof', 'пункт прийому вторсировини'], ['einwerfen', 'вкидати']],
  },
  {
    id: 'l4b', teil: 4, title: 'Інформація лікарняної каси', text: `Ihre elektronische Gesundheitskarte
Bitte bringen Sie Ihre Gesundheitskarte zu jedem Arztbesuch mit. Ohne Karte kann die Praxis Ihnen eine private Rechnung schreiben; wenn Sie die Karte innerhalb von 10 Tagen nachreichen, wird die Rechnung storniert. Wenn Sie umziehen oder Ihren Namen ändern, teilen Sie uns das bitte sofort mit. Bei Verlust der Karte rufen Sie unsere kostenlose Servicenummer an; Sie bekommen dann innerhalb von zwei Wochen eine neue Karte. Kinder unter 18 Jahren zahlen keine Zuzahlung für Medikamente.`,
    tasks: [
      { q: 'Sie haben die Karte beim Arzt vergessen. Was können Sie tun?', o: ['Die Rechnung sofort bezahlen.', 'Die Karte später in die Praxis bringen.', 'Einen neuen Termin machen.'], a: 1 },
      { q: 'Wann müssen Sie die Krankenkasse informieren?', o: ['Wenn Sie eine neue Adresse haben.', 'Wenn Sie zum Arzt gehen.', 'Wenn Sie Medikamente kaufen.'], a: 0 },
      { q: 'Was gilt für Kinder?', o: ['Sie brauchen keine Karte.', 'Sie bezahlen für Medikamente nichts dazu.', 'Sie bekommen eine Karte in zwei Wochen.'], a: 1 },
    ],
    glossary: [['die Gesundheitskarte', 'картка медичного страхування'], ['nachreichen', 'донести пізніше'], ['stornieren', 'скасувати'], ['der Verlust', 'втрата'], ['die Zuzahlung', 'доплата']],
  },
  {
    id: 'l5a', teil: 5, title: 'Офіційний лист: запис дитини до садочка', text: `Sehr geehrte Damen und Herren,
ich möchte meinen Sohn Mark (3 Jahre) für einen Platz in Ihrem Kindergarten {1}. Wir wohnen seit Oktober in Xanten {2} ich arbeite ab Februar 30 Stunden pro Woche. Deshalb brauche ich einen Platz {3} 7:30 bis 14:30 Uhr. Mark spricht Ukrainisch und ein {4} Deutsch. Können Sie mir bitte mitteilen, {5} Unterlagen Sie brauchen? Ich freue mich auf Ihre Antwort.
Mit {6} Grüßen
Olena Lysenko`,
    gaps: [
      { o: ['anmelden', 'abmelden', 'melden'], a: 0 },
      { o: ['aber', 'und', 'oder'], a: 1 },
      { o: ['seit', 'von', 'ab'], a: 1 },
      { o: ['bisschen', 'wenig', 'kleines'], a: 0 },
      { o: ['was', 'wie', 'welche'], a: 2 },
      { o: ['freundlichen', 'freundliche', 'freundlich'], a: 0 },
    ],
    glossary: [['anmelden', 'записати, зареєструвати'], ['die Unterlagen', 'документи'], ['mitteilen', 'повідомити']],
  },
  {
    id: 'l5b', teil: 5, title: 'Офіційний лист: скарга на ремонт', text: `Sehr geehrter Herr Schulte,
seit drei Wochen ist die Heizung in unserem Badezimmer {1}. Ich habe Sie schon zweimal angerufen, {2} bis heute ist niemand gekommen. Jetzt ist es sehr kalt, und meine Kinder {3} sich morgens nicht waschen. Bitte schicken Sie {4} bald wie möglich einen Handwerker. Ich bin {5} Woche jeden Tag ab 15 Uhr zu Hause. Bitte rufen Sie mich vorher an, {6} ich Ihnen die Tür öffnen kann.
Mit freundlichen Grüßen
Iryna Kovalenko`,
    gaps: [
      { o: ['kaputt', 'kaputte', 'kaputten'], a: 0 },
      { o: ['denn', 'aber', 'weil'], a: 1 },
      { o: ['können', 'kann', 'könnt'], a: 0 },
      { o: ['wie', 'so', 'als'], a: 1 },
      { o: ['diesen', 'dieses', 'diese'], a: 2 },
      { o: ['damit', 'um', 'dass'], a: 0 },
    ],
    glossary: [['der Handwerker', 'майстер'], ['so bald wie möglich', 'якомога швидше'], ['damit', 'щоб']],
  },
];
