"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { motion, AnimatePresence } from "motion/react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { MailIcon, Github, Linkedin, FileText } from "lucide-react";
import { useClampCSS } from "@/hooks/useClampCSS";

// Remove the fixed icon classes since we'll use dynamic sizing
// const iconClasses = "h-6 w-6 flex-shrink-0";

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

const contactButtons = [
  {
    name: "Email",
    href: "mailto:noah@noahpaige.com",
    hoverText: "email me",
    icon: MailIcon,
  },
  {
    name: "Github",
    href: "https://github.com/noahpaige",
    hoverText: "code with me",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/noah-paige/",
    hoverText: "grindset with me",
    icon: Linkedin,
  },
  {
    name: "Resume",
    href: "TODO",
    hoverText: "view my resume",
    icon: FileText,
  },
];

export const ContactSection = () => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  // Responsive text scaling - slower scaling for more gradual text size changes
  const h1FontSize = useClampCSS(44, 128, 320, 1200, 375, 2560);
  const pFontSize = useClampCSS(16, 32, 320, 1200, 375, 2560);

  // Responsive scaling for button text and icons
  const buttonTextFontSize = useClampCSS(16, 32, 320, 1200, 375, 2560);
  const iconSize = useClampCSS(20, 32, 320, 1200, 375, 2560);

  useEffect(() => setShow(isInView), [isInView]);

  return (
    <section
      className="flex h-screen items-center justify-center px-12"
      ref={ref}
    >
      <div className="flex flex-col gap-20 h-screen items-center justify-center ">
        <AnimatePresence>
          {show && (
            <motion.div
              key="contact-content"
              className="flex flex-col justify-start gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.h1
                className="font-bold z-10"
                style={{ fontSize: h1FontSize }}
                variants={itemVariants}
              >
                Get in touch!
              </motion.h1>
              <motion.div
                className="flex flex-col gap-1 pl-4"
                variants={itemVariants}
              >
                <p className="z-10" style={{ fontSize: pFontSize }}>
                  I&apos;m open to new opportunities.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="grid auto-rows-auto grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={show ? "show" : "hidden"}
          exit="exit"
          transition={{ delay: 0.2 }}
        >
          {contactButtons.map((button) => {
            const IconComponent = button.icon;
            return (
              <motion.div key={button.name} variants={itemVariants}>
                <MagneticButton
                  href={button.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-14"
                >
                  <IconComponent
                    className="flex-shrink-0"
                    style={{
                      width: iconSize,
                      height: iconSize,
                    }}
                  />
                  <span
                    className="whitespace-nowrap flex-1 text-left"
                    style={{ fontSize: buttonTextFontSize }}
                  >
                    {button.name}
                  </span>
                </MagneticButton>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
