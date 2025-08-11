#!/usr/bin/env python3
"""
Sync status hashtags between the kanban board and task files.

What this does
--------------
- Reads the board (docs/agile/boards/kanban.md)
- For each column header (e.g., "## Ice Box"), computes a status hashtag by
  lowercasing and replacing spaces with dashes → "#ice-box".
- Ensures EVERY task bullet under that header ends with that status hashtag.
  (It removes any *other* status from STATUS_SET found on that bullet.)
- For linked tasks, opens the target task file in docs/agile/tasks/ and ensures
  the same status hashtag is present in the file (removing other statuses from STATUS_SET).
- Works with Markdown links and Obsidian wikilinks; tolerates links without .md
- Ignores external http(s) links
- Preserves non-status tags (e.g., #framework-core) — only swaps STATUS_SET tags
- Writes the board back atomically (by default), preserving the rest of the content

Usage
-----
# preview only
python scripts/sync_status_hashtags.py

# write changes (board + tasks)
python scripts/sync_status_hashtags.py --write

# limit to board rewrite only (don’t touch tasks)
python scripts/sync_status_hashtags.py --write --no-update-tasks
"""
from __future__ import annotations

import argparse
import os
import re
import tempfile
from pathlib import Path
from urllib.parse import unquote

try:  # pragma: no cover - fallback for direct execution
    from .agile_statuses import STATUS_ORDER, STATUS_SET
except ImportError:  # pragma: no cover
    from agile_statuses import STATUS_ORDER, STATUS_SET

BOARD_PATH = Path("docs/agile/boards/kanban.md")
TASK_DIR = Path("docs/agile/tasks")
BOARDS_DIR = BOARD_PATH.parent

MD_LINK = re.compile(
    r"\[.+?\]\(([^)#\s]+)(?:#[^)]+)?\)"
)  # markdown link target (no image)
WIKI_LINK = re.compile(
    r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]"
)  # [[Page|alias]] or [[Page#Frag]]
CHECKBOX_LINE = re.compile(r"^\s*- \[[ xX]\]")


def header_to_status(header: str) -> str:
    """Normalize a header like "Ice Box" -> "#ice-box" (lowercase, dashes)."""
    # strip trailing parenthetical (e.g., "(N items)") and surrounding ws
    header = re.sub(r"\s*\(.*\)$", "", header).strip()
    # remove leading emojis/symbols
    header = re.sub(r"^[^A-Za-z0-9]+", "", header)
    # normalize spaces → dashes, lowercase
    norm = re.sub(r"\s+", "-", header).lower()
    return f"#{norm}" if norm else ""


def _normalize_to_task_path(raw: str, board_file: Path) -> Path:
    raw = unquote(raw.strip())
    # If it looks external, bail
    if "://" in raw:
        return Path("__external__")  # sentinel

    # Ensure a filename has .md
    name = Path(raw).name
    if not name.lower().endswith(".md"):
        # For bare names, append .md; for paths, keep structure
        if ("/" not in raw) and ("\\" not in raw):
            raw = name + ".md"
        else:
            raw = str(Path(raw).with_suffix(".md"))

    # For bare names, assume TASK_DIR
    if ("/" not in raw) and ("\\" not in raw):
        return (TASK_DIR / Path(raw).name).resolve()

    cand = (board_file.parent / raw).resolve()

    # Remap boards → tasks
    try:
        cand.relative_to(BOARDS_DIR)
        return (TASK_DIR / cand.name).resolve()
    except ValueError:
        pass

    # Already in tasks?
    try:
        cand.relative_to(TASK_DIR)
        return cand
    except ValueError:
        pass

    # Default: tasks/<basename>
    return (TASK_DIR / cand.name).resolve()


def _remove_status_tokens(tokens: list[str]) -> list[str]:
    return [tok for tok in tokens if tok not in STATUS_SET]


def ensure_line_status(line: str, status: str) -> str:
    """Ensure a board bullet line ends with the given status, removing other STATUS_SET tags."""
    tokens = line.rstrip().split()
    tokens = _remove_status_tokens(tokens)
    if tokens and tokens[-1] == status:
        return line  # already correct
    # append with a single space separator
    core = " ".join(tokens)
    return f"{core} {status}"


def set_task_file_status(path: Path, status: str) -> None:
    """Ensure task file contains the given status and no other STATUS_SET tags."""
    if path.name == "__external__":
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    text = path.read_text(encoding="utf-8") if path.exists() else ""
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
        if lines and lines[-1].strip() == "":
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


def sync_board_and_tasks(board_path: Path, *, write: bool, update_tasks: bool) -> bool:
    """Return True if changes were made to the board."""
    text = board_path.read_text(encoding="utf-8")
    lines = text.splitlines()

    current_status = None
    changed = False

    for idx, line in enumerate(lines):
        if line.startswith("## "):
            current_status = header_to_status(line[3:])
            continue

        if current_status and CHECKBOX_LINE.match(line.lstrip()):
            # Adjust the board line's trailing status
            new_line = ensure_line_status(line, current_status)
            if new_line != line:
                lines[idx] = new_line
                changed = True

            if update_tasks:
                # Link extraction for task path
                linked = line
                m = MD_LINK.search(linked)
                if m:
                    task_path = _normalize_to_task_path(m.group(1), board_path)
                    if task_path.name != "__external__":
                        set_task_file_status(task_path, current_status)
                    continue
                w = WIKI_LINK.search(linked)
                if w:
                    name = w.group(1).strip()
                    if not name.lower().endswith(".md"):
                        name += ".md"
                    task_path = _normalize_to_task_path(name, board_path)
                    if task_path.name != "__external__":
                        set_task_file_status(task_path, current_status)

    if write and changed:
        # Atomic write
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", delete=False, dir=board_path.parent
        ) as tmp:
            tmp.write("\n".join(lines) + ("\n" if text.endswith("\n") else ""))
            tmp_name = tmp.name
        os.replace(tmp_name, board_path)

    return changed


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Sync status hashtags between kanban board and task files."
    )
    ap.add_argument(
        "--board", type=Path, default=BOARD_PATH, help="Path to kanban board markdown"
    )
    ap.add_argument(
        "--write", action="store_true", help="Write changes to board and tasks"
    )
    ap.add_argument(
        "--no-update-tasks",
        dest="update_tasks",
        action="store_false",
        help="Do not touch task files",
    )
    args = ap.parse_args()

    changed = sync_board_and_tasks(
        args.board, write=args.write, update_tasks=args.update_tasks
    )

    if changed:
        print("Board updated" if args.write else "(dry-run) Board would be updated")
    else:
        print("No board changes needed")


if __name__ == "__main__":
    main()
