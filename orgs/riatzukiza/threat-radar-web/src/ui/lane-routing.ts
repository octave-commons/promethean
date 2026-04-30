// ---------------------------------------------------------------------------
// Lane routing — determines which dashboard lane (η, μ, Π) a radar belongs to.
//
// η (Global) lane: geopolitical, infrastructure, global — forces outside
// the user's direct control that shape constraints.
//
// μ (Local) lane: everything else that isn't explicitly global — signals
// inside the user's expertise where intervention might matter. This includes
// technology, community, oss, economic, security, climate, local, etc.
//
// Π (Connections) lane: populated by connection engine (not category-based).
// Tiles that don't match either global or local categories fall through
// here as a catch-all.
// ---------------------------------------------------------------------------

/**
 * Categories that route to the η (Global) lane.
 * These represent macro forces outside direct user control.
 */
export const GLOBAL_CATEGORIES: ReadonlySet<string> = new Set([
  "geopolitical",
  "infrastructure",
  "global",
]);

/**
 * Categories explicitly known to route to the μ (Local) lane.
 * In practice, any category NOT in GLOBAL_CATEGORIES goes to μ,
 * but this set is useful for documentation and testing.
 */
export const LOCAL_CATEGORIES: ReadonlySet<string> = new Set([
  "local",
  "community",
  "oss",
  "technology",
  "economic",
  "security",
  "climate",
]);

/**
 * Determine whether a radar category belongs to the η (Global) lane.
 */
export function isGlobalCategory(category: string): boolean {
  return GLOBAL_CATEGORIES.has(category);
}

/**
 * Determine whether a radar category belongs to the μ (Local) lane.
 * Broad approach: everything that isn't explicitly global goes to μ.
 */
export function isLocalCategory(category: string): boolean {
  return !GLOBAL_CATEGORIES.has(category);
}
