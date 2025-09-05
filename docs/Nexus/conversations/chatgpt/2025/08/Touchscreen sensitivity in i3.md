---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Touchscreen sensitivity in i3"
conversation_id: 689a718c-5fe0-832c-ba0d-4486827bc19e
create_time: 08/11/2025 at 5:41 PM
update_time: 08/23/2025 at 11:28 PM
---

# Title: Touchscreen sensitivity in i3

Created: 08/11/2025 at 5:41 PM
Last Updated: 08/23/2025 at 11:28 PM
Chat URL: https://chat.openai.com/c/689a718c-5fe0-832c-ba0d-4486827bc19e


>[!nexus_user] **User** - 08/11/2025 at 5:41 PM
> How do i tune the sensitivity of my touch screen in linux while in i3?
<!-- UID: 9e430250-faf0-4404-a7a6-bcf386e997f4 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 5:41 PM
> On Linux (and i3 doesn’t change this), touchscreen sensitivity is mostly controlled through the input driver settings — usually via **`xinput`** if you’re on X11, or **`libinput`** configuration if you’re on Wayland/XWayland. 
> What “sensitivity” means here could be: 
> 
> - **Tap-to-touch pressure threshold** (harder or lighter touch required) 
> - **Debounce / palm rejection** 
> - **Coordinate scaling or jitter filtering** 
> 
> Since you’re in i3, you’re almost certainly in X11 or XWayland, so `xinput` is your friend. 
> 
> ---
> 
> ## 1️⃣ Identify the touchscreen device
> 
> ```bash
> xinput list
> ```
> 
> Look for something like:
> 
> ```
> ⎜ ↳ ELAN Touchscreen 	id=13	[slave pointer (2)]
> ```
> 
> Grab that **id** or **device name**.
> 
> ---
> 
> ## 2️⃣ See what’s adjustable
> 
> ```bash
> xinput list-props 13
> # or
> xinput list-props "ELAN Touchscreen"
> ```
> 
> You might see properties like:
> 
> ```
> libinput Calibration Matrix (293): 1.0, 0.0, 0.0, 0.0, 1.0, 0.0
> libinput Accel Speed (294): 0.000000
> libinput Accel Profile Enabled (295): 1, 0, 0
> libinput Tapping Enabled (296): 1
> libinput Tapping Drag Enabled (297): 1
> libinput Tapping Drag Lock Enabled (298): 0
> ```
> 
> ---
> 
> ## 3️⃣ Adjust relevant properties
> 
> **For speed/response:**
> ```bash
> xinput set-prop "ELAN Touchscreen" "libinput Accel Speed" 0.5
> # Range: -1 (slower) to 1 (faster)
> ```
> 
> **For tap threshold (make it more/less sensitive to light touches):**
> ```bash
> xinput set-prop "ELAN Touchscreen" "libinput Tapping Enabled" 1
> # Enable or disable tap detection entirely
> ```
> 
> **For coordinate filtering (reduce jitter):**
> Some touchscreens expose a `Coordinate Transformation Matrix`. You can slightly smooth input by applying small scale factors, though this is more a calibration trick.
> 
> ---
> 
> ## 4️⃣ Make it permanent
> 
> i3 won’t remember `xinput` changes across restarts — you need to put them in:
> - `~/.xinitrc`
> - i3 config (`exec --no-startup-id xinput set-prop ...`)
> - Or a `.desktop` autostart script
> 
> Example in `~/.config/i3/config`:
> ```bash
> exec --no-startup-id xinput set-prop "ELAN Touchscreen" "libinput Accel Speed" 0.5
> ```
> 
> ---
> 
> ## 5️⃣ If `xinput` doesn’t expose pressure/sensitivity
> 
> Some devices don’t show useful `libinput` props. In that case:
> - Create a custom config in `/etc/X11/xorg.conf.d/40-touchscreen.conf`:
> ```conf
> Section "InputClass"
>  Identifier "touchscreen override"
>  MatchIsTouchscreen "on"
>  Driver "libinput"
>  Option "CalibrationMatrix" "1 0 0 0 1 0 0 0 1"
>  Option "AccelSpeed" "0.5"
> EndSection
> ```
> - Restart X (log out and back in)
> 
> ---
> 
> If you tell me whether you want **lighter touch detection** vs **faster swipe/scroll speed**, I can give you the exact property name and value ranges for your device. 
> Do you want me to go ahead and walk you through reading the *minimum pressure threshold* setting? That’s the one that really changes “how hard” you have to touch.
<!-- UID: 45534651-cfab-4103-b759-bc9c4ff87b72 -->

---




>[!nexus_user] **User** - 08/11/2025 at 5:51 PM
> ⎡ Virtual core pointer 	id=2	[master pointer (3)]
> ⎜ ↳ Virtual core XTEST pointer 	id=4	[slave pointer (2)]
> ⎜ ↳ SYNAC780:00 06CB:CF00 Mouse 	id=9	[slave pointer (2)]
> ⎜ ↳ SYNAC780:00 06CB:CF00 Touchpad 	id=10	[slave pointer (2)]
> ⎜ ↳ Wacom HID 5365 Pen stylus 	id=11	[slave pointer (2)]
> ⎜ ↳ Wacom HID 5365 Finger touch 	id=12	[slave pointer (2)]
> ⎜ ↳ Wacom HID 5365 Pen eraser 	id=15	[slave pointer (2)]
> ⎣ Virtual core keyboard 	id=3	[master keyboard (2)]
>  ↳ Virtual core XTEST keyboard 	id=5	[slave keyboard (3)]
>  ↳ Video Bus 	id=6	[slave keyboard (3)]
>  ↳ Power Button 	id=7	[slave keyboard (3)]
>  ↳ Ideapad extra buttons 	id=8	[slave keyboard (3)]
>  ↳ AT Translated Set 2 keyboard 	id=13	[slave keyboard (3)]
<!-- UID: 5f34d664-5b1e-4b79-8201-aa9b42527bdf -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 5:51 PM
> Got it — your touchscreen shows up as: 
> 
> ```
> Wacom HID 5365 Finger touch id=12
> ```
> 
> That’s good news because Wacom devices on Linux have **extra tuning hooks** beyond what `libinput` usually gives you. You can tweak them via `xsetwacom`, not just `xinput`.
> 
> ---
> 
> ### 1️⃣ Check the current props
> First, confirm `libwacom` and `xsetwacom` are installed:
> ```bash
> sudo apt install xserver-xorg-input-wacom
> ```
> 
> List properties for the touchscreen:
> ```bash
> xinput list-props 12
> ```
> You’ll likely see entries like:
> ```
> libinput Calibration Matrix (XXX): ...
> libinput Accel Speed (XXX): ...
> Wacom Finger Touch Pressure Threshold: N
> ```
> 
> If you see a **"Threshold"** or **"Pressure"** property, that’s your sensitivity setting — higher values mean you need to press harder, lower means lighter touch.
> 
> ---
> 
> ### 2️⃣ Adjust sensitivity (threshold)
> If it’s exposed through `xsetwacom`, it’s even easier:
> ```bash
> xsetwacom --list devices
> ```
> Find the **"Wacom HID 5365 Finger touch"** line and note its ID or name.
> 
> Example to lower the threshold (more sensitive):
> ```bash
> xsetwacom set "Wacom HID 5365 Finger touch" Threshold 5
> ```
> Typical range is **0–100**, with ~27 as the default for many Wacom devices.
> 
> ---
> 
> ### 3️⃣ Adjust palm/jitter rejection
> For less jitter (but maybe slightly less sensitivity):
> ```bash
> xsetwacom set "Wacom HID 5365 Finger touch" Suppress 2
> ```
> - 0 = no filtering 
> - Higher = more noise suppression
> 
> ---
> 
> ### 4️⃣ Make it persistent in i3
> Add to your `~/.config/i3/config`:
> ```bash
> exec --no-startup-id xsetwacom set "Wacom HID 5365 Finger touch" Threshold 5
> exec --no-startup-id xsetwacom set "Wacom HID 5365 Finger touch" Suppress 2
> ```
> 
> ---
> 
> If you want, I can give you a **full minimal tuning profile** for this device so you can tweak pressure, suppression, and speed all in one go. That way it’ll feel “just right” every time you log into i3 without fiddling. 
> 
> Do you want me to prep that full tuning profile?
<!-- UID: d0839a2d-a7b8-40ab-bb78-50c6b8116acb -->

---




>[!nexus_user] **User** - 08/11/2025 at 5:54 PM
> Yea it's like there are a lot of random clicks all over and it's screwing with stuff.
<!-- UID: fe40c19c-31a7-4279-ba71-c5b4d7702c93 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 5:54 PM
> Yeah, that’s classic **false touches/jitter** — basically your touchscreen is reporting phantom taps. 
> We can calm that down without making it feel like you have to jab it with a stylus. 
> 
> Here’s the *right way* for your **Wacom HID 5365 Finger touch** in i3:
> 
> ---
> 
> ## 1️⃣ Check current settings
> ```bash
> xsetwacom --list devices
> # Find: Wacom HID 5365 Finger touch
> xsetwacom get "Wacom HID 5365 Finger touch" Suppress
> xsetwacom get "Wacom HID 5365 Finger touch" Threshold
> ```
> 
> ---
> 
> ## 2️⃣ Tune for phantom touch suppression
> 
> - **Suppress** — filters out small, fast, jittery movements. 
> - **Threshold** — how much pressure/activation is needed before it registers as a touch.
> 
> Example settings to cut down ghost clicks:
> 
> ```bash
> # Ignore micro-movements unless finger is really moving
> xsetwacom set "Wacom HID 5365 Finger touch" Suppress 10
> 
> # Require firmer touches (default might be ~27, we’ll raise it)
> xsetwacom set "Wacom HID 5365 Finger touch" Threshold 50
> ```
> 
> These two together mean: 
> - Tiny noise from the sensor? Ignored. 
> - Random pressure spikes? Ignored unless over threshold.
> 
> ---
> 
> ## 3️⃣ Optional — Disable touch entirely when not needed
> If you just want it *off* sometimes:
> ```bash
> xinput disable "Wacom HID 5365 Finger touch"
> # re-enable:
> xinput enable "Wacom HID 5365 Finger touch"
> ```
> You can bind this to a key in i3:
> ```conf
> bindsym $mod+t exec --no-startup-id xinput toggle "Wacom HID 5365 Finger touch"
> ```
> (`xinput toggle` is not built-in; you can script it.)
> 
> ---
> 
> ## 4️⃣ Make it permanent in i3
> Add to `~/.config/i3/config`:
> ```conf
> exec --no-startup-id xsetwacom set "Wacom HID 5365 Finger touch" Suppress 10
> exec --no-startup-id xsetwacom set "Wacom HID 5365 Finger touch" Threshold 50
> ```
> 
> ---
> 
> ## 5️⃣ If it’s still bad…
> Sometimes Wacom touchscreens spam ghost touches due to:
> - **Electrical noise** (cheap USB power supplies, bad grounding)
> - **Driver bugs** — check `dmesg` for repeated `wacom` or `hid` errors
> - **Firmware calibration drift**
> 
> If it still clicks randomly after high Suppress & Threshold, we can:
> - Increase Suppress to 20–30 
> - Increase Threshold to 80–90 
> - Or script **auto-disable** when ghost touches start firing (using `libinput debug-events` as a trigger)
> 
> ---
> 
> If you want, I can write you a **daemon script** that watches for rapid random touches and temporarily disables the touchscreen until you tap the corner to re-enable it. That’s the “nuclear option” against ghost clicks. 
> 
> Do you want me to make that script next?
<!-- UID: 6ed52ce4-8239-4c61-ba98-303d6e704938 -->

---




>[!nexus_user] **User** - 08/12/2025 at 9:32 AM
> how do I use libinput debug-events to just get the touch inputs. I'm going to keep it open for a bit
<!-- UID: cdbcf561-6ef3-45e7-86bb-24c96f17a769 -->




>[!nexus_agent] **Assistant** - 08/12/2025 at 9:32 AM
> You can filter `libinput debug-events` so you only see your **touchscreen events** by first identifying the device, then passing it explicitly to `libinput`. 
> 
> ---
> 
> ## 1️⃣ Find the device name
> ```bash
> libinput list-devices | grep -A5 "Wacom HID 5365 Finger touch"
> ```
> You’ll see something like:
> ```
> Device: Wacom HID 5365 Finger touch
> Kernel: /dev/input/event12
> Group: 8
> ...
> ```
> That `/dev/input/eventXX` is what we want.
> 
> ---
> 
> ## 2️⃣ Run `libinput debug-events` for just that device
> ```bash
> sudo libinput debug-events --device /dev/input/event12
> ```
> You’ll now only see touch activity from that touchscreen — no mouse, keyboard, or trackpad spam.
> 
> ---
> 
> ## 3️⃣ Interpreting the output
> You’ll get lines like:
> ```
> event12 TOUCH_DOWN +0.000s seat0 default 0 (100.00, 200.00)
> event12 TOUCH_UP +0.200s seat0 default 0 (100.00, 200.00)
> event12 TOUCH_MOTION +0.300s seat0 default 0 (105.00, 205.00)
> ```
> - **TOUCH_DOWN** = finger contact starts 
> - **TOUCH_MOTION** = finger movement 
> - **TOUCH_UP** = contact ends 
> 
> If you see `TOUCH_DOWN` without you actually touching the screen, that’s a ghost click.
> 
> ---
> 
> ## 4️⃣ Optional: filter to just DOWN/UP events 
> You can make it easier to read with `grep`:
> ```bash
> sudo libinput debug-events --device /dev/input/event12 | grep -E "TOUCH_(DOWN|UP)"
> ```
> 
> ---
> 
> If you want, I can take this a step further and make a **one-liner watcher** that logs ghost touches with timestamps so you can measure how often they happen. 
> Do you want me to make that logging script?
<!-- UID: 3ac26576-68e6-434c-aefd-d23c9fba6fc4 -->

---




>[!nexus_user] **User** - 08/12/2025 at 9:43 AM
> is there a gui for this?
<!-- UID: 7ea810d1-045e-4120-b270-ab3ae04ff179 -->




>[!nexus_agent] **Assistant** - 08/12/2025 at 9:43 AM
> Yeah — there are a couple of GUI-ish ways to monitor touchscreen events without staring at raw `libinput` output: 
> 
> ---
> 
> ### **1. `xinput test-xi2` + `xev` (lightweight window event viewers)**
> - `xev` opens a little white box and prints any X11 events — including touch — in a side terminal.
> - `xinput test-xi2 <id>` gives a real-time feed for just your touchscreen in a cleaner format than `libinput`.
> 
> Example:
> ```bash
> xinput test-xi2 12
> ```
> Only shows your Wacom’s touch start/end/move events.
> 
> ---
> 
> ### **2. `evtest` (semi-GUI in terminal)**
> If you want something organized like columns:
> ```bash
> sudo apt install evtest
> sudo evtest /dev/input/event12
> ```
> It’ll display touches in an easier-to-read, scrollable feed, with slot IDs for multi-touch.
> 
> ---
> 
> ### **3. `xournalpp` / `ginput-tool` style GUIs**
> - **`xournalpp`** is an actual note-taking app, but it’s great for *visually* seeing phantom taps because every input is drawn on screen. If you leave it running, ghost touches show up as stray dots/lines.
> - **`ginput-tool`** (part of `gnome-settings-daemon` tools) — if you have GNOME installed, `gnome-control-center` → **Wacom Tablet** → **Test Your Settings** lets you see touches in a test pad area.
> 
> ---
> 
> ### **4. Full raw GUI monitoring: `evtest-qt`**
> If you want a *real GUI event inspector*:
> ```bash
> sudo apt install evtest-qt
> ```
> This opens a Qt window that lists your input devices and streams their events in real time with nice formatting.
> 
> ---
> 
> If your main goal is to **catch phantom touches visually**, I’d say:
> - Open `xournalpp`
> - Select pen-freehand mode
> - Just leave it idle — you’ll see ghost taps draw dots.
> 
> ---
> 
> I can also give you a **minimal GTK or Electron app** that draws a colored dot for each `TOUCH_DOWN` with coordinates. That way you can literally *watch* where the phantom touches are hitting the screen. 
> 
> Do you want me to make that app? That’s the most intuitive way to debug this.
<!-- UID: 39b4c2f9-2614-4df7-b40d-611c33bc9e09 -->

---




>[!nexus_user] **User** - 08/12/2025 at 9:46 AM
> This didn't work, is this in a seperate app repo, or is this just outdated/from older versions of ubuntu?
<!-- UID: 9cd0d38f-424a-418d-a4e0-a0ad6e035f65 -->




>[!nexus_agent] **Assistant** - 08/12/2025 at 9:46 AM
> You're absolutely right to question that — **`evtest-qt` is not part of Ubuntu’s official repositories**, and it's not a standard utility included by default. It’s actually a **third-party, Qt-based GUI built to mimic `evtest`**, maintained separately and typically available only via building from source or community-maintained repos.cite
> 
> ---
> 
> ### What's really going on?
> 
> - **Not an Ubuntu standard tool**: Ubuntu doesn’t include `evtest-qt` out of the box.
> - **Available via GitHub/third-party**: The source is hosted at the GitHub repo `Grumbel/evtest-qt`, requiring manual compilation.cite
> - **Community packaging only**: Distributions like Arch Linux offer it through the AUR (`evtest-qt-git`), but you still compile it from its GitHub source.cite
> 
> ---
> 
> ### What should you use instead?
> 
> Since `evtest-qt` isn't readily installable via Ubuntu’s package manager, here are practical alternatives:
> 
> #### 1. **evtest (CLI, Ubuntu-supported)**
> - Install with:
>  ```bash
>  sudo apt install evtest
>  ```
> - Run via terminal to monitor touch events. It's reliable and works well for debugging.cite
> 
> #### 2. **Use a visual app like `xournalpp`**
> - Launch it and draw freely—phantom touches will appear as visible marks, helping you *see* where false inputs are registering.
> 
> #### 3. **Build `evtest-qt` from Source (if you want a GUI)**
> - Clone the repo from GitHub.
> - Compile using CMake:
>  ```bash
>  mkdir build && cd build
>  cmake ..
>  make
>  sudo ./evtest-qt
>  ```
> - Requires Qt development libraries; not part of official Ubuntu packages.cite
> 
> ---
> 
> ### TL;DR Table
> 
> | Tool | Availability | Notes |
> |----------------------|-------------------|---------------------------------------------|
> | **evtest** | Ubuntu repo | CLI-only, trusted, no GUI |
> | **evtest-qt** | GitHub/AUR only | GUI, requires manual build and Qt libraries |
> | **xournalpp/etc.** | Ubuntu repo | Visual method to observe phantom touches |
> 
> ---
> 
> Want help setting up a quick terminal workflow or maybe building that Qt GUI? Just say the word—I’ve got your back.
<!-- UID: 714e1785-b87b-4087-844e-ac3fd000a369 -->

---




>[!nexus_user] **User** - 08/12/2025 at 9:55 AM
> So... it maybe the pen device? But this device didn't come with a pen...
<!-- UID: 6173b995-2f36-4f5f-9b39-646cfcafa675 -->




>[!nexus_agent] **Assistant** - 08/12/2025 at 9:55 AM
> Yeah, that’s a thing — a lot of convertible laptops and some touch-enabled displays use a **Wacom digitizer layer** that reports both: 
> 
> - **`Finger touch`** (your actual touchscreen) 
> - **`Pen stylus`** and **`Pen eraser`** devices — even if the manufacturer never shipped a pen. 
> 
> The firmware in the touchscreen controller supports pen input, so Linux exposes it through the Wacom driver stack whether you use it or not.
> 
> ---
> 
> ### Why this matters for ghost clicks
> If the stylus channel is misbehaving, it can still send bogus **`TOUCH_DOWN`** or hover events that get misinterpreted as touches. 
> On some hardware, a “phantom stylus” can actually cause random click-like behavior, especially if the pen sensor is noisy or unshielded.
> 
> ---
> 
> ### How to check if it’s the pen device firing
> Run:
> ```bash
> libinput list-devices | grep -A5 "Wacom HID 5365 Pen stylus"
> ```
> Get the `/dev/input/eventXX` for the stylus.
> 
> Then:
> ```bash
> sudo libinput debug-events --device /dev/input/eventXX
> ```
> If you see events *without* a pen anywhere near the screen, the stylus input is noisy.
> 
> ---
> 
> ### Quick way to rule it out
> You can disable just the pen devices and keep touch working:
> 
> ```bash
> # Disable pen stylus
> xinput disable "Wacom HID 5365 Pen stylus"
> # Disable pen eraser (if present)
> xinput disable "Wacom HID 5365 Pen eraser"
> ```
> 
> To re-enable:
> ```bash
> xinput enable "Wacom HID 5365 Pen stylus"
> xinput enable "Wacom HID 5365 Pen eraser"
> ```
> 
> You can even make this permanent by adding it to your `~/.config/i3/config`:
> ```conf
> exec --no-startup-id xinput disable "Wacom HID 5365 Pen stylus"
> exec --no-startup-id xinput disable "Wacom HID 5365 Pen eraser"
> ```
> 
> ---
> 
> If you want, I can give you a **one-command tester** that logs touch and pen events side-by-side for a minute so you can see which device is actually producing the ghost inputs. 
> That would tell us immediately if it’s the “phantom pen” or the “finger touch” channel causing the issue. 
> 
> Do you want me to set that up?
<!-- UID: cc0055e4-eb78-4041-801f-8ae684ba99a6 -->

---




>[!nexus_user] **User** - 08/12/2025 at 9:57 AM
> I'm running the two commands now and it seems like every time the ghost movement happens there is a corresponding pen event.
<!-- UID: 420f0287-dd70-4c96-896a-2587dbe75faf -->




>[!nexus_agent] **Assistant** - 08/12/2025 at 9:57 AM
> Bingo — that means your “ghost touches” aren’t from the finger sensor at all, they’re coming from the **pen channel**. 
> That’s actually pretty common with certain Lenovo, Dell, and HP convertibles — the digitizer layer drifts or spits phantom pen coordinates even with no stylus nearby.
> 
> ---
> 
> ## **Fix: Disable the pen input devices**
> Since you never use a pen on this machine, you can kill those inputs entirely:
> 
> ```bash
> xinput disable "Wacom HID 5365 Pen stylus"
> xinput disable "Wacom HID 5365 Pen eraser"
> ```
> 
> That’ll stop them until you reboot.
> 
> ---
> 
> ## **Make it permanent in i3**
> Add to `~/.config/i3/config`:
> ```conf
> exec --no-startup-id xinput disable "Wacom HID 5365 Pen stylus"
> exec --no-startup-id xinput disable "Wacom HID 5365 Pen eraser"
> ```
> 
> ---
> 
> ## **If you want to keep pen support but kill the noise**
> You can instead *quarantine* the pen channel by raising its pressure threshold so high it never registers a stroke:
> 
> ```bash
> xsetwacom set "Wacom HID 5365 Pen stylus" Threshold 200
> xsetwacom set "Wacom HID 5365 Pen eraser" Threshold 200
> ```
> (Default is usually ~27; 200 basically means “press with Thor’s hammer.”)
> 
> ---
> 
> ## **Why this works**
> - The Wacom digitizer is always scanning for EMR pen signals.
> - If it’s noisy, it will report `PROXIMITY_IN` / `MOTION` / `PROXIMITY_OUT` events.
> - X11/libinput may interpret those as pointer motion or even clicks, depending on mapping.
> 
> By disabling or thresholding those devices, you cut the noise at the source — the finger touch sensor will still work normally.
> 
> ---
> 
> I can also give you a **udev rule** to blacklist just the pen devices so they never show up in X/libinput at all, which is cleaner than disabling them at session start. 
> 
> Do you want me to give you that blacklist rule? That way they’re gone even before i3 loads.
<!-- UID: fb93f40d-9e85-4834-9ba1-0347b0af6c9e -->

---


