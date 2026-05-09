import type { SVGProps } from "react";
export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Tray base */}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor" strokeWidth="1.75" />
      {/* Arrow down */}
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.75" />
      {/* Shaft */}
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
