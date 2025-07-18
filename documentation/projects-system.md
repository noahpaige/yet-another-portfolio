# Projects System Documentation

## Overview

The projects system in this portfolio app is designed to automatically generate project pages from a simple folder structure. Each project is defined by a folder containing metadata and content, and the system automatically creates both individual project pages and aggregated project listings.

## Architecture

### Core Components

1. **Project Folders** (`src/projects/`) - Individual project definitions
2. **Generated Index** (`src/generated/project-index.ts`) - Auto-generated project registry
3. **Dynamic Routes** (`src/app/projects/[id]/page.tsx`) - Individual project pages
4. **Article Template** (`src/components/articles/article-layout.tsx`) - Single layout template for all projects
5. **Project Cards** (`src/components/ui/project-card.tsx`) - Reusable project preview cards

## How It Works

### 1. Project Structure

Each project is defined by a folder in `src/projects/` with the following structure:

```
src/projects/
├── project-id/
│   ├── index.ts          # Project metadata
│   └── content.tsx       # Project content component
├── another-project/
│   ├── index.ts
│   └── content.tsx
└── ...
```

#### Project Metadata (`index.ts`)

```typescript
export default {
  id: "project-id", // URL slug (must match folder name)
  title: "Project Title", // Display title
  tags: ["Tag1", "Tag2"], // Project tags
  image: "/project-image.jpg", // Hero image path
  imageAltText: "Description", // Alt text for accessibility
  timestamp: "2024-01-01T00:00:00Z", // ISO date string
  featured: true, // Show on home page
  featuredOrder: 1, // Order on home page (optional)
  colorPairs: [
    // Custom background colors (optional)
    [
      { h: 145, s: 50, l: 30 },
      { h: 290, s: 35, l: 10 },
    ],
  ],
};
```

#### Project Content (`content.tsx`)

```typescript
import React from "react";

export default function ProjectContent() {
  return (
    <div className="text-zinc-100">
      {/* Your project content here */}
      <h1>Project Title</h1>
      <p>Project description...</p>
    </div>
  );
}
```

### 2. Automatic Index Generation

The `scripts/generate-project-index.ts` script automatically scans all project folders and generates a centralized index file.

#### What the Script Does:

1. **Scans Project Directories**: Reads all folders in `src/projects/`
2. **Extracts Metadata**: Parses each `index.ts` file to extract project data
3. **Validates Data**: Ensures all required fields are present
4. **Generates TypeScript**: Creates a strongly-typed index file with:
   - All projects sorted by timestamp (newest first)
   - Featured projects filtered and sorted by `featuredOrder`
   - Helper functions for project lookup
   - TypeScript interfaces for type safety

#### Generated Output (`src/generated/project-index.ts`):

```typescript
// Auto-generated file - do not edit manually
export interface Project {
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
  timestamp: string;
  featured: boolean;
  featuredOrder?: number;
  colorPairs?: [HSLColor, HSLColor][];
}

export const projects: Project[] = [
  // All projects sorted by timestamp
];

export const featuredProjects: Project[] = [
  // Featured projects sorted by featuredOrder
];

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
```

### 3. Dynamic Page Generation

#### Individual Project Pages (`src/app/projects/[id]/page.tsx`)

Each project page is dynamically generated using Next.js dynamic routes:

1. **Route Resolution**: Next.js matches `/projects/[id]` to the project ID
2. **Project Lookup**: Uses `getProjectById()` to find project metadata
3. **Content Loading**: Dynamically imports the project's `content.tsx`
4. **Template Application**: Applies the unified article template
5. **Rendering**: Renders the project with consistent layout

```typescript
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound(); // 404 if project doesn't exist
  }

  // Dynamic import of project content
  const contentModule = await import(`@/projects/${id}/content`);
  const ProjectContent = contentModule.default;

  // Default color pairs if none provided
  const defaultColorPairs: [HSLColor, HSLColor][] = [
    [
      { h: 145, s: 50, l: 30 },
      { h: 290, s: 35, l: 10 },
    ],
    [
      { h: 245, s: 30, l: 9 },
      { h: 145, s: 60, l: 27 },
    ],
  ];

  const colorPairs = project.colorPairs || defaultColorPairs;

  return (
    <ArticleLayout
      header={project.title}
      tags={project.tags}
      colorPairs={colorPairs}
    >
      <ProjectContent />
    </ArticleLayout>
  );
}
```

#### Projects Listing Page (`src/app/projects/page.tsx`)

The main projects page displays all projects in a grid layout:

```typescript
export default function ProjectsPage() {
  return (
    <div>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Projects grid */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} hideTags={false} />
        ))}
      </div>
    </div>
  );
}
```

### 4. Article Template

The system uses a single, unified template for all projects:

#### Article Template (`article-layout.tsx`)

- **Animated Background**: Full animated gradient background with scroll-based effects
- **Centered Layout**: Clean, centered layout with header and tags
- **Scrollable Content**: Proper scrolling behavior with content area
- **Customizable Colors**: Optional custom background color pairs per project
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper semantic markup and alt text support

#### Template Features:

- **Header Section**: Large title with project tags displayed as badges
- **Content Area**: Full-width content area with proper typography
- **Background Effects**: Animated gradient background with noise overlay
- **Scroll Integration**: Background animation tied to scroll progress
- **Color Customization**: Projects can define custom `colorPairs` for unique backgrounds

#### Color Customization:

```typescript
// In project index.ts
colorPairs: [
  [
    { h: 145, s: 50, l: 30 }, // First color
    { h: 290, s: 35, l: 10 }, // Second color
  ],
  [
    { h: 245, s: 30, l: 9 },  // Third color
    { h: 145, s: 60, l: 27 }, // Fourth color
  ],
],
```

### 5. Project Cards

The `ProjectCard` component provides consistent project previews across the app:

#### Features:

- **Responsive Design**: Adapts to different screen sizes
- **Magnetic Effects**: Interactive hover animations
- **Dynamic Typography**: Font sizes scale with container
- **Image Optimization**: Proper aspect ratios and loading
- **Accessibility**: Alt text and semantic markup

#### Usage:

```typescript
<ProjectCard
  project={project}
  hideTags={false} // Show/hide tags
/>
```

## Workflow

### Adding a New Project

1. **Create Project Folder**:

   ```bash
   mkdir src/projects/my-new-project
   ```

2. **Add Metadata** (`index.ts`):

   ```typescript
   export default {
     id: "my-new-project",
     title: "My New Project",
     tags: ["React", "TypeScript"],
     image: "/my-project.jpg",
     imageAltText: "Screenshot of my project",
     timestamp: "2024-01-15T00:00:00Z",
     featured: true,
     featuredOrder: 1,
     colorPairs: [
       // Optional custom colors
       [
         { h: 145, s: 50, l: 30 },
         { h: 290, s: 35, l: 10 },
       ],
     ],
   };
   ```

3. **Add Content** (`content.tsx`):

   ```typescript
   export default function MyNewProjectContent() {
     return (
       <div className="text-zinc-100">
         <h1>My New Project</h1>
         <p>Project description...</p>
       </div>
     );
   }
   ```

4. **Add Image**: Place project image in `public/` folder

5. **Generate Index**:

   ```bash
   npm run generate-project-index
   ```

6. **Access Project**: Visit `/projects/my-new-project`

### Updating Projects

1. **Edit Content**: Modify `content.tsx` for layout changes
2. **Edit Metadata**: Update `index.ts` for title, tags, colors, etc.
3. **Regenerate Index**: Run the generation script
4. **Deploy**: Changes are automatically reflected

## Key Benefits

### 1. **Automatic Page Generation**

- No manual route creation
- Consistent URL structure
- Automatic 404 handling

### 2. **Type Safety**

- Generated TypeScript interfaces
- Compile-time error checking
- IntelliSense support
- Automatic project validation

### 3. **Unified Template System**

- Single, consistent layout for all projects
- Simplified maintenance and updates
- Customizable background colors per project
- Clean, modern design

### 4. **Performance**

- Dynamic imports for code splitting
- Optimized image loading
- Efficient project lookup

### 5. **Maintainability**

- Centralized project management
- Consistent project structure
- Easy to add new projects
- No manual route configuration
- Simplified template system

## Scripts

### Generate Project Index

```bash
npm run generate-project-index
```

This script:

- Scans all project directories
- Extracts and validates metadata
- Generates TypeScript index file
- Sorts projects by timestamp
- Creates featured projects list

### Development Workflow

1. Add/edit project files
2. Run generation script
3. Test locally
4. Commit changes
5. Deploy

### Build Integration

The project index generation is automatically integrated into the build process:

```json
{
  "scripts": {
    "dev": "npm run generate-project-index && next dev",
    "build": "npm run generate-project-index && next build"
  }
}
```

This ensures the project index is always up-to-date when developing or building the app.

## Error Handling & Validation

### Project Validation

- The generation script validates that all required fields are present
- Missing projects or invalid metadata are logged as errors
- The dynamic import system gracefully handles missing content files
- 404 pages are automatically generated for non-existent projects

### Content Loading

- Dynamic imports ensure only needed project content is loaded
- Failed content imports result in 404 pages
- Template fallbacks ensure projects always render with a valid layout

## File Structure Summary

```
src/
├── projects/                    # Individual project folders
│   ├── project-id/
│   │   ├── index.ts            # Project metadata
│   │   └── content.tsx         # Project content
│   └── ...
├── generated/                   # Auto-generated files
│   └── project-index.ts        # Project registry
├── app/projects/               # Next.js routes
│   ├── page.tsx                # Projects listing
│   └── [id]/page.tsx           # Individual project pages
├── components/
│   ├── articles/               # Article template
│   │   ├── article-layout.tsx # Single unified template
│   │   └── types.ts            # Template types
│   └── ui/
│       └── project-card.tsx    # Project preview cards
└── scripts/
    └── generate-project-index.ts  # Index generation script
```

This system provides a powerful, flexible, and maintainable way to manage portfolio projects with minimal manual configuration and maximum automation. The simplified template system ensures consistency across all projects while still allowing for customization through background colors.
