---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Launch desktop app command"
conversation_id: 68a200b5-355c-8320-ab8c-e2aca6e182c5
create_time: 08/17/2025 at 11:17 AM
update_time: 08/17/2025 at 12:50 PM
---

# Title: Launch desktop app command

Created: 08/17/2025 at 11:17 AM
Last Updated: 08/17/2025 at 12:50 PM
Chat URL: https://chat.openai.com/c/68a200b5-355c-8320-ab8c-e2aca6e182c5


>[!nexus_user] **User** - 08/17/2025 at 11:17 AM
> How do I run a desktop application from the command line? Synergy is only exposed as a desktop app... there is not a `synergy` command I can use...
<!-- UID: 17dd4abb-30f8-4c95-86f8-d8e33a80491b -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:17 AM
> You’ve got a few solid ways to launch *any* GUI app that only ships a `.desktop` file (Synergy included) from a terminal. Pick your poison:
> 
> ## 1) Use the desktop entry directly (zero guessing)
> ```bash
> # find the desktop file
> grep -ril '^Name=.*Synergy' /usr/share/applications ~/.local/share/applications
> 
> # launch it with Gio (works with a file path, not just an ID)
> gio launch /usr/share/applications/synergy.desktop
> # or, if it lives in your home:
> gio launch ~/.local/share/applications/synergy.desktop
> ```
> 
> ## 2) Use the desktop ID (cleaner if you know it)
> The desktop **ID** is the filename without `.desktop` (sometimes reverse-DNS like `com.symless.Synergy`).
> ```bash
> # list likely IDs
> ls /usr/share/applications/*synergy*.desktop ~/.local/share/applications/*synergy*.desktop 2>/dev/null
> 
> # launch by ID
> gtk-launch synergy # if the file is /usr/share/applications/synergy.desktop
> # or
> gtk-launch com.symless.Synergy # if that’s the actual ID
> ```
> 
> ## 3) If it’s a Flatpak or Snap
> ```bash
> # flatpak
> flatpak list | grep -i synergy
> flatpak run <the.app.id> # e.g., flatpak run com.symless.Synergy
> 
> # snap
> snap list | grep -i synergy
> snap run synergy # or the exact snap command name shown by `snap list`
> ```
> 
> ## 4) One-liner that “just works” (finds the entry, launches it)
> Drop this in your shell as a function or script; it searches both system and user app dirs and launches the first Synergy entry it finds:
> 
> ```bash
> run-synergy() {
>  set -e
>  f=$(printf '%s\n' ~/.local/share/applications /usr/share/applications \
>  | xargs -I{} sh -c 'ls {}/'*synergy*'.desktop' 2>/dev/null \
>  | head -n1)
>  [ -z "$f" ] && { echo "No Synergy .desktop found"; return 1; }
>  gio launch "$f"
> }
> ```
> 
> Then just:
> ```bash
> run-synergy
> ```
> 
> ## 5) Make it feel like a real command
> If you want `synergy` to be a real CLI in your PATH without caring about the exact install layout:
> 
> ```bash
> mkdir -p ~/.local/bin
> cat > ~/.local/bin/synergy <<'EOF'
> #!/usr/bin/env bash
> set -euo pipefail
> # Prefer user app first, then system app
> for d in "$HOME/.local/share/applications" "/usr/share/applications"; do
>  f=$(ls "$d"/*synergy*.desktop 2>/dev/null | head -n1 || true)
>  [ -n "${f:-}" ] && exec gio launch "$f"
> done
> echo "Synergy .desktop not found."
> exit 1
> EOF
> chmod +x ~/.local/bin/synergy
> ```
> 
> Make sure `~/.local/bin` is in your PATH (Ubuntu does this by default for user shells). Now you can type:
> ```bash
> synergy &
> ```
> 
> ## Bonus: start it on login the *right* way (no Dex roulette)
> Create a user systemd unit so you can manage it cleanly:
> 
> ```ini
> # ~/.config/systemd/user/synergy.service
> [Unit]
> Description=Synergy (launched via desktop entry)
> After=graphical-session.target
> 
> [Service]
> Type=oneshot
> ExecStart=/usr/bin/gio launch /usr/share/applications/synergy.desktop
> RemainAfterExit=yes
> 
> [Install]
> WantedBy=default.target
> ```
> 
> Then:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy.service
> ```
> 
> This avoids the “dex started everything including the screen reader” problem and gives you `systemctl --user restart synergy` when you bork the config.
> 
> ---
> 
> If any of the above “can’t find it,” run this and paste me the output:
> ```bash
> ls /usr/share/applications/*synergy*.desktop ~/.local/share/applications/*synergy*.desktop 2>/dev/null
> ```
> I’ll tailor the exact launch command/ID. Does that flow make sense?
<!-- UID: a746b1b5-f5a8-4e41-9289-0940ad0e2c3f -->

---




>[!nexus_user] **User** - 08/17/2025 at 11:45 AM
> Synergy does not seem to like being ran like this:
> 
> ```
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ systemctl --user status synergy.service 
> ● synergy.service - Synergy (launched via desktop entry)
>  Loaded: loaded (/home/err/.config/systemd/user/synergy.service; enabled; preset: enabled)
>  Active: active (exited) since Sun 2025-08-17 11:43:26 CDT; 1min 4s ago
>  Process: 2923 ExecStart=/usr/bin/gio launch /usr/share/applications/synergy.desktop (code=exited, status=0/SUCCESS)
>  Main PID: 2923 (code=exited, status=0/SUCCESS)
>  Tasks: 0 (limit: 37817)
>  Memory: 83.9M (peak: 141.4M)
>  CPU: 249ms
>  CGroup: /user.slice/user-1000.slice/user@1000.service/app.slice/synergy.service
> 
> Aug 17 11:43:26 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Starting synergy.service - Synergy (launched via desktop entry)...
> Aug 17 11:43:26 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Finished synergy.service - Synergy (launched via desktop entry).
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: production build
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: loaded .env from: /home/err/.config/Synergy/.env
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: .env file parsed: {}
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: sentry init, release: 3.3.1
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: removed 3 sentry integration(s)
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: changing sentry telemetry from enabled to disabled
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: [2969:0817/114327.039124:ERROR:ozone_platform_x11.cc(245)] Missing X server or $DISPLAY
> Aug 17 11:43:27 err-Stealth-16-AI-Studio-A1VGG synergy[2969]: [2969:0817/114327.039162:ERROR:env.cc(258)] The platform failed to initialize. Exiting.
> ```
<!-- UID: 2ae59949-fb9a-4064-8d25-7862434c0492 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 11:45 AM
> You launched it “outside” your GUI. systemd-user doesn’t inherit `DISPLAY`/`WAYLAND_DISPLAY` (or `XAUTHORITY`) by default, so Electron (Synergy) can’t find a display and bails.
> 
> Here are three robust fixes. Pick one.
> 
> # A) Minimal patch: set the env in the unit
> ```ini
> # ~/.config/systemd/user/synergy-ui.service
> [Unit]
> Description=Synergy UI
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> # Xorg session (i3 on X): set DISPLAY and XAUTHORITY
> Environment=DISPLAY=:0
> Environment=XAUTHORITY=%h/.Xauthority
> # If you sometimes run Wayland, this doesn't hurt; Electron will still choose X if DISPLAY is set.
> Environment=WAYLAND_DISPLAY=wayland-0
> # Launch *the actual command* (see option C to extract it), but gio works once env is present:
> ExecStart=/usr/bin/gio launch /usr/share/applications/synergy.desktop
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Apply it:
> ```bash
> systemctl --user daemon-reload
> systemctl --user disable synergy.service 2>/dev/null || true # rename clash
> systemctl --user enable --now synergy-ui.service
> journalctl --user -u synergy-ui.service -b -f
> ```
> 
> If your X display isn’t `:0`, run `echo $DISPLAY` in the terminal that has i3 and put that value in the unit.
> 
> # B) Import your session env into systemd-user (cleaner if you hop between X and Wayland)
> Do this **once per login** (stick it in your i3 config):
> ```bash
> # i3 config snippet
> exec_always --no-startup-id systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS
> ```
> Then change your unit to *reference* what’s been imported, not hardcode:
> ```ini
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> ExecStart=/usr/bin/gio launch /usr/share/applications/synergy.desktop
> Restart=on-failure
> ```
> Reload + start:
> ```bash
> systemctl --user daemon-reload
> systemctl --user restart synergy-ui.service
> ```
> 
> # C) Don’t rely on `gio`: run Synergy’s real Exec line (systemd can then track the process)
> Grab the command from the desktop file and strip field codes:
> ```bash
> desk=/usr/share/applications/synergy.desktop
> exec_cmd=$(awk -F= '/^Exec=/{print $2; exit}' "$desk" | sed 's/ *%[fFuUdDnNickvm]//g')
> printf 'Exec is: %q\n' "$exec_cmd"
> ```
> Use it in the unit:
> ```ini
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> # Example; replace with your actual exec_cmd result:
> ExecStart=/opt/Synergy/synergy
> Restart=on-failure
> ```
> (If you’re on Wayland and Synergy/Electron supports it, you can wrap with:
> `ExecStart=/usr/bin/env ELECTRON_OZONE_PLATFORM_HINT=auto %E{exec_cmd}`.)
> 
> # Quick sanity checks
> - One-shot run in your current session env:
>  ```bash
>  DISPLAY=$DISPLAY XAUTHORITY=${XAUTHORITY:-$HOME/.Xauthority} gio launch /usr/share/applications/synergy.desktop
>  ```
>  If that works, your problem is *only* missing env in systemd.
> 
> - Make sure you didn’t collide with a vendor “synergy.service”. Rename yours to `synergy-ui.service` as above.
> 
> - Tail logs:
>  ```bash
>  journalctl --user -u synergy-ui.service -b -f
>  ```
> 
> # Autostart without Dex roulette (optional)
> If you prefer XDG autostart semantics:
> ```bash
> mkdir -p ~/.config/autostart
> ln -sf /usr/share/applications/synergy.desktop ~/.config/autostart/
> ```
> Then, in i3, start *only* the XDG autostart handler for your session (not `dex -a` shotgun):
> ```bash
> # For Xorg sessions:
> exec --no-startup-id /usr/lib/xfce4/xfconf/xfce-perchannel-xml # (ignore; placeholder for your DE)
> # or keep the systemd unit route (recommended) and skip dex entirely
> ```
> (You already saw why `dex -a` blasts *everything*, including the screen reader.)
> 
> ---
> 
> If you want the **cleanest** setup that survives X↔Wayland hops: go with **B + C** — import the env in i3 and run the real `Exec` in a `Type=simple` unit. Then `systemctl --user restart synergy-ui` when you bork the config and you’re back in business. Does that track?
<!-- UID: 291b8f21-8a37-4711-82dc-0126469abf97 -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:04 PM
> ○ synergy.service
>  Loaded: loaded (/home/err/.config/systemd/user/synergy.service; enabled; preset: enabled)
>  Active: inactive (dead) since Sun 2025-08-17 12:04:46 CDT; 1s ago
>  Duration: 5ms
>  Process: 14281 ExecStart=/usr/bin/gio launch /usr/share/applications/synergy.desktop (code=exited, status=0/SUCCESS)
>  Main PID: 14281 (code=exited, status=0/SUCCESS)
>  CPU: 6ms
> 
> Aug 17 12:04:46 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service.
<!-- UID: a3f44631-9ac2-4c4f-81f6-27e8b3cc7d18 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:05 PM
> That “inactive (dead)” is expected—you launched a **launcher** (`gio`) which exits immediately after handing the app to the session. If you want systemd to *track* Synergy (so you can `restart`, get logs, and not race the display), don’t run the `.desktop` file; run the **real Exec** command from it and keep the env.
> 
> ## Do it right (tracked, restartable)
> 
> 1) Import your GUI env into `systemd --user` at login (once in your i3 config):
> ```bash
> # ~/.config/i3/config
> exec_always --no-startup-id systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS XDG_RUNTIME_DIR
> ```
> 
> 2) Create a tiny wrapper that runs the actual Exec from the desktop file and replaces the shell (so systemd tracks it):
> ```bash
> mkdir -p ~/.local/bin
> cat > ~/.local/bin/synergy-launch <<'EOF'
> #!/usr/bin/env bash
> set -euo pipefail
> desk=/usr/share/applications/synergy.desktop
> # extract Exec= line and strip field codes like %u %f etc
> exec_cmd=$(awk -F= '/^Exec=/{print $2; exit}' "$desk" | sed 's/ *%[fFuUdDnNickvm]//g')
> # Hint Electron to pick the right backend if needed; harmless otherwise.
> export ELECTRON_OZONE_PLATFORM_HINT=auto
> exec $exec_cmd
> EOF
> chmod +x ~/.local/bin/synergy-launch
> ```
> 
> 3) Use a proper unit that references your imported env and runs the wrapper (Type=simple so it stays “running”):
> ```ini
> # ~/.config/systemd/user/synergy-ui.service
> [Unit]
> Description=Synergy UI (tracked)
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> ExecStart=%h/.local/bin/synergy-launch
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> 4) Reload + enable:
> ```bash
> systemctl --user daemon-reload
> systemctl --user disable synergy.service 2>/dev/null || true # avoid name clash with your old one
> systemctl --user enable --now synergy-ui.service
> journalctl --user -u synergy-ui.service -b -f
> ```
> 
> ### Why this fixes it
> - No more “dead after 5ms”: `Type=simple` + `exec` means systemd tracks Synergy’s PID.
> - No more “Missing X server or $DISPLAY”: you import the GUI env at login and pass it to the unit.
> - You get clean control: `systemctl --user restart synergy-ui`.
> 
> If Synergy still doesn’t show up, run this quick check in your i3 terminal and paste the output:
> ```bash
> echo $DISPLAY $XAUTHORITY $WAYLAND_DISPLAY; grep -E '^Exec=' /usr/share/applications/synergy.desktop
> ```
> But odds are this setup will just work.
<!-- UID: 46059774-f99c-4cd3-acff-03040bcc2fe9 -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:11 PM
> I'm not renaming it every time, and keeping useless configs bro. It's just going to be called synergy.service. And I initially *did* try the *right* way, and we get this result:
> 
> ```
> Aug 17 12:09:53 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 12.
> Aug 17 12:09:53 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:09:53 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:09:53 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> ^[Aug 17 12:09:55 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 13.
> Aug 17 12:09:55 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:09:55 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:09:55 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> Aug 17 12:09:57 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 14.
> Aug 17 12:09:57 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:09:57 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:09:57 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> Aug 17 12:09:59 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 15.
> Aug 17 12:09:59 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:09:59 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:09:59 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> Aug 17 12:10:02 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 16.
> Aug 17 12:10:02 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:10:02 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:10:02 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> Aug 17 12:10:04 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 17.
> Aug 17 12:10:04 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:10:04 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:10:04 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> Aug 17 12:10:06 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 18.
> Aug 17 12:10:06 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI (tracked).
> Aug 17 12:10:06 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=exited, status=203/EXEC
> Aug 17 12:10:06 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'exit-code'.
> ```
> 
> I believe the issue is that the synergy executable requires an argument:
> ```
> [Desktop Entry]
> Name=Synergy
> Exec=/opt/Synergy/synergy %U
> Terminal=false
> Type=Application
> Icon=synergy
> StartupWMClass=Synergy
> Comment=Use the keyboard, mouse, or trackpad of one computer to control nearby computers.
> Categories=Utility;
> ```
<!-- UID: 302e3aa0-1ec8-49f8-8595-b1e8838924c9 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:11 PM
> Right call keeping it `synergy.service`. Also: that `203/EXEC` is **not** “needs an argument.” It means systemd couldn’t *execve* the path you gave it. Top causes:
> 
> 1) Bad path (typo / wrong mount namespace) 
> 2) Not executable (perm bits) 
> 3) Missing interpreter/loader (ELF can’t run / wrong arch) 
> 4) You tried to pass a whole shell line without a shell
> 
> Let’s make it bullet-proof and still tracked by systemd.
> 
> ## Final, clean unit (no renames, no junk)
> 
> 1) Import GUI env once at login (add to your i3 config):
> ```bash
> # ~/.config/i3/config
> exec_always --no-startup-id systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS XDG_RUNTIME_DIR
> ```
> 
> 2) Use a shell in `ExecStart` so quoting/expansions are legal, and `exec` to replace the shell so systemd tracks Synergy’s PID:
> 
> ```ini
> # ~/.config/systemd/user/synergy.service
> [Unit]
> Description=Synergy UI
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> # Synergy’s .desktop says Exec=/opt/Synergy/synergy %U
> # Field codes like %U are for desktop launchers; drop them here.
> # Use a shell so this cannot hit 203/EXEC due to parsing.
> ExecStart=/bin/sh -lc 'cd /opt/Synergy && exec ./synergy'
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Then:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy.service
> journalctl --user -u synergy.service -b -f
> ```
> 
> ## Why this fixes your exact failure
> - `203/EXEC` happens **before** your program runs. It’s not about CLI args. Using `/bin/sh -lc 'exec …'` guarantees systemd can execute the shell, and then the shell `exec`s Synergy so the main PID is Synergy (tracked, restartable).
> - Dropping `%U` is correct; that token is a desktop-entry thing, not a systemd thing.
> - `cd /opt/Synergy` guards against apps that expect resources relative to their binary (Electron apps usually don’t need it, but it removes that whole class of weirdness).
> 
> ## 10-second sanity checks (if it still flaps)
> Run these in the same terminal where Synergy works via `gio`:
> 
> ```bash
> # 1) Does the binary exist and is it executable?
> ls -l /opt/Synergy/synergy
> # 2) Can your user exec it directly?
> /opt/Synergy/synergy & disown
> # 3) Any missing loaders/libs?
> ldd /opt/Synergy/synergy | grep -i "not found" || echo "libs OK"
> # 4) Is DISPLAY/XAUTH set in systemd?
> systemctl --user show-environment | grep -E 'DISPLAY|WAYLAND|XAUTH|DBUS|XDG_RUNTIME_DIR'
> ```
> 
> If (1) or (2) fail: fix perms `chmod +x /opt/Synergy/synergy`. 
> If (3) shows “not found”: you’ve got a loader/lib issue unrelated to arguments. 
> If (4) is empty: the i3 `import-environment` line didn’t run—fix that and `systemctl --user restart synergy`.
> 
> ### Extra mile (optional)
> If you really want to **read the Exec from the .desktop** automatically so it never drifts, this works and still stays tracked:
> 
> ```ini
> ExecStart=/bin/sh -lc 'exec "$(awk -F= "/^Exec=/{print \$2; exit}" /usr/share/applications/synergy.desktop | sed "s/ *%[fFuUdDnNickvm]//g")"'
> ```
> 
> But the static `exec ./synergy` with the working directory set is simpler and robust.
> 
> You’re good—no renames, no junk files, and `systemctl --user restart synergy` will actually do what it says.
<!-- UID: 2b915c20-9232-4be5-90f9-2f560c1d8aa6 -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:17 PM
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: /bin/sh: 35: source: not found
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: production build
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: loaded .env from: /home/err/.config/Synergy/.env
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: .env file parsed: {}
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: sentry init, release: 3.3.1
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: removed 3 sentry integration(s)
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: changing sentry telemetry from enabled to disabled
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: [19471:0817/121615.913932:ERROR:ozone_platform_x11.cc(245)] Missing X server or $DISPLAY
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG sh[19471]: [19471:0817/121615.913958:ERROR:env.cc(258)] The platform failed to initialize. Exiting.
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=dumped, status=11/SEGV
> Aug 17 12:16:15 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'core-dump'.
> ^[Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Scheduled restart job, restart counter is at 25.
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: Started synergy.service - Synergy UI.
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: /bin/sh: 33: [[: not found
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: /bin/sh: 35: source: not found
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: production build
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: loaded .env from: /home/err/.config/Synergy/.env
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: .env file parsed: {}
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: sentry init, release: 3.3.1
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: removed 3 sentry integration(s)
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: changing sentry telemetry from enabled to disabled
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: [19525:0817/121618.421481:ERROR:ozone_platform_x11.cc(245)] Missing X server or $DISPLAY
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG sh[19525]: [19525:0817/121618.421507:ERROR:env.cc(258)] The platform failed to initialize. Exiting.
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Main process exited, code=dumped, status=11/SEGV
> Aug 17 12:16:18 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Failed with result 'core-dump'.
<!-- UID: 291a02a3-0ea2-4940-bab6-d838f173680d -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:17 PM
> Yep—two separate problems in those logs:
> 
> 1) `/bin/sh: source / [[ : not found` → the Synergy launcher script uses **bash**-isms. Don’t run it under `/bin/sh` (dash).
> 2) `Missing X server or $DISPLAY` → your **systemd-user** service doesn’t have `DISPLAY` (and possibly `XAUTHORITY`).
> 
> Here’s a clean, single-file fix that keeps the name `synergy.service`, runs the real binary under **bash**, and sets a sane X11 env. Adjust only `DISPLAY` if yours isn’t `:0`.
> 
> ## `~/.config/systemd/user/synergy.service`
> ```ini
> [Unit]
> Description=Synergy UI
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> # --- X session env (change :0 if needed) ---
> Environment=DISPLAY=:0
> Environment=XAUTHORITY=%h/.Xauthority
> # Harmless on X11; helps Electron on Wayland if you switch later
> Environment=ELECTRON_OZONE_PLATFORM_HINT=auto
> # Optional pass-throughs if your session populates them
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> 
> # Run with bash (Synergy wrapper uses `source` and `[[`).
> # Drop the desktop %U token; systemd isn’t a desktop launcher.
> ExecStart=/bin/bash -lc 'cd /opt/Synergy && exec ./synergy'
> 
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Then:
> ```bash
> # Quick check your display; if it isn't ":0", use what you see here:
> echo "$DISPLAY"
> 
> systemctl --user daemon-reload
> systemctl --user reset-failed synergy.service
> systemctl --user enable --now synergy.service
> journalctl --user -fu synergy.service
> ```
> 
> ### Why this works
> - **bash vs sh**: your earlier `/bin/sh` run barfed on `source`/`[[`. Using `/bin/bash -lc '…exec …'` solves that and keeps systemd tracking the Synergy PID.
> - **DISPLAY/XAUTHORITY**: without these, Electron prints the exact `ozone_platform_x11` error you saw. Hardcoding `:0` works on most single-seat Xorg setups; if your `echo $DISPLAY` shows `:1` (or something else), swap it in.
> 
> ---
> 
> ### Optional “right way” (no hardcoding)
> If you want it to survive X↔Wayland hops and multi-seat, import your session env at login and reference it:
> 
> 1) In your i3 config:
> ```bash
> exec_always --no-startup-id systemctl --user import-environment DISPLAY WAYLAND_DISPLAY XAUTHORITY DBUS_SESSION_BUS_ADDRESS XDG_RUNTIME_DIR
> ```
> 
> 2) Replace the two env lines in the unit with:
> ```ini
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> ```
> 
> (If you do this, restart i3 or run that `import-environment` once manually in your i3 terminal, then `systemctl --user restart synergy`.)
> 
> ---
> 
> If it still flaps, paste just these three outputs and I’ll zero in fast:
> ```bash
> echo "$DISPLAY" ; ls -l /opt/Synergy/synergy ; head -n1 /opt/Synergy/synergy
> ```
<!-- UID: 0839e950-73d6-4e4e-b56f-2257b58251a1 -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:30 PM
> I ran the import command you dingus. I reloaded i3, that ran. So it it isn't working. I even ran it manually in the terminal just to make sure. I set them all manually
> 
> ```logs
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: creating main window
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: [30880:0817/122303.499229:ERROR:bus.cc(407)] Failed to connect to the bus: Address does not contain a colon
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: [30880:0817/122303.507766:ERROR:bus.cc(407)] Failed to connect to the bus: Address does not contain a colon
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: loading start page: file:///opt/Synergy/resources/app.asar/build/index.html#/
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: [30880:0817/122303.792606:ERROR:bus.cc(407)] Failed to connect to the bus: Address does not contain a colon
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: [30880:0817/122303.795025:ERROR:bus.cc(407)] Failed to connect to the bus: Address does not contain a colon
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: broadcasting ipc message on serviceConnectionStatusChanged channel to 1 window(s)
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: sending ipc message to MainWindow
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: got request from react to send settings
> Aug 17 12:23:03 err-Stealth-16-AI-Studio-A1VGG bash[30880]: settings update not yet done, skipping
> ```
> 
> :1
> -rwxr-xr-x 1 root root 185632616 May 7 05:54 /opt/Synergy/synergy
> ELF>0@@8
>  @&%@@xx 00
> The window pops up, but it just says "waiting to install background services"
> 
> I manually fix all the vars and:
> 
> ```
> [Unit]
> Description=Synergy UI
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> # --- X session env (change :0 if needed) ---
> Environment=DISPLAY=:1
> Environment=XAUTHORITY=/run/user/1000/gdm/Xauthority
> # Harmless on X11; helps Electron on Wayland if you switch later
> Environment=ELECTRON_OZONE_PLATFORM_HINT=auto
> # Optional pass-throughs if your session populates them
> Environment=DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
> Environment=XDG_RUNTIME_DIR=/run/user/1000
> 
> # Run with bash (Synergy wrapper uses `source` and `[[`).
> # Drop the desktop %U token; systemd isn’t a desktop launcher.
> ExecStart=/bin/bash -lc 'cd /home/err && exec /opt/Synergy/synergy 1000'
> 
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> This happens, still a window staring at me "waiting to install bckground services"
> ```
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: service install/launch succeeded
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: service url: http://127.0.0.1:24803/v1/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: connecting to service: http://127.0.0.1:24803/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: initializing window manager
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: creating main window
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: loading start page: file:///opt/Synergy/resources/app.asar/build/index.html#/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: broadcasting ipc message on serviceConnectionStatusChanged channel to 1 window(s)
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: sending ipc message to MainWindow
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: got request from react to send settings
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: settings update not yet done, skipping
> ```
> 
> Now I am pretty sure that this process needs some arguement because of it's desktop file. Please actually read it.
> 
> ```
> [Desktop Entry]
> Name=Synergy
> Exec=/opt/Synergy/synergy %U
> Terminal=false
> Type=Application
> Icon=synergy
> StartupWMClass=Synergy
> Comment=Use the keyboard, mouse, or trackpad of one computer to control nearby computers.
> Categories=Utility;
> ```
> 
> It takes an argumenet %U, what is %U
<!-- UID: 713e14c8-7255-4e2d-a18a-09b5723aa662 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:30 PM
> Short version first: **`%U` is not an argument you’re supposed to supply.** It’s a **Desktop Entry field code** meaning “a list of URLs.” A desktop launcher (GNOME/KDE/`gio launch`) expands it to zero-or-more URIs before exec’ing the binary. In a systemd unit you **drop it** (or pass actual file/URL args if you had them). Relevant field codes:
> 
> - `%u` one URL, `%U` many URLs 
> - `%f` one file path, `%F` many files 
> - `%i` icon, `%c` app name, `%k` path to the `.desktop`
> 
> So `Exec=/opt/Synergy/synergy %U` just means “run Synergy, optionally with URIs if a DE hands them in.” Running `/opt/Synergy/synergy 1000` is incorrect.
> 
> ---
> 
> Now, about the “**Waiting to install background services**” while your logs say:
> 
> ```
> service install/launch succeeded
> service url: http://127.0.0.1:24803/v1/
> connecting to service: http://127.0.0.1:24803/
> ```
> 
> That message usually means the **UI can’t complete its helper/daemon setup via DBus/Polkit**, even though the local HTTP helper is up. You already fixed `$DISPLAY`/`XAUTHORITY`. The remaining landmines:
> 
> ### 1) Make sure a Polkit auth agent is actually running
> Without an agent, privileged installs silently stall. On Ubuntu+i3, the common one is `polkit-gnome`:
> 
> ```bash
> sudo apt install policykit-1-gnome
> # run once to test in your session:
> nohup /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 >/dev/null 2>&1 &
> ```
> 
> Then add to i3 so it’s always there:
> ```bash
> # ~/.config/i3/config
> exec --no-startup-id /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1
> ```
> 
> (Alternatives: `lxqt-policykit-agent`, `polkit-kde-authentication-agent-1` — use whichever you have.)
> 
> ### 2) Keep the DBus session address *exactly* right
> Your earlier error `Address does not contain a colon` was DBus-addr. The correct form is what you set:
> ```
> DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
> ```
> You can bake it into the unit or rely on `import-environment` (both fine).
> 
> ### 3) Don’t feed bashisms to `/bin/sh`
> You already switched to bash; good. Keep it.
> 
> ### 4) Let Synergy install/run its own helper; your unit should only start the UI
> Synergy’s “background service” is **not** your `synergy.service`. It’s a *separate* helper (often installed as a user/system service named something like `synergy-service`), which the UI talks to (that 127.0.0.1:24803). If you block that install (no Polkit) or it’s failing to start, the UI sits on “waiting…”.
> 
> Quick checks:
> 
> ```bash
> # Is the helper listening?
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/ # either should respond
> 
> # Did it register a unit? (check user first, then system)
> systemctl --user list-units | grep -i synergy
> systemctl list-units | grep -i synergy
> ```
> 
> If you see a `synergy-service` unit, ensure it’s active. If you don’t, the Polkit prompt likely never happened (agent missing) or the install failed — watch your journal while launching from your unit **with the agent running**:
> 
> ```bash
> journalctl --user -fu synergy.service
> ```
> 
> ---
> 
> ### Solid `synergy.service` (UI only, no guessing, no `%U`)
> Use your imported env if you’ve wired `import-environment` in i3; otherwise keep your explicit env lines.
> 
> ```ini
> # ~/.config/systemd/user/synergy.service
> [Unit]
> Description=Synergy UI
> Wants=graphical-session.target
> After=graphical-session.target
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> # If you use import-environment in i3, prefer these:
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> Environment=ELECTRON_OZONE_PLATFORM_HINT=auto
> 
> # Run under bash because Synergy’s launcher uses bashisms sometimes
> ExecStart=/bin/bash -lc 'exec /opt/Synergy/synergy'
> 
> Restart=on-failure
> RestartSec=2
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Reload/start:
> 
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy.service
> ```
> 
> ---
> 
> ### If it still says “waiting…”
> Do these three, in order, and skim the output:
> 
> ```bash
> # 1) Verify the DBus agent exists in your session
> pgrep -a polkit-gnome || echo "no polkit agent detected"
> 
> # 2) See if the helper is actually up
> ss -lntp | grep 24803 || echo "helper not listening"
> # (If not listening, the UI should pop a polkit prompt when it tries to install it — agent required.)
> 
> # 3) Look for a helper unit the UI created
> systemctl --user status synergy-service 2>/dev/null || systemctl status synergy-service 2>/dev/null || echo "no synergy-service unit found"
> ```
> 
> If there’s **no polkit agent** -> fix that and relaunch. 
> If there’s **no helper listening** and **no unit** -> the install failed; with a polkit agent you should get prompted and it’ll succeed. 
> If the **helper is listening** but UI still says “waiting” -> you’ve got UI↔helper handshake stuck; kill both and let the UI recreate:
> 
> ```bash
> pkill -f '/opt/Synergy/synergy' ; pkill -f 'synergy.*service' || true
> rm -rf ~/.config/Synergy/{Cache,GPUCache,Code\ Cache} 2>/dev/null || true
> systemctl --user restart synergy.service
> ```
> 
> ---
> 
> Bottom line: `%U` wasn’t your blocker; **DBus/Polkit** was. Get the auth agent running, keep the DBus address correct, and let Synergy create/run its own helper. Then your `synergy.service` cleanly tracks the UI and “waiting to install background services” goes away.
<!-- UID: f5a52003-4e23-4e5c-a9fd-a527e4bb8bfb -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:36 PM
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ journalctl --user -u synergy.service -b -f
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: service install/launch succeeded
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: service url: http://127.0.0.1:24803/v1/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: connecting to service: http://127.0.0.1:24803/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: initializing window manager
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: creating main window
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: loading start page: file:///opt/Synergy/resources/app.asar/build/index.html#/
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: broadcasting ipc message on serviceConnectionStatusChanged channel to 1 window(s)
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: sending ipc message to MainWindow
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: got request from react to send settings
> Aug 17 12:28:48 err-Stealth-16-AI-Studio-A1VGG bash[33270]: settings update not yet done, skipping
> ^[Aug 17 12:31:00 err-Stealth-16-AI-Studio-A1VGG bash[33270]: all windows closed, quitting app
> Aug 17 12:31:00 err-Stealth-16-AI-Studio-A1VGG bash[33270]: quitting app
> Aug 17 12:31:00 err-Stealth-16-AI-Studio-A1VGG systemd[2900]: synergy.service: Consumed 2.042s CPU time.
> ^C
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ # Is the helper listening?
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/ # either should respond
> 
> # Did it register a unit? (check user first, then system)
> systemctl --user list-units | grep -i synergy
> systemctl list-units | grep -i synergy
> curl: (7) Failed to connect to 127.0.0.1 port 24803 after 0 ms: Couldn't connect to server
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ sudo apt install policykit-1-gnome
> # run once to test in your session:
> nohup /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 >/dev/null 2>&1 &
> [sudo] password for err: 
> Reading package lists... Done
> Building dependency tree... Done
> Reading state information... Done
> The following package was automatically installed and is no longer required:
>  libnvidia-gpucomp-575:i386
> Use 'sudo apt autoremove' to remove it.
> The following NEW packages will be installed:
>  policykit-1-gnome
> 0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
> Need to get 22.4 kB of archives.
> After this operation, 139 kB of additional disk space will be used.
> Get:1 http://us.archive.ubuntu.com/ubuntu noble/universe amd64 policykit-1-gnome amd64 0.105-7ubuntu5 [22.4 kB]
> Fetched 22.4 kB in 1s (43.1 kB/s) 
> Selecting previously unselected package policykit-1-gnome.
> (Reading database ... 212093 files and directories currently installed.)
> Preparing to unpack .../policykit-1-gnome_0.105-7ubuntu5_amd64.deb ...
> Unpacking policykit-1-gnome (0.105-7ubuntu5) ...
> Setting up policykit-1-gnome (0.105-7ubuntu5) ...
> [1] 35373
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ systemctl --user daemon-reload
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ systemctl --user restart synergy.service 
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ journalctl --user -u synergy.service -b -f
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: service install/launch succeeded
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: service url: http://127.0.0.1:24803/v1/
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: connecting to service: http://127.0.0.1:24803/
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: initializing window manager
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: creating main window
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: loading start page: file:///opt/Synergy/resources/app.asar/build/index.html#/
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: broadcasting ipc message on serviceConnectionStatusChanged channel to 1 window(s)
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: sending ipc message to MainWindow
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: got request from react to send settings
> Aug 17 12:34:37 err-Stealth-16-AI-Studio-A1VGG bash[35499]: settings update not yet done, skipping
> ^C
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ ^[# 1) Verify the DBus agent exists in your session
> pgrep -a polkit-gnome || echo "no polkit agent detected"
> 
> # 2) See if the helper is actually up
> ss -lntp | grep 24803 || echo "helper not listening"
> # (If not listening, the UI should pop a polkit prompt when it tries to install it — agent required.)
> 
> # 3) Look for a helper unit the UI created
> systemctl --user status synergy-service 2>/dev/null || systemctl status synergy-service 2>/dev/null || echo "no synergy-service unit found"
> ^C
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$ # 1) Verify the DBus agent exists in your session
> pgrep -a polkit-gnome || echo "no polkit agent detected"
> 
> # 2) See if the helper is actually up
> ss -lntp | grep 24803 || echo "helper not listening"
> # (If not listening, the UI should pop a polkit prompt when it tries to install it — agent required.)
> 
> # 3) Look for a helper unit the UI created
> systemctl --user status synergy-service 2>/dev/null || systemctl status synergy-service 2>/dev/null || echo "no synergy-service unit found"
> 35373 /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1
> helper not listening
> no synergy-service unit found
> err@err-Stealth-16-AI-Studio-A1VGG:~/.config/systemd/user$
<!-- UID: 0b47daba-eba4-454b-986c-19c6052deb94 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:36 PM
> Good news: you already solved the DISPLAY/DBus parts. What’s left is **the Synergy 3 background service**. The UI is saying “installed/launched,” but nothing is actually listening on 127.0.0.1:24803 and there’s no unit. That means the helper process either isn’t being spawned or it’s crashing fast.
> 
> Also: `%U` in the desktop file is **not** a required arg. It’s a Desktop Entry field code (“list of URLs”). In a systemd unit you drop it.
> 
> Let’s pin this down and make it deterministic.
> 
> ## 0) Verify what the UI is *trying* to start
> Run these now—this will tell us the helper binary name/path so we stop guessing:
> 
> ```bash
> # Show Synergy process tree (children include the helper if it lives)
> pstree -a -p $(pidof synergy) 2>/dev/null || ps -ef | grep -i '[s]ynergy'
> 
> # Look for a helper binary in the install dir
> ls -l /opt/Synergy | grep -i 'serv\|daemon\|helper\|core' || true
> 
> # If we find a candidate, ask it for help text (often prints flags)
> for c in /opt/Synergy/*service* /opt/Synergy/*daemon* /opt/Synergy/*core* /opt/Synergy/service 2>/dev/null; do
>  echo "=== $c --help ==="; "$c" --help 2>&1 | head -n 20
> done
> ```
> 
> You’ll almost certainly see something like `/opt/Synergy/synergy-service` or `service` in that directory.
> 
> ## 1) Start the helper **manually** and see if it stays up
> Once you spot the helper path, try foreground mode:
> 
> ```bash
> # replace the path if yours differs
> /opt/Synergy/synergy-service --foreground 2>&1 | tee /tmp/synergy-service.log
> ```
> 
> If it doesn't support `--foreground`, just run it plain and see if it prints anything. In another terminal:
> 
> ```bash
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/ || echo "still down"
> ```
> 
> - If it **stays up** and 24803 responds: the UI’s auto-launch logic was failing; we’ll just run the helper ourselves under systemd.
> - If it **dies**: scroll `/tmp/synergy-service.log` for the crash reason (missing lib, permissions, etc.). Quick check: 
>  `ldd /opt/Synergy/synergy-service | grep -i 'not found' || echo 'libs OK'`
> 
> ## 2) Make the helper a real user service (tracked, before UI)
> Assuming the helper path is `/opt/Synergy/synergy-service` (change if different):
> 
> `~/.config/systemd/user/synergy-background.service`
> ```ini
> [Unit]
> Description=Synergy 3 background service (HTTP API on 127.0.0.1:24803)
> After=network.target
> 
> [Service]
> Type=simple
> ExecStart=/opt/Synergy/synergy-service --foreground
> Restart=on-failure
> RestartSec=1
> 
> [Install]
> WantedBy=default.target
> ```
> 
> Enable + start it:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy-background.service
> systemctl --user status synergy-background.service
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/
> ```
> 
> If that works, the UI will stop saying “waiting to install background services.”
> 
> ## 3) Keep your `synergy.service` for the UI (no `%U`, run under bash)
> Your current unit is mostly fine—here’s the minimal, robust form with your envs:
> 
> `~/.config/systemd/user/synergy.service`
> ```ini
> [Unit]
> Description=Synergy UI
> After=graphical-session.target synergy-background.service
> Requires=synergy-background.service
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> Environment=ELECTRON_OZONE_PLATFORM_HINT=auto
> ExecStart=/bin/bash -lc 'exec /opt/Synergy/synergy'
> Restart=on-failure
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Reload + start:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy.service
> ```
> 
> ## 4) If you *don’t* find a helper binary
> Sometimes the UI drops it under your home instead of `/opt`. Search:
> 
> ```bash
> fd -H -a -t f '(synergy.*service|service.*synergy)' ~/.local ~/.config ~/.cache ~/.local/share /opt/Synergy 2>/dev/null
> ```
> 
> If it’s not anywhere, the “install succeeded” is lying—likely because Polkit allowed a copy operation but the helper then failed to start (missing lib). In that case, capture the UI’s attempt:
> 
> ```bash
> # Kill any running Synergy UI
> pkill -f '/opt/Synergy/synergy' || true
> # Trace only exec attempts to see exactly what it tries to spawn
> strace -f -e execve -o /tmp/synergy.execve.log /opt/Synergy/synergy
> # Let it reach "waiting..." then ^C and open:
> sed -n '1,200p' /tmp/synergy.execve.log
> ```
> 
> You’ll see the exact path it tries to exec (and can turn that into the background unit).
> 
> ---
> 
> ### Recap (what mattered)
> - `%U` is a desktop field code; not an argument you supply.
> - Your env is fine now (DISPLAY/XAUTH/DBus set).
> - The blocker is the **background service** not actually running. Start it yourself as a user unit and make the UI depend on it. Then you get predictable, restartable behavior:
>  - `systemctl --user restart synergy-background`
>  - `systemctl --user restart synergy`
> 
> Drop me the output of the step **0** listing (`pstree/ls/--help`) if anything looks weird and I’ll nail the exact Exec line for your helper.
<!-- UID: abacd70f-a1c5-4bb3-95f0-49b8abc6f73d -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:40 PM
> err@err-Stealth-16-AI-Studio-A1VGG:~$ bash hack.sh 
> systemd,1 splash
>  ├─ModemManager,1442
>  │ ├─{ModemManager},1497
>  │ ├─{ModemManager},1499
>  │ └─{ModemManager},1502
>  ├─NetworkManager,1344 --no-daemon
>  │ ├─{NetworkManager},1388
>  │ ├─{NetworkManager},1391
>  │ └─{NetworkManager},1392
>  ├─accounts-daemon,1299
>  │ ├─{accounts-daemon},1384
>  │ ├─{accounts-daemon},1385
>  │ └─{accounts-daemon},1387
>  ├─agent,3525
>  │ ├─{agent},3547
>  │ ├─{agent},3548
>  │ └─{agent},3555
>  ├─at-spi-bus-laun,3524 --launch-immediately
>  │ ├─dbus-daemon,3557 --config-file=/usr/share/defaults/at-spi2/accessibility.conf --nofork --print-address 11...
>  │ ├─{at-spi-bus-laun},3542
>  │ ├─{at-spi-bus-laun},3543
>  │ ├─{at-spi-bus-laun},3546
>  │ └─{at-spi-bus-laun},3553
>  ├─at-spi2-registr,3610 --use-gnome-session
>  │ ├─{at-spi2-registr},3616
>  │ ├─{at-spi2-registr},3617
>  │ └─{at-spi2-registr},3618
>  ├─avahi-daemon,1276
>  │ └─avahi-daemon,1343
>  ├─bluetoothd,1277
>  ├─boltd,1443
>  │ ├─{boltd},1485
>  │ ├─{boltd},1486
>  │ └─{boltd},1488
>  ├─colord,2082
>  │ ├─{colord},2097
>  │ ├─{colord},2098
>  │ └─{colord},2100
>  ├─cron,1300 -f -P
>  ├─cups-browsed,2441
>  │ ├─{cups-browsed},2742
>  │ ├─{cups-browsed},2743
>  │ └─{cups-browsed},2745
>  ├─cupsd,1821 -l
>  ├─dbus-daemon,1278 --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
>  ├─emacs,4004 --daemon
>  │ ├─bash,4276
>  │ │ ├─bash,37479 hack.sh
>  │ │ │ └─pstree,37481 -a -p
>  │ │ └─polkit-gnome-au,35373
>  │ │ ├─{polkit-gnome-au},35374
>  │ │ ├─{polkit-gnome-au},35375
>  │ │ └─{polkit-gnome-au},35376
>  │ ├─{emacs},4034
>  │ ├─{emacs},4035
>  │ ├─{emacs},4036
>  │ ├─{emacs},4037
>  │ └─{emacs},4044
>  ├─evolution-alarm,3537
>  │ ├─{evolution-alarm},3635
>  │ ├─{evolution-alarm},3636
>  │ ├─{evolution-alarm},3637
>  │ ├─{evolution-alarm},3665
>  │ ├─{evolution-alarm},3666
>  │ ├─{evolution-alarm},3708
>  │ └─{evolution-alarm},3709
>  ├─fwupd,12412
>  │ ├─{fwupd},12414
>  │ ├─{fwupd},12415
>  │ ├─{fwupd},12416
>  │ ├─{fwupd},12417
>  │ └─{fwupd},12419
>  ├─gdm3,1841
>  │ ├─gdm-session-wor,2879
>  │ │ ├─gdm-x-session,3103 --register-session --run-script i3
>  │ │ │ ├─Xorg,3105 vt2 -displayfd 3 -auth /run/user/1000/gdm/Xauthority -nolisten tcp -background none -noreset -keeptty -novtswitch -verbose 3
>  │ │ │ │ ├─{Xorg},3139
>  │ │ │ │ ├─{Xorg},3140
>  │ │ │ │ ├─{Xorg},3141
>  │ │ │ │ ├─{Xorg},3142
>  │ │ │ │ └─{Xorg},3154
>  │ │ │ ├─i3,3203 -a --restart /run/user/1000/i3/restart-state.3203
>  │ │ │ │ ├─i3bar,18559 --bar_id=bar-0 --socket=/run/user/1000/i3/ipc-socket.3203
>  │ │ │ │ │ ├─sh,18563 -c i3blocks
>  │ │ │ │ │ │ └─i3blocks,18564
>  │ │ │ │ │ └─{i3bar},18562
>  │ │ │ │ ├─sh,3452 -c xss-lock --transfer-sleep-lock -- i3lock --nofork
>  │ │ │ │ │ └─xss-lock,3457 --transfer-sleep-lock -- i3lock --nofork
>  │ │ │ │ │ ├─{xss-lock},3460
>  │ │ │ │ │ ├─{xss-lock},3461
>  │ │ │ │ │ └─{xss-lock},3463
>  │ │ │ │ ├─sh,4001 -c...
>  │ │ │ │ │ └─emacsclient,4002 --alternate-editor= --create-frame
>  │ │ │ │ ├─sh,4506 -c env BAMF_DESKTOP_FILE_HINT=/var/lib/snapd/desktop/applications/firefox_firefox.desktop /snap/bin/firefox 
>  │ │ │ │ │ └─firefox,4507
>  │ │ │ │ │ ├─crashhelper,4573 4507 9 /tmp/ 10 12
>  │ │ │ │ │ │ └─{crashhelper},4574
>  │ │ │ │ │ ├─forkserver,4708 -contentproc -ipcHandle 0 -signalPipe 1 -initialChannelId {95fa8212-5e3b-4d00-a496-3f3266e23f51} -parentPid ...
>  │ │ │ │ │ │ ├─Isolated Web Co,4801
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4805
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4806
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4807
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4808
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4809
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4810
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4811
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4812
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4813
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4815
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4817
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4818
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4819
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4820
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4821
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4822
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4823
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5178
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5180
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5183
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5187
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5189
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5192
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5195
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5197
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5286
>  │ │ │ │ │ │ │ └─{Isolated Web Co},37458
>  │ │ │ │ │ │ ├─Isolated Web Co,4824
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4828
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4829
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4830
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4831
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4832
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4833
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4834
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4835
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4836
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4837
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4839
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4847
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4848
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4849
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4857
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4859
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4860
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5177
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5181
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5184
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5186
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5188
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5191
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5194
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5198
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5287
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6539
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6570
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6574
>  │ │ │ │ │ │ │ └─{Isolated Web Co},36466
>  │ │ │ │ │ │ ├─Isolated Web Co,4840
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4844
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4845
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4846
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4850
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4851
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4852
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4853
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4854
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4855
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4856
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4861
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4867
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4868
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4869
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4875
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4876
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},4877
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5179
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5182
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5185
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5190
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5193
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5196
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5199
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5200
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},5288
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6558
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6599
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},6600
>  │ │ │ │ │ │ │ └─{Isolated Web Co},6774
>  │ │ │ │ │ │ ├─Isolated Web Co,7133
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7138
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7139
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7140
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7141
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7142
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7143
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7144
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7145
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7146
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7147
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7149
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7150
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7151
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7152
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7153
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7154
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7155
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7156
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7157
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7158
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7159
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7160
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7161
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7162
>  │ │ │ │ │ │ │ ├─{Isolated Web Co},7163
>  │ │ │ │ │ │ │ └─{Isolated Web Co},9671
>  │ │ │ │ │ │ ├─Privileged Cont,4747
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4751
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4752
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4762
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4763
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4764
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4765
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4766
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4767
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4768
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4769
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4771
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4775
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4776
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4777
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4778
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4779
>  │ │ │ │ │ │ │ ├─{Privileged Cont},4780
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5260
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5261
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5262
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5263
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5264
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5265
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5266
>  │ │ │ │ │ │ │ ├─{Privileged Cont},5267
>  │ │ │ │ │ │ │ └─{Privileged Cont},5298
>  │ │ │ │ │ │ ├─RDD Process,4757
>  │ │ │ │ │ │ │ ├─{RDD Process},4760
>  │ │ │ │ │ │ │ ├─{RDD Process},4761
>  │ │ │ │ │ │ │ ├─{RDD Process},4788
>  │ │ │ │ │ │ │ ├─{RDD Process},6496
>  │ │ │ │ │ │ │ ├─{RDD Process},6497
>  │ │ │ │ │ │ │ ├─{RDD Process},6498
>  │ │ │ │ │ │ │ ├─{RDD Process},6499
>  │ │ │ │ │ │ │ ├─{RDD Process},6500
>  │ │ │ │ │ │ │ ├─{RDD Process},6501
>  │ │ │ │ │ │ │ ├─{RDD Process},6502
>  │ │ │ │ │ │ │ ├─{RDD Process},6503
>  │ │ │ │ │ │ │ ├─{RDD Process},6504
>  │ │ │ │ │ │ │ ├─{RDD Process},6505
>  │ │ │ │ │ │ │ ├─{RDD Process},6506
>  │ │ │ │ │ │ │ ├─{RDD Process},6507
>  │ │ │ │ │ │ │ ├─{RDD Process},6508
>  │ │ │ │ │ │ │ ├─{RDD Process},6509
>  │ │ │ │ │ │ │ ├─{RDD Process},6510
>  │ │ │ │ │ │ │ ├─{RDD Process},6511
>  │ │ │ │ │ │ │ ├─{RDD Process},6581
>  │ │ │ │ │ │ │ ├─{RDD Process},6582
>  │ │ │ │ │ │ │ ├─{RDD Process},6583
>  │ │ │ │ │ │ │ ├─{RDD Process},6584
>  │ │ │ │ │ │ │ ├─{RDD Process},6585
>  │ │ │ │ │ │ │ ├─{RDD Process},6586
>  │ │ │ │ │ │ │ ├─{RDD Process},6587
>  │ │ │ │ │ │ │ ├─{RDD Process},6588
>  │ │ │ │ │ │ │ ├─{RDD Process},6589
>  │ │ │ │ │ │ │ ├─{RDD Process},6590
>  │ │ │ │ │ │ │ ├─{RDD Process},6591
>  │ │ │ │ │ │ │ ├─{RDD Process},6592
>  │ │ │ │ │ │ │ ├─{RDD Process},6593
>  │ │ │ │ │ │ │ ├─{RDD Process},6594
>  │ │ │ │ │ │ │ ├─{RDD Process},6595
>  │ │ │ │ │ │ │ ├─{RDD Process},6596
>  │ │ │ │ │ │ │ ├─{RDD Process},6597
>  │ │ │ │ │ │ │ ├─{RDD Process},6598
>  │ │ │ │ │ │ │ └─{RDD Process},6923
>  │ │ │ │ │ │ ├─Socket Process,4728
>  │ │ │ │ │ │ │ ├─{Socket Process},4731
>  │ │ │ │ │ │ │ ├─{Socket Process},4732
>  │ │ │ │ │ │ │ ├─{Socket Process},4736
>  │ │ │ │ │ │ │ ├─{Socket Process},4739
>  │ │ │ │ │ │ │ └─{Socket Process},4740
>  │ │ │ │ │ │ ├─Utility Process,5669
>  │ │ │ │ │ │ │ ├─{Utility Process},5672
>  │ │ │ │ │ │ │ ├─{Utility Process},5673
>  │ │ │ │ │ │ │ ├─{Utility Process},5676
>  │ │ │ │ │ │ │ └─{Utility Process},6922
>  │ │ │ │ │ │ ├─Web Content,14655
>  │ │ │ │ │ │ │ ├─{Web Content},14659
>  │ │ │ │ │ │ │ ├─{Web Content},14660
>  │ │ │ │ │ │ │ ├─{Web Content},14661
>  │ │ │ │ │ │ │ ├─{Web Content},14662
>  │ │ │ │ │ │ │ ├─{Web Content},14663
>  │ │ │ │ │ │ │ ├─{Web Content},14664
>  │ │ │ │ │ │ │ ├─{Web Content},14665
>  │ │ │ │ │ │ │ ├─{Web Content},14666
>  │ │ │ │ │ │ │ ├─{Web Content},14667
>  │ │ │ │ │ │ │ ├─{Web Content},14668
>  │ │ │ │ │ │ │ ├─{Web Content},14670
>  │ │ │ │ │ │ │ ├─{Web Content},14671
>  │ │ │ │ │ │ │ ├─{Web Content},14672
>  │ │ │ │ │ │ │ ├─{Web Content},14673
>  │ │ │ │ │ │ │ ├─{Web Content},14674
>  │ │ │ │ │ │ │ ├─{Web Content},14675
>  │ │ │ │ │ │ │ ├─{Web Content},14676
>  │ │ │ │ │ │ │ ├─{Web Content},14677
>  │ │ │ │ │ │ │ ├─{Web Content},14678
>  │ │ │ │ │ │ │ ├─{Web Content},14679
>  │ │ │ │ │ │ │ ├─{Web Content},14680
>  │ │ │ │ │ │ │ ├─{Web Content},14681
>  │ │ │ │ │ │ │ ├─{Web Content},14682
>  │ │ │ │ │ │ │ ├─{Web Content},14683
>  │ │ │ │ │ │ │ └─{Web Content},14684
>  │ │ │ │ │ │ ├─Web Content,16591
>  │ │ │ │ │ │ │ ├─{Web Content},16595
>  │ │ │ │ │ │ │ ├─{Web Content},16596
>  │ │ │ │ │ │ │ ├─{Web Content},16597
>  │ │ │ │ │ │ │ ├─{Web Content},16598
>  │ │ │ │ │ │ │ ├─{Web Content},16599
>  │ │ │ │ │ │ │ ├─{Web Content},16600
>  │ │ │ │ │ │ │ ├─{Web Content},16601
>  │ │ │ │ │ │ │ ├─{Web Content},16602
>  │ │ │ │ │ │ │ ├─{Web Content},16603
>  │ │ │ │ │ │ │ ├─{Web Content},16604
>  │ │ │ │ │ │ │ ├─{Web Content},16606
>  │ │ │ │ │ │ │ ├─{Web Content},16607
>  │ │ │ │ │ │ │ ├─{Web Content},16608
>  │ │ │ │ │ │ │ ├─{Web Content},16609
>  │ │ │ │ │ │ │ ├─{Web Content},16610
>  │ │ │ │ │ │ │ ├─{Web Content},16611
>  │ │ │ │ │ │ │ ├─{Web Content},16612
>  │ │ │ │ │ │ │ ├─{Web Content},16613
>  │ │ │ │ │ │ │ ├─{Web Content},16614
>  │ │ │ │ │ │ │ ├─{Web Content},16615
>  │ │ │ │ │ │ │ ├─{Web Content},16616
>  │ │ │ │ │ │ │ ├─{Web Content},16617
>  │ │ │ │ │ │ │ ├─{Web Content},16618
>  │ │ │ │ │ │ │ ├─{Web Content},16619
>  │ │ │ │ │ │ │ └─{Web Content},16620
>  │ │ │ │ │ │ ├─Web Content,18340
>  │ │ │ │ │ │ │ ├─{Web Content},18344
>  │ │ │ │ │ │ │ ├─{Web Content},18345
>  │ │ │ │ │ │ │ ├─{Web Content},18346
>  │ │ │ │ │ │ │ ├─{Web Content},18347
>  │ │ │ │ │ │ │ ├─{Web Content},18348
>  │ │ │ │ │ │ │ ├─{Web Content},18349
>  │ │ │ │ │ │ │ ├─{Web Content},18350
>  │ │ │ │ │ │ │ ├─{Web Content},18351
>  │ │ │ │ │ │ │ ├─{Web Content},18352
>  │ │ │ │ │ │ │ ├─{Web Content},18353
>  │ │ │ │ │ │ │ ├─{Web Content},18355
>  │ │ │ │ │ │ │ ├─{Web Content},18356
>  │ │ │ │ │ │ │ ├─{Web Content},18357
>  │ │ │ │ │ │ │ ├─{Web Content},18358
>  │ │ │ │ │ │ │ ├─{Web Content},18359
>  │ │ │ │ │ │ │ ├─{Web Content},18360
>  │ │ │ │ │ │ │ ├─{Web Content},18361
>  │ │ │ │ │ │ │ ├─{Web Content},18362
>  │ │ │ │ │ │ │ ├─{Web Content},18363
>  │ │ │ │ │ │ │ ├─{Web Content},18364
>  │ │ │ │ │ │ │ ├─{Web Content},18365
>  │ │ │ │ │ │ │ ├─{Web Content},18366
>  │ │ │ │ │ │ │ ├─{Web Content},18367
>  │ │ │ │ │ │ │ ├─{Web Content},18368
>  │ │ │ │ │ │ │ └─{Web Content},18369
>  │ │ │ │ │ │ └─WebExtensions,5268
>  │ │ │ │ │ │ ├─{WebExtensions},5272
>  │ │ │ │ │ │ ├─{WebExtensions},5273
>  │ │ │ │ │ │ ├─{WebExtensions},5284
>  │ │ │ │ │ │ ├─{WebExtensions},5289
>  │ │ │ │ │ │ ├─{WebExtensions},5290
>  │ │ │ │ │ │ ├─{WebExtensions},5291
>  │ │ │ │ │ │ ├─{WebExtensions},5292
>  │ │ │ │ │ │ ├─{WebExtensions},5293
>  │ │ │ │ │ │ ├─{WebExtensions},5294
>  │ │ │ │ │ │ ├─{WebExtensions},5295
>  │ │ │ │ │ │ ├─{WebExtensions},5297
>  │ │ │ │ │ │ ├─{WebExtensions},5299
>  │ │ │ │ │ │ ├─{WebExtensions},5300
>  │ │ │ │ │ │ ├─{WebExtensions},5301
>  │ │ │ │ │ │ ├─{WebExtensions},5302
>  │ │ │ │ │ │ ├─{WebExtensions},5303
>  │ │ │ │ │ │ ├─{WebExtensions},5304
>  │ │ │ │ │ │ ├─{WebExtensions},5306
>  │ │ │ │ │ │ ├─{WebExtensions},5307
>  │ │ │ │ │ │ ├─{WebExtensions},5308
>  │ │ │ │ │ │ ├─{WebExtensions},5309
>  │ │ │ │ │ │ ├─{WebExtensions},5310
>  │ │ │ │ │ │ ├─{WebExtensions},5311
>  │ │ │ │ │ │ ├─{WebExtensions},5312
>  │ │ │ │ │ │ ├─{WebExtensions},5313
>  │ │ │ │ │ │ ├─{WebExtensions},5314
>  │ │ │ │ │ │ └─{WebExtensions},32211
>  │ │ │ │ │ ├─{firefox},4572
>  │ │ │ │ │ ├─{firefox},4575
>  │ │ │ │ │ ├─{firefox},4576
>  │ │ │ │ │ ├─{firefox},4577
>  │ │ │ │ │ ├─{firefox},4578
>  │ │ │ │ │ ├─{firefox},4580
>  │ │ │ │ │ ├─{firefox},4581
>  │ │ │ │ │ ├─{firefox},4582
>  │ │ │ │ │ ├─{firefox},4583
>  │ │ │ │ │ ├─{firefox},4584
>  │ │ │ │ │ ├─{firefox},4626
>  │ │ │ │ │ ├─{firefox},4627
>  │ │ │ │ │ ├─{firefox},4628
>  │ │ │ │ │ ├─{firefox},4629
>  │ │ │ │ │ ├─{firefox},4630
>  │ │ │ │ │ ├─{firefox},4631
>  │ │ │ │ │ ├─{firefox},4633
>  │ │ │ │ │ ├─{firefox},4636
>  │ │ │ │ │ ├─{firefox},4637
>  │ │ │ │ │ ├─{firefox},4639
>  │ │ │ │ │ ├─{firefox},4640
>  │ │ │ │ │ ├─{firefox},4641
>  │ │ │ │ │ ├─{firefox},4642
>  │ │ │ │ │ ├─{firefox},4643
>  │ │ │ │ │ ├─{firefox},4644
>  │ │ │ │ │ ├─{firefox},4645
>  │ │ │ │ │ ├─{firefox},4646
>  │ │ │ │ │ ├─{firefox},4649
>  │ │ │ │ │ ├─{firefox},4650
>  │ │ │ │ │ ├─{firefox},4651
>  │ │ │ │ │ ├─{firefox},4652
>  │ │ │ │ │ ├─{firefox},4653
>  │ │ │ │ │ ├─{firefox},4654
>  │ │ │ │ │ ├─{firefox},4655
>  │ │ │ │ │ ├─{firefox},4656
>  │ │ │ │ │ ├─{firefox},4657
>  │ │ │ │ │ ├─{firefox},4658
>  │ │ │ │ │ ├─{firefox},4659
>  │ │ │ │ │ ├─{firefox},4660
>  │ │ │ │ │ ├─{firefox},4661
>  │ │ │ │ │ ├─{firefox},4662
>  │ │ │ │ │ ├─{firefox},4663
>  │ │ │ │ │ ├─{firefox},4664
>  │ │ │ │ │ ├─{firefox},4665
>  │ │ │ │ │ ├─{firefox},4666
>  │ │ │ │ │ ├─{firefox},4667
>  │ │ │ │ │ ├─{firefox},4669
>  │ │ │ │ │ ├─{firefox},4670
>  │ │ │ │ │ ├─{firefox},4671
>  │ │ │ │ │ ├─{firefox},4672
>  │ │ │ │ │ ├─{firefox},4673
>  │ │ │ │ │ ├─{firefox},4674
>  │ │ │ │ │ ├─{firefox},4675
>  │ │ │ │ │ ├─{firefox},4676
>  │ │ │ │ │ ├─{firefox},4677
>  │ │ │ │ │ ├─{firefox},4678
>  │ │ │ │ │ ├─{firefox},4679
>  │ │ │ │ │ ├─{firefox},4680
>  │ │ │ │ │ ├─{firefox},4681
>  │ │ │ │ │ ├─{firefox},4682
>  │ │ │ │ │ ├─{firefox},4683
>  │ │ │ │ │ ├─{firefox},4684
>  │ │ │ │ │ ├─{firefox},4685
>  │ │ │ │ │ ├─{firefox},4687
>  │ │ │ │ │ ├─{firefox},4688
>  │ │ │ │ │ ├─{firefox},4689
>  │ │ │ │ │ ├─{firefox},4690
>  │ │ │ │ │ ├─{firefox},4691
>  │ │ │ │ │ ├─{firefox},4692
>  │ │ │ │ │ ├─{firefox},4693
>  │ │ │ │ │ ├─{firefox},4694
>  │ │ │ │ │ ├─{firefox},4695
>  │ │ │ │ │ ├─{firefox},4696
>  │ │ │ │ │ ├─{firefox},4697
>  │ │ │ │ │ ├─{firefox},4698
>  │ │ │ │ │ ├─{firefox},4699
>  │ │ │ │ │ ├─{firefox},4700
>  │ │ │ │ │ ├─{firefox},4701
>  │ │ │ │ │ ├─{firefox},4702
>  │ │ │ │ │ ├─{firefox},4703
>  │ │ │ │ │ ├─{firefox},4704
>  │ │ │ │ │ ├─{firefox},4705
>  │ │ │ │ │ ├─{firefox},4706
>  │ │ │ │ │ ├─{firefox},4707
>  │ │ │ │ │ ├─{firefox},4709
>  │ │ │ │ │ ├─{firefox},4710
>  │ │ │ │ │ ├─{firefox},4711
>  │ │ │ │ │ ├─{firefox},4712
>  │ │ │ │ │ ├─{firefox},4713
>  │ │ │ │ │ ├─{firefox},4714
>  │ │ │ │ │ ├─{firefox},4715
>  │ │ │ │ │ ├─{firefox},4716
>  │ │ │ │ │ ├─{firefox},4717
>  │ │ │ │ │ ├─{firefox},4718
>  │ │ │ │ │ ├─{firefox},4719
>  │ │ │ │ │ ├─{firefox},4720
>  │ │ │ │ │ ├─{firefox},4721
>  │ │ │ │ │ ├─{firefox},4722
>  │ │ │ │ │ ├─{firefox},4723
>  │ │ │ │ │ ├─{firefox},4724
>  │ │ │ │ │ ├─{firefox},4725
>  │ │ │ │ │ ├─{firefox},4726
>  │ │ │ │ │ ├─{firefox},4727
>  │ │ │ │ │ ├─{firefox},4738
>  │ │ │ │ │ ├─{firefox},4750
>  │ │ │ │ │ ├─{firefox},4753
>  │ │ │ │ │ ├─{firefox},4754
>  │ │ │ │ │ ├─{firefox},4755
>  │ │ │ │ │ ├─{firefox},4756
>  │ │ │ │ │ ├─{firefox},4772
>  │ │ │ │ │ ├─{firefox},4773
>  │ │ │ │ │ ├─{firefox},4774
>  │ │ │ │ │ ├─{firefox},4781
>  │ │ │ │ │ ├─{firefox},4782
>  │ │ │ │ │ ├─{firefox},4783
>  │ │ │ │ │ ├─{firefox},4784
>  │ │ │ │ │ ├─{firefox},4785
>  │ │ │ │ │ ├─{firefox},4787
>  │ │ │ │ │ ├─{firefox},4790
>  │ │ │ │ │ ├─{firefox},4794
>  │ │ │ │ │ ├─{firefox},4795
>  │ │ │ │ │ ├─{firefox},4796
>  │ │ │ │ │ ├─{firefox},4798
>  │ │ │ │ │ ├─{firefox},4799
>  │ │ │ │ │ ├─{firefox},4800
>  │ │ │ │ │ ├─{firefox},4802
>  │ │ │ │ │ ├─{firefox},4814
>  │ │ │ │ │ ├─{firefox},4825
>  │ │ │ │ │ ├─{firefox},4841
>  │ │ │ │ │ ├─{firefox},5201
>  │ │ │ │ │ ├─{firefox},5202
>  │ │ │ │ │ ├─{firefox},5204
>  │ │ │ │ │ ├─{firefox},5213
>  │ │ │ │ │ ├─{firefox},5269
>  │ │ │ │ │ ├─{firefox},5276
>  │ │ │ │ │ ├─{firefox},5285
>  │ │ │ │ │ ├─{firefox},5305
>  │ │ │ │ │ ├─{firefox},5322
>  │ │ │ │ │ ├─{firefox},5323
>  │ │ │ │ │ ├─{firefox},5674
>  │ │ │ │ │ ├─{firefox},5675
>  │ │ │ │ │ ├─{firefox},5977
>  │ │ │ │ │ ├─{firefox},6046
>  │ │ │ │ │ ├─{firefox},6354
>  │ │ │ │ │ ├─{firefox},6454
>  │ │ │ │ │ ├─{firefox},6571
>  │ │ │ │ │ ├─{firefox},6609
>  │ │ │ │ │ ├─{firefox},6610
>  │ │ │ │ │ ├─{firefox},7134
>  │ │ │ │ │ ├─{firefox},7135
>  │ │ │ │ │ ├─{firefox},8583
>  │ │ │ │ │ ├─{firefox},14656
>  │ │ │ │ │ ├─{firefox},16592
>  │ │ │ │ │ ├─{firefox},18341
>  │ │ │ │ │ ├─{firefox},33691
>  │ │ │ │ │ ├─{firefox},37247
>  │ │ │ │ │ ├─{firefox},37477
>  │ │ │ │ │ └─{firefox},37478
>  │ │ │ │ └─{i3},18545
>  │ │ │ ├─{gdm-x-session},3104
>  │ │ │ ├─{gdm-x-session},3155
>  │ │ │ └─{gdm-x-session},3156
>  │ │ ├─{gdm-session-wor},2881
>  │ │ ├─{gdm-session-wor},2882
>  │ │ └─{gdm-session-wor},2884
>  │ ├─{gdm3},1842
>  │ ├─{gdm3},1843
>  │ └─{gdm3},1844
>  ├─gnome-remote-de,1281 --system
>  │ ├─{gnome-remote-de},1407
>  │ ├─{gnome-remote-de},1408
>  │ └─{gnome-remote-de},1409
>  ├─ibus-daemon,3392 --daemonize --xim
>  │ ├─ibus-dconf,3428
>  │ │ ├─{ibus-dconf},3436
>  │ │ ├─{ibus-dconf},3437
>  │ │ ├─{ibus-dconf},3441
>  │ │ └─{ibus-dconf},3449
>  │ ├─ibus-engine-sim,3675
>  │ │ ├─{ibus-engine-sim},3676
>  │ │ ├─{ibus-engine-sim},3677
>  │ │ └─{ibus-engine-sim},3678
>  │ ├─ibus-extension-,3432
>  │ │ ├─{ibus-extension-},3566
>  │ │ ├─{ibus-extension-},3567
>  │ │ ├─{ibus-extension-},3598
>  │ │ ├─{ibus-extension-},3599
>  │ │ ├─{ibus-extension-},3604
>  │ │ └─{ibus-extension-},3684
>  │ ├─ibus-ui-gtk3,3430
>  │ │ ├─{ibus-ui-gtk3},3568
>  │ │ ├─{ibus-ui-gtk3},3569
>  │ │ ├─{ibus-ui-gtk3},3594
>  │ │ ├─{ibus-ui-gtk3},3597
>  │ │ ├─{ibus-ui-gtk3},3603
>  │ │ ├─{ibus-ui-gtk3},3611
>  │ │ └─{ibus-ui-gtk3},3630
>  │ ├─{ibus-daemon},3409
>  │ ├─{ibus-daemon},3410
>  │ └─{ibus-daemon},3411
>  ├─ibus-x11,3440 --kill-daemon
>  │ ├─{ibus-x11},3545
>  │ ├─{ibus-x11},3550
>  │ ├─{ibus-x11},3590
>  │ ├─{ibus-x11},3591
>  │ └─{ibus-x11},3595
>  ├─kerneloops,2446 --test
>  ├─kerneloops,2453
>  ├─master,2812 -w
>  │ ├─pickup,2813 -l -t unix -u -c
>  │ └─qmgr,2814 -l -t unix -u
>  ├─mongod,2443 --config /etc/mongod.conf
>  │ ├─{mongod},2530
>  │ ├─{mongod},2547
>  │ ├─{mongod},2548
>  │ ├─{mongod},2549
>  │ ├─{mongod},2550
>  │ ├─{mongod},2551
>  │ ├─{mongod},2552
>  │ ├─{mongod},2553
>  │ ├─{mongod},2592
>  │ ├─{mongod},2829
>  │ ├─{mongod},2830
>  │ ├─{mongod},2831
>  │ ├─{mongod},2832
>  │ ├─{mongod},2833
>  │ ├─{mongod},2834
>  │ ├─{mongod},2835
>  │ ├─{mongod},2836
>  │ ├─{mongod},2837
>  │ ├─{mongod},2838
>  │ ├─{mongod},2839
>  │ ├─{mongod},2840
>  │ ├─{mongod},2841
>  │ ├─{mongod},2842
>  │ ├─{mongod},2843
>  │ ├─{mongod},2844
>  │ ├─{mongod},2845
>  │ ├─{mongod},2846
>  │ ├─{mongod},2847
>  │ ├─{mongod},2848
>  │ ├─{mongod},2849
>  │ ├─{mongod},2850
>  │ ├─{mongod},2851
>  │ ├─{mongod},2856
>  │ ├─{mongod},2857
>  │ ├─{mongod},2858
>  │ ├─{mongod},2859
>  │ ├─{mongod},2860
>  │ ├─{mongod},2861
>  │ ├─{mongod},2862
>  │ ├─{mongod},2863
>  │ ├─{mongod},2864
>  │ └─{mongod},2865
>  ├─networkd-dispat,1284 /usr/bin/networkd-dispatcher --run-startup-triggers
>  ├─nm-applet,3531
>  │ ├─{nm-applet},3592
>  │ ├─{nm-applet},3593
>  │ ├─{nm-applet},3596
>  │ ├─{nm-applet},3633
>  │ └─{nm-applet},3733
>  ├─nvidia-persiste,1815 --user nvidia-persistenced --no-persistence-mode --verbose
>  ├─ollama,2444 serve
>  │ ├─{ollama},2458
>  │ ├─{ollama},2459
>  │ ├─{ollama},2460
>  │ ├─{ollama},2461
>  │ ├─{ollama},2462
>  │ ├─{ollama},2474
>  │ ├─{ollama},2475
>  │ ├─{ollama},2476
>  │ ├─{ollama},2477
>  │ ├─{ollama},2478
>  │ ├─{ollama},2479
>  │ ├─{ollama},2480
>  │ ├─{ollama},6455
>  │ └─{ollama},31662
>  ├─packagekitd,35331
>  │ ├─{packagekitd},35332
>  │ ├─{packagekitd},35333
>  │ └─{packagekitd},35334
>  ├─picom,3539
>  │ ├─{picom},3623
>  │ ├─{picom},3624
>  │ ├─{picom},3629
>  │ └─{picom},3631
>  ├─polkitd,1285 --no-debug
>  │ ├─{polkitd},1419
>  │ ├─{polkitd},1420
>  │ └─{polkitd},1421
>  ├─power-profiles-,1286
>  │ ├─{power-profiles-},1340
>  │ ├─{power-profiles-},1341
>  │ └─{power-profiles-},1347
>  ├─rsyslogd,1406 -n -iNONE
>  │ ├─{rsyslogd},1492
>  │ ├─{rsyslogd},1493
>  │ └─{rsyslogd},1494
>  ├─rtkit-daemon,1904
>  │ ├─{rtkit-daemon},1917
>  │ └─{rtkit-daemon},1918
>  ├─seatd,1288 -g video
>  ├─snapd,1295
>  │ ├─{snapd},1322
>  │ ├─{snapd},1323
>  │ ├─{snapd},1324
>  │ ├─{snapd},1325
>  │ ├─{snapd},1329
>  │ ├─{snapd},1410
>  │ ├─{snapd},1411
>  │ ├─{snapd},1412
>  │ ├─{snapd},1413
>  │ ├─{snapd},1617
>  │ ├─{snapd},1618
>  │ ├─{snapd},1619
>  │ ├─{snapd},1631
>  │ ├─{snapd},1693
>  │ ├─{snapd},1694
>  │ ├─{snapd},1695
>  │ ├─{snapd},1797
>  │ ├─{snapd},1798
>  │ ├─{snapd},1799
>  │ ├─{snapd},1803
>  │ ├─{snapd},1804
>  │ ├─{snapd},1805
>  │ ├─{snapd},1817
>  │ └─{snapd},1818
>  ├─switcheroo-cont,1303
>  │ ├─{switcheroo-cont},1356
>  │ ├─{switcheroo-cont},1357
>  │ └─{switcheroo-cont},1360
>  ├─systemd,2900 --user
>  │ ├─(sd-pam),2907
>  │ ├─dbus-daemon,2945 --session --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
>  │ ├─espanso,3793 launcher
>  │ │ ├─espanso,3802 daemon
>  │ │ │ ├─espanso,3811 worker --monitor-daemon
>  │ │ │ │ ├─{espanso},3817
>  │ │ │ │ ├─{espanso},3818
>  │ │ │ │ ├─{espanso},3819
>  │ │ │ │ ├─{espanso},3820
>  │ │ │ │ └─{espanso},3821
>  │ │ │ ├─{espanso},3804
>  │ │ │ ├─{espanso},3805
>  │ │ │ ├─{espanso},3806
>  │ │ │ ├─{espanso},3807
>  │ │ │ ├─{espanso},3808
>  │ │ │ ├─{espanso},3809
>  │ │ │ ├─{espanso},3812
>  │ │ │ └─{espanso},3813
>  │ │ └─{espanso},3794
>  │ ├─evolution-addre,3758
>  │ │ ├─{evolution-addre},3769
>  │ │ ├─{evolution-addre},3770
>  │ │ ├─{evolution-addre},3772
>  │ │ ├─{evolution-addre},3778
>  │ │ ├─{evolution-addre},3779
>  │ │ └─{evolution-addre},3786
>  │ ├─evolution-calen,3710
>  │ │ ├─{evolution-calen},3728
>  │ │ ├─{evolution-calen},3729
>  │ │ ├─{evolution-calen},3730
>  │ │ ├─{evolution-calen},3731
>  │ │ ├─{evolution-calen},3732
>  │ │ ├─{evolution-calen},3743
>  │ │ ├─{evolution-calen},3754
>  │ │ ├─{evolution-calen},3757
>  │ │ └─{evolution-calen},3760
>  │ ├─evolution-sourc,3667
>  │ │ ├─{evolution-sourc},3669
>  │ │ ├─{evolution-sourc},3670
>  │ │ ├─{evolution-sourc},3671
>  │ │ └─{evolution-sourc},3672
>  │ ├─gnome-keyring-d,2930 --foreground --components=pkcs11,secrets --control-directory=/run/user/1000/keyring
>  │ │ ├─{gnome-keyring-d},2961
>  │ │ ├─{gnome-keyring-d},2962
>  │ │ ├─{gnome-keyring-d},2963
>  │ │ └─{gnome-keyring-d},2966
>  │ ├─goa-daemon,3683
>  │ │ ├─{goa-daemon},3694
>  │ │ ├─{goa-daemon},3695
>  │ │ ├─{goa-daemon},3697
>  │ │ └─{goa-daemon},3699
>  │ ├─goa-identity-se,3702
>  │ │ ├─{goa-identity-se},3703
>  │ │ ├─{goa-identity-se},3704
>  │ │ └─{goa-identity-se},3706
>  │ ├─ibus-portal,3443
>  │ │ ├─{ibus-portal},3445
>  │ │ ├─{ibus-portal},3446
>  │ │ └─{ibus-portal},3447
>  │ ├─node,3464 server.mjs --playlist /home/err/devel/desktop/allowed.m3u --public /home/err/devel/desktop/public --port 3323 --volume 25
>  │ │ ├─node,3468 server.mjs --playlist /home/err/devel/desktop/allowed.m3u --public /home/err/devel/desktop/public --port 3323 --volume 25
>  │ │ │ ├─xwinwrap,3621 -b -s -fs -st -sp -nf -ov -fdt -- mpv -wid WID --input-ipc-server=/run/user/1000/ytwall.sock --volume=25 --idle=yes ...
>  │ │ │ │ └─mpv,3622 -wid 0x2000001 --input-ipc-server=/run/user/1000/ytwall.sock --volume=25 --idle=yes --loop-playlist=inf --shuffle --no-osc ...
>  │ │ │ │ ├─{mpv},3687
>  │ │ │ │ ├─{mpv},3688
>  │ │ │ │ ├─{mpv},3689
>  │ │ │ │ ├─{mpv},3690
>  │ │ │ │ ├─{mpv},3691
>  │ │ │ │ ├─{mpv},3693
>  │ │ │ │ ├─{mpv},3787
>  │ │ │ │ ├─{mpv},3792
>  │ │ │ │ ├─{mpv},3803
>  │ │ │ │ ├─{mpv},3855
>  │ │ │ │ ├─{mpv},3856
>  │ │ │ │ ├─{mpv},3857
>  │ │ │ │ ├─{mpv},3858
>  │ │ │ │ ├─{mpv},3859
>  │ │ │ │ ├─{mpv},3860
>  │ │ │ │ ├─{mpv},3864
>  │ │ │ │ ├─{mpv},3865
>  │ │ │ │ ├─{mpv},3866
>  │ │ │ │ ├─{mpv},11758
>  │ │ │ │ ├─{mpv},11761
>  │ │ │ │ ├─{mpv},11762
>  │ │ │ │ ├─{mpv},11763
>  │ │ │ │ └─{mpv},11764
>  │ │ │ ├─{node},3471
>  │ │ │ ├─{node},3472
>  │ │ │ ├─{node},3473
>  │ │ │ ├─{node},3474
>  │ │ │ ├─{node},3475
>  │ │ │ └─{node},3523
>  │ │ └─{node},3467
>  │ ├─pipewire,2919
>  │ │ ├─{pipewire},2972
>  │ │ └─{pipewire},2980
>  │ ├─pipewire,2920 -c filter-chain.conf
>  │ │ ├─{pipewire},2970
>  │ │ └─{pipewire},2974
>  │ ├─pipewire-pulse,2926
>  │ │ ├─{pipewire-pulse},2976
>  │ │ └─{pipewire-pulse},2983
>  │ ├─snap,4866 userd
>  │ │ ├─{snap},4870
>  │ │ ├─{snap},4871
>  │ │ ├─{snap},4872
>  │ │ ├─{snap},4873
>  │ │ ├─{snap},4874
>  │ │ ├─{snap},4878
>  │ │ ├─{snap},4879
>  │ │ ├─{snap},4880
>  │ │ ├─{snap},4881
>  │ │ ├─{snap},7380
>  │ │ ├─{snap},8027
>  │ │ └─{snap},14365
>  │ ├─snapd-desktop-i,3335
>  │ │ └─snapd-desktop-i,3423
>  │ │ ├─{snapd-desktop-i},3736
>  │ │ ├─{snapd-desktop-i},3737
>  │ │ ├─{snapd-desktop-i},3738
>  │ │ ├─{snapd-desktop-i},3739
>  │ │ ├─{snapd-desktop-i},3740
>  │ │ ├─{snapd-desktop-i},3741
>  │ │ ├─{snapd-desktop-i},3742
>  │ │ ├─{snapd-desktop-i},3744
>  │ │ ├─{snapd-desktop-i},3745
>  │ │ ├─{snapd-desktop-i},3746
>  │ │ ├─{snapd-desktop-i},3747
>  │ │ ├─{snapd-desktop-i},3748
>  │ │ ├─{snapd-desktop-i},3749
>  │ │ ├─{snapd-desktop-i},3750
>  │ │ ├─{snapd-desktop-i},3751
>  │ │ ├─{snapd-desktop-i},3752
>  │ │ ├─{snapd-desktop-i},3753
>  │ │ ├─{snapd-desktop-i},3764
>  │ │ ├─{snapd-desktop-i},3765
>  │ │ ├─{snapd-desktop-i},3766
>  │ │ ├─{snapd-desktop-i},3767
>  │ │ └─{snapd-desktop-i},3768
>  │ ├─wireplumber,2925
>  │ │ ├─{wireplumber},2971
>  │ │ ├─{wireplumber},2977
>  │ │ ├─{wireplumber},2978
>  │ │ ├─{wireplumber},2985
>  │ │ └─{wireplumber},2988
>  │ └─xdg-desktop-por,3632
>  │ ├─{xdg-desktop-por},3650
>  │ ├─{xdg-desktop-por},3651
>  │ ├─{xdg-desktop-por},3652
>  │ └─{xdg-desktop-por},3661
>  ├─systemd-journal,493
>  ├─systemd-logind,1311
>  ├─systemd-oomd,1106
>  ├─systemd-resolve,1107
>  ├─systemd-timesyn,1108
>  │ └─{systemd-timesyn},1216
>  ├─systemd-udevd,577
>  ├─thermald,1312 --systemd --dbus-enable --adaptive
>  │ ├─{thermald},1334
>  │ ├─{thermald},1338
>  │ ├─{thermald},1345
>  │ └─{thermald},1819
>  ├─udisksd,1313
>  │ ├─{udisksd},1348
>  │ ├─{udisksd},1350
>  │ ├─{udisksd},1352
>  │ ├─{udisksd},1445
>  │ └─{udisksd},1509
>  ├─unattended-upgr,1824 /usr/share/unattended-upgrades/unattended-upgrade-shutdown --wait-for-signal
>  │ └─{unattended-upgr},1839
>  ├─update-notifier,3556
>  │ ├─{update-notifier},3600
>  │ ├─{update-notifier},3601
>  │ ├─{update-notifier},3602
>  │ ├─{update-notifier},3607
>  │ └─{update-notifier},3839
>  ├─upowerd,1639
>  │ ├─{upowerd},1645
>  │ ├─{upowerd},1646
>  │ └─{upowerd},1647
>  └─wpa_supplicant,1346 -u -s -O DIR=/run/wpa_supplicant GROUP=netdev
> -rwxr-xr-x 1 root root 2386248 May 7 05:54 synergy-core
> -rwxr-xr-x 1 root root 103877760 May 7 05:51 synergy-service
> hack.sh: line 9: syntax error near unexpected token `2'
> hack.sh: line 9: `for c in /opt/Synergy/*service* /opt/Synergy/*daemon* /opt/Synergy/*core* /opt/Synergy/service 2>/dev/null; do'
<!-- UID: 5b2e6138-c63f-4dba-a963-6344ec30fce1 -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:40 PM
> Perfect—now we know the pieces:
> 
> - You’ve got **/opt/Synergy/synergy** (Electron UI)
> - You’ve got **/opt/Synergy/synergy-service** (the HTTP helper that should bind 127.0.0.1:24803)
> - UI says “install/launch succeeded” but nothing listens on 24803 ⇒ helper isn’t actually running.
> 
> `%U` in the desktop file is not an argument you supply. It’s a desktop field code (list of URLs). Forget it.
> 
> Let’s stop letting the UI “install/launch” magic and just run the helper ourselves as a tracked user service, then start the UI against it.
> 
> ---
> 
> # 1) Prove the helper runs (or see why it dies)
> 
> Run these **exactly** (bash):
> 
> ```bash
> # Does the binary run at all?
> /opt/Synergy/synergy-service --version 2>&1 || true
> 
> # Try in foreground (if it supports a console mode it’ll stay attached)
> /opt/Synergy/synergy-service 2>&1 | tee /tmp/synergy-service.log &
> sleep 1
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/ || echo "still down"
> 
> # If it exits immediately, check for missing libs:
> ldd /opt/Synergy/synergy-service | grep -i "not found" || echo "libs OK"
> ```
> 
> If you get “not found”, install the missing libs; otherwise we’ll supervise it with systemd.
> 
> (Your earlier `for c in … 2>/dev/null` syntax error was just `dash` choking on redirection in the list. Put redirection at the **end** or run under bash. Example:)
> 
> ```bash
> for c in /opt/Synergy/*service* /opt/Synergy/*daemon* /opt/Synergy/*core* /opt/Synergy/service; do
>  [ -e "$c" ] || continue
>  echo "=== $c --help ==="
>  "$c" --help 2>&1 | head -n 20 || true
> done 2>/dev/null
> ```
> 
> ---
> 
> # 2) Make the helper a real user service
> 
> `~/.config/systemd/user/synergy-background.service`
> ```ini
> [Unit]
> Description=Synergy 3 background service (127.0.0.1:24803)
> After=network.target
> 
> [Service]
> Type=simple
> # If it supports a foreground flag, use it. If not, plain is fine.
> ExecStart=/opt/Synergy/synergy-service
> Restart=on-failure
> RestartSec=1
> 
> [Install]
> WantedBy=default.target
> ```
> 
> Enable + start + verify:
> 
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy-background.service
> systemctl --user status synergy-background.service --no-pager
> ss -lntp | grep 24803 || curl -sS http://127.0.0.1:24803/v1/ || echo "still down"
> ```
> 
> If it flaps, `journalctl --user -u synergy-background.service -f` will show why. If it refuses to bind, also try:
> 
> ```bash
> /opt/Synergy/synergy-service --help 2>&1 | sed -n '1,80p'
> ```
> 
> (If there’s a `--data-dir` or similar, point it at `~/.config/Synergy`.)
> 
> ---
> 
> # 3) Start the UI after the helper
> 
> Keep your env; drop any bogus arguments:
> 
> `~/.config/systemd/user/synergy.service`
> ```ini
> [Unit]
> Description=Synergy UI
> After=graphical-session.target synergy-background.service
> Requires=synergy-background.service
> PartOf=graphical-session.target
> 
> [Service]
> Type=simple
> Environment=DISPLAY=%E{DISPLAY}
> Environment=WAYLAND_DISPLAY=%E{WAYLAND_DISPLAY}
> Environment=XAUTHORITY=%E{XAUTHORITY}
> Environment=DBUS_SESSION_BUS_ADDRESS=%E{DBUS_SESSION_BUS_ADDRESS}
> Environment=XDG_RUNTIME_DIR=%E{XDG_RUNTIME_DIR}
> Environment=ELECTRON_OZONE_PLATFORM_HINT=auto
> ExecStart=/bin/bash -lc 'exec /opt/Synergy/synergy'
> Restart=on-failure
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> 
> Reload + go:
> 
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now synergy.service
> ```
> 
> The UI should **immediately** stop saying “waiting to install background services” once `curl http://127.0.0.1:24803/v1/` answers.
> 
> ---
> 
> ## If the helper still won’t stick
> 
> Two fast knives:
> 
> 1) **Missing libs** (fix via `ldd` output).
> 2) **Wrong path** (some builds tuck the helper somewhere else). Find it:
>  ```bash
>  fd -H -a -t f '(synergy.*service|service.*synergy)' ~/.config ~/.local ~/.cache ~/.local/share /opt/Synergy 2>/dev/null
>  ```
> 
> Worst case, trace what the UI tries to exec:
> 
> ```bash
> pkill -f '/opt/Synergy/synergy' || true
> strace -f -e execve -o /tmp/synergy.execve.log /opt/Synergy/synergy
> # wait till "waiting..." shows, then ^C and inspect:
> grep -oP 'execve\("\K[^"]+' /tmp/synergy.execve.log | sort -u
> ```
> 
> Paste the helper path/flags it attempts; we’ll wire that exact thing into `synergy-background.service`.
> 
> ---
> 
> You’re 90% there. The only real blocker now is getting **`synergy-service`** alive under your user. Once 24803 is hot, your `synergy.service` unit is already solid.
<!-- UID: 2392fdcd-081b-483f-8260-bccf12f102a5 -->

---




>[!nexus_user] **User** - 08/17/2025 at 12:48 PM
> I looked at those commands in it's logs... and it kinda looked like the command was it's self trying to start some synergy user service with the same name I was using... so I renamed it, and it started to work... Where else can a user service live? Because I don't see a synergy service in my `~/.config/systemd/user` folder...
<!-- UID: 1e6c8237-6267-4d7b-a057-5fd5dbb9e34f -->




>[!nexus_agent] **Assistant** - 08/17/2025 at 12:48 PM
> Yep — there are a bunch of places a **user** unit can come from, and many of them aren’t `~/.config/systemd/user`. That’s why you saw a name collision.
> 
> ## Where a *user* unit can live (and how to find it)
> 
> ### On-disk (persistent)
> Order of precedence, top overrides bottom:
> 
> - `~/.config/systemd/user/` ← your per-user config 
> - `~/.local/share/systemd/user/` ← per-user *data* dir (XDG_DATA_HOME) 
> - `/etc/systemd/user/` ← admin-provided user units 
> - `/usr/local/lib/systemd/user/` ← site-wide 
> - `/usr/lib/systemd/user/` **or** `/lib/systemd/user/` ← vendor/packaged (Debian/Ubuntu usually `/lib`, which is a symlink to `/usr/lib` on merged-/usr systems)
> 
> ### Runtime/generated (ephemeral)
> - `/run/user/1000/systemd/transient/` ← created by `systemd-run --user …` or via the DBus API (apps can do this) 
> - `/run/user/1000/systemd/generator/` and `generator.late/` ← created at login by *generators* (e.g., XDG autostart → units) 
> 
> ### DBus activation glue (not units, but can **start** units)
> - `/usr/share/dbus-1/services/` and `~/.local/share/dbus-1/services/` 
>  If a `.service` file contains `SystemdService=synergy.service`, dbus-broker asks systemd-user to start that unit even if you never created it manually.
> 
> ---
> 
> ## One-liners to identify exactly which one you collided with
> 
> ```bash
> # 1) Show the real source path of the unit that claims the name:
> systemctl --user show 'synergy.service' -p FragmentPath -p LoadState -p UnitFileState -p DropInPaths
> 
> # 2) Dump the unit and let systemd tell you the path in the header:
> systemctl --user cat 'synergy.service'
> 
> # 3) Scan all standard dirs for anything Synergy-related:
> for d in \
>  ~/.config/systemd/user ~/.local/share/systemd/user \
>  /etc/systemd/user /usr/local/lib/systemd/user /usr/lib/systemd/user /lib/systemd/user \
>  /run/user/$UID/systemd/transient /run/user/$UID/systemd/generator /run/user/$UID/systemd/generator.late
> do
>  ls -l "$d" 2>/dev/null | grep -i 'synergy' && echo "== from $d =="
> done
> 
> # 4) Check if DBus is wired to start a systemd unit named synergy.service:
> grep -R "SystemdService=.*synergy" /usr/share/dbus-1/services ~/.local/share/dbus-1/services 2>/dev/null
> ```
> 
> Interpretation tips:
> - **`FragmentPath=`** points to the file that defined the unit. 
>  - If it’s under `/run/user/…/transient/` → a **transient** unit was created at runtime (apps can do that). 
>  - If it’s under `/run/user/…/generator…/` → a generator synthesized it (often from an XDG autostart `.desktop`). 
>  - If it’s `/lib` or `/usr/lib` → a **packaged** unit exists (vendor). 
> - **`systemctl --user cat`** prints the file path at the top as a comment — quickest way to see provenance.
> 
> ---
> 
> ## How to avoid the collision cleanly (pick one)
> 
> - **Let “synergy.service” belong to the vendor/helper**, and name your UI unit `synergy-ui.service`. Then create an umbrella target so you still get a single handle:
> 
>  `~/.config/systemd/user/synergy.target`
>  ```ini
>  [Unit]
>  Description=Synergy stack
>  Wants=synergy.service synergy-ui.service
>  After=graphical-session.target synergy.service
>  ```
> 
>  Now you can `systemctl --user enable --now synergy.target` and control both with one name.
> 
> - If you **insist** on keeping your UI as `synergy.service`, you must ensure the vendor/helper uses **another** name. Two ways:
>  1) If the vendor ships a unit file, **alias** it: create
>  `~/.config/systemd/user/synergy-background.service` as a symlink to the vendor file (or copy it), then `systemctl --user enable synergy-background.service`. If the app *starts* `synergy.service` by name via DBus, this won’t help; see (2).
>  2) If the app requests `synergy.service` explicitly (common), keep your UI named `synergy-ui.service` and **don’t** mask the vendor one. That’s the least-pain path.
> 
> Masking the vendor `synergy.service` (`systemctl --user mask`) will only make the app fail to start its helper — you’ve already seen the fallout (“waiting to install background services”).
> 
> ---
> 
> If you paste the output of:
> 
> ```bash
> systemctl --user show synergy.service -p FragmentPath,LoadState,UnitFileState,DropInPaths
> ```
> 
> I’ll tell you **exactly** which bucket it came from (vendor, transient, generator, etc.) and we’ll pin a final naming scheme that won’t bite you later. Does that map line up with what you’re seeing?
<!-- UID: befae223-d567-4856-a8c3-644dc531fbc2 -->

---


