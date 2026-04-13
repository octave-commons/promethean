/**
 * Shared formatting utilities used across Dashboard and Credentials pages.
 */

const AUTH_TYPE_LABELS: Record<string, string> = {
  api_key: "API Key", // pragma: allowlist secret
  oauth_bearer: "OAuth",
  local: "Local",
  none: "None",
  unknown: "Unknown",
};

/**
 * Returns a human-friendly label for an auth type string.
 *
 * Known values are mapped explicitly; anything else is normalized by
 * replacing separators with spaces and title-casing words so the UI never
 * shows raw snake_case identifiers.
 */
export function formatAuthType(authType: string): string {
  const normalized = authType.trim().toLowerCase();
  if (normalized.length === 0) {
    return AUTH_TYPE_LABELS.unknown;
  }

  const mapped = AUTH_TYPE_LABELS[normalized];
  if (mapped) {
    return mapped;
  }

  return normalized
    .split(/[_-]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
