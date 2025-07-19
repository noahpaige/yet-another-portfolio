"use client";

import { useState, useMemo } from "react";
import {
  filterProjects,
  getCategories,
  getTags,
  getDifficulties,
  getTechnologies,
} from "@/lib/content-filtering";
import { type MDXContent } from "@/generated/project-mdx-index";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get all available filter options
  const categories = getCategories();
  const tags = getTags();
  const difficulties = getDifficulties();
  const technologies = getTechnologies();

  // Apply filters and notify parent
  const filteredProjects = useMemo(() => {
    const results = filterProjects({
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      difficulty:
        (selectedDifficulty as
          | "beginner"
          | "intermediate"
          | "advanced"
          | "expert") || undefined,
      technologies:
        selectedTechnologies.length > 0 ? selectedTechnologies : undefined,
      search: searchTerm || undefined,
    });

    onFilterChange(results.projects);
    return results;
  }, [
    selectedCategory,
    selectedTags,
    selectedDifficulty,
    selectedTechnologies,
    searchTerm,
    onFilterChange,
  ]);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedDifficulty("");
    setSelectedTechnologies([]);
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedDifficulty ||
    selectedTechnologies.length > 0 ||
    searchTerm;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search */}
      <div className="space-y-2">
        <label htmlFor="search" className="text-sm font-medium text-zinc-300">
          Search Projects
        </label>
        <input
          id="search"
          type="text"
          placeholder="Search by title, description, tags, or technologies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Difficulty</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          <option value="">All Difficulties</option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                );
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-cyan-500 border-cyan-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Technologies Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">
          Technologies
        </label>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <button
              key={tech}
              onClick={() => {
                setSelectedTechnologies((prev) =>
                  prev.includes(tech)
                    ? prev.filter((t) => t !== tech)
                    : [...prev, tech]
                );
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedTechnologies.includes(tech)
                  ? "bg-purple-500 border-purple-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Results and Clear */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
        <div className="text-sm text-zinc-400">
          {filteredProjects.total} project
          {filteredProjects.total !== 1 ? "s" : ""} found
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
