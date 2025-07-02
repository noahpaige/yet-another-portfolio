// components/homepage-section.tsx
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  id: string;
  sectionName: string;
}

export default function HomePageSection({ children, id, sectionName }: Props) {
  return (
    <div
      id={id}
      data-section={sectionName}
      style={{
        minHeight: "var(--real-vh)",
        height: "var(--real-vh)",
        width: "100vw",
      }}
      className="flex flex-col overflow-hidden snap-start"
    >
      <div className="CONTENT flex-1 h-full w-full overflow-hidden">
        {children}
      </div>
      <div className="SPACER w-full h-[calc(var(--spacing)*22)] shrink-0" />
    </div>
  );
}
