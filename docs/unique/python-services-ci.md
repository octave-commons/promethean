---
uuid: 4c951657-755b-4f42-b211-88d7620fd3ae
created_at: 2025.07.30.15.07.94.md
filename: Python Services CI
description: >-
  A GitHub Actions workflow that tests Python services in a matrix of services.
  It checks dependencies and runs tests with pytest.
tags:
  - GitHub
  - Actions
  - Python
  - Services
  - CI
  - Testing
related_to_title:
  - Chroma Toolkit Consolidation Plan
  - DSL
  - Window Management
  - komorebi-group-window-hack
  - polyglot-repl-interface-layer
  - sibilant-macro-targets
  - ts-to-lisp-transpiler
  - Unique Info Dump Index
  - Creative Moments
  - Model Selection for Lightweight Conversational Tasks
  - Docops Feature Updates
  - Functional Embedding Pipeline Refactor
  - Pipeline Enhancements
  - Promethean Pipelines
  - The Jar of Echoes
related_to_uuid:
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - e87bc036-1570-419e-a558-f45b9c0db698
  - 9e8ae388-767a-4ea8-9f2e-88801291d947
  - dd89372d-10de-42a9-8c96-6bc13ea36d02
  - 9c79206d-4cb9-4f00-87e0-782dcea37bc7
  - c5c9a5c6-427d-4864-8084-c083cd55faa0
  - ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - 10d98225-12e0-4212-8e15-88b57cf7bee5
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
  - 2792d448-c3b5-4050-93dd-93768529d99c
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - e2135d9f-c69d-47ee-9b17-0b05e98dc748
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 18138627-a348-4fbb-b447-410dfb400564
references: []
---
```yaml
name: Python Services CI

on:
  push:
    paths:
      - 'services/**'
  pull_request:
    paths:
      - 'services/**'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service:
          - stt
          - tts
          # Add more service names here
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r services/${{ matrix.service }}/requirements.txt
      - name: Run tests
        run: |
          cd services/${{ matrix.service }}
          python -m pytest --maxfail=1 --disable-warnings -q
```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [DSL](chunks/dsl.md)
- [Window Management](chunks/window-management.md)
- [komorebi-group-window-hack](komorebi-group-window-hack.md)
- [polyglot-repl-interface-layer](polyglot-repl-interface-layer.md)
- [sibilant-macro-targets](sibilant-macro-targets.md)
- [ts-to-lisp-transpiler](ts-to-lisp-transpiler.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Creative Moments](creative-moments.md)
- [Model Selection for Lightweight Conversational Tasks](model-selection-for-lightweight-conversational-tasks.md)
- [Docops Feature Updates](docops-feature-updates-2.md)
- [Docops Feature Updates](docops-feature-updates.md)
- [Functional Embedding Pipeline Refactor](functional-embedding-pipeline-refactor.md)
- [Pipeline Enhancements](pipeline-enhancements.md)
- [Promethean Pipelines](promethean-pipelines.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
