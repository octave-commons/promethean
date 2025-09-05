---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "i3 save workspaces on boot"
conversation_id: 68b72047-977c-8329-bf7a-2446520f92ac
create_time: 09/02/2025 at 11:50 AM
update_time: 09/02/2025 at 12:18 PM
---

# Title: i3 save workspaces on boot

Created: 09/02/2025 at 11:50 AM
Last Updated: 09/02/2025 at 12:18 PM
Chat URL: https://chat.openai.com/c/68b72047-977c-8329-bf7a-2446520f92ac


>[!nexus_user] **User** - 09/02/2025 at 11:50 AM
> i3 save all current workspaces, and resume on next boot
<!-- UID: 4910a759-d9d2-495b-aca4-0033397c59bb -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 11:50 AM
> # i3: save all current workspaces and resume on next boot
> 
> You’ve got two realistic options:
> 
> - **Built-in i3 “layout save/restore”** — rock-solid, but it only guarantees layout + placeholder windows. You’re responsible for launching apps that “swallow” into those placeholders. cite 
> - **i3-resurrect** — community tool that saves both layouts *and* the programs/working directories and can bring them back. If you want a one-command “get me back to where I was,” this is usually the winner. cite
> 
> Below are both approaches, step-by-step. Pick one. I’d start with **i3-resurrect** unless you need zero dependencies.
> 
> ---
> 
> ## Option A — i3-resurrect (recommended)
> 
> ### 1) Install
> - Arch/AUR: `i3-resurrect` exists in AUR; also available on Gentoo overlay and PyPI. Otherwise install via `pipx install i3-resurrect`. cite
> 
> ### 2) Save current state (all workspaces)
> Run once (e.g., from a terminal):
> 
> ```bash
> # save layouts + programs for ALL workspaces on all outputs
> i3-resurrect save -A # A = all
> ```
> 
> What it does: scrapes the workspace tree via i3ipc, stores JSON for layout and a manifest of commands+cwd for windows. cite
> 
> ### 3) Restore on next boot
> Add to `~/.config/i3/config`:
> 
> ```i3
> # Restore saved sessions at startup; don’t hang startup-notify
> exec --no-startup-id i3-resurrect restore -A
> ```
> 
> - `exec` runs on initial i3 start; use `exec_always` if you also want it after `i3-msg restart`. cite 
> - `--no-startup-id` just disables startup notification (avoids 60s watch cursor for non-aware apps). cite
> 
> ### 4) (Optional) Bind keys for ad-hoc saves/restores
> ```i3
> bindsym $mod+Ctrl+s exec --no-startup-id i3-resurrect save -A
> bindsym $mod+Ctrl+r exec --no-startup-id i3-resurrect restore -A
> ```
> 
> ### Trade-offs / gotchas
> - It uses best-guess process → command mapping; 95% fine, but custom launchers or wrapper scripts can need tweaks. The repo README documents per-window overrides and terminal handling. cite
> 
> ---
> 
> ## Option B — pure i3 (no extra tool)
> 
> This is more manual but super reliable once set.
> 
> ### 1) Dump each workspace layout
> For each workspace you care about:
> 
> ```bash
> # e.g., for workspaces 1..5
> for ws in 1 2 3 4 5; do
>  i3-save-tree --workspace "$ws" > "$HOME/.config/i3/ws-$ws.json"
> done
> ```
> 
> - `i3-save-tree` dumps JSON describing containers; you’ll usually **uncomment or add a `swallows` rule** (class/title/instance) so real windows match the placeholders. cite 
> - Official doc walks through saving a single workspace or an entire output and then restoring later. cite
> 
> ### 2) Autostart apps so they “swallow” into placeholders
> In `~/.config/i3/config`, start the apps you want per workspace:
> 
> ```i3
> # Example: start apps and send them to the right workspace
> exec --no-startup-id i3-msg 'workspace 1; exec alacritty'
> exec --no-startup-id i3-msg 'workspace 1; exec firefox'
> exec --no-startup-id i3-msg 'workspace 2; exec code'
> # ...repeat for your setup...
> ```
> 
> - You can use `exec_always` if you want re-execution after `i3-msg restart`. cite
> 
> ### 3) Restore the layouts during startup
> Append after your app execs:
> 
> ```i3
> # Load placeholder containers for each workspace layout
> exec --no-startup-id i3-msg 'workspace 1; append_layout ~/.config/i3/ws-1.json'
> exec --no-startup-id i3-msg 'workspace 2; append_layout ~/.config/i3/ws-2.json'
> # ...etc...
> ```
> 
> As the real apps launch and match the `swallows` criteria, placeholders disappear and windows drop into position. cite
> 
> ### Notes
> - The built-in method **does not** automatically “remember” which programs were open; it restores layout placeholders. You must start the apps yourself (via `exec` lines, scripts, or a launcher). That’s the point of `swallows`. cite
> - Good reference tutorials exist if you want examples. cite
> 
> ---
> 
> ## Which should you pick?
> 
> - **Want the machine to come back exactly as before with minimal fuss?** Use **i3-resurrect**. 
> - **Prefer zero dependencies and are happy to manage launch commands yourself?** Use **pure i3** with `i3-save-tree` + `append_layout`.
> 
> If you tell me your current workspace names and key apps, I’ll spit out a ready-to-paste config (functional, minimal, no mutation 😉).
> 
> #tags #i3 #i3wm #linux #dotfiles #workspace #automation #tilingwm #session-restore
<!-- UID: bfacde7f-86f0-4dbd-8837-5c3b5502fdb4 -->

---




>[!nexus_user] **User** - 09/02/2025 at 12:08 PM
> -A is not a flag, I have to itterate with resurrect save
<!-- UID: 25556efe-8181-42d3-829c-ffe2242c52b3 -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 12:08 PM
> You're absolutely right—and thanks for pointing that out: there is **no `-A` flag** in the `i3-resurrect save` command. My mistake for glossing over that. Let’s sharpen this up with the facts.
> 
> ---
> 
> ### How `i3-resurrect` Actually Works
> 
> The tool is **workspace-specific**. It **saves or restores one workspace at a time**, using the `-w` or `--workspace` flag (or relying on the currently focused one if you omit the flag). There's no built-in “all workspaces” switch. cite
> 
> #### Usage snippet from the docs:
> ```bash
> Usage: i3-resurrect save [OPTIONS]
>  Options:
>  -w, --workspace TEXT The workspace to save.
>  [default: current workspace]
> ```
> — Same applies for `restore`. cite
> 
> So yes: you *do* need to iterate over each workspace manually. No sneaky `-A` here.
> 
> ---
> 
> ### Your Practical Options
> 
> #### 1. **Manual iteration** with a loop (shell):
> ```bash
> # Replace with your actual workspace names or numbers
> for ws in 1 2 3 4 5; do
>  i3-resurrect save -w "$ws"
> done
> ```
> Then in your `i3/config`, maybe run:
> ```i3
> exec --no-startup-id i3-resurrect restore -w 1
> exec --no-startup-id i3-resurrect restore -w 2
> # ...etc...
> ```
> This gives precision, but it's repetitive.
> 
> ---
> 
> #### 2. **Keybinding “save mode”** for quicker manual saves:
> ```i3
> mode "save" {
>  bindsym 1 exec i3-resurrect save -w 1
>  bindsym 2 exec i3-resurrect save -w 2
>  # …add more as needed…
>  bindsym Return mode "default"
>  bindsym Escape mode "default"
> }
> bindsym $mod+s mode "save"
> ```
> Drop into this mode with `$mod+s`, then press numbers (workspaces) to save. Less repetitive, more interactive.
> 
> ---
> 
> ### Why No `-A` Flag?
> 
> The design intention seems clear: `i3-resurrect` is made lighter, focused, and explicit. Workspace-by-workspace gives you control—is that what you want? Great. But if you're after a "shoot-it-all" approach, you'll have to script around it.
> 
> ---
> 
> ### Summary in Obsidian-Friendly Markdown
> 
> ```markdown
> # i3-resurrect: Save All Workspaces via Iteration
> 
> - `i3-resurrect save` **does not support** `-A` (all workspaces). You must specify each workspace with `-w`.
> - Example shell loop:
>  ```bash
>  for ws in 1 2 3 4 5; do
>  i3-resurrect save -w "$ws"
>  done
>  ```
> - Or use a **“save mode”** with keybindings to quickly target workspaces:
>  ```i3
>  mode "save" {
>  bindsym 1 exec i3-resurrect save -w 1
>  bindsym 2 exec i3-resurrect save -w 2
>  …
>  bindsym Return mode "default"
>  bindsym Escape mode "default"
>  }
>  bindsym $mod+s mode "save"
>  ```
> - Let me know your workspace labels or numbers—I’ll help you craft a minimal, functional config (FP style, no mutation, obviously 😉).
> ```
> 
> ---
> 
> I’ll ask again—what are your workspace numbers or names? If you show me how many you care about, I'll craft that script or keybinding config for you.
<!-- UID: 01fb4d53-c6c2-4397-bb9d-c9a94c461d72 -->

---




>[!nexus_user] **User** - 09/02/2025 at 12:17 PM
> now I need emacs to remember it's workspace set up. I've just got a bunch of swallow boxes
<!-- UID: 5729342a-99e2-4fd5-b5df-6ec9ff773cdb -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 12:17 PM
> Got it — the i3 layout restored fine, but Emacs came back as empty “watch” placeholders because Emacs itself didn’t restore its frames/windows/buffers. You need Emacs to rebuild its own workspace state so those placeholders can swallow real frames.
> 
> Here are the two solid paths (pick one):
> 
> ---
> 
> # 1) Spacemacs layouts (persp-mode) — auto-resume
> 
> If you’re on Spacemacs, let it handle “workspaces” for you.
> 
> **In `~/.spacemacs`**:
> 
> ```elisp
> (defun dotspacemacs/user-config ()
>  ;; make Spacemacs persist/restore layouts automatically
>  (setq dotspacemacs-auto-resume-layouts t) ;; resume last saved layouts
>  ;; in the spacemacs-layouts layer config:
>  ;; (spacemacs-layouts :variables layouts-enable-autosave t)
> )
> ```
> 
> - Save/load layouts on demand: `SPC l s` / `SPC l L`. 
> - Enable `layouts-enable-autosave t` in the `spacemacs-layouts` layer so it auto-saves and resumes last session layouts. cite
> 
> **Why this helps:** Spacemacs (via `persp-mode`) will recreate your perspectives, buffers, and window splits on startup. When i3 runs your Emacs command for each workspace, Emacs will repopulate those frames so i3’s placeholders get swallowed. (Placeholders are expected after `append_layout` until apps appear.) cite
> 
> ---
> 
> # 2) Vanilla Emacs — desktop + (optional) framesets
> 
> If you’re not using Spacemacs, use Emacs’ built-in session restore:
> 
> **In your init:**
> ```elisp
> ;; Persist buffers, point, and (by default) frames/windows
> (setq desktop-restore-frames t) ;; make sure frames are restored
> (desktop-save-mode 1)
> ```
> 
> - `desktop-save-mode` restores buffers, modes, and (by default) frame/window configuration on next start. If you ever disabled frame restore, re-enable with `desktop-restore-frames`. cite
> 
> **Optional: belt-and-suspenders framesets**
> - You can also snapshot full window/frame layouts to a register:
>  - Save: `C-x r f R` (`frameset-to-register`)
>  - Restore: `C-x r j R` 
>  That’s handy for manual “snap back” even inside a running session. cite
> 
> ---
> 
> ## Make them swallow nicely in i3
> 
> - i3’s layout restore shows “watch” placeholders until real windows match the `swallows` rules. That’s normal. Once Emacs recreates frames/windows, they’ll replace those placeholders. cite
> - Prefer launching **one Emacs daemon** at login and then **per-workspace frames** with `emacsclient -c`. Different frames = different windows for i3 to swallow.
> - If you want deterministic matching, give each frame a unique name and match it in your layout’s `swallows` (e.g., title/class). (You can pass frame parameters with `emacsclient -c` and set frame titles in init; i3 can match on `title`/`class`.)
> 
> ---
> 
> ## Minimal, practical setup
> 
> **i3 startup (example):**
> ```i3
> # Emacs daemon once
> exec --no-startup-id emacs --daemon
> 
> # Per-workspace client frames so Emacs fills placeholders
> exec --no-startup-id i3-msg 'workspace 1; exec emacsclient -c'
> exec --no-startup-id i3-msg 'workspace 2; exec emacsclient -c'
> ```
> 
> **Emacs (pick one path):**
> - Spacemacs: enable `dotspacemacs-auto-resume-layouts` and `layouts-enable-autosave`. cite
> - Vanilla: `(desktop-save-mode 1)` and ensure `(setq desktop-restore-frames t)`. cite
> 
> That’s it: i3 restores containers → Emacs restores frames/windows → placeholders disappear.
> 
> If you share your current Spacemacs layer config (or plain Emacs init), I’ll pin this down to exact lines for your setup and, if you want, add `emacsclient` frame titles + matching `swallows` to make it bulletproof. #i3 #emacs #spacemacs #workspaces #automation #dotfiles
<!-- UID: 146dc63a-3d8f-4a79-9fa2-8b6dd84fadd6 -->

---


