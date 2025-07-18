import React from "react";
import { getProjectById } from "@/generated/project-index";
import {
  getTemplateById,
  getDefaultTemplate,
} from "@/components/project-templates/template-registry";
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

  // Get template configuration
  const templateConfig = project.template;
  const templateId = templateConfig?.templateId || "default";
  const template = getTemplateById(templateId) || getDefaultTemplate();
  const TemplateComponent = template.component;

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

  const colorPairs = templateConfig?.colorPairs || defaultColorPairs;

  return (
    <TemplateComponent
      header={project.title}
      tags={project.tags}
      colorPairs={colorPairs}
      config={{
        image: project.image,
        imageAltText: project.imageAltText,
        timestamp: project.timestamp,
      }}
    >
      <ProjectContent />
    </TemplateComponent>
  );
}
