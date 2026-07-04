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

/* ============================================================
   Lückentext — листи з пропусками ключових фраз.
   Крок 2 у навчанні письма: фрази вже в контексті, але їх
   треба АКТИВНО пригадати й вписати.
   Маркер {n} у тексті = пропуск №n.
   ============================================================ */
export const CLOZE_LETTERS = [
  {
    id: "cl_absage", title: "Absage: Geburtstagsparty", titleUk: "Відмова від запрошення", register: "informell",
    text: `Liebe Lena,

vielen {1} für deine Einladung zu deiner Geburtstagsparty am Samstag! Ich habe mich sehr gefreut.

Leider {2} ich nicht kommen, {3} ich an diesem Wochenende zu meiner Familie fahren muss. Es tut mir wirklich {4}.

Wie {5} es, wenn wir uns nächste Woche treffen? Ich lade dich zum Essen ein.

Liebe {6},
Anna`,
    gaps: [
      { answer: "Dank", hint: "подяка" },
      { answer: "kann", hint: "могти" },
      { answer: "weil", alts: ["da"], hint: "тому що" },
      { answer: "leid", hint: "es tut mir …" },
      { answer: "wäre", hint: "K-II від sein" },
      { answer: "Grüße", hint: "прощання" },
    ],
  },
  {
    id: "cl_beschwerde", title: "Beschwerde: Heizung", titleUk: "Скарга орендодавцю", register: "formell",
    text: `Sehr {1} Frau Meier,

ich schreibe Ihnen, {2} seit drei Tagen die Heizung in meiner Wohnung nicht funktioniert. In der Wohnung ist es sehr kalt.

Ich bitte Sie {3}, so schnell wie möglich einen Techniker zu schicken. Wäre es {4}, dass die Reparatur bis Freitag erledigt wird?

Ich freue mich auf Ihre {5}.

Mit freundlichen {6},
J. Kowalenko`,
    gaps: [
      { answer: "geehrte", hint: "формальне звертання" },
      { answer: "weil", alts: ["da"], hint: "тому що" },
      { answer: "deshalb", alts: ["deswegen", "darum", "daher"], hint: "тому" },
      { answer: "möglich", hint: "можливо" },
      { answer: "Antwort", hint: "відповідь" },
      { answer: "Grüßen", hint: "прощання" },
    ],
  },
  {
    id: "cl_krank", title: "Krankmeldung", titleUk: "Повідомлення про хворобу", register: "formell",
    text: `Sehr geehrter Herr Braun,

ich möchte Ihnen {1}, dass ich seit heute krank bin. {2} kann ich morgen leider nicht zur Arbeit kommen.

Ich war schon beim Arzt und soll zwei Tage zu Hause bleiben. Meine Aufgaben habe ich an Frau Schulz weitergegeben.

Ich melde mich, {3} es mir besser geht. Vielen Dank für Ihr {4}.

Mit freundlichen {5},
J. Kowalenko`,
    gaps: [
      { answer: "mitteilen", hint: "повідомити" },
      { answer: "Deshalb", alts: ["Deswegen", "Darum", "Daher"], hint: "тому (з великої)" },
      { answer: "sobald", alts: ["wenn"], hint: "щойно" },
      { answer: "Verständnis", hint: "розуміння" },
      { answer: "Grüßen", hint: "прощання" },
    ],
  },
  {
    id: "cl_einladung", title: "Einladung: Party", titleUk: "Запрошення на вечірку", register: "informell",
    text: `Hallo Anna,

ich hoffe, es {1} dir gut! Ich habe am Samstag Geburtstag und möchte dich herzlich zu meiner Party {2}.

Die Party findet um 18 Uhr bei mir zu Hause {3}. Kannst du mir bitte bis Donnerstag {4}, ob du kommst?

Ich freue mich sehr {5} dich!

Liebe {6},
Taras`,
    gaps: [
      { answer: "geht", hint: "es … dir gut" },
      { answer: "einladen", hint: "запросити (Infinitiv)" },
      { answer: "statt", hint: "stattfinden — відбуватися" },
      { answer: "sagen", alts: ["mitteilen", "schreiben"], hint: "сказати" },
      { answer: "auf", hint: "прийменник" },
      { answer: "Grüße", hint: "прощання" },
    ],
  },
];

/* ============================================================
   Переклад речень UA → DE — крок 3: активне продукування.
   Речення = найчастіші фрази іспитових листів.
   ============================================================ */
export const TRANSLATIONS = [
  { uk: "Дуже дякую за твого листа!", de: "Vielen Dank für deinen Brief!", alts: ["Danke für deinen Brief"] },
  { uk: "Я сподіваюся, що в тебе все добре.", de: "Ich hoffe, es geht dir gut.", alts: ["Ich hoffe dass es dir gut geht"] },
  { uk: "Я пишу тобі, бо мені потрібна твоя допомога.", de: "Ich schreibe dir, weil ich deine Hilfe brauche." },
  { uk: "На жаль, я не можу прийти.", de: "Leider kann ich nicht kommen.", alts: ["Ich kann leider nicht kommen"] },
  { uk: "Мені дуже шкода, що я не можу прийти.", de: "Es tut mir sehr leid, dass ich nicht kommen kann.", alts: ["Es tut mir leid dass ich nicht kommen kann"] },
  { uk: "Чи міг би ти мені, будь ласка, допомогти?", de: "Könntest du mir bitte helfen?", alts: ["Könntest du mir helfen"] },
  { uk: "Я з нетерпінням чекаю на твою відповідь.", de: "Ich freue mich auf deine Antwort." },
  { uk: "Як щодо того, щоб зустрітися в суботу?", de: "Wie wäre es, wenn wir uns am Samstag treffen?", alts: ["Wie wäre es wenn wir uns am Samstag treffen würden"] },
  { uk: "Я хотів би перенести зустріч (термін).", de: "Ich möchte den Termin verschieben.", alts: ["Ich würde gern den Termin verschieben", "Ich würde den Termin gern verschieben"] },
  { uk: "Заздалегідь дякую!", de: "Vielen Dank im Voraus!", alts: ["Danke im Voraus"] },
  { uk: "Вибач, що я відповідаю так пізно.", de: "Entschuldige, dass ich so spät antworte.", alts: ["Entschuldigung dass ich so spät antworte"] },
  { uk: "Опалення не працює вже три дні.", de: "Die Heizung funktioniert seit drei Tagen nicht.", alts: ["Seit drei Tagen funktioniert die Heizung nicht"] },
  { uk: "Будь ласка, повідомте мені, коли починається курс.", de: "Bitte teilen Sie mir mit, wann der Kurs beginnt." },
  { uk: "Я був би радий, якби Ви могли мені допомогти.", de: "Ich würde mich freuen, wenn Sie mir helfen könnten." },
  { uk: "Тому я не можу завтра прийти на роботу.", de: "Deshalb kann ich morgen nicht zur Arbeit kommen.", alts: ["Deswegen kann ich morgen nicht zur Arbeit kommen", "Darum kann ich morgen nicht zur Arbeit kommen"] },
  { uk: "Хоча я втомлений, я вчу німецьку.", de: "Obwohl ich müde bin, lerne ich Deutsch." },
  { uk: "Я вчу німецьку, щоб знайти роботу.", de: "Ich lerne Deutsch, um Arbeit zu finden.", alts: ["Ich lerne Deutsch um eine Arbeit zu finden"] },
  { uk: "Чи можна перенести зустріч на понеділок?", de: "Kann ich den Termin auf Montag verschieben?", alts: ["Könnte ich den Termin auf Montag verschieben", "Kann man den Termin auf Montag verschieben"] },
  { uk: "Крім того, у квартирі дуже холодно.", de: "Außerdem ist es in der Wohnung sehr kalt.", alts: ["Außerdem ist die Wohnung sehr kalt"] },
  { uk: "На мою думку, це гарна ідея.", de: "Meiner Meinung nach ist das eine gute Idee." },
  { uk: "Я захворів і не можу прийти.", de: "Ich bin krank und kann nicht kommen.", alts: ["Ich bin krank geworden und kann nicht kommen"] },
  { uk: "Напиши мені, коли матимеш час.", de: "Schreib mir, wenn du Zeit hast." },
  { uk: "Я щойно прочитав твоє повідомлення.", de: "Ich habe gerade deine Nachricht gelesen." },
  { uk: "Дуже дякую за Вашу відповідь.", de: "Vielen Dank für Ihre Antwort." },
];
