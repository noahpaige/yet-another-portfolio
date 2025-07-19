"use client";

import Link from "next/link";
import { type MDXContent } from "@/generated/project-mdx-index";

interface ProjectGridProps {
  projects: Array<{ id: string; content: MDXContent }>;
  className?: string;
}

export function ProjectGrid({ projects, className = "" }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-zinc-400 text-lg mb-2">No projects found</div>
        <div className="text-zinc-500 text-sm">
          Try adjusting your filters or search terms
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {projects.map(({ id, content }) => (
        <ProjectCard key={id} id={id} content={content} />
      ))}
    </div>
  );
}

interface ProjectCardProps {
  id: string;
  content: MDXContent;
}

function ProjectCard({ id, content }: ProjectCardProps) {
  const metadata = content.metadata;
  const title = metadata.title || "Untitled Project";
  const description = metadata.description || "No description available";
  const readTime = metadata.readTime || 0;
  const category = metadata.category || "Uncategorized";
  const difficulty = metadata.difficulty || "Unknown";
  const tags = metadata.tags || [];
  const technologies = metadata.technologies || [];

  return (
    <Link
      href={`/projects/${id}`}
      className="group block bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:shadow-lg hover:shadow-zinc-900/20"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-white transition-colors mb-2">
          {title}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2">{description}</p>
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-4">
        {/* Category and Difficulty */}
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-md">
            {category}
          </span>
          <span className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded-md">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>

        {/* Read Time */}
        {readTime > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
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
            {readTime} min read
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-zinc-500 mb-2">Tags</div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-zinc-700 text-zinc-400 rounded-md">
                +{tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Technologies */}
      {technologies.length > 0 && (
        <div>
          <div className="text-xs text-zinc-500 mb-2">Technologies</div>
          <div className="flex flex-wrap gap-1">
            {technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md"
              >
                {tech}
              </span>
            ))}
            {technologies.length > 3 && (
              <span className="px-2 py-1 text-xs bg-zinc-700 text-zinc-400 rounded-md">
                +{technologies.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hover Effect */}
      <div className="mt-4 pt-4 border-t border-zinc-700 group-hover:border-zinc-600 transition-colors">
        <div className="flex items-center justify-between text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
          <span>View Project</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
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
        </div>
      </div>
    </Link>
  );
}
