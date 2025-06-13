// components/shared/flip-wave-text.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FlipWaveTextProps {
  text: string;
  show: boolean;
}

export function FlipWaveText({ text, show }: FlipWaveTextProps) {
  const [waveProgress, setWaveProgress] = useState(0);

  useEffect(() => {
    if (show) {
      setWaveProgress(0);
      const interval = setInterval(() => {
        setWaveProgress((prev) => (prev < text.length ? prev + 1 : prev));
      }, 80);
      return () => clearInterval(interval);
    } else {
      setWaveProgress(0);
    }
  }, [show, text]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={text}
          className="font-doto inline-block text-xl sm:text-2xl md:text-3xl font-semibold"
          style={{ perspective: "1000px" }}
        >
          <motion.span
            initial={{ translateZ: 100, rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-block transform-gpu"
            style={{
              display: "inline-block",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {text.split("").map((char, i) => {
              const color =
                i === waveProgress
                  ? "text-red-400"
                  : i === waveProgress - 1
                  ? "text-green-400"
                  : i === waveProgress - 2
                  ? "text-blue-400"
                  : "text-white";

              return (
                <span key={i} className={`${color} inline-block`}>
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
