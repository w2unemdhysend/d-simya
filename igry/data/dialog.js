// "Розмова": short scenes from life in Germany. The other person speaks (a recorded clip), you pick one of three
// answers. A wrong one is not a loss: the other person reacts the way people do, a hint says why, and you try again.
// Polite "Sie" with strangers and officials; first names and "du" only where it fits.
//
// step: { npc: [German, Ukrainian], answers: [[German, Ukrainian], ...] — the first is right — , why: { index: hint },
//         react: { index: key of REACT } }

export const REACT = {
  wie: ['Wie bitte?', 'Перепрошую?'],
  nicht: ['Entschuldigung, das habe ich nicht verstanden.', 'Вибачте, я не зрозумів.'],
  falsch: ['Hm, ich glaube, Sie meinen etwas anderes.', 'Хм, здається, ви маєте на увазі щось інше.'],
  du: ['Äh… wir kennen uns doch gar nicht.', 'Е-е… ми ж навіть не знайомі.'],
  hier: ['Da sind Sie bei mir leider falsch.', 'Тут ви, на жаль, не за адресою.'],
  lachen: ['Haha, nein, das meinte ich nicht.', 'Ха-ха, ні, я не це мав на увазі.'],
};

export const SCENES = [
  { id: 'baeckerei', emoji: '🥨', name: 'У пекарні', de: 'In der Bäckerei', who: 'Продавчиня', steps: [
    { npc: ['Guten Morgen! Was darf es sein?', 'Доброго ранку! Що бажаєте?'],
      answers: [['Zwei Brötchen, bitte.', 'Дві булочки, будь ласка.'], ['Ich habe einen Termin.', 'У мене запис.'], ['Wo ist der Bahnhof?', 'Де вокзал?']],
      why: { 1: 'Запис (Termin) буває в лікаря чи в установі, а в пекарні просто кажуть, що хочуть купити.', 2: 'Продавчиня питає, що ви хочете купити, а не дорогу.' },
      react: { 1: 'hier', 2: 'falsch' } },
    { npc: ['Gern. Sonst noch etwas?', 'Із задоволенням. Ще щось?'],
      answers: [['Nein, danke. Das ist alles.', 'Ні, дякую. Це все.'], ['Ja, gerne.', 'Так, охоче.'], ['Tschüss!', 'Бувай!']],
      why: { 1: '«Ja» означає, що ви хочете ще щось, і тоді треба сказати, що саме. Якщо більше нічого не треба, кажуть «Nein, danke».', 2: 'Ще не заплатили: прощатися рано.' },
      react: { 1: 'wie', 2: 'lachen' } },
    { npc: ['Das macht zwei Euro vierzig.', 'З вас два євро сорок.'],
      answers: [['Kann ich mit Karte zahlen?', 'Можна заплатити карткою?'], ['Das ist zu teuer, ich zahle einen Euro.', 'Це задорого, я заплачу один євро.'], ['Wie spät ist es?', 'Котра година?']],
      why: { 1: 'У пекарні не торгуються: ціна фіксована.', 2: 'Продавчиня назвала ціну, а не питала про час.' },
      react: { 1: 'lachen', 2: 'falsch' } },
    { npc: ['Ja, natürlich. Brauchen Sie eine Tüte?', 'Так, звичайно. Вам потрібен пакет?'],
      answers: [['Nein danke, ich habe eine dabei.', 'Ні, дякую, у мене є з собою.'], ['Ich brauche einen Arzt.', 'Мені потрібен лікар.'], ['Die Tüte ist blau.', 'Пакет синій.']],
      why: { 1: '«Tüte» — пакет, а не лікар. Пакети в Німеччині часто платні, тому питають.', 2: 'Питали, чи потрібен пакет, а не який він.' },
      react: { 1: 'nicht', 2: 'wie' } },
    { npc: ['Schönen Tag noch!', 'Гарного дня!'],
      answers: [['Danke, Ihnen auch!', 'Дякую, і вам!'], ['Danke, dir auch!', 'Дякую, і тобі!'], ['Gute Nacht!', 'На добраніч!']],
      why: { 1: 'З продавчинею говорять на «Sie», тож «Ihnen auch».', 2: '«Gute Nacht» кажуть перед сном, а зараз ранок.' },
      react: { 1: 'du', 2: 'lachen' } },
  ], end: ['Tschüss, bis morgen!', 'Бувайте, до завтра!'] },

  { id: 'arzt', emoji: '🩺', name: 'Реєстратура в лікаря', de: 'In der Arztpraxis', who: 'Медсестра на реєстрації', steps: [
    { npc: ['Guten Tag! Haben Sie einen Termin?', 'Добрий день! У вас є запис?'],
      answers: [['Ja, um zehn Uhr bei Frau Doktor Schmidt.', 'Так, на десяту до лікарки Шмідт.'], ['Ja, ich habe Hunger.', 'Так, я голодний.'], ['Nein, ich möchte nur ein Brötchen.', 'Ні, я хочу тільки булочку.']],
      why: { 1: 'Питали про запис (Termin), а «Hunger» — це голод.', 2: 'Булочки продають у пекарні, а це лікарня.' },
      react: { 1: 'wie', 2: 'hier' } },
    { npc: ['Ihre Versichertenkarte, bitte.', 'Вашу картку медичного страхування, будь ласка.'],
      answers: [['Hier, bitte.', 'Ось, будь ласка.'], ['Ich habe keine Zeit.', 'У мене немає часу.'], ['Meine Karte ist schön, oder?', 'Гарна в мене картка, правда?']],
      why: { 1: 'Картку страхування (Versichertenkarte) треба просто віддати: без неї прийом не оплатять.', 2: 'Картку просять віддати, а не оцінити.' },
      react: { 1: 'falsch', 2: 'lachen' } },
    { npc: ['Waren Sie schon einmal bei uns?', 'Ви вже були в нас раніше?'],
      answers: [['Nein, ich bin zum ersten Mal hier.', 'Ні, я тут уперше.'], ['Ja, ich war gestern im Kino.', 'Так, я вчора був у кіно.'], ['Nein, ich wohne in Xanten.', 'Ні, я живу в Ксантені.']],
      why: { 1: 'Питали, чи були ви в цій практиці, а не в кіно.', 2: 'Де ви живете, ще спитають. Зараз питали, чи ви тут уперше.' },
      react: { 1: 'lachen', 2: 'falsch' } },
    { npc: ['Dann füllen Sie bitte diesen Fragebogen aus.', 'Тоді заповніть, будь ласка, цю анкету.'],
      answers: [['Können Sie mir dabei helfen? Ich spreche noch nicht gut Deutsch.', 'Можете мені допомогти? Я ще погано говорю німецькою.'], ['Nein, das mache ich nicht.', 'Ні, я цього не робитиму.'], ['Ich fülle das Auto aus.', 'Я заповню автомобіль.']],
      why: { 1: 'Анкету (Fragebogen) треба заповнити. Якщо важко, просто попросіть допомоги.', 2: 'Заповнюють анкету, а не автомобіль: «ausfüllen» — заповнювати бланк.' },
      react: { 1: 'falsch', 2: 'lachen' } },
    { npc: ['Natürlich. Nehmen Sie bitte im Wartezimmer Platz.', 'Звичайно. Сідайте, будь ласка, у приймальні.'],
      answers: [['Danke schön.', 'Дуже дякую.'], ['Wo ist das Schlafzimmer?', 'Де спальня?'], ['Ich nehme den Platz mit.', 'Я візьму місце з собою.']],
      why: { 1: 'Wartezimmer — приймальня, де чекають, а не спальня.', 2: '«Platz nehmen» — сісти, присісти.' },
      react: { 1: 'lachen', 2: 'nicht' } },
  ], end: ['Frau Doktor Schmidt ruft Sie gleich auf.', 'Лікарка Шмідт зараз вас покличе.'] },

  { id: 'amt', emoji: '🏛️', name: 'Реєстрація в Bürgerbüro', de: 'Im Bürgerbüro', who: 'Працівник Bürgerbüro', steps: [
    { npc: ['Guten Tag, was kann ich für Sie tun?', 'Добрий день, чим можу допомогти?'],
      answers: [['Ich möchte mich anmelden.', 'Я хочу зареєструвати місце проживання.'], ['Ich möchte ein Brötchen.', 'Я хочу булочку.'], ['Ich möchte abfahren.', 'Я хочу від’їхати.']],
      why: { 1: 'Булочки продають у пекарні. В установі кажуть, по яку послугу прийшли.', 2: '«Anmelden» (зареєструватися) — те, по що приходять після переїзду.' },
      react: { 1: 'hier', 2: 'wie' } },
    { npc: ['Haben Sie die Wohnungsgeberbestätigung dabei?', 'У вас є з собою підтвердження від власника житла?'],
      answers: [['Ja, hier ist sie.', 'Так, ось воно.'], ['Nein, ich habe keinen Hund.', 'Ні, у мене немає собаки.'], ['Ja, ich bin sehr müde.', 'Так, я дуже втомився.']],
      why: { 1: 'Wohnungsgeberbestätigung — папір від власника квартири. Без нього не зареєструють.', 2: 'Відповідь не на питання. Просили документ.' },
      react: { 1: 'nicht', 2: 'falsch' } },
    { npc: ['Und Ihren Ausweis oder Reisepass, bitte.', 'І ваше посвідчення або закордонний паспорт, будь ласка.'],
      answers: [['Hier ist mein Reisepass.', 'Ось мій паспорт.'], ['Mein Pass ist zu Hause, aber ich bin es wirklich.', 'Паспорт удома, але це справді я.'], ['Reisen Sie gern?', 'Ви любите подорожувати?']],
      why: { 1: 'Без документа з фото нічого не оформлять. Його завжди треба мати з собою.', 2: 'Reisepass — паспорт. Його просили показати, а не говорити про подорожі.' },
      react: { 1: 'falsch', 2: 'lachen' } },
    { npc: ['Seit wann wohnen Sie in der Wohnung?', 'Відколи ви живете в цій квартирі?'],
      answers: [['Seit dem ersten November.', 'З першого листопада.'], ['Im dritten Stock.', 'На третьому поверсі.'], ['Mit meiner Mutter.', 'З мамою.']],
      why: { 1: '«Seit wann?» — «Відколи?». Відповідають датою.', 2: 'З ким ви живете, теж можуть спитати, але зараз питали дату.' },
      react: { 1: 'falsch', 2: 'falsch' } },
    { npc: ['Gut. Hier ist Ihre Meldebestätigung. Bitte gut aufbewahren.', 'Добре. Ось ваше підтвердження реєстрації. Збережіть його, будь ласка.'],
      answers: [['Vielen Dank. Auf Wiedersehen!', 'Щиро дякую. До побачення!'], ['Kann ich sie wegwerfen?', 'Можна її викинути?'], ['Tschüss, Alter!', 'Бувай, друже!']],
      why: { 1: 'Meldebestätigung потрібна для банку, школи, Jobcenter: її зберігають.', 2: '«Alter» кажуть друзям. В установі — «Auf Wiedersehen».' },
      react: { 1: 'lachen', 2: 'du' } },
  ], end: ['Auf Wiedersehen und willkommen in Xanten!', 'До побачення і ласкаво просимо до Ксантена!'] },

  { id: 'nachbar', emoji: '📦', name: 'Сусідка й посилка', de: 'Die Nachbarin', who: 'Сусідка пані Шульц', steps: [
    { npc: ['Hallo! Ich habe ein Paket für Sie angenommen.', 'Привіт! Я прийняла для вас посилку.'],
      answers: [['Oh, vielen Dank! Das ist sehr nett.', 'О, дуже дякую! Це дуже мило.'], ['Das ist nicht mein Problem.', 'Це не моя проблема.'], ['Ich habe keinen Hunger.', 'Я не голодний.']],
      why: { 1: 'Сусіди в Німеччині часто приймають посилки одне для одного. Варто подякувати.', 2: 'Paket — посилка, не їжа.' },
      react: { 1: 'falsch', 2: 'nicht' } },
    { npc: ['Kein Problem. Sind Sie neu hier?', 'Нема за що. Ви тут нові?'],
      answers: [['Ja, wir sind letzten Monat eingezogen.', 'Так, ми в’їхали минулого місяця.'], ['Nein, ich bin alt.', 'Ні, я старий.'], ['Ja, ich bin neu geboren.', 'Так, я щойно народився.']],
      why: { 1: '«Neu hier» — «нові тут», тобто недавно переїхали, а не про вік.', 2: '«Einziehen» — в’їхати в квартиру.' },
      react: { 1: 'lachen', 2: 'lachen' } },
    { npc: ['Willkommen! Wenn Sie Fragen haben, klingeln Sie einfach.', 'Ласкаво просимо! Якщо будуть питання, просто подзвоніть у двері.'],
      answers: [['Danke, das mache ich gern.', 'Дякую, із задоволенням.'], ['Ich habe kein Telefon.', 'У мене немає телефона.'], ['Klingeln ist verboten.', 'Дзвонити заборонено.']],
      why: { 1: '«Klingeln» тут — подзвонити у двері, телефон не потрібен.', 2: 'Сусідка запрошує звертатися. Ввічливо подякувати.' },
      react: { 1: 'lachen', 2: 'falsch' } },
    { npc: ['Übrigens: Die gelbe Tonne wird morgen geleert.', 'До речі: жовтий бак завтра вивозять.'],
      answers: [['Danke für den Tipp!', 'Дякую за підказку!'], ['Ich mag kein Gelb.', 'Я не люблю жовтий колір.'], ['Welche Tonne ist das?', 'Що це за бак?']],
      why: { 1: 'Ідеться про бак для упаковки, а не про колір.', 2: 'Можна й так спитати, але краще подякувати й подивитися розклад у розділі «Сміття».' },
      react: { 1: 'lachen', 2: 'falsch' } },
  ], end: ['Gern geschehen. Einen schönen Abend noch!', 'Нема за що. Гарного вечора!'] },

  { id: 'bahnhof', emoji: '🚉', name: 'Потяг скасовано', de: 'Am Bahnhof', who: 'Працівник вокзалу', steps: [
    { npc: ['Achtung: Der Zug nach Duisburg fällt heute aus.', 'Увага: потяг до Дуйсбурга сьогодні скасовано.'],
      answers: [['Wie komme ich jetzt nach Duisburg?', 'Як мені тепер дістатися до Дуйсбурга?'], ['Wann fällt er wieder ein?', 'Коли він знову впаде?'], ['Ist er hingefallen?', 'Він упав?']],
      why: { 1: '«Fällt aus» — скасовано, а не «падає».', 2: '«Ausfallen» про потяг означає, що він не поїде.' },
      react: { 1: 'lachen', 2: 'lachen' } },
    { npc: ['Nehmen Sie den Ersatzbus vor dem Bahnhof.', 'Сідайте на автобус замість потяга перед вокзалом.'],
      answers: [['Gilt mein Deutschlandticket auch im Bus?', 'А мій Deutschlandticket діє в автобусі?'], ['Ich möchte einen Bus kaufen.', 'Я хочу купити автобус.'], ['Ich nehme lieber das Flugzeug.', 'Я краще полечу літаком.']],
      why: { 1: '«Nehmen» тут — сісти на транспорт, купувати нічого не треба.', 2: 'Літаком до Дуйсбурга не літають: це поряд.' },
      react: { 1: 'lachen', 2: 'lachen' } },
    { npc: ['Ja, natürlich. Der Bus fährt in zehn Minuten.', 'Так, звичайно. Автобус відправляється за десять хвилин.'],
      answers: [['Von welcher Haltestelle fährt er ab?', 'З якої зупинки він відправляється?'], ['Dann warte ich auf den Zug.', 'Тоді я почекаю на потяг.'], ['Zehn Minuten sind zu lang, fahren Sie früher!', 'Десять хвилин — задовго, їдьте раніше!']],
      why: { 1: 'Потяг скасовано: чекати на нього немає сенсу.', 2: 'Розклад працівник не змінить. Краще спитати, звідки автобус.' },
      react: { 1: 'falsch', 2: 'lachen' } },
    { npc: ['Gleich da vorne, an Bussteig drei.', 'Одразу он там, на автобусній платформі три.'],
      answers: [['Vielen Dank für Ihre Hilfe!', 'Щиро дякую за допомогу!'], ['Danke, du bist nett.', 'Дякую, ти милий.'], ['Wo ist da vorne?', 'А де це там?']],
      why: { 1: 'З працівником вокзалу говорять на «Sie»: «Danke, Sie sind sehr nett».', 2: 'Можна й так, але працівник уже показав рукою. Час подякувати.' },
      react: { 1: 'du', 2: 'falsch' } },
  ], end: ['Gute Fahrt!', 'Щасливої дороги!'] },
];

// every German line that has a clip: what the other person says, the right answers, the reactions
export function lines() {
  const out = Object.values(REACT).map((r) => r[0]);
  for (const s of SCENES) { for (const st of s.steps) { out.push(st.npc[0], st.answers[0][0]); } out.push(s.end[0]); }
  return out;
}
