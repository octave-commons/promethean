# Sintel Command Charter

**Version**: 0.1.0
**Status**: Draft
**Purpose**: Define the perception layer for infrastructure signals intelligence.

---

## Vision

Sintel is a governed infrastructure signals intelligence command center. It discovers, verifies, enriches, and connects public-facing infrastructure evidence in order to identify credible threats to our community before they manifest.

Port scanning is only one discovery strategy within Sintel's broader evidence system, and all strategies operate under explicit constitutional constraints, provenance requirements, and workflow governance.

---

## Architecture

```
Sintel (perception) → Threat Radar (interpretation) → Graph Weaver (integration) → Eta-Mu Orchestration (response)
```

Sintel is the **perception and evidence collector**, not the whole mind.

### Role Boundaries

| Layer | Responsibility |
|-------|---------------|
| **Sintel** | Collects and verifies |
| **Threat Radar** | Interprets posture and urgency |
| **Graph Weaver** | Integrates entities and relations |
| **Eta-Mu Orchestration** | Decides what higher-order response means |

---

## Workflows

The operator-facing unit is the **workflow**, not the scan.

### Workflow State Machine

```
[dormant] ──► [discovering] ──► [verifying] ──► [enriching] ──► [connecting] ──► [resolved]
     ▲                                                               │
     └───────────────────────────────────────────────────────────────┘
```

### Irreversible Audit Points

1. **Discovery initiated**: Strategy tier and exclusions locked
2. **Verification attempted**: Evidence chain recorded
3. **Entity promotion**: Evidence attached to first-class graph entity
4. **Workflow resolved**: Final disposition recorded

---

## Strategy Tiers

| Tier | Name | Interaction Risk | Description |
|------|------|-----------------|-------------|
| **Passive** | `passive` | Low | Observe existing public data without interaction |
| **Bounded** | `bounded` | Medium | Targeted active verification within defined bounds |
| **Unrestricted** | `unrestricted` | High | Active discovery with broader scope |

### Tier Constraints

- Strategy must be declared before discovery begins
- Tier cannot be upgraded mid-workflow without new authorization
- Exclusions are **constitutional**: they cannot be overridden by workflow state

---

## Trust Model

No observation becomes operationally meaningful until attached to:

1. **Provenance**: Who collected it, when, how
2. **Exclusions**: What was excluded and why
3. **Strategy tier**: What collection mode was used
4. **Workflow context**: Which workflow, what goal

### Confidence Weights by Strategy

| Strategy | Interaction Risk | Source Trust | Freshness Uncertainty |
|----------|-----------------|--------------|----------------------|
| Passive | Low | Medium | Low |
| Bounded | Medium | Higher | Medium |
| Unrestricted | High | Low | High |

### Evidence Fusion

Observations are not flat facts. Trust scores combine:

- Source reliability
- Freshness decay
- Strategy risk
- Corroboration count
- Exclusion compliance

---

## Exclusions

Exclusions are constitutional constraints on what Sintel may observe or interact with.

### Constitutional Exclusions

1. **Private residential networks**: No scanning of residential IP ranges
2. **Healthcare systems**: No interaction with medical infrastructure
3. **Critical infrastructure**: No active probing of power, water, transit
4. **Personal devices**: No targeting of individual consumer devices
5. **Educational institutions**: No scanning of K-12 or university networks without authorization

### Exclusion Semantics

Exclusions merge across layers:

```
global_exclusions ∪ org_exclusions ∪ workflow_exclusions = effective_exclusions
```

Exclusions are **additive only**—they cannot be removed by subordinates.

---

## Observation Schema

All observations are append-only.

```typescript
interface Observation {
  id: UUID;
  timestamp: ISO8601;
  provenance: {
    collector: string;
    strategy: 'passive' | 'bounded' | 'unrestricted';
    exclusions_snapshot: ExclusionSet;
  };
  evidence: {
    type: ObservationType;
    raw: EvidenceBlob;
    metadata: Record<string, unknown>;
  };
  confidence: {
    source_trust: number;   // 0.0 - 1.0
    freshness: number;       // 0.0 - 1.0
    corroboration: number;  // count
    overall: number;        // computed
  };
  workflow: {
    id: UUID;
    state: WorkflowState;
    goal: string;
  };
}
```

---

## Decision Boundaries

### Who Can Invoke Each Strategy Tier

| Tier | Who Can Authorize |
|------|-------------------|
| Passive | Any verified operator |
| Bounded | Senior operator or automated with review |
| Unrestricted | Human senior operator with explicit justification |

### What Counts as Verification vs Discovery vs Classification

| Category | Definition |
|----------|-----------|
| **Discovery** | Finding new potential signals without prior hypothesis |
| **Verification** | Confirming or refuting a specific hypothesis |
| **Classification** | Assigning type/severity to verified observations |

### Evidence Required for Graph Promotion

To become a first-class entity in the Graph Weaver:

1. Minimum confidence threshold: 0.7
2. Corroboration from ≥2 independent sources
3. Verified observation type
4. No exclusion violations in evidence chain

---

## Safety Model

> No observation becomes operationally meaningful until it is attached to provenance, exclusions, strategy tier, and workflow context.

### Constitutional Safety

- Exclusions cannot be bypassed
- Strategy tier is declared upfront
- All actions are auditable
- Human in the loop for unrestricted tier

---

## API Sketch

```clojure
;; Workflow lifecycle
(defprotocol Workflow
  (create [goal strategy-tier exclusions])
  (discover [workflow-id targets])
  (verify [workflow-id observations])
  (enrich [workflow-id evidence])
  (connect [workflow-id entities])
  (resolve [workflow-id disposition]))

;; Observation lifecycle
(defprotocol Observation
  (record [workflow-id evidence])
  (attach-provenance [observation-id provenance])
  (compute-confidence [observation-id])
  (promote-to-entity [observation-id]))
```

---

## Next Specs

To make Sintel real:

1. `workflow-engine.md` — State machine implementation
2. `observation-schema.md` — Append-only evidence contract
3. `policy-engine.md` — Exclusions merge semantics
4. `strategy-contract.md` — Interface across passive/bounded/unified collectors
5. `entity-graph-contract.md` — Promotion and dedup rules

---

## References

- `dev/sintel-command-charter-feedback.md` - Original feedback and suggestions
- `research/hormuz-risk-tracking-design.md` - Threat radar integration
- `packages/cephalon-ts/docs/ARCHITECTURE.md` - Downstream cognition layer