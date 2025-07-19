// Test script for content analytics functionality
import {
  generateContentAnalytics,
  getCategoryAnalytics,
  getContentInsights,
  getContentRecommendations,
} from "../src/lib/content-analytics";

console.log("📊 Testing Content Analytics System...\n");

try {
  // Test 1: Generate comprehensive analytics
  console.log("📈 Comprehensive Content Analytics:");
  const analytics = generateContentAnalytics();

  console.log(`   📊 Total Projects: ${analytics.totalProjects}`);
  console.log(`   ⏱️ Total Read Time: ${analytics.totalReadTime} minutes`);
  console.log(`   📖 Average Read Time: ${analytics.averageReadTime} minutes`);

  console.log("\n   📂 Categories:");
  analytics.categories.forEach((cat) => {
    console.log(
      `      📂 ${cat.name}: ${cat.count} projects, ${cat.totalReadTime}min total, ${cat.averageReadTime}min avg`
    );
  });

  console.log("\n   📈 Difficulties:");
  analytics.difficulties.forEach((diff) => {
    console.log(
      `      📈 ${diff.level}: ${diff.count} projects, ${diff.totalReadTime}min total, ${diff.averageReadTime}min avg`
    );
  });

  console.log("\n   🛠️ Top Technologies:");
  analytics.technologies.slice(0, 5).forEach((tech) => {
    console.log(`      🛠️ ${tech.name}: ${tech.count} projects`);
  });

  console.log("\n   🏷️ Top Tags:");
  analytics.tags.slice(0, 5).forEach((tag) => {
    console.log(`      🏷️ ${tag.name}: ${tag.count} projects`);
  });

  console.log("\n   ⭐ Top Projects by Read Time:");
  analytics.topProjects.forEach((project, index) => {
    console.log(
      `      ${index + 1}. ${project.title} (${project.readTime}min, ${
        project.category
      }, ${project.difficulty})`
    );
  });

  // Test 2: Category-specific analytics
  console.log("\n📂 Category-Specific Analytics:");
  analytics.categories.forEach((category) => {
    const categoryAnalytics = getCategoryAnalytics(category.name);
    if (categoryAnalytics) {
      console.log(`\n   📂 ${category.name}:`);
      console.log(`      📊 Projects: ${categoryAnalytics.projectCount}`);
      console.log(
        `      ⏱️ Total Read Time: ${categoryAnalytics.totalReadTime} minutes`
      );
      console.log(
        `      📖 Average Read Time: ${categoryAnalytics.averageReadTime} minutes`
      );

      console.log(`      📈 Difficulties:`);
      categoryAnalytics.difficulties.forEach((diff) => {
        console.log(`         • ${diff.level}: ${diff.count} projects`);
      });

      console.log(`      🛠️ Technologies:`);
      categoryAnalytics.technologies.slice(0, 3).forEach((tech) => {
        console.log(`         • ${tech.name}: ${tech.count} projects`);
      });

      console.log(`      🏷️ Tags:`);
      categoryAnalytics.tags.slice(0, 3).forEach((tag) => {
        console.log(`         • ${tag.name}: ${tag.count} projects`);
      });

      console.log(`      📄 Projects:`);
      categoryAnalytics.projects.forEach((project) => {
        console.log(
          `         • ${project.title} (${project.readTime}min, ${project.difficulty})`
        );
      });
    }
  });

  // Test 3: Content insights
  console.log("\n💡 Content Insights:");
  const insights = getContentInsights();

  console.log(`   📊 Total Content: ${insights.totalContent} projects`);
  console.log(`   ⏱️ Total Read Time: ${insights.totalReadTime} minutes`);
  console.log(`   📖 Average Read Time: ${insights.averageReadTime} minutes`);
  console.log(`   📂 Most Popular Category: ${insights.mostPopularCategory}`);
  console.log(`   🏷️ Most Popular Tag: ${insights.mostPopularTag}`);
  console.log(`   🛠️ Most Used Technology: ${insights.mostUsedTechnology}`);
  console.log(`   📖 Longest Read: ${insights.longestRead}`);

  console.log(`   🌈 Content Diversity:`);
  console.log(`      📂 Categories: ${insights.contentDiversity.categories}`);
  console.log(`      🏷️ Tags: ${insights.contentDiversity.tags}`);
  console.log(
    `      🛠️ Technologies: ${insights.contentDiversity.technologies}`
  );
  console.log(
    `      📈 Difficulties: ${insights.contentDiversity.difficulties}`
  );

  // Test 4: Content recommendations
  console.log("\n🎯 Content Recommendations:");
  analytics.topProjects.forEach((project) => {
    const recommendations = getContentRecommendations(project.id);
    if (recommendations.length > 0) {
      console.log(`\n   💡 Recommendations for "${project.title}":`);
      recommendations.forEach((rec, index) => {
        console.log(
          `      ${index + 1}. ${rec.content.metadata.title} (Score: ${
            rec.score
          })`
        );
        console.log(`         Reason: ${rec.reason}`);
      });
    }
  });

  // Test 5: Content distribution analysis
  console.log("\n📊 Content Distribution Analysis:");

  console.log(`   📂 By Category:`);
  Object.entries(analytics.contentDistribution.byCategory).forEach(
    ([category, count]) => {
      const percentage = Math.round((count / analytics.totalProjects) * 100);
      console.log(`      📂 ${category}: ${count} projects (${percentage}%)`);
    }
  );

  console.log(`   📈 By Difficulty:`);
  Object.entries(analytics.contentDistribution.byDifficulty).forEach(
    ([difficulty, count]) => {
      const percentage = Math.round((count / analytics.totalProjects) * 100);
      console.log(`      📈 ${difficulty}: ${count} projects (${percentage}%)`);
    }
  );

  console.log(`   🛠️ By Technology:`);
  Object.entries(analytics.contentDistribution.byTechnology).forEach(
    ([tech, count]) => {
      const percentage = Math.round((count / analytics.totalProjects) * 100);
      console.log(`      🛠️ ${tech}: ${count} projects (${percentage}%)`);
    }
  );

  // Test 6: Performance metrics
  console.log("\n📈 Performance Metrics:");

  const totalReadTimeHours =
    Math.round((analytics.totalReadTime / 60) * 10) / 10;
  const averageReadTimeMinutes = analytics.averageReadTime;

  console.log(`   ⏱️ Total Content Duration: ${totalReadTimeHours} hours`);
  console.log(
    `   📖 Average Engagement: ${averageReadTimeMinutes} minutes per project`
  );
  console.log(
    `   📊 Content Density: ${Math.round(
      analytics.totalReadTime / analytics.totalProjects
    )} minutes per project`
  );

  // Calculate content variety score
  const varietyScore =
    analytics.categories.length * 0.3 +
    analytics.tags.length * 0.2 +
    analytics.technologies.length * 0.3 +
    analytics.difficulties.length * 0.2;
  console.log(
    `   🌈 Content Variety Score: ${Math.round(varietyScore * 10) / 10}/10`
  );

  console.log("\n✅ Content Analytics Test Complete!");
  console.log("\n💡 Key Benefits:");
  console.log("   • Understand content performance and engagement");
  console.log("   • Identify popular categories, tags, and technologies");
  console.log("   • Track content diversity and variety");
  console.log("   • Generate content recommendations for visitors");
  console.log("   • Optimize portfolio based on analytics insights");
} catch (error) {
  console.error("❌ Error testing content analytics:", error);
}
