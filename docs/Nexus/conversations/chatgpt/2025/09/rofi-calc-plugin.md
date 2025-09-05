---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Rofi calc plugin"
conversation_id: 68b7230c-7398-8327-830e-84d0eefc6386
create_time: 09/02/2025 at 12:02 PM
update_time: 09/02/2025 at 12:04 PM
---

# Title: Rofi calc plugin

Created: 09/02/2025 at 12:02 PM
Last Updated: 09/02/2025 at 12:04 PM
Chat URL: https://chat.openai.com/c/68b7230c-7398-8327-830e-84d0eefc6386


>[!nexus_user] **User** - 09/02/2025 at 12:02 PM
> rofi calc
<!-- UID: 6336d64a-280a-45cc-9a7c-a5fc609a993a -->




>[!nexus_agent] **Assistant** - 09/02/2025 at 12:02 PM
> ​**rofi-calc** is a plugin for [Rofi](https://github.com/davatorium/rofi), a window switcher and application launcher, that enables live calculations directly within the Rofi interface. It leverages [qalculate's `qalc`](https://qalculate.github.io/) to parse natural language input and provide results.
> 
> ---
> 
> ### 🔧 Installation
> 
> You can install `rofi-calc` via your distribution's package manager or build it from source.
> 
> **From Source:**
> 
> Ensure you have the following dependencies:
> 
> - `rofi` (version ≥ 1.7.6)
> - `qalculate` (version > 2.0)
> - Development headers for `rofi`
> - Build tools: `meson`, `pkg-config`, etc.
> 
> Then, execute:
> 
> ```bash
> git clone https://github.com/svenstaro/rofi-calc.git
> cd rofi-calc/
> meson setup build
> meson compile -C build/
> sudo meson install -C build/
> ```
> 
> ---
> 
> ### 🚀 Usage
> 
> Launch `rofi-calc` with:
> 
> ```bash
> rofi -show calc -modi calc -no-show-match -no-sort
> ```
> 
> You can input expressions like:
> 
> - `500 + 25%`
> - `5000 EUR to USD`
> - `150 to hex`
> - `60x + 30 = 50`
> 
> To copy the result to the clipboard upon pressing `Ctrl+Return`:
> 
> ```bash
> rofi -show calc -modi calc -no-show-match -no-sort -calc-command "echo -n '{result}' | xclip -selection clipboard"
> ```
> 
> To type out the result using `xdotool`:
> 
> ```bash
> rofi -modi calc -show calc -calc-command 'xdotool type --clearmodifiers "{result}"'
> ```
> 
> ---
> 
> ### ⚙️ Configuration Options
> 
> - `-qalc-binary`: Specify the path to the `qalc` binary.
> - `-terse`: Output only the result of the expression.
> - `-no-unicode`: Disable Unicode mode in `qalc`.
> - `-calc-command`: Define a shell command to execute with `{expression}` and `{result}` placeholders.
> - `-no-persist-history`: Disable saving history between sessions.
> - `-no-history`: Disable history entirely.
> - `-automatic-save-to-history`: Automatically save the last calculation to history upon closing Rofi.
> - `-no-bold`: Disable bold font for results.
> 
> You can also set these options in your Rofi configuration file (`~/.config/rofi/config.rasi`):
> 
> ```rasi
> configuration {
>  calc {
>  hint-result: "Result: ";
>  hint-welcome: "Calculator";
>  }
> }
> ```
> 
> ---
> 
> ### 🧠 Tips
> 
> - To enable thousand separators in the output (e.g., `5 * 12 = 6,000`), add the following to `~/.config/qalculate/qalc.cfg`:
> 
>  ```ini
>  digit_grouping=2
>  ```
> 
> - To use a different decimal separator (e.g., comma instead of dot), set the `LC_NUMERIC` environment variable:
> 
>  ```bash
>  LC_NUMERIC=de_DE.UTF-8 rofi -show calc -modi calc -no-show-match -no-sort
>  ```
> 
> - To bind `rofi-calc` to a key combination in i3 window manager, add the following to your i3 configuration:
> 
>  ```i3
>  bindsym $mod+c exec --no-startup-id "rofi -show calc -modi calc -no-show-match -no-sort"
>  ```
> 
> ---
> 
> For more information and updates, visit the [rofi-calc GitHub repository](https://github.com/svenstaro/rofi-calc).
> 
> ---
<!-- UID: bf5d74d8-f497-4590-a34f-f854597994ab -->

---


