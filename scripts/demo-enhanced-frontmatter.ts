// Demo script for enhanced frontmatter capabilities
import { getAllProjectMDX } from "../src/lib/mdx";

console.log("🎯 Enhanced Frontmatter Demo\n");

try {
  const projectsWithMDX = getAllProjectMDX();

  console.log("📊 Project Statistics:");
  console.log(`   Total Projects: ${projectsWithMDX.length}`);

  const projectsWithEnhancedMetadata = projectsWithMDX.filter(
    (project) =>
      project.mdxContent?.metadata.readTime &&
      project.mdxContent?.metadata.readTime > 5
  );

  console.log(
    `   Projects with Enhanced Metadata: ${projectsWithEnhancedMetadata.length}`
  );

  console.log("\n🔍 Enhanced Projects:");
  projectsWithEnhancedMetadata.forEach((project) => {
    const metadata = project.mdxContent?.metadata;
    if (metadata) {
      console.log(`\n   📄 ${metadata.title}`);
      console.log(`      📝 Description: ${metadata.description}`);
      console.log(`      ⏱️ Read Time: ${metadata.readTime} minutes`);
      console.log(`      🏷️ Tags: ${metadata.tags?.join(", ") || "None"}`);
      console.log(`      📅 Date: ${metadata.date || "Unknown"}`);
    }
  });

  console.log("\n📈 Content Analysis:");
  const allMetadata = projectsWithMDX
    .map((p) => p.mdxContent?.metadata)
    .filter(Boolean);

  const totalReadTime = allMetadata.reduce(
    (sum, m) => sum + (m?.readTime || 0),
    0
  );
  const avgReadTime = totalReadTime / allMetadata.length;
  const allTags = new Set(allMetadata.flatMap((m) => m?.tags || []));

  console.log(`   Total Read Time: ${totalReadTime} minutes`);
  console.log(`   Average Read Time: ${Math.round(avgReadTime)} minutes`);
  console.log(`   Unique Tags: ${allTags.size}`);

  console.log("\n🔍 Search Demo:");
  const searchTerm = "RPG";
  const searchResults = allMetadata.filter(
    (m) =>
      m?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m?.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  console.log(`   Search for "${searchTerm}": ${searchResults.length} results`);
  searchResults.forEach((m) => {
    console.log(`      - ${m?.title} (${m?.readTime}min read)`);
  });

  console.log("\n✅ Enhanced Frontmatter Demo Complete!");
} catch (error) {
  console.error("❌ Error in demo:", error);
}
