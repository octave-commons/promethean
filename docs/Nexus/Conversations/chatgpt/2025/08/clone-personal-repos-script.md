---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Clone personal repos script"
conversation_id: 68a64465-7cdc-8333-a589-edfdc9f651cc
create_time: 08/20/2025 at 4:55 PM
update_time: 08/22/2025 at 8:10 AM
---

# Title: Clone personal repos script

Created: 08/20/2025 at 4:55 PM
Last Updated: 08/22/2025 at 8:10 AM
Chat URL: https://chat.openai.com/c/68a64465-7cdc-8333-a589-edfdc9f651cc


>[!nexus_user] **User** - 08/20/2025 at 4:55 PM
> I need a script which can clone all my personal repos
<!-- UID: b089fc28-11ca-4a7a-86af-a025b7f827a1 -->




>[!nexus_agent] **Assistant** - 08/20/2025 at 4:56 PM
> Got it. Here’s a no-nonsense way to clone **all repos you personally own on GitHub** (public + private), with sensible filters and parallel cloning. It uses the GitHub API directly (no `gh` CLI required). If you prefer using `gh`, I’ve got that variant below too.
> 
> # Bash script: `clone_my_github_repos.sh`
> 
> ```bash
> #!/usr/bin/env bash
> set -euo pipefail
> 
> # Clone all repos you personally own on GitHub (public + private by default).
> # Requires:
> # - GITHUB_TOKEN in env (PAT with at least "repo" scope to see private repos)
> # - curl, jq, git
> #
> # Usage:
> # GITHUB_TOKEN=... ./clone_my_github_repos.sh [options]
> #
> # Options:
> # -m, --mode ssh|https (default: ssh)
> # -v, --visibility public|private|all (default: all)
> # --include-forks (default: false)
> # --include-archived (default: false)
> # -o, --outdir PATH (default: ./github-repos)
> # -p, --parallel N (default: 4)
> # --dry-run (list only, don’t clone)
> #
> # Notes:
> # - "affiliation=owner" limits to repos you personally own.
> # - Skips existing directories; will "git fetch --all --prune" instead.
> 
> API="https://api.github.com"
> MODE="ssh"
> VISIBILITY="all"
> INCLUDE_FORKS="false"
> INCLUDE_ARCHIVED="false"
> OUTDIR="./github-repos"
> PARALLEL=4
> DRYRUN="false"
> 
> need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing dependency: $1" >&2; exit 1; }; }
> 
> # Parse args
> while [[ $# -gt 0 ]]; do
>  case "$1" in
>  -m|--mode) MODE="${2:-}"; shift 2 ;;
>  -v|--visibility) VISIBILITY="${2:-}"; shift 2 ;;
>  --include-forks) INCLUDE_FORKS="true"; shift ;;
>  --include-archived) INCLUDE_ARCHIVED="true"; shift ;;
>  -o|--outdir) OUTDIR="${2:-}"; shift 2 ;;
>  -p|--parallel) PARALLEL="${2:-}"; shift 2 ;;
>  --dry-run) DRYRUN="true"; shift ;;
>  -h|--help)
>  sed -n '1,80p' "$0"; exit 0;;
>  *)
>  echo "Unknown arg: $1" >&2; exit 2;;
>  esac
> done
> 
> # Validate
> [[ -n "${GITHUB_TOKEN-}" ]] || { echo "Error: GITHUB_TOKEN env var is required." >&2; exit 1; }
> [[ "$MODE" =~ ^(ssh|https)$ ]] || { echo "Error: --mode must be ssh or https" >&2; exit 1; }
> [[ "$VISIBILITY" =~ ^(public|private|all)$ ]] || { echo "Error: --visibility must be public|private|all" >&2; exit 1; }
> need curl; need jq; need git
> 
> mkdir -p "$OUTDIR"
> 
> AUTH_HEADER=("Authorization: Bearer $GITHUB_TOKEN")
> ACCEPT=("Accept: application/vnd.github+json")
> APIV=("X-GitHub-Api-Version: 2022-11-28")
> 
> # Get your username (login)
> LOGIN=$(curl -fsSL -H "${AUTH_HEADER[@]}" -H "${ACCEPT[@]}" -H "${APIV[@]}" "$API/user" | jq -r .login)
> if [[ "$LOGIN" == "null" || -z "$LOGIN" ]]; then
>  echo "Error: Could not resolve authenticated user. Check GITHUB_TOKEN." >&2
>  exit 1
> fi
> 
> echo "Authenticated as: $LOGIN"
> echo "Mode: $MODE, Visibility: $VISIBILITY, include forks: $INCLUDE_FORKS, include archived: $INCLUDE_ARCHIVED"
> echo "Output dir: $OUTDIR, Parallel: $PARALLEL"
> echo
> 
> # Build base query: limit to repos you own
> # per_page=100 with manual pagination
> BASE_QS="affiliation=owner&per_page=100"
> [[ "$VISIBILITY" != "all" ]] && BASE_QS="$BASE_QS&visibility=$VISIBILITY"
> 
> PAGE=1
> URLS_FILE="$(mktemp)"
> trap 'rm -f "$URLS_FILE"' EXIT
> 
> while :; do
>  RESP=$(curl -fsSL \
>  -H "${AUTH_HEADER[@]}" -H "${ACCEPT[@]}" -H "${APIV[@]}" \
>  "$API/user/repos?$BASE_QS&page=$PAGE")
> 
>  COUNT=$(jq 'length' <<<"$RESP")
>  (( COUNT == 0 )) && break
> 
>  # Filter
>  jq -r --arg mode "$MODE" \
>  --argjson include_forks "$INCLUDE_FORKS" \
>  --argjson include_archived "$INCLUDE_ARCHIVED" '
>  .[]
>  | select(($include_forks or (.fork|not)))
>  | select(($include_archived or (.archived|not)))
>  | if $mode=="ssh" then .ssh_url else .clone_url end
>  ' <<<"$RESP" >> "$URLS_FILE"
> 
>  (( PAGE++ ))
> done
> 
> if [[ ! -s "$URLS_FILE" ]]; then
>  echo "No repositories matched filters."
>  exit 0
> fi
> 
> echo "Repositories to process:"
> wc -l "$URLS_FILE" | awk '{print $1, "repos"}'
> echo
> 
> if [[ "$DRYRUN" == "true" ]]; then
>  cat "$URLS_FILE"
>  exit 0
> fi
> 
> export OUTDIR
> clone_one() {
>  repo_url="$1"
>  # derive folder name as owner/name (no .git), then clone to OUTDIR/owner/name
>  owner_name=$(basename "$(dirname "$repo_url")")
>  # more robust owner: parse "github.com:owner/name.git" or https
>  # Normalize by stripping schema/host:
>  path_part="$repo_url"
>  path_part="${path_part#git@github.com:}"
>  path_part="${path_part#https://github.com/}"
>  path_part="${path_part%.git}"
>  owner="${path_part%%/*}"
>  name="${path_part##*/}"
>  target="$OUTDIR/$owner/$name"
> 
>  if [[ -d "$target/.git" ]]; then
>  echo "[exists] $owner/$name -> fetch --all --prune"
>  git -C "$target" fetch --all --prune --tags || true
>  else
>  mkdir -p "$(dirname "$target")"
>  echo "[clone] $owner/$name"
>  git clone --depth=1 "$repo_url" "$target"
>  fi
> }
> 
> export -f clone_one
> # shellcheck disable=SC2046
> xargs -I{} -n1 -P"$PARALLEL" bash -lc 'clone_one "$@"' _ {} < "$URLS_FILE"
> 
> echo
> echo "Done."
> ```
> 
> ## How to use it
> 
> 1) Create a GitHub personal access token (PAT): 
> - Settings → Developer settings → **Fine-grained token** (or classic). 
> - Scopes: at least **repo** (to see private repos). 
> - Save it as an env var in your shell:
> ```bash
> export GITHUB_TOKEN="ghp_...your_token_here..."
> ```
> 
> 2) Save the script, make it executable, run it:
> ```bash
> chmod +x clone_my_github_repos.sh
> # default: SSH, visibility=all, parallel=4, outdir=./github-repos
> ./clone_my_github_repos.sh
> ```
> 
> 3) Common tweaks:
> ```bash
> # Only public repos, HTTPS, and list only:
> ./clone_my_github_repos.sh -m https -v public --dry-run
> 
> # Include forks and archived, clone to ~/code, 8 parallel jobs:
> ./clone_my_github_repos.sh --include-forks --include-archived -o ~/code -p 8
> ```
> 
> It’s idempotent: if a repo directory already exists, it just fetches updates (`git fetch --all --prune --tags`) instead of recloning.
> 
> ---
> 
> ## Prefer `gh` CLI? (simpler, if you have it)
> 
> ```bash
> # Requires: gh, jq, git
> # Log in first: gh auth login
> 
> OUTDIR="${1:-./github-repos}"
> PARALLEL="${2:-4}"
> mkdir -p "$OUTDIR"
> 
> # List repos you own; add --visibility and --no-archived as needed
> gh repo list "$(gh api user | jq -r .login)" \
>  --limit 1000 \
>  --json sshUrl,nameWithOwner,isFork,isArchived \
>  | jq -r '.[] | select(.isFork|not) | select(.isArchived|not) | .sshUrl' \
>  | xargs -n1 -P"$PARALLEL" -I{} bash -lc '
>  url="{}"
>  path="${url#git@github.com:}"; path="${path%.git}"
>  target="'$OUTDIR'/$path"
>  if [[ -d "$target/.git" ]]; then
>  echo "[exists] $path -> fetch"
>  git -C "$target" fetch --all --prune --tags || true
>  else
>  mkdir -p "$(dirname "$target")"
>  echo "[clone] $path"
>  git clone --depth=1 "$url" "$target"
>  fi
>  '
> ```
> 
> ---
> 
> ## Reality check / pitfalls
> 
> - **Rate limits**: The API approach paginates at 100 repos/page. With a PAT, you should be fine, but if you have *hundreds* of repos, you’ll still be under the standard limit. Worst case, re-run later.
> - **Forks/archived**: Off by default. Turn them on if you actually want your dead forks locally—just know you’ll be pulling a lot of junk.
> - **SSH vs HTTPS**: SSH is better if you’ve already set up keys. HTTPS will prompt unless your token is cached by your credential helper.
> - **Storage**: Cloning everything is not free. The script uses `--depth=1` to keep it lighter; drop that if you need full history.
> 
> If you want this for **GitLab** or **Bitbucket**, say the word and I’ll hand you equivalent scripts.
> 
> #scripts #git #github #automation #backup
<!-- UID: c63f92d3-cf8c-4183-ad18-d7bce86652fe -->

---




>[!nexus_user] **User** - 08/22/2025 at 8:05 AM
> What is this syntax?
<!-- UID: f08c1b4c-a36f-4852-8ef2-05cab10b4b18 -->




>[!nexus_agent] **Assistant** - 08/22/2025 at 8:05 AM
> That’s **Bash parameter expansion with a default value**. 
> 
> Specifically:
> 
> ```bash
> OUTDIR="${1:-./github-repos}"
> PARALLEL="${2:-4}"
> ```
> 
> ### Breakdown
> - `$1`, `$2`, … are **positional parameters** — arguments passed to the script when you run it. 
>  Example: `./myscript foo bar` → `$1=foo`, `$2=bar`.
> 
> - The syntax `${var:-default}` means:
>  - If `var` is **set and not empty**, expand to `var`.
>  - Otherwise, expand to `default`.
> 
> So:
> - `OUTDIR="${1:-./github-repos}"` 
>  → If the user provided a first argument (`$1`), `OUTDIR` gets that value. 
>  → If not, it defaults to `./github-repos`.
> 
> - `PARALLEL="${2:-4}"` 
>  → If a second argument (`$2`) is given, use it. 
>  → If not, default to `4`.
> 
> ### Example
> ```bash
> ./clone_my_github_repos.sh ~/code 8
> # OUTDIR=~/code
> # PARALLEL=8
> 
> ./clone_my_github_repos.sh
> # OUTDIR=./github-repos
> # PARALLEL=4
> ```
> 
> This trick is common in portable Bash scripts: lets you provide **optional arguments with defaults** without writing extra `if` statements.
> 
> ---
> 
> Do you want me to also show you the *related variations* of this syntax (like `${var:=default}`, `${var:+alt}`, `${var:?message}`) and how they differ?
<!-- UID: ebb05f81-bc41-4621-9f5d-a932df04a29a -->

---




>[!nexus_user] **User** - 08/22/2025 at 8:10 AM
> What's this?
<!-- UID: de0b1fde-ee03-4712-a7aa-5ae1c471d015 -->




>[!nexus_agent] **Assistant** - 08/22/2025 at 8:10 AM
> Ah, nice catch — that line is a little dense. Let’s unpack it:
> 
> ```bash
> xargs -n1 -P"$PARALLEL" -I{} bash -lc 'clone_one "$@"' _ {}
> ```
> 
> ### What’s going on?
> 
> 1. **`xargs`** 
>  Takes lines of input (in this case repo URLs from `jq`) and runs a command for each line.
> 
> 2. **`-n1`** 
>  Run the command with **one argument at a time** (each repo URL separately).
> 
> 3. **`-P"$PARALLEL"`** 
>  Run up to **$PARALLEL jobs in parallel** (so multiple repos get cloned at once).
> 
> 4. **`-I{}`** 
>  Replace `{}` with the input item (each repo URL) inside the command string.
> 
> 5. **`bash -lc '...' _ {}`** 
>  This looks weird, but it’s just a trick:
>  - `bash -l` → run as a *login shell* (so it picks up your env and PATH). 
>  - `-c 'clone_one "$@"' _ {}` → run the given command string, with `_` as `$0` and `{}` as `$1`. 
>  That means inside the mini-shell:
>  ```bash
>  "$@" # expands to { }
>  ```
>  so effectively it calls:
>  ```bash
>  clone_one "git@github.com:you/repo.git"
>  ```
> 
>  Using `bash -lc` ensures the function `clone_one` (exported earlier with `export -f clone_one`) is available, since `xargs` spawns subshells.
> 
> ---
> 
> ### Simplified mental model
> - `xargs` → “parallelize stuff”
> - `-n1` → “one repo per call”
> - `-P4` → “four at a time”
> - `-I{}` → “plug each repo URL into the placeholder”
> - `bash -lc ...` → “run this in a real Bash shell with your functions”
> 
> ---
> 
> ### Example in action
> Say your `URLS_FILE` contains:
> 
> ```
> git@github.com:you/repo1.git
> git@github.com:you/repo2.git
> ```
> 
> Then `xargs …` runs (with PARALLEL=2):
> 
> ```
> bash -lc 'clone_one "$@"' _ git@github.com:you/repo1.git
> bash -lc 'clone_one "$@"' _ git@github.com:you/repo2.git
> ```
> 
> Both can run at once.
> 
> ---
> 
> 👉 So that gnarly one-liner is just: 
> **“for each repo URL, call `clone_one` on it, with up to N in parallel.”**
> 
> ---
> 
> Do you want me to show you a **cleaner / more modern alternative** (e.g. `GNU parallel` or a `while read` loop with background jobs) so it’s easier to grok without the `bash -lc` hack?
<!-- UID: 7d4c211e-88d3-440f-812d-cce6ce8a3e85 -->

---


