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
  - 688ad325-4243-4304-bccc-1a1d8745de08
  - 681a4ab2-8fef-4833-a09d-bceb62d114da
  - 03a5578f-d689-45db-95e9-11300e5eee6f
  - 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
  - 18138627-a348-4fbb-b447-410dfb400564
  - ae24a280-678e-4c0b-8cc4-56667fa04172
  - 13951643-1741-46bb-89dc-1beebb122633
  - 8b8e6103-30a4-4d66-b5f2-87db1612b587
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 479401ac-f614-4d0b-8cc6-2ebb8d9de4d9
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 01b21543-7e03-4129-8fe4-b6306be69dee
  - 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
  - d527c05d-22e8-4493-8f29-ae3cb67f035b
  - b362e12e-2802-4e41-9a21-6e0c7ad419a2
  - d41a06d1-613e-4440-80b7-4553fc694285
  - c14edce7-0656-45b2-aaf3-51f042451b7d
  - 23e221e9-d4fa-4106-8458-06db2595085f
  - 63a1cc28-b85c-4ce2-b754-01c2bc0c0bc3
  - a4a25141-6380-40b9-9cd7-b554b246b303
  - 7b7ca860-780c-44fa-8d3f-be8bd9496fba
  - 9a8ab57e-507c-4c6b-aab4-01cea1bc0501
  - 4330e8f0-5f46-4235-918b-39b6b93fa561
  - f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
related_to_title:
  - template-based-compilation
  - SentenceProcessing
  - Promethean Dev Workflow Update
  - eidolon-field-math-foundations
  - The Jar of Echoes
  - Promethean-Copilot-Intent-Engine
  - Duck's Attractor States
  - Promethean Pipelines
  - Local-First Intention→Code Loop with Free Models
  - Local-Offline-Model-Deployment-Strategy
  - compiler-kit-foundations
  - Event Bus MVP
  - ecs-offload-workers
  - Pure-Node Crawl Stack with Playwright and Crawlee
  - Ollama-LLM-Provider-for-Pseudo-Code-Transpiler
  - prompt-programming-language-lisp
  - universal-intention-code-fabric
  - heartbeat-simulation-snippets
  - 'Polyglot S-expr Bridge: Python-JS-Lisp Interop'
  - Functional Embedding Pipeline Refactor
  - TypeScript Patch for Tool Calling Support
  - Local-Only-LLM-Workflow
  - Stateful Partitions and Rebalancing
  - Dynamic Context Model for Web Components
references:
  - uuid: 681a4ab2-8fef-4833-a09d-bceb62d114da
    line: 30
    col: 0
    score: 1
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 1
    col: 0
    score: 1
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 3
    col: 0
    score: 1
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 5
    col: 0
    score: 1
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 7
    col: 0
    score: 1
  - uuid: 688ad325-4243-4304-bccc-1a1d8745de08
    line: 13
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 19229
    col: 0
    score: 0.91
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 20713
    col: 0
    score: 0.91
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17481
    col: 0
    score: 0.91
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 12868
    col: 0
    score: 0.91
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 2873
    col: 0
    score: 0.91
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 2297
    col: 0
    score: 0.91
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 17122
    col: 0
    score: 0.91
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 16438
    col: 0
    score: 0.91
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 17896
    col: 0
    score: 0.91
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 105
    col: 0
    score: 0.9
  - uuid: ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
    line: 232
    col: 0
    score: 0.88
  - uuid: 01b21543-7e03-4129-8fe4-b6306be69dee
    line: 588
    col: 0
    score: 0.86
  - uuid: 479401ac-f614-4d0b-8cc6-2ebb8d9de4d9
    line: 1
    col: 0
    score: 0.86
  - uuid: 6498b9d7-bd35-4bd3-89fb-af1c415c3cd1
    line: 427
    col: 0
    score: 0.85
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 527
    col: 0
    score: 0.85
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
