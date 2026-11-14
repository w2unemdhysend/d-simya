// DTZ «Sprechen»: about 15 minutes, two candidates together.
//   Teil 1: introduce yourself (keywords on a card), then answer the examiner's questions
//   Teil 2: each gets a picture; describe it and tell about your own experience with the topic, then answer questions
//   Teil 3: plan something together with your partner: suggest, agree, disagree, decide
// Forms in {for him|for her} follow the setting «Рід у прикладах», like the course.
export const SPRECHEN = {
  teil1: {
    card: ['Name', 'Geburtsort / Land', 'Wohnort', 'Familie', 'Beruf / Arbeit', 'Sprachen', 'Hobby'],
    model: [
      ['Guten Tag! Mein Name ist {Taras Schewtschenko|Lessja Ukrajinka}.', 'Добрий день! Мене звати {Тарас Шевченко|Леся Українка}.'],
      ['Ich komme aus der Ukraine, aus {Kyjiw|Lwiw}.', 'Я з України, з {Києва|Львова}.'],
      ['Seit zwei Jahren wohne ich in Xanten, das ist eine kleine Stadt am Niederrhein.', 'Уже два роки я живу в Ксантені — це невелике місто на Нижньому Рейні.'],
      ['Ich bin verheiratet und habe zwei Kinder. Meine Tochter ist neun und mein Sohn ist fünf Jahre alt.', '{Я одружений|Я заміжня} і маю двох дітей. Доньці дев’ять, а синові п’ять років.'],
      ['In der Ukraine habe ich als {Maler|Lehrerin} gearbeitet. Jetzt suche ich eine Stelle und mache einen Deutschkurs.', 'В Україні я {працював художником|працювала вчителькою}. Тепер шукаю роботу й ходжу на курс німецької.'],
      ['Ich spreche Ukrainisch, Englisch und ein bisschen Deutsch.', 'Я говорю українською, англійською й трохи німецькою.'],
      ['In meiner Freizeit gehe ich gern spazieren und koche für meine Familie.', 'У вільний час я люблю гуляти й готувати для сім’ї.'],
    ],
    questions: [
      ['Warum lernen Sie Deutsch?', 'Ich lerne Deutsch, weil ich hier arbeiten möchte und mit meinen Nachbarn sprechen will.'],
      ['Wie gefällt Ihnen Xanten?', 'Xanten gefällt mir gut. Die Stadt ist ruhig, und es gibt viel Natur.'],
      ['Was möchten Sie in Zukunft beruflich machen?', 'Ich möchte gern wieder in meinem Beruf arbeiten. Dafür brauche ich aber ein B1-Zertifikat.'],
      ['Was machen Sie am Wochenende?', 'Am Wochenende fahre ich mit meiner Familie Rad oder wir besuchen Freunde.'],
    ],
  },
  teil2: [
    { topic: 'Einkaufen', picture: 'Фото: родина з повним візком на касі в супермаркеті.',
      questions: ['Wo kaufen Sie ein?', 'Was ist in Deutschland anders als in Ihrem Heimatland?', 'Kaufen Sie auch im Internet?'],
      model: 'Auf meinem Bild sehe ich eine Familie an der Kasse im Supermarkt. Der Wagen ist sehr voll, vielleicht kaufen sie für die ganze Woche ein. Ich kaufe meistens beim Discounter, weil es dort billiger ist. Brot hole ich aber beim Bäcker. In der Ukraine haben die Supermärkte oft bis 22 Uhr oder länger auf. Hier sind am Sonntag alle Geschäfte geschlossen, das war am Anfang ungewohnt für mich. Kleidung kaufe ich manchmal im Internet, aber Lebensmittel nie.' },
    { topic: 'Arbeit', picture: 'Фото: жінка в робочому одязі на складі зі сканером у руці.',
      questions: ['Was für eine Arbeit macht die Person?', 'Wie haben Sie in Ihrem Land gearbeitet?', 'Wie findet man in Deutschland Arbeit?'],
      model: 'Auf dem Foto arbeitet eine Frau in einem Lager. Sie trägt Arbeitskleidung und scannt Pakete. Die Arbeit ist bestimmt anstrengend, weil man den ganzen Tag steht. In der Ukraine habe ich in einem Büro gearbeitet, das war ganz anders. In Deutschland findet man Arbeit oft über die Agentur für Arbeit, über Internetportale oder über Freunde. Wichtig sind ein guter Lebenslauf und gute Deutschkenntnisse.' },
    { topic: 'Wohnen', picture: 'Фото: родина розпаковує коробки в новій квартирі.',
      questions: ['Was ist auf dem Bild los?', 'Wie wohnen Sie?', 'Was war bei Ihrer Wohnungssuche schwierig?'],
      model: 'Auf dem Bild sieht man eine Familie in einer neuen Wohnung. Überall stehen Kartons, sie sind wahrscheinlich gerade umgezogen. Ich wohne mit meiner Familie in einer Dreizimmerwohnung im zweiten Stock. Die Wohnungssuche war sehr schwierig, weil es in Xanten wenige Wohnungen gibt und viele Leute eine Wohnung suchen. Wir haben fast ein Jahr gesucht. Nach dem Umzug mussten wir uns im Bürgerbüro ummelden.' },
    { topic: 'Gesundheit', picture: 'Фото: чоловік у приймальні лікаря, у руках картка медичного страхування.',
      questions: ['Was macht der Mann?', 'Wie oft gehen Sie zum Arzt?', 'Was ist beim Arzt in Deutschland anders?'],
      model: 'Auf dem Bild ist ein Mann beim Arzt. Er steht an der Anmeldung und gibt seine Versichertenkarte ab. Ich gehe nur zum Arzt, wenn ich krank bin, und einmal im Jahr zur Kontrolle. In Deutschland muss man fast immer vorher einen Termin machen, auch beim Hausarzt. In meinem Land konnte man oft einfach kommen und warten. Gut finde ich, dass die Krankenkasse die meisten Kosten bezahlt.' },
  ],
  teil3: [
    { uk: 'Прощальне свято для колеги', task: 'Eine Kollegin aus Ihrem Deutschkurs zieht nach Berlin. Sie möchten zusammen eine kleine Abschiedsfeier organisieren.',
      points: ['Wann?', 'Wo?', 'Essen und Getränke?', 'Geschenk?', 'Wer macht was?'],
      model: [
        ['A', 'Unsere Kollegin Maria zieht bald nach Berlin. Wollen wir eine kleine Abschiedsfeier machen?'],
        ['B', 'Ja, gute Idee! Wann passt es dir? Vielleicht am Freitag nach dem Kurs?'],
        ['A', 'Freitag ist gut, aber dann sind viele schon müde. Wie wäre es mit Samstagnachmittag?'],
        ['B', 'Einverstanden. Und wo? Wir könnten im Kursraum feiern.'],
        ['A', 'Am Samstag ist die Schule geschlossen. Ich schlage vor, wir treffen uns im Park, wenn das Wetter gut ist.'],
        ['B', 'Das finde ich schön. Jeder bringt etwas zu essen mit, zum Beispiel Salate und Kuchen.'],
        ['A', 'Und Getränke kaufe ich. Was schenken wir Maria?'],
        ['B', 'Vielleicht ein Buch über Berlin und eine Karte, auf die alle etwas schreiben.'],
        ['A', 'Super. Dann kaufe ich das Buch, und du sammelst Unterschriften für die Karte?'],
        ['B', 'Ja, das mache ich. Also: Samstag, 15 Uhr, im Park.'],
      ] },
    { uk: 'Спільна поїздка на вихідні', task: 'Sie möchten mit Ihrem Kurspartner am Wochenende mit den Familien einen Ausflug machen.',
      points: ['Wohin?', 'Wie fahren Sie?', 'Was nehmen Sie mit?', 'Kosten?', 'Wann treffen Sie sich?'],
      model: [
        ['A', 'Was hältst du davon, wenn wir am Sonntag zusammen einen Ausflug machen?'],
        ['B', 'Gern! Wohin möchtest du fahren?'],
        ['A', 'Wir könnten nach Duisburg in den Zoo fahren. Die Kinder lieben Tiere.'],
        ['B', 'Der Zoo ist toll, aber ziemlich teuer für zwei Familien. Wie wäre es mit dem Archäologischen Park hier in Xanten?'],
        ['A', 'Stimmt, das ist billiger, und für Kinder unter sechs ist der Eintritt frei. Fahren wir mit dem Rad?'],
        ['B', 'Mit dem Rad ist gut, das ist nicht weit. Ich nehme Brote und Obst mit.'],
        ['A', 'Und ich bringe Getränke und eine Decke mit. Treffen wir uns um zehn Uhr am Markt?'],
        ['B', 'Zehn Uhr passt. Abgemacht!'],
      ] },
    { uk: 'Допомога сусідці після операції', task: 'Ihre ältere Nachbarin hatte eine Operation und kann eine Woche nicht einkaufen. Sie und Ihr Partner wollen ihr helfen.',
      points: ['Einkaufen', 'Arztbesuch', 'Hund ausführen', 'Wer, wann?'],
      model: [
        ['A', 'Frau Müller kann nach ihrer Operation nicht einkaufen. Sollen wir ihr helfen?'],
        ['B', 'Ja, natürlich. Ich kann am Montag und am Donnerstag für sie einkaufen, ich fahre sowieso in den Supermarkt.'],
        ['A', 'Gut. Sie muss am Mittwoch zum Arzt. Ich habe ein Auto, ich kann sie hinbringen.'],
        ['B', 'Prima. Und ihr Hund? Er muss jeden Tag raus.'],
        ['A', 'Morgens habe ich keine Zeit, ich arbeite. Kannst du morgens gehen und ich abends?'],
        ['B', 'Das geht. Dann rufe ich sie gleich an und sage ihr Bescheid.'],
      ] },
  ],
  phrases: [
    { t: 'Запропонувати', list: [['Wie wäre es mit …?', 'Як щодо…?'], ['Ich schlage vor, dass …', 'Пропоную, щоб…'], ['Wir könnten …', 'Ми могли б…'], ['Was hältst du davon, wenn …?', 'Що ти думаєш про те, щоб…?']] },
    { t: 'Погодитися', list: [['Gute Idee!', 'Гарна ідея!'], ['Einverstanden.', 'Згоден (згодна).'], ['Das finde ich gut.', 'Мені це подобається.'], ['Abgemacht!', 'Домовилися!']] },
    { t: 'Не погодитися ввічливо', list: [['Das ist keine schlechte Idee, aber …', 'Ідея непогана, але…'], ['Ich bin nicht sicher, ob …', 'Я не впевнений (впевнена), чи…'], ['Lieber …, weil …', 'Краще…, тому що…']] },
    { t: 'Описати фото', list: [['Auf dem Bild sehe ich …', 'На фото я бачу…'], ['Im Vordergrund / Im Hintergrund …', 'На передньому / задньому плані…'], ['Wahrscheinlich …', 'Мабуть…'], ['Das erinnert mich an …', 'Це нагадує мені…']] },
    { t: 'Розповісти про досвід', list: [['In meinem Heimatland …', 'У моїй країні…'], ['Ich habe die Erfahrung gemacht, dass …', 'З досвіду знаю, що…'], ['Am Anfang war es schwer für mich, …', 'Спочатку мені було важко…']] },
  ],
};
