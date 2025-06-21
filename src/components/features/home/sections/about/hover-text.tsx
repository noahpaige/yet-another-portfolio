"use client";

import { useState } from "react";
import { ReactNode } from "react";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Magnetic } from "@/components/ui/magnetic";

interface Props {
  text: ReactNode; // replaces children
  cardContent?: ReactNode; // replaces caption
  imageSrc?: string;
  imageAlt?: string;
}

export default function HoverText({
  text,
  cardContent,
  imageSrc,
  imageAlt = "Image",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen} openDelay={200}>
      <HoverCardTrigger asChild>
        <div className="inline-block">
          <Magnetic
            intensity={0.2}
            range={200}
            actionArea="self"
            springOptions={{ stiffness: 500, damping: 50 }}
          >
            <span
              className="inline-block cursor-pointer hover:underline"
              onClick={handleClick}
            >
              {text}
            </span>
          </Magnetic>
        </div>
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
