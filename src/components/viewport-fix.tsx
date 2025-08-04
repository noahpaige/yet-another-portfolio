"use client";
import { useEffect, useRef } from "react";

// Detect iOS Safari
const isIOSSafari = () => {
  if (typeof window === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent)
  );
};

// Detect mobile browsers
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function ViewportHeightFix() {
  const lastHeight = useRef<number>(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const setVH = () => {
      const currentHeight = window.innerHeight;

      // Only update if height actually changed (prevents unnecessary updates)
      if (currentHeight === lastHeight.current) return;

      lastHeight.current = currentHeight;

      // Set the CSS variable
      document.documentElement.style.setProperty(
        "--real-vh",
        `${currentHeight}px`
      );

      console.log("📱 Viewport height updated:", {
        height: currentHeight,
        isIOS: isIOSSafari(),
        isMobile: isMobile(),
        userAgent: navigator.userAgent,
      });
    };

    // Debounced resize handler for better performance
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Use a shorter timeout for iOS Safari to handle address bar changes
      const timeout = isIOSSafari() ? 100 : 250;

      resizeTimeoutRef.current = setTimeout(() => {
        setVH();
      }, timeout);
    };

    // Initial setup
    setVH();

    // Add event listeners
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, {
      passive: true,
    });

    // iOS Safari specific: Listen for visual viewport changes
    if (isIOSSafari() && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize, {
        passive: true,
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);

      if (isIOSSafari() && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return null;
}
