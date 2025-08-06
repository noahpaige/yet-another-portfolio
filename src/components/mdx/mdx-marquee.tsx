"use client";

/**
 * MDXMarquee Component
 *
 * A high-performance, accessible image marquee component for displaying
 * a horizontally scrolling gallery of images with smooth animations,
 * touch/wheel controls, and fullscreen viewing capabilities.
 *
 * Features:
 * - Smooth infinite scrolling animation with momentum physics
 * - Touch and mouse wheel controls with pause/resume
 * - Direction-based image preloading for optimal performance
 * - Lazy loading with intersection observer
 * - Fullscreen modal with keyboard navigation and swipe gestures
 * - Fullscreen-synchronized carousel positioning
 * - Comprehensive error handling
 * - WCAG 2.1 AA accessibility compliance
 * - Performance optimized with ref-based animation
 * - Blur placeholder for smooth loading experience
 *
 * @author Noah Paige
 * @version 2.6.0
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

/** Background loading batch size - how many images to load per idle callback */
const BACKGROUND_LOAD_BATCH_SIZE = 2;

/** Background loading delay between batches in milliseconds */
const BACKGROUND_LOAD_DELAY = 100;

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

  /** Background loading state for loading all images during free time */
  const [backgroundLoadingState, setBackgroundLoadingState] = useState({
    isBackgroundLoading: false,
    backgroundLoadedCount: 0,
    backgroundErrorCount: 0,
  });

  /** Background loading refs for performance */
  const backgroundLoadingRef = useRef({
    isBackgroundLoading: false,
    unloadedImages: new Set<string>(),
    backgroundLoadedCount: 0,
    backgroundErrorCount: 0,
  });

  // Keep background loading refs in sync with state
  useEffect(() => {
    backgroundLoadingRef.current = {
      isBackgroundLoading: backgroundLoadingState.isBackgroundLoading,
      unloadedImages: new Set(
        images
          .map((img) => img.src)
          .filter(
            (src) =>
              !imageState.loadedImages.has(src) &&
              !imageState.errorImages.has(src)
          )
      ),
      backgroundLoadedCount: backgroundLoadingState.backgroundLoadedCount,
      backgroundErrorCount: backgroundLoadingState.backgroundErrorCount,
    };
  }, [
    backgroundLoadingState,
    imageState.loadedImages,
    imageState.errorImages,
    images,
  ]);

  /** Fullscreen modal state */
  const [fullscreenState, setFullscreenState] = useState({
    isFullscreen: false,
    fullscreenImage: null as MarqueeImage | null,
  });

  /** Fullscreen position tracking and animation state */
  const [fullscreenPositionState, setFullscreenPositionState] = useState({
    targetImageIndex: -1,
    isPositioning: false,
    targetScrollOffset: 0,
    shouldResumeScrolling: false,
  });

  /** Swipe gesture state for fullscreen modal */
  const [swipeState, setSwipeState] = useState({
    isSwiping: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: 0,
    direction: null as "left" | "right" | "up" | "down" | null,
  });

  /** Swipe gesture refs for performance */
  const swipeStateRef = useRef(swipeState);
  const swipeStartTimeRef = useRef(0);
  /** Fullscreen position refs for performance */
  const fullscreenPositionRef = useRef(fullscreenPositionState);

  // Keep swipe refs in sync with state
  useEffect(() => {
    swipeStateRef.current = swipeState;
  }, [swipeState]);

  // Keep fullscreen position refs in sync with state
  useEffect(() => {
    fullscreenPositionRef.current = fullscreenPositionState;
  }, [fullscreenPositionState]);

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

  // Handle resuming scrolling after positioning
  useEffect(() => {
    if (fullscreenPositionState.shouldResumeScrolling) {
      // Reset the positioning state
      setFullscreenPositionState((prev) => ({
        ...prev,
        shouldResumeScrolling: false,
        targetImageIndex: -1,
        isPositioning: false,
        targetScrollOffset: 0,
      }));

      // Gradually resume natural scrolling speed
      currentSpeedRef.current = NATURAL_SPEED * 0.1;
    }
  }, [fullscreenPositionState.shouldResumeScrolling, NATURAL_SPEED]);

  // ============================================================================
  // REFS
  // ============================================================================

  /** Container element reference for intersection observer */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Intersection observer reference for cleanup */
  const observerRef = useRef<IntersectionObserver | null>(null);
  /** Current animation speed reference for performance optimization */
  const currentSpeedRef = useRef(speed);
  /** Scroll offset reference for performance optimization */
  const scrollOffsetRef = useRef(0);
  /** Animation frame reference for cleanup */
  const animationFrameRef = useRef<number | null>(null);
  /** Modal reference for focus management */
  const modalRef = useRef<HTMLDivElement>(null);
  /** Animation container ref for direct DOM manipulation */
  const animationContainerRef = useRef<HTMLDivElement>(null);
  /** Timeout ref for intersection observer debouncing */
  const intersectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  /** Previous scroll offset for direction detection */
  const previousScrollOffsetRef = useRef(0);
  /** Scroll direction: 1 for right (forward), -1 for left (backward), 0 for no movement */
  const scrollDirectionRef = useRef(0);
  /** Last scroll direction change time for debouncing */
  const lastDirectionChangeRef = useRef(0);
  /** Background loading timeout ref */
  const backgroundLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  /** Background loading idle callback ref */
  const backgroundLoadingIdleRef = useRef<number | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Background loading function that loads unloaded images during free time
   * Uses requestIdleCallback for optimal performance
   */
  const startBackgroundLoading = useCallback(() => {
    if (backgroundLoadingRef.current.isBackgroundLoading) return;

    const loadBatch = () => {
      const { unloadedImages } = backgroundLoadingRef.current;

      if (unloadedImages.size === 0) {
        // No more images to load
        setBackgroundLoadingState((prev) => ({
          ...prev,
          isBackgroundLoading: false,
        }));
        return;
      }

      // Take a batch of images to load
      const imagesToLoad = Array.from(unloadedImages).slice(
        0,
        BACKGROUND_LOAD_BATCH_SIZE
      );

      setBackgroundLoadingState((prev) => ({
        ...prev,
        isBackgroundLoading: true,
      }));

      // Simulate loading for each image in the batch
      imagesToLoad.forEach((imageSrc) => {
        // Remove from unloaded set
        backgroundLoadingRef.current.unloadedImages.delete(imageSrc);

        // Add to loading state
        setImageState((prev) => ({
          ...prev,
          loadingImages: new Set([...prev.loadingImages, imageSrc]),
        }));

        // Simulate image load after a short delay
        setTimeout(() => {
          setImageState((prev) => ({
            ...prev,
            loadedImages: new Set([...prev.loadedImages, imageSrc]),
            loadingImages: new Set(
              [...prev.loadingImages].filter((src) => src !== imageSrc)
            ),
          }));

          setBackgroundLoadingState((prev) => ({
            ...prev,
            backgroundLoadedCount: prev.backgroundLoadedCount + 1,
          }));
        }, BACKGROUND_LOAD_DELAY);

        // Set error timeout
        setTimeout(() => {
          setImageState((prev) => {
            if (prev.loadedImages.has(imageSrc)) {
              return prev; // Image already loaded, skip error handling
            }

            return {
              ...prev,
              errorImages: new Set([...prev.errorImages, imageSrc]),
              loadingImages: new Set(
                [...prev.loadingImages].filter((src) => src !== imageSrc)
              ),
            };
          });

          setBackgroundLoadingState((prev) => ({
            ...prev,
            backgroundErrorCount: prev.backgroundErrorCount + 1,
          }));
        }, 5000);
      });

      // Schedule next batch using requestIdleCallback
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        backgroundLoadingIdleRef.current = window.requestIdleCallback(
          () => {
            backgroundLoadingTimeoutRef.current = setTimeout(
              loadBatch,
              BACKGROUND_LOAD_DELAY
            );
          },
          { timeout: 1000 }
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        backgroundLoadingTimeoutRef.current = setTimeout(
          loadBatch,
          BACKGROUND_LOAD_DELAY * 2
        );
      }
    };

    // Start the background loading process
    loadBatch();
  }, []);

  /**
   * Stops background loading and cleans up resources
   */
  const stopBackgroundLoading = useCallback(() => {
    if (
      backgroundLoadingIdleRef.current &&
      typeof window !== "undefined" &&
      "cancelIdleCallback" in window
    ) {
      window.cancelIdleCallback(backgroundLoadingIdleRef.current);
      backgroundLoadingIdleRef.current = null;
    }

    if (backgroundLoadingTimeoutRef.current) {
      clearTimeout(backgroundLoadingTimeoutRef.current);
      backgroundLoadingTimeoutRef.current = null;
    }

    setBackgroundLoadingState((prev) => ({
      ...prev,
      isBackgroundLoading: false,
    }));
  }, []);

  /**
   * Applies momentum to the marquee based on final velocity
   * @param finalVelocity - The final velocity from drag interaction
   */
  const applyMomentum = useCallback(
    (finalVelocity: number) => {
      if (Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
        const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER; // Negative because we want opposite direction
        const clampedSpeed = Math.max(
          -MAX_SPEED,
          Math.min(MAX_SPEED, momentumSpeed)
        );
        currentSpeedRef.current = clampedSpeed;
        // No need to update state - the animation loop will handle the visual update
      } else {
        // Gradually resume natural speed if no significant velocity
        currentSpeedRef.current = NATURAL_SPEED * 0.1;
        // No need to update state - the animation loop will handle the visual update
      }
    },
    [MAX_SPEED, NATURAL_SPEED]
  );

  /**
   * Debounced intersection observer callback to reduce jitter
   * Enhanced with scroll direction-based preloading
   */
  const debouncedIntersectionCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (intersectionTimeoutRef.current) {
        clearTimeout(intersectionTimeoutRef.current);
      }

      intersectionTimeoutRef.current = setTimeout(() => {
        const currentDirection = scrollDirectionRef.current;

        entries.forEach((entry) => {
          const imageSrc = entry.target.getAttribute("data-image-src");
          if (!imageSrc) return;

          if (entry.isIntersecting) {
            setImageState((prev) => {
              // Check if image is already loaded to prevent loading state flash
              const isAlreadyLoaded = prev.loadedImages.has(imageSrc);
              const isAlreadyLoading = prev.loadingImages.has(imageSrc);

              // Only add to loading state if not already loaded and not already loading
              const newLoadingImages =
                isAlreadyLoaded || isAlreadyLoading
                  ? prev.loadingImages
                  : new Set([...prev.loadingImages, imageSrc]);

              return {
                ...prev,
                visibleImages: new Set([...prev.visibleImages, imageSrc]),
                loadingImages: newLoadingImages,
              };
            });

            // Only trigger loading logic if image is not already loaded
            setImageState((prev) => {
              if (prev.loadedImages.has(imageSrc)) {
                return prev; // Image already loaded, no need to process
              }
              return prev;
            });

            // Prioritize loading based on scroll direction
            const loadDelay = currentDirection !== 0 ? 50 : 100; // Faster loading in scroll direction

            // Simulate image load after a short delay (only if not already loaded)
            setTimeout(() => {
              setImageState((prev) => {
                if (prev.loadedImages.has(imageSrc)) {
                  return prev; // Image already loaded, skip
                }

                return {
                  ...prev,
                  loadedImages: new Set([...prev.loadedImages, imageSrc]),
                  loadingImages: new Set(
                    [...prev.loadingImages].filter((src) => src !== imageSrc)
                  ),
                };
              });
            }, loadDelay);

            // Set error timeout (only if not already loaded)
            setTimeout(() => {
              setImageState((prev) => {
                if (prev.loadedImages.has(imageSrc)) {
                  return prev; // Image already loaded, skip error handling
                }

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
            // Only remove from visible images, keep loaded images for backward scrolling
            setImageState((prev) => {
              const newVisibleImages = new Set(prev.visibleImages);
              const newLoadingImages = new Set(prev.loadingImages);

              newVisibleImages.delete(imageSrc);
              newLoadingImages.delete(imageSrc);

              return {
                ...prev,
                visibleImages: newVisibleImages,
                loadingImages: newLoadingImages,
                // Don't remove from loadedImages - keep them for backward scrolling
              };
            });
          }
        });
      }, 16); // 16ms debounce for 60fps
    },
    []
  );

  /**
   * Updates the intersection observer with direction-based root margins
   */
  const updateIntersectionObserver = useCallback(() => {
    if (!observerRef.current || !containerRef.current) return;

    const currentDirection = scrollDirectionRef.current;
    const baseMargin = preloadDistance;

    // Calculate direction-based root margins for optimized preloading
    let rootMargin: string;
    if (currentDirection === 1) {
      // Scrolling right (forward) - preload more ahead
      rootMargin = `${baseMargin}px ${
        baseMargin * 2
      }px ${baseMargin}px ${baseMargin}px`;
    } else if (currentDirection === -1) {
      // Scrolling left (backward) - preload more behind
      rootMargin = `${baseMargin}px ${baseMargin}px ${baseMargin}px ${
        baseMargin * 2
      }px`;
    } else {
      // No direction or stationary - preload equally in both directions
      rootMargin = `${baseMargin}px ${baseMargin}px ${baseMargin}px ${baseMargin}px`;
    }

    // Disconnect and recreate observer with new root margin
    observerRef.current.disconnect();

    const newObserver = new IntersectionObserver(
      debouncedIntersectionCallback,
      {
        root: containerRef.current,
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current = newObserver;

    // Re-observe all image containers
    const imageContainers =
      containerRef.current.querySelectorAll("[data-image-src]");
    imageContainers.forEach((container) => {
      newObserver.observe(container);
    });
  }, [preloadDistance, debouncedIntersectionCallback]);

  /**
   * Calculates the target scroll offset for positioning to a specific image
   */
  const calculateTargetScrollOffset = useCallback(
    (imageIndex: number) => {
      if (imageIndex < 0 || imageIndex >= images.length) return 0;

      let targetOffset = 0;

      // Calculate offset by summing up widths of all images before the target
      for (let i = 0; i < imageIndex; i++) {
        const image = images[i];
        const imageWidth = image.width || 300;
        targetOffset += imageWidth + gap;
      }

      // Center the image in the viewport (assuming viewport width is 100vw)
      const viewportWidth =
        typeof window !== "undefined" ? window.innerWidth : 1200;
      const targetImageWidth = images[imageIndex].width || 300;
      const centerOffset = (viewportWidth - targetImageWidth) / 2;

      targetOffset = Math.max(0, targetOffset - centerOffset);

      // Handle infinite loop - ensure the offset is within the total width
      if (targetOffset >= totalWidth) {
        targetOffset = targetOffset % totalWidth;
      }

      return targetOffset;
    },
    [images, gap, totalWidth]
  );

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
      // No need to update state - the animation loop will handle the visual update
    },
    []
  );

  const handleInteractionMove = useCallback(
    (clientX: number) => {
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
          const velocity =
            timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0; // pixels per second

          // Update refs directly for immediate response
          scrollOffsetRef.current = newOffset;

          // Apply transform directly to DOM for immediate visual feedback
          if (animationContainerRef.current) {
            const transformX = -(newOffset % totalWidth);
            animationContainerRef.current.style.transform = `translateX(${transformX}px)`;
          }

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
    },
    [totalWidth]
  );

  const handleInteractionEnd = useCallback(() => {
    const finalVelocity = dragStateRef.current.velocity;
    const hasMoved = dragStateRef.current.hasMoved;

    // Only apply momentum if user actually dragged
    if (hasMoved) {
      applyMomentum(finalVelocity);
    } else {
      // If no drag occurred, resume natural speed immediately
      currentSpeedRef.current = NATURAL_SPEED;
      // No need to update state - the animation loop will handle the visual update
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
  }, [applyMomentum, NATURAL_SPEED]);

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

  // Sync refs when speed prop changes
  useEffect(() => {
    currentSpeedRef.current = speed;
  }, [speed]);

  // Animation loop - optimized for performance using direct DOM manipulation
  // Enhanced with fullscreen positioning and pause functionality
  useEffect(() => {
    let lastTime = 0;
    let idleTime = 0; // Track idle time for background loading

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const isInteracting =
        interactionStateRef.current.isMouseDown ||
        interactionStateRef.current.isTouchDown ||
        interactionStateRef.current.isDragging;

      const isFullscreen = fullscreenState.isFullscreen;
      const isPositioning = fullscreenPositionRef.current.isPositioning;

      // Stop scrolling if fullscreen is open or positioning is in progress
      if (!isInteracting && !isFullscreen && !isPositioning) {
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

        // Track scroll direction for preloading optimization
        // This enables direction-based image preloading for smoother performance
        const currentOffset = scrollOffsetRef.current;
        const previousOffset = previousScrollOffsetRef.current;

        if (Math.abs(currentOffset - previousOffset) > 1) {
          const direction = currentOffset > previousOffset ? 1 : -1;
          const now = Date.now();

          // Only update direction if it's been stable for a short time (debounce)
          if (
            direction !== scrollDirectionRef.current ||
            now - lastDirectionChangeRef.current > 100
          ) {
            const previousDirection = scrollDirectionRef.current;
            scrollDirectionRef.current = direction;
            lastDirectionChangeRef.current = now;

            // Update intersection observer when direction changes for optimized preloading
            if (previousDirection !== direction) {
              // Debounce the observer update to avoid excessive reconnections
              setTimeout(() => {
                updateIntersectionObserver();
              }, 50);
            }
          }

          previousScrollOffsetRef.current = currentOffset;
          idleTime = 0; // Reset idle time when scrolling
        } else {
          // No scrolling - accumulate idle time
          idleTime += deltaTime;

          // Start background loading after 2 seconds of idle time
          if (
            idleTime > 2000 &&
            !backgroundLoadingRef.current.isBackgroundLoading
          ) {
            startBackgroundLoading();
          }
        }

        // Apply transform directly to DOM for better performance
        if (animationContainerRef.current) {
          const transformX = -(scrollOffsetRef.current % totalWidth);
          animationContainerRef.current.style.transform = `translateX(${transformX}px)`;
        }
      } else if (isPositioning) {
        // Handle positioning animation
        const targetOffset = fullscreenPositionRef.current.targetScrollOffset;
        const currentOffset = scrollOffsetRef.current;
        let distance = targetOffset - currentOffset;

        // Handle infinite loop wrapping for positioning
        if (Math.abs(distance) > totalWidth / 2) {
          if (distance > 0) {
            distance -= totalWidth;
          } else {
            distance += totalWidth;
          }
        }

        // Smooth positioning animation
        const positioningSpeed = 1000; // pixels per second
        const maxDistance = positioningSpeed * (deltaTime / 1000);

        if (Math.abs(distance) > 1) {
          const step =
            Math.sign(distance) * Math.min(Math.abs(distance), maxDistance);
          scrollOffsetRef.current += step;

          // Handle wrapping during positioning
          if (scrollOffsetRef.current >= totalWidth) {
            scrollOffsetRef.current -= totalWidth;
          } else if (scrollOffsetRef.current < 0) {
            scrollOffsetRef.current += totalWidth;
          }

          // Apply transform directly to DOM
          if (animationContainerRef.current) {
            const transformX = -(scrollOffsetRef.current % totalWidth);
            animationContainerRef.current.style.transform = `translateX(${transformX}px)`;
          }
        } else {
          // Positioning complete
          scrollOffsetRef.current = targetOffset;
          setFullscreenPositionState((prev) => ({
            ...prev,
            isPositioning: false,
            shouldResumeScrolling: true,
          }));
        }
      }

      // Update momentum decay (only when not positioning)
      if (!isInteracting && !isFullscreen && !isPositioning) {
        const currentSpeedValue = currentSpeedRef.current;
        if (Math.abs(currentSpeedValue - NATURAL_SPEED) >= 0.1) {
          const decayRate = MOMENTUM_DECAY;
          currentSpeedRef.current =
            currentSpeedValue + (NATURAL_SPEED - currentSpeedValue) * decayRate;
        }
      } else {
        if (Math.abs(currentSpeedRef.current) > 0.1) {
          currentSpeedRef.current = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    totalWidth,
    NATURAL_SPEED,
    MOMENTUM_DECAY,
    updateIntersectionObserver,
    fullscreenState.isFullscreen,
    startBackgroundLoading,
  ]);

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
      // No need to update state - the animation loop will handle the visual update
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [MAX_SPEED]);

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

    // Update the tracked position
    setFullscreenPositionState((prev) => ({
      ...prev,
      targetImageIndex: previousIndex,
    }));
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

    // Update the tracked position
    setFullscreenPositionState((prev) => ({
      ...prev,
      targetImageIndex: nextIndex,
    }));
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

  // Image loading with intersection observer - optimized for bidirectional scrolling with direction-based preloading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(debouncedIntersectionCallback, {
      root: containerRef.current,
      // Use direction-based root margin for optimized preloading
      rootMargin: `${preloadDistance}px ${preloadDistance}px ${preloadDistance}px ${preloadDistance}px`,
      threshold: 0.1,
    });

    observerRef.current = observer;

    const imageContainers =
      containerRef.current.querySelectorAll("[data-image-src]");
    imageContainers.forEach((container) => {
      observer.observe(container);
    });

    return () => {
      if (intersectionTimeoutRef.current) {
        clearTimeout(intersectionTimeoutRef.current);
        intersectionTimeoutRef.current = null;
      }
      observer.disconnect();
      observerRef.current = null;
    };
  }, [preloadDistance, debouncedIntersectionCallback]);

  // Observe new images when duplicatedImages changes - improved for bidirectional scrolling
  useEffect(() => {
    if (!observerRef.current || !containerRef.current) return;

    const observer = observerRef.current;

    // Disconnect and reconnect to ensure all images are observed
    observer.disconnect();

    // Small delay to ensure DOM is updated
    setTimeout(() => {
      const imageContainers =
        containerRef.current?.querySelectorAll("[data-image-src]");
      if (imageContainers) {
        imageContainers.forEach((container) => {
          observer.observe(container);
        });
      }
    }, 0);
  }, [duplicatedImages]);

  // Fullscreen handlers
  const openFullscreen = (image: MarqueeImage) => {
    // Find the image index
    const imageIndex = images.findIndex((img) => img.src === image.src);

    setFullscreenState({
      isFullscreen: true,
      fullscreenImage: image,
    });

    // Track the current image position
    setFullscreenPositionState({
      targetImageIndex: imageIndex,
      isPositioning: false,
      targetScrollOffset: 0,
      shouldResumeScrolling: false,
    });

    document.body.style.overflow = "hidden";

    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
  };

  const closeFullscreen = () => {
    const currentPositionState = fullscreenPositionRef.current;

    setFullscreenState({
      isFullscreen: false,
      fullscreenImage: null,
    });

    // If we have a target image, position the carousel to it
    if (currentPositionState.targetImageIndex >= 0) {
      const targetOffset = calculateTargetScrollOffset(
        currentPositionState.targetImageIndex
      );

      // Calculate the shortest path to the target (considering infinite loop)
      const currentOffset = scrollOffsetRef.current;
      let distance = targetOffset - currentOffset;

      // Handle infinite loop - find the shortest path
      if (Math.abs(distance) > totalWidth / 2) {
        if (distance > 0) {
          distance -= totalWidth;
        } else {
          distance += totalWidth;
        }
      }

      const finalTargetOffset = currentOffset + distance;

      setFullscreenPositionState({
        targetImageIndex: currentPositionState.targetImageIndex,
        isPositioning: true,
        targetScrollOffset: finalTargetOffset,
        shouldResumeScrolling: false,
      });
    }

    setTimeout(fixIOSScrolling, 50);
  };

  /**
   * Swipe gesture detection for fullscreen modal
   *
   * Implements touch-based navigation for mobile devices:
   * - Swipe left/right: Navigate between images
   * - Swipe up/down: Close modal
   * - Velocity-based detection for quick swipes
   * - Minimum distance thresholds to prevent accidental triggers
   */
  const handleSwipeStart = useCallback(
    (e: React.TouchEvent) => {
      if (!fullscreenState.isFullscreen) return;

      // Prevent swipe detection if touching navigation buttons
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      const touch = e.touches[0];
      const now = Date.now();

      setSwipeState({
        isSwiping: true,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        velocity: 0,
        direction: null,
      });

      swipeStartTimeRef.current = now;
    },
    [fullscreenState.isFullscreen]
  );

  const handleSwipeMove = useCallback(
    (e: React.TouchEvent) => {
      if (!fullscreenState.isFullscreen || !swipeStateRef.current.isSwiping)
        return;

      const touch = e.touches[0];
      const currentState = swipeStateRef.current;

      const deltaX = touch.clientX - currentState.startX;
      const deltaY = touch.clientY - currentState.startY;

      // Determine swipe direction based on dominant axis
      let direction: "left" | "right" | "up" | "down" | null = null;
      const minSwipeDistance = 50; // Minimum distance to consider a swipe

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        direction = deltaX > 0 ? "right" : "left";
      } else if (
        Math.abs(deltaY) > Math.abs(deltaX) &&
        Math.abs(deltaY) > minSwipeDistance
      ) {
        direction = deltaY > 0 ? "down" : "up";
      }

      setSwipeState({
        ...currentState,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        direction,
      });
    },
    [fullscreenState.isFullscreen]
  );

  const handleSwipeEnd = useCallback(() => {
    if (!fullscreenState.isFullscreen || !swipeStateRef.current.isSwiping)
      return;

    const currentState = swipeStateRef.current;
    const now = Date.now();
    const duration = now - swipeStartTimeRef.current;

    // Calculate velocity (pixels per second)
    const velocity =
      duration > 0 ? Math.abs(currentState.deltaX) / (duration / 1000) : 0;

    // Determine if swipe should trigger action
    const minSwipeDistance = 100; // Minimum distance for swipe action
    const minVelocity = 300; // Minimum velocity for swipe action

    if (
      Math.abs(currentState.deltaX) > minSwipeDistance ||
      velocity > minVelocity
    ) {
      if (currentState.direction === "left") {
        // Swipe left - next image
        navigateToNextImage();
      } else if (currentState.direction === "right") {
        // Swipe right - previous image
        navigateToPreviousImage();
      }
    } else if (
      Math.abs(currentState.deltaY) > minSwipeDistance ||
      velocity > minVelocity
    ) {
      if (
        currentState.direction === "up" ||
        currentState.direction === "down"
      ) {
        // Swipe up or down - close modal
        closeFullscreen();
      }
    }

    // Reset swipe state
    setSwipeState({
      isSwiping: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0,
      velocity: 0,
      direction: null,
    });
  }, [
    fullscreenState.isFullscreen,
    navigateToNextImage,
    navigateToPreviousImage,
    closeFullscreen,
  ]);

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
   * - Background loading processes
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

      // Cleanup background loading
      stopBackgroundLoading();

      // Apply the fix immediately on unmount
      fixIOSScrolling();
    };
  }, [fixIOSScrolling, stopBackgroundLoading]);

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
      const isLoaded = imageState.loadedImages.has(imageSrc);
      const isLoading = imageState.loadingImages.has(imageSrc);
      const hasError = imageState.errorImages.has(imageSrc);

      // Determine if we should show the image
      // Show image if it's loaded, regardless of visibility (for backward scrolling)
      const shouldShowImage = isLoaded;

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
              stiffness: 200,
              damping: 15,
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
      imageState.loadedImages,
      imageState.loadingImages,
      imageState.errorImages,
      gap,
      height,
    ]
  );

  // ============================================================================
  // EARLY RETURN FOR EMPTY IMAGES
  // ============================================================================

  if (!images || images.length === 0) {
    return (
      <div
        className={`my-10 ${className}`}
        style={{
          height: `${height}px`,
          position: "relative",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
        role="region"
        aria-label="Image marquee gallery"
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-zinc-400 text-center">No images to display</p>
        </div>
      </div>
    );
  }

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
        <div
          ref={containerRef}
          className="flex items-center"
          style={{ width: `${totalWidth * 2}px` }}
        >
          <div
            ref={animationContainerRef}
            className="flex items-center"
            style={{
              width: `${totalWidth * 2}px`,
              transform: `translateX(${-(
                scrollOffsetRef.current % totalWidth
              )}px)`,
              transition: dragState.isDragging
                ? "none"
                : "transform 0.1s linear",
            }}
          >
            {duplicatedImages.map((image, index) => renderImage(image, index))}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenState.isFullscreen && fullscreenState.fullscreenImage && (
          <motion.div
            ref={modalRef}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeFullscreen}
            onTouchStart={handleSwipeStart}
            onTouchMove={handleSwipeMove}
            onTouchEnd={handleSwipeEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${fullscreenState.fullscreenImage.alt}. Swipe left or right to navigate between images, swipe up or down to close.`}
            tabIndex={-1}
          >
            {/* Navigation buttons */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4">
              {/* Previous button */}
              <motion.button
                className="pointer-events-auto hover:bg-black/10 text-white p-3 rounded-full transition-colors duration-200 cursor-pointer"
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
                className="pointer-events-auto hover:bg-black/10 text-white p-3 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer"
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
              animate={{
                scale: 1,
                opacity: 1,
                x: swipeState.isSwiping ? swipeState.deltaX * 0.3 : 0,
                y: swipeState.isSwiping ? swipeState.deltaY * 0.3 : 0,
              }}
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
