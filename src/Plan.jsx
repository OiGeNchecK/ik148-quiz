import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MODULES } from "./data";
import { useLang, useT, extra } from "./i18n";

/* ============================================================
   План на 14 днів до іспиту B1.
   Структура (модулі, хвилини) — тут; усі тексти — в i18n (extra).
   Чекбокси зберігаються в localStorage.
   ============================================================ */

const PLAN_KEY = "german-plan-v1";
function loadPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || {}; } catch { return {}; }
}

// per-day structure: recommended grammar modules (g) and writing modules (w)
const PLAN = [
  { day: 1, min: 50, g: [], w: ["w_brief"] },
  { day: 2, min: 45, g: ["a1_akkusativ", "a1_wortstellung"], w: ["w_redemittel"] },
  { day: 3, min: 45, g: ["a1_modal", "a1_perfekt"], w: [] },
  { day: 4, min: 45, g: ["a2_dativ", "a2_wechsel"], w: ["w_konnekt"] },
  { day: 5, min: 45, g: ["a1_negation", "a2_nebensatz"], w: [] },
  { day: 6, min: 45, g: ["konjunktiv2", "konnektoren"], w: ["w_saetze"] },
  { day: 7, min: 35, g: [], w: [] },
  { day: 8, min: 45, g: ["passiv", "relativ"], w: [] },
  { day: 9, min: 45, g: ["genitiv", "adjektiv"], w: [] },
  { day: 10, min: 40, g: ["verbpraep", "infinitivzu"], w: [] },
  { day: 11, min: 45, g: ["temporal", "futur"], w: [] },
  { day: 12, min: 45, g: ["ndeklination", "komparativ"], w: [] },
  { day: 13, min: 50, g: [], w: [] },
  { day: 14, min: 30, g: [], w: [] },
];

const moduleById = (id) => MODULES.find((m) => m.id === id);

export default function PlanView({ theme, onBack, onModule }) {
  const t = useT();
  const lang = useLang();
  const X = extra(lang);
  const XU = extra("uk");
  const days = X.planDays || XU.planDays;
  const methods = X.methods || XU.methods;
  const L = X.planLabels || XU.planLabels;

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
      <button className="focusable" onClick={onBack} style={{ background: theme.panel, border: `1px solid ${theme.line}`, color: theme.text, fontSize: 14, fontWeight: 600, borderRadius: 10, padding: "8px 14px", marginBottom: 14 }}>{t("back")}</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{L.title}</h1>
      <p style={{ color: theme.dim, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px", maxWidth: 620 }}>{L.intro}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 10, borderRadius: 6, background: theme.panel2, overflow: "hidden", border: `1px solid ${theme.line}` }}>
          <div style={{ height: "100%", width: `${(doneCount / total) * 100}%`, background: theme.accent, transition: "width .4s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.accent, whiteSpace: "nowrap" }}>{doneCount} / {total}</span>
      </div>

      <details style={{ marginBottom: 18 }}>
        <summary className="focusable" style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: theme.dim }}>
          {L.methodsTitle}
        </summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {methods.map(([icon, name, desc], i) => (
            <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.5 }}>
              {icon} <b>{name}</b> — <span style={{ color: theme.dim }}>{desc}</span>
            </div>
          ))}
        </div>
      </details>

      <div style={{ display: "grid", gap: 12 }}>
        {PLAN.map((p, di) => {
          const isNext = nextDay && nextDay.day === p.day;
          const dayDone = done[p.day]?.g && done[p.day]?.w;
          const texts = days[di] || {};
          return (
            <div key={p.day}
              style={{ background: theme.panel, border: `1px solid ${isNext ? theme.accent : theme.line}`, borderRadius: 12, padding: "14px 16px", opacity: dayDone ? 0.65 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: isNext ? theme.accent : theme.text }}>{L.day} {p.day}</span>
                {isNext && <span style={{ fontSize: 10, fontWeight: 800, color: "#1a1206", background: theme.accent, borderRadius: 6, padding: "2px 6px", letterSpacing: "0.03em" }}>{L.today}</span>}
                {dayDone && <span style={{ fontSize: 12, color: "#4caf7d", fontWeight: 700 }}>{L.done}</span>}
                <span style={{ fontSize: 12, color: theme.dim, marginLeft: "auto" }}>≈ {p.min} {L.min}</span>
              </div>

              {[["g", L.gram, p.g, texts.g], ["w", L.writ, p.w, texts.w]].map(([part, label, mods, text]) => (
                <div key={part} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: part === "g" ? 10 : 0 }}>
                  <input type="checkbox" checked={!!done[p.day]?.[part]} onChange={() => toggle(p.day, part)}
                    className="focusable"
                    style={{ marginTop: 3, width: 17, height: 17, flexShrink: 0, accentColor: theme.accent, cursor: "pointer" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700, marginBottom: 2 }}>{label}</div>
                    {text && <div style={{ fontSize: 14, lineHeight: 1.5, textDecoration: done[p.day]?.[part] ? "line-through" : "none", color: done[p.day]?.[part] ? theme.dim : theme.text }}>{text}</div>}
                    {mods.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {mods.map((id) => {
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
