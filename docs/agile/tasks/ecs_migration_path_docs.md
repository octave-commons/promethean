---
uuid: "529b7471-6d7c-4135-9de3-8e22970692f0"
title: "ecs migration path docs"
slug: "ecs_migration_path_docs"
status: "incoming"
priority: "P3"
tags: ["ecs", "migration", "docs", "path"]
created_at: "2025-10-10T03:23:55.969Z"
estimates:
  complexity: ""
  scale: ""
  time_to_completion: ""
---







ECS Migration Path Documentation

Goal: Document how to migrate each service to ECS-backed persistence incrementally.

Content:
- Service inventory cephalon, heartbeat, stt/tts, file-watcher, bridge.
- For each: target components, mapping to Mongo, migration phases.
- Feature flags and rollback plan.

Exit Criteria:
- Markdown doc published under `docs/ecs/migration.md` with cross-links from service READMEs.

#incoming #ecs #migration #docs






