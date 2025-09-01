---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Run Command with Templater"
conversation_id: 68852919-6348-8333-aaa9-049589a3547c
create_time: 07/26/2025 at 2:14 PM
update_time: 07/26/2025 at 4:28 PM
---

# Title: Run Command with Templater

Created: 07/26/2025 at 2:14 PM
Last Updated: 07/26/2025 at 4:28 PM
Chat URL: https://chat.openai.com/c/68852919-6348-8333-aaa9-049589a3547c


>[!nexus_agent] **Assistant** - 07/26/2025 at 2:14 PM
> To run a command from Obsidian using the **Templater plugin**, you’ll want to use **Templater’s JavaScript API** to access Obsidian commands.
> 
> Here’s the practical breakdown:
> 
> ---
> 
> ## ✅ Step-by-step: Running a command with Templater
> 
> 1. **Make sure the Templater plugin is installed and enabled.**
> 2. **Enable "Trigger Templater on new file creation"** in settings if relevant.
> 3. **Write a template with JavaScript that calls a command:**
> 
> ```js
> <%*
> const commandId = "editor:toggle-bold"; // change this to the command ID you want
> app.commands.executeCommandById(commandId);
> %>
> ```
> 
> This runs the command `editor:toggle-bold` when the template is triggered.
> 
> ---
> 
> ## 🔍 How do you find the command ID?
> 
> Use **Command Palette (Ctrl+P)** → Hover over the command → Look at the ID shown in the tooltip (Templater needs that ID, not the display name).
> 
> You can also look through the `app.commands.commands` object in the developer console (Ctrl+Shift+I → Console):
> 
> ```js
> app.commands.commands
> ```
> 
> This will list all available commands and their IDs.
> 
> ---
> 
> ## 🧠 Example: Run custom plugin command
> 
> Say you want to run a plugin command like **Daily Notes: Open today's daily note**, you’d use:
> 
> ```js
> <%* app.commands.executeCommandById("daily-notes:open-today") %>
> ```
> 
> ---
> 
> ## ⚠️ Notes and Caveats
> 
> - **Some commands are context-sensitive.** For example, if there’s no editor open, `editor:toggle-bold` will do nothing.
> - **You cannot chain commands natively** unless you write your own wrapper function or use delays (`await` with `sleep`).
> - If you want to run **shell commands**, that's a separate plugin like *Templater’s system command execution* (which is *unsafe* and needs to be enabled manually under *Templater settings > Enable Unsafe Mode*).
> 
> ---
> 
> ## 🔓 Bonus: Running shell/system commands (dangerous mode)
> 
> If you enabled *"Unsafe mode"*, you can do:
> 
> ```js
> <%* 
> await tp.system.run("echo Hello from the shell!");
> %>
> ```
> 
> ⚠️ Be careful with this. It can execute arbitrary code on your machine.
> 
> ---
> 
> Want to run a specific command or chain of them? I can help you build a full template. Just let me know what you're trying to trigger.
<!-- UID: ab02920b-837c-4077-9a5b-4ef50a942a92 -->

---




>[!nexus_user] **User** - 07/26/2025 at 2:14 PM
> How do I run a command from obsidian with templater?
<!-- UID: 1b0b0fdb-dede-436b-aae6-0ac669b65a30 -->




>[!nexus_agent] **Assistant** - 07/26/2025 at 4:21 PM
> Yeah, basically — **Obsidian commands don’t return Promises**, so you can’t `await` them directly. They execute asynchronously, and there's no built-in way to know *when* they're done. So, if you need to **wait for a command to finish before continuing**, you’ll have to either:
> 
> ---
> 
> ## 🪛 Option 1: Use a polling loop (yes, a timeout)
> 
> Here’s the canonical hacky pattern:
> 
> ```js
> <%*
> const runCommand = (id) => app.commands.executeCommandById(id);
> 
> // Run the command
> runCommand("editor:toggle-bold");
> 
> // Wait until some condition is met
> const waitForCondition = async (checkFn, interval = 100, timeout = 5000) => {
>  const start = Date.now();
>  while (true) {
>  if (checkFn()) return true;
>  if (Date.now() - start > timeout) throw new Error("Timeout waiting for condition");
>  await new Promise(resolve => setTimeout(resolve, interval));
>  }
> };
> 
> // Example: wait until the editor selection changes
> const oldSelection = app.workspace.activeEditor?.editor?.getSelection();
> await waitForCondition(() => app.workspace.activeEditor?.editor?.getSelection() !== oldSelection);
> %>
> ```
> 
> Change the `checkFn()` to whatever condition marks "the command is finished."
> 
> ---
> 
> ## 🧠 Option 2: Write your own wrapper plugin (for full control)
> 
> If you need better synchronization than what `Templater` can offer, you'd want to write an Obsidian plugin or modify an existing one, where you **hook into events** (like file opened, selection changed, markdown rendered, etc.) to detect when something completes.
> 
> That way you don’t guess — you **subscribe** to events like:
> 
> ```ts
> this.registerEvent(app.workspace.on('editor-change', callback));
> ```
> 
> ---
> 
> ## ⚠️ Limits of Templater
> 
> - You can only "watch" for state changes with polling.
> - There's no native way to hook into Obsidian command completion.
> - Some commands do things across ticks (e.g., async file opens), so checking immediately after won’t work.
> 
> ---
> 
> ## ✅ Practical Advice
> 
> If you're trying to:
> 
> - Wait for a **file to open** → Watch `app.workspace.getActiveFile()`.
> - Wait for **editor state to change** → Poll `app.workspace.activeEditor?.editor`.
> - Wait for a **command to run** → Look for side effects of that command in your loop.
> 
> Tell me the **specific command** you're trying to wait on, and I’ll help you craft a checkFn or smarter wait logic.
<!-- UID: 46a64d1e-07d4-4367-bad9-7d2d618d99ec -->

---




>[!nexus_user] **User** - 07/26/2025 at 4:21 PM
> Ok... so if I want to run a command and wait for it to finish being used... I have to use a timeout loop...?
<!-- UID: 2a397a5c-b725-4717-b3c8-1406db7f2a6a -->




>[!nexus_agent] **Assistant** - 07/26/2025 at 4:27 PM
> Ah, **`smart-context:open-context-select-modal`** — now we're getting into plugin territory.
> 
> This command opens a **modal**, probably to let you select or configure something before proceeding. Here's the core problem:
> 
> > ❗ **Templater cannot natively wait for a modal to close.**
> 
> That modal logic is running inside the Smart Context plugin, and unless it exposes some API or dispatches events you can hook into... you're flying blind.
> 
> So your only real options with Templater are:
> 
> ---
> 
> ## 🧪 1. **Polling Hack (Wait Until Modal Closes)**
> 
> ```js
> <%*
> app.commands.executeCommandById("smart-context:open-context-select-modal");
> 
> const waitForModalClose = async (timeout = 5000) => {
>  const start = Date.now();
>  while (true) {
>  // Scan modal container to see if any modal is still open
>  const modalsOpen = document.querySelectorAll(".modal").length > 0;
>  if (!modalsOpen) break;
>  if (Date.now() - start > timeout) throw new Error("Modal did not close in time");
>  await new Promise(res => setTimeout(res, 100));
>  }
> };
> 
> await waitForModalClose();
> // Continue script here
> %>
> ```
> 
> This works as long as the modal has `.modal` in its DOM class (which 99% of Obsidian modals do). This is a pretty solid approach if you’re OK relying on DOM structure.
> 
> ---
> 
> ## 🧠 2. **Smarter: Use a Plugin API if Available**
> 
> If the Smart Context plugin exposes a **global API** or **event hook**, you could maybe do something cleaner, like:
> 
> ```js
> <%*
> const ctx = app.plugins.plugins["smart-context"];
> if (ctx?.api?.openContextModal) {
>  await ctx.api.openContextModal(); // hypothetical
> }
> %>
> ```
> 
> But as of now, **Smart Context doesn't document a public API**, and `Templater` can’t access internal modal state beyond DOM polling.
> 
> ---
> 
> ## ✅ Final Rec
> 
> Your best bet for now is to use:
> 
> ```js
> await waitForModalClose()
> ```
> 
> after triggering the command. It’s not elegant, but it’s practical.
> 
> Want me to help write a reusable `waitForModalClose()` Templater snippet you can drop into any template? Or dig into the Smart Context plugin to see if it exposes anything internal we can hook into?
<!-- UID: be788b5b-adc3-44e1-a3cc-f5b3de0654ae -->

---




>[!nexus_user] **User** - 07/26/2025 at 4:27 PM
> "smart-context:open-context-select-modal"
<!-- UID: eb6c55bc-0a41-410c-9cc9-e9e69349144b -->


