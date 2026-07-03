import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const GOALS = [
  { key: "job", label: "Get a job", icon: "ti-briefcase" },
  { key: "date", label: "Impress on a date", icon: "ti-heart" },
  { key: "wealth", label: "Look wealthier", icon: "ti-diamond" },
  { key: "wedding", label: "A wedding", icon: "ti-flower" },
  { key: "authority", label: "Build authority", icon: "ti-shield-check" },
  { key: "brand", label: "Personal branding", icon: "ti-user-star" },
  { key: "School", label: "Look Smart in School", icon: "ti-book" },
];

export default function GoalScreen() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const userName = localStorage.getItem("tf_name") || "there";

  function proceed(goalKey) {
    setSelected(goalKey);
    localStorage.setItem("tf_goal", goalKey);
    setTimeout(() => navigate("/conversation"), 350);
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-8" style={{ background: "var(--bg)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 380 }}
      >
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          {userName}
        </div>
        <h1 className="font-display" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
          Why are you here today?
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 28, textAlign: "center", lineHeight: 1.6 }}>
          This shapes everything I recommend.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOALS.map((g) => (
            <motion.button
              key={g.key}
              onClick={() => proceed(g.key)}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 18px", borderRadius: 14, textAlign: "left",
                background: selected === g.key ? "rgba(199,155,69,0.12)" : "var(--surface)",
                border: selected === g.key ? "1px solid var(--gold)" : "1px solid var(--border-soft)",
                color: "var(--text)", fontSize: 14, cursor: "pointer",
              }}
            >
              <i className={`ti ${g.icon}`} style={{ fontSize: 18, color: "var(--gold)" }} />
              {g.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
