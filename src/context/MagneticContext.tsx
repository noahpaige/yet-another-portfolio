"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface MagneticConfig {
  intensity: number;
  range: number;
  actionArea: "self" | "parent" | "global";
}

interface MagneticContextType {
  mousePosition: MousePosition;
  registerMagnetic: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
    config: MagneticConfig
  ) => void;
  unregisterMagnetic: (id: string) => void;
  getMagneticOffset: (id: string) => { x: number; y: number };
  setMagneticHovered: (id: string, isHovered: boolean) => void;
}

const MagneticContext = createContext<MagneticContextType | null>(null);

export const useMagneticContext = () => {
  const context = useContext(MagneticContext);
  if (!context) {
    throw new Error(
      "useMagneticContext must be used within a MagneticProvider"
    );
  }
  return context;
};

export const MagneticProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const magneticRefs = useRef<
    Map<
      string,
      {
        ref: React.RefObject<HTMLDivElement | null>;
        config: MagneticConfig;
        isHovered: boolean;
        offset: { x: number; y: number };
      }
    >
  >(new Map());

  // Single global mouse move listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const registerMagnetic = useCallback(
    (
      id: string,
      ref: React.RefObject<HTMLDivElement | null>,
      config: MagneticConfig
    ) => {
      magneticRefs.current.set(id, {
        ref,
        config,
        isHovered: false,
        offset: { x: 0, y: 0 },
      });
    },
    []
  );

  const unregisterMagnetic = useCallback((id: string) => {
    magneticRefs.current.delete(id);
  }, []);

  const getMagneticOffset = useCallback(
    (id: string) => {
      const magnetic = magneticRefs.current.get(id);
      if (!magnetic || !magnetic.isHovered || !magnetic.ref.current) {
        return { x: 0, y: 0 };
      }

      const rect = magnetic.ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = mousePosition.x - centerX;
      const distanceY = mousePosition.y - centerY;

      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (absoluteDistance <= magnetic.config.range) {
        const scale = 1 - absoluteDistance / magnetic.config.range;
        const offsetX = distanceX * magnetic.config.intensity * scale;
        const offsetY = distanceY * magnetic.config.intensity * scale;
        return { x: offsetX, y: offsetY };
      }

      return { x: 0, y: 0 };
    },
    [mousePosition]
  );

  const setMagneticHovered = useCallback((id: string, isHovered: boolean) => {
    const magnetic = magneticRefs.current.get(id);
    if (magnetic) {
      magnetic.isHovered = isHovered;
    }
  }, []);

  const contextValue: MagneticContextType = {
    mousePosition,
    registerMagnetic,
    unregisterMagnetic,
    getMagneticOffset,
    setMagneticHovered,
  };

  return (
    <MagneticContext.Provider value={contextValue}>
      {children}
    </MagneticContext.Provider>
  );
};
