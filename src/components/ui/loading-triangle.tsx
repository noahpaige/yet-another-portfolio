"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Magnetic } from "./magnetic";

interface LoadingTriangleProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const ANIMATION_CONFIG = {
  sm: {
    modeA: { distance: 6, radius: 5 },
    modeB: { distance: 20, radius: 3 },
  },
  md: {
    modeA: { distance: 11, radius: 10 },
    modeB: { distance: 25, radius: 4 },
  },
  lg: {
    modeA: { distance: 22, radius: 20 },
    modeB: { distance: 35, radius: 5 },
  },
} as const;

const ROTATION_SPEEDS = {
  modeA: 180, // degrees per second
  modeB: 900, // degrees per second
} as const;

const TIMING_CONFIG = {
  modeADuration: 1.5, // seconds
  modeBDuration: 1, // seconds
  totalCycleDuration: 2.5, // seconds (modeA + modeB)
} as const;

// Individual circle component
function LoadingCircle({
  position,
  distance,
  circleRadius,
  color,
}: {
  position: { x: number; y: number };
  distance: MotionValue<number>;
  circleRadius: MotionValue<number>;
  color: string;
}) {
  // Calculate position accounting for circle radius
  const x = useTransform([distance, circleRadius], (values: number[]) => {
    const d = values[0];
    const r = values[1];
    return position.x * d - r;
  });
  const y = useTransform([distance, circleRadius], (values: number[]) => {
    const d = values[0];
    const r = values[1];
    return position.y * d - r;
  });
  const width = useTransform(circleRadius, (r: number) => r * 2);
  const height = useTransform(circleRadius, (r: number) => r * 2);

  return (
    <Magnetic
      intensity={0.6}
      range={100}
      actionArea={{ type: "self" }}
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      <motion.div
        className="absolute"
        style={{
          x,
          y,
        }}
      >
        <motion.div
          className="rounded-full"
          style={{
            width,
            height,
            backgroundColor: color,
          }}
        />
      </motion.div>
    </Magnetic>
  );
}

export function LoadingTriangle({
  size = "md",
  color = "white",
}: LoadingTriangleProps) {
  const config = ANIMATION_CONFIG[size];

  // Animation state
  const modeProgress = useMotionValue(0);
  const rotationProgress = useMotionValue(0);
  const rotationRef = useRef(0);

  // Spring animations for smooth transitions
  const springModeProgress = useSpring(modeProgress, {
    stiffness: 100,
    damping: 20,
  });

  const springRotationProgress = useSpring(rotationProgress, {
    stiffness: 200,
    damping: 30,
  });

  // Transform values for smooth interpolation
  const distance = useTransform(
    springModeProgress,
    [0, 1],
    [config.modeA.distance, config.modeB.distance]
  ) as MotionValue<number>;

  const circleRadius = useTransform(
    springModeProgress,
    [0, 1],
    [config.modeA.radius, config.modeB.radius]
  ) as MotionValue<number>;

  // Rotation transform for the entire triangle
  const rotate = useTransform(
    springRotationProgress,
    (progress: number) => `${progress}deg`
  );

  // Circle positions for equilateral triangle
  const circlePositions = [
    { angle: 0, x: 0, y: -1 }, // Top
    { angle: 120, x: -0.866, y: 0.5 }, // Bottom left
    { angle: 240, x: 0.866, y: 0.5 }, // Bottom right
  ];

  // Animation loop
  useEffect(() => {
    let animationId: number;
    let lastTime: number;

    const animate = (currentTime: number) => {
      if (!lastTime) {
        lastTime = currentTime;
      }

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Mode transition - modeA: 1.25s, modeB: 0.75s (2-second total cycle)
      const elapsed = currentTime / 1000;
      const modeTime = elapsed % TIMING_CONFIG.totalCycleDuration;

      // Calculate mode value: 0-1.25s = modeA (0 to 1), 1.25-2s = modeB (1 to 0)
      let modeValue: number;
      if (modeTime < TIMING_CONFIG.modeADuration) {
        // Mode A: 0 to 1 over 1.25 seconds
        modeValue = modeTime / TIMING_CONFIG.modeADuration;
      } else {
        // Mode B: 1 to 0 over 0.75 seconds (remaining time)
        modeValue =
          1 -
          (modeTime - TIMING_CONFIG.modeADuration) /
            TIMING_CONFIG.modeBDuration;
      }

      modeProgress.set(modeValue);

      // Rotation (continuous) - apply speed based on current mode with smooth interpolation
      const currentSpeed =
        modeValue < 0.5 ? ROTATION_SPEEDS.modeA : ROTATION_SPEEDS.modeB;

      // Calculate rotation increment based on delta time to prevent accumulation
      const rotationIncrement = (deltaTime / 1000) * currentSpeed;

      // Update rotation using ref to prevent accumulation issues
      rotationRef.current += rotationIncrement;
      rotationProgress.set(rotationRef.current);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [modeProgress, rotationProgress]);

  return (
    <div
      style={{
        width: (config.modeB.distance + config.modeB.radius) * 2 + "px",
        height: (config.modeB.distance + config.modeB.radius) * 2 + "px",
      }}
    >
      <motion.div
        className="relative flex items-center justify-center p-4"
        style={{ rotate }}
      >
        {circlePositions.map((position, index) => (
          <LoadingCircle
            key={index}
            position={position}
            distance={distance}
            circleRadius={circleRadius}
            color={color}
          />
        ))}
      </motion.div>
    </div>
  );
}
