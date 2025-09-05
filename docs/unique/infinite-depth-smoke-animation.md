---
uuid: bad9e6c7-5317-4ab1-82e0-41e49066403e
created_at: infinite-depth-smoke-animation.md
filename: infinite-depth-smoke-animation
title: infinite-depth-smoke-animation
description: >-
  An infinite-depth smoke animation with multiple layers drifting at different
  speeds, fading in and out to create a fluid motion effect. The animation uses
  layered color gradients and turbulence to simulate smoke movement, with a
  foreground smoke line that pulses and breathes to enhance the visual depth.
tags:
  - infinite-depth
  - smoke-animation
  - layered-turbulence
  - fluid-dynamics
  - visual-effects
  - animation
related_to_uuid:
  - 0904921a-50df-420d-8fd1-c946d25004c3
  - b6ae7dfa-0c53-4eb9-aea8-65072b825bee
  - 315a8cf5-239b-449b-a9eb-7df496a796c6
related_to_title:
  - Ghostly Smoke Interference
  - Smoke Resonance Visualizations
references:
  - uuid: b6ae7dfa-0c53-4eb9-aea8-65072b825bee
    line: 40
    col: 0
    score: 0.91
  - uuid: 0904921a-50df-420d-8fd1-c946d25004c3
    line: 40
    col: 0
    score: 0.91
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

```
line: 10
    col: 0
    score: 1
  - uuid: 30ec3ba6-fbca-4606-ac3e-89b747fbeb7c
    line: 144
    col: 0
    score: 1
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 444
    col: 0
    score: 0.91
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 464
    col: 0
    score: 0.91
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 445
    col: 0
    score: 0.91
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 302
    col: 0
    score: 0.91
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 388
    col: 0
    score: 0.91
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 324
    col: 0
    score: 0.91
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 411
    col: 0
    score: 0.91
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 156
    col: 0
    score: 0.91
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 296
    col: 0
    score: 0.91
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 184
    col: 0
    score: 0.91
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 6765
    col: 0
    score: 0.85
  - uuid: 45cd25b5-ed36-49ab-82c8-10d0903e34db
    line: 147
    col: 0
    score: 0.85
  - uuid: e87bc036-1570-419e-a558-f45b9c0db698
    line: 4017
    col: 0
    score: 0.85
  - uuid: c1618c66-f73a-4e04-9bfa-ef38755f7acc
    line: 4358
    col: 0
    score: 0.85
  - uuid: c6e87433-ec5d-4ded-bb1a-fb8734a3cfd9
    line: 4009
    col: 0
    score: 0.85
  - uuid: f1add613-656e-4bec-b52b-193fd78c4642
    line: 167
    col: 0
    score: 0.85
  - uuid: 75ea4a6a-8270-488d-9d37-799c288e5f70
    line: 139
    col: 0
    score: 0.85
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 3304
    col: 0
    score: 0.85
  - uuid: 6cb4943e-8267-4e27-8618-2ce0a464d173
    line: 160
    col: 0
    score: 0.85
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

```
