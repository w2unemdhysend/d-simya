// Розділ 48 (B1). Повторення й іспит B1: усі часи й пасив однією таблицею, сполучники й місце дієслова, як
// підготуватися до DTZ чи Goethe B1, що далі після B1.
// Граматика за рівнем B1 (Goethe-Zertifikat B1, DTZ), пояснення й приклади наші.
export default {
  n: 48, part: "B1.2", title: "Повторення й іспит B1", book: null,
  goals: [
    "бачити всі форми дієслова B1 разом: від Präsens до Konjunktiv II минулого й пасиву",
    "ставити дієслово правильно після кожного сполучника",
    "знати, як іде іспит B1, і підготуватися за чотири тижні",
    "знати, як учитися далі: курси професійної німецької, визнання, практика",
  ],
  grammar: [
    {
      id: "zeitenB1", t: "Усі форми дієслова B1 однією таблицею", cat: "verb",
      text: [
        "Präsens — тепер і майбутнє зі словом часу. Perfekt — минуле в розмові. Präteritum — минуле в текстах (а `war`, `hatte` і модальні — і в розмові). Plusquamperfekt — ще раніше. Futur I — плани, обіцянки, припущення.",
        "Пасив: `werden` + Partizip II; у минулому — `wurde` + Partizip II або `ist … worden`; з модальним дієсловом — `muss … werden`.",
        "Konjunktiv II: `würde` + інфінітив, `hätte`, `wäre`, `könnte`; про минуле — `hätte` / `wäre` + Partizip II.",
      ],
      tables: [
        { cap: "machen і fahren у всіх формах", head: ["Форма", "machen", "fahren"], rows: [["Präsens", "ich mache", "ich fahre"], ["Präteritum", "ich machte", "ich fuhr"], ["Perfekt", "ich habe gemacht", "ich bin gefahren"], ["Plusquamperfekt", "ich hatte gemacht", "ich war gefahren"], ["Futur I", "ich werde machen", "ich werde fahren"], ["Konjunktiv II", "ich würde machen", "ich würde fahren"], ["Konjunktiv II, минуле", "ich hätte gemacht", "ich wäre gefahren"], ["Пасив", "es wird / wurde gemacht, es ist gemacht worden", "—"]] },
      ],
      ex: [["Nachdem ich den B1-Kurs beendet hatte, meldete ich mich zur Prüfung an.", "{Закінчивши курс B1, я зареєструвався на іспит.|Закінчивши курс B1, я зареєструвалася на іспит.}"], ["Wenn ich mehr geübt hätte, wäre die Prüfung leichter gewesen.", "{Якби я більше вправлявся, іспит був би легшим.|Якби я більше вправлялася, іспит був би легшим.}"], ["Das Ergebnis wird in sechs Wochen geschickt.", "Результат надішлють за шість тижнів."]],
    },
    {
      id: "konnektorenB1", t: "Сполучники B1: де стоїть дієслово", cat: "satz",
      text: [
        "Між двома **головними реченнями** — `und, aber, oder, denn, sondern`: після них звичайний порядок: `Ich bleibe zu Hause, **denn** ich **bin** krank.`",
        "**Прислівник** на першому місці — дієслово одразу за ним: `deshalb, trotzdem, dann, danach, außerdem, sonst`: `Ich bin krank, **deshalb bleibe** ich zu Hause.`",
        "**Підрядне** речення — дієслово в кінці: `weil, dass, ob, wenn, als, obwohl, damit, sodass, bevor, nachdem, während, seit, bis, sobald, falls`: `…, **weil** ich krank **bin**.`",
        "Пари: `zwar … aber`, `weder … noch`, `sowohl … als auch`, `nicht nur … sondern auch`, `entweder … oder`, `je … desto`.",
      ],
      tables: [
        { head: ["Тип", "Слова", "Дієслово"], rows: [["з’єднує головні речення", "und, aber, oder, denn, sondern", "на 2-му місці, як завжди"], ["прислівник", "deshalb, trotzdem, außerdem, sonst, dann", "одразу після слова"], ["підрядне речення", "weil, dass, ob, wenn, als, obwohl, damit, sodass, bevor, nachdem, während, falls", "у кінці"], ["з інфінітивом", "um … zu, ohne … zu, statt … zu", "zu + інфінітив у кінці"]] },
      ],
      ex: [["Ich lerne viel, denn ich möchte die Prüfung bestehen.", "Я багато вчуся, бо хочу скласти іспит."], ["Ich lerne viel, weil ich die Prüfung bestehen möchte.", "Я багато вчуся, бо хочу скласти іспит."], ["Ich möchte die Prüfung bestehen, deshalb lerne ich viel.", "Я хочу скласти іспит, тому багато вчуся."]],
      warn: ["`…, weil ich möchte die Prüfung bestehen` — помилка: після `weil` дієслово в кінці. Після `denn` — звичайний порядок."],
    },
    {
      id: "pruefungB1", t: "Іспит B1: що це й як підготуватися", cat: "rede",
      text: [
        "DTZ (`Deutsch-Test für Zuwanderer`) — іспит наприкінці інтеграційного курсу: слухання, читання, лист і розмова в парі (тренування — у розділі «DTZ · B1»). Goethe-Zertifikat B1 і telc B1 мають схожі частини, але інші завдання й бали.",
        "B1 потрібен, наприклад, для постійного дозволу на проживання, для громадянства (разом із тестом «Leben in Deutschland»), для багатьох робіт і навчання.",
        "За чотири тижні до іспиту: щодня 20 хвилин слухання, один лист за схемою (звертання — чотири пункти — прощання), одна тема з розмовної частини вголос. За тиждень — пробний іспит на час.",
        "На іспиті не мовчи. Забув слово — опиши його: `Das ist so ein Ding, mit dem man …`. Не зрозумів — перепитай: `Können Sie das bitte wiederholen?`",
      ],
      ex: [["Ich habe mich für die Prüfung am 12. Juni angemeldet.", "{Я зареєструвався на іспит 12 червня.|Я зареєструвалася на іспит 12 червня.}"], ["Wie viele Punkte brauche ich für B1?", "Скільки балів мені потрібно для B1?"], ["Das Wort fällt mir gerade nicht ein. Es ist so ein Ding, mit dem man Wasser warm macht.", "Слово зараз не спадає на думку. Це така штука, якою гріють воду."]],
    },
    {
      id: "weiterB2", t: "Що далі після B1", cat: "rede",
      text: [
        "Курси професійної німецької (`der Berufssprachkurs`) від BAMF — до B2 і C1, часто з мовою своєї професії; записатися можна через Jobcenter, Агентуру праці чи мовну школу.",
        "Визнання диплома (`die Anerkennung`, розділ 33) і доучування (`die Anpassungsqualifizierung`) відкривають шлях до роботи за фахом.",
        "Найкраща практика — щоденне життя: робота чи волонтерство, клуб, розмови з сусідами, новини простою мовою, книжки з бібліотеки. Помилятися нормально — так учаться всі.",
        "Цей курс можна проходити знову: вправи, тренажери, «Сад слів» і «Розмова з ШІ» допомагають не забувати.",
      ],
      ex: [["Ich möchte einen Berufssprachkurs machen.", "Я хочу пройти курс професійної німецької."], ["Mein Ziel ist B2, damit ich in meinem Beruf arbeiten kann.", "Моя мета — B2, щоб працювати за фахом."], ["Fehler machen ist normal – so lernt man.", "Помилятися — нормально: так і вчаться."]],
    },
  ],
  phrases: [
    { t: "Перед іспитом", list: [["Wo findet die Prüfung statt?", "Де відбувається іспит?"], ["Was muss ich mitbringen?", "Що мені взяти з собою?"], ["Wann bekomme ich das Ergebnis?", "Коли я дізнаюся результат?"]] },
    { t: "Розмова на іспиті", list: [["Können Sie das bitte wiederholen?", "Можете, будь ласка, повторити?"], ["Ich bin nicht sicher, ob ich das richtig verstanden habe.", "{Я не певен, що правильно зрозумів.|Я не певна, що правильно зрозуміла.}"], ["Was meinst du dazu?", "А ти що про це думаєш?"]] },
    { t: "Після іспиту", list: [["Ich habe bestanden!", "{Я склав!|Я склала!}"], ["Leider habe ich nicht bestanden. Ich versuche es noch einmal.", "{На жаль, я не склав. Спробую ще раз.|На жаль, я не склала. Спробую ще раз.}"], ["Wie geht es jetzt weiter?", "Що тепер далі?"]] },
  ],
  dialog: {
    t: "Усний іспит: спільне планування",
    lines: [
      ["Prüferin", "Guten Morgen! Wir beginnen mit Teil drei. Sie planen zusammen ein Abschiedsfest für Ihre Kursleiterin. Sprechen Sie bitte über Termin, Ort, Essen und Geschenk.", "Доброго ранку! Починаємо з третьої частини. Ви разом плануєте прощальне свято для вашої викладачки. Будь ласка, обговоріть дату, місце, їжу й подарунок."],
      ["Anna", "Also, wann wollen wir feiern? Ich schlage den letzten Kurstag vor, Freitag, den 20. Juni.", "Отже, коли святкуватимемо? Пропоную останній день курсу, п’ятницю, 20 червня."],
      ["{Taras|Lessja}", "Das ist eine gute Idee, aber am Vormittag haben wir noch Unterricht. Wie wäre es mit Freitagnachmittag, so um drei?", "Гарна ідея, але до обіду в нас ще заняття. Як щодо п’ятниці по обіді, десь о третій?"],
      ["Anna", "Einverstanden. Und wo? Im Kursraum ist es ein bisschen eng.", "Згода. А де? У класі трохи тісно."],
      ["{Taras|Lessja}", "Falls das Wetter schön ist, könnten wir im Park am Rhein grillen. Falls es regnet, fragen wir, ob wir den großen Raum im Erdgeschoss benutzen dürfen.", "Якщо буде гарна погода, можна посмажити гриль у парку біля Рейну. Якщо піде дощ, запитаємо, чи можна взяти велику залу на першому поверсі."],
      ["Anna", "Super. Ich kümmere mich um die Getränke. Kannst du dich darum kümmern, dass jemand einen Kuchen backt?", "Чудово. Я подбаю про напої. Можеш подбати, щоб хтось спік пиріг?"],
      ["{Taras|Lessja}", "Klar. Ich frage Max, er ist ja Koch. Und alle bringen etwas aus ihrem Land mit – ich mache Wareniki.", "Звісно. Запитаю Макса, він же кухар. А всі принесуть щось зі своєї країни — я приготую вареники."],
      ["Anna", "Und das Geschenk? Ich finde, ein Gutschein ist praktisch.", "А подарунок? Я вважаю, подарунковий сертифікат — це практично."],
      ["{Taras|Lessja}", "{Ein Gutschein ist zwar praktisch, aber ein bisschen unpersönlich. Ich könnte ein Bild von unserer Gruppe malen, und alle unterschreiben darauf.|Ein Gutschein ist zwar praktisch, aber ein bisschen unpersönlich. Ich könnte ein Gedicht für sie schreiben, und alle unterschreiben darunter.}", "{Сертифікат, звісно, практичний, але трохи безособовий. Я міг би намалювати нашу групу, а всі на картині підпишуться.|Сертифікат, звісно, практичний, але трохи безособовий. Я могла б написати для неї вірш, а всі під ним підпишуться.}"],
      ["Anna", "{Das ist viel schöner! Machen wir beides: einen kleinen Gutschein und dein Bild.|Das ist viel schöner! Machen wir beides: einen kleinen Gutschein und dein Gedicht.}", "{Так набагато краще! Зробимо і те, і те: невеликий сертифікат і твою картину.|Так набагато краще! Зробимо і те, і те: невеликий сертифікат і твій вірш.}"],
      ["Prüferin", "Vielen Dank, das war sehr gut. Sie haben alle Punkte besprochen und gemeinsam eine Lösung gefunden.", "Дуже дякую, це було дуже добре. Ви обговорили всі пункти й разом знайшли рішення."],
      ["{Taras|Lessja}", "Danke! Am Anfang war ich sehr nervös.", "{Дякую! Спочатку я дуже нервував.|Дякую! Спочатку я дуже нервувала.}"],
      ["Prüferin", "Das hat man nicht gemerkt. Viel Erfolg weiterhin!", "Цього не було помітно. Успіхів і далі!"],
    ],
  },
  tasks: [
    { t: "gap", q: "Gestern ___ ich mit dem Zug nach Köln. (fahren, Präteritum)", a: ["fuhr"] },
    { t: "gap", q: "Als ich ankam, ___ der Kurs schon begonnen. (haben)", a: ["hatte"] },
    { t: "gap", q: "Das Ergebnis ___ in sechs Wochen geschickt. (пасив, теперішній)", a: ["wird"] },
    { t: "gap", q: "Wenn ich mehr geübt ___, wäre es leichter gewesen.", a: ["hätte"] },
    { t: "gap", q: "Ich lerne viel, ___ ich die Prüfung bestehen möchte.", a: ["weil"] },
    { t: "gap", q: "Ich möchte die Prüfung bestehen, ___ lerne ich viel.", a: ["deshalb"] },
    { t: "gap", q: "Ich lerne viel, ___ ich möchte die Prüfung bestehen.", a: ["denn"] },
    { t: "gap", q: "Ich habe die Prüfung ___! (склав)", a: ["bestanden"] },
    { t: "mc", q: "Яке речення правильне?", o: ["Ich bleibe zu Hause, weil ich bin krank.", "Ich bleibe zu Hause, denn ich bin krank.", "Ich bleibe zu Hause, deshalb ich bin krank."], a: 1 },
    { t: "mc", q: "На іспиті з голови вилетіло слово «чайник». Що зробити?", o: ["Замовкнути й чекати", "Сказати українською", "Описати: `so ein Ding, mit dem man Wasser warm macht`"], a: 2 },
    { t: "mc", q: "Для чого потрібен B1 у Німеччині?", o: ["Наприклад, для постійного дозволу на проживання й громадянства", "Лише для водійських прав", "Ні для чого офіційного"], a: 0 },
    { t: "mc", q: "Що таке `Berufssprachkurs`?", o: ["курс водіння", "курс професійної німецької", "курс для дітей"], a: 1 },
    { t: "mc", q: "Як правильно?", o: ["Ich bin gestern operiert geworden.", "Ich wurde gestern operieren.", "Ich wurde gestern operiert."], a: 2 },
    { t: "mc", q: "На іспиті партнер пропонує план, який тобі не подобається. Що сказати?", o: ["Das ist zwar eine gute Idee, aber wie wäre es mit …?", "Nein, das ist dumm.", "Нічого не казати"], a: 0 },
  ],
};
