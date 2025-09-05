---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Disable i3 screen lock"
conversation_id: 689d1ba8-8a78-8325-a70f-957ae399433a
create_time: 08/13/2025 at 6:11 PM
update_time: 08/15/2025 at 9:47 AM
---

# Title: Disable i3 screen lock

Created: 08/13/2025 at 6:11 PM
Last Updated: 08/15/2025 at 9:47 AM
Chat URL: https://chat.openai.com/c/689d1ba8-8a78-8325-a70f-957ae399433a


>[!nexus_user] **User** - 08/13/2025 at 6:11 PM
> How do i i3 from locking the screen when I am using it as a second screen with synergy? I have the setting "Prevent from sleeping" on in synergy, but that isn't stopping the lock.
<!-- UID: 28446b6e-eb9f-49c4-ad9a-0e8fe41b79ea -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 6:11 PM
> Synergy’s “prevent from sleeping” only stops **suspend**; it doesn’t stop your X11 idle timer, DPMS, or whatever auto-locker you’ve got hooked in i3. Fix it at the source.
> 
> ## 1) See what’s actually locking
> Run these on the *client* box (the one acting as your second screen):
> 
> ```bash
> # Who’s doing the locking?
> pgrep -af 'xss-lock|xautolock|i3lock|light-locker|xscreensaver|gnome-screensaver'
> 
> # Is i3 starting a locker?
> grep -nE 'xss-lock|xautolock' ~/.config/i3/config ~/.i3/config 2>/dev/null
> 
> # X11 idle + DPMS status
> xset q | sed -n 's/^[ ]*timeout: *\([0-9]\+\).*/XSS timeout=\1 sec/p; s/^[ ]*DPMS is \(\w\+\).*/DPMS=\1/p; s/^[ ]*Standby: *\([0-9]\+\).*/DPMS standby=\1 sec/p'
> ```
> 
> If you see `xss-lock`/`xautolock` (very common in i3 configs), or `DPMS is Enabled`, that’s your culprit.
> 
> ## 2) Immediate “make it stop” (until next login)
> ```bash
> # kill any auto-lockers
> pkill -f xss-lock || true
> pkill -f xautolock || true
> pkill -f light-locker || true
> pkill -f xscreensaver || true
> 
> # disable X11 screensaver + DPMS blanking
> xset s off -dpms
> ```
> 
> (Keep a manual lock bind in i3, e.g. `$mod+Shift+L exec i3lock`.)
> 
> ## 3) Make it stick in i3
> Edit `~/.config/i3/config`:
> 
> ```i3
> # If you have an auto-locker, comment it out
> # exec --no-startup-id xss-lock --transfer-sleep-lock -- i3lock --nofork
> 
> # Hard-disable X11 idle + DPMS every time i3 starts (or restarts)
> exec_always --no-startup-id xset s off -dpms
> ```
> 
> Reload i3 (`$mod+Shift+c`) or restart i3.
> 
> > That’s the reliable fix: no idle-driven lock, no panel blanking, regardless of Synergy.
> 
> ## 4) Optional: a proper “caffeine” toggle (do it right)
> You probably don’t want it *always* disabled. Add a toggle you can hit before a stream:
> 
> `~/.local/bin/caffeine-toggle.sh`
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> if xset q | grep -q 'DPMS is Enabled'; then
>  xset s off -dpms
>  pkill -f xss-lock || true
>  notify-send 'Caffeine' 'ON: idle + DPMS disabled'
> else
>  xset s on +dpms
>  # restart your locker if you want it back:
>  # xss-lock --transfer-sleep-lock -- i3lock --nofork & disown
>  notify-send 'Caffeine' 'OFF: idle + DPMS restored'
> fi
> ```
> ```bash
> chmod +x ~/.local/bin/caffeine-toggle.sh
> ```
> 
> In `~/.config/i3/config`:
> ```i3
> bindsym $mod+Shift+c exec --no-startup-id ~/.local/bin/caffeine-toggle.sh
> ```
> 
> Now you can flip the behavior on demand without restarting anything.
> 
> ## 5) (Nice to have) Tie it to Synergy/Barrier
> If you run Barrier/Synergy as a client on this box, you can fire the toggle when you connect/disconnect:
> 
> - In Barrier/Synergy **Actions** (GUI): 
>  - *On switch to screen (this machine)* → run `~/.local/bin/caffeine-toggle.sh` (or a dedicated `--on` script) 
>  - *On switch away from screen* → run the toggle again (or an `--off` script)
> 
> If you don’t switch to the client often (it’s just a passive second screen), just leave caffeine ON.
> 
> ## 6) Check logind (rare, but worth verifying)
> i3 setups usually don’t lock via systemd-logind, but make sure it’s not set to lock on idle:
> 
> ```bash
> grep -E 'IdleAction|HandleLidSwitch' /etc/systemd/logind.conf
> # You generally want: IdleAction=ignore
> # If you close the lid while using it as a monitor, set HandleLidSwitch=ignore too, then:
> sudo systemctl restart systemd-logind
> ```
> 
> ---
> 
> Do the quick kill + `xset s off -dpms` now to confirm it’s solved. Then make the i3 change and add the caffeine toggle so you have control when you’re *not* using it as a second screen.
<!-- UID: 58ac7d60-68f6-4f5d-809b-134edb8ebcce -->

---


