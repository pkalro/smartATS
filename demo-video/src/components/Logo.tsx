import React from "react";
import { colors } from "../lib/theme";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* Icon mark */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.25,
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
        }}
      >
        {/* Sparkle SVG */}
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L13.2 8.8L19 10L13.2 11.2L12 17L10.8 11.2L5 10L10.8 8.8Z"
            stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d="M19 3L19.6 5.4L22 6L19.6 6.6L19 9L18.4 6.6L16 6L18.4 5.4Z"
            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Wordmark */}
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.6,
          color: colors.text,
          letterSpacing: "-0.02em",
        }}
      >
        Smart<span style={{ color: colors.blue }}>ATS</span>
      </span>
    </div>
  );
}
