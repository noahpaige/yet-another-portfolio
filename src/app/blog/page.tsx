"use client";

import React from "react";
import { getArticleById } from "@/generated/article-index";
import { ArticleListPage } from "@/components/articles/article-list-page";
import type { HSLColor } from "@/components/animated-background2";

// Color pairs for the animated background (different from projects)
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 225, s: 45, l: 40 },
    { h: 260, s: 60, l: 8 },
  ],
  [
    { h: 225, s: 60, l: 30 },
    { h: 260, s: 70, l: 10 },
  ],
];

// Blog-specific data fetching function
const getBlogData = (id: string) => {
  return getArticleById(id);
};

export default function BlogsPage() {
  return (
    <ArticleListPage
      articleType="blog"
      colorPairs={colorPairs}
      getArticleData={getBlogData}
      pageTitle="Blog"
      emptyStateMessage="No blogs found matching your filters."
      layoutConstraints={{ maxWidth: "3xl" }}
      articleCardProps={{ height: "fit" }}
      currentPage="blog"
    />
  );
}
