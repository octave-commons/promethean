---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Unix folder breakdown"
conversation_id: 68b32ead-ac20-8326-84d2-b413eac1fa40
create_time: 08/30/2025 at 12:02 PM
update_time: 08/31/2025 at 8:10 AM
---

# Title: Unix folder breakdown

Created: 08/30/2025 at 12:02 PM
Last Updated: 08/31/2025 at 8:10 AM
Chat URL: https://chat.openai.com/c/68b32ead-ac20-8326-84d2-b413eac1fa40


>[!nexus_user] **User** - 08/30/2025 at 12:02 PM
> Breakdown the top level folders common in unix like systems.
<!-- UID: 2d88b553-c21c-4fff-8d57-a4db59125bb6 -->




>[!nexus_agent] **Assistant** - 08/30/2025 at 12:02 PM
> Here’s the no-nonsense map of “/” on Unix-likes (Linux focus, with notes for BSD/macOS). Use this to decide where things belong, what to back up, and what not to touch.
> 
> # Root (/) at a glance
> 
> - **/** — the root of the filesystem. Everything lives under here, even other disks once mounted.
> - **/bin** → **/usr/bin** (often a symlink): essential user commands needed for single-user/early boot (e.g., `sh`, `cp`, `mv`). 
> - **/sbin** → **/usr/sbin** (often a symlink): essential system/administration binaries (`ip`, `mount`, `fsck`).
> - **/usr/**: “read-mostly” OS and app payloads installed by your distro or package manager. 
>  - **/usr/bin**, **/usr/sbin**: the real home of most executables on modern systems. 
>  - **/usr/lib**, **/usr/lib64**: shared libraries, kernel modules under **/usr/lib/modules** (varies by distro). 
>  - **/usr/share**: architecture-independent data (man pages, locales, icons). 
>  - **/usr/local/**: stuff you installed manually for this machine (source builds, custom scripts). Package managers should **not** own this.
> - **/etc/**: host-specific configuration (text files). If it configures the system or a service, it likely belongs here.
> - **/var/**: “variable” data that changes at runtime. 
>  - **/var/log**: logs. 
>  - **/var/lib**: state databases (dpkg/rpm metadata, service state). 
>  - **/var/cache**: caches (safe to prune with care). 
>  - **/var/spool**: queued jobs (print/mail), **/var/tmp**: temp that may persist across reboots.
> - **/home/**: user home directories. Your stuff goes here. 
> - **/root/**: root’s home directory (not the same as `/`). Keep it lean.
> - **/tmp/**: temporary files; purged on reboot on many systems (or by timers). Don’t rely on it for persistence.
> - **/run/** (tmpfs): volatile runtime state since early boot (PID files, sockets). Recreated on every boot.
> - **/dev/** (udev): device nodes; dynamic. Don’t hand-edit.
> - **/proc/** (procfs): live kernel/process info (virtual). Treat as read-only unless you know what you’re doing. 
> - **/sys/** (sysfs): kernel device and driver knobs (virtual). Powerful; easy to shoot yourself in the foot.
> - **/boot/**: bootloader and kernel images (`vmlinuz`, `initrd`). Often its own partition. Keep it tidy or updates fail.
> - **/lib**, **/lib64** → **/usr/lib*** (often sym): historical locations kept for compatibility.
> - **/opt/**: third-party, self-contained software (vendor trees) that doesn’t fit the distro’s layout.
> - **/srv/**: data served by this system (web/ftp/db content) that’s not just app binaries (underused but clean).
> - **/media/**: automatic mount points for removable media (`/media/$USER/...`). 
> - **/mnt/**: temporary/manual mount points when you’re testing/attaching other filesystems.
> - **/lost+found/**: created by ext* filesystems for fsck recovery; you’ll see it at a partition root, not necessarily at `/`.
> - Distro extras: 
>  - **/snap/** (Ubuntu), **/var/lib/flatpak** (Flatpak), **/var/lib/docker** (Docker). 
>  - systemd units typically in **/usr/lib/systemd/system**; local overrides in **/etc/systemd/system**.
> 
> macOS quick map (since it’s “Unix-like”): **/System**, **/Library**, **/usr**, **/bin**, **/sbin**, **/Applications**, **/Users** (homes), **/Volumes** (mounts). Homebrew uses **/usr/local** (Intel) or **/opt/homebrew** (Apple Silicon).
> 
> BSD quick map: similar to Linux, but packaging and defaults differ; you’ll see **/usr/local** heavily used for ports/packages.
> 
> ---
> 
> ## What goes where (rules of thumb)
> 
> - **Configs** → `/etc` (and per-user config in `$HOME/.config/...`). 
> - **Vendor/distro binaries** → `/usr/bin`, `/usr/sbin`; **libraries** → `/usr/lib*`. 
> - **Your manual installs** → `/usr/local` (binaries in `/usr/local/bin`, libs in `/usr/local/lib`, configs in `/usr/local/etc`). 
> - **Service data** (persistent, served) → `/srv` (or app-specific under `/var/lib/<service>` if that’s how the distro packages it). 
> - **Logs/state/caches** → `/var/log`, `/var/lib`, `/var/cache`. 
> - **Temporary** → `/tmp` (short-lived), `/var/tmp` (longer-lived), `/run` (volatile boot-time).
> 
> Opinionated take: if you’re scripting or deploying your own software, prefer `/usr/local` for the code and `/var/lib/<app>` for mutable state. Reserve `/opt` for big vendor bundles that expect to live together.
> 
> ---
> 
> ## Backup + cleanup cheat sheet
> 
> | Path | Persists reboot | Back up? | Safe to clean? (with care) |
> |--- |--- |--- |--- |
> | `/home` | Yes | **Yes** (user data) | No |
> | `/etc` | Yes | **Yes** (configs & secrets) | No |
> | `/usr` | Yes | Optional (reinstallable via packages) | No |
> | `/usr/local` | Yes | **Yes** (your custom installs) | No |
> | `/var/log` | Yes | Maybe (for audit/compliance) | Yes (logrotate/journalctl vacuum) |
> | `/var/cache` | Yes | No | Yes (package caches, thumbnails, etc.) |
> | `/var/lib` | Yes | **Yes** (service state/dbs) | No |
> | `/boot` | Yes | Optional | Only old kernels (via package tools) |
> | `/tmp` | Often No | No | Yes (it’s temp) |
> | `/var/tmp` | Yes | No | Yes (older files) |
> | `/run` | No | No | N/A (volatile) |
> 
> ---
> 
> ## Modern quirks you should know
> 
> - **usr-merge**: Many distros made `/bin`, `/sbin`, `/lib*` sym into `/usr/*`. Don’t fight this; place things in `/usr/*` or `/usr/local/*`. 
> - **systemd runtime**: `/run` replaces old `/var/run`; unit files live under `/usr/lib/systemd/system` (vendor) with overrides in `/etc/systemd/system`. 
> - **Containers & sandboxed apps**: expect extra top-level dirs (`/snap`, `/var/lib/flatpak`, `/var/lib/docker`) and per-app mount namespaces. 
> - **/media vs /mnt**: `/media` is for **auto**-mounts; `/mnt` is your scratch pad for manual mounts. Don’t mix them.
> 
> ---
> 
> ## Common foot-guns (avoid these)
> 
> - Purging `/var/lib/<pkg manager>` or `/var/lib/*` blindly → bricks your package db or services. 
> - Manually dropping files into `/usr/bin` that aren’t owned by a package → future upgrades clobber them. Use `/usr/local/bin`. 
> - Assuming `/tmp` persists → it often doesn’t. Use `/var/tmp` for longer-lived scratch. 
> - Filling `/boot` with old kernels → leave cleanup to your package manager (`apt autoremove`, `dnf remove` old kernels). 
> - Editing files in `/proc` or `/sys` without knowing the kernel tunable → you can destabilize the box.
> 
> ---
> 
> ## Quick commands to inspect reality (safe)
> 
> - Disk usage by top-level dirs (one filesystem): 
>  `sudo du -xhd1 /`
> - Mounted filesystems (pretty): 
>  `findmnt -t notmpfs` or `lsblk -f`
> - Who owns a file (package): 
>  Debian/Ubuntu: `dpkg -S /path/to/file` • RPM: `rpm -qf /path/to/file`
> - Where a command actually lives: 
>  `type -a <cmd>` or `command -v <cmd>`
> 
> If you want, I can generate a “starter policy” for your own services (where to put code, state, logs, and unit files) that fits your current distro and tooling. No fluff—just paths and rationale.
> 
> #linux #unix #filesystem #fhs #devops #cheatsheet
<!-- UID: 08089b66-7394-4b19-a8b5-ea2b11a15059 -->

---


