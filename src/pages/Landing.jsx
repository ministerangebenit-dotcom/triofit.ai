import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundGlow from "../components/landing/BackgroundGlow";
import LogoOrb from "../components/shared/LogoOrb";
import LangToggle from "../components/shared/LangToggle";
import ProModal from "../components/shared/ProModal";
import { useLang, t } from "../lib/i18n";

export default function Landing() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState(useLang());
  const [proOpen, setProOpen] = useState(false);
  const s = t(lang);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  function handleBegin() {
    const existingName = localStorage.getItem("tf_name");
    const existingGoal = localStorage.getItem("tf_goal");
    navigate(existingName && existingGoal ? "/conversation" : "/name");
  }

  return (
    <div className="relative h-screen overflow-hidden flex flex-col justify-center items-center px-8" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />
      <BackgroundGlow />

      <div className="text-center z-10">
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LogoOrb size={72} thinking={false} />
        </div>

        <motion.h1
          className="font-display"
          style={{ marginTop: 32, fontSize: 44, color: "var(--text)", letterSpacing: "0.02em" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {s.landingHeadline}
        </motion.h1>

        <motion.p
          style={{ marginTop: 20, maxWidth: 420, fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, margin: "20px auto 0" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {s.landingSub}
        </motion.p>

        <motion.button
          onClick={handleBegin}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 40,
            padding: "15px 32px",
            borderRadius: 50,
            background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
            border: "none",
            color: "#080808",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {s.landingCta}
        </motion.button>

        <motion.button
          onClick={() => setProOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            marginTop: 32,
            padding: "16px 20px",
            borderRadius: 16,
            background: "rgba(199,155,69,0.06)",
            border: "1px solid rgba(199,155,69,0.2)",
            maxWidth: 380,
            width: "100%",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            {s.proTag}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
            {s.proPitch}
          </div>
        </motion.button>
      </div>

      <ProModal open={proOpen} onClose={() => setProOpen(false)} />
    </div>
  );
}
