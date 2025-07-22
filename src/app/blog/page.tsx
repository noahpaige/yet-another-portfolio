"use client";

import React, { useRef, useState, useMemo } from "react";
import { useScroll } from "framer-motion";
import { getArticleById } from "@/generated/article-index";
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
interface FilteredBlog {
  id: string;
  content: MDXContent;
}

// Color pairs for the animated background (different from projects)
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 225, s: 45, l: 40 },
    { h: 260, s: 60, l: 8 },
  ],
  [
    { h: 225, s: 60, l: 30 },
    { h: 260, s: 70, l: 10 },
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
          </div>
          <div className="z-0 h-full w-full absolute">
            <NoiseOverlay
              opacity={0.03}
              resolution={1}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        </ClientOnly>

        <div
          className="container mx-auto px-4 py-8 relative z-10"
          style={{ paddingTop: "var(--navbar-height, 80px)" }}
        >
          {/* Page Header */}
          <div className="text-center my-8">
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
                      <ArticleCard
                        key={id}
                        article={blog}
                        hideTags={false}
                        showReadTime={isSmallScreen}
                        showDesc={isSmallScreen}
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
      </main>
    </>
  );
}
