import type { SVGProps } from "react";
export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Envelope body */}
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Flap / V */}
      <polyline points="2 5 12 13 22 5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
