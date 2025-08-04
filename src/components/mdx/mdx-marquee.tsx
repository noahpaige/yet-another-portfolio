"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface MarqueeImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  captionText?: string;
}

interface MDXMarqueeProps {
  images: MarqueeImage[];
  speed?: number; // pixels per second
  gap?: number; // gap between images in pixels
  className?: string;
  height?: number; // fixed height for the marquee container
  preloadDistance?: number; // pixels before viewport to start loading
}

const MDXMarquee: React.FC<MDXMarqueeProps> = ({
  images,
  speed = 50,
  gap = 20,
  className = "",
  height = 300,
  preloadDistance = 500,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<MarqueeImage | null>(
    null
  );
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentSpeedRef = useRef(speed);
  const scrollOffsetRef = useRef(0); // Add ref for scroll offset
  const animationFrameRef = useRef<number | null>(null); // Add ref for animation frame
  const performanceRef = useRef({ frameCount: 0, lastTime: 0, fps: 0 }); // Performance monitoring

  // Speed constants
  const NATURAL_SPEED = speed;
  const MAX_SPEED = speed * 30; // 3x natural speed
  const MOMENTUM_DECAY = 0.1; // How quickly speed returns to natural

  // Calculate total width needed for seamless loop - memoize this
  const totalWidth = React.useMemo(() => {
    return images.reduce((acc, image) => {
      const imgWidth = image.width || 300;
      return acc + imgWidth + gap;
    }, 0);
  }, [images, gap]);

  // Duplicate images for seamless loop - memoize this too
  const duplicatedImages = React.useMemo(() => {
    return [...images, ...images];
  }, [images]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const imageSrc = entry.target.getAttribute("data-image-src");
          if (!imageSrc) return;

          if (entry.isIntersecting) {
            setVisibleImages((prev) => new Set([...prev, imageSrc]));
            // Mark as loaded after a small delay to simulate loading
            setTimeout(() => {
              setLoadedImages((prev) => new Set([...prev, imageSrc]));
            }, 100);
          } else {
            setVisibleImages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(imageSrc);
              return newSet;
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

  // Update refs whenever state changes (for UI updates)
  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  useEffect(() => {
    scrollOffsetRef.current = scrollOffset;
  }, [scrollOffset]);

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
      if (!isDragging) {
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
          setScrollOffset(scrollOffsetRef.current);
          setCurrentSpeed(currentSpeedRef.current);
          needsStateUpdate = false;
          stateUpdateTimeout = null;
        }, 16); // ~60fps update rate
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
  }, [isDragging, totalWidth, NATURAL_SPEED, MOMENTUM_DECAY]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(scrollOffsetRef.current);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const deltaX = dragStart - currentX;
        const newOffset = dragOffset + deltaX;

        // Update refs directly for immediate response
        scrollOffsetRef.current = newOffset;
        setScrollOffset(newOffset);

        // Add momentum based on touch velocity - matching wheel behavior
        const direction = deltaX > 0 ? -1 : 1;
        const newSpeed =
          currentSpeedRef.current - direction * MAX_SPEED * 0.001;
        const clampedSpeed = Math.max(
          -MAX_SPEED,
          Math.min(MAX_SPEED, newSpeed)
        );
        currentSpeedRef.current = clampedSpeed;
        setCurrentSpeed(clampedSpeed);
      }
    },
    [isDragging, dragStart, dragOffset, MAX_SPEED]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const openFullscreen = (image: MarqueeImage) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
    document.body.style.overflow = "unset";
  };

  // Handle escape key and body style cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isFullscreen]);

  // Cleanup body style on unmount
  useEffect(() => {
    return () => {
      // Reset body overflow when component unmounts
      document.body.style.overflow = "unset";
    };
  }, []);

  // Comprehensive cleanup on unmount
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
      const speedChange = direction * (MAX_SPEED * 0.5); // Increased sensitivity for Chrome/Arc
      const newSpeed = currentSpeedRef.current - speedChange;
      const clampedSpeed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, newSpeed));
      currentSpeedRef.current = clampedSpeed;
      setCurrentSpeed(clampedSpeed);
    };

    // Use wheel event with passive: false for better cross-browser support
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [MAX_SPEED]); // Removed currentSpeed to prevent circular dependencies

  const renderImage = useCallback(
    (image: MarqueeImage, index: number) => {
      const isVisible = visibleImages.has(image.src);
      const isLoaded = loadedImages.has(image.src);

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
            onClick={() => openFullscreen(image)}
            role="button"
            tabIndex={0}
            aria-label={`Open ${image.alt} in fullscreen view`}
            onKeyDown={(e) => e.key === "Enter" && openFullscreen(image)}
          >
            <div className="relative">
              {/* Loading placeholder */}
              {!isLoaded && (
                <div
                  className="rounded-lg shadow-lg bg-zinc-800 animate-pulse"
                  style={{
                    width: image.width || 300,
                    height: `${height}px`,
                  }}
                />
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
                        setLoadedImages(
                          (prev) => new Set([...prev, image.src])
                        );
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
    [visibleImages, loadedImages, gap, height, openFullscreen]
  );

  return (
    <>
      <motion.div
        className={`my-10 ${className}`}
        style={{ height: `${height}px` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          ref={containerRef}
          className="flex items-center"
          style={{ width: `${totalWidth * 2}px` }}
          animate={{ x: -(scrollOffset % totalWidth) }}
          transition={{
            type: "tween",
            ease: "linear",
            duration: isDragging ? 0 : 0.1,
          }}
        >
          {duplicatedImages.map((image, index) => renderImage(image, index))}
        </motion.div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && fullscreenImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${fullscreenImage.alt}`}
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
                  src={fullscreenImage.src}
                  alt={fullscreenImage.alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
              {fullscreenImage.captionText && (
                <motion.p
                  className="text-white text-center mt-4 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {fullscreenImage.captionText}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MDXMarquee;
