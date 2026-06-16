import React, { useState, useMemo, useReducer, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ============================================================
   German B1 Grammar Trainer — single-file app
   Active recall + Leitner spaced repetition.
   UI in Ukrainian, grammar content in German.
   Progress kept in memory; export/import as JSON file.
   ============================================================ */

// ---------- CONTENT ----------
const MODULES = [
  {
    id: "konjunktiv2", title: "Konjunktiv II", titleUk: "Умовний спосіб", color: "#e0a458",
    rules: [
      { de: "würde + Infinitiv — універсальна форма для більшості дієслів.", expl: "Ich würde gern nach Berlin fahren. Базова ввічлива/гіпотетична форма." },
      { de: "hätte / wäre — для haben і sein (würde тут не вживають).", expl: "Ich hätte Zeit. Wir wären froh." },
      { de: "könnte / müsste / sollte — модальні мають власну форму К-II.", expl: "Könntest du mir helfen? — ввічливе прохання." },
      { de: "Нереальні гіпотези: Wenn …, dann würde / hätte / wäre …", expl: "Wenn ich Zeit hätte, würde ich kommen." },
      { de: "Поради: An deiner Stelle würde ich … / Du solltest …", expl: "An deiner Stelle würde ich einen Arzt fragen." },
    ],
    questions: [
      { type:"fill", q:"Wenn ich reich ___, würde ich eine Weltreise machen.", blankHint:"sein → K-II", answer:"wäre", expl:"sein у Konjunktiv II = wäre (не «würde sein»)." },
      { type:"fill", q:"___ du mir bitte helfen? (höflich)", blankHint:"können → K-II", answer:"Könntest", alts:["könntest"], expl:"können → könntest для ввічливого прохання." },
      { type:"fill", q:"Ich ___ gern ein Eis essen.", blankHint:"würde", answer:"würde", expl:"Стандартна форма: würde + Infinitiv (essen)." },
      { type:"fill", q:"Wenn wir mehr Geld ___, könnten wir ein Haus kaufen.", blankHint:"haben → K-II", answer:"hätten", expl:"haben → hätten (wir-форма)." },
      { type:"mc", q:"Яке речення правильне?", options:["Ich würde gern mehr Zeit haben.","Ich hätte gern mehr Zeit.","Ich würde mehr Zeit sein.","Ich wäre Zeit haben."], answer:1, expl:"З haben вживаємо hätte, а не würde haben." },
      { type:"mc", q:"«Якби я був тобою, я б зачекав» —", options:["Wenn ich du wäre, würde ich warten.","Wenn ich du wäre, ich warten würde.","Wenn ich du sein würde, warte ich.","Wenn ich du bin, würde ich warten."], answer:0, expl:"wäre для sein; у головному würde + Infinitiv у кінці." },
      { type:"mc", q:"Ввічлива порада починається з:", options:["An deiner Stelle würde ich…","An deine Stelle ich würde…","Auf deiner Stelle würde ich…","In deiner Stelle ich würde…"], answer:0, expl:"Сталий зворот: «An deiner Stelle würde ich…»." },
      { type:"order", prompt:"Складіть гіпотетичне речення:", words:["Wenn","ich","Zeit","hätte",",","würde","ich","dich","besuchen"], answer:["Wenn","ich","Zeit","hätte",",","würde","ich","dich","besuchen"], expl:"Підрядне: hätte в кінці; головне: würde, Infinitiv (besuchen) в кінці." },
      { type:"order", prompt:"Ввічливе прохання:", words:["Könnten","Sie","mir","das","bitte","erklären"], answer:["Könnten","Sie","mir","das","bitte","erklären"], expl:"könnten (K-II) на початку, Infinitiv erklären у кінці." },
      { type:"fill", q:"An seiner Stelle ___ ich nichts sagen.", blankHint:"würde", answer:"würde", expl:"würde + Infinitiv (sagen) для поради." },
    ],
  },
  {
    id: "passiv", title: "Passiv", titleUk: "Пасивний стан", color: "#7aa2c2",
    rules: [
      { de: "Präsens Passiv: werden + Partizip II.", expl: "Das Haus wird gebaut. Дія важливіша за виконавця." },
      { de: "Präteritum Passiv: wurde + Partizip II.", expl: "Das Haus wurde gebaut." },
      { de: "Perfekt Passiv: ist + Partizip II + worden.", expl: "Das Haus ist gebaut worden. Увага: worden, не geworden." },
      { de: "Виконавець: von (особа) / durch (засіб, причина).", expl: "von Anna geschrieben / durch ein Erdbeben zerstört." },
      { de: "Passiv + Modalverb: Modalverb + Partizip II + werden.", expl: "Das muss heute gemacht werden." },
    ],
    questions: [
      { type:"fill", q:"Das Auto ___ gerade repariert. (Präsens)", blankHint:"werden", answer:"wird", expl:"Präsens Passiv: wird + Partizip II." },
      { type:"fill", q:"Die Brücke ___ 1990 gebaut. (Präteritum)", blankHint:"werden→Prät.", answer:"wurde", expl:"Präteritum Passiv: wurde + Partizip II." },
      { type:"fill", q:"Der Vertrag ist gestern unterschrieben ___. (Perfekt)", blankHint:"…worden", answer:"worden", expl:"Perfekt Passiv закінчується на worden." },
      { type:"fill", q:"Der Brief wird ___ dem Chef geschrieben.", blankHint:"виконавець-особа", answer:"von", expl:"Особа-виконавець → von + Dativ." },
      { type:"mc", q:"Perfekt Passiv від «Das Zimmer wird geputzt»:", options:["Das Zimmer ist geputzt geworden.","Das Zimmer ist geputzt worden.","Das Zimmer hat geputzt worden.","Das Zimmer war geputzt."], answer:1, expl:"ist + Partizip II + worden." },
      { type:"mc", q:"«Це має бути зроблено» —", options:["Das muss gemacht werden.","Das muss werden gemacht.","Das muss gemacht worden.","Das wird gemacht müssen."], answer:0, expl:"Modalverb + Partizip II + werden у кінці." },
      { type:"mc", q:"Місто було зруйноване землетрусом:", options:["…von einem Erdbeben zerstört.","…durch ein Erdbeben zerstört.","…mit einem Erdbeben zerstört.","…aus einem Erdbeben zerstört."], answer:1, expl:"Неживий засіб → durch + Akkusativ." },
      { type:"order", prompt:"Präsens Passiv:", words:["Die","Suppe","wird","von","der","Köchin","gekocht"], answer:["Die","Suppe","wird","von","der","Köchin","gekocht"], expl:"wird на 2 позиції, gekocht у кінці." },
      { type:"order", prompt:"Passiv + Modalverb:", words:["Die","Hausaufgabe","muss","heute","gemacht","werden"], answer:["Die","Hausaufgabe","muss","heute","gemacht","werden"], expl:"muss на 2 позиції, gemacht werden у кінці." },
      { type:"fill", q:"Damals ___ viele Briefe mit der Hand geschrieben. (Prät., Pl.)", blankHint:"werden→Prät.Pl.", answer:"wurden", expl:"Множина: wurden + Partizip II." },
    ],
  },
  {
    id: "relativ", title: "Relativsätze", titleUk: "Підрядні означальні", color: "#9b8bc4",
    rules: [
      { de: "Relativpronomen = артикль роду/числа; відмінок — за роллю в підрядному.", expl: "der Mann, der… (Nom) / den ich kenne (Akk)." },
      { de: "Dativ: dem / der / dem / denen.", expl: "Die Frau, der ich helfe…" },
      { de: "Genitiv: dessen (m/n) / deren (f/Pl).", expl: "Der Mann, dessen Auto kaputt ist…" },
      { de: "З прийменником: прийменник ПЕРЕД займенником.", expl: "der Freund, mit dem ich spiele." },
      { de: "Дієслово в підрядному — завжди в кінці.", expl: "Das Buch, das ich gekauft habe, ist toll." },
    ],
    questions: [
      { type:"fill", q:"Das ist der Mann, ___ neben mir wohnt. (Nom., m)", blankHint:"der/den/dem", answer:"der", expl:"Підмет → Nominativ m = der." },
      { type:"fill", q:"Das ist das Buch, ___ ich gerade lese. (Akk., n)", blankHint:"n, Akk.", answer:"das", expl:"Прямий додаток → Akk. n = das." },
      { type:"fill", q:"Die Frau, ___ ich Blumen schenke, ist nett. (Dat., f)", blankHint:"f, Dat.", answer:"der", expl:"schenken + Dativ; f Dativ = der." },
      { type:"fill", q:"Der Junge, ___ Fahrrad gestohlen wurde, weint. (Gen., m)", blankHint:"чий, m", answer:"dessen", expl:"Присвійність m → dessen." },
      { type:"mc", q:"Das ist der Freund, ___ ich ins Kino gehe.", options:["mit der","mit dem","mit den","mit das"], answer:1, expl:"mit + Dativ m = dem." },
      { type:"mc", q:"Die Kinder, ___ ich Geschenke gebe… (Dat. Pl.)", options:["die","denen","deren","der"], answer:1, expl:"Dativ Plural = denen." },
      { type:"mc", q:"Die Stadt, in ___ ich wohne… (f, Dat.)", options:["der","die","dem","denen"], answer:0, expl:"in + Dativ f = der." },
      { type:"order", prompt:"Складіть речення:", words:["Das","ist","das","Auto",",","das","ich","kaufen","möchte"], answer:["Das","ist","das","Auto",",","das","ich","kaufen","möchte"], expl:"das (n, Akk), möchte у кінці підрядного." },
      { type:"order", prompt:"З прийменником:", words:["Das","ist","die","Kollegin",",","mit","der","ich","arbeite"], answer:["Das","ist","die","Kollegin",",","mit","der","ich","arbeite"], expl:"mit der (f, Dat), arbeite у кінці." },
      { type:"fill", q:"Die Bücher, ___ Titel ich vergessen habe… (Gen. Pl.)", blankHint:"чиї, Pl.", answer:"deren", expl:"Genitiv Plural → deren." },
    ],
  },
  {
    id: "konnektoren", title: "Konnektoren", titleUk: "Сполучники", color: "#5fb3a3",
    rules: [
      { de: "weil / da — причина, дієслово в кінці.", expl: "Ich bleibe zu Hause, weil ich krank bin." },
      { de: "obwohl — «хоча», дієслово в кінці.", expl: "Obwohl es regnet, gehe ich spazieren." },
      { de: "deshalb / deswegen / darum — наслідок, дієслово на позиції 2.", expl: "Es regnet, deshalb bleibe ich zu Hause." },
      { de: "trotzdem — «попри це», дієслово на позиції 2.", expl: "Es regnet. Trotzdem gehe ich raus." },
      { de: "damit (різні підмети) vs um…zu (той самий підмет).", expl: "…, damit ich bestehe. / um zu bestehen." },
      { de: "wenn (умова/повтор) vs als (один раз у минулому).", expl: "Als ich klein war… / Wenn ich Zeit habe…" },
    ],
    questions: [
      { type:"fill", q:"Ich gehe zum Arzt, ___ ich Schmerzen habe.", blankHint:"причина", answer:"weil", alts:["da"], expl:"weil/da — причина; habe в кінці." },
      { type:"fill", q:"___ es kalt ist, ziehe ich keine Jacke an.", blankHint:"хоча", answer:"Obwohl", alts:["obwohl"], expl:"obwohl — допуст, ist у кінці." },
      { type:"fill", q:"Es ist spät, ___ gehe ich schlafen.", blankHint:"тому (поз.2)", answer:"deshalb", alts:["deswegen","darum"], expl:"deshalb + дієслово одразу (gehe)." },
      { type:"mc", q:"«Я вчуся, щоб скласти іспит» (той самий підмет):", options:["…, damit ich die Prüfung bestehe.","…, um die Prüfung zu bestehen.","…, weil die Prüfung zu bestehen.","…, dass ich die Prüfung bestehe."], answer:1, expl:"Той самий підмет → um…zu + Infinitiv." },
      { type:"mc", q:"«Я даю йому ключ, щоб він зайшов» (різні підмети):", options:["…, um er reinkommt.","…, damit er reinkommen kann.","…, um reinzukommen.","…, weil er reinkommt."], answer:1, expl:"Різні підмети → лише damit." },
      { type:"mc", q:"«Коли я був дитиною…» (минуле, одноразово):", options:["Wenn ich Kind war","Als ich Kind war","Wann ich Kind war","Ob ich Kind war"], answer:1, expl:"Одноразова подія в минулому → als." },
      { type:"mc", q:"Es regnet. ___ gehe ich joggen.", options:["Trotzdem","Obwohl","Weil","Damit"], answer:0, expl:"trotzdem на позиції 2 з інверсією." },
      { type:"order", prompt:"Підрядне з weil:", words:["Ich","bleibe","zu","Hause",",","weil","ich","müde","bin"], answer:["Ich","bleibe","zu","Hause",",","weil","ich","müde","bin"], expl:"weil → bin в самому кінці." },
      { type:"order", prompt:"З deshalb (інверсія):", words:["Ich","bin","krank",",","deshalb","gehe","ich","nicht","arbeiten"], answer:["Ich","bin","krank",",","deshalb","gehe","ich","nicht","arbeiten"], expl:"Після deshalb одразу дієслово (gehe) — інверсія." },
      { type:"fill", q:"___ ich Zeit habe, rufe ich dich an. (умова)", blankHint:"коли/якщо", answer:"Wenn", alts:["wenn"], expl:"Умова → wenn (не als)." },
    ],
  },
  {
    id: "genitiv", title: "Genitiv", titleUk: "Родовий відмінок", color: "#c47a8b",
    rules: [
      { de: "Артиклі: des/eines (m,n) + -s/-es; der/einer (f, Pl).", expl: "das Auto des Mannes, die Tasche der Frau." },
      { de: "Прийменники з Genitiv: wegen, trotz, während, statt.", expl: "wegen des Wetters, während der Pause." },
      { de: "Чоловічий/середній іменник отримує -s або -es.", expl: "des Hundes, des Kindes, des Autos." },
      { de: "Питання: wessen? — чий/чия.", expl: "Wessen Buch ist das?" },
      { de: "Розмовно часто von + Dativ.", expl: "das Auto von meinem Vater." },
    ],
    questions: [
      { type:"fill", q:"Das ist das Auto ___ Mannes. (m)", blankHint:"des/der", answer:"des", expl:"m Genitiv = des (+ -es → Mannes)." },
      { type:"fill", q:"Die Farbe ___ Tür gefällt mir. (f)", blankHint:"f, Gen.", answer:"der", expl:"f Genitiv = der." },
      { type:"fill", q:"___ des Regens bleiben wir zu Hause.", blankHint:"wegen", answer:"Wegen", alts:["wegen"], expl:"wegen + Genitiv." },
      { type:"fill", q:"Während ___ Ferien war ich in Italien. (Pl.)", blankHint:"Pl., Gen.", answer:"der", expl:"Множина Genitiv = der." },
      { type:"mc", q:"«попри погану погоду»:", options:["trotz dem schlechten Wetter","trotz des schlechten Wetters","trotz das schlechte Wetter","trotz der schlechte Wetter"], answer:1, expl:"trotz + Genitiv: des schlechten Wetters." },
      { type:"mc", q:"«Чия це сумка?» —", options:["Wer Tasche ist das?","Wessen Tasche ist das?","Wem Tasche ist das?","Wen Tasche ist das?"], answer:1, expl:"wessen = чий/чия." },
      { type:"mc", q:"Genitiv від «das Kind»:", options:["des Kind","des Kindes","der Kindes","dem Kind"], answer:1, expl:"des + -es → des Kindes." },
      { type:"order", prompt:"Genitiv-фраза:", words:["Das","ist","die","Meinung","des","Lehrers"], answer:["Das","ist","die","Meinung","des","Lehrers"], expl:"die Meinung des Lehrers." },
      { type:"order", prompt:"З während:", words:["Während","der","Pause","trinke","ich","Kaffee"], answer:["Während","der","Pause","trinke","ich","Kaffee"], expl:"während + Genitiv, потім дієслово на позиції 2." },
      { type:"fill", q:"Statt ___ Buches hat er ein Heft gekauft. (n)", blankHint:"des", answer:"des", expl:"statt + Genitiv: des Buches." },
    ],
  },
  {
    id: "adjektiv", title: "Adjektivdeklination", titleUk: "Прикметники", color: "#d98c5f",
    rules: [
      { de: "Тип 1 — після der/die/das: -e або -en.", expl: "der gute Mann, mit dem guten Mann." },
      { de: "Тип 2 — після ein/kein/mein: m -er, n -es, f -e.", expl: "ein guter Mann, ein gutes Kind, eine gute Frau." },
      { de: "Тип 3 — без артикля: закінчення артикля.", expl: "guter Wein, kaltes Wasser, frische Milch." },
      { de: "Akkusativ змінює лише m → -en.", expl: "Ich sehe den guten / einen guten Mann." },
      { de: "Dativ майже завжди -en.", expl: "mit dem guten Freund." },
    ],
    questions: [
      { type:"fill", q:"der ___ Mann (gut, Nom.)", blankHint:"-e/-en", answer:"gute", expl:"Після der у Nom. → -e." },
      { type:"fill", q:"ein ___ Auto (neu, Nom., n)", blankHint:"мішана, n", answer:"neues", expl:"Після ein (n) → -es." },
      { type:"fill", q:"eine ___ Frau (jung, Nom., f)", blankHint:"f, Nom.", answer:"junge", expl:"Після eine → -e." },
      { type:"fill", q:"Ich trinke ___ Wasser. (kalt, без артикля, n)", blankHint:"сильна, n", answer:"kaltes", expl:"Без артикля (n) → -es." },
      { type:"mc", q:"Ich sehe ___ Mann. (alt, der-група, Akk.)", options:["der alte","den alten","dem alten","den alte"], answer:1, expl:"Akk. m: den + -en → den alten." },
      { type:"mc", q:"Mit ___ Freund. (gut, mein-група, Dat., m)", options:["meinem guten","meinem gute","meinen guten","mein guter"], answer:0, expl:"Dativ m: meinem + -en." },
      { type:"mc", q:"___ Wein schmeckt gut. (gut, без артикля, m)", options:["Gute","Guter","Guten","Gutes"], answer:1, expl:"Без артикля m Nom. = -er → guter." },
      { type:"mc", q:"die ___ Kinder (klein, Pl.)", options:["kleine","kleinen","kleines","kleiner"], answer:1, expl:"Після die (Pl.) → -en." },
      { type:"order", prompt:"Складіть фразу (Akk.):", words:["Ich","kaufe","einen","roten","Apfel"], answer:["Ich","kaufe","einen","roten","Apfel"], expl:"einen (Akk. m) + roten." },
      { type:"fill", q:"Wir wohnen in einem ___ Haus. (groß, Dat., n)", blankHint:"Dat., -en", answer:"großen", expl:"Dativ n → einem großen." },
    ],
  },
  {
    id: "verbpraep", title: "Verben mit Präpositionen", titleUk: "Дієслова з прийменниками", color: "#6a9bd1",
    rules: [
      { de: "Дієслова мають сталий прийменник + відмінок.", expl: "warten auf (A), denken an (A), helfen bei (D)." },
      { de: "sich freuen auf (A) — майбутнє; über (A) — наявне.", expl: "auf den Urlaub / über das Geschenk." },
      { de: "Питання про річ: wo(r) + прийменник.", expl: "Worauf wartest du? Woran denkst du?" },
      { de: "Вказівка на річ: da(r) + прийменник.", expl: "Ich denke daran. Ich warte darauf." },
      { de: "Про особу: прийменник + wen/wem.", expl: "An wen denkst du?" },
    ],
    questions: [
      { type:"fill", q:"Ich warte ___ den Bus.", blankHint:"warten ___", answer:"auf", expl:"warten auf + Akkusativ." },
      { type:"fill", q:"Sie denkt oft ___ ihre Familie.", blankHint:"denken ___", answer:"an", expl:"denken an + Akkusativ." },
      { type:"fill", q:"Ich freue mich ___ das Wochenende. (майбутнє)", blankHint:"auf/über", answer:"auf", expl:"майбутнє → sich freuen auf." },
      { type:"fill", q:"Er hilft mir ___ den Hausaufgaben.", blankHint:"helfen ___", answer:"bei", expl:"helfen bei + Dativ." },
      { type:"mc", q:"«На що ти чекаєш?» —", options:["Worauf wartest du?","Auf was du wartest?","Worüber wartest du?","Woran wartest du?"], answer:0, expl:"warten auf → worauf." },
      { type:"mc", q:"«Я думаю про це» —", options:["Ich denke darüber.","Ich denke daran.","Ich denke davon.","Ich denke darauf."], answer:1, expl:"denken an → daran." },
      { type:"mc", q:"Ich interessiere mich ___ Musik.", options:["für","auf","an","über"], answer:0, expl:"sich interessieren für + Akk." },
      { type:"order", prompt:"Складіть речення:", words:["Ich","freue","mich","auf","die","Ferien"], answer:["Ich","freue","mich","auf","die","Ferien"], expl:"sich freuen auf + Akk; mich після дієслова." },
      { type:"order", prompt:"Питання про річ:", words:["Worüber","sprecht","ihr","gerade"], answer:["Worüber","sprecht","ihr","gerade"], expl:"sprechen über → worüber." },
      { type:"fill", q:"Wir sprechen ___ das Problem.", blankHint:"sprechen ___", answer:"über", expl:"sprechen über + Akkusativ." },
    ],
  },
  {
    id: "temporal", title: "Temporale Nebensätze", titleUk: "Часові підрядні", color: "#8aa05f",
    rules: [
      { de: "bevor — «перш ніж».", expl: "Bevor ich gehe, trinke ich Kaffee." },
      { de: "nachdem — «після того як»: + Perfekt/Plusquamperfekt.", expl: "Nachdem ich gegessen hatte, ging ich los." },
      { de: "während — одночасні дії.", expl: "Während ich koche, hört sie Musik." },
      { de: "seit / seitdem — «відколи», триваюча дія.", expl: "Seitdem ich hier wohne, bin ich glücklich." },
      { de: "Дієслово завжди в кінці підрядного.", expl: "Bevor du kommst, räume ich auf." },
    ],
    questions: [
      { type:"fill", q:"___ ich frühstücke, putze ich die Zähne.", blankHint:"перш ніж", answer:"Bevor", alts:["bevor"], expl:"bevor; frühstücke в кінці." },
      { type:"fill", q:"___ ich gegessen hatte, ging ich spazieren.", blankHint:"після того як", answer:"Nachdem", alts:["nachdem"], expl:"nachdem + Plusquamperfekt." },
      { type:"fill", q:"Nachdem er angekommen ___, rief er an. (Plusqu., sein)", blankHint:"war/hatte", answer:"war", expl:"ankommen → sein: war angekommen." },
      { type:"fill", q:"___ ich in Köln wohne, lerne ich Deutsch.", blankHint:"відколи", answer:"Seitdem", alts:["seitdem","Seit","seit"], expl:"seitdem — триваюча дія." },
      { type:"mc", q:"Правильна логіка з nachdem:", options:["Nachdem ich esse, gehe ich.","Nachdem ich gegessen habe, gehe ich.","Nachdem ich gehe, esse ich.","Nachdem ich essen, gehe ich."], answer:1, expl:"nachdem → завершена дія (Perfekt) + Präsens." },
      { type:"mc", q:"«Поки я готую, він читає» —", options:["Bevor ich koche, liest er.","Während ich koche, liest er.","Nachdem ich koche, liest er.","Seitdem ich koche, liest er."], answer:1, expl:"Одночасність → während." },
      { type:"mc", q:"Дієслово в часовому підрядному:", options:["на позиції 2","після підмета","в самому кінці","перед сполучником"], answer:2, expl:"У Nebensatz дієслово — в кінці." },
      { type:"order", prompt:"Складіть речення:", words:["Bevor","ich","schlafe",",","lese","ich","ein","Buch"], answer:["Bevor","ich","schlafe",",","lese","ich","ein","Buch"], expl:"bevor…schlafe, потім інверсія lese ich." },
      { type:"order", prompt:"З nachdem:", words:["Nachdem","wir","gegessen","hatten",",","gingen","wir","ins","Kino"], answer:["Nachdem","wir","gegessen","hatten",",","gingen","wir","ins","Kino"], expl:"Plusquamperfekt + Präteritum." },
      { type:"fill", q:"Während du ___, koche ich. (arbeiten, du)", blankHint:"дієслово в кінці", answer:"arbeitest", expl:"arbeitest у кінці підрядного." },
    ],
  },
  {
    id: "infinitivzu", title: "Infinitiv mit zu", titleUk: "Інфінітив із zu", color: "#b88bc4",
    rules: [
      { de: "Багато виразів вимагають zu + Infinitiv у кінці.", expl: "Ich habe vor, früh aufzustehen." },
      { de: "Дієслова з префіксом: zu всередині — an-zu-rufen.", expl: "Ich vergesse, dich anzurufen." },
      { de: "Без zu: модальні, werden, gehen/bleiben + Inf.", expl: "Ich kann schwimmen. Ich gehe einkaufen." },
      { de: "um…zu — мета, той самий підмет.", expl: "Ich spare, um ein Auto zu kaufen." },
      { de: "ohne…zu / statt…zu.", expl: "Er ging, ohne sich zu verabschieden." },
    ],
    questions: [
      { type:"fill", q:"Ich habe vor, nach Berlin ___ fahren.", blankHint:"zu?", answer:"zu", expl:"vorhaben → zu + Infinitiv." },
      { type:"fill", q:"Vergiss nicht, mich ___! (anrufen)", blankHint:"an…zu…", answer:"anzurufen", expl:"Префікс: an-zu-rufen → anzurufen." },
      { type:"mc", q:"Де НЕ потрібне zu?", options:["Ich versuche, zu schlafen.","Ich kann gut schwimmen.","Es ist Zeit, zu gehen.","Ich hoffe, dich zu sehen."], answer:1, expl:"Після können — Infinitiv без zu." },
      { type:"mc", q:"«Я навчаюсь, щоб знайти роботу» —", options:["Ich lerne, um Arbeit zu finden.","Ich lerne, zu Arbeit finden.","Ich lerne, damit Arbeit zu finden.","Ich lerne um Arbeit finden."], answer:0, expl:"um…zu + Infinitiv." },
      { type:"mc", q:"«Він пішов, не попрощавшись» —", options:["…, ohne sich verabschieden.","…, ohne sich zu verabschieden.","…, ohne zu sich verabschieden.","…, statt sich zu verabschieden."], answer:1, expl:"ohne…zu + Infinitiv." },
      { type:"fill", q:"Es macht Spaß, Deutsch ___ lernen.", blankHint:"zu", answer:"zu", expl:"«Es macht Spaß, … zu + Infinitiv»." },
      { type:"mc", q:"Правильно з модальним:", options:["Ich muss zu arbeiten.","Ich muss arbeiten.","Ich muss zu arbeiten gehen.","Ich muss arbeiten zu."], answer:1, expl:"Після müssen — без zu." },
      { type:"order", prompt:"З um…zu:", words:["Ich","jogge",",","um","fit","zu","bleiben"], answer:["Ich","jogge",",","um","fit","zu","bleiben"], expl:"um + … + zu + Infinitiv." },
      { type:"order", prompt:"З vorhaben:", words:["Wir","haben","vor",",","ein","Haus","zu","kaufen"], answer:["Wir","haben","vor",",","ein","Haus","zu","kaufen"], expl:"vorhaben → zu kaufen у кінці." },
      { type:"fill", q:"Ich freue mich darauf, dich ___ sehen.", blankHint:"zu", answer:"zu", expl:"darauf + zu + Infinitiv." },
    ],
  },
  {
    id: "ndeklination", title: "n-Deklination", titleUk: "N-відмінювання", color: "#c4a05f",
    rules: [
      { de: "Деякі m-іменники беруть -n/-en всюди, крім Nom. Sing.", expl: "der Junge → den/dem/des Jungen." },
      { de: "Зазвичай особи: Mensch, Kunde, Kollege, Nachbar, Student.", expl: "Ich helfe dem Kollegen." },
      { de: "Іноземні на -ent, -ant, -ist, -at.", expl: "der Präsident → den Präsidenten." },
      { de: "der Herr: Sing. -n, Plural -en.", expl: "den Herrn / die Herren." },
      { de: "der Name, der Gedanke: -ns у Genitiv.", expl: "des Namens, dem Namen." },
    ],
    questions: [
      { type:"fill", q:"Ich sehe den ___. (Junge, Akk.)", blankHint:"+n", answer:"Jungen", expl:"den Jungen." },
      { type:"fill", q:"Ich helfe dem ___. (Kollege, Dat.)", blankHint:"+n", answer:"Kollegen", expl:"dem Kollegen." },
      { type:"fill", q:"Das ist die Tasche des ___. (Student, Gen.)", blankHint:"+en", answer:"Studenten", expl:"des Studenten." },
      { type:"fill", q:"Wir sprechen mit dem ___. (Nachbar, Dat.)", blankHint:"+n", answer:"Nachbarn", expl:"dem Nachbarn." },
      { type:"mc", q:"«Ich treffe ___ Präsidenten» (Akk.):", options:["der","den","dem","des"], answer:1, expl:"Akk. m: den." },
      { type:"mc", q:"Genitiv від «der Name»:", options:["des Name","des Namen","des Namens","der Namens"], answer:2, expl:"des Namens (-ns)." },
      { type:"mc", q:"Яке слово НЕ n-Deklination?", options:["der Mensch","der Tisch","der Kunde","der Student"], answer:1, expl:"der Tisch — звичайний іменник." },
      { type:"order", prompt:"Складіть речення:", words:["Ich","kenne","diesen","netten","Kollegen"], answer:["Ich","kenne","diesen","netten","Kollegen"], expl:"diesen netten Kollegen (Akk.)." },
      { type:"fill", q:"Ich gebe dem ___ das Buch. (Herr, Dat. Sing.)", blankHint:"+n", answer:"Herrn", expl:"dem Herrn (Sing. лише -n)." },
      { type:"mc", q:"Dativ Plural «der Student»:", options:["den Studenten","dem Student","den Studente","des Studenten"], answer:0, expl:"den Studenten." },
    ],
  },
  {
    id: "komparativ", title: "Komparativ & Superlativ", titleUk: "Ступені порівняння", color: "#5fb38a",
    rules: [
      { de: "Komparativ: -er; Superlativ: am …-sten.", expl: "schnell – schneller – am schnellsten." },
      { de: "Короткі прикметники часто з Umlaut.", expl: "alt – älter; groß – größer." },
      { de: "Неправильні: gut–besser–am besten; viel–mehr; gern–lieber; hoch–höher.", expl: "Запам’ятати окремо." },
      { de: "Порівняння: so…wie (рівність), -er als (нерівність).", expl: "so groß wie / größer als." },
      { de: "Superlativ перед іменником відмінюється.", expl: "der schnellste Zug." },
    ],
    questions: [
      { type:"fill", q:"Mein Bruder ist ___ als ich. (groß, Komp.)", blankHint:"+ Umlaut", answer:"größer", expl:"groß → größer." },
      { type:"fill", q:"Das ist der ___ Tag des Jahres. (lang, Superl., m)", blankHint:"der …-ste", answer:"längste", expl:"lang → längste." },
      { type:"fill", q:"Ich trinke ___ Tee als Kaffee. (gern, Komp.)", blankHint:"неправильне", answer:"lieber", expl:"gern → lieber." },
      { type:"fill", q:"Anna läuft am ___. (schnell, Superl.)", blankHint:"am …-sten", answer:"schnellsten", expl:"am schnellsten." },
      { type:"mc", q:"«Він такий же високий, як я» —", options:["Er ist größer als ich.","Er ist so groß wie ich.","Er ist so groß als ich.","Er ist größer wie ich."], answer:1, expl:"Рівність → so…wie." },
      { type:"mc", q:"Superlativ від «gut»:", options:["am guten","am gutesten","am besten","am meisten"], answer:2, expl:"gut → am besten." },
      { type:"mc", q:"«Дорожче, ніж…» —", options:["teurer wie","teurer als","teurer wie als","so teuer als"], answer:1, expl:"Нерівність → -er + als." },
      { type:"order", prompt:"Порівняння:", words:["Berlin","ist","größer","als","Köln"], answer:["Berlin","ist","größer","als","Köln"], expl:"größer + als." },
      { type:"fill", q:"Das ist die ___ Idee von allen. (gut, Superl., f)", blankHint:"неправильне + -e", answer:"beste", expl:"die beste Idee." },
      { type:"mc", q:"viel → … → am meisten:", options:["vieler","mehr","viele","meister"], answer:1, expl:"viel → mehr." },
    ],
  },
  {
    id: "futur", title: "Futur I", titleUk: "Майбутній час", color: "#8b9bc4",
    rules: [
      { de: "Futur I: werden + Infinitiv у кінці.", expl: "Ich werde morgen kommen." },
      { de: "werden: werde, wirst, wird, werden, werdet, werden.", expl: "Du wirst es schaffen." },
      { de: "Майбутнє часто = Präsens + час.", expl: "Morgen fahre ich nach Hause." },
      { de: "Futur I = припущення (з wohl).", expl: "Er wird wohl zu Hause sein." },
      { de: "Infinitiv завжди в кінці.", expl: "Wir werden nächstes Jahr heiraten." },
    ],
    questions: [
      { type:"fill", q:"Ich ___ morgen ins Kino gehen.", blankHint:"ich-форма", answer:"werde", expl:"ich werde + Infinitiv." },
      { type:"fill", q:"Du ___ bestimmt gewinnen.", blankHint:"du-форма", answer:"wirst", expl:"du wirst." },
      { type:"fill", q:"Wir ___ nächstes Jahr umziehen.", blankHint:"wir-форма", answer:"werden", expl:"wir werden." },
      { type:"mc", q:"Правильний порядок:", options:["Ich werde gehen morgen.","Morgen ich werde gehen.","Ich werde morgen gehen.","Ich gehen werde morgen."], answer:2, expl:"werden на позиції 2, Infinitiv у кінці." },
      { type:"mc", q:"«Він, мабуть, спить»:", options:["Er wird wohl schlafen.","Er schläft werden.","Er wird schlafen wohl.","Er wohl wird schlafen."], answer:0, expl:"Futur I + wohl = припущення." },
      { type:"fill", q:"Sie (Pl.) ___ uns helfen.", blankHint:"sie-Pl.", answer:"werden", expl:"sie werden." },
      { type:"mc", q:"Форма для «ihr»:", options:["ihr werdet","ihr werden","ihr wird","ihr wirst"], answer:0, expl:"ihr werdet." },
      { type:"order", prompt:"Складіть речення:", words:["Ich","werde","dich","morgen","anrufen"], answer:["Ich","werde","dich","morgen","anrufen"], expl:"werde на позиції 2, anrufen у кінці." },
      { type:"order", prompt:"Припущення:", words:["Sie","wird","jetzt","wohl","zu","Hause","sein"], answer:["Sie","wird","jetzt","wohl","zu","Hause","sein"], expl:"wird…wohl…sein." },
      { type:"fill", q:"Es ___ bald regnen.", blankHint:"es-форма", answer:"wird", expl:"es wird + Infinitiv." },
    ],
  },
];

// ---------- helpers ----------
const norm = (s) =>
  (s || "").toString().trim().toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

function matchAnswer(input, q) {
  const cands = [q.answer, ...(q.alts || [])];
  return cands.some((c) => norm(c) === norm(input));
}
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const allCards = () =>
  MODULES.flatMap((m) => m.questions.map((q, i) => ({ ...q, mod: m.id, key: `${m.id}#${i}` })));

const BOX_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };

// ---------- SRS reducer ----------
function srsReducer(state, action) {
  switch (action.type) {
    case "answer": {
      const prev = state[action.key] || { box: 1, due: 0, seen: 0, correct: 0 };
      const box = action.correct ? Math.min(5, prev.box + 1) : 1;
      const due = (action.now || Date.now()) + BOX_DAYS[box] * 86400000;
      return { ...state, [action.key]: { box, due, seen: prev.seen + 1, correct: prev.correct + (action.correct ? 1 : 0) } };
    }
    case "import": return action.payload || {};
    case "reset": return {};
    default: return state;
  }
}

// ============================================================
export default function App() {
  const [srs, dispatch] = useReducer(srsReducer, {});
  const [view, setView] = useState({ name: "home" });
  const [dark, setDark] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showUk, setShowUk] = useState(true);
  const fileRef = useRef(null);

  const cards = useMemo(() => allCards(), []);
  const now = Date.now();

  const dueCards = useMemo(
    () => cards.filter((c) => { const s = srs[c.key]; return !s || s.due <= now; }),
    [cards, srs, now]
  );

  const moduleStats = useMemo(() => {
    const map = {};
    for (const m of MODULES) {
      const qs = m.questions.map((_, i) => `${m.id}#${i}`);
      const mastered = qs.filter((k) => (srs[k]?.box || 0) >= 4).length;
      const started = qs.filter((k) => srs[k]).length;
      map[m.id] = { mastered, total: qs.length, started, pct: Math.round((mastered / qs.length) * 100) };
    }
    return map;
  }, [srs]);

  const theme = dark
    ? { bg: "#13151a", panel: "#1c1f27", panel2: "#23272f", text: "#eef0f4", dim: "#9aa0ab", line: "#2c313b", accent: "#e0a458" }
    : { bg: "#f6f4ef", panel: "#ffffff", panel2: "#f0ede5", text: "#1d2128", dim: "#6b7280", line: "#e4e0d6", accent: "#c47a3a" };

  function exportProgress() {
    const blob = new Blob([JSON.stringify({ srs, streak }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "german-b1-progress.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function importProgress(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); dispatch({ type: "import", payload: d.srs || {} }); setStreak(d.streak || 0); } catch {} };
    r.readAsText(f);
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background .3s" }}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        .focusable:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 2px; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 10, background: theme.bg + "ee", backdropFilter: "blur(8px)", borderBottom: `1px solid ${theme.line}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button className="focusable" onClick={() => setView({ name: "home" })} style={{ background: "none", border: "none", color: theme.text, display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <span style={{ fontSize: 22 }}>🇩🇪</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>Grammatik B1</span>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dueCards.length > 0 && (
            <span style={{ fontSize: 12, color: theme.dim }}>{dueCards.length} до повтору</span>
          )}
          <button className="focusable" title="Українські переклади" onClick={() => setShowUk((v) => !v)} style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>{showUk ? "🇺🇦" : "🇩🇪"}</button>
          <button className="focusable" onClick={() => setDark((v) => !v)} style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "22px 18px 80px" }}>
        <AnimatePresence mode="wait">
          {view.name === "home" && (
            <Home key="home" theme={theme} moduleStats={moduleStats} dueCount={dueCards.length} streak={streak}
              onStartSession={() => setView({ name: "session", mode: "due" })}
              onDiagnostic={() => setView({ name: "session", mode: "diagnostic" })}
              onModule={(id) => setView({ name: "module", id })}
              onExport={exportProgress} onImport={() => fileRef.current?.click()} />
          )}
          {view.name === "module" && (
            <ModuleView key={"m" + view.id} theme={theme} showUk={showUk}
              module={MODULES.find((m) => m.id === view.id)} stats={moduleStats[view.id]}
              onBack={() => setView({ name: "home" })}
              onPractice={() => setView({ name: "session", mode: "module", id: view.id })} />
          )}
          {view.name === "session" && (
            <Session key={"s" + view.mode + (view.id || "")} theme={theme} showUk={showUk}
              mode={view.mode} moduleId={view.id} cards={cards} dueCards={dueCards} srs={srs}
              onAnswer={(key, correct) => dispatch({ type: "answer", key, correct, now: Date.now() })}
              onDone={(acc) => { if (acc >= 70) setStreak((s) => s + 1); setView({ name: "summary", acc, mode: view.mode, id: view.id }); }}
              onQuit={() => setView({ name: "home" })} />
          )}
          {view.name === "summary" && (
            <Summary key="sum" theme={theme} acc={view.acc} streak={streak}
              onAgain={() => setView({ name: "session", mode: view.mode, id: view.id })}
              onHome={() => setView({ name: "home" })} />
          )}
        </AnimatePresence>
      </main>

      <input ref={fileRef} type="file" accept="application/json" onChange={importProgress} style={{ display: "none" }} />
    </div>
  );
}

// ---------- Home ----------
function Home({ theme, moduleStats, dueCount, streak, onStartSession, onDiagnostic, onModule, onExport, onImport }) {
  const totalMastered = Object.values(moduleStats).reduce((a, s) => a + s.mastered, 0);
  const totalQ = Object.values(moduleStats).reduce((a, s) => a + s.total, 0);
  const overall = Math.round((totalMastered / totalQ) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ marginBottom: 8, fontSize: 13, color: theme.dim }}>Активне пригадування + інтервальне повторення</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 18px", letterSpacing: "-0.03em" }}>
        Опануй граматику <span style={{ color: theme.accent }}>B1</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Stat theme={theme} big={overall + "%"} label="Загальне опанування" />
        <Stat theme={theme} big={streak + " 🔥"} label="Серія днів ≥70%" />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button className="focusable" onClick={onStartSession} style={{ flex: "1 1 220px", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 12, padding: "16px 18px", fontSize: 16, fontWeight: 700 }}>
          ▶ Сесія на сьогодні{dueCount ? ` · ${dueCount}` : ""}
        </button>
        <button className="focusable" onClick={onDiagnostic} style={{ flex: "1 1 220px", background: theme.panel, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "16px 18px", fontSize: 16, fontWeight: 600 }}>
          🎯 Діагностичний тест
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <button className="focusable" onClick={onExport} style={{ fontSize: 12, color: theme.dim, background: "none", border: `1px solid ${theme.line}`, borderRadius: 8, padding: "6px 10px" }}>⬇ Зберегти прогрес</button>
        <button className="focusable" onClick={onImport} style={{ fontSize: 12, color: theme.dim, background: "none", border: `1px solid ${theme.line}`, borderRadius: 8, padding: "6px 10px" }}>⬆ Завантажити прогрес</button>
      </div>

      <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, margin: "0 0 12px" }}>Модулі граматики</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {MODULES.map((m, i) => {
          const s = moduleStats[m.id];
          return (
            <motion.button key={m.id} className="focusable" onClick={() => onModule(m.id)}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ x: 3 }}
              style={{ textAlign: "left", background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, color: theme.text }}>
              <span style={{ width: 8, height: 38, borderRadius: 4, background: m.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
                <div style={{ fontSize: 12.5, color: theme.dim }}>{m.titleUk}</div>
              </div>
              <div style={{ width: 90, flexShrink: 0 }}>
                <div style={{ height: 6, borderRadius: 4, background: theme.panel2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.pct}%`, background: m.color, transition: "width .4s" }} />
                </div>
                <div style={{ fontSize: 11, color: theme.dim, marginTop: 4, textAlign: "right" }}>{s.pct}%</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function Stat({ theme, big, label }) {
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{big}</div>
      <div style={{ fontSize: 12.5, color: theme.dim }}>{label}</div>
    </div>
  );
}

// ---------- Module (rules + start practice) ----------
function ModuleView({ theme, module: m, stats, onBack, onPractice, showUk }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>← Назад</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ width: 10, height: 30, borderRadius: 4, background: m.color }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{m.title}</h1>
      </div>
      <div style={{ color: theme.dim, marginBottom: 20, marginLeft: 22 }}>{m.titleUk} · {stats.pct}% опановано</div>

      <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
        {m.rules.map((r, i) => (
          <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 6 }}>{r.de}</div>
            {showUk && <div style={{ fontSize: 13.5, color: theme.dim, lineHeight: 1.5 }}>{r.expl}</div>}
          </div>
        ))}
      </div>

      <button className="focusable" onClick={onPractice} style={{ width: "100%", background: m.color, color: "#1a1206", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700 }}>
        ▶ Тренувати ({m.questions.length} завдань)
      </button>
    </motion.div>
  );
}

// ---------- Session ----------
function Session({ theme, mode, moduleId, cards, dueCards, srs, onAnswer, onDone, onQuit, showUk }) {
  const queue = useMemo(() => {
    if (mode === "module") return shuffle(cards.filter((c) => c.mod === moduleId));
    if (mode === "diagnostic") {
      // one random Q per module + fill to 20
      const perMod = MODULES.map((m) => { const list = cards.filter((c) => c.mod === m.id); return list[Math.floor(Math.random() * list.length)]; });
      const rest = shuffle(cards.filter((c) => !perMod.includes(c))).slice(0, 20 - perMod.length);
      return shuffle([...perMod, ...rest]);
    }
    // due session: due first, then new, cap 15
    const due = shuffle(dueCards);
    return due.slice(0, 15);
  }, [mode, moduleId, cards, dueCards]);

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const total = queue.length;
  const card = queue[idx];

  if (!card) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p style={{ color: theme.dim }}>Немає карток до повтору зараз — усе опановано на сьогодні. 🎉</p>
        <button className="focusable" onClick={onQuit} style={{ background: theme.accent, border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 700, color: "#1a1206" }}>На головну</button>
      </motion.div>
    );
  }

  function handle(correct) {
    onAnswer(card.key, correct);
    setResults((r) => [...r, correct]);
  }
  function next() {
    if (idx + 1 >= total) {
      const acc = Math.round((results.filter(Boolean).length / total) * 100);
      onDone(acc);
    } else setIdx((i) => i + 1);
  }

  return (
    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="focusable" onClick={onQuit} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, padding: 0 }}>✕ Вийти</button>
        <span style={{ fontSize: 13, color: theme.dim }}>{idx + 1} / {total}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: theme.panel2, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / total) * 100}%`, background: theme.accent, transition: "width .3s" }} />
      </div>

      <Card key={card.key} theme={theme} card={card} onResult={handle} onNext={next} showUk={showUk} />
    </motion.div>
  );
}

// ---------- Card (3 exercise types) ----------
function Card({ theme, card, onResult, onNext, showUk }) {
  const [phase, setPhase] = useState("answer"); // answer | feedback
  const [correct, setCorrect] = useState(false);
  const modColor = MODULES.find((m) => m.id === card.mod)?.color || theme.accent;

  // FILL
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (card.type === "fill") inputRef.current?.focus(); }, [card]);

  // MC
  const [picked, setPicked] = useState(null);

  // ORDER
  const [pool, setPool] = useState(card.type === "order" ? shuffle(card.words) : []);
  const [built, setBuilt] = useState([]);

  function submitFill() {
    if (phase === "feedback" || !text.trim()) return;
    const ok = matchAnswer(text, card);
    setCorrect(ok); setPhase("feedback"); onResult(ok);
  }
  function pickMC(i) {
    if (phase === "feedback") return;
    setPicked(i);
    const ok = i === card.answer;
    setCorrect(ok); setPhase("feedback"); onResult(ok);
  }
  function submitOrder() {
    if (phase === "feedback") return;
    const ok = JSON.stringify(built) === JSON.stringify(card.answer);
    setCorrect(ok); setPhase("feedback"); onResult(ok);
  }

  // keyboard
  useEffect(() => {
    function onKey(e) {
      if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onNext(); return; }
      if (card.type === "fill" && e.key === "Enter") { e.preventDefault(); submitFill(); }
      if (card.type === "mc" && phase === "answer") {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= card.options.length) pickMC(n - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const fb = correct ? "#4caf7d" : "#e06a6a";

  return (
    <div>
      <div style={{ display: "inline-block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: modColor, fontWeight: 700, marginBottom: 12 }}>
        {MODULES.find((m) => m.id === card.mod)?.title}
        <span style={{ color: theme.dim, marginLeft: 8, fontWeight: 500 }}>
          {card.type === "fill" ? "впишіть" : card.type === "mc" ? "оберіть" : "складіть"}
        </span>
      </div>

      {/* FILL */}
      {card.type === "fill" && (
        <div>
          <p style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 600, margin: "0 0 16px" }}>{card.q}</p>
          <input ref={inputRef} className="focusable" value={text} disabled={phase === "feedback"}
            onChange={(e) => setText(e.target.value)} placeholder={card.blankHint || "Ваша відповідь"}
            style={{ width: "100%", fontSize: 18, padding: "13px 15px", borderRadius: 10, border: `2px solid ${phase === "feedback" ? fb : theme.line}`, background: theme.panel, color: theme.text, outline: "none" }} />
        </div>
      )}

      {/* MC */}
      {card.type === "mc" && (
        <div>
          <p style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 600, margin: "0 0 16px" }}>{card.q}</p>
          <div style={{ display: "grid", gap: 8 }}>
            {card.options.map((o, i) => {
              let bg = theme.panel, bd = theme.line;
              if (phase === "feedback") {
                if (i === card.answer) { bg = "#1f3b2e"; bd = "#4caf7d"; }
                else if (i === picked) { bg = "#3b2020"; bd = "#e06a6a"; }
              } else if (i === picked) bd = modColor;
              return (
                <button key={i} className="focusable" onClick={() => pickMC(i)} disabled={phase === "feedback"}
                  style={{ textAlign: "left", background: bg, border: `2px solid ${bd}`, borderRadius: 10, padding: "13px 15px", color: theme.text, fontSize: 16, display: "flex", gap: 10 }}>
                  <span style={{ color: theme.dim, fontSize: 13, fontWeight: 700, minWidth: 16 }}>{i + 1}</span>
                  <span>{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDER */}
      {card.type === "order" && (
        <div>
          <p style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 600, margin: "0 0 14px", color: theme.dim }}>{card.prompt}</p>
          <div style={{ minHeight: 54, border: `2px dashed ${phase === "feedback" ? fb : theme.line}`, borderRadius: 10, padding: 10, display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, background: theme.panel }}>
            {built.length === 0 && <span style={{ color: theme.dim, fontSize: 14, alignSelf: "center" }}>Натискайте слова за порядком →</span>}
            {built.map((w, i) => (
              <button key={i} className="focusable" disabled={phase === "feedback"}
                onClick={() => { setBuilt((b) => b.filter((_, j) => j !== i)); setPool((p) => [...p, w]); }}
                style={{ background: modColor, color: "#1a1206", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 16, fontWeight: 600 }}>{w}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {pool.map((w, i) => (
              <button key={i} className="focusable" disabled={phase === "feedback"}
                onClick={() => { setBuilt((b) => [...b, w]); setPool((p) => p.filter((_, j) => j !== i)); }}
                style={{ background: theme.panel2, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 8, padding: "7px 12px", fontSize: 16 }}>{w}</button>
            ))}
          </div>
          {phase === "answer" && (
            <button className="focusable" onClick={submitOrder} disabled={pool.length > 0}
              style={{ marginTop: 16, width: "100%", background: pool.length ? theme.panel2 : modColor, color: pool.length ? theme.dim : "#1a1206", border: "none", borderRadius: 10, padding: "13px", fontSize: 16, fontWeight: 700 }}>
              Перевірити
            </button>
          )}
        </div>
      )}

      {/* submit for fill */}
      {card.type === "fill" && phase === "answer" && (
        <button className="focusable" onClick={submitFill} disabled={!text.trim()}
          style={{ marginTop: 16, width: "100%", background: text.trim() ? modColor : theme.panel2, color: text.trim() ? "#1a1206" : theme.dim, border: "none", borderRadius: 10, padding: "13px", fontSize: 16, fontWeight: 700 }}>
          Перевірити <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
        </button>
      )}

      {/* FEEDBACK */}
      <AnimatePresence>
        {phase === "feedback" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
            style={{ marginTop: 16, background: theme.panel, border: `1px solid ${fb}`, borderRadius: 12, padding: "14px 16px", overflow: "hidden" }}>
            <div style={{ fontWeight: 800, color: fb, marginBottom: 6, fontSize: 15 }}>
              {correct ? "✓ Правильно!" : "✕ Не точно"}
            </div>
            {!correct && (
              <div style={{ fontSize: 15, marginBottom: 8 }}>
                Правильно: <b style={{ color: theme.text }}>{card.type === "order" ? card.answer.join(" ") : card.type === "mc" ? card.options[card.answer] : card.answer}</b>
              </div>
            )}
            {showUk && <div style={{ fontSize: 14, color: theme.dim, lineHeight: 1.55 }}>{card.expl}</div>}
            <button className="focusable" onClick={onNext}
              style={{ marginTop: 12, width: "100%", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700 }}>
              Далі <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Summary ----------
function Summary({ theme, acc, streak, onAgain, onHome }) {
  const good = acc >= 70;
  const msg = acc >= 90 ? "Чудовий результат! Тримай темп." : acc >= 70 ? "Добре! Повтори завтра — закріпиться." : "Нормальний старт. Слабкі картки повернуться раніше.";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{ textAlign: "center", padding: "40px 10px" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
        style={{ fontSize: 64, marginBottom: 10 }}>{good ? "🎉" : "💪"}</motion.div>
      <div style={{ fontSize: 48, fontWeight: 800, color: good ? "#4caf7d" : theme.accent }}>{acc}%</div>
      <div style={{ color: theme.dim, fontSize: 16, margin: "8px 0 4px" }}>точність</div>
      {good && <div style={{ fontSize: 14, color: theme.accent }}>Серія: {streak} 🔥</div>}
      <p style={{ color: theme.text, fontSize: 16, maxWidth: 380, margin: "18px auto 26px", lineHeight: 1.5 }}>{msg}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="focusable" onClick={onAgain} style={{ background: theme.accent, color: "#1a1206", border: "none", borderRadius: 10, padding: "13px 22px", fontWeight: 700, fontSize: 15 }}>Ще раз</button>
        <button className="focusable" onClick={onHome} style={{ background: theme.panel, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "13px 22px", fontWeight: 600, fontSize: 15 }}>На головну</button>
      </div>
    </motion.div>
  );
}
