/**
 * Mocked app chrome — sidebar + main area.
 * Wrap scene content in <AppShell activeNav="...">
 */
import React from "react";
import { colors } from "../lib/theme";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Dashboard"   },
  { id: "jobs",        label: "Jobs"        },
  { id: "candidates",  label: "Candidates"  },
  { id: "pipeline",    label: "Pipeline"    },
  { id: "reports",     label: "Reports"     },
];

function NavIcon({ id }: { id: string }) {
  const d: Record<string, string> = {
    dashboard:  "M3 3h7v8H3zM14 3h7v5h-7zM3 15h7v6H3zM14 12h7v9h-7z",
    jobs:       "M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 8h20v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z",
    candidates: "M9 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 21v-1a7 7 0 0 1 14 0v1M17 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM20 21v-1a5 5 0 0 0-5.5-4.97",
    pipeline:   "M3 3h5v14H3zM9.5 3h5v10h-5zM16 3h5v7h-5z",
    reports:    "M3 5h4.5v14H3zM9.75 9h4.5v10h-4.5zM16.5 13h4.5v6h-4.5zM2 21h20",
    settings:   "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22",
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {id === "dashboard" ? (
        <>
          <rect x="3" y="3" width="7" height="8" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/>
          <rect x="3" y="15" width="7" height="6" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/>
        </>
      ) : <path d={d[id] ?? ""} />}
    </svg>
  );
}

export function AppShell({
  activeNav,
  children,
}: {
  activeNav: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F8FAFC",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 220,
          minWidth: 220,
          background: "#FFFFFF",
          borderRight: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          boxShadow: "1px 0 0 #F1F5F9",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Aperture icon */}
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shell-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9"/>
                  <stop offset="100%" stopColor="#6366F1"/>
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="21" stroke="url(#shell-g)" strokeWidth="2.5"/>
              <line x1="28.62" y1="16"  x2="40.10" y2="35.88" stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="19.38" y1="16"  x2="42.34" y2="16"    stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="14.76" y1="24"  x2="26.24" y2="4.12"  stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="19.38" y1="32"  x2="7.90"  y2="12.12" stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="28.62" y1="32"  x2="5.66"  y2="32"    stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="33.24" y1="24"  x2="21.76" y2="43.88" stroke="url(#shell-g)" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="3" fill="url(#shell-g)"/>
              <circle cx="24" cy="24" r="1.2" fill="white"/>
            </svg>
            {/* Wordmark */}
            <span style={{ fontSize: 15, letterSpacing: "-0.03em", lineHeight: 1 }}>
              <span style={{ fontWeight: 500, color: colors.text }}>optic</span>
              <span style={{ fontWeight: 800, color: colors.text }}>hire</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textMut, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 10px 10px" }}>Workspace</p>
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeNav;
            return (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 2,
                  background: active ? "#EFF6FF" : "transparent",
                  color: active ? colors.blue : colors.textSub,
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span style={{ color: active ? colors.blue : colors.textMut }}>
                  <NavIcon id={item.id} />
                </span>
                {item.label}
              </div>
            );
          })}

          <p style={{ fontSize: 10, fontWeight: 700, color: colors.textMut, letterSpacing: "0.1em", textTransform: "uppercase", padding: "20px 10px 10px" }}>Account</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", color: colors.textSub, fontWeight: 500 }}>
            <NavIcon id="settings" />Settings
          </div>
        </nav>

        {/* User footer */}
        <div style={{ padding: 12, borderTop: `1px solid ${colors.border}` }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#F8FAFC", borderRadius: 12, padding: "10px 12px",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "white",
            }}>P</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>Priya K.</div>
              <div style={{ fontSize: 10, color: colors.textMut }}>Head of Talent</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{
          height: 49, borderBottom: `1px solid ${colors.border}`,
          background: "rgba(255,255,255,0.95)",
          display: "flex", alignItems: "center",
          paddingLeft: 32, paddingRight: 32,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: colors.textMut }}>Workspace</span>
            <span style={{ fontSize: 12, color: colors.textMut }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors.text, textTransform: "capitalize" }}>{activeNav}</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              height: 28, paddingLeft: 12, paddingRight: 12, borderRadius: 8,
              background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
              display: "flex", alignItems: "center",
              fontSize: 12, fontWeight: 600, color: "white",
              gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/>
              </svg>
              Add candidate
            </div>
          </div>
        </div>
        {/* Page area */}
        <div style={{ flex: 1, overflow: "hidden", padding: 32 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
