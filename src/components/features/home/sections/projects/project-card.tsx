"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Magnetic } from "@/components/ui/magnetic";

interface ProjectCardProps {
  title: string;
  imageSrc: string;
  imageAltText: string;
  id?: string;
}

export default function ProjectCard({
  title,
  imageSrc,
  imageAltText,
  id,
}: ProjectCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (id) {
      router.push(`/projects/${id}`);
    }
  };

  return (
    <Magnetic
      intensity={0.1}
      range={500}
      actionArea="self"
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      <div 
        className="flex w-full h-24 xs:h-32 sm:h-40 md:h-64 lg:h-80 flex-col overflow-hidden glass-layer-hoverable rounded-xl transition-[height] cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative h-full w-full overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAltText}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Simple gradient overlay */}
          <div 
            className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full rounded-b-md z-10"
            style={{
              background: 'linear-gradient(transparent, black)'
            }}
          />
          <div className="absolute bottom-0 left-0 w-full px-3 py-2 z-20">
            <h2 className="text-white text-base">{title}</h2>
            <p className="text-zinc-300 text-sm hidden sm:block">
              TAGS GO HERE
            </p>
          </div>
        </div>
      </div>
    </Magnetic>
  );
}
