"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArticleCard } from "@/components/ui/article-card";
import { getFeaturedArticlesByType } from "@/generated/article-index";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";
import { useClampCSS } from "@/hooks/useClampCSS";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0 },
};

// Each grid item
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.95 },
};

export default function ProjectsSection() {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const router = useRouter();

  // Generate dynamic height based on screen height only
  const cardHeight = useClampCSS(
    60, // min height
    320, // max height
    500, // min screen height where scaling starts
    1400, // max screen height where scaling stops
    0, // min screen width (ignored)
    0 // max screen width (ignored)
  );

  // Generate responsive font size based on container height
  const titleFontSize = useClampCSS(
    24, // min font size (1rem)
    32, // max font size (2rem)
    96, // min screen height (24 * 4px = 96px)
    320, // max screen height (80 * 4px = 320px)
    375, // min screen width
    1280 // max screen width
  );

  useEffect(() => setShow(isInView), [isInView]);
  return (
    <div
      ref={ref}
      className="w-full h-full flex items-center justify-center px-4 sm:px-12"
    >
      <div className="h-full w-full flex flex-col items-center justify-center">
        <AnimatePresence>
          {show && (
            <motion.div
              key="projects-grid"
              className="grid auto-rows-auto grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4"
              style={{ width: "calc(min(100%, 1536px))" }}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {getFeaturedArticlesByType("project")
                .slice(0, 6)
                .map((project, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className={`row-span-1 ${
                      i === 0 || i === 3 || i === 4
                        ? "sm:col-span-2"
                        : "col-span-1"
                    }`}
                  >
                    <ArticleCard
                      article={project}
                      showReadTime={false}
                      showDesc={false}
                      height={cardHeight}
                      titleFontSize={titleFontSize}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="z-1 w-full flex pt-2 sm:pt-4 justify-end"
          style={{ width: "calc(min(100%, 1536px))" }}
          variants={itemVariants}
          initial="hidden"
          animate={show ? "show" : "hidden"}
          exit="exit"
          transition={{ delay: 0.4 }}
        >
          <MagneticButton onClick={() => router.push("/projects")}>
            <span className="whitespace-nowrap p-1 pr-2">More Projects</span>
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
}
