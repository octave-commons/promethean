---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Increase i3 lock timeout"
conversation_id: 68b3c8ab-a3f4-832c-a1d6-10d98b729e27
create_time: 08/30/2025 at 10:59 PM
update_time: 08/31/2025 at 8:09 AM
---

# Title: Increase i3 lock timeout

Created: 08/30/2025 at 10:59 PM
Last Updated: 08/31/2025 at 8:09 AM
Chat URL: https://chat.openai.com/c/68b3c8ab-a3f4-832c-a1d6-10d98b729e27


>[!nexus_user] **User** - 08/30/2025 at 10:59 PM
> increase i3 lock timeout
<!-- UID: f9d13fcc-8830-4939-9099-6b89a69c19c7 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 10:59 PM
> Got it. You’re on i3 (Xorg), so the lock delay is almost always controlled by one of these: **xss-lock + xset**, **xautolock**, or **xidlehook**. The fix is: identify which one you’re running, then bump its timeout (and keep DPMS from blanking earlier than the lock).
> 
> ## 1) See what’s actually locking
> Run these and note what shows up:
> ```bash
> pgrep -a xss-lock
> pgrep -a xautolock
> pgrep -a xidlehook
> pgrep -a i3lock
> ```
> If none of those appear, you’re probably not auto-locking (or it’s being launched by a desktop component you forgot about).
> 
> Also check current X timeouts:
> ```bash
> xset q | sed -n '1,25p' # Look at "Screen Saver" and "DPMS" sections
> ```
> 
> ## 2) If you use xss-lock (most common with i3)
> xss-lock reacts to the X **screensaver** idle timer (set by `xset s`). Increase that and align DPMS so the screen doesn’t blank first.
> 
> Add to your i3 config (`~/.config/i3/config`):
> ```bash
> # Example: lock after 15 minutes; screen blanks after 20
> exec --no-startup-id xset s 900 900 dpms 1200 1200 1200
> exec --no-startup-id xss-lock --transfer-sleep-lock -- i3lock -n -c 000000
> ```
> - `xset s 900 900` → screensaver (idle) after **900s = 15m**.
> - `dpms 1200 1200 1200` → DPMS off after **20m** so it doesn’t blank before the lock.
> 
> Reload i3: `$mod+Shift+r`. 
> Verify with `xset q` that the new values stuck.
> 
> ### Using a systemd user service for xss-lock?
> Edit `~/.config/systemd/user/xss-lock.service` (or create it):
> ```ini
> [Unit]
> Description=Lock screen on suspend/idle
> 
> [Service]
> ExecStart=/usr/bin/xss-lock --transfer-sleep-lock -- /usr/bin/i3lock -n -c 000000
> Restart=on-failure
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> Then control timeouts via i3 (above) **or** a small user service that sets xset on login:
> ```ini
> # ~/.config/systemd/user/xset-idle.service
> [Unit]
> Description=Set X idle & DPMS
> 
> [Service]
> Type=oneshot
> ExecStart=/usr/bin/xset s 900 900 dpms 1200 1200 1200
> 
> [Install]
> WantedBy=graphical-session.target
> ```
> Enable & start:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now xss-lock.service xset-idle.service
> ```
> 
> ## 3) If you use xautolock
> Increase the `-time` (minutes):
> ```bash
> # Find where you start it (i3 config or service). Example:
> exec --no-startup-id xautolock -detectsleep -time 15 -locker 'i3lock -n -c 000000'
> ```
> Also make sure DPMS doesn’t blank sooner than that:
> ```bash
> exec --no-startup-id xset dpms 1200 1200 1200
> ```
> 
> ## 4) If you use xidlehook
> Bump the `--timer` seconds:
> ```bash
> exec --no-startup-id xidlehook \
>  --not-when-fullscreen --not-when-audio \
>  --timer 900 'i3lock -n -c 000000' '' \
>  --timer 1200 'xset dpms force off' ''
> ```
> (15m to lock, 20m to power off the display.)
> 
> ## 5) Quick sanity checks
> - If you keep getting locked **earlier** than expected, DPMS is probably firing first. Make DPMS > lock timeout, or temporarily disable DPMS while testing:
>  ```bash
>  xset -dpms; xset s 900 900
>  ```
> - If lock happens **on suspend** instantly (good), but idle lock is too fast, it’s still your idle/DPMS values, not xss-lock itself.
> - GNOME power settings won’t control an i3 (Xorg) session; ignore them here.
> 
> ## 6) One-shot test (no config edits)
> Try a longer idle just for this session:
> ```bash
> xset s 1800 1800 dpms 2400 2400 2400 # 30m lock, 40m DPMS
> ```
> If that behaves correctly, make it permanent via i3 or a user service as above.
> 
> If you tell me which of the three you’re actually running (xss-lock, xautolock, or xidlehook), I’ll hand you the exact lines to paste into your config and be done with it.
> 
> #i3 #linux #i3lock #xss-lock #xautolock #xidlehook #xset #dpms
<!-- UID: 44506030-00f6-4c06-a7ba-fd03d7cb774f -->

---


