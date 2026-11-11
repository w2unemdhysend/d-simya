// "Куди це викинути?": everyday things and where they go in Xanten. Each item: [Ukrainian name, other words people
// type, German name, where, note]. The places and their rules are the same as in the guide on the page (from the
// city's waste calendar); where a household has no Biotonne, kitchen scraps go into the grey bin.
export const WHERE = {
  rest:      { name: 'Сірий бак', de: 'Restmüll', color: '#4A5258' },
  papier:    { name: 'Синій бак', de: 'Papier', color: '#2F5DB3' },
  gelb:      { name: 'Жовтий бак або мішок', de: 'Gelbe Tonne', color: '#E8C10A' },
  bio:       { name: 'Коричневий бак', de: 'Biotonne', color: '#7A4A2E' },
  glas:      { name: 'Контейнер для скла', de: 'Altglas', color: '#5E8C61', note: 'За кольором: біле, зелене, коричневе; інше кольорове в зелений. Без кришок, удень у будні.' },
  pfand:     { name: 'Автомат у супермаркеті', de: 'Pfand', color: '#C8402C', note: 'Автомат друкує чек, гроші повертають на касі.' },
  batt:      { name: 'Коробка для батарейок у магазині', de: 'Batteriesammelbox', color: '#7B3F98', note: 'Стоїть біля кас у супермаркетах і в dm та Rossmann.' },
  schad:     { name: 'Schadstoffmobil', de: 'Schadstoffe', color: '#7B3F98', note: 'Пересувний пункт приймає небезпечні речовини кілька разів на рік; дата є нижче в «Фарби, хімія, батарейки».' },
  elektro:   { name: 'Wertstoffhof у Біртені або магазин техніки', de: 'Elektroschrott', color: '#3E7C8C', note: 'Дрібну техніку (до 25 см) також беруть великі супермаркети й магазини електроніки. Велику забирають за заявкою.' },
  sperr:     { name: 'Вивіз великих речей за заявкою', de: 'Sperrmüll', color: '#8A6D3B', note: 'Заявка на xanten.de, або відвезти самому на Wertstoffhof у Біртені.' },
  hof:       { name: 'Wertstoffhof у Біртені', de: 'Wertstoffhof', color: '#3E7C8C', note: 'Bruchweg 14. Візьми документ із фото.' },
  kleider:   { name: 'Контейнер для одягу', de: 'Altkleidercontainer', color: '#B0567A', note: 'Тільки чисте й придатне до носіння, у зав’язаному пакеті. Зношене й брудне: у сірий бак.' },
};
const I = (uk, also, de, to, note) => ({ uk, also, de, to, note });
export const ITEMS = [
  // grey bin
  I('підгузки', 'памперси', 'Windeln', 'rest'),
  I('недопалки', 'сигарети цигарки окурки', 'Zigarettenkippen', 'rest'),
  I('мішок із пилососа, пил', 'пилосос пилюка', 'Staubsaugerbeutel', 'rest'),
  I('паперові хустинки й серветки', 'серветка носовичок кухонний рушник', 'Taschentücher, Küchenpapier', 'rest', 'Використаний папір не переробляють.'),
  I('касовий чек', 'чеки квитанція', 'Kassenbon', 'rest', 'Термопапір не можна в синій бак.'),
  I('розбита чашка, тарілка, кераміка', 'порцеляна посуд горщик', 'Porzellan, Keramik', 'rest', 'Не в контейнер для скла.'),
  I('розбита склянка, дзеркало', 'скло склянка стакан люстерко', 'Trinkglas, Spiegel', 'rest', 'Це інше скло, ніж пляшки: не в контейнер для скла. Загорни, щоб ніхто не порізався.'),
  I('попіл', 'зола вугілля гриль', 'Asche', 'rest', 'Тільки холодний.'),
  I('котячий наповнювач', 'кіт туалет лоток наповнювач', 'Katzenstreu', 'rest'),
  I('зубна щітка', 'щітка', 'Zahnbürste', 'rest'),
  I('губка, ганчірка', 'мочалка серветка для прибирання', 'Schwamm, Putzlappen', 'rest'),
  I('ватні диски й палички', 'вата пластир бинт', 'Wattepads, Pflaster', 'rest'),
  I('жуйка', 'жувальна гумка', 'Kaugummi', 'rest'),
  I('свічка, недогарок', 'віск', 'Kerzenreste', 'rest'),
  I('лампочка розжарювання, галогенна', 'лампа стара звичайна', 'Glühbirne, Halogenlampe', 'rest', 'Енергоощадні та LED-лампи: на Wertstoffhof.'),
  I('брудна коробка від піци', 'піца жирний картон', 'verschmutzter Pizzakarton', 'rest', 'Чиста коробка або чиста кришка: у синій бак.'),
  I('папір для випікання', 'пергамент', 'Backpapier', 'rest'),
  I('ручка, фломастер', 'олівець маркер', 'Kugelschreiber, Filzstift', 'rest'),
  I('фотографії', 'фото знімки', 'Fotos', 'rest'),
  I('диски CD, DVD', 'диск', 'CDs, DVDs', 'rest', 'Багато дисків краще відвезти на Wertstoffhof.'),
  I('зношений одяг і взуття', 'діряві шкарпетки ганчір’я старе взуття', 'kaputte Kleidung, Schuhe', 'rest', 'Придатне до носіння: у контейнер для одягу.'),
  I('залишки їжі, м’ясо, кістки', 'недоїдки варене риба', 'Speisereste, Fleisch, Knochen', 'rest'),
  I('стара харчова олія, жир', 'олія фритюр масло смалець', 'Speiseöl, Frittierfett', 'rest', 'Злий у пляшку чи банку й закрий. Не в раковину й не в унітаз: труби забиваються.'),
  I('ліки', 'таблетки сироп пігулки мазь', 'Medikamente', 'rest', 'Не в раковину й не в унітаз. Порожні блістери та пляшечки: у жовтий бак і скло. Можна здати й на Schadstoffmobil.'),
  I('волосся, нігті', '', 'Haare', 'rest'),
  // paper
  I('газети й журнали', 'газета журнал реклама проспекти', 'Zeitungen, Zeitschriften, Prospekte', 'papier'),
  I('картонна коробка', 'картон коробки посилка упаковка', 'Karton, Pappe', 'papier', 'Склади плоско.'),
  I('чиста коробка від піци', 'піца', 'sauberer Pizzakarton', 'papier', 'Жирну частину відірви й кинь у сірий бак.'),
  I('коробка від яєць', 'лоток яйця', 'Eierkarton', 'papier'),
  I('конверти, листи', 'конверт лист пошта', 'Briefumschläge', 'papier', 'З віконцем теж можна.'),
  I('книги, зошити', 'книга зошит блокнот', 'Bücher, Hefte', 'papier'),
  I('паперовий пакет', 'торбинка паперова', 'Papiertüte', 'papier'),
  I('втулка від туалетного паперу', 'рулон трубка', 'Papprolle', 'papier'),
  // yellow bin
  I('стаканчик від йогурту', 'йогурт сметана баночка пластикова', 'Joghurtbecher', 'gelb', 'Порожній, мити не треба.'),
  I('пакет від молока чи соку', 'тетрапак молоко сік', 'Getränkekarton (Tetra Pak)', 'gelb'),
  I('консервна бляшанка', 'банка консерви жерстяна', 'Konservendose', 'gelb'),
  I('алюмінієва фольга', 'фольга алюміній', 'Alufolie', 'gelb'),
  I('пляшка від шампуню, миючого', 'шампунь гель флакон пластикова пляшка', 'Shampooflasche, Spülmittelflasche', 'gelb'),
  I('пластиковий пакет, плівка', 'пакет плівка кульок торбинка', 'Plastiktüte, Folie', 'gelb'),
  I('кришки, корки від пляшок', 'кришка корок металева', 'Deckel, Kronkorken', 'gelb'),
  I('пінопласт з упаковки', 'пінопласт', 'Styropor-Verpackung', 'gelb'),
  I('порожній блістер від таблеток', 'блістер упаковка ліків', 'leere Tablettenblister', 'gelb'),
  I('тюбик від зубної пасти', 'тюбик паста крем', 'Zahnpastatube', 'gelb'),
  I('порожній аерозольний балон', 'дезодорант лак спрей балончик', 'leere Spraydose', 'gelb', 'Із залишками: на Schadstoffmobil.'),
  I('кавові капсули', 'капсула кава', 'Kaffeekapseln', 'gelb'),
  I('пакет від чипсів, обгортка', 'чипси цукерки фантик обгортка', 'Chipstüte, Verpackung', 'gelb'),
  I('сітка від фруктів', 'сітка апельсини картопля', 'Obstnetz', 'gelb'),
  // organic
  I('очистки овочів і фруктів', 'лушпиння шкірки картопля банан яблуко', 'Obst- und Gemüseschalen', 'bio'),
  I('кавова гуща з фільтром', 'кава гуща фільтр', 'Kaffeesatz, Filter', 'bio'),
  I('чайні пакетики', 'чай заварка', 'Teebeutel', 'bio'),
  I('яєчна шкаралупа', 'яйця шкаралупа', 'Eierschalen', 'bio'),
  I('квіти, листя, трава', 'букет рослини бур’ян газон', 'Blumen, Laub, Rasenschnitt', 'bio', 'Багато зелені й гілки: на Wertstoffhof.'),
  // glass
  I('скляна банка', 'банка огірки варення слоїк', 'Konservenglas', 'glas'),
  I('пляшка від вина чи олії', 'вино олія оцет пляшка скляна', 'Weinflasche, Ölflasche', 'glas', 'Без Pfand. Пляшки з Pfand: в автомат.'),
  I('флакон від парфумів', 'парфуми духи', 'Parfümflakon', 'glas'),
  // deposit
  I('пластикова пляшка від води чи коли', 'вода кола лимонад пляшка пет', 'PET-Flasche mit Pfand', 'pfand', '25 центів за пляшку. Не зминай: автомат читає етикетку.'),
  I('бляшанка від напою', 'банка пиво кола енергетик', 'Getränkedose', 'pfand', '25 центів.'),
  I('пивна пляшка, ящик', 'пиво скляна пляшка ящик', 'Bierflasche, Kasten', 'pfand', '8 або 15 центів за пляшку.'),
  // batteries, hazardous
  I('батарейки', 'батарейка пальчикові акумулятор', 'Batterien, Akkus', 'batt'),
  I('фарба, лак', 'фарби емаль', 'Farben, Lacke', 'schad'),
  I('розчинник, бензин', 'ацетон уайт-спірит', 'Lösungsmittel', 'schad'),
  I('побутова хімія із залишками', 'хлор засіб для труб очисник', 'Reinigungsmittel mit Inhalt', 'schad', 'Порожня пляшка: у жовтий бак.'),
  I('ртутний термометр', 'градусник ртуть', 'Quecksilberthermometer', 'schad'),
  I('моторна олія', 'мастило авто', 'Altöl', 'schad', 'Магазин, де купували олію, теж мусить прийняти стару.'),
  I('засоби від комах і бур’янів', 'отрута пестициди', 'Pflanzenschutzmittel', 'schad'),
  // electronics
  I('телефон, планшет', 'смартфон мобільний', 'Handy, Tablet', 'elektro', 'Спершу видали свої дані.'),
  I('кабель, зарядка, навушники', 'зарядний пристрій шнур', 'Kabel, Ladegerät', 'elektro'),
  I('фен, тостер, чайник', 'праска блендер дрібна техніка', 'Elektrokleingeräte', 'elektro'),
  I('енергоощадна або LED-лампа', 'лампочка led світлодіодна люмінесцентна', 'Energiesparlampe, LED', 'elektro', 'Не розбивай: в енергоощадних є ртуть.'),
  I('холодильник, пральна машина', 'плита морозилка велика техніка', 'Kühlschrank, Waschmaschine', 'elektro'),
  I('телевізор, монітор, комп’ютер', 'ноутбук принтер', 'Fernseher, Computer', 'elektro'),
  I('картридж від принтера', 'тонер чорнило', 'Druckerpatrone', 'elektro'),
  I('електронна сигарета', 'вейп', 'E-Zigarette', 'elektro', 'Через акумулятор не можна в жоден бак.'),
  // bulky, recycling yard, clothes
  I('меблі', 'шафа стіл диван крісло ліжко', 'Möbel', 'sperr'),
  I('матрац', '', 'Matratze', 'sperr'),
  I('килим', 'ковролін', 'Teppich', 'sperr'),
  I('велосипед, дитячий візок', 'ровер коляска', 'Fahrrad, Kinderwagen', 'sperr'),
  I('гілки, обрізки кущів', 'гілка дерево кущ', 'Äste, Strauchschnitt', 'hof'),
  I('метал, каструля, сковорода', 'залізо брухт посуд металевий', 'Schrott, Töpfe, Pfannen', 'hof'),
  I('велика пластикова річ', 'відро тазик іграшка кошик', 'Eimer, Wäschekorb, Spielzeug', 'hof', 'Не упаковка, тому не в жовтий бак. Дрібне можна в сірий.'),
  I('одяг і взуття в доброму стані', 'речі куртка штани сукня', 'Kleidung, Schuhe', 'kleider'),
  I('постільна білизна, рушники', 'простирадло ковдра', 'Bettwäsche, Handtücher', 'kleider'),
];
const norm = (t) => String(t).toLowerCase().replace(/[’'ʼ`]/g, '').replace(/ё/g, 'е').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/\s+/g, ' ').trim();
const INDEX = ITEMS.map((it) => ({ it, uk: norm(it.uk), all: norm(it.uk + ' ' + it.also + ' ' + it.de) }));

// Items matching what was typed (every word, as a beginning of some word of the item), names first
export function find(q, max = 8) {
  const words = norm(q).split(' ').filter((w) => w.length >= 2);
  if (!words.length) return [];
  const starts = (text, w) => text.startsWith(w) || text.includes(' ' + w);
  return INDEX.filter((x) => words.every((w) => starts(x.all, w)))
    .sort((a, b) => (words.every((w) => starts(b.uk, w)) ? 1 : 0) - (words.every((w) => starts(a.uk, w)) ? 1 : 0))
    .slice(0, max).map((x) => x.it);
}
// Where the item goes for this household: without a Biotonne, kitchen scraps go into the grey bin
export function whereFor(item, hasBio) {
  if (item.to === 'bio' && !hasBio) return { ...WHERE.rest, key: 'rest', note: 'Біо-бака у вас немає, тому в сірий.' };
  return { ...WHERE[item.to], key: item.to };
}
