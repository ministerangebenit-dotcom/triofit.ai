import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex gap-1 px-4 py-3 bg-white/10 rounded-2xl w-fit">

      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white/50 rounded-full"
          animate={{
            y: [0, -4, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15
          }}
        />
      ))}

    </div>
  );
}
