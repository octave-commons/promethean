---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Emacs gpu acceleration"
conversation_id: 68b7146f-2d78-8331-960b-44ea671c7727
create_time: 09/02/2025 at 10:59 AM
update_time: 09/02/2025 at 11:01 AM
---

# Title: Emacs gpu acceleration

Created: 09/02/2025 at 10:59 AM
Last Updated: 09/02/2025 at 11:01 AM
Chat URL: https://chat.openai.com/c/68b7146f-2d78-8331-960b-44ea671c7727


>[!nexus_user] **User** - 09/02/2025 at 10:59 AM
> emacs gpu acceleration
<!-- UID: 386d0ef8-9fd3-4846-96b6-5f46ff26eedf -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 11:00 AM
> # Emacs + GPU acceleration: what’s real and what’s wishful thinking
> 
> Short version: **vanilla GNU Emacs does not have a GPU-accelerated renderer**. Text is drawn via X11/GTK/Cairo on Linux/Unix, NS/AppKit on macOS, and GDI on Windows. There are a few edge paths and workarounds, but no official, cross-platform “GPU Emacs.”
> 
> Below is the practical lay of the land, with what actually helps.
> 
> ---
> 
> ## What exists today
> 
> 1) **macOS “Emacs Mac Port” (aka `emacs-mac`) has an experimental Metal backend** 
> The third-party Mac Port (not upstream GNU Emacs) can be built with `--with-mac-metal`, which swaps parts of the rendering path to Apple’s GPU API. Even the maintainer noted it isn’t a clear win and **disabled it by default** (60 fps is achievable without it on M1/M2). Translation: interesting, but not a silver bullet. cite
> 
> 2) **emacs-ng experimented with Mozilla WebRender (GPU)** 
> `emacs-ng` tried a GPU path via WebRender. It’s experimental and not production-grade Emacs. Good proof-of-concept, not something I’d bet a daily workflow on. cite
> 
> 3) **Terminals with GPU rendering (indirect benefit)** 
> If you run **terminal Emacs (`emacs -nw`) inside a GPU-accelerated terminal** like Kitty, Alacritty, WezTerm, or Ghostty, **the terminal** handles GPU-backed text drawing. Emacs itself is still TTY, but screen updates feel snappier and scale better on HiDPI. This is the most reliable “GPU help” for Emacs today. cite
> 
> 4) **GTK4 would bring hardware acceleration, but Emacs uses GTK3** 
> GTK4’s rendering stack (GSK) is GPU-backed. Emacs’s GTK build is still GTK3, so it doesn’t benefit yet. People keep asking for a GTK4 port; it’s not here. cite
> 
> ---
> 
> ## What I’d actually do (practical options)
> 
> ### A) macOS and you want the smoothest GUI
> - Try **Emacs Mac Port** and test both defaults and Metal: 
>  - Install from source if you want the Metal toggle (`--with-mac-metal`) since it’s not default. 
>  - Measure: typing latency, scrolling, CPU usage on your fonts & themes. 
>  The maintainer’s own note: Metal didn’t reduce CPU at 60 fps on M1, hence disabled by default. Don’t assume it’s faster—measure. cite
> 
> ### B) Linux/*BSD and you want “GPU feel” with the fewest surprises
> - Run **Emacs in a GPU terminal**:
>  - **Kitty** (GPU + rich features) or **Alacritty** (OpenGL). 
>  - Launch `emacs -nw` in that terminal. 
>  - Benefit: fast, GPU-driven text drawing, less GUI jank on HiDPI, fewer compositor issues. cite
> 
> ### C) Wayland users
> - **pgtk Emacs** (the Wayland/GTK build) can feel nicer, but it’s **not GPU-accelerated** and can lag at 4K if you chase 60 fps scrolling. If you see that, switch to the TTY strategy above. Expect real gains only when/if Emacs moves to **GTK4**. cite
> 
> ### D) Curious/tolerant of breakage?
> - **emacs-ng (WebRender)**: interesting to try in a spare profile, but don’t expect stability or upstream support. cite
> 
> ---
> 
> ## Quick setup notes
> 
> - **Kitty** (GPU terminal): install and run Emacs inside it.
>  - Site & docs: “The fast, feature-rich, GPU based terminal.” cite
> - **Alacritty** (OpenGL terminal): likewise. 
>  - Official site and project: “A cross-platform, OpenGL terminal emulator.” cite
> - **Emacs Mac Port**:
>  - Use the Railwaycat tap if you want that build; compile from source to flip Metal. Measure before keeping it. cite
> 
> ---
> 
> ## Bottom line
> 
> If you came here hoping for a switch to flip in GNU Emacs to “use my GPU now,” that doesn’t exist. The **least-pain path** to GPU-assisted smoothness is **running terminal Emacs inside a GPU-accelerated terminal**. On macOS, the **Mac Port** is worth testing, but **Metal isn’t a guaranteed upgrade**.
> 
> If/when Emacs gets a **GTK4** GUI backend, that’s when real, official GPU acceleration becomes plausible.
> 
> #hashtags #emacs #performance #gpu #wayland #macos #linux #kitty #alacritty #gtk4
<!-- UID: 252646c5-3d59-492e-85f1-a54e28de1e30 -->

---


