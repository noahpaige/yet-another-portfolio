"use client";

import React from "react";
import { projectArticles } from "@/generated/article-index";
import { ArticleListPage } from "@/components/articles/article-list-page";
import type { HSLColor } from "@/components/animated-background";

// Color pairs for the animated background
const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 15, s: 50, l: 20 },
    { h: 200, s: 35, l: 10 },
  ],
  [
    { h: 45, s: 35, l: 20 },
    { h: 260, s: 50, l: 10 },
  ],
];

// Project-specific data fetching function
const getProjectData = (id: string) => {
  return projectArticles.find((p) => p.id === id);
};

export default function ProjectsPage() {
  return (
    <ArticleListPage
      articleType="project"
      colorPairs={colorPairs}
      getArticleData={getProjectData}
      pageTitle="Projects"
      emptyStateMessage="No projects found matching your filters."
      currentPage="projects"
    />
  );
}
