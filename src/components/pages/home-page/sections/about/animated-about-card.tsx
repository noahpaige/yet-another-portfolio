"use client";

import { useAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

const myAnimations = {
  headerReveal: {
    hidden: {
      styles: { filter: "blur(10px)", opacity: 0, transform: "scale(2)" },
      properties: {},
    },
    show: {
      styles: { filter: "blur(0px)", opacity: 1 },
      properties: { duration: 0.2 },
    },
    exit: {
      styles: { filter: "blur(10px)", opacity: 0 },
      properties: { duration: 0.3 },
    },
  },
  headerScale: {
    hidden: {
      styles: { transform: "scale(2)", transformOrigin: "left" },
      properties: {},
    },
    show: {
      styles: { transform: "scale(1)", transformOrigin: "left" },
      properties: { duration: 0.3 },
    },
    exit: {
      styles: { transform: "scale(2)", transformOrigin: "left" },
      properties: {},
    },
  },
  bodyReveal: {
    hidden: { styles: { filter: "blur(10px)", opacity: 0 }, properties: {} },
    show: {
      styles: { filter: "blur(0px)", opacity: 1 },
      properties: { duration: 0.2, staggerDelay: 80 },
    },
    exit: {
      styles: { opacity: 0, filter: "blur(10px)" },
      properties: { duration: 0.2 },
    },
  },
};

const animateChildren = async (
  parent: Element,
  animateFn: ReturnType<typeof useAnimate>[1],
  styles: unknown,
  properties: unknown,
  checkCancel?: () => boolean
) => {
  const children = parent.children;
  const staggerDelay = properties.staggerDelay ?? 0;

  for (let i = 0; i < children.length; i++) {
    if (checkCancel?.()) return;

    animateFn(children[i] as HTMLElement, styles, properties);
    if (staggerDelay > 0) await new Promise((r) => setTimeout(r, staggerDelay));
  }
};

interface AnimatedAboutCardProps {
  show: boolean;
  header: string;
  body: string;
  headerMinPx: number;
  headerMaxPx: number;
  bodyMinPx: number;
  bodyMaxPx: number;
  delay?: number;
  bodyAnimDelay?: number;
}

export default function AnimatedAboutCard({
  show,
  header,
  body,
  headerMinPx,
  headerMaxPx,
  bodyMinPx,
  bodyMaxPx,
  delay = 0,
  bodyAnimDelay = 0,
}: AnimatedAboutCardProps) {
  const [scopeHeader, animateHeader] = useAnimate();
  const [scopeBody, animateBody] = useAnimate();
  const animationIdRef = useRef(Symbol());

  // Set initial hidden styles
  useEffect(() => {
    if (!scopeHeader.current || !scopeBody.current) return;

    animateHeader(
      scopeHeader.current,
      {
        ...myAnimations.headerReveal.hidden.styles,
        ...myAnimations.headerScale.hidden.styles,
      },
      { duration: 0 }
    );
    animateChildren(
      scopeBody.current,
      animateBody,
      myAnimations.bodyReveal.hidden.styles,
      { duration: 0 }
    );
  }, [animateHeader, animateBody]);

  useEffect(() => {
    if (!scopeHeader.current || !scopeBody.current) return;

    animationIdRef.current = Symbol();
    const myId = animationIdRef.current;
    const isCancelled = () => animationIdRef.current !== myId;

    const animateIn = async () => {
      await animateHeader(
        scopeHeader.current,
        myAnimations.headerReveal.show.styles,
        myAnimations.headerReveal.show.properties
      );
      if (isCancelled()) return;

      await animateHeader(
        scopeHeader.current,
        myAnimations.headerScale.show.styles,
        myAnimations.headerScale.show.properties
      );
      if (isCancelled()) return;

      // ✅ Add this delay before body animation
      if (bodyAnimDelay > 0) {
        await new Promise((r) => setTimeout(r, bodyAnimDelay));
        if (isCancelled()) return;
      }

      await animateChildren(
        scopeBody.current,
        animateBody,
        myAnimations.bodyReveal.show.styles,
        myAnimations.bodyReveal.show.properties,
        isCancelled
      );
    };

    const animateOut = async () => {
      await animateHeader(
        scopeHeader.current,
        {
          ...myAnimations.headerReveal.exit.styles,
          ...myAnimations.headerScale.exit.styles,
        },
        myAnimations.headerReveal.exit.properties
      );
      if (isCancelled()) return;

      await animateChildren(
        scopeBody.current,
        animateBody,
        myAnimations.bodyReveal.exit.styles,
        myAnimations.bodyReveal.exit.properties,
        isCancelled
      );
    };

    const timeoutId = setTimeout(() => {
      if (show) {
        setTimeout(() => !isCancelled() && animateIn(), delay);
      } else {
        animateOut();
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [show, animateHeader, animateBody, delay]);

  return (
    <div className="text-white p-4 leading-tight">
      <div
        className="font-lexend-deca font-thin"
        style={{
          fontSize: `clamp(${bodyMinPx}px, 10vw, ${bodyMaxPx}px)`,
        }}
      >
        <span
          ref={scopeHeader}
          className="font-space-mono text-nowrap inline-block align-baseline"
          style={{
            fontSize: `clamp(${headerMinPx}px, 10vw, ${headerMaxPx}px)`,
            transformOrigin: "left",
            marginRight: "0.5ch",
          }}
        >
          {header}
        </span>
        <span ref={scopeBody}>
          {body.split(" ").map((word, i) => (
            <span key={i}>{word + " "}</span>
          ))}
        </span>
      </div>
    </div>
  );
}
