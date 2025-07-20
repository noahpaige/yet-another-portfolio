"use client";

import React, { useRef, useState, useMemo } from "react";
import { useScroll } from "framer-motion";
import { projects } from "@/generated/project-index";
import { getAllProjectMDXContent } from "@/generated/project-mdx-index";
import { type MDXContent } from "@/generated/project-mdx-index";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectFilter } from "@/components/projects/project-filter";
import { TopNavbar } from "@/components/shared/top-navbar";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";

// Types
interface FilteredProject {
  id: string;
  content: MDXContent;
}

// Color pairs for the animated background
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 145, s: 50, l: 20 },
    { h: 290, s: 35, l: 10 },
  ],

  [
    { h: 140, s: 20, l: 7 },
    { h: 145, s: 80, l: 15 },
  ],
];

export default function ProjectsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredProjects, setFilteredProjects] = useState<FilteredProject[]>(
    []
  );

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Get all projects with MDX content
  const allProjectsWithMDX = useMemo(() => {
    return getAllProjectMDXContent();
  }, []);

  // Initialize filtered projects with all projects
  React.useEffect(() => {
    setFilteredProjects(allProjectsWithMDX);
  }, [allProjectsWithMDX]);

  // Handle filter changes
  const handleFilterChange = React.useCallback(
    (filtered: Array<{ id: string; content: MDXContent }>) => {
      setFilteredProjects(filtered);

      // Trigger resize after a short delay to allow DOM updates
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    },
    []
  );

  return (
    <>
      {/* Top Navbar */}
      <TopNavbar currentPage="projects" />

      {/* Main Content */}
      <main
        ref={scrollContainerRef}
        className="relative z-0 h-screen overflow-y-scroll overflow-x-hidden bg-black text-zinc-200"
      >
        {/* Animated Background and Noise Overlay */}
        <ClientOnly>
          <div className="sticky inset-0">
            <AnimatedBackground
              scrollYProgress={scrollYProgress}
              colorPairs={colorPairs}
            />
            <NoiseOverlay opacity={0.04} resolution={1} />
          </div>
        </ClientOnly>

        <div className="pt-18">
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-bold text-zinc-100">
                Projects
              </h1>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar with Filters */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="sticky top-26">
                  <ProjectFilter onFilterChange={handleFilterChange} />
                </div>
              </div>

              {/* Projects Grid */}
              <div className="flex-1">
                {filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredProjects.map(({ id, content }) => {
                      const project = projects.find((p) => p.id === id);
                      if (!project) return null;

                      return (
                        <ProjectCard
                          key={id}
                          project={project}
                          hideTags={false}
                          showDetails={true}
                          mdxContent={content}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 text-lg">
                      No projects found matching your filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
