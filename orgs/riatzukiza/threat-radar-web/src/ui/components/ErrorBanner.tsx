/**
 * ErrorBanner — shown when the API is unreachable or returns an error.
 *
 * If `isStale` is true, also displays a "stale data" indicator so the user
 * knows the dashboard is showing previously loaded (potentially outdated) data.
 */

export type ErrorBannerProps = {
  message: string;
  isStale: boolean;
  lastUpdated: string | null;
  onRetry?: () => void;
};

export function ErrorBanner({ message, isStale, lastUpdated, onRetry }: ErrorBannerProps): JSX.Element {
  return (
    <div className="error-banner" role="alert" data-testid="error-banner">
      <div className="error-banner-content">
        <svg className="error-banner-icon" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8" />
          <line x1="10" y1="6" x2="10" y2="11" />
          <circle cx="10" cy="14" r="0.8" fill="currentColor" stroke="none" />
        </svg>
        <span className="error-banner-message">{message}</span>
        {onRetry && (
          <button className="error-banner-retry" onClick={onRetry} type="button">
            Retry
          </button>
        )}
      </div>
      {isStale && (
        <div className="stale-indicator" data-testid="stale-indicator">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <line x1="8" y1="4" x2="8" y2="8" />
            <line x1="8" y1="8" x2="11" y2="10" />
          </svg>
          <span>
            Showing stale data
            {lastUpdated ? ` from ${formatTimestamp(lastUpdated)}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString();
  } catch {
    return iso;
  }
}
