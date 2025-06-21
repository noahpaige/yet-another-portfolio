"use client";

import { RefObject, useRef } from "react";
import { useScroll } from "framer-motion";

import WelcomeSection from "@/components/features/home/sections/welcome/welcome-section";
import AboutSection from "@/components/features/home/sections/about/about-section";
import HomePageSection from "@/components/features/home/sections/home-page-section";
import ProjectsSection from "@/components/features/home/sections/projects/projects-section";
import { ContactSection } from "@/components/features/home/sections/contact/contact-section";
import BottomNav from "@/components/features/home/bottom-nav";
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
  ["CONTACT", { component: ContactSection, icon: Mail }],
]);
// const SECTIONS = new Map([
//   ["HOME", { component: () => <div>WELCOME</div>, icon: Home }],
//   ["ABOUT", { component: () => <div>ABOUT</div>, icon: Info }],
//   ["PROJECTS", { component: () => <div>PROJECTS</div>, icon: Folder }],
//   ["CONTACT", { component: () => <div>CONTACT</div>, icon: Mail }],
// ]);
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
    <main
      ref={scrollContainerRef}
      className="relative z-0 h-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth bg-slate-900 text-zinc-200 @container"
    >
      <ClientOnly>
        <div className="sticky inset-0">
          <AnimatedBackground scrollYProgress={scrollYProgress} />
          <NoiseOverlay opacity={0.05} resolution={1} />
        </div>
      </ClientOnly>

      {Array.from(SECTIONS.entries()).map(([name, section]) => (
        <HomePageSection key={name} id={`section-${name}`} sectionName={name}>
          {section.component()}
        </HomePageSection>
      ))}

      <BottomNav
        options={navOptions}
        current={activeSection}
        onSelect={scrollToSection}
      />
    </main>
  );
}
