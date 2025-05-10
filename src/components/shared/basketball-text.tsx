"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BasketballTextProps {
  text: string;
  show: boolean;
}

export function BasketballText({ text, show }: BasketballTextProps) {
  const [showBall, setShowBall] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="basketball-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onAnimationComplete={() => setShowBall(true)}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-right text-white"
        >
          <span>{text}</span>
          {showBall && (
            <motion.span
              key="basketball"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
                delay: 0.1,
              }}
              className="inline-block ml-2"
            >
              🏀
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
