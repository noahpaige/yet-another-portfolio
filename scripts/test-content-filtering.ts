// Test script for content filtering functionality
import {
  filterArticles,
  getTags,
  searchArticles,
  getArticlesByTag,
  getFeaturedArticles,
} from "../src/lib/content-filtering";

console.log("🔍 Testing Content Filtering System...\n");

try {
  // Test 1: Get all available filter options
  console.log("📊 Available Filter Options:");
  const tags = getTags();

  console.log(`   🏷️ Tags: ${tags.length} - ${tags.join(", ")}`);

  // Test 2: Filter by tags
  console.log("\n🏷️ Filter by Tags:");
  tags.forEach((tag) => {
    const results = getArticlesByTag(tag, "project");
    console.log(`   🏷️ ${tag}: ${results.length} projects`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 5: Search functionality
  console.log("\n🔍 Search Functionality:");
  const searchTerms = ["RPG", "React", "Gaming", "Analysis"];
  searchTerms.forEach((term) => {
    const results = searchArticles(term, "project");
    console.log(`   🔍 "${term}": ${results.length} results`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 6: Featured articles
  console.log("\n⭐ Featured Articles:");
  const featured = getFeaturedArticles("project");
  console.log(`   ⭐ Featured: ${featured.length} projects`);
  featured.forEach(({ id, content }) => {
    console.log(
      `      • ${id} - ${content.metadata.title} (Order: ${
        content.metadata.featuredOrder || 0
      })`
    );
  });

  // Test 7: Content statistics
  console.log("\n📈 Content Statistics:");
  const allResults = filterArticles({ type: "project" });
  console.log(`   📊 Total Published Projects: ${allResults.total}`);
  console.log(`   🏷️ Tags: ${allResults.tags.length}`);

  // Test 8: Empty filter results
  console.log("\n🚫 Empty Filter Results:");
  const emptyResults = filterArticles({
    tags: ["NonExistentTag"],
    type: "project",
  });
  console.log(`   🚫 Non-existent tag: ${emptyResults.total} projects`);

  console.log("\n✅ Content Filtering Test Complete!");
  console.log("\n💡 Key Benefits:");
  console.log("   • Easy project discovery by tags");
  console.log("   • Powerful search across titles, descriptions, and tags");
  console.log("   • Featured project highlighting");
  console.log("   • Simplified and focused filtering system");
} catch (error) {
  console.error("❌ Error testing content filtering:", error);
}
