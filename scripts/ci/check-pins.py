#!/usr/bin/env python3
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHECK_PATHS = [
    REPO_ROOT / "package.json",
    REPO_ROOT / ".github" / "workflows",
    REPO_ROOT / "docker-compose.yml",
]

patterns = [
    (
        re.compile(r"^\s*uses:\s+[^#\n]+@v\d+(?:\.\d+)?", re.MULTILINE),
        ".github workflow uses unpinned action tag",
    ),
    (re.compile(r":latest"), "floating latest tag"),
    (re.compile(r'"[^"]+":\s+"[~^]'), "semver range in package.json"),
]

failures = []
for path in CHECK_PATHS:
    files = path.rglob("*") if path.is_dir() else [path]
    for file in files:
        if file.is_dir():
            continue
        text = file.read_text()
        for pattern, msg in patterns:
            if pattern.search(text):
                failures.append(f"{file}: {msg}")

if failures:
    print("\n".join(failures))
    sys.exit(1)

print("All version pins look good.")
