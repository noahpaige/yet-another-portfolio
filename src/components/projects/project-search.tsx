"use client";

import { useState, useMemo } from "react";
import { searchProjects } from "@/lib/content-filtering";
import { type MDXContent } from "@/generated/project-mdx-index";

interface ProjectSearchProps {
  onSearchResults: (
    results: Array<{ id: string; content: MDXContent }>
  ) => void;
  className?: string;
  placeholder?: string;
}

export function ProjectSearch({
  onSearchResults,
  className = "",
  placeholder = "Search projects...",
}: ProjectSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      onSearchResults([]);
      return [];
    }

    setIsSearching(true);
    const results = searchProjects(query.trim());
    setIsSearching(false);
    onSearchResults(results);
    return results;
  }, [query, onSearchResults]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Status */}
      {query && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-zinc-400">
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                Searching...
              </div>
            ) : (
              `${searchResults.length} result${
                searchResults.length !== 1 ? "s" : ""
              } found`
            )}
          </div>
          {query && (
            <div className="text-zinc-500">Search: &ldquo;{query}&rdquo;</div>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!query && (
        <div className="space-y-2">
          <div className="text-sm text-zinc-500">Quick search suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "RPG",
              "Gaming",
              "React",
              "TypeScript",
              "Advanced",
              "Intermediate",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-md transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
