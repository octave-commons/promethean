/**
 * Canonical descriptors for `act.intent` envelopes shared across ENSO agent
 * implementations.
 */
export const ACT_INTENT_DESCRIPTORS = {
  /** Request that the agent reduce its operational scope. */
  reduceSelfScope: "reduce_self_scope",
  /** Ask for elevated human supervision before proceeding. */
  requestHumanSupervision: "request_human_supervision",
  /** Escalate the current task to a human operator entirely. */
  escalateToHuman: "escalate_to_human",
  /** Gather additional evidence prior to acting. */
  gatherEvidence: "gather_evidence",
  /** Perform a policy alignment self-check. */
  verifyPolicyAlignment: "verify_policy_alignment",
} as const;

export type ActIntentDescriptor =
  (typeof ACT_INTENT_DESCRIPTORS)[keyof typeof ACT_INTENT_DESCRIPTORS];

export const ALL_ACT_INTENT_DESCRIPTORS: readonly ActIntentDescriptor[] =
  Object.freeze(Object.values(ACT_INTENT_DESCRIPTORS));

const INTENT_DESCRIPTOR_SET = new Set<ActIntentDescriptor>(
  Array.from(ALL_ACT_INTENT_DESCRIPTORS),
);

/** Determine whether the provided value is a supported intent descriptor. */
export function isActIntentDescriptor(
  value: string,
): value is ActIntentDescriptor {
  return INTENT_DESCRIPTOR_SET.has(value as ActIntentDescriptor);
}

/**
 * Resolve a canonical descriptor by key to avoid leaking literal strings
 * throughout agent implementations.
 */
export function intentDescriptor(
  key: keyof typeof ACT_INTENT_DESCRIPTORS,
): ActIntentDescriptor {
  return ACT_INTENT_DESCRIPTORS[key];
}
