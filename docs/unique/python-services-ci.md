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
related_to_title: []
related_to_uuid: []
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
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
- [pm2-orchestration-patterns](pm2-orchestration-patterns.md)
- [sibilant-meta-string-templating-runtime](sibilant-meta-string-templating-runtime.md)
- [universal-intention-code-fabric](universal-intention-code-fabric.md)
- [Local-Offline-Model-Deployment-Strategy](local-offline-model-deployment-strategy.md)
- [Simple Log Example](simple-log-example.md)
- [Universal Lisp Interface](universal-lisp-interface.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [polymorphic-meta-programming-engine](polymorphic-meta-programming-engine.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
## Sources
- [pm2-orchestration-patterns — L81](pm2-orchestration-patterns.md#^ref-51932e7b-81-0) (line 81, col 0, score 0.67)
- [sibilant-meta-string-templating-runtime — L25](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-25-0) (line 25, col 0, score 0.67)
- [universal-intention-code-fabric — L405](universal-intention-code-fabric.md#^ref-c14edce7-405-0) (line 405, col 0, score 0.64)
- [Local-Offline-Model-Deployment-Strategy — L217](local-offline-model-deployment-strategy.md#^ref-ad7f1ed3-217-0) (line 217, col 0, score 0.64)
- [AI-Centric OS with MCP Layer — L185](ai-centric-os-with-mcp-layer.md#^ref-0f1f8cc1-185-0) (line 185, col 0, score 0.64)
- [Simple Log Example — L1](simple-log-example.md#^ref-0490eee7-1-0) (line 1, col 0, score 0.64)
- [sibilant-meta-string-templating-runtime — L35](sibilant-meta-string-templating-runtime.md#^ref-2aafc801-35-0) (line 35, col 0, score 0.64)
- [Universal Lisp Interface — L178](universal-lisp-interface.md#^ref-b01856b4-178-0) (line 178, col 0, score 0.64)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop — L492](polyglot-s-expr-bridge-python-js-lisp-interop.md#^ref-63a1cc28-492-0) (line 492, col 0, score 0.64)
- [universal-intention-code-fabric — L248](universal-intention-code-fabric.md#^ref-c14edce7-248-0) (line 248, col 0, score 0.64)
- [polymorphic-meta-programming-engine — L86](polymorphic-meta-programming-engine.md#^ref-7bed0b9a-86-0) (line 86, col 0, score 0.64)
- [pm2-orchestration-patterns — L26](pm2-orchestration-patterns.md#^ref-51932e7b-26-0) (line 26, col 0, score 0.64)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.64)
- [Canonical Org-Babel Matplotlib Animation Template — L73](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-73-0) (line 73, col 0, score 0.64)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
