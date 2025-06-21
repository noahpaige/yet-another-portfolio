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
      className="h-screen w-screen flex flex-col overflow-hidden snap-start"
    >
      <div className="CONTENT flex-1 w-full overflow-hidden">{children}</div>
      <div className="SPACER w-full h-[calc(var(--spacing)*22)] shrink-0" />
    </section>
  );
}
