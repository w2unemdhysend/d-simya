// Sentences for "Збери речення". t: the words as cards (in their usual spelling: nouns and "Sie" capitalised, the rest
// small); ok: every order that is right (the first is the one spoken); r: the rule shown after; lv: level 1–4.
// Commas and the final mark are not cards: the answer is compared without them.
export const RULES = {
  v2: 'Дієслово стоїть на другому місці. Перше місце може зайняти підмет або, наприклад, час чи місце: «Heute ist…», «In Xanten wohne ich».',
  frage: 'У питанні без питального слова дієслово йде першим: «Haben Sie…?». З питальним словом (wo, wann, wie) — на другому місці: «Wann fährt…?»',
  trenn: 'Відокремлювана частина дієслова (an-, ab-, auf-, aus-, ein-, um-) іде в самий кінець: anrufen → «Ich rufe Sie morgen an».',
  modal: 'Модальне дієслово (können, müssen, möchten, dürfen, sollen) стоїть на другому місці, а головне дієслово — у кінці, без змін: «Ich muss … gehen».',
  perfekt: 'Минулий час Perfekt: haben або sein на другому місці, а дієприкметник (bekommen, gefahren) — у самому кінці.',
  neben: 'Після weil, dass, wenn, ob, wo дієслово йде в самий кінець своєї частини речення: «…, weil ich krank bin».',
};
export const LEVELS = [
  { lv: 1, name: 'Дієслово на 2-му місці', short: 'Основа' },
  { lv: 2, name: 'Відокремлювані й модальні дієслова', short: 'Дієслово в кінці' },
  { lv: 3, name: 'Минулий час (Perfekt)', short: 'Perfekt' },
  { lv: 4, name: 'Підрядні речення: weil, dass, wenn', short: 'weil, dass' },
];
const S = (lv, r, t, uk, ...ok) => ({ lv, r, t: t.split(' '), uk, ok });
export const SENTENCES = [
  S(1, 'v2', 'ich wohne in Xanten', 'Я живу в Ксантені.', 'Ich wohne in Xanten.', 'In Xanten wohne ich.'),
  S(1, 'v2', 'der Bus kommt um acht Uhr', 'Автобус приходить о восьмій.', 'Der Bus kommt um acht Uhr.', 'Um acht Uhr kommt der Bus.'),
  S(1, 'v2', 'heute ist der Supermarkt geschlossen', 'Сьогодні супермаркет зачинений.', 'Heute ist der Supermarkt geschlossen.', 'Der Supermarkt ist heute geschlossen.'),
  S(1, 'frage', 'wo ist die Apotheke', 'Де аптека?', 'Wo ist die Apotheke?'),
  S(1, 'frage', 'haben Sie einen Termin', 'У вас є запис?', 'Haben Sie einen Termin?'),
  S(1, 'v2', 'am Sonntag sind die Geschäfte zu', 'У неділю магазини зачинені.', 'Am Sonntag sind die Geschäfte zu.', 'Die Geschäfte sind am Sonntag zu.'),
  S(1, 'frage', 'wann fährt der nächste Zug', 'Коли відправляється наступний потяг?', 'Wann fährt der nächste Zug?'),
  S(1, 'v2', 'meine Mutter arbeitet in Wesel', 'Моя мама працює у Везелі.', 'Meine Mutter arbeitet in Wesel.', 'In Wesel arbeitet meine Mutter.'),
  S(1, 'frage', 'sprechen Sie Ukrainisch', 'Ви говорите українською?', 'Sprechen Sie Ukrainisch?'),
  S(1, 'v2', 'im Winter wird es früh dunkel', 'Взимку рано темніє.', 'Im Winter wird es früh dunkel.', 'Es wird im Winter früh dunkel.'),
  S(2, 'trenn', 'ich rufe Sie morgen an', 'Я зателефоную вам завтра.', 'Ich rufe Sie morgen an.', 'Morgen rufe ich Sie an.'),
  S(2, 'trenn', 'der Zug fährt um neun ab', 'Потяг відправляється о дев’ятій.', 'Der Zug fährt um neun ab.', 'Um neun fährt der Zug ab.'),
  S(2, 'trenn', 'ich kaufe im Supermarkt ein', 'Я купую продукти в супермаркеті.', 'Ich kaufe im Supermarkt ein.', 'Im Supermarkt kaufe ich ein.'),
  S(2, 'trenn', 'bitte füllen Sie das Formular aus', 'Заповніть, будь ласка, формуляр.', 'Bitte füllen Sie das Formular aus.', 'Füllen Sie bitte das Formular aus.', 'Füllen Sie das Formular bitte aus.'),
  S(2, 'modal', 'ich muss morgen zum Arzt gehen', 'Завтра мені треба йти до лікаря.', 'Ich muss morgen zum Arzt gehen.', 'Morgen muss ich zum Arzt gehen.'),
  S(2, 'modal', 'können Sie mir helfen', 'Можете мені допомогти?', 'Können Sie mir helfen?'),
  S(2, 'modal', 'ich möchte ein Konto eröffnen', 'Я хочу відкрити рахунок.', 'Ich möchte ein Konto eröffnen.'),
  S(2, 'modal', 'hier darf man nicht rauchen', 'Тут не можна палити.', 'Hier darf man nicht rauchen.', 'Man darf hier nicht rauchen.'),
  S(2, 'trenn', 'wir ziehen im Dezember um', 'Ми переїжджаємо в грудні.', 'Wir ziehen im Dezember um.', 'Im Dezember ziehen wir um.'),
  S(2, 'modal', 'du sollst den Müll rausbringen', 'Тобі треба винести сміття.', 'Du sollst den Müll rausbringen.'),
  S(3, 'perfekt', 'ich habe den Brief bekommen', 'Я отримав лист.', 'Ich habe den Brief bekommen.', 'Den Brief habe ich bekommen.'),
  S(3, 'perfekt', 'wir sind gestern nach Duisburg gefahren', 'Учора ми їздили в Дуйсбург.', 'Wir sind gestern nach Duisburg gefahren.', 'Gestern sind wir nach Duisburg gefahren.'),
  S(3, 'perfekt', 'hast du schon gegessen', 'Ти вже поїв?', 'Hast du schon gegessen?'),
  S(3, 'perfekt', 'der Bus ist zu spät gekommen', 'Автобус приїхав запізно.', 'Der Bus ist zu spät gekommen.'),
  S(3, 'perfekt', 'ich habe meinen Schlüssel verloren', 'Я загубив свій ключ.', 'Ich habe meinen Schlüssel verloren.', 'Meinen Schlüssel habe ich verloren.'),
  S(3, 'perfekt', 'sie hat den Termin abgesagt', 'Вона скасувала запис.', 'Sie hat den Termin abgesagt.', 'Den Termin hat sie abgesagt.'),
  S(3, 'perfekt', 'wir haben eine Wohnung gefunden', 'Ми знайшли квартиру.', 'Wir haben eine Wohnung gefunden.', 'Eine Wohnung haben wir gefunden.'),
  S(3, 'perfekt', 'das Paket ist heute angekommen', 'Посилка прийшла сьогодні.', 'Das Paket ist heute angekommen.', 'Heute ist das Paket angekommen.'),
  S(3, 'perfekt', 'ich bin um sieben aufgestanden', 'Я встав о сьомій.', 'Ich bin um sieben aufgestanden.', 'Um sieben bin ich aufgestanden.'),
  S(3, 'perfekt', 'haben Sie den Antrag abgegeben', 'Ви подали заяву?', 'Haben Sie den Antrag abgegeben?'),
  S(4, 'neben', 'ich komme nicht weil ich krank bin', 'Я не прийду, бо захворів.', 'Ich komme nicht, weil ich krank bin.', 'Weil ich krank bin, komme ich nicht.'),
  S(4, 'neben', 'ich weiß nicht ob der Laden offen ist', 'Я не знаю, чи магазин відчинений.', 'Ich weiß nicht, ob der Laden offen ist.'),
  S(4, 'neben', 'er sagt dass der Zug ausfällt', 'Він каже, що потяг скасовано.', 'Er sagt, dass der Zug ausfällt.'),
  S(4, 'neben', 'wenn es regnet nehme ich den Bus', 'Коли йде дощ, я їду автобусом.', 'Wenn es regnet, nehme ich den Bus.', 'Ich nehme den Bus, wenn es regnet.'),
  S(4, 'neben', 'ich lerne Deutsch weil ich hier arbeiten möchte', 'Я вчу німецьку, бо хочу тут працювати.', 'Ich lerne Deutsch, weil ich hier arbeiten möchte.', 'Weil ich hier arbeiten möchte, lerne ich Deutsch.'),
  S(4, 'neben', 'können Sie mir sagen wo die Haltestelle ist', 'Можете сказати, де зупинка?', 'Können Sie mir sagen, wo die Haltestelle ist?'),
  S(4, 'neben', 'ich hoffe dass Sie bald Zeit haben', 'Сподіваюся, що ви скоро матимете час.', 'Ich hoffe, dass Sie bald Zeit haben.'),
  S(4, 'neben', 'wir bleiben zu Hause weil es stürmt', 'Ми лишаємося вдома, бо надворі буря.', 'Wir bleiben zu Hause, weil es stürmt.', 'Weil es stürmt, bleiben wir zu Hause.'),
  S(4, 'neben', 'rufen Sie mich an wenn das Paket kommt', 'Зателефонуйте мені, коли прийде посилка.', 'Rufen Sie mich an, wenn das Paket kommt.', 'Wenn das Paket kommt, rufen Sie mich an.'),
  S(4, 'neben', 'ich glaube dass die Post heute zu ist', 'Здається, пошта сьогодні зачинена.', 'Ich glaube, dass die Post heute zu ist.', 'Ich glaube, dass heute die Post zu ist.'),
];
// the words of a sentence as written, without commas and the final mark, small first letter
export const bare = (s) => s.replace(/[,.?!]/g, '').trim().split(/\s+/).map((w, i) => (i === 0 ? w[0].toLowerCase() + w.slice(1) : w)).join(' ');
// the cards in order → is it one of the right orders? (the first word may be capitalised or not)
export function isRight(sentence, cards) {
  const got = bare(cards.join(' '));
  return sentence.ok.some((o) => bare(o) === got);
}
// How many cards from the start already stand right, measured against the closest right order
export function rightFromStart(sentence, cards) {
  let best = 0;
  for (const o of sentence.ok) {
    const want = bare(o).split(' '), got = bare(cards.join(' ')).split(' ');
    let i = 0; while (i < got.length && got[i] === want[i]) i++;
    best = Math.max(best, i);
  }
  return best;
}
