import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Centralized config for scroll and section behavior
export const SCROLL_CONFIG = {
  // Timeouts (ms)
  FALLBACK: 2000, // Fallback for very slow devices
  WHEEL_DETECTION: 100, // For wheel event detection
  IOS_FALLBACK: 1000, // iOS Safari fallback
  ANIMATION_DURATION: 700, // Duration of smooth scroll animation
  ANIMATION_BUFFER: 100, // Buffer after animation
  // Thresholds
  STOPPED_COUNT: 3, // Consecutive checks to consider scroll stopped
  POSITION_CHANGE: 1, // Minimum px change to consider scrolling
  VISIBILITY_TOP: 0.1, // % from top as a fraction (0.05 = 5%)
  VISIBILITY_BOTTOM: 0.9, // % from bottom as a fraction (0.05 = 5%)
  // Wheel scroll specific
  ACCUMULATED_THRESHOLD_FRAC: 0.01, // % of section height as a fraction (0.05 = 5%)
  WHEEL_DEBOUNCE_MS: 50, // Debounce time between wheel events
} as const;

// Detect iOS Safari
const isIOSSafari = () => {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent)
  );
};

export function useScrollSections(
  sectionIds: string[],
  scrollRef: RefObject<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [scrollingManually, setScrollingManually] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetSectionRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const clearScrollTimeout = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const handleProgrammaticScroll = (targetSectionIndex: number) => {
    // Ensure the target section index is within bounds
    if (targetSectionIndex >= 0 && targetSectionIndex < sectionIds.length) {
      const targetSection = sectionIds[targetSectionIndex];
      setActiveSection(targetSection);
      // Update URL query parameters
      const params = new URLSearchParams(window.location.search);
      params.set("section", targetSection);
      router.replace(`?${params.toString()}`);
      setScrollingManually(true);
      setIsScrolling(true);
      targetSectionRef.current = targetSection;
      clearScrollTimeout();
      // Set a timeout to reset the manual scrolling state
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
      }, SCROLL_CONFIG.ANIMATION_DURATION + SCROLL_CONFIG.ANIMATION_BUFFER);
    }
  };

  const checkIfScrollingFinished = () => {
    if (!targetSectionRef.current || !scrollingManually) return;
    const targetEl = document.getElementById(
      `section-${targetSectionRef.current}`
    );
    if (!targetEl) return;
    const container = scrollRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top;
    const targetBottom = targetRect.bottom - containerRect.top;
    const containerHeight = containerRect.height;
    const isTargetVisible =
      targetTop <= containerHeight * SCROLL_CONFIG.VISIBILITY_TOP &&
      targetBottom >= containerHeight * SCROLL_CONFIG.VISIBILITY_BOTTOM;
    if (isTargetVisible) {
      setScrollingManually(false);
      setIsScrolling(false);
      targetSectionRef.current = null;
      clearScrollTimeout();
    }
  };

  const scrollToSection = (section: string) => {
    const el = document.getElementById(`section-${section}`);
    const container = scrollRef.current;
    if (el && container) {
      setScrollingManually(true);
      setIsScrolling(true);
      setActiveSection(section);
      targetSectionRef.current = section;
      // Update URL query parameters
      const params = new URLSearchParams(window.location.search);
      params.set("section", section);
      router.replace(`?${params.toString()}`);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }, SCROLL_CONFIG.ANIMATION_DURATION);
      clearScrollTimeout();
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
      }, SCROLL_CONFIG.FALLBACK);
    }
  };

  // Enhanced scroll end detection
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let scrollEndTimeout: NodeJS.Timeout | null = null;
    let lastScrollTop = container.scrollTop;
    let scrollStoppedCount = 0;
    const handleScroll = () => {
      if (!scrollingManually) return;
      const currentScrollTop = container.scrollTop;
      const isCurrentlyScrolling =
        Math.abs(currentScrollTop - lastScrollTop) >
        SCROLL_CONFIG.POSITION_CHANGE;
      if (isCurrentlyScrolling) {
        scrollStoppedCount = 0;
        setIsScrolling(true);
      } else {
        scrollStoppedCount++;
        if (scrollStoppedCount >= SCROLL_CONFIG.STOPPED_COUNT) {
          setIsScrolling(false);
          checkIfScrollingFinished();
        }
      }
      lastScrollTop = currentScrollTop;
      if (scrollEndTimeout) {
        clearTimeout(scrollEndTimeout);
      }
      scrollEndTimeout = setTimeout(() => {
        if (scrollingManually && !isScrolling) {
          checkIfScrollingFinished();
        }
      }, SCROLL_CONFIG.WHEEL_DETECTION);
    };
    // Note: Wheel events are now handled by useSmoothWheelScroll hook
    // This prevents conflicts between the two wheel event handlers
    const handleTouchStart = () => {
      if (scrollingManually) {
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
        clearScrollTimeout();
      }
    };
    const handleIOSFallback = () => {
      if (isIOSSafari() && scrollingManually) {
        setTimeout(() => {
          if (scrollingManually) {
            setScrollingManually(false);
            setIsScrolling(false);
            targetSectionRef.current = null;
            clearScrollTimeout();
          }
        }, SCROLL_CONFIG.IOS_FALLBACK);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    if (isIOSSafari()) {
      handleIOSFallback();
    }
    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
    };
  }, [scrollingManually, isScrolling, scrollRef]);

  // 📦 Enhanced intersection-based scroll tracking for iOS Safari
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;
        const section = visible.target.getAttribute("data-section");
        if (section && section !== activeSection) {
          if (!scrollingManually || targetSectionRef.current === section) {
            setActiveSection(section);
            const params = new URLSearchParams(window.location.search);
            params.set("section", section);
            router.replace(`?${params.toString()}`);
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: "0px 0px -10% 0px",
      }
    );
    const children = Array.from(container.children);
    children.forEach((el) => observer.observe(el));
    const handleIOSScrollDetection = () => {
      if (!isIOSSafari() || scrollingManually) return;
      const containerHeight = container.clientHeight;
      let bestSection = activeSection;
      let bestVisibility = 0;
      children.forEach((child) => {
        const sectionName = child.getAttribute("data-section");
        if (!sectionName) return;
        const rect = child.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const top = rect.top - containerRect.top;
        const bottom = rect.bottom - containerRect.top;
        const visibleHeight =
          Math.min(bottom, containerHeight) - Math.max(top, 0);
        const visibility = Math.max(0, visibleHeight / containerHeight);
        if (visibility > bestVisibility) {
          bestVisibility = visibility;
          bestSection = sectionName;
        }
      });
      if (
        bestSection &&
        bestSection !== activeSection &&
        bestVisibility > 0.3
      ) {
        setActiveSection(bestSection);
        const params = new URLSearchParams(window.location.search);
        params.set("section", bestSection);
        router.replace(`?${params.toString()}`);
      }
    };
    if (isIOSSafari()) {
      container.addEventListener("scroll", handleIOSScrollDetection, {
        passive: true,
      });
    }
    return () => {
      children.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      if (isIOSSafari()) {
        container.removeEventListener("scroll", handleIOSScrollDetection);
      }
    };
  }, [scrollingManually, activeSection, router, scrollRef]);

  // Handle initial deep link
  useEffect(() => {
    const selected = searchParams.get("section");
    if (selected) {
      setScrollingManually(true);
      setIsScrolling(true);
      setActiveSection(selected);
      targetSectionRef.current = selected;
      requestAnimationFrame(() => {
        const el = document.getElementById(`section-${selected}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          clearScrollTimeout();
          scrollTimeoutRef.current = setTimeout(() => {
            setScrollingManually(false);
            setIsScrolling(false);
            targetSectionRef.current = null;
          }, SCROLL_CONFIG.FALLBACK);
        } else {
          setScrollingManually(false);
          setIsScrolling(false);
          targetSectionRef.current = null;
        }
      });
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      clearScrollTimeout();
    };
  }, []);

  return {
    containerRef,
    activeSection,
    scrollToSection,
    scrollingManually,
    isScrolling,
    handleProgrammaticScroll,
  };
}
