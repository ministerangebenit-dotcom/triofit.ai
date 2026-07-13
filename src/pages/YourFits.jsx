import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import LangToggle from "../components/shared/LangToggle";
import { useLang, t } from "../lib/i18n";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

export default function YourFits() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);
  const [fits, setFits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem("tf_session");
    if (!sessionId) { setLoading(false); return; }

    axios.get(`${BACKEND}/history/${sessionId}`).then((res) => {
      const images = (res.data.messages || []).filter((m) => m.message_type === "image" && m.image_url);
      setFits(images);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="h-screen overflow-y-auto px-6 py-8" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />

      <button
        onClick={() => navigate(-1)}
        style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 16 }} /> {s.backLabel}
      </button>

      <h1 className="font-display" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8 }}>
        YourFits
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.6 }}>{s.yourFitsSubtitle}</p>

      {loading ? (
        <p style={{ fontSize: 13, color: "var(--text-dim)" }}>{s.thinking}</p>
      ) : fits.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>{s.yourFitsEmpty}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {fits.map((fit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ borderRadius: 14, overflow: "hidden", background: "var(--surface)", border: "1px solid var(--border-soft)" }}
            >
              <img src={fit.image_url} alt="Fit" style={{ width: "100%", display: "block", aspectRatio: "1", objectFit: "cover" }} />
              <div style={{ padding: 10, fontSize: 11, color: "var(--text-dim)" }}>
                {new Date(fit.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
