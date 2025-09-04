---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "i3 dmenu error fix"
conversation_id: 68b06164-58b8-8328-8432-935a38370af2
create_time: 08/28/2025 at 9:02 AM
update_time: 08/28/2025 at 9:03 AM
---

# Title: i3 dmenu error fix

Created: 08/28/2025 at 9:02 AM
Last Updated: 08/28/2025 at 9:03 AM
Chat URL: https://chat.openai.com/c/68b06164-58b8-8328-8432-935a38370af2


>[!nexus_user] **User** - 08/28/2025 at 9:02 AM
> state mask 0x40 with keycode 40, command "exec --no-startup-id i3-dmenu-desktop"
> ERROR: FYI: You are using i3 version 4.23 (2023-10-29)
> ERROR: Received ConfigureNotify for unknown window 0x02000000
> ERROR: Received ExposeEvent for unknown window 0x02000000
> ERROR: Received ConfigureNotify for unknown window 0x02000000
> ERROR: Received ConfigureNotify for unknown window 0x0200000a
> ERROR: Received ExposeEvent for unknown window 0x0200000a
> ERROR: Received ConfigureNotify for unknown window 0x0200000a
> ERROR: Received ConfigureNotify for unknown window 0x02000012
> ERROR: Received ConfigureNotify for unknown window 0x02000012
> ERROR: Received ConfigureNotify for unknown window 0x0200001a
> ERROR: Received ConfigureNotify for unknown window 0x0200001a
> ERROR: Received ConfigureNotify for unknown window 0x02000022
> ERROR: Received ConfigureNotify for unknown window 0x02000022
> ERROR: Received ConfigureNotify for unknown window 0x0200002a
> ERROR: Received ConfigureNotify for unknown window 0x0200002a
> ERROR: Received ConfigureNotify for unknown window 0x02000032
> ERROR: Received ConfigureNotify for unknown window 0x02000032
> ~
<!-- UID: 3e89adbb-8724-4dbe-9e0c-84d221ec108c -->




>[!nexus_agent] **Assistant** - 08/28/2025 at 9:02 AM
> Short version: those “Received *Event for unknown window 0x…” lines are i3 grumbling about **override-redirect** popups (like `dmenu`) that i3 intentionally doesn’t manage. The log level is unfortunate (“ERROR”), but it’s usually **benign**. The real question is: does anything actually break (dmenu not showing, keybind ignored, CPU spike), or are you just seeing noise?
> 
> If things work, you can ignore it. If things don’t, run through this, top-to-bottom.
> 
> # i3 + dmenu sanity checks
> 
> 1) Confirm you’re on X11 (i3 is X11; Wayland needs sway):
> ```bash
> echo "$XDG_SESSION_TYPE"
> # expect: x11
> ```
> 
> 2) Make sure `dmenu` exists (Ubuntu puts it in suckless-tools):
> ```bash
> command -v dmenu || sudo apt-get update && sudo apt-get install -y suckless-tools
> command -v i3-dmenu-desktop
> ```
> 
> 3) Try it naked from a terminal in i3:
> ```bash
> i3-dmenu-desktop --dmenu='dmenu -i' # should pop up
> ```
> If it errors, that’s your culprit (missing dmenu, PATH issues, etc.).
> 
> 4) Keybind is fine as written, but double-check duplicates:
> ```bash
> grep -n 'dmenu' ~/.config/i3/config ~/.i3/config
> ```
> Prefer this canonical bind:
> ```
> bindsym $mod+d exec --no-startup-id i3-dmenu-desktop
> ```
> 
> 5) If you previously had Synergy/Barrier running, **kill it** and retry. Those can spew X events and confuse focus:
> ```bash
> pkill -f synergy || true
> pkill -f barrier || true
> ```
> 
> # If it’s actually broken (no dmenu, weird focus, etc.)
> 
> A) Run i3 in debug for one cycle and capture the log:
> ```bash
> i3-dump-log > /tmp/i3.log 2>&1
> # press Mod+d once, then:
> tail -n +1 /tmp/i3.log | sed -n '1,200p'
> ```
> (Or `i3 -V -d all` from a nested X session if you want the full firehose.)
> 
> Look for:
> - `exec: launching` lines for `i3-dmenu-desktop`
> - any `Command failed` or `No such file or directory`
> 
> B) Test with `rofi` to isolate dmenu vs i3:
> ```bash
> sudo apt-get install -y rofi
> rofi -show drun
> # temporary bind:
> bindsym $mod+d exec --no-startup-id rofi -show drun
> i3-msg reload
> ```
> If rofi works but dmenu doesn’t, it’s a `dmenu` stack issue.
> 
> C) Compositor hiccups: if you run picom/compton, test without it:
> ```bash
> pkill -f picom || true
> # try Mod+d again
> ```
> 
> D) Fonts/locale can blank out dmenu. Try a simple font:
> ```bash
> i3-dmenu-desktop --dmenu='dmenu -fn monospace-10 -i'
> ```
> 
> E) X resources sometimes help dmenu behave:
> Create `~/.Xresources`:
> ```
> dmenu.font: monospace-10
> ```
> Then:
> ```bash
> xrdb -merge ~/.Xresources
> ```
> 
> F) Check X error log for repeats:
> ```bash
> grep -E 'i3|dmenu|Xorg' ~/.xsession-errors 2>/dev/null | tail -200
> ```
> 
> # Why those “unknown window” messages happen
> 
> - `dmenu` uses **override-redirect** windows so the WM doesn’t manage them. i3 will still receive `ConfigureNotify`/`Expose` for those XIDs and logs “unknown window”. It’s normal noise unless accompanied by failures (no popup, stuck keyboard grab, etc.).
> 
> # If you want to silence the noise (optional)
> 
> - Switch to `rofi` (it’s managed differently and generally quieter).
> - File verbosity: use `i3-dump-log` only when debugging; don’t tail verbose logs during normal use.
> - Keep Synergy/Barrier off on that box if you don’t absolutely need it.
> 
> If you give me the output of steps 2–3 and the ~20 lines around the first `exec: launching i3-dmenu-desktop` in `/tmp/i3.log`, I’ll pinpoint it further.
> 
> #hashtags
> #linux #i3 #windowmanager #dmenu #rofi #debugging
<!-- UID: e91f0366-dedc-4491-b086-d3899938b277 -->

---


