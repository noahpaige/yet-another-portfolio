"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { filterArticles, getTagsByType } from "@/lib/content-filtering";
import { type MDXContent } from "@/generated/article-mdx-index";
import { Magnetic } from "@/components/ui/magnetic";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface ArticleFilterProps {
  onFilterChange: (
    filteredArticles: Array<{ id: string; content: MDXContent }>
  ) => void;
  articleType: "project" | "blog" | "all";
  className?: string;
}

export function ArticleFilter({
  onFilterChange,
  articleType,
  className = "",
}: ArticleFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get all available filter options for the specific article type
  const tags = getTagsByType(articleType);

  // Apply filters and notify parent with useEffect to avoid render-time state updates
  useEffect(() => {
    const results = filterArticles({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchTerm || undefined,
      type: articleType,
    });

    onFilterChange(results.articles);
  }, [selectedTags, searchTerm, articleType, onFilterChange]);

  // Get filtered results for display
  const filteredArticles = useMemo(() => {
    return filterArticles({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchTerm || undefined,
      type: articleType,
    });
  }, [selectedTags, searchTerm, articleType]);

  // Get total count of all articles for comparison
  const allArticlesCount = useMemo(() => {
    return filterArticles({ type: articleType }).total;
  }, [articleType]);

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedTags.length > 0 || searchTerm.length > 0;

  return (
    <div className={`space-y-4 glass-layer p-4 ${className}`}>
      {/* Search */}
      <div className="space-y-2">
        <input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800/20 hover:bg-slate-800/50 ring-1 ring-slate-200/20 hover:ring-slate-200/40 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-slate-200/70 focus:border-transparent transition-all duration-200 ease-in-out"
        />
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Magnetic
              key={tag}
              intensity={0.2}
              range={200}
              actionArea={{ type: "self" }}
              springOptions={{ stiffness: 500, damping: 50 }}
            >
              <button
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer text-white transition-all duration-200 ease-in-out ${
                  selectedTags.includes(tag)
                    ? "glass-layer-light-hoverable ring-2 ring-zinc-200/30"
                    : "glass-layer-hoverable "
                }`}
              >
                {tag}
              </button>
            </Magnetic>
          ))}
        </div>
      </div>

      {/* Results and Clear */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-700 h-14">
        <div className="text-sm text-zinc-400">
          {filteredArticles.total === allArticlesCount
            ? `All ${allArticlesCount} ${
                articleType === "project"
                  ? "projects"
                  : articleType === "blog"
                  ? "blogs"
                  : "articles"
              }`
            : `${filteredArticles.total} of ${allArticlesCount} ${
                articleType === "project"
                  ? "projects"
                  : articleType === "blog"
                  ? "blogs"
                  : "articles"
              }`}
        </div>
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 2 }}
              transition={{
                duration: 0.1,
                ease: "easeOut",
                type: "spring",
                stiffness: 700,
                damping: 30,
              }}
            >
              <MagneticButton onClick={clearFilters}>
                Clear Filters
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
