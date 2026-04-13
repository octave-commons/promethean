// ---------------------------------------------------------------------------
// CriticalThinkingSection — guidance panel for evaluating sources, bias,
// and resisting narrative collapse. Visible when critical thinking mode
// is enabled via personalization toggles. (Satisfies VAL-UI-006)
// ---------------------------------------------------------------------------

export interface CriticalThinkingSectionProps {
  /** Whether critical thinking mode is active */
  readonly enabled: boolean;
  /** Optional disagreement index (0–1) for context */
  readonly disagreementIndex?: number;
  readonly className?: string;
}

// ---------------------------------------------------------------------------
// Guidance items
// ---------------------------------------------------------------------------

const GUIDANCE_ITEMS = [
  {
    title: "Evaluate Sources Critically",
    text: "Consider the provenance of each signal. Who published it? What incentives shape the narrative? Cross-reference claims across sources before accepting them as fact.",
  },
  {
    title: "Recognize Cognitive Biases",
    text: "Confirmation bias, anchoring, and availability heuristic all distort perception. Actively seek contradictory evidence and weigh disconfirming signals equally.",
  },
  {
    title: "Resist Narrative Collapse",
    text: "Complex situations rarely reduce to binary frames (left vs right, good vs bad). When you notice only two options being presented, look for the branches this system surfaces — reality usually has more paths than two.",
  },
  {
    title: "Uncertainty Is Information",
    text: "High disagreement between models or sources is itself a valuable signal. It means the situation is genuinely ambiguous — don't paper over it with false confidence.",
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CriticalThinkingSection({
  enabled,
  disagreementIndex,
  className,
}: CriticalThinkingSectionProps): JSX.Element {
  const hasHighDisagreement = (disagreementIndex ?? 0) > 0.5;

  return (
    <section
      className={`ct-section ${enabled ? "ct-section--active" : ""} ${className ?? ""}`.trim()}
      data-testid="critical-thinking-section"
    >
      <div className="ct-header">
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="var(--accent-2)" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.5" fill="var(--accent-2)" />
        </svg>
        <h3 className="ct-title">Critical Thinking Rails</h3>
        {enabled && <span className="ct-badge" data-testid="ct-mode-badge">Active</span>}
      </div>

      {hasHighDisagreement && (
        <div className="ct-alert" data-testid="ct-disagreement-alert">
          <span className="ct-alert-icon">⚠</span>
          <p>
            Model disagreement is high ({((disagreementIndex ?? 0) * 100).toFixed(0)}%).
            Multiple interpretations are plausible — exercise extra caution before acting.
          </p>
        </div>
      )}

      <div className="ct-guidance" data-testid="ct-guidance">
        {GUIDANCE_ITEMS.map((item) => (
          <div key={item.title} className="ct-guidance-item">
            <h4 className="ct-guidance-title">{item.title}</h4>
            <p className="ct-guidance-text">{item.text}</p>
          </div>
        ))}
      </div>

      {!enabled && (
        <p className="ct-hint" data-testid="ct-enable-hint">
          Enable <strong>Critical Thinking</strong> mode in the personalization panel for
          expanded disagreement analysis and source-by-source comparison.
        </p>
      )}
    </section>
  );
}
