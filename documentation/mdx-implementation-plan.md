## 📝 Requirements: MDX Blog Post Rendering (React + Tailwind)

We are building a system to render blog posts authored in MDX. The main goal is to support author-friendly `.mdx` content that renders correctly in the React app, with light layout styling and support for metadata like titles, dates, and slugs.

### ✅ Core Functional Requirements

1. **Render `.mdx` Files in a React App**

   - Accept `.mdx` files stored locally (e.g., in `posts/`)
   - Render their content into a styled blog layout
   - Support JSX embedded inside markdown

2. **Custom Blog Layout**

   - Use a `BlogPostLayout` component to wrap the MDX content
   - Include typical blog UI like title, date, and an optional header image
   - Style using Tailwind CSS utilities (basic spacing, readable typography)

3. **No `@tailwindcss/typography` Dependency**

   - Avoid reliance on the Tailwind `prose` plugin to reduce complexity
   - Apply layout and typographic styles manually or via utility classes

4. **MDX Integration**

   - Use a library like `@mdx-js/react` or `next-mdx-remote` (if in Next.js)
   - Support custom React components in MDX (e.g., `<Callout>`, `<Image>`)
   - Enable passing components via `MDXProvider` or `components` prop

---

### ✳️ Optional Enhancements (Final Steps)

5. **Frontmatter Support**

   - Allow each `.mdx` file to start with a frontmatter block (YAML format)
   - Fields might include: `title`, `date`, `description`, `tags`, `slug`
   - Parse frontmatter with a library like `gray-matter`

6. **Metadata Extraction**

   - Dynamically load all `.mdx` files in a `posts/` directory
   - Extract frontmatter from each and build a post metadata index
   - Use this index to render blog cards, lists, or previews elsewhere in the app

---

## 🚧 Next Step: Create an Implementation Plan

Before diving into code, let’s define an **implementation plan** that breaks this into small, verifiable steps. This will help ensure clarity and prevent rework.
