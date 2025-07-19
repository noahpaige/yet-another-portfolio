// Unified project interface that combines metadata and MDX content
import {
  projects,
  getProjectById,
  type Project,
} from "@/generated/project-index";
import {
  getProjectMDXContent,
  type MDXContent,
} from "@/generated/project-mdx-index";

// Enhanced project interface that combines both data sources
export interface UnifiedProject extends Project {
  mdxContent: MDXContent | null;
  // Override title/description with MDX frontmatter if available
  title: string;
  description?: string;
}

// Enhanced project with MDX interface (for backward compatibility)
export interface ProjectWithMDX {
  id: string;
  mdxContent: MDXContent | null;
  projectMetadata: Project | null;
}

/**
 * Get a unified project with both metadata and MDX content
 * MDX frontmatter takes precedence over project metadata for title/description
 */
export function getUnifiedProject(projectId: string): UnifiedProject | null {
  const project = getProjectById(projectId);
  const mdxContent = getProjectMDXContent(projectId);

  if (!project) {
    return null;
  }

  // Create unified project with MDX frontmatter taking precedence
  const unifiedProject: UnifiedProject = {
    ...project,
    mdxContent,
    // Use MDX frontmatter title/description if available, fallback to project metadata
    title: mdxContent?.metadata?.title || project.title,
    description: mdxContent?.metadata?.description,
  };

  return unifiedProject;
}

/**
 * Get all projects with unified data (metadata + MDX content)
 */
export function getAllUnifiedProjects(): UnifiedProject[] {
  return projects
    .map((project) => getUnifiedProject(project.id))
    .filter((project): project is UnifiedProject => project !== null);
}

/**
 * Get featured projects with unified data
 */
export function getFeaturedUnifiedProjects(): UnifiedProject[] {
  return getAllUnifiedProjects()
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
}

/**
 * Get projects that have MDX content
 */
export function getProjectsWithMDX(): UnifiedProject[] {
  return getAllUnifiedProjects().filter(
    (project) => project.mdxContent !== null
  );
}

/**
 * Search projects by title, description, or tags
 */
export function searchUnifiedProjects(query: string): UnifiedProject[] {
  const lowerQuery = query.toLowerCase();

  return getAllUnifiedProjects().filter((project) => {
    // Search in title
    if (project.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in description
    if (project.description?.toLowerCase().includes(lowerQuery)) return true;

    // Search in tags
    if (project.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
      return true;

    // Search in MDX content (if available)
    if (project.mdxContent?.content.toLowerCase().includes(lowerQuery))
      return true;

    return false;
  });
}

/**
 * Get projects by tag
 */
export function getProjectsByTag(tag: string): UnifiedProject[] {
  const lowerTag = tag.toLowerCase();

  return getAllUnifiedProjects().filter((project) =>
    project.tags.some((projectTag) => projectTag.toLowerCase() === lowerTag)
  );
}

/**
 * Get all unique tags across all projects
 */
export function getAllTags(): string[] {
  const allTags = new Set<string>();

  getAllUnifiedProjects().forEach((project) => {
    project.tags.forEach((tag) => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}

/**
 * Get project statistics
 */
export function getProjectStats() {
  const allProjects = getAllUnifiedProjects();
  const projectsWithMDX = getProjectsWithMDX();
  const featuredProjects = getFeaturedUnifiedProjects();

  return {
    total: allProjects.length,
    withMDX: projectsWithMDX.length,
    featured: featuredProjects.length,
    tags: getAllTags().length,
  };
}

// Backward compatibility functions
export function getProjectWithMDX(projectId: string): ProjectWithMDX | null {
  const project = getProjectById(projectId);
  const mdxContent = getProjectMDXContent(projectId);

  if (!project) {
    return null;
  }

  return {
    id: projectId,
    mdxContent,
    projectMetadata: project,
  };
}

export function getAllProjectMDX(): ProjectWithMDX[] {
  return projects.map((project) => ({
    id: project.id,
    mdxContent: getProjectMDXContent(project.id),
    projectMetadata: project,
  }));
}
