---
uuid: 1b1338fc-bb4d-41df-828f-e219cc9442eb
created_at: 2025.08.08.23.08.80.md
filename: Canonical Org-Babel Matplotlib Animation Template
description: >-
  A reusable template for creating Matplotlib animations in Org mode with
  Python. Includes setup for inline image display and session management.
  Requires specific parameters like OUTFILE, FRAMES, FPS, and FIGSIZE.
tags:
  - org
  - babel
  - python
  - matplotlib
  - animation
  - template
  - inline
  - session
related_to_title:
  - Matplotlib Animation with Async Execution
  - Prompt_Folder_Bootstrap
  - Chroma Toolkit Consolidation Plan
  - Agent Reflections and Prompt Evolution
  - ecs-scheduler-and-prefabs
  - Promethean Event Bus MVP v0.1
related_to_uuid:
  - 687439f9-ad1e-40a4-8a32-3a1b4ac7c017
  - bd4f0976-0d5b-47f6-a20a-0601d1842dc1
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - bb7f0835-c347-474f-bfad-eabd873b51ad
  - c62a1815-c43b-4a3b-88e6-d7fa008a155e
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
references: []
---
Alright, here’s a **canonical Org-Babel Matplotlib Animation Template** we can both reuse. When you say “use the animation template,” I’ll assume this exact structure unless you tell me otherwise.

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

# How you’ll ask me later

Say something like:

> “Use **anim/v1** to render a breathing smoke interference with 200 frames, 20 fps, 800px width, output `smoke.gif`.”

I’ll drop in your **USER CODE** and set `OUTFILE/FRAMES/FPS/FIGSIZE` appropriately.

# One-time Emacs config (so this always “just works”)

```elisp
;; Make Org use the Python you expect (sessions & non-sessions)
(setq org-babel-python-command "/home/err/.venvs/main/bin/python"
      python-shell-interpreter "/home/err/.venvs/main/bin/python")

;; Enable Python in Babel and show images inline after execution
(with-eval-after-load 'org
  (org-babel-do-load-languages 'org-babel-load-languages '((python . t))))
(setq org-startup-with-inline-images t)
(add-hook 'org-babel-after-execute-hook #'org-display-inline-images)
```

# Optional: a mini debug block you can run first (copy into any note)

```org
#+begin_src python :results output
import sys, importlib.util
mods = ["matplotlib", "PIL", "packaging", "numpy"]
print("python:", sys.executable)
for m in mods:
    print(f"{m}:", importlib.util.find_spec(m) is not None)
#+end_src
```

# Notes / gotchas

* If the interpreter changes, **rename the session** (e.g., `*py-anim-2*`) or `exit()` the old one.
* Keep `:dir ./` and `:file NAME.gif` so links stay local and clickable.
* Emacs shows only the **first frame** inline; click to open the animated view in `image-mode`.

When you’re ready to generate a new animation, just tell me to use **`anim/v1`** and describe the scene. I’ll fill the USER CODE and parameters.

\#org #emacs #orgmode #babel #python #matplotlib #templates<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Matplotlib Animation with Async Execution](matplotlib-animation-with-async-execution.md)
- [Prompt_Folder_Bootstrap](prompt-folder-bootstrap.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
