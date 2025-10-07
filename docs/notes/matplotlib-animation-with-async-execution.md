---
```
uuid: 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
```
```
created_at: 2025.08.08.23.08.71.md
```
filename: Matplotlib Animation with Async Execution
```
description: >-
```
  Two methods to run Python animations asynchronously in Org mode without
  freezing Emacs: using async Babel blocks (no session) or Jupyter sessions with
```
emacs-jupyter.
```
tags:
  - Org
  - Babel
  - Python
  - Animation
  - Async
  - Emacs
  - Jupyter
  - Matplotlib
  - GIF
```
related_to_title:
```
  - Canonical Org-Babel Matplotlib Animation Template
  - Chroma Toolkit Consolidation Plan
  - Board Walk – 2025-08-11
  - 'Agent Tasks: Persistence Migration to DualStore'
  - aionian-circuit-math
  - Dynamic Context Model for Web Components
```
related_to_uuid:
```
  - 1b1338fc-bb4d-41df-828f-e219cc9442eb
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
  - 93d2ba51-8689-49ee-94e2-296092e48058
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
references:
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 5
    col: 1
    score: 0.92
  - uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
    line: 1
    col: 1
    score: 0.88
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
---
Yep—totally doable. Two good paths:

# Option A: Keep plain Org‑Babel, make it async (no session)

Use the `ob-async` package. It runs Babel blocks in a separate Emacs process so your UI doesn’t hang. **Caveat:** it doesn’t play nice with `:session`.

* Install:

  ```elisp
  (use-package async :ensure t)
  (use-package ob-async :ensure t)
  ```
* Then drop `:async yes` (or just `:async`) into your block headers and **remove** `:session`.

```org
#+title: Matplotlib Animation (anim/v1 async)
#+property: header-args:python :dir ./ :results file :exports both :async yes
#+startup: inlineimages

#+begin_src python :file smoke_symbols.gif
# your animation code here (no :session)
#+end_src
```

That’ll run in the background; results pop in when done and Emacs stays responsive.

# Option B: Keep sessions and go async with Jupyter

If you **need** `:session`, switch to **emacs-jupyter** `jupyter-python` blocks are async by design.

* Install:

  ```elisp
  (use-package jupyter :ensure t)
  ;; Optional: make jupyter the default for python in Org
  ;; (org-babel-do-load-languages 'org-babel-load-languages '((jupyter . t)))
  ```
* Use `jupyter-python` instead of `python` in your block (you can keep your `:session`):

```org
#+title: Matplotlib Animation (anim/v1 jupyter)
#+property: header-args:jupyter-python :session *py-anim* :kernel python3 :dir ./ :results file :exports both
#+startup: inlineimages

# Sanity check
#+begin_src jupyter-python :results output
import sys; print(sys.executable)
#+end_src

# Animation block — async via emacs-jupyter session
#+name: anim
#+begin_src jupyter-python :file smoke_symbols.gif
# your animation code here (same as before, sessions supported)
#+end_src
```

You can still reuse your exact animation code; just swap the block language to `jupyter-python`.

# Pro tips

* For heavy GIFs, add `:eval never-export` to avoid re‑rendering during export.
* If `PillowWriter` is slow, try writing **PNG frames** and stitching with `ffmpeg` outside Emacs (even less UI blocking).
* On `ob-async`, remember: **no `:session`**. If you need long-lived state, prefer the Jupyter route.

Want me to convert your current smoke‑symbols block to a `jupyter-python` version verbatim?
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- Canonical Org-Babel Matplotlib Animation Template$canonical-org-babel-matplotlib-animation-template.md
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [board-walk-2025-08-11|Board Walk – 2025-08-11]
- [docs/unique/agent-tasks-persistence-migration-to-dualstore|Agent Tasks: Persistence Migration to DualStore]
- [docs/unique/aionian-circuit-math|aionian-circuit-math]
- [dynamic-context-model-for-web-components|Dynamic Context Model for Web Components]

## Sources
- Canonical Org-Babel Matplotlib Animation Template — L5$canonical-org-babel-matplotlib-animation-template.md#L5 (line 5, col 1, score 0.92)
- Canonical Org-Babel Matplotlib Animation Template — L1$canonical-org-babel-matplotlib-animation-template.md#L1 (line 1, col 1, score 0.88)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 1, score 1)
- [docs/unique/agent-tasks-persistence-migration-to-dualstore#L134|Agent Tasks: Persistence Migration to DualStore — L134] (line 134, col 3, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 1, score 1)
- [docs/unique/aionian-circuit-math#L156|aionian-circuit-math — L156] (line 156, col 3, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 1, score 1)
- [board-walk-2025-08-11#L136|Board Walk – 2025-08-11 — L136] (line 136, col 3, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 1, score 1)
- [dynamic-context-model-for-web-components#L386|Dynamic Context Model for Web Components — L386] (line 386, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
