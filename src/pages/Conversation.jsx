import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FanSpinner, BoomerangSpinner } from "../components/chat/FanSpinner";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";

const GOAL_LABELS = {
  job: "getting the job",
  date: "the date",
  wealth: "looking wealthier",
  wedding: "the wedding",
  authority: "building authority",
  brand: "your personal brand",
};

const PROFILE_QUESTIONS = [
  { key: "gender", q: () => "Before I recommend anything, I want to understand who I'm dressing. How do you identify?", options: ["Male", "Female", "Prefer not to say"] },
  { key: "age", q: () => "And which age range fits you?", options: ["18–24", "25–34", "35–44", "45+"] },
  { key: "style", q: () => "Now tell me — which style feels most like you, on a normal day?", options: ["Classic & elegant", "Streetwear & urban", "Afro-chic", "Casual & relaxed", "Depends on the day"] },
  { key: "occasion", q: (goal) => `Since you're focused on ${GOAL_LABELS[goal] || "this"}, what's the actual setting?`, options: ["A professional interview", "An evening out", "A wedding", "Everyday office wear", "A casual event"] },
];

const THINKING_MESSAGES = [
  "Understanding your personality…",
  "Evaluating confidence signals…",
  "Comparing outfit goals…",
  "Reading between the lines of what you said…",
  "Estimating first impressions…",
  "Weighing tone against context…",
  "Looking for inconsistencies…",
  "Predicting social perception…",
];

const BLUEPRINT_DIMENSIONS = [
  { key: "confidence", label: "Confidence", color: "#C79B45" },
  { key: "authority", label: "Authority", color: "#D85A30" },
  { key: "trust", label: "Trustworthiness", color: "#7F77DD" },
  { key: "approachability", label: "Approachability", color: "#5DCAA5" },
  { key: "styleFit", label: "Style fit", color: "#D9AE5A" },
];

function mockAnalysis(profile, goal) {
  const seed = JSON.stringify(profile).length + goal.length;
  const rand = (min, max, offset) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor(min + (x - Math.floor(x)) * (max - min));
  };
  return {
    impression: `You come across as intentional and detail-oriented. The way you described your priorities suggests you value being taken seriously over being trendy.`,
    reasons: [
      `You're dressing for ${GOAL_LABELS[goal] || "this occasion"}, not a casual outing.`,
      `You chose "${profile.style}" over more experimental options.`,
      `You framed the occasion as something with real stakes.`,
    ],
    traits: {
      strong: ["Serious", "Organized", "Credible"],
      caution: ["Slightly reserved", "Could read as guarded"],
    },
    prediction: `Based on what you've shared, your current instinct is solid — but there's a gap between how put-together you want to seem and what typically reads that way in person. That gap is closeable.`,
    blueprint: {
      confidence: rand(65, 95, 1),
      authority: rand(60, 92, 2),
      trust: rand(70, 96, 3),
      approachability: rand(50, 85, 4),
      styleFit: rand(60, 90, 5),
    },
    outfit: `A tailored navy overshirt over a plain white tee, straight-leg trousers, and minimal leather shoes. It keeps you sharp without looking like you tried too hard.`,
  };
}

const DECLINE_TIPS = [
  "Arrive 10-15 minutes early — punctuality reads as respect before you say a word.",
  "Keep your clothes wrinkle-free, even a simple outfit looks careless if it's creased.",
  "Keep your phone out of sight during introductions.",
  "Maintain eye contact during your first greeting — it carries more weight than the outfit.",
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

function ThinkingSequence({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(-1);
  const [doneIndexes, setDoneIndexes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const totalMs = 60000;
    const stepMs = totalMs / THINKING_MESSAGES.length;

    async function run() {
      const start = Date.now();

      const progressTimer = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, (elapsed / totalMs) * 100);
        setProgress(pct);
        if (pct >= 100) clearInterval(progressTimer);
      }, 200);

      for (let i = 0; i < THINKING_MESSAGES.length; i++) {
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
            transition={{ ease: "linear", duration: 0.2 }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
        {THINKING_MESSAGES.map((m, i) => {
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
              {isDone ? (
                <i className="ti ti-check" style={{ color: "var(--gold)", fontSize: 15, flexShrink: 0 }} />
              ) : (
                <BoomerangSpinner size={15} />
              )}
              {m}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AnalysisReveal({ analysis, onChoice }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10 }}>
        Here's the impression you've created in my mind
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)", marginBottom: 12 }}>{analysis.impression}</p>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>Why I think that</div>
        {analysis.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 4, display: "flex", gap: 6 }}>
            <span style={{ color: "var(--gold)" }}>—</span>{r}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        <div>
          {analysis.traits.strong.map((t) => (
            <span key={t} style={{ fontSize: 12, color: "#5DCAA5", marginRight: 10 }}>✓ {t}</span>
          ))}
        </div>
        <div>
          {analysis.traits.caution.map((t) => (
            <span key={t} style={{ fontSize: 12, color: "#D85A30", marginRight: 10 }}>⚠ {t}</span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
        {analysis.prediction}
      </p>

      <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, textAlign: "center" }}>Let's fix that together.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => onChoice("improve")}
          style={{ padding: "14px 20px", borderRadius: 14, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Yes, improve my appearance
        </button>
        <button
          onClick={() => onChoice("keep")}
          style={{ padding: "14px 20px", borderRadius: 14, background: "transparent", border: "1px solid var(--border-soft)", color: "var(--text-dim)", fontSize: 14, cursor: "pointer" }}
        >
          I'll keep my current outfit
        </button>
      </div>
    </motion.div>
  );
}

function Blueprint({ blueprint, outfit }) {
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
      <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <RadarBars values={values} dims={BLUEPRINT_DIMENSIONS} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
        Recommended outfit
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{outfit}</p>
    </motion.div>
  );
}

function DeclinePath() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "8px 0 20px" }}>
      <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 14, lineHeight: 1.7 }}>
        I respect your decision. Here are things that will improve your first impression without changing your outfit.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DECLINE_TIPS.map((t, i) => (
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

  function copyText() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
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
      <button style={iconBtn} aria-label="Regenerate"><i className="ti ti-refresh" /></button>
    </div>
  );
}

export default function Conversation() {
  const userName = localStorage.getItem("tf_name") || "there";
  const goal = localStorage.getItem("tf_goal") || "authority";

  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi ${userName}. I'm your TRIOFIT stylist. Let's understand your style before we talk clothes.` },
  ]);
  const [profile, setProfile] = useState({});
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [stage, setStage] = useState("questions");
  const [analysis, setAnalysis] = useState(null);
  const [input, setInput] = useState("");
  const [profileDone, setProfileDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking, stage]);
  useEffect(() => { const t = setTimeout(() => askNext(0), 800); return () => clearTimeout(t); }, []);

  function pushAssistant(text) { setMessages((m) => [...m, { role: "assistant", text }]); }
  function pushUser(text) { setMessages((m) => [...m, { role: "user", text }]); }

  function askNext(i) {
    if (i >= PROFILE_QUESTIONS.length) return;
    setThinking(true);
    setTimeout(() => { setThinking(false); pushAssistant(PROFILE_QUESTIONS[i].q(goal)); }, 700);
  }

  function handleOption(opt) {
    const q = PROFILE_QUESTIONS[step];
    pushUser(opt);
    const updated = { ...profile, [q.key]: opt };
    setProfile(updated);
    const next = step + 1;
    setStep(next);

    if (next >= PROFILE_QUESTIONS.length) {
      setTimeout(() => {
        setStage("thinking");
        setAnalysis(mockAnalysis(updated, goal));
      }, 400);
    } else {
      setTimeout(() => askNext(next), 500);
    }
  }

  function onThinkingComplete() {
    setStage("analysis");
  }

  function onAnalysisChoice(choice) {
    if (choice === "improve") {
      setStage("blueprint");
    } else {
      setStage("decline");
    }
    setProfileDone(true);
  }

  function sendFreeText() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    pushUser(text);
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      pushAssistant("Noted — once we're connected to a live stylist brain, I'll respond to this directly.");
    }, 900);
  }

  const currentQ = PROFILE_QUESTIONS[step];
  const showOptions = currentQ && !thinking && stage === "questions" && messages[messages.length - 1]?.text === currentQ.q(goal);

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
                  maxWidth: "78%", padding: "11px 16px", borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                  background: m.role === "user" ? "rgba(199,155,69,0.1)" : "var(--surface)",
                  border: m.role === "user" ? "1px solid rgba(199,155,69,0.3)" : "1px solid var(--border-soft)",
                  color: "var(--text)",
                }}
              >
                {m.text}
              </div>
              {m.role === "assistant" && i > 0 && <MessageActions text={m.text} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <div className="flex justify-start items-center" style={{ gap: 8 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <BoomerangSpinner size={20} />
              <span style={{ fontSize: 13, color: "var(--text-dim)", fontStyle: "italic" }}>thinking…</span>
            </div>
          </div>
        )}

        {stage === "thinking" && <ThinkingSequence onComplete={onThinkingComplete} />}
        {stage === "analysis" && analysis && <AnalysisReveal analysis={analysis} onChoice={onAnalysisChoice} />}
        {stage === "blueprint" && analysis && <Blueprint blueprint={analysis.blueprint} outfit={analysis.outfit} />}
        {stage === "decline" && <DeclinePath />}

        <div ref={endRef} />
      </div>

      {showOptions && (
        <div className="px-6 pb-3 flex flex-wrap gap-2 relative" style={{ zIndex: 1 }}>
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOption(opt)}
              style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, border: "1px solid rgba(199,155,69,0.4)", color: "var(--gold)", background: "transparent", cursor: "pointer" }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {profileDone && (
        <div className="px-4 pb-6 relative" style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 28, padding: "6px 8px 6px 16px" }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4 }} aria-label="Attach">
              <i className="ti ti-plus" style={{ fontSize: 18 }} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFreeText()}
              placeholder="Ask your stylist"
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
