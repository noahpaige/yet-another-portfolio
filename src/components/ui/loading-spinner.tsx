import React from "react";
import { motion, AnimatePresence } from "motion/react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  show?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
  show = true,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`flex items-center justify-center ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-white`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
