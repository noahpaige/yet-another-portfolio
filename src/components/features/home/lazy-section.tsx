"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useInView } from "framer-motion";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = (
    <div className="h-full w-full flex items-center justify-center">
      Loading...
    </div>
  ),
  threshold = 0.1,
}) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: threshold });

  useEffect(() => {
    if (isInView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isInView, shouldLoad]);

  return (
    <div ref={ref} className="h-full w-full">
      {shouldLoad ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

export default LazySection;
