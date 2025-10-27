---
```
uuid: 9f5d2452-6ac9-4334-82c6-1059a84901b2
```
created_at: system-scheduler-with-resource-aware-dag.md
```
filename: system-scheduler
```
```
title: system-scheduler
```
```
description: >-
```
  A resource-aware system scheduler for ECS that handles dependency graphs,
  conflict-free batching, and prefab management. It supports stage-based
  execution with startup, update, late, render, and cleanup phases.
tags:
  - ecs
  - scheduler
  - resource-aware
  - dependency-graph
  - batching
  - prefabs
```
related_to_uuid:
```
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - babdb9eb-3b15-48a7-8a22-ecc53af7d397
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - 18138627-a348-4fbb-b447-410dfb400564
  - 13951643-1741-46bb-89dc-1beebb122633
  - 1cfae310-35dc-49c2-98f1-b186da25d84b
```
related_to_title:
```
  - ecs-scheduler-and-prefabs
  - graph-ds
  - Functional Embedding Pipeline Refactor
  - field-node-diagram-set
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - heartbeat-fragment-demo
  - i3-bluetooth-setup
  - Ice Box Reorganization
  - komorebi-group-window-hack
  - Layer1SurvivabilityEnvelope
  - Recursive Prompt Construction Engine
  - homeostasis-decay-formulas
  - obsidian-ignore-node-modules-regex
  - Local-Offline-Model-Deployment-Strategy
  - TypeScript Patch for Tool Calling Support
  - Model Selection for Lightweight Conversational Tasks
  - zero-copy-snapshots-and-workers
  - windows-tiling-with-autohotkey
  - ParticleSimulationWithCanvasAndFFmpeg
  - The Jar of Echoes
  - Duck's Attractor States
  - Functional Refactor of TypeScript Document Processing
references:
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 7
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 226
    col: 0
    score: 1
  - uuid: 1f32c94a-4da4-4266-8ac0-6c282cfb401f
    line: 705
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 719
    col: 0
    score: 1
  - uuid: e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
    line: 601
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 1060
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 726
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 996
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 667
    col: 0
    score: 1
  - uuid: 5e408692-0e74-400e-a617-84247c7353ad
    line: 736
    col: 0
    score: 1
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 645
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 739
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 816
    col: 0
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 312
    col: 0
    score: 1
  - uuid: babdb9eb-3b15-48a7-8a22-ecc53af7d397
    line: 4
    col: 0
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 247
    col: 0
    score: 0.99
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 304
    col: 0
    score: 0.94
  - uuid: ffb9b2a9-744d-4a53-9565-130fceae0832
    line: 209
    col: 0
    score: 0.94
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 394
    col: 0
    score: 0.94
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.93
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 690
    col: 0
    score: 0.91
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 363
    col: 0
    score: 0.91
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 255
    col: 0
    score: 0.91
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 2421
    col: 0
    score: 0.88
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 2445
    col: 0
    score: 0.88
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 5039
    col: 0
    score: 0.88
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 2157
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11209
    col: 0
    score: 0.88
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 11675
    col: 0
    score: 0.88
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 7117
    col: 0
    score: 0.88
  - uuid: 1cfae310-35dc-49c2-98f1-b186da25d84b
    line: 7118
    col: 0
    score: 0.88
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 367
    col: 0
    score: 0.87
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.87
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 340
    col: 0
    score: 0.86
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 342
    col: 0
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.86
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.85
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.85
---

 ^ref-7ab1a3cd-5-0 ^ref-ba244286-5-0 ^ref-7ab1a3cd-241-0 ^ref-7ab1a3cd-244-0 ^ref-7ab1a3cd-245-0 ^ref-7ab1a3cd-307-0 ^ref-ba244286-310-0 ^ref-7ab1a3cd-310-0 ^ref-ba244286-340-0 ^ref-7ab1a3cd-340-0 ^ref-ba244286-341-0 ^ref-7ab1a3cd-343-0 ^ref-7ab1a3cd-354-0 ^ref-ba244286-358-0 ^ref-7ab1a3cd-358-0 ^ref-ba244286-374-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- ecs-scheduler-and-prefabs$ecs-scheduler-and-prefabs.md
- graph-ds$graph-ds.md
- [Functional Embedding Pipeline Refactor]functional-embedding-pipeline-refactor.md
- field-node-diagram-set$field-node-diagram-set.md
- [Docops Feature Updates]docops-feature-updates.md
- field-node-diagram-outline$field-node-diagram-outline.md
- field-node-diagram-visualizations$field-node-diagram-visualizations.md
- [Fnord Tracer Protocol]fnord-tracer-protocol.md
- heartbeat-fragment-demo$heartbeat-fragment-demo.md
- i3-bluetooth-setup$i3-bluetooth-setup.md
- [Ice Box Reorganization]ice-box-reorganization.md
- komorebi-group-window-hack$komorebi-group-window-hack.md
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [Recursive Prompt Construction Engine]recursive-prompt-construction-engine.md
- homeostasis-decay-formulas$homeostasis-decay-formulas.md
- obsidian-ignore-node-modules-regex$obsidian-ignore-node-modules-regex.md
- Local-Offline-Model-Deployment-Strategy$local-offline-model-deployment-strategy.md
- [TypeScript Patch for Tool Calling Support]typescript-patch-for-tool-calling-support.md
- [Model Selection for Lightweight Conversational Tasks]model-selection-for-lightweight-conversational-tasks.md
- zero-copy-snapshots-and-workers$zero-copy-snapshots-and-workers.md
- windows-tiling-with-autohotkey$windows-tiling-with-autohotkey.md
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [The Jar of Echoes]the-jar-of-echoes.md
- [Duck's Attractor States]ducks-attractor-states.md
- [Functional Refactor of TypeScript Document Processing]functional-refactor-of-typescript-document-processing.md
## Sources
- ecs-scheduler-and-prefabs — L7$ecs-scheduler-and-prefabs.md#^ref-c62a1815-7-0 (line 7, col 0, score 1)
- [Docops Feature Updates — L226]docops-feature-updates.md#^ref-2792d448-226-0 (line 226, col 0, score 1)
- field-node-diagram-outline — L705$field-node-diagram-outline.md#^ref-1f32c94a-705-0 (line 705, col 0, score 1)
- field-node-diagram-set — L719$field-node-diagram-set.md#^ref-22b989d5-719-0 (line 719, col 0, score 1)
- field-node-diagram-visualizations — L601$field-node-diagram-visualizations.md#^ref-e9b27b06-601-0 (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060]fnord-tracer-protocol.md#^ref-fc21f824-1060-0 (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726]functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0 (line 726, col 0, score 1)
- graph-ds — L996$graph-ds.md#^ref-6620e2f2-996-0 (line 996, col 0, score 1)
- heartbeat-fragment-demo — L667$heartbeat-fragment-demo.md#^ref-dd00677a-667-0 (line 667, col 0, score 1)
- i3-bluetooth-setup — L736$i3-bluetooth-setup.md#^ref-5e408692-736-0 (line 736, col 0, score 1)
- [Ice Box Reorganization — L645]ice-box-reorganization.md#^ref-291c7d91-645-0 (line 645, col 0, score 1)
- komorebi-group-window-hack — L739$komorebi-group-window-hack.md#^ref-dd89372d-739-0 (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816]layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0 (line 816, col 0, score 1)
- ecs-scheduler-and-prefabs — L312$ecs-scheduler-and-prefabs.md#^ref-c62a1815-312-0 (line 312, col 0, score 1)
- [Recursive Prompt Construction Engine — L4]recursive-prompt-construction-engine.md#^ref-babdb9eb-4-0 (line 4, col 0, score 1)
- ecs-scheduler-and-prefabs — L247$ecs-scheduler-and-prefabs.md#^ref-c62a1815-247-0 (line 247, col 0, score 0.99)
- homeostasis-decay-formulas — L304$homeostasis-decay-formulas.md#^ref-37b5d236-304-0 (line 304, col 0, score 0.94)
- obsidian-ignore-node-modules-regex — L209$obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-209-0 (line 209, col 0, score 0.94)
- [Fnord Tracer Protocol — L394]fnord-tracer-protocol.md#^ref-fc21f824-394-0 (line 394, col 0, score 0.94)
- Local-Offline-Model-Deployment-Strategy — L232$local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-232-0 (line 232, col 0, score 0.93)
- [TypeScript Patch for Tool Calling Support — L690]typescript-patch-for-tool-calling-support.md#^ref-7b7ca860-690-0 (line 690, col 0, score 0.91)
- homeostasis-decay-formulas — L363$homeostasis-decay-formulas.md#^ref-37b5d236-363-0 (line 363, col 0, score 0.91)
- [Model Selection for Lightweight Conversational Tasks — L255]model-selection-for-lightweight-conversational-tasks.md#^ref-d144aa62-255-0 (line 255, col 0, score 0.91)
- [Layer1SurvivabilityEnvelope — L2421]layer1survivabilityenvelope.md#^ref-64a9f9f9-2421-0 (line 2421, col 0, score 0.88)
- [ParticleSimulationWithCanvasAndFFmpeg — L2445]particlesimulationwithcanvasandffmpeg.md#^ref-e018dd7a-2445-0 (line 2445, col 0, score 0.88)
- windows-tiling-with-autohotkey — L5039$windows-tiling-with-autohotkey.md#^ref-0f6f8f38-5039-0 (line 5039, col 0, score 0.88)
- zero-copy-snapshots-and-workers — L2157$zero-copy-snapshots-and-workers.md#^ref-62bec6f0-2157-0 (line 2157, col 0, score 0.88)
- [The Jar of Echoes — L11209]the-jar-of-echoes.md#^ref-18138627-11209-0 (line 11209, col 0, score 0.88)
- [The Jar of Echoes — L11675]the-jar-of-echoes.md#^ref-18138627-11675-0 (line 11675, col 0, score 0.88)
- [Duck's Attractor States — L7117]ducks-attractor-states.md#^ref-13951643-7117-0 (line 7117, col 0, score 0.88)
- [Functional Refactor of TypeScript Document Processing — L7118]functional-refactor-of-typescript-document-processing.md#^ref-1cfae310-7118-0 (line 7118, col 0, score 0.88)
- archetype-ecs — L367$archetype-ecs.md#^ref-8f4c1e86-367-0 (line 367, col 0, score 0.87)
- [Ghostly Smoke Interference — L40]ghostly-smoke-interference.md#^ref-b6ae7dfa-40-0 (line 40, col 0, score 0.87)
- ecs-scheduler-and-prefabs — L340$ecs-scheduler-and-prefabs.md#^ref-c62a1815-340-0 (line 340, col 0, score 0.86)
- ecs-scheduler-and-prefabs — L342$ecs-scheduler-and-prefabs.md#^ref-c62a1815-342-0 (line 342, col 0, score 0.86)
- Sibilant Meta-Prompt DSL — L120$sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0 (line 120, col 0, score 0.86)
- [Event Bus MVP — L527]event-bus-mvp.md#^ref-534fe91d-527-0 (line 527, col 0, score 0.85)
- Eidolon-Field-Optimization — L50$eidolon-field-optimization.md#^ref-40e05c14-50-0 (line 50, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
