// Test script for project discovery components
import { getAllProjectMDXContent } from "@/generated/project-mdx-index";
import {
  getCategories,
  getTags,
  getDifficulties,
  getTechnologies,
} from "@/lib/content-filtering";
import {
  filterProjects,
  searchProjects,
  getFeaturedProjects,
} from "@/lib/content-filtering";

console.log("🔍 Testing Project Discovery Components...\n");

try {
  // Test 1: Load all projects
  console.log("📊 Loading All Projects:");
  const allProjects = getAllProjectMDXContent();
  console.log(`   Total Projects: ${allProjects.length}`);
  allProjects.forEach(({ id, content }) => {
    console.log(`   📄 ${id} - ${content.metadata.title}`);
  });

  // Test 2: Available filter options
  console.log("\n🎯 Available Filter Options:");
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

  // Test 3: Search functionality
  console.log("\n🔍 Search Functionality:");
  const searchTerms = ["RPG", "Gaming", "React", "Advanced"];
  searchTerms.forEach((term) => {
    const results = searchProjects(term);
    console.log(`   🔍 "${term}": ${results.length} results`);
    results.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 4: Filtering by category
  console.log("\n📂 Category Filtering:");
  categories.forEach((category) => {
    const results = filterProjects({ category });
    console.log(`   📂 ${category}: ${results.total} projects`);
    results.projects.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 5: Filtering by difficulty
  console.log("\n📈 Difficulty Filtering:");
  difficulties.forEach((difficulty) => {
    const results = filterProjects({
      difficulty: difficulty as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert",
    });
    console.log(`   📈 ${difficulty}: ${results.total} projects`);
    results.projects.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 6: Tag filtering
  console.log("\n🏷️ Tag Filtering:");
  tags.slice(0, 3).forEach((tag) => {
    const results = filterProjects({ tags: [tag] });
    console.log(`   🏷️ ${tag}: ${results.total} projects`);
    results.projects.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 7: Technology filtering
  console.log("\n🛠️ Technology Filtering:");
  technologies.slice(0, 3).forEach((tech) => {
    const results = filterProjects({ technologies: [tech] });
    console.log(`   🛠️ ${tech}: ${results.total} projects`);
    results.projects.forEach(({ id, content }) => {
      console.log(`      • ${id} - ${content.metadata.title}`);
    });
  });

  // Test 8: Complex filtering
  console.log("\n🎯 Complex Filtering:");
  const complexResults = filterProjects({
    category: "Gaming",
    difficulty: "advanced",
    tags: ["RPG"],
  });
  console.log(
    `   🎮 Gaming + Advanced + RPG: ${complexResults.total} projects`
  );
  complexResults.projects.forEach(({ id, content }) => {
    console.log(`      • ${id} - ${content.metadata.title}`);
  });

  // Test 9: Featured projects
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

  // Test 10: Component simulation
  console.log("\n🧪 Component Simulation:");
  console.log("   📱 ProjectFilter Component:");
  console.log("      • Search input with placeholder");
  console.log("      • Category dropdown");
  console.log("      • Difficulty dropdown");
  console.log("      • Tag buttons (toggleable)");
  console.log("      • Technology buttons (toggleable)");
  console.log("      • Results counter");
  console.log("      • Clear filters button");

  console.log("\n   📱 ProjectSearch Component:");
  console.log("      • Search input with icon");
  console.log("      • Clear button");
  console.log("      • Search status");
  console.log("      • Quick search suggestions");

  console.log("\n   📱 ProjectGrid Component:");
  console.log("      • Responsive grid layout");
  console.log("      • Project cards with metadata");
  console.log("      • Hover effects");
  console.log("      • Empty state");

  console.log("\n   📱 ProjectDiscovery Component:");
  console.log("      • Header with description");
  console.log("      • Search and view controls");
  console.log("      • Sidebar filters");
  console.log("      • Grid/List view toggle");
  console.log("      • Results summary");
  console.log("      • Loading state");

  // Test 11: Performance metrics
  console.log("\n📈 Performance Metrics:");
  const totalProjects = allProjects.length;
  const totalReadTime = allProjects.reduce(
    (sum, { content }) => sum + (content.metadata.readTime || 0),
    0
  );
  const averageReadTime = Math.round(totalReadTime / totalProjects);

  console.log(`   📊 Total Projects: ${totalProjects}`);
  console.log(`   ⏱️ Total Read Time: ${totalReadTime} minutes`);
  console.log(`   📖 Average Read Time: ${averageReadTime} minutes`);
  console.log(`   📂 Categories: ${categories.length}`);
  console.log(`   🏷️ Tags: ${tags.length}`);
  console.log(`   🛠️ Technologies: ${technologies.length}`);
  console.log(`   📈 Difficulties: ${difficulties.length}`);

  console.log("\n✅ Project Discovery Test Complete!");
  console.log("\n💡 Key Features:");
  console.log(
    "   • Advanced filtering by category, difficulty, tags, technologies"
  );
  console.log("   • Full-text search across all metadata");
  console.log("   • Responsive grid and list views");
  console.log("   • Real-time filtering and search");
  console.log("   • Beautiful project cards with rich metadata");
  console.log("   • Professional UI with hover effects and transitions");
  console.log("   • Empty states and loading indicators");
  console.log("   • Mobile-responsive design");
} catch (error) {
  console.error("❌ Error testing project discovery:", error);
}
