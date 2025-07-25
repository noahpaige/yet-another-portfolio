"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArticleCard } from "@/components/ui/article-card";
import { getFeaturedArticlesByType } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
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

// Each list item
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.95 },
};

export default function BlogSection() {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const router = useRouter();

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
              key="blogs-list"
              className="flex flex-col gap-4 w-full max-w-xl"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {getFeaturedArticlesByType("blog")
                .slice(0, 3)
                .map((blog, i) => {
                  const mdxContent = getArticleMDXContent(blog.id);
                  return (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="w-full"
                    >
                      <ArticleCard
                        article={blog}
                        showReadTime="show"
                        showDesc="show"
                        showTags="hide"
                        height={"fit"}
                        titleFontSize={titleFontSize}
                        mdxContent={mdxContent}
                      />
                    </motion.div>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="z-1 w-full flex pt-2 sm:pt-4 max-w-xl justify-end"
          style={{ width: "calc(min(100%, 1536px))" }}
          variants={itemVariants}
          initial="hidden"
          animate={show ? "show" : "hidden"}
          exit="exit"
          transition={{ delay: 0.4 }}
        >
          <MagneticButton onClick={() => router.push("/blog")}>
            <span className="whitespace-nowrap p-1 pr-2">More Blogs</span>
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
}
