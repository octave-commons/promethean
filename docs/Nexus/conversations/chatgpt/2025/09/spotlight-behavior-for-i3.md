---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Spotlight behavior for i3"
conversation_id: 68b7000a-b074-8325-b4e7-4a7391fd4d0a
create_time: 09/02/2025 at 9:34 AM
update_time: 09/02/2025 at 11:57 AM
---

# Title: Spotlight behavior for i3

Created: 09/02/2025 at 9:34 AM
Last Updated: 09/02/2025 at 11:57 AM
Chat URL: https://chat.openai.com/c/68b7000a-b074-8325-b4e7-4a7391fd4d0a


>[!nexus_user] **User** - 09/02/2025 at 9:33 AM
> yo I want to implement macos spotlight behavior into my i3. I want to be able to type the name of a program, and have that window and the workspace it is in come to focus, if the program is already open, otherwise just open it, etc.
> 
> as much of the spotlight behavior as possible, from cmd + space
<!-- UID: 7e8559d5-d0be-428d-8686-7fa40f13b0b7 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:34 AM
> Got you. Easiest way to get “Spotlight for i3” is to lean on **rofi**’s *combi* mode: it merges “switch to an existing window” and “launch an app” into one fuzzy search, so typing `firefox` will show your running Firefox window first (focuses it + jumps to its workspace); if it’s not running, Enter launches it. Then we bolt on quick calc + file search to get closer to Spotlight.
> 
> # Plan (practical, minimal fuss)
> 
> 1) Install tools 
> ```bash
> sudo apt install rofi rofi-dev rofi-plugin-calc fd-find ripgrep
> # fd might be named fdfind on Ubuntu; symlink it for convenience:
> command -v fdfind >/dev/null && sudo ln -s /usr/bin/fdfind /usr/local/bin/fd || true
> ```
> 
> 2) Add a tiny file-search “modi” for rofi (Spotlight-ish file finder)
> 
> `~/.local/bin/rofi-files`:
> ```bash
> #!/usr/bin/env bash
> # Rofi "modi" for fast file lookup under $HOME (edit roots as you like).
> # Usage: rofi -modi "files:~/.local/bin/rofi-files" -show files
> set -euo pipefail
> MODE=${1:-""}
> QUERY=${ROFI_RETV:-}
> # If rofi asks for input, we list matches; if it executes, we open the selection.
> if [[ "$MODE" == "-run-command" ]]; then
>  # Open with xdg-open, spaces-safe
>  xdg-open "$ROFI_INFO" >/dev/null 2>&1 &
>  exit 0
> fi
> 
> read -r input
> # Fast, ignore node_modules/.git by default; tune as you like.
> fd --hidden --follow --exclude '.git' --exclude 'node_modules' --exclude '.cache' --type f "$input" "$HOME" \
>  | awk '{print $0"\0icon\x1ffile\x1finfo\x1f"$0"\n"}'
> ```
> ```bash
> chmod +x ~/.local/bin/rofi-files
> ```
> 
> 3) Rofi config: combi = windows first, then app launchers, plus calculator & files
> 
> `~/.config/rofi/config.rasi`:
> ```rasi
> configuration {
>  modi: "combi,calc,files:~/.local/bin/rofi-files";
>  combi-modes: "window,drun";
>  show-icons: true;
>  matching: "fuzzy";
>  sorting-method: "fzf";
>  combi-hide-mode-prefix: true;
>  case-sensitive: false;
>  drun-match-fields: "name,generic,exec,categories,keywords";
>  drun-display-format: "{name}";
>  # optional niceties:
>  kb-row-select: "Tab";
>  kb-accept-entry: "Return";
> }
> ```
> 
> 4) i3 keybinding: map **Cmd+Space** feel (on Linux that’s usually **Super+Space**). i3 uses `$mod+space` by default to toggle focus; we’ll move that and claim the combo for Spotlight.
> 
> In `~/.config/i3/config`:
> ```i3
> # Free up the default
> unbindsym $mod+space
> # Keep i3's old layout-toggle on a new combo (optional)
> bindsym $mod+Shift+space focus mode_toggle
> 
> # Spotlight-like launcher/switcher
> bindsym $mod+space exec --no-startup-id rofi -show combi
> # Optional dedicated modes:
> # bindsym $mod+F exec --no-startup-id rofi -show files
> # bindsym $mod+P exec --no-startup-id rofi -show drun
> # bindsym $mod+W exec --no-startup-id rofi -show window
> ```
> 
> Reload i3: `Mod+Shift+r`.
> 
> ## How this behaves (now)
> - Type **Super+Space**, start typing an app or window title.
> - If the app is open: first hit is the existing window → **focus + workspace warp** (exactly what you asked for).
> - If it isn’t open: `drun` entry appears → **launch** it.
> - Quick math: type `= 2+2` (from rofi-calc), hit Enter.
> - Quick file jump: type the filename, hit Enter to open via `xdg-open`.
> 
> > If you want windows to *always* sort before launchers, keep `combi-modes: "window,drun"` (window first).
> 
> ---
> 
> # Optional: stricter “focus-or-launch” command (if you’re picky about matches)
> 
> If you want a CLI you can call from scripts (e.g., `focus-or-launch firefox` that prefers an existing window by **WM_CLASS** or title, else launches), drop this in `~/.local/bin/focus-or-launch`:
> 
> ```bash
> #!/usr/bin/env bash
> # focus-or-launch <query> [launch-cmd...]
> set -euo pipefail
> q="${1:-}"; shift || true
> launch_cmd=("$@")
> [[ -z "$q" ]] && { echo "usage: focus-or-launch <query> [launch-cmd]"; exit 1; }
> 
> # Find windows via i3 tree
> json="$(i3-msg -t get_tree)"
> # Grep for matching window by class or title (case-insens)
> # Returns container id and workspace; focusing the con jumps workspaces automatically.
> match_id="$(printf '%s' "$json" \
>  | jq -r --arg q "$q" '
>  def walktree:
>  .nodes[]? as $n
>  | ($n | walktree)?,
>  ($n.floating_nodes[]? | walktree)?,
>  $n;
> 
>  walktree
>  | select(.window_properties? != null or .name? != null)
>  | . as $c
>  | ([(.window_properties.class, .window_properties.instance, .name)[]?] | map(tostring) | join(" ")) as $hay
>  | if ($hay | ascii_downcase | test(($q|ascii_downcase))) then .id else empty end
>  ' | head -n1)"
> 
> if [[ -n "$match_id" ]]; then
>  i3-msg "[con_id=$match_id] focus" >/dev/null
>  exit 0
> fi
> 
> # Otherwise, launch
> if [[ ${#launch_cmd[@]} -gt 0 ]]; then
>  i3-msg exec --no-startup-id "${launch_cmd[@]}" >/dev/null
> else
>  # fallback: try to exec the query directly (desktop launcher name or binary)
>  i3-msg exec --no-startup-id "$q" >/dev/null
> fi
> ```
> ```bash
> chmod +x ~/.local/bin/focus-or-launch
> ```
> 
> You could wire rofi to *always* call this wrapper when you pick a `drun` entry, but in practice **rofi combi already does the right thing** with windows listed first.
> 
> ---
> 
> # Extras (if you want even more Spotlight vibes)
> - **Web search**: add a simple modi that opens your default browser with the query:
>  - `~/.local/bin/rofi-web`:
>  ```bash
>  #!/usr/bin/env bash
>  set -euo pipefail
>  if [[ "${1:-}" == "-run-command" ]]; then
>  xdg-open "https://duckduckgo.com/?q=$(printf '%s' "$ROFI_INFO" | jq -sRr @uri)" & exit 0
>  fi
>  read -r input
>  [[ -n "$input" ]] && printf '%s\0info\037%s\n' "$input" "$input"
>  ```
>  ```bash
>  chmod +x ~/.local/bin/rofi-web
>  ```
>  - Add to rofi `modi: "combi,calc,files:~/.local/bin/rofi-files,web:~/.local/bin/rofi-web"` and bind a key to `-show web` if you like.
> 
> - **Theming**: toss a simple `~/.config/rofi/theme.rasi` and include via `@theme` to make it feel Mac-ish. Cosmetic, skip if you don’t care.
> 
> ---
> 
> # Why this is the sane approach
> - You avoid brittle class-name mapping scripts.
> - **Window focus jumps to its workspace** automatically—no extra i3 gymnastics.
> - You get **calc + file search** in one muscle memory chord, which is 90% of Spotlight.
> 
> If you hit any rough edges (window not showing first, a weird class/title), we can tighten matching (e.g., favor exact class matches, add ignore-lists, or feed your own sorter into rofi), but this setup usually nails it.
> 
> #tags #i3 #rofi #spotlight #linux #dotfiles #wm #productivity
<!-- UID: 317bab11-c245-4bda-a300-fe7563ed2937 -->

---


