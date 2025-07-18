"use client";

import React from "react";
import { ArticleHeaderText, ArticleBodyText, ArticleFigure } from "./index";
import type {
  ContentElement,
  ArticleHeaderTextProps,
  ArticleBodyTextProps,
  ArticleFigureProps,
} from "./types";

// Registry mapping element types to their components
const elementRegistry = {
  header: ArticleHeaderText,
  body: ArticleBodyText,
  figure: ArticleFigure,
} as const;

// Type guard functions to ensure proper typing
const isHeaderProps = (props: unknown): props is ArticleHeaderTextProps => {
  return (
    typeof props === "object" &&
    props !== null &&
    "level" in props &&
    "content" in props &&
    typeof (props as { content: unknown }).content === "string"
  );
};

const isBodyProps = (props: unknown): props is ArticleBodyTextProps => {
  return typeof props === "object" && props !== null && "content" in props;
};

const isFigureProps = (props: unknown): props is ArticleFigureProps => {
  return typeof props === "object" && props !== null && "content" in props;
};

// Element factory function
export function createElement(
  element: ContentElement
): React.ReactElement | null {
  const { type, props } = element;
  const Component = elementRegistry[type];

  if (!Component) {
    console.warn(`Unknown element type: ${type}`);
    return null;
  }

  // Type-safe rendering based on element type
  switch (type) {
    case "header":
      if (isHeaderProps(props)) {
        return React.createElement(
          Component as React.ComponentType<ArticleHeaderTextProps>,
          props
        );
      }
      console.warn("Invalid header props:", props);
      return null;

    case "body":
      if (isBodyProps(props)) {
        return React.createElement(
          Component as React.ComponentType<ArticleBodyTextProps>,
          props
        );
      }
      console.warn("Invalid body props:", props);
      return null;

    case "figure":
      if (isFigureProps(props)) {
        return React.createElement(
          Component as React.ComponentType<ArticleFigureProps>,
          props
        );
      }
      console.warn("Invalid figure props:", props);
      return null;

    default:
      console.warn(`Unhandled element type: ${type}`);
      return null;
  }
}

// Main renderer component for ContentElement[]
export function ArticleElementsRenderer({
  elements,
  className = "",
}: {
  elements: ContentElement[];
  className?: string;
}) {
  return (
    <div className={className}>
      {elements.map((element, index) => {
        const renderedElement = createElement(element);
        return renderedElement ? (
          <React.Fragment key={`${element.type}-${index}`}>
            {renderedElement}
          </React.Fragment>
        ) : null;
      })}
    </div>
  );
}

// Helper function to create ContentElement objects
export const createContentElement = {
  header: (props: ArticleHeaderTextProps): ContentElement => ({
    type: "header",
    props,
  }),

  body: (props: ArticleBodyTextProps): ContentElement => ({
    type: "body",
    props,
  }),

  figure: (props: ArticleFigureProps): ContentElement => ({
    type: "figure",
    props,
  }),
};
