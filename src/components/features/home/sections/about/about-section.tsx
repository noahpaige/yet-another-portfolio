"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import AnimatedAboutCard from "@/components/features/home/sections/about/animated-about-card";
import { CONTENT_BOUNDS } from "@/app/constants";
import { useClampCSS } from "@/hooks/useClampCSS";
import { blocks } from "@/components/features/home/sections/about/content-blocks";

export default function AboutSection() {
  const [show, setShow] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const gapSize = useClampCSS(
    16,
    64,
    CONTENT_BOUNDS.yMinPx,
    CONTENT_BOUNDS.yMaxPx,
    0,
    0
  );

  useEffect(() => {
    setShow(isInView);
  }, [isInView]);

  return (
    <div ref={ref} className="h-full flex items-center justify-center">
      <div
        className={`flex flex-col items-center justify-start px-6 max-w-[${CONTENT_BOUNDS.xMaxPx}px]`}
        style={{ gap: gapSize }}
      >
        {blocks.map((block, blockIndex) => {
          return (
            <div key={blockIndex} className="w-full">
              <AnimatedAboutCard
                show={show}
                header={block.header}
                body={block.body}
                headerMinPx={48}
                headerMaxPx={200}
                bodyMinPx={16}
                bodyMaxPx={64}
                delay={blockIndex * 200}
                bodyAnimDelay={200}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
