---
uuid: c7b8a045-45f2-42c4-9617-b0cda73ca3cf
created_at: i3-bluetooth-setup.md
filename: i3-bluetooth-setup
title: i3-bluetooth-setup
description: >-
  Step-by-step guide to configuring Bluetooth on i3 with Ubuntu/Debian, covering
  installation, service enablement, terminal vs GUI interaction, audio profile
  management, and i3 shortcuts for quick toggling.
tags:
  - i3
  - bluetooth
  - ubuntu
  - debian
  - pulseaudio
  - blueman
  - systemd
  - audio-profiles
  - rfkill
  - i3-config
related_to_uuid:
  - c8700670-2490-4665-8aaa-583c08d98034
  - 10780cdc-5036-4e8a-9599-a11703bc30c9
  - a09a2867-7f5a-4864-8150-6eee881a616b
  - 395df1ea-572e-49ec-8861-aff9d095ed0e
  - d65e5b6c-29ed-458f-bf9b-94bf0d48fa79
  - e2955491-020a-4009-b7ed-a5a348c63cfd
  - 2611e17e-c7dd-4de6-9c66-d98fcfa9ffb5
  - 572b571b-b337-4004-97b8-386f930b5497
  - fd753d3a-84cb-4bdd-ae93-8c5b09617e3b
  - 4c63f2be-b5cd-479c-ad0d-ca26424162f7
  - 48f88696-7ef9-4b64-953f-4ef50b1ad5e1
  - ed2e157e-bfed-4291-ae4c-6479df975d87
  - 0c501d52-ba38-42aa-ad25-2d78425dfaff
  - 526317d7-2eaf-4559-bb17-1f8dcfe9e30c
  - 95410f6e-dabb-4560-80a8-1ed4fd9c3d3b
related_to_title:
  - Emacs Semantic Search Guide
  - Eidolon Field Abstract Model
  - pr-688-nitpack-extract
  - Promethean System Diagrams
  - sibilant-macro-targets
  - chroma-toolkit-consolidation-plan
  - Universal Lisp Interface
  - State Snapshots API and Transactional Projector
  - polyglot-repl-interface-layer
  - lisp-compiler-integration
  - Promethean Eidolon Synchronicity Model
  - field-interaction-equations
  - dynamic-context-model-for-web-components
  - Cross-Target Macro System in Sibilant
  - model-selection-for-lightweight-conversational-tasks
references:
  - uuid: c8700670-2490-4665-8aaa-583c08d98034
    line: 1
    col: 0
    score: 1
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 159
    col: 0
    score: 0.91
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 144
    col: 0
    score: 0.9
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 99
    col: 0
    score: 0.89
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 176
    col: 0
    score: 0.89
  - uuid: a09a2867-7f5a-4864-8150-6eee881a616b
    line: 43
    col: 0
    score: 0.88
  - uuid: 10780cdc-5036-4e8a-9599-a11703bc30c9
    line: 124
    col: 0
    score: 0.87
  - uuid: 395df1ea-572e-49ec-8861-aff9d095ed0e
    line: 95
    col: 0
    score: 0.86
---
Alright, so with i3 there isn’t a “desktop environment daemon” to hold your hand — you’ve got to set up Bluetooth the *right* way. Let me break it down: ^ref-5e408692-1-0

---

## 1. Make sure the base Bluetooth stack is installed

On Ubuntu/Debian: ^ref-5e408692-7-0

```bash
sudo apt install bluez blueman pulseaudio-module-bluetooth
```

* `bluez` → the Linux Bluetooth stack.
* `blueman` → GTK manager for pairing (nice tray app, works well with i3). ^ref-5e408692-14-0
* `pulseaudio-module-bluetooth` (or `pipewire-pulse` if you’re on PipeWire) → lets audio devices work. ^ref-5e408692-15-0

---

## 2. Enable the Bluetooth service

Check the systemd service: ^ref-5e408692-21-0

```bash
systemctl status bluetooth
```

If it’s not running: ^ref-5e408692-27-0

```bash
sudo systemctl enable --now bluetooth
```

---

## 3. Pick how you want to interact

You’ve got choices here: ^ref-5e408692-37-0

* **Terminal only (bare metal):**

  ```bash
  bluetoothctl
  ```

  Inside: ^ref-5e408692-45-0

  ```
  power on
  agent on
  default-agent
  scan on
  pair <MAC>
  connect <MAC>
  trust <MAC>
  ```

* **With GUI helper (nicer in i3):** ^ref-5e408692-57-0
  Launch `blueman-applet` in the background — it gives you a systray icon.
  Add this line to your `~/.config/i3/config`:

  ```
  exec --no-startup-id blueman-applet
  ```
^ref-5e408692-61-0
 ^ref-5e408692-65-0
  (You need a systray bar module like `i3status-rs` / `polybar` / `i3bar` with `tray_output` enabled.)

---

## 4. Audio-specific (Pulse/PipeWire)

After connecting, sometimes the profile defaults to “headset” instead of “A2DP”. You can fix it:

* GUI: `pavucontrol` → Output Devices → switch profile to A2DP. ^ref-5e408692-74-0
* CLI:

  ```bash
  pactl list cards short
  pactl set-card-profile <card#> a2dp_sink
  ```

---

## 5. Useful shortcuts in i3
 ^ref-5e408692-85-0
Add to `~/.config/i3/config` for quick toggling:
 ^ref-5e408692-87-0
```i3
# Toggle bluetooth on/off
bindsym $mod+b exec "rfkill toggle bluetooth"

# Launch blueman GUI
bindsym $mod+Shift+b exec blueman-manager
^ref-5e408692-87-0
```

--- ^ref-5e408692-97-0

👉 Question for you: do you want this lean (just `bluetoothctl` in terminal, no daemons beyond `bluetoothd`), or do you want the tray-based workflow (`blueman-applet`) so you can click-pair from i3? ^ref-5e408692-99-0

That’ll change what I recommend you actually put in your i3 startup.
5a0-4bfa-884c-c1b948e9b0b2
    line: 57
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 67
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 434
    col: 0
    score: 1
  - uuid: 008f2ac0-bfaa-4d52-9826-2d5e86c0059f
    line: 121
    col: 0
    score: 1
  - uuid: 938eca9c-97e2-4bcc-8653-b0ef1a5ac7a3
    line: 110
    col: 0
    score: 1
  - uuid: 6620e2f2-de6d-45d8-a722-5d26e160b370
    line: 371
    col: 0
    score: 1
  - uuid: dd00677a-2280-45a7-91af-0728b21af3ad
    line: 141
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 222
    col: 0
    score: 1
  - uuid: fc21f824-4244-4030-a48e-c4170160ea1d
    line: 374
    col: 0
    score: 1
  - uuid: a4a25141-6380-40b9-9cd7-b554b246b303
    line: 407
    col: 0
    score: 1
  - uuid: 37b5d236-2b3e-4a95-a4e8-31655c3023ef
    line: 270
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 164
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 282
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 207
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 89
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 197
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 625
    col: 0
    score: 1
  - uuid: 7b7ca860-780c-44fa-8d3f-be8bd9496fba
    line: 570
    col: 0
    score: 1
  - uuid: e2135d9f-c69d-47ee-9b17-0b05e98dc748
    line: 52
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 197
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 139
    col: 0
    score: 1
  - uuid: 3a3bf2c9-c0f6-4d7b-bf84-c83c70dece3f
    line: 260
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 167
    col: 0
    score: 1
  - uuid: 23df6ddb-05cf-4639-8201-f8291f8a6026
    line: 188
    col: 0
    score: 1
  - uuid: 9a93a756-6d33-45d1-aca9-51b74f2b33d2
    line: 197
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 270
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
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 505
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 435
    col: 0
    score: 1
  - uuid: f7702bf8-f7db-473c-9a5b-8dbf66ad3b9e
    line: 396
    col: 0
    score: 1
  - uuid: 623a55f7-685c-486b-abaf-469da1bbbb69
    line: 68
    col: 0
    score: 1
  - uuid: 557309a3-c906-4e97-8867-89ffe151790c
    line: 49
    col: 0
    score: 1
  - uuid: 9e8ae388-767a-4ea8-9f2e-88801291d947
    line: 73
    col: 0
    score: 1
  - uuid: 10d98225-12e0-4212-8e15-88b57cf7bee5
    line: 43
    col: 0
    score: 1
  - uuid: 73d3dbf6-9240-46fd-ada9-cc2e7e00dc5f
    line: 104
    col: 0
    score: 1
  - uuid: cdbd21ee-25a0-4bfa-884c-c1b948e9b0b2
    line: 44
    col: 0
    score: 1
  - uuid: 2792d448-c3b5-4050-93dd-93768529d99c
    line: 75
    col: 0
    score: 1
  - uuid: e979c50f-69bb-48b0-8417-e1ee1b31c0c0
    line: 48
    col: 0
    score: 1
  - uuid: 13951643-1741-46bb-89dc-1beebb122633
    line: 127
    col: 0
    score: 1
  - uuid: dd89372d-10de-42a9-8c96-6bc13ea36d02
    line: 255
    col: 0
    score: 1
  - uuid: b5e0183e-c34b-44b2-8fc9-a740a1a8d4e2
    line: 162
    col: 0
    score: 1
  - uuid: 54382370-1931-4a19-a634-46735708a9ea
    line: 308
    col: 0
    score: 1
  - uuid: 40185d05-010e-45e7-8c2d-2f879bf14218
    line: 102
    col: 0
    score: 1
  - uuid: 5f65dfa5-dc97-4a6c-ad93-c45c1312e156
    line: 41
    col: 0
    score: 1
  - uuid: d144aa62-348c-4e5d-ae8f-38084c67ceca
    line: 159
    col: 0
    score: 1
  - uuid: db74343f-8f84-43a3-adb2-499c6f00be1c
    line: 149
    col: 0
    score: 1
  - uuid: 5a02283e-4281-4930-9ca7-e27849de11bd
    line: 70
    col: 0
    score: 1
  - uuid: 1d3d6c3a-039e-4b96-93c1-95854945e248
    line: 67
    col: 0
    score: 1
  - uuid: ca8e1399-77bf-4f77-82a3-3f703b68706d
    line: 61
    col: 0
    score: 1
  - uuid: 8b8e6103-30a4-4d66-b5f2-87db1612b587
    line: 140
    col: 0
    score: 1
  - uuid: 95205cd3-c3d5-4047-9c33-9c5ca2b49597
    line: 29
    col: 0
    score: 1
  - uuid: d614d983-7795-491f-9437-09f3a43f72cf
    line: 25
    col: 0
    score: 1
  - uuid: e90b5a16-d58f-424d-bd36-70e9bd2861ad
    line: 558
    col: 0
    score: 1
  - uuid: bd4f0976-0d5b-47f6-a20a-0601d1842dc1
    line: 220
    col: 0
    score: 1
  - uuid: 43bfe9dd-d433-42ca-9777-f4c40eaba791
    line: 274
    col: 0
    score: 1
  - uuid: d17d3a96-c84d-4738-a403-6c733b874da2
    line: 614
    col: 0
    score: 1
  - uuid: 59b5670f-36d3-4d34-8985-f3144b15347a
    line: 141
    col: 0
    score: 1
  - uuid: b3555ede-324a-4d24-a885-b0721e74babf
    line: 45
    col: 0
    score: 1
  - uuid: 8430617b-80a2-4cc9-8288-9a74cb57990b
    line: 163
    col: 0
    score: 1
  - uuid: d8059b6a-c1ec-487d-8e0b-3ce33d6b4d06
    line: 579
    col: 0
    score: 1
  - uuid: 49a9a860-944c-467a-b532-4f99186a8593
    line: 82
    col: 0
    score: 1
  - uuid: 62bec6f0-4e13-4f38-aca4-72c84ba02367
    line: 426
    col: 0
    score: 1
  - uuid: 6bcff92c-4224-453d-9993-1be8d37d47c3
    line: 128
    col: 0
    score: 1
  - uuid: 18344cf9-0c49-4a71-b6c8-b8d84d660fca
    line: 78
    col: 0
    score: 1
  - uuid: ae24a280-678e-4c0b-8cc4-56667fa04172
    line: 98
    col: 0
    score: 1
  - uuid: 9fab9e76-e283-4c9d-a8cd-cb76892ea7ac
    line: 27
    col: 0
    score: 1
  - uuid: 03a5578f-d689-45db-95e9-11300e5eee6f
    line: 74
    col: 0
    score: 1
---
Alright, so with i3 there isn’t a “desktop environment daemon” to hold your hand — you’ve got to set up Bluetooth the *right* way. Let me break it down: ^ref-5e408692-1-0

---

## 1. Make sure the base Bluetooth stack is installed

On Ubuntu/Debian: ^ref-5e408692-7-0

```bash
sudo apt install bluez blueman pulseaudio-module-bluetooth
```

* `bluez` → the Linux Bluetooth stack.
* `blueman` → GTK manager for pairing (nice tray app, works well with i3). ^ref-5e408692-14-0
* `pulseaudio-module-bluetooth` (or `pipewire-pulse` if you’re on PipeWire) → lets audio devices work. ^ref-5e408692-15-0

---

## 2. Enable the Bluetooth service

Check the systemd service: ^ref-5e408692-21-0

```bash
systemctl status bluetooth
```

If it’s not running: ^ref-5e408692-27-0

```bash
sudo systemctl enable --now bluetooth
```

---

## 3. Pick how you want to interact

You’ve got choices here: ^ref-5e408692-37-0

* **Terminal only (bare metal):**

  ```bash
  bluetoothctl
  ```

  Inside: ^ref-5e408692-45-0

  ```
  power on
  agent on
  default-agent
  scan on
  pair <MAC>
  connect <MAC>
  trust <MAC>
  ```

* **With GUI helper (nicer in i3):** ^ref-5e408692-57-0
  Launch `blueman-applet` in the background — it gives you a systray icon.
  Add this line to your `~/.config/i3/config`:

  ```
  exec --no-startup-id blueman-applet
  ```
^ref-5e408692-61-0
 ^ref-5e408692-65-0
  (You need a systray bar module like `i3status-rs` / `polybar` / `i3bar` with `tray_output` enabled.)

---

## 4. Audio-specific (Pulse/PipeWire)

After connecting, sometimes the profile defaults to “headset” instead of “A2DP”. You can fix it:

* GUI: `pavucontrol` → Output Devices → switch profile to A2DP. ^ref-5e408692-74-0
* CLI:

  ```bash
  pactl list cards short
  pactl set-card-profile <card#> a2dp_sink
  ```

---

## 5. Useful shortcuts in i3
 ^ref-5e408692-85-0
Add to `~/.config/i3/config` for quick toggling:
 ^ref-5e408692-87-0
```i3
# Toggle bluetooth on/off
bindsym $mod+b exec "rfkill toggle bluetooth"

# Launch blueman GUI
bindsym $mod+Shift+b exec blueman-manager
^ref-5e408692-87-0
```

--- ^ref-5e408692-97-0

👉 Question for you: do you want this lean (just `bluetoothctl` in terminal, no daemons beyond `bluetoothd`), or do you want the tray-based workflow (`blueman-applet`) so you can click-pair from i3? ^ref-5e408692-99-0

That’ll change what I recommend you actually put in your i3 startup.
