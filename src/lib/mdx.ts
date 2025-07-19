// Import generated MDX content (build-time)
import {
  getProjectMDXContent as getProjectMDXContentFromIndex,
  getProjectsWithMDX,
  type MDXContent,
} from "@/generated/project-mdx-index";
import {
  projects,
  getProjectById,
  type Project,
} from "@/generated/project-index";
import { type ProjectWithMDX } from "@/lib/unified-projects";

// Re-export types from generated index
export type { MDXMetadata, MDXContent } from "@/generated/mdx-index";

// Re-export unified interface
export type { UnifiedProject } from "@/lib/unified-projects";

// Interface for project metadata (from existing index.ts files)
export type ProjectMetadata = Project;

/**
 * Get MDX content for a specific project (fast, build-time data)
 */
export function getProjectMDXContent(projectId: string): MDXContent | null {
  return getProjectMDXContentFromIndex(projectId);
}

/**
 * Get project metadata from the generated index (fast, build-time data)
 */
export function getProjectMetadata(
  projectId: string
): ProjectMetadata | undefined {
  return getProjectById(projectId);
}

/**
 * Get all projects from the generated index (fast, build-time data)
 */
export function getAllProjects(): ProjectMetadata[] {
  return projects;
}

/**
 * Get featured projects from the generated index (fast, build-time data)
 */
export function getFeaturedProjects(): ProjectMetadata[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
}

/**
 * Get project with both metadata and MDX content
 */
export function getProjectWithMDX(projectId: string): ProjectWithMDX | null {
  const projectMetadata = getProjectMetadata(projectId);
  const mdxContent = getProjectMDXContent(projectId);

  if (!projectMetadata) {
    return null;
  }

  return {
    id: projectId,
    mdxContent,
    projectMetadata,
  };
}

/**
 * Get all projects with MDX content (combines fast metadata + MDX)
 */
export function getAllProjectMDX(): ProjectWithMDX[] {
  const allProjects = getAllProjects();
  const projectsWithMDX: ProjectWithMDX[] = [];

  for (const project of allProjects) {
    const mdxContent = getProjectMDXContent(project.id);
    projectsWithMDX.push({
      id: project.id,
      mdxContent,
      projectMetadata: project,
    });
  }

  return projectsWithMDX;
}

/**
 * Get all projects that have MDX content
 */
export function getProjectsWithMDXContent(): string[] {
  return getProjectsWithMDX();
}

/**
 * Test function to verify MDX integration
 */
export function testMDXIntegration() {
  console.log("🧪 Testing Build-time MDX Integration...\n");

  // Test individual project MDX
  console.log("--- Testing Individual Project MDX ---");
  const testProject = getProjectMDXContent("masters-thesis");
  if (testProject) {
    console.log("✅ MDX file found and parsed");
    console.log("📄 Title:", testProject.metadata.title);
    console.log("📝 Description:", testProject.metadata.description);
  }

  // Test project metadata
  console.log("\n--- Testing Project Metadata ---");
  const projectMetadata = getProjectMetadata("masters-thesis");
  if (projectMetadata) {
    console.log("✅ Project metadata found");
    console.log("📄 Title:", projectMetadata.title);
    console.log("🏷️ Tags:", projectMetadata.tags);
    console.log("⭐ Featured:", projectMetadata.featured);
  }

  // Test all projects
  console.log("\n--- Testing All Projects ---");
  const allProjects = getAllProjects();
  console.log(`✅ Found ${allProjects.length} projects`);

  const projectsWithMDX = getProjectsWithMDXContent();
  console.log(`✅ Found ${projectsWithMDX.length} projects with MDX content`);

  // Test featured projects
  console.log("\n--- Testing Featured Projects ---");
  const featuredProjects = getFeaturedProjects();
  console.log(`✅ Found ${featuredProjects.length} featured projects`);

  featuredProjects.forEach((project) => {
    console.log(`⭐ ${project.title} (Order: ${project.featuredOrder})`);
  });
}
