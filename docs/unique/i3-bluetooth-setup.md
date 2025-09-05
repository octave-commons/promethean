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
