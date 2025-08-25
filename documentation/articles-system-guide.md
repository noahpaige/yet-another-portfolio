# Unified Articles System Guide

## Overview

The Unified Articles System is a sophisticated content management architecture that treats all content (projects, blogs, and future content types) as "articles" with type discrimination. This system provides a single source of truth for content metadata, unified processing pipelines, and excellent developer experience.

## Architecture

### Directory Structure

```
src/
├── articles/                    # All content lives here
│   ├── projects/               # Project articles
│   │   ├── clair-obscur/
│   │   │   └── content.mdx     # Project content with frontmatter
│   │   ├── control/
│   │   │   └── content.mdx
│   │   └── ... (other projects)
│   └── blogs/                  # Blog articles
│       └── welcome-to-my-blog/
│           └── content.mdx     # Blog content with frontmatter
├── app/                        # Next.js routes
│   ├── projects/               # Project listing and detail pages
│   └── blog/                   # Blog listing and detail pages
├── generated/                  # Auto-generated files
│   ├── article-index.ts        # Unified article metadata
│   └── article-mdx-index.ts    # Unified MDX content
└── lib/                        # Core system files
    ├── enhanced-frontmatter.ts # Schema definitions
    ├── unified-articles.ts     # Unified API
    └── content-filtering.ts    # Filtering utilities
```

### Core Concepts

#### 1. Single Source of Truth

- **Folder-based IDs**: Article ID is derived from the folder name (e.g., `clair-obscur`)
- **MDX Frontmatter**: All metadata lives in the MDX file's frontmatter
- **No Duplication**: Eliminates the old `index.ts` + frontmatter duplication

#### 2. Type Discrimination

- **Unified Base**: All articles share common properties (title, description, date, etc.)
- **Type Field**: `type: "project"` or `type: "blog"` determines specific behavior
- **Type-Specific Properties**: Projects have `image`, `imageAltText`, `colorPairs`; blogs have simpler structure

#### 3. Generated Architecture

- **Build-time Generation**: Content indexes are generated during build process
- **Type Safety**: Full TypeScript support with discriminated unions
- **Performance**: Sub-millisecond filtering and search operations

## Content Schema

### Base Article Schema (All Content Types)

```typescript
interface BaseArticle {
  id: string; // Derived from folder name
  title: string; // Article title
  description: string; // Brief description
  date: string; // YYYY-MM-DD format
  readTime: number; // Reading time in minutes
  tags: string[]; // Array of tags
  featured: boolean; // Featured status
  featuredOrder?: number; // Order in featured list
  type: "project" | "blog"; // Content type discriminator
  seo?: {
    title?: string; // Custom SEO title (overrides main title)
    description?: string; // Custom SEO description (overrides main description)
    keywords?: string[]; // Additional SEO keywords
    image?: string; // Custom image for social sharing
    canonical?: string; // Canonical URL
  };
}
```

### Project-Specific Schema

```typescript
interface ProjectArticle extends BaseArticle {
  type: "project";
  image: string; // Image filename
  imageAltText: string; // Alt text for accessibility
  colorPairs?: [HSLColor, HSLColor][]; // Optional color themes
}
```

### Blog Schema

```typescript
interface BlogArticle extends BaseArticle {
  type: "blog";
  // No additional properties beyond base schema
}
```

## Content Management Workflows

### How to Add a New Project

1. **Create Directory Structure**

   ```bash
   mkdir src/articles/projects/your-project-name
   ```

2. **Create Content File**

   ```bash
   touch src/articles/projects/your-project-name/content.mdx
   ```

3. **Add Frontmatter and Content**

   ```mdx
   ---
   title: "Your Project Title"
   description: "Brief description of your project"
   date: "2024-12-19"
   readTime: 5
   tags: ["Tag1", "Tag2", "Tag3"]
   featured: true
   featuredOrder: 1
   type: "project"
   image: "your-project-image.png"
   imageAltText: "Description of the project image"
   colorPairs:
     - ["hsl(240, 100%, 50%)", "hsl(280, 100%, 50%)"]
   seo:
     title: "Custom SEO Title for Social Media"
     description: "Custom SEO description for search engines and social sharing"
     keywords: ["keyword1", "keyword2", "keyword3"]
     image: "/custom-seo-image.png"
     canonical: "https://yourdomain.com/projects/your-project-name"
   ---

   # Your Project Content

   Write your project content here using Markdown and MDX...
   ```

4. **Add Image** (if needed)
   - Place image file in `public/` directory
   - Reference it in the `image` field

5. **Build and Test**

   ```bash
   npm run dev
   ```

   - Visit `http://localhost:3000/projects` to see your project
   - Visit `http://localhost:3000/projects/your-project-name` for individual page

### How to Add a New Blog Post

1. **Create Directory Structure**

   ```bash
   mkdir src/articles/blogs/your-blog-post-name
   ```

2. **Create Content File**

   ```bash
   touch src/articles/blogs/your-blog-post-name/content.mdx
   ```

3. **Add Frontmatter and Content**

   ```mdx
   ---
   title: "Your Blog Post Title"
   description: "Brief description of your blog post"
   date: "2024-12-19"
   readTime: 3
   tags: ["Blog", "Tag1", "Tag2"]
   featured: true
   featuredOrder: 1
   type: "blog"
   seo:
     title: "Custom SEO Title for Blog Post"
     description: "Custom SEO description for blog post"
     keywords: ["blog", "keyword1", "keyword2"]
     canonical: "https://yourdomain.com/blog/your-blog-post-name"
   ---

   # Your Blog Post Content

   Write your blog content here using Markdown and MDX...
   ```

4. **Build and Test**

   ```bash
   npm run dev
   ```

   - Visit `http://localhost:3000/blog` to see your blog post
   - Visit `http://localhost:3000/blog/your-blog-post-name` for individual page

### How to Remove a Project/Blog

1. **Delete the Directory**

   ```bash
   rm -rf src/articles/projects/project-to-remove
   # or
   rm -rf src/articles/blogs/blog-to-remove
   ```

2. **Remove Associated Images** (if any)

   ```bash
   rm public/project-image.png
   ```

3. **Rebuild**

   ```bash
   npm run dev
   ```

   - The article will automatically disappear from listings
   - Individual pages will return 404 (handled by Next.js)

### How to Add a New Metadata Property

1. **Update Schema Definition**

   ```typescript
   // In src/lib/enhanced-frontmatter.ts

   // Add to BaseFrontmatterSchema for all content types
   const BaseFrontmatterSchema = z.object({
     // ... existing fields
     newProperty: z.string().optional(), // Add your new field
   });

   // Or add to specific schemas
   const ProjectFrontmatterSchema = BaseFrontmatterSchema.extend({
     // ... existing project fields
     projectSpecificProperty: z.number().optional(),
   });

   // For SEO properties, they're already included in the base schema:
   seo: z
     .object({
       title: z.string().optional(),
       description: z.string().optional(),
       keywords: z.array(z.string()).optional(),
       image: z.string().optional(),
       canonical: z.string().optional(),
     })
     .optional(),
   ```

2. **Update TypeScript Interfaces**

   ```typescript
   // In src/lib/enhanced-frontmatter.ts

   interface BaseArticle {
     // ... existing fields
     newProperty?: string;
     seo?: {
       title?: string;
       description?: string;
       keywords?: string[];
       image?: string;
       canonical?: string;
     };
   }

   interface ProjectArticle extends BaseArticle {
     // ... existing fields
     projectSpecificProperty?: number;
   }
   ```

3. **Update Default Values** (if needed)

   ```typescript
   // In src/lib/enhanced-frontmatter.ts

   export function createDefaultProjectFrontmatter(): ProjectFrontmatter {
     return {
       // ... existing defaults
       newProperty: "default value",
     };
   }
   ```

4. **Update Content Files**
   - Add the new property to existing content files
   - Or leave as optional (undefined) if not required

5. **Rebuild**
   ```bash
   npm run dev
   ```

### How to Remove a Metadata Property

1. **Update Schema Definition**

   ```typescript
   // In src/lib/enhanced-frontmatter.ts

   // Remove from schema
   const BaseFrontmatterSchema = z.object({
     // Remove the field you want to delete
     // oldProperty: z.string(), // DELETE THIS LINE
   });
   ```

2. **Update TypeScript Interfaces**

   ```typescript
   // In src/lib/enhanced-frontmatter.ts

   interface BaseArticle {
     // Remove the field
     // oldProperty: string; // DELETE THIS LINE
   }
   ```

3. **Update Content Files**
   - Remove the property from all content files
   - Or leave it (it will be ignored if not in schema)

4. **Update Components** (if the property was used in UI)

   ```typescript
   // Remove references in components
   // const { oldProperty } = article; // DELETE THIS LINE
   ```

5. **Rebuild**
   ```bash
   npm run dev
   ```

## Generation System

### Build Process

The system automatically generates content indexes during build:

```bash
npm run dev
# Runs: npm run generate-article-index && npm run generate-mdx-index && next dev
```

### Generated Files

#### `src/generated/article-index.ts`

- Contains all article metadata
- Provides helper functions for filtering and retrieval
- Exports arrays: `articles`, `projectArticles`, `blogArticles`, `featuredArticles`

#### `src/generated/article-mdx-index.ts`

- Contains parsed MDX content
- Provides functions to access MDX content by ID
- Exports objects: `articlesMDXContent`, `projectMDXContent`, `blogMDXContent`

### Generation Scripts

#### `scripts/generate-article-index.ts`

- Scans content directories
- Extracts and validates frontmatter
- Generates TypeScript index with metadata

#### `scripts/generate-mdx-index.ts`

- Processes MDX content
- Extracts enhanced metadata
- Generates TypeScript index with MDX content

## API and Utilities

### Core Functions

#### Article Retrieval

```typescript
import {
  getArticleById,
  getFeaturedArticlesByType,
} from "@/generated/article-index";

// Get specific article
const article = getArticleById("clair-obscur");

// Get featured projects
const featuredProjects = getFeaturedArticlesByType("project");
```

#### SEO Metadata Access

```typescript
import { getArticleMDXContent } from "@/generated/article-mdx-index";

// Get SEO metadata from MDX content
const mdxContent = getArticleMDXContent("clair-obscur");
const seo = mdxContent?.metadata.seo as
  | {
      title?: string;
      description?: string;
      keywords?: string[];
      image?: string;
      canonical?: string;
    }
  | undefined;

// Use SEO metadata with fallbacks
const title = seo?.title || article.title;
const description = seo?.description || article.description;
```

#### MDX Content Access

```typescript
import { getArticleMDXContent } from "@/generated/article-mdx-index";

// Get MDX content
const mdxContent = getArticleMDXContent("clair-obscur");
```

#### Filtering and Search

```typescript
import { filterArticles, searchArticles } from "@/lib/content-filtering";

// Filter by tags
const rpgProjects = filterArticles({
  tags: ["RPG"],
  type: "project",
});

// Search across content
const searchResults = searchArticles("cyberpunk", "project");
```

### Component Integration

#### Project Cards

```typescript
import { ProjectCard } from "@/components/ui/project-card";

<ProjectCard project={article} mdxContent={mdxContent} />;
```

#### Article Filter

```typescript
import { ArticleFilter } from "@/components/projects/article-filter";

<ArticleFilter articleType="project" onFilterChange={setFilteredArticles} />;
```

## Performance Characteristics

### Build Performance

- **Content Generation**: < 1ms per article
- **Total Build Time**: ~2000ms (unchanged from before refactor)
- **Memory Usage**: < 0.01MB for full dataset

### Runtime Performance

- **Article Retrieval**: < 0.1ms
- **Filtering Operations**: < 0.2ms
- **Search Operations**: < 0.2ms
- **MDX Processing**: < 0.1ms per article

### Scalability

- **Current**: 8 articles (7 projects + 1 blog)
- **Projected**: 100+ articles with same performance
- **Memory Scaling**: Linear with content size
- **Build Time**: Minimal impact with incremental generation

## Testing and Validation

### Automated Tests

```bash
npm run test-unified-system    # Comprehensive system tests
npm run test-performance       # Performance validation
```

### Test Coverage

- ✅ Data integrity validation
- ✅ ID consistency checks
- ✅ MDX content availability
- ✅ Metadata consistency
- ✅ Filtering system functionality
- ✅ Search functionality
- ✅ Type safety validation
- ✅ Performance benchmarking

## Best Practices

### Content Organization

1. **Use Descriptive Folder Names**: Folder name becomes the URL slug
2. **Consistent Tagging**: Use consistent tag names across content
3. **Meaningful Descriptions**: Write clear, concise descriptions
4. **Proper Image Alt Text**: Ensure accessibility

### Development Workflow

1. **Add Content First**: Create MDX files before updating schemas
2. **Test Incrementally**: Test after each major change
3. **Use TypeScript**: Leverage type safety for content management
4. **Follow Naming Conventions**: Consistent naming across all content

### Performance Optimization

1. **Optimize Images**: Use appropriate image sizes and formats
2. **Limit Tag Count**: Keep tags focused and relevant
3. **Efficient Filtering**: Use specific filters rather than broad searches
4. **Regular Testing**: Run performance tests after major changes

## Troubleshooting

### Common Issues

#### Build Errors

- **Missing Required Fields**: Check frontmatter against schema
- **Invalid Date Format**: Use YYYY-MM-DD format
- **Type Mismatches**: Ensure type field matches content type

#### Content Not Appearing

- **Check Folder Structure**: Ensure content is in correct directory
- **Verify Frontmatter**: Check for syntax errors in YAML
- **Rebuild Indexes**: Run generation scripts manually

#### TypeScript Errors

- **Schema Mismatches**: Update interfaces when changing schemas
- **Import Issues**: Check import paths in generated files
- **Type Assertions**: Use proper type guards for discriminated unions

### Debug Commands

```bash
# Regenerate content indexes
npm run generate-article-index
npm run generate-mdx-index

# Run comprehensive tests
npm run test-unified-system

# Check build process
npm run build

# Validate TypeScript
npx tsc --noEmit
```

## Future Enhancements

### Potential Extensions

- **Categories**: Add category field for better organization
- **Authors**: Support for multiple authors
- **Comments**: Integration with commenting system
- **Analytics**: Content performance tracking
- **Drafts**: Support for draft content
- **Scheduling**: Future publication dates
- **Structured Data**: Enhanced JSON-LD schema markup
- **Social Media Integration**: Direct sharing capabilities

### Scalability Considerations

- **Incremental Generation**: Only regenerate changed content
- **Caching**: Implement content caching for better performance
- **CDN Integration**: Serve static content from CDN
- **Database Integration**: Move to database for very large content sets

## SEO and Social Media Integration

### Social Media Preview Cards

The system automatically generates Open Graph and Twitter Card meta tags for social media sharing:

- **Dynamic Metadata**: Each article page generates custom meta tags based on frontmatter
- **SEO Properties**: Use the `seo` object in frontmatter for custom social media previews
- **Fallback System**: Falls back to regular article metadata if SEO properties aren't specified
- **Image Support**: Custom images for social sharing with proper alt text

### Testing Social Media Previews

Use these tools to test how your content appears when shared:

- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Example SEO Configuration

```mdx
---
title: "Project Title"
description: "Project description"
seo:
  title: "Custom Title for Social Media"
  description: "Custom description for search engines and social sharing"
  keywords: ["keyword1", "keyword2", "keyword3"]
  image: "/custom-social-image.png"
  canonical: "https://yourdomain.com/projects/project-name"
---
```

## Conclusion

The Unified Articles System provides a robust, scalable, and developer-friendly foundation for content management. Its type-safe architecture, excellent performance characteristics, and comprehensive tooling make it ideal for portfolios, blogs, and other content-heavy applications.

The system successfully eliminates metadata duplication, provides unified processing for all content types, maintains excellent performance characteristics, and includes built-in SEO and social media integration while offering a simple and intuitive content management workflow.
