"use client";

import React from "react";
import type { ArticleBodyTextProps } from "./types";

export default function ArticleBodyText({
  content,
  variant = "paragraph",
  className = "",
}: ArticleBodyTextProps) {
  const baseClasses = "text-zinc-100 leading-relaxed";

  const variantClasses = {
    paragraph: "mb-4",
    list: "mb-4 list-disc list-inside space-y-1",
    blockquote: "mb-4 pl-4 border-l-4 border-zinc-600 italic",
  };

  const combinedClasses =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  // Handle different content types
  if (typeof content === "string") {
    // Simple string content
    if (variant === "list") {
      // Split by newlines and create list items
      const items = content.split("\n").filter((item) => item.trim());
      return (
        <ul className={combinedClasses}>
          {items.map((item, index) => (
            <li key={index} className="text-zinc-100">
              {item.trim()}
            </li>
          ))}
        </ul>
      );
    } else if (variant === "blockquote") {
      return <blockquote className={combinedClasses}>{content}</blockquote>;
    } else {
      return <p className={combinedClasses}>{content}</p>;
    }
  } else {
    // React node content - render as-is
    if (variant === "list") {
      return <ul className={combinedClasses}>{content}</ul>;
    } else if (variant === "blockquote") {
      return <blockquote className={combinedClasses}>{content}</blockquote>;
    } else {
      return <div className={combinedClasses}>{content}</div>;
    }
  }
}
