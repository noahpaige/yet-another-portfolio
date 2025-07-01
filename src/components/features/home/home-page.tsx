"use client";

import { RefObject, useRef, lazy, Suspense } from "react";
import { useScroll } from "framer-motion";

import HomePageSection from "@/components/features/home/sections/home-page-section";
import BottomNav from "@/components/features/home/bottom-nav";
import AnimatedBackground from "@/components/animated-background";
import ClientOnly from "@/components/client-only";
import { useScrollSections } from "@/hooks/use-scroll-sections";
import { Home, Folder, Info, Mail } from "lucide-react";
import { useSmoothWheelScroll } from "@/hooks/use-smooth-wheel-scroll";
import NoiseOverlay from "@/components/noise-overlay";
import LazySection from "@/components/features/home/lazy-section";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { HSLColor } from "@/components/animated-background";

// Lazy load section components
const WelcomeSection = lazy(
  () => import("@/components/features/home/sections/welcome/welcome-section")
);
const AboutSection = lazy(
  () => import("@/components/features/home/sections/about/about-section")
);
const ProjectsSection = lazy(
  () => import("@/components/features/home/sections/projects/projects-section")
);
const ContactSection = lazy(() =>
  import("@/components/features/home/sections/contact/contact-section").then(
    (module) => ({
      default: module.ContactSection,
    })
  )
);

const colorPairs: [HSLColor, HSLColor][] = [
  [
    { h: 145, s: 50, l: 30 },
    { h: 290, s: 35, l: 10 },
  ],
  [
    { h: 245, s: 30, l: 9 },
    { h: 145, s: 60, l: 27 },
  ],
  [
    { h: 145, s: 70, l: 23 },
    { h: 195, s: 25, l: 8 },
  ],
  [
    { h: 140, s: 20, l: 7 },
    { h: 145, s: 80, l: 20 },
  ],
];

const SECTIONS = new Map([
  ["HOME", { component: WelcomeSection, icon: Home }],
  ["ABOUT", { component: AboutSection, icon: Info }],
  ["PROJECTS", { component: ProjectsSection, icon: Folder }],
  ["CONTACT", { component: ContactSection, icon: Mail }],
]);

// Loading fallback component
const SectionFallback = () => (
  <div className="h-full w-full flex items-center justify-center">
    <LoadingSpinner size="lg" className="text-white" />
  </div>
);

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
  useSmoothWheelScroll(scrollContainerRef as RefObject<HTMLDivElement>);

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
          <AnimatedBackground
            scrollYProgress={scrollYProgress}
            colorPairs={colorPairs}
          />
          <NoiseOverlay opacity={0.05} resolution={1} />
        </div>
      </ClientOnly>

      {Array.from(SECTIONS.entries()).map(([name, section]) => {
        const SectionComponent = section.component;
        return (
          <HomePageSection key={name} id={`section-${name}`} sectionName={name}>
            <LazySection fallback={<SectionFallback />}>
              <Suspense fallback={<SectionFallback />}>
                <SectionComponent />
              </Suspense>
            </LazySection>
          </HomePageSection>
        );
      })}

      <BottomNav
        options={navOptions}
        current={activeSection}
        onSelect={scrollToSection}
      />
    </main>
  );
}
