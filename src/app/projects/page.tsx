"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useScroll } from "framer-motion";
import { projects } from "@/generated/project-index";
import { getAllProjectMDXContent } from "@/generated/project-mdx-index";
import { type MDXContent } from "@/generated/project-mdx-index";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectFilter } from "@/components/projects/project-filter";
import { ProjectSearch } from "@/components/projects/project-search";
import { ProjectGrid } from "@/components/projects/project-grid";
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
  const [filteredProjects, setFilteredProjects] = useState<
    Array<{ id: string; content: MDXContent }>
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Override body overflow to enable scrolling on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflowY;
    document.body.style.overflowY = "auto";

    // Cleanup: restore original overflow when component unmounts
    return () => {
      document.body.style.overflowY = originalOverflow;
    };
  }, []);

  // Load all projects on mount
  useEffect(() => {
    const allProjects = getAllProjectMDXContent();
    setFilteredProjects(allProjects);
    setIsLoading(false);
  }, []);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  const handleFilterChange = useCallback(
    (filtered: Array<{ id: string; content: MDXContent }>) => {
      setFilteredProjects(filtered);
    },
    []
  );

  const handleSearchResults = useCallback(
    (results: Array<{ id: string; content: MDXContent }>) => {
      setFilteredProjects(results);
    },
    []
  );

  // Convert MDX content to project format for existing ProjectCard
  const filteredProjectCards = filteredProjects
    .map(({ id }) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return null;

      return <ProjectCard key={id} project={project} hideTags={false} />;
    })
    .filter(Boolean);

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
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Explore my portfolio of projects, filtered by technology,
                difficulty, and more.
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              {/* Search */}
              <div className="lg:w-1/3">
                <ProjectSearch onSearchResults={handleSearchResults} />
              </div>

              {/* View Toggle and Filter Toggle */}
              <div className="flex items-center gap-4 lg:ml-auto">
                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">View:</span>
                  <div className="flex bg-zinc-800/50 backdrop-blur-sm rounded-lg p-1 border border-zinc-700">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === "grid"
                          ? "bg-cyan-500 text-white"
                          : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-cyan-500 text-white"
                          : "text-zinc-400 hover:text-zinc-300"
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-sm bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg transition-colors border border-zinc-700 backdrop-blur-sm"
                >
                  {showFilters ? "Hide" : "Show"} Filters
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              {showFilters && (
                <div className="lg:w-1/4">
                  <div className="sticky top-4">
                    <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                        Filters
                      </h3>
                      <ProjectFilter onFilterChange={handleFilterChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Display */}
              <div className={`${showFilters ? "lg:w-3/4" : "w-full"}`}>
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-zinc-400">
                    Showing {filteredProjects.length} of {projects.length}{" "}
                    projects
                  </div>
                  {filteredProjects.length !== projects.length && (
                    <div className="text-sm text-zinc-500">
                      Filtered results
                    </div>
                  )}
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                  </div>
                )}

                {/* Projects Display */}
                {!isLoading && (
                  <>
                    {viewMode === "grid" ? (
                      // Grid View (using existing ProjectCard style)
                      <div className="grid grid-cols-1 gap-6">
                        {filteredProjectCards}
                      </div>
                    ) : (
                      // List View (using new ProjectGrid component)
                      <ProjectGrid projects={filteredProjects} />
                    )}
                  </>
                )}

                {/* Empty State */}
                {!isLoading && filteredProjects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-zinc-400 text-lg mb-2">
                      No projects found
                    </div>
                    <div className="text-zinc-500 text-sm">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
