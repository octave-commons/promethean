---
uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
created_at: wm.md
filename: Window Management
description: >-
  This document covers window management techniques and tools, including
  autohotkey i3 emulation, Lisp window manager DSLs, TypeScript group managers,
  and NPU tiling strategies. It provides a structured approach to organizing and
  controlling window layouts across different environments.
tags:
  - window
  - management
  - autohotkey
  - i3
  - lisp
  - typescript
  - group
  - npu
  - tiling
  - strategy
related_to_title:
  - Unique Info Dump Index
  - DSL
  - komorebi-group-window-hack
  - windows-tiling-with-autohotkey
  - lisp-dsl-for-window-management
  - aionian-circuit-math
  - archetype-ecs
  - Diagrams
  - compiler-kit-foundations
  - Interop and Source Maps
  - ts-to-lisp-transpiler
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - e87bc036-1570-419e-a558-f45b9c0db698
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 0f6f8f38-98d0-438f-9601-58f478acc0b7
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 158
    col: 3
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 457
    col: 3
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 1
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 9
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 10
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 615
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 615
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 519
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 519
    col: 3
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 14
    col: 1
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 14
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 65
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 65
    col: 3
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 222
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 222
    col: 3
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 126
    col: 1
    score: 1
  - uuid: 0f6f8f38-98d0-438f-9601-58f478acc0b7
    line: 126
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
# Window Management

- **2025.07.28.11.07.04** → [[autohotkey-i3-emulation.md]]
- **2025.07.28.11.07.18** → [[lisp-window-manager-dsl.md]]
- **2025.07.28.11.07.38** → [[typescript-group-manager-komorebi.md]]
- **2025.07.28.11.07.43** → [[nesting-window-containers-windows.md]]
- **2025.07.28.11.07.68** → [[windows-npu-tiling-strategy.md]]
- **2025.07.28.11.07.93** → [[autohotkey-i3layer-scripts.md]]
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Unique Info Dump Index](../unique-info-dump-index.md)
- [DSL](dsl.md)
- [komorebi-group-window-hack](../komorebi-group-window-hack.md)
- [windows-tiling-with-autohotkey](../windows-tiling-with-autohotkey.md)
- [lisp-dsl-for-window-management](../lisp-dsl-for-window-management.md)
- [aionian-circuit-math](../aionian-circuit-math.md)
- [archetype-ecs](../archetype-ecs.md)
- [Diagrams](diagrams.md)
- [compiler-kit-foundations](../compiler-kit-foundations.md)
- [Interop and Source Maps](../interop-and-source-maps.md)
- [ts-to-lisp-transpiler](../ts-to-lisp-transpiler.md)
- [AI-Centric OS with MCP Layer](../ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](../ai-first-os-model-context-protocol.md)
- [balanced-bst](../balanced-bst.md)

## Sources
- [aionian-circuit-math — L158](../aionian-circuit-math.md#L158) (line 158, col 1, score 1)
- [aionian-circuit-math — L158](../aionian-circuit-math.md#L158) (line 158, col 3, score 1)
- [archetype-ecs — L457](../archetype-ecs.md#L457) (line 457, col 1, score 1)
- [archetype-ecs — L457](../archetype-ecs.md#L457) (line 457, col 3, score 1)
- [Diagrams — L9](diagrams.md#L9) (line 9, col 1, score 1)
- [Diagrams — L9](diagrams.md#L9) (line 9, col 3, score 1)
- [DSL — L10](dsl.md#L10) (line 10, col 1, score 1)
- [DSL — L10](dsl.md#L10) (line 10, col 3, score 1)
- [compiler-kit-foundations — L615](../compiler-kit-foundations.md#L615) (line 615, col 1, score 1)
- [compiler-kit-foundations — L615](../compiler-kit-foundations.md#L615) (line 615, col 3, score 1)
- [Interop and Source Maps — L519](../interop-and-source-maps.md#L519) (line 519, col 1, score 1)
- [Interop and Source Maps — L519](../interop-and-source-maps.md#L519) (line 519, col 3, score 1)
- [ts-to-lisp-transpiler — L14](../ts-to-lisp-transpiler.md#L14) (line 14, col 1, score 1)
- [ts-to-lisp-transpiler — L14](../ts-to-lisp-transpiler.md#L14) (line 14, col 3, score 1)
- [Unique Info Dump Index — L65](../unique-info-dump-index.md#L65) (line 65, col 1, score 1)
- [Unique Info Dump Index — L65](../unique-info-dump-index.md#L65) (line 65, col 3, score 1)
- [lisp-dsl-for-window-management — L222](../lisp-dsl-for-window-management.md#L222) (line 222, col 1, score 1)
- [lisp-dsl-for-window-management — L222](../lisp-dsl-for-window-management.md#L222) (line 222, col 3, score 1)
- [windows-tiling-with-autohotkey — L126](../windows-tiling-with-autohotkey.md#L126) (line 126, col 1, score 1)
- [windows-tiling-with-autohotkey — L126](../windows-tiling-with-autohotkey.md#L126) (line 126, col 3, score 1)
- [AI-Centric OS with MCP Layer — L406](../ai-centric-os-with-mcp-layer.md#L406) (line 406, col 1, score 1)
- [AI-Centric OS with MCP Layer — L406](../ai-centric-os-with-mcp-layer.md#L406) (line 406, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](../ai-first-os-model-context-protocol.md#L11) (line 11, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L11](../ai-first-os-model-context-protocol.md#L11) (line 11, col 3, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](../ai-first-os-model-context-protocol.md#L14) (line 14, col 1, score 1)
- [AI-First-OS-Model-Context-Protocol — L14](../ai-first-os-model-context-protocol.md#L14) (line 14, col 3, score 1)
- [balanced-bst — L297](../balanced-bst.md#L297) (line 297, col 1, score 1)
- [balanced-bst — L297](../balanced-bst.md#L297) (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
