"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MotionValue, useMotionValueEvent } from "motion/react";
import { interp } from "@/lib/interp";
import type { HSLColor } from "@/components/animated-background2";

/**
 * Configuration constants matching the original animated-background component
 */
const ANIMATION_CONFIG = {
  colorSteps: 64,
  minRotationSpeed: 10, // degrees per second
  speedRange: {
    min: 0.1,
    max: 0.55,
  },
} as const;

const DEFAULT_CONFIG = {
  scrollSpeedDamping: 1.25,
  springDamping: 0.35,
  springStiffness: 0.02,
  rotationSpeed: 10,
  scrollSpeedMultiplier: 30,
  relativeBlobRotation: 0.3,
  curYInterp: 0.8,
  desiredYBase: 0.8, // Y position when scroll progress is 0
  desiredYMultiplier: 0.6, // Difference between max and min Y (0.8 - 0.2 = 0.6)
  blobXPosition: 0.5,
} as const;

interface UseAnimatedBackgroundOptions {
  scrollYProgress: MotionValue<number>;
  colorPairs: [HSLColor, HSLColor][];
  numBlobs?: number;
  scrollSpeedDamping?: number;
  springDamping?: number;
  springStiffness?: number;
  rotationSpeed?: number;
  scrollSpeedMultiplier?: number;
  relativeBlobRotation?: number;
  curYInterp?: number;
  desiredYBase?: number;
  desiredYMultiplier?: number;
  blobXPosition?: number;
}

/**
 * Interpolates between two hue values using the shortest path around the color wheel
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
 * Interpolates between two HSL colors
 */
const interpolateHSL = (
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
 * Gets the interpolated color pair based on scroll progress
 */
const getInterpolatedColorPair = (
  colorPairs: [HSLColor, HSLColor][],
  progress: number
): [HSLColor, HSLColor] => {
  if (colorPairs.length === 0) {
    throw new Error("colorPairs must have at least one pair");
  }

  if (colorPairs.length === 1) {
    return colorPairs[0];
  }

  // Map progress (0-1) to color pair segments
  const segments = colorPairs.length - 1;
  const segmentProgress = progress * segments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), segments - 1);
  const t = segmentProgress - segmentIndex;

  const [c1, c2] = colorPairs[segmentIndex];
  const [n1, n2] = colorPairs[segmentIndex + 1];

  return [interpolateHSL(c1, n1, t), interpolateHSL(c2, n2, t)];
};

/**
 * Hook that recreates all animations from the original AnimatedBackground component
 * Returns props that can be passed to AnimatedBackground2
 */
export function useAnimatedBackground({
  scrollYProgress,
  colorPairs,
  numBlobs = 12,
  scrollSpeedDamping = DEFAULT_CONFIG.scrollSpeedDamping,
  springDamping = DEFAULT_CONFIG.springDamping,
  springStiffness = DEFAULT_CONFIG.springStiffness,
  rotationSpeed = DEFAULT_CONFIG.rotationSpeed,
  scrollSpeedMultiplier = DEFAULT_CONFIG.scrollSpeedMultiplier,
  relativeBlobRotation = DEFAULT_CONFIG.relativeBlobRotation,
  curYInterp = DEFAULT_CONFIG.curYInterp,
  desiredYBase = DEFAULT_CONFIG.desiredYBase,
  desiredYMultiplier = DEFAULT_CONFIG.desiredYMultiplier,
  blobXPosition = DEFAULT_CONFIG.blobXPosition,
}: UseAnimatedBackgroundOptions): {
  colorPair: [HSLColor, HSLColor];
  blobRotations: number | number[];
  blobY: number;
  blobX: number;
} {
  // Current scroll progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Y position state with spring interpolation
  const curY = useRef(0.8); // Start at scroll 0 position
  const desiredY = useRef(0.8); // Start at scroll 0 position
  const [blobY, setBlobY] = useState(0.8);

  // Rotation state
  const blobRotationsRef = useRef<number[]>([]);
  const blobBaseSpeedsRef = useRef<number[]>([]);
  const blobCurrentSpeedsRef = useRef<number[]>([]);
  const prevScrollY = useRef<number | null>(null);
  const scrollDirection = useRef(1);
  const lastRotationUpdateTime = useRef(performance.now());

  // Initialize rotations array with proper initial values
  const [blobRotations, setBlobRotations] = useState<number[]>(() => {
    return Array.from({ length: numBlobs }, () => Math.random() * 360);
  });

  // Initialize blob rotations and speeds
  useEffect(() => {
    const initialRotations = Array.from(
      { length: numBlobs },
      () => Math.random() * 360
    );

    blobRotationsRef.current = [...initialRotations];

    // Initialize base speeds (same as original)
    blobBaseSpeedsRef.current = Array.from({ length: numBlobs }, (_, i) => {
      const speed =
        ANIMATION_CONFIG.speedRange.min +
        (ANIMATION_CONFIG.speedRange.max - ANIMATION_CONFIG.speedRange.min) *
          ((numBlobs - 1 - i) / numBlobs) +
        (ANIMATION_CONFIG.speedRange.max - ANIMATION_CONFIG.speedRange.min) *
          Math.random();
      return speed;
    });

    // Initialize current speeds to base speeds
    blobCurrentSpeedsRef.current = [...blobBaseSpeedsRef.current];

    // Set initial state to match refs
    setBlobRotations([...blobRotationsRef.current]);
  }, [numBlobs]);

  // Handle scroll progress changes
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);

    // Calculate scroll direction
    if (prevScrollY.current === null) prevScrollY.current = latest;
    scrollDirection.current = latest > prevScrollY.current ? -1 : 1;
    prevScrollY.current = latest;

    // Update desired Y position
    // User wants: scroll 0 -> Y = 0.8, scroll 1 -> Y = 0.2
    // Formula: desiredY = 0.8 - latest * (0.8 - 0.2) = 0.8 - latest * 0.6
    // Using desiredYBase (0.8) and desiredYMultiplier (0.6) for clarity
    desiredY.current = desiredYBase - latest * desiredYMultiplier;

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Scroll Debug:", {
        latest,
        desiredY: desiredY.current,
        curY: curY.current,
        blobY,
      });
    }

    // Calculate target speeds based on scroll direction (same as original)
    // These will be interpolated towards in the animation loop
    blobCurrentSpeedsRef.current = blobCurrentSpeedsRef.current.map(
      (_, index) => {
        const baseSpeed = blobBaseSpeedsRef.current[index];
        return (
          scrollSpeedMultiplier *
          rotationSpeed *
          Math.pow((numBlobs - index) / numBlobs, relativeBlobRotation) *
          baseSpeed *
          scrollDirection.current
        );
      }
    );
  });

  // Update Y position with spring interpolation (runs every frame)
  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;

    const updateY = (): void => {
      const prevCurY = curY.current;
      const targetDesiredY = desiredY.current;

      // Spring interpolation for Y position (same as original)
      // The interp function's spring type uses the third parameter as progress (0-1)
      // curYInterp (0.8) is used as-is, which means 80% progress through the spring each frame
      // This creates a fast spring response. The original code works this way.
      curY.current = interp(curY.current, desiredY.current, curYInterp, {
        type: "spring",
        stiffness: springStiffness,
        damping: springDamping,
      });

      setBlobY(curY.current);

      // Debug logging in development (every 60 frames ~1 second)
      if (process.env.NODE_ENV === "development") {
        frameCount++;
        if (frameCount % 60 === 0) {
          console.log("Y Position Animation Debug:", {
            prevCurY,
            curY: curY.current,
            desiredY: targetDesiredY,
            blobY: curY.current,
            springStiffness,
            springDamping,
            curYInterp,
            changed: Math.abs(prevCurY - curY.current) > 0.001,
            distanceToTarget: Math.abs(targetDesiredY - curY.current),
          });
        }
      }

      animationFrameId = requestAnimationFrame(updateY);
    };

    animationFrameId = requestAnimationFrame(updateY);

    return (): void => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    curYInterp,
    springStiffness,
    springDamping,
    desiredYBase,
    desiredYMultiplier,
    // Note: scrollProgress is NOT in dependencies because we read desiredY from refs
    // The animation loop reads desiredY.current directly, so it doesn't need to restart
  ]);

  // Update rotations continuously (runs every frame)
  // Use refs for state that changes every frame, update React state less frequently
  useEffect(() => {
    let animationFrameId: number;
    let stateUpdateCounter = 0;
    lastRotationUpdateTime.current = performance.now();

    const updateRotations = (currentTime: number): void => {
      const deltaSeconds =
        (currentTime - lastRotationUpdateTime.current) / 1000;
      lastRotationUpdateTime.current = currentTime;

      // Ensure refs are initialized
      if (
        blobRotationsRef.current.length === 0 ||
        blobBaseSpeedsRef.current.length === 0
      ) {
        animationFrameId = requestAnimationFrame(updateRotations);
        return;
      }

      // Update each blob's rotation based on its speed
      const newRotations = blobRotationsRef.current.map((rotation, index) => {
        const baseSpeed = blobBaseSpeedsRef.current[index] || 0;
        const currentSpeed = blobCurrentSpeedsRef.current[index] || 0;

        // Convert frame-based interpolation to time-based (same as original)
        const interpAmount =
          1 - Math.pow(1 - 1 / scrollSpeedDamping, deltaSeconds);

        // Calculate target speed
        const targetSpeed =
          Math.max(
            ANIMATION_CONFIG.minRotationSpeed,
            baseSpeed * rotationSpeed
          ) * scrollDirection.current;

        // Interpolate current speed towards target (same as original)
        const newSpeed = interp(currentSpeed, targetSpeed, interpAmount, {
          type: "linear",
        });

        // Update stored speed
        blobCurrentSpeedsRef.current[index] = newSpeed;

        // Update rotation (normalize to 0-360 range)
        const newRotation = rotation + newSpeed * deltaSeconds;
        return ((newRotation % 360) + 360) % 360;
      });

      // Update refs every frame (for immediate access)
      blobRotationsRef.current = newRotations;

      // Only update React state every few frames to avoid excessive re-renders
      // This reduces flickering while still keeping the component responsive
      stateUpdateCounter++;
      if (stateUpdateCounter >= 1) {
        // Update every frame but use a ref-based approach for the component
        setBlobRotations([...newRotations]);
        stateUpdateCounter = 0;
      }

      animationFrameId = requestAnimationFrame(updateRotations);
    };

    animationFrameId = requestAnimationFrame(updateRotations);

    return (): void => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    numBlobs,
    scrollSpeedDamping,
    rotationSpeed,
    scrollSpeedMultiplier,
    relativeBlobRotation,
  ]);

  // Get current color pair based on scroll progress
  const colorPair = useMemo(() => {
    return getInterpolatedColorPair(colorPairs, scrollProgress);
  }, [colorPairs, scrollProgress]);

  // Expose refs so component can read current values without triggering re-renders
  return {
    colorPair,
    // Use refs for values that change every frame to avoid React re-renders
    blobRotations:
      blobRotations.length === 1 ? blobRotations[0] : blobRotations,
    blobY,
    blobX: blobXPosition,
  };
}
