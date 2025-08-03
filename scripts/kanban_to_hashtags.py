#!/usr/bin/env python3
"""Update task files with status hashtags from the kanban board."""

from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote

try:  # pragma: no cover - fallback for direct execution
    from .agile_statuses import STATUS_ORDER, STATUS_SET
except ImportError:  # pragma: no cover
    from agile_statuses import STATUS_ORDER, STATUS_SET

BOARD_PATH = Path("docs/agile/boards/kanban.md")
TASK_DIR = Path("docs/agile/tasks")


def parse_board(path: Path = BOARD_PATH) -> dict[Path, str]:
    """Return mapping of task file paths to status hashtags."""
    mapping: dict[Path, str] = {}
    status: str | None = None
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("## "):
                header = line[3:].strip()
                header = re.sub(r"\s*\(.*\)$", "", header)
                tag = f"#{header.lower().replace(' ', '-')}"
                status = tag if tag in STATUS_SET else None
                continue
            if status and line.lstrip().startswith("- ["):
                m = re.search(r"\(([^)]+\.md)\)", line)
                if not m:
                    continue
                rel = unquote(m.group(1))
                task_path = (path.parent / rel).resolve()
                mapping[task_path] = status
    return mapping


def _remove_status_tokens(line: str) -> str:
    tokens = [tok for tok in line.split() if tok not in STATUS_SET]
    return " ".join(tokens)


def set_status(path: Path, status: str) -> None:
    """Update a task file with the given status hashtag."""
    if not path.exists():
        return
    lines = [
        _remove_status_tokens(line.rstrip())
        for line in path.read_text(encoding="utf-8").splitlines()
    ]
    while lines and lines[-1] == "":
        lines.pop()
    lines.append(status)
    lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def update_tasks(board: Path = BOARD_PATH) -> None:
    for file, status in parse_board(board).items():
        set_status(file, status)


def main() -> None:
    update_tasks()


if __name__ == "__main__":
    main()
