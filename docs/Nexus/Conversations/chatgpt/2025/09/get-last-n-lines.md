---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Get last n lines"
conversation_id: 68b5b4b7-596c-8320-818f-0bc6306de1a3
create_time: 09/01/2025 at 9:59 AM
update_time: 09/01/2025 at 9:59 AM
---

# Title: Get last n lines

Created: 09/01/2025 at 9:59 AM
Last Updated: 09/01/2025 at 9:59 AM
Chat URL: https://chat.openai.com/c/68b5b4b7-596c-8320-818f-0bc6306de1a3


>[!nexus_user] **User** - 09/01/2025 at 9:59 AM
> get the last n lines from journalctl
<!-- UID: 60f14819-c45e-4ced-887d-fe149f5cd072 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 9:59 AM
> Use `-n`:
> 
> ```bash
> # last N lines from all logs
> journalctl -n N
> ```
> 
> Common variants:
> 
> ```bash
> # last 200 lines for a specific unit
> journalctl -u <unit>.service -n 200
> 
> # last 100 lines from current boot only
> journalctl -b -n 100
> 
> # last 50 lines, newest-first (reverse)
> journalctl -n 50 -r
> 
> # avoid the pager (good for scripts)
> journalctl -n 100 --no-pager
> 
> # add helpful explanations and concise timestamps
> journalctl -u <unit>.service -n 200 -x -o short-precise
> ```
> 
> Tip: follow live like `tail -f` with `-f`, and combine with `-u`:
> 
> ```bash
> journalctl -u <unit>.service -f
> ```
> 
> #linux #systemd #journalctl #cli #cheatsheet
<!-- UID: 3fa1cf84-69e1-4fcb-bb6b-e9acb4bff9dc -->

---


