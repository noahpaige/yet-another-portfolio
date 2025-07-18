"use client";

import React from "react";
import type { ArticleHeaderTextProps } from "./types";

// Generate fragment identifier from text
const generateFragmentId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Ensure unique fragment IDs
const ensureUniqueFragmentId = (
  text: string,
  existingIds: Set<string>
): string => {
  let id = generateFragmentId(text);
  let counter = 1;

  while (existingIds.has(id)) {
    id = `${generateFragmentId(text)}-${counter}`;
    counter++;
  }

  existingIds.add(id);
  return id;
};

export default function ArticleHeaderText({
  level,
  content,
  enableFragmentNavigation = true,
  id,
  className = "",
}: ArticleHeaderTextProps) {
  const [fragmentId, setFragmentId] = React.useState<string>("");
  const existingIdsRef = React.useRef<Set<string>>(new Set());

  // Generate fragment ID on mount
  React.useEffect(() => {
    if (enableFragmentNavigation && content) {
      const uniqueId = ensureUniqueFragmentId(content, existingIdsRef.current);
      setFragmentId(uniqueId);
    }
  }, [content, enableFragmentNavigation]);

  // Handle click to update URL fragment
  const handleClick = React.useCallback(() => {
    if (enableFragmentNavigation && fragmentId) {
      // Update URL fragment
      window.history.replaceState(null, "", `#${fragmentId}`);

      // Scroll to element
      const element = document.getElementById(fragmentId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [enableFragmentNavigation, fragmentId]);

  // Determine heading tag and styling
  const baseClasses = "font-bold text-zinc-100 transition-all duration-200";
  const levelClasses = {
    1: "text-4xl md:text-5xl mb-6",
    2: "text-2xl md:text-3xl mb-4",
    3: "text-xl md:text-2xl mb-3",
  };

  const interactiveClasses = enableFragmentNavigation
    ? "cursor-pointer hover:underline hover:text-zinc-200"
    : "";

  const combinedClasses =
    `${baseClasses} ${levelClasses[level]} ${interactiveClasses} ${className}`.trim();

  const commonProps = {
    id: fragmentId || id,
    className: combinedClasses,
    onClick: enableFragmentNavigation ? handleClick : undefined,
    role: enableFragmentNavigation ? ("button" as const) : undefined,
    tabIndex: enableFragmentNavigation ? 0 : undefined,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (enableFragmentNavigation && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        handleClick();
      }
    },
  };

  if (level === 1) {
    return <h1 {...commonProps}>{content}</h1>;
  } else if (level === 2) {
    return <h2 {...commonProps}>{content}</h2>;
  } else {
    return <h3 {...commonProps}>{content}</h3>;
  }
}
