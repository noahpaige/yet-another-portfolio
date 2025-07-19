// Content filtering utilities for portfolio organization
import {
  getAllProjectMDXContent,
  type MDXContent,
} from "@/generated/project-mdx-index";

export interface FilterOptions {
  category?: string;
  tags?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  technologies?: string[];
  search?: string;
  featured?: boolean;
}

export interface FilterResults {
  projects: Array<{ id: string; content: MDXContent }>;
  total: number;
  categories: string[];
  tags: string[];
  difficulties: string[];
  technologies: string[];
}

/**
 * Filter projects based on various criteria
 */
export function filterProjects(options: FilterOptions = {}): FilterResults {
  const allProjects = getAllProjectMDXContent();
  let filteredProjects = allProjects;

  // Filter by category
  if (options.category) {
    filteredProjects = filteredProjects.filter(
      ({ content }) => content.metadata.category === options.category
    );
  }

  // Filter by tags (any of the specified tags)
  if (options.tags && options.tags.length > 0) {
    filteredProjects = filteredProjects.filter(({ content }) =>
      content.metadata.tags?.some((tag) => options.tags!.includes(tag))
    );
  }

  // Filter by difficulty
  if (options.difficulty) {
    filteredProjects = filteredProjects.filter(
      ({ content }) => content.metadata.difficulty === options.difficulty
    );
  }

  // Filter by technologies (any of the specified technologies)
  if (options.technologies && options.technologies.length > 0) {
    filteredProjects = filteredProjects.filter(({ content }) =>
      content.metadata.technologies?.some((tech) =>
        options.technologies!.some((searchTech) =>
          tech.toLowerCase().includes(searchTech.toLowerCase())
        )
      )
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
        ) ||
        content.metadata.technologies?.some((tech) =>
          tech.toLowerCase().includes(searchTerm)
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
  const categories = new Set<string>();
  const tags = new Set<string>();
  const difficulties = new Set<string>();
  const technologies = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.category) {
      categories.add(content.metadata.category);
    }
    if (content.metadata.tags) {
      content.metadata.tags.forEach((tag) => tags.add(tag));
    }
    if (content.metadata.difficulty) {
      difficulties.add(content.metadata.difficulty);
    }
    if (content.metadata.technologies) {
      content.metadata.technologies.forEach((tech) => technologies.add(tech));
    }
  });

  return {
    projects: filteredProjects,
    total: filteredProjects.length,
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    difficulties: Array.from(difficulties).sort(),
    technologies: Array.from(technologies).sort(),
  };
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  const allProjects = getAllProjectMDXContent();
  const categories = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.category) {
      categories.add(content.metadata.category);
    }
  });

  return Array.from(categories).sort();
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
 * Get all available difficulties
 */
export function getDifficulties(): string[] {
  const allProjects = getAllProjectMDXContent();
  const difficulties = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.difficulty) {
      difficulties.add(content.metadata.difficulty);
    }
  });

  return Array.from(difficulties).sort();
}

/**
 * Get all available technologies
 */
export function getTechnologies(): string[] {
  const allProjects = getAllProjectMDXContent();
  const technologies = new Set<string>();

  allProjects.forEach(({ content }) => {
    if (content.metadata.technologies) {
      content.metadata.technologies.forEach((tech) => technologies.add(tech));
    }
  });

  return Array.from(technologies).sort();
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
      ) ||
      content.metadata.technologies?.some((tech) =>
        tech.toLowerCase().includes(searchTerm)
      ) ||
      content.metadata.category?.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get projects by category
 */
export function getProjectsByCategory(
  category: string
): Array<{ id: string; content: MDXContent }> {
  const allProjects = getAllProjectMDXContent();

  return allProjects.filter(
    ({ content }) => content.metadata.category === category
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
 * Get projects by difficulty
 */
export function getProjectsByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
): Array<{ id: string; content: MDXContent }> {
  const allProjects = getAllProjectMDXContent();

  return allProjects.filter(
    ({ content }) => content.metadata.difficulty === difficulty
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
