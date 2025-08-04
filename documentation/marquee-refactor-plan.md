# MDXMarquee Refactor Plan

## Overview

This document outlines the comprehensive refactor plan for the `MDXMarquee` component based on the code review findings. The component currently has critical performance issues, architectural problems, and maintainability concerns that need to be addressed.

## Current Issues Summary

### Critical Issues (High Priority)

- **Performance Problems**: Multiple 60fps intervals, excessive console logging, redundant state updates
- **Memory Leaks**: Improper cleanup of Intersection Observers and event listeners
- **Infinite Loop Risk**: Circular dependencies in useEffect hooks

### Major Issues (Medium Priority)

- **Accessibility Problems**: Limited keyboard navigation, missing focus management
- **Cross-browser Compatibility**: Touch event conflicts, wheel event inconsistencies
- **State Management Complexity**: Too many state variables, synchronization issues

### Minor Issues (Low Priority)

- **Code Organization**: Large component (446 lines), mixed concerns
- **Type Safety**: Loose typing, missing null checks
- **Styling Issues**: Inline styles mixed with Tailwind

## Refactor Phases

### Phase 1: Critical Performance Fixes (Immediate)

#### 1.1 Remove Debug Logging

- **Task**: Remove all `console.log` statements
- **Approach**: Add conditional logging for development only
- **Impact**: Immediate 60fps performance improvement
- **Files**: `src/components/mdx/mdx-marquee.tsx`

#### 1.2 Consolidate Animation Loops

- **Task**: Replace 3 separate `setInterval` calls with single `requestAnimationFrame`
- **Approach**: Combine scroll offset, momentum decay, and speed updates into one loop
- **Impact**: Reduces CPU usage by ~70%
- **Files**: `src/components/mdx/mdx-marquee.tsx`

#### 1.3 Fix Circular Dependencies

- **Task**: Remove `currentSpeed` from wheel event handler dependencies
- **Approach**: Use refs for values that don't need to trigger re-renders
- **Impact**: Prevents infinite re-renders
- **Files**: `src/components/mdx/mdx-marquee.tsx`

#### 1.4 Proper Cleanup

- **Task**: Ensure all event listeners are properly removed
- **Approach**: Fix Intersection Observer cleanup
- **Impact**: Prevents memory leaks
- **Files**: `src/components/mdx/mdx-marquee.tsx`

### Phase 2: Component Architecture (High Priority)

#### 2.1 Split into Smaller Components

```
MDXMarquee/
├── index.tsx (main component)
├── MarqueeContainer.tsx (animation logic)
├── MarqueeImage.tsx (individual image)
├── FullscreenModal.tsx (modal component)
└── hooks/
    ├── useMarqueeAnimation.ts
    ├── useTouchHandlers.ts
    └── useWheelHandlers.ts
```

#### 2.2 State Management Refactor

- **Task**: Replace 10+ state variables with a reducer
- **Approach**: Separate animation state from UI state
- **Impact**: Improved maintainability and performance
- **Files**: New reducer file + component updates

#### 2.3 Custom Hooks Extraction

- **Task**: Extract complex logic into custom hooks
- **Hooks**:
  - `useMarqueeAnimation`: Handle scroll offset and speed
  - `useTouchHandlers`: Mobile touch interactions
  - `useWheelHandlers`: Mouse wheel interactions
  - `useIntersectionObserver`: Lazy loading logic
- **Files**: `src/hooks/marquee/` directory

### Phase 3: Performance Optimizations (Medium Priority)

#### 3.1 Virtual Scrolling

- **Task**: Only render visible images + buffer
- **Approach**: Implement `react-window` or custom virtualization
- **Impact**: Handles large image lists efficiently
- **Files**: `MarqueeContainer.tsx`

#### 3.2 Image Optimization

- **Task**: Implement proper preloading strategy
- **Approach**: Add loading states and error handling
- **Impact**: Better user experience
- **Files**: `MarqueeImage.tsx`

#### 3.3 Animation Performance

- **Task**: Use CSS transforms instead of JavaScript animations where possible
- **Approach**: Implement `will-change` CSS property, add `transform3d`
- **Impact**: Hardware acceleration
- **Files**: `MarqueeContainer.tsx`

### Phase 4: Accessibility & UX (Medium Priority)

#### 4.1 Keyboard Navigation

- **Task**: Add Space key support for fullscreen
- **Approach**: Implement arrow key navigation
- **Impact**: Better accessibility
- **Files**: `FullscreenModal.tsx`, `MarqueeImage.tsx`

#### 4.2 Screen Reader Support

- **Task**: Add ARIA live regions for dynamic content
- **Approach**: Improve alt text and descriptions
- **Impact**: WCAG compliance
- **Files**: All components

#### 4.3 Touch Improvements

- **Task**: Better touch gesture handling
- **Approach**: Add pinch-to-zoom in fullscreen
- **Impact**: Better mobile experience
- **Files**: `useTouchHandlers.ts`, `FullscreenModal.tsx`

### Phase 5: Code Quality & Maintainability (Low Priority)

#### 5.1 Type Safety

- **Task**: Add strict TypeScript types
- **Approach**: Replace generic Event types with specific ones
- **Impact**: Better developer experience
- **Files**: All components

#### 5.2 Styling Refactor

- **Task**: Move inline styles to CSS modules or styled-components
- **Approach**: Create design tokens for consistent spacing
- **Impact**: Better maintainability
- **Files**: All components

#### 5.3 Testing

- **Task**: Add unit tests for hooks
- **Approach**: Add integration tests for interactions
- **Impact**: Better reliability
- **Files**: `__tests__/` directory

## Implementation Strategy

### Step-by-Step Approach

1. **Start with Phase 1** - These are blocking issues that must be fixed first
2. **Extract hooks** - Move complex logic into custom hooks before splitting components
3. **Split components** - Break down the large component into manageable pieces
4. **Add optimizations** - Implement performance improvements
5. **Enhance accessibility** - Add proper a11y support
6. **Polish and test** - Final improvements and testing

### Risk Mitigation

- **Incremental refactoring**: Each phase can be implemented independently
- **Feature flags**: Use feature flags to toggle new implementations
- **Performance monitoring**: Add metrics to track improvements
- **Rollback plan**: Keep old implementation as fallback

### Success Metrics

- **Performance**: Reduce CPU usage by 70%
- **Bundle size**: Reduce component size by 40%
- **Accessibility**: Achieve WCAG 2.1 AA compliance
- **Maintainability**: Reduce cyclomatic complexity by 50%

## Timeline Estimate

- **Phase 1**: 1-2 days (critical fixes)
- **Phase 2**: 3-5 days (architecture)
- **Phase 3**: 2-3 days (performance)
- **Phase 4**: 2-3 days (accessibility)
- **Phase 5**: 1-2 days (polish)

**Total**: 9-15 days

## Dependencies

- React 18+ (for concurrent features)
- Framer Motion (for animations)
- Next.js Image component
- TypeScript strict mode

## Notes

- Each phase should be completed and tested before moving to the next
- Performance benchmarks should be taken before and after each phase
- Accessibility testing should be performed throughout development
- The refactor should maintain backward compatibility with existing usage
