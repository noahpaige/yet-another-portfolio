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

export type ActionArea =
  | { type: "self" }
  | { type: "parent" }
  | { type: "global" }
  | { type: "element"; element: HTMLElement }
  | { type: "ref"; ref: React.RefObject<HTMLElement> };

export type MagneticProps = {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  actionArea?: ActionArea;
  springOptions?: SpringOptions;
  className?: string;
};

function useActionAreaListeners(
  actionArea: ActionArea,
  setIsHovered: (hovered: boolean) => void,
  ref: React.RefObject<HTMLDivElement>
) {
  useEffect(() => {
    let target: HTMLElement | null = null;
    if (!actionArea || actionArea.type === "self") {
      target = ref.current;
    } else if (actionArea.type === "parent") {
      target = ref.current?.parentElement ?? null;
    } else if (actionArea.type === "element") {
      target = actionArea.element;
    } else if (actionArea.type === "ref") {
      target = actionArea.ref.current;
    } else if (actionArea.type === "global") {
      setIsHovered(true);
      return;
    }

    if (!target) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[Magnetic] actionArea target not found.", actionArea);
      }
      return;
    }

    const handleEnter = () => setIsHovered(true);
    const handleLeave = () => setIsHovered(false);
    target.addEventListener("mouseenter", handleEnter);
    target.addEventListener("mouseleave", handleLeave);

    return () => {
      target?.removeEventListener("mouseenter", handleEnter);
      target?.removeEventListener("mouseleave", handleLeave);
    };
  }, [actionArea, setIsHovered, ref]);
}

export function Magnetic({
  children,
  intensity = 0.6,
  range = 100,
  actionArea = { type: "self" },
  springOptions = SPRING_CONFIG,
  className,
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
      // Only pass the string type for actionArea to registerMagnetic
      const actionAreaType = !actionArea
        ? "self"
        : actionArea.type === "element" || actionArea.type === "ref"
          ? "self"
          : actionArea.type;
      registerMagnetic(
        magneticId.current,
        ref as React.RefObject<HTMLDivElement>,
        {
          intensity,
          range,
          actionArea: actionAreaType,
        }
      );
    }

    return () => {
      unregisterMagnetic(magneticId.current);
    };
  }, [registerMagnetic, unregisterMagnetic, intensity, range, actionArea]);

  // Update motion values based on magnetic offset
  // IMPORTANT: Set hover state in context BEFORE calculating offset
  useEffect(() => {
    // Update context hover state first
    setMagneticHovered(magneticId.current, isHovered);

    // Then calculate and apply offset
    if (isHovered) {
      const offset = getMagneticOffset(magneticId.current);
      x.set(offset.x);
      y.set(offset.y);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [isHovered, getMagneticOffset, setMagneticHovered, x, y]);

  useActionAreaListeners(
    actionArea,
    setIsHovered,
    ref as React.RefObject<HTMLDivElement>
  );

  const handleMouseEnter = () => {
    if (!actionArea || actionArea.type === "self") {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!actionArea || actionArea.type === "self") {
      setIsHovered(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={
        !actionArea || actionArea.type === "self" ? handleMouseEnter : undefined
      }
      onMouseLeave={
        !actionArea || actionArea.type === "self" ? handleMouseLeave : undefined
      }
      style={{
        x: springX,
        y: springY,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
