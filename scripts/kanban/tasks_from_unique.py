#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
"""Generate task stubs from TODO items in docs/unique."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Iterable, Tuple

UNIQUE_DIR = Path("docs/unique")
TASKS_DIR = Path("docs/agile/tasks")

PATTERN = re.compile(r"^[*-]\s\[ \]\s*(.+)")


def slugify(text: str) -> str:
    """Create a filesystem-friendly slug from text."""
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text[:50] or "task"


def extract_tasks() -> Iterable[Tuple[str, Path]]:
    """Yield (task_title, source_path) for each TODO line."""
    for path in UNIQUE_DIR.rglob("*.md"):
        for line in path.read_text(encoding="utf-8").splitlines():
            m = PATTERN.match(line)
            if m:
                yield m.group(1).strip(), path


def task_stub(title: str, source: Path) -> str:
    rel = Path("../unique") / source.name
    return (
        f"## 🛠️ Task: {title}\n\n"
        f"Generated from [{rel}]({rel})\n\n"
        "---\n\n"
        "## 🎯 Goals\n"
        "- [ ] TODO\n\n"
        "---\n\n"
        "## 📦 Requirements\n"
        "- [ ] TODO\n\n"
        "---\n\n"
        "## 📋 Subtasks\n"
        "- [ ] TODO\n\n"
        "---\n\n"
        "#Todo\n"
    )


def main() -> None:
    TASKS_DIR.mkdir(parents=True, exist_ok=True)
    for title, source in extract_tasks():
        slug = slugify(title)
        path = TASKS_DIR / f"{slug}.md"
        if path.exists():
            continue
        path.write_text(task_stub(title, source), encoding="utf-8")


if __name__ == "__main__":
    main()
