"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Folder, Mail, MessageSquareQuote } from "lucide-react";

interface TopNavbarProps {
  currentPage?: "home" | "projects" | "blog" | "/?section=CONTACT";
}

export function TopNavbar({ currentPage }: TopNavbarProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [lockedHighlight, setLockedHighlight] = useState<string | null>(null);

  const navItems = [
    { href: "/", name: "home", icon: Home, label: "Home" },
    { href: "/projects", name: "projects", icon: Folder, label: "Projects" },
    { href: "/blog", name: "blog", icon: MessageSquareQuote, label: "Blog" },
    {
      href: "/?section=CONTACT",
      name: "/?section=CONTACT",
      icon: Mail,
      label: "Contact",
    },
  ];

  const displayHighlight = lockedHighlight ?? hovered ?? currentPage;

  const handleClick = (href: string, pageName: string) => {
    setLockedHighlight(pageName);

    // After animation completes, unlock highlight
    setTimeout(() => {
      setLockedHighlight(null);
    }, 700);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 glass-layer rounded-none">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home Link */}
        <Link
          href="/"
          className="text-zinc-100 hover:text-zinc-300 transition-colors duration-200"
        >
          <span className="font-space-mono font-bold text-lg">Noah Paige</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = item.name === currentPage;
            const isHovered = item.name === hovered;
            const textColor =
              isHovered || isActive ? "text-white" : "text-zinc-300/80";
            const IconComponent = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleClick(item.href, item.name)}
                onMouseEnter={() => setHovered(item.name)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  relative px-3 py-2 rounded-lg text-sm font-medium z-10
                  transition-colors duration-200
                  ${textColor}
                  cursor-pointer
                `}
              >
                {displayHighlight === item.name && (
                  <motion.div
                    layoutId="topNavHighlight"
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
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isActive && "stroke-3"
                    }`}
                  />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
