"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BasketballScatterTextProps {
  text: string;
  show: boolean;
}

export function BasketballScatterText({
  text,
  show,
}: BasketballScatterTextProps) {
  const [impactedIndices, setImpactedIndices] = useState<number[]>([]);

  useEffect(() => {
    if (show) {
      setImpactedIndices([]); // reset
      const timeouts: NodeJS.Timeout[] = [];

      const startDelay = 1950;

      // trigger each letter's impact individually
      for (let i = 0; i < text.length; i++) {
        timeouts.push(
          setTimeout(() => {
            setImpactedIndices((prev) => [...prev, i]);
          }, startDelay + i * 20) // stagger impact
        );
      }

      return () => timeouts.forEach(clearTimeout);
    } else {
      setImpactedIndices([]);
    }
  }, [show, text]);

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
                  staggerChildren: 0.01,
                  delayChildren: 0.0,
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
                  impactedIndices.includes(i)
                    ? {
                        x: 100 + (Math.random() - 0.5) * 30,
                        y: 40 + (Math.random() - 0.5) * 30,
                        rotate: (Math.random() - 0.5) * 360,
                        opacity: 0,
                        transition: { duration: 0.6 },
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
            key="ball"
            initial={{ x: -100, y: -40, rotate: -90, opacity: 0 }}
            animate={{
              x: text.length * 10,
              y: 0,
              rotate: 0,
              opacity: 1,
              transition: {
                type: "spring",
                bounce: 0.4,
                delay: 1.9,
                duration: 0.8,
              },
            }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-0 text-2xl"
          >
            🏀
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
