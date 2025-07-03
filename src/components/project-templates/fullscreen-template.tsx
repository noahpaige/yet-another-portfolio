"use client";

import React, { useRef, useEffect } from "react";
import { useScroll } from "framer-motion";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { ProjectTemplateProps } from "./types";

export default function FullscreenTemplate({
  header,
  tags,
  colorPairs,
  children,
}: ProjectTemplateProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Override body overflow to enable scrolling on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflowY;
    document.body.style.overflowY = "auto";

    // Cleanup: restore original overflow when component unmounts
    return () => {
      document.body.style.overflowY = originalOverflow;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  return (
    <div>
      <ClientOnly>
        <div className="sticky inset-0">
          <AnimatedBackground
            scrollYProgress={scrollYProgress}
            colorPairs={colorPairs}
          />
          <NoiseOverlay
            opacity={0.04}
            resolution={1}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </ClientOnly>
      <div
        ref={scrollContainerRef}
        className="min-h-screen bg-black overflow-x-hidden"
      >
        {/* Hero Section */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-zinc-100 leading-tight">
              {header}
            </h1>
            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-zinc-800/50 text-zinc-300 rounded-full text-lg backdrop-blur-sm border border-zinc-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 bg-black/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-invert prose-lg max-w-none">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
