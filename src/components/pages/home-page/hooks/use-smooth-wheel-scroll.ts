import { RefObject, useEffect } from "react";

export function useSmoothWheelScroll(scrollRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling) return;
      isScrolling = true;

      const direction = e.deltaY > 0 ? 1 : -1;
      const scrollAmount = container.clientHeight;

      container.scrollBy({
        top: direction * scrollAmount,
        behavior: "smooth",
      });

      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 500); // Allow time for scroll animation to finish
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []); // ✅ `scrollRef` does not need to be in deps
}
