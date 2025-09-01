---
uuid: 31f0166e-4631-45fa-aecd-b44e9a13f497
created_at: 2025.08.20.09.08.89.md
filename: i3-layout-saver
description: >-
  A tiny Bash script to save current i3 workspace layout with prompt for
  filename, plus i3 binding for quick access.
tags:
  - bash
  - i3
  - workspace
  - layout
  - script
  - prompt
  - keybinding
related_to_title:
  - AI-Centric OS with MCP Layer
  - AI-First-OS-Model-Context-Protocol
  - balanced-bst
related_to_uuid:
  - 0f1f8cc1-b5a6-4307-a40d-78de3adafca2
  - 618198f4-cfad-4677-9df6-0640d8a97bae
  - d3e7db72-2e07-4dae-8920-0e07c499a1e5
references: []
---
Yes. Do it with a tiny wrapper script + a clean keybinding. This gives you a prompt, grabs the *current* workspace, sanitizes the filename, and saves the layout JSON.

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

```bash
chmod +x ~/.local/bin/i3-save-layout
```

### 2) i3 binding (choose your key)

Put near your other exec bindings:

```i3
# Save the current workspace layout (prompts for a name)
bindsym $mod+Ctrl+F5 exec --no-startup-id ~/.local/bin/i3-save-layout
```

### 3) Notes & tweaks

* Requires `jq` (for `get_workspaces`). Install: `sudo apt install jq`.
* Prompt priority is `rofi` → `dmenu` → `zenity` → fallback to tty input if you run it from a terminal.
* Saved to: `~/.config/i3/layouts/<name>.json`. Use later with:

  ```i3
  # example: recreate a room
  bindsym $mod+Ctrl+7 exec --no-startup-id i3-msg 'workspace 7; append_layout ~/.config/i3/layouts/<name>.json'
  ```

  Then `exec` the apps you want to fill the placeholders (order matters).

### Want to go harder?

* Add a “quick‑save” that auto‑names with timestamp: `ws-<name>-$(date +%F-%H%M%S).json`.
* Write a companion `i3-load-layout` that lists `layouts/*.json` in rofi and runs `append_layout` on the selected file.
* Hy version later if you want to keep the tools Lisp‑centric; for i3 IPC shells, Bash is the path of least friction.

Does this fit your flow, or do you want the rofi‑picker loader too?<!-- GENERATED-SECTIONS:DO-NOT-EDIT-BELOW -->
## Related content
- [AI-Centric OS with MCP Layer](ai-centric-os-with-mcp-layer.md)
- [AI-First-OS-Model-Context-Protocol](ai-first-os-model-context-protocol.md)
- [balanced-bst](balanced-bst.md)
## Sources
- _None_
<!-- GENERATED-SECTIONS:DO-NOT-EDIT-ABOVE -->
