import type { SVGProps } from "react";
export function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Main body */}
      <rect x="2" y="8" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Handle */}
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor" strokeWidth="1.75" />
      {/* Center divider */}
      <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1.75" />
      {/* Clasp */}
      <rect x="10.25" y="12.5" width="3.5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
