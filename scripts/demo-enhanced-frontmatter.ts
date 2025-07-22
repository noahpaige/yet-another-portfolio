// Demo script for enhanced frontmatter capabilities
import { getAllProjectMDX } from "../src/lib/mdx";

console.log("🎯 Enhanced Frontmatter Demo\n");

try {
  const projectsWithMDX = getAllProjectMDX();

  console.log("📊 Project Statistics:");
  console.log(`   Total Projects: ${projectsWithMDX.length}`);

  const projectsWithEnhancedMetadata = projectsWithMDX.filter((project) => {
    const readTime = project.mdxContent?.metadata.readTime;
    return typeof readTime === "number" && readTime > 5;
  });

  console.log(
    `   Projects with Enhanced Metadata: ${projectsWithEnhancedMetadata.length}`
  );

  console.log("\n🔍 Enhanced Projects:");
  projectsWithEnhancedMetadata.forEach((project) => {
    const metadata = project.mdxContent?.metadata;
    if (metadata) {
      const title =
        typeof metadata.title === "string" ? metadata.title : "Unknown";
      const description =
        typeof metadata.description === "string"
          ? metadata.description
          : "No description";
      const readTime =
        typeof metadata.readTime === "number" ? metadata.readTime : 0;
      const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
      const date =
        typeof metadata.date === "string" ? metadata.date : "Unknown";

      console.log(`\n   📄 ${title}`);
      console.log(`      📝 Description: ${description}`);
      console.log(`      ⏱️ Read Time: ${readTime} minutes`);
      console.log(`      🏷️ Tags: ${tags.join(", ") || "None"}`);
      console.log(`      📅 Date: ${date}`);
    }
  });

  console.log("\n📈 Content Analysis:");
  const allMetadata = projectsWithMDX
    .map((p) => p.mdxContent?.metadata)
    .filter(Boolean);

  const totalReadTime = allMetadata.reduce((sum, m) => {
    const readTime = typeof m?.readTime === "number" ? m.readTime : 0;
    return sum + readTime;
  }, 0);
  const avgReadTime = totalReadTime / allMetadata.length;
  const allTags = new Set<string>();
  allMetadata.forEach((m) => {
    if (Array.isArray(m?.tags)) {
      m.tags.forEach((tag) => {
        if (typeof tag === "string") {
          allTags.add(tag);
        }
      });
    }
  });

  console.log(`   Total Read Time: ${totalReadTime} minutes`);
  console.log(`   Average Read Time: ${Math.round(avgReadTime)} minutes`);
  console.log(`   Unique Tags: ${allTags.size}`);

  console.log("\n🔍 Search Demo:");
  const searchTerm = "RPG";
  const searchResults = allMetadata.filter((m) => {
    const title = typeof m?.title === "string" ? m.title.toLowerCase() : "";
    const description =
      typeof m?.description === "string" ? m.description.toLowerCase() : "";
    const tags = Array.isArray(m?.tags) ? m.tags : [];
    const searchLower = searchTerm.toLowerCase();

    return (
      title.includes(searchLower) ||
      description.includes(searchLower) ||
      tags.some(
        (tag: unknown) =>
          typeof tag === "string" && tag.toLowerCase().includes(searchLower)
      )
    );
  });

  console.log(`   Search for "${searchTerm}": ${searchResults.length} results`);
  searchResults.forEach((m) => {
    console.log(`      - ${m?.title} (${m?.readTime}min read)`);
  });

  console.log("\n✅ Enhanced Frontmatter Demo Complete!");
} catch (error) {
  console.error("❌ Error in demo:", error);
}
