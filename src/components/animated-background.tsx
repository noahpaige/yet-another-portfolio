"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";
import { BlobData } from "@/app/types";
import { interp } from "@/lib/interp";
import { useHardwareCapability } from "@/context/HardwareCapabilityContext";

// Magic numbers extracted as constants for clarity and maintainability
const NUM_BLOBS = 12;
const RENDER_SIZE = 32;
const SPRING_DAMPING = 0.35;
const SPRING_STIFFNESS = 0.02;
const ROTATION_INTERP = 0.4;
const RESIZE_DEBOUNCE_DELAY_MS = 100;
const ROTATION_SPEED_MULTIPLIER = 60;
const ROTATION_EXPONENT = 0.3;
const CURY_INTERP = 0.8;
const DESIREDY_BASE = 0.8;
const DESIREDY_MULTIPLIER = 0.6;
const BLUR_AMOUNT_LOW = 1;
const BLUR_AMOUNT_MEDIUM = 2;
const BLUR_AMOUNT_HIGH = 4;
const FRAME_RATE_LOW = 20;
const FRAME_RATE_MEDIUM = 30;
const FRAME_RATE_HIGH = 60;

interface AnimatedBackgroundProps {
  scrollYProgress: MotionValue<number>;
  enableColorSwap?: boolean;
  colorPairs: [HSLColor, HSLColor][];
}

export type HSLColor = {
  h: number;
  s: number;
  l: number;
};

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

const interpolateHSL = (
  color1: HSLColor,
  color2: HSLColor,
  hFactor: number,
  sFactor: number,
  lFactor: number
): HSLColor => {
  const h = interpolateHueShortestPath(color1.h, color2.h, hFactor);
  const s = interp(color1.s, color2.s, sFactor, { type: "linear" });
  const l = interp(color1.l, color2.l, lFactor, { type: "linear" });
  return { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
};

const hslToString = (hsl: HSLColor) => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

const paths = [
  "M25.7,-30.2C32.4,-25.1,36.2,-16.1,38.3,-6.4C40.3,3.2,40.6,13.4,36.8,22.3C32.9,31.3,25,39,15.5,42.2C6.1,45.4,-4.8,44.2,-13.5,39.8C-22.3,35.5,-29,28,-33.3,19.7C-37.6,11.3,-39.6,2,-38.7,-7.5C-37.8,-17,-34.1,-26.6,-27.2,-31.7C-20.3,-36.7,-10.1,-37.3,-0.3,-36.9C9.5,-36.6,19.1,-35.3,25.7,-30.2Z",
  "M22.4,-27.2C29.7,-20.7,36.6,-14.2,37.9,-6.7C39.1,0.7,34.7,9.1,29.7,16.4C24.6,23.8,18.9,30,11.9,32.5C4.9,35,-3.5,33.7,-11.7,31.1C-19.9,28.5,-28,24.7,-33.6,17.9C-39.2,11.2,-42.3,1.6,-40.4,-6.8C-38.5,-15.2,-31.6,-22.3,-24.1,-28.8C-16.5,-35.3,-8.2,-41.1,-0.3,-40.7C7.6,-40.3,15.2,-33.8,22.4,-27.2Z",
  "M23.1,-27.4C28.5,-23,30.4,-14.4,31,-6.1C31.6,2.1,31.1,9.8,27.6,16C24.1,22.1,17.7,26.5,10,30.9C2.3,35.2,-6.8,39.3,-14.7,37.6C-22.7,36,-29.5,28.5,-33.2,20.1C-36.9,11.8,-37.5,2.5,-36.1,-6.6C-34.8,-15.8,-31.7,-24.9,-25.3,-29.1C-19,-33.3,-9.5,-32.6,-0.3,-32.3C8.9,-31.9,17.7,-31.8,23.1,-27.4Z",
];

const generateBlobs = (
  count: number,
  colorPairs: [HSLColor, HSLColor][]
): BlobData[] => {
  const blobs: BlobData[] = [];
  const numColors = 64;
  const colorsPerPair = Math.floor(numColors / (colorPairs.length - 1));
  for (let i = 0; i < count; i++) {
    const colorSteps: { a: string; b: string }[] = [];
    for (let j = 0; j < colorPairs.length - 1; j++) {
      const [c1, c2] = colorPairs[j];
      const [n1, n2] = colorPairs[j + 1];
      for (let k = 0; k < colorsPerPair; k++) {
        const mix = k / colorsPerPair;
        colorSteps.push({
          a: hslToString(interpolateHSL(c1, n1, mix, mix, mix)),
          b: hslToString(interpolateHSL(c2, n2, mix, mix, mix)),
        });
      }
    }
    const rawPath = paths[Math.floor(Math.random() * paths.length)];
    const path2D = new Path2D(rawPath);

    const speed = 0.1 * ((count - 1 - i) / count) * (1 + Math.random() * 0.9);
    blobs.push({
      path: path2D,
      rotation: {
        angle: Math.random() * 360,
        curSpeed: speed,
        baseSpeed: speed,
      },
      scale: 0.2 + (1 - i / (count - 1)) * 1.5,
      colors: colorSteps,
    });
  }
  return blobs;
};

const AnimatedBackground = React.memo<AnimatedBackgroundProps>(
  ({ scrollYProgress, enableColorSwap = false, colorPairs }) => {
    const { performanceTier, loading } = useHardwareCapability();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const blobs = useRef<BlobData[]>([]);
    const colorIndex = useRef(0);
    const prevScrollY = useRef<number | null>(null);
    const curY = useRef(0.5);
    const desiredY = useRef(0.8);
    const scrollDirection = useRef(1);
    const lastFrameTime = useRef(0);

    // Debounced resize handler
    const debouncedResize = useRef<NodeJS.Timeout | null>(null);
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
      }, RESIZE_DEBOUNCE_DELAY_MS);
    }, []);

    // Adjust quality based on device capabilities
    const getQualitySettings = () => {
      if (loading)
        return {
          blobCount: NUM_BLOBS,
          frameRate: FRAME_RATE_MEDIUM,
          blurAmount: BLUR_AMOUNT_MEDIUM,
        };

      switch (performanceTier) {
        case "low":
          return {
            blobCount: 6,
            frameRate: FRAME_RATE_LOW,
            blurAmount: BLUR_AMOUNT_LOW,
          };
        case "medium":
          return {
            blobCount: 9,
            frameRate: FRAME_RATE_MEDIUM,
            blurAmount: BLUR_AMOUNT_MEDIUM,
          };
        case "high":
          return {
            blobCount: NUM_BLOBS,
            frameRate: FRAME_RATE_HIGH,
            blurAmount: BLUR_AMOUNT_HIGH,
          };
        default:
          return {
            blobCount: NUM_BLOBS,
            frameRate: FRAME_RATE_MEDIUM,
            blurAmount: BLUR_AMOUNT_MEDIUM,
          };
      }
    };

    const qualitySettings = getQualitySettings();
    const targetFrameRate = qualitySettings.frameRate;
    const frameInterval = 1000 / targetFrameRate;
    // For 60fps, no multiplier needed since we're already at native frame rate
    const frameRateMultiplier =
      targetFrameRate === 60 ? 1 : 60 / targetFrameRate;

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
      if (enableColorSwap) {
        const i = Math.floor(latest * (blobs.current[0].colors.length - 1));
        colorIndex.current = i;
      } else {
        colorIndex.current = 0;
      }

      if (prevScrollY.current === null) prevScrollY.current = latest;
      scrollDirection.current = latest > prevScrollY.current ? -1 : 1;

      blobs.current.forEach((blob, index) => {
        blob.rotation.curSpeed =
          ROTATION_SPEED_MULTIPLIER *
          Math.pow(
            (blobs.current.length - index) / blobs.current.length,
            ROTATION_EXPONENT
          ) *
          blob.rotation.baseSpeed *
          scrollDirection.current;
      });
      prevScrollY.current = latest;

      desiredY.current = DESIREDY_BASE - latest * DESIREDY_MULTIPLIER;
    });

    useEffect(() => {
      // In useEffect
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d")!;

      // Set your target resolution for offscreen rendering
      const renderWidth = RENDER_SIZE;
      const renderHeight = RENDER_SIZE;

      offscreen.width = renderWidth;
      offscreen.height = renderHeight;

      window.addEventListener("resize", handleResize);
      handleResize(); // Initial setup

      const render = (currentTime: number) => {
        // Frame rate limiting - only render if enough time has passed
        if (currentTime - lastFrameTime.current < frameInterval) {
          requestAnimationFrame(render);
          return;
        }

        lastFrameTime.current = currentTime;

        // Clear and draw on offscreen canvas
        offCtx.clearRect(0, 0, renderWidth, renderHeight);
        offCtx.save();

        curY.current = interp(curY.current, desiredY.current, CURY_INTERP, {
          type: "spring",
          stiffness: SPRING_STIFFNESS,
          damping: SPRING_DAMPING,
        });

        offCtx.translate(0, renderHeight * curY.current);
        offCtx.filter = `blur(${qualitySettings.blurAmount}px)`;

        for (const blob of blobs.current) {
          blob.rotation.curSpeed = interp(
            blob.rotation.curSpeed,
            blob.rotation.baseSpeed * scrollDirection.current,
            ROTATION_INTERP,
            { type: "ease-in" }
          );
          // Compensate for reduced frame rate by multiplying rotation speed
          blob.rotation.angle += blob.rotation.curSpeed * frameRateMultiplier;
          const rotation = blob.rotation.angle;
          offCtx.save();
          offCtx.translate(0, (curY.current * renderHeight) / 8);
          offCtx.rotate((rotation * Math.PI) / 180);
          offCtx.scale(blob.scale, blob.scale);

          const grad = offCtx.createLinearGradient(
            -(RENDER_SIZE / 2),
            RENDER_SIZE / 2,
            RENDER_SIZE / 8,
            -(RENDER_SIZE / 8)
          );
          grad.addColorStop(0, blob.colors[colorIndex.current].a);
          grad.addColorStop(1, blob.colors[colorIndex.current].b);
          offCtx.fillStyle = grad;
          offCtx.fill(blob.path);
          offCtx.restore();
        }

        offCtx.restore();

        // Scale up and draw on main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame(render);
      };

      render(0);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (debouncedResize.current) {
          clearTimeout(debouncedResize.current);
        }
      };
    }, [frameInterval, frameRateMultiplier, qualitySettings.blurAmount]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          pointerEvents: "none",
          // filter: "blur(40px)",
          background: blobs.current[0]?.colors[colorIndex.current]?.b || "#000",
        }}
      />
    );
  }
);

AnimatedBackground.displayName = "AnimatedBackground";

export default AnimatedBackground;
