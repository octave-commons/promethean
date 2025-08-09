Schema evolution workflow with upcasters + dual-write, DLQ with replay, Mongo changefeeds to topics, and a CI linter for topic/schema/header hygiene.

Includes:
- Upcast chains (vN→latest) and normalize-on-subscribe
- Dual-write helper (stamp x-schema-version + optional topic.vN)
- DLQ publish + replay helper
- Mongo changefeed watcher with resume tokens
- CI script to lint topic names and header keys

Related: [broker-outbox-acl-ops](broker-outbox-acl-ops.md), [event-bus-projections-diagrams](event-bus-projections-diagrams.md) [unique/index](../../unique-notes/index.md)

#tags: #broker #schema #dlq #changefeed #ci

