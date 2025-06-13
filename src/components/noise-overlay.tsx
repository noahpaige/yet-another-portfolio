"use client";

import React, { useEffect, useRef } from "react";

interface NoiseOverlayProps {
  opacity?: number;
  resolution?: number;
}

const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
  opacity = 0.05,
  resolution = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const drawStaticNoise = () => {
      const width = window.innerWidth * resolution;
      const height = window.innerHeight * resolution;

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
    window.addEventListener("resize", drawStaticNoise);
    return () => window.removeEventListener("resize", drawStaticNoise);
  }, [resolution]);

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
        opacity,
        imageRendering: "pixelated",
      }}
    />
  );
};

export default NoiseOverlay;
