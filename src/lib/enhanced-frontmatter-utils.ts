// Enhanced frontmatter utilities for content management
import {
  sortByDate,
  sortByReadTime,
  filterByStatus,
  filterByCategory,
  filterByTags,
  searchMetadata,
  type Frontmatter,
} from "./enhanced-frontmatter";
import { getAllProjectMDX } from "./mdx";

// Content management utilities
export class ContentManager {
  private allContent: Frontmatter[] = [];

  constructor() {
    this.loadContent();
  }

  private loadContent() {
    try {
      const projectsWithMDX = getAllProjectMDX();
      this.allContent = projectsWithMDX
        .map((project) => project.mdxContent?.metadata)
        .filter(
          (metadata): metadata is Record<string, unknown> =>
            metadata !== null && metadata !== undefined
        )
        .map((metadata) => ({
          ...metadata,
          type: metadata.type || "project", // Ensure type is set
        }));
    } catch (error) {
      console.error("Error loading content:", error);
      this.allContent = [];
    }
  }

  // Get all content
  getAllContent(): Frontmatter[] {
    return [...this.allContent];
  }

  // Get published content only
  getPublishedContent(): Frontmatter[] {
    return filterByStatus(this.allContent, "published");
  }

  // Get content by category
  getContentByCategory(category: string): Frontmatter[] {
    return filterByCategory(this.allContent, category);
  }

  // Get content by tags
  getContentByTags(tags: string[]): Frontmatter[] {
    return filterByTags(this.allContent, tags);
  }

  // Search content
  searchContent(query: string): Frontmatter[] {
    return searchMetadata(this.allContent, query);
  }

  // Get content sorted by date (newest first)
  getContentByDate(): Frontmatter[] {
    return sortByDate(this.allContent);
  }

  // Get content sorted by read time (longest first)
  getContentByReadTime(): Frontmatter[] {
    return sortByReadTime(this.allContent);
  }

  // Get featured content
  getFeaturedContent(): Frontmatter[] {
    return this.allContent
      .filter((content) => content.featured)
      .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
  }

  // Get content by difficulty (for projects)
  getContentByDifficulty(
    difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  ): Frontmatter[] {
    return this.allContent.filter(
      (content) =>
        content.type === "project" && content.difficulty === difficulty
    );
  }

  // Get content by technology
  getContentByTechnology(technology: string): Frontmatter[] {
    return this.allContent.filter(
      (content) =>
        content.type === "project" &&
        content.technologies?.some((tech) =>
          tech.toLowerCase().includes(technology.toLowerCase())
        )
    );
  }

  // Get content statistics
  getContentStats() {
    const total = this.allContent.length;
    const published = this.getPublishedContent().length;
    const drafts = filterByStatus(this.allContent, "draft").length;
    const archived = filterByStatus(this.allContent, "archived").length;

    const categories = new Set(
      this.allContent.map((c) => c.category).filter(Boolean)
    );
    const tags = new Set(this.allContent.flatMap((c) => c.tags || []));

    const avgReadTime =
      this.allContent.reduce((sum, c) => sum + (c.readTime || 0), 0) / total;

    return {
      total,
      published,
      drafts,
      archived,
      categories: Array.from(categories),
      uniqueTags: Array.from(tags),
      avgReadTime: Math.round(avgReadTime),
      totalReadTime: this.allContent.reduce(
        (sum, c) => sum + (c.readTime || 0),
        0
      ),
    };
  }

  // Get content recommendations based on tags
  getRecommendations(contentId: string, limit: number = 3): Frontmatter[] {
    const targetContent = this.allContent.find((c) => c.slug === contentId);
    if (!targetContent || !targetContent.tags) {
      return [];
    }

    const recommendations = this.allContent
      .filter((c) => c.slug !== contentId && c.tags)
      .map((content) => ({
        content,
        score: this.calculateSimilarityScore(targetContent, content),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.content);

    return recommendations;
  }

  private calculateSimilarityScore(
    content1: Frontmatter,
    content2: Frontmatter
  ): number {
    let score = 0;

    // Tag similarity
    if (content1.tags && content2.tags) {
      const commonTags = content1.tags.filter((tag) =>
        content2.tags!.includes(tag)
      );
      score += commonTags.length * 2;
    }

    // Category similarity
    if (content1.category === content2.category) {
      score += 3;
    }

    // Type similarity
    if (content1.type === content2.type) {
      score += 1;
    }

    return score;
  }
}

// Convenience functions
export function createContentManager(): ContentManager {
  return new ContentManager();
}

// Quick access functions
export function getPublishedProjects(): Frontmatter[] {
  const manager = createContentManager();
  return manager.getPublishedContent().filter((c) => c.type === "project");
}

export function getProjectsByTechnology(technology: string): Frontmatter[] {
  const manager = createContentManager();
  return manager.getContentByTechnology(technology);
}

export function getProjectsByDifficulty(
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
): Frontmatter[] {
  const manager = createContentManager();
  return manager.getContentByDifficulty(difficulty);
}

export function searchProjects(query: string): Frontmatter[] {
  const manager = createContentManager();
  return manager.searchContent(query).filter((c) => c.type === "project");
}

export function getContentStats() {
  const manager = createContentManager();
  return manager.getContentStats();
}

// Test function to demonstrate enhanced frontmatter capabilities
export function testEnhancedFrontmatter() {
  console.log("🧪 Testing Enhanced Frontmatter System...\n");

  const manager = createContentManager();
  const stats = manager.getContentStats();

  console.log("📊 Content Statistics:");
  console.log(`   Total Content: ${stats.total}`);
  console.log(`   Published: ${stats.published}`);
  console.log(`   Drafts: ${stats.drafts}`);
  console.log(`   Categories: ${stats.categories.join(", ")}`);
  console.log(`   Unique Tags: ${stats.uniqueTags.length}`);
  console.log(`   Average Read Time: ${stats.avgReadTime} minutes`);
  console.log(`   Total Read Time: ${stats.totalReadTime} minutes`);

  console.log("\n🔍 Search Results for 'RPG':");
  const rpgResults = manager.searchContent("RPG");
  rpgResults.forEach((content) => {
    console.log(
      `   - ${content.title} (${content.readTime}min read, ${
        content.tags?.length || 0
      } tags)`
    );
  });

  console.log("\n📅 Recent Content (by date):");
  const recentContent = manager.getContentByDate().slice(0, 3);
  recentContent.forEach((content) => {
    console.log(`   - ${content.title} (${content.date})`);
  });

  console.log("\n⏱️ Longest Content (by read time):");
  const longestContent = manager.getContentByReadTime().slice(0, 3);
  longestContent.forEach((content) => {
    console.log(`   - ${content.title} (${content.readTime} minutes)`);
  });

  console.log("\n🏷️ Content by Category:");
  const categories = manager
    .getAllContent()
    .map((c) => c.category)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  categories.forEach((category) => {
    const categoryContent = manager.getContentByCategory(category);
    console.log(`   ${category}: ${categoryContent.length} items`);
  });

  console.log("\n🎯 Recommendations for 'clair-obscur-expedition-33':");
  const recommendations = manager.getRecommendations(
    "clair-obscur-expedition-33",
    3
  );
  recommendations.forEach((content) => {
    console.log(`   - ${content.title} (similarity score calculated)`);
  });

  console.log("\n✅ Enhanced Frontmatter System Test Complete!");
}
