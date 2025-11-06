import type { HSLColor } from "@/components/animated-background2";
import type { Article } from "@/lib/enhanced-frontmatter";
import type { MDXContent } from "@/generated/article-mdx-index";

export interface ArticleLayoutProps {
  header: string;
  tags: string[];
  colorPairs: [HSLColor, HSLColor][];
  children: React.ReactNode;
  currentPage?: "home" | "projects" | "blog" | "/?section=CONTACT";
}

// New types for the shared article list page component
export interface FilteredArticle {
  id: string;
  content: MDXContent;
}

export type GetArticleDataFunction = (id: string) => Article | undefined;

export interface LayoutConstraints {
  maxWidth?: string;
  gridCols?: string;
  gap?: string;
}

export interface ArticleCardOverrides {
  showTags?: "show" | "hide" | "auto";
  showReadTime?: "show" | "hide" | "auto";
  showDesc?: "show" | "hide" | "auto";
  height?: "fit" | "auto";
}

export interface ArticleListPageProps {
  articleType: "blog" | "project";
  colorPairs: [HSLColor, HSLColor][];
  getArticleData: GetArticleDataFunction;
  pageTitle: string;
  emptyStateMessage: string;
  layoutConstraints?: LayoutConstraints;
  articleCardProps?: ArticleCardOverrides;
  currentPage: "blog" | "projects";
}
