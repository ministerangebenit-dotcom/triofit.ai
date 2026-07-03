import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { BoomerangSpinner } from "../components/chat/BoomerangSpinner";
import ChatBackground from "../components/chat/ChatBackground";
import ThemeToggle from "../components/shared/ThemeToggle";
import { sb } from "../lib/supabase";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

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
  const [thinking, setThinking] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ✅ REALTIME FIXED
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

    return () => {
      sb.removeChannel(chatChannel);
    };
  }, [sessionId]);

  function pushUser(text) {
    setMessages((m) => [...m, { role: "user", text }]);
  }

  function pushAssistant(text) {
    setMessages((m) => [...m, { role: "assistant", text }]);
  }

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

  return (
    <div className="h-screen flex flex-col">
      <ThemeToggle />
      <ChatBackground />

      {/* CHAT */}
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
              <div style={{ maxWidth: "78%" }}>{m.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <div style={{ display: "flex", gap: 8 }}>
            <BoomerangSpinner size={18} />
            <span>thinking...</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Talk to your stylist..."
        />
      </div>
    </div>
  );
}
