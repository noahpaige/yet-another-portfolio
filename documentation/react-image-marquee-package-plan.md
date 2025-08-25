# React Image Marquee NPM Package Creation Plan

## Overview

This document outlines the comprehensive plan to extract the MDXMarquee component from the portfolio project and create a standalone, publishable npm package. The React Image Marquee is a high-performance, accessible image marquee component with advanced features including smooth animations, touch controls, fullscreen viewing, and WCAG 2.1 AA compliance.

## Package Analysis

### Current Component Features

- **Core Functionality**: Infinite scrolling image gallery with momentum physics
- **Interaction**: Touch, mouse wheel, and drag controls with pause/resume
- **Performance**: Direction-based image preloading, lazy loading, intersection observer
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Advanced Features**: Fullscreen modal, swipe gestures, iOS Safari compatibility fixes
- **Animation**: Framer Motion integration, smooth transitions, momentum decay

### Dependencies Analysis

- **React 19**: Core framework dependency
- **Framer Motion**: Animation and gesture handling
- **Next.js Image**: Image optimization (needs replacement for standalone package)
- **TypeScript**: Type definitions and interfaces

## Package Structure Plan

### 1. Package Naming & Scope

```
@noahpaige/react-image-marquee
```

- **Scope**: `@noahpaige` (personal scope)
- **Name**: `react-image-marquee` (descriptive and searchable)
- **Registry**: npm (public access)

### 2. Directory Structure

```
react-image-marquee/
├── src/
│   ├── components/
│   │   └── ImageMarquee/
│   │       ├── ImageMarquee.tsx
│   │       ├── ImageMarquee.types.ts
│   │       ├── ImageMarquee.test.tsx
│   │       ├── ImageMarquee.stories.tsx
│   │       └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── marquee.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   └── index.ts
├── dist/                    # Built output
├── examples/                # Usage examples
├── docs/                    # Documentation
├── tests/                   # Test files
├── .github/                 # GitHub workflows
├── .gitignore
├── .npmignore
├── package.json
├── tsconfig.json
├── rollup.config.js         # Build configuration
├── vitest.config.ts         # Test configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## Implementation Plan

### Phase 1: Package Foundation (Week 1)

#### 1.1 Package Initialization

```bash
# Create package directory
mkdir react-image-marquee
cd react-image-marquee
npm init -y

# Initialize Git repository
git init
git add .
git commit -m "Initial commit: React Image Marquee package foundation"
```

#### 1.2 Core Dependencies Installation

```bash
# Production dependencies
npm install framer-motion

# Development dependencies
npm install --save-dev typescript @types/node
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm install --save-dev rollup @rollup/plugin-typescript @rollup/plugin-commonjs
npm install --save-dev @rollup/plugin-node-resolve rollup-plugin-dts
npm install --save-dev tailwindcss postcss autoprefixer
npm install --save-dev @storybook/react @storybook/addon-essentials
```

#### 1.3 Configuration Files Creation

- `tsconfig.json` - TypeScript configuration
- `rollup.config.js` - Build bundling
- `vitest.config.ts` - Testing configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration

### Phase 2: Component Extraction & Refactoring (Week 2)

#### 2.1 Component Extraction

- Extract `MDXMarquee.tsx` from portfolio project and rename to `ImageMarquee.tsx`
- Remove Next.js specific dependencies (Image component)
- Replace with standard HTML `<img>` or create image wrapper component
- Extract type definitions to separate files
- Extract constants and utility functions

#### 2.2 Image Component Replacement Strategy

**Option A: Standard HTML Image**

- Replace `next/image` with `<img>` tag
- Maintain blur placeholder functionality using CSS
- Add loading states and error handling

**Option B: Custom Image Wrapper**

- Create lightweight image component with lazy loading
- Support blur placeholders and loading states
- Maintain performance optimizations

**Option C: Framework Agnostic**

- Accept image component as prop
- Allow users to pass their preferred image component
- Default to standard HTML image

**Recommended**: Option C for maximum flexibility

#### 2.3 Type Definitions Extraction

```typescript
// src/types/marquee.ts
export interface MarqueeImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  captionText?: string;
  placeholder?: string;
}

export interface ImageMarqueeProps {
  images: MarqueeImage[];
  speed?: number;
  gap?: number;
  className?: string;
  height?: number;
  preloadDistance?: number;
  // New props for package flexibility
  imageComponent?: React.ComponentType<any>;
  theme?: "light" | "dark" | "auto";
  onImageClick?: (image: MarqueeImage, index: number) => void;
}
```

#### 2.4 Constants & Utilities Extraction

```typescript
// src/utils/constants.ts
export const DEFAULT_SPEED = 50;
export const DEFAULT_GAP = 20;
export const DEFAULT_HEIGHT = 300;
export const DEFAULT_PRELOAD_DISTANCE = 500;
export const MAX_SPEED_MULTIPLIER = 20;
export const MOMENTUM_DECAY_RATE = 0.1;
export const MOMENTUM_TRANSFER = 0.8;
export const MIN_VELOCITY_THRESHOLD = 50;

// src/utils/helpers.ts
export const calculateTotalWidth = (images: MarqueeImage[], gap: number) => {
  return images.reduce((acc, image) => {
    const imgWidth = image.width || 300;
    return acc + imgWidth + gap;
  }, 0);
};
```

### Phase 3: Build System & Distribution (Week 3)

#### 3.1 Rollup Configuration

```javascript
// rollup.config.js
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
    external: ["react", "react-dom", "framer-motion"],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
```

#### 3.2 Package.json Configuration

```json
{
  "name": "@noahpaige/react-image-marquee",
  "version": "1.0.0",
  "description": "High-performance, accessible React image marquee component with smooth animations, touch controls, and fullscreen viewing",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md", "CHANGELOG.md", "LICENSE"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    "./styles": "./dist/styles.css"
  },
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
    "clean": "rimraf dist",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "framer-motion": "^12.9.2"
  },
  "keywords": [
    "react",
    "marquee",
    "carousel",
    "image-gallery",
    "touch-controls",
    "accessibility",
    "framer-motion",
    "typescript"
  ]
}
```

#### 3.3 CSS & Styling Strategy

- Extract Tailwind classes to CSS variables
- Create theme system (light/dark/auto)
- Provide CSS-in-JS alternative for non-Tailwind users
- Support custom CSS class injection

### Phase 4: Testing & Quality Assurance (Week 4)

#### 4.1 Testing Strategy

```typescript
// src/components/ImageMarquee/ImageMarquee.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ImageMarquee } from './ImageMarquee';

describe('ImageMarquee', () => {
  const mockImages = [
    { src: '/test1.jpg', alt: 'Test Image 1', width: 300, height: 200 },
    { src: '/test2.jpg', alt: 'Test Image 2', width: 300, height: 200 },
  ];

  it('renders images correctly', () => {
    render(<ImageMarquee images={mockImages} />);
    expect(screen.getByAltText('Test Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test Image 2')).toBeInTheDocument();
  });

  it('handles touch interactions', async () => {
    const user = userEvent.setup();
    render(<ImageMarquee images={mockImages} />);
    // Test touch interactions
  });

  it('opens fullscreen modal on image click', async () => {
    const user = userEvent.setup();
    render(<ImageMarquee images={mockImages} />);
    // Test fullscreen functionality
  });
});
```

#### 4.2 Accessibility Testing

- Screen reader compatibility
- Keyboard navigation testing
- WCAG 2.1 AA compliance validation
- Touch gesture testing on mobile devices

#### 4.3 Performance Testing

- Bundle size analysis
- Runtime performance metrics
- Memory usage optimization
- Touch interaction responsiveness

### Phase 5: Documentation & Examples (Week 5)

#### 5.1 README.md Structure

- Installation instructions
- Basic usage examples
- Advanced configuration
- API reference
- Accessibility features
- Performance considerations
- Contributing guidelines

#### 5.2 Storybook Integration

```typescript
// src/components/ImageMarquee/ImageMarquee.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ImageMarquee } from "./ImageMarquee";

const meta: Meta<typeof ImageMarquee> = {
  title: "Components/ImageMarquee",
  component: ImageMarquee,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    speed: { control: { type: "range", min: 10, max: 200, step: 10 } },
    gap: { control: { type: "range", min: 0, max: 100, step: 5 } },
    height: { control: { type: "range", min: 200, max: 600, step: 50 } },
    theme: { control: { type: "select" }, options: ["light", "dark", "auto"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: [
      { src: "/sample1.jpg", alt: "Sample 1", width: 300, height: 200 },
      { src: "/sample2.jpg", alt: "Sample 2", width: 300, height: 200 },
      { src: "/sample3.jpg", alt: "Sample 3", width: 300, height: 200 },
    ],
  },
};

export const FastScrolling: Story = {
  args: {
    ...Default.args,
    speed: 100,
  },
};

export const LargeGap: Story = {
  args: {
    ...Default.args,
    gap: 50,
  },
};
```

#### 5.3 Code Examples

- Basic implementation
- Custom image components
- Theme customization
- Event handling
- Performance optimization tips

### Phase 6: Publishing & Distribution (Week 6)

#### 6.1 Pre-publishing Checklist

- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Bundle size is reasonable (< 100KB gzipped)
- [ ] Documentation is complete
- [ ] CHANGELOG.md is updated
- [ ] License is included
- [ ] README.md is comprehensive

#### 6.2 Publishing Commands

```bash
# Login to npm
npm login

# Check package contents
npm pack --dry-run

# Publish package
npm publish --access public

# Create GitHub release
git tag v1.0.0
git push origin v1.0.0
```

#### 6.3 Post-publishing Tasks

- Monitor package downloads and feedback
- Respond to issues and feature requests
- Plan future updates and improvements
- Engage with community

## Technical Considerations

### 1. Framework Compatibility

- **React 18+**: Primary target
- **React 19**: Full compatibility
- **Next.js**: Optional integration examples
- **Vite/CRA**: Standard React setup support

### 2. Bundle Size Optimization

- Tree shaking support
- Dynamic imports for heavy features
- CSS extraction and optimization
- Dead code elimination

### 3. Performance Features

- Intersection Observer for lazy loading
- RequestAnimationFrame for smooth animations
- Touch event optimization
- Memory leak prevention

### 4. Accessibility Features

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## Risk Assessment & Mitigation

### 1. High Risk: Next.js Image Dependency

**Risk**: Component heavily depends on Next.js Image component
**Mitigation**: Create framework-agnostic image wrapper with fallbacks

### 2. Medium Risk: Framer Motion Bundle Size

**Risk**: Framer Motion adds significant bundle size
**Mitigation**: Make it a peer dependency, provide lightweight alternatives

### 3. Medium Risk: Touch Gesture Complexity

**Risk**: Complex touch interactions may not work on all devices
**Mitigation**: Extensive testing, fallback behaviors, progressive enhancement

### 4. Low Risk: TypeScript Configuration

**Risk**: TypeScript setup complexity
**Mitigation**: Follow established patterns, use recommended configurations

## Success Metrics

### 1. Technical Metrics

- Bundle size < 100KB gzipped
- Zero accessibility violations
- 100% test coverage
- < 100ms touch response time

### 2. User Experience Metrics

- Intuitive API design
- Comprehensive documentation
- Working examples
- Responsive support

### 3. Community Metrics

- GitHub stars and forks
- npm weekly downloads
- Positive user feedback
- Active issue resolution

## Timeline Summary

| Week | Phase         | Deliverables                                              |
| ---- | ------------- | --------------------------------------------------------- |
| 1    | Foundation    | Package structure, dependencies, configuration            |
| 2    | Extraction    | Component refactoring, type definitions, utilities        |
| 3    | Build System  | Rollup config, package.json, CSS strategy                 |
| 4    | Testing       | Unit tests, accessibility tests, performance tests        |
| 5    | Documentation | README, Storybook, examples, API docs                     |
| 6    | Publishing    | Package publication, GitHub release, community engagement |

## Next Steps

1. **Immediate**: Create package directory and initialize Git repository
2. **Week 1**: Set up build system and development environment
3. **Week 2**: Extract and refactor MDXMarquee component
4. **Week 3**: Configure build tools and package distribution
5. **Week 4**: Implement comprehensive testing suite
6. **Week 5**: Create documentation and examples
7. **Week 6**: Publish package and engage with community

## Resources & References

- [MDXMarquee Component Source](../src/components/mdx/mdx-marquee.tsx) (to be renamed to ImageMarquee)
- [Create Package Instructions](./create-package-instructions.md)
- [NPM Package Guidelines](https://docs.npmjs.com/)
- [React Component Best Practices](https://react.dev/learn)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
