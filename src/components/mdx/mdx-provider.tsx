import React from "react";
import { ArticleH1, ArticleH2, ArticleH3, ArticleH4 } from "./article-headings";
import MDXImage from "./mdx-image";

// Utility function to generate unique fragment IDs from heading text
const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
};

// Custom Callout component for MDX
const Callout: React.FC<{
  type?: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
}> = ({ type = "info", children }) => {
  const styles = {
    info: "bg-blue-900/20 border-blue-500/30 text-blue-200",
    warning: "bg-yellow-900/20 border-yellow-500/30 text-yellow-200",
    error: "bg-red-900/20 border-red-500/30 text-red-200",
    success: "bg-green-900/20 border-green-500/30 text-green-200",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    error: "❌",
    success: "✅",
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} my-6`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

// Custom CodeBlock component for MDX
const CodeBlock: React.FC<{
  children: React.ReactNode;
  language?: string;
  title?: string;
}> = ({ children, language = "text", title }) => {
  return (
    <div className="my-6">
      {title && (
        <div className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-t-lg border-b border-zinc-700 text-sm font-mono">
          {title}
        </div>
      )}
      <pre
        className={`bg-zinc-900 p-4 rounded-lg border border-zinc-700 overflow-x-auto ${
          title ? "rounded-t-none" : ""
        }`}
      >
        <code className={`language-${language} text-zinc-200`}>{children}</code>
      </pre>
    </div>
  );
};

// Custom Link component for MDX
const MDXLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className = "" }) => {
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      className={`text-zinc-200 hover:text-zinc-100 underline transition-colors duration-200 ${className}`}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
      {isExternal && <span className="ml-1">↗</span>}
    </a>
  );
};

// Custom Quote component for MDX
const Quote: React.FC<{
  children: React.ReactNode;
  author?: string;
  source?: string;
}> = ({ children, author, source }) => {
  return (
    <blockquote className="border-l-4 border-zinc-600 pl-6 my-6 italic text-zinc-300">
      <div className="text-lg">{children}</div>
      {(author || source) && (
        <footer className="text-sm text-zinc-400 mt-2">
          {author && <span className="font-semibold">— {author}</span>}
          {source && (
            <span className="ml-2">
              {author ? ", " : "— "}
              <cite>{source}</cite>
            </span>
          )}
        </footer>
      )}
    </blockquote>
  );
};

// Custom Divider component for MDX
const Divider: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <hr className={`border-zinc-700 my-10 ${className}`} />;
};

// Custom ImageGrid component for MDX
const ImageGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  // Count the number of Image components
  const imageCount = React.Children.count(children);

  // Responsive grid classes based on image count
  const getGridClasses = () => {
    switch (imageCount) {
      case 1:
        return "grid-cols-1 max-w-2xl mx-auto";
      case 2:
        return "grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto";
      default:
        return "grid-cols-1 max-w-2xl mx-auto";
    }
  };

  return (
    <div className={`my-6 ${className}`}>
      <div className={`grid ${getGridClasses()}`}>{children}</div>
    </div>
  );
};

// Custom YouTube Video component for MDX
const YouTubeVideo: React.FC<{
  videoId: string;
  title?: string;
  maxHeight?: number;
  className?: string;
  aspectRatio?: "16:9" | "4:3" | "21:9";
  horizontalAlign?: "left" | "center" | "right";
}> = ({
  videoId,
  title = "YouTube Video",
  maxHeight = 400,
  className = "",
  aspectRatio = "16:9",
  horizontalAlign = "center",
}) => {
  // Calculate aspect ratio
  const aspectRatioMultipliers = {
    "16:9": 16 / 9, // width = height * (16/9)
    "4:3": 4 / 3, // width = height * (4/3)
    "21:9": 21 / 9, // width = height * (21/9)
    "1920:1000": 1920 / 1000, // width = height * (1920/1000)
  };

  const aspectRatioValue = aspectRatioMultipliers[aspectRatio];

  // Determine alignment classes
  const alignmentClasses = {
    left: "flex justify-start",
    center: "flex justify-center",
    right: "flex justify-end",
  };

  return (
    <div className={`my-6 ${className}`}>
      <div className={alignmentClasses[horizontalAlign]}>
        <div
          className="rounded-lg shadow-lg overflow-hidden"
          style={{
            width: "100%",
            maxWidth: `${maxHeight * aspectRatioValue}px`,
            aspectRatio: aspectRatioValue,
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

// Export the component mapping for use in MDX
export const mdxComponents = {
  // Custom components
  Callout,
  Image: MDXImage,
  ImageGrid,
  CodeBlock,
  Link: MDXLink,
  Quote,
  Divider,
  YouTubeVideo,

  // Override default HTML elements with enhanced styling
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ArticleH1 id={generateHeadingId(props.children as string)} {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ArticleH2 id={generateHeadingId(props.children as string)} {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ArticleH3 id={generateHeadingId(props.children as string)} {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <ArticleH4 id={generateHeadingId(props.children as string)} {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-zinc-300 leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="list-disc list-outside text-zinc-200 mb-4 space-y-1 ml-6"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="list-decimal list-outside text-zinc-200 mb-4 space-y-1 ml-6"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-zinc-200 font-normal" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-bold text-zinc-300" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-zinc-200" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-zinc-800 text-cyan-200 px-1 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 overflow-x-auto my-4"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className="border-l-4 border-zinc-600 pl-4 italic text-zinc-400 my-4"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-zinc-200 hover:text-zinc-100 underline transition-colors duration-200"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="border-zinc-500/50 my-16 mx-15 md:mx-20 lg:mx-30"
      {...props}
    />
  ),
};

// Export individual components for direct use
export {
  Callout,
  MDXImage as Image,
  ImageGrid,
  CodeBlock,
  MDXLink as Link,
  Quote,
  Divider,
  YouTubeVideo,
};
