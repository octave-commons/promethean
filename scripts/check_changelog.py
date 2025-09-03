#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Pre-commit hook to validate changelog entries.

- Ensures each PR adds at most one fragment in ``changelog.d`` by checking for
  duplicate filename prefixes.
- Fails if ``CHANGELOG.md`` is staged for commit.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
CHANGELOG_DIR = REPO_ROOT / "changelog.d"
CHANGELOG_MD = REPO_ROOT / "CHANGELOG.md"


def check_duplicate_fragments() -> bool:
    """Return ``True`` if no duplicate changelog fragment prefixes exist."""
    prefixes: dict[str, Path] = {}
    for fragment in CHANGELOG_DIR.glob("*.md"):
        prefix = fragment.name.split(".")[0]
        if prefix in prefixes:
            print(
                "Duplicate changelog fragments detected for PR",
                prefix,
                f"({prefixes[prefix].name}, {fragment.name})",
                file=sys.stderr,
            )
            return False
        prefixes[prefix] = fragment
    return True


def changelog_modified() -> bool:
    """Return ``True`` if ``CHANGELOG.md`` is staged for commit."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "--cached", str(CHANGELOG_MD)],
        capture_output=True,
        text=True,
        check=False,
    )
    return bool(result.stdout.strip())


def main() -> int:
    ok = True
    if not check_duplicate_fragments():
        ok = False
    if changelog_modified():
        print(
            "Direct modifications to CHANGELOG.md are not allowed. "
            "Add a fragment under changelog.d/ instead.",
            file=sys.stderr,
        )
        ok = False
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
