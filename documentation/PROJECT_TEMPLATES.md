# Project Template System

This document explains how to use the flexible template system for project pages.

## Overview

The template system allows you to choose from different layouts for your project pages while maintaining consistency where needed. Each project can specify which template to use and optionally provide custom color pairs for animated backgrounds.

## Available Templates

### 1. Default Template (`"default"`)

- **Features**: Full animated background, centered layout, header with tags
- **Best for**: Most projects that want the signature animated background
- **Example**: Clair Obscur, Ghost of Tsushima

### 2. Minimal Template (`"minimal"`)

- **Features**: Clean, simple layout without animated background
- **Best for**: Projects that need a more traditional, readable layout
- **Example**: Control, Death Stranding, Indiana Jones

### 3. Fullscreen Template (`"fullscreen"`)

- **Features**: Hero-focused layout with large title and animated background
- **Best for**: Projects that want maximum visual impact
- **Example**: Use for projects with strong visual identity

### 4. Custom Template (`"custom"`)

- **Features**: Complete freedom - project provides its own layout
- **Best for**: Projects that need unique, custom layouts
- **Example**: Cyberpunk 2077

## How to Configure a Project

### Basic Configuration

```typescript
// src/projects/your-project/index.ts
export default {
  id: "your-project",
  title: "Your Project Title",
  tags: ["Tag1", "Tag2", "Tag3"],
  image: "/your-image.png",
  imageAltText: "Description of the image",
  template: {
    templateId: "default", // or "minimal", "fullscreen", "custom"
  },
};
```

### With Custom Colors

```typescript
export default {
  id: "your-project",
  title: "Your Project Title",
  tags: ["Tag1", "Tag2", "Tag3"],
  image: "/your-image.png",
  imageAltText: "Description of the image",
  template: {
    templateId: "default",
    colorPairs: [
      [
        { h: 280, s: 60, l: 25 }, // First color
        { h: 145, s: 40, l: 15 }, // Second color
      ],
      [
        { h: 145, s: 50, l: 20 }, // Third color
        { h: 280, s: 70, l: 30 }, // Fourth color
      ],
    ],
  },
};
```

## Template Interface

All templates receive the same props:

```typescript
interface ProjectTemplateProps {
  header: string; // Project title
  tags: string[]; // Project tags
  colorPairs: [HSLColor, HSLColor][]; // Background colors
  children: React.ReactNode; // Project content component
}
```

## Creating Custom Content

### For Default/Minimal/Fullscreen Templates

Your content component should focus on the content itself:

```typescript
// src/projects/your-project/content.tsx
export default function YourProjectContent() {
  return (
    <div className="space-y-6">
      <h2>Your Content Title</h2>
      <p>Your content here...</p>
      {/* More content */}
    </div>
  );
}
```

### For Custom Template

Your content component handles the entire layout:

```typescript
// src/projects/your-project/content.tsx
"use client";

import React from "react";
import { useScroll } from "framer-motion";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import type { HSLColor } from "@/components/animated-background";

export default function YourProjectContent() {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  const customColors: [HSLColor, HSLColor][] = [
    [
      { h: 200, s: 60, l: 25 },
      { h: 300, s: 40, l: 15 },
    ],
  ];

  return (
    <div className="relative min-h-screen">
      <ClientOnly>
        <div className="sticky inset-0">
          <AnimatedBackground
            scrollYProgress={scrollYProgress}
            colorPairs={customColors}
          />
          <NoiseOverlay opacity={0.04} resolution={1} />
        </div>
      </ClientOnly>

      <div className="relative z-10">
        {/* Your custom layout here */}
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-8xl font-bold">Your Custom Layout</h1>
        </div>

        <div className="container mx-auto px-4 py-16">{/* Your content */}</div>
      </div>
    </div>
  );
}
```

## Adding New Templates

To add a new template:

1. Create a new template component in `src/components/project-templates/`
2. Add it to the registry in `src/components/project-templates/template-registry.tsx`
3. Export it from `src/components/project-templates/index.ts`

## Color Guidelines

When choosing colors for animated backgrounds:

- Use HSL color format: `{ h: hue, s: saturation, l: lightness }`
- Hue: 0-360 (color wheel)
- Saturation: 0-100 (0 = grayscale, 100 = full color)
- Lightness: 0-100 (0 = black, 100 = white)
- For dark themes, keep lightness values low (10-40)
- Use complementary or contrasting colors for visual interest

## Best Practices

1. **Choose the right template**: Consider the project's visual needs and content type
2. **Use custom colors thoughtfully**: Match the project's theme and mood
3. **Keep content focused**: Let the template handle layout, focus on content
4. **Test responsiveness**: Ensure your custom layouts work on all screen sizes
5. **Maintain consistency**: Use similar patterns across similar project types
