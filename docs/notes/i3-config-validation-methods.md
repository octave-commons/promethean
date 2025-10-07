---
$$
uuid: d28090ac-f746-4958-aab5-ed1315382c04
$$
$$
created_at: 2025.08.20.08.08.95.md
$$
$$
filename: i3-config-validation-methods
$$
$$
description: >-
$$
  Explains three safe methods to validate i3 config without disrupting your
  session: using `-C` flag for syntax checks, sandboxing with Xephyr for visual
  testing, and inline validation for automation.
tags:
  - i3
  - config-validation
  - syntax-checking
  - Xephyr
  - sandboxing
  - dotfiles
  - CI
$$
related_to_title:
$$
  - shared-package-layout-clarification
  - Local-Only-LLM-Workflow
  - Chroma Toolkit Consolidation Plan
  - Migrate to Provider-Tenant Architecture
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - aionian-circuit-math
  - Dynamic Context Model for Web Components
  - Post-Linguistic Transhuman Design Frameworks
  - Promethean Infrastructure Setup
  - Local-First Intention→Code Loop with Free Models
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - Performance-Optimized-Polyglot-Bridge
  - 'Agent Tasks: Persistence Migration to DualStore'
  - Board Walk – 2025-08-11
  - Shared Package Structure
$$
related_to_uuid:
$$
  - 36c8882a-badc-4e18-838d-2c54d7038141
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 54382370-1931-4a19-a634-46735708a9ea
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
  - 6bcff92c-4224-453d-9993-1be8d37d47c3
  - 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - f5579967-762d-4cfd-851e-4f71b4cb77a1
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 66a72fc3-4153-41fc-84bd-d6164967a6ff
references:
  - uuid: 36c8882a-badc-4e18-838d-2c54d7038141
    line: 143
    col: 1
    score: 0.91
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 1
    score: 1
  - uuid: 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
    line: 182
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 278
    col: 3
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 1
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 91
    col: 3
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 576
    col: 1
    score: 1
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 576
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 143
    col: 3
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 1
    score: 1
  - uuid: b362e12e-2802-4e41-9a21-6e0c7ad419a2
    line: 167
    col: 3
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 1
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 438
    col: 3
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
    col: 1
    score: 1
  - uuid: 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
    line: 506
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
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 1
    score: 0.99
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 176
    col: 3
    score: 0.99
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 172
    col: 1
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 172
    col: 3
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 173
    col: 1
    score: 0.98
  - uuid: 66a72fc3-4153-41fc-84bd-d6164967a6ff
    line: 173
    col: 3
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 599
    col: 1
    score: 0.98
  - uuid: 6deed6ac-2473-40e0-bee0-ac9ae4c7bff2
    line: 599
    col: 3
    score: 0.98
---
Good question — you don’t want to risk a bad config soft-locking your session.

There’s no `i3 --check-config` switch $like with `nginx -t`$, but i3 actually **does parse and validate configs at startup**. The trick is to point i3 at your config file in a way that doesn’t replace your real session. You’ve got a couple of options:

---

### 1. Use `i3 -C` (check config only)

Run:

```bash
i3 -C -c /path/to/your/config
```

* `-C` tells i3 to check the config and exit.
* `-c` lets you pass an alternate config path.
* If there are errors, they’ll print to stderr. If all’s well, you’ll see nothing or just some info logs.

This is the **safe** way — it doesn’t start a new X session or kill your current one.

---

### 2. Run i3 in a nested X server (sandbox)

If you want to **see** how the config behaves without replacing your WM:

```bash
Xephyr -br -ac -noreset -screen 1280x720 :1 &
DISPLAY=:1 i3 -c /home/err/.config/i3/config
```

* Starts a fresh X server inside a window (`Xephyr`).
* Runs i3 with your config inside that sandbox.
* Lets you test without risking your real session.

---

### 3. Inline validation for automation

If you’re scripting, you can parse logs:

```bash
i3 -C -c /path/to/config 2>&1 | grep ERROR
```

That way you can CI-check your dotfiles before deploying them.

---

👉 Question for you:
Do you want **just syntax checking** $like `-C` gives you$, or do you want to actually **sandbox-run the config** (like with Xephyr) so you can check keybind behavior and window rules too?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- $[shared-package-layout-clarification]$
- $[local-only-llm-workflow]$
- $[chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]$
- $[migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]$
- $[polyglot-s-expr-bridge-python-js-lisp-interop|Polyglot S-expr Bridge: Python-JS-Lisp Interop]$
- $[docs/unique/aionian-circuit-math|aionian-circuit-math]$
- $[dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]$
- $[post-linguistic-transhuman-design-frameworks|Post-Linguistic Transhuman Design Frameworks]$
- $[promethean-infrastructure-setup|Promethean Infrastructure Setup]$
- $Local-First Intention→Code Loop with Free Models$$local-first-intention-code-loop-with-free-models.md$
- $[ollama-llm-provider-for-pseudo-code-transpiler]$
- $[performance-optimized-polyglot-bridge]$
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]$
- $[board-walk-2025-08-11|Board Walk – 2025-08-11]$
- $[shared-package-structure|Shared Package Structure]$

## Sources
- $[shared-package-layout-clarification#L143|shared-package-layout-clarification — L143]$ (line 143, col 1, score 0.91)
- $[local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182]$ (line 182, col 1, score 1)
- $[local-only-llm-workflow#L182|Local-Only-LLM-Workflow — L182]$ (line 182, col 3, score 1)
- $[migrate-to-provider-tenant-architecture#L278|Migrate to Provider-Tenant Architecture — L278]$ (line 278, col 1, score 1)
- $[migrate-to-provider-tenant-architecture#L278|Migrate to Provider-Tenant Architecture — L278]$ (line 278, col 3, score 1)
- $[post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91]$ (line 91, col 1, score 1)
- $[post-linguistic-transhuman-design-frameworks#L91|Post-Linguistic Transhuman Design Frameworks — L91]$ (line 91, col 3, score 1)
- $[promethean-infrastructure-setup#L576|Promethean Infrastructure Setup — L576]$ (line 576, col 1, score 1)
- $[promethean-infrastructure-setup#L576|Promethean Infrastructure Setup — L576]$ (line 576, col 3, score 1)
- $Local-First Intention→Code Loop with Free Models — L143$$local-first-intention-code-loop-with-free-models.md#L143$ (line 143, col 1, score 1)
- $Local-First Intention→Code Loop with Free Models — L143$$local-first-intention-code-loop-with-free-models.md#L143$ (line 143, col 3, score 1)
- $[ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167]$ (line 167, col 1, score 1)
- $[ollama-llm-provider-for-pseudo-code-transpiler#L167|Ollama-LLM-Provider-for-Pseudo-Code-Transpiler — L167]$ (line 167, col 3, score 1)
- $[performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438]$ (line 438, col 1, score 1)
- $[performance-optimized-polyglot-bridge#L438|Performance-Optimized-Polyglot-Bridge — L438]$ (line 438, col 3, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L506|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506]$ (line 506, col 1, score 1)
- $[polyglot-s-expr-bridge-python-js-lisp-interop#L506|Polyglot S-expr Bridge: Python-JS-Lisp Interop — L506]$ (line 506, col 3, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 1, score 1)
- $[docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134]$ (line 134, col 3, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 1, score 1)
- $[docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156]$ (line 156, col 3, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 1, score 1)
- $[board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136]$ (line 136, col 3, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 1, score 1)
- $[dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386]$ (line 386, col 3, score 1)
- $[shared-package-structure#L176|Shared Package Structure — L176]$ (line 176, col 1, score 0.99)
- $[shared-package-structure#L176|Shared Package Structure — L176]$ (line 176, col 3, score 0.99)
- $[shared-package-structure#L172|Shared Package Structure — L172]$ (line 172, col 1, score 0.98)
- $[shared-package-structure#L172|Shared Package Structure — L172]$ (line 172, col 3, score 0.98)
- $[shared-package-structure#L173|Shared Package Structure — L173]$ (line 173, col 1, score 0.98)
- $[shared-package-structure#L173|Shared Package Structure — L173]$ (line 173, col 3, score 0.98)
- $[promethean-infrastructure-setup#L599|Promethean Infrastructure Setup — L599]$ (line 599, col 1, score 0.98)
- $[promethean-infrastructure-setup#L599|Promethean Infrastructure Setup — L599]$ (line 599, col 3, score 0.98)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
