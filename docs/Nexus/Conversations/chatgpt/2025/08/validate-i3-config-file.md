---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Validate i3 config file"
conversation_id: 68a5ce71-2eac-832c-a407-a782e3dd962c
create_time: 08/20/2025 at 8:32 AM
update_time: 08/20/2025 at 8:33 AM
---

# Title: Validate i3 config file

Created: 08/20/2025 at 8:32 AM
Last Updated: 08/20/2025 at 8:33 AM
Chat URL: https://chat.openai.com/c/68a5ce71-2eac-832c-a407-a782e3dd962c


>[!nexus_user] **User** - 08/20/2025 at 8:32 AM
> How do I validate an i3 config file with out using it as my config?
<!-- UID: ddf72c9a-598d-486f-957c-826fd7af8ed6 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 8:32 AM
> Good question — you don’t want to risk a bad config soft-locking your session. 
> 
> There’s no `i3 --check-config` switch (like with `nginx -t`), but i3 actually **does parse and validate configs at startup**. The trick is to point i3 at your config file in a way that doesn’t replace your real session. You’ve got a couple of options:
> 
> ---
> 
> ### 1. Use `i3 -C` (check config only)
> Run:
> 
> ```bash
> i3 -C -c /path/to/your/config
> ```
> 
> - `-C` tells i3 to check the config and exit.
> - `-c` lets you pass an alternate config path. 
> - If there are errors, they’ll print to stderr. If all’s well, you’ll see nothing or just some info logs.
> 
> This is the **safe** way — it doesn’t start a new X session or kill your current one.
> 
> ---
> 
> ### 2. Run i3 in a nested X server (sandbox)
> If you want to **see** how the config behaves without replacing your WM:
> 
> ```bash
> Xephyr -br -ac -noreset -screen 1280x720 :1 &
> DISPLAY=:1 i3 -c /path/to/your/config
> ```
> 
> - Starts a fresh X server inside a window (`Xephyr`).
> - Runs i3 with your config inside that sandbox.
> - Lets you test without risking your real session.
> 
> ---
> 
> ### 3. Inline validation for automation
> If you’re scripting, you can parse logs:
> 
> ```bash
> i3 -C -c /path/to/config 2>&1 | grep ERROR
> ```
> 
> That way you can CI-check your dotfiles before deploying them.
> 
> ---
> 
> 👉 Question for you: 
> Do you want **just syntax checking** (like `-C` gives you), or do you want to actually **sandbox-run the config** (like with Xephyr) so you can check keybind behavior and window rules too?
<!-- UID: 56ccb3a6-71c2-4cdf-9bbd-263ec02fe3b0 -->

---


