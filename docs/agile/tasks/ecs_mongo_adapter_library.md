ECS–Mongo Adapter Library

Goal: Implement a reusable MongoDB persistence adapter for the ECS so ECS acts as our ORM.

Deliverables:
- `shared/ts/src/agent-ecs/persist/mongo.ts`: `MongoStorageAdapter` with:
  - `save(entityId, componentName, data, meta)` upsert to `{ _id: <eid::component>, eid, component, data, ts }`
  - `remove(entityId, componentName)` delete
  - `load(world, filters?)` hydrate world from collections
  - Index helpers per component
- Hook into ECS world via lifecycle callbacks (component set/remove) to persist writes.
- Configurable write modes: immediate, buffered debounce, snapshot.

Exit Criteria:
- Unit tests: component set/remove triggers Mongo upsert/delete.
- Works with existing components (Turn, Utterance, TranscriptFinal, VAD).

#ecs #mongo #orm #accepted
