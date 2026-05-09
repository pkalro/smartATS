/**
 * Scene 1 — Hero / Brand intro
 * Duration: 150 frames (5s @ 30fps)
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Logo } from "../components/Logo";
import { colors } from "../lib/theme";

export function HeroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoY = spring({ frame, fps, config: { damping: 14, stiffness: 100, mass: 1 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const taglineOpacity = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [25, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeY = interpolate(frame, [55, 80], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Orbiting dots / background decoration
  const angle1 = (frame / 300) * Math.PI * 2;
  const angle2 = angle1 + Math.PI * 0.66;
  const angle3 = angle1 + Math.PI * 1.33;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#FAFBFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.4,
      }} />

      {/* Gradient blobs */}
      <div style={{
        position: "absolute",
        width: 600, height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }} />
      <div style={{
        position: "absolute",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)",
        top: "30%", left: "60%",
      }} />

      {/* Orbiting elements */}
      {[
        { r: 280, angle: angle1, icon: "📄", color: "#EFF6FF", border: "#BFDBFE" },
        { r: 320, angle: angle2, icon: "✨", color: "#F5F3FF", border: "#DDD6FE" },
        { r: 260, angle: angle3, icon: "📊", color: "#ECFDF5", border: "#A7F3D0" },
      ].map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 52, height: 52,
            borderRadius: 16,
            background: orb.color,
            border: `1px solid ${orb.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${Math.cos(orb.angle) * orb.r}px), calc(-50% + ${Math.sin(orb.angle) * orb.r * 0.4}px))`,
            opacity: logoOpacity * 0.7,
          }}
        >
          {orb.icon}
        </div>
      ))}

      {/* Main content */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 24, position: "relative",
        transform: `translateY(${(1 - logoY) * -30}px)`,
        opacity: logoOpacity,
      }}>
        <Logo size={56} />

        {/* Tagline */}
        <div style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 52,
            fontWeight: 800,
            color: colors.text,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.1,
          }}>
            Hire faster with <br />
            <span style={{
              backgroundImage: "linear-gradient(135deg, #2563EB, #7C3AED)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>AI-powered screening</span>
          </h1>
        </div>

        {/* Sub */}
        <div style={{
          opacity: badgeOpacity,
          transform: `translateY(${badgeY}px)`,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <p style={{
            margin: 0, fontSize: 20, color: colors.textSub,
            textAlign: "center", maxWidth: 560, lineHeight: 1.5,
          }}>
            Score resumes instantly. Generate screening kits. Close roles in days, not weeks.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {["AI Match Score", "Screening Kit", "Pipeline Intelligence", "Market Intel"].map((f) => (
              <div key={f} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "white",
                border: "1px solid #E2E8F0",
                borderRadius: 999,
                paddingLeft: 14, paddingRight: 14,
                paddingTop: 6, paddingBottom: 6,
                fontSize: 13, fontWeight: 600, color: colors.textSub,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <span style={{ color: colors.blue }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
