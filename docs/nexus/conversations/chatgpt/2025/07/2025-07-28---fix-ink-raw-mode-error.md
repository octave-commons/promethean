---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fix Ink Raw Mode Error"
conversation_id: 6887ee14-f274-8325-b14f-ac2d90839d75
create_time: 07/28/2025 at 4:39 PM
update_time: 07/28/2025 at 4:40 PM
---

# Title: Fix Ink Raw Mode Error

Created: 07/28/2025 at 4:39 PM
Last Updated: 07/28/2025 at 4:40 PM
Chat URL: https://chat.openai.com/c/6887ee14-f274-8325-b14f-ac2d90839d75


>[!nexus_user] **User** - 07/28/2025 at 4:39 PM
> ERROR Raw mode is not supported on the current process.stdin, which Ink uses
>  as input stream by default.
>  Read about how to prevent this error on
>  https://github.com/vadimdemedes/ink/#israwmodesupported
> 
>  - Read about how to prevent this error on
>  https://github.com/vadimdemedes/ink/#israwmodesupported
>  -handleSetRawM (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@opena
>  ode i/codex/dist/cli.js:327:2020)
>  - (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/dist/
>  cli.js:332:1151)
>  -Om (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/dis
>  t/cli.js:112:27792)
>  -w4e (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/di
>  st/cli.js:125:13596)
>  -D4e (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/di
>  st/cli.js:125:13340)
>  -I4e (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/di
>  st/cli.js:125:13246)
>  -T4e (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/di
>  st/cli.js:125:13122)
>  -SIe (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/di
>  st/cli.js:129:11814)
>  -Cp (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/dis
>  t/cli.js:129:11468)
>  - (file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/dist/
>  cli.js:129:10560)
> 
> Warning: Detected unsettled top-level await at file:///C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js:147
>  await import(cliUrl);
>  ^
<!-- UID: e759b010-cef2-4413-b835-82969a3238e3 -->




>[!nexus_agent] **Assistant** - 07/28/2025 at 4:39 PM
> This error is caused by Ink (a library used for building CLI UIs in React) trying to set `process.stdin.setRawMode(true)`—which only works if the input stream is a TTY. This fails when running in environments like:
> 
> - **non-interactive shells** (e.g., certain CI tools),
> - **non-TTY environments** (like some terminal emulators),
> - **stdin is redirected** (e.g., piped input),
> - or **in some Windows terminals**, especially if they’re not fully TTY-compliant.
> 
> ### 💥 Error Summary:
> ```
> Raw mode is not supported on the current process.stdin
> ```
> 
> ---
> 
> ### ✅ How to Fix It
> 
> 1. **Use the `isRawModeSupported()` check first** 
>  Ink 4+ exposes a function to guard this behavior:
>  ```js
>  import { isRawModeSupported } from 'ink';
> 
>  if (isRawModeSupported()) {
>  process.stdin.setRawMode(true);
>  }
>  ```
>  But since this is in a **CLI you didn’t write** (i.e., `@openai/codex`), the fix has to be from the environment or upstream.
> 
> 2. **Run Codex in a compatible terminal** 
>  Make sure you're using a terminal that supports TTY input:
>  - Use **Windows Terminal**, **Git Bash**, or **WSL**.
>  - Avoid running inside **VS Code’s built-in terminal** or **certain GUI shells** that may lack full TTY support.
> 
> 3. **Run Codex with `--no-interactive` (if supported)** 
>  Check if `codex` has a flag like `--no-interactive` or a "batch mode". That would avoid invoking Ink's raw mode entirely.
> 
> 4. **Patch the CLI as a last resort** 
>  If you're stuck, you could manually patch the `cli.js` to wrap the `setRawMode` calls with the `isRawModeSupported()` check. Messy, but doable.
> 
>  Example:
>  ```js
>  import { isRawModeSupported } from 'ink';
>  if (isRawModeSupported() && process.stdin.setRawMode) {
>  process.stdin.setRawMode(true);
>  }
>  ```
> 
> ---
> 
> ### 🧠 Background
> Ink uses `process.stdin.setRawMode(true)` to handle keypresses in a low-level way, for UIs that need arrow keys, backspace, etc. But `setRawMode` throws when not supported.
> 
> You’re hitting this because the terminal you're running in **isn't returning a TTY**, which breaks raw mode.
> 
> ---
> 
> ### 🛠 Your Situation
> You're running:
> ```
> C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/bin/codex.js
> ```
> Try:
> - Running it from **Git Bash**, **Windows Terminal**, or **PowerShell 7+**.
> - Avoid VS Code's terminal.
> - If still broken, consider submitting a bug to OpenAI to wrap `setRawMode` in the proper check.
> 
> Want help wrapping that CLI yourself or creating a shell script workaround?
<!-- UID: a9925dd0-1aff-451b-aff5-ab9e554fff9a -->

---




>[!nexus_user] **User** - 07/28/2025 at 4:40 PM
> I am running from git bash... I guess I'll try it in another terminal
<!-- UID: 67cb87da-bc7c-4133-b76f-c7514dbcdce3 -->




>[!nexus_agent] **Assistant** - 07/28/2025 at 4:40 PM
> Yeah, Git Bash *should* support raw mode—but it's hit or miss depending on how it's launched and which terminal emulator is backing it (MinTTY, ConEmu, etc.).
> 
> ### 💡 Try This First:
> Run it in **Windows Terminal** (the new one from the Microsoft Store), with the **PowerShell** or **Command Prompt** profile. That terminal is usually TTY-safe for raw mode.
> 
> ### 🔬 Debug Check
> You can also test whether raw mode is supported by running this minimal Node script:
> ```bash
> node -e "console.log(process.stdin.isTTY); try { process.stdin.setRawMode(true); console.log('Raw mode OK'); } catch (e) { console.error('Raw mode FAILED', e.message); }"
> ```
> If you see:
> ```
> true
> Raw mode OK
> ```
> Then the terminal supports it. If you see:
> ```
> false
> Raw mode FAILED ...
> ```
> Then your stdin isn't a TTY.
> 
> ---
> 
> ### 🩹 Workaround (if all else fails)
> You can *temporarily* patch the local CLI. In your `cli.js`, search for `.setRawMode(true)` and wrap it like this:
> ```js
> import { isRawModeSupported } from 'ink';
> 
> if (isRawModeSupported() && process.stdin.setRawMode) {
>  process.stdin.setRawMode(true);
> }
> ```
> You’ll find the file at:
> ```
> C:/Users/foamy/AppData/Roaming/npm/node_modules/@openai/codex/dist/cli.js
> ```
> 
> ---
> 
> Let me know what terminal ends up working, and we can consider hardening it or creating a wrapper script that detects terminal support for Codex.
<!-- UID: 3bb00b52-8594-4953-b443-bfd3e16913ea -->

---


