// This file is auto-generated. Do not edit manually.
// Run: npm run generate-project-index

import type { HSLColor } from "@/components/animated-background";

export interface ProjectTemplateConfig {
  templateId: string;
  colorPairs?: [HSLColor, HSLColor][];
}

export interface Project {
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
  template?: ProjectTemplateConfig;
}

export const projects: Project[] = [
  {
  id: "clair-obscur",
  title: "Grow Old",
  tags: ["RPG", "Turn-based", "Artistic"],
  image: "/clair_obscure.png",
  imageAltText: "It's harder than you think!",
  template: {
    templateId: "default",
    colorPairs: [
      [
        { h: 280, s: 60, l: 25 },
        { h: 145, s: 40, l: 15 },
      ],
      [
        { h: 145, s: 50, l: 20 },
        { h: 280, s: 70, l: 30 },
      ],
    ],
  },
},
  {
  id: "control",
  title: "Pick up the phone",
  tags: ["Action", "Supernatural", "Thriller"],
  image: "/control.jpg",
  imageAltText: "How does the director even get over there?",
  template: {
    templateId: "minimal",
  },
},
  {
  id: "cyberpunk-2077",
  title: "For my Choom",
  tags: ["RPG", "Cyberpunk", "Open World"],
  image: "/choom.png",
  imageAltText: "My Number 1 Choom",
  template: {
    templateId: "custom",
  },
},
  {
  id: "death-stranding",
  title: "Deliver Packages",
  tags: ["Survival", "Horror", "Post-apocalyptic"],
  image: "/death_stranding.png",
  imageAltText: "Troy Baker babysitting.",
  template: {
    templateId: "minimal",
  },
},
  {
  id: "ghost-of-tsushima",
  title: "Defend Tsushima",
  tags: ["Action", "Open World", "Samurai"],
  image: "/ghost_of_tsushima.png",
  imageAltText: "Jin Sakai sheathes his sword.",
  template: {
    templateId: "default",
    colorPairs: [
      [
        { h: 15, s: 70, l: 25 },
        { h: 200, s: 40, l: 15 },
      ],
      [
        { h: 200, s: 50, l: 20 },
        { h: 15, s: 80, l: 30 },
      ],
    ],
  },
},
  {
  id: "indiana-jones",
  title: "Find the Great Circle",
  tags: ["Adventure", "Action", "Archaeology"],
  image: "/indiana_jones.png",
  imageAltText: "Gotcha!",
  template: {
    templateId: "minimal",
  },
}
];

export const projectIds = projects.map(p => p.id);

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}
