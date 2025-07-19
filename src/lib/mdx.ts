import matter from "gray-matter";
import fs from "fs";
import path from "path";

// TypeScript interfaces for MDX metadata
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

/**
 * Read and parse MDX content from a project directory
 */
export async function getProjectMDXContent(
  projectId: string
): Promise<MDXContent | null> {
  try {
    const projectPath = path.join(process.cwd(), "src", "projects", projectId);
    const mdxPath = path.join(projectPath, "content.mdx");

    // Check if MDX file exists
    if (!fs.existsSync(mdxPath)) {
      console.log(`MDX file not found for project: ${projectId}`);
      return null;
    }

    // Read the MDX file
    const fileContent = fs.readFileSync(mdxPath, "utf8");

    // Parse frontmatter and content
    const { data, content } = matter(fileContent);

    return {
      metadata: data as MDXMetadata,
      content: content.trim(),
    };
  } catch (error) {
    console.error(`Error reading MDX content for project ${projectId}:`, error);
    return null;
  }
}

/**
 * Test function to verify MDX integration
 */
export async function testMDXIntegration() {
  const testProjects = ["masters-thesis", "control"];

  for (const projectId of testProjects) {
    console.log(`\n--- Testing ${projectId} ---`);
    const mdxContent = await getProjectMDXContent(projectId);

    if (mdxContent) {
      console.log("✅ MDX file found and parsed");
      console.log("📄 Metadata:", mdxContent.metadata);
      console.log(
        "📝 Content length:",
        mdxContent.content.length,
        "characters"
      );
    } else {
      console.log("❌ MDX file not found or failed to parse");
    }
  }
}
