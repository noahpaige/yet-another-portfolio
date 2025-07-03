import { RefObject, useEffect, useRef } from "react";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean,
  isScrolling?: boolean,
  onProgrammaticScroll?: (targetSection: number) => void
) {
  const accumulatedScrollRef = useRef(0);
  const isWheelScrolling = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const direction = e.deltaY > 0 ? 1 : -1;
      const sectionHeight = container.clientHeight;
      const currentScrollTop = container.scrollTop;
      const currentSection = Math.round(currentScrollTop / sectionHeight);

      // Detect if this is likely a trackpad event
      // Trackpad events typically have smaller deltaY values and often have deltaX
      const isTrackpad = Math.abs(e.deltaY) < 50 || Math.abs(e.deltaX) > 0;

      if (isTrackpad) {
        // For trackpad, accumulate scroll amounts
        accumulatedScrollRef.current += e.deltaY;

        // Check if we've accumulated enough to move to the next/previous section
        const accumulatedThreshold = sectionHeight * 0.25; // 25% of section height

        if (Math.abs(accumulatedScrollRef.current) >= accumulatedThreshold) {
          const targetSection =
            currentSection + Math.sign(accumulatedScrollRef.current);

          // Immediately update navbar and query params
          if (onProgrammaticScroll) {
            onProgrammaticScroll(targetSection);
          }

          // Only scroll if not already scrolling
          if (!isWheelScrolling.current) {
            isWheelScrolling.current = true;

            const targetScrollTop = targetSection * sectionHeight;
            const maxScrollTop =
              container.scrollHeight - container.clientHeight;
            const clampedTargetScrollTop = Math.max(
              0,
              Math.min(maxScrollTop, targetScrollTop)
            );

            container.scrollTo({
              top: clampedTargetScrollTop,
              behavior: "smooth",
            });

            // Reset scrolling flag after animation
            setTimeout(() => {
              isWheelScrolling.current = false;
            }, 600);
          }

          // Reset accumulated scroll
          accumulatedScrollRef.current = 0;
        }
      } else {
        // For mouse wheel, use the original behavior (one section at a time)
        const targetSection = currentSection + direction;

        // Immediately update navbar and query params
        if (onProgrammaticScroll) {
          onProgrammaticScroll(targetSection);
        }

        // Only scroll if not already scrolling
        if (!isWheelScrolling.current) {
          isWheelScrolling.current = true;

          const targetScrollTop = targetSection * sectionHeight;
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const clampedTargetScrollTop = Math.max(
            0,
            Math.min(maxScrollTop, targetScrollTop)
          );

          container.scrollTo({
            top: clampedTargetScrollTop,
            behavior: "smooth",
          });

          // Reset scrolling flag after animation
          setTimeout(() => {
            isWheelScrolling.current = false;
          }, 600);
        }

        // Reset accumulated scroll for mouse wheel
        accumulatedScrollRef.current = 0;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scrollingManually, isScrolling, onProgrammaticScroll]);
}
