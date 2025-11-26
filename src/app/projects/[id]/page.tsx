import React from "react";
import { getArticleById } from "@/generated/article-index";
import { getArticleMDXContent } from "@/generated/article-mdx-index";
import ArticleLayout from "@/components/articles/article-layout";
import MDXRenderer from "@/components/mdx/mdx-renderer";
import { notFound } from "next/navigation";
import { type HSLColor } from "@noahpaige/react-blobs-bg";
import type { Metadata } from "next";
import { generateArticleMetadata } from "@/hooks/use-seo-metadata";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate dynamic metadata for SEO and social media sharing
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  return generateArticleMetadata(id);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    notFound();
  }

  // Get MDX content for the article
  const mdxContent = getArticleMDXContent(id);

  if (!mdxContent) {
    console.error(`No MDX content found for article ${id}`);
    notFound();
  }

  // Default color pairs if none provided
  const defaultColorPairs: [HSLColor, HSLColor][] = [
    [
      { h: 145, s: 60, l: 20 },
      { h: 290, s: 35, l: 10 },
    ],
    [
      { h: 145, s: 60, l: 10 },
      { h: 245, s: 30, l: 7 },
    ],
  ];

  // Use colorPairs from article if available (for projects), otherwise use defaults
  const colorPairs =
    article.type === "project" && article.colorPairs
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
