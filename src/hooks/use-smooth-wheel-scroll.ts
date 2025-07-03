import { RefObject, useEffect, useRef } from "react";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean,
  isScrolling?: boolean,
  onProgrammaticScroll?: (targetSection: number) => void
) {
  const accumulatedScrollRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isWheelScrolling = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // If we're already scrolling from a previous wheel event, block
      if (isWheelScrolling) return;

      const direction = e.deltaY > 0 ? 1 : -1;

      // Detect if this is likely a trackpad event
      // Trackpad events typically have smaller deltaY values and often have deltaX
      const isTrackpad = Math.abs(e.deltaY) < 50 || Math.abs(e.deltaX) > 0;

      if (isTrackpad) {
        // For trackpad, accumulate scroll amounts
        accumulatedScrollRef.current += e.deltaY;

        // Only trigger scroll when we've accumulated enough to move to next section
        const sectionHeight = container.clientHeight;
        const currentScrollTop = container.scrollTop;
        const currentSection = Math.round(currentScrollTop / sectionHeight);

        // Check if we've accumulated enough to move to the next/previous section
        const accumulatedThreshold = sectionHeight * 0.25; // 25% of section height

        if (Math.abs(accumulatedScrollRef.current) >= accumulatedThreshold) {
          isWheelScrolling = true;

          const targetSection =
            currentSection + Math.sign(accumulatedScrollRef.current);
          const targetScrollTop = targetSection * sectionHeight;

          // Ensure we don't scroll beyond boundaries
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const clampedTargetScrollTop = Math.max(
            0,
            Math.min(maxScrollTop, targetScrollTop)
          );

          // Call the callback to update navbar and query params
          if (onProgrammaticScroll) {
            onProgrammaticScroll(targetSection);
          }

          container.scrollTo({
            top: clampedTargetScrollTop,
            behavior: "smooth",
          });

          // Reset accumulated scroll
          accumulatedScrollRef.current = 0;

          scrollTimeout = setTimeout(() => {
            isWheelScrolling = false;
          }, 600);
        }
      } else {
        // For mouse wheel, use the original behavior (one section at a time)
        isWheelScrolling = true;
        const sectionHeight = container.clientHeight;
        const scrollAmount = sectionHeight;
        const currentScrollTop = container.scrollTop;
        const currentSection = Math.round(currentScrollTop / sectionHeight);
        const targetSection = currentSection + direction;

        // Call the callback to update navbar and query params
        if (onProgrammaticScroll) {
          onProgrammaticScroll(targetSection);
        }

        container.scrollBy({
          top: direction * scrollAmount,
          behavior: "smooth",
        });

        // Reset accumulated scroll for mouse wheel
        accumulatedScrollRef.current = 0;

        scrollTimeout = setTimeout(() => {
          isWheelScrolling = false;
        }, 600);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [scrollingManually, isScrolling, onProgrammaticScroll]);
}
