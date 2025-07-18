import React from "react";

// Base interface for all article elements
export interface BaseArticleElement {
  id?: string;
  className?: string;
}

// Header Text Element
export interface ArticleHeaderTextProps extends BaseArticleElement {
  level: 1 | 2 | 3;
  content: string;
  enableFragmentNavigation?: boolean;
}

// Body Text Element
export interface ArticleBodyTextProps extends BaseArticleElement {
  content: string | React.ReactNode;
  variant?: "paragraph" | "list" | "blockquote";
}

// Figure Element
export interface ArticleFigureProps extends BaseArticleElement {
  content: React.ReactNode;
  alignment?: "left" | "right" | "center";
  caption?: string;
  altText?: string;
  wrapText?: boolean;
  margin?: number;
}

// Union type for all article elements
export type ArticleElementProps =
  | ArticleHeaderTextProps
  | ArticleBodyTextProps
  | ArticleFigureProps;

// ContentElement interface for the array-based system
export interface ContentElement {
  type: "header" | "body" | "figure";
  props: ArticleElementProps;
}
