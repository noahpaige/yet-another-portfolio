"use client";

import React from "react";
import type { ArticleFigureProps } from "./types";

export default function ArticleFigure({
  content,
  alignment = "center",
  caption,
  altText,
  wrapText = false,
  margin = 24,
  className = "",
}: ArticleFigureProps) {
  const baseClasses = "my-6";

  const alignmentClasses = {
    left: wrapText ? "float-left mr-6 mb-4" : "w-full",
    right: wrapText ? "float-right ml-6 mb-4" : "w-full",
    center: "w-full",
  };

  const responsiveClasses = "md:max-w-none"; // Always full width on mobile

  const combinedClasses =
    `${baseClasses} ${alignmentClasses[alignment]} ${responsiveClasses} ${className}`.trim();

  const figureStyle = {
    marginBottom: `${margin}px`,
  };

  const captionClasses = "text-sm text-zinc-400 mt-2 text-center";

  return (
    <figure className={combinedClasses} style={figureStyle}>
      <div className="relative">
        {content}
        {altText && <span className="sr-only">{altText}</span>}
      </div>
      {caption && <figcaption className={captionClasses}>{caption}</figcaption>}
    </figure>
  );
}
