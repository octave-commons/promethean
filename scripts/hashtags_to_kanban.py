#!/usr/bin/env python3
"""Generate a Kanban board from task status hashtags."""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

try:  # pragma: no cover - fallback for direct execution
    from .agile_statuses import STATUS_ORDER, STATUS_SET
except ImportError:  # pragma: no cover
    from agile_statuses import STATUS_ORDER, STATUS_SET

TASK_DIR = Path("docs/agile/tasks")

TITLE_RE = re.compile(r"^##\s+🛠️\s+Task:\s*(.+)")
HASHTAG_RE = re.compile(r"#([A-Za-z0-9_-]+)")


def parse_task(path: Path) -> tuple[str, str]:
    """Return task title and status hashtag from a markdown file."""
    title = path.stem.replace("_", " ")
    status = "#todo"
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            if m := TITLE_RE.match(line):
                title = m.group(1).strip()
            for tag in HASHTAG_RE.findall(line):
                tag = f"#{tag}"
                if tag in STATUS_SET:
                    status = tag
    return title, status


def collect_tasks(directory: Path = TASK_DIR):
    tasks: dict[str, list[tuple[str, Path]]] = defaultdict(list)
    for file in directory.glob("*.md"):
        title, status = parse_task(file)
        tasks[status].append((title, file))
    return tasks


def build_board(tasks: dict[str, list[tuple[str, Path]]]) -> str:
    lines = ["---", "", "kanban-plugin: board", "", "---", ""]
    for status in STATUS_ORDER:
        items = tasks.get(status)
        if not items:
            continue
        header = status.lstrip("#").replace("-", " ").title()
        lines.append(f"## {header}")
        lines.append("")
        for title, path in sorted(items):
            rel = (Path("../tasks") / path.name).as_posix()
            lines.append(f"- [ ] [{title}]({rel}) {status}")
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    board = build_board(collect_tasks())
    print(board)


if __name__ == "__main__":
    main()
