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
