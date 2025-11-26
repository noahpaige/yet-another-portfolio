"use client";

import React, { useRef } from "react";
import { useScroll } from "motion/react";
import { BlobsBg, type HSLColor } from "@noahpaige/react-blobs-bg";
import { useAnimatedBackground } from "@/hooks/use-animated-background";
import NoiseOverlay from "@/components/noise-overlay";
import { MagneticButton } from "@/components/ui/magnetic-button";
import ClientOnly from "@/components/client-only";
import { TopNavbar } from "@/components/shared/top-navbar";

// Color pairs for the animated background
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 345, s: 70, l: 20 },
    { h: 205, s: 50, l: 15 },
  ],
];

export default function NotFound() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  const animatedBackgroundProps = useAnimatedBackground({
    scrollYProgress,
    colorPairs,
  });

  return (
    <>
      <TopNavbar />
      <main
        ref={scrollContainerRef}
        className="relative z-0 h-screen overflow-y-scroll overflow-x-hidden scroll-smooth bg-black text-zinc-200"
      >
        {/* Animated Background and Noise Overlay */}
        <ClientOnly>
          <div className="sticky inset-0">
            <BlobsBg {...animatedBackgroundProps} />
          </div>
          <div className="z-0 h-full w-full absolute">
            <NoiseOverlay
              opacity={0.03}
              resolution={1}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        </ClientOnly>

        {/* Content */}
        <div
          className="min-h-screen flex items-center justify-center relative z-10"
          style={{ paddingTop: "var(--navbar-height, 80px)" }}
        >
          <div className="text-center">
            <h1 className="text-9xl font-bold text-zinc-100 pb-4">404</h1>
            <p className="text-zinc-400 text-3xl mb-30">Page not found</p>
            <MagneticButton href="/" className="px-6 py-3">
              Go back home
            </MagneticButton>
          </div>
        </div>
      </main>
    </>
  );
}
