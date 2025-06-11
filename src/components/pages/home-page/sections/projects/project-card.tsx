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
      <MorphingDialogTrigger className="flex  flex-col overflow-hidden glass-layer rounded-xl">
        <MorphingDialogImage
          src={imageSrc}
          alt={imageAltText}
          className="h-48 w-full object-cover rounded-md"
        />
        <div className="flex grow flex-row items-end justify-between px-3 py-2">
          <div>
            <MorphingDialogTitle className="text-slate-100">
              {title}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-slate-300">
              TAGS GO HERE
            </MorphingDialogSubtitle>
          </div>
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          className="pointer-events-auto rounded-xl relative flex h-auto w-full flex-col overflow-hidden  glass-layer"
          style={{ width: "calc(min(90%, 1024px))", maxHeight: "90%" }}
        >
          <MorphingDialogImage
            src={imageSrc}
            alt={imageAltText}
            className="h-full w-full rounded-md"
          />
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl text-slate-100">
              {title}
            </MorphingDialogTitle>
            <MorphingDialogSubtitle className="text-slate-300">
              TAGS GO HERE TOO
            </MorphingDialogSubtitle>
            <MorphingDialogDescription
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}
              className="text-zinc-100 dark:text-zinc-50 pt-8"
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
