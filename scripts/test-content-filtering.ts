// Test script for content filtering functionality
import {
  filterProjects,
  getCategories,
  getTags,
  getDifficulties,
  getTechnologies,
  searchProjects,
  getProjectsByCategory,
  getProjectsByTag,
  getProjectsByDifficulty,
  getFeaturedProjects,
} from "../src/lib/content-filtering";

console.log("🔍 Testing Content Filtering System...\n");

try {
  // Test 1: Get all available filter options
  console.log("📊 Available Filter Options:");
  const categories = getCategories();
  const tags = getTags();
  const difficulties = getDifficulties();
  const technologies = getTechnologies();

  console.log(
    `   📂 Categories: ${categories.length} - ${categories.join(", ")}`
  );
  console.log(`   🏷️ Tags: ${tags.length} - ${tags.join(", ")}`);
  console.log(
    `   📈 Difficulties: ${difficulties.length} - ${difficulties.join(", ")}`
  );
  console.log(
    `   🛠️ Technologies: ${technologies.length} - ${technologies.join(", ")}`
  );

  // Test 2: Filter by category
  console.log("\n📂 Filter by Category:");
  categories.forEach((category) => {
    const results = getProjectsByCategory(category);
    console.log(`   📂 ${category}: ${results.length} projects`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 3: Filter by tags
  console.log("\n🏷️ Filter by Tags:");
  tags.forEach((tag) => {
    const results = getProjectsByTag(tag);
    console.log(`   🏷️ ${tag}: ${results.length} projects`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 4: Filter by difficulty
  console.log("\n📈 Filter by Difficulty:");
  difficulties.forEach((difficulty) => {
    const results = getProjectsByDifficulty(
      difficulty as "beginner" | "intermediate" | "advanced" | "expert"
    );
    console.log(`   📈 ${difficulty}: ${results.length} projects`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 5: Search functionality
  console.log("\n🔍 Search Functionality:");
  const searchTerms = ["RPG", "React", "Gaming", "Analysis"];
  searchTerms.forEach((term) => {
    const results = searchProjects(term);
    console.log(`   🔍 "${term}": ${results.length} results`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 6: Complex filtering
  console.log("\n🎯 Complex Filtering:");

  // Filter by multiple criteria
  const complexFilter = filterProjects({
    category: "Gaming",
    difficulty: "advanced",
  });
  console.log(`   🎮 Gaming + Advanced: ${complexFilter.total} projects`);
  complexFilter.projects.forEach(({ id, content }) => {
    console.log(`      • ${id} - ${content.metadata.title}`);
  });

  // Test 7: Featured projects
  console.log("\n⭐ Featured Projects:");
  const featured = getFeaturedProjects();
  console.log(`   ⭐ Featured: ${featured.length} projects`);
  featured.forEach(({ id, content }) => {
    console.log(
      `      • ${id} - ${content.metadata.title} (Order: ${
        content.metadata.featuredOrder || 0
      })`
    );
  });

  // Test 8: Technology filtering
  console.log("\n🛠️ Technology Filtering:");
  const techFilter = filterProjects({
    technologies: ["React", "TypeScript"],
  });
  console.log(`   🛠️ React + TypeScript: ${techFilter.total} projects`);
  techFilter.projects.forEach(({ id, content }) => {
    console.log(`      • ${id} - ${content.metadata.title}`);
    console.log(
      `        Technologies: ${
        content.metadata.technologies?.join(", ") || "None"
      }`
    );
  });

  // Test 9: Content statistics
  console.log("\n📈 Content Statistics:");
  const allResults = filterProjects();
  console.log(`   📊 Total Published Projects: ${allResults.total}`);
  console.log(`   📂 Categories: ${allResults.categories.length}`);
  console.log(`   🏷️ Tags: ${allResults.tags.length}`);
  console.log(`   📈 Difficulties: ${allResults.difficulties.length}`);
  console.log(`   🛠️ Technologies: ${allResults.technologies.length}`);

  // Test 10: Empty filter results
  console.log("\n🚫 Empty Filter Results:");
  const emptyResults = filterProjects({
    category: "NonExistentCategory",
    difficulty: "beginner",
  });
  console.log(
    `   🚫 Non-existent category + beginner: ${emptyResults.total} projects`
  );

  console.log("\n✅ Content Filtering Test Complete!");
  console.log("\n💡 Key Benefits:");
  console.log("   • Easy project discovery by category, tags, difficulty");
  console.log("   • Powerful search across titles, descriptions, and metadata");
  console.log("   • Complex filtering with multiple criteria");
  console.log("   • Featured project highlighting");
  console.log("   • Technology-based filtering for skill showcase");
} catch (error) {
  console.error("❌ Error testing content filtering:", error);
}
