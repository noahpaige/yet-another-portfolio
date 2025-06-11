"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import ProjectCard from "@/components/pages/home-page/sections/projects/project-card";

const projects = [
  {
    title: "Solve the Death Stranding",
    image: "/death_stranding.png",
    imageAltText: "Troy Baker babysitting.",
    content: (
      <div>
        <p>
          <span className="font-bold">The Death Stranding</span> is a survival
          horror game set in a post-apocalyptic world. The player controls a
          character who must navigate a dangerous world filled with dangerous
          creatures.
        </p>
      </div>
    ),
  },

  {
    title: "Defend Tsushima",
    image: "/ghost_of_tsushima.png",
    imageAltText: "Jin Sakai sheathes his sword.",
    content: (
      <div>
        <p>
          <span className="font-bold">Ghost of Tsushima</span> is an open-world
          action game set in feudal Japan.
          <br />
          Some more text here.
        </p>
      </div>
    ),
  },
];

export default function ProjectsSection() {
  const [show, setShow] = useState(false);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    setShow(isInView);
  }, [isInView]);

  return (
    <div ref={ref} className="h-full flex items-center justify-center gap-2">
      {projects.map((project, projectIndex) => {
        return (
          <ProjectCard
            key={projectIndex}
            show={show}
            title={project.title}
            imageSrc={project.image}
            imageAltText={project.imageAltText || ""}
            content={project.content}
          ></ProjectCard>
        );
      })}
    </div>
  );
}
