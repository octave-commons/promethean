// ---------------------------------------------------------------------------
// RiskGauge — semi-circular gauge with gradient fill, needle, label & unit
// ---------------------------------------------------------------------------

export interface RiskGaugeProps {
  /** Current value */
  readonly value: number;
  /** Minimum value (default 0) */
  readonly min?: number;
  /** Maximum value (default 100) */
  readonly max?: number;
  /** Display label (e.g. "Geopolitical Stress") */
  readonly label: string;
  /** Unit string (e.g. "%", "pts") */
  readonly unit?: string;
  /** Optional accent colour for the gradient fill (CSS colour) */
  readonly color?: string;
  /** Size of the SVG viewport (default 160) */
  readonly size?: number;
  /** Optional className */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const large = Math.abs(sweep) > 180 ? "1" : "0";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RiskGauge({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  color = "var(--cyan, #22d3ee)",
  size = 160,
  className,
}: RiskGaugeProps): JSX.Element {
  const cx = size / 2;
  const cy = size * 0.55;
  const r = size * 0.36;
  const strokeW = size * 0.06;

  // Semi-circle spans 180° from left (180°) to right (360°/0°)
  const startAngle = 180;
  const endAngle = 360;
  const range = Math.max(max - min, 1);
  const clamped = Math.min(Math.max(value, min), max);
  const pct = (clamped - min) / range;
  const needleAngle = startAngle + pct * (endAngle - startAngle);

  // Gradient ID unique per instance
  const gradId = `gauge-grad-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // Needle tip
  const needleTip = polarToCartesian(cx, cy, r - strokeW * 0.3, needleAngle);

  return (
    <div className={`risk-gauge ${className ?? ""}`.trim()} data-testid="risk-gauge">
      <svg viewBox={`0 0 ${size} ${size * 0.65}`} width={size} height={size * 0.65} role="img" aria-label={`${label}: ${clamped} ${unit}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={describeArc(cx, cy, r, startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Filled arc (gradient) */}
        <path
          d={describeArc(cx, cy, r, startAngle, startAngle + pct * 180)}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          style={{ transition: "d 0.8s ease" }}
          data-testid="gauge-fill"
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--ink, #f0ebe0)"
          strokeWidth={size * 0.015}
          strokeLinecap="round"
          style={{ transition: "all 0.8s ease" }}
          data-testid="gauge-needle"
        />
        <circle cx={cx} cy={cy} r={size * 0.018} fill="var(--accent-2, #ffd166)" />

        {/* Value text */}
        <text
          x={cx}
          y={cy - size * 0.05}
          textAnchor="middle"
          fill="var(--ink, #f0ebe0)"
          fontSize={size * 0.11}
          fontWeight="600"
          data-testid="gauge-value"
        >
          {Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}
          {unit ? <tspan fontSize={size * 0.06}>{unit}</tspan> : null}
        </text>
      </svg>
      <span className="gauge-label" data-testid="gauge-label">{label}</span>
    </div>
  );
}
