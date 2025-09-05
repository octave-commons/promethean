---
uuid: b46a41c5-8e85-4363-aec9-1aaa42694078
created_at: canonical-org-babel-matplotlib-animation-template.md
filename: Org-Babel Matplotlib Animation Template
title: Org-Babel Matplotlib Animation Template
description: >-
  A reusable Org-Babel template for generating Matplotlib animations with
  customizable parameters like frames, FPS, and output file. Includes inline
  image display and a sanity check for Python environment compatibility.
tags:
  - orgmode
  - matplotlib
  - animation
  - python
  - template
  - babel
  - inline-images
  - gif
related_to_uuid:
  - 5becb573-0a78-486b-8d3c-199b3c7a79ec
  - 5b8c984e-cff5-4d59-b904-4c7c558a4030
  - a28a39dd-8c17-463c-9050-2ffe9b56e8bc
  - 792a343e-674c-4bb4-8435-b3f8c163349d
  - 01723341-5fbf-4118-8885-9ed0a94fca04
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - cdb74242-b61d-4b7e-9288-5859e040e512
  - c0e6ea38-a9a0-4379-aa9c-b634a6591a59
  - bb4f4ed0-91f3-488a-9d64-3a33bde77e4e
  - eb21f139-3125-4969-bc81-06a30887fc3a
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - abe9ec8d-5a0f-42c5-b2ab-a2080c86d70c
related_to_title:
  - Agent Reflections and Prompt Evolution
  - lisp-dsl-window-management
  - AI-Centric OS with MCP Layer
  - windows-tiling-with-autohotkey
  - Fnord Tracer Protocol
  - polyglot-repl-interface-layer
  - Event Bus Projections Architecture
  - board-walk-2025-08-11
  - chroma-embedding-refactor
  - Post-Linguistic Transhuman Design Frameworks
  - Universal Lisp Interface
  - RAG UI Panel with Qdrant and PostgREST
references: []
---
Alright, here’s a **canonical Org-Babel Matplotlib Animation Template** we can both reuse. When you say “use the animation template,” I’ll assume this exact structure unless you tell me otherwise. ^ref-1b1338fc-1-0

# Canonical Template (Template ID: `anim/v1`)

```org
#+title: Matplotlib Animation (anim/v1)
#+property: header-args:python :session *py-anim* :python /home/err/.venvs/main/bin/python :dir ./ :results file :exports both
#+startup: inlineimages

# Optional sanity check — which Python is running?
#+begin_src python :results output
import sys, importlib.util
print("python:", sys.executable)
print("packaging:", importlib.util.find_spec("packaging") is not None)
#+end_src

# Animation block — I will fill in the body for specific animations.
# Required variables: OUTFILE, FRAMES, FPS, FIGSIZE
#+name: anim
#+begin_src python :file anim.gif
# --- config ---
OUTFILE = "anim.gif"   # change per animation
FRAMES  = 60           # e.g., 60
FPS     = 20           # e.g., 20
FIGSIZE = (6, 4)       # e.g., (6,4)

# --- setup ---
import matplotlib
matplotlib.use("Agg")
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter

fig, ax = plt.subplots(figsize=FIGSIZE)

# --- USER CODE START (I will customize below this line per request) ---
x = np.linspace(0, 10, 400)
(line,) = ax.plot(x, np.sin(x))
ax.set_xlim(0, 10); ax.set_ylim(-1.2, 1.2)
ax.set_facecolor("black"); ax.axis("off")

def init():
    line.set_data([], [])
    return (line,)

def update(i):
    t = i / 5
    line.set_ydata(np.sin(x - t))
    return (line,)
# --- USER CODE END ---

ani = FuncAnimation(fig, update, init_func=init, frames=FRAMES, interval=50, blit=True)
ani.save(OUTFILE, writer=PillowWriter(fps=FPS))
plt.close(fig)
OUTFILE
#+end_src

# Display (inline + clickable)
#+attr_org: :width 800
[[file:anim.gif]]
```
^ref-1b1338fc-5-0

# How you’ll ask me later
 ^ref-1b1338fc-65-0
Say something like:
 ^ref-1b1338fc-67-0
> “Use **anim/v1** to render a breathing smoke interference with 200 frames, 20 fps, 800px width, output `smoke.gif`.”
 ^ref-1b1338fc-69-0
I’ll drop in your **USER CODE** and set `OUTFILE/FRAMES/FPS/FIGSIZE` appropriately.

# One-time Emacs config (so this always “just works”)
 ^ref-1b1338fc-73-0
```elisp
;; Make Org use the Python you expect (sessions & non-sessions)
(setq org-babel-python-command "/home/err/.venvs/main/bin/python"
      python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; Enable Python in Babel and show images inline after execution
(with-eval-after-load 'org
  (org-babel-do-load-languages 'org-babel-load-languages '((python . t))))
(setq org-startup-with-inline-images t)
(add-hook 'org-babel-after-execute-hook #'org-display-inline-images)
^ref-1b1338fc-73-0
```

# Optional: a mini debug block you can run first (copy into any note) ^ref-1b1338fc-87-0

```org
#+begin_src python :results output
import sys, importlib.util
mods = ["matplotlib", "PIL", "packaging", "numpy"]
print("python:", sys.executable)
for m in mods:
    print(f"{m}:", importlib.util.find_spec(m) is not None)
^ref-1b1338fc-87-0
#+end_src
```

# Notes / gotchas ^ref-1b1338fc-100-0
 ^ref-1b1338fc-101-0
* If the interpreter changes, **rename the session** (e.g., `*py-anim-2*`) or `exit()` the old one.
* Keep `:dir ./` and `:file NAME.gif` so links stay local and clickable. ^ref-1b1338fc-103-0
* Emacs shows only the **first frame** inline; click to open the animated view in `image-mode`.
 ^ref-1b1338fc-105-0
When you’re ready to generate a new animation, just tell me to use **`anim/v1`** and describe the scene. I’ll fill the USER CODE and parameters.
 ^ref-1b1338fc-107-0
\#org #emacs #orgmode #babel #python #matplotlib #templates
8-4fbb-b447-410dfb400564
    line: 139
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 104
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 45
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 411
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 566
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 10
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 144
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 594
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 578
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 616
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 571
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 385
    col: 0
    score: 1
  - uuid: 22b989d5-f4aa-4880-8632-709c21830f83
    line: 176
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 195
    col: 0
    score: 1
  - uuid: 64a9f9f9-58ee-4996-bdaf-9373845c6b29
    line: 198
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 65
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1028
    col: 0
    score: 1
  - uuid: 9c79206d-4cb9-4f00-87e0-782dcea37bc7
    line: 208
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 127
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 566
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 602
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 641
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 656
    col: 0
    score: 1
  - uuid: 0580dcd3-533d-4834-8a2f-eae3771960a9
    line: 287
    col: 0
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 302
    col: 0
    score: 1
  - uuid: ac60a1d6-fd9f-46dc-bbe7-176dd8017c59
    line: 15
    col: 0
    score: 1
  - uuid: 7aa1eb92-7f9a-485b-8218-9b553aa9eefc
    line: 137
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 593
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 561
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 607
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 548
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 50
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 28
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 232
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 29
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 590
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 574
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 604
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 13
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 131
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 107
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 38
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 407
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 538
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 11
    col: 0
    score: 1
  - uuid: 5e8b2388-022b-46cf-952c-36ae9b8f0037
    line: 224
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 582
    col: 0
    score: 1
  - uuid: 4330e8f0-5f46-4235-918b-39b6b93fa561
    line: 620
    col: 0
    score: 1
  - uuid: c26f0044-26fe-4c43-8ab0-fc4690723e3c
    line: 11
    col: 0
    score: 1
  - uuid: 18138627-a348-4fbb-b447-410dfb400564
    line: 130
    col: 0
    score: 1
  - uuid: c3cd4f65-2bb3-4fca-a32e-2ac667e03f40
    line: 106
    col: 0
    score: 1
  - uuid: ba11486b-b0b0-4d9d-a0d1-1d91ae34de55
    line: 44
    col: 0
    score: 1
  - uuid: 78eeedf7-75bc-4692-a5a7-bb6857270621
    line: 409
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 554
    col: 0
    score: 1
  - uuid: ed6f3fc9-5eb1-482c-8b3c-f0abc5aff2a2
    line: 9
    col: 0
    score: 1
  - uuid: 9413237f-2537-4bbf-8768-db6180970e36
    line: 22
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 176
    col: 0
    score: 1
  - uuid: c0392040-16a2-41e8-bd54-75110319e3c0
    line: 50
    col: 0
    score: 1
  - uuid: 0b872af2-4197-46f3-b631-afb4e6135585
    line: 49
    col: 0
    score: 1
  - uuid: 1c4046b5-742d-4004-aec6-b47251fef5d6
    line: 52
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 122
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 63
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 136
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 61
    col: 0
    score: 1
  - uuid: f5579967-762d-4cfd-851e-4f71b4cb77a1
    line: 483
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 11
    col: 0
    score: 1
  - uuid: b22d79c6-825b-4cd3-b0d3-1cef0532bb54
    line: 1026
    col: 0
    score: 1
---
Alright, here’s a **canonical Org-Babel Matplotlib Animation Template** we can both reuse. When you say “use the animation template,” I’ll assume this exact structure unless you tell me otherwise. ^ref-1b1338fc-1-0

# Canonical Template (Template ID: `anim/v1`)

```org
#+title: Matplotlib Animation (anim/v1)
#+property: header-args:python :session *py-anim* :python /home/err/.venvs/main/bin/python :dir ./ :results file :exports both
#+startup: inlineimages

# Optional sanity check — which Python is running?
#+begin_src python :results output
import sys, importlib.util
print("python:", sys.executable)
print("packaging:", importlib.util.find_spec("packaging") is not None)
#+end_src

# Animation block — I will fill in the body for specific animations.
# Required variables: OUTFILE, FRAMES, FPS, FIGSIZE
#+name: anim
#+begin_src python :file anim.gif
# --- config ---
OUTFILE = "anim.gif"   # change per animation
FRAMES  = 60           # e.g., 60
FPS     = 20           # e.g., 20
FIGSIZE = (6, 4)       # e.g., (6,4)

# --- setup ---
import matplotlib
matplotlib.use("Agg")
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation, PillowWriter

fig, ax = plt.subplots(figsize=FIGSIZE)

# --- USER CODE START (I will customize below this line per request) ---
x = np.linspace(0, 10, 400)
(line,) = ax.plot(x, np.sin(x))
ax.set_xlim(0, 10); ax.set_ylim(-1.2, 1.2)
ax.set_facecolor("black"); ax.axis("off")

def init():
    line.set_data([], [])
    return (line,)

def update(i):
    t = i / 5
    line.set_ydata(np.sin(x - t))
    return (line,)
# --- USER CODE END ---

ani = FuncAnimation(fig, update, init_func=init, frames=FRAMES, interval=50, blit=True)
ani.save(OUTFILE, writer=PillowWriter(fps=FPS))
plt.close(fig)
OUTFILE
#+end_src

# Display (inline + clickable)
#+attr_org: :width 800
[[file:anim.gif]]
```
^ref-1b1338fc-5-0

# How you’ll ask me later
 ^ref-1b1338fc-65-0
Say something like:
 ^ref-1b1338fc-67-0
> “Use **anim/v1** to render a breathing smoke interference with 200 frames, 20 fps, 800px width, output `smoke.gif`.”
 ^ref-1b1338fc-69-0
I’ll drop in your **USER CODE** and set `OUTFILE/FRAMES/FPS/FIGSIZE` appropriately.

# One-time Emacs config (so this always “just works”)
 ^ref-1b1338fc-73-0
```elisp
;; Make Org use the Python you expect (sessions & non-sessions)
(setq org-babel-python-command "/home/err/.venvs/main/bin/python"
      python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; Enable Python in Babel and show images inline after execution
(with-eval-after-load 'org
  (org-babel-do-load-languages 'org-babel-load-languages '((python . t))))
(setq org-startup-with-inline-images t)
(add-hook 'org-babel-after-execute-hook #'org-display-inline-images)
^ref-1b1338fc-73-0
```

# Optional: a mini debug block you can run first (copy into any note) ^ref-1b1338fc-87-0

```org
#+begin_src python :results output
import sys, importlib.util
mods = ["matplotlib", "PIL", "packaging", "numpy"]
print("python:", sys.executable)
for m in mods:
    print(f"{m}:", importlib.util.find_spec(m) is not None)
^ref-1b1338fc-87-0
#+end_src
```

# Notes / gotchas ^ref-1b1338fc-100-0
 ^ref-1b1338fc-101-0
* If the interpreter changes, **rename the session** (e.g., `*py-anim-2*`) or `exit()` the old one.
* Keep `:dir ./` and `:file NAME.gif` so links stay local and clickable. ^ref-1b1338fc-103-0
* Emacs shows only the **first frame** inline; click to open the animated view in `image-mode`.
 ^ref-1b1338fc-105-0
When you’re ready to generate a new animation, just tell me to use **`anim/v1`** and describe the scene. I’ll fill the USER CODE and parameters.
 ^ref-1b1338fc-107-0
\#org #emacs #orgmode #babel #python #matplotlib #templates
