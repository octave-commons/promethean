HTTP snapshot API with ETags, transactional projector (multi-collection commit), time-travel reconstruction helper, and a dev harness for end-to-end tests.

Includes:
- /snap/:key + /list API with caching
- startTransactionalProjector(db, bus, { handler }) with retries
- reconstructAt(store, { topic, key, atTs, apply })
- In-memory harness: WS gateway + HTTP publisher + example projector

Related: [partitions-schema-registry-projector](partitions-schema-registry-projector.md), [event-bus-projections-diagrams](event-bus-projections-diagrams.md) [unique/index](../../unique-notes/index.md)

#tags: #snapshots #projectors #timetravel #testing

