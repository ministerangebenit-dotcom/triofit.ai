import { motion } from "framer-motion";

export default function BackgroundGlow() {
  return (
    <>
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 bg-[#C79B45]"
        style={{
          top: -120,
          right: -120
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity
        }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full blur-[120px] opacity-10 bg-[#8d6523]"
        style={{
          bottom: -80,
          left: -80
        }}
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity
        }}
      />
    </>
  );
}
