import React from "react";
import { projects } from "@/generated/project-index";
import { ProjectCard } from "@/components/ui/project-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ArrowLeft } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-green-900 text-zinc-200">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-100 via-green-100 to-orange-500 bg-clip-text text-transparent">
              Projects
            </h1>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                hideTags={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
