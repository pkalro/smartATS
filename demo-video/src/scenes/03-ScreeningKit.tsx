/**
 * Scene 3 — AI Screening Kit
 * Duration: 240 frames (8s @ 30fps)
 * Shows: candidate profile → screening kit generating → full kit revealed
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppShell } from "../components/AppShell";
import { ScoreChip } from "../components/ScoreChip";
import { colors } from "../lib/theme";

const QUESTIONS = [
  "Walk me through your experience designing distributed systems at scale.",
  "How have you handled database performance issues with 10M+ records?",
  "Describe your approach to API versioning in a microservices environment.",
  "What's your process for on-call incidents and postmortems?",
];

const PITCH_POINTS = [
  "₹40–50L TC with 0.5% ESOP cliff at 12 months",
  "Greenfield architecture — no legacy debt",
  "Remote-first team across 3 time zones",
  "Series B, 18 months runway, profitable core",
];

const GAPS = [
  "✓  Node.js + PostgreSQL — strong match",
  "✓  AWS + distributed systems experience",
  "⚠  Limited Kubernetes exposure — assess further",
  "✗  No ML pipeline work (non-critical for role)",
];

function TypewriterText({ text, frame, startFrame, speed = 2 }: {
  text: string; frame: number; startFrame: number; speed?: number;
}) {
  const chars = Math.floor(Math.max(0, frame - startFrame) * speed);
  return <span>{text.slice(0, chars)}<span style={{ opacity: 0.3 }}>|</span></span>;
}

function KitCard({ title, children, frame, delay, icon }: {
  title: string; children: React.ReactNode;
  frame: number; delay: number; icon: string;
}) {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } });
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      background: "white", borderRadius: 14, border: "1px solid #E2E8F0",
      padding: "16px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      opacity: op,
      transform: `translateY(${(1 - s) * 16}px)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function ScreeningKitScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageSpring = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });

  // Generating spinner
  const genStart = 20;
  const genEnd = 60;
  const genOpacity = interpolate(frame, [genStart, genStart + 10, genEnd - 10, genEnd], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = (frame / 25) * 360;

  // Kit cards appear after generation
  const kitStart = 70;

  // Callout
  const calloutOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AppShell activeNav="candidates">
      <div style={{
        height: "100%", display: "flex", gap: 20, overflow: "hidden",
        opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        {/* Left — candidate header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280, flexShrink: 0 }}>
          <div style={{
            background: "white", borderRadius: 16, border: "1px solid #E2E8F0",
            padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "white",
              }}>R</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>Rahul Sharma</div>
                <div style={{ fontSize: 11, color: colors.textSub }}>Sr. Backend Engineer</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ScoreChip score={87} large />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Notice", val: "30 days" },
                { label: "Current", val: "₹28L" },
                { label: "Expected", val: "₹40–45L" },
                { label: "Location", val: "Bengaluru" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: colors.textMut }}>{r.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <div style={{
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L13.2 8.8L19 10L13.2 11.2L12 17L10.8 11.2L5 10L10.8 8.8Z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Generate Screening Kit</span>
          </div>
        </div>

        {/* Right — kit content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", position: "relative" }}>

          {/* Generating overlay */}
          {frame >= genStart && frame <= genEnd + 10 && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(248,250,252,0.95)",
              borderRadius: 16,
              zIndex: 10,
              opacity: genOpacity,
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: `rotate(${spin}deg)`,
                  boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M12 3a9 9 0 1 0 9 9"/>
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>✨ Generating screening kit…</div>
                  <div style={{ fontSize: 13, color: colors.textSub, marginTop: 4 }}>Analysing profile against Senior Backend Engineer JD</div>
                </div>
              </div>
            </div>
          )}

          {/* Kit cards — 2-column grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, flex: 1,
          }}>
            <KitCard title="Pitch Deck" icon="📢" frame={frame} delay={kitStart}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PITCH_POINTS.map((p, i) => {
                  const lineOpacity = interpolate(frame, [kitStart + i * 15, kitStart + i * 15 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={p} style={{ display: "flex", gap: 8, opacity: lineOpacity }}>
                      <span style={{ color: "#2563EB", fontSize: 11, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5 }}>{p}</span>
                    </div>
                  );
                })}
              </div>
            </KitCard>

            <KitCard title="Gap Analysis" icon="🔍" frame={frame} delay={kitStart + 15}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {GAPS.map((g, i) => {
                  const isMatch = g.startsWith("✓");
                  const isWarn = g.startsWith("⚠");
                  const col = isMatch ? "#065F46" : isWarn ? "#92400E" : "#991B1B";
                  const lineOpacity = interpolate(frame, [kitStart + 15 + i * 12, kitStart + 15 + i * 12 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={g} style={{ fontSize: 11, color: col, lineHeight: 1.5, fontWeight: isMatch ? 500 : 400, opacity: lineOpacity }}>{g}</div>
                  );
                })}
              </div>
            </KitCard>

            <KitCard title="Tailored Screening Questions" icon="💬" frame={frame} delay={kitStart + 30}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {QUESTIONS.slice(0, 3).map((q, i) => {
                  const lineOpacity = interpolate(frame, [kitStart + 30 + i * 14, kitStart + 30 + i * 14 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={q} style={{ display: "flex", gap: 8, opacity: lineOpacity }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 6,
                        background: "#EFF6FF", color: "#2563EB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.4 }}>{q}</span>
                    </div>
                  );
                })}
              </div>
            </KitCard>

            <KitCard title="Recruiter Notes" icon="📝" frame={frame} delay={kitStart + 45}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Strong systems design background — ideal for lead role",
                  "Salary ask is 42% jump — prepare equity story",
                  "Proactively ask about remote preference early",
                ].map((n, i) => {
                  const lineOpacity = interpolate(frame, [kitStart + 45 + i * 12, kitStart + 45 + i * 12 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div key={n} style={{ display: "flex", gap: 8, opacity: lineOpacity }}>
                      <span style={{ color: "#F59E0B", fontSize: 11 }}>→</span>
                      <span style={{ fontSize: 11, color: colors.textSub, lineHeight: 1.5 }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </KitCard>
          </div>
        </div>
      </div>

      {/* Floating callout */}
      <div style={{
        position: "absolute", bottom: 40, right: 60,
        background: "linear-gradient(135deg, #ECFDF5, #EFF6FF)",
        border: "1px solid #A7F3D0",
        borderRadius: 14, padding: "12px 18px",
        opacity: calloutOpacity,
        boxShadow: "0 8px 24px rgba(16,185,129,0.15)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#065F46" }}>✨ Generated in 6 seconds</div>
        <div style={{ fontSize: 11, color: "#047857", marginTop: 3 }}>Pitch deck · Gap analysis · Tailored questions</div>
      </div>
    </AppShell>
  );
}
