"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  show: boolean;
}

export function TypewriterText({ text, show }: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");

  // Reset when text changes
  useEffect(() => {
    setDisplayed("");
  }, [text]);

  // Typing/Deleting logic driven by `show`
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (show) {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1));
        }, 60);
      }
    } else if (displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length - 1));
      }, 30);
    }

    return () => clearTimeout(timeout);
  }, [text, displayed, show]);

  return (
    <AnimatePresence mode="wait">
      {(displayed.length > 0 || show) && (
        <motion.div
          key={text}
          className="text-right text-xl sm:text-2xl md:text-3xl font-mono text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <span className="inline-block bg-zinc-800 px-2 py-1 rounded-md">
            {displayed}
            {show && displayed.length === text.length && (
              <span className="inline-block animate-[blink_1s_steps(1,start)_infinite]">
                |
              </span>
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
