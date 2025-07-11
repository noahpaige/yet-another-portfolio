"use client";

import { ReactNode } from "react";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";

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

  const magneticContent = (
    <Magnetic
      intensity={0.15}
      range={500}
      actionArea={{ type: "parent" }}
      springOptions={{ stiffness: 500, damping: 50 }}
      className="w-full h-full flex items-center gap-2"
    >
      {children}
    </Magnetic>
  );

  const magneticWrapper = (
    <Magnetic
      intensity={0.2}
      range={500}
      actionArea={{ type: "self" }}
      springOptions={{ stiffness: 500, damping: 50 }}
    >
      {href ? (
        <a
          href={href}
          target={target}
          rel={rel}
          className={cn(baseClasses, className)}
        >
          {magneticContent}
        </a>
      ) : (
        <button onClick={onClick} className={cn(baseClasses, className)}>
          {magneticContent}
        </button>
      )}
    </Magnetic>
  );

  return magneticWrapper;
}
