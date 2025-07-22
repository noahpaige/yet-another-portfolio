import type { HSLColor } from "@/components/animated-background";

export interface ArticleLayoutProps {
  header: string;
  tags: string[];
  colorPairs: [HSLColor, HSLColor][];
  children: React.ReactNode;
  currentPage?: "home" | "projects" | "blog" | "/?section=CONTACT";
}
