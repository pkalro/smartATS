/**
 * Scene 6 — Market Intelligence
 * Duration: 210 frames (7s @ 30fps)
 * Shows: salary benchmarks, talent scarcity, competitor landscape
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppShell } from "../components/AppShell";
import { colors } from "../lib/theme";

const SALARY_BANDS = [
  { label: "P25", value: 22, pct: 44 },
  { label: "P50 (Median)", value: 30, pct: 60 },
  { label: "P75", value: 40, pct: 80 },
  { label: "P90", value: 55, pct: 100 },
];

const SOURCES = [
  { label: "LinkedIn",  pct: 48, color: "#0A66C2" },
  { label: "Naukri",   pct: 31, color: "#FF6600" },
  { label: "Referral", pct: 14, color: "#7C3AED" },
  { label: "Inbound",  pct: 7,  color: "#10B981" },
];

function AnimBar({ pct, color, frame, delay }: { pct: number; color: string; frame: number; delay: number }) {
  const w = interpolate(frame, [delay, delay + 40], [0, pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ flex: 1, height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${w}%`,
        background: color,
        borderRadius: 99,
      }} />
    </div>
  );
}

export function MarketIntelScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageSpring = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  function cardSpring(delay: number) {
    return {
      opacity: interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      transform: `translateY(${(1 - spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } })) * 16}px)`,
    };
  }

  const calloutOpacity = interpolate(frame, [170, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AppShell activeNav="jobs">
      <div style={{
        height: "100%", display: "flex", flexDirection: "column", gap: 16,
        opacity: pageSpring,
        transform: `translateY(${(1 - pageSpring) * 16}px)`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: titleOpacity }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #06B6D4, #10B981)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(6,182,212,0.3)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
              <polyline points="3 17 9 11 13 15 21 7"/>
              <polyline points="15 7 21 7 21 13"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Market Intelligence</div>
            <div style={{ fontSize: 13, color: colors.textSub }}>Senior Backend Engineer · Bengaluru · Generated now</div>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flex: 1 }}>
          {/* Salary benchmarks */}
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #E2E8F0",
            padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            ...cardSpring(20),
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 4 }}>💰 Salary Benchmarks</div>
            <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 16 }}>Annual CTC (₹L) · India</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SALARY_BANDS.map((b, i) => {
                const barDelay = 30 + i * 18;
                const w = interpolate(frame, [barDelay, barDelay + 35], [0, b.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const isMedian = b.label.includes("Median");
                return (
                  <div key={b.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, fontWeight: isMedian ? 700 : 400, color: isMedian ? "#2563EB" : colors.textMut }}>{b.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isMedian ? "#2563EB" : colors.text }}>₹{b.value}L</span>
                    </div>
                    <div style={{ height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${w}%`,
                        background: isMedian ? "linear-gradient(90deg, #2563EB, #7C3AED)" : "#CBD5E1",
                        borderRadius: 99,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 14, padding: "8px 12px",
              background: "#EFF6FF", borderRadius: 8,
              fontSize: 10, color: "#1D4ED8", fontWeight: 600,
            }}>
              Your offer ₹40L — above median ✓
            </div>
          </div>

          {/* Talent Scarcity */}
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #E2E8F0",
            padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            ...cardSpring(35),
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 4 }}>🎯 Talent Scarcity</div>
            <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 20 }}>Skill availability in market</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { skill: "Node.js", level: "Common",    color: "#10B981", pct: 72 },
                { skill: "AWS",     level: "Moderate",  color: "#F59E0B", pct: 48 },
                { skill: "Kafka",   level: "Scarce",    color: "#EF4444", pct: 22 },
                { skill: "Rust",    level: "Very scarce", color: "#991B1B", pct: 8 },
              ].map((s, i) => {
                const barDelay = 50 + i * 20;
                const w = interpolate(frame, [barDelay, barDelay + 35], [0, s.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={s.skill}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>{s.skill}</span>
                      <span style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.level}</span>
                    </div>
                    <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${w}%`, background: s.color, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: 14, padding: "8px 12px",
              background: "#FFF7ED", borderRadius: 8,
              fontSize: 10, color: "#C2410C", fontWeight: 600,
            }}>
              ⚠ Kafka skills scarce — widen search
            </div>
          </div>

          {/* Sourcing & insights */}
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #E2E8F0",
            padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            ...cardSpring(50),
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.text, marginBottom: 4 }}>📍 Where to Find Them</div>
            <div style={{ fontSize: 11, color: colors.textSub, marginBottom: 16 }}>Top sourcing channels</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SOURCES.map((s, i) => {
                const barDelay = 65 + i * 18;
                const w = interpolate(frame, [barDelay, barDelay + 35], [0, s.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 56, fontSize: 10, fontWeight: 600, color: colors.text }}>{s.label}</span>
                    <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${w}%`, background: s.color, borderRadius: 99, opacity: 0.85 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: colors.textSub, width: 28, textAlign: "right" }}>{s.pct}%</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "💡 LinkedIn best for Sr. ICs",
                "💡 Referrals → faster hires",
                "💡 Avg. time-to-hire: 23 days",
              ].map((tip, i) => {
                const tipOpacity = interpolate(frame, [120 + i * 15, 140 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={tip} style={{ fontSize: 10, color: colors.textSub, opacity: tipOpacity }}>{tip}</div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Callout */}
        <div style={{
          position: "absolute", bottom: 40, right: 60,
          background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
          border: "1px solid #BFDBFE",
          borderRadius: 14, padding: "12px 18px",
          opacity: calloutOpacity,
          boxShadow: "0 8px 24px rgba(37,99,235,0.12)",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>✨ Real-time market data</div>
          <div style={{ fontSize: 10, color: "#4338CA", marginTop: 3 }}>Salary · Scarcity · Sourcing · in one click</div>
        </div>
      </div>
    </AppShell>
  );
}
