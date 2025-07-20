"use client";

import React from "react";
import Link from "next/link";
import { Home, Folder } from "lucide-react";

interface TopNavbarProps {
  currentPage?: "home" | "projects";
}

export function TopNavbar({ currentPage }: TopNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Home Link */}
        <Link
          href="/"
          className="text-zinc-100 hover:text-zinc-300 transition-colors duration-200"
        >
          <span className="font-space-mono font-bold text-lg">Noah Paige</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === "home"
                ? "glass-layer-light-hoverable text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <Link
            href="/projects"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === "projects"
                ? "glass-layer-light-hoverable text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
