import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FanSpinner, BoomerangSpinner } from "../components/chat/FanSpinner";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";
import { sb } from "../lib/supabase";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

/**
 * SYSTEM SHIFT:
 * - no rigid questionnaire flow
 * - everything becomes conversational
 * - extraction happens silently in backend (or optional AI parse layer)
 */

const BLUEPRINT_DIMENSIONS = [
  { key: "confidence", label: "Confidence", color: "#C79B45" },
  { key: "authority", label: "Authority", color: "#D85A30" },
  { key: "trust", label: "Trustworthiness", color: "#7F77DD" },
  { key: "approachability", label: "Approachability", color: "#5DCAA5" },
  { key: "styleFit", label: "Style fit", color: "#D9AE5A" },
];

const DECLINE_TIPS = [
  "Arrive 10-15 minutes early — punctuality reads as respect before you say a word.",
  "Keep your clothes wrinkle-free.",
  "Keep your phone out of sight during introductions.",
  "Maintain eye contact during your first greeting.",
];

function MessageActions({ text }) {
  const [copied, setCopied] = useState(false);
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
    padding: 4,
  };

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
      <button onClick={copyText} style={iconBtn}>
        {copied ? "✓" : "⧉"}
      </button>
      <button onClick={playVoice} style={iconBtn}>
        {playing ? "⏸" : "▶"}
      </button>
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
    {
      role: "assistant",
      text: `Hi ${userName}. Tell me what you're trying to achieve — I’ll understand your style from how you speak.`,
    },
  ]);

  const [profile, setProfile] = useState({});
  const [input, setInput] = useState("");

  const [stage, setStage] = useState("chat"); // chat → thinking → analysis → blueprint → decline
  const [thinking, setThinking] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [blueprintData, setBlueprintData] = useState(null);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking, stage]);

  /**
   * SUPABASE LIVE UPDATES (kept intact)
   */
  useEffect(() => {
    const chatChannel = sb
      .channel("chat-" + sessionId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new;
          if (m.session_id !== sessionId || m.sender !== "admin") return;

          setMessages((msgs) => [
            ...msgs,
            { role: "assistant", text: m.message },
          ]);
        }
      )
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

  function pushUser(text) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  function pushAssistant(text) {
    setMessages((m) => [...m, { role: "assistant", text }]);
  }

  /**
   * MAIN SHIFT:
   * NO FORMS — everything is natural chat
   * backend extracts profile silently
   */
  async function sendMessage() {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    pushUser(text);
    setThinking(true);

    try {
      const res = await axios.post(`${BACKEND}/chat`, {
        session_id: sessionId,
        message: text,
        goal,
        profile,
      });

      /**
       * backend returns:
       * - reply
       * - optional extracted_profile updates
       */
      if (res.data?.reply) {
        pushAssistant(res.data.reply);
      }

      if (res.data?.profile) {
        setProfile((p) => ({ ...p, ...res.data.profile }));
      }
    } catch (e) {
      pushAssistant("Connection issue — stylist brain unavailable.");
    }

    setThinking(false);
  }

  async function triggerAnalysis() {
    setStage("thinking");

    try {
      const res = await axios.post(`${BACKEND}/analysis`, {
        session_id: sessionId,
        profile,
        goal,
        messages,
      });

      setAnalysis(res.data);
      setStage("analysis");
    } catch {
      setAnalysis({
        impression: "Unable to analyze right now.",
        reasons: [],
        traits: { strong: [], caution: [] },
        prediction: "",
        blueprint: {},
      });

      setStage("analysis");
    }
  }

  function onChoice(choice) {
    if (choice === "keep") {
      setStage("decline");
      return;
    }
    triggerAnalysis();
  }

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{ background: "var(--bg)" }}
    >
      <ThemeToggle />
      <ChatBackground />

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                style={{
                  maxWidth: "78%",
                  padding: "11px 16px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.6,
                  background:
                    m.role === "user"
                      ? "rgba(199,155,69,0.1)"
                      : "var(--surface)",
                  border:
                    m.role === "user"
                      ? "1px solid rgba(199,155,69,0.3)"
                      : "1px solid var(--border-soft)",
                  color: "var(--text)",
                }}
              >
                {m.text}
              </div>

              {m.role === "assistant" && (
                <MessageActions text={m.text} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <div style={{ display: "flex", gap: 8 }}>
            <BoomerangSpinner size={18} />
            <span style={{ color: "var(--text-dim)", fontSize: 13 }}>
              thinking...
            </span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="px-4 pb-6">
        <div
          style={{
            display: "flex",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border-soft)",
            borderRadius: 28,
            padding: "6px 8px 6px 16px",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Talk to your stylist..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              fontSize: 14,
              color: "var(--text)",
              outline: "none",
            }}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: input.trim()
                ? "var(--gold)"
                : "var(--surface-2)",
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* STAGES (kept minimal, optional expansion later) */}
      {stage === "analysis" && analysis && (
        <div style={{ padding: 20 }}>
          <div>{analysis.impression}</div>

          <button onClick={() => onChoice("improve")}>
            Improve my appearance
          </button>
          <button onClick={() => onChoice("keep")}>
            Keep current outfit
          </button>
        </div>
      )}

      {stage === "decline" && (
        <div style={{ padding: 20 }}>
          {DECLINE_TIPS.map((t, i) => (
            <div key={i}>— {t}</div>
          ))}
        </div>
      )}
    </div>
  );
}
