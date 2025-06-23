"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { ProjectCard } from "@/components/ui/project-card";
import { projects } from "@/generated/project-index";
import { motion, AnimatePresence } from "motion/react";

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

  useEffect(() => setShow(isInView), [isInView]);

  return (
    <div className="h-full w-full flex items-center justify-center" ref={ref}>
      <AnimatePresence>
        {show && (
          <motion.div
            key="projects-grid"
            className="grid auto-rows-auto grid-cols-1 sm:grid-cols-3 gap-3 p-6"
            style={{ width: "calc(min(100%, 1536px))" }}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {projects.map((project, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className={`row-span-1 ${
                  i === 0 || i === 3 || i === 4 ? "sm:col-span-2" : "col-span-1"
                }`}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
