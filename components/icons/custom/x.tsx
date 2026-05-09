import type { SVGProps } from "react";
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.75" />
      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
