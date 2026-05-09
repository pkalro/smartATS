/**
 * Scene 5 — Bulk Upload
 * Duration: 210 frames (7s @ 30fps)
 * Shows: dropping 8 resumes → progress → done with scores
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppShell } from "../components/AppShell";
import { ScoreChip } from "../components/ScoreChip";
import { colors } from "../lib/theme";

const FILES = [
  { name: "rahul_sharma_cv.pdf",    score: 87, status: "done" },
  { name: "ananya_mehta_resume.pdf", score: 72, status: "done" },
  { name: "karan_patel_cv.pdf",     score: 45, status: "done" },
  { name: "kavya_t_resume.pdf",     score: 91, status: "done" },
  { name: "siddharth_m.pdf",        score: 63, status: "done" },
  { name: "pooja_r_cv.docx",        score: 58, status: "done" },
  { name: "dev_k_resume.pdf",       score: 69, status: "done" },
  { name: "neha_s_cv.pdf",          score: 88, status: "done" },
];

type FileStatus = "pending" | "processing" | "done";

function FileRow({ file, frameStatus, frame, delay }: {
  file: typeof FILES[0];
  frameStatus: FileStatus;
  frame: number;
  delay: number;
}) {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 140 } });
  const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = (frame / 20) * 360;

  const bg =
    frameStatus === "done" ? "#ECFDF5" :
    frameStatus === "processing" ? "#EFF6FF" : "#F8FAFC";
  const border =
    frameStatus === "done" ? "#A7F3D0" :
    frameStatus === "processing" ? "#BFDBFE" : "#E2E8F0";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px",
      borderRadius: 10, border: `1px solid ${border}`,
      background: bg,
      opacity: op,
      transform: `translateX(${(1 - s) * -16}px)`,
      transition: "background 0.3s, border 0.3s",
    }}>
      {/* Status icon */}
      <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frameStatus === "done" ? (
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "#10B981",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 12 9.5 17.5 20 6"/>
            </svg>
          </div>
        ) : frameStatus === "processing" ? (
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            border: "2px solid #BFDBFE",
            borderTopColor: "#2563EB",
            transform: `rotate(${spin}deg)`,
          }} />
        ) : (
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #E2E8F0" }} />
        )}
      </div>

      {/* Filename */}
      <span style={{
        flex: 1, fontSize: 12,
        color: frameStatus === "done" ? colors.text : colors.textMut,
        fontWeight: frameStatus === "done" ? 500 : 400,
        fontFamily: "monospace",
      }}>
        {file.name}
      </span>

      {/* Score */}
      {frameStatus === "done" && <ScoreChip score={file.score} />}
      {frameStatus === "processing" && (
        <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>Scoring…</span>
      )}
    </div>
  );
}

export function BulkUploadScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageSpring = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });

  // Phase 1: Drop zone visible (0-40)
  const dropZoneOpacity = interpolate(frame, [0, 15, 40, 55], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Phase 2: Files processing (60-180)
  const listOpacity = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Progress bar
  const progress = Math.min(100, Math.max(0, ((frame - 60) / 120) * 100));

  // Determine per-file status
  function getStatus(fileIdx: number): FileStatus {
    const processStart = 60 + fileIdx * 15;
    const processEnd = processStart + 20;
    if (frame < processStart) return "pending";
    if (frame >= processStart && frame < processEnd) return "processing";
    return "done";
  }

  const doneCount = FILES.filter((_, i) => getStatus(i) === "done").length;

  // Done summary
  const doneOpacity = interpolate(frame, [180, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AppShell activeNav="candidates">
      <div style={{
        height: "100%", display: "flex", flexDirection: "column", gap: 20,
        opacity: pageSpring,
        transform: `translateY(${(1 - pageSpring) * 16}px)`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Bulk Upload</div>
            <div style={{ fontSize: 13, color: colors.textSub }}>
              {frame < 60 ? "Drop up to 25 resumes — AI screens them all" :
               doneCount < 8 ? `Processing ${doneCount} of 8 resumes…` :
               "8 candidates screened and scored"}
            </div>
          </div>
        </div>

        {/* Drop zone */}
        {frame < 60 && (
          <div style={{
            opacity: dropZoneOpacity,
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: "100%", maxWidth: 500, padding: 48,
              border: "2px dashed #BFDBFE",
              borderRadius: 20,
              background: "white",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
              boxShadow: "0 8px 32px rgba(37,99,235,0.08)",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>Drop resumes here</div>
                <div style={{ fontSize: 13, color: colors.textSub, marginTop: 6 }}>PDF, DOCX, TXT · up to 25 files</div>
              </div>
              <div style={{
                background: "#F8FAFC", borderRadius: 12, padding: "10px 20px",
                fontSize: 12, color: colors.textSub,
                display: "flex", gap: 16,
              }}>
                <span>✓ AI scoring</span>
                <span>✓ Auto-profile</span>
                <span>✓ No credit card</span>
              </div>
            </div>
          </div>
        )}

        {/* Processing list */}
        {frame >= 55 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, opacity: listOpacity }}>
            {/* Progress bar */}
            <div style={{
              background: "white", borderRadius: 14, border: "1px solid #E2E8F0",
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                  {doneCount < 8 ? `Analysing ${doneCount} of 8…` : "✓ All 8 candidates scored"}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: doneCount === 8 ? "#10B981" : "#2563EB" }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div style={{ height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: doneCount === 8
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #2563EB, #7C3AED)",
                  borderRadius: 99,
                  transition: "width 0.1s linear",
                }} />
              </div>
            </div>

            {/* File rows */}
            <div style={{
              background: "white", borderRadius: 14, border: "1px solid #E2E8F0",
              padding: 12,
              display: "flex", flexDirection: "column", gap: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              flex: 1, overflow: "hidden",
            }}>
              {FILES.map((file, i) => (
                <FileRow
                  key={file.name}
                  file={file}
                  frameStatus={getStatus(i)}
                  frame={frame}
                  delay={60 + i * 8}
                />
              ))}
            </div>
          </div>
        )}

        {/* Done summary callout */}
        <div style={{
          position: "absolute", bottom: 40, right: 60,
          background: "linear-gradient(135deg, #ECFDF5, #EFF6FF)",
          border: "1px solid #A7F3D0",
          borderRadius: 14, padding: "14px 20px",
          opacity: doneOpacity,
          boxShadow: "0 8px 24px rgba(16,185,129,0.15)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>✨ 8 resumes processed in 45 seconds</div>
          <div style={{ fontSize: 11, color: "#047857", marginTop: 4 }}>3 high-fit · 3 mid-fit · 2 low-fit candidates</div>
        </div>
      </div>
    </AppShell>
  );
}
