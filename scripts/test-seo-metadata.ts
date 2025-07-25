// Test script for SEO metadata validation
import { articles } from "../src/generated/article-index";
import { getArticleMDXContent } from "../src/generated/article-mdx-index";

console.log("🔍 SEO Metadata Validation Test\n");

interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
}

function validateSEOMetadata(seo: SEOMetadata, articleId: string): boolean {
  let isValid = true;

  // Validate title
  if (seo.title !== undefined && typeof seo.title !== "string") {
    console.log(
      `   ❌ Invalid SEO title type for ${articleId}: ${typeof seo.title}`
    );
    isValid = false;
  }

  // Validate description
  if (seo.description !== undefined && typeof seo.description !== "string") {
    console.log(
      `   ❌ Invalid SEO description type for ${articleId}: ${typeof seo.description}`
    );
    isValid = false;
  }

  // Validate keywords
  if (seo.keywords !== undefined && !Array.isArray(seo.keywords)) {
    console.log(
      `   ❌ Invalid SEO keywords type for ${articleId}: ${typeof seo.keywords}`
    );
    isValid = false;
  }

  // Validate image
  if (seo.image !== undefined && typeof seo.image !== "string") {
    console.log(
      `   ❌ Invalid SEO image type for ${articleId}: ${typeof seo.image}`
    );
    isValid = false;
  }

  // Validate canonical
  if (seo.canonical !== undefined && typeof seo.canonical !== "string") {
    console.log(
      `   ❌ Invalid SEO canonical type for ${articleId}: ${typeof seo.canonical}`
    );
    isValid = false;
  }

  return isValid;
}

try {
  // Test 1: SEO Metadata Availability
  console.log("📊 Test 1: SEO Metadata Availability");

  const articlesWithSEO = articles.filter((article) => {
    const mdxContent = getArticleMDXContent(article.id);
    return mdxContent?.metadata.seo !== undefined;
  });

  console.log(`   Total Articles: ${articles.length}`);
  console.log(`   Articles with SEO: ${articlesWithSEO.length}`);
  console.log(
    `   SEO Coverage: ${(
      (articlesWithSEO.length / articles.length) *
      100
    ).toFixed(1)}%`
  );

  if (articlesWithSEO.length > 0) {
    console.log("   ✅ Some articles have SEO metadata configured");
  } else {
    console.log("   ℹ️ No articles have SEO metadata (optional feature)");
  }

  // Test 2: SEO Metadata Validation
  console.log("\n🔍 Test 2: SEO Metadata Validation");

  let allSEOValid = true;
  const seoDetails: Array<{
    id: string;
    seo: SEOMetadata;
    hasCustomTitle: boolean;
    hasCustomDescription: boolean;
  }> = [];

  articles.forEach((article) => {
    const mdxContent = getArticleMDXContent(article.id);
    if (mdxContent?.metadata.seo) {
      const seo = mdxContent.metadata.seo as SEOMetadata;

      if (!validateSEOMetadata(seo, article.id)) {
        allSEOValid = false;
      }

      seoDetails.push({
        id: article.id,
        seo,
        hasCustomTitle: !!seo.title,
        hasCustomDescription: !!seo.description,
      });
    }
  });

  if (allSEOValid) {
    console.log("   ✅ All SEO metadata is valid");
  } else {
    console.log("   ❌ Some SEO metadata has validation errors");
  }

  // Test 3: SEO Configuration Analysis
  console.log("\n📈 Test 3: SEO Configuration Analysis");

  if (seoDetails.length > 0) {
    const customTitles = seoDetails.filter((d) => d.hasCustomTitle).length;
    const customDescriptions = seoDetails.filter(
      (d) => d.hasCustomDescription
    ).length;
    const withKeywords = seoDetails.filter(
      (d) => d.seo.keywords && d.seo.keywords.length > 0
    ).length;
    const withImages = seoDetails.filter((d) => d.seo.image).length;
    const withCanonical = seoDetails.filter((d) => d.seo.canonical).length;

    console.log(`   Custom Titles: ${customTitles}/${seoDetails.length}`);
    console.log(
      `   Custom Descriptions: ${customDescriptions}/${seoDetails.length}`
    );
    console.log(`   With Keywords: ${withKeywords}/${seoDetails.length}`);
    console.log(`   With Custom Images: ${withImages}/${seoDetails.length}`);
    console.log(
      `   With Canonical URLs: ${withCanonical}/${seoDetails.length}`
    );

    // Show detailed breakdown
    console.log("\n   📋 SEO Configuration Details:");
    seoDetails.forEach(({ id, seo, hasCustomTitle, hasCustomDescription }) => {
      console.log(`   ${id}:`);
      if (hasCustomTitle) console.log(`     Title: "${seo.title}"`);
      if (hasCustomDescription)
        console.log(
          `     Description: "${seo.description?.substring(0, 60)}..."`
        );
      if (seo.keywords && seo.keywords.length > 0)
        console.log(`     Keywords: ${seo.keywords.length} keywords`);
      if (seo.image) console.log(`     Image: ${seo.image}`);
      if (seo.canonical) console.log(`     Canonical: ${seo.canonical}`);
    });
  } else {
    console.log("   ℹ️ No SEO metadata found to analyze");
  }

  // Test 4: SEO Best Practices Check
  console.log("\n✅ Test 4: SEO Best Practices Check");

  if (seoDetails.length > 0) {
    const bestPractices = seoDetails.map(({ id, seo }) => {
      const issues: string[] = [];

      // Check for overly long titles
      if (seo.title && seo.title.length > 60) {
        issues.push(`Title too long (${seo.title.length} chars, max 60)`);
      }

      // Check for overly long descriptions
      if (seo.description && seo.description.length > 160) {
        issues.push(
          `Description too long (${seo.description.length} chars, max 160)`
        );
      }

      // Check for missing keywords
      if (!seo.keywords || seo.keywords.length === 0) {
        issues.push("No keywords specified");
      }

      // Check for missing custom image
      if (!seo.image) {
        issues.push("No custom social media image");
      }

      return { id, issues };
    });

    const articlesWithIssues = bestPractices.filter((p) => p.issues.length > 0);

    if (articlesWithIssues.length === 0) {
      console.log("   ✅ All articles with SEO follow best practices");
    } else {
      console.log(
        `   ⚠️ ${articlesWithIssues.length} articles have SEO best practice issues:`
      );
      articlesWithIssues.forEach(({ id, issues }) => {
        console.log(`   ${id}:`);
        issues.forEach((issue) => console.log(`     - ${issue}`));
      });
    }
  } else {
    console.log("   ℹ️ No SEO metadata to check for best practices");
  }

  console.log("\n🎉 SEO Metadata Validation Complete!");
} catch (error) {
  console.error("❌ Error during SEO metadata validation:", error);
  process.exit(1);
}
