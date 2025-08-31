---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Restart pm2 process correctly"
conversation_id: 688d10cd-ea2c-8322-bbc3-532adc415c74
create_time: 08/01/2025 at 2:09 PM
update_time: 08/01/2025 at 2:09 PM
---

# Title: Restart pm2 process correctly

Created: 08/01/2025 at 2:09 PM
Last Updated: 08/01/2025 at 2:09 PM
Chat URL: https://chat.openai.com/c/688d10cd-ea2c-8322-bbc3-532adc415c74


>[!nexus_user] **User** - 08/01/2025 at 2:09 PM
> How do I restart a pm2 process correctly after changing the ecosyste.config.js file with out first deleteing the processes?
<!-- UID: c231c188-bf4e-4f7d-ac7b-5b0cfce9cf09 -->




>[!nexus_agent] **Assistant** - 08/01/2025 at 2:09 PM
> If you’ve edited your `ecosystem.config.js` (or `.json`) and want PM2 to apply the changes **without deleting the process**, the correct command is:
> 
> ```bash
> pm2 reload ecosystem.config.js
> ```
> 
> This will:
> 
> - Compare the updated `ecosystem.config.js` to the current processes
> - Reload the processes with any updated configuration (e.g., env vars, script paths, args)
> - Preserve logs and process IDs
> - Avoid downtime (if the script supports zero-downtime reloads)
> 
> ---
> 
> ### 🔍 Gotchas
> 
> 1. **It won’t remove old processes** that were removed from the file.
>  - Use `pm2 delete <name>` manually if you removed entries from the config file.
> 
> 2. **It won’t restart unchanged processes.**
>  - If you want to force a full restart of everything defined in the file:
>  ```bash
>  pm2 restart ecosystem.config.js
>  ```
> 
> 3. If you want to reload **only a specific app** from the file:
>  ```bash
>  pm2 reload <app_name>
>  ```
> 
> ---
> 
> ### 🧠 TL;DR
> 
> - `pm2 reload ecosystem.config.js` → reload with updated config
> - `pm2 restart ecosystem.config.js` → restart all apps in config
> - Don’t use `pm2 delete` unless you're removing apps entirely
> - Use `pm2 save` afterward if you want the current state to persist across reboots:
>  ```bash
>  pm2 save
>  ```
> 
> Let me know if your setup has namespaces or a multi-environment config—PM2 can be a little finicky depending on how you're structuring things.
<!-- UID: a792a74a-3eb3-4086-927b-76380bd35459 -->

---


