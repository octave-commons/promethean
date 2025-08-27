#!/usr/bin/env python3
"""Generate a Kanban board from task status hashtags (dedupe + preserve unlinked + keep settings).

Features:
- De-duplicates Obsidian copy files (" 1.md", "_2.md", etc.) by logical slug
- Preserves unlinked items from the current board (e.g., Incoming brain-dumps)
- Preserves (or injects) the kanban:settings block at the bottom
- Supports wikilinks (best for Obsidian) or Markdown links (optionally URL-encoded)
- Atomic writes with --write so the board isn't truncated before reading
"""

from __future__ import annotations

import argparse
import os
import re
import tempfile
import unicodedata
import urllib.parse
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

try:  # pragma: no cover - fallback for direct execution
    from .agile_statuses import STATUS_ORDER, STATUS_SET
except ImportError:  # pragma: no cover
    from agile_statuses import STATUS_ORDER, STATUS_SET

TASK_DIR = Path("docs/agile/tasks")
BOARD_PATH = Path("docs/agile/boards/kanban.md")

TITLE_RE = re.compile(r"^##\s+🛠️\s+Task:\s*(.+)")
HASHTAG_RE = re.compile(r"#([A-Za-z0-9_-]+)")
COPY_SUFFIX_RE = re.compile(r"(?i)[ _-](\d+)$")  # " 1", "_2", "-3" at end

MD_LINK = re.compile(r"\[.+?\]\(([^)#]+)(?:#[^)]+)?\)")
WIKI_LINK = re.compile(r"\[\[([^\]|#]+)(?:#[^\]]+)?\]\]")

DEFAULT_KANBAN_SETTINGS_BLOCK = """%% kanban:settings
```
{"kanban-plugin":"board","list-collapse":[false,false,true,false,false,false,false,false,false,false,false,false,false,false],"new-note-template":"docs/agile/templates/task.stub.template.md","new-note-folder":"docs/agile/tasks","metadata-keys":[{"metadataKey":"tags","label":"","shouldHideLabel":false,"containsMarkdown":false},{"metadataKey":"hashtags","label":"","shouldHideLabel":false,"containsMarkdown":false}]}
```
%%
"""


def extract_header_labels(board_path: Path = BOARD_PATH) -> Dict[str, str]:
    """
    Preserve the exact header text per status from the current board (e.g., 'Prompt Refinement (3)').
    Returns dict[status_tag] -> header_label (without leading '## ').
    """
    labels: Dict[str, str] = {}
    if not board_path.exists():
        return labels
    with board_path.open(encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if not line.startswith("## "):
                continue
            hdr = line[3:].strip()
            st = _status_tag_from_header(hdr)
            if st:
                # Keep the header exactly as written (emoji, spacing, '(N)', etc.)
                labels[st] = hdr
    return labels


def parse_task(path: Path) -> Tuple[str, str]:
    """Return task title and status hashtag from a markdown file."""
    title = path.stem.replace("_", " ")
    status = "#todo"
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            m = TITLE_RE.match(line)
            if m:
                title = m.group(1).strip()
            for tag in HASHTAG_RE.findall(line):
                tag = f"#{tag}"
                if tag in STATUS_SET:
                    status = tag
    return title, status


def _slugify(s: str) -> str:
    s = unicodedata.normalize("NFKC", s).strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    s = COPY_SUFFIX_RE.sub("", s).strip("-")
    return s


def _is_copy_suffix(name: str) -> bool:
    stem = Path(name).stem
    return bool(COPY_SUFFIX_RE.search(stem))


def collect_tasks(directory: Path = TASK_DIR) -> Dict[str, List[Tuple[str, Path]]]:
    """
    Return dict[status] -> list[(title, path)] with duplicates merged by slug.
    Duplicate policy:
      1) prefer file without copy suffix
      2) else newer mtime
      3) else larger size
    """
    by_slug: Dict[str, List[Tuple[str, str, Path]]] = defaultdict(list)
    for file in directory.glob("*.md"):
        title, status = parse_task(file)
        slug = _slugify(title or file.stem)
        by_slug[slug].append((title, status, file))

    winners: List[Tuple[str, str, Path]] = []
    for slug, items in by_slug.items():
        if len(items) == 1:
            winners.append(items[0])
            continue

        def score(it: Tuple[str, str, Path]):
            _title, _status, path = it
            st = path.stat()
            return (1 if not _is_copy_suffix(path.name) else 0, st.st_mtime, st.st_size)

        best = max(items, key=score)
        winners.append(best)

    tasks: Dict[str, List[Tuple[str, Path]]] = defaultdict(list)
    for title, status, path in winners:
        tasks[status].append((title, path))
    return tasks


def _status_tag_from_header(header: str) -> str | None:
    header = re.sub(r"\s*\(.*\)$", "", header).strip().lower()
    tag = f"#{header.replace(' ', '-')}"
    return tag if tag in STATUS_SET else None


def extract_settings_block(board_path: Path) -> str | None:
    """Return the exact kanban settings block text if present, else None."""
    if not board_path.exists():
        return None
    text = board_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    start_idx = None
    end_idx = None
    for i, line in enumerate(lines):
        if line.strip().lower().startswith("%%") and "kanban:settings" in line.lower():
            start_idx = i
    if start_idx is None:
        return None
    for j in range(start_idx + 1, len(lines)):
        if lines[j].strip() == "%%":
            end_idx = j
            break
    if end_idx is None:
        return "\n".join(lines[start_idx:]) + ("\n" if text.endswith("\n") else "")
    return "\n".join(lines[start_idx : end_idx + 1]) + "\n"


def parse_unlinked_from_board(board_path: Path = BOARD_PATH) -> Dict[str, List[str]]:
    """
    Scrape the existing board and collect bullet items without links under
    known status headers. Returns dict[status_tag] -> list[plain_title].
    """
    out: Dict[str, List[str]] = defaultdict(list)
    if not board_path.exists():
        return out

    current_status: str | None = None
    with board_path.open(encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")

            if line.startswith("## "):
                st = _status_tag_from_header(line[3:])
                current_status = st
                continue

            if not current_status:
                continue

            stripped = line.lstrip()
            if not stripped.startswith("- ["):
                continue

            # Skip items that already contain a link (markdown or wikilink)
            if MD_LINK.search(stripped) or WIKI_LINK.search(stripped):
                continue

            # Match checkbox bullets like "- [ ] Title" or "- [x] Title"
            m = re.match(r"- \[\s*[xX]?\s*\]\s+(.*)", stripped)
            if not m:
                continue
            text = m.group(1).strip()
            text = re.sub(
                r"\s+#[-a-z0-9_]+(?:\s+#[-a-z0-9_]+)*\s*$", "", text, flags=re.I
            )
            if text:
                out[current_status].append(text)

    return out


def encode_path(file_path: str, *, encode: bool) -> str:
    """Return a link target appropriate for Obsidian or GitHub."""
    return urllib.parse.quote(file_path) if encode else file_path


def build_board(
    tasks: Dict[str, List[Tuple[str, Path]]],
    unlinked: Dict[str, List[str]] | None = None,
    settings_block: str | None = None,
    header_labels: Dict[str, str] | None = None,
    *,
    wikilinks: bool = False,
    encode_urls: bool = False,
) -> str:
    """
    Render board. For each status column:
      1) Linked tasks
      2) Unlinked bullets (preserved from current board if not linked)
    Then append kanban settings block (existing or default).
    """
    if unlinked is None:
        unlinked = {}
    if header_labels is None:
        header_labels = {}

    linked_slugs_per_status: Dict[str, set[str]] = {
        status: {_slugify(title) for title, _ in items}
        for status, items in tasks.items()
    }

    lines: List[str] = ["---", "", "kanban-plugin: board", "", "---", ""]
    for status in STATUS_ORDER:
        linked_items = tasks.get(status, [])
        unlinked_items = unlinked.get(status, [])

        if not linked_items and not unlinked_items:
            continue

        # Prefer the exact header from the existing board (preserves WIP limits like '(3)'),
        # otherwise fall back to a normalized title.
        header = header_labels.get(status, status.lstrip("#").replace("-", " ").title())
        lines.append(f"## {header}")
        lines.append("")

        # Linked first
        for title, path in sorted(linked_items):
            if wikilinks:
                lines.append(f"- [ ] [[{path.name}|{title}]] {status}")
            else:
                rel = (Path("../tasks") / path.name).as_posix()
                href = encode_path(rel, encode=encode_urls)
                lines.append(f"- [ ] [{title}]({href}) {status}")

        # Unlinked preserved (hide if linked twin exists)
        seen_slugs = linked_slugs_per_status.get(status, set())
        for title in unlinked_items:
            if _slugify(title) in seen_slugs:
                continue
            lines.append(f"- [ ] {title} {status}")
        lines.append("")

    block = settings_block or DEFAULT_KANBAN_SETTINGS_BLOCK
    lines.append(block.rstrip("\n"))

    return "\n".join(lines) + "\n"


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Generate kanban board from task status hashtags."
    )
    ap.add_argument(
        "--tasks", type=Path, default=TASK_DIR, help="Directory containing task files"
    )
    ap.add_argument(
        "--board", type=Path, default=BOARD_PATH, help="Output kanban board path"
    )
    ap.add_argument("--write", action="store_true", help="Write changes to board")
    ap.add_argument(
        "--wikilinks", action="store_true", help="Use wikilinks instead of markdown"
    )
    ap.add_argument(
        "--encode-urls", action="store_true", help="URL-encode markdown links"
    )
    args = ap.parse_args()

    tasks = collect_tasks(args.tasks)
    unlinked = parse_unlinked_from_board(args.board)
    header_labels = extract_header_labels(args.board)
    settings_block = extract_settings_block(args.board)

    board_text = build_board(
        tasks,
        unlinked,
        settings_block=settings_block,
        header_labels=header_labels,
        wikilinks=args.wikilinks,
        encode_urls=args.encode_urls,
    )

    if args.write:
        args.board.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", delete=False, dir=args.board.parent
        ) as tmp:
            tmp.write(board_text)
            tmp_name = tmp.name
        os.replace(tmp_name, args.board)
    else:
        print(board_text, end="")


if __name__ == "__main__":
    main()
