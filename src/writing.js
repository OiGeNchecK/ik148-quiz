/* ============================================================
   Schreiben (Письмо) — підготовка до письмової частини B1.
   Структура листа, банк фраз (Redemittel) та реалістичні
   завдання у форматі іспиту (Leitpunkte) зі зразками відповідей.
   ============================================================ */

export const WRITING_STRUCTURE = [
  { part: "1. Anrede", deTip: "Liebe(r) [Ім'я], / Hallo [Ім'я], — неформально. Sehr geehrte(r) Frau/Herr [Прізвище], / Sehr geehrte Damen und Herren, — формально.", ukTip: "Звертання. Формально — з великої літери, кома в кінці, наступний рядок з малої (крім Sie/іменників)." },
  { part: "2. Einleitung", deTip: "1 речення: чому ти пишеш.", ukTip: "«Ich schreibe dir/Ihnen, weil…» / «Ich hoffe, es geht dir gut.» Не починай одразу з проблеми — спочатку м'який вступ." },
  { part: "3. Hauptteil", deTip: "По одному абзацу на кожен пункт завдання (Leitpunkt).", ukTip: "Це найважливіша частина — саме тут перевіряють, чи розкрив(ла) ти всі пункти. Пропущений пункт = втрачені бали, навіть якщо граматика ідеальна." },
  { part: "4. Schluss", deTip: "1 речення-підсумок + очікування відповіді.", ukTip: "«Ich freue mich auf deine/Ihre Antwort.» / «Melde dich bald!» / «Für Rückfragen stehe ich gerne zur Verfügung.»" },
  { part: "5. Grußformel", deTip: "Liebe Grüße, / Viele Grüße, — неформально. Mit freundlichen Grüßen, — формально.", ukTip: "Ім'я на новому рядку під формулою прощання." },
];

export const REDEMITTEL = [
  {
    cat: "Anrede", catUk: "Звертання",
    items: [
      { de: "Liebe Anna, / Lieber Tom,", uk: "неформально, за іменем", tag: "informell" },
      { de: "Hallo Anna,", uk: "дуже неформально", tag: "informell" },
      { de: "Sehr geehrte Frau Müller, / Sehr geehrter Herr Schmidt,", uk: "формально, знаєш прізвище", tag: "formell" },
      { de: "Sehr geehrte Damen und Herren,", uk: "формально, не знаєш, хто отримає лист", tag: "formell" },
    ],
  },
  {
    cat: "Einleitung", catUk: "Вступ — чому пишеш",
    items: [
      { de: "ich hoffe, es geht dir gut.", uk: "теплий неформальний вступ", tag: "informell" },
      { de: "lange haben wir nichts voneinander gehört.", uk: "давно не спілкувались", tag: "informell" },
      { de: "ich schreibe dir/Ihnen, weil …", uk: "пряма причина листа", tag: "beide" },
      { de: "ich wende mich an Sie, weil …", uk: "формальне «звертаюсь до Вас, тому що…»", tag: "formell" },
      { de: "vielen Dank für deine/Ihre E-Mail vom …", uk: "якщо це відповідь на лист", tag: "beide" },
    ],
  },
  {
    cat: "Anliegen nennen", catUk: "Назвати суть проблеми/прохання",
    items: [
      { de: "Der Grund für meine E-Mail ist, dass …", uk: "офіційне формулювання причини", tag: "formell" },
      { de: "Ich möchte dir/Ihnen mitteilen, dass …", uk: "повідомити щось", tag: "beide" },
      { de: "Leider muss ich dir/Ihnen mitteilen, dass …", uk: "неприємна новина", tag: "beide" },
    ],
  },
  {
    cat: "Bitten / Fragen", catUk: "Прохання і питання",
    items: [
      { de: "Kannst du mir vielleicht …?", uk: "неформальне прохання", tag: "informell" },
      { de: "Wäre es möglich, dass …?", uk: "ввічливе прохання (Konjunktiv II)", tag: "beide" },
      { de: "Ich würde mich freuen, wenn Sie … könnten.", uk: "формальне ввічливе прохання", tag: "formell" },
      { de: "Ich bitte Sie, …", uk: "пряме офіційне прохання", tag: "formell" },
    ],
  },
  {
    cat: "Пропозиція / рада", catUk: "Vorschlagen",
    items: [
      { de: "Wie wäre es, wenn wir …?", uk: "неформальна пропозиція", tag: "informell" },
      { de: "Ich schlage vor, dass …", uk: "нейтральна пропозиція", tag: "beide" },
      { de: "An deiner/Ihrer Stelle würde ich …", uk: "порада (Konjunktiv II)", tag: "beide" },
    ],
  },
  {
    cat: "Вибачення", catUk: "Sich entschuldigen",
    items: [
      { de: "Es tut mir leid, dass …", uk: "вибачення", tag: "beide" },
      { de: "Leider kann ich nicht …, weil …", uk: "відмова з поясненням", tag: "beide" },
      { de: "Entschuldige/Entschuldigen Sie bitte, dass …", uk: "вибач(те), що…", tag: "beide" },
    ],
  },
  {
    cat: "Подяка", catUk: "Sich bedanken",
    items: [
      { de: "Vielen Dank für …", uk: "дякую за…", tag: "beide" },
      { de: "Ich möchte mich herzlich bedanken für …", uk: "формальніша подяка", tag: "formell" },
    ],
  },
  {
    cat: "Завершення", catUk: "Schluss",
    items: [
      { de: "Ich freue mich auf deine/Ihre Antwort.", uk: "чекаю на відповідь", tag: "beide" },
      { de: "Melde dich bald!", uk: "неформально", tag: "informell" },
      { de: "Für Rückfragen stehe ich gerne zur Verfügung.", uk: "формально", tag: "formell" },
      { de: "Vielen Dank im Voraus.", uk: "заздалегідь дякую", tag: "beide" },
    ],
  },
  {
    cat: "Зв'язки (Konnektoren)", catUk: "Щоб текст був зв'язним",
    items: [
      { de: "deshalb / deswegen / darum", uk: "тому (наслідок)", tag: "beide" },
      { de: "außerdem", uk: "крім того", tag: "beide" },
      { de: "trotzdem", uk: "попри це", tag: "beide" },
      { de: "obwohl …", uk: "хоча…", tag: "beide" },
      { de: "weil …", uk: "тому що…", tag: "beide" },
      { de: "zum Beispiel", uk: "наприклад", tag: "beide" },
      { de: "einerseits … andererseits …", uk: "з одного боку… з іншого…", tag: "beide" },
      { de: "meiner Meinung nach", uk: "на мою думку", tag: "beide" },
    ],
  },
];

export const WRITING_CHECKLIST = [
  "Чи є правильне звертання (Anrede) для цього регістру (du/Sie)?",
  "Чи є вступне речення — чому ти пишеш?",
  "Чи розкрито ВСІ пункти завдання (Leitpunkte)? Це найважливіше для балів.",
  "Чи вжито хоча б 2–3 сполучники (weil, deshalb, außerdem, obwohl)?",
  "Чи є завершальне речення + формула прощання?",
  "Чи достатньо слів (орієнтовно 80–120)?",
];

export const WRITING_PROMPTS = [
  {
    id: "einladung_absagen",
    title: "Einladung absagen",
    titleUk: "Відмова від запрошення",
    register: "informell",
    situationUk: "Твоя подруга Lena запросила тебе на день народження в суботу, але ти не можеш прийти.",
    leitpunkte: [
      "Bedanke dich für die Einladung.",
      "Entschuldige dich und erkläre, warum du nicht kommen kannst.",
      "Schlage einen anderen Termin vor, um dich zu treffen.",
    ],
    words: [80, 110],
    model: `Liebe Lena,

vielen Dank für deine Einladung zu deiner Geburtstagsparty am Samstag! Ich habe mich sehr gefreut, dass du an mich gedacht hast.

Leider kann ich nicht kommen, weil ich an diesem Wochenende zu meiner Familie nach Hamburg fahren muss. Meine Oma wird 80 Jahre alt, und die ganze Familie trifft sich dort. Es tut mir wirklich leid, dass ich deine Party verpasse.

Wie wäre es, wenn wir uns nächste Woche treffen und in Ruhe feiern? Ich lade dich dann zum Essen ein.

Ich hoffe, du hast trotzdem eine wunderschöne Feier!

Liebe Grüße,
Anna`,
  },
  {
    id: "wohnung_heizung",
    title: "Beschwerde: Heizung kaputt",
    titleUk: "Скарга орендодавцю (не працює опалення)",
    register: "formell",
    situationUk: "Ти живеш в орендованій квартирі. Вже три дні не працює опалення. Пишеш листа орендодавцю (Vermieter/in).",
    leitpunkte: [
      "Beschreibe das Problem genau (seit wann, was funktioniert nicht).",
      "Erkläre, welche Folgen das für dich hat.",
      "Bitte um schnelle Reparatur und nenne eine Frist.",
    ],
    words: [80, 120],
    model: `Sehr geehrte Frau Meier,

ich schreibe Ihnen, weil seit drei Tagen die Heizung in meiner Wohnung nicht funktioniert. Ich habe schon versucht, sie selbst einzuschalten, aber das Problem liegt wahrscheinlich am Heizkessel.

Da es draußen sehr kalt ist, ist es in der Wohnung inzwischen ungemütlich kalt, besonders nachts. Das ist vor allem für meine kleine Tochter nicht gut.

Ich bitte Sie deshalb, so schnell wie möglich einen Techniker zu schicken. Wäre es möglich, dass die Reparatur bis Ende dieser Woche erledigt wird?

Für Rückfragen erreichen Sie mich jederzeit unter meiner Telefonnummer.

Mit freundlichen Grüßen,
J. Kowalenko`,
  },
  {
    id: "chef_krankmeldung",
    title: "Krankmeldung",
    titleUk: "Повідомлення про хворобу керівнику",
    register: "formell",
    situationUk: "Ти захворів(-ла) і не можеш прийти на роботу завтра. Пишеш email керівнику.",
    leitpunkte: [
      "Teile mit, dass du krank bist und nicht arbeiten kannst.",
      "Erkläre kurz, was los ist / was der Arzt gesagt hat.",
      "Informiere, wer deine Arbeit übernimmt oder wie man dich erreichen kann.",
    ],
    words: [70, 100],
    model: `Sehr geehrter Herr Braun,

ich möchte Ihnen mitteilen, dass ich heute Morgen mit hohem Fieber aufgewacht bin und deshalb morgen nicht zur Arbeit kommen kann. Ich war schon beim Arzt, der mir empfohlen hat, mich mindestens zwei Tage auszuruhen.

Meine wichtigsten Aufgaben für morgen habe ich bereits an Frau Schulz weitergegeben, sodass das Projekt trotzdem pünktlich fertig wird.

Falls es dringende Fragen gibt, bin ich per E-Mail oder Handy erreichbar. Ich melde mich, sobald es mir besser geht.

Mit freundlichen Grüßen,
J. Kowalenko`,
  },
  {
    id: "termin_verschieben",
    title: "Arzttermin verschieben",
    titleUk: "Перенесення прийому у лікаря",
    register: "formell",
    situationUk: "У тебе запланований прийом у лікаря, але виникла проблема — треба перенести.",
    leitpunkte: [
      "Nenne deinen Termin (Datum/Uhrzeit).",
      "Erkläre den Grund für die Absage.",
      "Bitte um einen neuen Termin und nenne mögliche Tage.",
    ],
    words: [70, 100],
    model: `Sehr geehrte Frau Doktor Klein,

ich habe am Donnerstag, den 14. Mai, um 10 Uhr einen Termin bei Ihnen, kann diesen aber leider nicht wahrnehmen, weil ich an diesem Tag beruflich verreisen muss.

Es tut mir leid, dass ich so kurzfristig absagen muss. Wäre es möglich, den Termin auf die folgende Woche zu verschieben? Am Montag oder Mittwochnachmittag hätte ich Zeit.

Bitte teilen Sie mir mit, welcher Termin für Sie passt.

Vielen Dank im Voraus und freundliche Grüße,
J. Kowalenko`,
  },
  {
    id: "rat_freund",
    title: "Um Rat bitten",
    titleUk: "Прохання поради у друга",
    register: "informell",
    situationUk: "У тебе конфлікт із сусідом по квартирі (WG). Пишеш другу за порадою.",
    leitpunkte: [
      "Beschreibe das Problem.",
      "Erkläre, warum es dich stört / was du schon versucht hast.",
      "Bitte um einen Ratschlag.",
    ],
    words: [80, 110],
    model: `Hallo Sophie,

ich brauche gerade deinen Rat, weil ich ein Problem mit meinem Mitbewohner habe. Er räumt nie die Küche auf und lässt oft schmutziges Geschirr tagelang stehen.

Ich habe schon zweimal versucht, ruhig mit ihm zu reden, aber es hat sich nichts geändert. Das nervt mich total, und ich weiß nicht mehr, was ich tun soll.

Was würdest du an meiner Stelle machen? Soll ich noch einmal mit ihm sprechen oder lieber unsere Vermieterin einschalten?

Ich freue mich auf deine Antwort!

Liebe Grüße,
Anna`,
  },
  {
    id: "forum_handys",
    title: "Forumsbeitrag: Handys in der Schule",
    titleUk: "Дописи на форумі: думка щодо теми",
    register: "neutral",
    situationUk: "На форумі обговорюють: чи варто заборонити телефони в школі. Напиши свою думку.",
    leitpunkte: [
      "Nenne deine Meinung zum Thema.",
      "Nenne ein Argument dafür und eins dagegen.",
      "Beende mit einem persönlichen Beispiel oder Vorschlag.",
    ],
    words: [80, 120],
    model: `Meiner Meinung nach sollten Handys in der Schule verboten werden, zumindest während des Unterrichts.

Einerseits lenken Handys die Schüler stark ab: Viele schauen ständig auf Nachrichten, anstatt aufzupassen. Andererseits können Handys aber auch nützlich sein, zum Beispiel um schnell etwas nachzuschlagen oder im Notfall die Eltern zu erreichen.

Ich finde, ein Kompromiss wäre am besten: Handys sollten während der Pausen erlaubt sein, aber im Unterricht ausgeschaltet bleiben. So haben die Schüler weniger Ablenkung, aber trotzdem etwas Freiheit.

Was denkt ihr darüber?`,
  },
  {
    id: "dank_geschenk",
    title: "Sich für ein Geschenk bedanken",
    titleUk: "Подяка за подарунок",
    register: "informell",
    situationUk: "Друг подарував тобі щось на день народження. Пишеш листа подяки.",
    leitpunkte: [
      "Bedanke dich für das Geschenk.",
      "Beschreibe, warum es dir gefällt.",
      "Lade die Person zu einem Treffen ein.",
    ],
    words: [70, 100],
    model: `Lieber Paul,

vielen Dank für das wunderschöne Buch, das du mir zum Geburtstag geschenkt hast! Ich habe mich riesig gefreut, weil ich genau dieses Buch schon lange lesen wollte.

Ich habe gestern gleich damit angefangen und finde die Geschichte total spannend. Es war wirklich ein perfektes Geschenk!

Hättest du Lust, dich nächste Woche zu treffen? Ich würde dich gern zum Kaffee einladen, um mich noch einmal persönlich zu bedanken.

Liebe Grüße und bis bald,
Anna`,
  },
  {
    id: "reklamation",
    title: "Reklamation: Produkt defekt",
    titleUk: "Скарга: товар прийшов пошкодженим",
    register: "formell",
    situationUk: "Ти замовив(-ла) товар онлайн, він прийшов зіпсованим. Пишеш скаргу компанії.",
    leitpunkte: [
      "Beschreibe, was du bestellt hast und wann.",
      "Beschreibe das Problem (was ist kaputt/falsch).",
      "Fordere eine Lösung (Geld zurück, Ersatz) und nenne eine Frist.",
    ],
    words: [80, 120],
    model: `Sehr geehrte Damen und Herren,

am 3. Mai habe ich bei Ihnen online eine Kaffeemaschine (Bestellnummer 55821) bestellt. Das Paket ist gestern angekommen, aber leider war die Maschine beim Auspacken bereits kaputt: Der Wasserbehälter hat einen Riss, und die Maschine lässt sich nicht einschalten.

Ich bitte Sie daher, mir entweder ein neues Gerät zu schicken oder den vollen Kaufpreis zurückzuerstatten. Bitte teilen Sie mir innerhalb der nächsten Woche mit, wie Sie vorgehen möchten.

Fotos vom beschädigten Gerät habe ich dieser E-Mail angehängt.

Mit freundlichen Grüßen,
J. Kowalenko`,
  },
];
