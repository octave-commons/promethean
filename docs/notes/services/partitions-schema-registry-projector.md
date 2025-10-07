Stateful partitions $jump hash + coordinator + subscribePartitioned$, a Zod-backed schema registry with compat checks, and a Mongo changelog projector $topic→collection with upserts/tombstones$.

Highlights:
- Rendezvous-style assignment per partition; periodic rebalance
- Publish wrapper to stamp schema version and optional partition id
- Registry validates payloads and basic compat $backward/forward$
- Projector materializes compaction streams to collections

Related: $[schema-evolution-dlq-changefeed]$, $[event-bus-projections-diagrams]$ $[../../unique/index|unique/index]$

#tags: #broker #partitions #schema #mongo #projectors

