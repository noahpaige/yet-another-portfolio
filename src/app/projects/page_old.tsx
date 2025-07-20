"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useScroll } from "framer-motion";
import Head from "next/head";
import { projects } from "@/generated/project-index";
import { getAllProjectMDXContent } from "@/generated/project-mdx-index";
import { type MDXContent } from "@/generated/project-mdx-index";
import { ProjectCard } from "@/components/ui/project-card";
import { ProjectFilter } from "@/components/projects/project-filter";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";

// Types
interface FilteredProject {
  id: string;
  content: MDXContent;
}

// Constants
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

const META_DESCRIPTION =
  "Explore my portfolio of projects, from game development to research and creative work.";

export default function ProjectsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredProjects, setFilteredProjects] = useState<FilteredProject[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override body overflow to enable scrolling on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflowY;
    document.body.style.overflowY = "auto";

    // Cleanup: restore original overflow when component unmounts
    return () => {
      document.body.style.overflowY = originalOverflow;
    };
  }, []);

  // Load all projects on mount with error handling
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const allProjects = getAllProjectMDXContent();
        setFilteredProjects(allProjects);
        setError(null);
      } catch (err) {
        setError("Failed to load projects. Please try refreshing the page.");
        console.error("Error loading projects:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  const handleFilterChange = useCallback((filtered: FilteredProject[]) => {
    setFilteredProjects(filtered);
  }, []);

  // Memoize project cards to prevent unnecessary re-renders
  const filteredProjectCards = useMemo(() => {
    return filteredProjects
      .map(({ id, content }) => {
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
      })
      .filter(Boolean);
  }, [filteredProjects]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center" role="alert" aria-live="polite">
          <div className="text-zinc-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 glass-layer-hoverable text-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-100/50"
            aria-label="Refresh page to retry loading projects"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Projects - Portfolio</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Projects - Portfolio" />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Projects - Portfolio" />
        <meta name="twitter:description" content={META_DESCRIPTION} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
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
        role="main"
        aria-label="Projects portfolio"
      >
        {/* Header */}
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="max-w-6xl mx-auto">
            <header className="text-center mb-12 md:mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-zinc-100">
                Projects
              </h1>
              <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto px-4">
                {META_DESCRIPTION}
              </p>
            </header>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Filters Sidebar - Always Visible */}
              <aside className="lg:w-1/3" aria-label="Project filters">
                <div className="lg:fixed lg:top-8 lg:left-0 lg:p-8 lg:w-1/3 lg:max-w-1/3">
                  <div className="glass-layer p-4 md:p-6">
                    <ProjectFilter onFilterChange={handleFilterChange} />
                  </div>
                </div>
              </aside>

              {/* Projects Display */}
              <section className="lg:w-2/3" aria-label="Project listings">
                {/* Loading State */}
                {isLoading && (
                  <div
                    className="flex items-center justify-center py-8 md:py-12"
                    role="status"
                    aria-live="polite"
                  >
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-100/50"
                      aria-label="Loading projects"
                    ></div>
                  </div>
                )}

                {/* Projects Display - Always Grid */}
                {!isLoading && (
                  <div
                    className="grid grid-cols-1 gap-4 md:gap-6"
                    role="list"
                    aria-label={`${filteredProjects.length} projects found`}
                  >
                    {filteredProjectCards}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredProjects.length === 0 && (
                  <div
                    className="text-center py-8 md:py-12"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="text-zinc-400 text-lg mb-2">
                      No projects found
                    </div>
                    <div className="text-zinc-500 text-sm">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
