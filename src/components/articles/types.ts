import type { HSLColor } from "@/components/animated-background";

export interface ArticleTemplateProps {
  header: string;
  tags: string[];
  colorPairs: [HSLColor, HSLColor][];
  children: React.ReactNode;
}
