"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Magnetic } from "@/components/ui/magnetic";
import { Article } from "@/generated/article-index";
import { type MDXContent } from "@/generated/article-mdx-index";

interface ArticleCardProps {
  article: Article;
  showTags?: "show" | "hide" | "auto";
  showReadTime?: "show" | "hide" | "auto";
  showDesc?: "show" | "hide" | "auto";
  mdxContent?: MDXContent | null;
  customPath?: string; // Allow custom routing override
  height?: string | "auto" | "fit"; // Updated height prop
  titleFontSize?: string | "auto"; // New titleFontSize prop
}

export const ArticleCard = React.memo(
  ({
    article,
    showTags = "auto",
    showReadTime = "auto",
    showDesc = "auto",
    mdxContent,
    customPath,
    height = "auto", // Default to auto
    titleFontSize = "auto", // Default to auto
  }: ArticleCardProps) => {
    // Helper function to safely get metadata values
    const getMetadataValue = (
      key: string,
      type: "string" | "number"
    ): string | number | null => {
      if (!mdxContent?.metadata) return null;
      const value = mdxContent.metadata[key];
      if (type === "string" && typeof value === "string") return value;
      if (type === "number" && typeof value === "number") return value;
      return null;
    };

    // Helper function to get visibility classes based on mode
    const getVisibilityClasses = (mode: "show" | "hide" | "auto"): string => {
      switch (mode) {
        case "show":
          return "flex"; // Always show
        case "hide":
          return "hidden"; // Always hide
        case "auto":
          return "flex"; // Always show with fluid typography (no breakpoints needed)
        default:
          return "flex";
      }
    };

    const readTime = getMetadataValue("readTime", "number");
    const description = getMetadataValue("description", "string");
    // Create a ref for the Link element
    const linkRef = useRef<HTMLAnchorElement>(null);
    // State for image error handling
    const [imageError, setImageError] = useState(false);

    // Determine the correct route based on article type or custom path
    const getArticlePath = (article: Article): string => {
      if (customPath) return customPath;

      switch (article.type) {
        case "project":
          return `/projects/${article.id}`;
        case "blog":
          return `/blog/${article.id}`;
        default:
          return `/projects/${article.id}`; // fallback
      }
    };

    // Simple boolean check for image display
    const hasImage = !!article.image;

    // Handle height styling
    const getHeightStyle = () => {
      if (height === "auto") {
        return {
          className: "h-48", // Single height that scales with fluid typography
        };
      } else if (height === "fit") {
        return {
          className: "h-fit", // Fit content height
        };
      } else {
        return {
          style: { height: height as string },
        };
      }
    };

    // Handle title font size styling
    const getTitleFontSizeStyle = () => {
      if (titleFontSize === "auto") {
        return {
          className: "text-3xl", // Single size that scales with fluid typography
        };
      } else {
        return {
          style: { fontSize: titleFontSize as string },
        };
      }
    };

    const heightStyle = getHeightStyle();
    const titleFontSizeStyle = getTitleFontSizeStyle();

    return (
      <Magnetic
        intensity={0.1}
        actionArea={{ type: "self" }}
        range={400}
        springOptions={{ stiffness: 500, damping: 50 }}
      >
        {/* Attach the ref to the Link */}
        <Link href={getArticlePath(article)} ref={linkRef}>
          <div className="group relative overflow-hidden rounded-xl glass-layer-hoverable transition-all duration-300 p-1.5">
            {height === "fit" ? (
              // Fit layout: Image on top, content below
              <div className="relative rounded-lg overflow-hidden">
                {/* Article Image - Only render if image exists */}
                {hasImage && (
                  <div className="relative w-full h-48 rounded-t-lg">
                    {!imageError ? (
                      <Image
                        src={article.image!}
                        alt={article.imageAltText || ""}
                        fill
                        className="object-cover rounded-t-lg"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full items-center justify-center bg-gray-800 text-slate-400 text-sm rounded-t-lg text-center flex">
                        {article.imageAltText || "Article image"}
                      </div>
                    )}
                  </div>
                )}
                {/* Content area - fits content height */}
                <div className="p-4">
                  <Magnetic
                    intensity={0.1}
                    range={1000}
                    actionArea={{
                      type: "ref",
                      ref: linkRef as React.RefObject<HTMLElement>,
                    }}
                    springOptions={{ stiffness: 300, damping: 30 }}
                  >
                    <h3
                      className={`font-space-mono font-bold text-zinc-100 transition-colors ${
                        titleFontSizeStyle.className || ""
                      }`}
                      style={titleFontSizeStyle.style}
                    >
                      {article.title}
                    </h3>
                  </Magnetic>

                  {/* Details Section */}
                  {((showReadTime !== "hide" && readTime) ||
                    (showDesc !== "hide" && description)) &&
                    mdxContent && (
                      <div className="mt-3 space-y-2">
                        {/* Read Time */}
                        {showReadTime !== "hide" && readTime && (
                          <Magnetic
                            intensity={0.05}
                            range={1000}
                            actionArea={{
                              type: "ref",
                              ref: linkRef as React.RefObject<HTMLElement>,
                            }}
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {readTime} min read
                            </div>
                          </Magnetic>
                        )}

                        {/* Description Preview */}
                        {showDesc !== "hide" && description && (
                          <Magnetic
                            intensity={0.05}
                            range={1000}
                            actionArea={{
                              type: "ref",
                              ref: linkRef as React.RefObject<HTMLElement>,
                            }}
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                            <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">
                              {description}
                            </p>
                          </Magnetic>
                        )}
                      </div>
                    )}
                  {/* Tags */}
                  <div
                    className={`${getVisibilityClasses(showTags)} flex-wrap gap-2 mt-1`}
                  >
                    {article.tags?.slice(0, 3).map((tag, index) => (
                      <Magnetic
                        key={tag}
                        intensity={0.05}
                        range={1000}
                        actionArea={{
                          type: "ref",
                          ref: linkRef as React.RefObject<HTMLElement>,
                        }}
                        springOptions={{ stiffness: 300, damping: 30 }}
                      >
                        <span
                          className="px-2 py-1 text-zinc-300 text-xs rounded-full glass-layer"
                          style={{
                            animationDelay: `${index * 200}ms`,
                            animationDuration: "2s",
                          }}
                        >
                          {tag}
                        </span>
                      </Magnetic>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Original overlay layout for auto/custom heights
              <div
                className={`relative rounded-lg overflow-hidden ${
                  heightStyle.className || ""
                }`}
                style={heightStyle.style}
              >
                {/* Use the Link as the action area for inner Magnetics */}
                <Magnetic
                  intensity={0.2}
                  range={1000}
                  actionArea={{
                    type: "ref",
                    ref: linkRef as React.RefObject<HTMLElement>,
                  }}
                  springOptions={{ stiffness: 300, damping: 30 }}
                >
                  <div
                    className={`w-full scale-115 ${
                      heightStyle.className || ""
                    }`}
                    style={heightStyle.style}
                  >
                    {/* Article Image - Only render if image exists */}
                    {hasImage && (
                      <div
                        className={`relative w-full rounded-lg ${
                          heightStyle.className || ""
                        }`}
                        style={heightStyle.style}
                      >
                        {!imageError ? (
                          <Image
                            src={article.image!}
                            alt={article.imageAltText || ""}
                            fill
                            className="object-cover rounded-lg"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div
                            className={`w-full h-full items-center justify-center bg-gray-800 text-slate-400 text-sm rounded-lg text-center flex ${
                              heightStyle.className || ""
                            }`}
                            style={heightStyle.style}
                          >
                            {article.imageAltText || "Article image"}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Gradient overlay - only show if image exists */}
                    {hasImage && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    )}
                  </div>
                </Magnetic>
                <div className="p-4 absolute bottom-0 left-0">
                  <Magnetic
                    intensity={0.1}
                    range={1000}
                    actionArea={{
                      type: "ref",
                      ref: linkRef as React.RefObject<HTMLElement>,
                    }}
                    springOptions={{ stiffness: 300, damping: 30 }}
                  >
                    <h3
                      className={`font-space-mono font-bold text-zinc-100 transition-colors ${
                        titleFontSizeStyle.className || ""
                      }`}
                      style={titleFontSizeStyle.style}
                    >
                      {article.title}
                    </h3>
                  </Magnetic>

                  {/* Details Section */}
                  {((showReadTime !== "hide" && readTime) ||
                    (showDesc !== "hide" && description)) &&
                    mdxContent && (
                      <div className="mt-3 space-y-2">
                        {/* Read Time */}
                        {showReadTime !== "hide" && readTime && (
                          <Magnetic
                            intensity={0.05}
                            range={1000}
                            actionArea={{
                              type: "ref",
                              ref: linkRef as React.RefObject<HTMLElement>,
                            }}
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                            <div className="flex items-center gap-1 text-zinc-400 text-xs">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {readTime} min read
                            </div>
                          </Magnetic>
                        )}

                        {/* Description Preview */}
                        {showDesc !== "hide" && description && (
                          <Magnetic
                            intensity={0.05}
                            range={1000}
                            actionArea={{
                              type: "ref",
                              ref: linkRef as React.RefObject<HTMLElement>,
                            }}
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                            <p className="text-zinc-300 text-xs line-clamp-2 leading-relaxed">
                              {description}
                            </p>
                          </Magnetic>
                        )}
                      </div>
                    )}
                  {/* Tags */}
                  <div
                    className={`${getVisibilityClasses(showTags)} flex-wrap gap-2 mt-1`}
                  >
                    {article.tags?.slice(0, 3).map((tag, index) => (
                      <Magnetic
                        key={tag}
                        intensity={0.05}
                        range={1000}
                        actionArea={{
                          type: "ref",
                          ref: linkRef as React.RefObject<HTMLElement>,
                        }}
                        springOptions={{ stiffness: 300, damping: 30 }}
                      >
                        <span
                          className="px-2 py-1 text-zinc-300 text-xs rounded-full glass-layer"
                          style={{
                            animationDelay: `${index * 200}ms`,
                            animationDuration: "2s",
                          }}
                        >
                          {tag}
                        </span>
                      </Magnetic>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
      </Magnetic>
    );
  }
);

ArticleCard.displayName = "ArticleCard";
