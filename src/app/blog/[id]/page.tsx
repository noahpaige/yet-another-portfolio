import React from "react";
import { getArticleById } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
import ArticleLayout from "@/components/articles/article-layout";
import MDXRenderer from "@/components/mdx/mdx-renderer";
import { notFound } from "next/navigation";
import type { HSLColor } from "@/components/animated-background";

interface BlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;
  const article = getArticleById(id);
  const mdxContent = getArticleMDXContent(id);

  if (!article || !mdxContent || article.type !== "blog") {
    notFound();
  }

  // Color pairs for blog pages (different from projects)
  const colorPairs: [HSLColor, HSLColor][] = [
    [
      { h: 280, s: 60, l: 25 },
      { h: 120, s: 40, l: 15 },
    ],
    [
      { h: 320, s: 50, l: 25 },
      { h: 180, s: 45, l: 15 },
    ],
  ];

  return (
    <ArticleLayout
      header={article.title}
      tags={article.tags || []}
      colorPairs={colorPairs}
    >
      <MDXRenderer content={mdxContent} />
    </ArticleLayout>
  );
}
