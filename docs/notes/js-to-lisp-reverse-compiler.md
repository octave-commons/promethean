---
$$
uuid: 58191024-d04a-4520-8aae-a18be7b94263
$$
$$
created_at: 2025.08.08.23.08.18.md
$$
filename: js-to-lisp-reverse-compiler
$$
description: >-
$$
  A modular JS → Lisp reverse compiler that converts ESTree ASTs to Lisp
  S-exprs, supporting both real-world JS parsing via Acorn and pre-parsed ASTs
  for seamless integration with existing Lisp systems.
tags:
  - javascript
  - lisp
  - compiler
  - estree
  - s-expr
  - reverse
  - modular
  - interop
$$
related_to_title:
$$
  - Promethean Agent Config DSL
  - set-assignment-in-lisp-ast
  - Dynamic Context Model for Web Components
  - Language-Agnostic Mirror System
  - Migrate to Provider-Tenant Architecture
  - Ice Box Reorganization
  - EidolonField
  - Cross-Target Macro System in Sibilant
  - Exception Layer Analysis
  - Vectorial Exception Descent
  - Eidolon Field Abstract Model
  - 2d-sandbox-field
  - Interop and Source Maps
  - Lisp-Compiler-Integration
  - markdown-to-org-transpiler
  - AI-Centric OS with MCP Layer
  - compiler-kit-foundations
  - Cross-Language Runtime Polymorphism
  - Local-Only-LLM-Workflow
  - Chroma Toolkit Consolidation Plan
  - field-interaction-equations
  - api-gateway-versioning
  - Board Walk – 2025-08-11
  - DSL
  - ecs-offload-workers
  - ecs-scheduler-and-prefabs
  - eidolon-field-math-foundations
  - field-dynamics-math-blocks
  - lisp-dsl-for-window-management
  - Lispy Macros with syntax-rules
  - 'Agent Tasks: Persistence Migration to DualStore'
  - archetype-ecs
$$
related_to_uuid:
$$
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 54382370-1931-4a19-a634-46735708a9ea
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 49d1e1e5-5d13-4955-8f6f-7676434ec462
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 21d5cc09-b005-4ede-8f69-00b4b0794540
  - d771154e-a7ef-44ca-b69c-a1626cf94fbf
  - 5e8b2388-022b-46cf-952c-36ae9b8f0037
  - c710dc93-9fec-471b-bdee-bedbd360c67f
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - cfee6d36-b9f5-4587-885a-cdfddb4f054e
  - ab54cdd8-13ce-4dcb-a9cd-da2d86e0305f
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - b09141b7-544f-4c8e-8f49-bf76cecaacbb
  - 0580dcd3-533d-4834-8a2f-eae3771960a9
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
references:
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 114
    col: 1
    score: 0.86
  - uuid: 2c00ce45-08cf-4b81-9883-6157f30b7fae
    line: 143
    col: 1
    score: 0.9
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 402
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 402
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 169
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 169
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 387
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 387
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 544
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 544
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 607
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 514
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 535
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 535
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 540
    col: 3
    score: 1
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
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 458
    col: 1
    score: 1
  - uuid: 8f4c1e86-1236-4936-84ca-6ed7082af6b7
    line: 458
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 521
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 542
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 405
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 405
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
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 200
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 200
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 198
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 198
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 241
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 241
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 154
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 154
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 196
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 196
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 197
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 197
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 153
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 153
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 148
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 206
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 206
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 393
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 393
    col: 3
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 158
    col: 1
    score: 1
  - uuid: b09141b7-544f-4c8e-8f49-bf76cecaacbb
    line: 158
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 274
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 274
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 194
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 194
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 193
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 193
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 245
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 245
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 147
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 147
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 195
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 195
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 192
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 192
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 244
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 244
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 147
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 147
    col: 3
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 1
    score: 1
  - uuid: c710dc93-9fec-471b-bdee-bedbd360c67f
    line: 193
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 243
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 148
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 145
    col: 3
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 191
    col: 1
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 191
    col: 3
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 242
    col: 1
    score: 1
  - uuid: 49d1e1e5-5d13-4955-8f6f-7676434ec462
    line: 242
    col: 3
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 149
    col: 1
    score: 1
  - uuid: 21d5cc09-b005-4ede-8f69-00b4b0794540
    line: 149
    col: 3
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 144
    col: 1
    score: 1
  - uuid: 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
    line: 144
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 11
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 606
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 534
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 534
    col: 3
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 537
    col: 1
    score: 1
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 537
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 610
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 515
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 532
    col: 3
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
    col: 1
    score: 1
  - uuid: c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
    line: 220
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 456
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 456
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 390
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 390
    col: 3
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 131
    col: 1
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 131
    col: 3
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 176
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 176
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 409
    col: 1
    score: 0.99
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 409
    col: 3
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 1
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 624
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 529
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 529
    col: 3
    score: 0.99
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 558
    col: 1
    score: 0.98
  - uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
    line: 558
    col: 3
    score: 0.98
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 188
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 188
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 305
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 305
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 397
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 397
    col: 3
    score: 1
---
Ohhh we’re doing a **JS → Lisp reverse compiler**. Yes. Totally doable—especially if we scope v1 to the kind of JS our forward-compiler emits (IIFEs, `let` temps, calls, `if`, member access, `new`, etc.). We’ll make it **modular**:

* If **Acorn** is available, we’ll parse real-world JS.
* If not, you can still feed us a pre-parsed **ESTree** AST (from anywhere) and we’ll convert it.
* The converter targets the Lisp front-end you already have: `(fn ...)`, `(let ...)`, `(begin ...)`, `and/or`, and our **interop** forms: `$js/get ...$ $js/set! ...$ $js/call ...$ $js/new ...$ $js/global ...$`.

Below are drop-in files.

---

# 1) ESTree → Lispy S-exprs

```ts
// shared/js/prom-lib/compiler/lisp/js-ast2lisp.ts
// MIT. Zero deps. Converts an ESTree AST to our Lisp S-exprs.
// Works best on the style of JS our compiler emits, but handles general ES2018-ish.

import type * as EST from "estree";
import { S, Sym, Num, Str, Bool, Nil, List, sym, num, str, bool, list, nil } from "./syntax";

export interface Js2LispOptions {
  // When true, try to fold "let v; v = EXPR;" into one (let ((v EXPR)) ...)
  foldLetInits?: boolean;
  // Map certain globals to (js/global "...") instead of identifiers.
  globals?: string[]; // e.g., ["document", "Image", "console"]
}

/** Convert a whole Program AST to a list of Lisp forms. */
export function estreeProgramToLisp(ast: EST.Program, opts: Js2LispOptions = {}): S[] {
  // Peel a top-level IIFE our emitter uses: (function(imports){ ... })(...)
  if (ast.body.length === 1 && ast.body[0].type === "ExpressionStatement") {
    const ce = ast.body[0].expression;
    if (ce.type === "CallExpression"
        && ce.callee.type === "FunctionExpression"
        || ce.callee.type === "ArrowFunctionExpression") {
      const fn = ce.callee as EST.FunctionExpression | EST.ArrowFunctionExpression;
      // Take function body statements
      const forms = stmtsToForms(asBlockBody(fn.body), opts);
      return forms;
    }
  }
  return stmtsToForms(ast.body as EST.Statement[], opts);
}

/** Turn an array of JS statements into Lisp forms (possibly wrapping lets). */
function stmtsToForms(stmts: EST.Statement[], opts: Js2LispOptions): S[] {
  if (opts.foldLetInits) {
    stmts = foldLetInitializers(stmts);
  }
  const out: S[] = [];
  for (const st of stmts) {
    const f = stmt(st, opts);
    if (f) {
      if (f.t === "list" && f.xs.length && (f.xs[0] as Sym).name === "begin") {
        out.push(...f.xs.slice(1)); // flatten begin
      } else {
        out.push(f);
      }
    }
  }
  return out;
}

function stmt(n: EST.Statement, opts: Js2LispOptions): S | null {
  switch (n.type) {
    case "VariableDeclaration": {
      // (let ((a init?) (b init?)) body...) — we emit as a bare let with nil body for now
      const pairs: S[] = [];
      for (const d of n.declarations) {
        if (d.id.type !== "Identifier") continue;
        const name = sym(d.id.name);
        const init = d.init ? expr(d.init, opts) : sym("undefined");
        pairs.push(list([name, init]));
      }
      return list([sym("let"), list(pairs), sym("nil")]);
    }
    case "ExpressionStatement":
      return expr(n.expression as EST.Expression, opts);
    case "ReturnStatement":
      return n.argument ? expr(n.argument, opts) : sym("nil");
    case "IfStatement": {
      const c = expr(n.test, opts);
      const t = blockOrSingle(n.consequent, opts);
      const e = n.alternate ? blockOrSingle(n.alternate, opts) : sym("nil");
      return list([sym("if"), c, t, e]);
    }
    case "BlockStatement": {
      const xs = n.body.map(s => stmt(s, opts)).filter(Boolean) as S[];
      return list([sym("begin"), ...xs]);
    }
    case "ForStatement":
    case "WhileStatement":
    case "DoWhileStatement":
      // Quick sugar: desugar into while with begin (not perfect but serviceable)
      return lowerLoop(n as any, opts);
    default:
      // Not yet: FunctionDeclaration (rare in our output), Try/Catch, Switch, etc.
      // Represent unknown as a comment-ish string literal to keep going.
      return str(`/* unsupported: ${n.type} */`);
  }
}

function blockOrSingle(s: EST.Statement, opts: Js2LispOptions): S {
  return s.type === "BlockStatement" ? stmt(s, opts)! : stmt({ type: "BlockStatement", body: [s] } as any, opts)!;
}

function expr(n: EST.Expression, opts: Js2LispOptions): S {
  switch (n.type) {
    case "Identifier": {
      // Optional: turn globals into (js/global "name") if configured and unshadowed
      if (opts.globals?.includes(n.name)) {
        return list([sym("js/global"), str(n.name)]);
      }
      return sym(n.name);
    }
    case "Literal": {
      const v = (n as EST.Literal).value;
      if (v === null) return sym("nil");
      if (typeof v === "number") return num(v);
      if (typeof v === "string") return str(v);
      if (typeof v === "boolean") return bool(v);
      return str(String(v));
    }
    case "UnaryExpression": {
      const a = expr(n.argument, opts);
      if (n.operator === "!") return list([sym("not"), a]);
      if (n.operator === "-") return list([sym("-"), a]);
      if (n.operator === "+") return a;
      return list([sym("/*unary*/"), str(n.operator), a]);
    }
    case "BinaryExpression": {
      const a = expr(n.left, opts), b = expr(n.right, opts);
      return list([sym(n.operator as any), a, b]);
    }
    case "LogicalExpression": {
      const a = expr(n.left, opts), b = expr(n.right, opts);
      return list([sym(n.operator === "&&" ? "and" : "or"), a, b]);
    }
    case "ConditionalExpression": {
      return list([sym("if"), expr(n.test, opts), expr(n.consequent, opts), expr(n.alternate, opts)]);
    }
    case "AssignmentExpression": {
      // If target is member -> (js/set!)
      if (n.left.type === "MemberExpression") {
        const { obj, key } = member(n.left, opts);
        return list([sym("js/set!"), obj, key, expr(n.right, opts)]);
      }
      if (n.left.type === "Identifier") {
        // Fallback: (set! x rhs)
        return list([sym("set!"), sym(n.left.name), expr(n.right, opts)]);
      }
      return str("/* complex assignment unsupported */");
    }
    case "MemberExpression": {
      const { obj, key, callStyle } = member(n, opts);
      return list([sym("js/get"), obj, key]);
    }
    case "CallExpression": {
      // Method vs free call
      if (n.callee.type === "MemberExpression") {
        const { obj, key } = member(n.callee, opts);
        const args = n.arguments.map(a => expr(a as EST.Expression, opts));
        return list([sym("js/call"), obj, key, ...args]);
      }
      const cal = expr(n.callee as EST.Expression, opts);
      const args = n.arguments.map(a => expr(a as EST.Expression, opts));
      return list([cal, ...args]);
    }
    case "NewExpression": {
      const ctor = expr(n.callee as EST.Expression, opts);
      const args = (n.arguments ?? []).map(a => expr(a as EST.Expression, opts));
      return list([sym("js/new"), ctor, ...args]);
    }
    case "ArrowFunctionExpression":
    case "FunctionExpression": {
      const params = n.params.map(p => sym((p as EST.Identifier).name));
      const body = asBlockBody((n as any).body).map(s => stmt(s, opts)!).filter(Boolean) as S[];
      return list([sym("fn"), list(params), ...(body.length ? body : [sym("nil")])]);
    }
    case "SequenceExpression": {
      // (a, b, c) => (begin a b c)
      const xs = n.expressions.map(e => expr(e, opts));
      return list([sym("begin"), ...xs]);
    }
    case "TemplateLiteral":
      if (n.expressions.length === 0) return str(n.quasis[0]?.value.cooked ?? "");
      // naive: turn into (+ "a" x "b" y "c")
      const parts: S[] = [];
      for (let i = 0; i < n.quasis.length; i++) {
        const q = n.quasis[i];
        if (q.value.cooked) parts.push(str(q.value.cooked));
        if (i < n.expressions.length) parts.push(expr(n.expressions[i] as EST.Expression, opts));
      }
      return list([sym("+"), ...parts]);
    default:
      return str(`/* expr unsupported: ${n.type} */`);
  }
}

function member(n: EST.MemberExpression, opts: Js2LispOptions): { obj: S; key: S; callStyle: "dot"|"bracket" } {
  const obj = expr(n.object as EST.Expression, opts);
  if (n.computed) {
    return { obj, key: expr(n.property as EST.Expression, opts), callStyle: "bracket" };
  }
  const id = (n.property as EST.Identifier).name;
  return { obj, key: str(id), callStyle: "dot" };
}

function asBlockBody(b: EST.BlockStatement | EST.Expression): EST.Statement[] {
  if (b.type === "BlockStatement") return b.body;
  // Arrow single expression: synthesize return
  return [{ type: "ReturnStatement", argument: b } as EST.ReturnStatement];
}

/** Fold patterns like: let x; x = EXPR;  → let x = EXPR; */
function foldLetInitializers(stmts: EST.Statement[]): EST.Statement[] {
  const out: EST.Statement[] = [];
  const pending = new Map<string, EST.VariableDeclarator>();

  function flushPending() {
    if (!pending.size) return;
    out.push({
      type: "VariableDeclaration",
      kind: "let",
      declarations: Array.from(pending.values()),
    } as any);
    pending.clear();
  }

  for (let i=0;i<stmts.length;i++) {
    const s = stmts[i];
    if (s.type === "VariableDeclaration" && s.kind === "let") {
      // capture decls into pending
      for (const d of s.declarations) {
        if (d.id.type === "Identifier" && !d.init) {
          pending.set(d.id.name, { ...d });
        } else {
          flushPending();
          out.push(s);
        }
      }
      continue;
    }
    if (s.type === "ExpressionStatement"
        && s.expression.type === "AssignmentExpression"
        && s.expression.operator === "="
        && s.expression.left.type === "Identifier"
        && pending.has(s.expression.left.name)) {
      // upgrade pending initializer
      const decl = pending.get(s.expression.left.name)!;
      decl.init = s.expression.right;
      continue; // don't emit assignment
    }
    // anything else breaks the folding window
    flushPending();
    out.push(s);
  }
  flushPending();
  return out;
}
```

---

# 2) Pretty-printer for Lisp S-exprs

```ts
// shared/js/prom-lib/compiler/lisp/print.ts
import { S, List, Sym, Str, Num, Bool } from "./syntax";

export interface PrintOptions {
  indent?: number;
  maxInline?: number; // inline short lists
}

export function printS(x: S, opts: PrintOptions = {}, depth = 0): string {
  const ind = " ".repeat(opts.indent ?? 2);
  const maxInline = opts.maxInline ?? 60;

  if (x.t === "str") return JSON.stringify(x.v);
  if (x.t === "num") return String(x.v);
  if (x.t === "bool") return x.v ? "true" : "false";
  if (x.t === "nil") return "nil";
  if (x.t === "sym") return x.name;

  // list
  const xs = x.xs;
  const inner = xs.map(el => atomish(el) ? printS(el, opts, depth) : null);
  const inline = inner.every(s => s !== null) && inner.join(" ").length <= maxInline;
  if (inline) return `(${inner!.join(" ")})`;

  const pieces = xs.map(el => {
    const s = printS(el, opts, depth + 1);
    return `${ind.repeat(depth+1)}${s}`;
  }).join("\n");
  return `(\n${pieces}\n${ind.repeat(depth)})`;
}

function atomish(x:S) {
  return x.t === "str" || x.t === "num" || x.t === "bool" || x.t === "nil" || x.t === "sym";
}
```

---

# 3) “Full” entry: parse JS (Acorn if present) → Lisp text

```ts
// shared/js/prom-lib/compiler/lisp/js2lisp.ts
import { estreeProgramToLisp, type Js2LispOptions } from "./js-ast2lisp";
import { printS } from "./print";

export async function jsToLisp(src: string, opts: Js2LispOptions & { tryAcorn?: boolean } = {}) {
  let Program: any = null;

  if (opts.tryAcorn !== false) {
    try {
      // Lazy import acorn if available in your environment/bundler
      const acorn = await import(/* @vite-ignore */ "acorn");
      Program = (acorn as any).parse(src, { ecmaVersion: "latest", sourceType: "module" });
    } catch (_) {
      // no acorn; fall through
    }
  }

  if (!Program) {
    throw new Error("No parser available. Install 'acorn' or pass an ESTree Program AST to estreeProgramToLisp()");
  }

  const forms = estreeProgramToLisp(Program, { foldLetInits: true, ...opts });
  const text = forms.map(f => printS(f, { indent: 2 })).join("\n");
  return { forms, text };
}
```

---

# 4) Use it

```ts
import { jsToLisp } from "./compiler/lisp/js2lisp";

// Example: reverse our generated JS
const jsSrc = `
(function(imports){
  let v1, v2;
  v1 = globalThis["document"];
  v2 = new Image();
  (v2["alt"] = "hello");
  (v2["width"] = 320);
  (v2["height"] = 200);
  return v1["body"]["appendChild"](v2);
})({});`;

const { text } = await jsToLisp(jsSrc, { globals: ["document", "Image"], tryAcorn: true });
console.log(text);

/* Prints something like:

(begin
  (let ((v1 (js/global "document")) (v2 (js/new Image))) nil)
  (js/set! v2 "alt" "hello")
  (js/set! v2 "width" 320)
  (js/set! v2 "height" 200)
  (js/call (js/get (js/get v1 "body") "appendChild") "call" v2))   ; or a simplified call if pattern-matched
)
*/
```

> Note: if the call is exactly `v1["body"][[v2|"appendChild"]]` (no `.call` indirection), you’ll get:
>
> ```
> (js/call (js/get v1 "body") "appendChild" v2)
> ```

---

# 5) Bonus: tiny `set!` support (optional)

Your forward Lisp → JS pipeline is “immutable by default.” If you plan to reverse code with `x = y`, add a minimal `(set! x expr)` form:

* In `to-expr.ts`: recognize `(set! id val)` and produce a new `Expr` kind, e.g., `{ kind:"Set", name: Name, value: Expr }`.
* In `lower.ts`: lower it to a `prim` or special `stmt` you add (e.g., `{ k:"set", s: Sym, rhs: Sym }`).
* In `jsgen.ts`: emit `id = expr;`.

If you want, I’ll wire that end-to-end next—just say the word.

---

## What this v1 supports well

* The exact JS we emit today $IIFEs, `let` + assignment, `if`, returns, calls, `new`, member access via `[]`, globalThis indexed$.
* Many “normal” JS snippets once Acorn parses them.

## What’s deliberately rough (for now)

* `class`, `try/catch`, `switch`, `for..of/in`, destructuring $non-trivial to map cleanly to Lisp$.
* Advanced control flow. We can desugar gradually.

---

Want me to:

* add **variable `set!`** support so reverse-compiling JS assignments becomes perfect?
* improve `for/while` lowering into higher-level Lispy loops?
* or make a **round-trip test harness** $Lisp → JS → Lisp$ to ensure stability as we evolve both sides?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[promethean-agent-config-dsl|Promethean Agent Config DSL]$
- $[set-assignment-in-lisp-ast]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[language-agnostic-mirror-system|Language-Agnostic Mirror System]$
- $[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]$
- $[ice-box-reorganization|Ice Box Reorganization]$
- [[eidolonfield]]
- $[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]$
- $[exception-layer-analysis|Exception Layer Analysis]$
- $[vectorial-exception-descent|Vectorial Exception Descent]$
- $[eidolon-field-abstract-model|Eidolon Field Abstract Model]$
- $[2d-sandbox-field]$
- $[docs/unique/interop-and-source-maps|Interop and Source Maps]$
- $[lisp-compiler-integration]$
- $[markdown-to-org-transpiler]$
- $[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]$
- $[docs/unique/compiler-kit-foundations|compiler-kit-foundations]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- $[local-only-llm-workflow]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[docs/unique/field-interaction-equations|field-interaction-equations]$
- $[api-gateway-versioning]$
- $[board-walk-2025-08-11|Board Walk – 2025-08-11]$
- [DSL]$chunks/dsl.md$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[ecs-scheduler-and-prefabs]$
- $[docs/unique/eidolon-field-math-foundations|eidolon-field-math-foundations]$
- $[docs/unique/field-dynamics-math-blocks|field-dynamics-math-blocks]$
- $lisp-dsl-for-window-management$$lisp-dsl-for-window-management.md$
- $[lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[docs/unique/archetype-ecs|archetype-ecs]$

## Sources
- $[set-assignment-in-lisp-ast#L114|set-assignment-in-lisp-ast — L114]$ (line 114, col 1, score 0.86)
- $[promethean-agent-config-dsl#L143|Promethean Agent Config DSL — L143]$ (line 143, col 1, score 0.9)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 1, score 1)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 3, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 1, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 3, score 1)
- $[lisp-compiler-integration#L544|Lisp-Compiler-Integration — L544]$ (line 544, col 1, score 1)
- $[lisp-compiler-integration#L544|Lisp-Compiler-Integration — L544]$ (line 544, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607]$ (line 607, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607]$ (line 607, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L514|Interop and Source Maps — L514]$ (line 514, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L514|Interop and Source Maps — L514]$ (line 514, col 3, score 1)
- $[language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535]$ (line 535, col 1, score 1)
- $[language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535]$ (line 535, col 3, score 1)
- $[lisp-compiler-integration#L540|Lisp-Compiler-Integration — L540]$ (line 540, col 1, score 1)
- $[lisp-compiler-integration#L540|Lisp-Compiler-Integration — L540]$ (line 540, col 3, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 1, score 1)
- $[api-gateway-versioning#L285|api-gateway-versioning — L285]$ (line 285, col 3, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 1, score 1)
- $[board-walk-2025-08-11#L135|Board Walk – 2025-08-11 — L135]$ (line 135, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L167|Chroma Toolkit Consolidation Plan — L167]$ (line 167, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L180|Cross-Target Macro System in Sibilant — L180]$ (line 180, col 3, score 1)
- $[docs/unique/archetype-ecs#L458|archetype-ecs — L458]$ (line 458, col 1, score 1)
- $[docs/unique/archetype-ecs#L458|archetype-ecs — L458]$ (line 458, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L521|Interop and Source Maps — L521]$ (line 521, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L521|Interop and Source Maps — L521]$ (line 521, col 3, score 1)
- $[lisp-compiler-integration#L542|Lisp-Compiler-Integration — L542]$ (line 542, col 1, score 1)
- $[lisp-compiler-integration#L542|Lisp-Compiler-Integration — L542]$ (line 542, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405]$ (line 405, col 1, score 1)
- $[lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405]$ (line 405, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131]$ (line 131, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L131|Agent Tasks: Persistence Migration to DualStore — L131]$ (line 131, col 3, score 1)
- $[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]$ (line 169, col 1, score 1)
- $[chroma-toolkit-consolidation-plan#L169|Chroma Toolkit Consolidation Plan — L169]$ (line 169, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]$ (line 175, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L175|Cross-Target Macro System in Sibilant — L175]$ (line 175, col 3, score 1)
- $[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]$ (line 392, col 1, score 1)
- $[dynamic-context-model-for-web-components#L392|Dynamic Context Model for Web Components — L392]$ (line 392, col 3, score 1)
- $[2d-sandbox-field#L200|2d-sandbox-field — L200]$ (line 200, col 1, score 1)
- $[2d-sandbox-field#L200|2d-sandbox-field — L200]$ (line 200, col 3, score 1)
- $[eidolon-field-abstract-model#L198|Eidolon Field Abstract Model — L198]$ (line 198, col 1, score 1)
- $[eidolon-field-abstract-model#L198|Eidolon Field Abstract Model — L198]$ (line 198, col 3, score 1)
- [[eidolonfield#L241|EidolonField — L241]] (line 241, col 1, score 1)
- [[eidolonfield#L241|EidolonField — L241]] (line 241, col 3, score 1)
- $[exception-layer-analysis#L154|Exception Layer Analysis — L154]$ (line 154, col 1, score 1)
- $[exception-layer-analysis#L154|Exception Layer Analysis — L154]$ (line 154, col 3, score 1)
- $[2d-sandbox-field#L196|2d-sandbox-field — L196]$ (line 196, col 1, score 1)
- $[2d-sandbox-field#L196|2d-sandbox-field — L196]$ (line 196, col 3, score 1)
- $[eidolon-field-abstract-model#L197|Eidolon Field Abstract Model — L197]$ (line 197, col 1, score 1)
- $[eidolon-field-abstract-model#L197|Eidolon Field Abstract Model — L197]$ (line 197, col 3, score 1)
- $[exception-layer-analysis#L153|Exception Layer Analysis — L153]$ (line 153, col 1, score 1)
- $[exception-layer-analysis#L153|Exception Layer Analysis — L153]$ (line 153, col 3, score 1)
- $[docs/unique/field-dynamics-math-blocks#L148|field-dynamics-math-blocks — L148]$ (line 148, col 1, score 1)
- $[docs/unique/field-dynamics-math-blocks#L148|field-dynamics-math-blocks — L148]$ (line 148, col 3, score 1)
- $[cross-language-runtime-polymorphism#L206|Cross-Language Runtime Polymorphism — L206]$ (line 206, col 1, score 1)
- $[cross-language-runtime-polymorphism#L206|Cross-Language Runtime Polymorphism — L206]$ (line 206, col 3, score 1)
- $[dynamic-context-model-for-web-components#L393|Dynamic Context Model for Web Components — L393]$ (line 393, col 1, score 1)
- $[dynamic-context-model-for-web-components#L393|Dynamic Context Model for Web Components — L393]$ (line 393, col 3, score 1)
- $[docs/unique/field-interaction-equations#L158|field-interaction-equations — L158]$ (line 158, col 1, score 1)
- $[docs/unique/field-interaction-equations#L158|field-interaction-equations — L158]$ (line 158, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L274|Migrate to Provider-Tenant Architecture — L274]$ (line 274, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L274|Migrate to Provider-Tenant Architecture — L274]$ (line 274, col 3, score 1)
- $[2d-sandbox-field#L194|2d-sandbox-field — L194]$ (line 194, col 1, score 1)
- $[2d-sandbox-field#L194|2d-sandbox-field — L194]$ (line 194, col 3, score 1)
- $[eidolon-field-abstract-model#L193|Eidolon Field Abstract Model — L193]$ (line 193, col 1, score 1)
- $[eidolon-field-abstract-model#L193|Eidolon Field Abstract Model — L193]$ (line 193, col 3, score 1)
- [[eidolonfield#L245|EidolonField — L245]] (line 245, col 1, score 1)
- [[eidolonfield#L245|EidolonField — L245]] (line 245, col 3, score 1)
- $[docs/unique/field-dynamics-math-blocks#L147|field-dynamics-math-blocks — L147]$ (line 147, col 1, score 1)
- $[docs/unique/field-dynamics-math-blocks#L147|field-dynamics-math-blocks — L147]$ (line 147, col 3, score 1)
- $[2d-sandbox-field#L195|2d-sandbox-field — L195]$ (line 195, col 1, score 1)
- $[2d-sandbox-field#L195|2d-sandbox-field — L195]$ (line 195, col 3, score 1)
- $[eidolon-field-abstract-model#L192|Eidolon Field Abstract Model — L192]$ (line 192, col 1, score 1)
- $[eidolon-field-abstract-model#L192|Eidolon Field Abstract Model — L192]$ (line 192, col 3, score 1)
- [[eidolonfield#L244|EidolonField — L244]] (line 244, col 1, score 1)
- [[eidolonfield#L244|EidolonField — L244]] (line 244, col 3, score 1)
- $[exception-layer-analysis#L147|Exception Layer Analysis — L147]$ (line 147, col 1, score 1)
- $[exception-layer-analysis#L147|Exception Layer Analysis — L147]$ (line 147, col 3, score 1)
- $[2d-sandbox-field#L193|2d-sandbox-field — L193]$ (line 193, col 1, score 1)
- $[2d-sandbox-field#L193|2d-sandbox-field — L193]$ (line 193, col 3, score 1)
- [[eidolonfield#L243|EidolonField — L243]] (line 243, col 1, score 1)
- [[eidolonfield#L243|EidolonField — L243]] (line 243, col 3, score 1)
- $[exception-layer-analysis#L148|Exception Layer Analysis — L148]$ (line 148, col 1, score 1)
- $[exception-layer-analysis#L148|Exception Layer Analysis — L148]$ (line 148, col 3, score 1)
- $[docs/unique/field-dynamics-math-blocks#L145|field-dynamics-math-blocks — L145]$ (line 145, col 1, score 1)
- $[docs/unique/field-dynamics-math-blocks#L145|field-dynamics-math-blocks — L145]$ (line 145, col 3, score 1)
- $[eidolon-field-abstract-model#L191|Eidolon Field Abstract Model — L191]$ (line 191, col 1, score 1)
- $[eidolon-field-abstract-model#L191|Eidolon Field Abstract Model — L191]$ (line 191, col 3, score 1)
- [[eidolonfield#L242|EidolonField — L242]] (line 242, col 1, score 1)
- [[eidolonfield#L242|EidolonField — L242]] (line 242, col 3, score 1)
- $[exception-layer-analysis#L149|Exception Layer Analysis — L149]$ (line 149, col 1, score 1)
- $[exception-layer-analysis#L149|Exception Layer Analysis — L149]$ (line 149, col 3, score 1)
- $[docs/unique/field-dynamics-math-blocks#L144|field-dynamics-math-blocks — L144]$ (line 144, col 1, score 1)
- $[docs/unique/field-dynamics-math-blocks#L144|field-dynamics-math-blocks — L144]$ (line 144, col 3, score 1)
- [DSL — L11]$chunks/dsl.md#L11$ (line 11, col 1, score 1)
- [DSL — L11]$chunks/dsl.md#L11$ (line 11, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L606|compiler-kit-foundations — L606]$ (line 606, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L606|compiler-kit-foundations — L606]$ (line 606, col 3, score 1)
- $[language-agnostic-mirror-system#L534|Language-Agnostic Mirror System — L534]$ (line 534, col 1, score 1)
- $[language-agnostic-mirror-system#L534|Language-Agnostic Mirror System — L534]$ (line 534, col 3, score 1)
- $[lisp-compiler-integration#L537|Lisp-Compiler-Integration — L537]$ (line 537, col 1, score 1)
- $[lisp-compiler-integration#L537|Lisp-Compiler-Integration — L537]$ (line 537, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610]$ (line 610, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L610|compiler-kit-foundations — L610]$ (line 610, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515]$ (line 515, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L515|Interop and Source Maps — L515]$ (line 515, col 3, score 1)
- $[language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532]$ (line 532, col 1, score 1)
- $[language-agnostic-mirror-system#L532|Language-Agnostic Mirror System — L532]$ (line 532, col 3, score 1)
- $lisp-dsl-for-window-management — L220$$lisp-dsl-for-window-management.md#L220$ (line 220, col 1, score 1)
- $lisp-dsl-for-window-management — L220$$lisp-dsl-for-window-management.md#L220$ (line 220, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456]$ (line 456, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L456|ecs-offload-workers — L456]$ (line 456, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390]$ (line 390, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L390|ecs-scheduler-and-prefabs — L390]$ (line 390, col 3, score 1)
- $[docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131]$ (line 131, col 1, score 1)
- $[docs/unique/eidolon-field-math-foundations#L131|eidolon-field-math-foundations — L131]$ (line 131, col 3, score 1)
- $[local-only-llm-workflow#L176|Local-Only-LLM-Workflow — L176]$ (line 176, col 1, score 1)
- $[local-only-llm-workflow#L176|Local-Only-LLM-Workflow — L176]$ (line 176, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409]$ (line 409, col 1, score 0.99)
- $[lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409]$ (line 409, col 3, score 0.99)
- $[docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624]$ (line 624, col 1, score 0.99)
- $[docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624]$ (line 624, col 3, score 0.99)
- $[docs/unique/interop-and-source-maps#L529|Interop and Source Maps — L529]$ (line 529, col 1, score 0.99)
- $[docs/unique/interop-and-source-maps#L529|Interop and Source Maps — L529]$ (line 529, col 3, score 0.99)
- $[lisp-compiler-integration#L558|Lisp-Compiler-Integration — L558]$ (line 558, col 1, score 0.98)
- $[lisp-compiler-integration#L558|Lisp-Compiler-Integration — L558]$ (line 558, col 3, score 0.98)
- $[cross-target-macro-system-in-sibilant#L188|Cross-Target Macro System in Sibilant — L188]$ (line 188, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L188|Cross-Target Macro System in Sibilant — L188]$ (line 188, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L305|Migrate to Provider-Tenant Architecture — L305]$ (line 305, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L305|Migrate to Provider-Tenant Architecture — L305]$ (line 305, col 3, score 1)
- $[dynamic-context-model-for-web-components#L397|Dynamic Context Model for Web Components — L397]$ (line 397, col 1, score 1)
- $[dynamic-context-model-for-web-components#L397|Dynamic Context Model for Web Components — L397]$ (line 397, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
