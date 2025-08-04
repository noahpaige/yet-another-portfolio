"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import MarqueeContainer from "./MarqueeContainer";
import FullscreenModal from "./FullscreenModal";

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

    const imageContainers =
      containerRef.current.querySelectorAll("[data-image-src]");
    imageContainers.forEach((container) => {
      observerRef.current?.observe(container);
    });
  }, [duplicatedImages]);

  // Update the ref whenever currentSpeed changes
  useEffect(() => {
    currentSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  // Consolidated animation loop using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      // Calculate delta time for smooth animation regardless of frame rate
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update scroll offset if not dragging
      if (!isDragging) {
        const speed = currentSpeedRef.current;
        setScrollOffset((prev) => {
          const newOffset = prev + (speed * deltaTime) / 1000; // Convert to seconds
          // Infinite loop - when we reach the end, continue seamlessly
          if (newOffset >= totalWidth) {
            return newOffset - totalWidth;
          }
          // Handle negative scrolling (scrolling backwards)
          if (newOffset < 0) {
            return newOffset + totalWidth;
          }
          return newOffset;
        });
      }

      // Update momentum decay
      setCurrentSpeed((prev) => {
        if (Math.abs(prev - NATURAL_SPEED) < 0.1) {
          return NATURAL_SPEED;
        }
        // Much more responsive decay for Chrome/Arc compatibility
        const decayRate = MOMENTUM_DECAY;
        return prev + (NATURAL_SPEED - prev) * decayRate;
      });

      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDragging, totalWidth, NATURAL_SPEED, MOMENTUM_DECAY]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      setDragStart(e.touches[0].clientX);
      setDragOffset(scrollOffset);
    },
    [scrollOffset]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        const deltaX = dragStart - currentX;
        const newOffset = dragOffset + deltaX;

        // Infinite scroll - allow scrolling beyond boundaries
        setScrollOffset(newOffset);

        // Add momentum based on touch velocity - matching wheel behavior
        const direction = deltaX > 0 ? -1 : 1;
        setCurrentSpeed((prev) => {
          const newSpeed = prev - direction * MAX_SPEED;
          return Math.max(-MAX_SPEED, Math.min(MAX_SPEED, newSpeed));
        });
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
      setCurrentSpeed((prev) => {
        const speedChange = direction * (MAX_SPEED * 0.5); // Increased sensitivity for Chrome/Arc
        const newSpeed = prev - speedChange;
        return Math.max(-MAX_SPEED, Math.min(MAX_SPEED, newSpeed));
      });
    };

    // Use wheel event with passive: false for better cross-browser support
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [MAX_SPEED]); // Removed currentSpeed to prevent circular dependencies

  return (
    <>
      <MarqueeContainer
        images={duplicatedImages}
        gap={gap}
        height={height}
        className={className}
        totalWidth={totalWidth}
        scrollOffset={scrollOffset}
        isDragging={isDragging}
        visibleImages={visibleImages}
        loadedImages={loadedImages}
        containerRef={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onImageClick={openFullscreen}
        onImageLoad={(imageSrc) => {
          setLoadedImages((prev) => new Set([...prev, imageSrc]));
        }}
      />

      <FullscreenModal
        isOpen={isFullscreen}
        image={fullscreenImage}
        onClose={closeFullscreen}
      />
    </>
  );
};

export default MDXMarquee;
