import type { SVGProps } from "react";
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
