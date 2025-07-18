"use client";

import React, { useRef, useEffect } from "react";
import { useScroll } from "framer-motion";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import NoiseOverlay from "@/components/noise-overlay";
import { CONTENT_BOUNDS } from "@/app/constants";
import type { ProjectTemplateProps } from "./types";

interface ArticleTemplateConfig {
  banner: {
    image: string;
    imageAlt: string;
    aspectRatio?: number; // Default: 16:9
    maxHeight?: number; // Default: 400px
    overlayOpacity?: number; // Default: 0.3
  };
  content: {
    maxWidth?: number; // Default: CONTENT_BOUNDS.xMaxPx
    enableStickyNav?: boolean; // Default: true
    stickyNavOffset?: number; // Default: 80px
  };
  figures: {
    defaultMargin?: number; // Default: 24px
    captionStyle?: "below" | "alt-only"; // Default: 'below'
    lazyLoading?: boolean; // Default: true
  };
  typography: {
    baseFontSize?: number; // Default: 16px
    lineHeight?: number; // Default: 1.6
    headingScale?: number; // Default: 1.25
  };
}

interface ArticleTemplateProps extends ProjectTemplateProps {
  config?: Partial<ArticleTemplateConfig> & {
    image?: string;
    imageAltText?: string;
    timestamp?: string;
  };
}

const DEFAULT_CONFIG: ArticleTemplateConfig = {
  banner: {
    image: "",
    imageAlt: "",
    aspectRatio: 16 / 9,
    maxHeight: 400,
    overlayOpacity: 0.3,
  },
  content: {
    maxWidth: CONTENT_BOUNDS.xMaxPx,
    enableStickyNav: true,
    stickyNavOffset: 80,
  },
  figures: {
    defaultMargin: 24,
    captionStyle: "below",
    lazyLoading: true,
  },
  typography: {
    baseFontSize: 16,
    lineHeight: 1.6,
    headingScale: 1.25,
  },
};

export default function ArticleTemplate({
  header,
  tags,
  colorPairs,
  children,
  config = {},
}: ArticleTemplateProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get banner image from project metadata if not provided in config
  const projectImage = config?.image || "";
  const projectImageAlt = config?.imageAltText || "";
  const projectTimestamp = config?.timestamp || "";

  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    banner: {
      ...DEFAULT_CONFIG.banner,
      ...config.banner,
      image: config.banner?.image || projectImage,
      imageAlt: config.banner?.imageAlt || projectImageAlt,
    },
  };

  // Override body overflow to enable scrolling on this page
  useEffect(() => {
    const originalOverflow = document.body.style.overflowY;
    document.body.style.overflowY = "auto";

    // Cleanup: restore original overflow when component unmounts
    return () => {
      document.body.style.overflowY = originalOverflow;
    };
  }, []);

  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  });

  // Calculate banner height based on aspect ratio and max height
  const [bannerHeight, setBannerHeight] = React.useState(
    mergedConfig.banner.maxHeight!
  );

  useEffect(() => {
    const calculateHeight = () => {
      const height = Math.min(
        window.innerWidth / mergedConfig.banner.aspectRatio!,
        mergedConfig.banner.maxHeight!
      );
      setBannerHeight(height);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, [mergedConfig.banner.aspectRatio, mergedConfig.banner.maxHeight]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div>
      <ClientOnly>
        <div className="sticky inset-0">
          <AnimatedBackground
            scrollYProgress={scrollYProgress}
            colorPairs={colorPairs}
          />
          <NoiseOverlay
            opacity={0.04}
            resolution={1}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </ClientOnly>

      <div
        ref={scrollContainerRef}
        className="min-h-screen bg-black overflow-x-hidden"
      >
        {/* Banner Section */}
        {mergedConfig.banner.image && (
          <div
            className="relative w-full"
            style={{ height: `${bannerHeight}px` }}
          >
            <img
              src={mergedConfig.banner.image}
              alt={mergedConfig.banner.imageAlt}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: mergedConfig.banner.overlayOpacity }}
            />
            {/* Banner Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-zinc-100">
                {header}
              </h1>
              {projectTimestamp && (
                <div className="text-lg text-zinc-300 mb-4">
                  {formatTimestamp(projectTimestamp)}
                </div>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-zinc-800/50 text-zinc-300 rounded-full text-sm backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          className="container mx-auto px-4 py-12 relative z-10"
          style={{ maxWidth: mergedConfig.content.maxWidth }}
        >
          <div className="prose prose-invert max-w-none">
            {/* Typography styles based on config */}
            <style jsx>{`
              .prose {
                font-size: ${mergedConfig.typography.baseFontSize!}px;
                line-height: ${mergedConfig.typography.lineHeight!};
              }
              .prose h1 {
                font-size: ${mergedConfig.typography.baseFontSize! *
                Math.pow(mergedConfig.typography.headingScale!, 2)}px;
              }
              .prose h2 {
                font-size: ${mergedConfig.typography.baseFontSize! *
                mergedConfig.typography.headingScale!}px;
              }
              .prose h3 {
                font-size: ${mergedConfig.typography.baseFontSize! *
                Math.pow(mergedConfig.typography.headingScale!, 0.5)}px;
              }
            `}</style>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
