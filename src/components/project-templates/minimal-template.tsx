import React from "react";
import type { ProjectTemplateProps } from "./types";

export default function MinimalTemplate({
  header,
  tags,
  children,
}: ProjectTemplateProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-zinc-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-zinc-100">{header}</h1>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Project Content */}
          <div className="prose prose-invert max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
