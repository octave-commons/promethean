#!/usr/bin/env python3
"""Update task files with status hashtags from the kanban board (Obsidian-friendly)."""

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
BOARDS_DIR = BOARD_PATH.parent
# Optional: set to your real template file if you want to copy it
TASK_TEMPLATE = Path("docs/agile/templates/task.stub.template.md")

MD_LINK = re.compile(r"\[.+?\]\(([^)#]+\.md)(?:#[^)]+)?\)")
WIKI_LINK = re.compile(r"\[\[([^\]|#]+)(?:#[^\]]+)?\]\]")


def _status_tag_from_header(header: str) -> str | None:
    header = re.sub(r"\s*\(.*\)$", "", header).strip()
    tag = f"#{header.lower().replace(' ', '-')}"
    return tag if tag in STATUS_SET else None


def _normalize_to_task_path(raw: str, board_file: Path) -> Path:
    """
    Turn any board link target into a path under TASK_DIR when appropriate.
    Handles:
      - URL encoding
      - Relative paths
      - Links that (incorrectly) point to /boards/ — remap to /tasks/
      - Wikilinks without folders
    """
    raw = unquote(raw.strip())
    cand = (board_file.parent / raw).resolve()

    # If link has no folder (wikilink or md link like "(Thing.md)"), use TASK_DIR
    if "/" not in raw and "\\" not in raw:
        return (TASK_DIR / Path(raw).name).resolve()

    # If the resolved candidate is inside boards, remap to tasks with same basename
    try:
        cand.relative_to(BOARDS_DIR)
        return (TASK_DIR / cand.name).resolve()
    except ValueError:
        pass

    # If the resolved path is already inside tasks, keep it
    try:
        cand.relative_to(TASK_DIR)
        return cand
    except ValueError:
        pass

    # Anything else: prefer TASK_DIR with same basename
    return (TASK_DIR / cand.name).resolve()


def parse_board(path: Path = BOARD_PATH) -> dict[Path, str]:
    """Return mapping of task file paths to status hashtags."""
    mapping: dict[Path, str] = {}
    status: str | None = None

    text = path.read_text(encoding="utf-8")

    for line in text.splitlines():
        if line.startswith("## "):
            status = _status_tag_from_header(line[3:])
            continue

        if not status:
            continue

        if not line.lstrip().startswith("- ["):
            continue

        # Try markdown link first
        m = MD_LINK.search(line)
        if m:
            task_path = _normalize_to_task_path(m.group(1), path)
            mapping[task_path] = status
            continue

        # Try wikilink
        w = WIKI_LINK.search(line)
        if w:
            name = w.group(1)
            if not name.endswith(".md"):
                name += ".md"
            task_path = _normalize_to_task_path(name, path)
            mapping[task_path] = status

    return mapping


def _remove_status_tokens(tokens: list[str]) -> list[str]:
    """Return tokens with any status hashtags removed."""
    return [tok for tok in tokens if tok not in STATUS_SET]


def _ensure_task_file(path: Path, status: str) -> None:
    """Create a new task file if missing (minimal stub or from template)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    title = path.stem
    if TASK_TEMPLATE.exists():
        # TODO: If you want template copy behavior, uncomment these lines
        # tpl = TASK_TEMPLATE.read_text(encoding="utf-8")
        # tpl = tpl.replace("{{TITLE}}", title).replace("{{STATUS}}", status)
        # path.write_text(tpl, encoding="utf-8")
        # return
        pass
    # Minimal default
    path.write_text(f"# {title}\n\n{status}\n", encoding="utf-8")


def set_status(path: Path, status: str) -> None:
    """Update (or create) a task file with the given status hashtag."""
    if not path.exists():
        _ensure_task_file(path, status)

    text = path.read_text(encoding="utf-8")
    ends_with_newline = text.endswith("\n")
    lines = text.splitlines()

    status_idx: int | None = None
    for i in range(len(lines) - 1, -1, -1):
        tokens = lines[i].split()
        if any(tok in STATUS_SET for tok in tokens):
            status_idx = i
            lines[i] = " ".join(_remove_status_tokens(tokens)).rstrip()
            break

    if status_idx is None:
        # Append a status line
        if lines and lines[-1].strip() == "":
            # Replace trailing blank with status to avoid extra whitespace bloat
            lines[-1] = status
        else:
            lines.append(status)
    else:
        prefix = lines[status_idx].strip()
        lines[status_idx] = f"{prefix} {status}".strip()

    out = "\n".join(lines)
    if ends_with_newline or status_idx is None:
        out += "\n"
    path.write_text(out, encoding="utf-8")


def update_tasks(board: Path = BOARD_PATH) -> None:
    mapping = parse_board(board)
    for file, status in mapping.items():
        set_status(file, status)


def main() -> None:
    update_tasks()


if __name__ == "__main__":
    main()
