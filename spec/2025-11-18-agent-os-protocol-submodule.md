# Agent OS Protocol submodule relocation

## Context

- Submodule previously configured at `packages/agent-os-protocol` but directory moved; `.git` pointer broke (`git` could not chdir in user command).
- Goal: re-add the submodule in its new home `experimental/agent-os-protocol` using git commands only.

## Changes planned / performed

- Remove stale `.gitmodules` entry for `packages/agent-os-protocol`.
- Add submodule back at `experimental/agent-os-protocol` tracking `device/stealth` branch.
- Initialize/update submodule checkout.

## Files

- `.gitmodules` lines ~1-140: new entry `[submodule "experimental/agent-os-protocol"]` with path/url/branch; prior `packages/agent-os-protocol` entry removed.

## Commands executed

- `git config -f .gitmodules --remove-section submodule.packages/agent-os-protocol`
- `git config --remove-section submodule.packages/agent-os-protocol`
- `git clean -fd experimental/agent-os-protocol`
- `git submodule add -b device/stealth git@github.com:riatzukiza/agent-os-protocol.git experimental/agent-os-protocol`
- `git submodule update --init --recursive experimental/agent-os-protocol`
- `git submodule status experimental/agent-os-protocol`

## Definition of done

- `.gitmodules` reflects new path `experimental/agent-os-protocol` and no stale entry for the old path.
- `git submodule status experimental/agent-os-protocol` reports a valid commit on `device/stealth` (currently `0b4d3f9ace1c639c6a944effbbfba833e046c6a9`).
- Working tree shows the submodule tracked; no broken gitdir references.

## Notes

- Other existing repo changes remain untouched (e.g., `cli/kanban`, `packages/http`).
