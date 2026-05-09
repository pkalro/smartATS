import type { SVGProps } from "react";
export function TrendingUpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Line going up */}
      <polyline points="3 17 9 11 13 15 21 7" stroke="currentColor" strokeWidth="1.75" />
      {/* Arrow head */}
      <polyline points="15 7 21 7 21 13" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
