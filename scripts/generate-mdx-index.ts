import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  processFrontmatter,
  enhanceMetadata,
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

// TypeScript interfaces for unified article MDX system
const interfaces = `
// This file is auto-generated. Do not edit manually.
// Run: npm run generate-mdx-index

import type { Article } from '@/lib/enhanced-frontmatter';

export interface MDXContent {
  metadata: Record<string, unknown>;
  content: string;
}

export interface ArticleWithMDX {
  id: string;
  mdxContent: MDXContent | null;
}

// Unified MDX content for all articles
// MDX content by article type

// Helper function to get MDX content by article ID
export function getArticleMDXContent(articleId: string): MDXContent | null {
  return articlesMDXContent[articleId] || null;
}

// Helper function to get MDX content by article type
export function getMDXContentByType(type: "project" | "blog"): Record<string, MDXContent | null> {
  return type === "project" ? projectMDXContent : blogMDXContent;
}

// Get all articles that have MDX content
export function getArticlesWithMDX(): string[] {
  return Object.entries(articlesMDXContent)
    .filter(([, content]) => content !== null)
    .map(([articleId]) => articleId);
}

// Get all MDX content as array
export function getAllArticleMDXContent(): Array<{ id: string; content: MDXContent }> {
  return Object.entries(articlesMDXContent)
    .filter(([, content]) => content !== null)
    .map(([articleId, content]) => ({
      id: articleId,
      content: content as MDXContent
    }));
}

// Get MDX content for specific article type
export function getArticleTypeMDXContent(type: "project" | "blog"): Array<{ id: string; content: MDXContent }> {
  const typeContent = type === "project" ? projectMDXContent : blogMDXContent;
  return Object.entries(typeContent)
    .filter(([, content]) => content !== null)
    .map(([articleId, content]) => ({
      id: articleId,
      content: content as MDXContent
    }));
}

// Statistics
export function getMDXStats() {
  const totalArticles = Object.keys(articlesMDXContent).length;
  const articlesWithMDX = Object.values(articlesMDXContent).filter(content => content !== null).length;
  const projectsWithMDX = Object.values(projectMDXContent).filter(content => content !== null).length;
  const blogsWithMDX = Object.values(blogMDXContent).filter(content => content !== null).length;

  return {
    total: totalArticles,
    withMDX: articlesWithMDX,
    projects: projectsWithMDX,
    blogs: blogsWithMDX,
  };
}
`;

function generateUnifiedMDXIndex() {
  console.log("🚀 Generating unified MDX index...\n");

  // Unified MDX content storage
  const allMDXContent: Record<
    string,
    { metadata: Record<string, unknown>; content: string } | null
  > = {};
  const projectMDXContent: Record<
    string,
    { metadata: Record<string, unknown>; content: string } | null
  > = {};
  const blogMDXContent: Record<
    string,
    { metadata: Record<string, unknown>; content: string } | null
  > = {};

  // Process each article type
  articleTypes.forEach((config) => {
    const { name, sourceDir, type } = config;
    const sourcePath = path.join(process.cwd(), sourceDir);

    console.log(`--- Processing ${name} MDX content ---`);

    // Check if source directory exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️ Source directory not found: ${sourcePath}`);
      return;
    }

    // Get all content directories
    const contentDirs = fs
      .readdirSync(sourcePath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log(`📁 Scanning ${contentDirs.length} ${name} directories...`);

    // Parse and collect all MDX content
    contentDirs.forEach((contentDir) => {
      const mdxPath = path.join(sourcePath, contentDir, "content.mdx");

      if (fs.existsSync(mdxPath)) {
        try {
          const fileContent = fs.readFileSync(mdxPath, "utf8");
          const { data, content } = matter(fileContent);

          // Process and enhance frontmatter using our enhanced schemas
          const processedMetadata = processFrontmatter(data);
          const enhancedMetadata = enhanceMetadata(processedMetadata);

          // Derive ID from folder name for URL consistency
          const articleId = contentDir;

          const mdxContent = {
            metadata: enhancedMetadata,
            content: content.trim(),
          };

          // Store in unified and type-specific collections
          allMDXContent[articleId] = mdxContent;
          if (type === "project") {
            projectMDXContent[articleId] = mdxContent;
          } else if (type === "blog") {
            blogMDXContent[articleId] = mdxContent;
          }

          console.log(
            `✅ Processed ${type} MDX: ${contentDir} (ID: ${articleId})`
          );
          console.log(
            `   📊 Enhanced metadata: ${
              enhancedMetadata.readTime || 5
            }min read, ${enhancedMetadata.tags?.length || 0} tags`
          );
        } catch (error) {
          console.error(`❌ Error processing MDX for ${contentDir}:`, error);
          allMDXContent[contentDir] = null;
        }
      } else {
        console.log(`⚠️ No MDX file found for: ${contentDir}`);
        allMDXContent[contentDir] = null;
      }
    });

    console.log("");
  });

  // Generate the unified MDX index file
  const outputFile = "src/generated/article-mdx-index.ts";
  let indexContent = interfaces;

  // Add the MDX content data
  indexContent += `
// All MDX content data
export const articlesMDXContent: Record<string, MDXContent | null> = ${JSON.stringify(
    allMDXContent,
    null,
    2
  )};

export const projectMDXContent: Record<string, MDXContent | null> = ${JSON.stringify(
    projectMDXContent,
    null,
    2
  )};

export const blogMDXContent: Record<string, MDXContent | null> = ${JSON.stringify(
    blogMDXContent,
    null,
    2
  )};
`;

  // Write the generated file
  fs.writeFileSync(outputFile, indexContent);

  // Print statistics
  const stats = {
    total: Object.keys(allMDXContent).length,
    withMDX: Object.values(allMDXContent).filter((content) => content !== null)
      .length,
    projects: Object.values(projectMDXContent).filter(
      (content) => content !== null
    ).length,
    blogs: Object.values(blogMDXContent).filter((content) => content !== null)
      .length,
  };

  console.log("📊 MDX Statistics:");
  console.log(`   Total Articles: ${stats.total}`);
  console.log(`   With MDX Content: ${stats.withMDX}`);
  console.log(`   Projects: ${stats.projects}`);
  console.log(`   Blogs: ${stats.blogs}`);
  console.log(`📁 Output: ${outputFile}`);

  return stats;
}

// Generate unified MDX index
generateUnifiedMDXIndex();
console.log("\n🎉 Unified MDX index generated successfully!");
