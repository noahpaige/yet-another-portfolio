"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { MotionValue, useMotionValueEvent } from "motion/react";
import { BlobData } from "@/app/types";
import { interp } from "@/lib/interp";
import { useHardwareCapability } from "@/context/HardwareCapabilityContext";

// Configuration objects for better maintainability and performance tuning

const ANIMATION_CONFIG = {
  // Blob generation
  blobCount: {
    default: 12,
    low: 6,
    medium: 9,
    high: 12,
  },

  // Rendering quality
  renderSize: 32,
  frameRates: {
    low: 20,
    medium: 30,
    high: 60,
  },

  // Blur effects
  blurAmounts: {
    low: 2,
    medium: 3,
    high: 4,
  },

  // Animation physics
  spring: {
    damping: 0.35,
    stiffness: 0.02,
  },

  // Timing
  resizeDebounceDelayMs: 100,
  minRotationSpeed: 10, // degrees per second

  // Scroll interaction
  rotationSpeed: 10,
  scrollSpeedMultiplier: 30,
  relativeBlobRotation: 0.3,

  // Position interpolation
  curYInterp: 0.8,
  desiredYBase: 0.8,
  desiredYMultiplier: 0.6,

  // Color generation
  colorSteps: 64,
  speedRange: {
    min: 0.1,
    max: 0.55,
  },
  scaleRange: {
    min: 0.2,
    max: 1.7,
  },
} as const;

const DEFAULT_PROPS = {
  scrollSpeedDamping: 1.25,
  numBlobs: ANIMATION_CONFIG.blobCount.default,
  renderSize: ANIMATION_CONFIG.renderSize,
  springDamping: ANIMATION_CONFIG.spring.damping,
  springStiffness: ANIMATION_CONFIG.spring.stiffness,
  resizeDebounceDelayMs: ANIMATION_CONFIG.resizeDebounceDelayMs,
  rotationSpeed: ANIMATION_CONFIG.rotationSpeed,
  scrollSpeedMultiplier: ANIMATION_CONFIG.scrollSpeedMultiplier,
  relativeBlobRotation: ANIMATION_CONFIG.relativeBlobRotation,
  curYInterp: ANIMATION_CONFIG.curYInterp,
  desiredYBase: ANIMATION_CONFIG.desiredYBase,
  desiredYMultiplier: ANIMATION_CONFIG.desiredYMultiplier,
} as const;

interface AnimatedBackgroundProps {
  scrollYProgress: MotionValue<number>;
  scrollSpeedDamping?: number;
  colorPairs: [HSLColor, HSLColor][];
  // Animation constants
  numBlobs?: number;
  renderSize?: number;
  springDamping?: number;
  springStiffness?: number;
  resizeDebounceDelayMs?: number;
  rotationSpeed?: number;
  scrollSpeedMultiplier?: number;
  relativeBlobRotation?: number;
  curYInterp?: number;
  desiredYBase?: number;
  desiredYMultiplier?: number;
}

/**
 * HSL color representation for blob gradients
 */
export type HSLColor = {
  /** Hue value (0-360 degrees) */
  h: number;
  /** Saturation percentage (0-100) */
  s: number;
  /** Lightness percentage (0-100) */
  l: number;
};

/**
 * Types for dirty region tracking optimization
 */

/**
 * Represents the state of a blob for change detection
 */
interface BlobState {
  /** Current position of the blob on canvas */
  position: { x: number; y: number };
  /** Current rotation angle in degrees */
  rotation: number;
  /** Current scale factor */
  scale: number;
  /** Current color index in the color array */
  colorIndex: number;
}

/**
 * Represents a rectangular region that needs to be redrawn
 */
interface DirtyRegion {
  /** X coordinate of the region */
  x: number;
  /** Y coordinate of the region */
  y: number;
  /** Width of the region */
  width: number;
  /** Height of the region */
  height: number;
}

/**
 * Interpolates between two hue values using the shortest path around the color wheel
 * @param h1 - Starting hue value (0-360)
 * @param h2 - Ending hue value (0-360)
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated hue value (0-360)
 */
const interpolateHueShortestPath = (
  h1: number,
  h2: number,
  t: number
): number => {
  h1 = (h1 + 360) % 360;
  h2 = (h2 + 360) % 360;

  let delta = h2 - h1;

  if (Math.abs(delta) > 180) {
    delta = delta - Math.sign(delta) * 360;
  }

  return (h1 + t * delta + 360) % 360;
};

/**
 * Converts HSL color object to CSS string format with caching
 * @param hsl - HSL color object
 * @returns CSS HSL string (e.g., "hsl(180, 50%, 50%)")
 */
const hslToString = (hsl: HSLColor) => {
  const key = `${hsl.h},${hsl.s},${hsl.l}`;
  return colorCache.getColor(key, () => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
};

const BLOB_PATHS = [
  "M25.7,-30.2C32.4,-25.1,36.2,-16.1,38.3,-6.4C40.3,3.2,40.6,13.4,36.8,22.3C32.9,31.3,25,39,15.5,42.2C6.1,45.4,-4.8,44.2,-13.5,39.8C-22.3,35.5,-29,28,-33.3,19.7C-37.6,11.3,-39.6,2,-38.7,-7.5C-37.8,-17,-34.1,-26.6,-27.2,-31.7C-20.3,-36.7,-10.1,-37.3,-0.3,-36.9C9.5,-36.6,19.1,-35.3,25.7,-30.2Z",
  "M22.4,-27.2C29.7,-20.7,36.6,-14.2,37.9,-6.7C39.1,0.7,34.7,9.1,29.7,16.4C24.6,23.8,18.9,30,11.9,32.5C4.9,35,-3.5,33.7,-11.7,31.1C-19.9,28.5,-28,24.7,-33.6,17.9C-39.2,11.2,-42.3,1.6,-40.4,-6.8C-38.5,-15.2,-31.6,-22.3,-24.1,-28.8C-16.5,-35.3,-8.2,-41.1,-0.3,-40.7C7.6,-40.3,15.2,-33.8,22.4,-27.2Z",
  "M23.1,-27.4C28.5,-23,30.4,-14.4,31,-6.1C31.6,2.1,31.1,9.8,27.6,16C24.1,22.1,17.7,26.5,10,30.9C2.3,35.2,-6.8,39.3,-14.7,37.6C-22.7,36,-29.5,28.5,-33.2,20.1C-36.9,11.8,-37.5,2.5,-36.1,-6.6C-34.8,-15.8,-31.7,-24.9,-25.3,-29.1C-19,-33.3,-9.5,-32.6,-0.3,-32.3C8.9,-31.9,17.7,-31.8,23.1,-27.4Z",
] as const;

/**
 * Path2D object pool for better memory management and performance
 * Reuses Path2D objects instead of creating new ones for each blob
 */
class Path2DPool {
  private pool = new Map<string, Path2D>();

  /**
   * Gets a Path2D object from the pool, creating it if it doesn't exist
   * @param rawPath - SVG path string
   * @returns Path2D object
   */
  getPath(rawPath: string): Path2D {
    if (!this.pool.has(rawPath)) {
      this.pool.set(rawPath, new Path2D(rawPath));
    }
    return this.pool.get(rawPath)!;
  }

  /**
   * Clears all cached Path2D objects to prevent memory leaks
   */
  clear(): void {
    this.pool.clear();
  }
}

// Global pool instance
const path2DPool = new Path2DPool();

/**
 * Calculates the bounding box for a blob including padding for smooth transitions
 * @param blob - Blob data containing scale information
 * @param position - Current position of the blob
 * @param scale - Additional scale factor
 * @returns DirtyRegion representing the area the blob occupies
 */
const calculateBlobBounds = (
  blob: BlobData,
  position: { x: number; y: number },
  scale: number
): DirtyRegion => {
  const padding = 10; // Extra padding for smooth transitions
  const size = Math.max(blob.scale * scale * 50, 20); // Approximate blob size

  return {
    x: Math.max(0, position.x - size - padding),
    y: Math.max(0, position.y - size - padding),
    width: Math.min(size * 2 + padding * 2, 100),
    height: Math.min(size * 2 + padding * 2, 100),
  };
};

/**
 * Merges overlapping dirty regions to minimize the number of clear operations
 * @param regions - Array of dirty regions to merge
 * @returns Array of merged regions with reduced overlap
 */
const mergeDirtyRegions = (regions: DirtyRegion[]): DirtyRegion[] => {
  if (regions.length <= 1) return regions;

  // Simple merging: if regions overlap significantly, combine them
  const merged: DirtyRegion[] = [];

  for (const region of regions) {
    let mergedWithExisting = false;

    for (let i = 0; i < merged.length; i++) {
      const existing = merged[i];
      const overlapX = Math.max(
        0,
        Math.min(region.x + region.width, existing.x + existing.width) -
          Math.max(region.x, existing.x)
      );
      const overlapY = Math.max(
        0,
        Math.min(region.y + region.height, existing.y + existing.height) -
          Math.max(region.y, existing.y)
      );
      const overlapArea = overlapX * overlapY;
      const regionArea = region.width * region.height;
      const existingArea = existing.width * existing.height;

      // If overlap is more than 50% of either region, merge them
      if (overlapArea > regionArea * 0.5 || overlapArea > existingArea * 0.5) {
        merged[i] = {
          x: Math.min(region.x, existing.x),
          y: Math.min(region.y, existing.y),
          width:
            Math.max(region.x + region.width, existing.x + existing.width) -
            Math.min(region.x, existing.x),
          height:
            Math.max(region.y + region.height, existing.y + existing.height) -
            Math.min(region.y, existing.y),
        };
        mergedWithExisting = true;
        break;
      }
    }

    if (!mergedWithExisting) {
      merged.push(region);
    }
  }

  return merged;
};

/**
 * Gradient cache for better performance
 * Reuses CanvasGradient objects instead of creating new ones for each frame
 */
class GradientCache {
  private cache = new Map<string, CanvasGradient>();
  private canvas: HTMLCanvasElement | null = null;

  /**
   * Sets the canvas context and clears the cache
   * @param canvas - HTMLCanvasElement to use for gradient creation
   */
  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clear(); // Clear cache when canvas changes
  }

  /**
   * Gets a gradient from the cache, creating it if it doesn't exist
   * @param key - Unique key for the gradient
   * @param createFn - Function to create the gradient if not cached
   * @returns CanvasGradient object
   */
  getGradient(key: string, createFn: () => CanvasGradient): CanvasGradient {
    if (!this.cache.has(key)) {
      this.cache.set(key, createFn());
    }
    return this.cache.get(key)!;
  }

  /**
   * Clears all cached gradients to prevent memory leaks
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Color string cache for better performance
 * Avoids repeated HSL string conversions during rendering
 */
class ColorCache {
  private cache = new Map<string, string>();

  /**
   * Gets a color string from cache, creating it if it doesn't exist
   * @param key - Cache key (HSL values)
   * @param createFn - Function to create the color string if not cached
   * @returns Color string
   */
  getColor(key: string, createFn: () => string): string {
    if (!this.cache.has(key)) {
      this.cache.set(key, createFn());
    }
    return this.cache.get(key)!;
  }

  /**
   * Clears all cached colors to prevent memory leaks
   */
  clear(): void {
    this.cache.clear();
  }
}

const gradientCache = new GradientCache();
const colorCache = new ColorCache();

/**
 * Generates blob data with colors, paths, and animation properties
 * @param count - Number of blobs to generate
 * @param colorPairs - Array of HSL color pairs for gradient interpolation
 * @returns Array of BlobData objects ready for rendering
 */
/**
 * Simplified color interpolation using linear interpolation for better performance
 *
 * This optimization reduces computational overhead by:
 * 1. Using simple linear interpolation instead of complex mathematical operations
 * 2. Removing separate interpolation factors for each HSL component
 * 3. Eliminating expensive power operations and complex formulas
 *
 * @param color1 - Starting HSL color
 * @param color2 - Ending HSL color
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated HSL color
 */
const interpolateHSLSimple = (
  color1: HSLColor,
  color2: HSLColor,
  t: number
): HSLColor => {
  const h = interpolateHueShortestPath(color1.h, color2.h, t);
  const s = color1.s + (color2.s - color1.s) * t;
  const l = color1.l + (color2.l - color1.l) * t;
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
};

/**
 * Pre-calculates all color steps for better performance
 * @param colorPairs - Array of HSL color pairs
 * @returns Array of pre-calculated color strings
 */
const generateColorSteps = (
  colorPairs: [HSLColor, HSLColor][]
): { a: string; b: string }[] => {
  const startTime = performance.now();

  // Special case for single color pair - no interpolation needed
  if (colorPairs.length === 1) {
    const [c1, c2] = colorPairs[0];
    const colorSteps = [
      {
        a: hslToString(c1),
        b: hslToString(c2),
      },
    ];

    const endTime = performance.now();
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🎨 Color Generation: ${colorSteps.length} colors in ${(
          endTime - startTime
        ).toFixed(2)}ms (single color pair)`
      );
    }

    return colorSteps;
  }

  // Original interpolation logic for multiple color pairs
  const colorSteps: { a: string; b: string }[] = [];
  const segments = colorPairs.length - 1;
  const stepsPerSegment = ANIMATION_CONFIG.colorSteps / segments;

  for (let j = 0; j < segments; j++) {
    const [c1, c2] = colorPairs[j];
    const [n1, n2] = colorPairs[j + 1];

    for (let k = 0; k <= stepsPerSegment; k++) {
      const mix = k / stepsPerSegment;

      const interpolatedA = interpolateHSLSimple(c1, n1, mix);
      const interpolatedB = interpolateHSLSimple(c2, n2, mix);

      // Avoid duplicating shared steps
      if (j < segments - 1 && k === stepsPerSegment) continue;

      colorSteps.push({
        a: hslToString(interpolatedA),
        b: hslToString(interpolatedB),
      });
    }
  }

  const endTime = performance.now();

  if (process.env.NODE_ENV === "development") {
    console.log(
      `🎨 Color Generation: ${colorSteps.length} colors in ${(
        endTime - startTime
      ).toFixed(2)}ms`
    );
  }

  return colorSteps;
};

const generateBlobs = (
  count: number,
  colorPairs: [HSLColor, HSLColor][]
): BlobData[] => {
  const blobs: BlobData[] = [];

  // Pre-calculate all color steps once for all blobs
  const colorSteps = generateColorSteps(colorPairs);

  for (let i = 0; i < count; i++) {
    const rawPath = BLOB_PATHS[Math.floor(Math.random() * BLOB_PATHS.length)];
    const path2D = path2DPool.getPath(rawPath);

    const speed =
      ANIMATION_CONFIG.speedRange.min +
      (ANIMATION_CONFIG.speedRange.max - ANIMATION_CONFIG.speedRange.min) *
        ((count - 1 - i) / count) +
      (ANIMATION_CONFIG.speedRange.max - ANIMATION_CONFIG.speedRange.min) *
        Math.random();

    blobs.push({
      path: path2D,
      rotation: {
        angle: Math.random() * 360,
        curSpeed: speed,
        baseSpeed: speed,
      },
      scale:
        ANIMATION_CONFIG.scaleRange.min +
        (1 - i / (count - 1)) *
          (ANIMATION_CONFIG.scaleRange.max - ANIMATION_CONFIG.scaleRange.min),
      colors: colorSteps, // All blobs share the same pre-calculated colors
    });
  }
  return blobs;
};

/**
 * AnimatedBackground - A high-performance animated background component
 *
 * Features:
 * - Hardware-adaptive quality settings
 * - Frame rate limiting for consistent performance
 * - Dirty region tracking for optimized rendering
 * - Path2D and gradient caching for memory efficiency
 * - Comprehensive error handling and validation
 *
 * @example
 * ```tsx
 * // Single color pair (no interpolation)
 * <AnimatedBackground
 *   scrollYProgress={scrollYProgress}
 *   colorPairs={[
 *     [{ h: 0, s: 50, l: 50 }, { h: 180, s: 50, l: 50 }]
 *   ]}
 *   numBlobs={12}
 *   renderSize={32}
 * />
 *
 * // Multiple color pairs (with interpolation)
 * <AnimatedBackground
 *   scrollYProgress={scrollYProgress}
 *   colorPairs={[
 *     [{ h: 0, s: 50, l: 50 }, { h: 180, s: 50, l: 50 }],
 *     [{ h: 360, s: 50, l: 50 }, { h: 180, s: 50, l: 50 }]
 *   ]}
 *   numBlobs={12}
 *   renderSize={32}
 * />
 * ```
 */
const AnimatedBackground = React.memo<AnimatedBackgroundProps>(
  ({
    scrollYProgress,
    colorPairs,
    scrollSpeedDamping = DEFAULT_PROPS.scrollSpeedDamping,
    numBlobs = DEFAULT_PROPS.numBlobs,
    renderSize = DEFAULT_PROPS.renderSize,
    springDamping = DEFAULT_PROPS.springDamping,
    springStiffness = DEFAULT_PROPS.springStiffness,
    resizeDebounceDelayMs = DEFAULT_PROPS.resizeDebounceDelayMs,
    rotationSpeed = DEFAULT_PROPS.rotationSpeed,
    scrollSpeedMultiplier = DEFAULT_PROPS.scrollSpeedMultiplier,
    relativeBlobRotation = DEFAULT_PROPS.relativeBlobRotation,
    curYInterp = DEFAULT_PROPS.curYInterp,
    desiredYBase = DEFAULT_PROPS.desiredYBase,
    desiredYMultiplier = DEFAULT_PROPS.desiredYMultiplier,
  }) => {
    const { performanceTier, loading } = useHardwareCapability();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const blobs = useRef<BlobData[]>([]);
    const colorIndex = useRef(0);
    const prevScrollY = useRef<number | null>(null);
    const curY = useRef(0.5);
    const desiredY = useRef(0.8);
    const scrollDirection = useRef(1);
    const lastFrameTime = useRef(performance.now());
    const frameCount = useRef(0);
    const lastFpsUpdate = useRef(performance.now());
    const [canvasBlurSupported, setCanvasBlurSupported] = useState(true);

    // Dirty region tracking state
    const previousBlobStates = useRef<BlobState[]>([]);
    const isFirstFrame = useRef(true);

    // Debounced resize handler
    const debouncedResize = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Validates component props and logs warnings for invalid values
     * @returns Object containing validation errors and warnings
     */
    const validateProps = () => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Critical errors that could cause crashes
      if (!colorPairs || !Array.isArray(colorPairs) || colorPairs.length < 1) {
        errors.push("colorPairs must be an array with at least 1 color pair");
      } else {
        // Validate color structure
        colorPairs.forEach((pair, index) => {
          if (!Array.isArray(pair) || pair.length !== 2) {
            errors.push(
              `colorPairs[${index}] must be an array with exactly 2 HSL colors`
            );
            return;
          }
          pair.forEach((color, colorIndex) => {
            if (
              !color ||
              typeof color.h !== "number" ||
              typeof color.s !== "number" ||
              typeof color.l !== "number"
            ) {
              errors.push(
                `colorPairs[${index}][${colorIndex}] must be a valid HSL color object`
              );
            }
          });
        });
      }

      if (!scrollYProgress || typeof scrollYProgress.get !== "function") {
        errors.push("scrollYProgress must be a valid MotionValue");
      }

      // Performance warnings
      if (numBlobs < 1 || numBlobs > 50) {
        warnings.push(
          "numBlobs should be between 1 and 50 for optimal performance"
        );
      }

      if (renderSize < 16 || renderSize > 128) {
        warnings.push(
          "renderSize should be between 16 and 128 for optimal quality"
        );
      }

      if (scrollSpeedDamping <= 0) {
        warnings.push(
          "scrollSpeedDamping should be positive for smooth animation"
        );
      }

      // Log errors (always) and warnings (development only)
      if (errors.length > 0) {
        console.error("AnimatedBackground validation errors:", errors);
      }

      if (warnings.length > 0 && process.env.NODE_ENV === "development") {
        console.warn("AnimatedBackground validation warnings:", warnings);
      }

      return { errors, warnings };
    };

    // Run validation
    const { errors } = validateProps();

    /**
     * Memoizes animation constants to reduce dependency changes and improve performance
     * @returns Object containing all animation-related constants
     */
    const animationConstants = useMemo(
      () => ({
        renderSize,
        curYInterp,
        springStiffness,
        springDamping,
        rotationSpeed,
        scrollSpeedDamping,
        scrollSpeedMultiplier,
        relativeBlobRotation,
        desiredYBase,
        desiredYMultiplier,
      }),
      [
        renderSize,
        curYInterp,
        springStiffness,
        springDamping,
        rotationSpeed,
        scrollSpeedDamping,
        scrollSpeedMultiplier,
        relativeBlobRotation,
        desiredYBase,
        desiredYMultiplier,
      ]
    );

    const handleResize = useCallback(() => {
      if (debouncedResize.current) {
        clearTimeout(debouncedResize.current);
      }
      debouncedResize.current = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      }, resizeDebounceDelayMs);
    }, [resizeDebounceDelayMs]);

    /**
     * Adjusts quality settings based on device performance capabilities
     * @returns Quality settings object with blob count, frame rate, and blur amount
     */
    const qualitySettings = useMemo(() => {
      if (loading)
        return {
          blobCount: numBlobs,
          frameRate: ANIMATION_CONFIG.frameRates.medium,
          blurAmount: ANIMATION_CONFIG.blurAmounts.medium,
        };

      switch (performanceTier) {
        case "low":
          return {
            blobCount: ANIMATION_CONFIG.blobCount.low,
            frameRate: ANIMATION_CONFIG.frameRates.low,
            blurAmount: ANIMATION_CONFIG.blurAmounts.low,
          };
        case "medium":
          return {
            blobCount: ANIMATION_CONFIG.blobCount.medium,
            frameRate: ANIMATION_CONFIG.frameRates.medium,
            blurAmount: ANIMATION_CONFIG.blurAmounts.medium,
          };
        case "high":
          return {
            blobCount: numBlobs,
            frameRate: ANIMATION_CONFIG.frameRates.high,
            blurAmount: ANIMATION_CONFIG.blurAmounts.high,
          };
        default:
          return {
            blobCount: numBlobs,
            frameRate: ANIMATION_CONFIG.frameRates.medium,
            blurAmount: ANIMATION_CONFIG.blurAmounts.medium,
          };
      }
    }, [loading, performanceTier, numBlobs]);

    // Adaptive frame rate adjustment
    const [adaptiveFrameRate, setAdaptiveFrameRate] = useState(
      qualitySettings.frameRate
    );

    useEffect(() => {
      setAdaptiveFrameRate(qualitySettings.frameRate);
    }, [qualitySettings.frameRate]);

    // Performance monitoring and adaptive frame rate adjustment
    useEffect(() => {
      if (process.env.NODE_ENV !== "development") return;

      const performanceCheckInterval = setInterval(() => {
        // This would be implemented with actual performance metrics
        // For now, we'll just log the current frame rate
        console.log(
          `🎨 Performance Check: Current frame rate target: ${adaptiveFrameRate}fps`
        );
      }, 5000); // Check every 5 seconds

      return () => clearInterval(performanceCheckInterval);
    }, [adaptiveFrameRate]);

    // Log hardware detection and quality settings
    useEffect(() => {
      if (!loading) {
        console.table({
          "🎨 AnimatedBackground - Hardware Detection": {
            performanceTier,
            blobCount: qualitySettings.blobCount,
            frameRate: `${qualitySettings.frameRate}fps${
              qualitySettings.frameRate === 60 ? " (High Performance)" : ""
            }`,
            blurAmount: qualitySettings.blurAmount,
          },
        });
      }
    }, [performanceTier, loading, qualitySettings]);

    // Initialize blobs with appropriate count
    useEffect(() => {
      blobs.current = generateBlobs(qualitySettings.blobCount, colorPairs);
    }, [qualitySettings.blobCount, colorPairs]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
      // Calculate color index based on scroll progress
      // Map scroll progress (0-1) to color index (0 to colorSteps-1)
      const colorSteps =
        blobs.current[0]?.colors?.length || ANIMATION_CONFIG.colorSteps;
      colorIndex.current = Math.min(
        Math.floor(latest * colorSteps),
        colorSteps - 1
      );

      if (prevScrollY.current === null) prevScrollY.current = latest;
      scrollDirection.current = latest > prevScrollY.current ? -1 : 1;

      blobs.current.forEach((blob, index) => {
        blob.rotation.curSpeed =
          scrollSpeedMultiplier *
          rotationSpeed *
          Math.pow(
            (blobs.current.length - index) / blobs.current.length,
            relativeBlobRotation
          ) *
          blob.rotation.baseSpeed *
          scrollDirection.current;
      });
      prevScrollY.current = latest;

      desiredY.current = desiredYBase - latest * desiredYMultiplier;
    });

    // Feature detection for canvas filter: blur support
    useEffect(() => {
      // Only run on client
      if (typeof window === "undefined") return;
      try {
        const testCanvas = document.createElement("canvas");
        testCanvas.width = testCanvas.height = 8;
        const ctx = testCanvas.getContext("2d");
        if (!ctx || typeof ctx.filter === "undefined") {
          setCanvasBlurSupported(false);
          return;
        }
        // Try to apply blur and see if it throws or is ignored
        ctx.filter = "blur(2px)";
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 8, 8);
        // If filter is ignored, it will be "none" or "" after setting
        if (ctx.filter === "none" || ctx.filter === "") {
          setCanvasBlurSupported(false);
          return;
        }
        setCanvasBlurSupported(true);
      } catch {
        setCanvasBlurSupported(false);
      }
    }, []);

    useEffect(() => {
      // Validate canvas and context availability
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas ref not available");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("2D context not supported");
        return;
      }

      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) {
        console.error("Offscreen 2D context not supported");
        return;
      }

      // Set up gradient cache for offscreen canvas
      gradientCache.setCanvas(offscreen);

      // Set your target resolution for offscreen rendering
      const renderWidth = animationConstants.renderSize;
      const renderHeight = animationConstants.renderSize;

      offscreen.width = renderWidth;
      offscreen.height = renderHeight;

      window.addEventListener("resize", handleResize);
      handleResize(); // Initial setup

      const render = (currentTime: number) => {
        // Calculate delta time in seconds
        const deltaSeconds = (currentTime - lastFrameTime.current) / 1000;

        // Frame rate limiting based on adaptive quality settings
        const targetFrameTime = 1000 / adaptiveFrameRate; // Convert fps to milliseconds
        const timeSinceLastFrame = currentTime - lastFrameTime.current;

        if (timeSinceLastFrame < targetFrameTime) {
          // Skip frame to maintain target frame rate
          requestAnimationFrame(render);
          return;
        }

        lastFrameTime.current = currentTime;

        // Track frame rate for performance monitoring
        frameCount.current++;
        const timeSinceFpsUpdate = currentTime - lastFpsUpdate.current;
        if (timeSinceFpsUpdate >= 1000) {
          // Update FPS every second
          const actualFps = Math.round(
            (frameCount.current * 1000) / timeSinceFpsUpdate
          );
          if (process.env.NODE_ENV === "development") {
            console.log(
              `🎨 AnimatedBackground FPS: ${actualFps}/${adaptiveFrameRate} target`
            );
          }
          frameCount.current = 0;
          lastFpsUpdate.current = currentTime;
        }

        // Calculate current blob states for dirty region tracking
        const currentBlobStates: BlobState[] = [];
        const dirtyRegions: DirtyRegion[] = [];

        // Calculate Y position for all blobs
        curY.current = interp(
          curY.current,
          desiredY.current,
          animationConstants.curYInterp,
          {
            type: "spring",
            stiffness: animationConstants.springStiffness,
            damping: animationConstants.springDamping,
          }
        );

        // Determine which regions need to be redrawn
        if (!isFirstFrame.current) {
          for (let i = 0; i < blobs.current.length; i++) {
            const blob = blobs.current[i];
            const prevState = previousBlobStates.current[i];

            // Calculate current blob position and state
            const currentPosition = {
              x: renderWidth / 2,
              y: (curY.current * renderHeight) / 8,
            };

            const currentState: BlobState = {
              position: currentPosition,
              rotation: blob.rotation.angle,
              scale: blob.scale,
              colorIndex: colorIndex.current,
            };

            currentBlobStates.push(currentState);

            // Check if blob has changed significantly
            if (prevState) {
              const rotationChanged =
                Math.abs(currentState.rotation - prevState.rotation) > 5;
              const positionChanged =
                Math.abs(currentState.position.y - prevState.position.y) > 2;
              const colorChanged =
                currentState.colorIndex !== prevState.colorIndex;

              if (rotationChanged || positionChanged || colorChanged) {
                // Add both old and new regions to dirty regions
                dirtyRegions.push(
                  calculateBlobBounds(blob, prevState.position, prevState.scale)
                );
                dirtyRegions.push(
                  calculateBlobBounds(
                    blob,
                    currentState.position,
                    currentState.scale
                  )
                );
              }
            }
          }
        } else {
          // First frame: redraw everything
          isFirstFrame.current = false;
          offCtx.clearRect(0, 0, renderWidth, renderHeight);
        }

        // Clear only dirty regions (or entire canvas on first frame)
        if (dirtyRegions.length > 0) {
          const mergedRegions = mergeDirtyRegions(dirtyRegions);
          mergedRegions.forEach((region) => {
            offCtx.clearRect(region.x, region.y, region.width, region.height);
          });

          // Log dirty region performance in development
          if (
            process.env.NODE_ENV === "development" &&
            frameCount.current % 60 === 0
          ) {
            const totalCanvasArea = renderWidth * renderHeight;
            const dirtyArea = mergedRegions.reduce(
              (sum, region) => sum + region.width * region.height,
              0
            );
            const efficiency = (
              ((totalCanvasArea - dirtyArea) / totalCanvasArea) *
              100
            ).toFixed(1);
            console.log(
              `🎨 Dirty Regions: ${mergedRegions.length} regions, ${efficiency}% efficiency`
            );
          }
        }

        /**
         * Batch canvas operations for better performance
         *
         * This optimization reduces context state changes by:
         * 1. Pre-calculating all blob transformations before rendering
         * 2. Batching gradient creation and caching
         * 3. Minimizing save/restore operations
         * 4. Grouping related canvas operations together
         */
        offCtx.save();

        // Set global context state once
        offCtx.translate(0, renderHeight * curY.current);
        if (canvasBlurSupported) {
          offCtx.filter = `blur(${qualitySettings.blurAmount}px)`;
        } else {
          offCtx.filter = "none";
        }

        // Pre-calculate all blob transformations and prepare rendering data
        const blobRenderData: Array<{
          blob: BlobData;
          rotation: number;
          gradient: CanvasGradient;
          transform: {
            translateY: number;
            rotation: number;
            scale: number;
          };
        }> = [];

        for (const blob of blobs.current) {
          try {
            // Calculate target speed: minimum continuous speed + scroll influence
            const targetSpeed =
              Math.max(
                ANIMATION_CONFIG.minRotationSpeed,
                blob.rotation.baseSpeed * animationConstants.rotationSpeed
              ) * scrollDirection.current;

            // Convert frame-based interpolation to time-based interpolation
            // scrollSpeedDamping is "per second" instead of "per frame"
            const interpAmount =
              1 -
              Math.pow(
                1 - 1 / animationConstants.scrollSpeedDamping,
                deltaSeconds
              );
            blob.rotation.curSpeed = interp(
              blob.rotation.curSpeed,
              targetSpeed,
              interpAmount,
              { type: "linear" }
            );
            // Use delta time for rotation update (degrees per second)
            blob.rotation.angle += blob.rotation.curSpeed * deltaSeconds;
            const rotation = blob.rotation.angle;

            // Validate color index and colors
            const colorIndexSafe = Math.max(
              0,
              Math.min(colorIndex.current, blob.colors.length - 1)
            );
            const colors = blob.colors[colorIndexSafe];
            if (colors && colors.a && colors.b) {
              // Create gradient cache key
              const gradientKey = `${colors.a}-${colors.b}-${animationConstants.renderSize}`;

              const grad = gradientCache.getGradient(gradientKey, () => {
                const gradient = offCtx.createLinearGradient(
                  -(animationConstants.renderSize / 2),
                  animationConstants.renderSize / 2,
                  animationConstants.renderSize / 8,
                  -(animationConstants.renderSize / 8)
                );
                gradient.addColorStop(0, colors.a);
                gradient.addColorStop(1, colors.b);
                return gradient;
              });

              blobRenderData.push({
                blob,
                rotation,
                gradient: grad,
                transform: {
                  translateY: (curY.current * renderHeight) / 8,
                  rotation: (rotation * Math.PI) / 180,
                  scale: blob.scale,
                },
              });
            }
          } catch (error) {
            console.error("Error preparing blob data:", error);
          }
        }

        /**
         * Batch render all blobs with minimal context state changes
         *
         * This approach reduces the number of context state changes by:
         * - Pre-calculating all transformations
         * - Using cached gradients
         * - Minimizing save/restore cycles
         */
        const renderStartTime = performance.now();
        for (const renderData of blobRenderData) {
          offCtx.save();
          offCtx.translate(0, renderData.transform.translateY);
          offCtx.rotate(renderData.transform.rotation);
          offCtx.scale(renderData.transform.scale, renderData.transform.scale);
          offCtx.fillStyle = renderData.gradient;
          offCtx.fill(renderData.blob.path);
          offCtx.restore();
        }
        const renderEndTime = performance.now();

        // Log batch rendering performance in development
        if (
          process.env.NODE_ENV === "development" &&
          frameCount.current % 120 === 0
        ) {
          const renderTime = renderEndTime - renderStartTime;
          console.log(
            `🎨 Batch Rendering: ${
              blobRenderData.length
            } blobs in ${renderTime.toFixed(2)}ms`
          );
        }

        offCtx.restore();

        // Update previous blob states for next frame
        if (currentBlobStates.length > 0) {
          previousBlobStates.current = currentBlobStates;
        }

        // Batch main canvas operations
        const mainCanvasStartTime = performance.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
        const mainCanvasEndTime = performance.now();

        // Log main canvas performance in development
        if (
          process.env.NODE_ENV === "development" &&
          frameCount.current % 120 === 0
        ) {
          const mainCanvasTime = mainCanvasEndTime - mainCanvasStartTime;
          console.log(`🎨 Main Canvas: ${mainCanvasTime.toFixed(2)}ms`);
        }

        requestAnimationFrame(render);
      };

      render(performance.now());
      return () => {
        window.removeEventListener("resize", handleResize);
        if (debouncedResize.current) {
          clearTimeout(debouncedResize.current);
        }
        // Clean up pools to prevent memory leaks
        path2DPool.clear();
        gradientCache.clear();
        colorCache.clear();
      };
    }, [
      // Quality settings (changes when performance tier changes)
      qualitySettings,
      // Adaptive frame rate (changes based on performance)
      adaptiveFrameRate,
      // Canvas support (changes once on mount)
      canvasBlurSupported,
      // Resize handler (stable callback)
      handleResize,
      // Animation constants (memoized to reduce changes)
      animationConstants,
    ]);

    // Don't render if there are critical validation errors
    if (errors.length > 0) {
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            pointerEvents: "none",
            background: "#000",
          }}
        />
      );
    }

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100vw",
            height: "100vh",
            display: "block",
            background:
              blobs.current[0]?.colors[colorIndex.current]?.b ||
              blobs.current[0]?.colors[0]?.b ||
              "#000",
          }}
        />
        {!canvasBlurSupported && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 1,
              backdropFilter: `blur(${qualitySettings.blurAmount * 10}px)`,
              WebkitBackdropFilter: `blur(${
                qualitySettings.blurAmount * 20
              }px)`,
              // fallback for browsers that don't support backdrop-filter
              filter: `blur(${qualitySettings.blurAmount * 20}px)`,
              background: "transparent",
              transition: "backdrop-filter 0.3s, filter 0.3s",
            }}
          />
        )}
      </div>
    );
  }
);

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
