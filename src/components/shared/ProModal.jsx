import { motion, AnimatePresence } from "framer-motion";

export default function ProModal({ open, onClose }) {
  const whatsappUrl = "https://wa.me/237696496294?text=" + encodeURIComponent("Hi, I'd like to subscribe to TRIOFIT Pro.");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)", borderRadius: 24, padding: 28, maxWidth: 380, width: "100%",
              border: "1px solid var(--border-soft)", position: "relative",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 16, right: 16, background: "transparent", border: "none",
                color: "var(--text-dim)", fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
              TRIOFIT PRO
            </div>
            <h2 className="font-display" style={{ fontSize: 24, color: "var(--text)", marginBottom: 16 }}>
              Manage your image, don't guess at it.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                "Unlimited perception analyses, every day",
                "Verified outfit recommendations from a real stylist",
                "Priority styling — faster turnaround",
                "Full conversation history, saved",
              ].map((feature) => (
                <div key={feature} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <i className="ti ti-check" style={{ color: "var(--gold)", fontSize: 16, marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{feature}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 16, marginBottom: 20, textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 28, color: "var(--gold)" }}>2,000 FCFA</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>per month</div>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16, lineHeight: 1.6, textAlign: "center" }}>
              Message us on WhatsApp to subscribe — we'll set up your Pro access right away.
            </p>

            
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "14px 20px", borderRadius: 50, background: "#25D366", color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}
            >
              <i className="ti ti-brand-whatsapp" style={{ fontSize: 18 }} />
              Message us on WhatsApp
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
