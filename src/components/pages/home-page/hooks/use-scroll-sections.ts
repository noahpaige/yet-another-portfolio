// components/pages/home-page/hooks/use-scroll-sections.ts
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

  // Scroll to a section manually
  const scrollToSection = (section: string) => {
    const el = document.getElementById(`section-${section}`);
    if (el) {
      setScrollingManually(true);
      el.scrollIntoView({ behavior: "smooth" });

      setTimeout(() => {
        setScrollingManually(false);
        setActiveSection(section);
        const params = new URLSearchParams(window.location.search);
        params.set("section", section);
        router.replace(`?${params.toString()}`);
      }, 600); // matches scroll duration
    }
  };

  // Observe which section is in view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollingManually) return;

      const sectionElements = Array.from(container.children) as HTMLElement[];

      const containerTop = container.getBoundingClientRect().top;

      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        const offsetTop = rect.top - containerTop;
        const height = rect.height;

        if (offsetTop >= 0 && offsetTop < height / 2) {
          const section = el.getAttribute("data-section");
          if (section && section !== activeSection) {
            setActiveSection(section);
            const params = new URLSearchParams(window.location.search);
            params.set("section", section);
            router.replace(`?${params.toString()}`);
          }
          break;
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollingManually, activeSection, router, scrollRef]);

  // Scroll to section from search param on load
  useEffect(() => {
    const selected = searchParams.get("section");
    if (selected) {
      setTimeout(() => {
        const el = document.getElementById(`section-${selected}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [searchParams]);

  return { containerRef, activeSection, scrollToSection };
}
