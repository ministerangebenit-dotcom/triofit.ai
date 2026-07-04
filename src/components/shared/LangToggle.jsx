import { useState } from "react";
import { setLang } from "../../lib/i18n";

export default function LangToggle({ lang, onChange }) {
  function switchLang(l) {
    setLang(l);
    onChange(l);
  }

  return (
    <div style={{
      position: "fixed", top: 16, right: 60, zIndex: 50,
      display: "flex", background: "var(--surface-2)", borderRadius: 20,
      padding: 3, gap: 2, border: "1px solid var(--border-soft)",
    }}>
      <button
        onClick={() => switchLang("fr")}
        style={{
          padding: "5px 13px", borderRadius: 14, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.04em", border: "none", cursor: "pointer",
          background: lang === "fr" ? "var(--gold)" : "transparent",
          color: lang === "fr" ? "#0a0a0a" : "var(--text-dim)",
        }}
      >
        FR
      </button>
      <button
        onClick={() => switchLang("en")}
        style={{
          padding: "5px 13px", borderRadius: 14, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.04em", border: "none", cursor: "pointer",
          background: lang === "en" ? "var(--gold)" : "transparent",
          color: lang === "en" ? "#0a0a0a" : "var(--text-dim)",
        }}
      >
        EN
      </button>
    </div>
  );
}
