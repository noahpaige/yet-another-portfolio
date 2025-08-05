# MDXMarquee Component Requirements Document

## **Overview**

The MDXMarquee component is a high-performance, accessible image marquee component for displaying a horizontally scrolling gallery of images with smooth animations, touch/wheel controls, and fullscreen viewing capabilities. It's designed to work seamlessly within MDX content and provides an optimal user experience across all device types.

## **Core Functionality Requirements**

### **1. Infinite Horizontal Scrolling**

- **Seamless Loop**: Images must scroll infinitely in both directions without visible seams or jumps
- **Bidirectional Support**: Users must be able to scroll both forward (left-to-right) and backward (right-to-left)
- **Smooth Animation**: Continuous scrolling at configurable speed (default: 50px/second)
- **Momentum Physics**: Natural momentum transfer when users drag and release
- **Loop Handling**: Proper handling of scroll offset wrapping when reaching total width boundaries

### **2. Image Management**

- **Lazy Loading**: Images should only load when they approach the viewport
- **Bidirectional Preloading**: Images must load both ahead and behind the current viewport
- **Loading States**: Show loading placeholders while images are loading
- **Error Handling**: Display error placeholders for failed image loads
- **Blur-up Effect**: Support for base64 placeholder images for smooth loading transitions
- **Image Preservation**: Once loaded, images should remain available for backward scrolling

### **3. User Interactions**

#### **Touch Controls**

- **Touch Start**: Detect when user touches the marquee
- **Touch Move**: Allow dragging to control scroll position and speed
- **Touch End**: Apply momentum based on final velocity
- **Multi-touch Support**: Handle multiple touch points appropriately
- **iOS Safari Compatibility**: Special handling for iOS Safari scrolling quirks

#### **Mouse Controls**

- **Mouse Down**: Detect when user clicks and holds
- **Mouse Drag**: Allow dragging to control scroll position
- **Mouse Up**: Apply momentum based on final velocity
- **Drag Threshold**: Minimum movement (5px) before considering it a drag operation
- **Click vs Drag**: Distinguish between clicks (for fullscreen) and drags

#### **Wheel Controls**

- **Wheel Events**: Respond to mouse wheel scrolling
- **Speed Control**: Wheel scrolling should affect marquee speed
- **Direction Mapping**: Natural direction mapping (wheel down = scroll right, wheel up = scroll left)
- **Legacy Support**: Support for older browsers with different wheel event properties

### **4. Fullscreen Modal**

- **Modal Display**: Full-screen overlay when image is clicked
- **Image Navigation**: Arrow keys for previous/next image navigation
- **Keyboard Shortcuts**:
  - `Escape`: Close modal
  - `Arrow Left/Right`: Navigate between images
  - `Home/End`: Jump to first/last image
- **Touch Navigation**: Swipe gestures for navigation (optional)
- **Image Counter**: Display current image position (e.g., "3 / 10")
- **Caption Support**: Display image captions if provided
- **Focus Management**: Proper focus trapping and restoration

### **5. Performance Optimizations**

- **Ref-based Animation**: Use refs instead of state for animation loop
- **Direct DOM Manipulation**: Apply transforms directly to DOM elements
- **GPU Acceleration**: Use CSS transforms for smooth animations
- **Debounced Observers**: Intersection observer callbacks should be debounced (16ms)
- **Efficient State Management**: Minimize React re-renders during animation
- **Memory Management**: Proper cleanup of animation frames, observers, and event listeners

## **Technical Requirements**

### **1. Component Architecture**

- **TypeScript**: Full TypeScript support with proper interfaces
- **React Hooks**: Use functional components with hooks
- **Ref-based Design**: Primary animation logic should use refs for performance
- **Modular Structure**: Well-organized code with clear sections and documentation

### **2. State Management**

- **Animation State**: Track scroll offset and current speed via refs
- **Drag State**: Track drag interactions, velocity, and movement
- **Image State**: Track loaded, visible, loading, and error images
- **Fullscreen State**: Track modal visibility and current image
- **Interaction State**: Track mouse/touch interaction status

### **3. Animation System**

- **RequestAnimationFrame**: Use RAF for smooth 60fps animation
- **CSS Transforms**: Apply `transform: translateX()` for GPU acceleration
- **Momentum Decay**: Gradual return to natural speed after user interaction
- **Smooth Transitions**: CSS transitions for non-animation state changes

### **4. Intersection Observer**

- **Bidirectional Detection**: Observe images both ahead and behind viewport
- **Root Margin**: Configurable preload distance (default: 500px)
- **Threshold**: 0.1 threshold for intersection detection
- **Debouncing**: 16ms debounce to reduce jitter
- **Reconnection**: Proper reconnection when image array changes

### **5. Event Handling**

- **Global Listeners**: Mouse move/up events on document for drag handling
- **Local Listeners**: Touch and mouse events on container
- **Prevent Default**: Prevent default behavior for wheel and touch events
- **Event Cleanup**: Proper cleanup of all event listeners

## **Accessibility Requirements**

### **1. WCAG 2.1 AA Compliance**

- **ARIA Labels**: Proper ARIA labels for all interactive elements
- **Role Attributes**: Appropriate roles for regions, buttons, and dialogs
- **Focus Management**: Logical tab order and focus trapping
- **Screen Reader Support**: Comprehensive screen reader instructions
- **Keyboard Navigation**: Full keyboard accessibility

### **2. Screen Reader Support**

- **Instructions**: Clear instructions for screen reader users
- **Status Announcements**: Announce loading states and errors
- **Navigation**: Announce current image position and total count
- **Error Messages**: Clear error messages for failed image loads

### **3. Keyboard Support**

- **Tab Navigation**: Logical tab order through interactive elements
- **Enter Key**: Activate fullscreen mode for images
- **Arrow Keys**: Navigate fullscreen modal
- **Escape Key**: Close fullscreen modal
- **Focus Indicators**: Visible focus indicators for all interactive elements

## **Configuration Options**

### **1. Required Props**

- `images`: Array of image objects with src, alt, width, height, captionText, placeholder
- `speed`: Animation speed in pixels per second (default: 50)
- `gap`: Gap between images in pixels (default: 20)
- `height`: Fixed height for marquee container (default: 300)
- `preloadDistance`: Distance for preloading images (default: 500)
- `className`: Additional CSS classes for styling

### **2. Image Object Structure**

```typescript
interface MarqueeImage {
  src: string; // Image source URL
  alt: string; // Alt text for accessibility
  width?: number; // Optional width in pixels
  height?: number; // Optional height in pixels
  captionText?: string; // Optional caption text
  placeholder?: string; // Optional base64 placeholder
}
```

## **Styling Requirements**

### **1. Container Styling**

- **Full Width**: Container should span full viewport width
- **Centered Content**: Content should be centered within viewport
- **Fixed Height**: Configurable fixed height
- **Overflow Hidden**: Prevent horizontal scrollbars
- **Position Relative**: For proper positioning of child elements

### **2. Image Styling**

- **Rounded Corners**: 8px border radius for images
- **Shadow**: Subtle shadow for depth
- **Object Fit**: Cover for consistent aspect ratios
- **Hover Effects**: Scale animation on hover (1.05x)
- **Loading States**: Pulse animation for loading placeholders
- **Error States**: Red-tinted background with warning icon

### **3. Fullscreen Modal**

- **Dark Overlay**: 90% black background
- **Centered Content**: Image centered in viewport
- **Navigation Buttons**: Semi-transparent buttons with hover effects
- **Image Counter**: Top-left position with dark background
- **Responsive Design**: Adapt to different screen sizes

## **Error Handling**

### **1. Image Loading Errors**

- **Timeout**: 5-second timeout for image loading
- **Error Display**: Clear error message with warning icon
- **Fallback**: Graceful degradation to error placeholder
- **Retry Logic**: Optional retry mechanism for failed loads

### **2. Browser Compatibility**

- **iOS Safari**: Special handling for scrolling quirks
- **Touch Events**: Fallback for browsers without touch support
- **Wheel Events**: Support for different wheel event implementations
- **Intersection Observer**: Fallback for older browsers

### **3. Performance Degradation**

- **Frame Rate Detection**: Adapt to device capabilities
- **Memory Management**: Prevent memory leaks
- **Cleanup**: Proper cleanup on component unmount
- **Error Boundaries**: React error boundaries for unexpected errors

## **Performance Requirements**

### **1. Animation Performance**

- **60fps Target**: Smooth animation at 60fps on capable devices
- **GPU Acceleration**: Use CSS transforms for hardware acceleration
- **Reduced Re-renders**: Minimize React re-renders during animation
- **Efficient Updates**: Batch state updates when possible

### **2. Memory Management**

- **Observer Cleanup**: Proper cleanup of intersection observers
- **Event Cleanup**: Remove all event listeners on unmount
- **Animation Cleanup**: Cancel animation frames on unmount
- **State Cleanup**: Clear all state and refs on unmount

### **3. Loading Performance**

- **Lazy Loading**: Only load images when needed
- **Preloading**: Smart preloading based on scroll direction
- **Caching**: Preserve loaded images for backward scrolling
- **Debouncing**: Reduce unnecessary observer callbacks

## **Documentation Requirements**

### **1. Code Documentation**

- **JSDoc Comments**: Comprehensive documentation for all functions
- **Type Definitions**: Clear TypeScript interfaces
- **Inline Comments**: Comments for complex logic
- **Version History**: Track changes and improvements

### **2. Usage Documentation**

- **Props Reference**: Complete props documentation
- **Examples**: Usage examples for common scenarios
- **Best Practices**: Performance and accessibility guidelines
- **Troubleshooting**: Common issues and solutions

This requirements document should provide sufficient detail for an AI coding assistant to recreate the MDXMarquee component with all the specified functionality, performance optimizations, and accessibility features.
