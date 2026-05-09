import type { SVGProps } from "react";
export function KanbanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Left column — tall */}
      <rect x="3" y="3" width="5" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Middle column — medium */}
      <rect x="9.5" y="3" width="5" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Right column — short */}
      <rect x="16" y="3" width="5" height="7" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
