import React, { useState, useMemo, useReducer, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { MODULES, LEVELS } from "./data";
import { GLOSSARY } from "./glossary";
import { WritingHome, WritingPromptView } from "./Writing";
import PlanView from "./Plan";
import Welcome from "./Welcome";
import { LANGS, LangContext, makeT, useT, useLang, moduleSub, levelSub, levelBlurb, isRTL } from "./i18n";

/* ============================================================
   German Grammar Trainer (A0 → A1 → A2 → B1)
   Active recall + Leitner spaced repetition.
   UI українською, граматика німецькою.
   Прогрес у пам'яті; експорт/імпорт як JSON.
   ============================================================ */

const LEVEL_ORDER = LEVELS.map((l) => l.id);
const levelIndex = (id) => LEVEL_ORDER.indexOf(id);

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
  MODULES.flatMap((m) => m.questions.map((q, i) => ({ ...q, mod: m.id, level: m.level, key: `${m.id}#${i}` })));

const moduleById = (id) => MODULES.find((m) => m.id === id);

const BOX_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 };

// ---------- persistence (auto-save progress across sessions) ----------
const STORAGE_KEY = "german-b1-progress-v1";
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

// ---------- glossary auto-linking ----------
const GLOSS_KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const GLOSS_RE = new RegExp(`(${GLOSS_KEYS.map(escapeRe).join("|")})`, "g");

function renderGloss(text, theme) {
  if (!text) return null;
  const parts = String(text).split(GLOSS_RE);
  return parts.map((p, i) =>
    GLOSSARY[p] ? <GlossTerm key={i} term={p} theme={theme} /> : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

function GlossTerm({ term, theme }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        className="focusable"
        title={GLOSSARY[term]}
        aria-label={`Пояснення терміна: ${term}`}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onBlur={() => setOpen(false)}
        style={{
          background: "none", border: "none", padding: 0, color: theme.accent,
          fontWeight: 600, borderBottom: `1px dotted ${theme.accent}`, cursor: "help",
          font: "inherit", lineHeight: "inherit",
        }}>
        {term}<sup style={{ fontSize: "0.7em", marginLeft: 1 }}>?</sup>
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="tooltip"
            style={{
              position: "absolute", left: 0, top: "100%", marginTop: 6, zIndex: 50,
              width: 260, maxWidth: "80vw", background: theme.panel2, color: theme.text,
              border: `1px solid ${theme.accent}`, borderRadius: 10, padding: "10px 12px",
              fontSize: 13, fontWeight: 400, lineHeight: 1.5, boxShadow: "0 8px 24px rgba(0,0,0,.35)",
            }}>
            <b style={{ color: theme.accent }}>{term}</b> — {GLOSSARY[term]}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

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
  const [srs, dispatch] = useReducer(srsReducer, undefined, () => loadSaved().srs || {});
  const [view, setView] = useState({ name: "home" });
  const [dark, setDark] = useState(() => loadSaved().dark ?? true);
  const [streak, setStreak] = useState(() => loadSaved().streak || 0);
  const [showUk, setShowUk] = useState(() => loadSaved().showUk ?? true);
  const [lang, setLang] = useState(() => loadSaved().lang || "uk");
  const [onboarded, setOnboarded] = useState(() => !!loadSaved().onboarded);
  const [level, setLevel] = useState("A0");
  const fileRef = useRef(null);
  const t = makeT(lang);

  // auto-save so progress survives reloads/closed tabs — the whole point of a 2-week study plan
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ srs, streak, dark, showUk, lang, onboarded })); } catch {}
  }, [srs, streak, dark, showUk, lang, onboarded]);

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

  // per-level aggregate progress
  const levelStats = useMemo(() => {
    const map = {};
    for (const lid of LEVEL_ORDER) {
      const mods = MODULES.filter((m) => m.level === lid);
      const mastered = mods.reduce((a, m) => a + moduleStats[m.id].mastered, 0);
      const total = mods.reduce((a, m) => a + moduleStats[m.id].total, 0);
      map[lid] = { mastered, total, pct: total ? Math.round((mastered / total) * 100) : 0, count: mods.length };
    }
    return map;
  }, [moduleStats]);

  // next recommended module: first (A0→B1 order) not fully mastered
  const nextModule = useMemo(
    () => MODULES.find((m) => moduleStats[m.id].mastered < moduleStats[m.id].total) || null,
    [moduleStats]
  );

  // pick a sensible starting level once (level of the next module to learn)
  const startLevelRef = useRef(false);
  useEffect(() => {
    if (!startLevelRef.current && nextModule) { setLevel(nextModule.level); startLevelRef.current = true; }
  }, [nextModule]);

  const theme = dark
    ? { bg: "#13151a", panel: "#1c1f27", panel2: "#23272f", text: "#eef0f4", dim: "#9aa0ab", line: "#2c313b", accent: "#e0a458" }
    : { bg: "#f6f4ef", panel: "#ffffff", panel2: "#f0ede5", text: "#1d2128", dim: "#6b7280", line: "#e4e0d6", accent: "#c47a3a" };

  function exportProgress() {
    const blob = new Blob([JSON.stringify({ srs, streak }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "german-progress.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function importProgress(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const d = JSON.parse(r.result); dispatch({ type: "import", payload: d.srs || {} }); setStreak(d.streak || 0); } catch {} };
    r.readAsText(f);
  }

  // school welcome screen: emblem + learning-language choice, shown until "Next"
  if (!onboarded) {
    return (
      <MotionConfig reducedMotion="user">
        <Welcome theme={theme} lang={lang} setLang={setLang} onContinue={() => setOnboarded(true)} />
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <LangContext.Provider value={lang}>
    <div dir={isRTL(lang) ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background .3s" }}>
      <style>{`
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        .focusable:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 2px; border-radius: 4px; }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 10, background: theme.bg + "ee", backdropFilter: "blur(8px)", borderBottom: `1px solid ${theme.line}`, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button className="focusable" onClick={() => setView({ name: "home" })} style={{ background: "none", border: "none", color: theme.text, display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <img src="./school-logo.png" alt="SprachHaus" style={{ width: 42, height: 42 }} />
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>SprachHaus <span style={{ fontWeight: 500, fontSize: 13, color: theme.dim }}>· A0–B1</span></span>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {dueCards.length > 0 && (
            <span style={{ fontSize: 12, color: theme.dim }}>{t("due", { n: dueCards.length })}</span>
          )}
          <select className="focusable" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Language"
            style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "6px 6px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.flag} {l.name}</option>)}
          </select>
          <button className="focusable" title={t("explToggle")} onClick={() => setShowUk((v) => !v)} style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>{showUk ? "💬" : "🇩🇪"}</button>
          <button className="focusable" onClick={() => setDark((v) => !v)} style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "6px 10px", fontSize: 13 }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </header>

      <NavBar theme={theme} view={view} setView={setView} />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "18px 18px 80px" }}>
        <AnimatePresence mode="wait">
          {view.name === "home" && (
            <Home key="home" theme={theme} moduleStats={moduleStats} levelStats={levelStats}
              level={level} setLevel={setLevel} nextModule={nextModule}
              dueCount={dueCards.length} streak={streak}
              onStartSession={() => setView({ name: "session", mode: "due" })}
              onDiagnostic={() => setView({ name: "diagstart" })}
              onContinue={() => nextModule && setView({ name: "module", id: nextModule.id })}
              onModule={(id) => setView({ name: "module", id })}
              onWriting={() => setView({ name: "writing" })}
              onPlan={() => setView({ name: "plan" })}
              onExport={exportProgress} onImport={() => fileRef.current?.click()} />
          )}
          {view.name === "plan" && (
            <PlanView key="plan" theme={theme}
              onBack={() => setView({ name: "home" })}
              onModule={(id) => setView({ name: "module", id })} />
          )}
          {view.name === "writing" && (
            <WritingHome key="writing" theme={theme}
              onBack={() => setView({ name: "home" })}
              onOpenPrompt={(id) => setView({ name: "writingPrompt", id })} />
          )}
          {view.name === "writingPrompt" && (
            <WritingPromptView key={"w" + view.id} theme={theme} promptId={view.id}
              onBack={() => setView({ name: "writing" })} />
          )}
          {view.name === "module" && (
            <ModuleView key={"m" + view.id} theme={theme} showUk={showUk}
              module={moduleById(view.id)} stats={moduleStats[view.id]}
              onBack={() => setView({ name: "home" })}
              onPractice={() => setView({ name: "session", mode: "module", id: view.id })} />
          )}
          {view.name === "diagstart" && (
            <DiagStart key="diagstart" theme={theme} levelStats={levelStats}
              onBack={() => setView({ name: "home" })}
              onStart={(lvl) => setView({ name: "session", mode: "diagnostic", level: lvl })} />
          )}
          {view.name === "session" && (
            <Session key={"s" + view.mode + (view.id || "") + (view.level || "")} theme={theme} showUk={showUk}
              mode={view.mode} moduleId={view.id} diagLevel={view.level} cards={cards} dueCards={dueCards} srs={srs}
              onAnswer={(key, correct) => dispatch({ type: "answer", key, correct, now: Date.now() })}
              onDone={(acc, extra) => { if (acc >= 70) setStreak((s) => s + 1); setView({ name: "summary", acc, mode: view.mode, id: view.id, ...extra }); }}
              onQuit={() => setView({ name: "home" })} />
          )}
          {view.name === "summary" && (
            <Summary key="sum" theme={theme} acc={view.acc} streak={streak} mode={view.mode} rec={view.rec} byLevel={view.byLevel}
              onAgain={() => setView({ name: view.mode === "diagnostic" ? "diagstart" : "session", mode: view.mode, id: view.id })}
              onGoLevel={(lvl) => { setLevel(lvl); setView({ name: "home" }); }}
              onHome={() => setView({ name: "home" })} />
          )}
        </AnimatePresence>
      </main>

      <input ref={fileRef} type="file" accept="application/json" onChange={importProgress} style={{ display: "none" }} />
    </div>
    </LangContext.Provider>
    </MotionConfig>
  );
}

// ---------- Section navigation (always visible) ----------
function NavBar({ theme, view, setView }) {
  const t = useT();
  const writingActive = view.name === "writing" || view.name === "writingPrompt";
  const planActive = view.name === "plan";
  const items = [
    { id: "home", label: "🏠 " + t("navHome"), active: !writingActive && !planActive },
    { id: "writing", label: "✍️ " + t("navWriting"), active: writingActive },
    { id: "plan", label: "📅 " + t("navPlan"), active: planActive },
  ];
  return (
    <nav style={{ maxWidth: 820, margin: "0 auto", padding: "12px 18px 0", display: "flex", gap: 8 }}>
      {items.map((it) => (
        <button key={it.id} className="focusable" onClick={() => setView({ name: it.id })}
          style={{
            flex: 1, background: it.active ? theme.accent : theme.panel,
            color: it.active ? "#1a1206" : theme.text,
            border: `2px solid ${it.active ? theme.accent : theme.line}`,
            borderRadius: 12, padding: "10px 8px", fontSize: 14, fontWeight: 800,
            transition: "background .2s, border-color .2s",
          }}>
          {it.label}
        </button>
      ))}
    </nav>
  );
}

// ---------- Level tabs ----------
function LevelTabs({ theme, level, setLevel, levelStats }) {
  const t = useT();
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
      {LEVELS.map((l) => {
        const active = l.id === level;
        const s = levelStats[l.id];
        return (
          <button key={l.id} className="focusable" onClick={() => setLevel(l.id)}
            style={{
              flex: "1 1 auto", minWidth: 78, textAlign: "center", borderRadius: 10, padding: "9px 8px",
              border: `1px solid ${active ? theme.accent : theme.line}`,
              background: active ? theme.accent : theme.panel, color: active ? "#1a1206" : theme.text,
              fontWeight: 700,
            }}>
            <div style={{ fontSize: 15 }}>{l.title}</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, opacity: active ? 0.8 : 0.7 }}>{s.pct}% · {s.count} {t("modAbbr")}</div>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Home ----------
function Home({ theme, moduleStats, levelStats, level, setLevel, nextModule, dueCount, streak, onStartSession, onDiagnostic, onContinue, onModule, onWriting, onPlan, onExport, onImport }) {
  const t = useT();
  const lang = useLang();
  const totalMastered = Object.values(moduleStats).reduce((a, s) => a + s.mastered, 0);
  const totalQ = Object.values(moduleStats).reduce((a, s) => a + s.total, 0);
  const overall = Math.round((totalMastered / totalQ) * 100);
  const levelMods = MODULES.filter((m) => m.level === level);
  const levelInfo = LEVELS.find((l) => l.id === level);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ marginBottom: 8, fontSize: 13, color: theme.dim }}>{t("tagline")}</div>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 18px", letterSpacing: "-0.03em" }}>
        {t("h1pre")} <span style={{ color: theme.accent }}>B1</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Stat theme={theme} big={overall + "%"} label={t("statMastery")} />
        <Stat theme={theme} big={streak + " 🔥"} label={t("statStreak")} />
      </div>

      {/* overall A0→B1 bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: theme.panel2, border: `1px solid ${theme.line}` }}>
          {LEVELS.map((l, li) => (
            <div key={l.id} title={`${l.id}: ${levelStats[l.id].pct}%`} style={{ flex: 1, position: "relative", borderRight: li !== LEVELS.length - 1 ? `1px solid ${theme.bg}` : "none" }}>
              <div style={{ position: "absolute", inset: 0, opacity: 0.18, background: theme.accent }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${levelStats[l.id].pct}%`, background: theme.accent, transition: "width .4s" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10.5, color: theme.dim }}>
          {LEVELS.map((l) => <span key={l.id}>{l.id}</span>)}
        </div>
      </div>

      {/* continue learning */}
      {nextModule && (
        <motion.button className="focusable" onClick={onContinue} whileHover={{ y: -2 }}
          style={{ width: "100%", textAlign: "left", background: theme.panel, border: `1px solid ${nextModule.color}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12, color: theme.text, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 8, height: 40, borderRadius: 4, background: nextModule.color, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, fontWeight: 700 }}>▶ {t("continueKicker")} · {nextModule.level}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{nextModule.title}</div>
            <div style={{ fontSize: 12.5, color: theme.dim }}>{moduleSub(lang, nextModule)}</div>
          </div>
        </motion.button>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button className="focusable" onClick={onStartSession} style={{ flex: "1 1 220px", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 12, padding: "16px 18px", fontSize: 16, fontWeight: 700 }}>
          ▶ {t("sessionBtn")}{dueCount ? ` · ${dueCount}` : ""}
        </button>
        <button className="focusable" onClick={onDiagnostic} style={{ flex: "1 1 220px", background: theme.panel, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "16px 18px", fontSize: 16, fontWeight: 600 }}>
          {t("diagBtn")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <motion.button className="focusable" onClick={onWriting} whileHover={{ y: -2 }}
          style={{ flex: "1 1 260px", textAlign: "left", background: theme.panel, border: `1px solid #b88bc4`, borderRadius: 12, padding: "14px 16px", color: theme.text, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 8, height: 40, borderRadius: 4, background: "#b88bc4", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, fontWeight: 700 }}>{t("focusKicker")}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{t("writingTitle")}</div>
            <div style={{ fontSize: 12.5, color: theme.dim }}>{t("writingSub")}</div>
          </div>
        </motion.button>
        <motion.button className="focusable" onClick={onPlan} whileHover={{ y: -2 }}
          style={{ flex: "1 1 260px", textAlign: "left", background: theme.panel, border: `1px solid #5fa0b3`, borderRadius: 12, padding: "14px 16px", color: theme.text, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 8, height: 40, borderRadius: 4, background: "#5fa0b3", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, fontWeight: 700 }}>{t("planKicker")}</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{t("planTitle")}</div>
            <div style={{ fontSize: 12.5, color: theme.dim }}>{t("planSub")}</div>
          </div>
        </motion.button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        <button className="focusable" onClick={onExport} style={{ fontSize: 12, color: theme.dim, background: "none", border: `1px solid ${theme.line}`, borderRadius: 8, padding: "6px 10px" }}>{t("saveBtn")}</button>
        <button className="focusable" onClick={onImport} style={{ fontSize: 12, color: theme.dim, background: "none", border: `1px solid ${theme.line}`, borderRadius: 8, padding: "6px 10px" }}>{t("loadBtn")}</button>
      </div>

      <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, margin: "0 0 12px" }}>{t("chooseLevel")}</h2>
      <LevelTabs theme={theme} level={level} setLevel={setLevel} levelStats={levelStats} />

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "4px 0 12px" }}>
        <div style={{ fontSize: 13.5, color: theme.dim, lineHeight: 1.5, maxWidth: 560 }}>{levelInfo && levelBlurb(lang, levelInfo)}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.accent, whiteSpace: "nowrap", marginLeft: 12 }}>{levelStats[level].pct}%</div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {levelMods.map((m, i) => {
          const s = moduleStats[m.id];
          const isNext = nextModule && nextModule.id === m.id;
          return (
            <motion.button key={m.id} className="focusable" onClick={() => onModule(m.id)}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ x: 3 }}
              style={{ textAlign: "left", background: theme.panel, border: `1px solid ${isNext ? m.color : theme.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, color: theme.text }}>
              <span style={{ width: 8, height: 38, borderRadius: 4, background: m.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                  {m.title}
                  {isNext && <span style={{ fontSize: 10, fontWeight: 800, color: "#1a1206", background: m.color, borderRadius: 6, padding: "2px 6px", letterSpacing: "0.03em" }}>{t("nextBadge")}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: theme.dim }}>{moduleSub(lang, m)}</div>
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

// ---------- Diagnostic start (choose level / full test) ----------
function DiagStart({ theme, levelStats, onBack, onStart }) {
  const t = useT();
  const lang = useLang();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>{t("back")}</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{t("diagTitle")}</h1>
      <p style={{ color: theme.dim, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 20px", maxWidth: 560 }}>
        {t("diagIntro")}
      </p>

      <button className="focusable" onClick={() => onStart("A0")}
        style={{ width: "100%", textAlign: "left", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 12, padding: "16px 18px", marginBottom: 14, fontWeight: 700 }}>
        <div style={{ fontSize: 16 }}>{t("fullTest")}</div>
        <div style={{ fontSize: 12.5, opacity: 0.8 }}>{t("fullTestSub")}</div>
      </button>

      <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: theme.dim, margin: "0 0 10px" }}>{t("orLevel")}</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {LEVELS.map((l) => (
          <button key={l.id} className="focusable" onClick={() => onStart(l.id)}
            style={{ textAlign: "left", background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "13px 16px", color: theme.text, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: theme.accent, minWidth: 34 }}>{l.id}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{levelSub(lang, l)}</div>
              <div style={{ fontSize: 12.5, color: theme.dim }}>{levelBlurb(lang, l)}</div>
            </div>
            <span style={{ fontSize: 12, color: theme.dim }}>{levelStats[l.id].pct}%</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ---------- Module (rules + start practice) ----------
function ModuleView({ theme, module: m, stats, onBack, onPractice, showUk }) {
  const t = useT();
  const lang = useLang();
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>{t("back")}</button>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <span style={{ width: 10, height: 30, borderRadius: 4, background: m.color }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "#1a1206", background: m.color, borderRadius: 6, padding: "2px 7px" }}>{m.level}</span>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{m.title}</h1>
      </div>
      <div style={{ color: theme.dim, marginBottom: 20, marginLeft: 22 }}>{moduleSub(lang, m)} · {t("masteredLine", { pct: stats.pct })}</div>

      <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
        {m.rules.map((r, i) => (
          <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontWeight: 650, fontSize: 15, marginBottom: 6, lineHeight: 1.5 }}>{renderGloss(r.de, theme)}</div>
            {showUk && <div style={{ fontSize: 13.5, color: theme.dim, lineHeight: 1.5 }}>{renderGloss(r.expl, theme)}</div>}
          </div>
        ))}
      </div>

      <button className="focusable" onClick={onPractice} style={{ width: "100%", background: m.color, color: "#1a1206", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700 }}>
        {t("practiceBtn", { n: m.questions.length })}
      </button>
    </motion.div>
  );
}

// ---------- Session ----------
function Session({ theme, mode, moduleId, diagLevel, cards, dueCards, srs, onAnswer, onDone, onQuit, showUk }) {
  // Build the queue ONCE at mount and freeze it for the whole session.
  // (Answering dispatches SRS → dueCards/now change on every render; if the
  // queue recomputed it would reshuffle, remount the Card by key, and wipe the
  // feedback. Session is keyed per session, so it remounts for a new run.)
  const [queue] = useState(() => {
    if (mode === "module") return shuffle(cards.filter((c) => c.mod === moduleId));
    if (mode === "diagnostic") {
      // 1 random question per module from the chosen level upward
      const startIdx = levelIndex(diagLevel || "A0");
      const mods = MODULES.filter((m) => levelIndex(m.level) >= startIdx);
      const picks = mods.map((m) => { const list = cards.filter((c) => c.mod === m.id); return list[Math.floor(Math.random() * list.length)]; });
      return shuffle(picks.filter(Boolean));
    }
    // due session: due first, cap 15
    return shuffle(dueCards).slice(0, 15);
  });

  const t = useT();
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const total = queue.length;
  const card = queue[idx];

  if (!card) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p style={{ color: theme.dim }}>{t("noCards")}</p>
        <button className="focusable" onClick={onQuit} style={{ background: theme.accent, border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 700, color: "#1a1206" }}>{t("toHome")}</button>
      </motion.div>
    );
  }

  function handle(correct) {
    onAnswer(card.key, correct);
    setResults((r) => [...r, { correct, level: card.level }]);
  }
  function next() {
    if (idx + 1 >= total) {
      const correctN = results.filter((r) => r.correct).length;
      const acc = Math.round((correctN / total) * 100);
      if (mode === "diagnostic") {
        const byLevel = {};
        for (const r of results) {
          byLevel[r.level] = byLevel[r.level] || { correct: 0, total: 0 };
          byLevel[r.level].total++; if (r.correct) byLevel[r.level].correct++;
        }
        let rec = null;
        for (const lid of LEVEL_ORDER) {
          const b = byLevel[lid];
          if (b && b.total > 0 && b.correct / b.total < 0.7) { rec = lid; break; }
        }
        onDone(acc, { byLevel, rec });
      } else onDone(acc);
    } else setIdx((i) => i + 1);
  }

  const modeLabel = mode === "diagnostic" ? t("modeDiag") : mode === "module" ? t("modeModule") : t("modeDue");

  return (
    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button className="focusable" onClick={onQuit} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, padding: 0 }}>{t("exit")}</button>
        <span style={{ fontSize: 13, color: theme.dim }}>{modeLabel} · {idx + 1} / {total}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: theme.panel2, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / total) * 100}%`, background: theme.accent, transition: "width .3s" }} />
      </div>

      <Card key={card.key} theme={theme} card={card} onResult={handle} onNext={next} showUk={showUk} />
    </motion.div>
  );
}

// ---------- Rule accordion (peek the rule mid-exercise) ----------
function RulePeek({ theme, module: m, showUk }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  if (!m) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <button className="focusable" onClick={() => setOpen((v) => !v)}
        style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
        {t("rule")} <span style={{ color: theme.dim, fontWeight: 400 }}>{open ? t("hideRule") : t("peek")}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {m.rules.map((r, i) => (
                <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontWeight: 650, fontSize: 13.5, lineHeight: 1.5 }}>{renderGloss(r.de, theme)}</div>
                  {showUk && <div style={{ fontSize: 12.5, color: theme.dim, lineHeight: 1.5, marginTop: 3 }}>{renderGloss(r.expl, theme)}</div>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- "Why?" deep explanation ----------
function WhyPanel({ theme, card, module: m }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const deep = card.deepExpl;
  const deepItems = Array.isArray(deep) ? deep : deep ? [deep] : null;

  return (
    <div style={{ marginTop: 12 }}>
      <button className="focusable" onClick={() => setOpen((v) => !v)}
        style={{ background: "none", border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 10, padding: "9px 13px", fontSize: 14, fontWeight: 600, width: "100%" }}>
        {open ? t("whyClose") : t("whyOpen")}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 10, background: theme.panel2, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px", fontSize: 14, lineHeight: 1.6 }}>
              {/* deep explanation */}
              {deepItems ? (
                <ul style={{ margin: "0 0 4px", paddingLeft: 18 }}>
                  {deepItems.map((d, i) => <li key={i} style={{ marginBottom: 6 }}>{renderGloss(d, theme)}</li>)}
                </ul>
              ) : (
                <div style={{ color: theme.dim, marginBottom: 8 }}>
                  {t("noDeep", { m: m?.title || "" })}
                </div>
              )}

              {/* option-by-option breakdown for MC */}
              {card.type === "mc" && card.optionExpl && (
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700 }}>{t("optBreakdown")}</div>
                  {card.options.map((o, i) => {
                    const right = i === card.answer;
                    return (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: right ? "#4caf7d" : "#e06a6a", fontWeight: 800, flexShrink: 0 }}>{right ? "✓" : "✕"}</span>
                        <span><b style={{ color: theme.text }}>{o}</b> — <span style={{ color: theme.dim }}>{renderGloss(card.optionExpl[i], theme)}</span></span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* fallback: module rules */}
              {!deepItems && m && (
                <div style={{ marginTop: 6, display: "grid", gap: 6 }}>
                  {m.rules.map((r, i) => (
                    <div key={i} style={{ fontSize: 13.5 }}>• {renderGloss(r.de, theme)}</div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Card (3 exercise types) ----------
function Card({ theme, card, onResult, onNext, showUk }) {
  const t = useT();
  const [phase, setPhase] = useState("answer"); // answer | feedback
  const [correct, setCorrect] = useState(false);
  const m = moduleById(card.mod);
  const modColor = m?.color || theme.accent;

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
      if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) {
        if (e.target.tagName === "BUTTON") return; // let buttons handle their own activation
        e.preventDefault(); onNext(); return;
      }
      if (card.type === "fill" && e.key === "Enter" && e.target.tagName !== "BUTTON") { e.preventDefault(); submitFill(); }
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
        <span style={{ background: modColor, color: "#1a1206", borderRadius: 5, padding: "1px 6px", marginRight: 8 }}>{m?.level}</span>
        {m?.title}
        <span style={{ color: theme.dim, marginLeft: 8, fontWeight: 500 }}>
          {card.type === "fill" ? t("typeFill") : card.type === "mc" ? t("typeMc") : t("typeOrder")}
        </span>
      </div>

      {/* peek the rule before/while answering */}
      <RulePeek theme={theme} module={m} showUk={showUk} />

      {/* FILL */}
      {card.type === "fill" && (
        <div>
          <p style={{ fontSize: 20, lineHeight: 1.5, fontWeight: 600, margin: "0 0 16px" }}>{card.q}</p>
          <input ref={inputRef} className="focusable" value={text} disabled={phase === "feedback"}
            onChange={(e) => setText(e.target.value)} placeholder={card.blankHint || t("yourAnswer")}
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
            {built.length === 0 && <span style={{ color: theme.dim, fontSize: 14, alignSelf: "center" }}>{t("orderTap")}</span>}
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
              {t("check")}
            </button>
          )}
        </div>
      )}

      {/* submit for fill */}
      {card.type === "fill" && phase === "answer" && (
        <button className="focusable" onClick={submitFill} disabled={!text.trim()}
          style={{ marginTop: 16, width: "100%", background: text.trim() ? modColor : theme.panel2, color: text.trim() ? "#1a1206" : theme.dim, border: "none", borderRadius: 10, padding: "13px", fontSize: 16, fontWeight: 700 }}>
          {t("check")} <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
        </button>
      )}

      {/* FEEDBACK */}
      <AnimatePresence>
        {phase === "feedback" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
            style={{ marginTop: 16, background: theme.panel, border: `1px solid ${fb}`, borderRadius: 12, padding: "14px 16px", overflow: "visible" }}>
            <div style={{ fontWeight: 800, color: fb, marginBottom: 6, fontSize: 15 }}>
              {correct ? t("fbOk") : t("fbNo")}
            </div>
            {!correct && (
              <div style={{ fontSize: 15, marginBottom: 8 }}>
                {t("correctIs")} <b style={{ color: theme.text }}>{card.type === "order" ? card.answer.join(" ") : card.type === "mc" ? card.options[card.answer] : card.answer}</b>
              </div>
            )}
            {showUk && card.expl && <div style={{ fontSize: 14, color: theme.dim, lineHeight: 1.55 }}>{renderGloss(card.expl, theme)}</div>}

            {/* deeper "why" — available for both correct and wrong answers */}
            <WhyPanel theme={theme} card={card} module={m} />

            <button className="focusable" onClick={onNext}
              style={{ marginTop: 14, width: "100%", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700 }}>
              {t("nextBtn")} <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Summary ----------
function Summary({ theme, acc, streak, mode, rec, byLevel, onAgain, onGoLevel, onHome }) {
  const t = useT();
  const good = acc >= 70;
  const isDiag = mode === "diagnostic";
  const recInfo = rec ? LEVELS.find((l) => l.id === rec) : null;

  let msg;
  if (isDiag) {
    msg = rec ? t("diagRec", { lvl: rec }) : t("diagTop");
  } else {
    msg = acc >= 90 ? t("sumGreat") : acc >= 70 ? t("sumGood") : t("sumOk");
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      style={{ textAlign: "center", padding: "32px 10px" }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
        style={{ fontSize: 64, marginBottom: 10 }}>{good ? "🎉" : "💪"}</motion.div>
      <div style={{ fontSize: 48, fontWeight: 800, color: good ? "#4caf7d" : theme.accent }}>{acc}%</div>
      <div style={{ color: theme.dim, fontSize: 16, margin: "8px 0 4px" }}>{t("accuracy")}</div>
      {good && !isDiag && <div style={{ fontSize: 14, color: theme.accent }}>{t("streakLbl", { n: streak })}</div>}
      <p style={{ color: theme.text, fontSize: 16, maxWidth: 420, margin: "18px auto 18px", lineHeight: 1.5 }}>{msg}</p>

      {/* per-level breakdown for the diagnostic */}
      {isDiag && byLevel && (
        <div style={{ maxWidth: 360, margin: "0 auto 22px", display: "grid", gap: 8, textAlign: "left" }}>
          {LEVEL_ORDER.filter((lid) => byLevel[lid]).map((lid) => {
            const b = byLevel[lid];
            const p = Math.round((b.correct / b.total) * 100);
            return (
              <div key={lid} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 800, color: theme.accent, minWidth: 28 }}>{lid}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: theme.panel2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p}%`, background: p >= 70 ? "#4caf7d" : theme.accent }} />
                </div>
                <span style={{ fontSize: 12, color: theme.dim, minWidth: 56, textAlign: "right" }}>{b.correct}/{b.total} · {p}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {isDiag && recInfo && (
          <button className="focusable" onClick={() => onGoLevel(rec)} style={{ background: theme.accent, color: "#1a1206", border: "none", borderRadius: 10, padding: "13px 22px", fontWeight: 700, fontSize: 15 }}>
            {t("startWith", { lvl: rec })}
          </button>
        )}
        <button className="focusable" onClick={onAgain} style={{ background: isDiag && recInfo ? theme.panel : theme.accent, color: isDiag && recInfo ? theme.text : "#1a1206", border: isDiag && recInfo ? `1px solid ${theme.line}` : "none", borderRadius: 10, padding: "13px 22px", fontWeight: 700, fontSize: 15 }}>{t("again")}</button>
        <button className="focusable" onClick={onHome} style={{ background: theme.panel, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "13px 22px", fontWeight: 600, fontSize: 15 }}>{t("toHome")}</button>
      </div>
    </motion.div>
  );
}
