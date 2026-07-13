import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LangToggle from "../components/shared/LangToggle";
import LogoOrb from "../components/shared/LogoOrb";
import { useLang, t } from "../lib/i18n";

export default function About() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);

  return (
    <div className="h-screen overflow-y-auto px-6 py-8" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />

      <button
        onClick={() => navigate(-1)}
        style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 16 }} /> {s.backLabel}
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <LogoOrb size={56} thinking={false} />
        </div>

        <h1 className="font-display" style={{ fontSize: 26, color: "var(--text)", textAlign: "center", marginBottom: 24 }}>
          {s.aboutTitle}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
              {s.aboutWhoLabel}
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{s.aboutWhoText}</p>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
              {s.aboutWhyLabel}
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{s.aboutWhyText}</p>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
              {s.aboutHowLabel}
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{s.aboutHowText}</p>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: 16, marginTop: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
              {s.aboutContactLabel}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>{s.aboutContactText}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
