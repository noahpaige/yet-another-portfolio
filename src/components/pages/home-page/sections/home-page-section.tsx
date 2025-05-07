// components/homepage-section.tsx
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  id: string;
  sectionName: string;
}

export default function HomePageSection({ children, id, sectionName }: Props) {
  return (
    <section
      id={id}
      data-section={sectionName}
      className="h-screen snap-start flex justify-center items-center"
    >
      {children}
    </section>
  );
}
