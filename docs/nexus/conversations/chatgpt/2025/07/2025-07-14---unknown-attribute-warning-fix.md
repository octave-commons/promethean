---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Unknown attribute warning fix"
conversation_id: 68759fef-2388-8004-8bbe-b4382c61d8e9
create_time: 07/14/2025 at 7:25 PM
update_time: 07/14/2025 at 7:25 PM
---

# Title: Unknown attribute warning fix

Created: 07/14/2025 at 7:25 PM
Last Updated: 07/14/2025 at 7:25 PM
Chat URL: https://chat.openai.com/c/68759fef-2388-8004-8bbe-b4382c61d8e9


>[!nexus_agent] **Assistant** - 07/14/2025 at 7:25 PM
> That warning:
> 
> ```
> Ignoring unknown attribute 'additionalentityattributes:lung_capacity'
> ```
> 
> means that some mod (likely one using or depending on [Additional Entity Attributes](https://modrinth.com/mod/additional-entity-attributes) or something like it) is trying to register or access an entity attribute that isn’t currently recognized or available in your server’s current mod environment.
> 
> ### Why this happens:
> - A **mod is trying to use a custom attribute** that either:
>  - Isn’t registered (e.g., the mod providing `lung_capacity` isn’t installed).
>  - Is registered *client-side only* (not available on the server).
>  - Is registered in the **wrong lifecycle phase** or with a mismatch in **mod versions**.
> 
> ### Common causes:
> - You updated or removed a mod, but **some other mod still expects it**.
> - **Mismatch between client and server mods**, e.g., a client-side-only mod that doesn’t affect the server logic but still triggers attribute registration attempts.
> - The mod using `additionalentityattributes` isn't initializing its attributes correctly on the server.
> 
> ---
> 
> ### How to fix or silence it:
> 
> #### 1. **Check your mod list**:
> Look for any mods depending on:
> - `additionalentityattributes`
> - Mods that add or modify entity behaviors (like swimming, breathing, etc.)
> 
> If the attribute `lung_capacity` sounds like something from a swimming, diving, or underwater mod, check those first.
> 
> #### 2. **Compare mod versions between client and server**:
> If you're running the same modpack on both, make sure they're *exactly* the same. Even a minor mismatch can break attribute registration.
> 
> #### 3. **Optional - Find the culprit with a text search**:
> If you’re managing your own mods, grep your mods folder for `lung_capacity`:
> ```sh
> grep -ri lung_capacity mods/
> ```
> On Windows, try a tool like Notepad++ or `findstr`.
> 
> #### 4. **Ignore if it’s non-breaking**:
> These messages are warnings, not errors. Unless the game is crashing or behavior is broken, it’s safe to ignore them—just mildly annoying noise in your logs.
> 
> You can redirect or filter these out if needed (e.g., using `log4j2.xml` configuration or piping logs through a filter script).
> 
> ---
> 
> If you send me your `mods` folder list or a `modlist.txt`, I can tell you the likely culprit. Or, if you’re using a modpack (like from CurseForge or Modrinth), let me know which one and I can dig deeper.
<!-- UID: 3fe21a07-4b9b-4b6b-8863-a128722ff1c5 -->

---




>[!nexus_user] **User** - 07/14/2025 at 7:25 PM
> My minecraft server is spitting a bunch of these at me:
> mc-1 | [00:24:41] [Server thread/WARN]: Ignoring unknown attribute 'additionalentityattributes:lung_capacity'
<!-- UID: a12d2682-cca9-4fd6-8bcb-4b5298521c66 -->


