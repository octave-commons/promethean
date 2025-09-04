---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Check disk size bash"
conversation_id: 68af3362-cb2c-8331-8b6c-890406e61dbf
create_time: 08/27/2025 at 11:33 AM
update_time: 08/27/2025 at 12:08 PM
---

# Title: Check disk size bash

Created: 08/27/2025 at 11:33 AM
Last Updated: 08/27/2025 at 12:08 PM
Chat URL: https://chat.openai.com/c/68af3362-cb2c-8331-8b6c-890406e61dbf


>[!nexus_user] **User** - 08/27/2025 at 11:33 AM
> how do I get the currently available disk size from bash
<!-- UID: 8b93846c-bce2-4e6d-a4cb-84fa73191a0b -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:33 AM
> In bash you can check the available disk space with `df`. For example:
> 
> ```bash
> df -h /
> ```
> 
> - `-h` makes the output human-readable (GB, MB, etc.).
> - `/` is the mount point (root filesystem). You can change it to another path if you want the disk that contains that path.
> 
> If you want just the *available* size (no headers, just the number):
> 
> ```bash
> df -h --output=avail / | tail -n 1
> ```
> 
> That will return something like:
> 
> ```
> 120G
> ```
> 
> If you want it in bytes (no suffixes):
> 
> ```bash
> df --output=avail / | tail -n 1
> ```
> 
> That prints the available space in 1K blocks. To convert to bytes:
> 
> ```bash
> df --output=avail -B1 / | tail -n 1
> ```
> 
> ---
> 
> Do you want the result as a **plain number you can use in a script**, or human-readable for display?
<!-- UID: 7c810f54-aaeb-45bc-8d07-53159ecc36b7 -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:34 AM
> I just installed ubuntu on a laptop, and it can't start any wm/dm. It just freezes after I login. I have plenty of diskspace.
<!-- UID: ce5f1c6d-bf13-4374-98d4-d297d97ed47b -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:34 AM
> Got it. Fresh Ubuntu install, login works, but when you try to start any **window manager / desktop manager** it freezes. That usually means your issue isn’t disk space but something lower level: GPU drivers, display manager misconfiguration, or a missing package. Let’s break it down. 
> 
> ---
> 
> ## 1. Check the logs
> After it freezes, switch to a TTY (Ctrl+Alt+F3 for example), log in, and check:
> 
> ```bash
> journalctl -xe
> ```
> 
> or specifically for graphics/login manager:
> 
> ```bash
> journalctl -u gdm
> journalctl -u lightdm
> journalctl -b | grep -iE "nvidia|amdgpu|intel|gdm|lightdm"
> ```
> 
> That’ll tell you what’s failing.
> 
> ---
> 
> ## 2. Figure out your GPU
> Run:
> 
> ```bash
> lspci | grep -E "VGA|3D"
> ```
> 
> - If it says **NVIDIA**, you probably need proprietary drivers (`sudo ubuntu-drivers autoinstall`).
> - If it says **Intel Arc**, you’ll need Intel’s drivers (Ubuntu’s defaults can lag).
> - If it’s **AMD**, normally it should work with `amdgpu` out of the box, unless you’re on brand-new hardware.
> 
> ---
> 
> ## 3. Check Xorg vs Wayland
> Ubuntu defaults to **Wayland** with GNOME. Some drivers don’t play nice. You can try forcing Xorg:
> 
> Edit `/etc/gdm3/custom.conf` and uncomment:
> 
> ```ini
> WaylandEnable=false
> ```
> 
> Then reboot.
> 
> ---
> 
> ## 4. Make sure a desktop is actually installed
> Sometimes the installer gives you a bare minimum system. See what’s there:
> 
> ```bash
> dpkg -l ubuntu-desktop
> ```
> 
> If missing, install:
> 
> ```bash
> sudo apt update
> sudo apt install ubuntu-desktop
> ```
> 
> Or a lighter one if hardware is weak:
> 
> ```bash
> sudo apt install xubuntu-desktop
> ```
> 
> ---
> 
> ## 5. Try booting with safe graphics
> At the GRUB menu, edit the boot line and add:
> 
> ```
> nomodeset
> ```
> 
> That disables fancy GPU modes until you sort out drivers.
> 
> ---
> 
> 👉 My bet: since you say *“plenty of disk space”* and it just freezes after login, it’s either **GPU driver mismatch** or **Wayland vs Xorg issue**. 
> 
> Do you know what GPU this laptop has? That’ll narrow it down.
<!-- UID: 2e65e33c-8acf-4ed4-a6b3-5a07765175e0 -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:37 AM
> I tried i3, and gnome on both xorg and wayland. I have an intel alderlake gpu
<!-- UID: f8d134a5-d3f0-4d01-a31c-568311f984eb -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:37 AM
> Ah, Alder Lake iGPU explains it. That’s Intel **Xe graphics (Gen12)**, and support on Ubuntu can be flaky unless you’ve got recent kernel + Mesa. Out of the box, Ubuntu LTS often ships an older stack that just… freezes exactly like you’re describing. 
> 
> ---
> 
> ## Why it’s freezing
> - GNOME/i3 are trying to initialize graphics using **i915** driver. 
> - Your kernel/Mesa might not fully support Alder Lake without updates. 
> - The login succeeds (text mode fine), but Xorg/Wayland can’t bring up the GPU context → hard freeze. 
> 
> ---
> 
> ## 1. Check your kernel & Mesa versions
> From a TTY (Ctrl+Alt+F3):
> 
> ```bash
> uname -r
> mesa --version
> ```
> 
> - You want kernel **5.19+** (better: 6.2 or newer). 
> - Mesa **22.x or newer** for proper Alder Lake support. 
> 
> If Ubuntu gave you something like `5.15` + Mesa `21.x`, that’s your culprit. 
> 
> ---
> 
> ## 2. Update graphics stack
> Install Intel’s **graphics drivers PPA**:
> 
> ```bash
> sudo add-apt-repository ppa:oibaf/graphics-drivers
> sudo apt update && sudo apt upgrade -y
> ```
> 
> That’ll give you the latest Mesa. 
> 
> If kernel is too old, you may also want HWE (Hardware Enablement) stack:
> 
> ```bash
> sudo apt install --install-recommends linux-generic-hwe-22.04
> ```
> 
> (or `linux-generic-hwe-24.04` depending on Ubuntu version). 
> 
> ---
> 
> ## 3. Force modesetting driver (workaround)
> If you just want it to boot while you fix drivers, edit `/etc/default/grub` and change:
> 
> ```
> GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
> ```
> 
> to:
> 
> ```
> GRUB_CMDLINE_LINUX_DEFAULT="quiet splash i915.force_probe=*"
> ```
> 
> Then:
> 
> ```bash
> sudo update-grub
> ```
> 
> and reboot. This tells the kernel “yes, I know what I’m doing, enable i915 for Alder Lake.” 
> 
> ---
> 
> ## 4. Test with a lightweight WM
> Once updated, try starting X with something simple:
> 
> ```bash
> startx i3
> ```
> 
> That bypasses gdm/wayland, so you can confirm if Xorg + i915 works. 
> 
> ---
> 
> ### TL;DR
> Your Alder Lake GPU needs **newer kernel + Mesa** than stock Ubuntu has. 
> - Add **oibaf PPA** for Mesa. 
> - Install **HWE kernel**. 
> - If desperate, boot with `i915.force_probe=*` until drivers are sorted. 
> 
> ---
> 
> Want me to give you the exact set of commands for **Ubuntu 22.04 vs 24.04**, since the packages differ a bit?
<!-- UID: 35cbcaf8-6c5d-483b-b889-9ca289a62071 -->

---




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:41 AM
> Thanks for the photo — that’s really helpful. 
> 
> What you’re seeing there is **not actually the GPU** failing, but your **Wi-Fi driver** spamming the kernel log. Specifically:
> 
> ```
> rtw_8821ce 0000:01:00.0: failed to leave ips state
> rtw_8821ce 0000:01:00.0: mac power on failed
> rtw_8821ce 0000:01:00.0: failed to send h2c command
> ```
> 
> That’s the **Realtek RTL8821CE wireless card**. The in-kernel `rtw88` driver for that chipset is notorious for being unstable, especially on newer kernels and laptops. It floods the logs with errors, which can make it *look* like the system is hard freezing (sometimes it really does hang networking).
> 
> ---
> 
> ## Why this matters
> - It’s separate from your Alder Lake iGPU issue. 
> - Your WM/DM freeze may be **graphics related**, but what you’re seeing on screen is the Wi-Fi card failing. 
> - In some cases, the flood of dmesg logs + driver crashes can also drag the system into a freeze. 
> 
> ---
> 
> ## Fixing the Realtek RTL8821CE issue
> From a TTY (Ctrl+Alt+F3):
> 
> 1. **Blacklisting the broken driver (quick test)** 
>  Edit blacklist file:
> 
>  ```bash
>  echo "blacklist rtw88_8821ce" | sudo tee /etc/modprobe.d/blacklist-rtl8821ce.conf
>  sudo update-initramfs -u
>  ```
> 
>  Then reboot. This will disable the Wi-Fi completely, but at least tell you if that’s what’s causing the hangs.
> 
> 2. **Install a better driver** 
>  The community-maintained dkms driver usually works much better:
> 
>  ```bash
>  sudo apt install build-essential dkms git
>  git clone https://github.com/tomaspinho/rtl8821ce.git
>  cd rtl8821ce
>  sudo ./dkms-install.sh
>  ```
> 
>  Then reboot. 
> 
> 3. **Check if things calm down** 
>  After reboot, `dmesg | grep rtw` should show only a few initialization lines, not a flood of errors.
> 
> ---
> 
> ## Next steps
> - If blacklisting the Wi-Fi driver lets you log in to GNOME/i3 fine → your *actual freeze was caused by the Wi-Fi spam*. 
> - If it still freezes with the driver disabled → then it’s back to the **Alder Lake graphics stack** fix (update kernel + Mesa). 
> 
> ---
> 
> 👉 Do you want me to write you the **exact sequence of commands** for: 
> - disabling the bad Wi-Fi driver temporarily, 
> - installing the dkms replacement, 
> - and then re-enabling it once you confirm it’s stable?
<!-- UID: f4ea57cc-d8c7-4331-a7c2-157bad4e6b01 -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:47 AM
> the driver was disabled, and it is still not letting me in to a wm
<!-- UID: a6d79168-6139-490b-a172-893fa70129df -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:47 AM
> Perfect — that rules out the Realtek spam as *the* culprit. So we’re back to the Alder Lake iGPU side of things. Let’s walk through a surgical plan:
> 
> ---
> 
> ## 1. Confirm your graphics driver is the bottleneck
> From a TTY (Ctrl+Alt+F3), check:
> 
> ```bash
> lspci -k | grep -A 3 VGA
> ```
> 
> You should see something like:
> 
> ```
> 00:02.0 VGA compatible controller: Intel Corporation Alder Lake-P Integrated Graphics Controller
>  Kernel driver in use: i915
>  Kernel modules: i915
> ```
> 
> - If `Kernel driver in use` is blank, or not `i915`, Xorg/Wayland has nothing to talk to → guaranteed freeze. 
> - If it *is* `i915` but Mesa is too old, you’ll also get freezes.
> 
> ---
> 
> ## 2. Update the stack
> Ubuntu’s default (esp. 22.04) is too old for Alder Lake.
> 
> **Kernel HWE (get 6.x instead of 5.15):**
> 
> ```bash
> sudo apt update
> sudo apt install --install-recommends linux-generic-hwe-22.04
> ```
> 
> **Mesa (userspace driver for OpenGL/Vulkan):**
> 
> ```bash
> sudo add-apt-repository ppa:oibaf/graphics-drivers
> sudo apt update
> sudo apt full-upgrade -y
> ```
> 
> Reboot. This gets you a kernel + Mesa combo that actually supports Gen12.
> 
> ---
> 
> ## 3. Try Xorg only
> Force GNOME to use Xorg instead of Wayland (Wayland tends to be crashier on edge hardware):
> 
> ```bash
> sudo nano /etc/gdm3/custom.conf
> ```
> 
> Uncomment:
> 
> ```
> WaylandEnable=false
> ```
> 
> Save → reboot → login.
> 
> ---
> 
> ## 4. Workarounds if it still fails
> - **Boot with a probe override:** 
>  Add to GRUB (`/etc/default/grub`):
> 
>  ```
>  GRUB_CMDLINE_LINUX_DEFAULT="quiet splash i915.force_probe=*"
>  ```
> 
>  Then:
> 
>  ```bash
>  sudo update-grub
>  ```
> 
>  Reboot.
> 
> - **Fallback WM:** install something featherweight like `openbox` or `xfce4` and test if *that* runs. That distinguishes “GPU init is broken” from “GNOME is too heavy for the driver bug.”
> 
> ---
> 
> ## 5. Collect logs if still broken
> After trying to log in (even if it freezes visually), switch to TTY again and run:
> 
> ```bash
> journalctl -b0 -p err --no-pager | grep -iE "gpu|drm|i915|xorg"
> ```
> 
> That will tell you exactly which i915/Mesa call bombs.
> 
> ---
> 
> 👉 Question for you: are you on **Ubuntu 22.04 LTS** or **24.04 LTS**? The recipe is slightly different — 24.04 already has newer kernel/Mesa, so the fix there is more about forcing the right modesetting driver.
<!-- UID: f116ef92-60cb-42a7-bdf6-baf698ea9ed0 -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:48 AM
> I kinda need to enable the wifi again to do that
<!-- UID: 9e97e636-9efe-45e4-b11e-e77f3c7519ca -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:48 AM
> Got it 👍 — let’s get your **Realtek RTL8821CE Wi-Fi** working again so you can actually pull the new kernel/Mesa. 
> 
> ---
> 
> ## 1. Remove the blacklist
> If you blacklisted it earlier, undo that first:
> 
> ```bash
> sudo rm /etc/modprobe.d/blacklist-rtl8821ce.conf
> sudo update-initramfs -u
> ```
> 
> Reboot, and the stock `rtw88_8821ce` module will load again (but it’ll spam logs and may be unstable). That at least gets you back online if it works enough to associate.
> 
> ---
> 
> ## 2. Install the better driver (DKMS version)
> From a TTY with temporary networking (e.g. Ethernet or phone USB tether), grab build tools:
> 
> ```bash
> sudo apt update
> sudo apt install -y build-essential dkms git
> ```
> 
> Then pull the community driver:
> 
> ```bash
> git clone https://github.com/tomaspinho/rtl8821ce.git
> cd rtl8821ce
> sudo ./dkms-install.sh
> ```
> 
> Reboot. 
> 
> This overrides the in-kernel driver with the DKMS one, which is far more stable.
> 
> ---
> 
> ## 3. Verify
> Check that it’s loaded:
> 
> ```bash
> lsmod | grep 8821ce
> ```
> 
> And watch logs:
> 
> ```bash
> dmesg | grep rtw
> ```
> 
> You should no longer see the endless `failed to leave ips state` spam. 
> 
> ---
> 
> ## 4. If you can’t get online at all
> - Plug in Ethernet (if your laptop has a port). 
> - Or use your phone in USB tethering mode — Ubuntu sees it as a wired NIC instantly (`enx...` device). 
> 
> That gives you a stable pipe to install the DKMS driver. 
> 
> ---
> 
> 👉 Do you want me to write you a **single copy-paste block** that: 
> 1. Removes blacklist, 
> 2. Installs dkms/git/build tools, 
> 3. Pulls the DKMS repo, 
> 4. Reboots — so you get Wi-Fi working again in one go?
<!-- UID: 819fb6eb-e047-4165-ae42-be974831baf6 -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:52 AM
> If I could get far enough into the computer to copy and paste something from the net, we wouldn't be having this conversation.
> 1. The network driver *is* unstable, it doesn't connect consistantly
> 2. I can only log in via tty right now.
<!-- UID: c7e5b95f-32e8-45c9-9788-3f4871061b32 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:52 AM
> Right — thanks for spelling that out. You're in the classic *“can only get to TTY, unstable Wi-Fi, need net to fix net”* trap. Let's talk practical bootstrapping:
> 
> ---
> 
> ## 1. Easiest: Temporary wired connection
> If your laptop has **Ethernet** (or you can use a USB-C/USB-A to Ethernet dongle), plug that in. Ubuntu will bring it up automatically (`enp0s…` interface) and you’ll have a rock-solid link to grab packages.
> 
> If that’s possible, skip to **step 3** below.
> 
> ---
> 
> ## 2. Next best: Phone USB tethering
> - Plug your phone in via USB. 
> - Enable USB tethering (Android: Settings → Network → Hotspot & tethering → USB tethering). 
> - Ubuntu will expose it as a wired NIC (e.g. `usb0`). 
> 
> That gives you immediate internet without touching the broken Realtek card.
> 
> ---
> 
> ## 3. Install the Realtek DKMS driver (once you have *any* net)
> From your TTY:
> 
> ```bash
> sudo apt update
> sudo apt install -y build-essential dkms git
> git clone https://github.com/tomaspinho/rtl8821ce.git
> cd rtl8821ce
> sudo ./dkms-install.sh
> ```
> 
> Reboot. 
> That should stop the log spam and give you stable Wi-Fi.
> 
> ---
> 
> ## 4. Absolute fallback: offline install
> If you have **another machine with internet**, you can:
> - Download the `.deb` packages (`build-essential`, `dkms`, `git`) and the driver repo tarball from GitHub. 
> - Copy them over with a USB stick. 
> - Install with:
> 
>  ```bash
>  sudo dpkg -i *.deb
>  tar xzf rtl8821ce.tar.gz
>  cd rtl8821ce
>  sudo ./dkms-install.sh
>  ```
> 
> Ugly, but works if you can’t tether.
> 
> ---
> 
> ## 5. After Wi-Fi is stable
> Only then go back to fixing your **Alder Lake GPU**:
> - Install the HWE kernel
> - Update Mesa from Oibaf PPA
> - Force Xorg if Wayland fails
> 
> ---
> 
> 👉 Do you have access to **Ethernet** or a **phone you can tether** right now? That’ll determine the fastest way forward.
<!-- UID: 7e28997d-55e7-4875-abff-4874714d03cb -->

---




>[!nexus_user] **User** - 08/27/2025 at 11:55 AM
> What I can do for sure... is put a bash script on a flash drive... and run that... so give me the script I need
<!-- UID: 655dedd0-1bc1-4904-bf35-db9ffefa67bc -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 11:55 AM
> Alright, here’s a **single drop-in bash script** you can put on a USB stick and run from a TTY. It does three things:
> 
> 1) gets you online (tries USB/Ethernet first; can also use your flaky Wi-Fi just long enough to fetch packages), 
> 2) installs the **stable RTL8821CE DKMS driver** (using a local tarball if you copied it to the USB), 
> 3) applies **Alder Lake graphics workarounds** (force Xorg, add `i915.force_probe=*`) and, **if network is up**, upgrades kernel/Mesa.
> 
> Save as `fix-boot-net-gfx.sh`, copy to your USB, then on the laptop: 
> `sudo bash /path/to/USB/fix-boot-net-gfx.sh`
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> log(){ echo -e "\n[+] $*"; }
> warn(){ echo -e "\n[!] $*" >&2; }
> die(){ echo -e "\n[✗] $*" >&2; exit 1; }
> 
> require_root(){
>  [[ $EUID -eq 0 ]] || die "Run as root: sudo bash $0"
> }
> 
> have_cmd(){ command -v "$1" >/dev/null 2>&1; }
> 
> have_net(){
>  ping -c1 -W2 1.1.1.1 >/dev/null 2>&1 && return 0
>  ping -c1 -W2 8.8.8.8 >/dev/null 2>&1 && return 0
>  return 1
> }
> 
> bring_up_wired_like(){
>  # Try to bring up any likely wired/usb interfaces without NM
>  for i in $(ip -o link show | awk -F': ' '{print $2}' | grep -E '^(en|eth|usb)'); do
>  log "Bringing up interface: $i"
>  ip link set "$i" up || true
>  dhclient -v "$i" || true
>  done
> 
>  # If NetworkManager is around, also try nmcli
>  if have_cmd nmcli; then
>  nmcli networking on || true
>  nmcli device status || true
>  for i in $(nmcli -g DEVICE device status | tail -n +2); do
>  nmcli device connect "$i" || true
>  done
>  fi
> }
> 
> # --- 0) Prep
> require_root
> OSREL=/etc/os-release
> . "$OSREL"
> 
> log "Detected: $PRETTY_NAME"
> log "Starting rescue: Wi-Fi DKMS + Intel Alder Lake graphics workarounds"
> 
> # --- 1) Try to get any network up (USB tether / Ethernet first)
> log "Checking network connectivity..."
> if ! have_net; then
>  warn "No network detected. If possible: plug in Ethernet or enable USB tethering on your phone (Android: Settings → Hotspot & tethering → USB tethering)."
>  bring_up_wired_like
> fi
> if have_net; then
>  log "Network is up."
> else
>  warn "Still offline. That's OK if you copied a local RTL8821CE tarball next to this script."
> fi
> 
> # --- 2) Realtek RTL8821CE: install stable DKMS driver
> # Supports two paths:
> # A) Offline: rtl8821ce-dkms.tar.gz placed next to this script
> # B) Online: git clone the repo and install
> 
> SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
> LOCAL_TARBALL="$SCRIPT_DIR/rtl8821ce-dkms.tar.gz"
> 
> log "Preparing build prerequisites (build-essential, dkms, git if online)..."
> if have_net; then
>  apt-get update -y
>  DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends build-essential dkms git
> else
>  warn "Offline: ensure build-essential, dkms are already installed (if not, the DKMS step will fail)."
> fi
> 
> # Make sure the bad in-kernel module won't load
> log "Blacklisting in-kernel rtw88_8821ce to avoid spam/crashes..."
> echo "blacklist rtw88_8821ce" >/etc/modprobe.d/blacklist-rtl8821ce.conf || true
> update-initramfs -u || true
> 
> install_rtl8821ce_offline(){
>  tar xzf "$LOCAL_TARBALL" -C /usr/src
>  # Expecting tar to contain a single top-level folder with dkms.conf present
>  PKG_DIR=$(tar tzf "$LOCAL_TARBALL" | head -1 | cut -d/ -f1)
>  [[ -n "$PKG_DIR" ]] || die "Could not detect DKMS package folder in tarball."
>  DKMS_NAME=$(grep ^PACKAGE_NAME /usr/src/$PKG_DIR/dkms.conf | cut -d'"' -f2)
>  DKMS_VER=$(grep ^PACKAGE_VERSION /usr/src/$PKG_DIR/dkms.conf | cut -d'"' -f2)
>  [[ -n "$DKMS_NAME" && -n "$DKMS_VER" ]] || die "dkms.conf incomplete."
> 
>  log "Adding DKMS module: $DKMS_NAME/$DKMS_VER"
>  dkms add -m "$DKMS_NAME" -v "$DKMS_VER"
>  dkms build -m "$DKMS_NAME" -v "$DKMS_VER"
>  dkms install -m "$DKMS_NAME" -v "$DKMS_VER"
> }
> 
> install_rtl8821ce_online(){
>  TMPD=$(mktemp -d)
>  trap 'rm -rf "$TMPD"' EXIT
>  git clone https://github.com/tomaspinho/rtl8821ce.git "$TMPD/rtl8821ce"
>  bash "$TMPD/rtl8821ce/dkms-install.sh"
> }
> 
> if [[ -f "$LOCAL_TARBALL" ]]; then
>  log "Found local RTL8821CE DKMS tarball: $LOCAL_TARBALL"
>  install_rtl8821ce_offline || die "Offline DKMS install failed."
> elif have_net; then
>  log "No local tarball; installing DKMS driver from GitHub..."
>  install_rtl8821ce_online || die "Online DKMS install failed."
> else
>  warn "No network and no local tarball. Skipping Wi-Fi DKMS install."
> fi
> 
> log "Reloading Wi-Fi modules (ignore errors if not present)..."
> modprobe -r rtw_8821ce rtw88_8821ce || true
> modprobe 8821ce || true
> 
> # --- 3) Intel Alder Lake graphics: safe defaults so you can reach a desktop
> # Force GNOME to Xorg (Wayland off)
> if [[ -d /etc/gdm3 ]]; then
>  log "Forcing GDM to use Xorg (Wayland disabled)..."
>  sed -i 's/^#\?WaylandEnable=.*/WaylandEnable=false/' /etc/gdm3/custom.conf 2>/dev/null || {
>  echo "WaylandEnable=false" >> /etc/gdm3/custom.conf
>  }
> fi
> 
> # Add i915 probe override to help early-gen12 bring-up
> log "Adding i915.force_probe=* to GRUB kernel params..."
> if grep -q '^GRUB_CMDLINE_LINUX_DEFAULT=' /etc/default/grub; then
>  sed -i 's/^\(GRUB_CMDLINE_LINUX_DEFAULT="\)\([^"]*\)"/\1\2 i915.force_probe=*"/' /etc/default/grub
> else
>  echo 'GRUB_CMDLINE_LINUX_DEFAULT="quiet splash i915.force_probe=*"' >> /etc/default/grub
> fi
> update-grub || true
> 
> # --- 4) If online, upgrade kernel (HWE) + Mesa (Oibaf) for Gen12
> if have_net; then
>  log "Online: installing HWE kernel and latest Mesa (Oibaf PPA)..."
>  # Choose HWE meta depending on release
>  case "$VERSION_CODENAME" in
>  jammy) HWE_META="linux-generic-hwe-22.04" ;;
>  noble) HWE_META="linux-generic-hwe-24.04" ;;
>  *) HWE_META="linux-generic" ;; # fallback
>  esac
> 
>  apt-get update -y
>  DEBIAN_FRONTEND=noninteractive apt-get install -y --install-recommends "$HWE_META" || warn "HWE kernel install failed (continuing)."
> 
>  if have_cmd add-apt-repository; then
>  add-apt-repository -y ppa:oibaf/graphics-drivers || warn "Adding Oibaf PPA failed."
>  else
>  DEBIAN_FRONTEND=noninteractive apt-get install -y software-properties-common
>  add-apt-repository -y ppa:oibaf/graphics-drivers || warn "Adding Oibaf PPA failed."
>  fi
> 
>  apt-get update -y
>  DEBIAN_FRONTEND=noninteractive apt-get -y dist-upgrade || warn "Mesa upgrade failed."
> else
>  warn "Offline: skipping kernel/Mesa upgrades. You can rerun this script later when online."
> fi
> 
> # --- 5) Finish
> log "All done. Recommended next steps:"
> echo " 1) Reboot now."
> echo " 2) On next boot, try logging into the GNOME on Xorg session (or i3)."
> echo " 3) If still blank/freezing, switch to TTY and run: journalctl -b0 -p err | grep -iE 'i915|drm|gpu|xorg'"
> 
> read -rp $'\nReboot now? [y/N] ' ans
> if [[ "${ans:-N}" =~ ^[Yy]$ ]]; then
>  reboot
> else
>  log "Reboot skipped. Remember to reboot to apply GRUB/GDM changes."
> fi
> ```
> 
> ### What you might want to copy to the USB alongside the script (for **offline** Wi-Fi install)
> - `rtl8821ce-dkms.tar.gz` — a tarball of the DKMS driver source. If you can’t fetch it now, you can prep it later from another machine (GitHub repo `tomaspinho/rtl8821ce`, `git archive -o rtl8821ce-dkms.tar.gz HEAD`), then rerun the script.
> 
> ### Minimal usage
> 1. Make it executable on your other machine before copying, or chmod on the laptop:
>  ```bash
>  chmod +x /media/$USER/USB/fix-boot-net-gfx.sh
>  sudo bash /media/$USER/USB/fix-boot-net-gfx.sh
>  ```
> 2. If possible, plug **Ethernet** or enable **USB tethering** first — the script will automatically try to bring it up.
> 
> If anything barks, paste the error from the TTY and I’ll adapt the script. #linux #ubuntu #rescue #drivers #intel #realtek
<!-- UID: 1a1f1440-c67a-41e6-8b18-108fd5204e23 -->

---




>[!nexus_user] **User** - 08/27/2025 at 12:00 PM
> how do I mount the usb stick?
<!-- UID: dce77729-1f1d-4780-96eb-8cda15e79afd -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 12:00 PM
> Good question — if you’re in a bare **TTY** (no desktop automount), you have to do it by hand. Here’s the step-by-step:
> 
> ---
> 
> ### 1. Plug in the USB stick 
> Wait ~2–3 seconds after inserting.
> 
> ---
> 
> ### 2. Find the device name 
> Run:
> 
> ```bash
> lsblk
> ```
> 
> or
> 
> ```bash
> dmesg | tail -n 20
> ```
> 
> Look for something like:
> 
> ```
> sdb 8:16 1 14.7G 0 disk
> └─sdb1 8:17 1 14.7G 0 part
> ```
> 
> That means the USB stick is `/dev/sdb` with one partition `/dev/sdb1`.
> 
> ---
> 
> ### 3. Make a mount point 
> Choose a directory to mount into, e.g.:
> 
> ```bash
> sudo mkdir -p /mnt/usb
> ```
> 
> ---
> 
> ### 4. Mount it 
> Most USB sticks are FAT32 or exFAT, so:
> 
> ```bash
> sudo mount /dev/sdb1 /mnt/usb
> ```
> 
> If it errors about filesystem type, try:
> 
> ```bash
> sudo mount -t vfat /dev/sdb1 /mnt/usb # FAT32
> sudo mount -t exfat /dev/sdb1 /mnt/usb # exFAT
> sudo mount -t ntfs /dev/sdb1 /mnt/usb # NTFS
> ```
> 
> ---
> 
> ### 5. Verify 
> Check the contents:
> 
> ```bash
> ls /mnt/usb
> ```
> 
> You should see your script there.
> 
> ---
> 
> ### 6. Run your script from it 
> ```bash
> cd /mnt/usb
> chmod +x fix-boot-net-gfx.sh
> sudo ./fix-boot-net-gfx.sh
> ```
> 
> ---
> 
> ### 7. When done, unmount cleanly 
> ```bash
> cd ~
> sudo umount /mnt/usb
> ```
> 
> ---
> 
> ⚠️ Pro-tip: Be very sure of the device name (`/dev/sdX`) — if you accidentally mount the wrong partition and write to it, you can clobber your root filesystem. `lsblk` output is your safest guide. 
> 
> Do you want me to show you a **sample `lsblk` output annotated** so you can tell which one is the USB stick vs your main drive?
<!-- UID: b0b980d1-586e-4646-8322-8e17447d81ca -->

---




>[!nexus_user] **User** - 08/27/2025 at 12:05 PM
> We ran the script, still not working. It *was* working before I started running update commands...
<!-- UID: c674906e-1505-4e8e-99f3-e1dffd5d8f14 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 12:05 PM
> Understood. If it worked before updates and now **no WM starts**, we’ll assume the stack upgrade broke your graphics session. Let’s do a clean rollback + sanity fixes from a TTY.
> 
> # Plan
> 1) Boot an older kernel (quickest recovery). 
> 2) Revert the Oibaf Mesa PPA. 
> 3) Remove risky kernel args we added. 
> 4) Sanity-check perms/files that commonly break logins. 
> 5) Try an alternate display manager. 
> 6) If needed, start i3 directly to confirm X works.
> 
> ## 0) Collect quick facts (for later)
> ```bash
> uname -r
> dpkg -l | grep -E 'linux-image-[0-9]|linux-generic|linux-generic-hwe'
> grep -E 'GRUB_CMDLINE_LINUX_DEFAULT' /etc/default/grub
> ```
> 
> ## 1) Boot the previous kernel
> Reboot → at the **GRUB** menu choose:
> - **Advanced options for Ubuntu** → pick the **previous** kernel (not the newest).
> If the menu doesn’t show: hold **Shift** (BIOS) or **Esc** (UEFI) right after firmware logo.
> 
> If that boots to a working desktop, we’ve confirmed the new kernel/Mesa combo is the culprit.
> 
> ## 2) Roll back the Mesa PPA (Oibaf)
> From TTY (Ctrl+Alt+F3), login and run:
> ```bash
> sudo apt-get update
> sudo apt-get install -y ppa-purge
> sudo ppa-purge -y ppa:oibaf/graphics-drivers
> ```
> This restores Ubuntu’s stock Mesa packages.
> 
> ## 3) Remove the probe override we added
> We added `i915.force_probe=*`. Let’s remove it:
> ```bash
> sudo sed -i 's/ i915\.force_probe=\*//g' /etc/default/grub
> sudo update-grub
> ```
> 
> ## 4) Regenerate initramfs (ensure all drivers included)
> ```bash
> sudo update-initramfs -u -k all
> ```
> 
> ## 5) Fix common login blockers
> - `/tmp` must be sticky:
> ```bash
> ls -ld /tmp
> sudo chmod 1777 /tmp
> ```
> - Kill stale X auth sockets/files:
> ```bash
> rm -f ~/.Xauthority ~/.ICEauthority ~/.cache/wayland-0
> ```
> - Ensure you actually have a desktop & Xorg:
> ```bash
> sudo apt-get install -y --reinstall ubuntu-desktop xorg gdm3 mesa-utils
> ```
> 
> ## 6) Try an alternate display manager (rules out GDM/Wayland weirdness)
> ```bash
> sudo apt-get install -y lightdm
> sudo systemctl disable gdm3 --now
> sudo systemctl enable lightdm --now
> sudo systemctl start lightdm
> ```
> If LightDM gives you a login and a desktop, the problem was GDM/Wayland. You can keep LightDM or later re-enable GDM:
> ```bash
> sudo systemctl disable lightdm --now
> sudo systemctl enable gdm3 --now
> sudo systemctl start gdm3
> ```
> 
> ## 7) Try starting i3 directly (bypass DM)
> Create a minimal `.xinitrc` and run X manually:
> ```bash
> echo 'exec env -u WAYLAND_DISPLAY i3' > ~/.xinitrc
> startx
> ```
> If that works, your **Xorg + i915** stack is fine and the DM/session config was the issue.
> 
> ## 8) If you still want HWE kernel (but known-good)
> If you’re on **22.04**, HWE is fine—but stick with **HWE kernel** and **stock Mesa** first:
> ```bash
> sudo apt-get install -y --install-recommends linux-generic-hwe-22.04
> ```
> Reboot and test **before** re-adding any PPAs.
> 
> ## 9) Inspect errors if it still fails
> Immediately after a failed login attempt:
> ```bash
> journalctl -b0 -p err --no-pager | grep -iE 'i915|drm|gpu|xorg|gdm|lightdm'
> grep -iE "(EE)|i915|drm" /var/log/Xorg.0.log 2>/dev/null || true
> ```
> Paste the **5–10 most suspicious lines** and we’ll read them.
> 
> ---
> 
> ### Likeliest root cause (based on your symptoms)
> - The **Oibaf Mesa** + your current kernel (or vice versa) introduced a mismatch → GNOME/i3 can’t bring up the GPU. Rolling back Mesa and removing `i915.force_probe` usually clears it. If not, booting the prior kernel seals it.
> 
> ### Minimal “nuclear” fix path (short version)
> ```bash
> # 1) GRUB → Advanced → boot older kernel
> # 2) Then TTY:
> sudo ppa-purge -y ppa:oibaf/graphics-drivers
> sudo sed -i 's/ i915\.force_probe=\*//g' /etc/default/grub && sudo update-grub
> sudo update-initramfs -u -k all
> sudo apt-get install -y --reinstall ubuntu-desktop xorg gdm3
> sudo chmod 1777 /tmp
> rm -f ~/.Xauthority ~/.ICEauthority ~/.cache/wayland-0
> sudo apt-get install -y lightdm && sudo systemctl disable gdm3 --now && sudo systemctl enable lightdm --now && sudo systemctl start lightdm
> ```
> 
> Tell me exactly what happens at each of these steps (especially booting the older kernel and starting LightDM). We’ll zero in fast. #linux #ubuntu #intel #i915 #mesa #xorg #wayland
<!-- UID: 3e4b00ad-d935-40f2-818c-f2f1874e09b5 -->

---




>[!nexus_user] **User** - 08/27/2025 at 12:07 PM
> Fuck it was synergy! What the hell! I uninstalled it and we're fine now
<!-- UID: dee872c1-09d1-4d04-bca4-0f7320c2eb89 -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 12:07 PM
> 😂 oh wow — **Synergy** strikes again. That explains the “it *was* working until I updated” mystery: Synergy hooks deep into Xorg/Wayland input and can completely brick a login session if it’s misconfigured or built against slightly mismatched libraries. It’ll hang the whole desktop before you even see a window. 
> 
> ---
> 
> ### Why it happened
> - Synergy runs a background client/server at login and tries to grab keyboard/mouse. 
> - On a fresh system (or after updates), it can’t connect to its peer, but it *still* hijacks the input layer → desktop looks frozen. 
> - Remove Synergy and suddenly GDM/i3/GNOME behave fine again.
> 
> ---
> 
> ### Lessons learned
> 1. **Always suspect third-party daemons first** (before nuking kernel/Mesa). 
> 2. If you ever want to retry Synergy, run it manually *after* the desktop is up — don’t enable autostart until you confirm it plays nice. 
> 3. Alternatives like **Barrier** or **Input Leap** tend to be less brittle and work with newer Wayland setups. 
> 
> ---
> 
> 👉 Do you want me to write you a **safe setup guide** for Synergy-like software (Barrier/Input Leap) that won’t brick your login session again?
<!-- UID: 23340ce2-ebad-4a8d-ac4a-ca7599dbf271 -->

---




>[!nexus_user] **User** - 08/27/2025 at 12:08 PM
> Is barrier not just a fork of the old version of synergy?
<!-- UID: 5587851a-9b4e-44f4-b123-67beadaa81ca -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 12:08 PM
> Yep — that’s basically right. Quick lineage rundown: 
> 
> - **Synergy**: the original project, closed–open–closed source dance, lots of licensing drama. The modern “Symless” commercial Synergy releases are proprietary again, and often lag in stability on Linux. 
> - **Barrier**: community fork of Synergy back when it was GPL, stripped out paid/telemetry bits, kept the cross-platform KVM features. It got popular because it *just worked* and didn’t require a license key. 
> - **Input Leap**: a newer fork of Barrier that’s under more active maintenance today. Many Linux distros (esp. Fedora, Arch, even Ubuntu PPAs) are moving toward Input Leap as the “safe” FOSS choice. 
> 
> So: 
> - **Barrier** = free, community-maintained fork of old Synergy (stable, but maintenance is sporadic). 
> - **Input Leap** = Barrier’s continuation with fixes and Wayland/Xorg compatibility work. 
> 
> ---
> 
> ### Why this matters for you
> - Barrier is *less likely* to screw your login session than current Synergy, because it doesn’t hook itself into PAM/startup quite as aggressively. 
> - Input Leap is even better if you want long-term support and Wayland safety (since GNOME defaults to Wayland now). 
> - The catch: all of them still “own” keyboard/mouse events, so misconfig at login can **look like a freeze**. Safer to launch them *after* login, not from system services. 
> 
> ---
> 
> 👉 Do you want me to sketch a **safe systemd user unit** for Barrier/Input Leap so it only starts after you’re logged into a desktop session, instead of killing your greeter again?
<!-- UID: 04189624-5752-4073-8c3b-ca92fd85965d -->

---


