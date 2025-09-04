---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Find .desktop files"
conversation_id: 68b30dda-7bbc-8328-8503-dad27950a174
create_time: 08/30/2025 at 9:42 AM
update_time: 08/31/2025 at 8:10 AM
---

# Title: Find .desktop files

Created: 08/30/2025 at 9:42 AM
Last Updated: 08/31/2025 at 8:10 AM
Chat URL: https://chat.openai.com/c/68b30dda-7bbc-8328-8503-dad27950a174


>[!nexus_user] **User** - 08/30/2025 at 9:42 AM
> find .desktop files
<!-- UID: 055facbe-d18c-438c-97b1-8c54e3d42ec9 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 9:42 AM
> If you mean on **your local system** (not in Google Drive), you can list all `.desktop` files with:
> 
> ```bash
> find /usr/share/applications ~/.local/share/applications -name "*.desktop"
> ```
> 
> This will cover both system-wide and user-specific locations. 
> If you want literally every `.desktop` file anywhere:
> 
> ```bash
> find / -type f -name "*.desktop" 2>/dev/null
> ```
> 
> (the `2>/dev/null` hides permission errors). 
> 
> ---
> 
> ⚠️ If you meant *searching your Google Drive* for `.desktop` files, let me know — I’ll run a Drive search for them. Do you want me to check Drive, or just your Linux filesystem?
<!-- UID: 013d7bde-088f-4963-84d5-8461542c1579 -->

---




>[!nexus_user] **User** - 08/30/2025 at 9:44 AM
> yea... I have 2 Emacs Client desktop files somewhere and one doesn't work and it's annoying
<!-- UID: d9348fdf-f561-40ab-9fde-fab189452e90 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 9:44 AM
> Got it — you’re talking about **the `.desktop` launcher files on your Linux system**, not Drive. 
> 
> Here’s how you can track down the two Emacs Client entries:
> 
> ### 1. Look in the standard application directories
> ```bash
> ls /usr/share/applications | grep emacs
> ls ~/.local/share/applications | grep emacs
> ```
> 
> These two directories are where almost all `.desktop` files live:
> - `/usr/share/applications` → system-wide launchers
> - `~/.local/share/applications` → user-specific overrides
> 
> ### 2. Use `find` to be thorough
> ```bash
> find /usr/share/applications ~/.local/share/applications -type f -iname "*emacs*client*.desktop"
> ```
> 
> ### 3. Inspect which one is broken
> Open each candidate `.desktop` file:
> ```bash
> xdg-open /usr/share/applications/emacsclient.desktop
> xdg-open ~/.local/share/applications/emacsclient.desktop
> ```
> 
> Or directly with `cat`/`less`:
> ```bash
> less ~/.local/share/applications/emacsclient.desktop
> ```
> 
> Look at fields like:
> - `Exec=` → the actual command it launches 
> - `Icon=` → sometimes mismatched 
> - `Name=` → how it shows in menus
> 
> ### 4. Remove or fix the bad one
> If one is clearly broken, you can either delete it:
> ```bash
> rm ~/.local/share/applications/emacsclient.desktop
> ```
> (only touch the one in your home directory unless you want to edit system-wide defaults) 
> 
> Or edit it with:
> ```bash
> nano ~/.local/share/applications/emacsclient.desktop
> ```
> 
> ---
> 
> 👉 Do you want me to walk you through **fixing** the broken `.desktop` file (e.g. correcting the `Exec` line), or are you just trying to delete the duplicate so only one shows up?
<!-- UID: 9cf29ad8-2ab9-4939-bd4a-3573ce5bba21 -->

---




>[!nexus_user] **User** - 08/30/2025 at 9:53 AM
> Where else might a desktop file live? I may have found it, a left over from the dpt apt of emacs. I moved to the snap distrobution because it is more up to date, and I couldn't use a package I wanted to with out the latest emacs.
> 
> I deleted it, it still shows up in dmenu, I think I have to do a reload command?
> 
> I have such a bad memory. I've done this before. I feel kinda stupid for not remembering the exact commands, but I know I'm not... I'm forgetful. Not stupid. There is a difference.
> any way, help me out
<!-- UID: e02c5ffd-dd3e-4be8-817b-503c4ac075bd -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 9:53 AM
> You’re not stupid — this is one of those “Unix rituals” that’s easy to forget because you only need it every few months. I’ll lay it out cleanly: 
> 
> ---
> 
> ## Where `.desktop` files can live
> - **System-wide:** 
>  `/usr/share/applications/` 
>  `/usr/local/share/applications/`
> - **User-specific:** 
>  `~/.local/share/applications/`
> - **Snap packages:** 
>  `/var/lib/snapd/desktop/applications/` 
>  (Snap drops `.desktop` launchers here, and they show up in menus like dmenu/rofi automatically.)
> 
> ---
> 
> ## Why it still shows up
> dmenu (and rofi, GNOME, XFCE menus, etc.) read from the **XDG desktop entries cache**. Deleting the file isn’t always enough because the cache persists until it’s refreshed.
> 
> ---
> 
> ## How to refresh after deleting
> Run this to rebuild the menu cache:
> 
> ```bash
> update-desktop-database ~/.local/share/applications
> sudo update-desktop-database /usr/share/applications
> ```
> 
> If you removed a Snap leftover:
> ```bash
> sudo update-desktop-database /var/lib/snapd/desktop/applications
> ```
> 
> Then log out/in, or just restart your panel/menu launcher. For dmenu specifically, since it regenerates its list on-the-fly, you may just need to **kill and restart it** (depending on your setup). If you use something like `dmenu_run`, you can rebuild its cache with:
> 
> ```bash
> hash -r
> ```
> 
> ---
> 
> ✅ **Practical steps for you right now**:
> 1. Check if the broken entry is still in `/var/lib/snapd/desktop/applications/`.
> 2. Delete it if it’s not needed. 
> 3. Run `update-desktop-database` on the relevant directories. 
> 4. Restart your session or just re-run `dmenu_run`. 
> 
> ---
> 
> Do you want me to write you a **one-liner script** you can keep around to clean + refresh `.desktop` entries anytime this happens, so you don’t have to remember the commands?
<!-- UID: 8814f025-d297-4d0b-8d42-6743b965827d -->

---




>[!nexus_user] **User** - 08/30/2025 at 9:56 AM
> logging out takes longer than I'd like... I have a feeling it is because my login manage runs in wayland (default ubuntu) but I run I3, so I'm in xorg. Pretty sure logging out is faster when I am in the wayland gnome that comes with ubuntu.
<!-- UID: 9f8265af-8f92-4eca-bae0-a0322e8a053a -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 9:56 AM
> Yeah, that tracks. On Ubuntu, when you’re mixing Wayland + Xorg (GDM running Wayland but i3 on Xorg), the logout/login dance is clunky — the display manager has to spin up a new Xorg session and it takes noticeably longer. 
> 
> Good news is: you don’t need to log out just to clear the stale `.desktop` entry.
> 
> ---
> 
> ## How to refresh without logging out
> 
> ### 1. Rebuild desktop cache
> ```bash
> update-desktop-database ~/.local/share/applications
> sudo update-desktop-database /usr/share/applications
> sudo update-desktop-database /var/lib/snapd/desktop/applications
> ```
> 
> ### 2. Kill and restart the menu
> For **dmenu**, it just reads `$PATH` and `.desktop` entries when you call it. If you’re using `dmenu_run` (or rofi in desktop mode), you may need to rebuild the cache:
> 
> ```bash
> rm ~/.cache/dmenu_run
> ```
> 
> Then the next time you run `dmenu_run`, it rescans.
> 
> ### 3. Force GTK/desktop cache refresh (optional)
> Some environments also keep a MIME/desktop entry cache:
> 
> ```bash
> sudo update-mime-database /usr/share/mime
> ```
> 
> ---
> 
> ## TL;DR for you
> If you already deleted the duplicate `.desktop` file:
> ```bash
> rm ~/.cache/dmenu_run
> update-desktop-database ~/.local/share/applications
> ```
> 
> That should make it disappear from dmenu immediately — no logout needed.
> 
> ---
> 
> Want me to throw together a little script like `refresh-desktop-cache` you can drop in `~/bin/` so next time you just type one command and forget all these details?
<!-- UID: f824fde7-2390-4457-8392-a1c5ea683f04 -->

---




>[!nexus_user] **User** - 08/30/2025 at 10:01 AM
> I ran those commands, then I relogged, then rebooted, I still see 2 emacsclients even after removing the old deb one.
<!-- UID: 0d39903d-7e82-4b98-9cfc-3b0a912440d7 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 10:02 AM
> Alright, so if a reboot didn’t clear it, then something is **still dropping a second `.desktop` file back into your XDG app paths**. Let’s hunt it down methodically. 
> 
> ---
> 
> ## Step 1. Find every Emacs-related `.desktop` file
> Run:
> 
> ```bash
> grep -ril emacs /usr/share/applications ~/.local/share/applications /var/lib/snapd/desktop/applications
> ```
> 
> This will print any `.desktop` file that even mentions `emacs`. 
> Pay attention if you see **two different `emacsclient.desktop`** files.
> 
> ---
> 
> ## Step 2. Check the Snap-installed one
> Snaps create their own launchers in:
> 
> ```
> /var/lib/snapd/desktop/applications/
> ```
> 
> Example: 
> ```
> /var/lib/snapd/desktop/applications/emacs_emacsclient.desktop
> ```
> 
> These often have a slightly different filename (`emacs_emacsclient.desktop`) compared to the Debian package (`emacsclient.desktop`). That would explain why you see two.
> 
> ---
> 
> ## Step 3. Identify which one is still present
> Open them:
> 
> ```bash
> less /usr/share/applications/*emacs*.desktop
> less ~/.local/share/applications/*emacs*.desktop
> less /var/lib/snapd/desktop/applications/*emacs*.desktop
> ```
> 
> Look at the `Name=` and `Exec=` fields — you’ll probably see one pointing to `/usr/bin/emacsclient` (the old apt/deb) and one pointing to `/snap/bin/emacsclient` (the snap version). 
> 
> ---
> 
> ## Step 4. Remove or override the bad one
> If the **apt package is fully removed** but you still have a stale `.desktop` left in `/usr/share/applications/`, you can just delete it:
> 
> ```bash
> sudo rm /usr/share/applications/emacsclient.desktop
> ```
> 
> If you only want the Snap’s launcher, you can also **mask** the system one by making an empty override in your local directory:
> 
> ```bash
> mkdir -p ~/.local/share/applications
> echo "[Desktop Entry]
> NoDisplay=true
> " > ~/.local/share/applications/emacsclient.desktop
> ```
> 
> This hides the old entry without messing with system files.
> 
> ---
> 
> ## Likely cause in your case
> I’m betting you have:
> - `emacsclient.desktop` from the old deb still in `/usr/share/applications/` 
> - `emacs_emacsclient.desktop` from the Snap in `/var/lib/snapd/desktop/applications/`
> 
> That’s why dmenu shows *two*. 
> 
> ---
> 
> 👉 Do you want me to show you a **one-liner that lists both the `Name=` fields side by side**, so you can immediately see which file is still haunting you?
<!-- UID: 96cf87f5-c499-4b3e-9a81-7f68ba385356 -->

---




>[!nexus_user] **User** - 08/30/2025 at 10:23 AM
> I found it, thanks. The one in /var/lib/snap is the bad one. I renamed the /usr/share/applications one so I could tell the difference.
> 
> is it safe to remove it from snap? Snap is kinda funny some times... so I want to make sure...
<!-- UID: 4f9a13c5-e855-454d-817c-94115d158aca -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 10:23 AM
> Good call to be cautious — Snap does things differently than apt/deb.
> 
> ### How Snap handles `.desktop` files
> - Snap automatically **installs `.desktop` launchers** for each app into: 
>  `/var/lib/snapd/desktop/applications/`
> - These are regenerated whenever you install, refresh, or update a Snap.
> - If you just delete one, Snap may recreate it on the next update.
> 
> ### Safe ways to hide/remove
> 1. **Preferred (safe):** Mask it with a local override so it won’t show in menus:
>  ```bash
>  mkdir -p ~/.local/share/applications
>  cp /var/lib/snapd/desktop/applications/emacs_emacsclient.desktop ~/.local/share/applications/
>  echo -e "[Desktop Entry]\nNoDisplay=true" > ~/.local/share/applications/emacs_emacsclient.desktop
>  update-desktop-database ~/.local/share/applications
>  ```
>  → This tells dmenu/rofi/gnome-menus “don’t display this entry,” while leaving Snap untouched.
> 
> 2. **Direct removal (not recommended):**
>  ```bash
>  sudo rm /var/lib/snapd/desktop/applications/emacs_emacsclient.desktop
>  ```
>  It works, but Snap will probably drop it back in after the next refresh.
> 
> 3. **Snap-native cleanup:** 
>  Sometimes Snaps install multiple launchers (e.g. `emacs` and `emacsclient`). You can see them with:
>  ```bash
>  snap run --shell emacs -c 'ls $SNAP/meta/gui'
>  ```
>  If you don’t want the client at all, check if Snap has a config option (not all do). Otherwise, masking with `NoDisplay=true` is the cleanest route.
> 
> ---
> 
> 👉 My recommendation: **don’t delete directly from `/var/lib/snapd`** — use the override with `NoDisplay=true`. That way you stay in control, even if Snap updates. 
> 
> Do you want me to give you a one-liner that will automatically copy any unwanted Snap `.desktop` file into `~/.local/share/applications` and mark it hidden? That way you can apply it to other duplicates in the future without worrying about Snap regenerating them.
<!-- UID: ccb3ec75-4c1c-4bd9-9957-46b90d422c0e -->

---




>[!nexus_user] **User** - 08/30/2025 at 10:28 AM
> interesting... we have done this before, a file with that exact content was already present in that location.
> 
> And it is the broken one.
> 
> The good one is the on located in /usr/share/applications.
<!-- UID: 95343cf8-cb2c-46d6-9d70-55797bb5d3c6 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 10:28 AM
> Ahh — makes sense now. That explains the weirdness: 
> 
> - The **Snap version** drops its own `.desktop` launchers into `/var/lib/snapd/desktop/applications/`. 
> - You also had a **masking file** in `~/.local/share/applications/` with `NoDisplay=true`, which actually referred to that Snap launcher — so the broken one was effectively *“hidden” but still chosen by dmenu/rofi sometimes.* 
> - Meanwhile, the **Debian `.desktop`** in `/usr/share/applications/` was the one that really worked. 
> 
> ---
> 
> ### Is it safe to remove from Snap?
> If you mean just nuking the file in `/var/lib/snapd/desktop/applications/`: 
> 
> - **Yes, it won’t break Emacs itself.** The `.desktop` file is just a shortcut/metadata, not the binary. 
> - **But:** Snap may *recreate it* on the next refresh/update, since those files are generated from the Snap package manifest. 
> 
> ---
> 
> ### What I recommend
> Instead of outright deleting, override it at the user level:
> 
> ```bash
> mkdir -p ~/.local/share/applications
> cp /usr/share/applications/emacsclient.desktop ~/.local/share/applications/
> ```
> 
> Now you “own” the launcher definition. Your copy in `~/.local/share/applications/` will *always* take precedence over anything Snap (or even apt) puts in. 
> 
> If you don’t want Snap’s launcher cluttering menus at all, make a local stub that hides it:
> 
> ```bash
> cat > ~/.local/share/applications/emacs_emacsclient.desktop <<EOF
> [Desktop Entry]
> NoDisplay=true
> EOF
> ```
> 
> That way:
> - The working `/usr/share/applications` entry is still visible. 
> - The Snap one is masked forever, even if Snap updates. 
> 
> ---
> 
> Would you like me to give you a **little helper script** (say `fix-desktop.sh`) that: 
> 1. Finds duplicate `.desktop` entries for the same app, 
> 2. Lets you pick the good one, 
> 3. Automatically masks the others with `NoDisplay=true` in `~/.local/share/applications/`? 
> 
> That way you never have to think about this again.
<!-- UID: 18327b94-e01c-433e-804b-702d92c7807f -->

---


