// components/pages/home-page/hooks/use-scroll-sections.ts
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useScrollSections(sectionIds: string[]) {
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
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingManually) return;

        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const section = visible.target.getAttribute("data-section");
          if (section && section !== activeSection) {
            setActiveSection(section);
            const params = new URLSearchParams(window.location.search);
            params.set("section", section);
            router.replace(`?${params.toString()}`);
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: "0px 0px -40% 0px",
      }
    );

    const children = containerRef.current?.children || [];
    Array.from(children).forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeSection, scrollingManually, router]);

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
