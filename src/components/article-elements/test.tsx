"use client";

import React, { useEffect } from "react";
import { ArticleHeaderText, ArticleBodyText, ArticleFigure } from "./index";

export default function ArticleElementsTest() {
  // Ensure proper scrolling behavior
  useEffect(() => {
    // Reset body overflow to allow normal scrolling
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";

    // Cleanup on unmount
    return () => {
      document.body.style.overflowY = "";
      document.body.style.overflowX = "";
    };
  }, []);
  return (
    <div className="max-w-4xl mx-auto p-8 bg-black text-zinc-100">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Article Elements Test
      </h1>

      {/* Test Header Text Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Header Text Components</h2>

        <ArticleHeaderText
          level={1}
          content="This is a Level 1 Header"
          enableFragmentNavigation={true}
        />

        <ArticleHeaderText
          level={2}
          content="This is a Level 2 Header"
          enableFragmentNavigation={true}
        />

        <ArticleHeaderText
          level={3}
          content="This is a Level 3 Header"
          enableFragmentNavigation={true}
        />

        <ArticleHeaderText
          level={2}
          content="This is a Level 2 Header"
          enableFragmentNavigation={true}
        />

        <ArticleBodyText content="This paragraph tests that clicking the headers above updates the URL fragment and scrolls to the correct section. Try clicking on the headers and watch the URL change!" />
      </section>

      {/* Test Body Text Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Body Text Components</h2>

        <ArticleBodyText content="This is a regular paragraph with some text to test the body text component. It should have proper spacing and typography." />

        <ArticleBodyText
          variant="list"
          content="First list item\nSecond list item\nThird list item with more text"
        />

        <ArticleBodyText
          variant="blockquote"
          content="This is a blockquote to test the blockquote variant of the body text component."
        />
      </section>

      {/* Test Figure Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Figure Components</h2>

        <ArticleBodyText content="Below are test figures with different alignments and captions." />

        {/* Center aligned figure */}
        <ArticleFigure
          content={
            <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">Center Figure</span>
            </div>
          }
          alignment="center"
          caption="This is a center-aligned figure with a caption"
          altText="A blue to purple gradient rectangle with 'Center Figure' text"
        />

        <ArticleBodyText content="This text should appear after the center figure. The figure should be full width and centered." />

        {/* Left aligned figure with text wrapping */}
        <ArticleFigure
          content={
            <div className="w-48 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Left Figure</span>
            </div>
          }
          alignment="left"
          wrapText={true}
          caption="This is a left-aligned figure with text wrapping"
          altText="A green to teal gradient rectangle with 'Left Figure' text"
        />

        <ArticleBodyText content="This text should wrap around the left-aligned figure. The figure should be positioned on the left with text flowing around it on the right side. This creates a nice layout effect that's commonly used in articles and documentation." />

        {/* Right aligned figure with text wrapping */}
        <ArticleFigure
          content={
            <div className="w-48 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Right Figure</span>
            </div>
          }
          alignment="right"
          wrapText={true}
          caption="This is a right-aligned figure with text wrapping"
          altText="An orange to red gradient rectangle with 'Right Figure' text"
        />

        <ArticleBodyText content="This text should wrap around the right-aligned figure. The figure should be positioned on the right with text flowing around it on the left side. This creates a nice layout effect that's commonly used in articles and documentation." />

        <ArticleBodyText content="This text should appear after the right-aligned figure, clearing the float and returning to normal flow." />
      </section>

      {/* Test URL Fragment Navigation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          URL Fragment Navigation Test
        </h2>

        <ArticleBodyText content="Click on any of the headers above and watch the URL change. You can also manually add #this-is-a-level-1-header to the URL to test direct navigation." />

        <ArticleHeaderText
          level={2}
          content="Test Header for URL Fragment"
          enableFragmentNavigation={true}
        />

        <ArticleBodyText content="This section tests the URL fragment navigation. The header above should be clickable and update the URL when clicked." />
      </section>

      {/* Extra content to ensure scrolling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Extra Content for Scrolling</h2>

        {Array.from({ length: 10 }, (_, i) => (
          <ArticleBodyText
            key={i}
            content={`This is paragraph ${
              i + 1
            } to ensure there's enough content to scroll. This helps test that both manual scrolling and fragment navigation work properly together.`}
          />
        ))}
      </section>
    </div>
  );
}
