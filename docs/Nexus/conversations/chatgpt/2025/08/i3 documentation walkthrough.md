---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "i3 documentation walkthrough"
conversation_id: 68a5d1ac-c278-8324-8e5d-0e728544de66
create_time: 08/20/2025 at 8:46 AM
update_time: 08/20/2025 at 9:21 AM
---

# Title: i3 documentation walkthrough

Created: 08/20/2025 at 8:46 AM
Last Updated: 08/20/2025 at 9:21 AM
Chat URL: https://chat.openai.com/c/68a5d1ac-c278-8324-8e5d-0e728544de66


>[!nexus_user] **User** - 08/20/2025 at 8:46 AM
> Let's go over the i3 documentation step by step together.
<!-- UID: 9ee683fa-b9ab-4b08-800b-fb93d6f9b532 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 8:48 AM
> hell yeah — let’s do it the right way: read the official docs, but *prove* every concept in a safe lab so you don’t brick your live session. I’ll lay out a plan and we’ll start with Step 0–1 today. You do the keystrokes, we sanity‑check with tools the docs prescribe, and we build up from a minimal config you understand line‑by‑line.
> 
> # Step 0 — Build a safe i3 “lab”
> **Why:** So you can validate and run configs without touching your real session.
> 
> 1) **Confirm your current i3 + where it reads config**
> ```bash
> i3 --moreversion
> ```
> You’ll see the path of the loaded config and version. (Handy when you’re on distros that stage configs.) cite
> 
> 2) **Create a throwaway config**
> ```bash
> mkdir -p ~/.config/i3/lab
> $EDITOR ~/.config/i3/lab/config
> ```
> 
> 3) **Validate that file without loading it**
> ```bash
> i3 -C -c ~/.config/i3/lab/config
> ```
> `-C` = *check config and exit*, `-c` = *alternate config path*. This is the official way to lint i3 configs. cite
> 
> 4) **Run it in a *nested* X session (so your main i3 stays safe)**
> ```bash
> sudo apt install xserver-xephyr -y # if needed
> Xephyr :2 -ac -br -noreset -screen 1600x900 &
> sleep 0.2
> DISPLAY=:2 i3 -c ~/.config/i3/lab/config -V -d all 2>~/i3-lab.log
> ```
> Now you’ve got a sandboxed i3 on `:2`, logging verbosely to `~/i3-lab.log`. If you edit the lab config, you can reload inside the Xephyr session with `$mod+Shift+c` (we’ll bind it in Step 1). For debugging later, there’s also an official “Debugging i3” how‑to. cite
> 
> > From now on, we’ll *always* do: edit → `i3 -C -c ~/.config/i3/lab/config` → test inside Xephyr. No YOLO edits to your live config.
> 
> ---
> 
> # Step 1 — Minimal config you actually understand
> Open `~/.config/i3/lab/config` and add these **four** foundational chunks. Read and type; don’t copy‑paste them all at once — stitch them so you remember them.
> 
> ### (A) Core variables & basics
> ```i3
> set $mod Mod4 # Super/Win as your mod
> font pango:monospace 10
> floating_modifier $mod
> ```
> (Floating modifier lets you move/resize floating windows with the mouse + $mod.) These basics mirror the user guide’s defaults. cite
> 
> ### (B) Open/close/reload/restart
> ```i3
> bindsym $mod+Return exec i3-sensible-terminal
> bindsym $mod+Shift+q kill
> bindsym $mod+Shift+c reload
> bindsym $mod+Shift+r restart
> ```
> `i3-sensible-terminal` is the distro‑agnostic launcher used by i3’s default config. cite
> 
> ### (C) Focus & move (vim‑style; adjust if you prefer arrows)
> ```i3
> # focus
> bindsym $mod+h focus left
> bindsym $mod+j focus down
> bindsym $mod+k focus up
> bindsym $mod+l focus right
> 
> # move
> bindsym $mod+Shift+h move left
> bindsym $mod+Shift+j move down
> bindsym $mod+Shift+k move up
> bindsym $mod+Shift+l move right
> ```
> (You can use arrows if you like; the guide uses the “homerow + Shift to move” pattern.) cite
> 
> ### (D) Workspaces 1–10
> ```i3
> set $ws1 "1"
> set $ws2 "2"
> # … up to $ws10 "10"
> 
> bindsym $mod+1 workspace $ws1
> bindsym $mod+2 workspace $ws2
> # … etc
> 
> bindsym $mod+Shift+1 move container to workspace $ws1
> bindsym $mod+Shift+2 move container to workspace $ws2
> # … etc
> ```
> This mirrors how the guide introduces workspaces and moving containers. cite
> 
> **Lint it:**
> ```bash
> i3 -C -c ~/.config/i3/lab/config
> ```
> If clean, hop into the Xephyr i3 and test: launch two terminals, practice focus/move, switch workspaces, move a window between them. (If you forget a binding, `$mod+Shift+c` reloads after fixes.)
> 
> ---
> 
> # Step 2 — Splits, layouts, floating, scratchpad (preview)
> Add the next primitives the guide leans on:
> 
> ```i3
> # split orientation toggles
> bindsym $mod+v split v
> bindsym $mod+h split h
> 
> # layout cycle
> bindsym $mod+e layout toggle split
> bindsym $mod+s layout stacking
> bindsym $mod+w layout tabbed
> 
> # floating toggle
> bindsym $mod+Shift+space floating toggle
> 
> # scratchpad (super useful later)
> bindsym $mod+Shift+minus move scratchpad
> bindsym $mod+minus scratchpad show
> ```
> 
> The guide’s sections on resizing, floating, layouts, and workspaces cover these concepts. We’ll deep‑dive marks, criteria, and assignments later. cite
> 
> Validate again with `i3 -C -c ...` and test inside Xephyr.
> 
> ---
> 
> # Step 3 — Organize config with `include` (but know the limits)
> Since i3 v4.20 you can split a big config with `include`. It’s for *organization*, not for “override defaults.” If you need layering, generate a final file with a script; includes only *add* to what’s already processed. Example:
> 
> ```i3
> # in ~/.config/i3/lab/config
> include ~/.config/i3/lab/keys.conf
> include ~/.config/i3/lab/workspaces.conf
> ```
> 
> Read the caveats in the guide: includes don’t *undo* prior settings; they’re not a theme/overlay system. (We can handle host‑specific overrides later with a generator.) cite
> 
> ---
> 
> # Step 4 — i3‑msg & IPC (you’ll use this constantly)
> CLI control = repeatable, testable changes:
> 
> ```bash
> # dump the layout tree (great for understanding containers)
> i3-msg -t get_tree | jq '.nodes[].name' | head
> 
> # hot‑reload config from shell
> i3-msg reload
> 
> # print i3 version (handy in scripts)
> i3-msg -t get_version
> ```
> 
> This is the supported IPC interface; we’ll later subscribe to events and write tiny test scripts. cite
> 
> ---
> 
> # Step 5 — Bar basics (status via i3status, later py3status)
> Keep it minimal first:
> 
> ```i3
> bar {
>  status_command i3status
> }
> ```
> 
> (i3status is the documented default producer for i3bar; we can switch to py3status or custom generators after we finish base i3.) cite
> 
> ---
> 
> ## Quality‑of‑life checkpoints
> - **Config linting**: `i3 -C -c ~/.config/i3/lab/config` before *every* test run. cite 
> - **Error surfacing**: if you deliberately break something, i3 will yell at you with `i3-nagbar` explaining the bad line. (Useful on purpose while you’re learning.) cite 
> - **Know where your config came from**: `i3 --moreversion` includes the loaded config path. If you ever think “why are changes not applying,” check this first. cite
> 
> ---
> 
> ## What’s next (today, if you’ve got steam):
> 1) Add a **resize mode** (binding modes are a core i3 concept). 
> 2) Add **window criteria** experiments (`for_window` rules) so dialogs float and GIMP toolbox behaves. 
> 3) Wire in **exec** vs **exec_always** for autostart (and compare to your `dex` usage). cite
> 
> If you’re game, I’ll push you a bit each step:
> - We’ll write a tiny *config generator* (Bash or Hy) that spits `config` from `config.base + host.conf`, then compare it to using `include`. 
> - We’ll stand up a **marks** + **scratchpad** workflow that makes Synergy/i3 second‑screen use painless. 
> - We’ll instrument **IPC subscribers** to auto‑move certain apps to named workspaces with criteria.
> 
> ---
> 
> **Does this make sense so far?** 
> If yes, do Steps 0–1 now: create the lab config, validate with `i3 -C -c …`, boot it in Xephyr, and confirm:
> - `$mod+Return` opens a terminal,
> - focus/move bindings work,
> - workspaces 1–3 switch and can receive windows,
> - `$mod+Shift+c` reload works inside Xephyr.
> 
> Drop me your lab config (or a gist) once it’s passing `-C`, and we’ll bolt on resize mode + rules next.
<!-- UID: 1317afa3-3948-4ba8-82b0-e4e0362945a3 -->

---




>[!nexus_user] **User** - 08/20/2025 at 8:56 AM
> Give me the full rundown on the the syntax and limits of the include
<!-- UID: d29ecc10-23e3-4ede-8f76-704be60f9a62 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 8:57 AM
> got it — here’s the straight‑dope on `include` in i3: syntax, expansion rules, evaluation order, and the hard limits you can’t “theme” your way around. I’ll end with robust patterns that won’t bite you later.
> 
> # What `include` actually is
> - **Introduced:** i3 v4.20. It lets you splice other files into parsing *for organization*, not for overrides. citeturn2view0
> - **Syntax:** 
>  ```i3
>  include <pattern>
>  ```
>  The *pattern* is expanded **shell‑style** using the C library’s `wordexp(3)` (tilde, env vars, globs, command substitution, field splitting, quote removal). citeturn2view0turn3view0
> 
> # What gets expanded (and how)
> All via `wordexp(3)`:
> 
> - **Tilde:** 
>  ```i3
>  include ~/.config/i3/assignments.conf
>  ``` citeturn2view0
> - **Environment variables:** 
>  ```i3
>  include $HOME/.config/i3/colors.conf
>  ``` citeturn2view0
> - **Wildcards / globs:** 
>  ```i3
>  include ~/.config/i3/config.d/*.conf
>  ``` 
>  (Expansion happens *before* i3 sees the filenames; don’t rely on implicit ordering—control it yourself, see below.) citeturn2view0
> - **Command substitution:** 
>  ```i3
>  include ~/.config/i3/`hostname`.conf
>  ``` 
>  (This is supported because `wordexp` supports command substitution; be mindful of quoting and field splitting.) citeturn2view0turn3view0
> - **Relative paths:** i3 **chdirs to the including file’s directory** while parsing that file; relative `include` paths are resolved relative to that directory. 
>  ```i3
>  include assignments.conf
>  ``` citeturn2view0
> 
> **Foot‑gun to avoid:** `wordexp` does field splitting (by `$IFS`), so a path with spaces will be split unless you escape/quote it. Prefer no spaces in file or directory names. citeturn3view0
> 
> # Load semantics, errors, and inspection
> - **Loaded once per absolute path:** i3 deduplicates paths. Including the same file twice won’t loop; trying to re‑include the main config yields an **error** (not recursion). citeturn2view0
> - **Unreadable targets:** If a file can’t be read (permissions, dangling symlink), i3 **reports an error and continues** parsing the rest. citeturn2view0
> - **What got loaded (and from where):** 
>  ```bash
>  i3 --moreversion
>  ``` 
>  Prints an ordered list of the main config and all included files. Handy when debugging “why didn’t my change apply?”. citeturn2view0
> 
> # Variable scope & timing (easy to trip on)
> Variable expansion happens **before** includes are processed:
> 
> - ✅ You **can** define a variable in the parent and use it in an included file. 
> - ❌ You **cannot** define a variable in an included file and use it back in the parent (because vars are expanded in a separate stage before include processing). 
> This is an explicit, documented limitation. citeturn2view0
> 
> # Order of evaluation
> i3 **does not** build a single preprocessed file; it parses as it goes. Each `include` causes the parser to recursively `parse_file()`; conceptually this is a **depth‑first traversal** of a tree. Don’t assume you can “undo” prior directives by including something later. citeturn2view0
> 
> # The big, non‑negotiable limit
> Included files **only add** configuration; they cannot **undo/override** what was already parsed. In practice, you can’t:
> - “Remove” or truly override an existing `bindsym` from the parent.
> - Reliably replace earlier settings with later includes.
> 
> If you want “default + patches,” the official stance is: **copy the default and edit it**, or **generate a final config** with your own preprocessor. `include` isn’t a theming/overlay system. citeturn2view0
> 
> # Patterns that work (battle‑tested)
> 
> 1) **Module split with controlled order** 
> Create `~/.config/i3/config.d/` and prefix files numerically to pin order:
> ```
> 00-vars.conf
> 10-keys.conf
> 20-workspaces.conf
> 30-rules.conf
> 40-autostart.conf
> ```
> Top‑level:
> ```i3
> include ~/.config/i3/config.d/*.conf
> ```
> Why numbers? Because you should *not* depend on unspecified glob ordering; make it explicit. (The docs don’t guarantee order—`wordexp` gives “shell‑like” expansion; safer to prefix.) citeturn2view0turn3view0
> 
> 2) **Host-/session‑specific slices** 
> ```i3
> # Hostname slice
> include ~/.config/i3/`hostname`.conf
> 
> # Optional GPU slice if present
> include ~/.config/i3/slices/gpu-nvidia.conf
> ```
> Guard with the filesystem: if a file is missing, i3 just logs an error and keeps going. Keep such slices small to avoid noisy logs. citeturn2view0
> 
> 3) **Environment‑driven includes** 
> Set an env var from your login shell and branch:
> ```i3
> include ~/.config/i3/env/$I3_PROFILE/*.conf
> ```
> Again: ensure the glob actually matches files, or you’ll see an error (but parsing continues). citeturn2view0
> 
> 4) **Relative includes in submodules** 
> Inside `config.d/20-workspaces.conf`:
> ```i3
> # resolves relative to the file’s own directory
> include themes/workspace-colors.conf
> ``` 
> This works because i3 chdirs per file while parsing. citeturn2view0
> 
> # When you *do* need real layering/overrides
> If you want to “unset” a keybinding, or apply a theme that actually overrides earlier choices, use a **generator** to build a single config i3 will parse:
> 
> - **Tiny Bash preprocessor** (deterministic order, permits conditionals):
>  ```bash
>  #!/usr/bin/env bash
>  set -euo pipefail
>  out="${XDG_CONFIG_HOME:-$HOME/.config}/i3/config"
>  src="${XDG_CONFIG_HOME:-$HOME/.config}/i3/config.d"
>  : >"$out"
>  for f in "$src"/00-*.conf "$src"/10-*.conf "$src"/20-*.conf "$src"/[3-9][0-9]-*.conf; do
>  [ -f "$f" ] && cat "$f" >>"$out"
>  done
>  ```
>  Then `i3 -C -c ~/.config/i3/config && i3-msg reload`. 
>  (This sidesteps i3’s add‑only rule because *you* construct the final file.)
> 
> - **org‑babel or m4/cpp** pipelines are also viable; many folks tangle an org file to `config` and keep sections in one source. Use only if that fits your editor flow. cite
> 
> # Quick sanity checklist while you iterate
> - Lint before reload: 
>  ```bash
>  i3 -C -c ~/.config/i3/config
>  ``` citeturn2view0
> - Confirm which files actually got used: 
>  ```bash
>  i3 --moreversion
>  ``` citeturn2view0
> - Reload live i3 without logging out: 
>  ```bash
>  i3-msg reload
>  ``` (part of the normal workflow; general IPC command) citeturn2view0
> 
> ---
> 
> If you want, I’ll push you one level deeper: give me your current `config` layout goals (what you want separated, what you expect to be override‑able), and I’ll sketch a **generator plan** (Hy or Bash) that produces a single canonical `config` from modules + host/theme inputs, with tests that catch accidental duplicate bindings before you reload.
<!-- UID: 2ecad956-8baf-44c9-9bec-30afd2427451 -->

---




>[!nexus_user] **User** - 08/20/2025 at 9:02 AM
> Yea... that ordering thing just bit me in the ass. I was starting to split my config up, and I moved `set $mod Mod4` to an include, and oof. The system was unusable, I had to use another wm to look at the problem.
<!-- UID: d9228147-b58b-4768-a614-b650542a5ad0 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 9:02 AM
> Yup — classic foot‑gun, and it’s 100% about how i3 parses includes + variables.
> 
> # What happened (precisely)
> - i3 does **variable expansion in a separate stage *before*** it processes `include`. 
> - So if you moved `set $mod Mod4` into an included file, any `$mod` **in the parent file** was expanded **before** that include ran → your bindings either became invalid or used the default (effectively “no $mod”), making the session feel dead. citeturn2view3
> 
> # The fixes (in order of “most bulletproof”)
> 
> ## 1) Keep `$mod` in the main config, above everything
> Put this *first* in your root config and never move it:
> ```i3
> set $mod Mod4
> ```
> Then include everything else after. Variables defined in the parent are visible to included files; not the other way around. citeturn2view3
> 
> ## 2) If you insist on splitting variables, force a **deterministic include order**
> At the very top of the main config:
> ```i3
> include ~/.config/i3/config.d/00-vars.conf
> include ~/.config/i3/config.d/10-*.conf
> include ~/.config/i3/config.d/20-*.conf
> ```
> Do **not** rely on a single `*.conf` glob to “probably” put `00-vars.conf` first—i3 uses shell‑style `wordexp(3)` expansion; control your order explicitly. citeturn2view3
> 
> ## 3) For host profiles, include the profile file **before** anything uses `$mod`
> Example:
> ```i3
> # choose a profile (command substitution is allowed)
> include ~/.config/i3/profiles/`hostname`.conf
> 
> # now it’s safe to use $mod
> bindsym $mod+Return exec i3-sensible-terminal
> ```
> Again: the profile must be included **above** the first `$mod` usage. citeturn2view3
> 
> ## 4) If you actually need “overrides,” don’t use `include`—**generate** a final file
> `include` can only **add**, not undo/override earlier directives. If you want true layering (e.g., unset/replace bindings), concatenate modules yourself into one `config` and load that. i3 doesn’t merge into a single preprocessed file; it parses depth‑first as it hits `include`. citeturn2view3
> 
> ---
> 
> # Add “oh‑sh*t” lifelines so you’re never locked out again
> 
> Put these near the top of your root config (they don’t use `$mod`):
> 
> ```i3
> # emergency: reload/restart without $mod
> bindsym Control+Shift+F12 reload
> bindsym Control+Shift+F11 restart
> ```
> 
> Optionally mirror both popular modifiers so you can still act if you accidentally set the wrong one:
> 
> ```i3
> bindsym Mod1+Shift+F12 reload # Alt as fallback
> bindsym Mod4+Shift+F12 reload # Win as fallback
> ```
> 
> You can *always* fix a bad config from a terminal with:
> ```bash
> i3 -C -c ~/.config/i3/config # lint it
> i3-msg reload # hot‑reload running i3
> i3 --moreversion # show exactly which files i3 loaded and in what order
> ```
> (The user guide’s include section documents the error/continue behavior and how to list loaded files.) citeturn2view3
> 
> ---
> 
> # Minimal, safe top‑of‑file scaffold (steal this)
> ```i3
> # 0) Emergency keys that don’t depend on $mod
> bindsym Control+Shift+F12 reload
> bindsym Control+Shift+F11 restart
> 
> # 1) Vars live in root or in an include *here*
> set $mod Mod4
> # or: include ~/.config/i3/config.d/00-vars.conf
> 
> # 2) Only now is it safe to include modules that use $mod
> include ~/.config/i3/config.d/10-keys.conf
> include ~/.config/i3/config.d/20-workspaces.conf
> include ~/.config/i3/config.d/30-rules.conf
> ```
> 
> ---
> 
> # Extra guardrails (optional, but pro)
> - **Xephyr lab** for every risky change, then `i3 -C` before you reload live. (Prevents exactly the kind of lock‑out you hit.) 
> - Keep **one hard‑coded terminal binding** that doesn’t use `$mod`, e.g. `bindsym Control+Return exec i3-sensible-terminal`, so you can open a shell and `i3-msg reload` if everything else is broken. 
> - When debugging ordering, run `i3 --moreversion` to see the *actual* include tree. citeturn2view3
> 
> If you want, paste your current top 30 lines + the include list. I’ll reorder it once so this can’t bite you again, and we’ll add a tiny test that greps your generated config to assert `$mod` is defined before any `bindsym $mod+…` lines.
<!-- UID: 0ccc0b15-b890-4a13-a645-adf3bce799d6 -->

---




>[!nexus_user] **User** - 08/20/2025 at 9:06 AM
> So the include globs let you do like `/path/to/place/**/*.conf` since they are just using wordexp?
<!-- UID: ebaf03e3-f256-493e-b22d-5e9dbdc63c78 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 9:06 AM
> exactly — because i3 just hands the pattern off to **`wordexp(3)`** (the libc routine that does “shell-like expansion”). That means:
> 
> - ✅ `*`, `?`, `[...]` all work (same as globbing in `/bin/sh`).
> - ✅ `**` works **if** your system’s `wordexp` → glob → libc → filesystem walk supports it. That’s not i3 magic — it’s your shell/libc doing the brace/glob expansion. On modern GNU libc + `glob(3)`, `**` will expand recursively **if** `GLOBSTAR` behavior is enabled (like in bash’s `shopt -s globstar`). **But**: `wordexp` itself doesn’t set `GLOBSTAR` by default, so plain `**` will usually *not* recurse — it’s treated as “just another `*`” (single directory level). 
>  So don’t count on Bash-style `**` unless you test on your libc.
> 
> - ✅ env vars, tilde, command substitution all work.
> - ❌ no brace expansion (`{a,b}`) — because `wordexp` does not implement bash-style braces.
> 
> 👉 From the manpage (`man 3 wordexp`): it follows POSIX shell expansion rules. That’s “pathname expansion” = wildcards, not bash-only extras.
> 
> ---
> 
> ### In practice
> - This works:
>  ```i3
>  include ~/.config/i3/config.d/*.conf
>  ```
>  expands to all `.conf` files in `config.d/`.
> 
> - This probably **doesn’t** work (on stock libc):
>  ```i3
>  include ~/.config/i3/**/*.conf
>  ```
>  because POSIX `wordexp` doesn’t recurse. On some systems it collapses `**` → `*`.
> 
> ---
> 
> ### Safer workaround if you want recursive includes
> Instead of hoping `**` works, just do:
> ```i3
> include ~/.config/i3/config.d/*.conf
> include ~/.config/i3/config.d/*/*.conf
> include ~/.config/i3/config.d/*/*/*.conf
> ```
> …explicit levels, or generate the final config with a script (my “generator” suggestion earlier). That way you control the order and depth.
> 
> ---
> 
> Want me to sketch you a tiny **Hy or Bash pre-expander** that does a true `**` glob (recursively walks the tree) and spits out one `config`, so you can keep arbitrarily deep include dirs without worrying about libc’s `wordexp`?
<!-- UID: b38968a4-5411-483f-9e23-54879df4eda4 -->

---




>[!nexus_user] **User** - 08/20/2025 at 9:08 AM
> Ok I've got this now. I've never really used the layout system in i3, but I have wanted to
<!-- UID: 515b2a2e-4532-4c3e-a0b4-36bc5f118b55 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 9:08 AM
> nice—layouts are where i3 stops feeling like “a tiling WM with hotkeys” and starts feeling like a programmable compositor. let’s do it right: you’ll *build* muscle memory with a lab + a few tiny rituals so you never get confused about “what container am I actually changing?”
> 
> I’m assuming you’ve got your Xephyr lab from earlier. If not, spin it up again—don’t test this live until it clicks.
> 
> # 0) Mental model (containers, parents, focus)
> - **Everything is a container.** A window lives in a split/stacked/tabbed container, which lives inside another, all the way up to the workspace/root.
> - **Commands act on the *focused container*** (or its parent, if you tell them).
> - If something “doesn’t work,” you probably changed the wrong level in the tree. Train yourself to *select the right container*, *then* change layout.
> 
> Two helpers:
> ```i3
> # focus helpers
> bindsym $mod+a focus parent # go up
> bindsym $mod+d focus child # go down (to a tiling child)
> ```
> and, while learning,
> ```bash
> i3-msg -t get_tree | jq 'recurse(.nodes[], .floating_nodes[]) 
>  | select(.focused==true) | {type, layout, name, window_properties}'
> ```
> Run that in your Xephyr terminal to sanity‑check what’s actually selected.
> 
> ---
> 
> # 1) The three layouts that matter
> - **split** (a.k.a. “default tiling”): windows tile beside/under each other. There’s a *split orientation* on the parent: horizontal (`split h`) or vertical (`split v`). 
> - **stacking**: one window visible at a time; list of titles stacked vertically on the left. 
> - **tabbed**: one window visible; tabs across the top.
> 
> Bindings you’ll actually use:
> ```i3
> # choose split orientation for the *next* new child
> bindsym $mod+h split h
> bindsym $mod+v split v
> 
> # switch the *current container's* layout
> bindsym $mod+e layout toggle split # cycles splitv/splith for that parent
> bindsym $mod+s layout stacking
> bindsym $mod+w layout tabbed
> ```
> 
> **Gotcha:** `split h|v` doesn’t instantly rearrange existing children; it sets the orientation for where the *next* sibling will appear. If you want to change how *current* siblings are arranged, you need to focus their **parent** and toggle layout there.
> 
> Drill:
> 1. open 3 terminals.
> 2. focus one, press `$mod+a` (select parent), `$mod+w` (tabbed), `$mod+s` (stacking), `$mod+e` (back to split).
> 3. observe what changes (the *parent’s* layout), not “the window’s layout.”
> 
> ---
> 
> # 2) Resizing like a grown‑up (binding mode)
> Raw `resize grow/shrink` bindings scatter everywhere. Instead, use a **mode** so you can resize with hjkl (or arrows) without chord‑gymnastics:
> 
> ```i3
> mode "resize" {
>  bindsym h resize shrink width 5 px or 5 ppt
>  bindsym j resize grow height 5 px or 5 ppt
>  bindsym k resize shrink height 5 px or 5 ppt
>  bindsym l resize grow width 5 px or 5 ppt
> 
>  bindsym Left resize shrink width 5 px or 5 ppt
>  bindsym Down resize grow height 5 px or 5 ppt
>  bindsym Up resize shrink height 5 px or 5 ppt
>  bindsym Right resize grow width 5 px or 5 ppt
> 
>  bindsym Return mode "default"
>  bindsym Escape mode "default"
> }
> bindsym $mod+r mode "resize"
> ```
> 
> Notes:
> - `px` is exact; `ppt` (percentage‑points of parent) keeps things proportional.
> - Resizing acts on the **focused container** vs its sibling, depending on orientation. If it “resizes the wrong way,” you’re on the wrong parent; `$mod+a` then resize.
> 
> ---
> 
> # 3) “Default workspace layout” (set your landing pattern)
> You can set what new containers default to on a workspace:
> ```i3
> workspace_layout default # or: stacking | tabbed
> ```
> Useful when you want a “communication” workspace always tabbed, and “editor” workspaces default split.
> 
> Advanced: you can also pre‑split by deliberately creating a split parent and marking it (see §5).
> 
> ---
> 
> # 4) Keep a clean split orientation ritual
> People get confused because `split v/h` is sticky. My ritual:
> - before launching the *second* app in a pair, press the split you want:
>  - `$mod+h` → side‑by‑side,
>  - `$mod+v` → top‑bottom.
> - then launch the app.
> 
> If you want to *repack* an existing set (turn a horizontal row into a vertical column):
> 1) focus one child, `$mod+a` to select the **parent**, 
> 2) `layout toggle split` (`$mod+e` above) until it matches.
> 
> ---
> 
> # 5) Marks + targeted layout changes (surgical)
> Marks let you tag containers and target them regardless of focus.
> 
> ```i3
> # mark the current container with a name
> bindsym $mod+m exec i3-msg 'mark --add main'
> 
> # anywhere, change that container’s layout
> bindsym $mod+Shift+m exec i3-msg '[con_mark="main"] layout tabbed'
> ```
> 
> Concrete use:
> - On a workspace, create a parent container, mark it “main”, set it `tabbed`. 
> - Create another parent on the same workspace, mark “aux”, set it `split v`. 
> - Now every new terminal you create can be moved to either with `move container to mark main|aux` and inherit its layout.
> 
> Bindings that make this smooth:
> ```i3
> bindsym $mod+comma move container to mark main
> bindsym $mod+period move container to mark aux
> ```
> 
> ---
> 
> # 6) Rules to auto‑float / auto‑layout finicky apps
> The moment you start mixing dialog‑heavy apps with tiling, add criteria:
> 
> ```i3
> # float dialogs and utility windows by default
> for_window [window_type="dialog"] floating enable
> for_window [window_role="pop-up"] floating enable
> 
> # make specific apps land in tabbed parent
> for_window [class="(?i)Slack|Discord"] layout tabbed
> 
> # put terminals in the 'aux' parent by default
> for_window [class="Alacritty|kitty|XTerm"] move to mark aux
> ```
> 
> Use `xprop` (X11) or `swaymsg -t get_tree` style inspection (for Wayland sway) to figure out `class`, `instance`, `title`, `window_role`, etc. In i3/X11, `xprop` is your friend.
> 
> ---
> 
> # 7) Repeatable “rooms” with `append_layout` / `i3-save-tree`
> For “I want this workspace to always open as a 2×2 grid with a tabbed stack on the right”, use templates:
> 
> 1) Build the layout manually once. 
> 2) Save it:
>  ```bash
>  i3-save-tree --workspace 3 > ~/.config/i3/layouts/ws3.json
>  ```
> 3) In config / a script:
>  ```i3
>  # create workspace and append the saved tree
>  bindsym $mod+Ctrl+3 exec --no-startup-id \
>  i3-msg 'workspace 3; append_layout ~/.config/i3/layouts/ws3.json; exec alacritty; exec firefox; exec code'
>  ```
> `append_layout` creates placeholder containers; the following `exec`s fill them in order. You get a deterministic, re‑launchable “room.”
> 
> ---
> 
> # 8) Move/transpose tricks that feel like magic
> - **Swap with neighbor:** there’s no single “swap” verb, but you can do:
>  ```i3
>  bindsym $mod+Shift+u move left; focus left; move right
>  ```
>  Repeat with directions as needed. This is a macro; once it’s in muscle memory, you can reorder in one chord.
> - **Move container into a fresh split parent**:
>  ```i3
>  bindsym $mod+Shift+v split v; move right # creates a new vertical parent then lands on the right
>  ```
>  Same idea for horizontal.
> 
> ---
> 
> # 9) Tab/stack hygiene
> Tabbed/stacked containers get messy if you mix floating dialogs and tiling. A few laws I follow:
> - Don’t nest tabbed inside tabbed unless you’re doing it on purpose (e.g., “apps” tab where each tab is its own tabbed group).
> - Bind focus by title when you care:
>  ```i3
>  bindsym $mod+Ctrl+f exec i3-msg '[title="^Firefox"] focus'
>  ```
> - Use `rename workspace` to label a workspace with its role; i3 shows it in the bar:
>  ```i3
>  bindsym $mod+Shift+9 exec --no-startup-id i3-msg 'rename workspace to "9:comm"'
>  ```
> 
> ---
> 
> # 10) Two tiny quality‑of‑life adds
> - **Show me what’s focused** (briefly flash):
>  ```i3
>  focus_wrapping no
>  force_display_urgency_hint 500 ms
>  ```
> - **Prevent accidental layout churn**: if you hit `$mod+e` too often, gate it behind a mode:
>  ```i3
>  mode "layout" {
>  bindsym e layout toggle split
>  bindsym s layout stacking
>  bindsym w layout tabbed
>  bindsym Escape mode "default"
>  }
>  bindsym $mod+space mode "layout"
>  ```
> 
> ---
> 
> # Homework (15 min, in Xephyr)
> 1. Make a workspace with:
>  - left: a **tabbed** parent (“main” mark), hold 3 terminals.
>  - right: a **vertical split** parent (“aux” mark), hold 2 terminals.
> 2. Bind:
>  - `$mod+comma` → move to main (tabbed)
>  - `$mod+period` → move to aux (v‑split)
> 3. Save the layout as `ws7.json` and bind `$mod+Ctrl+7` to recreate it cold.
> 
> If any step doesn’t behave the way you expect, tell me *exactly* what you pressed and what the tree thinks is focused (use the `get_tree | jq …` snippet). We’ll fix the ritual, not just the keys.
> 
> Does this make sense? Where do you want to push next: marks‑heavy workflows, layout templates for stream/recording workspaces, or writing a tiny generator that emits your default room layouts per host profile?
<!-- UID: d9309903-a511-4482-9e74-09c59efe9d58 -->

---




>[!nexus_user] **User** - 08/20/2025 at 9:15 AM
> I want a keybinding that executes the `i3-save-tree --workspace <current>` on the current workspace, then opens a prompt to name that configuration. probably something like `$WS_TEMP=$(prompt-command); i3-save-tree --workspace $(workspace-somehow) ~/.config/layouts/$WS_TEMP.json`
<!-- UID: 1c8e8b73-85c6-4027-a4ac-0d40c594f04d -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 9:15 AM
> Yes. Do it with a tiny wrapper script + a clean keybinding. This gives you a prompt, grabs the *current* workspace, sanitizes the filename, and saves the layout JSON.
> 
> ### 1) Script: `~/.local/bin/i3-save-layout`
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # deps: jq (required), one of rofi|dmenu|zenity (optional)
> DIR="${XDG_CONFIG_HOME:-$HOME/.config}/i3/layouts"
> mkdir -p "$DIR"
> 
> # get focused workspace name (e.g., "7:dev")
> WS_NAME="$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused==true) | .name')"
> : "${WS_NAME:?could not detect focused workspace}"
> 
> DEFAULT_NAME="${WS_NAME// /-}"
> 
> prompt() {
>  if command -v rofi >/dev/null 2>&1; then
>  # prefill with default; user can edit
>  printf "%s" "$DEFAULT_NAME" | rofi -dmenu -p "Save layout as"
>  elif command -v dmenu >/dev/null 2>&1; then
>  printf "%s" "$DEFAULT_NAME" | dmenu -p "Save layout as"
>  elif command -v zenity >/dev/null 2>&1; then
>  zenity --entry --title="Save i3 layout" --text="Layout name:" --entry-text="$DEFAULT_NAME"
>  else
>  # last-resort: tty prompt (works if you ran this from a terminal)
>  read -r -p "Layout name [$DEFAULT_NAME]: " ans
>  echo "${ans:-$DEFAULT_NAME}"
>  fi
> }
> 
> RAW_NAME="$(prompt || true)"
> # if user cancels, abort quietly
> [ -n "${RAW_NAME:-}" ] || exit 0
> 
> # sanitize to a safe filename: lowercase, spaces->-, drop weird chars
> NAME="$(printf "%s" "$RAW_NAME" | tr '[:upper:]' '[:lower:]' \
>  | sed -E 's/[^a-z0-9._-]+/-/g; s/-+/-/g; s/^-//; s/-$//')"
> [ -n "$NAME" ] || { notify-send "i3 layout" "Empty name; not saved."; exit 1; }
> 
> OUT="$DIR/$NAME.json"
> 
> # write tree for the *current* workspace
> i3-save-tree --workspace "$WS_NAME" > "$OUT"
> 
> # optional: success notification
> command -v notify-send >/dev/null 2>&1 && notify-send "i3 layout saved" "$OUT"
> echo "Saved: $OUT"
> ```
> 
> ```bash
> chmod +x ~/.local/bin/i3-save-layout
> ```
> 
> ### 2) i3 binding (choose your key)
> Put near your other exec bindings:
> ```i3
> # Save the current workspace layout (prompts for a name)
> bindsym $mod+Ctrl+F5 exec --no-startup-id ~/.local/bin/i3-save-layout
> ```
> 
> ### 3) Notes & tweaks
> - Requires `jq` (for `get_workspaces`). Install: `sudo apt install jq`.
> - Prompt priority is `rofi` → `dmenu` → `zenity` → fallback to tty input if you run it from a terminal.
> - Saved to: `~/.config/i3/layouts/<name>.json`. Use later with:
>  ```i3
>  # example: recreate a room
>  bindsym $mod+Ctrl+7 exec --no-startup-id i3-msg 'workspace 7; append_layout ~/.config/i3/layouts/<name>.json'
>  ```
>  Then `exec` the apps you want to fill the placeholders (order matters).
> 
> ### Want to go harder?
> - Add a “quick‑save” that auto‑names with timestamp: `ws-<name>-$(date +%F-%H%M%S).json`.
> - Write a companion `i3-load-layout` that lists `layouts/*.json` in rofi and runs `append_layout` on the selected file.
> - Hy version later if you want to keep the tools Lisp‑centric; for i3 IPC shells, Bash is the path of least friction.
> 
> Does this fit your flow, or do you want the rofi‑picker loader too?
<!-- UID: fc6d4670-3b25-4936-9537-2b2750bb9463 -->

---




>[!nexus_user] **User** - 08/20/2025 at 9:20 AM
> yea lets get a quick save going
<!-- UID: 8dc79fff-be36-47af-aeda-9c7a24310a7a -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 9:20 AM
> Nice. Let’s add a zero‑friction “quick save” that grabs the current workspace name, slaps on a timestamp, sanitizes it, and dumps the JSON. No prompts, no fuss.
> 
> # 1) Script: `~/.local/bin/i3-quick-save-layout`
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # deps: jq
> DIR="${XDG_CONFIG_HOME:-$HOME/.config}/i3/layouts"
> mkdir -p "$DIR"
> 
> # get focused workspace name (e.g., "7:dev")
> WS_NAME="$(i3-msg -t get_workspaces | jq -r '.[] | select(.focused==true) | .name')"
> : "${WS_NAME:?could not detect focused workspace}"
> 
> # make a filename-friendly base from the workspace name
> BASE="$(printf "%s" "$WS_NAME" | tr '[:upper:]' '[:lower:]' \
>  | sed -E 's/[^a-z0-9._-]+/-/g; s/-+/-/g; s/^-//; s/-$//')"
> 
> STAMP="$(date +%Y%m%d-%H%M%S)"
> OUT="${DIR}/${BASE}-${STAMP}.json"
> 
> i3-save-tree --workspace "$WS_NAME" > "$OUT"
> 
> # optional desktop notification
> command -v notify-send >/dev/null 2>&1 && \
>  notify-send "i3 quick-saved layout" "$OUT"
> 
> echo "Saved: $OUT"
> ```
> 
> ```bash
> chmod +x ~/.local/bin/i3-quick-save-layout
> ```
> 
> # 2) Bind it in i3
> Pick a chord you won’t hit by accident. Example:
> ```i3
> # Quick-save the current workspace layout to ~/.config/i3/layouts/<ws>-YYYYMMDD-HHMMSS.json
> bindsym $mod+F5 exec --no-startup-id ~/.local/bin/i3-quick-save-layout
> ```
> 
> # 3) Optional niceties (add if you want)
> - **Limit retention** (keep last N per workspace):
>  ```bash
>  # add after save
>  N=20
>  ls -1t "$DIR"/"${BASE}-"*.json 2>/dev/null | tail -n +$((N+1)) | xargs -r rm -f
>  ```
> - **Also save a “latest” symlink**:
>  ```bash
>  ln -sfn "$OUT" "${DIR}/${BASE}-latest.json"
>  ```
> - **Pair with a loader later** (rofi picker that runs `append_layout` on a chosen file); we can wire that up when you’re ready.
> 
> Test it in Xephyr once, then enjoy muscle memory on the real session. Want the rofi loader next, or do you want to add auto‑launch of a standard app set right after the quick save (for templating “rooms”)?
<!-- UID: a974c14c-1e67-45f5-8cde-e73bb94b8b81 -->

---


