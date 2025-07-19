import React from "react";
import { getProjectById } from "@/generated/project-index";
import { getProjectMDXContent } from "@/lib/mdx";
import ArticleLayout from "@/components/articles/article-layout";
import MDXRenderer from "@/components/mdx/mdx-renderer";
import { notFound } from "next/navigation";
import type { HSLColor } from "@/components/animated-background";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  // Get MDX content for the project
  const mdxContent = getProjectMDXContent(id);

  if (!mdxContent) {
    console.error(`No MDX content found for project ${id}`);
    notFound();
  }

  // Default color pairs if none provided
  const defaultColorPairs: [HSLColor, HSLColor][] = [
    [
      { h: 145, s: 50, l: 30 },
      { h: 290, s: 35, l: 10 },
    ],
    [
      { h: 245, s: 30, l: 9 },
      { h: 145, s: 60, l: 27 },
    ],
  ];

  const colorPairs = project.colorPairs || defaultColorPairs;

  return (
    <ArticleLayout
      header={project.title}
      tags={project.tags}
      colorPairs={colorPairs}
    >
      <MDXRenderer content={mdxContent} />
    </ArticleLayout>
  );
}
