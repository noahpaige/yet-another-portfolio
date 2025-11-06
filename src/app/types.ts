import type { HSLColor } from "@/components/animated-background2";

export type BlobData = {
  path: Path2D;
  colors: { a: string; b: string }[];
  rotation: { angle: number; curSpeed: number; baseSpeed: number };
  scale: number;
};

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
