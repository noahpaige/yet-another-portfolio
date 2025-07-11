import { RefObject, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Simplified Scroll State Machine
export enum ScrollState {
  IDLE = "idle",
  SCROLLING = "scrolling",
  ERROR = "error",
}

// Scroll Status Interface
export interface ScrollStatus {
  state: ScrollState;
  target?: string;
  progress?: number;
  error?: string;
}

// Scroll Operation Interface
interface ScrollOperation {
  target: string;
  startTime: number;
  isCancelled: boolean;
}

// Centralized config for scroll and section behavior
export const SCROLL_CONFIG = {
  // Timeouts (ms)
  FALLBACK: 3000,
  SECTION_DETECTION_DEBOUNCE: 50, // Reduced for more responsive updates
  URL_DEBOUNCE: 150, // Only for programmatic scroll URL updates
  PROGRESS_UPDATE_INTERVAL: 50,
  // Thresholds
  VISIBILITY_THRESHOLD: 0.5, // Section must be 50% visible to be considered active
  CENTER_THRESHOLD: 0.3, // Section center must be within 30% of container center
} as const;

export function useScrollSections(
  sectionIds: string[],
  scrollRef: RefObject<HTMLDivElement>
) {
  // Core state
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const [scrollStatus, setScrollStatus] = useState<ScrollStatus>({
    state: ScrollState.IDLE,
  });

  // Refs
  const currentOperationRef = useRef<ScrollOperation | null>(null);
  const sectionDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);
  const isManualUrlUpdateRef = useRef(false);
  const scrollDetectionFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true); // Track component mount state
  const deepLinkOperationRef = useRef<string | null>(null); // Track deep link operations atomically

  // Router and search params
  const searchParams = useSearchParams();
  const router = useRouter();

  // Clear all timeouts and intervals
  const clearAllTimers = useCallback(() => {
    const timers = [
      sectionDetectionTimeoutRef.current,
      urlUpdateTimeoutRef.current,
      progressIntervalRef.current,
    ];

    timers.forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });

    if (scrollDetectionFrameRef.current) {
      cancelAnimationFrame(scrollDetectionFrameRef.current);
    }

    // Reset all refs
    sectionDetectionTimeoutRef.current = null;
    urlUpdateTimeoutRef.current = null;
    progressIntervalRef.current = null;
    scrollDetectionFrameRef.current = null;
  }, []);

  // Cancel current scroll operation safely
  const cancelCurrentOperation = useCallback(() => {
    if (currentOperationRef.current) {
      currentOperationRef.current.isCancelled = true;
      // Don't reject the promise, just mark as cancelled
      currentOperationRef.current = null;
    }
  }, []);

  // URL management - immediate for manual scroll, debounced for programmatic
  const updateURL = useCallback(
    (section: string, isManualScroll: boolean = false) => {
      if (!isMountedRef.current) return;

      const updateUrlParams = () => {
        const params = new URLSearchParams(window.location.search);
        params.set("section", section);
        router.replace(`?${params.toString()}`);
      };

      if (isManualScroll) {
        updateUrlParams();
      } else {
        if (urlUpdateTimeoutRef.current) {
          clearTimeout(urlUpdateTimeoutRef.current);
        }
        urlUpdateTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            updateUrlParams();
          }
        }, SCROLL_CONFIG.URL_DEBOUNCE);
      }
    },
    [router]
  );

  // Optimized section detection using visibility and center position
  const detectActiveSection = useCallback(() => {
    if (!isMountedRef.current) return; // Don't detect if component is unmounted

    const container = scrollRef.current;
    if (!container) return;

    // Don't detect sections during programmatic scroll
    if (scrollStatus.state === ScrollState.SCROLLING) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;
    let bestSection: string | null = null;
    let bestScore = -1;

    for (const sectionId of sectionIds) {
      const el = document.getElementById(`section-${sectionId}`);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;

      // Calculate how much of the section is visible
      const visibleTop = Math.max(rect.top, containerRect.top);
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityPercentage = visibleHeight / rect.height;

      // Calculate distance from container center (closer = better)
      const centerDistance = Math.abs(sectionCenter - containerCenter);
      const centerScore = Math.max(
        0,
        1 - centerDistance / (containerRect.height * 0.5)
      );

      // Combined score: prioritize sections that are both visible and centered
      // Use a more aggressive scoring for immediate feedback
      const combinedScore = visibilityPercentage * centerScore;

      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestSection = sectionId;
      }
    }

    // Update if we found a better section - use a lower threshold for immediate feedback
    if (bestSection && bestSection !== activeSection && bestScore > 0.1) {
      setActiveSection(bestSection);

      // Update URL without triggering scroll - use immediate update for manual scroll
      // Atomic operation: set flag and update URL atomically
      isManualUrlUpdateRef.current = true;
      const params = new URLSearchParams(window.location.search);
      params.set("section", bestSection);
      router.replace(`?${params.toString()}`);

      // Reset the flag after a short delay, but only if no other URL update is in progress
      setTimeout(() => {
        if (isMountedRef.current && isManualUrlUpdateRef.current) {
          isManualUrlUpdateRef.current = false;
        }
      }, 100);
    }
  }, [sectionIds, activeSection, scrollRef, router, scrollStatus.state]);

  // Simplified scroll completion verification
  const verifyScrollCompletion = useCallback(
    (target: string, container: HTMLElement): boolean => {
      const targetEl = document.getElementById(`section-${target}`);
      if (!targetEl) return false;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Check if target is visible and centered
      const visibleTop = Math.max(targetRect.top, containerRect.top);
      const visibleBottom = Math.min(targetRect.bottom, containerRect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityPercentage = visibleHeight / targetRect.height;

      const containerCenter = containerRect.top + containerRect.height / 2;
      const sectionCenter = targetRect.top + targetRect.height / 2;
      const centerDistance = Math.abs(sectionCenter - containerCenter);
      const isCentered =
        centerDistance < containerRect.height * SCROLL_CONFIG.CENTER_THRESHOLD;

      return (
        visibilityPercentage > SCROLL_CONFIG.VISIBILITY_THRESHOLD && isCentered
      );
    },
    []
  );

  // Execute scroll with progress tracking
  const executeScroll = useCallback(
    async (target: string): Promise<boolean> => {
      if (!isMountedRef.current) return false; // Don't execute if unmounted

      const container = scrollRef.current;
      if (!container) return false;

      const targetEl = document.getElementById(`section-${target}`);
      if (!targetEl) return false;

      // Atomic operation: check and set current operation atomically
      if (currentOperationRef.current) {
        return false;
      }

      // Create scroll operation
      const operation: ScrollOperation = {
        target,
        startTime: Date.now(),
        isCancelled: false,
      };

      // Atomic assignment
      currentOperationRef.current = operation;

      try {
        // Update scroll status
        setScrollStatus({
          state: ScrollState.SCROLLING,
          target,
          progress: 0,
        });

        // Start progress tracking
        progressIntervalRef.current = setInterval(() => {
          if (!isMountedRef.current || operation.isCancelled) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return;
          }

          if (operation.target) {
            const targetEl = document.getElementById(
              `section-${operation.target}`
            );
            if (targetEl) {
              const containerRect = container.getBoundingClientRect();
              const targetRect = targetEl.getBoundingClientRect();
              const targetTop = targetRect.top - containerRect.top;
              const progressPercent =
                ((containerRect.height - targetTop) / containerRect.height) *
                100;
              const clampedProgress = Math.max(
                0,
                Math.min(100, progressPercent)
              );

              setScrollStatus((prev) => ({
                ...prev,
                progress: Math.round(clampedProgress),
              }));
            }
          }
        }, SCROLL_CONFIG.PROGRESS_UPDATE_INTERVAL);

        // Execute scroll
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Wait for scroll to complete
        const isCompleted = await new Promise<boolean>((resolve) => {
          const checkCompletion = () => {
            // Check if operation was cancelled
            if (!isMountedRef.current || operation.isCancelled) {
              resolve(false);
              return;
            }

            const completed = verifyScrollCompletion(target, container);
            if (completed) {
              resolve(true);
            } else if (
              Date.now() - operation.startTime >
              SCROLL_CONFIG.FALLBACK
            ) {
              resolve(false);
            } else {
              setTimeout(checkCompletion, 100);
            }
          };
          checkCompletion();
        });

        // Clear progress tracking
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Check if operation was cancelled
        if (!isMountedRef.current || operation.isCancelled) {
          return false;
        }

        if (isCompleted) {
          setScrollStatus({
            state: ScrollState.IDLE,
            target,
            progress: 100,
          });
          return true;
        } else {
          throw new Error("Scroll failed - target not reached within timeout");
        }
      } catch (error) {
        // Clear progress tracking
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        setScrollStatus({
          state: ScrollState.ERROR,
          target,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Reset to idle after error
        setTimeout(() => {
          if (isMountedRef.current) {
            setScrollStatus({ state: ScrollState.IDLE });
          }
        }, 1000);

        return false;
      } finally {
        // Clean up operation
        currentOperationRef.current = null;
      }
    },
    [scrollRef, verifyScrollCompletion]
  );

  // Main scroll function
  const scrollToSection = useCallback(
    async (section: string) => {
      if (!isMountedRef.current) return false; // Don't scroll if unmounted

      // Cancel any existing operation gracefully
      if (currentOperationRef.current) {
        currentOperationRef.current.isCancelled = true;
        currentOperationRef.current = null;
      }

      // Update active section immediately for UI responsiveness
      setActiveSection(section);
      updateURL(section, false); // Mark as programmatic scroll update

      // Execute scroll operation
      const success = await executeScroll(section);

      return success;
    },
    [executeScroll, updateURL]
  );

  // Programmatic scroll handler
  const handleProgrammaticScroll = useCallback(
    (targetSectionIndex: number) => {
      if (!isMountedRef.current) return; // Don't handle if unmounted

      if (targetSectionIndex >= 0 && targetSectionIndex < sectionIds.length) {
        const targetSection = sectionIds[targetSectionIndex];
        scrollToSection(targetSection);
      }
    },
    [sectionIds, scrollToSection]
  );

  // Simplified scroll event handler
  const handleScroll = useCallback(() => {
    if (!isMountedRef.current) return; // Don't handle if unmounted

    const container = scrollRef.current;
    if (!container) return;

    // Don't handle manual scroll detection during programmatic scrolls
    if (scrollStatus.state === ScrollState.SCROLLING) return;

    const currentScrollTop = container.scrollTop;
    const isCurrentlyScrolling =
      Math.abs(currentScrollTop - lastScrollTopRef.current) > 1;

    if (isCurrentlyScrolling) {
      // Use requestAnimationFrame for smooth throttled detection
      if (scrollDetectionFrameRef.current) {
        cancelAnimationFrame(scrollDetectionFrameRef.current);
      }

      scrollDetectionFrameRef.current = requestAnimationFrame(() => {
        if (isMountedRef.current) {
          detectActiveSection();
        }
      });

      // Clear existing detection timeout
      if (sectionDetectionTimeoutRef.current) {
        clearTimeout(sectionDetectionTimeoutRef.current);
      }

      // Set new timeout for final section detection when scrolling stops
      sectionDetectionTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          // Final detection to ensure accuracy
          detectActiveSection();
        }
      }, SCROLL_CONFIG.SECTION_DETECTION_DEBOUNCE);
    }

    lastScrollTopRef.current = currentScrollTop;
  }, [scrollRef, detectActiveSection, scrollStatus.state]);

  // Touch event handler for iOS
  const handleTouchStart = useCallback(() => {
    if (!isMountedRef.current) return; // Don't handle if unmounted

    if (scrollStatus.state !== ScrollState.IDLE) {
      // User interrupted programmatic scroll
      cancelCurrentOperation();

      // Clear any pending timeouts and animation frames
      if (sectionDetectionTimeoutRef.current) {
        clearTimeout(sectionDetectionTimeoutRef.current);
        sectionDetectionTimeoutRef.current = null;
      }

      if (scrollDetectionFrameRef.current) {
        cancelAnimationFrame(scrollDetectionFrameRef.current);
        scrollDetectionFrameRef.current = null;
      }

      setScrollStatus({ state: ScrollState.IDLE });
    }
  }, [scrollStatus.state, cancelCurrentOperation]);

  // Set up scroll event listeners
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, [scrollRef, handleScroll, handleTouchStart]);

  // Handle initial deep link - use atomic operation tracking
  useEffect(() => {
    if (!isMountedRef.current) return; // Don't handle if unmounted

    const selected = searchParams.get("section");

    // Atomic check: only proceed if we have a valid section and no deep link operation is in progress
    if (
      selected &&
      sectionIds.includes(selected) &&
      selected !== activeSection &&
      !deepLinkOperationRef.current && // Atomic check for ongoing deep link operation
      scrollStatus.state === ScrollState.IDLE && // Only run when not already scrolling
      !isManualUrlUpdateRef.current // Don't run if URL was updated by manual scroll detection
    ) {
      // Atomically mark this deep link operation as in progress
      deepLinkOperationRef.current = selected;

      // Use the same scrollToSection function for consistency
      scrollToSection(selected).finally(() => {
        // Clear the operation reference when done (success or failure)
        if (isMountedRef.current) {
          deepLinkOperationRef.current = null;
        }
      });
    }
  }, [
    searchParams,
    sectionIds,
    activeSection,
    scrollToSection,
    scrollStatus.state,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Mark component as unmounted first
      isMountedRef.current = false;

      // Cancel current operation without rejecting
      cancelCurrentOperation();

      // Clear all timers
      clearAllTimers();

      // Reset flags
      isManualUrlUpdateRef.current = false;
      deepLinkOperationRef.current = null;
    };
  }, [clearAllTimers, cancelCurrentOperation]);

  return {
    activeSection,
    scrollToSection,
    scrollStatus,
    handleProgrammaticScroll,
  };
}
