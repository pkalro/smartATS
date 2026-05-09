import type { SVGProps } from "react";
export function LayoutDashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Top-left panel */}
      <rect x="3" y="3" width="7" height="8" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Top-right panel */}
      <rect x="14" y="3" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Bottom-left panel */}
      <rect x="3" y="15" width="7" height="6" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Bottom-right panel */}
      <rect x="14" y="12" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
