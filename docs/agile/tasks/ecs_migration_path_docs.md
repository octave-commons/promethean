ECS Migration Path Documentation

Goal: Document how to migrate each service to ECS-backed persistence incrementally.

Content:
- Service inventory (cephalon, heartbeat, stt/tts, file-watcher, bridge).
- For each: target components, mapping to Mongo, migration phases.
- Feature flags and rollback plan.

Exit Criteria:
- Markdown doc published under `docs/ecs/migration.md` with cross-links from service READMEs.

#ecs #migration #docs #accepted
