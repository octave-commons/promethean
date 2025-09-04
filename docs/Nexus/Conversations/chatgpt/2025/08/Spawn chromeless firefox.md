---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Spawn chromeless firefox"
conversation_id: 68a5f351-85b0-8333-af27-4e4c16311aec
create_time: 08/20/2025 at 11:10 AM
update_time: 08/20/2025 at 11:11 AM
---

# Title: Spawn chromeless firefox

Created: 08/20/2025 at 11:10 AM
Last Updated: 08/20/2025 at 11:11 AM
Chat URL: https://chat.openai.com/c/68a5f351-85b0-8333-af27-4e4c16311aec


>[!nexus_user] **User** - 08/20/2025 at 11:10 AM
> How do I spawn a chromeless firefox from bash?
<!-- UID: e30fed47-1cc9-47d3-88fa-b1d9946fa9e3 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 11:10 AM
> Short answer: Firefox doesn’t have a true “app window” flag like Chrome’s `--app`. Your practical options from bash are:
> 
> ## 1) Fullscreen “no chrome” (kiosk)
> This hides all Firefox UI. Good for dashboards/signage.
> ```bash
> firefox --kiosk 'https://example.org'
> ```
> - Exit: `F11` toggles fullscreen, `Alt+F4` quits.
> - Not windowed; it’s full screen by design.
> 
> ## 2) Windowed but chromeless (userChrome.css trick)
> Make a throwaway profile that hides the URL bar, tabs, toolbars, etc., then launch it.
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> URL="${1:-https://example.org}"
> 
> # Create a temporary profile
> PROFILE="$(mktemp -d)"
> mkdir -p "$PROFILE/chrome"
> 
> # Allow userChrome.css and kill obvious nags
> cat > "$PROFILE/user.js" <<'EOF'
> user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
> user_pref("browser.shell.checkDefaultBrowser", false);
> user_pref("browser.tabs.closeWindowWithLastTab", true);
> user_pref("browser.warnOnQuitShortcut", false);
> EOF
> 
> # Hide chrome (tabs, navbar, bookmarks, titlebar, sidebar, status)
> cat > "$PROFILE/chrome/userChrome.css" <<'EOF'
> #TabsToolbar, #nav-bar, #PersonalToolbar, #titlebar, #sidebar-box, #statuspanel {
>  visibility: collapse !important;
> }
> EOF
> 
> # Launch using that profile (windowed, no chrome)
> firefox -no-remote -profile "$PROFILE" --new-window "$URL" &
> ```
> 
> Tips:
> - This gives you a normal window (resizable/movable) with page content only.
> - For repeated use, stash the profile somewhere persistent and reuse with `-profile /path/to/profile`.
> - If you’re in i3 and also want no WM border:
>  ```bash
>  firefox -no-remote -profile "$PROFILE" --new-window "$URL" & sleep 0.5 && i3-msg 'border pixel 0'
>  ```
> 
> ## 3) Truly headless (no GUI at all)
> Useful for automation/screenshots, not for viewing.
> ```bash
> firefox --headless --screenshot 'page.png' 'https://example.org'
> ```
> 
> ### Reality check
> - There’s no single “chromeless window” flag; kiosk and CSS are the two workable paths.
> - The CSS route is stable and scriptable; kiosk is simplest if fullscreen is acceptable.
> 
> #linux #firefox #kiosk #bash #i3wm #automation #tips
<!-- UID: c1823463-fa17-4ee6-a711-2099f8d6ee0f -->

---


