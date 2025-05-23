"use client";

import React, { useEffect, useMemo } from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

type HSLColor = { h: number; s: number; l: number };

const interpolate = (a: number, b: number, factor: number) =>
  a + factor * (b - a);

const interpolateHSL = (
  color1: HSLColor,
  color2: HSLColor,
  hFactor: number,
  sFactor: number,
  lFactor: number
): HSLColor => {
  const normalizeHue = (hue: number) => (hue + 360) % 360;

  let h = interpolate(color1.h, color2.h, hFactor);
  h = normalizeHue(h);

  const s = interpolate(color1.s, color2.s, sFactor);
  const l = interpolate(color1.l, color2.l, lFactor);

  return {
    h: Math.round(h),
    s: Math.round(s),
    l: Math.round(l),
  };
};

const hslToString = (hsl: HSLColor) => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

const parseHSL = (str: string): HSLColor => {
  const [h, s, l] = str.match(/[\d.]+/g)!.map(Number);
  return { h, s, l };
};

function interpolateColor(
  colorA: { a: string; b: string },
  colorB: { a: string; b: string },
  factor: number,
  key: "a" | "b"
) {
  const c1 = parseHSL(colorA[key]);
  const c2 = parseHSL(colorB[key]);
  return hslToString(interpolateHSL(c1, c2, factor, factor, factor));
}

const paths = [
  "M25.7,-30.2C32.4,-25.1,36.2,-16.1,38.3,-6.4C40.3,3.2,40.6,13.4,36.8,22.3C32.9,31.3,25,39,15.5,42.2C6.1,45.4,-4.8,44.2,-13.5,39.8C-22.3,35.5,-29,28,-33.3,19.7C-37.6,11.3,-39.6,2,-38.7,-7.5C-37.8,-17,-34.1,-26.6,-27.2,-31.7C-20.3,-36.7,-10.1,-37.3,-0.3,-36.9C9.5,-36.6,19.1,-35.3,25.7,-30.2Z",
  "M22.4,-27.2C29.7,-20.7,36.6,-14.2,37.9,-6.7C39.1,0.7,34.7,9.1,29.7,16.4C24.6,23.8,18.9,30,11.9,32.5C4.9,35,-3.5,33.7,-11.7,31.1C-19.9,28.5,-28,24.7,-33.6,17.9C-39.2,11.2,-42.3,1.6,-40.4,-6.8C-38.5,-15.2,-31.6,-22.3,-24.1,-28.8C-16.5,-35.3,-8.2,-41.1,-0.3,-40.7C7.6,-40.3,15.2,-33.8,22.4,-27.2Z",
  "M23.1,-27.4C28.5,-23,30.4,-14.4,31,-6.1C31.6,2.1,31.1,9.8,27.6,16C24.1,22.1,17.7,26.5,10,30.9C2.3,35.2,-6.8,39.3,-14.7,37.6C-22.7,36,-29.5,28.5,-33.2,20.1C-36.9,11.8,-37.5,2.5,-36.1,-6.6C-34.8,-15.8,-31.7,-24.9,-25.3,-29.1C-19,-33.3,-9.5,-32.6,-0.3,-32.3C8.9,-31.9,17.7,-31.8,23.1,-27.4Z",
  "M26.6,-30.6C33.8,-25.6,38.7,-16.6,39.7,-7.5C40.8,1.7,38,11,33.4,19.6C28.8,28.2,22.4,36.1,13.9,39.9C5.4,43.7,-5.2,43.5,-14.3,39.9C-23.4,36.3,-31,29.3,-33.6,21.2C-36.2,13,-33.8,3.8,-31,-4.4C-28.3,-12.5,-25.3,-19.5,-20,-24.8C-14.8,-30.2,-7.4,-33.9,1.1,-35.2C9.7,-36.6,19.3,-35.6,26.6,-30.6Z",
];

const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 120, s: 60, l: 30 },
    { h: 220, s: 50, l: 5 },
  ],
  [
    { h: 221, s: 60, l: 30 },
    { h: 121, s: 50, l: 5 },
  ],
  [
    { h: 150, s: 60, l: 22 },
    { h: 150, s: 84, l: 5 },
  ],
  [
    { h: 50, s: 105, l: 22 },
    { h: 50, s: 84, l: 5 },
  ],
  [
    { h: 0, s: 105, l: 22 },
    { h: 0, s: 84, l: 5 },
  ],
];

type BlobData = {
  path: string;
  colors: { a: string; b: string }[];
  rotation: number;
  scale: number;
  animDuration: string;
  depth: number;
};

const generateBlobs = (): BlobData[] => {
  const n = 8;
  const shapeMin = 0.5;
  const shapeMax = 4;
  const numColors = 32;
  const colorsPerPair = Math.floor(numColors / (colorPairs.length - 1));

  console.log("generating blobs");

  const blobs: BlobData[] = [];

  for (let i = 0; i < n; i++) {
    const colorSteps: { a: string; b: string }[] = [];

    for (let j = 0; j < colorPairs.length - 1; j++) {
      const [curC1, curC2] = colorPairs[j];
      const [nextC1, nextC2] = colorPairs[j + 1];

      const colorA1 = i % 2 === 0 ? curC1 : curC2;
      const colorA2 = i % 2 === 0 ? nextC1 : nextC2;
      const colorB1 = i % 2 === 0 ? curC2 : curC1;
      const colorB2 = i % 2 === 0 ? nextC2 : nextC1;
      for (let k = 0; k < colorsPerPair; k++) {
        const mixFactor = k / colorsPerPair;
        colorSteps.push({
          a: hslToString(
            interpolateHSL(colorA1, colorA2, mixFactor, mixFactor, mixFactor)
          ),
          b: hslToString(
            interpolateHSL(colorB1, colorB2, mixFactor, mixFactor, mixFactor)
          ),
        });
      }
    }
    blobs.push({
      path: paths[Math.floor(Math.random() * paths.length)],
      colors: colorSteps,
      rotation: Math.floor(Math.random() * 360),
      scale: interpolate(shapeMax, shapeMin, i / n),
      animDuration: `${20 + Math.random() * 20}s`,
      depth: Math.random(),
    });
  }

  return blobs;
};

interface AnimatedBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  scrollYProgress,
}) => {
  const blobs = useMemo(() => generateBlobs(), []);

  const y = useTransform(scrollYProgress, [0, 1], [80, 20]);
  const colorIndex = useTransform(scrollYProgress, [0, 1], [0, blobs.length]);

  const roundedColorIndex = useTransform(colorIndex, (val) =>
    Math.floor(val % blobs[0].colors.length)
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      console.log("MotionValue changed:", latest);
    });

    return () => unsubscribe(); // cleanup on unmount or prop change
  }, [scrollYProgress]);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="fixed top-0 left-0 w-full h-full -z-20"
      style={{ filter: "blur(30px)" }}
    >
      <defs>
        {blobs.map((blob, index) => {
          return (
            <linearGradient
              key={`gradient-${index}`}
              id={`gradient-${index}`}
              x1="0"
              x2="1"
              y1="1"
              y2="0"
            >
              <motion.stop
                offset="0%"
                stopColor={blob.colors[roundedColorIndex.get()].a}
              />
              <motion.stop
                offset="100%"
                stopColor={blob.colors[roundedColorIndex.get()].b}
              />
            </linearGradient>
          );
        })}
      </defs>

      {blobs.map((blob, index) => {
        const combinedRotation = useTransform(
          scrollYProgress,
          [0, 1],
          [blob.rotation, blob.rotation + (360 / blobs.length) * index]
        );
        return (
          <motion.g
            key={`path-${index}`}
            style={{
              rotate: combinedRotation,
              scale: blob.scale,
              y,
              willChange: "transform",
            }}
            className="transform-gpu"
          >
            <path
              d={blob.path}
              fill={`url(#gradient-${index})`}
              stroke={`url(#gradient-${index})`}
              className="transform-gpu p-2 animate-blob-spin"
              style={{ animationDuration: blob.animDuration }}
            />
          </motion.g>
        );
      })}
    </svg>
  );
};

export default React.memo(AnimatedBackground);
