"use client";

import React, { useEffect } from "react";
import { ArticleElementsRenderer, createContentElement } from "./index";

export default function ArticleElementsSystemTest() {
  // Ensure proper scrolling behavior
  useEffect(() => {
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";

    return () => {
      document.body.style.overflowY = "";
      document.body.style.overflowX = "";
    };
  }, []);

  // Create a test ContentElement[] array
  const testElements = [
    createContentElement.header({
      level: 1,
      content: "🧠 Personality and Mood for Non-Player Characters",
      enableFragmentNavigation: true,
    }),

    createContentElement.header({
      level: 2,
      content: "A Method for Behavior Simulation in a Maze Environment",
      enableFragmentNavigation: true,
    }),

    createContentElement.header({
      level: 3,
      content: "By Noah Paige",
      enableFragmentNavigation: true,
    }),

    createContentElement.body({
      content:
        "This project explores how to make non-player characters (NPCs) in video games feel more lifelike and believable—not just visually, but in how they behave and react emotionally. Drawing from real psychological models of personality and mood, I created a system where NPCs make decisions based on a mix of their personality traits and current emotional state.",
    }),

    createContentElement.header({
      level: 2,
      content: "Introduction",
      enableFragmentNavigation: true,
    }),

    createContentElement.body({
      content:
        "Non-player characters (NPCs) are a staple in most modern games, yet they are often criticized for their lack of believability and emotional realism. This thesis tackles that problem by proposing a behavior model for NPCs that integrates psychological models—specifically, the Five-Factor Model of Personality and the Circumplex Model of Affect—to create more dynamic and emotionally responsive NPCs.",
    }),

    createContentElement.body({
      variant: "list",
      content:
        "Openness\nConscientiousness\nExtraversion\nAgreeableness\nNeuroticism",
    }),

    createContentElement.figure({
      content: (
        <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">Sample Figure</span>
        </div>
      ),
      alignment: "center",
      caption:
        "This is a sample figure created using the ContentElement system",
      altText: "A blue to purple gradient rectangle with 'Sample Figure' text",
    }),

    createContentElement.body({
      content:
        "The goal was to explore how personality and mood can be combined to produce emergent, unscripted behaviors in NPCs, which could enhance player immersion and narrative depth. To test the system, a maze simulation environment was built in Unity, where NPCs would navigate and interact based on their personalities and emotional states.",
    }),

    createContentElement.header({
      level: 2,
      content: "Background",
      enableFragmentNavigation: true,
    }),

    createContentElement.header({
      level: 3,
      content: "Role of NPCs in Games",
      enableFragmentNavigation: true,
    }),

    createContentElement.body({
      content:
        "NPCs play various roles in games—quest-givers, enemies, companions, or vendors. Yet many behave in limited, rigid ways due to reliance on traditional finite state machines, which lack flexibility in unpredictable situations. This leads to behavior that feels artificial and breaks immersion.",
    }),

    createContentElement.figure({
      content: (
        <div className="w-48 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">Left Figure</span>
        </div>
      ),
      alignment: "left",
      wrapText: true,
      caption: "Left-aligned figure with text wrapping",
      altText: "A green to teal gradient rectangle",
    }),

    createContentElement.body({
      content:
        "This text should wrap around the left-aligned figure. The figure should be positioned on the left with text flowing around it on the right side. This creates a nice layout effect that's commonly used in articles and documentation. The text continues to flow naturally around the figure, demonstrating the text wrapping functionality.",
    }),

    createContentElement.body({
      variant: "blockquote",
      content:
        "This is a blockquote to demonstrate the different body text variants available in the ContentElement system.",
    }),

    createContentElement.header({
      level: 2,
      content: "Test URL Fragment Navigation",
      enableFragmentNavigation: true,
    }),

    createContentElement.body({
      content:
        "Click on any of the headers above and watch the URL change. You can also manually add #introduction or #background to the URL to test direct navigation.",
    }),

    // Add some extra content for scrolling
    ...Array.from({ length: 5 }, (_, i) =>
      createContentElement.body({
        content: `This is paragraph ${
          i + 1
        } to ensure there's enough content to scroll and test the ContentElement system thoroughly. Each paragraph is created using the createContentElement.body helper function.`,
      })
    ),
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-black text-zinc-100">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Article Elements System Test
      </h1>

      <p className="text-zinc-400 mb-8 text-center">
        This page tests the ContentElement[] system with the
        ArticleElementsRenderer
      </p>

      <ArticleElementsRenderer elements={testElements} />
    </div>
  );
}
