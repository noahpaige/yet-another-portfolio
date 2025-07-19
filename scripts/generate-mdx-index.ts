import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "src", "projects");
const OUTPUT_FILE = path.join(
  process.cwd(),
  "src",
  "generated",
  "mdx-index.ts"
);

// Ensure the generated directory exists
const generatedDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Get all project directories
const projectDirs = fs
  .readdirSync(PROJECTS_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// TypeScript interfaces
const interfaces = `
export interface MDXMetadata {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  [key: string]: string | string[] | undefined;
}

export interface MDXContent {
  metadata: MDXMetadata;
  content: string;
}

export interface ProjectWithMDX {
  id: string;
  mdxContent: MDXContent | null;
}
`;

// Generate the index file content
let indexContent = `// This file is auto-generated. Do not edit manually.
// Run: npm run generate-mdx-index

${interfaces}

// MDX content for all projects
export const mdxContent: Record<string, MDXContent | null> = {
`;

// Parse and collect all MDX content
const mdxData: Record<
  string,
  {
    metadata: Record<string, string | string[] | undefined>;
    content: string;
  } | null
> = {};

projectDirs.forEach((projectDir) => {
  const mdxPath = path.join(PROJECTS_DIR, projectDir, "content.mdx");

  if (fs.existsSync(mdxPath)) {
    try {
      const fileContent = fs.readFileSync(mdxPath, "utf8");
      const { data, content } = matter(fileContent);

      mdxData[projectDir] = {
        metadata: data,
        content: content.trim(),
      };

      console.log(`✅ Processed MDX for: ${projectDir}`);
    } catch (error) {
      console.error(`❌ Error processing MDX for ${projectDir}:`, error);
      mdxData[projectDir] = null;
    }
  } else {
    console.log(`⚠️ No MDX file found for: ${projectDir}`);
    mdxData[projectDir] = null;
  }
});

// Add all MDX content to the index
Object.entries(mdxData).forEach(([projectId, mdxContent], index) => {
  if (mdxContent) {
    indexContent += `  "${projectId}": ${JSON.stringify(mdxContent, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : "  " + line))
      .join("\n")}${index < Object.keys(mdxData).length - 1 ? "," : ""}\n`;
  } else {
    indexContent += `  "${projectId}": null${
      index < Object.keys(mdxData).length - 1 ? "," : ""
    }\n`;
  }
});

indexContent += `};

// Helper function to get MDX content by project ID
export function getMDXContent(projectId: string): MDXContent | null {
  return mdxContent[projectId] || null;
}

// Get all projects that have MDX content
export function getProjectsWithMDX(): string[] {
  return Object.entries(mdxContent)
    .filter(([_, content]) => content !== null)
    .map(([projectId, _]) => projectId);
}

// Get all MDX content as array
export function getAllMDXContent(): Array<{ id: string; content: MDXContent }> {
  return Object.entries(mdxContent)
    .filter(([_, content]) => content !== null)
    .map(([projectId, content]) => ({
      id: projectId,
      content: content as MDXContent
    }));
}
`;

// Write the generated file
fs.writeFileSync(OUTPUT_FILE, indexContent);

const projectsWithMDX = Object.values(mdxData).filter(
  (content) => content !== null
).length;
const totalProjects = Object.keys(mdxData).length;

console.log(
  `✅ Generated MDX index with ${projectsWithMDX}/${totalProjects} projects having MDX content`
);
console.log(`📁 Output: ${OUTPUT_FILE}`);
