---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Change hostname Linux"
conversation_id: 68b60bf9-7930-8320-b7e5-90f5319b8e71
create_time: 09/01/2025 at 4:11 PM
update_time: 09/01/2025 at 5:44 PM
---

# Title: Change hostname Linux

Created: 09/01/2025 at 4:11 PM
Last Updated: 09/01/2025 at 5:44 PM
Chat URL: https://chat.openai.com/c/68b60bf9-7930-8320-b7e5-90f5319b8e71


>[!nexus_user] **User** - 09/01/2025 at 4:11 PM
> change hostname linux
<!-- UID: b2d83ca1-b89f-4e31-a894-d954734e4ef7 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 4:11 PM
> ​Changing your Linux system's hostname can be done temporarily or permanently, depending on your needs. Here's how to do both:
> 
> ---
> 
> ### 🔧 Temporary Hostname Change (Reverts on Reboot)
> 
> To change the hostname for the current session:
> 
> ```bash
> sudo hostname new-hostname
> ```
> 
> This change is immediate but will not persist after a reboot.
> 
> ---
> 
> ### 🛠️ Permanent Hostname Change (Persists Across Reboots)
> 
> #### **Method 1: Using `hostnamectl` (Systemd-based Systems)**
> 
> For systems using `systemd` (common in modern distributions like Ubuntu 16.04+, CentOS 7+, Debian 9+):
> 
> ```bash
> sudo hostnamectl set-hostname new-hostname
> ```
> 
> This command updates the static hostname and is effective immediately without requiring a reboot.
> 
> #### **Method 2: Editing Configuration Files**
> 
> For broader compatibility or finer control:
> 
> 1. **Edit `/etc/hostname`:**
> 
>  ```bash
>  sudo nano /etc/hostname
>  ```
> 
>  Replace the existing hostname with your desired one.
> 
> 2. **Edit `/etc/hosts`:**
> 
>  ```bash
>  sudo nano /etc/hosts
>  ```
> 
>  Update the line referencing the old hostname to reflect the new one, typically:
> 
>  ```
>  127.0.1.1 new-hostname
>  ```
> 
> 3. **Apply Changes:**
> 
>  ```bash
>  sudo systemctl restart systemd-logind.service
>  ```
> 
>  Alternatively, a full reboot ensures all services recognize the new hostname:
> 
>  ```bash
>  sudo reboot
>  ```
> 
> ---
> 
> ### ⚠️ Additional Considerations
> 
> - **Cloud Environments:** If your system uses `cloud-init`, it may override manual hostname changes on reboot. To prevent this, set `preserve_hostname: true` in `/etc/cloud/cloud.cfg`.
> 
> - **Service Dependencies:** Some services (e.g., mail servers, databases) may cache the hostname at startup. Restarting these services ensures they recognize the new hostname.
> 
> - **User Sessions:** Active terminal sessions may not reflect the hostname change immediately. Starting a new session or sourcing the profile can update the prompt.
> 
> ---
> 
> By following these steps, you can effectively manage your Linux system's hostname to suit your operational requirements.
<!-- UID: 8862cb16-39a9-4d3a-b99c-2a7dd9aef6cd -->

---




>[!nexus_user] **User** - 09/01/2025 at 5:41 PM
> I just want my long ass computer name to be out of my oh my bash prompt line:
> 05:40:43 err@err-Stealth-16-AI-Studio-A1VGG promethean ±|dev/stealth ✗|→
<!-- UID: 2f041c9c-474e-4b06-979c-35f7efb4df21 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 5:41 PM
> All right, let’s tackle that obnoxiously long hostname in your **Oh My Bash** prompt.
> 
> ---
> 
> ## Step-by-Step Fix (Practical, No Fluff)
> 
> You’re running Bash with *Oh My Bash*—a shell framework. What you need to do is tweak your `PS1` prompt definition so it doesn’t include the hostname part.
> 
> ### Option 1: Minimal and Direct (Edit `PS1`)
> 1. Open your Bash prompt config:
> 
>  ```bash
>  nano ~/.bashrc
>  ```
> 
> 2. Search for the line setting `PS1—likely something like:
> 
>  ```
>  PS1='[\u@\h \W]\$ '
>  ```
> 
> 3. Remove `\@` or `\h` (hostname shorthand), e.g.:
> 
>  ```bash
>  PS1='[\u \W]\$ '
>  ```
> 
> 4. Save, exit, and apply the change:
> 
>  ```bash
>  source ~/.bashrc
>  ```
> 
> This strips out the hostname entirely. If you want only the folder or just the dollar sign, you can simplify further (e.g. `PS1='[\W]\$ '` or even `PS1='\$ '`).
> 
> This method applies to vanilla Bash and most themescite.
> 
> ---
> 
> ### Option 2: If Using an Oh-My-Bash Theme (Like Powerlevel9k)
> If your prompt is powered by **Powerlevel9k**, things get trickier (but still fixable):
> 
> - Edit `~/.bashrc`, and add this line at the bottom (or wherever other Powerlevel config lines live):
> 
>  ```bash
>  POWERLEVEL9K_CONTEXT_TEMPLATE="%n"
>  ```
> 
> - This tells Powerlevel9k to only show the username (`%n`) and drop the hostname (`%m`)cite.
> 
> ---
> 
> ### Option 3: Custom Themes Under Oh My Bash
> Some Oh My Bash themes define prompts in theme files—your changes could be overwritten on updates. Here’s a safer approach:
> 
> 1. Find your active theme’s file inside `~/.oh-my-bash/themes/`.
> 2. Copy it to your `~/.oh-my-bash/custom/themes/` directory:
> 
>  ```bash
>  mkdir -p ~/.oh-my-bash/custom/themes
>  cp ~/.oh-my-bash/themes/your-theme.sh ~/.oh-my-bash/custom/themes/
>  ```
> 
> 3. Open the copied file, look for `PROMPT=...`, and edit out the hostname portion (e.g. `%m` or `\h`).
> 4. Save and reset your shell (or `source ~/.bashrc`).
> 
> This lets you override theme behavior while keeping your customizations safe from updatescite.
> 
> ---
> 
> ## Quick Decision Tree
> 
> | Your Setup | What to Edit | What to Change |
> |----------------------------------|------------------------|------------------------------------------------------|
> | Vanilla Bash (Oh My Bash theme) | `~/.bashrc` → `PS1` | Remove `\h` (hostname) from the prompt line |
> | Powerlevel9k theme | `~/.bashrc` settings | Add `POWERLEVEL9K_CONTEXT_TEMPLATE="%n"` |
> | Custom theme file (Oh My Bash) | Custom theme script | Copy to `custom/themes/`, edit out hostname `%m` |
> 
> ---
> 
> If you'd rather avoid tinkering manually, give me a snippet of your current `PS1` or config lines—I’ll walk you through exactly what to change.
> 
> Enough with excuses. Let’s get that prompt clean and lean.
<!-- UID: aac46d44-e12d-4c5a-b489-45aab125839d -->

---




>[!nexus_user] **User** - 09/01/2025 at 5:42 PM
> # Enable the subsequent settings only in interactive sessions
> case $- in
>  *i*) ;;
>  *) return;;
> esac
> 
> # Path to your oh-my-bash installation.
> export OSH='/home/err/.oh-my-bash'
> 
> # Set name of the theme to load. Optionally, if you set this to "random"
> # it'll load a random theme each time that oh-my-bash is loaded.
> OSH_THEME="font"
> 
> # If you set OSH_THEME to "random", you can ignore themes you don't like.
> # OMB_THEME_RANDOM_IGNORED=("powerbash10k" "wanelo")
> # You can also specify the list from which a theme is randomly selected:
> # OMB_THEME_RANDOM_CANDIDATES=("font" "powerline-light" "minimal")
> 
> # Uncomment the following line to use case-sensitive completion.
> # OMB_CASE_SENSITIVE="true"
> 
> # Uncomment the following line to use hyphen-insensitive completion. Case
> # sensitive completion must be off. _ and - will be interchangeable.
> # OMB_HYPHEN_SENSITIVE="false"
> 
> # Uncomment the following line to disable bi-weekly auto-update checks.
> # DISABLE_AUTO_UPDATE="true"
> 
> # Uncomment the following line to change how often to auto-update (in days).
> # export UPDATE_OSH_DAYS=13
> 
> # Uncomment the following line to disable colors in ls.
> # DISABLE_LS_COLORS="true"
> 
> # Uncomment the following line to disable auto-setting terminal title.
> # DISABLE_AUTO_TITLE="true"
> 
> # Uncomment the following line to enable command auto-correction.
> # ENABLE_CORRECTION="true"
> 
> # Uncomment the following line to display red dots whilst waiting for completion.
> # COMPLETION_WAITING_DOTS="true"
> 
> # Uncomment the following line if you want to disable marking untracked files
> # under VCS as dirty. This makes repository status check for large repositories
> # much, much faster.
> # DISABLE_UNTRACKED_FILES_DIRTY="true"
> 
> # Uncomment the following line if you don't want the repository to be considered dirty
> # if there are untracked files.
> # SCM_GIT_DISABLE_UNTRACKED_DIRTY="true"
> 
> # Uncomment the following line if you want to completely ignore the presence
> # of untracked files in the repository.
> # SCM_GIT_IGNORE_UNTRACKED="true"
> 
> # Uncomment the following line if you want to change the command execution time
> # stamp shown in the history command output. One of the following values can
> # be used to specify the timestamp format.
> # * 'mm/dd/yyyy' # mm/dd/yyyy + time
> # * 'dd.mm.yyyy' # dd.mm.yyyy + time
> # * 'yyyy-mm-dd' # yyyy-mm-dd + time
> # * '[mm/dd/yyyy]' # [mm/dd/yyyy] + [time] with colors
> # * '[dd.mm.yyyy]' # [dd.mm.yyyy] + [time] with colors
> # * '[yyyy-mm-dd]' # [yyyy-mm-dd] + [time] with colors
> # If not set, the default value is 'yyyy-mm-dd'.
> # HIST_STAMPS='yyyy-mm-dd'
> 
> # Uncomment the following line if you do not want OMB to overwrite the existing
> # aliases by the default OMB aliases defined in lib/*.sh
> # OMB_DEFAULT_ALIASES="check"
> 
> # Would you like to use another custom folder than $OSH/custom?
> # OSH_CUSTOM=/path/to/new-custom-folder
> 
> # To disable the uses of "sudo" by oh-my-bash, please set "false" to
> # this variable. The default behavior for the empty value is "true".
> OMB_USE_SUDO=true
> 
> # To enable/disable display of Python virtualenv and condaenv
> # OMB_PROMPT_SHOW_PYTHON_VENV=true # enable
> # OMB_PROMPT_SHOW_PYTHON_VENV=false # disable
> 
> # To enable/disable Spack environment information
> # OMB_PROMPT_SHOW_SPACK_ENV=true # enable
> # OMB_PROMPT_SHOW_SPACK_ENV=false # disable
> 
> # Which completions would you like to load? (completions can be found in ~/.oh-my-bash/completions/*)
> # Custom completions may be added to ~/.oh-my-bash/custom/completions/
> # Example format: completions=(ssh git bundler gem pip pip3)
> # Add wisely, as too many completions slow down shell startup.
> completions=(
>  git
>  composer
>  ssh
> )
> 
> # Which aliases would you like to load? (aliases can be found in ~/.oh-my-bash/aliases/*)
> # Custom aliases may be added to ~/.oh-my-bash/custom/aliases/
> # Example format: aliases=(vagrant composer git-avh)
> # Add wisely, as too many aliases slow down shell startup.
> aliases=(
>  general
> )
> 
> # Which plugins would you like to load? (plugins can be found in ~/.oh-my-bash/plugins/*)
> # Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
> # Example format: plugins=(rails git textmate ruby lighthouse)
> # Add wisely, as too many plugins slow down shell startup.
> plugins=(
>  git
>  bashmarks
> )
> 
> # Which plugins would you like to conditionally load? (plugins can be found in ~/.oh-my-bash/plugins/*)
> # Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
> # Example format:
> # if [ "$DISPLAY" ] || [ "$SSH" ]; then
> # plugins+=(tmux-autoattach)
> # fi
> 
> # If you want to reduce the initialization cost of the "tput" command to
> # initialize color escape sequences, you can uncomment the following setting.
> # This disables the use of the "tput" command, and the escape sequences are
> # initialized to be the ANSI version:
> #
> #OMB_TERM_USE_TPUT=no
> 
> source "$OSH"/oh-my-bash.sh
> 
> # User configuration
> # export MANPATH="/usr/local/man:$MANPATH"
> 
> # You may need to manually set your language environment
> # export LANG=en_US.UTF-8
> 
> # Preferred editor for local and remote sessions
> # if [[ -n $SSH_CONNECTION ]]; then
> # export EDITOR='vim'
> # else
> # export EDITOR='mvim'
> # fi
> 
> # Compilation flags
> # export ARCHFLAGS="-arch x86_64"
> 
> # ssh
> # export SSH_KEY_PATH="~/.ssh/rsa_id"
> 
> # Set personal aliases, overriding those provided by oh-my-bash libs,
> # plugins, and themes. Aliases can be placed here, though oh-my-bash
> # users are encouraged to define aliases within the OSH_CUSTOM folder.
> # For a full list of active aliases, run `alias`.
> #
> # Example aliases
> # alias bashconfig="mate ~/.bashrc"
> # alias ohmybash="mate ~/.oh-my-bash"
> eval "$(direnv hook bash)"
> 
> # pnpm
> export PNPM_HOME="/home/err/.local/share/pnpm"
> case ":$PATH:" in
>  *":$PNPM_HOME:"*) ;;
>  *) export PATH="$PNPM_HOME:$PATH" ;;
> esac
> # pnpm end
> 
> [ -f ~/.fzf.bash ] && source ~/.fzf.bash
> alias cfg="git --git-dir=$HOME/.cfg --work-tree=$HOME"
> # Load pyenv automatically by appending
> # the following to
> # ~/.bash_profile if it exists, otherwise ~/.profile (for login shells)
> # and ~/.bashrc (for interactive shells) :
> 
> export PYENV_ROOT="$HOME/.pyenv"
> [[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
> eval "$(pyenv init - bash)"
> 
> # Restart your shell for the changes to take effect.
> 
> # Load pyenv-virtualenv automatically by adding
> # the following to ~/.bashrc:
> 
> eval "$(pyenv virtualenv-init -)"
> export LIBPYTHON=/home/err/.pyenv/versions/3.12.1/lib/libpython3.12.so
> 
> export CFG_BRANCH_NAME=device/$HOSTNAME
> 
> # Backup dotfiles
> 
> # if the cfg repo is not initialized yet
> if [ ! -d $HOME/.cfg ]; then
>  git clone --bare
> fi
> 
> # If not alredy on the correct branch
> if [ "$(cfg rev-parse --abbrev-ref HEAD)" != "$CFG_BRANCH_NAME" ]; then
>  cfg checkout -b $CFG_BRANCH_NAME
> fi
> 
> ## If the remote is not set yet
> if ! cfg remote | grep origin; then
>  cfg remote add origin git@github.com:riatzukiza/dotfiles.git
> fi
> 
> cfg pull origin $CFG_BRANCH_NAME
> cfg add .bashrc .gitconfig .config/i3/config \
>  .config/i3/conf.d/ \
>  .config/espanso/ \
>  .config/alacritty/alacritty.toml \
>  .config/nvim/init.vim \
>  .config/fontconfig/fonts.conf \
>  .config/htop/htoprc \
>  .config/picom/picom.conf \
>  .spacemacs \
>  .profile \
>  .bash_profile
> 
> cfg commit -m "backup"
> cfg push -u origin $CFG_BRANCH_NAME
<!-- UID: 513df057-1a10-484d-975a-354d9de75ec6 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 5:43 PM
> Got it — you’re on **Oh-My-Bash** with the `font` theme. Easiest fix: override the theme’s prompt **after** it loads and strip the hostname token out of `$PS1`. No need to rename the machine or switch themes.
> 
> ## Do this
> 
> Add these lines **below** `source "$OSH"/oh-my-bash.sh` in your `~/.bashrc`:
> 
> ```bash
> # --- Hide hostname in Oh-My-Bash prompt (put this after oh-my-bash.sh) ---
> # Remove "user@host" → keep just "user" (handles \u@\h and lone \h/\H)
> PS1="${PS1//@\\h/}" # drops the "@\h" part if present
> PS1="${PS1//\\h/}" # drops any remaining "\h"
> PS1="${PS1//\\H/}" # drops any "\H" (FQDN) just in case
> # Optional: if your theme cached PS1 via PROMPT_COMMAND, re-apply on each prompt
> # PROMPT_COMMAND=':' # uncomment only if your theme keeps undoing the change
> ```
> 
> Then reload:
> 
> ```bash
> source ~/.bashrc
> ```
> 
> That keeps the rest of the theme (time, git, fancy glyphs) intact — just kills the long `err@err-Stealth-16-AI-Studio-A1VGG` bit.
> 
> Why this works: Oh-My-Bash themes build the prompt string in `$PS1`; removing `\h`/`\H` (hostname escapes) from `$PS1` is the standard way to hide host info in Bash prompts. cite 
> And yes, overriding *after* OMB initializes is the right spot, because OMB themes set `$PS1` during `source "$OSH"/oh-my-bash.sh"`. cite
> 
> ## If you ever want a custom minimal prompt (no host) instead
> Replace the override with your own `$PS1`, e.g.:
> 
> ```bash
> # clean prompt: [HH:MM:SS user cwd git] ↵ →
> PROMPT_DIRTRIM=3
> PS1='[\t \u \W$(__git_ps1 " ±|%s|")] \n→ '
> ```
> 
> (Setting `$PS1` directly is the canonical way to define a Bash prompt.) cite
> 
> ## Notes
> - Some setups (rare) rebuild `$PS1` each prompt via `PROMPT_COMMAND` and may undo changes; clearing or appending your override to `PROMPT_COMMAND` works around that. cite
> - You don’t need to change your machine’s hostname for this; we’re only altering display, not system identity.
> 
> If you paste your **current** prompt line after reloading and it still shows the host, I’ll tweak the replacement to match your theme’s exact tokens. #bash #ohmybash #dotfiles #devex
<!-- UID: bc453ee1-c9af-46ef-b7fa-81ce9a4ca14a -->

---


