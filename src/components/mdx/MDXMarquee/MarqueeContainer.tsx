"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";
import MarqueeImage from "./MarqueeImage";
import { MarqueeImage as MarqueeImageType } from "./index";

interface MarqueeContainerProps {
  images: MarqueeImageType[];
  gap: number;
  height: number;
  className: string;
  totalWidth: number;
  scrollOffset: number;
  isDragging: boolean;
  visibleImages: Set<string>;
  loadedImages: Set<string>;
  containerRef: React.RefObject<HTMLDivElement>;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onImageClick: (image: MarqueeImageType) => void;
  onImageLoad: (imageSrc: string) => void;
}

const MarqueeContainer: React.FC<MarqueeContainerProps> = ({
  images,
  gap,
  height,
  className,
  totalWidth,
  scrollOffset,
  isDragging,
  visibleImages,
  loadedImages,
  containerRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onImageClick,
  onImageLoad,
}) => {
  const renderImage = useCallback(
    (image: MarqueeImageType, index: number) => {
      const isVisible = visibleImages.has(image.src);
      const isLoaded = loadedImages.has(image.src);

      return (
        <MarqueeImage
          key={`${image.src}-${index}`}
          image={image}
          index={index}
          gap={gap}
          height={height}
          isVisible={isVisible}
          isLoaded={isLoaded}
          onImageLoad={() => onImageLoad(image.src)}
          onClick={() => onImageClick(image)}
        />
      );
    },
    [visibleImages, loadedImages, gap, height, onImageClick]
  );

  return (
    <motion.div
      className={`my-10 ${className}`}
      style={{ height: `${height}px` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <motion.div
        ref={containerRef}
        className="flex items-center"
        style={{ width: `${totalWidth * 2}px` }}
        animate={{ x: -(scrollOffset % totalWidth) }}
        transition={{
          type: "tween",
          ease: "linear",
          duration: isDragging ? 0 : 0.1,
        }}
      >
        {images.map((image, index) => renderImage(image, index))}
      </motion.div>
    </motion.div>
  );
};

export default MarqueeContainer;
