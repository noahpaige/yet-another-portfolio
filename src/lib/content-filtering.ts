// Content filtering utilities for unified article system
import {
  getArticleTypeMDXContent,
  type MDXContent,
} from "@/generated/article-mdx-index";
import { getAllTags } from "@/generated/article-index";

export interface FilterOptions {
  tags?: string[];
  search?: string;
  featured?: boolean;
  type?: "project" | "blog" | "all";
}

export interface FilterResults {
  articles: Array<{ id: string; content: MDXContent }>;
  total: number;
  tags: string[];
}

// Helper function to safely access metadata properties
function getMetadataValue(content: MDXContent, key: string): unknown {
  return content.metadata[key];
}

function getMetadataString(content: MDXContent, key: string): string | null {
  const value = getMetadataValue(content, key);
  return typeof value === "string" ? value : null;
}

function getMetadataNumber(content: MDXContent, key: string): number | null {
  const value = getMetadataValue(content, key);
  return typeof value === "number" ? value : null;
}

function getMetadataArray(content: MDXContent, key: string): unknown[] | null {
  const value = getMetadataValue(content, key);
  return Array.isArray(value) ? value : null;
}

/**
 * Filter articles based on various criteria
 */
export function filterArticles(options: FilterOptions = {}): FilterResults {
  // Get articles based on type filter
  let allArticles: Array<{ id: string; content: MDXContent }> = [];

  if (options.type === "project" || options.type === "blog") {
    allArticles = getArticleTypeMDXContent(options.type);
  } else {
    // Default to all articles (currently only projects, will include blogs later)
    allArticles = getArticleTypeMDXContent("project");
  }

  let filteredArticles = allArticles;

  // Filter by tags (any of the specified tags)
  if (options.tags && options.tags.length > 0) {
    filteredArticles = filteredArticles.filter(({ content }) => {
      const tags = getMetadataArray(content, "tags");
      return tags?.some(
        (tag) => typeof tag === "string" && options.tags!.includes(tag)
      );
    });
  }

  // Filter by search term
  if (options.search) {
    const searchTerm = options.search.toLowerCase();
    filteredArticles = filteredArticles.filter(({ content }) => {
      const title = getMetadataString(content, "title");
      const description = getMetadataString(content, "description");
      const tags = getMetadataArray(content, "tags");

      return (
        (title && title.toLowerCase().includes(searchTerm)) ||
        (description && description.toLowerCase().includes(searchTerm)) ||
        tags?.some(
          (tag) =>
            typeof tag === "string" && tag.toLowerCase().includes(searchTerm)
        )
      );
    });
  }

  // Filter by featured status
  if (options.featured !== undefined) {
    filteredArticles = filteredArticles.filter(({ content }) => {
      const featured = getMetadataValue(content, "featured");
      return featured === options.featured;
    });
  }

  // Get all available tags from the filtered articles
  const tags = new Set<string>();
  filteredArticles.forEach(({ content }) => {
    const contentTags = getMetadataArray(content, "tags");
    if (contentTags) {
      contentTags.forEach((tag) => {
        if (typeof tag === "string") {
          tags.add(tag);
        }
      });
    }
  });

  return {
    articles: filteredArticles,
    total: filteredArticles.length,
    tags: Array.from(tags).sort(),
  };
}

/**
 * Get all available tags
 */
export function getTags(): string[] {
  return getAllTags();
}

/**
 * Get tags for a specific article type
 */
export function getTagsByType(
  type: "project" | "blog" | "all" = "all"
): string[] {
  const allArticles =
    type === "all"
      ? getArticleTypeMDXContent("project") // Currently only projects
      : getArticleTypeMDXContent(type);

  const tags = new Set<string>();
  allArticles.forEach(({ content }) => {
    const contentTags = getMetadataArray(content, "tags");
    if (contentTags) {
      contentTags.forEach((tag) => {
        if (typeof tag === "string") {
          tags.add(tag);
        }
      });
    }
  });

  return Array.from(tags).sort();
}

/**
 * Search articles by text
 */
export function searchArticles(
  query: string,
  type: "project" | "blog" | "all" = "all"
): Array<{ id: string; content: MDXContent }> {
  const allArticles =
    type === "all"
      ? getArticleTypeMDXContent("project") // Currently only projects
      : getArticleTypeMDXContent(type);
  const searchTerm = query.toLowerCase();

  return allArticles.filter(({ content }) => {
    const title = getMetadataString(content, "title");
    const description = getMetadataString(content, "description");
    const tags = getMetadataArray(content, "tags");

    return (
      (title && title.toLowerCase().includes(searchTerm)) ||
      (description && description.toLowerCase().includes(searchTerm)) ||
      tags?.some(
        (tag) =>
          typeof tag === "string" && tag.toLowerCase().includes(searchTerm)
      )
    );
  });
}

/**
 * Get articles by tag
 */
export function getArticlesByTag(
  tag: string,
  type: "project" | "blog" | "all" = "all"
): Array<{ id: string; content: MDXContent }> {
  const allArticles =
    type === "all"
      ? getArticleTypeMDXContent("project") // Currently only projects
      : getArticleTypeMDXContent(type);

  return allArticles.filter(({ content }) => {
    const tags = getMetadataArray(content, "tags");
    return tags?.some((t) => typeof t === "string" && t === tag);
  });
}

/**
 * Get featured articles
 */
export function getFeaturedArticles(
  type: "project" | "blog" | "all" = "all"
): Array<{ id: string; content: MDXContent }> {
  const allArticles =
    type === "all"
      ? getArticleTypeMDXContent("project") // Currently only projects
      : getArticleTypeMDXContent(type);

  return allArticles
    .filter(({ content }) => {
      const featured = getMetadataValue(content, "featured");
      return featured === true;
    })
    .sort((a, b) => {
      const orderA = getMetadataNumber(a.content, "featuredOrder") || 0;
      const orderB = getMetadataNumber(b.content, "featuredOrder") || 0;
      return orderA - orderB;
    });
}
