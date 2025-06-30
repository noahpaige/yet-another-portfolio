import { useMemo, useCallback } from "react";

/**
 * Generates a responsive CSS `clamp()` expression (in pixels) that scales between
 * a minimum and maximum value based on the viewport height and/or width.
 *
 * If both height and width ranges are provided, the clamp uses the smaller of the
 * two scaled values (i.e. `min(...)`) to stay conservative.
 *
 * @example
 * // Returns: "clamp(16px, calc(16px + min((100vh - 320px) * 0.5, (100vw - 375px) * 0.25)), 256px)"
 * const gap = useClampCSS(16, 256, 320, 800, 375, 1280);
 *
 * @param minPx - Minimum pixel value (e.g. 16)
 * @param maxPx - Maximum pixel value (e.g. 256)
 * @param minScreenHeightPx - Minimum screen height where scaling starts
 * @param maxScreenHeightPx - Maximum screen height where scaling stops
 * @param minScreenWidthPx - Minimum screen width where scaling starts
 * @param maxScreenWidthPx - Maximum screen width where scaling stops
 * @returns A valid CSS clamp() string using pixel units
 */
export function useClampCSS(
  minPx: number,
  maxPx: number,
  minScreenHeightPx: number,
  maxScreenHeightPx: number,
  minScreenWidthPx: number,
  maxScreenWidthPx: number
): string {
  const calculateClamp = useCallback(() => {
    if (
      maxScreenHeightPx <= minScreenHeightPx &&
      maxScreenWidthPx <= minScreenWidthPx
    ) {
      throw new Error(
        "At least one screen dimension must have a non-zero range."
      );
    }

    const range = maxPx - minPx;

    const vhSlope =
      maxScreenHeightPx !== minScreenHeightPx
        ? range / (maxScreenHeightPx - minScreenHeightPx)
        : 0;

    const vwSlope =
      maxScreenWidthPx !== minScreenWidthPx
        ? range / (maxScreenWidthPx - minScreenWidthPx)
        : 0;

    let preferredExpr = "";

    if (vhSlope > 0 && vwSlope > 0) {
      preferredExpr = `min((100vh - ${minScreenHeightPx}px) * ${vhSlope.toFixed(
        5
      )}, (100vw - ${minScreenWidthPx}px) * ${vwSlope.toFixed(5)})`;
    } else if (vhSlope > 0) {
      preferredExpr = `(100vh - ${minScreenHeightPx}px) * ${vhSlope.toFixed(
        5
      )}`;
    } else if (vwSlope > 0) {
      preferredExpr = `(100vw - ${minScreenWidthPx}px) * ${vwSlope.toFixed(5)}`;
    } else {
      preferredExpr = "0";
    }

    return `clamp(${minPx}px, calc(${minPx}px + ${preferredExpr}), ${maxPx}px)`;
  }, [
    minPx,
    maxPx,
    minScreenHeightPx,
    maxScreenHeightPx,
    minScreenWidthPx,
    maxScreenWidthPx,
  ]);

  return useMemo(() => calculateClamp(), [calculateClamp]);
}
