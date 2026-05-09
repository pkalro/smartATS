import type { SVGProps } from "react";
export function LoaderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Arc — top heavy to suggest motion */}
      <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
