import { motion } from "framer-motion";

export function FanSpinner({ size = 40, speed = 1.1 }) {
  const blades = [0, 60, 120, 180, 240, 300];
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      animate={{ rotate: 360 }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {blades.map((angle, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="11"
          rx="4.2"
          ry="8"
          fill="var(--gold)"
          opacity={0.3 + (i / blades.length) * 0.6}
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="3" fill="var(--gold-light)" />
    </motion.svg>
  );
}

export function BoomerangSpinner({ size = 28 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
    >
      <path
        d="M14 3 C 8 3, 4 8, 4 14 C 4 18, 7 21, 10 22 L 8 17 M10 22 L 14 19"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 25 C 20 25, 24 20, 24 14 C 24 10, 21 7, 18 6 L 20 11 M18 6 L 14 9"
        fill="none"
        stroke="var(--gold-light)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}
