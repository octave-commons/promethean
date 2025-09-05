---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Service restart issue"
conversation_id: 68aa926c-2888-8331-a5c9-b1036872a001
create_time: 08/23/2025 at 11:17 PM
update_time: 08/23/2025 at 11:24 PM
---

# Title: Service restart issue

Created: 08/23/2025 at 11:17 PM
Last Updated: 08/23/2025 at 11:24 PM
Chat URL: https://chat.openai.com/c/68aa926c-2888-8331-a5c9-b1036872a001


>[!nexus_user] **User** - 08/23/2025 at 11:17 PM
> This service def needs to be restarted every time I boot my computer up:
> [Unit]
> Description=Promethean Reverse Proxy
> After=network.target
> 
> [Service]
> ExecStart=tailscale funnel 3210
> Restart=always
> User=root
> Group=root
> 
> # Hardening
> NoNewPrivileges=true
> PrivateTmp=true
> 
> [Install]
> WantedBy=multi-user.target
<!-- UID: 2aec17b4-8a71-4ca0-9645-cbd6c683daa7 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 11:17 PM
> Got it — looks like you’ve written a proper `systemd` unit for your reverse proxy, but it’s not starting automatically after boot. A couple small tweaks will make sure it comes up cleanly: 
> 
> ### 1. Save the unit file
> Put it in:
> 
> ```bash
> /etc/systemd/system/promethean-proxy.service
> ```
> 
> ### 2. Reload `systemd`
> ```bash
> sudo systemctl daemon-reload
> ```
> 
> ### 3. Enable the service at boot
> ```bash
> sudo systemctl enable promethean-proxy.service
> ```
> 
> That creates the sym so it runs after each boot.
> 
> ### 4. Start it now
> ```bash
> sudo systemctl start promethean-proxy.service
> ```
> 
> ---
> 
> ### Notes / Fixes
> - **`tailscale funnel`** requires that Tailscale is already connected. To avoid race conditions, you might want:
> 
> ```ini
> After=network.target tailscaled.service
> Requires=tailscaled.service
> ```
> 
> This ensures the Tailscale daemon is up before your proxy runs.
> 
> - If it must run as root for funnel binding, your `User=root` is fine. Otherwise you could make a dedicated system user. 
> 
> - Check logs with:
> ```bash
> journalctl -u promethean-proxy -f
> ```
> 
> ---
> 
> Want me to harden this unit further (sandboxing, `ProtectSystem=`, `AmbientCapabilities=`, etc.) or just keep it simple and focused on reliable auto-start?
<!-- UID: 0c29367d-7360-4779-95ef-55a65ccd7904 -->

---




>[!nexus_user] **User** - 08/23/2025 at 11:22 PM
> I had to run sudo as my user to run it so, I assumed it needed to be root
<!-- UID: b21edd1f-381d-44c0-aa35-330c7eb7bbb2 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 11:22 PM
> That makes sense — but it might not actually need to run as **root** full-time. 
> 
> Here’s the breakdown:
> 
> - `tailscaled` (the daemon) already requires root (it binds TUN, manages routes, firewall, etc). 
> - `tailscale funnel` is just a **client command** talking to the daemon. It only needs root if the CLI is trying to configure something the daemon won’t accept from a normal user.
> 
> Usually: 
> ```bash
> tailscale funnel 3210
> ```
> will fail for a normal user unless that user is in the `tailscale` group (on most distros `tailscale` installs a group like `tailscale` or `netdev`). 
> 
> So you may be able to run your systemd unit as a **normal user** (or a dedicated service account) if you: 
> ```bash
> sudo usermod -aG tailscale yourusername
> ```
> 
> Then log out/in. After that, try:
> ```bash
> tailscale funnel 3210
> ```
> without `sudo`. If it works, you can safely set your systemd unit to:
> 
> ```ini
> User=yourusername
> Group=yourusername
> ```
> 
> and drop `root`. 
> 
> ---
> 
> ⚡ If it **still refuses without sudo**, then yes, you’ll have to keep `User=root`. In that case, you can harden it with systemd options like:
> 
> ```ini
> CapabilityBoundingSet=CAP_NET_BIND_SERVICE
> ProtectSystem=full
> ProtectHome=true
> ```
> 
> ---
> 
> 👉 Do you want me to tune this service file toward **least-privilege (non-root if possible)**, or toward **secure root hardening** since you know it works that way?
<!-- UID: f433d4e2-59fb-4496-bce9-3050d8068f92 -->

---




>[!nexus_user] **User** - 08/23/2025 at 11:23 PM
> There is no tailscale group
<!-- UID: 1c3342ad-3959-4694-8d02-6437407b2265 -->




>[!nexus_agent] **Assistant** - 08/23/2025 at 11:23 PM
> Right—many distros don’t create a `tailscale` group. The supported way to let a *non‑root* user run `tailscale` subcommands (like `funnel`) is to make them an **operator**.
> 
> ## Option A — Run as your user (least‑privilege)
> 
> 1. Grant yourself operator rights (one‑time):
>  ```bash
>  # If tailscale is already up:
>  sudo tailscale set --operator=$USER
> 
>  # If it's not up yet (or older versions):
>  sudo tailscale up --operator=$USER
>  ```
>  Log out/in once to be safe.
> 
> 2. Use this unit (replace `youruser`):
>  ```ini
>  [Unit]
>  Description=Promethean Reverse Proxy (tailscale funnel)
>  After=network-online.target tailscaled.service
>  Wants=network-online.target
>  Requires=tailscaled.service
> 
>  [Service]
>  Type=simple
>  User=youruser
>  Group=youruser
>  ExecStart=/usr/bin/tailscale funnel 3210
>  Restart=always
>  RestartSec=3
> 
>  # Hardening (safe for a non-root CLI client)
>  NoNewPrivileges=true
>  PrivateTmp=true
>  ProtectSystem=full
>  ProtectHome=true
>  ProtectKernelTunables=true
>  ProtectKernelModules=true
>  ProtectControlGroups=true
>  RestrictSUIDSGID=true
>  RestrictNamespaces=true
>  LockPersonality=true
>  SystemCallFilter=@system-service
> 
>  [Install]
>  WantedBy=multi-user.target
>  ```
> 
> 3. Reload + enable + start:
>  ```bash
>  sudo systemctl daemon-reload
>  sudo systemctl enable promethean-proxy.service
>  sudo systemctl start promethean-proxy.service
>  ```
> 
> If this works, you’re done—no root required.
> 
> ---
> 
> ## Option B — Keep it as root (but locked down)
> 
> If `funnel` still refuses to run as your user (e.g., older Tailscale or policy), keep `User=root` and add strict hardening:
> 
> ```ini
> [Unit]
> Description=Promethean Reverse Proxy (tailscale funnel)
> After=network-online.target tailscaled.service
> Wants=network-online.target
> Requires=tailscaled.service
> 
> [Service]
> Type=simple
> User=root
> Group=root
> ExecStart=/usr/bin/tailscale funnel 3210
> Restart=always
> RestartSec=3
> 
> # Hardening (root)
> NoNewPrivileges=true
> PrivateTmp=true
> ProtectSystem=strict
> ProtectHome=true
> ProtectKernelTunables=true
> ProtectKernelModules=true
> ProtectControlGroups=true
> RestrictSUIDSGID=true
> RestrictNamespaces=true
> LockPersonality=true
> SystemCallFilter=@system-service
> # Only keep caps if you truly need them; funnel normally doesn’t:
> CapabilityBoundingSet=
> AmbientCapabilities=
> 
> [Install]
> WantedBy=multi-user.target
> ```
> 
> ---
> 
> ## Quick sanity checks
> 
> - Tailscale daemon is up:
>  ```bash
>  systemctl status tailscaled
>  tailscale status
>  ```
> - Funnel is allowed for the device/domain in your Tailscale admin console.
> - Logs if anything fails:
>  ```bash
>  journalctl -u promethean-proxy -f
>  ```
> 
> If you want, tell me which option you prefer and your Linux distro, and I’ll tailor the unit exactly (paths, system call filter set, etc.).
<!-- UID: 83345f8d-4ecf-41d9-ba16-a3c155a748c3 -->

---


