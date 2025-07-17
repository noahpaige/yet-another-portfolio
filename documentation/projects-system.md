# Projects System Documentation

## Overview

The projects system in this portfolio app is designed to automatically generate project pages from a simple folder structure. Each project is defined by a folder containing metadata and content, and the system automatically creates both individual project pages and aggregated project listings.

## Architecture

### Core Components

1. **Project Folders** (`src/projects/`) - Individual project definitions
2. **Generated Index** (`src/generated/project-index.ts`) - Auto-generated project registry
3. **Dynamic Routes** (`src/app/projects/[id]/page.tsx`) - Individual project pages
4. **Project Templates** (`src/components/project-templates/`) - Layout templates for projects
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
  template: {
    // Template configuration (optional)
    templateId: "minimal",
    colorPairs: [
      // Custom background colors (optional)
      [
        { h: 145, s: 50, l: 30 },
        { h: 290, s: 35, l: 10 },
      ],
    ],
  },
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
  template?: ProjectTemplateConfig;
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
4. **Template Application**: Applies the specified template (or default)
5. **Rendering**: Renders the project with the chosen layout

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

  // Get template configuration
  const template = getTemplateById(project.template?.templateId || "default");

  return (
    <TemplateComponent
      header={project.title}
      tags={project.tags}
      colorPairs={project.template?.colorPairs || defaultColorPairs}
    >
      <ProjectContent />
    </TemplateComponent>
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

### 4. Project Templates

The template system provides different layout options for projects:

#### Available Templates:

1. **Default Template** (`default-template.tsx`)

   - Full animated background
   - Centered layout with header and tags
   - Scrollable content area

2. **Minimal Template** (`minimal-template.tsx`)

   - Clean, simple layout
   - No animated background
   - Focus on content

3. **Fullscreen Template** (`fullscreen-template.tsx`)

   - Hero-focused layout
   - Large title and animated background
   - Immersive experience

4. **Custom Template** (`custom-template.tsx`)
   - Complete freedom
   - Project provides its own layout
   - Maximum flexibility

#### Template Configuration:

```typescript
// In project index.ts
template: {
  templateId: "minimal",  // Template to use
  colorPairs: [           // Custom background colors (optional)
    [{ h: 145, s: 50, l: 30 }, { h: 290, s: 35, l: 10 }]
  ]
}
```

#### Template Differences:

- **Default**: Full animated background, centered layout, scrollable content
- **Minimal**: Clean slate background, simple layout, no animations
- **Fullscreen**: Hero section with large title, animated background, content below
- **Custom**: No layout provided - project content handles everything

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
2. **Edit Metadata**: Update `index.ts` for title, tags, etc.
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

### 3. **Flexible Templates**

- Multiple layout options
- Custom styling per project
- Easy template switching

### 4. **Performance**

- Dynamic imports for code splitting
- Optimized image loading
- Efficient project lookup

### 5. **Maintainability**

- Centralized project management
- Consistent project structure
- Easy to add new projects
- No manual route configuration

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
│   ├── project-templates/      # Layout templates
│   │   ├── default-template.tsx
│   │   ├── minimal-template.tsx
│   │   ├── fullscreen-template.tsx
│   │   ├── custom-template.tsx
│   │   ├── template-registry.tsx
│   │   └── types.ts
│   └── ui/
│       └── project-card.tsx    # Project preview cards
└── scripts/
    └── generate-project-index.ts  # Index generation script
```

This system provides a powerful, flexible, and maintainable way to manage portfolio projects with minimal manual configuration and maximum automation.
