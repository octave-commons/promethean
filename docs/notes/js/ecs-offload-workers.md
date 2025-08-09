Offloading ECS systems to workers with a portable pool (Node worker_threads, Web Workers, or local fallback) and a minimal patch protocol (`set/add/remove/destroy`).

Highlights:
- Node pool imports ESM job modules; browser uses worker factories
- Local fallback dynamic-imports and runs in-process
- Workers operate on snapshots and return patches; main thread applies

Related: [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md), [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md) [unique/index](../../unique-notes/index.md)

#tags: #js #workers #ecs #parallel

