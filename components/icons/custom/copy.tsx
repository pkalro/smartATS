import type { SVGProps } from "react";
export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Back sheet */}
      <rect x="8" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      {/* Front sheet */}
      <rect x="3" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" fill="white" />
    </svg>
  );
}
