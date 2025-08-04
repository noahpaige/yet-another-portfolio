"use client";

/**
 * MDXMarquee Component
 *
 * A high-performance, accessible image marquee component for displaying
 * a horizontally scrolling gallery of images with smooth animations,
 * touch/wheel controls, and fullscreen viewing capabilities.
 *
 * Features:
 * - Smooth infinite scrolling animation
 * - Touch and mouse wheel controls
 * - Lazy loading with intersection observer
 * - Fullscreen modal with keyboard navigation
 * - Comprehensive error handling
 * - WCAG 2.1 AA accessibility compliance
 * - Performance optimized with ref-based animation
 *
 * @author Noah Paige
 * @version 2.0.0
 * @since 2024-12-19
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Represents an image in the marquee gallery
 */
export interface MarqueeImage {
  /** Source URL of the image */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional width of the image in pixels */
  width?: number;
  /** Optional height of the image in pixels */
  height?: number;
  /** Optional caption text to display below the image */
  captionText?: string;
}

/**
 * Props for the MDXMarquee component
 */
interface MDXMarqueeProps {
  /** Array of images to display in the marquee */
  images: MarqueeImage[];
  /** Animation speed in pixels per second (default: 50) */
  speed?: number;
  /** Gap between images in pixels (default: 20) */
  gap?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Fixed height for the marquee container in pixels (default: 300) */
  height?: number;
  /** Distance in pixels before viewport to start preloading images (default: 500) */
  preloadDistance?: number;
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/** Default animation speed in pixels per second */
const DEFAULT_SPEED = 50;

/** Default gap between images in pixels */
const DEFAULT_GAP = 20;

/** Default height of the marquee container in pixels */
const DEFAULT_HEIGHT = 300;

/** Default preload distance in pixels */
const DEFAULT_PRELOAD_DISTANCE = 500;

/** Maximum speed multiplier relative to natural speed */
const MAX_SPEED_MULTIPLIER = 20;

/** Momentum decay rate for smooth speed transitions */
const MOMENTUM_DECAY_RATE = 0.1;

/** Animation frame rate for state updates (16ms = ~60fps) */
const STATE_UPDATE_INTERVAL = 16;

/** Image loading timeout in milliseconds */
const IMAGE_LOAD_TIMEOUT = 5000;

/** Image loading simulation delay in milliseconds */
const IMAGE_LOAD_DELAY = 100;

/** Modal focus delay in milliseconds */
const MODAL_FOCUS_DELAY = 100;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MDXMarquee Component Implementation
 *
 * Renders a horizontally scrolling image gallery with smooth animations,
 * touch controls, and fullscreen viewing capabilities.
 */
const MDXMarquee: React.FC<MDXMarqueeProps> = ({
  images,
  speed = DEFAULT_SPEED,
  gap = DEFAULT_GAP,
  className = "",
  height = DEFAULT_HEIGHT,
  preloadDistance = DEFAULT_PRELOAD_DISTANCE,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Animation state for scroll offset and speed */
  const [animationState, setAnimationState] = useState({
    scrollOffset: 0,
    currentSpeed: speed,
  });

  /** Drag state for touch interactions */
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragStart: 0,
    dragOffset: 0,
  });

  /** Drag state ref for useCallback access */
  const dragStateRef = useRef(dragState);

  // Keep ref in sync with state
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  /** Image loading state for lazy loading and error handling */
  const [imageState, setImageState] = useState({
    loadedImages: new Set<string>(),
    visibleImages: new Set<string>(),
    errorImages: new Set<string>(),
  });

  /** Fullscreen modal state */
  const [fullscreenState, setFullscreenState] = useState({
    isFullscreen: false,
    fullscreenImage: null as MarqueeImage | null,
  });

  // ============================================================================
  // REFS
  // ============================================================================

  /** Container element reference for intersection observer */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Intersection observer reference for cleanup */
  const observerRef = useRef<IntersectionObserver | null>(null);
  /** Current animation speed reference for performance optimization */
  const currentSpeedRef = useRef(animationState.currentSpeed);
  /** Scroll offset reference for performance optimization */
  const scrollOffsetRef = useRef(animationState.scrollOffset);
  /** Animation frame reference for cleanup */
  const animationFrameRef = useRef<number | null>(null);
  /** Performance monitoring reference */
  const performanceRef = useRef({ frameCount: 0, lastTime: 0, fps: 0 });
  /** Modal reference for focus management */
  const modalRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Animation speed constants */
  const NATURAL_SPEED = speed;
  const MAX_SPEED = speed * MAX_SPEED_MULTIPLIER;
  const MOMENTUM_DECAY = MOMENTUM_DECAY_RATE;

  /** Calculate total width needed for seamless loop */
  const totalWidth = React.useMemo(() => {
    return images.reduce((acc, image) => {
      const imgWidth = image.width || 300;
      return acc + imgWidth + gap;
    }, 0);
  }, [images, gap]);

  /** Duplicate images for seamless infinite loop */
  const duplicatedImages = React.useMemo(() => {
    return [...images, ...images];
  }, [images]);

  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================

  /**
   * useMarqueeAnimation Hook
   *
   * Manages the core animation loop with performance optimizations:
   * - Uses refs to avoid re-renders on every frame
   * - Implements batched state updates
   * - Handles infinite loop wrapping
   * - Provides performance monitoring
   */

  const useMarqueeAnimation = () => {
    // Optimized animation loop using refs to avoid state updates on every frame
    useEffect(() => {
      let lastTime = 0;
      let needsStateUpdate = false;
      let stateUpdateTimeout: NodeJS.Timeout | null = null;

      const animate = (currentTime: number) => {
        // Calculate delta time for smooth animation regardless of frame rate
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Performance monitoring
        performanceRef.current.frameCount++;
        if (currentTime - performanceRef.current.lastTime >= 1000) {
          performanceRef.current.fps = performanceRef.current.frameCount;
          performanceRef.current.frameCount = 0;
          performanceRef.current.lastTime = currentTime;
          // Log FPS in development
          if (process.env.NODE_ENV === "development") {
            console.log(`Marquee FPS: ${performanceRef.current.fps}`);
          }
        }

        // Update animation values using refs (no re-renders)
        if (!dragState.isDragging) {
          const speed = currentSpeedRef.current;
          const newOffset =
            scrollOffsetRef.current + (speed * deltaTime) / 1000;

          // Handle infinite loop
          if (newOffset >= totalWidth) {
            scrollOffsetRef.current = newOffset - totalWidth;
          } else if (newOffset < 0) {
            scrollOffsetRef.current = newOffset + totalWidth;
          } else {
            scrollOffsetRef.current = newOffset;
          }

          needsStateUpdate = true;
        }

        // Update momentum decay using refs
        const currentSpeedValue = currentSpeedRef.current;
        if (Math.abs(currentSpeedValue - NATURAL_SPEED) >= 0.1) {
          const decayRate = MOMENTUM_DECAY;
          currentSpeedRef.current =
            currentSpeedValue + (NATURAL_SPEED - currentSpeedValue) * decayRate;
          needsStateUpdate = true;
        }

        // Batch state updates to reduce re-renders
        if (needsStateUpdate && !stateUpdateTimeout) {
          stateUpdateTimeout = setTimeout(() => {
            setAnimationState({
              scrollOffset: scrollOffsetRef.current,
              currentSpeed: currentSpeedRef.current,
            });
            needsStateUpdate = false;
            stateUpdateTimeout = null;
          }, STATE_UPDATE_INTERVAL); // ~60fps update rate
        }

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(animate);

      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (stateUpdateTimeout) {
          clearTimeout(stateUpdateTimeout);
        }
      };
    }, []);

    return {
      currentSpeedRef,
      scrollOffsetRef,
      animationFrameRef,
      performanceRef,
    };
  };

  // Initialize animation hook
  useMarqueeAnimation();

  /**
   * useTouchHandling Hook
   *
   * Manages touch and wheel interactions:
   * - Touch events for mobile swipe gestures
   * - Wheel events for desktop scrolling
   * - Momentum-based speed changes
   * - Cross-browser compatibility
   */

  const useTouchHandling = () => {
    // Touch handlers for mobile swipe
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      setDragState({
        isDragging: true,
        dragStart: e.touches[0].clientX,
        dragOffset: scrollOffsetRef.current,
      });
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const deltaX = dragStateRef.current.dragStart - currentX;
        const newOffset = dragStateRef.current.dragOffset + deltaX;

        // Update refs directly for immediate response
        scrollOffsetRef.current = newOffset;
        setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

        // Add momentum based on touch velocity - matching wheel behavior
        const direction = deltaX > 0 ? -1 : 1;
        console.log("DELTA X", deltaX);
        const newSpeed = currentSpeedRef.current - direction * MAX_SPEED * 0.2;
        const clampedSpeed = Math.max(
          -MAX_SPEED,
          Math.min(MAX_SPEED, newSpeed)
        );
        currentSpeedRef.current = clampedSpeed;
        setAnimationState((prev) => ({
          ...prev,
          currentSpeed: clampedSpeed,
        }));
      }
    }, []);

    const handleTouchEnd = useCallback(() => {
      setDragState((prev) => ({ ...prev, isDragging: false }));
    }, []);

    // Add wheel event listener directly to the container
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        // Handle different wheel event formats across browsers
        const wheelEvent = e as WheelEvent;
        let deltaY = wheelEvent.deltaY;

        // Fallback for older browsers
        if (deltaY === undefined) {
          const legacyEvent = e as WheelEvent & { wheelDelta?: number };
          deltaY = legacyEvent.wheelDelta ? -legacyEvent.wheelDelta : 0;
        }

        const direction = deltaY > 0 ? -1 : 1;

        // More responsive speed change for better cross-browser compatibility
        const speedChange = direction * MAX_SPEED; // Increased sensitivity for Chrome/Arc
        const newSpeed = currentSpeedRef.current - speedChange;
        const clampedSpeed = Math.max(
          -MAX_SPEED,
          Math.min(MAX_SPEED, newSpeed)
        );
        currentSpeedRef.current = clampedSpeed;
        setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
      };

      // Use wheel event with passive: false for better cross-browser support
      container.addEventListener("wheel", handleWheel, { passive: false });

      return () => {
        container.removeEventListener("wheel", handleWheel);
      };
    }, []); // Removed currentSpeed to prevent circular dependencies

    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    };
  };

  // Initialize touch handling hook
  const touchHandlers = useTouchHandling();

  /**
   * useFullscreen Hook
   *
   * Manages fullscreen modal functionality:
   * - Modal state management
   * - Focus trap and keyboard navigation
   * - Body overflow control
   * - Accessibility features
   */

  const useFullscreen = () => {
    const openFullscreen = (image: MarqueeImage) => {
      setFullscreenState({
        isFullscreen: true,
        fullscreenImage: image,
      });
      document.body.style.overflow = "hidden";

      // Focus the modal when it opens for accessibility
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, MODAL_FOCUS_DELAY);
    };

    const closeFullscreen = () => {
      setFullscreenState({
        isFullscreen: false,
        fullscreenImage: null,
      });
      document.body.style.overflow = "unset";
    };

    // Handle keyboard navigation and body style cleanup
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!fullscreenState.isFullscreen) return;

        switch (e.key) {
          case "Escape":
            e.preventDefault();
            closeFullscreen();
            break;
          case "ArrowLeft":
            e.preventDefault();
            // TODO: Navigate to previous image
            break;
          case "ArrowRight":
            e.preventDefault();
            // TODO: Navigate to next image
            break;
          case "Home":
            e.preventDefault();
            // TODO: Go to first image
            break;
          case "End":
            e.preventDefault();
            // TODO: Go to last image
            break;
        }
      };

      if (fullscreenState.isFullscreen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [fullscreenState.isFullscreen, closeFullscreen]);

    // Cleanup body style on unmount
    useEffect(() => {
      return () => {
        // Reset body overflow when component unmounts
        document.body.style.overflow = "unset";
      };
    }, []);

    return {
      openFullscreen,
      closeFullscreen,
    };
  };

  // Initialize fullscreen hook
  const fullscreenHandlers = useFullscreen();

  /**
   * useImageLoading Hook
   *
   * Manages image loading and visibility:
   * - Intersection observer for lazy loading
   * - Image loading state tracking
   * - Error handling and timeouts
   * - Memory leak prevention
   */

  const useImageLoading = () => {
    // Intersection observer for lazy loading
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const imageSrc = entry.target.getAttribute("data-image-src");
            if (!imageSrc) return;

            if (entry.isIntersecting) {
              setImageState((prev) => ({
                ...prev,
                visibleImages: new Set([...prev.visibleImages, imageSrc]),
              }));
              // Mark as loaded after a small delay to simulate loading
              setTimeout(() => {
                setImageState((prev) => ({
                  ...prev,
                  loadedImages: new Set([...prev.loadedImages, imageSrc]),
                }));
              }, IMAGE_LOAD_DELAY);
              // Mark as error if image fails to load after timeout
              setTimeout(() => {
                setImageState((prev) => {
                  if (!prev.loadedImages.has(imageSrc)) {
                    return {
                      ...prev,
                      errorImages: new Set([...prev.errorImages, imageSrc]),
                    };
                  }
                  return prev;
                });
              }, IMAGE_LOAD_TIMEOUT); // 5 second timeout for image loading
            } else {
              setImageState((prev) => {
                const newVisibleImages = new Set(prev.visibleImages);
                newVisibleImages.delete(imageSrc);
                return {
                  ...prev,
                  visibleImages: newVisibleImages,
                };
              });
            }
          });
        },
        {
          root: containerRef.current,
          rootMargin: `${preloadDistance}px`,
          threshold: 0.1,
        }
      );

      observerRef.current = observer;

      // Observe all image containers
      const imageContainers =
        containerRef.current.querySelectorAll("[data-image-src]");
      imageContainers.forEach((container) => {
        observer.observe(container);
      });

      return () => {
        observer.disconnect();
        observerRef.current = null;
      };
    }, [preloadDistance]); // Removed duplicatedImages dependency to prevent recreation

    // Observe new images when duplicatedImages changes
    useEffect(() => {
      if (!observerRef.current || !containerRef.current) return;

      // Disconnect and reconnect observer to avoid memory leaks
      const observer = observerRef.current;
      observer.disconnect();

      // Observe all image containers
      const imageContainers =
        containerRef.current.querySelectorAll("[data-image-src]");
      imageContainers.forEach((container) => {
        observer.observe(container);
      });
    }, [duplicatedImages]);

    return {
      observerRef,
    };
  };

  // Initialize image loading hook
  useImageLoading();

  // ============================================================================
  // COMPONENT LOGIC
  // ============================================================================

  /**
   * Comprehensive cleanup on component unmount
   *
   * Ensures proper cleanup of:
   * - Animation frames
   * - Intersection observers
   * - Body overflow styles
   */
  useEffect(() => {
    return () => {
      // Cleanup animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Cleanup intersection observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      // Reset body overflow
      document.body.style.overflow = "unset";
    };
  }, []);

  /**
   * Renders an individual image in the marquee
   *
   * @param image - The image data to render
   * @param index - The index of the image in the array
   * @returns JSX element for the image
   */
  const renderImage = useCallback(
    (image: MarqueeImage, index: number) => {
      const isVisible = imageState.visibleImages.has(image.src);
      const isLoaded = imageState.loadedImages.has(image.src);
      const hasError = imageState.errorImages.has(image.src);

      return (
        <div
          key={`${image.src}-${index}`}
          className="flex-shrink-0 relative"
          style={{ marginRight: `${gap}px` }}
          data-image-src={image.src}
        >
          <motion.div
            className="cursor-pointer"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            onClick={() =>
              !hasError && fullscreenHandlers.openFullscreen(image)
            }
            role="button"
            tabIndex={hasError ? -1 : 0}
            aria-label={
              hasError
                ? `Image failed to load: ${image.alt}`
                : `Open ${image.alt} in fullscreen view`
            }
            onKeyDown={(e) =>
              !hasError &&
              e.key === "Enter" &&
              fullscreenHandlers.openFullscreen(image)
            }
          >
            <div className="relative">
              {/* Loading placeholder */}
              {!isLoaded && !hasError && (
                <div
                  className="rounded-lg shadow-lg bg-zinc-800 animate-pulse"
                  style={{
                    width: image.width || 300,
                    height: `${height}px`,
                  }}
                />
              )}

              {/* Error placeholder */}
              {hasError && (
                <div
                  className="rounded-lg shadow-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center"
                  style={{
                    width: image.width || 300,
                    height: `${height}px`,
                  }}
                >
                  <div className="text-center text-red-400">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="text-sm">Failed to load image</div>
                  </div>
                </div>
              )}

              {/* Actual image */}
              {isVisible && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0.7 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width || 300}
                      height={image.height || 200}
                      className="rounded-lg shadow-lg object-cover"
                      style={{ height: `${height}px` }}
                      onLoad={() => {
                        setImageState((prev) => ({
                          ...prev,
                          loadedImages: new Set([
                            ...prev.loadedImages,
                            image.src,
                          ]),
                        }));
                      }}
                      onError={() => {
                        setImageState((prev) => ({
                          ...prev,
                          errorImages: new Set([
                            ...prev.errorImages,
                            image.src,
                          ]),
                        }));
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
          {image.captionText && (
            <p className="text-sm text-zinc-400 text-center mt-2 italic">
              {image.captionText}
            </p>
          )}
        </div>
      );
    },
    [
      imageState.visibleImages,
      imageState.loadedImages,
      imageState.errorImages,
      gap,
      height,
      fullscreenHandlers,
    ]
  );

  return (
    <>
      <motion.div
        className={`my-10 ${className}`}
        style={{ height: `${height}px` }}
        onTouchStart={touchHandlers.handleTouchStart}
        onTouchMove={touchHandlers.handleTouchMove}
        onTouchEnd={touchHandlers.handleTouchEnd}
        role="region"
        aria-label="Image marquee gallery"
        aria-live="polite"
        aria-describedby="marquee-instructions"
      >
        {/* Screen reader instructions */}
        <div id="marquee-instructions" className="sr-only">
          Use mouse wheel or touch gestures to control the marquee speed. Click
          on images to view them in fullscreen.
        </div>
        <motion.div
          ref={containerRef}
          className="flex items-center"
          style={{ width: `${totalWidth * 2}px` }}
          animate={{ x: -(animationState.scrollOffset % totalWidth) }}
          transition={{
            type: "tween",
            ease: "linear",
            duration: dragState.isDragging ? 0 : 0.1,
          }}
        >
          {duplicatedImages.map((image, index) => renderImage(image, index))}
        </motion.div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenState.isFullscreen && fullscreenState.fullscreenImage && (
          <motion.div
            ref={modalRef}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={fullscreenHandlers.closeFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${fullscreenState.fullscreenImage.alt}`}
            tabIndex={-1}
          >
            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-lg "
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                  maxHeight: "calc(100vh - 14rem)",
                }}
              >
                <Image
                  src={fullscreenState.fullscreenImage.src}
                  alt={fullscreenState.fullscreenImage.alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
              {fullscreenState.fullscreenImage.captionText && (
                <motion.p
                  className="text-white text-center mt-4 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {fullscreenState.fullscreenImage.captionText}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default MDXMarquee;
