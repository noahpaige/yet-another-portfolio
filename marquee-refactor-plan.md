# MDXMarquee Component Refactor Plan

## Overview

This document outlines a comprehensive refactor plan for the `mdx-marquee.tsx` component to improve performance, maintainability, and user experience.

## Current State Assessment

### Strengths ✅

- Comprehensive feature set (lazy loading, touch/swipe, fullscreen, keyboard navigation)
- Good accessibility with proper ARIA labels and keyboard support
- Cross-browser compatibility for wheel and touch events
- Performance optimizations using `requestAnimationFrame` and intersection observers
- Well-typed TypeScript interfaces

### Issues Identified ⚠️

## 1. Performance Issues (High Priority)

### Problem

Multiple state updates in animation loop causing unnecessary re-renders:

```typescript
// Lines 130-150: Animation loop updates state on every frame
setScrollOffset((prev) => {
  /* ... */
});
setCurrentSpeed((prev) => {
  /* ... */
});
```

### Impact

- Performance degradation on lower-end devices
- Unnecessary re-renders affecting smooth animations
- Potential frame rate drops

### Solution

- Use refs for frequently changing animation values
- Batch state updates to reduce re-render frequency
- Implement virtual scrolling for large image sets

## 2. Memory Leaks (Medium Priority)

### Problem

Intersection observer cleanup issues:

```typescript
// Lines 75-95: Observer setup
const observer = new IntersectionObserver(/* ... */);
// Lines 100-110: Separate effect for observing new images
```

### Impact

- Memory leaks over time
- Potential performance degradation
- Observer conflicts

### Solution

- Properly disconnect and reconnect observers
- Implement proper cleanup in useEffect dependencies
- Add observer management utilities

## 3. State Management Complexity (Medium Priority)

### Problem

Too many interdependent state variables:

- `scrollOffset`, `currentSpeed`, `isDragging`, `dragStart`, `dragOffset`
- `loadedImages`, `visibleImages` (could be combined)

### Impact

- Difficult to debug and maintain
- Complex state interactions
- Potential for state inconsistencies

### Solution

- Consolidate related state into objects
- Extract state logic into custom hooks
- Implement reducer pattern for complex state

## 4. Magic Numbers & Constants (Low Priority)

### Problem

Hardcoded values scattered throughout:

```typescript
// Line 49: MAX_SPEED = speed * 30
// Line 50: MOMENTUM_DECAY = 0.1
// Line 100: setTimeout delay of 100ms
// Line 280: MAX_SPEED * 0.5 for wheel sensitivity
```

### Solution

- Extract to named constants with clear documentation
- Create configuration object for all constants
- Add JSDoc comments explaining magic numbers

## 5. Error Handling (Medium Priority)

### Problem

No error handling for:

- Image loading failures
- Invalid image dimensions
- Touch/wheel event failures
- Intersection observer failures

### Solution

- Add try-catch blocks for async operations
- Implement error boundaries
- Add fallback UI for failed images
- Graceful degradation for unsupported features

## 6. Accessibility Improvements (Low Priority)

### Problem

Missing focus management in fullscreen modal:

- No focus trap
- Focus doesn't return to trigger element when modal closes

### Solution

- Implement focus trap in fullscreen modal
- Add proper focus management
- Ensure keyboard navigation works correctly
- Add screen reader announcements

## 7. Code Organization (Low Priority)

### Problem

Single large component with multiple responsibilities:

- Animation logic mixed with UI rendering
- Event handlers scattered throughout
- Complex useEffect dependencies

### Solution

- Extract custom hooks within the same file for specific functionality
- Organize code into logical sections within the single file
- Separate concerns (animation, UI, events) while keeping everything in one file
- Add clear section comments and grouping

## Implementation Plan

### Phase 1: Performance Optimizations (Week 1)

1. **Refactor Animation Loop**

   - Replace state updates with refs for animation values
   - Implement batching for state updates
   - Add performance monitoring

2. **Fix Memory Leaks**
   - Proper observer cleanup
   - Add cleanup utilities
   - Test memory usage

### Phase 2: State Management (Week 2)

1. **Consolidate State**

   - Combine related state variables into objects
   - Implement reducer pattern for complex state
   - Add state debugging tools

2. **Extract Custom Hooks (Within File)**
   - `useMarqueeAnimation` - animation logic with refs
   - `useTouchHandling` - touch/wheel event management
   - `useFullscreen` - modal state and focus management
   - `useImageLoading` - intersection observer logic

### Phase 3: Error Handling & Accessibility (Week 3)

1. **Add Error Handling**

   - Image loading error boundaries
   - Graceful degradation
   - User-friendly error messages

2. **Improve Accessibility**
   - Focus management
   - Screen reader support
   - Keyboard navigation improvements

### Phase 4: Code Organization & Testing (Week 4)

1. **Refactor Component Structure**

   - Organize code into logical sections within the single file
   - Extract configuration constants to top of file
   - Add comprehensive JSDoc comments and section headers
   - Ensure clear separation between hooks, main component, and utilities

2. **Add Comprehensive Testing**
   - Unit tests for individual hooks (in separate test file)
   - Integration tests for component interactions
   - Performance tests for animation and memory usage
   - Accessibility tests for keyboard and screen reader support

## Technical Implementation Details

### Custom Hooks to Create (Within Same File)

#### `useMarqueeAnimation`

```typescript
const useMarqueeAnimation = (speed: number, totalWidth: number) => {
  // Animation logic with refs instead of state
  // Returns animation values and controls
};
```

#### `useTouchHandling`

```typescript
const useTouchHandling = (onScroll: (delta: number) => void) => {
  // Touch event handling with proper gesture recognition
  // Returns touch event handlers
};
```

#### `useImageLoading`

```typescript
const useImageLoading = (images: MarqueeImage[], preloadDistance: number) => {
  // Intersection observer logic
  // Returns loading state and visible images
};
```

#### `useFullscreen`

```typescript
const useFullscreen = () => {
  // Fullscreen modal logic with focus management
  // Returns modal state and handlers
};
```

### Configuration Object

```typescript
interface MarqueeConfig {
  animation: {
    naturalSpeed: number;
    maxSpeedMultiplier: number;
    momentumDecay: number;
    frameRate: number;
  };
  interaction: {
    wheelSensitivity: number;
    touchSensitivity: number;
    dragThreshold: number;
  };
  loading: {
    preloadDistance: number;
    loadDelay: number;
    placeholderColor: string;
  };
  accessibility: {
    focusTrap: boolean;
    screenReaderAnnouncements: boolean;
    keyboardNavigation: boolean;
  };
}
```

### Performance Monitoring

```typescript
const usePerformanceMonitor = () => {
  // Monitor frame rates
  // Track memory usage
  // Log performance metrics
};
```

## Testing Strategy

### Unit Tests (Separate Test File)

- Test individual hooks in isolation
- Test utility functions
- Test state management logic
- Mock dependencies for isolated testing

### Integration Tests (Component Level)

- Test user interactions (wheel, touch, keyboard)
- Test animation behavior
- Test fullscreen functionality
- Test component integration with hooks

### Performance Tests

- Measure frame rates during animation
- Test memory usage over time
- Benchmark with different image counts
- Profile component performance

### Accessibility Tests

- Test keyboard navigation
- Test screen reader compatibility
- Test focus management
- Test ARIA attributes and labels

## Success Metrics

### Performance

- Maintain 60fps during animation
- Reduce memory usage by 20%
- Improve initial load time

### Maintainability

- Reduce component complexity by 40% through better organization
- Improve test coverage to 90%+
- Reduce bug reports by 50%

### User Experience

- Improve accessibility score to 95%+
- Reduce interaction latency
- Better error handling and feedback

## Risk Assessment

### High Risk

- Breaking existing functionality during refactor
- Performance regression during transition

### Medium Risk

- Complex state management changes within single file
- Browser compatibility issues
- Hook extraction complexity

### Low Risk

- Code organization improvements within single file
- Documentation updates
- Configuration extraction

## Timeline

- **Week 1**: Performance optimizations
- **Week 2**: State management refactor
- **Week 3**: Error handling and accessibility
- **Week 4**: Code organization and testing
- **Week 5**: Documentation and final testing

## File Structure After Refactor

The refactored component will maintain a single file structure but with better organization:

```typescript
// 1. Imports and Types
// 2. Configuration Constants and Defaults
// 3. Utility Functions
// 4. Custom Hooks (useMarqueeAnimation, useTouchHandling, useImageLoading, useFullscreen)
// 5. Main Component (MDXMarquee)
// 6. Export
```

### Section Organization Details:

- **Configuration**: All magic numbers, constants, and default values at the top
- **Utilities**: Helper functions for calculations, validation, and DOM manipulation
- **Hooks**: Each hook in its own section with clear documentation
- **Main Component**: Clean, focused component that uses the extracted hooks
- **Clear Separation**: Section headers and comments to maintain readability

## Conclusion

This refactor plan addresses the major issues identified in the code review while maintaining the component's excellent feature set and keeping everything in a single file. The phased approach ensures minimal disruption while delivering significant improvements in performance, maintainability, and user experience through better code organization within the same file.
