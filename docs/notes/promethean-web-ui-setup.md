---
$$
uuid: 4678aad9-4c8b-40ed-aab0-9eb1baaa5801
$$
created_at: promethean-web-ui-setup.md
filename: Promethean Web UI Setup
title: Promethean Web UI Setup
$$
description: >-
$$
  Configures a TypeScript-based Web Components UI that runs behind NGINX,
  requiring an X-API-Key for API calls but not for UI loading. The setup
  separates container management from source code using Docker and keeps token
  authentication gated to API routes.
tags:
  - TypeScript
  - Web Components
  - NGINX
  - Docker
  - API Authentication
  - Token-Gated
$$
related_to_uuid:
$$
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - bb90903a-4723-44f7-850e-a71415ef6224
  - 18138627-a348-4fbb-b447-410dfb400564
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 1c4046b5-742d-4004-aec6-b47251fef5d6
  - 18344cf9-0c49-4a71-b6c8-b8d84d660fca
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 37b5d236-2b3e-4a95-a4e8-31655c3023ef
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - b4e64f8c-4dc9-4941-a877-646c5ada068e
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 13951643-1741-46bb-89dc-1beebb122633
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
$$
related_to_title:
$$
  - api-gateway-versioning
  - AGENTS.md
  - The Jar of Echoes
  - eidolon-field-math-foundations
  - Promethean Full-Stack Docker Setup
  - AI-First-OS-Model-Context-Protocol
  - windows-tiling-with-autohotkey
  - aionian-circuit-math
  - Promethean Notes
  - Promethean Chat Activity Report
  - balanced-bst
  - Canonical Org-Babel Matplotlib Animation Template
  - Mongo Outbox Implementation
  - Docops Feature Updates
  - homeostasis-decay-formulas
  - universal-intention-code-fabric
  - observability-infrastructure-setup
  - polyglot-repl-interface-layer
  - compiler-kit-foundations
  - Duck's Attractor States
  - Fnord Tracer Protocol
  - ecs-scheduler-and-prefabs
  - sibilant-meta-string-templating-runtime
  - Unique Info Dump Index
  - SentenceProcessing
references:
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 274
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 346
    col: 0
    score: 1
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 275
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 3292
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 2787
    col: 0
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 191
    col: 0
    score: 0.98
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 3354
    col: 0
    score: 0.98
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 190
    col: 0
    score: 0.98
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 276
    col: 0
    score: 0.98
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 1059
    col: 0
    score: 0.98
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 1192
    col: 0
    score: 0.98
  - uuid: bb90903a-4723-44f7-850e-a71415ef6224
    line: 262
    col: 0
    score: 0.97
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 115
    col: 0
    score: 0.97
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 227
    col: 0
    score: 0.97
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 2625
    col: 0
    score: 0.97
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 2464
    col: 0
    score: 0.97
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 363
    col: 0
    score: 0.97
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 610
    col: 0
    score: 0.95
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 189
    col: 0
    score: 0.95
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 328
    col: 0
    score: 0.95
  - uuid: c14edce7-0656-45b2-aaf3-51f042451b7d
    line: 388
    col: 0
    score: 0.92
  - uuid: b4e64f8c-4dc9-4941-a877-646c5ada068e
    line: 348
    col: 0
    score: 0.91
  - uuid: 2c2b48ca-1476-47fb-8ad4-69d2588a6c84
    line: 171
    col: 0
    score: 0.9
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 291
    col: 0
    score: 0.9
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.88
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 379
    col: 0
    score: 0.87
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 15616
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13864
    col: 0
    score: 0.87
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 7868
    col: 0
    score: 0.87
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 13178
    col: 0
    score: 0.87
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 15006
    col: 0
    score: 0.87
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 15236
    col: 0
    score: 0.87
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 12067
    col: 0
    score: 0.87
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 2507
    col: 0
    score: 0.87
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 92
    col: 0
    score: 0.86
  - uuid: 681a4ab2-8fef-4833-a09d-bceb62d114da
    line: 30
    col: 0
    score: 0.86
  - uuid: cfbdca2f-5ee8-4cad-a75e-0e017e8d9b77
    line: 11
    col: 0
    score: 0.86
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 296
    col: 0
    score: 0.86
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 1356
    col: 0
    score: 0.86
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 881
    col: 0
    score: 0.86
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 808
    col: 0
    score: 0.86
  - uuid: 291c7d91-da8c-486c-9bc0-bd2254536e2d
    line: 611
    col: 0
    score: 0.86
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 17764
    col: 0
    score: 0.86
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 21424
    col: 0
    score: 0.86
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.85
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 158
    col: 0
    score: 0.85
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 275
    col: 0
    score: 0.85
---

 ^ref-bc5172ca-9-0 ^ref-bc5172ca-40-0 ^ref-bc5172ca-44-0 ^ref-bc5172ca-45-0 ^ref-bc5172ca-279-0 ^ref-bc5172ca-440-0 ^ref-bc5172ca-442-0
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $api-gateway-versioning$$api-gateway-versioning.md$
- [AGENTS.md]$agents-md.md$
- [The Jar of Echoes]$the-jar-of-echoes.md$
- $eidolon-field-math-foundations$$eidolon-field-math-foundations.md$
- $Promethean Full-Stack Docker Setup$$promethean-full-stack-docker-setup.md$
- $AI-First-OS-Model-Context-Protocol$$ai-first-os-model-context-protocol.md$
- $windows-tiling-with-autohotkey$$windows-tiling-with-autohotkey.md$
- $aionian-circuit-math$$aionian-circuit-math.md$
- [Promethean Notes]$promethean-notes.md$
- [Promethean Chat Activity Report]$promethean-chat-activity-report.md$
- $balanced-bst$$balanced-bst.md$
- $Canonical Org-Babel Matplotlib Animation Template$$canonical-org-babel-matplotlib-animation-template.md$
- [Mongo Outbox Implementation]$mongo-outbox-implementation.md$
- [Docops Feature Updates]$docops-feature-updates-3.md$
- $homeostasis-decay-formulas$$homeostasis-decay-formulas.md$
- $universal-intention-code-fabric$$universal-intention-code-fabric.md$
- $observability-infrastructure-setup$$observability-infrastructure-setup.md$
- $polyglot-repl-interface-layer$$polyglot-repl-interface-layer.md$
- $compiler-kit-foundations$$compiler-kit-foundations.md$
- [Duck's Attractor States]$ducks-attractor-states.md$
- [Fnord Tracer Protocol]$fnord-tracer-protocol.md$
- $ecs-scheduler-and-prefabs$$ecs-scheduler-and-prefabs.md$
- $sibilant-meta-string-templating-runtime$$sibilant-meta-string-templating-runtime.md$
- [Unique Info Dump Index]$unique-info-dump-index.md$
- [SentenceProcessing](sentenceprocessing.md)
## Sources
- [AGENTS.md — L274]$agents-md.md#^ref-bb90903a-274-0$ (line 274, col 0, score 1)
- $api-gateway-versioning — L346$$api-gateway-versioning.md#^ref-0580dcd3-346-0$ (line 346, col 0, score 1)
- [AGENTS.md — L275]$agents-md.md#^ref-bb90903a-275-0$ (line 275, col 0, score 1)
- [The Jar of Echoes — L3292]$the-jar-of-echoes.md#^ref-18138627-3292-0$ (line 3292, col 0, score 1)
- $eidolon-field-math-foundations — L2787$$eidolon-field-math-foundations.md#^ref-008f2ac0-2787-0$ (line 2787, col 0, score 1)
- $AI-First-OS-Model-Context-Protocol — L191$$ai-first-os-model-context-protocol.md#^ref-618198f4-191-0$ (line 191, col 0, score 0.98)
- $windows-tiling-with-autohotkey — L3354$$windows-tiling-with-autohotkey.md#^ref-0f6f8f38-3354-0$ (line 3354, col 0, score 0.98)
- $AI-First-OS-Model-Context-Protocol — L190$$ai-first-os-model-context-protocol.md#^ref-618198f4-190-0$ (line 190, col 0, score 0.98)
- $aionian-circuit-math — L276$$aionian-circuit-math.md#^ref-f2d83a77-276-0$ (line 276, col 0, score 0.98)
- [Promethean Notes — L1059]$promethean-notes.md#^ref-1c4046b5-1059-0$ (line 1059, col 0, score 0.98)
- [Promethean Chat Activity Report — L1192]$promethean-chat-activity-report.md#^ref-18344cf9-1192-0$ (line 1192, col 0, score 0.98)
- [AGENTS.md — L262]$agents-md.md#^ref-bb90903a-262-0$ (line 262, col 0, score 0.97)
- $AI-First-OS-Model-Context-Protocol — L115$$ai-first-os-model-context-protocol.md#^ref-618198f4-115-0$ (line 115, col 0, score 0.97)
- $AI-First-OS-Model-Context-Protocol — L227$$ai-first-os-model-context-protocol.md#^ref-618198f4-227-0$ (line 227, col 0, score 0.97)
- $Canonical Org-Babel Matplotlib Animation Template — L2625$$canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-2625-0$ (line 2625, col 0, score 0.97)
- $windows-tiling-with-autohotkey — L2464$$windows-tiling-with-autohotkey.md#^ref-0f6f8f38-2464-0$ (line 2464, col 0, score 0.97)
- $balanced-bst — L363$$balanced-bst.md#^ref-d3e7db72-363-0$ (line 363, col 0, score 0.97)
- [Mongo Outbox Implementation — L610]$mongo-outbox-implementation.md#^ref-9c1acd1e-610-0$ (line 610, col 0, score 0.95)
- [Docops Feature Updates — L189]$docops-feature-updates-3.md#^ref-cdbd21ee-189-0$ (line 189, col 0, score 0.95)
- $homeostasis-decay-formulas — L328$$homeostasis-decay-formulas.md#^ref-37b5d236-328-0$ (line 328, col 0, score 0.95)
- $universal-intention-code-fabric — L388$$universal-intention-code-fabric.md#^ref-c14edce7-388-0$ (line 388, col 0, score 0.92)
- $observability-infrastructure-setup — L348$$observability-infrastructure-setup.md#^ref-b4e64f8c-348-0$ (line 348, col 0, score 0.91)
- $Promethean Full-Stack Docker Setup — L171$$promethean-full-stack-docker-setup.md#^ref-2c2b48ca-171-0$ (line 171, col 0, score 0.9)
- $polyglot-repl-interface-layer — L291$$polyglot-repl-interface-layer.md#^ref-9c79206d-291-0$ (line 291, col 0, score 0.9)
- $compiler-kit-foundations — L590$$compiler-kit-foundations.md#^ref-01b21543-590-0$ (line 590, col 0, score 0.88)
- $ecs-scheduler-and-prefabs — L379$$ecs-scheduler-and-prefabs.md#^ref-c62a1815-379-0$ (line 379, col 0, score 0.87)
- [The Jar of Echoes — L15616]$the-jar-of-echoes.md#^ref-18138627-15616-0$ (line 15616, col 0, score 0.87)
- $windows-tiling-with-autohotkey — L13864$$windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13864-0$ (line 13864, col 0, score 0.87)
- [Promethean Notes — L7868]$promethean-notes.md#^ref-1c4046b5-7868-0$ (line 7868, col 0, score 0.87)
- $windows-tiling-with-autohotkey — L13178$$windows-tiling-with-autohotkey.md#^ref-0f6f8f38-13178-0$ (line 13178, col 0, score 0.87)
- [Duck's Attractor States — L15006]$ducks-attractor-states.md#^ref-13951643-15006-0$ (line 15006, col 0, score 0.87)
- $eidolon-field-math-foundations — L15236$$eidolon-field-math-foundations.md#^ref-008f2ac0-15236-0$ (line 15236, col 0, score 0.87)
- [The Jar of Echoes — L12067]$the-jar-of-echoes.md#^ref-18138627-12067-0$ (line 12067, col 0, score 0.87)
- [Fnord Tracer Protocol — L2507]$fnord-tracer-protocol.md#^ref-fc21f824-2507-0$ (line 2507, col 0, score 0.87)
- $sibilant-meta-string-templating-runtime — L92$$sibilant-meta-string-templating-runtime.md#^ref-2aafc801-92-0$ (line 92, col 0, score 0.86)
- [SentenceProcessing — L30]$sentenceprocessing.md#^ref-681a4ab2-30-0$ (line 30, col 0, score 0.86)
- [Refactor Frontmatter Processing — L11]$refactor-frontmatter-processing.md#^ref-cfbdca2f-11-0$ (line 11, col 0, score 0.86)
- [Unique Info Dump Index — L296]$unique-info-dump-index.md#^ref-30ec3ba6-296-0$ (line 296, col 0, score 0.86)
- [Debugging Broker Connections and Agent Behavior — L1356]$debugging-broker-connections-and-agent-behavior.md#^ref-73d3dbf6-1356-0$ (line 1356, col 0, score 0.86)
- $field-dynamics-math-blocks — L881$$field-dynamics-math-blocks.md#^ref-7cfc230d-881-0$ (line 881, col 0, score 0.86)
- $field-node-diagram-set — L808$$field-node-diagram-set.md#^ref-22b989d5-808-0$ (line 808, col 0, score 0.86)
- [Ice Box Reorganization — L611]$ice-box-reorganization.md#^ref-291c7d91-611-0$ (line 611, col 0, score 0.86)
- [Duck's Attractor States — L17764]$ducks-attractor-states.md#^ref-13951643-17764-0$ (line 17764, col 0, score 0.86)
- $eidolon-field-math-foundations — L21424$$eidolon-field-math-foundations.md#^ref-008f2ac0-21424-0$ (line 21424, col 0, score 0.86)
- [Voice Access Layer Design — L280]$voice-access-layer-design.md#^ref-543ed9b3-280-0$ (line 280, col 0, score 0.85)
- [Docops Feature Updates — L158]$docops-feature-updates-3.md#^ref-cdbd21ee-158-0$ (line 158, col 0, score 0.85)
- $homeostasis-decay-formulas — L275$$homeostasis-decay-formulas.md#^ref-37b5d236-275-0$ (line 275, col 0, score 0.85)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
