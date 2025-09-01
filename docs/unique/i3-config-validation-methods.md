---
uuid: d28090ac-f746-4958-aab5-ed1315382c04
created_at: 2025.08.20.08.08.95.md
filename: i3-config-validation-methods
description: >-
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
related_to_title:
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
related_to_uuid:
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
references: []
---
Good question — you don’t want to risk a bad config soft-locking your session.

There’s no `i3 --check-config` switch (like with `nginx -t`), but i3 actually **does parse and validate configs at startup**. The trick is to point i3 at your config file in a way that doesn’t replace your real session. You’ve got a couple of options:

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
Do you want **just syntax checking** (like `-C` gives you), or do you want to actually **sandbox-run the config** (like with Xephyr) so you can check keybind behavior and window rules too?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [shared-package-layout-clarification](shared-package-layout-clarification.md)
- [Local-Only-LLM-Workflow](local-only-llm-workflow.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Migrate to Provider-Tenant Architecture](migrate-to-provider-tenant-architecture.md)
- [Polyglot S-expr Bridge: Python-JS-Lisp Interop](polyglot-s-expr-bridge-python-js-lisp-interop.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [Dynamic Context Model for Web Components](dynamic-context-model-for-web-components.md)
- [Post-Linguistic Transhuman Design Frameworks](post-linguistic-transhuman-design-frameworks.md)
- [Promethean Infrastructure Setup](promethean-infrastructure-setup.md)
- [Local-First Intention→Code Loop with Free Models](local-first-intention-code-loop-with-free-models.md)
- [Ollama-LLM-Provider-for-Pseudo-Code-Transpiler](ollama-llm-provider-for-pseudo-code-transpiler.md)
- [Performance-Optimized-Polyglot-Bridge](performance-optimized-polyglot-bridge.md)
- [Agent Tasks: Persistence Migration to DualStore](agent-tasks-persistence-migration-to-dualstore.md)
- [Board Walk – 2025-08-11](board-walk-2025-08-11.md)
- [Shared Package Structure](shared-package-structure.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
