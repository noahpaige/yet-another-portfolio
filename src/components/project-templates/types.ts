import type { HSLColor } from "@/components/animated-background";

export interface ProjectTemplateProps {
  header: string;
  tags: string[];
  colorPairs: [HSLColor, HSLColor][];
  children: React.ReactNode;
  config?: {
    image?: string;
    imageAltText?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  component: React.ComponentType<ProjectTemplateProps>;
  description: string;
}

export interface ProjectTemplateConfig {
  templateId: string;
  colorPairs?: [HSLColor, HSLColor][];
}
