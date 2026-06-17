/* ============================================================
   Глосарій граматичних термінів — короткі пояснення українською.
   Використовується для спливних підказок (тултипів) у тексті
   правил і пояснень. Ключ = німецький/латинський термін так,
   як він зустрічається в текстах застосунку.
   ============================================================ */

export const GLOSSARY = {
  // --- відмінки ---
  Nominativ:
    "Називний відмінок — хто? що? Це підмет речення: der Mann, die Frau, das Kind.",
  Akkusativ:
    "Знахідний відмінок — кого? що? Прямий додаток. Лише чоловічий рід змінює артикль: der → den.",
  Dativ:
    "Давальний відмінок — кому? чому? Непрямий додаток. Артиклі: dem / dem / der / den (+n у множині).",
  Genitiv:
    "Родовий відмінок — чий? чия? Присвійність: das Auto des Mannes. Артиклі: des / der.",

  // --- артиклі ---
  Artikel:
    "Артикль — службове слово перед іменником, що показує рід, число та відмінок (der, die, das, ein, eine).",
  "bestimmter Artikel":
    "Означений артикль (der/die/das) — про конкретний, уже відомий предмет.",
  "unbestimmter Artikel":
    "Неозначений артикль (ein/eine) — про предмет уперше, один із багатьох.",

  // --- дієслово, часи, форми ---
  Konjugation:
    "Дієвідмінювання — зміна дієслова за особами: ich mache, du machst, er macht…",
  Infinitiv:
    "Інфінітив — початкова форма дієслова (machen, gehen, sein). Стоїть у кінці речення з модальними та у Futur.",
  "Partizip II":
    "Дієприкметник минулого часу для Perfekt/Passiv: gemacht, gegangen, getrunken. Зазвичай ge-…-t або ge-…-en.",
  Präsens:
    "Теперішній час — основна дія тепер або взагалі: Ich wohne in Köln.",
  Präteritum:
    "Простий минулий час — для розповіді й на письмі: war, hatte, machte, ging.",
  Perfekt:
    "Доконаний минулий час для розмови: haben/sein + Partizip II (Ich habe gemacht).",
  Plusquamperfekt:
    "Передминулий час — дія до іншої дії в минулому: hatte/war + Partizip II.",
  "Futur I":
    "Майбутній час: werden + Infinitiv (Ich werde kommen).",

  // --- типи дієслів ---
  Modalverb:
    "Модальне дієслово (können, müssen, wollen, dürfen, sollen, mögen) — виражає можливість, потребу, бажання. Основне дієслово-Infinitiv іде в кінець.",
  Hilfsverb:
    "Допоміжне дієслово (haben, sein, werden) — утворює складні часи й Passiv.",
  "trennbares Verb":
    "Розділюване дієслово — префікс відокремлюється й іде в кінець: aufstehen → ich stehe früh auf.",
  "reflexives Verb":
    "Зворотне дієслово — дія спрямована на самого діяча, із займенником sich: sich freuen, sich waschen.",

  // --- способи / стани ---
  Imperativ:
    "Наказовий спосіб — прохання чи наказ: Geh! Nehmen Sie! Komm bitte!",
  "Konjunktiv II":
    "Умовний спосіб — гіпотези, ввічливість, поради: würde + Infinitiv, hätte, wäre, könnte.",
  Passiv:
    "Пасивний стан — важлива дія, а не виконавець: werden + Partizip II (Das Haus wird gebaut).",

  // --- ступені порівняння ---
  Komparativ:
    "Вищий ступінь прикметника: -er + als (kleiner als, älter als).",
  Superlativ:
    "Найвищий ступінь: am …-sten або der/die/das …-ste (am schnellsten, der schnellste).",

  // --- займенники / артиклі-слова ---
  Personalpronomen:
    "Особовий займенник: ich, du, er, sie, es, wir, ihr, sie/Sie.",
  Possessivartikel:
    "Присвійний артикль: mein, dein, sein, ihr, unser, euer — відмінюється як ein/kein.",
  Relativpronomen:
    "Відносний займенник (der, die, das, dem, denen…) — починає підрядне означальне.",

  // --- речення / прийменники ---
  Hauptsatz:
    "Головне речення — дієслово на 2-й позиції: Ich bleibe heute zu Hause.",
  Nebensatz:
    "Підрядне речення — дієслово стоїть у самому кінці: …, weil ich müde bin.",
  Subjekt: "Підмет — хто виконує дію; стоїть у Nominativ.",
  Objekt: "Додаток — кого/чому стосується дія (Akkusativ або Dativ).",
  Präposition:
    "Прийменник (mit, auf, in, für…) — керує відмінком наступного слова.",
  Wechselpräposition:
    "Прийменник місця, що бере Akkusativ (Wohin? — рух) або Dativ (Wo? — місце): in, an, auf, über…",
  Konnektor:
    "Сполучник, що з'єднує речення (weil, dass, deshalb, obwohl) і впливає на порядок слів.",

  // --- відмінювання прикметника ---
  "schwache Deklination":
    "Слабка відміна прикметника — після означеного артикля (der/die/das): майже скрізь -en, у Nom. -e.",
  "starke Deklination":
    "Сильна відміна прикметника — без артикля: прикметник бере закінчення артикля (guter Wein, kaltes Wasser).",
  "n-Deklination":
    "N-відмінювання — група чоловічих іменників, що беруть -n/-en у всіх відмінках, крім Nom. однини (der Junge → den Jungen).",
  Umlaut:
    "Умлаут — зміна голосного a→ä, o→ö, u→ü (alt → älter, fahren → er fährt).",
};
