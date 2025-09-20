#!/usr/bin/env bash

# ---------- run context ----------
ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
RUN_TS="${RUN_TS:-$(date -u +"%Y.%m.%d.%H.%M.%S")}"
ART_ROOT="$ART_ROOT" RUN_TS="$RUN_TS" source "$(dirname "$0")/describe.sh"

# ---------- base/tooling ----------
describe env-dump               bash -lc '(set -o posix; set)'

# pre-commit
describe uvx-precommit-install  uvx pre-commit install
describe uvx-hook-install       uvx pre-commit install --install-hooks
describe uvx-hook-commit-msg    uvx pre-commit install --hook-type commit-msg
describe uvx-hook-pre-merge     uvx pre-commit install --hook-type pre-merge-commit

# OS deps
describe apt-update             bash -lc 'export DEBIAN_FRONTEND=noninteractive; apt-get update -y'
describe apt-build-tools        bash -lc 'apt-get install -y build-essential python3 make g++ pkg-config'
describe apt-extras             bash -lc 'apt-get install -y git ca-certificates jq moreutils ripgrep'

# native toolchain + node-gyp helpers
describe install-gyp            bash -lc '"./run/install_gyp.sh"'

# node toolchain
describe corepack-enable        corepack enable
describe pnpm-activate          corepack prepare pnpm@9.0.0 --activate
describe pnpm-install           pnpm install --frozen-lockfile

# playwright
describe setup-playwright       bash -lc '"./run/setup_playwright.sh"'

# gh CLI + origin
# describe install-gh-cli         bash -lc '"$(dirname "$0")/install_gh_cli.sh"'
# describe setup-gh-cli           bash -lc '"$(dirname "$0")/setup_gh_cli.sh"'

# services: chroma + ollama
describe chroma-standup         bash -lc '"./run/standup_chroma_nohup.sh"'
describe ollama-install         bash -lc 'curl -fsSL https://ollama.com/install.sh | sh'
describe ollama-standup         bash -lc '"./run/standup_ollama_nohup.sh"'

# helpful globals (non-fatal)
describe npm-corepack-latest    bash -lc 'npm i -g corepack@latest'
describe npm-eslint-global      bash -lc 'npm i -g eslint'


  describe pnpm-build           pnpm -r --no-bail build
# fi

describe eslint-stylish         pnpm exec eslint --cache -f stylish .

# ---------- exit policy ----------
describe_finalize
