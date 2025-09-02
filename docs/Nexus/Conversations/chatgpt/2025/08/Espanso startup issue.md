---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Espanso startup issue"
conversation_id: 68ac6c67-c130-8325-a662-65d95ae0bec2
create_time: 08/25/2025 at 9:00 AM
update_time: 08/27/2025 at 9:47 AM
---

# Title: Espanso startup issue

Created: 08/25/2025 at 9:00 AM
Last Updated: 08/27/2025 at 9:47 AM
Chat URL: https://chat.openai.com/c/68ac6c67-c130-8325-a662-65d95ae0bec2


>[!nexus_user] **User** - 08/25/2025 at 9:00 AM
> So... when I start my computer, I see this. I think it's espanso...

>[!nexus_attachment] **image_file-ETrUUjaWyQ9aUHwJAcmPNS_2048x1280.png** (image/png) - 27.07 KB
> ![[Nexus_attachments/chatgpt/images/image_file-ETrUUjaWyQ9aUHwJAcmPNS_2048x1280_1.png]]
<!-- UID: 19103560-be88-4734-817a-0d339e3e8be7 -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 9:00 AM
> Yeah, that screenshot looks like a **startup window rendering as tofu blocks (□)** — usually caused by a program starting before fonts or locale are properly initialized. 
> 
> If you suspect **Espanso**, that makes sense because Espanso uses a GUI for configuration/troubleshooting, and if it’s launching too early (before your desktop environment has fonts ready), it’ll render like that.
> 
> ### Things to Check
> 1. **Confirm the process**
>  - After you see that window, run:
>  ```bash
>  ps aux | grep espanso
>  ```
>  If `espanso` shows up, that’s your culprit.
> 
> 2. **Startup/autostart**
>  - Check if Espanso has an autostart entry:
>  ```bash
>  ls ~/.config/autostart
>  ```
>  or
>  ```bash
>  systemctl --user list-unit-files | grep espanso
>  ```
>  - If you see something like `espanso.service`, it’s being started at login.
> 
> 3. **Disable the Troubleshooting GUI**
>  - Espanso sometimes opens its "Troubleshooting" or "Dashboard" UI on first run or after updates.
>  - To stop it, edit or create the config file at:
>  ```bash
>  ~/.config/espanso/config/default.yml
>  ```
>  Look for any `show_dashboard_on_startup: true` setting and set it to `false`.
> 
> 4. **Font/locale issue**
>  - The tofu blocks (□) mean the text is there, but no font supports it. That could be a missing font package.
>  - Try installing some fallback fonts:
>  ```bash
>  sudo apt install fonts-dejavu fonts-noto
>  ```
>  That should fix missing glyphs.
> 
> ---
> 
> 👉 Quick test: next time you see that window, don’t close it — run `xprop` and click on it. It’ll tell you the window class and name, confirming if it’s Espanso. 
> 
> Do you want me to walk you through **removing Espanso’s autostart entry**, or would you rather **fix the font issue so the window is readable**?
<!-- UID: 628f33f8-eedf-44e0-941d-c8fb5facc627 -->

---




>[!nexus_user] **User** - 08/25/2025 at 9:02 AM
> I would rather fix the font issue.
> 
> [Unit]
> Description=espanso
> 
> [Service]
> ExecStart=/snap/espanso/129/bin/espanso launcher 
> Restart=on-failure
> RestartSec=3
> 
> [Install]
> WantedBy=default.target
<!-- UID: 46d5e8aa-22db-4311-90db-a49e8d2d4bfd -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 9:02 AM
> got it — let’s fix the tofu (□□□) at the source. 
> With Espanso as a **Snap**, this is almost always a **fontconfig/theming interface not connected** or a **stale font cache/locale** when the service starts.
> 
> # Fix order (fast → thorough)
> 
> ## 1) Ensure Snap can see host fonts/themes
> ```bash
> # See what espanso is connected to
> snap connections espanso
> 
> # If you see "–" in these columns, connect them:
> sudo snap connect espanso:fontconfig
> sudo snap connect espanso:desktop
> sudo snap connect espanso:desktop-legacy
> sudo snap connect espanso:x11 # or :wayland if you run Wayland
> sudo snap connect espanso:gtk-3-themes
> sudo snap connect espanso:icon-themes
> sudo snap connect espanso:sound-themes
> 
> # (usually already present, but if not:)
> sudo snap install gtk-common-themes
> ```
> **Why:** If `fontconfig` (or themes) isn’t connected, the sandbox can’t read your system fonts → squares.
> 
> ## 2) Install solid fallback fonts + rebuild cache
> ```bash
> sudo apt update
> sudo apt install -y fonts-dejavu-core fonts-dejavu-extra fonts-liberation2 fonts-noto-core fonts-noto-color-emoji
> fc-cache -rv # rebuild user cache
> sudo fc-cache -rv # rebuild system cache
> ```
> 
> ## 3) Nuke a bad per-user font cache (if needed)
> ```bash
> rm -rf ~/.cache/fontconfig
> fc-cache -rv
> ```
> 
> ## 4) Make sure the service has a UTF-8 locale
> Systemd user services sometimes start too early and miss your session locale.
> 
> ```bash
> systemctl --user edit espanso.service
> ```
> Add:
> ```
> [Service]
> Environment=LANG=en_US.UTF-8
> Environment=LC_ALL=en_US.UTF-8
> ```
> Then:
> ```bash
> systemctl --user daemon-reload
> systemctl --user restart espanso.service
> ```
> 
> ## 5) Delay start until your session is ready (fontconfig/theme ready)
> ```bash
> systemctl --user edit espanso.service
> ```
> Add:
> ```
> [Unit]
> After=graphical-session.target
> Wants=graphical-session.target
> ```
> Then reload/restart as above.
> 
> ## 6) Prefer the launcher shim in PATH
> Your unit uses:
> ```
> ExecStart=/snap/espanso/129/bin/espanso launcher
> ```
> Swap to the wrapper that Snap maintains (it handles env better across revisions):
> ```
> ExecStart=/snap/bin/espanso launcher
> ```
> Then:
> ```bash
> systemctl --user daemon-reload
> systemctl --user restart espanso.service
> ```
> 
> ---
> 
> # Sanity checks
> 
> - Confirm fonts are visible:
> ```bash
> fc-list | head
> ```
> - Confirm it’s Espanso:
> ```bash
> xprop # click the tofu window; check WM_CLASS/WM_NAME
> ```
> - Reopen the dashboard manually:
> ```bash
> /snap/bin/espanso dashboard
> ```
> If the dashboard text renders correctly after the steps above, the startup tofu was the snap/fontconfig/env timing issue.
> 
> ---
> 
> # Optional: stop the GUI from popping up
> If you just want Espanso to run silently:
> ```bash
> espanso path # shows config dir
> # edit ~/.config/espanso/config/default.yml (or similar)
> # add or set:
> show_dashboard_on_startup: false
> ```
> 
> ---
> 
> If it still renders as squares after steps 1–6, tell me the output of:
> 
> ```bash
> snap connections espanso
> locale
> systemctl --user status espanso.service
> ```
> 
> and we’ll push further (font fallback rules, missing CJK packs, or a bad theme).
> 
> #tags #linux #ubuntu #snap #fonts #fontconfig #systemd #espanso #i3 #wayland #x11
<!-- UID: 3e334038-daed-40e4-a5cd-f02614d24f39 -->

---


