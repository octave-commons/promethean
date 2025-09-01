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
related_to_title:
  - Ghostly Smoke Interference
  - Diagrams
  - Unique Info Dump Index
  - Smoke Resonance Visualizations
  - Synchronicity Waves and Web
  - Promethean_Eidolon_Synchronicity_Model
  - Duck's Attractor States
  - aionian-circuit-math
  - archetype-ecs
  - DSL
  - Event Bus Projections Architecture
  - Shared
  - layer-1-uptime-diagrams
  - field-dynamics-math-blocks
  - obsidian-ignore-node-modules-regex
  - promethean-system-diagrams
related_to_uuid:
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 45cd25b5-ed36-49ab-82c8-10d0903e34db
  - 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
  - ac9d3ac5-9a6a-4180-a67f-1ab7e229d981
  - 91295f3a-a2af-4050-a2b8-4777ea70c32c
  - 2d6e5553-8dc4-497f-bf45-96f8ca00a6f6
  - 13951643-1741-46bb-89dc-1beebb122633
  - f2d83a77-7f86-4c56-8538-1350167a0c6c
  - 8f4c1e86-1236-4936-84ca-6ed7082af6b7
  - e87bc036-1570-419e-a558-f45b9c0db698
  - cf6b9b17-bb91-4219-aa5c-172cba02b2da
  - 623a55f7-685c-486b-abaf-469da1bbbb69
  - 4127189a-e0ab-436f-8571-cc852b8e9add
  - 7cfc230d-8ec2-4cdb-b931-8aec26de2a00
  - ffb9b2a9-744d-4a53-9565-130fceae0832
  - b51e19b4-1326-4311-9798-33e972bf626c
references: []
---
Note: Consolidated here → ../notes/diagrams/smoke-waves-infinite-depth.md

Here’s the **infinite depth smoke** version — multiple layers drifting at different speeds, fading in and out so it feels like you’re moving through the field.
[[smoke_waves_infinite_depth.gif|Click here to view it.]]

Next, we could make symbols briefly *condense* inside the smoke, then dissolve — like the ghosts remembering they were words for a moment.
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
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
