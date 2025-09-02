---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Firefox with pcmanfm"
conversation_id: 68acfc1f-0984-8328-b8f2-4e4c0251dc2c
create_time: 08/25/2025 at 7:13 PM
update_time: 08/25/2025 at 7:15 PM
---

# Title: Firefox with pcmanfm

Created: 08/25/2025 at 7:13 PM
Last Updated: 08/25/2025 at 7:15 PM
Chat URL: https://chat.openai.com/c/68acfc1f-0984-8328-b8f2-4e4c0251dc2c


>[!nexus_user] **User** - 08/25/2025 at 7:13 PM
> I need my firefox to use pcman fm when I open the downloads folder, or an archive like a zip or a tarball
<!-- UID: 298ce1fd-5721-4d02-8c8d-b614b71b09ce -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 7:13 PM
> Got it — you want **Firefox to stop handing things off to GNOME’s default (probably Nautilus/Files or Archive Manager)** and instead open with **pcmanfm** when you click *“Open Containing Folder”* or open a downloaded archive.
> 
> There are a couple of layers to this on Linux, because Firefox doesn’t hard-code file managers or archive tools — it uses **xdg-mime defaults** and **desktop files**. Let’s walk it through the right way.
> 
> ---
> 
> ### 1. Make `pcmanfm` the default file manager system-wide
> Firefox relies on `xdg-open` for "Open Containing Folder". You need to point that at `pcmanfm`.
> 
> Check what it is now:
> ```bash
> xdg-mime query default inode/directory
> ```
> 
> If it shows `org.gnome.Nautilus.desktop` or something else, change it:
> ```bash
> xdg-mime default pcmanfm.desktop inode/directory
> ```
> 
> Confirm:
> ```bash
> xdg-mime query default inode/directory
> ```
> 
> That ensures **directories** always open with `pcmanfm`.
> 
> ---
> 
> ### 2. Make archives open with `pcmanfm` (or a tool of your choice)
> By default `.zip`, `.tar.gz`, etc. are bound to `file-roller.desktop` (GNOME Archive Manager). If you want **pcmanfm** to handle them, you need to override their associations.
> 
> Check what handles zip now:
> ```bash
> xdg-mime query default application/zip
> ```
> 
> Set `pcmanfm.desktop` instead:
> ```bash
> xdg-mime default pcmanfm.desktop application/zip
> xdg-mime default pcmanfm.desktop application/x-tar
> xdg-mime default pcmanfm.desktop application/x-gzip
> xdg-mime default pcmanfm.desktop application/x-bzip2
> ```
> 
> > ⚠️ Note: `pcmanfm` doesn’t *extract* archives itself — it just opens them in a file view. If that’s fine (you just want to browse them, or you’ve got integration via `xarchiver`), then this is correct. If you really want **double-click = extract**, you should assign `xarchiver.desktop` instead.
> 
> ---
> 
> ### 3. Update the user’s `mimeapps.list`
> These `xdg-mime` commands actually write to your user config:
> - `~/.config/mimeapps.list` 
> - or on some distros, `~/.local/share/applications/mimeapps.list`
> 
> It’ll look something like:
> ```ini
> [Default Applications]
> inode/directory=pcmanfm.desktop
> application/zip=pcmanfm.desktop
> application/x-tar=pcmanfm.desktop
> application/x-gzip=pcmanfm.desktop
> ```
> 
> You can edit this file directly if you want fine-grained control.
> 
> ---
> 
> ### 4. Restart Firefox
> Firefox caches handler info. Close and reopen it, then try:
> - Right-click a file → *Open Containing Folder* → should now be `pcmanfm`.
> - Open a `.zip` from Downloads → should now launch in `pcmanfm`.
> 
> ---
> 
> 💡 If you want **archives extracted automatically** instead of opened in a file manager, we’d wire those MIME types to `xarchiver.desktop` or `engrampa.desktop`.
> 
> ---
> 
> Do you want me to show you how to make a **custom `.desktop` file** (e.g. `pcmanfm-archives.desktop`) that extracts archives via `xarchiver` but still uses `pcmanfm` for folders — so Firefox doesn’t confuse the two?
<!-- UID: 46483e6d-0bcd-4c15-b232-6a407039f406 -->

---




>[!nexus_user] **User** - 08/25/2025 at 7:15 PM
> the default inode program was already pcman fm. Firefox doesn't appear to be respecting it
<!-- UID: e81cb40b-6cef-4d3b-a884-1425150b0afa -->




>[!nexus_agent] **Assistant** - 08/25/2025 at 7:15 PM
> Ahhh — thanks, that narrows it down. If `xdg-mime query default inode/directory` already gives you `pcmanfm.desktop` and Firefox *still* launches Nautilus (or something else) for “Open Containing Folder,” that means Firefox is **not going through `xdg-open` like most apps**. 
> 
> Firefox on Linux has a bit of a history here: 
> 
> - For *folders*, it prefers `gnome-open` / `gvfs-open` / `gio open` if those are on `$PATH`. 
> - Only if those fail will it fall back to `xdg-open`. 
> - On GNOME/Ubuntu, `gio` is installed by default → so Firefox uses GNOME’s file manager instead of your `xdg-mime` defaults. 
> 
> That explains why it’s ignoring `pcmanfm`. 
> 
> ---
> 
> ## Fix: Wrap/override `gio open`
> The clean way is to intercept what Firefox is calling and point it at `pcmanfm`.
> 
> ### Option 1. Local bin override
> 1. Make sure `~/bin` or `~/.local/bin` is on your `$PATH` *before* `/usr/bin`. 
> 2. Create a wrapper script called `gio`:
>  ```bash
>  mkdir -p ~/.local/bin
> 
>  cat > ~/.local/bin/gio <<'EOF'
>  #!/bin/sh
>  if [ "$1" = "open" ]; then
>  shift
>  exec pcmanfm "$@"
>  else
>  exec /usr/bin/gio "$@"
>  fi
>  EOF
> 
>  chmod +x ~/.local/bin/gio
>  ```
> 3. Restart Firefox. 
> 
> Now whenever Firefox runs `gio open <folder>`, it launches `pcmanfm`. 
> 
> ---
> 
> ### Option 2. About:config override
> Firefox also has a hidden pref: 
> 
> 1. Go to `about:config`. 
> 2. Search for: 
>  ```
>  file.chooseFolder.openDir
>  ```
>  (sometimes named `filemanager.command` depending on version). 
> 
> If present, set it to: 
> ```
> pcmanfm %s
> ``` 
> 
> Not all builds expose this, but it’s worth checking. 
> 
> ---
> 
> ### Option 3. Custom `.desktop` trick
> Some distros hardcode to `org.freedesktop.FileManager1` DBus interface. In that case you can drop in a `pcmanfm.desktop` file with: 
> ```ini
> [Desktop Entry]
> Name=PCManFM
> Exec=pcmanfm %U
> MimeType=inode/directory;
> NoDisplay=true
> Type=Application
> X-GNOME-UsesNotifications=true
> DBusActivatable=true
> ```
> and register it with:
> ```bash
> xdg-mime default pcmanfm.desktop inode/directory
> ```
> But since you said `xdg-mime` already points at pcmanfm, this is likely not the issue — the culprit is `gio`.
> 
> ---
> 
> ⚡ So the **most direct fix**: wrap `gio open` so Firefox can’t sneak around your defaults. 
> 
> ---
> 
> Do you want me to give you a **drop-in wrapper** that works for both folders and archives (so zip/tar open in `pcmanfm` too), or do you want to keep archives separate and handled by `xarchiver` or similar?
<!-- UID: b1d60472-cfb4-48d6-9dea-ab7a4f5ee993 -->

---


