import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useScrollSections(
  sectionIds: string[],
  scrollRef: RefObject<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [scrollingManually, setScrollingManually] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const clearScrollTimeout = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const scrollToSection = (section: string) => {
    const el = document.getElementById(`section-${section}`);
    if (el) {
      setScrollingManually(true);
      setActiveSection(section);

      // Update URL query parameters
      const params = new URLSearchParams(window.location.search);
      params.set("section", section);
      router.replace(`?${params.toString()}`);

      el.scrollIntoView({ behavior: "smooth" });

      // Clear any existing timeout
      clearScrollTimeout();

      // Set a timeout as fallback, but also listen for scroll end
      scrollTimeoutRef.current = setTimeout(() => {
        setScrollingManually(false);
      }, 2000); // Increased timeout as fallback
    }
  };

  // Listen for scroll end to reset scrollingManually
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollEndTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (scrollEndTimeout) {
        clearTimeout(scrollEndTimeout);
      }

      scrollEndTimeout = setTimeout(() => {
        if (scrollingManually) {
          setScrollingManually(false);
          clearScrollTimeout();
        }
      }, 50); // Reduced from 100ms to 50ms for faster response to wheel events
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
    };
  }, [scrollingManually, scrollRef]);

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
      setActiveSection(selected);

      requestAnimationFrame(() => {
        const el = document.getElementById(`section-${selected}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });

          // Clear any existing timeout
          clearScrollTimeout();

          // Use a longer timeout for initial deep link scrolls
          scrollTimeoutRef.current = setTimeout(() => {
            setScrollingManually(false);
          }, 2500); // Even longer timeout for initial loads
        } else {
          // If element not found, reset scrolling manually
          setScrollingManually(false);
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

  return { containerRef, activeSection, scrollToSection, scrollingManually };
}
