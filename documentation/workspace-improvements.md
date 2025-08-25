# Workspace Improvements Guide - Yet Another Portfolio

_Inspired by the wisdom of Wes Bos and Scott Tolinski from the Syntax Podcast_

## 🎯 Cursor Rules & AI Configuration (HIGHEST PRIORITY)

### Setting Up Your Cursor Rules

Create a `.cursorrules` file in your project root with these essential rules:

```markdown
# Cursor Rules for Yet Another Portfolio

## Project Context

- This is a Next.js 15 portfolio website with MDX content management
- Uses TypeScript, Tailwind CSS, Framer Motion, and Radix UI
- Content is statically generated at build time (no dynamic MDX processing)
- Follows a unified articles system for projects and blogs

## Code Style & Standards

- Use TypeScript strict mode (already configured)
- Follow React 19 best practices with hooks
- Prefer functional components over class components
- Use proper TypeScript interfaces and discriminated unions
- Maintain consistent naming: camelCase for variables, PascalCase for components

## Architecture Patterns

- Keep components small and focused (single responsibility)
- Use proper separation of concerns (components, hooks, lib, types)
- Prefer composition over inheritance
- Implement proper error boundaries and loading states
- Use React.memo() sparingly, only when performance profiling shows benefits

## Content Management

- All content goes in src/articles/ with proper frontmatter
- Use the unified articles system for type safety
- Run content generation scripts before dev/build
- MDX content requires rebuild/redeploy for updates

## Performance & Accessibility

- Implement proper lazy loading for images and components
- Use semantic HTML and ARIA labels
- Optimize animations with Framer Motion
- Implement proper keyboard navigation
- Use intersection observers for performance

## Testing & Quality

- Write meaningful component documentation
- Test content generation scripts regularly
- Validate MDX frontmatter schemas
- Check accessibility compliance
- Monitor bundle size and performance

## AI Assistant Behavior

- When suggesting changes, explain the reasoning
- Provide ranked lists of possible solutions
- Focus on workspace improvements over code changes
- Suggest incremental improvements rather than rewrites
- Always consider the build-time content generation workflow
```

### Cursor Settings Optimization

1. **Enable TypeScript Strict Mode** (already done ✅)
2. **Configure Auto-Import**: Ensure `@/*` path mapping works correctly
3. **Set Up Snippets**: Create custom snippets for common patterns
4. **Configure Format on Save**: Use Prettier with your existing config
5. **Enable Inline Error Display**: Show TypeScript errors inline

## 🚀 Workspace Structure & Organization (HIGH PRIORITY)

### 1. Add Missing Configuration Files

#### `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### `.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{ts,tsx,js,jsx,json,md,mdx}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 2. Improve Scripts Organization

#### Current Issue

Your `package.json` scripts are good but could be better organized. Consider grouping them:

```json
{
  "scripts": {
    "dev": "npm run generate-article-index && npm run generate-mdx-index && next dev",
    "build": "npm run generate-article-index && npm run generate-mdx-index && next build",
    "start": "next start",
    "lint": "next lint",

    "content:generate": "npm run generate-article-index && npm run generate-mdx-index",
    "content:article-index": "tsx scripts/generate-article-index.ts",
    "content:mdx-index": "tsx scripts/generate-mdx-index.ts",

    "test:all": "npm run test:enhanced-frontmatter && npm run test:unified-system && npm run test:performance",
    "test:enhanced-frontmatter": "tsx scripts/test-enhanced-frontmatter.ts",
    "test:unified-system": "tsx scripts/test-unified-article-system.ts",
    "test:performance": "tsx scripts/test-performance.ts",
    "test:content-filtering": "tsx scripts/test-content-filtering.ts",
    "test:seo-metadata": "tsx scripts/test-seo-metadata.ts"
  }
}
```

### 3. Add Development Tools

#### Install Essential Dev Dependencies

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev husky lint-staged
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

## 🔧 Development Environment Setup (HIGH PRIORITY)

### 1. Enhanced ESLint Configuration

Your current ESLint config is good, but could be enhanced:

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    plugins: {
      "react-hooks": reactHooks,
      "@typescript-eslint": typescript,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
```

### 2. Add Pre-commit Hooks

#### `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:all
```

#### `lint-staged.config.js`

```javascript
module.exports = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{md,mdx,json}": ["prettier --write"],
};
```

## 📁 Project Structure Improvements (MEDIUM PRIORITY)

### 1. Add Missing Directories

```
src/
├── __tests__/           # Test files
├── types/               # Global type definitions (move from app/)
├── constants/           # Global constants (move from app/)
├── utils/               # Utility functions (move from lib/)
└── styles/              # Additional styling (if needed)
```

### 2. Improve Scripts Organization

Move your scripts to a more organized structure:

```
scripts/
├── content/             # Content generation scripts
│   ├── generate-article-index.ts
│   └── generate-mdx-index.ts
├── testing/             # Test scripts
│   ├── test-enhanced-frontmatter.ts
│   ├── test-unified-article-system.ts
│   └── test-performance.ts
└── utils/               # Utility scripts
    └── demo-enhanced-frontmatter.ts
```

## 🎨 UI/UX Development Workflow (MEDIUM PRIORITY)

### 1. Add Storybook for Component Development

```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
npx storybook@latest init
```

### 2. Add Component Testing

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### 3. Add Visual Regression Testing

```bash
npm install --save-dev @percy/cli
```

## 📊 Performance & Monitoring (MEDIUM PRIORITY)

### 1. Add Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

#### `next.config.ts` enhancement:

```typescript
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // ... existing config

  // Add bundle analyzer in development
  ...(process.env.ANALYZE === "true" && {
    experimental: {
      bundlePagesExternals: true,
    },
  }),
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
```

### 2. Add Performance Monitoring

```bash
npm install --save-dev web-vitals
```

## 🔍 Content Development Workflow (MEDIUM PRIORITY)

### 1. Add Content Validation Scripts

Create scripts to validate your MDX frontmatter:

```typescript
// scripts/validate-content.ts
import { validateArticle } from "../src/lib/enhanced-frontmatter";

// Validate all articles and report issues
```

### 2. Add Content Preview System

Consider adding a development-only content preview system that doesn't require full rebuilds.

## 🚀 Deployment & CI/CD (LOW PRIORITY)

### 1. Add GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint
      - run: npm run test:all
      - run: npm run build
```

### 2. Add Environment Variable Management

Create `.env.example` and document all required environment variables.

## 📚 Documentation Improvements (LOW PRIORITY)

### 1. Add API Documentation

Use TypeDoc or similar to generate API documentation from your TypeScript interfaces.

### 2. Add Component Storybook

Document all your components with Storybook stories.

## 🎯 Implementation Priority Order

1. **IMMEDIATE** (This Week):
   - Create `.cursorrules` file
   - Add `.prettierrc` and `.editorconfig`
   - Install essential dev dependencies

2. **HIGH** (Next 2 Weeks):
   - Enhanced ESLint configuration
   - Pre-commit hooks setup
   - Improved scripts organization

3. **MEDIUM** (Next Month):
   - Storybook setup
   - Component testing
   - Bundle analysis
   - Content validation scripts

4. **LOW** (Next Quarter):
   - GitHub Actions CI/CD
   - Performance monitoring
   - Advanced documentation

## 💡 Wes & Scott's Favorite Tips

### From Wes:

- "Always use TypeScript strict mode" ✅ (You're already doing this!)
- "Pre-commit hooks save lives" (We'll add these)
- "Storybook is essential for component development" (We'll add this)

### From Scott:

- "ESLint rules should be strict but helpful" (We'll enhance this)
- "Bundle analysis prevents bloat" (We'll add this)
- "Automated testing catches regressions" (We'll add this)

## 🎉 Expected Outcomes

After implementing these improvements:

- **Faster Development**: Better AI assistance, pre-commit hooks, improved tooling
- **Higher Quality**: Enhanced linting, testing, and validation
- **Better DX**: Storybook, improved scripts, better organization
- **Performance**: Bundle analysis, monitoring, optimization tools
- **Maintainability**: Better structure, documentation, and testing

Remember: These improvements follow the "Syntax way" - practical, developer-friendly, and focused on real productivity gains rather than over-engineering. Start with the immediate items and work your way down the priority list!
