import React from "react";

export function ScoreChip({ score, large = false }: { score: number; large?: boolean }) {
  const color =
    score >= 75 ? { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" } :
    score >= 50 ? { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" } :
                  { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color.bg, color: color.text,
      border: `1px solid ${color.border}`,
      borderRadius: 999,
      paddingLeft: large ? 14 : 8,
      paddingRight: large ? 14 : 8,
      paddingTop: large ? 5 : 2,
      paddingBottom: large ? 5 : 2,
      fontSize: large ? 16 : 11,
      fontWeight: 700,
    }}>
      <svg width={large ? 14 : 10} height={large ? 14 : 10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
      {score}
    </div>
  );
}

export function ScoreBar({ score, delay = 0, frame = 0 }: { score: number; delay?: number; frame: number }) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 75 ? "#10B981" :
    pct >= 50 ? "#F59E0B" :
                "#EF4444";

  // Animate width in
  const animFrame = Math.max(0, frame - delay);
  const progress = Math.min(1, animFrame / 30);
  const eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

  return (
    <div style={{ width: "100%", height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${pct * eased}%`,
        background: `linear-gradient(90deg, ${color}CC, ${color})`,
        borderRadius: 99,
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}
