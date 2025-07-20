"use client";

import { useState, useMemo, useEffect } from "react";
import { filterProjects, getTags } from "@/lib/content-filtering";
import { type MDXContent } from "@/generated/project-mdx-index";
import { Magnetic } from "@/components/ui/magnetic";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface ProjectFilterProps {
  onFilterChange: (
    filteredProjects: Array<{ id: string; content: MDXContent }>
  ) => void;
  className?: string;
}

export function ProjectFilter({
  onFilterChange,
  className = "",
}: ProjectFilterProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get all available filter options
  const tags = getTags();

  // Apply filters and notify parent with useEffect to avoid render-time state updates
  useEffect(() => {
    const results = filterProjects({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchTerm || undefined,
    });

    onFilterChange(results.projects);
  }, [selectedTags, searchTerm, onFilterChange]);

  // Get filtered results for display
  const filteredProjects = useMemo(() => {
    return filterProjects({
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      search: searchTerm || undefined,
    });
  }, [selectedTags, searchTerm]);

  // Get total count of all projects for comparison
  const allProjectsCount = useMemo(() => {
    return filterProjects({}).total;
  }, []);

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedTags.length > 0 || searchTerm;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="space-y-2">
        <input
          id="search"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 glass-layer-hoverable text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-100/50 focus:border-transparent"
        />
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Tags</label>
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
                className={`px-3 py-1 text-sm rounded-full transition-colors cursor-pointer text-white ${
                  selectedTags.includes(tag)
                    ? "glass-layer-light-hoverable"
                    : "glass-layer-hoverable"
                }`}
              >
                {tag}
              </button>
            </Magnetic>
          ))}
        </div>
      </div>

      {/* Results and Clear */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
        <div className="text-sm text-zinc-400">
          {filteredProjects.total === allProjectsCount
            ? `All ${allProjectsCount} projects`
            : `${filteredProjects.total} of ${allProjectsCount} projects`}
        </div>
        {hasActiveFilters && (
          <MagneticButton onClick={clearFilters}>Clear Filters</MagneticButton>
        )}
      </div>
    </div>
  );
}
