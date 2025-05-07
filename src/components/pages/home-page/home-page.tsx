// components/pages/home-page.tsx
"use client";

import WelcomeSection from "@/components/pages/home-page/sections/welcome-section";
import HomePageSection from "@/components/pages/home-page/sections/home-page-section";
import BottomNav from "@/components/pages/home-page/bottom-nav";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import { useScrollSections } from "@/components/pages/home-page/hooks/use-scroll-sections";
import { Home, Folder, Info, Mail } from "lucide-react";

const SECTIONS = new Map([
  [
    "Welcome",
    {
      component: WelcomeSection,
      icon: Home,
    },
  ],
  [
    "Projects",
    {
      component: () => <div>Projects</div>,
      icon: Folder,
    },
  ],
  [
    "About",
    {
      component: () => <div>About</div>,
      icon: Info,
    },
  ],
  [
    "Contact",
    {
      component: () => <div>Contact</div>,
      icon: Mail,
    },
  ],
]);

export default function HomePage() {
  const sectionNames = Array.from(SECTIONS.keys());
  const navOptions = Array.from(SECTIONS.entries()).map(([name, section]) => ({
    name,
    icon: section.icon,
  }));
  const { containerRef, activeSection, scrollToSection } =
    useScrollSections(sectionNames);

  return (
    <main>
      <div className="relative z-0 bg-slate-700">
        <ClientOnly>
          <AnimatedBackground />
        </ClientOnly>

        <div
          ref={containerRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-transparent text-zinc-200"
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
