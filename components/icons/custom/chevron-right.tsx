import type { SVGProps } from "react";
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 6 15 12 9 18" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
