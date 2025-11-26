import React from "react";
import { getArticleById } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
import ArticleLayout from "@/components/articles/article-layout";
import MDXRenderer from "@/components/mdx/mdx-renderer";
import { notFound } from "next/navigation";
import { type HSLColor } from "@noahpaige/react-blobs-bg";
import type { Metadata } from "next";
import { generateArticleMetadata } from "@/hooks/use-seo-metadata";

interface BlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate dynamic metadata for SEO and social media sharing
export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { id } = await params;
  return generateArticleMetadata(id);
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;
  const article = getArticleById(id);
  const mdxContent = getArticleMDXContent(id);

  if (!article || !mdxContent || article.type !== "blog") {
    notFound();
  }

  // Default color pairs if none provided
  const defaultColorPairs: [HSLColor, HSLColor][] = [
    [
      { h: 225, s: 45, l: 25 },
      { h: 260, s: 60, l: 8 },
    ],
    [
      { h: 225, s: 60, l: 15 },
      { h: 260, s: 70, l: 7 },
    ],
  ];

  // Use colorPairs from article if available (for blogs), otherwise use defaults
  const colorPairs =
    article.type === "blog" && article.colorPairs
      ? (article.colorPairs as [HSLColor, HSLColor][])
      : defaultColorPairs;

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
