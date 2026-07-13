import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import LangToggle from "../components/shared/LangToggle";
import { useLang, t } from "../lib/i18n";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

export default function RegisterStore() {
  const navigate = useNavigate();
  const [lang, setLangState] = useState(useLang());
  const s = t(lang);
  const [form, setForm] = useState({ business_name: "", business_type: "", contact: "", city: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    if (!form.business_name.trim() || !form.contact.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND}/store-interest`, form);
      setSubmitted(true);
    } catch {
      setSubmitting(false);
      alert(s.connectionIssue);
    }
  }

  if (submitted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-8 text-center" style={{ background: "var(--bg)" }}>
        <LangToggle lang={lang} onChange={setLangState} />
        <i className="ti ti-circle-check" style={{ fontSize: 48, color: "var(--gold)", marginBottom: 16 }} />
        <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.7, maxWidth: 340 }}>{s.storeSubmitted}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: 24, padding: "12px 24px", borderRadius: 50, background: "var(--gold)", border: "none", color: "#080808", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {s.backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto px-6 py-8" style={{ background: "var(--bg)" }}>
      <LangToggle lang={lang} onChange={setLangState} />

      <button
        onClick={() => navigate(-1)}
        style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 16 }} /> {s.backLabel}
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1 className="font-display" style={{ fontSize: 24, color: "var(--text)", marginBottom: 8 }}>
          {s.storeTitle}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 24, lineHeight: 1.6 }}>{s.storeSubtitle}</p>

        <input
          placeholder={s.storeNamePlaceholder}
          value={form.business_name}
          onChange={(e) => update("business_name", e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder={s.storeTypePlaceholder}
          value={form.business_type}
          onChange={(e) => update("business_type", e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder={s.storeCityPlaceholder}
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder={s.storeContactPlaceholder}
          value={form.contact}
          onChange={(e) => update("contact", e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        <button
          onClick={submit}
          disabled={submitting || !form.business_name.trim() || !form.contact.trim()}
          style={{
            width: "100%", padding: "14px 24px", borderRadius: 50,
            background: submitting ? "var(--surface-2)" : "var(--gold)",
            border: "none", color: submitting ? "var(--text-dim)" : "#080808",
            fontWeight: 700, fontSize: 14, cursor: submitting ? "default" : "pointer",
          }}
        >
          {s.storeSubmitButton}
        </button>
      </motion.div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 18px", background: "var(--surface-2)",
  border: "1.5px solid var(--border-soft)", borderRadius: 12,
  color: "var(--text)", fontSize: 15, outline: "none", marginBottom: 12,
};
