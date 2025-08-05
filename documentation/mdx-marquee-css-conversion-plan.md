# MDXMarquee CSS Conversion Plan

## Overview

This document outlines the plan to convert the MDXMarquee component from using Framer Motion animations to CSS transforms for improved performance and reduced bundle size.

## Current Animation Analysis

The component currently uses Framer Motion for several key animations:

1. **Main Marquee Scrolling**: `motion.div` with `animate={{ x: -(animationState.scrollOffset % totalWidth) }}`
2. **Image Hover Effects**: `motion.div` with `whileHover={{ scale: 1.05, zIndex: 10 }}`
3. **Image Loading Fade-in**: `motion.div` with `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}`
4. **Fullscreen Modal**: Multiple `motion.div` elements with opacity, scale, and position animations
5. **Modal Content**: `AnimatePresence` for enter/exit animations

## Conversion Strategy

### Phase 1: Core Marquee Scrolling Animation

**Priority: HIGH** - This is the main functionality

**Current Implementation:**

```tsx
<motion.div
  animate={{ x: -(animationState.scrollOffset % totalWidth) }}
  transition={{ type: "tween", ease: "linear", duration: dragState.isDragging ? 0 : 0.1 }}
>
```

**CSS Transform Approach:**

- Replace with `style={{ transform: `translateX(${scrollOffset}px)` }}`
- Use `transform: translate3d()` for hardware acceleration
- Maintain the same `scrollOffset` calculation logic
- Remove the `transition` prop and handle smooth transitions via CSS

**Implementation Steps:**

1. Remove `motion.div` wrapper for the scrolling container
2. Add CSS class for hardware acceleration: `transform: translate3d(0, 0, 0)`
3. Update the style prop to use `transform: translateX()` instead of motion's `x`
4. Test performance and smoothness

### Phase 2: Image Hover Effects

**Priority: MEDIUM** - Visual enhancement

**Current Implementation:**

```tsx
<motion.div
  whileHover={{ scale: 1.05, zIndex: 10 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

**CSS Transform Approach:**

- Use CSS `:hover` pseudo-class with `transform: scale(1.05)`
- Add `z-index: 10` on hover
- Use CSS transitions for smooth scaling: `transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Consider using `will-change: transform` for performance optimization

**Implementation Steps:**

1. Replace `motion.div` with regular `div`
2. Add CSS classes for hover effects
3. Implement spring-like easing with cubic-bezier
4. Test hover responsiveness and performance

### Phase 3: Image Loading Fade-in Animation

**Priority: MEDIUM** - User experience enhancement

**Current Implementation:**

```tsx
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
```

**CSS Transform Approach:**

- Use CSS `opacity` transitions
- Implement with CSS classes: `.image-fade-in { opacity: 0; transition: opacity 0.3s ease-in-out; }`
- Add class when image loads: `className={isLoaded ? 'image-fade-in loaded' : 'image-fade-in'}`
- Remove `AnimatePresence` wrapper

**Implementation Steps:**

1. Remove `AnimatePresence` and `motion.div` wrappers
2. Create CSS classes for fade-in animation
3. Update image rendering logic to apply classes based on loading state
4. Test loading states and transitions

### Phase 4: Fullscreen Modal Animations

**Priority: LOW** - Complex but not critical for core functionality

**Current Implementation:**
Multiple `motion.div` elements with:

- Modal backdrop: opacity fade
- Modal content: scale and opacity animations
- Caption: slide-up animation

**CSS Transform Approach:**

- Use CSS classes for modal states
- Implement backdrop fade with `opacity` transitions
- Use `transform: scale()` for modal content scaling
- Use `transform: translateY()` for caption slide-up
- Handle enter/exit animations with CSS classes and state management

**Implementation Steps:**

1. Replace all modal `motion.div` elements with regular `div`s
2. Create comprehensive CSS classes for modal animations
3. Implement state-based class application
4. Handle modal enter/exit timing with `useEffect` and timeouts
5. Test modal responsiveness and accessibility

### Phase 5: Performance Optimizations

**Priority: HIGH** - Critical for smooth experience

**CSS-Specific Optimizations:**

1. **Hardware Acceleration**: Use `transform: translate3d()` for all transforms
2. **Will-change Property**: Add `will-change: transform` for elements that will animate
3. **Containment**: Use `contain: layout` for isolated animations
4. **Reduced Motion**: Respect `prefers-reduced-motion` media query
5. **GPU Layers**: Ensure animations trigger GPU acceleration

**Implementation Steps:**

1. Add performance-focused CSS classes
2. Implement reduced motion support
3. Optimize transform properties for GPU acceleration
4. Test performance across different devices

## Technical Considerations

### CSS Classes Structure

```css
/* Core marquee */
.marquee-container {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

/* Image hover effects */
.marquee-image {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.marquee-image:hover {
  transform: scale(1.05);
  z-index: 10;
}

/* Image loading */
.image-fade-in {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.image-fade-in.loaded {
  opacity: 1;
}

/* Modal animations */
.modal-backdrop {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.modal-backdrop.open {
  opacity: 1;
}

.modal-content {
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.3s ease-in-out;
}

.modal-content.open {
  transform: scale(1);
  opacity: 1;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .marquee-container,
  .marquee-image,
  .image-fade-in,
  .modal-backdrop,
  .modal-content {
    transition: none !important;
    animation: none !important;
  }
}
```

### State Management Changes

- Remove `AnimatePresence` dependency
- Simplify animation state management
- Use CSS classes instead of motion props
- Maintain existing interaction logic (touch, wheel, drag)

### Accessibility Considerations

- Maintain all existing ARIA attributes
- Ensure keyboard navigation still works
- Test with screen readers
- Respect `prefers-reduced-motion`

### Browser Compatibility

- Test across major browsers (Chrome, Firefox, Safari, Edge)
- Ensure CSS transforms work consistently
- Verify hardware acceleration support
- Test on mobile devices

## Implementation Order

1. **Phase 1** - Core scrolling (highest impact, lowest risk)
2. **Phase 5** - Performance optimizations (apply throughout)
3. **Phase 2** - Hover effects (medium impact, low risk)
4. **Phase 3** - Loading animations (medium impact, low risk)
5. **Phase 4** - Modal animations (lowest priority, highest complexity)

## Testing Strategy

1. **Performance Testing**: Measure FPS and smoothness
2. **Interaction Testing**: Verify touch, wheel, and drag functionality
3. **Accessibility Testing**: Ensure screen reader compatibility
4. **Cross-browser Testing**: Verify consistent behavior
5. **Mobile Testing**: Test on various mobile devices
6. **Reduced Motion Testing**: Verify accessibility compliance

## Risk Assessment

**Low Risk:**

- Core scrolling animation (well-established CSS transform patterns)
- Hover effects (standard CSS hover implementation)
- Loading animations (simple opacity transitions)

**Medium Risk:**

- Modal animations (complex state management required)
- Performance optimizations (need careful testing)

**Mitigation Strategies:**

- Implement phases incrementally
- Maintain existing functionality during conversion
- Extensive testing at each phase
- Fallback to simpler animations if needed

## Success Criteria

1. **Performance**: Maintain or improve current FPS performance
2. **Functionality**: All existing interactions work identically
3. **Accessibility**: All accessibility features remain intact
4. **Bundle Size**: Reduce bundle size by removing Framer Motion dependency
5. **Cross-browser**: Consistent behavior across all target browsers
6. **Mobile**: Smooth performance on mobile devices

## Timeline Estimate

- **Phase 1**: 1-2 days
- **Phase 2**: 1 day
- **Phase 3**: 1 day
- **Phase 4**: 2-3 days
- **Phase 5**: 1-2 days
- **Testing & Refinement**: 2-3 days

**Total Estimated Time**: 8-12 days

## Dependencies

- Remove Framer Motion import from the component
- Update any shared animation utilities if needed
- Ensure CSS-in-JS or global CSS setup supports the new classes
- Verify Next.js Image component compatibility with new structure
