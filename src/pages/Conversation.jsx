import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FanSpinner, BoomerangSpinner } from "../components/chat/FanSpinner";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";

const PROFILE_QUESTIONS = [
  { key: "gender", q: () => "First — how do you identify?", options: ["Male", "Female", "Prefer not to say"] },
  { key: "age", q: () => "What's your age range?", options: ["18–24", "25–34", "35–44", "45+"] },
  { key: "style", q: () => "Which style feels most like you?", options: ["Classic & elegant", "Streetwear & urban", "Afro-chic", "Casual & relaxed", "Depends on the day"] },
  { key: "occasion", q: () => "What are you dressing for right now?", options: ["A professional interview", "An evening out", "A wedding", "Everyday office wear", "A casual event"] },
];

const TRAITS = [
  { key: "confidence", label: "Confidence", color: "#C79B45" },
  { key: "professionalism", label: "Professionalism", color: "#7F77DD" },
  { key: "approachability", label: "Approachability", color: "#5DCAA5" },
  { key: "authority", label: "Authority", color: "#D85A30" },
];

const BACKEND = "http://localhost:3001";

function RadarBars({ values }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TRAITS.map((t) => (
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
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PerceptionReveal({ traits, finalScore, onComplete }) {
  const [phase, setPhase] = useState("listening");
  const [radarValues, setRadarValues] = useState({});
  const [displayScore, setDisplayScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setPhase("listening");
      await new Promise((r) => setTimeout(r, 900));
      if (cancelled) return;
      setPhase("thinking");
      for (const t of TRAITS) {
        await new Promise((r) => setTimeout(r, 450));
        if (cancelled) return;
        setRadarValues((v) => ({ ...v, [t.key]: traits[t.key] }));
      }
      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;
      setPhase("complete");
      const steps = [
        Math.round(finalScore * 0.45), Math.round(finalScore * 0.6),
        Math.round(finalScore * 0.75), Math.round(finalScore * 0.9), finalScore,
      ];
      for (const s of steps) {
        await new Promise((r) => setTimeout(r, 220));
        if (cancelled) return;
        setDisplayScore(s);
      }
      await new Promise((r) => setTimeout(r, 400));
      if (!cancelled) onComplete?.();
    }
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <FanSpinner size={44} speed={phase === "thinking" ? 0.6 : 1.4} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 16 }}>
        {phase}
      </div>
      <div style={{ maxWidth: 280, margin: "0 auto 20px" }}>
        <RadarBars values={radarValues} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 }}>
        Perception score
      </div>
      <AnimatePresence mode="wait">
        {displayScore !== null && (
          <motion.div
            key={displayScore}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display"
            style={{ fontSize: 44, color: "var(--gold)", lineHeight: 1 }}
          >
            {displayScore}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageActions({ text, onRegenerate }) {
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
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utter);
  }

  const iconBtn = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--text-dim)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    fontSize: 14,
  };

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6, marginLeft: 2 }}>
      <button onClick={copyText} style={iconBtn} aria-label="Copy" title="Copy">
        <i className={copied ? "ti ti-check" : "ti ti-copy"} style={{ color: copied ? "var(--gold)" : "var(--text-dim)" }} />
      </button>
      <button onClick={playVoice} style={iconBtn} aria-label="Play" title="Play">
        <i className={playing ? "ti ti-player-pause" : "ti ti-player-play"} style={{ color: playing ? "var(--gold)" : "var(--text-dim)" }} />
      </button>
      <button onClick={() => setLiked(liked === "up" ? null : "up")} style={iconBtn} aria-label="Like" title="Like">
        <i className="ti ti-thumb-up" style={{ color: liked === "up" ? "var(--gold)" : "var(--text-dim)" }} />
      </button>
      <button onClick={() => setLiked(liked === "down" ? null : "down")} style={iconBtn} aria-label="Dislike" title="Dislike">
        <i className="ti ti-thumb-down" style={{ color: liked === "down" ? "var(--gold)" : "var(--text-dim)" }} />
      </button>
      <button onClick={onRegenerate} style={iconBtn} aria-label="Regenerate" title="Regenerate">
        <i className="ti ti-refresh" />
      </button>
    </div>
  );
}

export default function Conversation() {
  const userName = localStorage.getItem("tf_name") || "there";
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi ${userName}. I'm your TRIOFIT stylist. Let's understand your style before we talk clothes.` },
  ]);
  const [profile, setProfile] = useState({});
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealData, setRevealData] = useState(null);
  const [input, setInput] = useState("");
  const [profileDone, setProfileDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking, showReveal]);
  useEffect(() => { const t = setTimeout(() => askNext(0), 800); return () => clearTimeout(t); }, []);

  function pushAssistant(text) { setMessages((m) => [...m, { role: "assistant", text }]); }
  function pushUser(text) { setMessages((m) => [...m, { role: "user", text }]); }

  function askNext(i) {
    if (i >= PROFILE_QUESTIONS.length) return;
    setThinking(true);
    setTimeout(() => { setThinking(false); pushAssistant(PROFILE_QUESTIONS[i].q()); }, 700);
  }

  async function handleOption(opt) {
    const q = PROFILE_QUESTIONS[step];
    pushUser(opt);
    const updated = { ...profile, [q.key]: opt };
    setProfile(updated);
    const next = step + 1;
    setStep(next);

    if (next >= PROFILE_QUESTIONS.length) {
      setTimeout(async () => {
        try {
          const res = await axios.post(`${BACKEND}/score`, { profile: updated });
          setRevealData(res.data);
          setShowReveal(true);
        } catch {
          setRevealData({ traits: { confidence: 75, professionalism: 82, approachability: 68, authority: 79 }, finalScore: 84 });
          setShowReveal(true);
        }
      }, 400);
    } else {
      setTimeout(() => askNext(next), 500);
    }
  }

  async function fetchRecommendation() {
    setThinking(true);
    try {
      const res = await axios.post(`${BACKEND}/chat`, {
        profile,
        messages: [{ role: "user", text: `My profile: ${JSON.stringify(profile)}. Give me one specific outfit recommendation for this occasion.` }],
      });
      setThinking(false);
      pushAssistant(res.data.reply);
    } catch {
      setThinking(false);
      pushAssistant("I'm having trouble reaching your stylist brain — check the backend is running.");
    }
  }

  async function onRevealComplete() {
    setShowReveal(false);
    setProfileDone(true);
    await fetchRecommendation();
  }

  async function sendFreeText() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    pushUser(text);
    setThinking(true);
    try {
      const res = await axios.post(`${BACKEND}/chat`, {
        profile,
        messages: [...messages, { role: "user", text }].map((m) => ({ role: m.role, text: m.text })),
      });
      setThinking(false);
      pushAssistant(res.data.reply);
    } catch {
      setThinking(false);
      pushAssistant("Connection issue — is the backend running?");
    }
  }

  async function regenerateLast(index) {
    const priorMessages = messages.slice(0, index);
    setThinking(true);
    try {
      const res = await axios.post(`${BACKEND}/chat`, {
        profile,
        messages: priorMessages.map((m) => ({ role: m.role, text: m.text })),
      });
      setThinking(false);
      setMessages((m) => {
        const copy = [...m];
        copy[index] = { role: "assistant", text: res.data.reply };
        return copy;
      });
    } catch {
      setThinking(false);
    }
  }

  const currentQ = PROFILE_QUESTIONS[step];
  const showOptions = currentQ && !thinking && !showReveal && messages[messages.length - 1]?.text === currentQ.q();

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
              {m.role === "assistant" && i > 0 && (
                <MessageActions text={m.text} onRegenerate={() => regenerateLast(i)} />
              )}
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

        {showReveal && revealData && (
          <PerceptionReveal traits={revealData.traits} finalScore={revealData.finalScore} onComplete={onRevealComplete} />
        )}

        <div ref={endRef} />
      </div>

      {showOptions && (
        <div className="px-6 pb-3 flex flex-wrap gap-2 relative" style={{ zIndex: 1 }}>
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOption(opt)}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 13,
                border: "1px solid rgba(199,155,69,0.4)", color: "var(--gold)",
                background: "transparent", cursor: "pointer",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {profileDone && (
        <div className="px-4 pb-6 relative" style={{ zIndex: 1 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--surface)", border: "1px solid var(--border-soft)",
              borderRadius: 28, padding: "6px 8px 6px 16px",
            }}
          >
            <button
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4 }}
              aria-label="Attach"
              title="Attach"
            >
              <i className="ti ti-plus" style={{ fontSize: 18 }} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendFreeText()}
              placeholder="Ask your stylist"
              style={{
                flex: 1, background: "transparent", border: "none",
                fontSize: 14, color: "var(--text)", outline: "none", padding: "8px 0",
              }}
            />

            <button
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-dim)", display: "flex", alignItems: "center", padding: 4 }}
              aria-label="Voice"
              title="Voice"
            >
              <i className="ti ti-microphone" style={{ fontSize: 18 }} />
            </button>

            <button
              onClick={sendFreeText}
              disabled={!input.trim()}
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: input.trim() ? "var(--gold)" : "var(--surface-2)",
                border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default", flexShrink: 0,
              }}
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
