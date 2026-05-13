/**
 * Brand logo components.
 *
 *  <LogoOptichire />  ← primary brand (aperture / optic + hire)
 *
 *  Legacy concepts (kept for reference / brand-preview page):
 *  <LogoSift />    blue-violet funnel-dot pyramid
 *  <LogoCal />     emerald gauge / quality-bar
 *  <LogoSignal />  indigo EKG pulse
 *
 * Each accepts:
 *   size   — "sm" (h-7) | "md" (h-9, default) | "lg" (h-12) | "xl" (h-16)
 *   mark   — true = icon + wordmark (default), false = icon only
 *   mono   — true = single-colour (dark) treatment
 */

import React from "react";

// ─────────────────────────────────────────────
//  OPTICHIRE  (primary brand)
//  Icon: camera aperture (optic + hire metaphor)
//  Palette: sky-500 → indigo-500
// ─────────────────────────────────────────────
export function LogoOptichire({
  size = "md",
  mark = true,
  mono = false,
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  mark?: boolean;
  mono?: boolean;
  className?: string;
}) {
  const h = { sm: 28, md: 36, lg: 48, xl: 64 }[size];
  const gap = h * 0.3;
  const fontSize = h * 0.58;
  const ls = -fontSize * 0.04;

  // Unique gradient IDs per size to avoid SVG conflicts
  const gId = `oh-g-${size}`;
  const glId = `oh-gl-${size}`;

  return (
    <div className={`inline-flex items-center ${className}`} style={{ height: h }}>
      {/* Aperture icon */}
      <svg
        width={h}
        height={h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {!mono ? (
            <>
              <linearGradient id={gId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <radialGradient id={glId} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#0EA5E9" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
            </>
          ) : null}
        </defs>

        {/* Glow disc */}
        {!mono && <circle cx="24" cy="24" r="23" fill={`url(#${glId})`} />}

        {/* Outer ring */}
        <circle cx="24" cy="24" r="21"
          stroke={mono ? "#0F172A" : `url(#${gId})`}
          strokeWidth="2.5"
        />

        {/* 6 aperture chords */}
        {[
          [28.62, 16,    40.10, 35.88],
          [19.38, 16,    42.34, 16   ],
          [14.76, 24,    26.24, 4.12 ],
          [19.38, 32,    7.90,  12.12],
          [28.62, 32,    5.66,  32   ],
          [33.24, 24,    21.76, 43.88],
        ].map(([x1, y1, x2, y2], i) => (
          <line key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={mono ? "#0F172A" : `url(#${gId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}

        {/* Centre iris */}
        {!mono && <circle cx="24" cy="24" r="5.5" fill={`url(#${gId})`} opacity="0.18" />}
        <circle cx="24" cy="24" r="3"
          fill={mono ? "#0F172A" : `url(#${gId})`}
        />
        <circle cx="24" cy="24" r="1.2" fill="white" />
      </svg>

      {/* Wordmark: optic (regular) + hire (bold) */}
      {mark && (
        <span
          style={{
            marginLeft: gap,
            fontSize,
            lineHeight: 1,
            letterSpacing: ls,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            color: "#0F172A",
          }}
        >
          <span style={{ fontWeight: 500 }}>optic</span>
          <span style={{ fontWeight: 800 }}>hire</span>
        </span>
      )}
    </div>
  );
}

type LogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  mark?: boolean;
  mono?: boolean;
  className?: string;
};

const heights: Record<string, number> = { sm: 28, md: 36, lg: 48, xl: 64 };

// ─────────────────────────────────────────────
//  SIFT
//  Icon: inverted dot pyramid (funnel metaphor)
//  Palette: cobalt → violet
// ─────────────────────────────────────────────
export function LogoSift({ size = "md", mark = true, mono = false, className = "" }: LogoProps) {
  const h = heights[size];
  const iconW = h * (48 / 48);           // icon is square-ish
  const gap = h * 0.32;
  const fontSize = h * 0.62;
  const letterSpacing = -fontSize * 0.04;

  const fill = mono ? "#0F172A" : "url(#sift-g)";

  return (
    <div className={`inline-flex items-center ${className}`} style={{ height: h }}>
      {/* Icon */}
      <svg
        width={iconW}
        height={h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {!mono && (
          <defs>
            <linearGradient id="sift-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        )}
        {/* Row 1 — many applicants enter */}
        <circle cx="10" cy="10" r="5" fill={fill} opacity={mono ? 0.22 : 0.28} />
        <circle cx="24" cy="10" r="5" fill={fill} opacity={mono ? 0.22 : 0.28} />
        <circle cx="38" cy="10" r="5" fill={fill} opacity={mono ? 0.22 : 0.28} />
        {/* Row 2 — shortlisted */}
        <circle cx="17" cy="25" r="5" fill={fill} opacity={mono ? 0.52 : 0.58} />
        <circle cx="31" cy="25" r="5" fill={fill} opacity={mono ? 0.52 : 0.58} />
        {/* Row 3 — the hire */}
        <circle cx="24" cy="40" r="6" fill={fill} />
      </svg>

      {/* Wordmark */}
      {mark && (
        <span
          style={{
            marginLeft: gap,
            fontSize,
            fontWeight: 800,
            letterSpacing,
            lineHeight: 1,
            color: "#0F172A",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
          }}
        >
          sift
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  CALIBR
//  Icon: semicircle gauge with needle at 75 %
//  Palette: near-black + emerald
// ─────────────────────────────────────────────
export function LogoCal({ size = "md", mark = true, mono = false, className = "" }: LogoProps) {
  const h = heights[size];
  // Gauge is wider than tall; use a 52×44 aspect ratio
  const iconW = h * (52 / 44);
  const gap   = h * 0.32;
  const fontSize    = h * 0.62;
  const letterSpacing = -fontSize * 0.04;

  // Gauge geometry (original coords: centre 26,44 r=20 in 52×52 viewBox)
  const trackColor  = mono ? "#CBD5E1" : "#E2E8F0";
  const activeColor = mono ? "#0F172A" : "#10B981";
  const pivotColor  = "#0F172A";

  return (
    <div className={`inline-flex items-center ${className}`} style={{ height: h }}>
      {/* Icon */}
      <svg
        width={iconW}
        height={h}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Tick marks */}
        {/* 100% right  */ }
        <line x1="46" y1="44" x2="42" y2="44" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>
        {/* 0%   left   */ }
        <line x1="6"  y1="44" x2="10" y2="44" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>
        {/* 50%  top    */ }
        <line x1="26" y1="24" x2="26" y2="28" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>
        {/* 25%  upper-left  (135° math → SVG) */ }
        <line x1="11.9" y1="29.9" x2="14.2" y2="32.2" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>
        {/* 75%  upper-right (45° math) */ }
        <line x1="40.1" y1="29.9" x2="37.8" y2="32.2" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>

        {/* Background track — full semicircle (sweep=0 → CCW on screen → through top) */}
        <path d="M 6,44 A 20,20 0 0,0 46,44" stroke={trackColor} strokeWidth="5" strokeLinecap="round"/>

        {/* Active arc 0 % → 75 % (45° = x:40.14 y:29.86) */}
        <path d="M 6,44 A 20,20 0 0,0 40.14,29.86" stroke={activeColor} strokeWidth="5" strokeLinecap="round"/>

        {/* Needle */}
        <line x1="26" y1="44" x2="40.14" y2="29.86" stroke={pivotColor} strokeWidth="2" strokeLinecap="round"/>

        {/* Pivot */}
        <circle cx="26" cy="44" r="3.5" fill={pivotColor}/>

        {/* Needle tip */}
        <circle cx="40.14" cy="29.86" r="2.5" fill={activeColor}/>
      </svg>

      {/* Wordmark */}
      {mark && (
        <span
          style={{
            marginLeft: gap,
            fontSize,
            fontWeight: 800,
            letterSpacing,
            lineHeight: 1,
            color: "#0F172A",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
          }}
        >
          calibr
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  SIGNAL
//  Icon: single EKG pulse (QRS complex)
//  Palette: indigo, with opacity fade on flat ends
// ─────────────────────────────────────────────
export function LogoSignal({ size = "md", mark = true, mono = false, className = "" }: LogoProps) {
  const h = heights[size];
  // Pulse is wider: 60×48 aspect
  const iconW = h * (60 / 48);
  const gap   = h * 0.32;
  const fontSize    = h * 0.62;
  const letterSpacing = -fontSize * 0.04;

  const strokeColor = mono ? "#0F172A" : "#6366F1";
  const gradId = `pulse-g-${size}`;

  return (
    <div className={`inline-flex items-center ${className}`} style={{ height: h }}>
      {/* Icon */}
      <svg
        width={iconW}
        height={h}
        viewBox="0 0 60 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {!mono && (
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.12" />
              <stop offset="22%"  stopColor="#6366F1" stopOpacity="1"    />
              <stop offset="78%"  stopColor="#6366F1" stopOpacity="1"    />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.12" />
            </linearGradient>
          </defs>
        )}

        {/* EKG line: flat → QRS spike → flat
            Baseline y=24 (centre of 48px height)
            Peak y=8 (+16), trough y=40 (−16)         */}
        <polyline
          points="2,24 17,24 28,8 33,40 38,24 58,24"
          stroke={mono ? strokeColor : `url(#${gradId})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Peak glow dot */}
        <circle cx="28" cy="8" r="3.5" fill={strokeColor} opacity="0.9" />
        {!mono && <circle cx="28" cy="8" r="6.5" fill="#6366F1" opacity="0.15" />}
      </svg>

      {/* Wordmark */}
      {mark && (
        <span
          style={{
            marginLeft: gap,
            fontSize,
            fontWeight: 800,
            letterSpacing,
            lineHeight: 1,
            color: "#0F172A",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
          }}
        >
          signal
        </span>
      )}
    </div>
  );
}
