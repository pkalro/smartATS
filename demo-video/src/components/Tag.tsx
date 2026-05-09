import React from "react";

type TagColor = "blue" | "violet" | "emerald" | "amber" | "slate" | "orange" | "red";

const COLORS: Record<TagColor, { bg: string; text: string; border: string }> = {
  blue:    { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  violet:  { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  emerald: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  amber:   { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D" },
  slate:   { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
  orange:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  red:     { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" },
};

export function Tag({ label, color = "slate" }: { label: string; color?: TagColor }) {
  const c = COLORS[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: 999,
      paddingLeft: 10, paddingRight: 10,
      paddingTop: 2, paddingBottom: 2,
      fontSize: 10, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

export function StatusTag({ status }: { status: string }) {
  const map: Record<string, TagColor> = {
    NEW: "slate", SCREENING: "blue", SHORTLISTED: "violet",
    INTERVIEWING: "amber", OFFER: "orange", HIRED: "emerald",
    REJECTED: "red", WITHDRAWN: "slate",
    ACTIVE: "emerald", CLOSED: "slate", DRAFT: "amber",
  };
  return <Tag label={status.charAt(0) + status.slice(1).toLowerCase()} color={map[status] ?? "slate"} />;
}
