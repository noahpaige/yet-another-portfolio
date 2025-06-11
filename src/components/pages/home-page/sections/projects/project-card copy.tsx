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

interface ProjectCardProps {
  show: boolean;
  title: string;
  imageSrc: string;
  imageAltText: string;
  content: JSX.Element;
}

export default function ProjectCard({
  show,
  title,
  imageSrc,
  imageAltText,
  content,
}: ProjectCardProps) {
  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      {show && (
        <MorphingDialogTrigger
          style={{ borderRadius: "12px" }}
          className="flex max-w-[270px] flex-col overflow-hidden glass-layer"
        >
          <MorphingDialogImage
            src={imageSrc}
            alt={imageAltText}
            className="w-full object-cover rounded-md"
          />
          <div className="flex grow flex-row items-end justify-between px-3 py-2">
            <div>
              <MorphingDialogTitle className="text-zinc-950 dark:text-zinc-50">
                {title}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
                TAGS GO HERE
              </MorphingDialogSubtitle>
            </div>
          </div>
        </MorphingDialogTrigger>
      )}
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: "24px",
          }}
          className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 glass-layer dark:border-zinc-50/10 dark:bg-zinc-900 sm:w-[500px]"
        >
          <MorphingDialogImage
            src={imageSrc}
            alt={imageAltText}
            className="h-full w-full rounded-md"
          />
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl text-zinc-950 dark:text-zinc-50">
              {title}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-zinc-700 dark:text-zinc-400">
              TAGS GO HERE TOO
            </MorphingDialogSubtitle>
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}
              className="text-zinc-100 dark:text-zinc-50"
            >
              {content}
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="text-zinc-50 hover:cursor-pointer hover:glass-layer" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
