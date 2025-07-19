import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXContent } from "@/lib/mdx";

interface MDXRendererProps {
  content: MDXContent;
}

// Custom components that can be used in MDX
const components = {
  // You can add custom components here
  // Callout: (props: any) => <div className="bg-blue-100 p-4 rounded">{props.children}</div>,
  // Image: (props: any) => <img {...props} className="rounded" />,
};

export default function MDXRenderer({ content }: MDXRendererProps) {
  return (
    <div className="mdx-content">
      <MDXRemote source={content.content} components={components} />
    </div>
  );
}
