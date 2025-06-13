"use client";

import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogContainer,
} from "@/components/ui/morphing-dialog";
import { JSX } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Magnetic } from "@/components/ui/magnetic";
interface ProjectCardProps {
  title: string;
  imageSrc: string;
  imageAltText: string;
  content: JSX.Element;
}

export default function ProjectCard({
  title,
  imageSrc,
  imageAltText,
  content,
}: ProjectCardProps) {
  return (
    <MorphingDialog
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 22,
      }}
    >
      <Magnetic
        intensity={0.1}
        range={500}
        actionArea="self"
        springOptions={{ stiffness: 500, damping: 50 }}
      >
        <MorphingDialogTrigger className="flex w-full h-24 xs:h-32 sm:h-40 md:h-64 lg:h-80 flex-col overflow-hidden glass-layer-hoverable rounded-xl transition-[height]">
          <div className="relative h-full w-full overflow-hidden rounded-md">
            <MorphingDialogImage
              src={imageSrc}
              alt={imageAltText}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <ProgressiveBlur
              className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full rounded-b-md"
              blurIntensity={6}
            />
            <div className="absolute bottom-0 left-0 w-full px-3 py-2">
              <MorphingDialogTitle className="text-white text-base">
                {title}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="text-zinc-300 text-sm hidden sm:block">
                TAGS GO HERE
              </MorphingDialogSubtitle>
            </div>
          </div>
        </MorphingDialogTrigger>
      </Magnetic>
      <MorphingDialogContainer>
        <div className="w-full h-full p-4 ">
          <div
            className="w-full flex justify-center"
            style={{ height: "calc(100% - calc(var(--spacing) * 18))" }}
          >
            <MorphingDialogContent
              className="relative pointer-events-auto rounded-xl relative flex h-auto w-full max-h-full flex-col overflow-hidden  glass-layer"
              style={{ width: "calc(min(100%, 1024px))" }}
            >
              <div className="relative h-24 xs:h-32 sm:h-40 md:h-64 lg:h-80 w-full overflow-hidden rounded-md transition-[height]">
                <MorphingDialogImage
                  src={imageSrc}
                  alt={imageAltText}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-full rounded-b-md"
                  blurIntensity={6}
                />
                <div className="absolute bottom-0 left-0 w-full px-6 pb-4">
                  <MorphingDialogTitle className="text-white text-2xl">
                    {title}
                  </MorphingDialogTitle>
                  <MorphingDialogSubtitle className="text-zinc-300 text-base">
                    TAGS GO HERE TOO
                  </MorphingDialogSubtitle>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0 pt-4">
                <MorphingDialogDescription
                  disableLayoutAnimation
                  variants={{
                    initial: { opacity: 0, scale: 0.8, y: 100 },
                    animate: { opacity: 1, scale: 1, y: 0 },
                    exit: { opacity: 0, scale: 0.8, y: 100 },
                  }}
                  className="text-zinc-100 dark:text-zinc-50 flex flex-1 min-h-0"
                >
                  <ScrollArea className="h-full w-full overflow-auto">
                    <div className="pb-16">{content}</div>
                  </ScrollArea>
                </MorphingDialogDescription>
              </div>
              <div className="absolute top-0 right-0 z-10">
                <Magnetic
                  intensity={0.2}
                  range={100}
                  actionArea="self"
                  springOptions={{ stiffness: 500, damping: 50 }}
                >
                  <MorphingDialogClose className=" text-zinc-50/50 hover:cursor-pointer glass-layer-hoverable hover:text-zinc-50 transition-colors p-2" />
                </Magnetic>
              </div>
            </MorphingDialogContent>
          </div>
        </div>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
