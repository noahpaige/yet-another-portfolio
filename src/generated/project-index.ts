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
  timestamp: string;
  featured: boolean;
  featuredOrder?: number;
  template?: ProjectTemplateConfig;
}

// All projects sorted by timestamp (newest first)
export const projects: Project[] = [
  {
    "id": "masters-thesis",
    "title": "Masters Thesis",
    "tags": [
      "Research",
      "Academic",
      "Thesis"
    ],
    "image": "/masters-thesis.png",
    "imageAltText": "Masters thesis research and academic work",
    "timestamp": "2024-12-01T00:00:00Z",
    "featured": true,
    "featuredOrder": 1,
    "template": {
      "templateId": "default"
    }
  },
  {
    "id": "indiana-jones",
    "title": "Find the Great Circle",
    "tags": [
      "Adventure",
      "Action",
      "Archaeology"
    ],
    "image": "/indiana_jones.png",
    "imageAltText": "Gotcha!",
    "timestamp": "2024-06-20T00:00:00Z",
    "featured": true,
    "featuredOrder": 6,
    "template": {
      "templateId": "minimal"
    }
  },
  {
    "id": "ghost-of-tsushima",
    "title": "Defend Tsushima",
    "tags": [
      "Action",
      "Open World",
      "Samurai"
    ],
    "image": "/ghost_of_tsushima.png",
    "imageAltText": "Jin Sakai sheathes his sword.",
    "timestamp": "2024-05-15T00:00:00Z",
    "featured": true,
    "featuredOrder": 5,
    "template": {
      "templateId": "default",
      "colorPairs": [
        [
          {
            "h": 15,
            "s": 70,
            "l": 25
          },
          {
            "h": 200,
            "s": 40,
            "l": 15
          }
        ],
        [
          {
            "h": 200,
            "s": 50,
            "l": 20
          },
          {
            "h": 15,
            "s": 80,
            "l": 30
          }
        ]
      ]
    }
  },
  {
    "id": "death-stranding",
    "title": "Deliver Packages",
    "tags": [
      "Survival",
      "Horror",
      "Post-apocalyptic"
    ],
    "image": "/death_stranding.png",
    "imageAltText": "Troy Baker babysitting.",
    "timestamp": "2024-04-05T00:00:00Z",
    "featured": true,
    "featuredOrder": 4,
    "template": {
      "templateId": "minimal"
    }
  },
  {
    "id": "cyberpunk-2077",
    "title": "For my Choom",
    "tags": [
      "RPG",
      "Cyberpunk",
      "Open World"
    ],
    "image": "/choom.png",
    "imageAltText": "My Number 1 Choom",
    "timestamp": "2024-03-10T00:00:00Z",
    "featured": true,
    "featuredOrder": 3,
    "template": {
      "templateId": "custom"
    }
  },
  {
    "id": "control",
    "title": "Pick up the phone",
    "tags": [
      "Action",
      "Supernatural",
      "Thriller"
    ],
    "image": "/control.jpg",
    "imageAltText": "How does the director even get over there?",
    "timestamp": "2024-02-20T00:00:00Z",
    "featured": true,
    "featuredOrder": 2,
    "template": {
      "templateId": "minimal"
    }
  },
  {
    "id": "article-template-test",
    "title": "Article Template Test",
    "tags": [
      "Template",
      "Test",
      "Documentation"
    ],
    "image": "/masters-thesis.png",
    "imageAltText": "Masters thesis cover image",
    "timestamp": "2024-01-15T00:00:00Z",
    "featured": true,
    "featuredOrder": 1,
    "template": {
      "templateId": "article",
      "colorPairs": [
        [
          {
            "h": 12,
            "s": 40,
            "l": 30
          },
          {
            "h": 290,
            "s": 35,
            "l": 10
          }
        ],
        [
          {
            "h": 12,
            "s": 40,
            "l": 20
          },
          {
            "h": 204,
            "s": 5,
            "l": 21
          }
        ]
      ]
    }
  },
  {
    "id": "clair-obscur",
    "title": "Grow Old",
    "tags": [
      "RPG",
      "Turn-based",
      "Artistic"
    ],
    "image": "/clair_obscure.png",
    "imageAltText": "It's harder than you think!",
    "timestamp": "2024-01-15T00:00:00Z",
    "featured": true,
    "featuredOrder": 1,
    "template": {
      "templateId": "default",
      "colorPairs": [
        [
          {
            "h": 280,
            "s": 60,
            "l": 25
          },
          {
            "h": 145,
            "s": 40,
            "l": 15
          }
        ],
        [
          {
            "h": 145,
            "s": 50,
            "l": 20
          },
          {
            "h": 280,
            "s": 70,
            "l": 30
          }
        ]
      ]
    }
  }
];

// Featured projects sorted by featuredOrder
export const featuredProjects: Project[] = projects
  .filter(p => p.featured)
  .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0))
  .slice(0, 6); // Limit to 6 featured projects

export const projectIds = projects.map(p => p.id);

// Helper function to get project by ID
export function getProjectById(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}
