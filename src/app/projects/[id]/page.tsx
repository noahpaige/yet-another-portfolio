import React from "react";
import { getProjectById } from "@/generated/project-index";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = getProjectById(params.id);
  
  if (!project) {
    notFound();
  }

  // Dynamically import the project content
  let ProjectContent;
  try {
    const contentModule = await import(`@/projects/${params.id}/content`);
    ProjectContent = contentModule.default;
  } catch (error) {
    console.error(`Failed to load content for project ${params.id}:`, error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-zinc-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Project Image */}
          <div className="mb-8">
            <img
              src={project.image}
              alt={project.imageAltText}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Project Content */}
          <div className="prose prose-invert max-w-none">
            <ProjectContent />
          </div>
        </div>
      </div>
    </div>
  );
} 