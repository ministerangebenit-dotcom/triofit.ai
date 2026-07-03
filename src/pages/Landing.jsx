import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundGlow from "../components/landing/BackgroundGlow";

export default function Landing() {
  const navigate = useNavigate();

  // cleaner navigation handler
  const handleBegin = () => {
    navigate("/name");
  };

  return (
    <div
      className="relative h-screen overflow-hidden flex flex-col justify-center items-center px-8"
      style={{ background: "var(--bg)" }}
    >
      <BackgroundGlow />

      <div className="text-center z-10">
        {/* ORB */}
        <motion.div
          style={{
            position: "relative",
            width: 72,
            height: 72,
            margin: "0 auto",
          }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 35% 30%, #E9C275, #C79B45 55%, #8d6523)",
            }}
          />

          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(199,155,69,0.5)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* TITLE */}
        <motion.h1
          className="font-display"
          style={{
            marginTop: 32,
            fontSize: 44,
            color: "var(--text)",
            letterSpacing: "0.02em",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          How will you be seen?
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          style={{
            marginTop: 20,
            maxWidth: 420,
            fontSize: 16,
            color: "var(--text-dim)",
            lineHeight: 1.7,
            margin: "20px auto 0",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Know exactly how you'll be perceived before you walk into the room.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={handleBegin}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 40,
            padding: "15px 32px",
            borderRadius: 50,
            background:
              "linear-gradient(135deg, var(--gold-light), var(--gold))",
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
          Begin →
        </motion.button>
      </div>
    </div>
  );
}
