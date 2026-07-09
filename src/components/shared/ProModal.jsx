import { motion, AnimatePresence } from "framer-motion";

const COPY = {
  fr: {
    badge: "TRIOFIT PRO",
    title: "Gérez votre image, ne la devinez pas.",
    features: [
      "Analyses de perception illimitées, chaque jour",
      "Recommandations vérifiées par un vrai styliste",
      "Styling prioritaire — délai plus court",
      "Historique de conversation complet sauvegardé",
    ],
    price: "2 000 FCFA",
    period: "par mois",
    cta: "Discuter sur WhatsApp",
    description: "Écrivez‑nous sur WhatsApp pour vous abonner — nous activerons votre accès Pro immédiatement.",
    whatsappMessage: "Bonjour, je souhaite m'abonner à TRIOFIT Pro.",
  },
  en: {
    badge: "TRIOFIT PRO",
    title: "Manage your image, don't guess at it.",
    features: [
      "Unlimited perception analyses, every day",
      "Verified outfit recommendations from a real stylist",
      "Priority styling — faster turnaround",
      "Full conversation history, saved",
    ],
    price: "$3.50",
    period: "per month",
    cta: "Message us on WhatsApp",
    description: "Message us on WhatsApp to subscribe — we'll set up your Pro access right away.",
    whatsappMessage: "Hi, I'd like to subscribe to TRIOFIT Pro.",
  },
};

export default function ProModal({ open, onClose, lang = "fr" }) {
  const t = COPY[lang] || COPY.fr;
  const whatsappUrl =
    "https://wa.me/237696496294?text=" +
    encodeURIComponent(t.whatsappMessage);

  return (
    <AnimatePresence>
      {open && (
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
            padding: 20,
          }}
        >
          {/* Blurred backdrop */}
          <div
            onClick={onClose}
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
              borderRadius: 24,
              padding: 28,
              maxWidth: 380,
              width: "100%",
              border: "1px solid var(--border-soft)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "var(--text-dim)",
                fontSize: 20,
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Badge */}
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              {t.badge}
            </div>

            {/* Title */}
            <h2
              className="font-display"
              style={{ fontSize: 24, color: "var(--text)", marginBottom: 16 }}
            >
              {t.title}
            </h2>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {t.features.map((feature, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i
                    className="ti ti-check"
                    style={{
                      color: "var(--gold)",
                      fontSize: 16,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div
              style={{
                background: "var(--surface-2)",
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: 28, color: "var(--gold)" }}
              >
                {t.price}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                {t.period}
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 13,
                color: "var(--text-dim)",
                marginBottom: 16,
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              {t.description}
            </p>

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 20px",
                borderRadius: 50,
                background: "#25D366",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} />
              {t.cta}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
