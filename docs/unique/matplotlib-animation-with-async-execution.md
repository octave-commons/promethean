---
uuid: 6bbc5717-b8a5-4aaf-933d-b0225ad598b4
created_at: matplotlib-animation-with-async-execution.md
filename: matplotlib-animation-with-async-execution
title: matplotlib-animation-with-async-execution
description: >-
  Two methods to create async Matplotlib animations in Org mode: using ob-async
  for non-session blocks or emacs-jupyter for session-based async execution.
  Both approaches avoid UI freezing during animation rendering.
tags:
  - org-mode
  - matplotlib
  - async
  - animation
  - emacs
  - jupyter
  - ob-async
  - emacs-jupyter
related_to_uuid:
  - b46a41c5-8e85-4363-aec9-1aaa42694078
  - 004a0f06-3808-4421-b9e1-41b5b41ebcb8
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - c09d7688-71d6-47fc-bf81-86b6193c84bc
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - 58a50f5a-b073-4c50-8d3f-4284bd5df171
  - b25be760-256e-4a8a-b34d-867281847ccb
  - 260f25bf-c996-4da2-a529-3a292406296f
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 4316c3f9-551f-4872-b5c5-98ae73508535
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 8802d059-6b36-4e56-bb17-6a80a7dba599
  - ee4b3631-a745-485b-aff1-2da806cfadfb
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - e4317155-7fa6-44e8-8aee-b72384581790
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - 8792b6d3-aafd-403f-a410-e8a09ec2f8cf
  - 7a75d992-5267-4557-b464-b6c7d3f88dad
  - 7d584c12-7517-4f30-8378-34ac9fc3a3f8
related_to_title:
  - Org-Babel Matplotlib Animation Template
  - ecs-offload-workers
  - AI-Centric OS with MCP Layer
  - Migrate to Provider-Tenant Architecture
  - chroma-embedding-refactor
  - js-to-lisp-reverse-compiler
  - ripple-propagation-demo
  - Polymorphic Meta-Programming Engine
  - chroma-toolkit-consolidation-plan
  - WebSocket Gateway Implementation
  - Universal Lisp Interface
  - agent-tasks-persistence-migration-to-dualstore
  - Promethean Documentation Pipeline Overview
  - dynamic-context-model-for-web-components
  - TypeScript Patch for Tool Calling Support
  - template-based-compilation
  - aionian-circuit-math
  - field-dynamics-math-blocks
  - promethean-native-config-design
references:
  - uuid: b46a41c5-8e85-4363-aec9-1aaa42694078
    line: 5
    col: 0
    score: 0.9
  - uuid: 004a0f06-3808-4421-b9e1-41b5b41ebcb8
    line: 32
    col: 0
    score: 0.87
  - uuid: a28a39dd-8c17-463c-9050-2ffe9b56e8bc
    line: 128
    col: 0
    score: 0.86
  - uuid: c09d7688-71d6-47fc-bf81-86b6193c84bc
    line: 127
    col: 0
    score: 0.86
  - uuid: bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
    line: 66
    col: 0
    score: 0.86
  - uuid: 004a0f06-3808-4421-b9e1-41b5b41ebcb8
    line: 194
    col: 0
    score: 0.86
---
Yep—totally doable. Two good paths: ^ref-687439f9-1-0

# Option A: Keep plain Org‑Babel, make it async (no session)

Use the `ob-async` package. It runs Babel blocks in a separate Emacs process so your UI doesn’t hang. **Caveat:** it doesn’t play nice with `:session`. ^ref-687439f9-5-0

* Install: ^ref-687439f9-7-0

  ```elisp
  (use-package async :ensure t)
  (use-package ob-async :ensure t)
  ```
^ref-687439f9-9-0 ^ref-687439f9-13-0
* Then drop `:async yes` (or just `:async`) into your block headers and **remove** `:session`.
 ^ref-687439f9-15-0
```org
#+title: Matplotlib Animation (anim/v1 async)
#+property: header-args:python :dir ./ :results file :exports both :async yes
#+startup: inlineimages

#+begin_src python :file smoke_symbols.gif
# your animation code here (no :session)
#+end_src
^ref-687439f9-15-0
``` ^ref-687439f9-25-0
^ref-687439f9-16-0

That’ll run in the background; results pop in when done and Emacs stays responsive.

# Option B: Keep sessions and go async with Jupyter ^ref-687439f9-29-0

If you **need** `:session`, switch to **emacs-jupyter** (`jupyter-python` blocks are async by design). ^ref-687439f9-31-0

* Install: ^ref-687439f9-33-0

  ```elisp
  (use-package jupyter :ensure t)
  ;; Optional: make jupyter the default for python in Org
^ref-687439f9-33-0 ^ref-687439f9-38-0
  ;; (org-babel-do-load-languages 'org-babel-load-languages '((jupyter . t)))
  ``` ^ref-687439f9-41-0
^ref-687439f9-40-0
* Use `jupyter-python` instead of `python` in your block (you can keep your `:session`):
 ^ref-687439f9-44-0
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
^ref-687439f9-40-0
# your animation code here (same as before, sessions supported) ^ref-687439f9-57-0
#+end_src
^ref-687439f9-57-0
^ref-687439f9-44-0
``` ^ref-687439f9-61-0
^ref-687439f9-44-0 ^ref-687439f9-62-0
^ref-687439f9-57-0 ^ref-687439f9-63-0
 ^ref-687439f9-62-0 ^ref-687439f9-63-0
You can still reuse your exact animation code; just swap the block language to `jupyter-python`. ^ref-687439f9-61-0 ^ref-687439f9-63-0 ^ref-687439f9-65-0
 ^ref-687439f9-62-0 ^ref-687439f9-65-0
# Pro tips ^ref-687439f9-63-0 ^ref-687439f9-65-0
 ^ref-687439f9-67-0
* For heavy GIFs, add `:eval never-export` to avoid re‑rendering during export. ^ref-687439f9-65-0 ^ref-687439f9-67-0
* If `PillowWriter` is slow, try writing **PNG frames** and stitching with `ffmpeg` outside Emacs (even less UI blocking).
* On `ob-async`, remember: **no `:session`**. If you need long-lived state, prefer the Jupyter route. ^ref-687439f9-67-0

Want me to convert your current smoke‑symbols block to a `jupyter-python` version verbatim?
onal: make jupyter the default for python in Org
^ref-687439f9-33-0 ^ref-687439f9-38-0
  ;; (org-babel-do-load-languages 'org-babel-load-languages '((jupyter . t)))
  ``` ^ref-687439f9-41-0
^ref-687439f9-40-0
* Use `jupyter-python` instead of `python` in your block (you can keep your `:session`):
 ^ref-687439f9-44-0
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
^ref-687439f9-40-0
# your animation code here (same as before, sessions supported) ^ref-687439f9-57-0
#+end_src
^ref-687439f9-57-0
^ref-687439f9-44-0
``` ^ref-687439f9-61-0
^ref-687439f9-44-0 ^ref-687439f9-62-0
^ref-687439f9-57-0 ^ref-687439f9-63-0
 ^ref-687439f9-62-0 ^ref-687439f9-63-0
You can still reuse your exact animation code; just swap the block language to `jupyter-python`. ^ref-687439f9-61-0 ^ref-687439f9-63-0 ^ref-687439f9-65-0
 ^ref-687439f9-62-0 ^ref-687439f9-65-0
# Pro tips ^ref-687439f9-63-0 ^ref-687439f9-65-0
 ^ref-687439f9-67-0
* For heavy GIFs, add `:eval never-export` to avoid re‑rendering during export. ^ref-687439f9-65-0 ^ref-687439f9-67-0
* If `PillowWriter` is slow, try writing **PNG frames** and stitching with `ffmpeg` outside Emacs (even less UI blocking).
* On `ob-async`, remember: **no `:session`**. If you need long-lived state, prefer the Jupyter route. ^ref-687439f9-67-0

Want me to convert your current smoke‑symbols block to a `jupyter-python` version verbatim?
