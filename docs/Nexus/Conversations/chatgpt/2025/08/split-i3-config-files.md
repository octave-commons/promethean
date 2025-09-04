---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Split i3 config files"
conversation_id: 68a47af7-eca8-8321-978a-617ef7bede17
create_time: 08/19/2025 at 8:24 AM
update_time: 08/20/2025 at 9:23 AM
---

# Title: Split i3 config files

Created: 08/19/2025 at 8:24 AM
Last Updated: 08/20/2025 at 9:23 AM
Chat URL: https://chat.openai.com/c/68a47af7-eca8-8321-978a-617ef7bede17


>[!nexus_user] **User** - 08/19/2025 at 8:24 AM
> Can I split up an i3 config into multiple files?
<!-- UID: 6407570d-6737-4fde-bc37-07c630e83982 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:24 AM
> Yes—i3 supports `include`, so you can split your config into as many files as you want and pull them in.
> 
> ## TL;DR
> Add this near the top of your main config and organize the rest into a `conf.d` folder:
> ```conf
> # ~/.config/i3/config (or ~/.i3/config)
> set $mod Mod4
> include "~/.config/i3/conf.d/*.conf"
> ```
> Files in `conf.d` will be read in **lexicographic order**. Use numeric prefixes to control order.
> 
> ## Practical setup (do this)
> 1. Create a folder:
>  ```bash
>  mkdir -p ~/.config/i3/conf.d
>  ```
> 2. Split things by concern (names prefixed for order):
>  - `00-vars.conf` — variables, colors, gaps
>  - `10-keybinds.conf` — all `bindsym`/modes
>  - `20-layout.conf` — workspace rules, `for_window`, floating, borders
>  - `30-autostart.conf` — your `exec --no-startup-id ...`
>  - `90-local.conf` — machine-specific overrides you don’t want in Git
> 3. Add the `include "~/.config/i3/conf.d/*.conf"` line in your main config.
> 4. Reload i3 to pick it up:
>  - Keybinding: `$mod+Shift+r`
>  - Or: `i3-msg reload` (use `restart` if you changed i3 paths/plugins)
> 
> ## Notes that save you headaches
> - **Order matters.** Globs are included in sorted order. Use `00-`, `10-`, etc. 
> - **Nested includes work.** You can `include` inside included files (don’t create loops). 
> - **Paths:** `~` works; absolute paths are safest. 
> - **Variables expand.** i3’s `$vars` (from `set`) expand in includes. If you want hostname-specific config, do:
>  ```conf
>  # in main config
>  set $host my-laptop # or read via Xresources; see below
>  include "~/.config/i3/hosts/$host.conf"
>  ```
>  (If you want true auto-hostname, many people set `$host` via Xresources and `set_from_resource`.)
> - **If a glob matches nothing,** i3 just continues. Good for optional chunks.
> - **Version caveat:** This is standard in modern i3. If you’re somehow on a fossilized build, check with `i3 --version`. On any current Ubuntu, you’re fine.
> 
> ## Optional: per-host without shell hacks
> If you already use Xresources:
> ```conf
> # ~/.Xresources
> i3wm.host: my-laptop
> ```
> Then in i3:
> ```conf
> set_from_resource $host i3wm.host default
> include "~/.config/i3/hosts/$host.conf"
> ```
> 
> That’s it. Split, sort, and reload. Clean, trackable dotfiles without one monster file.
> 
> #i3wm #linux #dotfiles #windowmanager #productivity
<!-- UID: add54340-6074-47c2-8e07-f2b8c735e1bf -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:35 AM
> How do I get emacs to treat these files as `Conf[Space]` instead of `Conf[Unix`? The default i3 config file uses `Conf[Space]` and it looks wierd otherwise.
<!-- UID: 7b3e3842-c437-4f6f-9c2f-719087732322 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:35 AM
> Yep. Emacs defaults most `*.conf` files to **Conf\[Unix]** (`conf-unix-mode`). i3’s syntax is space-separated, so you want **Conf\[Space]** (`conf-space-mode`). Pick one of these—fastest first:
> 
> ## 1) Per-file modeline (bulletproof)
> Add this as the first line of each i3 fragment:
> ```conf
> # -*- mode: conf-space; -*-
> ```
> or at the bottom:
> ```conf
> # Local Variables:
> # mode: conf-space
> # End:
> ```
> 
> ## 2) Directory-local (set once for the whole folder)
> Put this in `~/.config/i3/.dir-locals.el` (or inside `conf.d/` if you only want it there):
> ```elisp
> ((nil . ((mode . conf-space))))
> ```
> This forces **Conf[Space]** for any file opened in that directory tree.
> 
> ## 3) Regex rule in your init (global, zero friction)
> In your `init.el` or `~/.spacemacs` (`dotspacemacs/user-config` block):
> ```elisp
> (add-to-list 'auto-mode-alist '("/\\.config/i3/.*\\.conf\\'" . conf-space-mode))
> ;; Optional: also force the main file if needed (usually already handled)
> (add-to-list 'auto-mode-alist '("/\\.config/i3/config\\'" . conf-space-mode))
> ```
> This catches your split `conf.d/*.conf` files and opens them as **Conf[Space]**.
> 
> ### One-off switch
> Already in a buffer? `M-x conf-space-mode` and you’re done.
> 
> ### Why this matters
> - **Conf[Space]** understands “`key value`” style (i3).
> - **Conf[Unix]** assumes “`key=value`” and highlights/parses differently—looks wrong for i3.
> 
> Pick #2 or #3 for convenience, #1 if you want the files to be self-describing even outside your editor.
> 
> #emacs #spacemacs #i3wm #conf-mode #dotfiles #productivity
<!-- UID: a2f8d2b4-9033-4225-a204-2b1d47ccaa48 -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:45 AM
> That `.dir-locals.el` makes my `SPC f f` output 
> 
> ```
> dired-internal-noselect: Wrong type argument: stringp, nil [5 times]
> ```
<!-- UID: 1a0f4c17-d315-4249-aa5f-297b369647b9 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:45 AM
> Yeah, that error screams “broken `.dir-locals.el`.” When Emacs reads it and ends up setting something (often `default-directory`) to `nil`, `dired` blows up with `Wrong type argument: stringp, nil`.
> 
> ## Fix it fast
> 1. **Temporarily disable it** to confirm:
>  ```bash
>  mv ~/.config/i3/.dir-locals.el ~/.config/i3/.dir-locals.el.bak
>  ```
>  Try `SPC f f` again. If it’s fine, your `.dir-locals.el` is the culprit.
> 
> 2. **Use a known-good minimal file** (this one is safe and correct):
>  ```lisp
>  ;; ~/.config/i3/.dir-locals.el
>  ((nil . ((mode . conf-space))))
>  ```
>  That’s it—no quotes, no extra parens, no eval.
> 
> 3. **Reload dir locals** in an open i3 file: `M-x normal-mode` (or just reopen the file).
> 
> ## If it still barks
> - Turn on a backtrace: `M-x toggle-debug-on-error`, hit `SPC f f`, and check the stack. 
> - Inspect what Emacs thinks your dir locals are:
>  ```elisp
>  M-: (dir-locals-collect-variables default-directory)
>  ```
>  If you see anything touching `default-directory` or some weird non-strings, that’s your bug.
> 
> ## Safer alternative (skip `.dir-locals.el`)
> Frankly, the **least fragile** solution is to hard-map these files in your config and forget about directory locals:
> 
> ```elisp
> ;; In ~/.spacemacs, inside dotspacemacs/user-config or in init.el
> (with-eval-after-load 'conf-mode
>  (add-to-list 'auto-mode-alist
>  '("\\.config/i3/\\(?:config\\|.*\\.conf\\)\\'" . conf-space-mode)))
> ```
> 
> Reload Spacemacs (`SPC f e R`) and you’re done. No dir-local parsing at all, zero chance of clobbering `default-directory`.
> 
> ## Common gotchas that cause your exact error
> - Extra quoting or missing parens, e.g. `'((nil . ((mode . conf-space))))` or `((nil . (mode . conf-space)))`
> - Using `eval` wrong, e.g. `((nil . ((eval . (conf-space-mode)))))` without marking it safe (don’t bother)
> - Accidentally setting `default-directory` (or any var expecting a string) to `nil` or a non-string
> 
> If you want to stick with `.dir-locals.el`, use the **exact** 2-liner above. Otherwise, use `auto-mode-alist` and move on.
> 
> #emacs #spacemacs #i3wm #conf-mode #dotfiles #productivity
<!-- UID: 19e4151f-84f7-423c-96d9-edbd64e75d34 -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:49 AM
> I think.. it's cause of that nil... shouldn't that be something else... cause that is saying to do that to *every* buffer you open in that dir no? including the the helm dir interface? Like spc f f allows me to open *files* in that folder, but it does not allow me to open the dir.
<!-- UID: 3ed1d2e4-8a0c-4734-a684-7dbc57c6efb9 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:49 AM
> You’re right: `((nil . ((mode . conf-space))))` applies to *every* buffer under that dir. That can stomp on Dired/Helm buffers, which is why `SPC f f` explodes.
> 
> Use one of these **scoped** fixes instead:
> 
> ## A) Cleanest (Emacs 28+): remap only Conf\[Unix] → Conf\[Space]
> `~/.config/i3/.dir-locals.el`
> ```lisp
> ((nil . ((major-mode-remap-alist . ((conf-unix-mode . conf-space-mode))))))
> ```
> This only flips buffers that *would* be `conf-unix-mode`. Dired/Helm are untouched.
> 
> ## B) Works everywhere: only when the buffer is already conf-unix
> `~/.config/i3/.dir-locals.el`
> ```lisp
> ((conf-unix-mode . ((mode . conf-space))))
> ```
> This targets just those conf buffers; Dired stays Dired.
> 
> Reload with `M-x normal-mode` (or reopen files).
> 
> ### If you’d rather avoid dir-locals entirely
> In your `init.el`/`~/.spacemacs`:
> ```elisp
> (with-eval-after-load 'conf-mode
>  (add-to-list 'auto-mode-alist
>  '("\\.config/i3/\\(?:config\\|.*\\.conf\\)\\'" . conf-space-mode)))
> ```
> 
> Tip: sanity check what’s being applied:
> ```elisp
> M-: (dir-locals-collect-variables default-directory)
> ```
> 
> This keeps i3 fragments pretty while leaving file pickers alone. #emacs #spacemacs #dirlocals #i3wm #confmode
<!-- UID: 1ad41fec-7ca8-4827-af18-d1621b022a0e -->

---




>[!nexus_user] **User** - 08/19/2025 at 8:56 AM
> We are not sure about option A. It gives us a warning, and we are inclined to take it under advisement:
> ```
> The local variables list in /home/err/.config/i3/conf.d/
> or .dir-locals.el contains values that may not be safe (*).
> 
> Do you want to apply it? You can type
> y -- to apply the local variables list.
> n -- to ignore the local variables list.
> ! -- to apply the local variables list, and permanently mark these
>  values (*) as safe (in the future, they will be set automatically.)
> i -- to ignore the local variables list, and permanently mark these
>  values (*) as ignored
> + -- to apply the local variables list, and trust all directory-local
>  variables in this directory
> 
>  * major-mode-remap-alist : ((conf-unix-mode . conf-space-mode))
> ```
<!-- UID: 57d270b7-93e0-4dfb-ac6e-afb396c20cf7 -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 8:56 AM
> Yep—that prompt is normal. Emacs flags any dir-local var it can’t prove is safe. You’ve got three sane paths:
> 
> ## 1) Easiest: don’t use dir-locals for this
> Just map i3 files globally in your init. Zero prompts, no side effects on Dired/Helm.
> ```elisp
> ;; ~/.spacemacs (dotspacemacs/user-config) or init.el
> (with-eval-after-load 'conf-mode
>  (add-to-list 'auto-mode-alist
>  '("\\.config/i3/\\(?:config\\|.*\\.conf\\)\\'" . conf-space-mode)))
> ```
> This is what I’d do.
> 
> ## 2) Keep dir-locals, but target only conf files (no warning)
> This uses the `mode` var (generally considered safe) and only flips buffers that entered `conf-unix-mode`.
> ```lisp
> ;; ~/.config/i3/.dir-locals.el
> ((conf-unix-mode . ((mode . conf-space))))
> ```
> 
> ## 3) If you insist on Option A, whitelist it precisely
> Tell Emacs that **only** this value for `major-mode-remap-alist` is safe:
> ```elisp
> ;; init.el or ~/.spacemacs user-config
> (put 'major-mode-remap-alist 'safe-local-variable
>  (lambda (v) (equal v '((conf-unix-mode . conf-space-mode)))))
> ```
> Now your `.dir-locals.el` can be:
> ```lisp
> ((nil . ((major-mode-remap-alist . ((conf-unix-mode . conf-space-mode))))))
> ```
> …and Emacs won’t nag.
> 
> ### Why the warning?
> `major-mode-remap-alist` changes how modes are chosen. Emacs plays paranoid and asks. You can hit `!` once to mark it safe, but if you want reproducibility in dotfiles, prefer #1 or #2.
> 
> Quick sanity check any time:
> ```elisp
> M-: (dir-locals-collect-variables default-directory)
> ```
> 
> My take: go with **#1** (global `auto-mode-alist`) unless you truly need per-dir behavior. It’s clean and won’t surprise future you.
> 
> #emacs #spacemacs #dirlocals #i3wm #confmode #dotfiles
<!-- UID: 79f9a50f-8b86-456b-abfa-69df797cf6a7 -->

---




>[!nexus_user] **User** - 08/19/2025 at 9:03 AM
> I donno how #2 would surprise me in the future... a dir-local is more declarative than the spacemacs user config... that file gets really bloated, and things get lost easy...
<!-- UID: 3d963081-deb2-460e-8758-9a80ab1e712e -->




>[!nexus_agent] **Assistant** - 08/19/2025 at 9:03 AM
> Yeah, I’m with you—**dir-locals** is the right, declarative place for this. Use the scoped rule (#2) and you won’t touch Dired/Helm at all.
> 
> ## Do this
> Create `~/.config/i3/.dir-locals.el` (or put it in `conf.d/` if that’s where you edit) with exactly:
> ```lisp
> ((conf-unix-mode . ((mode . conf-space))))
> ```
> - This only fires **after** Emacs picks `conf-unix-mode` for a buffer, then flips it to `conf-space-mode`.
> - Dired/Helm/Projectile buffers don’t use `conf-unix-mode`, so they’re untouched. No prompts, no breakage.
> 
> ## Verify it’s working
> 1. Open one of your `*.conf` fragments.
> 2. `M-x describe-mode` → should say `Conf[Space]`.
> 3. If it still shows `Conf[Unix]`: `M-x normal-mode` (re-applies dir-locals).
> 
> ## Why this is safe
> - Key is **`conf-unix-mode`** on the left, not `nil`. So only conf buffers get the change.
> - Setting `mode` in dir-locals is a **safe local variable**; Emacs won’t nag.
> - It’s self-contained with your dotfiles—no spelunking in a bloated `~/.spacemacs`.
> 
> If you later want to cover oddballs that still fall into `conf-mode` (rare), you can add a second clause:
> ```lisp
> ((conf-unix-mode . ((mode . conf-space))))
> ((conf-mode . ((mode . conf-space))))
> ```
> …but start simple; the first line usually covers i3 fragments.
> 
> That’s it—declarative, minimal blast radius, future-proof.
> 
> #emacs #spacemacs #dirlocals #i3wm #confmode #dotfiles
<!-- UID: da1af377-0239-4676-bbe7-ba7bbf9f576d -->

---


