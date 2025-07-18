import DefaultTemplate from "./default-template";
import MinimalTemplate from "./minimal-template";
import FullscreenTemplate from "./fullscreen-template";
import CustomTemplate from "./custom-template";
import ArticleTemplate from "./article-template";
import type { ProjectTemplate } from "./types";

export const templates: ProjectTemplate[] = [
  {
    id: "default",
    name: "Default",
    component: DefaultTemplate,
    description: "Full animated background with centered layout",
  },
  {
    id: "minimal",
    name: "Minimal",
    component: MinimalTemplate,
    description: "Clean, simple layout without animated background",
  },
  {
    id: "fullscreen",
    name: "Fullscreen",
    component: FullscreenTemplate,
    description: "Hero-focused layout with large title and animated background",
  },
  {
    id: "article",
    name: "Article",
    component: ArticleTemplate,
    description:
      "Content-focused template for detailed documentation and academic papers",
  },
  {
    id: "custom",
    name: "Custom",
    component: CustomTemplate,
    description: "Complete freedom - project provides its own layout",
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return templates.find((template) => template.id === id);
}

export function getDefaultTemplate(): ProjectTemplate {
  return templates[0]; // Default template is first
}
