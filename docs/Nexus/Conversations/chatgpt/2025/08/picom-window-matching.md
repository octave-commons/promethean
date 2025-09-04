---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Picom window matching"
conversation_id: 68b1b4ec-a964-832a-9330-267953e1b9fe
create_time: 08/29/2025 at 9:12 AM
update_time: 08/29/2025 at 9:17 AM
---

# Title: Picom window matching

Created: 08/29/2025 at 9:12 AM
Last Updated: 08/29/2025 at 9:17 AM
Chat URL: https://chat.openai.com/c/68b1b4ec-a964-832a-9330-267953e1b9fe


>[!nexus_user] **User** - 08/29/2025 at 9:12 AM
> I keep forgetting... how do I find the name of a window... xprop gives me a lot of info, but not the actual name of the window I'd use in picom... I keep forgetting.. it'll become muscle memory sooon
> 
> err@err-Yoga-7-16ARP8:~$ xprop
> _NET_WM_DESKTOP(CARDINAL) = 0
> _NET_WM_STATE(ATOM) =
> WM_STATE(WM_STATE):
> 		window state: Normal
> 		icon window: 0x0
> _NET_WM_USER_TIME(CARDINAL) = 788743
> _NET_WM_ICON(CARDINAL) =
> WM_NORMAL_HINTS(WM_SIZE_HINTS):
> 		program specified location: 360, 200
> 		program specified minimum size: 400 by 270
> 		program specified maximum size: 2147483647 by 2147483647
> 		window gravity: Static
> _MOTIF_WM_HINTS(_MOTIF_WM_HINTS) = 0x2, 0x0, 0x0, 0x0, 0x0
> XdndAware(ATOM) = BITMAP
> _NET_WM_BYPASS_COMPOSITOR(CARDINAL) = 2
> _NET_WM_SYNC_REQUEST_COUNTER(CARDINAL) = 73400325, 73400326
> _GTK_HIDE_TITLEBAR_WHEN_MAXIMIZED(CARDINAL) = 1
> WM_NAME(UTF8_STRING) = "promethean (Workspace) - Windsurf - Extension: Amp (Research Preview)"
> _NET_WM_NAME(UTF8_STRING) = "promethean (Workspace) - Windsurf - Extension: Amp (Research Preview)"
> WM_WINDOW_ROLE(STRING) = "browser-window"
> WM_CLASS(STRING) = "windsurf", "Windsurf"
> _NET_WM_WINDOW_TYPE(ATOM) = _NET_WM_WINDOW_TYPE_NORMAL
> _NET_WM_PID(CARDINAL) = 18655
> WM_CLIENT_MACHINE(STRING) = "err-Yoga-7-16ARP8"
> WM_PROTOCOLS(ATOM): protocols WM_DELETE_WINDOW, _NET_WM_PING, _NET_WM_SYNC_REQUEST
<!-- UID: 561d23e7-e8c3-4c12-8f33-8734e41cf8c6 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 9:12 AM
> You want the fields picom can match on: **name** (title), **class_i**/**class_g** (WM_CLASS), and **role** (WM_WINDOW_ROLE). Your `xprop` dump already has everything:
> 
> - `WM_NAME` / `_NET_WM_NAME` → picom `name`
>  - `"promethean (Workspace) - Windsurf - Extension: Amp (Research Preview)"`
> - `WM_CLASS(STRING) = "windsurf", "Windsurf"` 
>  - first = **instance** → picom `class_i` = `windsurf` 
>  - second = **class** → picom `class_g` = `Windsurf`
> - `WM_WINDOW_ROLE(STRING) = "browser-window"` → picom `role`
> 
> ### TL;DR: use `WM_CLASS`, not the changing title
> Titles change; **class** is stable. For Windsurf, match either:
> - `class_g = "Windsurf"` (recommended)
> - or `class_i = "windsurf"`
> 
> ### Picom snippets (drop in `~/.config/picom/picom.conf`)
> ```ini
> # Example: exclude Windsurf from blur
> blur-background-exclude = [
>  "class_g = 'Windsurf'"
> ];
> 
> # Example: custom opacity
> opacity-rule = [
>  "92:class_g = 'Windsurf'"
> ];
> 
> # If you *really* want title-based matching (fragile):
> # opacity-rule = [ "90:name = 'promethean (Workspace) - Windsurf - Extension: Amp (Research Preview)'" ];
> ```
> 
> ### Quick muscle-memory commands
> (so you don’t have to click + skim the wall of xprop output every time)
> 
> ```bash
> # Active window: show only the useful fields for picom
> xprop -id "$(xdotool getactivewindow)" WM_CLASS WM_NAME _NET_WM_NAME WM_WINDOW_ROLE
> ```
> 
> ```bash
> # List all windows with WM_CLASS and title (great for grepping)
> wmctrl -lx
> # e.g.:
> # wmctrl -lx | grep -i windsurf
> ```
> 
> ```bash
> # Tiny helper: paste into your shell rc
> winfo() { xprop -id "$(xdotool getactivewindow)" WM_CLASS WM_NAME _NET_WM_NAME WM_WINDOW_ROLE; }
> ```
> 
> ### Mapping cheat sheet
> - `WM_CLASS: "instance","Class"` → `class_i`, `class_g`
> - `WM_NAME` / `_NET_WM_NAME` → `name`
> - `WM_WINDOW_ROLE` → `role`
> - Window types (`_NET_WM_WINDOW_TYPE`) → `window_type` (e.g., `dock`, `dialog`, etc.)
> 
> If you ever switch to Wayland: picom is X11-only; these tricks apply when the app is under Xorg/Xwayland.
> 
> #picom #xprop #wm_class #linux #i3 #tilinux
<!-- UID: 9dd392c9-4ff1-4165-930c-3e45475cc8d9 -->

---




>[!nexus_user] **User** - 08/29/2025 at 9:15 AM
> yea... we have a few blockers for moving to wayland actually. When I opened up OBS, or discord, to stream/video call, I couldn't share my screen. My usual OBS scene was empty
<!-- UID: c4ef577b-98c7-4a94-aa7b-ed1a2ff19ba7 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 9:15 AM
> Yeah, that’s the classic Wayland trap: apps can’t grab the screen directly. If PipeWire + the right **xdg-desktop-portal** backend isn’t running—or if OBS/Discord aren’t using the PipeWire path—you get… empty scenes.
> 
> Here’s the no-BS Wayland screencast checklist that fixes 90% of cases.
> 
> # 0) Confirm you’re actually on Wayland
> ```bash
> echo "$XDG_SESSION_TYPE" # expect: wayland
> ```
> If it says `x11`, none of this matters; you’re on Xorg.
> 
> # 1) Services that MUST be up
> PipeWire stack + exactly one desktop portal backend:
> ```bash
> systemctl --user status pipewire pipewire-pulse wireplumber
> systemctl --user status xdg-desktop-portal
> # and ONE of these backends (depending on your desktop):
> # GNOME: xdg-desktop-portal-gnome
> # KDE: xdg-desktop-portal-kde
> # wlroots (Sway/Hyprland/i3-like): xdg-desktop-portal-wlr (or -hyprland on some distros)
> systemctl --user status xdg-desktop-portal-wlr xdg-desktop-portal-gnome xdg-desktop-portal-kde
> ```
> If you see multiple backends running or errors:
> ```bash
> systemctl --user restart pipewire wireplumber xdg-desktop-portal
> systemctl --user restart xdg-desktop-portal-wlr xdg-desktop-portal-gnome xdg-desktop-portal-kde 2>/dev/null
> journalctl --user-unit=xdg-desktop-portal -b | tail -n 80
> ```
> Tip: you *can* have multiple backends installed, but runtime confusion is a thing—prefer the one that matches your session.
> 
> # 2) OBS: swap your source types
> On Wayland, **don’t** use X11/Xcomposite sources. Use the PipeWire ones:
> - **Add → Screen Capture (PipeWire)** (full display)
> - **Add → Window Capture (PipeWire)** (single app)
> 
> If those entries don’t exist, your OBS build is missing Wayland capture. Use a recent OBS (Flatpak tends to “just work” on Wayland). 
> If the picker shows but preview is black, your portal isn’t healthy → go back to step 1.
> 
> # 3) Discord (and other Electron apps)
> Electron needs to run *on Wayland* and enable the WebRTC PipeWire capturer. Launch Discord with flags:
> ```bash
> # Create a Wayland launcher override
> mkdir -p ~/.local/share/applications
> cat > ~/.local/share/applications/discord-wayland.desktop <<'EOF'
> [Desktop Entry]
> Name=Discord (Wayland)
> Exec=env DISCORD_USE_WAYLAND=1 /usr/bin/discord --enable-features=UseOzonePlatform,WebRTCPipeWireCapturer,WaylandWindowDecorations --ozone-platform=wayland %U
> Type=Application
> Categories=Network;Chat;
> EOF
> update-desktop-database ~/.local/share/applications
> ```
> Start **Discord (Wayland)**. If the share dialog is empty, check:
> ```bash
> # Is Discord actually on Wayland?
> grep -E "ozone|wayland" /proc/$(pidof discord)/cmdline -a | tr '\0' ' '
> ```
> Also: some distro builds of Discord lag. Flatpak/official builds are more likely to have the right Electron/WebRTC bits enabled.
> 
> # 4) Desktop-specific notes
> - **GNOME Wayland**: use `xdg-desktop-portal-gnome`. Avoid running both `-gnome` and `-wlr` at the same time.
> - **KDE Plasma Wayland**: use `xdg-desktop-portal-kde`.
> - **Sway/Hyprland (wlroots)**:
>  - Install `xdg-desktop-portal-wlr` (or `-hyprland` if your distro provides it).
>  - Ensure the environment propagates to systemd user services at login:
>  ```bash
>  # put in your compositor autostart:
>  dbus-update-activation-environment --systemd --all
>  systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
>  ```
> - **NVIDIA**: modern drivers are fine, but if you get black capture only on Wayland, confirm you’re on recent drivers and not forcing XWayland. Mixed-GPU setups can be finicky—test with only one GPU active to isolate.
> 
> # 5) Quick install sanity (Ubuntu-ish)
> ```bash
> # Core
> sudo apt install -y pipewire wireplumber xdg-desktop-portal
> 
> # GNOME users:
> sudo apt install -y xdg-desktop-portal-gnome
> 
> # KDE users:
> sudo apt install -y xdg-desktop-portal-kde
> 
> # wlroots users (Sway/Hyprland):
> sudo apt install -y xdg-desktop-portal-wlr
> 
> # OBS with Wayland capture (if your repo is old, prefer Flatpak)
> sudo apt install -y obs-studio
> ```
> 
> # 6) Fast “is the portal broken?” test
> If OBS “Screen Capture (PipeWire)” shows nothing **and** Discord’s picker is empty, the portal is the culprit. Restart the stack and try again:
> ```bash
> systemctl --user restart pipewire wireplumber xdg-desktop-portal
> sleep 2
> systemctl --user status xdg-desktop-portal
> journalctl --user-unit=xdg-desktop-portal -b | tail -n 100
> ```
> 
> # 7) Pragmatic fallback
> If you’re mid-stream and don’t want to fight your setup: log in to **Xorg** for that session. Wayland is worth it long-term, but screen-sharing depends on that portal chain being clean.
> 
> If you want, tell me which desktop/compositor you’re on (GNOME, KDE, Sway, Hyprland) and how you installed OBS/Discord (apt, Flatpak, Snap), and I’ll give you a surgical set of commands for *that* combo.
> 
> #wayland #pipewire #xdg-desktop-portal #obs #discord #linux #streaming #sway #hyprland #gnome #kde
<!-- UID: b2289c03-117a-4f35-96c9-d43016e8ffc5 -->

---


