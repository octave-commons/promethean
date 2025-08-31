---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs snap vs apt"
conversation_id: 68ab14a8-60d0-8322-948f-6d23591e8a9e
create_time: 08/24/2025 at 8:33 AM
update_time: 08/25/2025 at 8:57 AM
---

# Title: Emacs snap vs apt

Created: 08/24/2025 at 8:33 AM
Last Updated: 08/25/2025 at 8:57 AM
Chat URL: https://chat.openai.com/c/68ab14a8-60d0-8322-948f-6d23591e8a9e


>[!nexus_user] **User** - 08/24/2025 at 8:33 AM
> I installed emacs 2 different ways on my computers, through snap, and through apt.
> 
> The apt version of emacs is at 29.3
> The snap version is at 30.2
> 
> The apt version seems to have automaticly set up an emacs server, which I am liking how snappy that makes starting it.
> 
> The snap version didn't do that, but it's newer.
<!-- UID: 4919a36a-7344-45bd-9aa9-fb6e46e7d15e -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:33 AM
> Got it — you’ve got two different Emacs installs: 
> 
> - **apt version (29.3):** comes with a `emacs.service` (systemd user service) enabled by default → starts a background `emacs --daemon`, so `emacsclient` connects instantly. 
> - **snap version (30.2):** is sandboxed, so it doesn’t install a systemd unit or enable a daemon out of the box → you’re always starting full Emacs.
> 
> ---
> 
> ### Why it feels snappier on the apt version
> When the daemon is running, starting Emacs from the terminal/GUI is really just spawning an `emacsclient` frame that attaches to the running process. 
> When no daemon is running (like in the Snap build), Emacs has to initialize everything on each launch.
> 
> ---
> 
> ### Options for the Snap version
> If you want **Emacs 30.2 with the same snappy startup**:
> 
> 1. **Start manually as a daemon**
>  ```bash
>  emacs --daemon
>  emacsclient -c
>  ```
>  (You can kill the server with `emacsclient -e "(kill-emacs)"`.)
> 
> 2. **Enable it as a systemd user service**
>  Create `~/.config/systemd/user/emacs.service`:
>  ```ini
>  [Unit]
>  Description=Emacs text editor daemon
>  Documentation=info:emacs man:emacs(1) https://gnu.org/software/emacs/
> 
>  [Service]
>  Type=forking
>  ExecStart=/snap/bin/emacs --daemon
>  ExecStop=/snap/bin/emacsclient --eval "(kill-emacs)"
>  Restart=on-failure
> 
>  [Install]
>  WantedBy=default.target
>  ```
> 
>  Then:
>  ```bash
>  systemctl --user daemon-reload
>  systemctl --user enable --now emacs
>  ```
> 
> 3. **Check Snap confinement**
>  Snap’s sandboxing sometimes messes with DBus/X11. If you notice issues with `emacsclient` or GUI frames, you may need to install with `--classic`:
>  ```bash
>  sudo snap install emacs --classic
>  ```
> 
> ---
> 
> 👉 So the difference you’re seeing isn’t a version thing — it’s just that the apt package maintainers bundled and enabled the systemd service for you. 
> You can recreate that same setup on the Snap build. 
> 
> Do you want me to write you a **ready-to-drop-in systemd unit file** for the snap build that matches what the apt package does?
<!-- UID: 0bb2e89b-4751-4977-9578-061161324887 -->

---




>[!nexus_user] **User** - 08/24/2025 at 8:38 AM
> Emacs isn't a service on the ubuntu system.
<!-- UID: 3841daa6-4218-4efe-94b7-e88507e4448b -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:38 AM
> Gotcha — if “Emacs isn’t a service” on Ubuntu, it just means the **systemd user units aren’t enabled** (or you’re not looking at user units). Let’s check + fix it cleanly.
> 
> ### 1) Verify what’s running now
> ```bash
> # Check for a running daemon
> ps -ef | grep 'emacs --daemon' | grep -v grep
> 
> # Does a server respond?
> emacsclient -e '(daemonp)'
> emacsclient -e '(server-running-p)'
> 
> # IMPORTANT: systemd *user* scope, not system
> systemctl --user list-unit-files | grep -i emacs
> systemctl --user status emacs.socket emacs.service
> ```
> 
> - If `emacs.socket` exists but is “disabled”, it’s likely the stock apt unit just isn’t enabled yet.
> 
> ### 2) Fast path (apt install): enable socket-activation
> Most Debian/Ubuntu builds ship **user** units `emacs.socket` + `emacs.service`. Socket activation is nice: Emacs only starts when the first `emacsclient` connects.
> 
> ```bash
> systemctl --user enable --now emacs.socket
> # optional: also enable the daemon to always be up
> # systemctl --user enable --now emacs.service
> ```
> 
> Then launch frames with:
> ```bash
> emacsclient -c
> ```
> 
> > If `emacs.socket` / `emacs.service` don’t show up at all, your apt package variant may not include them. Jump to **(4) Manual unit**.
> 
> ### 3) Make `emacsclient` your launcher (snappy starts)
> - Terminal: `alias e='emacsclient -c'` (add to your shell rc)
> - GUI: point your desktop launcher to `emacsclient -c -a ""`
>  - The `-a ""` tells it to start full Emacs if no server is running.
> 
> ### 4) Manual unit (works for either apt or Snap)
> If no units exist (or for Snap’s `/snap/bin/emacs`), create a **user** unit:
> 
> `~/.config/systemd/user/emacs.service`
> ```ini
> [Unit]
> Description=Emacs daemon
> Documentation=info:emacs man:emacs(1) https://gnu.org/software/emacs/
> 
> [Service]
> Type=forking
> ExecStart=/usr/bin/emacs --daemon
> ExecStop=/usr/bin/emacsclient --eval "(kill-emacs)"
> Restart=on-failure
> 
> [Install]
> WantedBy=default.target
> ```
> 
> For **Snap**, change the paths to `/snap/bin/emacs` and `/snap/bin/emacsclient` (and make sure you installed with `--classic` to avoid confinement headaches opening files outside $HOME):
> 
> ```bash
> sudo snap install emacs --classic
> # then use /snap/bin paths in the unit file
> ```
> 
> Enable it:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now emacs
> ```
> 
> ### 5) Optional: start server from your init
> Whether or not you use systemd, you can ensure a server is available by adding to your `init.el`:
> ```elisp
> (require 'server)
> (unless (server-running-p) (server-start))
> ```
> (Still use `emacsclient -c` for instant frames.)
> 
> ---
> 
> **TL;DR** 
> - Use `systemctl --user …` (not system-wide) to check/enable `emacs.socket` for the apt build. 
> - If it’s missing, or for the Snap build, drop in the user service above (with proper paths) and enable it. 
> - Launch Emacs via `emacsclient -c` for the same snappy feel on both machines.
<!-- UID: 7b39abd2-153c-4ba1-9052-646634010950 -->

---




>[!nexus_user] **User** - 08/24/2025 at 8:46 AM
> I am doin the thing where I'm digging into how something I already have working (cause "magic") is set up so I understand it. There seems to be a user service, but it appears to be disabled, but there is an emacs --daemon instance running when I check ps
> 
> ```
> direnv: loading ~/.envrc
> direnv: export +GITHUB_TOKEN
> 08:38:39 err@err-Stealth-16-AI-Studio-A1VGG ~ → # Check for a running daemon
> ps -ef | grep 'emacs --daemon' | grep -v grep
> 
> # Does a server respond?
> emacsclient -e '(daemonp)'
> emacsclient -e '(server-running-p)'
> 
> # IMPORTANT: systemd *user* scope, not system
> systemctl --user list-unit-files | grep -i emacs
> systemctl --user status emacs.socket emacs.service
> err 737183 1 0 08:21 ? 00:00:00 /usr/bin/emacs --daemon=server --restart-emacs-desktop /tmp/restart-emacs-desktop5llmBM
> err 737184 737183 0 08:21 ? 00:00:05 /usr/bin/emacs --daemon=server --restart-emacs-desktop /tmp/restart-emacs-desktop5llmBM
> emacsclient: can't find socket; have you started the server?
> emacsclient: To start the server in Emacs, type "M-x server-start".
> emacsclient: No socket or alternate editor. Please use:
> 
> 	--socket-name
> 	--server-file (or environment variable EMACS_SERVER_FILE)
> 	--alternate-editor (or environment variable ALTERNATE_EDITOR)
> emacsclient: can't find socket; have you started the server?
> emacsclient: To start the server in Emacs, type "M-x server-start".
> emacsclient: No socket or alternate editor. Please use:
> 
> 	--socket-name
> 	--server-file (or environment variable EMACS_SERVER_FILE)
> 	--alternate-editor (or environment variable ALTERNATE_EDITOR)
> emacs.service disabled enabled
> Unit emacs.socket could not be found.
> ○ emacs.service - Emacs text editor
>  Loaded: loaded (/usr/lib/systemd/user/emacs.service; disabled; preset: enabled)
>  Active: inactive (dead)
>  Docs: info:emacs
>  man:emacs(1)
>  https://gnu.org/software/emacs/
> 08:38:41 err@err-Stealth-16-AI-Studio-A1VGG ~ → systemctl --user status emacs
> ○ emacs.service - Emacs text editor
>  Loaded: loaded (/usr/lib/systemd/user/emacs.service; disabled; preset: enabled)
>  Active: inactive (dead)
>  Docs: info:emacs
>  man:emacs(1)
>  https://gnu.org/software/emacs/
> 08:39:13 err@err-Stealth-16-AI-Studio-A1VGG ~ → systemctl --user status emacs
> ○ emacs.service - Emacs text editor
>  Loaded: loaded (/usr/lib/systemd/user/emacs.service; disabled; preset: enabled)
>  Active: inactive (dead)
>  Docs: info:emacs
>  man:emacs(1)
>  https://gnu.org/software/emacs/
> 08:39:28 err@err-Stealth-16-AI-Studio-A1VGG ~ → systemctl --user status emacs
> ○ emacs.service - Emacs text editor
>  Loaded: loaded (/usr/lib/systemd/user/emacs.service; disabled; preset: enabled)
>  Active: inactive (dead)
>  Docs: info:emacs
>  man:emacs(1)
>  https://gnu.org/software/emacs/
> 08:39:33 err@err-Stealth-16-AI-Studio-A1VGG ~ → ps -ef | grep 'emacs --damon' | grep -v grep
> 08:39:54 err@err-Stealth-16-AI-Studio-A1VGG ~ → ps -ef | grep 'emacs --damon'
> err 775413 772552 0 08:39 pts/3 00:00:00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git -08:39:57 err@err-Stealth-16-AI-Studio-A1VGG ~ →
> ```
<!-- UID: 02f4edfe-4793-4289-9d9d-8ecedd29723b -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 8:46 AM
> Nice sleuthing. You’ve basically uncovered this:
> 
> - A **daemon *is* running** (`/usr/bin/emacs --daemon=server …`).
> - The **systemd user unit is disabled**, so systemd isn’t what started it.
> - `emacsclient` can’t find the socket → your shell is looking in the wrong place (or the daemon wrote the socket somewhere else / with a different env).
> 
> That `--restart-emacs-desktop /tmp/restart-emacs-desktop…` arg is a Debian/Ubuntu helper used during package upgrades/desktop restarts. So the daemon was likely launched by that helper (or an XDG autostart), not by systemd. Hence: “service disabled” but daemon running.
> 
> ### Find where the socket actually is
> Run these and use whichever hit you get:
> 
> ```bash
> # See daemon’s environment (helps explain path differences)
> tr '\0' '\n' </proc/737184/environ | egrep 'HOME|USER|XDG_RUNTIME_DIR|DISPLAY|DBUS.*'
> 
> # Common socket locations:
> find /run/user/$(id -u) -maxdepth 2 -type s -name server -print 2>/dev/null
> find "$HOME/.emacs.d/server" -maxdepth 1 -type s -name server -print 2>/dev/null
> ```
> 
> Then try connecting explicitly (replace PATH with what you found):
> 
> ```bash
> emacsclient -s /run/user/$(id -u)/emacs/server -e '(daemonp)'
> # or
> emacsclient -s "$HOME/.emacs.d/server/server" -e '(daemonp)'
> ```
> 
> If that works, set a convenience alias:
> 
> ```bash
> alias e='emacsclient -c -s /run/user/$(id -u)/emacs/server'
> ```
> 
> ### If there’s no socket (rare)
> It means the daemon started but the server didn’t. You can force it next launch by putting this in your `init.el`:
> 
> ```elisp
> (require 'server)
> (unless (server-running-p) (server-start))
> ```
> 
> ### Make it predictable going forward (optional)
> Pick one of these so you always know what’s starting the daemon and where the socket lives:
> 
> **A) Use systemd user unit (socket-activation nice to have):**
> ```bash
> # If you have emacs.socket on your distro:
> systemctl --user enable --now emacs.socket
> # (or enable the service directly)
> # systemctl --user enable --now emacs.service
> ```
> 
> **B) DIY user unit (if socket unit missing):** 
> `~/.config/systemd/user/emacs.service`
> ```ini
> [Unit]
> Description=Emacs daemon
> Documentation=info:emacs man:emacs(1) https://gnu.org/software/emacs/
> 
> [Service]
> Type=forking
> ExecStart=/usr/bin/emacs --daemon
> ExecStop=/usr/bin/emacsclient --eval "(kill-emacs)"
> Restart=on-failure
> 
> [Install]
> WantedBy=default.target
> ```
> Enable it:
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now emacs
> ```
> 
> **C) No systemd at all:** just start it from your login shell:
> ```bash
> # in ~/.profile or ~/.bash_profile
> pgrep -u "$USER" -x emacs >/dev/null || emacs --daemon
> ```
> 
> ---
> 
> **Why `emacsclient` failed** in your session: it defaults to searching `$XDG_RUNTIME_DIR/emacs/server` and `~/.emacs.d/server/server`. Your daemon likely wrote the socket to one of those *with a different `XDG_RUNTIME_DIR`/HOME at launch time*, so your shell didn’t see it until you point `-s` at the actual path.
> 
> If you paste the output of the `find … -type s -name server` lines, I’ll wire the exact `emacsclient` command/alias for you.
<!-- UID: dca91ef1-0546-4230-b4ca-33aa46862bbb -->

---




>[!nexus_user] **User** - 08/24/2025 at 9:01 AM
> there seems to be a dead .desktop file for emacs (client) on the machine I installed it through snap. Even after I started a daemon, it wouldn't work
<!-- UID: 9c7e7cd1-13ca-4da6-b3a7-41adfbc27b57 -->




>[!nexus_agent] **Assistant** - 08/24/2025 at 9:01 AM
> Yeah, that makes sense — Snap and apt builds ship different **desktop entries** (`.desktop` files in `/usr/share/applications/` or `$HOME/.local/share/applications/`), and the Snap one often assumes you’ll just run `emacs` directly. The “Emacs (client)” entry you’re seeing is probably pointing at `emacsclient` without a socket guaranteed to exist → so it just fails.
> 
> ---
> 
> ### What’s going on
> - **apt build**: Debian maintainers ship `emacsclient.desktop` that knows about the systemd socket/daemon arrangement → works.
> - **snap build**: ships only a generic desktop file that launches `/snap/bin/emacsclient` without setting `--alternate-editor` or socket path. If the daemon isn’t up or the socket’s not where it expects, it bombs.
> - Snap confinement makes this worse: sometimes `$XDG_RUNTIME_DIR/emacs/server` isn’t visible to the client inside the snap.
> 
> ---
> 
> ### How to fix
> 1. **Check the bad file**
>  ```bash
>  grep Exec /var/lib/snapd/desktop/applications/emacs*.desktop
>  grep Exec ~/.local/share/applications/emacs*.desktop
>  ```
>  You’ll probably see something like:
>  ```
>  Exec=emacsclient -c %F
>  ```
>  with no `-a ""` or socket path.
> 
> 2. **Create a working override**
>  Copy it to your local applications dir and fix it:
>  ```bash
>  mkdir -p ~/.local/share/applications
>  cp /var/lib/snapd/desktop/applications/emacs*.desktop ~/.local/share/applications/emacsclient.desktop
>  ```
>  Edit `~/.local/share/applications/emacsclient.desktop`:
>  ```ini
>  [Desktop Entry]
>  Name=Emacs (Client)
>  Comment=Edit text with an existing Emacs server
>  Exec=/snap/bin/emacsclient -c -a "" %F
>  Icon=emacs
>  Type=Application
>  Terminal=false
>  Categories=Utility;TextEditor;
>  ```
>  - `-a ""` ensures it will fall back to full Emacs if no server.
>  - You can add `-s /path/to/socket` if your snap daemon uses a non-standard location.
> 
>  Then refresh desktop cache:
>  ```bash
>  update-desktop-database ~/.local/share/applications
>  ```
> 
> 3. **Optional: wrap the snap client**
>  If the confinement prevents `emacsclient` from seeing your server socket, you can:
>  - Install snap with `--classic`:
>  ```bash
>  sudo snap remove emacs
>  sudo snap install emacs --classic
>  ```
>  - Or symlink `/snap/bin/emacsclient` to a wrapper script that forces `-s ~/.emacs.d/server/server`.
> 
> ---
> 
> 👉 The TL;DR: 
> That “dead” `.desktop` entry isn’t really broken, it’s just too dumb for the Snap setup. Copy it to `~/.local/share/applications/`, add `-a ""`, and point it at the right socket (or use `--classic` snap). After that, launching “Emacs (client)” from your desktop menu will actually attach to your daemon.
> 
> ---
> 
> Want me to sketch you a wrapper script (`~/bin/emacsclient`) that always “just works” no matter whether the daemon is running or not? That way both terminal and desktop entry can rely on it.
<!-- UID: 3dc5aaa9-4c96-4f4f-8621-54dc2f2ceabb -->

---


