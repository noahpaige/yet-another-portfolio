// Enhanced frontmatter schemas and validation for MDX content
import { z } from "zod";

// Base frontmatter schema with common fields
export const BaseFrontmatterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
  readTime: z.number().min(1).optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().optional(),
  version: z.string().optional(),
  id: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      image: z.string().optional(),
      canonical: z.string().optional(),
    })
    .optional(),
});

// Project-specific frontmatter schema
export const ProjectFrontmatterSchema = BaseFrontmatterSchema.extend({
  type: z.literal("project"),
  // Project-specific fields
  image: z.string().min(1, "Image path is required"),
  imageAltText: z.string().min(1, "Image alt text is required"),
  // Optional fields for enhanced functionality
  colorPairs: z
    .array(
      z.array(
        z.object({
          h: z.number().min(0).max(360), // Hue: 0-360
          s: z.number().min(0).max(100), // Saturation: 0-100
          l: z.number().min(0).max(100), // Lightness: 0-100
        })
      )
    )
    .optional(),
});

// Blog-specific frontmatter schema (for future use)
export const BlogFrontmatterSchema = BaseFrontmatterSchema.extend({
  type: z.literal("blog"),
  excerpt: z.string().optional(),
  series: z.string().optional(),
  seriesOrder: z.number().optional(),
  relatedPosts: z.array(z.string()).optional(),
  comments: z.boolean().optional().default(true),
  tableOfContents: z.boolean().optional().default(true),
});

// Union type for all frontmatter schemas
export const FrontmatterSchema = z.discriminatedUnion("type", [
  ProjectFrontmatterSchema,
  BlogFrontmatterSchema,
]);

// TypeScript types derived from schemas
export type BaseFrontmatter = z.infer<typeof BaseFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;
export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;
export type Frontmatter = z.infer<typeof FrontmatterSchema>;

// Unified Article interface for the articles system
export interface Article {
  id: string;
  title: string;
  description: string;
  type: "project" | "blog";
  date?: string;
  readTime?: number;
  tags?: string[];
  slug?: string;
  featured?: boolean;
  featuredOrder?: number;
  version?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    canonical?: string;
  };
  // Project-specific fields
  image?: string;
  imageAltText?: string;
  colorPairs?: Array<Array<{ h: number; s: number; l: number }>>;
  // Blog-specific fields
  excerpt?: string;
  series?: string;
  seriesOrder?: number;
  relatedPosts?: string[];
  comments?: boolean;
  tableOfContents?: boolean;
}

// Validation functions
export function validateFrontmatter(data: unknown): Frontmatter {
  try {
    return FrontmatterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Frontmatter validation failed:", error.errors);
    }
    throw error;
  }
}

export function validateProjectFrontmatter(data: unknown): ProjectFrontmatter {
  try {
    return ProjectFrontmatterSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Project frontmatter validation failed:", error.errors);
    }
    throw error;
  }
}

// Fallback and default values
export function createDefaultFrontmatter(
  overrides: Partial<BaseFrontmatter> = {}
): BaseFrontmatter {
  return {
    title: "Untitled",
    description: "No description provided",
    date: new Date().toISOString(),
    readTime: 5,
    tags: [],
    version: "1.0.0",
    ...overrides,
  };
}

export function createDefaultProjectFrontmatter(
  overrides: Partial<ProjectFrontmatter> = {}
): ProjectFrontmatter {
  return {
    ...createDefaultFrontmatter(overrides),
    type: "project",
    image: "/default-project-image.png",
    imageAltText: "Default project image",
    ...overrides,
  };
}

// Metadata processing utilities
export function processFrontmatter(
  rawFrontmatter: Record<string, unknown>
): Frontmatter {
  try {
    // Try to validate as specific type first
    if (rawFrontmatter.type === "project") {
      return validateProjectFrontmatter(rawFrontmatter);
    }

    // Fall back to base validation
    return validateFrontmatter(rawFrontmatter);
  } catch (error) {
    console.warn("Frontmatter validation failed, using defaults:", error);

    // Return default project frontmatter with available data
    return createDefaultProjectFrontmatter(
      rawFrontmatter as Partial<ProjectFrontmatter>
    );
  }
}

// Metadata enhancement utilities
export function enhanceMetadata(metadata: Frontmatter): Frontmatter {
  const enhanced = { ...metadata };

  // Auto-generate read time if not provided
  if (!enhanced.readTime) {
    enhanced.readTime = estimateReadTime(metadata.description || "");
  }

  // Auto-generate slug if not provided
  if (!enhanced.slug) {
    enhanced.slug = generateSlug(metadata.title);
  }

  // Auto-generate ID from slug if not provided (for project articles)
  if (enhanced.type === "project" && !enhanced.id) {
    enhanced.id = enhanced.slug;
  }

  return enhanced;
}

// Helper functions
function estimateReadTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Metadata sorting and filtering utilities
export function sortByDate(metadata: Frontmatter[]): Frontmatter[] {
  return [...metadata].sort((a, b) => {
    const dateA = new Date(a.date || "1970-01-01");
    const dateB = new Date(b.date || "1970-01-01");
    return dateB.getTime() - dateA.getTime(); // Newest first
  });
}

export function sortByReadTime(metadata: Frontmatter[]): Frontmatter[] {
  return [...metadata].sort((a, b) => (b.readTime || 0) - (a.readTime || 0));
}

export function filterByTags(
  metadata: Frontmatter[],
  tags: string[]
): Frontmatter[] {
  return metadata.filter((item) =>
    item.tags?.some((tag) => tags.includes(tag))
  );
}

export function searchMetadata(
  metadata: Frontmatter[],
  query: string
): Frontmatter[] {
  const searchTerm = query.toLowerCase();
  return metadata.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
}

// Project-specific utility functions
export function getProjectArticles(
  metadata: Frontmatter[]
): ProjectFrontmatter[] {
  return metadata.filter(
    (item): item is ProjectFrontmatter => item.type === "project"
  );
}

export function getBlogArticles(metadata: Frontmatter[]): BlogFrontmatter[] {
  return metadata.filter(
    (item): item is BlogFrontmatter => item.type === "blog"
  );
}

export function getFeaturedProjects(
  metadata: Frontmatter[]
): ProjectFrontmatter[] {
  return getProjectArticles(metadata)
    .filter((project) => project.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
}

export function getProjectById(
  metadata: Frontmatter[],
  id: string
): ProjectFrontmatter | undefined {
  return getProjectArticles(metadata).find((project) => project.id === id);
}

// Color pairs utility for animated backgrounds
export function hasColorPairs(project: ProjectFrontmatter): boolean {
  return project.colorPairs !== undefined && project.colorPairs.length > 0;
}

export function getColorPairs(project: ProjectFrontmatter) {
  return project.colorPairs || [];
}

// Conversion utilities for the articles system
export function frontmatterToArticle(frontmatter: Frontmatter): Article {
  const base: Article = {
    id: frontmatter.id || frontmatter.slug || generateSlug(frontmatter.title),
    title: frontmatter.title,
    description: frontmatter.description,
    type: frontmatter.type,
    date: frontmatter.date,
    readTime: frontmatter.readTime,
    tags: frontmatter.tags,
    slug: frontmatter.slug,
    featured: frontmatter.featured,
    featuredOrder: frontmatter.featuredOrder,
    version: frontmatter.version,
    seo: frontmatter.seo,
  };

  // Add project-specific fields
  if (frontmatter.type === "project") {
    return {
      ...base,
      image: frontmatter.image,
      imageAltText: frontmatter.imageAltText,
      colorPairs: frontmatter.colorPairs,
    };
  }

  // Add blog-specific fields
  if (frontmatter.type === "blog") {
    return {
      ...base,
      excerpt: frontmatter.excerpt,
      series: frontmatter.series,
      seriesOrder: frontmatter.seriesOrder,
      relatedPosts: frontmatter.relatedPosts,
      comments: frontmatter.comments ?? true,
      tableOfContents: frontmatter.tableOfContents ?? true,
    };
  }

  return base;
}

export function articleToFrontmatter(article: Article): Frontmatter {
  if (article.type === "project") {
    return {
      title: article.title,
      description: article.description,
      type: "project",
      date: article.date,
      readTime: article.readTime,
      tags: article.tags,
      slug: article.slug,
      featured: article.featured,
      featuredOrder: article.featuredOrder,
      version: article.version,
      seo: article.seo,
      image: article.image!,
      imageAltText: article.imageAltText!,
      colorPairs: article.colorPairs,
      id: article.id,
    };
  }

  if (article.type === "blog") {
    return {
      title: article.title,
      description: article.description,
      type: "blog",
      date: article.date,
      readTime: article.readTime,
      tags: article.tags,
      slug: article.slug,
      featured: article.featured,
      featuredOrder: article.featuredOrder,
      version: article.version,
      seo: article.seo,
      excerpt: article.excerpt,
      series: article.series,
      seriesOrder: article.seriesOrder,
      relatedPosts: article.relatedPosts,
      comments: article.comments ?? true,
      tableOfContents: article.tableOfContents ?? true,
    };
  }

  throw new Error(`Unknown article type: ${article.type}`);
}
