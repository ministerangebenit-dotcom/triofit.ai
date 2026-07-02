import { motion } from "framer-motion";

export default function ChatBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", inset: 0,
          background:
            "radial-gradient(circle at 15% 0%, rgba(199,155,69,0.05), transparent 45%), radial-gradient(circle at 85% 100%, rgba(199,155,69,0.04), transparent 40%)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <defs>
          <pattern id="grain" width="140" height="140" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="0.6" fill="var(--muted)" opacity="0.25" />
            <circle cx="90" cy="60" r="0.5" fill="var(--muted)" opacity="0.2" />
            <circle cx="50" cy="110" r="0.6" fill="var(--muted)" opacity="0.22" />
            <circle cx="120" cy="30" r="0.4" fill="var(--muted)" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grain)" />
      </svg>
      <motion.div
        style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: "var(--gold)", opacity: 0.03, filter: "blur(90px)", top: "10%", left: "-10%",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute", width: 260, height: 260, borderRadius: "50%",
          background: "var(--gold-light)", opacity: 0.025, filter: "blur(90px)", bottom: "5%", right: "-8%",
        }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
