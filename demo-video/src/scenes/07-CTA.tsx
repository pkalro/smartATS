/**
 * Scene 7 — CTA / Outro
 * Duration: 180 frames (6s @ 30fps)
 */
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { Logo } from "../components/Logo";
import { colors } from "../lib/theme";

const STATS = [
  { value: "8s",   label: "to score a resume" },
  { value: "6s",   label: "screening kit" },
  { value: "25×",  label: "bulk upload capacity" },
];

const FEATURES = [
  { icon: "🎯", title: "AI Match Score",      desc: "0–100 fit score on every resume" },
  { icon: "✨", title: "Screening Kit",        desc: "Pitch deck + gap analysis + questions" },
  { icon: "📊", title: "Pipeline Board",       desc: "Kanban with stale alerts" },
  { icon: "📦", title: "Bulk Upload",          desc: "25 CVs → screened in 45s" },
  { icon: "📈", title: "Market Intelligence",  desc: "Salary, scarcity, sourcing channels" },
  { icon: "📧", title: "Manager Pulse",        desc: "One-click hiring update emails" },
];

export function CTAScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgGradientProgress = interpolate(frame, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const headlineOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [20, 45], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const statsOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const featuresOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [120, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaScale = spring({ frame: frame - 120, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(160deg, #0F172A ${100 - bgGradientProgress * 20}%, #1E1B4B ${100 - bgGradientProgress * 10}%, #0F172A 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 40, position: "relative", overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.15), transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-60%, -50%)",
      }} />
      <div style={{
        position: "absolute",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)",
        top: "30%", left: "60%",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Logo */}
      <div style={{
        opacity: logoOpacity,
        transform: `scale(${0.8 + logoSpring * 0.2})`,
      }}>
        <Logo size={52} light />
      </div>

      {/* Headline */}
      <div style={{
        opacity: headlineOpacity,
        transform: `translateY(${headlineY}px)`,
        textAlign: "center",
      }}>
        <h1 style={{
          margin: 0, fontSize: 48, fontWeight: 800,
          color: "white", letterSpacing: "-0.03em", lineHeight: 1.1,
          textShadow: "0 2px 20px rgba(0,0,0,0.3)",
        }}>
          Your AI recruiting co-pilot.<br />
          <span style={{
            backgroundImage: "linear-gradient(135deg, #60A5FA, #A78BFA)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>Built for speed.</span>
        </h1>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", gap: 32, opacity: statsOpacity,
      }}>
        {STATS.map((stat) => (
          <div key={stat.value} style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 36, fontWeight: 800, color: "white",
              backgroundImage: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 600,
        opacity: featuresOpacity,
      }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            paddingLeft: 12, paddingRight: 14,
            paddingTop: 6, paddingBottom: 6,
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 14 }}>{f.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{f.title}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        opacity: ctaOpacity,
        transform: `scale(${0.9 + ctaScale * 0.1})`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
          borderRadius: 14, paddingLeft: 32, paddingRight: 32,
          paddingTop: 14, paddingBottom: 14,
          fontSize: 16, fontWeight: 700, color: "white",
          boxShadow: "0 8px 32px rgba(37,99,235,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          cursor: "pointer",
        }}>
          Start for free · 100 AI calls
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
            <polyline points="9 6 15 12 9 18"/>
          </svg>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          No credit card required
        </div>
      </div>
    </div>
  );
}
