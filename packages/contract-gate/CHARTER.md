# Contract-Enforced Output Pipeline

**Version**: 0.1.0
**Status**: Draft
**Purpose**: Turn EDN response contracts into deterministic runtime checks with targeted repair prompts.

---

## Problem

Fast, goal-oriented models produce useful work but may shortcut response contracts. GPT-family models appear more contract-sensitive and can act as reviewers.

## Goal

Turn EDN response contracts into:
1. Deterministic runtime checks (structure gate)
2. Targeted repair prompts (repair gate)
3. Semantic review (review gate)

---

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Contract  │───→│   Fast      │───→│  Structure  │───→│   GPT       │
 │   (EDN)    │    │   Generator │    │   Gate      │    │   Reviewer │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                   │                  │
                          │                   ▼                  │
                          │           ┌─────────────┐          │
                          │           │   Repair    │          │
                          │           │   Prompt    │          │
                          │           └─────────────┘          │
                          │                   │                  │
                          └───────────────────┼──────────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │   Accept/   │
                                       │   Reject    │
                                       └─────────────┘
```

---

## Components

| Component | Responsibility |
|-----------|----------------|
| **EDN Contract** | Defines required sections, ordering, cardinality, local section constraints, review rubric, repair templates |
| **CLJS Runtime** | Loads contract, normalizes it, orchestrates generation, validation, repair, review, final acceptance |
| **Fast Generator** | Produces initial task output quickly, optimized for throughput |
| **Markdown Parser** | Converts model output into AST for deterministic shape checks |
| **Structure Validator** | Enforces exact section names, order, allowed node types, rules like "Next contains exactly one action" |
| **Repair Prompt Generator** | Produces minimal corrective prompts from validator failures |
| **GPT Reviewer** | Evaluates contract fidelity, shortcutting, alignment with session context |
| **Final Arbiter** | Accepts, rejects, or requests another revision based on thresholds |

---

## Contract IR

The source of truth is an EDN contract that compiles into a normalized internal representation.

```clojure
{:contract/name "operation-mindfuck.v1"
 :contract/sections
 [{:section/name "Signal"
   :section/required true
   :section/order 1
   :section/cardinality {:min 1 :max 1}
   :section/children []}

  {:section/name "Evidence"
   :section/required true
   :section/order 2
   :section/cardinality {:min 1 :max 1}
   :section/children []}

  {:section/name "Frames"
   :section/required true
   :section/order 3
   :section/cardinality {:min 2 :max 3}
   :section/children []}

  {:section/name "Countermoves"
   :section/required true
   :section/order 4
   :section/cardinality {:min 2 :max 3}
   :section/children []}

  {:section/name "Next"
   :section/required true
   :section/order 5
   :section/cardinality {:min 1 :max 1}
   :section/children []
   :section/rules
   [{:rule/type "exactly-one-action"
     :rule/description "Next contains exactly one small next action"}]}]

 :contract/repair-templates
 {:section-missing "Missing required section: {section}. Add it with the appropriate content."
  :section-order "Section {section} appears out of order. Move it after {prev-section}."
  :cardinality-violation "Section {section} has {actual} items, expected {min}-{max}."
  :rule-violation "Section {section} violates rule: {rule}."}

 :contract/review-rubric
 {:contract-fidelity {:weight 0.5
                      :description "How well the response follows the contract structure"}
  :shortcut-avoidance {:weight 0.3
                       :description "Whether the response avoids shortcuts mentioned in contract"}
  :context-alignment {:weight 0.2
                      :description "Alignment with session context"}}}
```

---

## Phases

| Phase | Deliverable | Verification |
|-------|-------------|--------------|
| **1. Contract IR** | EDN schema for response structure, repair rules, review rubric | Load sample contracts and normalize without ambiguity |
| **2. Markdown Gate** | Parser + AST validator for headings, order, cardinality, local section constraints | Pass/fail on gold set of valid/invalid responses |
| **3. Repair Loop** | Failure-to-repair prompt compiler that names exact violations | Invalid samples corrected within bounded retries |
| **4. Review Gate** | GPT-family review prompt + scoring schema using contract + session history | Reviewer scores correlate with known good/bad examples |
| **5. Orchestration** | End-to-end pipeline with generation, validation, repair, review, final decision | Deterministic receipts show each stage's input, output, score, decision |

---

## Verification

### Unit Tests

- Contract normalization
- Rule compilation
- AST validation
- Repair-prompt generation

### Fixture Tests

- Known-good and known-bad Markdown outputs for each response shape rule

### Loop Tests

- Fast model intentionally generates malformed outputs
- System repairs them within retry limits

### Review Tests

- Reviewer sees identical output with and without relevant session history
- Scoring changes only where context matters

### Acceptance Criteria

At least one reference contract can be enforced end-to-end with:
- Deterministic structure checks
- Bounded repair cycles
- Reviewer scoring

---

## Receipts

Verification produces receipts, not impressions.

A valid run shows:
- Loaded contract version
- Initial candidate output
- AST validation results
- Any repair deltas applied
- Reviewer scores
- Final accept/reject decision

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Structure correctness ≠ contract satisfaction | Keep structure pass/fail deterministic; reviewer scope narrow |
| Reviewer drift | Keep reviewer focused on contract deltas, not style |
| Contract bloat | Treat response structure as first enforced slice; add semantics incrementally |
| Retry explosion | Bounded retries with escalation |

---

## Open Questions

1. What is the minimum normalized contract vocabulary for structure, repair, and review?
2. Should repair prompts be generated from declarative rule IDs only, or include natural-language explanations?
3. What retry bound is acceptable before escalation or failure?

---

## Definition of Done

A candidate response either:
- Passes the structure gate and review gate, OR
- Returns a machine-readable failure report with actionable repair instructions.

---

## References

- `dev/contract-enforced-output-pipeline.md` - Original spec draft
- `packages/cephalon-ts/docs/ARCHITECTURE.md` - Downstream cognition layer