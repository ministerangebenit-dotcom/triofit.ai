import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const PROFILE_QUESTIONS = [
  { key: "gender", q: "First — how do you identify?", options: ["Male", "Female", "Prefer not to say"] },
  { key: "age", q: "What's your age range?", options: ["18–24", "25–34", "35–44", "45+"] },
  { key: "style", q: "Which style feels most like you?", options: ["Classic & elegant", "Streetwear & urban", "Afro-chic", "Casual & relaxed", "Depends on the day"] },
  { key: "occasion", q: "What are you dressing for right now?", options: ["A professional interview", "An evening out", "A wedding", "Everyday office wear", "A casual event"] },
];

const TRAITS = [
  { key: "confidence", label: "Confidence", color: "#C79B45" },
  { key: "professionalism", label: "Professionalism", color: "#7F77DD" },
  { key: "approachability", label: "Approachability", color: "#5DCAA5" },
  { key: "authority", label: "Authority", color: "#D85A30" },
];

const BACKEND = "http://localhost:3001";

function Orb({ thinking }) {
  return (
    <div style={{ position: "relative", width: 64, height: 64 }}>
      <motion.div
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #E9C275, #C79B45 55%, #8d6523)",
        }}
        animate={{ scale: thinking ? 0.85 : 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(199,155,69,0.5)" }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function RadarBars({ values }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TRAITS.map((t) => (
        <div key={t.key}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#ccc", marginBottom: 4 }}>
            <span>{t.label}</span>
            <span style={{ color: values[t.key] ? t.color : "#8E8E8E" }}>{values[t.key] ?? 0}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
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
        Math.round(finalScore * 0.45),
        Math.round(finalScore * 0.6),
        Math.round(finalScore * 0.75),
        Math.round(finalScore * 0.9),
        finalScore,
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
        <Orb thinking={phase === "thinking"} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#8E8E8E", textTransform: "uppercase", marginBottom: 16 }}>
        {phase}
      </div>
      <div style={{ maxWidth: 280, margin: "0 auto 20px" }}>
        <RadarBars values={radarValues} />
      </div>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "#8E8E8E", textTransform: "uppercase", marginBottom: 6 }}>
        Perception score
      </div>
      <AnimatePresence mode="wait">
        {displayScore !== null && (
          <motion.div
            key={displayScore}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, color: "#E9C275", lineHeight: 1 }}
          >
            {displayScore}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Conversation() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi Kevin. I'm your TRIOFIT stylist. Let's understand your style before we talk clothes." },
  ]);
  const [profile, setProfile] = useState({});
  const [step, setStep] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealData, setRevealData] = useState(null);
  const [input, setInput] = useState("");
  const [profileDone, setProfileDone] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, showReveal]);

  useEffect(() => {
    const t = setTimeout(() => askNext(0), 800);
    return () => clearTimeout(t);
  }, []);

  function pushAssistant(text) {
    setMessages((m) => [...m, { role: "assistant", text }]);
  }
  function pushUser(text) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  function askNext(i) {
    if (i >= PROFILE_QUESTIONS.length) return;
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      pushAssistant(PROFILE_QUESTIONS[i].q);
    }, 700);
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
          setRevealData({
            traits: { confidence: 75, professionalism: 82, approachability: 68, authority: 79 },
            finalScore: 84,
          });
          setShowReveal(true);
        }
      }, 400);
    } else {
      setTimeout(() => askNext(next), 500);
    }
  }

  async function onRevealComplete() {
    setShowReveal(false);
    setProfileDone(true);
    setThinking(true);
    try {
      const res = await axios.post(`${BACKEND}/chat`, {
        profile,
        messages: [
          {
            role: "user",
            text: `My profile: ${JSON.stringify(profile)}. Give me one specific outfit recommendation for this occasion.`,
          },
        ],
      });
      setThinking(false);
      pushAssistant(res.data.reply);
    } catch {
      setThinking(false);
      pushAssistant("I'm having trouble reaching your stylist brain — check the backend is running.");
    }
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

  const currentQ = PROFILE_QUESTIONS[step];
  const showOptions =
    currentQ && !thinking && !showReveal && messages[messages.length - 1]?.text === currentQ.q;

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#C79B45]/10 border border-[#C79B45]/30 text-white"
                    : "bg-[#121212] text-gray-200"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <div className="flex justify-start">
            <div className="bg-[#121212] px-4 py-3 rounded-2xl text-sm text-gray-400 italic">thinking…</div>
          </div>
        )}

        {showReveal && revealData && (
          <PerceptionReveal
            traits={revealData.traits}
            finalScore={revealData.finalScore}
            onComplete={onRevealComplete}
          />
        )}

        <div ref={endRef} />
      </div>

      {showOptions && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOption(opt)}
              className="px-4 py-2 rounded-full border border-[#C79B45]/40 text-[#C79B45] text-sm hover:bg-[#C79B45]/10 transition"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {profileDone && (
        <div className="px-6 pb-6 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendFreeText()}
            placeholder="Ask your stylist…"
            className="flex-1 bg-[#121212] border border-white/10 rounded-full px-4 py-3 text-sm outline-none focus:border-[#C79B45]/50"
          />
          <button onClick={sendFreeText} className="px-5 py-3 rounded-full bg-[#C79B45] text-black font-semibold text-sm">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
