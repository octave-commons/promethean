# @open-hax/sintel

Perception layer for infrastructure signals intelligence.

## Overview

Sintel is a governed infrastructure signals intelligence command center. It discovers, verifies, enriches, and connects public-facing infrastructure evidence in order to identify credible threats before they manifest.

Key concepts:
- **Workflow**: The operator-facing unit governing all observation collection
- **Observation**: Append-only evidence records with provenance and confidence
- **Entity**: First-class graph objects promoted from verified observations
- **Exclusions**: Constitutional constraints on what may be observed

## Architecture

```
[dormant] ──► [discovering] ──► [verifying] ──► [enriching] ──► [connecting] ──► [resolved]
     ▲                                                               │
     └───────────────────────────────────────────────────────────────┘
```

Sintel is the **perception layer** (η) in the Eta-Mu-Pi architecture:
- **Sintel** (η) — Collects and verifies signals
- **Cephalon** (μ) — Synthesizes and decides
- **Action** (Π) — Transforms world

## Installation

```bash
pnpm install @open-hax/sintel
```

## Usage

### Create a Workflow

```typescript
import { WorkflowEngine, InMemoryWorkflowStore } from '@open-hax/sintel';

const store = new InMemoryWorkflowStore();
const engine = new WorkflowEngine(store);

const workflow = await engine.create({
  goal: 'Monitor infrastructure for anomalous ports',
  strategy: 'passive',
  exclusions: { global: [], org: [], workflow: [], effective: [] },
  created_by: 'operator-001'
});
```

### Collect Observations

```typescript
import { ObservationCollector, PassiveStrategy } from '@open-hax/sintel';

const collector = new ObservationCollector(obsStore, exclusionPolicy);
const strategy = new PassiveStrategy();

for await (const result of collector.collect(
  workflow.id,
  provenance,
  exclusions,
  strategy,
  targets
)) {
  if ('type' in result && result.type === 'exclusion_violation') {
    console.log('Skipped excluded target:', result.target);
  } else {
    console.log('Collected:', result.id);
  }
}
```

### Promote to Entity

```typescript
import { PromotionEngine } from '@open-hax/sintel';

const promoEngine = new PromotionEngine(entityStore);

const check = promoEngine.checkPromotion(observation);
if (check.can_promote) {
  const entity = await promoEngine.promote(observation, 'host', {
    hostname: 'example.com',
    ip: '1.2.3.4'
  });
}
```

## Strategy Tiers

| Tier | Authorization | Description |
|------|---------------|-------------|
| `passive` | Any operator | Observe existing public data without interaction |
| `bounded` | Senior operator | Targeted active verification within defined bounds |
| `unrestricted` | Senior with justification | Active discovery with broader scope |

## Exclusions

Constitutional exclusions cannot be bypassed:
- Private residential networks
- Healthcare systems
- Critical infrastructure
- Personal devices
- Educational institutions

Exclusions are additive: `global ∪ org ∪ workflow`

## Confidence Scoring

```typescript
interface Confidence {
  source_trust: number;    // 0.0 to 1.0, based on strategy tier
  freshness: number;       // 0.0 to 1.0, decays over time
  corroboration: number;   // count of independent sources
  strategy_risk: number;   // adjustment for collection method
  overall: number;        // computed composite
}
```

## Promotion Requirements

To become a first-class entity:
- Minimum confidence: 0.7
- Minimum corroboration: 2 independent sources
- Verified observation type
- No exclusion violations in evidence chain

## Integration with Signal Packages

Sintel outputs can be converted to Signal Observations for the Threat Radar:

```typescript
import { toSignalObservation } from '@open-hax/sintel';

const signalObs = toSignalObservation(sintelObservation);
// Compatible with @open-hax/signal-contracts
```

## License

GPL-3.0-only