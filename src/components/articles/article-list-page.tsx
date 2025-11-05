"use client";

import React, { useRef, useState, useMemo } from "react";
import { useScroll } from "motion/react";
import { motion, AnimatePresence } from "motion/react";
import {
  getArticleTypeMDXContent,
  type MDXContent,
} from "@/generated/article-mdx-index";
import { ArticleCard } from "@/components/ui/article-card";
import { ArticleFilter } from "@/components/projects/article-filter";
import { TopNavbar } from "@/components/shared/top-navbar";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type {
  ArticleListPageProps,
  FilteredArticle,
  ArticleCardOverrides,
} from "./types";

export function ArticleListPage({
  articleType,
  colorPairs,
  getArticleData,
  pageTitle,
  emptyStateMessage,
  layoutConstraints = {},
  articleCardProps = {},
  currentPage,
}: ArticleListPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [filteredArticles, setFilteredArticles] = useState<FilteredArticle[]>(
    []
  );

  // Check if screen is medium size or larger
  const isSmallScreen = useMediaQuery("(min-width: 640px)");

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  // Get all articles with MDX content
  const allArticlesWithMDX = useMemo(() => {
    const articles = getArticleTypeMDXContent(articleType);

    // Sort articles: featured first (by featuredOrder), then non-featured (by date)
    return articles.sort((a, b) => {
      const aFeatured = a.content.metadata.featured === true;
      const bFeatured = b.content.metadata.featured === true;

      // If both are featured, sort by featuredOrder
      if (aFeatured && bFeatured) {
        const aOrder = (a.content.metadata.featuredOrder as number) || 0;
        const bOrder = (b.content.metadata.featuredOrder as number) || 0;
        return aOrder - bOrder;
      }

      // If only one is featured, featured goes first
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;

      // If neither is featured, sort by date (newest first)
      const aDate = new Date(
        (a.content.metadata.date as string) || "1970-01-01"
      );
      const bDate = new Date(
        (b.content.metadata.date as string) || "1970-01-01"
      );
      return bDate.getTime() - aDate.getTime();
    });
  }, [articleType]);

  // Initialize filtered articles with all articles
  React.useEffect(() => {
    setFilteredArticles(allArticlesWithMDX);
  }, [allArticlesWithMDX]);

  // Handle filter changes
  const handleFilterChange = React.useCallback(
    (filtered: Array<{ id: string; content: MDXContent }>) => {
      // Apply the same sorting logic to filtered results
      const sortedFiltered = filtered.sort((a, b) => {
        const aFeatured = a.content.metadata.featured === true;
        const bFeatured = b.content.metadata.featured === true;

        // If both are featured, sort by featuredOrder
        if (aFeatured && bFeatured) {
          const aOrder = (a.content.metadata.featuredOrder as number) || 0;
          const bOrder = (b.content.metadata.featuredOrder as number) || 0;
          return aOrder - bOrder;
        }

        // If only one is featured, featured goes first
        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;

        // If neither is featured, sort by date (newest first)
        const aDate = new Date(
          (a.content.metadata.date as string) || "1970-01-01"
        );
        const bDate = new Date(
          (b.content.metadata.date as string) || "1970-01-01"
        );
        return bDate.getTime() - aDate.getTime();
      });

      setFilteredArticles(sortedFiltered);

      // Reset scroll position to top when filters change
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo(0, 0);
      }
    },
    []
  );

  // Default ArticleCard props with responsive behavior
  const defaultArticleCardProps: ArticleCardOverrides = {
    showTags: "show",
    showReadTime: isSmallScreen ? "show" : "auto",
    showDesc: isSmallScreen ? "show" : "auto",
    height: "auto",
    ...articleCardProps,
  };

  // Apply layout constraints
  const gridClassName = `grid grid-cols-1 gap-6 ${
    layoutConstraints.maxWidth ? `max-w-${layoutConstraints.maxWidth}` : ""
  }`;

  return (
    <>
      {/* Top Navbar */}
      <TopNavbar currentPage={currentPage} />

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
              {pageTitle}
            </h1>
          </div>

          {/* Main Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with Filters */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-26">
                <ArticleFilter
                  onFilterChange={handleFilterChange}
                  articleType={articleType}
                />
              </div>
            </div>

            {/* Articles Grid */}
            <div className="flex-1">
              {filteredArticles.length > 0 ? (
                <div className={gridClassName}>
                  <AnimatePresence mode="wait">
                    {filteredArticles.map(({ id, content }, index) => {
                      const article = getArticleData(id);
                      if (!article) return null;

                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 30, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y: -30,
                            scale: 0.95,
                            transition: { duration: 0.2 },
                          }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.1,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                        >
                          <ArticleCard
                            article={article}
                            showTags={defaultArticleCardProps.showTags}
                            showReadTime={defaultArticleCardProps.showReadTime}
                            showDesc={defaultArticleCardProps.showDesc}
                            height={defaultArticleCardProps.height}
                            mdxContent={content}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-400 text-lg">{emptyStateMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
