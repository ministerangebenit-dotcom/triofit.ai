import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LangToggle from "../components/shared/LangToggle";
import { useLang, t } from "../lib/i18n";

const HONOREES = [
  {
    name: "[Name here]",
    photo: "/memorial/placeholder.jpg",
    years: "[Year] – 2026",
    role: "[Role at TRIOFIT]",
    bio: "[A few sentences about who they were, written by the people who knew them.]",
    impact: "[A specific thing they contributed — a moment, a piece of work, a way they showed up for the team.]",
  },
];

export default function Memorial() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);

  return (
    <div className="h-screen overflow-y-auto px-6 py-10" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />

      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent", border: "none", color: "var(--text-dim)",
          fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 32,
        }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 16 }} /> {s.backLabel}
      </button>

      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>
            {s.memorialTag}
          </div>
          <h1 className="font-display" style={{ fontSize: 26, color: "var(--text)", lineHeight: 1.4 }}>
            {s.memorialTitle}
          </h1>
        </div>

        {HONOREES.map((person, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            style={{
              background: "var(--surface)", border: "1px solid var(--border-soft)",
              borderRadius: 20, padding: 28, marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 120, height: 120, borderRadius: "50%", overflow: "hidden",
                  border: "2px solid var(--gold)", marginBottom: 16, background: "var(--surface-2)",
                }}
              >
                <img
                  src={person.photo}
                  alt={person.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>
              <h2 className="font-display" style={{ fontSize: 22, color: "var(--text)", marginBottom: 4, textAlign: "center" }}>
                {person.name}
              </h2>
              <div style={{ fontSize: 13, color: "var(--gold)", marginBottom: 2 }}>{person.years}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{person.role}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                {s.memorialAboutLabel}
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8 }}>{person.bio}</p>
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                {s.memorialImpactLabel}
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.8 }}>{person.impact}</p>
            </div>
          </motion.div>
        ))}

        <p style={{ fontSize: 12, color: "var(--text-dim)", textAlign: "center", marginTop: 32, lineHeight: 1.7 }}>
          {s.memorialFooter}
        </p>
      </div>
    </div>
  );
}
