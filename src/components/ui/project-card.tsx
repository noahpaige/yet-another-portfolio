"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Magnetic } from "@/components/ui/magnetic";
import { Article } from "@/generated/article-index";
import { type MDXContent } from "@/generated/article-mdx-index";
import { useClampCSS } from "@/hooks/useClampCSS";

interface ProjectCardProps {
  project: Article;
  hideTags?: boolean;
  showDetails?: boolean;
  mdxContent?: MDXContent | null;
}

export const ProjectCard = React.memo(
  ({
    project,
    hideTags = true,
    showDetails = false,
    mdxContent,
  }: ProjectCardProps) => {
    // Helper function to safely get metadata values
    const getMetadataValue = (
      key: string,
      type: "string" | "number"
    ): string | number | null => {
      if (!mdxContent?.metadata) return null;
      const value = mdxContent.metadata[key];
      if (type === "string" && typeof value === "string") return value;
      if (type === "number" && typeof value === "number") return value;
      return null;
    };

    const readTime = getMetadataValue("readTime", "number");
    const description = getMetadataValue("description", "string");
    // Create a ref for the Link element
    const linkRef = useRef<HTMLAnchorElement>(null);

    // Generate responsive font size based on container height
    const titleFontSize = useClampCSS(
      24, // min font size (1rem)
      32, // max font size (2rem)
      96, // min screen height (24 * 4px = 96px)
      320, // max screen height (80 * 4px = 320px)
      375, // min screen width
      1280 // max screen width
    );

    // Generate dynamic height based on screen height only
    const cardHeight = useClampCSS(
      60, // min height
      320, // max height
      500, // min screen height where scaling starts
      1400, // max screen height where scaling stops
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
          <div className="group relative overflow-hidden rounded-xl glass-layer-hoverable transition-all duration-300 p-1.5">
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
                <div
                  className="w-full scale-115"
                  style={{ height: cardHeight }}
                >
                  {/* Project Image */}
                  <div
                    className="relative w-full rounded-lg"
                    style={{ height: cardHeight }}
                  >
                    <Image
                      src={project.image || "/default-project-image.png"}
                      alt={project.imageAltText || ""}
                      fill
                      className="object-cover rounded-lg"
                      onError={() => {
                        const fallback = document.querySelector(
                          ".image-fallback"
                        ) as HTMLElement;
                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      className="image-fallback hidden w-full h-full items-center justify-center bg-gray-800 text-slate-400 text-sm rounded-lg text-center"
                      style={{ height: cardHeight }}
                    >
                      {project.imageAltText || "Project image"}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>
              </Magnetic>
              <div className="p-2 sm:p-3 md:p-6 absolute bottom-0 left-0">
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

                {/* Details Section */}
                {showDetails && mdxContent && (
                  <div className="mt-3 space-y-2">
                    {/* Read Time */}
                    {readTime && (
                      <Magnetic
                        intensity={0.05}
                        range={1000}
                        actionArea={{
                          type: "ref",
                          ref: linkRef as React.RefObject<HTMLElement>,
                        }}
                        springOptions={{ stiffness: 300, damping: 30 }}
                      >
                        <div className="flex items-center gap-1 text-zinc-400 text-xs">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {readTime} min read
                        </div>
                      </Magnetic>
                    )}

                    {/* Description Preview */}
                    {description && (
                      <Magnetic
                        intensity={0.05}
                        range={1000}
                        actionArea={{
                          type: "ref",
                          ref: linkRef as React.RefObject<HTMLElement>,
                        }}
                        springOptions={{ stiffness: 300, damping: 30 }}
                      >
                        <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">
                          {description}
                        </p>
                      </Magnetic>
                    )}
                  </div>
                )}
                {/* Tags */}
                <div
                  className={`${
                    hideTags ? "hidden md:flex" : "flex"
                  } flex-wrap gap-2 mt-1`}
                >
                  {project.tags?.map((tag, index) => (
                    <Magnetic
                      key={tag}
                      intensity={0.05}
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
                          animationDelay: `${index * 200}ms`,
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
  }
);

ProjectCard.displayName = "ProjectCard";
