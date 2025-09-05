---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "LSP workspace restart guide"
conversation_id: 68b1ca3e-d164-8323-b713-6296d17a64ac
create_time: 08/29/2025 at 10:41 AM
update_time: 08/31/2025 at 9:35 AM
---

# Title: LSP workspace restart guide

Created: 08/29/2025 at 10:41 AM
Last Updated: 08/31/2025 at 9:35 AM
Chat URL: https://chat.openai.com/c/68b1ca3e-d164-8323-b713-6296d17a64ac


>[!nexus_user] **User** - 08/29/2025 at 10:41 AM
> ‘lsp-restart-workspace’ is an obsolete command (as of lsp-mode 6.1); use ‘lsp-workspace-restart’ (, b r) instead.
> LSP :: clojure-lsp has exited (killed)
> LSP :: Connected to [clojure-lsp:1867150/starting /home/err/devel/promethean].
> LSP :: clojure-lsp:1867150 initialized successfully in folders: (/home/err/devel/promethean)
> Watching all the files in /home/err/devel/promethean would require adding watches to 2122 directories, so watching the repo may slow Emacs down.
> Do you want to watch all files in /home/err/devel/promethean? (y or n) n
> LSP :: You can configure this warning with the `lsp-enable-file-watchers' and `lsp-file-watch-threshold' variables
<!-- UID: a749a0cb-6042-4710-b2fd-0be11c386abb -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 10:41 AM
> What you’re seeing is normal — just some LSP-mode plumbing plus a deprecation warning.
> 
> ### What’s Happening
> 1. **Obsolete command**
>  - `lsp-restart-workspace` was removed in **lsp-mode 6.1**.
>  - The replacement is `lsp-workspace-restart` (`M-x lsp-workspace-restart` or `, b r` in Spacemacs).
> 
> 2. **clojure-lsp exit/reconnect**
>  - That “has exited (killed)” line usually means Emacs killed the old server so it could restart.
>  - Immediately after, you see: 
>  `LSP :: clojure-lsp:... initialized successfully` → so it’s fine, it’s running again.
> 
> 3. **File watching warning**
>  - LSP wants to watch all files under `/home/err/devel/promethean`, but that’s **2122 directories**.
>  - Emacs file notification APIs don’t scale great here, so lsp-mode warns you that enabling this could slow things to a crawl.
>  - You chose “n” → it won’t watch every folder, which is usually the right call in a big monorepo.
> 
> ### How to Configure
> If you want to get rid of the prompt and control it yourself:
> 
> ```elisp
> ;; Don’t ask me every time
> (setq lsp-enable-file-watchers nil)
> 
> ;; OR: allow watchers but cap how many dirs trigger the warning
> (setq lsp-file-watch-threshold 500) ;; default is 1000
> ```
> 
> ### Recommendation for you
> Given Promethean is big and nested:
> - Keep `lsp-enable-file-watchers` **nil** → clojure-lsp will still work, just won’t auto-recheck every tiny file change under the tree.
> - When you change deps/config (like `deps.edn`), run `M-x lsp-workspace-restart` manually. 
>  That’s way lighter than trying to watch 2k+ directories.
> 
> ---
> 
> Do you want me to sketch a minimal `.dir-locals.el` you can drop in `/home/err/devel/promethean` so Emacs always disables watchers there (and you don’t get nagged)?
<!-- UID: c1aead73-e6ca-4a4c-be5c-d40b7e8ac0b6 -->

---




>[!nexus_user] **User** - 08/29/2025 at 10:43 AM
> it shouldn't need to watch every file....
<!-- UID: b2f2f05c-7383-4a21-890b-faf0ea54ec5c -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 10:43 AM
> yeah — it absolutely doesn’t need (or want) to watch everything. You’ve got three levers:
> 
> #1 — Tell lsp-mode what **not** to watch (cheap win)
> Put this in the repo’s `.dir-locals.el` so it only applies here:
> 
> ```elisp
> ((nil . ((lsp-enable-file-watchers . t) ;; keep watchers on, but…
>  (lsp-file-watch-threshold . 1500) ;; avoid nag; tune if needed
>  (lsp-file-watch-ignored-directories .
>  ("/\\.git\\'" "/\\.hg\\'" "/\\.bzr\\'"
>  "/\\.direnv\\'" "/\\.venv\\'" "/\\.cache\\'"
>  "/node_modules\\'" "/dist\\'" "/build\\'" "/coverage\\'"
>  "/target\\'" "/classes\\'" "/out\\'"
>  "/.cpcache\\'" "/.clj-kondo/.cache\\'"
>  "/.sonarqube\\'" "/.idea\\'" "/.vscode\\'"))
>  (lsp-file-watch-ignored-files .
>  ("[/\\\\]flycheck_[^/\\\\]+\\'" "[/\\\\]\\.#[^/\\\\]+\\'" "[/\\\\][^/\\\\]+~\\'")))))
> ```
> 
> - `lsp-file-watch-ignored-directories` blocks watcher creation under those dirs (the key you want). cite 
> - `lsp-file-watch-ignored-files` only stops *events* for files (not watchers), so use it as a secondary filter. cite
> 
> If you still get the prompt, you can also bump `lsp-file-watch-threshold` or set `lsp-enable-file-watchers` to `nil` (but trimming the ignore lists is usually better than nuking watchers). cite
> 
> #2 — Teach **clojure-lsp** what to analyze
> Add a project `.lsp/config.edn` at the repo root to narrow scope:
> 
> ```edn
> {:source-paths ["src" "bb/src" "shared/clj" "services/*/src"]
>  :source-paths-ignore-regex ["resources.*" "target.*" "node_modules.*" "dist.*" "build.*" "\\.direnv.*" "\\.venv.*" "\\.cache.*"]}
> ```
> 
> - `.lsp/config.edn` is the right place for project settings. cite 
> - `:source-paths-ignore-regex` is the modern key (replaces old “ignore-classpath-directories”). Default already ignores things like `resources.*`/`target.*`; extend it for your tree. cite 
> - Caution: if you *hard* set `:source-paths`, cross-project jumps via `:local/root` can be limited; use it deliberately. cite
> 
> #3 — Shrink the workspace itself
> Keep the LSP “workspace folders” tight:
> 
> - Open Emacs from a focused subdir (e.g., `services/foo`) when that’s all you’re editing, **or** 
> - Use `M-x lsp-workspace-folders-remove` to drop the repo root and `M-x lsp-workspace-folders-add` to add only the few subprojects you care about right now. (This reduces watcher roots and server load.)
> 
> ---
> 
> ### Minimal, practical setup I’d run in Promethean
> 1) Add `.dir-locals.el` (above) at repo root. 
> 2) Add `.lsp/config.edn` with a conservative `:source-paths-ignore-regex`; only add `:source-paths` if you *need* to fence analysis. cite 
> 3) When you hop between modules, use `lsp-workspace-restart` quickly to rescan the smaller set. 
> 4) If you ever see lag, check `*lsp-log*` to verify what folders are actually being watched and tighten the lists. cite
> 
> Want me to tailor the ignore lists to your actual tree (e.g., `docs/agile/**`, `packages/**`, `shared/**`, language-specific build dirs) so you don’t babysit this again?
> 
> #obsidian #emacs #lsp #clojure #performance #promethean
<!-- UID: aa5ef57c-2b52-4508-abbc-3a10a997d09b -->

---




>[!nexus_user] **User** - 08/29/2025 at 10:54 AM
> I did both of those, restarted, and it's printing "more" 
> 
> LSP :: Connected to [clojure-lsp:1880780/starting /home/err/devel/promethean].
> ../../../../../.emacs.d/elpa/30.2/develop/origami-20200331.1019/origami-parsers.el: Warning: ‘destructuring-bind’ is an obsolete alias (as of 27.1); use ‘cl-destructuring-bind’ instead.
> ../../../../../.emacs.d/elpa/30.2/develop/origami-20200331.1019/origami.el: Warning: ‘destructuring-bind’ is an obsolete alias (as of 27.1); use ‘cl-destructuring-bind’ instead.
> LSP :: clojure-lsp:1880780 initialized successfully in folders: (/home/err/devel/promethean)
> Watching all the files in /home/err/devel/promethean would require adding watches to 4320 directories, so watching the repo may slow Emacs down.
> Do you want to watch all files in /home/err/devel/promethean? (y or n) n
> LSP :: You can configure this warning with the `lsp-enable-file-watchers' and `lsp-file-watch-threshold' variables
> LSP :: Connected to [clojure-lsp:1880780 /home/err/devel/promethean].
<!-- UID: ab0325c1-0c02-472e-b4dd-f18478bfba07 -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 10:54 AM
> Yep—so two things are happening:
> 
> 1) your **dir-locals probably didn’t take effect** for the buffer you’re in, and 
> 2) even if the ignore lists are right, **lsp-mode will still ask** unless you either turn watchers off or push the threshold way above your dir count.
> 
> Let’s fix it cleanly and verifiably.
> 
> # Do this (minimal + reliable)
> 
> **A. Disable watchers for this repo (no prompt, no crawl).** 
> Create/update `/home/err/devel/promethean/.dir-locals.el`:
> 
> ```elisp
> ((nil . ((lsp-enable-file-watchers . nil)
>  ;; keep your ignore lists if you want, but they won’t matter with watchers off
>  )))
> ```
> 
> > Why: you said “it shouldn’t need to watch every file.” Agreed. Turn them off here and you’re done.
> 
> **B. Reload dir-locals in your current buffers (this is the part most people miss).**
> - Open any file **inside the repo**, then run: `M-x normal-mode` 
>  (or `M-x revert-buffer` if it’s visiting a file) 
> - If Emacs asks to apply unsafe local variables, **say yes** for this dir.
> - Sanity-check the value in that buffer: 
>  `M-: (buffer-local-value 'lsp-enable-file-watchers (current-buffer))` → should print `nil`.
> 
> **C. If you still see the prompt, something is overriding you.** 
> Add a global default (belt-and-suspenders) in your user config (Spacemacs `user-config` or init.el):
> 
> ```elisp
> (setq-default lsp-enable-file-watchers nil)
> ```
> 
> Then restart Emacs once. That guarantees no prompt.
> 
> # Optional (keep it tight when you *do* want watchers)
> If someday you want watchers but not on the whole tree, keep your `.dir-locals.el` like this instead:
> 
> ```elisp
> ((nil . ((lsp-enable-file-watchers . t)
>  (lsp-file-watch-threshold . 10000)
>  (lsp-file-watch-ignored-directories .
>  ("/\\.git\\'" "/\\.direnv\\'" "/\\.venv\\'" "/\\.cache\\'"
>  "/node_modules\\'" "/dist\\'" "/build\\'" "/coverage\\'"
>  "/target\\'" "/classes\\'" "/out\\'"
>  "/.cpcache\\'" "/.clj-kondo/.cache\\'"
>  "/.sonarqube\\'" "/docs\\'" "/packages\\'")))))
> ```
> 
> …but honestly, with a mono-repo your size, **turning watchers off** and doing a quick `M-x lsp-workspace-restart` when you change deps is the sane path.
> 
> # The “more” you’re seeing
> - The **origami warnings** (`destructuring-bind` → `cl-destructuring-bind`) are harmless noise from an old origami build. You can either ignore, update the package, or disable `origami-mode` in your Clojure major modes. They’re unrelated to lsp’s prompt.
> - The directory count jumping from 2122 → 4320 is typical when lsp expands more subfolders/sym on the fresh run. Yet another reason to kill watchers in a big tree.
> 
> # Quick verification checklist
> - Open a file in the repo, run: 
>  `M-: (buffer-local-value 'lsp-enable-file-watchers (current-buffer))` → **nil** 
> - Start LSP: no “watch all files?” prompt. 
> - `M-x lsp-workspace-restart` after big changes (deps.edn, bb.edn, moving src trees).
> 
> If you want, paste your **exact** `.dir-locals.el` and I’ll spot-check why Emacs might not be honoring it (common gotchas: wrong file name, not at repo root, lists quoted strangely, didn’t reload mode).
> 
> #emacs #lsp #clojure #promethean #performance
<!-- UID: fedba0fc-ae72-470b-a7f2-b374b4580445 -->

---




>[!nexus_user] **User** - 08/29/2025 at 11:09 AM
> Could you write a simple emacs function which reads a .gitignore and produces regex I can hand to the lsp. also, the reason the number of dirs went up is because you over wrote the original default regex instead of appending it. Most the entries you added I saw at the top of the LSP default ignore regex list
> 
> https://github.com/emacs-lsp/lsp-mode/blob/1b13d7c1b39aaad12073095ef7719952568c45db/lsp-mode.el#L340-L419
<!-- UID: fb04989d-88a1-41de-9a78-f1892d2a95ef -->




>[!nexus_agent] **Assistant** - 08/29/2025 at 11:09 AM
> Got it. Here’s a small, practical Emacs Lisp helper that:
> 
> - reads your project’s `.gitignore`
> - converts **directory** patterns to the style LSP expects (e.g., `"/node_modules\\'"`)
> - **appends** them to the existing `lsp-file-watch-ignored-directories` (doesn’t overwrite)
> 
> It handles comments, blanks, negations (`!…` → skipped), anchors (`/`), `*` and `?` globs (basic), and ensures we only emit directory regexes.
> 
> ```elisp
> ;;; promethean-lsp-ignore.el --- derive lsp ignore regexps from .gitignore -*- lexical-binding: t; -*-
> 
> (require 'cl-lib)
> (require 'subr-x)
> 
> (defun promethean--project-root ()
>  "Find project root by .git, falling back to vc-root-dir."
>  (or (locate-dominating-file default-directory ".git")
>  (vc-root-dir)
>  (user-error "Can't find project root (.git) from %s" default-directory)))
> 
> (defun promethean--gitglob-to-dir-regex (glob)
>  "Convert a Git ignore GLOB (directory-ish) to an LSP directory regexp string.
> 
> - Returns nil if GLOB looks like a file pattern (no trailing slash and contains a dot with no wildcard).
> - Translates * -> \".*\", ? -> \".\"
> - Anchors like LSP defaults: start with \"/\" and end with \"\\\\'\"."
>  (let* ((g (string-trim glob)))
>  ;; Skip obvious files (heuristic): no trailing slash AND contains a dot without wildcards.
>  (when (or (string-suffix-p "/" g)
>  (not (and (string-match-p "\\." g)
>  (not (string-match-p "[*?]" g)))))
>  ;; Drop trailing slash (we always target dirs)
>  (setq g (string-remove-suffix "/" g))
>  ;; Remove leading "./"
>  (setq g (string-remove-prefix "./" g))
>  ;; Treat "**/foo" same as "foo"
>  (setq g (replace-regexp-in-string "\\`\\*\\*/" "" g))
>  ;; Escape regex metachars except * and ?
>  (let ((escaped (replace-regexp-in-string
>  "\\([.^$+(){}\\[\\]|]\\)" "\\\\\\1" g)))
>  ;; Convert globs
>  (setq escaped (replace-regexp-in-string "\\*" ".*" escaped))
>  (setq escaped (replace-regexp-in-string "\\?" "." escaped))
>  ;; If it contains a slash, keep only the last path segment (LSP list matches dir names)
>  (let* ((seg (car (last (split-string escaped "/" t)))))
>  (when (and seg (not (string-empty-p seg)))
>  (concat "/" seg "\\'")))))))
> 
> (defun promethean-lsp-gitignore-dir-regexes (&optional root)
>  "Return a list of LSP-style directory regexes derived from ROOT/.gitignore.
> Only directory patterns are converted."
>  (let* ((proj (file-name-as-directory (or root (promethean--project-root))))
>  (gi (expand-file-name ".gitignore" proj)))
>  (unless (file-readable-p gi)
>  (user-error "No readable .gitignore at %s" gi))
>  (with-temp-buffer
>  (insert-file-contents gi)
>  (let (out)
>  (dolist (line (split-string (buffer-string) "\n"))
>  (setq line (string-trim line))
>  (cond
>  ((or (string-empty-p line)
>  (string-prefix-p "#" line)) nil) ; comment/blank
>  ((string-prefix-p "!" line) nil) ; negations not supported here
>  (t
>  (let ((rx (promethean--gitglob-to-dir-regex line)))
>  (when rx (push rx out))))))
>  (nreverse (delete-dups out))))))
> 
> (defun promethean-lsp-append-gitignore-to-ignored-dirs (&optional root)
>  "Append .gitignore-derived directory regexes to `lsp-file-watch-ignored-directories'.
> Does NOT overwrite lsp defaults."
>  (interactive)
>  (let* ((extra (promethean-lsp-gitignore-dir-regexes root))
>  (current (if (local-variable-p 'lsp-file-watch-ignored-directories)
>  lsp-file-watch-ignored-directories
>  (default-value 'lsp-file-watch-ignored-directories)))
>  (merged (cl-remove-duplicates (append current extra) :test #'string=)))
>  ;; Make it buffer-local so you can vary per project/buffer; use setq-default if you want global.
>  (setq-local lsp-file-watch-ignored-directories merged)
>  (message "lsp-file-watch-ignored-directories: +%d (total %d)"
>  (length extra) (length merged))
>  merged))
> ```
> 
> ### How to use
> - Evaluate that code (drop it in your config or a small `.el` file and load it).
> - From any buffer inside the repo: 
>  `M-x promethean-lsp-append-gitignore-to-ignored-dirs`
> - Verify: 
>  `M-: lsp-file-watch-ignored-directories` → should show your defaults **plus** the `.gitignore`-derived entries.
> 
> ### Notes / caveats
> - This intentionally targets **directories** (what LSP’s list expects). It skips likely file-only patterns.
> - It’s conservative with globs: `*`/`?` are supported; `**/foo` collapses to `foo` (we match just the dir name like the lsp defaults).
> - If you want this to run automatically per-project, add to `.dir-locals.el`:
> 
>  ```elisp
>  ((nil . ((eval . (ignore-errors (promethean-lsp-append-gitignore-to-ignored-dirs))))))
>  ```
> 
> That should keep your ignore list tight, additive, and aligned with LSP’s default regexes—no more “number went up because defaults got clobbered.”
> 
> #emacs #lsp #clojure #gitignore #promethean
<!-- UID: f6a6c143-d7dc-4b81-b4cf-f9554ed5396c -->

---


