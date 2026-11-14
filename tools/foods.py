"""Builds yizha/foods.js, the food list of «Харчування», from the German nutrient database BLS 4.0.

  python3 tools/foods.py /path/to/BLS_4_0_Daten_2025_DE.xlsx      (needs openpyxl: pip install openpyxl)

BLS 4.0: Max Rubner-Institut (2025), Bundeslebensmittelschlüssel (BLS), Version 4.0, Deutsche Nährstoffdatenbank,
Karlsruhe, DOI 10.25826/Data20251217-134202-0. Licence CC BY 4.0. Download: https://blsdb.de/download (about 14 MB,
not kept in the repository).

Every food below names its BLS entry by the exact German name (a regular expression over the whole name). The script
takes kcal, protein, fat and available carbohydrates per 100 g from that entry, so the numbers are never typed by hand.
Ukrainian dishes the BLS lacks (вареники, голубці, …) are summed from BLS ingredients (RECIPES): raw weights, then the
weight of the finished dish.

A food: (BLS name, Ukrainian name, German name for the shop label, icon, category, portions, other names to search by).
The icon is an emoji; '' means «невідомо»: the page draws a neutral plate with a question mark instead of a guess.
Portions: (what, grams); liquids are counted in millilitres as grams (milk, juice: close enough for a diary).
"""
import json, re, sys
import openpyxl

CATS = [
    ('bread', 'Хліб і випічка', '🍞'), ('grain', 'Крупи, каші, макарони', '🥣'), ('veg', 'Овочі', '🥦'), ('fruit', 'Фрукти й ягоди', '🍎'),
    ('milk', 'Молочне', '🥛'), ('cheese', 'Сир', '🧀'), ('egg', 'Яйця', '🥚'), ('meat', 'М’ясо', '🥩'), ('bird', 'Птиця', '🍗'),
    ('sausage', 'Ковбаси й шинка', '🌭'), ('fish', 'Риба', '🐟'), ('legume', 'Бобові, горіхи, насіння', '🥜'),
    ('fat', 'Олія, масло, соуси', '🫒'), ('sweet', 'Солодке й снеки', '🍫'), ('drink', 'Напої', '☕'), ('dish', 'Страви', '🍲'),
]
SLICE, PIECE, GLASS, CUP, SPOON, TSP, PLATE, BOWL = 'скибка', 'шт.', 'склянка 250 мл', 'чашка 200 мл', 'ст. ложка', 'ч. ложка', 'тарілка', 'миска'

F = [
    # ---- bread
    (r'Roggenmischbrot', 'Хліб житньо-пшеничний', 'Roggenmischbrot', '🍞', 'bread', [(SLICE, 40)], 'чорний хліб сірий'),
    (r'Weizenmischbrot', 'Хліб пшеничний', 'Weizenmischbrot', '🍞', 'bread', [(SLICE, 35)], 'білий хліб батон'),
    (r'Vollkornbrot', 'Хліб цільнозерновий', 'Vollkornbrot', '🍞', 'bread', [(SLICE, 45)], 'цільнозерновий'),
    (r'Pumpernickel', 'Пумперникель', 'Pumpernickel', '🍞', 'bread', [(SLICE, 40)], 'житній чорний'),
    (r'Weizentoastbrot/Buttertoastbrot', 'Тостовий хліб', 'Toastbrot', '🍞', 'bread', [(SLICE, 25)], 'тост'),
    (r'Weizenvollkorntoastbrot', 'Тостовий хліб цільнозерновий', 'Vollkorntoast', '🍞', 'bread', [(SLICE, 28)], 'тост'),
    (r'Weizenbrötchen', 'Булочка пшенична', 'Brötchen', '🥖', 'bread', [(PIECE, 55)], 'бреченьхен брьотхен'),
    (r'Weizenbrötchen mit Sesam', 'Булочка з кунжутом', 'Sesambrötchen', '🥖', 'bread', [(PIECE, 60)], ''),
    (r'Weizenbaguette', 'Багет', 'Baguette', '🥖', 'bread', [('шматок 10 см', 50)], 'французький'),
    (r'Laugenbrezel mit Butter', 'Брецель з маслом', 'Butterbrezel', '🥨', 'bread', [(PIECE, 90)], 'крендель'),
    (r'Salzbrezeln/Salzstangen \(Laugendauergebäck\)', 'Солоні крендельки, соломка', 'Salzstangen', '🥨', 'bread', [('жменя', 30)], 'снек'),
    (r'Croissant \(Hefeblätterteig/Plunderteig\)', 'Круасан', 'Croissant', '🥐', 'bread', [(PIECE, 60)], ''),
    (r'Weizenfladenbrot', 'Лаваш, пита', 'Fladenbrot', '🫓', 'bread', [('четвертина', 70)], 'коржик'),
    (r'Weizentortilla', 'Тортилья', 'Wrap / Tortilla', '🫓', 'bread', [(PIECE, 60)], 'лаваш рап'),
    (r'Knäckebrot glutenfrei, laktosefrei', 'Хлібці хрусткі', 'Knäckebrot', '🍘', 'bread', [(PIECE, 10)], 'хлібці'),
    (r'Weizenbaguettebrötchen', 'Міні-багет', 'Baguettebrötchen', '🥖', 'bread', [(PIECE, 70)], ''),
    # ---- grains (dry and cooked: people weigh both)
    (r'Hafer Flocken', 'Вівсяні пластівці (сухі)', 'Haferflocken', '🥣', 'grain', [(SPOON, 10), ('порція 40 г', 40)], 'вівсянка геркулес'),
    (r'Porridge ungesüßt, mit Milch 3,5 % Fett', 'Вівсяна каша на молоці', 'Porridge mit Milch', '🥣', 'grain', [(PLATE, 250)], 'вівсянка'),
    (r'Porridge ungesüßt, mit Wasser', 'Вівсяна каша на воді', 'Porridge mit Wasser', '🥣', 'grain', [(PLATE, 250)], 'вівсянка'),
    (r'Buchweizen roh', 'Гречка (суха)', 'Buchweizen', '🥣', 'grain', [('порція 60 г', 60)], 'гречана крупа'),
    (r'Buchweizen Grütze, gekocht', 'Гречка варена', 'Buchweizen gekocht', '🥣', 'grain', [(PLATE, 200), (SPOON, 25)], 'гречана каша'),
    (r'Buchweizen gekocht \(mit Fett und Salz\)', 'Гречка з маслом', 'Buchweizen mit Butter', '🥣', 'grain', [(PLATE, 200)], 'гречана каша'),
    (r'Reis poliert, roh', 'Рис білий (сухий)', 'Reis', '🍚', 'grain', [('порція 60 г', 60)], ''),
    (r'Reis poliert, gekocht', 'Рис варений', 'Reis gekocht', '🍚', 'grain', [(PLATE, 200), (SPOON, 25)], ''),
    (r'Reis unpoliert, gekocht', 'Рис бурий варений', 'Naturreis gekocht', '🍚', 'grain', [(PLATE, 200)], 'коричневий'),
    (r'Teigwaren eifrei, roh', 'Макарони (сухі)', 'Nudeln', '🍝', 'grain', [('порція 80 г', 80)], 'паста спагеті'),
    (r'Teigwaren eifrei, gekocht', 'Макарони варені', 'Nudeln gekocht', '🍝', 'grain', [(PLATE, 220)], 'паста спагеті'),
    (r'Vollkorneierteigwaren gekocht', 'Макарони цільнозернові варені', 'Vollkornnudeln gekocht', '🍝', 'grain', [(PLATE, 220)], 'паста'),
    (r'Eierteigwaren gekocht', 'Яєчна локшина варена', 'Eiernudeln gekocht', '🍝', 'grain', [(PLATE, 220)], 'локшина'),
    (r'Hirse roh', 'Пшоно (сухе)', 'Hirse', '🥣', 'grain', [('порція 60 г', 60)], 'пшоняна'),
    (r'Hirse gekocht', 'Пшоняна каша на воді', 'Hirse gekocht', '🥣', 'grain', [(PLATE, 200)], 'пшоно'),
    (r'Bulgur \(Hartweizen\) roh', 'Булгур (сухий)', 'Bulgur', '🥣', 'grain', [('порція 60 г', 60)], ''),
    (r'Bulgur \(Hartweizen\) gekocht', 'Булгур варений', 'Bulgur gekocht', '🥣', 'grain', [(PLATE, 200)], ''),
    (r'Couscous \(Hartweizen\) gekocht', 'Кус-кус варений', 'Couscous gekocht', '🥣', 'grain', [(PLATE, 200)], 'кускус'),
    (r'Gerste Graupen, gekocht', 'Перлова каша', 'Graupen gekocht', '🥣', 'grain', [(PLATE, 200)], 'перловка ячмінна'),
    (r'Quinoa weiß, gekocht', 'Кіноа варена', 'Quinoa gekocht', '', 'grain', [(PLATE, 180)], 'кіноа'),
    (r'Cornflakes ungesüßt', 'Кукурудзяні пластівці', 'Cornflakes', '🥣', 'grain', [('порція 30 г', 30)], 'сухий сніданок'),
    (r'Knuspermüsli \(Granola\) gesüßt, gebacken', 'Гранола', 'Knuspermüsli', '🥣', 'grain', [('порція 40 г', 40)], 'мюслі хрусткі'),
    (r'Müslimischung mit Trockenfrüchten, gesüßt', 'Мюслі з сухофруктами', 'Früchtemüsli', '🥣', 'grain', [('порція 50 г', 50)], ''),
    (r'Milchreis gesüßt, mit Milch 3,5 % Fett', 'Рисова каша на молоці', 'Milchreis', '🥣', 'grain', [(PLATE, 250)], 'молочний рис'),
    # ---- vegetables
    (r'Kartoffel geschält, roh', 'Картопля (сира)', 'Kartoffeln', '🥔', 'veg', [(PIECE, 120)], 'бульба'),
    (r'Kartoffel geschält, gekocht', 'Картопля варена', 'Salzkartoffeln', '🥔', 'veg', [(PIECE, 110), (PLATE, 250)], 'бульба'),
    (r'Kartoffelbrei mit Milch 3,5 % Fett', 'Картопляне пюре', 'Kartoffelpüree', '🥔', 'veg', [(PLATE, 250)], 'товчена'),
    (r'Bratkartoffeln aus Pellkartoffeln, mit Zwiebeln', 'Смажена картопля', 'Bratkartoffeln', '🥔', 'veg', [(PLATE, 200)], 'картопля смажена'),
    (r'Karotte/Möhre, roh', 'Морква', 'Karotte', '🥕', 'veg', [(PIECE, 80)], 'морквина'),
    (r'Speisezwiebel roh', 'Цибуля ріпчаста', 'Zwiebel', '🧅', 'veg', [(PIECE, 100)], ''),
    (r'Frühlingszwiebel/Lauchzwiebel, roh', 'Зелена цибуля', 'Frühlingszwiebel', '🧅', 'veg', [('пучок', 50)], ''),
    (r'Knoblauch roh', 'Часник', 'Knoblauch', '🧄', 'veg', [('зубчик', 5)], ''),
    (r'Tomate roh', 'Помідор', 'Tomate', '🍅', 'veg', [(PIECE, 120)], 'томат'),
    (r'Gurke roh', 'Огірок', 'Gurke', '🥒', 'veg', [(PIECE, 150)], ''),
    (r'Gemüsepaprika rot, roh', 'Перець солодкий', 'Paprika', '🫑', 'veg', [(PIECE, 150)], 'болгарський паприка'),
    (r'Zucchini roh', 'Кабачок, цукіні', 'Zucchini', '🥒', 'veg', [(PIECE, 250)], ''),
    (r'Aubergine roh', 'Баклажан', 'Aubergine', '🍆', 'veg', [(PIECE, 300)], 'синій'),
    (r'Broccoli roh', 'Броколі', 'Brokkoli', '🥦', 'veg', [('порція', 150)], ''),
    (r'Blumenkohl roh', 'Цвітна капуста', 'Blumenkohl', '🥦', 'veg', [('порція', 150)], ''),
    (r'Weißkohl roh', 'Капуста білокачанна', 'Weißkohl', '🥬', 'veg', [('порція', 150)], 'капуста'),
    (r'Rotkohl roh', 'Капуста червона', 'Rotkohl', '🥬', 'veg', [('порція', 150)], ''),
    (r'Chinakohl roh', 'Пекінська капуста', 'Chinakohl', '🥬', 'veg', [('порція', 150)], ''),
    (r'Sauerkraut abgetropft, roh', 'Квашена капуста', 'Sauerkraut', '🥬', 'veg', [('порція', 150)], 'кисла'),
    (r'Kohlrabi roh', 'Кольрабі', 'Kohlrabi', '🥬', 'veg', [(PIECE, 250)], ''),
    (r'Rosenkohl roh', 'Брюссельська капуста', 'Rosenkohl', '🥬', 'veg', [('порція', 150)], ''),
    (r'Spinat roh', 'Шпинат', 'Spinat', '🥬', 'veg', [('порція', 100)], ''),
    (r'Kopfsalat roh', 'Салат листовий', 'Kopfsalat', '🥬', 'veg', [('порція', 50)], 'латук'),
    (r'Eisbergsalat roh', 'Салат айсберг', 'Eisbergsalat', '🥬', 'veg', [('порція', 80)], ''),
    (r'Feldsalat/Rapunzel, roh', 'Салат польовий (фельдзалат)', 'Feldsalat', '🥬', 'veg', [('порція', 50)], 'рапунцель'),
    (r'Rucola roh', 'Рукола', 'Rucola', '🥬', 'veg', [('жменя', 30)], ''),
    (r'Radieschen roh', 'Редиска', 'Radieschen', '', 'veg', [(PIECE, 15)], 'редис'),
    (r'Rote Rübe/Rote Bete, roh', 'Буряк', 'Rote Bete', '', 'veg', [(PIECE, 150)], 'бурячок'),
    (r'Knollensellerie roh', 'Селера коренева', 'Knollensellerie', '', 'veg', [('порція', 100)], ''),
    (r'Porree/Lauch, roh', 'Цибуля-порей', 'Lauch', '', 'veg', [(PIECE, 150)], 'порей'),
    (r'Erbse grün, roh', 'Горошок зелений', 'Erbsen', '🫛', 'veg', [('порція', 80)], 'горох'),
    (r'Zuckermais Konserve, abgetropft', 'Кукурудза консервована', 'Mais (Dose)', '🌽', 'veg', [(SPOON, 30), ('банка', 140)], ''),
    (r'Champignon roh', 'Печериці', 'Champignons', '🍄', 'veg', [('порція', 100)], 'гриби шампіньйони'),
    (r'Kürbis Hokkaido \(C. maxima\) roh', 'Гарбуз', 'Kürbis', '🎃', 'veg', [('порція', 200)], 'хоккайдо'),
    (r'Spargel roh', 'Спаржа', 'Spargel', '', 'veg', [('порція', 200)], 'шпаргель'),
    (r'Bohne grün, roh', 'Квасоля стручкова', 'grüne Bohnen', '🫛', 'veg', [('порція', 150)], ''),
    (r'Avocado roh', 'Авокадо', 'Avocado', '🥑', 'veg', [('половина', 80)], ''),
    (r'Oliven grün, gesäuert, abgetropft', 'Оливки зелені', 'Oliven', '🫒', 'veg', [('5 шт.', 20)], 'маслини'),
    (r'Rettich roh', 'Редька', 'Rettich', '', 'veg', [('порція', 100)], ''),
    (r'Grünkohl gekocht', 'Кале (грюнколь), тушкований', 'Grünkohl', '🥬', 'veg', [('порція', 200)], 'капуста'),
    (r'Gurke gesäuert \(Gewürzgurke\) abgetropft', 'Огірок маринований', 'Gewürzgurke', '🥒', 'veg', [(PIECE, 40)], 'солоний'),
    # ---- fruit
    (r'Apfel roh', 'Яблуко', 'Apfel', '🍎', 'fruit', [(PIECE, 180)], ''),
    (r'Banane roh', 'Банан', 'Banane', '🍌', 'fruit', [(PIECE, 120)], ''),
    (r'Birne roh', 'Груша', 'Birne', '🍐', 'fruit', [(PIECE, 170)], ''),
    (r'Orange roh', 'Апельсин', 'Orange', '🍊', 'fruit', [(PIECE, 200)], ''),
    (r'Mandarine roh', 'Мандарин', 'Mandarine', '🍊', 'fruit', [(PIECE, 70)], ''),
    (r'Grapefruit roh', 'Грейпфрут', 'Grapefruit', '🍊', 'fruit', [('половина', 150)], ''),
    (r'Zitrone roh', 'Лимон', 'Zitrone', '🍋', 'fruit', [('скибочка', 10)], ''),
    (r'Kiwi roh', 'Ківі', 'Kiwi', '🥝', 'fruit', [(PIECE, 75)], ''),
    (r'Weintraube roh', 'Виноград', 'Weintrauben', '🍇', 'fruit', [('жменя', 100)], ''),
    (r'Erdbeere roh', 'Полуниця', 'Erdbeeren', '🍓', 'fruit', [('жменя', 100)], 'суниця'),
    (r'Himbeere roh', 'Малина', 'Himbeeren', '', 'fruit', [('жменя', 80)], ''),
    (r'Heidelbeere roh', 'Чорниця', 'Heidelbeeren', '🫐', 'fruit', [('жменя', 80)], 'лохина'),
    (r'Johannisbeere schwarz roh', 'Смородина чорна', 'schwarze Johannisbeeren', '🫐', 'fruit', [('жменя', 80)], ''),
    (r'Süßkirsche roh', 'Черешня', 'Kirschen', '🍒', 'fruit', [('жменя', 100)], ''),
    (r'Sauerkirsche roh', 'Вишня', 'Sauerkirschen', '🍒', 'fruit', [('жменя', 100)], ''),
    (r'Pflaume roh', 'Слива', 'Pflaume', '', 'fruit', [(PIECE, 35)], ''),
    (r'Pfirsich roh', 'Персик', 'Pfirsich', '🍑', 'fruit', [(PIECE, 150)], ''),
    (r'Aprikose roh', 'Абрикос', 'Aprikose', '🍑', 'fruit', [(PIECE, 45)], ''),
    (r'Nektarine roh', 'Нектарин', 'Nektarine', '🍑', 'fruit', [(PIECE, 150)], ''),
    (r'Wassermelone roh', 'Кавун', 'Wassermelone', '🍉', 'fruit', [('скибка', 300)], ''),
    (r'Honigmelone roh', 'Диня', 'Honigmelone', '🍈', 'fruit', [('скибка', 200)], ''),
    (r'Ananas roh', 'Ананас', 'Ananas', '🍍', 'fruit', [('скибка', 80)], ''),
    (r'Mango roh', 'Манго', 'Mango', '🥭', 'fruit', [(PIECE, 300)], ''),
    (r'Granatapfel roh', 'Гранат', 'Granatapfel', '', 'fruit', [('половина', 120)], ''),
    (r'Apfelkompott/Apfelmark, ungesüßt, Konserve', 'Яблучне пюре без цукру', 'Apfelmark', '🍎', 'fruit', [(SPOON, 20), ('баночка', 100)], ''),
    (r'Korinthe \(Weinbeere getrocknet\)', 'Родзинки', 'Rosinen', '🍇', 'fruit', [('жменя', 30)], 'ізюм'),
    (r'Pflaume getrocknet', 'Чорнослив', 'Trockenpflaumen', '', 'fruit', [('5 шт.', 40)], ''),
    (r'Aprikose getrocknet', 'Курага', 'Getrocknete Aprikosen', '', 'fruit', [('5 шт.', 40)], ''),
    (r'Dattel getrocknet', 'Фініки', 'Datteln', '', 'fruit', [(PIECE, 8)], ''),
    # ---- milk
    (r'Vollmilch frisch, 3,5 % Fett, pasteurisiert', 'Молоко 3,5 %', 'Vollmilch 3,5 %', '🥛', 'milk', [(GLASS, 250), (CUP, 200)], '', 'l'),
    (r'Milch fettarm, frisch, 1,5 % Fett, pasteurisiert', 'Молоко 1,5 %', 'Milch 1,5 %', '🥛', 'milk', [(GLASS, 250), (CUP, 200)], 'нежирне', 'l'),
    (r'Kefir fettarm, mind. 1,5 % bis max. 1,8 % Fett', 'Кефір 1,5 %', 'Kefir 1,5 %', '🥛', 'milk', [(GLASS, 250)], '', 'l'),
    (r'Kefir mind. 3,5 % Fett', 'Кефір 3,5 %', 'Kefir 3,5 %', '🥛', 'milk', [(GLASS, 250)], '', 'l'),
    (r'Buttermilch', 'Маслянка', 'Buttermilch', '🥛', 'milk', [(GLASS, 250)], 'пахта', 'l'),
    (r'Dickmilch/Sauermilch, mind. 3,5 % Fett', 'Кисле молоко', 'Dickmilch', '🥛', 'milk', [(GLASS, 250)], 'простокваша', 'l'),
    (r'Joghurt mild, mind. 3,5 % Fett', 'Йогурт натуральний 3,5 %', 'Naturjoghurt 3,5 %', '🥛', 'milk', [('стаканчик 150 г', 150), (SPOON, 25)], ''),
    (r'Joghurt aus entrahmter Milch, max. 0,5 % Fett', 'Йогурт знежирений', 'Magerjoghurt', '🥛', 'milk', [('стаканчик 150 г', 150)], ''),
    (r'Skyr, Frischkäse < 10 % Fett i. Tr.', 'Скір', 'Skyr', '🥛', 'milk', [('стаканчик 150 г', 150)], 'скир'),
    (r'Speisequark Magerstufe, Magerquark < 10 % Fett i. Tr.', 'Сир кисломолочний знежирений (Magerquark)', 'Magerquark', '🥛', 'milk', [('порція 125 г', 125), (SPOON, 30)], 'творог кварк'),
    (r'Speisequark Halbfettstufe, 20 % Fett i. Tr.', 'Сир кисломолочний 20 %', 'Quark 20 %', '🥛', 'milk', [('порція 125 г', 125)], 'кварк'),
    (r'Speisequark Fettstufe, 40 % Fett i. Tr.', 'Сир кисломолочний 40 %', 'Quark 40 %', '🥛', 'milk', [('порція 125 г', 125)], 'кварк'),
    (r'Körniger Frischkäse < 10 % Fett i. Tr.', 'Зернистий сир', 'Hüttenkäse', '🥛', 'milk', [('порція 100 г', 100)], 'коттедж'),
    (r'Frischkäsezubereitung Natur, mind. 60 % Fett i. Tr.', 'Вершковий сир (Frischkäse)', 'Frischkäse', '🧀', 'milk', [('на бутерброд', 20)], 'філадельфія'),
    (r'Sauerrahm/Saure Sahne, mind. 10 % Fett', 'Сметана 10 %', 'Saure Sahne', '🥛', 'milk', [(SPOON, 20)], ''),
    (r'Sauerrahm/Schmand, mind. 20 % Fett', 'Сметана 20 % (Schmand)', 'Schmand', '🥛', 'milk', [(SPOON, 20)], ''),
    (r'Sauerrahm/Creme fraiche, 30 % Fett', 'Крем-фреш', 'Crème fraîche', '🥛', 'milk', [(SPOON, 20)], ''),
    (r'Schlagsahne mind. 30 % Fett', 'Вершки 30 %', 'Schlagsahne', '🥛', 'milk', [(SPOON, 15)], '', 'l'),
    (r'Kaffeesahne mind. 10 % Fett', 'Вершки до кави 10 %', 'Kaffeesahne', '🥛', 'milk', [(TSP, 7), ('порційні 10 г', 10)], '', 'l'),
    (r'Sojadrink ungesüßt', 'Соєве молоко', 'Sojadrink', '🥛', 'milk', [(GLASS, 250)], '', 'l'),
    (r'Haferdrink ungesüßt', 'Вівсяне молоко', 'Haferdrink', '🥛', 'milk', [(GLASS, 250)], '', 'l'),
    # ---- cheese
    (r'Gouda 48 % Fett i. Tr.', 'Сир гауда', 'Gouda', '🧀', 'cheese', [(SLICE, 20)], 'твердий сир'),
    (r'Edamer mind. 40 % Fett i. Tr.', 'Сир едамер', 'Edamer', '🧀', 'cheese', [(SLICE, 20)], 'твердий сир'),
    (r'Emmentaler mind. 45 % Fett i. Tr.', 'Сир емменталь', 'Emmentaler', '🧀', 'cheese', [(SLICE, 20)], 'твердий сир'),
    (r'Mozzarella mind. 45 % Fett i. Tr.', 'Моцарела', 'Mozzarella', '🧀', 'cheese', [('кулька 125 г', 125)], ''),
    (r'Feta mind. 45 % Fett i. Tr.', 'Фета, бринза', 'Feta', '🧀', 'cheese', [('порція 50 г', 50)], 'бринза овечий'),
    (r'Parmesan mind. 30 % Fett i. Tr.', 'Пармезан', 'Parmesan', '🧀', 'cheese', [(SPOON, 7)], ''),
    (r'Camembert mind. 45 % Fett i. Tr.', 'Камамбер', 'Camembert', '🧀', 'cheese', [('шматок', 30)], ''),
    (r'Gouda mind. 30 % Fett i. Tr.', 'Сир гауда легкий', 'Gouda light', '🧀', 'cheese', [(SLICE, 20)], ''),
    # ---- eggs
    (r'Hühnerei gekocht', 'Яйце варене', 'Ei gekocht', '🥚', 'egg', [(PIECE, 55)], ''),
    (r'Hühnerei roh', 'Яйце (сире)', 'Ei', '🥚', 'egg', [(PIECE, 55)], ''),
    (r'Spiegelei gebraten', 'Яєчня', 'Spiegelei', '🍳', 'egg', [('з 1 яйця', 55), ('з 2 яєць', 110)], 'глазунья'),
    (r'Rührei gebraten', 'Омлет, бовтанка', 'Rührei', '🍳', 'egg', [('з 2 яєць', 130)], 'омлет'),
    (r'Hühnerei Eiklar, roh', 'Яєчний білок', 'Eiweiß', '🥚', 'egg', [(PIECE, 33)], ''),
    # ---- meat
    (r'Schwein Schnitzel \(Nuss\) roh', 'Свинина пісна (шніцель), сира', 'Schweineschnitzel', '🥩', 'meat', [('шматок', 150)], ''),
    (r'Schweineschnitzel natur, gebraten', 'Свинячий шніцель смажений', 'Schnitzel natur', '🥩', 'meat', [('шматок', 120)], 'відбивна'),
    (r'Wiener Schnitzel gebraten', 'Шніцель у паніровці', 'Wiener Schnitzel', '🥩', 'meat', [('шматок', 150)], 'відбивна'),
    (r'Schwein Filet/Lende, roh', 'Свиняча вирізка, сира', 'Schweinefilet', '🥩', 'meat', [('порція', 150)], ''),
    (r'Schweinekotelett natur, gebraten', 'Свиняча котлета на кістці, смажена', 'Kotelett', '🥩', 'meat', [('шматок', 150)], 'корейка'),
    (r'Schwein Hackfleisch, roh', 'Фарш свинячий', 'Schweinehack', '🥩', 'meat', [('порція', 125)], ''),
    (r'Rind Hackfleisch, roh', 'Фарш яловичий', 'Rinderhack', '🥩', 'meat', [('порція', 125)], ''),
    (r'Rind Steak \(Rücken\) roh', 'Яловичина (стейк), сира', 'Rindersteak', '🥩', 'meat', [('порція', 180)], 'стейк'),
    (r'Rindersteak gegrillt', 'Стейк яловичий смажений', 'Steak', '🥩', 'meat', [('порція', 150)], ''),
    (r'Gulasch \(mit Rindfleisch\)', 'Гуляш яловичий', 'Rindergulasch', '🍲', 'meat', [(PLATE, 250)], ''),
    (r'Frikadellen gebraten', 'Котлета (фрикаделька) смажена', 'Frikadelle', '🍖', 'meat', [(PIECE, 90)], 'котлета'),
    (r'Hähnchen Leber, roh', 'Печінка куряча', 'Hähnchenleber', '', 'meat', [('порція', 120)], ''),
    (r'Leberkäse', 'Леберкезе', 'Leberkäse', '🍖', 'meat', [(SLICE, 100)], 'м’ясний хліб'),
    # ---- poultry
    (r'Hähnchen Brustfilet, roh', 'Куряче філе, сире', 'Hähnchenbrust', '🍗', 'bird', [('філе', 180)], 'курка грудка'),
    (r'Hähnchen Brustfilet, gegrillt', 'Куряче філе смажене, гриль', 'Hähnchenbrust gegrillt', '🍗', 'bird', [('філе', 150)], 'курка грудка'),
    (r'Hähnchen Brustfilet, gekocht', 'Куряче філе варене', 'Hähnchenbrust gekocht', '🍗', 'bird', [('філе', 150)], 'курка грудка'),
    (r'Hähnchen Oberschenkel, mit Haut, roh', 'Куряче стегно зі шкірою, сире', 'Hähnchenschenkel', '🍗', 'bird', [(PIECE, 150)], 'курка ніжка'),
    (r'Hähnchen Unterschenkel, mit Haut, roh', 'Куряча гомілка, сира', 'Hähnchenunterschenkel', '🍗', 'bird', [(PIECE, 100)], 'курка ніжка'),
    (r'Pute Brust, ohne Haut, roh', 'Індиче філе, сире', 'Putenbrust', '🍗', 'bird', [('порція', 150)], 'індичка'),
    (r'Putenschnitzel paniert, gebraten', 'Індичий шніцель у паніровці', 'Putenschnitzel paniert', '🍗', 'bird', [('шматок', 150)], ''),
    (r'Geflügel Dönerfleisch, gegrillt', 'М’ясо для дьонера (птиця)', 'Dönerfleisch', '🍗', 'bird', [('порція', 100)], 'шаурма'),
    # ---- sausage & ham
    (r'Schwein Kochschinken, Kochpökelware', 'Шинка варена', 'Kochschinken', '🥓', 'sausage', [(SLICE, 20)], ''),
    (r'Salami', 'Салямі', 'Salami', '🍕', 'sausage', [(SLICE, 8)], 'ковбаса копчена'),
    (r'Wiener Würstchen', 'Сосиски', 'Wiener Würstchen', '🌭', 'sausage', [(PIECE, 50)], 'сосиска'),
    (r'Bockwurst', 'Сарделька', 'Bockwurst', '🌭', 'sausage', [(PIECE, 90)], ''),
    (r'Rostbratwurst', 'Ковбаска для смаження', 'Bratwurst', '🌭', 'sausage', [(PIECE, 100)], 'братвурст'),
    (r'Currybratwurst', 'Каррівурст', 'Currywurst', '🌭', 'sausage', [('порція', 150)], ''),
    (r'Fleischwurst', 'Ковбаса варена', 'Fleischwurst', '🌭', 'sausage', [(SLICE, 15)], 'лікарська'),
    (r'Bauernleberwurst', 'Ліверна ковбаса', 'Leberwurst', '', 'sausage', [('на бутерброд', 20)], 'паштет'),
    (r'Putenbrust, Kochpökelware, geräuchert', 'Грудка індича (нарізка)', 'Putenbrust Aufschnitt', '🥓', 'sausage', [(SLICE, 15)], ''),
    (r'Schwein Bauchspeck, Rohpökelware, geräuchert', 'Бекон, грудинка', 'Bauchspeck', '🥓', 'sausage', [(SLICE, 15)], 'сало'),
    (r'Schwein Speck/Rückenspeck \(grüner Speck\) roh', 'Сало', 'Rückenspeck', '🥓', 'sausage', [('шматочок', 20)], 'шпик'),
    # ---- fish
    (r'Lachs roh', 'Лосось', 'Lachs', '🐟', 'fish', [('філе', 125)], 'сьомга'),
    (r'Lachs geräuchert \(Räucherlachs\)', 'Лосось слабосолений, копчений', 'Räucherlachs', '🐟', 'fish', [(SLICE, 20)], 'сьомга'),
    (r'Dorsch/Kabeljau, roh', 'Тріска', 'Kabeljau', '🐟', 'fish', [('філе', 150)], ''),
    (r'Köhler/Seelachs, roh', 'Минтай, сайда', 'Seelachs', '🐟', 'fish', [('філе', 150)], ''),
    (r'Forelle roh', 'Форель', 'Forelle', '🐟', 'fish', [('філе', 125)], ''),
    (r'Thunfisch im eigenen Saft, Konserve, abgetropft', 'Тунець у власному соку', 'Thunfisch (Dose)', '🐟', 'fish', [('банка', 140)], 'консерва'),
    (r'Matjeshering mild gesalzen', 'Оселедець (матьєс)', 'Matjes', '🐟', 'fish', [('філе', 50)], 'селедка'),
    (r'Hering roh', 'Оселедець свіжий', 'Hering', '🐟', 'fish', [(PIECE, 150)], ''),
    (r'Makrele geräuchert', 'Скумбрія копчена', 'Räuchermakrele', '🐟', 'fish', [('філе', 100)], ''),
    (r'Fischstäbchen \(mit Alaska-Seelachs\) gebraten', 'Рибні палички', 'Fischstäbchen', '🐟', 'fish', [(PIECE, 30)], ''),
    (r'Garnele/Granat/Krabbe, gekocht', 'Креветки', 'Garnelen', '🦐', 'fish', [('порція', 100)], ''),
    (r'Sardine in Öl, Konserve, abgetropft', 'Сардини в олії', 'Ölsardinen', '🐟', 'fish', [('банка', 90)], 'шпроти консерва'),
    # ---- legumes, nuts, seeds
    (r'Linse reif, gekocht', 'Сочевиця варена', 'Linsen gekocht', '🫘', 'legume', [(PLATE, 200)], ''),
    (r'Kichererbse reif, Konserve, abgetropft', 'Нут консервований', 'Kichererbsen', '🫘', 'legume', [('порція', 120)], 'хумус'),
    (r'Kidneybohne reif, Konserve, abgetropft', 'Квасоля червона консервована', 'Kidneybohnen', '🫘', 'legume', [('порція', 120)], ''),
    (r'Weiße Bohnen gekocht, in Tomatensauce.*', 'Квасоля в томатному соусі', 'Weiße Bohnen in Tomatensauce', '🫘', 'legume', [('порція', 150)], ''),
    (r'Tofu', 'Тофу', 'Tofu', '', 'legume', [('порція', 100)], 'соєвий сир'),
    (r'Walnuss', 'Волоські горіхи', 'Walnüsse', '🌰', 'legume', [('жменя', 30)], 'горіх'),
    (r'Haselnuss', 'Лісові горіхи (фундук)', 'Haselnüsse', '🌰', 'legume', [('жменя', 30)], 'фундук'),
    (r'Mandel süß', 'Мигдаль', 'Mandeln', '🌰', 'legume', [('жменя', 30)], ''),
    (r'Erdnuss geröstet', 'Арахіс смажений', 'Erdnüsse', '🥜', 'legume', [('жменя', 30)], ''),
    (r'Cashewkern', 'Кеш’ю', 'Cashewkerne', '🌰', 'legume', [('жменя', 30)], ''),
    (r'Sonnenblumenkern', 'Насіння соняшнику', 'Sonnenblumenkerne', '🌻', 'legume', [('жменя', 30)], 'насіння'),
    (r'Kürbiskern', 'Гарбузове насіння', 'Kürbiskerne', '', 'legume', [('жменя', 30)], ''),
    (r'Leinsamen', 'Насіння льону', 'Leinsamen', '', 'legume', [(SPOON, 10)], ''),
    (r'Chia-Samen', 'Насіння чіа', 'Chiasamen', '', 'legume', [(SPOON, 12)], ''),
    (r'Erdnussmus', 'Арахісова паста', 'Erdnussbutter', '🥜', 'legume', [(TSP, 10), (SPOON, 20)], ''),
    (r'Hummus/Kichererbsenmus', 'Хумус', 'Hummus', '', 'legume', [(SPOON, 30)], ''),
    # ---- fats & sauces
    (r'Sonnenblumenöl', 'Олія соняшникова', 'Sonnenblumenöl', '🌻', 'fat', [(SPOON, 10), (TSP, 4)], 'олія', 'l'),
    (r'Olivenöl', 'Олія оливкова', 'Olivenöl', '🫒', 'fat', [(SPOON, 10), (TSP, 4)], 'олія', 'l'),
    (r'Rapsöl/Rüböl', 'Олія ріпакова', 'Rapsöl', '🫗', 'fat', [(SPOON, 10)], 'олія', 'l'),
    (r'Butter mild gesäuert', 'Масло вершкове', 'Butter', '🧈', 'fat', [('на бутерброд', 10), (TSP, 5)], ''),
    (r'Pflanzenmargarine Vollfett, angereichert mit Vitaminen', 'Маргарин', 'Margarine', '🧈', 'fat', [('на бутерброд', 10)], ''),
    (r'Mayonnaise \(Fertigprodukt\)', 'Майонез', 'Mayonnaise', '', 'fat', [(SPOON, 15)], ''),
    (r'Tomatenketchup', 'Кетчуп', 'Ketchup', '🍅', 'fat', [(SPOON, 15)], ''),
    (r'Senf mittelscharf', 'Гірчиця', 'Senf', '', 'fat', [(TSP, 5)], ''),
    (r'Pesto verde', 'Песто', 'Pesto', '🌿', 'fat', [(SPOON, 15)], ''),
    (r'Tomatensauce italienische Art', 'Томатний соус', 'Tomatensauce', '🍅', 'fat', [('порція', 100)], ''),
    # ---- sweets & snacks
    (r'Zucker weiß \(Raffinadezucker/Weißzucker\)', 'Цукор', 'Zucker', '', 'sweet', [(TSP, 5), ('кубик', 3)], ''),
    (r'Honig', 'Мед', 'Honig', '🍯', 'sweet', [(TSP, 8), (SPOON, 20)], ''),
    (r'Konfitüre extra', 'Варення, джем', 'Konfitüre', '🫙', 'sweet', [(TSP, 10), (SPOON, 20)], 'конфітюр'),
    (r'Nuss-Nougat-Creme', 'Шоколадно-горіхова паста', 'Nuss-Nougat-Creme', '🍫', 'sweet', [(TSP, 10)], 'нутела'),
    (r'Vollmilchschokolade', 'Шоколад молочний', 'Vollmilchschokolade', '🍫', 'sweet', [('ряд (4 часточки)', 17), ('плитка', 100)], ''),
    (r'Zartbitter-/Halbbitterschokolade', 'Шоколад чорний', 'Zartbitterschokolade', '🍫', 'sweet', [('ряд (4 часточки)', 17)], 'гіркий'),
    (r'Butterkekse/Butterplätzchen \(Mürbeteig\)', 'Печиво пісочне', 'Butterkekse', '🍪', 'sweet', [(PIECE, 6)], ''),
    (r'Fruchtgummi \(Gummibonbon\)', 'Мармеладки', 'Fruchtgummi', '🍬', 'sweet', [('жменя', 25)], 'желейки'),
    (r'Kartoffelchips/Stapelchips, diverse Sorten', 'Чипси картопляні', 'Chips', '', 'sweet', [('жменя', 25), ('пачка', 150)], ''),
    (r'Vanilleeis', 'Морозиво', 'Eis', '🍨', 'sweet', [('кулька', 50)], ''),
    (r'Apfelkuchen \(Quark-Öl-Teig\)', 'Яблучний пиріг', 'Apfelkuchen', '🥧', 'sweet', [('шматок', 120)], 'шарлотка'),
    (r'Käsekuchen/Quarkkuchen \(Hefeteig\)', 'Сирник (чізкейк)', 'Käsekuchen', '🍰', 'sweet', [('шматок', 120)], 'сирний пиріг'),
    (r'Berliner/Pfannkuchen/Krapfen \(Hefeteig\) frittiert, gefüllt mit Konfitüre', 'Пончик з начинкою', 'Berliner', '🍩', 'sweet', [(PIECE, 70)], ''),
    (r'Müsli-Riegel', 'Батончик мюслі', 'Müsliriegel', '', 'sweet', [(PIECE, 25)], ''),
    (r'Popcorn gesalzen', 'Попкорн', 'Popcorn', '🍿', 'sweet', [('жменя', 15)], ''),
    # ---- drinks
    (r'Kaffee \(Getränk\)', 'Кава чорна', 'Kaffee', '☕', 'drink', [(CUP, 200)], 'американо еспресо', 'l'),
    (r'Schwarztee \(Getränk\)', 'Чай чорний', 'Schwarzer Tee', '🍵', 'drink', [(CUP, 200)], '', 'l'),
    (r'Grüntee \(Getränk\)', 'Чай зелений', 'Grüner Tee', '🍵', 'drink', [(CUP, 200)], '', 'l'),
    (r'Cappuccino \(Getränk\) mit Milch 3,5 % Fett', 'Капучино', 'Cappuccino', '☕', 'drink', [(CUP, 200)], 'кава з молоком латте', 'l'),
    (r'Orangensaft', 'Сік апельсиновий', 'Orangensaft', '🧃', 'drink', [(GLASS, 250)], '', 'l'),
    (r'Apfelsaft', 'Сік яблучний', 'Apfelsaft', '🧃', 'drink', [(GLASS, 250)], '', 'l'),
    (r'Fruchtsaftschorle Apfel', 'Яблучний шорле', 'Apfelschorle', '🧃', 'drink', [(GLASS, 250), ('пляшка 500 мл', 500)], 'сік з водою', 'l'),
    (r'Colagetränk koffeinhaltig', 'Кола', 'Cola', '🥤', 'drink', [(GLASS, 250), ('пляшка 500 мл', 500)], 'газування', 'l'),
    (r'Pilsner Bier', 'Пиво світле', 'Bier', '🍺', 'drink', [('пляшка 500 мл', 500), (GLASS, 330)], '', 'l'),
    (r'Rotwein trocken', 'Вино червоне', 'Rotwein', '🍷', 'drink', [('келих 150 мл', 150)], '', 'l'),
    (r'Weißwein trocken', 'Вино біле', 'Weißwein', '🥂', 'drink', [('келих 150 мл', 150)], '', 'l'),
    # ---- dishes
    (r'Borschtsch \(Rote-Bete-Suppe\)', 'Борщ', 'Borschtsch', '🍲', 'dish', [(PLATE, 350)], 'борщик'),
    (r'Hühnerbrühe mit Eierteigwaren', 'Курячий суп з локшиною', 'Hühnernudelsuppe', '🍜', 'dish', [(PLATE, 350)], 'бульйон'),
    (r'Gemüsesuppe mit Kartoffeln', 'Овочевий суп', 'Gemüsesuppe', '🍲', 'dish', [(PLATE, 350)], ''),
    (r'Erbsensuppe mit Gemüsebrühe, Suppengrün und Speck', 'Гороховий суп', 'Erbsensuppe', '🍲', 'dish', [(PLATE, 350)], ''),
    (r'Linsensuppe mit Gemüse', 'Сочевичний суп', 'Linsensuppe', '🍲', 'dish', [(PLATE, 350)], ''),
    (r'Kartoffelpuffer/Reibekuchen, gebraten', 'Деруни', 'Kartoffelpuffer', '🥔', 'dish', [(PIECE, 60)], 'драники'),
    (r'Pfannkuchen/Eierkuchen, ungesüßt, mit Milch 1,5 % Fett, gebraten', 'Млинці', 'Pfannkuchen', '🥞', 'dish', [(PIECE, 60)], 'налисники'),
    (r'Pilaw mit gedünstetem Hähnchenbrustfilet und Sauce', 'Плов з куркою', 'Pilaw mit Huhn', '🍛', 'dish', [(PLATE, 300)], 'плов'),
    (r'Kartoffelsalat mit Mayonnaise', 'Картопляний салат з майонезом', 'Kartoffelsalat', '🥗', 'dish', [('порція', 200)], 'олів’є'),
    (r'Weißkrautsalat \(roh\) mit Essigmarinade', 'Салат з капусти', 'Krautsalat', '🥗', 'dish', [('порція', 150)], ''),
    (r'Griechischer Salat', 'Грецький салат', 'Griechischer Salat', '🥗', 'dish', [('порція', 250)], ''),
    (r'Paprika-Gurken-Tomatensalat mit Essigmarinade', 'Салат овочевий з олією', 'Gemischter Salat', '🥗', 'dish', [('порція', 200)], 'помідори огірки'),
    (r'Grießbrei einfach, gesüßt', 'Манна каша', 'Grießbrei', '🥣', 'dish', [(PLATE, 250)], 'манка'),
    (r'Quarkauflauf', 'Сирна запіканка', 'Quarkauflauf', '🍰', 'dish', [('шматок', 150)], ''),
    (r'Eierteigwaren mit Bologneser Sauce', 'Спагеті болоньєзе', 'Spaghetti Bolognese', '🍝', 'dish', [(PLATE, 350)], 'макарони з фаршем'),
    (r'Pizza Margherita \(mit Tomatensauce, Mozzarella\)', 'Піца', 'Pizza', '🍕', 'dish', [('шматок', 100), ('ціла', 400)], ''),
    (r'Döner Kebab, Fladenbrot gefüllt mit Grillfleisch \(Geflügel\).*', 'Дьонер з куркою', 'Döner', '🥙', 'dish', [(PIECE, 400)], 'шаурма'),
    (r'Hamburger', 'Гамбургер', 'Hamburger', '🍔', 'dish', [(PIECE, 200)], 'бургер'),
    (r'Pommes frites', 'Картопля фрі', 'Pommes', '🍟', 'dish', [('порція', 150)], ''),
    (r'Wurstsülze', 'Холодець', 'Sülze', '', 'dish', [('порція', 150)], 'студень'),
]

# Dishes the BLS lacks: raw ingredients (BLS name, grams), the weight when ready, portions
RECIPES = [
    ('ua-var-kart', 'Вареники з картоплею', 'Wareniki mit Kartoffeln', '🥟', [(PIECE, 30), ('порція 10 шт.', 300)], 'вареник',
     [('Weizen Mehl, Type 405', 45), ('Kartoffel geschält, gekocht', 55), (r'Speisezwiebel roh', 8), (r'Sonnenblumenöl', 3), ('Hühnerei roh', 5)], 125),
    ('ua-var-syr', 'Вареники з сиром', 'Wareniki mit Quark', '🥟', [(PIECE, 30), ('порція 10 шт.', 300)], 'вареник',
     [('Weizen Mehl, Type 405', 45), ('Speisequark Halbfettstufe, 20 % Fett i. Tr.', 55), ('Hühnerei roh', 8), (r'Zucker weiß \(Raffinadezucker/Weißzucker\)', 3)], 125),
    ('ua-var-vyshni', 'Вареники з вишнями', 'Wareniki mit Kirschen', '🥟', [(PIECE, 30)], 'вареник',
     [('Weizen Mehl, Type 405', 45), (r'Sauerkirsche roh', 50), (r'Zucker weiß \(Raffinadezucker/Weißzucker\)', 8)], 120),
    ('ua-pelmeni', 'Пельмені', 'Pelmeni', '🥟', [(PIECE, 12), ('порція 20 шт.', 240)], '',
     [('Weizen Mehl, Type 405', 40), ('Schwein Hackfleisch, roh', 25), ('Rind Hackfleisch, roh', 25), (r'Speisezwiebel roh', 8), ('Hühnerei roh', 4)], 105),
    ('ua-holubtsi', 'Голубці', 'Holubzi (Kohlrouladen)', '🥬', [(PIECE, 150)], '',
     [('Weißkohl roh', 40), ('Reis poliert, gekocht', 25), ('Schwein Hackfleisch, roh', 25), (r'Speisezwiebel roh', 5), ('Karotte/Möhre, roh', 5), (r'Tomatensauce italienische Art', 15)], 105),
    ('ua-syrnyky', 'Сирники', 'Syrniki (Quarkplätzchen)', '🥞', [(PIECE, 50)], 'сирник',
     [('Speisequark Halbfettstufe, 20 % Fett i. Tr.', 70), ('Hühnerei roh', 12), ('Weizen Mehl, Type 405', 12), (r'Zucker weiß \(Raffinadezucker/Weißzucker\)', 5), (r'Sonnenblumenöl', 4)], 95),
    ('ua-kotleta-kur', 'Котлета куряча', 'Hähnchenfrikadelle', '🍖', [(PIECE, 90)], 'котлети',
     [('Hähnchen Brustfilet, roh', 70), ('Weizenbrötchen', 8), ('Hühnerei roh', 8), (r'Speisezwiebel roh', 8), (r'Sonnenblumenöl', 4)], 85),
    ('ua-vinehret', 'Вінегрет', 'Vinaigrette-Salat (Rote Bete)', '🥗', [('порція', 200)], 'салат буряковий',
     [('Rote Rübe/Rote Bete, roh', 35), ('Kartoffel geschält, gekocht', 25), ('Karotte/Möhre, roh', 15), ('Sauerkraut abgetropft, roh', 10), (r'Gurke gesäuert \(Gewürzgurke\) abgetropft', 10), (r'Sonnenblumenöl', 4)], 95),
    ('ua-oliv', 'Олів’є', 'Olivier-Salat', '🥗', [('порція', 200)], 'салат олів’є',
     [('Kartoffel geschält, gekocht', 30), ('Karotte/Möhre, roh', 10), ('Hühnerei gekocht', 15), ('Fleischwurst', 15), (r'Gurke gesäuert \(Gewürzgurke\) abgetropft', 10), ('Erbse grün, roh', 8), (r'Mayonnaise \(Fertigprodukt\)', 12)], 100),
]

def num(v):
    if v is None or isinstance(v, str): return 0.0
    return float(v)

def main(path):
    wb = openpyxl.load_workbook(path, read_only=True)
    ws = wb.worksheets[0]
    rows = ws.iter_rows(values_only=True)
    head = next(rows)
    col = lambda p: next(i for i, h in enumerate(head) if h and str(h).startswith(p) and '[' in str(h))
    ik, ip, iff, ic = col('ENERCC '), col('PROT625 '), col('FAT '), col('CHO ')
    bls = [(r[0], r[1], num(r[ik]), num(r[ip]), num(r[iff]), num(r[ic])) for r in rows if r[0]]
    def find(pattern, label):
        rx = re.compile('^(?:' + pattern + ')$')
        hits = sorted((b for b in bls if rx.match(b[1] or '')), key=lambda b: (len(b[1]), b[1]))
        if not hits:
            missing.append(f'no BLS entry for {label}: {pattern}')
            return ('?', '?', 0.0, 0.0, 0.0, 0.0)
        return hits[0]
    out, seen, report, missing = [], set(), [], []
    for item in F:
        pat, uk, de, icon, cat, portions, aliases = item[:7]
        flags = item[7] if len(item) > 7 else ''
        code, name, kcal, p, f, c = find(pat, uk)
        if code in seen and code != '?': raise SystemExit(f'{uk}: {code} {name} is used twice')
        seen.add(code)
        report.append(f'{code}  {uk:42} ← {name}  ({kcal:.0f} kcal)')
        out.append([code, uk, de, icon, cat, round(kcal), round(p, 1), round(f, 1), round(c, 1), [[a, g] for a, g in portions], aliases, flags])
    for rid, uk, de, icon, portions, aliases, parts, cooked in RECIPES:
        tot = [0.0, 0.0, 0.0, 0.0]
        for pat, g in parts:
            _, name, kcal, p, f, c = find(pat, uk)
            for i, v in enumerate((kcal, p, f, c)): tot[i] += v * g / 100
        k = 100 / cooked
        report.append(f'{rid:8} {uk:42} ← recipe ({tot[0] * k:.0f} kcal)')
        out.append([rid, uk, de, icon, 'dish', round(tot[0] * k), round(tot[1] * k, 1), round(tot[2] * k, 1), round(tot[3] * k, 1), [[a, g] for a, g in portions], aliases, ''])
    print('\n'.join(report), file=sys.stderr)
    if missing: raise SystemExit('\n'.join(missing))
    print(f'{len(out)} foods', file=sys.stderr)
    js = ('// The food list of «Харчування»: generated by tools/foods.py from BLS 4.0, do not edit by hand.\n'
          '// [id (BLS code or ua-…), Ukrainian name, German name, icon (emoji, \'\' = невідомо), category, kcal, protein, fat,\n'
          '//  carbohydrates (g per 100 g or 100 ml), portions [[what, grams]], other names, flags (l: counted in ml)]\n'
          'export const SOURCE = \'Max Rubner-Institut (2025), Bundeslebensmittelschlüssel (BLS), Version 4.0, CC BY 4.0\';\n'
          'export const CATS = ' + json.dumps([{'id': i, 'uk': u, 'icon': e} for i, u, e in CATS], ensure_ascii=False) + ';\n'
          'export const FOODS = [\n' + ',\n'.join(json.dumps(x, ensure_ascii=False) for x in out) + ',\n];\n')
    open(__file__.replace('tools/foods.py', 'yizha/foods.js'), 'w').write(js)

if __name__ == '__main__':
    if len(sys.argv) != 2: raise SystemExit(__doc__)
    main(sys.argv[1])
