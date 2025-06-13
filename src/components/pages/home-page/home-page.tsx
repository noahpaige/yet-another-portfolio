"use client";

import { RefObject, useRef } from "react";
import { useScroll } from "framer-motion";

import WelcomeSection from "@/components/pages/home-page/sections/welcome/welcome-section";
import AboutSection from "@/components/pages/home-page/sections/about/about-section";
import HomePageSection from "@/components/pages/home-page/sections/home-page-section";
import ProjectsSection from "@/components/pages/home-page/sections/projects/projects-section";
import BottomNav from "@/components/pages/home-page/bottom-nav";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import { useScrollSections } from "@/hooks/use-scroll-sections";
import { Home, Folder, Info, Mail } from "lucide-react";
import { useSmoothWheelScroll } from "@/hooks/use-smooth-wheel-scroll";
import NoiseOverlay from "@/components/noise-overlay";

const SECTIONS = new Map([
  ["HOME", { component: WelcomeSection, icon: Home }],
  ["ABOUT", { component: AboutSection, icon: Info }],
  ["PROJECTS", { component: ProjectsSection, icon: Folder }],
  ["CONTACT", { component: () => <div>Contact</div>, icon: Mail }],
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
    <main className="bg-slate-900">
      <div className="relative z-0 bg-slate-900">
        <ClientOnly>
          <AnimatedBackground scrollYProgress={scrollYProgress} />
          <NoiseOverlay opacity={0.05} resolution={1} />
        </ClientOnly>

        <div
          ref={scrollContainerRef}
          className="h-screen overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth text-zinc-200 @container"
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
