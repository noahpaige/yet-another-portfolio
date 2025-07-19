"use client";

import { useState, useEffect } from "react";
import { getAllProjectMDXContent } from "@/generated/project-mdx-index";
import { type MDXContent } from "@/generated/project-mdx-index";
import { ProjectFilter } from "./project-filter";
import { ProjectSearch } from "./project-search";
import { ProjectGrid } from "./project-grid";

interface ProjectDiscoveryProps {
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  defaultView?: "grid" | "list";
}

export function ProjectDiscovery({
  className = "",
  showSearch = true,
  showFilters = true,
  defaultView = "grid",
}: ProjectDiscoveryProps) {
  const [projects, setProjects] = useState<
    Array<{ id: string; content: MDXContent }>
  >([]);
  const [filteredProjects, setFilteredProjects] = useState<
    Array<{ id: string; content: MDXContent }>
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultView);
  const [isLoading, setIsLoading] = useState(true);

  // Load all projects on mount
  useEffect(() => {
    const allProjects = getAllProjectMDXContent();
    setProjects(allProjects);
    setFilteredProjects(allProjects);
    setIsLoading(false);
  }, []);

  const handleFilterChange = (
    filtered: Array<{ id: string; content: MDXContent }>
  ) => {
    setFilteredProjects(filtered);
  };

  const handleSearchResults = (
    results: Array<{ id: string; content: MDXContent }>
  ) => {
    setFilteredProjects(results);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-zinc-100">Discover Projects</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Explore my portfolio of projects, filtered by technology, difficulty,
          and more. Find exactly what you&apos;re looking for with our advanced
          filtering system.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search */}
        {showSearch && (
          <div className="lg:w-1/3">
            <ProjectSearch onSearchResults={handleSearchResults} />
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center gap-4 lg:ml-auto">
          <div className="text-sm text-zinc-400">View:</div>
          <div className="flex bg-zinc-800 rounded-lg p-1">
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
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:w-1/4">
            <div className="sticky top-4">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                Filters
              </h3>
              <ProjectFilter onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}

        {/* Projects Display */}
        <div className={`${showFilters ? "lg:w-3/4" : "w-full"}`}>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-zinc-400">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            {filteredProjects.length !== projects.length && (
              <div className="text-sm text-zinc-500">Filtered results</div>
            )}
          </div>

          {/* Projects Grid/List */}
          {viewMode === "grid" ? (
            <ProjectGrid projects={filteredProjects} />
          ) : (
            <ProjectList projects={filteredProjects} />
          )}
        </div>
      </div>
    </div>
  );
}

// List view component
function ProjectList({
  projects,
}: {
  projects: Array<{ id: string; content: MDXContent }>;
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 text-lg mb-2">No projects found</div>
        <div className="text-zinc-500 text-sm">
          Try adjusting your filters or search terms
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map(({ id, content }) => (
        <ProjectListItem key={id} id={id} content={content} />
      ))}
    </div>
  );
}

function ProjectListItem({ id, content }: { id: string; content: MDXContent }) {
  const metadata = content.metadata;
  const title = metadata.title || "Untitled Project";
  const description = metadata.description || "No description available";
  const readTime = metadata.readTime || 0;
  const category = metadata.category || "Uncategorized";
  const difficulty = metadata.difficulty || "Unknown";
  const tags = metadata.tags || [];
  const technologies = metadata.technologies || [];

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">{title}</h3>
          <p className="text-zinc-400 mb-3 line-clamp-2">{description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
            <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-md">
              {category}
            </span>
            <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-md">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            {readTime > 0 && (
              <span className="flex items-center gap-1 text-zinc-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {readTime} min
              </span>
            )}
          </div>

          {/* Tags and Technologies */}
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="lg:flex-shrink-0">
          <a
            href={`/projects/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            View Project
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
