"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { TextLoop } from "@/components/ui/text-loop";
import { Magnetic } from "@/components/ui/magnetic";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.95 },
};

const WelcomeSection = React.memo(() => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => setShow(isInView), [isInView]);

  return (
    <div
      className="flex h-full w-full items-center justify-center px-6"
      ref={ref}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            key="welcome-content"
            className="flex flex-col text-left"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <motion.h2
              className="text-white text-[clamp(16px,3vw,48px)] tracking-tight mb-2 z-10"
              variants={itemVariants}
            >
              Hey, I&apos;m
            </motion.h2>
            <motion.div
              className="text-[clamp(56px,12vw,400px)] z-10 font-extrabold leading-[1.1] text-white font-ibm-plex-mono font-extralight cursor-default select-none flex gap-1/2"
              variants={itemVariants}
            >
              {"NOAH PAIGE".split("").map((char, index) =>
                char === " " ? (
                  <span
                    key={index}
                    style={{ display: "inline-block", width: "0.5em" }}
                  />
                ) : (
                  <Magnetic
                    key={index}
                    intensity={-0.4}
                    range={200}
                    actionArea={{ type: "global" }}
                    springOptions={{ stiffness: 500, damping: 50 }}
                  >
                    {char}
                  </Magnetic>
                )
              )}
            </motion.div>
            <motion.div
              className="mt-6 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] text-right text-[clamp(16px,3vw,48px)] tracking-tight"
              variants={itemVariants}
            >
              <TextLoop
                className="overflow-y-clip"
                interval={5}
                transition={{
                  type: "spring",
                  stiffness: 900,
                  damping: 80,
                  mass: 10,
                }}
                variants={{
                  initial: {
                    y: 20,
                    rotateX: 90,
                    opacity: 0,
                    filter: "blur(4px)",
                  },
                  animate: {
                    y: 0,
                    rotateX: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                  },
                  exit: {
                    y: -20,
                    rotateX: -90,
                    opacity: 0,
                    filter: "blur(4px)",
                  },
                }}
              >
                <span>Web Developer</span>
                <span>Game Developer</span>
                <span>Hoop Head</span>
                <span>Powder Hound</span>
                <span>Florida Man</span>
              </TextLoop>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
