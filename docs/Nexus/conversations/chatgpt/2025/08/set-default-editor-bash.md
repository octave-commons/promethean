---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Set default editor bash"
conversation_id: 68a71921-b828-832c-bdcc-705154b0f8a9
create_time: 08/21/2025 at 8:03 AM
update_time: 08/21/2025 at 8:03 AM
---

# Title: Set default editor bash

Created: 08/21/2025 at 8:03 AM
Last Updated: 08/21/2025 at 8:03 AM
Chat URL: https://chat.openai.com/c/68a71921-b828-832c-bdcc-705154b0f8a9


>[!nexus_user] **User** - 08/21/2025 at 8:03 AM
> How do I set the default editor in bash?
<!-- UID: b85f95a7-c91c-4f4e-91aa-3846682952fe -->




>[!nexus_agent] **Assistant** - 08/21/2025 at 8:03 AM
> In bash you don’t really “set” it inside the shell itself — you set environment variables that other programs (like `git`, `crontab`, `visudo`, etc.) check when they need to open an editor. The canonical ones are:
> 
> - `EDITOR` – the general-purpose variable for command-line programs 
> - `VISUAL` – preferred for full-screen editors (like vim, emacs, nano), takes precedence over `EDITOR` in some tools
> 
> ### One-off for current shell
> ```bash
> export EDITOR=nvim
> export VISUAL=nvim
> ```
> 
> That’ll last until you close the shell.
> 
> ---
> 
> ### Persistently for all bash sessions
> Append to your `~/.bashrc` (or `~/.bash_profile` depending on your distro):
> ```bash
> export EDITOR="nvim"
> export VISUAL="nvim"
> ```
> Then reload:
> ```bash
> source ~/.bashrc
> ```
> 
> ---
> 
> ### System-wide default (Debian/Ubuntu style)
> On Debian/Ubuntu and derivatives you can use `update-alternatives`:
> ```bash
> sudo update-alternatives --config editor
> ```
> That sets `/etc/alternatives/editor` symlink, which many system tools respect.
> 
> ---
> 
> ### Probing deeper
> Do you want this for:
> - just *your shell commands* (e.g. `fc`, `crontab -e`), 
> - or also for system-wide tools like `git commit` and `sudoedit`? 
> 
> That determines whether you stick to your own `~/.bashrc` or set a system alternative. Which one are you aiming for?
<!-- UID: 17edbff9-4197-41ac-9bd3-f260faeb80fe -->

---


