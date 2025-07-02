import { RefObject, useEffect } from "react";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean,
  isScrolling?: boolean
) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isWheelScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If we're already scrolling from a previous wheel event, block
      if (isWheelScrolling) return;

      // Always allow wheel events to proceed, even during programmatic scrolling
      // This allows wheel to interrupt programmatic scrolling
      isWheelScrolling = true;

      const direction = e.deltaY > 0 ? 1 : -1;
      const scrollAmount = container.clientHeight;

      container.scrollBy({
        top: direction * scrollAmount,
        behavior: "smooth",
      });

      // Shorter timeout since we now have better scroll detection
      scrollTimeout = setTimeout(() => {
        isWheelScrolling = false;
      }, 600); // Reduced further since we have better coordination
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollingManually, isScrolling]); // Add isScrolling to dependencies
}
