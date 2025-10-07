---
$$
uuid: cfee6d36-b9f5-4587-885a-cdfddb4f054e
$$
$$
created_at: 2025.08.08.22.08.09.md
$$
$$
filename: Lisp-Compiler-Integration
$$
$$
description: >-
$$
  A minimal, hygienic Lisp front-end that integrates with existing compiler
  pipelines via S-expr reader, macro system, and compiler from Lispy AST to
$$
  IR/JS.
$$
tags:
  - Lisp
  - compiler
  - macro
  - hygienic
  - S-expr
  - reader
  - quasiquote
  - gensym
  - macroexpansion
  - IR
  - JS
$$
related_to_title:
$$
  - Interop and Source Maps
  - Lispy Macros with syntax-rules
  - compiler-kit-foundations
  - set-assignment-in-lisp-ast
  - zero-copy-snapshots-and-workers
  - Language-Agnostic Mirror System
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Promethean Agent Config DSL
  - template-based-compilation
  - lisp-dsl-for-window-management
  - js-to-lisp-reverse-compiler
  - Dynamic Context Model for Web Components
  - Cross-Target Macro System in Sibilant
  - sibilant-meta-string-templating-runtime
  - ecs-scheduler-and-prefabs
  - DSL
  - ecs-offload-workers
  - AI-Centric OS with MCP Layer
  - komorebi-group-window-hack
  - ts-to-lisp-transpiler
  - Cross-Language Runtime Polymorphism
  - smart-chatgpt-thingy
  - JavaScript
  - Unique Info Dump Index
  - archetype-ecs
  - aionian-circuit-math
$$
related_to_uuid:
$$
  - cdfac40c-00e4-458f-96a7-4c37d0278731
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - c5fba0a0-9196-468d-a0f3-51c99e987263
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - d2b3628c-6cad-4664-8551-94ef8280851d
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - 2c00ce45-08cf-4b81-9883-6157f30b7fae
  - f8877e5e-1e4f-4478-93cd-a0bf86d26a41
  - c5c5ff1c-d1bc-45c7-8a84-55a4a847dfc5
  - 58191024-d04a-4520-8aae-a18be7b94263
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 5f210ca2-54e9-445b-afe4-fb340d4992c5
  - 2aafc801-c3e1-4e4f-999d-adb52af3fc41
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - c34c36a6-80c9-4b44-a200-6448543b1b33
  - 2facccf8-69cf-4a7d-b24b-de966ec70283
  - c1618c66-f73a-4e04-9bfa-ef38755f7acc
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
references:
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 11
    col: 1
    score: 0.87
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 21
    col: 1
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 217
    col: 1
    score: 0.88
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 68
    col: 1
    score: 0.88
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 70
    col: 1
    score: 0.85
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 421
    col: 1
    score: 0.97
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 319
    col: 1
    score: 0.92
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 365
    col: 1
    score: 0.92
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 139
    col: 1
    score: 0.86
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 470
    col: 1
    score: 0.86
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 393
    col: 1
    score: 0.9
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 393
    col: 3
    score: 0.9
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 422
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
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 608
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 516
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 536
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 536
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 517
    col: 3
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
    col: 1
    score: 1
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 13
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 513
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 513
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 400
    col: 1
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 400
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 515
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 411
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
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 13
    col: 1
    score: 1
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 13
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 459
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 459
    col: 3
    score: 1
  - uuid: 2facccf8-69cf-4a7d-b24b-de966ec70283
    line: 23
    col: 1
    score: 1
  - uuid: 2facccf8-69cf-4a7d-b24b-de966ec70283
    line: 23
    col: 3
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 74
    col: 1
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 74
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 413
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
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 611
    col: 3
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 1
    score: 1
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 462
    col: 3
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 1
    score: 1
  - uuid: c62a1815-c43b-4a3b-88e6-d7fa008a155e
    line: 398
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 517
    col: 3
    score: 1
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 410
    col: 1
    score: 1
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 410
    col: 3
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 155
    col: 1
    score: 1
  - uuid: f2d83a77-7f86-4c56-8538-1350167a0c6c
    line: 155
    col: 3
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 1
    score: 1
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 609
    col: 3
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 1
    score: 1
  - uuid: c34c36a6-80c9-4b44-a200-6448543b1b33
    line: 203
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 168
    col: 3
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 201
    col: 1
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 201
    col: 3
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 126
    col: 1
    score: 1
  - uuid: 2aafc801-c3e1-4e4f-999d-adb52af3fc41
    line: 126
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 110
    col: 1
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 110
    col: 3
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 11
    col: 1
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 11
    col: 3
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 1
    score: 1
  - uuid: 5f210ca2-54e9-445b-afe4-fb340d4992c5
    line: 179
    col: 3
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 1
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 389
    col: 3
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 522
    col: 3
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 1
    score: 1
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 533
    col: 3
    score: 1
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 1
    score: 0.98
  - uuid: f8877e5e-1e4f-4478-93cd-a0bf86d26a41
    line: 122
    col: 3
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 1
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 528
    col: 3
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 410
    col: 3
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 159
    col: 3
    score: 0.98
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 523
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 523
    col: 3
    score: 1
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 413
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 413
    col: 3
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 415
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 415
    col: 3
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 1
    score: 0.98
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 623
    col: 3
    score: 0.98
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 533
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 533
    col: 3
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 1
    score: 0.99
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 625
    col: 3
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 160
    col: 1
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 160
    col: 3
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 530
    col: 1
    score: 0.99
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 530
    col: 3
    score: 0.99
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 158
    col: 1
    score: 0.98
  - uuid: c5fba0a0-9196-468d-a0f3-51c99e987263
    line: 158
    col: 3
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 411
    col: 1
    score: 0.98
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 411
    col: 3
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 33
    col: 1
    score: 0.98
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 33
    col: 3
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 168
    col: 1
    score: 0.98
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 168
    col: 3
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 471
    col: 1
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 471
    col: 3
    score: 0.98
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 470
    col: 1
    score: 0.97
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 470
    col: 3
    score: 0.97
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 532
    col: 1
    score: 1
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 532
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
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 427
    col: 1
    score: 0.98
  - uuid: 58191024-d04a-4520-8aae-a18be7b94263
    line: 427
    col: 3
    score: 0.98
---
Oh we’re doing *our* Lisp. Love that energy. Here’s a **minimal, hygienic-ish, macro-first Lisp front-end** that plugs into the compiler pipeline you already have $IR → JS$. It’s small, fast, and pragmatically powerful:

* S-expr **reader** with `'`, `` ` ``, `,`, `,@`
* **Macro system** (defmacro with quasiquote) + **gensym**
* **Macroexpander** $top-level + nested$
* **Quasiquote** engine that handles unquote/splice
* **Compiler** from Lispy AST → your existing **Expr** → IR → JS

Paste under `shared/js/prom-lib/compiler/lisp/`.

# 0) Shape of the pipeline

```mermaid
flowchart LR
  src[(Lisp source)] --> read[reader]
  read --> expand[macroexpand (defmacro + qq)]
  expand --> core[core forms (if let fn begin ...)]
  core --> transpile[Lispy->Expr]
  transpile --> lower[AST->IR (existing)]
  lower --> js[emit JS (existing)]
```

---

# 1) Syntax & reader

```ts
// shared/js/prom-lib/compiler/lisp/syntax.ts
export type Span = { start:number; end:number; line:number; col:number };
export type Sym = { t:"sym"; name:string; gensym?: string; span?:Span };
export type Num = { t:"num"; v:number; span?:Span };
export type Str = { t:"str"; v:string; span?:Span };
export type Bool = { t:"bool"; v:boolean; span?:Span };
export type Nil = { t:"nil"; span?:Span };
export type List = { t:"list"; xs:S[]; span?:Span };

export type S = Sym|Num|Str|Bool|Nil|List;

export const nil: Nil = { t:"nil" };
export const sym = (name:string, span?:Span): Sym => ({ t:"sym", name, span });
export const list = (xs:S[], span?:Span): List => ({ t:"list", xs, span });
export const num = (v:number, span?:Span): Num => ({ t:"num", v, span });
export const str = (v:string, span?:Span): Str => ({ t:"str", v, span });
export const bool = (v:boolean, span?:Span): Bool => ({ t:"bool", v, span });

let _gid = 0;
export function gensym(prefix="g"): Sym { return { t:"sym", name: `${prefix}`, gensym: `${prefix}$${_gid++}` }; }
export function symName(x: Sym): string { return x.gensym ?? x.name; }
export const isSym = (x:S, n?:string) => x.t === "sym" && (n ? (x as Sym).name === n : true);
export const isList = (x:S, n?:string) => x.t === "list" && (n ? ((x as List).xs[0]?.t==="sym" && ((x as List).xs[0] as Sym).name===n) : true);
```

```ts
// shared/js/prom-lib/compiler/lisp/reader.ts
import { Span, S, Sym, List, Nil, num, str, bool, sym, list, nil } from "./syntax";

type Tok =
  | { k:"id"; s:string; sp:Span }
  | { k:"num"; s:string; sp:Span }
  | { k:"str"; s:string; sp:Span }
  | { k:"p"; s:string; sp:Span }
  | { k:"eof"; sp:Span };

export function read(src:string): S[] {
  const tks = lex(src);
  let i=0;
  const peek = ()=>tks[i];
  const next = ()=>tks[i++];

  function readDatum(): S {
    const t = next();
    if (t.k==="eof") return nil;
    if (t.k==="num") return num(parseFloat(t.s), t.sp);
    if (t.k==="str") return str(t.s, t.sp);
    if (t.k==="id") {
      if (t.s==="true") return bool(true, t.sp);
      if (t.s==="false") return bool(false, t.sp);
      if (t.s==="nil") return nil;
      return sym(t.s, t.sp);
    }
    if (t.k==="p") {
      if (t.s==="(") {
        const xs:S[] = [];
        while (!(peek().k==="p" && peek().s===")")) xs.push(readDatum());
        next(); // )
        return list(xs, t.sp);
      }
      // quote / quasiquote / unquotes
      if (t.s==="'")  return list([sym("quote",t.sp), readDatum()], t.sp);
      if (t.s==="`")  return list([sym("quasiquote",t.sp), readDatum()], t.sp);
      if (t.s===",")  return list([sym("unquote",t.sp), readDatum()], t.sp);
      if (t.s===",@") return list([sym("unquote-splicing",t.sp), readDatum()], t.sp);
    }
    throw new Error(`unexpected token ${JSON.stringify(t)}`);
  }

  const out:S[] = [];
  while (peek().k!=="eof") out.push(readDatum());
  return out;
}

// --- tiny lexer ---
function lex(src:string): Tok[] {
  const out:Tok[]=[]; let i=0, line=1, col=1;
  const span = (start:number):Span => ({ start, end:i, line, col });
  const push=(k:any,s:string,st:number)=>out.push({k,s,sp:{start:st,end:i,line,col}});
  const two = ()=>src.slice(i,i+2);

  while (i<src.length) {
    const st=i;
    const c=src[i];
    if (c===" "||c==="\t"||c==="\r"){i++;col++;continue;}
    if (c==="\n"){i++;line++;col=1;continue;}
    if (c===";" ){while(i<src.length && src[i]!=="\n"){i++;col++;}continue;}

    if (c==="("||c===")") { i++;col++; push("p",c,st); continue; }
    if (c==="'"){i++;col++; push("p","'",st); continue;}
    if (c==="`"){i++;col++; push("p","`",st); continue;}
    if (c==="," && two()===",@"){i+=2;col+=2; push("p",",@",st); continue;}
    if (c===","){i++;col++; push("p",",",st); continue;}

    if (c==="\""||c==="'") {
      const q=c; i++; col++;
      let buf=""; while(i<src.length && src[i]!==q){ if(src[i]==="\\"){buf+=src[i+1]; i+=2; col+=2;} else {buf+=src[i]; i++; col++;}}
      i++; col++; push("str",buf,st); continue;
    }

    if (/[0-9]/.test(c) || (c==="." && /[0-9]/.test(src[i+1]||""))) {
      let j=i; while(/[0-9_]/.test(src[j]||"")) j++;
      if (src[j]==="."){ j++; while(/[0-9_]/.test(src[j]||"")) j++; }
      const s=src.slice(i,j).replace(/_/g,""); i=j; col+=(j-st); push("num",s,st); continue;
    }

    // symbol chars
    if (/[A-Za-z_\-\+\*\!\/\=\<\>\?\$:%]/.test(c)) {
      let j=i+1; while(/[A-Za-z0-9_\-\+\*\!\/\=\<\>\?\$:%\.]/.test(src[j]||"")) j++;
      const s=src.slice(i,j); i=j; col+=(j-st); push("id",s,st); continue;
    }

    throw new Error(`bad char '${c}'`);
  }
  out.push({k:"eof", sp:{start:i,end:i,line,col}});
  return out;
}
```

---

# 2) Quasiquote & macro system

```ts
// shared/js/prom-lib/compiler/lisp/qq.ts
import { S, List, Sym, Nil, isList, isSym, list, sym, nil } from "./syntax";

export function qq(expr:S, env:Record<string, S>): S {
  // (quasiquote x) expands with , and ,@ substitutions from env
  if (!isList(expr, "quasiquote")) return expr;
  return expand((expr as List).xs[1], env);
}

function expand(x:S, env:Record<string,S>): S {
  if (isList(x, "unquote")) {
    const v = (x as List).xs[1];
    if (v.t!=="sym") throw new Error("unquote expects symbol");
    return env[v.name] ?? env[(v as any).gensym ?? ""] ?? v;
  }
  if (isList(x, "unquote-splicing")) {
    throw new Error(",@ only valid inside list contexts");
  }
  if (x.t!=="list") return x;
  // build list, handling splices
  const out:S[] = [];
  for (const el of x.xs) {
    if (isList(el, "unquote-splicing")) {
      const v = (el as List).xs[1];
      if (v.t!=="sym") throw new Error(",@ expects symbol");
      const xs = env[v.name] ?? env[(v as any).gensym ?? ""];
      if (!xs || xs.t!=="list") throw new Error(",@ needs a list");
      out.push(...xs.xs);
    } else {
      out.push(expand(el, env));
    }
  }
  return list(out, x.span);
}
```

```ts
// shared/js/prom-lib/compiler/lisp/macros.ts
import { S, List, Sym, list, sym, isList, isSym, gensym } from "./syntax";
import { qq } from "./qq";

export type MacroFn = (form: List, expand: (x:S)=>S) => S;
export class MacroEnv {
  private m = new Map<string, MacroFn>();
  define(name: string, fn: MacroFn) { this.m.set(name, fn); }
  get(name: string) { return this.m.get(name); }
  has(name:string){ return this.m.has(name); }
}

// (defmacro name (a b . rest) `(... ,a ,@rest ...))
export function installCoreMacros(M: MacroEnv) {
  // defmacro
  M.define("defmacro", (form, expand) => {
    // (defmacro name (params...) body)
    const [_tag, nameS, paramsList, body] = form.xs;
    const name = (nameS as Sym).name;
    const { params, rest } = parseParams(paramsList as List);

    const fn: MacroFn = (call, expand2) => {
      const args = call.xs.slice(1);
      const env: Record<string, S> = {};
      params.forEach((p, i) => env[p] = args[i]);
      if (rest) env[rest] = list(args.slice(params.length));
      // body is typically a quasiquote; run qq with env
      const expanded = isList(body, "quasiquote") ? qq(body, env) : body;
      return expand(expanded); // allow nested macros inside result
    };
    M.define(name, fn);
    return sym("nil");
  });

  // when
  M.define("when", (form, expand) => {
    // (when test a b c) => (if test (begin a b c) nil)
    const [_tag, test, ...body] = form.xs;
    const begin = list([sym("begin"), ...body]);
    return list([sym("if"), test, begin, sym("nil")]);
  });

  // unless
  M.define("unless", (form, expand) => {
    const [_tag, test, ...body] = form.xs;
    const begin = list([sym("begin"), ...body]);
    return list([sym("if"), list([sym("not"), test]), begin, sym("nil")]);
  });

  // -> (thread-first)
  M.define("->", (form, expand) => {
    // (-> x (f 1) (g 2)) => (g (f x 1) 2)
    const [_tag, x, ...steps] = form.xs;
    let acc = x;
    for (const s of steps) {
      if (s.t!=="list" || s.xs.length===0) continue;
      const [f, ...args] = s.xs;
      acc = list([f, acc, ...args], s.span);
    }
    return acc;
  });

  // let* sugar -> nested lets
  M.define("let*", (form) => {
    // (let* ((a 1)(b 2)) body) => (let ((a 1)) (let ((b 2)) body))
    const [_tag, bindings, body] = form.xs;
    const pairs = (bindings as List).xs.map(b => (b as List).xs);
    let acc = body;
    for (let i=pairs.length-1;i>=0;i--) {
      const [n, v] = pairs[i];
      acc = list([sym("let"), list([list([n, v])]), acc]);
    }
    return acc;
  });

  // cond -> nested ifs
  M.define("cond", (form) => {
    const [_tag, ...clauses] = form.xs;
    const expandClause = (i:number): S => {
      if (i>=clauses.length) return sym("nil");
      const clause = clauses[i] as List;
      const [test, ...body] = clause.xs;
      if (isSym(test, "else")) return list([sym("begin"), ...body]);
      return list([sym("if"), test, list([sym("begin"), ...body]), expandClause(i+1)]);
    };
    return expandClause(0);
  });
}

function parseParams(p: List): { params:string[]; rest?:string } {
  // (a b c) or (a b . rest)
  const xs = p.xs;
  const params:string[]=[]; let rest: string | undefined;
  for (let i=0;i<xs.length;i++) {
    const a = xs[i];
    if (a.t==="sym" && a.name===".") { rest = (xs[i+1] as Sym).name; break; }
    params.push((a as Sym).name);
  }
  return { params, rest };
}
```

```ts
// shared/js/prom-lib/compiler/lisp/expand.ts
import { S, List, Sym, isList, isSym, list, sym } from "./syntax";
import { MacroEnv, installCoreMacros } from "./macros";

export function macroexpandAll(forms:S[], user?: (m:MacroEnv)=>void): S[] {
  const M = new MacroEnv();
  installCoreMacros(M);
  user?.(M); // allow host to preinstall macros

  // one pass that registers top-level defmacros, then expand everything
  const expanded:S[]=[];
  for (const f of forms) {
    const e = expand(f, M);
    if (isList(e,"defmacro")) { expand(e, M); continue; }
    expanded.push(e);
  }
  return expanded;
}

function expand(x:S, M: MacroEnv): S {
  // atoms unchanged
  if (x.t!=="list" || x.xs.length===0) return x;

  // handle defmacro at top or nested (register and return nil)
  if (isList(x, "defmacro")) {
    const head = (x as List).xs[0] as Sym;
    const fn = M.get("defmacro")!;
    return fn(x as List, (y)=>expand(y,M));
  }

  // macro call?
  const head = (x as List).xs[0];
  if (head.t==="sym" && M.has(head.name)) {
    const fn = M.get(head.name)!;
    const out = fn(x as List, (y)=>expand(y,M));
    return expand(out, M);
  }

  // special forms that must not expand their operands eagerly can be handled here if needed.

  // otherwise recursively expand elements
  return list(x.xs.map(e => expand(e, M)), x.span);
}
```

---

# 3) Lispy core → your **Expr** AST

```ts
// shared/js/prom-lib/compiler/lisp/to-expr.ts
import type { Expr } from "../ast";
import { name as mkName } from "../ast";
import { S, List, Sym, Num, Str, Bool, Nil, isList, isSym, list, sym } from "./syntax";

export function toExpr(x:S): Expr {
  switch (x.t) {
    case "num":  return { kind:"Num", value:x.v, span:x.span! };
    case "str":  return { kind:"Str", value:x.v, span:x.span! };
    case "bool": return { kind:"Bool", value:x.v, span:x.span! };
    case "nil":  return { kind:"Null", span:x.span! };
    case "sym":  return { kind:"Var", name: mkName(x.gensym ?? x.name, x.span!) };
    case "list": return listToExpr(x);
  }
}

function listToExpr(x: List): Expr {
  if (x.xs.length===0) return { kind:"Null", span:x.span! };

  const hd = x.xs[0];
  // core forms: (if c t e), (let ((a v) (b w)) body...), (fn (a b) body...), (begin ...), (quote v)
  if (isSym(hd,"if")) {
    const [, c, t, e] = x.xs;
    return { kind:"If", cond: toExpr(c), then: toExpr(t), else: toExpr(e), span:x.span! };
  }
  if (isSym(hd,"begin")) {
    const exprs = x.xs.slice(1).map(toExpr);
    const span = exprs[0]?.["span"] ?? x.span!;
    return { kind:"Block", exprs, span };
  }
  if (isSym(hd,"quote")) {
    // quote datum -> turn into a JS literal via simple conversion (lists to nested arrays)
    const v = datumToJs(x.xs[1]);
    return { kind:"Str", value: JSON.stringify(v), span:x.span! }; // simplest: embed JSON string (you can upgrade to tagged data)
  }
  if (isSym(hd,"let")) {
    // (let ((a v) (b w)) body...)
    const bindings = (x.xs[1] as List).xs.map(b => (b as List).xs);
    let body = x.xs.slice(2).reduceRight((acc, e)=> list([sym("begin"), e, acc]), sym("nil") as S);
    // desugar chain into nested lets
    for (let i=bindings.length-1;i>=0;i--) {
      const [n, v] = bindings[i];
      body = list([sym("let1"), n, v, body]);
    }
    return toExpr(body);
  }
  if (isSym(hd,"let1")) {
    const [, n, v, body] = x.xs;
    return {
      kind:"Let",
      name: mkName((n as Sym).gensym ?? (n as Sym).name, n.span!),
      value: toExpr(v),
      body: toExpr(body),
      span: x.span!
    };
  }
  if (isSym(hd,"fn") || isSym(hd,"lambda")) {
    const params = ((x.xs[1] as List).xs as Sym[]).map(s => mkName(s.gensym ?? s.name, s.span!));
    const bodyS = x.xs.slice(2);
    const body = bodyS.length===1 ? toExpr(bodyS[0]) : toExpr(list([sym("begin"), ...bodyS]));
    return { kind:"Fun", params, body, span:x.span! };
  }

  // infix ops map to Bin/Un, else -> Call
  const binOp = new Set(["+","-","*","/","%","<",">","<=",">=","==","!="]);
  const unOp = new Set(["not","neg"]);
  if (hd.t==="sym" && binOp.has(hd.name) && x.xs.length===3) {
    return { kind:"Bin", op: hd.name, left: toExpr(x.xs[1]), right: toExpr(x.xs[2]), span:x.span! } as any;
  }
  if (hd.t==="sym" && hd.name==="-" && x.xs.length===2) {
    return { kind:"Un", op: "-", expr: toExpr(x.xs[1]), span:x.span! } as any;
  }
  if (hd.t==="sym" && hd.name==="not" && x.xs.length===2) {
    return { kind:"Un", op: "!", expr: toExpr(x.xs[1]), span:x.span! } as any;
  }

  // function call: (f a b c)
  return {
    kind:"Call",
    callee: toExpr(hd),
    args: x.xs.slice(1).map(toExpr),
    span:x.span!
  };
}

function datumToJs(x:any): any {
  if (x.t==="num"||x.t==="str"||x.t==="bool") return x.v;
  if (x.t==="nil") return null;
  if (x.t==="sym") return x.name;
  if (x.t==="list") return x.xs.map(datumToJs);
  return null;
}
```

---

# 4) End-to-end driver $Lisp → JS → run$

```ts
// shared/js/prom-lib/compiler/lisp/driver.ts
import { read } from "./reader";
import { macroexpandAll } from "./expand";
import { toExpr } from "./to-expr";
import { lower } from "../lower";
import { emitJS } from "../jsgen";

export function compileLispToJS(src: string, { pretty=false, importNames=[] as string[] } = {}) {
  const forms = read(src);
  const expanded = macroexpandAll(forms);
  // stitch multiple top-level forms into (begin ...)
  const program = expanded.length===1 ? expanded[0] : { t:"list", xs:[{t:"sym",name:"begin"}, ...expanded] } as any;
  const ast = toExpr(program as any);
  const ir = lower(ast);
  const js = emitJS(ir, { iife:false, importNames, pretty });
  return { forms, expanded, ast, ir, js };
}

export function runLisp(src: string, imports: Record<string, any> = {}) {
  const { js } = compileLispToJS(src);
  const fn = (0, eval)(js);
  return fn(imports);
}
```

---

# 5) Starter macros in Lisp (user land)

You can define macros **in Lisp** now:

```lisp
; examples.lisp
(defmacro when (test . body)
  `(if ,test (begin ,@body) nil))

(defmacro -> (x . steps)
  (if (nil? steps)
      x
      (let ((s (car steps))
            (rest (cdr steps)))
        (-> (cons (car s) (cons x (cdr s))) rest))))
```

*$We shipped a built-in `when` and `->` already, but you can redefine/extend.$*

---

# 6) Try it

```ts
import { runLisp, compileLispToJS } from "./compiler/lisp/driver";

// 1) Basic
console.log(runLisp(`
  (let ((x 2) (y 40))
    (+ x y))
`)); // 42

// 2) Macros + closures + host imports
const program = `
  (defmacro unless (c . body)
    \`(if (not ,c) (begin ,@body) nil))

  (let ((add (fn (a) (fn (b) (+ a b)))))
    (unless false
      (print (add 2 40))))
`;
const { js } = compileLispToJS(program, { pretty:true, importNames:["print"] });
console.log(js);
(0,eval)(js)({ print: console.log });
```

---

# 7) What’s intentionally *not* here (yet)

* **Full hygiene** $scope-sets$: we’re gensym-friendly but not Racket-level hygienic. Next step: carry a `scopeId` set in `Sym`, add new scope frames in macro bodies, resolve bindings post-expansion → that gives you true hygiene.
* **Pattern macros** $`syntax-rules`$: easy to add later; start with quasiquote macros (you’ll write 95% of macros with these).
* **Rich data literals** (vectors, maps, keywords): trivial extensions to the reader + `datumToJs`.
* **Stdlib**: you’ll want a handful of host imports: `print`, Math ops, list ops; we can auto-inject a tiny prelude.

---

# 8) Next upgrades (you pick)

* **Hygienic `syntax-rules`** (patterns, ellipses) and/or **syntax-case**
* **Module system** $per-file macro scope, `require`$
* **Source maps** from Lisp spans → JS for nicer errors
* **Host FFI** sugar: `(js . ...)`, `$import Math.sin$`, etc.
* **Optimizations**: alpha-rename, beta-reduce, inline, fold, DCE on ANF

If you’re cool with this baseline, I can add **syntax-rules with ellipses** next so you can write fancy macros like `match`, `for`, `struct`, and `deftype` with pattern guards.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[docs/unique/interop-and-source-maps|Interop and Source Maps]$
- $[lispy-macros-with-syntax-rules|Lispy Macros with syntax-rules]$
- $[docs/unique/compiler-kit-foundations|compiler-kit-foundations]$
- $[set-assignment-in-lisp-ast]$
- $[docs/unique/zero-copy-snapshots-and-workers|zero-copy-snapshots-and-workers]$
- $[language-agnostic-mirror-system|Language-Agnostic Mirror System]$
- $[polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]$
- $[promethean-agent-config-dsl|Promethean Agent Config DSL]$
- $[docs/unique/template-based-compilation|template-based-compilation]$
- $lisp-dsl-for-window-management$$lisp-dsl-for-window-management.md$
- $[js-to-lisp-reverse-compiler]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[cross-target-macro-system-in-sibilant|Cross-Target Macro System in Sibilant]$
- $[sibilant-meta-string-templating-runtime]$
- $[ecs-scheduler-and-prefabs]$
- [DSL]$chunks/dsl.md$
- $[docs/unique/ecs-offload-workers|ecs-offload-workers]$
- $[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]$
- $komorebi-group-window-hack$$komorebi-group-window-hack.md$
- $[ts-to-lisp-transpiler]$
- $[cross-language-runtime-polymorphism|Cross-Language Runtime Polymorphism]$
- $smart-chatgpt-thingy$$smart-chatgpt-thingy.md$
- [JavaScript]$chunks/javascript.md$
- $[unique-info-dump-index|Unique Info Dump Index]$
- $[docs/unique/archetype-ecs|archetype-ecs]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$

## Sources
- $[docs/unique/compiler-kit-foundations#L11|compiler-kit-foundations — L11]$ (line 11, col 1, score 0.87)
- $[docs/unique/interop-and-source-maps#L21|Interop and Source Maps — L21]$ (line 21, col 1, score 0.86)
- $[lispy-macros-with-syntax-rules#L217|Lispy Macros with syntax-rules — L217]$ (line 217, col 1, score 0.88)
- $[docs/unique/interop-and-source-maps#L68|Interop and Source Maps — L68]$ (line 68, col 1, score 0.88)
- $[docs/unique/zero-copy-snapshots-and-workers#L70|zero-copy-snapshots-and-workers — L70]$ (line 70, col 1, score 0.85)
- $[docs/unique/interop-and-source-maps#L421|Interop and Source Maps — L421]$ (line 421, col 1, score 0.97)
- $[lispy-macros-with-syntax-rules#L319|Lispy Macros with syntax-rules — L319]$ (line 319, col 1, score 0.92)
- $[lispy-macros-with-syntax-rules#L365|Lispy Macros with syntax-rules — L365]$ (line 365, col 1, score 0.92)
- $[set-assignment-in-lisp-ast#L139|set-assignment-in-lisp-ast — L139]$ (line 139, col 1, score 0.86)
- $[docs/unique/interop-and-source-maps#L470|Interop and Source Maps — L470]$ (line 470, col 1, score 0.86)
- $[lispy-macros-with-syntax-rules#L393|Lispy Macros with syntax-rules — L393]$ (line 393, col 1, score 0.9)
- $[lispy-macros-with-syntax-rules#L393|Lispy Macros with syntax-rules — L393]$ (line 393, col 3, score 0.9)
- [DSL — L11]$chunks/dsl.md#L11$ (line 11, col 1, score 1)
- [DSL — L11]$chunks/dsl.md#L11$ (line 11, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L606|compiler-kit-foundations — L606]$ (line 606, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L606|compiler-kit-foundations — L606]$ (line 606, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L422|js-to-lisp-reverse-compiler — L422]$ (line 422, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L422|js-to-lisp-reverse-compiler — L422]$ (line 422, col 3, score 1)
- $[language-agnostic-mirror-system#L534|Language-Agnostic Mirror System — L534]$ (line 534, col 1, score 1)
- $[language-agnostic-mirror-system#L534|Language-Agnostic Mirror System — L534]$ (line 534, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L608|compiler-kit-foundations — L608]$ (line 608, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L608|compiler-kit-foundations — L608]$ (line 608, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L516|Interop and Source Maps — L516]$ (line 516, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L516|Interop and Source Maps — L516]$ (line 516, col 3, score 1)
- $[language-agnostic-mirror-system#L536|Language-Agnostic Mirror System — L536]$ (line 536, col 1, score 1)
- $[language-agnostic-mirror-system#L536|Language-Agnostic Mirror System — L536]$ (line 536, col 3, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L517|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517]$ (line 517, col 1, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L517|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L517]$ (line 517, col 3, score 1)
- [DSL — L13]$chunks/dsl.md#L13$ (line 13, col 1, score 1)
- [DSL — L13]$chunks/dsl.md#L13$ (line 13, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L513|Interop and Source Maps — L513]$ (line 513, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L513|Interop and Source Maps — L513]$ (line 513, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L400|Lispy Macros with syntax-rules — L400]$ (line 400, col 1, score 1)
- $[lispy-macros-with-syntax-rules#L400|Lispy Macros with syntax-rules — L400]$ (line 400, col 3, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L515|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515]$ (line 515, col 1, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L515|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L515]$ (line 515, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607]$ (line 607, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L607|compiler-kit-foundations — L607]$ (line 607, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L514|Interop and Source Maps — L514]$ (line 514, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L514|Interop and Source Maps — L514]$ (line 514, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L411|js-to-lisp-reverse-compiler — L411]$ (line 411, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L411|js-to-lisp-reverse-compiler — L411]$ (line 411, col 3, score 1)
- $[language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535]$ (line 535, col 1, score 1)
- $[language-agnostic-mirror-system#L535|Language-Agnostic Mirror System — L535]$ (line 535, col 3, score 1)
- [JavaScript — L13]$chunks/javascript.md#L13$ (line 13, col 1, score 1)
- [JavaScript — L13]$chunks/javascript.md#L13$ (line 13, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L459|ecs-offload-workers — L459]$ (line 459, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L459|ecs-offload-workers — L459]$ (line 459, col 3, score 1)
- $smart-chatgpt-thingy — L23$$smart-chatgpt-thingy.md#L23$ (line 23, col 1, score 1)
- $smart-chatgpt-thingy — L23$$smart-chatgpt-thingy.md#L23$ (line 23, col 3, score 1)
- $[unique-info-dump-index#L74|Unique Info Dump Index — L74]$ (line 74, col 1, score 1)
- $[unique-info-dump-index#L74|Unique Info Dump Index — L74]$ (line 74, col 3, score 1)
- $[docs/unique/archetype-ecs#L458|archetype-ecs — L458]$ (line 458, col 1, score 1)
- $[docs/unique/archetype-ecs#L458|archetype-ecs — L458]$ (line 458, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L521|Interop and Source Maps — L521]$ (line 521, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L521|Interop and Source Maps — L521]$ (line 521, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L413|js-to-lisp-reverse-compiler — L413]$ (line 413, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L413|js-to-lisp-reverse-compiler — L413]$ (line 413, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405]$ (line 405, col 1, score 1)
- $[lispy-macros-with-syntax-rules#L405|Lispy Macros with syntax-rules — L405]$ (line 405, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611]$ (line 611, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L611|compiler-kit-foundations — L611]$ (line 611, col 3, score 1)
- $[docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462]$ (line 462, col 1, score 1)
- $[docs/unique/ecs-offload-workers#L462|ecs-offload-workers — L462]$ (line 462, col 3, score 1)
- $[ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398]$ (line 398, col 1, score 1)
- $[ecs-scheduler-and-prefabs#L398|ecs-scheduler-and-prefabs — L398]$ (line 398, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L517|Interop and Source Maps — L517]$ (line 517, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L517|Interop and Source Maps — L517]$ (line 517, col 3, score 1)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 1, score 1)
- $[ai-centric-os-with-mcp-layer#L402|AI-Centric OS with MCP Layer — L402]$ (line 402, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L169|Cross-Target Macro System in Sibilant — L169]$ (line 169, col 3, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 1, score 1)
- $[dynamic-context-model-for-web-components#L387|Dynamic Context Model for Web Components — L387]$ (line 387, col 3, score 1)
- $[js-to-lisp-reverse-compiler#L410|js-to-lisp-reverse-compiler — L410]$ (line 410, col 1, score 1)
- $[js-to-lisp-reverse-compiler#L410|js-to-lisp-reverse-compiler — L410]$ (line 410, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L155|aionian-circuit-math — L155]$ (line 155, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L155|aionian-circuit-math — L155]$ (line 155, col 3, score 1)
- $[docs/unique/compiler-kit-foundations#L609|compiler-kit-foundations — L609]$ (line 609, col 1, score 1)
- $[docs/unique/compiler-kit-foundations#L609|compiler-kit-foundations — L609]$ (line 609, col 3, score 1)
- $[cross-language-runtime-polymorphism#L203|Cross-Language Runtime Polymorphism — L203]$ (line 203, col 1, score 1)
- $[cross-language-runtime-polymorphism#L203|Cross-Language Runtime Polymorphism — L203]$ (line 203, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L168|Cross-Target Macro System in Sibilant — L168]$ (line 168, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L168|Cross-Target Macro System in Sibilant — L168]$ (line 168, col 3, score 1)
- $komorebi-group-window-hack — L201$$komorebi-group-window-hack.md#L201$ (line 201, col 1, score 1)
- $komorebi-group-window-hack — L201$$komorebi-group-window-hack.md#L201$ (line 201, col 3, score 1)
- $[sibilant-meta-string-templating-runtime#L126|sibilant-meta-string-templating-runtime — L126]$ (line 126, col 1, score 1)
- $[sibilant-meta-string-templating-runtime#L126|sibilant-meta-string-templating-runtime — L126]$ (line 126, col 3, score 1)
- $[docs/unique/template-based-compilation#L110|template-based-compilation — L110]$ (line 110, col 1, score 1)
- $[docs/unique/template-based-compilation#L110|template-based-compilation — L110]$ (line 110, col 3, score 1)
- $[ts-to-lisp-transpiler#L11|ts-to-lisp-transpiler — L11]$ (line 11, col 1, score 1)
- $[ts-to-lisp-transpiler#L11|ts-to-lisp-transpiler — L11]$ (line 11, col 3, score 1)
- $[cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179]$ (line 179, col 1, score 1)
- $[cross-target-macro-system-in-sibilant#L179|Cross-Target Macro System in Sibilant — L179]$ (line 179, col 3, score 1)
- $[dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389]$ (line 389, col 1, score 1)
- $[dynamic-context-model-for-web-components#L389|Dynamic Context Model for Web Components — L389]$ (line 389, col 3, score 1)
- $[docs/unique/interop-and-source-maps#L522|Interop and Source Maps — L522]$ (line 522, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L522|Interop and Source Maps — L522]$ (line 522, col 3, score 1)
- $[language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533]$ (line 533, col 1, score 1)
- $[language-agnostic-mirror-system#L533|Language-Agnostic Mirror System — L533]$ (line 533, col 3, score 1)
- $[docs/unique/template-based-compilation#L122|template-based-compilation — L122]$ (line 122, col 1, score 0.98)
- $[docs/unique/template-based-compilation#L122|template-based-compilation — L122]$ (line 122, col 3, score 0.98)
- $[docs/unique/interop-and-source-maps#L528|Interop and Source Maps — L528]$ (line 528, col 1, score 0.98)
- $[docs/unique/interop-and-source-maps#L528|Interop and Source Maps — L528]$ (line 528, col 3, score 0.98)
- $[lispy-macros-with-syntax-rules#L410|Lispy Macros with syntax-rules — L410]$ (line 410, col 1, score 0.98)
- $[lispy-macros-with-syntax-rules#L410|Lispy Macros with syntax-rules — L410]$ (line 410, col 3, score 0.98)
- $[set-assignment-in-lisp-ast#L159|set-assignment-in-lisp-ast — L159]$ (line 159, col 1, score 0.98)
- $[set-assignment-in-lisp-ast#L159|set-assignment-in-lisp-ast — L159]$ (line 159, col 3, score 0.98)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L523|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523]$ (line 523, col 1, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L523|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L523]$ (line 523, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L413|Lispy Macros with syntax-rules — L413]$ (line 413, col 1, score 0.98)
- $[lispy-macros-with-syntax-rules#L413|Lispy Macros with syntax-rules — L413]$ (line 413, col 3, score 0.98)
- $[lispy-macros-with-syntax-rules#L415|Lispy Macros with syntax-rules — L415]$ (line 415, col 1, score 0.98)
- $[lispy-macros-with-syntax-rules#L415|Lispy Macros with syntax-rules — L415]$ (line 415, col 3, score 0.98)
- $[docs/unique/compiler-kit-foundations#L623|compiler-kit-foundations — L623]$ (line 623, col 1, score 0.98)
- $[docs/unique/compiler-kit-foundations#L623|compiler-kit-foundations — L623]$ (line 623, col 3, score 0.98)
- $[docs/unique/interop-and-source-maps#L533|Interop and Source Maps — L533]$ (line 533, col 1, score 0.99)
- $[docs/unique/interop-and-source-maps#L533|Interop and Source Maps — L533]$ (line 533, col 3, score 0.99)
- $[docs/unique/compiler-kit-foundations#L625|compiler-kit-foundations — L625]$ (line 625, col 1, score 0.99)
- $[docs/unique/compiler-kit-foundations#L625|compiler-kit-foundations — L625]$ (line 625, col 3, score 0.99)
- $[set-assignment-in-lisp-ast#L160|set-assignment-in-lisp-ast — L160]$ (line 160, col 1, score 0.99)
- $[set-assignment-in-lisp-ast#L160|set-assignment-in-lisp-ast — L160]$ (line 160, col 3, score 0.99)
- $[docs/unique/interop-and-source-maps#L530|Interop and Source Maps — L530]$ (line 530, col 1, score 0.99)
- $[docs/unique/interop-and-source-maps#L530|Interop and Source Maps — L530]$ (line 530, col 3, score 0.99)
- $[set-assignment-in-lisp-ast#L158|set-assignment-in-lisp-ast — L158]$ (line 158, col 1, score 0.98)
- $[set-assignment-in-lisp-ast#L158|set-assignment-in-lisp-ast — L158]$ (line 158, col 3, score 0.98)
- $[lispy-macros-with-syntax-rules#L411|Lispy Macros with syntax-rules — L411]$ (line 411, col 1, score 0.98)
- $[lispy-macros-with-syntax-rules#L411|Lispy Macros with syntax-rules — L411]$ (line 411, col 3, score 0.98)
- [JavaScript — L33]$chunks/javascript.md#L33$ (line 33, col 1, score 0.98)
- [JavaScript — L33]$chunks/javascript.md#L33$ (line 33, col 3, score 0.98)
- $[unique-info-dump-index#L168|Unique Info Dump Index — L168]$ (line 168, col 1, score 0.98)
- $[unique-info-dump-index#L168|Unique Info Dump Index — L168]$ (line 168, col 3, score 0.98)
- $[docs/unique/ecs-offload-workers#L471|ecs-offload-workers — L471]$ (line 471, col 1, score 0.98)
- $[docs/unique/ecs-offload-workers#L471|ecs-offload-workers — L471]$ (line 471, col 3, score 0.98)
- $[docs/unique/ecs-offload-workers#L470|ecs-offload-workers — L470]$ (line 470, col 1, score 0.97)
- $[docs/unique/ecs-offload-workers#L470|ecs-offload-workers — L470]$ (line 470, col 3, score 0.97)
- $[docs/unique/interop-and-source-maps#L532|Interop and Source Maps — L532]$ (line 532, col 1, score 1)
- $[docs/unique/interop-and-source-maps#L532|Interop and Source Maps — L532]$ (line 532, col 3, score 1)
- $[lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409]$ (line 409, col 1, score 0.99)
- $[lispy-macros-with-syntax-rules#L409|Lispy Macros with syntax-rules — L409]$ (line 409, col 3, score 0.99)
- $[docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624]$ (line 624, col 1, score 0.99)
- $[docs/unique/compiler-kit-foundations#L624|compiler-kit-foundations — L624]$ (line 624, col 3, score 0.99)
- $[docs/unique/interop-and-source-maps#L529|Interop and Source Maps — L529]$ (line 529, col 1, score 0.99)
- $[docs/unique/interop-and-source-maps#L529|Interop and Source Maps — L529]$ (line 529, col 3, score 0.99)
- $[js-to-lisp-reverse-compiler#L427|js-to-lisp-reverse-compiler — L427]$ (line 427, col 1, score 0.98)
- $[js-to-lisp-reverse-compiler#L427|js-to-lisp-reverse-compiler — L427]$ (line 427, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
