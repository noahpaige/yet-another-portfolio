// This file is auto-generated. Do not edit manually.
// Run: npm run generate-project-index

export interface Project {
  id: string;
  title: string;
  tags: string[];
  image: string;
  imageAltText: string;
}

export const projects: Project[] = [
  {
  id: "clair-obscur",
  title: "Grow Old",
  tags: ["RPG", "Turn-based", "Artistic"],
  image: "/clair_obscure.png",
  imageAltText: "It's harder than you think!",
},
  {
  id: "control",
  title: "Pick up the phone",
  tags: ["Action", "Supernatural", "Thriller"],
  image: "/control.jpg",
  imageAltText: "How does the director even get over there?",
},
  {
  id: "cyberpunk-2077",
  title: "For my Choom",
  tags: ["RPG", "Cyberpunk", "Open World"],
  image: "/choom.png",
  imageAltText: "My Number 1 Choom",
},
  {
  id: "death-stranding",
  title: "Deliver Packages",
  tags: ["Survival", "Horror", "Post-apocalyptic"],
  image: "/death_stranding.png",
  imageAltText: "Troy Baker babysitting.",
},
  {
  id: "ghost-of-tsushima",
  title: "Defend Tsushima",
  tags: ["Action", "Open World", "Samurai"],
  image: "/ghost_of_tsushima.png",
  imageAltText: "Jin Sakai sheathes his sword.",
},
  {
  id: "indiana-jones",
  title: "Find the Great Circle",
  tags: ["Adventure", "Action", "Archaeology"],
  image: "/indiana_jones.png",
  imageAltText: "Gotcha!",
}
];

export const projectIds = projects.map(p => p.id);

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}
