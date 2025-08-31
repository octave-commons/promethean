---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Find window under mouse"
conversation_id: 68994c21-0f44-8331-8ea5-f2958475f183
create_time: 08/10/2025 at 8:49 PM
update_time: 08/23/2025 at 6:29 PM
---

# Title: Find window under mouse

Created: 08/10/2025 at 8:49 PM
Last Updated: 08/23/2025 at 6:29 PM
Chat URL: https://chat.openai.com/c/68994c21-0f44-8331-8ea5-f2958475f183


>[!nexus_user] **User** - 08/10/2025 at 8:49 PM
> I keep forgetting, how do I find out what window my mouse is over with x... xinput? something
<!-- UID: 4aad660e-5320-4917-8996-0afd7433c9df -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 8:49 PM
> Quickest way (no clicking):
> 
> ```bash
> # 1) Get the window under the mouse
> xdotool getmouselocation --shell
> # -> you'll see WINDOW=12345678 among the vars
> 
> # 2) Inspect it
> xprop -id $WINDOW WM_CLASS WM_NAME _NET_WM_PID
> # (optional) show more detail
> xwininfo -id $WINDOW
> # (optional) map to the process
> xdotool getwindowpid $WINDOW 2>/dev/null || xprop -id $WINDOW _NET_WM_PID
> ```
> 
> Handy one-liner:
> 
> ```bash
> eval "$(xdotool getmouselocation --shell)"; \
> pid=$(xdotool getwindowpid "$WINDOW" 2>/dev/null || xprop -id "$WINDOW" _NET_WM_PID | awk -F' = ' '{print $2}'); \
> echo "WIN=$WINDOW PID=$pid"; \
> xprop -id "$WINDOW" WM_CLASS WM_NAME; \
> ps -p "$pid" -o pid,cmd=
> ```
> 
> Interactive (if clicking works):
> 
> ```bash
> xprop # then click the window
> ```
> 
> FYI: this is X11 stuff (i3). If you were on Wayland/sway, it’d be different.
> 
> #linux #i3 #x11 #debugging
<!-- UID: c4a1d71a-fe13-4856-ad6a-074cf65c95a3 -->

---


