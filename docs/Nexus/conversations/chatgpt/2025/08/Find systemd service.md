---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Find systemd service"
conversation_id: 68ab153a-4218-832a-8fa8-108861a67610
create_time: 08/24/2025 at 8:36 AM
update_time: 08/24/2025 at 8:36 AM
---

# Title: Find systemd service

Created: 08/24/2025 at 8:36 AM
Last Updated: 08/24/2025 at 8:36 AM
Chat URL: https://chat.openai.com/c/68ab153a-4218-832a-8fa8-108861a67610


>[!nexus_user] **User** - 08/24/2025 at 8:36 AM
> how do I find a specific service running with systemd
<!-- UID: a5230fd8-7fcd-437a-b24f-1bb8fdf45ae4 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:36 AM
> With `systemd` you’ve got a few ways to track down a specific service:
> 
> ### 1. Search by name (most common)
> ```bash
> systemctl status <service-name>
> ```
> Example:
> ```bash
> systemctl status promethean-reverse-proxy
> ```
> This shows whether it’s active, its PID, logs, etc.
> 
> If you’re not sure of the exact name:
> ```bash
> systemctl list-units --type=service | grep -i promethean
> ```
> 
> ### 2. Check all services (running and stopped)
> ```bash
> systemctl list-units --type=service --all
> ```
> 
> ### 3. Find which unit owns a PID
> If you know the process ID:
> ```bash
> systemctl status $(pidof tailscale)
> ```
> or
> ```bash
> systemctl status <pid>
> ```
> 
> ### 4. Use `systemd-cgls` or `systemctl status` broadly
> For hierarchy view of all processes:
> ```bash
> systemd-cgls
> ```
> 
> ---
> 
> ✅ The simplest workflow:
> - If you know the service’s name (or part of it): 
>  `systemctl list-units --type=service | grep -i <name>`
> - If you know the binary/process but not the service: 
>  `systemctl status $(pidof <binary>)`
> 
> ---
> 
> Do you want me to suggest a one-liner that will **search for a process and show the service that owns it** automatically? That can save time when you only know the binary name (like `tailscale`).
<!-- UID: 6dc99a2f-f651-4093-9015-e9aec6a76d2c -->

---


