"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TypewriterText } from "@/components/shared/typewriter-text";
import { StaggeredSlideText } from "@/components/shared/staggered-slide-text";
import { ChromaticAberrationText } from "@/components/shared/chomatic-aberration-text";
import { BasketballScatterText } from "@/components/shared/basketball-scatter-text";
import { SnowboarderScatterText } from "@/components/shared/snowboard-scatter-text";
import { SnowCoveredText } from "@/components/shared/snow-covered-text";

const phrases = [
  { text: "Powder Hound", animation: "snow-covered" },
  { text: "Powder Hound", animation: "snowboard-scatter" },

  { text: "Hoop Head", animation: "basketball-scatter" },
  { text: "Game Developer", animation: "chromatic-aberration" },
  { text: "Web Developer", animation: "typewriter" },
  { text: "Dog Lover", animation: "staggered-slide-up" },
];

export default function WelcomeSection() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const phrase = phrases[index];

  useEffect(() => {
    const hideTimeout: NodeJS.Timeout = setTimeout(() => setShow(false), 3000);
    const nextTimeout: NodeJS.Timeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
      setShow(true);
    }, 4000);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [index]);

  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="flex flex-col text-left">
        <motion.h2
          className="text-white text-lg sm:text-xl md:text-2xl tracking-tight mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hey, I’m
        </motion.h2>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] text-white font-ibm-plex-mono font-[100]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Noah Paige
        </motion.h1>

        <div className="mt-12 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] text-right">
          {phrase.animation === "typewriter" && (
            <TypewriterText text={phrase.text} show={show} />
          )}
          {phrase.animation === "staggered-slide-up" && (
            <StaggeredSlideText text={phrase.text} show={show} />
          )}
          {phrase.animation === "chromatic-aberration" && (
            <ChromaticAberrationText text={phrase.text} show={show} />
          )}
          {phrase.animation === "basketball-scatter" && (
            <BasketballScatterText text={phrase.text} show={show} />
          )}
          {phrase.animation === "snowboard-scatter" && (
            <SnowboarderScatterText text={phrase.text} show={show} />
          )}
          {phrase.animation === "snow-covered" && (
            <SnowCoveredText text={phrase.text} show={show} />
          )}
        </div>
      </div>
    </div>
  );
}
