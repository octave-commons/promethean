---
$$
uuid: 4c951657-755b-4f42-b211-88d7620fd3ae
$$
$$
created_at: 2025.07.30.15.07.94.md
$$
filename: Python Services CI
$$
description: >-
$$
  A GitHub Actions workflow that tests Python services in a matrix of services.
  It checks dependencies and runs tests with pytest.
tags:
  - GitHub
  - Actions
  - Python
  - Services
  - CI
  - Testing
$$
related_to_title:
$$
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
$$
related_to_uuid:
$$
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
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
```
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
<<<<<<< HEAD
- $[promethean-notes]$
## Sources
- $[promethean-notes#^ref-c54611b2-2-0|promethean-notes — L2]$ (line 2, col 0, score 1)
$$
=======
$$
- $[ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]$
- $[ai-first-os-model-context-protocol]$
- $[balanced-bst]$

## Sources
- $[ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406]$ (line 406, col 1, score 1)
- $[ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406]$ (line 406, col 3, score 1)
- $[ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11]$ (line 11, col 1, score 1)
- $[ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11]$ (line 11, col 3, score 1)
- $[ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14]$ (line 14, col 1, score 1)
- $[ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14]$ (line 14, col 3, score 1)
- $[balanced-bst#L297|balanced-bst — L297]$ (line 297, col 1, score 1)
- $[balanced-bst#L297|balanced-bst — L297]$ (line 297, col 3, score 1)
$$
>>>>>>> stealth/obsidian
$$
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
