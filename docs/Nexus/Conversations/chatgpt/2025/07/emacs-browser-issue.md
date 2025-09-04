---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs browser issue"
conversation_id: 688ab551-72a0-8328-884f-cc927c62025a
create_time: 07/30/2025 at 7:14 PM
update_time: 08/14/2025 at 8:47 AM
---

# Title: Emacs browser issue

Created: 07/30/2025 at 7:14 PM
Last Updated: 08/14/2025 at 8:47 AM
Chat URL: https://chat.openai.com/c/688ab551-72a0-8328-884f-cc927c62025a


>[!nexus_agent] **Assistant** - 07/30/2025 at 7:14 PM
> That definitely sounds like Emacs is interpreting something you're typing as a request to open a `man` page (or maybe a URL), and doing so in a way that launches your browser. Likely causes include:
> 
> ---
> 
> ### 🔍 Likely Culprits
> 
> #### 1. **Evil-mode or `vterm` keybinding overrides**
> If you're in `vterm` or `shell` mode, a misfired keybinding might be interpreted as “open manpage in browser.” For instance:
> - Pressing `K` in some Evil states opens the man page for the symbol at point.
> - `vterm-copy-mode` + `RET` might treat text as a URL and launch it.
> - Or some other minor-mode is intercepting keypresses.
> 
> #### 2. **`browse-url` integration from `man-mode`**
> Emacs can be configured to open manpages or URLs using your system browser via `browse-url`. If you're hitting some smart autocomplete or logic, it might trigger this.
> 
> #### 3. **LSP, Magit, or GitGutter integrations**
> If you have LSP or Magit active, some Git commands may trigger docs or helper windows. Some plugins (like `forge`, `magit-todos`, etc.) try to be helpful by popping open relevant documentation when hovering over or expanding certain Git-related things.
> 
> #### 4. **Smartcompletions or Company-mode**
> If you're using a completion engine and it’s auto-inserting a full `git` command with a link to documentation, a confirmation (like pressing `RET` or `TAB`) could launch a browser if the candidate contains metadata like a URL.
> 
> ---
> 
> ### 🛠 How to Debug
> 
> Here are some steps to narrow it down:
> 
> #### 1. **Check `*Messages*` buffer**
> Run `M-x view-echo-area-messages` right after it happens. Look for something like:
> ```elisp
> Opening URL: https://git-scm.com/docs/git-log
> ```
> That'll confirm a URL-triggered launch.
> 
> #### 2. **Run `describe-key`**
> Try:
> ```elisp
> C-h k K
> ```
> or
> ```elisp
> C-h k RET
> ```
> This will tell you *which command* is being triggered by that key in your current mode.
> 
> #### 3. **Temporarily disable URL launching**
> Try evaluating this:
> ```elisp
> (setq browse-url-browser-function #'ignore)
> ```
> Then repeat your problematic input. If it no longer launches the browser, you’ve confirmed that `browse-url` is being triggered somewhere.
> 
> ---
> 
> ### 🧹 How to Fix
> 
> Depending on what you find, fixes may include:
> 
> - **Disabling `K` in `evil-normal-state`**:
>  ```elisp
>  (define-key evil-normal-state-map (kbd "K") nil)
>  ```
> - **Avoiding in `vterm-copy-mode`**:
>  Disable `vterm-copy-mode` temporarily with `M-x vterm-copy-mode` or unbind `RET`:
>  ```elisp
>  (define-key vterm-copy-mode-map (kbd "RET") nil)
>  ```
> - **Turning off auto-doc popping in `lsp-mode`**:
>  ```elisp
>  (setq lsp-ui-doc-enable nil)
>  ```
> 
> ---
> 
> If you’re still stuck, paste the exact sequence you type (even better if you can tell me which mode you're in—`shell`, `eshell`, `vterm`, etc.) and I’ll walk through a tailored solution.
<!-- UID: 89eab3f8-183b-49f8-817e-e6e365331d74 -->

---




>[!nexus_user] **User** - 07/30/2025 at 7:14 PM
> I have no idea exactly what changed but my bash in emacs keeps opening up my brower and sending me to git manpages when I'm trying to type out git commands.
<!-- UID: c826f411-9bc8-471e-b145-3bcd015c782b -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 7:15 PM
> Thanks — that narrows things down.
> 
> If it’s happening in both `shell` and `eshell`, then it's **not a vterm thing**, and it’s likely tied to how Emacs is interpreting output from commands like `git log`, `git status`, or even `man`.
> 
> ---
> 
> ### 🧠 Diagnosis
> 
> Here’s the **most probable explanation**:
> 
> #### Emacs is detecting URLs or manpage references and making them *clickable*, and **some plugin is autolaunching them** when you move your cursor or press certain keys.
> 
> Examples:
> - Typing `git log` prints something like:
>  ```
>  commit abc123
>  Author: You
>  ...
>  See: https://git-scm.com/docs/git-log
>  ```
>  Emacs might see that `https://...` and turn it into a clickable button or link.
> - Pressing `RET` or `TAB` or even just moving over it with `mouse-1` could cause it to open in browser.
> 
> This behavior is often caused by:
> 
> #### ✅ `goto-address-mode`
> This makes URLs clickable. It's sometimes auto-enabled in `shell`, `eshell`, `compilation-mode`, etc.
> 
> #### 🧷 `man-follow` or `help-at-pt` (help-at-point)
> These minor modes can be too aggressive, especially if combined with `eldoc`, `thingatpt`, or other context-aware helpers.
> 
> ---
> 
> ### ✅ Fixes
> 
> Try these one by one until the behavior stops:
> 
> #### 1. **Disable `goto-address-mode` in `shell` and `eshell`**
> 
> Add to your config:
> 
> ```elisp
> (remove-hook 'shell-mode-hook #'goto-address-mode)
> (remove-hook 'eshell-mode-hook #'goto-address-mode)
> ```
> 
> If it's already enabled, disable it live with:
> ```elisp
> (goto-address-mode -1)
> ```
> 
> ---
> 
> #### 2. **Check for auto-browsing by `shr` or `browse-url`**
> 
> If Emacs is auto-opening manpages in browser, set this to use `man` in Emacs instead:
> 
> ```elisp
> (setq browse-url-browser-function 'eww-browse-url)
> ```
> 
> Or disable it entirely:
> ```elisp
> (setq browse-url-browser-function #'ignore)
> ```
> 
> ---
> 
> #### 3. **Disable help popup on point**
> 
> If something like `help-at-pt` is auto-triggering:
> 
> ```elisp
> (remove-hook 'shell-mode-hook #'help-at-pt-set-timer)
> (remove-hook 'eshell-mode-hook #'help-at-pt-set-timer)
> ```
> 
> Or just kill it globally for now:
> ```elisp
> (help-at-pt-cancel-timer)
> ```
> 
> ---
> 
> #### 4. **Check `RET` binding in eshell/shell**
> Run:
> ```elisp
> C-h k RET
> ```
> while inside the `eshell` or `shell` buffer — see if it’s bound to something unexpected like `browse-url-at-point`.
> 
> If so, override it:
> ```elisp
> (define-key eshell-mode-map (kbd "RET") #'eshell-send-input)
> (define-key shell-mode-map (kbd "RET") #'comint-send-input)
> ```
> 
> ---
> 
> ### Final Note
> 
> Once you apply the right fix, make sure to restart Emacs or at least reload the mode (`M-x eshell`, `M-x shell`) to verify.
> 
> Let me know what exact behavior triggers the browser launch (e.g. typing `git`, pressing `RET`, clicking, hovering), and I can trace it to the root.
<!-- UID: ae61da63-136c-4f03-8fd3-5f7af84b22b1 -->

---




>[!nexus_user] **User** - 07/30/2025 at 7:15 PM
> It was happening in shell, and i'm using eshell and it is happening there too
<!-- UID: 5f0a0038-6808-45fb-a9a7-f08a1be81707 -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 7:17 PM
> Yeah, that *definitely* tracks.
> 
> Both Copilot and advanced autocomplete systems (like `company-mode`, `corfu`, or `cape`) can:
> 
> - Insert ghost-text or overlays
> - Capture keybindings like `RET`, `TAB`, or `C-n`
> - Trigger *sidecar behaviors* like documentation lookups or URL previews
> - Interact poorly with modes like `shell` or `eshell` that expect `RET` to *just send input*
> 
> ---
> 
> ### 🔍 What to Look For
> 
> 1. **Copilot in Shell/Eshell** 
>  If Copilot is active in `shell-mode` or `eshell-mode`, it shouldn't be. You can disable it with:
>  ```elisp
>  (add-hook 'eshell-mode-hook (lambda () (copilot-mode -1)))
>  (add-hook 'shell-mode-hook (lambda () (copilot-mode -1)))
>  ```
> 
> 2. **Company Mode Auto Docs or Preview**
>  If `company-mode` is auto-popping help or docs, check this:
>  ```elisp
>  (setq company-frontends '(company-pseudo-tooltip-frontend)) ;; minimal
>  (setq company-show-quick-access nil)
>  ```
> 
> 3. **Keybinding Conflicts**
>  Run `C-h k RET` or `C-h k TAB` in `eshell` and `shell` — make sure they're not bound to:
>  - `copilot-accept-completion`
>  - `company-complete-selection`
>  - `browse-url-at-point`
>  - anything you don’t expect
> 
> 4. **Overlay Bugs**
>  Some ghost-text systems can leave behind clickable regions — Copilot and `lsp-mode` both use overlays that may be misinterpreted as .
> 
> ---
> 
> ### ✅ Fix Suggestion Summary
> 
> ```elisp
> ;; Disable Copilot in interactive shell modes
> (add-hook 'eshell-mode-hook (lambda () (copilot-mode -1)))
> (add-hook 'shell-mode-hook (lambda () (copilot-mode -1)))
> 
> ;; Avoid URL 
> (remove-hook 'eshell-mode-hook #'goto-address-mode)
> (remove-hook 'shell-mode-hook #'goto-address-mode)
> 
> ;; Disable weird help popups
> (remove-hook 'eshell-mode-hook #'help-at-pt-set-timer)
> (remove-hook 'shell-mode-hook #'help-at-pt-set-timer)
> 
> ;; Force RET to behave normally
> (with-eval-after-load 'eshell
>  (define-key eshell-mode-map (kbd "RET") #'eshell-send-input))
> 
> (with-eval-after-load 'shell
>  (define-key shell-mode-map (kbd "RET") #'comint-send-input))
> ```
> 
> ---
> 
> Let me know if you want a toggle command to quickly *disable Copilot and all autocompletion junk* temporarily — could be useful for shell-heavy sessions.
<!-- UID: da3b7054-b597-400a-805d-eff102c7382c -->

---




>[!nexus_user] **User** - 07/30/2025 at 7:17 PM
> I'll try that soon... it is probably something with the auto completion minor mode or copilot mode. They have some weird interactions.
<!-- UID: 1ded0412-fb34-4469-bd58-37f18ad9bf83 -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 7:19 PM
> Ah — yep, this is a classic case of **`eshell` and path translation weirdness on Windows** (especially with MSYS2, Git Bash, or WSL mixed into the environment).
> 
> Let’s break it down and fix it:
> 
> ---
> 
> ### 💣 Problem Summary
> 
> - You're in Emacs `eshell` on Windows.
> - You typed `git config --global user.email ...`
> - Git tried to write to `/c/Users/foamy/.gitconfig` but failed with:
>  ```
>  error: could not lock config file /c/Users/foamy/.gitconfig: No such file or directory
>  ```
> 
> This tells us:
> - Git is trying to use *Unix-style paths* (i.e., MSYS2/Cygwin-like `/c/...`)
> - But `/c/Users/...` doesn't exist in your current shell environment
> - Emacs/`eshell` is not resolving `/c/Users/...` as `C:\Users\...` correctly
> 
> ---
> 
> ### 🛠 Fixes
> 
> #### ✅ 1. **Create the `.gitconfig` manually**
> 
> In a normal `cmd` prompt, PowerShell, or even within Emacs `dired`:
> ```powershell
> mkdir C:\Users\foamy
> notepad C:\Users\foamy\.gitconfig
> ```
> 
> Paste in something like:
> ```ini
> [user]
>  name = Foamy
>  email = foamy125@gmail.com
> ```
> 
> Then try again in Emacs `eshell` — it should now work.
> 
> ---
> 
> #### ✅ 2. **Make Git use the correct HOME directory**
> 
> Git uses `%USERPROFILE%` or `$HOME` to locate `.gitconfig`.
> 
> Check your `HOME` variable inside `eshell`:
> 
> ```elisp
> (getenv "HOME")
> ```
> 
> Or just in `eshell`:
> 
> ```eshell
> echo $HOME
> ```
> 
> If it's returning `/c/Users/foamy`, but that doesn’t exist, you’ll need to set it manually.
> 
> Add this to your Emacs config (assuming you're on Windows):
> 
> ```elisp
> (when (eq system-type 'windows-nt)
>  (setenv "HOME" (expand-file-name "C:/Users/foamy")))
> ```
> 
> Or, dynamically:
> 
> ```elisp
> (setenv "HOME" (expand-file-name (concat (getenv "USERPROFILE"))))
> ```
> 
> You can also add a symlink or alias if that’s your preferred fix.
> 
> ---
> 
> #### ✅ 3. **Use Git from Windows directly instead of MSYS2/MinGW**
> 
> If your Git is installed via MSYS2, it might be trying to live in a completely different namespace.
> 
> Use `M-x eshell` and check which Git it’s using:
> 
> ```eshell
> which git
> ```
> 
> If it says something like `/usr/bin/git` (MinGW), you may want to explicitly configure Emacs to use the Windows version instead. Set in your `init.el`:
> 
> ```elisp
> (setq exec-path (append '("C:/Program Files/Git/bin") exec-path))
> (setenv "PATH" (concat "C:\\Program Files\\Git\\bin;" (getenv "PATH")))
> ```
> 
> ---
> 
> #### ✅ 4. **As a last resort: set the identity locally**
> You can always bypass the `--global` issue by setting it per-project:
> 
> ```eshell
> git config user.email "foamy125@gmail.com"
> git config user.name "Foamy"
> ```
> 
> This writes to `.git/config` in the current repo.
> 
> ---
> 
> Let me know which Git you’re using (`which git`), and whether you’re on native Windows Emacs, WSL Emacs, or something hybrid — and I’ll tailor the fix even more precisely.
<!-- UID: 1957ada1-15c4-4fc5-9357-e54c6618a386 -->

---




>[!nexus_user] **User** - 07/30/2025 at 7:19 PM
> Also... since I switched to eshell, git doesn't seem to know where my .gitconfig file is
> ```eshell
> cd devel/promethean/ 
> c/Users/foamy/devel/promethean:codex/update-tests.yml-to-require-successful-make-commands λ git commit -m "almost there"
> Author identity unknown
> 
> *** Please tell me who you are.
> 
> Run
> 
>  git config --global user.email "you@example.com"
>  git config --global user.name "Your Name"
> 
> to set your account's default identity.
> Omit --global to set the identity only in this repository.
> 
> fatal: unable to auto-detect email address (got 'foamy@MSI.(none)')
> c/Users/foamy/devel/promethean:codex/update-tests.yml-to-require-successful-make-commands λ git config --global user.email "foamy125@gmail.com"
> error: could not lock config file /c/Users/foamy/.gitconfig: No such file or directory
> c/Users/foamy/devel/promethean:codex/update-tests.yml-to-require-successful-make-commands λ 
> ```
<!-- UID: 3a1973c7-3c68-4ba1-92a6-4c088e07cfcb -->




>[!nexus_user] **User** - 07/30/2025 at 7:23 PM
> I changed the entry in my .spacemacs.env file. I love when I'm digging through to try to fix things and I break something else... was in that file earlier, I don't think I touched this but... maybe I did.
<!-- UID: f38ac994-d589-477d-bfa0-fd64b0c4a8fc -->




>[!nexus_agent] **Assistant** - 07/30/2025 at 7:23 PM
> Ah, yep — `.spacemacs.env` is a sneaky one.
> 
> That file gets **loaded into Emacs’ environment** early during startup by Spacemacs (especially when using `dotspacemacs-load-env-vars`). So **anything in there overrides system-level env vars**, including `HOME`, `PATH`, and so on.
> 
> ---
> 
> ### 🔥 What likely happened
> 
> You may have edited `.spacemacs.env` earlier for something unrelated (maybe trying to add a custom path or variable), and accidentally:
> 
> - Deleted or corrupted the `HOME` variable
> - Set it to something like `/c/Users/foamy` when that doesn’t actually exist
> - Introduced a typo or malformed line
> 
> ---
> 
> ### ✅ What to do
> 
> #### 1. **Check the contents of `.spacemacs.env`**
> 
> From Emacs:
> ```emacs-lisp
> (find-file "~/.spacemacs.env")
> ```
> 
> Look for a line like:
> ```
> HOME=/c/Users/foamy
> ```
> 
> Change it to the correct full Windows path:
> ```
> HOME=C:/Users/foamy
> ```
> 
> Or delete the `HOME` line entirely to fall back on default behavior.
> 
> ---
> 
> #### 2. **Regenerate `.spacemacs.env` (optional)**
> 
> If it's totally borked or you're unsure, just delete the file and regenerate:
> 
> ```bash
> rm ~/.spacemacs.env
> ```
> 
> Then restart Emacs and run:
> ```emacs-lisp
> M-x spacemacs/load-spacemacs-env
> ```
> 
> It will re-populate `.spacemacs.env` with your current system environment.
> 
> ---
> 
> #### 3. **Check from inside Emacs**
> 
> You can verify if the change worked:
> 
> ```elisp
> (getenv "HOME")
> ```
> 
> And in `eshell`:
> ```eshell
> echo $HOME
> ```
> 
> ---
> 
> ### 💡 Pro tip
> 
> Add this to your `dotspacemacs/user-config` block to debug environment issues quickly in the future:
> 
> ```elisp
> (message "Emacs HOME: %s" (getenv "HOME"))
> (message "Emacs PATH: %s" (getenv "PATH"))
> ```
> 
> ---
> 
> Let me know if you want to keep `.spacemacs.env` clean and synced automatically — I can help set up a script or function that avoids these kinds of silent breakages in the future.
<!-- UID: 96756a81-399b-4852-a93f-78b1dd7d1916 -->

---




>[!nexus_agent] **Assistant** - 07/30/2025 at 7:24 PM
> Classic Emacs rite of passage 😅
> 
> The dreaded:
> 
> > `(Searching for program: No such file or directory, ispell)`
> 
> happens when Emacs is trying to run a spell checker (`ispell`, `aspell`, or `hunspell`), but can’t find the binary on your system.
> 
> ---
> 
> ### ✅ Fix Options
> 
> #### 🧠 Option 1: **Install a Spell Checker**
> 
> On **Windows**, easiest path is usually:
> 
> ##### 🅰️ Install Hunspell (recommended for Spacemacs)
> 1. Download Hunspell binaries:
>  - https://github.com/UB-Mannheim/WinHunspell/releases
> 2. Extract it somewhere like:
>  ```
>  C:\Program Files\Hunspell
>  ```
> 3. Add its `bin` folder to your system `PATH`:
>  ```
>  C:\Program Files\Hunspell\bin
>  ```
> 
> 4. Restart Emacs
> 
> #### 🅱️ Install Aspell (alternative)
> - Download from: http://aspell.net/win32/
> - Install and add to `PATH`
> 
> ---
> 
> #### 🧠 Option 2: **Tell Emacs which one to use**
> 
> In your `.spacemacs` (or `.emacs`):
> 
> ```elisp
> (setq ispell-program-name "hunspell") ;; or "aspell"
> ```
> 
> You can also check in Emacs:
> ```elisp
> M-x ispell-change-dictionary
> ```
> 
> ---
> 
> #### 🧠 Option 3: **Disable spell-check in specific modes**
> 
> If you don’t need spellchecking (e.g. in `prog-mode`):
> 
> ```elisp
> (remove-hook 'text-mode-hook #'spell-checking-enable)
> (remove-hook 'prog-mode-hook #'spell-checking-enable)
> ```
> 
> Or disable it globally:
> 
> ```elisp
> (setq-default dotspacemacs-configuration-layers
>  '((spell-checking :variables spell-checking-enable-by-default nil)))
> ```
> 
> ---
> 
> ### 🔎 Check it’s working
> 
> After restarting Emacs, run:
> 
> ```elisp
> M-x ispell-version
> ```
> 
> If it returns something like `Hunspell 1.7.0`, you’re good.
> 
> ---
> 
> Let me know if you want to wire it into `flyspell-mode`, or use it in only markdown/org files but not code. I can set up that too.
<!-- UID: 65c50032-444f-44af-a7b2-3c49434a5d91 -->

---




>[!nexus_user] **User** - 07/30/2025 at 7:24 PM
> yea it's fixed now. May as ewll just deal with all my emacs problems now.
> I've fixed this before, I just forget how:
> (Searching for program No such file or directory ispell)
<!-- UID: 870af497-13e3-4318-b657-1ddd3f04929d -->


