"use client";

import React from "react";
import { motion } from "framer-motion";
import { TextLoop } from "@/components/ui/text-loop";
import { Magnetic } from "@/components/ui/magnetic";

const WelcomeSection = React.memo(() => {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div className="flex flex-col text-left">
        <motion.h2
          className="text-white text-[clamp(16px,3vw,48px)] tracking-tight mb-2"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.2 }}
        >
          Hey, I&apos;m
        </motion.h2>
        <motion.div
          className="text-[clamp(48px,12vw,400px)] font-extrabold leading-[1.1] text-white font-ibm-plex-mono font-extralight cursor-default select-none flex gap-1/2"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.3, delay: 0.2 }}
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
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.4 }}
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
      </div>
    </div>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
