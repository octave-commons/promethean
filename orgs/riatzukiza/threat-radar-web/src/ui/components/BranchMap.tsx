// ---------------------------------------------------------------------------
// BranchMap — tree/graph visualization of 2-4 narrative branches
// ---------------------------------------------------------------------------

export interface BranchMapBranch {
  /** Display label for this branch */
  readonly label: string;
  /** Probability 0–1 */
  readonly probability: number;
  /** Evidence strings backing this branch */
  readonly evidence?: readonly string[];
  /** Optional: branch scoring dimensions */
  readonly realism?: number;
  readonly fear?: number;
  readonly public_benefit?: number;
  readonly actionability?: number;
  readonly polarization_risk?: number;
  readonly compression_loss?: number;
}

export interface BranchMapProps {
  /** 2-4 narrative branches */
  readonly branches: readonly BranchMapBranch[];
  /** Optional root label (e.g. "Situation Assessment") */
  readonly rootLabel?: string;
  /** Width of the SVG viewport (default 320) */
  readonly width?: number;
  /** Height of the SVG viewport (default 200) */
  readonly height?: number;
  /** Optional className */
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function branchColor(index: number, opacity: number): string {
  const hues = [200, 140, 30, 320]; // cyan-ish, green, orange, magenta
  return `hsla(${hues[index % hues.length]}, 70%, 60%, ${opacity})`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BranchMap({
  branches,
  rootLabel = "Assessment",
  width = 320,
  height = 200,
  className,
}: BranchMapProps): JSX.Element {
  const rootX = width * 0.12;
  const rootY = height / 2;

  const branchCount = branches.length;
  // Evenly distribute branches vertically
  const branchSpacing = branchCount > 1 ? (height - 40) / (branchCount - 1) : 0;
  const startY = branchCount > 1 ? 20 : rootY;

  return (
    <div className={`branch-map ${className ?? ""}`.trim()} data-testid="branch-map">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`Narrative branch map with ${branchCount} branches`}
      >
        {/* Root node */}
        <circle
          cx={rootX}
          cy={rootY}
          r={8}
          fill="rgba(255,255,255,0.1)"
          stroke="var(--muted, #8a95a4)"
          strokeWidth={1.5}
          data-testid="branch-root"
        />
        <text
          x={rootX}
          y={rootY + 20}
          textAnchor="middle"
          fill="var(--muted, #8a95a4)"
          fontSize={9}
        >
          {rootLabel}
        </text>

        {/* Branches */}
        {branches.map((branch, i) => {
          const branchY = startY + i * branchSpacing;
          const nodeX = width * 0.55;
          const labelX = width * 0.62;
          const pctStr = `${(branch.probability * 100).toFixed(0)}%`;
          const barWidth = Math.max(4, branch.probability * width * 0.22);

          return (
            <g key={branch.label} data-testid={`branch-node-${i}`}>
              {/* Connecting line from root to branch node */}
              <path
                d={`M ${rootX + 8} ${rootY} C ${rootX + 40} ${rootY}, ${nodeX - 40} ${branchY}, ${nodeX - 6} ${branchY}`}
                fill="none"
                stroke={branchColor(i, 0.45)}
                strokeWidth={1.5}
                strokeLinecap="round"
                style={{ transition: "d 0.6s ease" }}
                data-testid={`branch-line-${i}`}
              />

              {/* Branch node circle */}
              <circle
                cx={nodeX}
                cy={branchY}
                r={6}
                fill={branchColor(i, 0.3)}
                stroke={branchColor(i, 0.8)}
                strokeWidth={1.5}
              />

              {/* Probability bar */}
              <rect
                x={labelX}
                y={branchY - 4}
                width={barWidth}
                height={8}
                rx={4}
                fill={branchColor(i, 0.35)}
                style={{ transition: "width 0.6s ease" }}
              />

              {/* Probability label */}
              <text
                x={labelX + barWidth + 6}
                y={branchY + 3.5}
                fill="var(--ink, #f0ebe0)"
                fontSize={11}
                fontWeight="500"
                data-testid={`branch-prob-${i}`}
              >
                {pctStr}
              </text>

              {/* Branch label */}
              <text
                x={labelX}
                y={branchY - 10}
                fill="var(--muted, #8a95a4)"
                fontSize={10}
                data-testid={`branch-label-${i}`}
              >
                {branch.label.replace(/_/g, " ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
