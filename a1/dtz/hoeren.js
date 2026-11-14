// DTZ «Hören»: one full practice test in the exam's four parts (20 items), recorded with German voices (Piper;
// tools/dtz_audio.py makes a1/dtz/audio/*.mp3 from these texts). As in the exam, each text is heard once; the text
// can be read afterwards. Our own texts; names and numbers are invented.
//   voices: m (a man), f (a woman)
//   teil 1: announcements on the phone or a loudspeaker; a choice of three
//   teil 2: the radio (weather and traffic always among them); a choice of three
//   teil 3: conversations; richtig/falsch about the situation, then a choice of three about a detail
//   teil 4: three people say what they think; match each to one of six sentences
export const HOEREN = [
  { id: 'h1', teil: 1, lines: [['f', 'Praxis Doktor Brandt, guten Tag. Unsere Praxis ist vom 3. bis zum 14. August wegen Urlaub geschlossen. In dringenden Fällen wenden Sie sich bitte an die Praxis Doktor Yilmaz in der Bahnhofstraße 12. Rezepte können Sie ab dem 17. August wieder bei uns abholen.']],
    tasks: [{ q: 'Sie brauchen am 5. August dringend einen Arzt. Was sollen Sie tun?', o: ['Am 17. August wiederkommen.', 'Zu einer anderen Praxis gehen.', 'Ein Rezept abholen.'], a: 1 }] },
  { id: 'h2', teil: 1, lines: [['m', 'Achtung an Gleis 3. Der Regionalexpress nach Düsseldorf, planmäßige Abfahrt 8 Uhr 14, fährt heute von Gleis 5. Wir bitten um Entschuldigung.']],
    tasks: [{ q: 'Was müssen die Fahrgäste nach Düsseldorf machen?', o: ['Auf einen späteren Zug warten.', 'Zu einem anderen Gleis gehen.', 'Eine neue Fahrkarte kaufen.'], a: 1 }] },
  { id: 'h3', teil: 1, lines: [['f', 'Hallo Frau Petrenko, hier ist Sabine Kolb vom Kindergarten Sonnenschein. Ihre Tochter hat leichtes Fieber, aber es geht ihr gut. Könnten Sie sie bitte heute schon um zwölf statt um zwei abholen? Rufen Sie mich bitte kurz zurück, wenn das nicht geht. Danke!']],
    tasks: [{ q: 'Was soll Frau Petrenko machen?', o: ['Ihre Tochter früher abholen.', 'Mit der Tochter zum Arzt gehen.', 'Fiebersaft in den Kindergarten bringen.'], a: 0 }] },
  { id: 'h4', teil: 1, lines: [['m', 'Sie sind mit dem Bürgerbüro der Stadt Xanten verbunden. Termine für Personalausweise und Reisepässe vereinbaren Sie bitte online unter xanten Punkt de. Für alle anderen Fragen drücken Sie bitte die Eins. Unsere Öffnungszeiten finden Sie ebenfalls auf unserer Internetseite.']],
    tasks: [{ q: 'Sie brauchen einen neuen Reisepass. Was müssen Sie tun?', o: ['Die Eins drücken.', 'Im Internet einen Termin machen.', 'Direkt ins Bürgerbüro gehen.'], a: 1 }] },
  { id: 'h5', teil: 2, lines: [['f', 'Und jetzt das Wetter für den Niederrhein. Heute bleibt es bewölkt, am Nachmittag kommt Regen. Die Temperaturen liegen bei zwölf Grad. Morgen wird es freundlicher: viel Sonne und bis zu achtzehn Grad. Am Wochenende dann wieder Schauer.']],
    tasks: [{ q: 'Wie wird das Wetter morgen?', o: ['Es regnet den ganzen Tag.', 'Es ist sonnig und wärmer als heute.', 'Es ist kalt und bewölkt.'], a: 1 }] },
  { id: 'h6', teil: 2, lines: [['m', 'Die Verkehrsmeldungen. Auf der A3 zwischen Wesel und Hünxe ist nach einem Unfall die rechte Spur gesperrt. Dort staut es sich auf acht Kilometern. Bitte fahren Sie, wenn möglich, über die B58. Auf der A57 ist der Verkehr frei.']],
    tasks: [{ q: 'Was empfiehlt der Sprecher?', o: ['Auf der A57 zu fahren.', 'Eine andere Straße zu nehmen.', 'Langsam an der Unfallstelle vorbeizufahren.'], a: 1 }] },
  { id: 'h7', teil: 2, lines: [['f', 'Ein Tipp für Familien: Am Samstag feiert der Archäologische Park in Xanten sein Römerfest. Von zehn bis achtzehn Uhr gibt es Spiele für Kinder, Musik und römisches Essen. Kinder unter sechs Jahren haben freien Eintritt. Und wer mit dem Fahrrad kommt, bekommt ein Getränk gratis.']],
    tasks: [{ q: 'Was bekommt man, wenn man mit dem Fahrrad kommt?', o: ['Freien Eintritt.', 'Ein Getränk ohne Bezahlung.', 'Ein römisches Essen.'], a: 1 }] },
  { id: 'h8', teil: 2, lines: [['m', 'Wichtige Information für alle Eltern: Wegen des Sturms bleiben morgen alle Schulen im Kreis Wesel geschlossen. Die Kindergärten haben eine Notbetreuung. Bitte informieren Sie sich am Abend auf der Internetseite des Kreises, ob der Unterricht am Freitag wieder stattfindet.']],
    tasks: [{ q: 'Was ist morgen?', o: ['Die Kindergärten sind ganz geschlossen.', 'Die Kinder haben keinen Unterricht.', 'Der Unterricht beginnt später.'], a: 1 }] },
  { id: 'h9', teil: 2, lines: [['f', 'Sie hören Radio Niederrhein. Heute Abend um zwanzig Uhr in unserer Sendung «Neu in Deutschland»: Wie finde ich eine Wohnung? Eine Expertin vom Mieterverein beantwortet Ihre Fragen. Rufen Sie an unter null-acht-null-null, zwei-zwei, drei-drei!']],
    tasks: [{ q: 'Worum geht es heute Abend in der Sendung?', o: ['Um Probleme bei der Arbeit.', 'Um die Suche nach einer Wohnung.', 'Um Musik aus vielen Ländern.'], a: 1 }] },
  { id: 'h10', teil: 3, lines: [['f', 'Entschuldigung, wohnen Sie hier im zweiten Stock?'], ['m', 'Ja, ich bin Herr Novak. Ist etwas passiert?'], ['f', 'Ich bin Frau Weber, ich wohne direkt unter Ihnen. Bei mir tropft Wasser von der Decke im Badezimmer.'], ['m', 'Oh nein! Vielleicht ist es die Waschmaschine. Ich schaue sofort nach.'], ['f', 'Danke. Und rufen Sie bitte auch den Hausmeister an. Ich habe seine Nummer nicht.'], ['m', 'Natürlich, das mache ich gleich.']],
    tasks: [{ kind: 'rf', q: 'Frau Weber und Herr Novak sind Nachbarn.', a: 1 }, { q: 'Worum bittet Frau Weber?', o: ['Ihr die Waschmaschine zu leihen.', 'Den Hausmeister zu informieren.', 'Ihr Badezimmer zu putzen.'], a: 1 }] },
  { id: 'h11', teil: 3, lines: [['m', 'Guten Tag, Sie sind die Mutter von Daniel aus der Klasse 3b?'], ['f', 'Ja, guten Tag, Herr Lehmann.'], ['m', 'Daniel macht im Unterricht gut mit, aber er vergisst oft seine Hausaufgaben.'], ['f', 'Das wusste ich nicht. Er sagt immer, er hat keine Hausaufgaben.'], ['m', 'Vielleicht schauen Sie jeden Tag kurz in sein Heft? Dort schreibt er die Aufgaben auf.'], ['f', 'Gut, das mache ich ab heute.']],
    tasks: [{ kind: 'rf', q: 'Daniel hat Probleme mit anderen Kindern.', a: 0 }, { q: 'Was soll die Mutter machen?', o: ['Jeden Tag mit dem Lehrer sprechen.', 'Jeden Tag in Daniels Heft schauen.', 'Daniel bei den Aufgaben helfen.'], a: 1 }] },
  { id: 'h12', teil: 3, lines: [['f', 'Agentur für Arbeit, Kowalski, guten Tag.'], ['m', 'Guten Tag, mein Name ist Hrytsenko. Ich habe morgen um zehn einen Termin bei Ihnen, aber mein Sohn ist krank und ich muss bei ihm bleiben.'], ['f', 'Kein Problem. Ich gebe Ihnen einen neuen Termin. Geht es am Montag um halb neun?'], ['m', 'Ja, das passt.'], ['f', 'Gut. Bringen Sie bitte dann auch die Bescheinigung von Ihrem letzten Arbeitgeber mit.']],
    tasks: [{ kind: 'rf', q: 'Herr Hrytsenko möchte seinen Termin verschieben.', a: 1 }, { q: 'Was soll Herr Hrytsenko mitbringen?', o: ['Eine Bescheinigung vom Arzt.', 'Ein Papier von seiner alten Firma.', 'Den Ausweis seines Sohnes.'], a: 1 }] },
  { id: 'h13', teil: 3, lines: [['m', 'Hallo Anna! Du siehst müde aus.'], ['f', 'Ja, ich arbeite diese Woche in der Spätschicht, bis zweiundzwanzig Uhr. Und morgens bringe ich die Kinder in die Schule.'], ['m', 'Das ist anstrengend. Soll ich die Kinder morgen früh mitnehmen? Mein Sohn geht doch in dieselbe Schule.'], ['f', 'Das wäre super! Dann kann ich länger schlafen. Um Viertel nach sieben?'], ['m', 'Genau. Ich klingle bei dir.']],
    tasks: [{ kind: 'rf', q: 'Anna und der Mann sprechen über ihre Arbeit.', a: 0 }, { q: 'Was macht der Mann morgen?', o: ['Er arbeitet in der Spätschicht.', 'Er bringt Annas Kinder zur Schule.', 'Er holt die Kinder von der Schule ab.'], a: 1 }] },
  { id: 'h14', teil: 4, intro: 'Thema: Sollen Kinder ein eigenes Handy haben?', statements: [
      ['a', 'Kinder brauchen ein Handy, damit die Eltern sie immer erreichen können.'],
      ['b', 'Ein Handy ist für Kinder zu teuer.'],
      ['c', 'Kinder sollten zuerst lernen, ohne Handy zu spielen und Freunde zu treffen.'],
      ['d', 'Kinder lernen mit dem Handy viel für die Schule.'],
      ['e', 'Ein Handy ist in Ordnung, aber es braucht klare Regeln.'],
      ['f', 'Handys machen Kinder krank.'],
    ],
    people: [
      { lines: [['f', 'Meine Tochter ist zehn und fährt allein mit dem Bus zum Training. Ich will wissen, ob sie gut angekommen ist. Deshalb hat sie ein Handy, und ich bin viel ruhiger.']], a: 'a' },
      { lines: [['m', 'Mein Sohn hat ein Handy, aber nur eine Stunde am Tag, und beim Essen und in der Nacht bleibt es in der Küche. So klappt es bei uns gut.']], a: 'e' },
      { lines: [['f', 'Ich finde, Kinder sitzen schon genug vor Bildschirmen. Mein Sohn soll draußen spielen und echte Freunde haben. Ein Handy bekommt er erst mit vierzehn.']], a: 'c' },
    ] },
];
