import { RefObject, useEffect, useRef } from "react";
import { SCROLL_CONFIG } from "./use-scroll-sections";

export function useSmoothWheelScroll(
  scrollRef: RefObject<HTMLElement>,
  scrollingManually?: boolean,
  isScrolling?: boolean,
  onProgrammaticScroll?: (targetSection: number) => void
) {
  const accumulatedScrollRef = useRef(0);
  const lastThrottleTimeRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();

      // Detect if this is likely a trackpad event (more sophisticated detection)
      const isTrackpad =
        Math.abs(e.deltaY) < 50 ||
        Math.abs(e.deltaX) > 0 ||
        now - lastWheelTimeRef.current < 20; // High frequency events are likely trackpad
      lastWheelTimeRef.current = now;

      // Use different throttle times for trackpad vs mouse wheel
      const throttleTime = isTrackpad
        ? SCROLL_CONFIG.TRACKPAD_THROTTLE_MS
        : SCROLL_CONFIG.WHEEL_THROTTLE_MS;
      if (now - lastThrottleTimeRef.current < throttleTime) {
        return;
      }
      lastThrottleTimeRef.current = now;

      const direction = e.deltaY > 0 ? 1 : -1;
      const sectionHeight = container.clientHeight;
      const currentScrollTop = container.scrollTop;
      const currentSection = Math.round(currentScrollTop / sectionHeight);

      if (isTrackpad) {
        // For trackpads, accumulate scroll to prevent accidental multi-section jumps
        accumulatedScrollRef.current += e.deltaY;
        const accumulatedThreshold =
          sectionHeight * SCROLL_CONFIG.ACCUMULATED_THRESHOLD_FRAC;

        if (Math.abs(accumulatedScrollRef.current) >= accumulatedThreshold) {
          const targetSection =
            currentSection + Math.sign(accumulatedScrollRef.current);
          const maxSection = Math.floor(
            (container.scrollHeight - container.clientHeight) / sectionHeight
          );
          const clampedTargetSection = Math.max(
            0,
            Math.min(maxSection, targetSection)
          );

          if (clampedTargetSection !== currentSection) {
            if (onProgrammaticScroll) {
              onProgrammaticScroll(clampedTargetSection);
            }
            const targetScrollTop = clampedTargetSection * sectionHeight;
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
          }
          accumulatedScrollRef.current = 0;
        }
      } else {
        // For mouse wheels, immediate section change
        const targetSection = currentSection + direction;
        const maxSection = Math.floor(
          (container.scrollHeight - container.clientHeight) / sectionHeight
        );
        const clampedTargetSection = Math.max(
          0,
          Math.min(maxSection, targetSection)
        );

        if (clampedTargetSection !== currentSection) {
          if (onProgrammaticScroll) {
            onProgrammaticScroll(clampedTargetSection);
          }
          const targetScrollTop = clampedTargetSection * sectionHeight;
          const maxScrollTop = container.scrollHeight - container.clientHeight;
          const clampedTargetScrollTop = Math.max(
            0,
            Math.min(maxScrollTop, targetScrollTop)
          );
          container.scrollTo({
            top: clampedTargetScrollTop,
            behavior: "smooth",
          });
        }
        accumulatedScrollRef.current = 0;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [onProgrammaticScroll, scrollRef]);
}
