## 📝 Requirements: MDX Article Post Rendering (React + Tailwind)

We are building a system to render Articles authored in MDX. The main goal is to support author-friendly `.mdx` content that renders correctly in the React app, with light layout styling and support for metadata like titles, dates, and slugs.

right now, this will be used only for the my projects, but in the future I want to add a blog component to my app. The "projects" in my app are coding projects in my portfolio.

### ✅ Core Functional Requirements

1. **Render `.mdx` Files in a React App**
   - Accept `.mdx` files stored locally (e.g., in `posts/`)
   - Render their content into a styled Article layout
   - Support JSX embedded inside markdown

2. **Custom Article Layout**
   - Extend/repurpose `article-layout.tsx` to give some common layout to all articles
   - create a <main> tag in this component that we will put the mdx inside of.
   - try to keep this file mostly as-is, just add mdx support

3. **MDX Integration**
   - Use `next-mdx-remote` library
   - Support custom React components in MDX (e.g., `<Callout>`, `<Image>`)
   - Enable passing components via `MDXProvider`

---

### ✳️ Optional Enhancements (Final Steps)

5. **Frontmatter Support**
   - Allow each `.mdx` file to start with a frontmatter block (YAML format)
   - Fields might include: `title`, `date`, `description`, `tags`, `slug`
   - Parse frontmatter with a library like `gray-matter`

6. **Metadata Extraction**
   - Dynamically load all `.mdx` files in a `posts/` directory
   - Extract frontmatter from each and build a post metadata index
   - Use this index to render article cards, lists, or previews elsewhere in the app

---

## 🚧 Next Step: Create an Implementation Plan

Before diving into code, let's define an **implementation plan** that breaks this into small, verifiable steps. This will help ensure clarity and prevent rework.

---

## 🎯 Implementation Plan: MDX Article System

### Phase 1: Foundation Setup (Steps 1-3)

**Step 1: Install Dependencies**

- Install `next-mdx-remote` for MDX rendering
- Install `gray-matter` for frontmatter parsing
- Verify TypeScript compatibility

**Step 2: Adapt Existing Project Structure for MDX**

- Use existing `src/projects/` directory structure
- Replace `content.tsx` files with `content.mdx` files in each project folder
- Keep existing `index.ts` files for project metadata
- Test MDX integration with one existing project

**Step 3: Create MDX Utilities**

- Create `src/lib/mdx.ts` for MDX processing utilities
- Implement `getProjectMDXContent()` function to read and parse project MDX files
- Add TypeScript interfaces for project MDX metadata
- Integrate with existing project index system

### Phase 2: Core MDX Integration (Steps 4-6)

**Step 4: Extend Article Layout Component**

- Modify `src/components/articles/article-layout.tsx`
- Add `<main>` tag wrapper for MDX content
- Ensure existing styling and animations remain intact
- Test with existing project content

**Step 5: Create MDX Renderer Component**

- Create `src/components/mdx/mdx-renderer.tsx`
- Implement MDX rendering with `next-mdx-remote`
- Add basic component mapping (paragraphs, headings, lists)
- Test rendering of sample MDX content

**Step 6: Create MDX Provider**

- Create `src/components/mdx/mdx-provider.tsx`
- Set up custom component mapping for MDX
- Add support for custom components like `<Callout>`, `<Image>`
- Test custom component rendering

### Phase 3: Content Management (Steps 7-9)

**Step 7: Implement Frontmatter Support**

- Add frontmatter parsing to MDX utilities
- Create interfaces for metadata (title, date, description, tags, slug)
- Test frontmatter extraction from sample files

**Step 8: Create Content Indexing System**

- Implement `getAllProjectMDX()` function to scan projects directory
- Extract metadata from existing `index.ts` files and MDX content
- Create sorted index by timestamp (using existing project metadata)
- Test with existing project structure

**Step 9: Create Project List Component**

- Create `src/components/mdx/project-list.tsx`
- Display list of available projects with metadata
- Add filtering and sorting capabilities
- Test with existing project data

### Phase 4: Integration & Testing (Steps 10-12)

**Step 10: Integrate with Existing Project System**

- Modify existing project pages to use MDX content instead of `content.tsx`
- Update project routing to support MDX files while maintaining existing URLs
- Test integration with current project structure and navigation

**Step 11: Add Custom MDX Components**

- Create reusable components for MDX content
- Implement `<Callout>`, `<Image>`, `<CodeBlock>` components
- Add styling that matches existing design system
- Test component usage in MDX files

**Step 12: Performance & Optimization**

- Implement lazy loading for MDX content
- Add caching for parsed MDX files
- Optimize bundle size for MDX dependencies
- Test performance with larger MDX files

### Phase 5: Polish & Documentation (Steps 13-14)

**Step 13: Error Handling & Edge Cases**

- Add error boundaries for MDX rendering
- Handle missing files and malformed frontmatter
- Add fallback content for broken MDX
- Test error scenarios

**Step 14: Documentation & Examples**

- Create documentation for MDX authoring
- Add examples of custom components
- Document frontmatter schema
- Create sample MDX files for reference

---

## 📋 Success Criteria

Each step should be **verifiable** before moving to the next:

- ✅ Dependencies installed and working
- ✅ MDX files can be read and parsed from projects directory
- ✅ Content renders correctly in existing layout
- ✅ Custom components work in MDX
- ✅ Project metadata from index.ts files is preserved
- ✅ Integration with existing project system works
- ✅ Performance is acceptable
- ✅ Error handling is robust

---

## 🚀 Getting Started

**Next Action**: Begin with Step 1 - Install Dependencies

This plan breaks down the MDX integration into manageable, testable chunks while preserving the existing project structure and design system.
