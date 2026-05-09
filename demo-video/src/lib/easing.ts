import { interpolate, spring, type SpringConfig } from "remotion";

export const SPRING: SpringConfig = {
  damping: 16,
  stiffness: 120,
  mass: 1,
  overshootClamping: false,
};

export const SPRING_SNAPPY: SpringConfig = {
  damping: 20,
  stiffness: 200,
  mass: 0.8,
  overshootClamping: true,
};

/** Ease a value in/out between 0 and 1 over `duration` frames starting at `start` */
export function ease(
  frame: number,
  start: number,
  duration: number,
): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  });
}

/** Fade in then hold then fade out */
export function fadeInOut(
  frame: number,
  inStart: number,
  inDur: number,
  outStart: number,
  outDur: number,
): number {
  const fadeIn = interpolate(frame, [inStart, inStart + inDur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [outStart, outStart + outDur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
}

/** Spring-based slide in from bottom */
export function springUp(frame: number, fps: number, delay = 0, config = SPRING) {
  return spring({ frame: frame - delay, fps, config });
}
