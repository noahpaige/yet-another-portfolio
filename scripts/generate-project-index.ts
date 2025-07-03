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
  template?: ProjectTemplateConfig;
}

export const projects: Project[] = [
`;

// Add each project
projectDirs.forEach((projectDir, index) => {
  const indexPath = path.join(PROJECTS_DIR, projectDir, "index.ts");
  if (fs.existsSync(indexPath)) {
    const projectData = fs.readFileSync(indexPath, "utf8");
    // Extract the export default object
    const match = projectData.match(/export default\s*({[\s\S]*?});/);
    if (match) {
      indexContent += `  ${match[1]}${
        index < projectDirs.length - 1 ? "," : ""
      }\n`;
    }
  }
});

indexContent += `];

export const projectIds = projects.map(p => p.id);

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}
`;

// Write the generated file
fs.writeFileSync(OUTPUT_FILE, indexContent);

console.log(`✅ Generated project index with ${projectDirs.length} projects`);
console.log(`📁 Output: ${OUTPUT_FILE}`);
