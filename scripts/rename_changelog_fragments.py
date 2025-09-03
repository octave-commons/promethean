#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Rename changelog fragments to use the actual PR number.

This script searches ``changelog.d`` for fragment files and renames them to
``<PR_NUMBER>.<type>.md`` where ``<type>`` is one of the Towncrier supported
fragment types.  Any fragments that already match the target name are left
untouched.  Extra placeholder fragments that would conflict with the new name
are removed to keep the directory tidy.

The pull request number is read from the ``PR_NUMBER`` environment variable or
may be supplied as the first command line argument.
"""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

FRAGMENT_RE = re.compile(
    r"^(?P<prefix>.+?)\.(?P<type>added|changed|deprecated|removed|fixed|security)\.md$"
)


def main() -> int:
    pr_number = os.environ.get("PR_NUMBER")
    if not pr_number and len(sys.argv) > 1:
        pr_number = sys.argv[1]
    if not pr_number or not pr_number.isdigit():
        print("PR number must be provided as PR_NUMBER or argument", file=sys.stderr)
        return 1

    directory = Path("changelog.d")
    if not directory.exists():
        return 0

    for path in list(directory.glob("*.md")):
        match = FRAGMENT_RE.match(path.name)
        if not match:
            # Remove files that do not follow the fragment pattern
            path.unlink()
            continue

        frag_type = match.group("type")
        target = directory / f"{pr_number}.{frag_type}.md"
        if path == target:
            continue
        if target.exists():
            path.unlink()
        else:
            path.rename(target)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
