---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Picom daemon location"
conversation_id: 68a0ff12-415c-8333-ac61-5fa5988f9ec1
create_time: 08/16/2025 at 4:58 PM
update_time: 08/16/2025 at 5:10 PM
---

# Title: Picom daemon location

Created: 08/16/2025 at 4:58 PM
Last Updated: 08/16/2025 at 5:10 PM
Chat URL: https://chat.openai.com/c/68a0ff12-415c-8333-ac61-5fa5988f9ec1


>[!nexus_user] **User** - 08/16/2025 at 4:58 PM
> Where does the picom daemon live?
<!-- UID: 0b931942-98f4-45c0-8e77-d296de5ab266 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 4:58 PM
> Short answer: on Ubuntu it’s almost always `/usr/bin/picom` (if you installed from apt). The *process* runs in your X11 session, and the *config* lives in your home under XDG.
> 
> If you want the full map:
> 
> ### Binary (where the daemon “lives” on disk)
> - Apt/distro package: `/usr/bin/picom` 
>  Verify: 
>  ```bash
>  command -v picom
>  readlink -f "$(command -v picom)"
>  dpkg -L picom | grep '/bin/picom'
>  ```
> - Built from source: usually `/usr/local/bin/picom` unless you changed `--prefix`.
> 
> ### Config (what it reads)
> Search order commonly used by picom:
> - Per-user (preferred): `~/.config/picom/picom.conf`
> - Legacy (still supported): `~/.config/compton/compton.conf` or `~/.config/compton.conf`
> - System-wide defaults: `/etc/xdg/picom/picom.conf` (or legacy `/etc/xdg/compton.conf`)
> - Force a file: `picom --config /path/to/picom.conf`
> 
> Quick check:
> ```bash
> picom --diagnostics | sed -n '1,80p' # shows some build/feature info
> ```
> 
> ### How it’s started (so you don’t fight ghosts)
> Pick **one** method; don’t mix them.
> 
> **i3 autostart (simple):**
> ```i3
> # ~/.config/i3/config
> exec --no-startup-id picom -b --config ~/.config/picom/picom.conf
> ```
> `-b` daemonizes; good when i3 spawns it.
> 
> **Systemd user service (the “right” way):**
> > Let systemd keep it in the foreground and restart on crash. Don’t pass `-b` when systemd manages it.
> 
> `~/.config/systemd/user/picom.service`
> ```ini
> [Unit]
> Description=Picom compositor
> PartOf=graphical-session.target
> After=graphical-session.target
> 
> [Service]
> ExecStart=/usr/bin/picom --config %h/.config/picom/picom.conf
> Restart=on-failure
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> Enable + start:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now picom
> systemctl --user status picom
> ```
> 
> **XDG autostart (desktop-agnostic):**
> `~/.config/autostart/picom.desktop`
> ```ini
> [Desktop Entry]
> Type=Application
> Name=Picom
> Exec=picom --config %h/.config/picom/picom.conf -b
> X-GNOME-Autostart-enabled=true
> ```
> 
> ### Process + logs (where it “lives” at runtime)
> - Find it: `pgrep -a picom` or `ps -C picom -o pid,cmd --forest`
> - Kill it cleanly: `pkill -x picom`
> - systemd-managed logs: `journalctl --user -u picom -e`
> - Plain logs: run with `--log-level info --log-file ~/.cache/picom.log`
> 
> ### Wayland footnote
> Picom is **X11-only**. If you’re in Wayland (e.g., GNOME/Wayland or Sway), picom won’t help; Sway already includes a compositor. In i3 on Xorg, picom is the right tool.
> 
> If you want me to harden your config (tearing fixes, blur exclusions, Nvidia vsync, etc.), drop your `picom.conf` and your GPU details and I’ll tune it.
<!-- UID: 3b2b4cd9-2127-41a4-a7e7-68a83e5eece8 -->

---




>[!nexus_user] **User** - 08/16/2025 at 5:01 PM
> Right... like it seems to start automaticlly with my i3, but it isn't in my i3 file, it isn't a systemd daemon. I broke it's config, and it tried to auto restart, then failed, and I don't want to have to restart my computer or log out just to get it working again.
<!-- UID: ecce6eea-d758-40c3-9265-537745440806 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 5:01 PM
> Got you. You don’t need to log out. Do this:
> 
> ## 1) Recover **now** (get a compositor back)
> ```bash
> # kill any stuck/restart-looping instance(s)
> pkill -x picom || true
> 
> # bring up a clean, known-good compositor in the background (no config)
> picom --config /dev/null -b
> ```
> Now you can edit your config safely. When ready:
> ```bash
> # test in the foreground so you see errors
> picom --config ~/.config/picom/picom.conf
> 
> # if it starts clean, replace the vanilla one:
> pkill -x picom
> picom --config ~/.config/picom/picom.conf -b
> ```
> (Or from i3: `i3-msg 'exec --no-startup-id picom --config ~/.config/picom/picom.conf -b'`)
> 
> ## 2) Figure out what’s autostarting it
> One of these is spawning picom for you; let’s identify which.
> 
> ```bash
> # who started it? (look at the parent)
> ps -o pid,ppid,cmd -C picom
> ps -p <PPID_FROM_ABOVE> -o pid,ppid,cmd
> 
> # if launched via XDG autostart, this env var is a giveaway
> tr '\0' '\n' </proc/$(pgrep -nx picom)/environ | grep DESKTOP_AUTOSTART_ID || true
> 
> # search XDG autostart .desktop files
> grep -RIn 'Exec=.*picom' /etc/xdg/autostart ~/.config/autostart 2>/dev/null
> 
> # check if i3 indirectly runs XDG autostarts via dex
> grep -RIn 'dex -a' ~/.config/i3 /etc/i3 2>/dev/null
> 
> # also scan classic session hooks
> grep -RIn 'picom' ~/.xinitrc ~/.xsession ~/.xprofile /etc/X11/Xsession.d 2>/dev/null
> ```
> 
> **If you see `DESKTOP_AUTOSTART_ID=…`** or the parent is `gnome-session-binary/xfce4-session/etc`, it’s XDG autostart. 
> **If you see `dex -a` in your i3 config**, i3 is running XDG autostarts for you. 
> **If there’s a `picom.desktop`** under `/etc/xdg/autostart` or `~/.config/autostart`, that’s the starter.
> 
> To re-run XDG autostarts *without* logging out:
> ```bash
> dex -a -s /etc/xdg/autostart:~/.config/autostart
> ```
> (If `dex` isn’t installed: `sudo apt install dex`.)
> 
> You can also do a hot i3 restart (no session logout):
> ```bash
> i3-msg restart # re-execs i3, re-runs its startup lines
> ```
> 
> ## 3) Make future restarts painless (the “right” way)
> Move picom under a **systemd user** unit and disable the .desktop autostart so you can just `systemctl --user restart picom`.
> 
> `~/.config/systemd/user/picom.service`
> ```ini
> [Unit]
> Description=Picom compositor
> PartOf=graphical-session.target
> After=graphical-session.target
> 
> [Service]
> ExecStart=/usr/bin/picom --config %h/.config/picom/picom.conf
> Restart=on-failure
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> Enable it:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now picom
> ```
> Then **mask** the XDG autostart so you don’t get duplicates:
> ```bash
> mkdir -p ~/.config/autostart
> if [ -f /etc/xdg/autostart/picom.desktop ]; then
>  cp /etc/xdg/autostart/picom.desktop ~/.config/autostart/
>  sed -i 's/^Hidden=.*/Hidden=true/; $!b; $a Hidden=true' ~/.config/autostart/picom.desktop
> fi
> ```
> Now it’s simply:
> ```bash
> systemctl --user restart picom
> journalctl --user -u picom -e # logs when debugging
> ```
> 
> ## 4) Pro tip while editing config
> Auto-reload picom on save (no logout, no i3 restart):
> ```bash
> # requires entr: sudo apt install entr
> printf '%s\n' "$HOME/.config/picom/picom.conf" | entr -r sh -c '
>  pkill -x picom || true
>  picom --config "$HOME/.config/picom/picom.conf" -b
> '
> ```
> 
> If you paste the error you saw when it “tried to auto-restart,” I’ll zero in on the broken stanza and harden your config (Intel/NVIDIA quirks, tearing/vsync, blur excludes).
<!-- UID: 2fced26a-847a-4d8f-9a94-2a8cd086b916 -->

---




>[!nexus_user] **User** - 08/16/2025 at 5:06 PM
> It's i3 running dex... I ran this command and *everything* auto started. Now I have a robot voice screaming at me.
<!-- UID: cb181b6a-6c3a-4dc3-aac5-b76831dbeadb -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 5:07 PM
> lol ok, kill the siren first, then we’ll make sure dex never “start-everything.exe”s you again.
> 
> ## 0) Hard-mute now
> ```bash
> # Instantly mute all speakers
> pactl set-sink-mute @DEFAULT_SINK@ 1
> ```
> 
> ## 1) Find the screamer and kill it
> ```bash
> # See which app is making sound (name + PID)
> pactl list sink-inputs | awk -v RS= '
> /application.name/ && /application.process.id/ {
>  match($0,/application.name = "(.*)"/,n);
>  match($0,/application.process.id = "(.*)"/,p);
>  printf "APP=%-30s PID=%s\n", n[1], p[1];
> }'
> 
> # Quick guesses that commonly yell (run any/all)
> for p in orca speech-dispatcher spd-say espeak espeak-ng festival; do pkill -x "$p" 2>/dev/null; done
> # Or kill a specific PID you saw above:
> kill <PID>; sleep 0.5; kill -9 <PID> 2>/dev/null
> ```
> 
> Unmute when you’re safe:
> ```bash
> pactl set-sink-mute @DEFAULT_SINK@ 0
> ```
> 
> ---
> 
> ## 2) Why that happened
> `dex -a -s /etc/xdg/autostart:~/.config/autostart` ran **every** XDG autostart entry it found. Use dex’s **dry-run** to preview, and **environment filtering** to avoid GNOME/KDE-only stuff. 
> - Dry-run: `dex -ad -v -s /etc/xdg/autostart:~/.config/autostart` 
> - Filter (pretend we’re “i3”): `dex -a -e i3 -s ...` 
> (Flags are straight from dex’s README/manpage.) citeturn1view0 
> Arch’s XDG Autostart page: use `Hidden=true` to disable entries and `dex -ad` to list them. cite
> 
> ---
> 
> ## 3) Disable the offenders so they never autostart again
> Per XDG spec you **override system entries** by copying them into `~/.config/autostart/` and adding `Hidden=true`. (This is the clean way to “mask” a desktop entry.) cite
> ```bash
> mkdir -p ~/.config/autostart
> 
> # Example: silence Orca (screen reader) and Speech Dispatcher if they appeared
> for f in orca-autostart.desktop speech-dispatcher.desktop; do
>  [ -f /etc/xdg/autostart/$f ] || continue
>  cp /etc/xdg/autostart/$f ~/.config/autostart/$f
>  # ensure Hidden=true exists (append if missing)
>  grep -q '^Hidden=' ~/.config/autostart/$f \
>  && sed -i 's/^Hidden=.*/Hidden=true/' ~/.config/autostart/$f \
>  || printf '\nHidden=true\n' >> ~/.config/autostart/$f
> done
> ```
> 
> > Tip: run `dex -ad -v -s /etc/xdg/autostart:~/.config/autostart` to get the exact filenames to disable, then loop over those names as above. citeturn1view0
> 
> ---
> 
> ## 4) Rerun only what you actually wanted (picom)
> ```bash
> pkill -x picom 2>/dev/null || true
> picom --config ~/.config/picom/picom.conf -b
> ```
> 
> ---
> 
> ## 5) Make dex safe (or stop using it)
> 
> ### Option A — keep dex but sandbox it
> Replace your i3 autostart line with a **filtered** + **dry-run-first** approach:
> 
> ```i3
> # Preview (log to ~/.cache/dex.preview) so you see what *would* run after each i3 restart
> exec --no-startup-id sh -lc 'mkdir -p ~/.cache; dex -ad -v -s /etc/xdg/autostart:~/.config/autostart >~/.cache/dex.preview 2>&1'
> 
> # Real run, but pretend DE "i3" so GNOME/KDE-only entries are skipped
> exec --no-startup-id dex -a -e i3 -s /etc/xdg/autostart:~/.config/autostart
> ```
> Dex’s `-e` applies DE filters like `OnlyShowIn`/`NotShowIn`. Anything still too “generic” gets blocked by those `Hidden=true` overrides you added. citeturn1view0
> 
> ### Option B — retire dex; let systemd manage specific apps (my recommendation)
> - Put **picom**, **nm-applet**, etc. under **systemd user** units and remove dex from i3 entirely. Then you can cleanly `systemctl --user restart picom` without chaos.
> - (Bonus: newer distros can even have systemd run XDG autostart entries in a managed way via `systemd-xdg-autostart-generator`, but going full systemd for just the few things you want is simpler.) cite
> 
> ---
> 
> ## 6) Power-user quality-of-life
> A tiny helper so you never get jump-scared again:
> 
> ```bash
> # ~/.local/bin/dex-choose (chmod +x)
> #!/usr/bin/env bash
> set -euo pipefail
> SEARCH="/etc/xdg/autostart:~/.config/autostart"
> # preview list, pick with fzf, then run selected entries
> dex -ad -v -s "$SEARCH" \
> | awk '{print $NF}' \
> | fzf --multi --prompt="Pick autostarts to run> " \
> | xargs -r dex -v
> ```
> 
> Now you can start **only** the entries you select:
> ```
> dex-choose
> ```
> 
> ---
> 
> If you want, paste the **`dex -ad -v`** output and we’ll nuke the exact .desktop files that yelled. After that, move picom to a user systemd unit and you’ll never have to log out to recover it again.
<!-- UID: eddd657e-cd09-42ae-8739-c9f7059794dd -->

---




>[!nexus_user] **User** - 08/16/2025 at 5:09 PM
> screen reader...
<!-- UID: 27474db5-f8fe-445c-a57c-804656124ef1 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 5:09 PM
> Yep—classic **Orca + Speech Dispatcher**. Here’s the clean, reversible way to kill it now and make sure it never comes back via `dex` or elsewhere.
> 
> ## 0) Silence + stop it right now
> ```bash
> # hard mute so you can think
> pactl set-sink-mute @DEFAULT_SINK@ 1
> 
> # kill usual TTS culprits
> for p in orca speech-dispatcher spd-say espeak espeak-ng festival; do
>  pkill -x "$p" 2>/dev/null || true
> done
> ```
> 
> Unmute when safe:
> ```bash
> pactl set-sink-mute @DEFAULT_SINK@ 0
> ```
> 
> ## 1) Prevent autostart (XDG spec way)
> Mask the XDG autostarts by shadowing them in `~/.config/autostart` with `Hidden=true`. This survives restarts and plays well with i3/dex.
> 
> ```bash
> mkdir -p ~/.config/autostart
> 
> # Copy any relevant system entries then force-hide them
> for f in /etc/xdg/autostart/orca-autostart.desktop \
>  /etc/xdg/autostart/speech-dispatcher.desktop; do
>  [ -f "$f" ] || continue
>  base="$(basename "$f")"
>  cp "$f" ~/.config/autostart/"$base"
>  if grep -q '^Hidden=' ~/.config/autostart/"$base"; then
>  sed -i 's/^Hidden=.*/Hidden=true/' ~/.config/autostart/"$base"
>  else
>  printf '\nHidden=true\n' >> ~/.config/autostart/"$base"
>  fi
> done
> ```
> 
> If you want to be thorough, hide *anything* whose Exec mentions speech or TTS:
> ```bash
> grep -RIl 'Exec=.*\(orca\|speech-dispatcher\|espeak\|spd-\)' /etc/xdg/autostart \
> | while read -r f; do
>  b=$(basename "$f")
>  cp "$f" ~/.config/autostart/"$b"
>  grep -q '^Hidden=' ~/.config/autostart/"$b" \
>  && sed -i 's/^Hidden=.*/Hidden=true/' ~/.config/autostart/"$b" \
>  || printf '\nHidden=true\n' >> ~/.config/autostart/"$b"
> done
> ```
> 
> ## 2) Fix your `dex` usage so it respects DE filters
> If `i3` is launching `dex -a` in your config, make it **filter by environment** so GNOME-only entries (like Orca) don’t run:
> 
> ```i3
> # ~/.config/i3/config
> # Preview what would run (for your logs):
> exec --no-startup-id sh -lc 'mkdir -p ~/.cache; dex -ad -v -s /etc/xdg/autostart:~/.config/autostart >~/.cache/dex.preview 2>&1'
> 
> # Real run, but filtered to "i3" so OnlyShowIn=GNOME stuff is skipped:
> exec --no-startup-id dex -a -e i3 -s /etc/xdg/autostart:~/.config/autostart
> ```
> 
> Then hot-restart i3 (no logout):
> ```bash
> i3-msg restart
> ```
> 
> ### Preferable: stop using dex for this
> Move the few things you actually want (picom, nm-applet, etc.) under **systemd user** units and delete the `dex` line entirely. Then you get clean restarts:
> ```bash
> systemctl --user restart picom
> ```
> 
> ## 3) Disable the user service (if it exists)
> Some distros ship a **user** unit for Speech Dispatcher:
> ```bash
> systemctl --user stop speech-dispatcher.service 2>/dev/null || true
> systemctl --user disable speech-dispatcher.service 2>/dev/null || true
> systemctl --user mask speech-dispatcher.service 2>/dev/null || true
> ```
> 
> ## 4) Nuke it from orbit (optional, reversible)
> If you never want it again, purge the packages. **Simulate first** to see what would be removed:
> ```bash
> sudo apt-get -s purge orca speech-dispatcher speech-dispatcher-audio-plugins
> # If the simulation looks safe:
> sudo apt-get purge orca speech-dispatcher speech-dispatcher-audio-plugins
> ```
> 
> ## 5) Quality-of-life: a panic button
> Drop this somewhere on your `$PATH` (e.g., `~/.local/bin/kill-speech`, `chmod +x`):
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> pactl set-sink-mute @DEFAULT_SINK@ 1
> for p in orca speech-dispatcher spd-say espeak espeak-ng festival; do
>  pkill -x "$p" 2>/dev/null || true
> done
> sleep 0.2
> pactl set-sink-mute @DEFAULT_SINK@ 0
> ```
> 
> ---
> 
> If you want to go the “right way” all the way: remove `dex` from i3, create **user** services for the exact processes you want at login (picom, kb swapper, polkit agent, nm-applet). I’ll sketch those units if you tell me which daemons you actually want.
<!-- UID: 4da3c01a-7d05-4dff-9919-369303fcafcd -->

---


