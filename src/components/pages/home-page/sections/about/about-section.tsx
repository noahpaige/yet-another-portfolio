"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import AnimatedAboutCard from "@/components/pages/home-page/sections/about/animated-about-card";

const bblocks = [
  {
    header: "I AM",
    body: "a web developer with experience in game design and 3D graphics.",
  },
  {
    header: "I WORK",
    body: "on web and 3D displays for US government rocket launches at CACI.",
  },
  {
    header: "I ESCAPE",
    body: "to the surf and the snow!",
  },
];

const headingsContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.4,
    },
  },
};

const letterVariants = {
  hidden: {
    rotateX: -90,
    y: 300,
  },
  show: (i: number) => ({
    rotateX: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14,
      delay: Math.pow(0.2 * i, 1 / 2),
    },
  }),
  exit: {
    x: -100,
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

const wordSpacingVariants = {
  hidden: {
    x: -100,
  },
  show: (i: number) => ({
    x: 10,
    transition: {
      duration: 0.5,
      delay: 0.3 + Math.pow(0.2 * i, 1 / 2),
      ease: "easeInOut",
    },
  }),
};

const bodyVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 2 + i * 0.2 },
  }),
};

export default function AboutSection() {
  const [show, setShow] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    setShow(isInView);
  }, [isInView]);

  const blocks = [
    {
      heading: "I AM",
      lines: [
        "a web developer with experience",
        "in game design and 3D graphics.",
      ],
    },
    {
      heading: "I WORK",
      lines: [
        "on web and 3D displays for US",
        "government rocket launches at CACI.",
      ],
    },
    {
      heading: "I ESCAPE",
      lines: ["to the surf", "and the snow!"],
    },
  ];

  return (
    <div
      ref={ref}
      className="flex flex-col h-screen items-center justify-start px-6"
    >
      {bblocks.map((block, blockIndex) => {
        return (
          <div key={blockIndex} className="w-full">
            <AnimatedAboutCard
              show={show}
              header={block.header}
              body={block.body}
              headerMinPx={48}
              headerMaxPx={256}
              bodyMinPx={12}
              bodyMaxPx={48}
              delay={blockIndex * 200}
              bodyAnimDelay={500}
            />
          </div>
        );
      })}
    </div>
  );
}
