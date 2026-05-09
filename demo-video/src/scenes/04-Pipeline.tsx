/**
 * Scene 4 — Pipeline / Kanban Board
 * Duration: 210 frames (7s @ 30fps)
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { AppShell } from "../components/AppShell";
import { ScoreChip } from "../components/ScoreChip";
import { colors } from "../lib/theme";

const COLUMNS = [
  {
    status: "NEW", label: "New", color: "from-slate-400 to-slate-500",
    bg: "#F8FAFC", accent: "#64748B",
    cards: [
      { name: "Siddharth M.", title: "Backend Dev", score: 71, notice: "30d" },
      { name: "Pooja R.",     title: "Fullstack",   score: 58, notice: "60d" },
    ],
  },
  {
    status: "SCREENING", label: "Screening", color: "from-blue-500 to-cyan-500",
    bg: "#EFF6FF", accent: "#2563EB",
    cards: [
      { name: "Rahul S.",    title: "Sr. Backend", score: 87, notice: "30d" },
    ],
  },
  {
    status: "SHORTLISTED", label: "Shortlisted", color: "from-violet-500 to-purple-500",
    bg: "#F5F3FF", accent: "#7C3AED",
    cards: [
      { name: "Ananya M.",   title: "Fullstack",   score: 72, notice: "60d" },
      { name: "Dev K.",      title: "React Dev",   score: 65, notice: "45d" },
    ],
  },
  {
    status: "INTERVIEWING", label: "Interviewing", color: "from-amber-500 to-orange-500",
    bg: "#FFFBEB", accent: "#F59E0B",
    cards: [
      { name: "Kavya T.",    title: "Sr. Engineer", score: 91, notice: "30d" },
    ],
  },
  {
    status: "OFFER", label: "Offer", color: "from-orange-500 to-rose-500",
    bg: "#FFF7ED", accent: "#F97316",
    cards: [
      { name: "Aditya G.",   title: "Lead Dev",    score: 94, notice: "15d" },
    ],
  },
  {
    status: "HIRED", label: "Hired", color: "from-emerald-500 to-teal-500",
    bg: "#ECFDF5", accent: "#10B981",
    cards: [
      { name: "Neha S.",     title: "Backend",     score: 88, notice: "Joined" },
    ],
  },
];

function KanbanCard({ card, frame, delay }: {
  card: { name: string; title: string; score: number; notice: string };
  frame: number;
  delay: number;
}) {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } });
  const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      background: "white", borderRadius: 10, border: "1px solid #E2E8F0",
      padding: "10px 12px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      opacity: op,
      transform: `translateY(${(1 - s) * 12}px)`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>{card.name}</span>
        <ScoreChip score={card.score} />
      </div>
      <div style={{ fontSize: 10, color: colors.textSub }}>{card.title}</div>
      <div style={{
        marginTop: 8,
        fontSize: 9, color: colors.textMut,
      }}>{card.notice}</div>
    </div>
  );
}

export function PipelineScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pageSpring = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const headerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Highlight "Offer" column at the end
  const highlightOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AppShell activeNav="pipeline">
      <div style={{
        height: "100%", display: "flex", flexDirection: "column", gap: 16,
        opacity: pageSpring,
        transform: `translateY(${(1 - pageSpring) * 16}px)`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: headerOpacity }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #F59E0B, #F97316)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
                <rect x="3" y="3" width="5" height="14" rx="2"/>
                <rect x="9.5" y="3" width="5" height="10" rx="2"/>
                <rect x="16" y="3" width="5" height="7" rx="2"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, letterSpacing: "-0.02em" }}>Pipeline</div>
              <div style={{ fontSize: 13, color: colors.textSub }}>9 applications · Backend Engineer</div>
            </div>
          </div>
          {/* Stale alert chip */}
          <div style={{
            background: "#FFFBEB", border: "1px solid #FCD34D",
            borderRadius: 999, paddingLeft: 12, paddingRight: 12,
            paddingTop: 4, paddingBottom: 4,
            fontSize: 11, fontWeight: 600, color: "#92400E",
            display: "flex", alignItems: "center", gap: 6,
            opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <span>⏱</span> 2 candidates stale 3+ days
          </div>
        </div>

        {/* Kanban board */}
        <div style={{
          display: "flex", gap: 10, flex: 1, overflow: "hidden",
        }}>
          {COLUMNS.map((col, colIdx) => {
            const colDelay = 15 + colIdx * 12;
            const colOpacity = interpolate(frame, [colDelay, colDelay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const isOfferCol = col.status === "OFFER";

            return (
              <div
                key={col.status}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0,
                  opacity: colOpacity,
                  outline: isOfferCol ? `2px solid rgba(249,115,22,${0.4 * highlightOpacity})` : "none",
                  borderRadius: 12,
                  padding: isOfferCol ? 4 : 0,
                }}
              >
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: `linear-gradient(135deg, ${col.accent}22, ${col.accent}11)`,
                    border: `1px solid ${col.accent}33`,
                    borderRadius: 999, paddingLeft: 10, paddingRight: 10,
                    paddingTop: 3, paddingBottom: 3,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: col.accent, display: "inline-block" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: col.accent }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMut }}>{col.cards.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
                  {col.cards.map((card, cardIdx) => (
                    <KanbanCard
                      key={card.name}
                      card={card}
                      frame={frame}
                      delay={colDelay + 20 + cardIdx * 15}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
