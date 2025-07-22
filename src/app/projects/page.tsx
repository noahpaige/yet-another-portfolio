"use client";

import React, { useRef, useState, useMemo } from "react";
import { useScroll } from "framer-motion";
import { projectArticles } from "@/generated/article-index";
import { getArticleTypeMDXContent } from "@/generated/article-mdx-index";
import { type MDXContent } from "@/generated/article-mdx-index";
import { ArticleCard } from "@/components/ui/article-card";
import { ArticleFilter } from "@/components/projects/article-filter";
import { TopNavbar } from "@/components/shared/top-navbar";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Types
interface FilteredProject {
  id: string;
  content: MDXContent;
}

// Color pairs for the animated background
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 15, s: 50, l: 20 },
    { h: 200, s: 35, l: 10 },
  ],
  [
    { h: 45, s: 35, l: 20 },
    { h: 260, s: 50, l: 10 },
  ],
];

export default function ProjectsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredProjects, setFilteredProjects] = useState<FilteredProject[]>(
    []
  );

  // Check if screen is medium size or larger
  const isSmallScreen = useMediaQuery("(min-width: 640px)");

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Get all projects with MDX content
  const allProjectsWithMDX = useMemo(() => {
    return getArticleTypeMDXContent("project");
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
        className="relative z-0 h-screen overflow-y-scroll overflow-x-hidden scroll-smooth bg-black text-zinc-200"
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

        <div
          className="container mx-auto px-4 py-8 relative z-10"
          style={{ paddingTop: "var(--navbar-height, 80px)" }}
        >
          {/* Page Header */}
          <div className="text-center my-8">
            <h1 className="text-5xl md:text-6xl font-bold text-zinc-100">
              Projects
            </h1>
          </div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-26">
                <ArticleFilter
                  onFilterChange={handleFilterChange}
                  articleType="project"
                />
              </div>
            </div>

            {/* Projects Grid */}
            <div className="flex-1">
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredProjects.map(({ id, content }) => {
                    const project = projectArticles.find((p) => p.id === id);
                    if (!project) return null;

                    return (
                      <ArticleCard
                        key={id}
                        article={project}
                        hideTags={false}
                        showReadTime={false}
                        showDesc={isSmallScreen}
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
      </main>
    </>
  );
}
