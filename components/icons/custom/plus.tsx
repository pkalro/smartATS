import type { SVGProps } from "react";
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.75" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
