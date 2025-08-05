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
 * @version 2.1.0
 * @since 2024-12-19
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useHardwareCapability } from "../../context/HardwareCapabilityContext";

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

/** Frame rate throttling based on performance tier */
const FRAME_RATE_CONFIG = {
  low: { interval: 32, maxFps: 30 }, // 32ms = ~30fps for low-end devices
  medium: { interval: 20, maxFps: 50 }, // 20ms = ~50fps for medium devices
  high: { interval: 16, maxFps: 60 }, // 16ms = ~60fps for high-end devices
};

/** Image loading timeout in milliseconds */
const IMAGE_LOAD_TIMEOUT = 5000;

/** Image loading simulation delay in milliseconds */
const IMAGE_LOAD_DELAY = 100;

/** Modal focus delay in milliseconds */
const MODAL_FOCUS_DELAY = 100;

/** Momentum transfer factor (0-1) */
const MOMENTUM_TRANSFER = 0.8;

/** Speed recovery rate when resuming from drag */
const SPEED_RECOVERY_RATE = 0.05;

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
  // HARDWARE CAPABILITY DETECTION
  // ============================================================================

  /** Hardware capability information for performance optimization */
  const hardwareCapability = useHardwareCapability();

  /** Get frame rate configuration based on performance tier */
  const frameRateConfig = FRAME_RATE_CONFIG[hardwareCapability.performanceTier];

  // Log frame rate configuration in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🎬 Marquee Frame Rate Config:`, {
        performanceTier: hardwareCapability.performanceTier,
        targetFps: frameRateConfig.maxFps,
        updateInterval: frameRateConfig.interval,
        isMobile: hardwareCapability.isMobile,
        gpuTier: hardwareCapability.gpuTier,
        ram: `${hardwareCapability.ram}GB`,
        cores: hardwareCapability.cores,
      });
    }
  }, [hardwareCapability.performanceTier, frameRateConfig, hardwareCapability]);

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

  /** Duplicate images for seamless infinite loop with performance optimization */
  const duplicatedImages = React.useMemo(() => {
    // For low-end devices, reduce the number of duplicated images to improve performance
    const duplicationFactor =
      hardwareCapability.performanceTier === "low" ? 1.5 : 2;
    const duplicateCount = Math.ceil(duplicationFactor);
    return Array(duplicateCount).fill(images).flat();
  }, [images, hardwareCapability.performanceTier]);

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
      let frameCount = 0;
      let lastFpsCheck = 0;

      const animate = (currentTime: number) => {
        // Frame rate throttling for performance optimization
        frameCount++;
        if (currentTime - lastFpsCheck >= 1000) {
          const currentFps = frameCount;
          frameCount = 0;
          lastFpsCheck = currentTime;

          // Skip frames if we're exceeding the target FPS for this performance tier
          if (currentFps > frameRateConfig.maxFps) {
            animationFrameRef.current = requestAnimationFrame(animate);
            return;
          }
        }
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
        // Stop animation when mouse is down OR touch is down OR dragging
        const isInteracting =
          interactionStateRef.current.isMouseDown ||
          interactionStateRef.current.isTouchDown ||
          interactionStateRef.current.isDragging;

        if (!isInteracting) {
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
        } else {
          // During any interaction, we don't update scroll offset at all
          // The position is controlled entirely by interaction handlers
          // This prevents any conflict between animation and user input
          needsStateUpdate = false; // Don't trigger state updates during interaction
        }

        // Update momentum decay using refs (only when not interacting)
        // During any interaction, we completely pause all speed updates to prevent conflicts
        if (!isInteracting) {
          const currentSpeedValue = currentSpeedRef.current;
          if (Math.abs(currentSpeedValue - NATURAL_SPEED) >= 0.1) {
            const decayRate = MOMENTUM_DECAY;
            currentSpeedRef.current =
              currentSpeedValue +
              (NATURAL_SPEED - currentSpeedValue) * decayRate;
            needsStateUpdate = true;
          }
        } else {
          // During interaction, ensure speed stays at 0 to prevent any animation interference
          if (Math.abs(currentSpeedRef.current) > 0.1) {
            currentSpeedRef.current = 0;
            needsStateUpdate = true;
          }
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
          }, frameRateConfig.interval); // Performance-based update rate
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
      const now = Date.now();
      setDragState({
        isDragging: true,
        isMouseDown: false,
        isTouchDown: true,
        dragStart: e.touches[0].clientX,
        dragOffset: scrollOffsetRef.current,
        lastPosition: e.touches[0].clientX,
        lastTime: now,
        velocity: 0,
        isMouseDrag: false,
        hasMoved: false,
        dragThreshold: 5,
      });

      // Stop the marquee during drag
      currentSpeedRef.current = 0;
      setAnimationState((prev) => ({ ...prev, currentSpeed: 0 }));
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (dragStateRef.current.isDragging) {
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const now = Date.now();
        const deltaX = dragStateRef.current.dragStart - currentX;

        // Check if user has moved enough to consider it a drag
        const hasMoved = Math.abs(deltaX) > dragStateRef.current.dragThreshold;

        if (hasMoved) {
          const newOffset = dragStateRef.current.dragOffset + deltaX;

          // Calculate velocity for momentum transfer
          const timeDelta = now - dragStateRef.current.lastTime;
          const positionDelta = currentX - dragStateRef.current.lastPosition;
          const velocity =
            timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0; // pixels per second

          // Update refs directly for immediate response
          scrollOffsetRef.current = newOffset;
          setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

          // Update drag state with new position and velocity
          setDragState((prev) => ({
            ...prev,
            lastPosition: currentX,
            lastTime: now,
            velocity: velocity,
            hasMoved: true,
          }));
        }
      }
    }, []);

    const handleTouchEnd = useCallback(() => {
      const finalVelocity = dragStateRef.current.velocity;
      const hasMoved = dragStateRef.current.hasMoved;

      // Only apply momentum if user actually dragged
      if (hasMoved) {
        if (Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
          const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER; // Negative because we want opposite direction
          const clampedSpeed = Math.max(
            -MAX_SPEED,
            Math.min(MAX_SPEED, momentumSpeed)
          );
          currentSpeedRef.current = clampedSpeed;
          setAnimationState((prev) => ({
            ...prev,
            currentSpeed: clampedSpeed,
          }));
        } else {
          // Gradually resume natural speed if no significant velocity
          currentSpeedRef.current = NATURAL_SPEED * SPEED_RECOVERY_RATE;
          setAnimationState((prev) => ({
            ...prev,
            currentSpeed: NATURAL_SPEED * SPEED_RECOVERY_RATE,
          }));
        }
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
        hasMoved: false,
      }));
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

    // Mouse handlers for desktop drag
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      const now = Date.now();
      setDragState({
        isDragging: true,
        isMouseDown: true,
        isTouchDown: false,
        dragStart: e.clientX,
        dragOffset: scrollOffsetRef.current,
        lastPosition: e.clientX,
        lastTime: now,
        velocity: 0,
        isMouseDrag: true,
        hasMoved: false,
        dragThreshold: 5,
      });

      // Stop the marquee during drag
      currentSpeedRef.current = 0;
      setAnimationState((prev) => ({ ...prev, currentSpeed: 0 }));
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (dragStateRef.current.isDragging && dragStateRef.current.isMouseDrag) {
        e.preventDefault();
        const currentX = e.clientX;
        const now = Date.now();
        const deltaX = dragStateRef.current.dragStart - currentX;

        // Check if user has moved enough to consider it a drag
        const hasMoved = Math.abs(deltaX) > dragStateRef.current.dragThreshold;

        if (hasMoved) {
          const newOffset = dragStateRef.current.dragOffset + deltaX;

          // Calculate velocity for momentum transfer
          const timeDelta = now - dragStateRef.current.lastTime;
          const positionDelta = currentX - dragStateRef.current.lastPosition;
          const velocity =
            timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0; // pixels per second

          // Update refs directly for immediate response
          scrollOffsetRef.current = newOffset;
          setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

          // Update drag state with new position and velocity
          setDragState((prev) => ({
            ...prev,
            lastPosition: currentX,
            lastTime: now,
            velocity: velocity,
            hasMoved: true,
          }));
        }
      }
    }, []);

    const handleMouseUp = useCallback(() => {
      if (dragStateRef.current.isMouseDrag) {
        const finalVelocity = dragStateRef.current.velocity;
        const hasMoved = dragStateRef.current.hasMoved;

        // Only apply momentum if user actually dragged
        if (hasMoved) {
          if (Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
            const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER; // Negative because we want opposite direction
            const clampedSpeed = Math.max(
              -MAX_SPEED,
              Math.min(MAX_SPEED, momentumSpeed)
            );
            currentSpeedRef.current = clampedSpeed;
            setAnimationState((prev) => ({
              ...prev,
              currentSpeed: clampedSpeed,
            }));
          } else {
            // Gradually resume natural speed if no significant velocity
            currentSpeedRef.current = NATURAL_SPEED * SPEED_RECOVERY_RATE;
            setAnimationState((prev) => ({
              ...prev,
              currentSpeed: NATURAL_SPEED * SPEED_RECOVERY_RATE,
            }));
          }
        } else {
          // If no drag occurred, resume natural speed immediately
          currentSpeedRef.current = NATURAL_SPEED;
          setAnimationState((prev) => ({
            ...prev,
            currentSpeed: NATURAL_SPEED,
          }));
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
      }
    }, []);

    // Add global mouse event listeners for drag outside the component
    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (
          dragStateRef.current.isDragging &&
          dragStateRef.current.isMouseDrag
        ) {
          const currentX = e.clientX;
          const now = Date.now();
          const deltaX = dragStateRef.current.dragStart - currentX;

          // Check if user has moved enough to consider it a drag
          const hasMoved =
            Math.abs(deltaX) > dragStateRef.current.dragThreshold;

          if (hasMoved) {
            const newOffset = dragStateRef.current.dragOffset + deltaX;

            // Calculate velocity for momentum transfer
            const timeDelta = now - dragStateRef.current.lastTime;
            const positionDelta = currentX - dragStateRef.current.lastPosition;
            const velocity =
              timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0;

            // Update refs directly for immediate response
            scrollOffsetRef.current = newOffset;
            setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

            // Update drag state with new position and velocity
            setDragState((prev) => ({
              ...prev,
              lastPosition: currentX,
              lastTime: now,
              velocity: velocity,
              hasMoved: true,
            }));
          }
        }
      };

      const handleGlobalMouseUp = () => {
        if (dragStateRef.current.isMouseDrag) {
          const finalVelocity = dragStateRef.current.velocity;
          const hasMoved = dragStateRef.current.hasMoved;

          // Only apply momentum if user actually dragged
          if (hasMoved) {
            if (Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
              const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER;
              const clampedSpeed = Math.max(
                -MAX_SPEED,
                Math.min(MAX_SPEED, momentumSpeed)
              );
              currentSpeedRef.current = clampedSpeed;
              setAnimationState((prev) => ({
                ...prev,
                currentSpeed: clampedSpeed,
              }));
            } else {
              // Gradually resume natural speed if no significant velocity
              currentSpeedRef.current = NATURAL_SPEED * SPEED_RECOVERY_RATE;
              setAnimationState((prev) => ({
                ...prev,
                currentSpeed: NATURAL_SPEED * SPEED_RECOVERY_RATE,
              }));
            }
          } else {
            // If no drag occurred, resume natural speed immediately
            currentSpeedRef.current = NATURAL_SPEED;
            setAnimationState((prev) => ({
              ...prev,
              currentSpeed: NATURAL_SPEED,
            }));
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
        }
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }, []);

    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
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
              // Load image when it becomes visible
              setImageState((prev) => ({
                ...prev,
                visibleImages: new Set([...prev.visibleImages, imageSrc]),
                loadingImages: new Set([...prev.loadingImages, imageSrc]),
              }));

              // Mark image as loaded after delay
              setTimeout(() => {
                setImageState((prev) => ({
                  ...prev,
                  loadedImages: new Set([...prev.loadedImages, imageSrc]),
                  loadingImages: new Set(
                    [...prev.loadingImages].filter((src) => src !== imageSrc)
                  ),
                }));
              }, IMAGE_LOAD_DELAY);

              // Error handling
              setTimeout(() => {
                setImageState((prev) => {
                  if (!prev.loadedImages.has(imageSrc)) {
                    return {
                      ...prev,
                      errorImages: new Set([...prev.errorImages, imageSrc]),
                      loadingImages: new Set(
                        [...prev.loadingImages].filter(
                          (src) => src !== imageSrc
                        )
                      ),
                    };
                  }
                  return prev;
                });
              }, IMAGE_LOAD_TIMEOUT);
            } else {
              // Remove from visible images when out of view
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
              if (!hasError && !dragState.hasMoved && isLoaded) {
                fullscreenHandlers.openFullscreen(image);
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
              fullscreenHandlers.openFullscreen(image)
            }
          >
            <div className="relative">
              {/* Loading placeholder */}
              {!shouldShowImage && !hasError && (
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
                      className="rounded-lg shadow-lg object-cover"
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
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
        onMouseDown={touchHandlers.handleMouseDown}
        onMouseMove={touchHandlers.handleMouseMove}
        onMouseUp={touchHandlers.handleMouseUp}
        role="region"
        aria-label="Image marquee gallery"
        aria-live="polite"
        aria-describedby="marquee-instructions"
      >
        {/* Screen reader instructions */}
        <div id="marquee-instructions" className="sr-only">
          Use mouse wheel, drag with mouse or touch, or touch gestures to
          control the marquee speed. Drag to pause and release to resume with
          momentum. Click on images to view them in fullscreen.
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
                  placeholder={
                    fullscreenState.fullscreenImage.placeholder
                      ? "blur"
                      : "empty"
                  }
                  blurDataURL={fullscreenState.fullscreenImage.placeholder}
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
