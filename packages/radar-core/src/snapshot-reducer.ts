import { z } from "zod";
import type { Thread } from "./schema.js";

// ---------------------------------------------------------------------------
// Types & Schemas
// ---------------------------------------------------------------------------

export const scoreRangeSchema = z.object({
  dimension: z.string().min(1),
  min: z.number().min(0).max(1),
  max: z.number().min(0).max(1),
  median: z.number().min(0).max(1),
});

export const narrativeBranchSchema = z.object({
  label: z.string().min(1),
  probability: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  realism: z.number().min(0).max(100),
  fear: z.number().min(0).max(100),
  public_benefit: z.number().min(0).max(100),
  actionability: z.number().min(0).max(100),
  polarization_risk: z.number().min(0).max(100),
  compression_loss: z.number().min(0).max(100),
});

export const radarSnapshotSchema = z.object({
  scoreRanges: z.array(scoreRangeSchema),
  disagreementIndex: z.number().min(0).max(1),
  narrativeBranches: z.array(narrativeBranchSchema).min(2).max(4),
  compressionLoss: z.number().min(0).max(1),
});

export type ScoreRange = z.infer<typeof scoreRangeSchema>;
export type NarrativeBranch = z.infer<typeof narrativeBranchSchema>;
export type RadarSnapshot = z.infer<typeof radarSnapshotSchema>;

// ---------------------------------------------------------------------------
// Internal helpers — all deterministic (no Date, no Math.random)
// ---------------------------------------------------------------------------

/**
 * Compute median of a sorted numeric array. Returns 0 for empty arrays.
 */
function computeMedian(sorted: ReadonlyArray<number>): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return round2((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return round2(sorted[mid]);
}

/**
 * Round a number to 2 decimal places to avoid floating-point drift.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Round a number to 4 decimal places for intermediate precision.
 */
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Extract the primary category for a thread.
 * Uses the first domain_tag alphabetically, or the thread kind as fallback.
 */
function primaryCategory(thread: Thread): string {
  const sortedTags = [...thread.domain_tags].sort();
  return sortedTags.length > 0 ? sortedTags[0] : thread.kind;
}

/**
 * Compute disagreement index from an array of confidence values.
 * Returns 0 for 0-1 items. For ≥2 items, returns normalized std deviation.
 * Max possible std deviation for values in [0,1] is 0.5, so we divide by 0.5.
 */
function computeDisagreementIndex(confidences: ReadonlyArray<number>): number {
  if (confidences.length <= 1) return 0;
  const mean = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  const variance =
    confidences.reduce((sum, c) => sum + (c - mean) ** 2, 0) / confidences.length;
  const stdDev = Math.sqrt(variance);
  // Normalize to [0,1]: max std dev for [0,1] range is 0.5
  return round2(Math.min(1, stdDev / 0.5));
}

/**
 * Compute source diversity for a set of threads (0-1).
 * Higher diversity means more different source types are represented.
 */
function computeSourceDiversity(threads: ReadonlyArray<Thread>): number {
  const allSourceTypes = new Set<string>();
  for (const thread of threads) {
    for (const key of Object.keys(thread.source_distribution)) {
      allSourceTypes.add(key);
    }
  }
  // Normalize: 1 source = 0.2, 2 sources = 0.5, 3+ = 0.8, 5+ = 1.0
  const count = allSourceTypes.size;
  if (count === 0) return 0;
  if (count === 1) return 0.2;
  if (count === 2) return 0.5;
  if (count <= 4) return 0.8;
  return 1.0;
}

/**
 * Compute source concentration for a group of threads.
 * If all threads share the same dominant source, concentration is high.
 * Returns 0-1 where 1 means perfectly concentrated (1 source).
 */
function computeSourceConcentration(threads: ReadonlyArray<Thread>): number {
  const sourceTotals = new Map<string, number>();
  let total = 0;
  for (const thread of threads) {
    for (const [src, proportion] of Object.entries(thread.source_distribution)) {
      sourceTotals.set(src, (sourceTotals.get(src) ?? 0) + proportion);
      total += proportion;
    }
  }
  if (total === 0) return 0;

  // Herfindahl index: sum of squared shares
  let hhi = 0;
  for (const val of sourceTotals.values()) {
    const share = val / total;
    hhi += share * share;
  }
  return round2(hhi);
}

/**
 * Determine how "urgent" a set of threads are based on their status.
 * emerging/active threads = higher urgency.
 */
function computeUrgency(threads: ReadonlyArray<Thread>): number {
  if (threads.length === 0) return 0;
  const urgencyMap: Record<string, number> = {
    emerging: 0.9,
    active: 0.7,
    cooling: 0.3,
    archived: 0.1,
  };
  const total = threads.reduce(
    (sum, t) => sum + (urgencyMap[t.status] ?? 0.5),
    0,
  );
  return round2(total / threads.length);
}

// ---------------------------------------------------------------------------
// Branch scoring helpers
// ---------------------------------------------------------------------------

interface BranchGroup {
  readonly category: string;
  readonly threads: ReadonlyArray<Thread>;
}

function scoreBranchRealism(group: BranchGroup): number {
  // Realism = average confidence × source diversity
  const avgConf =
    group.threads.reduce((sum, t) => sum + t.confidence, 0) / group.threads.length;
  const diversity = computeSourceDiversity(group.threads);
  return round2(avgConf * 50 + diversity * 50);
}

function scoreBranchFear(group: BranchGroup): number {
  // Fear higher for event-type threads and urgent status
  const kindScores: Record<string, number> = {
    event: 1.0,
    narrative: 0.6,
    local_opportunity: 0.2,
  };
  const avgKindScore =
    group.threads.reduce(
      (sum, t) => sum + (kindScores[t.kind] ?? 0.5),
      0,
    ) / group.threads.length;
  const urgency = computeUrgency(group.threads);
  return round2(avgKindScore * 60 + urgency * 40);
}

function scoreBranchPublicBenefit(group: BranchGroup): number {
  // Public benefit higher for local_opportunity and community threads
  const kindScores: Record<string, number> = {
    local_opportunity: 0.9,
    narrative: 0.5,
    event: 0.3,
  };
  const avgKindScore =
    group.threads.reduce(
      (sum, t) => sum + (kindScores[t.kind] ?? 0.5),
      0,
    ) / group.threads.length;
  // Also boost for community domain tags
  const communityThreads = group.threads.filter((t) =>
    t.domain_tags.includes("community"),
  );
  const communityBoost =
    group.threads.length > 0
      ? (communityThreads.length / group.threads.length) * 0.3
      : 0;
  return round2(Math.min(100, (avgKindScore + communityBoost) * 100));
}

function scoreBranchActionability(group: BranchGroup): number {
  // Actionability higher for local_opportunity, emerging/active, high confidence
  const kindScores: Record<string, number> = {
    local_opportunity: 0.9,
    narrative: 0.4,
    event: 0.3,
  };
  const avgKindScore =
    group.threads.reduce(
      (sum, t) => sum + (kindScores[t.kind] ?? 0.5),
      0,
    ) / group.threads.length;
  const urgency = computeUrgency(group.threads);
  const avgConf =
    group.threads.reduce((sum, t) => sum + t.confidence, 0) / group.threads.length;
  return round2(((avgKindScore * 0.4 + urgency * 0.3 + avgConf * 0.3) * 100));
}

function scoreBranchPolarizationRisk(group: BranchGroup): number {
  // Polarization risk higher when sources are concentrated
  const concentration = computeSourceConcentration(group.threads);
  // Also consider thread confidence spread (high spread = more polarized)
  const confidences = group.threads.map((t) => t.confidence);
  const disagreement = computeDisagreementIndex(confidences);
  return round2(concentration * 60 + disagreement * 40);
}

function scoreBranchCompressionLoss(
  group: BranchGroup,
  totalThreadCount: number,
): number {
  // Compression loss = how much nuance in this group vs the total
  const uniqueTagsInGroup = new Set(group.threads.flatMap((t) => t.domain_tags));
  const uniqueSourcesInGroup = new Set(
    group.threads.flatMap((t) => Object.keys(t.source_distribution)),
  );
  // More unique items compressed into a single branch = higher loss
  const infoItems = uniqueTagsInGroup.size + uniqueSourcesInGroup.size + group.threads.length;
  // Normalize by total thread count + some baseline
  const normalized = infoItems / Math.max(1, totalThreadCount + 4);
  return round2(Math.min(100, normalized * 100));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Deterministic reducer: takes an array of Threads and produces a RadarSnapshot.
 *
 * **DETERMINISM GUARANTEE**: Same input Threads in any order produce identical
 * output. Achieved by sorting inputs by ID before processing, using stable
 * sort for all intermediate operations, and avoiding any non-deterministic
 * operations (no Date.now(), no Math.random()).
 *
 * @param threads - Array of Thread objects (from clustering)
 * @returns RadarSnapshot containing scoreRanges, disagreementIndex,
 *          narrativeBranches, and compressionLoss
 * @throws Error if threads array is empty
 */
export function reduce(threads: ReadonlyArray<Thread>): RadarSnapshot {
  if (threads.length === 0) {
    throw new Error("Cannot reduce empty threads array");
  }

  // --- DETERMINISM: Sort threads by ID so order doesn't matter ---
  const sorted = [...threads].sort((a, b) => a.id.localeCompare(b.id));

  // --- 1. Compute score ranges per dimension (domain tag) ---
  const dimensionMap = new Map<string, number[]>();
  for (const thread of sorted) {
    const tags = [...thread.domain_tags].sort();
    // If no tags, use thread kind as dimension
    const dimensions = tags.length > 0 ? tags : [thread.kind];
    for (const dim of dimensions) {
      if (!dimensionMap.has(dim)) {
        dimensionMap.set(dim, []);
      }
      dimensionMap.get(dim)!.push(thread.confidence);
    }
  }

  // Sort dimension keys deterministically
  const dimensionKeys = [...dimensionMap.keys()].sort();

  const scoreRanges: ScoreRange[] = dimensionKeys.map((dimension) => {
    const values = [...dimensionMap.get(dimension)!].sort((a, b) => a - b);
    return {
      dimension,
      min: round2(values[0]),
      max: round2(values[values.length - 1]),
      median: computeMedian(values),
    };
  });

  // --- 2. Compute disagreement index ---
  const allConfidences = sorted.map((t) => t.confidence);
  const disagreementIndex = computeDisagreementIndex(allConfidences);

  // --- 3. Generate narrative branches (2-4) ---
  // Group sorted threads by primary category
  const categoryGroups = new Map<string, Thread[]>();
  for (const thread of sorted) {
    const cat = primaryCategory(thread);
    if (!categoryGroups.has(cat)) {
      categoryGroups.set(cat, []);
    }
    categoryGroups.get(cat)!.push(thread);
  }

  // Sort groups by thread count descending, then by category name for stability
  const groupEntries = [...categoryGroups.entries()].sort((a, b) => {
    const countDiff = b[1].length - a[1].length;
    if (countDiff !== 0) return countDiff;
    return a[0].localeCompare(b[0]);
  });

  // Build branch groups: keep top 3, merge rest into an "other" group if needed
  let branchGroups: BranchGroup[];
  if (groupEntries.length <= 4) {
    branchGroups = groupEntries.map(([category, groupThreads]) => ({
      category,
      threads: groupThreads,
    }));
  } else {
    // Keep top 3, merge rest
    branchGroups = groupEntries.slice(0, 3).map(([category, groupThreads]) => ({
      category,
      threads: groupThreads,
    }));
    const mergedThreads = groupEntries
      .slice(3)
      .flatMap(([, groupThreads]) => groupThreads);
    branchGroups.push({
      category: "other",
      threads: mergedThreads,
    });
  }

  // Ensure at least 2 branches by splitting the largest if needed
  if (branchGroups.length < 2 && branchGroups.length === 1) {
    const singleGroup = branchGroups[0];
    if (singleGroup.threads.length >= 2) {
      // Split into two halves by thread kind or confidence
      const half = Math.ceil(singleGroup.threads.length / 2);
      branchGroups = [
        {
          category: singleGroup.category,
          threads: singleGroup.threads.slice(0, half),
        },
        {
          category: `${singleGroup.category} (alternative)`,
          threads: singleGroup.threads.slice(half),
        },
      ];
    } else {
      // Single thread — create a baseline branch and an alternative
      branchGroups = [
        {
          category: singleGroup.category,
          threads: singleGroup.threads,
        },
        {
          category: "baseline",
          threads: singleGroup.threads,
        },
      ];
    }
  }

  // Compute total weighted confidence for probability calculation
  const totalWeightedConfidence = sorted.reduce(
    (sum, t) => sum + t.confidence,
    0,
  );

  const narrativeBranches: NarrativeBranch[] = branchGroups.map((group) => {
    const groupConfidence = group.threads.reduce(
      (sum, t) => sum + t.confidence,
      0,
    );
    const probability =
      totalWeightedConfidence > 0
        ? round4(groupConfidence / totalWeightedConfidence)
        : round4(1 / branchGroups.length);

    // Evidence: sorted thread titles from the group
    const evidence = group.threads.map((t) => t.title).sort();

    return {
      label: group.category,
      probability,
      evidence,
      realism: scoreBranchRealism(group),
      fear: scoreBranchFear(group),
      public_benefit: scoreBranchPublicBenefit(group),
      actionability: scoreBranchActionability(group),
      polarization_risk: scoreBranchPolarizationRisk(group),
      compression_loss: scoreBranchCompressionLoss(group, sorted.length),
    };
  });

  // Normalize probabilities to sum to exactly 1.0
  const probSum = narrativeBranches.reduce((sum, b) => sum + b.probability, 0);
  if (probSum > 0 && Math.abs(probSum - 1) > 0.001) {
    for (const branch of narrativeBranches) {
      branch.probability = round4(branch.probability / probSum);
    }
    // Adjust last branch to absorb rounding error
    const currentSum = narrativeBranches
      .slice(0, -1)
      .reduce((sum, b) => sum + b.probability, 0);
    narrativeBranches[narrativeBranches.length - 1].probability = round4(
      1 - currentSum,
    );
  }

  // --- 4. Compute compression loss ---
  // Measures how much diversity is compressed when reducing to branches.
  // More unique categories, kinds, and source types compressed into fewer
  // branches → higher loss.
  const uniqueCategories = new Set(sorted.map(primaryCategory));
  const uniqueSourceTypes = new Set(
    sorted.flatMap((t) => Object.keys(t.source_distribution).sort()),
  );
  const uniqueKinds = new Set(sorted.map((t) => t.kind));
  const totalDiversity =
    uniqueCategories.size + uniqueKinds.size + uniqueSourceTypes.size;
  const compressionLoss =
    totalDiversity > 0
      ? round2(Math.min(1, Math.max(0, 1 - narrativeBranches.length / totalDiversity)))
      : 0;

  return {
    scoreRanges,
    disagreementIndex,
    narrativeBranches,
    compressionLoss,
  };
}
