---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs dockerfile recognition"
conversation_id: 68b48e99-097c-832f-ad27-1d098e698ed4
create_time: 08/31/2025 at 1:04 PM
update_time: 08/31/2025 at 1:05 PM
---

# Title: Emacs dockerfile recognition

Created: 08/31/2025 at 1:04 PM
Last Updated: 08/31/2025 at 1:05 PM
Chat URL: https://chat.openai.com/c/68b48e99-097c-832f-ad27-1d098e698ed4


>[!nexus_user] **User** - 08/31/2025 at 1:04 PM
> how do I get emacs to recognize dockerfiles that aren't named "Dockerfile"
<!-- UID: 483efd01-ec60-4b8f-99f6-a0c524461b94 -->




>[!nexus_agent] **Assistant** - 08/31/2025 at 1:04 PM
> Easy ways:
> 
> 1) Per-file header (quick + portable) 
> Put this on the first line of any nonstandard file (e.g. `images/ts-service.docker`):
> ```dockerfile
> # -*- mode: dockerfile; -*-
> FROM debian:stable
> ```
> (or at the bottom:)
> ```dockerfile
> # Local Variables:
> # mode: dockerfile
> # End:
> ```
> 
> 2) Tell Emacs to treat certain names/extensions as Dockerfiles 
> Drop this in your Emacs config (Spacemacs: inside `dotspacemacs/user-config`):
> 
> ```elisp
> ;; Open *.docker, Dockerfile.*, and Containerfile in dockerfile-mode
> (add-to-list 'auto-mode-alist '("\\.docker\\'" . dockerfile-mode))
> (add-to-list 'auto-mode-alist '("Dockerfile\\..*\\'" . dockerfile-mode))
> (add-to-list 'auto-mode-alist '("Containerfile\\(\\..*\\)?\\'" . dockerfile-mode))
> 
> ;; Heuristic: if the file *starts* with a Dockerfile line, use dockerfile-mode
> ;; (works regardless of filename)
> (add-to-list 'magic-mode-alist
>  '("\\`\\(?:#\\s-*syntax=docker/dockerfile\\|FROM\\s-\\)" . dockerfile-mode))
> ```
> 
> 3) One-off: `M-x dockerfile-mode` in the buffer (good for ad-hoc files).
> 
> If you’re using Spacemacs’ `docker` layer you already have `dockerfile-mode`; otherwise install `dockerfile-mode` (e.g. add it to your packages or use `use-package`).
<!-- UID: a0ab2b08-bf61-46ef-8c96-36f85654455f -->

---


