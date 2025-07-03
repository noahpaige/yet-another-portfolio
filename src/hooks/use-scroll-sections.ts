import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Constants for better maintainability
const SCROLL_TIMEOUTS = {
  FALLBACK: 5000, // 5 seconds for very slow devices
  WHEEL_DETECTION: 100, // 100ms for wheel event detection
  IOS_FALLBACK: 1000, // 1 second for iOS Safari
} as const;

const SCROLL_THRESHOLDS = {
  STOPPED_COUNT: 3, // Consecutive checks to consider scroll stopped
  POSITION_CHANGE: 1, // Minimum pixel change to consider scrolling
  VISIBILITY_TOP: 0.1, // 10% from top
  VISIBILITY_BOTTOM: 0.9, // 90% from bottom
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
    }
  };

  const checkIfScrollingFinished = () => {
    if (!targetSectionRef.current || !scrollingManually) return;

    const targetEl = document.getElementById(
      `section-${targetSectionRef.current}`
    );
    if (!targetEl) return;

    // Check if the target section is now the most visible section
    const container = scrollRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Calculate how much of the target section is visible
    const targetTop = targetRect.top - containerRect.top;
    const targetBottom = targetRect.bottom - containerRect.top;
    const containerHeight = containerRect.height;

    // If target section is mostly visible (within 10% of container height), consider scrolling finished
    const isTargetVisible =
      targetTop <= containerHeight * SCROLL_THRESHOLDS.VISIBILITY_TOP &&
      targetBottom >= containerHeight * SCROLL_THRESHOLDS.VISIBILITY_BOTTOM;

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

      // Smooth scroll first
      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // Force snap after smooth scroll (Chromium workaround)
      setTimeout(() => {
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }, 600);

      clearScrollTimeout();

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
      }, SCROLL_TIMEOUTS.FALLBACK);
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
        SCROLL_THRESHOLDS.POSITION_CHANGE;

      if (isCurrentlyScrolling) {
        scrollStoppedCount = 0;
        setIsScrolling(true);
      } else {
        scrollStoppedCount++;
        // If scroll position hasn't changed for 3 consecutive checks, consider it stopped
        if (scrollStoppedCount >= SCROLL_THRESHOLDS.STOPPED_COUNT) {
          setIsScrolling(false);
          checkIfScrollingFinished();
        }
      }

      lastScrollTop = currentScrollTop;

      if (scrollEndTimeout) {
        clearTimeout(scrollEndTimeout);
      }

      // Additional check after a short delay
      scrollEndTimeout = setTimeout(() => {
        if (scrollingManually && !isScrolling) {
          checkIfScrollingFinished();
        }
      }, SCROLL_TIMEOUTS.WHEEL_DETECTION);
    };

    // Note: Wheel events are now handled by useSmoothWheelScroll hook
    // This prevents conflicts between the two wheel event handlers

    // Handle touch events to detect manual interruption (mobile/iOS)
    const handleTouchStart = () => {
      if (scrollingManually) {
        // User is manually scrolling, reset programmatic scroll state
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
        clearScrollTimeout();
      }
    };

    // iOS Safari specific: More aggressive fallback
    const handleIOSFallback = () => {
      if (isIOSSafari() && scrollingManually) {
        // Force reset after a shorter timeout on iOS Safari
        setTimeout(() => {
          if (scrollingManually) {
            setScrollingManually(false);
            setIsScrolling(false);
            targetSectionRef.current = null;
            clearScrollTimeout();
          }
        }, SCROLL_TIMEOUTS.IOS_FALLBACK);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    // Add iOS Safari specific handling
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
        // Allow IntersectionObserver to work even during programmatic scrolling
        // This helps with iOS Safari momentum scrolling
        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;

        const section = visible.target.getAttribute("data-section");
        if (section && section !== activeSection) {
          // Only update if we're not in the middle of a programmatic scroll to a different section
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
        threshold: 0.5, // Adjust based on how much of section must be visible
        rootMargin: "0px 0px -10% 0px", // Slightly more lenient for iOS Safari
      }
    );

    const children = Array.from(container.children);
    children.forEach((el) => observer.observe(el));

    // iOS Safari specific: Additional scroll position-based detection
    const handleIOSScrollDetection = () => {
      if (!isIOSSafari() || scrollingManually) return;

      const containerHeight = container.clientHeight;

      // Find which section is most visible
      let bestSection = activeSection;
      let bestVisibility = 0;

      children.forEach((child) => {
        const sectionName = child.getAttribute("data-section");
        if (!sectionName) return;

        const rect = child.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate visibility
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

      // Update if we found a better section
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

    // Add scroll listener for iOS Safari position-based detection
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
      // Set scrolling manually to prevent IntersectionObserver interference
      setScrollingManually(true);
      setIsScrolling(true);
      setActiveSection(selected);
      targetSectionRef.current = selected;

      requestAnimationFrame(() => {
        const el = document.getElementById(`section-${selected}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });

          // Clear any existing timeout
          clearScrollTimeout();

          // Set a fallback timeout for initial deep link scrolls
          scrollTimeoutRef.current = setTimeout(() => {
            setScrollingManually(false);
            setIsScrolling(false);
            targetSectionRef.current = null;
          }, SCROLL_TIMEOUTS.FALLBACK);
        } else {
          // If element not found, reset scrolling manually
          setScrollingManually(false);
          setIsScrolling(false);
          targetSectionRef.current = null;
        }
      });
    }
  }, [searchParams]);

  // Cleanup on unmount
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
