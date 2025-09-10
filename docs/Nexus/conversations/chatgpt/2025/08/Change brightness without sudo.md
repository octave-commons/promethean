---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Change brightness without sudo"
conversation_id: 68a47a9a-22f4-8327-ba14-ece6a6d13d03
create_time: 08/19/2025 at 8:22 AM
update_time: 08/19/2025 at 8:53 AM
---

# Title: Change brightness without sudo

Created: 08/19/2025 at 8:22 AM
Last Updated: 08/19/2025 at 8:53 AM
Chat URL: https://chat.openai.com/c/68a47a9a-22f4-8327-ba14-ece6a6d13d03


>[!nexus_user] **User** - 08/19/2025 at 8:22 AM
> How can I change the brightness without using sudo in linux from the commandline?
<!-- UID: 52b521b2-9474-4064-8ab2-253f5233beb7 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:22 AM
> Short answer: you’ve got three sane paths, depending on what “display” you’re talking about and whether you’re on X11 or Wayland. None of these require `sudo` *when you actually change brightness*.
> 
> ---
> 
> ## 0) Quick + dirty (software dimming, X11 only)
> This scales gamma, not the panel backlight. It’s instant and needs no setup.
> 
> ```bash
> # See your output name(s)
> xrandr --current
> 
> # Dim built-in panel to 70% (replace eDP-1 with yours)
> xrandr --output eDP-1 --brightness 0.7
> 
> # Reset
> xrandr --output eDP-1 --brightness 1
> ```
> 
> Pros: no permissions dance. 
> Cons: washes colors, doesn’t save battery, doesn’t work on Wayland.
> 
> ---
> 
> ## 1) Real backlight control (laptops) — no sudo at runtime
> Use a tool that ships a udev rule so non-root users can touch `/sys/class/backlight`.
> 
> ### Option A: `brightnessctl` (recommended)
> Most distros ship it with a rule that grants write access to users in the `video` group.
> 
> ```bash
> # After it’s installed and you’re in the 'video' group (log out/in once),
> # you can do all of these with NO sudo:
> 
> # Nudge down 10%
> brightnessctl set 10%-
> 
> # Nudge up 5%
> brightnessctl set +5%
> 
> # Set absolute percentage
> brightnessctl set 35%
> 
> # If you have multiple backlight devices:
> brightnessctl -l # list
> brightnessctl -d intel_backlight set 50%
> ```
> 
> One-time setup reality check:
> - You may need to install the package and add yourself to the `video` group (that part typically *does* require sudo once). After that, you’re done typing sudo forever for brightness changes.
> 
> ### Option B: `light` (similar idea)
> ```bash
> light -U 10 # 10% darker
> light -A 5 # 5% brighter
> light -S 30 # set to 30%
> ```
> It also relies on permissions/udev once, then no sudo at runtime.
> 
> ---
> 
> ## 2) External monitors (real brightness over DDC/CI)
> Laptop backlight tools don’t touch external panels. Use DDC/CI:
> 
> ```bash
> # Probe
> ddcutil detect
> 
> # Read current brightness (VCP code 0x10)
> ddcutil getvcp 10
> 
> # Set brightness to 60 (0–100)
> ddcutil setvcp 10 60
> ```
> 
> Again, at runtime: no sudo needed *if* your user can access `/dev/i2c-*` (usually the `i2c` group + a udev rule; one-time setup).
> 
> ---
> 
> ## 3) Wayland notes
> - On wlroots compositors (sway/Hyprland), software dimming:
>  ```bash
>  wlr-randr --list
>  wlr-randr --output eDP-1 --brightness 0.7
>  ```
> - For real backlight: still use `brightnessctl`/`light` (they’re compositor-agnostic once permissions are set).
> 
> ---
> 
> ## Why not just `echo` into `/sys/.../brightness`?
> Because by default that file is root-writable only. You can make your own udev rule to change its group/mode on boot, but `brightnessctl` already ships battle-tested rules. Reinventing that wheel is busywork.
> 
> ---
> 
> ## What I’d do (practical path)
> - **Laptop panel**: install `brightnessctl`, ensure you’re in `video`, then bind keys in i3:
>  ```
>  bindsym XF86MonBrightnessUp exec --no-startup-id brightnessctl set +5%
>  bindsym XF86MonBrightnessDown exec --no-startup-id brightnessctl set 5%-
>  ```
> - **External displays**: use `ddcutil setvcp 10 …`. If your monitor’s DDC is flaky (common), fall back to software gamma (`xrandr`/`wlr-randr`) as a last resort.
> 
> No sugar-coating: the only “pure no-sudo ever” scenario is software dimming or a system that someone already set up correctly. Real hardware control without *any* root-level setup is fantasy. Do the one-time group/udev step, then you’re clean.
> 
> #linux #brightness #i3 #x11 #wayland #brightnessctl #light #ddcutil #xrandr #cli
<!-- UID: 3456d17c-bddd-49e1-83c2-2a3c16178faa -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:28 AM
> yea it's fine if it's once. I just couldn't really add it to i3 usfully if I had to use it every time.
<!-- UID: 8c08b963-cfdb-4e63-a6a7-d199f2c61938 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:28 AM
> Perfect. Do the one-time setup, then your i3 binds never need sudo.
> 
> ## One-time setup (laptop panel + external monitors)
> ```bash
> # 1) Install tools
> sudo apt install brightnessctl ddcutil # pacman: brightnessctl ddcutil; rpm: same names
> 
> # 2) Give your user access (log out/in after)
> sudo usermod -aG video,i2c $USER
> ```
> 
> ### If your distro didn’t set permissions (quick check)
> ```bash
> # Should show group 'video' and write bit 'w' on brightness:
> ls -l /sys/class/backlight/*/brightness
> ```
> If not, add minimal udev rules (once):
> ```bash
> # Backlight
> echo 'SUBSYSTEM=="backlight", GROUP="video", MODE="0664"' \
> | sudo tee /etc/udev/rules.d/90-backlight-permissions.rules
> 
> # I2C (DDC/CI for external monitors)
> echo 'KERNEL=="i2c-[0-9]*", GROUP="i2c", MODE="0660"' \
> | sudo tee /etc/udev/rules.d/90-i2c-permissions.rules
> 
> sudo udevadm control --reload
> sudo udevadm trigger -s backlight
> sudo udevadm trigger -s i2c
> ```
> 
> ## i3 bindings (no sudo at runtime)
> 
> ### Laptop panel (real backlight)
> ```i3
> # +5% / -5%
> bindsym XF86MonBrightnessUp exec --no-startup-id brightnessctl set +5%
> bindsym XF86MonBrightnessDown exec --no-startup-id brightnessctl set 5%-
> ```
> 
> ### External monitors (DDC/CI)
> Create a tiny helper so you can bump in steps for all connected displays:
> ```bash
> mkdir -p ~/.local/bin
> tee ~/.local/bin/ddc-brightness >/dev/null <<'SH'
> #!/usr/bin/env bash
> # Usage: ddc-brightness +10 | -10 | 50 (absolute)
> step="$1"
> # Read current, clamp 0..100, then set for each DDC-capable display
> for bus in $(ddcutil detect --terse 2>/dev/null | awk -F, '/i2c bus/ {print $NF}'); do
>  cur=$(ddcutil -b "$bus" getvcp 10 2>/dev/null | awk -F'current value = ' '{print $2}' | awk '{print $1}')
>  case "$step" in
>  +*|-*) tgt=$((cur + step));;
>  *) tgt=$step;;
>  esac
>  ((tgt<0)) && tgt=0
>  ((tgt>100)) && tgt=100
>  ddcutil -b "$bus" setvcp 10 "$tgt" >/dev/null 2>&1
> done
> SH
> chmod +x ~/.local/bin/ddc-brightness
> ```
> 
> Then bind in i3 (I like using Mod as a modifier so you don’t collide with laptop keys):
> ```i3
> set $mod Mod4
> bindsym $mod+XF86MonBrightnessUp exec --no-startup-id ~/.local/bin/ddc-brightness +10
> bindsym $mod+XF86MonBrightnessDown exec --no-startup-id ~/.local/bin/ddc-brightness -10
> ```
> 
> ## Fallbacks
> - X11 software dim (doesn’t save battery, but instant, no perms):
>  ```bash
>  xrandr --current
>  xrandr --output eDP-1 --brightness 0.7
>  ```
> - Wayland/wlroots (sway/Hyprland) software dim:
>  ```bash
>  wlr-randr --list
>  wlr-randr --output eDP-1 --brightness 0.7
>  ```
> 
> ## Reality check
> - After the group/udev step, brightness changes are just user-level commands. 
> - Don’t `echo` into `/sys/.../brightness` from i3—permissions and device names bite after suspend; `brightnessctl` solves that cleanly.
> 
> If you hit a weird panel/monitor, tell me the outputs of:
> ```bash
> brightnessctl -l
> ddcutil detect
> ls -l /sys/class/backlight/*/brightness
> ```
> and we’ll tailor the rule/bindings.
> 
> #linux #i3 #brightness #brightnessctl #ddcutil #udev #x11 #wayland
<!-- UID: 7192970a-5a10-4d4c-9005-61b934913f33 -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:30 AM
> Ok, so while we're talkin about i3, can you do nested modes? Like:
> ```
> mode "x" {
>  # .... stuff ....
>  mode "y" {
>  # .... stuff......
>  }
> }
> ```
<!-- UID: 71069f3d-8650-4875-a95d-fabb478b2721 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:30 AM
> Short answer: **no literal nested blocks**. i3’s config doesn’t allow a `mode` block inside another `mode` block. But you can **chain modes**: define them top-level and jump from one to another with `mode "…"` commands. That gives you “nested behavior” without nested syntax.
> 
> ## Pattern: parent → child → back
> ```i3
> # enter the top-level mode
> bindsym $mod+x mode "x"
> 
> mode "x" {
>  # do stuff in x...
>  bindsym a exec notify-send "x:a"
> 
>  # hop into the child mode
>  # (--release avoids key-stuck weirdness if you keep a modifier held)
>  bindsym --release y mode "y"
> 
>  # exit to default from x
>  bindsym Escape mode "default"
>  bindsym Return mode "default"
>  bindsym $mod+x mode "default"
> }
> 
> mode "y" {
>  # do stuff in y...
>  bindsym b exec notify-send "y:b"
> 
>  # go back “up” to x
>  bindsym Escape mode "x"
>  bindsym BackSpace mode "x"
> 
>  # or bail to default
>  bindsym Return mode "default"
> }
> ```
> 
> ### Notes that save pain
> - **Top-level only:** all `mode "…"{…}` blocks must be at the top level of the config. No braces inside braces.
> - **Use `--release`** when switching modes on a key you might still be holding. It prevents accidental re-triggers.
> - **One-shot actions:** you can auto-return after a command:
>  ```i3
>  bindsym c exec mycmd, mode "default"
>  ```
> - **Bar hint:** i3bar shows the current `mode` name; handy when you start nesting via jumps.
> 
> If you want “deep nesting,” just add more mode blocks and wire the arrows (`mode "child"`, `mode "parent"`, etc.). It’s explicit, boring, and it works.
> 
> #i3 #linux #wm #keyboard #config #productivity
<!-- UID: c21a709b-059f-41fb-b9da-d16bc9d9e7d7 -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:46 AM
> How can I set up something like macs... I think its... `Cmd + space` ot
<!-- UID: bbe0f5a7-0cee-4a6d-8546-748f9ecf0aea -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:46 AM
> Yep. Map **Cmd/Super + Space** to a launcher in i3. Two good paths:
> 
> ## A) Fast app launcher (rofi)
> 1) Install once:
> ```bash
> sudo apt install rofi
> ```
> 2) i3 config (`~/.config/i3/config`):
> ```i3
> # mac-style launcher
> set $launcher rofi -modi drun,run,window -show drun -show-icons
> 
> # this overrides the default Mod4+space binding (focus mode_toggle)
> bindsym Mod4+space exec --no-startup-id $launcher
> ```
> 3) Reload i3: `$mod+Shift+r`.
> 
> > Note: default i3 uses `$mod+space` for “focus mode_toggle.” You’re replacing it. If you still want that, rebind it to something else:
> ```i3
> bindsym $mod+Tab focus mode_toggle
> ```
> 
> ## B) Spotlight-like (indexing, files, calc)
> If you want **file search + calc + web**:
> - **Albert**: `sudo apt install albert` then:
>  ```i3
>  bindsym Mod4+space exec --no-startup-id albert toggle
>  ```
> - **Ulauncher**: install it (varies by distro), then:
>  ```i3
>  bindsym Mod4+space exec --no-startup-id ulauncher-toggle
>  ```
> 
> ## Make sure “Cmd” is actually Mod4
> Most Apple/Win “Command/Windows” keys map to **Mod4** already. If unsure:
> ```bash
> xmodmap -pm | grep -i mod4
> # or:
> xev # press Command and look for keysym (usually Super_L/Super_R)
> ```
> If it isn’t Mod4, remap via XKB or swap in the correct modifier in the `bindsym` (e.g., `Mod3+space`).
> 
> That’s it—mac-style launcher on Cmd+Space, no sudo at runtime.
> 
> #i3 #linux #rofi #albert #ulauncher #keybindings #spotlight #productivity
<!-- UID: d362a4a3-5fae-4b9a-85c2-6f0621a5144e -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:50 AM
> Ok, so the feature I liked specifically about spotlight was that if you typed in the name of a program that was already open, it would open and focus that programs window, not open a new one.
<!-- UID: 10975233-eab8-481e-811c-daddcfb2ef01 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:50 AM
> Yep—you can get that Spotlight behavior with **rofi’s combi mode**: it shows **open windows** and **applications** in one list. If the app is already open, pick its window entry and i3 will focus it (even on another workspace). If it’s not open, pick the app entry to launch.
> 
> ## Do it
> 1) Install rofi (once):
> ```bash
> sudo apt install rofi # or pacman/rpm: rofi
> ```
> 
> 2) Add to `~/.config/rofi/config.rasi`:
> ```rasi
> configuration {
>  modi: "combi,drun,run,window";
>  combi-modi: "window,drun"; /* windows first, then apps */
>  show-icons: true;
>  matching: "fuzzy";
> }
> ```
> 
> 3) Bind in i3 (`~/.config/i3/config`):
> ```i3
> # Cmd/Super + Space → Spotlight-like launcher
> bindsym Mod4+space exec --no-startup-id rofi -show combi
> ```
> 
> ### How it feels
> - Type “firefox” → you’ll see a **Firefox window** result (top) and an **app** result. 
>  - Hit **Enter** on the **window** item → focuses that Firefox window (no new instance). 
>  - If no window exists, **app** remains → launches it.
> 
> ### Tips
> - Want window switching only? Keep a second binding:
>  ```i3
>  bindsym $mod+w exec --no-startup-id rofi -show window
>  ```
> - Rofi keeps the mode order: with `combi-modi: "window,drun"`, matching **windows are listed first**, so Enter usually focuses instead of relaunching.
> - Multiple windows of the same app? You’ll see titles; pick the one you want.
> 
> If you later want hard “run-or-raise” per-app keys (no menu), we can add tiny `wmctrl`/`xdotool` bindings for, say, Firefox/Terminal. But for Spotlight-style typing, **rofi combi** is the clean solution.
> 
> #i3 #rofi #spotlight #linux #wm #productivity
<!-- UID: e8fe188e-1690-468b-996d-a17952e83f74 -->

---


