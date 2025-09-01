---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "YouTube video wallpaper setup"
conversation_id: 6898f144-3034-832e-af8d-e9c1946d2404
create_time: 08/10/2025 at 2:21 PM
update_time: 08/15/2025 at 10:29 AM
---

# Title: YouTube video wallpaper setup

Created: 08/10/2025 at 2:21 PM
Last Updated: 08/15/2025 at 10:29 AM
Chat URL: https://chat.openai.com/c/6898f144-3034-832e-af8d-e9c1946d2404


>[!nexus_user] **User** - 08/10/2025 at 2:21 PM
> my unstable ass wants to see my youtube music videos keep playing under all of his transparent windows on i3/picom/ubuntu.
<!-- UID: c3365b33-c693-44b9-a4f4-534810303509 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 2:23 PM
> oh we can absolutely make that chaos gremlin aesthetic happen. the trick: run the video as your *wallpaper* so it sits on the root window, then let picom’s transparency show it through your i3 tiles.
> 
> here’s the cleanest way on Xorg/i3: **xwinwrap + mpv (+ yt-dlp for YouTube).**
> 
> ### 1) install stuff
> ```bash
> sudo apt install mpv yt-dlp \
>  xorg-dev build-essential libx11-dev x11proto-xext-dev libxrender-dev libxext-dev
> 
> git clone https://github.com/mmhobi7/xwinwrap.git
> cd xwinwrap
> make
> sudo make install
> ```
> (xwinwrap lets you stick any app to the desktop background; the repo shows the deps and build steps. citeturn1view0)
> 
> > note: mpv will auto-use `yt-dlp` if it’s in your PATH, no extra config needed. cite
> 
> ### 2) fire it up (one-liner)
> Pick any YouTube URL and run:
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --loop --no-osc --no-osd-bar --hwdec=auto-copy \
>  --ytdl-format="bestvideo[height<=1080]+bestaudio/best" \
>  "https://www.youtube.com/watch?v=<VIDEO_ID>"
> ```
> - the xwinwrap flags keep it **below**, fullscreen, non-focusable, and “desktop-type” so it behaves like wallpaper. (those exact flags are shown in the project’s example usage.) citeturn1view0 
> - the mpv bits loop it, hide HUD, use HW decode, and cap at 1080p so your CPU doesn’t cry.
> 
> **Stop it** anytime with:
> ```bash
> killall xwinwrap
> ```
> 
> ### 3) i3 keybinds (start/stop)
> Drop something like this in `~/.config/i3/config`:
> ```i3
> # start YouTube wallpaper (change URL)
> bindsym $mod+Shift+y exec --no-startup-id \
>  xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --loop --no-osc --no-osd-bar --hwdec=auto-copy \
>  --ytdl-format='bestvideo[height<=1080]+bestaudio/best' \
>  'https://www.youtube.com/watch?v=<VIDEO_ID>'
> 
> # stop it
> bindsym $mod+Shift+u exec --no-startup-id killall xwinwrap
> ```
> (You can `Mod+Shift+c` to reload i3. cite)
> 
> ### 4) media keys that Just Work™
> If you want play/pause/next keys to control mpv:
> ```bash
> sudo apt install mpv-mpris playerctl
> ```
> Then in your i3 config:
> ```i3
> bindsym XF86AudioPlay exec --no-startup-id playerctl play-pause
> bindsym XF86AudioNext exec --no-startup-id playerctl next
> bindsym XF86AudioPrev exec --no-startup-id playerctl previous
> ```
> (`mpv-mpris` exposes mpv over MPRIS; `playerctl` drives it. cite)
> 
> ### tips / gotchas
> - If nothing shows, you’re probably on Wayland or the flags aren’t “desktop-type.” This setup is for Xorg (i3 + picom). The `-ov`/`-fdt` bits are the magic for compositors. citeturn1view0 
> - Transparent windows with heavy blur may hide the video—tweak your picom blur/opacity to taste. (General picom transparency guide here.) cite 
> - For fewer stutters, let mpv pick a sane format (as above) or even pre-download with `yt-dlp` if you’re looping the same tracks. (Common advice in mpv/xwinwrap threads.) cite
> 
> If you want, I can wrap this into a tiny `ytwall` script that grabs the URL from your clipboard and toggles it on/off.
<!-- UID: 9c53153f-ca7e-4a04-9630-393349ad6735 -->

---




>[!nexus_user] **User** - 08/10/2025 at 3:07 PM
> err@err-Stealth-16-AI-Studio-A1VGG:~$ xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --loop --no-osc --no-osd-bar --hwdec=auto-copy \
>  --ytdl-format="bestvideo[height<=1080]+bestaudio/best" \
>  "https://www.youtube.com/watch?v=alJuI6mQSQc"
> xwinwrap: window type - override
> [ffmpeg] https: HTTP error 403 Forbidden
> Failed to open https://rr2---sn-uhvcpax0n5-hn2l.googlevideo.com/videoplayback?expire=1754878037&ei=9fuYaKWyLKrd2_gPzJbVmQM&ip=2607%3Afb90%3A9902%3Aca3f%3A7a07%3A540d%3A1a0f%3A2f63&id=o-AHD7fpJRV5cCdvRpzGqsraxFJzGEKUAUv78NwAYeIZs-&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1754856437%2C&mh=jY&mm=31%2C29&mn=sn-uhvcpax0n5-hn2l%2Csn-vgqsknez&ms=au%2Crdu&mv=m&mvi=2&pl=40&rms=au%2Cau&initcwndbps=582500&bui=AY1jyLP-4zvB2QHFUjryj8R6KrUv8LIKlidQiJ96VjXrDv5tBASw8Dti4HEFub4VEC-j-tZlYYDCGkiS&spc=l3OVKXzS2Ixdl2S8dgXDosZwVKQyo4PprgHS4mwM4TNdHDityxYAUPzkkWcUZJ4HafN9ddqtlrHCcQ&vprv=1&svpuc=1&mime=video%2Fmp4&ns=BxCNy1BhfT3svbEib1COwtAQ&rqh=1&gir=yes&clen=893347339&ratebypass=yes&dur=7079.462&lmt=1753480487091201&mt=1754856102&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=4438534&n=TvVcfKLyHW7iqXOs&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRQIgRBfKOPMNHGv7kcJFFXLUeH4zTNkIhCDd1I2aFWofBwYCIQC8Ml695ZnTIpdcD5mmJtEY7Oecw_FXxFIkZONLAWQGaA%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIhAJysMfKwoZiEJ2QFsUsPovuX95vRtq3Pgb8R3t6sYyo6AiBu3gVYLZNqGdQXvKImarNnrJYI6sQcywMIp4goJ0IBMw%3D%3D.
> EDL: Could not open source file 'https://rr2---sn-uhvcpax0n5-hn2l.googlevideo.com/videoplayback?expire=1754878037&ei=9fuYaKWyLKrd2_gPzJbVmQM&ip=2607%3Afb90%3A9902%3Aca3f%3A7a07%3A540d%3A1a0f%3A2f63&id=o-AHD7fpJRV5cCdvRpzGqsraxFJzGEKUAUv78NwAYeIZs-&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1754856437%2C&mh=jY&mm=31%2C29&mn=sn-uhvcpax0n5-hn2l%2Csn-vgqsknez&ms=au%2Crdu&mv=m&mvi=2&pl=40&rms=au%2Cau&initcwndbps=582500&bui=AY1jyLP-4zvB2QHFUjryj8R6KrUv8LIKlidQiJ96VjXrDv5tBASw8Dti4HEFub4VEC-j-tZlYYDCGkiS&spc=l3OVKXzS2Ixdl2S8dgXDosZwVKQyo4PprgHS4mwM4TNdHDityxYAUPzkkWcUZJ4HafN9ddqtlrHCcQ&vprv=1&svpuc=1&mime=video%2Fmp4&ns=BxCNy1BhfT3svbEib1COwtAQ&rqh=1&gir=yes&clen=893347339&ratebypass=yes&dur=7079.462&lmt=1753480487091201&mt=1754856102&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=4438534&n=TvVcfKLyHW7iqXOs&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRQIgRBfKOPMNHGv7kcJFFXLUeH4zTNkIhCDd1I2aFWofBwYCIQC8Ml695ZnTIpdcD5mmJtEY7Oecw_FXxFIkZONLAWQGaA%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIhAJysMfKwoZiEJ2QFsUsPovuX95vRtq3Pgb8R3t6sYyo6AiBu3gVYLZNqGdQXvKImarNnrJYI6sQcywMIp4goJ0IBMw%3D%3D'.
>  Subs --sid=1 --slang=live_chat 'json' (null) (external)
> No video or audio streams selected.
> Exiting... (Errors when loading file)
> mpv died, exit status 2
<!-- UID: 191ec0a4-6186-4d3b-b640-320467263a9c -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 3:07 PM
> Yep, that’s the classic YouTube 403—almost always an out-of-date `yt-dlp` or cookies/IPv6 weirdness. Quickest path to joy:
> 
> ### 1) Install the *upstream* yt-dlp (Ubuntu’s package lags)
> ```bash
> # ditch old one if it exists in /usr/bin
> sudo rm -f /usr/bin/yt-dlp 2>/dev/null || true
> 
> # install latest static binary
> sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
>  -o /usr/local/bin/yt-dlp
> sudo chmod a+rx /usr/local/bin/yt-dlp
> 
> /usr/local/bin/yt-dlp --version
> ```
> 
> ### 2) Try again with mpv explicitly using that yt-dlp
> Also force IPv4 (YouTube sometimes 403s on v6 routes):
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --loop-file=inf --no-osc --no-osd-bar --hwdec=auto-copy \
>  --script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp \
>  --ytdl-raw-options=force-ipv4= \
>  --ytdl-format="bv*[height<=1080][fps<=60]+ba/b[height<=1080][fps<=60]" \
>  "https://www.youtube.com/watch?v=alJuI6mQSQc"
> ```
> 
> ### 3) If it’s age/region/cookie-gated, pass cookies
> - Export cookies from your browser (use a “cookies.txt” exporter).
> - Save as `~/.config/ytcookies.txt`, then:
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --loop-file=inf --no-osc --no-osd-bar --hwdec=auto-copy \
>  --script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp \
>  --ytdl-raw-options=force-ipv4=,cookies=~/.config/ytcookies.txt \
>  --ytdl-format="bv*[height<=1080][fps<=60]+ba/b[height<=1080][fps<=60]" \
>  "https://www.youtube.com/watch?v=alJuI6mQSQc"
> ```
> 
> ### 4) If it still whines, get a log
> ```bash
> mpv -v --msg-level=ytdl_hook=trace --log-file=/tmp/mpv.log \
>  "https://www.youtube.com/watch?v=alJuI6mQSQc"
> tail -n +1 /tmp/mpv.log
> ```
> Look for lines about `yt-dlp path`, `format`, or `403`—we can tune from there.
> 
> Want me to wrap this into a `ytwall` toggle script (start/stop, playlist support, media keys via MPRIS)? I’ll spit it out.
<!-- UID: 7423ee9a-e94b-40e6-bb06-b0b8228e1040 -->

---




>[!nexus_user] **User** - 08/10/2025 at 3:12 PM
> Yo so... this is really loud... I need a way to control the volume.

>[!nexus_attachment] **image_file-GVoNiE446NBR9CJHNJ6KFg_1024x256.png** (image/png) - 681.4 KB
> ![[Nexus_attachments/chatgpt/images/image_file-GVoNiE446NBR9CJHNJ6KFg_1024x256.png]]
<!-- UID: 499b1251-8109-4c93-9231-15efa627b606 -->




>[!nexus_agent] **Assistant** - 08/10/2025 at 3:12 PM
> Yup—mpv’s blasting because it’s running headless. Easiest fixes:
> 
> ### Quick fix (set startup volume)
> Add `--volume=25` (0–100) to your mpv line:
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --volume=25 --loop-file=inf --no-osc --no-osd-bar --hwdec=auto-copy \
>  --ytdl-format="bv*[height<=1080][fps<=60]+ba/b[height<=1080][fps<=60]" \
>  "https://www.youtube.com/watch?v=alJuI6mQSQc"
> ```
> 
> ### Nice fix (bind volume up/down)
> Give mpv an IPC socket, then drive volume without focusing it.
> 
> 1) Launch with an IPC socket:
> ```bash
> ... mpv -wid WID --input-ipc-server=/tmp/ytwall.sock --volume=25 ...
> ```
> 
> 2) Install socat:
> ```bash
> sudo apt install socat
> ```
> 
> 3) i3 binds (example: ±5 volume):
> ```i3
> bindsym $mod+Shift+comma exec --no-startup-id bash -lc 'echo "{\"command\":[\"add\",\"volume\",-5]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+period exec --no-startup-id bash -lc 'echo "{\"command\":[\"add\",\"volume\",5]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+m exec --no-startup-id bash -lc 'echo "{\"command\":[\"cycle\",\"mute\"]}" | socat - /tmp/ytwall.sock'
> ```
> 
> ### Alt: use media controls (MPRIS)
> ```bash
> sudo apt install mpv-mpris playerctl
> # set 30%:
> playerctl --player=mpv volume 0.3
> # (you can bind those in i3 too)
> ```
> 
> ### GUI fallback
> `pavucontrol` → “Playback” tab → adjust the `mpv` stream slider only.
> 
> Want me to wrap this into a `ytwall` script (start/stop + volume hotkeys baked in)?
<!-- UID: c8828741-27e6-44e5-b65d-52ef4df7d138 -->

---




>[!nexus_user] **User** - 08/11/2025 at 1:47 PM
> how could I set up like a play list of these?
<!-- UID: 0801d4ff-c2db-492e-9da5-00291ae414eb -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 1:47 PM
> heck yeah—three easy ways:
> 
> # Option A: pass a YouTube playlist URL
> mpv (via yt-dlp) can chew a full playlist.
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --volume=25 \
>  --loop-playlist=inf --shuffle \
>  --no-osc --no-osd-bar --hwdec=auto-copy \
>  --script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp \
>  --ytdl-raw-options=force-ipv4= \
>  "https://www.youtube.com/playlist?list=YOUR_LIST_ID"
> ```
> 
> # Option B: make your own playlist file
> Put one URL per line (video or playlist) in `~/.config/ytwall.m3u`:
> ```
> https://www.youtube.com/watch?v=alJuI6mQSQc
> https://www.youtube.com/watch?v=dQw4w9WgXcQ
> # comments are fine
> https://www.youtube.com/watch?v=oHg5SJYRHA0
> ```
> Then run:
> ```bash
> xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --volume=25 \
>  --playlist=~/.config/ytwall.m3u \
>  --loop-playlist=inf --shuffle \
>  --no-osc --no-osd-bar --hwdec=auto-copy \
>  --script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp \
>  --ytdl-raw-options=force-ipv4=
> ```
> 
> # Controls you’ll want
> Pick one of these control methods (both work great with xwinwrap):
> 
> **MPRIS (simplest)**
> ```bash
> sudo apt install mpv-mpris playerctl
> # keys in i3:
> bindsym XF86AudioPlay exec --no-startup-id playerctl --player=mpv play-pause
> bindsym XF86AudioNext exec --no-startup-id playerctl --player=mpv next
> bindsym XF86AudioPrev exec --no-startup-id playerctl --player=mpv previous
> bindsym XF86AudioLowerVolume exec --no-startup-id playerctl --player=mpv volume 0.05-
> bindsym XF86AudioRaiseVolume exec --no-startup-id playerctl --player=mpv volume 0.05+
> ```
> 
> **mpv IPC (more control, no focus needed)**
> Launch mpv with a socket:
> ```bash
> ... mpv -wid WID --input-ipc-server=/tmp/ytwall.sock ...
> ```
> i3 binds:
> ```i3
> bindsym $mod+Shift+Right exec --no-startup-id bash -lc 'echo "{\"command\":[\"playlist-next\",\"weak\"]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+Left exec --no-startup-id bash -lc 'echo "{\"command\":[\"playlist-prev\",\"weak\"]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+space exec --no-startup-id bash -lc 'echo "{\"command\":[\"cycle\",\"pause\"]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+comma exec --no-startup-id bash -lc 'echo "{\"command\":[\"add\",\"volume\",-5]}" | socat - /tmp/ytwall.sock'
> bindsym $mod+Shift+period exec --no-startup-id bash -lc 'echo "{\"command\":[\"add\",\"volume\",5]}" | socat - /tmp/ytwall.sock'
> ```
> 
> # Optional: a tiny toggle script
> Drop this at `~/bin/ytwall` and `chmod +x ~/bin/ytwall`. Edit the PLAYLIST or URL.
> ```bash
> #!/usr/bin/env bash
> SOCK=/tmp/ytwall.sock
> PLAYLIST="$HOME/.config/ytwall.m3u" # or set a YouTube playlist URL here
> RUNNING=$(pgrep -f "mpv -wid WID.*$SOCK")
> 
> start() {
>  xwinwrap -b -s -fs -st -sp -nf -ov -fdt -- \
>  mpv -wid WID --volume=25 \
>  --input-ipc-server="$SOCK" \
>  --loop-playlist=inf --shuffle \
>  --no-osc --no-osd-bar --hwdec=auto-copy \
>  --script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp \
>  --ytdl-raw-options=force-ipv4= \
>  --playlist="$PLAYLIST"
> }
> stop() { pkill -f "xwinwrap.*mpv -wid WID" || true; }
> next() { echo '{"command":["playlist-next","weak"]}' | socat - "$SOCK"; }
> prev() { echo '{"command":["playlist-prev","weak"]}' | socat - "$SOCK"; }
> pause() { echo '{"command":["cycle","pause"]}' | socat - "$SOCK"; }
> volup() { echo '{"command":["add","volume",5]}' | socat - "$SOCK"; }
> voldn() { echo '{"command":["add","volume",-5]}' | socat - "$SOCK"; }
> 
> case "$1" in
>  start) start ;;
>  stop) stop ;;
>  next) next ;;
>  prev) prev ;;
>  pause) pause ;;
>  vol+) volup ;;
>  vol-) voldn ;;
>  *) echo "usage: ytwall {start|stop|next|prev|pause|vol+|vol-}" ;;
> esac
> ```
> 
> That’ll give you a shuffled, looping wallpaper jukebox with proper next/prev and volume—no need to touch the mpv window ever again. Want me to plug in your specific list and add i3 binds around this script?
<!-- UID: 757ecb2e-3623-42d8-ab7f-94634ee3a89b -->

---




>[!nexus_user] **User** - 08/11/2025 at 1:49 PM
> What's a fast way I could verify copyrighted music... like is there an ML model or a service I can run on a video to guess quickly, so I can just dump all my favorite music in there and be mostly sure it's fine?
<!-- UID: 0569e3b3-c166-4b0e-99c2-5a0349d475ba -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 1:49 PM
> Short answer: there isn’t an ML model that can tell you “this is safe to use.” What you *can* do is identify the track quickly; if it’s a match to a known catalog, assume “copyrighted → not safe without a license.” Unknown ≠ safe.
> 
> Here are the fastest practical options:
> 
> # 1) Quick YouTube pre-check (free, reliable for YT)
> Upload a 30–60s clip (private/unlisted). YouTube’s “Checks” runs Content ID before publish. If it flags, you’ll know who claims it. Doesn’t grant rights, but it’s the best preview of what YouTube will do.
> 
> # 2) Local bulk scanner (open-source, fast)
> Use audio fingerprinting to *identify* songs. If it matches, treat as copyrighted.
> 
> ```bash
> # Install tools
> sudo apt install -y chromaprint-tools jq parallel
> 
> # Get an AcoustID API key (free) and export it
> export ACOUSTID_KEY=YOUR_KEY
> 
> # Scan a folder; write a CSV of matches
> find ~/music -type f -iregex '.*\.\(mp3\|m4a\|flac\|wav\|opus\|ogg\)$' -print0 |
> parallel -0 --bar '
>  J=$(fpcalc -json {}); \
>  FP=$(echo "$J" | jq -r .fingerprint); \
>  DUR=$(echo "$J" | jq -r .duration); \
>  RESP=$(curl -sG https://api.acoustid.org/v2/lookup \
>  --data-urlencode client=$ACOUSTID_KEY \
>  --data-urlencode meta=recordings+recordingids+usermeta \
>  --data-urlencode duration=$DUR \
>  --data-urlencode fingerprint="$FP"); \
>  TITLE=$(echo "$RESP" | jq -r ".results[0].recordings[0].title // \"\""); \
>  ARTIST=$(echo "$RESP" | jq -r ".results[0].recordings[0].artists[0].name // \"\""); \
>  SCORE=$(echo "$RESP" | jq -r ".results[0].score // 0"); \
>  echo "\"{}\",\"$ARTIST\",\"$TITLE\",$SCORE" \
> ' > acoustid_matches.csv
> 
> # Anything with SCORE >= 0.6–0.7: treat as a confident match (i.e., copyrighted).
> ```
> 
> You can also invert it into a blocklist `.m3u` for mpv (I can script that for you).
> 
> # 3) “It just works” recognition APIs (paid)
> If you want better coverage (YouTube/Spotify catalogs, snippets, noisy audio), use:
> - **ACRCloud** or **AudD**: both return track/label metadata fast. Great for triage pipelines.
> - (Shazam/Gracenote/Audible Magic exist, but are walled or not Linux-friendly.)
> 
> # Reality check / policy bits
> - Identification ≠ permission. Even if a service doesn’t recognize a track, it can still be copyrighted.
> - “DMCA-safe” playlists from creators (StreamBeats, Epidemic Sound, Artlist, Monstercat Gold, etc.) are safest *if you hold the license* and follow their terms. You may still see automated claims; the license lets you dispute/whitelist.
> 
> If you want, I’ll whip up a tiny Node or bash tool that:
> - walks a folder,
> - fingerprints each file,
> - writes `allowed.m3u` / `blocked.m3u`,
> - and prints a summary table.
<!-- UID: 3f4202c8-1a49-4187-80bf-34f49c9c1f81 -->

---




>[!nexus_user] **User** - 08/11/2025 at 1:52 PM
> Yea I just want to quickly filter out music that is definately not safe. I make an effort to check the descriptions for rights. Some times I forget on like an auto generated play list, or I misunderstand how copy right works. Like one time I got a copy right warning because of classical music. I didn't understand that rule, but now I do. If I had a tool that could automaticly check for it like youtube does, I'd at least avoid 90% of the copy right strike problems.
> 
> I do check... most the time... I'm not perfect.
<!-- UID: b396a925-33b9-489f-a72b-8a9d26421086 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 1:52 PM
> Totally doable. You won’t get “legal clearance,” but you can auto-yeet anything that fingerprints as a known commercial recording. That alone dodges most strikes.
> 
> Here’s a **local, fast “likely copyrighted” filter**:
> 
> # What it does
> - Fingerprints each audio file with **Chromaprint (`fpcalc`)**
> - Looks it up on **AcoustID** → gets a MusicBrainz recording
> - If the recording has an **ISRC** (i.e., specific released recording) or looks like an official release → **mark BLOCKED**
> - Writes `blocked.m3u` and `unknown.m3u` (unknown ≠ safe, but it’s your short-list to manually check)
> 
> # Install prerequisites (Ubuntu)
> ```bash
> sudo apt install -y chromaprint-tools jq
> ```
> Grab a free AcoustID API key: https://acoustid.org/api-key 
> Then: `export ACOUSTID_KEY=YOUR_KEY`
> 
> # Node script (because you like JS) — save as `copyright-screener.mjs`
> ```js
> #!/usr/bin/env node
> // usage: ACOUSTID_KEY=xxxx node copyright-screener.mjs /path/to/music
> import { spawnSync } from "node:child_process";
> import { promises as fs } from "node:fs";
> import path from "node:path";
> 
> const ROOT = process.argv[2] || ".";
> const ACOUSTID_KEY = process.env.ACOUSTID_KEY;
> if (!ACOUSTID_KEY) {
>  console.error("Set ACOUSTID_KEY first (https://acoustid.org/api-key)");
>  process.exit(1);
> }
> 
> const AUDIO_EXT = new Set([".mp3",".m4a",".flac",".wav",".opus",".ogg",".aac",".wma",".aiff",".alac"]);
> 
> async function* walk(dir) {
>  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
>  const p = path.join(dir, d.name);
>  if (d.isDirectory()) yield* walk(p);
>  else if (AUDIO_EXT.has(path.extname(d.name).toLowerCase())) yield p;
>  }
> }
> 
> function fpcalc(file) {
>  const out = spawnSync("fpcalc", ["-json", file], { encoding: "utf8" });
>  if (out.status !== 0) return null;
>  const j = JSON.parse(out.stdout);
>  return { duration: j.duration, fingerprint: j.fingerprint };
> }
> 
> async function acoustIdLookup(fp, dur) {
>  const url = new URL("https://api.acoustid.org/v2/lookup");
>  url.searchParams.set("client", ACOUSTID_KEY);
>  url.searchParams.set("duration", String(dur));
>  url.searchParams.set("fingerprint", fp);
>  url.searchParams.set("meta", "recordings+recordingids+releasegroups");
>  const r = await fetch(url);
>  if (!r.ok) return null;
>  return r.json();
> }
> 
> async function mbRecording(mbid) {
>  // polite rate limit for MusicBrainz (~1 req/sec recommended)
>  await new Promise(r => setTimeout(r, 1100));
>  const url = `https://musicbrainz.org/ws/2/recording/${mbid}?inc=isrcs+releases+release-groups&fmt=json`;
>  const r = await fetch(url, { headers: { "User-Agent": "copyright-screener/1.0 (linux desktop)" }});
>  if (!r.ok) return null;
>  return r.json();
> }
> 
> function decisionFromMB(mb) {
>  const hasISRC = Array.isArray(mb.isrcs) && mb.isrcs.length > 0;
>  const hasOfficialRelease = Array.isArray(mb.releases) && mb.releases.some(x => (x.status||"").toLowerCase()==="official");
>  return (hasISRC || hasOfficialRelease) ? "BLOCK" : "UNKNOWN";
> }
> 
> const blocked = [];
> const unknown = [];
> const rows = [];
> 
> (async () => {
>  for await (const file of walk(ROOT)) {
>  try {
>  const fp = fpcalc(file);
>  if (!fp) { rows.push([file,"","","0","NOFP","UNKNOWN"]); unknown.push(file); continue; }
> 
>  const res = await acoustIdLookup(fp.fingerprint, fp.duration);
>  const result = res?.results?.[0];
>  const score = Number(result?.score || 0);
>  if (!result || score < 0.65 || !result.recordings?.length) {
>  rows.push([file,"","",""+score,"NOMATCH","UNKNOWN"]);
>  unknown.push(file);
>  continue;
>  }
> 
>  const rec = result.recordings[0];
>  const mbid = rec.id;
>  const mb = await mbRecording(mbid);
>  const artist = mb?.["artist-credit"]?.map(a => a.name).join(", ") || (rec.artists?.[0]?.name || "");
>  const title = mb?.title || rec.title || "";
>  const dec = mb ? decisionFromMB(mb) : "UNKNOWN";
> 
>  rows.push([file, artist, title, ""+score, mb?.isrcs?.length||0, dec]);
>  if (dec === "BLOCK") blocked.push(file); else unknown.push(file);
>  process.stdout.write(`\rProcessed: ${rows.length}`);
>  } catch (e) {
>  rows.push([file,"","","0","ERR","UNKNOWN"]);
>  unknown.push(file);
>  }
>  }
> 
>  // Write playlists
>  await fs.writeFile("blocked.m3u", blocked.map(p=>p).join("\n") + "\n");
>  await fs.writeFile("unknown.m3u", unknown.map(p=>p).join("\n") + "\n");
> 
>  // Write CSV report
>  const csv = ["file,artist,title,score,isrc_count,decision", ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
>  await fs.writeFile("copyright_report.csv", csv);
> 
>  console.log(`\nDone. BLOCKED: ${blocked.length}, UNKNOWN: ${unknown.length}`);
>  console.log("Outputs: blocked.m3u, unknown.m3u, copyright_report.csv");
> })();
> ```
> 
> ```bash
> chmod +x copyright-screener.mjs
> ACOUSTID_KEY=xxxx node copyright-screener.mjs ~/music
> ```
> 
> Now point your wallpaper/mpv at the safe list:
> ```bash
> mpv --playlist=unknown.m3u --loop-playlist=inf --shuffle ...
> ```
> 
> ## Why this works (and limits)
> - **ISRC present ⇒ specific recording exists ⇒ treat as copyrighted.** (Classical trips this too: composition PD, recording isn’t.)
> - Anything that fingerprints to a known commercial release is **BLOCK**.
> - **UNKNOWN** means “not matched”; still could be copyrighted—just not found. That’s your manual-check pile.
> 
> ## Want higher hit-rate?
> Swap AcoustID for a commercial matcher:
> - **ACRCloud** or **AudD**: both have Node SDKs, return ISRC/label fast, work well with short/noisy clips. You can feed them a 15–30s `ffmpeg` snippet of each track to save bandwidth. Same pipeline; just change the `lookup()` function.
> 
> If you want, I’ll wire this into your `ytwall` flow: scrape a YouTube playlist with `yt-dlp`, extract audio to a temp dir, run the screener, then generate an `allowed.m3u` for the wallpaper player.
<!-- UID: a2434a09-36d9-4824-a5ab-3e7b69fbf72f -->

---




>[!nexus_user] **User** - 08/11/2025 at 1:56 PM
> Ok... now I want to wrap the wall paper thing in a node script that also publishes a simple frontend for an obs browser page overlay, to display the title of the track. Cause it's the right way to do it.
<!-- UID: 4441202a-d75f-48a0-8f83-9a6f35a87ea5 -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 1:56 PM
> oh yeah, let’s do it “proper.”
> 
> Below is a single-file Node script that:
> - launches your wallpaper via `xwinwrap + mpv`
> - opens an IPC socket to mpv to read the current track (`media-title` / `metadata`)
> - serves a tiny overlay page for OBS (transparent, WebSocket updates)
> - exposes simple control endpoints (`/api/next`, `/api/prev`, `/api/pause`, `/api/vol?delta=5`)
> 
> ### 1) install deps
> ```bash
> sudo apt install mpv xwinwrap || true # you already have these
> # use upstream yt-dlp so YouTube is happy:
> sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
>  -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
> 
> # node deps
> mkdir -p ~/ytwall && cd ~/ytwall
> npm init -y
> npm i ws
> ```
> 
> ### 2) save as `ytwall.mjs`
> ```js
> #!/usr/bin/env node
> // ytwall.mjs — wallpaper player + OBS overlay
> // usage examples:
> // node ytwall.mjs --playlist ~/.config/ytwall.m3u
> // node ytwall.mjs --url "https://www.youtube.com/playlist?list=XXXX"
> // flags: --port 3323 --volume 25 --shuffle --ytdl /usr/local/bin/yt-dlp
> 
> import http from "node:http";
> import { spawn } from "node:child_process";
> import net from "node:net";
> import url from "node:url";
> import { WebSocketServer } from "ws";
> import fs from "node:fs";
> 
> const args = Object.fromEntries(
>  process.argv.slice(2).reduce((acc, a, i, arr) => {
>  if (a.startsWith("--")) {
>  const k = a.replace(/^--/, "");
>  const v = arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true;
>  acc.push([k, v]);
>  }
>  return acc;
>  }, [])
> );
> 
> const PORT = Number(args.port || 3323);
> const VOLUME = Number(args.volume || 25);
> const SHUFFLE = Boolean(args.shuffle || true);
> const PLAYLIST = args.playlist || null;
> const URL = args.url || null;
> const YTDL = args.ytdl || "/usr/local/bin/yt-dlp";
> const SOCKET = args.socket || "/tmp/ytwall.sock";
> const XWINWRAP = args.xwinwrap || "xwinwrap";
> const MPV = args.mpv || "mpv";
> 
> if (!PLAYLIST && !URL) {
>  console.error("Pass --playlist <file.m3u> or --url <YouTube URL/playlist>");
>  process.exit(1);
> }
> 
> let current = { title: "", artist: "", rawMeta: {} };
> let mpvSock = null;
> let mpvProc = null;
> let xwrapProc = null;
> let wsClients = new Set();
> 
> function mpvSend(cmd) {
>  if (!mpvSock) return;
>  mpvSock.write(JSON.stringify({ command: cmd }) + "\n");
> }
> 
> function tryConnectMpvSock(retries = 50) {
>  return new Promise((resolve, reject) => {
>  const attempt = () => {
>  const s = net.createConnection(SOCKET, () => {
>  mpvSock = s;
>  wireMpvIPC(s);
>  resolve();
>  });
>  s.on("error", () => {
>  if (retries-- > 0) setTimeout(attempt, 200);
>  else reject(new Error("mpv IPC connect failed"));
>  });
>  };
>  attempt();
>  });
> }
> 
> function wireMpvIPC(s) {
>  let buf = "";
>  s.on("data", (d) => {
>  buf += d.toString("utf8");
>  let idx;
>  while ((idx = buf.indexOf("\n")) >= 0) {
>  const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
>  if (!line.trim()) continue;
>  try {
>  const j = JSON.parse(line);
>  if (j.event === "property-change") {
>  if (j.name === "media-title") {
>  current.title = j.data || "";
>  broadcast({ type: "track", title: prettyTitle(), artist: current.artist });
>  }
>  if (j.name === "metadata") {
>  current.rawMeta = j.data || {};
>  // prefer artist/title if present, else fallback to media-title
>  current.artist = (j.data?.artist || j.data?.ARTIST || "");
>  broadcast({ type: "track", title: prettyTitle(), artist: current.artist });
>  }
>  }
>  } catch { /* noop */ }
>  }
>  });
> 
>  // observe properties
>  mpvSend(["observe_property", 1, "media-title"]);
>  mpvSend(["observe_property", 2, "metadata"]);
>  // seed one-shot queries
>  mpvSend(["get_property", "media-title"]);
>  mpvSend(["get_property", "metadata"]);
> }
> 
> function prettyTitle() {
>  const mt = current.title || "";
>  const t = current.rawMeta?.title || current.rawMeta?.TITLE || "";
>  const a = current.artist || "";
>  // good cases: have artist+title from metadata
>  if (a && t) return `${a} — ${t}`;
>  return mt || t || "…";
> }
> 
> function broadcast(msg) {
>  const s = JSON.stringify(msg);
>  wsClients.forEach(ws => { if (ws.readyState === 1) ws.send(s); });
> }
> 
> // spawn xwinwrap + mpv
> function startWallpaper() {
>  const mpvArgs = [
>  "-wid", "WID",
>  `--input-ipc-server=${SOCKET}`,
>  `--volume=${VOLUME}`,
>  "--loop-playlist=inf",
>  ...(SHUFFLE ? ["--shuffle"] : []),
>  "--no-osc", "--no-osd-bar", "--hwdec=auto-copy",
>  `--script-opts=ytdl_hook-ytdl_path=${YTDL}`,
>  "--ytdl-raw-options=force-ipv4=",
>  ];
> 
>  if (PLAYLIST) mpvArgs.push(`--playlist=${PLAYLIST}`);
>  else mpvArgs.push(URL);
> 
>  const xArgs = ["-b","-s","-fs","-st","-sp","-nf","-ov","-fdt","--", MPV, ...mpvArgs];
> 
>  xwrapProc = spawn(XWINWRAP, xArgs, { stdio: "ignore" });
>  xwrapProc.on("exit", (code, sig) => {
>  console.log(`xwinwrap exited`, code, sig);
>  shutdown(0);
>  });
> 
>  // give mpv time to create the socket
>  tryConnectMpvSock().then(() => {
>  console.log("Connected to mpv IPC:", SOCKET);
>  }).catch((e) => {
>  console.error(e);
>  shutdown(1);
>  });
> }
> 
> function shutdown(code = 0) {
>  try { mpvSock?.end(); } catch {}
>  try { xwrapProc?.kill("SIGTERM"); } catch {}
>  try { fs.un(SOCKET); } catch {}
>  process.exit(code);
> }
> 
> process.on("SIGINT", () => shutdown(0));
> process.on("SIGTERM", () => shutdown(0));
> 
> // HTTP + WS overlay server
> const server = http.createServer((req, res) => {
>  const u = url.parse(req.url, true);
>  if (u.pathname === "/") {
>  res.writeHead(302, { Location: "/overlay" }); res.end(); return;
>  }
>  if (u.pathname === "/overlay") {
>  const size = u.query.size || "36";
>  const align = u.query.align || "center"; // left/center/right
>  res.setHeader("Content-Type", "text/html; charset=utf-8");
>  res.end(`<!DOCTYPE html>
> <html>
> <meta charset="utf-8"/>
> <meta name="viewport" content="width=device-width,initial-scale=1"/>
> <title>ytwall overlay</title>
> <style>
>  html,body{margin:0;padding:0;background:transparent;overflow:hidden}
>  .wrap{position:fixed;left:0;right:0;bottom:2vh;display:flex;justify-content:${align};}
>  .pill{
>  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
>  font-size:${Number(size)}px; line-height:1.2; color:#fff; 
>  padding:.4em .8em; border-radius:999px;
>  background: rgba(0,0,0,.45);
>  backdrop-filter: blur(4px);
>  text-shadow: 0 2px 6px rgba(0,0,0,.6);
>  max-width: 90vw; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
>  }
>  .fade{opacity:0; transition: opacity .2s ease}
>  .fade.show{opacity:1}
> </style>
> <body>
>  <div class="wrap"><div id="t" class="pill fade">Connecting…</div></div>
>  <script>
>  const el = document.getElementById('t');
>  function show(txt){
>  el.classList.remove('show'); el.textContent = txt;
>  requestAnimationFrame(()=>{ el.classList.add('show'); });
>  }
>  function connect(){
>  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
>  const ws = new WebSocket(proto + '://' + location.host + '/ws');
>  ws.addEventListener('open', ()=> show('…'));
>  ws.addEventListener('message', (ev)=>{
>  try{
>  const j = JSON.parse(ev.data);
>  if (j.type === 'track') show(j.title);
>  }catch{}
>  });
>  ws.addEventListener('close', ()=> setTimeout(connect, 1000));
>  }
>  connect();
>  </script>
> </body></html>`);
>  return;
>  }
>  if (u.pathname === "/api/title") {
>  res.setHeader("Content-Type","application/json");
>  res.end(JSON.stringify({ title: prettyTitle(), artist: current.artist, meta: current.rawMeta }));
>  return;
>  }
>  if (u.pathname === "/api/next") { mpvSend(["playlist-next","weak"]); res.end("ok"); return; }
>  if (u.pathname === "/api/prev") { mpvSend(["playlist-prev","weak"]); res.end("ok"); return; }
>  if (u.pathname === "/api/pause") { mpvSend(["cycle","pause"]); res.end("ok"); return; }
>  if (u.pathname === "/api/vol") {
>  const d = Number(u.query.delta || 5);
>  mpvSend(["add","volume", d]); res.end("ok"); return;
>  }
>  res.statusCode = 404; res.end("not found");
> });
> 
> const wss = new WebSocketServer({ server, path: "/ws" });
> wss.on("connection", (ws) => {
>  wsClients.add(ws);
>  ws.on("close", () => wsClients.delete(ws));
>  ws.send(JSON.stringify({ type: "track", title: prettyTitle(), artist: current.artist }));
> });
> 
> server.listen(PORT, () => {
>  console.log(`Overlay: http://localhost:${PORT}/overlay (add to OBS as a Browser source)`);
>  startWallpaper();
> });
> ```
> 
> ```bash
> chmod +x ytwall.mjs
> ```
> 
> ### 3) run it
> ```bash
> # using a local playlist
> node ytwall.mjs --playlist ~/.config/ytwall.m3u --port 3323 --volume 25 --shuffle
> 
> # …or using a YouTube playlist URL
> node ytwall.mjs --url "https://www.youtube.com/playlist?list=YOUR_LIST" --port 3323
> ```
> 
> ### 4) add to OBS
> - Add a **Browser** source
> - URL: `http://localhost:3323/overlay?size=42&align=center`
> - Set Width/Height to your canvas width/height (e.g., 1920×1080)
> - Background stays transparent; text sits on a soft pill.
> 
> ### 5) optional i3 binds (control without focus)
> ```i3
> bindsym $mod+Shift+Right exec --no-startup-id curl -s http://localhost:3323/api/next
> bindsym $mod+Shift+Left exec --no-startup-id curl -s http://localhost:3323/api/prev
> bindsym $mod+Shift+space exec --no-startup-id curl -s http://localhost:3323/api/pause
> bindsym $mod+Shift+comma exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=-5"
> bindsym $mod+Shift+period exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=5"
> ```
> 
> If you want artist/channel shown separately or a scrolling marquee for long titles, say the word—I’ll tweak the overlay CSS/logic.
<!-- UID: a5460d97-bfeb-4903-acc6-c3d87de99a83 -->

---




>[!nexus_user] **User** - 08/11/2025 at 1:58 PM
> yea if you could seperate the html from the backend and have it served as a static file.
<!-- UID: 26152e06-2ce3-455b-a1c9-032ab6a777ad -->




>[!nexus_agent] **Assistant** - 08/11/2025 at 2:01 PM
> Done. I split it cleanly:
> 
> - `server.mjs` = backend (static file server + WS + xwinwrap/mpv launcher)
> - `public/` = overlay assets (`index.html`, `overlay.css`, `overlay.js`)
> 
> Grab the files from the canvas, drop them into a folder, `npm i`, then:
> 
> ```bash
> node server.mjs --playlist ~/.config/ytwall.m3u --port 3323 --volume 25 --shuffle \
>  --public ./public --ytdl /usr/local/bin/yt-dlp
> # or
> node server.mjs --url "https://www.youtube.com/playlist?list=XXXX"
> ```
> 
> In OBS, add a Browser source pointing at:
> ```
> http://localhost:3323/?size=42&align=center&marquee=auto
> ```
> 
> Want channel/artist on a second line, or a left-edge vertical layout? Say the word and I’ll tweak the static HTML/CSS.
<!-- UID: fcd3821b-3ee4-4bbb-86cd-5acf7e682c5f -->

---




>[!nexus_user] **User** - 08/13/2025 at 11:07 AM
> Can you do this now?
<!-- UID: 60e5dda2-8e25-4d7a-864d-e94823dc7a7c -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 11:12 AM
> Yep — I wired it up.
> 
> - I added a **copyright screener** (AcoustID-first, optional AudD) to the project.
> - It can take a YouTube playlist, fingerprint short snippets, **block likely copyrighted** tracks, and emit `allowed.m3u` for the wallpaper player.
> - There’s also an **optional server endpoint** to rebuild+reload the playlist live.
> 
> Open the canvas (“Ytwall Overlay – Static Frontend + Node Backend”) — it now includes:
> 
> - `screener.mjs` (full Node script)
> - install/usage steps
> - optional `/api/screen?yt=...` endpoint patch for `server.mjs`
> 
> Quick start:
> 
> ```bash
> # deps
> sudo apt install ffmpeg chromaprint-tools -y
> sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
>  -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
> 
> # build filtered playlist
> export ACOUSTID_KEY=xxxx # (optional) export AUDD_TOKEN=yyyy
> node screener.mjs --yt-playlist "https://www.youtube.com/playlist?list=XXXX" --out allowed.m3u
> 
> # launch the wallpaper using the filtered list
> node server.mjs --playlist ./allowed.m3u --port 3323 --public ./public
> ```
> 
> Want me to auto-run the screener nightly or on playlist change, or to show artist/title on two lines in the overlay?
<!-- UID: e77d18d2-bff3-4e67-9a24-313d195aa1a2 -->

---




>[!nexus_user] **User** - 08/13/2025 at 12:33 PM
> I can't open that canvas. Make a new one.
<!-- UID: 90954d3d-6cbd-4ffc-b628-a19cab453396 -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 12:36 PM
> All set—I put a fresh copy in a new canvas: **“Ytwall – Static Overlay + Node Backend (new)”** with:
> 
> - `server.mjs` (static server + WS + xwinwrap/mpv)
> - `public/` (`index.html`, `overlay.css`, `overlay.js`)
> - `screener.mjs` (optional filter)
> - `package.json`
> - run steps + i3 binds
> 
> Use it like:
> 
> ```bash
> npm i
> node server.mjs --playlist ~/.config/ytwall.m3u --port 3323 --public ./public --volume 25 \
>  --ytdl /usr/local/bin/yt-dlp
> # or
> node server.mjs --url "https://www.youtube.com/playlist?list=XXXX" --port 3323 --public ./public
> ```
> 
> OBS Browser URL:
> ```
> http://localhost:3323/?size=42&align=center&marquee=auto
> ```
> 
> Need two-line (artist/title) or left-edge vertical layout? I can drop variants into `public/` fast.
<!-- UID: 71970ccb-9e38-4dbb-991b-e366ec0f96ed -->

---




>[!nexus_user] **User** - 08/13/2025 at 2:09 PM
> hmm... so it starts the wall paper, but the socket isn't connecting. Not sure why yet... still looking
> Error: mpv IPC connect failed
> Any ideas?
<!-- UID: 21fc3bb3-7c4e-41b2-a15a-adc4a3d87761 -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 2:09 PM
> Yep — classic “socket never shows up” race/perm thing. Here’s a fast triage + tiny patch that usually fixes it.
> 
> ## Quick triage (60 seconds)
> 
> 1) **Kill everything & clean socket**
> ```bash
> pkill -f xwinwrap; pkill -f "mpv -wid WID"; rm -f /tmp/ytwall.sock
> ```
> 
> 2) **Does mpv create an IPC socket on your box at all?**
> ```bash
> mpv --input-ipc-server=/tmp/ytwall-test.sock --idle=yes --no-terminal &
> sleep 0.5; ls -l /tmp/ytwall-test.sock
> # talk to it:
> printf '%s\n' '{"command":["get_property","version"]}' | socat - UNIX-CONNECT:/tmp/ytwall-test.sock
> kill %1
> ```
> - If this fails: it’s your mpv build/perm. Install repo mpv (`sudo apt install mpv`) and try again. 
> - If this works: it’s our **path/timing** in the Node launcher.
> 
> ---
> 
> ## Minimal patch (path + timing + logging)
> 
> ### 1) Use runtime dir for the socket (not /tmp)
> Some systems get weird about /tmp; the user runtime dir is safer.
> 
> ```diff
> -const SOCKET = args.socket || "/tmp/ytwall.sock";
> +const RUNTIME = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid?.() || process.env.UID || ''}`;
> +const SOCKET = args.socket || `${RUNTIME}/ytwall.sock`;
> ```
> Make sure the dir exists:
> ```diff
>  function startWallpaper() {
> - // cleanup stale socket
> - try { if (fscb.existsSync(SOCKET)) fscb.un(SOCKET); } catch {}
> + // ensure runtime dir + cleanup stale socket
> + try { if (RUNTIME) fscb.mkdirSync(RUNTIME, { recursive: true }); } catch {}
> + try { if (fscb.existsSync(SOCKET)) fscb.un(SOCKET); } catch {}
> ```
> 
> ### 2) Give mpv a moment and wait for the socket file to appear
> ```diff
> - // connect to mpv IPC after it has created the socket
> - setTimeout(() => { connectMpvSock().catch(e => console.error(e)); }, 400);
> + // wait for socket to appear, then connect
> + const start = Date.now();
> + const poll = setInterval(() => {
> + if (fscb.existsSync(SOCKET)) {
> + clearInterval(poll);
> + connectMpvSock().catch(e => console.error(e));
> + } else if (Date.now() - start > 15000) {
> + clearInterval(poll);
> + console.error("mpv IPC socket never appeared:", SOCKET);
> + }
> + }, 250);
> ```
> 
> ### 3) Add mpv logging + keep it alive
> ```diff
>  const mpvArgs = [
>  "-wid", "WID",
>  `--input-ipc-server=${SOCKET}`,
>  `--volume=${VOLUME}`,
>  "--loop-playlist=inf",
> + "--idle=once",
>  ...(SHUFFLE ? ["--shuffle"] : []),
>  "--no-osc", "--no-osd-bar", "--hwdec=auto-copy",
>  `--script-opts=ytdl_hook-ytdl_path=${YTDL}`,
>  "--ytdl-raw-options=force-ipv4=",
> + "--msg-level=ipc=trace,ytdl_hook=info",
> + "--log-file=/tmp/mpv-wall.log",
>  ];
> ```
> If it still won’t connect, **tail the log**:
> ```bash
> tail -n +1 -f /tmp/mpv-wall.log
> ```
> 
> ---
> 
> ## Common gotchas
> 
> - **Different user**: If you ever started mpv as `root`/`sudo` and Node as your user (or vice versa), you won’t be allowed to connect. Run both as **the same user**.
> - **Stale socket**: a SIGKILL’d mpv leaves a dead file; we now `unlink` before start.
> - **Wayland**: this whole xwinwrap trick is for Xorg (i3/picom). On Wayland, use mpv’s `--wid` equivalent hacks or a different compositor approach.
> - **Flatpak mpv**: sandboxed builds sometimes put the socket in a sandbox path. Prefer the distro `mpv`.
> 
> ---
> 
> ## Emergency fallback (works even if IPC is cursed)
> 
> If you need the overlay **now**, switch the backend to **MPRIS polling** until IPC behaves:
> 
> ```bash
> sudo apt install mpv-mpris playerctl
> ```
> 
> Then in `server.mjs`, add a poller that updates `current.title` every 1s:
> 
> ```js
> import { spawnSync } from "node:child_process";
> 
> function pollMPRIS() {
>  try {
>  const out = spawnSync("playerctl", ["-p", "mpv", "metadata", "--format", "{{artist}} — {{title}}"], { encoding: "utf8" });
>  if (out.status === 0 && out.stdout.trim()) {
>  current.title = out.stdout.trim();
>  broadcast({ type: "track", title: current.title });
>  }
>  } catch {}
> }
> setInterval(pollMPRIS, 1000);
> ```
> 
> That keeps the overlay updating while we sort out IPC.
> 
> ---
> 
> If you paste me the first ~30 lines of `/tmp/mpv-wall.log` (or confirm whether the manual `mpv --input-ipc-server` test works), I’ll zero in further.
<!-- UID: fa00eb77-abe9-4246-b170-a3ecb953103a -->

---




>[!nexus_user] **User** - 08/13/2025 at 2:19 PM
> ahh... I fixed it... the original code didn't start the wall paper until after it tried to connect to the socket. But the wallpaper also created the socket.
<!-- UID: 67d32a3b-5b0d-436d-a3f8-9deb5626c923 -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 2:19 PM
> nice catch — yep, order-of-operations bites here: mpv creates the IPC socket *after* it starts, so trying to connect first = 💥.
> 
> If you want this totally bullet-proof, drop in this tiny patch so the backend **waits for the socket file** to appear, uses a safer socket location, and **auto-reconnects** if mpv restarts.
> 
> ### Minimal hardening patch (paste into your `server.mjs`)
> ```diff
> @@
> -import { promises as fs } from "node:fs";
> +import { promises as fs } from "node:fs";
>  import fscb from "node:fs";
> @@
> -const SOCKET = args.socket || "/tmp/ytwall.sock";
> +const RUNTIME = process.env.XDG_RUNTIME_DIR || `/run/user/${process.getuid?.() || process.env.UID || ""}`;
> +const SOCKET = args.socket || `${RUNTIME}/ytwall.sock`;
> @@
>  let mpvSock = null;
> @@
>  async function connectMpvSock(retries = 60) {
> - return await new Promise((resolve, reject) => {
> + return await new Promise((resolve, reject) => {
>  const attempt = () => {
>  const s = net.createConnection(SOCKET, () => {
>  mpvSock = s; wireMpvIPC(s); resolve();
>  });
>  s.on("error", () => { if (retries-- > 0) setTimeout(attempt, 250); else reject(new Error("mpv IPC connect failed")); });
>  };
>  attempt();
>  });
>  }
> @@
>  function startWallpaper() {
> - // cleanup stale socket
> - try { if (fscb.existsSync(SOCKET)) fscb.un(SOCKET); } catch {}
> + // ensure runtime dir + cleanup stale socket
> + try { if (RUNTIME) fscb.mkdirSync(RUNTIME, { recursive: true }); } catch {}
> + try { if (fscb.existsSync(SOCKET)) fscb.un(SOCKET); } catch {}
> @@
>  xwrapProc = spawn(XWINWRAP, xArgs, { stdio: "ignore" });
>  xwrapProc.on("exit", (code, sig) => { console.log("xwinwrap exited", code, sig); process.exit(0); });
>  
> - // connect to mpv IPC after it has created the socket
> - setTimeout(() => { connectMpvSock().catch(e => console.error(e)); }, 400);
> + // wait for socket to appear, then connect (robust vs. timing)
> + const start = Date.now();
> + const poll = setInterval(() => {
> + if (fscb.existsSync(SOCKET)) {
> + clearInterval(poll);
> + connectMpvSock().catch(e => console.error(e));
> + } else if (Date.now() - start > 15000) {
> + clearInterval(poll);
> + console.error("mpv IPC socket never appeared:", SOCKET);
> + }
> + }, 200);
>  }
> @@
>  function wireMpvIPC(s) {
>  let buf = "";
>  s.on("data", (d) => {
> @@
>  });
> + // auto-reconnect if mpv restarts
> + s.on("close", () => {
> + mpvSock = null;
> + console.warn("mpv IPC closed; attempting reconnect…");
> + connectMpvSock().catch(() => {/* will retry on next loop */});
> + });
>  mpvSend(["observe_property", 1, "media-title"]);
>  mpvSend(["observe_property", 2, "metadata"]);
> ```
> 
> ### (Optional) keep mpv alive & log IPC for debugging
> Add these to `mpvArgs`:
> ```diff
> + "--idle=once",
> + "--msg-level=ipc=trace,ytdl_hook=info",
> + "--log-file=/tmp/mpv-wall.log",
> ```
> Now if metadata ever stops flowing, `tail -f /tmp/mpv-wall.log` will tell you why.
> 
> ---
> 
> If you want, I can also push this patch into the canvas version of `server.mjs` so your copy of the project has it baked in.
<!-- UID: 9eb9a248-ff52-4663-ba5e-74784a7cd0f7 -->

---




>[!nexus_user] **User** - 08/13/2025 at 2:29 PM
> I want to start this with i3
<!-- UID: 7b066f7d-8275-4958-96de-f6f419b76379 -->




>[!nexus_agent] **Assistant** - 08/13/2025 at 2:29 PM
> yep—two solid ways. pick your vibe:
> 
> # Option A: start it straight from i3 (simple)
> 
> Add this to `~/.config/i3/config` (adjust the path/URL):
> 
> ```i3
> # --- ytwall: start on i3 start/reload (but only once) ---
> set $ytwall_cmd bash -lc 'cd ~/ytwall && \
>  pgrep -f "node .*server.mjs" >/dev/null || \
>  node server.mjs --playlist ~/.config/ytwall.m3u \
>  --public ./public --port 3323 --volume 25 \
>  --ytdl /usr/local/bin/yt-dlp --socket /tmp/ytwall.sock & disown'
> 
> # start at login (and on reload) without duplicating
> exec_always --no-startup-id $ytwall_cmd
> 
> # quick controls
> bindsym $mod+Shift+Right exec --no-startup-id curl -s http://localhost:3323/api/next
> bindsym $mod+Shift+Left exec --no-startup-id curl -s http://localhost:3323/api/prev
> bindsym $mod+Shift+space exec --no-startup-id curl -s http://localhost:3323/api/pause
> bindsym $mod+Shift+comma exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=-5"
> bindsym $mod+Shift+period exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=5"
> 
> # emergency stop
> bindsym $mod+Shift+u exec --no-startup-id bash -lc 'pkill -f "xwinwrap.*mpv -wid WID"; pkill -f "node .*server.mjs"'
> ```
> 
> Reload i3 (`$mod+Shift+c`) and it should spin up. 
> If you’re using the hardened socket path, switch `--socket` to something like `--socket "/run/user/$(id -u)/ytwall.sock"`.
> 
> ---
> 
> # Option B (recommended): systemd user service + i3 hook (robust)
> 
> Create `~/.config/systemd/user/ytwall.service`:
> 
> ```ini
> [Unit]
> Description=ytwall wallpaper + overlay
> After=graphical-session.target network-online.target
> 
> [Service]
> Type=simple
> WorkingDirectory=%h/ytwall
> ExecStart=/usr/bin/env node server.mjs --playlist %h/.config/ytwall.m3u \
>  --public ./public --port 3323 --volume 25 \
>  --ytdl /usr/local/bin/yt-dlp --socket /run/user/%U/ytwall.sock
> Restart=on-failure
> RestartSec=2
> Environment=NODE_ENV=production
> 
> [Install]
> WantedBy=default.target
> ```
> 
> Enable & start:
> 
> ```bash
> systemctl --user daemon-reload
> systemctl --user enable --now ytwall.service
> ```
> 
> Then in i3, just ensure it’s running (and bind controls):
> 
> ```i3
> # make sure the service is up on session start/reload
> exec_always --no-startup-id systemctl --user start ytwall.service
> 
> # controls (same as above)
> bindsym $mod+Shift+Right exec --no-startup-id curl -s http://localhost:3323/api/next
> bindsym $mod+Shift+Left exec --no-startup-id curl -s http://localhost:3323/api/prev
> bindsym $mod+Shift+space exec --no-startup-id curl -s http://localhost:3323/api/pause
> bindsym $mod+Shift+comma exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=-5"
> bindsym $mod+Shift+period exec --no-startup-id curl -s "http://localhost:3323/api/vol?delta=5"
> 
> # stop/restart via keys if you want
> bindsym $mod+Shift+y exec --no-startup-id systemctl --user restart ytwall.service
> bindsym $mod+Shift+u exec --no-startup-id systemctl --user stop ytwall.service
> ```
> 
> ---
> 
> ## Tips / gotchas
> 
> - If OBS overlay is blank, hit `http://localhost:3323/health` in a browser—should return `{"ok":true,...}`.
> - If the socket connection ever races, use the service version above or pass the runtime path explicitly:
>  ```
>  --socket "/run/user/$(id -u)/ytwall.sock"
>  ```
> - On i3 reload, `exec_always` runs again—hence the `pgrep` guard (Option A) or using systemd (Option B) to avoid dupes.
> 
> Want me to drop these into your canvas and include a tiny `ytwallctl` helper script (start/stop/next/prev)?
<!-- UID: 7095543c-29f3-4aaf-9fa9-72a7192e875c -->

---




>[!nexus_user] **User** - 08/15/2025 at 10:24 AM
> the youtube wall paper runs for like a video and a half then it stops.
> 
> ## Server logs
> ```
> Aug 15 10:03:11 node[100911]: {"event":"video-reconfig"}
> Aug 15 10:03:11 node[100911]: {"event":"video-reconfig"}
> Aug 15 10:03:11 node[100911]: {"event":"playback-restart"}
> Aug 15 10:07:21 node[100911]: {"event":"audio-reconfig"}
> Aug 15 10:07:21 node[100911]: {"event":"video-reconfig"}
> Aug 15 10:07:21 node[100911]: {"event":"end-file","reason":"eof","playlist_entry_id":62}
> Aug 15 10:07:21 node[100911]: {"event":"start-file","playlist_entry_id":17}
> Aug 15 10:07:21 node[100911]: {"event":"property-change","id":1,"name":"media-title","data":"watch?v=kWe23jfqNZo"}
> Aug 15 10:07:21 node[100911]: {
> Aug 15 10:07:21 node[100911]: title: 'watch?v=kWe23jfqNZo',
> Aug 15 10:07:21 node[100911]: artist: '',
> Aug 15 10:07:21 node[100911]: meta: {
> Aug 15 10:07:21 node[100911]: major_brand: 'mp42',
> Aug 15 10:07:21 node[100911]: minor_version: '0',
> Aug 15 10:07:21 node[100911]: compatible_brands: 'isommp42',
> Aug 15 10:07:21 node[100911]: creation_time: '2023-12-16T12:01:50.000000Z',
> Aug 15 10:07:21 node[100911]: ytdl_description: "'Open Your Eyes'\n" +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: 'ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '- Music by Essbee\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: 'Twitter : https://twitter.com/Essbee1203\n' +
> Aug 15 10:07:21 node[100911]: 'Soundcloud : https://soundcloud.com/essbee1203\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '- Illustration by Midjourney\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '- Video made in: https://vizzy.io\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '\n' +
> Aug 15 10:07:21 node[100911]: '#drumandbass #dnb #drumnbass',
> Aug 15 10:07:21 node[100911]: uploader: 'Essbee',
> Aug 15 10:07:21 node[100911]: channel_url: 'https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ'
> Aug 15 10:07:21 node[100911]: }
> Aug 15 10:07:21 node[100911]: }
> Aug 15 10:07:21 node[100911]: {"event":"property-change","id":2,"name":"metadata"}
> Aug 15 10:07:21 node[100911]: { title: 'watch?v=kWe23jfqNZo', artist: '', meta: {} }
> Aug 15 10:07:29 node[100911]: {"event":"property-change","id":1,"name":"media-title","data":"CITRUS!"}
> Aug 15 10:07:29 node[100911]: { title: 'CITRUS!', artist: '', meta: {} }
> Aug 15 10:07:29 node[100911]: {"event":"audio-reconfig"}
> Aug 15 10:07:29 node[100911]: {"event":"audio-reconfig"}
> Aug 15 10:07:29 node[100911]: {"event":"file-loaded"}
> Aug 15 10:07:29 node[100911]: {"event":"property-change","id":2,"name":"metadata","data":{"major_brand":"mp42","minor_vers>
> Aug 15 10:07:29 node[100911]: {
> Aug 15 10:07:29 node[100911]: title: 'CITRUS!',
> Aug 15 10:07:29 node[100911]: artist: '',
> Aug 15 10:07:29 node[100911]: meta: {
> Aug 15 10:07:29 node[100911]: major_brand: 'mp42',
> Aug 15 10:07:29 node[100911]: minor_version: '0',
> Aug 15 10:07:29 node[100911]: compatible_brands: 'isommp42',
> Aug 15 10:07:29 node[100911]: creation_time: '2023-10-30T05:00:29.000000Z',
> Aug 15 10:07:29 node[100911]: ytdl_description: 'Provided to YouTube by DistroKid\n' +
> Aug 15 10:07:29 node[100911]: '\n' +
> Aug 15 10:07:29 node[100911]: 'CITRUS! · lianhua\n' +
> Aug 15 10:07:29 node[100911]: '\n' +
> Aug 15 10:07:29 node[100911]: 'CITRUS!\n' +
> Aug 15 10:07:29 node[100911]: '\n' +
> Aug 15 10:07:29 node[100911]: '℗ 4493981 Records DK\n' +
> Aug 15 10:07:29 node[100911]: '\n' +
> Aug 15 10:07:29 node[100911]: 'Released on: 2023-10-06\n' +
> Aug 15 10:07:29 node[100911]: '\n' +
> Aug 15 10:07:29 node[100911]: 'Auto-generated by YouTube.',
> Aug 15 10:07:29 node[100911]: uploader: 'lianhua',
> Aug 15 10:07:29 node[100911]: channel_url: 'https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw'
> Aug 15 10:07:29 node[100911]: }
> Aug 15 10:07:29 node[100911]: }
> Aug 15 10:07:30 node[100911]: {"event":"video-reconfig"}
> Aug 15 10:07:30 node[100911]: {"event":"video-reconfig"}
> Aug 15 10:07:30 node[100911]: {"event":"playback-restart"}
> Aug 15 10:07:47 node[100911]: {"data":null,"request_id":0,"error":"success"}
> Aug 15 10:07:47 node[100911]: {"data":null,"request_id":0,"error":"success"}
> Aug 15 10:07:48 node[100911]: {"data":null,"request_id":0,"error":"success"}
> Aug 15 10:07:48 node[100911]: {"data":null,"request_id":0,"error":"success"}
> Aug 15 10:07:48 node[100911]: {"data":null,"request_id":0,"error":"success"}
> Aug 15 10:07:49 node[100911]: {"data":null,"request_id":0,"error":"success"}
> lines 2326-2403/2403 (END)
> ```
> 
> ## MPV logs
> 
> ```
> [ 0.000][d][global] user path: '/tmp/mpv-wall.log' -> '/tmp/mpv-wall.log'
> [ 0.002][v][cplayer] mpv 0.37.0 Copyright © 2000-2023 mpv/MPlayer/mplayer2 projects
> [ 0.002][v][cplayer] libplacebo version: v6.338.2
> [ 0.002][v][cplayer] FFmpeg version: 6.1.1-3ubuntu5
> [ 0.002][v][cplayer] FFmpeg library versions:
> [ 0.002][v][cplayer] libavutil 58.29.100
> [ 0.002][v][cplayer] libavcodec 60.31.102
> [ 0.002][v][cplayer] libavformat 60.16.100
> [ 0.002][v][cplayer] libswscale 7.5.100
> [ 0.002][v][cplayer] libavfilter 9.12.100
> [ 0.002][v][cplayer] libswresample 4.12.100
> [ 0.002][v][cplayer] 
> [ 0.002][v][cplayer] Configuration: -Dpython.bytecompile=-1 -Dlibmpv=true -Dbuild-date=false -Dcdda=enabled -Ddvdnav=enabled -Dsdl2=enabled -Dsndio=disabled -Ddvbin=enabled -Dprefix=/usr -Dlibdir=lib/x86_64-linux-gnu -Dlocalstatedir=/var -Dsysconfdir=/etc -Dbuildtype=plain -Dwrap_mode=nodownload
> [ 0.002][v][cplayer] List of enabled features: alsa av-channel-layout avif-muxer caca cdda cplugins cuda-hwaccel cuda-interop dmabuf-interop-gl dmabuf-wayland drm dvbin dvdnav egl egl-drm egl-helpers egl-wayland egl-x11 ffmpeg ffnvcodec gbm gl glibc-thread-name glob glob-posix gpl iconv jack javascript jpeg jpegxl lavu-uuid lcms2 libarchive libass libavdevice libbluray libdl libm libplacebo librt linux-fstatfs lua52 manpage-build memfd-create noexecstack pipewire posix posix-shm ppoll pulse rubberband rubberband-3 sdl2 sdl2-audio sdl2-gamepad sdl2-video sixel spirv-cross threads uchardet vaapi vaapi-drm vaapi-wayland vaapi-x11 vdpau vector vk-khr-display vt.h vulkan vulkan-interop wayland wayland-protocols-1-27 wayland-protocols-1-31 wayland-protocols-1-32 x11 xv zimg zimg-st428 zlib
> [ 0.002][v][cplayer] Command line options: '-wid' '0x1c00001' '--input-ipc-server=/run/user/1000/ytwall.sock' '--volume=25' '--idle=yes' '--loop-playlist=inf' '--shuffle' '--no-osc' '--no-osd-bar' '--hwdec=auto-copy' '--script-opts=ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp' '--ytdl-raw-options=force-ipv4=' '--force-window' '--msg-level=ipc=trace,ytdl_hook=info' '--log-file=/tmp/mpv-wall.log' '--playlist=/home/err/devel/desktop/allowed.m3u'
> [ 0.002][v][cplayer] mpv 0.37.0 Copyright © 2000-2023 mpv/MPlayer/mplayer2 projects
> [ 0.002][v][cplayer] libplacebo version: v6.338.2
> [ 0.002][v][cplayer] FFmpeg version: 6.1.1-3ubuntu5
> [ 0.002][v][cplayer] FFmpeg library versions:
> [ 0.002][v][cplayer] libavutil 58.29.100
> [ 0.002][v][cplayer] libavcodec 60.31.102
> [ 0.002][v][cplayer] libavformat 60.16.100
> [ 0.002][v][cplayer] libswscale 7.5.100
> [ 0.002][v][cplayer] libavfilter 9.12.100
> [ 0.002][v][cplayer] libswresample 4.12.100
> [ 0.002][v][cplayer] 
> [ 0.002][v][cplayer] Configuration: -Dpython.bytecompile=-1 -Dlibmpv=true -Dbuild-date=false -Dcdda=enabled -Ddvdnav=enabled -Dsdl2=enabled -Dsndio=disabled -Ddvbin=enabled -Dprefix=/usr -Dlibdir=lib/x86_64-linux-gnu -Dlocalstatedir=/var -Dsysconfdir=/etc -Dbuildtype=plain -Dwrap_mode=nodownload
> [ 0.002][v][cplayer] List of enabled features: alsa av-channel-layout avif-muxer caca cdda cplugins cuda-hwaccel cuda-interop dmabuf-interop-gl dmabuf-wayland drm dvbin dvdnav egl egl-drm egl-helpers egl-wayland egl-x11 ffmpeg ffnvcodec gbm gl glibc-thread-name glob glob-posix gpl iconv jack javascript jpeg jpegxl lavu-uuid lcms2 libarchive libass libavdevice libbluray libdl libm libplacebo librt linux-fstatfs lua52 manpage-build memfd-create noexecstack pipewire posix posix-shm ppoll pulse rubberband rubberband-3 sdl2 sdl2-audio sdl2-gamepad sdl2-video sixel spirv-cross threads uchardet vaapi vaapi-drm vaapi-wayland vaapi-x11 vdpau vector vk-khr-display vt.h vulkan vulkan-interop wayland wayland-protocols-1-27 wayland-protocols-1-31 wayland-protocols-1-32 x11 xv zimg zimg-st428 zlib
> [ 0.002][d][global] home path: '' -> '/home/err/.config/mpv'
> [ 0.002][d][global] user path: '~~home/' -> '/home/err/.config/mpv'
> [ 0.002][d][global] user path: '~~old_home/' -> '/home/err/.mpv'
> [ 0.002][d][global] config path: 'encoding-profiles.conf' -/-> '/home/err/.config/mpv/encoding-profiles.conf'
> [ 0.002][d][global] config path: 'encoding-profiles.conf' -/-> '/home/err/.mpv/encoding-profiles.conf'
> [ 0.002][d][global] config path: 'encoding-profiles.conf' -> '/etc/mpv/encoding-profiles.conf'
> [ 0.002][v][cplayer] Reading config file /etc/mpv/encoding-profiles.conf
> [ 0.002][v][ifo_dvdnav] Opening /etc/mpv/encoding-profiles.conf
> [ 0.002][v][bdmv/bluray] Opening /etc/mpv/encoding-profiles.conf
> [ 0.002][v][file] Opening /etc/mpv/encoding-profiles.conf
> [ 0.002][d][file] resize stream to 131072 bytes, drop 0 bytes
> [ 0.002][d][file] Stream opened successfully.
> [ 0.002][v][cplayer] Applying profile 'default'...
> [ 0.002][d][global] config path: 'mpv.conf' -/-> '/home/err/.config/mpv/mpv.conf'
> [ 0.002][d][global] config path: 'config' -/-> '/home/err/.config/mpv/config'
> [ 0.002][d][global] config path: 'mpv.conf' -/-> '/home/err/.mpv/mpv.conf'
> [ 0.002][d][global] config path: 'config' -/-> '/home/err/.mpv/config'
> [ 0.002][d][global] config path: 'mpv.conf' -> '/etc/mpv/mpv.conf'
> [ 0.002][d][global] config path: 'config' -/-> '/etc/mpv/config'
> [ 0.002][v][cplayer] Reading config file /etc/mpv/mpv.conf
> [ 0.002][v][ifo_dvdnav] Opening /etc/mpv/mpv.conf
> [ 0.002][v][bdmv/bluray] Opening /etc/mpv/mpv.conf
> [ 0.002][v][file] Opening /etc/mpv/mpv.conf
> [ 0.002][d][file] resize stream to 131072 bytes, drop 0 bytes
> [ 0.002][d][file] Stream opened successfully.
> [ 0.002][v][cplayer] Applying profile 'default'...
> [ 0.002][v][cplayer] Setting option 'hwdec' = 'vaapi' (flags = 4)
> [ 0.002][v][cplayer] Setting option 'wid' = '0x1c00001' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'input-ipc-server' = '/run/user/1000/ytwall.sock' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'volume' = '25' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'idle' = 'yes' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'loop-playlist' = 'inf' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'shuffle' = '' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'osc' = 'no' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'osd-bar' = 'no' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'hwdec' = 'auto-copy' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'script-opts' = 'ytdl_hook-ytdl_path=/usr/local/bin/yt-dlp' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'ytdl-raw-options' = 'force-ipv4=' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'force-window' = '' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'msg-level' = 'ipc=trace,ytdl_hook=info' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'log-file' = '/tmp/mpv-wall.log' (flags = 8)
> [ 0.002][v][cplayer] Setting option 'playlist' = '/home/err/devel/desktop/allowed.m3u' (flags = 8)
> [ 0.002][v][playlist_parser] Parsing playlist file /home/err/devel/desktop/allowed.m3u...
> [ 0.002][v][ifo_dvdnav] Opening /home/err/devel/desktop/allowed.m3u
> [ 0.002][v][bdmv/bluray] Opening /home/err/devel/desktop/allowed.m3u
> [ 0.002][v][file] Opening /home/err/devel/desktop/allowed.m3u
> [ 0.002][d][file] resize stream to 131072 bytes, drop 0 bytes
> [ 0.002][d][file] Stream opened successfully.
> [ 0.002][v][demux] Trying demuxers for level=request.
> [ 0.002][d][demux] Trying demuxer: playlist (force-level: request)
> [ 0.011][w][playlist] Reading plaintext playlist.
> [ 0.011][v][playlist] demuxer read all data; closing stream
> [ 0.011][v][demux] Detected file format: txt (Playlist file)
> [ 0.011][v][playlist_parser] Playlist successfully parsed
> [ 0.012][d][global] config path: 'input.conf' -/-> '/home/err/.config/mpv/input.conf'
> [ 0.012][d][global] config path: 'input.conf' -/-> '/home/err/.mpv/input.conf'
> [ 0.012][d][global] config path: 'input.conf' -/-> '/etc/mpv/input.conf'
> [ 0.012][d][global] user path: '/tmp/mpv-wall.log' -> '/tmp/mpv-wall.log'
> [ 0.012][d][ytdl_hook] Loading lua script @ytdl_hook.lua...
> [ 0.012][d][stats] Loading lua script @stats.lua...
> [ 0.012][d][console] Loading lua script @console.lua...
> [ 0.012][d][auto_profiles] Loading lua script @auto_profiles.lua...
> [ 0.012][d][ytdl_hook] loading mp.defaults
> [ 0.012][d][auto_profiles] loading mp.defaults
> [ 0.012][d][global] user path: '/run/user/1000/ytwall.sock' -> '/run/user/1000/ytwall.sock'
> [ 0.012][d][global] config path: 'scripts' -/-> '/home/err/.config/mpv/scripts'
> [ 0.012][d][global] config path: 'scripts' -/-> '/home/err/.mpv/scripts'
> [ 0.012][d][global] config path: 'scripts' -/-> '/etc/mpv/scripts'
> [ 0.012][v][cplayer] Waiting for scripts...
> [ 0.012][d][console] loading mp.defaults
> [ 0.012][d][stats] loading mp.defaults
> [ 0.012][v][ipc] Starting IPC master
> [ 0.012][v][ipc] Listening to IPC socket.
> [ 0.013][d][auto_profiles] loading @auto_profiles.lua
> [ 0.013][d][console] loading @console.lua
> [ 0.013][d][ytdl_hook] loading @ytdl_hook.lua
> [ 0.014][d][auto_profiles] Exiting...
> [ 0.014][d][console] reading options for console 
> [ 0.014][d][global] config path: 'script-opts/console.conf' -/-> '/home/err/.config/mpv/script-opts/console.conf'
> [ 0.014][d][global] config path: 'script-opts/console.conf' -/-> '/home/err/.mpv/script-opts/console.conf'
> [ 0.014][d][global] config path: 'script-opts/console.conf' -/-> '/etc/mpv/script-opts/console.conf'
> [ 0.014][d][console] script-opts/console.conf not found. 
> [ 0.014][d][global] config path: 'lua-settings/console.conf' -/-> '/home/err/.config/mpv/lua-settings/console.conf'
> [ 0.014][d][global] config path: 'lua-settings/console.conf' -/-> '/home/err/.mpv/lua-settings/console.conf'
> [ 0.014][d][global] config path: 'lua-settings/console.conf' -/-> '/etc/mpv/lua-settings/console.conf'
> [ 0.014][d][console] lua-settings/console.conf not found. 
> [ 0.014][d][ytdl_hook] reading options for ytdl_hook 
> [ 0.014][d][stats] loading @stats.lua
> [ 0.014][d][global] config path: 'script-opts/ytdl_hook.conf' -/-> '/home/err/.config/mpv/script-opts/ytdl_hook.conf'
> [ 0.014][d][global] config path: 'script-opts/ytdl_hook.conf' -/-> '/home/err/.mpv/script-opts/ytdl_hook.conf'
> [ 0.014][d][global] config path: 'script-opts/ytdl_hook.conf' -/-> '/etc/mpv/script-opts/ytdl_hook.conf'
> [ 0.014][d][ytdl_hook] script-opts/ytdl_hook.conf not found. 
> [ 0.014][d][global] config path: 'lua-settings/ytdl_hook.conf' -/-> '/home/err/.config/mpv/lua-settings/ytdl_hook.conf'
> [ 0.014][d][global] config path: 'lua-settings/ytdl_hook.conf' -/-> '/home/err/.mpv/lua-settings/ytdl_hook.conf'
> [ 0.014][d][global] config path: 'lua-settings/ytdl_hook.conf' -/-> '/etc/mpv/lua-settings/ytdl_hook.conf'
> [ 0.014][d][ytdl_hook] lua-settings/ytdl_hook.conf not found. 
> [ 0.014][d][cplayer] Run command: define-section, flags=64, args=[name="input_console", contents="", flags="default"]
> [ 0.014][d][cplayer] Run command: enable-section, flags=64, args=[name="input_console", flags="allow-hide-cursor+allow-vo-dragging"]
> [ 0.014][d][cplayer] Run command: define-section, flags=64, args=[name="input_forced_console", contents="", flags="force"]
> [ 0.014][d][cplayer] Run command: enable-section, flags=64, args=[name="input_forced_console", flags="allow-hide-cursor+allow-vo-dragging"]
> [ 0.015][d][stats] reading options for stats 
> [ 0.015][d][global] config path: 'script-opts/stats.conf' -/-> '/home/err/.config/mpv/script-opts/stats.conf'
> [ 0.015][d][global] config path: 'script-opts/stats.conf' -/-> '/home/err/.mpv/script-opts/stats.conf'
> [ 0.015][d][global] config path: 'script-opts/stats.conf' -/-> '/etc/mpv/script-opts/stats.conf'
> [ 0.015][d][stats] script-opts/stats.conf not found. 
> [ 0.015][d][global] config path: 'lua-settings/stats.conf' -/-> '/home/err/.config/mpv/lua-settings/stats.conf'
> [ 0.015][d][global] config path: 'lua-settings/stats.conf' -/-> '/home/err/.mpv/lua-settings/stats.conf'
> [ 0.015][d][global] config path: 'lua-settings/stats.conf' -/-> '/etc/mpv/lua-settings/stats.conf'
> [ 0.015][d][stats] lua-settings/stats.conf not found. 
> [ 0.015][v][cplayer] Done loading scripts.
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 0.015][i][cplayer] Playing: https://www.youtube.com/watch?v=49PLUJ-LFJ4
> [ 0.015][v][cplayer] Running hook: ytdl_hook/on_load
> [ 0.015][v][ytdl_hook] ytdl:// hook 
> [ 0.015][v][ytdl_hook] not a ytdl:// url 
> [ 0.015][d][cplayer] Run command: define-section, flags=64, args=[name="input_stats", contents="", flags="default"]
> [ 0.015][v][cplayer] Running hook: ytdl_hook/on_load
> [ 0.015][v][ytdl_hook] playlist hook 
> [ 0.015][d][cplayer] Run command: enable-section, flags=64, args=[name="input_stats", flags="allow-hide-cursor+allow-vo-dragging"]
> [ 0.015][d][cplayer] Run command: define-section, flags=64, args=[name="input_forced_stats", contents="", flags="force"]
> [ 0.015][d][cplayer] Run command: enable-section, flags=64, args=[name="input_forced_stats", flags="allow-hide-cursor+allow-vo-dragging"]
> [ 0.016][v][ffmpeg] Opening https://www.youtube.com/watch?v=49PLUJ-LFJ4
> [ 0.050][d][ffmpeg] tcp: Starting connection attempt to 2607:f8b0:4009:801::200e port 443
> [ 0.087][d][ffmpeg] tcp: Successfully connected to 2607:f8b0:4009:801::200e port 443
> [ 0.325][d][ffmpeg] resize stream to 131072 bytes, drop 0 bytes
> [ 0.325][v][ffmpeg] Mime-type: 'text/html'
> [ 0.325][d][ffmpeg] Stream opened successfully.
> [ 0.325][v][demux] Trying demuxers for level=normal.
> [ 0.325][d][demux] Trying demuxer: disc (force-level: normal)
> [ 0.325][d][demux] Trying demuxer: edl (force-level: normal)
> [ 0.327][d][demux] Trying demuxer: cue (force-level: normal)
> [ 0.327][d][demux] Trying demuxer: rawaudio (force-level: normal)
> [ 0.327][d][demux] Trying demuxer: rawvideo (force-level: normal)
> [ 0.327][d][demux] Trying demuxer: mkv (force-level: normal)
> [ 0.327][d][demux] Trying demuxer: libarchive (force-level: normal)
> [ 0.328][d][demux] Trying demuxer: lavf (force-level: normal)
> [ 0.432][d][ffmpeg] resize stream to 262144 bytes, drop 0 bytes
> [ 0.477][d][ffmpeg] resize stream to 524288 bytes, drop 0 bytes
> [ 0.535][d][ffmpeg] resize stream to 1048576 bytes, drop 0 bytes
> [ 0.962][v][ipc_0] Client connected
> [ 1.110][d][ffmpeg] resize stream to 2097152 bytes, drop 0 bytes
> [ 1.127][d][ffmpeg] resize stream to 4194304 bytes, drop 0 bytes
> [ 1.144][v][lavf] No format found, try lowering probescore or forcing the format.
> [ 1.144][d][demux] Trying demuxer: mf (force-level: normal)
> [ 1.144][d][demux] Trying demuxer: playlist (force-level: normal)
> [ 1.144][d][demux] Trying demuxer: null (force-level: normal)
> [ 1.144][v][demux] Trying demuxers for level=unsafe.
> [ 1.144][d][demux] Trying demuxer: disc (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: edl (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: cue (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: rawaudio (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: rawvideo (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: mkv (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: libarchive (force-level: unsafe)
> [ 1.144][d][demux] Trying demuxer: lavf (force-level: unsafe)
> [ 1.178][d][ffmpeg] resize stream to 2097152 bytes, drop 0 bytes
> [ 1.195][d][ffmpeg] resize stream to 4194304 bytes, drop 0 bytes
> [ 1.210][v][lavf] No format found, try lowering probescore or forcing the format.
> [ 1.210][d][demux] Trying demuxer: mf (force-level: unsafe)
> [ 1.210][d][demux] Trying demuxer: playlist (force-level: unsafe)
> [ 1.210][d][demux] Trying demuxer: null (force-level: unsafe)
> [ 1.210][d][ffmpeg] AVIOContext: Statistics: 1054060 bytes read, 0 seeks
> [ 1.210][v][cplayer] Opening failed or was aborted: https://www.youtube.com/watch?v=49PLUJ-LFJ4
> [ 1.211][v][cplayer] Running hook: ytdl_hook/on_load_fail
> [ 1.211][v][ytdl_hook] full hook 
> [ 1.211][d][global] config path: '/usr/local/bin/yt-dlp' -> '/usr/local/bin/yt-dlp'
> [ 1.211][v][ytdl_hook] Found youtube-dl at: /usr/local/bin/yt-dlp 
> [ 1.211][d][ytdl_hook] Running: /usr/local/bin/yt-dlp --no-warnings -J --flat-playlist --sub-format ass/srt/best --format bestvideo+bestaudio/best --force-ipv4 --all-subs --no-playlist -- https://www.youtube.com/watch?v=49PLUJ-LFJ4 
> [ 1.211][d][cplayer] Run command: subprocess, flags=64, args=[args="/usr/local/bin/yt-dlp,--no-warnings,-J,--flat-playlist,--sub-format,ass/srt/best,--format,bestvideo+bestaudio/best,--force-ipv4,--all-subs,--no-playlist,--,https://www.youtube.com/watch?v=49PLUJ-LFJ4", playback_only="yes", capture_size="67108864", capture_stdout="yes", capture_stderr="yes", detach="no", env="", stdin_data="", passthrough_stdin="no"]
> [ 9.659][v][ytdl_hook] youtube-dl succeeded! 
> [ 9.659][d][ytdl_hook] ytdl parsing took 0.007873 seconds 
> [ 9.659][d][ytdl_hook] No fragments to join into EDL 
> [ 9.659][v][cplayer] Set property: file-local-options/user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.24 Safari/537.36" -> 1
> [ 9.659][v][ytdl_hook] format selection: youtube-dl (separate) 
> [ 9.659][d][ytdl_hook] streamurl: edl://!new_stream;!no_clip;!no_chapters;%1132%https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D;!global_tags,ytdl_description=%418%'Open Your Eyes'
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] - Music by Essbee
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] Twitter : https://twitter.com/Essbee1203
> [ 9.659][d][ytdl_hook] Soundcloud : https://soundcloud.com/essbee1203
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] - Illustration by Midjourney
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] - Video made in: https://vizzy.io
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] 
> [ 9.659][d][ytdl_hook] #drumandbass #dnb #drumnbass,uploader=%6%Essbee,channel_url=%56%https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ 
> [ 9.659][v][cplayer] Set property: stream-open-filename="edl://!new_stream;!no_clip;!no_chapters;%1132%https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D;!global_tags,ytdl_description=%418%'Open Your Eyes'\n\n\nーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー\n\n- Music by Essbee\n\nTwitter : https://twitter.com/Essbee1203\nSoundcloud : https://soundcloud.com/essbee1203\n\n- Illustration by Midjourney\n\n- Video made in: https://vizzy.io\n\n＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n\n#drumandbass #dnb #drumnbass,uploader=%6%Essbee,channel_url=%56%https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ" -> 1
> [ 9.659][v][cplayer] Set property: file-local-options/force-media-title="Essbee - Open Your Eyes | Drum n Bass" -> 1
> [ 9.659][v][cplayer] Set property: file-local-options/stream-lavf-o={} -> 1
> [ 9.659][d][ytdl_hook] script running time: 0.008148 seconds 
> [ 9.659][v][edl] Opening edl://!new_stream;!no_clip;!no_chapters;%1132%https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D;!global_tags,ytdl_description=%418%'Open Your Eyes'
> [ 9.659][v][edl] 
> [ 9.659][v][edl] 
> [ 9.659][v][edl] ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
> [ 9.659][v][edl] 
> [ 9.659][v][edl] - Music by Essbee
> [ 9.659][v][edl] 
> [ 9.659][v][edl] Twitter : https://twitter.com/Essbee1203
> [ 9.659][v][edl] Soundcloud : https://soundcloud.com/essbee1203
> [ 9.659][v][edl] 
> [ 9.659][v][edl] - Illustration by Midjourney
> [ 9.659][v][edl] 
> [ 9.659][v][edl] - Video made in: https://vizzy.io
> [ 9.659][v][edl] 
> [ 9.659][v][edl] ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
> [ 9.659][v][edl] 
> [ 9.659][v][edl] 
> [ 9.659][v][edl] #drumandbass #dnb #drumnbass,uploader=%6%Essbee,channel_url=%56%https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ
> [ 9.659][d][edl] resize stream to 131072 bytes, drop 0 bytes
> [ 9.659][d][edl] Stream opened successfully.
> [ 9.659][v][demux] Trying demuxers for level=request.
> [ 9.659][d][demux] Trying demuxer: edl (force-level: request)
> [ 9.659][v][demux] Detected file format: Edit decision list
> [ 9.659][v][demux] Stream is not seekable.
> [ 9.659][v][demux] Opening segment 0...
> [ 9.659][v][ffmpeg] Opening https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D
> [ 9.661][d][ffmpeg] tcp: Starting connection attempt to 2607:fb90:f0:9::17 port 443
> [ 9.700][d][ffmpeg] tcp: Successfully connected to 2607:fb90:f0:9::17 port 443
> [ 9.856][d][ffmpeg] tcp: Starting connection attempt to 2607:f8b0:4017:39::9 port 443
> [ 9.897][d][ffmpeg] tcp: Successfully connected to 2607:f8b0:4017:39::9 port 443
> [ 10.021][d][ffmpeg] tcp: Starting connection attempt to 2607:f8b0:4017:39::9 port 443
> [ 10.060][d][ffmpeg] tcp: Successfully connected to 2607:f8b0:4017:39::9 port 443
> [ 10.373][d][ffmpeg] resize stream to 131072 bytes, drop 0 bytes
> [ 10.373][v][ffmpeg] Mime-type: 'video/mp4'
> [ 10.373][d][ffmpeg] Stream opened successfully.
> [ 10.373][v][demux] Trying demuxers for level=normal.
> [ 10.373][d][demux] Trying demuxer: disc (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: edl (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: cue (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: rawaudio (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: rawvideo (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: mkv (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: libarchive (force-level: normal)
> [ 10.373][d][demux] Trying demuxer: lavf (force-level: normal)
> [ 10.376][v][lavf] Found 'mov,mp4,m4a,3gp,3g2,mj2' at score=100 size=2048.
> [ 10.459][d][ffmpeg/demuxer] mov,mp4,m4a,3gp,3g2,mj2: Reconfiguring buffers to size 287698
> [ 10.460][v][demux] Detected file format: mov,mp4,m4a,3gp,3g2,mj2 (libavformat)
> [ 10.460][d][demux] Trying demuxer: timeline (force-level: force)
> [ 10.460][v][timeline] Timeline segments:
> [ 10.460][v][timeline] 0: 0.000000 - 249.684172 [ 0.000000] (0 1)
> [ 10.460][v][timeline] source 0:'https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D'
> [ 10.460][v][timeline] Total duration: 249.684172
> [ 10.460][v][demux] Detected file format: multi/mov,mp4,m4a,3gp,3g2,mj2 (timeline segments)
> [ 10.460][v][cplayer] Opening done: edl://!new_stream;!no_clip;!no_chapters;%1132%https://rr4---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755291783&ei=J0yfaKG-Cc2bzN0P9PDw4Aw&ip=172.58.14.45&id=o-AIT6YP5kmuf4c6WXSFtt0S-iuNWpG62LMenpG1o8AE5W&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270183%2C&mh=dP&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskned&ms=au%2Crdu&mv=m&mvi=4&pl=23&rms=au%2Cau&pcm2=yes&initcwndbps=2297500&bui=AY1jyLPiywny9_4YH7-orVJvZwUDFEPj0lNRjytMzbi3JyZ9b1sT2hQAkneprl4BJqI4iepv3A5eU724&spc=l3OVKe6i4xJ0hlkVgp58zo5r&vprv=1&svpuc=1&mime=video%2Fmp4&ns=m-P2jlqB0YawMApZDMBDzysQ&rqh=1&cnr=14&ratebypass=yes&dur=249.707&lmt=1702728747423295&mt=1755269836&fvip=4&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=5318224&n=WgyLYnw1EBWfMg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgD-S3pYpzrIa3bY_cC2tydLQOoUehvYhUtkdXbzfU39ACID8sEaZs0NbqqIABzSUpbeKrmuC4OQKQug0fjOxm9WS6&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgQKHFNgQ4n3M3Ss4-bhX9T7cCvvAXLwDJ_QTxMllfo5ECIQDcsPxMlFXiJlrXaRltz0rOiWKxN9RRqg--sX6ZThLDTw%3D%3D;!global_tags,ytdl_description=%418%'Open Your Eyes'
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] - Music by Essbee
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] Twitter : https://twitter.com/Essbee1203
> [ 10.460][v][cplayer] Soundcloud : https://soundcloud.com/essbee1203
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] - Illustration by Midjourney
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] - Video made in: https://vizzy.io
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] 
> [ 10.460][v][cplayer] #drumandbass #dnb #drumnbass,uploader=%6%Essbee,channel_url=%56%https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ
> [ 10.460][d][global] config path: 'sub' -/-> '/home/err/.config/mpv/sub'
> [ 10.460][d][global] config path: 'sub' -/-> '/home/err/.mpv/sub'
> [ 10.460][d][global] config path: 'sub' -/-> '/etc/mpv/sub'
> [ 10.460][v][cplayer] Running hook: ytdl_hook/on_preloaded
> [ 10.460][v][timeline] select track 0
> [ 10.460][v][timeline] select track 1
> [ 10.460][i][cplayer] (+) Video --vid=1 (*) (h264 640x360 30.000fps)
> [ 10.460][i][cplayer] (+) Audio --aid=1 (*) (aac 2ch 44100Hz)
> [ 10.460][i][display-tags] File tags:
> [ 10.460][i][display-tags] Uploader: Essbee
> [ 10.460][i][display-tags] Channel_URL: https://www.youtube.com/channel/UCGhFJuA-KVbeklN6uYxHsIQ
> [ 10.461][v][vo/gpu] Probing for best GPU context.
> [ 10.461][v][vo/gpu/opengl] Initializing GPU context 'wayland'
> [ 10.462][v][vo/gpu/opengl] Initializing GPU context 'x11egl'
> [ 10.462][v][vo/gpu/x11] X11 opening display: :1
> [ 10.465][d][vo/gpu/x11] X11 running at 2560x1600 (":1" => local display)
> [ 10.465][v][vo/gpu/x11] Display 0 (eDP-1): [0, 0, 2560, 1600] @ 240.000000 FPS
> [ 10.465][v][vo/gpu/x11] Current display FPS: 240.000000
> [ 10.526][v][vo/gpu/opengl] EGL_VERSION=1.5
> [ 10.526][v][vo/gpu/opengl] EGL_VENDOR=Mesa Project
> [ 10.526][v][vo/gpu/opengl] EGL_CLIENT_APIS=OpenGL OpenGL_ES 
> [ 10.526][v][vo/gpu/opengl] Trying to create Desktop OpenGL context.
> [ 10.526][d][vo/gpu/opengl] Chosen EGLConfig:
> [ 10.526][d][vo/gpu/opengl] EGL_CONFIG_ID=0x15
> [ 10.526][d][vo/gpu/opengl] EGL_RED_SIZE=0x8
> [ 10.526][d][vo/gpu/opengl] EGL_GREEN_SIZE=0x8
> [ 10.526][d][vo/gpu/opengl] EGL_BLUE_SIZE=0x8
> [ 10.526][d][vo/gpu/opengl] EGL_ALPHA_SIZE=0x0
> [ 10.526][d][vo/gpu/opengl] EGL_COLOR_BUFFER_TYPE=0x308e
> [ 10.526][d][vo/gpu/opengl] EGL_CONFIG_CAVEAT=0x3038
> [ 10.526][d][vo/gpu/opengl] EGL_CONFORMANT=0x4d
> [ 10.526][d][vo/gpu/opengl] EGL_NATIVE_VISUAL_ID=0x21
> [ 10.528][v][vo/gpu/opengl] Choosing visual EGL config 0x15, visual ID 0x21
> [ 10.528][v][vo/gpu/x11] The XPresent extension was found.
> [ 10.528][v][vo/gpu/x11] XPresent disabled.
> [ 10.528][v][vo/gpu/opengl] GL_VERSION='4.6 (Core Profile) Mesa 25.0.7-0ubuntu0.24.04.1'
> [ 10.528][v][vo/gpu/opengl] Detected desktop OpenGL 4.6.
> [ 10.528][v][vo/gpu/opengl] GL_VENDOR='Intel'
> [ 10.528][v][vo/gpu/opengl] GL_RENDERER='Mesa Intel(R) Arc(tm) Graphics (MTL)'
> [ 10.528][v][vo/gpu/opengl] GL_SHADING_LANGUAGE_VERSION='4.60'
> [ 10.528][d][vo/gpu/opengl] Combined OpenGL extensions string:
> [ 10.528][d][vo/gpu/opengl] EGL_ANDROID_blob_cache EGL_ANDROID_native_fence_sync EGL_CHROMIUM_sync_control EGL_ANGLE_sync_control_rate EGL_EXT_buffer_age EGL_EXT_config_select_group EGL_EXT_create_context_robustness EGL_EXT_image_dma_buf_import EGL_EXT_image_dma_buf_import_modifiers EGL_EXT_protected_content EGL_EXT_query_reset_notification_strategy EGL_EXT_surface_compression EGL_EXT_swap_buffers_with_damage EGL_IMG_context_priority EGL_KHR_cl_event2 EGL_KHR_config_attribs EGL_KHR_context_flush_control EGL_KHR_create_context EGL_KHR_create_context_no_error EGL_KHR_fence_sync EGL_KHR_get_all_proc_addresses EGL_KHR_gl_colorspace EGL_KHR_gl_renderbuffer_image EGL_KHR_gl_texture_2D_image EGL_KHR_gl_texture_3D_image EGL_KHR_gl_texture_cubemap_image EGL_KHR_image EGL_KHR_image_base EGL_KHR_image_pixmap EGL_KHR_no_config_context EGL_KHR_partial_update EGL_KHR_reusable_sync EGL_KHR_surfaceless_context EGL_KHR_swap_buffers_with_damage EGL_EXT_pixel_format_float EGL_KHR_wait_sync EGL_MESA_configless_context EGL_MESA_drm_image EGL_MESA_gl_interop EGL_MESA_image_dma_buf_export EGL_MESA_query_driver EGL_MESA_x11_native_visual_id EGL_NOK_texture_from_pixmap EGL_WL_bind_wayland_display GL_AMD_conservative_depth GL_AMD_depth_clamp_separate GL_AMD_draw_buffers_blend GL_AMD_gpu_shader_int64 GL_AMD_multi_draw_indirect GL_AMD_performance_monitor GL_AMD_query_buffer_object GL_AMD_seamless_cubemap_per_texture GL_AMD_shader_stencil_export GL_AMD_shader_trinary_minmax GL_AMD_texture_texture4 GL_AMD_vertex_shader_layer GL_AMD_vertex_shader_viewport_index GL_ANGLE_texture_compression_dxt3 GL_ANGLE_texture_compression_dxt5 GL_ARB_ES2_compatibility GL_ARB_ES3_1_compatibility GL_ARB_ES3_2_compatibility GL_ARB_ES3_compatibility GL_ARB_arrays_of_arrays GL_ARB_base_instance GL_ARB_blend_func_extended GL_ARB_buffer_storage GL_ARB_clear_buffer_object GL_ARB_clear_texture GL_ARB_clip_control GL_ARB_compressed_texture_pixel_storage GL_ARB_compute_shader GL_ARB_compute_variable_group_size GL_ARB_conditional_render_inverted GL_ARB_conservative_depth GL_ARB_copy_buffer GL_ARB_copy_image GL_ARB_cull_distance GL_ARB_debug_output GL_ARB_depth_buffer_float GL_ARB_depth_clamp GL_ARB_derivative_control GL_ARB_direct_state_access GL_ARB_draw_buffers GL_ARB_draw_buffers_blend GL_ARB_draw_elements_base_vertex GL_ARB_draw_indirect GL_ARB_draw_instanced GL_ARB_enhanced_layouts GL_ARB_explicit_attrib_location GL_ARB_explicit_uniform_location GL_ARB_fragment_coord_conventions GL_ARB_fragment_layer_viewport GL_ARB_fragment_shader GL_ARB_fragment_shader_interlock GL_ARB_framebuffer_no_attachments GL_ARB_framebuffer_object GL_ARB_framebuffer_sRGB GL_ARB_get_program_binary GL_ARB_get_texture_sub_image GL_ARB_gl_spirv GL_ARB_gpu_shader5 GL_ARB_gpu_shader_fp64 GL_ARB_gpu_shader_int64 GL_ARB_half_float_pixel GL_ARB_half_float_vertex GL_ARB_indirect_parameters GL_ARB_instanced_arrays GL_ARB_internalformat_query GL_ARB_internalformat_query2 GL_ARB_invalidate_subdata GL_ARB_map_buffer_alignment GL_ARB_map_buffer_range GL_ARB_multi_bind GL_ARB_multi_draw_indirect GL_ARB_occlusion_query2 GL_ARB_parallel_shader_compile GL_ARB_pipeline_statistics_query GL_ARB_pixel_buffer_object GL_ARB_point_sprite GL_ARB_polygon_offset_clamp GL_ARB_post_depth_coverage GL_ARB_program_interface_query GL_ARB_provoking_vertex GL_ARB_query_buffer_object GL_ARB_robust_buffer_access_behavior GL_ARB_robustness GL_ARB_sample_shading GL_ARB_sampler_objects GL_ARB_seamless_cube_map GL_ARB_seamless_cubemap_per_texture GL_ARB_separate_shader_objects GL_ARB_shader_atomic_counter_ops GL_ARB_shader_atomic_counters GL_ARB_shader_ballot GL_ARB_shader_bit_encoding GL_ARB_shader_clock GL_ARB_shader_draw_parameters GL_ARB_shader_group_vote GL_ARB_shader_image_load_store GL_ARB_shader_image_size GL_ARB_shader_objects GL_ARB_shader_precision GL_ARB_shader_stencil_export GL_ARB_shader_storage_buffer_object GL_ARB_shader_subroutine GL_ARB_shader_texture_image_samples GL_ARB_shader_texture_lod GL_ARB_shader_viewport_layer_array GL_ARB_shading_language_420pack GL_ARB_shading_language_include GL_ARB_shading_language_packing GL_ARB_spirv_extensions GL_ARB_stencil_texturing GL_ARB_sync GL_ARB_tessellation_shader GL_ARB_texture_barrier GL_ARB_texture_border_clamp GL_ARB_texture_buffer_object GL_ARB_texture_buffer_object_rgb32 GL_ARB_texture_buffer_range GL_ARB_texture_compression_bptc GL_ARB_texture_compression_rgtc GL_ARB_texture_cube_map_array GL_ARB_texture_filter_anisotropic GL_ARB_texture_float GL_ARB_texture_gather GL_ARB_texture_mirror_clamp_to_edge GL_ARB_texture_multisample GL_ARB_texture_non_power_of_two GL_ARB_texture_query_levels GL_ARB_texture_query_lod GL_ARB_texture_rectangle GL_ARB_texture_rg GL_ARB_texture_rgb10_a2ui GL_ARB_texture_stencil8 GL_ARB_texture_storage GL_ARB_texture_storage_multisample GL_ARB_texture_swizzle GL_ARB_texture_view GL_ARB_timer_query GL_ARB_transform_feedback2 GL_ARB_transform_feedback3 GL_ARB_transform_feedback_instanced GL_ARB_transform_feedback_overflow_query GL_ARB_uniform_buffer_object GL_ARB_vertex_array_bgra GL_ARB_vertex_array_object GL_ARB_vertex_attrib_64bit GL_ARB_vertex_attrib_binding GL_ARB_vertex_buffer_object GL_ARB_vertex_shader GL_ARB_vertex_type_10f_11f_11f_rev GL_ARB_vertex_type_2_10_10_10_rev GL_ARB_viewport_array GL_ATI_blend_equation_separate GL_ATI_texture_float GL_EXT_EGL_image_storage GL_EXT_EGL_image_storage_compression GL_EXT_EGL_sync GL_EXT_abgr GL_EXT_blend_equation_separate GL_EXT_debug_label GL_EXT_demote_to_helper_invocation GL_EXT_depth_bounds_test GL_EXT_draw_buffers2 GL_EXT_draw_instanced GL_EXT_framebuffer_blit GL_EXT_framebuffer_multisample GL_EXT_framebuffer_multisample_blit_scaled GL_EXT_framebuffer_object GL_EXT_framebuffer_sRGB GL_EXT_memory_object GL_EXT_memory_object_fd GL_EXT_packed_depth_stencil GL_EXT_packed_float GL_EXT_pixel_buffer_object GL_EXT_polygon_offset_clamp GL_EXT_provoking_vertex GL_EXT_semaphore GL_EXT_semaphore_fd GL_EXT_shader_framebuffer_fetch GL_EXT_shader_framebuffer_fetch_non_coherent GL_EXT_shader_integer_mix GL_EXT_shader_samples_identical GL_EXT_texture_array GL_EXT_texture_compression_dxt1 GL_EXT_texture_compression_rgtc GL_EXT_texture_compression_s3tc GL_EXT_texture_filter_anisotropic GL_EXT_texture_integer GL_EXT_texture_sRGB GL_EXT_texture_sRGB_R8 GL_EXT_texture_sRGB_decode GL_EXT_texture_shadow_lod GL_EXT_texture_shared_exponent GL_EXT_texture_snorm GL_EXT_texture_storage GL_EXT_texture_swizzle GL_EXT_timer_query GL_EXT_transform_feedback GL_EXT_vertex_array_bgra GL_EXT_vertex_attrib_64bit GL_IBM_multimode_draw_arrays GL_INTEL_blackhole_render GL_INTEL_conservative_rasterization GL_INTEL_performance_query GL_INTEL_shader_atomic_float_minmax GL_INTEL_shader_integer_functions2 GL_KHR_blend_equation_advanced GL_KHR_blend_equation_advanced_coherent GL_KHR_context_flush_control GL_KHR_debug GL_KHR_no_error GL_KHR_parallel_shader_compile GL_KHR_robust_buffer_access_behavior GL_KHR_robustness GL_KHR_texture_compression_astc_ldr GL_KHR_texture_compression_astc_sliced_3d GL_MESA_framebuffer_flip_y GL_MESA_pack_invert GL_MESA_shader_integer_functions GL_MESA_texture_const_bandwidth GL_MESA_texture_signed_rgba GL_NV_alpha_to_coverage_dither_control GL_NV_compute_shader_derivatives GL_NV_conditional_render GL_NV_copy_image GL_NV_depth_clamp GL_NV_fragment_shader_interlock GL_NV_packed_depth_stencil GL_NV_texture_barrier GL_OES_EGL_image GL_S3_s3tc
> [ 10.528][v][vo/gpu/opengl] Loaded extension GL_KHR_debug.
> [ 10.529][d][vo/gpu/opengl] Texture formats:
> [ 10.529][d][vo/gpu/opengl] NAME COMP*TYPE SIZE DEPTH PER COMP.
> [ 10.529][d][vo/gpu/opengl] r8 1*unorm 1B LF CR ST {8}
> [ 10.529][d][vo/gpu/opengl] rg8 2*unorm 2B LF CR ST {8 8}
> [ 10.529][d][vo/gpu/opengl] rgb8 3*unorm 3B LF CR ST {8 8 8}
> [ 10.529][d][vo/gpu/opengl] rgba8 4*unorm 4B LF CR ST {8 8 8 8}
> [ 10.529][d][vo/gpu/opengl] r16 1*unorm 2B LF CR ST {16}
> [ 10.529][d][vo/gpu/opengl] rg16 2*unorm 4B LF CR ST {16 16}
> [ 10.529][d][vo/gpu/opengl] rgb16 3*unorm 6B LF CR ST {16 16 16}
> [ 10.529][d][vo/gpu/opengl] rgba16 4*unorm 8B LF CR ST {16 16 16 16}
> [ 10.529][d][vo/gpu/opengl] r8ui 1*uint 1B CR ST {8}
> [ 10.529][d][vo/gpu/opengl] rg8ui 2*uint 2B CR ST {8 8}
> [ 10.529][d][vo/gpu/opengl] rgb8ui 3*uint 3B ST {8 8 8}
> [ 10.529][d][vo/gpu/opengl] rgba8ui 4*uint 4B CR ST {8 8 8 8}
> [ 10.529][d][vo/gpu/opengl] r16ui 1*uint 2B CR ST {16}
> [ 10.529][d][vo/gpu/opengl] rg16ui 2*uint 4B CR ST {16 16}
> [ 10.529][d][vo/gpu/opengl] rgb16ui 3*uint 6B ST {16 16 16}
> [ 10.529][d][vo/gpu/opengl] rgba16ui 4*uint 8B CR ST {16 16 16 16}
> [ 10.529][d][vo/gpu/opengl] r16f 1*float 4B LF CR ST {32/16}
> [ 10.529][d][vo/gpu/opengl] rg16f 2*float 8B LF CR ST {32/16 32/16}
> [ 10.529][d][vo/gpu/opengl] rgb16f 3*float 12B LF CR ST {32/16 32/16 32/16}
> [ 10.529][d][vo/gpu/opengl] rgba16f 4*float 16B LF CR ST {32/16 32/16 32/16 32/16}
> [ 10.529][d][vo/gpu/opengl] r32f 1*float 4B LF CR ST {32}
> [ 10.529][d][vo/gpu/opengl] rg32f 2*float 8B LF CR ST {32 32}
> [ 10.529][d][vo/gpu/opengl] rgb32f 3*float 12B LF CR ST {32 32 32}
> [ 10.529][d][vo/gpu/opengl] rgba32f 4*float 16B LF CR ST {32 32 32 32}
> [ 10.529][d][vo/gpu/opengl] rgb10_a2 4*unorm 4B LF CR ST {0/10 0/10 0/10 0/2}
> [ 10.529][d][vo/gpu/opengl] rgba12 4*unorm 8B LF CR ST {16 16 16 16}
> [ 10.529][d][vo/gpu/opengl] rgb10 3*unorm 6B LF CR ST {16/10 16/10 16/10}
> [ 10.529][d][vo/gpu/opengl] rgb565 3*unorm 2B LF ST {0/8 0/8 0/8}
> [ 10.529][d][vo/gpu/opengl] LA = LUMINANCE_ALPHA hack format
> [ 10.529][d][vo/gpu/opengl] LF = linear filterable
> [ 10.529][d][vo/gpu/opengl] CR = can be used for render targets
> [ 10.529][d][vo/gpu/opengl] ST = can be used for storable images
> [ 10.529][d][vo/gpu/opengl] Image formats:
> [ 10.529][d][vo/gpu/opengl] yuv444p => 3 planes 1x1 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv420p => 3 planes 2x2 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] gray => 1 planes 1x1 8/0 [r8] (r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gray16 => 1 planes 1x1 16/0 [r16] (r) [unorm]
> [ 10.529][d][vo/gpu/opengl] uyvy422
> [ 10.529][d][vo/gpu/opengl] nv12 => 2 planes 2x2 8/0 [r8/rg8] (r/gb) [unorm]
> [ 10.529][d][vo/gpu/opengl] p010 => 2 planes 2x2 16/6 [r16/rg16] (r/gb) [unorm]
> [ 10.529][d][vo/gpu/opengl] argb => 1 planes 1x1 8/0 [rgba8] (argb) [unorm]
> [ 10.529][d][vo/gpu/opengl] bgra => 1 planes 1x1 8/0 [rgba8] (bgra) [unorm]
> [ 10.529][d][vo/gpu/opengl] abgr => 1 planes 1x1 8/0 [rgba8] (abgr) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgba => 1 planes 1x1 8/0 [rgba8] (rgba) [unorm]
> [ 10.529][d][vo/gpu/opengl] bgr24 => 1 planes 1x1 8/0 [rgb8] (bgr) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgb24 => 1 planes 1x1 8/0 [rgb8] (rgb) [unorm]
> [ 10.529][d][vo/gpu/opengl] 0rgb => 1 planes 1x1 8/0 [rgba8] (_rgb) [unorm]
> [ 10.529][d][vo/gpu/opengl] bgr0 => 1 planes 1x1 8/0 [rgba8] (bgr) [unorm]
> [ 10.529][d][vo/gpu/opengl] 0bgr => 1 planes 1x1 8/0 [rgba8] (_bgr) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgb0 => 1 planes 1x1 8/0 [rgba8] (rgb) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgba64 => 1 planes 1x1 16/0 [rgba16] (rgba) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgb565 => 1 planes 1x1 0/0 [rgb565] (rgb) [unknown]
> [ 10.529][d][vo/gpu/opengl] pal8
> [ 10.529][d][vo/gpu/opengl] vdpau
> [ 10.529][d][vo/gpu/opengl] d3d11
> [ 10.529][d][vo/gpu/opengl] dxva2_vld
> [ 10.529][d][vo/gpu/opengl] mmal
> [ 10.529][d][vo/gpu/opengl] mediacodec
> [ 10.529][d][vo/gpu/opengl] cuda
> [ 10.529][d][vo/gpu/opengl] yap8 => 2 planes 1x1 8/0 [r8/r8] (r/a) [unorm]
> [ 10.529][d][vo/gpu/opengl] yap16 => 2 planes 1x1 16/0 [r16/r16] (r/a) [unorm]
> [ 10.529][d][vo/gpu/opengl] grayaf32 => 2 planes 1x1 32/0 [r16f/r16f] (r/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv444pf => 3 planes 1x1 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva444pf => 4 planes 1x1 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv420pf => 3 planes 2x2 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva420pf => 4 planes 2x2 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv422pf => 3 planes 2x1 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva422pf => 4 planes 2x1 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv440pf => 3 planes 1x2 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva440pf => 4 planes 1x2 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv410pf => 3 planes 4x4 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva410pf => 4 planes 4x4 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] yuv411pf => 3 planes 4x1 32/0 [r16f/r16f/r16f] (r/g/b) [float]
> [ 10.529][d][vo/gpu/opengl] yuva411pf => 4 planes 4x1 32/0 [r16f/r16f/r16f/r16f] (r/g/b/a) [float]
> [ 10.529][d][vo/gpu/opengl] rgb30 => 1 planes 1x1 10/0 [rgb10_a2] (bgr) [unknown]
> [ 10.529][d][vo/gpu/opengl] y1 => 1 planes 1x1 8/-7 [r8] (r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp1 => 3 planes 1x1 8/-7 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp2 => 3 planes 1x1 8/-6 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp3 => 3 planes 1x1 8/-5 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp4 => 3 planes 1x1 8/-4 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp5 => 3 planes 1x1 8/-3 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp6 => 3 planes 1x1 8/-2 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] vdpau_output
> [ 10.529][d][vo/gpu/opengl] vaapi
> [ 10.529][d][vo/gpu/opengl] videotoolbox
> [ 10.529][d][vo/gpu/opengl] vulkan
> [ 10.529][d][vo/gpu/opengl] drm_prime
> [ 10.529][d][vo/gpu/opengl] yuyv422
> [ 10.529][d][vo/gpu/opengl] yuv422p => 3 planes 2x1 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv410p => 3 planes 4x4 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv411p => 3 planes 4x1 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] monow
> [ 10.529][d][vo/gpu/opengl] monob
> [ 10.529][d][vo/gpu/opengl] yuvj422p => 3 planes 2x1 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] uyyvyy411
> [ 10.529][d][vo/gpu/opengl] bgr8
> [ 10.529][d][vo/gpu/opengl] bgr4
> [ 10.529][d][vo/gpu/opengl] bgr4_byte
> [ 10.529][d][vo/gpu/opengl] rgb8
> [ 10.529][d][vo/gpu/opengl] rgb4
> [ 10.529][d][vo/gpu/opengl] rgb4_byte
> [ 10.529][d][vo/gpu/opengl] nv21 => 2 planes 2x2 8/0 [r8/rg8] (r/bg) [unorm]
> [ 10.529][d][vo/gpu/opengl] gray16be
> [ 10.529][d][vo/gpu/opengl] yuv440p => 3 planes 1x2 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuvj440p => 3 planes 1x2 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuva420p => 4 planes 2x2 8/0 [r8/r8/r8/r8] (r/g/b/a) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgb48be
> [ 10.529][d][vo/gpu/opengl] rgb48 => 1 planes 1x1 16/0 [rgb16] (rgb) [unorm]
> [ 10.529][d][vo/gpu/opengl] rgb565be
> [ 10.529][d][vo/gpu/opengl] rgb555be
> [ 10.529][d][vo/gpu/opengl] rgb555
> [ 10.529][d][vo/gpu/opengl] bgr565be
> [ 10.529][d][vo/gpu/opengl] bgr565
> [ 10.529][d][vo/gpu/opengl] bgr555be
> [ 10.529][d][vo/gpu/opengl] bgr555
> [ 10.529][d][vo/gpu/opengl] yuv420p16 => 3 planes 2x2 16/0 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv420p16be
> [ 10.529][d][vo/gpu/opengl] yuv422p16 => 3 planes 2x1 16/0 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv422p16be
> [ 10.529][d][vo/gpu/opengl] yuv444p16 => 3 planes 1x1 16/0 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv444p16be
> [ 10.529][d][vo/gpu/opengl] rgb444
> [ 10.529][d][vo/gpu/opengl] rgb444be
> [ 10.529][d][vo/gpu/opengl] bgr444
> [ 10.529][d][vo/gpu/opengl] bgr444be
> [ 10.529][d][vo/gpu/opengl] ya8 => 1 planes 1x1 8/0 [rg8] (ra) [unorm]
> [ 10.529][d][vo/gpu/opengl] bgr48be
> [ 10.529][d][vo/gpu/opengl] bgr48 => 1 planes 1x1 16/0 [rgb16] (bgr) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv420p9be
> [ 10.529][d][vo/gpu/opengl] yuv420p9 => 3 planes 2x2 16/-7 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv420p10be
> [ 10.529][d][vo/gpu/opengl] yuv420p10 => 3 planes 2x2 16/-6 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv422p10be
> [ 10.529][d][vo/gpu/opengl] yuv422p10 => 3 planes 2x1 16/-6 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv444p9be
> [ 10.529][d][vo/gpu/opengl] yuv444p9 => 3 planes 1x1 16/-7 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv444p10be
> [ 10.529][d][vo/gpu/opengl] yuv444p10 => 3 planes 1x1 16/-6 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuv422p9be
> [ 10.529][d][vo/gpu/opengl] yuv422p9 => 3 planes 2x1 16/-7 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp => 3 planes 1x1 8/0 [r8/r8/r8] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp9be
> [ 10.529][d][vo/gpu/opengl] gbrp9 => 3 planes 1x1 16/-7 [r16/r16/r16] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp10be
> [ 10.529][d][vo/gpu/opengl] gbrp10 => 3 planes 1x1 16/-6 [r16/r16/r16] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] gbrp16be
> [ 10.529][d][vo/gpu/opengl] gbrp16 => 3 planes 1x1 16/0 [r16/r16/r16] (g/b/r) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuva422p => 4 planes 2x1 8/0 [r8/r8/r8/r8] (r/g/b/a) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuva444p => 4 planes 1x1 8/0 [r8/r8/r8/r8] (r/g/b/a) [unorm]
> [ 10.529][d][vo/gpu/opengl] yuva420p9be
> [ 10.530][d][vo/gpu/opengl] yuva420p9 => 4 planes 2x2 16/-7 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva422p9be
> [ 10.530][d][vo/gpu/opengl] yuva422p9 => 4 planes 2x1 16/-7 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva444p9be
> [ 10.530][d][vo/gpu/opengl] yuva444p9 => 4 planes 1x1 16/-7 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva420p10be
> [ 10.530][d][vo/gpu/opengl] yuva420p10 => 4 planes 2x2 16/-6 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva422p10be
> [ 10.530][d][vo/gpu/opengl] yuva422p10 => 4 planes 2x1 16/-6 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva444p10be
> [ 10.530][d][vo/gpu/opengl] yuva444p10 => 4 planes 1x1 16/-6 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva420p16be
> [ 10.530][d][vo/gpu/opengl] yuva420p16 => 4 planes 2x2 16/0 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva422p16be
> [ 10.530][d][vo/gpu/opengl] yuva422p16 => 4 planes 2x1 16/0 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva444p16be
> [ 10.530][d][vo/gpu/opengl] yuva444p16 => 4 planes 1x1 16/0 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] xyz12 => 1 planes 1x1 16/4 [rgb16] (rgb) [unorm]
> [ 10.530][d][vo/gpu/opengl] xyz12be
> [ 10.530][d][vo/gpu/opengl] nv16 => 2 planes 2x1 8/0 [r8/rg8] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] nv20 => 2 planes 2x1 16/-6 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] nv20be
> [ 10.530][d][vo/gpu/opengl] rgba64be
> [ 10.530][d][vo/gpu/opengl] bgra64be
> [ 10.530][d][vo/gpu/opengl] bgra64 => 1 planes 1x1 16/0 [rgba16] (bgra) [unorm]
> [ 10.530][d][vo/gpu/opengl] yvyu422
> [ 10.530][d][vo/gpu/opengl] ya16be
> [ 10.530][d][vo/gpu/opengl] ya16 => 1 planes 1x1 16/0 [rg16] (ra) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrap => 4 planes 1x1 8/0 [r8/r8/r8/r8] (g/b/r/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrap16be
> [ 10.530][d][vo/gpu/opengl] gbrap16 => 4 planes 1x1 16/0 [r16/r16/r16/r16] (g/b/r/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] qsv
> [ 10.530][d][vo/gpu/opengl] d3d11va_vld
> [ 10.530][d][vo/gpu/opengl] yuv420p12be
> [ 10.530][d][vo/gpu/opengl] yuv420p12 => 3 planes 2x2 16/-4 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv420p14be
> [ 10.530][d][vo/gpu/opengl] yuv420p14 => 3 planes 2x2 16/-2 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv422p12be
> [ 10.530][d][vo/gpu/opengl] yuv422p12 => 3 planes 2x1 16/-4 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv422p14be
> [ 10.530][d][vo/gpu/opengl] yuv422p14 => 3 planes 2x1 16/-2 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv444p12be
> [ 10.530][d][vo/gpu/opengl] yuv444p12 => 3 planes 1x1 16/-4 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv444p14be
> [ 10.530][d][vo/gpu/opengl] yuv444p14 => 3 planes 1x1 16/-2 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrp12be
> [ 10.530][d][vo/gpu/opengl] gbrp12 => 3 planes 1x1 16/-4 [r16/r16/r16] (g/b/r) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrp14be
> [ 10.530][d][vo/gpu/opengl] gbrp14 => 3 planes 1x1 16/-2 [r16/r16/r16] (g/b/r) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuvj411p => 3 planes 4x1 8/0 [r8/r8/r8] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] bayer_bggr8
> [ 10.530][d][vo/gpu/opengl] bayer_rggb8
> [ 10.530][d][vo/gpu/opengl] bayer_gbrg8
> [ 10.530][d][vo/gpu/opengl] bayer_grbg8
> [ 10.530][d][vo/gpu/opengl] bayer_bggr16
> [ 10.530][d][vo/gpu/opengl] bayer_bggr16be
> [ 10.530][d][vo/gpu/opengl] bayer_rggb16
> [ 10.530][d][vo/gpu/opengl] bayer_rggb16be
> [ 10.530][d][vo/gpu/opengl] bayer_gbrg16
> [ 10.530][d][vo/gpu/opengl] bayer_gbrg16be
> [ 10.530][d][vo/gpu/opengl] bayer_grbg16
> [ 10.530][d][vo/gpu/opengl] bayer_grbg16be
> [ 10.530][d][vo/gpu/opengl] xvmc
> [ 10.530][d][vo/gpu/opengl] yuv440p10 => 3 planes 1x2 16/-6 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv440p10be
> [ 10.530][d][vo/gpu/opengl] yuv440p12 => 3 planes 1x2 16/-4 [r16/r16/r16] (r/g/b) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuv440p12be
> [ 10.530][d][vo/gpu/opengl] ayuv64 => 1 planes 1x1 16/0 [rgba16] (argb) [unorm]
> [ 10.530][d][vo/gpu/opengl] ayuv64be
> [ 10.530][d][vo/gpu/opengl] p010be
> [ 10.530][d][vo/gpu/opengl] gbrap12be
> [ 10.530][d][vo/gpu/opengl] gbrap12 => 4 planes 1x1 16/-4 [r16/r16/r16/r16] (g/b/r/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrap10be
> [ 10.530][d][vo/gpu/opengl] gbrap10 => 4 planes 1x1 16/-6 [r16/r16/r16/r16] (g/b/r/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] gray12be
> [ 10.530][d][vo/gpu/opengl] gray12 => 1 planes 1x1 16/-4 [r16] (r) [unorm]
> [ 10.530][d][vo/gpu/opengl] gray10be
> [ 10.530][d][vo/gpu/opengl] gray10 => 1 planes 1x1 16/-6 [r16] (r) [unorm]
> [ 10.530][d][vo/gpu/opengl] p016 => 2 planes 2x2 16/0 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p016be
> [ 10.530][d][vo/gpu/opengl] gray9be
> [ 10.530][d][vo/gpu/opengl] gray9 => 1 planes 1x1 16/-7 [r16] (r) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrpf32be
> [ 10.530][d][vo/gpu/opengl] gbrpf32 => 3 planes 1x1 32/0 [r16f/r16f/r16f] (g/b/r) [float]
> [ 10.530][d][vo/gpu/opengl] gbrapf32be
> [ 10.530][d][vo/gpu/opengl] gbrapf32 => 4 planes 1x1 32/0 [r16f/r16f/r16f/r16f] (g/b/r/a) [float]
> [ 10.530][d][vo/gpu/opengl] opencl
> [ 10.530][d][vo/gpu/opengl] gray14be
> [ 10.530][d][vo/gpu/opengl] gray14 => 1 planes 1x1 16/-2 [r16] (r) [unorm]
> [ 10.530][d][vo/gpu/opengl] grayf32be
> [ 10.530][d][vo/gpu/opengl] grayf32 => 1 planes 1x1 32/0 [r16f] (r) [float]
> [ 10.530][d][vo/gpu/opengl] yuva422p12be
> [ 10.530][d][vo/gpu/opengl] yuva422p12 => 4 planes 2x1 16/-4 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] yuva444p12be
> [ 10.530][d][vo/gpu/opengl] yuva444p12 => 4 planes 1x1 16/-4 [r16/r16/r16/r16] (r/g/b/a) [unorm]
> [ 10.530][d][vo/gpu/opengl] nv24 => 2 planes 1x1 8/0 [r8/rg8] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] nv42 => 2 planes 1x1 8/0 [r8/rg8] (r/bg) [unorm]
> [ 10.530][d][vo/gpu/opengl] y210be
> [ 10.530][d][vo/gpu/opengl] y210
> [ 10.530][d][vo/gpu/opengl] x2rgb10be
> [ 10.530][d][vo/gpu/opengl] x2bgr10
> [ 10.530][d][vo/gpu/opengl] x2bgr10be
> [ 10.530][d][vo/gpu/opengl] p210be
> [ 10.530][d][vo/gpu/opengl] p210 => 2 planes 2x1 16/6 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p410be
> [ 10.530][d][vo/gpu/opengl] p410 => 2 planes 1x1 16/6 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p216be
> [ 10.530][d][vo/gpu/opengl] p216 => 2 planes 2x1 16/0 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p416be
> [ 10.530][d][vo/gpu/opengl] p416 => 2 planes 1x1 16/0 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] vuya => 1 planes 1x1 8/0 [rgba8] (bgra) [unorm]
> [ 10.530][d][vo/gpu/opengl] rgbaf16be
> [ 10.530][d][vo/gpu/opengl] rgbaf16
> [ 10.530][d][vo/gpu/opengl] vuyx => 1 planes 1x1 8/0 [rgba8] (bgr) [unorm]
> [ 10.530][d][vo/gpu/opengl] p012 => 2 planes 2x2 16/4 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p012be
> [ 10.530][d][vo/gpu/opengl] y212be
> [ 10.530][d][vo/gpu/opengl] y212
> [ 10.530][d][vo/gpu/opengl] xv30be
> [ 10.530][d][vo/gpu/opengl] xv30
> [ 10.530][d][vo/gpu/opengl] xv36be
> [ 10.530][d][vo/gpu/opengl] xv36 => 1 planes 1x1 16/4 [rgba16] (grb) [unorm]
> [ 10.530][d][vo/gpu/opengl] rgbf32be
> [ 10.530][d][vo/gpu/opengl] rgbf32
> [ 10.530][d][vo/gpu/opengl] rgbaf32be
> [ 10.530][d][vo/gpu/opengl] rgbaf32
> [ 10.530][d][vo/gpu/opengl] p212be
> [ 10.530][d][vo/gpu/opengl] p212 => 2 planes 2x1 16/4 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] p412be
> [ 10.530][d][vo/gpu/opengl] p412 => 2 planes 1x1 16/4 [r16/rg16] (r/gb) [unorm]
> [ 10.530][d][vo/gpu/opengl] gbrap14be
> [ 10.530][d][vo/gpu/opengl] gbrap14 => 4 planes 1x1 16/-2 [r16/r16/r16/r16] (g/b/r/a) [unorm]
> [ 10.530][v][vo/gpu] Testing FBO format rgba16f
> [ 10.530][d][vo/gpu] Resizing texture: 16x16
> [ 10.530][v][vo/gpu] Using FBO format rgba16f.
> [ 10.530][d][global] cache path: '' -> '/home/err/.cache/mpv'
> [ 10.530][v][vo/gpu] Resize: 2560x1600
> [ 10.530][v][vo/gpu] Reported display depth: 8
> [ 10.530][v][vo/gpu] Assuming 240.000000 FPS for display sync.
> [ 10.530][v][vd] Container reported FPS: 30.000000
> [ 10.530][v][vd] Codec list:
> [ 10.530][v][vd] h264 - H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10
> [ 10.530][v][vd] h264_v4l2m2m (h264) - V4L2 mem2mem H.264 decoder wrapper
> [ 10.530][v][vd] h264_qsv (h264) - H264 video (Intel Quick Sync Video acceleration)
> [ 10.530][v][vd] h264_cuvid (h264) - Nvidia CUVID H264 decoder
> [ 10.530][v][vd] Opening decoder h264
> [ 10.530][v][vd] Looking at hwdec h264-nvdec...
> [ 10.530][v][vd] Not using this for auto-copy.
> [ 10.530][v][vd] Looking at hwdec h264-vaapi...
> [ 10.530][v][vd] Not using this for auto-copy.
> [ 10.530][v][vd] Looking at hwdec h264-vdpau...
> [ 10.530][v][vd] Not using this for auto-copy.
> [ 10.530][v][vd] Looking at hwdec h264-nvdec-copy...
> [ 10.534][e][ffmpeg] AVHWDeviceContext: cu->cuInit(0) failed -> CUDA_ERROR_UNKNOWN: unknown error
> [ 10.534][v][vd] Could not create device.
> [ 10.534][v][vd] Looking at hwdec h264-vaapi-copy...
> [ 10.534][d][vaapi] libva: VA-API version 1.20.0
> [ 10.534][d][vaapi] libva: Trying to open /usr/lib/x86_64-linux-gnu/dri/iHD_drv_video.so
> [ 10.535][d][vaapi] libva: Found init function __vaDriverInit_1_20
> [ 10.539][d][vaapi] libva: va_openDriver() returns 0
> [ 10.539][v][vaapi] Initialized VAAPI: version 1.20
> [ 10.539][d][ffmpeg] AVHWDeviceContext: VAAPI driver: Intel iHD driver for Intel(R) Gen Graphics - 24.1.0 ().
> [ 10.539][d][ffmpeg] AVHWDeviceContext: Driver not found in known nonstandard list, using standard behaviour.
> [ 10.539][v][vd] Trying hardware decoding via h264-vaapi-copy.
> [ 10.540][v][vd] Selected codec: H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10
> [ 10.540][v][vf] User filter list:
> [ 10.540][v][vf] (empty)
> [ 10.540][v][ad] Codec list:
> [ 10.540][v][ad] aac - AAC (Advanced Audio Coding)
> [ 10.540][v][ad] aac_fixed (aac) - AAC (Advanced Audio Coding)
> [ 10.540][v][ad] Opening decoder aac
> [ 10.540][v][ad] Requesting 1 threads for decoding.
> [ 10.541][v][ad] Selected codec: AAC (Advanced Audio Coding)
> [ 10.541][v][af] User filter list:
> [ 10.541][v][af] (empty)
> [ 10.541][v][cplayer] Starting playback...
> [ 10.541][v][timeline] switch to segment 0
> [ 10.541][v][lavf] select track 0
> [ 10.541][v][lavf] select track 1
> [ 10.541][d][timeline] stream 1: resize index to 128
> [ 10.541][v][vd] Pixel formats supported by decoder: vdpau vulkan cuda vaapi yuv420p
> [ 10.541][v][vd] Codec profile: Main (0x4d)
> [ 10.541][v][vd] Requesting pixfmt 'vaapi' from decoder.
> [ 10.543][d][ffmpeg/video] h264: Reinit context to 640x368, pix_fmt: vaapi
> [ 10.544][d][timeline] stream 0: resize index to 128
> [ 10.548][i][vd] Using hardware decoding (vaapi-copy).
> [ 10.548][v][vd] Decoder format: 640x360 nv12 bt.709/bt.709/bt.1886/limited/auto CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][vf] [in] 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][vf] [userdeint] 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][vf] [userdeint] (disabled)
> [ 10.548][v][vf] [autorotate] 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][vf] [autorotate] (disabled)
> [ 10.548][v][vf] [convert] 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][vf] [convert] (disabled)
> [ 10.548][v][vf] [out] 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.548][v][af] [in] 44100Hz stereo 2ch floatp
> [ 10.548][v][af] [userspeed] 44100Hz stereo 2ch floatp
> [ 10.548][v][af] [userspeed] (disabled)
> [ 10.548][v][af] [convert] 44100Hz stereo 2ch floatp
> [ 10.548][d][global] config path: 'fonts' -/-> '/home/err/.config/mpv/fonts'
> [ 10.548][d][global] config path: 'fonts' -/-> '/home/err/.mpv/fonts'
> [ 10.548][d][global] config path: 'fonts' -/-> '/etc/mpv/fonts'
> [ 10.548][d][osd/libass] ASS library version: 0x1701000 (runtime 0x1701000)
> [ 10.548][v][osd/libass] libass API version: 0x1701000
> [ 10.548][v][osd/libass] libass source: tarball: 0.17.1
> [ 10.548][v][osd/libass] Shaper: FriBidi 1.0.13 (SIMPLE) HarfBuzz-ng 8.3.0 (COMPLEX)
> [ 10.548][d][global] config path: 'subfont.ttf' -/-> '/home/err/.config/mpv/subfont.ttf'
> [ 10.548][d][global] config path: 'subfont.ttf' -/-> '/home/err/.mpv/subfont.ttf'
> [ 10.548][d][global] config path: 'subfont.ttf' -/-> '/etc/mpv/subfont.ttf'
> [ 10.548][d][global] config path: 'fonts.conf' -/-> '/home/err/.config/mpv/fonts.conf'
> [ 10.548][d][global] config path: 'fonts.conf' -/-> '/home/err/.mpv/fonts.conf'
> [ 10.548][d][global] config path: 'fonts.conf' -/-> '/etc/mpv/fonts.conf'
> [ 10.548][v][osd/libass] Setting up fonts...
> [ 10.553][v][osd/libass] Using font provider fontconfig
> [ 10.553][v][osd/libass] Done.
> [ 10.553][v][ao] Trying audio driver 'pipewire'
> [ 10.553][v][ao/pipewire] requested format: 44100 Hz, stereo channels, floatp
> [ 10.553][v][ao/pipewire] Headers version: 1.0.4
> [ 10.553][v][ao/pipewire] Library version: 1.0.5
> [ 10.556][v][ao/pipewire] Core user: err
> [ 10.556][v][ao/pipewire] Core host: err-Stealth-16-AI-Studio-A1VGG
> [ 10.556][v][ao/pipewire] Core version: 1.0.5
> [ 10.556][v][ao/pipewire] Core name: pipewire-0
> [ 10.556][d][ao/pipewire] Stream state changed: old_state=unconnected state=connecting error=(null)
> [ 10.556][v][ao/pipewire] using soft-buffer of 8820 samples.
> [ 10.556][i][cplayer] AO: [pipewire] 44100Hz stereo 2ch floatp
> [ 10.556][v][cplayer] AO: Description: PipeWire audio output
> [ 10.556][v][af] [convert] (disabled)
> [ 10.556][v][af] [out] 44100Hz stereo 2ch floatp
> [ 10.557][d][ao/pipewire] Stream state changed: old_state=connecting state=paused error=(null)
> [ 10.557][i][cplayer] VO: [gpu] 640x360 nv12
> [ 10.557][v][cplayer] VO: Description: Shader-based GPU Renderer
> [ 10.557][v][vo/gpu] reconfig to 640x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=640x360+0+0
> [ 10.557][d][vo/gpu] max content size: 2560x1600
> [ 10.557][d][vo/gpu] monitor size: 2560x1600
> [ 10.557][v][vo/gpu] Resize: 2560x1600
> [ 10.557][v][vo/gpu] Window size: 2560x1600 (Borders: l=0 t=0 r=0 b=0)
> [ 10.557][v][vo/gpu] Video source: 640x360 (1:1)
> [ 10.557][v][vo/gpu] Video display: (0, 0) 640x360 -> (0, 80) 2560x1440
> [ 10.557][v][vo/gpu] Video scale: 4.000000/4.000000
> [ 10.557][v][vo/gpu] OSD borders: l=0 t=80 r=0 b=80
> [ 10.557][v][vo/gpu] Video borders: l=0 t=80 r=0 b=80
> [ 10.557][v][vo/gpu] Reported display depth: 8
> [ 10.557][v][vo/gpu] Texture for plane 0: 640x360
> [ 10.557][v][vo/gpu] Texture for plane 1: 320x180
> [ 10.557][v][vo/gpu] Testing FBO format rgba16f
> [ 10.557][d][vo/gpu] Resizing texture: 16x16
> [ 10.557][v][vo/gpu] Using FBO format rgba16f.
> [ 10.561][d][vo/gpu] Resizing texture: 320x360
> [ 10.561][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.561][d][vo/gpu] Trying to load shader from disk...
> [ 10.562][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.562][d][vo/gpu] Resizing texture: 640x360
> [ 10.564][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.564][d][vo/gpu] Trying to load shader from disk...
> [ 10.565][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.565][d][vo/gpu] Resizing texture: 640x360
> [ 10.565][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.565][d][vo/gpu] Trying to load shader from disk...
> [ 10.566][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.567][d][vo/gpu] Resizing texture: 640x1440
> [ 10.571][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.571][d][vo/gpu] Trying to load shader from disk...
> [ 10.572][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.572][v][vo/gpu] Dither to 8.
> [ 10.588][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.588][d][vo/gpu] Trying to load shader from disk...
> [ 10.588][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.593][v][cplayer] first video frame after restart shown
> [ 10.594][v][cplayer] audio ready
> [ 10.594][d][cplayer] starting video playback
> [ 10.594][v][cplayer] starting audio playback
> [ 10.594][v][cplayer] playback restart complete @ 0.000000, audio=playing, video=playing
> [ 10.595][d][ao/pipewire] Stream state changed: old_state=paused state=streaming error=(null)
> [ 10.597][d][vo/gpu] Resizing texture: 2560x1600
> [ 10.613][d][global] user path: '/home/err/.cache/mpv' -> '/home/err/.cache/mpv'
> [ 10.613][d][vo/gpu] Trying to load shader from disk...
> [ 10.614][d][vo/gpu/opengl] Loading binary program succeeded.
> [ 10.616][v][vo/gpu/x11] Disabling screensaver.
> [ 10.968][d][timeline] stream 1: resize index to 256
> [ 11.473][v][lavf] EOF reached.
> [ 11.473][v][timeline] EOF reached.
> [ 260.057][v][af] filter input EOF
> [ 260.057][v][af] filter output EOF
> [ 260.057][v][cplayer] audio filter EOF
> [ 260.057][v][cplayer] audio draining
> [ 260.057][v][cplayer] audio EOF reached
> [ 260.184][v][vf] filter input EOF
> [ 260.184][v][vf] filter output EOF
> [ 260.207][v][cplayer] EOF code: 1 
> [ 260.207][d][ad] Uninit decoder.
> [ 260.207][d][vd] Uninit decoder.
> [ 260.213][d][cplayer] Terminating demuxers...
> [ 260.213][d][ffmpeg] AVIOContext: Statistics: 18068345 bytes read, 0 seeks
> [ 260.217][v][vo/gpu/x11] Enabling screensaver.
> [ 260.222][d][cplayer] Done terminating demuxers.
> [ 260.222][v][cplayer] finished playback, success (reason 0)
> [ 260.222][d][global] state path: 'watch_later' -> '/home/err/.local/state/mpv/watch_later'
> [ 260.222][i][cplayer] Playing: https://www.youtube.com/watch?v=kWe23jfqNZo
> [ 260.222][v][cplayer] Running hook: ytdl_hook/on_load
> [ 260.223][v][ytdl_hook] ytdl:// hook 
> [ 260.223][v][ytdl_hook] not a ytdl:// url 
> [ 260.223][v][cplayer] Running hook: ytdl_hook/on_load
> [ 260.223][v][ytdl_hook] playlist hook 
> [ 260.223][v][ffmpeg] Opening https://www.youtube.com/watch?v=kWe23jfqNZo
> [ 260.257][d][ffmpeg] tcp: Starting connection attempt to 2607:f8b0:4009:80b::200e port 443
> [ 260.301][d][ffmpeg] tcp: Successfully connected to 2607:f8b0:4009:80b::200e port 443
> [ 260.526][d][ffmpeg] resize stream to 131072 bytes, drop 0 bytes
> [ 260.526][v][ffmpeg] Mime-type: 'text/html'
> [ 260.526][d][ffmpeg] Stream opened successfully.
> [ 260.526][v][demux] Trying demuxers for level=normal.
> [ 260.526][d][demux] Trying demuxer: disc (force-level: normal)
> [ 260.526][d][demux] Trying demuxer: edl (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: cue (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: rawaudio (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: rawvideo (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: mkv (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: libarchive (force-level: normal)
> [ 260.527][d][demux] Trying demuxer: lavf (force-level: normal)
> [ 260.654][d][ffmpeg] resize stream to 262144 bytes, drop 0 bytes
> [ 260.704][d][ffmpeg] resize stream to 524288 bytes, drop 0 bytes
> [ 260.758][d][ffmpeg] resize stream to 1048576 bytes, drop 0 bytes
> [ 261.399][d][ffmpeg] resize stream to 2097152 bytes, drop 0 bytes
> [ 261.415][v][lavf] No format found, try lowering probescore or forcing the format.
> [ 261.415][d][demux] Trying demuxer: mf (force-level: normal)
> [ 261.415][d][demux] Trying demuxer: playlist (force-level: normal)
> [ 261.415][d][demux] Trying demuxer: null (force-level: normal)
> [ 261.415][v][demux] Trying demuxers for level=unsafe.
> [ 261.415][d][demux] Trying demuxer: disc (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: edl (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: cue (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: rawaudio (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: rawvideo (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: mkv (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: libarchive (force-level: unsafe)
> [ 261.415][d][demux] Trying demuxer: lavf (force-level: unsafe)
> [ 261.432][d][ffmpeg] resize stream to 1048576 bytes, drop 0 bytes
> [ 261.447][d][ffmpeg] resize stream to 2097152 bytes, drop 0 bytes
> [ 261.462][v][lavf] No format found, try lowering probescore or forcing the format.
> [ 261.462][d][demux] Trying demuxer: mf (force-level: unsafe)
> [ 261.462][d][demux] Trying demuxer: playlist (force-level: unsafe)
> [ 261.462][d][demux] Trying demuxer: null (force-level: unsafe)
> [ 261.462][d][ffmpeg] AVIOContext: Statistics: 1000575 bytes read, 0 seeks
> [ 261.462][v][cplayer] Opening failed or was aborted: https://www.youtube.com/watch?v=kWe23jfqNZo
> [ 261.462][v][cplayer] Running hook: ytdl_hook/on_load_fail
> [ 261.462][v][ytdl_hook] full hook 
> [ 261.462][d][ytdl_hook] Running: /usr/local/bin/yt-dlp --no-warnings -J --flat-playlist --sub-format ass/srt/best --format bestvideo+bestaudio/best --force-ipv4 --all-subs --no-playlist -- https://www.youtube.com/watch?v=kWe23jfqNZo 
> [ 261.462][d][cplayer] Run command: subprocess, flags=64, args=[args="/usr/local/bin/yt-dlp,--no-warnings,-J,--flat-playlist,--sub-format,ass/srt/best,--format,bestvideo+bestaudio/best,--force-ipv4,--all-subs,--no-playlist,--,https://www.youtube.com/watch?v=kWe23jfqNZo", playback_only="yes", capture_size="67108864", capture_stdout="yes", capture_stderr="yes", detach="no", env="", stdin_data="", passthrough_stdin="no"]
> [ 268.666][v][ytdl_hook] youtube-dl succeeded! 
> [ 268.666][d][ytdl_hook] ytdl parsing took 0.023989 seconds 
> [ 268.666][d][ytdl_hook] No fragments to join into EDL 
> [ 268.666][v][cplayer] Set property: file-local-options/user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.115 Safari/537.36" -> 1
> [ 268.666][v][ytdl_hook] format selection: youtube-dl (separate) 
> [ 268.666][d][ytdl_hook] streamurl: edl://!new_stream;!no_clip;!no_chapters;%1135%https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D;!global_tags,ytdl_description=%138%Provided to YouTube by DistroKid
> [ 268.666][d][ytdl_hook] 
> [ 268.666][d][ytdl_hook] CITRUS! · lianhua
> [ 268.666][d][ytdl_hook] 
> [ 268.666][d][ytdl_hook] CITRUS!
> [ 268.666][d][ytdl_hook] 
> [ 268.666][d][ytdl_hook] ℗ 4493981 Records DK
> [ 268.666][d][ytdl_hook] 
> [ 268.666][d][ytdl_hook] Released on: 2023-10-06
> [ 268.666][d][ytdl_hook] 
> [ 268.666][d][ytdl_hook] Auto-generated by YouTube.,uploader=%7%lianhua,channel_url=%56%https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw 
> [ 268.666][v][cplayer] Set property: stream-open-filename="edl://!new_stream;!no_clip;!no_chapters;%1135%https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D;!global_tags,ytdl_description=%138%Provided to YouTube by DistroKid\n\nCITRUS! · lianhua\n\nCITRUS!\n\n℗ 4493981 Records DK\n\nReleased on: 2023-10-06\n\nAuto-generated by YouTube.,uploader=%7%lianhua,channel_url=%56%https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw" -> 1
> [ 268.666][v][cplayer] Set property: file-local-options/force-media-title="CITRUS!" -> 1
> [ 268.666][v][cplayer] Set property: file-local-options/stream-lavf-o={} -> 1
> [ 268.666][d][ytdl_hook] script running time: 0.02445 seconds 
> [ 268.666][v][edl] Opening edl://!new_stream;!no_clip;!no_chapters;%1135%https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D;!global_tags,ytdl_description=%138%Provided to YouTube by DistroKid
> [ 268.666][v][edl] 
> [ 268.666][v][edl] CITRUS! · lianhua
> [ 268.666][v][edl] 
> [ 268.666][v][edl] CITRUS!
> [ 268.666][v][edl] 
> [ 268.666][v][edl] ℗ 4493981 Records DK
> [ 268.666][v][edl] 
> [ 268.666][v][edl] Released on: 2023-10-06
> [ 268.666][v][edl] 
> [ 268.666][v][edl] Auto-generated by YouTube.,uploader=%7%lianhua,channel_url=%56%https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw
> [ 268.666][d][edl] resize stream to 131072 bytes, drop 0 bytes
> [ 268.666][d][edl] Stream opened successfully.
> [ 268.666][v][demux] Trying demuxers for level=request.
> [ 268.666][d][demux] Trying demuxer: edl (force-level: request)
> [ 268.666][v][demux] Detected file format: Edit decision list
> [ 268.666][v][demux] Stream is not seekable.
> [ 268.666][v][demux] Opening segment 0...
> [ 268.666][v][ffmpeg] Opening https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D
> [ 268.667][d][ffmpeg] tcp: Starting connection attempt to 2607:fb90:f0:9::1c port 443
> [ 268.701][d][ffmpeg] tcp: Successfully connected to 2607:fb90:f0:9::1c port 443
> [ 269.061][d][ffmpeg] resize stream to 131072 bytes, drop 0 bytes
> [ 269.061][v][ffmpeg] Mime-type: 'video/mp4'
> [ 269.061][d][ffmpeg] Stream opened successfully.
> [ 269.061][v][demux] Trying demuxers for level=normal.
> [ 269.061][d][demux] Trying demuxer: disc (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: edl (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: cue (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: rawaudio (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: rawvideo (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: mkv (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: libarchive (force-level: normal)
> [ 269.061][d][demux] Trying demuxer: lavf (force-level: normal)
> [ 269.064][v][lavf] Found 'mov,mp4,m4a,3gp,3g2,mj2' at score=100 size=2048.
> [ 269.113][d][ffmpeg/demuxer] mov,mp4,m4a,3gp,3g2,mj2: Reconfiguring buffers to size 167102
> [ 269.113][v][demux] Detected file format: mov,mp4,m4a,3gp,3g2,mj2 (libavformat)
> [ 269.113][d][demux] Trying demuxer: timeline (force-level: force)
> [ 269.113][v][timeline] Timeline segments:
> [ 269.113][v][timeline] 0: 0.000000 - 250.009252 [ 0.000000] (0 1)
> [ 269.113][v][timeline] source 0:'https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D'
> [ 269.113][v][timeline] Total duration: 250.009252
> [ 269.113][v][demux] Detected file format: multi/mov,mp4,m4a,3gp,3g2,mj2 (timeline segments)
> [ 269.113][v][cplayer] Opening done: edl://!new_stream;!no_clip;!no_chapters;%1135%https://rr9---sn-uhvcpax0n5-vgqy.googlevideo.com/videoplayback?expire=1755292043&ei=K02faMTzE5yX2_gPk5Cf6Qo&ip=172.58.14.45&id=o-AO5S-Pm6gb_F3gZAjhYT6visgb8-dbHW0tVkEPd7wEKH&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1755270443%2C&mh=0J&mm=31%2C29&mn=sn-uhvcpax0n5-vgqy%2Csn-vgqskne6&ms=au%2Crdu&mv=m&mvi=9&pl=23&rms=au%2Cau&gcr=us&initcwndbps=2380000&bui=AY1jyLPELYEYwP5dqEPSZOHwRBMFLNw-8EwavM2jNS2HdiNDjtZxSPpvZRDMqK3aIHSk4QeX8l0efZVK&spc=l3OVKUCxKhf-HjQ_bF3G2gMq&vprv=1&svpuc=1&mime=video%2Fmp4&ns=oJSEYYktMJ9xmVie13Hlm0UQ&rqh=1&cnr=14&ratebypass=yes&dur=250.078&lmt=1751007645752199&mt=1755270074&fvip=3&fexp=51355912%2C51548755&c=WEB&sefc=1&txp=2318224&n=CZIV9EpVh6Eiuw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cgcr%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRgIhAKVqkolQyXAjqIbcNvxRc8EIv8doLDVrGYvC-ZNAaHZOAiEAikBmRaYNwephZXQeZNqbSZBOH1iEG7zM8BJm4z261MM%3D&sig=AJfQdSswRQIgL0Hnmdv3BKqmwGVtj8tddSYLVkn9N1td0FsguHbdsWMCIQDLG11jfiLoFaXJlnOEih7-qlNk8L502hrGTRWbQBBMYA%3D%3D;!global_tags,ytdl_description=%138%Provided to YouTube by DistroKid
> [ 269.113][v][cplayer] 
> [ 269.113][v][cplayer] CITRUS! · lianhua
> [ 269.113][v][cplayer] 
> [ 269.113][v][cplayer] CITRUS!
> [ 269.113][v][cplayer] 
> [ 269.113][v][cplayer] ℗ 4493981 Records DK
> [ 269.113][v][cplayer] 
> [ 269.113][v][cplayer] Released on: 2023-10-06
> [ 269.113][v][cplayer] 
> [ 269.113][v][cplayer] Auto-generated by YouTube.,uploader=%7%lianhua,channel_url=%56%https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw
> [ 269.113][d][global] config path: 'sub' -/-> '/home/err/.config/mpv/sub'
> [ 269.113][d][global] config path: 'sub' -/-> '/home/err/.mpv/sub'
> [ 269.113][d][global] config path: 'sub' -/-> '/etc/mpv/sub'
> [ 269.113][v][cplayer] Running hook: ytdl_hook/on_preloaded
> [ 269.113][v][timeline] select track 0
> [ 269.113][v][timeline] select track 1
> [ 269.113][i][cplayer] (+) Video --vid=1 (*) (h264 360x360 25.000fps)
> [ 269.113][i][cplayer] (+) Audio --aid=1 (*) (aac 2ch 44100Hz)
> [ 269.113][i][display-tags] File tags:
> [ 269.113][i][display-tags] Uploader: lianhua
> [ 269.113][i][display-tags] Channel_URL: https://www.youtube.com/channel/UCxeAIFGxYlHkRBYkb8_G_Zw
> [ 269.114][v][vd] Container reported FPS: 25.000000
> [ 269.114][v][vd] Codec list:
> [ 269.114][v][vd] h264 - H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10
> [ 269.114][v][vd] h264_v4l2m2m (h264) - V4L2 mem2mem H.264 decoder wrapper
> [ 269.114][v][vd] h264_qsv (h264) - H264 video (Intel Quick Sync Video acceleration)
> [ 269.114][v][vd] h264_cuvid (h264) - Nvidia CUVID H264 decoder
> [ 269.114][v][vd] Opening decoder h264
> [ 269.114][v][vd] Looking at hwdec h264-nvdec...
> [ 269.114][v][vd] Not using this for auto-copy.
> [ 269.114][v][vd] Looking at hwdec h264-vaapi...
> [ 269.114][v][vd] Not using this for auto-copy.
> [ 269.114][v][vd] Looking at hwdec h264-vdpau...
> [ 269.114][v][vd] Not using this for auto-copy.
> [ 269.114][v][vd] Looking at hwdec h264-nvdec-copy...
> [ 269.116][e][ffmpeg] AVHWDeviceContext: cu->cuInit(0) failed -> CUDA_ERROR_UNKNOWN: unknown error
> [ 269.116][v][vd] Could not create device.
> [ 269.116][v][vd] Looking at hwdec h264-vaapi-copy...
> [ 269.116][d][vaapi] libva: VA-API version 1.20.0
> [ 269.116][d][vaapi] libva: Trying to open /usr/lib/x86_64-linux-gnu/dri/iHD_drv_video.so
> [ 269.116][d][vaapi] libva: Found init function __vaDriverInit_1_20
> [ 269.120][d][vaapi] libva: va_openDriver() returns 0
> [ 269.120][v][vaapi] Initialized VAAPI: version 1.20
> [ 269.120][d][ffmpeg] AVHWDeviceContext: VAAPI driver: Intel iHD driver for Intel(R) Gen Graphics - 24.1.0 ().
> [ 269.120][d][ffmpeg] AVHWDeviceContext: Driver not found in known nonstandard list, using standard behaviour.
> [ 269.120][v][vd] Trying hardware decoding via h264-vaapi-copy.
> [ 269.120][v][vd] Selected codec: H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10
> [ 269.120][v][vf] User filter list:
> [ 269.120][v][vf] (empty)
> [ 269.120][v][ad] Codec list:
> [ 269.120][v][ad] aac - AAC (Advanced Audio Coding)
> [ 269.120][v][ad] aac_fixed (aac) - AAC (Advanced Audio Coding)
> [ 269.120][v][ad] Opening decoder aac
> [ 269.120][v][ad] Requesting 1 threads for decoding.
> [ 269.120][v][ad] Selected codec: AAC (Advanced Audio Coding)
> [ 269.121][v][af] User filter list:
> [ 269.121][v][af] (empty)
> [ 269.121][v][cplayer] Starting playback...
> [ 269.121][v][timeline] switch to segment 0
> [ 269.121][v][lavf] select track 0
> [ 269.121][v][lavf] select track 1
> [ 269.128][v][vd] Pixel formats supported by decoder: vdpau vulkan cuda vaapi yuv420p
> [ 269.128][v][vd] Codec profile: Main (0x4d)
> [ 269.128][v][vd] Requesting pixfmt 'vaapi' from decoder.
> [ 269.129][d][ffmpeg/video] h264: Reinit context to 368x368, pix_fmt: vaapi
> [ 269.130][d][timeline] stream 1: resize index to 128
> [ 269.132][i][vd] Using hardware decoding (vaapi-copy).
> [ 269.132][v][vd] Decoder format: 360x360 nv12 bt.709/bt.709/bt.1886/limited/auto CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][vf] [in] 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][vf] [userdeint] 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][vf] [userdeint] (disabled)
> [ 269.132][v][vf] [autorotate] 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][vf] [autorotate] (disabled)
> [ 269.132][v][vf] [convert] 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][vf] [convert] (disabled)
> [ 269.132][v][vf] [out] 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.132][v][af] [in] 44100Hz stereo 2ch floatp
> [ 269.132][v][af] [userspeed] 44100Hz stereo 2ch floatp
> [ 269.132][v][af] [userspeed] (disabled)
> [ 269.132][v][af] [convert] 44100Hz stereo 2ch floatp
> [ 269.132][v][af] [convert] (disabled)
> [ 269.132][v][af] [out] 44100Hz stereo 2ch floatp
> [ 269.133][i][cplayer] VO: [gpu] 360x360 nv12
> [ 269.133][v][cplayer] VO: Description: Shader-based GPU Renderer
> [ 269.133][v][vo/gpu] reconfig to 360x360 nv12 bt.709/bt.709/bt.1886/limited/display CL=mpeg2/4/h264 crop=360x360+0+0
> [ 269.133][d][vo/gpu] max content size: 2560x1600
> [ 269.133][d][vo/gpu] monitor size: 2560x1600
> [ 269.133][v][vo/gpu] Resize: 2560x1600
> [ 269.133][v][vo/gpu] Window size: 2560x1600 (Borders: l=0 t=0 r=0 b=0)
> [ 269.133][v][vo/gpu] Video source: 360x360 (1:1)
> [ 269.133][v][vo/gpu] Video display: (0, 0) 360x360 -> (480, 0) 1600x1600
> [ 269.133][v][vo/gpu] Video scale: 4.444444/4.444444
> [ 269.133][v][vo/gpu] OSD borders: l=480 t=0 r=480 b=0
> [ 269.133][v][vo/gpu] Video borders: l=480 t=0 r=480 b=0
> [ 269.133][v][vo/gpu] Reported display depth: 8
> [ 269.133][v][vo/gpu] Texture for plane 0: 360x360
> [ 269.133][v][vo/gpu] Texture for plane 1: 180x180
> [ 269.133][v][vo/gpu] Testing FBO format rgba16f
> [ 269.133][d][vo/gpu] Resizing texture: 16x16
> [ 269.134][v][vo/gpu] Using FBO format rgba16f.
> [ 269.134][d][vo/gpu] Resizing texture: 180x360
> [ 269.135][d][vo/gpu] Resizing texture: 360x360
> [ 269.135][d][vo/gpu] Resizing texture: 360x360
> [ 269.135][d][vo/gpu] Resizing texture: 360x1600
> [ 269.138][v][vo/gpu] Dither to 8.
> [ 269.139][v][cplayer] first video frame after restart shown
> [ 269.139][d][vo/gpu] Resizing texture: 2560x1600
> [ 269.139][v][cplayer] audio ready
> [ 269.139][d][cplayer] starting video playback
> [ 269.139][v][cplayer] starting audio playback
> [ 269.139][v][cplayer] playback restart complete @ 0.000000, audio=playing, video=playing
> [ 269.152][v][vo/gpu/x11] Disabling screensaver.
> [ 269.155][d][timeline] stream 0: resize index to 128
> [ 269.378][d][timeline] stream 1: resize index to 256
> [ 269.553][v][lavf] EOF reached.
> [ 269.553][v][timeline] EOF reached.
> [ 286.558][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 286.558][v][cplayer] Set property: volume -> 1
> [ 286.969][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 286.969][v][cplayer] Set property: volume -> 1
> [ 287.409][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 287.409][v][cplayer] Set property: volume -> 1
> [ 287.864][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 287.864][v][cplayer] Set property: volume -> 1
> [ 288.068][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 288.068][v][cplayer] Set property: volume -> 1
> [ 288.234][d][cplayer] Run command: add, flags=64, args=[name="volume", value="5.000000"]
> [ 288.234][v][cplayer] Set property: volume -> 1
> ```
<!-- UID: 2c3f6239-e2e9-4e79-b02a-58805ad06e5e -->




>[!nexus_agent] **Assistant** - 08/15/2025 at 10:27 AM
> Nice logs—super helpful. From what I can see, mpv is behaving until it hops to the next YouTube item, and then it occasionally stalls/errs on the googlevideo URL (classic 403/early-EOF/throttle weirdness). Two things will make this way more resilient:
> 
> 1) harden mpv’s network/YouTube handling, and 
> 2) auto-skip anything that errors instead of “stopping”.
> 
> Here’s a tight patch you can drop into your `server.mjs`:
> 
> ### 1) Make mpv more bullet-proof
> Add these flags to `mpvArgs` (right where you build them):
> 
> ```js
> const mpvArgs = [
>  "-wid", "WID",
>  `--input-ipc-server=${SOCKET}`,
>  `--volume=${VOLUME}`,
>  "--idle=yes",
>  "--loop-playlist=inf",
>  ...(SHUFFLE ? ["--shuffle"] : []),
>  "--no-osc", "--no-osd-bar",
>  "--force-window",
>  "--hwdec=auto-copy",
> 
>  // yt-dlp hook (stays latest & plays nicer with YT)
>  `--script-opts=ytdl_hook-ytdl_path=${YTDL}`,
>  // (boolean raw-option: empty value is "set")
>  "--ytdl-raw-options=force-ipv4=,extractor-args=youtube:player_client=android",
> 
>  // Prefer sane formats and avoid odd containers
>  "--ytdl-format=bv*[height<=1080][vcodec^=avc1]+ba[acodec^=mp4a]/b[height<=1080][ext=mp4]/best",
> 
>  // Reconnect on flaky HTTP / token hiccups
>  "--stream-lavf-o=reconnect=1,reconnect_streamed=1,reconnect_on_network_error=1,reconnect_delay_max=10",
> 
>  // Give buffering a little headroom
>  "--cache=yes", "--cache-secs=90", "--demuxer-max-bytes=200MiB", "--demuxer-readahead-secs=30",
> ];
> ```
> 
> Why these help:
> - `extractor-args=...player_client=android` often dodges the YT throttle/403 dance.
> - `reconnect*` keeps ffmpeg/mpv from giving up if a segment dies mid-track.
> - The format line biases mp4/avc+aac @ ≤1080p (stable on most drivers).
> - Small cache + readahead smooths short network burps.
> 
> ### 2) Skip broken items automatically
> Right now you only react to `property-change`. Wire a tiny handler for error events so mpv never “looks stopped”:
> 
> ```js
> function wireMpvIPC(s) {
>  let buf = "";
>  let loadTimer = null;
> 
>  const armWatchdog = () => {
>  clearTimeout(loadTimer);
>  // if nothing fully loads in 15s, skip
>  loadTimer = setTimeout(() => mpvSend(["playlist-next", "force"]), 15000);
>  };
> 
>  s.on("data", (d) => {
>  buf += d.toString("utf8");
>  let idx;
>  while ((idx = buf.indexOf("\n")) >= 0) {
>  const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
>  if (!line.trim()) continue;
>  let j; try { j = JSON.parse(line); } catch { continue; }
> 
>  // Core events for robustness
>  if (j.event === "start-file") {
>  armWatchdog();
>  }
>  if (j.event === "file-loaded") {
>  clearTimeout(loadTimer);
>  }
>  if (j.event === "end-file") {
>  // reason can be "eof", "error", "redirect", "stop", "quit"
>  if (j.reason === "error") {
>  // hop to next and keep rolling
>  mpvSend(["playlist-next", "force"]);
>  }
>  }
> 
>  // Your existing metadata updates
>  if (j.event === "property-change") {
>  if (j.name === "media-title") {
>  current.title = j.data || "";
>  broadcast({ type: "track", title: prettyTitle() });
>  }
>  if (j.name === "metadata") {
>  current.meta = j.data || {};
>  current.artist = current.meta.artist || current.meta.ARTIST || "";
>  broadcast({ type: "track", title: prettyTitle() });
>  }
>  }
>  }
>  });
> 
>  // observe useful props + get initial state
>  mpvSend(["observe_property", 1, "media-title"]);
>  mpvSend(["observe_property", 2, "metadata"]);
>  mpvSend(["get_property", "media-title"]);
>  mpvSend(["get_property", "metadata"]);
> }
> ```
> 
> ### 3) Make sure yt-dlp is truly current
> YouTube tweaks break older builds first. Do this once:
> ```bash
> sudo /usr/local/bin/yt-dlp -U
> yt-dlp --version
> ```
> If you still see intermittent 403s, try the bleeding edge:
> ```bash
> sudo yt-dlp -U --update-to nightly
> ```
> 
> ### 4) (Optional) tame IPv6 weirdness
> Your logs show a lot of IPv6 endpoints. If your ISP’s v6 is flaky, temporarily prefer v4 everywhere:
> - Keep the `--ytdl-raw-options=force-ipv4=` (you already have it).
> - If your system resolver loves v6, you can test by disabling v6 at the OS level (quick test: `sudo sysctl net.ipv6.conf.all.disable_ipv6=1` … then revert). If that changes the behavior, the reconnect flags above should already mask most issues; no need to keep v6 off long-term.
> 
> ---
> 
> Give those two code changes a spin (the extra mpv flags + the watchdog). In practice, that fixes the “plays one or two tracks then looks dead” pattern by either surviving the hiccup or skipping the bad item automatically—while your overlay keeps updating.
<!-- UID: 23352703-2e4b-4649-a6b2-965fe4390a69 -->

---


