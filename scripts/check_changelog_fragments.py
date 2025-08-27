#!/usr/bin/env python3
"""Validate that all changelog fragments have numeric filenames.

This script ensures every file in ``changelog.d`` follows the Towncrier
``<number>.<type>.md`` convention.  It exits with a non-zero status if any
fragments use placeholders or other unexpected names.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

VALID_RE = re.compile(r"^\d+\.(added|changed|deprecated|removed|fixed|security)\.md$")


def main() -> int:
    directory = Path("changelog.d")
    if not directory.exists():
        return 0

    bad = [p.name for p in directory.glob("*.md") if not VALID_RE.match(p.name)]
    if bad:
        print("Invalid changelog fragment names detected:", file=sys.stderr)
        for name in bad:
            print(f" - {name}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
