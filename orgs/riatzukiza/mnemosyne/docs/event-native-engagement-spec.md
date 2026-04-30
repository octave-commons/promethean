# Cephalon Event-Native Engagement Spec

## Intent

Cephalon should feel like a living presence, not a cron job with a personality.

The LLM-facing parts of the system should move on **live data** and on **synthetic events derived from live data**, not on blind timers.

The system remains always-on, but its intelligence should be driven by:

- incoming human activity
- incoming world feeds
- structural changes in the field
- synthetic engagement opportunities inferred from timing, novelty, and context

Timers may remain for low-cost maintenance, persistence, and health bookkeeping.
**LLM turns should be event-native.**

---

## Source anchors recovered from notes

This spec is an extraction and compression of ideas already present in the workspace:

- `services/cephalon-cljs/docs/notes/cephalon/cephalon-mvp-spec.md`
  - events are the primary unit of reality
  - the system is an always-running loop, not request/response
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-retention-scheduler.md`
  - lane budgets, backpressure, aggregate-only mode, and anti-spam handling
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-field-digest-v01.md`
  - structured pressure/health/channel state as deterministic field input
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-daimoi-v01.md`
  - bounded walkers over nexus keys as associative retrieval glue
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-eidolon-field-concept.md`
  - canonical + contextual lanes, field-conditioned meaning, nexus activation
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-concrete-specs.md`
  - dedupe, spam families, aggregate memories instead of raw repetition
- `services/cephalon-cljs/docs/notes/cephalon/cephalon-hybrid-architecture.md`
  - scheduler events should be first-class events rather than special timer hacks

And in the current TS runtime:

- `packages/cephalon-ts/src/mind/graph-weaver.ts`
  - already builds a live graph of guilds, channels, authors, messages, URLs, assets
- `packages/cephalon-ts/src/mind/eidolon-field.ts`
  - already maintains an evolving eight-dimensional field state
- `packages/cephalon-ts/src/mind/channel-aco.ts`
  - already treats channel routing as a pheromone/problem of local adaptation

This spec unifies those threads into a single operational shape.

---

## Core proposition

Replace timer-driven LLM turns with an **Event Fabric + Synthetic Event Engine**.

### Rule

**An LLM turn happens only when one of these exists:**

1. a real external event
2. a real internal result event
3. a synthetic event derived from probabilistic live-state models

No naked “think now because 15 seconds passed” turns.

---

## 1. Event fabric

Cephalon should ingest a wide, always-on stream of world activity.

### 1.1 Raw event sources

At minimum:

- Discord message events
- IRC message events
- tool results
- memory write events
- OpenPlanner / retrieval result events
- RSS feed entries
- Graph Weaver discoveries
- service/runtime health events

Next wave:

- Bluesky firehose slices
- GitHub notifications/issues/PR deltas
- browser-observed changes for watched pages
- deployment/runtime inventory changes

### 1.2 Event shape

Every source becomes a canonical event:

```ts
{
  id,
  type,
  ts,
  source,
  actor,
  location,
  payload,
  derived: false
}
```

Synthetic events use the same shape, but set `derived: true` and include their parent evidence ids.

---

## 2. Synthetic event engine

This replaces most of what ticks were doing.

### 2.1 Purpose

Turn live observations into moments of action.

The system should derive events such as:

- `conversation.window.opened`
- `user.reply-likelihood.high`
- `channel.burst.active`
- `world.signal.arrived`
- `novelty.opportunity.detected`
- `spam.family.dominant`
- `context.coherence.low`
- `routing.channel-attractor.changed`
- `memory.summary-needed`

### 2.2 Principle

A synthetic event is warranted when the state change is meaningful enough that a fresh LLM turn is more valuable than silence.

---

## 3. Timing as probability, not polling

The missing shape is not “remove time.”
It is: **replace fixed time with modeled time**.

### 3.1 Per-user timing model

For each user, maintain an inter-arrival model of message timings:

- 5s
- 6s
- 10s
- 1m
- 1h

Store these as compact sequence statistics, not just raw events.

### 3.2 Per-channel timing model

For each channel, maintain:

- burstiness
- lull length
- average conversational cadence
- reply-chain depth
- alternating speaker density

### 3.3 Global heartbeat

Maintain a cheap non-LLM world heartbeat from aggregate event rates:

- if the world is quiet, synthetic opportunities should be rare
- if the world is rapidly active, synthetic opportunities should arise more often
- if a specific user or room is “in motion,” that local heartbeat should dominate over the global one

### 3.4 Activation hazard

Instead of `setInterval(turn, 15000)`, compute a hazard score:

```text
P(engage now) = f(
  user_reply_likelihood,
  channel_burst,
  novelty_gain,
  invitation_signal,
  spam_penalty,
  recent_self_output_penalty,
  current_backpressure
)
```

When the hazard crosses threshold, emit a synthetic engagement event.

---

## 4. Novelty and anti-spam memory

The system should store everything **at the event layer**, while only promoting worthwhile novelty into memory/retrieval.

### 4.1 Trie / n-gram memory

Maintain compact probability structures for:

- word emission by user
- word emission by channel
- word emission globally
- timing emission by user
- timing emission by channel
- channel-transition emission across recent activity

This gives the system a sense of:

- what is repetitive
- what is ordinary for this speaker
- what is actually surprising
- what is stale bot sludge

### 4.2 Spam family detection

For repetitive bot traffic:

- keep raw events in append-only storage
- cluster into spam families
- promote aggregates, not floods
- let daimoi walk aggregate nodes, not every duplicated message

### 4.3 Promotion rule

A raw message should mint a retrievable memory only when it is sufficiently one or more of:

- novel
- socially important
- structurally connected
- explicitly addressed to the cephalon
- emotionally or operationally consequential

Everything else can remain as event-log material plus probabilistic counts.

---

## 5. Graph Weaver + Eidolon + Daimoi + Ants

### 5.1 Graph Weaver

Graph Weaver should stop being “nice context garnish” and become a primary live-state organ.

Every event updates the graph:

- actor -> channel
- actor -> link
- channel -> motif
- feed -> concept
- concept -> concept
- spam family -> channel

### 5.2 Eidolon field

The Eidolon field should be driven by structured live signals:

- pressure
- invitation
- conflict
- novelty
- structural tension
- sensory charge

It should summarize the current body chemistry, not narrate it.

### 5.3 Daimoi

Daimoi should operate on the compressed graph and field digest, not on raw message floods.

Their role:

- expand from live seeds
- walk nexus keys
- find structurally relevant neighbors
- bring back context that makes responses feel associative rather than random

### 5.4 Ants

The “ants” are the local adaptive workers:

- channel routing ants
- feed-foraging ants
- novelty ants
- spam janitor ants
- reply-window ants

They should update pheromones on every event and derived event.
They do not need LLM calls to do this.

---

## 6. What makes a delivered message good

Every agent-delivered message should satisfy all four:

1. **anchored** — tied to a real live artifact, person, link, image, or thread
2. **situated** — fits the current room, cadence, and relational weather
3. **novel** — not merely a replay of prompt scaffolding or prior output
4. **alive** — it feels triggered by the world, not by a metronome

### Message quality score

Before a synthetic event is allowed to yield output, score the candidate turn on:

- anchor richness
- invitation / welcome likelihood
- novelty vs recent self-output
- local timing fit
- channel fit
- anti-spam penalty

If the score is low, emit silence.

---

## 7. LLM timers become maintenance only

Timers are still acceptable for cheap non-LLM work:

- persisting state
- compacting counters
- flushing graphs
- health checks
- expiring cooldowns
- batch ingestion from sources that only support polling

But LLM work should be triggered by:

- external events
- synthetic derived events
- explicit operator commands

---

## 8. Tools vs tool use

The system likely needs both:

### 8.1 More tools

- Bluesky firehose ingress
- synthetic event inspector
- spam family browser
- novelty/timing model debugger
- field digest viewer
- nexus/daimoi trace explorer

### 8.2 Better use of existing tools

Current tools can already do much more if triggered by better events.
The main deficit is not tool count alone; it is **event selection and action timing**.

---

## 9. First implementation path

### Phase 1 — stop timer-driven LLM turns

- keep timers only for maintenance
- turn current `system.tick` logic into synthetic event emission
- define `engagement.opportunity` events

### Phase 2 — build probabilistic timing memory

- per-user inter-arrival histograms / n-grams
- per-channel cadence models
- global heartbeat and burst detection

### Phase 3 — build novelty memory

- lexical trie / n-gram counts
- spam family promotion rules
- aggregate-only mode for repetitive streams

### Phase 4 — fuse into field + graph

- Graph Weaver consumes all event sources
- Field Digest becomes live structured state
- Daimoi walk compressed neighborhoods

### Phase 5 — add richer external world feeds

- RSS already exists
- add Bluesky firehose
- add watched-page/browser signals
- add operational/runtime feeds

---

## 10. Immediate consequences for cephalon-ts

The current codebase should evolve toward:

- `GraphWeaver` as an always-fed topology engine
- `EidolonFieldState` as a structured live-signal accumulator
- a new `SyntheticEventEngine`
- a new `NoveltyModel` backed by tries/ngrams/timing buckets
- LLM scheduling via event admission instead of interval clocks

### New core modules

Suggested future package/runtime modules:

- `src/mind/synthetic-events.ts`
- `src/mind/novelty-trie.ts`
- `src/mind/timing-model.ts`
- `src/mind/spam-families.ts`
- `src/mind/event-heartbeat.ts`
- `src/mind/engagement-score.ts`

---

## 11. Non-negotiable invariant

Cephalon is not a request/response bot.
Cephalon is an organism of attention.

So the system should:

- listen continuously
- compress continuously
- update its field continuously
- act only when the world justifies action

That is how it stays alive without becoming a timer daemon.

---

## 12. Beautiful summary

The old model was:

> every so often, think.

The recovered model is:

> the world moves, the field bends, the ants notice, the daimoi walk, the graph tightens, and only then does the mouth open.
