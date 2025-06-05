"use client";

import { useState } from "react";
import { ReactNode } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  text: ReactNode; // replaces children
  cardContent?: ReactNode; // replaces caption
  imageSrc?: string;
  imageAlt?: string;
}

const animVariants = {
  hover: {
    backgroundPosition: "0% center",
    scale: 1.1,
    margin: "0.7rem",
    transition: {
      backgroundPosition: {
        duration: 1.2,
        ease: "easeInOut",
      },
      scale: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  },
  rest: {
    backgroundPosition: "100% center",
    scale: 1,
    margin: "0",
  },
};

export default function HoverText({
  text,
  cardContent,
  imageSrc,
  imageAlt = "Image",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const handleClick = async () => {
    setIsOpen((prev) => !prev);
    await controls.start("hover");
    controls.start("rest");
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen} openDelay={200}>
      <HoverCardTrigger asChild>
        <motion.span
          className="inline-block cursor-pointer"
          variants={animVariants}
          initial="rest"
          animate={controls}
          whileHover="hover"
          onClick={handleClick}
        >
          {text}
        </motion.span>
      </HoverCardTrigger>

      {(imageSrc || cardContent) && (
        <HoverCardContent
          side="top"
          className="w-64 glass-hover-card text-white flex flex-col gap-2"
        >
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={imageAlt}
              className="h-full w-full rounded-md"
              width={500}
              height={500}
            />
          )}
          {cardContent && <div className="p-2">{cardContent}</div>}
        </HoverCardContent>
      )}
    </HoverCard>
  );
}
