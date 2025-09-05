---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "GLSL compiler missing error"
conversation_id: 68a1318b-58a8-8322-9493-32a1533951c2
create_time: 08/16/2025 at 8:34 PM
update_time: 08/17/2025 at 10:18 AM
---

# Title: GLSL compiler missing error

Created: 08/16/2025 at 8:34 PM
Last Updated: 08/17/2025 at 10:18 AM
Chat URL: https://chat.openai.com/c/68a1318b-58a8-8322-9493-32a1533951c2


>[!nexus_user] **User** - 08/16/2025 at 8:34 PM
> src/meson.build:43:16: ERROR: Program 'glslang glslangValidator' not found or not executable
<!-- UID: 6577a3e7-17a4-4877-93be-ad651ca60623 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 8:34 PM
> You’re missing the GLSL → SPIR-V compiler that Meson expects to find. Install it, verify, then reconfigure.
> 
> ### Ubuntu (your box)
> ```bash
> sudo apt update
> sudo apt install glslang-tools # provides `glslangValidator` (and `glslang`)
> which glslangValidator && glslangValidator --version
> ```
> 
> Then reconfigure (or wipe) your Meson build:
> ```bash
> meson setup build --reconfigure
> # if it still complains due to cache:
> meson setup build --wipe # or just rm -rf build && meson setup build
> meson compile -C build
> ```
> 
> ### If you prefer the Vulkan SDK route (alternative)
> Add the SDK’s `bin` to your `PATH` so Meson can find `glslangValidator`:
> ```bash
> export VULKAN_SDK=/opt/vulkan-sdk-<version>-x86_64
> export PATH="$VULKAN_SDK/bin:$PATH"
> glslangValidator --version
> ```
> 
> ### Extra (do it right, not just quick)
> You’re compiling stuff like `gamescope`/`wlroots`—script a preflight so you don’t hit missing tools mid-build:
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> need_cmd(){ command -v "$1" >/dev/null || { echo "Missing: $1"; exit 1; }; }
> 
> # CLI tools we rely on during the build
> for bin in meson ninja cmake pkg-config glslangValidator ; do need_cmd "$bin"; done
> 
> # pkg-config libs you’ll almost certainly need in this stack
> for pc in wayland-client wayland-server xcb xcb-icccm x11 xrandr \
>  xdamage xcomposite xrender xext xfixes xkbcommon \
>  vulkan libdrm gbm libpipewire-0.3 libinput pixman-1; do
>  pkg-config --exists "$pc" || { echo "Missing .pc: $pc"; exit 1; }
> done
> echo "All good."
> ```
> 
> Run it; install whatever it flags (e.g., `sudo apt install glslang-tools libxcb-icccm4-dev …`) and then rebuild.
> 
> Does that make sense, or do you want me to sanity-check the rest of your dependency set for this build too?
<!-- UID: 49fb4962-7dd2-4262-8606-0738bfd8a886 -->

---




>[!nexus_user] **User** - 08/16/2025 at 8:40 PM
> That would be great if it was clear what the build dependencies were.... your command goes all good! But my build still breaks. You're just going down the list of what we've already hit, and pretending to be helpful with that.
> 
> src/meson.build:125:16: ERROR: Dependency "benchmark" not found, tried pkgconfig and cmake
<!-- UID: 881b050e-c852-45d9-bade-6390163e3042 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 8:40 PM
> Yep—`benchmark` there is **Google Benchmark**. On Ubuntu it’s the `libbenchmark-dev` package (pkg-config name: `benchmark`). Install it or vendor it, then wipe/reconfigure Meson.
> 
> ## Fix (Ubuntu)
> ```bash
> sudo apt update
> sudo apt install libbenchmark-dev # provides benchmark.pc + CMake config
> # sanity-check both finders:
> pkg-config --modversion benchmark || true
> cmake -P /usr/share/cmake-*/Modules/CMakeFindPackageMode.cmake \
>  -DNAME=benchmark -DLANGUAGE=CXX -DMODE=EXIST || true
> 
> meson setup build --wipe
> meson compile -C build
> ```
> 
> Why this is the right thing: gamescope/wlroots builds look for a dep literally named `benchmark` and expect either pkg-config or CMake to resolve it; distros ship that as `libbenchmark-dev`. You can see other builders hitting (and solving) the exact dep with Google Benchmark on recent Ubuntu/Mint guides and distro-specific notes. citeturn2view0
> 
> ## If `libbenchmark-dev` isn’t available (or you want latest)
> Build + install upstream and make it discoverable:
> 
> ```bash
> git clone --depth=1 https://github.com/google/benchmark.git
> cd benchmark
> cmake -S . -B build \
>  -DBENCHMARK_DOWNLOAD_DEPENDENCIES=ON \
>  -DCMAKE_BUILD_TYPE=Release \
>  -DBUILD_SHARED_LIBS=ON \
>  -DCMAKE_INSTALL_PREFIX=/usr/local
> cmake --build build -j"$(nproc)"
> sudo cmake --install build
> 
> # ensure Meson can find it (CMake + pkg-config if provided by your build)
> test -d /usr/local/lib/cmake/benchmark || true
> cmake --find-package -DNAME=benchmark -DLANGUAGE=CXX -DMODE=EXIST
> meson setup build --wipe && meson compile -C build
> ```
> 
> If Meson still can’t see it, point it explicitly to your prefix:
> ```bash
> export CMAKE_PREFIX_PATH="/usr/local:${CMAKE_PREFIX_PATH:-}"
> export PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:/usr/local/lib/x86_64-linux-gnu/pkgconfig:${PKG_CONFIG_PATH:-}"
> meson setup build --wipe && meson compile -C build
> ```
> 
> ## Nuclear option (you want to build *now*, benchmarks be damned)
> If this project only uses Google Benchmark for microbench targets, you can bypass it:
> 
> - Quick hack: open `src/meson.build` around line ~125 and change
>  ```meson
>  dependency('benchmark')
>  ```
>  to
>  ```meson
>  benchmark_dep = dependency('benchmark', required: false)
>  ```
>  and guard any `executable(...)`/`benchmark(...)` using it with `if benchmark_dep.found()` or just comment those targets out. Then:
>  ```bash
>  meson setup build --wipe && meson compile -C build
>  ```
> 
> That said, the clean path is installing `libbenchmark-dev` so you don’t keep whacking moles. Want me to scan your `meson-log.txt` next for the *next* blocker and hand you a one-liner to satisfy it?
<!-- UID: 3647170a-6d43-43eb-8674-49a2b23e478d -->

---




>[!nexus_user] **User** - 08/16/2025 at 8:43 PM
> It seems to have built... now what.
<!-- UID: 4a295257-637a-4534-9af7-fb269f68b1b5 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 8:43 PM
> Nice—binary built means you can actually use it now. Here’s the “do it right” path, not just “it runs on my machine.”
> 
> ### 1) Smoke-test from the build tree
> ```bash
> # in your repo root
> ./build/src/gamescope -- vkcube
> ./build/src/gamescope --help | head -n 40
> ```
> You should see a nested window running `vkcube`; `--help` shows the supported flags. citeturn3view0
> 
> ### 2) Install cleanly (or stage a .deb later)
> ```bash
> # default installs to /usr/local
> sudo meson install -C build --skip-subprojects
> # (optional) stage to a packaging root instead of installing system-wide:
> meson install -C build --destdir "$PWD/pkgroot"
> ```
> Meson’s `install` and `--destdir` are the intended way; use the staged tree to build a .deb with `dpkg-deb` if you care about reproducibility. cite
> 
> ### 3) Quick usage patterns
> - **Run a single app:** 
>  ```bash
>  gamescope -W 1920 -H 1080 -r 60 -- supertuxkart
>  ``` 
>  (Nested on any X11 or Wayland desktop.) citeturn3view0
> - **Steam (per-game Launch Options):** 
>  ```
>  gamescope -h 720 -H 1440 -S integer -- %command%
>  # or FPS cap:
>  gamescope -r 30 -- %command%
>  ```
>  Use `-- %command%` so Steam injects the game after your flags. citeturn3view0
> - **Big Picture under Gamescope (wrap Steam itself):** 
>  ```bash
>  gamescope -f -e -U -- steam -tenfoot
>  ``` cite
> 
> ### 4) NVIDIA/Hybrid note (if you want dGPU)
> On PRIME hybrid setups, force the dGPU when launching:
> ```bash
> prime-run gamescope -- vkcube # if prime-run exists on your distro
> ```
> (Equivalent env‐var methods also work.) cite
> 
> ### 5) Priority/caps (micro-stutter fix, with a caveat)
> If you see `No CAP_SYS_NICE, falling back…`, grant the capability:
> ```bash
> sudo setcap 'CAP_SYS_NICE=eip' "$(command -v gamescope)"
> ```
> This improves scheduling, but in some setups it has interacted badly with Steam overlay—easy to revert by re-installing or clearing the cap. cite
> 
> ### 6) Wire it into i3 (so you’ll actually use it)
> Add a couple of bindings so testing doesn’t require typing:
> ```i3
> # Open a test cube under Gamescope
> bindsym $mod+g exec --no-startup-id gamescope -W 1280 -H 720 -- vkcube
> 
> # Wrap Steam in Gamescope (toggle as needed)
> bindsym $mod+Shift+g exec --no-startup-id gamescope -f -e -U -- steam -tenfoot
> ```
> (You can still pass per-game Launch Options later.) citeturn3view0
> 
> ### 7) Sanity/diagnostics you’ll thank yourself for
> ```bash
> which gamescope && gamescope --version || true # confirm path
> vulkaninfo | grep -i "GPU id\|device" | head # which GPU Vulkan sees
> ldd "$(command -v gamescope)" | egrep 'drm|pipewire|vulkan' || true
> ```
> If `vkcube` under `gamescope` fails, it’s almost always the Vulkan stack or a GPU-selection issue. The README has a short options reference; use `--help` for the full matrix. citeturn3view0
> 
> ---
> 
> If that all works, the next step is **deciding your default workflows** (Steam-wide wrapper vs per-game flags) and capturing your chosen flags in a shell wrapper in `~/bin/gs` so you’re not re-typing. When you hit oddities (HDR/VRR, hybrid quirks, FSR/NIS behavior), we’ll tune flags based on the exact symptoms.
<!-- UID: 6d2586c8-2a7d-488c-8464-d4d22bacb0e4 -->

---




>[!nexus_user] **User** - 08/16/2025 at 8:57 PM
> err@err-Stealth-16-AI-Studio-A1VGG:~$ __NV_PRIME_RENDER_OFFLOAD=1 __VK_LAYER_NV_optimus=NVIDIA_only gamescope -W 2560 -H 1600 -- Warframe
> No CAP_SYS_NICE, falling back to regular-priority compute and threads.
> Performance will be affected.
> wlserver: [backend/headless/backend.c:68] Creating headless backend
> vulkan: selecting physical device 'NVIDIA GeForce RTX 4070 Laptop GPU': queue family 2
> vulkan: physical device supports DRM format modifiers
> vulkan: vkGetPhysicalDeviceFormatProperties2 returned zero modifiers for DRM format 0x38344241 (VkResult: 0)
> vulkan: vkGetPhysicalDeviceFormatProperties2 returned zero modifiers for DRM format 0x38344258 (VkResult: 0)
> vulkan: supported DRM formats for sampling usage:
> vulkan: AR24 (0x34325241)
> vulkan: XR24 (0x34325258)
> vulkan: AB24 (0x34324241)
> vulkan: XB24 (0x34324258)
> vulkan: NV12 (0x3231564E)
> vulkan: AB4H (0x48344241)
> vulkan: XB4H (0x48344258)
> vulkan: AB30 (0x30334241)
> vulkan: XB30 (0x30334258)
> vulkan: AR30 (0x30335241)
> vulkan: XR30 (0x30335258)
> wlserver: Running compositor on wayland display 'gamescope-0'
> wlserver: [backend/headless/backend.c:16] Starting headless backend
> wlserver: [xwayland/server.c:108] Starting Xwayland on :0
> The XKEYBOARD keymap compiler (xkbcomp) reports:
> > Warning: Could not resolve keysym XF86CameraAccessEnable
> > Warning: Could not resolve keysym XF86CameraAccessDisable
> > Warning: Could not resolve keysym XF86CameraAccessToggle
> > Warning: Could not resolve keysym XF86NextElement
> > Warning: Could not resolve keysym XF86PreviousElement
> > Warning: Could not resolve keysym XF86AutopilotEngageToggle
> > Warning: Could not resolve keysym XF86MarkWaypoint
> > Warning: Could not resolve keysym XF86Sos
> > Warning: Could not resolve keysym XF86NavChart
> > Warning: Could not resolve keysym XF86FishingChart
> > Warning: Could not resolve keysym XF86SingleRangeRadar
> > Warning: Could not resolve keysym XF86DualRangeRadar
> > Warning: Could not resolve keysym XF86RadarOverlay
> > Warning: Could not resolve keysym XF86TraditionalSonar
> > Warning: Could not resolve keysym XF86ClearvuSonar
> > Warning: Could not resolve keysym XF86SidevuSonar
> > Warning: Could not resolve keysym XF86NavInfo
> Errors from xkbcomp are not fatal to the X server
> wlserver: [types/wlr_compositor.c:681] New wlr_surface 0x5ef6bc3ba840 (res 0x5ef6bc8806f0)
> wlserver: [xwayland/server.c:273] Xserver is ready
> pipewire: stream state changed: connecting
> pipewire: stream state changed: paused
> pipewire: stream available on node ID: 104
> xwm: execvp failed: No such file or directory
> ^Cgamescope: received kill signal, terminating!
> err@err-Stealth-16-AI-Studio-A1VGG:~$
<!-- UID: 80d42730-579c-4c28-badc-f606f6d082f0 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 8:57 PM
> The key line is this:
> 
> > `xwm: execvp failed: No such file or directory`
> 
> That’s not a graphics problem; it means the **command after `--` couldn’t be executed**. You asked Gamescope to run `Warframe`, but Warframe is a **Steam+Proton title**—there’s no `Warframe` binary on your `$PATH`. You need to launch it *through Steam*.
> 
> ### Do it right
> 
> #### 1) One-shot from terminal (Steam native)
> ```bash
> # dGPU offload (your env), wrap Steam, tell Steam to launch Warframe (AppID 230410)
> __NV_PRIME_RENDER_OFFLOAD=1 __VK_LAYER_NV_optimus=NVIDIA_only \
> gamescope -W 2560 -H 1600 -r 60 -- steam -applaunch 230410
> ```
> 
> #### If you use **Flatpak Steam**
> ```bash
> # pass the offload env into the container
> gamescope -W 2560 -H 1600 -r 60 -- \
> flatpak run --env=__NV_PRIME_RENDER_OFFLOAD=1 --env=__VK_LAYER_NV_optimus=NVIDIA_only \
> com.valvesoftware.Steam -applaunch 230410
> ```
> 
> (If you use the Snap, adjust to `snap run steam …`.)
> 
> #### 2) The Steam way (recommended)
> In Steam’s **Warframe → Properties → Launch Options**:
> ```
> gamescope -W 2560 -H 1600 -r 60 -f -- %command%
> ```
> Gamescope will wrap the game whenever you start it from Steam. `%command%` is crucial—that’s Steam’s actual Proton launch line.
> 
> ### Sanity checks (so you’re not guessing)
> - Prove the child command is found:
>  ```bash
>  command -v steam || flatpak info com.valvesoftware.Steam
>  ```
> - Prove Gamescope can run *anything*:
>  ```bash
>  gamescope -- vkcube # should pop a cube
>  ```
> - The `xkbcomp` warnings are harmless. 
> - PipeWire “paused” is normal until audio starts.
> - That “No CAP_SYS_NICE…” line = perf hint. Give Gamescope the cap:
>  ```bash
>  sudo setcap 'CAP_SYS_NICE=eip' "$(command -v gamescope)"
>  ```
> 
> ### Extra mile (so it’s muscle memory)
> Make a wrapper that always offloads to the 4070 and wraps Steam:
> 
> ```bash
> mkdir -p ~/.local/bin
> cat > ~/.local/bin/gs <<'EOF'
> #!/usr/bin/env bash
> set -euo pipefail
> export __NV_PRIME_RENDER_OFFLOAD=1
> export __VK_LAYER_NV_optimus=NVIDIA_only
> exec gamescope -f -r 60 "$@" -- steam -applaunch "$1"
> EOF
> chmod +x ~/.local/bin/gs
> ```
> 
> Now launch Warframe with:
> ```bash
> gs 230410 # add your own aliases for other AppIDs
> ```
> 
> Or bind it in i3:
> ```i3
> # $mod+w -> Warframe under Gamescope
> bindsym $mod+w exec --no-startup-id gs 230410
> ```
> 
> If that still doesn’t start, paste the **Steam/Proton** log or the Gamescope stdout after the `-- steam -applaunch 230410` run. The next suspects would be: using the wrong Steam package (not in PATH), Flatpak env not passed, or Proton-specific flags we can set per-game.
<!-- UID: 15328ce8-9e20-44d2-8bc6-88dba1a1bf5d -->

---




>[!nexus_user] **User** - 08/16/2025 at 9:06 PM
> I got the game to run once.... at 1200 x 720, but everything was black except ui stuff.... all the models just had totally black textures... so it was nothing. I couldnt play that..
> 
> Here's what it looks like when I run it the way you sent me!
> 
> No CAP_SYS_NICE, falling back to regular-priority compute and threads.
> Performance will be affected.
> wlserver: [backend/headless/backend.c:68] Creating headless backend
> Adding process 46030 for gameID 230410
> vulkan: selecting physical device 'NVIDIA GeForce RTX 4070 Laptop GPU': queue family 2
> vulkan: physical device supports DRM format modifiers
> Fossilize INFO: Overriding serialization path: "/home/err/.steam/debian-installation/steamapps/shadercache/230410/fozpipelinesv6/steamapprun_pipeline_cache".
> vulkan: vkGetPhysicalDeviceFormatProperties2 returned zero modifiers for DRM format 0x38344241 (VkResult: 0)
> 
> We are still waiting.
> vulkan: vkGetPhysicalDeviceFormatProperties2 returned zero modifiers for DRM format 0x38344258 (VkResult: 0)
> vulkan: supported DRM formats for sampling usage:
> vulkan: AR24 (0x34325241)
> vulkan: XR24 (0x34325258)
> vulkan: AB24 (0x34324241)
> vulkan: XB24 (0x34324258)
> vulkan: NV12 (0x3231564E)
> vulkan: AB4H (0x48344241)
> vulkan: XB4H (0x48344258)
> vulkan: AB30 (0x30334241)
> vulkan: XB30 (0x30334258)
> vulkan: AR30 (0x30335241)
> vulkan: XR30 (0x30335258)
> wlserver: Running compositor on wayland display 'gamescope-0'
> wlserver: [backend/headless/backend.c:16] Starting headless backend
> wlserver: [xwayland/server.c:108] Starting Xwayland on :0
> ERROR: ld.so: object '/home/err/.steam/debian-installation/ubuntu12_32/gameoverlayrenderer.so' from LD_PRELOAD cannot be preloaded (wrong ELF class: ELFCLASS32): ignored.
> Adding process 46085 for gameID 230410
> ERROR: ld.so: object '/home/err/.steam/debian-installation/ubuntu12_32/gameoverlayrenderer.so' from LD_PRELOAD cannot be preloaded (wrong ELF class: ELFCLASS32): ignored.
> ERROR: ld.so: object '/home/err/.steam/debian-installation/ubuntu12_32/gameoverlayrenderer.so' from LD_PRELOAD cannot be preloaded (wrong ELF class: ELFCLASS32): ignored.
> The XKEYBOARD keymap compiler (xkbcomp) reports:
> > Warning: Could not resolve keysym XF86CameraAccessEnable
> > Warning: Could not resolve keysym XF86CameraAccessDisable
> > Warning: Could not resolve keysym XF86CameraAccessToggle
> > Warning: Could not resolve keysym XF86NextElement
> > Warning: Could not resolve keysym XF86PreviousElement
> > Warning: Could not resolve keysym XF86AutopilotEngageToggle
> > Warning: Could not resolve keysym XF86MarkWaypoint
> > Warning: Could not resolve keysym XF86Sos
> > Warning: Could not resolve keysym XF86NavChart
> > Warning: Could not resolve keysym XF86FishingChart
> > Warning: Could not resolve keysym XF86SingleRangeRadar
> > Warning: Could not resolve keysym XF86DualRangeRadar
> > Warning: Could not resolve keysym XF86RadarOverlay
> > Warning: Could not resolve keysym XF86TraditionalSonar
> > Warning: Could not resolve keysym XF86ClearvuSonar
> > Warning: Could not resolve keysym XF86SidevuSonar
> > Warning: Could not resolve keysym XF86NavInfo
> Errors from xkbcomp are not fatal to the X server
> wlserver: [types/wlr_compositor.c:681] New wlr_surface 0x5d1cb9755dc0 (res 0x5d1cb9730f50)
> wlserver: [xwayland/server.c:273] Xserver is ready
> pipewire: stream state changed: connecting
> pipewire: stream state changed: paused
> pipewire: stream available on node ID: 93
> Adding process 46087 for gameID 230410
> Adding process 46088 for gameID 230410
> [2025-08-16 21:02:59] Background update loop checking for update. . .
> [2025-08-16 21:02:59] Checking for available updates...
> [2025-08-16 21:02:59] Downloading manifest: https://client-update.fastly.steamstatic.com/steam_client_ubuntu12
> [2025-08-16 21:02:59] Manifest download: send request
> [2025-08-16 21:02:59] Manifest download: waiting for download to finish
> [2025-08-16 21:03:00] Manifest download: finished
> [2025-08-16 21:03:00] Download skipped by HTTP 304 Not Modified
> [2025-08-16 21:03:00] Nothing to do
<!-- UID: 977a3809-dc8c-443c-9864-f1c825e82426 -->




>[!nexus_agent] **Assistant** - 08/16/2025 at 9:07 PM
> Yep—this smells like a known combo of (1) Steam overlay injection + (2) Gamescope’s WSI layer on NVIDIA + (3) Warframe’s DX12/“Enhanced” path on 40-series. Let’s flip the three switches that actually move needles, then we’ll do a clean repro.
> 
> ## Do these 5 changes (in order)
> 
> 1) **Disable Steam Overlay for Warframe**
> - Steam → Warframe → Properties → *Enable the Steam Overlay while in-game* → **off**. 
> - (Your log shows the 32-bit overlay trying to preload into a 64-bit process: the `wrong ELF class` line. Overlay + Gamescope is a common footgun.) cite
> 
> 2) **Disable Gamescope’s WSI layer (NVIDIA quirk)**
> - This one fixes black/white/blank rendering for some titles on NVIDIA. 
>  ```bash
>  ENABLE_GAMESCOPE_WSI=0
>  ```
>  (It’s a documented workaround; NVIDIA+Gamescope issues have tracked this a bunch.) cite
> 
> 3) **Force Warframe to DX11 / “Classic” engine (not DX12/Enhanced)**
> - Launch once to the **launcher**, click the gear, set **Graphics API: DX11** and **Graphics Engine: Classic**. 
> - If you can’t reach the launcher UI, nuke/reset config in the Proton prefix so it comes up sane:
>  ```bash
>  # back up + reset Warframe’s config/prefix (keeps the game install)
>  APPID=230410
>  cd ~/.local/share/Steam/steamapps
>  mv compatdata/$APPID{,.bak.$(date +%s)} # reset Proton prefix
>  # optional: clear shader cache to avoid stale pipelines
>  rm -rf shadercache/$APPID
>  ```
>  (DX12 on 30/40-series has had rendering glitches; lots of players report stability on DX11.) cite
> 
> 4) **Use a “known good” Proton**
> - Start with **Proton 9.0-x** or **Proton Experimental**. If you still see black geometry, try **GE-Proton** (ProtonUp-Qt) — it carries fixes that specifically mention Warframe/NVIDIA DXVK rendering. cite
> 
> 5) **Give Gamescope the scheduler cap (optional but helps)**
> ```bash
> sudo setcap 'CAP_SYS_NICE=eip' "$(command -v gamescope)"
> ```
> 
> ---
> 
> ## Launch line (lean + reproducible)
> 
> Try this exact run from a terminal (no HDR flags, no overlays, WSI off, 4070 offload):
> 
> ```bash
> STEAM_DISABLE_OVERLAY=1 \
> ENABLE_GAMESCOPE_WSI=0 \
> __NV_PRIME_RENDER_OFFLOAD=1 __VK_LAYER_NV_optimus=NVIDIA_only \
> gamescope -f -W 2560 -H 1600 -w 2560 -h 1600 -r 60 -- \
> steam -applaunch 230410
> ```
> 
> Notes:
> - `-W/-H` = outer Gamescope surface; `-w/-h` = game render resolution (per upstream docs). cite
> - If you’re on Flatpak Steam, wrap the `steam` part with `flatpak run --env=… com.valvesoftware.Steam …` as we did earlier.
> 
> ---
> 
> ## If you still get “UI only, world black” after that
> 
> Hit the toggles below one at a time and re-test after each:
> 
> - **Confirm DX11 actually stuck** (Enhanced/DX12 likes to sneak back on upgrades). Reopen launcher → gear. If you can’t, delete `compatdata/230410` again; Warframe’s settings live in the prefix (EE.cfg under `%LOCALAPPDATA%/Warframe` inside the Proton prefix). cite
> - **Switch Proton**: Experimental ↔ 9.0-x ↔ latest GE. (ProtonDB reports success on Proton 9/Experimental for Warframe; GE has targeted fixes.) cite
> - **Keep WSI disabled** (`ENABLE_GAMESCOPE_WSI=0`). Many black/white cases go away with this alone on NVIDIA. cite
> - **Clear shader caches** (you saw Fossilize path in your log): 
>  `~/.steam/debian-installation/steamapps/shadercache/230410/` — remove it to force a rebuild.
> - **Hard-disable all overlays/hooks** for this title (Steam overlay already off; also ensure MangoHUD, Reshade, etc. are off).
> 
> ---
> 
> ## Want to be thorough? Do a 6-minute bisect run
> 
> 1. **Baseline (no Gamescope):**
>  ```bash
>  STEAM_DISABLE_OVERLAY=1 steam -applaunch 230410
>  ```
>  - Set **DX11/Classic** in the launcher. Quit.
> 
> 2. **Add Gamescope only:**
>  ```bash
>  ENABLE_GAMESCOPE_WSI=0 gamescope -f -- steam -applaunch 230410
>  ```
>  If this is good, the offload or scaling flags were the problem; if it’s bad, WSI was likely the fix you needed (keep it at `0`).
> 
> 3. **Add NVIDIA offload back:**
>  ```bash
>  ENABLE_GAMESCOPE_WSI=0 __NV_PRIME_RENDER_OFFLOAD=1 __VK_LAYER_NV_optimus=NVIDIA_only \
>  gamescope -f -- steam -applaunch 230410
>  ```
> 
> 4. **Finally add your target res/fps caps** (`-W/-H/-w/-h/-r`).
> 
> At any failing step: swap Proton (9 ↔ Experimental ↔ GE) and retry before changing anything else.
> 
> ---
> 
> ## If we need logs next
> 
> Run once with:
> ```bash
> PROTON_LOG=1 DXVK_HUD=devinfo,fps \
> ENABLE_GAMESCOPE_WSI=0 STEAM_DISABLE_OVERLAY=1 \
> __NV_PRIME_RENDER_OFFLOAD=1 __VK_LAYER_NV_optimus=NVIDIA_only \
> gamescope -f -- steam -applaunch 230410
> ```
> That produces `steam-230410.log` in `~`. If it still renders UI-only, we’ll scan for DXVK/vkd3d init, swapchain format, or validation errors and tune from there.
> 
> ---
> 
> I expect **DX11 + Overlay off + `ENABLE_GAMESCOPE_WSI=0`** to get you a playable picture on the 4070 under Gamescope. If it does, we can push further (FSR/NIS flags, frame pacing, VRR, capture-friendly settings) once you confirm frames are actually visible.
<!-- UID: 5094495f-50e7-4acf-8233-0b30521efa17 -->

---


