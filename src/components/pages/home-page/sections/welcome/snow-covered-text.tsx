"use client";

import ClientOnly from "@/components/client-only";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface SnowCoveredTextProps {
  text: string;
  show: boolean;
}

export function SnowCoveredText({ text, show }: SnowCoveredTextProps) {
  // Memoize snowflake positions/sizes for hydration safety
  const flakes = useMemo(() => {
    const arr = Array.from({ length: text.length * 2 }).map((_, i) => ({
      id: i,
      left: i * 0.8 + (Math.random() - 0.5) * 0.3, // small offset per char
      size: 0.3 + (Math.random() - 0.5) * 0.3,
      delay: Math.random() * 0.8, // stagger fall
      duration: 1.5 + Math.random() * 2,
    }));
    return arr;
  }, [text]);

  return (
    <ClientOnly>
      <div className="relative inline-block font-mono text-white text-xl sm:text-2xl md:text-3xl h-10 z-10">
        <AnimatePresence mode="wait">
          {show && (
            <motion.div
              key={text}
              className="relative z-10"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.007,
                    delayChildren: 0.01,
                  },
                },
              }}
            >
              {text.split("").map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block  py-1 rounded-md"
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        type: "spring",
                        stiffness: 900,
                        damping: 30,
                        delay: i * 0.05,
                      },
                    },
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Snowflakes */}
        <AnimatePresence>
          {show &&
            flakes.map((flake) => (
              <motion.span
                key={`flake-${flake.id}`}
                className="absolute text-white pointer-events-none z-100"
                style={{
                  left: `${flake.left}em`,
                  fontSize: `${flake.size}em`,
                }}
                initial={{ opacity: 0, y: -60 }}
                animate={{ opacity: 1, y: -10 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  delay: flake.delay,
                  duration: flake.duration,
                  ease: "easeOut",
                }}
              >
                ❄️
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </ClientOnly>
  );
}
