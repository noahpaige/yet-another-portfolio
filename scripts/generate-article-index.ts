import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  processFrontmatter,
  enhanceMetadata,
  frontmatterToArticle,
  type Article,
} from "../src/lib/enhanced-frontmatter";

interface ArticleTypeConfig {
  name: string;
  sourceDir: string;
  type: "project" | "blog";
}

// Configuration for different article types
const articleTypes: ArticleTypeConfig[] = [
  {
    name: "projects",
    sourceDir: "src/projects", // Will be migrated to src/articles/projects/ later
    type: "project",
  },
  // Future: Add blog configuration here
  // {
  //   name: "blogs",
  //   sourceDir: "src/articles/blogs",
  //   type: "blog",
  // }
];

// Ensure the generated directory exists
const generatedDir = path.join(process.cwd(), "src", "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// TypeScript interfaces for the unified article system
const interfaces = `
// This file is auto-generated. Do not edit manually.
// Run: npm run generate-article-index

import type { Article, Frontmatter } from '@/lib/enhanced-frontmatter';

// Unified article interface (re-exported for convenience)
export type { Article } from '@/lib/enhanced-frontmatter';

// All articles sorted by date (newest first)
export const articles: Article[] = [];

// Articles by type
export const projectArticles: Article[] = [];
export const blogArticles: Article[] = [];

// Featured articles sorted by featuredOrder
export const featuredArticles: Article[] = [];

// Article IDs
export const articleIds: string[] = [];

// Helper function to get article by ID
export function getArticleById(id: string): Article | undefined {
  return articles.find(article => article.id === id);
}

// Helper function to get articles by type
export function getArticlesByType(type: "project" | "blog"): Article[] {
  return articles.filter(article => article.type === type);
}

// Helper function to get featured articles by type
export function getFeaturedArticlesByType(type: "project" | "blog"): Article[] {
  return featuredArticles.filter(article => article.type === type);
}

// Helper function to search articles
export function searchArticles(query: string): Article[] {
  const searchTerm = query.toLowerCase();
  return articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    article.description.toLowerCase().includes(searchTerm) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Helper function to get articles by tag
export function getArticlesByTag(tag: string): Article[] {
  const lowerTag = tag.toLowerCase();
  return articles.filter(article =>
    article.tags?.some(articleTag => articleTag.toLowerCase() === lowerTag)
  );
}

// Helper function to get all unique tags
export function getAllTags(): string[] {
  const allTags = new Set<string>();
  articles.forEach(article => {
    article.tags?.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
}

// Statistics
export function getArticleStats() {
  return {
    total: articles.length,
    projects: projectArticles.length,
    blogs: blogArticles.length,
    featured: featuredArticles.length,
    tags: getAllTags().length,
  };
}
`;

function generateArticleIndex(config: ArticleTypeConfig) {
  const { name, sourceDir, type } = config;

  const sourcePath = path.join(process.cwd(), sourceDir);

  // Check if source directory exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️ Source directory not found: ${sourcePath}`);
    return [];
  }

  // Get all content directories
  const contentDirs = fs
    .readdirSync(sourcePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  console.log(`📁 Scanning ${contentDirs.length} ${name} directories...`);

  const articles: Article[] = [];

  // Parse and collect all MDX content
  contentDirs.forEach((contentDir) => {
    const mdxPath = path.join(sourcePath, contentDir, "content.mdx");

    if (fs.existsSync(mdxPath)) {
      try {
        const fileContent = fs.readFileSync(mdxPath, "utf8");
        const { data } = matter(fileContent);

        // Process and enhance frontmatter using our enhanced schemas
        const processedMetadata = processFrontmatter(data);
        const enhancedMetadata = enhanceMetadata(processedMetadata);

        // Convert to unified article format
        const article = frontmatterToArticle(enhancedMetadata);

        // Derive ID from folder name for URL consistency
        article.id = contentDir;

        // Ensure the article has the correct type
        if (article.type !== type) {
          console.warn(
            `⚠️ Article ${contentDir} has type "${article.type}" but expected "${type}"`
          );
        }

        articles.push(article);

        console.log(`✅ Processed ${type} article: ${contentDir}`);
        console.log(
          `   📊 Metadata: ${article.readTime || 5}min read, ${
            article.tags?.length || 0
          } tags`
        );

        // Log any missing required fields for projects
        if (type === "project") {
          if (
            !article.image ||
            article.image === "/default-project-image.png"
          ) {
            console.log(`   ⚠️ Missing image for project: ${contentDir}`);
          }
          if (
            !article.imageAltText ||
            article.imageAltText === "Default project image"
          ) {
            console.log(
              `   ⚠️ Missing imageAltText for project: ${contentDir}`
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ Error processing ${type} article ${contentDir}:`,
          error
        );
      }
    } else {
      console.log(`⚠️ No MDX file found for: ${contentDir}`);
    }
  });

  return articles;
}

// Generate the unified article index
function generateUnifiedArticleIndex() {
  console.log("🚀 Generating unified article index...\n");

  let allArticles: Article[] = [];

  // Generate articles for each type
  articleTypes.forEach((config) => {
    console.log(`--- Generating ${config.name} articles ---`);
    const typeArticles = generateArticleIndex(config);
    allArticles = allArticles.concat(typeArticles);
    console.log("");
  });

  // Sort all articles by date (newest first)
  allArticles.sort((a, b) => {
    const dateA = new Date(a.date || "1970-01-01");
    const dateB = new Date(b.date || "1970-01-01");
    return dateB.getTime() - dateA.getTime();
  });

  // Separate articles by type
  const projectArticles = allArticles.filter(
    (article) => article.type === "project"
  );
  const blogArticles = allArticles.filter((article) => article.type === "blog");

  // Get featured articles sorted by featuredOrder
  const featuredArticles = allArticles
    .filter((article) => article.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

  // Get all article IDs
  const articleIds = allArticles.map((article) => article.id);

  // Generate the index file content
  let indexContent = interfaces;

  // Add the articles data
  indexContent += `
// All articles data
export const articles: Article[] = ${JSON.stringify(allArticles, null, 2)};

export const projectArticles: Article[] = ${JSON.stringify(
    projectArticles,
    null,
    2
  )};

export const blogArticles: Article[] = ${JSON.stringify(blogArticles, null, 2)};

export const featuredArticles: Article[] = ${JSON.stringify(
    featuredArticles,
    null,
    2
  )};

export const articleIds: string[] = ${JSON.stringify(articleIds, null, 2)};
`;

  // Write the generated file
  const outputFile = "src/generated/article-index.ts";
  fs.writeFileSync(outputFile, indexContent);

  // Print statistics
  const stats = {
    total: allArticles.length,
    projects: projectArticles.length,
    blogs: blogArticles.length,
    featured: featuredArticles.length,
    tags: new Set(allArticles.flatMap((article) => article.tags || [])).size,
  };

  console.log("📊 Article Statistics:");
  console.log(`   Total Articles: ${stats.total}`);
  console.log(`   Projects: ${stats.projects}`);
  console.log(`   Blogs: ${stats.blogs}`);
  console.log(`   Featured: ${stats.featured}`);
  console.log(`   Unique Tags: ${stats.tags}`);
  console.log(`📁 Output: ${outputFile}`);

  return stats;
}

// Run the generator
generateUnifiedArticleIndex();
console.log("\n🎉 Unified article index generated successfully!");
