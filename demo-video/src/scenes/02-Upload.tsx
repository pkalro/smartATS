/**
 * Scene 2 — Upload & AI Score
 * Duration: 240 frames (8s @ 30fps)
 * Shows: resume upload → AI processing → instant score reveal
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppShell } from "../components/AppShell";
import { ScoreChip, ScoreBar } from "../components/ScoreChip";
import { Tag } from "../components/Tag";
import { colors } from "../lib/theme";

const CANDIDATES = [
  { name: "Rahul Sharma",   title: "Senior Backend Engineer",  score: 87, skills: ["Node.js", "AWS", "PostgreSQL"], notice: "30 days",  salary: "₹28L" },
  { name: "Ananya Mehta",   title: "Full Stack Developer",     score: 72, skills: ["React", "Python", "Docker"],    notice: "60 days",  salary: "₹22L" },
  { name: "Karan Patel",    title: "Software Engineer",        score: 45, skills: ["Java", "Spring", "MySQL"],     notice: "90 days",  salary: "₹16L" },
];

function CandidateRow({ cand, index, frame, startFrame }: {
  cand: typeof CANDIDATES[0];
  index: number;
  frame: number;
  startFrame: number;
}) {
  const { fps } = useVideoConfig();
  const delay = startFrame + index * 18;
  const rowSpring = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120, mass: 1 } });
  const rowOpacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scoreDelay = delay + 25;
  const scoreReveal = interpolate(frame, [scoreDelay, scoreDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "12px 20px",
      borderBottom: "1px solid #F1F5F9",
      opacity: rowOpacity,
      transform: `translateX(${(1 - rowSpring) * -20}px)`,
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: `linear-gradient(135deg, ${index === 0 ? "#3B82F6, #8B5CF6" : index === 1 ? "#06B6D4, #8B5CF6" : "#F59E0B, #EF4444"})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
      }}>
        {cand.name.charAt(0)}
      </div>

      {/* Name + title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{cand.name}</div>
        <div style={{ fontSize: 11, color: colors.textSub, marginTop: 1 }}>{cand.title}</div>
      </div>

      {/* Skills */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 200 }}>
        {cand.skills.map((s) => (
          <span key={s} style={{
            background: "#F1F5F9", color: "#475569",
            borderRadius: 6, paddingLeft: 6, paddingRight: 6,
            paddingTop: 2, paddingBottom: 2,
            fontSize: 10, fontWeight: 500,
          }}>{s}</span>
        ))}
      </div>

      {/* Notice / Salary */}
      <div style={{ fontSize: 11, color: colors.textSub, width: 64, textAlign: "center" }}>{cand.notice}</div>
      <div style={{ fontSize: 11, color: colors.textSub, width: 48, textAlign: "center" }}>{cand.salary}</div>

      {/* Score — animates in */}
      <div style={{ opacity: scoreReveal, width: 60, display: "flex", justifyContent: "flex-end" }}>
        <ScoreChip score={cand.score} />
      </div>
    </div>
  );
}

function UploadZone({ frame }: { frame: number }) {
  // Animate out at frame 30
  const opacity = interpolate(frame, [0, 15, 50, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [50, 70], [0, -20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const isProcessing = frame > 30 && frame < 70;
  const spin = (frame / 30) * 360;

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(248,250,252,0.9)",
      opacity,
      transform: `translateY(${y}px)`,
    }}>
      <div style={{
        background: "white", borderRadius: 20, padding: 40,
        border: "2px dashed #BFDBFE",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        boxShadow: "0 8px 32px rgba(37,99,235,0.1)",
      }}>
        {isProcessing ? (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `rotate(${spin}deg)`,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
                <path d="M12 3a9 9 0 1 0 9 9"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>AI is scoring resumes…</div>
              <div style={{ fontSize: 13, color: colors.textSub, marginTop: 4 }}>Processing 3 candidates</div>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>Drop resumes here</div>
              <div style={{ fontSize: 13, color: colors.textSub, marginTop: 4 }}>PDF, DOCX · up to 25 files</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function UploadScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageSpring = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Show table after upload animation
  const tableOpacity = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Callout bubble
  const calloutOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const calloutY = interpolate(frame, [160, 180], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AppShell activeNav="candidates">
      <div style={{
        height: "100%", display: "flex", flexDirection: "column", gap: 20,
        opacity: pageSpring,
        transform: `translateY(${(1 - pageSpring) * 16}px)`,
      }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: titleOpacity }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3"/><path d="M2 21v-1a7 7 0 0 1 14 0v1"/>
                <circle cx="17" cy="7" r="2.5"/><path d="M20 21v-1a5 5 0 0 0-5.5-4.97"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, letterSpacing: "-0.02em" }}>Candidates</div>
              <div style={{ fontSize: 13, color: colors.textSub, marginTop: 1 }}>3 candidates · AI-scored against Backend Engineer</div>
            </div>
          </div>
        </div>

        {/* Table card */}
        <div style={{
          background: "white", borderRadius: 16, border: "1px solid #E2E8F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          flex: 1, position: "relative", overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "10px 20px",
            borderBottom: "1px solid #F1F5F9",
            background: "#FAFAFA",
          }}>
            {["Candidate", "Skills", "Notice", "Salary", "Score"].map((h, i) => (
              <div key={h} style={{
                fontSize: 10, fontWeight: 700, color: colors.textMut,
                textTransform: "uppercase", letterSpacing: "0.08em",
                flex: i === 0 ? 1 : i === 1 ? "none" : "none",
                width: i === 0 ? undefined : i === 1 ? 200 : i === 2 ? 64 : i === 3 ? 48 : 60,
                textAlign: i >= 2 ? "center" : undefined,
              }}>{h}</div>
            ))}
          </div>

          {/* Candidate rows */}
          <div style={{ opacity: tableOpacity }}>
            {CANDIDATES.map((cand, i) => (
              <CandidateRow key={cand.name} cand={cand} index={i} frame={frame} startFrame={80} />
            ))}
          </div>

          {/* Upload overlay */}
          <UploadZone frame={frame} />

          {/* AI callout */}
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
            border: "1px solid #BFDBFE",
            borderRadius: 12, padding: "10px 16px",
            opacity: calloutOpacity,
            transform: `translateY(${calloutY}px)`,
            boxShadow: "0 4px 16px rgba(37,99,235,0.12)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1D4ED8", marginBottom: 2 }}>✨ AI scored in 8 seconds</div>
            <div style={{ fontSize: 10, color: "#4338CA" }}>Match score based on JD + profile analysis</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
