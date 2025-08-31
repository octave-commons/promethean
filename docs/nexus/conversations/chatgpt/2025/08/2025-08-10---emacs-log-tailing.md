---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs log tailing"
conversation_id: 68990169-f390-8325-8e3c-8c62135313c0
create_time: 08/10/2025 at 3:30 PM
update_time: 08/15/2025 at 10:44 AM
---

# Title: Emacs log tailing

Created: 08/10/2025 at 3:30 PM
Last Updated: 08/15/2025 at 10:44 AM
Chat URL: https://chat.openai.com/c/68990169-f390-8325-8e3c-8c62135313c0


>[!nexus_user] **User** - 08/10/2025 at 3:30 PM
> What is the best way to just... "listen" to a log file so my emacs follows it as it changes?
<!-- UID: 34fe74ac-239d-4db8-be6b-23f74eb1dbac -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 3:30 PM
> If you just want Emacs to “tail” a log file and keep following it as it grows, the built-in **`auto-revert-tail-mode`** is your friend. 
> 
> It’s basically `tail -f` inside Emacs. 
> 
> ---
> 
> **Quick way** 
> 1. Open the log file normally: 
>  ```
>  C-x C-f /path/to/your.log
>  ```
> 2. Turn on tail-following: 
>  ```
>  M-x auto-revert-tail-mode
>  ```
>  (you can type `M-x art RET` because of the abbreviation)
> 
> Now Emacs will auto-scroll as new lines are appended, without you having to refresh. 
> It also avoids reloading the entire file every time — it just inserts new chunks.
> 
> ---
> 
> **If you want it every time for `.log` files** 
> Add this to your config:
> 
> ```elisp
> (add-to-list 'auto-mode-alist '("\\.log\\'" . auto-revert-tail-mode))
> ```
> 
> Or, if you want to also disable prompts about reverting files:
> 
> ```elisp
> (setq auto-revert-verbose nil)
> ```
> 
> ---
> 
> **Alternative:** If you want a true `tail -f` in a shell inside Emacs (so you can run grep, colorize, etc.), you can do:
> 
> ```
> M-x term RET
> tail -f /path/to/your.log
> ```
> 
> or in `vterm`:
> 
> ```
> M-x vterm
> tail -f /path/to/your.log
> ```
> 
> That gives you raw terminal behavior.
> 
> ---
> 
> If you want, I can give you a setup that uses `auto-revert-tail-mode` but also **pauses scrolling** when you move the point up — so you can inspect old log lines without Emacs constantly yanking you back down. Would you like that?
<!-- UID: a708796e-acdf-4eb0-900e-db5fe678a47c -->

---


