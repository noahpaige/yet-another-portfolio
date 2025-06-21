"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SnowboarderScatterTextProps {
  text: string;
  show: boolean;
}

export function SnowboarderScatterText({
  text,
  show,
}: SnowboarderScatterTextProps) {
  const [impact, setImpact] = useState(false);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setImpact(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setImpact(false);
    }
  }, [show]);

  return (
    <div className="relative inline-block text-white font-bold text-xl sm:text-2xl md:text-3xl font-mono h-10">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key="text"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                },
              },
            }}
            className="inline-block"
          >
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { y: 50, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                animate={
                  impact
                    ? {
                        x: [0, 100 + i * 4],
                        y: [0, -20 + Math.random() * -10],
                        rotate: [0, (Math.random() - 0.5) * 180],
                        opacity: [1, 0],
                        transition: {
                          delay: i * 0.03,
                          duration: 0.5,
                        },
                      }
                    : undefined
                }
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {show && (
          <motion.span
            key="snowboarder"
            initial={{ x: -80, y: -20, rotate: -30, opacity: 0 }}
            animate={{
              x: text.length * 10 + 40,
              y: 0,
              rotate: 0,
              opacity: 1,
              transition: {
                type: "spring",
                bounce: 0.3,
                delay: 1.9,
                duration: 1,
              },
            }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 text-2xl"
          >
            🏂
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
