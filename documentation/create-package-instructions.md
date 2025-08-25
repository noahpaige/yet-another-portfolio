# Creating and Sharing NPM Packages

A comprehensive guide to creating, developing, and publishing npm packages with TypeScript, Tailwind CSS, and shadcn/ui components.

## Table of Contents

1. [Package Planning & Structure](#package-planning--structure)
2. [Initial Setup](#initial-setup)
3. [TypeScript Configuration](#typescript-configuration)
4. [Package.json Configuration](#packagejson-configuration)
5. [Source Code Organization](#source-code-organization)
6. [UI Package Best Practices](#ui-package-best-practices)
7. [shadcn/ui Component Integration](#shadcnui-component-integration)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Documentation](#documentation)
10. [Build & Distribution](#build--distribution)
11. [Publishing](#publishing)
12. [Maintenance & Updates](#maintenance--updates)

## Package Planning & Structure

### Before You Start

- **Define the scope**: What problem does your package solve?
- **Research existing packages**: Avoid duplicating functionality
- **Plan the API**: Design a clean, intuitive interface
- **Consider maintenance**: Will you have time to maintain this long-term?

### Package Types

1. **Utility packages**: Helper functions, utilities, data structures
2. **UI component libraries**: React components, design systems
3. **Framework integrations**: Plugins, adapters, middleware
4. **CLI tools**: Command-line utilities and generators

### Recommended Structure

```
my-package/
├── src/                    # Source code
│   ├── components/         # React components (if applicable)
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── index.ts           # Main entry point
├── dist/                   # Built output (generated)
├── examples/               # Usage examples
├── docs/                   # Documentation
├── tests/                  # Test files
├── .github/                # GitHub workflows
├── .gitignore
├── .npmignore
├── package.json
├── tsconfig.json
├── tailwind.config.js      # If using Tailwind
├── postcss.config.js       # If using PostCSS
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Initial Setup

### 1. Create Package Directory

```bash
mkdir my-package
cd my-package
npm init -y
```

### 2. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### 3. Create Essential Files

```bash
touch README.md CHANGELOG.md LICENSE .gitignore .npmignore
```

### 4. Install Development Dependencies

```bash
npm install --save-dev typescript @types/node
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm install --save-dev rollup @rollup/plugin-typescript @rollup/plugin-commonjs
npm install --save-dev @rollup/plugin-node-resolve rollup-plugin-dts
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "examples"]
}
```

### Build Configuration

Create `rollup.config.js` for bundling:

```javascript
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external: ["react", "react-dom"], // Add your peer dependencies
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
```

## Package.json Configuration

### Essential Fields

```json
{
  "name": "@your-scope/package-name",
  "version": "1.0.0",
  "description": "Clear description of what your package does",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "CHANGELOG.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "prepublishOnly": "npm run build && npm run test:run",
    "clean": "rimraf dist"
  },
  "keywords": ["relevant", "keywords", "for", "discovery"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/repo.git"
  },
  "bugs": {
    "url": "https://github.com/username/repo/issues"
  },
  "homepage": "https://github.com/username/repo#readme",
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "devDependencies": {
    // ... development dependencies
  }
}
```

### Entry Points

- **main**: CommonJS bundle for Node.js
- **module**: ES modules for bundlers
- **types**: TypeScript declaration files
- **exports**: Modern package exports (recommended for new packages)

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    "./styles": "./dist/styles.css"
  }
}
```

## Source Code Organization

### File Structure

```
src/
├── index.ts               # Main entry point
├── components/            # React components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── index.ts
├── utils/                 # Utility functions
│   ├── helpers.ts
│   ├── constants.ts
│   └── index.ts
├── types/                 # Type definitions
│   ├── common.ts
│   ├── components.ts
│   └── index.ts
├── styles/                # CSS/styling
│   ├── globals.css
│   └── components.css
└── hooks/                 # Custom React hooks
    ├── useLocalStorage.ts
    └── index.ts
```

### Index Files

Create barrel exports for clean imports:

```typescript
// src/components/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Input } from "./Input";

// src/index.ts
export * from "./components";
export * from "./utils";
export * from "./types";
export * from "./hooks";
```

## UI Package Best Practices

### Component Design Principles

1. **Composition over configuration**: Build flexible, composable components
2. **Controlled vs uncontrolled**: Support both patterns where appropriate
3. **Accessibility first**: Include proper ARIA labels and keyboard navigation
4. **Theme support**: Allow customization through CSS variables or theme objects
5. **Performance**: Use React.memo, useMemo, and useCallback appropriately

### Component Structure

```typescript
// src/components/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ButtonProps } from './Button.types';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### Types and Interfaces

```typescript
// src/components/Button/Button.types.ts
import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}
```

### Utility Functions

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## shadcn/ui Component Integration

### File Structure Alignment

Follow the exact shadcn/ui structure for consistency:

```
src/components/ui/
├── button/
│   ├── button.tsx
│   └── button.test.tsx
├── card/
│   ├── card.tsx
│   ├── card-header.tsx
│   ├── card-title.tsx
│   ├── card-description.tsx
│   ├── card-content.tsx
│   └── card-footer.tsx
└── index.ts
```

### Component Patterns

1. **Forward refs**: Always use `forwardRef` for DOM elements
2. **Variant props**: Use discriminated unions for variants
3. **Size props**: Consistent sizing system (sm, md, lg, xl)
4. **ClassName merging**: Use utility functions for class merging
5. **Accessibility**: Include proper ARIA attributes and roles

### Example shadcn-style Component

```typescript
// src/components/ui/card/card.tsx
import * as React from 'react';
import { cn } from '../../utils/cn';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
```

### CSS Variables

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Testing & Quality Assurance

### Testing Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm install --save-dev @testing-library/user-event
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "src/index.ts"],
    },
  },
});
```

### Test Examples

```typescript
// src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveClass('bg-destructive');
  });
});
```

### Setup Tests

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
```

## Documentation

### README.md Structure

````markdown
# Package Name

Brief description of what your package does.

## Installation

```bash
npm install package-name
# or
yarn add package-name
# or
pnpm add package-name
```
````

## Usage

```tsx
import { Button } from "package-name";

function App() {
  return <Button>Click me</Button>;
}
```

## API Reference

### Button

A customizable button component.

#### Props

| Prop     | Type                                    | Default   | Description                              |
| -------- | --------------------------------------- | --------- | ---------------------------------------- |
| variant  | 'default' \| 'destructive' \| 'outline' | 'default' | The visual style of the button           |
| size     | 'sm' \| 'md' \| 'lg'                    | 'md'      | The size of the button                   |
| children | ReactNode                               | -         | The content to display inside the button |

#### Examples

```tsx
// Default button
<Button>Click me</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Outline button with custom size
<Button variant="outline" size="lg">Large Outline</Button>
```

## Contributing

[Contributing guidelines]

## License

MIT

````

### Storybook Integration

```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
npm install --save-dev @storybook/addon-interactions @storybook/testing-library
````

```typescript
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Button",
  },
};
```

## Build & Distribution

### Build Scripts

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:types": "tsc --emitDeclarationOnly",
    "build:all": "npm run clean && npm run build && npm run build:types",
    "clean": "rimraf dist",
    "prepublishOnly": "npm run build:all && npm run test:run"
  }
}
```

### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// rollup.config.js
import { visualizer } from "rollup-plugin-visualizer";

export default [
  {
    // ... existing config
    plugins: [
      // ... existing plugins
      visualizer({
        filename: "dist/stats.html",
        open: true,
      }),
    ],
  },
];
```

### Tree Shaking Support

Ensure your package supports tree shaking:

1. **Use ES modules**: Export ES modules alongside CommonJS
2. **Avoid side effects**: Don't execute code at import time
3. **Named exports**: Prefer named exports over default exports
4. **Pure functions**: Keep functions pure and side-effect free

## Publishing

### Pre-publishing Checklist

- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Bundle size is reasonable
- [ ] Documentation is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version number is correct
- [ ] License is included
- [ ] README.md is complete

### Publishing Commands

```bash
# Login to npm (first time only)
npm login

# Check what will be published
npm pack --dry-run

# Publish
npm publish

# Publish with specific tag
npm publish --tag beta

# Update existing package
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

### Scoped Packages

```bash
# Create scoped package
npm init --scope=@your-username

# Publish scoped package
npm publish --access public
```

### GitHub Packages

```json
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

## Maintenance & Updates

### Version Management

- **Semantic Versioning**: Follow semver strictly
- **Changelog**: Keep detailed changelog for each version
- **Breaking Changes**: Document breaking changes clearly
- **Migration Guides**: Provide migration guides for major versions

### Dependency Management

- **Peer Dependencies**: Use for framework dependencies
- **Regular Updates**: Keep dependencies up to date
- **Security Audits**: Run `npm audit` regularly
- **Lock Files**: Include package-lock.json in version control

### Issue Management

- **GitHub Issues**: Use for bug reports and feature requests
- **Templates**: Create issue templates for consistency
- **Labels**: Use labels to categorize issues
- **Milestones**: Plan releases with milestones

### Release Process

1. **Feature Development**: Develop in feature branches
2. **Testing**: Ensure all tests pass
3. **Documentation**: Update docs and changelog
4. **Version Bump**: Update version number
5. **Build**: Run build process
6. **Publish**: Publish to npm
7. **Tag Release**: Create GitHub release
8. **Announce**: Share on social media/community

### Automated Workflows

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm run build
      - run: npm run test:run
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices Summary

### Code Quality

- Use TypeScript for type safety
- Follow consistent naming conventions
- Write comprehensive tests
- Use ESLint and Prettier
- Document your code

### Package Structure

- Keep components small and focused
- Use barrel exports for clean imports
- Separate concerns (components, utils, types)
- Follow established patterns (shadcn/ui)

### Performance

- Support tree shaking
- Minimize bundle size
- Use React.memo appropriately
- Lazy load when possible

### User Experience

- Provide clear documentation
- Include usage examples
- Support common use cases
- Maintain backward compatibility

### Maintenance

- Regular dependency updates
- Security audits
- Issue triage
- Community engagement

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
- [Rollup Documentation](https://rollupjs.org/)
- [Vitest Documentation](https://vitest.dev/)
