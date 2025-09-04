---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Reinstalling pcmanfm with dark mode"
conversation_id: 68a00f90-d6d4-8330-bfc4-ec72628b8fd8
create_time: 08/15/2025 at 11:56 PM
update_time: 08/16/2025 at 12:12 AM
---

# Title: Reinstalling pcmanfm with dark mode

Created: 08/15/2025 at 11:56 PM
Last Updated: 08/16/2025 at 12:12 AM
Chat URL: https://chat.openai.com/c/68a00f90-d6d4-8330-bfc4-ec72628b8fd8


>[!nexus_user] **User** - 08/15/2025 at 11:56 PM
> Yo I need a better default file explorer. And i need it to be in dark mode. Fuckin, every time I open a file I download, my eye balls are seared.
<!-- UID: b15c83f3-e40b-40e6-af1a-c0ae83b9b25d -->




>[!nexus_agent] **Assistant** - 08/15/2025 at 11:56 PM
> Got you. Let’s fix this the *right* way: pick a better file manager and make the whole stack prefer dark, so “Show in folder” and file dialogs stop flashbanging you.
> 
> ## 1) Install a sane, lightweight GUI file manager (dark-friendly)
> Thunar is small, fast, and plays nice with i3. (If you want bells & whistles instead, swap “thunar” for “nemo” everywhere.)
> 
> ```bash
> sudo apt update
> sudo apt install thunar thunar-archive-plugin tumbler ffmpegthumbnailer \
>  xdg-desktop-portal xdg-desktop-portal-gtk
> ```
> 
> Why those extras:
> - `thunar-archive-plugin` = right-click extract/compress.
> - `tumbler`/`ffmpegthumbnailer` = thumbnails for images/videos.
> - `xdg-desktop-portal(-gtk)` = lets Firefox/other apps use your default file manager from “Show in folder”.
> 
> ## 2) Make Thunar the system default “file explorer”
> (Do both inode/directory and x-directory, and verify.)
> 
> ```bash
> # see the exact desktop file name (usually thunar.desktop)
> ls /usr/share/applications/*thunar*.desktop
> 
> # set it as default for folders
> xdg-mime default thunar.desktop inode/directory
> xdg-mime default thunar.desktop application/x-directory
> 
> # sanity check
> xdg-mime query default inode/directory
> xdg-mime query default application/x-directory
> ```
> 
> If you prefer **Nemo** instead:
> ```bash
> sudo apt install nemo
> xdg-mime default nemo.desktop inode/directory
> xdg-mime default nemo.desktop application/x-directory
> ```
> 
> ## 3) Force dark mode globally for GTK apps (affects Thunar + file dialogs)
> Ubuntu has Yaru dark; GNOME ≥42 also respects “prefer-dark”.
> 
> ```bash
> # pick the dark variant explicitly
> gsettings set org.gnome.desktop.interface gtk-theme 'Yaru-dark'
> gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
> gsettings set org.gnome.desktop.interface icon-theme 'Yaru'
> 
> # belt & suspenders for non-GNOME sessions
> echo 'export GTK_THEME=Yaru-dark' >> ~/.profile
> ```
> 
> (Logout/login or `source ~/.profile` to apply session env.)
> 
> ## 4) Wire it into i3 so the muscle memory is instant
> Add to `~/.config/i3/config`:
> 
> ```i3
> set $fileman thunar
> bindsym $mod+e exec --no-startup-id $fileman
> ```
> 
> Then:
> ```bash
> i3-msg reload; i3-msg restart
> ```
> 
> ## 5) Optional: dark mode for Qt apps (so **everything** stops blinding you)
> ```bash
> sudo apt install qt5ct qt6ct kvantum kvantum-themes
> printf '%s\n' 'export QT_QPA_PLATFORMTHEME=qt5ct' 'export QT_STYLE_OVERRIDE=kvantum' >> ~/.profile
> ```
> Log out/in, run `qt5ct` and pick a dark theme (or select a Kvantum dark theme in the Kvantum Manager).
> 
> ## 6) Bonus: terminal file manager with Vim keys (for real speed)
> If you want a TUI alongside the GUI:
> 
> **lf (ultra-fast, Vim motions):**
> ```bash
> sudo apt install lf
> ```
> i3 binding:
> ```i3
> bindsym $mod+Shift+e exec --no-startup-id alacritty -e lf
> ```
> 
> (**ranger** is also solid: `sudo apt install ranger`.)
> 
> ## 7) Stop viewers from flashbanging you when opening downloads
> - Images: `sudo apt install imv` (dark background by default).
> - PDFs: `sudo apt install zathura zathura-pdf-poppler` and drop this in `~/.config/zathura/zathurarc`:
>  ```
>  set recolor true
>  set default-bg "#111111"
>  set default-fg "#cfcfcf"
>  ```
> 
> ---
> 
> If you want heavier features (tabs, split views, built-in search, SMB/NFS, trash restore, etc.), use **Nemo**; if you want KDE power tools and don’t mind Qt deps, use **Dolphin** with the Qt dark theming from step 5.
> 
> Does this plan make sense, or do you want me to swap in Nemo/Dolphin and tune their dark themes specifically?
<!-- UID: ee3d384d-2ca1-45a8-b933-cab27f08f12d -->

---




>[!nexus_user] **User** - 08/15/2025 at 11:59 PM
> I always went to pcmanfm... but I forget why, it just had vibes I liked. I think it was the default on freebsd once you finally got it running with a wm.
<!-- UID: 6b65f694-7fad-4f2d-883f-c265485552ba -->




>[!nexus_agent] **Assistant** - 08/15/2025 at 11:59 PM
> pcmanfm’s vibes are real. Let’s put it back at the center and make it stay dark everywhere.
> 
> ## Install pcmanfm + the pieces it expects
> GTK (classic) variant + thumbnails + network mounts + archive integration:
> ```bash
> sudo apt update
> sudo apt install pcmanfm gvfs gvfs-backends gvfs-fuse \
>  tumbler ffmpegthumbnailer file-roller \
>  xdg-desktop-portal xdg-desktop-portal-gtk
> ```
> 
> > Why: `gvfs*` = trash/SMB/SFTP/mtp, `tumbler/ffmpegthumbnailer` = thumbs, `file-roller` = right-click extract, `xdg-*portal*` = lets apps use your defaults (and your dark file chooser) in i3.
> 
> ## Make pcmanfm the default “file explorer” (so Firefox/Obsidian “Show in folder” opens it)
> ```bash
> xdg-mime default pcmanfm.desktop inode/directory
> xdg-mime default pcmanfm.desktop application/x-directory
> xdg-mime query default inode/directory
> ```
> 
> ## Force dark mode for GTK apps + file dialogs
> Ubuntu ships dark themes already:
> ```bash
> # Good Ubuntu default
> gsettings set org.gnome.desktop.interface gtk-theme 'Yaru-dark'
> gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
> gsettings set org.gnome.desktop.interface icon-theme 'Yaru'
> 
> # Belt & suspenders for i3 sessions
> echo 'export GTK_THEME=Yaru-dark' >> ~/.profile
> ```
> Then reload your session (log out/in) or `source ~/.profile` and restart apps.
> 
> > Sanity check portals (these power modern file dialogs):
> ```bash
> systemctl --user status xdg-desktop-portal xdg-desktop-portal-gtk
> # if needed:
> systemctl --user restart xdg-desktop-portal xdg-desktop-portal-gtk
> ```
> 
> ## i3: bind it to muscle memory and keep it lightweight
> ```i3
> # ~/.config/i3/config
> set $fileman pcmanfm
> bindsym $mod+e exec --no-startup-id $fileman
> ```
> Avoid launching pcmanfm with `--desktop` in i3 (you don’t want it managing the background). If some autostart sneaks in:
> ```bash
> rg -n 'pcmanfm.*desktop' ~/.config/autostart || true
> ```
> (delete any match)
> 
> ## “Open Terminal Here” should use your terminal, not xterm
> ```bash
> sudo update-alternatives --config x-terminal-emulator
> ```
> Pick `alacritty` or `kitty`. pcmanfm will use that for “Open in Terminal”.
> 
> ## Optional: you liked the LXQt flavor? Try pcmanfm-qt (Qt dark theming)
> If the *Qt* variant was the vibe you remember:
> ```bash
> sudo apt install pcmanfm-qt kvantum kvantum-themes qt5ct qt6ct
> echo 'export QT_QPA_PLATFORMTHEME=qt5ct' >> ~/.profile
> echo 'export QT_STYLE_OVERRIDE=kvantum' >> ~/.profile
> ```
> Log out/in, run `kvantummanager` and pick a dark theme (e.g., MateriaDark/Dracula); then set fonts/colors in `qt5ct`/`qt6ct`. 
> Switch default if you go this route:
> ```bash
> xdg-mime default pcmanfm-qt.desktop inode/directory
> xdg-mime default pcmanfm-qt.desktop application/x-directory
> ```
> 
> ## Bonus: dark viewers so downloads don’t flashbang you
> - Images: `sudo apt install imv` (dark by default).
> - PDFs: `sudo apt install zathura zathura-pdf-poppler` and in `~/.config/zathura/zathurarc`:
>  ```
>  set recolor true
>  set default-bg "#111111"
>  set default-fg "#cfcfcf"
>  ```
> 
> That’s it. Pick GTK (pcmanfm) for minimal deps and plug-and-play dark dialogs, or go Qt (pcmanfm-qt) if that’s the nostalgia hit. 
> Want me to drop a tiny dotfile snippet to pin pcmanfm’s prefs (hidden files on, list view, no desktop management) so you don’t even touch the GUI?
<!-- UID: dcad3443-be14-4623-b572-acc0283fb161 -->

---


