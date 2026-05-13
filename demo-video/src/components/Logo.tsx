import React from "react";

/**
 * Optichire logo for Remotion video.
 * Aperture icon (optic + hire metaphor) + "optic hire" wordmark.
 */
export function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  const fontSize = size * 0.55;
  const gap = size * 0.32;

  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {/* Aperture icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0EA5E9" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow disc */}
        <circle cx="24" cy="24" r="23" fill="url(#logo-glow)" />

        {/* Outer ring */}
        <circle cx="24" cy="24" r="21" stroke="url(#logo-g)" strokeWidth="2.5" />

        {/* 6 aperture chords */}
        {([
          [28.62, 16,    40.10, 35.88],
          [19.38, 16,    42.34, 16   ],
          [14.76, 24,    26.24, 4.12 ],
          [19.38, 32,    7.90,  12.12],
          [28.62, 32,    5.66,  32   ],
          [33.24, 24,    21.76, 43.88],
        ] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="url(#logo-g)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}

        {/* Centre iris */}
        <circle cx="24" cy="24" r="5.5" fill="url(#logo-g)" opacity="0.2" />
        <circle cx="24" cy="24" r="3"   fill="url(#logo-g)" />
        <circle cx="24" cy="24" r="1.2" fill="white" />
      </svg>

      {/* Wordmark: optic (light) + hire (bold) */}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          display: "flex",
          gap: 0,
        }}
      >
        <span style={{ fontWeight: 500, color: light ? "rgba(255,255,255,0.85)" : "#0F172A" }}>optic</span>
        <span style={{ fontWeight: 800, color: light ? "#ffffff" : "#0F172A" }}>hire</span>
      </span>
    </div>
  );
}
