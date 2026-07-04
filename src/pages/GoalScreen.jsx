import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LangToggle from "../components/shared/LangToggle";
import { useLang, t } from "../lib/i18n";

export default function GoalScreen() {
  const [selected, setSelected] = useState(null);
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);
  const navigate = useNavigate();
  const userName = localStorage.getItem("tf_name") || "there";

  const GOALS = [
    { key: "job", label: s.goalJob, icon: "ti-briefcase" },
    { key: "date", label: s.goalDate, icon: "ti-heart" },
    { key: "wealth", label: s.goalWealth, icon: "ti-diamond" },
    { key: "wedding", label: s.goalWedding, icon: "ti-flower" },
    { key: "authority", label: s.goalAuthority, icon: "ti-shield-check" },
    { key: "brand", label: s.goalBrand, icon: "ti-user-star" },
  ];

  function proceed(goalKey) {
    setSelected(goalKey);
    localStorage.setItem("tf_goal", goalKey);
    setTimeout(() => navigate("/conversation"), 350);
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-8" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
          {userName}
        </div>
        <h1 className="font-display" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
          {s.goalTitle}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 28, textAlign: "center", lineHeight: 1.6 }}>
          {s.goalSub}
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
