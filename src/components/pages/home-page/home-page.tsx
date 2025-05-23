"use client";

import { RefObject, useRef } from "react";
import { useScroll } from "framer-motion";

import WelcomeSection from "@/components/pages/home-page/sections/welcome-section";
import HomePageSection from "@/components/pages/home-page/sections/home-page-section";
import BottomNav from "@/components/pages/home-page/bottom-nav";
import AnimatedBackground from "@/components/animated-background/animated-background2";
import ClientOnly from "@/components/client-only";
import { useScrollSections } from "@/components/pages/home-page/hooks/use-scroll-sections";
import { Home, Folder, Info, Mail } from "lucide-react";
import { useSmoothWheelScroll } from "@/components/pages/home-page/hooks/use-smooth-wheel-scroll";

const SECTIONS = new Map([
  ["Home", { component: WelcomeSection, icon: Home }],
  ["Projects", { component: () => <div>Projects</div>, icon: Folder }],
  ["About", { component: () => <div>About</div>, icon: Info }],
  ["Contact", { component: () => <div>Contact</div>, icon: Mail }],
]);

export default function HomePage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionNames = Array.from(SECTIONS.keys());

  const navOptions = Array.from(SECTIONS.entries()).map(([name, section]) => ({
    name,
    icon: section.icon,
  }));

  const { activeSection, scrollToSection } = useScrollSections(
    sectionNames,
    scrollContainerRef as RefObject<HTMLDivElement>
  );
  useSmoothWheelScroll(scrollContainerRef as RefObject<HTMLDivElement>); // Add this line

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"],
  });

  return (
    <main>
      <div className="relative z-0 bg-slate-900">
        <ClientOnly>
          <AnimatedBackground scrollYProgress={scrollYProgress} />
        </ClientOnly>

        <div
          ref={scrollContainerRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth text-zinc-200"
        >
          {Array.from(SECTIONS.entries()).map(([name, section]) => (
            <HomePageSection
              key={name}
              id={`section-${name}`}
              sectionName={name}
            >
              {section.component()}
            </HomePageSection>
          ))}
        </div>

        <BottomNav
          options={navOptions}
          current={activeSection}
          onSelect={scrollToSection}
        />
      </div>
    </main>
  );
}
