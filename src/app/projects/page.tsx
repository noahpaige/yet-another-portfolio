import React from "react";
import { projects } from "@/generated/project-index";
import Link from "next/link";
import { ProjectCard } from "@/components/ui/project-card";

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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Back to Home */}
          <div className="text-center mt-16">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-zinc-600/50 rounded-lg transition-all duration-300 text-zinc-300 hover:text-zinc-100"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 