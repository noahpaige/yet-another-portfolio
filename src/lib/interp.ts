type InterpolationType = "linear" | "ease-in" | "ease-out" | "spring";

interface InterpolationOptions {
  type: InterpolationType;
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export function interp(
  a: number,
  b: number,
  i: number,
  options: InterpolationOptions
): number {
  const clampedI = Math.max(0, Math.min(1, i));

  let eased: number;

  switch (options.type) {
    case "ease-in":
      eased = clampedI * clampedI;
      break;
    case "ease-out":
      eased = clampedI * (2 - clampedI);
      break;
    case "spring": {
      const { stiffness = 100, damping = 10, mass = 1 } = options;

      const omega = Math.sqrt(stiffness / mass);
      const zeta = damping / (2 * Math.sqrt(stiffness * mass));

      if (zeta < 1) {
        // Underdamped (bouncy)
        const envelope = Math.exp(-zeta * omega * clampedI);
        const theta = omega * Math.sqrt(1 - zeta * zeta) * clampedI;
        eased =
          1 -
          envelope *
            (Math.cos(theta) +
              (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(theta));
      } else {
        // Critically/overdamped fallback to linear
        eased = clampedI;
      }
      break;
    }
    case "linear":
    default:
      eased = clampedI;
      break;
  }

  return a + eased * (b - a);
}
