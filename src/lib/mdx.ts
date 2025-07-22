// Import generated MDX content (build-time)
import {
  getArticleMDXContent as getArticleMDXContentFromIndex,
  getArticleTypeMDXContent,
  type MDXContent,
} from "@/generated/article-mdx-index";
import {
  getArticleById,
  projectArticles,
  type Article,
} from "@/generated/article-index";
import { type UnifiedArticle } from "@/lib/unified-articles";

// Re-export types from generated index
export type { MDXContent } from "@/generated/article-mdx-index";

// Re-export unified interface
export type { UnifiedArticle } from "@/lib/unified-articles";

// Interface for article metadata (from unified article system)
export type ArticleMetadata = Article;

/**
 * Get MDX content for a specific article (fast, build-time data)
 */
export function getArticleMDXContent(articleId: string): MDXContent | null {
  return getArticleMDXContentFromIndex(articleId);
}

/**
 * Get article metadata from the generated index (fast, build-time data)
 */
export function getArticleMetadata(
  articleId: string
): ArticleMetadata | undefined {
  return getArticleById(articleId);
}

/**
 * Get all projects from the generated index (fast, build-time data)
 */
export function getAllProjects(): ArticleMetadata[] {
  return projectArticles;
}

/**
 * Get featured projects from the generated index (fast, build-time data)
 */
export function getFeaturedProjects(): ArticleMetadata[] {
  return projectArticles
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
}

/**
 * Get article with both metadata and MDX content
 */
export function getArticleWithMDX(articleId: string): UnifiedArticle | null {
  const articleMetadata = getArticleMetadata(articleId);
  const mdxContent = getArticleMDXContent(articleId);

  if (!articleMetadata) {
    return null;
  }

  return {
    ...articleMetadata,
    mdxContent,
  };
}

/**
 * Get all projects with MDX content (combines fast metadata + MDX)
 */
export function getAllProjectMDX(): UnifiedArticle[] {
  const allProjects = getAllProjects();
  const projectsWithMDX: UnifiedArticle[] = [];

  for (const project of allProjects) {
    const mdxContent = getArticleMDXContent(project.id);
    projectsWithMDX.push({
      ...project,
      mdxContent,
    });
  }

  return projectsWithMDX;
}

/**
 * Get all projects that have MDX content
 */
export function getProjectsWithMDXContent(): string[] {
  return getArticleTypeMDXContent("project").map(({ id }) => id);
}

/**
 * Test function to verify MDX integration
 */
export function testMDXIntegration() {
  console.log("🧪 Testing Build-time MDX Integration...\n");

  // Test individual project MDX
  console.log("--- Testing Individual Project MDX ---");
  const testProject = getArticleMDXContent("masters-thesis");
  if (testProject) {
    console.log("✅ MDX file found and parsed");
    console.log("📄 Title:", testProject.metadata.title);
    console.log("📝 Description:", testProject.metadata.description);
  }

  // Test project metadata
  console.log("\n--- Testing Project Metadata ---");
  const projectMetadata = getArticleMetadata("masters-thesis");
  if (projectMetadata) {
    console.log("✅ Project metadata found");
    console.log("📄 Title:", projectMetadata.title);
    console.log("🏷️ Tags:", projectMetadata.tags);
    console.log("⭐ Featured:", projectMetadata.featured);
  }

  // Test all projects
  console.log("\n--- Testing All Projects ---");
  const allProjects = getAllProjects();
  console.log(`✅ Found ${allProjects.length} projects`);

  const projectsWithMDX = getProjectsWithMDXContent();
  console.log(`✅ Found ${projectsWithMDX.length} projects with MDX content`);

  // Test featured projects
  console.log("\n--- Testing Featured Projects ---");
  const featuredProjects = getFeaturedProjects();
  console.log(`✅ Found ${featuredProjects.length} featured projects`);

  featuredProjects.forEach((project) => {
    console.log(`⭐ ${project.title} (Order: ${project.featuredOrder})`);
  });
}
