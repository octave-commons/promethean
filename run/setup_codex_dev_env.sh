#!/usr/bin/env bash

./run/install-clojure.sh
./run/install-clj-python-ml.sh
# ---------- run context ----------
ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
RUN_TS="${RUN_TS:-$(date -u +"%Y.%m.%d.%H.%M.%S")}"
ART_ROOT="$ART_ROOT" RUN_TS="$RUN_TS" source "$(dirname "$0")/describe.sh"

# ---------- base/tooling ----------
describe env-dump               bash -lc '(set -o posix; set)'

# pre-commit
describe uvx-precommit-install  uvx pre-commit install

# OS deps
describe apt-update             bash -lc 'export DEBIAN_FRONTEND=noninteractive; apt-get update -y'
describe apt-build-tools        bash -lc 'apt-get install -y build-essential python3 make g++ pkg-config'


# native toolchain + node-gyp helpers
describe install-gyp            bash -lc '"./run/install_gyp.sh"'


# node toolchain
describe pnpm-install           pnpm install --frozen-lockfile

# playwright
describe setup-playwright       bash -lc '"./run/setup_playwright.sh"'

# gh CLI + origin
# describe install-gh-cli         bash -lc '"$(dirname "$0")/install_gh_cli.sh"'
# describe setup-gh-cli           bash -lc '"$(dirname "$0")/setup_gh_cli.sh"'


# services: chroma + ollama
# ./run/standup_chroma_nohup.sh
# curl -fsSL https://ollama.com/install.sh | sh
# ./run/standup_ollama_nohup.sh


describe pnpm-build           pnpm -r --no-bail build
# fi

# describe eslint-stylish         pnpm exec eslint --cache

# ---------- exit policy ----------
describe_finalize
