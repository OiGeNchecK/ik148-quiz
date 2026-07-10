import React from "react";
import { motion } from "motion/react";
import { LANGS, STR, isRTL } from "./i18n";

/* ============================================================
   Стартовий екран: емблема школи → вибір мови навчання →
   кнопка «Далі» мовою, яку обрав користувач.
   Показується один раз (доки не натиснуто «Далі»); мову можна
   змінити пізніше в шапці застосунку.
   ============================================================ */

export default function Welcome({ theme, lang, setLang, onContinue }) {
  const s = STR[lang] || STR.uk;
  return (
    <div dir={isRTL(lang) ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 18px" }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>

        <motion.img
          src="./school-logo.png" alt="SprachHaus"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ width: 280, height: 280, marginBottom: 0 }} />

        <div style={{ fontSize: 15, color: theme.dim, marginBottom: 24, letterSpacing: "0.04em" }}>Deutsch A0–B1</div>

        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.02em" }}>{s.welcomeChoose}</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 22 }}>
          {LANGS.map((l) => {
            const active = l.id === lang;
            return (
              <button key={l.id} className="focusable" onClick={() => setLang(l.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start",
                  background: active ? theme.accent : theme.panel,
                  color: active ? "#1a1206" : theme.text,
                  border: `2px solid ${active ? theme.accent : theme.line}`,
                  borderRadius: 12, padding: "11px 13px", fontSize: 14.5, fontWeight: 700,
                }}>
                <span style={{ fontSize: 19 }}>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            );
          })}
        </div>

        <motion.button className="focusable" onClick={onContinue} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
          style={{ width: "100%", maxWidth: 360, background: theme.accent, color: "#1a1206", border: "none", borderRadius: 14, padding: "16px 20px", fontSize: 17, fontWeight: 800, letterSpacing: "0.01em" }}>
          {s.welcomeNext}
        </motion.button>
      </motion.div>
    </div>
  );
}
