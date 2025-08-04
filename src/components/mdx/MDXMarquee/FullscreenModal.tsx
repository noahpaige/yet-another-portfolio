"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MarqueeImage as MarqueeImageType } from "./index";

interface FullscreenModalProps {
  isOpen: boolean;
  image: MarqueeImageType | null;
  onClose: () => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  image,
  onClose,
}) => {
  if (!isOpen || !image) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Fullscreen view of ${image.alt}`}
      >
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="rounded-lg"
            style={{
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 14rem)",
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={1920}
              height={1080}
              className="w-full h-full object-contain"
            />
          </div>
          {image.captionText && (
            <motion.p
              className="text-white text-center mt-4 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {image.captionText}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FullscreenModal;
