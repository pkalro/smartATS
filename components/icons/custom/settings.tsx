import type { SVGProps } from "react";
export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Center circle */}
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      {/* Gear path — 8 teeth */}
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        stroke="currentColor" strokeWidth="1.75" />
      {/* Outer ring */}
      <path d="M12 6.5A5.5 5.5 0 0 1 17.5 12 5.5 5.5 0 0 1 12 17.5 5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 12 6.5z"
        stroke="currentColor" strokeWidth="1.75" strokeDasharray="2.5 2" />
    </svg>
  );
}
