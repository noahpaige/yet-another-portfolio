"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ChromaticAberrationTextProps {
  text: string;
  show: boolean;
}

export function ChromaticAberrationText({
  text,
  show,
}: ChromaticAberrationTextProps) {
  const letters = text.split("");

  return (
    <div className="relative inline-block font-bold text-xl sm:text-2xl md:text-3xl font-doto text-white">
      <AnimatePresence>
        {show &&
          letters.map((char, i) => (
            <span key={i} className="relative inline-block w-[1ch]">
              <motion.span
                initial={{ y: -10, opacity: 0, color: "#f00" }}
                animate={{
                  y: 0,
                  opacity: 1,
                  color: "#fff",
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                    delay: i * 0.03,
                  },
                }}
                exit={{
                  y: 10,
                  opacity: 0,
                  color: "#00f",
                  transition: {
                    type: "spring",
                    stiffness: 40,
                    damping: 10,
                    duration: 0.2,
                    delay: i * 0.02,
                  },
                }}
                className="absolute left-0"
              >
                {char}
              </motion.span>
            </span>
          ))}
      </AnimatePresence>
    </div>
  );
}
