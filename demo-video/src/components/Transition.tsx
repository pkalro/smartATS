import React from "react";
import { interpolate } from "remotion";

/**
 * Simple fade-to-white cross-dissolve transition overlay.
 * Place at the end of each scene and beginning of the next.
 */
export function CrossFade({
  frame,
  totalFrames,
  fadeDuration = 18,
}: {
  frame: number;
  totalFrames: number;
  fadeDuration?: number;
}) {
  const fadeOut = interpolate(
    frame,
    [totalFrames - fadeDuration, totalFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const fadeIn = interpolate(
    frame,
    [0, fadeDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = Math.max(fadeOut, fadeIn);

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "white",
        opacity,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

/** Scene label that fades in briefly at scene start */
export function SceneLabel({
  frame,
  label,
  sub,
}: {
  frame: number;
  label: string;
  sub?: string;
}) {
  const opacity = interpolate(frame, [8, 22, 55, 72], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 999,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.05em",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {label}
      </span>
      {sub && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, system-ui, sans-serif" }}>
          {sub}
        </span>
      )}
    </div>
  );
}
