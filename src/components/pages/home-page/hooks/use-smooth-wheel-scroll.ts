import { RefObject, useEffect } from "react";

export function useSmoothWheelScroll(scrollRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let lastScrollTime = 0;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime < 100) return;
      lastScrollTime = now;

      const direction = e.deltaY > 0 ? 1 : -1;
      const scrollAmount = container.clientHeight; // scroll one full section

      container.scrollBy({
        top: direction * scrollAmount,
        behavior: "smooth",
      });

      // throttle further scrolls
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        lastScrollTime = 0;
      }, 200);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scrollRef]);
}
