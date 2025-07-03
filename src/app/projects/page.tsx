"use client";

import React, { useRef, useEffect } from "react";
import { useScroll } from "framer-motion";
import { projects } from "@/generated/project-index";
import { ProjectCard } from "@/components/ui/project-card";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";

const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 145, s: 50, l: 30 },
    { h: 290, s: 35, l: 10 },
  ],
  [
    { h: 245, s: 30, l: 9 },
    { h: 145, s: 60, l: 27 },
  ],
  [
    { h: 145, s: 70, l: 23 },
    { h: 195, s: 25, l: 8 },
  ],
  [
    { h: 140, s: 20, l: 7 },
    { h: 145, s: 80, l: 20 },
  ],
];

export default function ProjectsPage() {
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
        {/* Header */}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-zinc-100">
                Projects
              </h1>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  hideTags={false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
