// Unified article system that combines metadata and MDX content for both projects and blogs
import {
  articles,
  projectArticles,
  getArticleById,
  type Article,
} from "@/generated/article-index";
import {
  getArticleMDXContent,
  type MDXContent,
} from "@/generated/article-mdx-index";

// Enhanced article interface that combines both data sources
export interface UnifiedArticle extends Omit<Article, "description"> {
  mdxContent: MDXContent | null;
  // Override title/description with MDX frontmatter if available
  title: string;
  description?: string;
}

// Enhanced project interface (for backward compatibility)
export interface UnifiedProject extends UnifiedArticle {
  type: "project";
}

// Enhanced project with MDX interface (for backward compatibility)
export interface ProjectWithMDX {
  id: string;
  mdxContent: MDXContent | null;
  projectMetadata: Article | null;
}

/**
 * Get a unified article with both metadata and MDX content
 * MDX frontmatter takes precedence over article metadata for title/description
 */
export function getUnifiedArticle(articleId: string): UnifiedArticle | null {
  const article = getArticleById(articleId);
  const mdxContent = getArticleMDXContent(articleId);

  if (!article) {
    return null;
  }

  // Create unified article with MDX frontmatter taking precedence
  const unifiedArticle: UnifiedArticle = {
    ...article,
    mdxContent,
    // Use MDX frontmatter title/description if available, fallback to article metadata
    title: (mdxContent?.metadata?.title as string) || article.title,
    description: mdxContent?.metadata?.description as string | undefined,
  };

  return unifiedArticle;
}

/**
 * Get a unified project with both metadata and MDX content
 * MDX frontmatter takes precedence over project metadata for title/description
 */
export function getUnifiedProject(projectId: string): UnifiedProject | null {
  const unifiedArticle = getUnifiedArticle(projectId);

  if (!unifiedArticle || unifiedArticle.type !== "project") {
    return null;
  }

  return unifiedArticle as UnifiedProject;
}

/**
 * Get all articles with unified data (metadata + MDX content)
 */
export function getAllUnifiedArticles(): UnifiedArticle[] {
  return articles
    .map((article) => getUnifiedArticle(article.id))
    .filter((article): article is UnifiedArticle => article !== null);
}

/**
 * Get all projects with unified data (metadata + MDX content)
 */
export function getAllUnifiedProjects(): UnifiedProject[] {
  return projectArticles
    .map((project) => getUnifiedProject(project.id))
    .filter((project): project is UnifiedProject => project !== null);
}

/**
 * Get featured articles with unified data
 */
export function getFeaturedUnifiedArticles(): UnifiedArticle[] {
  return getAllUnifiedArticles()
    .filter((article) => article.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
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
 * Get articles that have MDX content
 */
export function getArticlesWithMDX(): UnifiedArticle[] {
  return getAllUnifiedArticles().filter(
    (article) => article.mdxContent !== null
  );
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
 * Search articles by title, description, or tags
 */
export function searchUnifiedArticles(query: string): UnifiedArticle[] {
  const lowerQuery = query.toLowerCase();

  return getAllUnifiedArticles().filter((article) => {
    // Search in title
    if (article.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in description
    if (article.description?.toLowerCase().includes(lowerQuery)) return true;

    // Search in tags
    if (article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
      return true;

    // Search in MDX content (if available)
    if (article.mdxContent?.content.toLowerCase().includes(lowerQuery))
      return true;

    return false;
  });
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
    if (project.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)))
      return true;

    // Search in MDX content (if available)
    if (project.mdxContent?.content.toLowerCase().includes(lowerQuery))
      return true;

    return false;
  });
}

/**
 * Get articles by tag
 */
export function getArticlesByTag(tag: string): UnifiedArticle[] {
  const lowerTag = tag.toLowerCase();

  return getAllUnifiedArticles().filter((article) =>
    article.tags?.some((articleTag) => articleTag.toLowerCase() === lowerTag)
  );
}

/**
 * Get projects by tag
 */
export function getProjectsByTag(tag: string): UnifiedProject[] {
  const lowerTag = tag.toLowerCase();

  return getAllUnifiedProjects().filter((project) =>
    project.tags?.some((projectTag) => projectTag.toLowerCase() === lowerTag)
  );
}

/**
 * Get all unique tags across all articles
 */
export function getAllTags(): string[] {
  const allTags = new Set<string>();

  getAllUnifiedArticles().forEach((article) => {
    article.tags?.forEach((tag) => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}

/**
 * Get article statistics
 */
export function getArticleStats() {
  const allArticles = getAllUnifiedArticles();
  const articlesWithMDX = getArticlesWithMDX();
  const featuredArticles = getFeaturedUnifiedArticles();

  return {
    total: allArticles.length,
    withMDX: articlesWithMDX.length,
    featured: featuredArticles.length,
    tags: getAllTags().length,
  };
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
  const article = getArticleById(projectId);
  const mdxContent = getArticleMDXContent(projectId);

  if (!article) {
    return null;
  }

  return {
    id: projectId,
    mdxContent,
    projectMetadata: article,
  };
}

export function getAllProjectMDX(): ProjectWithMDX[] {
  return projectArticles.map((project) => ({
    id: project.id,
    mdxContent: getArticleMDXContent(project.id),
    projectMetadata: project,
  }));
}
