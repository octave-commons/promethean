# radar-core

Shared data model and processing pipeline for the threat-radar platform. Provides Zod schemas, signal normalization, TF-IDF clustering, snapshot reduction, and cross-thread connection detection.

## Key Exports

| Module | What it provides |
|---|---|
| `schema` | Zod schemas: `SignalEvent`, `Thread`, `ConnectionOpportunity`, `ActionCard`, `Radar`, `SourceDefinition`, `RadarAssessmentPacket`, `LiveSnapshot`, `DailySnapshot` |
| `normalize` | `normalize()` — clean text, extract categories, compute quality scores, generate content hashes |
| `cluster` | `cluster()` — group signals into `Thread` objects using TF-IDF cosine similarity |
| `reducer` | `reduce()` — merge assessment packets into live radar snapshots |
| `snapshot-reducer` | `reduceSnapshot()` — deterministic snapshot reduction with median/IQR aggregation |
| `connections` | `detectConnections()` — find cross-thread links and generate `ConnectionOpportunity` + `ActionCard` |
| `evidence` | Evidence tracking and provenance utilities |
| `audit` | Audit event creation and typing |

## Install

This is a workspace package — consumed via `pnpm` workspace protocol:

```json
{ "@workspace/radar-core": "workspace:*" }
```

## Build

```bash
pnpm --filter @workspace/radar-core build
```

## Tests

```bash
pnpm --filter @workspace/radar-core test
```

## Usage

```typescript
import { normalize, cluster, detectConnections } from "@workspace/radar-core";

const signal = normalize({ text: "...", provenance: "bluesky", ... });
const threads = cluster(signals);
const { connections, cards } = detectConnections(threads);
```

## License

GPL-3.0-only
