// Export components
export { default as ArticleHeaderText } from "./article-header-text";
export { default as ArticleBodyText } from "./article-body-text";
export { default as ArticleFigure } from "./article-figure";

// Export factory and renderer
export {
  createElement,
  ArticleElementsRenderer,
  createContentElement,
} from "./element-factory";

// Export types
export type {
  BaseArticleElement,
  ArticleHeaderTextProps,
  ArticleBodyTextProps,
  ArticleFigureProps,
  ArticleElementProps,
  ContentElement,
} from "./types";
