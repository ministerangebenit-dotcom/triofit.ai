import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FanSpinner, BoomerangSpinner } from "../components/chat/FanSpinner";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";
import { sb } from "../lib/supabase";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

const GOAL_LABELS = {
  job: "getting the job",
  date: "the date",
  wealth: "looking wealthier",
  wedding: "the wedding",
  authority: "building authority",
  brand: "your personal brand",
  School: "looking smart",
};

const PROCESSING_MESSAGES = [
  "Analyzing communication style…",
  "Evaluating social perception signals…",
  "Mapping psychological impression profile…",
  "Comparing against your stated goal…",
  "Weighing tone against context…",
  "Looking for inconsistencies…",
  "Predicting social outcome…",
  "Finalizing your perception profile…",
];

const BLUEPRINT_DIMENSIONS = [
  { key: "confidence", label: "Confidence", color: "#C79B45" },
  { key: "authority", label: "Authority", color: "#D85A30" },
  { key: "trust", label: "Trustworthiness", color: "#7F77DD" },
  { key: "approachability", label: "Approachability", color: "#5DCAA5" },
  { key: "styleFit", label: "Style fit", color: "#D9AE5A" },
];

function RadarBars({ values, dims }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {dims.map((t) => (
        <div key={t.key}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
            <span>{t.label}</span>
            <span style={{ color: values[t.key] ? t.color : "var(--muted)" }}>{values[t.key] ?? 0}%</span>
          </div>
          <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: t.color }}
              initial={{ width: "0%" }}
              animate={{ width: `${values[t.key] ?? 0}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function SituationInput({ goal, onSubmit }) {
  const [text, setText] = useState("");
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 12, lineHeight: 1.7 }}>
        Tell me about your situation — what's coming up, which day and time it is and what you want people to think of you.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. I have a job interview this Thursday 8:00am at a tech startup. I want to look competent but not overdressed…"
        rows={4}
        style={{
          width: "100%", background: "var(--surface)", border: "1px solid var(--border-soft)",
          borderRadius: 14, padding: 14, fontSize: 14, color: "var(--text)", outline: "none",
          resize: "none", fontFamily: "inherit", marginBottom: 12,
        }}
      />
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
        Submit →
      </button>
    </motion.div>
  );
}

function ConfirmSummary({ extracted, onConfirm, onEdit }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        Here's what I deduced from your explanation
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{extracted.summary}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onConfirm}
          style={{ flex: 1, padding: "12px 20px", borderRadius: 14, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          That's right
        </button>
        <button
          onClick={onEdit}
          style={{ flex: 1, padding: "12px 20px", borderRadius: 14, background: "transparent", border: "1px solid var(--border-soft)", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}
        >
          Let me rephrase
        </button>
      </div>
    </motion.div>
  );
}

function ProcessingSequence({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [doneIndexes, setDoneIndexes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const totalMs = 60000;
    const stepMs = totalMs / PROCESSING_MESSAGES.length;

    async function run() {
      const start = Date.now();
      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        setProgress(pct);
        if (pct >= 100) clearInterval(progressTimer);
      }, 200);

      for (let i = 0; i < PROCESSING_MESSAGES.length; i++) {
        if (cancelled) { clearInterval(progressTimer); return; }
        setVisibleIndex(i);
        await new Promise((r) => setTimeout(r, stepMs * 0.75));
        if (cancelled) { clearInterval(progressTimer); return; }
        setDoneIndexes((d) => [...d, i]);
        await new Promise((r) => setTimeout(r, stepMs * 0.25));
      }

      clearInterval(progressTimer);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 500));
      if (!cancelled) onComplete?.();
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ padding: "28px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <FanSpinner size={72} speed={0.6} />
      </div>
      <div style={{ maxWidth: 340, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-dim)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span>Building your perception profile</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 5, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", background: "linear-gradient(90deg, var(--gold-light), var(--gold))" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.6 }}
          />
        </div>
      </div>
      <div style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
        {PROCESSING_MESSAGES.map((m, i) => {
          if (i > visibleIndex) return null;
          const isDone = doneIndexes.includes(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: isDone ? 0.5 : 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 14, color: isDone ? "var(--text-dim)" : "var(--text)", display: "flex", alignItems: "center", gap: 10 }}
            >
              {isDone ? <i className="ti ti-check" style={{ color: "var(--gold)", fontSize: 15, flexShrink: 0 }} /> : <BoomerangSpinner size={15} />}
              {m}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PerceptionReveal({ analysis, onChoice }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        Impression
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)", marginBottom: 12 }}>{analysis.impression}</p>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Reasons</div>
        {analysis.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4, display: "flex", gap: 6 }}>
            <span style={{ color: "var(--gold)" }}>—</span>{r}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div>{analysis.traits.strong.map((t) => <span key={t} style={{ fontSize: 12, color: "#5DCAA5", marginRight: 10 }}>✓ {t}</span>)}</div>
        <div>{analysis.traits.caution.map((t) => <span key={t} style={{ fontSize: 12, color: "#D85A30", marginRight: 10 }}>⚠ {t}</span>)}</div>
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Prediction</div>
      <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>{analysis.prediction}</p>
      <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, textAlign: "center" }}>Should we refine this?</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => onChoice("yes")} style={{ padding: "14px 20px", borderRadius: 14, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Yes, of course
        </button>
        <button onClick={() => onChoice("no")} style={{ padding: "14px 20px", borderRadius: 14, background: "transparent", border: "1px solid var(--border-soft)", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}>
          No, just give me quick advice
        </button>
      </div>
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

function WaitingForStylist() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <BoomerangSpinner size={28} />
      </div>
      <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Your stylist is hand-picking your outfit now…</p>
    </motion.div>
  );
}

function Blueprint({ blueprint }) {
  const [values, setValues] = useState({});
  useEffect(() => {
    let cancelled = false;
    async function run() {
      for (const d of BLUEPRINT_DIMENSIONS) {
        await new Promise((r) => setTimeout(r, 300));
        if (cancelled) return;
        setValues((v) => ({ ...v, [d.key]: blueprint[d.key] }));
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        Perception blueprint
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16 }}>
        <RadarBars values={values} dims={BLUEPRINT_DIMENSIONS} />
      </div>
    </motion.div>
  );
}

function QuickAdvice({ tips }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, lineHeight: 1.7 }}>
        Here's how to still shift the impression, without changing the outfit. Although your chances will be higher if you made a slight change.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tips.map((t, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", display: "flex", gap: 8 }}>
            <span style={{ color: "var(--gold)" }}>—</span>{t}
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

  const [messages, setMessages] = useState([
    { role: "consultant", text: `Hello there! ${userName}. I'm your Personal Stylist. Please, be so kind as to call me Trio.` },
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

  function pushAssistant(text) { setMessages((m) => [...m, { role: "consultant", text }]); }
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
      pushAssistant("I'm afraid i couldn't read that — do you mind trying again?");
      setStage("intake");
    }
  }

  function handleEditRequest() {
    setStage("intake");
  }

  async function handleConfirm() {
    await axios.post(`${BACKEND}/session`, { session_id: sessionId, name: userName, goal, ...profile });
    setStage("processing");
  }

  async function onProcessingComplete() {
    try {
      const res = await axios.post(`${BACKEND}/analysis`, { session_id: sessionId, profile, goal, situation });
      setAnalysis(res.data);
      setStage("reveal");
    } catch {
      pushAssistant("Oops! It would seem i am unable to respond right now. You'll be notified once i'm over this.");
      setStage("reveal");
      setAnalysis({ impression: "Trouble connecting.", reasons: [], traits: { strong: [], caution: [] }, prediction: "" });
    }
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
        setQuickTips(["Arrive early.", "Keep it simple.", "Make eye contact."]);
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
        pushAssistant("I don't have a perfect matching outfit template yet — Do you mind waiting a tiny bit? I'll get that ready for you in a sec.");
      }
      setShowChatInput(true);
    } catch {
      pushAssistant("It would seem the outfit catalog is out of my reach right now. Give me a sec, i'll take an alternative route");
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
      .catch(() => pushAssistant("Connection issue — don't take this the wrong way, but is your network alright?"));
  }

  return (
    <div className="h-screen flex flex-col relative" style={{ background: "var(--bg)" }}>
      <ThemeToggle />
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
              {m.role === "consultant" && i > 0 && <MessageActions text={m.text} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {stage === "intake" && <SituationInput goal={goal} onSubmit={handleSituationSubmit} />}

        {stage === "extracting" && (
          <div className="flex justify-start items-center" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <BoomerangSpinner size={20} />
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>reading between the lines…</span>
            </div>
          </div>
        )}

        {stage === "confirm" && extracted && <ConfirmSummary extracted={extracted} onConfirm={handleConfirm} onEdit={handleEditRequest} />}
        {stage === "processing" && <ProcessingSequence onComplete={onProcessingComplete} />}
        {stage === "reveal" && analysis && <PerceptionReveal analysis={analysis} onChoice={onRevealChoice} />}

        {(stage === "refine-loading" || stage === "quickadvice-loading") && (
          <div className="flex justify-start items-center" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <BoomerangSpinner size={20} />
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>thinking…</span>
            </div>
          </div>
        )}

        {stage === "refine" && refineQs && <RefineQuestions questions={refineQs} onDone={onRefineDone} />}
        {stage === "waiting" && <GiveMeaSEC/>}
        {stage === "blueprint" && blueprintData && <Blueprint blueprint={blueprintData.blueprint} />}
        {stage === "quickadvice" && quickTips && <QuickAdvice tips={quickTips} />}

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
              placeholder="Ask Triofit"
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
