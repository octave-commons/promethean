Schema evolution workflow with upcasters + dual-write, DLQ with replay, Mongo changefeeds to topics, and a CI linter for topic/schema/header hygiene.

Includes:
- Upcast chains $vN→latest$ and normalize-on-subscribe
- Dual-write helper $stamp x-schema-version + optional topic.vN$
- DLQ publish + replay helper
- Mongo changefeed watcher with resume tokens
- CI script to lint topic names and header keys

Related: $[broker-outbox-acl-ops]$, $[event-bus-projections-diagrams]$ $[../../unique/index|unique/index]$

#tags: #broker #schema #dlq #changefeed #ci

