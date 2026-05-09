import type { SVGProps } from "react";
export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Tall bar */}
      <rect x="3" y="5" width="4.5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Medium bar */}
      <rect x="9.75" y="9" width="4.5" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Short bar */}
      <rect x="16.5" y="13" width="4.5" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Baseline */}
      <line x1="2" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
