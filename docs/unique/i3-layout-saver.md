---
uuid: 150f8bb4-4322-4bb9-8a5f-9c2e3b233e05
created_at: i3-layout-saver.md
filename: i3-layout-saver
title: i3-layout-saver
description: >-
  A tiny Bash script to save current i3 workspace layout with a prompt for
  filename, using rofi/dmenu/zenity fallbacks. Saves to ~/.config/i3/layouts/
  with JSON format for later reloading.
tags:
  - i3
  - bash
  - layout
  - script
  - prompt
  - json
  - workspace
---
Yes. Do it with a tiny wrapper script + a clean keybinding. This gives you a prompt, grabs the *current* workspace, sanitizes the filename, and saves the layout JSON. ^ref-31f0166e-1-0

### 1) Script: `~/.local/bin/i3-save-layout`

```bash
#!/usr/bin/env bash
set -euo pipefail

# deps: jq (required), one of rofi|dmenu|zenity (optional)
DIR="${XDG_CONFIG_HOME:-$HOME/.config}/i3/layouts"
mkdir -p "$DIR"

# get focused workspace name (e.g., "7:dev")
WS_NAME="$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused==true) | .name')"
: "${WS_NAME:?could not detect focused workspace}"

DEFAULT_NAME="${WS_NAME// /-}"

prompt() {
  if command -v rofi >/dev/null 2>&1; then
    # prefill with default; user can edit
    printf "%s" "$DEFAULT_NAME" | rofi -dmenu -p "Save layout as"
  elif command -v dmenu >/dev/null 2>&1; then
    printf "%s" "$DEFAULT_NAME" | dmenu -p "Save layout as"
  elif command -v zenity >/dev/null 2>&1; then
    zenity --entry --title="Save i3 layout" --text="Layout name:" --entry-text="$DEFAULT_NAME"
  else
    # last-resort: tty prompt (works if you ran this from a terminal)
    read -r -p "Layout name [$DEFAULT_NAME]: " ans
    echo "${ans:-$DEFAULT_NAME}"
  fi
}

RAW_NAME="$(prompt || true)"
# if user cancels, abort quietly
[ -n "${RAW_NAME:-}" ] || exit 0

# sanitize to a safe filename: lowercase, spaces->-, drop weird chars
NAME="$(printf "%s" "$RAW_NAME" | tr '[:upper:]' '[:lower:]' \
        | sed -E 's/[^a-z0-9._-]+/-/g; s/-+/-/g; s/^-//; s/-$//')"
[ -n "$NAME" ] || { notify-send "i3 layout" "Empty name; not saved."; exit 1; }

OUT="$DIR/$NAME.json"

# write tree for the *current* workspace
i3-save-tree --workspace "$WS_NAME" > "$OUT"

# optional: success notification
command -v notify-send >/dev/null 2>&1 && notify-send "i3 layout saved" "$OUT"
echo "Saved: $OUT"
```
^ref-31f0166e-5-0
 ^ref-31f0166e-53-0
```bash
chmod +x ~/.local/bin/i3-save-layout
^ref-31f0166e-53-0
```

### 2) i3 binding (choose your key) ^ref-31f0166e-59-0

Put near your other exec bindings: ^ref-31f0166e-61-0

```i3
# Save the current workspace layout (prompts for a name)
^ref-31f0166e-61-0
bindsym $mod+Ctrl+F5 exec --no-startup-id ~/.local/bin/i3-save-layout
```
 ^ref-31f0166e-68-0
### 3) Notes & tweaks ^ref-31f0166e-69-0
 ^ref-31f0166e-70-0
* Requires `jq` (for `get_workspaces`). Install: `sudo apt install jq`.
* Prompt priority is `rofi` → `dmenu` → `zenity` → fallback to tty input if you run it from a terminal. ^ref-31f0166e-72-0
* Saved to: `~/.config/i3/layouts/<name>.json`. Use later with:

  ```i3
^ref-31f0166e-72-0
  # example: recreate a room
  bindsym $mod+Ctrl+7 exec --no-startup-id i3-msg 'workspace 7; append_layout ~/.config/i3/layouts/<name>.json'
  ```
^ref-31f0166e-79-0
 ^ref-31f0166e-81-0
  Then `exec` the apps you want to fill the placeholders (order matters). ^ref-31f0166e-81-0
 ^ref-31f0166e-82-0 ^ref-31f0166e-83-0
### Want to go harder? ^ref-31f0166e-83-0

* Add a “quick‑save” that auto‑names with timestamp: `ws-<name>-$(date +%F-%H%M%S).json`.
* Write a companion `i3-load-layout` that lists `layouts/*.json` in rofi and runs `append_layout` on the selected file. ^ref-31f0166e-87-0
* Hy version later if you want to keep the tools Lisp‑centric; for i3 IPC shells, Bash is the path of least friction. ^ref-31f0166e-87-0

Does this fit your flow, or do you want the rofi‑picker loader too?
