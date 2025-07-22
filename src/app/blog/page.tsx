"use client";

import { useState } from "react";
import { getArticleById } from "@/generated/article-index";
import { ArticleFilter } from "@/components/projects/article-filter";
import { type MDXContent } from "@/generated/article-mdx-index";
import { ProjectCard } from "@/components/ui/project-card";

export default function BlogsPage() {
  const [filteredBlogs, setFilteredBlogs] = useState<
    Array<{ id: string; content: MDXContent }>
  >([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
          <p className="text-gray-300 text-lg">
            Thoughts, insights, and experiences from my journey in software
            development and beyond.
          </p>
        </div>

        <ArticleFilter articleType="blog" onFilterChange={setFilteredBlogs} />

        {/* Display filtered blogs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredBlogs.map(({ id, content }) => {
            // Find the corresponding article data
            const article = getArticleById(id);
            if (!article) return null;

            return (
              <ProjectCard key={id} project={article} mdxContent={content} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
