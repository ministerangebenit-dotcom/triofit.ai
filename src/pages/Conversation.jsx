import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import LogoOrb from "../components/shared/LogoOrb";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";
import LangToggle from "../components/shared/LangToggle";
import { sb } from "../lib/supabase";
import { useLang, t } from "../lib/i18n";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

const BLUEPRINT_KEYS = ["confidence", "authority", "trust", "approachability", "styleFit"];
const BLUEPRINT_COLORS = {
  confidence: "#C79B45",
  authority: "#D85A30",
  trust: "#7F77DD",
  approachability: "#5DCAA5",
  styleFit: "#D9AE5A",
};

function RadarBars({ values, s }) {
  const labelMap = {
    confidence: s.traitConfidence,
    authority: s.traitAuthority,
    trust: s.traitTrust,
    approachability: s.traitApproachability,
    styleFit: s.traitStyleFit,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {BLUEPRINT_KEYS.map((key) => (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
            <span>{labelMap[key]}</span>
            <span style={{ color: values[key] ? BLUEPRINT_COLORS[key] : "var(--muted)" }}>{values[key] ?? 0}%</span>
          </div>
          <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: BLUEPRINT_COLORS[key] }}
              initial={{ width: "0%" }}
              animate={{ width: `${values[key] ?? 0}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SituationInput({ s, lang, onSubmit }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "fr" ? "fr-FR" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12, lineHeight: 1.7 }}>{s.situationPrompt}</p>
      <div style={{ position: "relative" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={s.situationPlaceholder}
          rows={4}
          style={{
            width: "100%", background: "var(--surface)", border: "1px solid var(--border-soft)",
            borderRadius: 14, padding: 14, paddingRight: 48, fontSize: 14, color: "var(--text)", outline: "none",
            resize: "none", fontFamily: "inherit", marginBottom: 12,
          }}
        />
        <button
          onClick={startListening}
          style={{
            position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%",
            background: listening ? "var(--gold)" : "var(--surface-2)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Voice input"
        >
          <i className="ti ti-microphone" style={{ fontSize: 16, color: listening ? "#080808" : "var(--text-dim)" }} />
        </button>
      </div>
      <button
        onClick={() => text.trim() && onSubmit(text.trim())}
        disabled={!text.trim()}
        style={{
          padding: "12px 24px", borderRadius: 50,
          background: text.trim() ? "var(--gold)" : "var(--surface-2)",
          border: "none", color: text.trim() ? "#080808" : "var(--text-dim)",
          fontWeight: 700, fontSize: 14, cursor: text.trim() ? "pointer" : "default",
        }}
      >
        {s.situationContinue}
      </button>
    </motion.div>
  );
}

function ConfirmSummary({ s, extracted, onConfirm, onEdit }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        {s.confirmTitle}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{extracted.summary}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onConfirm} style={{ flex: 1, padding: "12px 20px", borderRadius: 14, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {s.confirmYes}
        </button>
        <button onClick={onEdit} style={{ flex: 1, padding: "12px 20px", borderRadius: 14, background: "transparent", border: "1px solid var(--border-soft)", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}>
          {s.confirmEdit}
        </button>
      </div>
    </motion.div>
  );
}

function ProcessingSequence({ s, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const messages = s.processingMessages;
  const totalMs = 30000;

  useEffect(() => {
    let cancelled = false;
    let rafId;
    const start = Date.now();
    const stepMs = totalMs / messages.length;

    function tick() {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / totalMs) * 100);
      setProgress(pct);

      const idx = Math.min(messages.length - 1, Math.floor(elapsed / stepMs));
      setVisibleIndex(idx);

      if (elapsed >= totalMs) {
        setTimeout(() => {
          if (!cancelled) onComplete?.();
        }, 400);
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div style={{ padding: "28px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <LogoOrb size={72} thinking={true} />
      </div>
      <div style={{ maxWidth: 340, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-dim)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span>{s.processingTitle}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--gold-light), var(--gold))",
              transition: "width 0.3s linear",
            }}
          />
        </div>
      </div>
      <div style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
        {messages.slice(0, visibleIndex + 1).map((m, i) => {
          const isDone = i < visibleIndex;
          return (
            <div
              key={i}
              style={{ fontSize: 14, color: isDone ? "var(--text-dim)" : "var(--text)", display: "flex", alignItems: "center", gap: 10, opacity: isDone ? 0.5 : 1 }}
            >
              {isDone ? <i className="ti ti-check" style={{ color: "var(--gold)", fontSize: 15, flexShrink: 0 }} /> : <LogoOrb size={16} thinking={true} />}
              {m}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PerceptionReveal({ s, analysis, onChoice, onReanalyze }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        {s.revealImpression}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)", marginBottom: 12 }}>{analysis.impression}</p>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>{s.revealReasons}</div>
        {analysis.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4, display: "flex", gap: 6 }}>
            <span style={{ color: "var(--gold)" }}>—</span>{r}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div>{analysis.traits.strong.map((tr) => <span key={tr} style={{ fontSize: 12, color: "#5DCAA5", marginRight: 10 }}>✓ {tr}</span>)}</div>
        <div>{analysis.traits.caution.map((tr) => <span key={tr} style={{ fontSize: 12, color: "#D85A30", marginRight: 10 }}>⚠ {tr}</span>)}</div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>{s.revealPrediction}</div>
      <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{analysis.prediction}</p>
      <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, textAlign: "center" }}>{s.revealCta}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onChoice("yes")} style={{ padding: "14px 20px", borderRadius: 14, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {s.revealYes}
        </button>
        <button onClick={() => onChoice("no")} style={{ padding: "14px 20px", borderRadius: 14, background: "transparent", border: "1px solid var(--border-soft)", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}>
          {s.revealNo}
        </button>
        <button onClick={onReanalyze} style={{ padding: "10px", background: "transparent", border: "none", color: "var(--gold)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
          {s.reanalyzeButton}
        </button>
      </div>
    </motion.div>
  );
}

function LimitReached({ s, onUpgrade }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "20px 0", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 16, lineHeight: 1.7 }}>{s.limitReached}</p>
      <button
        onClick={onUpgrade}
        style={{ padding: "12px 24px", borderRadius: 50, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
      >
        {s.proUpgradeButton}
      </button>
    </motion.div>
  );
}

function RefineQuestions({ questions, onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  function pick(opt) {
    const q = questions[step];
    const updated = { ...answers, [q.key]: opt };
    setAnswers(updated);
    if (step + 1 < questions.length) setStep(step + 1);
    else onDone(updated);
  }

  const q = questions[step];
  if (!q) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12 }}>{q.q}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {q.options.map((opt) => (
          <button key={opt} onClick={() => pick(opt)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, border: "1px solid rgba(199,155,69,0.4)", color: "var(--gold)", background: "transparent", cursor: "pointer" }}>
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function WaitingForStylist({ s }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <LogoOrb size={40} thinking={true} />
      </div>
      <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{s.waitingForStylist}</p>
    </motion.div>
  );
}

function Blueprint({ s, blueprint }) {
  const [values, setValues] = useState({});
  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const key of BLUEPRINT_KEYS) {
        await new Promise((r) => setTimeout(r, 300));
        if (cancelled) return;
        setValues((v) => ({ ...v, [key]: blueprint[key] }));
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        {s.perceptionBlueprint}
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16 }}>
        <RadarBars values={values} s={s} />
      </div>
    </motion.div>
  );
}

function QuickAdvice({ s, tips }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, lineHeight: 1.7 }}>{s.quickAdviceIntro}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", gap: 8 }}>
            <span style={{ color: "var(--gold)" }}>—</span>{tip}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MessageActions({ text }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const [playing, setPlaying] = useState(false);

  function copyText() { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  function playVoice() {
    if (!("speechSynthesis" in window)) return;
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utter);
  }
  const iconBtn = { background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4, fontSize: 14 };

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6, marginLeft: 2 }}>
      <button onClick={copyText} style={iconBtn} aria-label="Copy"><i className={copied ? "ti ti-check" : "ti ti-copy"} style={{ color: copied ? "var(--gold)" : "var(--text-dim)" }} /></button>
      <button onClick={playVoice} style={iconBtn} aria-label="Play"><i className={playing ? "ti ti-player-pause" : "ti ti-player-play"} style={{ color: playing ? "var(--gold)" : "var(--text-dim)" }} /></button>
      <button onClick={() => setLiked(liked === "up" ? null : "up")} style={iconBtn} aria-label="Like"><i className="ti ti-thumb-up" style={{ color: liked === "up" ? "var(--gold)" : "var(--text-dim)" }} /></button>
      <button onClick={() => setLiked(liked === "down" ? null : "down")} style={iconBtn} aria-label="Dislike"><i className="ti ti-thumb-down" style={{ color: liked === "down" ? "var(--gold)" : "var(--text-dim)" }} /></button>
    </div>
  );
}

function genSessionId() {
  let id = localStorage.getItem("tf_session");
  if (!id) {
    id = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 8);
    localStorage.setItem("tf_session", id);
  }
  return id;
}

export default function Conversation() {
  const userName = localStorage.getItem("tf_name") || "there";
  const goal = localStorage.getItem("tf_goal") || "authority";
  const sessionId = useRef(genSessionId()).current;
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);

  const [messages, setMessages] = useState([
    { role: "assistant", text: s.greeting(userName) },
  ]);
  const [stage, setStage] = useState("intake");
  const [situation, setSituation] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [profile, setProfile] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [refineQs, setRefineQs] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);
  const [quickTips, setQuickTips] = useState(null);
  const [input, setInput] = useState("");
  const [showChatInput, setShowChatInput] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, stage]);

  useEffect(() => {
    axios.get(`${BACKEND}/history/${sessionId}`).then((res) => {
      if (res.data.session && res.data.messages.length > 0) {
        const restored = res.data.messages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          text: m.message,
          image: m.image_url || undefined,
        }));
        setMessages(restored);
        setProfile({
          gender: res.data.session.gender,
          age: res.data.session.age,
          style: res.data.session.style,
          occasion: res.data.session.occasion,
        });
        setStage("blueprint");
        setShowChatInput(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const chatChannel = sb
      .channel("chat-" + sessionId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new;
        if (m.session_id !== sessionId || m.sender !== "admin") return;
        if (m.message_type === "image") {
          setMessages((msgs) => [...msgs, { role: "assistant", text: m.message, image: m.image_url }]);
        } else {
          setMessages((msgs) => [...msgs, { role: "assistant", text: m.message }]);
        }
      })
      .subscribe();

    const scoreChannel = sb
      .channel("score-" + sessionId)
      .on("broadcast", { event: "outfit_score" }, (payload) => {
        setBlueprintData(payload.payload);
        setStage("blueprint");
      })
      .subscribe();

    return () => {
      sb.removeChannel(chatChannel);
      sb.removeChannel(scoreChannel);
    };
  }, [sessionId]);

  function pushAssistant(text) { setMessages((m) => [...m, { role: "assistant", text }]); }
  function pushUser(text) { setMessages((m) => [...m, { role: "user", text }]); }

  async function handleSituationSubmit(text) {
    setSituation(text);
    pushUser(text);
    setStage("extracting");
    try {
      const res = await axios.post(`${BACKEND}/extract`, { situation: text, goal });
      setExtracted(res.data);
      setProfile({ gender: res.data.gender, age: res.data.age, style: res.data.style, occasion: res.data.occasion });
      setStage("confirm");
    } catch {
      pushAssistant(s.extractTrouble);
      setStage("intake");
    }
  }

  function handleEditRequest() {
    setStage("intake");
  }

  async function handleConfirm() {
    await axios.post(`${BACKEND}/session`, { session_id: sessionId, name: userName, goal, situation, ...profile });

    try {
      const limitRes = await axios.get(`${BACKEND}/session/${sessionId}/limit-check`);
      if (!limitRes.data.allowed) {
        setStage("limit-reached");
        return;
      }
    } catch {
      // if limit-check fails, fail open rather than blocking a user unfairly
    }

    setStage("processing");
  }

  async function onProcessingComplete() {
    try {
      const res = await axios.post(`${BACKEND}/analysis`, { session_id: sessionId, profile, goal, situation });
      setAnalysis(res.data);
      setStage("reveal");
      axios.post(`${BACKEND}/session/${sessionId}/record-analysis`).catch(() => {});
    } catch {
      pushAssistant(s.stylistBrainTrouble);
      setStage("reveal");
      setAnalysis({ impression: "", reasons: [], traits: { strong: [], caution: [] }, prediction: "" });
    }
  }

  function handleReanalyze() {
    setStage("intake");
    setAnalysis(null);
    setExtracted(null);
  }

  async function onRevealChoice(choice) {
    if (choice === "no") {
      setStage("quickadvice-loading");
      try {
        const res = await axios.post(`${BACKEND}/quick-advice`, { situation, goal });
        setQuickTips(res.data.tips);
        setStage("quickadvice");
        setShowChatInput(true);
      } catch {
        setQuickTips([]);
        setStage("quickadvice");
        setShowChatInput(true);
      }
      return;
    }

    setStage("refine-loading");
    try {
      const res = await axios.post(`${BACKEND}/refine-questions`, { situation, goal, profile });
      setRefineQs(res.data.questions);
      setStage("refine");
    } catch {
      setStage("waiting");
      triggerSuggestion();
    }
  }

  async function onRefineDone(answers) {
    const merged = { ...profile, ...answers };
    setProfile(merged);
    setStage("waiting");
    triggerSuggestion(merged);
  }

  async function triggerSuggestion(finalProfile) {
    try {
      const res = await axios.post(`${BACKEND}/templates/suggest`, { session_id: sessionId, profile: finalProfile || profile });
      if (!res.data.suggestion) {
        pushAssistant(s.noTemplateYet);
      }
      setShowChatInput(true);
    } catch {
      pushAssistant(s.catalogTrouble);
      setShowChatInput(true);
    }
  }

  function sendFreeText() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    pushUser(text);
    axios
      .post(`${BACKEND}/chat`, {
        session_id: sessionId,
        profile,
        messages: [...messages, { role: "user", text }].map((m) => ({ role: m.role, text: m.text })),
      })
      .then((res) => pushAssistant(res.data.reply))
      .catch(() => pushAssistant(s.connectionIssue));
  }

  return (
    <div className="h-screen flex flex-col relative" style={{ background: "var(--bg)" }}>
      <div style={{
  position: "sticky", top: 0, zIndex: 5, padding: "16px 20px",
  borderBottom: "1px solid var(--border-soft)", background: "var(--bg)",
  display: "flex", alignItems: "center", gap: 10,
}}>
  <LogoOrb size={28} thinking={false} />
  <span className="font-display" style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em" }}>
    TRIOFIT
  </span>
</div>
      <ThemeToggle />
      <LangToggle lang={lang} onChange={setLangState} />
      <ChatBackground />
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 relative" style={{ zIndex: 1 }}>
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                style={{
                  maxWidth: "78%", padding: m.image ? 6 : "11px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                  background: m.role === "user" ? "rgba(199,155,69,0.1)" : "var(--surface)",
                  border: m.role === "user" ? "1px solid rgba(199,155,69,0.3)" : "1px solid var(--border-soft)",
                  color: "var(--text)",
                }}
              >
                {m.image && <img src={m.image} alt="Outfit suggestion" style={{ width: "100%", borderRadius: 10, marginBottom: 8, display: "block" }} />}
                <div style={{ padding: m.image ? "0 8px 6px" : 0 }}>{m.text}</div>
              </div>
              {m.role === "assistant" && i > 0 && <MessageActions text={m.text} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {stage === "intake" && <SituationInput s={s} lang={lang} onSubmit={handleSituationSubmit} />}

        {stage === "extracting" && (
          <div className="flex justify-start items-center" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <LogoOrb size={20} thinking={true} />
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>{s.readingBetweenLines}</span>
            </div>
          </div>
        )}

        {stage === "confirm" && extracted && <ConfirmSummary s={s} extracted={extracted} onConfirm={handleConfirm} onEdit={handleEditRequest} />}
        {stage === "processing" && <ProcessingSequence s={s} onComplete={onProcessingComplete} />}
        {stage === "limit-reached" && <LimitReached s={s} onUpgrade={() => alert("Contact your stylist directly to upgrade to Pro.")} />}
        {stage === "reveal" && analysis && <PerceptionReveal s={s} analysis={analysis} onChoice={onRevealChoice} onReanalyze={handleReanalyze} />}

        {(stage === "refine-loading" || stage === "quickadvice-loading") && (
          <div className="flex justify-start items-center" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <LogoOrb size={20} thinking={true} />
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>{s.thinking}</span>
            </div>
          </div>
        )}

        {stage === "refine" && refineQs && <RefineQuestions questions={refineQs} onDone={onRefineDone} />}
        {stage === "waiting" && <WaitingForStylist s={s} />}
        {stage === "blueprint" && blueprintData && <Blueprint s={s} blueprint={blueprintData.blueprint} />}
        {stage === "quickadvice" && quickTips && <QuickAdvice s={s} tips={quickTips} />}

        <div ref={endRef} />
      </div>

      {showChatInput && (
        <div className="px-4 pb-6 relative" style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 28, padding: "6px 8px 6px 16px" }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4 }} aria-label="Attach">
              <i className="ti ti-plus" style={{ fontSize: 18 }} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFreeText()}
              placeholder={s.chatPlaceholder}
              style={{ flex: 1, background: "transparent", border: "none", fontSize: 14, color: "var(--text)", outline: "none", padding: "8px 0" }}
            />
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4 }} aria-label="Voice">
              <i className="ti ti-microphone" style={{ fontSize: 18 }} />
            </button>
            <button
              onClick={sendFreeText}
              disabled={!input.trim()}
              style={{ width: 34, height: 34, borderRadius: "50%", background: input.trim() ? "var(--gold)" : "var(--surface-2)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "default", flexShrink: 0 }}
              aria-label="Send"
            >
              <i className="ti ti-arrow-up" style={{ fontSize: 16, color: input.trim() ? "#080808" : "var(--text-dim)" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
