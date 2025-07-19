import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface ContentTypeConfig {
  name: string;
  sourceDir: string;
  outputFile: string;
  interfaceName: string;
}

// Configuration for different content types
const contentTypes: ContentTypeConfig[] = [
  {
    name: "projects",
    sourceDir: "src/projects",
    outputFile: "src/generated/project-mdx-index.ts",
    interfaceName: "Project",
  },
  // Future: Add blog configuration here
  // {
  //   name: "blog",
  //   sourceDir: "src/blog",
  //   outputFile: "src/generated/blog-mdx-index.ts",
  //   interfaceName: "BlogPost"
  // }
];

// Ensure the generated directory exists
const generatedDir = path.join(process.cwd(), "src", "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

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

export interface ${contentTypes[0].interfaceName}WithMDX {
  id: string;
  mdxContent: MDXContent | null;
}
`;

function generateMDXIndex(config: ContentTypeConfig) {
  const { name, sourceDir, outputFile, interfaceName } = config;

  const sourcePath = path.join(process.cwd(), sourceDir);

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

  // Generate the index file content
  let indexContent = `// This file is auto-generated. Do not edit manually.
// Run: npm run generate-mdx-index

${interfaces}

// MDX content for all ${name}
export const ${name}MDXContent: Record<string, MDXContent | null> = {
`;

  // Parse and collect all MDX content
  const mdxData: Record<
    string,
    {
      metadata: Record<string, string | string[] | undefined>;
      content: string;
    } | null
  > = {};

  contentDirs.forEach((contentDir) => {
    const mdxPath = path.join(sourcePath, contentDir, "content.mdx");

    if (fs.existsSync(mdxPath)) {
      try {
        const fileContent = fs.readFileSync(mdxPath, "utf8");
        const { data, content } = matter(fileContent);

        mdxData[contentDir] = {
          metadata: data,
          content: content.trim(),
        };

        console.log(`✅ Processed MDX for: ${contentDir}`);
      } catch (error) {
        console.error(`❌ Error processing MDX for ${contentDir}:`, error);
        mdxData[contentDir] = null;
      }
    } else {
      console.log(`⚠️ No MDX file found for: ${contentDir}`);
      mdxData[contentDir] = null;
    }
  });

  // Add all MDX content to the index
  Object.entries(mdxData).forEach(([contentId, mdxContent], index) => {
    if (mdxContent) {
      indexContent += `  "${contentId}": ${JSON.stringify(mdxContent, null, 2)
        .split("\n")
        .map((line, i) => (i === 0 ? line : "  " + line))
        .join("\n")}${index < Object.keys(mdxData).length - 1 ? "," : ""}\n`;
    } else {
      indexContent += `  "${contentId}": null${
        index < Object.keys(mdxData).length - 1 ? "," : ""
      }\n`;
    }
  });

  indexContent += `};

// Helper function to get MDX content by ${name.slice(0, -1)} ID
export function get${interfaceName}MDXContent(${name.slice(
    0,
    -1
  )}Id: string): MDXContent | null {
  return ${name}MDXContent[${name.slice(0, -1)}Id] || null;
}

// Get all ${name} that have MDX content
export function get${interfaceName}sWithMDX(): string[] {
  return Object.entries(${name}MDXContent)
    .filter(([_, content]) => content !== null)
    .map(([${name.slice(0, -1)}Id, _]) => ${name.slice(0, -1)}Id);
}

// Get all MDX content as array
export function getAll${interfaceName}MDXContent(): Array<{ id: string; content: MDXContent }> {
  return Object.entries(${name}MDXContent)
    .filter(([_, content]) => content !== null)
    .map(([${name.slice(0, -1)}Id, content]) => ({
      id: ${name.slice(0, -1)}Id,
      content: content as MDXContent
    }));
}
`;

  // Write the generated file
  fs.writeFileSync(outputFile, indexContent);

  const contentWithMDX = Object.values(mdxData).filter(
    (content) => content !== null
  ).length;
  const totalContent = Object.keys(mdxData).length;

  console.log(
    `✅ Generated ${name} MDX index with ${contentWithMDX}/${totalContent} ${name} having MDX content`
  );
  console.log(`📁 Output: ${outputFile}`);
}

// Generate MDX indexes for all content types
console.log("🚀 Generating MDX indexes...\n");

contentTypes.forEach((config) => {
  console.log(`--- Generating ${config.name} MDX index ---`);
  generateMDXIndex(config);
  console.log("");
});

console.log("🎉 All MDX indexes generated!");
