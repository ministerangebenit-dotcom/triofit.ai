import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sb } from "../../lib/supabase";

const COPY = {
  fr: {
    analysisTitle: "Comment était votre analyse ?",
    outfitTitle: "Êtes-vous satisfait de la recommandation ?",
    skip: "Passer",
    submit: "Envoyer",
    thanks: "Merci !",
  },
  en: {
    analysisTitle: "How was your analysis?",
    outfitTitle: "How satisfied are you with the recommendation?",
    skip: "Skip",
    submit: "Submit",
    thanks: "Thank you!",
  },
};

export default function StarRatingModal({
  isOpen,
  onClose,
  type,          // "analysis" | "outfit"
  sessionId,
  userName,
  lang = "fr",
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const t = COPY[lang] || COPY.fr;

  async function submitRating(stars) {
    if (submitted) return;
    setRating(stars);
    setSubmitted(true);

    try {
      await supabase.from("ratings").insert({
        session_id: sessionId,
        user_name: userName || "unknown",
        rating_type: type,
        stars,
        language: lang,
      });
    } catch (err) {
      console.error("Failed to save rating:", err);
    }

    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      onClose?.();
    }, 1000);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {/* Blurred backdrop */}
          <div
            onClick={() => onClose?.()}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              background: "rgba(0,0,0,0.55)",
            }}
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              position: "relative",
              background: "var(--surface)",
              border: "1px solid var(--border-soft)",
              borderRadius: 18,
              padding: "28px 24px 22px",
              maxWidth: 340,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{ padding: "20px 0" }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gold)" }}>
                  {t.thanks}
                </div>
              </motion.div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 20,
                    lineHeight: 1.4,
                  }}
                >
                  {type === "analysis" ? t.analysisTitle : t.outfitTitle}
                </div>

                {/* Stars */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 32,
                        color:
                          star <= (hovered || rating)
                            ? "var(--gold)"
                            : "var(--text-dim)",
                        transition: "color 0.15s",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onClose?.()}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 20,
                    padding: "8px 20px",
                    color: "var(--text-dim)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t.skip}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
