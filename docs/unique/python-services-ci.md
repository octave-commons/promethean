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
  - Migrate to Provider-Tenant Architecture
  - Canonical Org-Babel Matplotlib Animation Template
  - eidolon-field-math-foundations
  - Duck's Attractor States
  - Promethean Dev Workflow Update
related_to_uuid:
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 54382370-1931-4a19-a634-46735708a9ea
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 13951643-1741-46bb-89dc-1beebb122633
  - 03a5578f-d689-45db-95e9-11300e5eee6f
references:
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6
    col: 0
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 89
    col: 0
    score: 0.9
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 72
    col: 0
    score: 0.9
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 122
    col: 0
    score: 0.9
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 109
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 137
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 88
    col: 0
    score: 0.89
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 124
    col: 0
    score: 0.89
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 111
    col: 0
    score: 0.88
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
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [Promethean Dev Workflow Update](promethean-dev-workflow-update.md)
## Sources
- [Chroma Toolkit Consolidation Plan — L6](chroma-toolkit-consolidation-plan.md#^ref-5020e892-6-0) (line 6, col 0, score 1)
- [Chroma Toolkit Consolidation Plan — L89](chroma-toolkit-consolidation-plan.md#^ref-5020e892-89-0) (line 89, col 0, score 0.9)
- [Chroma Toolkit Consolidation Plan — L72](chroma-toolkit-consolidation-plan.md#^ref-5020e892-72-0) (line 72, col 0, score 0.9)
- [Chroma Toolkit Consolidation Plan — L122](chroma-toolkit-consolidation-plan.md#^ref-5020e892-122-0) (line 122, col 0, score 0.9)
- [Chroma Toolkit Consolidation Plan — L109](chroma-toolkit-consolidation-plan.md#^ref-5020e892-109-0) (line 109, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L137](chroma-toolkit-consolidation-plan.md#^ref-5020e892-137-0) (line 137, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L88](chroma-toolkit-consolidation-plan.md#^ref-5020e892-88-0) (line 88, col 0, score 0.89)
- [Chroma Toolkit Consolidation Plan — L124](chroma-toolkit-consolidation-plan.md#^ref-5020e892-124-0) (line 124, col 0, score 0.89)
- [Migrate to Provider-Tenant Architecture — L111](migrate-to-provider-tenant-architecture.md#^ref-54382370-111-0) (line 111, col 0, score 0.88)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
