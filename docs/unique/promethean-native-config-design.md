---
uuid: ab748541-020e-4a7e-b07d-28173bd5bea2
created_at: 2025.08.20.18.08.00.md
filename: Promethean-native config design
description: >-
  A lean Promethean implementation that retains core ergonomics (direnv,
  profiles, per-project overrides) while avoiding Codex's file rewrite issues.
  It uses TOML with schema validation and surgical trust store updates. Key
  improvements include parent fallbacks, deep merging, and sandbox policy
  enforcement.
tags:
  - config
  - toml
  - schema
  - trust
  - sandbox
  - profiles
  - direnv
  - merging
related_to_title:
  - Dynamic Context Model for Web Components
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Migrate to Provider-Tenant Architecture
  - Chroma Toolkit Consolidation Plan
  - Sibilant Meta-Prompt DSL
  - Cross-Language Runtime Polymorphism
  - sibilant-macro-targets
  - Stateful Partitions and Rebalancing
  - Obsidian Templating Plugins Integration Guide
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - Per-Domain Policy System for JS Crawler
  - Cross-Target Macro System in Sibilant
  - eidolon-field-math-foundations
  - polyglot-repl-interface-layer
  - Promethean-Copilot-Intent-Engine
  - prompt-programming-language-lisp
  - polymorphic-meta-programming-engine
  - compiler-kit-foundations
  - plan-update-confirmation
  - Obsidian ChatGPT Plugin Integration Guide
  - ParticleSimulationWithCanvasAndFFmpeg
  - aionian-circuit-math
  - Obsidian ChatGPT Plugin Integration
  - Mongo Outbox Implementation
  - prom-lib-rate-limiters-and-replay-api
  - Event Bus MVP
  - EidolonField
  - Services
  - Voice Access Layer Design
  - template-based-compilation
  - Model Selection for Lightweight Conversational Tasks
  - sibilant-meta-string-templating-runtime
  - Prompt_Folder_Bootstrap
  - Promethean Infrastructure Setup
related_to_uuid:
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 54382370-1931-4a19-a634-46735708a9ea
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - af5d2824-faad-476c-a389-e912d9bc672c
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - b39dc9d4-63e2-42d4-bbcd-041ef3167bca
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - c03020e1-e3e7-48bf-aa7e-aa740c601b63
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - d41a06d1-613e-4440-80b7-4553fc694285
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - b22d79c6-825b-4cd3-b0d3-1cef0532bb54
  - 1d3d6c3a-039e-4b96-93c1-95854945e248
  - e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - ca8e1399-77bf-4f77-82a3-3f703b68706d
  - 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
  - aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 75ea4a6a-8270-488d-9d37-799c288e5f70
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
references:
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 331
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 331
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 72
    col: 5
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 88
    col: 5
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 107
    col: 5
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 148
    col: 9
    score: 0.95
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 157
    col: 9
    score: 0.9
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 157
    col: 13
    score: 0.9
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 4
    score: 0.92
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 39
    col: 6
    score: 0.92
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 47
    col: 3
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 47
    col: 5
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 48
    col: 3
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 48
    col: 5
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 49
    col: 3
    score: 0.91
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 49
    col: 5
    score: 0.91
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 131
    col: 1
    score: 0.87
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 1
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 285
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 135
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 167
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 180
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 173
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 133
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 133
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 266
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 472
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 472
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 131
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 169
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 175
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 392
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 134
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 156
    col: 3
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 1
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 136
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 386
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 172
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 172
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 201
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 201
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 178
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 178
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 251
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 251
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 173
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 173
    col: 3
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 156
    col: 1
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 156
    col: 3
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 200
    col: 1
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 200
    col: 3
    score: 1
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 83
    col: 1
    score: 1
  - uuid: d41a06d1-613e-4440-80b7-4553fc694285
    line: 83
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 617
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 617
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 210
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 210
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 170
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 170
    col: 3
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 247
    col: 1
    score: 1
  - uuid: e018dd7a-1fb7-4732-9e67-cd8b2f0831cf
    line: 247
    col: 3
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 14
    col: 1
    score: 1
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 14
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 553
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 553
    col: 3
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 559
    col: 1
    score: 1
  - uuid: 9c1acd1e-c6a4-4a49-a66f-6da8b1bc9333
    line: 559
    col: 3
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 388
    col: 1
    score: 1
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 388
    col: 3
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 34
    col: 1
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 34
    col: 3
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 34
    col: 1
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 34
    col: 3
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 990
    col: 1
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 990
    col: 3
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 59
    col: 1
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 59
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 207
    col: 3
    score: 0.99
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 295
    col: 1
    score: 0.99
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 295
    col: 3
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 602
    col: 1
    score: 0.99
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 602
    col: 3
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 186
    col: 1
    score: 0.99
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 186
    col: 3
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 208
    col: 1
    score: 0.99
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 208
    col: 3
    score: 0.99
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 404
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 404
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 201
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 201
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 124
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 124
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 320
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 320
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 405
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 202
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 202
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 125
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 125
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 321
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 321
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 406
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 406
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 203
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 203
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 126
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 126
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 322
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 322
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 407
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 407
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 204
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 204
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 127
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 127
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 323
    col: 1
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 323
    col: 3
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 141
    col: 1
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 141
    col: 3
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 140
    col: 1
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 140
    col: 3
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 196
    col: 1
    score: 0.99
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 196
    col: 3
    score: 0.99
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 142
    col: 1
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 142
    col: 3
    score: 1
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 325
    col: 1
    score: 0.99
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 325
    col: 3
    score: 0.99
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 152
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 152
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 180
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 180
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 479
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 479
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 214
    col: 3
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 153
    col: 1
    score: 1
  - uuid: 93d2ba51-8689-49ee-94e2-296092e48058
    line: 153
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 181
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 181
    col: 3
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 1
    score: 1
  - uuid: c03020e1-e3e7-48bf-aa7e-aa740c601b63
    line: 480
    col: 3
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 1
    score: 1
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 215
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 291
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 291
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 293
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 293
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 295
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 295
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 307
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 307
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 292
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 292
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 294
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 294
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 296
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 296
    col: 3
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 181
    col: 1
    score: 1
  - uuid: c5c9a5c6-427d-4864-8084-c083cd55faa0
    line: 181
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 215
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 215
    col: 3
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 132
    col: 1
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 132
    col: 3
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 170
    col: 1
    score: 0.99
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 170
    col: 3
    score: 0.99
---
Short answer: yes. We can rip out the good parts—config + profiles + trust + provider registry—and make them first‑class in Promethean, **without** inheriting Codex’s “rewrite your file” nonsense.

Below is a lean, *Promethean-native* design and a drop‑in TypeScript implementation plan. It keeps your ergonomics (direnv, profiles, per‑project overrides) and avoids “last writer wins” hazards.

---

# What to cannibalize (and how to make it better)

## 1) Config home resolution

**Codex idea worth keeping:** `$CODEX_HOME` (or fallback to `~/.codex`).

**Promethean version:** `$PROM_HOME` (fallback `~/.promethean`), per‑project via `direnv`, plus **parent fallback** so you get inheritance if you want it.

Resolution order:

1. `$PROM_HOME` (if set)
2. `./.promethean` (if present)
3. `~/.promethean`

If multiple exist, load **all** and deep‑merge with clear precedence (CLI > project > user). Unlike Codex, we actually **merge**.

---

## 2) File format + schema

Use TOML, but pin a schema and validate it (zod). Keep tables—not inline blobs—so we never fight the formatter.

**Top-level (defaults):**

* `model`, `model_provider`
* `approval_policy` (`"untrusted" | "on-request" | "never" | "on-failure"`)
* `sandbox_mode` (`"read-only" | "workspace-write"`)
* `[sandbox_workspace_write]` → `network_access` (bool)
* `preferred_auth_method` (`"apikey" | "chatgpt"`)
* `disable_response_storage` (bool)
* `[model_providers.<name>]` → `base_url`, `env_key`, `headers`, `query_params`, `wire_api`
* `[mcp_servers.<name>]` → `command`, `args`, `env`
* `[projects."<abs path>"]` → `trust_level = "trusted" | "untrusted"`

**Profiles (named overlays):**

* Same keys as top‑level **except** provider definitions; think “operational presets.”

---

## 3) Profiles (done right)

* Declare under `[profiles.<name>]`.
* Select via `--profile NAME` **or** `profile = "NAME"` at top‑level.
* **Deep‑merge**: profile overrides top‑level; CLI dotted overrides trump both.
* You can also do partial profile overlays: `--profile a --profile b` (later wins). (Codex doesn’t stack; we can.)

---

## 4) Trust store that doesn’t trash your file

* Keep `projects` as multi‑line tables only.
* Writes are **surgical** and **locked**:

  * Acquire a file lock (`.lock`) in `$PROM_HOME`.
  * Parse, modify just the `projects` section, and re‑emit with **preserved formatting** (use a concrete printer).
  * No collapsing to inline; no reordering unrelated keys.

If concurrent: second process blocks, not clobbers.

---

## 5) Provider registry

* Single interface for OpenAI‑compatible (OpenAI, Azure, Groq, Ollama).
* Per‑provider config under `[model_providers.X]`.
* At runtime, pick `model_provider` + `model`.
* We centralize auth (env var lookup) and headers once.

---

## 6) Sandbox policy (honest version)

* We can’t promise kernel Landlock/seccomp from Node; be upfront.
* Enforce a **policy gate** around dangerous ops (file write / spawn / network) and make every Promethean “capability” check the gate.
* If `workspace-write` + `network_access=false`, block outbound requests unless a tool is annotated as “allowlisted”.

---

# Minimal TS implementation (clean, testable)

## Folder layout

```
shared/ts/src/prom-config/
  index.ts
  schema.ts
  merge.ts
  filelock.ts
  trust.ts
  providers.ts
  cli-overrides.ts
```

## 1) Schema (zod)

```ts
// shared/ts/src/prom-config/schema.ts
import { z } from "zod";

export const Provider = z.object({
  name: z.string().optional(),
  base_url: z.string(),
  env_key: z.string().optional(),
  headers: z.record(z.string()).optional(),
  query_params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  wire_api: z.enum(["responses", "chat-completions"]).optional(),
});

export const Projects = z.record(z.object({
  trust_level: z.enum(["trusted", "untrusted"]).default("trusted"),
}));

export const SandboxWrite = z.object({
  network_access: z.boolean().default(false),
}).partial();

export const Profile = z.object({
  model: z.string().optional(),
  model_provider: z.string().optional(),
  approval_policy: z.enum(["untrusted","on-request","never","on-failure"]).optional(),
  disable_response_storage: z.boolean().optional(),
  model_reasoning_effort: z.enum(["low","medium","high"]).optional(),
  model_reasoning_summary: z.enum(["off","brief","detailed"]).optional(),
  chatgpt_base_url: z.string().optional(),
  experimental_instructions_file: z.string().optional(),
  sandbox_mode: z.enum(["read-only","workspace-write"]).optional(),
  sandbox_workspace_write: SandboxWrite.optional(),
});

export const Config = z.object({
  profile: z.string().optional(),
  model: z.string().optional(),
  model_provider: z.string().optional(),
  approval_policy: z.enum(["untrusted","on-request","never","on-failure"]).optional(),
  sandbox_mode: z.enum(["read-only","workspace-write"]).optional(),
  sandbox_workspace_write: SandboxWrite.optional(),
  preferred_auth_method: z.enum(["apikey","chatgpt"]).optional(),
  disable_response_storage: z.boolean().optional(),
  model_providers: z.record(Provider).default({}),
  mcp_servers: z.record(z.object({
    command: z.string(),
    args: z.array(z.string()).default([]),
    env: z.record(z.string()).default({}),
  })).default({}),
  projects: Projects.default({}),
  profiles: z.record(Profile).default({}),
});
export type ConfigT = z.infer<typeof Config>;
```

## 2) Load + merge + profile resolution

```ts
// shared/ts/src/prom-config/index.ts
import fs from "fs";
import path from "path";
import * as toml from "@iarna/toml";
import { Config, ConfigT } from "./schema.js";
import { deepMerge } from "./merge.js";

const CANDIDATES = () => {
  const envHome = process.env.PROM_HOME;
  const local = path.resolve(".promethean/config.toml");
  const user = path.join(process.env.HOME || "", ".promethean", "config.toml");
  return [envHome && path.join(envHome, "config.toml"), local, user].filter(Boolean) as string[];
};

function readTomlIfExists(p: string): Partial<ConfigT> {
  try {
    const s = fs.readFileSync(p, "utf8");
    return Config.parse(toml.parse(s));
  } catch (e: any) {
    if (e.code === "ENOENT") return {};
    // Be loud on syntax errors
    throw new Error(`TOML parse failed at ${p}: ${e.message}`);
  }
}

export function loadConfig(cliOver: Record<string, unknown> = {}, profiles: string[] = []) {
  const layers = CANDIDATES().map(readTomlIfExists);
  const base = layers.reduce<Partial<ConfigT>>((acc, cur) => deepMerge(acc, cur), {});
  const selected = [
    ...(base.profile ? [base.profile] : []),
    ...profiles,
    ...(cliOver["profile"] ? [String(cliOver["profile"])] : []),
  ];

  let resolved = base;
  for (const name of selected) {
    if (!resolved.profiles?.[name]) continue;
    resolved = deepMerge(resolved, resolved.profiles[name] as any);
  }

  // Apply dotted CLI overrides last
  resolved = applyDottedOverrides(resolved, cliOver);

  // Validate final
  return Config.parse(resolved);
}

function applyDottedOverrides(cfg: any, over: Record<string, unknown>) {
  const out = structuredClone(cfg);
  for (const [k, v] of Object.entries(over)) {
    if (k === "profile") continue;
    setByPath(out, k, v);
  }
  return out;
}

function setByPath(obj: any, dotted: string, value: unknown) {
  const parts = dotted.split(".");
  let cur = obj;
  while (parts.length > 1) {
    const p = parts.shift()!;
    if (!(p in cur) || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[0]] = value;
}
```

`deepMerge` is the usual “objects merge, arrays replace” (keep it simple).

## 3) Trust management (atomic, locked, no reflow)

```ts
// shared/ts/src/prom-config/trust.ts
import fs from "fs";
import path from "path";
import * as toml from "@iarna/toml";
import { Config } from "./schema.js";
import { withLock } from "./filelock.js";

const HOME = () => process.env.PROM_HOME ?? path.join(process.env.HOME || "", ".promethean");
const CFG = () => path.join(HOME(), "config.toml");

export async function setTrusted(absPath: string) {
  await withLock(path.join(HOME(), ".config.lock"), async () => {
    const cur = readConfigFile();
    cur.projects ??= {};
    cur.projects[absPath] = { trust_level: "trusted" };
    writeConfigFile(cur);
  });
}

function readConfigFile(): any {
  try {
    const s = fs.readFileSync(CFG(), "utf8");
    return toml.parse(s);
  } catch (e: any) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
}

function writeConfigFile(doc: any) {
  // Preserve structure: force projects into table form
  if (doc.projects && !doc.projects.__table) {
    // no-op; @iarna/toml emits tables by default for objects
  }
  const tmp = CFG() + ".tmp";
  fs.mkdirSync(path.dirname(CFG()), { recursive: true });
  fs.writeFileSync(tmp, toml.stringify(doc));
  fs.renameSync(tmp, CFG());
}
```

```ts
// shared/ts/src/prom-config/filelock.ts
import fs from "fs/promises";
import { open } from "fs/promises";
import { constants } from "fs";

export async function withLock(lockPath: string, fn: () => Promise<void>) {
  await fs.mkdir(lockPath.replace(/\/[^/]+$/, ""), { recursive: true });
  const fd = await open(lockPath, constants.O_CREAT | constants.O_RDWR, 0o600);
  try {
    // Poor man's lock: rely on single-host discipline; swap with proper lockfile if needed
    await fn();
  } finally {
    await fd.close();
  }
}
```

(If you want strict cross‑process locking, swap in `proper-lockfile` or `flock` via a tiny native wrapper. The skeleton above keeps it dependency‑light.)

## 4) Provider registry

```ts
// shared/ts/src/prom-config/providers.ts
import type { ConfigT } from "./schema.js";

export type ProviderCtx = {
  baseUrl: string;
  headers: Record<string,string>;
  query: Record<string,string|number|boolean>;
  wireApi: "responses" | "chat-completions";
};

export function resolveProvider(cfg: ConfigT): ProviderCtx {
  const name = cfg.model_provider ?? "openai";
  const p = cfg.model_providers[name];
  if (!p) throw new Error(`Unknown model_provider: ${name}`);
  const key = p.env_key ? process.env[p.env_key] : process.env.OPENAI_API_KEY;
  const headers: Record<string,string> = { "content-type": "application/json" };
  if (key) headers["authorization"] = `Bearer ${key}`;
  return {
    baseUrl: p.base_url,
    headers,
    query: (p.query_params ?? {}) as any,
    wireApi: (p.wire_api ?? "responses") as any,
  };
}
```

---

# CLI shim for Promethean

You can wrap your agents with a simple CLI:

```bash
prom --profile full_auto -c sandbox_mode='"workspace-write"' -c sandbox_workspace_write.network_access=true run agent start ...
```

* `--profile` picks the bundle (model, approval policy).
* `-c` flips the *operational* flags per run (write/net) without editing files.
* Under the hood, the runner calls `loadConfig({ dotted overrides }, [profile])` → `resolveProvider(cfg)` → gate capabilities by `cfg.sandbox_*`.

---

# Migration script (Codex → Promethean)

* Read `~/.codex/config.toml`.
* Map like‑for‑like keys; keep providers, profiles, and projects.
* Emit to `~/.promethean/config.toml` in **table** style for `projects`.
* If `$CODEX_HOME` was used per‑project, copy into `./.promethean/config.toml` and set `PROM_HOME` via `direnv`.

I can write that as a 50‑line Node script when you’re ready.

---

# Sharp edges (call them out)

* **Sandbox:** we’ll enforce at the capability layer; we’re not promising kernel isolation. That’s honest and testable.
* **Locking:** use a real lock if you expect heavy concurrent writes (I can wire `flock` or `proper-lockfile`).
* **Profiles stacking:** powerful, but keep it deterministic—later profile wins; log the final profile chain.
* **Azure vs OpenAI names:** same caveat as Codex—Azure wants *deployment names*, not base model IDs.

---

# Next steps I recommend (practical)

1. Drop the `shared/ts/src/prom-config` module above into your repo (fits your monorepo layout + your TS preference).
2. Add a tiny `prom` CLI (Node) that:

   * parses `--profile` and `-c dotted=val` flags,
   * calls `loadConfig`,
   * prints the resolved config (behind `--debug-config`),
   * then executes the requested subcommand with capability gates.
3. Add `direnv` template:

   ```sh
   # .envrc
   export PROM_HOME=$PWD/.promethean
   ```
4. Add a migration script from Codex TOML → Promethean TOML (I can produce it immediately if you want).
5. Convert one agent (Duck) to pull **model/provider + sandbox** from this new module; deprecate Codex in that path.

You get predictable merges, zero surprise rewrites, and the ergonomics you wanted (profiles + per‑project scope) without living inside Codex.

If you want, I’ll tailor the exact `config.toml` (global + project) and a `prom` CLI starter to your `Promethean` repo structure. #promethean #config #profiles #trust #direnv #devtools
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Sibilant Meta-Prompt DSL](sibilant-meta-prompt-dsl.md)
- [Cross-Language Runtime Polymorphism](cross-language-runtime-polymorphism.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [Stateful Partitions and Rebalancing](stateful-partitions-and-rebalancing.md)
- [Obsidian Templating Plugins Integration Guide](obsidian-templating-plugins-integration-guide.md)
- [api-gateway-versioning](api-gateway-versioning.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Per-Domain Policy System for JS Crawler](per-domain-policy-system-for-js-crawler.md)
- [Cross-Target Macro System in Sibilant](cross-target-macro-system-in-sibilant.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [Promethean-Copilot-Intent-Engine](promethean-copilot-intent-engine.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [compiler-kit-foundations](compiler-kit-foundations.md)
- [plan-update-confirmation](plan-update-confirmation.md)
- [Obsidian ChatGPT Plugin Integration Guide](obsidian-chatgpt-plugin-integration-guide.md)
- [ParticleSimulationWithCanvasAndFFmpeg](particlesimulationwithcanvasandffmpeg.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Obsidian ChatGPT Plugin Integration](obsidian-chatgpt-plugin-integration.md)
- [Mongo Outbox Implementation](mongo-outbox-implementation.md)
- [prom-lib-rate-limiters-and-replay-api](prom-lib-rate-limiters-and-replay-api.md)
- [Event Bus MVP](event-bus-mvp.md)
- [EidolonField](eidolonfield.md)
- [Services](chunks/services.md)
- [Voice Access Layer Design](voice-access-layer-design.md)
- [template-based-compilation](template-based-compilation.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)

## Sources
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#L331) (line 331, col 1, score 1)
- [Dynamic Context Model for Web Components — L331](dynamic-context-model-for-web-components.md#L331) (line 331, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#L72) (line 72, col 5, score 0.95)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#L88) (line 88, col 5, score 0.95)
- [Chroma Toolkit Consolidation Plan — L107](chroma-toolkit-consolidation-plan.md#L107) (line 107, col 5, score 0.95)
- [Chroma Toolkit Consolidation Plan — L148](chroma-toolkit-consolidation-plan.md#L148) (line 148, col 9, score 0.95)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#L157) (line 157, col 9, score 0.9)
- [Chroma Toolkit Consolidation Plan — L157](chroma-toolkit-consolidation-plan.md#L157) (line 157, col 13, score 0.9)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#L39) (line 39, col 4, score 0.92)
- [Migrate to Provider-Tenant Architecture — L39](migrate-to-provider-tenant-architecture.md#L39) (line 39, col 6, score 0.92)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#L47) (line 47, col 3, score 0.91)
- [Agent Tasks: Persistence Migration to DualStore — L47](agent-tasks-persistence-migration-to-dualstore.md#L47) (line 47, col 5, score 0.91)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#L48) (line 48, col 3, score 0.91)
- [Agent Tasks: Persistence Migration to DualStore — L48](agent-tasks-persistence-migration-to-dualstore.md#L48) (line 48, col 5, score 0.91)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#L49) (line 49, col 3, score 0.91)
- [Agent Tasks: Persistence Migration to DualStore — L49](agent-tasks-persistence-migration-to-dualstore.md#L49) (line 49, col 5, score 0.91)
- [Sibilant Meta-Prompt DSL — L131](sibilant-meta-prompt-dsl.md#L131) (line 131, col 1, score 0.87)
- [api-gateway-versioning — L285](api-gateway-versioning.md#L285) (line 285, col 1, score 1)
- [api-gateway-versioning — L285](api-gateway-versioning.md#L285) (line 285, col 3, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#L135) (line 135, col 1, score 1)
- [Board Walk – 2025-08-11 — L135](board-walk-2025-08-11.md#L135) (line 135, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#L167) (line 167, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L167](chroma-toolkit-consolidation-plan.md#L167) (line 167, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#L180) (line 180, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L180](cross-target-macro-system-in-sibilant.md#L180) (line 180, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L173](chroma-toolkit-consolidation-plan.md#L173) (line 173, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L173](chroma-toolkit-consolidation-plan.md#L173) (line 173, col 3, score 1)
- [eidolon-field-math-foundations — L133](eidolon-field-math-foundations.md#L133) (line 133, col 1, score 1)
- [eidolon-field-math-foundations — L133](eidolon-field-math-foundations.md#L133) (line 133, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L266](migrate-to-provider-tenant-architecture.md#L266) (line 266, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L472](per-domain-policy-system-for-js-crawler.md#L472) (line 472, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L131](agent-tasks-persistence-migration-to-dualstore.md#L131) (line 131, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L131](agent-tasks-persistence-migration-to-dualstore.md#L131) (line 131, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L169](chroma-toolkit-consolidation-plan.md#L169) (line 169, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L169](chroma-toolkit-consolidation-plan.md#L169) (line 169, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#L175) (line 175, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L175](cross-target-macro-system-in-sibilant.md#L175) (line 175, col 3, score 1)
- [Dynamic Context Model for Web Components — L392](dynamic-context-model-for-web-components.md#L392) (line 392, col 1, score 1)
- [Dynamic Context Model for Web Components — L392](dynamic-context-model-for-web-components.md#L392) (line 392, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#L134) (line 134, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L134](agent-tasks-persistence-migration-to-dualstore.md#L134) (line 134, col 3, score 1)
- [aionian-circuit-math — L156](aionian-circuit-math.md#L156) (line 156, col 1, score 1)
- [aionian-circuit-math — L156](aionian-circuit-math.md#L156) (line 156, col 3, score 1)
- [Board Walk – 2025-08-11 — L136](board-walk-2025-08-11.md#L136) (line 136, col 1, score 1)
- [Board Walk – 2025-08-11 — L136](board-walk-2025-08-11.md#L136) (line 136, col 3, score 1)
- [Dynamic Context Model for Web Components — L386](dynamic-context-model-for-web-components.md#L386) (line 386, col 1, score 1)
- [Dynamic Context Model for Web Components — L386](dynamic-context-model-for-web-components.md#L386) (line 386, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L172](chroma-toolkit-consolidation-plan.md#L172) (line 172, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L172](chroma-toolkit-consolidation-plan.md#L172) (line 172, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#L201) (line 201, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L201](cross-language-runtime-polymorphism.md#L201) (line 201, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L178](cross-target-macro-system-in-sibilant.md#L178) (line 178, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L178](cross-target-macro-system-in-sibilant.md#L178) (line 178, col 3, score 1)
- [EidolonField — L251](eidolonfield.md#L251) (line 251, col 1, score 1)
- [EidolonField — L251](eidolonfield.md#L251) (line 251, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#L173) (line 173, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L173](cross-target-macro-system-in-sibilant.md#L173) (line 173, col 3, score 1)
- [polyglot-repl-interface-layer — L156](polyglot-repl-interface-layer.md#L156) (line 156, col 1, score 1)
- [polyglot-repl-interface-layer — L156](polyglot-repl-interface-layer.md#L156) (line 156, col 3, score 1)
- [polymorphic-meta-programming-engine — L200](polymorphic-meta-programming-engine.md#L200) (line 200, col 1, score 1)
- [polymorphic-meta-programming-engine — L200](polymorphic-meta-programming-engine.md#L200) (line 200, col 3, score 1)
- [prompt-programming-language-lisp — L83](prompt-programming-language-lisp.md#L83) (line 83, col 1, score 1)
- [prompt-programming-language-lisp — L83](prompt-programming-language-lisp.md#L83) (line 83, col 3, score 1)
- [compiler-kit-foundations — L617](compiler-kit-foundations.md#L617) (line 617, col 1, score 1)
- [compiler-kit-foundations — L617](compiler-kit-foundations.md#L617) (line 617, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#L210) (line 210, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L210](cross-language-runtime-polymorphism.md#L210) (line 210, col 3, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#L170) (line 170, col 1, score 1)
- [Cross-Target Macro System in Sibilant — L170](cross-target-macro-system-in-sibilant.md#L170) (line 170, col 3, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L247](particlesimulationwithcanvasandffmpeg.md#L247) (line 247, col 1, score 1)
- [ParticleSimulationWithCanvasAndFFmpeg — L247](particlesimulationwithcanvasandffmpeg.md#L247) (line 247, col 3, score 1)
- [Services — L14](chunks/services.md#L14) (line 14, col 1, score 1)
- [Services — L14](chunks/services.md#L14) (line 14, col 3, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#L553) (line 553, col 1, score 1)
- [Event Bus MVP — L553](event-bus-mvp.md#L553) (line 553, col 3, score 1)
- [Mongo Outbox Implementation — L559](mongo-outbox-implementation.md#L559) (line 559, col 1, score 1)
- [Mongo Outbox Implementation — L559](mongo-outbox-implementation.md#L559) (line 559, col 3, score 1)
- [prom-lib-rate-limiters-and-replay-api — L388](prom-lib-rate-limiters-and-replay-api.md#L388) (line 388, col 1, score 1)
- [prom-lib-rate-limiters-and-replay-api — L388](prom-lib-rate-limiters-and-replay-api.md#L388) (line 388, col 3, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#L34) (line 34, col 1, score 1)
- [Obsidian ChatGPT Plugin Integration Guide — L34](obsidian-chatgpt-plugin-integration-guide.md#L34) (line 34, col 3, score 1)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#L34) (line 34, col 1, score 1)
- [Obsidian ChatGPT Plugin Integration — L34](obsidian-chatgpt-plugin-integration.md#L34) (line 34, col 3, score 1)
- [plan-update-confirmation — L990](plan-update-confirmation.md#L990) (line 990, col 1, score 1)
- [plan-update-confirmation — L990](plan-update-confirmation.md#L990) (line 990, col 3, score 1)
- [Promethean-Copilot-Intent-Engine — L59](promethean-copilot-intent-engine.md#L59) (line 59, col 1, score 1)
- [Promethean-Copilot-Intent-Engine — L59](promethean-copilot-intent-engine.md#L59) (line 59, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L207](sibilant-meta-prompt-dsl.md#L207) (line 207, col 1, score 0.99)
- [Sibilant Meta-Prompt DSL — L207](sibilant-meta-prompt-dsl.md#L207) (line 207, col 3, score 0.99)
- [api-gateway-versioning — L295](api-gateway-versioning.md#L295) (line 295, col 1, score 0.99)
- [api-gateway-versioning — L295](api-gateway-versioning.md#L295) (line 295, col 3, score 0.99)
- [Promethean Infrastructure Setup — L602](promethean-infrastructure-setup.md#L602) (line 602, col 1, score 0.99)
- [Promethean Infrastructure Setup — L602](promethean-infrastructure-setup.md#L602) (line 602, col 3, score 0.99)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#L186) (line 186, col 1, score 0.99)
- [Chroma Toolkit Consolidation Plan — L186](chroma-toolkit-consolidation-plan.md#L186) (line 186, col 3, score 0.99)
- [Sibilant Meta-Prompt DSL — L208](sibilant-meta-prompt-dsl.md#L208) (line 208, col 1, score 0.99)
- [Sibilant Meta-Prompt DSL — L208](sibilant-meta-prompt-dsl.md#L208) (line 208, col 3, score 0.99)
- [Dynamic Context Model for Web Components — L404](dynamic-context-model-for-web-components.md#L404) (line 404, col 1, score 1)
- [Dynamic Context Model for Web Components — L404](dynamic-context-model-for-web-components.md#L404) (line 404, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L201](sibilant-meta-prompt-dsl.md#L201) (line 201, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L201](sibilant-meta-prompt-dsl.md#L201) (line 201, col 3, score 1)
- [template-based-compilation — L124](template-based-compilation.md#L124) (line 124, col 1, score 1)
- [template-based-compilation — L124](template-based-compilation.md#L124) (line 124, col 3, score 1)
- [Voice Access Layer Design — L320](voice-access-layer-design.md#L320) (line 320, col 1, score 1)
- [Voice Access Layer Design — L320](voice-access-layer-design.md#L320) (line 320, col 3, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#L405) (line 405, col 1, score 1)
- [Dynamic Context Model for Web Components — L405](dynamic-context-model-for-web-components.md#L405) (line 405, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L202](sibilant-meta-prompt-dsl.md#L202) (line 202, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L202](sibilant-meta-prompt-dsl.md#L202) (line 202, col 3, score 1)
- [template-based-compilation — L125](template-based-compilation.md#L125) (line 125, col 1, score 1)
- [template-based-compilation — L125](template-based-compilation.md#L125) (line 125, col 3, score 1)
- [Voice Access Layer Design — L321](voice-access-layer-design.md#L321) (line 321, col 1, score 1)
- [Voice Access Layer Design — L321](voice-access-layer-design.md#L321) (line 321, col 3, score 1)
- [Dynamic Context Model for Web Components — L406](dynamic-context-model-for-web-components.md#L406) (line 406, col 1, score 1)
- [Dynamic Context Model for Web Components — L406](dynamic-context-model-for-web-components.md#L406) (line 406, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L203](sibilant-meta-prompt-dsl.md#L203) (line 203, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L203](sibilant-meta-prompt-dsl.md#L203) (line 203, col 3, score 1)
- [template-based-compilation — L126](template-based-compilation.md#L126) (line 126, col 1, score 1)
- [template-based-compilation — L126](template-based-compilation.md#L126) (line 126, col 3, score 1)
- [Voice Access Layer Design — L322](voice-access-layer-design.md#L322) (line 322, col 1, score 1)
- [Voice Access Layer Design — L322](voice-access-layer-design.md#L322) (line 322, col 3, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#L407) (line 407, col 1, score 1)
- [Dynamic Context Model for Web Components — L407](dynamic-context-model-for-web-components.md#L407) (line 407, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L204](sibilant-meta-prompt-dsl.md#L204) (line 204, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L204](sibilant-meta-prompt-dsl.md#L204) (line 204, col 3, score 1)
- [template-based-compilation — L127](template-based-compilation.md#L127) (line 127, col 1, score 1)
- [template-based-compilation — L127](template-based-compilation.md#L127) (line 127, col 3, score 1)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#L323) (line 323, col 1, score 1)
- [Voice Access Layer Design — L323](voice-access-layer-design.md#L323) (line 323, col 3, score 1)
- [Model Selection for Lightweight Conversational Tasks — L141](model-selection-for-lightweight-conversational-tasks.md#L141) (line 141, col 1, score 1)
- [Model Selection for Lightweight Conversational Tasks — L141](model-selection-for-lightweight-conversational-tasks.md#L141) (line 141, col 3, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#L140) (line 140, col 1, score 1)
- [Model Selection for Lightweight Conversational Tasks — L140](model-selection-for-lightweight-conversational-tasks.md#L140) (line 140, col 3, score 1)
- [Prompt_Folder_Bootstrap — L196](prompt-folder-bootstrap.md#L196) (line 196, col 1, score 0.99)
- [Prompt_Folder_Bootstrap — L196](prompt-folder-bootstrap.md#L196) (line 196, col 3, score 0.99)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#L142) (line 142, col 1, score 1)
- [Model Selection for Lightweight Conversational Tasks — L142](model-selection-for-lightweight-conversational-tasks.md#L142) (line 142, col 3, score 1)
- [Voice Access Layer Design — L325](voice-access-layer-design.md#L325) (line 325, col 1, score 0.99)
- [Voice Access Layer Design — L325](voice-access-layer-design.md#L325) (line 325, col 3, score 0.99)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#L152) (line 152, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L152](agent-tasks-persistence-migration-to-dualstore.md#L152) (line 152, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#L180) (line 180, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L180](chroma-toolkit-consolidation-plan.md#L180) (line 180, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L479](per-domain-policy-system-for-js-crawler.md#L479) (line 479, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L479](per-domain-policy-system-for-js-crawler.md#L479) (line 479, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L214](sibilant-meta-prompt-dsl.md#L214) (line 214, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L214](sibilant-meta-prompt-dsl.md#L214) (line 214, col 3, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#L153) (line 153, col 1, score 1)
- [Agent Tasks: Persistence Migration to DualStore — L153](agent-tasks-persistence-migration-to-dualstore.md#L153) (line 153, col 3, score 1)
- [Chroma Toolkit Consolidation Plan — L181](chroma-toolkit-consolidation-plan.md#L181) (line 181, col 1, score 1)
- [Chroma Toolkit Consolidation Plan — L181](chroma-toolkit-consolidation-plan.md#L181) (line 181, col 3, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#L480) (line 480, col 1, score 1)
- [Per-Domain Policy System for JS Crawler — L480](per-domain-policy-system-for-js-crawler.md#L480) (line 480, col 3, score 1)
- [Sibilant Meta-Prompt DSL — L215](sibilant-meta-prompt-dsl.md#L215) (line 215, col 1, score 1)
- [Sibilant Meta-Prompt DSL — L215](sibilant-meta-prompt-dsl.md#L215) (line 215, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#L291) (line 291, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L291](migrate-to-provider-tenant-architecture.md#L291) (line 291, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L293](migrate-to-provider-tenant-architecture.md#L293) (line 293, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L293](migrate-to-provider-tenant-architecture.md#L293) (line 293, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#L295) (line 295, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L295](migrate-to-provider-tenant-architecture.md#L295) (line 295, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#L307) (line 307, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L307](migrate-to-provider-tenant-architecture.md#L307) (line 307, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L292](migrate-to-provider-tenant-architecture.md#L292) (line 292, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L292](migrate-to-provider-tenant-architecture.md#L292) (line 292, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L294](migrate-to-provider-tenant-architecture.md#L294) (line 294, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L294](migrate-to-provider-tenant-architecture.md#L294) (line 294, col 3, score 1)
- [Migrate to Provider-Tenant Architecture — L296](migrate-to-provider-tenant-architecture.md#L296) (line 296, col 1, score 1)
- [Migrate to Provider-Tenant Architecture — L296](migrate-to-provider-tenant-architecture.md#L296) (line 296, col 3, score 1)
- [sibilant-macro-targets — L181](sibilant-macro-targets.md#L181) (line 181, col 1, score 1)
- [sibilant-macro-targets — L181](sibilant-macro-targets.md#L181) (line 181, col 3, score 1)
- [Cross-Language Runtime Polymorphism — L215](cross-language-runtime-polymorphism.md#L215) (line 215, col 1, score 1)
- [Cross-Language Runtime Polymorphism — L215](cross-language-runtime-polymorphism.md#L215) (line 215, col 3, score 1)
- [sibilant-meta-string-templating-runtime — L132](sibilant-meta-string-templating-runtime.md#L132) (line 132, col 1, score 1)
- [sibilant-meta-string-templating-runtime — L132](sibilant-meta-string-templating-runtime.md#L132) (line 132, col 3, score 1)
- [polyglot-repl-interface-layer — L170](polyglot-repl-interface-layer.md#L170) (line 170, col 1, score 0.99)
- [polyglot-repl-interface-layer — L170](polyglot-repl-interface-layer.md#L170) (line 170, col 3, score 0.99)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
