## 📋 Updated Implementation Plan: MDX-Based Article System

### **Phase 1: MDX Setup & Configuration**

1. **Install MDX Dependencies**

   - Add `@next/mdx`, `@mdx-js/react`, `@mdx-js/loader` for MDX support
   - Add `@tailwindcss/typography` for prose styling
   - Update `next.config.ts` to enable MDX

2. **Configure Tailwind Typography**
   - Install and configure `@tailwindcss/typography` plugin
   - Add custom prose styles that work well with your existing dark theme
   - Ensure typography plugin provides good baseline styling for headings, lists, blockquotes, etc.

### **Phase 2: MDX Provider & Component System**

3. **Create MDX Provider Configuration**

   - Build `MDXProvider` with custom component mappings in `src/components/mdx/`
   - Implement responsive image component
   - Add iframe/embed component with aspect ratio handling
   - Create ShadCN Alert-based blockquote component
   - Style links with hover effects
   - Create reusable components for custom layouts (like Cyberpunk animations)

4. **Enhanced Article Layout**
   - Update `ArticleLayout` to use MDX provider
   - Ensure proper typography plugin integration with `prose` classes
   - Maintain existing animated background functionality

### **Phase 3: Content Migration & Structure**

5. **Create Content Directory Structure**

   ```
   src/
   ├── projects/                    # Keep existing structure
   │   ├── project-id/
   │   │   ├── index.ts            # Metadata (unchanged)
   │   │   └── content.mdx         # MDX content (replaces .tsx)
   │   └── ...
   ├── components/
   │   ├── mdx/                    # New: MDX-specific components
   │   │   ├── mdx-provider.tsx    # MDX provider configuration
   │   │   ├── components.tsx      # Custom MDX components
   │   │   └── types.ts            # MDX types
   │   └── articles/               # Existing (unchanged)
   └── scripts/
       └── generate-project-index.ts  # Extended to handle MDX
   ```

6. **Migrate Existing Projects to MDX**
   - Convert existing `content.tsx` files to `.mdx` format
   - Extract custom components (like Cyberpunk animations) into reusable components
   - Maintain current metadata structure in `index.ts`
   - Update project loading system to handle MDX files

### **Phase 4: Example Implementation**

7. **Create Example Article**
   - Build comprehensive example MDX file demonstrating all features
   - Include headings, images, iframes, and custom components
   - Test responsive behavior and styling

### **Phase 5: Integration & Testing**

8. **Update Project System**

   - Modify project loading to support MDX files
   - Update dynamic import system in `[id]/page.tsx`
   - Ensure backward compatibility during migration
   - Test all existing projects still work

9. **Extensibility Preparation**
   - Design system to easily add blog support later
   - Create shared utilities for content management
   - Document patterns for future content types

---

## **Key Design Decisions**

### **Extensibility Strategy**

- **Unified Content System**: Both projects and blogs will use the same MDX infrastructure
- **Shared Components**: All MDX components will be reusable across content types
- **Metadata Consistency**: Maintain current project metadata structure for compatibility
- **Future Blog Support**: Design with blog routes (`/blog/[slug]`) in mind

### **File Organization**

- **Content Separation**: Keep MDX files separate from React components
- **Shared Utilities**: Centralize MDX configuration and components
- **Type Safety**: Maintain TypeScript support throughout

### **Styling Approach**

- **Tailwind Typography**: Use `prose` classes for consistent markdown styling (general styling, not dark-mode specific)
- **Theme Integration**: Ensure typography works well with your existing dark theme
- **Responsive Design**: All components will be mobile-friendly
- **Custom Components**: ShadCN integration for enhanced UI elements

### **Migration Strategy**

- **One Format**: Convert all projects to MDX-only
- **Component Extraction**: Move custom layouts to reusable components
- **Gradual Migration**: Convert projects one at a time to ensure stability
- **Backward Compatibility**: Ensure system works during transition period

The main changes from the previous plan:

1. **MDX-only approach** - no dual format support
2. **Component extraction** - move custom layouts to reusable components
3. **Simplified structure** - one content format to maintain
4. **Migration focus** - convert existing projects to MDX

Would you like me to proceed with this updated implementation plan?
