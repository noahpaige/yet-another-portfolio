"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface BottomNavProps {
  options: { name: string; icon: React.ElementType }[];
  current: string;
  onSelect: (section: string) => void;
}

export default function BottomNav({
  options,
  current,
  onSelect,
}: BottomNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [lockedHighlight, setLockedHighlight] = useState<string | null>(null);

  const displayHighlight = lockedHighlight ?? hovered ?? current;

  const handleClick = (option: string) => {
    setLockedHighlight(option); // Lock highlight here
    onSelect(option);

    // After animation completes, unlock highlight (adjust delay as needed)
    setTimeout(() => {
      setLockedHighlight(null);
    }, 700); // match scroll duration
  };
  return (
    <div className="fixed bottom-4 w-full flex justify-center z-50 h-14">
      <div className="relative flex gap-2 glass-layer p-2">
        {options.map((option) => {
          const isActive = option.name === current;
          const textColor = isActive ? "text-white" : "text-zinc-300/80";

          const IconComponent = option.icon;

          return (
            <button
              key={option.name}
              onClick={() => handleClick(option.name)}
              onMouseEnter={() => setHovered(option.name)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative px-4 py-2 rounded-md text-lg font-medium z-10
                transition-colors duration-200
                ${textColor}
                cursor-pointer
              `}
            >
              {displayHighlight === option.name && (
                <motion.div
                  layoutId="navHighlight"
                  className="absolute inset-0 glass-layer-light"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <IconComponent
                  className={`shrink-0 transition-colors w-[1.125em] h-[1.125em] ${
                    isActive && "stroke-3"
                  }`}
                />
                <span className="hidden sm:inline">{option.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
