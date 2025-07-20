"use client";

import React from "react";
import Link from "next/link";
import { Home, Folder, Mail, MessageSquareQuote } from "lucide-react";

interface TopNavbarProps {
  currentPage?: "home" | "projects" | "blog" | "/?section=CONTACT";
}

export function TopNavbar({ currentPage }: TopNavbarProps) {
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
          <Link
            href="/blog"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === "blog"
                ? "glass-layer-light-hoverable text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <Link
            href="/?section=CONTACT"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
              currentPage === "/?section=CONTACT"
                ? "glass-layer-light-hoverable text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
