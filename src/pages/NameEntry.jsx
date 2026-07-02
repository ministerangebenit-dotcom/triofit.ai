import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NameEntry() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function submit() {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    localStorage.setItem("tf_name", trimmed);
    navigate("/conversation");
  }

  return (
    <div
      className="h-screen flex flex-col items-center justify-center px-8"
      style={{ background: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 340 }}
      >
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8 }}>
          Welcome
        </div>
        <h1 className="font-display" style={{ fontSize: 26, color: "var(--text)", marginBottom: 8 }}>
          What's your name?
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 28, lineHeight: 1.6 }}>
          Your personal stylist is ready.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Your first name"
          autoFocus
          style={{
            width: "100%", padding: "14px 18px", background: "var(--surface-2)",
            border: "1.5px solid var(--border-soft)", borderRadius: 12,
            color: "var(--text)", fontSize: 16, outline: "none", marginBottom: 20,
          }}
        />
        <button
          onClick={submit}
          disabled={name.trim().length < 2}
          style={{
            width: "100%", padding: "14px 24px",
            background: name.trim().length < 2 ? "var(--surface-2)" : "linear-gradient(135deg, var(--gold-light), var(--gold))",
            border: "none", borderRadius: 50,
            color: name.trim().length < 2 ? "var(--text-dim)" : "#080808",
            fontSize: 14, fontWeight: 700, letterSpacing: "0.03em",
            cursor: name.trim().length < 2 ? "default" : "pointer",
          }}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
