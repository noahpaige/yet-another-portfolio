import React from "react";
import { getProjectById } from "@/generated/project-index";
import ArticleTemplate from "@/components/project-templates/article-template";
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

  // Dynamically import the project content
  let ProjectContent;
  try {
    const contentModule = await import(`@/projects/${id}/content`);
    ProjectContent = contentModule.default;
  } catch (error) {
    console.error(`Failed to load content for project ${id}:`, error);
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
    <ArticleTemplate
      header={project.title}
      tags={project.tags}
      colorPairs={colorPairs}
    >
      <ProjectContent />
    </ArticleTemplate>
  );
}
