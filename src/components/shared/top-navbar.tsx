"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Folder, Mail, MessageSquareQuote } from "lucide-react";

interface TopNavbarProps {
  currentPage?: "home" | "projects" | "blog" | "/?section=CONTACT";
}

export function TopNavbar({ currentPage }: TopNavbarProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [lockedHighlight, setLockedHighlight] = useState<string | null>(null);
  const navbarRef = useRef<HTMLElement>(null);

  // Set CSS custom property for navbar height
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navbarRef.current) {
        const height = navbarRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${height}px`
        );
      }
    };

    // Update on mount
    updateNavbarHeight();

    // Update on window resize
    window.addEventListener("resize", updateNavbarHeight);

    // Update after a short delay to ensure all styles are applied
    const timeoutId = setTimeout(updateNavbarHeight, 100);

    return () => {
      window.removeEventListener("resize", updateNavbarHeight);
      clearTimeout(timeoutId);
    };
  }, []);

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

  // Find if current page matches any nav item
  const currentNavItem = navItems.find((item) => item.name === currentPage);

  // Use current page if it exists, otherwise use hovered state
  const displayHighlight =
    lockedHighlight ?? hovered ?? (currentNavItem ? currentPage : null);

  const handleClick = (href: string, pageName: string) => {
    setLockedHighlight(pageName);

    // After animation completes, unlock highlight
    setTimeout(() => {
      setLockedHighlight(null);
    }, 700);
  };

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 right-0 z-50 p-4 glass-layer rounded-none"
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home Link */}
        <Link
          href="/"
          className="text-zinc-100 hover:text-zinc-300 transition-colors duration-200"
        >
          <span className="font-space-mono font-bold text-lg">Noah Paige</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 relative">
          {/* Hidden dummy element for animation reference when no current page */}
          {!currentNavItem && !hovered && (
            <motion.div
              layoutId="topNavHighlight"
              className="absolute opacity-0 pointer-events-none"
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "90px",
                height: "36px",
                zIndex: -1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
          )}

          {navItems.map((item) => {
            const isActive = item.name === currentPage;
            const textColor = isActive ? "text-white" : "text-zinc-300/80";
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
