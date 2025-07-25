"use client";

import React from "react";
import Image from "next/image";
import { Magnetic } from "@/components/ui/magnetic";
import { motion, AnimatePresence } from "framer-motion";

// Custom Image component for MDX
const MDXImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  captionText?: string;
}> = ({ src, alt, width = 800, height = 600, className = "", captionText }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const openFullscreen = () => {
    setIsFullscreen(true);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "unset";
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        closeFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isFullscreen]);

  return (
    <>
      <div className={`my-10 ${className} flex flex-col items-center`}>
        <Magnetic
          intensity={0.1}
          range={300}
          actionArea={{ type: "self" }}
          springOptions={{ stiffness: 250, damping: 20 }}
          className="cursor-pointer"
        >
          <div
            onClick={openFullscreen}
            role="button"
            tabIndex={0}
            aria-label={`Open ${alt} in fullscreen view`}
            onKeyDown={(e) => e.key === "Enter" && openFullscreen()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="rounded-lg shadow-lg"
            />
          </div>
        </Magnetic>
        {captionText && (
          <p className="text-sm text-zinc-400 text-center mt-2 px-10 italic">
            {captionText}
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={closeFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${alt}`}
          >
            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  maxWidth: "calc(100vw - 2rem)",
                  maxHeight: "calc(100vh - 14rem)",
                }}
              >
                <Image
                  src={src}
                  alt={alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                />
              </div>
              {captionText && (
                <motion.p
                  className="text-white text-center mt-4 text-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {captionText}
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MDXImage;
