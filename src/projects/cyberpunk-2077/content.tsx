"use client";

import React from "react";
import { useScroll } from "framer-motion";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";

export default function CyberpunkContent() {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  const cyberpunkColors: [HSLColor, HSLColor][] = [
    [
      { h: 300, s: 80, l: 25 },
      { h: 200, s: 60, l: 15 },
    ],
    [
      { h: 200, s: 70, l: 20 },
      { h: 300, s: 90, l: 30 },
    ],
  ];

  return (
    <div className="relative min-h-screen">
      <ClientOnly>
        <div className="sticky inset-0">
          <AnimatedBackground
            scrollYProgress={scrollYProgress}
            colorPairs={cyberpunkColors}
          />
          <NoiseOverlay opacity={0.06} resolution={1} />
        </div>
      </ClientOnly>

      <div className="relative z-10 min-h-screen">
        {/* Custom Hero Section */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <h1 className="text-7xl md:text-9xl font-bold mb-8 text-cyan-400 leading-tight tracking-tight">
              CYBERPUNK
            </h1>
            <div className="text-2xl md:text-4xl text-pink-400 mb-12 font-mono">
              2077
            </div>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {["RPG", "Cyberpunk", "Open World"].map((tag) => (
                <span
                  key={tag}
                  className="px-6 py-3 bg-black/50 text-cyan-300 rounded-full text-lg backdrop-blur-sm border border-cyan-500/30 font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Content Section */}
        <div className="bg-black/90 backdrop-blur-sm py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-cyan-300 font-mono space-y-8">
                <h2 className="text-4xl font-bold text-pink-400 mb-8">
                  Welcome to Night City, Choom
                </h2>

                <p className="text-xl leading-relaxed text-cyan-200">
                  In the neon-lit streets of Night City, where chrome meets
                  flesh and corporations rule with an iron fist, you&apos;ll
                  carve your own path through the most dangerous metropolis of
                  the 21st century.
                </p>

                <div className="bg-gradient-to-r from-pink-500/20 to-cyan-500/20 p-6 rounded-lg border border-pink-500/30">
                  <p className="text-lg text-cyan-100">
                    &ldquo;The future is now, old man. Time to wake up and smell
                    the cyberware.&rdquo;
                  </p>
                </div>

                <p className="text-xl text-cyan-200">
                  From the corporate towers of City Center to the lawless
                  Badlands, every choice you make shapes your destiny in this
                  unforgiving world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
