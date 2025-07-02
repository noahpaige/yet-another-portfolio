import { RefObject, useEffect } from "react";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If we're programmatically scrolling, allow wheel to take over immediately
      if (scrollingManually) {
        // Don't block wheel events during programmatic scrolling
        // The scroll sections hook will handle the coordination
        return;
      }

      // If we're already scrolling from a previous wheel event, block
      if (isScrolling) return;

      isScrolling = true;

      const direction = e.deltaY > 0 ? 1 : -1;
      const scrollAmount = container.clientHeight;

      container.scrollBy({
        top: direction * scrollAmount,
        behavior: "smooth",
      });

      // Reduced timeout for better responsiveness
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 800); // Reduced from 1500ms to 800ms for better responsiveness
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollingManually]); // Add scrollingManually to dependencies
}
