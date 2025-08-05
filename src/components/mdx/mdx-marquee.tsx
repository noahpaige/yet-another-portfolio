"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useHardwareCapability } from "../../context/HardwareCapabilityContext";
import "./mdx-marquee.css";

export interface MarqueeImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  captionText?: string;
  placeholder?: string;
}

interface MDXMarqueeProps {
  images: MarqueeImage[];
  speed?: number;
  gap?: number;
  className?: string;
  height?: number;
  preloadDistance?: number;
}

const DEFAULT_SPEED = 50;
const DEFAULT_GAP = 20;
const DEFAULT_HEIGHT = 300;
const DEFAULT_PRELOAD_DISTANCE = 500;
const MAX_SPEED_MULTIPLIER = 20;
const MOMENTUM_DECAY_RATE = 0.05;
const MOMENTUM_TRANSFER = 0.8;
const MIN_VELOCITY_THRESHOLD = 50;

const FRAME_RATE_CONFIG = {
  low: { interval: 32, maxFps: 30 },
  medium: { interval: 20, maxFps: 50 },
  high: { interval: 16, maxFps: 60 },
};

const MDXMarquee: React.FC<MDXMarqueeProps> = ({
  images,
  speed = DEFAULT_SPEED,
  gap = DEFAULT_GAP,
  className = "",
  height = DEFAULT_HEIGHT,
  preloadDistance = DEFAULT_PRELOAD_DISTANCE,
}) => {
  const hardwareCapability = useHardwareCapability();
  const frameRateConfig = FRAME_RATE_CONFIG[hardwareCapability.performanceTier];

  // State
  const [animationState, setAnimationState] = useState({
    scrollOffset: 0,
    currentSpeed: speed,
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    isMouseDown: false,
    isTouchDown: false,
    dragStart: 0,
    dragOffset: 0,
    lastPosition: 0,
    lastTime: 0,
    velocity: 0,
    hasMoved: false,
  });

  const [imageState, setImageState] = useState({
    loadedImages: new Set<string>(),
    visibleImages: new Set<string>(),
    errorImages: new Set<string>(),
  });

  const [fullscreenState, setFullscreenState] = useState({
    isFullscreen: false,
    fullscreenImage: null as MarqueeImage | null,
  });

  const [modalAnimationState, setModalAnimationState] = useState({
    backdropVisible: false,
    contentVisible: false,
    captionVisible: false,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentSpeedRef = useRef(speed);
  const scrollOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef(dragState);
  const dragOccurredRef = useRef(false);

  // Computed values
  const totalWidth = React.useMemo(() => {
    return images.reduce((acc, image) => {
      const imgWidth = image.width || 300;
      return acc + imgWidth + gap;
    }, 0);
  }, [images, gap]);

  const duplicatedImages = React.useMemo(() => {
    const duplicationFactor =
      hardwareCapability.performanceTier === "low" ? 1.5 : 2;
    return Array(Math.ceil(duplicationFactor)).fill(images).flat();
  }, [images, hardwareCapability.performanceTier]);

  // Animation loop
  useEffect(() => {
    let lastTime = 0;
    let needsStateUpdate = false;
    let stateUpdateTimeout: NodeJS.Timeout | null = null;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const isInteracting =
        dragStateRef.current.isMouseDown ||
        dragStateRef.current.isTouchDown ||
        dragStateRef.current.isDragging;

      if (!isInteracting) {
        const currentSpeed = currentSpeedRef.current;
        const newOffset =
          scrollOffsetRef.current + (currentSpeed * deltaTime) / 1000;

        if (newOffset >= totalWidth) {
          scrollOffsetRef.current = newOffset - totalWidth;
        } else if (newOffset < 0) {
          scrollOffsetRef.current = newOffset + totalWidth;
        } else {
          scrollOffsetRef.current = newOffset;
        }

        needsStateUpdate = true;

        // Momentum decay - gradually return to natural speed
        const naturalSpeed = speed;
        if (Math.abs(currentSpeed - naturalSpeed) >= 0.1) {
          currentSpeedRef.current =
            currentSpeed + (naturalSpeed - currentSpeed) * MOMENTUM_DECAY_RATE;
          needsStateUpdate = true;
        }
      }

      if (needsStateUpdate && !stateUpdateTimeout) {
        stateUpdateTimeout = setTimeout(() => {
          setAnimationState({
            scrollOffset: scrollOffsetRef.current,
            currentSpeed: currentSpeedRef.current,
          });
          needsStateUpdate = false;
          stateUpdateTimeout = null;
        }, frameRateConfig.interval);
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
  }, [totalWidth, frameRateConfig.interval]);

  // Touch and mouse handlers
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
      hasMoved: false,
    });
    currentSpeedRef.current = 0;
    setAnimationState((prev) => ({ ...prev, currentSpeed: 0 }));
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStateRef.current.isDragging) {
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const now = Date.now();
      const deltaX = dragStateRef.current.dragStart - currentX;
      const hasMoved = Math.abs(deltaX) > 5;

      if (hasMoved) {
        dragOccurredRef.current = true;
        const newOffset = dragStateRef.current.dragOffset + deltaX;
        const timeDelta = now - dragStateRef.current.lastTime;
        const positionDelta = currentX - dragStateRef.current.lastPosition;
        const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0;

        scrollOffsetRef.current = newOffset;
        setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

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

    if (hasMoved && Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
      const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER;
      const clampedSpeed = Math.max(
        -speed * MAX_SPEED_MULTIPLIER,
        Math.min(speed * MAX_SPEED_MULTIPLIER, momentumSpeed)
      );
      currentSpeedRef.current = clampedSpeed;
      setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
    } else {
      currentSpeedRef.current = speed;
      setAnimationState((prev) => ({ ...prev, currentSpeed: speed }));
    }

    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      isMouseDown: false,
      isTouchDown: false,
      velocity: 0,
      hasMoved: false,
    }));
  }, [speed]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    dragOccurredRef.current = false;

    setDragState({
      isDragging: true,
      isMouseDown: true,
      isTouchDown: false,
      dragStart: e.clientX,
      dragOffset: scrollOffsetRef.current,
      lastPosition: e.clientX,
      lastTime: now,
      velocity: 0,
      hasMoved: false,
    });

    currentSpeedRef.current = 0;
    setAnimationState((prev) => ({ ...prev, currentSpeed: 0 }));
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStateRef.current.isDragging && dragStateRef.current.isMouseDown) {
      e.preventDefault();
      const currentX = e.clientX;
      const now = Date.now();
      const deltaX = dragStateRef.current.dragStart - currentX;
      const hasMoved = Math.abs(deltaX) > 5;

      if (hasMoved) {
        dragOccurredRef.current = true;
        const newOffset = dragStateRef.current.dragOffset + deltaX;
        const timeDelta = now - dragStateRef.current.lastTime;
        const positionDelta = currentX - dragStateRef.current.lastPosition;
        const velocity = timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0;

        scrollOffsetRef.current = newOffset;
        setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

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
    if (dragStateRef.current.isMouseDown) {
      const finalVelocity = dragStateRef.current.velocity;
      const hasMoved = dragStateRef.current.hasMoved;

      if (hasMoved && Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
        const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER;
        const clampedSpeed = Math.max(
          -speed * MAX_SPEED_MULTIPLIER,
          Math.min(speed * MAX_SPEED_MULTIPLIER, momentumSpeed)
        );
        currentSpeedRef.current = clampedSpeed;
        setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
      } else {
        currentSpeedRef.current = speed;
        setAnimationState((prev) => ({ ...prev, currentSpeed: speed }));
      }

      setDragState((prev) => ({
        ...prev,
        isDragging: false,
        isMouseDown: false,
        isTouchDown: false,
        velocity: 0,
        hasMoved: false,
      }));
    }
  }, [speed]);

  // Wheel handler
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
      const speedChange = direction * speed * MAX_SPEED_MULTIPLIER;
      const newSpeed = currentSpeedRef.current - speedChange;
      const clampedSpeed = Math.max(
        -speed * MAX_SPEED_MULTIPLIER,
        Math.min(speed * MAX_SPEED_MULTIPLIER, newSpeed)
      );

      currentSpeedRef.current = clampedSpeed;
      setAnimationState((prev) => ({ ...prev, currentSpeed: clampedSpeed }));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [speed]);

  // Global mouse handlers
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current.isDragging && dragStateRef.current.isMouseDown) {
        const currentX = e.clientX;
        const now = Date.now();
        const deltaX = dragStateRef.current.dragStart - currentX;
        const hasMoved = Math.abs(deltaX) > 5;

        if (hasMoved) {
          dragOccurredRef.current = true;
          const newOffset = dragStateRef.current.dragOffset + deltaX;
          const timeDelta = now - dragStateRef.current.lastTime;
          const positionDelta = currentX - dragStateRef.current.lastPosition;
          const velocity =
            timeDelta > 0 ? (positionDelta / timeDelta) * 1000 : 0;

          scrollOffsetRef.current = newOffset;
          setAnimationState((prev) => ({ ...prev, scrollOffset: newOffset }));

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
      if (dragStateRef.current.isMouseDown) {
        const finalVelocity = dragStateRef.current.velocity;
        const hasMoved = dragStateRef.current.hasMoved;

        if (hasMoved && Math.abs(finalVelocity) > MIN_VELOCITY_THRESHOLD) {
          const momentumSpeed = -finalVelocity * MOMENTUM_TRANSFER;
          const clampedSpeed = Math.max(
            -speed * MAX_SPEED_MULTIPLIER,
            Math.min(speed * MAX_SPEED_MULTIPLIER, momentumSpeed)
          );
          currentSpeedRef.current = clampedSpeed;
          setAnimationState((prev) => ({
            ...prev,
            currentSpeed: clampedSpeed,
          }));
        } else {
          currentSpeedRef.current = speed;
          setAnimationState((prev) => ({ ...prev, currentSpeed: speed }));
        }

        setDragState((prev) => ({
          ...prev,
          isDragging: false,
          isMouseDown: false,
          isTouchDown: false,
          velocity: 0,
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
  }, [speed]);

  // Fullscreen handlers
  const openFullscreen = useCallback((image: MarqueeImage) => {
    setFullscreenState({ isFullscreen: true, fullscreenImage: image });
    document.body.style.overflow = "hidden";

    setModalAnimationState({
      backdropVisible: true,
      contentVisible: false,
      captionVisible: false,
    });

    setTimeout(() => {
      setModalAnimationState((prev) => ({ ...prev, contentVisible: true }));
    }, 50);

    setTimeout(() => {
      setModalAnimationState((prev) => ({ ...prev, captionVisible: true }));
    }, 150);

    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
  }, []);

  const closeFullscreen = useCallback(() => {
    setModalAnimationState({
      backdropVisible: false,
      contentVisible: false,
      captionVisible: false,
    });

    setTimeout(() => {
      setFullscreenState({ isFullscreen: false, fullscreenImage: null });
    }, 300);

    setTimeout(() => {
      document.body.style.overflow = "auto";
    }, 50);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fullscreenState.isFullscreen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeFullscreen();
      }
    };

    if (fullscreenState.isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [fullscreenState.isFullscreen, closeFullscreen]);

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
            }));

            setTimeout(() => {
              setImageState((prev) => ({
                ...prev,
                loadedImages: new Set([...prev.loadedImages, imageSrc]),
              }));
            }, 100);
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

  // Observe new images
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.body.style.overflow = "auto";
    };
  }, []);

  // Keep refs in sync
  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  // Render image
  const renderImage = useCallback(
    (image: MarqueeImage, index: number) => {
      const imageSrc = image.src;
      const isVisible = imageState.visibleImages.has(imageSrc);
      const isLoaded = imageState.loadedImages.has(imageSrc);
      const hasError = imageState.errorImages.has(imageSrc);
      const shouldShowImage = isVisible && isLoaded;

      return (
        <div
          key={`${image.src}-${index}`}
          className="flex-shrink-0 relative"
          style={{ marginRight: `${gap}px` }}
          data-image-src={image.src}
        >
          <div
            className="marquee-image-container"
            onClick={() => {
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
              {!shouldShowImage && !hasError && (
                <div
                  className="rounded-md shadow-lg bg-zinc-800 animate-pulse"
                  style={{ width: image.width || 300, height: `${height}px` }}
                />
              )}

              {hasError && (
                <div
                  className="rounded-md shadow-lg bg-red-900/20 border border-red-500/30 flex items-center justify-center"
                  style={{ width: image.width || 300, height: `${height}px` }}
                >
                  <div className="text-center text-red-400">
                    <div className="text-2xl mb-2">⚠️</div>
                    <div className="text-sm">Failed to load image</div>
                  </div>
                </div>
              )}

              {shouldShowImage && (
                <div className="marquee-image-fade-in">
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
                    priority={index < 3}
                    onLoad={() => {
                      setImageState((prev) => ({
                        ...prev,
                        loadedImages: new Set([...prev.loadedImages, imageSrc]),
                      }));
                    }}
                    onError={() => {
                      setImageState((prev) => ({
                        ...prev,
                        errorImages: new Set([...prev.errorImages, imageSrc]),
                      }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
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
      openFullscreen,
    ]
  );

  return (
    <>
      <div
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
        <div id="marquee-instructions" className="sr-only">
          Use mouse wheel, drag with mouse or touch, or touch gestures to
          control the marquee speed. Drag to pause and release to resume with
          momentum. Click on images to view them in fullscreen.
        </div>
        <div
          ref={containerRef}
          className="flex items-center marquee-container"
          style={{
            width: `${totalWidth * 2}px`,
            transform: `translateX(${-(
              animationState.scrollOffset % totalWidth
            )}px)`,
          }}
        >
          {duplicatedImages.map((image, index) => renderImage(image, index))}
        </div>
      </div>

      {fullscreenState.isFullscreen && fullscreenState.fullscreenImage && (
        <div
          ref={modalRef}
          className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer modal-backdrop ${
            modalAnimationState.backdropVisible ? "visible" : ""
          }`}
          onClick={closeFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label={`Fullscreen view of ${fullscreenState.fullscreenImage.alt}`}
          tabIndex={-1}
        >
          <div
            className={`flex flex-col items-center justify-center w-full h-full modal-content ${
              modalAnimationState.contentVisible ? "visible" : ""
            }`}
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
                className="w-full h-full object-contain rounded-md"
                placeholder={
                  fullscreenState.fullscreenImage.placeholder ? "blur" : "empty"
                }
                blurDataURL={fullscreenState.fullscreenImage.placeholder}
              />
            </div>
            {fullscreenState.fullscreenImage.captionText && (
              <div
                className={`flex-shrink-0 px-4 py-2 modal-caption ${
                  modalAnimationState.captionVisible ? "visible" : ""
                }`}
              >
                <p className="text-white text-center text-lg max-w-2xl">
                  {fullscreenState.fullscreenImage.captionText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MDXMarquee;
