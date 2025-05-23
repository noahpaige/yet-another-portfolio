import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";

interface AnimatedBlobProps {
  blob: {
    path: string;
    scale: number;
    rotation: number;
    animDuration: string;
    depth: number;
  };
  gradientId: string;
  scrollYProgress: MotionValue<number>;
  index: number;
  numBlobs: number;
}

const AnimatedBlob: React.FC<AnimatedBlobProps> = ({
  blob,
  gradientId,
  scrollYProgress,
  index,
  numBlobs,
}) => {
  const combinedRotation = useTransform(
    scrollYProgress,
    [0, 1],
    [blob.rotation, blob.rotation + (360 / numBlobs) * index]
  );
  const y = useTransform(scrollYProgress, [0, 1], [80, 20]);

  return (
    <motion.g
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
        fill={`url(#${gradientId})`}
        stroke={`url(#${gradientId})`}
        className="transform-gpu p-2 animate-blob-spin"
        style={{ animationDuration: blob.animDuration }}
      />
    </motion.g>
  );
};

export default React.memo(AnimatedBlob);
