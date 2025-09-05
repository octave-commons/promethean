---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Snap desktop file locations"
conversation_id: 68ab1956-2f08-8324-8d16-17f1a27bf918
create_time: 08/24/2025 at 8:53 AM
update_time: 08/24/2025 at 8:55 AM
---

# Title: Snap desktop file locations

Created: 08/24/2025 at 8:53 AM
Last Updated: 08/24/2025 at 8:55 AM
Chat URL: https://chat.openai.com/c/68ab1956-2f08-8324-8d16-17f1a27bf918


>[!nexus_user] **User** - 08/24/2025 at 8:53 AM
> how do I run a .desktop via commandline to debug
<!-- UID: 3a63d712-aa12-44d0-8fe0-8bfbd242f0c8 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:53 AM
> A `.desktop` file is just a text file with metadata that normally gets launched by a desktop environment through `xdg-open` or your application menu. To debug one from the command line, you’ve got a few options:
> 
> ### 1. Run it directly with `gtk-launch`
> If the `.desktop` file is installed in one of the standard application directories (`/usr/share/applications/` or `~/.local/share/applications/`), you can run:
> 
> ```bash
> gtk-launch <desktop-file-name-without-.desktop>
> ```
> 
> Example:
> ```bash
> gtk-launch firefox
> ```
> 
> ---
> 
> ### 2. Run the Exec line manually
> Open the file and look at its `Exec=` line:
> 
> ```bash
> cat ~/.local/share/applications/myapp.desktop
> ```
> 
> You’ll see something like:
> 
> ```
> Exec=/opt/myapp/bin/myapp --some-flag %U
> ```
> 
> You can copy that command and run it directly in the terminal. 
> - Strip out `%U`, `%F`, `%f`, etc.—they’re placeholders for filenames/URLs.
> - Add `--verbose` or similar if the app supports it, to get more debug output.
> 
> ---
> 
> ### 3. Use `desktop-file-install` + `desktop-file-validate`
> If you’re debugging *why* the `.desktop` file isn’t launching correctly:
> 
> ```bash
> desktop-file-validate myapp.desktop
> ```
> 
> That will point out syntax issues. You can also install it locally for testing:
> 
> ```bash
> desktop-file-install --dir=$HOME/.local/share/applications myapp.desktop
> ```
> 
> Then try `gtk-launch` as above.
> 
> ---
> 
> ### 4. Run via `xdg-open`
> If you want to see how your system would handle it:
> 
> ```bash
> xdg-open myapp.desktop
> ```
> 
> (though this is less useful for debugging, since it may silently fail).
> 
> ---
> 
> 👉 The most practical approach is usually **Option 2: extract the `Exec=` line and run it directly**. That way you get stdout/stderr in your terminal and can actually see what’s going wrong.
> 
> ---
> 
> Do you want me to show you a one-liner that extracts and runs the `Exec=` command from a `.desktop` file automatically, so you don’t have to copy it manually?
<!-- UID: 9567fccb-46b9-403d-b95b-9731be692583 -->

---




>[!nexus_user] **User** - 08/24/2025 at 8:55 AM
> where does snap put desktop files?
<!-- UID: 225c4541-bc91-41e9-bcc9-48e8266bd360 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:55 AM
> Snaps drop their `.desktop` launchers in a few different places depending on the snap and whether it’s system-wide or user-installed. The usual suspects are:
> 
> - **System-wide (auto-generated launchers):**
>  ```
>  /var/lib/snapd/desktop/applications/
>  ```
>  → This is where snapd creates `.desktop` files for each snap app. These get picked up by your desktop environment so they show up in menus.
> 
> - **User-local (sym / wrappers sometimes end up here):**
>  ```
>  ~/.local/share/applications/
>  ```
>  If you’ve installed a snap as your user, you might find a symlink or copy here pointing to the real one under `/var/lib/snapd`.
> 
> - **Data/config for the app itself:**
>  ```
>  ~/snap/<snap-name>/
>  ```
>  (not `.desktop` files, but this is where runtime data lives).
> 
> ---
> 
> So if you want to debug a snap app’s `.desktop` file, check here first:
> 
> ```bash
> ls /var/lib/snapd/desktop/applications | grep <snap-name>
> ```
> 
> Then you can `cat` it, grab the `Exec=` line, and run that directly in your terminal.
> 
> ---
> 
> Do you want me to give you a quick one-liner that finds all `.desktop` files for a given snap (say `firefox`) so you can jump straight into debugging?
<!-- UID: ded7d326-bfe8-4087-a638-df27d4f443cf -->

---


