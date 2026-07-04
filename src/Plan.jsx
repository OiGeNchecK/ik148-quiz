import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MODULES } from "./data";

/* ============================================================
   План на 14 днів до іспиту B1.
   Побудований на: інтервальні повторення (щоденна SRS-сесія),
   активне пригадування, interleaving, scaffolding письма,
   таймбоксинг. Чекбокси зберігаються в localStorage.
   ============================================================ */

const PLAN_KEY = "german-plan-v1";
function loadPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || {}; } catch { return {}; }
}

const PLAN = [
  { day: 1, min: 50,
    g: { mods: [], text: "Пройди «🎯 Діагностичний тест» (повний). Не засмучуйся через результат — це карта твоїх слабких місць." },
    w: { mods: ["w_brief"], text: "У розділі ✍️ прочитай «Структура» і «Банк фраз» (10 хв), потім пройди модуль:" } },
  { day: 2, min: 45,
    g: { mods: ["a1_akkusativ", "a1_wortstellung"], text: "" },
    w: { mods: ["w_redemittel"], text: "Плюс Lückentext №1 (Absage):" } },
  { day: 3, min: 45,
    g: { mods: ["a1_modal", "a1_perfekt"], text: "" },
    w: { mods: [], text: "Напиши лист «Einladung absagen» повністю. Перевір за чек-листом, потім звір зі зразком." } },
  { day: 4, min: 45,
    g: { mods: ["a2_dativ", "a2_wechsel"], text: "" },
    w: { mods: ["w_konnekt"], text: "Плюс переклад речень 1–8:" } },
  { day: 5, min: 45,
    g: { mods: ["a1_negation", "a2_nebensatz"], text: "" },
    w: { mods: [], text: "Лист «Krankmeldung» + чек-лист. Зверни увагу на формальний регістр (Sie з великої!)." } },
  { day: 6, min: 45,
    g: { mods: ["konjunktiv2", "konnektoren"], text: "" },
    w: { mods: ["w_saetze"], text: "Плюс переклад речень 9–16:" } },
  { day: 7, min: 35,
    g: { mods: [], text: "Лише «▶ Сесія на сьогодні» — SRS сам покаже, що треба повторити." },
    w: { mods: [], text: "Лист «Um Rat bitten» (неформальний). Порівняй свої фрази з банком фраз." } },
  { day: 8, min: 45,
    g: { mods: ["passiv", "relativ"], text: "" },
    w: { mods: [], text: "Lückentext №2 (Beschwerde) + переклад речень 17–24." } },
  { day: 9, min: 45,
    g: { mods: ["genitiv", "adjektiv"], text: "" },
    w: { mods: [], text: "Лист «Beschwerde: Heizung kaputt» — формальний! Обов'язково всі 3 пункти (Leitpunkte)." } },
  { day: 10, min: 40,
    g: { mods: ["verbpraep", "infinitivzu"], text: "" },
    w: { mods: [], text: "Lückentext №3 (Krankmeldung) + повтори банк фраз уголос — вимова закріплює пам'ять." } },
  { day: 11, min: 45,
    g: { mods: ["temporal", "futur"], text: "" },
    w: { mods: [], text: "Лист «Arzttermin verschieben» НА ЧАС: 25 хвилин, без словника — як на іспиті." } },
  { day: 12, min: 45,
    g: { mods: ["ndeklination", "komparativ"], text: "" },
    w: { mods: [], text: "Лист «Reklamation» НА ЧАС: 25 хвилин. Потім знайди свої 3 найчастіші помилки." } },
  { day: 13, min: 50,
    g: { mods: [], text: "Повторний «🎯 Діагностичний тест» — порівняй результат із днем 1. Потім SRS-сесія." },
    w: { mods: [], text: "Лист «Forumsbeitrag» (своя думка: einerseits/andererseits!) + Lückentext №4." } },
  { day: 14, min: 30,
    g: { mods: [], text: "Легкий день: одна SRS-сесія, нічого нового." },
    w: { mods: [], text: "Один лист на вибір за 20 хв. Переглянь структуру листа ще раз. І виспись перед іспитом 🙂" } },
];

const METHODS = [
  ["🔁", "Інтервальні повторення (Leitner)", "щоденна «Сесія на сьогодні» повертає картки саме тоді, коли ти їх майже забув(ла)."],
  ["🧠", "Активне пригадування", "спершу відповідай сам(а), потім дивись правило — так мозок запам'ятовує в рази міцніше."],
  ["🔀", "Interleaving", "у сесії змішуються теми й рівні — вчишся розрізняти правила, а не «зазубрювати» блоками."],
  ["🪜", "Scaffolding письма", "фрази → речення (Lückentext, переклад) → повний лист. Кожен крок спирається на попередній."],
  ["⏱", "Таймбоксинг", "40–50 хв щодня перемагають 5 годин раз на тиждень. Дні 11–12 — листи на час, як на іспиті."],
];

const moduleById = (id) => MODULES.find((m) => m.id === id);

export default function PlanView({ theme, onBack, onModule }) {
  const [done, setDone] = useState(loadPlan);
  useEffect(() => {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(done)); } catch {}
  }, [done]);

  const toggle = (day, part) =>
    setDone((d) => ({ ...d, [day]: { ...d[day], [part]: !d[day]?.[part] } }));

  const total = PLAN.length * 2;
  const doneCount = PLAN.reduce((a, p) => a + (done[p.day]?.g ? 1 : 0) + (done[p.day]?.w ? 1 : 0), 0);
  const nextDay = PLAN.find((p) => !(done[p.day]?.g && done[p.day]?.w));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>← Назад</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>📅 План на 14 днів до іспиту</h1>
      <p style={{ color: theme.dim, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px", maxWidth: 620 }}>
        Щодня дві частини: граматика і письмо. Познач виконане — план запам'ятає. Якщо день пропущено — просто продовжуй, не «надолужуй» подвійною порцією.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 10, borderRadius: 6, background: theme.panel2, overflow: "hidden", border: `1px solid ${theme.line}` }}>
          <div style={{ height: "100%", width: `${(doneCount / total) * 100}%`, background: theme.accent, transition: "width .4s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent, whiteSpace: "nowrap" }}>{doneCount} / {total}</span>
      </div>

      <details style={{ marginBottom: 18 }}>
        <summary className="focusable" style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: theme.dim }}>
          🔬 На яких методах побудований план
        </summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {METHODS.map(([icon, name, desc], i) => (
            <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.5 }}>
              {icon} <b>{name}</b> — <span style={{ color: theme.dim }}>{desc}</span>
            </div>
          ))}
        </div>
      </details>

      <div style={{ display: "grid", gap: 12 }}>
        {PLAN.map((p) => {
          const isNext = nextDay && nextDay.day === p.day;
          const dayDone = done[p.day]?.g && done[p.day]?.w;
          return (
            <div key={p.day}
              style={{ background: theme.panel, border: `1px solid ${isNext ? theme.accent : theme.line}`, borderRadius: 12, padding: "14px 16px", opacity: dayDone ? 0.65 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: isNext ? theme.accent : theme.text }}>День {p.day}</span>
                {isNext && <span style={{ fontSize: 10, fontWeight: 800, color: "#1a1206", background: theme.accent, borderRadius: 6, padding: "2px 6px", letterSpacing: "0.03em" }}>СЬОГОДНІ</span>}
                {dayDone && <span style={{ fontSize: 12, color: "#4caf7d", fontWeight: 700 }}>✓ виконано</span>}
                <span style={{ fontSize: 12, color: theme.dim, marginLeft: "auto" }}>≈ {p.min} хв</span>
              </div>

              {[["g", "📚 Граматика", p.g], ["w", "✍️ Письмо", p.w]].map(([part, label, task]) => (
                <div key={part} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: part === "g" ? 10 : 0 }}>
                  <input type="checkbox" checked={!!done[p.day]?.[part]} onChange={() => toggle(p.day, part)}
                    className="focusable"
                    style={{ marginTop: 3, width: 17, height: 17, flexShrink: 0, accentColor: theme.accent, cursor: "pointer" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    {task.text && <div style={{ fontSize: 14, lineHeight: 1.5, textDecoration: done[p.day]?.[part] ? "line-through" : "none", color: done[p.day]?.[part] ? theme.dim : theme.text }}>{task.text}</div>}
                    {task.mods.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {task.mods.map((id) => {
                          const m = moduleById(id);
                          if (!m) return null;
                          return (
                            <button key={id} className="focusable" onClick={() => onModule(id)}
                              style={{ background: theme.panel2, border: `1px solid ${m.color}`, color: theme.text, borderRadius: 8, padding: "5px 10px", fontSize: 12.5, fontWeight: 600 }}>
                              {m.title} →
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
