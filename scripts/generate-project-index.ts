import fs from "fs";
import path from "path";

const PROJECTS_DIR = path.join(process.cwd(), "src", "projects");
const OUTPUT_FILE = path.join(
  process.cwd(),
  "src",
  "generated",
  "project-index.ts"
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

// Generate the index file content
let indexContent = `// This file is auto-generated. Do not edit manually.
// Run: npm run generate-project-index

import type { HSLColor } from "@/components/animated-background";

export interface ProjectTemplateConfig {
  templateId: string;
  colorPairs?: [HSLColor, HSLColor][];
}

export interface Project {
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
  timestamp: string;
  featured: boolean;
  featuredOrder?: number;
  template?: ProjectTemplateConfig;
}

// All projects sorted by timestamp (newest first)
export const projects: Project[] = [
`;

// Parse and collect all projects
const allProjects: Array<{
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
  timestamp: string;
  featured: boolean;
  featuredOrder?: number;
  template?: {
    templateId: string;
    colorPairs?: Array<[{ h: number; s: number; l: number }, { h: number; s: number; l: number }]>;
  };
}> = [];

projectDirs.forEach((projectDir) => {
  const indexPath = path.join(PROJECTS_DIR, projectDir, "index.ts");
  if (fs.existsSync(indexPath)) {
    const projectData = fs.readFileSync(indexPath, "utf8");
    // Extract the export default object
    const match = projectData.match(/export default\s*({[\s\S]*?});/);
    if (match) {
      try {
        // Evaluate the object to get the actual data
        const projectObject = eval(`(${match[1]})`);
        allProjects.push(projectObject);
      } catch (error) {
        console.error(`Error parsing project ${projectDir}:`, error);
      }
    }
  }
});

// Sort all projects by timestamp (newest first)
allProjects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Add all projects to the index
allProjects.forEach((project, index) => {
  indexContent += `  ${JSON.stringify(project, null, 2).split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n')}${
    index < allProjects.length - 1 ? "," : ""
  }\n`;
});

indexContent += `];

// Featured projects sorted by featuredOrder
export const featuredProjects: Project[] = projects
  .filter(p => p.featured)
  .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
  .slice(0, 6); // Limit to 6 featured projects

export const projectIds = projects.map(p => p.id);

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}
`;

// Write the generated file
fs.writeFileSync(OUTPUT_FILE, indexContent);

console.log(`✅ Generated project index with ${allProjects.length} projects`);
console.log(`⭐ Featured projects: ${allProjects.filter(p => p.featured).length}`);
console.log(`📁 Output: ${OUTPUT_FILE}`);
