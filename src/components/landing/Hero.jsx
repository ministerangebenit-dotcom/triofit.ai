import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-center z-10">

      <motion.img

        src="/logo.png"

        className="
        w-24
        h-24
        rounded-3xl
        mx-auto
        shadow-2xl
        "

        initial={{
          opacity:0,
          scale:.7
        }}

        animate={{
          opacity:1,
          scale:1
        }}

        transition={{
          duration:.8
        }}

      />

      <motion.h1

        className="
        mt-10
        text-6xl
        font-display
        tracking-[.25em]
        "

        initial={{
          opacity:0,
          y:25
        }}

        animate={{
          opacity:1,
          y:0
        }}

        transition={{
          delay:.2
        }}

      >

        TRIOFIT

      </motion.h1>

      <motion.p

        className="
        mt-8
        max-w-xl
        text-xl
        text-gray-300
        leading-9
        mx-auto
        "

        initial={{
          opacity:0
        }}

        animate={{
          opacity:1
        }}

        transition={{
          delay:.45
        }}

      >

        With me on your team, you'll always 
        make te right impression.
        
      </motion.p>

    </div>
  );
}
