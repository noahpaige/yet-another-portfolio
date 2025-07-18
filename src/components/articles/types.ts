import type { HSLColor } from "@/components/animated-background";

export interface ArticleLayoutProps {
  header: string;
  tags: string[];
  colorPairs: [HSLColor, HSLColor][];
  children: React.ReactNode;
}
