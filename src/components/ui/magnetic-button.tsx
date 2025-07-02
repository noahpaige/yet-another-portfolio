"use client";

import { ReactNode } from "react";
import { Magnetic } from "@/components/ui/magnetic";

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
}

export function MagneticButton({
  children,
  onClick,
  className = "",
  href,
  target,
  rel,
}: MagneticButtonProps) {
  const baseClasses =
    "inline-flex items-center py-2 px-3 justify-center glass-layer-hoverable text-neutral-400 hover:text-white cursor-pointer text-md font-medium transition-colors";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  const content = (
    <Magnetic
      intensity={0.1}
      range={500}
      actionArea={{ type: "parent" }}
      springOptions={{ stiffness: 500, damping: 50 }}
      className="w-full h-full flex items-center gap-2"
    >
      {children}
    </Magnetic>
  );

  if (href) {
    return (
      <Magnetic
        intensity={0.2}
        range={500}
        actionArea={{ type: "self" }}
        springOptions={{ stiffness: 500, damping: 50 }}
      >
        <a href={href} target={target} rel={rel} className={combinedClasses}>
          {content}
        </a>
      </Magnetic>
    );
  }

  return (
    <Magnetic
      intensity={0.3}
      range={500}
      actionArea={{ type: "self" }}
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      <button onClick={onClick} className={combinedClasses}>
        {content}
      </button>
    </Magnetic>
  );
}
