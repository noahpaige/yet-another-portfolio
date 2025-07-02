import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Constants for better maintainability
const SCROLL_TIMEOUTS = {
  FALLBACK: 5000, // 5 seconds for very slow devices
  WHEEL_DETECTION: 100, // 100ms for wheel event detection
} as const;

const SCROLL_THRESHOLDS = {
  STOPPED_COUNT: 3, // Consecutive checks to consider scroll stopped
  POSITION_CHANGE: 1, // Minimum pixel change to consider scrolling
  VISIBILITY_TOP: 0.1, // 10% from top
  VISIBILITY_BOTTOM: 0.9, // 90% from bottom
} as const;

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
    if (el) {
      setScrollingManually(true);
      setIsScrolling(true);
      setActiveSection(section);
      targetSectionRef.current = section;

      // Update URL query parameters
      const params = new URLSearchParams(window.location.search);
      params.set("section", section);
      router.replace(`?${params.toString()}`);

      el.scrollIntoView({ behavior: "smooth" });

      // Clear any existing timeout
      clearScrollTimeout();

      // Set a fallback timeout (much longer for slow devices)
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

    // Handle wheel events to detect manual interruption
    const handleWheel = () => {
      if (scrollingManually) {
        // User is manually scrolling, reset programmatic scroll state
        setScrollingManually(false);
        setIsScrolling(false);
        targetSectionRef.current = null;
        clearScrollTimeout();
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
    };
  }, [scrollingManually, isScrolling, scrollRef]);

  // 📦 Efficient intersection-based scroll tracking
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingManually) return;

        const visible = entries.find((entry) => entry.isIntersecting);
        if (!visible) return;

        const section = visible.target.getAttribute("data-section");
        if (section && section !== activeSection) {
          setActiveSection(section);
          const params = new URLSearchParams(window.location.search);
          params.set("section", section);
          router.replace(`?${params.toString()}`);
        }
      },
      {
        root: container,
        threshold: 0.5, // Adjust based on how much of section must be visible
      }
    );

    const children = Array.from(container.children);
    children.forEach((el) => observer.observe(el));

    return () => {
      children.forEach((el) => observer.unobserve(el));
      observer.disconnect();
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
  };
}
