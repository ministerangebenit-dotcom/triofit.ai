import { motion } from "framer-motion";

export default function LogoOrb({ size = 72, thinking = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <motion.img
        src="/logo.png"
        alt="TRIOFIT"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }}
        animate={thinking ? { rotate: 360 } : { scale: [1, 1.06, 1] }}
        transition={
          thinking
            ? { duration: 1.4, repeat: Infinity, ease: "linear" }
            : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(199,155,69,0.5)" }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
