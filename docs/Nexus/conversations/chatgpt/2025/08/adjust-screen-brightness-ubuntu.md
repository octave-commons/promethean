---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Adjust screen brightness Ubuntu"
conversation_id: 6894d38f-1260-8321-9b77-59569b5e7abf
create_time: 08/07/2025 at 11:26 AM
update_time: 08/16/2025 at 12:01 PM
---

# Title: Adjust screen brightness Ubuntu

Created: 08/07/2025 at 11:26 AM
Last Updated: 08/16/2025 at 12:01 PM
Chat URL: https://chat.openai.com/c/6894d38f-1260-8321-9b77-59569b5e7abf


>[!nexus_user] **User** - 08/07/2025 at 11:26 AM
> How do I adjust the brightness of the screen from the command line on ubuntu?
<!-- UID: 545fbee2-ca3f-4a9a-9f5c-7efda0a24970 -->




>[!nexus_agent] **Assistant** - 08/07/2025 at 11:26 AM
> On Ubuntu, adjusting screen brightness from the command line depends on your hardware (laptop, desktop, GPU type). Here are several methods—start with the simplest:
> 
> ---
> 
> ## 🧪 1. **Using `brightnessctl` (Recommended for most systems)**
> Install if not present:
> ```bash
> sudo apt install brightnessctl
> ```
> 
> Check current brightness:
> ```bash
> brightnessctl
> ```
> 
> Set brightness (e.g., 50%):
> ```bash
> brightnessctl set 50%
> ```
> 
> Increase/decrease:
> ```bash
> brightnessctl set +10%
> brightnessctl set 10%-
> ```
> 
> > Works well on laptops and desktops with backlight control exposed in `/sys/class/backlight`.
> 
> ---
> 
> ## 🧰 2. **Directly modify sysfs (Low-level, fragile)**
> Find your backlight device:
> ```bash
> ls /sys/class/backlight/
> ```
> Usually something like `intel_backlight`.
> 
> Then:
> ```bash
> cd /sys/class/backlight/intel_backlight
> cat max_brightness # e.g., 937
> ```
> 
> Set brightness (must be root):
> ```bash
> sudo sh -c 'echo 468 > /sys/class/backlight/intel_backlight/brightness'
> ```
> 
> > `468` is ~50% of `937` in this example.
> 
> ---
> 
> ## 🧱 3. **Using `xrandr` (for desktops or external displays)**
> This doesn't change hardware brightness—it dims the output **via software**:
> ```bash
> xrandr --output eDP-1 --brightness 0.5
> ```
> 
> - Replace `eDP-1` with your display name from:
>  ```bash
>  xrandr | grep " connected"
>  ```
> 
> > `--brightness 1.0` is normal, `0.5` is dimmer.
> 
> ⚠️ Note: `xrandr` brightness gets reset on reboot/login.
> 
> ---
> 
> ## 🧠 4. **Using `ddcutil` (for external monitors via DDC/CI)**
> Only works if your monitor supports DDC/CI over HDMI/DP.
> 
> Install:
> ```bash
> sudo apt install ddcutil
> ```
> 
> Detect monitor:
> ```bash
> ddcutil detect
> ```
> 
> Get brightness:
> ```bash
> ddcutil getvcp 10
> ```
> 
> Set brightness:
> ```bash
> ddcutil setvcp 10 50
> ```
> 
> > `10` is the VCP code for brightness.
> 
> ---
> 
> ## ✅ Which one should I use?
> 
> - Laptop: `brightnessctl` or `/sys/class/backlight/`
> - Desktop with external display: `xrandr` or `ddcutil`
> 
> If unsure, start with:
> ```bash
> brightnessctl set 50%
> ```
> 
> Let me know if you want to map this to keybindings or automate it!
<!-- UID: 7f7ca427-6154-4d5e-aa9e-82fc2c1cdd65 -->

---


