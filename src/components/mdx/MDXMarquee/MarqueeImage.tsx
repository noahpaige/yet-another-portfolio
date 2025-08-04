"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MarqueeImage as MarqueeImageType } from "./index";

interface MarqueeImageProps {
  image: MarqueeImageType;
  gap: number;
  height: number;
  isVisible: boolean;
  isLoaded: boolean;
  onImageLoad: () => void;
  onClick: () => void;
}

const MarqueeImage: React.FC<MarqueeImageProps> = ({
  image,
  gap,
  height,
  isVisible,
  isLoaded,
  onImageLoad,
  onClick,
}) => {
  return (
    <div
      className="flex-shrink-0 relative"
      style={{ marginRight: `${gap}px` }}
      data-image-src={image.src}
    >
      <motion.div
        className="cursor-pointer"
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`Open ${image.alt} in fullscreen view`}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        <div className="relative">
          {/* Loading placeholder */}
          {!isLoaded && (
            <div
              className="rounded-lg shadow-lg bg-zinc-800 animate-pulse"
              style={{
                width: image.width || 300,
                height: `${height}px`,
              }}
            />
          )}

          {/* Actual image */}
          {isVisible && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width || 300}
                  height={image.height || 200}
                  className="rounded-lg shadow-lg object-cover"
                  style={{ height: `${height}px` }}
                  onLoad={onImageLoad}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
      {image.captionText && (
        <p className="text-sm text-zinc-400 text-center mt-2 italic">
          {image.captionText}
        </p>
      )}
    </div>
  );
};

export default MarqueeImage;
