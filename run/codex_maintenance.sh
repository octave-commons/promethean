#!/usr/bin/env bash

# ---------- run context ----------
ART_ROOT="${ART_ROOT:-docs/reports/codex_cloud}"
RUN_TS="${RUN_TS:-$(date -u +"%Y.%m.%d.%H.%M.%S")}"

# bring in describe() (creates $RUN_DIR = $ART_ROOT/describe/$RUN_TS)
ART_ROOT="$ART_ROOT" RUN_TS="$RUN_TS" source "$(dirname "$0")/describe.sh"

# ---------- knobs ----------
BUILD_TIMEOUT_SECS="${BUILD_TIMEOUT_SECS:-1200}"

# ---------- steps (never fail outward) ----------
describe env-dump            bash -lc '(set -o posix; set)'
describe pnpm-install        pnpm install --no-frozen-lockfile


TIMEOUT_SECS="$BUILD_TIMEOUT_SECS" describe pnpm-build        pnpm -r --no-bail build

# ESLint artifacts (human + machine)
# describe eslint-stylish      pnpm exec eslint --cache -f stylish .
# gh wiring + origin
# Doesn't seem work.
# It probably installs, but the agent won't use it.
# describe setup-gh-cli        bash -lc '"$(dirname "$0")/setup_gh_cli.sh"'

# services
# ./run/standup_chroma_nohup.sh
# ./run/standup_ollama_nohup.sh


# ---------- exit policy ----------
# keep never-fail default; set STRICT=1 to fail at end if any step had rc != 0
describe_finalize
