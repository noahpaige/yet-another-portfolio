"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "motion/react";
import { useMagneticContext } from "@/context/MagneticContext";

const SPRING_CONFIG = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  actionArea?: "self" | "parent" | "global";
  springOptions?: SpringOptions;
};

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = "self",
  springOptions = SPRING_CONFIG,
}: MagneticProps) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const magneticId = useRef(
    `magnetic-${Math.random().toString(36).substr(2, 9)}`
  );

  const {
    registerMagnetic,
    unregisterMagnetic,
    getMagneticOffset,
    setMagneticHovered,
  } = useMagneticContext();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  // Register with the magnetic context
  useEffect(() => {
    if (ref.current) {
      registerMagnetic(magneticId.current, ref, {
        intensity,
        range,
        actionArea,
      });
    }

    return () => {
      unregisterMagnetic(magneticId.current);
    };
  }, [registerMagnetic, unregisterMagnetic, intensity, range, actionArea]);

  // Update motion values based on magnetic offset
  useEffect(() => {
    if (isHovered) {
      const offset = getMagneticOffset(magneticId.current);
      x.set(offset.x);
      y.set(offset.y);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [isHovered, getMagneticOffset, x, y]);

  // Handle hover state changes
  useEffect(() => {
    setMagneticHovered(magneticId.current, isHovered);
  }, [isHovered, setMagneticHovered]);

  useEffect(() => {
    if (actionArea === "parent" && ref.current?.parentElement) {
      const parent = ref.current.parentElement;

      const handleParentEnter = () => setIsHovered(true);
      const handleParentLeave = () => setIsHovered(false);

      parent.addEventListener("mouseenter", handleParentEnter);
      parent.addEventListener("mouseleave", handleParentLeave);

      return () => {
        parent.removeEventListener("mouseenter", handleParentEnter);
        parent.removeEventListener("mouseleave", handleParentLeave);
      };
    } else if (actionArea === "global") {
      setIsHovered(true);
    }
  }, [actionArea]);

  const handleMouseEnter = () => {
    if (actionArea === "self") {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (actionArea === "self") {
      setIsHovered(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={actionArea === "self" ? handleMouseEnter : undefined}
      onMouseLeave={actionArea === "self" ? handleMouseLeave : undefined}
      style={{
        x: springX,
        y: springY,
      }}
    >
      {children}
    </motion.div>
  );
}
