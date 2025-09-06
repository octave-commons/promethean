---
uuid: 04e9b1d2-9945-461c-ac16-737ad18bf554
created_at: i3-config-validation-methods.md
filename: i3 Config Validation Methods
title: i3 Config Validation Methods
description: >-
  Explains how to validate i3 config files without disrupting your current
  session. Provides three methods: using `i3 -C` for syntax checks, running i3
  in a nested X server with Xephyr for sandboxed testing, and inline validation
  for automation scripts.
tags:
  - i3
  - config validation
  - syntax check
  - Xephyr
  - sandbox testing
  - automation
related_to_uuid:
  - 6620e2f2-de6d-45d8-a722-5d26e160b370
  - e9b27b06-f608-4734-ae6c-f03a8b1fcf5f
  - fc21f824-4244-4030-a48e-c4170160ea1d
  - dd00677a-2280-45a7-91af-0728b21af3ad
  - 291c7d91-da8c-486c-9bc0-bd2254536e2d
  - 64a9f9f9-58ee-4996-bdaf-9373845c6b29
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - 1f32c94a-4da4-4266-8ac0-6c282cfb401f
  - 22b989d5-f4aa-4880-8632-709c21830f83
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 5e408692-0e74-400e-a617-84247c7353ad
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - 930054b3-ba95-4acf-bb92-0e3ead25ed0b
  - 62bec6f0-4e13-4f38-aca4-72c84ba02367
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 78eeedf7-75bc-4692-a5a7-bb6857270621
  - ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - 13951643-1741-46bb-89dc-1beebb122633
  - 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
  - cbfe3513-6a4a-4d2e-915d-ddfab583b2de
related_to_title:
  - graph-ds
  - field-node-diagram-visualizations
  - Fnord Tracer Protocol
  - heartbeat-fragment-demo
  - Ice Box Reorganization
  - Layer1SurvivabilityEnvelope
  - komorebi-group-window-hack
  - Docops Feature Updates
  - field-node-diagram-outline
  - field-node-diagram-set
  - Functional Embedding Pipeline Refactor
  - i3-bluetooth-setup
  - Chroma Toolkit Consolidation Plan
  - Agent Reflections and Prompt Evolution
  - ChatGPT Custom Prompts
  - zero-copy-snapshots-and-workers
  - eidolon-field-math-foundations
  - typed-struct-compiler
  - Unique Concepts
  - Unique Info Dump Index
  - Canonical Org-Babel Matplotlib Animation Template
  - Creative Moments
  - Duck's Attractor States
  - State Snapshots API and Transactional Projector
  - Lispy Macros with syntax-rules
references:
  - uuid: bb7f0835-c347-474f-bfad-eabd873b51ad
    line: 618
    col: 0
    score: 1
  - uuid: 930054b3-ba95-4acf-bb92-0e3ead25ed0b
    line: 187
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 999
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 1016
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 175
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 1221
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 1058
    col: 0
    score: 1
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 515
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 251
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 559
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 1033
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
  - uuid: 509e1cd5-367c-4a9d-a61b-cef2e85d42ce
    line: 303
    col: 0
    score: 0.89
  - uuid: aee4718b-9f8b-4635-a0c1-ef61c9bea8f1
    line: 307
    col: 0
    score: 0.87
  - uuid: cdfac40c-00e4-458f-96a7-4c37d0278731
    line: 498
    col: 0
    score: 0.87
  - uuid: cbfe3513-6a4a-4d2e-915d-ddfab583b2de
    line: 376
    col: 0
    score: 0.87
  - uuid: d2b3628c-6cad-4664-8551-94ef8280851d
    line: 504
    col: 0
    score: 0.86
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 590
    col: 0
    score: 0.86
  - uuid: 40e05c14-0db0-44c5-bf0a-2eece2f4c2a4
    line: 50
    col: 0
    score: 0.86
  - uuid: 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
    line: 280
    col: 0
    score: 0.86
  - uuid: af5d2824-faad-476c-a389-e912d9bc672c
    line: 120
    col: 0
    score: 0.86
---
Good question — you don’t want to risk a bad config soft-locking your session. ^ref-d28090ac-1-0

There’s no `i3 --check-config` switch (like with `nginx -t`), but i3 actually **does parse and validate configs at startup**. The trick is to point i3 at your config file in a way that doesn’t replace your real session. You’ve got a couple of options: ^ref-d28090ac-3-0

---

### 1. Use `i3 -C` (check config only)

Run: ^ref-d28090ac-9-0

```bash
i3 -C -c /path/to/your/config
```
^ref-d28090ac-11-0 ^ref-d28090ac-14-0
 ^ref-d28090ac-15-0
* `-C` tells i3 to check the config and exit. ^ref-d28090ac-16-0
* `-c` lets you pass an alternate config path. ^ref-d28090ac-17-0
* If there are errors, they’ll print to stderr. If all’s well, you’ll see nothing or just some info logs.

This is the **safe** way — it doesn’t start a new X session or kill your current one.

---

### 2. Run i3 in a nested X server (sandbox)
 ^ref-d28090ac-25-0
If you want to **see** how the config behaves without replacing your WM:
 ^ref-d28090ac-27-0
```bash
Xephyr -br -ac -noreset -screen 1280x720 :1 &
DISPLAY=:1 i3 -c /home/err/.config/i3/config
^ref-d28090ac-27-0
``` ^ref-d28090ac-32-0
^ref-d28090ac-28-0
 ^ref-d28090ac-33-0 ^ref-d28090ac-34-0
* Starts a fresh X server inside a window (`Xephyr`). ^ref-d28090ac-34-0
* Runs i3 with your config inside that sandbox.
* Lets you test without risking your real session.

---
 ^ref-d28090ac-40-0
### 3. Inline validation for automation ^ref-d28090ac-40-0

If you’re scripting, you can parse logs:

```bash
i3 -C -c /path/to/config 2>&1 | grep ERROR
``` ^ref-d28090ac-46-0

That way you can CI-check your dotfiles before deploying them.
 ^ref-d28090ac-50-0
--- ^ref-d28090ac-50-0

👉 Question for you: ^ref-d28090ac-53-0
Do you want **just syntax checking** (like `-C` gives you), or do you want to actually **sandbox-run the config** (like with Xephyr) so you can check keybind behavior and window rules too?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [graph-ds](graph-ds.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [Ice Box Reorganization](ice-box-reorganization.md)
- [Layer1SurvivabilityEnvelope](layer1survivabilityenvelope.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ChatGPT Custom Prompts](chatgpt-custom-prompts.md)
- [zero-copy-snapshots-and-workers](zero-copy-snapshots-and-workers.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [typed-struct-compiler](typed-struct-compiler.md)
- [Unique Concepts](unique-concepts.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [Creative Moments](creative-moments.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [State Snapshots API and Transactional Projector](state-snapshots-api-and-transactional-projector.md)
- [Lispy Macros with syntax-rules](lispy-macros-with-syntax-rules.md)
## Sources
- [Agent Reflections and Prompt Evolution — L618](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-618-0) (line 618, col 0, score 1)
- [ChatGPT Custom Prompts — L187](chatgpt-custom-prompts.md#^ref-930054b3-187-0) (line 187, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L999](chroma-toolkit-consolidation-plan.md#^ref-5020e892-999-0) (line 999, col 0, score 1)
- [typed-struct-compiler — L1016](typed-struct-compiler.md#^ref-78eeedf7-1016-0) (line 1016, col 0, score 1)
- [Unique Concepts — L175](unique-concepts.md#^ref-ed6f3fc9-175-0) (line 175, col 0, score 1)
- [Unique Info Dump Index — L1221](unique-info-dump-index.md#^ref-30ec3ba6-1221-0) (line 1221, col 0, score 1)
- [zero-copy-snapshots-and-workers — L1058](zero-copy-snapshots-and-workers.md#^ref-62bec6f0-1058-0) (line 1058, col 0, score 1)
- [Canonical Org-Babel Matplotlib Animation Template — L515](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-515-0) (line 515, col 0, score 1)
- [Creative Moments — L251](creative-moments.md#^ref-10d98225-251-0) (line 251, col 0, score 1)
- [Duck's Attractor States — L559](ducks-attractor-states.md#^ref-13951643-559-0) (line 559, col 0, score 1)
- [eidolon-field-math-foundations — L1033](eidolon-field-math-foundations.md#^ref-008f2ac0-1033-0) (line 1033, col 0, score 1)
- [Docops Feature Updates — L226](docops-feature-updates.md#^ref-2792d448-226-0) (line 226, col 0, score 1)
- [field-node-diagram-outline — L705](field-node-diagram-outline.md#^ref-1f32c94a-705-0) (line 705, col 0, score 1)
- [field-node-diagram-set — L719](field-node-diagram-set.md#^ref-22b989d5-719-0) (line 719, col 0, score 1)
- [field-node-diagram-visualizations — L601](field-node-diagram-visualizations.md#^ref-e9b27b06-601-0) (line 601, col 0, score 1)
- [Fnord Tracer Protocol — L1060](fnord-tracer-protocol.md#^ref-fc21f824-1060-0) (line 1060, col 0, score 1)
- [Functional Embedding Pipeline Refactor — L726](functional-embedding-pipeline-refactor.md#^ref-a4a25141-726-0) (line 726, col 0, score 1)
- [graph-ds — L996](graph-ds.md#^ref-6620e2f2-996-0) (line 996, col 0, score 1)
- [heartbeat-fragment-demo — L667](heartbeat-fragment-demo.md#^ref-dd00677a-667-0) (line 667, col 0, score 1)
- [i3-bluetooth-setup — L736](i3-bluetooth-setup.md#^ref-5e408692-736-0) (line 736, col 0, score 1)
- [Ice Box Reorganization — L645](ice-box-reorganization.md#^ref-291c7d91-645-0) (line 645, col 0, score 1)
- [komorebi-group-window-hack — L739](komorebi-group-window-hack.md#^ref-dd89372d-739-0) (line 739, col 0, score 1)
- [Layer1SurvivabilityEnvelope — L816](layer1survivabilityenvelope.md#^ref-64a9f9f9-816-0) (line 816, col 0, score 1)
- [State Snapshots API and Transactional Projector — L303](state-snapshots-api-and-transactional-projector.md#^ref-509e1cd5-303-0) (line 303, col 0, score 0.89)
- [prom-lib-rate-limiters-and-replay-api — L307](prom-lib-rate-limiters-and-replay-api.md#^ref-aee4718b-307-0) (line 307, col 0, score 0.87)
- [Interop and Source Maps — L498](interop-and-source-maps.md#^ref-cdfac40c-498-0) (line 498, col 0, score 0.87)
- [Lispy Macros with syntax-rules — L376](lispy-macros-with-syntax-rules.md#^ref-cbfe3513-376-0) (line 376, col 0, score 0.87)
- [Language-Agnostic Mirror System — L504](language-agnostic-mirror-system.md#^ref-d2b3628c-504-0) (line 504, col 0, score 0.86)
- [compiler-kit-foundations — L590](compiler-kit-foundations.md#^ref-01b21543-590-0) (line 590, col 0, score 0.86)
- [Eidolon-Field-Optimization — L50](eidolon-field-optimization.md#^ref-40e05c14-50-0) (line 50, col 0, score 0.86)
- [Voice Access Layer Design — L280](voice-access-layer-design.md#^ref-543ed9b3-280-0) (line 280, col 0, score 0.86)
- [Sibilant Meta-Prompt DSL — L120](sibilant-meta-prompt-dsl.md#^ref-af5d2824-120-0) (line 120, col 0, score 0.86)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
