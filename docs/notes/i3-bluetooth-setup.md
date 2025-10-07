---
```
uuid: 5e408692-0e74-400e-a617-84247c7353ad
```
```
created_at: 2025.08.20.08.08.34.md
```
```
filename: i3-bluetooth-setup
```
```
description: >-
```
  Step-by-step guide to configuring Bluetooth on Ubuntu/Debian with i3 window
  manager, covering terminal and GUI methods for pairing, audio profiles, and i3
  shortcuts.
tags:
  - i3
  - bluetooth
  - ubuntu
  - debian
  - pulseaudio
  - pipewire
  - blueman
  - pairing
  - audio-profiles
  - rfkill
```
related_to_title:
```
  - Local-Offline-Model-Deployment-Strategy
  - Voice Access Layer Design
  - Model Selection for Lightweight Conversational Tasks
  - Promethean Event Bus MVP v0.1
  - Migrate to Provider-Tenant Architecture
  - Local-First Intention→Code Loop with Free Models
  - Event Bus MVP
  - Chroma Toolkit Consolidation Plan
  - polymorphic-meta-programming-engine
  - Prometheus Observability Stack
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
```
related_to_uuid:
```
  - ad7f1ed3-c9bf-4e85-9eeb-6cc4b53155f3
  - 543ed9b3-b7af-4ce1-b455-f7ba71a0bbc8
  - d144aa62-348c-4e5d-ae8f-38084c67ceca
  - fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
  - 54382370-1931-4a19-a634-46735708a9ea
  - 871490c7-a050-429b-88b2-55dfeaa1f8d5
  - 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
  - 5020e892-8f18-443a-b707-6d0f3efcfe22
  - 7bed0b9a-8b22-4b1f-be81-054a179453cb
  - e90b5a16-d58f-424d-bd36-70e9bd2861ad
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references:
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 508
    col: 1
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 508
    col: 3
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 1
    score: 1
  - uuid: 534fe91d-e87d-4cc7-b0e7-8b6833353d9b
    line: 552
    col: 3
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 1
    score: 1
  - uuid: 871490c7-a050-429b-88b2-55dfeaa1f8d5
    line: 144
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 273
    col: 3
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 1
    score: 1
  - uuid: fe7193a2-a5f7-4b3c-bea0-bd028815fc2c
    line: 893
    col: 3
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 174
    col: 1
    score: 1
  - uuid: 5020e892-8f18-443a-b707-6d0f3efcfe22
    line: 174
    col: 3
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 282
    col: 1
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 282
    col: 3
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 1
    score: 1
  - uuid: 7bed0b9a-8b22-4b1f-be81-054a179453cb
    line: 206
    col: 3
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 1
    score: 1
  - uuid: 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
    line: 406
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 11
    col: 3
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 1
    score: 1
  - uuid: 618198f4-cfad-4677-9df6-0640d8a97bae
    line: 14
    col: 3
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 1
    score: 1
  - uuid: d3e7db72-2e07-4dae-8920-0e07c499a1e5
    line: 297
    col: 3
    score: 1
---
Alright, so with i3 there isn’t a “desktop environment daemon” to hold your hand — you’ve got to set up Bluetooth the *right* way. Let me break it down:

---

## 1. Make sure the base Bluetooth stack is installed
```
On Ubuntu/Debian:
```
```bash
sudo apt install bluez blueman pulseaudio-module-bluetooth
```

* `bluez` → the Linux Bluetooth stack.
* `blueman` → GTK manager for pairing (nice tray app, works well with i3).
* `pulseaudio-module-bluetooth` or `pipewire-pulse` if you’re on PipeWire → lets audio devices work.

---

## 2. Enable the Bluetooth service

Check the systemd service:

```bash
systemctl status bluetooth
```

If it’s not running:

```bash
sudo systemctl enable --now bluetooth
```

---

## 3. Pick how you want to interact

You’ve got choices here:

* **Terminal only (bare metal):**

  ```bash
  bluetoothctl
  ```

  Inside:

  ```
  power on
  agent on
  default-agent
  scan on
  pair <MAC>
  connect <MAC>
  trust <MAC>
  ```

* **With GUI helper (nicer in i3):**
  Launch `blueman-applet` in the background — it gives you a systray icon.
  Add this line to your `~/.config/i3/config`:

  ```
  exec --no-startup-id blueman-applet
  ```

  You need a systray bar module like `i3status-rs` / `polybar` / `i3bar` with `tray_output` enabled.

---

## 4. Audio-specific Pulse/PipeWire

After connecting, sometimes the profile defaults to “headset” instead of “A2DP”. You can fix it:

* GUI: `pavucontrol` → Output Devices → switch profile to A2DP.
* CLI:

  ```bash
  pactl list cards short
  pactl set-card-profile <card#> a2dp_sink
  ```

---

## 5. Useful shortcuts in i3

Add to `~/.config/i3/config` for quick toggling:

```i3
# Toggle bluetooth on/off
bindsym mod+b exec "rfkill toggle bluetooth"

# Launch blueman GUI
bindsym mod+Shift+b exec blueman-manager
```

---

👉 Question for you: do you want this lean (just `bluetoothctl` in terminal, no daemons beyond `bluetoothd`), or do you want the tray-based workflow `blueman-applet` so you can click-pair from i3?

That’ll change what I recommend you actually put in your i3 startup.
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [local-offline-model-deployment-strategy]
- [voice-access-layer-design|Voice Access Layer Design]
- [model-selection-for-lightweight-conversational-tasks|Model Selection for Lightweight Conversational Tasks]
- [Promethean Event Bus MVP v0.1]promethean-event-bus-mvp-v0-1.md
- [migrate-to-provider-tenant-architecture|Migrate to Provider-Tenant Architecture]
- Local-First Intention→Code Loop with Free Models$local-first-intention-code-loop-with-free-models.md
- [docs/unique/event-bus-mvp|Event Bus MVP]
- [chroma-toolkit-consolidation-plan|Chroma Toolkit Consolidation Plan]
- [polymorphic-meta-programming-engine]
- [prometheus-observability-stack|Prometheus Observability Stack]
- [ai-centric-os-with-mcp-layer|AI-Centric OS with MCP Layer]
- [ai-first-os-model-context-protocol]
- [balanced-bst]

## Sources
- [prometheus-observability-stack#L508|Prometheus Observability Stack — L508] (line 508, col 1, score 1)
- [prometheus-observability-stack#L508|Prometheus Observability Stack — L508] (line 508, col 3, score 1)
- [docs/unique/event-bus-mvp#L552|Event Bus MVP — L552] (line 552, col 1, score 1)
- [docs/unique/event-bus-mvp#L552|Event Bus MVP — L552] (line 552, col 3, score 1)
- Local-First Intention→Code Loop with Free Models — L144$local-first-intention-code-loop-with-free-models.md#L144 (line 144, col 1, score 1)
- Local-First Intention→Code Loop with Free Models — L144$local-first-intention-code-loop-with-free-models.md#L144 (line 144, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L273|Migrate to Provider-Tenant Architecture — L273] (line 273, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L273|Migrate to Provider-Tenant Architecture — L273] (line 273, col 3, score 1)
- [Promethean Event Bus MVP v0.1 — L893]promethean-event-bus-mvp-v0-1.md#L893 (line 893, col 1, score 1)
- [Promethean Event Bus MVP v0.1 — L893]promethean-event-bus-mvp-v0-1.md#L893 (line 893, col 3, score 1)
- [chroma-toolkit-consolidation-plan#L174|Chroma Toolkit Consolidation Plan — L174] (line 174, col 1, score 1)
- [chroma-toolkit-consolidation-plan#L174|Chroma Toolkit Consolidation Plan — L174] (line 174, col 3, score 1)
- [migrate-to-provider-tenant-architecture#L282|Migrate to Provider-Tenant Architecture — L282] (line 282, col 1, score 1)
- [migrate-to-provider-tenant-architecture#L282|Migrate to Provider-Tenant Architecture — L282] (line 282, col 3, score 1)
- [polymorphic-meta-programming-engine#L206|polymorphic-meta-programming-engine — L206] (line 206, col 1, score 1)
- [polymorphic-meta-programming-engine#L206|polymorphic-meta-programming-engine — L206] (line 206, col 3, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 1, score 1)
- [ai-centric-os-with-mcp-layer#L406|AI-Centric OS with MCP Layer — L406] (line 406, col 3, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 1, score 1)
- [ai-first-os-model-context-protocol#L11|AI-First-OS-Model-Context-Protocol — L11] (line 11, col 3, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 1, score 1)
- [ai-first-os-model-context-protocol#L14|AI-First-OS-Model-Context-Protocol — L14] (line 14, col 3, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 1, score 1)
- [balanced-bst#L297|balanced-bst — L297] (line 297, col 3, score 1)
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
