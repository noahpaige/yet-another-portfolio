import { RefObject, useEffect, useRef } from "react";
import { SCROLL_CONFIG } from "./use-scroll-sections";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean,
  isScrolling?: boolean,
  onProgrammaticScroll?: (targetSection: number) => void
) {
  const accumulatedScrollRef = useRef(0);
  const isWheelScrolling = useRef(false);
  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Don't process wheel events if we're already scrolling programmatically
      if (scrollingManually || isScrolling || isWheelScrolling.current) {
        return;
      }

      // Debounce rapid wheel events
      const now = Date.now();
      if (now - lastWheelTimeRef.current < SCROLL_CONFIG.WHEEL_DEBOUNCE_MS) {
        return;
      }
      lastWheelTimeRef.current = now;

      const direction = e.deltaY > 0 ? 1 : -1;
      const sectionHeight = container.clientHeight;
      const currentScrollTop = container.scrollTop;
      const currentSection = Math.round(currentScrollTop / sectionHeight);

      // Detect if this is likely a trackpad event
      const isTrackpad = Math.abs(e.deltaY) < 50 || Math.abs(e.deltaX) > 0;

      if (isTrackpad) {
        accumulatedScrollRef.current += e.deltaY;
        const accumulatedThreshold = sectionHeight * SCROLL_CONFIG.ACCUMULATED_THRESHOLD_FRAC;

        if (Math.abs(accumulatedScrollRef.current) >= accumulatedThreshold) {
          const targetSection = currentSection + Math.sign(accumulatedScrollRef.current);
          const maxSection = Math.floor((container.scrollHeight - container.clientHeight) / sectionHeight);
          const clampedTargetSection = Math.max(0, Math.min(maxSection, targetSection));

          if (clampedTargetSection !== currentSection) {
            isWheelScrolling.current = true;
            if (onProgrammaticScroll) {
              onProgrammaticScroll(clampedTargetSection);
            }
            const targetScrollTop = clampedTargetSection * sectionHeight;
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            const clampedTargetScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
            container.scrollTo({
              top: clampedTargetScrollTop,
              behavior: "smooth",
            });
            setTimeout(() => {
              isWheelScrolling.current = false;
            }, SCROLL_CONFIG.ANIMATION_DURATION + SCROLL_CONFIG.ANIMATION_BUFFER);
          }
          accumulatedScrollRef.current = 0;
        }
      } else {
        const targetSection = currentSection + direction;
        const maxSection = Math.floor((container.scrollHeight - container.clientHeight) / sectionHeight);
        const clampedTargetSection = Math.max(0, Math.min(maxSection, targetSection));
        if (clampedTargetSection !== currentSection) {
          isWheelScrolling.current = true;
          if (onProgrammaticScroll) {
            onProgrammaticScroll(clampedTargetSection);
          }
          const targetScrollTop = clampedTargetSection * sectionHeight;
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const clampedTargetScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
          container.scrollTo({
            top: clampedTargetScrollTop,
            behavior: "smooth",
          });
          setTimeout(() => {
            isWheelScrolling.current = false;
          }, SCROLL_CONFIG.ANIMATION_DURATION + SCROLL_CONFIG.ANIMATION_BUFFER);
        }
        accumulatedScrollRef.current = 0;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [scrollingManually, isScrolling, onProgrammaticScroll]);
}
