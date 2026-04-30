/**
 * LoadingSkeleton — displayed while the initial data load is in progress.
 *
 * Renders a pulsing skeleton approximating the shape of radar cards
 * to avoid layout shift and provide visual feedback.
 */

export type LoadingSkeletonProps = {
  /** Number of skeleton cards to render (default: 3) */
  count?: number;
};

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps): JSX.Element {
  return (
    <div className="loading-skeleton" data-testid="loading-skeleton" role="status" aria-label="Loading radar data">
      <div className="loading-spinner-row">
        <svg className="loading-spinner" viewBox="0 0 40 40" width="32" height="32">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke="var(--cyan, #22d3ee)" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80"
            strokeDashoffset="60"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 20 20"
              to="360 20 20"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <span className="loading-text">Loading radar data…</span>
      </div>
      <div className="skeleton-cards">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-circle" />
            <div className="skeleton-line skeleton-short" />
            <div className="skeleton-line skeleton-medium" />
            <div className="skeleton-line skeleton-short" />
          </div>
        ))}
      </div>
    </div>
  );
}
