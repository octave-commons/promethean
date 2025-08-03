"""Reusable helpers for converting between task files and kanban boards."""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote
from typing import Dict, List, Tuple

# Default locations for tasks and the kanban board
TASK_DIR = Path("docs/agile/tasks")
BOARD_PATH = Path("docs/agile/boards/kanban.md")

# Ordered list of recognized status hashtags
STATUS_ORDER = [
    "#ice-box",
    "#incoming",
    "#rejected",
    "#accepted",
    "#prompt-refinement",
    "#agent-thinking",
    "#breakdown",
    "#blocked",
    "#ready",
    "#todo",
    "#in-progress",
    "#in-review",
    "#done",
]
STATUS_SET = set(STATUS_ORDER)

# Regular expressions used by both conversions
TITLE_RE = re.compile(r"^##\s+🛠️\s+Task:\s*(.+)")
HASHTAG_RE = re.compile(r"#([A-Za-z0-9_-]+)")
TASK_PATTERN = re.compile(r"^- \[ \] (.+)")


# ---------------------------------------------------------------------------
# Task -> Kanban
# ---------------------------------------------------------------------------


def parse_task(path: Path) -> Tuple[str, str]:
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


def collect_tasks(directory: Path = TASK_DIR) -> Dict[str, List[Tuple[str, Path]]]:
    """Collect all markdown task files grouped by status."""
    tasks: Dict[str, List[Tuple[str, Path]]] = defaultdict(list)
    for file in directory.glob("*.md"):
        title, status = parse_task(file)
        tasks[status].append((title, file))
    return tasks


def build_board(tasks: Dict[str, List[Tuple[str, Path]]]) -> str:
    """Build kanban board markdown from collected tasks."""
    lines = ["---", "", "kanban-plugin: board", "", "---", ""]
    for status in STATUS_ORDER:
        items = tasks.get(status)
        if not items:
            continue
        header = status.lstrip("#").replace("-", " ").title()
        lines.append(f"## {header}")
        lines.append("")
        for title, path in sorted(items):
            rel = Path("../tasks") / path.name
            lines.append(f"- [ ] [{title}]({rel}) {status}")
        lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Kanban -> Task
# ---------------------------------------------------------------------------


def parse_board(path: Path = BOARD_PATH) -> Dict[Path, str]:
    """Return mapping of task file paths to status hashtags."""
    mapping: Dict[Path, str] = {}
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
    """Remove any known status hashtags from a line."""
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
    """Update all task files to match statuses from the kanban board."""
    for file, status in parse_board(board).items():
        set_status(file, status)
