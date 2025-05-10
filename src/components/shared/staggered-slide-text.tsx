"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StaggeredSlideTextProps {
  text: string;
  show: boolean;
}

const letterVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -10, opacity: 0 },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export function StaggeredSlideText({ text, show }: StaggeredSlideTextProps) {
  return (
    <div className=" text-right text-xl sm:text-2xl md:text-3xl text-white">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={text}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="inline-flex overflow-hidden"
          >
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
