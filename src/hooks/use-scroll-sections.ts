import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useScrollSections(
  sectionIds: string[],
  scrollRef: RefObject<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [scrollingManually, setScrollingManually] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

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

      // Just wait a moment, then resume listening to IntersectionObserver
      setTimeout(() => {
        setScrollingManually(false);
      }, 800); // Give some time for smooth scroll to complete
    }
  };

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
      requestAnimationFrame(() => {
        const el = document.getElementById(`section-${selected}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [searchParams]);

  return { containerRef, activeSection, scrollToSection };
}
