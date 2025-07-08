"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { ProjectCard } from "@/components/ui/project-card";
import { featuredProjects } from "@/generated/project-index";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowRight } from "lucide-react";

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
              {featuredProjects.slice().map((project, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className={`row-span-1 ${
                    i === 0 || i === 3 || i === 4
                      ? "sm:col-span-2"
                      : "col-span-1"
                  }`}
                >
                  <ProjectCard project={project} />
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
            <span className="whitespace-nowrap pr-1">More Projects</span>
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
}
