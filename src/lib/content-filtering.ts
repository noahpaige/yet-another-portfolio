// Content filtering utilities for portfolio organization
import {
  getAllProjectMDXContent,
  type MDXContent,
} from "@/generated/project-mdx-index";

export interface FilterOptions {
  tags?: string[];
  search?: string;
  featured?: boolean;
}

export interface FilterResults {
  projects: Array<{ id: string; content: MDXContent }>;
  total: number;
  tags: string[];
}

/**
 * Filter projects based on various criteria
 */
export function filterProjects(options: FilterOptions = {}): FilterResults {
  const allProjects = getAllProjectMDXContent();
  let filteredProjects = allProjects;

  // Filter by tags (any of the specified tags)
  if (options.tags && options.tags.length > 0) {
    filteredProjects = filteredProjects.filter(({ content }) =>
      content.metadata.tags?.some((tag) => options.tags!.includes(tag))
    );
  }

  // Filter by search term
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    filteredProjects = filteredProjects.filter(
      ({ content }) =>
        content.metadata.title?.toLowerCase().includes(searchTerm) ||
        content.metadata.description?.toLowerCase().includes(searchTerm) ||
        content.metadata.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm)
        )
    );
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    filteredProjects = filteredProjects.filter(
      ({ content }) => content.metadata.featured === options.featured
    );
  }

  // Get all available filter options from remaining projects
  const tags = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.tags) {
      content.metadata.tags.forEach((tag) => tags.add(tag));
    }
  });

  return {
    projects: filteredProjects,
    total: filteredProjects.length,
    tags: Array.from(tags).sort(),
  };
}

/**
 * Get all available tags
 */
export function getTags(): string[] {
  const allProjects = getAllProjectMDXContent();
  const tags = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.tags) {
      content.metadata.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}

/**
 * Search projects by text
 */
export function searchProjects(
  query: string
): Array<{ id: string; content: MDXContent }> {
  const allProjects = getAllProjectMDXContent();
  const searchTerm = query.toLowerCase();

  return allProjects.filter(
    ({ content }) =>
      content.metadata.title?.toLowerCase().includes(searchTerm) ||
      content.metadata.description?.toLowerCase().includes(searchTerm) ||
      content.metadata.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      )
  );
}

/**
 * Get projects by tag
 */
export function getProjectsByTag(
  tag: string
): Array<{ id: string; content: MDXContent }> {
  const allProjects = getAllProjectMDXContent();

  return allProjects.filter(({ content }) =>
    content.metadata.tags?.includes(tag)
  );
}

/**
 * Get featured projects
 */
export function getFeaturedProjects(): Array<{
  id: string;
  content: MDXContent;
}> {
  const allProjects = getAllProjectMDXContent();

  return allProjects
    .filter(({ content }) => content.metadata.featured)
    .sort(
      (a, b) =>
        (a.content.metadata.featuredOrder || 0) -
        (b.content.metadata.featuredOrder || 0)
    );
}
