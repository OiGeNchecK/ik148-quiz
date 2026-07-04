import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WRITING_STRUCTURE, REDEMITTEL, WRITING_CHECKLIST, WRITING_PROMPTS, CLOZE_LETTERS, TRANSLATIONS } from "./writing";

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

// tolerant matching: case, umlauts, ß and punctuation don't fail the answer
const wnorm = (s) =>
  (s || "").toString().trim().toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[.,!?;:"'«»„“”\-–—()]/g, "")
    .replace(/\s+/g, " ").trim();

// ---------- German character helper (no German keyboard needed) ----------
function UmlautBar({ theme, onChar }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
      {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((c) => (
        <button key={c} className="focusable" type="button"
          onMouseDown={(e) => { e.preventDefault(); onChar(c); }}
          style={{ background: theme.panel2, border: `1px solid ${theme.line}`, color: theme.text, borderRadius: 8, padding: "5px 12px", fontSize: 15, fontWeight: 600 }}>
          {c}
        </button>
      ))}
    </div>
  );
}

// insert a character at the element's cursor position
function insertChar(el, value, setValue, ch) {
  const s = el?.selectionStart ?? value.length;
  const e = el?.selectionEnd ?? s;
  setValue(value.slice(0, s) + ch + value.slice(e));
  requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(s + 1, s + 1); });
}

// ---------- Writing home: structure + phrase bank + prompt list ----------
export function WritingHome({ theme, onBack, onOpenPrompt }) {
  const [tab, setTab] = useState("prompts"); // prompts | structure | phrases
  const [drafts] = useState(() => loadDrafts());

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 14, padding: 0 }}>← Назад</button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>✍️ Schreiben — тренування письма</h1>
      <p style={{ color: theme.dim, fontSize: 14.5, lineHeight: 1.55, margin: "0 0 14px", maxWidth: 620 }}>
        Усе для письмової частини B1: від готових фраз до повних листів на час.
      </p>

      <div style={{ background: theme.panel2, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, lineHeight: 1.6 }}>
        <b style={{ color: theme.accent }}>Шлях до письма за 3 кроки:</b>
        <div>1️⃣ <b>Фрази як формули</b> — модулі «✍️» у рівнях на головній (вони самі приходять у щоденну сесію повторення).</div>
        <div>2️⃣ <b>Речення</b> — тут: 🧩 Lückentext (фрази в контексті) та 🔁 Переклад (сам будуєш речення).</div>
        <div>3️⃣ <b>Повні листи</b> — 📝 Листи за структурою, з чек-листом і зразком.</div>
        <div style={{ color: theme.dim, marginTop: 4 }}>15–20 хв письма щодня дає більше, ніж 3 години раз на тиждень.</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[["prompts", "📝 Листи"], ["cloze", "🧩 Lückentext"], ["translate", "🔁 Переклад"], ["structure", "🧱 Структура"], ["phrases", "💬 Банк фраз"]].map(([id, label]) => (
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

      {tab === "cloze" && <ClozeTrainer theme={theme} />}
      {tab === "translate" && <TranslateTrainer theme={theme} />}

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
  const taRef = useRef(null);

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
        ref={taRef}
        className="focusable"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Напиши свій лист німецькою тут…"
        style={{ width: "100%", minHeight: 220, fontSize: 15, lineHeight: 1.6, padding: "13px 15px", borderRadius: 10, border: `2px solid ${theme.line}`, background: theme.panel, color: theme.text, outline: "none", fontFamily: "inherit", resize: "vertical" }}
      />
      <UmlautBar theme={theme} onChar={(c) => insertChar(taRef.current, text, setText, c)} />

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

// ---------- Lückentext trainer (step 2a: phrases in context) ----------
function ClozeTrainer({ theme }) {
  const [sel, setSel] = useState(null);
  const letter = CLOZE_LETTERS.find((l) => l.id === sel);
  if (letter) return <ClozeExercise theme={theme} letter={letter} onBack={() => setSel(null)} />;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 13.5, color: theme.dim, lineHeight: 1.5 }}>
        Впиши пропущені ключові фрази в реальні листи. Регістр, умлаути та ß не критичні — головне слово.
      </div>
      {CLOZE_LETTERS.map((l, i) => (
        <button key={l.id} className="focusable" onClick={() => setSel(l.id)}
          style={{ textAlign: "left", background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, color: theme.text }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: theme.accent, minWidth: 30 }}>№{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {l.title}
              <span style={{ fontSize: 10, fontWeight: 800, color: REGISTER_COLOR[l.register], border: `1px solid ${REGISTER_COLOR[l.register]}`, borderRadius: 6, padding: "1px 6px" }}>
                {REGISTER_LABEL[l.register]}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: theme.dim }}>{l.titleUk} · {l.gaps.length} пропусків</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ClozeExercise({ theme, letter, onBack }) {
  const [vals, setVals] = useState({});
  const [checked, setChecked] = useState(false);
  const focusRef = useRef(null);
  const parts = useMemo(() => letter.text.split(/\{(\d+)\}/g), [letter]);

  const gapOk = (n) => {
    const g = letter.gaps[n - 1];
    if (!g) return false;
    return [g.answer, ...(g.alts || [])].some((a) => wnorm(a) === wnorm(vals[n] || ""));
  };
  const allFilled = letter.gaps.every((_, i) => (vals[i + 1] || "").trim());
  const wrong = checked ? letter.gaps.map((g, i) => ({ n: i + 1, ...g })).filter((g) => !gapOk(g.n)) : [];

  function reveal() {
    const v = {};
    letter.gaps.forEach((g, i) => { v[i + 1] = g.answer; });
    setVals(v); setChecked(true);
  }
  function onChar(c) {
    const f = focusRef.current;
    if (!f) return;
    insertChar(f.el, vals[f.n] || "", (nv) => setVals((v) => ({ ...v, [f.n]: nv })), c);
  }

  return (
    <div>
      <button className="focusable" onClick={onBack} style={{ background: "none", border: "none", color: theme.dim, fontSize: 14, marginBottom: 12, padding: 0 }}>← Інший лист</button>
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{letter.title} <span style={{ fontWeight: 400, fontSize: 13, color: theme.dim }}>· {letter.titleUk}</span></div>

      <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "16px 18px", whiteSpace: "pre-line", fontSize: 15, lineHeight: 2.1 }}>
        {parts.map((p, i) => {
          if (i % 2 === 0) return <React.Fragment key={i}>{p}</React.Fragment>;
          const n = parseInt(p, 10);
          const g = letter.gaps[n - 1];
          const ok = checked ? gapOk(n) : null;
          return (
            <input key={i}
              className="focusable"
              value={vals[n] || ""}
              onChange={(e) => setVals((v) => ({ ...v, [n]: e.target.value }))}
              onFocus={(e) => { focusRef.current = { el: e.target, n }; }}
              placeholder={n + "· " + (g?.hint || "")}
              title={g?.hint}
              style={{
                display: "inline-block", width: Math.max(90, (g?.answer.length || 6) * 13 + 24),
                margin: "0 4px", padding: "3px 8px", fontSize: 14.5, fontFamily: "inherit",
                borderRadius: 8, outline: "none", background: theme.panel2, color: theme.text,
                border: `2px solid ${ok === null ? theme.line : ok ? "#4caf7d" : "#e06a6a"}`,
              }} />
          );
        })}
      </div>

      <UmlautBar theme={theme} onChar={onChar} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
        <button className="focusable" onClick={() => setChecked(true)} disabled={!allFilled}
          style={{ flex: "1 1 160px", background: allFilled ? theme.accent : theme.panel2, color: allFilled ? "#1a1206" : theme.dim, border: "none", borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700 }}>
          Перевірити
        </button>
        <button className="focusable" onClick={() => { setVals({}); setChecked(false); }}
          style={{ background: theme.panel, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "12px 16px", fontSize: 14, fontWeight: 600 }}>
          Скинути
        </button>
        <button className="focusable" onClick={reveal}
          style={{ background: theme.panel, color: theme.dim, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "12px 16px", fontSize: 14 }}>
          Показати відповіді
        </button>
      </div>

      {checked && (
        <div style={{ marginTop: 12, background: theme.panel, border: `1px solid ${wrong.length ? "#e06a6a" : "#4caf7d"}`, borderRadius: 12, padding: "13px 16px", fontSize: 14.5 }}>
          {wrong.length === 0 ? (
            <b style={{ color: "#4caf7d" }}>✓ Усе правильно! Тепер прочитай лист уголос — так фрази запам'ятаються ще краще.</b>
          ) : (
            <div>
              <b style={{ color: "#e06a6a" }}>Виправ пропуски:</b>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                {wrong.map((g) => (
                  <li key={g.n}>№{g.n}: правильно — <b>{g.answer}</b>{g.alts ? <span style={{ color: theme.dim }}> (також: {g.alts.join(", ")})</span> : null}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- UA → DE sentence translation (step 2b: active production) ----------
const TRANSLATE_KEY = "german-translate-v1";
function loadTranslate() {
  try { return JSON.parse(localStorage.getItem(TRANSLATE_KEY)) || {}; } catch { return {}; }
}

function TranslateTrainer({ theme }) {
  const [pos, setPos] = useState(() => Math.min(loadTranslate().pos || 0, TRANSLATIONS.length - 1));
  const [doneMap, setDoneMap] = useState(() => loadTranslate().done || {});
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("answer"); // answer | feedback
  const [ok, setOk] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(TRANSLATE_KEY, JSON.stringify({ pos, done: doneMap })); } catch {}
  }, [pos, doneMap]);

  const item = TRANSLATIONS[pos];
  const doneCount = Object.keys(doneMap).length;

  function check() {
    if (!text.trim() || phase === "feedback") return;
    const good = [item.de, ...(item.alts || [])].some((c) => wnorm(c) === wnorm(text));
    setOk(good);
    if (good) setDoneMap((d) => ({ ...d, [pos]: true }));
    setPhase("feedback");
  }
  function selfGrade() {
    setOk(true);
    setDoneMap((d) => ({ ...d, [pos]: true }));
  }
  function next() {
    setText(""); setPhase("answer"); setOk(false); setShowHint(false);
    setPos((p) => (p + 1) % TRANSLATIONS.length);
  }
  function restart() {
    setDoneMap({}); setPos(0); setText(""); setPhase("answer"); setShowHint(false);
  }

  const fb = ok ? "#4caf7d" : "#e06a6a";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13, color: theme.dim }}>Речення {pos + 1} / {TRANSLATIONS.length} · вивчено ✓ {doneCount}</span>
        <button className="focusable" onClick={restart} style={{ background: "none", border: "none", color: theme.dim, fontSize: 12.5, padding: 0, textDecoration: "underline" }}>почати спочатку</button>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: theme.panel2, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(doneCount / TRANSLATIONS.length) * 100}%`, background: theme.accent, transition: "width .3s" }} />
      </div>

      <div style={{ background: theme.panel, border: `1px solid ${theme.line}`, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: theme.dim, fontWeight: 700, marginBottom: 6 }}>Переклади німецькою</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.45 }}>{item.uk}</div>
        {doneMap[pos] && phase === "answer" && <div style={{ fontSize: 11.5, color: "#4caf7d", marginTop: 4 }}>✓ вже вивчене — повтори ще раз</div>}
      </div>

      <input
        ref={inRef}
        className="focusable"
        value={text}
        disabled={phase === "feedback"}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); phase === "answer" ? check() : next(); } }}
        placeholder="Німецьке речення…"
        style={{ width: "100%", fontSize: 16, padding: "13px 15px", borderRadius: 10, border: `2px solid ${phase === "feedback" ? fb : theme.line}`, background: theme.panel, color: theme.text, outline: "none", fontFamily: "inherit" }}
      />
      <UmlautBar theme={theme} onChar={(c) => insertChar(inRef.current, text, setText, c)} />

      {phase === "answer" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="focusable" onClick={check} disabled={!text.trim()}
            style={{ flex: "1 1 200px", background: text.trim() ? theme.accent : theme.panel2, color: text.trim() ? "#1a1206" : theme.dim, border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700 }}>
            Перевірити <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
          </button>
          <button className="focusable" onClick={() => setShowHint((v) => !v)}
            style={{ background: theme.panel, color: theme.dim, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "13px 16px", fontSize: 14 }}>
            💡 Підказка
          </button>
        </div>
      )}
      {showHint && phase === "answer" && (
        <div style={{ marginTop: 8, fontSize: 14, color: theme.dim }}>Початок: <b style={{ color: theme.text }}>{item.de.split(" ").slice(0, 3).join(" ")} …</b></div>
      )}

      {phase === "feedback" && (
        <div style={{ marginTop: 4, background: theme.panel, border: `1px solid ${fb}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontWeight: 800, color: fb, marginBottom: 6, fontSize: 15 }}>{ok ? "✓ Правильно!" : "✕ Не точно"}</div>
          <div style={{ fontSize: 15, marginBottom: 4 }}>Зразок: <b>{item.de}</b></div>
          {item.alts && <div style={{ fontSize: 12.5, color: theme.dim }}>Також приймається: {item.alts.join(" · ")}</div>}
          {!ok && (
            <div style={{ fontSize: 12.5, color: theme.dim, marginTop: 6 }}>
              Інший порядок слів теж може бути правильним. Якщо твоє речення граматично правильне — зарахуй його чесно сам(а).
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {!ok && (
              <button className="focusable" onClick={selfGrade}
                style={{ background: theme.panel2, color: theme.text, border: `1px solid ${theme.line}`, borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 600 }}>
                ✓ Моє було правильне
              </button>
            )}
            <button className="focusable" onClick={next}
              style={{ flex: "1 1 160px", background: theme.accent, color: "#1a1206", border: "none", borderRadius: 10, padding: "11px", fontSize: 15, fontWeight: 700 }}>
              Далі <span style={{ opacity: 0.6, fontSize: 13 }}>↵</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
