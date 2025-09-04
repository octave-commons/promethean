---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Bluetooth setup on i3"
conversation_id: 68a38973-9884-8330-9aa9-fee624850cb9
create_time: 08/18/2025 at 3:13 PM
update_time: 08/20/2025 at 8:31 AM
---

# Title: Bluetooth setup on i3

Created: 08/18/2025 at 3:13 PM
Last Updated: 08/20/2025 at 8:31 AM
Chat URL: https://chat.openai.com/c/68a38973-9884-8330-9aa9-fee624850cb9


>[!nexus_user] **User** - 08/18/2025 at 3:13 PM
> bluetooth on i3
<!-- UID: b49216a0-e2f4-4684-b6fe-8fbf4665788e -->




>[!nexus_agent] **Assistant** - 08/18/2025 at 3:13 PM
> Alright, so with i3 there isn’t a “desktop environment daemon” to hold your hand — you’ve got to set up Bluetooth the *right* way. Let me break it down: 
> 
> ---
> 
> ## 1. Make sure the base Bluetooth stack is installed 
> On Ubuntu/Debian: 
> ```bash
> sudo apt install bluez blueman pulseaudio-module-bluetooth
> ```
> 
> - `bluez` → the Linux Bluetooth stack. 
> - `blueman` → GTK manager for pairing (nice tray app, works well with i3). 
> - `pulseaudio-module-bluetooth` (or `pipewire-pulse` if you’re on PipeWire) → lets audio devices work. 
> 
> ---
> 
> ## 2. Enable the Bluetooth service
> Check the systemd service:
> ```bash
> systemctl status bluetooth
> ```
> If it’s not running:
> ```bash
> sudo systemctl enable --now bluetooth
> ```
> 
> ---
> 
> ## 3. Pick how you want to interact
> You’ve got choices here:
> 
> - **Terminal only (bare metal):**
>  ```bash
>  bluetoothctl
>  ```
>  Inside:
>  ```
>  power on
>  agent on
>  default-agent
>  scan on
>  pair <MAC>
>  connect <MAC>
>  trust <MAC>
>  ```
> 
> - **With GUI helper (nicer in i3):**
>  Launch `blueman-applet` in the background — it gives you a systray icon. 
>  Add this line to your `~/.config/i3/config`:
>  ```
>  exec --no-startup-id blueman-applet
>  ```
>  (You need a systray bar module like `i3status-rs` / `polybar` / `i3bar` with `tray_output` enabled.)
> 
> ---
> 
> ## 4. Audio-specific (Pulse/PipeWire)
> After connecting, sometimes the profile defaults to “headset” instead of “A2DP”. You can fix it:
> 
> - GUI: `pavucontrol` → Output Devices → switch profile to A2DP. 
> - CLI: 
>  ```bash
>  pactl list cards short
>  pactl set-card-profile <card#> a2dp_sink
>  ```
> 
> ---
> 
> ## 5. Useful shortcuts in i3
> Add to `~/.config/i3/config` for quick toggling:
> ```i3
> # Toggle bluetooth on/off
> bindsym $mod+b exec "rfkill toggle bluetooth"
> 
> # Launch blueman GUI
> bindsym $mod+Shift+b exec blueman-manager
> ```
> 
> ---
> 
> 👉 Question for you: do you want this lean (just `bluetoothctl` in terminal, no daemons beyond `bluetoothd`), or do you want the tray-based workflow (`blueman-applet`) so you can click-pair from i3? 
> 
> That’ll change what I recommend you actually put in your i3 startup.
<!-- UID: 1885da7a-07a4-4bd8-9023-e4ac3fc363dc -->

---


