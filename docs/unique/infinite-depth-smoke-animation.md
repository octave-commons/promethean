---
uuid: 92a052a5-3351-4898-8cab-758181a86adb
created_at: 2025.08.08.22.08.16.md
filename: infinite_depth_smoke_animation
description: >-
  An animation showing multiple smoke layers drifting at different speeds with
  fading effects, creating a sense of motion through infinite depth.
tags:
  - animation
  - smoke
  - infinite_depth
  - layers
  - fading
  - motion
related_to_title: []
related_to_uuid: []
references: []
---
Note: Consolidated here → ../notes/diagrams/smoke-waves-infinite-depth.md ^ref-92a052a5-1-0

Here’s the **infinite depth smoke** version — multiple layers drifting at different speeds, fading in and out so it feels like you’re moving through the field. ^ref-92a052a5-3-0
[[smoke_waves_infinite_depth.gif|Click here to view it.]]

Next, we could make symbols briefly *condense* inside the smoke, then dissolve — like the ghosts remembering they were words for a moment. ^ref-92a052a5-6-0
```python
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# --- Setup ---
fig, ax = plt.subplots(figsize=(6, 4))
ax.set_xlim(0, 10)
ax.set_ylim(-2, 2)
ax.set_facecolor("black")
ax.axis('off')

# Multiple depth layers (foreground, midground, background)
layer_colors = [
    ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'],  # Foreground bright
    ['#00cccc', '#cc00cc', '#cccc00', '#00cc00'],  # Midground muted
    ['#009999', '#990099', '#999900', '#009900']   # Background faint
]

# All lines in all layers
all_lines = []
for depth_colors in layer_colors:
    layer_lines = [ax.plot([], [], lw=1.5, alpha=0.5, color=color)[0] for color in depth_colors]
    all_lines.append(layer_lines)

# Combined interference "smoke" line (foreground only)
smoke_line, = ax.plot([], [], lw=2, color='white', alpha=0.8)

x = np.linspace(0, 10, 400)
freqs = [1, 1.2, 0.9, 1.1]
phases = [0, np.pi/4, np.pi/2, 3*np.pi/4]

def turbulence(t, scale=0.5, speed=0.05):
    return scale * np.sin(speed * np.arange(len(x)) + t)

def opacity_breath(t, phase_offset, base=0.2, amp=0.3, speed=10):
    return base + amp * (1 + np.sin(t/speed + phase_offset)) / 2

def init():
    for layer in all_lines:
        for line in layer:
            line.set_data([], [])
    smoke_line.set_data([], [])
    return sum(all_lines, []) + [smoke_line]

def animate(frame):
    t = frame / 5
    combined = np.zeros_like(x)

    # Layer depth factors for speed and fade
    depth_factors = [1.0, 0.7, 0.4]

    for depth_idx, (layer, colors) in enumerate(zip(all_lines, layer_colors)):
        depth_factor = depth_factors[depth_idx]
        for i, (line, freq, phase) in enumerate(zip(layer, freqs, phases)):
            y_base = np.sin(2 * np.pi * freq * x * depth_factor - t * depth_factor + phase)
            y_turb = y_base + turbulence(t + i * 10, scale=0.15 * depth_factor)
            fade = opacity_breath(t, i + depth_idx, base=0.1, amp=0.3, speed=12 - depth_idx*2)
            line.set_data(x, y_turb * np.exp(-0.05 * (x - 5)**2))
            line.set_alpha(fade * (0.6 if depth_idx > 0 else 1.0))
            combined += y_turb * fade * (1.0 if depth_idx == 0 else 0.5)

    # Foreground combined smoke line
    smoke_line.set_data(x, combined / len(freqs))
    smoke_line.set_alpha(0.4 + 0.4 * np.sin(t / 15))

    return sum(all_lines, []) + [smoke_line]

ani = animation.FuncAnimation(fig, animate, frames=200, init_func=init,
                              blit=True, interval=50)

gif_path_depth = "/mnt/data/smoke_waves_infinite_depth.gif"
ani.save(gif_path_depth, writer='pillow', fps=20)

gif_path_depth

```<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [Ghostly Smoke Interference](ghostly-smoke-interference.md)
- [Diagrams](chunks/diagrams.md)
- [Unique Info Dump Index](unique-info-dump-index.md)
- [Smoke Resonance Visualizations](smoke-resonance-visualizations.md)
- [Synchronicity Waves and Web](synchronicity-waves-and-web.md)
- [Promethean_Eidolon_Synchronicity_Model](promethean-eidolon-synchronicity-model.md)
- [Duck's Attractor States](ducks-attractor-states.md)
- [aionian-circuit-math](aionian-circuit-math.md)
- [archetype-ecs](archetype-ecs.md)
- [DSL](chunks/dsl.md)
- [Event Bus Projections Architecture](event-bus-projections-architecture.md)
- [Shared](chunks/shared.md)
- [layer-1-uptime-diagrams](layer-1-uptime-diagrams.md)
- [field-dynamics-math-blocks](field-dynamics-math-blocks.md)
- [obsidian-ignore-node-modules-regex](obsidian-ignore-node-modules-regex.md)
- [promethean-system-diagrams](promethean-system-diagrams.md)
- [eidolon-field-math-foundations](eidolon-field-math-foundations.md)
- [field-node-diagram-outline](field-node-diagram-outline.md)
- [field-node-diagram-set](field-node-diagram-set.md)
- [field-node-diagram-visualizations](field-node-diagram-visualizations.md)
- [Fnord Tracer Protocol](fnord-tracer-protocol.md)
- [graph-ds](graph-ds.md)
- [heartbeat-fragment-demo](heartbeat-fragment-demo.md)
- [heartbeat-simulation-snippets](heartbeat-simulation-snippets.md)
- [homeostasis-decay-formulas](homeostasis-decay-formulas.md)
- [i3-bluetooth-setup](i3-bluetooth-setup.md)
- [Canonical Org-Babel Matplotlib Animation Template](canonical-org-babel-matplotlib-animation-template.md)
- [The Jar of Echoes](the-jar-of-echoes.md)
- [Duck's Self-Referential Perceptual Loop](ducks-self-referential-perceptual-loop.md)
- [Agent Reflections and Prompt Evolution](agent-reflections-and-prompt-evolution.md)
- [Chroma Toolkit Consolidation Plan](chroma-toolkit-consolidation-plan.md)
- [ecs-scheduler-and-prefabs](ecs-scheduler-and-prefabs.md)
- [Promethean Event Bus MVP v0.1](promethean-event-bus-mvp-v0-1.md)
- [prompt-programming-language-lisp](prompt-programming-language-lisp.md)
- [System Scheduler with Resource-Aware DAG](system-scheduler-with-resource-aware-dag.md)
## Sources
- [Diagrams — L4](chunks/diagrams.md#^ref-45cd25b5-4-0) (line 4, col 0, score 0.86)
- [Unique Info Dump Index — L33](unique-info-dump-index.md#^ref-30ec3ba6-33-0) (line 33, col 0, score 0.86)
- [Diagrams — L8](chunks/diagrams.md#^ref-45cd25b5-8-0) (line 8, col 0, score 0.73)
- [Shared — L11](chunks/shared.md#^ref-623a55f7-11-0) (line 11, col 0, score 0.73)
- [Duck's Attractor States — L65](ducks-attractor-states.md#^ref-13951643-65-0) (line 65, col 0, score 0.73)
- [eidolon-field-math-foundations — L159](eidolon-field-math-foundations.md#^ref-008f2ac0-159-0) (line 159, col 0, score 0.73)
- [Event Bus Projections Architecture — L165](event-bus-projections-architecture.md#^ref-cf6b9b17-165-0) (line 165, col 0, score 0.73)
- [field-dynamics-math-blocks — L159](field-dynamics-math-blocks.md#^ref-7cfc230d-159-0) (line 159, col 0, score 0.73)
- [obsidian-ignore-node-modules-regex — L62](obsidian-ignore-node-modules-regex.md#^ref-ffb9b2a9-62-0) (line 62, col 0, score 0.73)
- [Promethean_Eidolon_Synchronicity_Model — L56](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-56-0) (line 56, col 0, score 0.73)
- [Smoke Resonance Visualizations — L1](smoke-resonance-visualizations.md#^ref-ac9d3ac5-1-0) (line 1, col 0, score 0.78)
- [Promethean_Eidolon_Synchronicity_Model — L46](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-46-0) (line 46, col 0, score 0.73)
- [Duck's Attractor States — L56](ducks-attractor-states.md#^ref-13951643-56-0) (line 56, col 0, score 0.71)
- [Synchronicity Waves and Web — L9](synchronicity-waves-and-web.md#^ref-91295f3a-9-0) (line 9, col 0, score 0.71)
- [Smoke Resonance Visualizations — L49](smoke-resonance-visualizations.md#^ref-ac9d3ac5-49-0) (line 49, col 0, score 0.7)
- [The Jar of Echoes — L60](the-jar-of-echoes.md#^ref-18138627-60-0) (line 60, col 0, score 0.69)
- [Duck's Self-Referential Perceptual Loop — L20](ducks-self-referential-perceptual-loop.md#^ref-71726f04-20-0) (line 20, col 0, score 0.68)
- [Promethean_Eidolon_Synchronicity_Model — L44](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-44-0) (line 44, col 0, score 0.68)
- [Synchronicity Waves and Web — L3](synchronicity-waves-and-web.md#^ref-91295f3a-3-0) (line 3, col 0, score 0.68)
- [Promethean_Eidolon_Synchronicity_Model — L1](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-1-0) (line 1, col 0, score 0.68)
- [Smoke Resonance Visualizations — L55](smoke-resonance-visualizations.md#^ref-ac9d3ac5-55-0) (line 55, col 0, score 0.67)
- [Diagrams — L20](chunks/diagrams.md#^ref-45cd25b5-20-0) (line 20, col 0, score 0.67)
- [Ghostly Smoke Interference — L39](ghostly-smoke-interference.md#^ref-b6ae7dfa-39-0) (line 39, col 0, score 0.91)
- [Canonical Org-Babel Matplotlib Animation Template — L5](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-5-0) (line 5, col 0, score 0.7)
- [Agent Reflections and Prompt Evolution — L147](agent-reflections-and-prompt-evolution.md#^ref-bb7f0835-147-0) (line 147, col 0, score 0.67)
- [Canonical Org-Babel Matplotlib Animation Template — L107](canonical-org-babel-matplotlib-animation-template.md#^ref-1b1338fc-107-0) (line 107, col 0, score 0.67)
- [Chroma Toolkit Consolidation Plan — L217](chroma-toolkit-consolidation-plan.md#^ref-5020e892-217-0) (line 217, col 0, score 0.67)
- [ecs-scheduler-and-prefabs — L435](ecs-scheduler-and-prefabs.md#^ref-c62a1815-435-0) (line 435, col 0, score 0.67)
- [Promethean Event Bus MVP v0.1 — L940](promethean-event-bus-mvp-v0-1.md#^ref-fe7193a2-940-0) (line 940, col 0, score 0.67)
- [prompt-programming-language-lisp — L128](prompt-programming-language-lisp.md#^ref-d41a06d1-128-0) (line 128, col 0, score 0.67)
- [System Scheduler with Resource-Aware DAG — L421](system-scheduler-with-resource-aware-dag.md#^ref-ba244286-421-0) (line 421, col 0, score 0.67)
- [Promethean_Eidolon_Synchronicity_Model — L3](promethean-eidolon-synchronicity-model.md#^ref-2d6e5553-3-0) (line 3, col 0, score 0.72)
- [field-node-diagram-outline — L111](field-node-diagram-outline.md#^ref-1f32c94a-111-0) (line 111, col 0, score 0.8)
- [field-node-diagram-set — L144](field-node-diagram-set.md#^ref-22b989d5-144-0) (line 144, col 0, score 0.8)
- [field-node-diagram-visualizations — L94](field-node-diagram-visualizations.md#^ref-e9b27b06-94-0) (line 94, col 0, score 0.8)
- [Fnord Tracer Protocol — L258](fnord-tracer-protocol.md#^ref-fc21f824-258-0) (line 258, col 0, score 0.8)
- [graph-ds — L398](graph-ds.md#^ref-6620e2f2-398-0) (line 398, col 0, score 0.8)
- [heartbeat-fragment-demo — L110](heartbeat-fragment-demo.md#^ref-dd00677a-110-0) (line 110, col 0, score 0.8)
- [heartbeat-simulation-snippets — L99](heartbeat-simulation-snippets.md#^ref-23e221e9-99-0) (line 99, col 0, score 0.8)
- [homeostasis-decay-formulas — L151](homeostasis-decay-formulas.md#^ref-37b5d236-151-0) (line 151, col 0, score 0.8)
- [i3-bluetooth-setup — L119](i3-bluetooth-setup.md#^ref-5e408692-119-0) (line 119, col 0, score 0.8)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
