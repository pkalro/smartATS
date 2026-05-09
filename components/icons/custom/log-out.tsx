import type { SVGProps } from "react";
export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Door/panel */}
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor" strokeWidth="1.75" />
      {/* Arrow right */}
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.75" />
      {/* Arrow shaft */}
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
