"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useHardwareCapability } from "@/context/HardwareCapabilityContext";

interface NoiseOverlayProps {
  opacity?: number;
  resolution?: number;
}

const NoiseOverlay = React.memo<NoiseOverlayProps>(
  ({ opacity = 0.05, resolution = 1 }) => {
    const { performanceTier, loading } = useHardwareCapability();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Adjust quality based on device capabilities
    const getQualitySettings = () => {
      if (loading) return { resolution: 1, opacity: 1 };

      switch (performanceTier) {
        case "low":
          return { resolution: 0.75, opacity: 0.8 };
        case "medium":
          return { resolution: 1, opacity: 1 };
        case "high":
          return { resolution: 1, opacity: 1 };
        default:
          return { resolution: 1, opacity: 1 };
      }
    };

    const qualitySettings = getQualitySettings();
    const effectiveResolution = resolution * qualitySettings.resolution;
    const effectiveOpacity = opacity * qualitySettings.opacity;

    // Debounced resize handler
    const debouncedResize = useRef<NodeJS.Timeout | null>(null);
    const handleResize = useCallback(() => {
      if (debouncedResize.current) {
        clearTimeout(debouncedResize.current);
      }
      debouncedResize.current = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d")!;
          const width = window.innerWidth * effectiveResolution;
          const height = window.innerHeight * effectiveResolution;

          canvas.width = width;
          canvas.height = height;
          canvas.style.width = "100%";
          canvas.style.height = `${window.innerHeight}px`;

          // Redraw the noise pattern after resize
          const imageData = ctx.createImageData(width, height);
          const buffer = new Uint32Array(imageData.data.buffer);
          for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.random() < 0.5 ? 0xffffffff : 0xff000000;
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }, 100); // 100ms debounce delay
    }, [effectiveResolution]);

    // Log hardware detection and quality settings
    useEffect(() => {
      if (!loading) {
        console.table({
          "📺 NoiseOverlay - Hardware Detection": {
            performanceTier,
            resolution: qualitySettings.resolution,
            opacity: qualitySettings.opacity,
            effectiveResolution: effectiveResolution,
            effectiveOpacity: effectiveOpacity,
          },
        });
      }
    }, [
      performanceTier,
      loading,
      qualitySettings,
      effectiveResolution,
      effectiveOpacity,
    ]);

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const drawStaticNoise = () => {
        const width = window.innerWidth * effectiveResolution;
        const height = window.innerHeight * effectiveResolution;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = "100%";
        canvas.style.height = `${window.innerHeight}px`;

        const imageData = ctx.createImageData(width, height);
        const buffer = new Uint32Array(imageData.data.buffer);
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = Math.random() < 0.5 ? 0xffffffff : 0xff000000;
        }

        ctx.putImageData(imageData, 0, 0);
      };

      drawStaticNoise();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (debouncedResize.current) {
          clearTimeout(debouncedResize.current);
        }
      };
    }, [effectiveResolution]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: -1,
          pointerEvents: "none",
          opacity: effectiveOpacity,
          imageRendering: "pixelated",
        }}
      />
    );
  }
);

NoiseOverlay.displayName = "NoiseOverlay";

export default NoiseOverlay;
