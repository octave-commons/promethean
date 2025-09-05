---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Understanding autoload in Emacs"
conversation_id: 68b1d564-d4c0-8327-8a12-af1ca851694a
create_time: 08/29/2025 at 11:29 AM
update_time: 08/31/2025 at 9:34 AM
---

# Title: Understanding autoload in Emacs

Created: 08/29/2025 at 11:29 AM
Last Updated: 08/31/2025 at 9:34 AM
Chat URL: https://chat.openai.com/c/68b1d564-d4c0-8327-8a12-af1ca851694a


>[!nexus_user] **User** - 08/29/2025 at 11:29 AM
> help me understand ;;;###autoload in emacs better
<!-- UID: 7be9aab7-b49a-41db-a0bd-84a73b9e3ff4 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 11:29 AM
> Alright, here’s the straight story on `;;;###autoload` in Emacs Lisp. 
> 
> ---
> 
> ## What `;;;###autoload` Does
> - It’s a **cookie** (a magic comment) that Emacs’ build system (`update-file-autoloads` or `M-x update-directory-autoloads`) looks for. 
> - When it sees this marker, it **writes out an autoload form** into `loaddefs.el` (or whatever autoloads file you’re generating). 
> - That form will look like:
> 
>  ```elisp
>  (autoload 'some-function "some-file" "Docstring." t)
>  ```
> 
> - Meaning: Emacs doesn’t load the file right away. Instead, it installs a **stub function**. When you call it, Emacs loads the file and then runs the real function.
> 
> ---
> 
> ## Why It Exists
> - To make Emacs **faster to start**. 
> - Without autoloads, Emacs would need to `require` or `load` hundreds of packages up front. 
> - With autoloads, it only loads a package when the user actually uses it (e.g. first call to `M-x magit-status`).
> 
> ---
> 
> ## Typical Usage
> You usually see:
> 
> ```elisp
> ;;;###autoload
> (defun my-feature-do-thing ()
>  "Does a thing."
>  (message "Did a thing!"))
> ```
> 
> - When you build the package, that gets turned into an `(autoload 'my-feature-do-thing ...)`. 
> - So even before `my-feature.el` is loaded, Emacs knows: 
>  - There’s a command called `my-feature-do-thing`. 
>  - If the user calls it, load `my-feature.el` and run it. 
> 
> ---
> 
> ## Other Uses
> You can also mark:
> - **Variables** 
> 
>  ```elisp
>  ;;;###autoload
>  (defvar my-feature-option t
>  "Non-nil enables My Feature.")
>  ```
> 
> - **`custom-autoload` forms** for `defcustom`s. 
> - **`add-to-list` or `defalias`** at top-level if they should be set at loaddefs time. 
> 
> ---
> 
> ## The Catch
> - `;;;###autoload` is not executed by Emacs at runtime. 
>  It’s purely for `update-file-autoloads`. 
> - If you just stick it in a file but never generate autoloads, nothing happens. 
> - That’s why most packages have a `-autoloads.el` file in their repo (auto-generated, don’t edit by hand).
> 
> ---
> 
> ## Key Files
> - `lisp/loaddefs.el` → The big autoloads file bundled with Emacs. 
> - `<package>-autoloads.el` → What `package.el` generates when installing packages. 
> 
> ---
> 
> ## TL;DR
> - **What:** Magic comment telling Emacs’ build to generate an `autoload` form. 
> - **Why:** Faster startup, lazy loading. 
> - **How:** Stick it before `defun`, `defvar`, etc. Run `update-file-autoloads`. 
> - **Don’t confuse:** It doesn’t *do* anything at runtime by itself.
> 
> ---
> 
> Do you want me to also write you a **minimal example repo** with one `.el` file and an autoloads generator, so you can run it and see exactly what gets written out?
<!-- UID: 69ee97f8-b636-48bb-94c7-c47adca33970 -->

---




>[!nexus_user] **User** - 08/29/2025 at 11:33 AM
> I'm using spacemacs so... I think a bunch of that stuff is hidden from me when I am using their layers system correctly.
<!-- UID: 50495c7a-4a64-4656-a26f-e9a03715919a -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 11:33 AM
> Yep — if you’re using **Spacemacs layers**, most of the autoload machinery is hidden away. Here’s how it plays out in your setup:
> 
> ---
> 
> ## How Spacemacs Uses Autoloads
> - **Layers are basically packages.** When you enable a layer, Spacemacs pulls in a set of `.el` files. 
> - Those packages ship with `*-autoloads.el` files already generated (either upstream from MELPA/ELPA or produced by Spacemacs during sync). 
> - When you start Emacs, Spacemacs loads those autoload stubs, not the whole package. 
> - That’s why you can `M-x magit-status` immediately after enabling the `git` layer, even if `magit.el` isn’t loaded yet.
> 
> ---
> 
> ## What’s Hidden From You
> - You don’t usually run `update-file-autoloads` yourself — package.el (and by extension Spacemacs) does that when installing/updating packages. 
> - You don’t edit `*-autoloads.el` files — those are auto-generated. 
> - The `;;;###autoload` cookies still exist in the upstream package source, but you may never notice unless you dig into `~/.emacs.d/elpa/...`.
> 
> ---
> 
> ## Where You *Do* Touch This
> - **Custom functions in your dotspacemacs file.** 
>  If you define a command that you want to be discoverable immediately (before loading your full config), you can still mark it with `;;;###autoload`. 
>  But in practice, most Spacemacs users just put stuff in `dotspacemacs/user-config` and let it load with their config, because startup speed is already heavily optimized by Spacemacs. 
> 
> - **If you write a custom Spacemacs layer.** 
>  That’s when `;;;###autoload` matters. You’d put it before your `defun`s so Spacemacs (or the package manager) can generate autoloads and users can call your commands without requiring the whole layer at startup.
> 
> ---
> 
> ## The Practical Takeaway
> For you:
> - You don’t need to manage autoloads directly unless you’re **writing your own layers or packages**. 
> - When hacking your `dotspacemacs`, it’s fine to just `require` things directly. 
> - If you want to play nice with Spacemacs’ lazy-loading, learn the `spacemacs|use-package-add-hook` and `use-package` patterns — they handle the same “don’t load until needed” goal as autoloads, but in a way Spacemacs already wires up.
> 
> ---
> 
> 👉 Would it help if I showed you a **minimal custom layer example** where I add a command with `;;;###autoload` and then show how Spacemacs picks it up lazily? That way you’d see the one case where it’s actually relevant in your workflow.
<!-- UID: 40557349-30f3-43ea-aa6c-5d19ecbe89ba -->

---




>[!nexus_user] **User** - 08/29/2025 at 11:35 AM
> we are trying to do this the slow and methodical way, because we want to grok the layer system. There is the fast fast I some times do, dumping a shit load of stuff really really fast then there is the slow fast, where I am thinking every key stroke through with great care, aiming to maximize my returns. Trying to hold what is in front of my head.
<!-- UID: c7a8b5b9-8cf4-4397-9ef0-25263c2c6469 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 11:35 AM
> got it. slow-fast mode. here’s a compact, methodical path to *really* understand how Spacemacs layers + `;;;###autoload` work, without hand-waving.
> 
> ---
> 
> # Spacemacs autoloads: a hands-on lab
> 
> ## 0) Ground rules (what you’re proving to yourself)
> - An **autoload cookie** in your layer sources results in an **autoload form** in an `-autoloads.el` file.
> - That autoload form creates a **stub**; calling it loads the real file.
> - Spacemacs’ layer system piggybacks on **package.el** and **use-package** for lazy loading, but you can still use cookies for your own layer code.
> 
> ---
> 
> ## 1) Create a private layer the right way (visible, minimal, testable)
> 
> **Paths**
> - Private layer root: `~/.emacs.d/private/` (or `~/.config/spacemacs/private/` if you run the “dotfile in XDG” setup).
> - We’ll make: `~/.emacs.d/private/autoload-lab/`
> 
> **Files**
> ```
> autoload-lab/
> ├─ packages.el
> ├─ funcs.el
> └─ keybindings.el
> ```
> 
> **packages.el**
> ```elisp
> (defconst autoload-lab-packages '())
> 
> (defun autoload-lab/init ()
>  ;; empty on purpose; we’re testing our own code/autoloads, not external pkgs
>  )
> ```
> 
> **funcs.el**
> ```elisp
> ;;; funcs.el --- autoload lab -*- lexical-binding: t; -*-
> 
> ;;;###autoload
> (defun autoload-lab/hello ()
>  "Proof: this function should be autoloaded."
>  (interactive)
>  (message "[autoload-lab] hello (file loaded: %s)" (buffer-file-name)))
> ```
> 
> **keybindings.el**
> ```elisp
> ;;; keybindings.el --- autoload lab keys -*- lexical-binding: t; -*-
> 
> ;; Optional: bind a key under SPC o h for quick test.
> ;; This is safe because the autoload stub will exist.
> (with-eval-after-load 'evil-leader
>  (spacemacs/set-leader-keys
>  "oh" 'autoload-lab/hello))
> ```
> 
> **Enable layer**
> In `dotspacemacs-configuration-layers` add:
> ```elisp
> autoload-lab
> ```
> 
> **Sync**
> - `SPC f e R` (reload dotfile)
> - `SPC f e D` (open dotfile if needed)
> - `SPC h r r` (hard reload) or `SPC :` then `spacemacs/sync-configuration-layers`
> 
> **What you expect now**
> - Emacs should generate/refresh autoloads for private layers and install stubs for `autoload-lab/hello`.
> - You should be able to run `M-x autoload-lab/hello` *without manually loading* `funcs.el`.
> 
> ---
> 
> ## 2) Verify the autoload actually exists (no trust, verify)
> 
> From `M-:`, evaluate these:
> 
> 1) Is the symbol fbound? 
> ```elisp
> (fboundp 'autoload-lab/hello)
> ```
> → should be `t`
> 
> 2) Is it an autoload object? 
> ```elisp
> (autoloadp (symbol-function 'autoload-lab/hello))
> ```
> → should be `t` (means it’s a stub)
> 
> 3) Where does Emacs think it’ll load from? 
> ```elisp
> (autoload-do-load (symbol-function 'autoload-lab/hello))
> ```
> (you don’t need to run this normally; it forces the load)
> 
> 4) What file defines it *after* calling once? 
> - Call `SPC o h` or `M-x autoload-lab/hello`
> - Then:
> ```elisp
> (symbol-file 'autoload-lab/hello 'defun)
> ```
> → should return the path to `funcs.el` (real file now loaded)
> 
> ---
> 
> ## 3) Where did the autoload form land?
> 
> Autoloads for private layers typically end up in Spacemacs’ generated autoload files. Two places to check:
> 
> - Search for the symbol across autoloads:
>  - `SPC /` then search `autoload-lab/hello`
> - Common generated files live under:
>  - `~/.emacs.d/.cache/` (Spacemacs cache)
>  - Or check `~/.emacs.d/elpa/*-autoloads.el` (for packages; less relevant for private layer code, but good to know)
> 
> You’ll see a form like:
> ```elisp
> (autoload 'autoload-lab/hello "path/to/funcs" "Proof..." t nil)
> ```
> That’s the stub you’re verifying in step 2.
> 
> ---
> 
> ## 4) Connect this to use-package (Spacemacs’ lazy-loading staple)
> 
> Autoload cookies and `use-package :commands` both create stubs.
> 
> **Rule of thumb**
> - Your own layer code: use `;;;###autoload` above `defun` to create a callable stub.
> - External packages inside layers: use `use-package` with `:commands`, `:mode`, `:hook`, `:bind`, which asks `use-package` to queue autoloads without loading the package.
> 
> **Example (for reference, not needed in this lab):**
> ```elisp
> (use-package ripgrep
>  :commands (ripgrep-regexp rg)
>  :init
>  (spacemacs/set-leader-keys "sr" 'ripgrep-regexp))
> ```
> `ripgrep-regexp` becomes available via autoload; package loads on first call.
> 
> ---
> 
> ## 5) Failure modes (the real debugging value)
> 
> If `M-x autoload-lab/hello` says “void-function” or completion can’t see it:
> 
> - You didn’t run a proper *sync/reload*:
>  - `SPC h r r` (restart Spacemacs env)
>  - `spacemacs/sync-configuration-layers`
> - The file that contains the cookie isn’t in a location scanned by Spacemacs:
>  - Keep functions in `funcs.el` (or a file you definitely load in your layer) 
> - Cookie placement is wrong:
>  - Cookie must be immediately above `defun`/`defvar`—no blank lines, no extra forms between.
> - Byte-compile cache confusion:
>  - `SPC :` → `configuration-layer/delete-orphan-packages`
>  - Blow away `~/.emacs.d/.cache/` if you’re stuck, then relaunch.
> - Multiple defs or stale stubs:
>  - Grep for the symbol in `*autoloads.el` under `elpa/` and `.cache/` to ensure one clean stub.
> 
> ---
> 
> ## 6) Mental model (why this matters for you)
> 
> - **Cookies** give you *surgical* control over which of *your* functions should be available *without* preloading your layer files.
> - **use-package** (Spacemacs-native) gives you *structured lazy-loading* for third-party packages (commands/modes/hooks/keys).
> 
> You can freely mix both—cookies for your custom layer glue, `use-package` for vendor code—while keeping startup fast and behavior predictable.
> 
> ---
> 
> ## 7) Optional: prove keybinding lazy-load works
> 
> You already bound `SPC o h` in `keybindings.el`. The binding points to the *symbol*, not a loaded function—Emacs resolves it via the autoload stub at first press. If that works immediately after a sync, you’ve validated the whole path: **layer → cookie → autoloads → keymap → first call loads real file**.
> 
> ---
> 
> ## 8) Practical heuristics
> 
> - Put **public** layer entry points behind cookies. 
> - Keep **internal helpers** un-autoloaded inside the same file—they’ll load with the first public call anyway. 
> - Prefer **one function = one cookie** (don’t get cute batching them; you’ll hate the debugging). 
> - If you touch external packages, use `use-package` with `:commands` or `:mode` instead of raw `require`.
> 
> ---
> 
> If you want, we can extend the lab to include:
> - a `defvar` and a `defcustom` with autoload handling,
> - a micro-package via `use-package` to see the interaction,
> - a forced “broken autoload” scenario and recovery checklist.
> 
> #emacs #spacemacs #layers #autoload #elisp #slowfast
<!-- UID: 16ab5bcd-722f-497f-b0b8-d2e63a01dfaa -->

---


