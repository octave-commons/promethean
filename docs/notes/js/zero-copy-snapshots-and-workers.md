Zero-copy worker integration: columnar typed arrays per component, SharedArrayBuffer when available (or transferables), changed bitsets, and commit-back into ECS.

Highlights:
- Define per-component field layouts (SoA columns)
- buildSnapshot(world, spec, query) → { snap, transfer }
- Worker mutates columns and marks changed bits; main commits minimal diffs

Related: [typed-struct-compiler], [ecs-offload-workers] [../../unique/index|unique/index]

#tags: #js #workers #zerocopy #soa

