import type { SVGProps } from "react";
export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Large star at center-right */}
      <path d="M12 3 L13.2 8.8 L19 10 L13.2 11.2 L12 17 L10.8 11.2 L5 10 L10.8 8.8 Z"
        stroke="currentColor" strokeWidth="1.75" fill="none" />
      {/* Small spark top-right */}
      <path d="M19 3 L19.6 5.4 L22 6 L19.6 6.6 L19 9 L18.4 6.6 L16 6 L18.4 5.4 Z"
        stroke="currentColor" strokeWidth="1.75" fill="none" />
      {/* Tiny dot bottom-left */}
      <path d="M5 17 L5.45 18.55 L7 19 L5.45 19.45 L5 21 L4.55 19.45 L3 19 L4.55 18.55 Z"
        stroke="currentColor" strokeWidth="1.4" fill="none" />
    </svg>
  );
}
