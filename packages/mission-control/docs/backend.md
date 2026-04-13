# Mission Control Backend

**Version**: 0.1.0
**Status**: Draft
**Purpose**: Define the backend architecture for mission control news intake, fusion, and delivery.

---

## Overview

Mission Control is the news backend for the Hormuz risk tracking system. It collects signals from multiple sources (Bluesky, Reddit, RSS, official sources), fuses them into threads, and delivers actionable assessments via the AT Protocol.

The architecture is a pipeline, not a monolith.

---

## Core Types

### SignalEvent

Raw incoming item from sources.

```typescript
interface SignalEvent {
  id: UUID;
  timestamp: ISO8601;
  source: 'bluesky' | 'reddit' | 'rss' | 'official';
  provenance: {
    uri: string;
    author?: string;
    platform_id: string;
    fetch_method: 'api' | 'scrape' | 'firehose';
  };
  content: {
    text: string;
    links: string[];
    embeddings?: number[];
    domain_tags: string[];
  };
  raw: unknown;  // Original payload
}
```

### Thread

Merged topic or event.

```typescript
interface Thread {
  id: UUID;
  title: string;
  timeline: SignalEvent[];
  linked_posts: string[];
  source_distribution: Record<string, number>;  // source -> count
  confidence: number;  // 0.0 - 1.0
  created: ISO8601;
  last_updated: ISO8601;
}
```

### GaugeDefinition

Deterministic definition of a metric.

```typescript
interface GaugeDefinition {
  id: string;
  name: string;
  input_rules: InputRule[];
  thresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  explanation: string;
}

interface InputRule {
  atom_type: string;
  weight: number;
  condition?: (signal: SignalEvent) => boolean;
}
```

### ThreadAssessment

Current state of a thread.

```typescript
interface ThreadAssessment {
  thread_id: UUID;
  timestamp: ISO8601;
  score_bands: {
    agency: 'low' | 'medium' | 'high' | 'critical';
    nuance: 'low' | 'medium' | 'high';
    critical: 'low' | 'medium' | 'high' | 'critical';
  };
  disagreement: {
    sources: string[];
    positions: string[];
  }[];
  narrative_branches: NarrativeBranch[];
}
```

### ConnectionOpportunity

A Π object linking a global thread to local actions.

```typescript
interface ConnectionOpportunity {
  id: UUID;
  thread_id: UUID;
  type: 'awareness' | 'preparation' | 'action' | 'signal';
  scope: 'individual' | 'community' | 'network';
  effort: 'trivial' | 'low' | 'medium' | 'high';
  expected_benefit: string;
  risk: string;
  feedback_metric: string;
}
```

### ActionCard

Specific suggested action with bounds.

```typescript
interface ActionCard {
  id: UUID;
  opportunity_id: UUID;
  title: string;
  description: string;
  scope: string;
  effort: string;
  expected_benefit: string;
  risk: string;
  feedback_metric: string;
  verification_steps: string[];
}
```

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTAKE LAYER                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │  Bluesky  │  │  Reddit   │  │   RSS     │  │ Official  │     │
│  │ Collector │  │ Collector │  │ Collector │  │ Collector │     │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘     │
│        │              │              │              │            │
│        └──────────────┴──────────────┴──────────────┘            │
│                              │                                    │
│                              ▼                                    │
│                    ┌─────────────────┐                           │
│                    │ Normalizer      │                           │
│                    │ (SignalEvent)   │                           │
│                    └────────┬────────┘                           │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   IDENTITY + PROVENANCE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Deduper   │  │   Linker     │  │   Scorer     │            │
│  │  (posts)     │  │ (chains)      │  │ (freshness)  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                    │
│         └─────────────────┴──────────────────┘                    │
│                           │                                      │
│                           ▼                                      │
│                 ┌─────────────────┐                              │
│                 │  Thread Builder │                              │
│                 └────────┬────────┘                              │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FUSION LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Entity      │  │  Relation    │  │  Timeline    │            │
│  │  Extraction  │  │  Mapping     │  │  Assembly    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                    │
│         └─────────────────┴──────────────────┘                    │
│                           │                                      │
│                           ▼                                      │
│                 ┌─────────────────┐                              │
│                 │ Graph Writer    │                              │
│                 └────────┬────────┘                              │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUNCIL LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    Duck     │  │   Openhax    │  │  Openskull   │            │
│  │ (commander) │  │ (collector)  │  │(red-teamer)  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                    │
│         └─────────────────┴──────────────────┘                    │
│                           │                                      │
│                           ▼                                      │
│                 ┌─────────────────┐                              │
│                 │  Assessor       │                              │
│                 │(ThreadAssess)   │                              │
│                 └────────┬────────┘                              │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ACTION LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Connection   │  │  Action      │  │  Delivery    │            │
│  │ Opportunities│  │  Cards        │  │  (AT Proto)  │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                    │
│         └─────────────────┴──────────────────┘                    │
│                           │                                      │
│                           ▼                                      │
│                 ┌─────────────────┐                              │
│                 │  User/Channel   │                              │
│                 └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Intake Layer

### Collectors

Each source has a dedicated collector that normalizes to `SignalEvent`.

#### Bluesky Collector

- Uses Jetstream firehose or API polling
- Tracks DIDs for identity verification
- Applies domain tags based on post content

#### Reddit Collector

- Pushshift or API polling
- Tracks subreddit reputation
- Applies flair-based domain tags

#### RSS Collector

- Standard RSS/Atom parsing
- Extracts links and embedding metadata

#### Official Collector

- Scrape or API for UKMTO, MARAD, IEA
- Highest source trust by default
- Domain tags: `official`, `maritime`, `energy`

### Normalizer

Converts source-specific payloads to `SignalEvent`:

```clojure
(defn normalize [source payload]
  {:id (uuid)
   :timestamp (->timestamp payload)
   :source source
   :provenance {:uri (->uri payload)
                :author (->author payload)
                :platform_id (->id payload)
                :fetch_method (->method source)}
   :content {:text (->text payload)
             :links (->links payload)
             :embeddings nil  ; computed later
             :domain_tags (->tags source payload)}
   :raw payload})
```

---

## Identity + Provenance Layer

### Deduper

Tracks posts, reposts, screenshots, quote-post chains to avoid counting the same event multiple times.

```clojure
(defn dedupe [events]
  (let [seen (atom #{})]
    (filter (fn [e]
              (let [sig (signature e)]
                (when-not (@seen sig)
                  (swap! seen conj sig)
                  true)))
            events)))
```

### Linker

Builds quote chains and reply chains to understand narrative propagation.

### Scorer

Computes freshness decay based on time and source trust.

```clojure
(defn freshness-score [event now]
  (let [age-hours (age-hours event now)
        decay (Math/pow 0.5 (/ age-hours 24.0))
        source-trust (->trust (:source event))]
    (* decay source-trust)))
```

---

## Fusion Layer

### Entity Extraction

Named entity recognition for:
- Locations
- Organizations
- Vessels
- Events

### Relation Mapping

Builds graph edges between entities:
- `VESSEL -> OWNED_BY -> COMPANY`
- `EVENT -> OCCURRED_AT -> LOCATION`
- `COMPANY -> OPERATES_IN -> REGION`

### Timeline Assembly

Orders events into coherent narratives per thread.

---

## Council Layer

The cephalon council processes fused threads:

| Council Member | Role |
|----------------|------|
| **Duck** | Commander: long memory, historical continuity, final synthesis |
| **Openhax** | Collector: expands perception, finds novel signals |
| **Openskull** | Red-teamer: stress-tests interpretations, finds contradictions |

### Assessor Output

```clojure
{:thread_id UUID
 :score_bands {:agency :high :nuance :medium :critical :low}
 :disagreement [{:sources [source-a source-b]
                 :positions [position-a position-b]}]
 :narrative_branches [{:narrative String :confidence 0.7 :sources [...]}]}
```

---

## Action Layer

### Connection Opportunities

Π objects linking global threads to local actions:

```clojure
{:type :awareness  ; or :preparation :action :signal
 :scope :individual  ; or :community :network
 :effort :low  ; or :trivial :medium :high
 :expected_benefit String
 :risk String
 :feedback_metric String}
```

### Action Cards

Concrete actions with verification:

```clojure
{:title String
 :description String
 :scope String
 :effort String
 :expected_benefit String
 :risk String
 :feedback_metric String
 :verification_steps [String]}
```

---

## AT Protocol Delivery

Use AT Protocol for federated distribution:

- Store `SignalEvent`, `Thread`, `Assessment` in content-addressed repos
- Publish to firehose
- Allow subscription by DID or collection

---

## Constraints

- Free devops resources from [free-for-dev](https://github.com/ripienaar/free-for-dev)
- Minimize SQL database usage
- If it doesn't need to be private, keep it on AT Protocol

---

## References

- `research/mission-control-news-backend.md` - Original 7213-line design
- `research/hormuz-risk-tracking-design.md` - Threat radar integration
- `packages/sintel/CHARTER.md` - Upstream perception layer