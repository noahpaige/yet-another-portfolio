"use client";

import React, { useRef, useEffect } from "react";
import { useScroll } from "framer-motion";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import { TopNavbar } from "@/components/shared/top-navbar";
import type { ArticleLayoutProps } from "./types";

export default function ArticleLayout({
  header,
  tags,
  colorPairs,
  children,
  currentPage,
}: ArticleLayoutProps) {
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
        <TopNavbar currentPage={currentPage} />
        {/* Header */}
        <div
          className="container mx-auto px-4 py-12 relative z-10"
          style={{ paddingTop: "calc(var(--navbar-height, 80px) + 3rem)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-zinc-100">
                {header}
              </h1>
              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-zinc-800/50 text-zinc-300 rounded-full text-sm backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <main className="">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
