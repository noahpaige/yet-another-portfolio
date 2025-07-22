"use client";

import React, { useRef, useState, useMemo } from "react";
import { useScroll } from "framer-motion";
import { getArticleById } from "@/generated/article-index";
import { getArticleTypeMDXContent } from "@/generated/article-mdx-index";
import { type MDXContent } from "@/generated/article-mdx-index";
import { ProjectCard } from "@/components/ui/project-card";
import { ArticleFilter } from "@/components/projects/article-filter";
import { TopNavbar } from "@/components/shared/top-navbar";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Types
interface FilteredBlog {
  id: string;
  content: MDXContent;
}

// Color pairs for the animated background (different from projects)
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 280, s: 60, l: 25 },
    { h: 120, s: 40, l: 15 },
  ],
  [
    { h: 320, s: 50, l: 25 },
    { h: 180, s: 45, l: 15 },
  ],
];

export default function BlogsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredBlogs, setFilteredBlogs] = useState<FilteredBlog[]>([]);

  // Check if screen is medium size or larger
  const isSmallScreen = useMediaQuery("(min-width: 640px)");

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Get all blogs with MDX content
  const allBlogsWithMDX = useMemo(() => {
    return getArticleTypeMDXContent("blog");
  }, []);

  // Initialize filtered blogs with all blogs
  React.useEffect(() => {
    setFilteredBlogs(allBlogsWithMDX);
  }, [allBlogsWithMDX]);

  // Handle filter changes
  const handleFilterChange = React.useCallback(
    (filtered: Array<{ id: string; content: MDXContent }>) => {
      setFilteredBlogs(filtered);

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
      <TopNavbar currentPage="blog" />

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

        <div className="pt-18">
          <div className="container mx-auto px-4 py-8 relative z-10">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="text-5xl md:text-6xl font-bold text-zinc-100">
                Blog
              </h1>
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar with Filters */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="sticky top-26">
                  <ArticleFilter
                    onFilterChange={handleFilterChange}
                    articleType="blog"
                  />
                </div>
              </div>

              {/* Blogs Grid */}
              <div className="flex-1">
                {filteredBlogs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredBlogs.map(({ id, content }) => {
                      const blog = getArticleById(id);
                      if (!blog) return null;

                      return (
                        <ProjectCard
                          key={id}
                          project={blog}
                          hideTags={false}
                          showDetails={isSmallScreen}
                          mdxContent={content}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 text-lg">
                      No blogs found matching your filters.
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
