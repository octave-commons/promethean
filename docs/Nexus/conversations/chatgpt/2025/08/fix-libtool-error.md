---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Fix libtool error"
conversation_id: 68af50f6-302c-8320-a16a-14ebd178afc4
create_time: 08/27/2025 at 1:39 PM
update_time: 08/27/2025 at 1:42 PM
---

# Title: Fix libtool error

Created: 08/27/2025 at 1:39 PM
Last Updated: 08/27/2025 at 1:42 PM
Chat URL: https://chat.openai.com/c/68af50f6-302c-8320-a16a-14ebd178afc4


>[!nexus_user] **User** - 08/27/2025 at 1:39 PM
> -- System libvterm not found: libvterm will be downloaded and compiled as part of the build process
> CMake Error at CMakeLists.txt:71 (message):
>  libtool not found. Please install libtool
> 
> -- Configuring incomplete, errors occurred!
> make: *** No targets specified and no makefile found. Stop.
> /home/err/.emacs.d/elpa/30.2/develop/vterm-20241218-- System libvterm not found: libvterm will be downloaded and compiled as part of the build process
> CMake Error at CMakeLists.txt:71 (message):
>  libtool not found. Please install libtool
> 
> -- Configuring incomplete, errors occurred!
> make: *** No targets specified and no makefile found. Stop.
> /home/err/.emacs.d/elpa/30.2/develop/vterm-20241218.331
> .331
> 
> But I installed libtool
<!-- UID: 08caec21-4e3d-4a74-a260-c62701d716ff -->




>[!nexus_agent] **Assistant** - 08/27/2025 at 1:39 PM
> Yeah, that error is classic Debian/Ubuntu packaging weirdness. You probably installed `libtool` (the *scripts*), but CMake is looking for the **binary** `libtool`, which on Debian/Ubuntu actually lives in **`libtool-bin`**. Without it, vterm’s bundled libvterm build bails.
> 
> Here’s the fastest way to fix it and force a clean rebuild of vterm:
> 
> ```bash
> # 1) Install the right build deps (Ubuntu/Debian)
> sudo apt update
> sudo apt install -y \
>  build-essential cmake pkg-config \
>  libtool libtool-bin autoconf automake \
>  libvterm-dev
> 
> # ^ `libtool-bin` is the key one. `libvterm-dev` is optional but speeds things up
> # and avoids the bundled download/build.
> 
> # 2) Nuke stale build dirs so a broken configure cache doesn’t keep failing
> rm -rf ~/.emacs.d/elpa/*/vterm-*/build \
>  ~/.emacs.d/elpa/*/vterm-*/elisp/.cache 2>/dev/null || true
> 
> # 3) Rebuild the vterm module (pick ONE of these)
> 
> # (a) From inside Emacs:
> # M-x vterm-toggle OR M-x vterm
> # If it prompts to build, say yes. Or explicitly:
> # M-: (vterm-module-compile) RET
> 
> # (b) From a TTY shell (non-interactive):
> cd ~/.emacs.d/elpa/*/vterm-*/ && make clean && make
> ```
> 
> If you still see “libtool not found,” verify it’s actually on PATH:
> 
> ```bash
> which libtool || echo "missing"
> libtool --version || echo "no version"
> ```
> 
> If that prints “missing,” your install didn’t land or your shell isn’t reloaded. Open a new shell or `hash -r` and try again.
> 
> ### Optional: Force using the system libvterm
> If you want to skip the submodule build entirely:
> 
> ```bash
> export VTERM_USE_SYSTEM_LIBVTERM=1
> cd ~/.emacs.d/elpa/*/vterm-*/ && make clean && make
> ```
> 
> ### Sanity checks (run these if it still won’t build)
> ```bash
> # Does Emacs support modules at all?
> emacs -Q --batch --eval '(princ (format "module-file-suffix=%S\n" module-file-suffix))'
> # Expect: module-file-suffix=".so" (not nil)
> 
> # Check toolchain bits:
> gcc --version
> cmake --version
> pkg-config --version
> ```
> 
> ### If you’re on a different distro
> - **Fedora/RHEL**: `sudo dnf install -y gcc-c++ cmake libtool libvterm-devel pkgconfig autoconf automake`
> - **Arch**: `sudo pacman -S --needed base-devel cmake libtool libvterm`
> 
> ### Why this happened
> - Debian/Ubuntu split `libtool` into two packages. You installed `libtool`; CMake wants the binary from `libtool-bin`. Without it, vterm’s CMakeLists quits early, leaving no Makefile → “No targets specified.”
> 
> Ping me with the output of:
> ```
> which libtool; libtool --version; emacs -Q --batch --eval '(princ module-file-suffix)'
> ```
> if it’s still being stubborn, and we’ll go one level deeper (PATH, shell init, Emacs snap vs apt, etc.).
> 
> #emacs #vterm #ubuntu #build-tools #debugging
<!-- UID: c967b81c-45d2-40ce-91af-2e925d8ec1ab -->

---


