"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { Magnetic } from "@/components/ui/magnetic";
import { Project } from "@/generated/project-index";
import { useClampCSS } from "@/hooks/useClampCSS";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = React.memo(({ project }: ProjectCardProps) => {
  // Create a ref for the Link element
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Generate responsive font size based on container height
  // Using the same breakpoints as the container: 24, 32, 40, 48, 64, 80 (in rem, converted to px)
  const titleFontSize = useClampCSS(
    16, // min font size (1rem)
    32, // max font size (2rem)
    96, // min screen height (24 * 4px = 96px)
    320, // max screen height (80 * 4px = 320px)
    375, // min screen width
    1280 // max screen width
  );

  // Generate dynamic height based on screen height only
  // Converting the height classes to pixel values: h-32(128px), h-44(176px), h-48(192px), h-56(224px), h-64(256px), h-80(320px)
  const cardHeight = useClampCSS(
    64, // min height (h-32 = 128px)
    320, // max height (h-80 = 320px)
    500, // min screen height where scaling starts
    1200, // max screen height where scaling stops
    0, // min screen width (ignored)
    0 // max screen width (ignored)
  );

  return (
    <Magnetic
      intensity={0.1}
      actionArea={{ type: "self" }}
      range={400}
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      {/* Attach the ref to the Link */}
      <Link href={`/projects/${project.id}`} ref={linkRef}>
        <div className="group relative overflow-hidden rounded-xl glass-layer-hoverable transition-all duration-300">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{ height: cardHeight }}
          >
            {/* Use the Link as the action area for inner Magnetics */}
            <Magnetic
              intensity={0.2}
              range={1000}
              actionArea={{
                type: "ref",
                ref: linkRef as React.RefObject<HTMLElement>,
              }}
              springOptions={{ stiffness: 300, damping: 30 }}
            >
              <div className="w-full scale-115" style={{ height: cardHeight }}>
                {/* Project Image */}
                <img
                  src={project.image}
                  alt={project.imageAltText}
                  className="w-full object-cover rounded-lg"
                  style={{ height: cardHeight }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>
            </Magnetic>
            <div className="px-2 py-1 sm:px-3 sm:py-[calc(1.5*var(--spacing))] md:px-6 md:py-3 absolute bottom-0 left-0">
              <Magnetic
                intensity={0.1}
                range={1000}
                actionArea={{
                  type: "ref",
                  ref: linkRef as React.RefObject<HTMLElement>,
                }}
                springOptions={{ stiffness: 300, damping: 30 }}
              >
                <h3
                  className="font-space-mono font-bold text-zinc-100 transition-colors"
                  style={{ fontSize: titleFontSize }}
                >
                  {project.title}
                </h3>
              </Magnetic>

              {/* Tags */}
              <div className="hidden md:flex flex-wrap gap-2 mt-1">
                {project.tags.map((tag, index) => (
                  <Magnetic
                    key={tag}
                    intensity={0.1}
                    range={1000}
                    actionArea={{
                      type: "ref",
                      ref: linkRef as React.RefObject<HTMLElement>,
                    }}
                    springOptions={{ stiffness: 300, damping: 30 }}
                  >
                    <span
                      className="px-2 py-1 text-zinc-300 text-xs rounded-full glass-layer"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationDuration: "2s",
                      }}
                    >
                      {tag}
                    </span>
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Magnetic>
  );
});

ProjectCard.displayName = "ProjectCard";
