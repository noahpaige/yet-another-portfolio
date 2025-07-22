import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXContent } from "@/generated/article-mdx-index";
import { mdxComponents } from "./mdx-provider";

interface MDXRendererProps {
  content: MDXContent;
  className?: string;
}

/**
 * MDX Renderer Component
 * Renders MDX content using next-mdx-remote with proper styling
 */
export default function MDXRenderer({
  content,
  className = "",
}: MDXRendererProps) {
  if (!content || !content.content) {
    return (
      <div className={`text-zinc-400 italic ${className}`}>
        No content available.
      </div>
    );
  }

  try {
    return (
      <div className={className}>
        <MDXRemote source={content.content} components={mdxComponents} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering MDX content:", error);
    return (
      <div className={`text-red-400 ${className}`}>
        Error rendering content. Please try again later.
      </div>
    );
  }
}
