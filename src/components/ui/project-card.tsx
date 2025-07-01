"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { Magnetic } from "@/components/ui/magnetic";
import { Project } from "@/generated/project-index";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = React.memo(({ project }: ProjectCardProps) => {
  // Create a ref for the Link element
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    // Outermost Magnetic uses 'self' (default)
    <Magnetic
      intensity={0.1}
      actionArea={{ type: "self" }}
      range={400}
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      {/* Attach the ref to the Link */}
      <Link href={`/projects/${project.id}`} ref={linkRef}>
        <div className="group relative overflow-hidden rounded-xl glass-layer-hoverable transition-all duration-300">
          <div className="relative h-24 xs:h-32 sm:h-40 md:h-48 lg:h-64 xl:h-80 rounded-lg overflow-hidden">
            {/* Use the Link as the action area for inner Magnetics */}
            <Magnetic
              intensity={0.2}
              range={1000}
              actionArea={{
                type: "ref",
                ref: linkRef as React.RefObject<HTMLElement>,
              }}
              springOptions={{ stiffness: 300, damping: 30 }}
            >
              <div className="w-full h-24 xs:h-32 sm:h-40 md:h-48 lg:h-64 xl:h-80 scale-115">
                {/* Project Image */}
                <img
                  src={project.image}
                  alt={project.imageAltText}
                  className="w-full h-24 xs:h-32 sm:h-40 md:h-48 lg:h-64 xl:h-80 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              </div>
            </Magnetic>
            <div className="px-6 py-3 absolute bottom-0 left-0">
              <Magnetic
                intensity={0.1}
                range={1000}
                actionArea={{
                  type: "ref",
                  ref: linkRef as React.RefObject<HTMLElement>,
                }}
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
                    range={1000}
                    actionArea={{
                      type: "ref",
                      ref: linkRef as React.RefObject<HTMLElement>,
                    }}
                    springOptions={{ stiffness: 300, damping: 30 }}
                  >
                    <span
                      className="px-2 py-1 text-zinc-300 text-xs rounded-full glass-layer"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animationDuration: "2s",
                      }}
                    >
                      {tag}
                    </span>
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Magnetic>
  );
});

ProjectCard.displayName = "ProjectCard";
