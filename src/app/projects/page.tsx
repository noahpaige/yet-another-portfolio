import React from "react";
import { projects } from "@/generated/project-index";
import Link from "next/link";
import { Magnetic } from "@/components/ui/magnetic";

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
              <Magnetic key={project.id}  intensity={0.2}
             range={400}
             actionArea="self"
             springOptions={{ stiffness: 500, damping: 50 }}>
                <Link href={`/projects/${project.id}`}>
                  <div className="group relative overflow-hidden rounded-xl glass-layer-hoverable transition-all duration-300">
                    {/* Project Image */}
                    <div className="relative h-48 rounded-md overflow-hidden">
                      <Magnetic 
                        intensity={0.1}
                        range={200}
                        actionArea="global"
                        springOptions={{ stiffness: 300, damping: 30 }}
                      >
                        <div className="w-full h-48 scale-110">
                          <img
                            src={project.image}
                            alt={project.imageAltText}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                      </Magnetic>
                    </div>

                    {/* Project Info */}
                    <div className="px-6 py-3">
                       <Magnetic 
                            intensity={0.1}
                            range={200}
                            actionArea="global"
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                      <h3 className="text-xl font-bold mb-3 text-zinc-100 transition-colors">
                          {project.title}
                      </h3>
                                       </Magnetic>
         
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Magnetic 
                            key={tag} 
                            intensity={0.1}
                            range={200}
                            actionArea="global"
                            springOptions={{ stiffness: 300, damping: 30 }}
                          >
                            <span
                              className="px-2 py-1 text-zinc-300 text-xs rounded-full glass-layer"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animationDuration: '2s'
                              }}
                            >
                              {tag}
                            </span>
                          </Magnetic>
                        ))}
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/10 to-green-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </Link>
              </Magnetic>
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