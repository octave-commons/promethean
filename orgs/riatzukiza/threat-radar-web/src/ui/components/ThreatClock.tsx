import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Props type — typed from radar-core ReducedSnapshot shape
// ---------------------------------------------------------------------------

export interface ThreatClockSignal {
  readonly median: number;
  readonly range: [number, number];
  readonly agreement: number;
  readonly label: string;
}

export interface ThreatClockProps {
  /** Current threat level 0–4 */
  readonly value: number;
  /** Max scale value (default 4) */
  readonly max?: number;
  /** Per-signal score data for sector arcs */
  readonly signals?: readonly ThreatClockSignal[];
  /** Disagreement index 0–1; drives halo glow opacity */
  readonly disagreementIndex?: number;
  /** Size of the SVG viewport (default 200) */
  readonly size?: number;
  /** Optional className for wrapper */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polarToCartesian(cx, cy, r, endDeg);
  const e = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/** Map a value within [0, max] to degrees in the sweep range (-135 to +135 = 270°) */
function valueToDeg(value: number, max: number): number {
  return -135 + (Math.min(value, max) / max) * 270;
}

// Risk-level sector colours
const SECTOR_COLORS = [
  "hsla(140, 70%, 50%, 0.25)", // 0–1 green (low)
  "hsla(50, 80%, 55%, 0.25)",  // 1–2 yellow
  "hsla(25, 85%, 55%, 0.30)",  // 2–3 orange
  "hsla(0, 75%, 55%, 0.35)",   // 3–4 red (high)
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ThreatClock({
  value,
  max = 4,
  signals = [],
  disagreementIndex = 0,
  size = 200,
  className,
}: ThreatClockProps): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size * 0.29;         // clock face
  const sectorR = size * 0.265;      // risk sectors
  const handLen = size * 0.24;       // hand length
  const haloBaseR = size * 0.31;     // disagreement halo base

  // Animated tick for hand jitter driven by disagreement
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2800);
    return () => window.clearInterval(id);
  }, []);

  const jitter = Math.sin(tick * 0.7) * disagreementIndex * 3;
  const handAngle = valueToDeg(value, max) + jitter;
  const handRad = (handAngle * Math.PI) / 180;

  // Disagreement halo
  const haloR = haloBaseR + disagreementIndex * size * 0.06;
  const haloOpacity = 0.08 + disagreementIndex * 0.4;

  // Sector count derived from max
  const sectorCount = Math.max(1, Math.round(max));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Threat clock showing level ${value.toFixed(1)} out of ${max}`}
      data-testid="threat-clock"
    >
      {/* Disagreement halo (glowing ring) */}
      <circle
        cx={cx}
        cy={cy}
        r={haloR}
        fill="none"
        stroke={`rgba(255,111,60,${haloOpacity.toFixed(2)})`}
        strokeWidth={size * 0.03}
        style={{ filter: "blur(4px)", transition: "r 0.6s ease, stroke 0.6s ease" }}
        data-testid="disagreement-halo"
      />

      {/* Clock face */}
      <circle
        cx={cx}
        cy={cy}
        r={faceR}
        fill="rgba(255,255,255,0.02)"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={1}
      />

      {/* Risk-level coloured sectors */}
      {Array.from({ length: sectorCount }, (_, i) => {
        const startVal = i;
        const endVal = i + 1;
        const startDeg = valueToDeg(startVal, max);
        const endDeg = valueToDeg(endVal, max);
        return (
          <path
            key={`sector-${i}`}
            d={describeArc(cx, cy, sectorR, startDeg, endDeg)}
            fill="none"
            stroke={SECTOR_COLORS[i % SECTOR_COLORS.length]}
            strokeWidth={size * 0.04}
            strokeLinecap="round"
            data-testid={`clock-sector-${i}`}
          />
        );
      })}

      {/* Per-signal uncertainty arcs */}
      {signals.map((sig, i) => {
        const startDeg = valueToDeg(sig.range[0], max);
        const endDeg = valueToDeg(sig.range[1], max);
        const arcR = faceR - 4 - i * (size * 0.02);
        return (
          <path
            key={`sig-${sig.label}`}
            d={describeArc(cx, cy, arcR, startDeg, endDeg)}
            fill="none"
            stroke={`hsla(${20 + i * 40}, 80%, 60%, 0.55)`}
            strokeWidth={size * 0.012}
            strokeLinecap="round"
            style={{ transition: "d 0.6s ease" }}
          />
        );
      })}

      {/* Per-signal median markers */}
      {signals.map((sig, i) => {
        const deg = valueToDeg(sig.median, max);
        const markerR = faceR - 8 - i * (size * 0.02);
        const pos = polarToCartesian(cx, cy, markerR, deg);
        return (
          <circle
            key={`marker-${sig.label}`}
            cx={pos.x}
            cy={pos.y}
            r={size * 0.012}
            fill="rgba(255,209,102,0.7)"
          />
        );
      })}

      {/* Sweep hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(handRad) * handLen}
        y2={cy + Math.sin(handRad) * handLen}
        stroke="var(--ink, #f0ebe0)"
        strokeWidth={size * 0.015}
        strokeLinecap="round"
        style={{
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.25))",
          transition: "all 0.6s ease",
        }}
        data-testid="clock-hand"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={size * 0.02} fill="var(--accent-2, #ffd166)" />

      {/* Current threat-level indicator */}
      <text
        x={cx}
        y={cy + size * 0.22}
        textAnchor="middle"
        fill="var(--ink, #f0ebe0)"
        fontSize={size * 0.09}
        fontWeight="600"
        data-testid="clock-value"
      >
        {value.toFixed(1)}
      </text>
      <text
        x={cx}
        y={cy + size * 0.29}
        textAnchor="middle"
        fill="var(--muted, #8a95a4)"
        fontSize={size * 0.045}
        letterSpacing="0.12em"
      >
        THREAT
      </text>
    </svg>
  );
}
