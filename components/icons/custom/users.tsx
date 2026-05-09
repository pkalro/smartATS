import type { SVGProps } from "react";
export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Front person head */}
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.75" />
      {/* Front person body */}
      <path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.75" />
      {/* Back person head */}
      <circle cx="17" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Back person body partial */}
      <path d="M20 21v-1a5 5 0 0 0-5.5-4.97" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
