---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Clear Obsidian cache Linux"
conversation_id: 68b6fc84-15d4-832c-9240-d61610a71372
create_time: 09/02/2025 at 9:17 AM
update_time: 09/02/2025 at 9:56 AM
---

# Title: Clear Obsidian cache Linux

Created: 09/02/2025 at 9:17 AM
Last Updated: 09/02/2025 at 9:56 AM
Chat URL: https://chat.openai.com/c/68b6fc84-15d4-832c-9240-d61610a71372


>[!nexus_user] **User** - 09/02/2025 at 9:17 AM
> clear obsidian cache linux
<!-- UID: 387e9b35-054f-49fb-a573-089155dff82a -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 9:17 AM
> ​To clear Obsidian's cache on Linux, follow these steps:
> 
> ---
> 
> ### 🧹 Steps to Clear Obsidian Cache on Linux
> 
> 1. **Close Obsidian Completely** 
>  Ensure Obsidian is fully closed before proceeding.
> 
> 2. **Delete the Cache Directory** 
>  Open your terminal and run:
>  ```bash
>  rm -rf ~/.config/obsidian/Cache
>  ```
> 
>  This removes the cache directory. Obsidian will recreate it upon the next launch.
> 
> 3. **Optional: Clear IndexedDB Data** 
>  Obsidian uses IndexedDB for storing metadata. To clear this:
>  - Launch Obsidian.
>  - Open Developer Tools with `Ctrl+Shift+I`.
>  - Navigate to the **Application** tab.
>  - In the sidebar, under **Storage**, click on **IndexedDB**.
>  - Right-click on the Obsidian database and select **Delete**.
> 
> 4. **Restart Obsidian** 
>  After clearing the cache and IndexedDB, restart Obsidian. It will rebuild necessary cache files.
> 
> ---
> 
> ### ⚠️ Additional Considerations
> 
> - **Vault-Specific Settings**: Each vault has its own `.obsidian` folder containing configurations. If issues persist, consider backing up and removing this folder to reset settings.
> 
> - **Large Folders**: Avoid placing large directories (e.g., `node_modules`) inside your vault, as they can slow down indexing.
> 
> - **Safe Mode**: If problems continue, start Obsidian in Safe Mode to disable community plugins, which might be causing issues.
> 
> ---
> 
> By following these steps, you can effectively clear Obsidian's cache on Linux and resolve related issues.
<!-- UID: 860d0c9e-cb87-4293-ad71-4c8fd2201a9b -->

---


