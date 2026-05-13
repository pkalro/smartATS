/**
 * Unified icon component for Optichire.
 *
 * Usage:
 *   <Icon name="briefcase" size={5} className="text-slate-500" />
 *
 * `size` maps to Tailwind h-N/w-N (e.g. size={4} → h-4 w-4).
 * Falls back to a simple square placeholder for unknown names in dev.
 */
import type { SVGProps } from "react";
import { iconRegistry, type IconName } from "./registry";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  /** Tailwind size unit — h-{size} w-{size}. Default: 5 */
  size?: number;
}

// Size → Tailwind class (covers the range we actually use)
const SIZE_MAP: Record<number, string> = {
  3:  "h-3 w-3",
  3.5: "h-3.5 w-3.5",
  4:  "h-4 w-4",
  5:  "h-5 w-5",
  6:  "h-6 w-6",
  7:  "h-7 w-7",
  8:  "h-8 w-8",
  10: "h-10 w-10",
};

export function Icon({ name, size = 5, className = "", ...rest }: IconProps) {
  const Component = iconRegistry[name];
  const sizeClass = SIZE_MAP[size] ?? `h-${size} w-${size}`;
  const cls = [sizeClass, className].filter(Boolean).join(" ");

  if (!Component) {
    // Dev-only fallback — invisible in production
    return (
      <span
        className={`inline-block rounded bg-red-200 ${sizeClass}`}
        title={`Unknown icon: ${name}`}
      />
    );
  }

  return <Component aria-hidden="true" className={cls} {...rest} />;
}
