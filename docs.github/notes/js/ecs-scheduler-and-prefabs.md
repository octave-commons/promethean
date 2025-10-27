Resource-aware ECS scheduler with stages, dependence DAG, conflict-aware batching, and prefab/blueprint spawning utilities.

Highlights:
- Stages: startup/update/late/render/cleanup
- before/after edges + resource/component read/write conflict ordering
- Greedy parallel batches per stage; skip-if-empty queries
- Prefabs: define component sets and spawn N entities quickly

Related: [archetype-ecs], [ecs-offload-workers] [../../unique/index|unique/index]

#tags: #js #ecs #scheduling #prefabs

