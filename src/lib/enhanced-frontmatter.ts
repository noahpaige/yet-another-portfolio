// Enhanced frontmatter schemas and validation for MDX content
import { z } from "zod";

// Base frontmatter schema with common fields
export const BaseFrontmatterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().optional(),
  author: z.string().optional(),
  readTime: z.number().min(1).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().optional(),
  status: z
    .enum(["draft", "published", "archived"])
    .optional()
    .default("published"),
  lastModified: z.string().optional(),
  version: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      image: z.string().optional(),
      canonical: z.string().optional(),
    })
    .optional(),
  social: z
    .object({
      twitter: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
        })
        .optional(),
      og: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

// Project-specific frontmatter schema
export const ProjectFrontmatterSchema = BaseFrontmatterSchema.extend({
  type: z.literal("project"),
  technologies: z.array(z.string()).optional(),
  github: z.string().url().optional(),
  demo: z.string().url().optional(),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  completionDate: z.string().optional(),
  teamSize: z.number().min(1).optional(),
  role: z.string().optional(),
  duration: z.string().optional(),
  budget: z.string().optional(),
  client: z.string().optional(),
  awards: z.array(z.string()).optional(),
  media: z
    .object({
      thumbnail: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      video: z.string().optional(),
    })
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
    author: "Unknown Author",
    readTime: 5,
    category: "Uncategorized",
    tags: [],
    status: "draft",
    lastModified: new Date().toISOString(),
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
    technologies: [],
    difficulty: "intermediate",
    teamSize: 1,
    role: "Developer",
    duration: "Unknown",
    awards: [],
    media: {},
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

  // Set last modified if not provided
  if (!enhanced.lastModified) {
    enhanced.lastModified = new Date().toISOString();
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

export function filterByStatus(
  metadata: Frontmatter[],
  status: "draft" | "published" | "archived"
): Frontmatter[] {
  return metadata.filter((item) => item.status === status);
}

export function filterByCategory(
  metadata: Frontmatter[],
  category: string
): Frontmatter[] {
  return metadata.filter((item) => item.category === category);
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
      item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      item.category?.toLowerCase().includes(searchTerm)
  );
}
