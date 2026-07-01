import { motion } from "framer-motion";

export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="px-6 mt-3">

      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Understanding You</span>
        <span>{progress}%</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">

        <motion.div
          className="h-full bg-[#C79B45]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
        />

      </div>

    </div>
  );
}
