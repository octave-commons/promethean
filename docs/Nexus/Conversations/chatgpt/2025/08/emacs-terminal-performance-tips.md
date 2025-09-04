---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs terminal performance tips"
conversation_id: 6898bd8e-e2c4-832c-929e-b437c0457282
create_time: 08/10/2025 at 10:41 AM
update_time: 08/13/2025 at 10:19 AM
---

# Title: Emacs terminal performance tips

Created: 08/10/2025 at 10:41 AM
Last Updated: 08/13/2025 at 10:19 AM
Chat URL: https://chat.openai.com/c/6898bd8e-e2c4-832c-929e-b437c0457282


>[!nexus_user] **User** - 08/10/2025 at 10:41 AM
> I'm running a lot of terminals inside of emacs... I think it is making it a bit laggy... how can I make this perform better?
<!-- UID: 38a056af-dc32-4323-8c71-7785332c7859 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 10:41 AM
> Yeah, Emacs can start feeling like it’s wading through molasses if you keep a bunch of `ansi-term`, `vterm`, or `eshell` buffers open for long sessions — especially if you’re running interactive processes that produce a lot of output. 
> 
> Here are the main ways to make it snappier without sacrificing too much convenience: 
> 
> ---
> 
> ## **1. Switch to `vterm` for Heavy-Terminal Work**
> - If you’re still using `ansi-term` or `term-mode`, those are purely Elisp-based and *slow*.
> - `vterm` is compiled with libvterm and is much faster at rendering, even with lots of scrolling output.
> - Install from MELPA: 
>  ```elisp
>  (use-package vterm
>  :ensure t)
>  ```
> - Downside: Each vterm instance is a full pty process, so too many open = more RAM.
> 
> ---
> 
> ## **2. Limit Scrollback**
> - Huge scrollback buffers cause lag during redraw.
> - For `vterm`:
>  ```elisp
>  (setq vterm-max-scrollback 1000) ; Default is 1000, don't go crazy
>  ```
> - For `ansi-term`:
>  ```elisp
>  (setq term-buffer-maximum-size 1000)
>  (add-hook 'term-mode-hook
>  (lambda ()
>  (setq-local scroll-margin 0)))
>  ```
> - This keeps memory use lower and avoids re-rendering giant buffers.
> 
> ---
> 
> ## **3. Use External Terminals for Long-Running Processes**
> - For jobs like `htop`, servers, or `tail -f`, launch them in an external terminal (Kitty, Alacritty, etc.) instead of inside Emacs.
> - You can still jump to them quickly with `emamux` or `tmux` integration.
> 
> ---
> 
> ## **4. Kill Inactive Terminal Buffers**
> - Terminal buffers keep their subprocess alive and consume CPU even if idle.
> - Add a cleanup command:
>  ```elisp
>  (defun kill-old-vterms ()
>  "Kill all vterm buffers that are not visible."
>  (interactive)
>  (dolist (buf (buffer-list))
>  (when (and (get-buffer-process buf)
>  (string-match-p "^\\*vterm" (buffer-name buf))
>  (not (get-buffer-window buf)))
>  (kill-buffer buf))))
>  ```
> - Run this manually or on a timer.
> 
> ---
> 
> ## **5. Reduce Rendering Work**
> - Disable line numbers in terminal buffers (they force full redraws):
>  ```elisp
>  (add-hook 'term-mode-hook (lambda () (display-line-numbers-mode 0)))
>  (add-hook 'vterm-mode-hook (lambda () (display-line-numbers-mode 0)))
>  ```
> - Also disable visual-line-mode and other wrapping modes for performance.
> 
> ---
> 
> ## **6. Offload Background Logs**
> - If you’re following log files (`tail -f`), consider using:
>  - `M-x auto-revert-tail-mode` in a regular file buffer (way lighter than running `tail` in a shell)
>  - Or `multitail` in an external terminal
> 
> ---
> 
> ## **7. Use `eat` if You Want an Elisp-Only Upgrade**
> - [`eat`](https://codeberg.org/akib/emacs-eat) is a newer terminal emulator in Emacs that’s faster than `ansi-term` but without `vterm`’s compiled dependency.
> - Works well if you don’t want native compilation but still want better performance.
> 
> ---
> 
> If you want, I can give you a **"lazy terminal buffer" setup** that keeps terminals alive but unloads their rendering until you switch to them — so you can have dozens open without killing Emacs performance. That’d let you keep your current workflow but remove the lag.
<!-- UID: 9c69d11d-0c63-4401-88e2-284bbe588992 -->

---




>[!nexus_user] **User** - 08/10/2025 at 10:43 AM
> it's mostly pm2 logs...... guess I should use log files instead.
<!-- UID: 6dfebdf0-63a3-4359-8efd-0cdcaacc44e9 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 10:43 AM
> Yeah — that’s almost certainly the culprit. 
> 
> PM2 logs are like a firehose in Emacs: every single line triggers a redisplay and point motion, so even `vterm` will bog down if you just sit in `pm2 logs`. 
> 
> If you switch to reading from the log file instead, you avoid the constant terminal emulator overhead. 
> 
> ---
> 
> ### **Better Ways to View PM2 Logs in Emacs**
> 1. **Use the log files directly**
>  ```bash
>  pm2 logs --raw > ~/pm2-out.log &
>  tail -f ~/.pm2/logs/your-service-out.log
>  ```
>  Then in Emacs:
>  ```elisp
>  (find-file "~/.pm2/logs/your-service-out.log")
>  (auto-revert-tail-mode)
>  ```
>  - Much lighter than running `pm2 logs` interactively.
>  - You can still `grep`, search, and copy easily.
> 
> 2. **External tail + Emacs refresh**
>  - Run `tail -f` in a real terminal (Kitty, Alacritty, etc.)
>  - Keep Emacs for editing and occasional static log viewing.
>  - Prevents Emacs from holding thousands of log lines in memory.
> 
> 3. **Split stdout & stderr**
>  - PM2 logs combine both unless you check individual files:
>  ```
>  ~/.pm2/logs/<app>-out.log
>  ~/.pm2/logs/<app>-error.log
>  ```
>  - Viewing just one reduces clutter and improves scrolling speed.
> 
> ---
> 
> If you want, I can also set up a **small Emacs function** so you can hit `M-x pm2-tail` and it will open the correct log file in `auto-revert-tail-mode` automatically for whichever service you name. That would make it as fast to open as `pm2 logs` but without killing performance. 
> 
> Do you want me to make that function?
<!-- UID: aea61e0e-49a7-45ed-be38-718141d41457 -->

---




>[!nexus_user] **User** - 08/10/2025 at 10:45 AM
> I always forget thehook for new frames... I need it so they go transparent every time.
<!-- UID: c430c4ed-86aa-44c5-8c22-e5834685ddf7 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 10:45 AM
> The hook you want is `after-make-frame-functions`. Here’s a drop‑in that makes every new GUI frame transparent (works in daemon and normal starts), with Emacs‑29+ and pre‑29 compatibility:
> 
> ```elisp
> ;; Set your desired opacity once
> (defvar my/frame-opacity 90) ;; 100 = opaque, 0 = fully transparent
> 
> (defun my/apply-transparency (frame)
>  "Apply transparency to FRAME if it's a GUI frame."
>  (when (display-graphic-p frame)
>  (if (>= emacs-major-version 29)
>  ;; Emacs 29+: alpha-background
>  (set-frame-parameter frame 'alpha-background my/frame-opacity)
>  ;; Emacs 28 and earlier: alpha (active . inactive)
>  (set-frame-parameter frame 'alpha (cons my/frame-opacity my/frame-opacity)))))
> 
> ;; Apply to the current frame at startup
> (my/apply-transparency (selected-frame))
> 
> ;; Apply to all future frames (including emacsclient frames)
> (add-hook 'after-make-frame-functions #'my/apply-transparency)
> 
> ;; Also set defaults so frames created before init finishes get it
> (if (>= emacs-major-version 29)
>  (add-to-list 'default-frame-alist `(alpha-background . ,my/frame-opacity))
>  (add-to-list 'default-frame-alist `(alpha . (,my/frame-opacity . ,my/frame-opacity))))
> ```
> 
> If you’re using picom/i3 and it still looks fully opaque, double‑check picom isn’t overriding window opacity rules for Emacs. Otherwise, this should stick for every new frame.
<!-- UID: b1e13519-0349-4979-a077-695f1650df52 -->

---




>[!nexus_user] **User** - 08/10/2025 at 12:14 PM
> How do I make it so vterm doesn't force my cursor back to the input line constantly when I am trying to read prior outputs?
<!-- UID: 204c0be5-e522-4f64-a7e0-2adbfd0a08c6 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 12:14 PM
> Two easy ways:
> 
> ## 1) Use `vterm-copy-mode` when reading
> This freezes point so new output won’t yank you back to the prompt. You still get search, paging, etc.
> 
> ```elisp
> ;; Handy toggle key
> (with-eval-after-load 'vterm
>  (define-key vterm-mode-map (kbd "C-c C-t") #'vterm-copy-mode))
> ```
> 
> Workflow: hit `C-c C-t` → scroll/search comfortably → hit it again to go back to interactive typing.
> 
> ## 2) Turn off “auto-follow to bottom”
> If you prefer to *never* auto-jump:
> 
> ```elisp
> (setq vterm-scroll-to-bottom-on-output nil
>  vterm-scroll-to-bottom-on-input nil) ;; optional: stop jumping on your own input too
> ```
> 
> (Pro‑tip: keep auto-follow on, but use copy mode for long reads. It’s the nicest balance.)
> 
> Extras:
> - Disable line numbers in vterm buffers (they force redraws): 
>  ```elisp
>  (add-hook 'vterm-mode-hook (lambda () (display-line-numbers-mode 0)))
>  ```
> - Long lines? 
>  ```elisp
>  (add-hook 'vterm-mode-hook (lambda () (setq truncate-lines t)))
>  ```
> - Clear huge scrollback if it gets sluggish: `M-x vterm-clear-scrollback`.
<!-- UID: e21970bf-9103-44ae-8372-e4e9674e6125 -->

---


