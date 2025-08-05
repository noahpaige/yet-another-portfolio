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
 * - Blur placeholder for smooth loading experience
 *
 * @author Noah Paige
 * @version 2.3.0
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
  /** Optional base64 encoded placeholder for blur-up effect */
  placeholder?: string;
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

/** Momentum transfer factor (0-1) */
const MOMENTUM_TRANSFER = 0.8;

/** Minimum velocity threshold for momentum transfer */
const MIN_VELOCITY_THRESHOLD = 50;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MDXMarquee Component Implementation
 *
 * Renders a horizontally scrolling image gallery with smooth animations,
 * touch controls, and fullscreen viewing capabilities.
 *
 * Features:
 * - Smooth infinite scroll animation with momentum
 * - Touch and mouse drag controls with pause/resume
 * - Fullscreen modal with keyboard navigation
 * - Comprehensive error handling
 * - WCAG 2.1 AA accessibility compliance
 * - Performance optimized with ref-based animation
 * - Blur placeholder for smooth loading experience
 * - Lazy loading with intersection observer for optimal performance
 *
 * @author Noah Paige
 * @version 2.3.0
 * @since 2024-12-19
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
    isMouseDown: false, // Track if mouse is down (regardless of movement)
    isTouchDown: false, // Track if touch is down (regardless of movement)
    dragStart: 0,
    dragOffset: 0,
    lastPosition: 0,
    lastTime: 0,
    velocity: 0,
    isMouseDrag: false,
    hasMoved: false, // Track if user has moved during drag
    dragThreshold: 5, // Minimum pixels to move before considering it a drag
  });

  /** Drag state ref for useCallback access */
  const dragStateRef = useRef(dragState);

  // Keep ref in sync with state
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  /** Ref to track if a drag operation occurred during the current mouse/touch session */
  const dragOccurredRef = useRef(false);

  /** Interaction state ref for animation loop access */
  const interactionStateRef = useRef({
    isMouseDown: false,
    isTouchDown: false,
    isDragging: false,
  });

  // Keep interaction ref in sync with drag state
  useEffect(() => {
    interactionStateRef.current = {
      isMouseDown: dragState.isMouseDown,
      isTouchDown: dragState.isTouchDown,
      isDragging: dragState.isDragging,
    };
  }, [dragState.isMouseDown, dragState.isTouchDown, dragState.isDragging]);

  /** Image loading state for lazy loading and error handling */
  const [imageState, setImageState] = useState({
    loadedImages: new Set<string>(),
    visibleImages: new Set<string>(),
    errorImages: new Set<string>(),
    loadingImages: new Set<string>(), // Images currently loading
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
    // Use 2x duplication for seamless infinite scrolling
    return Array(2).fill(images).flat();
  }, [images]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Applies momentum to the marquee based on final velocity
   * @param finalVelocity - The final velocity from drag interaction
   */
  const applyMomentum = useCallback((finalVelocity: number) => {
    if (Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
      const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER; // Negative because we want opposite direction
      const clampedSpeed = Math.max(
        -MAX_SPEED,
        Math.min(MAX_SPEED, momentumSpeed)
      );
      currentSpeedRef.current = clampedSpeed;
      setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
    } else {
      // Gradually resume natural speed if no significant velocity
      currentSpeedRef.current = NATURAL_SPEED * 0.1;
      setAnimationState((prev) => ({
        ...prev,
        currentSpeed: NATURAL_SPEED * 0.1,
      }));
    }
  }, []);

  /**
   * Unified interaction handler for both touch and mouse events
   * @param clientX - The client X coordinate
   * @param isTouch - Whether this is a touch event
   */
  const handleInteractionStart = useCallback(
    (clientX: number, isTouch: boolean) => {
      const now = Date.now();
      setDragState({
        isDragging: true,
        isMouseDown: !isTouch,
        isTouchDown: isTouch,
        dragStart: clientX,
        dragOffset: scrollOffsetRef.current,
        lastPosition: clientX,
        lastTime: now,
        velocity: 0,
        isMouseDrag: !isTouch,
        hasMoved: false,
        dragThreshold: 5,
      });

      // Stop the marquee during drag
      currentSpeedRef.current = 0;
      setAnimationState((prev) => ({ ...prev, currentSpeed: 0 }));
    },
    []
  );

  const handleInteractionMove = useCallback((clientX: number) => {
    if (dragStateRef.current.isDragging) {
      const now = Date.now();
      const deltaX = dragStateRef.current.dragStart - clientX;

      // Check if user has moved enough to consider it a drag
      const hasMoved = Math.abs(deltaX) > dragStateRef.current.dragThreshold;

      if (hasMoved) {
        // Mark that a drag operation occurred
        dragOccurredRef.current = true;

        const newOffset = dragStateRef.current.dragOffset + deltaX;

        // Calculate velocity for momentum transfer
        const timeDelta = now - dragStateRef.current.lastTime;
        const positionDelta = clientX - dragStateRef.current.lastPosition;
        const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0; // pixels per second

        // Update refs directly for immediate response
        scrollOffsetRef.current = newOffset;
        setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

        // Update drag state with new position and velocity
        setDragState((prev) => ({
          ...prev,
          lastPosition: clientX,
          lastTime: now,
          velocity: velocity,
          hasMoved: true,
        }));
      }
    }
  }, []);

  const handleInteractionEnd = useCallback(() => {
    const finalVelocity = dragStateRef.current.velocity;
    const hasMoved = dragStateRef.current.hasMoved;

    // Only apply momentum if user actually dragged
    if (hasMoved) {
      applyMomentum(finalVelocity);
    } else {
      // If no drag occurred, resume natural speed immediately
      currentSpeedRef.current = NATURAL_SPEED;
      setAnimationState((prev) => ({ ...prev, currentSpeed: NATURAL_SPEED }));
    }

    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      isMouseDown: false,
      isTouchDown: false,
      velocity: 0,
      isMouseDrag: false,
      hasMoved: false,
    }));
  }, []);

  /**
   * iOS Safari scrolling fix - multi-step process to reset internal scroll state
   * This function is duplicated in multiple places, so we've extracted it here
   */
  const fixIOSScrolling = useCallback(() => {
    // Step 1: Trigger scroll events to wake up iOS Safari's scroll handling
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));

    // Step 2: Enable touch scrolling explicitly
    document.body.style.setProperty("-webkit-overflow-scrolling", "touch");
    document.body.style.setProperty("overflow-scrolling", "touch");

    // Step 3: Force scroll position reset
    const currentScrollY = window.scrollY;
    window.scrollTo(0, currentScrollY + 1);
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 10);

    // Step 4: Set overflow properties
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";

    // Step 5: Dispatch touch event to re-enable touch scrolling
    const touchEvent = new TouchEvent("touchstart", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    document.dispatchEvent(touchEvent);

    // Step 6: Force layout recalculation
    document.body.style.display = "none";
    void document.body.offsetHeight;
    document.body.style.display = "";
  }, []);

  // ============================================================================
  // EFFECTS AND EVENT HANDLERS
  // ============================================================================

  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    let needsStateUpdate = false;
    let stateUpdateTimeout: NodeJS.Timeout | null = null;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const isInteracting =
        interactionStateRef.current.isMouseDown ||
        interactionStateRef.current.isTouchDown ||
        interactionStateRef.current.isDragging;

      if (!isInteracting) {
        const speed = currentSpeedRef.current;
        const newOffset = scrollOffsetRef.current + (speed * deltaTime) / 1000;

        // Handle infinite loop
        if (newOffset >= totalWidth) {
          scrollOffsetRef.current = newOffset - totalWidth;
        } else if (newOffset < 0) {
          scrollOffsetRef.current = newOffset + totalWidth;
        } else {
          scrollOffsetRef.current = newOffset;
        }

        needsStateUpdate = true;
      } else {
        needsStateUpdate = false;
      }

      // Update momentum decay
      if (!isInteracting) {
        const currentSpeedValue = currentSpeedRef.current;
        if (Math.abs(currentSpeedValue - NATURAL_SPEED) >= 0.1) {
          const decayRate = MOMENTUM_DECAY;
          currentSpeedRef.current =
            currentSpeedValue + (NATURAL_SPEED - currentSpeedValue) * decayRate;
          needsStateUpdate = true;
        }
      } else {
        if (Math.abs(currentSpeedRef.current) > 0.1) {
          currentSpeedRef.current = 0;
          needsStateUpdate = true;
        }
      }

      // Batch state updates
      if (needsStateUpdate && !stateUpdateTimeout) {
        stateUpdateTimeout = setTimeout(() => {
          setAnimationState({
            scrollOffset: scrollOffsetRef.current,
            currentSpeed: currentSpeedRef.current,
          });
          needsStateUpdate = false;
          stateUpdateTimeout = null;
        }, 16);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (stateUpdateTimeout) {
        clearTimeout(stateUpdateTimeout);
      }
    };
  }, []);

  // Wheel event handling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const wheelEvent = e as WheelEvent;
      let deltaY = wheelEvent.deltaY;

      if (deltaY === undefined) {
        const legacyEvent = e as WheelEvent & { wheelDelta?: number };
        deltaY = legacyEvent.wheelDelta ? -legacyEvent.wheelDelta : 0;
      }

      const direction = deltaY > 0 ? -1 : 1;
      const speedChange = direction * MAX_SPEED;
      const newSpeed = currentSpeedRef.current - speedChange;
      const clampedSpeed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, newSpeed));
      currentSpeedRef.current = clampedSpeed;
      setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current.isDragging && dragStateRef.current.isMouseDrag) {
        handleInteractionMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragStateRef.current.isMouseDrag) {
        handleInteractionEnd();
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  /**
   * Navigate to the previous image in fullscreen mode
   */
  const navigateToPreviousImage = useCallback(() => {
    if (!fullscreenState.fullscreenImage) return;

    const currentIndex = images.findIndex(
      (img) => img.src === fullscreenState.fullscreenImage?.src
    );

    if (currentIndex === -1) return;

    const previousIndex =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const previousImage = images[previousIndex];

    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: previousImage,
    });
  }, [fullscreenState.fullscreenImage, images]);

  /**
   * Navigate to the next image in fullscreen mode
   */
  const navigateToNextImage = useCallback(() => {
    if (!fullscreenState.fullscreenImage) return;

    const currentIndex = images.findIndex(
      (img) => img.src === fullscreenState.fullscreenImage?.src
    );

    if (currentIndex === -1) return;

    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    const nextImage = images[nextIndex];

    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: nextImage,
    });
  }, [fullscreenState.fullscreenImage, images]);

  /**
   * Navigate to the first image in fullscreen mode
   */
  const navigateToFirstImage = useCallback(() => {
    if (images.length === 0) return;

    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: images[0],
    });
  }, [images]);

  /**
   * Navigate to the last image in fullscreen mode
   */
  const navigateToLastImage = useCallback(() => {
    if (images.length === 0) return;

    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: images[images.length - 1],
    });
  }, [images]);

  // Fullscreen keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenState.isFullscreen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setFullscreenState({
            isFullscreen: false,
            fullscreenImage: null,
          });
          setTimeout(fixIOSScrolling, 50);
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateToPreviousImage();
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateToNextImage();
          break;
        case "Home":
          e.preventDefault();
          navigateToFirstImage();
          break;
        case "End":
          e.preventDefault();
          navigateToLastImage();
          break;
      }
    };

    if (fullscreenState.isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [
    fullscreenState.isFullscreen,
    navigateToPreviousImage,
    navigateToNextImage,
    navigateToFirstImage,
    navigateToLastImage,
  ]);

  // Image loading with intersection observer
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
              loadingImages: new Set([...prev.loadingImages, imageSrc]),
            }));

            setTimeout(() => {
              setImageState((prev) => ({
                ...prev,
                loadedImages: new Set([...prev.loadedImages, imageSrc]),
                loadingImages: new Set(
                  [...prev.loadingImages].filter((src) => src !== imageSrc)
                ),
              }));
            }, 100);

            setTimeout(() => {
              setImageState((prev) => {
                if (!prev.loadedImages.has(imageSrc)) {
                  return {
                    ...prev,
                    errorImages: new Set([...prev.errorImages, imageSrc]),
                    loadingImages: new Set(
                      [...prev.loadingImages].filter((src) => src !== imageSrc)
                    ),
                  };
                }
                return prev;
              });
            }, 5000);
          } else {
            setImageState((prev) => {
              const newVisibleImages = new Set(prev.visibleImages);
              const newLoadingImages = new Set(prev.loadingImages);

              newVisibleImages.delete(imageSrc);
              newLoadingImages.delete(imageSrc);

              return {
                ...prev,
                visibleImages: newVisibleImages,
                loadingImages: newLoadingImages,
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

    const imageContainers =
      containerRef.current.querySelectorAll("[data-image-src]");
    imageContainers.forEach((container) => {
      observer.observe(container);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [preloadDistance]);

  // Observe new images when duplicatedImages changes
  useEffect(() => {
    if (!observerRef.current || !containerRef.current) return;

    const observer = observerRef.current;
    observer.disconnect();

    const imageContainers =
      containerRef.current.querySelectorAll("[data-image-src]");
    imageContainers.forEach((container) => {
      observer.observe(container);
    });
  }, [duplicatedImages]);

  // Fullscreen handlers
  const openFullscreen = (image: MarqueeImage) => {
    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: image,
    });
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
  };

  const closeFullscreen = () => {
    setFullscreenState({
      isFullscreen: false,
      fullscreenImage: null,
    });
    setTimeout(fixIOSScrolling, 50);
  };

  // Touch and mouse handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleInteractionStart(e.touches[0].clientX, true);
    },
    [handleInteractionStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault();
        handleInteractionMove(e.touches[0].clientX);
      }
    },
    [handleInteractionMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleInteractionEnd();
  }, [handleInteractionEnd]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragOccurredRef.current = false;
      handleInteractionStart(e.clientX, false);
    },
    [handleInteractionStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStateRef.current.isDragging && dragStateRef.current.isMouseDrag) {
        e.preventDefault();
        handleInteractionMove(e.clientX);
      }
    },
    [handleInteractionMove]
  );

  const handleMouseUp = useCallback(() => {
    if (dragStateRef.current.isMouseDrag) {
      handleInteractionEnd();
    }
  }, [handleInteractionEnd]);

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
   * - iOS Safari scrolling state
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

      // Apply the fix immediately on unmount
      fixIOSScrolling();
    };
  }, [fixIOSScrolling]);

  /**
   * Renders an individual image in the marquee
   *
   * @param image - The image data to render
   * @param index - The index of the image in the array
   * @returns JSX element for the image
   */
  const renderImage = useCallback(
    (image: MarqueeImage, index: number) => {
      const imageSrc = image.src;
      const isVisible = imageState.visibleImages.has(imageSrc);
      const isLoaded = imageState.loadedImages.has(imageSrc);
      const isLoading = imageState.loadingImages.has(imageSrc);
      const hasError = imageState.errorImages.has(imageSrc);

      // Determine if we should show the image
      const shouldShowImage = isVisible && isLoaded;

      return (
        <div
          key={`${image.src}-${index}`}
          className="flex-shrink-0 relative"
          style={{ marginRight: `${gap}px` }}
          data-image-src={image.src}
          data-small-image-src={image.src}
        >
          <motion.div
            className="cursor-pointer"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            onClick={() => {
              // Only open fullscreen if no drag occurred and we have a loaded image
              if (!hasError && !dragOccurredRef.current && isLoaded) {
                openFullscreen(image);
              }
            }}
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
              isLoaded &&
              openFullscreen(image)
            }
          >
            <div className="relative">
              {/* Loading placeholder */}
              {!shouldShowImage && !hasError && (
                <div
                  className="rounded-md shadow-lg bg-zinc-800 animate-pulse"
                  style={{
                    width: image.width || 300,
                    height: `${height}px`,
                  }}
                />
              )}

              {/* Error placeholder */}
              {hasError && (
                <div
                  className="rounded-md shadow-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center"
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
              {shouldShowImage && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={imageSrc}
                      alt={image.alt}
                      width={image.width || 300}
                      height={image.height || 200}
                      className="rounded-md shadow-lg object-cover"
                      style={{ height: `${height}px` }}
                      placeholder={image.placeholder ? "blur" : "empty"}
                      blurDataURL={image.placeholder}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3} // Prioritize first 3 images
                      onLoad={() => {
                        setImageState((prev) => ({
                          ...prev,
                          loadedImages: new Set([
                            ...prev.loadedImages,
                            imageSrc,
                          ]),
                          loadingImages: new Set(
                            [...prev.loadingImages].filter(
                              (src) => src !== imageSrc
                            )
                          ),
                        }));
                      }}
                      onError={() => {
                        setImageState((prev) => ({
                          ...prev,
                          errorImages: new Set([...prev.errorImages, imageSrc]),
                          loadingImages: new Set(
                            [...prev.loadingImages].filter(
                              (src) => src !== imageSrc
                            )
                          ),
                        }));
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Loading indicator overlay */}
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
                  <div className="text-white text-sm">Loading...</div>
                </div>
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
      imageState.loadingImages,
      imageState.errorImages,
      gap,
      height,
    ]
  );

  return (
    <>
      <motion.div
        className={`my-10 ${className}`}
        style={{
          height: `${height}px`,
          position: "relative",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        role="region"
        aria-label="Image marquee gallery"
        aria-live="polite"
        aria-describedby="marquee-instructions"
      >
        {/* Screen reader instructions */}
        <div id="marquee-instructions" className="sr-only">
          Use mouse wheel, drag with mouse or touch, or touch gestures to
          control the marquee speed. Drag to pause and release to resume with
          momentum. Click on images to view them in fullscreen. In fullscreen
          mode, use arrow keys to navigate between images, Home/End to jump to
          first/last image, and Escape to close.
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
            onClick={closeFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${fullscreenState.fullscreenImage.alt}`}
            tabIndex={-1}
          >
            {/* Navigation buttons */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4">
              {/* Previous button */}
              <motion.button
                className="pointer-events-auto  hover:bg-black/20 text-white p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToPreviousImage();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous image"
                title="Previous image (←)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>

              {/* Next button */}
              <motion.button
                className="pointer-events-auto hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToNextImage();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next image"
                title="Next image (→)"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Image counter */}
            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {(() => {
                  const currentIndex = images.findIndex(
                    (img) => img.src === fullscreenState.fullscreenImage?.src
                  );
                  return `${currentIndex + 1} / ${images.length}`;
                })()}
              </div>
            </div>

            <motion.div
              className="flex flex-col items-center justify-center w-full h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-md flex-1 flex items-center justify-center"
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                  maxHeight: fullscreenState.fullscreenImage.captionText
                    ? "calc(100vh - 24rem)"
                    : "calc(100vh - 14rem)",
                }}
              >
                <Image
                  src={fullscreenState.fullscreenImage.src}
                  alt={fullscreenState.fullscreenImage.alt}
                  width={1920}
                  height={1080}
                  className="w-fit h-fit object-contain rounded-md"
                  placeholder={
                    fullscreenState.fullscreenImage.placeholder
                      ? "blur"
                      : "empty"
                  }
                  blurDataURL={fullscreenState.fullscreenImage.placeholder}
                />
              </div>
              {fullscreenState.fullscreenImage.captionText && (
                <motion.div
                  className="flex-shrink-0 px-4 py-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <p className="text-white text-center text-lg max-w-2xl">
                    {fullscreenState.fullscreenImage.captionText}
                  </p>
                </motion.div>
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
