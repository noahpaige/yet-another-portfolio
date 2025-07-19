import fs from "fs";
import path from "path";

interface ContentTypeConfig {
  name: string;
  sourceDir: string;
  outputFile: string;
  interfaceName: string;
  additionalFields?: Record<string, string | undefined>;
}

// Configuration for different content types
const contentTypes: ContentTypeConfig[] = [
  {
    name: "projects",
    sourceDir: "src/projects",
    outputFile: "src/generated/project-index.ts",
    interfaceName: "Project",
    additionalFields: {
      importType:
        "import type { HSLColor } from '@/components/animated-background';",
      extraFields: "colorPairs?: [HSLColor, HSLColor][];",
    },
  },
  // Future: Add blog configuration here
  // {
  //   name: "blog",
  //   sourceDir: "src/blog",
  //   outputFile: "src/generated/blog-index.ts",
  //   interfaceName: "BlogPost",
  //   additionalFields: {
  //     extraFields: "author?: string; readTime?: number;"
  //   }
  // }
];

// Ensure the generated directory exists
const generatedDir = path.join(process.cwd(), "src", "generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

function generateContentIndex(config: ContentTypeConfig) {
  const { name, sourceDir, outputFile, interfaceName, additionalFields } =
    config;

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
// Run: npm run generate-content-index

${additionalFields?.importType || ""}

export interface ${interfaceName} {
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
  timestamp: string;
  featured: boolean;
  featuredOrder?: number;
  ${additionalFields?.extraFields || ""}
}

// All ${name} sorted by timestamp (newest first)
export const ${name}: ${interfaceName}[] = [
`;

  // Parse and collect all content
  const allContent: Array<{
    id: string;
    title: string;
    tags: string[];
    image: string;
    imageAltText: string;
    timestamp: string;
    featured: boolean;
    featuredOrder?: number;
    colorPairs?: Array<
      [{ h: number; s: number; l: number }, { h: number; s: number; l: number }]
    >;
  }> = [];

  contentDirs.forEach((contentDir) => {
    const indexPath = path.join(sourcePath, contentDir, "index.ts");
    if (fs.existsSync(indexPath)) {
      const contentData = fs.readFileSync(indexPath, "utf8");
      // Extract the export default object
      const match = contentData.match(/export default\s*({[\s\S]*?});/);
      if (match) {
        try {
          // Evaluate the object to get the actual data
          const contentObject = eval(`(${match[1]})`);

          // Extract colorPairs from template config if it exists
          if (contentObject.template?.colorPairs) {
            contentObject.colorPairs = contentObject.template.colorPairs;
          }

          // Remove template field
          delete contentObject.template;

          allContent.push(contentObject);
        } catch (error) {
          console.error(`Error parsing ${name} ${contentDir}:`, error);
        }
      }
    }
  });

  // Sort all content by timestamp (newest first)
  allContent.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Add all content to the index
  allContent.forEach((content, index) => {
    indexContent += `  ${JSON.stringify(content, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : "  " + line))
      .join("\n")}${index < allContent.length - 1 ? "," : ""}\n`;
  });

  indexContent += `];

// Featured ${name} sorted by featuredOrder
export const featured${
    name.charAt(0).toUpperCase() + name.slice(1)
  }: ${interfaceName}[] = ${name}
  .filter(p => p.featured)
  .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
  .slice(0, 6); // Limit to 6 featured ${name}

export const ${name}Ids = ${name}.map(p => p.id);

// Helper function to get ${name.slice(0, -1)} by ID
export function get${interfaceName}ById(id: string): ${interfaceName} | undefined {
  return ${name}.find(p => p.id === id);
}
`;

  // Write the generated file
  fs.writeFileSync(outputFile, indexContent);

  console.log(`✅ Generated ${name} index with ${allContent.length} ${name}`);
  console.log(
    `⭐ Featured ${name}: ${allContent.filter((p) => p.featured).length}`
  );
  console.log(`📁 Output: ${outputFile}`);
}

// Generate indexes for all content types
console.log("🚀 Generating content indexes...\n");

contentTypes.forEach((config) => {
  console.log(`--- Generating ${config.name} index ---`);
  generateContentIndex(config);
  console.log("");
});

console.log("🎉 All content indexes generated!");
