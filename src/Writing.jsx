import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WRITING_STRUCTURE, REDEMITTEL, WRITING_CHECKLIST, WRITING_PROMPTS } from "./writing";

const DRAFTS_KEY = "german-writing-drafts-v1";

function loadDrafts() {
  try { return JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}; } catch { return {}; }
}
function saveDrafts(drafts) {
  try { localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts)); } catch {}
}

const REGISTER_LABEL = { informell: "неформально", formell: "формально", neutral: "нейтрально" };
const REGISTER_COLOR = { informell: "#5fb37a", formell: "#6a9bd1", neutral: "#c4a05f" };

function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

// ---------- Writing home: structure + phrase bank + prompt list ----------
export function WritingHome({ theme, onBack, onOpenPrompt }) {
  const [tab, setTab] = useState("prompts"); // prompts | structure | phrases
  const [drafts] = useState(() => loadDrafts());

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>← Назад</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>✍️ Schreiben — тренування письма</h1>
      <p style={{ color: theme.dim, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 18px", maxWidth: 620 }}>
        Структура листа, готові фрази (Redemittel) і 8 реалістичних завдань у форматі іспиту B1 — з пунктами (Leitpunkte), лічильником слів і чек-листом самоперевірки.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[["prompts", "📝 Завдання"], ["structure", "🧱 Структура листа"], ["phrases", "💬 Банк фраз"]].map(([id, label]) => (
          <button key={id} className="focusable" onClick={() => setTab(id)}
            style={{ background: tab === id ? theme.accent : theme.panel, color: tab === id ? "#1a1206" : theme.text, border: `1px solid ${tab === id ? theme.accent : theme.line}`, borderRadius: 10, padding: "9px 14px", fontSize: 13.5, fontWeight: 700 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "structure" && (
        <div style={{ display: "grid", gap: 10, marginBottom: 10 }}>
          {WRITING_STRUCTURE.map((s, i) => (
            <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontWeight: 750, fontSize: 14.5, color: theme.accent, marginBottom: 4 }}>{s.part}</div>
              <div style={{ fontSize: 14.5, marginBottom: 4 }}>{s.deTip}</div>
              <div style={{ fontSize: 13, color: theme.dim, lineHeight: 1.5 }}>{s.ukTip}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "phrases" && (
        <div style={{ display: "grid", gap: 12, marginBottom: 10 }}>
          {REDEMITTEL.map((group, i) => (
            <div key={i} style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontWeight: 750, fontSize: 14, marginBottom: 2 }}>{group.cat}</div>
              <div style={{ fontSize: 12, color: theme.dim, marginBottom: 10 }}>{group.catUk}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {group.items.map((it, j) => (
                  <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, flex: "1 1 260px" }}>{it.de}</span>
                    <span style={{ fontSize: 12.5, color: theme.dim, flex: "1 1 180px" }}>{it.uk}</span>
                    {it.tag !== "beide" && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: REGISTER_COLOR[it.tag] || theme.dim, border: `1px solid ${REGISTER_COLOR[it.tag] || theme.line}`, borderRadius: 6, padding: "1px 6px", flexShrink: 0 }}>
                        {REGISTER_LABEL[it.tag] || it.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "prompts" && (
        <div style={{ display: "grid", gap: 10 }}>
          {WRITING_PROMPTS.map((p, i) => {
            const draft = drafts[p.id];
            const wc = draft ? countWords(draft.text) : 0;
            return (
              <motion.button key={p.id} className="focusable" onClick={() => onOpenPrompt(p.id)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ x: 3 }}
                style={{ textAlign: "left", background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, color: theme.text }}>
                <span style={{ width: 8, height: 38, borderRadius: 4, background: REGISTER_COLOR[p.register] || theme.accent, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {p.title}
                    <span style={{ fontSize: 10, fontWeight: 800, color: REGISTER_COLOR[p.register], border: `1px solid ${REGISTER_COLOR[p.register]}`, borderRadius: 6, padding: "1px 6px" }}>
                      {REGISTER_LABEL[p.register]}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: theme.dim }}>{p.titleUk}</div>
                </div>
                <div style={{ fontSize: 11.5, color: theme.dim, flexShrink: 0, textAlign: "right" }}>
                  {wc > 0 ? `чернетка: ${wc} сл.` : `${p.words[0]}–${p.words[1]} сл.`}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ---------- Individual writing prompt ----------
export function WritingPromptView({ theme, promptId, onBack }) {
  const prompt = useMemo(() => WRITING_PROMPTS.find((p) => p.id === promptId), [promptId]);
  const [text, setText] = useState(() => loadDrafts()[promptId]?.text || "");
  const [checked, setChecked] = useState(() => loadDrafts()[promptId]?.checked || {});
  const [showModel, setShowModel] = useState(false);

  useEffect(() => {
    const drafts = loadDrafts();
    drafts[promptId] = { text, checked };
    saveDrafts(drafts);
  }, [text, checked, promptId]);

  if (!prompt) return null;
  const wc = countWords(text);
  const [min, max] = prompt.words;
  const wcColor = wc === 0 ? theme.dim : wc < min ? "#e0a458" : wc > max * 1.3 ? "#e0a458" : "#4caf7d";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>← До списку завдань</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: REGISTER_COLOR[prompt.register], border: `1px solid ${REGISTER_COLOR[prompt.register]}`, borderRadius: 6, padding: "2px 7px" }}>
          {REGISTER_LABEL[prompt.register]}
        </span>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{prompt.title}</h1>
      </div>

      <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>{prompt.situationUk}</div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700, marginBottom: 6 }}>Розкрий усі пункти (Leitpunkte)</div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
          {prompt.leitpunkte.map((lp, i) => <li key={i} style={{ fontSize: 14.5 }}>{lp}</li>)}
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: theme.dim }}>Твоя відповідь · орієнтир {min}–{max} слів</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: wcColor }}>{wc} слів</span>
      </div>
      <textarea
        className="focusable"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напиши свій лист німецькою тут…"
        style={{ width: "100%", minHeight: 220, fontSize: 15, lineHeight: 1.6, padding: "13px 15px", borderRadius: 10, border: `2px solid ${theme.line}`, background: theme.panel, color: theme.text, outline: "none", fontFamily: "inherit", resize: "vertical" }}
      />

      <div style={{ marginTop: 16, background: theme.panel2, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700, marginBottom: 8 }}>Чек-лист самоперевірки</div>
        <div style={{ display: "grid", gap: 8 }}>
          {WRITING_CHECKLIST.map((item, i) => (
            <label key={i} className="focusable" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                style={{ marginTop: 3, width: 16, height: 16, flexShrink: 0, accentColor: theme.accent }} />
              <span style={{ color: checked[i] ? theme.dim : theme.text, textDecoration: checked[i] ? "line-through" : "none" }}>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="focusable" onClick={() => setShowModel((v) => !v)}
        style={{ marginTop: 16, width: "100%", background: "none", border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700 }}>
        {showModel ? "Сховати зразок" : "👁 Показати зразок відповіді"}
      </button>
      <AnimatePresence>
        {showModel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 12, background: theme.panel, border: `1px solid ${theme.accent}`, borderRadius: 12, padding: "16px 18px", whiteSpace: "pre-line", fontSize: 14.5, lineHeight: 1.7 }}>
              {prompt.model}
            </div>
            <div style={{ fontSize: 12, color: theme.dim, marginTop: 8, lineHeight: 1.5 }}>
              Порада: спочатку напиши свій варіант і познач чек-лист — лише потім дивись зразок. Порівняй структуру та фрази, а не намагайся вивчити текст напам'ять.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
